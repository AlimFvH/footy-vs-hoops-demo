/**
 * FOOTY vs HOOPS - Prompt 4 Comprehensive Economy, Shop, Inventory & Battle Pass E2E Tests
 */

const http = require('http');

function postJson(urlPath, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 8099,
        path: urlPath,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      },
      res => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ statusCode: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function getJson(urlPath) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 8099,
        path: urlPath,
        method: 'GET'
      },
      res => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ statusCode: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error('Assertion Failed: ' + message);
  }
}

async function runTests() {
  console.log('===============================================================');
  console.log('🧪 FOOTY vs HOOPS - Prompt 4 Economy, Shop & BP Test Suite');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      process.stdout.write(`• ${name}... `);
      await fn();
      console.log('✅ PASS');
      passed++;
    } catch (err) {
      console.log('❌ FAIL');
      console.error('  Error:', err.message);
      failed++;
    }
  }

  const testPlayerId = 'e2e_athlete_' + Date.now();

  // Test 1: Authoritative Default State
  await test('1. Authoritative default player state creation', async () => {
    const res = await getJson(`/api/economy/state?playerId=${testPlayerId}`);
    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    assert(res.data.ok === true, 'Response ok should be true');
    assert(res.data.playerId === testPlayerId, 'Player ID match');
    assert(res.data.coins === 350, `Default coins should be 350, got ${res.data.coins}`);
    assert(res.data.xp === 0, 'Default XP should be 0');
    assert(Array.isArray(res.data.owned), 'Owned items must be an array');
    assert(res.data.owned.includes('skin_rookie'), 'Rookie jersey must be owned by default');
    assert(res.data.battlePass.isPremium === false, 'VIP pass must be false by default');
  });

  // Test 2: Negative Balance Protection
  await test('2. Negative balance protection (cannot buy item when insufficient coins)', async () => {
    // Cyber Megacity arena costs 950 coins, player has only 350
    const res = await postJson('/api/economy/purchase', {
      playerId: testPlayerId,
      itemId: 'std_cyber_megacity'
    });
    assert(res.statusCode === 400, `Expected 400 for insufficient funds, got ${res.statusCode}`);
    assert(res.data.error === 'insufficient_funds', `Expected insufficient_funds, got ${res.data.error}`);
    assert(res.data.required === 950, 'Required price should be 950');
    assert(res.data.available === 350, 'Available coins should remain 350');
  });

  // Test 3: Earn Coins & XP from Match
  await test('3. Earn coins and XP from validated match completion', async () => {
    const matchId = 'match_' + Date.now();
    const res = await postJson('/api/economy/reward', {
      playerId: testPlayerId,
      rewardType: 'match',
      matchId: matchId,
      meta: {
        mode: 'footy',
        outcome: 'win',
        difficulty: 'normal',
        goals: 3,
        tackles: 4
      }
    });
    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    assert(res.data.ok === true, 'Reward should be ok');
    assert(res.data.coinsEarned > 0, 'Coins earned should be positive');
    assert(res.data.xpEarned > 0, 'XP earned should be positive');
    assert(res.data.coins > 350, 'Balance must increase');
    assert(typeof res.data.txId === 'string' && res.data.txId.startsWith('tx_'), 'Valid transaction ID generated');

    // Duplicate match reward prevention (Idempotency)
    const dupRes = await postJson('/api/economy/reward', {
      playerId: testPlayerId,
      rewardType: 'match',
      matchId: matchId
    });
    assert(dupRes.statusCode === 400, 'Duplicate match reward claim must be rejected');
    assert(dupRes.data.error === 'match_already_rewarded', 'Error must be match_already_rewarded');
  });

  // Test 4: Quest Claiming & Duplicate Prevention
  await test('4. Quest reward claim & duplicate claim prevention', async () => {
    const res = await postJson('/api/economy/reward', {
      playerId: testPlayerId,
      rewardType: 'quest',
      questId: 'prime_daily'
    });
    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    assert(res.data.coinsEarned === 250, 'Prime daily grants 250 coins');
    assert(res.data.xpEarned === 100, 'Prime daily grants 100 XP');

    // Second claim of the same quest
    const dupRes = await postJson('/api/economy/reward', {
      playerId: testPlayerId,
      rewardType: 'quest',
      questId: 'prime_daily'
    });
    assert(dupRes.statusCode === 400, 'Duplicate quest claim must be rejected');
    assert(dupRes.data.error === 'quest_already_claimed', 'Error must be quest_already_claimed');
  });

  // Test 5: Currency Package Purchase (Stars / TON Checkout)
  await test('5. Configured currency packages crediting authoritative FvH Coin balance', async () => {
    const invRes = await postJson('/api/stars/create-invoice', {
      productId: 'pkg_coins_elite', // 2,800 FvH Coin package
      playerId: testPlayerId
    });
    assert(invRes.statusCode === 200, 'Invoice creation succeeded');
    assert(invRes.data.starsAmount === 200, 'Elite package costs 200 Stars');

    const stateBefore = (await getJson(`/api/economy/state?playerId=${testPlayerId}`)).data;
    const coinsBefore = stateBefore.coins;

    const verRes = await postJson('/api/stars/verify', {
      invoiceId: invRes.data.invoiceId,
      playerId: testPlayerId,
      chargeId: 'TG_CHARGE_' + Date.now()
    });
    assert(verRes.statusCode === 200, 'Payment verification succeeded');
    assert(verRes.data.success === true, 'Payment marked successful');

    const stateAfter = (await getJson(`/api/economy/state?playerId=${testPlayerId}`)).data;
    assert(stateAfter.coins === coinsBefore + 2800, `Expected balance +2800, got ${stateAfter.coins} (before: ${coinsBefore})`);

    // Verify Idempotency: cannot credit same invoice twice
    const dupVer = await postJson('/api/stars/verify', {
      invoiceId: invRes.data.invoiceId,
      playerId: testPlayerId
    });
    assert(dupVer.data.alreadyProcessed === true, 'Invoice must not be credited twice');
    const stateAfterDup = (await getJson(`/api/economy/state?playerId=${testPlayerId}`)).data;
    assert(stateAfterDup.coins === stateAfter.coins, 'Balance must remain unchanged on duplicate invoice call');
  });

  // Test 6: Single Item Purchase & Duplicate Purchase Rejection
  await test('6. Single item purchase deduction and duplicate purchase rejection', async () => {
    const stateBefore = (await getJson(`/api/economy/state?playerId=${testPlayerId}`)).data;
    const coinsBefore = stateBefore.coins;

    // Purchase Frost Giant jersey (280 coins)
    const buyRes = await postJson('/api/economy/purchase', {
      playerId: testPlayerId,
      itemId: 'skin_frost',
      idempotencyKey: 'idemp_' + Date.now()
    });
    assert(buyRes.statusCode === 200, `Purchase should succeed, got ${buyRes.statusCode}`);
    assert(buyRes.data.coins === coinsBefore - 280, `Balance should decrease by 280, got ${buyRes.data.coins}`);
    assert(buyRes.data.owned.includes('skin_frost'), 'Item must now be in owned list');

    // Attempt to buy the exact same cosmetic again
    const dupBuy = await postJson('/api/economy/purchase', {
      playerId: testPlayerId,
      itemId: 'skin_frost'
    });
    assert(dupBuy.statusCode === 400, 'Duplicate purchase of owned cosmetic must be rejected');
    assert(dupBuy.data.error === 'already_owned', 'Error must be already_owned');
  });

  // Test 7: Themed Cosmetic Bundle Purchase
  await test('7. Themed bundle purchase granting all items, bonus coins, and packs atomically', async () => {
    const stateBefore = (await getJson(`/api/economy/state?playerId=${testPlayerId}`)).data;
    const coinsBefore = stateBefore.coins;

    // Purchase FOOTY Starter Bundle (costs 1950 coins, grants skin_cyber, ball_footy_inferno, +500 bonus coins, +2 footy packs)
    const bundleRes = await postJson('/api/economy/purchase', {
      playerId: testPlayerId,
      itemId: 'bundle_footy_starter',
      idempotencyKey: 'bundle_tx_' + Date.now()
    });
    assert(bundleRes.statusCode === 200, `Bundle purchase should succeed, got ${bundleRes.statusCode}`);
    // Net cost: -1950 + 500 = -1450
    assert(bundleRes.data.coins === coinsBefore - 1450, `Expected net coin deduction of 1450, got balance ${bundleRes.data.coins}`);
    assert(bundleRes.data.owned.includes('skin_cyber'), 'Bundle granted skin_cyber');
    assert(bundleRes.data.owned.includes('ball_footy_inferno'), 'Bundle granted ball_footy_inferno');
    assert(bundleRes.data.packs.paid.footy >= 2, 'Bundle granted 2 footy packs');

    // Attempting to buy again when all cosmetic items are owned must be blocked
    const dupBundle = await postJson('/api/economy/purchase', {
      playerId: testPlayerId,
      itemId: 'bundle_footy_starter'
    });
    assert(dupBundle.statusCode === 400, 'Duplicate bundle purchase should be blocked');
    assert(dupBundle.data.error === 'bundle_already_owned', 'Error must be bundle_already_owned');
  });

  // Test 8: Equipment Validation (Ownership Gating)
  await test('8. Equipment validation (unowned items cannot be equipped)', async () => {
    // Attempt to equip an unowned item (e.g. skin_shadow)
    const unownedRes = await postJson('/api/economy/equip', {
      playerId: testPlayerId,
      slot: 'skin',
      itemId: 'skin_shadow'
    });
    assert(unownedRes.statusCode === 403, `Equipping unowned item must return 403, got ${unownedRes.statusCode}`);
    assert(unownedRes.data.error === 'item_not_owned', 'Error must be item_not_owned');

    // Equip an owned item (skin_frost)
    const ownedRes = await postJson('/api/economy/equip', {
      playerId: testPlayerId,
      slot: 'skin',
      itemId: 'skin_frost'
    });
    assert(ownedRes.statusCode === 200, `Equipping owned item should succeed, got ${ownedRes.statusCode}`);
    assert(ownedRes.data.equipped.skin === 'skin_frost', 'Equipped skin updated to skin_frost');

    // State check
    const stateCheck = (await getJson(`/api/economy/state?playerId=${testPlayerId}`)).data;
    assert(stateCheck.equipped.skin === 'skin_frost', 'Equipped item persisted in player state');
  });

  // Test 9: Battle Pass Progression & VIP Gating
  await test('9. Battle Pass dual-track progression, VIP gating & late unlock', async () => {
    // 1. Give player enough XP for level 5
    const syncRes = await postJson('/api/economy/sync', {
      playerId: testPlayerId,
      xp: 800 // Level 5+
    });
    assert(syncRes.data.xp >= 800, 'XP updated');

    // 2. Claim Free Track Tier 1
    const freeClaim = await postJson('/api/economy/reward', {
      playerId: testPlayerId,
      rewardType: 'battlepass',
      level: 1,
      track: 'free'
    });
    assert(freeClaim.statusCode === 200, 'Free tier 1 claim should succeed');
    assert(freeClaim.data.battlePass.claimedFree.includes(1), 'Tier 1 recorded in claimedFree');

    // 3. Attempt to claim Premium Tier 1 WITHOUT VIP Pass -> Must fail with 403
    const premReject = await postJson('/api/economy/reward', {
      playerId: testPlayerId,
      rewardType: 'battlepass',
      level: 1,
      track: 'premium'
    });
    assert(premReject.statusCode === 403, `Claiming VIP tier without VIP entitlement must return 403, got ${premReject.statusCode}`);
    assert(premReject.data.error === 'premium_required', 'Error must be premium_required');

    // 4. Attempt to claim tier beyond reached level (Level 25) -> Must fail
    const lvlReject = await postJson('/api/economy/reward', {
      playerId: testPlayerId,
      rewardType: 'battlepass',
      level: 25,
      track: 'free'
    });
    assert(lvlReject.statusCode === 400, 'Claiming unreached tier must return 400');
    assert(lvlReject.data.error === 'level_not_reached', 'Error must be level_not_reached');

    // 5. Unlock VIP Battle Pass through payment verification
    const bpInvoice = await postJson('/api/stars/create-invoice', {
      productId: 'battlepass_premium',
      playerId: testPlayerId
    });
    await postJson('/api/stars/verify', {
      invoiceId: bpInvoice.data.invoiceId,
      playerId: testPlayerId
    });

    const stateVip = (await getJson(`/api/economy/state?playerId=${testPlayerId}`)).data;
    assert(stateVip.battlePass.isPremium === true, 'VIP Pass now active');

    // 6. Late unlock: Now claim VIP Tier 1 -> Must succeed!
    const premClaim = await postJson('/api/economy/reward', {
      playerId: testPlayerId,
      rewardType: 'battlepass',
      level: 1,
      track: 'premium'
    });
    assert(premClaim.statusCode === 200, 'VIP tier 1 claim now succeeds');
    assert(premClaim.data.battlePass.claimedPremium.includes(1), 'Tier 1 recorded in claimedPremium');

    // 7. Test Claim-All on remaining unlocked tiers
    const claimAll = await postJson('/api/economy/reward', {
      playerId: testPlayerId,
      rewardType: 'battlepass_all'
    });
    assert(claimAll.statusCode === 200, 'Claim-all should succeed');
    assert(claimAll.data.claimedCount > 0, 'Claim-all claimed multiple tiers');
  });

  // Test 10: Economy Ledger Audit Trail
  await test('10. Economy transaction ledger audit trail', async () => {
    const res = await getJson(`/api/economy/ledger?playerId=${testPlayerId}`);
    assert(res.statusCode === 200, 'Ledger endpoint returns 200');
    assert(Array.isArray(res.data.history), 'History is an array');
    assert(res.data.history.length >= 5, `Expected at least 5 ledger entries, got ${res.data.history.length}`);

    // Every entry must have unique txId, timestamp, deltaCoins, balanceAfter
    res.data.history.forEach(entry => {
      assert(typeof entry.txId === 'string' && entry.txId.startsWith('tx_'), 'Valid txId');
      assert(typeof entry.timestamp === 'number', 'Valid timestamp');
      assert(typeof entry.deltaCoins === 'number', 'Valid deltaCoins');
      assert(typeof entry.balanceAfter === 'number', 'Valid balanceAfter');
    });
  });

  console.log('\n===============================================================');
  console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
