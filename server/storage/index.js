// Storage Factory for FOOTY vs HOOPS
// Seamless runtime switching between JSON (local/CI) and PostgreSQL (production).

const path = require('path');
const { StorageAdapter } = require('./storage_adapter');
const { JsonStorageAdapter } = require('./json_storage');
const { PostgresStorageAdapter } = require('./postgres_storage');

function createStorageAdapter(options = {}) {
  const dbUrl = options.connectionString || options.databaseUrl || process.env.DATABASE_URL;

  if (dbUrl || options.forcePostgres || options.pool) {
    return new PostgresStorageAdapter({
      connectionString: dbUrl,
      pool: options.pool,
      itemCatalog: options.itemCatalog,
      bundleCatalog: options.bundleCatalog,
      schemaPath: options.schemaPath || path.join(__dirname, 'schema.sql'),
      ssl: options.ssl
    });
  }

  return new JsonStorageAdapter({
    dataFilePath: options.dataFilePath || process.env.DATA_FILE || path.join(__dirname, '..', 'data.json'),
    itemCatalog: options.itemCatalog,
    bundleCatalog: options.bundleCatalog,
    questRewards: options.questRewards
  });
}

module.exports = {
  createStorageAdapter,
  StorageAdapter,
  JsonStorageAdapter,
  PostgresStorageAdapter
};
