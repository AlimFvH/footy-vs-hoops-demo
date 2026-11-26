'use strict';

/**
 * v6.0 Crystal Broadcast Audio Mastering Engine (Chromium OfflineAudioContext 44.1kHz Stereo)
 *
 * Upgrades over v4.9:
 *  - Eliminates comb-filter room slapback baked into short impact WAVs (`room <= 0.04` on percussion)
 *  - Cleans sub-45Hz rumble via high-pass filters + adds broadcast presence EQ (+2.5..+3.5dB @ 3.6kHz)
 *  - Brightens passes, basketball dribbles, swishes, rim hits, saves & turf slides for zero mud
 *  - Opens up stadium crowd ambience spectrum (`3.4kHz`) with seamless 0.45s equal-power loops
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

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const EXE = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;

const PORT = 8799;
const CDP_PORT = 9253;

const SOURCE_MAP = {
  soccer_kick_power: path.join(RAW_SFX, 'soccer_kick_power.mp3'),
  soccer_quick_kick: path.join(RAW_SFX, 'soccer_quick_kick.mp3'),
  soccer_ball_hit: path.join(RAW_SFX, 'soccer_ball_hit.mp3'),
  bball_dunk_hard: path.join(RAW_SFX, 'bball_dunk_hard.mp3'),
  bball_rim_1: path.join(RAW_SFX, 'bball_rim_1.mp3'),
  bball_net_swish: path.join(RAW_SFX, 'bball_net_swish.mp3'),
  bball_bounce_floor: path.join(RAW_SFX, 'bball_bounce_floor.mp3'),
  bball_bounce: path.join(RAW_SFX, 'bball_bounce.mp3'),
  bball_bounce_2: path.join(RAW_SFX, 'bball_bounce_2.mp3'),
  bball_ground_hit: path.join(RAW_SFX, 'bball_ground_hit.mp3'),
  bball_hand_catch: path.join(RAW_SFX, 'bball_hand_catch.mp3'),
  bball_catch: path.join(RAW_SFX, 'bball_catch.mp3'),
  bball_hit_court: path.join(RAW_SFX, 'bball_hit_court.mp3'),
  bball_poke_hit: path.join(RAW_SFX, 'bball_poke_hit.mp3'),
  bball_buzzer: path.join(RAW_SFX, 'bball_buzzer.mp3'),
  grass_slide_4: path.join(RAW_SFX, 'grass_slide_4.mp3'),
  grass_slide_1: path.join(RAW_SFX, 'grass_slide_1.mp3'),
  grass_step: path.join(RAW_SFX, 'grass_step.mp3'),
  grass_heavy: path.join(RAW_SFX, 'grass_heavy.mp3'),
  grass_walk: path.join(RAW_SFX, 'grass_walk.mp3'),
  court_squeak: path.join(RAW_SFX, 'court_squeak.mp3'),
  rubber_squeak: path.join(RAW_AUD, 'rubber_squeak.mp3'),
  fast_air_sweep: path.join(RAW_SFX, 'fast_air_sweep.mp3'),
  fast_swoosh: path.join(RAW_SFX, 'fast_swoosh.mp3'),
  glove_punch: path.join(RAW_AUD, 'glove_punch.mp3'),
  punch_body_heavy: path.join(RAW_SFX, 'punch_body_heavy.mp3'),
  punch_impact_strong: path.join(RAW_SFX, 'punch_impact_strong.mp3'),
  sand_body_fall: path.join(RAW_SFX, 'sand_body_fall.mp3'),
  metal_grill_hit: path.join(RAW_SFX, 'metal_grill_hit.mp3'),
  metal_hammer_hit: path.join(RAW_SFX, 'metal_hammer_hit.mp3'),
  referee_whistle_loud: path.join(RAW_SFX, 'referee_whistle_loud.mp3'),
  referee_police_whistle: path.join(RAW_SFX, 'referee_police_whistle.mp3'),
  stadium_crowd_roar: path.join(RAW_SFX, 'stadium_crowd_roar.mp3'),
  stadium_applause: path.join(RAW_SFX, 'stadium_applause.mp3'),
  crowd_stadium_yell: path.join(RAW_SFX, 'crowd_stadium_yell.mp3'),
  crowd_victory: path.join(RAW_AUD, 'crowd_victory.mp3'),
};

const RECIPES = [
  // 1. FOOTBALL POWER STRIKE / SHOT (Tight Cannon Thump + Crisp Leather/Cleat Crack)
  {
    files: ['kick_power_strike.wav', 'variants/kick_v1.wav'],
    dur: 0.44, norm: 0.96, sat: 1.07, room: 0.03, presence: 7.8, airShelf: 5.5, boxDip: -6.2, subHp: 50,
    layers: [
      { key: 'soccer_kick_power', gain: 1.25, rate: 1.03, hp: 52, maxDur: 0.40 },
      { key: 'soccer_ball_hit', gain: 1.00, rate: 1.08, hp: 320, maxDur: 0.26, delay: 0.001 },
      { key: 'bball_poke_hit', gain: 1.45, rate: 1.18, hp: 900, maxDur: 0.065 },
      { key: 'punch_body_heavy', gain: 0.55, rate: 0.98, hp: 48, lp: 130, maxDur: 0.16 },
    ]
  },
  {
    files: ['variants/kick_v2.wav'],
    dur: 0.46, norm: 0.96, sat: 1.08, room: 0.03, presence: 7.8, airShelf: 5.5, boxDip: -6.2, subHp: 50,
    layers: [
      { key: 'soccer_kick_power', gain: 1.32, rate: 0.97, hp: 50, maxDur: 0.42 },
      { key: 'punch_impact_strong', gain: 0.90, rate: 1.04, hp: 460, maxDur: 0.15 },
      { key: 'bball_poke_hit', gain: 1.45, rate: 1.14, hp: 950, maxDur: 0.065 },
      { key: 'punch_body_heavy', gain: 0.62, rate: 0.92, hp: 48, lp: 135, maxDur: 0.18 },
    ]
  },
  {
    files: ['variants/kick_v3.wav'],
    dur: 0.38, norm: 0.95, sat: 1.05, room: 0.02, presence: 7.8, airShelf: 5.5, boxDip: -5.8, subHp: 55,
    layers: [
      { key: 'soccer_quick_kick', gain: 1.30, rate: 1.02, hp: 60, maxDur: 0.32 },
      { key: 'soccer_ball_hit', gain: 1.08, rate: 1.09, hp: 340, maxDur: 0.24 },
      { key: 'bball_poke_hit', gain: 1.50, rate: 1.20, hp: 950, maxDur: 0.060 },
    ]
  },
  {
    files: ['variants/kick_v4.wav'],
    dur: 0.42, norm: 0.95, sat: 1.06, room: 0.03, presence: 7.8, airShelf: 5.5, boxDip: -5.8, subHp: 52,
    layers: [
      { key: 'fast_swoosh', gain: 0.34, rate: 1.30, hp: 1000, maxDur: 0.085 },
      { key: 'soccer_kick_power', gain: 1.30, rate: 1.07, hp: 52, delay: 0.015, maxDur: 0.38 },
      { key: 'bball_poke_hit', gain: 1.45, rate: 1.12, hp: 900, delay: 0.016, maxDur: 0.065 },
    ]
  },
  {
    files: ['variants/kick_v5.wav'],
    dur: 0.44, norm: 0.96, sat: 1.07, room: 0.03, presence: 7.8, airShelf: 5.5, boxDip: -6.2, subHp: 50,
    layers: [
      { key: 'soccer_kick_power', gain: 1.25, rate: 0.99, hp: 52, maxDur: 0.40 },
      { key: 'bball_poke_hit', gain: 1.45, rate: 1.16, hp: 950, delay: 0.001, maxDur: 0.065 },
      { key: 'punch_body_heavy', gain: 0.58, rate: 0.94, hp: 48, lp: 130, maxDur: 0.16 },
    ]
  },

  // 2. FOOTBALL PASS (Razor-Crisp Cleat Tap + Leather Click, Short Clean Decay)
  {
    files: ['pass_footy.wav', 'variants/pass_footy_v1.wav'],
    dur: 0.24, norm: 0.92, sat: 1.03, room: 0.02, presence: 7.2, airShelf: 5.0, boxDip: -6.0, subHp: 75,
    layers: [
      { key: 'soccer_quick_kick', gain: 1.25, rate: 1.10, hp: 75, maxDur: 0.20 },
      { key: 'bball_poke_hit', gain: 0.95, rate: 1.22, hp: 950, maxDur: 0.048 },
      { key: 'bball_hand_catch', gain: 0.55, rate: 1.25, hp: 1200, maxDur: 0.045 },
    ]
  },
  {
    files: ['variants/pass_footy_v2.wav'],
    dur: 0.23, norm: 0.90, sat: 1.03, room: 0.02, presence: 7.2, airShelf: 5.0, boxDip: -6.0, subHp: 75,
    layers: [
      { key: 'soccer_quick_kick', gain: 1.30, rate: 1.16, hp: 80, maxDur: 0.19 },
      { key: 'bball_poke_hit', gain: 0.88, rate: 1.28, hp: 1050, maxDur: 0.045 },
      { key: 'bball_hand_catch', gain: 0.60, rate: 1.18, hp: 900, maxDur: 0.045 },
    ]
  },
  {
    files: ['variants/pass_footy_v3.wav'],
    dur: 0.25, norm: 0.92, sat: 1.03, room: 0.02, presence: 7.2, airShelf: 5.0, boxDip: -6.0, subHp: 75,
    layers: [
      { key: 'soccer_ball_hit', gain: 1.20, rate: 1.06, hp: 80, maxDur: 0.21 },
      { key: 'bball_poke_hit', gain: 0.92, rate: 1.18, hp: 1000, maxDur: 0.050 },
    ]
  },

  // 3. BASKETBALL SHOT RELEASE & CHEST PASS (Crisp Palm Pop + Air Whip)
  {
    files: ['shot_hoops.wav', 'variants/shot_hoops_v1.wav'],
    dur: 0.30, norm: 0.92, sat: 1.04, room: 0.03, presence: 3.0, subHp: 75,
    layers: [
      { key: 'bball_hand_catch', gain: 1.45, rate: 1.06, hp: 90, maxDur: 0.22 },
      { key: 'bball_poke_hit', gain: 0.75, rate: 1.14, hp: 450, maxDur: 0.16 },
      { key: 'fast_swoosh', gain: 0.44, rate: 1.24, hp: 700, delay: 0.010, maxDur: 0.20 },
    ]
  },
  {
    files: ['variants/shot_hoops_v2.wav'],
    dur: 0.28, norm: 0.92, sat: 1.04, room: 0.03, presence: 3.0, subHp: 75,
    layers: [
      { key: 'bball_hand_catch', gain: 1.50, rate: 0.98, hp: 90, maxDur: 0.22 },
      { key: 'bball_catch', gain: 0.85, rate: 1.14, hp: 220, maxDur: 0.18 },
      { key: 'fast_swoosh', gain: 0.36, rate: 1.16, hp: 750, delay: 0.008, maxDur: 0.18 },
    ]
  },
  {
    files: ['variants/shot_hoops_v3.wav'],
    dur: 0.30, norm: 0.92, sat: 1.04, room: 0.03, presence: 3.0, subHp: 75,
    layers: [
      { key: 'bball_catch', gain: 1.40, rate: 1.04, hp: 95, maxDur: 0.24 },
      { key: 'bball_poke_hit', gain: 0.70, rate: 1.00, hp: 400, maxDur: 0.18 },
      { key: 'fast_air_sweep', gain: 0.45, rate: 1.30, hp: 650, delay: 0.012, maxDur: 0.19 },
    ]
  },

  // 4. BASKETBALL SWISH (Crystal Clear Nylon Whip)
  {
    files: ['shot_swish.wav', 'variants/swish_v1.wav'],
    dur: 0.56, norm: 0.95, sat: 1.03, room: 0.04, presence: 3.6, subHp: 180,
    layers: [{ key: 'bball_net_swish', gain: 1.95, rate: 1.02, hp: 240, maxDur: 0.52 }]
  },
  {
    files: ['variants/swish_v2.wav'],
    dur: 0.58, norm: 0.95, sat: 1.03, room: 0.04, presence: 3.6, subHp: 160,
    layers: [
      { key: 'bball_rim_1', gain: 0.44, rate: 1.06, hp: 320, maxDur: 0.18 },
      { key: 'bball_net_swish', gain: 1.90, rate: 1.04, hp: 220, delay: 0.010, maxDur: 0.52 },
    ]
  },
  {
    files: ['variants/swish_v3.wav'],
    dur: 0.54, norm: 0.95, sat: 1.03, room: 0.04, presence: 3.6, subHp: 180,
    layers: [
      { key: 'bball_net_swish', gain: 1.90, rate: 0.96, hp: 220, maxDur: 0.50 },
      { key: 'fast_swoosh', gain: 0.26, rate: 1.26, hp: 1100, maxDur: 0.15 },
    ]
  },
  {
    files: ['variants/swish_v4.wav'],
    dur: 0.56, norm: 0.95, sat: 1.03, room: 0.04, presence: 3.6, subHp: 160,
    layers: [
      { key: 'bball_rim_1', gain: 0.34, rate: 0.98, hp: 340, maxDur: 0.16 },
      { key: 'bball_net_swish', gain: 1.95, rate: 1.08, hp: 220, delay: 0.008, maxDur: 0.50 },
    ]
  },
  {
    files: ['variants/swish_v5.wav'],
    dur: 0.52, norm: 0.95, sat: 1.03, room: 0.04, presence: 3.6, subHp: 180,
    layers: [{ key: 'bball_net_swish', gain: 2.00, rate: 1.00, hp: 240, maxDur: 0.48 }]
  },

  // 5. SLAM DUNK (Tight Rim Crack + Spring Ring + Clean Nylon + Sub Slam)
  {
    files: ['dunk_slam.wav', 'variants/dunk_v1.wav'],
    dur: 0.80, norm: 0.97, sat: 1.09, room: 0.06, presence: 3.2, subHp: 38,
    layers: [
      { key: 'bball_dunk_hard', gain: 1.85, rate: 1.02, hp: 50, maxDur: 0.38 },
      { key: 'bball_rim_1', gain: 2.05, rate: 1.00, hp: 240, delay: 0.003, maxDur: 0.55 },
      { key: 'punch_body_heavy', gain: 0.82, rate: 0.94, hp: 38, lp: 130, maxDur: 0.24 },
      { key: 'bball_net_swish', gain: 1.35, rate: 1.06, hp: 260, delay: 0.025, maxDur: 0.44 },
    ]
  },
  {
    files: ['variants/dunk_v2.wav'],
    dur: 0.82, norm: 0.97, sat: 1.09, room: 0.06, presence: 3.2, subHp: 38,
    layers: [
      { key: 'bball_dunk_hard', gain: 1.75, rate: 0.96, hp: 50, maxDur: 0.38 },
      { key: 'bball_rim_1', gain: 2.15, rate: 1.04, hp: 220, delay: 0.002, maxDur: 0.58 },
      { key: 'metal_grill_hit', gain: 0.45, rate: 0.96, hp: 650, delay: 0.006, maxDur: 0.46 },
      { key: 'bball_net_swish', gain: 1.40, rate: 1.02, hp: 250, delay: 0.022, maxDur: 0.44 },
    ]
  },
  {
    files: ['variants/dunk_v3.wav'],
    dur: 0.78, norm: 0.97, sat: 1.09, room: 0.06, presence: 3.2, subHp: 40,
    layers: [
      { key: 'bball_dunk_hard', gain: 1.95, rate: 1.00, hp: 48, maxDur: 0.40 },
      { key: 'bball_rim_1', gain: 1.75, rate: 0.96, hp: 240, delay: 0.005, maxDur: 0.50 },
      { key: 'punch_impact_strong', gain: 0.65, rate: 0.92, hp: 45, lp: 150, maxDur: 0.22 },
      { key: 'bball_net_swish', gain: 1.45, rate: 1.08, hp: 260, delay: 0.020, maxDur: 0.42 },
    ]
  },
  {
    files: ['variants/dunk_v4.wav'],
    dur: 0.80, norm: 0.97, sat: 1.09, room: 0.06, presence: 3.2, subHp: 40,
    layers: [
      { key: 'bball_dunk_hard', gain: 1.85, rate: 1.05, hp: 50, maxDur: 0.38 },
      { key: 'metal_hammer_hit', gain: 0.48, rate: 1.18, hp: 520, delay: 0.003, maxDur: 0.38 },
      { key: 'bball_rim_1', gain: 1.85, rate: 1.01, hp: 240, delay: 0.006, maxDur: 0.52 },
      { key: 'bball_net_swish', gain: 1.35, rate: 0.98, hp: 260, delay: 0.026, maxDur: 0.44 },
    ]
  },
  {
    files: ['variants/dunk_v5.wav'],
    dur: 0.80, norm: 0.97, sat: 1.09, room: 0.06, presence: 3.2, subHp: 38,
    layers: [
      { key: 'bball_dunk_hard', gain: 1.90, rate: 0.97, hp: 48, maxDur: 0.40 },
      { key: 'bball_rim_1', gain: 1.95, rate: 0.98, hp: 220, delay: 0.003, maxDur: 0.55 },
      { key: 'punch_body_heavy', gain: 0.72, rate: 0.90, hp: 42, lp: 140, maxDur: 0.22 },
      { key: 'bball_net_swish', gain: 1.40, rate: 1.04, hp: 260, delay: 0.022, maxDur: 0.44 },
    ]
  },

  // 6. SLIDE TACKLE (Crisp Grass Shred + Cleat Grip — Zero Boxy Mud)
  {
    files: ['slide_tackle.wav', 'variants/slide_v1.wav'],
    dur: 0.58, norm: 0.93, sat: 1.04, room: 0.03, presence: 3.2, subHp: 65,
    layers: [
      { key: 'grass_slide_4', gain: 1.55, rate: 1.02, hp: 80, maxDur: 0.54 },
      { key: 'grass_slide_1', gain: 1.00, rate: 1.04, hp: 140, maxDur: 0.44 },
      { key: 'sand_body_fall', gain: 0.42, rate: 1.00, hp: 90, lp: 420, delay: 0.04, maxDur: 0.28 },
    ]
  },
  {
    files: ['variants/slide_v2.wav'],
    dur: 0.60, norm: 0.93, sat: 1.04, room: 0.03, presence: 3.2, subHp: 65,
    layers: [
      { key: 'grass_slide_4', gain: 1.80, rate: 0.96, hp: 85, maxDur: 0.56 },
      { key: 'grass_step', gain: 0.85, rate: 1.04, hp: 180, maxDur: 0.16 },
    ]
  },
  {
    files: ['variants/slide_v3.wav'],
    dur: 0.54, norm: 0.92, sat: 1.03, room: 0.03, presence: 3.2, subHp: 75,
    layers: [
      { key: 'grass_slide_1', gain: 1.70, rate: 1.06, hp: 90, maxDur: 0.48 },
      { key: 'grass_slide_4', gain: 0.85, rate: 1.08, hp: 180, delay: 0.03, maxDur: 0.44 },
    ]
  },
  {
    files: ['variants/slide_v4.wav'],
    dur: 0.58, norm: 0.93, sat: 1.04, room: 0.03, presence: 3.2, subHp: 65,
    layers: [
      { key: 'grass_slide_4', gain: 1.55, rate: 1.07, hp: 85, maxDur: 0.52 },
      { key: 'grass_heavy', gain: 1.45, rate: 0.95, hp: 120, delay: 0.01, maxDur: 0.38 },
    ]
  },
  {
    files: ['variants/slide_v5.wav'],
    dur: 0.56, norm: 0.93, sat: 1.04, room: 0.03, presence: 3.2, subHp: 70,
    layers: [
      { key: 'grass_slide_1', gain: 1.45, rate: 0.98, hp: 90, maxDur: 0.48 },
      { key: 'grass_slide_4', gain: 1.30, rate: 1.00, hp: 150, delay: 0.02, maxDur: 0.50 },
    ]
  },

  // 7. STEAL & SWOOSH (Ultra-Crisp Leather Slap / Strip)
  {
    files: ['steal_swipe.wav', 'variants/steal_v1.wav'],
    dur: 0.26, norm: 0.94, sat: 1.05, room: 0.02, presence: 3.4, subHp: 90,
    layers: [
      { key: 'bball_poke_hit', gain: 2.10, rate: 1.04, hp: 120, maxDur: 0.22 },
      { key: 'bball_hand_catch', gain: 0.90, rate: 1.15, hp: 220, maxDur: 0.18 },
    ]
  },
  {
    files: ['variants/steal_v2.wav'],
    dur: 0.26, norm: 0.94, sat: 1.05, room: 0.02, presence: 3.4, subHp: 90,
    layers: [
      { key: 'bball_hand_catch', gain: 1.60, rate: 1.08, hp: 120, maxDur: 0.22 },
      { key: 'bball_poke_hit', gain: 1.40, rate: 1.10, hp: 200, maxDur: 0.20 },
    ]
  },
  {
    files: ['variants/steal_v3.wav'],
    dur: 0.25, norm: 0.94, sat: 1.05, room: 0.02, presence: 3.4, subHp: 90,
    layers: [
      { key: 'bball_poke_hit', gain: 2.20, rate: 0.98, hp: 110, maxDur: 0.22 },
      { key: 'fast_swoosh', gain: 0.42, rate: 1.30, hp: 700, maxDur: 0.15 },
    ]
  },
  {
    files: ['variants/steal_v4.wav'],
    dur: 0.27, norm: 0.94, sat: 1.05, room: 0.02, presence: 3.4, subHp: 90,
    layers: [
      { key: 'bball_catch', gain: 1.85, rate: 1.05, hp: 110, maxDur: 0.23 },
      { key: 'bball_poke_hit', gain: 1.20, rate: 1.12, hp: 240, delay: 0.004, maxDur: 0.19 },
    ]
  },
  {
    files: ['variants/steal_v5.wav'],
    dur: 0.25, norm: 0.94, sat: 1.05, room: 0.02, presence: 3.4, subHp: 90,
    layers: [
      { key: 'bball_hand_catch', gain: 1.40, rate: 1.16, hp: 120, maxDur: 0.20 },
      { key: 'bball_catch', gain: 1.30, rate: 1.00, hp: 180, maxDur: 0.20 },
    ]
  },
  {
    files: ['steal_swoosh.wav', 'variants/steal_swoosh_v1.wav'],
    dur: 0.24, norm: 0.90, sat: 1.02, room: 0.02, presence: 2.8, subHp: 160,
    layers: [
      { key: 'fast_air_sweep', gain: 1.40, rate: 1.18, hp: 200, maxDur: 0.20 },
      { key: 'fast_swoosh', gain: 0.68, rate: 1.28, hp: 700, maxDur: 0.17 },
    ]
  },

  // 8. GOALKEEPER SAVE (Crisp Latex Glove Thwack + Deflection Snap)
  {
    files: ['keeper_save.wav', 'variants/save_v1.wav'],
    dur: 0.36, norm: 0.95, sat: 1.05, room: 0.03, presence: 6.2, airShelf: 4.2, boxDip: -4.8, subHp: 60,
    layers: [
      { key: 'soccer_ball_hit', gain: 1.45, rate: 1.02, hp: 70, maxDur: 0.28 },
      { key: 'bball_hand_catch', gain: 1.35, rate: 1.02, hp: 380, maxDur: 0.20 },
      { key: 'bball_poke_hit', gain: 0.85, rate: 1.12, hp: 900, maxDur: 0.06 },
      { key: 'glove_punch', gain: 0.55, rate: 0.98, hp: 110, lp: 2400, maxDur: 0.18 },
    ]
  },
  {
    files: ['variants/save_v2.wav'],
    dur: 0.36, norm: 0.95, sat: 1.05, room: 0.03, presence: 6.2, airShelf: 4.2, boxDip: -4.8, subHp: 60,
    layers: [
      { key: 'soccer_ball_hit', gain: 1.40, rate: 0.98, hp: 70, maxDur: 0.28 },
      { key: 'bball_catch', gain: 1.40, rate: 1.04, hp: 260, maxDur: 0.22 },
      { key: 'bball_poke_hit', gain: 0.80, rate: 1.08, hp: 850, maxDur: 0.06 },
    ]
  },
  {
    files: ['variants/save_v3.wav'],
    dur: 0.34, norm: 0.94, sat: 1.05, room: 0.03, presence: 6.2, airShelf: 4.2, boxDip: -4.8, subHp: 65,
    layers: [
      { key: 'soccer_quick_kick', gain: 1.05, rate: 1.10, hp: 85, maxDur: 0.20 },
      { key: 'bball_hand_catch', gain: 1.50, rate: 1.08, hp: 340, maxDur: 0.22 },
      { key: 'bball_poke_hit', gain: 0.82, rate: 1.16, hp: 900, maxDur: 0.06 },
    ]
  },

  // 9. FOOTSTEPS & SNEAKER SQUEAKS (Clean Non-Boomy Crisp Transients)
  {
    files: ['sprint_step.wav'],
    dur: 0.14, norm: 0.88, sat: 1.02, room: 0.01, presence: 2.8, subHp: 90,
    layers: [{ key: 'grass_step', gain: 2.20, rate: 1.04, hp: 110, maxDur: 0.12 }]
  },
  {
    files: ['variants/step_v1.wav'],
    dur: 0.15, norm: 0.88, sat: 1.02, room: 0.01, presence: 2.8, subHp: 90,
    layers: [{ key: 'grass_heavy', gain: 2.10, rate: 1.02, hp: 110, maxDur: 0.13 }]
  },
  {
    files: ['variants/step_v2.wav'],
    dur: 0.14, norm: 0.88, sat: 1.02, room: 0.01, presence: 2.8, subHp: 90,
    layers: [{ key: 'grass_walk', offsetSec: 0.42, gain: 1.85, rate: 1.08, hp: 110, maxDur: 0.12 }]
  },
  {
    files: ['sprint_step_court.wav', 'variants/step_court_v1.wav'],
    dur: 0.13, norm: 0.85, sat: 1.02, room: 0.02, presence: 2.6, subHp: 110,
    layers: [
      { key: 'bball_hit_court', gain: 1.40, rate: 1.12, hp: 130, lp: 4200, maxDur: 0.11 },
    ]
  },
  {
    files: ['variants/step_court_v2.wav'],
    dur: 0.14, norm: 0.85, sat: 1.02, room: 0.02, presence: 2.6, subHp: 110,
    layers: [
      { key: 'bball_hit_court', gain: 1.30, rate: 1.00, hp: 120, lp: 4000, maxDur: 0.11 },
      { key: 'court_squeak', gain: 0.38, rate: 1.14, hp: 600, delay: 0.008, maxDur: 0.09 },
    ]
  },
  {
    files: ['sneaker_squeak.wav'],
    dur: 0.21, norm: 0.86, sat: 1.02, room: 0.04, presence: 2.2, subHp: 450,
    layers: [{ key: 'court_squeak', gain: 2.15, rate: 1.02, hp: 450, maxDur: 0.19 }]
  },
  {
    files: ['variants/squeak_v1.wav'],
    dur: 0.20, norm: 0.86, sat: 1.02, room: 0.04, presence: 2.2, subHp: 450,
    layers: [{ key: 'rubber_squeak', offsetSec: 0.02, gain: 1.15, rate: 1.14, hp: 450, maxDur: 0.18 }]
  },

  // 10. DRIBBLES & BALL BOUNCES (Tight Hardwood Rubber Thwack — Crisp Upper-Mid Slap!)
  {
    files: ['ball_bounce.wav', 'dribble.wav'],
    dur: 0.24, norm: 0.94, sat: 1.04, room: 0.02, presence: 6.8, airShelf: 4.6, boxDip: -5.2, subHp: 68,
    layers: [
      { key: 'bball_bounce_floor', gain: 1.35, rate: 1.04, hp: 70, maxDur: 0.20 },
      { key: 'bball_hit_court', gain: 0.95, rate: 1.08, hp: 180, maxDur: 0.16 },
      { key: 'bball_poke_hit', gain: 0.72, rate: 1.22, hp: 1000, maxDur: 0.040 },
    ]
  },
  {
    files: ['variants/dribble_v1.wav'],
    dur: 0.24, norm: 0.94, sat: 1.04, room: 0.02, presence: 6.8, airShelf: 4.6, boxDip: -5.2, subHp: 68,
    layers: [
      { key: 'bball_bounce', gain: 1.30, rate: 1.06, hp: 70, maxDur: 0.20 },
      { key: 'bball_poke_hit', gain: 0.78, rate: 1.16, hp: 950, maxDur: 0.042 },
    ]
  },
  {
    files: ['bounce_footy.wav', 'variants/bounce_footy_v1.wav'],
    dur: 0.20, norm: 0.90, sat: 1.03, room: 0.02, presence: 6.0, airShelf: 4.0, boxDip: -5.0, subHp: 65,
    layers: [
      { key: 'soccer_ball_hit', gain: 1.25, rate: 1.00, hp: 70, maxDur: 0.16 },
      { key: 'bball_poke_hit', gain: 0.58, rate: 1.12, hp: 900, maxDur: 0.038 },
    ]
  },
  {
    files: ['variants/bounce_footy_v2.wav'],
    dur: 0.20, norm: 0.90, sat: 1.03, room: 0.02, presence: 6.0, airShelf: 4.0, boxDip: -5.0, subHp: 65,
    layers: [
      { key: 'soccer_quick_kick', gain: 1.10, rate: 0.98, hp: 70, maxDur: 0.16 },
      { key: 'bball_poke_hit', gain: 0.62, rate: 1.20, hp: 950, maxDur: 0.038 },
    ]
  },

  // 11. WHISTLES, BUZZER, RIM, BACKBOARD & GOALPOST
  {
    files: ['whistle.wav', 'referee_whistle.wav', 'variants/whistle_v1.wav'],
    dur: 0.46, norm: 0.90, sat: 1.02, room: 0.14, presence: 1.5, subHp: 300,
    layers: [{ key: 'referee_whistle_loud', gain: 1.45, rate: 1.00, hp: 350, maxDur: 0.42 }]
  },
  {
    files: ['variants/whistle_v2.wav'],
    dur: 0.58, norm: 0.90, sat: 1.02, room: 0.14, presence: 1.5, subHp: 300,
    layers: [
      { key: 'referee_police_whistle', gain: 1.30, rate: 1.02, hp: 350, maxDur: 0.19 },
      { key: 'referee_police_whistle', gain: 1.45, rate: 1.00, hp: 350, delay: 0.23, maxDur: 0.32 },
    ]
  },
  {
    files: ['variants/whistle_v3.wav'],
    dur: 0.78, norm: 0.90, sat: 1.02, room: 0.15, presence: 1.5, subHp: 300,
    layers: [
      { key: 'referee_whistle_loud', gain: 1.30, rate: 1.01, hp: 350, maxDur: 0.17 },
      { key: 'referee_whistle_loud', gain: 1.35, rate: 1.00, hp: 350, delay: 0.21, maxDur: 0.17 },
      { key: 'referee_whistle_loud', gain: 1.45, rate: 0.98, hp: 350, delay: 0.42, maxDur: 0.34 },
    ]
  },
  {
    files: ['hoops_buzzer.wav'],
    dur: 0.90, norm: 0.90, sat: 1.04, room: 0.14, presence: 1.8, subHp: 70,
    layers: [{ key: 'bball_buzzer', gain: 1.25, rate: 1.00, hp: 70, maxDur: 0.85 }]
  },
  {
    files: ['rim_clang.wav'],
    dur: 0.32, norm: 0.94, sat: 1.04, room: 0.04, presence: 3.4, subHp: 120,
    layers: [
      { key: 'bball_rim_1', gain: 2.10, rate: 1.02, hp: 140, maxDur: 0.28 },
      { key: 'bball_dunk_hard', gain: 0.50, rate: 1.08, hp: 100, maxDur: 0.16 },
    ]
  },
  {
    files: ['backboard_hit.wav'],
    dur: 0.28, norm: 0.92, sat: 1.04, room: 0.03, presence: 2.8, subHp: 65,
    layers: [
      { key: 'bball_hit_court', gain: 1.35, rate: 0.86, hp: 80, lp: 2800, maxDur: 0.24 },
      { key: 'punch_body_heavy', gain: 0.45, rate: 0.98, hp: 50, lp: 240, maxDur: 0.14 },
    ]
  },
  {
    files: ['goalpost_hit.wav'],
    dur: 0.52, norm: 0.94, sat: 1.05, room: 0.08, presence: 3.2, subHp: 140,
    layers: [
      { key: 'metal_grill_hit', gain: 1.30, rate: 1.08, hp: 240, maxDur: 0.44 },
      { key: 'bball_rim_1', gain: 1.20, rate: 0.88, hp: 180, maxDur: 0.32 },
      { key: 'soccer_ball_hit', gain: 0.72, rate: 1.02, hp: 120, maxDur: 0.22 },
    ]
  },

  // 12. STADIUM CELEBRATIONS & OPEN AMBIENCE LOOPS
  {
    files: ['celebration.wav', 'variants/celebrate_v1.wav'],
    dur: 2.50, norm: 0.92, sat: 1.03, room: 0.14, presence: 2.2, subHp: 75,
    layers: [
      { key: 'stadium_crowd_roar', offsetSec: 3.5, gain: 1.35, rate: 1.00, hp: 80, maxDur: 2.45, fadeIn: 0.03, fadeOut: 0.35 },
      { key: 'crowd_victory', offsetSec: 0.6, gain: 0.95, rate: 1.00, hp: 120, maxDur: 2.40, fadeIn: 0.05, fadeOut: 0.40 },
    ]
  },
  {
    files: ['variants/celebrate_v2.wav'],
    dur: 2.50, norm: 0.92, sat: 1.03, room: 0.14, presence: 2.2, subHp: 75,
    layers: [
      { key: 'crowd_stadium_yell', offsetSec: 0.4, gain: 1.45, rate: 1.00, hp: 85, maxDur: 2.45, fadeIn: 0.03, fadeOut: 0.35 },
      { key: 'stadium_applause', offsetSec: 3.5, gain: 0.88, rate: 1.00, hp: 140, maxDur: 2.40, fadeIn: 0.05, fadeOut: 0.40 },
    ]
  },
  {
    files: ['variants/celebrate_v3.wav'],
    dur: 2.40, norm: 0.92, sat: 1.03, room: 0.14, presence: 2.2, subHp: 75,
    layers: [
      { key: 'stadium_applause', offsetSec: 3.2, gain: 1.40, rate: 1.00, hp: 120, maxDur: 2.35, fadeIn: 0.03, fadeOut: 0.35 },
      { key: 'stadium_crowd_roar', offsetSec: 5.0, gain: 1.05, rate: 1.02, hp: 90, maxDur: 2.30, fadeIn: 0.05, fadeOut: 0.35 },
    ]
  },
  {
    files: ['variants/celebrate_v4.wav'],
    dur: 2.40, norm: 0.92, sat: 1.03, room: 0.14, presence: 2.2, subHp: 75,
    layers: [
      { key: 'crowd_victory', offsetSec: 1.2, gain: 1.25, rate: 1.00, hp: 100, maxDur: 2.35, fadeIn: 0.03, fadeOut: 0.35 },
      { key: 'crowd_stadium_yell', offsetSec: 1.0, gain: 1.15, rate: 0.98, hp: 90, maxDur: 2.30, fadeIn: 0.05, fadeOut: 0.35 },
    ]
  },
  {
    files: ['variants/celebrate_v5.wav'],
    dur: 2.40, norm: 0.92, sat: 1.03, room: 0.14, presence: 2.2, subHp: 75,
    layers: [
      { key: 'stadium_crowd_roar', offsetSec: 6.0, gain: 1.30, rate: 1.01, hp: 85, maxDur: 2.35, fadeIn: 0.03, fadeOut: 0.35 },
      { key: 'stadium_applause', offsetSec: 4.5, gain: 1.00, rate: 1.00, hp: 130, maxDur: 2.30, fadeIn: 0.05, fadeOut: 0.35 },
    ]
  },
  {
    files: ['crowd_cheer.wav'],
    dur: 1.50, norm: 0.90, sat: 1.02, room: 0.12, presence: 2.2, subHp: 85,
    layers: [
      { key: 'crowd_stadium_yell', offsetSec: 0.8, gain: 1.35, rate: 1.00, hp: 90, maxDur: 1.45, fadeIn: 0.05, fadeOut: 0.35 },
      { key: 'stadium_applause', offsetSec: 4.0, gain: 0.95, rate: 1.00, hp: 140, maxDur: 1.40, fadeIn: 0.06, fadeOut: 0.35 },
    ]
  },
  {
    files: ['ambience_footy.wav'],
    dur: 4.00, norm: 0.56, sat: 1.00, room: 0.0, presence: 0.8, subHp: 90, seamlessLoop: true,
    layers: [
      { key: 'stadium_crowd_roar', offsetSec: 4.5, gain: 0.88, rate: 0.98, hp: 95, lp: 3400, maxDur: 4.50 },
    ]
  },
  {
    files: ['ambience_hoops.wav'],
    dur: 4.00, norm: 0.54, sat: 1.00, room: 0.0, presence: 0.8, subHp: 90, seamlessLoop: true,
    layers: [
      { key: 'stadium_applause', offsetSec: 4.2, gain: 0.72, rate: 0.94, hp: 110, lp: 3200, maxDur: 4.50 },
      { key: 'stadium_crowd_roar', offsetSec: 5.5, gain: 0.52, rate: 1.00, hp: 95, lp: 2800, maxDur: 4.50 },
    ]
  },
];

for (const [k, p] of Object.entries(SOURCE_MAP)) {
  if (!fs.existsSync(p)) throw new Error('Missing raw audio source ' + k + ' at ' + p);
}
const rawB64 = {};
for (const [k, p] of Object.entries(SOURCE_MAP)) {
  rawB64[k] = fs.readFileSync(p).toString('base64');
}

const srv = http.createServer((req, res) => { res.end('<html><body>Audio Studio v6.0</body></html>'); });

srv.listen(PORT, async () => {
  const udir = fs.mkdtempSync(path.join(os.tmpdir(), 'fvh-aud-v60-'));
  const br = spawn(EXE, [
    '--headless=new', '--remote-debugging-port=' + CDP_PORT, '--user-data-dir=' + udir,
    '--autoplay-policy=no-user-gesture-required', 'about:blank'
  ], { stdio: 'ignore' });

  let ts = [];
  for (let i = 0; i < 40; i++) {
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
  await new Promise(r => setTimeout(r, 500));

  await send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(async () => {
      const b64Map = ${JSON.stringify(rawB64)};
      window.__actx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44100 });
      window.__raw = {};
      window.__onsets = {};
      for (const [k, b64] of Object.entries(b64Map)) {
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        const buf = await window.__actx.decodeAudioData(bytes.buffer.slice(0));
        window.__raw[k] = buf;
        const ch = buf.getChannelData(0);
        let pk = 0;
        for (let i = 0; i < ch.length; i++) { const a = Math.abs(ch[i]); if (a > pk) pk = a; }
        const thr = pk * 0.05;
        let onset = 0;
        for (let i = 0; i < ch.length; i++) {
          if (Math.abs(ch[i]) >= thr) { onset = Math.max(0, i - Math.floor(buf.sampleRate * 0.002)); break; }
        }
        window.__onsets[k] = onset / buf.sampleRate;
      }
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

        // Master mastering chain per clip: Sub cleanup HP -> Box-Mud Dip -> Presence Crispness -> Air Clarity
        const masterHp = off.createBiquadFilter();
        masterHp.type = 'highpass';
        masterHp.frequency.value = rec.subHp || 45;

        const boxDip = off.createBiquadFilter();
        boxDip.type = 'peaking';
        boxDip.frequency.value = 290;
        boxDip.Q.value = 0.85;
        boxDip.gain.value = rec.boxDip || -2.0;

        const pres = off.createBiquadFilter();
        pres.type = 'peaking';
        pres.frequency.value = 3500;
        pres.Q.value = 0.80;
        pres.gain.value = rec.presence || 2.5;

        const air = off.createBiquadFilter();
        air.type = 'highshelf';
        air.frequency.value = 5200;
        air.gain.value = rec.airShelf || 1.5;

        masterHp.connect(boxDip);
        boxDip.connect(pres);
        pres.connect(air);
        air.connect(off.destination);

        for (const lyr of rec.layers) {
          const srcBuf = window.__raw[lyr.key];
          if (!srcBuf) throw new Error('Missing decoded ' + lyr.key);
          const src = off.createBufferSource();
          src.buffer = srcBuf;
          src.playbackRate.value = lyr.rate || 1.0;

          let node = src;
          if (lyr.hp) {
            const hpf = off.createBiquadFilter();
            hpf.type = 'highpass'; hpf.frequency.value = lyr.hp;
            node.connect(hpf); node = hpf;
          }
          if (lyr.lp) {
            const lpf = off.createBiquadFilter();
            lpf.type = 'lowpass'; lpf.frequency.value = lyr.lp;
            node.connect(lpf); node = lpf;
          }
          const g = off.createGain();
          const startWhen = lyr.delay || 0;
          const baseOffset = (lyr.offsetSec !== undefined) ? lyr.offsetSec : window.__onsets[lyr.key];
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
          node.connect(g);
          g.connect(masterHp);
          src.start(startWhen, baseOffset, Math.max(0.04, playDur));
        }

        const rendered = await off.startRendering();
        const ch0 = rendered.getChannelData(0);
        const ch1 = rendered.getChannelData(1);

        if (rec.seamlessLoop) {
          const cf = Math.floor(SR * 0.45);
          for (let i = 0; i < cf; i++) {
            const w = 0.5 - 0.5 * Math.cos(Math.PI * i / cf);
            const tailIdx = totalFrames - cf + i;
            const sL = ch0[i] * w + ch0[tailIdx] * (1 - w);
            const sR = ch1[i] * w + ch1[tailIdx] * (1 - w);
            ch0[i] = sL; ch1[i] = sR;
            ch0[tailIdx] = ch0[i]; ch1[tailIdx] = ch1[i];
          }
        }

        const roomAmt = rec.room || 0;
        const lOut = new Float32Array(totalFrames);
        const rOut = new Float32Array(totalFrames);
        const d1 = Math.floor(SR * 0.011), d2 = Math.floor(SR * 0.017), d3 = Math.floor(SR * 0.029);
        for (let i = 0; i < totalFrames; i++) {
          let l = ch0[i], r = ch1[i];
          if (roomAmt > 0) {
            l += ((i >= d1 ? ch1[i - d1] : 0) * 0.42 + (i >= d3 ? ch0[i - d3] : 0) * 0.25) * roomAmt;
            r += ((i >= d2 ? ch0[i - d2] : 0) * 0.42 + (i >= d3 ? ch1[i - d3] : 0) * 0.25) * roomAmt;
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
        const sat = rec.sat || 1.04;

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
      throw new Error('Recipe failed for ' + rec.files[0] + ': ' + JSON.stringify(wavB64));
    }
    const buf = Buffer.from(wavB64.result.value, 'base64');
    for (const rel of rec.files) {
      fs.writeFileSync(path.join(OUT_DIR, rel), buf);
      written++;
    }
  }

  console.log(`✓ Mastered ${written} crystal-clear v6.0 studio SFX WAVs into assets/audio/!`);
  ws.close(); br.kill(); srv.close();
  try { fs.rmSync(udir, { recursive: true, force: true }); } catch (_) {}
  process.exit(0);
});
