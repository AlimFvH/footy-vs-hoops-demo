const http = require('http');
const path = require('path');
const { spawn } = require('child_process');
const crypto = require('crypto');

console.log('=== FOOTY vs HOOPS: Production-Readiness Safe Load Test ===\n');

const TEST_PORT = 8199;
const SERVER_URL = `http://127.0.0.1:${TEST_PORT}`;

async function run() {
  console.log(`[1/4] Spawning local server instance on port ${TEST_PORT}...`);
  const serverProc = spawn('node', ['server/server.js'], {
    env: Object.assign({}, process.env, { PORT: String(TEST_PORT), NODE_ENV: 'production' }),
    stdio: ['ignore', 'pipe', 'pipe']
  });

  serverProc.stderr.on('data', d => {
    const s = d.toString();
    if (!s.includes('DEP0169')) console.error('[Server stderr]', s.trim());
  });

  // Wait for server to become responsive
  let ready = false;
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 150));
    try {
      const res = await fetch(`${SERVER_URL}/api/health`);
      if (res.ok) {
        const h = await res.json();
        console.log(`   ✓ Server ready: ${h.service} v${h.version} (Adapter: ${h.storageAdapter})`);
        ready = true;
        break;
      }
    } catch (_) {}
  }

  if (!ready) {
    console.error('Failed to start server for load test');
    serverProc.kill();
    process.exit(1);
  }

  // -------------------------------------------------------------
  // Phase A: HTTP API Concurrency & Latency Stress Test
  // -------------------------------------------------------------
  console.log('\n[2/4] Executing HTTP Concurrency & Throughput Test...');
  const endpoints = [
    { path: '/api/health', method: 'GET' },
    { path: '/api/season/status', method: 'GET' },
    { path: '/api/leaderboard?category=season&timeframe=season', method: 'GET' }
  ];

  const concurrencyLevels = [10, 50, 100];
  const httpResults = [];

  for (const concurrency of concurrencyLevels) {
    const totalRequests = concurrency * 20; // 200, 1000, 2000 requests
    let completed = 0;
    let failed = 0;
    const latencies = [];
    const t0 = Date.now();

    const worker = async () => {
      while (completed + failed < totalRequests) {
        const ep = endpoints[Math.floor(Math.random() * endpoints.length)];
        const start = Date.now();
        try {
          const res = await fetch(`${SERVER_URL}${ep.path}`, { method: ep.method });
          const dur = Date.now() - start;
          latencies.push(dur);
          if (res.ok) completed++;
          else failed++;
        } catch (err) {
          failed++;
        }
      }
    };

    const workers = [];
    for (let c = 0; c < concurrency; c++) {
      workers.push(worker());
    }
    await Promise.all(workers);

    const totalTimeMs = Date.now() - t0;
    const rps = Math.round((completed / totalTimeMs) * 1000);
    latencies.sort((a, b) => a - b);
    const p50 = latencies[Math.floor(latencies.length * 0.50)] || 0;
    const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
    const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;

    console.log(`   • Concurrency ${concurrency}: ${completed} ok, ${failed} failed in ${(totalTimeMs/1000).toFixed(2)}s | Throughput: ${rps} req/s | Latency P50: ${p50}ms, P95: ${p95}ms, P99: ${p99}ms`);
    httpResults.push({ concurrency, totalRequests, completed, failed, rps, p50, p95, p99 });
  }

  // -------------------------------------------------------------
  // Phase B: Matchmaking Queue Throughput
  // -------------------------------------------------------------
  console.log('\n[3/4] Testing Matchmaking Ingress Under Concurrent Player Load...');
  const mmPairs = 15; // 30 players
  let mmMatchedPairs = 0;
  const createdMatchIds = [];
  const mmStart = Date.now();

  for (let i = 0; i < mmPairs; i++) {
    const p1Id = `host_player_${i}_${Date.now()}`;
    const p2Id = `guest_player_${i}_${Date.now()}`;
    const mode = i % 2 === 0 ? 'footy' : 'hoops';

    // Player 1 joins queue
    const res1 = await fetch(`${SERVER_URL}/api/matchmaking/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: p1Id, playerName: `Host_${i}`, mode, char: mode })
    });
    const d1 = await res1.json();

    // Player 2 joins queue and pairs with Player 1
    const res2 = await fetch(`${SERVER_URL}/api/matchmaking/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: p2Id, playerName: `Guest_${i}`, mode, char: mode })
    });
    const d2 = await res2.json();

    if (d2.ok && d2.status === 'matched') {
      // Poll for player 1
      const pollRes = await fetch(`${SERVER_URL}/api/matchmaking/poll?ticketId=${d1.ticketId}&playerId=${p1Id}`);
      const pollD = await pollRes.json();
      if (pollD.ok && pollD.status === 'matched') {
        mmMatchedPairs++;
        createdMatchIds.push({ matchId: d2.matchId, hostId: p1Id, guestId: p2Id });
      }
    }
  }

  const mmDur = ((Date.now() - mmStart) / 1000).toFixed(2);
  console.log(`   ✓ Matchmaking paired ${mmMatchedPairs}/${mmPairs} 1v1 match sessions in ${mmDur}s (${(mmMatchedPairs*2/mmDur).toFixed(1)} players/sec)`);

  // -------------------------------------------------------------
  // Phase C: Real-Time WebSocket Match Packet Relay Test
  // -------------------------------------------------------------
  console.log(`\n[4/4] Testing WebSocket Real-Time Match Relay (${createdMatchIds.slice(0, 5).length} Matches / 10 Players at 10 Hz)...`);
  const activeMatchesToTest = createdMatchIds.slice(0, 5);
  let totalPktsSent = 0;
  let totalPktsRecv = 0;
  const wsLatencies = [];

  const runWsMatch = ({ matchId }) => {
    return new Promise((resolve) => {
      // Construct WebSocket upgrade client
      function connectSocket(role) {
        return new Promise((resSock, rejSock) => {
          const req = http.request({
            hostname: '127.0.0.1',
            port: TEST_PORT,
            path: `/ws/match?matchId=${matchId}&role=${role}`,
            headers: {
              'Connection': 'Upgrade',
              'Upgrade': 'websocket',
              'Sec-WebSocket-Key': crypto.randomBytes(16).toString('base64'),
              'Sec-WebSocket-Version': '13'
            }
          });

          req.on('upgrade', (res, socket) => {
            resSock(socket);
          });
          req.on('error', rejSock);
          req.end();
        });
      }

      function sendFrame(socket, text) {
        const payload = Buffer.from(text);
        const len = payload.length;
        const mask = crypto.randomBytes(4);
        const masked = Buffer.alloc(len);
        for (let i = 0; i < len; i++) masked[i] = payload[i] ^ mask[i % 4];

        let header;
        if (len < 126) {
          header = Buffer.from([0x81, 0x80 | len, mask[0], mask[1], mask[2], mask[3]]);
        } else {
          header = Buffer.from([0x81, 0x80 | 126, (len >> 8) & 0xff, len & 0xff, mask[0], mask[1], mask[2], mask[3]]);
        }
        socket.write(Buffer.concat([header, masked]));
      }

      function parseFrames(buf, onMessage) {
        let offset = 0;
        while (offset + 2 <= buf.length) {
          const b0 = buf[offset];
          const b1 = buf[offset + 1];
          const opcode = b0 & 0x0f;
          let len = b1 & 0x7f;
          let hLen = 2;
          if (len === 126) {
            if (offset + 4 > buf.length) break;
            len = buf.readUInt16BE(offset + 2);
            hLen = 4;
          }
          if (offset + hLen + len > buf.length) break;
          const payload = buf.subarray(offset + hLen, offset + hLen + len);
          if (opcode === 1) onMessage(payload.toString('utf8'));
          offset += hLen + len;
        }
        return buf.subarray(offset);
      }

      Promise.all([connectSocket('host'), connectSocket('guest')]).then(([hostSock, guestSock]) => {
        let guestBuf = Buffer.alloc(0);
        guestSock.on('data', chunk => {
          guestBuf = Buffer.concat([guestBuf, chunk]);
          guestBuf = parseFrames(guestBuf, msg => {
            totalPktsRecv++;
            try {
              const p = JSON.parse(msg);
              if (p.t) wsLatencies.push(Date.now() - p.t);
            } catch (_) {}
          });
        });

        // Host streams 20 packets at 10 Hz (2.0s)
        let sent = 0;
        const iv = setInterval(() => {
          sent++;
          totalPktsSent++;
          const pkt = JSON.stringify({ k: 's', t: Date.now(), x: sent * 0.1, z: 2.0, vx: 1.0, vz: 0 });
          sendFrame(hostSock, pkt);

          if (sent >= 20) {
            clearInterval(iv);
            setTimeout(() => {
              try { hostSock.end(); hostSock.destroy(); } catch (_) {}
              try { guestSock.end(); guestSock.destroy(); } catch (_) {}
              resolve();
            }, 300);
          }
        }, 100);
      }).catch(err => {
        resolve();
      });
    });
  };

  const wsMatchPromises = activeMatchesToTest.map(m => runWsMatch(m));
  await Promise.all(wsMatchPromises);

  wsLatencies.sort((a, b) => a - b);
  const wsP50 = wsLatencies[Math.floor(wsLatencies.length * 0.50)] || 0;
  const wsP95 = wsLatencies[Math.floor(wsLatencies.length * 0.95)] || 0;
  const dropRate = totalPktsSent > 0 ? (((totalPktsSent - totalPktsRecv) / totalPktsSent) * 100).toFixed(2) : 0;

  console.log(`   ✓ WebSocket Match Relay: ${totalPktsSent} packets sent, ${totalPktsRecv} packets received`);
  console.log(`   ✓ Packet Delivery Rate: ${(100 - dropRate).toFixed(2)}% (Drop rate: ${dropRate}%)`);
  console.log(`   ✓ WebSocket Local Relay Latency P50: ${wsP50}ms, P95: ${wsP95}ms`);

  // Memory & Heap summary
  const memRes = await fetch(`${SERVER_URL}/api/health`);
  const memData = await memRes.json();
  console.log(`\nServer Uptime: ${memData.uptime.toFixed(1)}s`);

  serverProc.kill();
  console.log('\n======================================================');
  console.log('SAFE LOAD TEST COMPLETED SUCCESSFULLY');
  console.log('======================================================');
}

run().catch(e => {
  console.error('Fatal load test error:', e);
  process.exit(1);
});
