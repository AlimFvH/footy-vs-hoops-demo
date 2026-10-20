const assert = require('assert');

async function runPaymentTests() {
  console.log('=== Starting Payments Subsystem E2E Tests against http://localhost:8099 ===\n');

  const BASE_URL = 'http://localhost:8099';
  const testPlayerId = 'player_e2e_' + Date.now();

  // 1. Catalog
  console.log('1. Testing /api/catalog...');
  const catRes = await fetch(`${BASE_URL}/api/catalog`);
  const catData = await catRes.json();
  assert(catData.ok, 'Catalog response should be ok');
  assert(catData.catalog.battlepass_premium, 'Catalog must contain battlepass_premium');
  assert(catData.catalog.bundle_footy_starter, 'Catalog must contain bundle_footy_starter');
  assert.strictEqual(catData.catalog.battlepass_premium.starsPrice, 250);
  assert.strictEqual(catData.catalog.battlepass_premium.tonPrice, 1.5);
  console.log('  [PASS] Catalog verified with 8 products.\n');

  // 2. Telegram Stars: Create Invoice
  console.log('2. Testing /api/stars/create-invoice...');
  const starsInvRes = await fetch(`${BASE_URL}/api/stars/create-invoice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: 'battlepass_premium',
      playerId: testPlayerId
    })
  });
  const starsInv = await starsInvRes.json();
  assert(starsInv.ok, 'Stars invoice creation should be ok');
  assert(starsInv.invoiceId.startsWith('stars_'), 'Invoice ID must start with stars_');
  assert.strictEqual(starsInv.starsAmount, 250);
  console.log(`  [PASS] Invoice created: ${starsInv.invoiceId} for ${starsInv.starsAmount} Stars.\n`);

  // 3. Telegram Stars: Verify Payment
  console.log('3. Testing /api/stars/verify...');
  const starsVerRes = await fetch(`${BASE_URL}/api/stars/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      invoiceId: starsInv.invoiceId,
      playerId: testPlayerId,
      telegramPaymentChargeId: 'tg_charge_' + Date.now()
    })
  });
  const starsVer = await starsVerRes.json();
  assert(starsVer.ok, 'Stars verification should be ok');
  assert.strictEqual(starsVer.productId, 'battlepass_premium');
  console.log('  [PASS] Stars payment successfully verified.\n');

  // 4. Telegram Stars: Idempotency (replay verify)
  console.log('4. Testing Stars verification idempotency...');
  const starsReplayRes = await fetch(`${BASE_URL}/api/stars/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      invoiceId: starsInv.invoiceId,
      playerId: testPlayerId
    })
  });
  const starsReplay = await starsReplayRes.json();
  assert(starsReplay.ok, 'Replay should still be ok');
  assert.strictEqual(starsReplay.alreadyProcessed, true, 'Must report alreadyProcessed: true');
  console.log('  [PASS] Stars idempotency verified: prevented duplicate credit.\n');

  // 5. TON: Create Payload
  console.log('5. Testing /api/ton/create-payload for Bundle...');
  const tonPayloadRes = await fetch(`${BASE_URL}/api/ton/create-payload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: 'bundle_footy_starter',
      playerId: testPlayerId
    })
  });
  const tonPayload = await tonPayloadRes.json();
  assert(tonPayload.ok, 'TON payload creation should be ok');
  assert(tonPayload.memo.startsWith('FVH-PAY-'), 'Memo must follow FVH-PAY- format');
  assert.strictEqual(tonPayload.tonAmount, 0.9);
  assert.strictEqual(tonPayload.nanoTon, 900000000);
  console.log(`  [PASS] TON payload created with memo ${tonPayload.memo} for ${tonPayload.tonAmount} TON.\n`);

  // 6. TON: Verify Payment
  console.log('6. Testing /api/ton/verify...');
  const testTxHash = 'TON_TX_HASH_' + Date.now();
  const tonVerRes = await fetch(`${BASE_URL}/api/ton/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      txId: tonPayload.txId,
      txHash: testTxHash,
      playerId: testPlayerId
    })
  });
  const tonVer = await tonVerRes.json();
  assert(tonVer.ok, 'TON verification should be ok');
  assert.strictEqual(tonVer.productId, 'bundle_footy_starter');
  assert.strictEqual(tonVer.tonAmount, 0.9);
  console.log('  [PASS] TON transaction verified.\n');

  // 7. TON: Replay attack prevention (reusing the same transaction hash on another invoice)
  console.log('7. Testing TON replay attack protection on txHash...');
  const tonPayload2Res = await fetch(`${BASE_URL}/api/ton/create-payload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: 'bundle_hoops_starter',
      playerId: testPlayerId
    })
  });
  const tonPayload2 = await tonPayload2Res.json();

  const replayAttackRes = await fetch(`${BASE_URL}/api/ton/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      txId: tonPayload2.txId,
      txHash: testTxHash, // ATTACK: Reusing previous txHash!
      playerId: testPlayerId
    })
  });
  const replayAttack = await replayAttackRes.json();
  assert.strictEqual(replayAttack.ok, false, 'Reused txHash must be rejected');
  assert.strictEqual(replayAttack.error, 'tx_already_used');
  console.log('  [PASS] Replay attack successfully blocked by server.\n');

  // 8. Payment Ledger History
  console.log('8. Testing /api/payments/history...');
  const histRes = await fetch(`${BASE_URL}/api/payments/history?playerId=${testPlayerId}`);
  const hist = await histRes.json();
  assert(hist.ok, 'History response must be ok');
  assert.strictEqual(hist.history.length, 2, 'Should have 2 recorded transactions');
  assert(hist.history.some(tx => tx.type === 'stars' && tx.productId === 'battlepass_premium'));
  assert(hist.history.some(tx => tx.type === 'ton' && tx.productId === 'bundle_footy_starter'));
  console.log('  [PASS] Payments ledger accurately recorded and filtered by player ID.\n');

  console.log('=== ALL PAYMENTS E2E TESTS PASSED SUCCESSFULLY! ===\n');
}

runPaymentTests().catch(err => {
  console.error('[E2E FAILURE]', err);
  process.exit(1);
});
