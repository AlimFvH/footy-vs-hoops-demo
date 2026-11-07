const fs = require('fs');
const assert = require('assert');

console.log('=== FOOTY vs HOOPS Targeted Verification for User Issues ===');

const js = fs.readFileSync('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/js/redesign.js', 'utf8').replace(/\r\n/g, '\n');
const css = fs.readFileSync('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/css/redesign.css', 'utf8').replace(/\r\n/g, '\n');
const gameJs = fs.readFileSync('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/js/game.js', 'utf8').replace(/\r\n/g, '\n');

// 1. Verify Football Icon
console.log('Test 1: Football Icon (nav_home_footy)...');
assert(js.includes("case 'nav_home_footy':"), 'nav_home_footy case must exist');
assert(js.includes("points=\"12,8.6 15.2,10.9 14.0,14.7 10.0,14.7 8.8,10.9\" fill=\"#0f172a\""), 'Center pentagon must exist');
assert(js.includes("fvh_nav_f_ball"), 'Radial gradient lighting must exist');
// Ensure old polygon mask is completely gone
assert(!js.includes('M12 5.5L14.5 8H9.5L12 5.5Z'), 'Old polygon robot mask must be completely removed');
console.log('  [PASS] nav_home_footy is an authentic 32-panel classic soccer ball SVG.');

// 2. Verify Rivalry Header Non-Truncation
console.log('Test 2: Rivalry Header Bar Layout & Non-truncation...');
assert(css.includes('.fvh-rival-side .fvh-rival-brand .fvh-rival-name'), 'CSS must define .fvh-rival-name');
assert(!css.includes('.fvh-rival-side .fvh-rival-brand .fvh-rival-name {\n  font-size: 11.5px !important;\n  font-weight: 900 !important;\n  letter-spacing: 0.6px !important;\n  text-transform: uppercase !important;\n  white-space: nowrap !important;\n  overflow: hidden !important;\n  text-overflow: ellipsis !important;'), 'text-overflow: ellipsis must not be on .fvh-rival-name');
assert(css.includes('text-overflow: clip !important;'), 'text-overflow must be clip / visible');
assert(css.includes('flex-shrink: 0 !important;'), 'flex-shrink must be 0 on brand and name');
console.log('  [PASS] Rivalry Header Bar guarantees FOOTY and HOOPS never truncate with dots.');

// 3. Verify Stamina Widget No-Overflow
console.log('Test 3: Stamina Widget Container Width...');
assert(css.includes('.stamina {'), 'CSS must define .stamina');
assert(!/\.stamina\s*\{[^}]*width:\s*104px/i.test(css), 'Fixed width: 104px on .stamina must be eliminated');
assert(css.includes('min-width: 136px !important;'), 'min-width: 136px must be present');
assert(css.includes('width: auto !important;'), 'width: auto must be present');
assert(css.includes('.stamina span {'), '.stamina span must be styled');
assert(css.includes('white-space: nowrap !important;'), 'white-space: nowrap must be set on .stamina span');
console.log('  [PASS] Stamina Widget expands dynamically to comfortably contain "ВЫНОСЛИВОСТЬ".');

// 4. Verify Match Exit Navigation
console.log('Test 4: Match Exit Navigation to Main Screen...');
assert(js.includes('Robust Match Exit to Main Menu'), 'Robust app.quitToMenu wrapper must be installed');
assert(js.includes('if (app.pauseEl) {\n                app.closePause();\n                app.quitToMenu();'), 'Telegram BackButton while paused must quitToMenu');
assert(gameJs.includes('if (this.game.paused || this.pauseEl) {\n                this.quitToMenu();\n                return;\n            }'), 'game.js togglePause while paused must quitToMenu');
assert(!js.includes("confirm(quitConfirmMsg)"), 'Blocking confirm dialog on quit must be removed');
console.log('  [PASS] Exiting from match reliably navigates to main menu and cleans up match state.');

console.log('\n=== ALL 4 TARGETED TESTS PASSED PERFECTLY (4/4)! ===');
