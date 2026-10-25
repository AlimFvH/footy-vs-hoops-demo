// tests/test_quick_match_resolution.cjs
// Verification of Quick Match Mode Resolution, Cross-Sport Agreement, and Metadata Sanitization

const assert = require('assert');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('=== FOOTY vs HOOPS: Quick Match Mode Resolution Verification Suite ===\n');

const SERVER_PORT = 8099;
let spawnedServer = null;
let tmpDataPath = null;

function checkServerReady() {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${SERVER_PORT}/api/health`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function ensureServerRunning() {
  const isRunning = await checkServerReady();
  if (isRunning) return;

  tmpDataPath = path.join(__dirname, 'temp_quick_match_data.json');
  try {
    fs.copyFileSync(path.join(__dirname, '../server/data.json'), tmpDataPath);
  } catch (e) {
    fs.writeFileSync(tmpDataPath, JSON.stringify({ players: {}, economyLedger: [], idempotencyKeys: {}, matches: {} }));
  }

  spawnedServer = spawn('node', [path.join(__dirname, '../server/server.js')], {
    env: Object.assign({}, process.env, { PORT: String(SERVER_PORT), SEASON_STATE: 'prelaunch', DATA_FILE: tmpDataPath }),
    stdio: ['ignore', 'pipe', 'pipe']
  });

  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 100));
    if (await checkServerReady()) return;
  }
  throw new Error('Failed to auto-spawn test server on port ' + SERVER_PORT);
}

function cleanupSpawnedServer() {
  if (spawnedServer) {
    try { spawnedServer.kill(); } catch (e) {}
    spawnedServer = null;
  }
  if (tmpDataPath) {
    try { if (fs.existsSync(tmpDataPath)) fs.unlinkSync(tmpDataPath); } catch (e) {}
    tmpDataPath = null;
  }
}

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

// Client-side resolver function matching js/redesign.js implementation
function resolveAuthoritativeMatchConfig(matchInfo, curChar) {
  var m = (matchInfo && matchInfo.match) ? matchInfo.match : (matchInfo || {});
  var rawMode = String((m.mode !== undefined ? m.mode : (matchInfo && matchInfo.mode)) || '').toLowerCase().trim();
  var resolvedMode = 'footy';
  if (rawMode === 'hoops') {
    resolvedMode = 'hoops';
  } else if (rawMode === 'footy') {
    resolvedMode = 'footy';
  } else {
    var hostChar = (m.host && (m.host.char || m.host.character)) || (matchInfo && matchInfo.opponent && matchInfo.role === 'guest' && matchInfo.opponent.char);
    if (hostChar === 'hoops') resolvedMode = 'hoops';
    else if (hostChar === 'footy') resolvedMode = 'footy';
    else resolvedMode = (curChar === 'hoops') ? 'hoops' : 'footy';
  }

  var rawMin = Number(m.minutes !== undefined ? m.minutes : (matchInfo && matchInfo.minutes));
  var resolvedMin = (!isNaN(rawMin) && rawMin >= 1 && rawMin <= 10) ? Math.round(rawMin) : 2;

  var rawSeed = Number(m.seed !== undefined ? m.seed : (matchInfo && matchInfo.seed));
  var resolvedSeed = (!isNaN(rawSeed) && rawSeed !== 0) ? (rawSeed | 0) : ((Math.random() * 1e9) | 0);

  var resolvedArena = m.arenaId || (matchInfo && matchInfo.arenaId) || null;

  return {
    mode: resolvedMode,
    minutes: resolvedMin,
    seed: resolvedSeed,
    arenaId: resolvedArena
  };
}

async function runTests() {
  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`[PASS] Test ${total}: ${name}`);
      passed++;
    } catch (e) {
      console.error(`[FAIL] Test ${total}: ${name}`);
      console.error(e);
      process.exit(1);
    }
  }

  async function testAsync(name, fn) {
    total++;
    try {
      await fn();
      console.log(`[PASS] Test ${total}: ${name}`);
      passed++;
    } catch (e) {
      console.error(`[FAIL] Test ${total}: ${name}`);
      console.error(e);
      process.exit(1);
    }
  }

  // --- 1. Client-Side Sanitization & Metadata Handling Tests ---
  test('Missing matchInfo defaults safely to valid discipline without crash', () => {
    const config = resolveAuthoritativeMatchConfig(null, 'footy');
    assert.strictEqual(config.mode, 'footy');
    assert.strictEqual(config.minutes, 2);
    assert(Number.isInteger(config.seed));
  });

  test('Malformed or legacy "clash" mode cleanly resolves to agreed discipline', () => {
    // When mode is 'clash' and host is hoops -> resolves to hoops
    const cfg1 = resolveAuthoritativeMatchConfig({
      match: { mode: 'clash', host: { char: 'hoops' }, minutes: 3, seed: 12345 }
    }, 'footy');
    assert.strictEqual(cfg1.mode, 'hoops');
    assert.strictEqual(cfg1.minutes, 3);
    assert.strictEqual(cfg1.seed, 12345);

    // When mode is 'clash' and host is footy -> resolves to footy
    const cfg2 = resolveAuthoritativeMatchConfig({
      match: { mode: 'clash', host: { char: 'footy' }, minutes: 2, seed: 99999 }
    }, 'hoops');
    assert.strictEqual(cfg2.mode, 'footy');
    assert.strictEqual(cfg2.seed, 99999);
  });

  test('Missing or out-of-range minutes clamps safely between 1 and 10', () => {
    const cfgLow = resolveAuthoritativeMatchConfig({ match: { mode: 'footy', minutes: -5 } }, 'footy');
    assert.strictEqual(cfgLow.minutes, 2); // Fallback to 2 on invalid

    const cfgHigh = resolveAuthoritativeMatchConfig({ match: { mode: 'footy', minutes: 99 } }, 'footy');
    assert.strictEqual(cfgHigh.minutes, 2); // Fallback to 2 on out-of-range

    const cfgValid = resolveAuthoritativeMatchConfig({ match: { mode: 'footy', minutes: 5 } }, 'footy');
    assert.strictEqual(cfgValid.minutes, 5);
  });

  test('Both flattened and nested matchInfo structures resolve identically', () => {
    const nested = {
      status: 'matched',
      matchId: 'FVH-TEST1',
      match: { mode: 'hoops', minutes: 2, seed: 777, arenaId: 'std_urban_rooftop' }
    };
    const flattened = {
      status: 'matched',
      matchId: 'FVH-TEST1',
      mode: 'hoops',
      minutes: 2,
      seed: 777,
      arenaId: 'std_urban_rooftop'
    };

    const resNested = resolveAuthoritativeMatchConfig(nested, 'footy');
    const resFlattened = resolveAuthoritativeMatchConfig(flattened, 'footy');

    assert.strictEqual(resNested.mode, resFlattened.mode);
    assert.strictEqual(resNested.minutes, resFlattened.minutes);
    assert.strictEqual(resNested.seed, resFlattened.seed);
    assert.strictEqual(resNested.arenaId, resFlattened.arenaId);
  });

  // --- 2. Live Server Matchmaking Tests ---
  await testAsync('Server Matchmaking: Football vs Football produces agreed "footy" mode', async () => {
    const p1 = 'ff_host_' + Date.now();
    const p2 = 'ff_guest_' + Date.now();

    // Client 1 queues for footy
    const r1 = await request('POST', '/api/matchmaking/join', { playerId: p1, playerName: 'F1', mode: 'footy', char: 'footy' });
    assert.strictEqual(r1.body.status, 'searching');

    // Client 2 queues for footy
    const r2 = await request('POST', '/api/matchmaking/join', { playerId: p2, playerName: 'F2', mode: 'footy', char: 'footy' });
    assert.strictEqual(r2.body.status, 'matched');
    assert.strictEqual(r2.body.mode, 'footy');
    assert.strictEqual(r2.body.match.mode, 'footy');

    // Client 1 polls
    const poll1 = await request('GET', `/api/matchmaking/poll?playerId=${p1}`);
    assert.strictEqual(poll1.body.status, 'matched');
    assert.strictEqual(poll1.body.mode, 'footy');
    assert.strictEqual(poll1.body.match.mode, 'footy');

    // Both clients resolve identical configuration
    const cfgHost = resolveAuthoritativeMatchConfig(poll1.body, 'footy');
    const cfgGuest = resolveAuthoritativeMatchConfig(r2.body, 'footy');
    assert.strictEqual(cfgHost.mode, 'footy');
    assert.strictEqual(cfgGuest.mode, 'footy');
    assert.strictEqual(cfgHost.seed, cfgGuest.seed);
    assert.strictEqual(cfgHost.minutes, cfgGuest.minutes);
  });

  await testAsync('Server Matchmaking: Basketball vs Basketball produces agreed "hoops" mode', async () => {
    const p1 = 'bb_host_' + Date.now();
    const p2 = 'bb_guest_' + Date.now();

    const r1 = await request('POST', '/api/matchmaking/join', { playerId: p1, playerName: 'B1', mode: 'hoops', char: 'hoops' });
    assert.strictEqual(r1.body.status, 'searching');

    const r2 = await request('POST', '/api/matchmaking/join', { playerId: p2, playerName: 'B2', mode: 'hoops', char: 'hoops' });
    assert.strictEqual(r2.body.status, 'matched');
    assert.strictEqual(r2.body.mode, 'hoops');
    assert.strictEqual(r2.body.match.mode, 'hoops');

    const poll1 = await request('GET', `/api/matchmaking/poll?playerId=${p1}`);
    assert.strictEqual(poll1.body.mode, 'hoops');

    const cfgHost = resolveAuthoritativeMatchConfig(poll1.body, 'hoops');
    const cfgGuest = resolveAuthoritativeMatchConfig(r2.body, 'hoops');
    assert.strictEqual(cfgHost.mode, 'hoops');
    assert.strictEqual(cfgGuest.mode, 'hoops');
    assert.strictEqual(cfgHost.seed, cfgGuest.seed);
  });

  await testAsync('Server Matchmaking: Cross-Sport (Footy Host vs Hoops Guest) resolves to agreed "footy" mode', async () => {
    const p1 = 'cross_fh_host_' + Date.now();
    const p2 = 'cross_fh_guest_' + Date.now();

    // Host queues with footy
    const r1 = await request('POST', '/api/matchmaking/join', { playerId: p1, playerName: 'FootyHost', mode: 'footy', char: 'footy' });
    assert.strictEqual(r1.body.status, 'searching');

    // Guest queues with hoops
    const r2 = await request('POST', '/api/matchmaking/join', { playerId: p2, playerName: 'HoopsGuest', mode: 'hoops', char: 'hoops' });
    assert.strictEqual(r2.body.status, 'matched');

    // Crucial check: Authoritative mode is footy (not hoops, not clash)
    assert.strictEqual(r2.body.mode, 'footy');
    assert.strictEqual(r2.body.match.mode, 'footy');

    const poll1 = await request('GET', `/api/matchmaking/poll?playerId=${p1}`);
    assert.strictEqual(poll1.body.mode, 'footy');

    // Both clients resolve identical mode, even if Guest local character is hoops
    const cfgHost = resolveAuthoritativeMatchConfig(poll1.body, 'footy');
    const cfgGuest = resolveAuthoritativeMatchConfig(r2.body, 'hoops'); // Guest local char is hoops!

    assert.strictEqual(cfgHost.mode, 'footy');
    assert.strictEqual(cfgGuest.mode, 'footy', 'Guest MUST resolve to agreed room discipline "footy", not local "hoops"');
    assert.strictEqual(cfgHost.seed, cfgGuest.seed);
    assert.strictEqual(cfgHost.minutes, cfgGuest.minutes);
  });

  await testAsync('Server Matchmaking: Cross-Sport (Hoops Host vs Footy Guest) resolves to agreed "hoops" mode', async () => {
    const p1 = 'cross_hf_host_' + Date.now();
    const p2 = 'cross_hf_guest_' + Date.now();

    // Host queues with hoops
    const r1 = await request('POST', '/api/matchmaking/join', { playerId: p1, playerName: 'HoopsHost', mode: 'hoops', char: 'hoops' });
    assert.strictEqual(r1.body.status, 'searching');

    // Guest queues with footy
    const r2 = await request('POST', '/api/matchmaking/join', { playerId: p2, playerName: 'FootyGuest', mode: 'footy', char: 'footy' });
    assert.strictEqual(r2.body.status, 'matched');

    // Crucial check: Authoritative mode is hoops (not footy, not clash)
    assert.strictEqual(r2.body.mode, 'hoops');
    assert.strictEqual(r2.body.match.mode, 'hoops');

    const poll1 = await request('GET', `/api/matchmaking/poll?playerId=${p1}`);
    assert.strictEqual(poll1.body.mode, 'hoops');

    // Both clients resolve identical mode, even if Guest local character is footy
    const cfgHost = resolveAuthoritativeMatchConfig(poll1.body, 'hoops');
    const cfgGuest = resolveAuthoritativeMatchConfig(r2.body, 'footy'); // Guest local char is footy!

    assert.strictEqual(cfgHost.mode, 'hoops');
    assert.strictEqual(cfgGuest.mode, 'hoops', 'Guest MUST resolve to agreed room discipline "hoops", not local "footy"');
    assert.strictEqual(cfgHost.seed, cfgGuest.seed);
  });

  console.log(`\n======================================================`);
  console.log(`ALL QUICK MATCH RESOLUTION TESTS PASSED (${passed}/${total})!`);
  console.log(`======================================================\n`);
}

async function main() {
  try {
    await ensureServerRunning();
    await runTests();
  } finally {
    cleanupSpawnedServer();
  }
}

main().catch(e => {
  cleanupSpawnedServer();
  console.error(e);
  process.exit(1);
});
