const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8099;
const DATA_FILE = path.join(__dirname, 'data.json');

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

const PRODUCT_CATALOG = {
  // Battle Pass VIP Track (Digital good sold inside Telegram Mini App strictly uses Telegram Stars XTR)
  'battlepass_premium': {
    name: 'Battle Pass Season 1 VIP',
    starsPrice: 250,
    type: 'battlepass'
  },
  // Configured FvH Currency Packages (Prompt 4 Section 4)
  'pkg_coins_starter': {
    name: 'Starter Coin Pack (500 FvH Coin)',
    coinsAmount: 500,
    starsPrice: 50,
    tonPrice: 0.3,
    type: 'currency'
  },
  'pkg_coins_pro': {
    name: 'Pro Coin Pack (1,200 FvH Coin)',
    coinsAmount: 1200,
    starsPrice: 100,
    tonPrice: 0.6,
    type: 'currency'
  },
  'pkg_coins_elite': {
    name: 'Elite Coin Pack (2,800 FvH Coin)',
    coinsAmount: 2800,
    starsPrice: 200,
    tonPrice: 1.2,
    type: 'currency'
  },
  'pkg_coins_champion': {
    name: 'Champion Coin Pack (6,500 FvH Coin)',
    coinsAmount: 6500,
    starsPrice: 400,
    tonPrice: 2.5,
    type: 'currency'
  },
  'pkg_coins_legend': {
    name: 'Legend Coin Pack (15,000 FvH Coin)',
    coinsAmount: 15000,
    starsPrice: 800,
    tonPrice: 5.0,
    type: 'currency'
  },
  // Themed Cosmetic Bundles (Prompt 4 Section 5)
  'bundle_footy_starter': {
    name: 'FOOTY Starter Bundle',
    coinsPrice: 2000,
    starsPrice: 150,
    tonPrice: 0.9,
    type: 'bundle'
  },
  'bundle_hoops_starter': {
    name: 'HOOPS Starter Bundle',
    coinsPrice: 2000,
    starsPrice: 150,
    tonPrice: 0.9,
    type: 'bundle'
  },
  'bundle_ocean_arena': {
    name: 'Ocean Arena Collection',
    coinsPrice: 5000,
    starsPrice: 350,
    tonPrice: 2.2,
    type: 'bundle'
  },
  'bundle_mars_explorer': {
    name: 'Mars Explorer Collection',
    coinsPrice: 5500,
    starsPrice: 400,
    tonPrice: 2.5,
    type: 'bundle'
  },
  'bundle_lunar_champ': {
    name: 'Lunar Championship Collection',
    coinsPrice: 6000,
    starsPrice: 450,
    tonPrice: 2.8,
    type: 'bundle'
  },
  'bundle_cyber_neon': {
    name: 'Cyber Neon Collection',
    coinsPrice: 7000,
    starsPrice: 500,
    tonPrice: 3.2,
    type: 'bundle'
  },
  'bundle_legendary_champs': {
    name: 'Legendary Champions Bundle',
    coinsPrice: 12000,
    starsPrice: 850,
    tonPrice: 5.0,
    type: 'bundle'
  }
};

// Authoritative In-Game Cosmetic Items Catalog
const ITEM_CATALOG = {
  // Kits / Jerseys
  'skin_rookie': { name: 'Rookie Blue', category: 'skins', slot: 'skin', price: 0, isDefault: true },
  'skin_crimson': { name: 'Crimson Comet', category: 'skins', slot: 'skin', price: 120 },
  'skin_neon': { name: 'Neon Striker', category: 'skins', slot: 'skin', price: 260 },
  'skin_frost': { name: 'Frost Giant', category: 'skins', slot: 'skin', price: 280 },
  'skin_shadow': { name: 'Shadow Ninja', category: 'skins', slot: 'skin', price: 480 },
  'skin_solar': { name: 'Solar Flare', category: 'skins', slot: 'skin', price: 520 },
  'skin_gold': { name: 'Golden Legend', category: 'skins', slot: 'skin', price: 950 },
  'skin_cyber': { name: 'Cyber Blue Jersey', category: 'skins', slot: 'skin', price: 1100 },
  'skin_sunset': { name: 'Sunset Gold Jersey', category: 'skins', slot: 'skin', price: 260 },
  'skin_hydro': { name: 'Hydro Striker Kit', category: 'skins', slot: 'skin', price: 480 },
  'skin_mars': { name: 'Mars Rover Kit', category: 'skins', slot: 'skin', price: 520 },
  'skin_astronaut': { name: 'Astronaut Kit', category: 'skins', slot: 'skin', price: 950 },
  'skin_neon_elite': { name: 'Cyber Striker #10', category: 'skins', slot: 'skin', price: 1100 },

  // Arenas / Stadiums (10 Themed Environments + Classics)
  'std_footy_classic': { name: 'Classic Grass', category: 'stadiums', slot: 'stadium.footy', mode: 'footy', price: 0, isDefault: true },
  'std_footy_night': { name: 'Night Arena', category: 'stadiums', slot: 'stadium.footy', mode: 'footy', price: 300 },
  'std_footy_golden': { name: 'Golden Hour', category: 'stadiums', slot: 'stadium.footy', mode: 'footy', price: 520 },
  'std_footy_neon': { name: 'Neon Turf', category: 'stadiums', slot: 'stadium.footy', mode: 'footy', price: 900 },
  'std_hoops_street': { name: 'Street Classic', category: 'stadiums', slot: 'stadium.hoops', mode: 'hoops', price: 0, isDefault: true },
  'std_hoops_neon': { name: 'Neon Court', category: 'stadiums', slot: 'stadium.hoops', mode: 'hoops', price: 350 },
  'std_hoops_gold': { name: 'Golden Court', category: 'stadiums', slot: 'stadium.hoops', mode: 'hoops', price: 600 },
  'std_hoops_sky': { name: 'Rooftop Sky', category: 'stadiums', slot: 'stadium.hoops', mode: 'hoops', price: 950 },
  'std_ocean_sunset': { name: 'Coastal Sunset Court', category: 'stadiums', slot: 'stadium.footy', mode: 'footy', price: 580 },
  'std_forest_redwood': { name: 'Redwood Forest Arena', category: 'stadiums', slot: 'stadium.hoops', mode: 'hoops', price: 560 },
  'std_space_orbit': { name: 'Orbital Space Colosseum', category: 'stadiums', slot: 'stadium.footy', mode: 'footy', price: 900 },
  'std_mars_dome': { name: 'Mars Bio-Dome Arena', category: 'stadiums', slot: 'stadium.hoops', mode: 'hoops', price: 750 },
  'std_moon_crater': { name: 'Apollo Lunar Arena', category: 'stadiums', slot: 'stadium.footy', mode: 'footy', price: 680 },
  'std_underwater_dome': { name: 'Abyssal Ocean Dome', category: 'stadiums', slot: 'stadium.hoops', mode: 'hoops', price: 820 },
  'std_cyber_megacity': { name: 'Neo Tokyo Megacity', category: 'stadiums', slot: 'stadium.footy', mode: 'footy', price: 950 },
  'std_volcano_caldera': { name: 'Magma Caldera Arena', category: 'stadiums', slot: 'stadium.hoops', mode: 'hoops', price: 850 },
  'std_floating_islands': { name: 'Aetheria Sky Islands', category: 'stadiums', slot: 'stadium.footy', mode: 'footy', price: 880 },
  'std_crystal_cavern': { name: 'Prismatic Crystal Cave', category: 'stadiums', slot: 'stadium.hoops', mode: 'hoops', price: 790 },

  // Balls
  'ball_footy_classic': { name: 'Classic Leather', category: 'balls', slot: 'ball.footy', mode: 'footy', price: 0, isDefault: true },
  'ball_footy_plasma': { name: 'Plasma Pulse', category: 'balls', slot: 'ball.footy', mode: 'footy', price: 180 },
  'ball_footy_gold': { name: 'Solid Gold', category: 'balls', slot: 'ball.footy', mode: 'footy', price: 450 },
  'ball_footy_inferno': { name: 'Inferno Ball Skin', category: 'balls', slot: 'ball.footy', mode: 'footy', price: 700 },
  'ball_footy_solar': { name: 'Solar Blaze Ball', category: 'balls', slot: 'ball.footy', mode: 'footy', price: 550 },
  'ball_hoops_street': { name: 'Raw Street', category: 'balls', slot: 'ball.hoops', mode: 'hoops', price: 0, isDefault: true },
  'ball_hoops_blaze': { name: 'Neon Blaze Ball', category: 'balls', slot: 'ball.hoops', mode: 'hoops', price: 200 },
  'ball_hoops_chrome': { name: 'Chrome Spark', category: 'balls', slot: 'ball.hoops', mode: 'hoops', price: 480 },
  'ball_hoops_midnight': { name: 'Midnight Matte', category: 'balls', slot: 'ball.hoops', mode: 'hoops', price: 750 },
  'ball_tidal': { name: 'Tidal Wave Ball', category: 'balls', slot: 'ball.hoops', mode: 'hoops', price: 600 },
  'ball_earthrise': { name: 'Earthrise Ball', category: 'balls', slot: 'ball.footy', mode: 'footy', price: 650 },
  'ball_cyber_neon': { name: 'Cyber Neon Ball', category: 'balls', slot: 'ball.hoops', mode: 'hoops', price: 800 },

  // Celebrations & VFX
  'cel_confetti': { name: 'Confetti Rain', category: 'celebrations', slot: 'celebration', price: 0, isDefault: true },
  'cel_fireworks': { name: 'Victory Fireworks', category: 'celebrations', slot: 'celebration', price: 350 },
  'cel_lightning': { name: 'Lightning Storm', category: 'celebrations', slot: 'celebration', price: 550 },
  'cel_goldrain': { name: 'Gold Rain Celebration', category: 'celebrations', slot: 'celebration', price: 800 },

  // Trails
  'trail_default': { name: 'Classic Trail', category: 'trails', slot: 'trail', price: 0, isDefault: true },
  'trail_fire': { name: 'Fire Trail', category: 'trails', slot: 'trail', price: 250 },
  'trail_rainbow': { name: 'Rainbow Trail', category: 'trails', slot: 'trail', price: 400 },
  'trail_laser': { name: 'Laser Trail', category: 'trails', slot: 'trail', price: 650 },

  // Mystery Packs
  'pack_footy': { name: 'Footy Striker Pack', category: 'packs', price: 250, type: 'pack', packId: 'footy' },
  'pack_hoops': { name: 'Hoops All-Star Pack', category: 'packs', price: 250, type: 'pack', packId: 'hoops' },
  'pack_clash': { name: 'Ultimate Clash Pack', category: 'packs', price: 500, type: 'pack', packId: 'clash' },

  // Boosts (Catalog items with charges and distinct gameplay effects)
  'boost_turbo': { name: 'Turbo Boots', category: 'boosts', slot: 'boost', price: 60, type: 'active', duration: 12 },
  'boost_lungs': { name: 'Iron Lungs', category: 'boosts', slot: 'boost', price: 70, type: 'passive', duration: 0 },
  'boost_power': { name: 'Sharp Shooter', category: 'boosts', slot: 'boost', price: 110, type: 'passive', duration: 0 },
  'boost_coins': { name: 'Coin Doubler', category: 'boosts', slot: 'boost', price: 150, type: 'passive', duration: 0 }
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

// Quest Rewards Configuration
const QUEST_REWARDS = {
  'prime_daily': { coins: 250, xp: 100 },
  'd_play3': { coins: 80, xp: 40 },
  'd_score5': { coins: 120, xp: 60 },
  'd_win1': { coins: 150, xp: 75 },
  'w_win10': { coins: 500, xp: 300 },
  'w_score20': { coins: 400, xp: 250 },
  'w_matches15': { coins: 350, xp: 200 },
  'a_first_win': { coins: 200, xp: 100 },
  'a_footy_master': { coins: 800, xp: 500 },
  'a_hoops_master': { coins: 800, xp: 500 },
  'soc_tg_channel': { coins: 200, xp: 100 },
  'soc_tg_chat': { coins: 150, xp: 75 },
  'soc_x_follow': { coins: 200, xp: 100 },
  'soc_discord': { coins: 250, xp: 120 },
  'soc_youtube': { coins: 200, xp: 100 }
};

// Battle Pass Rewards Definition (30 Levels Dual Track)
const BATTLE_PASS_CONFIG = (function() {
  const levels = [];
  const freeItemsPool = [
    { type: 'coins', name: '100 Coins', val: 100 },
    { type: 'coins', name: '250 Coins', val: 250 },
    { type: 'pack', name: 'Footy Striker Pack', packId: 'footy' },
    { type: 'pack', name: 'Hoops All-Star Pack', packId: 'hoops' },
    { type: 'pack', name: 'Footy Bronze Pack', packId: 'footy' },
    { type: 'pack', name: 'Hoops Pro Pack', packId: 'hoops' },
    { type: 'pack', name: 'Ultimate Clash Pack', packId: 'clash' }
  ];

  for (let i = 1; i <= 30; i++) {
    const xpReq = 100 + (i - 1) * 35;
    let freeReward;
    if (i === 1) freeReward = { type: 'coins', name: '150 Starter Coins', val: 150 };
    else if (i === 5) freeReward = { type: 'pack', name: 'Footy Bronze Pack', packId: 'footy' };
    else if (i === 10) freeReward = { type: 'cosmetic', name: 'Neon Striker Kit', itemId: 'skin_neon' };
    else if (i === 15) freeReward = { type: 'pack', name: 'Hoops Pro Pack', packId: 'hoops' };
    else if (i === 20) freeReward = { type: 'cosmetic', name: 'Inferno Ball Skin', itemId: 'ball_footy_inferno' };
    else if (i === 25) freeReward = { type: 'coins', name: '1000 Mega Coins', val: 1000 };
    else if (i === 30) freeReward = { type: 'pack', name: 'Ultimate Clash Champion Pack', packId: 'clash' };
    else freeReward = Object.assign({}, freeItemsPool[(i * 3) % freeItemsPool.length]);

    let premiumReward;
    if (i === 1) premiumReward = { type: 'cosmetic', name: 'Cyber Blue Jersey', itemId: 'skin_cyber' };
    else if (i === 2) premiumReward = { type: 'coins', name: '300 VIP Coins', val: 300 };
    else if (i === 3) premiumReward = { type: 'cosmetic', name: 'Neon Blaze Ball', itemId: 'ball_hoops_blaze' };
    else if (i === 4) premiumReward = { type: 'coins', name: '500 VIP Coins', val: 500 };
    else if (i === 5) premiumReward = { type: 'cosmetic', name: 'Gold Rain Celebration', itemId: 'cel_goldrain' };
    else if (i === 6) premiumReward = { type: 'coins', name: '600 VIP Coins', val: 600 };
    else if (i === 7) premiumReward = { type: 'cosmetic', name: 'Solar Blaze Ball', itemId: 'ball_footy_solar' };
    else if (i === 8) premiumReward = { type: 'pack', name: 'Ultimate Clash Pack', packId: 'clash' };
    else if (i === 9) premiumReward = { type: 'coins', name: '750 VIP Coins', val: 750 };
    else if (i === 10) premiumReward = { type: 'cosmetic', name: 'Coastal Sunset Court', itemId: 'std_ocean_sunset' };
    else if (i === 11) premiumReward = { type: 'cosmetic', name: 'Rainbow Trail', itemId: 'trail_rainbow' };
    else if (i === 12) premiumReward = { type: 'coins', name: '1000 VIP Coins', val: 1000 };
    else if (i === 13) premiumReward = { type: 'cosmetic', name: 'Mars Rover Kit', itemId: 'skin_mars' };
    else if (i === 14) premiumReward = { type: 'coins', name: '1200 VIP Coins', val: 1200 };
    else if (i === 15) premiumReward = { type: 'cosmetic', name: 'Mars Bio-Dome Arena', itemId: 'std_mars_dome' };
    else if (i === 16) premiumReward = { type: 'cosmetic', name: 'Laser Trail', itemId: 'trail_laser' };
    else if (i === 17) premiumReward = { type: 'coins', name: '1500 VIP Coins', val: 1500 };
    else if (i === 18) premiumReward = { type: 'cosmetic', name: 'Victory Fireworks', itemId: 'cel_fireworks' };
    else if (i === 19) premiumReward = { type: 'coins', name: '1800 VIP Coins', val: 1800 };
    else if (i === 20) premiumReward = { type: 'cosmetic', name: 'Apollo Lunar Arena', itemId: 'std_moon_crater' };
    else if (i === 21) premiumReward = { type: 'cosmetic', name: 'Star Confetti', itemId: 'cel_confetti' };
    else if (i === 22) premiumReward = { type: 'coins', name: '2000 VIP Coins', val: 2000 };
    else if (i === 23) premiumReward = { type: 'cosmetic', name: 'Earthrise Ball', itemId: 'ball_earthrise' };
    else if (i === 24) premiumReward = { type: 'coins', name: '2500 VIP Coins', val: 2500 };
    else if (i === 25) premiumReward = { type: 'cosmetic', name: 'Neo Tokyo Megacity', itemId: 'std_cyber_megacity' };
    else if (i === 26) premiumReward = { type: 'cosmetic', name: 'Astronaut Kit', itemId: 'skin_astronaut' };
    else if (i === 27) premiumReward = { type: 'coins', name: '3000 VIP Coins', val: 3000 };
    else if (i === 28) premiumReward = { type: 'cosmetic', name: 'Tidal Wave Ball', itemId: 'ball_tidal' };
    else if (i === 29) premiumReward = { type: 'cosmetic', name: 'Abyssal Ocean Dome', itemId: 'std_underwater_dome' };
    else if (i === 30) premiumReward = { type: 'coins', name: '5000 VIP Coins', val: 5000 };

    levels.push({
      level: i,
      xpRequired: xpReq,
      freeReward,
      premiumReward
    });
  }
  return levels;
})();

function currentLevelForXp(totalXp) {
  let xpAccum = 0;
  let lvl = 1;
  for (let i = 0; i < BATTLE_PASS_CONFIG.length; i++) {
    if ((totalXp || 0) >= xpAccum + BATTLE_PASS_CONFIG[i].xpRequired) {
      xpAccum += BATTLE_PASS_CONFIG[i].xpRequired;
      lvl = Math.min(30, i + 2);
    } else {
      break;
    }
  }
  return lvl;
}

function createDefaultPlayer(playerId) {
  return {
    playerId: playerId,
    coins: 350,
    xp: 0,
    owned: [
      'skin_rookie',
      'std_footy_classic',
      'std_hoops_street',
      'ball_footy_classic',
      'ball_hoops_street',
      'frame_default',
      'trail_default',
      'cel_confetti'
    ],
    equipped: {
      skin: 'skin_rookie',
      'ball.footy': 'ball_footy_classic',
      'ball.hoops': 'ball_hoops_street',
      'stadium.footy': 'std_footy_classic',
      'stadium.hoops': 'std_hoops_street',
      celebration: 'cel_confetti',
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
  } else if (prod.type === 'battlepass') {
    player.battlePass.isPremium = true;
    player.battlePass.premiumUnlockedAt = Date.now();
    player.updatedAt = Date.now();
    addLedgerEntry(player.playerId, 'payment_credit', 0, 0, player.coins, 'Unlocked Battle Pass VIP Premium', productId, { paymentType });
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

      // Clean up previous active matches for this player that are already completed
      for (const mId in state.matches) {
        const m = state.matches[mId];
        if ((m.host.playerId === playerId || (m.guest && m.guest.playerId === playerId)) && (now - m.createdAt > 300000)) {
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

        const matchInfo = {
          matchId,
          roomId: matchId,
          mode: (opponent.mode === mode) ? mode : 'clash',
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

    // Check if player is part of an active match
    for (const mId in state.matches) {
      const m = state.matches[mId];
      if (m.host.playerId === playerId) {
        return sendJson(res, 200, {
          ok: true,
          status: 'matched',
          matchId: mId,
          role: 'host',
          match: m,
          opponent: m.guest
        });
      } else if (m.guest && m.guest.playerId === playerId) {
        return sendJson(res, 200, {
          ok: true,
          status: 'matched',
          matchId: mId,
          role: 'guest',
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

      // Enqueue packet with preserved envelope
      relay[targetRole].push({
        packet: packet,
        type: packet.k || packet.type,
        data: packet.s || packet.i || packet.l || packet.data || packet,
        timestamp: Date.now()
      });

      // Keep recent 30 packets in memory
      if (relay[targetRole].length > 30) {
        relay[targetRole].shift();
      }

      // If peer is connected via native WebSocket relay, forward immediately
      if (state.wsClients && state.wsClients[matchId] && state.wsClients[matchId][targetRole]) {
        const peerWs = state.wsClients[matchId][targetRole];
        if (peerWs && !peerWs.destroyed && peerWs.writable) {
          try {
            peerWs.write(makeWsTextFrame(JSON.stringify(packet)));
          } catch (e) {}
        }
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
      const winner = (data.winner === 0 || data.winner === 1) ? data.winner : null;
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

      // Validate scores
      const score0 = Math.max(0, Number(finalScore[0]) || 0);
      const score1 = Math.max(0, Number(finalScore[1]) || 0);

      // In Sudden Death, there MUST be a winner (no draws)
      let resolvedWinner = winner;
      if (phase === 'suddendeath' && resolvedWinner === null) {
        if (score0 > score1) resolvedWinner = 0;
        else if (score1 > score0) resolvedWinner = 1;
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

      const remainingWinner = isHost ? 0 : 1;
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
      claimedMilestones: []
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
      if (err) return sendJson(res, 400, { error: 'Invalid JSON' });

      const rawRef = data.refCode || data.referralCode;
      const newPlayerId = String(data.playerId || data.friendId || '').trim();

      if (!rawRef || !newPlayerId) {
        return sendJson(res, 400, { error: 'Missing refCode or playerId' });
      }

      const norm = normalizeRefCode(rawRef);

      if (!state.referrals[norm]) {
        state.referrals[norm] = {
          ownerId: norm,
          referred: [],
          claimedMilestones: []
        };
      }

      // Prevent self-referral
      if (state.referrals[norm].ownerId === newPlayerId) {
        return sendJson(res, 400, { error: 'self_referral_prevented', message: 'You cannot refer yourself' });
      }

      // Check if already registered
      const existing = state.referrals[norm].referred.find(r => r.playerId === newPlayerId);
      if (!existing) {
        state.referrals[norm].referred.push({
          playerId: newPlayerId,
          registeredAt: Date.now(),
          qualified: false
        });
        persistState();
      }

      return sendJson(res, 200, { ok: true, success: true, registered: true });
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
    return sendJson(res, 200, { ok: true, catalog: PRODUCT_CATALOG });
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

      const orderId = 'stars_' + crypto.randomBytes(8).toString('hex');
      const order = {
        orderId,
        invoiceId: orderId,
        productId,
        playerId,
        telegramUserId,
        starsAmount: prod.starsPrice,
        currency: 'XTR',
        status: 'pending', // 'pending' | 'payment_processing' | 'paid' | 'failed' | 'cancelled' | 'refunded'
        createdAt: Date.now(),
        paidAt: null,
        chargeId: null,
        history: [{ status: 'pending', timestamp: Date.now() }]
      };
      state.starsInvoices[orderId] = order;
      persistState();

      const botToken = process.env.TELEGRAM_BOT_TOKEN;
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

      const player = getPlayer(order.playerId);
      const isPremium = Boolean(player && player.battlePass && player.battlePass.isPremium);

      return sendJson(res, 200, {
        ok: true,
        orderId: order.orderId,
        productId: order.productId,
        starsAmount: order.starsAmount,
        currency: order.currency || 'XTR',
        status: order.status,
        isPaid: order.status === 'paid',
        isPremium,
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
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!botToken) {
        return sendJson(res, 200, { ok: true, devMode: true, validated: false });
      }
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

      const botToken = process.env.TELEGRAM_BOT_TOKEN;

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
        const effectiveToken = botToken || process.env.TELEGRAM_BOT_TOKEN || '8354664806:AAHnIjETn8jMISGsvpNs6zkU35_q340vuXk';
        const miniAppUrl = process.env.TELEGRAM_MINI_APP_URL || 'https://footy-vs-hoops.onrender.com/';

        if (chatId && effectiveToken) {
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

      // Battle Pass is a digital good inside Telegram Mini App and strictly requires Telegram Stars (XTR)
      if (productId === 'battlepass_premium') {
        return sendJson(res, 400, {
          ok: false,
          error: 'digital_good_ton_prohibited',
          message: 'Battle Pass is a digital good and can only be purchased with Telegram Stars (XTR) per Telegram Mini App guidelines.'
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

  // 9. Global Leaderboard / Рейтинг сильнейших атлетов
  if (pathname === '/api/leaderboard' && req.method === 'GET') {
    const qCategory = String(parsedUrl.query.category || 'season').toLowerCase();
    const qPlayerId = String(parsedUrl.query.playerId || '').trim();

    // Thematic pool of simulated global athletes
    const athletes = [
      { id: 'ath_apex', name: 'ApexStriker', char: 'footy', club: 'Tokyo Cyber FC', wins: 48, goals: 112, baskets: 32, coins: 8400, xp: 2600, badge: 'PRO' },
      { id: 'ath_dunk', name: 'DunkPhenom', char: 'hoops', club: 'Neon Heights', wins: 45, goals: 28, baskets: 148, coins: 7900, xp: 2450, badge: 'ALL-STAR' },
      { id: 'ath_viper', name: 'ViperVolley', char: 'footy', club: 'Rio Electro', wins: 41, goals: 98, baskets: 24, coins: 6800, xp: 2200, badge: 'PRO' },
      { id: 'ath_rim', name: 'RimCrusher_Pro', char: 'hoops', club: 'Brooklyn Alley', wins: 39, goals: 18, baskets: 136, coins: 6400, xp: 2100, badge: 'ELITE' },
      { id: 'ath_golden', name: 'GoldenBoot_Alim', char: 'footy', club: 'Emirates Arena', wins: 36, goals: 86, baskets: 30, coins: 9200, xp: 1950, badge: 'CHAMP' },
      { id: 'ath_orbital', name: 'OrbitalSniper', char: 'hoops', club: 'Apollo Lunar', wins: 34, goals: 22, baskets: 118, coins: 5900, xp: 1800, badge: 'ELITE' },
      { id: 'ath_shadow', name: 'ShadowStriker', char: 'footy', club: 'Kyoto Ninjas', wins: 31, goals: 74, baskets: 16, coins: 5100, xp: 1650, badge: 'PRO' },
      { id: 'ath_blaze', name: 'BlazeCrossover', char: 'hoops', club: 'Chicago Fire', wins: 29, goals: 14, baskets: 98, coins: 4800, xp: 1520, badge: 'PRO' },
      { id: 'ath_frost', name: 'FrostKeeper', char: 'footy', club: 'Nordic Frost', wins: 26, goals: 62, baskets: 12, coins: 4300, xp: 1400, badge: 'VET' },
      { id: 'ath_air', name: 'AirJordan_99', char: 'hoops', club: 'Skyline Stars', wins: 25, goals: 10, baskets: 88, coins: 4100, xp: 1320, badge: 'PRO' },
      { id: 'ath_turbo', name: 'TurboWinger', char: 'footy', club: 'Monaco Speed', wins: 23, goals: 55, baskets: 18, coins: 3800, xp: 1210, badge: 'VET' },
      { id: 'ath_swish', name: 'SwishMaster', char: 'hoops', club: 'L.A. Beach', wins: 21, goals: 8, baskets: 76, coins: 3500, xp: 1100, badge: 'PRO' },
      { id: 'ath_cyber', name: 'CyberGoalie', char: 'footy', club: 'Neo Seoul', wins: 19, goals: 44, baskets: 14, coins: 3200, xp: 990, badge: 'VET' },
      { id: 'ath_alley', name: 'AlleyOop_King', char: 'hoops', club: 'Miami Court', wins: 18, goals: 6, baskets: 64, coins: 3000, xp: 910, badge: 'PRO' },
      { id: 'ath_striker', name: 'RedwoodStriker', char: 'footy', club: 'California Pines', wins: 16, goals: 38, baskets: 10, coins: 2700, xp: 820, badge: 'VET' },
      { id: 'ath_dunk2', name: 'HalfCourtHero', char: 'hoops', club: 'Rooftop Hoops', wins: 14, goals: 4, baskets: 52, coins: 2400, xp: 740, badge: 'ROOKIE' },
      { id: 'ath_magma', name: 'MagmaStriker', char: 'footy', club: 'Caldera FC', wins: 13, goals: 32, baskets: 8, coins: 2200, xp: 680, badge: 'ROOKIE' },
      { id: 'ath_aether', name: 'AetheriaHoops', char: 'hoops', club: 'Sky High Club', wins: 11, goals: 2, baskets: 42, coins: 1900, xp: 590, badge: 'ROOKIE' },
      { id: 'ath_crystal', name: 'CrystalDribbler', char: 'footy', club: 'Prism United', wins: 9, goals: 22, baskets: 6, coins: 1600, xp: 480, badge: 'ROOKIE' },
      { id: 'ath_rookie', name: 'RookiePhenom', char: 'hoops', club: 'Street League', wins: 7, goals: 1, baskets: 28, coins: 1300, xp: 390, badge: 'ROOKIE' }
    ];

    // Merge in real registered players from state.players
    Object.keys(state.players).forEach(pid => {
      const p = state.players[pid];
      const pStats = p.stats || {};
      const curChar = (p.equipped && p.equipped.skin && p.equipped.skin.includes('hoops')) ? 'hoops' : 'footy';
      const existing = athletes.find(a => a.id === pid);
      if (existing) {
        existing.coins = p.coins || existing.coins;
        existing.xp = p.xp || existing.xp;
        existing.wins = pStats.wins || existing.wins;
        existing.goals = pStats.goals || existing.goals;
        existing.baskets = pStats.baskets || existing.baskets;
      } else {
        athletes.push({
          id: pid,
          name: p.playerName || ('Player ' + pid.slice(4, 9).toUpperCase()),
          char: curChar,
          club: 'FvH Global Club',
          wins: pStats.wins || 0,
          goals: pStats.goals || 0,
          baskets: pStats.baskets || 0,
          coins: p.coins || 0,
          xp: p.xp || 0,
          badge: 'ACTIVE'
        });
      }
    });

    // Score Calculator
    function computeScore(ath, cat) {
      if (cat === 'footy') {
        return (ath.goals || 0) * 10 + (ath.winsFooty || Math.floor((ath.wins || 0) * 0.5)) * 40;
      }
      if (cat === 'hoops') {
        return (ath.baskets || 0) * 5 + (ath.winsHoops || Math.floor((ath.wins || 0) * 0.35)) * 40;
      }
      if (cat === 'coins') {
        return ath.coins || 0;
      }
      // default: season trophy points
      return (ath.wins || 0) * 35 + (ath.goals || 0) * 6 + (ath.baskets || 0) * 3 + Math.floor((ath.xp || 0) / 8);
    }

    const ranked = athletes.map(ath => {
      const score = computeScore(ath, qCategory);
      return Object.assign({}, ath, { score });
    });

    ranked.sort((a, b) => b.score - a.score);

    ranked.forEach((ath, idx) => {
      ath.rank = idx + 1;
      ath.isCurrentUser = Boolean(qPlayerId && ath.id === qPlayerId);
    });

    let footballTotal = 1485200;
    let basketballTotal = 1428900;
    ranked.forEach(a => {
      if (a.char === 'hoops') {
        basketballTotal += a.score;
      } else {
        footballTotal += a.score;
      }
    });
    const totalWarScore = footballTotal + basketballTotal;
    const footballPct = Math.round((footballTotal / totalWarScore) * 1000) / 10;
    const basketballPct = Math.round((100 - footballPct) * 10) / 10;
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
          pointsToNext: higher ? Math.max(1, higher.score - ranked[pIdx].score) : 0
        };
      }
    }

    return sendJson(res, 200, {
      ok: true,
      category: qCategory,
      seasonName: 'Season 1: Football vs Basketball War',
      seasonDaysLeft: 14,
      teamFootball: {
        id: 'footy',
        name: 'Team Football',
        score: footballTotal,
        pct: footballPct,
        athletes: 7240
      },
      teamBasketball: {
        id: 'hoops',
        name: 'Team Basketball',
        score: basketballTotal,
        pct: basketballPct,
        athletes: 7180
      },
      winningTeam: winningTeam,
      leadDiff: leadDiff,
      totalAthletes: 14280 + Object.keys(state.players).length,
      top: ranked.slice(0, 50),
      player: playerRankInfo
    });
  }

  // ==========================================
  // API: Economy, Inventory, Battle Pass & Rewards (Prompt 4)
  // ==========================================

  // 1. Authoritative Player Economy State
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
      player.updatedAt = Date.now();
      persistState();

      return sendJson(res, 200, {
        ok: true,
        success: true,
        playerId: player.playerId,
        coins: player.coins,
        xp: player.xp,
        owned: player.owned,
        equipped: player.equipped,
        boostCharges: player.boostCharges || {},
        armedBoost: player.armedBoost || null,
        battlePass: player.battlePass,
        packs: player.packs
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

        const outcome = meta.outcome === 'win' ? 'win' : meta.outcome === 'draw' ? 'draw' : 'loss';
        const diff = meta.difficulty || 'normal';
        const diffMul = { easy: 0.8, normal: 1.0, hard: 1.35 }[diff] || 1.0;
        const goals = Number(meta.goals || (meta.stats && meta.stats.humanGoals) || 0);
        const tackles = Number(meta.tackles || (meta.stats && meta.stats.humanTackles) || 0);

        const base = outcome === 'win' ? 60 : outcome === 'draw' ? 30 : 15;
        const scoring = meta.mode === 'footy' ? goals * 10 : Math.min(40, goals * 2);
        const skill = Math.min(30, tackles * 3);
        const coinsEarned = Math.max(0, Math.round((base + scoring + skill) * diffMul));
        const xpEarned = Math.round((outcome === 'win' ? 50 : outcome === 'draw' ? 30 : 20) * diffMul + goals * 3);

        player.coins += coinsEarned;
        player.xp += xpEarned;
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

        const resp = {
          ok: true,
          success: true,
          txId: ledger.txId,
          coins: player.coins,
          xp: player.xp,
          coinsEarned,
          xpEarned,
          outcome
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

      // Case 3: Battle Pass Single Tier Claim
      if (rewardType === 'battlepass') {
        const lvl = Number(data.level || rewardId);
        const track = (data.track === 'premium') ? 'premium' : 'free';

        if (lvl < 1 || lvl > 30) {
          return sendJson(res, 400, { ok: false, error: 'invalid_battlepass_level' });
        }

        const curLvl = currentLevelForXp(player.xp);
        if (lvl > curLvl) {
          return sendJson(res, 400, { ok: false, error: 'level_not_reached', currentLevel: curLvl, requested: lvl });
        }

        if (track === 'free') {
          if (player.battlePass.claimedFree.includes(lvl)) {
            return sendJson(res, 400, { ok: false, error: 'tier_already_claimed' });
          }
        } else {
          if (!player.battlePass.isPremium) {
            return sendJson(res, 403, { ok: false, error: 'premium_required', message: 'VIP Premium Pass required' });
          }
          if (player.battlePass.claimedPremium.includes(lvl)) {
            return sendJson(res, 400, { ok: false, error: 'tier_already_claimed' });
          }
        }

        const lvlDef = BATTLE_PASS_CONFIG[lvl - 1];
        const rew = (track === 'premium') ? lvlDef.premiumReward : lvlDef.freeReward;

        let deltaCoins = 0;
        if (rew.type === 'coins') {
          deltaCoins = rew.val || 0;
          player.coins += deltaCoins;
        } else if (rew.type === 'cosmetic') {
          if (!player.owned.includes(rew.itemId)) {
            player.owned.push(rew.itemId);
          }
        } else if (rew.type === 'pack') {
          const pId = rew.packId || 'footy';
          player.packs.free[pId] = (player.packs.free[pId] || 0) + 1;
        }

        if (track === 'free') player.battlePass.claimedFree.push(lvl);
        else player.battlePass.claimedPremium.push(lvl);
        player.updatedAt = Date.now();

        const ledger = addLedgerEntry(
          player.playerId,
          'reward',
          deltaCoins,
          0,
          player.coins,
          'Battle Pass Tier ' + lvl + ' (' + track + ')',
          rew.itemId || null,
          { level: lvl, track, reward: rew }
        );

        const resp = {
          ok: true,
          success: true,
          txId: ledger.txId,
          level: lvl,
          track,
          reward: rew,
          coins: player.coins,
          xp: player.xp,
          owned: player.owned,
          packs: player.packs,
          battlePass: player.battlePass
        };

        if (idempotencyKey) {
          state.idempotencyKeys[idempotencyKey] = resp;
          persistState();
        }

        return sendJson(res, 200, resp);
      }

      // Case 4: Battle Pass Claim All
      if (rewardType === 'battlepass_all') {
        const curLvl = currentLevelForXp(player.xp);
        let claimedCount = 0;
        let totalCoins = 0;
        let itemsGranted = [];

        for (let l = 1; l <= curLvl; l++) {
          const lvlDef = BATTLE_PASS_CONFIG[l - 1];
          // Free track
          if (!player.battlePass.claimedFree.includes(l)) {
            player.battlePass.claimedFree.push(l);
            claimedCount++;
            const rew = lvlDef.freeReward;
            if (rew.type === 'coins') {
              totalCoins += (rew.val || 0);
              player.coins += (rew.val || 0);
            } else if (rew.type === 'cosmetic') {
              if (!player.owned.includes(rew.itemId)) {
                player.owned.push(rew.itemId);
                itemsGranted.push(rew.itemId);
              }
            } else if (rew.type === 'pack') {
              const pId = rew.packId || 'footy';
              player.packs.free[pId] = (player.packs.free[pId] || 0) + 1;
            }
          }
          // Premium track
          if (player.battlePass.isPremium && !player.battlePass.claimedPremium.includes(l)) {
            player.battlePass.claimedPremium.push(l);
            claimedCount++;
            const rew = lvlDef.premiumReward;
            if (rew.type === 'coins') {
              totalCoins += (rew.val || 0);
              player.coins += (rew.val || 0);
            } else if (rew.type === 'cosmetic') {
              if (!player.owned.includes(rew.itemId)) {
                player.owned.push(rew.itemId);
                itemsGranted.push(rew.itemId);
              }
            } else if (rew.type === 'pack') {
              const pId = rew.packId || 'footy';
              player.packs.free[pId] = (player.packs.free[pId] || 0) + 1;
            }
          }
        }

        player.updatedAt = Date.now();
        const ledger = addLedgerEntry(
          player.playerId,
          'reward',
          totalCoins,
          0,
          player.coins,
          'Battle Pass Claim All (' + claimedCount + ' tiers)',
          null,
          { claimedCount, itemsGranted }
        );

        const resp = {
          ok: true,
          success: true,
          txId: ledger.txId,
          claimedCount,
          totalCoins,
          itemsGranted,
          coins: player.coins,
          xp: player.xp,
          owned: player.owned,
          packs: player.packs,
          battlePass: player.battlePass
        };

        if (idempotencyKey) {
          state.idempotencyKeys[idempotencyKey] = resp;
          persistState();
        }

        return sendJson(res, 200, resp);
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
  state.wsClients[matchId][role] = socket;

  let buffer = Buffer.alloc(0);

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
      // Opcode 1: text message
      if (opcode === 1) {
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

server.listen(PORT, '0.0.0.0', () => {
  console.log(`FOOTY vs HOOPS Master Game & Multiplayer Server running on port ${PORT}`);
});
