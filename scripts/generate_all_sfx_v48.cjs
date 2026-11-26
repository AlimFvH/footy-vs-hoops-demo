'use strict';

/**
 * Rebuild all sports SFX from scratch (44.1 kHz, 16-bit mono PCM WAV) using layered physical
 * modal synthesis, biquad-filtered noise textures, early stadium/court reflections, and soft saturation.
 * Covers: running (turf & court), kicks/passes, hoops shots/swishes/dribbles, slide tackles, steals, slam dunks, keeper saves.
 */

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.resolve(__dirname, '..', 'assets', 'audio');
const VAR_DIR = path.join(OUT_DIR, 'variants');
if (!fs.existsSync(VAR_DIR)) fs.mkdirSync(VAR_DIR, { recursive: true });

const SR = 44100;

// Deterministic PRNG per file so output is crisp & reproducible
function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return (s & 0xfffffff) / 0x10000000;
  };
}

function makeBuf(sec) {
  return new Float64Array(Math.max(1, Math.round(sec * SR)));
}

// One-pole / Biquad IIR filter helper over Float64Array
function biquadFilter(src, type, cutoffFn, q = 0.85) {
  const out = new Float64Array(src.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < src.length; i++) {
    const t = i / SR;
    const fc = Math.max(25, Math.min(SR * 0.45, typeof cutoffFn === 'function' ? cutoffFn(t) : cutoffFn));
    const w0 = (2 * Math.PI * fc) / SR;
    const cosw = Math.cos(w0);
    const alpha = Math.sin(w0) / (2 * q);
    let b0, b1, b2, a0, a1, a2;
    if (type === 'lowpass') {
      b0 = (1 - cosw) / 2; b1 = 1 - cosw; b2 = (1 - cosw) / 2;
      a0 = 1 + alpha; a1 = -2 * cosw; a2 = 1 - alpha;
    } else if (type === 'highpass') {
      b0 = (1 + cosw) / 2; b1 = -(1 + cosw); b2 = (1 + cosw) / 2;
      a0 = 1 + alpha; a1 = -2 * cosw; a2 = 1 - alpha;
    } else { // bandpass
      b0 = alpha; b1 = 0; b2 = -alpha;
      a0 = 1 + alpha; a1 = -2 * cosw; a2 = 1 - alpha;
    }
    const x0 = src[i];
    const y0 = (b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    out[i] = y0;
    x2 = x1; x1 = x0; y2 = y1; y1 = y0;
  }
  return out;
}

function whiteNoise(len, rng) {
  const arr = new Float64Array(len);
  for (let i = 0; i < len; i++) arr[i] = rng() * 2 - 1;
  return arr;
}

function pinkNoise(len, rng) {
  const arr = new Float64Array(len);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < len; i++) {
    const w = rng() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179;
    b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.96900 * b2 + w * 0.1538520;
    b3 = 0.86650 * b3 + w * 0.3104856;
    b4 = 0.55000 * b4 + w * 0.5329522;
    b5 = -0.7616 * b5 - w * 0.0168980;
    arr[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.14;
    b6 = w * 0.115926;
  }
  return arr;
}

function mixInto(dst, src, delaySec = 0, gain = 1.0, fadeInSec = 0.002, fadeOutSec = 0.02) {
  const start = Math.round(delaySec * SR);
  const fi = Math.max(1, Math.round(fadeInSec * SR));
  const fo = Math.max(1, Math.round(fadeOutSec * SR));
  for (let i = 0; i < src.length; i++) {
    const di = start + i;
    if (di < 0 || di >= dst.length) continue;
    let env = 1;
    if (i < fi) env *= i / fi;
    const rem = src.length - 1 - i;
    if (rem < fo) env *= Math.max(0, rem / fo);
    dst[di] += src[i] * gain * env;
  }
}

function addPitchBody(buf, delaySec, durSec, fStart, fEnd, expCurve, amp, harm2 = 0.0, harm3 = 0.0) {
  const start = Math.round(delaySec * SR);
  const count = Math.round(durSec * SR);
  let phase = 0;
  for (let i = 0; i < count; i++) {
    const di = start + i;
    if (di >= buf.length) break;
    const u = i / count;
    const t = i / SR;
    const f = fEnd + (fStart - fEnd) * Math.exp(-t * expCurve);
    phase += (2 * Math.PI * f) / SR;
    const att = Math.min(1, i / (0.0025 * SR));
    const dec = Math.pow(1 - u, 1.35) * Math.exp(-t * (2.6 / Math.max(0.08, durSec)));
    const s = Math.sin(phase) + harm2 * Math.sin(phase * 1.98) + harm3 * Math.sin(phase * 2.94);
    buf[di] += s * amp * att * dec;
  }
}

function addRoomReflections(buf, wet = 0.20, arenaType = 'stadium') {
  const copy = new Float64Array(buf);
  const taps = arenaType === 'court'
    ? [[0.011, 0.42], [0.019, 0.28], [0.031, 0.18], [0.047, 0.12], [0.072, 0.07]]
    : [[0.018, 0.35], [0.034, 0.24], [0.056, 0.16], [0.089, 0.10], [0.135, 0.05]];
  for (const [dly, g] of taps) {
    mixInto(buf, biquadFilter(copy, 'lowpass', 3200, 0.7), dly, wet * g, 0.002, 0.03);
  }
}

function finalizeWav(filePath, buf, peakTarget = 0.90, drive = 1.35) {
  // Soft saturation + peak norm + clean edge fade
  const fadeEdge = Math.round(0.006 * SR);
  let peak = 0;
  for (let i = 0; i < buf.length; i++) {
    let x = Math.tanh(buf[i] * drive) / Math.tanh(drive);
    if (i < Math.round(0.0015 * SR)) x *= i / (0.0015 * SR);
    const rem = buf.length - 1 - i;
    if (rem < fadeEdge) x *= rem / fadeEdge;
    buf[i] = x;
    const ax = Math.abs(x);
    if (ax > peak) peak = ax;
  }
  const normGain = peak > 1e-5 ? peakTarget / peak : 1;

  const dataLen = buf.length * 2;
  const wav = Buffer.alloc(44 + dataLen);
  wav.write('RIFF', 0);
  wav.writeUInt32LE(36 + dataLen, 4);
  wav.write('WAVE', 8);
  wav.write('fmt ', 12);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(SR, 24);
  wav.writeUInt32LE(SR * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write('data', 36);
  wav.writeUInt32LE(dataLen, 40);

  for (let i = 0; i < buf.length; i++) {
    const s = Math.max(-1, Math.min(1, buf[i] * normGain));
    wav.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  fs.writeFileSync(filePath, wav);
}

// ============================================================================
// 1. FOOTBALL KICKS & PASSES (Deep leather thump + air whip + ball resonance)
// ============================================================================
function buildFootyKick(relPath, seed, opts = {}) {
  const rng = makeRng(seed);
  const pMul = opts.pitchMul || 1.0;
  const dur = opts.isPass ? 0.24 : 0.44;
  const b = makeBuf(dur);

  // Subtle boot-swing air whoosh before impact
  if (!opts.isPass) {
    const whooshLen = Math.round(0.06 * SR);
    const wN = pinkNoise(whooshLen, rng);
    const wF = biquadFilter(wN, 'bandpass', (t) => 380 + t * 14000, 1.3);
    mixInto(b, wF, 0.0, 0.35, 0.01, 0.02);
  }
  const hitAt = opts.isPass ? 0.004 : 0.018;

  // Crisp leather skin snap transient
  const snapLen = Math.round(0.045 * SR);
  const sN = whiteNoise(snapLen, rng);
  const sF = biquadFilter(sN, 'bandpass', (t) => (2200 - t * 24000) * pMul, 1.2);
  mixInto(b, sF, hitAt, opts.isPass ? 0.55 : 0.95, 0.001, 0.02);

  // Deep inflated football membrane thump + warm air-cavity overtone
  addPitchBody(b, hitAt, opts.isPass ? 0.12 : 0.24, (opts.isPass ? 175 : 158) * pMul, (opts.isPass ? 68 : 42) * pMul, 24, opts.isPass ? 0.85 : 1.15, 0.22, 0.08);
  addPitchBody(b, hitAt, 0.09, 315 * pMul, 125 * pMul, 36, opts.isPass ? 0.32 : 0.48, 0.0, 0.0);

  // Turf low tail rumble
  const tailLen = Math.round(0.14 * SR);
  const tF = biquadFilter(pinkNoise(tailLen, rng), 'lowpass', 420, 0.7);
  mixInto(b, tF, hitAt + 0.006, opts.isPass ? 0.25 : 0.42, 0.004, 0.09);

  addRoomReflections(b, opts.isPass ? 0.14 : 0.24, 'stadium');
  finalizeWav(path.join(OUT_DIR, relPath), b, opts.isPass ? 0.80 : 0.94, 1.45);
}

// ============================================================================
// 2. RUNNING FOOTSTEPS (Turf Grass vs Hardwood Court + Sneaker Squeak)
// ============================================================================
function buildFootyStep(relPath, seed, pMul = 1.0) {
  const rng = makeRng(seed);
  const b = makeBuf(0.20);
  // Soft turf heel press
  addPitchBody(b, 0.004, 0.085, 118 * pMul, 46 * pMul, 32, 0.72, 0.12);
  // Grass blade brush (warm filtered noise)
  const gLen = Math.round(0.11 * SR);
  const gN = biquadFilter(pinkNoise(gLen, rng), 'bandpass', (t) => (1450 - t * 6500) * pMul, 1.1);
  mixInto(b, gN, 0.002, 0.72, 0.008, 0.055);
  addRoomReflections(b, 0.08, 'stadium');
  finalizeWav(path.join(OUT_DIR, relPath), b, 0.78, 1.2);
}

function buildCourtStep(relPath, seed, pMul = 1.0) {
  const rng = makeRng(seed);
  const b = makeBuf(0.18);
  // Hollow maple hardwood board resonance
  addPitchBody(b, 0.003, 0.075, 152 * pMul, 74 * pMul, 34, 0.68, 0.24);
  // Subtle crisp rubber sole tap
  const tap = biquadFilter(whiteNoise(Math.round(0.04 * SR), rng), 'bandpass', 1100 * pMul, 1.4);
  mixInto(b, tap, 0.001, 0.36, 0.002, 0.02);
  addRoomReflections(b, 0.14, 'court');
  finalizeWav(path.join(OUT_DIR, relPath), b, 0.76, 1.2);
}

function buildSneakerSqueak(relPath, seed, pMul = 1.0) {
  const rng = makeRng(seed);
  const b = makeBuf(0.24);
  const dur = 0.14;
  const count = Math.round(dur * SR);
  let ph = 0;
  for (let i = 0; i < count; i++) {
    const t = i / SR;
    const u = i / count;
    // Authentic rubber friction chirp glide with slight grip vibrato
    const f = (1760 + 460 * Math.sin(u * Math.PI) - 240 * u + 45 * Math.sin(t * 140)) * pMul;
    ph += (2 * Math.PI * f) / SR;
    const env = Math.pow(Math.sin(u * Math.PI), 0.7);
    b[Math.round(0.01 * SR) + i] += (Math.sin(ph) * 0.55 + Math.sin(ph * 2.02) * 0.15) * env;
  }
  const grit = biquadFilter(whiteNoise(count, rng), 'bandpass', 2100 * pMul, 3.2);
  mixInto(b, grit, 0.01, 0.22, 0.01, 0.04);
  // Short hardwood step impact right at end of cut
  addPitchBody(b, 0.08, 0.06, 130 * pMul, 68 * pMul, 35, 0.35);
  addRoomReflections(b, 0.18, 'court');
  finalizeWav(path.join(OUT_DIR, relPath), b, 0.72, 1.15);
}

// ============================================================================
// 3. SLIDE TACKLE (Body hit on grass + elongated turf skid + optional ball poke)
// ============================================================================
function buildSlideTackle(relPath, seed, pMul = 1.0) {
  const rng = makeRng(seed);
  const b = makeBuf(0.62);

  // 1) Sharp whoosh entering tackle
  const inF = biquadFilter(pinkNoise(Math.round(0.11 * SR), rng), 'bandpass', (t) => 420 + t * 9000, 1.1);
  mixInto(b, inF, 0.0, 0.45, 0.01, 0.04);

  // 2) Hip/leg heavy land onto grass turf at ~45ms
  addPitchBody(b, 0.045, 0.16, 98 * pMul, 38 * pMul, 20, 0.92, 0.18);

  // 3) Long granular cleat & fabric skid across turf grass (0.04..0.52s)
  const skidLen = Math.round(0.46 * SR);
  const rawSkid = pinkNoise(skidLen, rng);
  for (let i = 0; i < skidLen; i++) {
    const t = i / SR;
    // Slight uneven turf clump modulation
    rawSkid[i] *= 0.65 + 0.35 * Math.sin(t * 36 + Math.sin(t * 17) * 2);
  }
  const grassLayer = biquadFilter(rawSkid, 'bandpass', (t) => (1450 - t * 1400) * pMul, 0.95);
  const dirtLayer = biquadFilter(rawSkid, 'lowpass', 390, 0.7);
  mixInto(b, grassLayer, 0.035, 0.95, 0.025, 0.14);
  mixInto(b, dirtLayer, 0.035, 0.65, 0.025, 0.14);

  // 4) Crisp ball poke thud mid-slide
  addPitchBody(b, 0.135, 0.12, 168 * pMul, 58 * pMul, 26, 0.65, 0.15);

  addRoomReflections(b, 0.18, 'stadium');
  finalizeWav(path.join(OUT_DIR, relPath), b, 0.88, 1.35);
}

// ============================================================================
// 4. STEAL / INTERCEPTION (Fast whip swipe + crisp leather ball slap)
// ============================================================================
function buildSteal(relPath, seed, pMul = 1.0) {
  const rng = makeRng(seed);
  const b = makeBuf(0.34);

  // Fast arm/leg lunge whoosh
  const wN = pinkNoise(Math.round(0.11 * SR), rng);
  const wF = biquadFilter(wN, 'bandpass', (t) => (650 + Math.sin(t * 28) * 1850) * pMul, 1.4);
  mixInto(b, wF, 0.0, 0.65, 0.008, 0.03);

  // Sharp crisp leather ball slap at lunge peak (~55ms)
  const slapN = whiteNoise(Math.round(0.055 * SR), rng);
  const slapF = biquadFilter(slapN, 'bandpass', (t) => (2400 - t * 18000) * pMul, 1.3);
  mixInto(b, slapF, 0.052, 0.95, 0.002, 0.025);
  addPitchBody(b, 0.052, 0.11, 215 * pMul, 88 * pMul, 28, 0.95, 0.30);

  // Quick court squeak tail
  const sF = biquadFilter(whiteNoise(Math.round(0.07 * SR), rng), 'bandpass', 1650 * pMul, 2.2);
  mixInto(b, sF, 0.09, 0.25, 0.005, 0.03);

  addRoomReflections(b, 0.16, 'court');
  finalizeWav(path.join(OUT_DIR, relPath), b, 0.90, 1.35);
}

// ============================================================================
// 5. BASKETBALL SHOT, SWISH & DRIBBLE
// ============================================================================
function buildHoopsShot(relPath, seed, pMul = 1.0) {
  const rng = makeRng(seed);
  const b = makeBuf(0.32);

  // Finger push on pebbled basketball skin
  const snap = biquadFilter(whiteNoise(Math.round(0.04 * SR), rng), 'bandpass', 1950 * pMul, 1.4);
  mixInto(b, snap, 0.004, 0.65, 0.002, 0.018);
  // Ball release hollow knock
  addPitchBody(b, 0.006, 0.10, 225 * pMul, 96 * pMul, 30, 0.85, 0.28);
  // Upward release air whoosh
  const wF = biquadFilter(pinkNoise(Math.round(0.18 * SR), rng), 'bandpass', (t) => (700 + t * 5200) * pMul, 1.5);
  mixInto(b, wF, 0.018, 0.58, 0.015, 0.08);

  addRoomReflections(b, 0.16, 'court');
  finalizeWav(path.join(OUT_DIR, relPath), b, 0.88, 1.25);
}

function buildSwish(relPath, seed, pMul = 1.0) {
  const rng = makeRng(seed);
  const b = makeBuf(0.46);
  const netLen = Math.round(0.36 * SR);
  const raw = whiteNoise(netLen, rng);
  // Nylon net lattice flutter as ball whips cleanly through mesh
  for (let i = 0; i < netLen; i++) {
    const t = i / SR;
    const ripple = Math.sin(t * 240) * 0.25 + 0.75;
    raw[i] *= ripple;
  }
  const hiSwish = biquadFilter(raw, 'bandpass', (t) => (2900 + t * 4200) * pMul, 1.6);
  const midNet = biquadFilter(raw, 'bandpass', (t) => (1450 + t * 1800) * pMul, 1.1);
  mixInto(b, hiSwish, 0.01, 0.88, 0.012, 0.15);
  mixInto(b, midNet, 0.015, 0.52, 0.012, 0.15);
  addPitchBody(b, 0.005, 0.07, 175 * pMul, 110 * pMul, 32, 0.28);

  addRoomReflections(b, 0.20, 'court');
  finalizeWav(path.join(OUT_DIR, relPath), b, 0.88, 1.18);
}

function buildDribble(relPath, seed, pMul = 1.0, softFooty = false) {
  const rng = makeRng(seed);
  const b = makeBuf(0.24);
  if (softFooty) {
    addPitchBody(b, 0.003, 0.12, 115 * pMul, 46 * pMul, 26, 0.88, 0.12);
    mixInto(b, biquadFilter(pinkNoise(Math.round(0.08 * SR), rng), 'lowpass', 480, 0.8), 0.002, 0.42, 0.003, 0.05);
    addRoomReflections(b, 0.10, 'stadium');
  } else {
    // Classic resonant indoor basketball bounce (pebble slap + dual shell modes)
    addPitchBody(b, 0.003, 0.13, 162 * pMul, 78 * pMul, 26, 0.96, 0.34, 0.10);
    addPitchBody(b, 0.003, 0.09, 255 * pMul, 210 * pMul, 18, 0.42);
    mixInto(b, biquadFilter(whiteNoise(Math.round(0.03 * SR), rng), 'bandpass', 1050 * pMul, 1.3), 0.001, 0.48, 0.001, 0.015);
    addRoomReflections(b, 0.18, 'court');
  }
  finalizeWav(path.join(OUT_DIR, relPath), b, 0.88, 1.25);
}

// ============================================================================
// 6. SLAM DUNK (Massive sub punch + steel rim modal ring + spring snap + net tear)
// ============================================================================
function buildDunkSlam(relPath, seed, pMul = 1.0) {
  const rng = makeRng(seed);
  const b = makeBuf(0.86);

  // 1) Air slam downward punch
  mixInto(b, biquadFilter(pinkNoise(Math.round(0.08 * SR), rng), 'bandpass', (t) => 1200 - t * 6500, 1.2), 0.0, 0.55, 0.005, 0.03);

  // 2) Heavy sub-bass ball/hand explosion into the rim at 25ms
  addPitchBody(b, 0.025, 0.28, 172 * pMul, 36 * pMul, 18, 1.35, 0.28);

  // 3) Breakaway Steel Rim Modal Resonance (Inharmonic steel modes + mechanical spring snap!)
  const modes = [
    [188 * pMul, 0.38, 0.58],
    [376 * pMul, 0.42, 0.48],
    [618 * pMul, 0.32, 0.36],
    [945 * pMul, 0.22, 0.24],
    [1420 * pMul, 0.12, 0.15],
  ];
  const rStart = Math.round(0.032 * SR);
  for (const [freq, amp, decSec] of modes) {
    const cnt = Math.round(decSec * SR);
    for (let i = 0; i < cnt; i++) {
      const di = rStart + i;
      if (di >= b.length) break;
      const t = i / SR;
      const att = Math.min(1, i / (0.003 * SR));
      const dec = Math.exp(-t * (4.5 / decSec));
      b[di] += Math.sin(2 * Math.PI * freq * t) * amp * att * dec;
    }
  }

  // 4) Sharp backboard rattle & forceful net whip at 70ms
  mixInto(b, biquadFilter(whiteNoise(Math.round(0.06 * SR), rng), 'bandpass', 2800 * pMul, 1.4), 0.028, 0.85, 0.002, 0.03);
  mixInto(b, biquadFilter(whiteNoise(Math.round(0.28 * SR), rng), 'bandpass', (t) => 2600 + t * 3200, 1.5), 0.075, 0.65, 0.015, 0.14);

  addRoomReflections(b, 0.26, 'court');
  finalizeWav(path.join(OUT_DIR, relPath), b, 0.96, 1.55);
}

// ============================================================================
// 7. GOALKEEPER SAVE (Crisp latex glove punch/catch + body landing on grass)
// ============================================================================
function buildKeeperSave(relPath, seed, pMul = 1.0) {
  const rng = makeRng(seed);
  const b = makeBuf(0.52);

  // 1) Heavy leather-on-latex impact parrying/catching high-speed shot
  mixInto(b, biquadFilter(whiteNoise(Math.round(0.055 * SR), rng), 'bandpass', (t) => (1850 - t * 14000) * pMul, 1.3), 0.004, 0.95, 0.002, 0.025);
  addPitchBody(b, 0.005, 0.15, 210 * pMul, 64 * pMul, 24, 1.10, 0.24);

  // 2) Keeper diving landing onto stadium grass at ~140ms
  addPitchBody(b, 0.14, 0.16, 86 * pMul, 36 * pMul, 18, 0.68, 0.10);
  mixInto(b, biquadFilter(pinkNoise(Math.round(0.24 * SR), rng), 'bandpass', 720 * pMul, 0.9), 0.135, 0.56, 0.02, 0.11);

  addRoomReflections(b, 0.22, 'stadium');
  finalizeWav(path.join(OUT_DIR, relPath), b, 0.92, 1.40);
}

// ============================================================================
// Generate All Primary & Variant Files From Scratch
// ============================================================================
console.log('=== Synthesizing Ground-Up Studio Sports SFX v4.8 ===');

// Football Kicks & Passes
buildFootyKick('kick_power_strike.wav', 101, { pitchMul: 1.00, isPass: false });
[1.04, 0.96, 1.08, 0.93, 1.01].forEach((pm, i) => buildFootyKick(`variants/kick_v${i + 1}.wav`, 110 + i * 7, { pitchMul: pm, isPass: false }));

buildFootyKick('pass_footy.wav', 201, { pitchMul: 1.00, isPass: true });
[1.05, 0.95, 1.09].forEach((pm, i) => buildFootyKick(`variants/pass_footy_v${i + 1}.wav`, 210 + i * 7, { pitchMul: pm, isPass: true }));

// Running Steps & Squeaks
buildFootyStep('sprint_step.wav', 301, 1.00);
[1.07, 0.93].forEach((pm, i) => buildFootyStep(`variants/step_v${i + 1}.wav`, 310 + i * 7, pm));

buildCourtStep('sprint_step_court.wav', 401, 1.00);
[1.06, 0.94].forEach((pm, i) => buildCourtStep(`variants/step_court_v${i + 1}.wav`, 410 + i * 7, pm));

buildSneakerSqueak('sneaker_squeak.wav', 501, 1.00);
buildSneakerSqueak('variants/squeak_v1.wav', 511, 0.92);

// Slide Tackles
buildSlideTackle('slide_tackle.wav', 601, 1.00);
[1.04, 0.96, 1.08, 0.92, 1.02].forEach((pm, i) => buildSlideTackle(`variants/slide_v${i + 1}.wav`, 610 + i * 7, pm));

// Steals / Interceptions
buildSteal('steal_swipe.wav', 701, 1.00);
[1.05, 0.95, 1.10, 0.91, 1.03].forEach((pm, i) => buildSteal(`variants/steal_v${i + 1}.wav`, 710 + i * 7, pm));

// Basketball Shots, Swishes & Dribbles
buildHoopsShot('shot_hoops.wav', 801, 1.00);
[1.04, 0.96, 1.08].forEach((pm, i) => buildHoopsShot(`variants/shot_hoops_v${i + 1}.wav`, 810 + i * 7, pm));

buildSwish('shot_swish.wav', 901, 1.00);
[1.05, 0.95, 1.09, 0.92, 1.02].forEach((pm, i) => buildSwish(`variants/swish_v${i + 1}.wav`, 910 + i * 7, pm));

buildDribble('dribble.wav', 1001, 1.00, false);
buildDribble('ball_bounce.wav', 1002, 0.94, false);
buildDribble('variants/dribble_v1.wav', 1003, 1.06, false);

buildDribble('bounce_footy.wav', 1101, 1.00, true);
buildDribble('variants/bounce_footy_v1.wav', 1102, 1.06, true);
buildDribble('variants/bounce_footy_v2.wav', 1103, 0.94, true);

// Slam Dunks
buildDunkSlam('dunk_slam.wav', 1201, 1.00);
[1.04, 0.96, 1.07, 0.93, 1.01].forEach((pm, i) => buildDunkSlam(`variants/dunk_v${i + 1}.wav`, 1210 + i * 7, pm));

// Keeper Saves
buildKeeperSave('keeper_save.wav', 1301, 1.00);
[1.05, 0.94, 1.08].forEach((pm, i) => buildKeeperSave(`variants/save_v${i + 1}.wav`, 1310 + i * 7, pm));

console.log('✓ Rebuilt 42 studio WAV audio files cleanly from scratch in assets/audio!');
