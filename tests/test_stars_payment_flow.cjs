/**
 * tests/test_stars_payment_flow.cjs
 * Comprehensive Telegram Stars Real Payment Lifecycle & Security Suite.
 * Exercises catalog, invoice creation with Bot API, webhook pre-checkout,
 * successful payment fulfillment, replay protection, Battle Pass rejection, and economy synchronization.
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { EventEmitter } = require('events');

const TEST_PORT = 8520;
const tmpDataPath = path.join(__dirname, 'temp_stars_test_data.json');

// Hermetic interceptor for outbound Telegram Bot API requests (avoids external network dependency & tokens)
const origHttpsRequest = https.request;
https.request = function (options, cb) {
  let opts = options;
  if (typeof opts === 'string') {
    opts = new URL(opts);
  }
  const hostname = opts.hostname || (opts.host && opts.host.split(':')[0]);
  if (hostname === 'api.telegram.org') {
    const mockReq = new EventEmitter();
    let bodyBuffer = '';
    mockReq.write = function (chunk) {
      if (chunk) bodyBuffer += chunk;
    };
    mockReq.end = function () {
      process.nextTick(() => {
        let resData = JSON.stringify({ ok: true, result: true });
        try {
          const parsed = JSON.parse(bodyBuffer);
          const p = String(opts.path || '');
          if (p.includes('createInvoiceLink')) {
            resData = JSON.stringify({
              ok: true,
              result: 'https://t.me/$stars_invoice_link_' + (parsed.payload || 'test')
            });
          } else if (p.includes('answerPreCheckoutQuery')) {
            resData = JSON.stringify({
              ok: true,
              result: true
            });
          }
        } catch (e) {}

        const mockRes = new EventEmitter();
        mockRes.statusCode = 200;
        mockRes.headers = { 'content-type': 'application/json' };
        if (cb) cb(mockRes);
        mockRes.emit('data', Buffer.from(resData));
        mockRes.emit('end');
      });
    };
    return mockReq;
  }
  return origHttpsRequest.apply(this, arguments);
};

async function run() {
  console.log('=== FOOTY vs HOOPS: Telegram Stars Complete Purchase Lifecycle Suite ===\n');

  fs.copyFileSync('server/data.json', tmpDataPath);

  process.env.PORT = String(TEST_PORT);
  process.env.DATA_FILE = tmpDataPath;
  process.env.NODE_ENV = 'test';
  process.env.ENABLE_STARS = 'true';
  process.env.TELEGRAM_WEBHOOK_SECRET = 'stars_test_secret_xyz123';
  process.env.TELEGRAM_BOT_TOKEN = 'test_mock_bot_token_abc123';

  // Spawn isolated test instance of server
  const server = require('../server/server.js');
  await new Promise(r => setTimeout(r, 1200));

  function request(method, path, body, headers = {}) {
    return new Promise((resolve, reject) => {
      const dataStr = body ? JSON.stringify(body) : null;
      const req = http.request({
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(dataStr ? { 'Content-Length': Buffer.byteLength(dataStr) } : {}),
          ...headers
        }
      }, (res) => {
        let raw = '';
        res.on('data', c => raw += c);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(raw) });
          } catch (e) {
            resolve({ status: res.statusCode, raw });
          }
        });
      });
      req.on('error', reject);
      if (dataStr) req.write(dataStr);
      req.end();
    });
  }

  try {
    // -------------------------------------------------------------
    // TEST 1: CATALOG VERIFICATION
    // -------------------------------------------------------------
    console.log('Test 1: Verifying in-game Stars product catalog and launch prices...');
    const catRes = await request('GET', '/api/catalog');
    assert.strictEqual(catRes.status, 200);
    assert(catRes.body.ok, 'Catalog response must be ok');
    const catalog = catRes.body.catalog;

    assert(catalog.pkg_coins_100, 'pkg_coins_100 must exist in catalog');
    assert.strictEqual(catalog.pkg_coins_100.starsPrice, 25, '100 coins must be 25 Stars');
    assert.strictEqual(catalog.pkg_coins_500.starsPrice, 100, '500 coins must be 100 Stars');
    assert.strictEqual(catalog.pkg_coins_1200.starsPrice, 220, '1200 coins must be 220 Stars');
    assert.strictEqual(catalog.pkg_coins_3000.starsPrice, 500, '3000 coins must be 500 Stars');
    
    // Strict requirement: Battle Pass must NOT exist in the catalog
    assert.strictEqual(catalog.battlepass_premium, undefined, 'battlepass_premium must NOT exist in catalog');
    console.log('  [PASS] Catalog and pricing verified: 25, 100, 220, 500 ⭐ for coins. Battle Pass strictly excluded.');

    // -------------------------------------------------------------
    // TEST 2: INVOICE CREATION WITH BOT API (XTR CURRENCY)
    // -------------------------------------------------------------
    console.log('\nTest 2: Testing invoice creation with Telegram Bot API (XTR currency)...');
    const testPlayerId = 'stars_buyer_' + Date.now();
    const testTgUserId = '77889911';

    const invRes = await request('POST', '/api/stars/create-invoice', {
      productId: 'pkg_coins_500',
      playerId: testPlayerId,
      telegramUserId: testTgUserId
    });
    assert.strictEqual(invRes.status, 200);
    assert(invRes.body.ok, 'Invoice response must be ok');
    assert(invRes.body.orderId.startsWith('stars_'), 'OrderId must start with stars_');
    assert.strictEqual(invRes.body.currency, 'XTR', 'Currency must be Telegram Stars (XTR)');
    assert.strictEqual(invRes.body.starsAmount, 100, 'Stars amount must be 100');
    assert(invRes.body.invoiceLink && invRes.body.invoiceLink.startsWith('https://t.me/$'), 'InvoiceLink must be valid Telegram payment URL');
    const orderId = invRes.body.orderId;
    console.log('  [PASS] Telegram invoice link generated:', invRes.body.invoiceLink);

    // -------------------------------------------------------------
    // TEST 3: ANTI-SPOOFING & SECURITY VALIDATIONS
    // -------------------------------------------------------------
    console.log('\nTest 3: Testing security guards against unauthorized/forged payments...');
    
    // Non-existent product
    const badProdRes = await request('POST', '/api/stars/create-invoice', {
      productId: 'fake_product_999',
      playerId: testPlayerId
    });
    assert.strictEqual(badProdRes.status, 404);

    // Client callback spoofing (client trying to verify directly in production without webhook)
    const prevEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const spoofRes = await request('POST', '/api/stars/verify', {
      orderId,
      playerId: testPlayerId,
      status: 'paid'
    });
    process.env.NODE_ENV = prevEnv;
    assert.strictEqual(spoofRes.status, 400);
    assert.strictEqual(spoofRes.body.error, 'payment_not_verified_by_telegram');

    // Webhook with invalid secret
    const badSecretRes = await request('POST', '/api/telegram/webhook', {
      pre_checkout_query: { id: 'pq_fake', invoice_payload: orderId }
    }, { 'x-telegram-bot-api-secret-token': 'wrong_secret' });
    assert.strictEqual(badSecretRes.status, 403);
    assert.strictEqual(badSecretRes.body.error, 'invalid_webhook_secret');

    // Pre-checkout with wrong currency (e.g. USD instead of XTR)
    const badCurrRes = await request('POST', '/api/telegram/webhook', {
      pre_checkout_query: {
        id: 'pq_bad_curr',
        invoice_payload: orderId,
        currency: 'USD',
        total_amount: 100,
        from: { id: Number(testTgUserId) }
      }
    }, { 'x-telegram-bot-api-secret-token': 'stars_test_secret_xyz123' });
    assert.strictEqual(badCurrRes.body.error, 'invalid_currency');

    // Pre-checkout with mismatched amount
    const badAmtRes = await request('POST', '/api/telegram/webhook', {
      pre_checkout_query: {
        id: 'pq_bad_amt',
        invoice_payload: orderId,
        currency: 'XTR',
        total_amount: 10, // Attempting to pay 10 stars instead of 100
        from: { id: Number(testTgUserId) }
      }
    }, { 'x-telegram-bot-api-secret-token': 'stars_test_secret_xyz123' });
    assert.strictEqual(badAmtRes.body.error, 'amount_mismatch');
    console.log('  [PASS] Anti-spoofing and security rules strictly rejected fraudulent attempts.');

    // -------------------------------------------------------------
    // TEST 4: PRE-CHECKOUT APPROVAL
    // -------------------------------------------------------------
    console.log('\nTest 4: Simulating authentic Telegram pre_checkout_query approval...');
    const preRes = await request('POST', '/api/telegram/webhook', {
      pre_checkout_query: {
        id: 'pq_valid_' + Date.now(),
        invoice_payload: orderId,
        currency: 'XTR',
        total_amount: 100,
        from: { id: Number(testTgUserId), first_name: 'AlimBuyer' }
      }
    }, { 'x-telegram-bot-api-secret-token': 'stars_test_secret_xyz123' });
    assert.strictEqual(preRes.status, 200);
    assert.strictEqual(preRes.body.preCheckoutApproved, true);
    console.log('  [PASS] Pre-checkout query approved and order transitioned to payment_processing.');

    // -------------------------------------------------------------
    // TEST 5: SUCCESSFUL PAYMENT FULFILLMENT (COINS)
    // -------------------------------------------------------------
    console.log('\nTest 5: Processing authentic successful_payment and crediting coins...');
    const chargeId = 'tg_ch_' + Date.now() + '_xyz';
    const payRes = await request('POST', '/api/telegram/webhook', {
      message: {
        message_id: 101,
        from: { id: Number(testTgUserId), first_name: 'AlimBuyer' },
        chat: { id: Number(testTgUserId), type: 'private' },
        successful_payment: {
          currency: 'XTR',
          total_amount: 100,
          invoice_payload: orderId,
          telegram_payment_charge_id: chargeId,
          provider_payment_charge_id: ''
        }
      }
    }, { 'x-telegram-bot-api-secret-token': 'stars_test_secret_xyz123' });
    assert.strictEqual(payRes.status, 200);
    assert.strictEqual(payRes.body.ok, true);
    assert.strictEqual(payRes.body.success, true);

    // Verify order status endpoint
    const checkRes = await request('POST', '/api/stars/check-order', {
      orderId,
      playerId: testPlayerId
    });
    assert.strictEqual(checkRes.status, 200);
    assert.strictEqual(checkRes.body.status, 'paid');
    assert.strictEqual(checkRes.body.isPaid, true);
    assert.strictEqual(checkRes.body.chargeId, chargeId);
    console.log('  [PASS] Order transitioned to paid. Charge ID verified:', chargeId);

    // Verify economy sync has the 500 coins credited
    const econRes = await request('POST', '/api/economy/sync', { playerId: testPlayerId });
    assert.strictEqual(econRes.status, 200);
    assert(econRes.body.coins >= 500, 'Player coins must reflect credited package');
    console.log('  [PASS] Authoritative coins credited to player: ' + econRes.body.coins + ' FvH Coin.');

    // -------------------------------------------------------------
    // TEST 6: REPLAY PROTECTION & IDEMPOTENCY
    // -------------------------------------------------------------
    console.log('\nTest 6: Testing duplicate charge protection (idempotency)...');
    const coinsBeforeReplay = econRes.body.coins;
    const replayRes = await request('POST', '/api/telegram/webhook', {
      message: {
        message_id: 102,
        from: { id: Number(testTgUserId) },
        chat: { id: Number(testTgUserId), type: 'private' },
        successful_payment: {
          currency: 'XTR',
          total_amount: 100,
          invoice_payload: orderId,
          telegram_payment_charge_id: chargeId // Exact duplicate charge ID
        }
      }
    }, { 'x-telegram-bot-api-secret-token': 'stars_test_secret_xyz123' });
    assert.strictEqual(replayRes.status, 200);
    assert.strictEqual(replayRes.body.duplicate, true, 'Must detect duplicate charge');

    // Confirm coins did NOT increase on duplicate delivery
    const econAfterReplay = await request('POST', '/api/economy/sync', { playerId: testPlayerId });
    assert.strictEqual(econAfterReplay.body.coins, coinsBeforeReplay, 'Coins must not increase on duplicate charge');
    console.log('  [PASS] Duplicate webhook delivery recognized and safely ignored without double-crediting.');

    // -------------------------------------------------------------
    // TEST 7: STRICT BATTLE PASS REJECTION (PURCHASE & CLAIM)
    // -------------------------------------------------------------
    console.log('\nTest 7: Verifying complete server-side rejection of Battle Pass purchase & claims...');
    
    // A. Attempt invoice creation for Battle Pass
    const bpInv = await request('POST', '/api/stars/create-invoice', {
      productId: 'battlepass_premium',
      playerId: testPlayerId,
      telegramUserId: testTgUserId
    });
    assert.strictEqual(bpInv.status, 404, 'Battle Pass invoice must return 404');
    assert.strictEqual(bpInv.body.error, 'product_not_found', 'Error must be product_not_found');

    // B. Attempt single-tier Battle Pass claim
    const bpClaimSingle = await request('POST', '/api/economy/reward', {
      playerId: testPlayerId,
      rewardType: 'battlepass',
      level: 1,
      track: 'free'
    });
    assert.strictEqual(bpClaimSingle.status, 400, 'Battle Pass claim must return 400');
    assert.strictEqual(bpClaimSingle.body.error, 'battlepass_not_supported');

    // C. Attempt claim-all Battle Pass
    const bpClaimAll = await request('POST', '/api/economy/reward', {
      playerId: testPlayerId,
      rewardType: 'battlepass_all'
    });
    assert.strictEqual(bpClaimAll.status, 400, 'Battle Pass claim all must return 400');
    assert.strictEqual(bpClaimAll.body.error, 'battlepass_not_supported');

    // D. Attempt TON payload for Battle Pass
    const bpTon = await request('POST', '/api/ton/create-payload', {
      productId: 'battlepass_premium',
      playerId: testPlayerId
    });
    assert.strictEqual(bpTon.status, 400, 'TON Battle Pass creation must return 400');
    assert.strictEqual(bpTon.body.error, 'battlepass_not_supported');

    console.log('  [PASS] All Battle Pass invoice and reward claim attempts strictly rejected by server.');

    console.log('\n======================================================');
    console.log('ALL TELEGRAM STARS PURCHASE LIFECYCLE CHECKS PASSED (7/7)!');
    console.log('======================================================\n');
    process.exit(0);
  } finally {
    if (fs.existsSync(tmpDataPath)) {
      try { fs.unlinkSync(tmpDataPath); } catch (e) {}
    }
  }
}

run().catch(err => {
  console.error('\n[FATAL ERROR]:', err);
  process.exit(1);
});
