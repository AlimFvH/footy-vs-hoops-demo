#!/usr/bin/env node
/**
 * FOOTY vs HOOPS - PostgreSQL Rollback & Recovery Tool
 * Safely restores state from backup JSON or exports PostgreSQL state back to JSON.
 *
 * Usage:
 *   # Export current DB state to JSON file
 *   DATABASE_URL="postgres://..." node scripts/rollback_postgres.js --export backups/recovery.json
 *
 *   # Restore DB state from a specific backup JSON
 *   DATABASE_URL="postgres://..." node scripts/rollback_postgres.js --restore backups/data.backup.<epoch>.json
 */

const fs = require('fs');
const path = require('path');
const { PostgresStorageAdapter } = require('../server/storage/postgres_storage');

async function runRollback(options = {}) {
  console.log('=== FOOTY vs HOOPS: PostgreSQL Rollback & Recovery Tool ===\n');

  const args = process.argv.slice(2);
  const dbUrl = options.connectionString || process.env.DATABASE_URL;

  if (!dbUrl && !options.pool) {
    console.error('[ERROR] DATABASE_URL environment variable is required.');
    if (options.throwOnError) throw new Error('DATABASE_URL is required');
    process.exit(1);
  }

  const exportIdx = args.indexOf('--export');
  const restoreIdx = args.indexOf('--restore');
  const isExport = options.action === 'export' || exportIdx !== -1;
  const isRestore = options.action === 'restore' || restoreIdx !== -1;

  if (!isExport && !isRestore) {
    console.error('Specify either --export <path> or --restore <backup-json-path>');
    if (options.throwOnError) throw new Error('Specify either export or restore');
    process.exit(1);
  }

  const adapter = new PostgresStorageAdapter({
    connectionString: dbUrl,
    pool: options.pool,
    pgMemDb: options.pgMemDb
  });
  try {
    await adapter.init();

    if (isExport) {
      const targetPath = options.targetPath || (exportIdx !== -1 ? args[exportIdx + 1] : null) || path.join(__dirname, '..', 'backups', `exported.${Date.now()}.json`);
      console.log(`Exporting database state to: ${targetPath}`);
      const state = await adapter.exportState();
      const dir = path.dirname(targetPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(targetPath, JSON.stringify(state, null, 2), 'utf8');
      console.log(`[OK] Successfully exported ${Object.keys(state.players || {}).length} players to ${targetPath}`);
      return state;
    }

    if (isRestore) {
      const backupPath = options.backupPath || (restoreIdx !== -1 ? args[restoreIdx + 1] : null);
      if (!backupPath || !fs.existsSync(backupPath)) {
        console.error(`[ERROR] Backup file not found: ${backupPath}`);
        if (options.throwOnError) throw new Error(`Backup file not found: ${backupPath}`);
        process.exit(1);
      }
      console.log(`Restoring database state from backup: ${backupPath}`);
      const raw = fs.readFileSync(backupPath, 'utf8');
      const state = JSON.parse(raw);

      await adapter.withTransaction(async (client) => {
        // Clear tables in reverse dependency order
        const tables = ['transactions', 'completed_matches', 'idempotency_keys', 'referrals', 'stars_invoices', 'ton_invoices', 'processed_ton_hashes', 'payments_ledger', 'players'];
        for (const tbl of tables) {
          await client.query(`DELETE FROM ${tbl}`);
        }
      });

      await adapter.importState(state);
      console.log(`[OK] Restored state successfully from ${backupPath}`);
      return state;
    }
  } catch (err) {
    console.error(`[FATAL ROLLBACK ERROR] ${err.message}`);
    if (options.throwOnError) throw err;
    process.exit(1);
  } finally {
    await adapter.close();
  }
}

if (require.main === module) {
  runRollback().catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
  });
}

module.exports = { runRollback };
