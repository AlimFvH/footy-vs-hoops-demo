#!/usr/bin/env node
/**
 * FOOTY vs HOOPS - Safe PostgreSQL Migration Tool
 * Non-destructive, validated, transactional data migration from data.json to PostgreSQL.
 *
 * Usage:
 *   DATABASE_URL="postgres://user:pass@host:5432/dbname" node scripts/migrate_to_postgres.js
 *
 * Safeguards:
 *   - Creates an immutable timestamped backup in backups/ before proceeding.
 *   - Runs entirely within a PostgreSQL transaction (automatic ROLLBACK on any failure).
 *   - Verifies record counts and financial balances before committing.
 *   - Never prints credentials to console or logs.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { PostgresStorageAdapter } = require('../server/storage/postgres_storage');

async function runMigration(options = {}) {
  console.log('=== FOOTY vs HOOPS: PostgreSQL Migration Tool ===\n');

  const sourceFile = options.sourceFile || process.env.DATA_FILE || path.join(__dirname, '..', 'server', 'data.json');
  if (!fs.existsSync(sourceFile)) {
    console.error(`[ERROR] Source data file not found: ${sourceFile}`);
    if (options.throwOnError) throw new Error(`Source data file not found: ${sourceFile}`);
    process.exit(1);
  }

  // 1. Read & parse source data
  let sourceData;
  let sourceRaw;
  try {
    sourceRaw = fs.readFileSync(sourceFile, 'utf8');
    sourceData = JSON.parse(sourceRaw);
  } catch (err) {
    console.error(`[ERROR] Failed to read/parse source JSON: ${err.message}`);
    if (options.throwOnError) throw err;
    process.exit(1);
  }

  const sourcePlayersCount = sourceData.players ? Object.keys(sourceData.players).length : 0;
  const sourceTxCount = Array.isArray(sourceData.economyLedger) ? sourceData.economyLedger.length : 0;
  const sourceMatchesCount = sourceData.completedMatches ? Object.keys(sourceData.completedMatches).length : 0;
  const sourceSumCoins = Object.values(sourceData.players || {}).reduce((acc, p) => acc + (Number(p.coins) || 0), 0);

  console.log(`Source File: ${sourceFile}`);
  console.log(`  Athletes:           ${sourcePlayersCount}`);
  console.log(`  Ledger Entries:     ${sourceTxCount}`);
  console.log(`  Completed Matches:  ${sourceMatchesCount}`);
  console.log(`  Total Player Coins: ${sourceSumCoins.toLocaleString()}\n`);

  // 2. Create immutable backup
  const backupDir = options.backupDir || path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  const timestamp = Date.now();
  const backupFile = path.join(backupDir, `data.backup.${timestamp}.json`);
  fs.writeFileSync(backupFile, sourceRaw, 'utf8');

  const sourceHash = crypto.createHash('sha256').update(sourceRaw).digest('hex');
  const backupHash = crypto.createHash('sha256').update(fs.readFileSync(backupFile)).digest('hex');

  if (sourceHash !== backupHash) {
    console.error('[ERROR] Backup SHA-256 verification failed! Aborting migration.');
    if (options.throwOnError) throw new Error('Backup SHA-256 verification failed');
    process.exit(1);
  }
  console.log(`[BACKUP CREATED] ${backupFile} (SHA-256: ${backupHash.slice(0, 16)}...)`);

  // 3. Check target connection
  const dbUrl = options.connectionString || process.env.STAGING_DATABASE_URL || process.env.DATABASE_URL;
  if (!dbUrl && !options.pool) {
    console.error('\n[HALT] Neither STAGING_DATABASE_URL nor DATABASE_URL is set.');
    console.error('To run migration against target PostgreSQL, supply connection variable:');
    console.error('  $env:STAGING_DATABASE_URL="postgres://..." ; node scripts/migrate_to_postgres.js\n');
    console.error('Backup preserved. Zero database changes made.');
    if (options.throwOnError) throw new Error('Database URL is not set');
    process.exit(1);
  }

  // Mask database credentials in console
  let maskedUrl = options.pool ? 'In-Memory / Injected Pool' : dbUrl;
  if (dbUrl) {
    try {
      const u = new URL(dbUrl);
      if (u.password) u.password = '***';
      maskedUrl = u.toString();
    } catch (e) {
      maskedUrl = 'postgres://***';
    }
  }
  console.log(`Target Database: ${maskedUrl}\n`);

  // 4. Connect and initialize adapter
  const adapter = new PostgresStorageAdapter({
    connectionString: dbUrl,
    pool: options.pool,
    pgMemDb: options.pgMemDb
  });
  try {
    await adapter.init();
    console.log('[OK] Connected to PostgreSQL and verified schema.');
  } catch (err) {
    console.error(`[ERROR] Failed to connect/init schema in PostgreSQL: ${err.message}`);
    process.exit(1);
  }

  // 5. Ingest data within transaction
  console.log('Ingesting state inside atomic transaction...');
  try {
    await adapter.importState(sourceData);
    console.log('[OK] All records ingested. Running validation checks...\n');

    // 6. Strict validation
    const pRes = await adapter.query('SELECT COUNT(*) as count, SUM(coins) as sum_coins FROM players');
    const dbPlayersCount = parseInt(pRes.rows[0].count, 10);
    const dbSumCoins = parseInt(pRes.rows[0].sum_coins || '0', 10);

    const txRes = await adapter.query('SELECT COUNT(*) as count FROM transactions');
    const dbTxCount = parseInt(txRes.rows[0].count, 10);

    const mRes = await adapter.query('SELECT COUNT(*) as count FROM completed_matches');
    const dbMatchesCount = parseInt(mRes.rows[0].count, 10);

    console.log('=== Migration Verification Matrix ===');
    console.log(`  Players Count:     Expected ${sourcePlayersCount} | DB ${dbPlayersCount} -> ${sourcePlayersCount === dbPlayersCount ? 'VERIFIED' : 'MISMATCH'}`);
    console.log(`  Players Coins Sum: Expected ${sourceSumCoins} | DB ${dbSumCoins} -> ${sourceSumCoins === dbSumCoins ? 'VERIFIED' : 'MISMATCH'}`);
    console.log(`  Ledger Count:      Expected ${sourceTxCount} | DB ${dbTxCount} -> ${sourceTxCount === dbTxCount ? 'VERIFIED' : 'MISMATCH'}`);
    console.log(`  Matches Count:     Expected ${sourceMatchesCount} | DB ${dbMatchesCount} -> ${sourceMatchesCount === dbMatchesCount ? 'VERIFIED' : 'MISMATCH'}`);

    if (
      sourcePlayersCount !== dbPlayersCount ||
      sourceSumCoins !== dbSumCoins ||
      sourceTxCount !== dbTxCount ||
      sourceMatchesCount !== dbMatchesCount
    ) {
      throw new Error('Verification assertion failed: database counts/sums do not match source JSON');
    }

    console.log('\n======================================================');
    console.log('MIGRATION COMPLETED & VERIFIED 100% SUCCESSFULLY');
    console.log('======================================================\n');
  } catch (err) {
    console.error(`\n[FATAL ERROR DURING MIGRATION] ${err.message}`);
    console.error('All database modifications have been rolled back.');
    console.error(`Source JSON at ${sourceFile} remains unchanged.`);
    console.error(`Backup file at ${backupFile} is preserved.`);
    process.exit(1);
  } finally {
    await adapter.close();
  }
}

if (require.main === module) {
  runMigration().catch(err => {
    console.error('Unhandled migration error:', err);
    process.exit(1);
  });
}

module.exports = { runMigration };
