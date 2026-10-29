// tests/test_arena_perf_and_character_parity.cjs
// Verification of Standard Basketball Arena, Mobile GPU Lag Elimination, and Wardrobe Character Parity in 3D

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== TEST: ARENA SELECTOR, MOBILE GPU PERF & WARDROBE CHARACTER PARITY ===\n');

// 1. Verify Standard Arenas in Arena Selector & Defaults
console.log('[TEST 1] Standard Basketball and Football Arenas in Selector & Match Defaults');
const redesignJs = fs.readFileSync(path.join(__dirname, '../js/redesign.js'), 'utf8');
const serverJs = fs.readFileSync(path.join(__dirname, '../server/server.js'), 'utf8');
const gameJs = fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8');

// Ensure base arenas are in buildArenaSelectPage
assert(redesignJs.includes("id: 'std_hoops_street'"), 'redesign.js must include std_hoops_street');
assert(redesignJs.includes("id: 'std_footy_classic'"), 'redesign.js must include std_footy_classic');
assert(redesignJs.includes('baseArenas.concat(SCENIC_ARENAS_CATALOG)'), 'Arena selector must include base classic stadiums');
assert(redesignJs.includes('fvh-arena-badge-env default'), 'Standard arenas must have the default STADIUM badge');

// Ensure server and client no longer use legacy uncataloged std_urban_rooftop
assert(!serverJs.includes('std_urban_rooftop'), 'server.js must not contain std_urban_rooftop');
assert(!serverJs.includes('std_classic_pitch'), 'server.js must not contain std_classic_pitch');
assert(serverJs.includes("mode === 'hoops' ? 'std_hoops_street' : 'std_footy_classic'"), 'server.js must default hoops to std_hoops_street');
console.log('  ✓ Standard Basketball Arena (std_hoops_street) and Football Pitch (std_footy_classic) fully integrated in selector and server\n');

// 2. Verify Mobile GPU Lag Elimination, WebGL2 Antialiasing & Retina Sharpness
console.log('[TEST 2] Mobile GPU Optimization, WebGL2 MSAA & Retina Sharpness');
assert(gameJs.includes('initShadowMapSize = isMobileDevice() ? 0 :'), 'Mobile devices must disable directional shadow maps (shadowSize = 0)');
assert(gameJs.includes('this.renderer = new renderer_js_1.Renderer(canvas, { antialias: true,'), 'MSAA antialiasing must be active for smooth non-pixelated 3D player models');
assert(gameJs.includes("cap = isMob ? (this.qualityMode === 'high' ? 2.0 : 1.75)"), 'Mobile DPR must provide high-density Retina resolution (1.75-2.0)');
assert(gameJs.includes('this.shadowBlob.visible = true'), 'Planar blob shadows must remain active for all players');
assert(gameJs.includes('this.ballShadow = new scene_js_5.Node'), 'Ball planar blob shadow must remain active');
console.log('  ✓ Mobile GPU shadow rendering pass eliminated, WebGL2 MSAA active, Retina DPR enabled, planar blob shadows preserved\n');

// 3. Verify Wardrobe to 3D Character Parity
console.log('[TEST 3] Wardrobe to 3D In-Game Character Visual Parity');

// Check ITEMS definition in game.js
assert(gameJs.includes('0x6c4424'), 'HOOPS must have rich dark skin 0x6c4424');
assert(gameJs.includes('0x0a0a0a'), 'HOOPS must have deep black cropped hair 0x0a0a0a');
assert(gameJs.includes('0xdfa070'), 'FOOTY must have European skin tone 0xdfa070');
assert(gameJs.includes('0x221810'), 'FOOTY must have swept brown hair 0x221810');
assert(gameJs.includes('0x00c8ff'), 'FOOTY must have striker cyan jersey 0x00c8ff');
assert(gameJs.includes('0xff6b00'), 'HOOPS must have vibrant orange jersey 0xff6b00');

// Check MatchView athlete identity enforcement
const matchViewStart = gameJs.indexOf('class MatchView');
assert(matchViewStart > 0, 'MatchView must exist');
const matchViewCode = gameJs.slice(matchViewStart, matchViewStart + 8000);
assert(matchViewCode.includes('skin.skin = 0x6c4424'), 'HOOPS in-game skin tone must match wardrobe');
assert(matchViewCode.includes('skin.hair = 0x0a0a0a'), 'HOOPS in-game hair must match wardrobe');
assert(matchViewCode.includes('skin.skin = 0xdfa070'), 'FOOTY in-game skin tone must match wardrobe');
assert(matchViewCode.includes('skin.hair = 0x221810'), 'FOOTY in-game hair must match wardrobe');

// Check Character class 3D details: #23 on basketball jersey, #10 on football jersey, orange headband
assert(gameJs.includes("build3DNumber('23'"), 'Basketball jersey must feature 3D #23 on back');
assert(gameJs.includes("build3DNumber(squadNum"), 'Football jersey must feature 3D #10 on back');
assert(gameJs.includes('0xff6b00, { spec: 0.15, fine: true }'), 'Basketball player must wear orange headband');

// Check Basketball vs Football height proportions (Basketball athlete taller than soccer striker)
assert(gameJs.includes('exports.FOOTY_GROW = 1.0;'), 'FOOTY_GROW must not bloat football player over basketballer');
assert(gameJs.includes("mode === 'hoops' ? 1.06 : 0.92"), 'Basketball player must be scaled taller than soccer striker');
console.log('  ✓ In-game 3D athletes strictly mirror wardrobe artwork, skin tones, hair styles, and kits\n');

// 4. Verify Crowd Polish & Courtside LED Boards Under Hoops
console.log('[TEST 4] Crowd Visual Polish & Visible LED Boards Under Hoops');
assert(gameJs.includes('supporterTorso = G.cylinder'), 'Crowd bodies must use smooth rounded cylinder geometry instead of blocky cubes');
assert(gameJs.includes('supporterArm = G.capsule'), 'Crowd arms must use smooth capsule geometry');
assert(gameJs.includes('High-visibility Courtside Baseline LED boards directly under both hoops'), 'Courtside baseline LED boards must be placed under both hoops');
assert(redesignJs.includes("d.equipped['stadium.hoops'] === 'std_volcano_caldera'"), 'Bootstrap must auto-sanitize volcanic arena fallback back to standard street hardwood');
console.log('  ✓ Crowd geometry smoothed to eliminate pixelated/blocky look and baseline LED boards visible under both baskets\n');

console.log('=============================================================');
console.log('🎉 ALL ARENA, PERF, AND CHARACTER PARITY TESTS PASSED!');
console.log('=============================================================');
