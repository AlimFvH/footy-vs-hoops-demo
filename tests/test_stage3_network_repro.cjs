/**
 * tests/test_stage3_network_repro.cjs
 * Diagnostic reproduction suite for Stage 3 networking, matchmaking, and anti-cheat vulnerabilities.
 */

const assert = require('assert');
const http = require('http');

console.log('=== Stage 3 Network & Matchmaking Vulnerability Reproduction ===\n');

// Import server logic in-process or spin up a test instance
const PORT = 8391;
process.env.PORT = String(PORT);

let serverProcess;

async function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(path, `http://127.0.0.1:${PORT}`);
    const req = http.request(u, {
      method,
      headers: {
        'Content-Type': 'application/json'
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
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  const { spawn } = require('child_process');
  serverProcess = spawn('node', ['server/server.js'], {
    env: Object.assign({}, process.env, { PORT: String(PORT), FVH_TEST_FAST: '1', NODE_ENV: 'test' })
  });

  await new Promise(r => setTimeout(r, 1500));

  console.log('Test Server running on port', PORT);

  try {
    // -------------------------------------------------------------
    // BUG 1: Stale match returned on subsequent matchmaking poll
    // -------------------------------------------------------------
    console.log('\n[REPRO 1] Checking Stale Match Reuse Bug...');
    // Player A joins
    const joinA = await request('POST', '/api/matchmaking/join', {
      playerId: 'athlete_repro_1',
      playerName: 'Player A',
      mode: 'footy'
    });
    // Player B joins -> match created
    const joinB = await request('POST', '/api/matchmaking/join', {
      playerId: 'athlete_repro_2',
      playerName: 'Player B',
      mode: 'footy'
    });
    assert.strictEqual(joinB.body.status, 'matched');
    const matchId1 = joinB.body.matchId;
    console.log('  Initial match created:', matchId1);

    // Wait for minimum elapsed test time
    await new Promise(r => setTimeout(r, 200));

    // Complete the match
    const compRes = await request('POST', '/api/match/complete', {
      matchId: matchId1,
      playerId: 'athlete_repro_1',
      finalScore: [2, 1],
      winner: 0
    });
    console.log('  Match 1 completed:', compRes.body);

    // Now Player A wants to play a NEW match
    const joinA2 = await request('POST', '/api/matchmaking/join', {
      playerId: 'athlete_repro_1',
      playerName: 'Player A',
      mode: 'footy'
    });
    console.log('  Player A joined queue for Match 2. Status:', joinA2.body.status);

    // Player A polls matchmaking status
    const pollA = await request('GET', `/api/matchmaking/poll?playerId=athlete_repro_1&ticketId=${joinA2.body.ticketId}`);
    console.log('  Player A poll result:', pollA.body);

    if (pollA.body.status === 'matched' && pollA.body.matchId === matchId1) {
      console.log('  => CONFIRMED BUG 1: Server returned STALE already-completed match (' + matchId1 + ') instead of searching!');
    } else {
      console.log('  => Status:', pollA.body.status);
    }

    // Clean up Player A from queue
    await request('POST', '/api/matchmaking/cancel', { playerId: 'athlete_repro_1', ticketId: joinA2.body.ticketId });

    // -------------------------------------------------------------
    // BUG 2: Instant / Fabricated Match Completion by Unauthorized Guest
    // -------------------------------------------------------------
    console.log('\n[REPRO 2] Checking Instant Fabricated Match Completion Vulnerability...');
    // Create match between X and Y
    const joinX = await request('POST', '/api/matchmaking/join', { playerId: 'athlete_x', playerName: 'Host X', mode: 'footy' });
    const joinY = await request('POST', '/api/matchmaking/join', { playerId: 'athlete_y', playerName: 'Guest Y', mode: 'footy' });
    const matchId2 = joinY.body.matchId;
    console.log('  Match 2 created:', matchId2, 'Status:', joinY.body.status);

    // Immediately (0ms after match creation), Guest Y submits a 99-0 win
    const cheatComp = await request('POST', '/api/match/complete', {
      matchId: matchId2,
      playerId: 'athlete_y', // guest
      finalScore: [0, 99],
      winner: 1, // guest claims win
      phase: 'regulation'
    });
    console.log('  Guest submitted 99-0 win 50ms into match:', cheatComp.body);
    if (cheatComp.body.ok && cheatComp.body.matchToken) {
      console.log('  => CONFIRMED BUG 2: Guest was able to immediately fabricate match results & claim win token!');
    }

    // -------------------------------------------------------------
    // BUG 3: Unverified Forfeit Endpoint Exploitation
    // -------------------------------------------------------------
    console.log('\n[REPRO 3] Checking Forfeit Endpoint Exploitation...');
    const joinM = await request('POST', '/api/matchmaking/join', { playerId: 'athlete_m', playerName: 'Host M', mode: 'footy' });
    const joinN = await request('POST', '/api/matchmaking/join', { playerId: 'athlete_n', playerName: 'Guest N', mode: 'footy' });
    const matchId3 = joinN.body.matchId;
    console.log('  Match 3 created:', matchId3, 'Status:', joinN.body.status);

    // Host M calls forfeit right away claiming opponent disconnected (even though N is active)
    const exploitForfeit = await request('POST', '/api/match/forfeit', {
      matchId: matchId3,
      playerId: 'athlete_m',
      reason: 'opponent_disconnected'
    });
    console.log('  Immediate forfeit result:', exploitForfeit.body);
    if (exploitForfeit.body.ok && exploitForfeit.body.winner === 0) {
      console.log('  => CONFIRMED BUG 3: Forfeit immediately awarded win to caller without verifying connection status!');
    }

  } finally {
    if (serverProcess) serverProcess.kill();
  }
}

run().catch(err => {
  console.error(err);
  if (serverProcess) serverProcess.kill();
  process.exit(1);
});
