// Storage Factory for FOOTY vs HOOPS
// Seamless runtime switching between JSON (local/CI) and PostgreSQL (production).

const path = require('path');
const { StorageAdapter } = require('./storage_adapter');
const { JsonStorageAdapter } = require('./json_storage');
const { PostgresStorageAdapter } = require('./postgres_storage');

function createStorageAdapter(options = {}) {
  const isStaging = process.env.NODE_ENV === 'staging' || Boolean(process.env.STAGING_DATABASE_URL);
  const requestedEngine = (process.env.STORAGE_ENGINE || '').toLowerCase().trim();
  const dbUrl = options.connectionString ||
                options.databaseUrl ||
                process.env.STAGING_DATABASE_URL ||
                process.env.DATABASE_URL ||
                null;

  const shouldUsePostgres = Boolean(
    options.forcePostgres ||
    options.pool ||
    requestedEngine === 'postgres' ||
    process.env.STAGING_DATABASE_URL ||
    (dbUrl && requestedEngine !== 'json')
  );

  if (shouldUsePostgres) {
    if (!dbUrl && !options.pool) {
      throw new Error(
        '[STORAGE CONFIG ERROR] PostgreSQL was explicitly requested via STORAGE_ENGINE=postgres or STAGING_DATABASE_URL, ' +
        'but no connection URL was provided. Refusing silent fallback to JSON storage.'
      );
    }

    return new PostgresStorageAdapter({
      connectionString: dbUrl,
      pool: options.pool,
      itemCatalog: options.itemCatalog,
      bundleCatalog: options.bundleCatalog,
      schemaPath: options.schemaPath || path.join(__dirname, 'schema.sql'),
      ssl: options.ssl,
      pgMemDb: options.pgMemDb
    });
  }

  // Default: JSON File Storage for local development and offline CI
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
