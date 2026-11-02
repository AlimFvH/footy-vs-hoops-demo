/**
 * Regression Test Suite for:
 * 1. Telegram Social-Task Rewards (Channel & Community Chat End-to-End)
 * 2. Server-side Telegram Verification & Reward Eligibility
 * 3. Non-member, API error, duplicate claim & missing user ID handling
 * 4. External social tasks integrity (TikTok, YouTube, Twitter/X, Instagram)
 * 5. Authoritative Economy Sync including claimedQuests
 * 6. Mini App Startup Error Diagnostics & Secret Redaction
 * 7. Duplicate Telegram WebApp Script Prevention
 */

const assert = require('assert');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8995;
process.env.PORT = String(PORT);
process.env.NODE_ENV = 'test';
process.env.TELEGRAM_BOT_TOKEN = '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ123456789';
process.env.TELEGRAM_CHANNEL_ID = '@FootyHoops';
process.env.TELEGRAM_CHAT_ID = '-1004427370833';

// Mock global.fetch to intercept Telegram Bot API calls strictly offline
let lastTgApiCall = null;
let mockTgApiResponse = null;
let mockTgApiShouldThrow = false;

const originalFetch = global.fetch;
global.fetch = async function (url, opts) {
  const urlStr = String(url);
  if (urlStr.includes('api.telegram.org')) {
    lastTgApiCall = { url: urlStr, opts };
    if (mockTgApiShouldThrow) {
      throw new Error('Telegram network connection timeout');
    }
    return {
      ok: mockTgApiResponse && mockTgApiResponse.ok !== false,
      json: async () => mockTgApiResponse
    };
  }
  return originalFetch.apply(this, arguments);
};

// Start server
const server = require('../server/server.js');

function post(endpoint, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body || {});
    const req = http.request({
      hostname: '127.0.0.1',
      port: PORT,
      path: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, res => {
      let buf = '';
      res.on('data', c => buf += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(buf) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: buf });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(endpoint) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: PORT,
      path: endpoint,
      method: 'GET'
    }, res => {
      let buf = '';
      res.on('data', c => buf += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(buf) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: buf });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('=== FOOTY vs HOOPS: Telegram Social Tasks & Startup Suite ===\n');
  await new Promise(r => setTimeout(r, 600));

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
      process.exitCode = 1;
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
      process.exitCode = 1;
    }
  }

  // 1. Channel membership verification and reward crediting (q_sub_tg)
  await testAsync('Telegram Channel (q_sub_tg) verification and reward crediting', async () => {
    lastTgApiCall = null;
    mockTgApiShouldThrow = false;
    mockTgApiResponse = {
      ok: true,
      result: {
        status: 'member',
        user: { id: 111222333, first_name: 'TestUser' }
      }
    };

    const playerId = 'tg_player_channel_' + Date.now();
    const res = await post('/api/tasks/verify-telegram', {
      playerId: playerId,
      telegramUserId: '111222333',
      target: 'channel',
      questId: 'q_sub_tg',
      claim: true
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.ok, true);
    assert.strictEqual(res.data.verified, true);
    assert.strictEqual(res.data.claimed, true);
    assert.strictEqual(res.data.questId, 'q_sub_tg');
    assert.strictEqual(res.data.coins, 400); // 350 starting coins + 50 reward
    assert.strictEqual(res.data.xp, 50);

    // Verify correct target chat parameter was queried
    assert.ok(lastTgApiCall !== null);
    assert.ok(lastTgApiCall.url.includes('chat_id=%40FootyHoops'));
    assert.ok(lastTgApiCall.url.includes('user_id=111222333'));
  });

  // 2. Community Chat membership verification and reward crediting (q_sub_chat)
  await testAsync('Telegram Community Chat (q_sub_chat) verification and reward crediting', async () => {
    lastTgApiCall = null;
    mockTgApiShouldThrow = false;
    mockTgApiResponse = {
      ok: true,
      result: {
        status: 'member',
        user: { id: 444555666, first_name: 'ChatUser' }
      }
    };

    const playerId = 'tg_player_chat_' + Date.now();
    const res = await post('/api/tasks/verify-telegram', {
      playerId: playerId,
      telegramUserId: '444555666',
      target: 'chat',
      questId: 'q_sub_chat',
      claim: true
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.ok, true);
    assert.strictEqual(res.data.verified, true);
    assert.strictEqual(res.data.claimed, true);
    assert.strictEqual(res.data.questId, 'q_sub_chat');
    assert.strictEqual(res.data.coins, 400); // 350 starting coins + 50 reward
    assert.strictEqual(res.data.xp, 50);

    // Verify correct chat identifier was queried for community chat
    assert.ok(lastTgApiCall !== null);
    assert.ok(lastTgApiCall.url.includes('chat_id=-1004427370833'));
    assert.ok(lastTgApiCall.url.includes('user_id=444555666'));
  });

  // 3. Non-member response
  await testAsync('Non-member returns verified: false without crediting rewards', async () => {
    mockTgApiShouldThrow = false;
    mockTgApiResponse = {
      ok: true,
      result: {
        status: 'left'
      }
    };

    const playerId = 'tg_player_nonmember_' + Date.now();
    const res = await post('/api/tasks/verify-telegram', {
      playerId: playerId,
      telegramUserId: '999888777',
      target: 'channel',
      questId: 'q_sub_tg',
      claim: true
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.ok, true);
    assert.strictEqual(res.data.verified, false);
    assert.strictEqual(res.data.status, 'left');
    assert.strictEqual(res.data.claimed, undefined);
  });

  // 4. API Error Handling (502)
  await testAsync('Telegram API error returns 502 with clean error description', async () => {
    mockTgApiShouldThrow = true;

    const playerId = 'tg_player_apierr_' + Date.now();
    const res = await post('/api/tasks/verify-telegram', {
      playerId: playerId,
      telegramUserId: '123123123',
      target: 'channel',
      questId: 'q_sub_tg',
      claim: true
    });

    assert.strictEqual(res.status, 502);
    assert.strictEqual(res.data.ok, false);
    assert.strictEqual(res.data.error, 'telegram_api_error');
    assert.strictEqual(res.data.verified, false);
  });

  // 5. Missing / invalid Telegram user ID
  await testAsync('Missing Telegram user ID returns 400', async () => {
    const res = await post('/api/tasks/verify-telegram', {
      playerId: 'test_p_missing',
      target: 'channel',
      questId: 'q_sub_tg'
    });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.ok, false);
    assert.strictEqual(res.data.error, 'missing_telegram_user_id');
  });

  // 6. Duplicate claim rejection
  await testAsync('Duplicate claim of Telegram task returns 400 quest_already_claimed', async () => {
    mockTgApiShouldThrow = false;
    mockTgApiResponse = {
      ok: true,
      result: { status: 'member' }
    };

    const playerId = 'tg_player_dup_' + Date.now();
    // First claim: success
    const res1 = await post('/api/tasks/verify-telegram', {
      playerId: playerId,
      telegramUserId: '777666555',
      target: 'channel',
      questId: 'q_sub_tg',
      claim: true
    });
    assert.strictEqual(res1.status, 200);
    assert.strictEqual(res1.data.claimed, true);

    // Second claim: rejected
    const res2 = await post('/api/tasks/verify-telegram', {
      playerId: playerId,
      telegramUserId: '777666555',
      target: 'channel',
      questId: 'q_sub_tg',
      claim: true
    });
    assert.strictEqual(res2.status, 400);
    assert.strictEqual(res2.data.ok, false);
    assert.strictEqual(res2.data.error, 'quest_already_claimed');
    assert.strictEqual(res2.data.verified, true);
  });

  // 7. Authoritative server-side verification in /api/tasks/claim-social
  await testAsync('Server-side verification enforced in /api/tasks/claim-social for Telegram tasks', async () => {
    const playerId = 'tg_player_socialclaim_' + Date.now();

    // A. Rejects if telegramUserId is missing
    const resNoId = await post('/api/tasks/claim-social', {
      playerId: playerId,
      questId: 'q_sub_tg'
    });
    assert.strictEqual(resNoId.status, 400);
    assert.strictEqual(resNoId.data.error, 'missing_telegram_user_id');

    // B. Rejects if user is not subscribed
    mockTgApiShouldThrow = false;
    mockTgApiResponse = { ok: true, result: { status: 'left' } };
    const resNotSub = await post('/api/tasks/claim-social', {
      playerId: playerId,
      questId: 'q_sub_tg',
      telegramUserId: '555444333'
    });
    assert.strictEqual(resNotSub.status, 400);
    assert.strictEqual(resNotSub.data.error, 'not_subscribed');

    // C. Succeeds when user is verified member
    mockTgApiResponse = { ok: true, result: { status: 'member' } };
    const resSub = await post('/api/tasks/claim-social', {
      playerId: playerId,
      questId: 'q_sub_tg',
      telegramUserId: '555444333'
    });
    assert.strictEqual(resSub.status, 200);
    assert.strictEqual(resSub.data.ok, true);
    assert.strictEqual(resSub.data.coinsEarned, 50);
  });

  // 8. External social tasks remain functional without regression
  await testAsync('External social tasks (TikTok, YouTube, Twitter, Instagram) claim successfully', async () => {
    const playerId = 'external_social_player_' + Date.now();

    const tiktokRes = await post('/api/tasks/claim-social', {
      playerId: playerId,
      questId: 'q_sub_tiktok'
    });
    assert.strictEqual(tiktokRes.status, 200);
    assert.strictEqual(tiktokRes.data.coinsEarned, 50);

    const ytRes = await post('/api/tasks/claim-social', {
      playerId: playerId,
      questId: 'q_sub_yt'
    });
    assert.strictEqual(ytRes.status, 200);
    assert.strictEqual(ytRes.data.coinsEarned, 50);

    const xRes = await post('/api/tasks/claim-social', {
      playerId: playerId,
      questId: 'q_sub_x'
    });
    assert.strictEqual(xRes.status, 200);
    assert.strictEqual(xRes.data.coinsEarned, 50);

    // Duplicate check for external task
    const dupTiktok = await post('/api/tasks/claim-social', {
      playerId: playerId,
      questId: 'q_sub_tiktok'
    });
    assert.strictEqual(dupTiktok.status, 400);
    assert.strictEqual(dupTiktok.data.error, 'quest_already_claimed');
  });

  // 9. Economy sync returns claimedQuests
  await testAsync('/api/economy/sync returns claimedQuests for client state hydration', async () => {
    const playerId = 'sync_player_' + Date.now();

    // Claim one external task first
    await post('/api/tasks/claim-social', {
      playerId: playerId,
      questId: 'q_sub_yt'
    });

    // Call sync
    const syncRes = await post('/api/economy/sync', {
      playerId: playerId
    });

    assert.strictEqual(syncRes.status, 200);
    assert.strictEqual(syncRes.data.ok, true);
    assert.ok(Array.isArray(syncRes.data.claimedQuests));
    assert.ok(syncRes.data.claimedQuests.includes('q_sub_yt'));
  });

  // 10. Startup error handler secret redaction
  test('Error handler sanitizes bot tokens, hex hashes, and secrets', () => {
    // Load error-handler.js code in mock window environment
    const errorHandlerCode = fs.readFileSync(path.join(__dirname, '../js/error-handler.js'), 'utf8');
    const mockWindow = {
      addEventListener: () => {}
    };
    const fn = new Function('window', 'document', errorHandlerCode);
    fn(mockWindow, {});

    const redact = mockWindow.__fvhErrorHandler.redactSecrets;
    assert.ok(redact);

    // Bot token redaction
    const tokenStr = 'Error: connection failed with 8354664806:AAHnIjETn8jMISGsvpNs6zkU35_q340vuXk on endpoint';
    const cleanToken = redact(tokenStr);
    assert.ok(!cleanToken.includes('8354664806:AAHnIjETn8jMISGsvpNs6zkU35_q340vuXk'));
    assert.ok(cleanToken.includes('[REDACTED_BOT_TOKEN]'));

    // Key-value secret redaction
    const secretStr = 'Query failed at ?token=secret12345&secret=adminPass&other=1';
    const cleanSecret = redact(secretStr);
    assert.ok(!cleanSecret.includes('secret12345'));
    assert.ok(!cleanSecret.includes('adminPass'));
    assert.ok(cleanSecret.includes('token=[REDACTED]'));
    assert.ok(cleanSecret.includes('secret=[REDACTED]'));

    // Hex hash redaction
    const hashStr = 'Validation mismatch for hash a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0';
    const cleanHash = redact(hashStr);
    assert.ok(!cleanHash.includes('a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0'));
    assert.ok(cleanHash.includes('[REDACTED_HASH]'));
  });

  // 11. Error handler ignores generic "Script error." when app is initialized or external
  test('Error handler ignores non-fatal external Script error when app is running', () => {
    const errorHandlerCode = fs.readFileSync(path.join(__dirname, '../js/error-handler.js'), 'utf8');
    let fatalShown = false;
    const mockWindow = {
      __fvh: { store: { data: {} } },
      addEventListener: () => {}
    };
    const mockDoc = {
      getElementById: (id) => {
        if (id === 'fatal') {
          return {
            hidden: true,
            appendChild: () => { fatalShown = true; },
            innerHTML: ''
          };
        }
        return null;
      }
    };
    const fn = new Function('window', 'document', errorHandlerCode);
    fn(mockWindow, mockDoc);

    // Trigger generic "Script error."
    mockWindow.__fvhErrorHandler.handleError('Script error.', '', 0, 0, null);
    assert.strictEqual(fatalShown, false, 'Fatal overlay must NOT be displayed for non-fatal Script error while app is running');

    // Trigger error from telegram.org
    mockWindow.__fvhErrorHandler.handleError('Uncaught TypeError', 'https://telegram.org/js/telegram-web-app.js', 12, 5, null);
    assert.strictEqual(fatalShown, false, 'Fatal overlay must NOT be displayed for external telegram-web-app script error');
  });

  // 12. Duplicate script injection prevention in core/telegram.ts
  test('core/telegram checks for existing telegram-web-app.js script tag before injection', () => {
    const gameJsCode = fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8');
    assert.ok(
      gameJsCode.includes("document.querySelector('script[src*=\"telegram-web-app.js\"]')"),
      'game.js must check for existing telegram-web-app.js script tag to prevent double loading'
    );
  });

  // 13. Client redesign.js passes claim: true and handles reward crediting directly
  test('js/redesign.js passes claim: true for Telegram verification and credits reward', () => {
    const redesignJsCode = fs.readFileSync(path.join(__dirname, '../js/redesign.js'), 'utf8');
    assert.ok(
      redesignJsCode.includes('claim: true'),
      'redesign.js verifyTelegramTask must request reward claim on verification'
    );
    assert.ok(
      redesignJsCode.includes('storeData.claimedQuests = res.claimedQuests'),
      'syncAuthoritativeEconomy must hydrate claimedQuests from authoritative server'
    );
  });

  console.log(`\n========================================`);
  console.log(`Tests finished: ${passed}/${total} passed (${total - passed} failed)`);
  console.log(`========================================\n`);

  process.exit(passed === total ? 0 : 1);
}

runTests();
