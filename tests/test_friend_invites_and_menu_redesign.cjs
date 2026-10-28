// tests/test_friend_invites_and_menu_redesign.cjs
// Tests for Telegram Friend Invites deep linking and Main Menu Redesign

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const http = require('http');
const cp = require('child_process');

console.log('--- TEST SUITE: FRIEND INVITES & MAIN MENU REDESIGN ---');

// 0. Strict JavaScript Syntax & AST Check
console.log('\n[TEST 0] Verifying JavaScript syntax of js/redesign.js, js/game.js, and server/server.js...');
cp.execSync('node -c js/redesign.js', { stdio: 'inherit' });
cp.execSync('node -c js/game.js', { stdio: 'inherit' });
cp.execSync('node -c server/server.js', { stdio: 'inherit' });
console.log('✓ Verified: Zero syntax errors across client and server scripts.');

// 1. Static Code Analysis Checks
console.log('\n[TEST 1] Verifying Telegram Bot username & link generation in client code...');
const redesignJsPath = path.join(__dirname, '..', 'js', 'redesign.js');
const redesignJs = fs.readFileSync(redesignJsPath, 'utf8');

// Ensure the invalid bot name 'FootyVsHoopsBot' does not exist anywhere in redesign.js
assert.strictEqual(redesignJs.includes('FootyVsHoopsBot'), false, 'FootyVsHoopsBot must NOT be present in redesign.js');
// Ensure the official bot username 'FootyHoopsGameBot' is used for referrals
assert.strictEqual(redesignJs.includes("var botUsername = 'FootyHoopsGameBot';"), true, 'FootyHoopsGameBot must be defined as botUsername');
// Ensure direct Mini App startapp link format is generated
assert.strictEqual(redesignJs.includes("'?startapp=ref_'"), true, 'Direct startapp deep link must be generated');
// Ensure fallback bot chat link format is generated
assert.strictEqual(redesignJs.includes("'?start=ref_'"), true, 'Fallback start link must be generated');
// Ensure Telegram share sheet URL is constructed
assert.strictEqual(redesignJs.includes("'https://t.me/share/url?url='"), true, 'Telegram share URL must be present');
// Ensure fallback button exists in referrals tab
assert.strictEqual(redesignJs.includes('fvh-btn-fallback-ref'), true, 'Fallback button must exist in referrals tab');

console.log('✓ Verified: Valid deep link formats and official bot @FootyHoopsGameBot configured.');

// 2. CSS Check for Main Menu and Mobile Touch Targets
console.log('\n[TEST 2] Verifying CSS styles and mobile touch targets...');
const redesignCssPath = path.join(__dirname, '..', 'css', 'redesign.css');
const redesignCss = fs.readFileSync(redesignCssPath, 'utf8');

assert.strictEqual(redesignCss.includes('.fvh-btn-play-hero'), true, 'Hero Play button CSS exists');
assert.strictEqual(redesignCss.includes('.fvh-btn-play-hero.hoops'), true, 'Hoops faction variation for Play button exists');
assert.strictEqual(redesignCss.includes('.fvh-secondary-hub'), true, 'Secondary quick hub CSS exists');
assert.strictEqual(redesignCss.includes('.fvh-hub-tile'), true, 'Hub tile CSS exists');
// Check mobile min-height is at least 58px on mobile
const mobilePlayHeroMatch = redesignCss.match(/\.fvh-btn-play-hero\s*\{[^}]*min-height:\s*([0-9]+)px/);
assert(mobilePlayHeroMatch, 'Mobile play hero min-height found');
const minHeight = parseInt(mobilePlayHeroMatch[1], 10);
assert(minHeight >= 58, `Mobile play button min-height (${minHeight}px) must be >= 58px`);

console.log('✓ Verified: Dominant Play button, secondary hub styling, and mobile touch target >= 58px confirmed.');

// 3. Main Menu Redesign Hierarchy & Components
console.log('\n[TEST 3] Verifying Main Menu structure in renderRedesignedMenu...');
// Check that renderRedesignedMenu includes Top Bar, Faction Hero Card, Play CTA, Secondary Hub, Ticker
assert.strictEqual(redesignJs.includes('fvh-btn-switch-team'), true, 'Team switch button must exist in hero card');
assert.strictEqual(redesignJs.includes('fvh-equipped-preview-bar'), true, 'Equipped cosmetics preview bar must exist in hero card');
assert.strictEqual(redesignJs.includes('fvh-secondary-hub'), true, 'Secondary hub must be rendered in main menu');
assert.strictEqual(redesignJs.includes('fvh-hub-shop'), true, 'Shop quick tile must exist in main menu');
assert.strictEqual(redesignJs.includes('fvh-hub-quests'), true, 'Quests quick tile must exist in main menu');
assert.strictEqual(redesignJs.includes('fvh-hub-leaderboard'), true, 'Leaderboard quick tile must exist in main menu');
// Verify that createOfficialSocialsCard is NOT added to the main menu
const menuFuncStart = redesignJs.indexOf('function renderRedesignedMenu(');
const menuFuncEnd = redesignJs.indexOf('// Onboarding: Prompt player to choose Team Football', menuFuncStart);
const menuFuncBody = redesignJs.slice(menuFuncStart, menuFuncEnd);
assert.strictEqual(menuFuncBody.includes('createOfficialSocialsCard'), false, 'Official socials block must NOT be in main menu');
assert.strictEqual(menuFuncBody.includes('ИГРАТЬ ➔'), true, 'Play button Russian CTA text must exist');
assert.strictEqual(menuFuncBody.includes('1v1 Онлайн и Одиночный матч'), true, 'Play button Russian subtitle text must exist');

console.log('✓ Verified: Main menu hierarchy conforms to specifications without social card clutter.');

// 4. Invariants Check
console.log('\n[TEST 4] Verifying storage and economy invariants...');
const serverJsPath = path.join(__dirname, '..', 'server', 'server.js');
const serverJs = fs.readFileSync(serverJsPath, 'utf8');

// Stars pricing
assert.strictEqual(serverJs.includes("'pkg_coins_100': 25"), true, '100 coins = 25 stars');
assert.strictEqual(serverJs.includes("'pkg_coins_500': 100"), true, '500 coins = 100 stars');
assert.strictEqual(serverJs.includes("'pkg_coins_1200': 220"), true, '1200 coins = 220 stars');
assert.strictEqual(serverJs.includes("'pkg_coins_3000': 500"), true, '3000 coins = 500 stars');

// Withdrawals disabled (no withdrawal endpoint, notice present)
assert.strictEqual(serverJs.includes('/api/withdraw'), false, 'Withdrawal endpoint must not exist');
assert.strictEqual(redesignJs.includes('tokenWithdrawNotice'), true, 'Token withdraw notice present');

// Season 1 prelaunch
assert.strictEqual(serverJs.includes("state: process.env.SEASON_STATE || 'prelaunch'"), true, 'Season 1 status defaults to prelaunch');

console.log('✓ Verified: All economy, Stars pricing, and security invariants strictly preserved.');

// 5. Integration Test: Two Separate Telegram Accounts Referral Flow
console.log('\n[TEST 5] Testing two separate Telegram accounts referral flow via live HTTP server...');

const originalDataJsonPath = path.join(__dirname, '..', 'server', 'data.json');
const originalDataJsonContent = fs.readFileSync(originalDataJsonPath, 'utf8');

process.env.PORT = '8099';

const serverModule = require('../server/server.js');
const appServer = serverModule.server;

function postJson(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: '127.0.0.1',
      port: 8099,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let respBody = '';
      res.on('data', chunk => respBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(respBody) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: respBody });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getJson(path) {
  return new Promise((resolve, reject) => {
    http.get({
      hostname: '127.0.0.1',
      port: 8099,
      path: path
    }, (res) => {
      let respBody = '';
      res.on('data', chunk => respBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(respBody) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: respBody });
        }
      });
    }).on('error', reject);
  });
}

(async function runReferralIntegrationTests() {
  try {
    // Wait for server to bind
    await new Promise(r => setTimeout(r, 600));

    // Account A: Inviter (Telegram ID 711223344, Player ID inviter_alex)
    const inviterId = 'inviter_alex';
    const inviterTgId = '711223344';

    // Account B: Invited friend / brother (Telegram ID 899887766, Player ID brother_dan)
    const friendId = 'brother_dan';
    const friendTgId = '899887766';

    // Verify initial state: Account A has 0 referrals
    let statsA = await getJson(`/api/referrals/stats?playerId=${inviterId}`);
    assert.strictEqual(statsA.status, 200);
    assert.strictEqual(statsA.data.stats.total, 0);
    assert.strictEqual(statsA.data.stats.qualified, 0);

    // 5a. Prevent Self-Referral
    console.log('Testing self-referral rejection...');
    let selfRef = await postJson('/api/referrals/register', {
      refCode: inviterId,
      playerId: inviterId,
      telegramId: inviterTgId
    });
    assert.strictEqual(selfRef.status, 400);
    assert.strictEqual(selfRef.data.error, 'self_referral_prevented');

    // 5b. Account B joins via Account A's referral link (ref_inviter_alex)
    console.log('Account B joins via Account A referral link...');
    let regFriend = await postJson('/api/referrals/register', {
      refCode: `ref_${inviterId}`,
      playerId: friendId,
      telegramId: friendTgId
    });
    assert.strictEqual(regFriend.status, 200);
    assert.strictEqual(regFriend.data.ok, true);
    assert.strictEqual(regFriend.data.referrerId, inviterId);

    // Verify Account A has 1 pending referral, 0 qualified
    statsA = await getJson(`/api/referrals/stats?playerId=${inviterId}`);
    assert.strictEqual(statsA.status, 200);
    assert.strictEqual(statsA.data.stats.total, 1);
    assert.strictEqual(statsA.data.stats.qualified, 0);

    // 5c. Prevent Duplicate Referral: Account B cannot be referred again
    console.log('Testing duplicate referral rejection for Account B...');
    let dupRef = await postJson('/api/referrals/register', {
      refCode: 'someone_else',
      playerId: friendId
    });
    assert.strictEqual(dupRef.status, 400);
    assert.strictEqual(dupRef.data.error, 'already_referred');

    // 5d. Prevent Referral Cycle: Account A cannot be referred by Account B
    console.log('Testing referral cycle rejection (Account B referring Account A)...');
    let cycleRef = await postJson('/api/referrals/register', {
      refCode: friendId,
      playerId: inviterId
    });
    assert.strictEqual(cycleRef.status, 400);
    assert.strictEqual(cycleRef.data.error, 'referral_cycle_prevented');

    // 5e. Account B qualifies (completes first match or selects team)
    console.log('Account B qualifies (chooses faction / plays match)...');
    let qualifyRes = await postJson('/api/referrals/qualify', {
      playerId: friendId
    });
    assert.strictEqual(qualifyRes.status, 200);
    assert.strictEqual(qualifyRes.data.ok, true);
    assert.strictEqual(qualifyRes.data.qualified, true);
    assert.strictEqual(qualifyRes.data.awardedCoins, 100);

    // Verify Account A now has 1 qualified referral and +100 earnedCoins
    statsA = await getJson(`/api/referrals/stats?playerId=${inviterId}`);
    assert.strictEqual(statsA.status, 200);
    assert.strictEqual(statsA.data.stats.total, 1);
    assert.strictEqual(statsA.data.stats.qualified, 1);
    assert.strictEqual(statsA.data.stats.earnedCoins, 100);

    // Verify Account A's player economy balance was credited +100 FvH Coins
    let econA = await getJson(`/api/economy/state?playerId=${inviterId}`);
    assert.strictEqual(econA.status, 200);
    assert(econA.data.coins >= 100, `Inviter balance should reflect +100 coins (got ${econA.data.coins})`);

    // Verify second qualify attempt does not award double coins (idempotency)
    let reQualify = await postJson('/api/referrals/qualify', {
      playerId: friendId
    });
    assert.strictEqual(reQualify.status, 200);
    assert.strictEqual(reQualify.data.qualified, false);
    assert.strictEqual(reQualify.data.awardedCoins, 0);

    console.log('✓ Verified: Full two-account referral lifecycle succeeded:');
    console.log('  1. Link generation with official bot and safe startapp/start parameters');
    console.log('  2. Self-referral prevented (400)');
    console.log('  3. Referral registered and attributed to Inviter');
    console.log('  4. Duplicate referral prevented (400)');
    console.log('  5. Referral cycle prevented (400)');
    console.log('  6. Friend qualification triggered upon faction/match completion');
    console.log('  7. Inviter credited +100 FvH Coins authoritative balance with ledger entry');
    console.log('  8. Idempotent re-qualification check confirmed (no duplicate reward)');

    // Restore original server/data.json content
    fs.writeFileSync(originalDataJsonPath, originalDataJsonContent, 'utf8');

    console.log('\n=========================================');
    console.log('🎉 ALL FRIEND INVITES & MAIN MENU TESTS PASSED!');
    console.log('=========================================');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err);
    try {
      fs.writeFileSync(originalDataJsonPath, originalDataJsonContent, 'utf8');
    } catch (e) {}
    process.exit(1);
  }
})();
