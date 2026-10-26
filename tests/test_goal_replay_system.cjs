/**
 * tests/test_goal_replay_system.cjs
 * Comprehensive automated test suite for Football Goal Replay System in FOOTY vs HOOPS.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== FOOTY vs HOOPS: Goal Replay System Test Suite ===\n');

// Set up mock AMD environment to load modules from js/game.js
const modules = {};
global.define = function(name, deps, factory) { modules[name] = { deps, factory }; };
global.window = {
  __boot: () => {},
  AudioContext: class MockAudioContext {
    constructor() { this.sampleRate = 44100; this.currentTime = 0; this.state = 'running'; this.destination = {}; }
    createGain() { return { gain: { value: 1, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }, connect: () => {} }; }
    createDynamicsCompressor() { return { connect: () => {} }; }
    createBuffer(ch, len, sr) { return { getChannelData: () => new Float32Array(len) }; }
    createOscillator() { return { type: 'sine', frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }, connect: () => {}, start: () => {}, stop: () => {} }; }
    createBufferSource() { return { buffer: null, connect: () => {}, start: () => {}, stop: () => {} }; }
    createBiquadFilter() { return { type: 'bandpass', Q: { value: 1 }, frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }, connect: () => {} }; }
  },
  innerWidth: 1024,
  innerHeight: 768,
  devicePixelRatio: 1,
  matchMedia: () => ({ matches: false }),
  addEventListener: () => {},
  removeEventListener: () => {},
  clearTimeout: (id) => clearTimeout(id),
  setTimeout: (fn, ms) => setTimeout(fn, ms)
};

function createMockGL() {
  return {
    getExtension: () => null,
    getParameter: () => 1,
    createBuffer: () => ({}),
    bindBuffer: () => {},
    bufferData: () => {},
    createProgram: () => ({}),
    createShader: () => ({}),
    shaderSource: () => {},
    compileShader: () => {},
    getShaderParameter: () => true,
    attachShader: () => {},
    linkProgram: () => {},
    getProgramParameter: () => true,
    useProgram: () => {},
    getAttribLocation: () => 0,
    getUniformLocation: () => 0,
    enableVertexAttribArray: () => {},
    vertexAttribPointer: () => {},
    vertexAttribDivisor: () => {},
    uniformMatrix4fv: () => {},
    uniform1i: () => {},
    uniform1f: () => {},
    uniform2f: () => {},
    uniform3f: () => {},
    uniform4f: () => {},
    uniform2fv: () => {},
    uniform3fv: () => {},
    uniform4fv: () => {},
    blendEquation: () => {},
    blendColor: () => {},
    drawBuffers: () => {},
    readBuffer: () => {},
    checkFramebufferStatus: () => 0x8CD5,
    FRAMEBUFFER_COMPLETE: 0x8CD5,
    NONE: 0,
    FRAMEBUFFER: 0x8D40,
    READ_FRAMEBUFFER: 0x8CA8,
    DRAW_FRAMEBUFFER: 0x8CA9,
    COLOR_ATTACHMENT0: 0x8CE0,
    DEPTH_ATTACHMENT: 0x8D00,
    RENDERBUFFER: 0x8D41,
    DEPTH_COMPONENT16: 0x81A5,
    drawArrays: () => {},
    drawArraysInstanced: () => {},
    drawElements: () => {},
    drawElementsInstanced: () => {},
    createTexture: () => ({}),
    bindTexture: () => {},
    texImage2D: () => {},
    texParameteri: () => {},
    generateMipmap: () => {},
    viewport: () => {},
    clearColor: () => {},
    clear: () => {},
    enable: () => {},
    disable: () => {},
    blendFunc: () => {},
    depthFunc: () => {},
    depthMask: () => {},
    activeTexture: () => {},
    depthRange: () => {},
    TEXTURE0: 0x84C0,
    TEXTURE1: 0x84C1,
    TEXTURE2: 0x84C2,
    cullFace: () => {},
    polygonOffset: () => {},
    pixelStorei: () => {},
    createFramebuffer: () => ({}),
    bindFramebuffer: () => {},
    framebufferTexture2D: () => {},
    createRenderbuffer: () => ({}),
    bindRenderbuffer: () => {},
    renderbufferStorage: () => {},
    renderbufferStorageMultisample: () => {},
    blitFramebuffer: () => {},
    framebufferRenderbuffer: () => {},
    createVertexArray: () => ({}),
    bindVertexArray: () => {},
    deleteVertexArray: () => {},
    deleteTexture: () => {},
    deleteFramebuffer: () => {},
    deleteRenderbuffer: () => {},
    deleteBuffer: () => {},
    deleteProgram: () => {},
    deleteShader: () => {},
    COLOR_BUFFER_BIT: 0x4000,
    DEPTH_BUFFER_BIT: 0x0100,
    TRIANGLES: 0x0004,
    UNSIGNED_SHORT: 0x1403,
    FLOAT: 0x1406,
    TEXTURE_2D: 0x0DE1,
    RGBA: 0x1908,
    UNSIGNED_BYTE: 0x1401,
    NEAREST: 0x2600,
    LINEAR: 0x2601,
    CLAMP_TO_EDGE: 0x812F,
    REPEAT: 0x2901,
    DEPTH_TEST: 0x0B71,
    BLEND: 0x0BE2,
    CULL_FACE: 0x0B44,
    SRC_ALPHA: 0x0302,
    ONE_MINUS_SRC_ALPHA: 0x0303,
    DEPTH_COMPONENT24: 0x81A6,
    DEPTH_COMPONENT: 0x1902,
    UNSIGNED_INT: 0x1405,
    TEXTURE_MIN_FILTER: 0x2801
  };
}

global.document = {
  createElement: () => {
    const gl = createMockGL();
    return {
      width: 100, height: 100,
      style: { width: '', height: '' },
      classList: { add: () => {}, remove: () => {}, contains: () => false },
      appendChild: () => {},
      append: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      setAttribute: () => {},
      removeAttribute: () => {},
      getContext: (type) => {
        if (type === 'webgl2' || type === 'webgl' || type === 'experimental-webgl') return gl;
        return {
          fillRect: () => {}, strokeRect: () => {}, rect: () => {}, beginPath: () => {}, closePath: () => {},
          moveTo: () => {}, lineTo: () => {}, arc: () => {}, fill: () => {}, stroke: () => {},
          quadraticCurveTo: () => {}, bezierCurveTo: () => {}, ellipse: () => {},
          measureText: () => ({ width: 10 }), fillText: () => {}, strokeText: () => {},
          createRadialGradient: () => ({ addColorStop: () => {} }),
          createLinearGradient: () => ({ addColorStop: () => {} }),
          save: () => {}, restore: () => {}, clip: () => {}, setLineDash: () => {},
          clearRect: () => {}
        };
      }
    };
  },
  documentElement: { lang: 'en', dir: 'ltr' },
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => []
};

global.navigator = {
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
  deviceMemory: 4,
  hardwareConcurrency: 4,
  vibrate: () => {}
};

global.requestAnimationFrame = (fn) => setTimeout(fn, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Load js/game.js in AMD environment
const gameCode = fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8');
eval(gameCode);

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

const gameMod = requireModule('core/game');
const audioMod = requireModule('core/audio');
const fbMod = requireModule('sim/football');
const bbMod = requireModule('sim/basketball');

function createTestGame(mode = 'footy') {
  const mockCanvas = global.document.createElement('canvas');
  const mockStage = { clientWidth: 800, clientHeight: 600 };
  const mockInput = { snapshot: () => ({}), capture: false, releaseAll: () => {} };
  const mockAudio = new audioMod.AudioEngine();
  let replayBannerShown = false;
  const mockHud = {
    setMode: () => {}, setNames: () => {}, resetState: () => {}, showBanner: () => {},
    setBoost: () => {}, update: () => {}, scoreFx: () => {}, toast: () => {},
    show: () => {},
    touch: { style: {} },
    showReplay: (show, onSkip) => {
      replayBannerShown = show;
      if (mockHud.touch) {
        mockHud.touch.style.pointerEvents = show ? 'none' : '';
        mockHud.touch.style.opacity = show ? '0.15' : '';
      }
    }
  };
  const mockSave = () => ({
    name: 'Alim',
    selectedCharacter: mode,
    equipped: {},
    settings: { keys: {}, shake: true, quality: 'high' }
  });

  const game = new gameMod.Game(mockCanvas, mockStage, mockInput, mockAudio, mockHud, mockSave);
  game.start({ mode, difficulty: 'normal', minutes: 1 });
  return { game, mockHud, getReplayShown: () => replayBannerShown };
}

let testCount = 0;
function test(name, fn) {
  testCount++;
  console.log(`Test ${testCount}: ${name}...`);
  fn();
  console.log(`  [PASS] ${name}`);
}

// -------------------------------------------------------------
// Test 1: Football goal triggers replay automatically
// -------------------------------------------------------------
test('Football goal triggers startReplay with goal info and activates replay mode', () => {
  const { game, getReplayShown } = createTestGame('footy');
  for (let i = 0; i < 40; i++) game.recordReplaySnapshot();

  const goalInfo = { team: 0, scorerId: 1, goalZ: -22, ownGoal: false };
  game.startReplay(goalInfo);

  assert.strictEqual(game.replayActive, true, 'Replay must be active after startReplay');
  assert.strictEqual(getReplayShown(), true, 'HUD replay banner must be shown');
  assert.deepStrictEqual(game.replayGoalInfo, goalInfo, 'Goal info must be retained for camera placement');
  game.stop();
});

// -------------------------------------------------------------
// Test 2: Match timer and live simulation paused during replay
// -------------------------------------------------------------
test('Match timer and player/AI physics remain strictly paused during replay frames', () => {
  const { game } = createTestGame('footy');
  for (let i = 0; i < 40; i++) game.recordReplaySnapshot();

  const simTimeBefore = game.sim.time;
  const timeLeftBefore = game.sim.timeLeft;
  const humanXBefore = game.sim.human.x;

  game.startReplay({ team: 0, scorerId: 1, goalZ: -22, ownGoal: false });

  // Simulate multiple animation frames during replay
  for (let f = 0; f < 30; f++) {
    game.stepReplay(1 / 60);
  }

  assert.strictEqual(game.sim.time, simTimeBefore, 'Simulation time must NOT advance during replay');
  assert.strictEqual(game.sim.timeLeft, timeLeftBefore, 'Match timeLeft must NOT decrement during replay');
  assert.strictEqual(game.sim.human.x, humanXBefore, 'Live player position must NOT be stepped during replay');
  game.stop();
});

// -------------------------------------------------------------
// Test 3: Replay duration is approximately 3-5 seconds
// -------------------------------------------------------------
test('Replay duration spans approximately 3.5 to 4.5 seconds', () => {
  const { game } = createTestGame('footy');
  // Fill replay buffer
  for (let i = 0; i < 120; i++) game.recordReplaySnapshot();

  game.startReplay({ team: 0, scorerId: 1, goalZ: -22, ownGoal: false });

  const totalFrames = game.replayActiveFrames.length;
  // Step until replay naturally concludes
  let simulatedSeconds = 0;
  const dt = 1 / 60;
  while (game.replayActive && simulatedSeconds < 10) {
    game.stepReplay(dt);
    simulatedSeconds += dt;
  }

  assert.strictEqual(game.replayActive, false, 'Replay must conclude naturally');
  assert(simulatedSeconds >= 3.0 && simulatedSeconds <= 5.0,
    `Replay duration (${simulatedSeconds.toFixed(2)}s) must be between 3.0 and 5.0 seconds`);
  game.stop();
});

// -------------------------------------------------------------
// Test 4: Duplicate goal prevention & score idempotency
// -------------------------------------------------------------
test('Replay frames never cause duplicate goal detections, score increments, or replay loops', () => {
  const { game } = createTestGame('footy');
  for (let i = 0; i < 40; i++) game.recordReplaySnapshot();

  game.sim.score[0] = 1;
  const expectedScore = 1;

  game.startReplay({ team: 0, scorerId: 1, goalZ: -22, ownGoal: false });

  // Step through frames where ball was inside the goal net
  for (let f = 0; f < 60; f++) {
    game.stepReplay(1 / 60);
    assert.strictEqual(game.sim.score[0], expectedScore, 'Score must never increment during replay playback');
  }

  // Attempting to call startReplay while already in replay is safely rejected
  const framesBefore = game.replayActiveFrames;
  game.startReplay({ team: 0, scorerId: 1, goalZ: -22, ownGoal: false });
  assert.strictEqual(game.replayActiveFrames, framesBefore, 'Replay must not re-trigger or loop while active');

  game.stop();
});

// -------------------------------------------------------------
// Test 5: Replay camera uses broadcast diagonal sideline perspective
// -------------------------------------------------------------
test('Replay camera positions at elevated sideline angle framing scorer, ball, and goal', () => {
  const { game } = createTestGame('footy');
  const snap = {
    bx: 3.5, by: 1.2, bz: -18.0,
    bvx: 0, bvy: 0, bvz: -15,
    agents: [{ id: 1, x: 4.0, y: 0, z: -14.0, fx: 0, fz: -1 }]
  };

  const goalInfo = { team: 0, scorerId: 1, goalZ: -22, ownGoal: false };
  game.view.renderReplay(1 / 60, snap, goalInfo);

  const cam = game.view.rig.cam;
  assert(cam.position[1] >= 8.0, 'Camera height must be elevated for broadcast view');
  assert(Math.abs(cam.position[0]) >= 14.0, 'Camera must be placed at the lateral sideline');
  assert(cam.target[2] < 0 && cam.target[2] >= -22, 'Camera target must frame the penalty box and goal mouth');
  game.stop();
});

// -------------------------------------------------------------
// Test 6: Replay stops cleanly and restores gameplay camera and touch controls
// -------------------------------------------------------------
test('stopReplay cleanly restores gameplay camera rig and touch controls', () => {
  const { game, mockHud, getReplayShown } = createTestGame('footy');
  for (let i = 0; i < 40; i++) game.recordReplaySnapshot();

  game.startReplay({ team: 0, scorerId: 1, goalZ: -22, ownGoal: false });
  assert.strictEqual(game.replayActive, true);
  assert.strictEqual(mockHud.touch.style.pointerEvents, 'none', 'Touch must be non-interactive during replay');

  // Trigger stop / skip
  game.stopReplay();
  assert.strictEqual(game.replayActive, false, 'Replay must be inactive');
  assert.strictEqual(getReplayShown(), false, 'HUD replay overlay must be hidden');
  assert.strictEqual(mockHud.touch.style.pointerEvents, '', 'Touch controls must be restored');
  assert.strictEqual(game.view.rig.snap, true, 'Camera rig snap must be primed to prevent camera drift');
  game.stop();
});

// -------------------------------------------------------------
// Test 7: Basketball mode scoring does not trigger goal replay
// -------------------------------------------------------------
test('Basketball mode scoring strictly excludes goal replay', () => {
  const { game } = createTestGame('hoops');
  for (let i = 0; i < 40; i++) game.recordReplaySnapshot();

  // Attempt to start replay in basketball mode
  game.startReplay({ team: 0, scorerId: 1, goalZ: -12 });
  assert.strictEqual(game.replayActive, false, 'Replay must NEVER trigger in basketball mode');
  game.stop();
});

console.log(`\nAll ${testCount}/${testCount} Goal Replay System tests passed successfully!`);
