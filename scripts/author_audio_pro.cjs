'use strict';

/**
 * FOOTY vs HOOPS — Zero-Legacy Studio Physics & Acoustic Sound Engine
 *
 * Authors clean 44.1kHz Stereo WAV assets completely from scratch using
 * physical modal synthesis, spherical bladder decompression curves, nylon
 * net traversal modeling, stick-slip court rubber friction, and diffused
 * 4-channel Householder FDN arena acoustics.
 *
 * Uses ONLY verified clean field crowd/whistle/buzzer recordings for vocal/brass texture.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const os = require('os');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const RAW_SFX = path.join(ROOT, 'scratch', 'raw_sports_sfx');
const RAW_AUD = path.join(ROOT, 'scratch', 'raw_audio');
const AUDIO_DIR = path.join(ROOT, 'assets', 'audio');
const VAR_DIR = path.join(AUDIO_DIR, 'variants');
const MUSIC_DIR = path.join(AUDIO_DIR, 'music');
fs.mkdirSync(AUDIO_DIR, { recursive: true });
fs.mkdirSync(VAR_DIR, { recursive: true });
fs.mkdirSync(MUSIC_DIR, { recursive: true });

const CHROME_X86 = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const CHROME_STD = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const EXE = fs.existsSync(CHROME_X86) ? CHROME_X86 : (fs.existsSync(CHROME_STD) ? CHROME_STD : EDGE_PATH);

const PORT = 8796;
const CDP_PORT = 9256;

// ONLY genuine clean arena crowds, referee pea whistles & NBA shot buzzer! Zero dirty stock thuds!
const FIELD_STEMS = {
  referee_police_whistle: path.join(RAW_SFX, 'referee_police_whistle.mp3'),
  referee_whistle_loud: path.join(RAW_SFX, 'referee_whistle_loud.mp3'),
  bball_buzzer: path.join(RAW_SFX, 'bball_buzzer.mp3'),
  stadium_crowd_roar: path.join(RAW_SFX, 'stadium_crowd_roar.mp3'),
  stadium_applause: path.join(RAW_SFX, 'stadium_applause.mp3'),
  crowd_stadium_yell: path.join(RAW_SFX, 'crowd_stadium_yell.mp3'),
  crowd_victory: path.join(RAW_AUD, 'crowd_victory.mp3'),
};

const RECIPES = [
  // 1. FOOTBALL POWER STRIKE (Physical Spherical Leather Bladder + Turf Bounce + Open Stadium)
  ...([0, 1, 2, 3, 4, 5].map(idx => ({
    files: idx === 0 ? ['kick_power_strike.wav', 'variants/kick_v1.wav'] : [`variants/kick_v${idx}.wav`],
    dur: 0.36, norm: 0.85, sat: 1.04, room: 0.13, roomType: 'stadium', stereoWide: true,
    boxDip: -3.2, presence: 4.2, airShelf: 2.0, subHp: 74, lp: 13000,
    synth: { kind: 'footy_strike', pitch: [1.0, 1.03, 0.96, 1.05, 0.98, 1.02][idx], power: 1.0, seed: 101 + idx * 17 },
  }))),

  // 2. FOOTBALL CRISP INSTEP PASS (Tight Quick Push Pass)
  ...([0, 1, 2, 3].map(idx => ({
    files: idx === 0 ? ['pass_footy.wav', 'variants/pass_footy_v1.wav'] : [`variants/pass_footy_v${idx}.wav`],
    dur: 0.21, norm: 0.82, sat: 1.03, room: 0.08, roomType: 'stadium', stereoWide: true,
    boxDip: -2.8, presence: 4.0, airShelf: 1.8, subHp: 94, lp: 12600,
    synth: { kind: 'footy_pass', pitch: [1.0, 1.04, 0.96, 1.07][idx], seed: 201 + idx * 13 },
  }))),

  // 3. FOOTBALL GRASS BOUNCE (Soft Earth Cushion + Buoyant Bladder Pulse)
  ...([0, 1, 2].map(idx => ({
    files: idx === 0 ? ['bounce_footy.wav'] : [`variants/bounce_footy_v${idx}.wav`],
    dur: 0.22, norm: 0.78, sat: 1.02, room: 0.08, roomType: 'stadium',
    boxDip: -2.6, presence: 3.6, airShelf: 1.8, subHp: 88, lp: 11200,
    synth: { kind: 'footy_bounce', pitch: [1.0, 1.05, 0.94][idx], seed: 261 + idx * 11 },
  }))),

  // 4. BASKETBALL HARDWOOD DRIBBLE & FLOOR BOUNCE (Pebbled Composite Air Ping + Hollow Maple Panel)
  ...([0, 1, 2].map(idx => ({
    files: idx === 0 ? ['dribble.wav', 'ball_bounce.wav'] : (idx === 1 ? ['variants/dribble_v1.wav'] : ['variants/dribble_v2.wav']),
    dur: 0.24, norm: 0.79, sat: 1.03, room: 0.14, roomType: 'arena', stereoWide: true,
    boxDip: -2.6, presence: 3.2, airShelf: 1.6, subHp: 68, lp: 12800,
    synth: { kind: 'hoops_bounce', pitch: [1.0, 1.04, 0.96][idx], seed: 301 + idx * 19 },
  }))),

  // 5. BASKETBALL SHOT RELEASE / CHEST PASS (Crisp Finger-Pad Leather Snap)
  ...([0, 1, 2, 3].map(idx => ({
    files: idx === 0 ? ['shot_hoops.wav', 'variants/shot_hoops_v1.wav'] : [`variants/shot_hoops_v${idx}.wav`],
    dur: 0.22, norm: 0.82, sat: 1.02, room: 0.11, roomType: 'arena', stereoWide: true,
    boxDip: -2.6, presence: 3.2, airShelf: 1.4, subHp: 96, lp: 12000,
    synth: { kind: 'hoops_shot_release', pitch: [1.0, 1.04, 0.96, 1.07][idx], seed: 361 + idx * 17 },
  }))),

  // 6. BASKETBALL NYLON SWISH (3-Stage Braided Nylon Cord Traversal + Bottom Skirt Snap)
  ...([0, 1, 2, 3, 4, 5].map(idx => ({
    files: idx === 0 ? ['shot_swish.wav', 'variants/swish_v1.wav'] : [`variants/swish_v${idx}.wav`],
    dur: 0.42, norm: 0.84, sat: 1.01, room: 0.16, roomType: 'arena', stereoWide: true,
    boxDip: -3.8, presence: 3.4, airShelf: -0.6, subHp: 460, lp: 8400,
    synth: { kind: 'nylon_swish', pitch: [1.0, 1.04, 0.96, 1.07, 0.94, 1.02][idx], seed: 421 + idx * 13 },
  }))),

  // 7. NBA SLAM DUNK (Tight Glass Thump + Steel Breakaway Spring + Nylon Net Explosion)
  ...([0, 1, 2, 3, 4, 5].map(idx => ({
    files: idx === 0 ? ['dunk_slam.wav', 'variants/dunk_v1.wav'] : [`variants/dunk_v${idx}.wav`],
    dur: 0.64, norm: 0.85, sat: 1.04, room: 0.16, roomType: 'arena', stereoWide: true,
    boxDip: -3.2, presence: 3.8, airShelf: 1.6, subHp: 74, lp: 11800,
    synth: { kind: 'slam_dunk', pitch: [1.0, 1.03, 0.97, 1.05, 0.95, 1.01][idx], seed: 501 + idx * 29 },
  }))),

  // 8. RIM CLANG, TEMPERED BACKBOARD GLASS & TUBULAR GOALPOST (Physical Multi-Mode Metal & Glass)
  {
    files: ['rim_clang.wav'],
    dur: 0.44, norm: 0.82, sat: 1.03, room: 0.16, roomType: 'arena', stereoWide: true,
    boxDip: -2.6, presence: 3.0, airShelf: 1.6, subHp: 96, lp: 12800,
    synth: { kind: 'rim_clang', pitch: 1.0, seed: 581 },
  },
  {
    files: ['backboard_hit.wav'],
    dur: 0.28, norm: 0.82, sat: 1.03, room: 0.13, roomType: 'arena', stereoWide: true,
    boxDip: -3.4, presence: 3.6, airShelf: 2.0, subHp: 94, lp: 12200,
    synth: { kind: 'backboard_hit', pitch: 1.0, seed: 603 },
  },
  {
    files: ['goalpost_hit.wav'],
    dur: 0.60, norm: 0.83, sat: 1.02, room: 0.16, roomType: 'stadium', stereoWide: true,
    boxDip: -2.6, presence: 3.0, airShelf: 1.6, subHp: 90, lp: 13200,
    synth: { kind: 'goalpost_hit', pitch: 1.0, seed: 641 },
  },

  // 9. SLIDE TACKLE (Granular Grass Blade Rip + Cleat Shear + Tight Turf Cushion)
  ...([0, 1, 2, 3, 4, 5].map(idx => ({
    files: idx === 0 ? ['slide_tackle.wav', 'variants/slide_v1.wav'] : [`variants/slide_v${idx}.wav`],
    dur: 0.48, norm: 0.82, sat: 1.02, room: 0.10, roomType: 'stadium', stereoWide: true,
    boxDip: -3.4, presence: 3.8, airShelf: 2.0, subHp: 94, lp: 11800,
    synth: { kind: 'slide_tackle', pitch: [1.0, 1.04, 0.96, 1.06, 0.95, 1.02][idx], seed: 701 + idx * 17 },
  }))),

  // 10. GOALKEEPER LATEX SAVE (Padded Foam Glove Parry + Ball Compression)
  ...([0, 1, 2, 3].map(idx => ({
    files: idx === 0 ? ['keeper_save.wav', 'variants/save_v1.wav'] : [`variants/save_v${idx}.wav`],
    dur: 0.34, norm: 0.83, sat: 1.03, room: 0.13, roomType: 'stadium', stereoWide: true,
    boxDip: -3.0, presence: 3.6, airShelf: 1.8, subHp: 82, lp: 12000,
    synth: { kind: 'keeper_save', pitch: [1.0, 1.04, 0.96, 1.06][idx], seed: 801 + idx * 17 },
  }))),

  // 11. STEAL SWIPE & AIR WHOOSH
  ...([0, 1, 2, 3, 4, 5].map(idx => ({
    files: idx === 0 ? ['steal_swipe.wav', 'variants/steal_v1.wav'] : [`variants/steal_v${idx}.wav`],
    dur: 0.22, norm: 0.82, sat: 1.02, room: 0.10, stereoWide: true,
    boxDip: -2.6, presence: 3.4, airShelf: 1.8, subHp: 110, lp: 12200,
    synth: { kind: 'steal_swipe', pitch: [1.0, 1.04, 0.96, 1.07, 0.95, 1.02][idx], seed: 901 + idx * 13 },
  }))),
  {
    files: ['steal_swoosh.wav', 'variants/steal_swoosh_v1.wav'],
    dur: 0.22, norm: 0.80, sat: 1.01, room: 0.10, stereoWide: false,
    boxDip: -3.0, presence: 2.8, airShelf: 1.2, subHp: 280, lp: 9200,
    synth: { kind: 'air_swoosh', pitch: 1.0, seed: 951 },
  },

  // 12. FOOTSTEPS & STICK-SLIP COURT SNEAKER SQUEAKS
  ...([0, 1, 2].map(idx => ({
    files: idx === 0 ? ['sprint_step.wav'] : [`variants/step_v${idx}.wav`],
    dur: 0.14, norm: 0.76, sat: 1.01, room: 0.05, roomType: 'stadium',
    boxDip: -3.2, presence: 3.6, airShelf: 1.8, subHp: 112, lp: 10600,
    synth: { kind: 'grass_step', pitch: [1.0, 0.94, 1.07][idx], seed: 1001 + idx * 11 },
  }))),
  ...([0, 1, 2].map(idx => ({
    files: idx === 0 ? ['sprint_step_court.wav', 'variants/step_court_v1.wav'] : ['variants/step_court_v2.wav'],
    dur: 0.13, norm: 0.78, sat: 1.01, room: 0.08, roomType: 'arena',
    boxDip: -2.8, presence: 3.8, airShelf: 2.0, subHp: 118, lp: 11200,
    synth: { kind: 'court_step', pitch: [1.0, 1.05, 0.95][idx], seed: 1051 + idx * 13 },
  }))),
  ...([0, 1].map(idx => ({
    files: idx === 0 ? ['sneaker_squeak.wav'] : ['variants/squeak_v1.wav'],
    dur: 0.22, norm: 0.80, sat: 1.01, room: 0.13, roomType: 'arena', stereoWide: true,
    boxDip: -2.4, presence: 2.0, airShelf: 0.2, subHp: 460, lp: 9800,
    synth: { kind: 'stick_slip_squeak', pitch: idx === 0 ? 1.0 : 1.07, seed: 1101 + idx * 19 },
  }))),

  // 13. GENUINE REFEREE WHISTLES & ARENA BUZZER (Real Acoustic Field Stems + Diffused Arena Tail)
  ...([0, 1, 2, 3].map(idx => {
    const pitch = [1.0, 1.02, 0.97, 1.04][idx];
    const dbl = (idx === 2 || idx === 3);
    const files = idx === 0 ? ['whistle.wav', 'referee_whistle.wav'] : [`variants/whistle_v${idx}.wav`];
    return {
      files,
      dur: dbl ? 0.64 : 0.42, norm: 0.78, sat: 1.01, room: 0.22, roomType: 'stadium', stereoWide: true,
      boxDip: -1.8, presence: 0.8, airShelf: -0.6, subHp: 560, lp: 10800,
      layers: dbl
        ? [
            { key: 'referee_police_whistle', offsetSec: 'auto', gain: 0.84, rate: pitch, hp: 720, lp: 9800, maxDur: 0.19, fadeOut: 0.03 },
            { key: 'referee_whistle_loud', offsetSec: 'auto', delay: 0.24, gain: 0.84, rate: pitch * 0.99, hp: 720, lp: 9800, maxDur: 0.34, fadeOut: 0.06 },
          ]
        : [
            { key: idx % 2 === 0 ? 'referee_police_whistle' : 'referee_whistle_loud', offsetSec: 'auto', gain: 0.88, rate: pitch, hp: 720, lp: 9800, maxDur: 0.38, fadeOut: 0.06 },
          ],
    };
  })),
  {
    files: ['hoops_buzzer.wav'],
    dur: 0.88, norm: 0.82, sat: 1.02, room: 0.24, roomType: 'arena', stereoWide: true,
    boxDip: -2.2, presence: 1.6, airShelf: 0.8, subHp: 90, lp: 11200,
    layers: [
      { key: 'bball_buzzer', offsetSec: 0.06, gain: 0.94, rate: 1.0, hp: 96, lp: 10400, maxDur: 0.84, fadeIn: 0.015, fadeOut: 0.12 },
    ],
  },

  // 14. WIDE-STEREO STADIUM CELEBRATIONS & AMBIENCE LOOPS
  ...([0, 1, 2, 3, 4, 5].map(idx => ({
    files: idx === 0 ? ['celebration.wav', 'variants/celebrate_v1.wav'] : [`variants/celebrate_v${idx}.wav`],
    dur: 2.40, norm: 0.85, sat: 1.01, room: 0.20, roomType: 'stadium', stereoWide: true,
    boxDip: -3.8, presence: 2.2, airShelf: 1.8, subHp: 74, lp: 12000,
    layers: [
      { key: idx % 2 === 0 ? 'stadium_crowd_roar' : 'crowd_victory', offsetSec: 3.5 + idx * 0.4, gain: 0.88, rate: 1.0, hp: 80, lp: 11400, maxDur: 2.35, fadeIn: 0.04, fadeOut: 0.35 },
      { key: 'stadium_applause', offsetSec: 3.4 + idx * 0.3, gain: 0.74, rate: 1.0, hp: 150, lp: 11800, maxDur: 2.35, fadeIn: 0.06, fadeOut: 0.38 },
    ],
  }))),
  {
    files: ['crowd_cheer.wav'],
    dur: 1.45, norm: 0.82, sat: 1.01, room: 0.18, roomType: 'stadium', stereoWide: true,
    boxDip: -3.6, presence: 2.2, airShelf: 1.6, subHp: 78, lp: 11800,
    layers: [
      { key: 'crowd_stadium_yell', offsetSec: 0.85, gain: 0.84, rate: 1.0, hp: 92, lp: 11400, maxDur: 1.40, fadeIn: 0.05, fadeOut: 0.32 },
      { key: 'stadium_applause', offsetSec: 4.10, gain: 0.76, rate: 1.0, hp: 150, lp: 11600, maxDur: 1.38, fadeIn: 0.06, fadeOut: 0.32 },
    ],
  },
  {
    files: ['ambience_footy.wav'],
    dur: 4.00, norm: 0.50, sat: 1.0, room: 0.12, roomType: 'stadium', stereoWide: true,
    boxDip: -4.2, presence: 1.2, airShelf: 1.0, subHp: 74, lp: 9200, seamlessLoop: true,
    layers: [
      { key: 'stadium_crowd_roar', offsetSec: 4.6, gain: 0.74, rate: 0.98, hp: 82, lp: 8600, maxDur: 4.5 },
      { key: 'stadium_applause', offsetSec: 4.2, gain: 0.42, rate: 0.96, hp: 150, lp: 8800, maxDur: 4.5 },
    ],
  },
  {
    files: ['ambience_hoops.wav'],
    dur: 4.00, norm: 0.58, sat: 1.0, room: 0.14, roomType: 'arena', stereoWide: true,
    boxDip: -3.8, presence: 1.4, airShelf: 1.2, subHp: 74, lp: 9400, seamlessLoop: true,
    layers: [
      { key: 'stadium_applause', offsetSec: 4.2, gain: 0.76, rate: 0.94, hp: 90, lp: 8800, maxDur: 4.5 },
      { key: 'stadium_crowd_roar', offsetSec: 5.5, gain: 0.58, rate: 1.00, hp: 82, lp: 8200, maxDur: 4.5 },
    ],
  },

  // 15. FULL MULTI-TRACK STUDIO SOUNDTRACK STEMS (Kick, Snare, Hats, Analog Bass, Vintage Rhodes & Plucks)
  {
    files: ['music/music_kick.wav'], dur: 0.28, norm: 0.82, sat: 1.04, room: 0.03,
    boxDip: -2.4, presence: 1.8, airShelf: 0.0, subHp: 34, lp: 5200,
    synth: { kind: 'music_kick', seed: 2001 },
  },
  {
    files: ['music/music_snare.wav'], dur: 0.24, norm: 0.78, sat: 1.02, room: 0.24, roomType: 'arena', stereoWide: true,
    boxDip: -2.2, presence: 2.2, airShelf: 1.6, subHp: 110, lp: 12400,
    synth: { kind: 'music_snare', seed: 2002 },
  },
  {
    files: ['music/music_hat.wav'], dur: 0.09, norm: 0.62, sat: 1.0, room: 0.08, stereoWide: true,
    boxDip: -2.0, presence: 1.4, airShelf: 1.6, subHp: 2200, lp: 13800,
    synth: { kind: 'music_hat', open: false, seed: 2003 },
  },
  {
    files: ['music/music_open_hat.wav'], dur: 0.20, norm: 0.62, sat: 1.0, room: 0.14, stereoWide: true,
    boxDip: -2.0, presence: 1.4, airShelf: 1.8, subHp: 1900, lp: 13800,
    synth: { kind: 'music_hat', open: true, seed: 2004 },
  },
  ...([0, 1, 2, 3].map(idx => ({
    files: [`music/music_chord_${idx}.wav`], dur: 1.25, norm: 0.78, sat: 1.03, room: 0.28, roomType: 'arena', stereoWide: true,
    boxDip: -2.4, presence: 1.2, airShelf: 1.0, subHp: 42, lp: 11400,
    synth: { kind: 'music_rhodes', chordIdx: idx, seed: 2100 + idx * 31 },
  }))),
  ...([0, 1, 2, 3].map(idx => ({
    files: [`music/music_bass_${idx}.wav`], dur: 0.42, norm: 0.80, sat: 1.05, room: 0.04,
    boxDip: -2.0, presence: 1.0, airShelf: 0.0, subHp: 32, lp: 1800,
    synth: { kind: 'music_bass', chordIdx: idx, seed: 2200 + idx * 19 },
  }))),
  ...([0, 1, 2, 3].map(idx => ({
    files: [`music/music_pluck_${idx}.wav`], dur: 0.36, norm: 0.72, sat: 1.01, room: 0.26, roomType: 'arena', stereoWide: true,
    boxDip: -1.8, presence: 1.6, airShelf: 1.4, subHp: 160, lp: 11800,
    synth: { kind: 'music_pluck', chordIdx: idx, seed: 2300 + idx * 23 },
  }))),
];

const rawB64 = {};
for (const [k, p] of Object.entries(FIELD_STEMS)) {
  if (!fs.existsSync(p)) throw new Error('Missing field audio stem: ' + p);
  rawB64[k] = fs.readFileSync(p).toString('base64');
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<!doctype html><html><body>Pro Physics Audio Synthesis Engine</body></html>');
});

server.listen(PORT, '127.0.0.1', async () => {
  const udir = fs.mkdtempSync(path.join(os.tmpdir(), 'fvh-pro-aud-'));
  const br = spawn(EXE, [
    '--headless=new', '--no-sandbox', '--remote-debugging-port=' + CDP_PORT,
    '--user-data-dir=' + udir, '--autoplay-policy=no-user-gesture-required', 'about:blank'
  ], { stdio: 'ignore' });

  let ts = [];
  for (let i = 0; i < 45; i++) {
    try {
      ts = await (await fetch('http://127.0.0.1:' + CDP_PORT + '/json/list')).json();
      if (ts.some(t => t.type === 'page' && t.webSocketDebuggerUrl)) break;
    } catch (_) {}
    await new Promise(r => setTimeout(r, 120));
  }
  const ws = new WebSocket(ts.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  const send = (method, params) => new Promise((res, rej) => {
    const id = Math.floor(Math.random() * 1e9);
    const fn = ev => {
      const d = JSON.parse(ev.data);
      if (d.id === id) {
        ws.removeEventListener('message', fn);
        d.error ? rej(new Error(JSON.stringify(d.error))) : res(d.result);
      }
    };
    ws.addEventListener('message', fn);
    ws.send(JSON.stringify({ id, method, params: params || {} }));
  });
  await send('Runtime.enable');
  await send('Page.navigate', { url: 'http://127.0.0.1:' + PORT + '/' });
  await new Promise(r => setTimeout(r, 400));

  await send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(async () => {
      const b64Map = ${JSON.stringify(rawB64)};
      window.__actx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44100 });
      window.__raw = {}; window.__meta = {};
      for (const [k, b64] of Object.entries(b64Map)) {
        const bin = atob(b64), bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        const buf = await window.__actx.decodeAudioData(bytes.buffer.slice(0));
        window.__raw[k] = buf;
        const ch = buf.getChannelData(0), sr = buf.sampleRate;
        let pk = 0, pkIdx = 0, onsetIdx = 0;
        for (let i = 0; i < ch.length; i++) { const a = Math.abs(ch[i]); if (a > pk) { pk = a; pkIdx = i; } }
        const thr = Math.max(0.015, pk * 0.14);
        for (let i = 0; i < ch.length; i++) { if (Math.abs(ch[i]) >= thr) { onsetIdx = Math.max(0, i - Math.floor(sr * 0.0015)); break; } }
        window.__meta[k] = { onsetSec: onsetIdx / sr, peakSec: pkIdx / sr };
      }

      // From-Scratch Physical Acoustic Foley & Studio Instrument Synthesizer
      window.__synthPhysics = (ctx, dest, spec, durSec) => {
        const SR = ctx.sampleRate, nF = Math.floor(SR * durSec), p = spec.pitch || 1.0;
        const buf = ctx.createBuffer(2, nF, SR), c0 = buf.getChannelData(0), c1 = buf.getChannelData(1);
        let rng = (spec.seed || 77) >>> 0;
        const rnd = () => { rng = (rng * 1664525 + 1013904223) >>> 0; return (rng / 2147483648) - 1; };
        const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

        if (spec.kind === 'footy_strike' || spec.kind === 'footy_pass' || spec.kind === 'footy_bounce') {
          const isPass = spec.kind === 'footy_pass';
          const isBounce = spec.kind === 'footy_bounce';
          const pw = isPass ? 0.88 : isBounce ? 0.78 : 1.0;
          // Tight sub punch (<45ms) + woody hollow bladder body (175-420Hz) + crisp boot-leather wave (1.4-4.8kHz)
          const fBase = isPass ? 168 : isBounce ? 136 : 114;
          const modes = [
            [1.0, isBounce ? 0.18 : 0.22, isBounce ? 68 : 54],
            [1.62, 0.36, 44],
            [2.45, 0.30, 58],
            [3.52, 0.24, 84],
            [5.10, 0.16, 128],
            [7.40, 0.11, 185],
            [10.8, 0.08, 260]
          ];
          let lp1 = 0, lp2 = 0, hpPrev = 0, hpOut = 0;
          const delayGrass = Math.floor(SR * 0.0022);
          const tmp = new Float32Array(nF);
          for (let i = 0; i < nF; i++) {
            const t = i / SR;
            const squeeze = 1 + (isBounce ? 0.08 : 0.18) * Math.exp(-t * 88);
            const tEff = t * squeeze;
            let body = 0;
            for (const [m, a, d] of modes) {
              body += Math.sin(2 * Math.PI * fBase * p * m * tEff) * a * Math.exp(-t * d * (isPass ? 1.35 : 1.0));
            }
            body *= (1 - Math.exp(-t * 3400));
            const w = rnd();
            const nDecay = isBounce ? 115 : (isPass ? 205 : 165);
            const raw = w * Math.exp(-t * nDecay);
            lp1 = lp1 * (isBounce ? 0.42 : 0.34) + raw * (isBounce ? 0.58 : 0.66);
            lp2 = lp2 * 0.38 + lp1 * 0.62;
            hpOut = 0.76 * (hpOut + lp2 - hpPrev); hpPrev = lp2;
            const snapMod = 0.78 + 0.22 * Math.sin(2 * Math.PI * 1240 * p * t);
            const click = (Math.tanh(hpOut * (isBounce ? 3.4 : 4.2)) * (isBounce ? 0.64 : 0.84) * snapMod + Math.exp(-t * 880) * 0.24) * (1 - Math.exp(-t * 5000));
            tmp[i] = (body * (isBounce ? 0.48 : 0.54) + click * 0.92) * pw;
          }
          for (let i = 0; i < nF; i++) {
            const refl = i >= delayGrass ? tmp[i - delayGrass] * 0.20 : 0;
            c0[i] = tmp[i] + refl * 0.86;
            c1[i] = tmp[i] + refl * 1.12;
          }
        } else if (spec.kind === 'hoops_bounce' || spec.kind === 'hoops_shot_release') {
          const isRel = spec.kind === 'hoops_shot_release';
          // 1. Tight composite ball cavity ("poing!" 218, 436, 650, 980Hz) + 2. Crisp maple panel tap (112, 238, 440Hz)
          const ballModes = [[218 * p, 0.34, 34], [436 * p, 0.28, 48], [652 * p, 0.22, 68], [1040 * p, 0.14, 110]];
          const woodModes = isRel ? [] : [[114 * p, 0.24, 68], [238 * p, 0.28, 72], [440 * p, 0.20, 95]];
          let lp = 0, hpP = 0, hpO = 0;
          for (let i = 0; i < nF; i++) {
            const t = i / SR;
            let sBall = 0, sWood = 0;
            const tSq = t * (1 + 0.12 * Math.exp(-t * 98));
            for (const [f, a, d] of ballModes) sBall += Math.sin(2 * Math.PI * f * tSq) * a * Math.exp(-t * d);
            for (const [f, a, d] of woodModes) sWood += Math.sin(2 * Math.PI * f * t) * a * Math.exp(-t * d);
            const flap = rnd() * Math.exp(-t * (isRel ? 230 : 280));
            lp = lp * 0.34 + flap * 0.66;
            hpO = 0.80 * (hpO + lp - hpP); hpP = lp;
            const snap = Math.tanh(hpO * 4.0) * 0.82 * (1 - Math.exp(-t * 5400));
            const s = (sBall * (isRel ? 0.66 : 0.72) + sWood * 0.56 + snap) * (1 - Math.exp(-t * 3800));
            c0[i] = s; c1[i] = s * 0.96 + snap * 0.08;
          }
        } else if (spec.kind === 'nylon_swish') {
          // 3-Stage Warm Physical Braided Nylon Net Traversal (rich 1.6-5.5kHz cord shimmer, zero harsh 9kHz hiss!)
          let f1L = 0, f1R = 0, f2L = 0, f2R = 0, hpPL = 0, hpPR = 0, hpOL = 0, hpOR = 0, whipLP = 0;
          for (let i = 0; i < nF; i++) {
            const t = i / SR;
            const stage1 = Math.exp(-Math.pow((t - 0.016) / 0.014, 2)) * 0.58 * (1 - Math.exp(-t * 1600));
            const stage2 = Math.exp(-Math.pow((t - 0.076) / 0.042, 2)) * (0.78 + 0.22 * Math.sin(2 * Math.PI * 58 * p * t));
            const stage3 = Math.exp(-Math.pow((t - 0.165) / 0.036, 2)) * 0.54;
            const env = stage1 + stage2 + stage3;
            const wL = rnd(), wR = rnd();
            f1L = f1L * 0.42 + wL * 0.58; f1R = f1R * 0.42 + wR * 0.58;
            f2L = f2L * 0.36 + f1L * 0.64; f2R = f2R * 0.36 + f1R * 0.64;
            hpOL = 0.84 * (hpOL + f2L - hpPL); hpPL = f2L;
            hpOR = 0.84 * (hpOR + f2R - hpPR); hpPR = f2R;
            whipLP = whipLP * 0.48 + rnd() * 0.52;
            const cordWhip = whipLP * Math.exp(-Math.pow((t - 0.155) / 0.015, 2)) * 0.42;
            c0[i] = (hpOL * env * 0.88 + cordWhip) * 0.78;
            c1[i] = (hpOR * env * 0.88 - cordWhip * 0.35 + whipLP * Math.exp(-Math.pow((t - 0.16) / 0.016, 2)) * 0.34) * 0.78;
          }
        } else if (spec.kind === 'slam_dunk' || spec.kind === 'rim_clang' || spec.kind === 'backboard_hit' || spec.kind === 'goalpost_hit') {
          const isDunk = spec.kind === 'slam_dunk', isRim = spec.kind === 'rim_clang';
          const isBoard = spec.kind === 'backboard_hit', isPost = spec.kind === 'goalpost_hit';
          const modes = isBoard
            ? [[148, 0.24, 42], [295, 0.34, 44], [585, 0.30, 56], [1120, 0.22, 86], [1980, 0.14, 130]]
            : isPost
            ? [[386, 0.36, 6.2], [744, 0.26, 8.8], [1295, 0.20, 12], [2115, 0.14, 18], [3360, 0.08, 28]]
            : isDunk
            ? [[152, 0.22, 34], [326, 0.30, 26], [690, 0.28, 32], [1460, 0.24, 42], [2580, 0.18, 56], [3920, 0.12, 76]]
            : [[206, 0.32, 16], [418, 0.26, 20], [848, 0.18, 28], [1485, 0.13, 38], [2410, 0.08, 56]];
          let lp = 0, hpP = 0, hpO = 0, swP = 0, swO = 0, swLP = 0;
          for (let i = 0; i < nF; i++) {
            const t = i / SR;
            let ring = 0;
            for (const [f, a, d] of modes) {
              const seamBeat = isPost ? (1 + 0.18 * Math.sin(2 * Math.PI * 1.9 * t)) : 1;
              ring += Math.sin(2 * Math.PI * f * p * t) * a * Math.exp(-t * d) * seamBeat;
            }
            // Tight sub impact (<25ms) + steel rim spring latch + immediate nylon net blast
            const glassSub = (isDunk || isBoard) ? Math.tanh(Math.sin(2 * Math.PI * (isDunk ? 84 : 96) * p * t) * 1.25) * Math.exp(-t * (isDunk ? 52 : 62)) * (isDunk ? 0.22 : 0.16) : 0;
            const springSnap = isDunk ? (Math.sin(2 * Math.PI * 580 * t) * 0.28 + Math.sin(2 * Math.PI * 1240 * t) * 0.18) * Math.exp(-Math.pow((t - 0.072) / 0.018, 2)) : 0;
            const hitBurst = rnd() * Math.exp(-t * 190);
            lp = lp * 0.28 + hitBurst * 0.72;
            hpO = 0.84 * (hpO + lp - hpP); hpP = lp;
            const crack = hpO * (isBoard ? 0.94 : 1.05) * (1 - Math.exp(-t * 5400));
            let swish = 0;
            if (isDunk && t > 0.036) {
              const st = t - 0.036;
              swLP = swLP * 0.42 + rnd() * 0.58;
              swO = 0.84 * (swO + swLP - swP); swP = swO;
              swish = swO * Math.exp(-Math.pow((st - 0.078) / 0.056, 2)) * 0.62;
            }
            c0[i] = (ring * 0.66 + glassSub + crack + springSnap + swish) * 0.82;
            c1[i] = (ring * 0.63 + glassSub + crack * 0.95 - springSnap * 0.6 + swish * 0.88) * 0.82;
          }
        } else if (spec.kind === 'slide_tackle') {
          // Crisp Stadium Grass Shearing + Cleat Spray + Tight Turf Cushion
          let fL = 0, fR = 0, gL = 0, gR = 0, hpPL = 0, hpPR = 0, hpOL = 0, hpOR = 0;
          for (let i = 0; i < nF; i++) {
            const t = i / SR;
            const body = Math.sin(2 * Math.PI * 104 * p * t) * Math.exp(-t * 72) * 0.18
                       + Math.sin(2 * Math.PI * 224 * p * t) * Math.exp(-t * 68) * 0.18;
            const cleatBite = rnd() * Math.exp(-t * 145) * 0.74;
            const glideEnv = (Math.sin(clamp(t / 0.44, 0, 1) * Math.PI) * Math.exp(-Math.max(0, t - 0.11) * 5.2)) + Math.exp(-t * 48) * 0.36;
            const blades = 0.62 + 0.38 * Math.sin(2 * Math.PI * 52 * t + 0.4 * Math.sin(2 * Math.PI * 13 * t));
            const r1 = rnd(), r2 = rnd();
            fL = fL * 0.34 + r1 * 0.66; fR = fR * 0.34 + r2 * 0.66;
            hpOL = 0.82 * (hpOL + fL - hpPL); hpPL = fL;
            hpOR = 0.82 * (hpOR + fR - hpPR); hpPR = fR;
            gL = gL * 0.50 + hpOL * 0.50;
            gR = gR * 0.50 + hpOR * 0.50;
            c0[i] = (body + cleatBite + (gL * 0.68 + hpOL * 0.32) * glideEnv * blades) * (1 - Math.exp(-t * 3800)) * 0.82;
            c1[i] = (body + cleatBite * 0.92 + (gR * 0.68 + hpOR * 0.32) * glideEnv * blades) * (1 - Math.exp(-t * 3800)) * 0.82;
          }
        } else if (spec.kind === 'keeper_save') {
          // Viscous latex foam palm slap + crisp glove snap + compressed football body
          let lp = 0, hpP = 0, hpO = 0;
          for (let i = 0; i < nF; i++) {
            const t = i / SR;
            const ball = (Math.sin(2 * Math.PI * 124 * p * t) * 0.34 + Math.sin(2 * Math.PI * 265 * p * t) * 0.24) * Math.exp(-t * 34);
            const slapEnv = Math.exp(-Math.pow((t - 0.006) / 0.011, 2)) + 0.54 * Math.exp(-Math.pow((t - 0.042) / 0.017, 2));
            lp = lp * 0.34 + rnd() * 0.66;
            hpO = 0.78 * (hpO + lp - hpP); hpP = lp;
            const latex = (hpO * 0.65 + lp * 0.35) * slapEnv * 0.84;
            c0[i] = (ball + latex) * (1 - Math.exp(-t * 3200)) * 0.80;
            c1[i] = (ball + latex * 0.94) * (1 - Math.exp(-t * 3200)) * 0.80;
          }
        } else if (spec.kind === 'steal_swipe') {
          let lp = 0, hpP = 0, hpO = 0;
          for (let i = 0; i < nF; i++) {
            const t = i / SR;
            const leather = Math.sin(2 * Math.PI * 224 * p * t) * Math.exp(-t * 48) * 0.42;
            lp = lp * 0.34 + rnd() * 0.66;
            hpO = 0.80 * (hpO + lp - hpP); hpP = lp;
            const snap = Math.tanh(hpO * 3.6) * Math.exp(-t * 145) * 0.72 * (1 - Math.exp(-t * 4500));
            c0[i] = (leather + snap) * 0.80; c1[i] = c0[i];
          }
        } else if (spec.kind === 'air_swoosh') {
          let lp = 0, hpP = 0, hpO = 0, lS = 0;
          for (let i = 0; i < nF; i++) {
            const t = i / SR, env = Math.sin(clamp(t / 0.17, 0, 1) * Math.PI);
            lp = lp * 0.52 + rnd() * 0.48;
            hpO = 0.88 * (hpO + lp - hpP); hpP = lp;
            lS = lS * 0.54 + rnd() * 0.46;
            c0[i] = (hpO * 0.84 + lS * 0.16) * env * 0.54;
            c1[i] = (hpO * 0.84 - lS * 0.16) * env * 0.54;
          }
        } else if (spec.kind === 'grass_step' || spec.kind === 'court_step') {
          const isCourt = spec.kind === 'court_step';
          let lp = 0, hpP = 0, hpO = 0;
          for (let i = 0; i < nF; i++) {
            const t = i / SR;
            const wood = (Math.sin(2 * Math.PI * (isCourt ? 192 : 144) * p * t) * 0.18 + Math.sin(2 * Math.PI * (isCourt ? 385 : 270) * p * t) * 0.20) * Math.exp(-t * (isCourt ? 92 : 84));
            lp = lp * (isCourt ? 0.28 : 0.34) + rnd() * (isCourt ? 0.72 : 0.66);
            hpO = 0.82 * (hpO + lp - hpP); hpP = lp;
            const sole = (hpO * 0.68 + lp * 0.32) * Math.exp(-t * (isCourt ? 145 : 95)) * (isCourt ? 0.72 : 0.68);
            const microChirp = isCourt ? Math.sin(2 * Math.PI * 2240 * p * t) * Math.exp(-t * 175) * 0.14 : 0;
            c0[i] = (wood + sole + microChirp) * (1 - Math.exp(-t * 3600)); c1[i] = c0[i];
          }
        } else if (spec.kind === 'stick_slip_squeak') {
          // Physical Rubber-on-Polyurethane Stick-Slip Chirp (Double short clean basketball cut!)
          for (let i = 0; i < nF; i++) {
            const t = i / SR;
            const e1 = Math.exp(-Math.pow((t - 0.036) / 0.022, 2));
            const e2 = 0.72 * Math.exp(-Math.pow((t - 0.105) / 0.024, 2));
            const f1 = (2050 + 420 * Math.sin(2 * Math.PI * 16 * t)) * p;
            const f2 = (1820 + 280 * Math.cos(2 * Math.PI * 14 * t)) * p;
            // Stick-slip harmonic wave (tanh-softened odd harmonics, warm and organic!)
            const s1 = Math.tanh((Math.sin(2 * Math.PI * f1 * t) + 0.32 * Math.sin(2 * Math.PI * f1 * 2.02 * t)) * 1.3) * e1;
            const s2 = Math.tanh((Math.sin(2 * Math.PI * f2 * t) + 0.28 * Math.sin(2 * Math.PI * f2 * 2.01 * t)) * 1.2) * e2;
            const micro = (Math.sin(2 * Math.PI * f1 * 1.48 * t) * 0.14 + rnd() * 0.06) * (e1 + e2);
            c0[i] = (s1 + s2 + micro) * 0.46;
            c1[i] = (s1 * 0.94 + s2 * 1.04 + micro) * 0.46;
          }
        } else if (spec.kind === 'music_kick') {
          let lp = 0;
          for (let i = 0; i < nF; i++) {
            const t = i / SR;
            const ph = 2 * Math.PI * (48 * t + (84 / 36) * (1 - Math.exp(-36 * t)));
            const sub = Math.tanh(Math.sin(ph) * 1.45) * Math.exp(-t * 10.2);
            lp = lp * 0.36 + rnd() * 0.64;
            const transient = lp * Math.exp(-t * 280) * 0.34;
            const s = (sub * 0.84 + transient) * (1 - Math.exp(-t * 3200));
            c0[i] = s; c1[i] = s;
          }
        } else if (spec.kind === 'music_snare') {
          let n1 = 0, n2 = 0, hpP = 0, hp = 0;
          for (let i = 0; i < nF; i++) {
            const t = i / SR;
            const body = Math.sin(2 * Math.PI * (174 * t + (90 / 40) * (1 - Math.exp(-40 * t)))) * 0.46 * Math.exp(-t * 20) + Math.sin(2 * Math.PI * 336 * t) * 0.22 * Math.exp(-t * 32);
            const w1 = rnd(), w2 = rnd();
            n1 = n1 * 0.26 + w1 * 0.74; n2 = n2 * 0.26 + w2 * 0.74;
            hp = 0.82 * (hp + n1 - hpP); hpP = n1;
            const snap = (hp * 0.56 + n2 * 0.24) * Math.exp(-t * 16) * (1 - Math.exp(-t * 3400));
            c0[i] = (body + snap * 0.85) * 0.74;
            c1[i] = (body + snap * 0.92 + (n2 - n1) * 0.14 * Math.exp(-t * 16)) * 0.74;
          }
        } else if (spec.kind === 'music_hat') {
          const dec = spec.open ? 13 : 50;
          let hpP = 0, hp = 0;
          for (let i = 0; i < nF; i++) {
            const t = i / SR;
            const m = Math.sin(2 * Math.PI * 3340 * t) * Math.sin(2 * Math.PI * 5290 * t) + rnd() * 0.88;
            hp = 0.86 * (hp + m - hpP); hpP = m;
            const s = hp * Math.exp(-t * dec) * (1 - Math.exp(-t * 5000)) * 0.42;
            c0[i] = s; c1[i] = s * 0.94;
          }
        } else if (spec.kind === 'music_bass') {
          const roots = [55.00, 43.65, 65.41, 49.00];
          const f = roots[spec.chordIdx % roots.length];
          for (let i = 0; i < nF; i++) {
            const t = i / SR;
            const atk = 1 - Math.exp(-t * 140), env = Math.exp(-t * 3.8);
            const rel = t > (durSec - 0.05) ? clamp((durSec - t) / 0.05, 0, 1) : 1;
            // Warm moog-style punchy analog bass (fundamental + 2nd + filtered 3rd harmonic)
            const wave = Math.sin(2 * Math.PI * f * t) * 0.76 + Math.sin(2 * Math.PI * f * 2 * t) * (0.28 + 0.18 * Math.exp(-t * 18)) + Math.sin(2 * Math.PI * f * 3 * t) * 0.12 * Math.exp(-t * 24);
            const s = Math.tanh(wave * 1.35) * 0.72 * atk * env * rel;
            c0[i] = s; c1[i] = s;
          }
        } else if (spec.kind === 'music_rhodes') {
          const CHORDS = [
            [220.00, 261.63, 329.63, 392.00, 493.88], // Am9
            [174.61, 220.00, 261.63, 329.63, 392.00], // Fmaj7
            [196.00, 261.63, 293.66, 329.63, 493.88], // Cmaj9
            [196.00, 246.94, 293.66, 329.63, 440.00], // G13
          ];
          const notes = CHORDS[spec.chordIdx % CHORDS.length];
          for (let i = 0; i < nF; i++) {
            const t = i / SR;
            const atk = 1 - Math.exp(-t * 120), rel = t > (durSec - 0.16) ? clamp((durSec - t) / 0.16, 0, 1) : 1;
            const tine = Math.exp(-t * 15), warm = Math.exp(-t * 2.0);
            let L = 0, R = 0;
            for (let k = 0; k < notes.length; k++) {
              const f = notes[k], pan = (k / (notes.length - 1)) * 0.56 - 0.28;
              const fmL = Math.sin(2 * Math.PI * f * 7.0 * t) * tine * 1.45;
              const fmR = Math.sin(2 * Math.PI * f * 7.01 * t) * tine * 1.45;
              const vL = (Math.sin(2 * Math.PI * f * 0.9986 * t + fmL) + 0.24 * Math.sin(2 * Math.PI * f * 2 * t)) * warm * 0.20;
              const vR = (Math.sin(2 * Math.PI * f * 1.0014 * t + fmR) + 0.24 * Math.sin(2 * Math.PI * f * 2 * t)) * warm * 0.20;
              L += vL * (1 - pan); R += vR * (1 + pan);
            }
            c0[i] = L * atk * rel; c1[i] = R * atk * rel;
          }
        } else if (spec.kind === 'music_pluck') {
          const PLUCKS = [659.25, 523.25, 587.33, 493.88];
          const f = PLUCKS[spec.chordIdx % PLUCKS.length];
          for (let i = 0; i < nF; i++) {
            const t = i / SR;
            const atk = 1 - Math.exp(-t * 320), env = Math.exp(-t * 9.5);
            const rel = t > (durSec - 0.04) ? clamp((durSec - t) / 0.04, 0, 1) : 1;
            const m = Math.sin(2 * Math.PI * f * 3.0 * t) * Math.exp(-t * 28) * 1.2;
            const s = Math.sin(2 * Math.PI * f * t + m) * 0.55 * atk * env * rel;
            c0[i] = s * 0.95; c1[i] = s * 1.05;
          }
        }

        const src = ctx.createBufferSource();
        src.buffer = buf; src.connect(dest); src.start(0);
      };
    })()`
  });

  let written = 0;
  for (const rec of RECIPES) {
    const wavB64 = await send('Runtime.evaluate', {
      returnByValue: true, awaitPromise: true,
      expression: `(async () => {
        const rec = ${JSON.stringify(rec)};
        const SR = 44100, totalFrames = Math.floor(rec.dur * SR);
        const off = new OfflineAudioContext(2, totalFrames, SR);

        const hp = off.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = rec.subHp || 48;
        const dip = off.createBiquadFilter(); dip.type = 'peaking'; dip.frequency.value = 285; dip.Q.value = 0.85; dip.gain.value = rec.boxDip || -2.0;
        const pres = off.createBiquadFilter(); pres.type = 'peaking'; pres.frequency.value = 2400; pres.Q.value = 0.75; pres.gain.value = rec.presence || 1.8;
        const air = off.createBiquadFilter(); air.type = 'highshelf'; air.frequency.value = 5000; air.gain.value = rec.airShelf || 0.8;
        const lp = off.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = rec.lp || 12000; lp.Q.value = 0.65;
        hp.connect(dip); dip.connect(pres); pres.connect(air); air.connect(lp); lp.connect(off.destination);

        if (rec.synth) window.__synthPhysics(off, hp, rec.synth, rec.dur);

        for (const lyr of (rec.layers || [])) {
          const srcBuf = window.__raw[lyr.key], meta = window.__meta[lyr.key] || { onsetSec: 0, peakSec: 0 };
          const src = off.createBufferSource(); src.buffer = srcBuf; src.playbackRate.value = lyr.rate || 1.0;
          let node = src;
          if (lyr.hp) { const f = off.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = lyr.hp; node.connect(f); node = f; }
          if (lyr.lp) { const f = off.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lyr.lp; node.connect(f); node = f; }
          const g = off.createGain(), st = lyr.delay || 0;
          const offS = lyr.offsetSec === 'auto' ? meta.onsetSec : Number(lyr.offsetSec || 0);
          const pd = Math.min(lyr.maxDur || rec.dur, Math.max(0.03, srcBuf.duration - offS));
          if (lyr.fadeIn) { g.gain.setValueAtTime(0.001, st); g.gain.linearRampToValueAtTime(lyr.gain, st + lyr.fadeIn); }
          else g.gain.setValueAtTime(lyr.gain, st);
          if (lyr.fadeOut) { const fe = Math.max(st + 0.02, st + pd - lyr.fadeOut); g.gain.setValueAtTime(lyr.gain, fe); g.gain.linearRampToValueAtTime(0.0001, st + pd); }
          node.connect(g); g.connect(hp); src.start(st, offS, pd);
        }

        const rendered = await off.startRendering();
        const ch0 = rendered.getChannelData(0), ch1 = rendered.getChannelData(1);

        if (rec.seamlessLoop) {
          const cf = Math.floor(SR * 0.45);
          for (let i = 0; i < cf; i++) {
            const w = 0.5 - 0.5 * Math.cos(Math.PI * i / cf), ti = totalFrames - cf + i;
            const sL = ch0[i] * w + ch0[ti] * (1 - w), sR = ch1[i] * w + ch1[ti] * (1 - w);
            ch0[i] = sL; ch1[i] = sR; ch0[ti] = sL; ch1[ti] = sR;
          }
        }

        // L/R RMS Center Balance
        let sL2 = 1e-8, sR2 = 1e-8;
        for (let i = 0; i < totalFrames; i++) { sL2 += ch0[i] * ch0[i]; sR2 += ch1[i] * ch1[i]; }
        const rL = Math.sqrt(sL2 / totalFrames), rR = Math.sqrt(sR2 / totalFrames), rA = 0.5 * (rL + rR);
        const bL = Math.max(0.76, Math.min(1.32, rA / Math.max(1e-6, rL))), bR = Math.max(0.76, Math.min(1.32, rA / Math.max(1e-6, rR)));
        for (let i = 0; i < totalFrames; i++) { ch0[i] *= bL; ch1[i] *= bR; }

        // Diffused 4-Channel Householder FDN (Arena vs Open Stadium acoustic profiles)
        const roomAmt = rec.room || 0;
        const lOut = new Float32Array(totalFrames), rOut = new Float32Array(totalFrames);
        const isSt = rec.roomType === 'stadium';
        const fdnDel = isSt ? [1499, 2111, 2903, 3821] : [683, 1181, 1747, 2389];
        const dampA = isSt ? 0.52 : 0.36;
        const fbGain = isSt ? 0.48 : 0.58;
        const fdnBufs = fdnDel.map(n => new Float32Array(n)), fdnPtr = [0, 0, 0, 0], fdnLp = [0, 0, 0, 0];
        const wideTap = rec.stereoWide ? Math.floor(SR * 0.0075) : 0;

        for (let i = 0; i < totalFrames; i++) {
          let l = ch0[i], r = wideTap && i >= wideTap ? (ch1[i] * 0.88 + ch0[i - wideTap] * 0.12) : ch1[i];
          if (roomAmt > 0) {
            const dO = [0, 0, 0, 0]; let sum = 0;
            for (let k = 0; k < 4; k++) {
              const raw = fdnBufs[k][fdnPtr[k]];
              fdnLp[k] = fdnLp[k] * dampA + raw * (1 - dampA);
              dO[k] = fdnLp[k]; sum += fdnLp[k];
            }
            const mIn = 0.5 * (ch0[i] + ch1[i]);
            l += ((dO[0] - dO[1] + dO[2] - dO[3]) * 0.54) * roomAmt;
            r += ((dO[0] + dO[1] - dO[2] - dO[3]) * 0.54) * roomAmt;
            for (let k = 0; k < 4; k++) {
              fdnBufs[k][fdnPtr[k]] = (dO[k] - 0.5 * sum) * fbGain + mIn * (k < 2 ? 0.50 : 0.40);
              fdnPtr[k] = (fdnPtr[k] + 1) % fdnDel[k];
            }
          }
          lOut[i] = l; rOut[i] = r;
        }

        if (!rec.seamlessLoop) {
          const tail = Math.min(Math.floor(SR * 0.024), Math.floor(totalFrames * 0.12));
          for (let i = 0; i < tail; i++) { const w = i / tail, idx = totalFrames - 1 - i; lOut[idx] *= w; rOut[idx] *= w; }
        }

        let pk = 1e-4;
        for (let i = 0; i < totalFrames; i++) { pk = Math.max(pk, Math.abs(lOut[i]), Math.abs(rOut[i])); }
        const tNorm = Math.min(0.82, rec.norm || 0.82), sat = rec.sat || 1.03, normSat = Math.tanh(sat);

        const wav = new Uint8Array(44 + totalFrames * 4), dv = new DataView(wav.buffer);
        const wsS = (o, s) => { for (let j = 0; j < s.length; j++) dv.setUint8(o + j, s.charCodeAt(j)); };
        wsS(0, 'RIFF'); dv.setUint32(4, 36 + totalFrames * 4, true); wsS(8, 'WAVE');
        wsS(12, 'fmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true);
        dv.setUint16(22, 2, true); dv.setUint32(24, SR, true); dv.setUint32(28, SR * 4, true);
        dv.setUint16(32, 4, true); dv.setUint16(34, 16, true);
        wsS(36, 'data'); dv.setUint32(40, totalFrames * 4, true);

        let o = 44;
        for (let i = 0; i < totalFrames; i++) {
          const sl = Math.max(-0.88, Math.min(0.88, (Math.tanh((lOut[i] / pk) * sat) / normSat) * tNorm));
          const sr = Math.max(-0.88, Math.min(0.88, (Math.tanh((rOut[i] / pk) * sat) / normSat) * tNorm));
          dv.setInt16(o, sl < 0 ? sl * 0x8000 : sl * 0x7FFF, true);
          dv.setInt16(o + 2, sr < 0 ? sr * 0x8000 : sr * 0x7FFF, true);
          o += 4;
        }
        let b64 = '';
        for (let i = 0; i < wav.length; i += 8192) b64 += String.fromCharCode.apply(null, wav.subarray(i, i + 8192));
        return btoa(b64);
      })()`
    });

    const buf = Buffer.from(wavB64.result.value, 'base64');
    for (const rel of rec.files) { fs.writeFileSync(path.join(AUDIO_DIR, rel), buf); written++; }
  }

  console.log(`✓ Authored From-Scratch ${written} Pro Physics 44.1kHz Stereo WAVs (including 16 Music Stems)!`);
  ws.close(); br.kill(); server.close();
  try { fs.rmSync(udir, { recursive: true, force: true }); } catch (_) {}
  process.exit(0);
});
