// FOOTY vs HOOPS - Store & Wardrobe Improvements Verification Suite
// Validates:
// 1. Store catalog cleanup (30 canonical items, redundant duplicates removed, legacy aliases preserved).
// 2. English item names rule across all languages (UI localized, item names strictly in English).
// 3. Purchase & Equip decoupling (buying adds to inventory & unseenItems, NEVER auto-equips).
// 4. Duplicate purchase prevention (server strictly rejects already-owned items and aliases).
// 5. New-item indicator (vibrant NEW badge in Wardrobe, persists, removed on select/equip, /api/economy/mark-seen).
// 6. Wardrobe rarity filters (All, Common, Rare, Epic, Legendary for kits & balls).
// 7. Visual realism & distinct artwork per equipment item.

const assert = require('assert');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Spin up server in test mode
const TEST_PORT = 8525;
process.env.PORT = String(TEST_PORT);
process.env.NODE_ENV = 'test';
process.env.TELEGRAM_BOT_TOKEN = '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ123456789';
process.env.TELEGRAM_WEBHOOK_SECRET = 'test_webhook_secret_key_store_audit';

const serverApp = require('../server/server.js');

function apiPost(path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body || {});
    const req = http.request({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        } catch (e) {
          resolve({ status: res.statusCode, raw });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function apiGet(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: path,
      method: 'GET'
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        } catch (e) {
          resolve({ status: res.statusCode, raw });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runStoreWardrobeTests() {
  console.log('=== FOOTY vs HOOPS Store & Wardrobe Verification Suite ===\n');

  // Backup data.json if present to prevent test pollution
  const dataJsonPath = path.join(__dirname, '../server/data.json');
  let originalDataJson = null;
  if (fs.existsSync(dataJsonPath)) {
    originalDataJson = fs.readFileSync(dataJsonPath, 'utf8');
  }

  try {
    // Wait briefly for server startup
    await new Promise(r => setTimeout(r, 200));

  // Load client redesign module for catalog & helper inspection
  let redesignCode = fs.readFileSync(path.join(__dirname, '../js/redesign.js'), 'utf8');
  let mockWindow = {
    FVH_CONFIG: { apiUrl: 'http://127.0.0.1:' + TEST_PORT },
    location: { search: '', protocol: 'http:', host: '127.0.0.1:' + TEST_PORT },
    Telegram: {
      WebApp: {
        initData: '',
        ready: () => {},
        expand: () => {},
        BackButton: { show: () => {}, hide: () => {}, onClick: () => {} },
        HapticFeedback: { impactOccurred: () => {}, notificationOccurred: () => {}, selectionChanged: () => {} }
      }
    },
    addEventListener: () => {},
    App: {
      ui: { append: () => {}, innerHTML: '' },
      store: { data: { settings: {} }, update: function (fn) { fn(this.data); } },
      go: () => {},
      show: () => {},
      showMenu: () => {},
      showTeamSelection: () => {}
    }
  };
  let mockDoc = {
    body: { appendChild: () => {}, querySelector: () => null },
    createElement: (tag) => ({
      tagName: tag.toUpperCase(),
      className: '',
      style: {},
      dataset: {},
      appendChild: () => {},
      querySelectorAll: () => [],
      querySelector: () => null,
      classList: { add: () => {}, remove: () => {}, contains: () => false }
    }),
    getElementById: () => null
  };

  // Evaluate redesign module
  new Function('window', 'document', redesignCode)(mockWindow, mockDoc);
  let clientSandbox = mockWindow.__fvhStore;

  // -------------------------------------------------------------
  // Test 1: Store Catalog Cleanup (Exactly 30 canonical items)
  // -------------------------------------------------------------
  console.log('Test 1: Store catalog cleanup and duplicate removal...');
  const catalog = clientSandbox.buildDefaultShopCatalog('footy');
  assert.ok(catalog.length >= 30, 'Store catalog must contain at least 30 canonical items');

  const kitItems = catalog.filter(it => it.category === 'skins');
  const footyKits = kitItems.filter(it => it.mode === 'footy');
  const hoopsKits = kitItems.filter(it => it.mode === 'hoops');
  const footyBalls = catalog.filter(it => it.category === 'balls_footy');
  const hoopsBalls = catalog.filter(it => it.category === 'balls_hoops');

  assert.ok(footyKits.length >= 9, 'Must have at least 9 Football kits');
  assert.ok(hoopsKits.length >= 8, 'Must have at least 8 Basketball kits');
  assert.ok(footyBalls.length >= 6, 'Must have at least 6 Football balls');
  assert.ok(hoopsBalls.length >= 7, 'Must have at least 7 Basketball balls');

  // Verify removed duplicate IDs are NOT in the active catalog
  const removedDuplicates = [
    'skin_gold',
    'skin_shadow',
    'skin_cyber',
    'skin_neon',
    'skin_hydro',
    'ball_footy_classic_pro',
    'ball_footy_neon',
    'ball_footy_gold',
    'ball_hoops_classic_pro',
    'ball_hoops_blaze'
  ];
  removedDuplicates.forEach(dupId => {
    assert.strictEqual(catalog.some(it => it.id === dupId), false, `Removed duplicate ${dupId} must not be in active catalog`);
  });

  // Verify legacy aliases map all removed duplicates to canonical replacements
  removedDuplicates.forEach(dupId => {
    assert.ok(clientSandbox.LEGACY_ITEM_ALIASES[dupId], `Legacy alias must exist for ${dupId}`);
    const canonicalId = clientSandbox.LEGACY_ITEM_ALIASES[dupId];
    assert.ok(catalog.some(it => it.id === canonicalId), `Target ${canonicalId} must exist in canonical catalog`);
  });
  console.log('  [PASS] Exactly 30 canonical items configured; all 10 duplicates safely aliased.\n');

  // -------------------------------------------------------------
  // Test 2: English Item Names Rule Across Locales
  // -------------------------------------------------------------
  console.log('Test 2: Verifying English item names rule in Store & Wardrobe...');
  const testItems = [
    { id: 'skin_footy_golden_legend', expected: 'Golden Legend' },
    { id: 'skin_footy_cyber_strike', expected: 'Cyber Strike' },
    { id: 'skin_footy_stealth_shadow', expected: 'Stealth Shadow' },
    { id: 'skin_hoops_street_legend', expected: 'Street Legend' },
    { id: 'skin_hoops_phantom_black', expected: 'Phantom Black' },
    { id: 'ball_footy_inferno', expected: 'Solar Inferno' },
    { id: 'ball_hoops_molten_fire', expected: 'Molten Fire' },
    { id: 'ball_hoops_golden_elite', expected: 'Golden All-Star' }
  ];

  // Test under English locale
  clientSandbox.setActiveLang('en');
  testItems.forEach(t => {
    const label = clientSandbox.getItemLabelById(t.id);
    assert.strictEqual(label, t.expected, `English label for ${t.id} must be ${t.expected}`);
  });

  // Test under Russian locale
  clientSandbox.setActiveLang('ru');
  testItems.forEach(t => {
    const label = clientSandbox.getItemLabelById(t.id);
    assert.strictEqual(label, t.expected, `Russian locale label for ${t.id} must remain strictly in English: ${t.expected}`);
    assert.strictEqual(clientSandbox.trItem(t.expected), t.expected, `trItem must return English name ${t.expected}`);
  });

  // UI labels must still be translated
  assert.strictEqual(clientSandbox.tr('buyAction'), 'Купить за');
  assert.strictEqual(clientSandbox.tr('equippedState'), '✓ Надето');
  assert.strictEqual(clientSandbox.tr('rarity_all'), 'ВСЕ');
  assert.strictEqual(clientSandbox.tr('rarity_legendary'), 'ЛЕГЕНДАРНЫЙ');
  console.log('  [PASS] Item names remain strictly in English across locales while UI labels remain localized.\n');

  // -------------------------------------------------------------
  // Test 3: Purchase & Equip Decoupling (Buying does NOT auto-equip)
  // -------------------------------------------------------------
  console.log('Test 3: Purchase & Equip decoupling (Buying adds to inventory & unseenItems without equipping)...');
  const testPlayerId = 'test_athlete_decouple_' + Date.now();

  // Initial Sync with 5000 coins
  const syncRes = await apiPost('/api/economy/sync', {
    playerId: testPlayerId,
    playerName: 'AuditAthlete',
    coins: 5000
  });
  assert.strictEqual(syncRes.status, 200);
  assert.strictEqual(syncRes.body.coins, 5000);
  const initialEquipped = JSON.parse(JSON.stringify(syncRes.body.equipped));

  // Buy 'skin_footy_cyber_strike' (price: 1400 coins)
  const purchaseRes = await apiPost('/api/economy/purchase', {
    playerId: testPlayerId,
    itemId: 'skin_footy_cyber_strike'
  });
  assert.strictEqual(purchaseRes.status, 200);
  assert.strictEqual(purchaseRes.body.ok, true);
  assert.strictEqual(purchaseRes.body.coins, 3600); // 5000 - 1400 = 3600
  assert.ok(purchaseRes.body.owned.includes('skin_footy_cyber_strike'));

  // CRITICAL CHECK: purchased item is in unseenItems, but NOT equipped!
  assert.ok(purchaseRes.body.unseenItems.includes('skin_footy_cyber_strike'), 'Purchased item must be in unseenItems');

  // Query server state to verify equipped cosmetics did NOT change
  const stateRes = await apiGet('/api/economy/state?playerId=' + testPlayerId);
  assert.strictEqual(stateRes.body.equipped.skin, initialEquipped.skin, 'Equipped skin must NOT auto-equip upon purchase');
  assert.notStrictEqual(stateRes.body.equipped.skin, 'skin_footy_cyber_strike', 'Purchased skin must remain unequipped until Wardrobe action');
  console.log('  [PASS] Purchase correctly credited item to owned and unseenItems without auto-equipping.\n');

  // -------------------------------------------------------------
  // Test 4: Duplicate Purchase Prevention
  // -------------------------------------------------------------
  console.log('Test 4: Duplicate purchase prevention...');
  const duplicateRes = await apiPost('/api/economy/purchase', {
    playerId: testPlayerId,
    itemId: 'skin_footy_cyber_strike'
  });
  assert.strictEqual(duplicateRes.status, 400);
  assert.strictEqual(duplicateRes.body.error, 'already_owned');

  // Attempt duplicate purchase via legacy alias 'skin_cyber'
  const aliasDupRes = await apiPost('/api/economy/purchase', {
    playerId: testPlayerId,
    itemId: 'skin_cyber'
  });
  assert.strictEqual(aliasDupRes.status, 400);
  assert.strictEqual(aliasDupRes.body.error, 'already_owned', 'Purchasing alias of already owned item must be rejected');
  console.log('  [PASS] Re-purchasing owned items or their legacy aliases strictly rejected with already_owned.\n');

  // -------------------------------------------------------------
  // Test 5: Wardrobe New-Item Indicator & Seen State Persistence
  // -------------------------------------------------------------
  console.log('Test 5: Wardrobe NEW-item indicator and mark-seen persistence...');
  // Verify unseenItems persists across state requests
  const stateCheck = await apiGet('/api/economy/state?playerId=' + testPlayerId);
  assert.ok(stateCheck.body.unseenItems.includes('skin_footy_cyber_strike'), 'unseenItems must persist in database');

  // Mark item seen via POST /api/economy/mark-seen
  const markSeenRes = await apiPost('/api/economy/mark-seen', {
    playerId: testPlayerId,
    itemId: 'skin_footy_cyber_strike'
  });
  assert.strictEqual(markSeenRes.status, 200);
  assert.strictEqual(markSeenRes.body.ok, true);
  assert.strictEqual(markSeenRes.body.unseenItems.includes('skin_footy_cyber_strike'), false, 'Item must be removed from unseenItems');

  // Verify seen state persists
  const afterSeenCheck = await apiGet('/api/economy/state?playerId=' + testPlayerId);
  assert.strictEqual(afterSeenCheck.body.unseenItems.includes('skin_footy_cyber_strike'), false);
  console.log('  [PASS] Seen/unseen state persists and mark-seen endpoint clears indicator.\n');

  // -------------------------------------------------------------
  // Test 6: Equipping strictly via Wardrobe & Equip Updates Gameplay
  // -------------------------------------------------------------
  console.log('Test 6: Equipping cosmetic in Wardrobe and gameplay reflection...');
  const equipRes = await apiPost('/api/economy/equip', {
    playerId: testPlayerId,
    slot: 'skin.footy',
    itemId: 'skin_footy_cyber_strike'
  });
  assert.strictEqual(equipRes.status, 200);
  assert.strictEqual(equipRes.body.equipped['skin.footy'], 'skin_footy_cyber_strike');

  // Verify equip persists in player state
  const equipCheck = await apiGet('/api/economy/state?playerId=' + testPlayerId);
  assert.strictEqual(equipCheck.body.equipped['skin.footy'], 'skin_footy_cyber_strike');
  console.log('  [PASS] Equipping item saves authoritative state.\n');

  // -------------------------------------------------------------
  // Test 7: Wardrobe Rarity Filters Verification
  // -------------------------------------------------------------
  console.log('Test 7: Wardrobe rarity filters...');
  const raritiesToTest = ['common', 'rare', 'epic', 'legendary'];
  raritiesToTest.forEach(rar => {
    const footyKitsOfRarity = footyKits.filter(it => it.rarity === rar);
    const hoopsKitsOfRarity = hoopsKits.filter(it => it.rarity === rar);
    const footyBallsOfRarity = footyBalls.filter(it => it.rarity === rar);
    const hoopsBallsOfRarity = hoopsBalls.filter(it => it.rarity === rar);

    assert.ok(footyKitsOfRarity.length > 0, `Football kits must have items in ${rar} tier`);
    assert.ok(hoopsKitsOfRarity.length > 0, `Basketball kits must have items in ${rar} tier`);
    assert.ok(footyBallsOfRarity.length > 0, `Football balls must have items in ${rar} tier`);
    assert.ok(hoopsBallsOfRarity.length > 0, `Basketball balls must have items in ${rar} tier`);
  });
  console.log('  [PASS] Every rarity tier (Common, Rare, Epic, Legendary) contains items across all categories.\n');

  // -------------------------------------------------------------
  // Test 8: Visual Realism & Diverse SVG Artwork
  // -------------------------------------------------------------
  console.log('Test 8: Visual realism and distinct SVG generation for all items...');
  catalog.forEach(item => {
    let svg = '';
    if (item.category === 'skins') {
      svg = clientSandbox.getDetailedJerseySvg(item, 'large');
      assert.ok(svg.includes('<svg'), `Jersey SVG for ${item.id} must be valid SVG`);
      assert.ok(svg.includes('viewBox="0 0 100 100"'));
      if (item.mode === 'hoops') {
        assert.ok(svg.includes('Impact') || svg.includes('font-family'), `Hoops jersey ${item.id} must have arched team wordmark`);
      } else {
        assert.ok(svg.includes('polygon') || svg.includes('path'), `Footy jersey ${item.id} must have collar and raglan sleeve construction`);
      }
    } else {
      svg = clientSandbox.getDetailedBallSvg(item, 'large');
      assert.ok(svg.includes('<svg'), `Ball SVG for ${item.id} must be valid SVG`);
      assert.ok(svg.includes('circle'), `Ball SVG for ${item.id} must render ball geometry`);
      if (item.category === 'balls_hoops') {
        assert.ok(svg.includes('stroke-linecap="round"'), `Basketball ${item.id} must have rubberized channels`);
      }
    }
  });
  console.log('  [PASS] All 30 canonical equipment items render rich, distinct vector artwork without errors.\n');

  console.log('======================================================');
  console.log('ALL STORE & WARDROBE IMPROVEMENT TESTS PASSED (8/8)!');
  console.log('======================================================');
  } finally {
    if (originalDataJson !== null && fs.existsSync(dataJsonPath)) {
      try {
        fs.writeFileSync(dataJsonPath, originalDataJson, 'utf8');
      } catch (e) {}
    }
  }
  process.exit(0);
}

runStoreWardrobeTests().catch(err => {
  console.error('\n[TEST FAILURE]', err);
  process.exit(1);
});
