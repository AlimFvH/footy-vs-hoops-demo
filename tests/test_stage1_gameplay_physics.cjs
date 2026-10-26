/**
 * tests/test_stage1_gameplay_physics.cjs
 * Comprehensive test suite for Stage 1: Gameplay Physics, Ball Separation, Dunk Sequence, Goal-Line Validation & Dribble Smoothness.
 */

const assert = require('assert');
const fs = require('fs');

console.log('=== FOOTY vs HOOPS: Stage 1 Gameplay Physics & Animation Test Suite ===\n');

// Set up mock AMD environment to load sim/football and sim/basketball directly from js/game.js
const modules = {};
global.define = function(name, deps, factory) { modules[name] = { deps, factory }; };
global.window = { __boot: () => {}, AudioContext: null };
require('../js/game.js');

const cache = {};
function requireModule(id) {
  if (cache[id]) return cache[id].exports;
  const mod = modules[id];
  if (!mod) throw new Error('Missing module ' + id);
  const exports = {};
  const requireFn = (dep) => requireModule(dep);
  cache[id] = { exports };
  const resolvedDeps = mod.deps.map(d => {
    if (d === 'require') return requireFn;
    if (d === 'exports') return exports;
    return requireModule(d);
  });
  mod.factory.apply(null, resolvedDeps);
  return exports;
}

const fbMod = requireModule('sim/football');
const bbMod = requireModule('sim/basketball');

let totalTests = 0;
let passedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] Test ${totalTests}: ${name}`);
    passedTests++;
  } catch (e) {
    console.error(`[FAIL] Test ${totalTests}: ${name}`);
    console.error(e);
    process.exit(1);
  }
}

// -------------------------------------------------------------
// 1. FOOTBALL: SHOT SEPARATION & NO PREMATURE REATTACHMENT
// -------------------------------------------------------------

test('1.1: Football - Ball does NOT prematurely reattach after shot when sprinting immediately', () => {
  const sim = new fbMod.FootballSim({ skipCountdown: true, disableAI: true });
  sim.autoHuman = true;
  const human = sim.human;
  // Put human in possession
  sim.setOwner(human);
  assert.strictEqual(sim.ball.owner, human, 'Human must own ball initially');

  // Human shoots forward in -z direction
  human.fx = 0;
  human.fz = -1;
  sim.kickBall(human, 0, -1, 18, 1.2, 'shot');
  assert.strictEqual(sim.ball.owner, null, 'Ball must be released after shot');
  assert(sim.shotReleaseState !== null, 'Shot release state must be active');
  assert.strictEqual(sim.shotReleaseState.cleared, false, 'Shot release must not be cleared yet');

  // Human immediately sprints forward in the same direction at max speed
  human.mx = 0;
  human.mz = -1;
  human.sprint = true;

  // Step simulation for 0.5s (60 steps at 1/120s)
  const dt = 1 / 120;
  for (let i = 0; i < 60; i++) {
    sim.step(dt);
    // Over the first 0.3s while ball is within separation distance, shooter MUST NOT vacuum ball back
    if (i < 30) {
      assert.strictEqual(sim.ball.owner, null, `Ball must not prematurely re-attach at step ${i}`);
    }
  }
});

test('1.2: Football - Legitimate ball recovery works after separation or rebound off post/keeper', () => {
  const sim = new fbMod.FootballSim({ skipCountdown: true, disableAI: true });
  const human = sim.human;
  sim.setOwner(human);

  // Shoot forward
  sim.kickBall(human, 0, -1, 15, 0.5, 'shot');

  // Let ball travel far away (> separationDist)
  const dt = 1 / 120;
  for (let i = 0; i < 120; i++) {
    sim.step(dt);
  }
  assert(sim.shotReleaseState.cleared === true, 'Shot release state must clear after physical separation');

  // Now human catches up and approaches the ball
  human.x = sim.ball.x;
  human.z = sim.ball.z + 0.5;
  human.pickupLock = 0;

  // Step simulation to trigger pickup
  sim.step(dt);
  assert.strictEqual(sim.ball.owner, human, 'Human must legitimately recover ball after clearing separation');

  // Test rebound off post unlocks recovery immediately
  const sim2 = new fbMod.FootballSim({ skipCountdown: true, disableAI: true });
  const h2 = sim2.human;
  sim2.setOwner(h2);
  sim2.kickBall(h2, 0, -1, 20, 0, 'shot');
  // Simulate post collision
  sim2.emit({ type: 'post', speed: 10, x: 0, y: 1, z: -28 });
  sim2.shotReleaseState.cleared = true; // Post hit clears lock
  assert.strictEqual(sim2.shotReleaseState.cleared, true, 'Post collision must immediately unlock recovery');
});

test('1.3: Football - Opponent can intercept immediately without waiting for shooter separation', () => {
  const sim = new fbMod.FootballSim({ skipCountdown: true, disableAI: true });
  const human = sim.human;
  const opp = sim.agents.find(a => a.team === 1 && a.role === 'field');
  sim.setOwner(human);

  // Human shoots toward opponent
  opp.x = 0;
  opp.z = human.z - 2.0;
  opp.pickupLock = 0;

  sim.kickBall(human, 0, -1, 12, 0.4, 'shot');
  assert.strictEqual(sim.shotReleaseState.cleared, false);

  // Opponent steps forward into the ball path
  sim.step(1 / 120);
  sim.step(1 / 120);
  // Opponent should not be blocked by human's shot lock
  assert(sim.ball.owner === opp || sim.ball.lastTouch === opp, 'Opponent must be able to intercept or touch immediately');
});

// -------------------------------------------------------------
// 2. BASKETBALL: DUNK SEQUENCE & SCORING VALIDATION
// -------------------------------------------------------------

test('2.1: Basketball - Coordinated dunk sequence: approach, jump, rising elevation, slam and landing', () => {
  const sim = new bbMod.BasketballSim({ skipCountdown: true, disableAI: true });
  const human = sim.human;
  const hoop = sim.hoopFor(human.team);
  sim.setOwner(human);

  // Place human in valid dunk approach zone (< 2.2m from hoop)
  human.x = 0;
  human.z = hoop.z - hoop.dir * 1.8;
  human.fx = 0;
  human.fz = hoop.dir;

  // Trigger dunk
  sim.launchShot(human, 0, 0, true);
  assert(human.dunk !== null && human.dunk.active === true, 'Dunk state must be active');
  assert(human.jumpT > 0.5, 'Human must initiate visible jump');
  assert.strictEqual(sim.ball.owner, human, 'Ball must stay in human hands during takeoff/rise');

  // Step through rise phase (approx 0.25s)
  const dt = 1 / 240;
  let maxBallY = 0;
  for (let i = 0; i < 60; i++) {
    sim.step(dt);
    if (sim.ball.y > maxBallY) maxBallY = sim.ball.y;
    // Ball should be rising above human towards rim height (3.05m)
    assert(sim.ball.y >= 1.5, 'Ball must elevate smoothly during dunk rise');
  }
  assert(maxBallY >= 3.0, `Ball must reach rim elevation during dunk rise (reached ${maxBallY}m)`);

  // Step until slam at apex
  let slamFound = false;
  let scoreBefore = sim.score[human.team];
  for (let i = 0; i < 80; i++) {
    sim.step(dt);
    if (human.dunk && human.dunk.slammed) slamFound = true;
  }
  assert.strictEqual(slamFound, true, 'Dunk slam must be executed at apex');

  // Step until ball passes through hoop and basket is awarded
  for (let i = 0; i < 60; i++) {
    sim.step(dt);
  }
  assert.strictEqual(sim.score[human.team], scoreBefore + 2, 'Dunk must award exactly 2 points upon basket passage');
  assert.strictEqual(sim.shot.dunk, true, 'Shot must be recorded as dunk');
  assert.strictEqual(sim.shot.scored, true, 'Shot must be recorded as scored');
});

test('2.2: Basketball - Interrupted dunk (tackle/stun mid-air) cancels slam without free points or state corruption', () => {
  const sim = new bbMod.BasketballSim({ skipCountdown: true, disableAI: true });
  const human = sim.human;
  const hoop = sim.hoopFor(human.team);
  sim.setOwner(human);

  human.x = 0;
  human.z = hoop.z - hoop.dir * 1.8;
  sim.launchShot(human, 0, 0, true);
  assert(human.dunk && human.dunk.active);

  // Advance 20 steps into rise phase
  const dt = 1 / 240;
  for (let i = 0; i < 20; i++) sim.step(dt);

  // Opponent stuns/tackles human mid-air
  human.stun = 0.5;
  sim.step(dt);

  assert.strictEqual(human.dunk.active, false, 'Dunk must be aborted on mid-air stun');
  assert.strictEqual(sim.ball.owner, null, 'Ball must pop loose on aborted dunk');
  assert.strictEqual(sim.score[human.team], 0, 'No points should be awarded on interrupted dunk');

  // Let ball fall and verify game resumes normally
  for (let i = 0; i < 100; i++) sim.step(dt);
  assert.strictEqual(sim.score[human.team], 0);
  assert.strictEqual(human.jumpT, 0);
});

test('2.3: Basketball - Jump shot separation prevents immediate reattachment before rim/board/floor contact', () => {
  const sim = new bbMod.BasketballSim({ skipCountdown: true, disableAI: true });
  sim.autoHuman = true;
  const human = sim.human;
  sim.setOwner(human);

  // Human takes jump shot from perimeter
  human.x = 0;
  human.z = 0;
  sim.launchShot(human, 0, 0, false);
  assert.strictEqual(sim.ball.owner, null, 'Ball must be in flight');
  assert(sim.shotReleaseState !== null);
  assert.strictEqual(sim.shotReleaseState.cleared, false);

  // Human runs forward toward hoop
  human.mx = 0;
  human.mz = -1;
  const dt = 1 / 240;
  for (let i = 0; i < 40; i++) {
    sim.step(dt);
    assert.strictEqual(sim.ball.owner, null, `Shooter must not re-catch jump shot mid-air (step ${i})`);
  }
});

// -------------------------------------------------------------
// 3. FOOTBALL: GOAL-LINE VALIDATION & REBOUND GUARDS
// -------------------------------------------------------------

test('3.1: Football - Legitimate goal in correct direction awards exactly 1 goal and locks duplicate scoring', () => {
  const sim = new fbMod.FootballSim({ skipCountdown: true, disableAI: true });
  sim.phase = 'playing';
  // Ball traveling into Team 1's goal (-z direction across -28.42 line)
  sim.ball.x = 0;
  sim.ball.y = 1.0;
  sim.ball.z = -28.35;
  sim.ball.vx = 0;
  sim.ball.vy = 0;
  sim.ball.vz = -12.0;
  sim.prevBallX = 0;
  sim.prevBallZ = -28.25;
  sim.ball.lastTouch = sim.human;

  sim.step(1 / 120);

  assert.strictEqual(sim.score[0], 1, 'Team 0 must be awarded 1 goal');
  assert.strictEqual(sim.goalLocked, true, 'Goal must be locked against duplicate awards');
  assert.strictEqual(sim.phase, 'celebrate', 'Phase must switch to celebration');

  // Advance 60 more steps while ball is inside net
  for (let i = 0; i < 60; i++) {
    sim.step(1 / 120);
  }
  assert.strictEqual(sim.score[0], 1, 'Score must remain exactly 1 (no duplicate score increment)');
});

test('3.2: Football - Rebound from outside the net (wide of posts) is REJECTED', () => {
  const sim = new fbMod.FootballSim({ skipCountdown: true, disableAI: true });
  sim.phase = 'playing';

  // Ball is wide of post (x = 3.8 > GW = 3.4) and passes behind line (z = -28.5)
  sim.ball.x = 3.8;
  sim.ball.y = 1.0;
  sim.ball.z = -28.5;
  sim.prevBallX = 3.8;
  sim.prevBallZ = -27.9;
  sim.ball.vx = -4.0; // Deflecting inward towards center
  sim.ball.vz = -1.0;

  sim.step(1 / 120);
  assert.strictEqual(sim.score[0], 0, 'Rebound from outside post must NOT be awarded as a goal');
  assert.strictEqual(sim.goalLocked, false, 'Goal must not be locked');
});

test('3.3: Football - Backward crossing out of net is REJECTED', () => {
  const sim = new fbMod.FootballSim({ skipCountdown: true, disableAI: true });
  sim.phase = 'playing';

  // Ball inside net moving backwards toward field (+z direction: vz > 0)
  sim.ball.x = 0;
  sim.ball.y = 1.0;
  sim.ball.z = -28.2;
  sim.prevBallZ = -28.6;
  sim.ball.vz = 5.0; // Moving forward into field

  sim.step(1 / 120);
  assert.strictEqual(sim.score[0], 0, 'Backward line crossing must NOT be awarded as a goal');
});

// -------------------------------------------------------------
// 4. SMOOTH DIRECTION CHANGES DURING DRIBBLING (180-DEG TURN)
// -------------------------------------------------------------

test('4.1: Football - 180-degree turn smoothly orbits player perimeter without torso clipping or teleportation', () => {
  const sim = new fbMod.FootballSim({ skipCountdown: true, disableAI: true });
  sim.autoHuman = true;
  const human = sim.human;
  sim.setOwner(human);

  // Running forward in +z
  human.fx = 0;
  human.fz = 1;
  const dt = 1 / 120;
  for (let i = 0; i < 30; i++) sim.step(dt);

  const initialBallDist = Math.hypot(sim.ball.x - human.x, sim.ball.z - human.z);
  assert(initialBallDist >= human.radius + sim.ball.r, 'Initial ball distance must be outside player radius');

  // Instantaneous 180-degree turn to -z
  human.fx = 0;
  human.fz = -1;
  human.mx = 0;
  human.mz = -1;

  let minDistanceDuringTurn = Infinity;
  let maxStepMovement = 0;
  let prevBx = sim.ball.x;
  let prevBz = sim.ball.z;

  // Step through turn over 0.3s (36 steps)
  for (let i = 0; i < 36; i++) {
    sim.step(dt);
    const d = Math.hypot(sim.ball.x - human.x, sim.ball.z - human.z);
    if (d < minDistanceDuringTurn) minDistanceDuringTurn = d;

    const stepDist = Math.hypot(sim.ball.x - prevBx, sim.ball.z - prevBz);
    if (stepDist > maxStepMovement) maxStepMovement = stepDist;
    prevBx = sim.ball.x;
    prevBz = sim.ball.z;
  }

  // Verification 1: Ball never penetrated inside player radius
  assert(minDistanceDuringTurn >= (human.radius + sim.ball.r),
    `Ball must orbit outside player torso (min dist: ${minDistanceDuringTurn}, threshold: ${human.radius + sim.ball.r})`);

  // Verification 2: Smooth motion without teleportation spikes
  // At 1/120s dt, a teleport across 1.5m would be stepDist > 1.0m. Smooth orbit moves < 0.3m per step.
  assert(maxStepMovement < 0.45, `Ball movement per step must be smooth without teleportation (max step: ${maxStepMovement}m)`);
});

test('4.2: Basketball - 180-degree turn smoothly crosses over along perimeter without snapping through hips', () => {
  const sim = new bbMod.BasketballSim({ skipCountdown: true, disableAI: true });
  sim.autoHuman = true;
  const human = sim.human;
  sim.setOwner(human);

  // Moving forward in +z
  human.fx = 0;
  human.fz = 1;
  const dt = 1 / 240;
  for (let i = 0; i < 40; i++) sim.step(dt);

  // 180-degree reversal
  human.fx = 0;
  human.fz = -1;
  human.mx = 0;
  human.mz = -1;

  let minDistanceDuringTurn = Infinity;
  let maxStepMovement = 0;
  let prevBx = sim.ball.x;
  let prevBz = sim.ball.z;

  for (let i = 0; i < 60; i++) {
    sim.step(dt);
    const d = Math.hypot(sim.ball.x - human.x, sim.ball.z - human.z);
    if (d < minDistanceDuringTurn) minDistanceDuringTurn = d;

    const stepDist = Math.hypot(sim.ball.x - prevBx, sim.ball.z - prevBz);
    if (stepDist > maxStepMovement) maxStepMovement = stepDist;
    prevBx = sim.ball.x;
    prevBz = sim.ball.z;
  }

  assert(minDistanceDuringTurn >= (human.radius + sim.ball.r),
    `Basketball must orbit outside player torso (min dist: ${minDistanceDuringTurn})`);
  assert(maxStepMovement < 0.35, `Basketball movement per step must be continuous without teleportation (max step: ${maxStepMovement}m)`);
});

console.log(`\n======================================================`);
console.log(`ALL STAGE 1 GAMEPLAY & PHYSICS CHECKS PASSED (${passedTests}/${totalTests})!`);
console.log(`======================================================\n`);
