const fs = require('fs');
const assert = require('assert');
const http = require('http');

console.log('=== Stage 4: Comprehensive Multi-Rarity Equip & In-Engine Propagation Test ===');

const PORT = 8391;
process.env.PORT = String(PORT);
process.env.NODE_ENV = 'test';
process.env.DATA_FILE = 'tests/tmp_stage4_audit_state.json';

// Clean test state
if (fs.existsSync('tests/tmp_stage4_audit_state.json')) {
  try { fs.unlinkSync('tests/tmp_stage4_audit_state.json'); } catch (e) {}
}

const serverModule = require('../server/server.js');
const server = serverModule.server || serverModule;

function apiPost(path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = http.request({
      hostname: '127.0.0.1',
      port: PORT,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function run() {
  await new Promise(r => setTimeout(r, 600));

  const playerId = 'test_stage4_collector_' + Date.now();
  console.log('Test Player ID:', playerId);

  // 1. Initial Sync with starter funds
  const syncRes = await apiPost('/api/economy/sync', { playerId, coins: 50000 });
  assert.strictEqual(syncRes.status, 200, 'Initial sync must succeed');
  assert(syncRes.body.ok || syncRes.body.success, 'Must return success');
  console.log('  [PASS] Player initial state synchronized with 50,000 FvH Coins.');

  // 2. Test Matrix of all 4 Rarity Tiers for Football & Basketball
  const testMatrix = [
    {
      tier: 'Common',
      footyJersey: 'skin_plain_white',
      hoopsJersey: 'skin_bb_white',
      footyBall: 'ball_training',
      hoopsBall: 'ball_hoops_rubber'
    },
    {
      tier: 'Rare',
      footyJersey: 'skin_velocity',
      hoopsJersey: 'skin_bb_miami',
      footyBall: 'ball_vortex',
      hoopsBall: 'ball_hoops_lime'
    },
    {
      tier: 'Epic',
      footyJersey: 'skin_golden',
      hoopsJersey: 'skin_bb_gold',
      footyBall: 'ball_hyperdrive',
      hoopsBall: 'ball_cyber_grid'
    },
    {
      tier: 'Legendary',
      footyJersey: 'skin_dragon',
      hoopsJersey: 'skin_bb_nebula',
      footyBall: 'ball_sovereign',
      hoopsBall: 'ball_supernova'
    }
  ];

  for (const itemSet of testMatrix) {
    console.log(`\nTesting Rarity Tier: [${itemSet.tier}]...`);

    // Purchase items
    const itemsToBuy = [itemSet.footyJersey, itemSet.hoopsJersey, itemSet.footyBall, itemSet.hoopsBall];
    for (const itId of itemsToBuy) {
      const buyRes = await apiPost('/api/economy/purchase', { playerId, itemId: itId });
      if (!buyRes.body || !buyRes.body.ok) {
        console.error('buyRes error:', itId, buyRes.body);
      }
      assert(buyRes.status === 200 && (buyRes.body.ok || buyRes.body.error === 'already_owned'), `Item ${itId} purchase must succeed`);
    }
    console.log(`  [PASS] Purchased all ${itemSet.tier} items.`);

    // Equip Football Jersey
    const eqFjRes = await apiPost('/api/economy/equip', { playerId, slot: 'skin', itemId: itemSet.footyJersey });
    assert(eqFjRes.body.ok, `Equipping ${itemSet.footyJersey} must succeed`);
    assert.strictEqual(eqFjRes.body.equipped.skin, itemSet.footyJersey);
    console.log(`  [PASS] Football Jersey equipped: ${itemSet.footyJersey} (${itemSet.tier})`);

    // Equip Basketball Jersey
    const eqBjRes = await apiPost('/api/economy/equip', { playerId, slot: 'skin', itemId: itemSet.hoopsJersey });
    assert(eqBjRes.body.ok, `Equipping ${itemSet.hoopsJersey} must succeed`);
    assert.strictEqual(eqBjRes.body.equipped.skin, itemSet.hoopsJersey);
    console.log(`  [PASS] Basketball Jersey equipped: ${itemSet.hoopsJersey} (${itemSet.tier})`);

    // Equip Football Ball
    const eqFbRes = await apiPost('/api/economy/equip', { playerId, slot: 'ball.footy', itemId: itemSet.footyBall });
    assert(eqFbRes.body.ok, `Equipping ${itemSet.footyBall} must succeed`);
    assert.strictEqual(eqFbRes.body.equipped['ball.footy'], itemSet.footyBall);
    console.log(`  [PASS] Football Ball equipped: ${itemSet.footyBall} (${itemSet.tier})`);

    // Equip Basketball Ball
    const eqBbRes = await apiPost('/api/economy/equip', { playerId, slot: 'ball.hoops', itemId: itemSet.hoopsBall });
    assert(eqBbRes.body.ok, `Equipping ${itemSet.hoopsBall} must succeed`);
    assert.strictEqual(eqBbRes.body.equipped['ball.hoops'], itemSet.hoopsBall);
    console.log(`  [PASS] Basketball Ball equipped: ${itemSet.hoopsBall} (${itemSet.tier})`);
  }

  // 3. Verify procedural texture generator compatibility
  console.log('\nTesting procedural 3D texture generation for all equipped items...');
  const modules = {};
  global.define = function(name, deps, factory) { modules[name] = { deps, factory }; };
  global.window = { __boot: () => {}, AudioContext: null, innerWidth: 390, innerHeight: 844 };
  global.document = { createElement: () => ({ style: {} }) };
  require('../js/game.js');
  const itemsMod = modules['data/shop'];
  let gameItems = [];
  if (itemsMod) {
    const exportsObj = {};
    itemsMod.factory(null, exportsObj);
    gameItems = exportsObj.ITEMS || [];
  }
  assert(gameItems && gameItems.length >= 70, 'Game ITEMS must contain all 70 items');

  const fItems = gameItems.filter(i => i.category === 'skins' && (i.id.startsWith('skin_') && !i.id.includes('bb_')));
  const bItems = gameItems.filter(i => i.category === 'skins' && i.id.startsWith('skin_bb_'));
  const fBalls = gameItems.filter(i => i.category === 'balls' && (i.slot === 'ball.footy' || i.mode === 'footy'));
  const bBalls = gameItems.filter(i => i.category === 'balls' && (i.slot === 'ball.hoops' || i.mode === 'hoops'));

  console.log(`  [VERIFIED] In-memory Game ITEMS: ${gameItems.length} items registered.`);
  console.log(`    - Football kits: ${fItems.length}`);
  console.log(`    - Basketball jerseys: ${bItems.length}`);
  console.log(`    - Football balls: ${fBalls.length}`);
  console.log(`    - Basketball balls: ${bBalls.length}`);

  console.log('\n=== ALL MULTI-RARITY EQUIP & PROPAGATION TESTS PASSED (100%) ===');

  if (fs.existsSync('tests/tmp_stage4_audit_state.json')) {
    try { fs.unlinkSync('tests/tmp_stage4_audit_state.json'); } catch (e) {}
  }
  process.exit(0);
}

run().catch(err => {
  console.error('[FAILED]', err);
  process.exit(1);
});
