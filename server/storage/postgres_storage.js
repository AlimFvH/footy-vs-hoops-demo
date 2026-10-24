// PostgreSQL Storage Adapter for FOOTY vs HOOPS
// Production-grade ACID persistence with atomic transactions, row-level locks, and constraint enforcement.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { StorageAdapter } = require('./storage_adapter');

let pgModule = null;
try {
  pgModule = require('pg');
} catch (e) {
  // pg is optional if run with custom injected pool/client (e.g. pg-mem)
}

class PostgresStorageAdapter extends StorageAdapter {
  constructor(options = {}) {
    super('PostgresStorageAdapter');
    this.connectionString = options.connectionString || process.env.DATABASE_URL || null;
    this.pool = options.pool || null;
    this.ownsPool = !options.pool;
    this.ssl = options.ssl !== undefined ? options.ssl : (process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false);
    this.itemCatalog = options.itemCatalog || {};
    this.bundleCatalog = options.bundleCatalog || {};
    this.schemaPath = options.schemaPath || path.join(__dirname, 'schema.sql');
    this.pgMemDb = options.pgMemDb || null;
    this._initialized = false;
    this._playerLocks = new Map();
  }

  async withPlayerLock(playerId, callback) {
    if (!playerId) return callback();
    const id = String(playerId).trim();
    while (this._playerLocks.has(id)) {
      await this._playerLocks.get(id);
    }
    let resolveLock;
    const lockPromise = new Promise(r => { resolveLock = r; });
    this._playerLocks.set(id, lockPromise);
    try {
      return await callback();
    } finally {
      this._playerLocks.delete(id);
      resolveLock();
    }
  }

  async init() {
    if (this._initialized) return;

    if (!this.pool) {
      if (!this.connectionString) {
        throw new Error('DATABASE_URL or connectionString is required for PostgresStorageAdapter');
      }
      if (!pgModule) {
        pgModule = require('pg');
      }
      const poolConfig = {
        connectionString: this.connectionString,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000
      };
      if (this.ssl) {
        poolConfig.ssl = this.ssl;
      }
      this.pool = new pgModule.Pool(poolConfig);
    }

    // Run schema creation DDL
    await this.applySchema();
    this._initialized = true;
  }

  async close() {
    if (this.pool && this.ownsPool && typeof this.pool.end === 'function') {
      await this.pool.end();
    }
    this._initialized = false;
  }

  async isHealthy() {
    try {
      const res = await this.query('SELECT 1 as alive');
      return Boolean(res && res.rows && res.rows.length > 0);
    } catch (e) {
      return false;
    }
  }

  async query(text, params = []) {
    return this.pool.query(text, params);
  }

  async withTransaction(callback) {
    const client = await this.pool.connect();
    const snapshot = this.pgMemDb && typeof this.pgMemDb.backup === 'function' ? this.pgMemDb.backup() : null;
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      try {
        await client.query('ROLLBACK');
      } catch (rbErr) {
        // Suppress rollback error to preserve root cause
      }
      if (snapshot && typeof snapshot.restore === 'function') {
        try { snapshot.restore(); } catch (resErr) {}
      }
      throw err;
    } finally {
      client.release();
    }
  }

  async applySchema() {
    if (!fs.existsSync(this.schemaPath)) {
      throw new Error(`Schema file not found at ${this.schemaPath}`);
    }
    try {
      const check = await this.query("SELECT 1 FROM information_schema.tables WHERE table_name = 'schema_migrations'");
      if (check.rows.length > 0) {
        return;
      }
    } catch (e) {
      // Table doesn't exist yet, proceed with DDL
    }
    const ddl = fs.readFileSync(this.schemaPath, 'utf8');
    await this.withTransaction(async (client) => {
      await client.query(ddl);
      await client.query(`
        INSERT INTO schema_migrations (version, name, applied_at)
        VALUES (1, 'initial_schema', $1)
        ON CONFLICT (version) DO NOTHING
      `, [Date.now()]);
    });
  }

  createDefaultPlayer(playerId) {
    const now = Date.now();
    return {
      playerId: String(playerId).trim(),
      playerName: null,
      selectedTeam: null,
      selectedCharacter: null,
      teamChosen: false,
      coins: 350,
      xp: 0,
      transactions: [],
      owned: [
        'skin_rookie',
        'std_footy_classic',
        'std_hoops_street',
        'ball_footy_classic',
        'ball_hoops_street',
        'frame_default',
        'trail_default'
      ],
      equipped: {
        skin: 'skin_rookie',
        'skin.footy': 'skin_rookie',
        'skin.hoops': 'skin_solar',
        'ball.footy': 'ball_footy_classic',
        'ball.hoops': 'ball_hoops_street',
        'stadium.footy': 'std_footy_classic',
        'stadium.hoops': 'std_hoops_street',
        trail: 'trail_default',
        frame: 'frame_default'
      },
      boostCharges: {},
      armedBoost: null,
      packs: { free: {}, paid: {} },
      battlePass: {
        claimedFree: [],
        claimedPremium: [],
        isPremium: false,
        premiumUnlockedAt: null
      },
      claimedQuests: [],
      rewardedMatches: [],
      stats: { wins: 0, losses: 0, draws: 0, goals: 0, baskets: 0 },
      telegramUser: null,
      photoUrl: null,
      createdAt: now,
      updatedAt: now
    };
  }

  _rowToPlayer(row) {
    if (!row) return null;
    return {
      playerId: row.player_id,
      playerName: row.player_name,
      selectedTeam: row.selected_team,
      selectedCharacter: row.selected_character,
      teamChosen: Boolean(row.team_chosen),
      coins: Number(row.coins) || 0,
      xp: Number(row.xp) || 0,
      owned: typeof row.owned_items === 'string' ? JSON.parse(row.owned_items) : (row.owned_items || []),
      equipped: typeof row.equipped_items === 'string' ? JSON.parse(row.equipped_items) : (row.equipped_items || {}),
      boostCharges: typeof row.boost_charges === 'string' ? JSON.parse(row.boost_charges) : (row.boost_charges || {}),
      armedBoost: row.armed_boost || null,
      packs: typeof row.packs === 'string' ? JSON.parse(row.packs) : (row.packs || { free: {}, paid: {} }),
      battlePass: typeof row.battle_pass === 'string' ? JSON.parse(row.battle_pass) : (row.battle_pass || {}),
      claimedQuests: typeof row.claimed_quests === 'string' ? JSON.parse(row.claimed_quests) : (row.claimed_quests || []),
      rewardedMatches: typeof row.rewarded_matches === 'string' ? JSON.parse(row.rewarded_matches) : (row.rewarded_matches || []),
      stats: typeof row.stats === 'string' ? JSON.parse(row.stats) : (row.stats || { wins: 0, losses: 0, draws: 0 }),
      telegramUser: typeof row.telegram_user === 'string' ? JSON.parse(row.telegram_user) : (row.telegram_user || null),
      photoUrl: row.photo_url || null,
      createdAt: Number(row.created_at) || Date.now(),
      updatedAt: Number(row.updated_at) || Date.now()
    };
  }

  async getPlayer(playerId) {
    if (!playerId) return null;
    const id = String(playerId).trim();
    const res = await this.query('SELECT * FROM players WHERE player_id = $1', [id]);
    if (res.rows.length > 0) {
      return this._rowToPlayer(res.rows[0]);
    }
    // Create and persist default player
    const def = this.createDefaultPlayer(id);
    await this.savePlayer(def);
    return def;
  }

  async savePlayer(player) {
    if (!player || !player.playerId) throw new Error('Invalid player object');
    const id = String(player.playerId).trim();
    const now = Date.now();
    const q = `
      INSERT INTO players (
        player_id, player_name, selected_team, selected_character, team_chosen,
        coins, xp, owned_items, equipped_items, boost_charges, armed_boost,
        packs, battle_pass, claimed_quests, rewarded_matches, stats,
        telegram_user, photo_url, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      ON CONFLICT (player_id) DO UPDATE SET
        player_name = EXCLUDED.player_name,
        selected_team = EXCLUDED.selected_team,
        selected_character = EXCLUDED.selected_character,
        team_chosen = EXCLUDED.team_chosen,
        coins = EXCLUDED.coins,
        xp = EXCLUDED.xp,
        owned_items = EXCLUDED.owned_items,
        equipped_items = EXCLUDED.equipped_items,
        boost_charges = EXCLUDED.boost_charges,
        armed_boost = EXCLUDED.armed_boost,
        packs = EXCLUDED.packs,
        battle_pass = EXCLUDED.battle_pass,
        claimed_quests = EXCLUDED.claimed_quests,
        rewarded_matches = EXCLUDED.rewarded_matches,
        stats = EXCLUDED.stats,
        telegram_user = EXCLUDED.telegram_user,
        photo_url = EXCLUDED.photo_url,
        updated_at = EXCLUDED.updated_at
      RETURNING *;
    `;
    const params = [
      id,
      player.playerName || null,
      player.selectedTeam || null,
      player.selectedCharacter || null,
      Boolean(player.teamChosen),
      Number(player.coins) || 0,
      Number(player.xp) || 0,
      JSON.stringify(player.owned || []),
      JSON.stringify(player.equipped || {}),
      JSON.stringify(player.boostCharges || {}),
      player.armedBoost || null,
      JSON.stringify(player.packs || { free: {}, paid: {} }),
      JSON.stringify(player.battlePass || {}),
      JSON.stringify(player.claimedQuests || []),
      JSON.stringify(player.rewardedMatches || []),
      JSON.stringify(player.stats || {}),
      player.telegramUser ? JSON.stringify(player.telegramUser) : null,
      player.photoUrl || null,
      Number(player.createdAt) || now,
      Number(player.updatedAt) || now
    ];
    const res = await this.query(q, params);
    return this._rowToPlayer(res.rows[0]);
  }

  async lockTeam(playerId, team, character) {
    const id = String(playerId).trim();
    return this.withPlayerLock(id, async () => {
      return this.withTransaction(async (client) => {
        // Row-level lock on athlete (auto-create if first visit)
        let pRes = await client.query('SELECT selected_team, team_chosen FROM players WHERE player_id = $1 FOR UPDATE', [id]);
        if (pRes.rows.length === 0) {
          const def = this.createDefaultPlayer(id);
          await this.savePlayer(def);
          pRes = await client.query('SELECT selected_team, team_chosen FROM players WHERE player_id = $1 FOR UPDATE', [id]);
        }
        const current = pRes.rows[0];
        if (current.team_chosen && current.selected_team && current.selected_team !== team) {
          return {
            ok: false,
            error: 'team_already_locked',
            message: 'Team selection is permanent and cannot be changed',
            selectedTeam: current.selected_team
          };
        }

        const now = Date.now();
        await client.query(`
          UPDATE players
          SET selected_team = $1, selected_character = $2, team_chosen = true, updated_at = $3
          WHERE player_id = $4
        `, [team, character || team, now, id]);

        return { ok: true, success: true, selectedTeam: team, teamChosen: true };
      });
    });
  }

  async executePurchase(playerId, itemId, options = {}) {
    const id = String(playerId).trim();
    return this.withPlayerLock(id, async () => {
      const key = options.idempotencyKey ? String(options.idempotencyKey).trim() : null;

      return this.withTransaction(async (client) => {
      // Idempotency check inside transaction
      if (key) {
        const idempRes = await client.query('SELECT response FROM idempotency_keys WHERE key = $1', [key]);
        if (idempRes.rows.length > 0) {
          const cached = typeof idempRes.rows[0].response === 'string'
            ? JSON.parse(idempRes.rows[0].response)
            : idempRes.rows[0].response;
          return Object.assign({}, cached, { alreadyProcessed: true });
        }
      }

      // Row-level lock on athlete (auto-create if first visit)
      let pRes = await client.query('SELECT * FROM players WHERE player_id = $1 FOR UPDATE', [id]);
      if (pRes.rows.length === 0) {
        const def = this.createDefaultPlayer(id);
        await this.savePlayer(def);
        pRes = await client.query('SELECT * FROM players WHERE player_id = $1 FOR UPDATE', [id]);
      }
      const player = this._rowToPlayer(pRes.rows[0]);

      const bundles = options.bundleCatalog || this.bundleCatalog;
      const items = options.itemCatalog || this.itemCatalog;

      // Case A: Bundle purchase
      if (bundles[itemId]) {
        const bundle = bundles[itemId];
        const cosmeticItems = (bundle.items || []).filter(it => it.type === 'cosmetic');
        const fullyOwned = cosmeticItems.length > 0 && cosmeticItems.every(it => player.owned.includes(it.id));
        if (fullyOwned) {
          return { ok: false, error: 'bundle_already_owned', message: 'You already own all items in this bundle' };
        }
        if (player.coins < bundle.coinsPrice) {
          return { ok: false, error: 'insufficient_funds', required: bundle.coinsPrice, available: player.coins };
        }

        player.coins -= bundle.coinsPrice;
        let bonusCoins = 0;
        let itemsGranted = [];
        (bundle.items || []).forEach(it => {
          if (it.type === 'cosmetic') {
            if (!player.owned.includes(it.id)) {
              player.owned.push(it.id);
              itemsGranted.push(it.id);
            }
          } else if (it.type === 'coins') {
            bonusCoins += (it.val || 0);
          } else if (it.type === 'pack') {
            const pId = it.packId || 'footy';
            if (!player.packs) player.packs = { free: {}, paid: {} };
            if (!player.packs.paid) player.packs.paid = {};
            player.packs.paid[pId] = (player.packs.paid[pId] || 0) + (it.count || 1);
          }
        });
        player.coins += bonusCoins;
        const now = Date.now();
        player.updatedAt = now;

        const txId = 'tx_' + now + '_' + crypto.randomBytes(4).toString('hex');
        const netDelta = -bundle.coinsPrice + bonusCoins;

        // Atomic database update with condition check (coins >= bundle.coinsPrice)
        const updateRes = await client.query(`
          UPDATE players
          SET coins = coins - CAST($2 AS INTEGER) + CAST($3 AS INTEGER), owned_items = $4, packs = $5, updated_at = $6
          WHERE player_id = $1 AND coins >= CAST($2 AS INTEGER)
          RETURNING coins
        `, [id, bundle.coinsPrice, bonusCoins, JSON.stringify(player.owned), JSON.stringify(player.packs), now]);

        if (updateRes.rows.length === 0) {
          return { ok: false, error: 'insufficient_funds', required: bundle.coinsPrice, available: player.coins };
        }
        const finalCoins = Number(updateRes.rows[0].coins);
        player.coins = finalCoins;

        await client.query(`
          INSERT INTO transactions (id, tx_id, player_id, type, delta_coins, delta_xp, balance_after, reason, item_id, meta, timestamp)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [txId, txId, id, 'purchase', netDelta, 0, finalCoins, 'Purchased bundle: ' + bundle.name, itemId, JSON.stringify({ itemsGranted, bonusCoins }), now]);

        const resp = {
          ok: true,
          success: true,
          txId,
          coins: player.coins,
          xp: player.xp,
          owned: player.owned,
          packs: player.packs,
          itemsGranted
        };

        if (key) {
          await client.query(`
            INSERT INTO idempotency_keys (key, response, created_at)
            VALUES ($1, $2, $3)
            ON CONFLICT (key) DO NOTHING
          `, [key, JSON.stringify(resp), now]);
        }
        return resp;
      }

      // Case B: Single Item purchase
      const catItem = items[itemId];
      if (!catItem) {
        return { ok: false, error: 'item_not_found', message: 'Item does not exist in store catalog' };
      }

      if (catItem.category !== 'packs' && catItem.category !== 'boosts') {
        if (player.owned.includes(itemId)) {
          return { ok: false, error: 'already_owned', message: 'You already own this cosmetic item' };
        }
      }

      if (player.coins < catItem.price) {
        return { ok: false, error: 'insufficient_funds', required: catItem.price, available: player.coins };
      }

      player.coins -= catItem.price;
      if (catItem.category === 'packs') {
        const packKey = catItem.packId || 'footy';
        if (!player.packs) player.packs = { free: {}, paid: {} };
        if (!player.packs.paid) player.packs.paid = {};
        player.packs.paid[packKey] = (player.packs.paid[packKey] || 0) + 1;
      } else if (catItem.category === 'boosts') {
        if (!player.boostCharges) player.boostCharges = {};
        player.boostCharges[itemId] = (player.boostCharges[itemId] || 0) + 1;
      } else {
        player.owned.push(itemId);
      }

      const now = Date.now();
      player.updatedAt = now;
      const txId = 'tx_' + now + '_' + crypto.randomBytes(4).toString('hex');

      // Atomic database update with condition check (coins >= catItem.price)
      const updateRes = await client.query(`
        UPDATE players
        SET coins = coins - CAST($2 AS INTEGER), owned_items = $3, packs = $4, boost_charges = $5, updated_at = $6
        WHERE player_id = $1 AND coins >= CAST($2 AS INTEGER)
        RETURNING coins
      `, [id, catItem.price, JSON.stringify(player.owned), JSON.stringify(player.packs), JSON.stringify(player.boostCharges), now]);

      if (updateRes.rows.length === 0) {
        return { ok: false, error: 'insufficient_funds', required: catItem.price, available: player.coins };
      }
      const finalCoins = Number(updateRes.rows[0].coins);
      player.coins = finalCoins;

      await client.query(`
        INSERT INTO transactions (id, tx_id, player_id, type, delta_coins, delta_xp, balance_after, reason, item_id, meta, timestamp)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [txId, txId, id, 'purchase', -catItem.price, 0, finalCoins, 'Purchased item: ' + catItem.name, itemId, null, now]);

      const resp = {
        ok: true,
        success: true,
        txId,
        coins: player.coins,
        xp: player.xp,
        owned: player.owned,
        packs: player.packs,
        boostCharges: player.boostCharges || {},
        armedBoost: player.armedBoost || null,
        purchasedItem: itemId
      };

      if (key) {
        await client.query(`
          INSERT INTO idempotency_keys (key, response, created_at)
          VALUES ($1, $2, $3)
          ON CONFLICT (key) DO NOTHING
        `, [key, JSON.stringify(resp), now]);
      }
      return resp;
    });
    });
  }

  async executeReward(playerId, rewardType, rewardId, deltaCoins = 0, deltaXp = 0, options = {}) {
    const id = String(playerId).trim();
    return this.withPlayerLock(id, async () => {
      const key = options.idempotencyKey ? String(options.idempotencyKey).trim() : null;

      return this.withTransaction(async (client) => {
      // Idempotency check inside transaction
      if (key) {
        const idempRes = await client.query('SELECT response FROM idempotency_keys WHERE key = $1', [key]);
        if (idempRes.rows.length > 0) {
          const cached = typeof idempRes.rows[0].response === 'string'
            ? JSON.parse(idempRes.rows[0].response)
            : idempRes.rows[0].response;
          return Object.assign({}, cached, { alreadyProcessed: true });
        }
      }

      // Row-level lock on athlete (auto-create if first visit)
      let pRes = await client.query('SELECT * FROM players WHERE player_id = $1 FOR UPDATE', [id]);
      if (pRes.rows.length === 0) {
        const def = this.createDefaultPlayer(id);
        await this.savePlayer(def);
        pRes = await client.query('SELECT * FROM players WHERE player_id = $1 FOR UPDATE', [id]);
      }
      const player = this._rowToPlayer(pRes.rows[0]);

      if (rewardType === 'match') {
        const matchId = String(rewardId || options.matchId);
        if (!matchId) return { ok: false, error: 'missing_match_id' };

        if (player.rewardedMatches.includes(matchId)) {
          return { ok: false, error: 'match_already_rewarded', message: 'Match result already claimed' };
        }

        // Online Match Security & Row-Level Lock on Completed Match
        if (options.onlineMatch || options.matchToken) {
          const token = String(options.matchToken || '');
          const mRes = await client.query('SELECT * FROM completed_matches WHERE match_id = $1 FOR UPDATE', [matchId]);
          if (mRes.rows.length === 0) {
            return { ok: false, error: 'invalid_match_token', message: 'Authoritative server match verification failed' };
          }
          const comp = mRes.rows[0];
          if (comp.match_token !== token) {
            return { ok: false, error: 'invalid_match_token', message: 'Authoritative server match verification failed' };
          }
          const rewarded = typeof comp.rewarded_players === 'string'
            ? JSON.parse(comp.rewarded_players)
            : (comp.rewarded_players || {});
          if (rewarded[id]) {
            return { ok: false, error: 'match_already_rewarded', message: 'Match reward already claimed for this athlete' };
          }
          rewarded[id] = true;
          await client.query(`
            UPDATE completed_matches SET rewarded_players = $1 WHERE match_id = $2
          `, [JSON.stringify(rewarded), matchId]);
        }

        player.coins += Number(deltaCoins) || 0;
        player.xp += Number(deltaXp) || 0;
        player.rewardedMatches.push(matchId);

        const meta = options.meta || {};
        const outcome = meta.outcome || 'win';
        if (!player.stats) player.stats = { wins: 0, losses: 0, draws: 0, goals: 0, baskets: 0 };
        if (outcome === 'win') player.stats.wins = (player.stats.wins || 0) + 1;
        else if (outcome === 'draw') player.stats.draws = (player.stats.draws || 0) + 1;
        else player.stats.losses = (player.stats.losses || 0) + 1;

        if (meta.mode === 'footy') player.stats.goals = (player.stats.goals || 0) + Number(meta.goals || 0);
        else if (meta.mode === 'hoops') player.stats.baskets = (player.stats.baskets || 0) + Number(meta.goals || 0);

        const now = Date.now();
        player.updatedAt = now;
        const txId = 'tx_' + now + '_' + crypto.randomBytes(4).toString('hex');

        await client.query(`
          UPDATE players
          SET coins = $1, xp = $2, rewarded_matches = $3, stats = $4, updated_at = $5
          WHERE player_id = $6
        `, [player.coins, player.xp, JSON.stringify(player.rewardedMatches), JSON.stringify(player.stats), now, id]);

        await client.query(`
          INSERT INTO transactions (id, tx_id, player_id, type, delta_coins, delta_xp, balance_after, reason, item_id, meta, timestamp)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [txId, txId, id, 'reward', deltaCoins, deltaXp, player.coins, 'Match reward: ' + (meta.mode || 'match') + ' (' + outcome + ')', matchId, JSON.stringify(meta), now]);

        const resp = {
          ok: true,
          success: true,
          txId,
          coins: player.coins,
          xp: player.xp,
          coinsEarned: deltaCoins,
          xpEarned: deltaXp,
          outcome
        };

        if (key) {
          await client.query(`
            INSERT INTO idempotency_keys (key, response, created_at)
            VALUES ($1, $2, $3)
            ON CONFLICT (key) DO NOTHING
          `, [key, JSON.stringify(resp), now]);
        }
        return resp;
      }

      if (rewardType === 'quest') {
        const questId = String(rewardId);
        if (player.claimedQuests.includes(questId)) {
          return { ok: false, error: 'quest_already_claimed', message: 'Quest already claimed' };
        }

        player.coins += Number(deltaCoins) || 0;
        player.xp += Number(deltaXp) || 0;
        player.claimedQuests.push(questId);
        const now = Date.now();
        player.updatedAt = now;
        const txId = 'tx_' + now + '_' + crypto.randomBytes(4).toString('hex');

        await client.query(`
          UPDATE players
          SET coins = $1, xp = $2, claimed_quests = $3, updated_at = $4
          WHERE player_id = $5
        `, [player.coins, player.xp, JSON.stringify(player.claimedQuests), now, id]);

        await client.query(`
          INSERT INTO transactions (id, tx_id, player_id, type, delta_coins, delta_xp, balance_after, reason, item_id, meta, timestamp)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [txId, txId, id, 'reward', deltaCoins, deltaXp, player.coins, 'Quest reward: ' + questId, questId, null, now]);

        const resp = {
          ok: true,
          success: true,
          txId,
          coins: player.coins,
          xp: player.xp,
          claimedQuests: player.claimedQuests
        };

        if (key) {
          await client.query(`
            INSERT INTO idempotency_keys (key, response, created_at)
            VALUES ($1, $2, $3)
            ON CONFLICT (key) DO NOTHING
          `, [key, JSON.stringify(resp), now]);
        }
        return resp;
      }

      return { ok: false, error: 'unknown_reward_type' };
    });
    });
  }

  async equipItem(playerId, slot, itemId) {
    const id = String(playerId).trim();
    return this.withTransaction(async (client) => {
      const pRes = await client.query('SELECT * FROM players WHERE player_id = $1 FOR UPDATE', [id]);
      if (pRes.rows.length === 0) return { ok: false, error: 'player_not_found' };
      const player = this._rowToPlayer(pRes.rows[0]);

      if (!player.owned.includes(itemId) && !['skin_rookie', 'ball_footy_classic', 'ball_hoops_street', 'std_footy_classic', 'std_hoops_street', 'frame_default', 'trail_default'].includes(itemId)) {
        return { ok: false, error: 'item_not_owned' };
      }

      if (!player.equipped) player.equipped = {};
      player.equipped[slot] = itemId;
      const now = Date.now();
      await client.query(`
        UPDATE players SET equipped_items = $1, updated_at = $2 WHERE player_id = $3
      `, [JSON.stringify(player.equipped), now, id]);

      return { ok: true, success: true, equipped: player.equipped };
    });
  }

  async getLeaderboard(limit = 100) {
    const res = await this.query(`
      SELECT player_id, player_name, selected_team, selected_character, coins, xp, stats, photo_url
      FROM players
      ORDER BY coins DESC, xp DESC
      LIMIT $1
    `, [limit]);

    return res.rows.map(r => ({
      playerId: r.player_id,
      playerName: r.player_name || 'Athlete',
      selectedTeam: r.selected_team,
      selectedCharacter: r.selected_character,
      coins: Number(r.coins) || 0,
      xp: Number(r.xp) || 0,
      stats: typeof r.stats === 'string' ? JSON.parse(r.stats) : (r.stats || { wins: 0, losses: 0, draws: 0 }),
      photoUrl: r.photo_url || null
    }));
  }

  async getCompletedMatch(matchId) {
    if (!matchId) return null;
    const res = await this.query('SELECT * FROM completed_matches WHERE match_id = $1', [matchId]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      matchId: r.match_id,
      host: typeof r.host === 'string' ? JSON.parse(r.host) : r.host,
      guest: typeof r.guest === 'string' ? JSON.parse(r.guest) : r.guest,
      finalScore: typeof r.final_score === 'string' ? JSON.parse(r.final_score) : r.final_score,
      winner: r.winner,
      phase: r.phase,
      mode: r.mode,
      stats: typeof r.stats === 'string' ? JSON.parse(r.stats) : r.stats,
      completedAt: Number(r.completed_at),
      matchToken: r.match_token,
      rewarded: typeof r.rewarded_players === 'string' ? JSON.parse(r.rewarded_players) : (r.rewarded_players || {})
    };
  }

  async saveCompletedMatch(matchId, matchRecord) {
    const q = `
      INSERT INTO completed_matches (
        match_id, host, guest, final_score, winner, phase, mode, stats, completed_at, match_token, rewarded_players
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (match_id) DO UPDATE SET
        host = EXCLUDED.host,
        guest = EXCLUDED.guest,
        final_score = EXCLUDED.final_score,
        winner = EXCLUDED.winner,
        phase = EXCLUDED.phase,
        mode = EXCLUDED.mode,
        stats = EXCLUDED.stats,
        completed_at = EXCLUDED.completed_at,
        match_token = EXCLUDED.match_token,
        rewarded_players = EXCLUDED.rewarded_players
      RETURNING *;
    `;
    const params = [
      matchId,
      JSON.stringify(matchRecord.host || {}),
      JSON.stringify(matchRecord.guest || {}),
      JSON.stringify(matchRecord.finalScore || [0, 0]),
      matchRecord.winner !== undefined ? matchRecord.winner : null,
      matchRecord.phase || 'regulation',
      matchRecord.mode || 'footy',
      JSON.stringify(matchRecord.stats || {}),
      Number(matchRecord.completedAt) || Date.now(),
      matchRecord.matchToken,
      JSON.stringify(matchRecord.rewarded || {})
    ];
    await this.query(q, params);
    return matchRecord;
  }

  async getIdempotency(key) {
    if (!key) return null;
    const res = await this.query('SELECT response FROM idempotency_keys WHERE key = $1', [key]);
    if (res.rows.length === 0) return null;
    return typeof res.rows[0].response === 'string' ? JSON.parse(res.rows[0].response) : res.rows[0].response;
  }

  async setIdempotency(key, response) {
    if (!key) return;
    await this.query(`
      INSERT INTO idempotency_keys (key, response, created_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (key) DO UPDATE SET response = EXCLUDED.response
    `, [key, JSON.stringify(response), Date.now()]);
  }

  async addLedgerEntry(playerId, type, deltaCoins, deltaXp, balanceAfter, reason, itemId = null, meta = null) {
    const now = Date.now();
    const txId = 'tx_' + now + '_' + crypto.randomBytes(4).toString('hex');
    await this.query(`
      INSERT INTO transactions (id, tx_id, player_id, type, delta_coins, delta_xp, balance_after, reason, item_id, meta, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [txId, txId, playerId, type, deltaCoins, deltaXp, balanceAfter, reason, itemId, meta ? JSON.stringify(meta) : null, now]);

    return {
      id: txId,
      txId,
      playerId,
      type,
      deltaCoins,
      deltaXp,
      balanceAfter,
      reason,
      itemId,
      meta,
      timestamp: now
    };
  }

  async getLedger(playerId = null, limit = 50) {
    let q = 'SELECT * FROM transactions';
    const params = [];
    if (playerId) {
      q += ' WHERE player_id = $1';
      params.push(playerId);
    }
    q += ` ORDER BY timestamp DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const res = await this.query(q, params);
    return res.rows.map(r => ({
      id: r.id,
      txId: r.tx_id,
      playerId: r.player_id,
      type: r.type,
      deltaCoins: Number(r.delta_coins),
      deltaXp: Number(r.delta_xp),
      balanceAfter: Number(r.balance_after),
      reason: r.reason,
      itemId: r.item_id,
      meta: typeof r.meta === 'string' ? JSON.parse(r.meta) : r.meta,
      timestamp: Number(r.timestamp)
    }));
  }

  async getReferral(ownerId) {
    const res = await this.query('SELECT * FROM referrals WHERE owner_id = $1', [ownerId]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      ownerId: r.owner_id,
      referred: typeof r.referred === 'string' ? JSON.parse(r.referred) : r.referred,
      claimedMilestones: typeof r.claimed_milestones === 'string' ? JSON.parse(r.claimed_milestones) : r.claimed_milestones
    };
  }

  async saveReferral(ownerId, referralData) {
    await this.query(`
      INSERT INTO referrals (owner_id, referred, claimed_milestones)
      VALUES ($1, $2, $3)
      ON CONFLICT (owner_id) DO UPDATE SET
        referred = EXCLUDED.referred,
        claimed_milestones = EXCLUDED.claimed_milestones
    `, [ownerId, JSON.stringify(referralData.referred || []), JSON.stringify(referralData.claimedMilestones || [])]);
    return referralData;
  }

  async getStarsInvoice(invoiceId) {
    const res = await this.query('SELECT * FROM stars_invoices WHERE invoice_id = $1', [invoiceId]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      invoiceId: r.invoice_id,
      productId: r.product_id,
      playerId: r.player_id,
      starsAmount: Number(r.stars_amount),
      status: r.status,
      createdAt: Number(r.created_at),
      paidAt: r.paid_at ? Number(r.paid_at) : null,
      chargeId: r.charge_id
    };
  }

  async saveStarsInvoice(invoiceId, inv) {
    await this.query(`
      INSERT INTO stars_invoices (invoice_id, product_id, player_id, stars_amount, status, created_at, paid_at, charge_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (invoice_id) DO UPDATE SET
        status = EXCLUDED.status,
        paid_at = EXCLUDED.paid_at,
        charge_id = EXCLUDED.charge_id
    `, [invoiceId, inv.productId, inv.playerId, inv.starsAmount, inv.status, inv.createdAt, inv.paidAt || null, inv.chargeId || null]);
    return inv;
  }

  async getTonInvoice(txId) {
    const res = await this.query('SELECT * FROM ton_invoices WHERE tx_id = $1', [txId]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      txId: r.tx_id,
      memo: r.memo,
      productId: r.product_id,
      playerId: r.player_id,
      tonAmount: Number(r.ton_amount),
      nanoTon: r.nano_ton,
      status: r.status,
      createdAt: Number(r.created_at),
      paidAt: r.paid_at ? Number(r.paid_at) : null,
      txHash: r.tx_hash
    };
  }

  async saveTonInvoice(txId, inv) {
    await this.query(`
      INSERT INTO ton_invoices (tx_id, memo, product_id, player_id, ton_amount, nano_ton, status, created_at, paid_at, tx_hash)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (tx_id) DO UPDATE SET
        status = EXCLUDED.status,
        paid_at = EXCLUDED.paid_at,
        tx_hash = EXCLUDED.tx_hash
    `, [txId, inv.memo, inv.productId, inv.playerId, inv.tonAmount, inv.nanoTon, inv.status, inv.createdAt, inv.paidAt || null, inv.txHash || null]);
    return inv;
  }

  async isTonHashProcessed(txHash) {
    const res = await this.query('SELECT 1 FROM processed_ton_hashes WHERE tx_hash = $1', [txHash]);
    return res.rows.length > 0;
  }

  async markTonHashProcessed(txHash, txId, playerId) {
    await this.query(`
      INSERT INTO processed_ton_hashes (tx_hash, tx_id, player_id, timestamp)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (tx_hash) DO NOTHING
    `, [txHash, txId, playerId, Date.now()]);
  }

  async recordPayment(paymentRecord) {
    const now = Date.now();
    await this.query(`
      INSERT INTO payments_ledger (id, type, invoice_id, product_id, player_id, amount, currency, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO NOTHING
    `, [paymentRecord.id, paymentRecord.type, paymentRecord.invoiceId, paymentRecord.productId, paymentRecord.playerId, paymentRecord.amount, paymentRecord.currency, now]);
    return Object.assign({}, paymentRecord, { timestamp: now });
  }

  async exportState() {
    const state = {
      players: {},
      economyLedger: [],
      completedMatches: {},
      idempotencyKeys: {},
      referrals: {},
      starsInvoices: {},
      tonInvoices: {},
      processedTonHashes: {},
      paymentsLedger: []
    };

    const pRes = await this.query('SELECT * FROM players');
    pRes.rows.forEach(r => {
      const p = this._rowToPlayer(r);
      state.players[p.playerId] = p;
    });

    const txRes = await this.query('SELECT * FROM transactions ORDER BY timestamp ASC');
    state.economyLedger = txRes.rows.map(r => ({
      id: r.id,
      txId: r.tx_id,
      playerId: r.player_id,
      type: r.type,
      deltaCoins: Number(r.delta_coins),
      deltaXp: Number(r.delta_xp),
      balanceAfter: Number(r.balance_after),
      reason: r.reason,
      itemId: r.item_id,
      meta: typeof r.meta === 'string' ? JSON.parse(r.meta) : r.meta,
      timestamp: Number(r.timestamp)
    }));

    const mRes = await this.query('SELECT * FROM completed_matches');
    mRes.rows.forEach(r => {
      state.completedMatches[r.match_id] = {
        matchId: r.match_id,
        host: typeof r.host === 'string' ? JSON.parse(r.host) : r.host,
        guest: typeof r.guest === 'string' ? JSON.parse(r.guest) : r.guest,
        finalScore: typeof r.final_score === 'string' ? JSON.parse(r.final_score) : r.final_score,
        winner: r.winner,
        phase: r.phase,
        mode: r.mode,
        stats: typeof r.stats === 'string' ? JSON.parse(r.stats) : r.stats,
        completedAt: Number(r.completed_at),
        matchToken: r.match_token,
        rewarded: typeof r.rewarded_players === 'string' ? JSON.parse(r.rewarded_players) : (r.rewarded_players || {})
      };
    });

    const idempRes = await this.query('SELECT * FROM idempotency_keys');
    idempRes.rows.forEach(r => {
      state.idempotencyKeys[r.key] = typeof r.response === 'string' ? JSON.parse(r.response) : r.response;
    });

    const refRes = await this.query('SELECT * FROM referrals');
    refRes.rows.forEach(r => {
      state.referrals[r.owner_id] = {
        ownerId: r.owner_id,
        referred: typeof r.referred === 'string' ? JSON.parse(r.referred) : r.referred,
        claimedMilestones: typeof r.claimed_milestones === 'string' ? JSON.parse(r.claimed_milestones) : r.claimed_milestones
      };
    });

    const sRes = await this.query('SELECT * FROM stars_invoices');
    sRes.rows.forEach(r => {
      state.starsInvoices[r.invoice_id] = {
        invoiceId: r.invoice_id,
        productId: r.product_id,
        playerId: r.player_id,
        starsAmount: Number(r.stars_amount),
        status: r.status,
        createdAt: Number(r.created_at),
        paidAt: r.paid_at ? Number(r.paid_at) : null,
        chargeId: r.charge_id
      };
    });

    const tRes = await this.query('SELECT * FROM ton_invoices');
    tRes.rows.forEach(r => {
      state.tonInvoices[r.tx_id] = {
        txId: r.tx_id,
        memo: r.memo,
        productId: r.product_id,
        playerId: r.player_id,
        tonAmount: Number(r.ton_amount),
        nanoTon: r.nano_ton,
        status: r.status,
        createdAt: Number(r.created_at),
        paidAt: r.paid_at ? Number(r.paid_at) : null,
        txHash: r.tx_hash
      };
    });

    const thRes = await this.query('SELECT * FROM processed_ton_hashes');
    thRes.rows.forEach(r => {
      state.processedTonHashes[r.tx_hash] = {
        txId: r.tx_id,
        playerId: r.player_id,
        timestamp: Number(r.timestamp)
      };
    });

    const payRes = await this.query('SELECT * FROM payments_ledger');
    state.paymentsLedger = payRes.rows.map(r => ({
      id: r.id,
      type: r.type,
      invoiceId: r.invoice_id,
      productId: r.product_id,
      playerId: r.player_id,
      amount: Number(r.amount),
      currency: r.currency,
      timestamp: Number(r.timestamp)
    }));

    return state;
  }

  async importState(stateData) {
    if (!stateData) throw new Error('State data required');
    await this.withTransaction(async (client) => {
      // Import players
      if (stateData.players) {
        for (const p of Object.values(stateData.players)) {
          const now = Date.now();
          await client.query(`
            INSERT INTO players (
              player_id, player_name, selected_team, selected_character, team_chosen,
              coins, xp, owned_items, equipped_items, boost_charges, armed_boost,
              packs, battle_pass, claimed_quests, rewarded_matches, stats,
              telegram_user, photo_url, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
            ON CONFLICT (player_id) DO UPDATE SET
              player_name = EXCLUDED.player_name,
              selected_team = EXCLUDED.selected_team,
              selected_character = EXCLUDED.selected_character,
              team_chosen = EXCLUDED.team_chosen,
              coins = EXCLUDED.coins,
              xp = EXCLUDED.xp,
              owned_items = EXCLUDED.owned_items,
              equipped_items = EXCLUDED.equipped_items,
              boost_charges = EXCLUDED.boost_charges,
              armed_boost = EXCLUDED.armed_boost,
              packs = EXCLUDED.packs,
              battle_pass = EXCLUDED.battle_pass,
              claimed_quests = EXCLUDED.claimed_quests,
              rewarded_matches = EXCLUDED.rewarded_matches,
              stats = EXCLUDED.stats,
              telegram_user = EXCLUDED.telegram_user,
              photo_url = EXCLUDED.photo_url,
              updated_at = EXCLUDED.updated_at
          `, [
            p.playerId,
            p.playerName || null,
            p.selectedTeam || null,
            p.selectedCharacter || null,
            Boolean(p.teamChosen),
            Number(p.coins) || 0,
            Number(p.xp) || 0,
            JSON.stringify(p.owned || []),
            JSON.stringify(p.equipped || {}),
            JSON.stringify(p.boostCharges || {}),
            p.armedBoost || null,
            JSON.stringify(p.packs || { free: {}, paid: {} }),
            JSON.stringify(p.battlePass || {}),
            JSON.stringify(p.claimedQuests || []),
            JSON.stringify(p.rewardedMatches || []),
            JSON.stringify(p.stats || {}),
            p.telegramUser ? JSON.stringify(p.telegramUser) : null,
            p.photoUrl || null,
            Number(p.createdAt) || now,
            Number(p.updatedAt) || now
          ]);
        }
      }

      // Import transactions
      if (Array.isArray(stateData.economyLedger)) {
        for (const tx of stateData.economyLedger) {
          await client.query(`
            INSERT INTO transactions (id, tx_id, player_id, type, delta_coins, delta_xp, balance_after, reason, item_id, meta, timestamp)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (id) DO NOTHING
          `, [
            tx.id || tx.txId,
            tx.txId || tx.id,
            tx.playerId,
            tx.type || 'unknown',
            Number(tx.deltaCoins) || 0,
            Number(tx.deltaXp) || 0,
            Number(tx.balanceAfter) || 0,
            tx.reason || '',
            tx.itemId || null,
            tx.meta ? JSON.stringify(tx.meta) : null,
            Number(tx.timestamp) || Date.now()
          ]);
        }
      }

      // Import completed matches
      if (stateData.completedMatches) {
        for (const [mId, m] of Object.entries(stateData.completedMatches)) {
          await client.query(`
            INSERT INTO completed_matches (
              match_id, host, guest, final_score, winner, phase, mode, stats, completed_at, match_token, rewarded_players
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (match_id) DO NOTHING
          `, [
            mId,
            JSON.stringify(m.host || {}),
            JSON.stringify(m.guest || {}),
            JSON.stringify(m.finalScore || [0, 0]),
            m.winner !== undefined ? m.winner : null,
            m.phase || 'regulation',
            m.mode || 'footy',
            JSON.stringify(m.stats || {}),
            Number(m.completedAt) || Date.now(),
            m.matchToken,
            JSON.stringify(m.rewarded || {})
          ]);
        }
      }

      // Import idempotency keys
      if (stateData.idempotencyKeys) {
        for (const [k, val] of Object.entries(stateData.idempotencyKeys)) {
          await client.query(`
            INSERT INTO idempotency_keys (key, response, created_at)
            VALUES ($1, $2, $3)
            ON CONFLICT (key) DO NOTHING
          `, [k, JSON.stringify(val), Date.now()]);
        }
      }

      // Import referrals
      if (stateData.referrals) {
        for (const [refCode, r] of Object.entries(stateData.referrals)) {
          await client.query(`
            INSERT INTO referrals (owner_id, referred, claimed_milestones)
            VALUES ($1, $2, $3)
            ON CONFLICT (owner_id) DO NOTHING
          `, [refCode, JSON.stringify(r.referred || []), JSON.stringify(r.claimedMilestones || [])]);
        }
      }

      // Import stars invoices
      if (stateData.starsInvoices) {
        for (const [invId, inv] of Object.entries(stateData.starsInvoices)) {
          await client.query(`
            INSERT INTO stars_invoices (invoice_id, product_id, player_id, stars_amount, status, created_at, paid_at, charge_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (invoice_id) DO NOTHING
          `, [invId, inv.productId, inv.playerId, Number(inv.starsAmount) || 0, inv.status, Number(inv.createdAt) || Date.now(), inv.paidAt || null, inv.chargeId || null]);
        }
      }

      // Import ton invoices
      if (stateData.tonInvoices) {
        for (const [txId, inv] of Object.entries(stateData.tonInvoices)) {
          await client.query(`
            INSERT INTO ton_invoices (tx_id, memo, product_id, player_id, ton_amount, nano_ton, status, created_at, paid_at, tx_hash)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (tx_id) DO NOTHING
          `, [txId, inv.memo, inv.productId, inv.playerId, Number(inv.tonAmount) || 0, String(inv.nanoTon || 0), inv.status, Number(inv.createdAt) || Date.now(), inv.paidAt || null, inv.txHash || null]);
        }
      }

      // Import processed ton hashes
      if (stateData.processedTonHashes) {
        for (const [hash, item] of Object.entries(stateData.processedTonHashes)) {
          await client.query(`
            INSERT INTO processed_ton_hashes (tx_hash, tx_id, player_id, timestamp)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (tx_hash) DO NOTHING
          `, [hash, item.txId, item.playerId, Number(item.timestamp) || Date.now()]);
        }
      }

      // Import payments ledger
      if (Array.isArray(stateData.paymentsLedger)) {
        for (const pay of stateData.paymentsLedger) {
          await client.query(`
            INSERT INTO payments_ledger (id, type, invoice_id, product_id, player_id, amount, currency, timestamp)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (id) DO NOTHING
          `, [pay.id, pay.type, pay.invoiceId, pay.productId, pay.playerId, Number(pay.amount) || 0, pay.currency, Number(pay.timestamp) || Date.now()]);
        }
      }
    });
  }
}

module.exports = { PostgresStorageAdapter };
