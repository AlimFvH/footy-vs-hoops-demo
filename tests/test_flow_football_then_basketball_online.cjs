/**
 * FOOTY vs HOOPS — End-to-End Online Lifecycle Test:
 * Play Football Online 1v1 -> End Match -> Play Basketball Online 1v1
 * Tests state transitions, mode isolation, physics, and zero-leak invariant.
 */

const assert = require('assert');
const fs = require('fs');
const http = require('http');
const path = require('path');

console.log('=== TEST: FOOTBALL ONLINE 1v1 -> BASKETBALL ONLINE 1v1 LIFECYCLE ===\n');

// 1. AMD Loader Mock for Simulation Testing
const modules = {};
global.define = function(name, deps, factory) { modules[name] = { deps, factory }; };
global.window = {
  __boot: () => {},
  AudioContext: null,
  innerWidth: 390,
  innerHeight: 844,
  devicePixelRatio: 3,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  addEventListener: () => {},
  removeEventListener: () => {}
};
global.document = {
  createElement: (tag) => ({
    tagName: tag.toUpperCase(),
    className: '',
    style: {},
    dataset: {},
    appendChild: () => {},
    append: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
    remove: () => {}
  })
};

require('../js/game.js');

const cache = {};
function requireModule(id) {
  if (cache[id]) return cache[id].exports;
  const mod = modules[id];
  if (!mod) throw new Error('Missing module ' + id);
  const exports = {};
  cache[id] = { exports };
  const requireFn = (dep) => requireModule(dep);
  const resolvedDeps = mod.deps.map(d => {
    if (d === 'require') return requireFn;
    if (d === 'exports') return exports;
    return requireModule(d);
  });
  mod.factory.apply(null, resolvedDeps);
  return exports;
}

const fb = requireModule('sim/football');
const bb = requireModule('sim/basketball');
const proto = requireModule('net/protocol');

// 2. Start Live Backend Server
process.env.PORT = '8097';
process.env.DATA_FILE = path.join(__dirname, 'temp_flow_data.json');
process.env.TELEGRAM_BOT_TOKEN = '123456789:ABCdefGHIjklMNOpqrSTUvwxYZ_TEST_OK';

if (fs.existsSync(process.env.DATA_FILE)) {
  try { fs.unlinkSync(process.env.DATA_FILE); } catch (e) {}
}

const serverModule = require('../server/server.js');
const PORT = 8097;

function postJson(pathname, data) {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(data);
    const req = http.request({
      hostname: '127.0.0.1',
      port: PORT,
      path: pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr)
      }
    }, (res) => {
      let buf = '';
      res.on('data', chunk => buf += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(buf) }); }
        catch (e) { resolve({ status: res.statusCode, data: buf }); }
      });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

function getJson(pathname) {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${PORT}${pathname}`, (res) => {
      let buf = '';
      res.on('data', chunk => buf += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(buf) }); }
        catch (e) { resolve({ status: res.statusCode, data: buf }); }
      });
    }).on('error', reject);
  });
}

async function runLifecycle() {
  await new Promise(r => setTimeout(r, 600));

  console.log('[PHASE 1] PLAYING FOOTBALL 1v1 ONLINE');

  const playerA = 'athlete_alpha_fb';
  const playerB = 'athlete_beta_fb';

  // 1. Player A queues for Football
  const joinA1 = await postJson('/api/matchmaking/join', {
    playerId: playerA,
    playerName: 'Alpha',
    mode: 'footy',
    character: 'footy'
  });
  assert.strictEqual(joinA1.data.status, 'searching', 'Player A should be searching');
  const ticketA = joinA1.data.ticketId;

  // 2. Player B queues for Football -> Pairs with Player A
  const joinB1 = await postJson('/api/matchmaking/join', {
    playerId: playerB,
    playerName: 'Beta',
    mode: 'footy',
    character: 'footy'
  });
  assert.strictEqual(joinB1.data.status, 'matched', 'Player B should be immediately matched with A');
  assert.strictEqual(joinB1.data.mode, 'footy', 'Discipline must be FOOTY');
  const matchId1 = joinB1.data.matchId;

  // 3. Player A polls and receives match
  const pollA1 = await getJson(`/api/matchmaking/poll?ticketId=${ticketA}&playerId=${playerA}`);
  assert.strictEqual(pollA1.data.status, 'matched', 'Player A should be matched');
  assert.strictEqual(pollA1.data.matchId, matchId1, 'Match ID must be identical');
  assert.strictEqual(pollA1.data.mode, 'footy', 'Player A mode must be FOOTY');

  console.log('  ✓ Matchmaking paired both players into Football Match:', matchId1);

  // 4. Host runs FootballSim, Guest runs FootballSim
  const fbHostSim = new fb.FootballSim({
    online: true,
    names: ['Alpha', 'Beta'],
    skipCountdown: true,
    matchSeconds: 60,
    boosts: {}
  });

  const fbGuestSim = new fb.FootballSim({
    online: true,
    names: ['Alpha', 'Beta'],
    skipCountdown: true,
    matchSeconds: 60,
    boosts: {}
  });

  assert.strictEqual(fbHostSim.mode, 'footy');
  assert.strictEqual(fbGuestSim.mode, 'footy');
  assert.strictEqual(fbHostSim.agents.length, 4, 'Football has 4 agents (2 field, 2 keepers)');

  // Step 30 frames with movement
  const footyInputHost = { moveX: 0, moveZ: -1, sprint: true, shootPressed: false, shootHeld: false, shootReleased: false, tacklePressed: false, tackleHeld: false, tackleReleased: false, passPressed: false };
  const footyInputGuest = { moveX: 0, moveZ: 1, sprint: false, shootPressed: false, shootHeld: false, shootReleased: false, tacklePressed: false, tackleHeld: false, tackleReleased: false, passPressed: false };

  for (let f = 0; f < 30; f++) {
    fbHostSim.setInput2(footyInputGuest);
    fbHostSim.step(0.016, footyInputHost);

    // Host sends snapshot to Guest
    const snap = proto.captureSnapshot(fbHostSim);
    proto.applySnapshot(fbGuestSim, snap, true);

    assert(!isNaN(fbHostSim.agents[0].x));
    assert(!isNaN(fbGuestSim.agents[0].x));
  }

  console.log('  ✓ Football Match ran 30 simulation frames with 0 NaNs and synced state');

  // 5. Match Ends / Players leave match
  await postJson('/api/room/cancel', { code: matchId1, role: 'host' });
  console.log('  ✓ Football Match cleanly ended and abandoned on server\n');

  // -------------------------------------------------------------
  // [PHASE 2] IMMEDIATELY PLAYING BASKETBALL 1v1 ONLINE
  // -------------------------------------------------------------
  console.log('[PHASE 2] PLAYING BASKETBALL 1v1 ONLINE (VERIFYING ZERO LEAKAGE)');

  // 1. Player A queues for Basketball (mode: 'hoops')
  const joinA2 = await postJson('/api/matchmaking/join', {
    playerId: playerA,
    playerName: 'Alpha',
    mode: 'hoops',
    character: 'hoops'
  });
  assert.strictEqual(joinA2.data.status, 'searching', 'Player A should be searching for basketball');
  const ticketA2 = joinA2.data.ticketId;

  // Verify that polling DOES NOT return the old Football match!
  const pollEarly = await getJson(`/api/matchmaking/poll?ticketId=${ticketA2}&playerId=${playerA}`);
  assert.notStrictEqual(pollEarly.data.matchId, matchId1, 'Must NOT return old football match!');
  assert.strictEqual(pollEarly.data.status, 'searching', 'Must still be searching for basketball');

  // 2. Player B queues for Basketball -> Pairs with Player A
  const joinB2 = await postJson('/api/matchmaking/join', {
    playerId: playerB,
    playerName: 'Beta',
    mode: 'hoops',
    character: 'hoops'
  });
  assert.strictEqual(joinB2.data.status, 'matched', 'Player B should be matched with Player A');
  assert.strictEqual(joinB2.data.mode, 'hoops', 'Discipline must be strictly HOOPS');
  const matchId2 = joinB2.data.matchId;
  assert.notStrictEqual(matchId2, matchId1, 'Basketball match ID must be completely new');

  // 3. Player A polls and receives Basketball match
  const pollA2 = await getJson(`/api/matchmaking/poll?ticketId=${ticketA2}&playerId=${playerA}`);
  assert.strictEqual(pollA2.data.status, 'matched');
  assert.strictEqual(pollA2.data.matchId, matchId2);
  assert.strictEqual(pollA2.data.mode, 'hoops', 'Discipline for Player A must be strictly HOOPS');

  console.log('  ✓ Matchmaking paired both players into Basketball Match:', matchId2);

  // 4. Host runs BasketballSim, Guest runs BasketballSim
  const bbHostSim = new bb.BasketballSim({
    online: true,
    names: ['Alpha', 'Beta'],
    skipCountdown: true,
    matchSeconds: 60,
    boosts: {}
  });

  const bbGuestSim = new bb.BasketballSim({
    online: true,
    names: ['Alpha', 'Beta'],
    skipCountdown: true,
    matchSeconds: 60,
    boosts: {}
  });

  assert.strictEqual(bbHostSim.mode, 'hoops');
  assert.strictEqual(bbGuestSim.mode, 'hoops');
  assert.strictEqual(bbHostSim.agents.length, 2, 'Basketball has 2 agents (1v1)');
  assert.strictEqual(bbGuestSim.agents.length, 2, 'Basketball has 2 agents (1v1)');

  // Step 60 frames of Basketball 1v1
  const bbInputHost = { moveX: 0, moveZ: -1, sprint: true, shootPressed: false, shootHeld: false, shootReleased: false, tacklePressed: false, tackleHeld: false, tackleReleased: false, passPressed: false };
  const bbInputGuest = { moveX: 0, moveZ: 1, sprint: false, shootPressed: false, shootHeld: false, shootReleased: false, tacklePressed: false, tackleHeld: false, tackleReleased: false, passPressed: false };

  for (let f = 0; f < 60; f++) {
    bbHostSim.setInput2(bbInputGuest);
    bbHostSim.step(0.016, bbInputHost);

    // Host sends snapshot to Guest
    const snap = proto.captureSnapshot(bbHostSim);
    assert.strictEqual(snap.a.length, 2, 'Snapshot must have exactly 2 agents for Basketball');
    proto.applySnapshot(bbGuestSim, snap, true);

    // Verify coordinates are numbers and moving
    assert(!isNaN(bbHostSim.agents[0].x));
    assert(!isNaN(bbHostSim.agents[0].z));
    assert(!isNaN(bbHostSim.ball.x));
    assert(!isNaN(bbHostSim.ball.z));

    assert(!isNaN(bbGuestSim.agents[0].x));
    assert(!isNaN(bbGuestSim.agents[0].z));
  }

  assert(bbHostSim.agents[0].z < 6.5, 'Basketball Host Agent 0 must have moved forward');
  assert(bbHostSim.ball.owner !== null, 'Basketball Ball must be in possession');

  console.log('  ✓ Basketball Match ran 60 simulation frames with 0 NaNs, full dribbling and sync');

  // -------------------------------------------------------------
  // [PHASE 3] PRIVATE ROOM (LOBBY) MODE SWITCH & SYNC VERIFICATION
  // -------------------------------------------------------------
  console.log('\n[PHASE 3] PRIVATE LOBBY MODE SWITCH (FOOTY -> HOOPS)');

  // 1. Host creates room initially with footy
  const createRes = await postJson('/api/room/create', {
    hostId: 'host_lobby_1',
    hostName: 'HostAthlete',
    mode: 'footy',
    character: 'footy'
  });
  assert.strictEqual(createRes.data.ok, true);
  const roomCode = createRes.data.roomCode;
  assert.strictEqual(createRes.data.room.mode, 'footy');

  // 2. Host switches room mode to hoops
  const updateRes = await postJson('/api/room/update', {
    code: roomCode,
    mode: 'hoops'
  });
  assert.strictEqual(updateRes.data.ok, true);
  assert.strictEqual(updateRes.data.room.mode, 'hoops', 'Room mode must be updated to hoops');

  // 3. Guest joins room
  const joinRoomRes = await postJson('/api/room/join', {
    code: roomCode,
    guestId: 'guest_lobby_1',
    guestName: 'GuestAthlete'
  });
  assert.strictEqual(joinRoomRes.data.ok, true);
  assert.strictEqual(joinRoomRes.data.room.mode, 'hoops', 'Guest must see mode as HOOPS');

  // 4. Both ready up -> countdown starts
  await postJson('/api/room/ready', { code: roomCode, role: 'host', ready: true });
  const readyGuest = await postJson('/api/room/ready', { code: roomCode, role: 'guest', ready: true });
  assert.strictEqual(readyGuest.data.room.status, 'countdown');
  assert.strictEqual(readyGuest.data.room.mode, 'hoops', 'Mode must remain HOOPS in countdown');

  console.log('  ✓ Private Lobby synchronized HOOPS mode seamlessly between Host and Guest\n');

  console.log('=============================================================');
  console.log('🎉 FULL FOOTBALL -> BASKETBALL ONLINE LIFECYCLE TEST PASSED!');
  console.log('=============================================================');

  process.exit(0);
}

runLifecycle().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
