'use strict';

/**
 * v7.0 Studio Sports Audio Mastering & Physical-Acoustics Engine (44.1kHz Stereo)
 *
 * Fixes every acoustic flaw from v6.0:
 *  - Eliminates non-sport stems (no punch_body_heavy, no bball_poke_hit in soccer kicks, no metal_grill_hit pans, no sand)
 *  - Eliminates extreme +7.8dB/3.5kHz & +5.5dB air EQ harshness
 *  - Replaces muffled low-passed MP3s with physical modal & membrane synthesis + clean true-onset stems:
 *     * Football Kick/Pass: Pressurized air-bladder chirp (142->49Hz) + studded leather snap + sub-balanced turf body
 *     * Basketball Dribble/Bounce: Lacquered maple floor knock + signature hollow rubber/leather shell formants (148Hz + 325Hz)
 *     * Nylon Swish: Pure high-passed dual-burst multifiber nylon flutter (1.6-4.6kHz, zero low-end mud)
 *     * Slam Dunk & Rim Clang: Breakaway steel hoop ring modes (422/835/1290/1960Hz) + spring clack + arena slam + net snap
 *     * Goalpost: Hollow anodized aluminum tube modes (298/612/1045Hz) + leather bounce
 *     * Sneaker Squeak: Natural rubber stick-slip upward-downward chirp (2.35->3.45->2.75kHz)
 *     * Keeper Save: Dense padded latex glove double-thump + muted leather deflection
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const os = require('os');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const RAW_SFX = path.join(ROOT, 'scratch', 'raw_sports_sfx');
const RAW_AUD = path.join(ROOT, 'scratch', 'raw_audio');
const OUT_DIR = path.join(ROOT, 'assets', 'audio');
const VAR_DIR = path.join(OUT_DIR, 'variants');
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(VAR_DIR, { recursive: true });

const CHROME_X86 = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const CHROME_STD = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const EXE = fs.existsSync(CHROME_X86) ? CHROME_X86 : (fs.existsSync(CHROME_STD) ? CHROME_STD : EDGE_PATH);

const PORT = 8798;
const CDP_PORT = 9254;

const SOURCE_MAP = {
  soccer_kick_power: path.join(RAW_SFX, 'soccer_kick_power.mp3'),
  soccer_quick_kick: path.join(RAW_SFX, 'soccer_quick_kick.mp3'),
  soccer_ball_hit: path.join(RAW_SFX, 'soccer_ball_hit.mp3'),
  bball_bounce: path.join(RAW_SFX, 'bball_bounce.mp3'),
  bball_hand_catch: path.join(RAW_SFX, 'bball_hand_catch.mp3'),
  grass_slide_1: path.join(RAW_SFX, 'grass_slide_1.mp3'),
  grass_slide_4: path.join(RAW_SFX, 'grass_slide_4.mp3'),
  grass_step: path.join(RAW_SFX, 'grass_step.mp3'),
  referee_police_whistle: path.join(RAW_SFX, 'referee_police_whistle.mp3'),
  stadium_crowd_roar: path.join(RAW_SFX, 'stadium_crowd_roar.mp3'),
  stadium_applause: path.join(RAW_SFX, 'stadium_applause.mp3'),
  crowd_stadium_yell: path.join(RAW_SFX, 'crowd_stadium_yell.mp3'),
  crowd_victory: path.join(RAW_AUD, 'crowd_victory.mp3'),
};

const RECIPES = [
  // 1. FOOTBALL POWER STRIKE (Deep Inflated Bladder Thump + Crisp Boot Leather Crack — Zero Basketball Slap)
  ...([0, 1, 2, 3, 4, 5].map(idx => {
    const pitch = [1.0, 1.03, 0.96, 1.05, 0.98, 1.01][idx];
    const files = idx === 0 ? ['kick_power_strike.wav', 'variants/kick_v1.wav'] : [`variants/kick_v${idx}.wav`];
    return {
      files,
      dur: 0.42, norm: 0.90, sat: 1.04, room: 0.04, boxDip: -2.2, presence: 1.8, airShelf: 0.6, subHp: 42, lp: 9500,
      synth: { type: 'footy_kick', pitch, seed: 100 + idx * 17 },
      layers: [
        { key: 'soccer_kick_power', offsetSec: 0.172, gain: 0.65, rate: pitch, hp: 46, lp: 950, maxDur: 0.34 },
      ],
    };
  })),

  // 2. FOOTBALL CRISP PASS (Tight Side-Foot Instep Knock — Clean & Snappy)
  ...([0, 1, 2, 3].map(idx => {
    const pitch = [1.0, 1.04, 0.95, 1.07][idx];
    const files = idx === 0 ? ['pass_footy.wav', 'variants/pass_footy_v1.wav'] : [`variants/pass_footy_v${idx}.wav`];
    return {
      files,
      dur: 0.22, norm: 0.84, sat: 1.02, room: 0.025, boxDip: -2.0, presence: 1.6, airShelf: 0.4, subHp: 68, lp: 8500,
      synth: { type: 'footy_pass', pitch, seed: 200 + idx * 13 },
      layers: [
        { key: 'soccer_quick_kick', offsetSec: 0.145, gain: 0.48, rate: pitch * 1.05, hp: 78, lp: 1800, maxDur: 0.16 },
      ],
    };
  })),

  // 3. FOOTBALL GRASS BOUNCE (Dull Soft Turf Ball Thump — Clear Contrast vs Hardwood Basketball)
  ...([0, 1, 2].map(idx => {
    const pitch = [1.0, 1.05, 0.94][idx];
    const files = idx === 0 ? ['bounce_footy.wav'] : [`variants/bounce_footy_v${idx}.wav`];
    return {
      files,
      dur: 0.20, norm: 0.80, sat: 1.01, room: 0.01, boxDip: -1.5, presence: 0.8, subHp: 62, lp: 5500,
      synth: { type: 'footy_bounce', pitch, seed: 260 + idx * 11 },
      layers: [],
    };
  })),

  // 4. BASKETBALL DRIBBLE & BOUNCE (Authentic Maple Hardwood Panel Knock + Hollow Ball Shell Ping)
  ...([0, 1, 2].map(idx => {
    const pitch = [1.0, 1.04, 0.96][idx];
    const files = idx === 0 ? ['dribble.wav', 'ball_bounce.wav'] : (idx === 1 ? ['variants/dribble_v1.wav'] : ['variants/dribble_v2.wav']);
    return {
      files,
      dur: 0.22, norm: 0.86, sat: 1.02, room: 0.05, boxDip: -1.8, presence: 1.6, airShelf: 0.5, subHp: 58, lp: 8800,
      synth: { type: 'bball_dribble', pitch, seed: 300 + idx * 19 },
      layers: [
        { key: 'bball_bounce', offsetSec: 0.158, gain: 0.42, rate: pitch * 1.02, hp: 70, lp: 2600, maxDur: 0.17 },
      ],
    };
  })),

  // 5. BASKETBALL SHOT RELEASE / CHEST PASS (Light Fingertip Roll-Off + Soft Air Whip)
  ...([0, 1, 2, 3].map(idx => {
    const pitch = [1.0, 1.04, 0.96, 1.08][idx];
    const files = idx === 0 ? ['shot_hoops.wav', 'variants/shot_hoops_v1.wav'] : [`variants/shot_hoops_v${idx}.wav`];
    return {
      files,
      dur: 0.24, norm: 0.82, sat: 1.01, room: 0.035, boxDip: -1.5, presence: 1.4, airShelf: 0.6, subHp: 75, lp: 8200,
      synth: { type: 'bball_release', pitch, seed: 360 + idx * 17 },
      layers: [
        { key: 'bball_hand_catch', offsetSec: 0.106, gain: 0.34, rate: pitch, hp: 160, lp: 2200, maxDur: 0.12 },
      ],
    };
  })),

  // 6. BASKETBALL SWISH (Crystal-Clear Double-Stage Nylon Cord Whip — Zero Mud!)
  ...([0, 1, 2, 3, 4, 5].map(idx => {
    const pitch = [1.0, 1.03, 0.97, 1.06, 0.94, 1.01][idx];
    const softRim = (idx === 2 || idx === 4);
    const files = idx === 0 ? ['shot_swish.wav', 'variants/swish_v1.wav'] : [`variants/swish_v${idx}.wav`];
    return {
      files,
      dur: 0.44, norm: 0.86, sat: 1.01, room: 0.06, boxDip: -3.0, presence: 1.8, airShelf: 1.2, subHp: 320, lp: 9800,
      synth: { type: 'bball_swish', pitch, softRim, seed: 420 + idx * 23 },
      layers: [],
    };
  })),

  // 7. SLAM DUNK (Explosive Rim Spring Slam + Breakaway Steel Ring + Net Snap + Arena Sub Thud)
  ...([0, 1, 2, 3, 4, 5].map(idx => {
    const pitch = [1.0, 1.02, 0.97, 1.04, 0.95, 1.01][idx];
    const files = idx === 0 ? ['dunk_slam.wav', 'variants/dunk_v1.wav'] : [`variants/dunk_v${idx}.wav`];
    return {
      files,
      dur: 0.68, norm: 0.90, sat: 1.04, room: 0.08, boxDip: -2.0, presence: 1.6, airShelf: 0.8, subHp: 38, lp: 9600,
      synth: { type: 'dunk_slam', pitch, seed: 500 + idx * 29 },
      layers: [],
    };
  })),

  // 8. RIM CLANG, BACKBOARD GLASS & ALUMINUM GOALPOST
  {
    files: ['rim_clang.wav'],
    dur: 0.38, norm: 0.86, sat: 1.03, room: 0.06, boxDip: -2.0, presence: 1.5, subHp: 90, lp: 9400,
    synth: { type: 'rim_clang', pitch: 1.0, seed: 601 },
    layers: [],
  },
  {
    files: ['backboard_hit.wav'],
    dur: 0.28, norm: 0.84, sat: 1.02, room: 0.05, boxDip: -1.6, presence: 1.0, subHp: 58, lp: 7200,
    synth: { type: 'backboard_glass', pitch: 1.0, seed: 602 },
    layers: [],
  },
  {
    files: ['goalpost_hit.wav'],
    dur: 0.54, norm: 0.88, sat: 1.02, room: 0.08, boxDip: -2.0, presence: 1.4, subHp: 75, lp: 9200,
    synth: { type: 'goalpost_clang', pitch: 1.0, seed: 603 },
    layers: [],
  },

  // 9. SLIDE TACKLE (Lush Turf Blade Slice + Cleat Weight Thud — Zero Sand/Mud)
  ...([0, 1, 2, 3, 4, 5].map(idx => {
    const pitch = [1.0, 1.03, 0.97, 1.05, 0.96, 1.01][idx];
    const files = idx === 0 ? ['slide_tackle.wav', 'variants/slide_v1.wav'] : [`variants/slide_v${idx}.wav`];
    return {
      files,
      dur: 0.52, norm: 0.85, sat: 1.02, room: 0.03, boxDip: -2.6, presence: 1.5, airShelf: 0.4, subHp: 70, lp: 8600,
      synth: { type: 'turf_slide', pitch, seed: 700 + idx * 19 },
      layers: [
        { key: idx % 2 === 0 ? 'grass_slide_1' : 'grass_slide_4', offsetSec: idx % 2 === 0 ? 0.114 : 0.065, gain: 0.56, rate: pitch, hp: 180, lp: 5800, maxDur: 0.44, fadeOut: 0.09 },
      ],
    };
  })),

  // 10. GOALKEEPER LATEX SAVE (Dense Glove Cushion Impact + Ball Deflection)
  ...([0, 1, 2, 3].map(idx => {
    const pitch = [1.0, 1.03, 0.96, 1.05][idx];
    const files = idx === 0 ? ['keeper_save.wav', 'variants/save_v1.wav'] : [`variants/save_v${idx}.wav`];
    return {
      files,
      dur: 0.32, norm: 0.88, sat: 1.03, room: 0.04, boxDip: -2.0, presence: 1.4, airShelf: 0.5, subHp: 56, lp: 8200,
      synth: { type: 'keeper_save', pitch, seed: 800 + idx * 17 },
      layers: [
        { key: 'soccer_ball_hit', offsetSec: 0.228, gain: 0.52, rate: pitch, hp: 65, lp: 1500, maxDur: 0.24 },
      ],
    };
  })),

  // 11. STEAL SWIPE & AIR WHOOSH
  ...([0, 1, 2, 3, 4, 5].map(idx => {
    const pitch = [1.0, 1.04, 0.96, 1.07, 0.95, 1.02][idx];
    const files = idx === 0 ? ['steal_swipe.wav', 'variants/steal_v1.wav'] : [`variants/steal_v${idx}.wav`];
    return {
      files,
      dur: 0.22, norm: 0.84, sat: 1.02, room: 0.025, boxDip: -1.8, presence: 1.5, subHp: 85, lp: 8400,
      synth: { type: 'steal_strip', pitch, seed: 900 + idx * 13 },
      layers: [
        { key: 'bball_hand_catch', offsetSec: 0.106, gain: 0.55, rate: pitch * 1.06, hp: 140, lp: 3200, maxDur: 0.16 },
      ],
    };
  })),
  {
    files: ['steal_swoosh.wav', 'variants/steal_swoosh_v1.wav'],
    dur: 0.22, norm: 0.78, sat: 1.0, room: 0.02, boxDip: -1.5, presence: 1.2, subHp: 140, lp: 6800,
    synth: { type: 'air_swoosh', pitch: 1.0, seed: 950 },
    layers: [],
  },

  // 12. FOOTSTEPS & NBA SNEAKER SQUEAKS
  ...([0, 1, 2].map(idx => {
    const pitch = [1.0, 0.94, 1.07][idx];
    const files = idx === 0 ? ['sprint_step.wav'] : [`variants/step_v${idx}.wav`];
    return {
      files,
      dur: 0.13, norm: 0.72, sat: 1.0, room: 0.01, boxDip: -1.5, presence: 1.2, subHp: 90, lp: 6800,
      synth: { type: 'grass_step', pitch, seed: 1000 + idx * 11 },
      layers: [
        { key: 'grass_step', offsetSec: 0.195, gain: 0.45, rate: pitch, hp: 180, lp: 4800, maxDur: 0.10, fadeOut: 0.02 },
      ],
    };
  })),
  ...([0, 1, 2].map(idx => {
    const pitch = [1.0, 1.05, 0.95][idx];
    const files = idx === 0 ? ['sprint_step_court.wav', 'variants/step_court_v1.wav'] : ['variants/step_court_v2.wav'];
    return {
      files,
      dur: 0.12, norm: 0.72, sat: 1.0, room: 0.02, boxDip: -1.8, presence: 1.0, subHp: 95, lp: 6200,
      synth: { type: 'court_step', pitch, withSqueak: idx === 2, seed: 1040 + idx * 11 },
      layers: [],
    };
  })),
  ...([0, 1].map(idx => {
    const pitch = idx === 0 ? 1.0 : 1.08;
    const files = idx === 0 ? ['sneaker_squeak.wav'] : ['variants/squeak_v1.wav'];
    return {
      files,
      dur: 0.16, norm: 0.84, sat: 1.0, room: 0.04, boxDip: -2.0, presence: 1.4, subHp: 320, lp: 7400,
      synth: { type: 'sneaker_squeak', pitch, doubleChirp: idx === 1, seed: 1080 + idx * 17 },
      layers: [],
    };
  })),

  // 13. WHISTLES & ARENA BUZZER
  ...([0, 1, 2, 3].map(idx => {
    const pitch = [1.0, 1.02, 0.97, 1.04][idx];
    const doubleBlast = (idx === 2 || idx === 3);
    const files = idx === 0 ? ['whistle.wav', 'referee_whistle.wav'] : [`variants/whistle_v${idx}.wav`];
    return {
      files,
      dur: doubleBlast ? 0.62 : 0.42, norm: 0.78, sat: 1.01, room: 0.07, boxDip: -1.5, presence: 0.5, airShelf: -1.5, subHp: 400, lp: 7600,
      synth: { type: 'pea_whistle', pitch, doubleBlast, seed: 1120 + idx * 13 },
      layers: [
        { key: 'referee_police_whistle', offsetSec: 0.114, gain: 0.25, rate: pitch, hp: 1600, lp: 6200, maxDur: 0.36, fadeOut: 0.06 },
      ],
    };
  })),
  {
    files: ['hoops_buzzer.wav'],
    dur: 0.88, norm: 0.84, sat: 1.03, room: 0.10, boxDip: -1.5, presence: 1.2, subHp: 80, lp: 6800,
    synth: { type: 'arena_buzzer', pitch: 1.0, seed: 1180 },
    layers: [],
  },

  // 14. STADIUM CELEBRATIONS & WARM NON-BOXY AMBIENCE LOOPS
  ...([0, 1, 2, 3, 4, 5].map(idx => {
    const files = idx === 0 ? ['celebration.wav', 'variants/celebrate_v1.wav'] : [`variants/celebrate_v${idx}.wav`];
    return {
      files,
      dur: 2.40, norm: 0.84, sat: 1.01, room: 0.10, boxDip: -3.6, presence: 1.8, airShelf: 0.6, subHp: 90, lp: 7800,
      layers: [
        { key: idx % 2 === 0 ? 'stadium_crowd_roar' : 'crowd_victory', offsetSec: 3.5 + idx * 0.4, gain: 0.90, rate: 1.0, hp: 100, lp: 6800, maxDur: 2.35, fadeIn: 0.04, fadeOut: 0.35 },
        { key: 'stadium_applause', offsetSec: 3.4 + idx * 0.3, gain: 0.72, rate: 1.0, hp: 160, lp: 7400, maxDur: 2.35, fadeIn: 0.06, fadeOut: 0.38 },
      ],
    };
  })),
  {
    files: ['crowd_cheer.wav'],
    dur: 1.45, norm: 0.80, sat: 1.01, room: 0.08, boxDip: -3.2, presence: 1.6, subHp: 95, lp: 7600,
    layers: [
      { key: 'crowd_stadium_yell', offsetSec: 0.85, gain: 0.85, rate: 1.0, hp: 110, maxDur: 1.40, fadeIn: 0.05, fadeOut: 0.32 },
      { key: 'stadium_applause', offsetSec: 4.10, gain: 0.75, rate: 1.0, hp: 160, maxDur: 1.38, fadeIn: 0.06, fadeOut: 0.32 },
    ],
  },
  {
    files: ['ambience_footy.wav'],
    dur: 4.00, norm: 0.46, sat: 1.0, room: 0.0, boxDip: -3.8, presence: 0.8, airShelf: -0.8, subHp: 110, lp: 3800, seamlessLoop: true,
    layers: [
      { key: 'stadium_crowd_roar', offsetSec: 4.6, gain: 0.72, rate: 0.98, hp: 120, lp: 3400, maxDur: 4.5 },
      { key: 'stadium_applause', offsetSec: 4.2, gain: 0.34, rate: 0.96, hp: 180, lp: 3600, maxDur: 4.5 },
    ],
  },
  {
    files: ['ambience_hoops.wav'],
    dur: 4.00, norm: 0.44, sat: 1.0, room: 0.0, boxDip: -3.6, presence: 0.8, airShelf: -0.8, subHp: 115, lp: 3600, seamlessLoop: true,
    layers: [
      { key: 'stadium_applause', offsetSec: 4.2, gain: 0.65, rate: 0.94, hp: 130, lp: 3200, maxDur: 4.5 },
      { key: 'stadium_crowd_roar', offsetSec: 5.5, gain: 0.42, rate: 1.00, hp: 120, lp: 2900, maxDur: 4.5 },
    ],
  },
];

// Read & encode raw stems for browser transfer
const rawB64 = {};
for (const [k, p] of Object.entries(SOURCE_MAP)) {
  if (!fs.existsSync(p)) throw new Error('Missing audio stem: ' + p);
  rawB64[k] = fs.readFileSync(p).toString('base64');
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<!doctype html><html><body>Studio Audio DSP Host v7.0</body></html>');
});

server.listen(PORT, '127.0.0.1', async () => {
  const udir = fs.mkdtempSync(path.join(os.tmpdir(), 'fvh-aud-v7-'));
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

  // Upload raw stems & register Physical Acoustics Synthesis Library inside Chromium
  await send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(async () => {
      const b64Map = ${JSON.stringify(rawB64)};
      window.__actx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44100 });
      window.__raw = {};
      for (const [k, b64] of Object.entries(b64Map)) {
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        window.__raw[k] = await window.__actx.decodeAudioData(bytes.buffer.slice(0));
      }

      window.__buildNoiseBuf = (ctx, dur, seed) => {
        const len = Math.max(64, Math.floor(ctx.sampleRate * dur));
        const b = ctx.createBuffer(2, len, ctx.sampleRate);
        let s = (seed || 1337) >>> 0;
        const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return (s / 2147483648) - 1; };
        for (let ch = 0; ch < 2; ch++) {
          const d = b.getChannelData(ch);
          for (let i = 0; i < len; i++) d[i] = rnd();
        }
        return b;
      };

      window.__osc = (ctx, dest, type, f0, f1, start, dur, amp, sweepTime) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(f0, start);
        if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), start + (sweepTime || dur));
        g.gain.setValueAtTime(0.0001, start);
        g.gain.linearRampToValueAtTime(amp, start + 0.0012);
        g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        o.connect(g); g.connect(dest);
        o.start(start); o.stop(start + dur + 0.02);
      };

      window.__noiseBurst = (ctx, dest, seed, start, dur, amp, ftype, f0, f1, q, atk) => {
        const src = ctx.createBufferSource();
        src.buffer = window.__buildNoiseBuf(ctx, dur + 0.05, seed);
        const flt = ctx.createBiquadFilter();
        flt.type = ftype || 'bandpass';
        flt.frequency.setValueAtTime(f0, start);
        if (f1 && f1 !== f0) flt.frequency.exponentialRampToValueAtTime(Math.max(40, f1), start + dur);
        if (q) flt.Q.value = q;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, start);
        g.gain.linearRampToValueAtTime(amp, start + (atk || 0.002));
        g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        src.connect(flt); flt.connect(g); g.connect(dest);
        src.start(start); src.stop(start + dur + 0.02);
      };

      window.__renderSynth = (ctx, dest, spec) => {
        const p = spec.pitch || 1.0;
        const sd = spec.seed || 77;
        switch (spec.type) {
          case 'footy_kick': {
            // Crisp FIFA leather ball crack (wide mid-high snap + tight fast bladder thump)
            window.__osc(ctx, dest, 'sine', 148 * p, 48 * p, 0, 0.090, 0.82, 0.038);
            window.__osc(ctx, dest, 'triangle', 275 * p, 95 * p, 0, 0.042, 0.48, 0.024);
            window.__noiseBurst(ctx, dest, sd, 0, 0.032, 1.35, 'bandpass', 1850 * p, 820 * p, 0.72, 0.001);
            window.__noiseBurst(ctx, dest, sd + 3, 0, 0.018, 0.92, 'bandpass', 3600 * p, 2200 * p, 0.85, 0.001);
            window.__noiseBurst(ctx, dest, sd + 9, 0.005, 0.085, 0.28, 'bandpass', 2100, 950, 0.8, 0.004);
            break;
          }
          case 'footy_pass': {
            // Snappy side-foot leather tap
            window.__osc(ctx, dest, 'sine', 180 * p, 82 * p, 0, 0.050, 0.68, 0.022);
            window.__osc(ctx, dest, 'triangle', 320 * p, 148 * p, 0, 0.026, 0.36, 0.015);
            window.__noiseBurst(ctx, dest, sd, 0, 0.024, 1.25, 'bandpass', 1750 * p, 980 * p, 0.72, 0.001);
            window.__noiseBurst(ctx, dest, sd + 4, 0, 0.014, 0.68, 'bandpass', 3300 * p, 2100 * p, 0.90, 0.001);
            break;
          }
          case 'footy_bounce': {
            window.__osc(ctx, dest, 'sine', 112 * p, 54 * p, 0, 0.056, 0.66, 0.028);
            window.__noiseBurst(ctx, dest, sd, 0, 0.028, 1.15, 'bandpass', 1550 * p, 680 * p, 0.72, 0.001);
            window.__noiseBurst(ctx, dest, sd + 2, 0, 0.014, 0.72, 'bandpass', 2900 * p, 1600 * p, 0.85, 0.001);
            break;
          }
          case 'bball_dribble': {
            // NBA indoor lacquered maple bounce + hollow pressurized ball shell ring (152 + 332Hz) + crisp floor tap
            window.__osc(ctx, dest, 'sine', 154 * p, 126 * p, 0, 0.078, 0.72, 0.048);
            window.__osc(ctx, dest, 'sine', 340 * p, 288 * p, 0, 0.048, 0.40, 0.032);
            window.__osc(ctx, dest, 'triangle', 88 * p, 52 * p, 0, 0.042, 0.44, 0.020);
            window.__noiseBurst(ctx, dest, sd, 0, 0.022, 1.18, 'bandpass', 2100 * p, 1050 * p, 0.75, 0.001);
            window.__noiseBurst(ctx, dest, sd + 5, 0, 0.012, 0.65, 'bandpass', 3800 * p, 2400 * p, 0.9, 0.001);
            break;
          }
          case 'bball_release': {
            // Soft fingertip roll & wrist spin puff
            window.__osc(ctx, dest, 'sine', 190 * p, 132 * p, 0, 0.038, 0.40, 0.022);
            window.__noiseBurst(ctx, dest, sd, 0.002, 0.075, 0.92, 'bandpass', 1750 * p, 3400 * p, 0.85, 0.004);
            break;
          }
          case 'bball_swish': {
            // Authentic crisp 2-stage cascading nylon cord whip
            if (spec.softRim) {
              window.__osc(ctx, dest, 'sine', 450 * p, 438 * p, 0, 0.065, 0.16, 0.04);
            }
            window.__noiseBurst(ctx, dest, sd, 0.002, 0.115, 0.76, 'bandpass', 1850 * p, 4600 * p, 1.1, 0.008);
            window.__noiseBurst(ctx, dest, sd + 5, 0.055, 0.185, 0.68, 'bandpass', 3600 * p, 1650 * p, 1.2, 0.010);
            window.__noiseBurst(ctx, dest, sd + 11, 0.12, 0.16, 0.25, 'highpass', 2400 * p, 1800 * p, 0.7, 0.015);
            break;
          }
          case 'dunk_slam': {
            // Rim spring clack + heavy stanchion shock + steel hoop ring + crisp net whip
            window.__osc(ctx, dest, 'sine', 120 * p, 42 * p, 0, 0.145, 0.82, 0.060);
            window.__osc(ctx, dest, 'triangle', 170 * p, 92 * p, 0, 0.060, 0.56, 0.028);
            window.__osc(ctx, dest, 'sine', 422 * p, 412 * p, 0.002, 0.24, 0.48, 0.16);
            window.__osc(ctx, dest, 'sine', 842 * p, 828 * p, 0.002, 0.17, 0.34, 0.13);
            window.__osc(ctx, dest, 'sine', 1320 * p, 1295 * p, 0.002, 0.11, 0.24, 0.09);
            window.__osc(ctx, dest, 'sine', 2280 * p, 2240 * p, 0.002, 0.065, 0.14, 0.05);
            window.__noiseBurst(ctx, dest, sd, 0, 0.036, 1.35, 'bandpass', 2200, 1100, 0.75, 0.001);
            window.__noiseBurst(ctx, dest, sd + 7, 0.028, 0.17, 0.82, 'bandpass', 2400, 4400, 0.9, 0.006);
            break;
          }
          case 'rim_clang': {
            window.__osc(ctx, dest, 'sine', 422 * p, 412 * p, 0, 0.24, 0.62, 0.18);
            window.__osc(ctx, dest, 'sine', 842 * p, 830 * p, 0, 0.17, 0.44, 0.13);
            window.__osc(ctx, dest, 'sine', 1320 * p, 1300 * p, 0, 0.11, 0.32, 0.09);
            window.__osc(ctx, dest, 'sine', 2180 * p, 2150 * p, 0, 0.065, 0.20, 0.05);
            window.__osc(ctx, dest, 'sine', 155 * p, 110 * p, 0, 0.050, 0.48, 0.022);
            window.__noiseBurst(ctx, dest, sd, 0, 0.028, 1.15, 'bandpass', 2400, 1250, 0.8, 0.001);
            break;
          }
          case 'backboard_glass': {
            // Heavy tempered acrylic/glass slab thud + crisp surface knock
            window.__osc(ctx, dest, 'sine', 102 * p, 56 * p, 0, 0.072, 0.66, 0.042);
            window.__osc(ctx, dest, 'triangle', 380 * p, 260 * p, 0, 0.048, 0.36, 0.028);
            window.__noiseBurst(ctx, dest, sd, 0, 0.028, 1.25, 'bandpass', 1500, 680, 0.72, 0.001);
            window.__noiseBurst(ctx, dest, sd + 3, 0, 0.016, 0.88, 'bandpass', 3000, 1750, 0.85, 0.001);
            break;
          }
          case 'goalpost_clang': {
            // Iconic hollow aluminum FIFA post ping + crisp ball rebound crack
            window.__osc(ctx, dest, 'sine', 298 * p, 294 * p, 0, 0.42, 0.56, 0.30);
            window.__osc(ctx, dest, 'sine', 612 * p, 606 * p, 0, 0.30, 0.40, 0.24);
            window.__osc(ctx, dest, 'sine', 1045 * p, 1038 * p, 0, 0.18, 0.28, 0.14);
            window.__osc(ctx, dest, 'sine', 1860 * p, 1840 * p, 0, 0.09, 0.16, 0.07);
            window.__osc(ctx, dest, 'sine', 112 * p, 54 * p, 0, 0.06, 0.46, 0.025);
            window.__noiseBurst(ctx, dest, sd, 0, 0.026, 1.18, 'bandpass', 2200, 1100, 0.8, 0.001);
            break;
          }
          case 'turf_slide': {
            // Crisp sweeping grass blade shear + ground hip/cleat bump
            window.__noiseBurst(ctx, dest, sd, 0, 0.32, 0.56, 'bandpass', 2400 * p, 1150 * p, 0.9, 0.012);
            window.__osc(ctx, dest, 'sine', 102 * p, 48 * p, 0.010, 0.09, 0.42, 0.04);
            break;
          }
          case 'keeper_save': {
            // Thick padded latex palm catch-parry
            window.__osc(ctx, dest, 'sine', 195 * p, 84 * p, 0, 0.065, 0.66, 0.030);
            window.__osc(ctx, dest, 'triangle', 120 * p, 68 * p, 0.012, 0.058, 0.38, 0.026);
            window.__noiseBurst(ctx, dest, sd, 0, 0.030, 1.42, 'bandpass', 2000 * p, 880 * p, 0.72, 0.001);
            window.__noiseBurst(ctx, dest, sd + 4, 0, 0.016, 0.88, 'bandpass', 3400 * p, 2000 * p, 0.85, 0.001);
            break;
          }
          case 'steal_strip': {
            window.__noiseBurst(ctx, dest, sd, 0, 0.028, 0.55, 'bandpass', 1950 * p, 920 * p, 1.4, 0.001);
            window.__osc(ctx, dest, 'sine', 210 * p, 115 * p, 0, 0.048, 0.48, 0.02);
            break;
          }
          case 'air_swoosh': {
            window.__noiseBurst(ctx, dest, sd, 0, 0.18, 0.65, 'bandpass', 620 * p, 1950 * p, 1.3, 0.025);
            break;
          }
          case 'grass_step': {
            window.__noiseBurst(ctx, dest, sd, 0, 0.062, 0.58, 'bandpass', 1650 * p, 920 * p, 1.2, 0.004);
            window.__osc(ctx, dest, 'sine', 105 * p, 62 * p, 0, 0.04, 0.34, 0.02);
            break;
          }
          case 'court_step': {
            window.__osc(ctx, dest, 'sine', 135 * p, 72 * p, 0, 0.048, 0.66, 0.022);
            window.__noiseBurst(ctx, dest, sd, 0, 0.024, 0.36, 'bandpass', 1100 * p, 620 * p, 1.4, 0.002);
            if (spec.withSqueak) {
              window.__osc(ctx, dest, 'sine', 2480 * p, 3380 * p, 0.012, 0.048, 0.18, 0.024);
            }
            break;
          }
          case 'sneaker_squeak': {
            const doChirp = (st, d, fA, fB, amp) => {
              const o = ctx.createOscillator();
              const flt = ctx.createBiquadFilter();
              const g = ctx.createGain();
              o.type = 'triangle';
              o.frequency.setValueAtTime(fA * p, st);
              o.frequency.exponentialRampToValueAtTime(fB * p, st + d * 0.42);
              o.frequency.exponentialRampToValueAtTime((fB * 0.84) * p, st + d);
              flt.type = 'bandpass'; flt.frequency.value = fB * p; flt.Q.value = 3.2;
              g.gain.setValueAtTime(0.0001, st);
              g.gain.linearRampToValueAtTime(amp, st + 0.008);
              g.gain.exponentialRampToValueAtTime(0.0001, st + d);
              o.connect(flt); flt.connect(g); g.connect(dest);
              o.start(st); o.stop(st + d + 0.02);
            };
            doChirp(0, 0.075, 2320, 3420, 0.72);
            if (spec.doubleChirp) doChirp(0.072, 0.068, 2580, 3150, 0.52);
            break;
          }
          case 'pea_whistle': {
            const blow = (st, d) => {
              const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), lfo = ctx.createOscillator();
              const lfoG = ctx.createGain(), g = ctx.createGain();
              o1.type = 'sine'; o2.type = 'sine';
              o1.frequency.setValueAtTime(2820 * p, st);
              o2.frequency.setValueAtTime(3015 * p, st);
              lfo.frequency.value = 38;
              lfoG.gain.value = 115;
              lfo.connect(lfoG); lfoG.connect(o1.frequency); lfoG.connect(o2.frequency);
              g.gain.setValueAtTime(0.0001, st);
              g.gain.linearRampToValueAtTime(0.45, st + 0.015);
              g.gain.setValueAtTime(0.45, st + d - 0.035);
              g.gain.exponentialRampToValueAtTime(0.0001, st + d);
              o1.connect(g); o2.connect(g); g.connect(dest);
              lfo.start(st); o1.start(st); o2.start(st);
              lfo.stop(st + d + 0.02); o1.stop(st + d + 0.02); o2.stop(st + d + 0.02);
              window.__noiseBurst(ctx, dest, sd, st, d, 0.16, 'bandpass', 3200, 3000, 1.6, 0.012);
            };
            if (spec.doubleBlast) { blow(0, 0.18); blow(0.24, 0.32); }
            else blow(0, 0.34);
            break;
          }
          case 'arena_buzzer': {
            [196, 294, 392, 588].forEach((hz, i) => {
              const o = ctx.createOscillator(), flt = ctx.createBiquadFilter(), g = ctx.createGain();
              o.type = i < 2 ? 'sawtooth' : 'triangle';
              o.frequency.value = hz * p;
              flt.type = 'lowpass'; flt.frequency.value = 1450;
              g.gain.setValueAtTime(0.0001, 0);
              g.gain.linearRampToValueAtTime(i === 0 ? 0.38 : 0.20, 0.025);
              g.gain.setValueAtTime(i === 0 ? 0.35 : 0.18, 0.68);
              g.gain.exponentialRampToValueAtTime(0.0001, 0.85);
              o.connect(flt); flt.connect(g); g.connect(dest);
              o.start(0); o.stop(0.87);
            });
            break;
          }
        }
      };
    })()`
  });

  let written = 0;
  for (const rec of RECIPES) {
    const wavB64 = await send('Runtime.evaluate', {
      returnByValue: true,
      awaitPromise: true,
      expression: `(async () => {
        const rec = ${JSON.stringify(rec)};
        const SR = 44100;
        const totalFrames = Math.floor(rec.dur * SR);
        const off = new OfflineAudioContext(2, totalFrames, SR);

        const masterHp = off.createBiquadFilter();
        masterHp.type = 'highpass'; masterHp.frequency.value = rec.subHp || 45;
        const boxDip = off.createBiquadFilter();
        boxDip.type = 'peaking'; boxDip.frequency.value = 285; boxDip.Q.value = 0.85; boxDip.gain.value = rec.boxDip || -1.8;
        const pres = off.createBiquadFilter();
        pres.type = 'peaking'; pres.frequency.value = 2800; pres.Q.value = 0.75; pres.gain.value = rec.presence || 1.4;
        const air = off.createBiquadFilter();
        air.type = 'highshelf'; air.frequency.value = 5400; air.gain.value = rec.airShelf || 0.4;
        const topLp = off.createBiquadFilter();
        topLp.type = 'lowpass'; topLp.frequency.value = rec.lp || 9500; topLp.Q.value = 0.6;

        masterHp.connect(boxDip); boxDip.connect(pres); pres.connect(air); air.connect(topLp); topLp.connect(off.destination);

        if (rec.synth) {
          window.__renderSynth(off, masterHp, rec.synth);
        }

        for (const lyr of (rec.layers || [])) {
          const srcBuf = window.__raw[lyr.key];
          if (!srcBuf) throw new Error('Missing stem ' + lyr.key);
          const src = off.createBufferSource();
          src.buffer = srcBuf;
          src.playbackRate.value = lyr.rate || 1.0;

          let node = src;
          if (lyr.hp) {
            const hpf = off.createBiquadFilter(); hpf.type = 'highpass'; hpf.frequency.value = lyr.hp;
            node.connect(hpf); node = hpf;
          }
          if (lyr.lp) {
            const lpf = off.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = lyr.lp;
            node.connect(lpf); node = lpf;
          }
          const g = off.createGain();
          const startWhen = lyr.delay || 0;
          const baseOffset = lyr.offsetSec || 0;
          const playDur = Math.min(lyr.maxDur || rec.dur, srcBuf.duration - baseOffset);

          if (lyr.fadeIn) {
            g.gain.setValueAtTime(0.001, startWhen);
            g.gain.linearRampToValueAtTime(lyr.gain, startWhen + lyr.fadeIn);
          } else {
            g.gain.setValueAtTime(lyr.gain, startWhen);
          }
          if (lyr.fadeOut) {
            const fe = Math.max(startWhen + 0.02, startWhen + playDur - lyr.fadeOut);
            g.gain.setValueAtTime(lyr.gain, fe);
            g.gain.linearRampToValueAtTime(0.0001, startWhen + playDur);
          }
          node.connect(g); g.connect(masterHp);
          src.start(startWhen, baseOffset, Math.max(0.03, playDur));
        }

        const rendered = await off.startRendering();
        const ch0 = rendered.getChannelData(0), ch1 = rendered.getChannelData(1);

        if (rec.seamlessLoop) {
          const cf = Math.floor(SR * 0.45);
          for (let i = 0; i < cf; i++) {
            const w = 0.5 - 0.5 * Math.cos(Math.PI * i / cf);
            const tailIdx = totalFrames - cf + i;
            const sL = ch0[i] * w + ch0[tailIdx] * (1 - w);
            const sR = ch1[i] * w + ch1[tailIdx] * (1 - w);
            ch0[i] = sL; ch1[i] = sR;
            ch0[tailIdx] = sL; ch1[tailIdx] = sR;
          }
        }

        const roomAmt = rec.room || 0;
        const lOut = new Float32Array(totalFrames), rOut = new Float32Array(totalFrames);
        const d1 = Math.floor(SR * 0.013), d2 = Math.floor(SR * 0.021), d3 = Math.floor(SR * 0.034);
        for (let i = 0; i < totalFrames; i++) {
          let l = ch0[i], r = ch1[i];
          if (roomAmt > 0) {
            l += ((i >= d1 ? ch1[i - d1] : 0) * 0.44 + (i >= d3 ? ch0[i - d3] : 0) * 0.26) * roomAmt;
            r += ((i >= d2 ? ch0[i - d2] : 0) * 0.44 + (i >= d3 ? ch1[i - d3] : 0) * 0.26) * roomAmt;
          }
          lOut[i] = l; rOut[i] = r;
        }

        if (!rec.seamlessLoop) {
          const tail = Math.min(Math.floor(SR * 0.020), Math.floor(totalFrames * 0.12));
          for (let i = 0; i < tail; i++) {
            const w = i / tail;
            const idx = totalFrames - 1 - i;
            lOut[idx] *= w; rOut[idx] *= w;
          }
        }

        let pk = 1e-4;
        for (let i = 0; i < totalFrames; i++) {
          const al = Math.abs(lOut[i]), ar = Math.abs(rOut[i]);
          if (al > pk) pk = al;
          if (ar > pk) pk = ar;
        }
        const targetNorm = Math.min(0.86, rec.norm || 0.86);
        const scale = targetNorm / pk;
        const sat = rec.sat || 1.02;

        const wavBytes = new Uint8Array(44 + totalFrames * 4);
        const dv = new DataView(wavBytes.buffer);
        const wsStr = (o, s) => { for (let j = 0; j < s.length; j++) dv.setUint8(o + j, s.charCodeAt(j)); };
        wsStr(0, 'RIFF'); dv.setUint32(4, 36 + totalFrames * 4, true); wsStr(8, 'WAVE');
        wsStr(12, 'fmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true);
        dv.setUint16(22, 2, true); dv.setUint32(24, SR, true); dv.setUint32(28, SR * 4, true);
        dv.setUint16(32, 4, true); dv.setUint16(34, 16, true);
        wsStr(36, 'data'); dv.setUint32(40, totalFrames * 4, true);

        let o = 44;
        for (let i = 0; i < totalFrames; i++) {
          const sl = Math.max(-0.88, Math.min(0.88, Math.tanh(lOut[i] * scale * sat) / Math.tanh(sat) * targetNorm));
          const sr = Math.max(-0.88, Math.min(0.88, Math.tanh(rOut[i] * scale * sat) / Math.tanh(sat) * targetNorm));
          dv.setInt16(o, sl < 0 ? sl * 0x8000 : sl * 0x7FFF, true);
          dv.setInt16(o + 2, sr < 0 ? sr * 0x8000 : sr * 0x7FFF, true);
          o += 4;
        }
        let b64 = '';
        for (let i = 0; i < wavBytes.length; i += 8192) {
          b64 += String.fromCharCode.apply(null, wavBytes.subarray(i, i + 8192));
        }
        return btoa(b64);
      })()`
    });

    if (!wavB64 || !wavB64.result || typeof wavB64.result.value !== 'string') {
      throw new Error('Recipe failed for ' + rec.files[0]);
    }
    const buf = Buffer.from(wavB64.result.value, 'base64');
    for (const rel of rec.files) {
      fs.writeFileSync(path.join(OUT_DIR, rel), buf);
      written++;
    }
  }

  console.log(`✓ Mastered ${written} authentic v7.0 sports SFX WAVs into assets/audio/!`);
  ws.close(); br.kill(); server.close();
  setTimeout(() => { try { fs.rmSync(udir, { recursive: true, force: true }); } catch (_) {} process.exit(0); }, 250);
});
