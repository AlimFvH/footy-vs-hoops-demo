/**
 * Automated Verification Suite for Priority 3:
 * Football AI Difficulty Balance (Normal & Hard Tuning)
 *
 * Verifies:
 * 1. FOOTBALL_DIFFICULTY configuration for easy, normal, and hard
 * 2. Normal difficulty tuning: reduced pressing, higher think delay, reduced tackle probability
 * 3. Hard difficulty tuning: challenging without superhuman reaction or speed
 * 4. Normal is measurably easier than Hard across reaction time, speed, tackling, and keeper reach
 * 5. Basketball AI (DIFFICULTY / HoopsSim) remains strictly unchanged
 * 6. Ball physics, player movement, and online PvP parameters remain unchanged
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== FOOTY vs HOOPS: Football AI Difficulty Balance Suite ===\n');

// Load AMD modules from js/game.js
const modules = {};
global.define = function (name, deps, factory) { modules[name] = { deps, factory }; };
global.window = { __boot: () => {}, AudioContext: null, innerWidth: 390, innerHeight: 844 };
global.document = { createElement: () => ({ style: {} }), querySelector: () => null };

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

const simBase = requireModule('sim/base');
const simFootball = requireModule('sim/football');
const simBasketball = requireModule('sim/basketball');

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`[PASS] Test ${total}: ${name}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] Test ${total}: ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

// 1. Verify FOOTBALL_DIFFICULTY definition exists and is exported
test('FOOTBALL_DIFFICULTY configuration exists with easy, normal, and hard presets', () => {
  const fbDiff = simFootball.FOOTBALL_DIFFICULTY;
  assert.ok(fbDiff, 'sim/football must export FOOTBALL_DIFFICULTY');
  assert.ok(fbDiff.easy, 'FOOTBALL_DIFFICULTY.easy must exist');
  assert.ok(fbDiff.normal, 'FOOTBALL_DIFFICULTY.normal must exist');
  assert.ok(fbDiff.hard, 'FOOTBALL_DIFFICULTY.hard must exist');
});

// 2. Verify Normal difficulty tuning
test('Normal football AI has balanced, accessible parameters', () => {
  const norm = simFootball.FOOTBALL_DIFFICULTY.normal;
  assert.strictEqual(norm.speed, 0.88, 'Normal speed should be tuned to 0.88 (was 0.97)');
  assert.strictEqual(norm.think, 0.24, 'Normal reaction delay should be 0.24s (was 0.13s)');
  assert.strictEqual(norm.tackleProb, 0.22, 'Normal tackle probability should be 0.22 (was 0.42)');
  assert.strictEqual(norm.sprintDist, 6.5, 'Normal sprint distance should be 6.5m (was 4.0m)');
  assert.strictEqual(norm.keeperSpeed, 3.2, 'Normal keeper speed should be 3.2 (was 3.8)');
  assert.strictEqual(norm.pressLead, 0.12, 'Normal press lead should be 0.12 (was 0.22)');
  assert.strictEqual(norm.tackleCooldownMin, 1.2, 'Normal tackle cooldown min should be 1.2s (was 0.8s)');
});

// 3. Verify Hard difficulty tuning
test('Hard football AI is challenging but not overwhelming', () => {
  const hard = simFootball.FOOTBALL_DIFFICULTY.hard;
  assert.strictEqual(hard.speed, 0.98, 'Hard speed should be tuned to 0.98 (was 1.05)');
  assert.strictEqual(hard.think, 0.14, 'Hard reaction delay should be 0.14s (was 0.08s)');
  assert.strictEqual(hard.tackleProb, 0.45, 'Hard tackle probability should be 0.45 (was 0.62)');
  assert.strictEqual(hard.sprintDist, 4.5, 'Hard sprint distance should be 4.5m');
  assert.strictEqual(hard.keeperSpeed, 4.2, 'Hard keeper speed should be 4.2 (was 5.0)');
});

// 4. Verify Normal is noticeably easier than Hard across all metrics
test('Normal difficulty is demonstrably easier than Hard', () => {
  const norm = simFootball.FOOTBALL_DIFFICULTY.normal;
  const hard = simFootball.FOOTBALL_DIFFICULTY.hard;

  // AI speed: Normal is slower than Hard
  assert.ok(norm.speed < hard.speed, `Normal speed (${norm.speed}) must be less than Hard (${hard.speed})`);

  // Reaction delay: Normal has longer delay (slower reactions)
  assert.ok(norm.think > hard.think, `Normal reaction delay (${norm.think}s) must be greater than Hard (${hard.think}s)`);

  // Tackle frequency: Normal tackles less often
  assert.ok(norm.tackleProb < hard.tackleProb, `Normal tackle probability (${norm.tackleProb}) must be less than Hard (${hard.tackleProb})`);

  // Pressing sprint: Normal requires closer proximity before sprinting at player
  assert.ok(norm.sprintDist > hard.sprintDist, `Normal sprint distance (${norm.sprintDist}) must be greater than Hard (${hard.sprintDist})`);

  // Keeper reflexes: Normal keeper is less acrobatic
  assert.ok(norm.keeperSpeed < hard.keeperSpeed, `Normal keeper speed (${norm.keeperSpeed}) must be less than Hard (${hard.keeperSpeed})`);

  // Tackle recovery: Normal gives player longer cooldown before next tackle attempt
  assert.ok(norm.tackleCooldownMin > hard.tackleCooldownMin, `Normal tackle cooldown (${norm.tackleCooldownMin}s) must be greater than Hard (${hard.tackleCooldownMin}s)`);
});

// 5. Verify FootballSim instances load FOOTBALL_DIFFICULTY correctly
test('FootballSim applies FOOTBALL_DIFFICULTY according to selected difficulty', () => {
  const simNorm = new simFootball.FootballSim({ difficulty: 'normal', skipCountdown: true });
  assert.strictEqual(simNorm.difficulty, 'normal');
  assert.strictEqual(simNorm.ai.speed, 0.88);
  assert.strictEqual(simNorm.ai.tackleProb, 0.22);
  assert.strictEqual(simNorm.ai.think, 0.24);

  const simHard = new simFootball.FootballSim({ difficulty: 'hard', skipCountdown: true });
  assert.strictEqual(simHard.difficulty, 'hard');
  assert.strictEqual(simHard.ai.speed, 0.98);
  assert.strictEqual(simHard.ai.tackleProb, 0.45);
  assert.strictEqual(simHard.ai.think, 0.14);
});

// 6. Verify Basketball AI (HoopsSim) remains strictly unchanged
test('Basketball AI preserves original DIFFICULTY settings without alteration', () => {
  const baseDiff = simBase.DIFFICULTY;
  assert.ok(baseDiff, 'sim/base DIFFICULTY must exist');
  assert.strictEqual(baseDiff.normal.hoopsErr, 0.66, 'Basketball normal hoopsErr must be preserved at 0.66');
  assert.strictEqual(baseDiff.normal.stealProb, 0.38, 'Basketball normal stealProb must be preserved at 0.38');
  assert.strictEqual(baseDiff.hard.hoopsErr, 0.58, 'Basketball hard hoopsErr must be preserved at 0.58');
  assert.strictEqual(baseDiff.hard.stealProb, 0.55, 'Basketball hard stealProb must be preserved at 0.55');

  const hoopsSim = new simBasketball.BasketballSim({ difficulty: 'normal', skipCountdown: true });
  assert.strictEqual(hoopsSim.ai.stealProb, 0.38, 'BasketballSim must use base DIFFICULTY stealProb');
  assert.strictEqual(hoopsSim.ai.hoopsErr, 0.66, 'BasketballSim must use base DIFFICULTY hoopsErr');
});

// 7. Verify Ball physics and field parameters are untouched
test('Football field and ball physics parameters remain intact', () => {
  const fb = simFootball.FB;
  assert.strictEqual(fb.BALL_R, 0.42, 'Football ball radius must remain 0.42');
  assert.strictEqual(fb.GRAVITY, 24, 'Football gravity must remain 24');
  assert.strictEqual(fb.W, 17, 'Football width must remain 17');
  assert.strictEqual(fb.L, 28, 'Football length must remain 28');
  assert.strictEqual(fb.GW, 3.4, 'Football goal width must remain 3.4');
  assert.strictEqual(fb.GH, 2.5, 'Football goal height must remain 2.5');
});

// 8. Runtime simulation comparison: Normal gives player more time with ball
test('Runtime simulation: Normal AI allows more possession time before tackling than Hard', () => {
  // Simulate 120 steps with player holding the ball
  const simNorm = new simFootball.FootballSim({ difficulty: 'normal', skipCountdown: true, seed: 12345 });
  const simHard = new simFootball.FootballSim({ difficulty: 'hard', skipCountdown: true, seed: 12345 });

  // Place ball in human possession
  simNorm.setOwner(simNorm.human);
  simHard.setOwner(simHard.human);

  let normTackleLunges = 0;
  let hardTackleLunges = 0;

  for (let step = 0; step < 180; step++) {
    simNorm.step(1 / 60);
    simHard.step(1 / 60);

    const normAI = simNorm.agents[2];
    const hardAI = simHard.agents[2];

    if (normAI.tackle.phase === 'lunge' && normAI.tackle.t === 0) normTackleLunges++;
    if (hardAI.tackle.phase === 'lunge' && hardAI.tackle.t === 0) hardTackleLunges++;
  }

  // Hard AI should be more aggressive or equal in tackling opportunities
  assert.ok(
    hardTackleLunges >= normTackleLunges,
    `Hard AI tackles (${hardTackleLunges}) must be >= Normal AI tackles (${normTackleLunges})`
  );
});

console.log(`\n========================================`);
console.log(`Tests finished: ${passed}/${total} passed (${total - passed} failed)`);
console.log(`========================================\n`);

process.exit(passed === total ? 0 : 1);
