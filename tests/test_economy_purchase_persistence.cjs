// FOOTY vs HOOPS - Economy Purchase Persistence & Anti-Duplication Verification Suite
// Verifies:
// 1. Purchases atomically deduct coins and grant items.
// 2. Subsequent /api/economy/sync calls NEVER revert deducted balance back to previous higher amounts.
// 3. Client cannot inject unpurchased items into player.owned via /api/economy/sync.
// 4. Failed purchases do not grant items or modify balances.
// 5. State persists cleanly across reloads.

const assert = require('assert');
const http = require('http');
const path = require('path');
const fs = require('fs');

const TEST_PORT = 8529;
process.env.PORT = String(TEST_PORT);
process.env.NODE_ENV = 'test';
process.env.TELEGRAM_BOT_TOKEN = '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ123456789';
process.env.TELEGRAM_WEBHOOK_SECRET = 'test_secret_economy_persistence';

const serverApp = require('../server/server.js');

function apiPost(endpoint, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body || {});
    const req = http.request({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        } catch (e) {
          resolve({ status: res.statusCode, raw });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function apiGet(endpoint) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: endpoint,
      method: 'GET'
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        } catch (e) {
          resolve({ status: res.statusCode, raw });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('=== FOOTY vs HOOPS Economy Purchase Persistence & Sync Integrity Suite ===\n');

  await new Promise(r => setTimeout(r, 200));

  const playerId = 'test_athlete_persistence_' + Date.now();

  // Test 1: Brand new player initial onboarding sync
  console.log('Test 1: Initial player onboarding sync...');
  const initSync = await apiPost('/api/economy/sync', {
    playerId: playerId,
    playerName: 'AuditStriker',
    coins: 2000
  });
  assert.strictEqual(initSync.status, 200);
  assert.strictEqual(initSync.body.ok, true);
  assert.strictEqual(initSync.body.coins, 2000, 'Initial sync must establish starting balance');
  console.log('  [PASS] Initial balance established at 2000 coins.\n');

  // Test 2: Purchase item (skin_footy_cyber_strike, price 1400 coins)
  console.log('Test 2: Purchasing item in store (cost: 1400 coins)...');
  const purchaseRes = await apiPost('/api/economy/purchase', {
    playerId: playerId,
    itemId: 'skin_footy_cyber_strike'
  });
  assert.strictEqual(purchaseRes.status, 200);
  assert.strictEqual(purchaseRes.body.ok, true);
  assert.strictEqual(purchaseRes.body.coins, 600, 'Balance must be atomically reduced from 2000 to 600');
  assert.ok(purchaseRes.body.owned.includes('skin_footy_cyber_strike'), 'Purchased item must be in owned list');
  console.log('  [PASS] Item purchased: balance decreased to 600, item added to owned.\n');

  // Test 3: Simulate game restart / re-open (THE CRITICAL BUG REPRO)
  console.log('Test 3: Simulating game restart and reconnect sync (anti-duplication / no coin refund)...');
  const restartSync = await apiPost('/api/economy/sync', {
    playerId: playerId,
    // Simulate stale client sending old 2000 coins or higher value
    coins: 2000,
    owned: ['skin_rookie', 'fake_unbought_item']
  });
  assert.strictEqual(restartSync.status, 200);
  assert.strictEqual(restartSync.body.ok, true);
  assert.strictEqual(restartSync.body.coins, 600, 'Server MUST NOT refund spent coins back to 2000 on sync!');
  assert.ok(restartSync.body.owned.includes('skin_footy_cyber_strike'), 'Purchased item must remain owned');
  assert.strictEqual(restartSync.body.owned.includes('fake_unbought_item'), false, 'Unpurchased items must NOT be accepted into owned');
  console.log('  [PASS] Coins stayed at 600 (no refund glitch) and item remained owned; fake item rejected.\n');

  // Test 4: Insufficient funds purchase rejection
  console.log('Test 4: Attempting purchase with insufficient funds (cost: 1000, balance: 600)...');
  const failedPurchase = await apiPost('/api/economy/purchase', {
    playerId: playerId,
    itemId: 'skin_footy_golden_legend' // price: 2500
  });
  assert.strictEqual(failedPurchase.status, 400);
  assert.strictEqual(failedPurchase.body.ok, false);
  assert.strictEqual(failedPurchase.body.error, 'insufficient_funds');

  // Query server state to confirm balance unchanged
  const stateCheck = await apiGet('/api/economy/state?playerId=' + playerId);
  assert.strictEqual(stateCheck.body.coins, 600, 'Balance must remain 600 after rejected purchase');
  assert.strictEqual(stateCheck.body.owned.includes('skin_footy_golden_legend'), false, 'Item must NOT be owned after rejection');
  console.log('  [PASS] Insufficient funds purchase strictly rejected without modifying balance or inventory.\n');

  // Test 5: Verify ledger audit trail
  console.log('Test 5: Verifying economy ledger transactions...');
  assert.ok(Array.isArray(stateCheck.body.transactions), 'Ledger transactions must be an array');
  const purchaseTx = stateCheck.body.transactions.find(tx => tx.type === 'purchase' && tx.itemId === 'skin_footy_cyber_strike');
  assert.ok(purchaseTx, 'Ledger must contain purchase transaction record');
  assert.strictEqual(purchaseTx.deltaCoins, -1400);
  assert.strictEqual(purchaseTx.balanceAfter, 600);
  console.log('  [PASS] Ledger contains exact transactional record of purchase.\n');

  console.log('======================================================');
  console.log('ALL ECONOMY PURCHASE PERSISTENCE TESTS PASSED (5/5)!');
  console.log('======================================================');
  process.exit(0);
}

runTests().catch(err => {
  console.error('[TEST FAILURE]', err);
  process.exit(1);
});
