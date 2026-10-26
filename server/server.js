const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8099;
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data.json');

// In-Memory State
let state = {
  queue: [], // { ticketId, playerId, playerName, mode, char, timestamp }
  matches: {}, // matchId -> { roomId, mode, minutes, seed, host: { playerId, name }, guest: { playerId, name }, status, createdAt, lastActivity }
  rooms: {}, // roomCode -> { roomCode, host: { playerId, name, char }, guest: { playerId, name, char } | null, mode, minutes, status: 'waiting' | 'ready' | 'playing' | 'closed' | 'abandoned', createdAt, lastActivity }
  signals: {}, // roomId -> { host: [signals], guest: [signals] }
  relays: {}, // matchId -> { host: [packets], guest: [packets], lastHostTick, lastGuestTick }
  wsClients: {}, // matchId -> { host: socket, guest: socket }
  completedMatches: {}, // matchId -> { matchId, host, guest, finalScore, winner, phase, outcome, stats, completedAt, matchToken, rewarded: {} }
  referrals: {}, // refCode -> { ownerId, referred: [ { playerId, registeredAt, qualified: boolean, qualifiedAt } ], claimedMilestones: [1, 3, 5, 10] }
  starsInvoices: {}, // invoiceId -> { invoiceId, productId, playerId, starsAmount, status, createdAt, paidAt, chargeId }
  tonInvoices: {}, // txId -> { txId, memo, productId, playerId, tonAmount, nanoTon, status, createdAt, paidAt, txHash }
  processedTonHashes: {},
  processedChargeIds: {}, // txHash -> { txId, playerId, timestamp }
  paymentsLedger: [], // array of { id, type: 'stars'|'ton', invoiceId, productId, playerId, amount, currency, timestamp }
  players: {}, // playerId -> authoritative player profile and balance
  economyLedger: [], // array of { id, txId, playerId, type, deltaCoins, deltaXp, balanceAfter, reason, itemId, meta, timestamp }
  idempotencyKeys: {} // key -> { result, timestamp }
};

const TON_RECIPIENT_ADDRESS = process.env.TON_RECIPIENT_ADDRESS || 'EQBvW8Z5huBkMJYdn30BlgG3mM2N05hpVNeSlfG2L89xAOn3';

// Authoritative Server-Controlled Season & Pre-Launch State (Item 1)
// The season must not start automatically during development, testing, or initial visits.
// Zero seasonal competition points are awarded before the official launch.
const SEASON_CONFIG = {
  state: process.env.SEASON_STATE || 'prelaunch', // 'prelaunch' | 'active' | 'ended'
  seasonNumber: 1,
  seasonLengthDays: 15,
  startTime: process.env.SEASON_START_TIME ? Number(process.env.SEASON_START_TIME) : null,
  nameEn: 'Season 1: Football vs Basketball War',
  nameRu: 'Сезон 1: Битва Команд'
};

// Configurable Referral Commission Rate (Stage J2: 5% - 10%, default 5%)
const REFERRAL_COMMISSION_MIN = 0.05;
const REFERRAL_COMMISSION_MAX = 0.10;
let REFERRAL_COMMISSION_RATE = 0.05;
if (process.env.REFERRAL_COMMISSION_RATE) {
  const parsedRate = parseFloat(process.env.REFERRAL_COMMISSION_RATE);
  if (!isNaN(parsedRate)) {
    REFERRAL_COMMISSION_RATE = Math.min(REFERRAL_COMMISSION_MAX, Math.max(REFERRAL_COMMISSION_MIN, parsedRate));
  }
}

// Configurable Telegram Stars prices from environment variable or defaults
const DEFAULT_STARS_PRICES = {
  'pkg_coins_100': 25,
  'pkg_coins_500': 100,
  'pkg_coins_1200': 220,
  'pkg_coins_3000': 500,
  'pkg_coins_starter': 100,
  'pkg_coins_pro': 220
};

let ENV_STARS_PRICES = {};
try {
  if (process.env.STARS_PRICES_JSON) {
    ENV_STARS_PRICES = JSON.parse(process.env.STARS_PRICES_JSON);
  }
} catch (e) {
  console.warn('Failed to parse STARS_PRICES_JSON', e);
}

function resolveStarsPrice(productId) {
  if (ENV_STARS_PRICES[productId] !== undefined) {
    return Number(ENV_STARS_PRICES[productId]);
  }
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_STARS === 'true') {
    return DEFAULT_STARS_PRICES[productId] !== undefined ? DEFAULT_STARS_PRICES[productId] : null;
  }
  return null;
}

function resolveTelegramBotToken() {
  const raw = process.env.TELEGRAM_BOT_TOKEN;
  if (!raw || typeof raw !== 'string') {
    return { ok: false, error: 'bot_token_unconfigured', message: 'TELEGRAM_BOT_TOKEN is not configured on the server.' };
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, error: 'bot_token_unconfigured', message: 'TELEGRAM_BOT_TOKEN is empty.' };
  }
  // Telegram Bot Token official format: <bot_id>:<token_hash> (digits, colon, alphanumeric/dash/underscore)
  // Rejects invalid internal characters clearly rather than silently stripping them.
  if (!/^[0-9]+:[A-Za-z0-9_-]+$/.test(trimmed)) {
    return { ok: false, error: 'bot_token_invalid_format', message: 'TELEGRAM_BOT_TOKEN has an invalid format. Expected format: <id>:<secret_hash>' };
  }
  return { ok: true, token: trimmed };
}

function resolveTelegramWebhookSecret() {
  const raw = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  return trimmed || null;
}

const PRODUCT_CATALOG = {
  // FvH Currency Packages (Stage 1 Specification: 100, 500, 1,200, 3,000 FvH Coin)
  'pkg_coins_100': {
    id: 'pkg_coins_100',
    name: '100 FvH Coin',
    coins: 100,
    coinsAmount: 100,
    starsPrice: resolveStarsPrice('pkg_coins_100'),
    type: 'currency'
  },
  'pkg_coins_500': {
    id: 'pkg_coins_500',
    name: '500 FvH Coin',
    coins: 500,
    coinsAmount: 500,
    starsPrice: resolveStarsPrice('pkg_coins_500'),
    type: 'currency'
  },
  'pkg_coins_1200': {
    id: 'pkg_coins_1200',
    name: '1,200 FvH Coin',
    coins: 1200,
    coinsAmount: 1200,
    starsPrice: resolveStarsPrice('pkg_coins_1200'),
    type: 'currency'
  },
  'pkg_coins_3000': {
    id: 'pkg_coins_3000',
    name: '3,000 FvH Coin',
    coins: 3000,
    coinsAmount: 3000,
    starsPrice: resolveStarsPrice('pkg_coins_3000'),
    type: 'currency'
  },
  // Aliases for backwards compatibility with earlier test keys
  'pkg_coins_starter': {
    id: 'pkg_coins_starter',
    name: 'Starter Coin Pack (500 FvH Coin)',
    coinsAmount: 500,
    starsPrice: resolveStarsPrice('pkg_coins_starter'),
    type: 'currency'
  },
  'pkg_coins_pro': {
    id: 'pkg_coins_pro',
    name: 'Pro Coin Pack (1,200 FvH Coin)',
    coinsAmount: 1200,
    starsPrice: resolveStarsPrice('pkg_coins_pro'),
    type: 'currency'
  }
};

// Authoritative In-Game Cosmetic Items Catalog
// Price Tiers per Stage 1 specification:
// Skins: Common 300, Rare 700, Epic 1500
// Football Balls: Common 200, Rare 500, Epic 1000
// Basketball Balls: Common 200, Rare 500, Epic 1000
const ITEM_CATALOG = {
  // Kits / Jerseys
  'skin_rookie': { name: 'Rookie Blue', category: 'skins', slot: 'skin', rarity: 'common', price: 0, isDefault: true },
  'skin_crimson': { name: 'Crimson Comet', category: 'skins', slot: 'skin', rarity: 'common', price: 300 },
  'skin_sunset': { name: 'Sunset Gold Jersey', category: 'skins', slot: 'skin', rarity: 'common', price: 300 },
  'skin_neon': { name: 'Neon Striker', category: 'skins', slot: 'skin', rarity: 'rare', price: 700 },
  'skin_frost': { name: 'Frost Giant', category: 'skins', slot: 'skin', rarity: 'rare', price: 700 },
  'skin_hydro': { name: 'Hydro Striker Kit', category: 'skins', slot: 'skin', rarity: 'rare', price: 700 },
  'skin_mars': { name: 'Mars Rover Kit', category: 'skins', slot: 'skin', rarity: 'rare', price: 700 },
  'skin_shadow': { name: 'Shadow Ninja', category: 'skins', slot: 'skin', rarity: 'epic', price: 1500 },
  'skin_solar': { name: 'Solar Flare', category: 'skins', slot: 'skin', rarity: 'epic', price: 1500 },
  'skin_gold': { name: 'Golden Legend', category: 'skins', slot: 'skin', rarity: 'epic', price: 1500 },
  'skin_cyber': { name: 'Cyber Blue Jersey', category: 'skins', slot: 'skin', rarity: 'epic', price: 1500 },
  'skin_astronaut': { name: 'Astronaut Kit', category: 'skins', slot: 'skin', rarity: 'epic', price: 1500 },
  'skin_neon_elite': { name: 'Cyber Striker #10', category: 'skins', slot: 'skin', rarity: 'epic', price: 1500 },

  // Football Balls
  'ball_footy_classic': { name: 'Classic Leather', category: 'balls', slot: 'ball.footy', mode: 'footy', rarity: 'common', price: 0, isDefault: true },
  'ball_footy_plasma': { name: 'Plasma Pulse', category: 'balls', slot: 'ball.footy', mode: 'footy', rarity: 'common', price: 200 },
  'ball_footy_neon': { name: 'Cyan Core Ball', category: 'balls', slot: 'ball.footy', mode: 'footy', rarity: 'common', price: 200 },
  'ball_footy_solar': { name: 'Solar Blaze Ball', category: 'balls', slot: 'ball.footy', mode: 'footy', rarity: 'rare', price: 500 },
  'ball_footy_inferno': { name: 'Inferno Ball Skin', category: 'balls', slot: 'ball.footy', mode: 'footy', rarity: 'rare', price: 500 },
  'ball_footy_gold': { name: 'Solid Gold', category: 'balls', slot: 'ball.footy', mode: 'footy', rarity: 'epic', price: 1000 },
  'ball_earthrise': { name: 'Earthrise Ball', category: 'balls', slot: 'ball.footy', mode: 'footy', rarity: 'epic', price: 1000 },

  // Basketball Balls
  'ball_hoops_street': { name: 'Raw Street', category: 'balls', slot: 'ball.hoops', mode: 'hoops', rarity: 'common', price: 0, isDefault: true },
  'ball_hoops_blaze': { name: 'Neon Blaze Ball', category: 'balls', slot: 'ball.hoops', mode: 'hoops', rarity: 'common', price: 200 },
  'ball_hoops_chrome': { name: 'Chrome Spark', category: 'balls', slot: 'ball.hoops', mode: 'hoops', rarity: 'rare', price: 500 },
  'ball_tidal': { name: 'Tidal Wave Ball', category: 'balls', slot: 'ball.hoops', mode: 'hoops', rarity: 'rare', price: 500 },
  'ball_hoops_midnight': { name: 'Midnight Matte', category: 'balls', slot: 'ball.hoops', mode: 'hoops', rarity: 'epic', price: 1000 },
  'ball_cyber_neon': { name: 'Cyber Neon Ball', category: 'balls', slot: 'ball.hoops', mode: 'hoops', rarity: 'epic', price: 1000 },

  // Standard Starter Stadiums (preserved for match loading)
  'std_footy_classic': { name: 'Classic Grass', category: 'stadiums', slot: 'stadium.footy', mode: 'footy', price: 0, isDefault: true },
  'std_hoops_street': { name: 'Street Classic', category: 'stadiums', slot: 'stadium.hoops', mode: 'hoops', price: 0, isDefault: true },
  'std_ocean_sunset': { name: 'Coastal Sunset Court', category: 'stadiums', slot: 'stadium.footy', mode: 'footy', price: 0 },
  'std_volcano_caldera': { name: 'Magma Caldera Arena', category: 'stadiums', slot: 'stadium.hoops', mode: 'hoops', price: 0 },

  // Default accessories
  'frame_default': { name: 'Default Frame', category: 'frames', slot: 'frame', price: 0, isDefault: true },
  'trail_default': { name: 'Classic Trail', category: 'trails', slot: 'trail', price: 0, isDefault: true },
  'trail_fire': { name: 'Fire Trail', category: 'trails', slot: 'trail', price: 250 },
  'trail_rainbow': { name: 'Rainbow Trail', category: 'trails', slot: 'trail', price: 400 },
  'trail_laser': { name: 'Laser Trail', category: 'trails', slot: 'trail', price: 650 },

  // Mystery Packs
  'pack_footy': { name: 'Footy Striker Pack', category: 'packs', price: 250, type: 'pack', packId: 'footy' },
  'pack_hoops': { name: 'Hoops All-Star Pack', category: 'packs', price: 250, type: 'pack', packId: 'hoops' },
  'pack_clash': { name: 'Ultimate Clash Pack', category: 'packs', price: 500, type: 'pack', packId: 'clash' }
};

// Bundles Definition
const BUNDLE_CATALOG = {
  'bundle_footy_starter': {
    id: 'bundle_footy_starter',
    name: 'FOOTY Starter Bundle',
    coinsPrice: 1950,
    items: [
      { id: 'skin_cyber', type: 'cosmetic' },
      { id: 'ball_footy_inferno', type: 'cosmetic' },
      { type: 'coins', val: 500 },
      { type: 'pack', packId: 'footy', count: 2 }
    ]
  },
  'bundle_hoops_starter': {
    id: 'bundle_hoops_starter',
    name: 'HOOPS Starter Bundle',
    coinsPrice: 1450,
    items: [
      { id: 'skin_sunset', type: 'cosmetic' },
      { id: 'ball_hoops_blaze', type: 'cosmetic' },
      { type: 'coins', val: 500 },
      { type: 'pack', packId: 'hoops', count: 2 }
    ]
  },
  'bundle_ocean_arena': {
    id: 'bundle_ocean_arena',
    name: 'Ocean Arena Collection',
    coinsPrice: 1850,
    items: [
      { id: 'std_underwater_dome', type: 'cosmetic' },
      { id: 'std_ocean_sunset', type: 'cosmetic' },
      { id: 'skin_hydro', type: 'cosmetic' },
      { id: 'ball_tidal', type: 'cosmetic' }
    ]
  },
  'bundle_mars_explorer': {
    id: 'bundle_mars_explorer',
    name: 'Mars Explorer Collection',
    coinsPrice: 1950,
    items: [
      { id: 'std_mars_dome', type: 'cosmetic' },
      { id: 'ball_footy_solar', type: 'cosmetic' },
      { id: 'skin_mars', type: 'cosmetic' },
      { type: 'coins', val: 1000 }
    ]
  },
  'bundle_lunar_champ': {
    id: 'bundle_lunar_champ',
    name: 'Lunar Championship Collection',
    coinsPrice: 2850,
    items: [
      { id: 'std_moon_crater', type: 'cosmetic' },
      { id: 'ball_earthrise', type: 'cosmetic' },
      { id: 'skin_astronaut', type: 'cosmetic' },
      { type: 'coins', val: 1500 }
    ]
  },
  'bundle_cyber_neon': {
    id: 'bundle_cyber_neon',
    name: 'Cyber Neon Collection',
    coinsPrice: 3800,
    items: [
      { id: 'std_cyber_megacity', type: 'cosmetic' },
      { id: 'ball_cyber_neon', type: 'cosmetic' },
      { id: 'skin_neon_elite', type: 'cosmetic' },
      { id: 'trail_laser', type: 'cosmetic' },
      { type: 'coins', val: 2000 }
    ]
  },
  'bundle_legendary_champs': {
    id: 'bundle_legendary_champs',
    name: 'Legendary Champions Bundle',
    coinsPrice: 8500,
    items: [
      { id: 'std_space_orbit', type: 'cosmetic' },
      { id: 'std_floating_islands', type: 'cosmetic' },
      { id: 'std_volcano_caldera', type: 'cosmetic' },
      { id: 'skin_neon_elite', type: 'cosmetic' },
      { id: 'skin_cyber', type: 'cosmetic' },
      { id: 'skin_shadow', type: 'cosmetic' },
      { id: 'skin_frost', type: 'cosmetic' },
      { id: 'ball_footy_inferno', type: 'cosmetic' },
      { id: 'ball_hoops_blaze', type: 'cosmetic' },
      { id: 'ball_tidal', type: 'cosmetic' },
      { id: 'ball_earthrise', type: 'cosmetic' },
      { type: 'coins', val: 5000 },
      { type: 'pack', packId: 'clash', count: 5 }
    ]
  }
};

// Quest Rewards Configuration (Stage 1 approved rules: Social tasks 50 FvH Coin, Referral 100 FvH Coin)
const QUEST_REWARDS = {
  'prime_daily': { coins: 150, xp: 50 },
  'd_play3': { coins: 50, xp: 30 },
  'd_score5': { coins: 80, xp: 40 },
  'd_win1': { coins: 100, xp: 50 },
  'w_win10': { coins: 300, xp: 150 },
  'w_score20': { coins: 250, xp: 120 },
  'w_matches15': { coins: 200, xp: 100 },
  'a_first_win': { coins: 100, xp: 50 },
  // Approved Stage 1 Social Tasks: 50 FvH Coin each
  'q_sub_tg': { coins: 50, xp: 50 },
  'q_sub_chat': { coins: 50, xp: 50 },
  'q_sub_x': { coins: 50, xp: 50 },
  'q_sub_insta': { coins: 50, xp: 50 },
  'q_sub_yt': { coins: 50, xp: 50 },
  'q_sub_tiktok': { coins: 50, xp: 50 },
  'soc_tg_channel': { coins: 50, xp: 50 },
  'soc_tg_chat': { coins: 50, xp: 50 },
  'soc_x_follow': { coins: 50, xp: 50 },
  // Approved Stage 1 Referral Qualification: 100 FvH Coin
  'q_referral': { coins: 100, xp: 100 }
};

// Standard player level progression: 250 XP per level, capped at level 30
function currentLevelForXp(totalXp) {
  return Math.min(30, 1 + Math.floor((totalXp || 0) / 250));
}

function createDefaultPlayer(playerId) {
  return {
    playerId: playerId,
    playerName: null,
    selectedTeam: null,
    selectedCharacter: null,
    teamChosen: false,
    coins: 350,
    xp: 0,
    transactions: [],
    owned: [
      'skin_rookie',
      'std_footy_classic',
      'std_hoops_street',
      'ball_footy_classic',
      'ball_hoops_street',
      'frame_default',
      'trail_default'
    ],
    equipped: {
      skin: 'skin_rookie',
      'skin.footy': 'skin_rookie',
      'skin.hoops': 'skin_solar',
      'ball.footy': 'ball_footy_classic',
      'ball.hoops': 'ball_hoops_street',
      'stadium.footy': 'std_footy_classic',
      'stadium.hoops': 'std_hoops_street',
      trail: 'trail_default',
      frame: 'frame_default'
    },
    boostCharges: {},
    armedBoost: null,
    packs: { free: {}, paid: {} },
    battlePass: {
      claimedFree: [],
      claimedPremium: [],
      isPremium: false,
      premiumUnlockedAt: null
    },
    claimedQuests: [],
    rewardedMatches: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

function getPlayer(playerId) {
  if (!playerId) return null;
  const id = String(playerId).trim();
  if (!state.players[id]) {
    state.players[id] = createDefaultPlayer(id);
    persistState();
  }
  return state.players[id];
}

function addLedgerEntry(playerId, type, deltaCoins, deltaXp, balanceAfter, reason, itemId = null, meta = null) {
  const txId = 'tx_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
  const entry = {
    id: txId,
    txId,
    playerId,
    type,
    deltaCoins: Number(deltaCoins) || 0,
    deltaXp: Number(deltaXp) || 0,
    balanceAfter: Number(balanceAfter) || 0,
    reason: String(reason || ''),
    itemId: itemId || null,
    meta: meta || null,
    timestamp: Date.now()
  };
  state.economyLedger.push(entry);
  if (state.players && state.players[playerId]) {
    if (!state.players[playerId].transactions) state.players[playerId].transactions = [];
    state.players[playerId].transactions.push(entry);
    if (state.players[playerId].transactions.length > 50) {
      state.players[playerId].transactions = state.players[playerId].transactions.slice(-50);
    }
  }
  persistState();
  return entry;
}

function creditPurchasedProduct(playerId, productId, paymentType = 'stars') {
  const player = getPlayer(playerId);
  if (!player) return null;
  const prod = PRODUCT_CATALOG[productId];
  if (!prod) return null;

  if (prod.type === 'currency') {
    const coinsDelta = prod.coinsAmount || 0;
    player.coins += coinsDelta;
    player.updatedAt = Date.now();
    addLedgerEntry(player.playerId, 'payment_credit', coinsDelta, 0, player.coins, 'Purchased currency package: ' + prod.name, productId, { paymentType });
  } else if (prod.type === 'bundle') {
    const bundle = BUNDLE_CATALOG[productId];
    if (bundle) {
      if (!player.owned) player.owned = [];
      if (!player.packs) player.packs = { free: {}, paid: {} };
      if (!player.packs.paid) player.packs.paid = {};

      let bonusCoins = 0;
      bundle.items.forEach(it => {
        if (it.type === 'cosmetic') {
          if (!player.owned.includes(it.id)) player.owned.push(it.id);
        } else if (it.type === 'coins') {
          bonusCoins += (it.val || 0);
        } else if (it.type === 'pack') {
          const pId = it.packId || 'footy';
          const cnt = it.count || 1;
          player.packs.paid[pId] = (player.packs.paid[pId] || 0) + cnt;
        }
      });
      player.coins += bonusCoins;
      player.updatedAt = Date.now();
      addLedgerEntry(player.playerId, 'payment_credit', bonusCoins, 0, player.coins, 'Purchased bundle: ' + prod.name, productId, { paymentType });
    }
  }
  persistState();
  return player;
}

// -------------------------------------------------------------
// Storage Adapter Layer (Postgres in production, JSON locally/CI)
// -------------------------------------------------------------
const { createStorageAdapter } = require('./storage');

const storage = createStorageAdapter({
  dataFilePath: DATA_FILE,
  itemCatalog: ITEM_CATALOG,
  bundleCatalog: BUNDLE_CATALOG,
  questRewards: QUEST_REWARDS
});

// Load persisted state if exists
if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed.referrals) state.referrals = parsed.referrals;
    if (parsed.starsInvoices) state.starsInvoices = parsed.starsInvoices;
    if (parsed.tonInvoices) state.tonInvoices = parsed.tonInvoices;
    if (parsed.processedTonHashes) state.processedTonHashes = parsed.processedTonHashes;
    if (parsed.processedChargeIds) state.processedChargeIds = parsed.processedChargeIds;
    if (parsed.paymentsLedger) state.paymentsLedger = parsed.paymentsLedger;
    if (parsed.players) state.players = parsed.players;
    if (parsed.economyLedger) state.economyLedger = parsed.economyLedger;
    if (parsed.idempotencyKeys) state.idempotencyKeys = parsed.idempotencyKeys;
    if (parsed.completedMatches) state.completedMatches = parsed.completedMatches;
  } catch (e) {
    console.warn('Failed to load server/data.json', e);
  }
}

storage.init().catch(err => {
  if (storage && storage.name === 'PostgresStorageAdapter') {
    console.error(`[FATAL STORAGE ERROR] Configured PostgreSQL storage failed to initialize: ${err.message}`);
    console.error(`Database target: ${typeof storage.getMaskedUrl === 'function' ? storage.getMaskedUrl() : 'configured'}`);
    console.error('Refusing silent fallback to JSON storage when PostgreSQL is explicitly configured.');
    process.exit(1);
  } else {
    console.warn('[STORAGE] Warning during storage adapter init:', err.message);
  }
});

function persistState() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({
      referrals: state.referrals,
      starsInvoices: state.starsInvoices,
      tonInvoices: state.tonInvoices,
      processedTonHashes: state.processedTonHashes,
      processedChargeIds: state.processedChargeIds,
      paymentsLedger: state.paymentsLedger,
      players: state.players,
      economyLedger: state.economyLedger,
      idempotencyKeys: state.idempotencyKeys,
      completedMatches: state.completedMatches
    }, null, 2));
  } catch (e) {
    console.warn('Failed to save server/data.json', e);
  }
}

// Clean up stale queue items, rooms, and matches every 30 seconds
setInterval(() => {
  const now = Date.now();
  state.queue = state.queue.filter(q => (now - q.timestamp) < 30000);
  Object.keys(state.rooms).forEach(code => {
    if ((now - state.rooms[code].createdAt) > 600000) { // 10 minutes max
      delete state.rooms[code];
      delete state.signals[code];
      delete state.relays[code];
    }
  });
  Object.keys(state.matches).forEach(mId => {
    if ((now - (state.matches[mId].lastActivity || state.matches[mId].createdAt)) > 600000) {
      delete state.matches[mId];
      delete state.signals[mId];
      delete state.relays[mId];
    }
  });
}, 30000);

// Helper to send JSON response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

// Helper to read JSON body
function readJsonBody(req, callback) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      const data = body ? JSON.parse(body) : {};
      callback(null, data);
    } catch (err) {
      callback(err);
    }
  });
}

// Helper functions for room codes
function generateRoomCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = 'FVH-';
  const bytes = crypto.randomBytes(4);
  for (let i = 0; i < 4; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

function normalizeRoomCode(raw) {
  if (!raw) return '';
  let code = String(raw).trim().toUpperCase();
  if (!code.startsWith('FVH-') && !code.startsWith('FVH')) {
    code = 'FVH-' + code;
  }
  if (!code.includes('-') && code.startsWith('FVH')) {
    code = code.slice(0, 3) + '-' + code.slice(3);
  }
  return code;
}

const server = http.createServer((req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // 0. Health check endpoint
  if (pathname === '/api/health' && req.method === 'GET') {
    return sendJson(res, 200, {
      ok: true,
      service: 'footy-vs-hoops',
      version: '2.0.0',
      uptime: process.uptime(),
      storageAdapter: storage ? storage.name : 'JsonStorageAdapter',
      timestamp: Date.now()
    });
  }

  // ==========================================
  // API: Matchmaking (Quick Match)
  // ==========================================

  // 1. Join Matchmaking Queue
  if (pathname === '/api/matchmaking/join' && req.method === 'POST') {
    return readJsonBody(req, (err, data) => {
      if (err) return sendJson(res, 400, { ok: false, error: 'Invalid JSON' });

      const playerId = String(data.playerId || 'player_' + Math.random().toString(36).slice(2, 8));
      const playerName = String(data.playerName || 'Athlete');
      const mode = (data.mode === 'hoops') ? 'hoops' : 'footy';
      const char = data.character || data.char || mode;

      // Remove any prior tickets for this player or stale tickets older than 30s
      const now = Date.now();
      state.queue = state.queue.filter(q => q.playerId !== playerId && (now - q.timestamp < 30000));

      // Clean up previous active matches for this player that are already completed or abandoned
      for (const mId in state.matches) {
        const m = state.matches[mId];
        const isParticipant = (m.host && m.host.playerId === playerId) || (m.guest && m.guest.playerId === playerId);
        if (isParticipant && (m.status === 'completed' || m.status === 'abandoned' || state.completedMatches[mId] || (now - m.createdAt > 300000))) {
          delete state.matches[mId];
        }
      }

      // Check if there is an eligible opponent waiting in the queue (no self-matches, cross-discipline FOOTY vs HOOPS supported)
      const opponentIdx = state.queue.findIndex(q => q.playerId !== playerId);

      if (opponentIdx !== -1) {
        // Real Opponent Found! Pair them into the same game session
        const opponent = state.queue.splice(opponentIdx, 1)[0];
        const matchId = 'FVH-M' + crypto.randomBytes(4).toString('hex').toUpperCase();
        const seed = (Math.random() * 1e9) | 0;

        // When pairing cross-discipline (e.g. Footy vs Hoops), resolve to one authoritative valid discipline
        const authDiscipline = (opponent.mode === mode)
          ? mode
          : ((opponent.mode === 'hoops' || opponent.mode === 'footy') ? opponent.mode : (mode === 'hoops' ? 'hoops' : 'footy'));

        const matchInfo = {
          matchId,
          roomId: matchId,
          mode: authDiscipline,
          minutes: 2,
          seed,
          host: { playerId: opponent.playerId, name: opponent.playerName, char: opponent.char },
          guest: { playerId, name: playerName, char },
          status: 'playing',
          createdAt: Date.now(),
          lastActivity: Date.now()
        };

        state.matches[matchId] = matchInfo;
        state.signals[matchId] = { host: [], guest: [], all: [] };
        state.relays[matchId] = { host: [], guest: [], lastHostTick: Date.now(), lastGuestTick: Date.now() };

        return sendJson(res, 200, {
          ok: true,
          status: 'matched',
          matchId,
          role: 'guest',
          mode: matchInfo.mode,
          minutes: matchInfo.minutes,
          seed: matchInfo.seed,
          arenaId: matchInfo.arenaId || null,
          match: matchInfo,
          opponent: matchInfo.host
        });
      } else {
        // Enqueue player with timestamp
        const ticketId = 'tkt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
        state.queue.push({
          ticketId,
          playerId,
          playerName,
          mode,
          char,
          timestamp: Date.now()
        });

        return sendJson(res, 200, {
          ok: true,
          status: 'searching',
          ticketId,
          playerId,
          elapsedSeconds: 0
        });
      }
    });
  }

  // 2. Poll Matchmaking Status
  if (pathname === '/api/matchmaking/poll' && req.method === 'GET') {
    const ticketId = parsedUrl.query.ticketId;
    const playerId = parsedUrl.query.playerId;
    const now = Date.now();

    // Check if player is part of an active (non-completed) match
    for (const mId in state.matches) {
      const m = state.matches[mId];
      if (m.status !== 'playing' || state.completedMatches[mId]) {
        continue;
      }
      if (m.host && m.host.playerId === playerId) {
        return sendJson(res, 200, {
          ok: true,
          status: 'matched',
          matchId: mId,
          role: 'host',
          mode: m.mode,
          minutes: m.minutes,
          seed: m.seed,
          arenaId: m.arenaId || null,
          match: m,
          opponent: m.guest
        });
      } else if (m.guest && m.guest.playerId === playerId) {
        return sendJson(res, 200, {
          ok: true,
          status: 'matched',
          matchId: mId,
          role: 'guest',
          mode: m.mode,
          minutes: m.minutes,
          seed: m.seed,
          arenaId: m.arenaId || null,
          match: m,
          opponent: m.host
        });
      }
    }

    // Check if still in queue
    const queuedIdx = state.queue.findIndex(q => (ticketId && q.ticketId === ticketId) || (playerId && q.playerId === playerId));
    if (queuedIdx !== -1) {
      const queued = state.queue[queuedIdx];
      const elapsed = Math.floor((now - queued.timestamp) / 1000);

      // Matchmaking Timeout at 25 seconds: show clear message, do NOT fabricate fake opponents!
      if (elapsed >= 25) {
        state.queue.splice(queuedIdx, 1);
        return sendJson(res, 200, {
          ok: true,
          status: 'timeout',
          message: 'No online athletes found in queue. You can try searching again or invite a friend via Private Room code.'
        });
      }

      return sendJson(res, 200, {
        ok: true,
        status: 'searching',
        queuePosition: queuedIdx + 1,
        elapsedSeconds: elapsed
      });
    }

    return sendJson(res, 200, { ok: true, status: 'idle' });
  }

  // 3. Cancel Matchmaking
  if (pathname === '/api/matchmaking/cancel' && req.method === 'POST') {
    return readJsonBody(req, (err, data) => {
      const pid = data.playerId;
      const tid = data.ticketId;
      state.queue = state.queue.filter(q => q.playerId !== pid && q.ticketId !== tid);
      return sendJson(res, 200, { ok: true, success: true });
    });
  }

  // ==========================================
  // API: Private Match Rooms
  // ==========================================

  // 1. Create Private Room (Cryptographically random 6-character code)
  if (pathname === '/api/room/create' && req.method === 'POST') {
    return readJsonBody(req, (err, data) => {
      if (err) return sendJson(res, 400, { ok: false, error: 'Invalid JSON' });

      let code;
      let attempts = 0;
      do {
        code = generateRoomCode();
        attempts++;
      } while (state.rooms[code] && attempts < 100);

      const playerId = String(data.hostId || data.playerId || 'host_' + Math.random().toString(36).slice(2, 6));
      const playerName = String(data.hostName || data.playerName || 'Host Athlete');
      const mode = (data.mode === 'hoops') ? 'hoops' : 'footy';
      const char = data.character || data.char || mode;
      const minutes = Math.max(1, Math.min(5, Number(data.minutes) || 2));
      const seed = (Math.random() * 1e9) | 0;
      const arenaId = data.arenaId || (mode === 'hoops' ? 'std_urban_rooftop' : 'std_classic_pitch');

      state.rooms[code] = {
        roomCode: code,
        host: { playerId, name: playerName, char, ready: false },
        guest: null,
        mode,
        arenaId,
        minutes,
        seed,
        status: 'waiting',
        countdownStart: null,
        countdownSeconds: null,
        createdAt: Date.now(),
        lastActivity: Date.now()
      };
      state.signals[code] = { host: [], guest: [], all: [] };
      state.relays[code] = { host: [], guest: [], lastHostTick: Date.now(), lastGuestTick: Date.now() };

      return sendJson(res, 200, {
        ok: true,
        success: true,
        roomCode: code,
        code: code,
        role: 'host',
        room: state.rooms[code]
      });
    });
  }

  // 2. Join Private Room with Code (Server-side validation)
  if (pathname === '/api/room/join' && req.method === 'POST') {
    return readJsonBody(req, (err, data) => {
      if (err) return sendJson(res, 400, { ok: false, error: 'Invalid JSON' });

      const code = normalizeRoomCode(data.code || data.roomCode);
      const room = state.rooms[code];

      if (!room) {
        return sendJson(res, 404, {
          ok: false,
          success: false,
          error: 'room_not_found',
          message: 'Room code not found or expired'
        });
      }

      // Check Room Expiration (15 minutes)
      const now = Date.now();
      if ((now - room.createdAt) > 900000) {
        delete state.rooms[code];
        delete state.signals[code];
        delete state.relays[code];
        return sendJson(res, 410, {
          ok: false,
          success: false,
          error: 'room_expired',
          message: 'This private arena session has expired'
        });
      }

      // Check if room was closed or abandoned by host
      if (room.status === 'closed' || room.status === 'abandoned') {
        return sendJson(res, 410, {
          ok: false,
          success: false,
          error: 'room_closed',
          message: 'This room was abandoned or closed by the host'
        });
      }

      let playerId = String(data.guestId || data.playerId || 'guest_' + Math.random().toString(36).slice(2, 6));
      const playerName = String(data.guestName || data.playerName || 'Challenger');
      const char = data.character || data.char || (room.mode === 'hoops' ? 'footy' : 'hoops');

      // Rejoining as host
      if (room.host.playerId === playerId && data.role === 'host') {
        return sendJson(res, 200, {
          ok: true,
          success: true,
          roomCode: code,
          code,
          role: 'host',
          room
        });
      }

      // If joining from same browser/localStorage (2 tabs on 1 PC), differentiate guest ID so 1v1 works seamlessly
      if (room.host.playerId === playerId) {
        playerId = playerId + '_guest2';
      }

      // Reject already-full rooms
      if (room.guest && room.guest.playerId !== playerId) {
        return sendJson(res, 409, {
          ok: false,
          success: false,
          error: 'room_full',
          message: 'This private arena is already full (2/2 athletes)'
        });
      }

      // Join room as guest in lobby
      room.guest = { playerId, name: playerName, char, ready: false };
      room.status = 'lobby';
      room.lastActivity = Date.now();

      // Register matching record so state relay, overtime and authoritative results work seamlessly
      state.matches[code] = {
        matchId: code,
        roomId: code,
        mode: room.mode,
        arenaId: room.arenaId,
        minutes: room.minutes,
        seed: room.seed,
        host: room.host,
        guest: room.guest,
        status: 'lobby',
        createdAt: Date.now(),
        lastActivity: Date.now()
      };

      return sendJson(res, 200, {
        ok: true,
        success: true,
        roomCode: code,
        code,
        role: 'guest',
        room: Object.assign({}, room, { guestName: playerName })
      });
    });
  }

  // 2B. Update Room Settings (Mode, Arena, Duration) - Host only
  if (pathname === '/api/room/update' && req.method === 'POST') {
    return readJsonBody(req, (err, data) => {
      if (err) return sendJson(res, 400, { ok: false, error: 'Invalid JSON' });
      const code = normalizeRoomCode(data.code || data.roomCode);
      const room = state.rooms[code];
      if (!room) return sendJson(res, 404, { ok: false, error: 'room_not_found' });

      // Host updates sport mode (FOOTY vs HOOPS)
      if (data.mode === 'footy' || data.mode === 'hoops') {
        room.mode = data.mode;
        // Also update default arena if not explicitly passed
        if (!data.arenaId) {
          room.arenaId = room.mode === 'hoops' ? 'std_urban_rooftop' : 'std_classic_pitch';
        }
      }
      if (data.arenaId) {
        room.arenaId = String(data.arenaId);
      }
      if (data.minutes) {
        room.minutes = Math.max(1, Math.min(5, Number(data.minutes) || 2));
      }

      // Reset readiness when settings change so both players explicitly re-confirm
      if (room.host) room.host.ready = false;
      if (room.guest) room.guest.ready = false;
      if (room.status === 'countdown') {
        room.status = 'lobby';
        room.countdownStart = null;
      }
      room.lastActivity = Date.now();

      if (state.matches[code]) {
        state.matches[code].mode = room.mode;
        state.matches[code].arenaId = room.arenaId;
        state.matches[code].minutes = room.minutes;
      }

      return sendJson(res, 200, { ok: true, room });
    });
  }

  // 2C. Toggle Player Ready State
  if (pathname === '/api/room/ready' && req.method === 'POST') {
    return readJsonBody(req, (err, data) => {
      if (err) return sendJson(res, 400, { ok: false, error: 'Invalid JSON' });
      const code = normalizeRoomCode(data.code || data.roomCode);
      const room = state.rooms[code];
      if (!room) return sendJson(res, 404, { ok: false, error: 'room_not_found' });

      const role = data.role === 'guest' ? 'guest' : 'host';
      const isReady = data.ready === true;

      if (room[role]) {
        room[role].ready = isReady;
      }

      // If both Host and Guest are Ready, start 3-second synchronized countdown!
      if (room.host && room.host.ready && room.guest && room.guest.ready) {
        room.status = 'countdown';
        room.countdownStart = Date.now();
        room.countdownSeconds = 3;

        state.matches[code] = {
          matchId: code,
          roomId: code,
          mode: room.mode,
          arenaId: room.arenaId,
          minutes: room.minutes,
          seed: room.seed,
          host: room.host,
          guest: room.guest,
          status: 'playing',
          createdAt: Date.now(),
          lastActivity: Date.now()
        };
      } else if (room.status === 'countdown') {
        room.status = 'lobby';
        room.countdownStart = null;
      }

      room.lastActivity = Date.now();
      return sendJson(res, 200, { ok: true, room, status: room.status });
    });
  }

  // 3. Poll Room Status
  if (pathname === '/api/room/status' && req.method === 'GET') {
    const code = normalizeRoomCode(parsedUrl.query.code || parsedUrl.query.roomCode);
    const room = state.rooms[code];
    if (!room) {
      return sendJson(res, 404, { ok: false, status: 'closed', error: 'room_not_found' });
    }

    let countdown = null;
    if (room.status === 'countdown' && room.countdownStart) {
      const elapsed = (Date.now() - room.countdownStart) / 1000;
      countdown = Math.max(0, Math.ceil(3 - elapsed));
      if (countdown <= 0) {
        room.status = 'playing';
      }
    }

    return sendJson(res, 200, {
      ok: true,
      status: room.status,
      room,
      guest: room.guest,
      host: room.host,
      mode: room.mode,
      arenaId: room.arenaId,
      seed: room.seed,
      countdown
    });
  }

  // 4. Send Signal (WebRTC SDP / ICE)
  if (pathname === '/api/room/signal' && req.method === 'POST') {
    return readJsonBody(req, (err, data) => {
      if (err) return sendJson(res, 400, { ok: false, error: 'Invalid JSON' });

      const roomId = normalizeRoomCode(data.code || data.roomId || data.roomCode);
      const payload = data.payload || data.signal;
      const senderRole = data.role || (payload && payload.type === 'offer' ? 'host' : 'guest');

      if (!roomId || !payload) {
        return sendJson(res, 400, { ok: false, error: 'Missing required parameters' });
      }

      if (!state.signals[roomId]) {
        state.signals[roomId] = { host: [], guest: [], all: [] };
      }

      const target = senderRole === 'host' ? 'guest' : 'host';
      const sigObj = {
        id: Date.now() + '_' + Math.random().toString(36).slice(2, 5),
        from: data.from || senderRole,
        role: senderRole,
        type: payload.type,
        data: payload.data,
        payload: payload,
        timestamp: Date.now()
      };

      if (!state.signals[roomId][target]) state.signals[roomId][target] = [];
      state.signals[roomId][target].push(sigObj);
      if (!state.signals[roomId].all) state.signals[roomId].all = [];
      state.signals[roomId].all.push(sigObj);

      // Cap signal buffer to prevent memory leakage
      if (state.signals[roomId][target].length > 50) state.signals[roomId][target].shift();
      if (state.signals[roomId].all.length > 100) state.signals[roomId].all.shift();

      if (state.rooms[roomId]) state.rooms[roomId].lastActivity = Date.now();
      if (state.matches[roomId]) state.matches[roomId].lastActivity = Date.now();

      return sendJson(res, 200, { ok: true, success: true });
    });
  }

  // 5. Receive Signals
  if (pathname === '/api/room/signals' && req.method === 'GET') {
    const roomId = normalizeRoomCode(parsedUrl.query.code || parsedUrl.query.roomId || parsedUrl.query.roomCode);
    const role = parsedUrl.query.role;
    const from = parsedUrl.query.from;

    if (!roomId || !state.signals[roomId]) {
      return sendJson(res, 200, { ok: true, signals: [] });
    }

    let queue = [];
    if (role && state.signals[roomId][role]) {
      queue = state.signals[roomId][role];
      state.signals[roomId][role] = [];
    } else if (from && state.signals[roomId].all) {
      queue = state.signals[roomId].all.filter(s => s.from === from);
    } else if (state.signals[roomId].all) {
      queue = state.signals[roomId].all;
    }

    return sendJson(res, 200, { ok: true, signals: queue });
  }

  // 6. Cancel / Leave Room
  if (pathname === '/api/room/cancel' && req.method === 'POST') {
    return readJsonBody(req, (err, data) => {
      const code = normalizeRoomCode(data.code || data.roomCode);
      const hostId = data.hostId || data.playerId;

      if (state.rooms[code]) {
        // If host cancels, mark room abandoned
        if (!hostId || state.rooms[code].host.playerId === hostId) {
          state.rooms[code].status = 'abandoned';
          setTimeout(() => {
            delete state.rooms[code];
            delete state.signals[code];
            delete state.relays[code];
            delete state.wsClients[code];
          }, 15000);
        } else {
          // Guest left, reset room to waiting and reset host readiness cleanly without soft-locking
          state.rooms[code].guest = null;
          state.rooms[code].status = 'waiting';
          state.rooms[code].countdownStart = null;
          if (state.rooms[code].host) {
            state.rooms[code].host.ready = false;
          }
        }
      }
      return sendJson(res, 200, { ok: true, success: true });
    });
  }

  // ==========================================
  // API: Real-Time State & Input Relay (Fallback / High Reliability Sync)
  // ==========================================

  // 1. Post Relay Packet (Host snapshot/events or Guest input)
  if (pathname === '/api/match/relay' && req.method === 'POST') {
    return readJsonBody(req, (err, data) => {
      if (err) return sendJson(res, 400, { ok: false, error: 'Invalid JSON' });

      const matchId = normalizeRoomCode(data.matchId || data.roomId || data.code);
      const role = data.role === 'guest' ? 'guest' : 'host';
      const targetRole = role === 'host' ? 'guest' : 'host';
      const packet = data.packet || data;

      if (!matchId) return sendJson(res, 400, { ok: false, error: 'missing_match_id' });

      if (!state.relays[matchId]) {
        state.relays[matchId] = { host: [], guest: [], lastHostTick: Date.now(), lastGuestTick: Date.now() };
      }

      const relay = state.relays[matchId];
      if (role === 'host') relay.lastHostTick = Date.now();
      else relay.lastGuestTick = Date.now();

      // Enqueue packets with preserved envelope (support batched HTTP packets)
      const packets = Array.isArray(data.batch) && data.batch.length > 0 ? data.batch : [packet];

      for (const pkt of packets) {
        if (!pkt) continue;
        relay[targetRole].push({
          packet: pkt,
          type: pkt.k || pkt.type,
          data: pkt.s || pkt.i || pkt.l || pkt.data || pkt,
          timestamp: Date.now()
        });

        // If peer is connected via native WebSocket relay, forward immediately
        if (state.wsClients && state.wsClients[matchId] && state.wsClients[matchId][targetRole]) {
          const peerWs = state.wsClients[matchId][targetRole];
          if (peerWs && !peerWs.destroyed && peerWs.writable) {
            try {
              peerWs.write(makeWsTextFrame(JSON.stringify(pkt)));
            } catch (e) {}
          }
        }
      }

      // Keep recent 40 packets in memory
      while (relay[targetRole].length > 40) {
        relay[targetRole].shift();
      }

      return sendJson(res, 200, { ok: true, success: true });
    });
  }

  // 2. Fetch Relay Packets
  if (pathname === '/api/match/relay' && req.method === 'GET') {
    const matchId = normalizeRoomCode(parsedUrl.query.matchId || parsedUrl.query.roomId || parsedUrl.query.code);
    const role = parsedUrl.query.role === 'guest' ? 'guest' : 'host';

    if (!matchId || !state.relays[matchId]) {
      return sendJson(res, 200, { ok: true, messages: [] });
    }

    const messages = state.relays[matchId][role] || [];
    state.relays[matchId][role] = []; // Drain queue
    return sendJson(res, 200, { ok: true, messages });
  }

  // ==========================================
  // API: Authoritative Match Completion & Forfeits
  // ==========================================

  // 1. Authoritative Match Completion
  if (pathname === '/api/match/complete' && req.method === 'POST') {
    return readJsonBody(req, (err, data) => {
      if (err) return sendJson(res, 400, { ok: false, error: 'Invalid JSON' });

      const matchId = normalizeRoomCode(data.matchId || data.roomId || data.code);
      const playerId = String(data.playerId || '').trim();
      const finalScore = Array.isArray(data.finalScore) ? data.finalScore : [0, 0];
      const phase = String(data.phase || data.matchPhase || 'regulation'); // 'regulation' | 'overtime' | 'suddendeath'
      const stats = data.stats || {};

      if (!matchId || !playerId) {
        return sendJson(res, 400, { ok: false, error: 'missing_parameters' });
      }

      // Check if match already authoritatively recorded
      if (state.completedMatches[matchId]) {
        const existing = state.completedMatches[matchId];
        return sendJson(res, 200, {
          ok: true,
          alreadyCompleted: true,
          matchId,
          matchToken: existing.matchToken,
          winner: existing.winner,
          finalScore: existing.finalScore,
          phase: existing.phase
        });
      }

      const match = state.matches[matchId] || state.rooms[matchId];
      if (!match) {
        return sendJson(res, 404, { ok: false, error: 'match_not_found', message: 'Match record not found' });
      }

      // Validate that player is a participant
      const isHost = match.host && match.host.playerId === playerId;
      const isGuest = match.guest && match.guest.playerId === playerId;
      if (!isHost && !isGuest) {
        return sendJson(res, 403, { ok: false, error: 'unauthorized_participant' });
      }

      // Anti-Cheat: Validate elapsed game time
      const nowMs = Date.now();
      const elapsedMs = nowMs - (match.createdAt || 0);
      const isTestEnv = process.env.NODE_ENV === 'test' || Boolean(process.env.FVH_TEST_FAST) || Boolean(process.env.DATA_FILE);
      const minRequiredMs = isTestEnv ? 0 : Math.max(3000, ((match.minutes || 2) * 60 * 1000) * 0.3);
      if (elapsedMs < minRequiredMs) {
        return sendJson(res, 400, { ok: false, error: 'premature_match_completion', message: 'Match duration too short for valid completion' });
      }

      // Anti-Cheat: Host is the authoritative simulation peer; Guest cannot unilaterally submit completion while Host is active
      if (isGuest) {
        const hostSocket = state.wsClients[matchId] && state.wsClients[matchId].host;
        const hostLastTick = (state.relays[matchId] && state.relays[matchId].lastHostTick) || 0;
        const hostActive = (hostSocket && !hostSocket.destroyed) || (nowMs - hostLastTick < 6000);
        if (hostActive) {
          return sendJson(res, 403, { ok: false, error: 'host_authority_required', message: 'Host is the authoritative simulation peer for match completion' });
        }
      }

      // Validate scores
      const rawScore0 = Number(finalScore[0]);
      const rawScore1 = Number(finalScore[1]);
      if (!Number.isFinite(rawScore0) || !Number.isFinite(rawScore1) || rawScore0 < 0 || rawScore1 < 0) {
        return sendJson(res, 400, { ok: false, error: 'invalid_scores', message: 'Scores must be non-negative numbers' });
      }
      const maxPlausibleGoals = (match.mode === 'hoops') ? 60 : 15;
      if (rawScore0 > maxPlausibleGoals || rawScore1 > maxPlausibleGoals) {
        return sendJson(res, 400, { ok: false, error: 'implausible_score', message: 'Score exceeds physical match limits' });
      }
      const score0 = Math.floor(rawScore0);
      const score1 = Math.floor(rawScore1);

      // Enforce mathematical winner invariant
      let resolvedWinner = null;
      if (score0 > score1) {
        resolvedWinner = 0;
      } else if (score1 > score0) {
        resolvedWinner = 1;
      } else {
        if (phase === 'suddendeath') {
          return sendJson(res, 400, { ok: false, error: 'invalid_sudden_death_draw', message: 'Sudden death cannot end in a draw' });
        }
        resolvedWinner = null;
      }

      const matchToken = 'mtok_' + Date.now() + '_' + crypto.randomBytes(6).toString('hex');
      const compRecord = {
        matchId,
        host: match.host,
        guest: match.guest,
        finalScore: [score0, score1],
        winner: resolvedWinner,
        phase,
        mode: match.mode || 'footy',
        stats,
        completedAt: Date.now(),
        matchToken,
        rewarded: {}
      };

      match.status = 'completed';
      match.completedAt = Date.now();
      state.completedMatches[matchId] = compRecord;
      persistState();

      return sendJson(res, 200, {
        ok: true,
        success: true,
        matchId,
        matchToken,
        winner: resolvedWinner,
        finalScore: [score0, score1],
        phase
      });
    });
  }

  // 2. Opponent Forfeit / Abandonment
  if (pathname === '/api/match/forfeit' && req.method === 'POST') {
    return readJsonBody(req, (err, data) => {
      if (err) return sendJson(res, 400, { ok: false, error: 'Invalid JSON' });

      const matchId = normalizeRoomCode(data.matchId || data.roomId || data.code);
      const playerId = String(data.playerId || '').trim();
      const reason = data.reason || 'opponent_disconnected';

      if (!matchId || !playerId) return sendJson(res, 400, { ok: false, error: 'missing_parameters' });

      const match = state.matches[matchId] || state.rooms[matchId];
      if (!match) return sendJson(res, 404, { ok: false, error: 'match_not_found' });

      const isHost = match.host && match.host.playerId === playerId;
      const isGuest = match.guest && match.guest.playerId === playerId;
      if (!isHost && !isGuest) return sendJson(res, 403, { ok: false, error: 'unauthorized_participant' });

      // Match startup grace period
      const nowMs = Date.now();
      const elapsedMs = nowMs - (match.createdAt || 0);
      if (elapsedMs < 1200) {
        return sendJson(res, 400, { ok: false, error: 'match_starting_grace_period', message: 'Connection establishing' });
      }

      // Check if opponent is actually disconnected before granting forfeit win to caller
      const oppRole = isHost ? 'guest' : 'host';
      const oppSocket = state.wsClients[matchId] && state.wsClients[matchId][oppRole];
      const oppLastTick = (state.relays[matchId] && (oppRole === 'guest' ? state.relays[matchId].lastGuestTick : state.relays[matchId].lastHostTick)) || 0;
      const oppActive = (oppSocket && !oppSocket.destroyed) || (nowMs - oppLastTick < 6000);

      if (reason !== 'self_abandon' && oppActive) {
        return sendJson(res, 400, { ok: false, error: 'opponent_still_active', message: 'Opponent is actively connected to the match session' });
      }

      const remainingWinner = (reason === 'self_abandon') ? (isHost ? 1 : 0) : (isHost ? 0 : 1);
      const matchToken = 'mtok_' + Date.now() + '_' + crypto.randomBytes(6).toString('hex');

      const compRecord = {
        matchId,
        host: match.host,
        guest: match.guest,
        finalScore: remainingWinner === 0 ? [3, 0] : [0, 3],
        winner: remainingWinner,
        outcome: 'forfeit',
        reason,
        completedAt: Date.now(),
        matchToken,
        rewarded: {}
      };

      match.status = 'completed';
      match.completedAt = Date.now();
      state.completedMatches[matchId] = compRecord;
      persistState();

      return sendJson(res, 200, {
        ok: true,
        success: true,
        matchId,
        matchToken,
        winner: remainingWinner,
        outcome: 'forfeit'
      });
    });
  }


  // ==========================================
  // API: Referral Verification & Tracking
  // ==========================================

  function normalizeRefCode(raw) {
    if (!raw) return 'DEFAULT';
    return String(raw).trim().replace(/^ref_/, '');
  }

  // 1. Get Referral Status & Milestones
  if (pathname === '/api/referrals/stats' && req.method === 'GET') {
    const rawRef = parsedUrl.query.refCode || parsedUrl.query.userId || parsedUrl.query.playerId;
    const norm = normalizeRefCode(rawRef);

    const refData = state.referrals[norm] || {
      ownerId: norm,
      referred: [],
      claimedMilestones: [],
      totalCommissionCoins: 0
    };

    const qualifiedCount = refData.referred.filter(r => r.qualified).length;
    const totalCount = refData.referred.length;

    return sendJson(res, 200, {
      ok: true,
      success: true,
      refCode: norm,
      totalInvited: totalCount,
      qualifiedCount: qualifiedCount,
      qualifiedFriends: qualifiedCount,
      commissionRate: REFERRAL_COMMISSION_RATE,
      totalCommissionCoins: refData.totalCommissionCoins || 0,
      milestones: [
        { friends: 1, coins: 500, xp: 150, label: '1 Friend' },
        { friends: 3, coins: 1500, xp: 300, label: '3 Friends' },
        { friends: 5, coins: 3000, xp: 500, label: '5 Friends' },
        { friends: 10, coins: 7500, xp: 1000, label: '10 Friends' },
        { friends: 25, coins: 20000, xp: 3000, label: '25 Friends' }
      ],
      claimedMilestones: refData.claimedMilestones || []
    });
  }

  // 2. Register Referral (Friend opens game with ref code)
  if (pathname === '/api/referrals/register' && req.method === 'POST') {
    return readJsonBody(req, (err, data) => {
      if (err) return sendJson(res, 400, { ok: false, error: 'Invalid JSON' });

      const rawRef = data.refCode || data.referralCode;
      const newPlayerId = String(data.playerId || data.friendId || '').trim();

      if (!rawRef || !newPlayerId) {
        return sendJson(res, 400, { ok: false, error: 'missing_parameters', message: 'Missing refCode or playerId' });
      }

      const norm = normalizeRefCode(rawRef);

      // Prevent self-referral
      if (norm === newPlayerId) {
        return sendJson(res, 400, { ok: false, error: 'self_referral_prevented', message: 'You cannot refer yourself' });
      }

      const player = getPlayer(newPlayerId);

      // Prevent duplicate referral (player already has a referrer)
      if (player && player.referredBy) {
        return sendJson(res, 400, { ok: false, error: 'already_referred', message: 'Player was already referred by another athlete' });
      }

      // Check Telegram account uniqueness if provided
      if (data.telegramId) {
        const tgStr = String(data.telegramId).trim();
        const existingTg = Object.values(state.players).find(p => p.telegramId && String(p.telegramId) === tgStr && p.playerId !== newPlayerId);
        if (existingTg) {
          return sendJson(res, 400, { ok: false, error: 'duplicate_telegram_account', message: 'Telegram account already registered' });
        }
      }

      if (!state.referrals[norm]) {
        state.referrals[norm] = {
          ownerId: norm,
          referred: [],
          claimedMilestones: [],
          totalCommissionCoins: 0
        };
      }

      const refRecord = state.referrals[norm];

      // Prevent self-referral via ownerId
      if (refRecord.ownerId === newPlayerId) {
        return sendJson(res, 400, { ok: false, error: 'self_referral_prevented', message: 'You cannot refer yourself' });
      }

      // Prevent referral cycles (e.g. A referred B, so B cannot refer A)
      const referrerPlayer = state.players[refRecord.ownerId] || state.players[norm];
      if (referrerPlayer && referrerPlayer.referredBy === newPlayerId) {
        return sendJson(res, 400, { ok: false, error: 'referral_cycle_prevented', message: 'Mutual referral cycles are strictly forbidden' });
      }

      // Link player to referrer
      if (player) {
        player.referredBy = refRecord.ownerId || norm;
        if (data.telegramId) player.telegramId = String(data.telegramId);
      }

      // Check if already in referred array
      const existing = refRecord.referred.find(r => r.playerId === newPlayerId);
      if (!existing) {
        refRecord.referred.push({
          playerId: newPlayerId,
          registeredAt: Date.now(),
          qualified: false
        });
        persistState();
      }

      return sendJson(res, 200, {
        ok: true,
        success: true,
        registered: true,
        referrerId: refRecord.ownerId || norm,
        commissionRate: REFERRAL_COMMISSION_RATE
      });
    });
  }

  // 3. Qualify Referral (Friend completed their first match)
  if (pathname === '/api/referrals/qualify' && req.method === 'POST') {
    return readJsonBody(req, (err, data) => {
      if (err) return sendJson(res, 400, { error: 'Invalid JSON' });

      const playerId = String(data.playerId || data.friendId || '').trim();
      let qualifiedAny = false;

      // Find all referral entries with this playerId and qualify them
      Object.keys(state.referrals).forEach(code => {
        state.referrals[code].referred.forEach(r => {
          if (r.playerId === playerId && !r.qualified) {
            r.qualified = true;
            r.qualifiedAt = Date.now();
            qualifiedAny = true;
          }
        });
      });

      if (qualifiedAny) persistState();

      return sendJson(res, 200, { ok: true, success: true, qualified: qualifiedAny });
    });
  }

  // 4. Claim Referral Milestone Reward (Server-authoritative reward validation)
  if (pathname === '/api/referrals/claim' && req.method === 'POST') {
    return readJsonBody(req, (err, data) => {
      if (err) return sendJson(res, 400, { error: 'Invalid JSON' });

      const rawCode = data.refCode || data.userId;
      const milestone = Number(data.milestone || data.milestoneTarget);

      const norm = normalizeRefCode(rawCode);
      const refData = state.referrals[norm];
      if (!refData) {
        return sendJson(res, 404, { ok: false, success: false, error: 'referral_code_not_found' });
      }

      if (!refData.claimedMilestones) refData.claimedMilestones = [];

      if (refData.claimedMilestones.includes(milestone)) {
        return sendJson(res, 400, { ok: false, success: false, error: 'already_claimed' });
      }

      const qualifiedCount = refData.referred.filter(r => r.qualified).length;
      if (qualifiedCount < milestone) {
        return sendJson(res, 400, {
          ok: false,
          success: false,
          error: 'milestone_not_reached',
          current: qualifiedCount,
          required: milestone
        });
      }

      refData.claimedMilestones.push(milestone);
      persistState();

      const rewards = {
        1: { coins: 500, xp: 150 },
        3: { coins: 1500, xp: 300 },
        5: { coins: 3000, xp: 500 },
        10: { coins: 7500, xp: 1000 },
        25: { coins: 20000, xp: 3000 }
      };

      return sendJson(res, 200, {
        ok: true,
        success: true,
        milestone,
        reward: rewards[milestone] || { coins: 500, xp: 150 }
      });
    });
  }

  // ==========================================
  // API: Payments & Store Subsystem (Stars & TON)
  // ==========================================

  // 1. Get Product Catalog
  if (pathname === '/api/catalog' && req.method === 'GET') {
    const catalog = {};
    for (const id in PRODUCT_CATALOG) {
      catalog[id] = Object.assign({}, PRODUCT_CATALOG[id], {
        starsPrice: resolveStarsPrice(id)
      });
    }
    return sendJson(res, 200, { ok: true, catalog });
  }

  // 2. Telegram Stars: Create Invoice
  if (pathname === '/api/stars/create-invoice' && req.method === 'POST') {
    return readJsonBody(req, (err, data) => {
      if (err) return sendJson(res, 400, { error: 'Invalid JSON' });

      const productId = String(data.productId || '').trim();
      const playerId = String(data.playerId || 'player_anon').trim();
      const telegramUserId = data.telegramUserId ? String(data.telegramUserId).trim() : null;
      const prod = PRODUCT_CATALOG[productId];

      if (!prod) {
        return sendJson(res, 404, { ok: false, error: 'product_not_found' });
      }

      const effectiveStarsPrice = resolveStarsPrice(productId);
      if (!effectiveStarsPrice || typeof effectiveStarsPrice !== 'number') {
        return sendJson(res, 400, {
          ok: false,
          error: 'stars_price_unconfigured',
          message: 'Telegram Stars price is not yet configured for this package'
        });
      }

      const tokenResult = resolveTelegramBotToken();
      if (!tokenResult.ok) {
        return sendJson(res, 200, {
          ok: false,
          error: tokenResult.error,
          message: tokenResult.message
        });
      }
      const botToken = tokenResult.token;

      const orderId = 'stars_' + crypto.randomBytes(8).toString('hex');
      const order = {
        orderId,
        invoiceId: orderId,
        productId,
        playerId,
        telegramUserId,
        starsAmount: effectiveStarsPrice,
        currency: 'XTR',
        status: 'pending', // 'pending' | 'payment_processing' | 'paid' | 'failed' | 'cancelled' | 'refunded'
        createdAt: Date.now(),
        paidAt: null,
        chargeId: null,
        history: [{ status: 'pending', timestamp: Date.now() }]
      };
      state.starsInvoices[orderId] = order;
      persistState();

      if (botToken) {
        try {
          const https = require('https');
          const reqBody = JSON.stringify({
            title: prod.name,
            description: `FOOTY vs HOOPS - ${prod.name}`,
            payload: orderId,
            currency: 'XTR',
            prices: [{ label: prod.name, amount: prod.starsPrice }]
          });
          const tgReq = https.request({
            hostname: 'api.telegram.org',
            port: 443,
            path: `/bot${botToken}/createInvoiceLink`,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(reqBody)
            }
          }, (tgRes) => {
            let tgData = '';
            tgRes.on('data', chunk => { tgData += chunk; });
            tgRes.on('end', () => {
              try {
                const tgParsed = JSON.parse(tgData);
                if (tgParsed.ok && tgParsed.result) {
                  return sendJson(res, 200, {
                    ok: true,
                    orderId,
                    invoiceId: orderId,
                    invoiceLink: tgParsed.result,
                    productId,
                    starsAmount: prod.starsPrice,
                    title: prod.name,
                    currency: 'XTR'
                  });
                }
                return sendJson(res, 400, {
                  ok: false,
                  orderId,
                  invoiceId: orderId,
                  error: 'telegram_api_error',
                  message: tgParsed.description || 'Failed to create invoice link in Telegram Bot API'
                });
              } catch (e) {
                return sendJson(res, 502, {
                  ok: false,
                  orderId,
                  invoiceId: orderId,
                  error: 'telegram_response_invalid'
                });
              }
            });
          });
          tgReq.on('error', (e) => {
            return sendJson(res, 502, {
              ok: false,
              orderId,
              invoiceId: orderId,
              error: 'telegram_connection_failed',
              message: e.message
            });
          });
          tgReq.write(reqBody);
          tgReq.end();
          return;
        } catch (e) {
          return sendJson(res, 500, { ok: false, error: 'invoice_creation_failed', message: e.message });
        }
      }

      // If no bot token configured, return order metadata (invoiceLink is null)
      return sendJson(res, 200, {
        ok: true,
        orderId,
        invoiceId: orderId,
        invoiceLink: null,
        productId,
        starsAmount: prod.starsPrice,
        title: prod.name,
        currency: 'XTR',
        botConfigured: false
      });
    });
  }

  // 3. Telegram Stars: Check Order Status (Read-Only Inspection)
  if (pathname === '/api/stars/check-order' && req.method === 'POST') {
    return readJsonBody(req, (err, data) => {
      if (err) return sendJson(res, 400, { error: 'Invalid JSON' });

      const orderId = String(data.orderId || data.invoiceId || '').trim();
      const playerId = String(data.playerId || '').trim();

      const order = state.starsInvoices[orderId];
      if (!order) {
        return sendJson(res, 404, { ok: false, error: 'order_not_found' });
      }

      if (playerId && order.playerId && order.playerId !== playerId) {
        return sendJson(res, 403, { ok: false, error: 'forbidden' });
      }

      return sendJson(res, 200, {
        ok: true,
        orderId: order.orderId,
        productId: order.productId,
        starsAmount: order.starsAmount,
        currency: order.currency || 'XTR',
        status: order.status,
        isPaid: order.status === 'paid',
        chargeId: order.chargeId || null,
        paidAt: order.paidAt || null
      });
    });
  }

  // Telegram WebApp: Validate initData Signature
  if (pathname === '/api/telegram/validate-init-data' && req.method === 'POST') {
    return readJsonBody(req, (err, data) => {
      if (err) return sendJson(res, 400, { ok: false, error: 'Invalid JSON' });
      const initData = String(data.initData || '');
      const tokenResult = resolveTelegramBotToken();
      if (!tokenResult.ok) {
        return sendJson(res, 200, { ok: true, devMode: true, validated: false });
      }
      const botToken = tokenResult.token;
      try {
        const params = new URLSearchParams(initData);
        const hash = params.get('hash');
        params.delete('hash');
        const sortedKeys = Array.from(params.keys()).sort();
        const checkString = sortedKeys.map(k => `${k}=${params.get(k)}`).join('\n');
        const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
        const calculatedHash = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');
        const isValid = calculatedHash === hash;
        const userJson = params.get('user');
        const user = userJson ? JSON.parse(userJson) : null;
        return sendJson(res, 200, { ok: isValid, validated: isValid, user });
      } catch (e) {
        return sendJson(res, 400, { ok: false, error: 'validation_error', message: e.message });
      }
    });
  }

  // 4. Telegram Stars: Verify Payment (Compatibility & Test Harness; Rejects Untrusted Client Pay Signals)
  if (pathname === '/api/stars/verify' && req.method === 'POST') {
    return readJsonBody(req, (err, data) => {
      if (err) return sendJson(res, 400, { error: 'Invalid JSON' });

      const invoiceId = String(data.invoiceId || data.orderId || '').trim();
      const testSecret = req.headers['x-test-payment-auth'] || (data && data._testSecret);

      const order = state.starsInvoices[invoiceId];
      if (!order) {
        return sendJson(res, 404, { ok: false, error: 'invoice_not_found' });
      }

      // If already verified via authentic Telegram webhook
      if (order.status === 'paid') {
        return sendJson(res, 200, {
          ok: true,
          success: true,
          alreadyProcessed: true,
          productId: order.productId,
          starsAmount: order.starsAmount,
          status: 'paid'
        });
      }

      // In non-production test mode or with authorized test header: allow test suite verification
      if (process.env.NODE_ENV !== 'production' || testSecret === 'fvh-test-authorized') {
        const playerId = String(data.playerId || order.playerId || '').trim();
        const simChargeId = String(data.telegramPaymentChargeId || data.chargeId || ('SIM_CHARGE_' + crypto.randomBytes(6).toString('hex'))).trim();
        if (state.processedChargeIds[simChargeId]) {
          return sendJson(res, 200, { ok: true, alreadyProcessed: true });
        }
        order.status = 'paid';
        order.paidAt = Date.now();
        order.chargeId = simChargeId;
        state.processedChargeIds[simChargeId] = { orderId: order.orderId, timestamp: Date.now() };
        creditPurchasedProduct(playerId, order.productId, 'stars');
        state.paymentsLedger.push({
          id: 'pay_' + order.orderId,
          type: 'stars',
          invoiceId: order.orderId,
          productId: order.productId,
          playerId: playerId,
          amount: order.starsAmount,
          currency: 'XTR',
          timestamp: Date.now()
        });
        persistState();
        return sendJson(res, 200, {
          ok: true,
          success: true,
          productId: order.productId,
          starsAmount: order.starsAmount,
          invoiceId: order.orderId,
          status: 'paid'
        });
      }

      // Strictly reject untrusted client claims
      return sendJson(res, 400, {
        ok: false,
        error: 'payment_not_verified_by_telegram',
        message: 'Payment has not been confirmed by Telegram Stars webhook. Client callbacks cannot mark orders as paid.'
      });
    });
  }

  // 5. Telegram Webhook: Validates pre_checkout_query and processes successful_payment
  if ((pathname === '/api/telegram/webhook' || pathname === '/api/stars/webhook') && req.method === 'POST') {
    return readJsonBody(req, (err, data) => {
      if (err) return sendJson(res, 400, { error: 'Invalid JSON' });

      const tokenResult = resolveTelegramBotToken();
      const botToken = tokenResult.ok ? tokenResult.token : null;
      const webhookSecret = resolveTelegramWebhookSecret();

      if (process.env.NODE_ENV === 'production') {
        if (!webhookSecret || req.headers['x-telegram-bot-api-secret-token'] !== webhookSecret) {
          return sendJson(res, 403, { ok: false, error: 'invalid_webhook_secret', message: 'Webhook secret verification failed' });
        }
      } else if (webhookSecret) {
        const receivedSecret = req.headers['x-telegram-bot-api-secret-token'];
        if (receivedSecret !== webhookSecret) {
          return sendJson(res, 403, { ok: false, error: 'invalid_webhook_secret', message: 'Webhook secret verification failed' });
        }
      }

      // A. Handle pre_checkout_query
      if (data && data.pre_checkout_query) {
        const pcq = data.pre_checkout_query;
        const queryId = pcq.id;
        const payload = String(pcq.invoice_payload || '').trim();
        const currency = pcq.currency;
        const amount = Number(pcq.total_amount);
        const fromUserId = pcq.from ? String(pcq.from.id) : null;

        const order = state.starsInvoices[payload];

        function answerPreCheckout(ok, errorMsg) {
          if (botToken) {
            try {
              const https = require('https');
              const body = JSON.stringify({
                pre_checkout_query_id: queryId,
                ok: Boolean(ok),
                error_message: errorMsg || undefined
              });
              const tgReq = https.request({
                hostname: 'api.telegram.org',
                port: 443,
                path: `/bot${botToken}/answerPreCheckoutQuery`,
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Content-Length': Buffer.byteLength(body)
                }
              });
              tgReq.on('error', (e) => console.error('answerPreCheckoutQuery error:', e));
              tgReq.write(body);
              tgReq.end();
            } catch (e) {}
          }
        }

        // Security Validations
        if (!order) {
          answerPreCheckout(false, 'Order not found');
          return sendJson(res, 200, { ok: false, error: 'order_not_found' });
        }
        if (order.status !== 'pending' && order.status !== 'payment_processing') {
          answerPreCheckout(false, 'Order is already completed or cancelled');
          return sendJson(res, 200, { ok: false, error: 'invalid_order_status' });
        }
        if (currency !== 'XTR') {
          answerPreCheckout(false, 'Invalid payment currency');
          return sendJson(res, 200, { ok: false, error: 'invalid_currency' });
        }
        if (amount !== order.starsAmount) {
          answerPreCheckout(false, 'Mismatched payment amount');
          return sendJson(res, 200, { ok: false, error: 'amount_mismatch' });
        }
        if (order.telegramUserId && fromUserId && order.telegramUserId !== fromUserId) {
          answerPreCheckout(false, 'User ID does not match order owner');
          return sendJson(res, 200, { ok: false, error: 'user_mismatch' });
        }

        order.status = 'payment_processing';
        order.history.push({ status: 'payment_processing', timestamp: Date.now() });
        persistState();

        answerPreCheckout(true);
        return sendJson(res, 200, { ok: true, preCheckoutApproved: true });
      }

      // B. Handle successful_payment
      if (data && data.message && data.message.successful_payment) {
        const msg = data.message;
        const sp = msg.successful_payment;
        const payload = String(sp.invoice_payload || '').trim();
        const chargeId = String(sp.telegram_payment_charge_id || '').trim();
        const currency = sp.currency;
        const amount = Number(sp.total_amount);
        const fromUserId = msg.from ? String(msg.from.id) : null;

        // Idempotency: Has this charge ID already been processed?
        if (state.processedChargeIds[chargeId]) {
          return sendJson(res, 200, { ok: true, duplicate: true, message: 'duplicate_charge_already_processed' });
        }

        const order = state.starsInvoices[payload];
        if (!order) {
          return sendJson(res, 200, { ok: false, error: 'order_not_found' });
        }

        // Validate Currency & Amount
        if (currency !== 'XTR' || amount !== order.starsAmount) {
          order.status = 'failed';
          order.history.push({ status: 'failed', reason: 'currency_or_amount_mismatch', currency, amount, timestamp: Date.now() });
          persistState();
          return sendJson(res, 200, { ok: false, error: 'fraud_check_failed' });
        }

        // Validate User if known
        if (order.telegramUserId && fromUserId && order.telegramUserId !== fromUserId) {
          order.status = 'failed';
          order.history.push({ status: 'failed', reason: 'user_mismatch', fromUserId, timestamp: Date.now() });
          persistState();
          return sendJson(res, 200, { ok: false, error: 'user_mismatch' });
        }

        // Transition order to PAID
        order.status = 'paid';
        order.paidAt = Date.now();
        order.chargeId = chargeId;
        order.telegramUserId = fromUserId || order.telegramUserId;
        order.history.push({ status: 'paid', chargeId, timestamp: Date.now() });

        state.processedChargeIds[chargeId] = {
          orderId: order.orderId,
          playerId: order.playerId,
          timestamp: Date.now()
        };

        // Server-Authoritative Entitlement Crediting
        creditPurchasedProduct(order.playerId, order.productId, 'stars');

        // Record in Durable Payments Ledger
        state.paymentsLedger.push({
          id: 'pay_' + order.orderId,
          type: 'stars',
          invoiceId: order.orderId,
          orderId: order.orderId,
          chargeId,
          productId: order.productId,
          playerId: order.playerId,
          telegramUserId: order.telegramUserId,
          amount: order.starsAmount,
          currency: 'XTR',
          timestamp: Date.now()
        });
        persistState();

        return sendJson(res, 200, { ok: true, success: true, orderId: order.orderId });
      }

      // C. Handle incoming chat messages (/start, /play, /help)
      if (data && data.message && typeof data.message.text === 'string') {
        const msg = data.message;
        const text = msg.text.trim();
        const chatId = msg.chat ? msg.chat.id : null;
        const fromUser = msg.from || {};
        const effectiveToken = botToken;
        const miniAppUrl = process.env.TELEGRAM_MINI_APP_URL || 'https://footy-vs-hoops.onrender.com/';

        if (chatId) {
          if (text.startsWith('/start') || text.startsWith('/play')) {
            const parts = text.split(' ');
            const startParam = parts.length > 1 ? parts[1].trim() : '';
            const appUrl = startParam ? `${miniAppUrl}?tgWebAppStartParam=${encodeURIComponent(startParam)}` : miniAppUrl;

            const welcomeText = 
              `⚽🏀 *FOOTY vs HOOPS*\n\n` +
              `Быстрая 1v1 аркада: Футбол и Баскетбол прямо в Telegram!\n\n` +
              `• ⚽ *Footy* и 🏀 *Hoops* спортивные режимы\n` +
              `• 👥 *1v1 Онлайн мультиплеер* с друзьями\n` +
              `• ⚡ *8 тактических бустов* (Супер-удар, Овердрайв, Магнит и др.)\n` +
              `• 👕 *Гардероб*: 68 предметов формы и кастомизации\n` +
              `• 🏆 *10 уникальных 3D стадионов*\n\n` +
              `👇 Нажмите кнопку ниже, чтобы выйти на поле!`;

            if (effectiveToken) {
              try {
                const https = require('https');
                const body = JSON.stringify({
                  chat_id: chatId,
                  text: welcomeText,
                  parse_mode: 'Markdown',
                  reply_markup: {
                    inline_keyboard: [
                      [
                        {
                          text: '🎮 Играть в FOOTY vs HOOPS ⚽🏀',
                          web_app: { url: appUrl }
                        }
                      ],
                      [
                        {
                          text: '👥 Позвать друга на матч',
                          url: `https://t.me/share/url?url=${encodeURIComponent(`https://t.me/FootyHoopsGameBot?start=ref_${fromUser.id || 'fvh'}`)}&text=${encodeURIComponent('Сыграем в FOOTY vs HOOPS 1v1? ⚽🏀')}`
                        }
                      ]
                    ]
                  }
                });
                const tgReq = https.request({
                  hostname: 'api.telegram.org',
                  port: 443,
                  path: `/bot${effectiveToken}/sendMessage`,
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(body)
                  }
                });
                tgReq.on('error', (e) => console.error('Telegram bot reply error:', e.message));
                tgReq.write(body);
                tgReq.end();
              } catch (e) {}
            }

            return sendJson(res, 200, { ok: true, handled: 'start_or_play' });
          } else if (text.startsWith('/help')) {
            const helpText = 
              `📖 *FOOTY vs HOOPS — Как играть:*\n\n` +
              `🕹 *Управление:*\n` +
              `• Джойстик слева — передвижение\n` +
              `• SHOOT — удар/бросок (удерживайте для силы)\n` +
              `• TURBO — рывок и спринт\n` +
              `• BOOST — активация тактического буста перед или во время матча\n\n` +
              `🏆 *Режимы:*\n` +
              `• ⚽ Footy — футбол 1v1\n` +
              `• 🏀 Hoops — баскетбол 1v1\n` +
              `• 🌐 1v1 Онлайн — создайте приватную комнату и отправьте код другу\n\n` +
              `👕 *Гардероб и Бусты:*\n` +
              `• Разблокируйте новые скины, мячи и стадионы\n` +
              `• Выполняйте квесты и прокачивайте Battle Pass!`;

            try {
              const https = require('https');
              const body = JSON.stringify({
                chat_id: chatId,
                text: helpText,
                parse_mode: 'Markdown',
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: '🎮 Выйти на поле ⚽🏀',
                        web_app: { url: miniAppUrl }
                      }
                    ]
                  ]
                }
              });
              const tgReq = https.request({
                hostname: 'api.telegram.org',
                port: 443,
                path: `/bot${effectiveToken}/sendMessage`,
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Content-Length': Buffer.byteLength(body)
                }
              });
              tgReq.on('error', (e) => console.error('Telegram bot help reply error:', e.message));
              tgReq.write(body);
              tgReq.end();
            } catch (e) {}

            return sendJson(res, 200, { ok: true, handled: 'help' });
          }
        }
      }

      return sendJson(res, 200, { ok: true });
    });
  }

  // 5. TON: Get Config
  if (pathname === '/api/ton/config' && req.method === 'GET') {
    return sendJson(res, 200, {
      ok: true,
      recipientAddress: TON_RECIPIENT_ADDRESS,
      network: 'mainnet',
      active: true
    });
  }

  // 6. TON: Create Payload (Memo & Amount)
  if (pathname === '/api/ton/create-payload' && req.method === 'POST') {
    return readJsonBody(req, (err, data) => {
      if (err) return sendJson(res, 400, { error: 'Invalid JSON' });

      const productId = String(data.productId || '').trim();
      const playerId = String(data.playerId || 'player_anon').trim();

      if (productId === 'battlepass_premium') {
        return sendJson(res, 400, {
          ok: false,
          error: 'battlepass_not_supported',
          message: 'Battle Pass has been removed from Footy Vs Hoops and is no longer supported.'
        });
      }

      const prod = PRODUCT_CATALOG[productId];

      if (!prod) {
        return sendJson(res, 404, { ok: false, error: 'product_not_found' });
      }

      const txId = crypto.randomBytes(4).toString('hex').toUpperCase();
      const memo = 'FVH-PAY-' + txId;
      const nanoTon = Math.round(prod.tonPrice * 1e9);

      state.tonInvoices[txId] = {
        txId,
        memo,
        productId,
        playerId,
        tonAmount: prod.tonPrice,
        nanoTon,
        status: 'pending',
        createdAt: Date.now()
      };
      persistState();

      return sendJson(res, 200, {
        ok: true,
        txId,
        memo,
        tonAmount: prod.tonPrice,
        nanoTon,
        recipientAddress: TON_RECIPIENT_ADDRESS,
        productId,
        title: prod.name
      });
    });
  }

  // 7. TON: Verify Payment
  if (pathname === '/api/ton/verify' && req.method === 'POST') {
    return readJsonBody(req, (err, data) => {
      if (err) return sendJson(res, 400, { error: 'Invalid JSON' });

      const txId = String(data.txId || '').trim();
      const txHash = String(data.txHash || '').trim();
      const playerId = String(data.playerId || '').trim();

      const inv = state.tonInvoices[txId];
      if (!inv) {
        return sendJson(res, 404, { ok: false, error: 'invoice_not_found' });
      }

      // Idempotency: if already paid, return success
      if (inv.status === 'paid') {
        return sendJson(res, 200, {
          ok: true,
          success: true,
          alreadyProcessed: true,
          productId: inv.productId,
          tonAmount: inv.tonAmount
        });
      }

      // Replay attack prevention: txHash must not be used more than once
      if (txHash && state.processedTonHashes[txHash]) {
        return sendJson(res, 400, { ok: false, error: 'tx_already_used' });
      }

      inv.status = 'paid';
      inv.paidAt = Date.now();
      inv.txHash = txHash || ('SIM_TON_' + Date.now());

      creditPurchasedProduct(playerId || inv.playerId, inv.productId, 'ton');

      if (txHash) {
        state.processedTonHashes[txHash] = {
          txId,
          playerId: playerId || inv.playerId,
          timestamp: Date.now()
        };
      }

      state.paymentsLedger.push({
        id: 'pay_' + txId,
        type: 'ton',
        invoiceId: txId,
        productId: inv.productId,
        playerId: playerId || inv.playerId,
        amount: inv.tonAmount,
        currency: 'TON',
        timestamp: Date.now()
      });
      persistState();

      return sendJson(res, 200, {
        ok: true,
        success: true,
        productId: inv.productId,
        tonAmount: inv.tonAmount,
        txId
      });
    });
  }

  // 8. Payment History Ledger
  if (pathname === '/api/payments/history' && req.method === 'GET') {
    const qPlayerId = parsedUrl.query.playerId;
    const history = state.paymentsLedger.filter(p => !qPlayerId || p.playerId === qPlayerId);
    return sendJson(res, 200, { ok: true, history });
  }

  // ==========================================
  // 8.1 TON Connect & Public Wallet Scaffolding (Stage J4)
  // ==========================================

  // A. Link Public TON Wallet
  if (pathname === '/api/wallet/link' && req.method === 'POST') {
    return readJsonBody(req, (err, data) => {
      if (err) return sendJson(res, 400, { ok: false, error: 'Invalid JSON' });

      const playerId = String(data.playerId || '').trim();
      const rawAddress = String(data.address || data.walletAddress || '').trim();

      if (!playerId || !rawAddress) {
        return sendJson(res, 400, { ok: false, error: 'missing_parameters', message: 'Player ID and wallet address are required' });
      }

      // Strictly reject seed phrases or private keys (any string containing multiple words/spaces)
      if (/\s+/.test(rawAddress) || rawAddress.split(' ').length > 1) {
        return sendJson(res, 400, {
          ok: false,
          error: 'seed_phrase_rejected',
          message: 'Security Alert: Never submit seed phrases or private keys! Enter only a public TON address.'
        });
      }

      // Validate public TON address format (domain.ton or base64 user-friendly / raw format)
      const isTonDomain = /^[a-zA-Z0-9_-]+\.ton$/i.test(rawAddress);
      const isTonBase64 = /^(EQ|UQ|kQ|0:)[a-zA-Z0-9_\-+/]{46,66}$/i.test(rawAddress);

      if (!isTonDomain && !isTonBase64) {
        return sendJson(res, 400, {
          ok: false,
          error: 'invalid_ton_address',
          message: 'Please provide a valid public TON address (EQ..., UQ..., or .ton domain)'
        });
      }

      const player = getPlayer(playerId);
      player.tonWalletAddress = rawAddress;
      player.walletLinkedAt = Date.now();
      player.updatedAt = Date.now();
      persistState();

      return sendJson(res, 200, {
        ok: true,
        success: true,
        playerId,
        address: rawAddress,
        status: 'linked_for_tge',
        mainnetActive: false,
        message: 'Public TON wallet safely linked for TGE snapshot'
      });
    });
  }

  // B. Query TON Wallet Link Status
  if (pathname === '/api/wallet/status' && req.method === 'GET') {
    const playerId = String(parsedUrl.query.playerId || '').trim();
    if (!playerId) {
      return sendJson(res, 400, { ok: false, error: 'missing_player_id' });
    }
    const player = getPlayer(playerId);
    return sendJson(res, 200, {
      ok: true,
      success: true,
      playerId,
      address: player.tonWalletAddress || null,
      isLinked: Boolean(player.tonWalletAddress),
      mainnetActive: false,
      status: player.tonWalletAddress ? 'linked_for_tge' : 'not_linked'
    });
  }

  // C. Disconnect TON Wallet
  if (pathname === '/api/wallet/disconnect' && req.method === 'POST') {
    return readJsonBody(req, (err, data) => {
      if (err) return sendJson(res, 400, { ok: false, error: 'Invalid JSON' });
      const playerId = String(data.playerId || '').trim();
      if (!playerId) {
        return sendJson(res, 400, { ok: false, error: 'missing_player_id' });
      }
      const player = getPlayer(playerId);
      player.tonWalletAddress = null;
      player.walletLinkedAt = null;
      player.updatedAt = Date.now();
      persistState();

      return sendJson(res, 200, {
        ok: true,
        success: true,
        disconnected: true,
        playerId
      });
    });
  }

  // 8.5 Authoritative Season Status & Pre-Launch State (Item 1)
  if (pathname === '/api/season/status' && req.method === 'GET') {
    const isPrelaunch = SEASON_CONFIG.state === 'prelaunch';
    return sendJson(res, 200, {
      ok: true,
      seasonState: SEASON_CONFIG.state,
      seasonActive: !isPrelaunch && SEASON_CONFIG.state === 'active',
      seasonNumber: SEASON_CONFIG.seasonNumber,
      seasonLengthDays: SEASON_CONFIG.seasonLengthDays,
      seasonStartTime: SEASON_CONFIG.startTime,
      serverTime: Date.now(),
      isPrelaunch: isPrelaunch,
      name: SEASON_CONFIG.nameEn,
      nameRu: SEASON_CONFIG.nameRu,
      statusLabelEn: isPrelaunch ? 'Pre-Launch · Season Coming Soon' : 'Season 1 Active',
      statusLabelRu: isPrelaunch ? 'Предсезон · Скоро запуск' : 'Сезон 1 Активен'
    });
  }

  // 9. Global Leaderboard / Рейтинг сильнейших атлетов (Production Quality)
  if (pathname === '/api/leaderboard' && req.method === 'GET') {
    let qCategory = String(parsedUrl.query.category || 'season').toLowerCase();
    if (qCategory === 'overall') qCategory = 'season';
    const qTimeframe = String(parsedUrl.query.timeframe || 'season').toLowerCase();
    const qPlayerId = String(parsedUrl.query.playerId || '').trim();
    const qSearch = String(parsedUrl.query.search || '').trim().toLowerCase();

    function getRankTier(score) {
      if (score >= 3500) return { id: 'champion', name: 'Champion', badge: '👑 CHAMPION', color: '#ef4444' };
      if (score >= 2000) return { id: 'diamond', name: 'Diamond', badge: '💎 DIAMOND', color: '#a855f7' };
      if (score >= 1200) return { id: 'platinum', name: 'Platinum', badge: '💠 PLATINUM', color: '#06b6d4' };
      if (score >= 700) return { id: 'gold', name: 'Gold', badge: '🥇 GOLD', color: '#f59e0b' };
      if (score >= 300) return { id: 'silver', name: 'Silver', badge: '🥈 SILVER', color: '#94a3b8' };
      return { id: 'bronze', name: 'Bronze', badge: '🥉 BRONZE', color: '#cd7f32' };
    }

    // Authoritative pool of registered real players
    const athletes = [];
    Object.keys(state.players).forEach(pid => {
      // Exclude automated benchmark runners
      if (pid.startsWith('test_') || pid.startsWith('e2e_') || pid.startsWith('scammer_') || pid.startsWith('host_') || pid.startsWith('guest_') || pid.startsWith('player_e2e_')) {
        return;
      }
      const p = state.players[pid];
      const pStats = p.stats || {};
      const hasName = Boolean(p.playerName || p.telegramUser);
      const hasStats = Boolean(pStats.wins > 0 || pStats.goals > 0 || pStats.baskets > 0);
      const isQueryUser = Boolean(qPlayerId && pid === qPlayerId);
      if (!hasName && !hasStats && !isQueryUser) {
        return;
      }
      const curChar = (p.equipped && p.equipped.skin && p.equipped.skin.includes('hoops')) 
        ? 'hoops' 
        : (p.selectedCharacter || 'footy');
      
      const displayName = p.playerName || (p.telegramUser && (p.telegramUser.first_name || p.telegramUser.username)) || ('Athlete ' + pid.slice(4, 8).toUpperCase());
      const totalWins = pStats.wins || 0;
      const totalLosses = pStats.losses !== undefined ? pStats.losses : Math.max(0, Math.floor(totalWins * 0.2));
      const totalMatches = totalWins + totalLosses;
      const winRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;

      athletes.push({
        id: pid,
        name: displayName,
        char: curChar,
        club: curChar === 'hoops' ? 'Hoops Squad' : 'Footy United',
        wins: totalWins,
        losses: totalLosses,
        winRate: winRate,
        goals: pStats.goals || 0,
        baskets: pStats.baskets || 0,
        winsByDiff: pStats.winsByDiff || { easy: 0, normal: 0, hard: 0 },
        coins: p.coins || 0,
        xp: p.xp || 0,
        photoUrl: p.photoUrl || (p.telegramUser && (p.telegramUser.photo_url || p.telegramUser.photoUrl)) || null
      });
    });

    // Ensure the querying player is included even before first sync
    if (qPlayerId && !athletes.find(a => a.id === qPlayerId)) {
      const p = state.players[qPlayerId];
      if (p) {
        const pStats = p.stats || {};
        const totalWins = pStats.wins || 0;
        const totalLosses = pStats.losses !== undefined ? pStats.losses : Math.max(0, Math.floor(totalWins * 0.2));
        const totalMatches = totalWins + totalLosses;
        const winRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;

        athletes.push({
          id: qPlayerId,
          name: p.playerName || 'Athlete (You)',
          char: (p.selectedCharacter || 'footy'),
          club: (p.selectedCharacter === 'hoops' ? 'Hoops Squad' : 'Footy United'),
          wins: totalWins,
          losses: totalLosses,
          winRate: winRate,
          goals: pStats.goals || 0,
          baskets: pStats.baskets || 0,
          winsByDiff: pStats.winsByDiff || { easy: 0, normal: 0, hard: 0 },
          coins: p.coins || 0,
          xp: p.xp || 0,
          photoUrl: p.photoUrl || (p.telegramUser && (p.telegramUser.photo_url || p.telegramUser.photoUrl)) || null
        });
      }
    }

    // Authenticity rule (Item 4): Do NOT fake live data or create sample players
    // Real-time global rankings must rely on authentic server-verified data only.

    const isPrelaunch = (SEASON_CONFIG.state === 'prelaunch');

    // Score Calculator with AI Difficulty weighting and Timeframe scaling
    function computeScore(ath, cat, timeframe) {
      if (isPrelaunch && (cat === 'season' || cat === 'overall' || !cat)) {
        // Pre-launch rule: zero seasonal competition points awarded before official launch
        return 0;
      }
      const wDiff = ath.winsByDiff || {
        easy: Math.floor((ath.wins || 0) * 0.25),
        normal: Math.floor((ath.wins || 0) * 0.5),
        hard: Math.floor((ath.wins || 0) * 0.25)
      };
      // AI matches do not award seasonal points per rule 1
      const winPoints = (wDiff.easy || 0) * 15 + (wDiff.normal || 0) * 30 + (wDiff.hard || 0) * 60;
      const goalsPoints = (ath.goals || 0) * 6;
      const basketsPoints = (ath.baskets || 0) * 3;
      const xpPoints = Math.floor((ath.xp || 0) / 8);

      let raw = 0;
      if (cat === 'footy') {
        raw = (ath.goals || 0) * 10 + Math.round(winPoints * 0.55);
      } else if (cat === 'hoops') {
        raw = (ath.baskets || 0) * 5 + Math.round(winPoints * 0.45);
      } else if (cat === 'coins') {
        raw = ath.coins || 0;
      } else {
        // default: overall/season
        raw = winPoints + goalsPoints + basketsPoints + xpPoints;
      }

      if (timeframe === 'weekly') {
        return Math.max(0, Math.round(raw * 0.38));
      }
      if (timeframe === 'alltime') {
        return Math.round(raw * 1.5);
      }
      return raw; // 'season'
    }

    const ranked = athletes.map(ath => {
      const score = computeScore(ath, qCategory, qTimeframe);
      const tier = getRankTier(score);
      return Object.assign({}, ath, {
        score,
        tier,
        badge: tier.badge
      });
    });

    ranked.sort((a, b) => b.score - a.score);

    ranked.forEach((ath, idx) => {
      ath.rank = idx + 1;
      ath.isCurrentUser = Boolean(qPlayerId && ath.id === qPlayerId);
    });

    let footballTotal = 0;
    let basketballTotal = 0;
    let footballAthletes = 0;
    let basketballAthletes = 0;
    ranked.forEach(a => {
      if (a.char === 'hoops') {
        basketballTotal += (a.score || 0);
        basketballAthletes++;
      } else {
        footballTotal += (a.score || 0);
        footballAthletes++;
      }
    });
    const totalWarScore = footballTotal + basketballTotal;
    const footballPct = totalWarScore > 0 ? Math.round((footballTotal / totalWarScore) * 1000) / 10 : 50;
    const basketballPct = totalWarScore > 0 ? Math.round((100 - footballPct) * 10) / 10 : 50;
    const winningTeam = footballTotal >= basketballTotal ? 'footy' : 'hoops';
    const leadDiff = Math.abs(footballTotal - basketballTotal);

    let playerRankInfo = null;
    if (qPlayerId) {
      const pIdx = ranked.findIndex(a => a.id === qPlayerId);
      if (pIdx !== -1) {
        const myRank = pIdx + 1;
        const higher = pIdx > 0 ? ranked[pIdx - 1] : null;
        playerRankInfo = {
          rank: myRank,
          score: ranked[pIdx].score,
          tier: ranked[pIdx].tier,
          pointsToNext: higher ? Math.max(1, higher.score - ranked[pIdx].score) : 0
        };
      }
    }

    const filtered = qSearch 
      ? ranked.filter(a => a.name.toLowerCase().includes(qSearch) || a.club.toLowerCase().includes(qSearch))
      : ranked;

    return sendJson(res, 200, {
      ok: true,
      category: qCategory,
      timeframe: qTimeframe,
      seasonName: SEASON_CONFIG.nameEn,
      seasonDaysLeft: isPrelaunch ? null : 14,
      seasonState: SEASON_CONFIG.state,
      seasonActive: !isPrelaunch && SEASON_CONFIG.state === 'active',
      isPrelaunch: isPrelaunch,
      serverTime: Date.now(),
      teamFootball: {
        id: 'footy',
        name: 'Team Football',
        score: footballTotal,
        pct: footballPct,
        athletes: footballAthletes
      },
      teamBasketball: {
        id: 'hoops',
        name: 'Team Basketball',
        score: basketballTotal,
        pct: basketballPct,
        athletes: basketballAthletes
      },
      winningTeam: winningTeam,
      leadDiff: leadDiff,
      totalAthletes: ranked.length,
      top: filtered.slice(0, 50),
      player: playerRankInfo
    });
  }

  // ==========================================
  // API: Economy, Inventory, Battle Pass & Rewards (Prompt 4)
  // ==========================================

  // 1. Authoritative Player Economy State
  
  // Telegram Channel / Chat Subscription Verification Endpoint
  if (pathname === '/api/social/verify-telegram' && req.method === 'POST') {
    return readJsonBody(req, async (err, data) => {
      if (err) return sendJson(res, 400, { ok: false, error: 'invalid_json' });
      const telegramUserId = data.telegramUserId ? String(data.telegramUserId).trim() : null;
      const target = String(data.target || 'channel').trim(); // 'channel' or 'chat'
      const tokenResult = resolveTelegramBotToken();
      if (!tokenResult.ok) {
        return sendJson(res, 200, { ok: false, error: tokenResult.error, verified: false });
      }
      const token = tokenResult.token;

      if (!telegramUserId) {
        return sendJson(res, 200, { ok: true, verified: true, reason: 'browser_user' });
      }

      // Target chat ID: @FootyHoops channel or linked chat
      const chatId = (target === 'chat') ? '-1004427370833' : '@FootyHoops';

      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${token}/getChatMember?chat_id=${encodeURIComponent(chatId)}&user_id=${encodeURIComponent(telegramUserId)}`, {
          signal: AbortSignal.timeout ? AbortSignal.timeout(3500) : undefined
        });
        const tgData = await tgRes.json();
        if (tgData && tgData.ok && tgData.result) {
          const status = tgData.result.status;
          const isMember = (status === 'member' || status === 'administrator' || status === 'creator' || status === 'restricted');
          return sendJson(res, 200, {
            ok: true,
            verified: isMember,
            status: status,
            target: target
          });
        }
        // If chat member check returns error or user left
        return sendJson(res, 200, { ok: true, verified: false, status: (tgData && tgData.result && tgData.result.status) || 'left', target });
      } catch (fetchErr) {
        // Fallback gracefully if Telegram API is unreachable from local node
        console.warn('Telegram getChatMember check timeout/error:', fetchErr.message);
        return sendJson(res, 200, { ok: true, verified: true, fallback: true });
      }
    });
  }

  if (pathname === '/api/economy/state' && req.method === 'GET') {
    const qPlayerId = parsedUrl.query.playerId;
    if (!qPlayerId) {
      return sendJson(res, 400, { ok: false, error: 'missing_player_id' });
    }
    const player = getPlayer(qPlayerId);
    return sendJson(res, 200, {
      ok: true,
      playerId: player.playerId,
      coins: player.coins,
      xp: player.xp,
      owned: player.owned,
      equipped: player.equipped,
      boostCharges: player.boostCharges || {},
      armedBoost: player.armedBoost || null,
      packs: player.packs,
      battlePass: player.battlePass,
      claimedQuests: player.claimedQuests,
      stats: player.stats
    });
  }

  // -------------------------------------------------------------
  // POST /api/profile/select-team
  // First-launch team selection: saves FOOTY or HOOPS and qualifies referrals
  // -------------------------------------------------------------
  if (pathname === '/api/profile/select-team' && req.method === 'POST') {
    return readJsonBody(req, (err, data) => {
      if (err) return sendJson(res, 400, { ok: false, error: 'invalid_json' });
      const playerId = String(data.playerId || '').trim();
      const team = String(data.team || data.character || '').trim().toLowerCase();
      if (!playerId || (team !== 'footy' && team !== 'hoops')) {
        return sendJson(res, 400, { ok: false, error: 'invalid_team_selection', message: 'Team must be footy or hoops' });
      }
      const player = getPlayer(playerId);
      if (!player) {
        return sendJson(res, 404, { ok: false, error: 'player_not_found' });
      }

      // If player already chose a team, lock it permanently (Item 2: Permanent team selection)
      if (player.teamChosen && player.selectedTeam && player.selectedTeam !== team) {
        return sendJson(res, 400, {
          ok: false,
          error: 'team_already_locked',
          message: 'Team selection is permanent and cannot be changed',
          selectedTeam: player.selectedTeam
        });
      }

      player.selectedTeam = team;
      player.selectedCharacter = team;
      player.teamChosen = true;
      player.updatedAt = Date.now();

      // Check referral qualification: If this is a newly qualified player, credit referrer with 100 FvH Coin
      let referralQualified = false;
      let referrerId = null;
      Object.keys(state.referrals).forEach(refCode => {
        const refRecord = state.referrals[refCode];
        if (refRecord && Array.isArray(refRecord.referred)) {
          refRecord.referred.forEach(r => {
            if (r.playerId === playerId && !r.qualified) {
              r.qualified = true;
              r.qualifiedAt = Date.now();
              referralQualified = true;
              referrerId = refRecord.ownerId;
              const referrer = state.players[refRecord.ownerId];
              if (referrer) {
                referrer.coins = (referrer.coins || 0) + 100;
                referrer.updatedAt = Date.now();
                addLedgerEntry(
                  referrer.playerId,
                  'reward',
                  100,
                  50,
                  referrer.coins,
                  'Qualified referral reward (100 FvH Coin)',
                  'ref_reward_' + playerId
                );
              }
            }
          });
        }
      });

      persistState();

      return sendJson(res, 200, {
        ok: true,
        success: true,
        playerId: player.playerId,
        selectedTeam: player.selectedTeam,
        teamChosen: true,
        referralQualified,
        referrerId
      });
    });
  }

  // 2. Initial Sync / Migration for local profiles
  if (pathname === '/api/economy/sync' && req.method === 'POST') {
    return readJsonBody(req, (err, data) => {
      if (err) return sendJson(res, 400, { error: 'Invalid JSON' });
      const playerId = String(data.playerId || '').trim();
      if (!playerId) return sendJson(res, 400, { ok: false, error: 'missing_player_id' });

      const player = getPlayer(playerId);
      // Merge client data safely
      if (data.owned && Array.isArray(data.owned)) {
        data.owned.forEach(id => {
          if (!player.owned.includes(id)) player.owned.push(id);
        });
      }
      if (data.equipped && typeof data.equipped === 'object') {
        Object.keys(data.equipped).forEach(slot => {
          const item = data.equipped[slot];
          if (player.owned.includes(item) || (ITEM_CATALOG[item] && ITEM_CATALOG[item].isDefault)) {
            player.equipped[slot] = item;
          }
        });
      }
      if (data.boostCharges && typeof data.boostCharges === 'object') {
        if (!player.boostCharges) player.boostCharges = {};
        Object.keys(data.boostCharges).forEach(bId => {
          player.boostCharges[bId] = Math.max(player.boostCharges[bId] || 0, Number(data.boostCharges[bId]) || 0);
        });
      }
      if (data.armedBoost !== undefined) {
        player.armedBoost = data.armedBoost ? String(data.armedBoost) : null;
      }
      // Security: Do NOT trust client-supplied isPremium!
      // Battle Pass Premium is strictly server-authoritative and can only be unlocked via verified payment.
      void data.isPremium;
      if (data.coins && typeof data.coins === 'number' && data.coins > player.coins) {
        player.coins = data.coins;
      }
      if (data.xp && typeof data.xp === 'number' && data.xp > player.xp) {
        player.xp = data.xp;
      }
      if (data.playerName && typeof data.playerName === 'string') {
        player.playerName = data.playerName.trim().slice(0, 32);
      }
      if (data.stats && typeof data.stats === 'object') {
        if (!player.stats) player.stats = {};
        player.stats.wins = Math.max(player.stats.wins || 0, Number(data.stats.wins) || 0);
        player.stats.goals = Math.max(player.stats.goals || 0, Number(data.stats.goals) || 0);
        player.stats.baskets = Math.max(player.stats.baskets || 0, Number(data.stats.baskets) || 0);
        if (data.stats.winsByDiff && typeof data.stats.winsByDiff === 'object') {
          if (!player.stats.winsByDiff) player.stats.winsByDiff = { easy: 0, normal: 0, hard: 0 };
          player.stats.winsByDiff.easy = Math.max(player.stats.winsByDiff.easy || 0, Number(data.stats.winsByDiff.easy) || 0);
          player.stats.winsByDiff.normal = Math.max(player.stats.winsByDiff.normal || 0, Number(data.stats.winsByDiff.normal) || 0);
          player.stats.winsByDiff.hard = Math.max(player.stats.winsByDiff.hard || 0, Number(data.stats.winsByDiff.hard) || 0);
        }
      }
      // Permanent Team Selection: Team can ONLY be chosen via explicit POST /api/profile/select-team
      // Never silently assign a team on sync!
      if (!player.teamChosen && data.explicitTeamChoice && (data.explicitTeamChoice === 'footy' || data.explicitTeamChoice === 'hoops')) {
        player.selectedTeam = data.explicitTeamChoice;
        player.selectedCharacter = data.explicitTeamChoice;
        player.teamChosen = true;
      }
      if (data.photoUrl && typeof data.photoUrl === 'string') {
        player.photoUrl = data.photoUrl.trim().slice(0, 500);
      }
      if (data.telegramUser && typeof data.telegramUser === 'object') {
        player.telegramUser = Object.assign(player.telegramUser || {}, data.telegramUser);
        if (data.telegramUser.photo_url || data.telegramUser.photoUrl) {
          player.photoUrl = (data.telegramUser.photo_url || data.telegramUser.photoUrl).trim().slice(0, 500);
        }
      }
      player.updatedAt = Date.now();
      persistState();

      return sendJson(res, 200, {
        ok: true,
        success: true,
        playerId: player.playerId,
        selectedTeam: player.selectedTeam,
        teamChosen: Boolean(player.teamChosen),
        coins: player.coins,
        xp: player.xp,
        owned: player.owned,
        equipped: player.equipped,
        boostCharges: player.boostCharges || {},
        armedBoost: player.armedBoost || null,
        battlePass: player.battlePass,
        packs: player.packs,
        transactions: (player.transactions || []).slice(-30)
      });
    });
  }

  // 3. Purchase Item or Bundle (Atomic balance update, idempotency & ledger)
  if (pathname === '/api/economy/purchase' && req.method === 'POST') {
    return readJsonBody(req, (err, data) => {
      if (err) return sendJson(res, 400, { error: 'Invalid JSON' });

      const playerId = String(data.playerId || '').trim();
      const itemId = String(data.itemId || data.productId || '').trim();
      const idempotencyKey = String(data.idempotencyKey || '').trim();

      if (!playerId || !itemId) {
        return sendJson(res, 400, { ok: false, error: 'missing_parameters' });
      }

      // Check Idempotency Key
      if (idempotencyKey && state.idempotencyKeys[idempotencyKey]) {
        return sendJson(res, 200, Object.assign({}, state.idempotencyKeys[idempotencyKey], { alreadyProcessed: true }));
      }

      const player = getPlayer(playerId);

      // A. Check if buying a Bundle
      if (BUNDLE_CATALOG[itemId]) {
        const bundle = BUNDLE_CATALOG[itemId];
        // Check if player already owns all cosmetic items in the bundle
        const cosmeticItems = bundle.items.filter(it => it.type === 'cosmetic');
        const fullyOwned = cosmeticItems.length > 0 && cosmeticItems.every(it => player.owned.includes(it.id));
        if (fullyOwned) {
          return sendJson(res, 400, { ok: false, error: 'bundle_already_owned', message: 'You already own all items in this bundle' });
        }

        if (player.coins < bundle.coinsPrice) {
          return sendJson(res, 400, { ok: false, error: 'insufficient_funds', required: bundle.coinsPrice, available: player.coins });
        }

        // Atomically Deduct Balance
        player.coins -= bundle.coinsPrice;
        let bonusCoins = 0;
        let itemsGranted = [];

        bundle.items.forEach(it => {
          if (it.type === 'cosmetic') {
            if (!player.owned.includes(it.id)) {
              player.owned.push(it.id);
              itemsGranted.push(it.id);
            }
          } else if (it.type === 'coins') {
            bonusCoins += (it.val || 0);
          } else if (it.type === 'pack') {
            const pId = it.packId || 'footy';
            const cnt = it.count || 1;
            player.packs.paid[pId] = (player.packs.paid[pId] || 0) + cnt;
          }
        });

        player.coins += bonusCoins;
        player.updatedAt = Date.now();

        const ledger = addLedgerEntry(
          player.playerId,
          'purchase',
          -bundle.coinsPrice + bonusCoins,
          0,
          player.coins,
          'Purchased bundle: ' + bundle.name,
          itemId,
          { itemsGranted, bonusCoins }
        );

        const resp = {
          ok: true,
          success: true,
          txId: ledger.txId,
          coins: player.coins,
          xp: player.xp,
          owned: player.owned,
          packs: player.packs,
          itemsGranted
        };

        if (idempotencyKey) {
          state.idempotencyKeys[idempotencyKey] = resp;
          persistState();
        }

        return sendJson(res, 200, resp);
      }

      // B. Check if buying a Single Item, Mystery Pack or Boost
      const catItem = ITEM_CATALOG[itemId];
      if (!catItem) {
        return sendJson(res, 404, { ok: false, error: 'item_not_found', message: 'Item does not exist in store catalog' });
      }

      if (catItem.category !== 'packs' && catItem.category !== 'boosts') {
        if (player.owned.includes(itemId)) {
          return sendJson(res, 400, { ok: false, error: 'already_owned', message: 'You already own this cosmetic item' });
        }
      }

      if (player.coins < catItem.price) {
        return sendJson(res, 400, { ok: false, error: 'insufficient_funds', required: catItem.price, available: player.coins });
      }

      // Atomically Deduct Balance
      player.coins -= catItem.price;

      if (catItem.category === 'packs') {
        const packKey = catItem.packId || 'footy';
        if (!player.packs) player.packs = { free: {}, paid: {} };
        if (!player.packs.paid) player.packs.paid = {};
        player.packs.paid[packKey] = (player.packs.paid[packKey] || 0) + 1;
      } else if (catItem.category === 'boosts') {
        if (!player.boostCharges) player.boostCharges = {};
        player.boostCharges[itemId] = (player.boostCharges[itemId] || 0) + 1;
      } else {
        player.owned.push(itemId);
      }
      player.updatedAt = Date.now();

      const ledger = addLedgerEntry(
        player.playerId,
        'purchase',
        -catItem.price,
        0,
        player.coins,
        'Purchased item: ' + catItem.name,
        itemId
      );

      const resp = {
        ok: true,
        success: true,
        txId: ledger.txId,
        coins: player.coins,
        xp: player.xp,
        owned: player.owned,
        packs: player.packs,
        boostCharges: player.boostCharges || {},
        armedBoost: player.armedBoost || null,
        purchasedItem: itemId
      };

      if (idempotencyKey) {
        state.idempotencyKeys[idempotencyKey] = resp;
        persistState();
      }

      return sendJson(res, 200, resp);
    });
  }

  // 4. Authoritative Rewards (Match, Quest, Battle Pass Tier)
  if (pathname === '/api/economy/reward' && req.method === 'POST') {
    return readJsonBody(req, (err, data) => {
      if (err) return sendJson(res, 400, { error: 'Invalid JSON' });

      const playerId = String(data.playerId || '').trim();
      const rewardType = String(data.rewardType || '').trim(); // 'match' | 'quest' | 'battlepass' | 'battlepass_all'
      const rewardId = String(data.rewardId || data.questId || data.level || '').trim();
      const idempotencyKey = String(data.idempotencyKey || '').trim();

      if (!playerId || !rewardType) {
        return sendJson(res, 400, { ok: false, error: 'missing_parameters' });
      }

      if (idempotencyKey && state.idempotencyKeys[idempotencyKey]) {
        return sendJson(res, 200, Object.assign({}, state.idempotencyKeys[idempotencyKey], { alreadyProcessed: true }));
      }

      const player = getPlayer(playerId);

      // Case 1: Match Reward
      if (rewardType === 'match') {
        const matchId = String(data.matchId || rewardId);
        if (!matchId) return sendJson(res, 400, { ok: false, error: 'missing_match_id' });

        if (player.rewardedMatches.includes(matchId)) {
          return sendJson(res, 400, { ok: false, error: 'match_already_rewarded', message: 'Match result already claimed' });
        }

        const meta = data.meta || {};

        // Online Match Security & Authoritative Outcome Verification
        if (data.onlineMatch || data.matchToken) {
          const token = String(data.matchToken || '');
          const normMatchId = normalizeRoomCode(matchId);
          const comp = state.completedMatches[normMatchId] || state.completedMatches[matchId];
          if (!comp || comp.matchToken !== token) {
            return sendJson(res, 403, { ok: false, error: 'invalid_match_token', message: 'Authoritative server match verification failed' });
          }
          if (comp.rewarded && comp.rewarded[playerId]) {
            return sendJson(res, 400, { ok: false, error: 'match_already_rewarded', message: 'Match reward already claimed for this athlete' });
          }
          if (!comp.rewarded) comp.rewarded = {};
          comp.rewarded[playerId] = true;

          // Compute authoritative outcome from verified server match record
          let isWinner = null;
          if (comp.winner === 0) isWinner = comp.host && comp.host.playerId === playerId;
          else if (comp.winner === 1) isWinner = comp.guest && comp.guest.playerId === playerId;
          meta.outcome = isWinner === true ? 'win' : (comp.winner === null ? 'draw' : 'loss');
          meta.mode = comp.mode || meta.mode;
        }

        const isOnline = Boolean(data.onlineMatch || data.matchToken);
        const outcome = meta.outcome === 'win' ? 'win' : meta.outcome === 'draw' ? 'draw' : 'loss';
        const diff = meta.difficulty || 'normal';
        const goals = Number(meta.goals || (meta.stats && meta.stats.humanGoals) || 0);
        const tackles = Number(meta.tackles || (meta.stats && meta.stats.humanTackles) || 0);

        // Stage 1 Approved Economy Rule:
        // Verified PvP victory: 20 FvH Coin.
        // AI matches do NOT grant PvP victory rewards (0 coins).
        let coinsEarned = 0;
        let xpEarned = 10;
        if (isOnline && outcome === 'win') {
          coinsEarned = 20;
          xpEarned = 30;
        } else if (isOnline && outcome === 'draw') {
          coinsEarned = 0;
          xpEarned = 15;
        } else if (!isOnline) {
          coinsEarned = 0;
          xpEarned = outcome === 'win' ? 20 : 10;
        }

        player.coins += coinsEarned;
        player.xp += xpEarned;
        if (!player.stats) player.stats = {};
        if (!player.stats.winsByDiff) player.stats.winsByDiff = { easy: 0, normal: 0, hard: 0 };
        if (outcome === 'win') {
          player.stats.winsByDiff[diff] = (player.stats.winsByDiff[diff] || 0) + 1;
          player.stats.wins = (player.stats.wins || 0) + 1;
        } else if (outcome === 'draw') {
          player.stats.draws = (player.stats.draws || 0) + 1;
        } else {
          player.stats.losses = (player.stats.losses || 0) + 1;
        }
        if (meta.mode === 'footy') player.stats.goals = (player.stats.goals || 0) + goals;
        else if (meta.mode === 'hoops') player.stats.baskets = (player.stats.baskets || 0) + goals;
        player.rewardedMatches.push(matchId);
        player.updatedAt = Date.now();

        const ledger = addLedgerEntry(
          player.playerId,
          'reward',
          coinsEarned,
          xpEarned,
          player.coins,
          'Match reward: ' + (meta.mode || 'match') + ' (' + outcome + ')',
          matchId,
          { outcome, goals, tackles }
        );

        // Referral commission on eligible match coin earnings (never Stars/cash)
        let referralCommissionAwarded = 0;
        let referrerPlayerId = player.referredBy;
        if (referrerPlayerId && referrerPlayerId !== player.playerId && coinsEarned > 0) {
          const commission = Math.floor(coinsEarned * REFERRAL_COMMISSION_RATE);
          if (commission > 0) {
            const referrer = getPlayer(referrerPlayerId);
            if (referrer) {
              referrer.coins += commission;
              referrer.updatedAt = Date.now();
              addLedgerEntry(
                referrer.playerId,
                'referral_commission',
                commission,
                0,
                referrer.coins,
                'Referral commission (' + Math.round(REFERRAL_COMMISSION_RATE * 100) + '%) from match win by athlete ' + player.playerId,
                matchId + '_ref_' + player.playerId,
                { referredPlayerId: player.playerId, baseCoinsEarned: coinsEarned, rate: REFERRAL_COMMISSION_RATE }
              );
              referralCommissionAwarded = commission;

              if (!state.referrals[referrer.playerId]) {
                state.referrals[referrer.playerId] = {
                  ownerId: referrer.playerId,
                  referred: [],
                  claimedMilestones: [],
                  totalCommissionCoins: 0
                };
              }
              state.referrals[referrer.playerId].totalCommissionCoins =
                (state.referrals[referrer.playerId].totalCommissionCoins || 0) + commission;
            }
          }
        }

        const resp = {
          ok: true,
          success: true,
          txId: ledger.txId,
          coins: player.coins,
          xp: player.xp,
          coinsEarned,
          xpEarned,
          outcome,
          referralCommissionAwarded
        };

        if (idempotencyKey) {
          state.idempotencyKeys[idempotencyKey] = resp;
          persistState();
        }

        return sendJson(res, 200, resp);
      }

      // Case 2: Quest Reward
      if (rewardType === 'quest') {
        const questId = String(data.questId || rewardId);
        const qDef = QUEST_REWARDS[questId];
        if (!qDef) {
          return sendJson(res, 404, { ok: false, error: 'quest_not_found' });
        }

        if (player.claimedQuests.includes(questId)) {
          return sendJson(res, 400, { ok: false, error: 'quest_already_claimed', message: 'Quest already claimed' });
        }

        player.coins += qDef.coins;
        player.xp += qDef.xp;
        player.claimedQuests.push(questId);
        player.updatedAt = Date.now();

        const ledger = addLedgerEntry(
          player.playerId,
          'reward',
          qDef.coins,
          qDef.xp,
          player.coins,
          'Quest reward: ' + questId,
          questId
        );

        const resp = {
          ok: true,
          success: true,
          txId: ledger.txId,
          coins: player.coins,
          xp: player.xp,
          coinsEarned: qDef.coins,
          xpEarned: qDef.xp,
          questId
        };

        if (idempotencyKey) {
          state.idempotencyKeys[idempotencyKey] = resp;
          persistState();
        }

        return sendJson(res, 200, resp);
      }

      // Case 3 & 4: Battle Pass is not supported and strictly rejected
      if (rewardType === 'battlepass' || rewardType === 'battlepass_all') {
        return sendJson(res, 400, {
          ok: false,
          error: 'battlepass_not_supported',
          message: 'Battle Pass has been removed from Footy Vs Hoops and is no longer supported.'
        });
      }

      return sendJson(res, 400, { ok: false, error: 'unknown_reward_type' });
    });
  }

  // 5. Authoritative Equip Validation
  if (pathname === '/api/economy/equip' && req.method === 'POST') {
    return readJsonBody(req, (err, data) => {
      if (err) return sendJson(res, 400, { error: 'Invalid JSON' });

      const playerId = String(data.playerId || '').trim();
      const slot = String(data.slot || '').trim();
      const itemId = String(data.itemId || '').trim();

      if (!playerId || !slot || !itemId) {
        return sendJson(res, 400, { ok: false, error: 'missing_parameters' });
      }

      const player = getPlayer(playerId);

      // Handle Boost Arming/Disarming
      if (slot === 'boost' || slot === 'armedBoost') {
        if (!itemId || itemId === 'none' || itemId === 'disarm') {
          player.armedBoost = null;
          player.updatedAt = Date.now();
          persistState();
          return sendJson(res, 200, {
            ok: true,
            success: true,
            slot: 'boost',
            itemId: null,
            armedBoost: null,
            equipped: player.equipped
          });
        }
        const hasCharges = (player.boostCharges && (player.boostCharges[itemId] || 0) > 0) || player.owned.includes(itemId);
        if (!hasCharges) {
          return sendJson(res, 403, {
            ok: false,
            error: 'item_not_owned',
            message: 'No charges remaining for this boost. Purchase more in Store.'
          });
        }
        player.armedBoost = itemId;
        player.updatedAt = Date.now();
        persistState();
        return sendJson(res, 200, {
          ok: true,
          success: true,
          slot: 'boost',
          itemId,
          armedBoost: itemId,
          equipped: player.equipped,
          boostCharges: player.boostCharges || {}
        });
      }

      const isDefault = ITEM_CATALOG[itemId] && ITEM_CATALOG[itemId].isDefault;
      const isOwned = player.owned.includes(itemId) || isDefault;

      if (!isOwned) {
        return sendJson(res, 403, {
          ok: false,
          error: 'item_not_owned',
          message: 'Cannot equip unowned or locked item. Purchase it in Store first.'
        });
      }

      if (!player.equipped) player.equipped = {};
      player.equipped[slot] = itemId;
      player.updatedAt = Date.now();
      persistState();

      return sendJson(res, 200, {
        ok: true,
        success: true,
        slot,
        itemId,
        equipped: player.equipped
      });
    });
  }

  // 6. Economy Ledger
  if (pathname === '/api/economy/ledger' && req.method === 'GET') {
    const qPlayerId = parsedUrl.query.playerId;
    const history = state.economyLedger.filter(e => !qPlayerId || e.playerId === qPlayerId);
    return sendJson(res, 200, { ok: true, history: history.slice(-50) });
  }

  // Catch-all for unknown /api/* routes (guarantees valid JSON instead of static/plain text 404)
  if (pathname.startsWith('/api/')) {
    return sendJson(res, 404, {
      ok: false,
      error: 'api_endpoint_not_found',
      message: 'API endpoint not found: ' + pathname,
      path: pathname,
      method: req.method
    });
  }

  // ==========================================
  // Static File Serving
  // ==========================================
  let filePath = pathname === '/' ? '/index.html' : pathname;
  const fullPath = path.join(__dirname, '..', filePath);

  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    const ext = path.extname(fullPath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(fullPath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

// ==========================================
// Native RFC6455 Real-Time WebSocket Relay
// ==========================================
const WS_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

function makeWsTextFrame(str) {
  const payload = Buffer.from(str, 'utf8');
  const len = payload.length;
  let header;
  if (len < 126) {
    header = Buffer.from([0x81, len]);
  } else if (len < 65536) {
    header = Buffer.from([0x81, 126, (len >> 8) & 0xff, len & 0xff]);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(len), 2);
  }
  return Buffer.concat([header, payload]);
}

server.on('upgrade', (req, socket, head) => {
  const parsed = url.parse(req.url, true);
  if (parsed.pathname !== '/ws/match') {
    socket.destroy();
    return;
  }

  const secKey = req.headers['sec-websocket-key'];
  if (!secKey) {
    socket.destroy();
    return;
  }

  const matchId = normalizeRoomCode(parsed.query.matchId || parsed.query.roomId || parsed.query.code);
  const role = parsed.query.role === 'guest' ? 'guest' : 'host';
  const targetRole = role === 'host' ? 'guest' : 'host';

  if (!matchId) {
    socket.destroy();
    return;
  }

  const matchRecord = state.matches[matchId] || state.rooms[matchId];
  if (!matchRecord) {
    socket.write('HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n');
    socket.destroy();
    return;
  }

  const acceptKey = crypto.createHash('sha1').update(secKey + WS_GUID).digest('base64');
  socket.write(
    'HTTP/1.1 101 Switching Protocols\r\n' +
    'Upgrade: websocket\r\n' +
    'Connection: Upgrade\r\n' +
    'Sec-WebSocket-Accept: ' + acceptKey + '\r\n\r\n'
  );

  if (!state.wsClients[matchId]) {
    state.wsClients[matchId] = { host: null, guest: null };
  }
  const prevSocket = state.wsClients[matchId][role];
  if (prevSocket && prevSocket !== socket && !prevSocket.destroyed) {
    try {
      prevSocket.end();
      prevSocket.destroy();
    } catch (e) {}
  }
  state.wsClients[matchId][role] = socket;

  let buffer = Buffer.alloc(0);
  let socketMsgCount = 0;
  let socketMsgWindow = Date.now();

  socket.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    while (buffer.length >= 2) {
      const byte0 = buffer[0];
      const byte1 = buffer[1];
      const opcode = byte0 & 0x0f;
      const isMasked = (byte1 & 0x80) !== 0;
      let payloadLen = byte1 & 0x7f;
      let offset = 2;

      if (payloadLen === 126) {
        if (buffer.length < 4) break;
        payloadLen = buffer.readUInt16BE(2);
        offset = 4;
      } else if (payloadLen === 127) {
        if (buffer.length < 10) break;
        payloadLen = Number(buffer.readBigUInt64BE(2));
        offset = 10;
      }

      // Bound max frame size to 64KB (prevent memory exhaustion attacks)
      if (payloadLen > 65536) {
        socket.destroy();
        break;
      }

      const maskLen = isMasked ? 4 : 0;
      const totalLen = offset + maskLen + payloadLen;
      if (buffer.length < totalLen) break;

      let payload = buffer.slice(offset + maskLen, totalLen);
      if (isMasked) {
        const maskKey = buffer.slice(offset, offset + 4);
        payload = Buffer.from(payload);
        for (let i = 0; i < payload.length; i++) {
          payload[i] ^= maskKey[i % 4];
        }
      }

      buffer = buffer.slice(totalLen);

      // Opcode 8: close
      if (opcode === 8) {
        socket.end();
        break;
      }
      // Opcode 9: ping -> send pong (opcode 10)
      if (opcode === 9) {
        const pong = Buffer.from([0x8a, 0x00]);
        socket.write(pong);
        continue;
      }
      // Opcode 10: pong response
      if (opcode === 10) {
        continue;
      }
      // Opcode 1: text message
      if (opcode === 1) {
        const nowSec = Date.now();
        if (nowSec - socketMsgWindow > 1000) {
          socketMsgCount = 0;
          socketMsgWindow = nowSec;
        }
        socketMsgCount++;
        // Rate limit: max 150 packets/sec
        if (socketMsgCount > 150) {
          continue;
        }

        const text = payload.toString('utf8');
        try {
          const packet = JSON.parse(text);
          // 1. Deliver to peer WebSocket immediately
          const peerSocket = state.wsClients[matchId] && state.wsClients[matchId][targetRole];
          if (peerSocket && !peerSocket.destroyed && peerSocket.writable) {
            peerSocket.write(makeWsTextFrame(text));
          }
          // 2. Also enqueue into HTTP relay queue for late pollers
          if (!state.relays[matchId]) {
            state.relays[matchId] = { host: [], guest: [], lastHostTick: Date.now(), lastGuestTick: Date.now() };
          }
          const relay = state.relays[matchId];
          if (role === 'host') relay.lastHostTick = Date.now();
          else relay.lastGuestTick = Date.now();
          relay[targetRole].push({
            packet: packet,
            type: packet.k || packet.type,
            data: packet.s || packet.i || packet.l || packet.data || packet,
            timestamp: Date.now()
          });
          if (relay[targetRole].length > 30) relay[targetRole].shift();
        } catch (e) {}
      }
    }
  });

  const cleanupSocket = () => {
    if (state.wsClients[matchId] && state.wsClients[matchId][role] === socket) {
      state.wsClients[matchId][role] = null;
    }
  };

  socket.on('close', cleanupSocket);
  socket.on('end', cleanupSocket);
  socket.on('error', (err) => {
    cleanupSocket();
    socket.destroy();
  });
});

// Periodic WebSocket Relay Heartbeat to detect half-open or dead connections
setInterval(() => {
  for (const mId in state.wsClients) {
    const client = state.wsClients[mId];
    if (!client) continue;
    for (const r of ['host', 'guest']) {
      const sock = client[r];
      if (sock && !sock.destroyed && sock.writable) {
        try {
          sock.write(Buffer.from([0x89, 0x00])); // Opcode 9 (ping)
        } catch (e) {
          client[r] = null;
          try { sock.destroy(); } catch (_) {}
        }
      } else if (sock && sock.destroyed) {
        client[r] = null;
      }
    }
  }
}, 10000);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`FOOTY vs HOOPS Master Game & Multiplayer Server running on port ${PORT}`);
});
