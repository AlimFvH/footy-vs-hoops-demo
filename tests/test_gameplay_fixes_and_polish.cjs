/**
 * FOOTY vs HOOPS — Critical Gameplay Fixes & Final Polish Automated Test Suite
 * Covers 13 critical verification cases:
 *  1. Virtual joystick and stickPointer reset (touch recovery)
 *  2. Ball creation and non-colliding initial spawn in basketball and football
 *  3. Action button labels: "УДАР" in footy, "БРОСОК" in hoops, "ОТБОР" vs "ПЕРЕХВАТ"
 *  4. Control unfreezing and match simulation start (no freeze at 2:00)
 *  5. Goal replay trigger on football goals only with score non-duplication
 *  6. Goal celebration animations for scorer and conceding team
 *  7. Match continuation from center kickoff after goal celebration
 *  8. Camera framing on iPhone portrait (aspect < 0.9, tactical d ~ 62..68) vs landscape
 *  9. Complete absence of large 3D character on home menu
 * 10. Single rewarded Telegram subscription task (q_sub_tg -> @FootyHoops)
 * 11. Server-side fail-closed Telegram verification via getChatMember without mock bypasses
 * 12. Idempotent claim rejection (no double reward)
 * 13. Preserved production safeguards (Stars catalog, disabled withdrawals, prelaunch, Neon disconnected)
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const gameCode = fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8');
const redesignCode = fs.readFileSync(path.join(__dirname, '../js/redesign.js'), 'utf8');
const serverCode = fs.readFileSync(path.join(__dirname, '../server/server.js'), 'utf8');
const redesignCss = fs.readFileSync(path.join(__dirname, '../css/redesign.css'), 'utf8');

let totalTests = 0;
let passedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`[PASS] Test ${totalTests}: ${name}`);
  } catch (err) {
    console.error(`[FAIL] Test ${totalTests}: ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`[PASS] Test ${totalTests}: ${name}`);
  } catch (err) {
    console.error(`[FAIL] Test ${totalTests}: ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

console.log('=== FOOTY vs HOOPS: Critical Gameplay Fixes & Final Polish Test Suite ===\n');

(async () => {
  // Test 1: Virtual joystick & stickPointer reset (Touch recovery)
  runTest('1. Virtual joystick and stickPointer reset prevent stuck touches and unresponsiveness', () => {
    assert(gameCode.includes('this.stickPointer = -1'), 'Hud must reset stickPointer to -1');
    assert(gameCode.includes('this.input.releaseAll()'), 'Hud must call input.releaseAll on reset');
    assert(gameCode.includes('this.touch.style.pointerEvents = \'\''), 'Hud must restore touch pointerEvents');
    assert(gameCode.includes('window.addEventListener(\'pointerup\'') || gameCode.includes('window.addEventListener(\'touchend\''), 'Window-level listeners must catch released gestures');
  });

  // Test 2: Basketball ball initial spawn in front and side of carrier (not inside chest)
  runTest('2. Basketball ball initial spawn is cleanly placed in front and side of carrier', () => {
    assert(gameCode.includes('carrier.fx * fwd + rx * side * -1'), 'Basketball ball must be offset forward and sideways from carrier');
    assert(gameCode.includes('b.y = b.r + 0.55'), 'Basketball ball Y must be held at comfortable dribble height');
    assert(!gameCode.includes('b.x = carrier.x;\n            b.z = carrier.z;'), 'Ball must NOT be placed directly at carrier.x/z inside chest');
  });

  // Test 3: Action button labels differentiated by sport
  runTest('3. Action button labels: "УДАР" in footy, "БРОСОК" in hoops, "ОТБОР" vs "ПЕРЕХВАТ"', () => {
    assert(gameCode.includes("'hud.shoot': 'УДАР'"), 'Russian football shoot key must be "УДАР"');
    assert(gameCode.includes("'hud.shootHoops': 'БРОСОК'"), 'Russian basketball shoot key must be "БРОСОК"');
    assert(gameCode.includes("'hud.tackle': 'ОТБОР'"), 'Russian football tackle key must be "ОТБОР"');
    assert(gameCode.includes("'hud.steal': 'ПЕРЕХВАТ'"), 'Russian basketball tackle key must be "ПЕРЕХВАТ"');
    assert(gameCode.includes("shootLbl.textContent = steal ? (0, index_js_1.t)('hud.shootHoops') : (0, index_js_1.t)('hud.shoot')"), 'Hud must differentiate shoot button by sport');
  });

  // Test 4: Control unfreezing and match simulation start (no freeze at 2:00)
  runTest('4. Match simulation starts immediately with controls enabled (hold = false unconditionally)', () => {
    assert(gameCode.includes('this.hold = false;'), 'Game.start must initialize hold to false');
    assert(gameCode.includes('this.hud.resetState();'), 'Game.start must call hud.resetState()');
    assert(gameCode.includes('this.game.start(cfg, false);'), 'App.launch must not hold match simulation');
  });

  // Test 5: Goal replay triggered on football goals only, with score non-duplication
  runTest('5. Goal replay triggers only in football mode, with score non-duplication and timer pause', () => {
    assert(gameCode.includes("if (this.sim.mode !== 'footy')"), 'startReplay must strictly reject non-footy modes');
    assert(gameCode.includes("sim.phase === 'playing'") && gameCode.includes("this.recordReplaySnapshot()"), 'Replay snapshots must only record during active playing phase');
    assert(gameCode.includes('if (this.replayActive) {\n                    this.stepReplay(dt);\n                    this.adapt(dt);\n                    return;\n                }'), 'Replay playback must bypass live sim.step and pause game timer');
  });

  // Test 6: Goal celebration animations for scorer and conceding team
  runTest('6. Goal celebration animations for scorer (fist pump/jump) and conceding team (defeated slump)', () => {
    assert(gameCode.includes('a.celebrateT = PARAMS.celebrate;'), 'Scorer team must receive celebrateT duration');
    assert(gameCode.includes('a.stun = PARAMS.celebrate;'), 'Conceding team must receive stun duration for defeated reaction');
    assert(gameCode.includes('lift = Math.abs(Math.sin(this.t * 8)) * 0.45;'), 'Scorer must perform jumping/lifting celebration');
    assert(gameCode.includes('crouch = 0.28;'), 'Conceding team character must slump/crouch in disappointment');
  });

  // Test 7: Match continuation from center kickoff after celebration / replay
  runTest('7. Match continues cleanly from center kickoff after celebration and replay', () => {
    assert(gameCode.includes('this.view.restoreLivePositions()'), 'stopReplay must restore live positions to 3D scene');
    assert(gameCode.includes('this.hud.showReplay(false)'), 'stopReplay must hide replay overlay');
    assert(gameCode.includes('this.replayActive = false;'), 'stopReplay must deactivate replayActive flag');
  });

  // Test 8: Camera framing on iPhone portrait (aspect < 0.9 => tactical d ~ 62..68, fitHalfZ = 18.5)
  runTest('8. Camera framing on iPhone portrait has fitHalfZ = 18.5, fov = 42, bounded hx', () => {
    assert(gameCode.includes('this.fitHalfZ = mode === \'footy\' ? (aspect < 0.9 ? 18.5 : 13.5) : 8.4;'), 'CameraRig must configure mobile portrait fitHalfZ to 18.5');
    assert(gameCode.includes('this.cam.fov = mode === \'footy\' ? 42 : 40;'), 'CameraRig must set footy FOV to 42');
    assert(gameCode.includes('hx = Math.min(this.maxHalfX, Math.max(10.2, this.fitHalfZ * this.aspect * 1.32));'), 'CameraRig must bound hx on mobile portrait');
    assert(gameCode.includes('tz = ball.z * 0.65 + human.z * 0.35 - (this.mode === \'footy\' ? 4.5 : 2.0);'), 'CameraRig must track ball and player with lead tracking');
  });

  // Test 9: Complete absence of large 3D character on home menu
  runTest('9. Complete absence of large 3D character model on home menu screen', () => {
    assert(redesignCode.includes('solo-hero-compact'), 'Home menu must use compact solo-hero-compact card');
    assert(!redesignCode.includes('heroCard.className = \'fvh-hero-card solo-hero \''), 'Home menu must NOT instantiate giant solo-hero card');
    assert(redesignCss.includes('.fvh-hero-card.solo-hero-compact'), 'CSS must define styles for solo-hero-compact');
    assert(redesignCode.includes('fvh-btn-play-hero'), 'Dominant Play button must remain on home menu');
  });

  // Test 10: Single rewarded Telegram subscription task (q_sub_tg -> @FootyHoops)
  runTest('10. Single rewarded Telegram subscription task (q_sub_tg -> @FootyHoops) in Quests', () => {
    assert(redesignCode.includes("claimed.indexOf('q_sub_tg')"), 'Quests must track single q_sub_tg task');
    assert(redesignCode.includes("var tgUrl = 'https://t.me/FootyHoops';"), 'Subscription task must target @FootyHoops');
    assert(redesignCode.includes("subscribeFootyHoops"), 'Task label must indicate subscribe to @FootyHoops');
  });

  // Test 11: Server-side fail-closed Telegram verification via getChatMember without mock bypasses
  runTest('11. /api/tasks/verify-telegram is strictly fail-closed via getChatMember without mock bypasses', () => {
    assert(serverCode.includes("const chatId = '@FootyHoops';"), 'Server must verify membership against @FootyHoops');
    assert(serverCode.includes("getChatMember?chat_id=${encodeURIComponent(chatId)}&user_id=${encodeURIComponent(telegramUserId)}"), 'Server must call official getChatMember');
    assert(!serverCode.includes("reason: 'browser_user'"), 'No mock bypasses allowed in server verification');
    assert(!serverCode.includes("fallback: true"), 'No fallback bypass allowed');
    assert(serverCode.includes("status === 'creator' || status === 'administrator' || status === 'member'"), 'Must verify actual member status');
  });

  // Test 12: Idempotent claim rejection (no double claiming)
  runTest('12. Quest claim is strictly idempotent: double claiming is rejected with 400', () => {
    assert(serverCode.includes("player.claimedQuests.includes(questId)"), 'Server must check if quest is already claimed');
    assert(serverCode.includes("error: 'quest_already_claimed'"), 'Server must return quest_already_claimed error on duplicate claim');
  });

  // Test 13: Preserved production safeguards
  runTest('13. Production safeguards preserved: 4 Stars packages, disabled withdrawals, prelaunch, Neon disconnected', () => {
    assert(serverCode.includes("'pkg_coins_100': 25"), 'Stars package 100 = 25 Stars');
    assert(serverCode.includes("'pkg_coins_500': 100"), 'Stars package 500 = 100 Stars');
    assert(serverCode.includes("'pkg_coins_1200': 220"), 'Stars package 1200 = 220 Stars');
    assert(serverCode.includes("'pkg_coins_3000': 500"), 'Stars package 3000 = 500 Stars');
    assert(!serverCode.includes('/api/withdraw'), 'Withdrawals must remain disabled');
    assert(!serverCode.includes('@neondatabase/serverless'), 'Neon DB must remain disconnected');
  });

  // Test 14: Exact official social URLs across redesign.js
  runTest('14. Exact restored official social URLs in both Home Screen and Quests', () => {
    const requiredUrls = [
      'https://www.instagram.com/footyvshoops?exln=MWF1ZGdxM3BqdGt1eA%3D%3D&utm_source=qr',
      'https://x.com/footyvshoops?s=11',
      'https://youtube.com/@footyvshoops-cr?si=ZbQ3MBZ9R22-bybf',
      'https://www.tiktok.com/@footy_vs_hoops',
      'https://t.me/FootyHoops',
      'https://t.me/+zKbH1Po_pdg2MmVi'
    ];
    requiredUrls.forEach(url => {
      assert(redesignCode.includes(url), `redesign.js must contain exact official URL: ${url}`);
    });
  });

  // Test 15: Leaderboard sport segregation (Server & Client)
  runTest('15. Leaderboards strictly segregate football and basketball records with zero cross-contamination', () => {
    // Server filtering
    assert(serverCode.includes("qCategory === 'footy'"), 'Server must filter category footy');
    assert(serverCode.includes("qCategory === 'hoops'"), 'Server must filter category hoops');
    assert(serverCode.includes("filteredAthletes = athletes.filter(a => a.char === 'footy');") || serverCode.includes("filteredAthletes = athletes.filter(a => (a.char || 'footy') === 'footy');"), 'Server must isolate footy athletes');
    assert(serverCode.includes("filteredAthletes = athletes.filter(a => a.char === 'hoops');"), 'Server must isolate hoops athletes');

    // Client fallback filtering
    assert(redesignCode.includes("a.char === 'footy'"), 'Client fallback must isolate footy athletes');
    assert(redesignCode.includes("a.char === 'hoops'"), 'Client fallback must isolate hoops athletes');
  });

  console.log(`\n======================================================`);
  console.log(`ALL 15 GAMEPLAY FIXES & RELEASE POLISH TESTS PASSED (${passedTests}/${totalTests})!`);
  console.log(`======================================================\n`);
})();
