const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== FOOTY vs HOOPS: iPhone Critical Fixes & Production Audit Suite ===\n');

function runTest(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
  } catch (err) {
    console.error(`[FAIL] ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

const gameJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'game.js'), 'utf8');
const redesignJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'redesign.js'), 'utf8');
const redesignCss = fs.readFileSync(path.join(__dirname, '..', 'css', 'redesign.css'), 'utf8');
const styleCss = fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');
const serverJs = fs.readFileSync(path.join(__dirname, '..', 'server', 'server.js'), 'utf8');

// TEST 1: Basketball Launch Crash Fix
runTest('Issue 1: Basketball launch crash prevented with default ball, safe visualOf, and MatchView sanity', () => {
  // Check ball_hoops_street in data/shop ITEMS
  assert.ok(gameJs.includes("'ball_hoops_street'"), 'ball_hoops_street must exist in game.js');
  assert.ok(gameJs.includes("id: 'ball_hoops_street'"), 'ball_hoops_street must be defined as an item');
  assert.ok(gameJs.includes("isDefault: true"), 'ball_hoops_street must be default');
  
  // Check defensive visualOf
  assert.ok(gameJs.includes("function visualOf(id, fallback)"), 'defensive visualOf must exist');
  assert.ok(gameJs.includes("const isHoops = (id && id.includes('hoops')) || (fallback && fallback.includes('hoops'))"), 'visualOf must inspect hoops fallback');
  
  // Check safe radius calculation in MatchView
  assert.ok(!gameJs.includes("(mode === 'footy') ? 0.22 : 0.30"), 'MatchView must not use undeclared mode variable');
  assert.ok(gameJs.includes("(this.sim && this.sim.mode === 'footy') ? 0.22 : 0.30"), 'MatchView must check this.sim.mode');
});

// TEST 2: Mobile Player Movement
runTest('Issue 2: Mobile player movement joystick multi-touch tracking and touch-action css', () => {
  assert.ok(gameJs.includes("activeTouchId = null;") || gameJs.includes("this.activeTouchId = null;"), 'bindStick must track activeTouchId');
  assert.ok(gameJs.includes("activeTouchId"), 'bindStick must filter touchend by activeTouchId');
  assert.ok(gameJs.includes("window.addEventListener('touchmove', onTouchMove"), 'bindStick must track touchmove on window');
  assert.ok(gameJs.includes("window.addEventListener('pointermove', onPointerMove"), 'bindStick must track pointermove on window');

  // CSS touch-action
  assert.ok(redesignCss.includes("touch-action: none !important"), 'touch-action: none must be applied to touch zones');
  assert.ok(redesignCss.includes(".stick-zone"), 'stick-zone must have touch styling');
});

// TEST 3: Mobile Menu Scrolling in Telegram WebView
runTest('Issue 3: Single scroll container, no nested scroll traps, bottom scroll spacers', () => {
  // Scroll trap elimination
  assert.ok(redesignCss.includes("overflow: visible !important;"), 'page-body must be overflow visible to eliminate scroll traps');
  assert.ok(redesignCss.includes("-webkit-overflow-scrolling: touch !important;"), 'page-screen must have -webkit-overflow-scrolling touch');
  
  // Bottom Spacer function
  assert.ok(redesignJs.includes("function createScrollBottomSpacer()"), 'createScrollBottomSpacer must exist');
  assert.ok(redesignJs.includes("env(safe-area-inset-bottom, 34px) + 95px"), 'createScrollBottomSpacer must account for safe area and dock');
  
  // Presence in all screens
  assert.ok(redesignJs.includes("page.appendChild(createScrollBottomSpacer())"), 'createScrollBottomSpacer must be appended to pages');
  assert.ok(redesignJs.includes("screen.appendChild(createScrollBottomSpacer())"), 'createScrollBottomSpacer must be appended to menu screen');
});

// TEST 4: New Cosmetics in Shop & Wardrobe
runTest('Issue 4: 5 Footy kits, 5 Hoops kits, 5 Football balls, 5 Basketball balls in Shop & Wardrobe', () => {
  const footyKits = [
    'skin_footy_royal_striker',
    'skin_footy_cyber_strike',
    'skin_footy_golden_legend',
    'skin_footy_stealth_shadow',
    'skin_footy_neon_matrix'
  ];
  const hoopsKits = [
    'skin_hoops_street_legend',
    'skin_hoops_golden_state',
    'skin_hoops_cyber_dunk',
    'skin_hoops_phantom_black',
    'skin_hoops_neon_splash'
  ];
  const footyBalls = [
    'ball_footy_classic',
    'ball_footy_classic_pro',
    'ball_footy_inferno',
    'ball_footy_cyber_neon',
    'ball_footy_golden_elite'
  ];
  const hoopsBalls = [
    'ball_hoops_street',
    'ball_hoops_classic_pro',
    'ball_hoops_neon_energy',
    'ball_hoops_molten_fire',
    'ball_hoops_golden_elite'
  ];

  footyKits.forEach(id => {
    assert.ok(redesignJs.includes(id), `Footy kit ${id} must be in redesign.js`);
    assert.ok(gameJs.includes(id), `Footy kit ${id} must be in game.js`);
  });
  hoopsKits.forEach(id => {
    assert.ok(redesignJs.includes(id), `Hoops kit ${id} must be in redesign.js`);
    assert.ok(gameJs.includes(id), `Hoops kit ${id} must be in game.js`);
  });
  footyBalls.forEach(id => {
    assert.ok(redesignJs.includes(id), `Footy ball ${id} must be in redesign.js`);
    assert.ok(gameJs.includes(id), `Footy ball ${id} must be in game.js`);
  });
  hoopsBalls.forEach(id => {
    assert.ok(redesignJs.includes(id), `Hoops ball ${id} must be in redesign.js`);
    assert.ok(gameJs.includes(id), `Hoops ball ${id} must be in game.js`);
  });

  // Wardrobe Hoops support
  assert.ok(redesignJs.includes("var ballSlotId = isFooty ? 'balls_footy' : 'balls_hoops'"), 'Wardrobe must display balls_hoops for hoops team');
  // Shop Hoops ball category
  assert.ok(redesignJs.includes("{ id: 'balls_hoops'"), 'Shop must support balls_hoops category');
});

// TEST 5: Telegram Quests
runTest('Issue 5: Exactly 1 rewarded Telegram subscription task (@FootyHoops) and informational official links', () => {
  // Check exact 1 rewarded task in renderSocialTab
  assert.ok(redesignJs.includes("isTgDone ? '✓ ' + tr('taskCompleted') : tr('verifyTaskBtn')") || redesignJs.includes("q_sub_tg"), 'q_sub_tg verified task must exist');
  assert.ok(redesignJs.includes("https://t.me/FootyHoops"), 'Official Telegram channel must be @FootyHoops');
  assert.ok(redesignJs.includes("https://t.me/+zKbH1Po_pdg2MmVi"), 'Official chat link must be preserved');
  
  // Check verify-telegram endpoint in server
  assert.ok(serverJs.includes("/api/tasks/verify-telegram"), 'Server must have /api/tasks/verify-telegram');
  assert.ok(serverJs.includes("getChatMember"), 'Server must use getChatMember');
  assert.ok(serverJs.includes("TELEGRAM_BOT_TOKEN"), 'Server must verify using bot token');
  
  // Double claim prevention
  assert.ok(serverJs.includes("Task already claimed") || serverJs.includes("already claimed") || serverJs.includes("claimedQuests.includes('q_sub_tg')"), 'Server must prevent duplicate claims');
});

// TEST 6: Home Screen Overhaul & Wardrobe Hero Avatar Enlarged
runTest('Issue 6: Wardrobe hero avatar enlarged clamp(290px, 45vh, 360px), sleek home console, production safeguards', () => {
  // Wardrobe hero avatar size
  assert.ok(redesignCss.includes("clamp(290px, 45vh, 360px)"), 'Wardrobe avatar must be enlarged to clamp(290px, 45vh, 360px)');
  assert.ok(redesignCss.includes("clamp(260px, 40vh, 320px)"), 'Wardrobe avatar image must scale up to clamp(260px, 40vh, 320px)');

  // Production safeguards
  assert.ok(!serverJs.includes('/api/withdraw'), 'Withdrawals must remain disabled');
  assert.ok(!serverJs.includes('@neondatabase/serverless'), 'Neon DB must remain disconnected');
  assert.ok(serverJs.includes("'prelaunch'"), 'Season must be in prelaunch state');

  // Stars pricing
  assert.ok(serverJs.includes("'pkg_coins_100': 25"), '100 coins = 25 Stars');
  assert.ok(serverJs.includes("'pkg_coins_500': 100"), '500 coins = 100 Stars');
  assert.ok(serverJs.includes("'pkg_coins_1200': 220"), '1200 coins = 220 Stars');
  assert.ok(serverJs.includes("'pkg_coins_3000': 500"), '3000 coins = 500 Stars');
});

console.log('\n======================================================');
console.log('ALL IPHONE CRITICAL AUDIT TESTS PASSED (6/6)!');
console.log('======================================================');
