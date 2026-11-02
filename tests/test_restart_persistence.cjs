// FOOTY vs HOOPS - Server Restart & Database Persistence Verification Suite
// Verifies that player progress, inventory, purchases, and ledger records persist
// across complete server restarts using PostgresStorageAdapter.

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { newDb } = require('pg-mem');
const { PostgresStorageAdapter } = require('../server/storage/postgres_storage');

const mockItemCatalog = {
  'jersey_fire': { id: 'jersey_fire', name: 'Fire Jersey', category: 'jerseys', slot: 'jersey', price: 100 },
  'ball_hyper': { id: 'ball_hyper', name: 'Hyper Ball', category: 'balls', slot: 'ball', price: 150 }
};

const mockBundleCatalog = {};

async function runPersistenceTest() {
  console.log('=== FOOTY vs HOOPS: Server Restart Persistence Verification Suite ===\n');

  // 1. Initialize persistent PostgreSQL database instance
  console.log('[Step 1/4] Provisioning PostgreSQL database instance...');
  const db = newDb();
  const pg = db.adapters.createPg();
  const pool = new pg.Pool();

  const adapter1 = new PostgresStorageAdapter({
    pool,
    pgMemDb: db,
    itemCatalog: mockItemCatalog,
    bundleCatalog: mockBundleCatalog
  });
  await adapter1.init();
  console.log('  ✓ PostgreSQL schema initialized and ready.');

  // 2. Simulate Server Session 1: Player registration, team lock, coins, purchase, and match reward
  console.log('[Step 2/4] Simulating Active Server Session 1...');
  const playerId = 'athlete_restart_test_99';
  const testPlayer = {
    playerId,
    playerName: 'ChampionshipStriker',
    selectedTeam: 'footy',
    selectedCharacter: 'footy',
    teamChosen: true,
    coins: 350,
    xp: 120,
    owned: ['jersey_default', 'jersey_fire'],
    equipped: { jersey: 'jersey_fire', ball: 'ball_classic' },
    boostCharges: {},
    armedBoost: null,
    packs: { free: {}, paid: {} },
    battlePass: {},
    claimedQuests: ['quest_first_kick'],
    rewardedMatches: ['match_alpha_01'],
    stats: { matchesPlayed: 5, wins: 4, goals: 12 },
    telegramUser: { id: 998877, username: 'striker99' },
    photoUrl: null
  };

  const initialTx = {
    id: 'tx_init_01',
    txId: 'tx_init_01',
    playerId,
    type: 'purchase',
    deltaCoins: -100,
    deltaXp: 0,
    balanceAfter: 350,
    reason: 'Shop Purchase: Fire Jersey',
    itemId: 'jersey_fire',
    meta: { category: 'jerseys' },
    timestamp: Date.now() - 5000
  };

  const completedMatch = {
    matchId: 'match_alpha_01',
    host: { playerId, score: 3 },
    guest: { playerId: 'cpu_ai', score: 1 },
    finalScore: { host: 3, guest: 1 },
    winner: 'host',
    phase: 'results',
    mode: 'footy',
    stats: { goals: 3 },
    completedAt: Date.now() - 4000,
    matchToken: 'tok_match_99',
    rewarded: { [playerId]: true }
  };

  // Import / commit state into PostgreSQL in Session 1
  await adapter1.importState({
    players: { [playerId]: testPlayer },
    economyLedger: [initialTx],
    completedMatches: { 'match_alpha_01': completedMatch },
    idempotencyKeys: { 'idemp_key_99': { ok: true, txId: 'tx_init_01' } },
    referrals: {},
    starsInvoices: {},
    tonInvoices: {},
    processedTonHashes: {},
    paymentsLedger: []
  });
  console.log('  ✓ Session 1 data committed: athlete registered, team locked, item purchased, match recorded.');

  // Verify Session 1 stored state
  const s1Player = await adapter1.getPlayer(playerId);
  assert.strictEqual(s1Player.playerId, playerId);
  assert.strictEqual(s1Player.coins, 350);
  assert.strictEqual(s1Player.selectedTeam, 'footy');
  assert.strictEqual(s1Player.equipped.jersey, 'jersey_fire');

  // 3. Simulate Server Crash / Hard Restart
  console.log('[Step 3/4] Simulating Server Hard Crash & Restart (Ephemeral Disk Wipe)...');
  await adapter1.close();
  // Simulate complete loss of in-memory server state:
  // No local JSON files or heap objects survive.
  console.log('  ✓ Server process terminated. Memory & ephemeral cache wiped.');

  // 4. Simulate Server Session 2: Fresh process boots, connects to PostgreSQL and hydrates state
  console.log('[Step 4/4] Starting Clean Server Process (Session 2) & Restoring from PostgreSQL...');
  const adapter2 = new PostgresStorageAdapter({
    pool,
    pgMemDb: db,
    itemCatalog: mockItemCatalog,
    bundleCatalog: mockBundleCatalog
  });
  await adapter2.init();

  const restoredState = await adapter2.exportState();
  assert.ok(restoredState.players[playerId], 'Player must exist in restored state');
  const restoredPlayer = restoredState.players[playerId];

  // Detailed Assertions for Persistence
  console.log('  Checking restored athlete credentials and progress:');
  assert.strictEqual(restoredPlayer.playerId, playerId, 'Player ID must match');
  console.log('   ✓ Player ID verified:', restoredPlayer.playerId);

  assert.strictEqual(restoredPlayer.playerName, 'ChampionshipStriker', 'Player name must persist');
  console.log('   ✓ Player Name verified:', restoredPlayer.playerName);

  assert.strictEqual(restoredPlayer.selectedTeam, 'footy', 'Selected team must persist');
  assert.strictEqual(restoredPlayer.teamChosen, true, 'Team lock must persist');
  console.log('   ✓ Permanent Team Lock verified:', restoredPlayer.selectedTeam);

  assert.strictEqual(restoredPlayer.coins, 350, 'Coin balance must persist exactly');
  assert.strictEqual(restoredPlayer.xp, 120, 'XP balance must persist exactly');
  console.log(`   ✓ Currency & Progression verified: ${restoredPlayer.coins} Coins, ${restoredPlayer.xp} XP`);

  assert.ok(restoredPlayer.owned.includes('jersey_fire'), 'Purchased item must persist in inventory');
  console.log('   ✓ Inventory verified: contains jersey_fire');

  assert.strictEqual(restoredPlayer.equipped.jersey, 'jersey_fire', 'Equipped items must persist');
  console.log('   ✓ Equipped Cosmetics verified: jersey = jersey_fire');

  assert.ok(restoredPlayer.claimedQuests.includes('quest_first_kick'), 'Claimed quests must persist');
  console.log('   ✓ Quest Progress verified: quest_first_kick claimed');

  assert.strictEqual(restoredState.economyLedger.length, 1, 'Economy ledger must persist');
  assert.strictEqual(restoredState.economyLedger[0].txId, 'tx_init_01', 'Transaction ID must match');
  console.log('   ✓ Financial Audit Ledger verified: tx_init_01 intact');

  assert.ok(restoredState.completedMatches['match_alpha_01'], 'Completed match record must persist');
  console.log('   ✓ Match History verified: match_alpha_01 intact');

  await adapter2.close();

  console.log('\n======================================================');
  console.log('RESTART PERSISTENCE VERIFIED SUCCESSFULLY (100% PASS)!');
  console.log('======================================================\n');
}

runPersistenceTest().catch(err => {
  console.error('\n[FAIL] Persistence verification failed:', err);
  process.exit(1);
});
