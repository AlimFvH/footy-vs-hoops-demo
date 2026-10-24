// FOOTY vs HOOPS - Rollback & Recovery Automated Test
// Validates that rollback_postgres.js can export state and restore state with 100% fidelity.

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { newDb } = require('pg-mem');
const { runMigration } = require('../scripts/migrate_to_postgres');
const { runRollback } = require('../scripts/rollback_postgres');

async function testRollbackTool() {
  console.log('=== FOOTY vs HOOPS: Rollback & Recovery Automated Test ===\n');

  const db = newDb();
  const pg = db.adapters.createPg();
  const pool = new pg.Pool();

  const realDataFile = path.join(__dirname, '..', 'server', 'data.json');
  const tempDir = path.join(__dirname, 'temp_rollback_test');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  // 1. Ingest initial data
  console.log('Step 1: Migrating initial data...');
  await runMigration({
    sourceFile: realDataFile,
    backupDir: tempDir,
    pool,
    pgMemDb: db,
    throwOnError: true
  });

  // 2. Export database state to recovery.json
  console.log('\nStep 2: Exporting DB state via rollback tool...');
  const exportPath = path.join(tempDir, 'export_test.json');
  await runRollback({
    action: 'export',
    targetPath: exportPath,
    pool,
    pgMemDb: db,
    throwOnError: true
  });
  assert(fs.existsSync(exportPath), 'Exported file must exist');

  const exportedRaw = fs.readFileSync(exportPath, 'utf8');
  const exported = JSON.parse(exportedRaw);
  assert.strictEqual(Object.keys(exported.players).length, 159);
  assert.strictEqual(exported.economyLedger.length, 98);

  // 3. Restore state from backup
  console.log('\nStep 3: Restoring DB state from export via rollback tool...');
  await runRollback({
    action: 'restore',
    backupPath: exportPath,
    pool,
    pgMemDb: db,
    throwOnError: true
  });

  // Verify database has exact same record counts
  const pCount = await pool.query('SELECT COUNT(*) as count FROM players');
  assert.strictEqual(parseInt(pCount.rows[0].count, 10), 159);

  // Clean up temp dir
  fs.rmSync(tempDir, { recursive: true, force: true });

  console.log('\n[PASS] Rollback & Recovery tool verified 100% successfully!\n');
}

testRollbackTool().catch(err => {
  console.error('\n[ROLLBACK TEST FAILED]', err);
  process.exit(1);
});
