const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== FOOTY vs HOOPS Play-to-Airdrop Token Feature Test Suite ===\n');

const redesignJsPath = path.join(__dirname, '..', 'js', 'redesign.js');
const redesignCssPath = path.join(__dirname, '..', 'css', 'redesign.css');
const redesignJs = fs.readFileSync(redesignJsPath, 'utf8');
const redesignCss = fs.readFileSync(redesignCssPath, 'utf8');

// Test 1: Drop PTS Calculation Engine
console.log('[Test 1] Testing calculateAirdropStats Logic & Scoring Engine...');
assert(redesignJs.includes('function calculateAirdropStats(data)'),
  'calculateAirdropStats function must exist in redesign.js');
assert(redesignJs.includes('var base = 100;'),
  'calculateAirdropStats must provide a base qualification of 100 PTS');
assert(redesignJs.includes('(wins * 25)'),
  'calculateAirdropStats must award +25 PTS per match victory');
assert(redesignJs.includes('(matches * 10)'),
  'calculateAirdropStats must award +10 PTS per match played');
assert(redesignJs.includes('(refCount * 50)'),
  'calculateAirdropStats must award +50 PTS per squad teammate invited');
assert(redesignJs.includes('var walletBonus = hasWallet ? 150 : 0;'),
  'calculateAirdropStats must award +150 PTS bonus for linking public TON wallet');
console.log('  ✓ Drop PTS math formula verified with victory, activity, referral, and wallet bonuses.');

// Test 2: Main Menu Play-to-Airdrop Banner
console.log('\n[Test 2] Testing Main Menu Airdrop Banner Placement & Interaction...');
assert(redesignJs.includes('fvh-airdrop-banner'),
  'renderRedesignedMenu must render .fvh-airdrop-banner');
assert(redesignJs.includes('airdropBanner.className = \'fvh-airdrop-banner \' + curChar;'),
  'Banner must adapt to active faction (footy / hoops)');
assert(redesignJs.includes('app.go(\'airdrop\');'),
  'Clicking airdrop banner must navigate to airdrop hub');
assert(redesignCss.includes('.fvh-airdrop-banner'),
  'CSS styles for .fvh-airdrop-banner must exist');
assert(redesignCss.includes('.fvh-airdrop-banner.footy') && redesignCss.includes('.fvh-airdrop-banner.hoops'),
  'Faction-specific theme gradients must exist for both footy and hoops');
console.log('  ✓ Main Menu Play-to-Airdrop banner verified in hierarchy with faction styling.');

// Test 3: Dedicated Play-to-Airdrop Hub Screen
console.log('\n[Test 3] Testing buildAirdropPage Component Structure...');
assert(redesignJs.includes('function buildAirdropPage(app)'),
  'buildAirdropPage function must be defined');
assert(redesignJs.includes('fvh-airdrop-page-hero'),
  'Airdrop hub must render hero card with total Drop PTS and Tier');
assert(redesignJs.includes('fvh-airdrop-pillars-grid'),
  'Airdrop hub must render 4 earning pillars grid');
assert(redesignJs.includes('airdropPillarMatchesTitle'),
  'Pillar 1 (Matches & Score) must be configured');
assert(redesignJs.includes('airdropPillarLeaderboardTitle'),
  'Pillar 2 (Leaderboard Multipliers up to 3.0x) must be configured');
assert(redesignJs.includes('airdropPillarSquadTitle'),
  'Pillar 3 (Squad Referrals) must be configured');
assert(redesignJs.includes('airdropPillarWalletTitle'),
  'Pillar 4 (Link TON Wallet) must be configured');
assert(redesignJs.includes('fvh-btn-airdrop-manage-wallet'),
  'Airdrop hub must provide 1-click TON wallet management');
console.log('  ✓ buildAirdropPage structure, 4 earning pillars, and wallet management verified.');

// Test 4: App Router & Navigation Integration
console.log('\n[Test 4] Testing app.go(\'airdrop\') and app.showAirdrop()...');
assert(redesignJs.includes("page === 'airdrop'"),
  'app.go must support airdrop page routing');
assert(redesignJs.includes('app.showAirdrop = function ()'),
  'app.showAirdrop shortcut method must be defined');
console.log('  ✓ Navigation routing for airdrop hub verified.');

// Test 5: Profile & Leaderboard Cross-Promotion Links
console.log('\n[Test 5] Testing Profile & Leaderboard Cross-Promotion Links...');
assert(redesignJs.includes('fvh-btn-profile-airdrop-hub'),
  'Profile page token card must render button to open Airdrop Hub');
assert(redesignJs.includes('fvh-lb-airdrop-link'),
  'Leaderboard rules card must render link to open Airdrop Hub');
console.log('  ✓ Profile and Leaderboard cross-promotion links to Airdrop Hub verified.');

// Test 6: Compliance & Security Guarantees
console.log('\n[Test 6] Testing Security Disclaimers & Telegram Guidelines...');
assert(redesignJs.includes('airdropSecurityNote'),
  'Airdrop hub must display strict security warning against entering seed phrases');
assert(redesignJs.includes('airdropDisclaimer'),
  'Airdrop hub must display distinction between FvH shop coins and future blockchain tokens');
assert(redesignCss.includes('.fvh-airdrop-pillar-card'),
  'CSS styles for pillar cards verified');
console.log('  ✓ Web3 security notices and Telegram guidelines verified.');

console.log('\nAll 6 Play-to-Airdrop token feature tests PASSED with 100% success! 🎉');
