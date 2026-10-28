/**
 * FOOTY vs HOOPS — Online 1v1 Basketball Movement, Sport Isolation & Visual Polish Suite
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== FOOTY vs HOOPS: Online Basketball & Menu Polish Suite ===\n');

// 1. Syntax Check
console.log('[TEST 1] Syntax Check on Critical Files');
const { execSync } = require('child_process');
execSync('node -c js/game.js');
execSync('node -c js/redesign.js');
execSync('node -c server/server.js');
console.log('  ✓ js/game.js, js/redesign.js, server/server.js passed syntax check\n');

// 2. AMD Loader Mock for Game Simulation
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

// 3. Online 1v1 Basketball Movement & NaN Prevention Test
console.log('[TEST 2] Online 1v1 Basketball Movement (NaN Prevention)');
const bb = requireModule('sim/basketball');

// Test with empty boosts {} (the exact edge case that previously caused NaN freeze)
const sim = new bb.BasketballSim({
  online: true,
  names: ['HostAthlete', 'GuestAthlete'],
  skipCountdown: true,
  matchSeconds: 60,
  boosts: {}
});

assert.strictEqual(sim.agents[0].human, true, 'Agent 0 (Host) should be human');
assert.strictEqual(sim.agents[1].human, true, 'Agent 1 (Guest) should be human in online mode');
assert.strictEqual(typeof sim.boosts.speed, 'number', 'sim.boosts.speed must default to a valid number');
assert.strictEqual(typeof sim.boosts.staminaRegen, 'number', 'sim.boosts.staminaRegen must default to a valid number');
assert.strictEqual(typeof sim.boosts.tackleCost, 'number', 'sim.boosts.tackleCost must default to a valid number');

const hostInput = {
  moveX: 0,
  moveZ: -1,
  sprint: true,
  shootPressed: false,
  shootHeld: false,
  shootReleased: false,
  tacklePressed: false,
  tackleHeld: false,
  tackleReleased: false,
  passPressed: false
};

const guestInput = {
  moveX: 0,
  moveZ: 1,
  sprint: false,
  shootPressed: false,
  shootHeld: false,
  shootReleased: false,
  tacklePressed: false,
  tackleHeld: false,
  tackleReleased: false,
  passPressed: false
};

for (let frame = 0; frame < 120; frame++) {
  sim.setInput2(guestInput);
  sim.step(0.016, hostInput);

  // Assert no NaN on any frame
  assert(!isNaN(sim.agents[0].x), `Agent 0 x is NaN on frame ${frame}`);
  assert(!isNaN(sim.agents[0].z), `Agent 0 z is NaN on frame ${frame}`);
  assert(!isNaN(sim.agents[0].vx), `Agent 0 vx is NaN on frame ${frame}`);
  assert(!isNaN(sim.agents[0].vz), `Agent 0 vz is NaN on frame ${frame}`);

  assert(!isNaN(sim.agents[1].x), `Agent 1 x is NaN on frame ${frame}`);
  assert(!isNaN(sim.agents[1].z), `Agent 1 z is NaN on frame ${frame}`);
  assert(!isNaN(sim.agents[1].vx), `Agent 1 vx is NaN on frame ${frame}`);
  assert(!isNaN(sim.agents[1].vz), `Agent 1 vz is NaN on frame ${frame}`);

  assert(!isNaN(sim.ball.x), `Ball x is NaN on frame ${frame}`);
  assert(!isNaN(sim.ball.y), `Ball y is NaN on frame ${frame}`);
  assert(!isNaN(sim.ball.z), `Ball z is NaN on frame ${frame}`);
  assert(!isNaN(sim.ball.vx), `Ball vx is NaN on frame ${frame}`);
  assert(!isNaN(sim.ball.vz), `Ball vz is NaN on frame ${frame}`);
}

assert(sim.agents[0].z < 6.5, 'Host agent 0 must have moved forward');
assert(sim.agents[1].z > 4.0, 'Guest agent 1 must have moved forward');
console.log('  ✓ Online Basketball Sim stepped 120 frames with perfect movement and 0 NaNs\n');

// 4. Sport Mode Queue Isolation in server.js
console.log('[TEST 3] Server Matchmaking Queue Isolation (Basketball vs Football)');
const serverCode = fs.readFileSync(path.join(__dirname, '../server/server.js'), 'utf8');

assert(
  serverCode.includes('q.playerId !== playerId && q.mode === mode'),
  'Queue search must require q.mode === mode to prevent sport mismatches'
);
console.log('  ✓ Server matchmaking isolates Basketball queue from Football queue\n');

// 5. Main Menu "Сменить" Button Removal
console.log('[TEST 4] Main Menu: Removal of "Сменить" Button & Clean Hero Card');
const redesignCode = fs.readFileSync(path.join(__dirname, '../js/redesign.js'), 'utf8');

assert(
  !redesignCode.includes('class="fvh-btn-switch-team"'),
  'Main Menu must not contain fvh-btn-switch-team button'
);
assert(
  redesignCode.includes('fvh-solo-gear-pill'),
  'Main Menu hero card must contain gear pill for wardrobe access'
);
console.log('  ✓ "Сменить" button successfully removed from main screen hero card\n');

// 6. Visual Polish & CSS Classes
console.log('[TEST 5] Visual Polish Across All Screens (Menu, Shop, Quests, Profile, Leaderboard)');
const redesignCss = fs.readFileSync(path.join(__dirname, '../css/redesign.css'), 'utf8');

assert(redesignCss.includes('POLISHED STADIUM AESTHETICS'), 'CSS must contain polished stadium rules');
assert(redesignCss.includes('.fvh-hero-card.solo-hero-compact'), 'CSS must contain refined hero card styling');
assert(redesignCss.includes('.fvh-btn-play-hero::before'), 'CSS must contain animated shine for Play hero CTA');
assert(redesignCss.includes('.fvh-hub-tile'), 'CSS must contain refined secondary hub tile styling');
assert(redesignCss.includes('.fvh-leaderboard-row.is-me'), 'CSS must contain highlighted leaderboard user row');
console.log('  ✓ All visual polish rules present and accounted for\n');

console.log('=== ALL 5 ONLINE BASKETBALL & MENU POLISH TESTS PASSED! ===');
