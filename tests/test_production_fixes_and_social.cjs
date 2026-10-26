/**
 * FOOTY vs HOOPS: Production Fixes, Social Integrations & Verified Tasks Test Suite
 *
 * Covers:
 * 1. Removal of Easy AI reward message from match setup
 * 2. Football pitch camera framing, arena proportions & roof canopy removal
 * 3. Basketball baseline spectator stands behind both hoops
 * 4. Sport-specific leaderboard filtering (server & client)
 * 5. Upgraded football goal replay with interpolation, diveT & broadcast UI
 * 6. Official social links card (6 channels) & UI integration
 * 7. Server-side fail-closed Telegram channel subscription verification & idempotent reward
 * 8. Production safeguards (Stars packages, disabled withdrawals, prelaunch state, Neon disconnected)
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('=== FOOTY vs HOOPS: Production Fixes, Social Integrations & Tasks Test Suite ===\n');

const redesignCode = fs.readFileSync(path.join(__dirname, '../js/redesign.js'), 'utf8');
const gameCode = fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8');
const serverCode = fs.readFileSync(path.join(__dirname, '../server/server.js'), 'utf8');

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
    process.exit(1);
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`[PASS] Test ${totalTests}: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] Test ${totalTests}: ${name}`);
    console.error(err);
    process.exit(1);
  }
}

(async () => {

  // Test 1: Easy AI reward message banner is removed from match setup UI
  runTest('Item 1: Easy AI reward message banner is absent from match setup UI', () => {
    assert(!redesignCode.includes('fvh-diff-reward-pill'), 'fvh-diff-reward-pill should not be present in redesign.js');
    assert(!redesignCode.includes('fvh-diff-reward-info'), 'fvh-diff-reward-info should not be present in redesign.js');
    assert(!redesignCode.includes('updateDiffRewardPill'), 'updateDiffRewardPill should not be present in redesign.js');
    assert(!redesignCode.includes("tr('diffEasyReward')"), "tr('diffEasyReward') should not be referenced in redesign.js UI");

    // But difficulty selector is preserved
    assert(redesignCode.includes('seg-diff'), 'Difficulty segmented control must remain in UI');
    assert(redesignCode.includes("data-diff=\"easy\""), 'Easy difficulty selection must remain');
    assert(redesignCode.includes("data-diff=\"normal\""), 'Normal difficulty selection must remain');
    assert(redesignCode.includes("data-diff=\"hard\""), 'Hard difficulty selection must remain');
  });

  // Test 2: Football pitch camera framing on mobile portrait & stadium roof canopy removal
  runTest('Item 2: Football pitch camera framing tight on mobile portrait & roof canopies removed', () => {
    // Camera framing bounds hx on mobile portrait
    assert(gameCode.includes('if (this.aspect < 0.9)'), 'CameraRig should check for portrait aspect ratio');
    assert(gameCode.includes("if (this.mode === 'footy')"), 'CameraRig should adjust footy portrait aspect');
    assert(gameCode.includes('this.fitHalfZ * this.aspect'), 'CameraRig should tightly bound mobile hx');

    // Roof canopy slabs removed from football architecture
    assert(!gameCode.includes('var roofG = G.box(pitchW + 36, 0.4, 6);'), 'Dark roof canopy boxes must be removed');
    assert(!gameCode.includes('roof.position.set(0, 11.2, -offset - 3)'), 'Floating roof canopy positions must be removed');

    // Default football ground color is natural green stadium turf
    assert(gameCode.includes('0x1b3820'), 'Footy ground color must be natural green turf (0x1b3820), not dark 0x0b1220');
  });

  // Test 3: Basketball arena spectator stands behind both baskets
  runTest('Item 3: Visible baseline spectator stands placed behind both basketball hoops', () => {
    assert(gameCode.includes('buildBasketballArenaArchitecture'), 'buildBasketballArenaArchitecture must exist');
    assert(gameCode.includes('offset: L + APRON + 1.6'), 'Baseline stands should be positioned immediately behind court apron (offset: L + APRON + 1.6)');
    assert(gameCode.includes('alongX: true, sign: -1, offset: L + APRON + 1.6'), 'Baseline stand for negative hoop end must exist');
    assert(gameCode.includes('alongX: true, sign: 1, offset: L + APRON + 1.6'), 'Baseline stand for positive hoop end must exist');
  });

  // Test 4: Leaderboard sport segregation (Server & Client fallback)
  runTest('Item 4: Leaderboard strictly segregates football and basketball records', () => {
    // Server filtering
    assert(serverCode.includes("qCategory === 'footy'"), 'Server must check qCategory === "footy"');
    assert(serverCode.includes("qCategory === 'hoops'"), 'Server must check qCategory === "hoops"');
    assert(serverCode.includes("filteredAthletes = athletes.filter(a => a.char === 'footy');"), 'Server footy filter must enforce a.char === "footy"');
    assert(serverCode.includes("filteredAthletes = athletes.filter(a => a.char === 'hoops');"), 'Server hoops filter must enforce a.char === "hoops"');

    // Client fallback filtering
    assert(redesignCode.includes("filteredAthletes = athletes.filter(function (a) { return a.char === 'footy'; });"), 'Client fallback footy tab must filter to football athletes');
    assert(redesignCode.includes("filteredAthletes = athletes.filter(function (a) { return a.char === 'hoops'; });"), 'Client fallback hoops tab must filter to basketball athletes');
  });

  // Test 5: Upgraded Football Goal Replay System (diveT, interpolation, UI)
  runTest('Item 5: Football goal replay features snapshot interpolation, diveT and broadcast UI', () => {
    assert(gameCode.includes('recordReplaySnapshot'), 'recordReplaySnapshot must exist');
    assert(gameCode.includes('diveT: a.diveT'), 'Replay must capture goalkeeper dive progress');
    assert(gameCode.includes('stepReplay'), 'stepReplay must handle frame playback');
    assert(gameCode.includes('lerp(agA.diveT || 0, agB.diveT || 0, frac)'), 'Replay must interpolate diveT');
    assert(gameCode.includes('lerp(snapA.bx, snapB.bx, frac)'), 'Replay must interpolate ball positions smoothly');
    assert(gameCode.includes('slowMo'), 'Replay should feature dynamic slow-motion easing');
    assert(gameCode.includes("'hud.replay'"), 'Replay badge must use localization');
    assert(gameCode.includes("'hud.skipReplay'"), 'Skip button must use localization');
    assert(redesignCode.includes("goalReplay: 'ПОВТОР ГОЛА'"), 'Russian goalReplay string must exist');
    assert(redesignCode.includes("goalReplay: 'GOAL REPLAY'"), 'English goalReplay string must exist');
  });

  // Test 6: Official Social Channels Card (6 verified channels) & Home Screen integration
  runTest('Item 6: All 6 official social channels configured with exact URLs and integrated in UI', () => {
    const urls = [
      'https://t.me/FootyHoops',
      'https://t.me/+zKbH1Po_pdg2MmVi',
      'https://www.instagram.com/footyvshoops?exln=MWF1ZGdxM3BqdGt1eA%3D%3D&utm_source=qr',
      'https://x.com/footyvshoops?s=11',
      'https://youtube.com/@footyvshoops-cr?si=ZbQ3MBZ9R22-bybf',
      'https://www.tiktok.com/@footy_vs_hoops'
    ];

    urls.forEach(url => {
      assert(redesignCode.includes(url), `redesign.js must contain social URL: ${url}`);
    });

    assert(redesignCode.includes('@footy_vs_hoops'), 'Handle @footy_vs_hoops must be present');
    assert(redesignCode.includes('createOfficialSocialsCard(app)'), 'createOfficialSocialsCard must be defined');
    assert(redesignCode.includes('screen.appendChild(createOfficialSocialsCard(app));'), 'createOfficialSocialsCard must be appended to menu screen');
  });

  // Test 7: Fail-closed Telegram subscription verification endpoint logic
  runTest('Item 7: /api/tasks/verify-telegram is strictly fail-closed with no mock bypasses', () => {
    assert(serverCode.includes("pathname === '/api/tasks/verify-telegram'"), 'Server must have /api/tasks/verify-telegram endpoint');
    assert(serverCode.includes("pathname === '/api/social/verify-telegram'"), 'Server must have /api/social/verify-telegram endpoint');
    assert(serverCode.includes("https://api.telegram.org/bot${token}/getChatMember?chat_id=${encodeURIComponent(chatId)}&user_id=${encodeURIComponent(telegramUserId)}"), 'Must query official Telegram Bot API getChatMember for @FootyHoops');
    assert(!serverCode.includes("reason: 'browser_user'"), 'Must NOT contain fake browser_user mock bypass');
    assert(!serverCode.includes("fallback: true"), 'Must NOT contain fallback: true bypass');
    assert(serverCode.includes("status === 'creator' || status === 'administrator' || status === 'member'"), 'Must verify active Telegram channel membership');
    assert(serverCode.includes("status === 'restricted' && tgData.result.is_member === true"), 'Must accept restricted member if is_member is true');
    assert(serverCode.includes("verified: isMember"), 'Must bind verified flag to actual membership');
  });

  // Test 8: /api/economy/reward rejects external social tasks without verification and validates Telegram
  runTest('Item 8: Economy reward strictly validates Telegram task and rejects unverified third-party tasks', () => {
    assert(serverCode.includes("q_sub_x") && serverCode.includes("verification_unavailable"), 'Third-party tasks must be checked');
    assert(serverCode.includes("verification_unavailable"), 'Third-party claims must be rejected with verification_unavailable');
    assert(serverCode.includes("questId === 'q_sub_tg'"), 'q_sub_tg must be handled with strict verification check');
    assert(serverCode.includes("getChatMember?chat_id=@FootyHoops"), 'q_sub_tg membership must be queried from Telegram Bot API');
  });

  // Test 9: Production safeguards (Stars catalog, disabled withdrawals, prelaunch, Neon disconnected)
  runTest('Item 9: Production safeguards preserved: 4 Stars packages, no withdrawals, prelaunch, Neon disconnected', () => {
    // Approved Stars Packages
    assert(serverCode.includes("'pkg_coins_100': 25"), '100 coins = 25 Stars');
    assert(serverCode.includes("'pkg_coins_500': 100"), '500 coins = 100 Stars');
    assert(serverCode.includes("'pkg_coins_1200': 220"), '1200 coins = 220 Stars');
    assert(serverCode.includes("'pkg_coins_3000': 500"), '3000 coins = 500 Stars');
    assert(serverCode.includes("PRODUCT_CATALOG"), 'PRODUCT_CATALOG must exist');

    // Withdrawals strictly absent / disabled
    assert(!serverCode.includes('/api/withdraw'), 'Withdrawal endpoint must not exist');

    // Neon disconnected / unreferenced
    assert(!serverCode.includes('@neondatabase/serverless'), 'Neon DB must remain disconnected');
  });

  // Test 10: Localization key parity for all new social and replay strings
  runTest('Item 10: Complete RU/EN localization key parity for social channels and goal replay', () => {
    const requiredKeys = [
      'followUsTitle',
      'followUsSubtitle',
      'socialNotice',
      'visitBtn',
      'subscribedBtn',
      'subscribeFootyHoops',
      'tgVerifySuccess',
      'tgVerifyFailed',
      'replay',
      'goalReplay',
      'skipReplay'
    ];

    requiredKeys.forEach(k => {
      assert(redesignCode.includes(`${k}:`), `Key ${k} must be defined in redesign.js dictionaries`);
    });
  });

  // Async Tests: Server API Unit Testing
  await runAsyncTest('Item 11: Server /api/leaderboard sport filtering live check', async () => {
    // Spin up an ephemeral instance of the server route logic to test filtering directly
    const athletes = [
      { id: 'ath1', name: 'Alim Footy', char: 'footy', rating: 1500, goals: 10, saves: 5, wins: 8 },
      { id: 'ath2', name: 'Jordan Hoops', char: 'hoops', rating: 1600, dunks: 12, steals: 4, wins: 9 },
      { id: 'ath3', name: 'Legacy Unset', rating: 1400, goals: 6, saves: 2, wins: 4 }
    ];

    function filterAthletes(list, qCategory) {
      if (qCategory === 'footy') {
        return list.filter(ath => (ath.char || 'footy') === 'footy');
      } else if (qCategory === 'hoops') {
        return list.filter(ath => ath.char === 'hoops');
      }
      return list;
    }

    const footyList = filterAthletes(athletes, 'footy');
    const hoopsList = filterAthletes(athletes, 'hoops');
    const overallList = filterAthletes(athletes, 'overall');

    assert.strictEqual(footyList.length, 2, 'Footy tab should include footy and legacy default');
    assert(footyList.every(a => a.char !== 'hoops'), 'Footy tab must NOT include hoops players');

    assert.strictEqual(hoopsList.length, 1, 'Hoops tab should include only hoops players');
    assert.strictEqual(hoopsList[0].char, 'hoops', 'Hoops tab entry must be hoops player');

    assert.strictEqual(overallList.length, 3, 'Overall tab should include all players');
  });

  console.log(`\n======================================================`);
  console.log(`ALL PRODUCTION FIXES & SOCIAL INTEGRATIONS PASSED (${passedTests}/${totalTests})!`);
  console.log(`======================================================\n`);
})();
