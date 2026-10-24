// Base Storage Adapter Interface for FOOTY vs HOOPS
// Defines uniform contracts for JSON (local/CI) and PostgreSQL (production).

class StorageAdapter {
  constructor(name = 'BaseStorageAdapter') {
    this.name = name;
  }

  async init() {
    throw new Error(`${this.name}.init() not implemented`);
  }

  async close() {
    throw new Error(`${this.name}.close() not implemented`);
  }

  async isHealthy() {
    throw new Error(`${this.name}.isHealthy() not implemented`);
  }

  async getPlayer(playerId) {
    throw new Error(`${this.name}.getPlayer() not implemented`);
  }

  async savePlayer(player) {
    throw new Error(`${this.name}.savePlayer() not implemented`);
  }

  async lockTeam(playerId, team, character) {
    throw new Error(`${this.name}.lockTeam() not implemented`);
  }

  async executePurchase(playerId, itemId, options = {}) {
    throw new Error(`${this.name}.executePurchase() not implemented`);
  }

  async executeReward(playerId, rewardType, rewardId, deltaCoins, deltaXp, options = {}) {
    throw new Error(`${this.name}.executeReward() not implemented`);
  }

  async equipItem(playerId, slot, itemId) {
    throw new Error(`${this.name}.equipItem() not implemented`);
  }

  async getLeaderboard(limit = 100) {
    throw new Error(`${this.name}.getLeaderboard() not implemented`);
  }

  async getCompletedMatch(matchId) {
    throw new Error(`${this.name}.getCompletedMatch() not implemented`);
  }

  async saveCompletedMatch(matchId, matchRecord) {
    throw new Error(`${this.name}.saveCompletedMatch() not implemented`);
  }

  async getIdempotency(key) {
    throw new Error(`${this.name}.getIdempotency() not implemented`);
  }

  async setIdempotency(key, response) {
    throw new Error(`${this.name}.setIdempotency() not implemented`);
  }

  async addLedgerEntry(playerId, type, deltaCoins, deltaXp, balanceAfter, reason, itemId = null, meta = null) {
    throw new Error(`${this.name}.addLedgerEntry() not implemented`);
  }

  async getLedger(playerId = null, limit = 50) {
    throw new Error(`${this.name}.getLedger() not implemented`);
  }

  async getReferral(ownerId) {
    throw new Error(`${this.name}.getReferral() not implemented`);
  }

  async saveReferral(ownerId, referralData) {
    throw new Error(`${this.name}.saveReferral() not implemented`);
  }

  async getStarsInvoice(invoiceId) {
    throw new Error(`${this.name}.getStarsInvoice() not implemented`);
  }

  async saveStarsInvoice(invoiceId, invoiceData) {
    throw new Error(`${this.name}.saveStarsInvoice() not implemented`);
  }

  async getTonInvoice(txId) {
    throw new Error(`${this.name}.getTonInvoice() not implemented`);
  }

  async saveTonInvoice(txId, invoiceData) {
    throw new Error(`${this.name}.saveTonInvoice() not implemented`);
  }

  async isTonHashProcessed(txHash) {
    throw new Error(`${this.name}.isTonHashProcessed() not implemented`);
  }

  async markTonHashProcessed(txHash, txId, playerId) {
    throw new Error(`${this.name}.markTonHashProcessed() not implemented`);
  }

  async recordPayment(paymentRecord) {
    throw new Error(`${this.name}.recordPayment() not implemented`);
  }

  async exportState() {
    throw new Error(`${this.name}.exportState() not implemented`);
  }

  async importState(stateData) {
    throw new Error(`${this.name}.importState() not implemented`);
  }
}

module.exports = { StorageAdapter };
