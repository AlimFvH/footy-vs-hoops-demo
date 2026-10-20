const assert = require('assert');
const http = require('http');

const PORT = 8099;
const HOST = 'localhost';

function post(path, data) {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(data);
    const req = http.request({
      hostname: HOST,
      port: PORT,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr)
      }
    }, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); } catch (e) { resolve(raw); }
      });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://${HOST}:${PORT}${path}`, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); } catch (e) { resolve(raw); }
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('=== MULTIPLAYER & REFERRALS END-TO-END SERVER TEST ===\n');

  // Test 1: Matchmaking Pair between P1 and P2
  console.log('Test 1: Quick Match matchmaking pairing...');
  const p1 = await post('/api/matchmaking/join', {
    playerId: 'p1_footy_' + Date.now(),
    playerName: 'Striker10',
    character: 'footy',
    mode: 'footy'
  });
  console.log('p1 received:', p1);
  assert(p1 && (p1.status === 'searching' || p1.status === 'waiting' || p1.status === 'matched'), 'P1 should be searching, waiting, or matched');

  const p2 = await post('/api/matchmaking/join', {
    playerId: 'p2_hoops_' + Date.now(),
    playerName: 'Dunker23',
    character: 'hoops',
    mode: 'hoops'
  });
  assert(p2.ok, 'P2 join failed');
  assert.strictEqual(p2.status, 'matched', 'P2 should match immediately with P1');
  assert.strictEqual(p2.role, 'guest');
  assert(p2.matchId, 'P2 must receive matchId');

  const p1Poll = await get(`/api/matchmaking/poll?playerId=${p1.playerId}`);
  assert(p1Poll.ok && p1Poll.status === 'matched', 'P1 poll should confirm match');
  assert.strictEqual(p1Poll.role, 'host');
  assert.strictEqual(p1Poll.matchId, p2.matchId, 'P1 and P2 must share identical matchId');
  console.log(`[PASS] Quick Match paired! matchId: ${p2.matchId}, Host: ${p1Poll.role}, Guest: ${p2.role}`);

  // Test 2: Signaling exchange between Host and Guest
  console.log('\nTest 2: WebRTC Signaling exchange over /api/room/signal...');
  const sigOffer = await post('/api/room/signal', {
    code: p2.matchId,
    from: 'Striker10',
    signal: { type: 'offer', data: 'MOCK_SDP_OFFER_DATA' }
  });
  assert(sigOffer.ok, 'Offer posting failed');

  const guestSignals = await get(`/api/room/signals?code=${p2.matchId}&from=Striker10`);
  assert(guestSignals.ok && guestSignals.signals.length === 1);
  assert.strictEqual(guestSignals.signals[0].type, 'offer');
  assert.strictEqual(guestSignals.signals[0].data, 'MOCK_SDP_OFFER_DATA');

  const sigAnswer = await post('/api/room/signal', {
    code: p2.matchId,
    from: 'Dunker23',
    signal: { type: 'answer', data: 'MOCK_SDP_ANSWER_DATA' }
  });
  assert(sigAnswer.ok, 'Answer posting failed');

  const hostSignals = await get(`/api/room/signals?code=${p2.matchId}&from=Dunker23`);
  assert(hostSignals.ok && hostSignals.signals.length === 1);
  assert.strictEqual(hostSignals.signals[0].type, 'answer');
  assert.strictEqual(hostSignals.signals[0].data, 'MOCK_SDP_ANSWER_DATA');
  console.log('[PASS] Full WebRTC signaling exchange completed automatically!');

  // Test 3: Private Match Room Creation & Joining
  console.log('\nTest 3: Private Room Creation (6-character code) & Joining...');
  const room = await post('/api/room/create', {
    hostId: 'host_player_99',
    hostName: 'CaptainFooty',
    character: 'footy',
    mode: 'footy'
  });
  assert(room.ok, 'Room creation failed');
  assert(room.code && room.code.startsWith('FVH-'), `Room code must start with FVH-, got: ${room.code}`);
  console.log(`[PASS] Created room: ${room.code}`);

  const joinRes = await post('/api/room/join', {
    code: room.code,
    guestId: 'guest_player_88',
    guestName: 'BallerHoops',
    character: 'hoops'
  });
  assert(joinRes.ok, 'Guest join failed');
  assert.strictEqual(joinRes.room.status, 'playing');
  assert.strictEqual(joinRes.room.guestName, 'BallerHoops');

  const roomStatus = await get(`/api/room/status?code=${room.code}`);
  assert(roomStatus.ok && roomStatus.status === 'playing');
  assert.strictEqual(roomStatus.guest.name, 'BallerHoops');
  console.log(`[PASS] Guest joined room ${room.code} and status transitioned to playing!`);

  // Test 4: Referral System & Milestone Qualification
  console.log('\nTest 4: Referral Squad Registration, Qualification & Milestones...');
  const refCode = 'FVH-TEST_' + Date.now();
  const friendId = 'friend_' + Date.now();
  const regFriend = await post('/api/referrals/register', {
    friendId: friendId,
    referralCode: refCode
  });
  assert(regFriend.ok, 'Friend registration failed');

  // Verify initial stats (1 total, 0 qualified)
  const initialStats = await get(`/api/referrals/stats?userId=ref_${refCode}`);
  assert(initialStats.ok);
  assert.strictEqual(initialStats.totalInvited, 1);
  assert.strictEqual(initialStats.qualifiedCount, 0);

  // Friend completes 1 match
  const qualFriend = await post('/api/referrals/qualify', { friendId: friendId });
  assert(qualFriend.ok, 'Friend qualification failed');

  // Verify updated stats (1 qualified)
  const qualStats = await get(`/api/referrals/stats?userId=ref_${refCode}`);
  assert.strictEqual(qualStats.qualifiedCount, 1);
  console.log(`[PASS] Friend registered and qualified! Qualified count: ${qualStats.qualifiedCount}`);

  // Claim Milestone 1
  const claimRes = await post('/api/referrals/claim', {
    userId: `ref_${refCode}`,
    milestoneTarget: 1
  });
  assert(claimRes.ok, 'Milestone claim failed');
  assert.strictEqual(claimRes.reward.coins, 500);
  assert.strictEqual(claimRes.reward.xp, 150);

  // Reject duplicate claim
  const dupClaim = await post('/api/referrals/claim', {
    userId: `ref_${refCode}`,
    milestoneTarget: 1
  });
  assert(!dupClaim.ok, 'Duplicate milestone claim must be rejected');
  console.log('[PASS] Milestone 1 claimed and duplicate claim successfully rejected!');

  console.log('\n=== ALL END-TO-END SERVER & MULTIPLAYER TESTS PASSED (100%) ===\n');
}

runTests().catch(err => {
  console.error('[FAIL]', err);
  process.exit(1);
});
