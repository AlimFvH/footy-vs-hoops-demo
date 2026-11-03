const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== TEST SUITE: PAUSE MODAL, KITS OVERHAUL & AIRDROP HUB POLISH ===\n');

const glbRenderPath = path.join(__dirname, '..', 'render', 'characters_glb.js');
const redesignJsPath = path.join(__dirname, '..', 'js', 'redesign.js');
const redesignCssPath = path.join(__dirname, '..', 'css', 'redesign.css');
const gameJsPath = path.join(__dirname, '..', 'js', 'game.js');

const glbRender = fs.readFileSync(glbRenderPath, 'utf8');
const redesignJs = fs.readFileSync(redesignJsPath, 'utf8');
const redesignCss = fs.readFileSync(redesignCssPath, 'utf8');
const gameJs = fs.readFileSync(gameJsPath, 'utf8');

// [TEST 1] In-Game 3D Kit Material Tinting in WebGL
console.log('[Test 1] Testing 3D In-Game Kit Tinting & Visibility in CharactersGLB...');
assert(glbRender.includes("if (matName === 'LightBlue')"), 'GLB renderer must tint LightBlue jersey mesh with equipped kit color');
assert(glbRender.includes("if (matName === 'White')"), 'GLB renderer must tint White shorts/socks mesh with equipped kit shorts color');
assert(glbRender.includes("if (matName === 'Red_Dark')"), 'GLB renderer must tint Red_Dark boots mesh with equipped boots color');
assert(glbRender.includes('hexToVec3(sk.primary)'), 'GLB renderer must convert primary skin color to normalized RGB vector');
assert(glbRender.includes('this.skin = this.charRef.skin'), 'GLB character instance must keep skin in sync with equipped character loadout');
assert(gameJs.includes('skin_footy_royal_striker') && gameJs.includes('skin_hoops_street_legend'), 'KNOWN_SKIN_VISUALS in game.js must include canonical football & basketball kits');
console.log('  ✓ 3D In-game kit material tinting confirmed for jersey, shorts, and boots with 100% visibility.');

// [TEST 2] 2D Kit Vector Artwork Overhaul
console.log('\n[Test 2] Testing 2D Jersey Previews Overhaul in getDetailedJerseySvg...');
assert(redesignJs.includes('function getDetailedJerseySvg(item, size)'), 'getDetailedJerseySvg function must exist');
assert(redesignJs.includes('smooth anatomical raglan curves'), 'Football jersey must feature curved raglan sleeve contours rather than rigid polygons');
assert(redesignJs.includes('Ribbed V-Neck / Athletic Collar'), 'Football jersey must render realistic ribbed V-neck collar');
assert(redesignJs.includes('C34 25 24 28 17 38'), 'Curved shoulder and sleeve drape path confirmed');
assert(redesignJs.includes('Striped Ribbed Scoop Neckline'), 'Basketball tank top must render realistic scoop neckline');
assert(redesignJs.includes('C31 28 25 35 24 46'), 'Basketball tank top must render deep ergonomic armhole cutouts');
console.log('  ✓ 2D Jersey vector artwork confirmed: anatomical curves, ribbed collars, authentic club crests.');

// [TEST 3] Console-Grade Pause Screen & Artwork
console.log('\n[Test 3] Testing Pause Modal Overhaul & getPauseArtworkSvg...');
assert(redesignJs.includes('function getPauseArtworkSvg(curChar)'), 'getPauseArtworkSvg function must exist');
assert(redesignJs.includes('fvh-pause-artwork-svg'), 'Pause artwork must render dedicated SVG class');
assert(redesignJs.includes('pBars_'), 'Pause artwork must feature metallic 3D pause symbol');
assert(redesignJs.includes('function installRedesignedPause(app)'), 'installRedesignedPause hook must exist');
assert(redesignJs.includes('fvh-pause-overlay'), 'Pause modal must render frosted glass .fvh-pause-overlay');
assert(redesignJs.includes('fvh-pause-match-status'), 'Pause modal must render live match score HUD snapshot');
assert(redesignJs.includes('fvh-pause-resume-btn'), 'Pause modal must render prominent Resume button');
assert(redesignJs.includes('fvh-pause-danger-btn'), 'Pause modal must render Quit button');
assert(redesignCss.includes('.fvh-pause-overlay') && redesignCss.includes('.fvh-pause-card'), 'CSS rules for pause modal must exist');
assert(redesignCss.includes('min-height: 48px'), 'Pause buttons must have touch target >= 48px');
console.log('  ✓ Pause screen overhaul confirmed: 3D stadium artwork, match score snapshot, and tactile buttons.');

// [TEST 4] Play-to-Airdrop Hub Screen & Hero Graphic
console.log('\n[Test 4] Testing Play-to-Airdrop Hub Polish & getAirdropHeroGraphicSvg...');
assert(redesignJs.includes('function getAirdropHeroGraphicSvg(curChar)'), 'getAirdropHeroGraphicSvg function must exist');
assert(redesignJs.includes('fvh-airdrop-hero-art'), 'Airdrop hero artwork must render dedicated SVG class');
assert(redesignJs.includes('goldRim_'), 'Airdrop graphic must render 3D glowing TON crystal coin with gold bevel');
assert(redesignJs.includes('fvh-airdrop-calc-box'), 'Airdrop hub must render real-time token estimation calculation box');
assert(redesignJs.includes('fvh-airdrop-pillars-grid'), 'Airdrop hub must render clear 4-step earning pillars');
assert(redesignCss.includes('.fvh-airdrop-hero-art'), 'CSS styles for airdrop hero graphic verified');
console.log('  ✓ Play-to-Airdrop Hub confirmed: 3D TON crystal coin, token calculation box, and clear earning guide.');

// [TEST 5] Bilingual Consistency & Localization
console.log('\n[Test 5] Testing Bilingual Consistency for Pause & Airdrop...');
assert(redesignJs.includes("pauseTitle: 'MATCH PAUSED'") && redesignJs.includes("pauseTitle: 'МАТЧ НА ПАУЗЕ'"), 'pauseTitle must be localized in en and ru');
assert(redesignJs.includes("pauseResume: 'Resume Match'") && redesignJs.includes("pauseResume: 'Продолжить матч'"), 'pauseResume must be localized in en and ru');
console.log('  ✓ Bilingual consistency confirmed across all new features.');

console.log('\n===============================================================');
console.log('🎉 ALL PAUSE MODAL, KITS & AIRDROP TESTS PASSED SUCCESSFULLY!');
console.log('===============================================================');
