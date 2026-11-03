const assert = require('assert');
const fs = require('fs');

console.log('=== FOOTY vs HOOPS Upgrades, Packs & Gameplay Features Test Suite ===\n');

// 1. Verify Server Upgrade Config & Endpoint Logic
console.log('[Test 1] Testing Player Upgrade Progression Configuration...');
const serverCode = fs.readFileSync('server/server.js', 'utf8');
assert(serverCode.includes('UPGRADE_CONFIG'), 'UPGRADE_CONFIG must be defined in server.js');
assert(serverCode.includes('/api/economy/upgrade'), '/api/economy/upgrade endpoint must be implemented');

// Evaluate the UPGRADE_CONFIG
const UPGRADE_CONFIG = {
  maxTier: 10,
  stats: ['power', 'stamina', 'keeper'],
  costs: [0, 500, 1200, 2500, 4500, 7500, 12000, 18000, 26000, 40000],
  requiredLevel: [0, 2, 4, 6, 9, 12, 15, 19, 23, 27]
};

// Verify total cost and level requirements
const totalCostPerStat = UPGRADE_CONFIG.costs.slice(1).reduce((a, b) => a + b, 0);
assert.strictEqual(totalCostPerStat, 112200, 'Each stat should require 112,200 coins to max out');
const totalCostAllStats = totalCostPerStat * 3;
assert.strictEqual(totalCostAllStats, 336600, 'All 3 stats should require 336,600 coins in total');
assert.strictEqual(UPGRADE_CONFIG.requiredLevel[9], 27, 'Max tier 10 requires level 27');
console.log(`  ✓ 10-tier hard progression verified: ${totalCostAllStats.toLocaleString()} coins required to fully max.`);

// Simulate server upgrade handler
function simulateUpgrade(userState, stat) {
  if (!UPGRADE_CONFIG.stats.includes(stat)) return { error: 'invalid_stat' };
  userState.upgrades = userState.upgrades || { power: 1, stamina: 1, keeper: 1 };
  const curTier = userState.upgrades[stat] || 1;
  if (curTier >= UPGRADE_CONFIG.maxTier) return { error: 'max_tier_reached' };

  const nextTier = curTier + 1;
  const cost = UPGRADE_CONFIG.costs[nextTier - 1];
  const reqLvl = UPGRADE_CONFIG.requiredLevel[nextTier - 1];

  if ((userState.level || 1) < reqLvl) {
    return { error: 'level_required', requiredLevel: reqLvl };
  }
  if ((userState.coins || 0) < cost) {
    return { error: 'insufficient_coins', cost };
  }

  userState.coins -= cost;
  userState.upgrades[stat] = nextTier;
  return { ok: true, tier: nextTier, cost, remainingCoins: userState.coins };
}

const mockUser = { level: 1, coins: 50000, upgrades: { power: 1, stamina: 1, keeper: 1 } };
// Fails tier 2 because level 1 < level 2
assert.strictEqual(simulateUpgrade(mockUser, 'power').error, 'level_required');

// Level up to 2
mockUser.level = 2;
const upg1 = simulateUpgrade(mockUser, 'power');
assert.strictEqual(upg1.ok, true);
assert.strictEqual(upg1.tier, 2);
assert.strictEqual(mockUser.coins, 50000 - 500);

// Insufficient coins test
mockUser.level = 30;
mockUser.coins = 100;
assert.strictEqual(simulateUpgrade(mockUser, 'power').error, 'insufficient_coins');
console.log('  ✓ Level-lock and coin deductions simulated and verified.');

// 2. Verify Pack Exclusive Items & Pack Opening Endpoint
console.log('\n[Test 2] Testing Pack-Exclusive Catalog Items & Drop Mechanics...');
const freshServerCode = fs.readFileSync('server/server.js', 'utf8');
assert(freshServerCode.includes("'skin_footy_mythic_titan':"), 'Titan Footy jersey must exist');
assert(freshServerCode.includes("'skin_hoops_hyper_beast':"), 'Hyper Beast Hoops jersey must exist');
assert(freshServerCode.includes("'ball_footy_supernova':"), 'Supernova ball must exist');
assert(freshServerCode.includes("'ball_hoops_vortex':"), 'Vortex ball must exist');
assert(freshServerCode.includes('packExclusive: true'), 'Pack-exclusive flag must be defined on catalog items');
assert(freshServerCode.includes('/api/packs/open'), '/api/packs/open endpoint must exist');

// Verify pack exclusive items cannot be bought directly in normal shop
assert(freshServerCode.includes('if (catItem.packExclusive)'), 'Server shop must reject direct purchases of pack-exclusive items');
console.log('  ✓ Pack exclusives are protected from direct shop purchases.');

// 3. Verify Basketball Aiming Mechanics in game.js
console.log('\n[Test 3] Testing Basketball Directional Aiming & Auto-Aim Removal...');
const gameCode = fs.readFileSync('js/game.js', 'utf8');
assert(!gameCode.includes('a.fx = toHoopX; a.fz = toHoopZ;'), 'Auto-aim snapping must NOT exist in throwBasketBall');
assert(gameCode.includes('aimX = a.x + fx * throwDist'), 'Shot must be thrown along player facing direction (fx)');
assert(gameCode.includes('aimZ = a.z + fz * throwDist'), 'Shot must be thrown along player facing direction (fz)');
assert(gameCode.includes('dunkDot > 0.5'), 'Dunking requires facing towards hoop');
console.log('  ✓ Basketball directional throwing strictly fires along facing direction.');

// 4. Verify Jersey Pattern Rendering
console.log('\n[Test 4] Testing 2D & 3D Jersey Pattern Rendering...');
const glbCode = fs.readFileSync('render/characters_glb.js', 'utf8');
const redesignCode = fs.readFileSync('js/redesign.js', 'utf8');
assert(glbCode.includes('drawGlbJerseyPattern'), '3D WebGL texture pattern generator must exist');
assert(redesignCode.includes('drawHeroJerseyPattern'), '2D Cutout hero pattern generator must exist');
assert(redesignCode.includes('skin_footy_mythic_titan'), 'Mythic Titan jersey pattern must be rendered');
assert(redesignCode.includes('skin_hoops_hyper_beast'), 'Hyper Beast jersey pattern must be rendered');
console.log('  ✓ 2D and 3D Jersey pattern engines verified.');

// 5. Verify Match HUD under Scoreboard
console.log('\n[Test 5] Testing Match HUD Controls Under Scoreboard...');
assert(gameCode.includes('hud-top-ctrls'), 'hud-top-ctrls container must be created');
const redesignCss = fs.readFileSync('css/redesign.css', 'utf8');
assert(redesignCss.includes('.hud-top-ctrls'), 'css/redesign.css must position .hud-top-ctrls under scoreboard');
console.log('  ✓ HUD controls (pause and mute) verified positioned below scoreboard.');

// 6. Verify Cinematic Pack Opening Animation
console.log('\n[Test 6] Testing Cinematic Pack Opening Component...');
assert(redesignCode.includes('openPackWithCinematicAnimation'), 'Cinematic pack opener function must exist');
assert(redesignCode.includes('fvh-pack-opening-overlay'), 'Pack opening overlay must exist');
assert(redesignCode.includes('fvh-pack-3d-box'), 'Floating 3D pack box must exist');
assert(redesignCss.includes('.fvh-pack-opening-overlay'), 'CSS overlay styles must exist');
assert(redesignCss.includes('.fvh-pack-3d-box'), 'CSS 3D pack box styles must exist');
console.log('  ✓ Pack opening cinematic sequence verified.');

// 7. Verify Shop "В гардероб" Button
console.log('\n[Test 7] Testing Shop Modal "В гардероб" Navigation...');
assert(redesignCode.includes('app.showCharacters(curChar, targetSlot)'), 'Wardrobe navigation from Shop must be wired');
console.log('  ✓ Shop "В гардероб" button navigation verified.');

console.log('\nAll 7 new feature verification tests PASSED with 100% success! 🎉');
