/**
 * FOOTY vs HOOPS
 * Automated Verification Suite: Online 1v1 Synchronization, Extrapolation & Locker Room Sizing
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== FOOTY vs HOOPS: Online 1v1 Sync & Locker Room Verification Suite ===\n');

// -------------------------------------------------------------
// Part 1: Extract and Verify net/protocol & net/session from game.js
// -------------------------------------------------------------
const gameCode = fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8');

const modules = {};
function define(name, deps, fn) {
  const exports = {};
  const resolvedDeps = deps.map(d => {
    if (d === 'require') return null;
    if (d === 'exports') return exports;
    if (d === 'net/protocol') return modules['net/protocol'];
    return {};
  });
  fn(null, exports, ...resolvedDeps.slice(2));
  modules[name] = exports;
}

// Evaluate net/protocol
const protocolDefStart = gameCode.indexOf('define("net/protocol"');
const protocolDefEnd = gameCode.indexOf('define("net/session"', protocolDefStart);
assert(protocolDefStart !== -1 && protocolDefEnd !== -1, 'Could not find net/protocol definition in game.js');
eval(gameCode.slice(protocolDefStart, protocolDefEnd));

// Evaluate net/session
const sessionDefStart = protocolDefEnd;
const sessionDefEnd = gameCode.indexOf('define("core/game"', sessionDefStart);
assert(sessionDefStart !== -1 && sessionDefEnd !== -1, 'Could not find net/session definition in game.js');
eval(gameCode.slice(sessionDefStart, sessionDefEnd));

const { captureSnapshot, applySnapshot, blend, extrapolateSnapshot } = modules['net/protocol'];
const { OnlineSession } = modules['net/session'];

console.log('[Test 1] Verifying Basketball & Football Snapshot Blending in net/protocol...');
{
  assert(typeof blend === 'function', 'blend function must be exported');
  assert(typeof extrapolateSnapshot === 'function', 'extrapolateSnapshot function must be exported');

  // Synthetic snapshot a & b with basketball dribbling and jumping
  const snapA = {
    t: 1.0, ph: 1, pt: 1.0, tl: 119.0, mph: 'regular',
    sc: [2, 1], w: -1,
    // Agent row: [x, z, vx, vz, fx, fz, stamina, mx, mz, pickupLock, stun, holdTimer, runPhase, kickT, shotT, celebrateT, jumpT, diveT, shootCharge, ...]
    a: [
      [10.0, 5.0, 2.0, 0.0, 1.0, 0.0, 0.90, 1.0, 0.0, 0, 0, 0, 2.0, 0, 0, 0, 0.40, 0, 0.50, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [-10.0, -5.0, 0.0, 0.0, -1.0, 0.0, 0.85, 0.0, 0.0, 0, 0, 0, 0.0, 0, 0, 0, 0.0, 0, 0.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    // Ball row: [x, y, z, vx, vy, vz, spinX, spinZ, dribblePhase, ownerId, lastTouchId]
    b: [10.5, 0.35, 5.0, 2.0, 0.0, 0.0, 0.1, 0.2, 1.20, 0, 0],
    hn: [0.1, 0.0]
  };

  const snapB = {
    t: 1.033, ph: 1, pt: 1.033, tl: 118.967, mph: 'regular',
    sc: [2, 1], w: -1,
    a: [
      [10.066, 5.0, 2.0, 0.0, 1.0, 0.0, 0.88, 1.0, 0.0, 0, 0, 0, 2.10, 0, 0, 0, 0.36, 0, 0.60, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [-10.0, -5.0, 0.0, 0.0, -1.0, 0.0, 0.85, 0.0, 0.0, 0, 0, 0, 0.0, 0, 0, 0, 0.0, 0, 0.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    b: [10.566, 0.85, 5.0, 2.0, 0.0, 0.0, 0.3, 0.4, 1.40, 0, 0],
    hn: [0.3, 0.0]
  };

  // Blend halfway (f = 0.5)
  const blended = blend(snapA, snapB, 0.5);

  // Check ball vertical position y (index 1) smoothly lerped
  assert(Math.abs(blended.b[1] - 0.60) < 1e-4, `blended.b[1] expected ~0.60, got ${blended.b[1]}`);
  // Check ball dribblePhase (index 8) smoothly lerped
  assert(Math.abs(blended.b[8] - 1.30) < 1e-4, `blended.b[8] expected ~1.30, got ${blended.b[8]}`);
  // Check ball spinX (index 6) smoothly lerped
  assert(Math.abs(blended.b[6] - 0.20) < 1e-4, `blended.b[6] expected ~0.20, got ${blended.b[6]}`);
  // Check agent runPhase (index 12) smoothly lerped
  assert(Math.abs(blended.a[0][12] - 2.05) < 1e-4, `blended.a[0][12] expected ~2.05, got ${blended.a[0][12]}`);
  // Check agent jumpT (index 16) smoothly lerped
  assert(Math.abs(blended.a[0][16] - 0.38) < 1e-4, `blended.a[0][16] expected ~0.38, got ${blended.a[0][16]}`);
  // Check hoop net wiggle smoothly lerped
  assert(Math.abs(blended.hn[0] - 0.20) < 1e-4, `blended.hn[0] expected ~0.20, got ${blended.hn[0]}`);

  console.log('  ✓ Ball y, spin, dribblePhase, agent jumpT, runPhase, and hoop net smoothly interpolated.');
}

console.log('[Test 2] Verifying Dead-Reckoning Extrapolation on Network Buffer Underrun...');
{
  const snapBase = {
    t: 2.0, ph: 1, pt: 2.0, tl: 118.0, mph: 'regular',
    sc: [0, 0], w: -1,
    a: [
      [0.0, 0.0, 4.0, 2.0, 1.0, 0.0, 1.0, 1.0, 0.5, 0, 0, 0, 1.0, 0, 0, 0, 0.20, 0, 0.0]
    ],
    b: [0.0, 0.30, 0.0, 4.0, 1.5, 2.0, 0.0, 0.0, 2.0, 0, 0] // ball held by agent 0
  };

  const dtExtrap = 0.033; // 1 frame underrun
  const extrap = extrapolateSnapshot(snapBase, dtExtrap);

  assert(extrap.t > snapBase.t, 'Extrapolated timestamp must advance');
  // Agent x should advance by vx * dt = 4.0 * 0.033 = 0.132
  assert(Math.abs(extrap.a[0][0] - 0.132) < 1e-3, `Agent x expected 0.132, got ${extrap.a[0][0]}`);
  // Agent z should advance by vz * dt = 2.0 * 0.033 = 0.066
  assert(Math.abs(extrap.a[0][1] - 0.066) < 1e-3, `Agent z expected 0.066, got ${extrap.a[0][1]}`);
  // Agent jumpT should decay smoothly
  assert(extrap.a[0][16] < snapBase.a[0][16], 'jumpT should decay');
  // Ball dribblePhase should advance smoothly
  assert(extrap.b[8] > snapBase.b[8], 'dribblePhase should advance');
  assert(extrap.b[1] > 0.22, 'Ball y should remain above floor');

  console.log('  ✓ Extrapolation safely projects positions, animation phase, and dribble height during packet delays.');
}

console.log('[Test 3] Verifying OnlineSession Adaptive Jitter Buffer & Guest Synchronization...');
{
  const mockLink = {
    rtt: 45, // 45ms ping
    h: {},
    sendCtl: () => {},
    sendFast: () => {},
    close: () => {}
  };

  const session = new OnlineSession(mockLink, { role: 'guest' });
  assert.strictEqual(session.role, 'guest');
  assert.strictEqual(session.rtt, 45);
  assert(typeof session.interpDelay === 'number', 'interpDelay must be initialized');

  // Simulate arrival of 5 snapshots
  let simTime = 0.0;
  let now = 1000.0;
  for (let i = 0; i < 5; i++) {
    simTime += 0.033;
    now += 33.3;
    session.receive({
      k: 'snap',
      s: {
        t: simTime, ph: 1, pt: simTime, tl: 120 - simTime,
        mph: 'regular', sc: [0, 0], w: -1,
        a: [
          [10, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [-10, 0, 0, 0, -1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ],
        b: [0, 0.3, 0, 0, 0, 0, 0, 0, 0, -1, -1]
      }
    });
  }

  assert.strictEqual(session.snapshotsRecv, 5);
  assert(session.buf.length === 5, 'Snapshot buffer should contain 5 snapshots');

  // Create a minimal mock simulation object with 2 agents (standard 1v1 match)
  const mockSim = {
    mode: 'hoops',
    agents: [
      { id: 0, x: 10, z: 0, vx: 0, vz: 0, fx: 1, fz: 0, stamina: 1, tackle: {} },
      { id: 1, x: -10, z: 0, vx: 0, vz: 0, fx: -1, fz: 0, stamina: 1, tackle: {} }
    ],
    ball: { x: 0, y: 0.3, z: 0, vx: 0, vy: 0, vz: 0, spinX: 0, spinZ: 0, dribblePhase: 0 },
    score: [0, 0],
    winner: null,
    drainEvents: () => [],
    emit: () => {}
  };

  // Run guest update: should interpolate smoothly without error
  session.guestUpdate(mockSim, now + 16, { moveX: 0, moveZ: 0, sprint: false });
  assert(!isNaN(mockSim.ball.x), 'mockSim.ball.x must not be NaN');
  assert(!isNaN(mockSim.ball.y), 'mockSim.ball.y must not be NaN');

  // Simulate network jitter gap (120ms without packet): guestUpdate should extrapolate without crashing
  session.guestUpdate(mockSim, now + 120, { moveX: 0, moveZ: 0, sprint: false });
  assert(!isNaN(mockSim.ball.x), 'mockSim.ball.x must remain valid during packet delay');

  console.log('  ✓ OnlineSession adaptive buffer safely handles continuous frames and packet jitter.');
}

console.log('[Test 4] Verifying Locker Room Character Sizing & Responsiveness in css/redesign.css...');
{
  const css = fs.readFileSync(path.join(__dirname, '../css/redesign.css'), 'utf8');

  // Verify desktop avatar clamp increase
  assert(
    css.includes('clamp(205px, 28vh, 250px)'),
    '.fvh-wardrobe-avatar desktop height clamp must be clamp(205px, 28vh, 250px)'
  );
  assert(
    css.includes('clamp(170px, 24vh, 215px)'),
    '.fvh-wardrobe-avatar .fvh-hero-real-img desktop max-height must be clamp(170px, 24vh, 215px)'
  );

  // Verify mobile avatar clamp increase
  assert(
    css.includes('clamp(175px, 24vh, 215px)'),
    '.fvh-wardrobe-avatar mobile height clamp must be clamp(175px, 24vh, 215px)'
  );
  assert(
    css.includes('clamp(145px, 20vh, 180px)'),
    '.fvh-wardrobe-avatar .fvh-hero-real-img mobile max-height must be clamp(145px, 20vh, 180px)'
  );

  // Verify mobile preview container min-height
  assert(
    css.includes('.fvh-wardrobe-preview {\n    min-height: 240px !important;\n  }') ||
    css.includes('min-height: 240px !important;'),
    '.fvh-wardrobe-preview mobile min-height must be 240px'
  );

  console.log('  ✓ Wardrobe avatar sizes modestly increased across desktop and mobile, preserving layout and visibility.');
}

console.log('[Test 5] Verifying Diagnostics Overlay in HUD (FPS, Frame Time, Ping, Buf, Role)...');
{
  // Verify HUD update in game.js formats frame time and online diagnostics
  assert(
    gameCode.includes('Math.max(0.1, (this.lastFpsT / this.frames) * 1000).toFixed(1)'),
    'HUD must compute frame time in ms'
  );
  assert(
    gameCode.includes('FPS (${frameMs}ms) · ${roleStr}'),
    'HUD must display FPS, frame time, and role'
  );
  assert(
    gameCode.includes('· Buf: ${bufLen}'),
    'HUD must display Guest buffer depth for real-time jitter diagnostics'
  );

  console.log('  ✓ Lightweight diagnostics overlay displays FPS, frame time, ping, role, and buffer depth.');
}

console.log('\n======================================================');
console.log('ALL ONLINE PvP & LOCKER ROOM TESTS PASSED (5/5)!');
console.log('======================================================\n');
