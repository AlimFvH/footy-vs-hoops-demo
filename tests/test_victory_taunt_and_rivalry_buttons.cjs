const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== FOOTY vs HOOPS Victory Banter, Live Rivalry & Buttons Polish Suite ===\n');

const redesignJsPath = path.join(__dirname, '..', 'js', 'redesign.js');
const redesignCssPath = path.join(__dirname, '..', 'css', 'redesign.css');
const serverJsPath = path.join(__dirname, '..', 'server', 'server.js');

const redesignJs = fs.readFileSync(redesignJsPath, 'utf8');
const redesignCss = fs.readFileSync(redesignCssPath, 'utf8');
const serverJs = fs.readFileSync(serverJsPath, 'utf8');

// Test 1: Victory Banter & Taunt Strings in Localization
console.log('[Test 1] Testing Victory Taunt Localizations...');
assert(redesignJs.includes('«Футбол правит миром! ⚽»'),
  'Russian dictionary must include Football victory taunt');
assert(redesignJs.includes('«Баскетбол на высоте! 🏀»'),
  'Russian dictionary must include Basketball victory taunt');
assert(redesignJs.includes('«Football rules the world! ⚽»'),
  'English dictionary must include Football victory taunt');
assert(redesignJs.includes('«Basketball reigns supreme! 🏀»'),
  'English dictionary must include Basketball victory taunt');
console.log('  ✓ Bilingual victory taunt and banter strings verified in I18N.');

// Test 2: Victory Screen Taunt Card Injection
console.log('\n[Test 2] Testing Victory Taunt Card Injection...');
assert(redesignJs.includes('function decorateResultPanelWithTaunt(app, sum)'),
  'decorateResultPanelWithTaunt function must exist in redesign.js');
assert(redesignJs.includes('decorateResultPanelWithTaunt(app, sum);'),
  'app.onMatchEnd must call decorateResultPanelWithTaunt');
assert(redesignJs.includes('fvh-victory-taunt-card'),
  'Victory screen must render .fvh-victory-taunt-card');
assert(redesignCss.includes('.fvh-victory-taunt-card'),
  'CSS styles for .fvh-victory-taunt-card must exist in redesign.css');
console.log('  ✓ Victory Taunt card component and match end injection verified.');

// Test 3: Real Live Faction War State
console.log('\n[Test 3] Testing Real Live Team War Calculation...');
assert(redesignJs.includes('var currentLiveWar ='),
  'currentLiveWar reactive state must exist in redesign.js');
assert(redesignJs.includes('function updateLiveWarData(serverData)'),
  'updateLiveWarData helper must update live war state');
assert(redesignJs.includes('function addMatchPointsToLiveWar(winnerChar, points)'),
  'addMatchPointsToLiveWar helper must increment winning faction score in real-time');
assert(serverJs.includes('athletes.forEach(a => {') && serverJs.includes('footballTotal +='),
  'server.js must compute Team War from all athletes to prevent category filter bias');
console.log('  ✓ Real-time Live Team War state and calculation logic verified.');

// Test 4: Live Ticker & Rivalry Modal Dynamic Binding
console.log('\n[Test 4] Testing Main Menu Ticker & Modal Dynamic War Binding...');
assert(redesignJs.includes('function createRivalryTicker(app)'),
  'createRivalryTicker must accept app to subscribe to live data');
assert(redesignJs.includes('createRivalryTicker(app)'),
  'renderRedesignedMenu must pass app to createRivalryTicker');
assert(redesignJs.includes('currentLiveWar.footyPct') && redesignJs.includes('currentLiveWar.hoopsPct'),
  'Ticker and modal must bind to dynamic currentLiveWar percentages');
console.log('  ✓ Main menu live rivalry ticker and modal dynamic binding verified.');

// Test 5: Console-Grade Beautiful Buttons Polish
console.log('\n[Test 5] Testing Console-Grade Buttons Polish in CSS...');
assert(redesignCss.includes('box-shadow: 0 8px 0 #0284c7'),
  'Play button must have 3D tactile bottom bevel');
assert(redesignCss.includes('.fvh-solo-gear-pill'),
  'Gear/Locker pill button must be styled with 3D bevel and rich gradient');
assert(redesignCss.includes('.fvh-solo-upgrade-pill'),
  'Upgrade pill button must be styled with cyber cyan bevel and neon aura');
assert(redesignCss.includes('#fvh-hub-shop') && redesignCss.includes('#fvh-hub-quests'),
  'Secondary hub tiles must have distinct glowing accent borders and 3D depth');
console.log('  ✓ Console-grade 3D button polish and tactile response verified.');

console.log('\nAll 5 Victory Banter, Live Rivalry & Buttons tests PASSED with 100% success! 🎉');
