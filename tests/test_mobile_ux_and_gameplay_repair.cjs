// tests/test_mobile_ux_and_gameplay_repair.cjs
// Verification Suite for FOOTY vs HOOPS Mobile UX & Gameplay Repair

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== FOOTY vs HOOPS: Mobile UX & Gameplay Repair Suite ===\n');

// --------------------------------------------------------------------------
// 1. Scrolling Fix & Touch Interception Guards
// --------------------------------------------------------------------------
console.log('[RUN] Test 1: Scrolling Fix & Touch Interception Guards in js/game.js');
const gameJsPath = path.join(__dirname, '..', 'js', 'game.js');
const gameJsCode = fs.readFileSync(gameJsPath, 'utf8');

// 1.1: Hud.prototype.bindStick sets this.activeTouchId = null and this.stickPointer = -1
assert.ok(
  gameJsCode.includes('this.activeTouchId = null;'),
  'FAIL: this.activeTouchId must be managed on the Hud instance'
);

// 1.2: onTouchMove and onPointerMove must guard on root.hidden and activeTouchId
assert.ok(
  gameJsCode.includes('if (this.root.hidden || this.activeTouchId === null) return;'),
  'FAIL: onTouchMove must abort when HUD is hidden or no stick touch is active'
);
assert.ok(
  gameJsCode.includes('if (this.root.hidden || this.stickPointer === -1 || e.pointerId !== this.stickPointer) return;'),
  'FAIL: onPointerMove must abort when HUD is hidden or stick pointer is inactive'
);

// 1.3: Hud.prototype.resetState resets this.activeTouchId to null
assert.ok(
  gameJsCode.includes('this.activeTouchId = null;\n            this.stickPointer = -1;\n            this.resetBoost();'),
  'FAIL: resetState must clear this.activeTouchId to null'
);

// 1.4: Hud.prototype.show(false) calls resetState()
assert.ok(
  gameJsCode.includes('show(on) {\n            this.root.hidden = !on;\n            if (!on) {\n                this.resetState();\n            }\n        }'),
  'FAIL: show(false) must call resetState() so all touch tracking is cleared'
);

// 1.5: telegram.leaveMatch calls wa.exitFullscreen()
assert.ok(
  gameJsCode.includes('if (wa === null || wa === void 0 ? void 0 : wa.exitFullscreen)\n                    (_b = wa.exitFullscreen) === null || _b === void 0 ? void 0 : _b.call(wa);'),
  'FAIL: telegram.leaveMatch must call wa.exitFullscreen to exit iOS/Android Telegram fullscreen mode'
);

console.log('[PASS] Test 1: Scrolling touch guards and telegram.leaveMatch exitFullscreen verified.');

// --------------------------------------------------------------------------
// 2. CSS Main Screen Scrollable Styling
// --------------------------------------------------------------------------
console.log('[RUN] Test 2: CSS Main Screen Scrollable & Mobile Viewport Styling');
const cssPath = path.join(__dirname, '..', 'css', 'redesign.css');
const cssCode = fs.readFileSync(cssPath, 'utf8');

assert.ok(
  cssCode.includes('overflow-y: auto !important;\n  overflow-x: hidden !important;\n  -webkit-overflow-scrolling: touch !important;\n  touch-action: pan-y !important;'),
  'FAIL: .screen.menu-bg must have explicit overflow-y: auto, -webkit-overflow-scrolling: touch, and touch-action: pan-y'
);

console.log('[PASS] Test 2: CSS scrollable properties verified.');

// --------------------------------------------------------------------------
// 3. Removal of Social-Links Block from Main Screen
// --------------------------------------------------------------------------
console.log('[RUN] Test 3: Removal of Social-Links Block from Home Screen');
const redesignJsPath = path.join(__dirname, '..', 'js', 'redesign.js');
const redesignJsCode = fs.readFileSync(redesignJsPath, 'utf8');

// Ensure renderRedesignedMenu does not append createOfficialSocialsCard
const renderMenuFnMatch = redesignJsCode.match(/function renderRedesignedMenu\([\s\S]*?\n  \}/);
assert.ok(renderMenuFnMatch, 'FAIL: renderRedesignedMenu function not found in js/redesign.js');
const renderMenuFn = renderMenuFnMatch[0];
assert.ok(
  !renderMenuFn.includes('screen.appendChild(createOfficialSocialsCard(app));'),
  'FAIL: createOfficialSocialsCard must NOT be appended in renderRedesignedMenu'
);

// Ensure social channels remain accessible in Tasks screen
assert.ok(
  redesignJsCode.includes('function renderSocialTab()'),
  'FAIL: renderSocialTab must exist in js/redesign.js for Tasks screen'
);
assert.ok(
  redesignJsCode.includes("id: 'q_sub_tg'"),
  'FAIL: Telegram News task must exist in Tasks screen'
);
assert.ok(
  redesignJsCode.includes("id: 'q_sub_chat'"),
  'FAIL: Telegram Chat task must exist in Tasks screen'
);
assert.ok(
  redesignJsCode.includes("id: 'q_sub_insta'"),
  'FAIL: Instagram task must exist in Tasks screen'
);

console.log('[PASS] Test 3: Social block removed from home screen and preserved in Tasks.');

// --------------------------------------------------------------------------
// 4. Shop Respects Selected Faction
// --------------------------------------------------------------------------
console.log('[RUN] Test 4: Shop Respects Selected Faction');

// 4.1: buildShopPage must resolve playerFaction from selectedTeam || selectedCharacter
assert.ok(
  redesignJsCode.includes("var curChar = (app.store && app.store.data && (app.store.data.selectedTeam || app.store.data.selectedCharacter)) || 'footy';"),
  'FAIL: buildShopPage must read selectedTeam or selectedCharacter'
);

// 4.2: buildShopPage must not render interactive sport switcher buttons
const buildShopMatch = redesignJsCode.match(/function buildShopPage\([\s\S]*?\n  \}/);
assert.ok(buildShopMatch, 'FAIL: buildShopPage not found');
const buildShopFn = buildShopMatch[0];
assert.ok(
  !buildShopFn.includes('footySportBtn.onclick') && !buildShopFn.includes('hoopsSportBtn.onclick'),
  'FAIL: Shop must not offer sport switcher buttons that let the user view/switch to the other faction'
);

// 4.3: Cosmetic filtering strictly excludes the other sport
assert.ok(
  redesignJsCode.includes("if (curCategory === 'balls_footy') {\n          return it.category === 'balls_footy' && shopSport === 'footy';\n        }"),
  'FAIL: balls_footy must only be shown when shopSport === "footy"'
);
assert.ok(
  redesignJsCode.includes("if (curCategory === 'balls_hoops') {\n          return it.category === 'balls_hoops' && shopSport === 'hoops';\n        }"),
  'FAIL: balls_hoops must only be shown when shopSport === "hoops"'
);

console.log('[PASS] Test 4: Shop faction lock verified.');

// --------------------------------------------------------------------------
// 5. Basketball Complete Simulation & Gameplay Loop
// --------------------------------------------------------------------------
console.log('[RUN] Test 5: Basketball Complete Simulation & Gameplay Loop');

// Set up mock AMD environment to execute BasketballSim
const modules = {};
function define(name, deps, factory) {
  modules[name] = { deps, factory, exports: {} };
}

const simModules = [
  'core/audio', 'gfx/geometry', 'gfx/math', 'gfx/scene', 'gfx/renderer',
  'sim/types', 'sim/math', 'sim/base', 'sim/basketball', 'sim/football'
];

// Extract AMD definitions for simulation
simModules.forEach(modName => {
  const marker = `define("${modName}"`;
  const startIdx = gameJsCode.indexOf(marker);
  if (startIdx !== -1) {
    const nextDefine = gameJsCode.indexOf('\ndefine("', startIdx + marker.length);
    const chunk = (nextDefine !== -1) ? gameJsCode.slice(startIdx, nextDefine) : gameJsCode.slice(startIdx);
    try {
      eval(chunk);
    } catch (e) {
      // Ignore evaluation errors for modules with outer dependencies
    }
  }
});

// Helper to resolve AMD module
function requireMod(name) {
  const m = modules[name];
  if (!m) throw new Error(`Module ${name} not found`);
  if (!m.resolved) {
    const resolvedDeps = m.deps.map(d => {
      if (d === 'require') return requireMod;
      if (d === 'exports') return m.exports;
      return requireMod(d);
    });
    m.factory(...resolvedDeps);
    m.resolved = true;
  }
  return m.exports;
}

const bbMod = requireMod('sim/basketball');
const BasketballSim = bbMod.BasketballSim;

const sim = new BasketballSim({
  difficulty: 'normal',
  minutes: 2,
  skipCountdown: true
});

assert.strictEqual(sim.mode, 'hoops', 'Sim mode must be hoops');
assert.ok(sim.human, 'Sim must have a human player');
assert.strictEqual(sim.agents.length, 2, 'Sim must have 2 players in 1v1 match');

// 1. Initial possession and movement
assert.strictEqual(sim.ball.owner, sim.human, 'Human player must start with possession');
assert.ok(sim.ball.y > 0.5, 'Ball must be at dribble height');

// Simulate 10 frames of dribbling and movement
for (let i = 0; i < 10; i++) {
  sim.step(1 / 60, {
    moveX: 0,
    moveZ: -1,
    sprint: false,
    shootHeld: false,
    shootPressed: false,
    shootReleased: false,
    tackleHeld: false,
    tacklePressed: false,
    tackleReleased: false,
    passPressed: false
  });
}
assert.ok(sim.human.z < 6.5, 'Human player must move forward along negative Z towards opposing hoop');

// 2. Shot execution & auto-squaring
sim.humanShootRelease(sim.human, 0.8);
assert.strictEqual(sim.ball.owner, null, 'Ball must release into independent flight on shot');
assert.ok(sim.shot !== null, 'Shot object must be created');
assert.strictEqual(sim.shot.shooter, sim.human, 'Shooter must be human');
assert.ok(sim.ball.vy > 0, 'Ball must have positive upward vertical velocity on launch');

// 3. Basket award and score transition
const scoreBefore = sim.score[0];
const expectedPoints = sim.shot.points; // 3 points for distance >= THREE_R, 2 for inside arc
sim.awardBasket(1); // Team 0 scores on hoop 1
assert.strictEqual(sim.score[0], scoreBefore + expectedPoints, `Score must increment by ${expectedPoints}`);
assert.strictEqual(sim.phase, 'celebrate', 'Match phase must transition to celebrate');

// 4. Celebration to restart countdown loop
sim.afterCelebration();
assert.strictEqual(sim.phase, 'countdown', 'Match must transition to countdown after celebration');
assert.strictEqual(sim.ball.owner, sim.agents[1], 'Conceding team must receive ball possession on restart');

console.log('[PASS] Test 5: Basketball full possession, shot, score, and restart loop verified.');

// --------------------------------------------------------------------------
// 6. Online Football Lag Reduction & Latency Diagnostics
// --------------------------------------------------------------------------
console.log('[RUN] Test 6: Online Football Lag Reduction & Diagnostics');

// 6.1: Guest movement updates are throttled to 30Hz
assert.ok(
  gameJsCode.includes("const timeSinceLast = nowMs - this.lastSentAt;\n            if (edge || (sig !== this.lastSent && timeSinceLast >= 32) || timeSinceLast > 90) {"),
  'FAIL: OnlineSession.prototype.guestUpdate must throttle non-edge stick packets to 30Hz'
);

// 6.2: Server WebSocket relay forwards directly to peer without unnecessary array buffering
const serverJsPath = path.join(__dirname, '..', 'server', 'server.js');
const serverJsCode = fs.readFileSync(serverJsPath, 'utf8');
assert.ok(
  serverJsCode.includes("if (peerSocket && !peerSocket.destroyed && peerSocket.writable) {\n            peerSocket.write(makeWsTextFrame(text));\n          } else {"),
  'FAIL: Server must directly forward WebSocket frames without HTTP queue thrashing when peer is on WS'
);

// 6.3: Hud displays RTT latency metric in online matches
assert.ok(
  gameJsCode.includes("if (showFps || (this.cfg && this.cfg.online)) {"),
  'FAIL: Hud.prototype.update must track FPS & RTT when online is active'
);
assert.ok(
  gameJsCode.includes("this.fps.textContent = `${fpsVal} fps · ${rtt}ms`;"),
  'FAIL: Hud must display RTT latency in milliseconds'
);

console.log('[PASS] Test 6: Online lag optimization & RTT diagnostics verified.');

// --------------------------------------------------------------------------
// 7. Core Invariants Verification
// --------------------------------------------------------------------------
console.log('[RUN] Test 7: Core Invariants Check');

// Storage must be JsonStorageAdapter and Neon disconnected
const storageIndexJs = fs.readFileSync(path.join(__dirname, '..', 'server', 'storage', 'index.js'), 'utf8');
assert.ok(
  storageIndexJs.includes("new JsonStorageAdapter"),
  'FAIL: storage/index.js must use JsonStorageAdapter'
);
assert.ok(
  serverJsCode.includes("storageAdapter: storage ? storage.name : 'JsonStorageAdapter'"),
  'FAIL: server.js must report JsonStorageAdapter'
);

// Exact Stars pricing preserved
const starsPrices = [
  { coins: 100, stars: 25 },
  { coins: 500, stars: 100 },
  { coins: 1200, stars: 220 },
  { coins: 3000, stars: 500 }
];
starsPrices.forEach(p => {
  assert.ok(
    redesignJsCode.includes(`starsPrice: ${p.stars}`),
    `FAIL: Stars price for package must be ${p.stars}`
  );
});

console.log('[PASS] Test 7: Core invariants intact.');

console.log('\n=================================================================');
console.log('ALL MOBILE UX & GAMEPLAY REPAIR TESTS PASSED (7/7)!');
console.log('=================================================================');
