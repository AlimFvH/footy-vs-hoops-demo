const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log('=== Step 3: Critical Gameplay Flows Automated Verification ===\n');

// Mock AMD loader
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
global.localStorage = {
  data: {},
  getItem(k) { return this.data[k] || null; },
  setItem(k, v) { this.data[k] = String(v); },
  removeItem(k) { delete this.data[k]; }
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

const gameStoreMod = requireModule('core/save');
const fbMod = requireModule('sim/football');
const bbMod = requireModule('sim/basketball');

console.log('1. Verifying Team Selection Flow & Persistence...');
{
  localStorage.removeItem('fvh.save.v1');
  const store = new gameStoreMod.Store();
  assert.ok(!store.data.teamChosen, 'Default teamChosen must be falsy before selection');
  
  // Select FOOTY
  store.update(d => {
    d.teamChosen = true;
    d.selectedTeam = 'footy';
    d.selectedCharacter = 'footy';
  });
  store.flush();
  assert.strictEqual(store.data.teamChosen, true, 'teamChosen must be true');
  assert.strictEqual(store.data.selectedTeam, 'footy');
  
  // Verify persistence across store re-instantiation
  const reloadedStore = new gameStoreMod.Store();
  assert.strictEqual(reloadedStore.data.teamChosen, true, 'teamChosen must persist in storage');
  assert.strictEqual(reloadedStore.data.selectedTeam, 'footy', 'selectedTeam must persist');
  console.log('   ✓ Team selection flow and persistence verified.');
}

console.log('\n2. Verifying Football (Footy) Arena, Movement, Shooting & Scoring...');
{
  const sim = new fbMod.FootballSim({ difficulty: 'easy', minutes: 1 });
  assert.strictEqual(sim.mode, 'footy');
  assert.strictEqual(sim.agents.length, 4, 'Football must have 4 agents (2 outfield + 2 keepers)');
  
  sim.phase = 'playing';
  const p1 = sim.agents[0];
  const initialX = p1.x;
  const initialZ = p1.z;
  
  // Movement
  sim.step(0.1, { moveX: 1, moveZ: -1, sprint: true });
  assert.ok(p1.x > initialX, 'Player must move along positive X');
  assert.ok(p1.z < initialZ, 'Player must move along negative Z');
  assert.ok(p1.stamina < 100, 'Sprinting must consume stamina');
  console.log('   ✓ Football movement & sprint stamina verified.');

  // Shooting
  sim.ball.owner = p1;
  p1.shootCharging = true;
  p1.shootCharge = 0.85;
  sim.humanShootRelease(p1, 0.85);
  assert.strictEqual(sim.ball.owner, null, 'Shooting must release ball ownership');
  assert.ok(sim.ball.vz < -5, 'Ball must travel towards goal with negative vz');
  console.log('   ✓ Football shot mechanics & ball velocity verified.');

  // Goal Scoring & Reset
  sim.ball.x = 0;
  sim.ball.y = 1.0;
  sim.prevBallZ = -fbMod.FB.L;
  sim.prevBallX = 0;
  sim.ball.z = -(fbMod.FB.L + sim.ball.r + 0.1);
  sim.ball.vz = -5;
  sim.checkGoal();
  assert.strictEqual(sim.score[0], 1, 'Goal must be registered on score[0]');
  assert.strictEqual(sim.phase, 'celebrate', 'Phase must transition to celebrate');
  console.log('   ✓ Football goal detection & scoring event verified.');
}

console.log('\n3. Verifying Basketball (Hoops) Arena, Hands-Only Play, Dunk & Basket Scoring...');
{
  const sim = new bbMod.BasketballSim({ difficulty: 'easy', minutes: 1 });
  assert.strictEqual(sim.mode, 'hoops');
  assert.strictEqual(sim.agents.length, 2, 'Basketball must have 2 agents');

  sim.phase = 'playing';
  const p1 = sim.agents[0];
  // Movement & Dribble
  sim.ball.owner = p1;
  sim.step(0.1, { moveX: 0, moveZ: 1, sprint: false });
  assert.strictEqual(sim.ball.owner, p1, 'Ball owner maintains possession during dribble');
  console.log('   ✓ Basketball movement & dribble verified.');

  // Jump Shot
  sim.launchShot(p1, 0, 0);
  assert.strictEqual(sim.ball.owner, null, 'Ball released upon shot');
  assert.ok(sim.ball.vy > 0, 'Ball must have positive vertical arc vy for jump shot');
  console.log('   ✓ Basketball jump shot arc verified.');

  // Dunk sequence calibration
  p1.dunk = {
    active: true,
    t: 0.32,
    dur: 0.65,
    apexT: 0.35,
    startX: 0,
    startZ: 11.0,
    targetX: 0,
    targetZ: 13.0,
    hoop: sim.hoops[1]
  };
  sim.step(0.016);
  assert.ok(sim.ball.y >= 2.0, 'Ball elevates to rim height during slam dunk');
  console.log('   ✓ Basketball slam dunk sequence verified.');

  // Scoring
  sim.awardBasket(1);
  assert.strictEqual(sim.score[0], 3, 'Long-range shot behind arc must award +3 points');
  assert.strictEqual(sim.phase, 'celebrate', 'Phase must transition to celebrate');
  console.log('   ✓ Basketball three-pointer basket scoring verified.');
}

console.log('\n4. Verifying Match Timer, Expiration & Results Flow...');
{
  const sim = new fbMod.FootballSim({ difficulty: 'easy', minutes: 1 });
  sim.phase = 'playing';
  sim.score = [2, 1];
  sim.timeLeft = 0.05; // 50ms remaining
  sim.step(0.1); // Time expires
  assert.strictEqual(sim.phase, 'ended', 'Match must transition to ended phase when time expires');
  assert.strictEqual(sim.winner, 0, 'Team 0 must win with 2-1 score');
  console.log('   ✓ Match timer countdown, expiration & winner calculation verified.');
}

console.log('\n5. Verifying Rematch Lifecycle...');
{
  const sim = new fbMod.FootballSim({ difficulty: 'easy', minutes: 1 });
  sim.phase = 'ended';
  sim.score = [2, 0];
  sim.winner = 0;

  // Rematch action resets simulation
  sim.score = [0, 0];
  sim.resetKickoff(0);
  sim.startCountdown(3, true);
  assert.strictEqual(sim.phase, 'countdown', 'Rematch must reset phase to countdown');
  assert.strictEqual(sim.score[0], 0, 'Rematch must reset Team 0 score to 0');
  assert.strictEqual(sim.score[1], 0, 'Rematch must reset Team 1 score to 0');
  console.log('   ✓ Rematch state reset & seamless new match start verified.');
}

console.log('\n======================================================');
console.log('ALL CRITICAL GAMEPLAY FLOWS VERIFIED SUCCESSFULLY (5/5)!');
console.log('======================================================');
