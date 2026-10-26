/**
 * Test Suite: Comprehensive Temporary Server-Side Webhook Registration Security Suite
 * Verifies:
 * 1. Disabled when REGISTRATION_AUTH_KEY is not in env (404)
 * 2. Disabled when key is < 16 chars (404)
 * 3. POST-only enforcement (405)
 * 4. Missing authorization header rejected (403)
 * 5. Invalid authorization key rejected with timing-safe comparison (403)
 * 6. In-flight concurrency lock blocks overlapping requests (429)
 * 7. Authorized registration executes setWebhook, verifies before/after, leaks 0 secrets (200)
 * 8. Verification of both before & after getWebhookInfo calls
 * 9. Persistent Single-Use Guard: Repeated authorized request on same instance rejected (410)
 * 10. Multi-Restart / Instance Cloud Guard: Repeated request after restart when Telegram already has URL registered rejected (409)
 * 11. Failure & Retry Scenario: Transient Telegram setWebhook error does NOT lock user out, permitting a retry
 * 12. Precheck Failure (Telegram ok:false): setWebhook is NEVER called (502)
 * 13. Precheck Failure (Network error / Timeout): setWebhook is NEVER called (502)
 * 14. Precheck Failure (Invalid JSON): setWebhook is NEVER called (502)
 * 15. Lockfile Write Failure: Server returns 200 with localLockEstablished=false and lockWarning, cloud guard remains active
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const TEST_PORT = 8525;
const TEST_DATA_FILE = 'tests/temp_test_reg_data.json';
const TEST_LOCK_FILE = 'tests/temp_test_reg.lock';

process.env.PORT = TEST_PORT;
process.env.DATA_FILE = TEST_DATA_FILE;
process.env.REGISTRATION_LOCK_FILE = TEST_LOCK_FILE;
process.env.NODE_ENV = 'test';

const originalRequest = https.request;
let mockTelegramCalls = [];
let getWebhookCallCount = 0;

function setupTelegramMock(beforeUrl = '', afterUrl = 'https://footy-vs-hoops.onrender.com/api/telegram/webhook', setWebhookBehavior = 'success') {
  mockTelegramCalls = [];
  getWebhookCallCount = 0;
  https.request = function (options, callback) {
    if (options.hostname === 'api.telegram.org') {
      const urlPath = options.path;
      const isSetWebhook = urlPath.includes('/setWebhook');
      const isGetWebhookInfo = urlPath.includes('/getWebhookInfo');

      const mockRes = new (require('events').EventEmitter)();
      mockRes.statusCode = 200;
      mockRes.headers = { 'content-type': 'application/json' };

      const mockReq = {
        on: () => mockReq,
        setTimeout: () => mockReq,
        destroy: () => {},
        write: (chunk) => {
          try {
            mockTelegramCalls.push({ path: urlPath, body: JSON.parse(chunk.toString()) });
          } catch (e) {
            mockTelegramCalls.push({ path: urlPath, raw: chunk.toString() });
          }
        },
        end: () => {
          process.nextTick(() => {
            callback(mockRes);
            if (isSetWebhook) {
              mockTelegramCalls.push({ path: urlPath, type: 'setWebhook' });
              if (setWebhookBehavior === 'fail') {
                mockRes.emit('data', JSON.stringify({ ok: false, error_code: 500, description: 'Telegram internal server error' }));
              } else {
                mockRes.emit('data', JSON.stringify({ ok: true, result: true, description: 'Webhook was set' }));
              }
            } else if (isGetWebhookInfo) {
              getWebhookCallCount++;
              const reportedUrl = getWebhookCallCount <= 1 ? beforeUrl : afterUrl;
              mockTelegramCalls.push({ path: urlPath, type: 'getWebhookInfo', count: getWebhookCallCount });
              mockRes.emit('data', JSON.stringify({
                ok: true,
                result: {
                  url: reportedUrl,
                  has_custom_certificate: false,
                  pending_update_count: 0,
                  allowed_updates: ['message', 'pre_checkout_query', 'successful_payment']
                }
              }));
            } else {
              mockRes.emit('data', JSON.stringify({ ok: true, result: {} }));
            }
            mockRes.emit('end');
          });
        }
      };
      return mockReq;
    }
    return originalRequest.apply(https, arguments);
  };
}

function restoreTelegramMock() {
  https.request = originalRequest;
}

function request(method, reqPath, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const reqHeaders = { ...headers };
    if (postData) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }
    const req = http.request({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: reqPath,
      method,
      headers: reqHeaders
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

function cleanupTempFiles() {
  if (fs.existsSync(TEST_DATA_FILE)) {
    try { fs.unlinkSync(TEST_DATA_FILE); } catch (e) {}
  }
  if (fs.existsSync(TEST_LOCK_FILE)) {
    try { fs.unlinkSync(TEST_LOCK_FILE); } catch (e) {}
  }
}

async function run() {
  console.log('=== FOOTY vs HOOPS: Comprehensive Temporary Webhook Registration Security Suite ===\n');

  cleanupTempFiles();

  // Load server
  require('../server/server.js');
  await new Promise(r => setTimeout(r, 600));

  try {
    const validKey = 'mock_reg_secret_key_1234567890abcdef';
    process.env.TELEGRAM_BOT_TOKEN = '123456789:ABCDEF_mock_token_123456';
    process.env.TELEGRAM_WEBHOOK_SECRET = 'mock_webhook_secret_xyz123';

    // 1. Guard: Endpoint disabled (404) when REGISTRATION_AUTH_KEY is not set
    delete process.env.REGISTRATION_AUTH_KEY;
    const test1 = await request('POST', '/api/internal/register-webhook', {
      'x-registration-auth': validKey
    });
    assert.strictEqual(test1.status, 404, 'Must return 404 when REGISTRATION_AUTH_KEY is not configured');
    console.log('[PASS] Test 1: Endpoint returns 404 when REGISTRATION_AUTH_KEY is unconfigured in env.');

    // 2. Guard: Endpoint disabled (404) when key is too short (< 16 chars)
    process.env.REGISTRATION_AUTH_KEY = 'short_key';
    const test2 = await request('POST', '/api/internal/register-webhook', {
      'x-registration-auth': 'short_key'
    });
    assert.strictEqual(test2.status, 404, 'Must return 404 when REGISTRATION_AUTH_KEY is too short');
    console.log('[PASS] Test 2: Endpoint returns 404 when REGISTRATION_AUTH_KEY is shorter than 16 chars.');

    // Configure valid temporary key
    process.env.REGISTRATION_AUTH_KEY = validKey;

    // 3. Guard: POST-only enforcement
    const test3 = await request('GET', '/api/internal/register-webhook', {
      'x-registration-auth': validKey
    });
    assert.strictEqual(test3.status, 405, 'Must return 405 on non-POST method');
    console.log('[PASS] Test 3: Endpoint strictly rejects non-POST requests with 405 Method Not Allowed.');

    // 4. Guard: Missing authorization header (403)
    const test4 = await request('POST', '/api/internal/register-webhook', {});
    assert.strictEqual(test4.status, 403, 'Must return 403 on missing authorization header');
    assert.strictEqual(test4.body.error, 'unauthorized');
    console.log('[PASS] Test 4: Missing x-registration-auth header rejected with 403 Forbidden.');

    // 5. Guard: Invalid authorization header / timing-safe mismatch (403)
    const test5 = await request('POST', '/api/internal/register-webhook', {
      'x-registration-auth': 'wrong_secret_key_1234567890abcdef'
    });
    assert.strictEqual(test5.status, 403, 'Must return 403 on mismatched authorization header');
    assert.strictEqual(test5.body.error, 'unauthorized');
    console.log('[PASS] Test 5: Incorrect authorization key rejected with 403 Forbidden.');

    // 6. Test Concurrency Lock (429 when another registration is in-flight)
    let slowRequestResolve;
    const slowPromise = new Promise(r => slowRequestResolve = r);
    setupTelegramMock('', 'https://footy-vs-hoops.onrender.com/api/telegram/webhook');
    
    // Hook https.request to delay setWebhook
    const defaultMock = https.request;
    https.request = function (options, callback) {
      if (options.hostname === 'api.telegram.org' && options.path.includes('/setWebhook')) {
        const mockRes = new (require('events').EventEmitter)();
        mockRes.statusCode = 200;
        mockRes.headers = { 'content-type': 'application/json' };
        const mockReq = {
          on: () => mockReq,
          setTimeout: () => mockReq,
          destroy: () => {},
          write: (chunk) => {
            mockTelegramCalls.push({ path: options.path, type: 'setWebhook', body: JSON.parse(chunk.toString()) });
          },
          end: () => {
            slowPromise.then(() => {
              callback(mockRes);
              mockRes.emit('data', JSON.stringify({ ok: true, result: true, description: 'Webhook was set' }));
              mockRes.emit('end');
            });
          }
        };
        return mockReq;
      }
      return defaultMock.apply(https, arguments);
    };

    const firstReqPromise = request('POST', '/api/internal/register-webhook', {
      'x-registration-auth': validKey
    });
    await new Promise(r => setTimeout(r, 60));

    const concurrentReq = await request('POST', '/api/internal/register-webhook', {
      'x-registration-auth': validKey
    });
    assert.strictEqual(concurrentReq.status, 429, 'Concurrent request must be rejected with 429 Too Many Requests');
    assert.strictEqual(concurrentReq.body.error, 'registration_in_progress');
    console.log('[PASS] Test 6: Concurrent registration requests are locked and rejected with 429.');

    // Release slow request and verify it finishes with 200
    slowRequestResolve();
    const firstRes = await firstReqPromise;
    assert.strictEqual(firstRes.status, 200, 'First request must complete with 200 OK once lock released');
    assert.strictEqual(firstRes.body.ok, true);
    assert.strictEqual(firstRes.body.localLockEstablished, true);
    assert.strictEqual(firstRes.body.cloudGuardActive, true);
    assert.strictEqual(firstRes.body.setWebhookResult.ok, true);
    assert.strictEqual(firstRes.body.after.url, 'https://footy-vs-hoops.onrender.com/api/telegram/webhook');
    assert.deepStrictEqual(firstRes.body.after.allowed_updates, ['message', 'pre_checkout_query', 'successful_payment']);

    // Check payload passed to setWebhook
    const setWebhookCall = mockTelegramCalls.find(c => c.body && c.body.url);
    assert(setWebhookCall, 'setWebhook must have been called');
    assert.strictEqual(setWebhookCall.body.url, 'https://footy-vs-hoops.onrender.com/api/telegram/webhook');
    assert.strictEqual(setWebhookCall.body.secret_token, 'mock_webhook_secret_xyz123');
    assert.deepStrictEqual(setWebhookCall.body.allowed_updates, ['message', 'pre_checkout_query', 'successful_payment']);

    // Zero secret leakage check
    const responseStr = JSON.stringify(firstRes.body);
    assert(!responseStr.includes('mock_webhook_secret_xyz123'), 'Response must NEVER leak webhook secret');
    assert(!responseStr.includes('mock_token'), 'Response must NEVER leak bot token');
    assert(!responseStr.includes(validKey), 'Response must NEVER leak registration key');
    console.log('[PASS] Test 7: Authorized registration executed setWebhook, checked before & after states, and leaked 0 secrets.');

    // 8. Verify both getWebhookInfo calls were made (before and after)
    const getWebhookCalls = mockTelegramCalls.filter(c => c.type === 'getWebhookInfo');
    assert.strictEqual(getWebhookCalls.length, 2, 'Must query getWebhookInfo twice (before and after)');
    console.log('[PASS] Test 8: Both before and after Telegram webhook state inspections confirmed.');

    // 9. Persistent Single-Use Guard: Repeated request on same instance
    assert(fs.existsSync(TEST_LOCK_FILE), 'Lockfile must be present on disk after successful registration');
    mockTelegramCalls = [];
    const test9 = await request('POST', '/api/internal/register-webhook', {
      'x-registration-auth': validKey
    });
    assert.strictEqual(test9.status, 410, 'Repeated request must be rejected with 410 Gone');
    assert.strictEqual(test9.body.error, 'registration_already_executed');
    assert.strictEqual(mockTelegramCalls.length, 0, 'No calls to Telegram API must occur when local lockfile exists');
    console.log('[PASS] Test 9: Repeated authorized request on same instance rejected with 410 Gone (zero Telegram calls).');

    // 10. Multi-Restart / Instance Cloud Guard: Lockfile missing, but Telegram cloud already has webhook set
    if (fs.existsSync(TEST_LOCK_FILE)) fs.unlinkSync(TEST_LOCK_FILE);
    setupTelegramMock('https://footy-vs-hoops.onrender.com/api/telegram/webhook', 'https://footy-vs-hoops.onrender.com/api/telegram/webhook');
    const test10 = await request('POST', '/api/internal/register-webhook', {
      'x-registration-auth': validKey
    });
    assert.strictEqual(test10.status, 409, 'Must return 409 Conflict when Telegram already has the webhook registered');
    assert.strictEqual(test10.body.error, 'webhook_already_registered');
    assert.strictEqual(test10.body.cloudGuardActive, true);
    assert(test10.body.current.url.includes('footy-vs-hoops.onrender.com'), 'Must report current active webhook URL');
    // Verify setWebhook was NEVER called
    const setWebhookAttempt = mockTelegramCalls.find(c => c.type === 'setWebhook');
    assert(!setWebhookAttempt, 'setWebhook must NOT be called when Telegram already has the webhook set');
    console.log('[PASS] Test 10: Multi-restart cloud guard verified: 409 Conflict returned and setWebhook blocked when already active in Telegram cloud.');

    // 11. Failure & Retry Scenario: Transient Telegram setWebhook failure does NOT lock out user
    if (fs.existsSync(TEST_LOCK_FILE)) fs.unlinkSync(TEST_LOCK_FILE);
    setupTelegramMock('', '', 'fail');
    const test11Failure = await request('POST', '/api/internal/register-webhook', {
      'x-registration-auth': validKey
    });
    assert.strictEqual(test11Failure.status, 502, 'Must return 502 Bad Gateway when Telegram setWebhook fails');
    assert.strictEqual(test11Failure.body.ok, false);
    assert.strictEqual(test11Failure.body.error, 'telegram_set_webhook_failed');
    assert(!fs.existsSync(TEST_LOCK_FILE), 'Lockfile must NOT be written when registration fails');
    console.log('  [11a] Transient Telegram setWebhook failure returned 502 and did not write lockfile.');

    // Retry after failure succeeds
    setupTelegramMock('', 'https://footy-vs-hoops.onrender.com/api/telegram/webhook', 'success');
    const test11Retry = await request('POST', '/api/internal/register-webhook', {
      'x-registration-auth': validKey
    });
    assert.strictEqual(test11Retry.status, 200, 'Retry after failure must succeed with 200 OK');
    assert.strictEqual(test11Retry.body.ok, true);
    assert(fs.existsSync(TEST_LOCK_FILE), 'Lockfile must be created once retry succeeds');
    console.log('[PASS] Test 11: Failure and retry scenario confirmed: transient errors allow retry, success locks endpoint.');

    // 12. Precheck Failure (Telegram ok: false): setWebhook must NEVER be called
    if (fs.existsSync(TEST_LOCK_FILE)) fs.unlinkSync(TEST_LOCK_FILE);
    mockTelegramCalls = [];
    https.request = function (options, callback) {
      if (options.hostname === 'api.telegram.org') {
        mockTelegramCalls.push({ path: options.path, type: options.path.includes('/setWebhook') ? 'setWebhook' : 'getWebhookInfo' });
        const mockRes = new (require('events').EventEmitter)();
        mockRes.statusCode = 401;
        process.nextTick(() => {
          callback(mockRes);
          mockRes.emit('data', JSON.stringify({ ok: false, error_code: 401, description: 'Unauthorized: invalid bot token' }));
          mockRes.emit('end');
        });
        return { on: () => {}, setTimeout: () => {}, destroy: () => {}, write: () => {}, end: () => {} };
      }
      return originalRequest.apply(https, arguments);
    };

    const test12 = await request('POST', '/api/internal/register-webhook', {
      'x-registration-auth': validKey
    });
    assert.strictEqual(test12.status, 502, 'Precheck ok:false must return 502');
    assert.strictEqual(test12.body.error, 'telegram_precheck_failed');
    assert(!mockTelegramCalls.some(c => c.type === 'setWebhook'), 'setWebhook must NEVER be called when precheck returns ok:false');
    assert(!fs.existsSync(TEST_LOCK_FILE), 'Lockfile must NOT be written on precheck failure');
    console.log('[PASS] Test 12: Precheck Telegram ok:false stops execution immediately (setWebhook NEVER called).');

    // 13. Precheck Failure (Network error / Timeout): setWebhook must NEVER be called
    if (fs.existsSync(TEST_LOCK_FILE)) fs.unlinkSync(TEST_LOCK_FILE);
    mockTelegramCalls = [];
    https.request = function (options) {
      if (options.hostname === 'api.telegram.org') {
        mockTelegramCalls.push({ path: options.path, type: options.path.includes('/setWebhook') ? 'setWebhook' : 'getWebhookInfo' });
        const mockReq = new (require('events').EventEmitter)();
        mockReq.write = () => {};
        mockReq.end = () => {
          process.nextTick(() => mockReq.emit('error', new Error('ECONNRESET: socket hang up')));
        };
        mockReq.setTimeout = () => {};
        mockReq.destroy = () => {};
        return mockReq;
      }
      return originalRequest.apply(https, arguments);
    };

    const test13 = await request('POST', '/api/internal/register-webhook', {
      'x-registration-auth': validKey
    });
    assert.strictEqual(test13.status, 502, 'Precheck network error must return 502');
    assert.strictEqual(test13.body.error, 'telegram_precheck_failed');
    assert(!mockTelegramCalls.some(c => c.type === 'setWebhook'), 'setWebhook must NEVER be called when precheck encounters network error');
    assert(!fs.existsSync(TEST_LOCK_FILE), 'Lockfile must NOT be written on network failure');
    console.log('[PASS] Test 13: Precheck network error stops execution immediately (setWebhook NEVER called).');

    // 14. Precheck Failure (Invalid JSON): setWebhook must NEVER be called
    if (fs.existsSync(TEST_LOCK_FILE)) fs.unlinkSync(TEST_LOCK_FILE);
    mockTelegramCalls = [];
    https.request = function (options, callback) {
      if (options.hostname === 'api.telegram.org') {
        mockTelegramCalls.push({ path: options.path, type: options.path.includes('/setWebhook') ? 'setWebhook' : 'getWebhookInfo' });
        const mockRes = new (require('events').EventEmitter)();
        mockRes.statusCode = 200;
        process.nextTick(() => {
          callback(mockRes);
          mockRes.emit('data', '<html><body>Cloudflare Bad Gateway</body></html>');
          mockRes.emit('end');
        });
        return { on: () => {}, setTimeout: () => {}, destroy: () => {}, write: () => {}, end: () => {} };
      }
      return originalRequest.apply(https, arguments);
    };

    const test14 = await request('POST', '/api/internal/register-webhook', {
      'x-registration-auth': validKey
    });
    assert.strictEqual(test14.status, 502, 'Precheck invalid JSON must return 502');
    assert.strictEqual(test14.body.error, 'telegram_precheck_failed');
    assert(!mockTelegramCalls.some(c => c.type === 'setWebhook'), 'setWebhook must NEVER be called when precheck returns invalid JSON');
    assert(!fs.existsSync(TEST_LOCK_FILE), 'Lockfile must NOT be written on invalid JSON');
    console.log('[PASS] Test 14: Precheck invalid JSON response stops execution immediately (setWebhook NEVER called).');

    // 15. Lockfile Write Failure: Server returns 200 with localLockEstablished=false and lockWarning
    // Point REGISTRATION_LOCK_FILE to an unwritable directory/path
    process.env.REGISTRATION_LOCK_FILE = 'tests/non_existent_dir_xyz/lockfile.lock';
    setupTelegramMock('', 'https://footy-vs-hoops.onrender.com/api/telegram/webhook', 'success');
    const test15 = await request('POST', '/api/internal/register-webhook', {
      'x-registration-auth': validKey
    });
    assert.strictEqual(test15.status, 200, 'Registration must succeed even if local lockfile write fails');
    assert.strictEqual(test15.body.localLockEstablished, false, 'Must report localLockEstablished: false');
    assert.strictEqual(test15.body.cloudGuardActive, true, 'Must document cloudGuardActive: true');
    assert(test15.body.lockWarning.includes('authoritative Telegram cloud-state guard is active across restarts'));
    console.log('[PASS] Test 15: Lockfile write failure handled explicitly: reports localLockEstablished=false and warns cloud guard is active.');

    // 16. Ambiguous Outcome: setWebhook succeeds, postcheck fails, and subsequent retry detects active cloud registration
    process.env.REGISTRATION_LOCK_FILE = TEST_LOCK_FILE;
    if (fs.existsSync(TEST_LOCK_FILE)) fs.unlinkSync(TEST_LOCK_FILE);

    let test16Calls = [];
    let test16GetWebhookCount = 0;
    https.request = function (options, callback) {
      if (options.hostname === 'api.telegram.org') {
        const isSetWebhook = options.path.includes('/setWebhook');
        const isGetWebhook = options.path.includes('/getWebhookInfo');

        if (isGetWebhook) {
          test16GetWebhookCount++;
          test16Calls.push({ path: options.path, type: 'getWebhookInfo', count: test16GetWebhookCount });

          // Call 1 (Attempt 1 precheck): Webhook not yet set
          if (test16GetWebhookCount === 1) {
            const mockRes = new (require('events').EventEmitter)();
            mockRes.statusCode = 200;
            process.nextTick(() => {
              callback(mockRes);
              mockRes.emit('data', JSON.stringify({ ok: true, result: { url: '', pending_update_count: 0 } }));
              mockRes.emit('end');
            });
            return { on: () => {}, setTimeout: () => {}, destroy: () => {}, write: () => {}, end: () => {} };
          }

          // Call 2 (Attempt 1 postcheck): Postcheck times out or encounters network error
          if (test16GetWebhookCount === 2) {
            const mockReq = new (require('events').EventEmitter)();
            mockReq.write = () => {};
            mockReq.end = () => {
              process.nextTick(() => mockReq.emit('error', new Error('ETIMEDOUT: postcheck verification timed out')));
            };
            mockReq.setTimeout = () => {};
            mockReq.destroy = () => {};
            return mockReq;
          }

          // Call 3+ (Attempt 2 retry precheck): Cloud state reflects successful setWebhook from Attempt 1
          const mockRes = new (require('events').EventEmitter)();
          mockRes.statusCode = 200;
          process.nextTick(() => {
            callback(mockRes);
            mockRes.emit('data', JSON.stringify({
              ok: true,
              result: {
                url: 'https://footy-vs-hoops.onrender.com/api/telegram/webhook',
                has_custom_certificate: false,
                pending_update_count: 0,
                allowed_updates: ['message', 'pre_checkout_query', 'successful_payment']
              }
            }));
            mockRes.emit('end');
          });
          return { on: () => {}, setTimeout: () => {}, destroy: () => {}, write: () => {}, end: () => {} };
        }

        if (isSetWebhook) {
          test16Calls.push({ path: options.path, type: 'setWebhook' });
          const mockRes = new (require('events').EventEmitter)();
          mockRes.statusCode = 200;
          process.nextTick(() => {
            callback(mockRes);
            mockRes.emit('data', JSON.stringify({ ok: true, result: true, description: 'Webhook was set' }));
            mockRes.emit('end');
          });
          return { on: () => {}, setTimeout: () => {}, destroy: () => {}, write: () => {}, end: () => {} };
        }
      }
      return originalRequest.apply(https, arguments);
    };

    // Attempt 1: setWebhook succeeds, but postcheck fails
    const test16Attempt1 = await request('POST', '/api/internal/register-webhook', {
      'x-registration-auth': validKey
    });
    assert.strictEqual(test16Attempt1.status, 502, 'Attempt 1 must return 502 when postcheck fails');
    assert.strictEqual(test16Attempt1.body.error, 'telegram_postcheck_failed');
    assert(!fs.existsSync(TEST_LOCK_FILE), 'Lockfile must NOT be written when postcheck fails');
    console.log('  [16a] Ambiguous outcome: setWebhook succeeded in cloud, but postcheck timed out (returned 502).');

    // Attempt 2 (Retry): Precheck queries Telegram cloud again, discovers webhook is already active, and does NOT call setWebhook
    const callsBeforeRetry = test16Calls.length;
    const test16Attempt2 = await request('POST', '/api/internal/register-webhook', {
      'x-registration-auth': validKey
    });
    assert.strictEqual(test16Attempt2.status, 409, 'Retry must detect active registration and return 409 Conflict');
    assert.strictEqual(test16Attempt2.body.error, 'webhook_already_registered');
    assert.strictEqual(test16Attempt2.body.cloudGuardActive, true);
    assert.strictEqual(test16Attempt2.body.current.url, 'https://footy-vs-hoops.onrender.com/api/telegram/webhook');

    // Verify setWebhook was NOT called during Attempt 2
    const retryCalls = test16Calls.slice(callsBeforeRetry);
    assert(!retryCalls.some(c => c.type === 'setWebhook'), 'setWebhook must NEVER be called again during retry when cloud confirms active registration');
    assert(fs.existsSync(TEST_LOCK_FILE), 'Lockfile must now be established after cloud registration detected on retry');
    console.log('[PASS] Test 16: Ambiguous outcome resilience verified: retry safely detected active cloud state and blocked duplicate setWebhook.');

    console.log('\n================================================================');
    console.log('ALL TEMPORARY REGISTRATION RIGOROUS SECURITY TESTS PASSED (16/16)!');
    console.log('================================================================\n');
    process.exit(0);
  } finally {
    restoreTelegramMock();
    cleanupTempFiles();
  }
}

run().catch(err => {
  console.error('Test suite failed:', err);
  cleanupTempFiles();
  process.exit(1);
});
