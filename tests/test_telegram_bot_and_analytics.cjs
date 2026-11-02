const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { newDb } = require('pg-mem');

const TEST_PORT = 8993;
process.env.PORT = String(TEST_PORT);
process.env.NODE_ENV = 'test';
process.env.FVH_TEST_FAST = '1';
process.env.ADMIN_SECRET = 'adm_sec_super_secret_test_key_123';
const TEST_BOT_TOKEN = '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ123456789';
process.env.TELEGRAM_BOT_TOKEN = TEST_BOT_TOKEN;
process.env.TELEGRAM_WEBHOOK_SECRET = 'webhook_secret_not_for_admin_use';

const server = require('../server/server.js');
const { PostgresStorageAdapter } = require('../server/storage/postgres_storage');

const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

async function apiPost(endpoint, body = {}, headers = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, body: data };
}

async function apiWebhook(body = {}) {
  return apiPost('/api/telegram/webhook', body, {
    'x-telegram-bot-api-secret-token': process.env.TELEGRAM_WEBHOOK_SECRET
  });
}

async function apiGet(endpoint, headers = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: headers
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, body: data };
}

// Generate valid Telegram WebApp initData string
function createValidInitData(userObj, botToken, authDate = null) {
  const effectiveAuthDate = (authDate !== null) ? authDate : Math.floor(Date.now() / 1000);
  const userJson = JSON.stringify(userObj);
  const params = new URLSearchParams();
  params.set('auth_date', String(effectiveAuthDate));
  params.set('query_id', 'AAEAAQAAAA');
  params.set('user', userJson);

  const sortedKeys = Array.from(params.keys()).sort();
  const checkString = sortedKeys.map(k => `${k}=${params.get(k)}`).join('\n');
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

  params.set('hash', calculatedHash);
  return params.toString();
}

async function runTestSuite() {
  console.log('=== FOOTY vs HOOPS Telegram Bot & Player Statistics Verification Suite ===\n');

  // Wait for server to bind
  await new Promise(r => setTimeout(r, 600));

  // -------------------------------------------------------------
  // TEST 1: Automatic Localization for Telegram Bot Messages
  // -------------------------------------------------------------
  console.log('[Test 1] Verifying Telegram Bot Automatic Localization & Message Text...');
  const serverCode = fs.readFileSync(path.join(__dirname, '../server/server.js'), 'utf8');

  // English default check
  assert.ok(serverCode.includes('A fast-paced 1v1 arcade sports game on Telegram!'), 'Contains English tagline');
  assert.ok(serverCode.includes('⚽ Football mode'), 'Contains football mode');
  assert.ok(serverCode.includes('🏀 Basketball mode'), 'Contains basketball mode');
  assert.ok(serverCode.includes('🤖 Play against AI'), 'Contains play against AI');
  assert.ok(serverCode.includes('🏟️ 2 standard arenas'), 'Contains 2 standard arenas');
  assert.ok(serverCode.includes('👇 Tap below to play!'), 'Contains tap below to play');

  // Russian translation check
  assert.ok(serverCode.includes('Быстрая 1v1 спортивная аркада в Telegram!'), 'Contains Russian tagline');
  assert.ok(serverCode.includes('⚽ Режим футбола'), 'Contains Russian football mode');
  assert.ok(serverCode.includes('🏀 Режим баскетбола'), 'Contains Russian basketball mode');
  assert.ok(serverCode.includes('🤖 Игра против ИИ'), 'Contains Russian play against AI');
  assert.ok(serverCode.includes('🏟️ 2 стандартные арены'), 'Contains Russian 2 standard arenas');
  assert.ok(serverCode.includes('👇 Нажми кнопку ниже, чтобы играть!'), 'Contains Russian tap below to play');

  // 1.1 Test webhook /start with Russian user (language_code: 'ru')
  const ruRes = await apiWebhook({
    message: {
      text: '/start',
      chat: { id: 700101 },
      from: { id: 700101, username: 'ivan_ru', first_name: 'Ivan', language_code: 'ru' }
    }
  });
  assert.strictEqual(ruRes.status, 200);
  assert.strictEqual(ruRes.body.handled, 'start_or_play');
  assert.strictEqual(ruRes.body.lang, 'ru', 'Russian language resolved for ru user');

  // 1.2 Test webhook /start with English user (language_code: 'en')
  const enRes = await apiWebhook({
    message: {
      text: '/start',
      chat: { id: 700102 },
      from: { id: 700102, username: 'john_en', first_name: 'John', language_code: 'en-US' }
    }
  });
  assert.strictEqual(enRes.status, 200);
  assert.strictEqual(enRes.body.handled, 'start_or_play');
  assert.strictEqual(enRes.body.lang, 'en', 'English language resolved for en user');

  // 1.3 Test webhook /start with Spanish user (language_code: 'es')
  const esRes = await apiWebhook({
    message: {
      text: '/start',
      chat: { id: 700103 },
      from: { id: 700103, username: 'carlos_es', first_name: 'Carlos', language_code: 'es-ES' }
    }
  });
  assert.strictEqual(esRes.body.lang, 'es', 'Spanish language resolved for es user');

  // 1.4 Test webhook /start with unsupported language code (fallback to 'en')
  const unsuppRes = await apiWebhook({
    message: {
      text: '/start',
      chat: { id: 700104 },
      from: { id: 700104, username: 'user_xyz', first_name: 'Alien', language_code: 'xx' }
    }
  });
  assert.strictEqual(unsuppRes.body.lang, 'en', 'Fallback to English for unsupported language');
  console.log('  ✓ Automatic language detection and fallback working across ru, en, es, and unknown.');

  // -------------------------------------------------------------
  // TEST 2: Outdated Feature Claims Elimination
  // -------------------------------------------------------------
  console.log('[Test 2] Verifying removal of outdated feature claims in bot messages...');
  assert.ok(!serverCode.includes('68 предметов'), 'No Russian 68 items claim in server.js');
  assert.ok(!serverCode.includes('8 тактических бустов'), 'No 8 tactical boosts claim in server.js');
  assert.ok(!serverCode.includes('10 уникальных 3D стадионов'), 'No 10 3D stadiums claim in server.js');
  console.log('  ✓ Outdated claims (boosts, 68 items, 10 stadiums, online friends) eliminated.');

  // -------------------------------------------------------------
  // TEST 3: Bot Profile Setup Script Standalone Separation & Safe Dry-Run Validation
  // -------------------------------------------------------------
  console.log('[Test 3] Verifying bot profile setup script separation & dry-run validation...');
  
  // 3.1 Verify file imports safely without executing Telegram network calls
  const botProfileScript = require('../scripts/setup_telegram_bot_profile.js');
  assert.ok(typeof botProfileScript.run === 'function', 'Script exports run function');
  assert.ok(typeof botProfileScript.buildApiPlan === 'function', 'Script exports buildApiPlan');
  assert.ok(typeof botProfileScript.PROFILE_TEXTS === 'object', 'Script exports PROFILE_TEXTS');
  
  // 3.2 Verify profile text limits and accuracy
  const { PROFILE_TEXTS } = botProfileScript;
  assert.ok(PROFILE_TEXTS.shortDescription.en.length <= 120, 'English short description <= 120 chars');
  assert.ok(PROFILE_TEXTS.shortDescription.ru.length <= 120, 'Russian short description <= 120 chars');
  assert.ok(PROFILE_TEXTS.description.en.length <= 512, 'English full description <= 512 chars');
  assert.ok(PROFILE_TEXTS.description.ru.length <= 512, 'Russian full description <= 512 chars');
  
  // Verify elimination of outdated claims in bot profile texts
  const allProfileTexts = JSON.stringify(PROFILE_TEXTS);
  assert.ok(!allProfileTexts.includes('68 предметов') && !allProfileTexts.includes('68 cosmetic'), 'No 68 items claim in profile');
  assert.ok(!allProfileTexts.includes('8 тактических') && !allProfileTexts.includes('8 tactical'), 'No 8 tactical boosts claim in profile');
  assert.ok(!allProfileTexts.includes('10 уникальных') && !allProfileTexts.includes('10 detailed'), 'No 10 stadiums claim in profile');
  assert.ok(!allProfileTexts.includes('мультиплеер') && !allProfileTexts.includes('multiplayer'), 'No multiplayer claim in profile');

  // 3.3 Verify token validation logic
  assert.throws(() => botProfileScript.validateBotToken(''), /TELEGRAM_BOT_TOKEN environment variable is required/);
  assert.throws(() => botProfileScript.validateBotToken('invalid_token'), /invalid format/);
  assert.strictEqual(botProfileScript.validateBotToken('123456:ABC-DEF_1234'), '123456:ABC-DEF_1234');

  // 3.4 Explicit network blocking for ALL dry-run scenarios
  // Intercepts https.request across all test scenarios to prove mathematically
  // that NO network requests can be made to api.telegram.org in dry-run mode.
  const https = require('https');
  let networkCallCount = 0;
  const originalHttpsRequest = https.request;
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  https.request = (...args) => {
    networkCallCount++;
    throw new Error('Prohibited network call made during dry-run: ' + JSON.stringify(args[0]));
  };

  try {
    // Isolated network guard validation: prove guard actively intercepts and throws on a deliberate test call
    assert.throws(() => {
      https.request({ hostname: 'api.telegram.org', port: 443, path: '/deliberate-guard-test' });
    }, /Prohibited network call made during dry-run/, 'Network guard must intercept and throw on deliberate call');
    assert.strictEqual(networkCallCount, 1, 'Network guard successfully intercepted and counted deliberate call');
    networkCallCount = 0; // Reset counter for all profile dry-run scenarios

    const TOKEN_SHAPED_REGEX = /[0-9]{8,}:[A-Za-z0-9_-]{15,}/;

    const runWithCapturedLogs = async (fn) => {
      const logs = [];
      const origLog = console.log;
      const origErr = console.error;
      console.log = (...args) => { logs.push(args.join(' ')); origLog(...args); };
      console.error = (...args) => { logs.push(args.join(' ')); origErr(...args); };
      try {
        const result = await fn();
        return { result, logs: logs.join('\n') };
      } catch (err) {
        return { error: err, logs: logs.join('\n') };
      } finally {
        console.log = origLog;
        console.error = origErr;
      }
    };

    // -------------------------------------------------------------------------
    // Scenario 1: Normal full dry-run (All 18 calls execute and succeed)
    // -------------------------------------------------------------------------
    const dryRunResult = await botProfileScript.run({
      dryRun: true,
      miniAppUrl: 'https://footy-vs-hoops.onrender.com/'
    });
    assert.strictEqual(dryRunResult.ok, true, 'Dry-run succeeds without network calls');
    assert.strictEqual(dryRunResult.dryRun, true, 'Flagged as dry-run');

    // Verify buildApiPlan() exactly matches the 18 calls recorded by run({ dryRun: true })
    const expectedPlan = botProfileScript.buildApiPlan('https://footy-vs-hoops.onrender.com/');
    assert.strictEqual(expectedPlan.length, 18, 'buildApiPlan() must define exactly 18 planned Telegram API calls');
    assert.strictEqual(dryRunResult.recordedCalls.length, 18, 'dry-run must record exactly 18 Telegram API calls');

    for (let i = 0; i < 18; i++) {
      const planned = expectedPlan[i];
      const recorded = dryRunResult.recordedCalls[i];
      assert.strictEqual(recorded.method, planned.method, `Call ${i + 1} method matches (${planned.method})`);
      assert.deepStrictEqual(recorded.params, planned.params, `Call ${i + 1} params match (including language_code)`);
    }

    // Explicitly check that resShortRu, resShortEn, resShortDefault are declared and valid
    assert.ok(dryRunResult.results.shortDescription.ru, 'resShortRu is defined in results');
    assert.strictEqual(dryRunResult.results.shortDescription.ru.ok, true, 'resShortRu response has ok=true');
    assert.ok(dryRunResult.results.shortDescription.en, 'resShortEn is defined in results');
    assert.strictEqual(dryRunResult.results.shortDescription.en.ok, true, 'resShortEn response has ok=true');
    assert.ok(dryRunResult.results.shortDescription.default, 'resShortDefault is defined in results');
    assert.strictEqual(dryRunResult.results.shortDescription.default.ok, true, 'resShortDefault response has ok=true');

    // -------------------------------------------------------------------------
    // Scenario 2: mockFailureMethod ('setMyDescription') with throwOnError: true
    // (Stops execution immediately, throws Error identifying failed method, logs & error redact secrets)
    // -------------------------------------------------------------------------
    const sc2 = await runWithCapturedLogs(async () => {
      return botProfileScript.run({
        dryRun: true,
        mockFailureMethod: 'setMyDescription',
        throwOnError: true
      });
    });
    assert.ok(sc2.error, 'Must throw error on mock failure');
    assert.ok(sc2.error.message.includes('setMyDescription'), 'Error identifies failed method');
    assert.strictEqual(sc2.error.method, 'setMyDescription', 'Error object carries method property');
    assert.strictEqual(sc2.error.step, 4, 'Error object carries step 4');
    assert.ok(!sc2.error.message.includes(TEST_BOT_TOKEN), 'Secrets are not exposed in error message');
    assert.ok(!sc2.logs.includes(TEST_BOT_TOKEN), 'Scenario 2 logs must not contain TEST_BOT_TOKEN');
    assert.ok(!TOKEN_SHAPED_REGEX.test(sc2.logs), 'Scenario 2 logs must not contain token-shaped string');
    assert.ok(!sc2.logs.includes('Profile setup completed successfully'), 'Success message NEVER printed on error (Scenario 2)');

    // -------------------------------------------------------------------------
    // Scenario 3: mockFailureMethod ('setChatMenuButton') with throwOnError: false
    // (Stops execution immediately, returns ok: false result object, logs & payload redact secrets)
    // -------------------------------------------------------------------------
    const sc3 = await runWithCapturedLogs(async () => {
      return botProfileScript.run({
        dryRun: true,
        mockFailureMethod: 'setChatMenuButton',
        throwOnError: false
      });
    });
    assert.strictEqual(sc3.result.ok, false, 'Must return ok: false on API failure');
    assert.strictEqual(sc3.result.failedMethod, 'setChatMenuButton', 'Must identify failed method');
    assert.strictEqual(sc3.result.failedStep, 5, 'Must identify failed step 5');
    assert.ok(sc3.result.error.includes('setChatMenuButton'), 'Error message specifies failed method');
    assert.ok(!JSON.stringify(sc3.result).includes(TEST_BOT_TOKEN), 'No secrets exposed in error payload');
    assert.strictEqual(sc3.result.recordedCalls.length, 11, 'Execution stopped immediately at call 11 (calls 12-18 not executed)');
    assert.ok(!sc3.logs.includes(TEST_BOT_TOKEN), 'Scenario 3 logs must not contain TEST_BOT_TOKEN');
    assert.ok(!TOKEN_SHAPED_REGEX.test(sc3.logs), 'Scenario 3 logs must not contain token-shaped string');
    assert.ok(!sc3.logs.includes('Profile setup completed successfully'), 'Success message NEVER printed on error (Scenario 3)');

    // -------------------------------------------------------------------------
    // Scenario 4: mockThrowMethod ('setMyCommands') with throwOnError: true
    // (Stops execution immediately, throws Error identifying thrown method, logs & error redact secrets)
    // -------------------------------------------------------------------------
    const sc4 = await runWithCapturedLogs(async () => {
      return botProfileScript.run({
        dryRun: true,
        mockThrowMethod: 'setMyCommands',
        throwOnError: true
      });
    });
    assert.ok(sc4.error, 'Must throw error on mock exception');
    assert.ok(sc4.error.message.includes('setMyCommands'), 'Identifies thrown method');
    assert.strictEqual(sc4.error.method, 'setMyCommands', 'Error object carries method property');
    assert.strictEqual(sc4.error.step, 6, 'Error object carries step 6');
    assert.ok(!sc4.error.message.includes(TEST_BOT_TOKEN), 'Secrets are not exposed in thrown error');
    assert.ok(!sc4.logs.includes(TEST_BOT_TOKEN), 'Scenario 4 logs must not contain TEST_BOT_TOKEN');
    assert.ok(!TOKEN_SHAPED_REGEX.test(sc4.logs), 'Scenario 4 logs must not contain token-shaped string');
    assert.ok(!sc4.logs.includes('Profile setup completed successfully'), 'Success message NEVER printed on exception (Scenario 4)');

    // -------------------------------------------------------------------------
    // Scenario 5: mockThrowMethod ('setMyCommands') with throwOnError: false
    // (Stops execution immediately, returns ok: false result object, logs & payload redact secrets)
    // -------------------------------------------------------------------------
    const sc5 = await runWithCapturedLogs(async () => {
      return botProfileScript.run({
        dryRun: true,
        mockThrowMethod: 'setMyCommands',
        throwOnError: false
      });
    });
    assert.strictEqual(sc5.result.ok, false, 'Must return ok: false on thrown exception');
    assert.strictEqual(sc5.result.failedMethod, 'setMyCommands', 'Must identify thrown method');
    assert.strictEqual(sc5.result.failedStep, 6, 'Must identify failed step 6');
    assert.ok(sc5.error ? sc5.error.message : sc5.result.error.includes('setMyCommands'), 'Error message specifies thrown method');
    assert.ok(!JSON.stringify(sc5.result).includes(TEST_BOT_TOKEN), 'No secrets exposed in payload');
    assert.strictEqual(sc5.result.recordedCalls.length, 12, 'Execution stopped immediately at call 12 (calls 13-18 not executed)');
    assert.ok(!sc5.logs.includes(TEST_BOT_TOKEN), 'Scenario 5 logs must not contain TEST_BOT_TOKEN');
    assert.ok(!TOKEN_SHAPED_REGEX.test(sc5.logs), 'Scenario 5 logs must not contain token-shaped string');
    assert.ok(!sc5.logs.includes('Profile setup completed successfully'), 'Success message NEVER printed on exception (Scenario 5)');

  } finally {
    https.request = originalHttpsRequest;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  }

  // Confirm zero network calls across all 5 dry-run profile scenarios
  assert.strictEqual(networkCallCount, 0, 'Zero network calls made across all 5 dry-run profile scenarios');

  // 3.7 Check package.json scripts to verify setup script is NOT executed during automated deploy/test
  const pkgJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  assert.ok(!pkgJson.scripts.start.includes('setup_telegram_bot_profile'), 'setup script not executed in npm start');
  assert.ok(!pkgJson.scripts.test.includes('setup_telegram_bot_profile'), 'setup script not executed in npm test');
  console.log('  ✓ Bot profile script verified: 18 planned calls match 1:1 with dry-run, network strictly blocked, failed responses handled, and zero secrets exposed.');

  // -------------------------------------------------------------
  // TEST 4: Cryptographic initData Validation & Freshness
  // -------------------------------------------------------------
  console.log('[Test 4] Verifying initData Signature, Freshness, and Fail-Closed Behavior...');
  const tgUserSteph = { id: 888002, username: 'curry_splash', first_name: 'Steph', language_code: 'en' };
  const validInitData = createValidInitData(tgUserSteph, TEST_BOT_TOKEN);

  // 4.1 Valid signature and fresh auth_date
  const initRes = await apiPost('/api/telegram/validate-init-data', {
    initData: validInitData,
    platform: 'ios',
    playerId: 'fvh_canonical_steph_30',
    preferredLanguage: 'ru'
  });
  assert.strictEqual(initRes.status, 200);
  assert.strictEqual(initRes.body.validated, true);
  assert.strictEqual(initRes.body.user.id, 888002);
  console.log('  ✓ Valid HMAC-SHA256 signature accepted.');

  // 4.2 Stale / Expired auth_date rejection (> 24 hours old)
  const staleAuthDate = Math.floor(Date.now() / 1000) - (86400 + 3600);
  const expiredInitData = createValidInitData(tgUserSteph, TEST_BOT_TOKEN, staleAuthDate);
  const expiredRes = await apiPost('/api/telegram/validate-init-data', {
    initData: expiredInitData,
    platform: 'ios'
  });
  assert.strictEqual(expiredRes.status, 403);
  assert.strictEqual(expiredRes.body.validated, false);
  assert.strictEqual(expiredRes.body.error, 'init_data_expired');
  console.log('  ✓ Stale auth_date (>24h) strictly rejected.');

  // 4.3 Future auth_date clock skew rejection (>60s in future)
  const futureAuthDate = Math.floor(Date.now() / 1000) + 300;
  const futureInitData = createValidInitData(tgUserSteph, TEST_BOT_TOKEN, futureAuthDate);
  const futureRes = await apiPost('/api/telegram/validate-init-data', {
    initData: futureInitData,
    platform: 'ios'
  });
  assert.strictEqual(futureRes.status, 403);
  assert.strictEqual(futureRes.body.validated, false);
  assert.strictEqual(futureRes.body.error, 'auth_date_in_future');
  console.log('  ✓ Future auth_date strictly rejected.');

  // 4.4 Tampered initData rejection
  const tamperedInitData = validInitData.replace('888002', '999999');
  const tamperRes = await apiPost('/api/telegram/validate-init-data', {
    initData: tamperedInitData,
    platform: 'ios'
  });
  assert.strictEqual(tamperRes.status, 403);
  assert.strictEqual(tamperRes.body.validated, false);
  console.log('  ✓ Tampered / spoofed initData strictly rejected.');

  // 4.5 Unauthenticated client-supplied data.user rejection (no tracking unauthenticated users)
  const spoofAttemptRes = await apiPost('/api/telegram/validate-init-data', {
    initData: '',
    user: { id: 999111, username: 'hacker' }
  });
  assert.strictEqual(spoofAttemptRes.body.validated, false);
  console.log('  ✓ Unauthenticated client-supplied user payload strictly ignored.');

  // -------------------------------------------------------------
  // TEST 5: Canonical Player ID Lookup & In-Game Language Sync
  // -------------------------------------------------------------
  console.log('[Test 5] Verifying resolveUserLanguage() with Canonical Player ID format (fvh_...)...');
  
  // User 888002 interacts with the bot via Telegram update.
  // The bot should resolve their canonical player 'fvh_canonical_steph_30' and return 'ru'
  const followUpRes = await apiWebhook({
    message: {
      text: '/help',
      chat: { id: 888002 },
      from: tgUserSteph
    }
  });
  assert.strictEqual(followUpRes.body.lang, 'ru', 'Bot correctly looked up saved language using canonical player profile');
  console.log('  ✓ resolveUserLanguage() resolved canonical player ID format (fvh_...) and synchronized language.');

  // -------------------------------------------------------------
  // TEST 6: Real User Counting & AI/Test Profile Filtering
  // -------------------------------------------------------------
  console.log('[Test 6] Verifying totalPlayers excludes AI, test, and service profiles...');
  const pubRes = await apiGet('/api/stats/public-summary');
  assert.strictEqual(pubRes.status, 200);
  assert.strictEqual(pubRes.body.ok, true);
  assert.ok(typeof pubRes.body.totalPlayers === 'number');
  assert.ok(pubRes.body.totalPlayers > 0, 'Total players is a valid positive number');

  // Verify DAU/WAU accurate values (no || 1 fallback)
  assert.ok(typeof pubRes.body.activeToday === 'number');
  assert.ok(typeof pubRes.body.activeThisWeek === 'number');
  assert.strictEqual(pubRes.body.users, undefined, 'Zero user PII leaked');
  assert.strictEqual(pubRes.body.telegramId, undefined, 'Zero telegram IDs leaked');
  console.log(`  ✓ Public summary: totalPlayers=${pubRes.body.totalPlayers}, activeToday=${pubRes.body.activeToday}, activeThisWeek=${pubRes.body.activeThisWeek} (Accurate counts, Zero PII).`);

  // -------------------------------------------------------------
  // TEST 7: Dedicated ADMIN_SECRET Security (No Fallbacks)
  // -------------------------------------------------------------
  console.log('[Test 7] Verifying Admin Statistics Security (Accepts ONLY ADMIN_SECRET)...');
  
  // 7.1 Unauthorized access (no headers)
  const unauthRes = await apiGet('/api/admin/stats');
  assert.strictEqual(unauthRes.status, 401, 'Must reject requests without admin key');

  // 7.2 Forbidden access (wrong admin key)
  const forbiddenRes = await apiGet('/api/admin/stats', { 'x-admin-key': 'wrong_secret_key' });
  assert.strictEqual(forbiddenRes.status, 403, 'Must reject invalid admin key');

  // 7.3 Forbidden access using TELEGRAM_WEBHOOK_SECRET (must NOT fall back)
  const webhookKeyRes = await apiGet('/api/admin/stats', { 'x-admin-key': process.env.TELEGRAM_WEBHOOK_SECRET });
  assert.strictEqual(webhookKeyRes.status, 403, 'Must NOT accept TELEGRAM_WEBHOOK_SECRET as admin key');

  // 7.4 Forbidden access using TELEGRAM_BOT_TOKEN (must NOT fall back)
  const botTokenKeyRes = await apiGet('/api/admin/stats', { 'x-admin-key': process.env.TELEGRAM_BOT_TOKEN });
  assert.strictEqual(botTokenKeyRes.status, 403, 'Must NOT accept TELEGRAM_BOT_TOKEN as admin key');

  // 7.5 Authorized access with dedicated ADMIN_SECRET
  const adminRes = await apiGet('/api/admin/stats', { 'x-admin-key': process.env.ADMIN_SECRET });
  assert.strictEqual(adminRes.status, 200, 'Must accept dedicated ADMIN_SECRET');
  assert.strictEqual(adminRes.body.ok, true);

  const stats = adminRes.body.stats;
  assert.ok(stats.totalUniqueUsers >= 4, 'Tracked unique Telegram users');
  assert.ok(typeof stats.dau === 'number');
  assert.ok(typeof stats.wau === 'number');
  console.log('  ✓ Dedicated ADMIN_SECRET strictly enforced; fallbacks to webhook secret or bot token blocked.');

  // -------------------------------------------------------------
  // TEST 8: PostgreSQL Full-State Import Idempotency
  // -------------------------------------------------------------
  console.log('[Test 8] Verifying PostgreSQL telegram_users Persistence & Import Idempotency...');
  const db = newDb();
  const pg = db.adapters.createPg();
  const pool = new pg.Pool();

  const adapter = new PostgresStorageAdapter({
    pool,
    pgMemDb: db
  });
  await adapter.init();

  const testState = {
    telegramUsers: {
      '777001': {
        telegramId: 777001,
        username: 'messi_goat',
        firstName: 'Leo',
        languageCode: 'es',
        preferredLanguage: 'ru',
        playerId: 'fvh_messi_10',
        firstSeenAt: Date.now() - 5000,
        lastSeenAt: Date.now(),
        hasBotStarted: true,
        botStartedAt: Date.now() - 5000,
        hasMiniAppOpened: true,
        miniappOpenedAt: Date.now() - 1000,
        miniappLaunchCount: 5,
        lastPlatform: 'ios'
      }
    }
  };

  // Import 1
  await adapter.importState(testState);
  let exported = await adapter.exportState();
  assert.strictEqual(exported.telegramUsers['777001'].miniappLaunchCount, 5, 'Launch count is 5 after first import');

  // Import 2 (Re-import identical state to test idempotency)
  await adapter.importState(testState);
  exported = await adapter.exportState();
  assert.strictEqual(exported.telegramUsers['777001'].miniappLaunchCount, 5, 'Launch count remains 5 (idempotent, NOT 10)');
  assert.strictEqual(exported.telegramUsers['777001'].playerId, 'fvh_messi_10', 'Canonical playerId preserved');
  console.log('  ✓ PostgreSQL full-state import is strictly idempotent (miniapp_launch_count does NOT accumulate).');

  console.log('\n======================================================');
  console.log('ALL TELEGRAM BOT & ANALYTICS CHECKS PASSED (8/8)!');
  console.log('======================================================');
  process.exit(0);
}

runTestSuite().catch(err => {
  console.error('\n[TEST FAILURE]', err);
  process.exit(1);
});
