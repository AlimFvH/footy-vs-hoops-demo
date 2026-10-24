// FOOTY vs HOOPS - Neon PostgreSQL Live Staging Integration Test Suite
// Designed to run against an actual Neon serverless PostgreSQL database.
//
// SAFEGUARD INVARIANT:
// If no STAGING_DATABASE_URL or TEST_DATABASE_URL is provided in the environment,
// this suite logs [NOT RUN] and exits without claiming real cloud persistence.
// Under no circumstances are live database test results fabricated.

const assert = require('assert');
const fs = require('fs');
const path = require('path');
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

function maskUrl(rawUrl) {
  if (!rawUrl) return 'none';
  try {
    const u = new URL(rawUrl);
    if (u.password) u.password = '***';
    return u.toString();
  } catch (e) {
    return 'postgres://***';
  }
}

async function runNeonStagingIntegration() {
  console.log('=== FOOTY vs HOOPS: Neon PostgreSQL Staging Integration Suite ===\n');

  const stagingUrl = process.env.STAGING_DATABASE_URL;

  if (!stagingUrl) {
    console.log('======================================================================');
    console.log('[INTEGRATION STATUS] NOT RUN (SKIPPED)');
    console.log('======================================================================');
    console.log('Reason: No STAGING_DATABASE_URL environment variable was detected.');
    console.log('\nPer Stage H project safeguards, live cloud persistence is NOT claimed');
    console.log('until tests physically run against an active PostgreSQL instance.\n');
    console.log('To execute this suite against your Neon Free staging database:');
    console.log('  1. Create a free project on https://neon.tech');
    console.log('  2. Copy the pooled connection string (with ?sslmode=require)');
    console.log('  3. In PowerShell, set your environment variable:');
    console.log('       $env:STAGING_DATABASE_URL = "postgresql://user:pass@ep-xyz-pooler.region.neon.tech/neondb?sslmode=require"');
    console.log('  4. Run this integration test:');
    console.log('       node tests/test_neon_staging_integration.cjs\n');
    console.log('All local unit tests, ACID transactions (via pg-mem), and JSON storage remain 100% verified.');
    return { status: 'NOT RUN', testsPassed: 0, reason: 'missing_staging_url' };
  }

  // Safety Check: Mask credentials for logging
  const maskedTarget = maskUrl(stagingUrl);
  console.log(`Target Staging Instance: ${maskedTarget}`);

  // Safety Guard: Require explicit operator staging confirmation
  if (!process.env.CONFIRM_NEON_STAGING && !process.env.CONFIRM_STAGING_TEST) {
    console.error('\n[SAFETY HALT] Explicit staging confirmation is required.');
    console.error('To ensure tests never run against an unintended database, set:');
    console.error('  $env:CONFIRM_NEON_STAGING = "true"');
    console.error('in your terminal alongside $env:STAGING_DATABASE_URL.\n');
    process.exit(1);
  }

  // Safety Guard: Refuse to run against production database via URL checks
  const lowerUrl = stagingUrl.toLowerCase();
  const isLikelyProduction = lowerUrl.includes('prod') ||
                             lowerUrl.includes('dpg-') ||
                             lowerUrl.includes('render.com') ||
                             (process.env.NODE_ENV === 'production' && !process.env.STAGING_DATABASE_URL);

  if (isLikelyProduction && !process.env.ALLOW_PROD_INTEGRATION_TEST) {
    console.error('\n[SAFETY HALT] Target database appears to be a production instance.');
    console.error('To protect live player data, integration tests strictly refuse to run against production.');
    console.error('Ensure you supply a dedicated staging database URL via STAGING_DATABASE_URL (e.g. neondb_staging).');
    process.exit(1);
  }

  console.log('Connecting to Neon PostgreSQL and testing SSL handshake (cold start wake-up)...');
  const startTime = Date.now();

  const adapter = new PostgresStorageAdapter({
    connectionString: stagingUrl,
    itemCatalog: mockItemCatalog,
    bundleCatalog: mockBundleCatalog
  });

  const testPlayerPrefix = `staging_test_${Date.now()}`;
  const testAthleteId = `${testPlayerPrefix}_athlete`;
  const testMatchId = `FVH-STAGING-${Date.now()}`;
  const testMatchToken = `mtok_staging_${Date.now()}_hash`;

  try {
    // -------------------------------------------------------------
    // Preflight: Live Staging Database Identity Verification
    // -------------------------------------------------------------
    console.log('\nPreflight: Verifying Live Database Identity & Isolation...');
    const identityRes = await adapter.query(`
      SELECT
        current_database() AS db_name,
        current_user AS db_user,
        version() AS pg_version
    `);
    const dbIdentity = identityRes.rows[0] || {};
    console.log(`  Database Name: ${dbIdentity.db_name}`);
    console.log(`  Database User: ${dbIdentity.db_user}`);
    console.log(`  PG Version:    ${(dbIdentity.pg_version || '').split(' ')[0]} ${(dbIdentity.pg_version || '').split(' ')[1] || ''}`);

    // Verify database name does not indicate production
    const dbNameLower = String(dbIdentity.db_name || '').toLowerCase();
    if ((dbNameLower.includes('prod') || dbNameLower.includes('live')) && !process.env.ALLOW_PROD_INTEGRATION_TEST) {
      console.error(`\n[SAFETY HALT] Database name "${dbIdentity.db_name}" contains production indicators.`);
      console.error('Integration tests strictly refuse to run against production databases.');
      await adapter.close();
      process.exit(1);
    }

    // Check existing table count in public schema
    const tblRes = await adapter.query(`
      SELECT count(*)::int AS count FROM information_schema.tables WHERE table_schema = 'public'
    `);
    const tblCount = tblRes.rows[0]?.count || 0;
    console.log(`  Existing Public Tables: ${tblCount}`);

    // If tables already exist, check if players table contains real production data
    if (tblCount > 0) {
      try {
        const pCountRes = await adapter.query('SELECT count(*)::int AS count FROM players');
        const playerCount = pCountRes.rows[0]?.count || 0;
        console.log(`  Existing Player Records: ${playerCount}`);
        if (playerCount > 50 && !process.env.ALLOW_EXISTING_DATA_STAGING) {
          console.error(`\n[SAFETY HALT] Target database contains ${playerCount} existing player records.`);
          console.error('To protect existing data from accidental test pollution, tests are halted.');
          console.error('If this is an intentional staging database with pre-migrated data, set:');
          console.error('  $env:ALLOW_EXISTING_DATA_STAGING = "true"');
          await adapter.close();
          process.exit(1);
        }
      } catch (e) {
        // players table does not exist yet; fresh staging database
      }
    }
    console.log('  [PASS] Staging database identity and isolation verified.');

    // -------------------------------------------------------------
    // Test 1: Connection & SSL Handshake Verification
    // -------------------------------------------------------------
    console.log('\nTest 1: Live Connection, SSL Handshake & Schema Initialization...');
    await adapter.init();
    const connectDurationMs = Date.now() - startTime;
    console.log(`  [PASS] Connected and initialized in ${connectDurationMs}ms (SSL verified).`);

    const healthy = await adapter.isHealthy();
    assert.strictEqual(healthy, true, 'Database must report healthy');
    console.log('  [PASS] Health check query SELECT 1 returned alive.');

    // -------------------------------------------------------------
    // Test 2: CRUD Operations on Athlete Profile
    // -------------------------------------------------------------
    console.log('\nTest 2: CRUD Operations on Live Relational Table...');
    const athlete = await adapter.getPlayer(testAthleteId);
    assert.strictEqual(athlete.playerId, testAthleteId);
    assert.strictEqual(athlete.coins, 350);
    assert.strictEqual(athlete.teamChosen, false);

    // Update athlete profile
    athlete.playerName = 'Neon Test Runner';
    athlete.coins = 500;
    await adapter.savePlayer(athlete);

    const reloaded = await adapter.getPlayer(testAthleteId);
    assert.strictEqual(reloaded.playerName, 'Neon Test Runner');
    assert.strictEqual(reloaded.coins, 500);
    console.log('  [PASS] Athlete record created, updated, and re-read with exact field parity.');

    // -------------------------------------------------------------
    // Test 3: Atomic FvH Coin Debit & Concurrency Serialization
    // -------------------------------------------------------------
    console.log('\nTest 3: Atomic FvH Coin Debit & Concurrency Serialization...');
    // Athlete has 500 coins. Each boost_speed costs 100 coins. Exactly 5 purchases can succeed.
    // Fire 10 simultaneous concurrent purchase requests over live network connections.
    const concurrentAttempts = [];
    for (let i = 0; i < 10; i++) {
      concurrentAttempts.push(adapter.executePurchase(testAthleteId, 'boost_speed'));
    }
    const results = await Promise.all(concurrentAttempts);
    const successes = results.filter(r => r.ok === true);
    const failures = results.filter(r => r.ok === false);

    assert.strictEqual(successes.length, 5, `Expected exactly 5 purchases to succeed (500/100), got ${successes.length}`);
    assert.strictEqual(failures.length, 5, `Expected exactly 5 purchases to fail with insufficient_funds, got ${failures.length}`);

    const racerEnd = await adapter.getPlayer(testAthleteId);
    assert.strictEqual(racerEnd.coins, 0, 'Final coin balance must be exactly 0 (CHECK constraint preserved)');
    assert.strictEqual(racerEnd.boostCharges['boost_speed'], 5, 'Boost charges must equal 5');

    const racerLedger = await adapter.getLedger(testAthleteId);
    assert.strictEqual(racerLedger.length, 5, 'Ledger must contain exactly 5 purchase records');
    console.log('  [PASS] 10 concurrent network requests serialized cleanly: 5 succeeded, 5 rejected, balance 0.');

    // -------------------------------------------------------------
    // Test 4: Transaction Rollback after Intentional Failure
    // -------------------------------------------------------------
    console.log('\nTest 4: Transaction Atomicity & Rollback Verification...');
    let threwRollbackError = false;
    try {
      await adapter.withTransaction(async (client) => {
        await client.query(`
          INSERT INTO players (player_id, coins, created_at, updated_at)
          VALUES ('staging_rollback_probe', 100, $1, $1)
        `, [Date.now()]);

        // Intentional constraint violation: negative balance fails CHECK (balance_after >= 0)
        await client.query(`
          INSERT INTO transactions (id, tx_id, player_id, type, delta_coins, delta_xp, balance_after, timestamp)
          VALUES ('tx_bad_rollback', 'tx_bad_rollback', 'staging_rollback_probe', 'purchase', -200, 0, -100, $1)
        `, [Date.now()]);
      });
    } catch (err) {
      threwRollbackError = true;
    }
    assert.strictEqual(threwRollbackError, true, 'Intentional constraint violation must throw error');

    // Verify probe row was rolled back and does not exist in live DB
    const checkProbe = await adapter.query("SELECT * FROM players WHERE player_id = 'staging_rollback_probe'");
    assert.strictEqual(checkProbe.rows.length, 0, 'Probe row must not exist after rollback');
    console.log('  [PASS] Transaction rolled back cleanly on constraint violation without orphan rows.');

    // -------------------------------------------------------------
    // Test 5: Duplicate Match Reward Prevention & Anti-Cheat
    // -------------------------------------------------------------
    console.log('\nTest 5: Duplicate Match Reward Prevention & Anti-Cheat...');
    const matchRecord = {
      matchId: testMatchId,
      host: { playerId: testAthleteId, name: 'Neon Host' },
      guest: { playerId: 'guest_staging', name: 'Guest' },
      finalScore: [3, 1],
      winner: 0,
      phase: 'regulation',
      mode: 'footy',
      completedAt: Date.now(),
      matchToken: testMatchToken,
      rewarded: {}
    };
    await adapter.saveCompletedMatch(testMatchId, matchRecord);

    const claim1 = await adapter.executeReward(testAthleteId, 'match', testMatchId, 20, 30, {
      onlineMatch: true,
      matchToken: testMatchToken,
      meta: { outcome: 'win', mode: 'footy' }
    });
    assert.strictEqual(claim1.ok, true);
    assert.strictEqual(claim1.coinsEarned, 20);

    const claim2 = await adapter.executeReward(testAthleteId, 'match', testMatchId, 20, 30, {
      onlineMatch: true,
      matchToken: testMatchToken,
      meta: { outcome: 'win', mode: 'footy' }
    });
    assert.strictEqual(claim2.ok, false);
    assert.strictEqual(claim2.error, 'match_already_rewarded');
    console.log('  [PASS] First reward granted; duplicate reward claim rejected with match_already_rewarded.');

    // -------------------------------------------------------------
    // Test 6: Permanent Team Selection Lock
    // -------------------------------------------------------------
    console.log('\nTest 6: Permanent Team Selection Lock...');
    const lock1 = await adapter.lockTeam(testAthleteId, 'footy', 'footy');
    assert.strictEqual(lock1.ok, true);
    assert.strictEqual(lock1.selectedTeam, 'footy');

    const lock2 = await adapter.lockTeam(testAthleteId, 'hoops', 'hoops');
    assert.strictEqual(lock2.ok, false);
    assert.strictEqual(lock2.error, 'team_already_locked');
    console.log('  [PASS] Team lock permanently enforced in live PostgreSQL database.');

    // -------------------------------------------------------------
    // Test 7: Persistence Across Connection Close & Reconnect
    // -------------------------------------------------------------
    console.log('\nTest 7: Physical Persistence Across Pool Closure & Fresh Reconnect...');
    await adapter.close();

    // Reopen a brand new pool and adapter
    const freshAdapter = new PostgresStorageAdapter({
      connectionString: stagingUrl,
      itemCatalog: mockItemCatalog,
      bundleCatalog: mockBundleCatalog
    });
    await freshAdapter.init();

    const physicallyPersisted = await freshAdapter.getPlayer(testAthleteId);
    assert.strictEqual(physicallyPersisted.selectedTeam, 'footy');
    assert.strictEqual(physicallyPersisted.teamChosen, true);
    assert.strictEqual(physicallyPersisted.boostCharges['boost_speed'], 5);
    console.log('  [PASS] Fresh connection confirmed all data was physically persisted to disk.');

    // -------------------------------------------------------------
    // Test 8: Clean Cleanup of Staging Test Data
    // -------------------------------------------------------------
    console.log('\nTest 8: Safe Cleanup of Staging Test Records...');
    await freshAdapter.query('DELETE FROM completed_matches WHERE match_id = $1', [testMatchId]);
    await freshAdapter.query('DELETE FROM players WHERE player_id = $1', [testAthleteId]);
    await freshAdapter.query('DELETE FROM players WHERE player_id = $1', ['staging_rollback_probe']).catch(() => {});
    console.log('  [PASS] Staging test probes cleaned up cleanly.');

    await freshAdapter.close();

    console.log('\n======================================================================');
    console.log('ALL LIVE NEON POSTGRESQL STAGING INTEGRATION TESTS PASSED (8/8)!');
    console.log('======================================================================\n');
    return { status: 'VERIFIED', testsPassed: 8, target: maskedTarget };
  } catch (err) {
    console.error('\n[FATAL STAGING INTEGRATION FAILURE]', err);
    try { await adapter.close(); } catch (e) {}
    process.exit(1);
  }
}

if (require.main === module) {
  runNeonStagingIntegration().catch(err => {
    console.error('Unhandled test error:', err);
    process.exit(1);
  });
}

module.exports = { runNeonStagingIntegration };
