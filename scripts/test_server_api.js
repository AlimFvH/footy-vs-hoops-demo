const http = require('http');
const assert = require('assert');

function post(path, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request({
      hostname: 'localhost',
      port: 8099,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, res => {
      let body = '';
      res.on('data', c => { body += c; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(body) }); }
        catch (e) { resolve({ status: res.statusCode, body }); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:8099${path}`, res => {
      let body = '';
      res.on('data', c => { body += c; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(body) }); }
        catch (e) { resolve({ status: res.statusCode, body }); }
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('Testing Server APIs...');

  // 1. Private Room Creation & Joining
  const createRes = await post('/api/room/create', { playerId: 'host1', playerName: 'Alex', mode: 'footy', minutes: 2 });
  console.log('Room Create:', createRes.body);
  assert.strictEqual(createRes.status, 200);
  assert(createRes.body.roomCode.startsWith('FVH-'));
  const code = createRes.body.roomCode;

  const joinRes = await post('/api/room/join', { roomCode: code, playerId: 'guest1', playerName: 'Jordan' });
  console.log('Room Join:', joinRes.body);
  assert.strictEqual(joinRes.status, 200);
  assert.strictEqual(joinRes.body.role, 'guest');
  assert.strictEqual(joinRes.body.room.status, 'ready');

  // 2. Quick Match Matchmaking (2 clients matching)
  const p1 = await post('/api/matchmaking/join', { playerId: 'p1', playerName: 'Messi', mode: 'footy' });
  console.log('Matchmaking P1:', p1.body);
  assert.strictEqual(p1.body.status, 'searching');

  const p2 = await post('/api/matchmaking/join', { playerId: 'p2', playerName: 'Ronaldo', mode: 'footy' });
  console.log('Matchmaking P2:', p2.body);
  assert.strictEqual(p2.body.status, 'matched');
  assert.strictEqual(p2.body.role, 'guest');

  const p1Poll = await get(`/api/matchmaking/poll?playerId=p1`);
  console.log('Matchmaking P1 Poll:', p1Poll.body);
  assert.strictEqual(p1Poll.body.status, 'matched');
  assert.strictEqual(p1Poll.body.role, 'host');

  // 3. Referral Tracking & Qualification
  const refStats = await get('/api/referrals/stats?playerId=user_prime');
  console.log('Referral Stats:', refStats.body);
  assert.strictEqual(refStats.status, 200);
  assert(refStats.body.milestones.length >= 4);

  console.log('\nAll Server API tests passed successfully!');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
