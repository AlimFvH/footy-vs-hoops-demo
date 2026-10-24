const http = require('http');
const net = require('net');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';
const SERVER_PORT = 8099;

function request(method, reqPath, body) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: '127.0.0.1',
      port: SERVER_PORT,
      path: reqPath,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {})
      }
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
    if (postData) req.write(postData);
    req.end();
  });
}

function connectWs(pathQuery) {
  return new Promise((resolve, reject) => {
    const key = crypto.randomBytes(16).toString('base64');
    const socket = net.connect(SERVER_PORT, '127.0.0.1', () => {
      socket.write(
        `GET ${pathQuery} HTTP/1.1\r\n` +
        `Host: 127.0.0.1:${SERVER_PORT}\r\n` +
        `Upgrade: websocket\r\n` +
        `Connection: Upgrade\r\n` +
        `Sec-WebSocket-Key: ${key}\r\n` +
        `Sec-WebSocket-Version: 13\r\n\r\n`
      );
    });

    let handshakeDone = false;
    let dataBuffer = Buffer.alloc(0);

    socket.on('data', chunk => {
      dataBuffer = Buffer.concat([dataBuffer, chunk]);
      if (!handshakeDone) {
        const headerStr = dataBuffer.toString('utf8');
        if (headerStr.includes('\r\n\r\n')) {
          handshakeDone = true;
          resolve({ socket, buffer: dataBuffer });
        }
      }
    });

    socket.on('error', reject);
  });
}

async function runAudit() {
  console.log('=== Stage E: Online Multiplayer, Anti-Cheat & Security Invariants Audit ===\n');
  const findings = {};

  // 1. Invariant: Season 1 State & Points
  console.log('--- 1. Testing Season 1 Prelaunch Invariant ---');
  const seasonRes = await request('GET', '/api/season/status');
  console.log('Season status response:', seasonRes.body);
  assert.strictEqual(seasonRes.body.seasonState, 'prelaunch', 'Season state must be prelaunch');
  assert.strictEqual(seasonRes.body.seasonActive, false, 'Season 1 must NOT be active');
  findings.seasonPrelaunch = {
    state: seasonRes.body.seasonState,
    active: seasonRes.body.seasonActive,
    pass: true
  };

  // 2. Invariant: AI matches award 0 seasonal points
  console.log('\n--- 2. Testing AI Match 0 Seasonal Points Invariant ---');
  const testPlayerId = 'audit_player_' + Date.now();
  // First, select team
  const teamRes = await request('POST', '/api/profile/select-team', {
    playerId: testPlayerId,
    team: 'footy',
    character: 'footy'
  });
  console.log('Player team selection response:', teamRes.body);
  assert.strictEqual(teamRes.body.ok, true);

  // Attempt to claim AI match reward
  const aiMatchId = 'ai_match_' + Date.now();
  const aiReward = await request('POST', '/api/economy/reward', {
    playerId: testPlayerId,
    rewardType: 'match',
    matchId: aiMatchId,
    onlineMatch: false,
    meta: { mode: 'footy', outcome: 'win' }
  });
  console.log('AI reward response:', aiReward.body);
  assert.strictEqual(aiReward.body.ok, true);
  // Verify seasonal points awarded: 0
  const profileRes = await request('GET', `/api/profile?playerId=${testPlayerId}`);
  const seasonPoints = profileRes.body.seasonPoints || 0;
  console.log(`Player seasonal points after AI win: ${seasonPoints}`);
  assert.strictEqual(seasonPoints, 0, 'AI matches must award exactly 0 seasonal points in prelaunch');
  findings.aiSeasonalPointsZero = { seasonPoints, pass: seasonPoints === 0 };

  // 3. Invariant: Permanent Side Lock (Immutable Team Selection)
  console.log('\n--- 3. Testing Permanent Side Selection Lock ---');
  const teamChangeAttempt = await request('POST', '/api/profile/select-team', {
    playerId: testPlayerId,
    team: 'hoops',
    character: 'hoops'
  });
  console.log('Team change attempt response (Status ' + teamChangeAttempt.status + '):', teamChangeAttempt.body);
  assert(teamChangeAttempt.status === 400 || teamChangeAttempt.status === 403, 'Server must reject changing team once chosen');
  assert(teamChangeAttempt.body.error === 'team_already_locked' || teamChangeAttempt.body.error === 'team_already_chosen');
  findings.permanentTeamLock = {
    rejectedStatus: teamChangeAttempt.status,
    rejectedError: teamChangeAttempt.body.error,
    pass: true
  };

  // 4. Invariant: Online Multiplayer Matchmaking & WebSocket Signaling
  console.log('\n--- 4. Testing Two-Client Real Online Matchmaking & WebSocket Session ---');
  const p1 = 'audit_client1_' + Date.now();
  const p2 = 'audit_client2_' + Date.now();

  const join1 = await request('POST', '/api/matchmaking/join', {
    playerId: p1,
    playerName: 'Player One',
    character: 'footy',
    mode: 'footy'
  });
  assert.strictEqual(join1.body.status, 'searching');

  const join2 = await request('POST', '/api/matchmaking/join', {
    playerId: p2,
    playerName: 'Player Two',
    character: 'hoops',
    mode: 'footy'
  });
  assert.strictEqual(join2.body.status, 'matched');
  const matchId = join2.body.matchId;

  // Poll client 1
  const poll1 = await request('GET', `/api/matchmaking/poll?playerId=${p1}`);
  assert.strictEqual(poll1.body.matchId, matchId);

  // Connect both to WebSocket channel
  const ws1 = await connectWs(`/ws/match?matchId=${matchId}&role=host`);
  const ws2 = await connectWs(`/ws/match?matchId=${matchId}&role=guest`);
  console.log(`Matched room: ${matchId}`);
  console.log('Both clients connected to native WebSocket channel.');

  findings.multiplayerMatchmaking = {
    matchId,
    hostConnected: Boolean(ws1.socket),
    guestConnected: Boolean(ws2.socket),
    pass: true
  };

  // 5. Invariant: Authoritative Cryptographic Match Token & Anti-Replay
  console.log('\n--- 5. Testing Cryptographic Match Token Issuance & Replay Prevention ---');
  const completeRes = await request('POST', '/api/match/complete', {
    matchId,
    playerId: p1,
    finalScore: [4, 2],
    winner: 0,
    phase: 'regulation',
    stats: { humanGoals: 4 }
  });
  assert.strictEqual(completeRes.body.ok, true);
  assert(completeRes.body.matchToken, 'Cryptographic token must be issued');
  const token = completeRes.body.matchToken;

  // Claim reward with valid token
  const claim1 = await request('POST', '/api/economy/reward', {
    playerId: p1,
    rewardType: 'match',
    matchId,
    matchToken: token,
    onlineMatch: true,
    meta: { mode: 'footy', outcome: 'win' }
  });
  assert.strictEqual(claim1.body.ok, true);
  assert.strictEqual(claim1.body.coinsEarned, 20);

  // Attempt duplicate reward claim with same token
  const claim2 = await request('POST', '/api/economy/reward', {
    playerId: p1,
    rewardType: 'match',
    matchId,
    matchToken: token,
    onlineMatch: true,
    meta: { mode: 'footy', outcome: 'win' }
  });
  console.log('Duplicate claim response (Status ' + claim2.status + '):', claim2.body);
  assert.strictEqual(claim2.status, 400);
  assert.strictEqual(claim2.body.error, 'match_already_rewarded');

  // Attempt forged/fake token claim
  const fakeClaim = await request('POST', '/api/economy/reward', {
    playerId: p1,
    rewardType: 'match',
    matchId: 'forged_match_' + Date.now(),
    matchToken: 'forged_invalid_signature_token',
    onlineMatch: true,
    meta: { mode: 'footy', outcome: 'win' }
  });
  console.log('Forged token claim response (Status ' + fakeClaim.status + '):', fakeClaim.body);
  assert.strictEqual(fakeClaim.status, 403);
  assert.strictEqual(fakeClaim.body.error, 'invalid_match_token');

  findings.antiCheatAndTokens = {
    tokenGenerated: Boolean(token),
    claim1Coins: claim1.body.coinsEarned,
    duplicateRejected: claim2.body.error === 'match_already_rewarded',
    forgedTokenRejected: fakeClaim.body.error === 'invalid_match_token',
    pass: true
  };

  // Close sockets
  ws1.socket.destroy();
  ws2.socket.destroy();

  // Save audit findings
  fs.writeFileSync(path.join(artifactDir, 'stage_e_security_audit.json'), JSON.stringify(findings, null, 2));

  console.log('\n=============================================================');
  console.log('ALL ONLINE MULTIPLAYER, ANTI-CHEAT & INVARIANTS PASS 100%!');
  console.log('=============================================================');
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
