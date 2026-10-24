// FOOTY vs HOOPS - Real Data Migration Pipeline Test
// Tests the full migration workflow on actual server/data.json against PostgreSQL engine.

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { newDb } = require('pg-mem');
const { runMigration } = require('../scripts/migrate_to_postgres');

async function testMigrationPipeline() {
  console.log('=== FOOTY vs HOOPS: Migration Pipeline Automated Test ===\n');

  const db = newDb();
  const pg = db.adapters.createPg();
  const pool = new pg.Pool();

  const tempBackupDir = path.join(__dirname, 'temp_backups');
  if (!fs.existsSync(tempBackupDir)) fs.mkdirSync(tempBackupDir, { recursive: true });

  const realDataFile = path.join(__dirname, '..', 'server', 'data.json');
  assert(fs.existsSync(realDataFile), 'server/data.json must exist');

  await runMigration({
    sourceFile: realDataFile,
    backupDir: tempBackupDir,
    pool: pool,
    pgMemDb: db,
    throwOnError: true
  });

  // Clean up temp backups
  fs.rmSync(tempBackupDir, { recursive: true, force: true });

  console.log('\n[PASS] Migration Pipeline executed and verified successfully on authentic server/data.json!\n');
}

testMigrationPipeline().catch(err => {
  console.error('\n[MIGRATION TEST FAILED]', err);
  process.exit(1);
});
