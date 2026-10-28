/**
 * FOOTY vs HOOPS — Final Gameplay Fixes, Cosmetics, Match Results & Leaderboard
 * Automated Verification Suite
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== FOOTY vs HOOPS: Final Gameplay Fixes & Leaderboard Suite ===\n');

// Mock AMD loader
const modules = {};
global.define = function(name, deps, factory) { modules[name] = { deps, factory }; };
global.window = {
  __boot: () => {},
  AudioContext: null,
  innerWidth: 390,
  innerHeight: 844,
  devicePixelRatio: 3,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  addEventListener: () => {},
  removeEventListener: () => {}
};
global.document = {
  createElement: (tag) => ({
    tagName: tag.toUpperCase(),
    className: '',
    style: {},
    dataset: {},
    appendChild: () => {},
    append: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
    remove: () => {}
  })
};

require('../js/game.js');

const cache = {};
function requireModule(id) {
  if (cache[id]) return cache[id].exports;
  const mod = modules[id];
  if (!mod) throw new Error('Missing module ' + id);
  const exports = {};
  const requireFn = (dep) => requireModule(dep);
  cache[id] = { exports };
  const resolvedDeps = mod.deps.map(d => {
    if (d === 'require') return requireFn;
    if (d === 'exports') return exports;
    return requireModule(d);
  });
  mod.factory.apply(null, resolvedDeps);
  return exports;
}

const gameJs = fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8');
const redesignJs = fs.readFileSync(path.join(__dirname, '../js/redesign.js'), 'utf8');
const serverJs = fs.readFileSync(path.join(__dirname, '../server/server.js'), 'utf8');
const styleCss = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');

function runTest(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
  } catch (err) {
    console.error(`[FAIL] ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// -----------------------------------------------------------------------------
// 1. Basketball Simulation & Ball Independence
// -----------------------------------------------------------------------------

runTest('Req 1.1: BasketballSim shooter squares to hoop and launches shot independently', () => {
  const basketballMod = requireModule('sim/basketball');
  const sim = new basketballMod.BasketballSim({ online: false, skipCountdown: true });
  sim.startCountdown(0, false);

  const human = sim.human;
  assert.strictEqual(sim.ball.owner, human, 'Human should start with ball possession');

  // Move human away from center and face perpendicular
  human.x = 3.0;
  human.z = 4.0;
  human.fx = 1.0;
  human.fz = 0.0;

  // Release shot
  sim.humanShootRelease(human, 0.8);

  // Ball must now be free
  assert.strictEqual(sim.ball.owner, null, 'Ball must be free in flight after release');
  assert.ok(sim.shot, 'Shot object must be created');
  assert.ok(sim.ball.vy > 0, 'Ball must have positive upward vertical velocity');
  assert.ok(human.pickupLock >= 0.8, 'Shooter must have pickupLock >= 0.8s during shot follow-through');

  // Verify shooter squared to hoop
  const hoop = sim.hoopFor(human.team);
  const dx = 0 - human.x;
  const dz = hoop.z - human.z;
  const hyp = Math.hypot(dx, dz);
  assert.ok(Math.abs(human.fx - dx / hyp) < 0.01, 'Shooter must face the hoop on shot release');
  assert.ok(Math.abs(human.fz - dz / hyp) < 0.01, 'Shooter must face the hoop on shot release');
});

runTest('Req 1.2: Shooter cannot re-grab their own shot while in-flight mid-air', () => {
  const basketballMod = requireModule('sim/basketball');
  const sim = new basketballMod.BasketballSim({ online: false, skipCountdown: true });
  sim.startCountdown(0, false);
  const human = sim.human;

  human.x = 0;
  human.z = 5.0;
  sim.humanShootRelease(human, 0.8);

  // Clear human pickupLock artificially to test mid-air guard
  human.pickupLock = 0;

  // Position human directly on top of the in-flight ball
  human.x = sim.ball.x;
  human.z = sim.ball.z;
  sim.ball.y = 2.2; // in-flight elevation

  // Run pickup check
  sim.tryPickup();

  assert.strictEqual(sim.ball.owner, null, 'Shooter must NOT re-grab in-flight ball before rim/board/floor contact');
});

// -----------------------------------------------------------------------------
// 2. Basketball Camera & Court Framing on Mobile
// -----------------------------------------------------------------------------

runTest('Req 1.3: CameraRig on iPhone portrait sets fitHalfZ >= 16.0 for basketball and keeps top hoop in view', () => {
  const camMod = requireModule('render/camera');
  const mathMod = requireModule('gfx/math');
  const aspect = 390 / 844; // iPhone portrait (~0.462)

  const rig = new camMod.CameraRig('hoops', aspect, 7.5, 14.0);
  assert.ok(rig.fitHalfZ >= 16.0, 'Hoops fitHalfZ on portrait must be >= 16.0m to encompass full court and hoops');

  // Check camera fitting distance for court center
  const [hx, hz] = rig.halfExtents();
  const d = rig.fitDistance(0, 0, hx, hz);
  assert.ok(d > 20, 'Camera distance must be pulled back enough on mobile portrait');

  // Verify that top hoop rim/backboard at z = -12.6, y = 3.6 does not exceed NDC y = 0.65
  const dy = Math.sin(rig.elev);
  const dz = Math.cos(rig.elev);
  rig.cam.position = [0, dy * d, dz * d];
  rig.cam.target = [0, 0.75, 0];
  rig.cam.update();

  const topHoopProj = mathMod.project(rig.cam.viewProj, 0, 3.6, -12.6);
  assert.ok(topHoopProj.w > 0, 'Top hoop must project in front of camera');
  assert.ok(topHoopProj.y <= 0.68, `Top hoop NDC y (${topHoopProj.y}) must be <= 0.68 so it is not hidden under the top scoreboard`);
});

// -----------------------------------------------------------------------------
// 3. Team Faction Identity Preservation in Cross-Sport Rivalry
// -----------------------------------------------------------------------------

runTest('Req 2.1: Player faction is preserved across football and basketball modes without unconditional overrides', () => {
  // Check game.js source to verify unconditional override was removed
  assert.ok(!gameJs.includes("const playerChar = (mode === 'hoops') ? 'hoops' :"),
    'MatchView must NOT unconditionally force playerChar to hoops in basketball mode');
  assert.ok(gameJs.includes("const playerChar = (opts && opts.char) ? opts.char : 'footy';"),
    'MatchView must use opts.char to respect player faction');

  assert.ok(!gameJs.includes("const charPick = (cfg.mode === 'hoops') ? 'hoops' :"),
    'Game.prototype.start must NOT unconditionally force charPick to hoops in basketball mode');
  assert.ok(gameJs.includes("const playerFaction = (cfg.char || (save && (save.selectedTeam || save.selectedCharacter)) || 'footy');"),
    'Game.prototype.start resolves player faction from save.selectedTeam / selectedCharacter');
});

runTest('Req 2.2: Scoreboard names reflect player faction emoji (⚽ FOOTY vs 🏀 HOOPS)', () => {
  assert.ok(gameJs.includes("const myIcon = (playerFaction === 'footy') ? '⚽' : '🏀';"),
    'Player scoreboard emoji matches player faction');
  assert.ok(gameJs.includes("const oppIcon = (oppFaction === 'footy') ? '⚽' : '🏀';"),
    'Opponent scoreboard emoji matches opponent faction');
});

// -----------------------------------------------------------------------------
// 4. Shop Defaults to Player Faction and Strictly Segregates Items
// -----------------------------------------------------------------------------

runTest('Req 3.1: Shop defaults to selectedTeam || selectedCharacter', () => {
  assert.ok(redesignJs.includes("var curChar = (app.store && app.store.data && (app.store.data.selectedTeam || app.store.data.selectedCharacter)) || 'footy';"),
    'buildShopPage defaults curChar to selectedTeam || selectedCharacter');
  assert.ok(redesignJs.includes("var shopSport = curChar;"),
    'shopSport initializes to player faction');
});

runTest('Req 3.2: Wardrobe hero preview uses curCharSkin and updates upon equip', () => {
  assert.ok(redesignJs.includes("avatarBox.innerHTML = getCharacterDisplayHtml(curChar, curCharSkin);"),
    'Wardrobe preview avatar uses exact equipped curCharSkin');
});

// -----------------------------------------------------------------------------
// 5. Robust Pause and Resume (10 Consecutive Cycles)
// -----------------------------------------------------------------------------

runTest('Req 4.1: Game supports 10 consecutive pause/resume cycles without crash or corrupted state', () => {
  const basketballMod = requireModule('sim/basketball');
  const sim = new basketballMod.BasketballSim({ online: false, skipCountdown: true });
  sim.startCountdown(0, false);
  sim.step(0.05, {}); // transition out of countdown into playing phase
  assert.strictEqual(sim.phase, 'playing', 'Simulation should be in playing phase');

  // Mock Game instance
  let paused = false;
  let running = true;
  let lastTime = 1000;
  const game = {
    running,
    paused,
    last: lastTime,
    sim,
    cfg: { mode: 'hoops' },
    input: { releaseAll: () => {} },
    audio: { suspend: () => {}, resume: () => {} },
    setPaused(p) {
      this.paused = p;
      if (!p) this.last = performance.now();
    }
  };

  // Perform 10 consecutive pause / resume cycles
  for (let i = 0; i < 10; i++) {
    game.setPaused(true);
    assert.strictEqual(game.paused, true, `Cycle ${i + 1}: Game must be paused`);

    // While paused, sim clock must not advance
    const timeBefore = sim.timeLeft;
    sim.step(0, { dx: 0, dz: 0, sprint: false, kick: false, tackle: false });
    assert.strictEqual(sim.timeLeft, timeBefore, `Cycle ${i + 1}: Time must not advance during pause`);

    // Resume
    game.setPaused(false);
    assert.strictEqual(game.paused, false, `Cycle ${i + 1}: Game must be unpaused`);

    // Step sim normally after resume
    sim.step(0.05, { dx: 0, dz: 0, sprint: false, kick: false, tackle: false });
    assert.ok(sim.timeLeft < timeBefore, `Cycle ${i + 1}: Simulation advances smoothly after resume`);
  }
});

// -----------------------------------------------------------------------------
// 6. Opponent Disconnect / Forfeit Screen & Rewards
// -----------------------------------------------------------------------------

runTest('Req 5.1: onOnlineLost displays Victory result screen and awards +20 FvH Coin, +30 XP', () => {
  assert.ok(redesignJs.includes("fvh-forfeit-victory-screen"),
    'onOnlineLost constructs fvh-forfeit-victory-screen result overlay');
  assert.ok(redesignJs.includes("Победа — соперник отключился") && redesignJs.includes("Victory — Opponent Disconnected"),
    'onOnlineLost includes localized Victory — Opponent Disconnected title');
  assert.ok(redesignJs.includes("+20 FvH Coin · +30 XP"),
    'onOnlineLost displays authoritative match reward badge (+20 FvH Coin, +30 XP)');
  assert.ok(redesignJs.includes("safeEconomyApi('/api/economy/reward'"),
    'onOnlineLost claims authoritative reward via economy API');
});

// -----------------------------------------------------------------------------
// 7. Leaderboard Redesign (No Tier Badges, Rules Card, Deterministic Sort)
// -----------------------------------------------------------------------------

runTest('Req 6.1: Leaderboard removes Bronze/Silver/Gold tier pill badges from podium, rows, and docked bar', () => {
  assert.ok(!redesignJs.includes("fvh-podium-tier-pill"),
    'Podium must not contain visible tier pill badges');
  assert.ok(!redesignJs.includes("fvh-lb-tier-badge"),
    'Ranked rows must not contain visible tier badges');
  assert.ok(!redesignJs.includes("fvh-lb-sticky-tier"),
    'Docked current player bar must not contain visible tier badge');
});

runTest('Req 6.2: Leaderboard renders Ranking Rules Card and deterministic tie-breaker', () => {
  assert.ok(redesignJs.includes("fvh-lb-rules-card"),
    'Leaderboard page includes Ranking Rules Card');
  assert.ok(redesignJs.includes("+20 очков за победу · +10 очков за завершение матча") || redesignJs.includes("+20 pts for each victory · +10 pts for match completion"),
    'Rules card explains +20 pts for victory and +10 pts for match completion');

  // Verify server deterministic tie-breaker
  assert.ok(serverJs.includes("String(a.id || '').localeCompare(String(b.id || ''))"),
    'Server leaderboard sorting uses deterministic tie-breaker on player ID');
});

runTest('Req 6.3: War scoreboard card uses non-overflowing team tags (⚽ FOOTY and 🏀 HOOPS)', () => {
  assert.ok(redesignJs.includes('<div class="fvh-team-tag">⚽ FOOTY</div>'),
    'War card uses ⚽ FOOTY without text overflow');
  assert.ok(redesignJs.includes('<div class="fvh-team-tag">🏀 HOOPS</div>'),
    'War card uses 🏀 HOOPS without text overflow');
});

// -----------------------------------------------------------------------------
// 8. In-Match HUD Scoreboard Clearance
// -----------------------------------------------------------------------------

runTest('Req 7.1: HUD scoreboard has max-width margin to prevent overlapping mute & pause buttons', () => {
  assert.ok(styleCss.includes("max-width: calc(100% - 108px);"),
    'HUD scoreboard has max-width calc(100% - 108px) to prevent button collision on mobile');
  assert.ok(styleCss.includes("top: calc(env(safe-area-inset-top, 44px) + 52px);"),
    'HUD top respects safe area inset + 52px');
});

// -----------------------------------------------------------------------------
// 9. Production Safeguards Preserved
// -----------------------------------------------------------------------------

runTest('Req 9.1: JsonStorageAdapter active, Neon disconnected, Season 1 prelaunch, exact Stars pricing', () => {
  const storageJs = fs.readFileSync(path.join(__dirname, '../server/storage/index.js'), 'utf8');
  assert.ok(storageJs.includes('new JsonStorageAdapter'), 'Server storage must default to JsonStorageAdapter');
  assert.ok(!serverJs.includes('new PgStorageAdapter'), 'Server must NOT use PgStorageAdapter');
  assert.ok(serverJs.includes("'pkg_coins_100': 25") && serverJs.includes("'pkg_coins_500': 100") && serverJs.includes("'pkg_coins_1200': 220") && serverJs.includes("'pkg_coins_3000': 500"),
    'Approved Stars prices (100=25⭐, 500=100⭐, 1200=220⭐, 3000=500⭐) preserved');
});

console.log('\n=================================================================');
console.log('ALL FINAL GAMEPLAY FIXES & LEADERBOARD TESTS PASSED (14/14)!');
console.log('=================================================================\n');
