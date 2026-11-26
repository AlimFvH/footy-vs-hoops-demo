'use strict';

/**
 * v8.0 Real-Stem Studio Sports Audio Mastering Engine (44.1kHz Stereo)
 *
 * Uses ALL authentic real recordings in scratch/raw_sports_sfx & scratch/raw_audio,
 * automatically trimming leading silence down to the true transient attack (< 6ms onset!),
 * layering organic studio stems + early stadium/arena room reflections, and shaping
 * punchy leather/wood/turf dynamics without synthetic oscillator buzzer artifacts.
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

const PORT = 8799;
const CDP_PORT = 9255;

const SOURCE_MAP = {
  soccer_kick_power: path.join(RAW_SFX, 'soccer_kick_power.mp3'),
  soccer_quick_kick: path.join(RAW_SFX, 'soccer_quick_kick.mp3'),
  soccer_ball_hit: path.join(RAW_SFX, 'soccer_ball_hit.mp3'),
  bball_bounce: path.join(RAW_SFX, 'bball_bounce.mp3'),
  bball_bounce_2: path.join(RAW_SFX, 'bball_bounce_2.mp3'),
  bball_bounce_floor: path.join(RAW_SFX, 'bball_bounce_floor.mp3'),
  bball_hit_court: path.join(RAW_SFX, 'bball_hit_court.mp3'),
  bball_hand_catch: path.join(RAW_SFX, 'bball_hand_catch.mp3'),
  bball_poke_hit: path.join(RAW_SFX, 'bball_poke_hit.mp3'),
  bball_ball_hit: path.join(RAW_SFX, 'bball_ball_hit.mp3'),
  bball_dunk_hard: path.join(RAW_SFX, 'bball_dunk_hard.mp3'),
  bball_rim_1: path.join(RAW_SFX, 'bball_rim_1.mp3'),
  bball_net_swish: path.join(RAW_SFX, 'bball_net_swish.mp3'),
  bball_buzzer: path.join(RAW_SFX, 'bball_buzzer.mp3'),
  court_squeak: path.join(RAW_SFX, 'court_squeak.mp3'),
  rubber_squeak: path.join(RAW_AUD, 'rubber_squeak.mp3'),
  glove_punch: path.join(RAW_AUD, 'glove_punch.mp3'),
  metal_hammer_hit: path.join(RAW_SFX, 'metal_hammer_hit.mp3'),
  metal_grill_hit: path.join(RAW_SFX, 'metal_grill_hit.mp3'),
  grass_slide_1: path.join(RAW_SFX, 'grass_slide_1.mp3'),
  grass_slide_4: path.join(RAW_SFX, 'grass_slide_4.mp3'),
  grass_step: path.join(RAW_SFX, 'grass_step.mp3'),
  grass_heavy: path.join(RAW_SFX, 'grass_heavy.mp3'),
  fast_air_sweep: path.join(RAW_SFX, 'fast_air_sweep.mp3'),
  referee_police_whistle: path.join(RAW_SFX, 'referee_police_whistle.mp3'),
  referee_whistle_loud: path.join(RAW_SFX, 'referee_whistle_loud.mp3'),
  stadium_crowd_roar: path.join(RAW_SFX, 'stadium_crowd_roar.mp3'),
  stadium_crowd_joy: path.join(RAW_SFX, 'stadium_crowd_joy.mp3'),
  stadium_applause: path.join(RAW_SFX, 'stadium_applause.mp3'),
  crowd_stadium_yell: path.join(RAW_SFX, 'crowd_stadium_yell.mp3'),
  crowd_victory: path.join(RAW_AUD, 'crowd_victory.mp3'),
};

const RECIPES = [
  // 1. FOOTBALL POWER STRIKE (Real Stadium Leather Boot Kick + Crisp Audible Stud-Leather Crack)
  ...([0, 1, 2, 3, 4, 5].map(idx => {
    const pitch = [1.0, 1.04, 0.96, 1.07, 0.98, 1.02][idx];
    const files = idx === 0 ? ['kick_power_strike.wav', 'variants/kick_v1.wav'] : [`variants/kick_v${idx}.wav`];
    return {
      files,
      dur: 0.44, norm: 0.88, sat: 1.04, room: 0.05, boxDip: -3.2, presence: 4.8, airShelf: 2.6, subHp: 95, lp: 9800,
      synth: { type: 'leather_snap', pitch, strength: 1.75, seed: 100 + idx * 17 },
      layers: [
        { key: 'soccer_kick_power', offsetSec: 'auto', gain: 0.65, rate: pitch, hp: 92, lp: 4800, maxDur: 0.42 },
        { key: 'soccer_ball_hit', offsetSec: 'auto', gain: 0.82, rate: pitch * 1.22, hp: 260, lp: 7800, maxDur: 0.24 },
      ],
    };
  })),

  // 2. FOOTBALL CRISP PASS (Real Side-Foot Quick Kick — Punchy Mid-Leather Audible on Mobile Speakers)
  ...([0, 1, 2, 3].map(idx => {
    const pitch = [1.0, 1.05, 0.95, 1.09][idx];
    const files = idx === 0 ? ['pass_footy.wav', 'variants/pass_footy_v1.wav'] : [`variants/pass_footy_v${idx}.wav`];
    return {
      files,
      dur: 0.24, norm: 0.86, sat: 1.02, room: 0.03, boxDip: -2.8, presence: 4.2, airShelf: 1.8, subHp: 115, lp: 9200,
      synth: { type: 'leather_snap', pitch: pitch * 1.15, strength: 1.35, seed: 200 + idx * 13 },
      layers: [
        { key: 'soccer_quick_kick', offsetSec: 'auto', gain: 0.62, rate: pitch * 1.06, hp: 120, lp: 6400, maxDur: 0.22 },
      ],
    };
  })),

  // 3. FOOTBALL GRASS BOUNCE (Warm Turf Thump + Clear Soft Leather Surface Bounce)
  ...([0, 1, 2].map(idx => {
    const pitch = [0.96, 1.02, 0.92][idx];
    const files = idx === 0 ? ['bounce_footy.wav'] : [`variants/bounce_footy_v${idx}.wav`];
    return {
      files,
      dur: 0.20, norm: 0.82, sat: 1.01, room: 0.02, boxDip: -2.4, presence: 3.8, airShelf: 1.8, subHp: 125, lp: 7400,
      synth: { type: 'leather_snap', pitch: pitch * 0.98, strength: 1.55, seed: 260 + idx * 11 },
      layers: [
        { key: 'soccer_quick_kick', offsetSec: 'auto', gain: 0.45, rate: pitch * 1.06, hp: 130, lp: 3800, maxDur: 0.18 },
        { key: 'grass_heavy', offsetSec: 'auto', gain: 0.72, rate: pitch, hp: 220, lp: 6400, maxDur: 0.15 },
      ],
    };
  })),

  // 4. BASKETBALL DRIBBLE & COURT BOUNCE (Real NBA Hardwood Basketball Bounce Stems)
  ...([0, 1, 2].map(idx => {
    const pitch = [1.0, 1.04, 0.96][idx];
    const files = idx === 0 ? ['dribble.wav', 'ball_bounce.wav'] : (idx === 1 ? ['variants/dribble_v1.wav'] : ['variants/dribble_v2.wav']);
    return {
      files,
      dur: 0.23, norm: 0.86, sat: 1.03, room: 0.06, boxDip: -2.0, presence: 2.8, airShelf: 1.0, subHp: 56, lp: 9200,
      synth: { type: 'wood_tap', pitch, strength: 0.45, seed: 300 + idx * 19 },
      layers: [
        { key: idx % 2 === 0 ? 'bball_bounce' : 'bball_bounce_2', offsetSec: 'auto', gain: 0.90, rate: pitch, hp: 58, lp: 5800, maxDur: 0.21 },
        { key: 'bball_hit_court', offsetSec: 'auto', gain: 0.52, rate: pitch * 1.06, hp: 160, lp: 4500, maxDur: 0.15 },
      ],
    };
  })),

  // 5. BASKETBALL SHOT RELEASE / CHEST PASS (Real Palm Catch-Release + Crisp Leather Pop)
  ...([0, 1, 2, 3].map(idx => {
    const pitch = [1.0, 1.04, 0.96, 1.08][idx];
    const files = idx === 0 ? ['shot_hoops.wav', 'variants/shot_hoops_v1.wav'] : [`variants/shot_hoops_v${idx}.wav`];
    return {
      files,
      dur: 0.24, norm: 0.82, sat: 1.01, room: 0.04, boxDip: -1.6, presence: 2.4, airShelf: 1.2, subHp: 75, lp: 8600,
      synth: { type: 'wood_tap', pitch: pitch * 1.2, strength: 0.30, seed: 360 + idx * 17 },
      layers: [
        { key: 'bball_hand_catch', offsetSec: 'auto', gain: 0.85, rate: pitch, hp: 110, lp: 5200, maxDur: 0.21 },
        { key: 'bball_ball_hit', offsetSec: 'auto', gain: 0.46, rate: pitch * 1.08, hp: 220, lp: 6400, maxDur: 0.16 },
      ],
    };
  })),

  // 6. BASKETBALL SWISH (Real Net Swish Stem + Crisp High Nylon Rustle Layer)
  ...([0, 1, 2, 3, 4, 5].map(idx => {
    const pitch = [1.0, 1.04, 0.96, 1.07, 0.94, 1.02][idx];
    const files = idx === 0 ? ['shot_swish.wav', 'variants/swish_v1.wav'] : [`variants/swish_v${idx}.wav`];
    return {
      files,
      dur: 0.46, norm: 0.85, sat: 1.01, room: 0.07, boxDip: -3.4, presence: 2.8, airShelf: 1.8, subHp: 240, lp: 9800,
      synth: { type: 'nylon_brush', pitch, seed: 420 + idx * 23 },
      layers: [
        { key: 'bball_net_swish', offsetSec: 'auto', gain: 0.95, rate: pitch, hp: 220, lp: 8800, maxDur: 0.44, fadeOut: 0.08 },
      ],
    };
  })),

  // 7. SLAM DUNK (Real Dunk Impact + Steel Rim Breakaway Snap + Real Net Swish Cascade!)
  ...([0, 1, 2, 3, 4, 5].map(idx => {
    const pitch = [1.0, 1.03, 0.97, 1.05, 0.95, 1.01][idx];
    const files = idx === 0 ? ['dunk_slam.wav', 'variants/dunk_v1.wav'] : [`variants/dunk_v${idx}.wav`];
    return {
      files,
      dur: 0.68, norm: 0.88, sat: 1.05, room: 0.10, boxDip: -2.4, presence: 2.6, airShelf: 1.4, subHp: 42, lp: 9600,
      synth: { type: 'leather_snap', pitch: 0.88 * pitch, strength: 0.55, seed: 500 + idx * 29 },
      layers: [
        { key: 'bball_dunk_hard', offsetSec: 'auto', gain: 0.90, rate: pitch, hp: 48, lp: 7200, maxDur: 0.42 },
        { key: 'bball_rim_1', offsetSec: 'auto', gain: 0.72, rate: pitch * 0.96, hp: 90, lp: 7600, maxDur: 0.28 },
        { key: 'metal_hammer_hit', offsetSec: 'auto', gain: 0.34, rate: pitch * 0.82, hp: 220, lp: 5800, maxDur: 0.32 },
        { key: 'bball_net_swish', offsetSec: 'auto', delay: 0.075, gain: 0.62, rate: pitch * 1.05, hp: 280, lp: 8800, maxDur: 0.45, fadeOut: 0.09 },
      ],
    };
  })),

  // 8. RIM CLANG, BACKBOARD GLASS & ALUMINUM GOALPOST (Real Metal & Bounce Stems)
  {
    files: ['rim_clang.wav'],
    dur: 0.40, norm: 0.85, sat: 1.03, room: 0.07, boxDip: -2.0, presence: 2.4, airShelf: 1.2, subHp: 75, lp: 9200,
    layers: [
      { key: 'bball_rim_1', offsetSec: 'auto', gain: 0.90, rate: 1.0, hp: 70, lp: 8200, maxDur: 0.35 },
      { key: 'metal_hammer_hit', offsetSec: 'auto', gain: 0.42, rate: 0.92, hp: 240, lp: 6400, maxDur: 0.36 },
      { key: 'bball_bounce_2', offsetSec: 'auto', gain: 0.38, rate: 1.05, hp: 110, lp: 3400, maxDur: 0.24 },
    ],
  },
  {
    files: ['backboard_hit.wav'],
    dur: 0.28, norm: 0.84, sat: 1.02, room: 0.06, boxDip: -2.2, presence: 3.0, airShelf: 1.6, subHp: 85, lp: 8200,
    synth: { type: 'wood_tap', pitch: 0.94, strength: 1.05, seed: 602 },
    layers: [
      { key: 'bball_bounce_floor', offsetSec: 0.001, gain: 0.70, rate: 1.02, hp: 85, lp: 3400, maxDur: 0.24, fadeOut: 0.06 },
      { key: 'bball_ball_hit', offsetSec: 'auto', gain: 0.78, rate: 1.06, hp: 200, lp: 6400, maxDur: 0.20 },
    ],
  },
  {
    files: ['goalpost_hit.wav'],
    dur: 0.56, norm: 0.86, sat: 1.03, room: 0.09, boxDip: -2.2, presence: 2.0, airShelf: 1.0, subHp: 75, lp: 9000,
    layers: [
      { key: 'metal_grill_hit', offsetSec: 'auto', gain: 0.78, rate: 0.90, hp: 140, lp: 7400, maxDur: 0.52 },
      { key: 'metal_hammer_hit', offsetSec: 'auto', gain: 0.48, rate: 0.74, hp: 220, lp: 6200, maxDur: 0.50 },
      { key: 'soccer_ball_hit', offsetSec: 'auto', gain: 0.52, rate: 1.08, hp: 85, lp: 3200, maxDur: 0.25 },
    ],
  },

  // 9. SLIDE TACKLE (Real Turf Slide Shear + Heavy Grass Body Thud)
  ...([0, 1, 2, 3, 4, 5].map(idx => {
    const pitch = [1.0, 1.04, 0.96, 1.06, 0.95, 1.02][idx];
    const files = idx === 0 ? ['slide_tackle.wav', 'variants/slide_v1.wav'] : [`variants/slide_v${idx}.wav`];
    return {
      files,
      dur: 0.52, norm: 0.85, sat: 1.02, room: 0.03, boxDip: -2.8, presence: 2.2, airShelf: 1.0, subHp: 68, lp: 8800,
      layers: [
        { key: idx % 2 === 0 ? 'grass_slide_1' : 'grass_slide_4', offsetSec: 'auto', gain: 0.95, rate: pitch, hp: 140, lp: 7200, maxDur: 0.48, fadeOut: 0.09 },
        { key: 'grass_heavy', offsetSec: 'auto', gain: 0.55, rate: pitch * 0.92, hp: 70, lp: 3600, maxDur: 0.32, fadeOut: 0.07 },
      ],
    };
  })),

  // 10. GOALKEEPER LATEX SAVE (Real Glove Thwack + Deflected Soccer Ball Impact)
  ...([0, 1, 2, 3].map(idx => {
    const pitch = [1.0, 1.04, 0.96, 1.06][idx];
    const files = idx === 0 ? ['keeper_save.wav', 'variants/save_v1.wav'] : [`variants/save_v${idx}.wav`];
    return {
      files,
      dur: 0.34, norm: 0.88, sat: 1.04, room: 0.05, boxDip: -2.2, presence: 2.6, airShelf: 1.2, subHp: 58, lp: 8400,
      synth: { type: 'leather_snap', pitch: 0.94 * pitch, strength: 0.48, seed: 800 + idx * 17 },
      layers: [
        { key: 'glove_punch', offsetSec: 'auto', gain: 0.85, rate: pitch, hp: 75, lp: 5200, maxDur: 0.30, fadeOut: 0.06 },
        { key: 'soccer_ball_hit', offsetSec: 'auto', gain: 0.65, rate: pitch * 1.08, hp: 90, lp: 3800, maxDur: 0.25 },
      ],
    };
  })),

  // 11. STEAL SWIPE & AIR WHOOSH (Real Poke Hit + Catch + Fast Air Sweep)
  ...([0, 1, 2, 3, 4, 5].map(idx => {
    const pitch = [1.0, 1.04, 0.96, 1.07, 0.95, 1.02][idx];
    const files = idx === 0 ? ['steal_swipe.wav', 'variants/steal_v1.wav'] : [`variants/steal_v${idx}.wav`];
    return {
      files,
      dur: 0.22, norm: 0.84, sat: 1.02, room: 0.03, boxDip: -1.8, presence: 2.2, airShelf: 0.8, subHp: 85, lp: 8600,
      layers: [
        { key: 'bball_poke_hit', offsetSec: 'auto', gain: 0.80, rate: pitch, hp: 95, lp: 6400, maxDur: 0.20 },
        { key: 'bball_hand_catch', offsetSec: 'auto', gain: 0.58, rate: pitch * 1.08, hp: 160, lp: 5200, maxDur: 0.16 },
      ],
    };
  })),
  {
    files: ['steal_swoosh.wav', 'variants/steal_swoosh_v1.wav'],
    dur: 0.24, norm: 0.84, sat: 1.01, room: 0.03, boxDip: -1.6, presence: 1.6, airShelf: 1.0, subHp: 140, lp: 7400,
    synth: { type: 'nylon_brush', pitch: 0.72, seed: 950 },
    layers: [
      { key: 'fast_air_sweep', offsetSec: 'peak-0.06', gain: 0.92, rate: 1.15, hp: 180, lp: 6200, maxDur: 0.22, fadeOut: 0.05 },
    ],
  },

  // 12. FOOTSTEPS & REAL NBA RUBBER SQUEAKS
  ...([0, 1, 2].map(idx => {
    const pitch = [1.0, 0.94, 1.07][idx];
    const files = idx === 0 ? ['sprint_step.wav'] : [`variants/step_v${idx}.wav`];
    return {
      files,
      dur: 0.14, norm: 0.78, sat: 1.0, room: 0.015, boxDip: -1.6, presence: 2.0, airShelf: 1.0, subHp: 85, lp: 7400,
      synth: { type: 'wood_tap', pitch: pitch * 0.9, strength: 0.45, seed: 1000 + idx * 11 },
      layers: [
        { key: idx === 1 ? 'grass_heavy' : 'grass_step', offsetSec: 'auto', gain: 0.92, rate: pitch, hp: 130, lp: 6200, maxDur: 0.12, fadeOut: 0.03 },
      ],
    };
  })),
  ...([0, 1, 2].map(idx => {
    const pitch = [1.0, 1.05, 0.95][idx];
    const files = idx === 0 ? ['sprint_step_court.wav', 'variants/step_court_v1.wav'] : ['variants/step_court_v2.wav'];
    return {
      files,
      dur: 0.13, norm: 0.74, sat: 1.01, room: 0.025, boxDip: -1.8, presence: 1.6, airShelf: 0.6, subHp: 90, lp: 6800,
      synth: { type: 'wood_tap', pitch: pitch * 1.1, strength: 0.35, seed: 1040 + idx * 11 },
      layers: [
        { key: 'bball_hit_court', offsetSec: 'auto', gain: 0.78, rate: pitch * 1.15, hp: 110, lp: 3800, maxDur: 0.11, fadeOut: 0.03 },
        ...(idx === 2 ? [{ key: 'court_squeak', offsetSec: 'auto', delay: 0.015, gain: 0.35, rate: 1.1, hp: 900, lp: 6400, maxDur: 0.09 }] : []),
      ],
    };
  })),
  ...([0, 1].map(idx => {
    const pitch = idx === 0 ? 1.0 : 1.08;
    const files = idx === 0 ? ['sneaker_squeak.wav'] : ['variants/squeak_v1.wav'];
    return {
      files,
      dur: 0.18, norm: 0.84, sat: 1.01, room: 0.04, boxDip: -2.0, presence: 2.0, airShelf: 0.6, subHp: 380, lp: 7600,
      layers: [
        { key: 'rubber_squeak', offsetSec: idx === 0 ? 0.042 : 0.25, gain: 0.85, rate: pitch, hp: 520, lp: 6800, maxDur: 0.15, fadeOut: 0.03 },
        { key: 'court_squeak', offsetSec: 'auto', gain: 0.50, rate: pitch * 1.05, hp: 620, lp: 6400, maxDur: 0.14, fadeOut: 0.03 },
      ],
    };
  })),

  // 13. REAL REFEREE WHISTLES & REAL ARENA BUZZER
  ...([0, 1, 2, 3].map(idx => {
    const pitch = [1.0, 1.02, 0.97, 1.04][idx];
    const doubleBlast = (idx === 2 || idx === 3);
    const files = idx === 0 ? ['whistle.wav', 'referee_whistle.wav'] : [`variants/whistle_v${idx}.wav`];
    return {
      files,
      dur: doubleBlast ? 0.64 : 0.42, norm: 0.80, sat: 1.01, room: 0.08, boxDip: -1.5, presence: 0.6, airShelf: -1.2, subHp: 500, lp: 7400,
      layers: doubleBlast
        ? [
            { key: 'referee_police_whistle', offsetSec: 'auto', gain: 0.88, rate: pitch, hp: 700, lp: 6800, maxDur: 0.19, fadeOut: 0.03 },
            { key: 'referee_whistle_loud', offsetSec: 'auto', delay: 0.24, gain: 0.88, rate: pitch * 0.99, hp: 700, lp: 6800, maxDur: 0.34, fadeOut: 0.06 },
          ]
        : [
            { key: idx % 2 === 0 ? 'referee_police_whistle' : 'referee_whistle_loud', offsetSec: 'auto', gain: 0.92, rate: pitch, hp: 700, lp: 6800, maxDur: 0.38, fadeOut: 0.06 },
          ],
    };
  })),
  {
    files: ['hoops_buzzer.wav'],
    dur: 0.88, norm: 0.84, sat: 1.02, room: 0.10, boxDip: -1.8, presence: 1.2, airShelf: 0.2, subHp: 90, lp: 6800,
    layers: [
      { key: 'bball_buzzer', offsetSec: 0.06, gain: 0.95, rate: 1.0, hp: 100, lp: 5800, maxDur: 0.84, fadeIn: 0.015, fadeOut: 0.12 },
    ],
  },

  // 14. STADIUM CELEBRATIONS & WARM NON-BOXY AMBIENCE LOOPS
  ...([0, 1, 2, 3, 4, 5].map(idx => {
    const files = idx === 0 ? ['celebration.wav', 'variants/celebrate_v1.wav'] : [`variants/celebrate_v${idx}.wav`];
    return {
      files,
      dur: 2.40, norm: 0.84, sat: 1.01, room: 0.10, boxDip: -3.6, presence: 1.8, airShelf: 0.6, subHp: 90, lp: 7800,
      layers: [
        { key: idx % 2 === 0 ? 'stadium_crowd_roar' : 'crowd_victory', offsetSec: 3.5 + idx * 0.4, gain: 0.90, rate: 1.0, hp: 100, lp: 6800, maxDur: 2.35, fadeIn: 0.04, fadeOut: 0.35 },
        { key: idx % 3 === 0 ? 'stadium_crowd_joy' : 'stadium_applause', offsetSec: 3.4 + idx * 0.3, gain: 0.72, rate: 1.0, hp: 160, lp: 7400, maxDur: 2.35, fadeIn: 0.06, fadeOut: 0.38 },
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
  res.end('<!doctype html><html><body>Studio Audio DSP Host v8.0</body></html>');
});

server.listen(PORT, '127.0.0.1', async () => {
  const udir = fs.mkdtempSync(path.join(os.tmpdir(), 'fvh-aud-v8-'));
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

  // Decode all raw studio stems and detect exact onset/peak timing automatically
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

      window.__noiseBurst = (ctx, dest, seed, start, dur, amp, ftype, f0, f1, q, atk) => {
        const src = ctx.createBufferSource();
        src.buffer = window.__buildNoiseBuf(ctx, dur + 0.04, seed);
        const flt = ctx.createBiquadFilter();
        flt.type = ftype || 'bandpass';
        flt.frequency.setValueAtTime(f0, start);
        if (f1 && f1 !== f0) flt.frequency.exponentialRampToValueAtTime(Math.max(40, f1), start + dur);
        if (q) flt.Q.value = q;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, start);
        g.gain.linearRampToValueAtTime(amp, start + (atk || 0.001));
        g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        src.connect(flt); flt.connect(g); g.connect(dest);
        src.start(start); src.stop(start + dur + 0.02);
      };

      // Strictly organic micro-transient shaping only (no tonal synth oscillators!)
      window.__renderOrganicTransient = (ctx, dest, spec) => {
        const p = spec.pitch || 1.0;
        const sd = spec.seed || 77;
        const st = spec.strength || 1.0;
        if (spec.type === 'leather_snap') {
          window.__noiseBurst(ctx, dest, sd, 0, 0.018, 0.65 * st, 'bandpass', 2100 * p, 950 * p, 0.72, 0.001);
          window.__noiseBurst(ctx, dest, sd + 5, 0, 0.010, 0.42 * st, 'bandpass', 3900 * p, 2400 * p, 0.85, 0.001);
        } else if (spec.type === 'wood_tap') {
          window.__noiseBurst(ctx, dest, sd, 0, 0.015, 0.55 * st, 'bandpass', 1800 * p, 820 * p, 0.90, 0.001);
        } else if (spec.type === 'nylon_brush') {
          window.__noiseBurst(ctx, dest, sd, 0.002, 0.095, 0.38, 'bandpass', 2400 * p, 4200 * p, 1.1, 0.008);
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
        pres.type = 'peaking'; pres.frequency.value = 2600; pres.Q.value = 0.75; pres.gain.value = rec.presence || 1.6;
        const air = off.createBiquadFilter();
        air.type = 'highshelf'; air.frequency.value = 5200; air.gain.value = rec.airShelf || 0.8;
        const topLp = off.createBiquadFilter();
        topLp.type = 'lowpass'; topLp.frequency.value = rec.lp || 9500; topLp.Q.value = 0.6;

        masterHp.connect(boxDip); boxDip.connect(pres); pres.connect(air); air.connect(topLp); topLp.connect(off.destination);

        if (rec.synth) {
          window.__renderOrganicTransient(off, masterHp, rec.synth);
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

  console.log(`✓ Mastered ${written} real-stem acoustic v8.0 sports SFX WAVs into assets/audio/!`);
  ws.close(); br.kill(); server.close();
  setTimeout(() => { try { fs.rmSync(udir, { recursive: true, force: true }); } catch (_) {} process.exit(0); }, 250);
});
