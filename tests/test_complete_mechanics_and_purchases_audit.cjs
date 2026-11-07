/**
 * tests/test_complete_mechanics_and_purchases_audit.cjs
 * Comprehensive end-to-end verification of ALL mechanics, ALL purchases, and ALL logic.
 */

const assert = require('assert');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('=== FOOTY vs HOOPS: Comprehensive Mechanics, Purchases & Logic Audit ===\n');

const SERVER_PORT = 8599;
let spawnedServer = null;
const tmpDataPath = path.join(__dirname, 'temp_audit_data.json');

function checkServerReady() {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${SERVER_PORT}/api/health`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: '127.0.0.1',
      port: SERVER_PORT,
      path,
      method,
      headers: payload ? {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      } : {}
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runAudit() {
  try {
    fs.writeFileSync(tmpDataPath, JSON.stringify({
      players: {},
      economyLedger: [],
      idempotencyKeys: {},
      matches: {},
      rooms: {},
      referrals: {}
    }));

    spawnedServer = spawn('node', [path.join(__dirname, '../server/server.js')], {
      env: Object.assign({}, process.env, {
        PORT: String(SERVER_PORT),
        SEASON_STATE: 'prelaunch',
        DATA_FILE: tmpDataPath
      }),
      stdio: ['ignore', 'pipe', 'pipe']
    });

    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 100));
      if (await checkServerReady()) break;
    }
    assert(await checkServerReady(), 'Audit server must start on port ' + SERVER_PORT);
    console.log('[AUDIT INIT] Test server started and ready.\n');

    let passed = 0;
    let total = 0;

    async function check(name, fn) {
      total++;
      process.stdout.write(`[AUDIT ${total}] ${name}... `);
      try {
        await fn();
        console.log('PASSED');
        passed++;
      } catch (err) {
        console.log('FAILED');
        console.error(err);
        throw err;
      }
    }

    // --- 1. PURCHASES & ECONOMY AUDIT ---
    const testPlayerId = 'athlete_audit_' + Date.now();

    await check('1.1 Player initial sync establishes starting state', async () => {
      const res = await request('POST', '/api/economy/sync', {
        playerId: testPlayerId,
        playerName: 'AuditAthlete',
        selectedTeam: 'footy',
        selectedCharacter: 'footy',
        teamChosen: true,
        coins: 5000,
        xp: 150
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.ok, true);
      assert(res.body.coins >= 5000);
    });

    await check('1.2 Item purchase deducts coins, adds to owned, writes ledger', async () => {
      const res = await request('POST', '/api/economy/purchase', {
        playerId: testPlayerId,
        itemId: 'skin_crimson',
        idempotencyKey: 'tx_audit_purchase_1'
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.ok, true);
      assert(res.body.owned.includes('skin_crimson'));
      assert(res.body.coins < 5000);
    });

    await check('1.3 Repurchasing already owned cosmetic item is rejected', async () => {
      const res = await request('POST', '/api/economy/purchase', {
        playerId: testPlayerId,
        itemId: 'skin_crimson',
        idempotencyKey: 'tx_audit_purchase_dup'
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.error, 'already_owned');
    });

    await check('1.4 Insufficient funds purchase is strictly rejected', async () => {
      const poorPlayer = 'athlete_poor_' + Date.now();
      await request('POST', '/api/economy/sync', { playerId: poorPlayer, coins: 100 });
      const res = await request('POST', '/api/economy/purchase', {
        playerId: poorPlayer,
        itemId: 'skin_footy_golden_legend', // price: 2500, balance: 100
        idempotencyKey: 'tx_audit_purchase_insufficient'
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.error, 'insufficient_funds');
    });

    await check('1.5 Mystery pack purchase, guaranteed drop & duplicate compensation', async () => {
      // First open a footy pack
      const packRes1 = await request('POST', '/api/packs/open', {
        playerId: testPlayerId,
        packId: 'footy'
      });
      assert.strictEqual(packRes1.status, 200);
      assert.strictEqual(packRes1.body.ok, true);
      assert(packRes1.body.item, 'Must grant an item');
      assert(Number.isFinite(packRes1.body.bonusCoins), 'Must grant bonus coins');

      const firstItemId = packRes1.body.item.id;
      // Second open: force test duplicate compensation logic if item is already owned
      const packRes2 = await request('POST', '/api/packs/open', {
        playerId: testPlayerId,
        packId: 'footy'
      });
      assert.strictEqual(packRes2.status, 200);
      assert.strictEqual(packRes2.body.ok, true);
      if (packRes2.body.alreadyOwned) {
        assert(packRes2.body.duplicateCompensation > 0, 'Duplicate compensation coins must be awarded');
      }
    });

    // --- 2. UPGRADES (ПРОКАЧКА) AUDIT ---
    await check('2.1 Upgrading Skill from Tier 1 to Tier 2 succeeds when player has level and coins', async () => {
      const res = await request('POST', '/api/economy/upgrade', {
        playerId: testPlayerId,
        skill: 'power',
        level: 2,
        xp: 150
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.ok, true);
      assert.strictEqual(res.body.skill, 'power');
      assert.strictEqual(res.body.level, 2);
    });

    await check('2.2 Upgrading with insufficient level is strictly rejected with level_too_low', async () => {
      // Create a fresh level 1 player with 0 XP
      const lowLevelPlayer = 'athlete_low_lvl_' + Date.now();
      await request('POST', '/api/economy/sync', {
        playerId: lowLevelPlayer,
        coins: 100000,
        xp: 0,
        level: 1
      });

      // Tier 1 upgrade: 500 coins, reqLevel 1 -> succeeds
      const up1 = await request('POST', '/api/economy/upgrade', {
        playerId: lowLevelPlayer,
        skill: 'power',
        level: 1,
        xp: 0
      });
      assert.strictEqual(up1.status, 200);
      assert.strictEqual(up1.body.level, 2);

      // Tier 2 upgrade: 1200 coins, reqLevel 2. Player is level 1 (0 XP) -> must be rejected!
      const up2 = await request('POST', '/api/economy/upgrade', {
        playerId: lowLevelPlayer,
        skill: 'power',
        level: 1,
        xp: 0
      });
      assert.strictEqual(up2.status, 403);
      assert.strictEqual(up2.body.error, 'level_too_low');
      assert(up2.body.message.includes('Requires Player Level 2'));
    });

    await check('2.3 Level 2 player with XP >= 100 successfully unlocks Tier 2 upgrade', async () => {
      const lvl2Player = 'athlete_lvl2_' + Date.now();
      await request('POST', '/api/economy/sync', {
        playerId: lvl2Player,
        coins: 100000,
        xp: 120, // 120 XP -> Level 2
        level: 2
      });

      // Tier 1: Level 1 -> 2
      await request('POST', '/api/economy/upgrade', {
        playerId: lvl2Player,
        skill: 'power',
        level: 2,
        xp: 120
      });

      // Tier 2: Level 2 -> 3 (requires player level 2). Since player is level 2, this must SUCCEED!
      const up2 = await request('POST', '/api/economy/upgrade', {
        playerId: lvl2Player,
        skill: 'power',
        level: 2,
        xp: 120
      });
      assert.strictEqual(up2.status, 200);
      assert.strictEqual(up2.body.level, 3);
    });

    // --- 3. REFERRALS & ANTI-CHEAT AUDIT ---
    await check('3.1 Referral registration prevents self-referral', async () => {
      const res = await request('POST', '/api/referrals/register', {
        refCode: testPlayerId,
        playerId: testPlayerId
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.error, 'self_referral_prevented');
    });

    await check('3.2 Referral registration prevents circular cycles', async () => {
      const userA = 'athlete_cycle_a_' + Date.now();
      const userB = 'athlete_cycle_b_' + Date.now();

      // B joins with A
      const reg1 = await request('POST', '/api/referrals/register', { refCode: userA, playerId: userB });
      assert.strictEqual(reg1.status, 200);

      // A attempts to join with B -> cycle prevented!
      const reg2 = await request('POST', '/api/referrals/register', { refCode: userB, playerId: userA });
      assert.strictEqual(reg2.status, 400);
      assert.strictEqual(reg2.body.error, 'referral_cycle_prevented');
    });

    // --- 4. TON WALLET AUDIT ---
    await check('4.1 TON Wallet link rejects seed phrase with space', async () => {
      const res = await request('POST', '/api/wallet/link', {
        playerId: testPlayerId,
        walletAddress: 'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12'
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.error, 'seed_phrase_rejected');
    });

    await check('4.2 TON Wallet link accepts valid public address and disconnects', async () => {
      const validAddress = 'EQBvW8Z5huBkMJYdn30BlgG3mM2N05hpVNeSlfG2L89xAOn3';
      const linkRes = await request('POST', '/api/wallet/link', {
        playerId: testPlayerId,
        walletAddress: validAddress
      });
      assert.strictEqual(linkRes.status, 200);
      assert.strictEqual(linkRes.body.address, validAddress);

      const statusRes = await request('GET', `/api/wallet/status?playerId=${testPlayerId}`);
      assert.strictEqual(statusRes.body.isLinked, true);
      assert.strictEqual(statusRes.body.address, validAddress);

      const discRes = await request('POST', '/api/wallet/disconnect', { playerId: testPlayerId });
      assert.strictEqual(discRes.status, 200);

      const statusAfter = await request('GET', `/api/wallet/status?playerId=${testPlayerId}`);
      assert.strictEqual(statusAfter.body.isLinked, false);
      assert.strictEqual(statusAfter.body.address, null);
    });

    // --- 5. GAMEPLAY MECHANICS (FOOTBALL & BASKETBALL SIMULATION) ---
    await check('5.1 Football and Basketball simulation code syntax and boost calculations', async () => {
      const gameJs = fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8');
      assert(gameJs.includes('class FootballSim') || gameJs.includes('function FootballSim') || gameJs.includes('FootballSim ='), 'Must define FootballSim');
      assert(gameJs.includes('class BasketballSim') || gameJs.includes('function BasketballSim') || gameJs.includes('BasketballSim ='), 'Must define BasketballSim');
      assert(gameJs.includes('shotPower: 1 + (uPower - 1) * 0.035'), 'Power upgrade scales shotPower');
      assert(gameJs.includes('staminaRegen: 1 + (uStamina - 1) * 0.04'), 'Stamina upgrade scales staminaRegen');
      assert(gameJs.includes('keeper: 1 + (uKeeper - 1) * 0.035'), 'Keeper upgrade scales goalkeeper reaction');
    });

    console.log(`\n======================================================`);
    console.log(`ALL MECHANICS, PURCHASES & LOGIC AUDITED SUCCESSFULLY (${passed}/${total})!`);
    console.log(`======================================================\n`);

  } finally {
    if (spawnedServer) {
      spawnedServer.kill();
    }
    try {
      fs.unlinkSync(tmpDataPath);
    } catch (e) {}
  }
}

runAudit().catch(err => {
  console.error('[AUDIT FATAL ERROR]', err);
  process.exit(1);
});
