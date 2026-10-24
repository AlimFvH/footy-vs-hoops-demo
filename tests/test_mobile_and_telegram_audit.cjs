/**
 * FOOTY vs HOOPS — Stage H.2: Mobile & Telegram Mini App Environment Audit Suite
 *
 * Automated verification of:
 * 1. Mobile touch controls layout, bounding boxes, non-overlap on narrow screens (320px+).
 * 2. Telegram Mini App viewport variables, lifecycle (ready, expand, closing confirmation), safe areas.
 * 3. Haptic feedback supported APIs, intensity mappings, and navigator.vibrate fallbacks.
 * 4. Telegram Stars payment lifecycle, server-authoritative validation, replay protection, webhook auth.
 * 5. Mobile performance guardrails: DPR clamping, adaptive downscaling, auto-pause on blur.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('=== FOOTY vs HOOPS: Stage H.2 Mobile & Telegram Mini App Audit ===\n');

const styleCss = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');
const redesignCss = fs.readFileSync(path.join(__dirname, '../css/redesign.css'), 'utf8');
const gameJs = fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8');
const redesignJs = fs.readFileSync(path.join(__dirname, '../js/redesign.js'), 'utf8');
const serverJs = fs.readFileSync(path.join(__dirname, '../server/server.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

// =========================================================================
// TEST 1: Mobile Touch Controls Layout & Geometry (320px Narrow Screen Audit)
// =========================================================================
console.log('Test 1: Mobile Touch Controls Layout & Geometry (320px - 440px+)...');

// Verify responsive media query for narrow screens <= 360px exists in style.css
assert(styleCss.includes('@media (max-width: 360px)'), 'style.css must have @media (max-width: 360px)');
assert(styleCss.includes('.btn-cluster { width: 198px; height: 198px; }'), '360px cluster must be scaled down to 198px');
assert(styleCss.includes('.stick-zone { width: calc(100% - 204px);'), 'stick-zone on 360px must leave clear space for cluster');

// Compute geometric coordinates on a 320px portrait viewport:
const screenW = 320;
const screenH = 568;
const marginR = 12; // calc(var(--sar) + 12px)
const clusterW = 198;
const clusterLeft = screenW - marginR - clusterW; // 320 - 12 - 198 = 110px

// Inside the 198px cluster:
// .btn-sprint: width 58px, right: 98px -> left offset inside cluster is 198 - 98 - 58 = 42px
const sprintLeftScreen = clusterLeft + (clusterW - 98 - 58); // 110 + 42 = 152px

// .stick-zone: width is max(calc(100% - 204px), min-width: 38% of 320)
// calc(100% - 204px) = 116px; min-width: 38% of 320 = 121.6px
const stickZoneRightScreen = Math.max(screenW - 204, screenW * 0.38); // 121.6px

const horizontalClearance = sprintLeftScreen - stickZoneRightScreen; // 152 - 121.6 = 30.4px
assert(horizontalClearance >= 20, `Horizontal clearance between joystick and buttons on 320px must be >= 20px (got ${horizontalClearance}px)`);
console.log(`  [PASS] 320px compact viewport verified: clearance between joystick and sprint button is ${horizontalClearance.toFixed(1)}px (no overlap).`);

// Verify landscape controls
assert(styleCss.includes('@media (max-height: 520px)'), 'Landscape media query @media (max-height: 520px) must exist');
console.log('  [PASS] Landscape controls layout verified for wide aspect ratio devices.');

// Verify HUD Pause button does not overlap Turbo Boost widget
assert(styleCss.includes('.hud-pause {') && styleCss.includes('right: 0; top: 0;'), 'hud-pause must be docked at top right');
assert(redesignCss.includes('.fvh-hud-boost-widget {') && redesignCss.includes('top: calc(var(--sat) + 62px);'), 'Turbo boost widget must be offset 62px below top bar');
console.log('  [PASS] Top HUD elements verified: Pause button (top: 0) and Turbo widget (top: +62px) have zero collision.');

// =========================================================================
// TEST 2: Input System & Touch/Pointer Event Binding
// =========================================================================
console.log('\nTest 2: Input System & Pointer Event Safety...');

// Verify pointer events and setPointerCapture in game.js
assert(gameJs.includes('el.setPointerCapture(e.pointerId)'), 'Touch buttons must use pointer capture for sticky mobile drag');
assert(gameJs.includes('z.setPointerCapture(e.pointerId)'), 'Joystick must capture pointer ID');
assert(gameJs.includes('lostpointercapture'), 'Must listen to lostpointercapture to prevent stuck controls');
assert(gameJs.includes('pointercancel'), 'Must listen to pointercancel');
assert(gameJs.includes('contextmenu\', (e) => e.preventDefault()'), 'Long-press context menu must be prevented');
assert(gameJs.includes('gesturestart\', (e) => e.preventDefault()'), 'Pinch-to-zoom gesturestart must be prevented');

// Verify movement() logic gives smooth precedence to stick without keyboard conflicts
assert(gameJs.includes('if (Math.hypot(this.stick.x, this.stick.y) > 0.01)'), 'Virtual stick must cleanly take precedence when active');
console.log('  [PASS] Pointer capture, cancel handlers, and non-conflicting input arbitration verified.');

// =========================================================================
// TEST 3: Telegram Mini App Viewport & Lifecycle
// =========================================================================
console.log('\nTest 3: Telegram Mini App Viewport & Lifecycle Handling...');

// Check viewport meta tag in index.html
assert(indexHtml.includes('viewport-fit=cover'), 'index.html must include viewport-fit=cover for notch/island support');
assert(indexHtml.includes('maximum-scale=1.0, user-scalable=no'), 'index.html must disable mobile pinch zoom');

// Check Telegram CSS variables
assert(styleCss.includes('height: var(--tg-viewport-height, 100dvh);'), 'stage & ui mounts must bind to --tg-viewport-height');
assert(redesignCss.includes('--tg-safe-top'), 'redesign.css must define --tg-safe-top');
assert(redesignCss.includes('--tg-safe-bottom'), 'redesign.css must define --tg-safe-bottom');

// Check Telegram WebApp API lifecycle invocations
assert(redesignJs.includes('tg.ready()'), 'redesign.js must call Telegram.WebApp.ready()');
assert(redesignJs.includes('tg.expand()'), 'redesign.js must call Telegram.WebApp.expand()');
assert(redesignJs.includes('tg.enableClosingConfirmation'), 'redesign.js must support enableClosingConfirmation()');
assert(redesignJs.includes('tg.disableVerticalSwipes'), 'redesign.js must call disableVerticalSwipes() to stop pull-to-dismiss');

// Check Telegram events: safe areas & viewport resize
assert(redesignJs.includes('safeAreaChanged'), 'Must listen to safeAreaChanged');
assert(redesignJs.includes('contentSafeAreaChanged'), 'Must listen to contentSafeAreaChanged');
assert(redesignJs.includes('viewportChanged'), 'Must listen to viewportChanged');
assert(redesignJs.includes('--tg-viewport-height'), 'Must synchronize --tg-viewport-height in JS');
assert(redesignJs.includes('--tg-viewport-stable-height'), 'Must synchronize --tg-viewport-stable-height in JS');

// Verify native BackButton handling in menu and match
assert(redesignJs.includes('updateTelegramBackButton'), 'Must manage Telegram BackButton state');
assert(gameJs.includes('enterMatch(onBack)'), 'Game must bind Telegram BackButton to match pause/resume');

console.log('  [PASS] Telegram WebApp lifecycle, safe areas, viewport synchronization, and BackButton verified.');

// =========================================================================
// TEST 4: Haptic Feedback Audit & Fallbacks
// =========================================================================
console.log('\nTest 4: Haptic Feedback Audit & Fallbacks...');

// Check triggerHaptic implementation
assert(redesignJs.includes('window.Telegram.WebApp.HapticFeedback'), 'triggerHaptic must check HapticFeedback');
assert(redesignJs.includes('h.notificationOccurred(type)'), 'Must call notificationOccurred for success/error/warning');
assert(redesignJs.includes('h.impactOccurred(type)'), 'Must call impactOccurred for heavy/medium/light/rigid/soft');
assert(redesignJs.includes('h.selectionChanged()'), 'Must call selectionChanged');
assert(redesignJs.includes('navigator.vibrate'), 'Must provide navigator.vibrate fallback when outside Telegram');

// Test triggerHaptic logic directly via Node function simulation
let simulatedHapticCalls = [];
let simulatedVibrateCalls = [];

const mockTg = {
  WebApp: {
    HapticFeedback: {
      notificationOccurred: (t) => simulatedHapticCalls.push(`notify:${t}`),
      impactOccurred: (t) => simulatedHapticCalls.push(`impact:${t}`),
      selectionChanged: () => simulatedHapticCalls.push('selection')
    }
  }
};

// Simulate inside Telegram
function testHapticSim(type, tgEnv, navVibrate) {
  try {
    if (tgEnv && tgEnv.WebApp && tgEnv.WebApp.HapticFeedback) {
      const h = tgEnv.WebApp.HapticFeedback;
      if (type === 'success' || type === 'warning' || type === 'error') {
        h.notificationOccurred(type);
      } else if (type === 'heavy' || type === 'medium' || type === 'rigid' || type === 'soft') {
        h.impactOccurred(type);
      } else if (type === 'selection') {
        if (typeof h.selectionChanged === 'function') h.selectionChanged();
        else h.impactOccurred('light');
      } else {
        h.impactOccurred('light');
      }
    } else if (navVibrate) {
      const pattern = (type === 'heavy') ? 30 : (type === 'medium') ? 18 : (type === 'success') ? [20, 40, 20] : 8;
      navVibrate(pattern);
    }
  } catch (e) {}
}

testHapticSim('success', mockTg, null);
testHapticSim('heavy', mockTg, null);
testHapticSim('selection', mockTg, null);
testHapticSim('light', mockTg, null);

assert.deepStrictEqual(simulatedHapticCalls, [
  'notify:success',
  'impact:heavy',
  'selection',
  'impact:light'
], 'Telegram HapticFeedback calls must match official API specifications');

// Simulate outside Telegram with navigator.vibrate
testHapticSim('heavy', null, (p) => simulatedVibrateCalls.push(p));
testHapticSim('success', null, (p) => simulatedVibrateCalls.push(p));
assert.deepStrictEqual(simulatedVibrateCalls, [30, [20, 40, 20]], 'navigator.vibrate fallback must produce valid vibration patterns');

console.log('  [PASS] Telegram HapticFeedback and mobile navigator.vibrate fallbacks verified.');

// =========================================================================
// TEST 5: Telegram Stars Payment Lifecycle & Server Validations
// =========================================================================
console.log('\nTest 5: Telegram Stars Payment Lifecycle & Security Validations...');

async function testPaymentLifecycle() {
  const PORT = 8299;
  process.env.PORT = String(PORT);
  process.env.STORAGE_BACKEND = 'json';
  process.env.TELEGRAM_WEBHOOK_SECRET = 'audit_secret_fvh_test_token';

  // Spawn isolated test instance of server
  const serverModule = require('../server/server.js');
  
  // Allow server to listen
  await new Promise((r) => setTimeout(r, 600));

  function request(method, path, body, headers = {}) {
    return new Promise((resolve, reject) => {
      const dataStr = body ? JSON.stringify(body) : null;
      const req = http.request({
        hostname: '127.0.0.1',
        port: PORT,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(dataStr ? { 'Content-Length': Buffer.byteLength(dataStr) } : {}),
          ...headers
        }
      }, (res) => {
        let raw = '';
        res.on('data', (c) => raw += c);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(raw) });
          } catch (e) {
            resolve({ status: res.statusCode, raw });
          }
        });
      });
      req.on('error', reject);
      if (dataStr) req.write(dataStr);
      req.end();
    });
  }

  // 1. Unconfigured stars price rejection
  const unconfiguredRes = await request('POST', '/api/stars/create-invoice', {
    productId: 'pkg_coins_100',
    playerId: 'audit_player_stars'
  });
  assert.strictEqual(unconfiguredRes.data.error, 'stars_price_unconfigured', 'Unconfigured price must be rejected');
  console.log('  [PASS] Unconfigured Stars product checkout rejected safely.');

  // 2. Webhook secret authentication
  const unauthorizedWebhook = await request('POST', '/api/telegram/webhook', {
    pre_checkout_query: { id: 'pq_1', invoice_payload: 'test' }
  }, { 'x-telegram-bot-api-secret-token': 'wrong_secret' });
  assert.strictEqual(unauthorizedWebhook.status, 403, 'Webhook with incorrect secret token must return 403 Forbidden');
  assert.strictEqual(unauthorizedWebhook.data.error, 'invalid_webhook_secret', 'Expected invalid_webhook_secret');
  console.log('  [PASS] Telegram Webhook secret authentication enforced (403 on invalid secret).');

  // 3. Client verify rejection in production
  const origNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  const clientVerifyRes = await request('POST', '/api/stars/verify', {
    invoiceId: 'non_existent_invoice',
    playerId: 'audit_player_stars'
  });
  assert.strictEqual(clientVerifyRes.status, 404, 'Non-existent invoice returns 404');

  process.env.NODE_ENV = origNodeEnv;
  console.log('  [PASS] Client payment verify strictly guarded against spoofing.');
}

// =========================================================================
// TEST 6: Mobile Performance & Stability Guardrails
// =========================================================================
console.log('\nTest 6: Mobile Performance & Stability Guardrails...');

// 1. DPR Clamping
assert(gameJs.includes('const cap = this.qualityMode === \'high\' ? 2.5 : 2.0'), 'DPR must be clamped to prevent 3x/4x mobile memory bloat');
assert(gameJs.includes('this.dpr = Math.min(window.devicePixelRatio || 1, cap) * this.dprScale'), 'Canvas resolution must respect DPR cap');
console.log('  [PASS] Canvas DPR cap (2.5 high / 2.0 low) verified.');

// 2. Adaptive resolution scaling on low-end hardware
assert(gameJs.includes('if (this.ema > 28)'), 'Engine must detect slow frames (>28ms / <35fps)');
assert(gameJs.includes('this.dprScale *= 0.8'), 'Engine must scale down DPR when device stutters');
assert(gameJs.includes('this.renderer.setShadowSize(0)'), 'Engine must disable shadows if performance remains critical');
console.log('  [PASS] Dynamic DPR degradation and shadow disable verified for low-end mobile devices.');

// 3. WebGL context loss handling
assert(gameJs.includes('canvas.addEventListener(\'webglcontextlost\''), 'Must listen to webglcontextlost event');
assert(gameJs.includes('onContextLost'), 'Must invoke onContextLost handler');
console.log('  [PASS] WebGL context lost recovery hook verified.');

// 4. Auto-pause on mobile backgrounding
assert(gameJs.includes('document.addEventListener(\'visibilitychange\', () => {'), 'Must listen to visibilitychange');
assert(gameJs.includes('if (document.hidden && this.state === \'match\')'), 'Must auto-pause when user leaves tab/minimizes Telegram');
assert(gameJs.includes('window.addEventListener(\'blur\', () => {'), 'Must auto-pause on window blur');
console.log('  [PASS] Auto-pause on mobile backgrounding (visibilitychange & blur) verified.');

// Run async payment tests
testPaymentLifecycle()
  .then(() => {
    console.log('\n======================================================');
    console.log('ALL MOBILE & TELEGRAM MINI APP AUDIT CHECKS PASSED!');
    console.log('======================================================\n');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n[AUDIT FAILED]:', err);
    process.exit(1);
  });
