// JSON File Storage Adapter for FOOTY vs HOOPS
// Preserves local development and offline CI testing without external databases.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { StorageAdapter } = require('./storage_adapter');

class JsonStorageAdapter extends StorageAdapter {
  constructor(options = {}) {
    super('JsonStorageAdapter');
    this.dataFilePath = options.dataFilePath || path.join(__dirname, '..', 'data.json');
    this.itemCatalog = options.itemCatalog || {};
    this.bundleCatalog = options.bundleCatalog || {};
    this.questRewards = options.questRewards || {};
    this.state = {
      referrals: {},
      starsInvoices: {},
      tonInvoices: {},
      processedTonHashes: {},
      processedChargeIds: {},
      paymentsLedger: [],
      players: {},
      economyLedger: [],
      idempotencyKeys: {},
      completedMatches: {}
    };
    this._initialized = false;
  }

  createDefaultPlayer(playerId) {
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
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  async init() {
    if (this._initialized) return;
    if (fs.existsSync(this.dataFilePath)) {
      try {
        const raw = fs.readFileSync(this.dataFilePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed.referrals) this.state.referrals = parsed.referrals;
        if (parsed.starsInvoices) this.state.starsInvoices = parsed.starsInvoices;
        if (parsed.tonInvoices) this.state.tonInvoices = parsed.tonInvoices;
        if (parsed.processedTonHashes) this.state.processedTonHashes = parsed.processedTonHashes;
        if (parsed.processedChargeIds) this.state.processedChargeIds = parsed.processedChargeIds;
        if (parsed.paymentsLedger) this.state.paymentsLedger = parsed.paymentsLedger;
        if (parsed.players) this.state.players = parsed.players;
        if (parsed.economyLedger) this.state.economyLedger = parsed.economyLedger;
        if (parsed.idempotencyKeys) this.state.idempotencyKeys = parsed.idempotencyKeys;
        if (parsed.completedMatches) this.state.completedMatches = parsed.completedMatches;
      } catch (e) {
        console.warn(`[JsonStorageAdapter] Failed to parse ${this.dataFilePath}:`, e.message);
      }
    }
    this._initialized = true;
  }

  async close() {
    await this.persist();
  }

  async isHealthy() {
    return true;
  }

  async persist() {
    try {
      const dir = path.dirname(this.dataFilePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.dataFilePath, JSON.stringify(this.state, null, 2), 'utf8');
    } catch (e) {
      console.warn(`[JsonStorageAdapter] Failed to persist data:`, e.message);
    }
  }

  async getPlayer(playerId) {
    if (!playerId) return null;
    const id = String(playerId).trim();
    if (!this.state.players[id]) {
      this.state.players[id] = this.createDefaultPlayer(id);
      await this.persist();
    }
    return JSON.parse(JSON.stringify(this.state.players[id]));
  }

  async savePlayer(player) {
    if (!player || !player.playerId) throw new Error('Invalid player object');
    const id = String(player.playerId).trim();
    player.updatedAt = Date.now();
    this.state.players[id] = JSON.parse(JSON.stringify(player));
    await this.persist();
    return this.state.players[id];
  }

  async lockTeam(playerId, team, character) {
    const id = String(playerId).trim();
    const p = await this.getPlayer(id);
    if (!p) return { ok: false, error: 'player_not_found' };

    if (p.teamChosen && p.selectedTeam && p.selectedTeam !== team) {
      return {
        ok: false,
        error: 'team_already_locked',
        message: 'Team selection is permanent and cannot be changed',
        selectedTeam: p.selectedTeam
      };
    }

    p.selectedTeam = team;
    p.selectedCharacter = character || team;
    p.teamChosen = true;
    p.updatedAt = Date.now();
    await this.savePlayer(p);
    return { ok: true, success: true, selectedTeam: p.selectedTeam, teamChosen: true };
  }

  async executePurchase(playerId, itemId, options = {}) {
    const id = String(playerId).trim();
    const key = options.idempotencyKey ? String(options.idempotencyKey).trim() : null;

    if (key && this.state.idempotencyKeys[key]) {
      return Object.assign({}, this.state.idempotencyKeys[key], { alreadyProcessed: true });
    }

    const player = await this.getPlayer(id);
    if (!player) return { ok: false, error: 'player_not_found' };

    const bundles = options.bundleCatalog || this.bundleCatalog;
    const items = options.itemCatalog || this.itemCatalog;

    // Check bundle
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
      player.updatedAt = Date.now();

      const ledger = await this.addLedgerEntry(
        player.playerId,
        'purchase',
        -bundle.coinsPrice + bonusCoins,
        0,
        player.coins,
        'Purchased bundle: ' + bundle.name,
        itemId,
        { itemsGranted, bonusCoins }
      );

      await this.savePlayer(player);

      const resp = {
        ok: true,
        success: true,
        txId: ledger.txId,
        coins: player.coins,
        xp: player.xp,
        owned: player.owned,
        packs: player.packs,
        itemsGranted
      };

      if (key) {
        this.state.idempotencyKeys[key] = resp;
        await this.persist();
      }
      return resp;
    }

    // Check single item
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
    player.updatedAt = Date.now();

    const ledger = await this.addLedgerEntry(
      player.playerId,
      'purchase',
      -catItem.price,
      0,
      player.coins,
      'Purchased item: ' + catItem.name,
      itemId
    );

    await this.savePlayer(player);

    const resp = {
      ok: true,
      success: true,
      txId: ledger.txId,
      coins: player.coins,
      xp: player.xp,
      owned: player.owned,
      packs: player.packs,
      boostCharges: player.boostCharges || {},
      armedBoost: player.armedBoost || null,
      purchasedItem: itemId
    };

    if (key) {
      this.state.idempotencyKeys[key] = resp;
      await this.persist();
    }
    return resp;
  }

  async executeReward(playerId, rewardType, rewardId, deltaCoins = 0, deltaXp = 0, options = {}) {
    const id = String(playerId).trim();
    const key = options.idempotencyKey ? String(options.idempotencyKey).trim() : null;

    if (key && this.state.idempotencyKeys[key]) {
      return Object.assign({}, this.state.idempotencyKeys[key], { alreadyProcessed: true });
    }

    const player = await this.getPlayer(id);
    if (!player) return { ok: false, error: 'player_not_found' };

    // Match claim verification
    if (rewardType === 'match') {
      const matchId = String(rewardId || options.matchId);
      if (!matchId) return { ok: false, error: 'missing_match_id' };

      if (player.rewardedMatches.includes(matchId)) {
        return { ok: false, error: 'match_already_rewarded', message: 'Match result already claimed' };
      }

      if (options.onlineMatch || options.matchToken) {
        const token = String(options.matchToken || '');
        const comp = this.state.completedMatches[matchId];
        if (!comp || comp.matchToken !== token) {
          return { ok: false, error: 'invalid_match_token', message: 'Authoritative server match verification failed' };
        }
        if (comp.rewarded && comp.rewarded[id]) {
          return { ok: false, error: 'match_already_rewarded', message: 'Match reward already claimed for this athlete' };
        }
        if (!comp.rewarded) comp.rewarded = {};
        comp.rewarded[id] = true;
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

      player.updatedAt = Date.now();

      const ledger = await this.addLedgerEntry(
        player.playerId,
        'reward',
        deltaCoins,
        deltaXp,
        player.coins,
        'Match reward: ' + (meta.mode || 'match') + ' (' + outcome + ')',
        matchId,
        meta
      );

      await this.savePlayer(player);

      const resp = {
        ok: true,
        success: true,
        txId: ledger.txId,
        coins: player.coins,
        xp: player.xp,
        coinsEarned: deltaCoins,
        xpEarned: deltaXp,
        outcome
      };

      if (key) {
        this.state.idempotencyKeys[key] = resp;
        await this.persist();
      }
      return resp;
    }

    // Quest claim
    if (rewardType === 'quest') {
      const questId = String(rewardId);
      if (player.claimedQuests.includes(questId)) {
        return { ok: false, error: 'quest_already_claimed', message: 'Quest already claimed' };
      }
      player.coins += Number(deltaCoins) || 0;
      player.xp += Number(deltaXp) || 0;
      player.claimedQuests.push(questId);
      player.updatedAt = Date.now();

      const ledger = await this.addLedgerEntry(
        player.playerId,
        'reward',
        deltaCoins,
        deltaXp,
        player.coins,
        'Quest reward: ' + questId,
        questId
      );

      await this.savePlayer(player);

      const resp = {
        ok: true,
        success: true,
        txId: ledger.txId,
        coins: player.coins,
        xp: player.xp,
        claimedQuests: player.claimedQuests
      };

      if (key) {
        this.state.idempotencyKeys[key] = resp;
        await this.persist();
      }
      return resp;
    }

    return { ok: false, error: 'unknown_reward_type' };
  }

  async equipItem(playerId, slot, itemId) {
    const id = String(playerId).trim();
    const player = await this.getPlayer(id);
    if (!player) return { ok: false, error: 'player_not_found' };

    if (!player.owned.includes(itemId) && !['skin_rookie', 'ball_footy_classic', 'ball_hoops_street', 'std_footy_classic', 'std_hoops_street', 'frame_default', 'trail_default'].includes(itemId)) {
      return { ok: false, error: 'item_not_owned' };
    }

    if (!player.equipped) player.equipped = {};
    player.equipped[slot] = itemId;
    player.updatedAt = Date.now();
    await this.savePlayer(player);
    return { ok: true, success: true, equipped: player.equipped };
  }

  async getLeaderboard(limit = 100) {
    const list = Object.values(this.state.players).map(p => ({
      playerId: p.playerId,
      playerName: p.playerName || 'Athlete',
      selectedTeam: p.selectedTeam,
      selectedCharacter: p.selectedCharacter,
      coins: p.coins || 0,
      xp: p.xp || 0,
      stats: p.stats || { wins: 0, losses: 0, draws: 0 },
      photoUrl: p.photoUrl || null
    }));
    list.sort((a, b) => (b.coins - a.coins) || (b.xp - a.xp));
    return list.slice(0, limit);
  }

  async getCompletedMatch(matchId) {
    if (!matchId) return null;
    return this.state.completedMatches[matchId] || null;
  }

  async saveCompletedMatch(matchId, matchRecord) {
    if (!matchId || !matchRecord) throw new Error('Invalid match record');
    this.state.completedMatches[matchId] = JSON.parse(JSON.stringify(matchRecord));
    await this.persist();
    return this.state.completedMatches[matchId];
  }

  async getIdempotency(key) {
    if (!key) return null;
    return this.state.idempotencyKeys[key] || null;
  }

  async setIdempotency(key, response) {
    if (!key) return;
    this.state.idempotencyKeys[key] = JSON.parse(JSON.stringify(response));
    await this.persist();
  }

  async addLedgerEntry(playerId, type, deltaCoins, deltaXp, balanceAfter, reason, itemId = null, meta = null) {
    const txId = 'tx_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
    const entry = {
      id: txId,
      txId,
      playerId,
      type,
      deltaCoins: Number(deltaCoins) || 0,
      deltaXp: Number(deltaXp) || 0,
      balanceAfter: Number(balanceAfter) || 0,
      reason: String(reason || ''),
      itemId: itemId || null,
      meta: meta || null,
      timestamp: Date.now()
    };
    this.state.economyLedger.push(entry);

    if (this.state.players && this.state.players[playerId]) {
      if (!this.state.players[playerId].transactions) this.state.players[playerId].transactions = [];
      this.state.players[playerId].transactions.push(entry);
      if (this.state.players[playerId].transactions.length > 50) {
        this.state.players[playerId].transactions = this.state.players[playerId].transactions.slice(-50);
      }
    }
    await this.persist();
    return entry;
  }

  async getLedger(playerId = null, limit = 50) {
    let list = this.state.economyLedger;
    if (playerId) {
      list = list.filter(e => e.playerId === playerId);
    }
    return list.slice(-limit).reverse();
  }

  async getReferral(ownerId) {
    return this.state.referrals[ownerId] || null;
  }

  async saveReferral(ownerId, referralData) {
    this.state.referrals[ownerId] = JSON.parse(JSON.stringify(referralData));
    await this.persist();
    return this.state.referrals[ownerId];
  }

  async getStarsInvoice(invoiceId) {
    return this.state.starsInvoices[invoiceId] || null;
  }

  async saveStarsInvoice(invoiceId, invoiceData) {
    this.state.starsInvoices[invoiceId] = JSON.parse(JSON.stringify(invoiceData));
    await this.persist();
    return this.state.starsInvoices[invoiceId];
  }

  async getTonInvoice(txId) {
    return this.state.tonInvoices[txId] || null;
  }

  async saveTonInvoice(txId, invoiceData) {
    this.state.tonInvoices[txId] = JSON.parse(JSON.stringify(invoiceData));
    await this.persist();
    return this.state.tonInvoices[txId];
  }

  async isTonHashProcessed(txHash) {
    return Boolean(this.state.processedTonHashes[txHash]);
  }

  async markTonHashProcessed(txHash, txId, playerId) {
    this.state.processedTonHashes[txHash] = { txId, playerId, timestamp: Date.now() };
    await this.persist();
  }

  async recordPayment(paymentRecord) {
    const rec = Object.assign({}, paymentRecord, { timestamp: Date.now() });
    this.state.paymentsLedger.push(rec);
    await this.persist();
    return rec;
  }

  async exportState() {
    return JSON.parse(JSON.stringify(this.state));
  }

  async importState(stateData) {
    if (!stateData) throw new Error('State data required');
    this.state = JSON.parse(JSON.stringify(stateData));
    await this.persist();
  }
}

module.exports = { JsonStorageAdapter };
