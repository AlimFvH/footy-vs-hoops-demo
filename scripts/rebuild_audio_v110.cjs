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
fs.mkdirSync(AUDIO_DIR, { recursive: true });
fs.mkdirSync(VAR_DIR, { recursive: true });

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
  // 1. FOOTBALL POWER STRIKE (Authentic Boot-on-Leather Impact + Turf Sub Weight — ZERO swept-sine laser tones!)
  ...([0, 1, 2, 3, 4, 5].map(idx => {
    const pitch = [1.0, 1.03, 0.96, 1.05, 0.98, 1.01][idx];
    const files = idx === 0 ? ['kick_power_strike.wav', 'variants/kick_v1.wav'] : [`variants/kick_v${idx}.wav`];
    return {
      files,
      dur: 0.38, norm: 0.86, sat: 1.04, room: 0.06, stereoWide: true, boxDip: -2.4, presence: 3.4, airShelf: 0.6, subHp: 58, lp: 6800,
      model: { type: 'leather_strike_natural', pitch, power: 1.0, seed: 100 + idx * 17 },
      layers: [
        { key: 'soccer_kick_power', offsetSec: 'auto', gain: 0.58, rate: pitch, hp: 62, lp: 2800, maxDur: 0.34, fadeOut: 0.06 },
        { key: 'punch_impact_strong', offsetSec: 'auto', gain: 0.42, rate: pitch * 1.10, hp: 220, lp: 5400, maxDur: 0.16, fadeOut: 0.04 },
        { key: 'body_punch_quick', offsetSec: 'auto', gain: 0.52, rate: pitch * 1.06, hp: 140, lp: 4200, maxDur: 0.18 },
      ],
    };
  })),

  // 2. FOOTBALL CRISP PASS (Tight Side-Foot Instep Push)
  ...([0, 1, 2, 3].map(idx => {
    const pitch = [1.0, 1.04, 0.96, 1.07][idx];
    const files = idx === 0 ? ['pass_footy.wav', 'variants/pass_footy_v1.wav'] : [`variants/pass_footy_v${idx}.wav`];
    return {
      files,
      dur: 0.20, norm: 0.84, sat: 1.02, room: 0.035, stereoWide: true, boxDip: -2.2, presence: 3.8, airShelf: 1.0, subHp: 95, lp: 6600,
      model: { type: 'leather_strike_natural', pitch: pitch * 1.20, power: 0.92, seed: 200 + idx * 13 },
      layers: [
        { key: 'body_punch_quick', offsetSec: 'auto', gain: 0.74, rate: pitch * 1.28, hp: 185, lp: 5600, maxDur: 0.16 },
        { key: 'soccer_quick_kick', offsetSec: 'auto', gain: 0.36, rate: pitch * 1.08, hp: 115, lp: 3600, maxDur: 0.14 },
      ],
    };
  })),

  // 3. FOOTBALL GRASS BOUNCE (Cushioned Natural Turf Bounce)
  ...([0, 1, 2].map(idx => {
    const pitch = [0.95, 1.01, 0.90][idx];
    const files = idx === 0 ? ['bounce_footy.wav'] : [`variants/bounce_footy_v${idx}.wav`];
    return {
      files,
      dur: 0.20, norm: 0.78, sat: 1.02, room: 0.02, boxDip: -2.0, presence: 2.6, airShelf: 0.2, subHp: 78, lp: 4600,
      model: { type: 'leather_strike_natural', pitch: pitch * 0.92, power: 0.68, seed: 260 + idx * 11 },
      layers: [
        { key: 'soccer_quick_kick', offsetSec: 'auto', gain: 0.44, rate: pitch * 1.02, hp: 90, lp: 2400, maxDur: 0.16 },
        { key: 'sand_body_fall', offsetSec: 'auto', gain: 0.36, rate: pitch * 1.15, hp: 220, lp: 3600, maxDur: 0.11, fadeOut: 0.04 },
      ],
    };
  })),

  // 4. BASKETBALL DRIBBLE & HARDWOOD BOUNCE (Authentic Maple Chamber + Tight Leather Floor Slap)
  ...([0, 1, 2].map(idx => {
    const pitch = [1.0, 1.04, 0.96][idx];
    const files = idx === 0 ? ['dribble.wav', 'ball_bounce.wav'] : (idx === 1 ? ['variants/dribble_v1.wav'] : ['variants/dribble_v2.wav']);
    return {
      files,
      dur: 0.23, norm: 0.85, sat: 1.03, room: 0.075, stereoWide: true, boxDip: -1.8, presence: 2.6, airShelf: 0.5, subHp: 64, lp: 6800,
      model: { type: 'hoops_chamber_bounce', pitch, seed: 300 + idx * 19 },
      layers: [
        { key: idx % 2 === 0 ? 'bball_bounce' : 'bball_bounce_2', offsetSec: 'auto', gain: 0.82, rate: pitch, hp: 72, lp: 5800, maxDur: 0.20 },
        { key: 'bball_hit_court', offsetSec: 'auto', gain: 0.54, rate: pitch * 1.05, hp: 140, lp: 4200, maxDur: 0.16 },
      ],
    };
  })),

  // 5. BASKETBALL SHOT RELEASE / CHEST PASS (100% Pure Leather Palm Push — Whistle Clone REMOVED!)
  ...([0, 1, 2, 3].map(idx => {
    const pitch = [1.0, 1.04, 0.96, 1.08][idx];
    const files = idx === 0 ? ['shot_hoops.wav', 'variants/shot_hoops_v1.wav'] : [`variants/shot_hoops_v${idx}.wav`];
    return {
      files,
      dur: 0.22, norm: 0.82, sat: 1.02, room: 0.05, stereoWide: true, boxDip: -1.8, presence: 2.4, airShelf: 0.6, subHp: 82, lp: 6400,
      model: { type: 'leather_strike_natural', pitch: pitch * 1.32, power: 0.65, seed: 360 + idx * 17 },
      layers: [
        { key: 'bball_hand_catch', offsetSec: 'auto', gain: 0.86, rate: pitch, hp: 110, lp: 5600, maxDur: 0.19 },
        { key: 'bball_poke_hit', offsetSec: 'auto', gain: 0.44, rate: pitch * 1.04, hp: 180, lp: 5200, maxDur: 0.16 },
      ],
    };
  })),

  // 6. BASKETBALL NYLON SWISH (Clean Real Net Cord Whip)
  ...([0, 1, 2, 3, 4, 5].map(idx => {
    const pitch = [1.0, 1.03, 0.97, 1.06, 0.94, 1.01][idx];
    const files = idx === 0 ? ['shot_swish.wav', 'variants/swish_v1.wav'] : [`variants/swish_v${idx}.wav`];
    return {
      files,
      dur: 0.44, norm: 0.84, sat: 1.01, room: 0.085, stereoWide: true, boxDip: -2.8, presence: 2.4, airShelf: 1.2, subHp: 220, lp: 7400,
      layers: [
        { key: 'bball_net_swish', offsetSec: 'auto', gain: 0.94, rate: pitch, hp: 220, lp: 6800, maxDur: 0.42, fadeOut: 0.08 },
        { key: 'grass_slide_1', offsetSec: 'auto', delay: 0.035, gain: 0.22, rate: pitch * 1.35, hp: 1600, lp: 5800, maxDur: 0.16, fadeOut: 0.06 },
      ],
    };
  })),

  // 7. SLAM DUNK (Breakaway Steel Ring + Real Dunk Flush + Clean Net Whip — NO screechy sweeps!)
  ...([0, 1, 2, 3, 4, 5].map(idx => {
    const pitch = [1.0, 1.02, 0.97, 1.04, 0.95, 1.01][idx];
    const files = idx === 0 ? ['dunk_slam.wav', 'variants/dunk_v1.wav'] : [`variants/dunk_v${idx}.wav`];
    return {
      files,
      dur: 0.66, norm: 0.87, sat: 1.05, room: 0.11, stereoWide: true, boxDip: -2.2, presence: 2.8, airShelf: 0.8, subHp: 46, lp: 7400,
      model: { type: 'dunk_natural_boom', pitch, seed: 500 + idx * 29 },
      layers: [
        { key: 'bball_dunk_hard', offsetSec: 'auto', gain: 0.86, rate: pitch, hp: 55, lp: 6800, maxDur: 0.42 },
        { key: 'bball_rim_1', offsetSec: 'auto', gain: 0.78, rate: pitch * 1.02, hp: 180, lp: 7200, maxDur: 0.28 },
        { key: 'metal_hit', offsetSec: 'auto', gain: 0.26, rate: pitch * 0.92, hp: 320, lp: 4800, maxDur: 0.28, fadeOut: 0.08 },
        { key: 'bball_net_swish', offsetSec: 'auto', delay: 0.068, gain: 0.64, rate: pitch * 1.04, hp: 280, lp: 7200, maxDur: 0.44, fadeOut: 0.09 },
      ],
    };
  })),

  // 8. RIM CLANG, BACKBOARD POLYCARBONATE & TUBULAR GOALPOST (Clean metallic resonance, zero 17kHz screech or whistle clone!)
  {
    files: ['rim_clang.wav'],
    dur: 0.40, norm: 0.84, sat: 1.02, room: 0.09, stereoWide: true, boxDip: -1.8, presence: 2.0, airShelf: 0.4, subHp: 90, lp: 6800,
    layers: [
      { key: 'bball_rim_1', offsetSec: 'auto', gain: 0.86, rate: 1.0, hp: 90, lp: 6400, maxDur: 0.34 },
      { key: 'metal_hit', offsetSec: 'auto', gain: 0.44, rate: 0.96, hp: 260, lp: 5200, maxDur: 0.34, fadeOut: 0.08 },
      { key: 'bball_bounce_2', offsetSec: 'auto', gain: 0.36, rate: 1.06, hp: 120, lp: 3400, maxDur: 0.22 },
    ],
  },
  {
    files: ['backboard_hit.wav'],
    dur: 0.25, norm: 0.84, sat: 1.03, room: 0.08, stereoWide: true, boxDip: -2.0, presence: 2.8, airShelf: 0.8, subHp: 88, lp: 6400,
    model: { type: 'hoops_chamber_bounce', pitch: 0.90, seed: 602 },
    layers: [
      { key: 'bball_bounce_floor', offsetSec: 0.001, gain: 0.62, rate: 0.98, hp: 105, lp: 3800, maxDur: 0.21, fadeOut: 0.06 },
      { key: 'body_punch_quick', offsetSec: 'auto', gain: 0.56, rate: 1.12, hp: 220, lp: 5400, maxDur: 0.16 },
      { key: 'bball_rim_1', offsetSec: 'auto', gain: 0.18, rate: 1.08, hp: 420, lp: 5200, maxDur: 0.14 },
    ],
  },
  {
    files: ['goalpost_hit.wav'],
    dur: 0.56, norm: 0.85, sat: 1.02, room: 0.11, stereoWide: true, boxDip: -2.0, presence: 1.8, airShelf: 0.2, subHp: 85, lp: 6400,
    layers: [
      { key: 'metal_hit', offsetSec: 'auto', gain: 0.78, rate: 0.88, hp: 160, lp: 4800, maxDur: 0.52, fadeOut: 0.10 },
      { key: 'metal_hammer_hit', offsetSec: 'auto', gain: 0.42, rate: 0.78, hp: 240, lp: 5200, maxDur: 0.48 },
      { key: 'soccer_kick_power', offsetSec: 'auto', gain: 0.48, rate: 1.06, hp: 70, lp: 2400, maxDur: 0.22 },
    ],
  },

  // 9. SLIDE TACKLE (Authentic Grass Turf Slide & Body Skid)
  ...([0, 1, 2, 3, 4, 5].map(idx => {
    const pitch = [1.0, 1.04, 0.96, 1.06, 0.95, 1.02][idx];
    const files = idx === 0 ? ['slide_tackle.wav', 'variants/slide_v1.wav'] : [`variants/slide_v${idx}.wav`];
    return {
      files,
      dur: 0.50, norm: 0.84, sat: 1.02, room: 0.04, stereoWide: true, boxDip: -2.4, presence: 2.0, airShelf: 0.2, subHp: 75, lp: 5600,
      layers: [
        { key: 'grass_slide_1', offsetSec: 'auto', gain: 0.90, rate: pitch, hp: 120, lp: 5200, maxDur: 0.46, fadeOut: 0.09 },
        { key: 'sand_body_fall', offsetSec: 'auto', gain: 0.52, rate: pitch * 0.94, hp: 85, lp: 3800, maxDur: 0.34, fadeOut: 0.08 },
      ],
    };
  })),

  // 10. GOALKEEPER LATEX SAVE (Real Padded Glove Parry)
  ...([0, 1, 2, 3].map(idx => {
    const pitch = [1.0, 1.04, 0.96, 1.06][idx];
    const files = idx === 0 ? ['keeper_save.wav', 'variants/save_v1.wav'] : [`variants/save_v${idx}.wav`];
    return {
      files,
      dur: 0.34, norm: 0.86, sat: 1.03, room: 0.06, stereoWide: true, boxDip: -2.2, presence: 2.4, airShelf: 0.4, subHp: 60, lp: 5800,
      model: { type: 'leather_strike_natural', pitch: 0.88 * pitch, power: 0.72, seed: 800 + idx * 17 },
      layers: [
        { key: 'glove_punch', offsetSec: 'auto', gain: 0.88, rate: pitch, hp: 75, lp: 4600, maxDur: 0.30, fadeOut: 0.06 },
        { key: 'punch_impact_strong', offsetSec: 'auto', gain: 0.42, rate: pitch * 1.04, hp: 180, lp: 4800, maxDur: 0.20 },
      ],
    };
  })),

  // 11. STEAL SWIPE & AIR WHOOSH (Warm Clean Poke + Air Whip — NO harsh sand hiss!)
  ...([0, 1, 2, 3, 4, 5].map(idx => {
    const pitch = [1.0, 1.04, 0.96, 1.07, 0.95, 1.02][idx];
    const files = idx === 0 ? ['steal_swipe.wav', 'variants/steal_v1.wav'] : [`variants/steal_v${idx}.wav`];
    return {
      files,
      dur: 0.22, norm: 0.83, sat: 1.02, room: 0.04, stereoWide: true, boxDip: -1.8, presence: 2.0, airShelf: 0.4, subHp: 90, lp: 6200,
      layers: [
        { key: 'bball_poke_hit', offsetSec: 'auto', gain: 0.84, rate: pitch, hp: 95, lp: 5600, maxDur: 0.20 },
        { key: 'bball_hand_catch', offsetSec: 'auto', gain: 0.56, rate: pitch * 1.06, hp: 160, lp: 4800, maxDur: 0.16 },
      ],
    };
  })),
  {
    files: ['steal_swoosh.wav', 'variants/steal_swoosh_v1.wav'],
    dur: 0.22, norm: 0.80, sat: 1.01, room: 0.04, stereoWide: false, boxDip: -1.4, presence: 1.8, airShelf: -0.6, subHp: 110, lp: 4200,
    model: { type: 'warm_air_whoosh', pitch: 1.0, seed: 950 },
    layers: [
      { key: 'fast_swoosh', offsetSec: 'peak-0.06', gain: 0.72, rate: 1.12, hp: 130, lp: 3200, maxDur: 0.19, fadeOut: 0.05 },
    ],
  },

  // 12. FOOTSTEPS (Natural Grass Cleat Thuds & Crisp Court Soles) & CLEAN NBA SNEAKER SQUEAKS
  ...([0, 1, 2].map(idx => {
    const pitch = [1.0, 0.94, 1.07][idx];
    const files = idx === 0 ? ['sprint_step.wav'] : [`variants/step_v${idx}.wav`];
    return {
      files,
      dur: 0.13, norm: 0.76, sat: 1.01, room: 0.02, boxDip: -1.8, presence: 2.0, airShelf: 0.0, subHp: 75, lp: 3800,
      model: { type: 'leather_strike_natural', pitch: pitch * 0.78, power: 0.45, seed: 1000 + idx * 11 },
      layers: [
        { key: 'sand_body_fall', offsetSec: 'auto', gain: 0.80, rate: pitch * 1.10, hp: 110, lp: 3200, maxDur: 0.11, fadeOut: 0.03 },
      ],
    };
  })),
  ...([0, 1, 2].map(idx => {
    const pitch = [1.0, 1.05, 0.95][idx];
    const files = idx === 0 ? ['sprint_step_court.wav', 'variants/step_court_v1.wav'] : ['variants/step_court_v2.wav'];
    return {
      files,
      dur: 0.12, norm: 0.78, sat: 1.01, room: 0.04, boxDip: -1.6, presence: 2.6, airShelf: 0.4, subHp: 95, lp: 5200,
      layers: [
        { key: 'bball_hand_catch', offsetSec: 'auto', gain: 0.64, rate: pitch * 1.18, hp: 260, lp: 4200, maxDur: 0.09, fadeOut: 0.03 },
        { key: 'bball_hit_court', offsetSec: 'auto', gain: 0.56, rate: pitch * 1.12, hp: 120, lp: 3600, maxDur: 0.10, fadeOut: 0.03 },
      ],
    };
  })),
  ...([0, 1].map(idx => {
    const pitch = idx === 0 ? 1.0 : 1.06;
    const files = idx === 0 ? ['sneaker_squeak.wav'] : ['variants/squeak_v1.wav'];
    return {
      files,
      dur: 0.22, norm: 0.80, sat: 1.01, room: 0.06, stereoWide: true, boxDip: -1.8, presence: 1.6, airShelf: -1.2, subHp: 420, lp: 5400,
      layers: [
        { key: 'real_squeak', offsetSec: 'auto', gain: 0.88, rate: pitch * 0.92, hp: 580, lp: 4800, maxDur: 0.19, fadeOut: 0.03 },
        { key: 'bball_hit_court', offsetSec: 'auto', gain: 0.28, rate: pitch, hp: 140, lp: 3200, maxDur: 0.11 },
      ],
    };
  })),

  // 13. REAL REFEREE WHISTLES & ARENA BUZZER (Only genuine pea whistles!)
  ...([0, 1, 2, 3].map(idx => {
    const pitch = [1.0, 1.02, 0.97, 1.04][idx];
    const doubleBlast = (idx === 2 || idx === 3);
    const files = idx === 0 ? ['whistle.wav', 'referee_whistle.wav'] : [`variants/whistle_v${idx}.wav`];
    return {
      files,
      dur: doubleBlast ? 0.64 : 0.42, norm: 0.78, sat: 1.01, room: 0.11, stereoWide: true, boxDip: -1.5, presence: 0.4, airShelf: -1.6, subHp: 520, lp: 6600,
      layers: doubleBlast
        ? [
            { key: 'referee_police_whistle', offsetSec: 'auto', gain: 0.84, rate: pitch, hp: 700, lp: 6000, maxDur: 0.19, fadeOut: 0.03 },
            { key: 'referee_whistle_loud', offsetSec: 'auto', delay: 0.24, gain: 0.84, rate: pitch * 0.99, hp: 700, lp: 6000, maxDur: 0.34, fadeOut: 0.06 },
          ]
        : [
            { key: idx % 2 === 0 ? 'referee_police_whistle' : 'referee_whistle_loud', offsetSec: 'auto', gain: 0.88, rate: pitch, hp: 700, lp: 6000, maxDur: 0.38, fadeOut: 0.06 },
          ],
    };
  })),
  {
    files: ['hoops_buzzer.wav'],
    dur: 0.88, norm: 0.82, sat: 1.02, room: 0.14, stereoWide: true, boxDip: -1.8, presence: 1.2, airShelf: 0.2, subHp: 90, lp: 6400,
    layers: [
      { key: 'bball_buzzer', offsetSec: 0.06, gain: 0.94, rate: 1.0, hp: 100, lp: 5400, maxDur: 0.84, fadeIn: 0.015, fadeOut: 0.12 },
    ],
  },

  // 14. WIDE-STEREO STADIUM CELEBRATIONS & AMBIENCE LOOPS
  ...([0, 1, 2, 3, 4, 5].map(idx => {
    const files = idx === 0 ? ['celebration.wav', 'variants/celebrate_v1.wav'] : [`variants/celebrate_v${idx}.wav`];
    return {
      files,
      dur: 2.40, norm: 0.85, sat: 1.01, room: 0.14, stereoWide: true, boxDip: -3.2, presence: 1.8, airShelf: 0.4, subHp: 90, lp: 6800,
      layers: [
        { key: idx % 2 === 0 ? 'stadium_crowd_roar' : 'crowd_victory', offsetSec: 3.5 + idx * 0.4, gain: 0.88, rate: 1.0, hp: 100, lp: 6200, maxDur: 2.35, fadeIn: 0.04, fadeOut: 0.35 },
        { key: 'stadium_applause', offsetSec: 3.4 + idx * 0.3, gain: 0.72, rate: 1.0, hp: 160, lp: 6400, maxDur: 2.35, fadeIn: 0.06, fadeOut: 0.38 },
      ],
    };
  })),
  {
    files: ['crowd_cheer.wav'],
    dur: 1.45, norm: 0.82, sat: 1.01, room: 0.10, stereoWide: true, boxDip: -2.8, presence: 1.8, subHp: 95, lp: 6600,
    layers: [
      { key: 'crowd_stadium_yell', offsetSec: 0.85, gain: 0.84, rate: 1.0, hp: 110, lp: 6000, maxDur: 1.40, fadeIn: 0.05, fadeOut: 0.32 },
      { key: 'stadium_applause', offsetSec: 4.10, gain: 0.74, rate: 1.0, hp: 160, lp: 6200, maxDur: 1.38, fadeIn: 0.06, fadeOut: 0.32 },
    ],
  },
  {
    files: ['ambience_footy.wav'],
    dur: 4.00, norm: 0.46, sat: 1.0, room: 0.0, stereoWide: true, boxDip: -3.8, presence: 0.6, airShelf: -0.8, subHp: 110, lp: 3800, seamlessLoop: true,
    layers: [
      { key: 'stadium_crowd_roar', offsetSec: 4.6, gain: 0.72, rate: 0.98, hp: 120, lp: 3400, maxDur: 4.5 },
      { key: 'stadium_applause', offsetSec: 4.2, gain: 0.36, rate: 0.96, hp: 180, lp: 3600, maxDur: 4.5 },
    ],
  },
  {
    files: ['ambience_hoops.wav'],
    dur: 4.00, norm: 0.58, sat: 1.0, room: 0.0, stereoWide: true, boxDip: -3.2, presence: 0.8, airShelf: -0.6, subHp: 110, lp: 3800, seamlessLoop: true,
    layers: [
      { key: 'stadium_applause', offsetSec: 4.2, gain: 0.76, rate: 0.94, hp: 125, lp: 3400, maxDur: 4.5 },
      { key: 'stadium_crowd_roar', offsetSec: 5.5, gain: 0.54, rate: 1.00, hp: 115, lp: 3100, maxDur: 4.5 },
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

      // Clean zero-sweep physical transient shaping (NO swept-sine electronic bloops!)
      window.__renderPhysicalModel = (ctx, dest, spec) => {
        const SR = ctx.sampleRate;
        const p = spec.pitch || 1.0;
        const sd = spec.seed || 77;
        const len = Math.floor(SR * 0.35);
        const buf = ctx.createBuffer(2, len, SR);
        const c0 = buf.getChannelData(0), c1 = buf.getChannelData(1);

        let rngState = sd >>> 0;
        const rnd = () => { rngState = (rngState * 1664525 + 1013904223) >>> 0; return (rngState / 2147483648) - 1; };

        if (spec.type === 'leather_strike_natural') {
          const pw = spec.power || 1.0;
          // Static damped bladder modes (no pitch sweep) + short 4ms warm bandpass leather snap (real organic boot thwack!)
          let b1 = 0, b2 = 0, hpPrev = 0, hpOut = 0;
          for (let i = 0; i < Math.floor(SR * 0.12); i++) {
            const t = i / SR;
            const bodyMode = (Math.sin(2 * Math.PI * 76 * p * t) * 0.48 * Math.exp(-t * 36) +
                              Math.sin(2 * Math.PI * 164 * p * t) * 0.32 * Math.exp(-t * 62)) * (1 - Math.exp(-t * 1600));
            const rawTap = rnd() * Math.exp(-t * 280);
            b1 = b1 * 0.62 + rawTap * 0.38;
            b2 = b2 * 0.62 + b1 * 0.38;
            hpOut = 0.72 * (hpOut + b2 - hpPrev);
            hpPrev = b2;
            const snap = Math.tanh(hpOut * 3.8) * 0.78 * (1 - Math.exp(-t * 3200));
            const s = (bodyMode + snap) * 0.76 * pw;
            c0[i] = s; c1[i] = s;
          }
        } else if (spec.type === 'hoops_chamber_bounce') {
          let b1 = 0;
          for (let i = 0; i < Math.floor(SR * 0.10); i++) {
            const t = i / SR;
            const cavity = Math.sin(2 * Math.PI * 124 * p * t) * 0.42 * Math.exp(-t * 42) +
                           Math.sin(2 * Math.PI * 265 * p * t) * 0.22 * Math.exp(-t * 68);
            const rawClick = rnd() * Math.exp(-t * 340);
            b1 = b1 * 0.52 + rawClick * 0.48;
            const mapleClick = b1 * 0.48 * (1 - Math.exp(-t * 3600));
            const s = (cavity + mapleClick) * 0.74;
            c0[i] = s; c1[i] = s;
          }
        } else if (spec.type === 'dunk_natural_boom') {
          let lp = 0;
          for (let i = 0; i < Math.floor(SR * 0.18); i++) {
            const t = i / SR;
            const sub = Math.tanh(Math.sin(2 * Math.PI * 52 * p * t) * 1.6) * Math.exp(-t * 18) * 0.44;
            lp = lp * 0.56 + rnd() * 0.44;
            const transientCrack = lp * Math.exp(-t * 220) * 0.42;
            const s = sub + transientCrack;
            c0[i] = s; c1[i] = s;
          }
        } else if (spec.type === 'warm_air_whoosh') {
          let bMid = 0, bMid2 = 0, bSide = 0;
          for (let i = 0; i < Math.floor(SR * 0.18); i++) {
            const t = i / SR;
            const env = Math.sin(Math.min(1, t / 0.16) * Math.PI);
            const rM = rnd(), rS = rnd();
            bMid = bMid * 0.78 + rM * 0.22;
            bMid2 = bMid2 * 0.78 + bMid * 0.22;
            bSide = bSide * 0.82 + rS * 0.18;
            c0[i] = (bMid2 * 0.76 + bSide * 0.24) * env * 0.56;
            c1[i] = (bMid2 * 0.76 - bSide * 0.24) * env * 0.56;
          }
        }

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
          window.__renderPhysicalModel(off, masterHp, rec.model);
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

        const roomAmt = rec.room || 0;
        const lOut = new Float32Array(totalFrames), rOut = new Float32Array(totalFrames);
        const d1 = Math.floor(SR * 0.011), d2 = Math.floor(SR * 0.019), d3 = Math.floor(SR * 0.031);
        const wideTap = rec.stereoWide ? Math.floor(SR * 0.009) : 0;
        for (let i = 0; i < totalFrames; i++) {
          let l = ch0[i];
          let r = wideTap && i >= wideTap ? (ch1[i] * 0.88 + ch0[i - wideTap] * 0.12) : ch1[i];
          if (roomAmt > 0) {
            l += ((i >= d1 ? ch1[i - d1] : 0) * 0.46 + (i >= d3 ? ch0[i - d3] : 0) * 0.28) * roomAmt;
            r += ((i >= d2 ? ch0[i - d2] : 0) * 0.46 + (i >= d3 ? ch1[i - d3] : 0) * 0.28) * roomAmt;
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
