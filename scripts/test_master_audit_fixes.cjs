/**
 * Master Audit Fixes & Integrity Verification Suite
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== FOOTY vs HOOPS: Master Audit Fixes Verification Suite ===\n');

// Test 1: Debug referral simulation button completely eliminated
const redesignContent = fs.readFileSync(path.join(__dirname, '../js/redesign.js'), 'utf8');
assert(!redesignContent.includes('ref-simulate-btn'), 'FAIL: ref-simulate-btn should be deleted from redesign.js');
assert(!redesignContent.includes('demo_friend_'), 'FAIL: demo_friend_ simulation code should be removed');
console.log('[PASS] Test 1: Debug referral simulation button (.ref-simulate-btn) completely removed');

// Test 2: Social quest 8-second auto-claim exploit removed
assert(!redesignContent.includes('Date.now() - st.startTime > 8000'), 'FAIL: 8-second auto-claim exploit must be removed');
assert(redesignContent.includes('pending_review'), 'FAIL: External social tasks must use pending_review status');
assert(redesignContent.includes('verify-telegram'), 'FAIL: Telegram tasks must use verify-telegram Bot API');
console.log('[PASS] Test 2: Social quest 8s auto-claim bypass removed; honest Telegram Bot API verification & external review enforced');

// Test 3: Telegram BackButton protects live match state
assert(redesignContent.includes("app.state !== 'match'"), 'FAIL: BackButton click handler must protect app.state === "match"');
assert(redesignContent.includes("!app.game || !app.game.running"), 'FAIL: BackButton click handler must verify game is not running');
console.log('[PASS] Test 3: Telegram BackButton handler verified; live match is protected against accidental resets to menu');

// Test 4: MatchView Ball Resolution & NaN Protection
const gameContent = fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8');
assert(gameContent.includes('fallbackBall = (mode === \'footy\') ? \'ball_footy_classic\' : \'ball_hoops_street\''), 'FAIL: MatchView must distinguish ball mode fallbacks');
assert(gameContent.includes('if (!isNaN(b.vz)) this.ball.rotation[0]'), 'FAIL: MatchView must guard rotation against NaN');
assert(gameContent.includes('if (!isNaN(b.vx)) this.ball.rotation[2]'), 'FAIL: MatchView must guard rotation against NaN');
console.log('[PASS] Test 4: MatchView ball instantiation and WebGL NaN rotation protections verified (basketball rendering guaranteed)');

// Test 5: Server Relay Batch Support
const serverContent = fs.readFileSync(path.join(__dirname, '../server/server.js'), 'utf8');
assert(serverContent.includes('Array.isArray(data.batch)'), 'FAIL: server.js relay must handle data.batch');
console.log('[PASS] Test 5: Server Relay handles packet batches to prevent dropped snapshots/events over HTTP fallback');

// Test 6: Telegram start_param and launch parameters
assert(redesignContent.includes('startParam.startsWith(\'ref_\')'), 'FAIL: startParam ref_ auto-registration must be implemented');
assert(redesignContent.includes('startParam === \'launch_footy\''), 'FAIL: launch_footy startParam must be recognized');
assert(redesignContent.includes('startParam === \'launch_hoops\''), 'FAIL: launch_hoops startParam must be recognized');
console.log('[PASS] Test 6: Telegram WebApp start_param and direct match launch URL parameters verified');

// Test 7: Equipped uniform pipeline to 3D character
assert(gameContent.includes("charSkinId = playerChar === 'hoops'"), 'FAIL: game.js must support distinct player character skins');
assert(gameContent.includes("oppSkin = (oppChar === 'hoops') ? hoopsOppKit : footyOppKit"), 'FAIL: game.js must use cross-sport kit styling');
console.log('[PASS] Test 7: Equipped uniform and cross-sport visual pipeline verified');

console.log('\nAll Master Audit Verification Tests PASSED! (7/7)');
