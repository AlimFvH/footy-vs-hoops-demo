'use strict';

/**
 * v11.0 Authentic Studio Sports Audio Mastering Pipeline (44.1kHz Stereo)
 *
 * Key Root-Cause Fixes over v9.0/v10.0:
 *  - Eliminates misnamed whistle clone (raw_sports_sfx/bball_ball_hit.mp3 == MD5 747308d1!) from shot_hoops & backboard_hit
 *  - Eliminates harsh >5kHz hiss stems (grass_step, grass_heavy, fast_air_sweep, metal_grill_hit 17.7kHz screech)
 *  - Eliminates ALL synthetic swept-sine "laser/tom-drum" oscillators (no fC/phRim/phGlass pitch sweeps!)
 *  - Pairs real foley recordings with natural zero-sweep fixed cavity resonance & 3ms shaped impact transients
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

const PORT = 8795;
const CDP_PORT = 9255;

const SOURCE_MAP = {
  soccer_kick_power: path.join(RAW_SFX, 'soccer_kick_power.mp3'),
  soccer_quick_kick: path.join(RAW_SFX, 'soccer_quick_kick.mp3'),
  body_punch_quick: path.join(RAW_SFX, 'body_punch_quick.mp3'),
  punch_impact_strong: path.join(RAW_SFX, 'punch_impact_strong.mp3'),
  bball_bounce: path.join(RAW_SFX, 'bball_bounce.mp3'),
  bball_bounce_2: path.join(RAW_SFX, 'bball_bounce_2.mp3'),
  bball_bounce_floor: path.join(RAW_SFX, 'bball_bounce_floor.mp3'),
  bball_hit_court: path.join(RAW_SFX, 'bball_hit_court.mp3'),
  bball_hand_catch: path.join(RAW_SFX, 'bball_hand_catch.mp3'),
  bball_catch: path.join(RAW_SFX, 'bball_catch.mp3'),
  bball_poke_hit: path.join(RAW_SFX, 'bball_poke_hit.mp3'),
  bball_dunk_hard: path.join(RAW_SFX, 'bball_dunk_hard.mp3'),
  bball_rim_1: path.join(RAW_SFX, 'bball_rim_1.mp3'),
  bball_net_swish: path.join(RAW_SFX, 'bball_net_swish.mp3'),
  bball_buzzer: path.join(RAW_SFX, 'bball_buzzer.mp3'),
  real_squeak: path.join(AUDIO_DIR, 'sneaker_squeak.mp3'),
  court_squeak: path.join(RAW_SFX, 'court_squeak.mp3'),
  glove_punch: path.join(RAW_AUD, 'glove_punch.mp3'),
  metal_hit: path.join(RAW_AUD, 'metal_hit.mp3'),
  metal_hammer_hit: path.join(RAW_SFX, 'metal_hammer_hit.mp3'),
  grass_slide_1: path.join(RAW_SFX, 'grass_slide_1.mp3'),
  sand_body_fall: path.join(RAW_SFX, 'sand_body_fall.mp3'),
  fast_swoosh: path.join(RAW_SFX, 'fast_swoosh.mp3'),
  referee_police_whistle: path.join(RAW_SFX, 'referee_police_whistle.mp3'),
  referee_whistle_loud: path.join(RAW_SFX, 'referee_whistle_loud.mp3'),
  stadium_crowd_roar: path.join(RAW_SFX, 'stadium_crowd_roar.mp3'),
  stadium_applause: path.join(RAW_SFX, 'stadium_applause.mp3'),
  crowd_stadium_yell: path.join(RAW_SFX, 'crowd_stadium_yell.mp3'),
  crowd_victory: path.join(RAW_AUD, 'crowd_victory.mp3'),
};

const RECIPES = [
  // 1. FOOTBALL POWER STRIKE (Crisp Boot-Leather Thwack + Controlled Bladder Punch — Zero Mud/Boom!)
  ...([0, 1, 2, 3, 4, 5].map(idx => {
    const pitch = [1.0, 1.03, 0.96, 1.05, 0.98, 1.01][idx];
    const files = idx === 0 ? ['kick_power_strike.wav', 'variants/kick_v1.wav'] : [`variants/kick_v${idx}.wav`];
    return {
      files,
      dur: 0.36, norm: 0.86, sat: 1.04, room: 0.09, stereoWide: true, boxDip: -3.2, presence: 4.0, airShelf: 1.6, subHp: 64, lp: 12200,
      model: { type: 'leather_strike_natural', pitch, power: 1.0, seed: 100 + idx * 17 },
      layers: [
        { key: 'soccer_kick_power', offsetSec: 'auto', gain: 0.56, rate: pitch, hp: 78, lp: 8400, maxDur: 0.32, fadeOut: 0.06 },
        { key: 'punch_impact_strong', offsetSec: 'auto', gain: 0.46, rate: pitch * 1.12, hp: 280, lp: 9800, maxDur: 0.16, fadeOut: 0.04 },
        { key: 'body_punch_quick', offsetSec: 'auto', gain: 0.48, rate: pitch * 1.10, hp: 180, lp: 8600, maxDur: 0.18 },
      ],
    };
  })),

  // 2. FOOTBALL CRISP PASS (Tight Side-Foot Instep Push with Crisp Air Definition)
  ...([0, 1, 2, 3].map(idx => {
    const pitch = [1.0, 1.04, 0.96, 1.07][idx];
    const files = idx === 0 ? ['pass_footy.wav', 'variants/pass_footy_v1.wav'] : [`variants/pass_footy_v${idx}.wav`];
    return {
      files,
      dur: 0.20, norm: 0.84, sat: 1.02, room: 0.06, stereoWide: true, boxDip: -2.8, presence: 4.2, airShelf: 1.8, subHp: 94, lp: 12400,
      model: { type: 'leather_strike_natural', pitch: pitch * 1.24, power: 0.88, seed: 200 + idx * 13 },
      layers: [
        { key: 'body_punch_quick', offsetSec: 'auto', gain: 0.72, rate: pitch * 1.26, hp: 210, lp: 10400, maxDur: 0.16 },
        { key: 'soccer_quick_kick', offsetSec: 'auto', gain: 0.38, rate: pitch * 1.12, hp: 135, lp: 7800, maxDur: 0.14 },
      ],
    };
  })),

  // 3. FOOTBALL GRASS BOUNCE (Cushioned Natural Turf Bounce without Sub Overload)
  ...([0, 1, 2].map(idx => {
    const pitch = [0.95, 1.01, 0.90][idx];
    const files = idx === 0 ? ['bounce_footy.wav'] : [`variants/bounce_footy_v${idx}.wav`];
    return {
      files,
      dur: 0.20, norm: 0.78, sat: 1.02, room: 0.05, boxDip: -2.6, presence: 3.0, airShelf: 1.0, subHp: 82, lp: 10500,
      model: { type: 'leather_strike_natural', pitch: pitch * 0.96, power: 0.62, seed: 260 + idx * 11 },
      layers: [
        { key: 'soccer_quick_kick', offsetSec: 'auto', gain: 0.44, rate: pitch * 1.04, hp: 96, lp: 6800, maxDur: 0.16 },
        { key: 'sand_body_fall', offsetSec: 'auto', gain: 0.34, rate: pitch * 1.16, hp: 240, lp: 7600, maxDur: 0.11, fadeOut: 0.04 },
      ],
    };
  })),

  // 4. BASKETBALL DRIBBLE & HARDWOOD BOUNCE (Authentic Maple Chamber + Tight Leather Floor Slap)
  ...([0, 1, 2].map(idx => {
    const pitch = [1.0, 1.04, 0.96][idx];
    const files = idx === 0 ? ['dribble.wav', 'ball_bounce.wav'] : (idx === 1 ? ['variants/dribble_v1.wav'] : ['variants/dribble_v2.wav']);
    return {
      files,
      dur: 0.23, norm: 0.85, sat: 1.03, room: 0.10, stereoWide: true, boxDip: -2.4, presence: 3.0, airShelf: 1.6, subHp: 70, lp: 12600,
      model: { type: 'hoops_chamber_bounce', pitch, seed: 300 + idx * 19 },
      layers: [
        { key: idx % 2 === 0 ? 'bball_bounce' : 'bball_bounce_2', offsetSec: 'auto', gain: 0.82, rate: pitch, hp: 78, lp: 10800, maxDur: 0.20 },
        { key: 'bball_hit_court', offsetSec: 'auto', gain: 0.54, rate: pitch * 1.06, hp: 160, lp: 9600, maxDur: 0.16 },
      ],
    };
  })),

  // 5. BASKETBALL SHOT RELEASE / CHEST PASS (100% Pure Leather Palm Snap — Open & Crisp!)
  ...([0, 1, 2, 3].map(idx => {
    const pitch = [1.0, 1.04, 0.96, 1.08][idx];
    const files = idx === 0 ? ['shot_hoops.wav', 'variants/shot_hoops_v1.wav'] : [`variants/shot_hoops_v${idx}.wav`];
    return {
      files,
      dur: 0.22, norm: 0.82, sat: 1.02, room: 0.08, stereoWide: true, boxDip: -2.8, presence: 3.2, airShelf: 1.6, subHp: 94, lp: 12200,
      model: { type: 'leather_strike_natural', pitch: pitch * 1.38, power: 0.56, seed: 360 + idx * 17 },
      layers: [
        { key: 'bball_hand_catch', offsetSec: 'auto', gain: 0.88, rate: pitch, hp: 130, lp: 11200, maxDur: 0.19 },
        { key: 'bball_poke_hit', offsetSec: 'auto', gain: 0.44, rate: pitch * 1.06, hp: 220, lp: 10400, maxDur: 0.16 },
      ],
    };
  })),

  // 6. BASKETBALL NYLON SWISH (Clean High-Definition NBA Net Whip — Zero 300Hz Box Mud!)
  ...([0, 1, 2, 3, 4, 5].map(idx => {
    const pitch = [1.0, 1.03, 0.97, 1.06, 0.94, 1.01][idx];
    const files = idx === 0 ? ['shot_swish.wav', 'variants/swish_v1.wav'] : [`variants/swish_v${idx}.wav`];
    return {
      files,
      dur: 0.42, norm: 0.84, sat: 1.01, room: 0.11, stereoWide: true, boxDip: -4.8, presence: 3.4, airShelf: 2.6, subHp: 680, lp: 14500,
      model: { type: 'nylon_net_whip', pitch, seed: 420 + idx * 13 },
      layers: [
        { key: 'bball_net_swish', offsetSec: 'auto', gain: 0.92, rate: pitch, hp: 720, lp: 13200, maxDur: 0.40, fadeOut: 0.08 },
        { key: 'grass_slide_1', offsetSec: 'auto', delay: 0.025, gain: 0.24, rate: pitch * 1.45, hp: 2400, lp: 12500, maxDur: 0.15, fadeOut: 0.06 },
      ],
    };
  })),

  // 7. SLAM DUNK (Breakaway Steel Ring Modal Ring + Tight Slam Transient + Crisply Whipped Net!)
  ...([0, 1, 2, 3, 4, 5].map(idx => {
    const pitch = [1.0, 1.02, 0.97, 1.04, 0.95, 1.01][idx];
    const files = idx === 0 ? ['dunk_slam.wav', 'variants/dunk_v1.wav'] : [`variants/dunk_v${idx}.wav`];
    return {
      files,
      dur: 0.66, norm: 0.87, sat: 1.05, room: 0.15, stereoWide: true, boxDip: -2.8, presence: 3.4, airShelf: 1.8, subHp: 52, lp: 13200,
      model: { type: 'breakaway_rim_dunk', pitch, seed: 500 + idx * 29 },
      layers: [
        { key: 'bball_dunk_hard', offsetSec: 'auto', gain: 0.78, rate: pitch, hp: 62, lp: 11800, maxDur: 0.42 },
        { key: 'bball_rim_1', offsetSec: 'auto', gain: 0.80, rate: pitch * 1.02, hp: 200, lp: 12400, maxDur: 0.30 },
        { key: 'metal_hit', offsetSec: 'auto', gain: 0.24, rate: pitch * 0.92, hp: 360, lp: 9600, maxDur: 0.28, fadeOut: 0.08 },
        { key: 'bball_net_swish', offsetSec: 'auto', delay: 0.062, gain: 0.68, rate: pitch * 1.04, hp: 680, lp: 13400, maxDur: 0.44, fadeOut: 0.09 },
      ],
    };
  })),

  // 8. RIM CLANG, BACKBOARD POLYCARBONATE & TUBULAR GOALPOST (Physical Multi-Mode Metal Resonance!)
  {
    files: ['rim_clang.wav'],
    dur: 0.42, norm: 0.84, sat: 1.02, room: 0.13, stereoWide: true, boxDip: -2.4, presence: 2.8, airShelf: 1.6, subHp: 95, lp: 12800,
    model: { type: 'breakaway_rim_dunk', pitch: 1.08, seed: 580, rimOnly: true },
    layers: [
      { key: 'bball_rim_1', offsetSec: 'auto', gain: 0.84, rate: 1.0, hp: 110, lp: 11800, maxDur: 0.36 },
      { key: 'metal_hit', offsetSec: 'auto', gain: 0.42, rate: 0.96, hp: 280, lp: 10800, maxDur: 0.36, fadeOut: 0.08 },
      { key: 'bball_bounce_2', offsetSec: 'auto', gain: 0.32, rate: 1.06, hp: 140, lp: 7400, maxDur: 0.20 },
    ],
  },
  {
    files: ['backboard_hit.wav'],
    dur: 0.25, norm: 0.84, sat: 1.03, room: 0.12, stereoWide: true, boxDip: -3.6, presence: 3.4, airShelf: 1.4, subHp: 98, lp: 11400,
    model: { type: 'hoops_chamber_bounce', pitch: 0.94, seed: 602 },
    layers: [
      { key: 'bball_bounce_floor', offsetSec: 0.001, gain: 0.56, rate: 1.02, hp: 135, lp: 7800, maxDur: 0.21, fadeOut: 0.06 },
      { key: 'body_punch_quick', offsetSec: 'auto', gain: 0.58, rate: 1.15, hp: 260, lp: 10400, maxDur: 0.16 },
      { key: 'bball_rim_1', offsetSec: 'auto', gain: 0.20, rate: 1.12, hp: 480, lp: 9600, maxDur: 0.14 },
    ],
  },
  {
    files: ['goalpost_hit.wav'],
    dur: 0.58, norm: 0.85, sat: 1.02, room: 0.15, stereoWide: true, boxDip: -2.6, presence: 2.8, airShelf: 1.6, subHp: 90, lp: 13200,
    model: { type: 'metal_pipe_resonator', pitch: 1.0, seed: 640 },
    layers: [
      { key: 'metal_hit', offsetSec: 'auto', gain: 0.72, rate: 0.90, hp: 180, lp: 11200, maxDur: 0.52, fadeOut: 0.10 },
      { key: 'metal_hammer_hit', offsetSec: 'auto', gain: 0.38, rate: 0.82, hp: 260, lp: 11600, maxDur: 0.48 },
      { key: 'soccer_kick_power', offsetSec: 'auto', gain: 0.36, rate: 1.06, hp: 90, lp: 4200, maxDur: 0.18 },
    ],
  },

  // 9. SLIDE TACKLE (Authentic Grass Turf Slide & Body Skid)
  ...([0, 1, 2, 3, 4, 5].map(idx => {
    const pitch = [1.0, 1.04, 0.96, 1.06, 0.95, 1.02][idx];
    const files = idx === 0 ? ['slide_tackle.wav', 'variants/slide_v1.wav'] : [`variants/slide_v${idx}.wav`];
    return {
      files,
      dur: 0.50, norm: 0.84, sat: 1.02, room: 0.08, stereoWide: true, boxDip: -2.8, presence: 2.6, airShelf: 0.8, subHp: 78, lp: 9800,
      layers: [
        { key: 'grass_slide_1', offsetSec: 'auto', gain: 0.90, rate: pitch, hp: 130, lp: 9200, maxDur: 0.46, fadeOut: 0.09 },
        { key: 'sand_body_fall', offsetSec: 'auto', gain: 0.52, rate: pitch * 0.94, hp: 90, lp: 6400, maxDur: 0.34, fadeOut: 0.08 },
      ],
    };
  })),

  // 10. GOALKEEPER LATEX SAVE (Real Padded Glove Parry)
  ...([0, 1, 2, 3].map(idx => {
    const pitch = [1.0, 1.04, 0.96, 1.06][idx];
    const files = idx === 0 ? ['keeper_save.wav', 'variants/save_v1.wav'] : [`variants/save_v${idx}.wav`];
    return {
      files,
      dur: 0.34, norm: 0.86, sat: 1.03, room: 0.11, stereoWide: true, boxDip: -2.6, presence: 3.2, airShelf: 1.4, subHp: 68, lp: 11200,
      model: { type: 'leather_strike_natural', pitch: 0.92 * pitch, power: 0.72, seed: 800 + idx * 17 },
      layers: [
        { key: 'glove_punch', offsetSec: 'auto', gain: 0.88, rate: pitch, hp: 80, lp: 9200, maxDur: 0.30, fadeOut: 0.06 },
        { key: 'punch_impact_strong', offsetSec: 'auto', gain: 0.44, rate: pitch * 1.04, hp: 200, lp: 9800, maxDur: 0.20 },
      ],
    };
  })),

  // 11. STEAL SWIPE & AIR WHOOSH (Clean Leather Poke + Balanced Mid-Air Whip — Zero Sub Boom!)
  ...([0, 1, 2, 3, 4, 5].map(idx => {
    const pitch = [1.0, 1.04, 0.96, 1.07, 0.95, 1.02][idx];
    const files = idx === 0 ? ['steal_swipe.wav', 'variants/steal_v1.wav'] : [`variants/steal_v${idx}.wav`];
    return {
      files,
      dur: 0.22, norm: 0.83, sat: 1.02, room: 0.08, stereoWide: true, boxDip: -2.4, presence: 2.8, airShelf: 1.4, subHp: 110, lp: 11800,
      layers: [
        { key: 'bball_poke_hit', offsetSec: 'auto', gain: 0.84, rate: pitch, hp: 110, lp: 10800, maxDur: 0.20 },
        { key: 'bball_hand_catch', offsetSec: 'auto', gain: 0.56, rate: pitch * 1.06, hp: 180, lp: 9800, maxDur: 0.16 },
      ],
    };
  })),
  {
    files: ['steal_swoosh.wav', 'variants/steal_swoosh_v1.wav'],
    dur: 0.22, norm: 0.82, sat: 1.01, room: 0.09, stereoWide: false, boxDip: -3.2, presence: 2.6, airShelf: 0.6, subHp: 280, lp: 8600,
    model: { type: 'warm_air_whoosh', pitch: 1.0, seed: 950 },
    layers: [
      { key: 'fast_swoosh', offsetSec: 'peak-0.06', gain: 0.76, rate: 1.15, hp: 320, lp: 6800, maxDur: 0.19, fadeOut: 0.05 },
    ],
  },

  // 12. FOOTSTEPS (Crisp Grass Cleat Studs & Court Soles) & CLEAN NBA SNEAKER SQUEAKS
  ...([0, 1, 2].map(idx => {
    const pitch = [1.0, 0.94, 1.07][idx];
    const files = idx === 0 ? ['sprint_step.wav'] : [`variants/step_v${idx}.wav`];
    return {
      files,
      dur: 0.13, norm: 0.76, sat: 1.01, room: 0.04, boxDip: -2.8, presence: 2.6, airShelf: 0.8, subHp: 85, lp: 8400,
      model: { type: 'leather_strike_natural', pitch: pitch * 0.86, power: 0.42, seed: 1000 + idx * 11 },
      layers: [
        { key: 'sand_body_fall', offsetSec: 'auto', gain: 0.82, rate: pitch * 1.12, hp: 130, lp: 7400, maxDur: 0.11, fadeOut: 0.03 },
      ],
    };
  })),
  ...([0, 1, 2].map(idx => {
    const pitch = [1.0, 1.05, 0.95][idx];
    const files = idx === 0 ? ['sprint_step_court.wav', 'variants/step_court_v1.wav'] : ['variants/step_court_v2.wav'];
    return {
      files,
      dur: 0.12, norm: 0.78, sat: 1.01, room: 0.07, boxDip: -2.6, presence: 3.0, airShelf: 1.0, subHp: 110, lp: 9600,
      layers: [
        { key: 'bball_hand_catch', offsetSec: 'auto', gain: 0.64, rate: pitch * 1.18, hp: 280, lp: 8600, maxDur: 0.09, fadeOut: 0.03 },
        { key: 'bball_hit_court', offsetSec: 'auto', gain: 0.56, rate: pitch * 1.12, hp: 140, lp: 7200, maxDur: 0.10, fadeOut: 0.03 },
      ],
    };
  })),
  ...([0, 1].map(idx => {
    const pitch = idx === 0 ? 1.0 : 1.06;
    const files = idx === 0 ? ['sneaker_squeak.wav'] : ['variants/squeak_v1.wav'];
    return {
      files,
      dur: 0.22, norm: 0.80, sat: 1.01, room: 0.10, stereoWide: true, boxDip: -2.0, presence: 1.8, airShelf: -0.4, subHp: 460, lp: 9200,
      layers: [
        { key: 'real_squeak', offsetSec: 'auto', gain: 0.88, rate: pitch * 0.92, hp: 620, lp: 8200, maxDur: 0.19, fadeOut: 0.03 },
        { key: 'bball_hit_court', offsetSec: 'auto', gain: 0.30, rate: pitch, hp: 160, lp: 5800, maxDur: 0.11 },
      ],
    };
  })),

  // 13. REAL REFEREE WHISTLES & ARENA BUZZER (Full Arena Diffused Reverb Tail)
  ...([0, 1, 2, 3].map(idx => {
    const pitch = [1.0, 1.02, 0.97, 1.04][idx];
    const doubleBlast = (idx === 2 || idx === 3);
    const files = idx === 0 ? ['whistle.wav', 'referee_whistle.wav'] : [`variants/whistle_v${idx}.wav`];
    return {
      files,
      dur: doubleBlast ? 0.64 : 0.42, norm: 0.78, sat: 1.01, room: 0.18, stereoWide: true, boxDip: -1.8, presence: 0.8, airShelf: -0.6, subHp: 560, lp: 10800,
      layers: doubleBlast
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
    dur: 0.88, norm: 0.82, sat: 1.02, room: 0.20, stereoWide: true, boxDip: -2.2, presence: 1.6, airShelf: 0.8, subHp: 90, lp: 11200,
    layers: [
      { key: 'bball_buzzer', offsetSec: 0.06, gain: 0.94, rate: 1.0, hp: 96, lp: 10400, maxDur: 0.84, fadeIn: 0.015, fadeOut: 0.12 },
    ],
  },

  // 14. WIDE-STEREO STADIUM CELEBRATIONS & AMBIENCE LOOPS (Full-Range Air + Warm Lower Body, Zero Box Honk!)
  ...([0, 1, 2, 3, 4, 5].map(idx => {
    const files = idx === 0 ? ['celebration.wav', 'variants/celebrate_v1.wav'] : [`variants/celebrate_v${idx}.wav`];
    return {
      files,
      dur: 2.40, norm: 0.85, sat: 1.01, room: 0.18, stereoWide: true, boxDip: -3.8, presence: 2.2, airShelf: 1.8, subHp: 74, lp: 11800,
      layers: [
        { key: idx % 2 === 0 ? 'stadium_crowd_roar' : 'crowd_victory', offsetSec: 3.5 + idx * 0.4, gain: 0.88, rate: 1.0, hp: 82, lp: 11200, maxDur: 2.35, fadeIn: 0.04, fadeOut: 0.35 },
        { key: 'stadium_applause', offsetSec: 3.4 + idx * 0.3, gain: 0.74, rate: 1.0, hp: 150, lp: 11600, maxDur: 2.35, fadeIn: 0.06, fadeOut: 0.38 },
      ],
    };
  })),
  {
    files: ['crowd_cheer.wav'],
    dur: 1.45, norm: 0.82, sat: 1.01, room: 0.16, stereoWide: true, boxDip: -3.6, presence: 2.2, airShelf: 1.6, subHp: 78, lp: 11600,
    layers: [
      { key: 'crowd_stadium_yell', offsetSec: 0.85, gain: 0.84, rate: 1.0, hp: 95, lp: 11200, maxDur: 1.40, fadeIn: 0.05, fadeOut: 0.32 },
      { key: 'stadium_applause', offsetSec: 4.10, gain: 0.76, rate: 1.0, hp: 150, lp: 11400, maxDur: 1.38, fadeIn: 0.06, fadeOut: 0.32 },
    ],
  },
  {
    files: ['ambience_footy.wav'],
    dur: 4.00, norm: 0.48, sat: 1.0, room: 0.10, stereoWide: true, boxDip: -4.2, presence: 1.2, airShelf: 1.0, subHp: 76, lp: 8800, seamlessLoop: true,
    layers: [
      { key: 'stadium_crowd_roar', offsetSec: 4.6, gain: 0.74, rate: 0.98, hp: 84, lp: 8200, maxDur: 4.5 },
      { key: 'stadium_applause', offsetSec: 4.2, gain: 0.42, rate: 0.96, hp: 150, lp: 8600, maxDur: 4.5 },
    ],
  },
  {
    files: ['ambience_hoops.wav'],
    dur: 4.00, norm: 0.58, sat: 1.0, room: 0.12, stereoWide: true, boxDip: -3.8, presence: 1.4, airShelf: 1.2, subHp: 76, lp: 9200, seamlessLoop: true,
    layers: [
      { key: 'stadium_applause', offsetSec: 4.2, gain: 0.76, rate: 0.94, hp: 92, lp: 8600, maxDur: 4.5 },
      { key: 'stadium_crowd_roar', offsetSec: 5.5, gain: 0.58, rate: 1.00, hp: 82, lp: 7800, maxDur: 4.5 },
    ],
  },

  // 15. STUDIO SOUNDTRACK INSTRUMENT STEMS (Analog Kick, Roomy Snare/Clap, Crisp Hats & Vintage FM Rhodes Chords)
  {
    files: ['music/music_kick.wav'],
    dur: 0.28, norm: 0.82, sat: 1.04, room: 0.02, boxDip: -2.5, presence: 1.8, airShelf: 0.0, subHp: 34, lp: 4800,
    model: { type: 'studio_kick', seed: 2001 },
    layers: [],
  },
  {
    files: ['music/music_snare.wav'],
    dur: 0.24, norm: 0.76, sat: 1.02, room: 0.22, stereoWide: true, boxDip: -2.2, presence: 2.2, airShelf: 1.4, subHp: 110, lp: 12200,
    model: { type: 'studio_snare', seed: 2002 },
    layers: [],
  },
  {
    files: ['music/music_hat.wav'],
    dur: 0.09, norm: 0.62, sat: 1.0, room: 0.08, stereoWide: true, boxDip: -2.0, presence: 1.4, airShelf: 1.6, subHp: 2200, lp: 13800,
    model: { type: 'studio_hat', open: false, seed: 2003 },
    layers: [],
  },
  {
    files: ['music/music_open_hat.wav'],
    dur: 0.20, norm: 0.62, sat: 1.0, room: 0.14, stereoWide: true, boxDip: -2.0, presence: 1.4, airShelf: 1.8, subHp: 1900, lp: 13800,
    model: { type: 'studio_hat', open: true, seed: 2004 },
    layers: [],
  },
  ...([0, 1, 2, 3].map(idx => ({
    files: [`music/music_chord_${idx}.wav`],
    dur: 1.15, norm: 0.78, sat: 1.03, room: 0.26, stereoWide: true, boxDip: -2.4, presence: 1.2, airShelf: 0.8, subHp: 40, lp: 11000,
    model: { type: 'studio_rhodes', chordIdx: idx, seed: 2100 + idx * 31 },
    layers: [],
  }))),
];

// Read & encode raw stems for browser transfer
const rawB64 = {};
for (const [k, p] of Object.entries(SOURCE_MAP)) {
  if (!fs.existsSync(p)) throw new Error('Missing audio stem: ' + p);
  rawB64[k] = fs.readFileSync(p).toString('base64');
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<!doctype html><html><body>Studio Audio DSP Host v11.0</body></html>');
});

server.listen(PORT, '127.0.0.1', async () => {
  const udir = fs.mkdtempSync(path.join(os.tmpdir(), 'fvh-aud-v11-'));
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
      window.__raw = {};
      window.__meta = {};
      for (const [k, b64] of Object.entries(b64Map)) {
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        const buf = await window.__actx.decodeAudioData(bytes.buffer.slice(0));
        window.__raw[k] = buf;
        const ch = buf.getChannelData(0);
        const sr = buf.sampleRate;
        let pk = 0, pkIdx = 0, onsetIdx = 0;
        for (let i = 0; i < ch.length; i++) {
          const a = Math.abs(ch[i]);
          if (a > pk) { pk = a; pkIdx = i; }
        }
        const thresh = Math.max(0.015, pk * 0.14);
        for (let i = 0; i < ch.length; i++) {
          if (Math.abs(ch[i]) >= thresh) { onsetIdx = Math.max(0, i - Math.floor(sr * 0.0015)); break; }
        }
        window.__meta[k] = { onsetSec: onsetIdx / sr, peakSec: pkIdx / sr };
      }

      // Clean physical modal & transient synthesis (zero cheap Pitch-Swept SFX + real FM studio music stems!)
      window.__renderPhysicalModel = (ctx, dest, spec, durSec) => {
        const SR = ctx.sampleRate;
        const p = spec.pitch || 1.0;
        const sd = spec.seed || 77;
        const modelSec = Math.max(0.38, Math.min(durSec || 0.38, 1.30));
        const len = Math.floor(SR * modelSec);
        const buf = ctx.createBuffer(2, len, SR);
        const c0 = buf.getChannelData(0), c1 = buf.getChannelData(1);

        let rngState = sd >>> 0;
        const rnd = () => { rngState = (rngState * 1664525 + 1013904223) >>> 0; return (rngState / 2147483648) - 1; };

        if (spec.type === 'leather_strike_natural') {
          const pw = spec.power || 1.0;
          // Crisp cleat-leather snap (1.8-6kHz) + balanced bladder resonance (104Hz/220Hz, zero sub mud)
          let b1 = 0, b2 = 0, hpPrev = 0, hpOut = 0;
          for (let i = 0; i < Math.min(len, Math.floor(SR * 0.14)); i++) {
            const t = i / SR;
            const bodyMode = (Math.sin(2 * Math.PI * 104 * p * t) * 0.36 * Math.exp(-t * 42) +
                              Math.sin(2 * Math.PI * 228 * p * t) * 0.28 * Math.exp(-t * 68)) * (1 - Math.exp(-t * 2400));
            const rawTap = rnd() * Math.exp(-t * 240);
            b1 = b1 * 0.42 + rawTap * 0.58;
            b2 = b2 * 0.42 + b1 * 0.58;
            hpOut = 0.78 * (hpOut + b2 - hpPrev);
            hpPrev = b2;
            const snap = Math.tanh(hpOut * 4.2) * 0.88 * (1 - Math.exp(-t * 4200));
            const s = (bodyMode + snap) * 0.74 * pw;
            c0[i] = s; c1[i] = s;
          }
        } else if (spec.type === 'hoops_chamber_bounce') {
          let b1 = 0, hpPrev = 0, hpOut = 0;
          for (let i = 0; i < Math.min(len, Math.floor(SR * 0.12)); i++) {
            const t = i / SR;
            const cavity = Math.sin(2 * Math.PI * 138 * p * t) * 0.34 * Math.exp(-t * 46) +
                           Math.sin(2 * Math.PI * 292 * p * t) * 0.24 * Math.exp(-t * 74);
            const rawClick = rnd() * Math.exp(-t * 300);
            b1 = b1 * 0.38 + rawClick * 0.62;
            hpOut = 0.76 * (hpOut + b1 - hpPrev);
            hpPrev = b1;
            const mapleClick = Math.tanh(hpOut * 3.4) * 0.62 * (1 - Math.exp(-t * 4500));
            const s = (cavity + mapleClick) * 0.72;
            c0[i] = s; c1[i] = s;
          }
        } else if (spec.type === 'nylon_net_whip') {
          // Pure dual-stroke silk/nylon swish texture (>1.6kHz) with zero low box rumble
          let bp1 = 0, bp2 = 0, hpPrev = 0, hpOut = 0;
          for (let i = 0; i < Math.min(len, Math.floor(SR * 0.32)); i++) {
            const t = i / SR;
            const env1 = Math.sin(clamp(t / 0.13, 0, 1) * Math.PI) * Math.exp(-Math.max(0, t - 0.04) * 14);
            const env2 = t > 0.065 ? Math.sin(clamp((t - 0.065) / 0.20, 0, 1) * Math.PI) * Math.exp(-Math.max(0, t - 0.10) * 10) : 0;
            const w = rnd();
            bp1 = bp1 * 0.28 + w * 0.72;
            hpOut = 0.84 * (hpOut + bp1 - hpPrev);
            hpPrev = bp1;
            bp2 = bp2 * 0.45 + rnd() * 0.55;
            c0[i] = (hpOut * env1 * 0.52 + bp2 * env2 * 0.28) * 0.65;
            c1[i] = (hpOut * env1 * 0.48 + bp2 * env2 * 0.32) * 0.65;
          }
        } else if (spec.type === 'breakaway_rim_dunk') {
          const rimOnly = !!spec.rimOnly;
          const modes = [[218 * p, 0.26, 22], [434 * p, 0.22, 26], [872 * p, 0.16, 34], [1560 * p, 0.12, 46], [2680 * p, 0.08, 65]];
          let lp = 0;
          for (let i = 0; i < Math.min(len, Math.floor(SR * 0.36)); i++) {
            const t = i / SR;
            let ring = 0;
            for (const [f, a, d] of modes) ring += Math.sin(2 * Math.PI * f * t) * a * Math.exp(-t * d);
            lp = lp * 0.46 + rnd() * 0.54;
            const crack = lp * Math.exp(-t * 240) * 0.45;
            const boom = rimOnly ? 0 : Math.tanh(Math.sin(2 * Math.PI * 56 * p * t) * 1.5) * Math.exp(-t * 16) * 0.36;
            const s = (ring * 0.65 + crack + boom) * (1 - Math.exp(-t * 3600));
            c0[i] = s; c1[i] = s * 0.96;
          }
        } else if (spec.type === 'metal_pipe_resonator') {
          // True hollow aluminum tubular goalpost harmonic modes + leather contact crack
          const modes = [[392, 0.32, 8.5], [698, 0.24, 11], [1165, 0.20, 15], [1810, 0.16, 22], [2680, 0.10, 32], [3940, 0.07, 45]];
          for (let i = 0; i < Math.min(len, Math.floor(SR * 0.52)); i++) {
            const t = i / SR;
            let metal = 0;
            for (const [f, a, d] of modes) metal += Math.sin(2 * Math.PI * f * p * t) * a * Math.exp(-t * d);
            const tap = rnd() * Math.exp(-t * 360) * 0.44;
            const s = (metal * 0.72 + tap) * (1 - Math.exp(-t * 4000));
            c0[i] = s; c1[i] = s * 0.95;
          }
        } else if (spec.type === 'warm_air_whoosh') {
          // Bandpassed airy cloth/hand whip (380-2800Hz, zero sub thump!)
          let lp = 0, hpPrev = 0, hpOut = 0, lpSide = 0;
          for (let i = 0; i < Math.min(len, Math.floor(SR * 0.18)); i++) {
            const t = i / SR;
            const env = Math.sin(Math.min(1, t / 0.16) * Math.PI);
            const nL = rnd(), nR = rnd();
            lp = lp * 0.52 + nL * 0.48;
            hpOut = 0.88 * (hpOut + lp - hpPrev);
            hpPrev = lp;
            lpSide = lpSide * 0.54 + nR * 0.46;
            c0[i] = (hpOut * 0.84 + lpSide * 0.16) * env * 0.52;
            c1[i] = (hpOut * 0.84 - lpSide * 0.16) * env * 0.52;
          }
        } else if (spec.type === 'studio_kick') {
          let hpClick = 0;
          for (let i = 0; i < len; i++) {
            const t = i / SR;
            // Tight pitch-drop analog 808 punch from 128Hz -> 48Hz + warm analog beater transient
            const phase = 2 * Math.PI * (48 * t + (80 / 34) * (1 - Math.exp(-34 * t)));
            const body = Math.tanh(Math.sin(phase) * 1.45) * Math.exp(-t * 10.5) * (1 - Math.exp(-t * 2800));
            hpClick = hpClick * 0.35 + rnd() * 0.65;
            const beater = hpClick * Math.exp(-t * 280) * 0.36;
            const s = body * 0.82 + beater;
            c0[i] = s; c1[i] = s;
          }
        } else if (spec.type === 'studio_snare') {
          let n1 = 0, n2 = 0, hp = 0, hpPrev = 0;
          for (let i = 0; i < len; i++) {
            const t = i / SR;
            const tone = (Math.sin(2 * Math.PI * (172 * t + (95 / 42) * (1 - Math.exp(-42 * t)))) * 0.44 * Math.exp(-t * 22) +
                          Math.sin(2 * Math.PI * 332 * t) * 0.22 * Math.exp(-t * 32));
            const rA = rnd(), rB = rnd();
            n1 = n1 * 0.28 + rA * 0.72;
            n2 = n2 * 0.28 + rB * 0.72;
            hp = 0.82 * (hp + n1 - hpPrev);
            hpPrev = n1;
            const wires = (hp * 0.55 + n2 * 0.25) * Math.exp(-t * 16) * (1 - Math.exp(-t * 3200));
            c0[i] = (tone + wires * 0.85) * 0.72;
            c1[i] = (tone + wires * 0.92 + (n2 - n1) * 0.14 * Math.exp(-t * 16)) * 0.72;
          }
        } else if (spec.type === 'studio_hat') {
          const decay = spec.open ? 14 : 52;
          let hpP = 0, hpO = 0;
          for (let i = 0; i < len; i++) {
            const t = i / SR;
            const metal = Math.sin(2 * Math.PI * 3420 * t) * Math.sin(2 * Math.PI * 5180 * t) + rnd() * 0.85;
            hpO = 0.86 * (hpO + metal - hpP);
            hpP = metal;
            const s = hpO * Math.exp(-t * decay) * (1 - Math.exp(-t * 4800)) * 0.42;
            c0[i] = s; c1[i] = s * 0.94;
          }
        } else if (spec.type === 'studio_rhodes') {
          // Lush Stereo FM Vintage Rhodes Mark I + Warm Sub Root (Am9 -> Fmaj7 -> Cmaj9 -> G13)
          const CHORDS = [
            { bass: 55.0,  notes: [220.00, 261.63, 329.63, 392.00, 493.88] }, // Am9
            { bass: 43.65, notes: [174.61, 220.00, 261.63, 329.63, 392.00] }, // Fmaj7
            { bass: 65.41, notes: [196.00, 246.94, 293.66, 329.63, 493.88] }, // Cmaj9
            { bass: 49.00, notes: [196.00, 246.94, 293.66, 329.63, 440.00] }, // G13
          ];
          const ch = CHORDS[spec.chordIdx % CHORDS.length];
          for (let i = 0; i < len; i++) {
            const t = i / SR;
            const atk = 1 - Math.exp(-t * 110);
            const rel = t > (modelSec - 0.14) ? Math.max(0, (modelSec - t) / 0.14) : 1;
            const bass = Math.tanh(Math.sin(2 * Math.PI * ch.bass * t) * 1.35 + Math.sin(2 * Math.PI * ch.bass * 2 * t) * 0.25) * 0.34 * Math.exp(-t * 1.4);
            let L = bass, R = bass;
            const tineEnv = Math.exp(-t * 16.0);
            const warmEnv = Math.exp(-t * 2.1);
            for (let n = 0; n < ch.notes.length; n++) {
              const f = ch.notes[n];
              const pan = (n / (ch.notes.length - 1)) * 0.56 - 0.28; // natural stereo keyboard spread!
              // FM Rhodes tine attack -> warm bell sustain + stereo chorus detune
              const fmModL = Math.sin(2 * Math.PI * f * 7.0 * t) * tineEnv * 1.45;
              const fmModR = Math.sin(2 * Math.PI * f * 7.01 * t) * tineEnv * 1.45;
              const vL = (Math.sin(2 * Math.PI * f * 0.9985 * t + fmModL) + 0.22 * Math.sin(2 * Math.PI * f * 2 * t)) * warmEnv * 0.16;
              const vR = (Math.sin(2 * Math.PI * f * 1.0015 * t + fmModR) + 0.22 * Math.sin(2 * Math.PI * f * 2 * t)) * warmEnv * 0.16;
              L += vL * (1 - pan);
              R += vR * (1 + pan);
            }
            c0[i] = L * atk * rel;
            c1[i] = R * atk * rel;
          }
        }
        function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(dest);
        src.start(0);
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
        masterHp.type = 'highpass'; masterHp.frequency.value = rec.subHp || 48;
        const boxDip = off.createBiquadFilter();
        boxDip.type = 'peaking'; boxDip.frequency.value = 285; boxDip.Q.value = 0.85; boxDip.gain.value = rec.boxDip || -1.8;
        const pres = off.createBiquadFilter();
        pres.type = 'peaking'; pres.frequency.value = 2400; pres.Q.value = 0.75; pres.gain.value = rec.presence || 1.6;
        const air = off.createBiquadFilter();
        air.type = 'highshelf'; air.frequency.value = 5000; air.gain.value = rec.airShelf || 0.4;
        const topLp = off.createBiquadFilter();
        topLp.type = 'lowpass'; topLp.frequency.value = rec.lp || 6800; topLp.Q.value = 0.65;

        masterHp.connect(boxDip); boxDip.connect(pres); pres.connect(air); air.connect(topLp); topLp.connect(off.destination);

        if (rec.model) {
          window.__renderPhysicalModel(off, masterHp, rec.model, rec.dur);
        }

        for (const lyr of (rec.layers || [])) {
          const srcBuf = window.__raw[lyr.key];
          const meta = window.__meta[lyr.key] || { onsetSec: 0, peakSec: 0 };
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
          let baseOffset = 0;
          if (lyr.offsetSec === 'auto') baseOffset = meta.onsetSec;
          else if (typeof lyr.offsetSec === 'string' && lyr.offsetSec.startsWith('peak-')) {
            const pre = parseFloat(lyr.offsetSec.slice(5)) || 0.04;
            baseOffset = Math.max(0, meta.peakSec - pre);
          } else {
            baseOffset = Number(lyr.offsetSec || 0);
          }
          const playDur = Math.min(lyr.maxDur || rec.dur, Math.max(0.03, srcBuf.duration - baseOffset));

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
          src.start(startWhen, baseOffset, playDur);
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

        // Center L/R RMS loudness skew from source field mics while preserving stereo decorrelation
        let sumL2 = 1e-8, sumR2 = 1e-8;
        for (let i = 0; i < totalFrames; i++) { sumL2 += ch0[i] * ch0[i]; sumR2 += ch1[i] * ch1[i]; }
        const rmsL = Math.sqrt(sumL2 / totalFrames), rmsR = Math.sqrt(sumR2 / totalFrames);
        const rmsAvg = 0.5 * (rmsL + rmsR);
        const balL = Math.max(0.76, Math.min(1.32, rmsAvg / Math.max(1e-6, rmsL)));
        const balR = Math.max(0.76, Math.min(1.32, rmsAvg / Math.max(1e-6, rmsR)));
        for (let i = 0; i < totalFrames; i++) { ch0[i] *= balL; ch1[i] *= balR; }

        // Diffused 4-Channel Householder FDN Room Acoustic Bus with High-Frequency Damping (zero metallic ringing!)
        const roomAmt = rec.room || 0;
        const lOut = new Float32Array(totalFrames), rOut = new Float32Array(totalFrames);
        const wideTap = rec.stereoWide ? Math.floor(SR * 0.008) : 0;
        const fdnDel = [743, 1277, 1889, 2593];
        const fdnBufs = fdnDel.map(n => new Float32Array(n));
        const fdnPtr = [0, 0, 0, 0];
        const fdnLp = [0, 0, 0, 0];
        const fbGain = 0.56;
        for (let i = 0; i < totalFrames; i++) {
          let l = ch0[i];
          let r = wideTap && i >= wideTap ? (ch1[i] * 0.88 + ch0[i - wideTap] * 0.12) : ch1[i];
          if (roomAmt > 0) {
            const dOuts = [0, 0, 0, 0];
            let sum = 0;
            for (let k = 0; k < 4; k++) {
              const raw = fdnBufs[k][fdnPtr[k]];
              fdnLp[k] = fdnLp[k] * 0.42 + raw * 0.58;
              dOuts[k] = fdnLp[k];
              sum += fdnLp[k];
            }
            const inMono = 0.5 * (ch0[i] + ch1[i]);
            const wetL = (dOuts[0] - dOuts[1] + dOuts[2] - dOuts[3]) * 0.55;
            const wetR = (dOuts[0] + dOuts[1] - dOuts[2] - dOuts[3]) * 0.55;
            for (let k = 0; k < 4; k++) {
              const feed = (dOuts[k] - 0.5 * sum) * fbGain + inMono * (k < 2 ? 0.52 : 0.42);
              fdnBufs[k][fdnPtr[k]] = feed;
              fdnPtr[k] = (fdnPtr[k] + 1) % fdnDel[k];
            }
            l += wetL * roomAmt;
            r += wetR * roomAmt;
          }
          lOut[i] = l; rOut[i] = r;
        }

        if (!rec.seamlessLoop) {
          const tail = Math.min(Math.floor(SR * 0.022), Math.floor(totalFrames * 0.12));
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
        const sat = rec.sat || 1.03;

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
      fs.writeFileSync(path.join(AUDIO_DIR, rel), buf);
      written++;
    }
  }

  console.log(`✓ Mastered ${written} authentic zero-synth-bleep studio v11.0 WAVs into assets/audio/!`);
  ws.close();
  br.kill();
  server.close();
  try { fs.rmSync(udir, { recursive: true, force: true }); } catch (_) {}
  process.exit(0);
});
