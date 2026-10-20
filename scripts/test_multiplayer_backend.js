const http = require('http');
const crypto = require('crypto');

const BASE_URL = 'http://127.0.0.1:8099';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const req = http.request(url, {
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

function makeWsClient(roomCode, role) {
  return new Promise((resolve, reject) => {
    const secKey = crypto.randomBytes(16).toString('base64');
    const req = http.request({
      host: '127.0.0.1',
      port: 8099,
      path: `/ws/match?matchId=${roomCode}&role=${role}`,
      headers: {
        'Connection': 'Upgrade',
        'Upgrade': 'websocket',
        'Sec-WebSocket-Key': secKey,
        'Sec-WebSocket-Version': '13'
      }
    });

    req.on('upgrade', (res, socket, head) => {
      const messages = [];
      let buffer = Buffer.alloc(0);

      socket.on('data', (chunk) => {
        buffer = Buffer.concat([buffer, chunk]);
        while (buffer.length >= 2) {
          const byte0 = buffer[0];
          const byte1 = buffer[1];
          const opcode = byte0 & 0x0f;
          let payloadLen = byte1 & 0x7f;
          let offset = 2;

          if (payloadLen === 126) {
            if (buffer.length < 4) break;
            payloadLen = buffer.readUInt16BE(2);
            offset = 4;
          } else if (payloadLen === 127) {
            if (buffer.length < 10) break;
            payloadLen = Number(buffer.readBigUInt64BE(2));
            offset = 10;
          }

          if (buffer.length < offset + payloadLen) break;
          const payload = buffer.slice(offset, offset + payloadLen);
          buffer = buffer.slice(offset + payloadLen);

          if (opcode === 1) {
            try {
              messages.push(JSON.parse(payload.toString('utf8')));
            } catch (e) {
              messages.push(payload.toString('utf8'));
            }
          }
        }
      });

      function sendText(text) {
        const payload = Buffer.from(text, 'utf8');
        const maskKey = crypto.randomBytes(4);
        const masked = Buffer.alloc(payload.length);
        for (let i = 0; i < payload.length; i++) {
          masked[i] = payload[i] ^ maskKey[i % 4];
        }
        let header;
        if (payload.length < 126) {
          header = Buffer.from([0x81, 0x80 | payload.length]);
        } else if (payload.length < 65536) {
          header = Buffer.from([0x81, 0x80 | 126, (payload.length >> 8) & 0xff, payload.length & 0xff]);
        }
        socket.write(Buffer.concat([header, maskKey, masked]));
      }

      resolve({ socket, sendText, messages });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('=== MULTIPLAYER BACKEND & LOBBY E2E TEST ===\n');

  // Test 1: Create Room
  console.log('1. Testing Host Room Creation (/api/room/create)...');
  const createRes = await request('POST', '/api/room/create', {
    hostId: 'test_player_a',
    hostName: 'Striker_Alpha',
    character: 'footy',
    mode: 'footy'
  });
  if (createRes.status !== 200 || !createRes.body.ok || !createRes.body.roomCode) {
    throw new Error('Room creation failed: ' + JSON.stringify(createRes));
  }
  const roomCode = createRes.body.roomCode;
  console.log(`   ✓ Created room ${roomCode} with mode: ${createRes.body.room.mode}, status: ${createRes.body.room.status}`);

  // Test 2: Host switches mode to HOOPS (/api/room/update)
  console.log('\n2. Testing Host Mode Selection Update (/api/room/update)...');
  const updateRes = await request('POST', '/api/room/update', {
    code: roomCode,
    mode: 'hoops'
  });
  if (updateRes.status !== 200 || !updateRes.body.ok || updateRes.body.room.mode !== 'hoops') {
    throw new Error('Mode update failed: ' + JSON.stringify(updateRes));
  }
  console.log(`   ✓ Room mode explicitly updated to HOOPS (Basketball), arena: ${updateRes.body.room.arenaId}`);

  // Test 3: Guest Joins Room (/api/room/join)
  console.log('\n3. Testing Guest Join Room (/api/room/join)...');
  const joinRes = await request('POST', '/api/room/join', {
    code: roomCode,
    guestId: 'test_player_b',
    guestName: 'Dunker_Beta',
    character: 'hoops',
    role: 'guest'
  });
  if (joinRes.status !== 200 || !joinRes.body.ok || !joinRes.body.room.guest) {
    throw new Error('Guest join failed: ' + JSON.stringify(joinRes));
  }
  console.log(`   ✓ Guest ${joinRes.body.room.guest.name} joined room. Status: ${joinRes.body.room.status}`);

  // Test 4: Verify Both in Lobby via /api/room/status
  console.log('\n4. Verifying Lobby State (/api/room/status)...');
  const statusRes = await request('GET', `/api/room/status?code=${roomCode}`);
  if (statusRes.status !== 200 || !statusRes.body.host || !statusRes.body.guest) {
    throw new Error('Lobby status failed: ' + JSON.stringify(statusRes));
  }
  console.log(`   ✓ Host: ${statusRes.body.host.name} (Ready: ${statusRes.body.host.ready})`);
  console.log(`   ✓ Guest: ${statusRes.body.guest.name} (Ready: ${statusRes.body.guest.ready})`);
  console.log(`   ✓ Mode: ${statusRes.body.mode}`);

  // Test 5: Player A readies up
  console.log('\n5. Testing Host Ready State Toggle (/api/room/ready)...');
  const readyA = await request('POST', '/api/room/ready', {
    code: roomCode,
    role: 'host',
    ready: true
  });
  console.log(`   ✓ Host ready: ${readyA.body.room.host.ready}, room status: ${readyA.body.room.status}`);

  // Test 6: Player B readies up -> Synchronized Countdown Triggered!
  console.log('\n6. Testing Guest Ready State Toggle & Synchronized Countdown (/api/room/ready)...');
  const readyB = await request('POST', '/api/room/ready', {
    code: roomCode,
    role: 'guest',
    ready: true
  });
  if (readyB.body.status !== 'countdown') {
    throw new Error('Expected countdown status, got: ' + readyB.body.status);
  }
  console.log(`   ✓ Both players ready! Room entered synchronized COUNTDOWN: ${readyB.body.status}`);

  // Test 7: Verify Status during countdown
  const countStatus = await request('GET', `/api/room/status?code=${roomCode}`);
  console.log(`   ✓ Remaining countdown seconds from server: ${countStatus.body.countdown}s`);

  // Test 8: Native RFC6455 WebSocket Relay Connect
  console.log('\n7. Testing Real-Time WebSocket Relay (/ws/match)...');
  const hostWs = await makeWsClient(roomCode, 'host');
  const guestWs = await makeWsClient(roomCode, 'guest');
  console.log('   ✓ Host & Guest WebSockets connected via RFC6455 handshake!');

  // Test 9: Host sends game snapshot over WebSocket
  console.log('\n8. Testing Host Snapshot Relay to Guest...');
  const testSnapshot = {
    k: 'snap',
    s: {
      t: 1.25,
      ph: 1,
      pt: 0,
      tl: 58.75,
      mph: 'regular',
      sc: [1, 0],
      w: -1,
      a: [[0, 0, 1.2, 0, 0, 1, 0.9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      b: [0, 0.15, 0, 2.5, 0, 0, 0, 0, 0, 0, -1]
    }
  };
  hostWs.sendText(JSON.stringify(testSnapshot));

  await new Promise(r => setTimeout(r, 100));
  const guestReceivedSnap = guestWs.messages.find(m => m.k === 'snap');
  if (!guestReceivedSnap) {
    throw new Error('Guest did NOT receive host snapshot over WebSocket!');
  }
  console.log(`   ✓ Guest received snapshot over WebSocket! (time: ${guestReceivedSnap.s.t}, score: [${guestReceivedSnap.s.sc}])`);

  // Test 10: Guest sends player inputs to Host
  console.log('\n9. Testing Guest Input Relay to Host...');
  const testInput = {
    k: 'in',
    i: {
      moveX: 0.85,
      moveZ: -0.42,
      sprint: true,
      shootHeld: false,
      shootPressed: true,
      shootReleased: false,
      tackleHeld: false,
      tacklePressed: false,
      tackleReleased: false,
      passPressed: false
    }
  };
  guestWs.sendText(JSON.stringify(testInput));

  await new Promise(r => setTimeout(r, 100));
  const hostReceivedInput = hostWs.messages.find(m => m.k === 'in');
  if (!hostReceivedInput) {
    throw new Error('Host did NOT receive guest input over WebSocket!');
  }
  console.log(`   ✓ Host received guest inputs over WebSocket! (moveX: ${hostReceivedInput.i.moveX}, shoot: ${hostReceivedInput.i.shootPressed})`);

  // Test 11: HTTP Relay Fallback
  console.log('\n10. Testing HTTP Relay Fallback (/api/match/relay)...');
  await request('POST', '/api/match/relay', {
    matchId: roomCode,
    role: 'guest',
    packet: { k: 'in', i: { moveX: -0.5, moveZ: 0.5, sprint: false } }
  });
  const fetchRelay = await request('GET', `/api/match/relay?matchId=${roomCode}&role=host`);
  if (!fetchRelay.body.ok || !fetchRelay.body.messages || fetchRelay.body.messages.length === 0) {
    throw new Error('HTTP relay queue failed: ' + JSON.stringify(fetchRelay));
  }
  const relMsg = fetchRelay.body.messages[0];
  const packet = relMsg.packet || relMsg;
  console.log(`   ✓ HTTP relay preserved packet: k=${packet.k}, i.moveX=${packet.i.moveX}`);

  // Test 12: Clean Leave & Disconnect Handling
  console.log('\n11. Testing Clean Disconnect Handling (/api/room/cancel)...');
  await request('POST', '/api/room/cancel', {
    code: roomCode,
    playerId: 'test_player_b'
  });
  const afterLeave = await request('GET', `/api/room/status?code=${roomCode}`);
  if (afterLeave.body.room.guest !== null || afterLeave.body.room.status !== 'waiting') {
    throw new Error('Room did not cleanly reset after guest left: ' + JSON.stringify(afterLeave));
  }
  console.log(`   ✓ Guest left cleanly. Room reset to status: ${afterLeave.body.room.status}, host ready: ${afterLeave.body.room.host.ready} (no soft-lock!)`);

  hostWs.socket.destroy();
  guestWs.socket.destroy();

  console.log('\n===========================================');
  console.log('🎉 ALL 12 MULTIPLAYER BACKEND TESTS PASSED!');
  console.log('===========================================\n');
}

runTests().catch(err => {
  console.error('\n❌ MULTIPLAYER TEST FAILED:', err);
  process.exit(1);
});
