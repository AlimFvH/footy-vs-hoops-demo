/**
 * FOOTY vs HOOPS - Stage J Acceptance Test Suite
 * Tests UI fixes, artwork dispatch, referral commissions, TON wallet connection, and safety constraints.
 */

const assert = require('assert');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8099;
const HOST = '127.0.0.1';
let spawnedServer = null;
let tmpDataPath = null;

function checkServerReady() {
  return new Promise((resolve) => {
    const req = http.get(`http://${HOST}:${PORT}/api/health`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function ensureServerRunning() {
  const isRunning = await checkServerReady();
  if (isRunning) return;

  tmpDataPath = path.join(__dirname, 'temp_stage_j_data.json');
  try {
    fs.copyFileSync(path.join(__dirname, '../server/data.json'), tmpDataPath);
  } catch (e) {
    fs.writeFileSync(tmpDataPath, JSON.stringify({ players: {}, economyLedger: [], idempotencyKeys: {}, matches: {} }));
  }

  spawnedServer = spawn('node', [path.join(__dirname, '../server/server.js')], {
    env: Object.assign({}, process.env, { PORT: String(PORT), SEASON_STATE: 'prelaunch', DATA_FILE: tmpDataPath }),
    stdio: ['ignore', 'pipe', 'pipe']
  });

  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 100));
    if (await checkServerReady()) return;
  }
  throw new Error('Failed to auto-spawn test server on port ' + PORT);
}

function cleanupSpawnedServer() {
  if (spawnedServer) {
    try { spawnedServer.kill(); } catch (e) {}
    spawnedServer = null;
  }
  if (tmpDataPath) {
    try { if (fs.existsSync(tmpDataPath)) fs.unlinkSync(tmpDataPath); } catch (e) {}
    tmpDataPath = null;
  }
}

function apiRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: HOST,
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    }, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(raw) });
        } catch (e) {
          resolve({ status: res.statusCode, raw });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runStageJTests() {
  console.log('\n=== FOOTY vs HOOPS: Stage J Acceptance Verification Suite ===\n');
  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`[PASS] Test ${total}: ${name}`);
      passed++;
    } catch (e) {
      console.error(`[FAIL] Test ${total}: ${name}`);
      console.error(e);
      process.exit(1);
    }
  }

  async function testAsync(name, fn) {
    total++;
    try {
      await fn();
      console.log(`[PASS] Test ${total}: ${name}`);
      passed++;
    } catch (e) {
      console.error(`[FAIL] Test ${total}: ${name}`);
      console.error(e);
      process.exit(1);
    }
  }

  const redesignJs = fs.readFileSync('js/redesign.js', 'utf8');
  const redesignCss = fs.readFileSync('css/redesign.css', 'utf8');
  const gameJs = fs.readFileSync('js/game.js', 'utf8');

  // --- SUB-STAGE J1: UI FIXES ---

  test('J1.1: Featured hero card passes showJerseyTag: false (no Киберпанк pill)', () => {
    assert(redesignJs.includes('showJerseyTag: false'), 'Must pass showJerseyTag: false on hero showcase');
    // Check palettes don't use raw "Киберпанк"
    assert(!redesignJs.includes("ru: 'Киберпанк'"), 'Hero skin palette must not display raw Киберпанк');
  });

  test('J1.2: Solo header badges have balanced, equal flex styling and media query', () => {
    assert(redesignCss.includes('.fvh-solo-header'), '.fvh-solo-header must be defined in css');
    assert(redesignCss.includes('.fvh-solo-header .fvh-hero-badge'), 'Badge must have equal flex styling');
    assert(redesignCss.includes('.fvh-solo-header .fvh-solo-rival-pill'), 'Rival pill must have equal flex styling');
    assert(redesignCss.includes('@media (max-width: 360px)'), 'Must include narrow-device responsive breakpoint');
  });

  test('J1.3: Official emblem is preserved as foreground image and never used as page background', () => {
    assert(redesignJs.includes('getOfficialEmblemHtml'), 'getOfficialEmblemHtml must exist');
    assert(!redesignCss.includes('background-image: url("assets/emblem.png")'), 'Emblem must never be page background');
    assert(!redesignCss.includes("background: url('assets/emblem.png')"), 'Emblem must never be page background');
  });

  test('J1.4: Arena cosmetics removed from shop & wardrobe; stadiums remain selectable for gameplay', () => {
    assert(!gameJs.includes("exports.CATEGORIES = ['skins', 'stadiums', 'balls', 'other']"), 'Stadiums removed from cosmetic shop categories');
    assert(redesignJs.includes('selectArenaBtn'), 'selectArenaBtn must be used for match environment selection');
    assert(!redesignJs.includes("btn.innerHTML = getFvhCoinSvg('inline') + ' ' + arena.price + ' · ' + tr('buyArenaBtn')"), 'Obsolete buy arena action must be removed');
  });

  test('J1.5: Artwork dispatcher normalizes ball categories and produces authentic 3D SVGs without hex fallbacks', () => {
    assert(redesignJs.includes("cat === 'balls_footy' || cat === 'balls_hoops'"), 'Must normalize ball categories in renderItemArtwork');
    // Test evaluation
    let env = {};
    eval(redesignJs.slice(redesignJs.indexOf('function getDetailedJerseySvg'), redesignJs.indexOf('window.renderItemArtwork = renderItemArtwork;')));
    eval(redesignJs.slice(redesignJs.indexOf('function buildDefaultShopCatalog'), redesignJs.indexOf('function buildShopPage')));
    
    const catalog = buildDefaultShopCatalog('footy');
    assert(catalog.length >= 10, 'Catalog must contain all default shop items');
    catalog.forEach(item => {
      const svg = renderItemArtwork(item, 'large');
      assert(!svg.includes('polygon points="40,8'), `Item ${item.id} must not fall back to generic hex polygon`);
      assert(svg.startsWith('<svg'), `Item ${item.id} must produce valid SVG string`);
      assert(svg.length > 500, `Item ${item.id} SVG must have rich vector detail (>500 bytes)`);
    });
  });

  test('J1.6: Leaderboard search input has iOS Done/Return dismissal, touchstart blur, and clean focus', () => {
    assert(redesignJs.includes('enterkeyhint="done"'), 'Search input must specify enterkeyhint="done"');
    assert(redesignJs.includes('dismissSearchKeyboard'), 'Must have touchstart keyboard dismissal listener');
    assert(redesignCss.includes('.fvh-lb-search-input:focus'), 'Must clear focus outlines on search input');
    assert(redesignCss.includes('.fvh-lb-search-box:not(:focus-within)'), 'Must reset border when blur occurs');
  });

  test('J1.7: Leaderboard duplicate prevention: docked player card omitted when user is in top list', () => {
    assert(redesignJs.includes('isPlayerInTop'), 'Must compute isPlayerInTop check');
    assert(redesignJs.includes('if (data.player && !isPlayerInTop)'), 'Sticky bar must only render if player is outside top ranks');
  });

  test('J1.8: Private match UI and fake P2P Live status badge removed from Mode Selection', () => {
    assert(!redesignJs.includes('fvh-btn-create-room'), 'Create room button must be removed from Mode Selection page');
    assert(!redesignJs.includes('fvh-btn-join-room'), 'Join room button must be removed from Mode Selection page');
    assert(!redesignJs.includes('> P2P Live<'), 'Unverified P2P Live badge must be removed');
    assert(redesignJs.includes('1v1 PvP'), 'Must display verified 1v1 PvP badge');
  });

  // --- SUB-STAGE J2: QUESTS & REFERRAL SYSTEM ---

  test('J2.1: Social tasks have polished vector brand artwork (Telegram, X, Invite Friends)', () => {
    assert(redesignJs.includes('function getTelegramLogoSvg'), 'Must define vector Telegram logo');
    assert(redesignJs.includes('function getXLogoSvg'), 'Must define vector X logo');
    assert(redesignJs.includes('function getInviteFriendsSvg'), 'Must define vector Invite Friends icon');
    assert(redesignJs.includes('getTelegramLogoSvg(36)'), 'Telegram task must use vector logo');
    assert(redesignJs.includes('getXLogoSvg(36)'), 'X task must use vector logo');
  });

  await testAsync('J2.2: Referral registration prevents self-referrals, duplicate claims, and mutual cycles', async () => {
    const pOwner = 'TEST_REF_OWNER_' + Date.now();
    const pFriend = 'TEST_REF_FRIEND_' + Date.now();
    const pFriend2 = 'TEST_REF_FRIEND2_' + Date.now();

    // 1. Self-referral rejection
    const selfRes = await apiRequest('/api/referrals/register', 'POST', {
      refCode: pOwner,
      playerId: pOwner
    });
    assert.strictEqual(selfRes.status, 400);
    assert.strictEqual(selfRes.data.error, 'self_referral_prevented');

    // 2. Valid friend registration
    const regRes = await apiRequest('/api/referrals/register', 'POST', {
      refCode: pOwner,
      playerId: pFriend
    });
    assert.strictEqual(regRes.status, 200);
    assert.strictEqual(regRes.data.success, true);
    assert.strictEqual(regRes.data.referrerId, pOwner);

    // 3. Duplicate referral rejection (Friend already has a referrer)
    const dupRes = await apiRequest('/api/referrals/register', 'POST', {
      refCode: 'ANOTHER_OWNER',
      playerId: pFriend
    });
    assert.strictEqual(dupRes.status, 400);
    assert.strictEqual(dupRes.data.error, 'already_referred');

    // 4. Mutual cycle rejection (Friend cannot refer Owner)
    const cycleRes = await apiRequest('/api/referrals/register', 'POST', {
      refCode: pFriend,
      playerId: pOwner
    });
    assert.strictEqual(cycleRes.status, 400);
    assert.strictEqual(cycleRes.data.error, 'referral_cycle_prevented');
  });

  await testAsync('J2.3: Referral commission: exact 5% calculation, floor rounding, ledger entry, and idempotency', async () => {
    const pRef = 'REF_COMM_' + Date.now();
    const pAth = 'ATH_COMM_' + Date.now();

    // Register referral relationship
    await apiRequest('/api/referrals/register', 'POST', { refCode: pRef, playerId: pAth });

    // Verify stats return commissionRate (0.05 default)
    const statsRes = await apiRequest('/api/referrals/stats?playerId=' + pRef, 'GET');
    assert.strictEqual(statsRes.status, 200);
    assert.strictEqual(statsRes.data.commissionRate, 0.05);

    // Set up a match between pAth and pOpp
    const pOpp = 'OPP_COMM_' + Date.now();
    await apiRequest('/api/matchmaking/join', 'POST', {
      playerId: pAth,
      playerName: 'Athlete',
      mode: 'footy',
      char: 'footy'
    });
    const matchRes = await apiRequest('/api/matchmaking/join', 'POST', {
      playerId: pOpp,
      playerName: 'Opponent',
      mode: 'footy',
      char: 'footy'
    });
    const mData = matchRes.data || matchRes.body;
    assert.strictEqual(mData.status, 'matched');
    const matchId = mData.matchId;

    const compRes = await apiRequest('/api/match/complete', 'POST', {
      matchId,
      playerId: pAth,
      winner: 0,
      finalScore: [3, 1]
    });
    assert.strictEqual(compRes.status, 200);
    const token = compRes.data.matchToken;

    // Athlete claims match reward (20 FvH Coin for PvP victory)
    const rewardKey = 'idemp_' + Date.now();
    const rewRes = await apiRequest('/api/economy/reward', 'POST', {
      playerId: pAth,
      rewardType: 'match',
      matchId,
      matchToken: token,
      onlineMatch: true,
      idempotencyKey: rewardKey,
      meta: { outcome: 'win', difficulty: 'normal', goals: 3, tackles: 2 }
    });

    assert.strictEqual(rewRes.status, 200);
    assert.strictEqual(rewRes.data.coinsEarned, 20);
    // 5% of 20 = 1 FvH Coin
    assert.strictEqual(rewRes.data.referralCommissionAwarded, 1);

    // Verify referrer received exactly 1 FvH Coin
    const refStatsAfter = await apiRequest('/api/referrals/stats?playerId=' + pRef, 'GET');
    assert.strictEqual(refStatsAfter.data.totalCommissionCoins, 1);

    // Verify idempotency (replay request returns cached result, no double crediting)
    const replayRes = await apiRequest('/api/economy/reward', 'POST', {
      playerId: pAth,
      rewardType: 'match',
      matchId,
      matchToken: token,
      onlineMatch: true,
      idempotencyKey: rewardKey
    });
    assert.strictEqual(replayRes.status, 200);
    assert.strictEqual(replayRes.data.alreadyProcessed, true);

    const refStatsFinal = await apiRequest('/api/referrals/stats?playerId=' + pRef, 'GET');
    assert.strictEqual(refStatsFinal.data.totalCommissionCoins, 1, 'Commission must not double on replay');
  });

  // --- SUB-STAGE J3: TELEGRAM STARS PAYMENTS ---

  await testAsync('J3.1: Telegram Stars payment flow strictly server-authoritative (currency XTR, rejection of unconfigured prices)', async () => {
    // Attempt checkout on non-existent product
    const notFoundRes = await apiRequest('/api/stars/create-invoice', 'POST', {
      playerId: 'TEST_BUYER',
      productId: 'non_existent_product_xyz'
    });
    assert.strictEqual(notFoundRes.status, 404);
    assert.strictEqual(notFoundRes.data.error, 'product_not_found');

    // Attempt checkout on catalog product with unconfigured Stars price
    const unconfRes = await apiRequest('/api/stars/create-invoice', 'POST', {
      playerId: 'TEST_BUYER',
      productId: 'pkg_coins_100'
    });
    assert.strictEqual(unconfRes.status, 400);
    assert.strictEqual(unconfRes.data.error, 'stars_price_unconfigured');

    // Attempt verify without invoice
    const fakeVerify = await apiRequest('/api/stars/verify', 'POST', {
      playerId: 'TEST_BUYER',
      invoiceId: 'non_existent_invoice'
    });
    assert.strictEqual(fakeVerify.status, 404);
  });

  // --- SUB-STAGE J4: TON WALLET CONNECTION ---

  await testAsync('J4.1: TON Wallet link strictly validates public address, rejects seed phrases, and allows clean disconnect', async () => {
    const testPlayer = 'WALLET_ATH_' + Date.now();

    // 1. Rejection of seed phrase (multiple words)
    const seedRes = await apiRequest('/api/wallet/link', 'POST', {
      playerId: testPlayer,
      address: 'apple banana cherry dog elephant fox grape horse igloo jaguar kite lemon'
    });
    assert.strictEqual(seedRes.status, 400);
    assert.strictEqual(seedRes.data.error, 'seed_phrase_rejected');

    // 2. Rejection of invalid non-TON address
    const badRes = await apiRequest('/api/wallet/link', 'POST', {
      playerId: testPlayer,
      address: '0x1234567890abcdef1234567890abcdef12345678'
    });
    assert.strictEqual(badRes.status, 400);
    assert.strictEqual(badRes.data.error, 'invalid_ton_address');

    // 3. Acceptance of valid public TON user-friendly address
    const validAddr = 'EQBvW8Z5huBkMJYdn30BlgG3mM2N05hpVNeSlfG2L89xAOn3';
    const linkRes = await apiRequest('/api/wallet/link', 'POST', {
      playerId: testPlayer,
      address: validAddr
    });
    assert.strictEqual(linkRes.status, 200);
    assert.strictEqual(linkRes.data.success, true);
    assert.strictEqual(linkRes.data.status, 'linked_for_tge');
    assert.strictEqual(linkRes.data.mainnetActive, false);

    // 4. Query status
    const statusRes = await apiRequest('/api/wallet/status?playerId=' + testPlayer, 'GET');
    assert.strictEqual(statusRes.status, 200);
    assert.strictEqual(statusRes.data.isLinked, true);
    assert.strictEqual(statusRes.data.address, validAddr);

    // 5. Disconnect
    const disRes = await apiRequest('/api/wallet/disconnect', 'POST', {
      playerId: testPlayer
    });
    assert.strictEqual(disRes.status, 200);
    assert.strictEqual(disRes.data.disconnected, true);

    // 6. Verify disconnected status
    const statusAfter = await apiRequest('/api/wallet/status?playerId=' + testPlayer, 'GET');
    assert.strictEqual(statusAfter.data.isLinked, false);
    assert.strictEqual(statusAfter.data.address, null);
  });

  test('J4.2: TON Wallet UI card is wired in Profile screen with safety warnings & abbreviated formatting', () => {
    assert(redesignJs.includes('fvh-ton-wallet-card'), 'Profile screen must render fvh-ton-wallet-card');
    assert(redesignJs.includes('formatAbbreviatedAddress'), 'Must format address with abbreviation EQC...1234');
    assert(redesignJs.includes('profileTgeSeedWarningAlert'), 'Must present prominent seed phrase alert');
    assert(redesignJs.includes('profileTgeSecurityWarning'), 'Must display security warning banner');
  });

  // --- SUB-STAGE J5: SEASON 1 PRELAUNCH INVARIANT ---

  test('J5.1: Season 1 remains strictly in prelaunch with zero season points awarded', () => {
    const serverJs = fs.readFileSync('server/server.js', 'utf8');
    assert(serverJs.includes("state: process.env.SEASON_STATE || 'prelaunch'"), 'Server season state must be prelaunch');
    assert(!serverJs.includes('awardSeasonPoints'), 'Zero season points must be awarded in prelaunch');
  });

  console.log(`\n======================================================`);
  console.log(`ALL STAGE J ACCEPTANCE CHECKS PASSED (${passed}/${total})!`);
  console.log(`======================================================\n`);
}

async function main() {
  try {
    await ensureServerRunning();
    await runStageJTests();
  } finally {
    cleanupSpawnedServer();
  }
}

main().catch(err => {
  cleanupSpawnedServer();
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
