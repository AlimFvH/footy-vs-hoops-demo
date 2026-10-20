const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== FOOTY vs HOOPS Basketball Hoops & Scoring Verification Suite ===\n');

const gameCode = fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8');

const modules = {};
function define(name, deps, fn) {
  modules[name] = { deps, fn };
}

const sandbox = {
  define,
  window: {
    innerWidth: 1280,
    innerHeight: 800,
    setTimeout: (fn, ms) => setTimeout(fn, ms),
    clearTimeout: (id) => clearTimeout(id),
    __boot: () => {}
  },
  document: {
    documentElement: { lang: 'ru', dir: 'ltr' },
    createElement: () => ({ getContext: () => ({}) }),
    addEventListener: () => {}
  },
  navigator: { language: 'ru', languages: ['ru', 'en'], userAgent: 'node' },
  console,
  Math,
  Object,
  Array,
  String,
  Number,
  Boolean,
  Date,
  JSON,
  Float32Array,
  Uint16Array,
  Uint8Array,
  Map,
  Set,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval
};

vm.createContext(sandbox);
vm.runInContext(gameCode, sandbox);

function requireModule(name) {
  const mod = modules[name];
  if (!mod) throw new Error('Module not found: ' + name);
  if (mod.exports) return mod.exports;
  const exp = {};
  mod.exports = exp;
  const resolved = (mod.deps || []).map(d => {
    if (d === 'require') return (dep) => requireModule(dep);
    if (d === 'exports') return exp;
    return requireModule(d);
  });
  mod.fn.apply(null, resolved);
  return exp;
}

const bbMod = requireModule('sim/basketball');
const BB = bbMod.BB;
const BasketballSim = bbMod.BasketballSim;

let passed = 0;
let total = 0;
function check(condition, message) {
  total++;
  if (!condition) {
    console.error(`[FAIL] Test ${total}: ${message}`);
    process.exit(1);
  } else {
    console.log(`[PASS] Test ${total}: ${message}`);
    passed++;
  }
}

// 1. Verify Constants
console.log('--- 1. Basketball Physical & Visual Constants ---');
check(BB.HOOP_Z === 12.6, 'Hoop Z coordinate is exactly 12.6m');
check(BB.RIM_H === 3.05, 'Rim height is official 3.05m');
check(BB.RIM_Y === 3.05, 'BB.RIM_Y alias exists and equals 3.05m');
check(BB.RIM_R === 0.62, 'Rim radius is 0.62m');
check(BB.RIM_TUBE === 0.045, 'Rim tube radius is 0.045m');
check(BB.RIM_T === 0.045, 'BB.RIM_T alias exists and equals 0.045m');
check(BB.NET_H === 0.68, 'BB.NET_H is defined (0.68m)');
check(BB.BOARD_OFFSET === 0.86, 'Backboard offset is 0.86m');

// 2. Test Scoring on Hoop 0 (+12.6)
console.log('\n--- 2. Basketball Scoring on Hoop 0 (+12.6) ---');
const sim0 = new BasketballSim({ matchSeconds: 60, skipCountdown: true, disableAI: true });
sim0.phase = 'playing';
sim0.score = [0, 0];
check(sim0.hoops[0].z === 12.6, 'Hoop 0 is located at +12.6m');

// Step 1: Ball enters cylinder above rim -> arm the hoop
sim0.ball.x = 0;
sim0.ball.z = BB.HOOP_Z;
sim0.ball.y = BB.RIM_H + 0.5;
sim0.ball.vy = -2.0;
sim0.shot = { shooter: sim0.agents[0], team: 0, points: 2, touchedRim: false, touchedBoard: false, scored: false };
sim0.checkScoring();
check(sim0.hoops[0].armed === true, 'Hoop 0 becomes ARMED when ball passes downward above rim');

// Step 2: Ball descends below rim -> basket awarded
sim0.ball.y = BB.RIM_H - 0.4;
sim0.checkScoring();
check(sim0.score[1] === 2, 'Team 1 successfully awarded 2 points for basket in Hoop 0');
check(sim0.hoops[0].net === 1, 'Hoop 0 net swish animation triggered (net = 1)');

// 3. Test Scoring on Hoop 1 (-12.6)
console.log('\n--- 3. Basketball Scoring on Hoop 1 (-12.6) ---');
const sim1 = new BasketballSim({ matchSeconds: 60, skipCountdown: true, disableAI: true });
sim1.phase = 'playing';
sim1.score = [0, 0];
check(sim1.hoops[1].z === -12.6, 'Hoop 1 is located at -12.6m');

// Step 1: Ball enters cylinder above rim -> arm the hoop
sim1.ball.x = 0;
sim1.ball.z = -BB.HOOP_Z;
sim1.ball.y = BB.RIM_H + 0.5;
sim1.ball.vy = -2.0;
sim1.shot = { shooter: sim1.agents[0], team: 0, points: 3, touchedRim: false, touchedBoard: false, scored: false };
sim1.checkScoring();
check(sim1.hoops[1].armed === true, 'Hoop 1 becomes ARMED when ball passes downward above rim');

// Step 2: Ball descends below rim -> basket awarded
sim1.ball.y = BB.RIM_H - 0.4;
sim1.checkScoring();
check(sim1.score[0] === 3, 'Team 0 successfully awarded 3 points for 3-pointer in Hoop 1');
check(sim1.hoops[1].net === 1, 'Hoop 1 net swish animation triggered (net = 1)');

// 4. Test Rim Rebound Physics
console.log('\n--- 4. Rim Rebound Physics ---');
const simRim = new BasketballSim({ matchSeconds: 60, skipCountdown: true, disableAI: true });
simRim.phase = 'playing';
simRim.ball.x = 0;
simRim.ball.z = BB.HOOP_Z - (BB.RIM_R + BB.RIM_TUBE); // Impact on rim torus surface
simRim.ball.y = BB.RIM_H;
simRim.ball.vz = 4.0;
simRim.ball.vy = 0;
simRim.shot = { shooter: simRim.agents[0], team: 0, points: 2, touchedRim: false, touchedBoard: false };

simRim.collideHoop(simRim.hoops[0]);
check(simRim.shot.touchedRim === true, 'Ball contact with rim sets touchedRim flag');
check(simRim.ball.vz < 4.0, 'Ball momentum is redirected on rim impact');

// 5. Test Backboard Rebound Physics
console.log('\n--- 5. Backboard Rebound Physics ---');
const simBoard = new BasketballSim({ matchSeconds: 60, skipCountdown: true, disableAI: true });
simBoard.phase = 'playing';
const bz0 = BB.HOOP_Z + BB.BOARD_OFFSET;
simBoard.ball.x = 0;
simBoard.ball.z = bz0 - 0.05; // Touching backboard
simBoard.ball.y = (BB.BOARD_TOP + BB.BOARD_BOTTOM) / 2;
simBoard.ball.vz = 6.0;
simBoard.shot = { shooter: simBoard.agents[0], team: 0, points: 2, touchedRim: false, touchedBoard: false };

simBoard.collideHoop(simBoard.hoops[0]);
check(simBoard.shot.touchedBoard === true, 'Ball contact with backboard sets touchedBoard flag');
check(simBoard.ball.vz < 0, 'Ball rebounds backwards off the backboard surface');

console.log(`\n🎉 Verification Complete: All ${passed}/${total} Basketball Hoop & Scoring Tests Passed!`);
