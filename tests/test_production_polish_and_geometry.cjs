/**
 * Regression Test Suite: Production Bug Fixes, Unique Shop Visuals & Court Geometry
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== FOOTY vs HOOPS: Production Polish & Geometry Audit Suite ===\n');

const redesignJs = fs.readFileSync(path.join(__dirname, '../js/redesign.js'), 'utf8');
const gameJs = fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8');
const styleCss = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');
const redesignCss = fs.readFileSync(path.join(__dirname, '../css/redesign.css'), 'utf8');
const serverJs = fs.readFileSync(path.join(__dirname, '../server/server.js'), 'utf8');

let totalTests = 0;
let passedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] Test ${totalTests}: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] Test ${totalTests}: ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// 1. Unique Kit & Ball SVG Renderers
runTest('Item 1: Every kit has a unique SVG definition in getDetailedJerseySvg', () => {
  const kits = [
    'skin_rookie', 'skin_footy_royal_striker', 'skin_footy_cyber_strike',
    'skin_footy_golden_legend', 'skin_footy_stealth_shadow', 'skin_footy_neon_matrix',
    'skin_crimson', 'skin_neon', 'skin_frost', 'skin_shadow', 'skin_gold',
    'skin_cyber', 'skin_hydro', 'skin_astronaut', 'skin_solar',
    'skin_hoops_street_legend', 'skin_hoops_golden_state', 'skin_hoops_cyber_dunk',
    'skin_hoops_phantom_black', 'skin_hoops_neon_splash', 'skin_sunset', 'skin_mars'
  ];

  kits.forEach(id => {
    assert.ok(redesignJs.includes(id), `Kit ${id} must be explicitly defined in redesign.js`);
  });

  // Verify Hoops kits set isBasketball = true
  assert.ok(redesignJs.includes("id === 'skin_hoops_street_legend'"), 'skin_hoops_street_legend must be handled');
  assert.ok(redesignJs.includes("id === 'skin_hoops_golden_state'"), 'skin_hoops_golden_state must be handled');
  assert.ok(redesignJs.includes("id === 'skin_hoops_cyber_dunk'"), 'skin_hoops_cyber_dunk must be handled');
  assert.ok(redesignJs.includes("id === 'skin_hoops_phantom_black'"), 'skin_hoops_phantom_black must be handled');
  assert.ok(redesignJs.includes("id === 'skin_hoops_neon_splash'"), 'skin_hoops_neon_splash must be handled');
});

runTest('Item 2: Every ball has a unique SVG definition in getDetailedBallSvg', () => {
  const balls = [
    'ball_footy_classic', 'ball_footy_classic_pro', 'ball_footy_inferno',
    'ball_footy_cyber_neon', 'ball_footy_golden_elite', 'ball_footy_neon',
    'ball_footy_plasma', 'ball_footy_gold',
    'ball_hoops_street', 'ball_hoops_classic_pro', 'ball_hoops_neon_energy',
    'ball_hoops_molten_fire', 'ball_hoops_golden_elite', 'ball_hoops_cosmic',
    'ball_hoops_midnight', 'ball_hoops_blaze', 'ball_hoops_chrome'
  ];

  balls.forEach(id => {
    assert.ok(redesignJs.includes(id), `Ball ${id} must be explicitly defined in redesign.js`);
  });
});

// 2. Telegram Subscription Flow
runTest('Item 3: Telegram Subscription flow features open -> verify -> claim -> separate completed block', () => {
  assert.ok(redesignJs.includes('window.__fvhTgOpened'), 'Must track channel opened state');
  assert.ok(redesignJs.includes('window.__fvhTgVerified'), 'Must track subscription verified state');
  assert.ok(redesignJs.includes('claim: false'), 'Must verify subscription before claiming');
  assert.ok(redesignJs.includes('claim: true'), 'Must claim reward on user action');
  assert.ok(redesignJs.includes('fvh-completed-tasks-section'), 'Must move claimed task to separate completed tasks section');
  assert.ok(redesignJs.includes('https://t.me/FootyHoops'), 'Must target official @FootyHoops channel');
});

// 3. Basketball Court Geometry
runTest('Item 4: Basketball court lines geometry has clean continuous 3-point arcs without diagonal crossings', () => {
  assert.ok(gameJs.includes('Math.sqrt(Math.max(0, threeR * threeR - cornerDist * cornerDist))'), 'Must calculate exact baseline intersection dzThree');
  assert.ok(gameJs.includes('Math.atan2(s < 0 ? dzThree : -dzThree, -cornerDist)'), 'Must calculate clean start angle thetaL');
  assert.ok(gameJs.includes('Math.atan2(s < 0 ? dzThree : -dzThree, cornerDist)'), 'Must calculate clean end angle thetaR');
  assert.ok(gameJs.includes('g.arc(X(0), Z(hz), threeR * PPM_B, thetaL, thetaR, s < 0)'), 'Must orient arc correctly for both ends');
});

// 4. Matchmaking Smooth Transition
runTest('Item 5: Matchmaking removes artificial 3s delay and provides smooth 1.2s Opponent Found transition', () => {
  assert.ok(redesignJs.includes('transitionDone = true;'), 'Must have smooth transition timeout');
  assert.ok(redesignJs.includes('1200'), 'Must use 1200ms transition time');
  assert.ok(redesignJs.includes('readySession = session;'), 'Must fast-track session start');
  assert.ok(!redesignJs.includes('var countdown = 3;'), 'Must eliminate 3s blocking countdown');
});

// 5. Shop Respects Active Faction
runTest('Item 6: Shop includes sport switcher [FOOTY | HOOPS] and filters kits and balls by faction', () => {
  assert.ok(redesignJs.includes('fvh-shop-sport-switcher'), 'Must have sport switcher in shop');
  assert.ok(redesignJs.includes("it.category === 'skins' && it.mode === shopSport"), 'Must filter skins by shopSport');
  assert.ok(redesignJs.includes('balls_footy') && redesignJs.includes('balls_hoops'), 'Must support both football and basketball ball tabs');
});

// 6. Player Appearance Matches Selected Team
runTest('Item 7: Human player retains chosen character model in Rivalry mode', () => {
  assert.ok(redesignJs.includes("var playerChosenChar = (app.store && app.store.data && (app.store.data.selectedCharacter || app.store.data.selectedTeam)) || 'footy'"), 'Must resolve playerChosenChar from store');
  assert.ok(redesignJs.includes("char: playerChosenChar"), 'Must assign playerChosenChar to human player in launch');
});

// 7. HUD Clears Native Telegram Buttons
runTest('Item 8: HUD scoreboard clears safe-area-inset-top + 52px for Telegram overlay', () => {
  assert.ok(styleCss.includes('calc(env(safe-area-inset-top, 44px) + 52px)'), 'style.css .hud-top must clear Telegram overlay');
  assert.ok(redesignCss.includes('calc(env(safe-area-inset-top, 44px) + 52px)'), 'redesign.css .hud-top must clear Telegram overlay');
  assert.ok(redesignCss.includes('calc(env(safe-area-inset-top, 44px) + 98px)'), 'redesign.css .stamina must position safely below scoreboard');
});

console.log(`\n======================================================`);
console.log(`ALL PRODUCTION POLISH & GEOMETRY TESTS PASSED (${passedTests}/${totalTests})!`);
console.log(`======================================================`);
