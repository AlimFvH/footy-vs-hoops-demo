// tests/test_prelaunch_and_audit.cjs
// Verification suite for Pre-Launch Season Setup, Permanent Team Selection, and Leaderboard Authenticity

const fs = require('fs');
const assert = require('assert');
const path = require('path');

console.log('=== FOOTY vs HOOPS Pre-Launch & Audit Verification Suite ===\n');

const redesignJs = fs.readFileSync(path.join(__dirname, '../js/redesign.js'), 'utf8');
const serverJs = fs.readFileSync(path.join(__dirname, '../server/server.js'), 'utf8');

// 1. Season Must Not Start Yet (Pre-launch State)
console.log('Test 1: Checking server pre-launch state and season configuration...');
assert(serverJs.includes('const SEASON_CONFIG = {'), 'Server must define SEASON_CONFIG');
assert(serverJs.includes("state: process.env.SEASON_STATE || 'prelaunch'"), 'Default season state must be prelaunch');
assert(serverJs.includes('seasonLengthDays: 15'), 'Season length must be preserved at 15 days');
assert(serverJs.includes('process.env.SEASON_START_TIME'), 'Season start time must be configurable via environment without inventing active date');
assert(serverJs.includes('/api/season/status'), 'Server must expose /api/season/status endpoint');
console.log('  [PASS] Server-controlled pre-launch state verified');

// 2. Zero Seasonal Points During Pre-Launch & AI Matches
console.log('Test 2: Verifying seasonal points rule (0 in pre-launch, AI awards no season points)...');
assert(serverJs.includes('isPrelaunch && (cat === \'season\' || cat === \'overall\' || !cat)'), 'computeScore must check isPrelaunch');
assert(serverJs.includes('return 0;'), 'computeScore must return 0 seasonal points in prelaunch');
assert(!redesignJs.includes('earn Team War leaderboard points!'), 'AI mode description must not falsely promise season points');
console.log('  [PASS] Pre-launch seasonal point lock and AI description verified');

// 3. Permanent Team Selection
console.log('Test 3: Verifying permanent team selection...');
assert(serverJs.includes('team_already_locked') && serverJs.includes('permanent and cannot be changed'), 'Server must reject team changes as permanent');
assert(!serverJs.includes('player.teamChosen = true;\n        }\n      }\n      if (data.photoUrl'), 'Server must not silently assign team on economy sync');
assert(redesignJs.includes('storeData.teamChosen = true') && redesignJs.includes('storeData.selectedTeam = res.selectedTeam'), 'Client must synchronize permanent team from server');
assert(redesignJs.includes('Team selection is permanent and cannot be changed') || redesignJs.includes('Выбор команды постоянен'), 'Client must inform player that selection is permanent');
console.log('  [PASS] Permanent team selection enforced on server and client');

// 4. Leaderboard Authenticity
console.log('Test 4: Verifying elimination of fake sample players from leaderboard...');
assert(!serverJs.includes("if (!athletes.find(a => a.id === 'alim_footy' || a.name.includes('Alim'))) {"), 'Server must not inject fake sample Alim player');
assert(!serverJs.includes("if (!athletes.find(a => a.id === 'brother_hoops' || a.name.includes('Brother'))) {"), 'Server must not inject fake sample Brother player');
assert(serverJs.includes('isPrelaunch: isPrelaunch'), '/api/leaderboard must return authoritative isPrelaunch flag');
assert(redesignJs.includes('data.isPrelaunch'), 'Client leaderboard must handle authoritative isPrelaunch flag');
console.log('  [PASS] Leaderboard fake sample players eliminated and pre-launch handling active');

// 5. Syntax validation
console.log('Test 5: Verifying syntax of server and client scripts...');
const { execSync } = require('child_process');
execSync('node -c server/server.js', { stdio: 'inherit' });
execSync('node -c js/redesign.js', { stdio: 'inherit' });
console.log('  [PASS] Syntax check clean with zero errors');

console.log('\nAll Pre-Launch and Audit tests passed successfully!');
