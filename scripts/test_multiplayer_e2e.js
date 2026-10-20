const assert = require('assert');
const http = require('http');

console.log('=====================================================');
console.log('   FOOTY vs HOOPS - Prompt 5 Multiplayer Test Suite  ');
console.log('=====================================================\n');

const SERVER_URL = 'http://localhost:8099';

function api(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, SERVER_URL);
    const postData = data ? JSON.stringify(data) : null;
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

let passed = 0;
let total = 0;

async function test(name, fn) {
  total++;
  try {
    await fn();
    console.log(`[PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
  }
}

async function run() {
  // Test 1: Quick Match Queue & Real Player Pairing
  await test('Quick Match: Pairs two live players into same match session', async () => {
    const p1Id = 'p1_' + Math.random().toString(36).slice(2, 7);
    const p2Id = 'p2_' + Math.random().toString(36).slice(2, 7);

    // Player 1 enters queue
    const res1 = await api('/api/matchmaking/join', 'POST', {
      playerId: p1Id,
      playerName: 'AlphaStriker',
      mode: 'footy',
      character: 'footy'
    });
    assert.strictEqual(res1.status, 200);
    assert.strictEqual(res1.data.status, 'searching');
    assert(res1.data.ticketId, 'Should receive ticketId');

    // Player 1 polls queue
    const poll1 = await api(`/api/matchmaking/poll?playerId=${p1Id}`);
    assert.strictEqual(poll1.status, 200);
    assert.strictEqual(poll1.data.status, 'searching');

    // Player 2 enters queue
    const res2 = await api('/api/matchmaking/join', 'POST', {
      playerId: p2Id,
      playerName: 'BetaDunker',
      mode: 'hoops',
      character: 'hoops'
    });
    assert.strictEqual(res2.status, 200);
    assert.strictEqual(res2.data.status, 'matched');
    assert.strictEqual(res2.data.role, 'guest');
    assert(res2.data.matchId, 'Should have matchId');
    assert.strictEqual(res2.data.opponent.name, 'AlphaStriker');

    // Player 1 polls again, should now be matched as host
    const poll2 = await api(`/api/matchmaking/poll?playerId=${p1Id}`);
    assert.strictEqual(poll2.status, 200);
    assert.strictEqual(poll2.data.status, 'matched');
    assert.strictEqual(poll2.data.role, 'host');
    assert.strictEqual(poll2.data.matchId, res2.data.matchId);
    assert.strictEqual(poll2.data.opponent.name, 'BetaDunker');
    assert.strictEqual(poll2.data.match.seed, res2.data.match.seed);
  });

  // Test 2: Cancel Matchmaking
  await test('Quick Match: Cancel Search properly leaves matchmaking queue', async () => {
    const p3Id = 'p3_' + Math.random().toString(36).slice(2, 7);
    const joinRes = await api('/api/matchmaking/join', 'POST', {
      playerId: p3Id,
      playerName: 'SoloAthlete',
      mode: 'footy'
    });
    assert.strictEqual(joinRes.data.status, 'searching');

    const cancelRes = await api('/api/matchmaking/cancel', 'POST', { playerId: p3Id });
    assert.strictEqual(cancelRes.status, 200);
    assert.strictEqual(cancelRes.data.ok, true);

    const pollRes = await api(`/api/matchmaking/poll?playerId=${p3Id}`);
    assert.strictEqual(pollRes.data.status, 'idle', 'Should be idle after cancel');
  });

  // Test 3: Private Match Creation with Unpredictable 6-char Code
  let roomCode = '';
  const hostId = 'host_' + Math.random().toString(36).slice(2, 7);
  await test('Private Match: Creates room with unpredictable 6-char FVH-XXXX code', async () => {
    const res = await api('/api/room/create', 'POST', {
      hostId,
      hostName: 'RoomMaster',
      mode: 'footy',
      minutes: 2
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.ok, true);
    assert(res.data.roomCode, 'Must return roomCode');
    roomCode = res.data.roomCode;
    assert(/^FVH-[2-9A-Z]{4}$/.test(roomCode), `Code ${roomCode} must follow FVH-XXXX pattern`);

    const st = await api(`/api/room/status?code=${roomCode}`);
    assert.strictEqual(st.data.status, 'waiting');
    assert.strictEqual(st.data.room.host.name, 'RoomMaster');
  });

  // Test 4: Private Match Joining & Case-Insensitive Normalization
  const guestId = 'guest_' + Math.random().toString(36).slice(2, 7);
  await test('Private Match: Friend joins using normalized code and activates room', async () => {
    // Join with lowercase unhyphenated code
    const rawJoinCode = roomCode.replace('FVH-', '').toLowerCase();
    const joinRes = await api('/api/room/join', 'POST', {
      code: rawJoinCode,
      guestId,
      guestName: 'ChallengerTwo'
    });
    assert.strictEqual(joinRes.status, 200);
    assert.strictEqual(joinRes.data.ok, true);
    assert.strictEqual(joinRes.data.role, 'guest');
    assert.strictEqual(joinRes.data.room.guest.name, 'ChallengerTwo');

    // Host status check
    const st = await api(`/api/room/status?code=${roomCode}`);
    assert.strictEqual(st.data.status, 'ready');
    assert.strictEqual(st.data.guest.name, 'ChallengerTwo');
  });

  // Test 5: Reject Full Private Rooms
  await test('Private Match: Rejects third player with 409 room_full', async () => {
    const thirdId = 'p3_' + Math.random().toString(36).slice(2, 7);
    const res = await api('/api/room/join', 'POST', {
      code: roomCode,
      guestId: thirdId,
      guestName: 'ThirdWheel'
    });
    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.data.ok, false);
    assert.strictEqual(res.data.error, 'room_full');
  });

  // Test 6: Reject Invalid Room Codes
  await test('Private Match: Rejects invalid room code with 404 room_not_found', async () => {
    const res = await api('/api/room/join', 'POST', {
      code: 'FVH-ZZZZ',
      guestId: 'someone'
    });
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.data.error, 'room_not_found');
  });

  // Test 7: Real-time State & Input Relay
  await test('State Synchronization: Relay packets exchange snapshots and inputs', async () => {
    // Host sends game snapshot
    const snapData = { t: 1.5, sc: [1, 0], tl: 118.5, mph: 'regular', a: [[0, 0, 1, 0]], b: [0, 0, 0] };
    const sendSnap = await api('/api/match/relay', 'POST', {
      matchId: roomCode,
      role: 'host',
      type: 'snap',
      data: snapData
    });
    assert.strictEqual(sendSnap.status, 200);

    // Guest receives snapshot
    const getGuestRelay = await api(`/api/match/relay?matchId=${roomCode}&role=guest`);
    assert.strictEqual(getGuestRelay.status, 200);
    assert(getGuestRelay.data.messages.length >= 1);
    assert.strictEqual(getGuestRelay.data.messages[0].type, 'snap');
    assert.deepStrictEqual(getGuestRelay.data.messages[0].data.sc, [1, 0]);

    // Guest sends input
    const inputData = { moveX: 0.8, moveZ: -0.5, sprint: true, shootHeld: false };
    const sendInput = await api('/api/match/relay', 'POST', {
      matchId: roomCode,
      role: 'guest',
      type: 'in',
      data: inputData
    });
    assert.strictEqual(sendInput.status, 200);

    // Host receives input
    const getHostRelay = await api(`/api/match/relay?matchId=${roomCode}&role=host`);
    assert(getHostRelay.data.messages.length >= 1);
    assert.strictEqual(getHostRelay.data.messages[0].type, 'in');
    assert.strictEqual(getHostRelay.data.messages[0].data.sprint, true);
  });

  // Test 8: Overtime & Sudden Death Event Synchronization
  await test('Overtime & Sudden Death: Phase transitions and events synchronized', async () => {
    // Emulate regulation tie -> Overtime (30s)
    const otSnap = { t: 120, sc: [2, 2], tl: 30, mph: 'overtime' };
    await api('/api/match/relay', 'POST', { matchId: roomCode, role: 'host', type: 'snap', data: otSnap });
    await api('/api/match/relay', 'POST', { matchId: roomCode, role: 'host', type: 'ev', data: [{ type: 'overtime' }] });

    const guestOT = await api(`/api/match/relay?matchId=${roomCode}&role=guest`);
    assert(guestOT.data.messages.some(m => m.data && m.data.mph === 'overtime'));
    assert(guestOT.data.messages.some(m => Array.isArray(m.data) && m.data[0].type === 'overtime'));

    // Emulate Overtime tie -> Sudden Death
    const sdSnap = { t: 150, sc: [2, 2], tl: 0, mph: 'suddendeath' };
    await api('/api/match/relay', 'POST', { matchId: roomCode, role: 'host', type: 'snap', data: sdSnap });
    await api('/api/match/relay', 'POST', { matchId: roomCode, role: 'host', type: 'ev', data: [{ type: 'suddenDeath' }] });

    const guestSD = await api(`/api/match/relay?matchId=${roomCode}&role=guest`);
    assert(guestSD.data.messages.some(m => m.data && m.data.mph === 'suddendeath'));
  });

  // Test 9: Authoritative Match Completion & Reward Verification
  let verifiedToken = '';
  await test('Authoritative Match Completion: Server records single official result', async () => {
    const compRes = await api('/api/match/complete', 'POST', {
      matchId: roomCode,
      playerId: hostId,
      finalScore: [3, 2],
      winner: 0,
      phase: 'suddendeath',
      stats: { humanGoals: 3, humanTackles: 4 }
    });
    assert.strictEqual(compRes.status, 200);
    assert.strictEqual(compRes.data.ok, true);
    assert(compRes.data.matchToken, 'Must issue matchToken');
    verifiedToken = compRes.data.matchToken;
    assert.strictEqual(compRes.data.winner, 0);
    assert.strictEqual(compRes.data.phase, 'suddendeath');

    // Second report returns same official record (idempotency)
    const secondReport = await api('/api/match/complete', 'POST', {
      matchId: roomCode,
      playerId: guestId,
      finalScore: [3, 2],
      winner: 0,
      phase: 'suddendeath'
    });
    assert.strictEqual(secondReport.data.alreadyCompleted, true);
    assert.strictEqual(secondReport.data.matchToken, verifiedToken);
  });

  // Test 10: Server-Authoritative Reward Claim with Match Token
  await test('Reward Validation: Claims coins with verified matchToken, rejects duplicate', async () => {
    // Verified Winner Claim
    const claimRes = await api('/api/economy/reward', 'POST', {
      playerId: hostId,
      rewardType: 'match',
      matchId: roomCode,
      matchToken: verifiedToken,
      onlineMatch: true,
      meta: { mode: 'footy', outcome: 'win', difficulty: 'normal', goals: 3, tackles: 4 }
    });
    assert.strictEqual(claimRes.status, 200);
    assert.strictEqual(claimRes.data.ok, true);
    assert(claimRes.data.coinsEarned > 50, 'Winner receives proper match coins');
    assert.strictEqual(claimRes.data.outcome, 'win');

    // Reject Duplicate Claim
    const dupRes = await api('/api/economy/reward', 'POST', {
      playerId: hostId,
      rewardType: 'match',
      matchId: roomCode,
      matchToken: verifiedToken,
      onlineMatch: true,
      meta: { mode: 'footy', outcome: 'win' }
    });
    assert.strictEqual(dupRes.status, 400);
    assert.strictEqual(dupRes.data.error, 'match_already_rewarded');

    // Reject Fabricated Match Token
    const fakeRes = await api('/api/economy/reward', 'POST', {
      playerId: 'scammer_player',
      rewardType: 'match',
      matchId: roomCode,
      matchToken: 'mtok_fake_token_123',
      onlineMatch: true
    });
    assert.strictEqual(fakeRes.status, 403);
    assert.strictEqual(fakeRes.data.error, 'invalid_match_token');
  });

  // Test 11: Opponent Disconnect & Forfeit Victory
  await test('Forfeits & Recovery: Handles opponent disconnect and awards verified win', async () => {
    // Create new private match for forfeit test
    const h2 = 'host_forfeit_' + Math.random().toString(36).slice(2, 6);
    const g2 = 'guest_forfeit_' + Math.random().toString(36).slice(2, 6);
    const rRes = await api('/api/room/create', 'POST', { hostId: h2, hostName: 'SteadfastHost', mode: 'hoops' });
    const fRoomCode = rRes.data.roomCode;
    await api('/api/room/join', 'POST', { code: fRoomCode, guestId: g2, guestName: 'RageQuitter' });

    // Guest rage quits / disconnects
    const forfeitRes = await api('/api/match/forfeit', 'POST', {
      matchId: fRoomCode,
      playerId: h2,
      reason: 'opponent_left'
    });
    assert.strictEqual(forfeitRes.status, 200);
    assert.strictEqual(forfeitRes.data.ok, true);
    assert.strictEqual(forfeitRes.data.winner, 0);
    assert.strictEqual(forfeitRes.data.outcome, 'forfeit');
    assert(forfeitRes.data.matchToken, 'Must generate verified forfeit matchToken');

    // Host claims forfeit win reward
    const fClaim = await api('/api/economy/reward', 'POST', {
      playerId: h2,
      rewardType: 'match',
      matchId: fRoomCode,
      matchToken: forfeitRes.data.matchToken,
      onlineMatch: true,
      meta: { mode: 'hoops', outcome: 'win' }
    });
    assert.strictEqual(fClaim.status, 200);
    assert.strictEqual(fClaim.data.ok, true);
    assert(fClaim.data.coinsEarned > 0);
  });

  // Test 12: Host Departure Marks Room Abandoned
  await test('Host Departure: Leaving private room marks it abandoned with 410 on join', async () => {
    const h3 = 'host_leave_' + Math.random().toString(36).slice(2, 6);
    const rRes = await api('/api/room/create', 'POST', { hostId: h3, hostName: 'LeavingHost', mode: 'footy' });
    const cCode = rRes.data.roomCode;

    // Host cancels room
    const cancelRes = await api('/api/room/cancel', 'POST', { code: cCode, hostId: h3 });
    assert.strictEqual(cancelRes.status, 200);

    // Friend tries to join abandoned room
    const joinRes = await api('/api/room/join', 'POST', { code: cCode, guestId: 'late_guest' });
    assert.strictEqual(joinRes.status, 410);
    assert.strictEqual(joinRes.data.error, 'room_closed');
  });

  console.log(`\nMultiplayer Test Results: ${passed}/${total} passed.`);
  if (passed === total) {
    console.log('ALL PROMPT 5 MULTIPLAYER REQUIREMENTS FULLY VERIFIED!\n');
    process.exit(0);
  } else {
    console.error('SOME MULTIPLAYER TESTS FAILED!\n');
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Unexpected test error:', err);
  process.exit(1);
});
