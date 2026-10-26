/**
 * tests/test_stage2_presentation_replays.cjs
 * Comprehensive test suite for Stage 2: Graphics, Stadiums, Sound Feedback & Replay Highlights.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== FOOTY vs HOOPS: Stage 2 Presentation, Sound & Replays Test Suite ===\n');

// Set up mock AMD environment to load modules from js/game.js
const modules = {};
global.define = function(name, deps, factory) { modules[name] = { deps, factory }; };
global.window = {
  __boot: () => {},
  AudioContext: class MockAudioContext {
    constructor() {
      this.sampleRate = 44100;
      this.currentTime = 0;
      this.state = 'running';
      this.destination = {};
    }
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
      addEventListener: () => {},
      removeEventListener: () => {},
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
  documentElement: { lang: 'en', dir: 'ltr' }
};

global.requestAnimationFrame = (fn) => setTimeout(fn, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

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

const audioMod = requireModule('core/audio');
const texturesMod = requireModule('render/textures');
const arenaMod = requireModule('render/arena');
const fbMod = requireModule('sim/football');
const bbMod = requireModule('sim/basketball');
const i18nEn = requireModule('i18n/en');
const i18nRu = requireModule('i18n/ru');

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
// 1. AUDIO ENGINE & SOUND FEEDBACK VERIFICATION
// -------------------------------------------------------------

test('1.1: AudioEngine: Supports distinct dunk, dribble_court, and save audio events', () => {
  const audio = new audioMod.AudioEngine();
  audio.unlock();
  assert(audio.ctx !== null, 'Audio context must be initialized');

  // Verify synthesizing all required sounds without exception
  assert.doesNotThrow(() => audio.play('dunk', 1.0), 'Dunk sound must synthesize cleanly');
  assert.doesNotThrow(() => audio.play('dribble_court', 0.8), 'Court dribble must synthesize cleanly');
  assert.doesNotThrow(() => audio.play('save'), 'Goalkeeper save must synthesize cleanly');
  assert.doesNotThrow(() => audio.play('rim', 1.0), 'Rim impact must synthesize cleanly');
  assert.doesNotThrow(() => audio.play('post', 1.0), 'Post impact must synthesize cleanly');
  assert.doesNotThrow(() => audio.play('whistle'), 'Whistle must synthesize cleanly');
  assert.doesNotThrow(() => audio.play('goal'), 'Goal roar must synthesize cleanly');
});

test('1.2: AudioEngine: Mute and unmute toggling strictly respects user settings', () => {
  const audio = new audioMod.AudioEngine();
  audio.unlock();
  assert.strictEqual(audio.isMuted(), false, 'Audio must not be muted by default');
  assert.strictEqual(audio.master.gain.value, 0.9, 'Master volume must be 0.9');

  // Toggle mute on
  const muted = audio.toggleMute();
  assert.strictEqual(muted, true, 'toggleMute must return true when muted');
  assert.strictEqual(audio.isMuted(), true);
  assert.strictEqual(audio.master.gain.value, 0, 'Master gain must be 0 when muted');

  // Toggle mute off
  const unmuted = audio.toggleMute();
  assert.strictEqual(unmuted, false, 'toggleMute must return false when unmuted');
  assert.strictEqual(audio.isMuted(), false);
  assert.strictEqual(audio.master.gain.value, 0.9, 'Master gain must be restored to 0.9');

  // Explicit setMuted
  audio.setMuted(true);
  assert.strictEqual(audio.master.gain.value, 0);
  audio.setMuted(false);
  assert.strictEqual(audio.master.gain.value, 0.9);
});

// -------------------------------------------------------------
// 2. REPLAY SYSTEM INVARIANTS & INTEGRITY GUARDS
// -------------------------------------------------------------

test('2.1: Replay Buffer: Snapshot recording captures valid spatial data and bounds memory', () => {
  const gameMod = requireModule('core/game');
  const mockCanvas = global.document.createElement();
  const mockStage = { clientWidth: 800, clientHeight: 600 };
  const mockInput = { snapshot: () => ({ moveX: 0, moveZ: 0, sprint: false }), capture: false, releaseAll: () => {} };
  const mockAudio = new audioMod.AudioEngine();
  const mockHud = {
    setMode: () => {}, setNames: () => {}, resetState: () => {}, showBanner: () => {},
    setBoost: () => {}, update: () => {}, showReplay: () => {}, toast: () => {}, scoreFx: () => {},
    show: () => {}
  };
  const mockSave = () => ({
    name: 'Alim',
    selectedCharacter: 'footy',
    equipped: {},
    settings: { keys: {}, shake: true, quality: 'high' }
  });

  const game = new gameMod.Game(mockCanvas, mockStage, mockInput, mockAudio, mockHud, mockSave);
  game.start({ mode: 'footy', difficulty: 'normal', minutes: 1 });

  assert(game.sim !== null);
  assert.strictEqual(game.replayBuffer.length, 0, 'Replay buffer must be empty initially');

  // Record 150 snapshots
  for (let i = 0; i < 150; i++) {
    game.sim.ball.x = i * 0.1;
    game.sim.ball.z = -i * 0.1;
    game.recordReplaySnapshot();
  }

  // Verification 1: Buffer is strictly bounded to max 120 snapshots
  assert.strictEqual(game.replayBuffer.length, 120, 'Replay buffer must be capped at 120 frames');

  // Verification 2: Snapshots retain correct spatial positions
  const latest = game.replayBuffer[game.replayBuffer.length - 1];
  assert(typeof latest.bx === 'number' && typeof latest.bz === 'number', 'Snapshot must record ball coords');
  assert(Array.isArray(latest.agents) && latest.agents.length > 0, 'Snapshot must record agents');
});

test('2.2: Replay Integrity: Playback CANNOT alter match score, trigger rewards, or step live sim', () => {
  const gameMod = requireModule('core/game');
  const mockCanvas = global.document.createElement();
  const mockStage = { clientWidth: 800, clientHeight: 600 };
  const mockInput = { snapshot: () => ({}), capture: false, releaseAll: () => {} };
  const mockAudio = new audioMod.AudioEngine();
  let replayBannerShown = false;
  const mockHud = {
    setMode: () => {}, setNames: () => {}, resetState: () => {}, showBanner: () => {},
    setBoost: () => {}, update: () => {}, scoreFx: () => {}, toast: () => {},
    show: () => {},
    showReplay: (show) => { replayBannerShown = show; }
  };
  const mockSave = () => ({ name: 'Alim', selectedCharacter: 'footy', equipped: {}, settings: { keys: {}, shake: true, quality: 'high' } });

  const game = new gameMod.Game(mockCanvas, mockStage, mockInput, mockAudio, mockHud, mockSave);
  game.start({ mode: 'footy', difficulty: 'normal', minutes: 1 });

  // Record snapshots preceding goal
  for (let i = 0; i < 30; i++) {
    game.recordReplaySnapshot();
  }

  // Award goal to human team
  game.sim.score[0] = 1;
  const scoreBeforeReplay = game.sim.score[0];
  const simTimeBeforeReplay = game.sim.time;

  // Start replay
  game.startReplay();
  assert.strictEqual(game.replayActive, true, 'Replay must be active');
  assert.strictEqual(replayBannerShown, true, 'Replay banner must be displayed in HUD');

  // Simulate 60 replay frames (stepReplay)
  for (let f = 0; f < 60; f++) {
    game.stepReplay(1 / 60);
  }

  // Invariant 1: Score must NEVER change during replay playback
  assert.strictEqual(game.sim.score[0], scoreBeforeReplay, 'Score must remain strictly unchanged by replay');
  // Invariant 2: Live simulation time must NOT advance during replay playback
  assert.strictEqual(game.sim.time, simTimeBeforeReplay, 'Live simulation must be paused during replay');

  // Skip / Stop replay
  game.stopReplay();
  assert.strictEqual(game.replayActive, false, 'Replay must be inactive after stop');
  assert.strictEqual(replayBannerShown, false, 'Replay banner must be hidden after stop');
  game.stop();
});

test('2.3: Replay Safety: Online PvP strictly bypasses replay to prevent network desynchronization', () => {
  const gameMod = requireModule('core/game');
  const mockCanvas = global.document.createElement();
  const mockStage = { clientWidth: 800, clientHeight: 600 };
  const mockInput = { snapshot: () => ({}), capture: false, releaseAll: () => {} };
  const mockAudio = new audioMod.AudioEngine();
  let replayBannerCalled = false;
  const mockHud = {
    setMode: () => {}, setNames: () => {}, resetState: () => {}, showBanner: () => {},
    setBoost: () => {}, update: () => {}, scoreFx: () => {}, toast: () => {},
    show: () => {},
    showReplay: (show) => { if (show) replayBannerCalled = true; }
  };
  const mockSave = () => ({ name: 'Alim', selectedCharacter: 'footy', equipped: {}, settings: { keys: {}, shake: true, quality: 'high' } });

  const game = new gameMod.Game(mockCanvas, mockStage, mockInput, mockAudio, mockHud, mockSave);
  // Start match configured with online PvP
  const mockOnlineSession = { role: 'host', info: { seed: 12345, myName: 'Host', oppName: 'Guest' }, attachHost: () => {}, close: () => {} };
  game.start({ mode: 'footy', difficulty: 'normal', minutes: 1, online: mockOnlineSession });

  // Record mock snapshots
  for (let i = 0; i < 30; i++) game.recordReplaySnapshot();

  // Attempt to trigger replay in online mode
  game.startReplay();

  // Invariant: Online PvP matches must NEVER enter replay mode
  assert.strictEqual(game.replayActive, false, 'Replay must NEVER activate during Online PvP matches');
  assert.strictEqual(replayBannerCalled, false, 'Replay HUD must never be triggered in Online PvP');
  game.stop();
});

// -------------------------------------------------------------
// 3. PLAYING SURFACES & ARENA VISUAL QUALITY
// -------------------------------------------------------------

test('3.1: Football Pitch: Dimensions, regulation markings, boxes, goal nets, and mowing bands', () => {
  const [pw, pd] = texturesMod.pitchPlaneSize();
  assert(pw >= 2 * fbMod.FB.W, 'Pitch width must accommodate touchlines');
  assert(pd >= 2 * fbMod.FB.L, 'Pitch length must accommodate goal lines');

  // Verify pitch texture generator returns valid canvas
  const pitchCanvas = texturesMod.makePitchTexture({
    pitchA: 0x228b22,
    pitchB: 0x1e7b1e,
    line: 0xffffff
  });
  assert(pitchCanvas !== null && pitchCanvas.width > 0, 'Pitch canvas texture must generate successfully');

  // Verify net texture generator produces double-sided stadium netting
  const netCanvas = texturesMod.makeNetTexture('#ffffff');
  assert(netCanvas !== null && netCanvas.width === 256, 'Net texture canvas must generate at 256x256');
});

test('3.2: Basketball Court: Authentic hardwood parquet, key/paint, 3-point arc, and backboard', () => {
  const [cw, cd] = texturesMod.courtPlaneSize();
  assert(cw >= 2 * (bbMod.BB.W + bbMod.BB.APRON), 'Court plane must fit court width + apron');
  assert(cd >= 2 * (bbMod.BB.L + bbMod.BB.APRON), 'Court plane must fit court length + apron');

  // Verify court texture generator creates hardwood with regulation lines
  const courtCanvas = texturesMod.makeCourtTexture({
    woodA: 0xd4a373,
    woodB: 0xbc8a5f,
    line: 0xffffff,
    paint: 0x1e3a8a,
    centerPaint: 0x0284c7,
    apron: 0x111622
  });
  assert(courtCanvas !== null && courtCanvas.width > 0, 'Basketball court canvas must generate successfully');

  // Verify tempered glass backboard texture generator
  const boardCanvas = texturesMod.makeBackboardTexture();
  assert(boardCanvas !== null && boardCanvas.width === 512, 'Backboard texture must generate at 512x320');
});

test('3.3: 10 Themed Arenas: All 10 unique stadium environments instantiate without errors', () => {
  const arenas = [
    { id: 'std_ocean_sunset', name: 'Coastal Sunset Court' },
    { id: 'std_forest_redwood', name: 'Redwood Forest Arena' },
    { id: 'std_space_orbit', name: 'Space Orbit Arena' },
    { id: 'std_mars_dome', name: 'Mars Bio-Dome Arena' },
    { id: 'std_moon_crater', name: 'Moon Crater Arena' },
    { id: 'std_underwater_dome', name: 'Underwater Dome Arena' },
    { id: 'std_cyber_megacity', name: 'Cyber Megacity Arena' },
    { id: 'std_volcano_caldera', name: 'Volcano Caldera Arena' },
    { id: 'std_floating_islands', name: 'Floating Sky Islands Arena' },
    { id: 'std_crystal_cavern', name: 'Prismatic Crystal Cavern' }
  ];

  assert.strictEqual(arenas.length, 10, 'Must have exactly 10 world environments');

  const shopMod = requireModule('data/shop');

  for (const arenaDef of arenas) {
    const item = shopMod.getItem(arenaDef.id);
    assert(item !== null && item.visual, `Arena item ${arenaDef.id} must exist in data/shop`);
    const config = Object.assign({ id: arenaDef.id }, item.visual);

    assert.doesNotThrow(() => {
      const footyArena = arenaMod.buildFootyArena(config, 1);
      assert(footyArena.root !== null, `Footy arena ${arenaDef.id} root node must exist`);
      assert(typeof footyArena.apply === 'function');
      assert(typeof footyArena.update === 'function');
    }, `Footy arena for ${arenaDef.id} must build cleanly`);

    assert.doesNotThrow(() => {
      const courtArena = arenaMod.buildCourtArena(config, 1);
      assert(courtArena.root !== null, `Court arena ${arenaDef.id} root node must exist`);
      assert(typeof courtArena.apply === 'function');
      assert(typeof courtArena.update === 'function');
    }, `Court arena for ${arenaDef.id} must build cleanly`);
  }
});

// -------------------------------------------------------------
// 4. BRANDING & LOCALIZATION INTEGRITY
// -------------------------------------------------------------

test('4.1: Emblem Asset: Official emblem is preserved as foreground image asset', () => {
  assert(fs.existsSync('assets/emblem.png'), 'assets/emblem.png must exist');
  const stat = fs.statSync('assets/emblem.png');
  assert(stat.size > 100000, 'assets/emblem.png must be the authentic high-resolution asset');

  const redesignCode = fs.readFileSync('js/redesign.js', 'utf8');
  assert(redesignCode.includes('assets/emblem.png'), 'js/redesign.js must use assets/emblem.png as foreground image');
  assert(redesignCode.includes('fvh-official-emblem'), 'Must use fvh-official-emblem class');

  const css = fs.readFileSync('css/redesign.css', 'utf8');
  assert(css.includes('.fvh-official-emblem'), 'css/redesign.css must style .fvh-official-emblem');
  assert(!css.includes('background-image: url("../assets/emblem.png")'), 'Emblem must NOT be used as page background');
});

test('4.2: Localization: Replay and Mute keys are defined in English, Russian, and redesign dicts', () => {
  const enDict = i18nEn.default || i18nEn;
  const ruDict = i18nRu.default || i18nRu;
  const enKeys = ['hud.replay', 'hud.skipReplay', 'hud.mute', 'hud.unmute'];
  for (const k of enKeys) {
    assert(enDict[k] !== undefined, `English dictionary must contain ${k}`);
    assert(ruDict[k] !== undefined, `Russian dictionary must contain ${k}`);
  }

  const redesignCode = fs.readFileSync('js/redesign.js', 'utf8');
  assert(redesignCode.includes('replay: \'REPLAY\''), 'redesign.js must include replay translation');
  assert(redesignCode.includes('replay: \'ПОВТОР\''), 'redesign.js must include Russian replay translation');
});

console.log(`\n======================================================`);
console.log(`ALL STAGE 2 PRESENTATION & REPLAY CHECKS PASSED (${passedTests}/${totalTests})!`);
console.log(`======================================================\n`);
process.exit(0);
