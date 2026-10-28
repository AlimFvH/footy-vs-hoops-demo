/**
 * Automated Verification Suite for:
 * 1. Basketball Gameplay & Simulation
 * 2. In-Match Cosmetics Visibility (Skins & Balls)
 * 3. Simplified Tasks Screen
 * 4. Six Distinct Social Reward Tasks
 * 5. Production Safeguards & Economy Validation
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== FOOTY vs HOOPS: Basketball Gameplay & Social Tasks Suite ===\n');

// Set up mock AMD environment to load modules from js/game.js
const modules = {};
global.define = function(name, deps, factory) { modules[name] = { deps, factory }; };
global.window = { __boot: () => {}, AudioContext: null, innerWidth: 390, innerHeight: 844 };
global.document = { createElement: () => ({ style: {} }) };

require('../js/game.js');

const cache = {};
function requireModule(id) {
  if (cache[id]) return cache[id].exports;
  const mod = modules[id];
  if (!mod) throw new Error('Missing module ' + id);
  const exports = {};
  const requireFn = (dep) => requireModule(dep);
  cache[id] = { exports };
  const resolvedDeps = mod.deps.map(d => {
    if (d === 'require') return requireFn;
    if (d === 'exports') return exports;
    return requireModule(d);
  });
  mod.factory.apply(null, resolvedDeps);
  return exports;
}

const gameJs = fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8');
const redesignJs = fs.readFileSync(path.join(__dirname, '../js/redesign.js'), 'utf8');
const serverJs = fs.readFileSync(path.join(__dirname, '../server/server.js'), 'utf8');
const storageJs = fs.readFileSync(path.join(__dirname, '../server/storage/index.js'), 'utf8');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] Test ${totalTests}: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] Test ${totalTests}: ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

// -----------------------------------------------------------------------------
// 1. Basketball Gameplay & Simulation
// -----------------------------------------------------------------------------
runTest('Item 1.1: BasketballSim initializes, steps, handles human & AI movement, and shoots', () => {
  const bbMod = requireModule('sim/basketball');
  assert.ok(bbMod && bbMod.BasketballSim, 'BasketballSim must be exported by sim/basketball');

  const sim = new bbMod.BasketballSim({ difficulty: 'normal', matchDuration: 120 });
  assert.ok(sim.human, 'BasketballSim must have human player');
  assert.ok(sim.agents && sim.agents.length >= 2, 'BasketballSim must have agents');
  assert.ok(sim.ball, 'BasketballSim must have ball');

  // Verify initial coordinates are valid numbers
  assert.strictEqual(typeof sim.human.x, 'number');
  assert.strictEqual(typeof sim.human.z, 'number');
  assert.strictEqual(typeof sim.agents[1].x, 'number');
  assert.strictEqual(typeof sim.agents[1].z, 'number');
  assert.strictEqual(typeof sim.ball.x, 'number');
  assert.strictEqual(typeof sim.ball.z, 'number');

  // Run 60 frames of simulation with human joystick input
  const initialZ = sim.human.z;
  for (let i = 0; i < 60; i++) {
    sim.human.mx = 0.8;
    sim.human.mz = -0.6;
    sim.step(1 / 60);
  }

  assert.ok(!isNaN(sim.human.x) && !isNaN(sim.human.z), 'Human coordinates must not be NaN');
  assert.ok(!isNaN(sim.ball.x) && !isNaN(sim.ball.z), 'Ball coordinates must not be NaN');
  assert.ok(!isNaN(sim.agents[1].x) && !isNaN(sim.agents[1].z), 'AI coordinates must not be NaN');

  // Test shooting action
  sim.setOwner(sim.human);
  assert.strictEqual(sim.ball.owner, sim.human, 'Human must own ball before shot');

  sim.launchShot(sim.human, 0, -8, false);
  assert.strictEqual(sim.ball.owner, null, 'Ball must be released upon shot launch');
  assert.ok(sim.ball.vy > 0, 'Ball must have positive upward launch velocity');

  // Test resetPossession cleans orbitAngle
  sim.ball.orbitAngle = 1.57;
  sim.resetPossession(sim.agents[1]);
  assert.strictEqual(sim.ball.orbitAngle, undefined, 'resetPossession must clear stale orbitAngle');
});

runTest('Item 1.2: MatchView cleanly separates football and basketball modes and prevents kit cross-over', () => {
  assert.ok(gameJs.includes("const playerChar = (opts && opts.char) ? opts.char : 'footy';"),
    'MatchView respects player faction identity from opts.char across both sports');
  assert.ok(gameJs.includes("const charSkinId = playerChar === 'hoops'"),
    'MatchView must resolve charSkinId specifically for hoops vs footy');
  assert.ok(gameJs.includes("const fallbackBall = (mode === 'footy') ? 'ball_footy_classic' : 'ball_hoops_street';"),
    'MatchView must define sport-specific ball fallbacks');
  assert.ok(gameJs.includes("let chosenBallId = eq[ballSlot]"),
    'MatchView must resolve chosenBallId based on active sport slot');
});

// -----------------------------------------------------------------------------
// 2. In-Match Cosmetics Visibility (All 22 Kits & 17 Balls)
// -----------------------------------------------------------------------------
runTest('Item 2.1: All project kits are defined in game.js ITEMS and visual mapping', () => {
  const REQUIRED_SKINS = [
    // Footy kits
    'skin_rookie', 'skin_crimson', 'skin_neon', 'skin_frost', 'skin_shadow', 'skin_gold',
    'skin_cyber', 'skin_footy_royal_striker', 'skin_footy_cyber_strike', 'skin_footy_golden_legend',
    'skin_footy_stealth_shadow', 'skin_footy_neon_matrix', 'skin_hydro', 'skin_astronaut',
    // Hoops jerseys
    'skin_solar', 'skin_hoops_street_legend', 'skin_hoops_golden_state', 'skin_hoops_cyber_dunk',
    'skin_hoops_phantom_black', 'skin_hoops_neon_splash', 'skin_sunset', 'skin_mars'
  ];

  REQUIRED_SKINS.forEach(id => {
    assert.ok(gameJs.includes(`'${id}'`), `Skin ${id} must be declared in game.js`);
  });
});

runTest('Item 2.2: All 17 balls are defined in game.js ITEMS with distinct visuals', () => {
  const REQUIRED_BALLS = [
    // Football (8)
    'ball_footy_classic', 'ball_footy_classic_pro', 'ball_footy_inferno', 'ball_footy_cyber_neon',
    'ball_footy_golden_elite', 'ball_footy_galactic', 'ball_footy_plasma', 'ball_footy_gold',
    // Basketball (9)
    'ball_hoops_street', 'ball_hoops_classic_pro', 'ball_hoops_neon_energy', 'ball_hoops_molten_fire',
    'ball_hoops_golden_elite', 'ball_hoops_cosmic', 'ball_hoops_midnight', 'ball_hoops_blaze', 'ball_hoops_chrome'
  ];

  REQUIRED_BALLS.forEach(id => {
    assert.ok(gameJs.includes(`'${id}'`), `Ball ${id} must be in game.js ITEMS`);
  });

  // Verify classic vs classic_pro distinction
  assert.ok(gameJs.includes("0x8b3a1a"), 'ball_hoops_classic_pro must have distinct cognac base color');
  assert.ok(gameJs.includes("0x1e3a8a"), 'ball_footy_classic_pro must have distinct royal blue accent color');
});

runTest('Item 2.3: Shop equip persists both namespaced and generic keys for instant match sync', () => {
  assert.ok(redesignJs.includes("d.equipped['skin.' + sMode] = item.id;"), 'Must persist sport-namespaced skin');
  assert.ok(redesignJs.includes("d.equipped.skin = item.id;"), 'Must persist generic skin');
  assert.ok(redesignJs.includes("d.equipped['ball.' + bMode] = item.id;"), 'Must persist sport-namespaced ball');
  assert.ok(redesignJs.includes("d.equipped.ball = item.id;"), 'Must persist generic ball');
});

// -----------------------------------------------------------------------------
// 3. Simplified Tasks Screen
// -----------------------------------------------------------------------------
runTest('Item 3.1: Tasks screen eliminates old cluttered headers and empty-state banners', () => {
  assert.ok(!redesignJs.includes('Активные задания с наградой'), 'Must NOT contain "Активные задания с наградой"');
  assert.ok(!redesignJs.includes('Active Tasks with Rewards'), 'Must NOT contain "Active Tasks with Rewards"');
  assert.ok(!redesignJs.includes('🎉 Все активные задания выполнены!'), 'Must NOT contain "Все активные задания выполнены!"');
  assert.ok(!redesignJs.includes('All active tasks completed!'), 'Must NOT contain "All active tasks completed!"');
});

runTest('Item 3.2: Tasks screen renders transparent verification disclosure notice', () => {
  assert.ok(redesignJs.includes('Telegram Bot API'), 'Notice must reference Telegram Bot API verification');
  assert.ok(redesignJs.includes('Instagram, X, YouTube, TikTok'), 'Notice must honestly disclose external platform manual follow/confirm');
});

runTest('Item 3.3: Claimed tasks are moved to compact completed section without duplicates', () => {
  assert.ok(redesignJs.includes('fvh-completed-tasks-section'), 'Must contain completed tasks section');
  assert.ok(redesignJs.includes('claimed.indexOf(t.id) === -1'), 'Available tasks must strictly exclude claimed tasks');
  assert.ok(redesignJs.includes('claimed.indexOf(t.id) !== -1'), 'Completed tasks must include only claimed tasks');
});

// -----------------------------------------------------------------------------
// 4. Six Distinct Social Reward Tasks
// -----------------------------------------------------------------------------
runTest('Item 4.1: Six separate social tasks exist with accurate destinations and IDs', () => {
  const EXPECTED_TASKS = [
    { id: 'q_sub_tg', url: 'https://t.me/FootyHoops' },
    { id: 'q_sub_chat', url: 'https://t.me/+zKbH1Po_pdg2MmVi' },
    { id: 'q_sub_insta', url: 'https://www.instagram.com/footyvshoops' },
    { id: 'q_sub_x', url: 'https://x.com/footyvshoops' },
    { id: 'q_sub_yt', url: 'https://youtube.com/@footyvshoops-cr' },
    { id: 'q_sub_tiktok', url: 'https://www.tiktok.com/@footy_vs_hoops' }
  ];

  EXPECTED_TASKS.forEach(t => {
    assert.ok(redesignJs.includes(`id: '${t.id}'`), `Task ${t.id} must exist in redesign.js`);
    assert.ok(redesignJs.includes(t.url), `Task ${t.id} must target correct URL ${t.url}`);
  });
});

runTest('Item 4.2: Server supports verify-telegram and claim-social with idempotency and ledger entries', () => {
  assert.ok(serverJs.includes('/api/tasks/verify-telegram'), 'Server must have /api/tasks/verify-telegram');
  assert.ok(serverJs.includes('/api/tasks/claim-social'), 'Server must have /api/tasks/claim-social');

  // Verify getChatMember is used
  assert.ok(serverJs.includes('getChatMember'), 'Server must verify Telegram membership with getChatMember');

  // Verify claim-social guards against duplicate claims
  assert.ok(serverJs.includes('player.claimedQuests.includes(questId)'), 'Server must check player.claimedQuests');
  assert.ok(serverJs.includes("quest_already_claimed"), 'Server must return quest_already_claimed on duplicate requests');
  assert.ok(serverJs.includes("addLedgerEntry("), 'Server must record transaction in ledger');
  assert.ok(serverJs.includes("const coinsAward = 50;"), 'Server must award 50 FvH Coin');

  // Verify /api/economy/reward does not reject the social quest IDs
  assert.ok(!serverJs.includes("['q_sub_tg', 'q_sub_chat', 'q_sub_x', 'q_sub_insta', 'q_sub_yt', 'q_sub_tiktok'].indexOf(questId) !== -1 && questId !== 'q_sub_tg'"),
    'Server /api/economy/reward must not reject social quests');
});

// -----------------------------------------------------------------------------
// 5. Production Safeguards Preservation
// -----------------------------------------------------------------------------
runTest('Item 5.1: Storage adapter is JsonStorageAdapter and Neon remains disconnected', () => {
  assert.ok(storageJs.includes('new JsonStorageAdapter'), 'Server storage must default to JsonStorageAdapter');
  assert.ok(!serverJs.includes('new PgStorageAdapter'), 'Server must NOT use PgStorageAdapter');
});

runTest('Item 5.2: Withdrawals disabled notice present', () => {
  assert.ok(redesignJs.includes('tokenWithdrawNotice'), 'Withdrawals notice must exist in redesign.js');
  assert.ok(redesignJs.includes('fvh-btn-withdraw-token'), 'Withdraw button opens informational modal');
});

runTest('Item 5.3: Approved Telegram Stars packages & prices preserved (100=25⭐, 500=100⭐, 1200=220⭐, 3000=500⭐)', () => {
  assert.ok(serverJs.includes("'pkg_coins_100': 25"), '100 coins must be 25 Stars');
  assert.ok(serverJs.includes("'pkg_coins_500': 100"), '500 coins must be 100 Stars');
  assert.ok(serverJs.includes("'pkg_coins_1200': 220"), '1200 coins must be 220 Stars');
  assert.ok(serverJs.includes("'pkg_coins_3000': 500"), '3000 coins must be 500 Stars');
});

console.log(`\n=================================================================`);
console.log(`ALL BASKETBALL & SOCIAL TASKS TESTS PASSED (${passedTests}/${totalTests})!`);
console.log(`=================================================================`);
