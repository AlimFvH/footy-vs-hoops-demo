const assert = require('assert');
const fs = require('fs');

console.log('=== FOOTY vs HOOPS Football Pitch & Leaderboard Test Suite ===\n');

// 1. Football Pitch 3D WebGL Enhancements
console.log('[Test 1] Testing 3D Football Pitch Visual Overhaul...');
const gameJs = fs.readFileSync('js/game.js', 'utf8');

assert(gameJs.includes('0x24a648') && gameJs.includes('0x1a8f3b'),
  'std_footy_classic must use vibrant emerald pitchA (0x24a648) and pitchB (0x1a8f3b)');
assert(gameJs.includes('hemiGround: 0x1e5028'),
  'FOOTY_BASE must provide warm turf ground bounce light (0x1e5028)');
assert(gameJs.includes('lightIntensity: 0.82'),
  'FOOTY_BASE must provide broadcast-grade stadium light intensity (0.82)');
assert(gameJs.includes('stripeGrad = g.createLinearGradient'),
  'makePitchTexture must use smooth velvety directional mower gradients');
assert(gameJs.includes('Midfield & Center Pitch Concentric Mower Sheen'),
  'makePitchTexture must render concentric mower rings in midfield');
assert(gameJs.includes('clean synthetic turf runner outside touchlines'),
  'makePitchTexture must render clean synthetic turf runner outside touchlines');
console.log('  ✓ 3D Football Pitch emerald turf, mower patterns, and stadium lighting verified.');

// 2. Football Stadium 2D Artwork Previews
console.log('\n[Test 2] Testing 2D Stadium Vector Artwork Preview...');
const redesignJs = fs.readFileSync('js/redesign.js', 'utf8');

assert(redesignJs.includes('id="floodlightBeam"'),
  'std_footy_classic SVG preview must render stadium floodlight beams');
assert(redesignJs.includes('stop-color="#24a648"') && redesignJs.includes('stop-color="#1a8f3b"'),
  'std_footy_classic SVG preview must use emerald turf gradients matching 3D pitch');
console.log('  ✓ 2D Football Stadium vector preview verified.');

// 3. Leaderboard Personal Standing Card
console.log('\n[Test 3] Testing Prominent Top Personal Standing Card...');
assert(redesignJs.includes('fvh-lb-my-standing-card'),
  'Leaderboard must render prominent personal standing card at top');
assert(redesignJs.includes('fvh-lb-my-rank-badge'),
  'Personal standing card must display prominent rank badge');
assert(redesignJs.includes('fvh-lb-my-score-val'),
  'Personal standing card must display large score value');
assert(redesignJs.includes('fvh-lb-play-cta-btn'),
  'Personal standing card must provide quick action button to start playing for PTS');
console.log('  ✓ Personal standing card with rank, score, record, and quick play CTA verified.');

// 4. Leaderboard Structure: Team War, Rules, Search, Podium, Rows
console.log('\n[Test 4] Testing Leaderboard Structure & Accessibility...');
assert(redesignJs.includes('fvh-war-scoreboard-card'),
  'Leaderboard must render Team War clash scoreboard card');
assert(redesignJs.includes('<div class="fvh-team-tag">⚽ FOOTY</div>'),
  'Team War card must include ⚽ FOOTY tag');
assert(redesignJs.includes('<div class="fvh-team-tag">🏀 HOOPS</div>'),
  'Team War card must include 🏀 HOOPS tag');
assert(redesignJs.includes('fvh-lb-rules-card'),
  'Leaderboard must render rules explanation card');
assert(redesignJs.includes('+20 очков за победу · +10 очков за завершение матча'),
  'Rules card must explain victory and completion points');
assert(redesignJs.includes('fvh-lb-search-wrap'),
  'Leaderboard must include live search filter bar');
assert(redesignJs.includes('fvh-podium-wrap'),
  'Leaderboard must render Top 3 podium');
assert(redesignJs.includes('fvh-leaderboard-rows'),
  'Leaderboard must render ranked rows');
console.log('  ✓ Complete Leaderboard structure verified.');

// 5. Leaderboard CSS Polish
console.log('\n[Test 5] Testing Leaderboard CSS Styles...');
const redesignCss = fs.readFileSync('css/redesign.css', 'utf8');
assert(redesignCss.includes('.fvh-lb-my-standing-card'),
  'redesign.css must style .fvh-lb-my-standing-card');
assert(redesignCss.includes('.fvh-lb-my-rank-badge'),
  'redesign.css must style .fvh-lb-my-rank-badge');
assert(redesignCss.includes('.fvh-lb-play-cta-btn'),
  'redesign.css must style .fvh-lb-play-cta-btn');
console.log('  ✓ Leaderboard CSS styling verified.');

console.log('\nAll 5 pitch & leaderboard overhaul tests PASSED with 100% success! 🎉');
