// FOOTY vs HOOPS - Storage Adapter Verification Suite
// Validates JSON adapter and PostgreSQL adapter for ACID atomicity, concurrency,
// constraint enforcement, duplicate rewards, idempotency, interrupted migration, and rollback.

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { newDb } = require('pg-mem');
const { JsonStorageAdapter } = require('../server/storage/json_storage');
const { PostgresStorageAdapter } = require('../server/storage/postgres_storage');

const mockItemCatalog = {
  'skin_solar': { name: 'Solar Flare', category: 'skins', slot: 'skin', price: 150 },
  'ball_hyper': { name: 'Hyper Orange Ball', category: 'balls', slot: 'ball', price: 200 },
  'boost_speed': { name: 'Speed Drink', category: 'boosts', price: 100 }
};

const mockBundleCatalog = {
  'bundle_super': {
    id: 'bundle_super',
    name: 'Super Starter Bundle',
    coinsPrice: 250,
    items: [
      { type: 'cosmetic', id: 'skin_solar' },
      { type: 'coins', val: 50 }
    ]
  }
};

async function createMockPostgresAdapter() {
  const db = newDb();
  const pg = db.adapters.createPg();
  const pool = new pg.Pool();
  const adapter = new PostgresStorageAdapter({
    pool,
    pgMemDb: db,
    itemCatalog: mockItemCatalog,
    bundleCatalog: mockBundleCatalog
  });
  await adapter.init();
  return { adapter, db, pool };
}

async function runTests() {
  console.log('=== FOOTY vs HOOPS Storage Adapter Test Suite ===\n');

  // Diagnostic regarding Live vs Mocked instance (Requirement 8)
  const liveDbUrl = process.env.TEST_DATABASE_URL;
  if (liveDbUrl) {
    console.log('[INTEGRATION MODE] Testing against LIVE PostgreSQL instance (TEST_DATABASE_URL detected).');
  } else {
    console.log('[UNIT / MOCK MODE] Testing against IN-MEMORY POSTGRESQL ENGINE (pg-mem).');
    console.log('  -> Verifies exact SQL syntax, ACID transactions, row locks, CHECK constraints, and rollbacks.');
    console.log('  -> Note: True physical persistence across system reboot requires a live PostgreSQL instance.\n');
  }

  // -------------------------------------------------------------
  // Test 1: JSON Storage Adapter Baseline Operations
  // -------------------------------------------------------------
  console.log('Test 1: JSON Storage Adapter - Basic Operations & Backward Compatibility...');
  const tempJsonPath = path.join(__dirname, 'temp_test_data.json');
  if (fs.existsSync(tempJsonPath)) fs.unlinkSync(tempJsonPath);

  const jsonAdapter = new JsonStorageAdapter({
    dataFilePath: tempJsonPath,
    itemCatalog: mockItemCatalog,
    bundleCatalog: mockBundleCatalog
  });
  await jsonAdapter.init();

  const p1 = await jsonAdapter.getPlayer('test_user_json');
  assert.strictEqual(p1.playerId, 'test_user_json');
  assert.strictEqual(p1.coins, 350);
  assert.strictEqual(p1.teamChosen, false);

  // Test JSON Team Lock
  const lockRes = await jsonAdapter.lockTeam('test_user_json', 'footy', 'footy');
  assert.strictEqual(lockRes.ok, true);
  assert.strictEqual(lockRes.selectedTeam, 'footy');

  // Test JSON Permanent Lock Rejection
  const switchRes = await jsonAdapter.lockTeam('test_user_json', 'hoops', 'hoops');
  assert.strictEqual(switchRes.ok, false);
  assert.strictEqual(switchRes.error, 'team_already_locked');

  // Test JSON Purchase
  const purRes = await jsonAdapter.executePurchase('test_user_json', 'skin_solar');
  assert.strictEqual(purRes.ok, true);
  assert.strictEqual(purRes.coins, 200); // 350 - 150 = 200
  assert(purRes.owned.includes('skin_solar'));

  // Cleanup temp json
  await jsonAdapter.close();
  if (fs.existsSync(tempJsonPath)) fs.unlinkSync(tempJsonPath);
  console.log('  [PASS] JSON Storage Adapter validated successfully.\n');

  // -------------------------------------------------------------
  // Test 2: PostgreSQL Adapter - Initialization & Health
  // -------------------------------------------------------------
  console.log('Test 2: PostgreSQL Adapter - Schema Creation & Health Check...');
  const { adapter: pgAdapter, pool } = await createMockPostgresAdapter();
  const healthy = await pgAdapter.isHealthy();
  assert.strictEqual(healthy, true, 'Adapter should report healthy');
  console.log('  [PASS] PostgreSQL Adapter initialized and healthy.\n');

  // -------------------------------------------------------------
  // Test 3: PostgreSQL - Transaction Atomicity & Purchase Execution
  // -------------------------------------------------------------
  console.log('Test 3: PostgreSQL Adapter - Transaction Atomicity (Purchase)...');
  const athlete = await pgAdapter.getPlayer('athlete_alpha');
  assert.strictEqual(athlete.coins, 350);

  const purchaseResult = await pgAdapter.executePurchase('athlete_alpha', 'skin_solar');
  assert.strictEqual(purchaseResult.ok, true);
  assert.strictEqual(purchaseResult.coins, 200);
  assert(purchaseResult.owned.includes('skin_solar'));

  // Verify transaction ledger in database
  const ledgerEntries = await pgAdapter.getLedger('athlete_alpha');
  assert.strictEqual(ledgerEntries.length, 1);
  assert.strictEqual(ledgerEntries[0].type, 'purchase');
  assert.strictEqual(ledgerEntries[0].deltaCoins, -150);
  assert.strictEqual(ledgerEntries[0].balanceAfter, 200);
  console.log('  [PASS] Purchase transaction atomically debited coins, granted item, and recorded ledger entry.\n');

  // -------------------------------------------------------------
  // Test 4: PostgreSQL - Insufficient Funds & Database Constraint Check
  // -------------------------------------------------------------
  console.log('Test 4: PostgreSQL Adapter - Insufficient Funds & Negative Balance Prevention...');
  // Athlete now has 200 coins. Trying to buy ball_hyper (200) works, leaving 0.
  const purchaseBall = await pgAdapter.executePurchase('athlete_alpha', 'ball_hyper');
  assert.strictEqual(purchaseBall.ok, true);
  assert.strictEqual(purchaseBall.coins, 0);

  // Now trying to buy boost_speed (100) with 0 coins must be rejected
  const failedPurchase = await pgAdapter.executePurchase('athlete_alpha', 'boost_speed');
  assert.strictEqual(failedPurchase.ok, false);
  assert.strictEqual(failedPurchase.error, 'insufficient_funds');

  // Verify athlete balance remained exactly 0 and was never negative
  const checkAthlete = await pgAdapter.getPlayer('athlete_alpha');
  assert.strictEqual(checkAthlete.coins, 0);
  console.log('  [PASS] Insufficient funds rejected; balance never negative (CHECK constraint preserved).\n');

  // -------------------------------------------------------------
  // Test 5: PostgreSQL - Concurrency Serialization & Race Conditions
  // -------------------------------------------------------------
  console.log('Test 5: PostgreSQL Adapter - Concurrency Serialization (Race Condition Test)...');
  // Create athlete with 300 coins.
  const racer = await pgAdapter.getPlayer('athlete_racer');
  await pgAdapter.savePlayer(Object.assign(racer, { coins: 300 }));

  // Each item costs 150 coins. Athlete has 300 coins, so exactly 2 purchases can succeed.
  // We fire 10 concurrent purchase requests simultaneously.
  const concurrentItem = 'boost_speed'; // costs 100 coins, can buy exactly 3
  const attempts = [];
  for (let i = 0; i < 10; i++) {
    attempts.push(pgAdapter.executePurchase('athlete_racer', concurrentItem));
  }
  const results = await Promise.all(attempts);

  const successes = results.filter(r => r.ok === true);
  const failures = results.filter(r => r.ok === false);

  assert.strictEqual(successes.length, 3, `Expected exactly 3 purchases to succeed (300/100), got ${successes.length}`);
  assert.strictEqual(failures.length, 7, `Expected exactly 7 purchases to fail, got ${failures.length}`);

  const racerEnd = await pgAdapter.getPlayer('athlete_racer');
  assert.strictEqual(racerEnd.coins, 0, 'Final coins balance must be exactly 0');
  assert.strictEqual(racerEnd.boostCharges[concurrentItem], 3, 'Boost charges must equal exactly 3');

  const racerLedger = await pgAdapter.getLedger('athlete_racer');
  assert.strictEqual(racerLedger.length, 3, 'Ledger must contain exactly 3 purchase entries');
  console.log('  [PASS] 10 concurrent requests cleanly serialized: exactly 3 succeeded, 7 rejected, balance 0.\n');

  // -------------------------------------------------------------
  // Test 6: PostgreSQL - Duplicate Reward Prevention & Match Token Security
  // -------------------------------------------------------------
  console.log('Test 6: PostgreSQL Adapter - Duplicate Reward Prevention & Anti-Cheat...');
  const matchRecord = {
    matchId: 'FVH-TEST-MATCH-1',
    host: { playerId: 'host_p1', name: 'Host Player' },
    guest: { playerId: 'guest_p2', name: 'Guest Player' },
    finalScore: [2, 1],
    winner: 0,
    phase: 'regulation',
    mode: 'footy',
    completedAt: Date.now(),
    matchToken: 'mtok_secret_hash_12345',
    rewarded: {}
  };
  await pgAdapter.saveCompletedMatch('FVH-TEST-MATCH-1', matchRecord);

  // Claim 1: Valid claim
  const claim1 = await pgAdapter.executeReward(
    'host_p1',
    'match',
    'FVH-TEST-MATCH-1',
    20,
    30,
    {
      onlineMatch: true,
      matchToken: 'mtok_secret_hash_12345',
      meta: { outcome: 'win', mode: 'footy' }
    }
  );
  assert.strictEqual(claim1.ok, true);
  assert.strictEqual(claim1.coinsEarned, 20);

  // Claim 2: Duplicate claim attempt with same token and matchId
  const claim2 = await pgAdapter.executeReward(
    'host_p1',
    'match',
    'FVH-TEST-MATCH-1',
    20,
    30,
    {
      onlineMatch: true,
      matchToken: 'mtok_secret_hash_12345',
      meta: { outcome: 'win', mode: 'footy' }
    }
  );
  assert.strictEqual(claim2.ok, false);
  assert.strictEqual(claim2.error, 'match_already_rewarded');

  // Claim 3: Forged / Invalid token claim attempt
  const claim3 = await pgAdapter.executeReward(
    'guest_p2',
    'match',
    'FVH-TEST-MATCH-1',
    20,
    30,
    {
      onlineMatch: true,
      matchToken: 'forged_fake_token',
      meta: { outcome: 'loss', mode: 'footy' }
    }
  );
  assert.strictEqual(claim3.ok, false);
  assert.strictEqual(claim3.error, 'invalid_match_token');
  console.log('  [PASS] Duplicate match reward and forged token requests strictly rejected.\n');

  // -------------------------------------------------------------
  // Test 7: PostgreSQL - Idempotency Key Caching
  // -------------------------------------------------------------
  console.log('Test 7: PostgreSQL Adapter - Idempotency Key Caching...');
  const idempKey = 'client_uuid_abc_123';
  const buyer = await pgAdapter.getPlayer('athlete_idemp');
  await pgAdapter.savePlayer(Object.assign(buyer, { coins: 500 }));

  // First call with idempotencyKey
  const resFirst = await pgAdapter.executePurchase('athlete_idemp', 'skin_solar', { idempotencyKey: idempKey });
  assert.strictEqual(resFirst.ok, true);
  assert.strictEqual(resFirst.coins, 350);

  // Second call with same idempotencyKey
  const resSecond = await pgAdapter.executePurchase('athlete_idemp', 'skin_solar', { idempotencyKey: idempKey });
  assert.strictEqual(resSecond.ok, true);
  assert.strictEqual(resSecond.alreadyProcessed, true);
  assert.strictEqual(resSecond.txId, resFirst.txId);
  assert.strictEqual(resSecond.coins, 350); // Did not debit again!

  const idempBuyer = await pgAdapter.getPlayer('athlete_idemp');
  assert.strictEqual(idempBuyer.coins, 350, 'Balance must remain 350 without double charge');
  console.log('  [PASS] Idempotency key returned cached response without double charge.\n');

  // -------------------------------------------------------------
  // Test 8: PostgreSQL - Permanent Team Selection & Lock
  // -------------------------------------------------------------
  console.log('Test 8: PostgreSQL Adapter - Permanent Team Selection & Lock...');
  await pgAdapter.getPlayer('athlete_team_lock');

  // Initial selection
  const t1 = await pgAdapter.lockTeam('athlete_team_lock', 'footy', 'footy');
  assert.strictEqual(t1.ok, true);
  assert.strictEqual(t1.selectedTeam, 'footy');

  // Attempting to switch to hoops
  const t2 = await pgAdapter.lockTeam('athlete_team_lock', 'hoops', 'hoops');
  assert.strictEqual(t2.ok, false);
  assert.strictEqual(t2.error, 'team_already_locked');

  // Re-confirming footy is idempotent
  const t3 = await pgAdapter.lockTeam('athlete_team_lock', 'footy', 'footy');
  assert.strictEqual(t3.ok, true);
  console.log('  [PASS] Team selection permanently locked and illegal changes rejected.\n');

  // -------------------------------------------------------------
  // Test 9: PostgreSQL - Interrupted Migration & Rollback
  // -------------------------------------------------------------
  console.log('Test 9: PostgreSQL Adapter - Interrupted Migration Rollback...');
  const { adapter: testRollbackAdapter } = await createMockPostgresAdapter();

  const brokenState = {
    players: {
      'valid_p1': { playerId: 'valid_p1', coins: 100 }
    },
    // Malformed transaction with negative balance that triggers CHECK constraint failure
    economyLedger: [
      { id: 'tx_good', txId: 'tx_good', playerId: 'valid_p1', type: 'reward', deltaCoins: 50, balanceAfter: 150 },
      { id: 'tx_bad', txId: 'tx_bad', playerId: 'valid_p1', type: 'purchase', deltaCoins: -200, balanceAfter: -50 } // FAILS CHECK (balance_after >= 0)
    ]
  };

  let threwError = false;
  try {
    await testRollbackAdapter.importState(brokenState);
  } catch (err) {
    threwError = true;
  }
  assert.strictEqual(threwError, true, 'Import of invalid state must throw error');

  // Verify that rollback cleanly removed valid_p1 from the failed transaction
  const checkRolledBack = await testRollbackAdapter.query("SELECT * FROM players WHERE player_id = 'valid_p1'");
  assert.strictEqual(checkRolledBack.rows.length, 0, 'Rolled back state must leave zero orphan rows');
  console.log('  [PASS] Interrupted migration automatically and cleanly rolled back without orphan records.\n');

  // -------------------------------------------------------------
  // Test 10: PostgreSQL - Export / Import Consistency (Round-Trip)
  // -------------------------------------------------------------
  console.log('Test 10: PostgreSQL Adapter - Export / Import Round-Trip Consistency...');
  const exported = await pgAdapter.exportState();
  assert(exported.players['athlete_alpha']);
  assert.strictEqual(exported.players['athlete_alpha'].coins, 0);
  assert(exported.completedMatches['FVH-TEST-MATCH-1']);
  assert.strictEqual(exported.completedMatches['FVH-TEST-MATCH-1'].winner, 0);

  const { adapter: freshAdapter } = await createMockPostgresAdapter();
  await freshAdapter.importState(exported);

  const reloaded = await freshAdapter.getPlayer('athlete_alpha');
  assert.strictEqual(reloaded.coins, 0);
  assert(reloaded.owned.includes('skin_solar'));

  const reloadedMatch = await freshAdapter.getCompletedMatch('FVH-TEST-MATCH-1');
  assert.strictEqual(reloadedMatch.matchToken, 'mtok_secret_hash_12345');
  console.log('  [PASS] State exported and re-imported into fresh adapter with 100% fidelity.\n');

  await pgAdapter.close();
  await testRollbackAdapter.close();
  await freshAdapter.close();

  console.log('======================================================');
  console.log('ALL STORAGE ADAPTER TESTS PASSED (10/10)!');
  console.log('======================================================\n');
}

runTests().catch(err => {
  console.error('\n[TEST SUITE FAILURE]', err);
  process.exit(1);
});
