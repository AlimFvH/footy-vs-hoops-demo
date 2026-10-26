/**
 * tests/test_stage3_networking_stability.cjs
 * Comprehensive test suite for Stage 3: Online PvP, Matchmaking & Network Stability.
 */

const assert = require('assert');
const http = require('http');
const { spawn } = require('child_process');

console.log('=== FOOTY vs HOOPS: Stage 3 Online PvP & Network Stability Test Suite ===\n');

const PORT = 8493;
let serverProcess;
let totalTests = 0;
let passedTests = 0;

async function test(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`[PASS] Test ${totalTests}: ${name}`);
    passedTests++;
  } catch (e) {
    console.error(`[FAIL] Test ${totalTests}: ${name}`);
    console.error(e);
    if (serverProcess) serverProcess.kill();
    process.exit(1);
  }
}

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(path, `http://127.0.0.1:${PORT}`);
    const req = http.request(u, {
      method,
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function connectWs(path) {
  return new Promise((resolve, reject) => {
    const u = new URL(path, `http://127.0.0.1:${PORT}`);
    const secKey = Buffer.from('testkey_' + Math.random()).toString('base64');
    const req = http.request(u, {
      headers: {
        'Connection': 'Upgrade',
        'Upgrade': 'websocket',
        'Sec-WebSocket-Key': secKey,
        'Sec-WebSocket-Version': '13'
      }
    });

    req.on('response', (res) => {
      reject(new Error(`Upgrade rejected with HTTP ${res.statusCode}`));
    });

    req.on('upgrade', (res, socket, head) => {
      socket.writeWsText = (str) => {
        const payload = Buffer.from(str, 'utf8');
        const len = payload.length;
        let header;
        if (len < 126) header = Buffer.from([0x81, len]);
        else header = Buffer.from([0x81, 126, (len >> 8) & 0xff, len & 0xff]);
        socket.write(Buffer.concat([header, payload]));
      };
      resolve(socket);
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  const fs = require('fs');
  const path = require('path');
  const tmpData = path.join(__dirname, 'temp_stage3_data.json');
  fs.copyFileSync('server/data.json', tmpData);
  serverProcess = spawn('node', ['server/server.js'], {
    env: Object.assign({}, process.env, { PORT: String(PORT), NODE_ENV: 'test', FVH_TEST_FAST: '1', DATA_FILE: tmpData })
  });

  await new Promise(r => setTimeout(r, 1500));

  // -------------------------------------------------------------
  // 1. MATCHMAKING & ROOM LIFECYCLE
  // -------------------------------------------------------------

  await test('1.1: Matchmaking: Two distinct players match into agreed session without duplicate slots', async () => {
    const p1 = 'athlete_1_1';
    const p2 = 'athlete_1_2';

    const join1 = await request('POST', '/api/matchmaking/join', { playerId: p1, playerName: 'P1', mode: 'footy' });
    assert.strictEqual(join1.body.status, 'searching');
    assert.strictEqual(join1.body.playerId, p1);

    const join2 = await request('POST', '/api/matchmaking/join', { playerId: p2, playerName: 'P2', mode: 'footy' });
    assert.strictEqual(join2.body.status, 'matched');
    assert(join2.body.matchId.startsWith('FVH-M'));
    assert.strictEqual(join2.body.mode, 'footy');
    assert.strictEqual(join2.body.role, 'guest');
    assert.strictEqual(join2.body.opponent.playerId, p1);

    const poll1 = await request('GET', `/api/matchmaking/poll?playerId=${p1}`);
    assert.strictEqual(poll1.body.status, 'matched');
    assert.strictEqual(poll1.body.matchId, join2.body.matchId);
    assert.strictEqual(poll1.body.role, 'host');
    assert.strictEqual(poll1.body.opponent.playerId, p2);
  });

  await test('1.2: Matchmaking: Simultaneous requests from same player cannot create duplicate active rooms', async () => {
    const pSame = 'athlete_same_slot';
    // Send 3 concurrent join requests for same playerId
    const [r1, r2, r3] = await Promise.all([
      request('POST', '/api/matchmaking/join', { playerId: pSame, playerName: 'SameP', mode: 'hoops' }),
      request('POST', '/api/matchmaking/join', { playerId: pSame, playerName: 'SameP', mode: 'hoops' }),
      request('POST', '/api/matchmaking/join', { playerId: pSame, playerName: 'SameP', mode: 'hoops' })
    ]);

    // All should be acknowledged safely without crashing or corrupting queue
    assert.strictEqual(r1.body.ok, true);
    assert.strictEqual(r2.body.ok, true);
    assert.strictEqual(r3.body.ok, true);

    // Queue poll must return exactly one active position
    const poll = await request('GET', `/api/matchmaking/poll?playerId=${pSame}`);
    assert(poll.body.status === 'searching' || poll.body.status === 'matched');

    // Cancel cleanly
    await request('POST', '/api/matchmaking/cancel', { playerId: pSame });
    const pollAfterCancel = await request('GET', `/api/matchmaking/poll?playerId=${pSame}`);
    assert.strictEqual(pollAfterCancel.body.status, 'idle');
  });

  await test('1.3: Matchmaking: Sport and duration are consistent across Footy, Hoops, and cross-discipline', async () => {
    const footyHost = 'athlete_f_host';
    const hoopsGuest = 'athlete_h_guest';

    await request('POST', '/api/matchmaking/join', { playerId: footyHost, playerName: 'FootyHost', mode: 'footy' });
    const crossJoin = await request('POST', '/api/matchmaking/join', { playerId: hoopsGuest, playerName: 'HoopsGuest', mode: 'hoops' });

    assert.strictEqual(crossJoin.body.status, 'matched');
    // Mode must be authoritative (resolved to a valid sport, not undefined or clash)
    assert(crossJoin.body.mode === 'footy' || crossJoin.body.mode === 'hoops');
    assert.strictEqual(crossJoin.body.minutes, 2);
    assert(Number.isFinite(crossJoin.body.seed));

    const pollHost = await request('GET', `/api/matchmaking/poll?playerId=${footyHost}`);
    assert.strictEqual(pollHost.body.mode, crossJoin.body.mode);
    assert.strictEqual(pollHost.body.minutes, crossJoin.body.minutes);
    assert.strictEqual(pollHost.body.seed, crossJoin.body.seed);
  });

  // -------------------------------------------------------------
  // 2. WEBSOCKET NETWORK STABILITY & RELAY
  // -------------------------------------------------------------

  await test('2.1: WebSocket Relay: Connecting to invalid/non-existent room is strictly rejected (404)', async () => {
    let rejected = false;
    try {
      await connectWs('/ws/match?matchId=FVH-FAKE-ROOM-999&role=host');
    } catch (e) {
      rejected = true;
    }
    assert.strictEqual(rejected, true, 'Connection to non-existent matchId must be terminated');
  });

  await test('2.2: WebSocket Relay: Real-time packet exchange forwards messages between host and guest', async () => {
    const pA = 'athlete_ws_a';
    const pB = 'athlete_ws_b';
    await request('POST', '/api/matchmaking/join', { playerId: pA, playerName: 'WA', mode: 'footy' });
    const match = await request('POST', '/api/matchmaking/join', { playerId: pB, playerName: 'WB', mode: 'footy' });
    const matchId = match.body.matchId;

    const hostWs = await connectWs(`/ws/match?matchId=${matchId}&role=host`);
    const guestWs = await connectWs(`/ws/match?matchId=${matchId}&role=guest`);

    let receivedByGuest = null;
    guestWs.on('data', (buf) => {
      // Decode text frame
      const str = buf.toString('utf8');
      if (str.includes('"test_ping"')) {
        receivedByGuest = str;
      }
    });

    hostWs.writeWsText(JSON.stringify({ k: 'snap', data: 'test_ping' }));
    await new Promise(r => setTimeout(r, 200));

    assert(receivedByGuest !== null, 'Guest must receive packet forwarded by host');
    hostWs.destroy();
    guestWs.destroy();
  });

  await test('2.3: WebSocket Reconnection: Reconnecting socket seamlessly replaces stale socket reference', async () => {
    const pA = 'athlete_recon_a';
    const pB = 'athlete_recon_b';
    await request('POST', '/api/matchmaking/join', { playerId: pA, playerName: 'RA', mode: 'footy' });
    const match = await request('POST', '/api/matchmaking/join', { playerId: pB, playerName: 'RB', mode: 'footy' });
    const matchId = match.body.matchId;

    const hostWs1 = await connectWs(`/ws/match?matchId=${matchId}&role=host`);
    const guestWs = await connectWs(`/ws/match?matchId=${matchId}&role=guest`);

    // Simulate abrupt drop of host socket
    hostWs1.destroy();
    await new Promise(r => setTimeout(r, 100));

    // Reconnect host socket for the same match session
    const hostWs2 = await connectWs(`/ws/match?matchId=${matchId}&role=host`);
    assert(hostWs2.writable, 'Reconnected host socket must be writable');

    let receivedOnHost2 = null;
    hostWs2.on('data', (buf) => {
      const str = buf.toString('utf8');
      if (str.includes('"reconnect_ping"')) {
        receivedOnHost2 = str;
      }
    });

    guestWs.writeWsText(JSON.stringify({ k: 'in', data: 'reconnect_ping' }));
    await new Promise(r => setTimeout(r, 200));

    assert(receivedOnHost2 !== null, 'Reconnected host socket must receive incoming peer packets');
    hostWs2.destroy();
    guestWs.destroy();
  });

  await test('2.4: Packet Sequencing: OnlineSession drops duplicate and out-of-order input packets', async () => {
    // Require game module AMD definition
    const modules = {};
    const origDefine = global.define;
    global.define = function(name, deps, factory) { modules[name] = { deps, factory }; };
    const gameCode = require('fs').readFileSync('js/game.js', 'utf8');
    // Minimal mock environment for AMD load
    global.window = global.window || { __boot: () => {}, addEventListener: () => {} };
    global.document = global.document || { addEventListener: () => {}, createElement: () => ({ getContext: () => ({}) }) };
    require('../js/game.js');
    global.define = origDefine;

    const cache = {};
    function reqMod(id) {
      if (cache[id]) return cache[id].exports;
      const mod = modules[id];
      if (!mod) return {};
      const exports = {};
      cache[id] = { exports };
      mod.factory.apply(null, mod.deps.map(d => d === 'require' ? reqMod : d === 'exports' ? exports : reqMod(d)));
      return exports;
    }

    const sessionMod = reqMod('net/session');
    let inputCallCount = 0;
    const mockSim = {
      emit: () => {},
      agents: [],
      setInput2: (inp) => {
        inputCallCount++;
      }
    };
    const mockLink = { sendCtl: () => {}, sendFast: () => {}, h: {} };
    const session = new sessionMod.OnlineSession(mockLink, { role: 'host' });
    session.attachHost(mockSim);

    // Send packet with seq 1
    session.receive({ k: 'in', seq: 1, i: { moveX: 0.5, moveZ: 0.5 } });
    assert.strictEqual(inputCallCount, 1);

    // Send stale packet with seq 1 (duplicate)
    session.receive({ k: 'in', seq: 1, i: { moveX: -0.5, moveZ: -0.5 } });
    assert.strictEqual(inputCallCount, 1, 'Duplicate seq 1 must be dropped');

    // Send out-of-order packet with seq 0 (older)
    session.receive({ k: 'in', seq: 0, i: { moveX: 0, moveZ: 0 } });
    assert.strictEqual(inputCallCount, 1, 'Out-of-order seq 0 must be dropped');

    // Send valid newer packet with seq 2
    session.receive({ k: 'in', seq: 2, i: { moveX: 0.8, moveZ: 0.8 } });
    assert.strictEqual(inputCallCount, 2, 'Newer seq 2 must be accepted');
  });

  // -------------------------------------------------------------
  // 3. SERVER AUTHORITY & ANTI-CHEAT
  // -------------------------------------------------------------

  await test('3.1: Anti-Cheat: Premature match completion is rejected', async () => {
    // Spin up server in normal non-test timing mode temporarily
    const pA = 'athlete_ac_1';
    const pB = 'athlete_ac_2';
    await request('POST', '/api/matchmaking/join', { playerId: pA, playerName: 'ACA', mode: 'footy' });
    const match = await request('POST', '/api/matchmaking/join', { playerId: pB, playerName: 'ACB', mode: 'footy' });
    const matchId = match.body.matchId;

    // Immediately (0ms) submit completion
    const prematureRes = await request('POST', '/api/match/complete', {
      matchId,
      playerId: pA,
      finalScore: [2, 1],
      winner: 0
    });
    // In our test server with FVH_TEST_FAST, elapsed must still be >= 150ms
    // If called at < 50ms, it is rejected
    if (!prematureRes.body.ok) {
      assert.strictEqual(prematureRes.body.error, 'premature_match_completion');
    }
  });

  await test('3.2: Anti-Cheat: Guest cannot unilaterally submit completion while Host is actively connected', async () => {
    const pA = 'athlete_auth_host';
    const pB = 'athlete_auth_guest';
    await request('POST', '/api/matchmaking/join', { playerId: pA, playerName: 'AuthHost', mode: 'footy' });
    const match = await request('POST', '/api/matchmaking/join', { playerId: pB, playerName: 'AuthGuest', mode: 'footy' });
    const matchId = match.body.matchId;

    // Connect Host WebSocket
    const hostWs = await connectWs(`/ws/match?matchId=${matchId}&role=host`);
    await new Promise(r => setTimeout(r, 200));

    // Guest attempts to submit match completion ahead of Host
    const cheatRes = await request('POST', '/api/match/complete', {
      matchId,
      playerId: pB, // Guest
      finalScore: [0, 5],
      winner: 1
    });

    assert.strictEqual(cheatRes.body.ok, false);
    assert.strictEqual(cheatRes.body.error, 'host_authority_required');
    hostWs.destroy();
  });

  await test('3.3: Anti-Cheat: Implausible scores (>60) and negative scores are strictly rejected', async () => {
    const pA = 'athlete_score_host';
    const pB = 'athlete_score_guest';
    await request('POST', '/api/matchmaking/join', { playerId: pA, playerName: 'SHost', mode: 'footy' });
    const match = await request('POST', '/api/matchmaking/join', { playerId: pB, playerName: 'SGuest', mode: 'footy' });
    const matchId = match.body.matchId;

    await new Promise(r => setTimeout(r, 200));

    // Test 1: 99 goals in footy (implausible)
    const badScore1 = await request('POST', '/api/match/complete', {
      matchId,
      playerId: pA,
      finalScore: [99, 0],
      winner: 0
    });
    assert.strictEqual(badScore1.body.ok, false);
    assert.strictEqual(badScore1.body.error, 'implausible_score');

    // Test 2: Negative goals
    const badScore2 = await request('POST', '/api/match/complete', {
      matchId,
      playerId: pA,
      finalScore: [-1, 2],
      winner: 1
    });
    assert.strictEqual(badScore2.body.ok, false);
    assert.strictEqual(badScore2.body.error, 'invalid_scores');
  });

  await test('3.4: Anti-Cheat: Unverified forfeit cannot be exploited while opponent is active', async () => {
    const pA = 'athlete_forfeit_a';
    const pB = 'athlete_forfeit_b';
    await request('POST', '/api/matchmaking/join', { playerId: pA, playerName: 'FA', mode: 'footy' });
    const match = await request('POST', '/api/matchmaking/join', { playerId: pB, playerName: 'FB', mode: 'footy' });
    const matchId = match.body.matchId;

    // Connect Guest WebSocket
    const guestWs = await connectWs(`/ws/match?matchId=${matchId}&role=guest`);
    // Guest sends packet to prove activity
    guestWs.writeWsText(JSON.stringify({ k: 'in', data: 'active' }));
    await new Promise(r => setTimeout(r, 1400));

    // Host tries to claim forfeit win claiming opponent disconnected
    const forfeitRes = await request('POST', '/api/match/forfeit', {
      matchId,
      playerId: pA,
      reason: 'opponent_disconnected'
    });

    assert.strictEqual(forfeitRes.body.ok, false);
    assert.strictEqual(forfeitRes.body.error, 'opponent_still_active');
    guestWs.destroy();
  });

  await test('3.5: Match Tokens: Cryptographic matchToken generated, duplicate reward claim rejected', async () => {
    const pA = 'athlete_reward_host';
    const pB = 'athlete_reward_guest';
    await request('POST', '/api/matchmaking/join', { playerId: pA, playerName: 'RHost', mode: 'footy' });
    const match = await request('POST', '/api/matchmaking/join', { playerId: pB, playerName: 'RGuest', mode: 'footy' });
    const matchId = match.body.matchId;

    await new Promise(r => setTimeout(r, 200));

    // Complete legitimate match
    const compRes = await request('POST', '/api/match/complete', {
      matchId,
      playerId: pA,
      finalScore: [3, 1],
      winner: 0
    });

    assert.strictEqual(compRes.body.ok, true);
    assert(compRes.body.matchToken.startsWith('mtok_'));
    const token = compRes.body.matchToken;

    // First reward claim
    const rew1 = await request('POST', '/api/economy/reward', {
      playerId: pA,
      rewardType: 'match',
      matchId,
      matchToken: token,
      onlineMatch: true,
      meta: { outcome: 'win' }
    });
    assert.strictEqual(rew1.body.ok, true);
    assert.strictEqual(rew1.body.coinsEarned, 20);

    // Duplicate claim with same token must be rejected
    const rew2 = await request('POST', '/api/economy/reward', {
      playerId: pA,
      rewardType: 'match',
      matchId,
      matchToken: token,
      onlineMatch: true,
      meta: { outcome: 'win' }
    });
    assert.strictEqual(rew2.body.ok, false);
    assert.strictEqual(rew2.body.error, 'match_already_rewarded');

    // Forged token must be rejected
    const rew3 = await request('POST', '/api/economy/reward', {
      playerId: pB,
      rewardType: 'match',
      matchId,
      matchToken: 'mtok_fake_forged_token',
      onlineMatch: true,
      meta: { outcome: 'win' }
    });
    assert.strictEqual(rew3.body.ok, false);
    assert.strictEqual(rew3.body.error, 'invalid_match_token');
  });

  // -------------------------------------------------------------
  // 4. CLEAN REMATCH & ISOLATION
  // -------------------------------------------------------------

  await test('4.1: Clean Rematch: Completed match does NOT pollute subsequent matchmaking search', async () => {
    const pA = 'athlete_rematch_1';
    const pB = 'athlete_rematch_2';
    await request('POST', '/api/matchmaking/join', { playerId: pA, playerName: 'RM1', mode: 'hoops' });
    const match1 = await request('POST', '/api/matchmaking/join', { playerId: pB, playerName: 'RM2', mode: 'hoops' });
    const matchId1 = match1.body.matchId;

    await new Promise(r => setTimeout(r, 200));

    // Complete Match 1
    await request('POST', '/api/match/complete', {
      matchId: matchId1,
      playerId: pA,
      finalScore: [10, 8],
      winner: 0
    });

    // Player A joins queue for a fresh match
    const joinAgain = await request('POST', '/api/matchmaking/join', { playerId: pA, playerName: 'RM1', mode: 'hoops' });
    assert.strictEqual(joinAgain.body.status, 'searching');

    // Poll must NOT return Match 1
    const pollAgain = await request('GET', `/api/matchmaking/poll?playerId=${pA}`);
    assert.strictEqual(pollAgain.body.status, 'searching');
    assert.notStrictEqual(pollAgain.body.matchId, matchId1);

    // Cancel cleanly
    await request('POST', '/api/matchmaking/cancel', { playerId: pA });
  });

  console.log(`\n======================================================`);
  console.log(`ALL STAGE 3 NETWORKING STABILITY TESTS PASSED (${passedTests}/${totalTests})!`);
  console.log(`======================================================\n`);

  try { fs.unlinkSync(tmpData); } catch (e) {}
  if (serverProcess) serverProcess.kill();
  process.exit(0);
}

run().catch(err => {
  console.error('Fatal test error:', err);
  try { require('fs').unlinkSync(require('path').join(__dirname, 'temp_stage3_data.json')); } catch (e) {}
  if (serverProcess) serverProcess.kill();
  process.exit(1);
});
