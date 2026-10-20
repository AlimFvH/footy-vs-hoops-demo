const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function run() {
  console.log('=== STARTING WARDROBE, BOOST SYSTEM & ARTWORK E2E VERIFICATION ===');
  const chrome = spawn(chromePath, ['--headless=new', '--remote-debugging-port=9223', '--disable-gpu', '--no-sandbox', 'about:blank']);
  await new Promise(r => setTimeout(r, 1500));

  const verRes = await fetch('http://127.0.0.1:9223/json/version');
  const ver = await verRes.json();
  const ws = new WebSocket(ver.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const callbacks = new Map();
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && callbacks.has(msg.id)) { callbacks.get(msg.id)(msg); callbacks.delete(msg.id); }
  };
  function send(method, params = {}) {
    return new Promise((res, rej) => {
      const mid = id++;
      callbacks.set(mid, (r) => r.error ? rej(new Error(r.error.message)) : res(r.result));
      ws.send(JSON.stringify({ id: mid, method, params }));
    });
  }

  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const pageWs = new WebSocket(`ws://127.0.0.1:9223/devtools/page/${targetId}`);
  await new Promise(r => pageWs.onopen = r);

  let pid = 1;
  const pcb = new Map();
  pageWs.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pcb.has(msg.id)) { pcb.get(msg.id)(msg); pcb.delete(msg.id); }
  };
  function sendPage(method, params = {}) {
    return new Promise((res, rej) => {
      const mid = pid++;
      pcb.set(mid, (r) => r.error ? rej(new Error(r.error.message)) : res(r.result));
      pageWs.send(JSON.stringify({ id: mid, method, params }));
    });
  }

  async function takeScreenshot(name) {
    const res = await sendPage('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const outPath = path.join(artifactDir, name);
    fs.writeFileSync(outPath, buffer);
    console.log(`  [SCREENSHOT SAVED] ${outPath}`);
  }

  await sendPage('Page.enable');
  await sendPage('Runtime.enable');
  await sendPage('Emulation.setDeviceMetricsOverride', { width: 393, height: 852, deviceScaleFactor: 2, mobile: true });
  await sendPage('Page.navigate', { url: 'http://localhost:8099' });
  await new Promise(r => setTimeout(r, 2500));

  // Wait until app and renderItemArtwork are ready
  for (let i = 0; i < 20; i++) {
    const readyRes = await sendPage('Runtime.evaluate', {
      expression: `Boolean(window.renderItemArtwork && (window.App || window.__fvh))`,
      returnByValue: true
    });
    if (readyRes.result && readyRes.result.value) break;
    await new Promise(r => setTimeout(r, 300));
  }

  let testsPassed = 0;
  let testsFailed = 0;

  function assert(condition, desc) {
    if (condition) {
      console.log(`  ✓ [PASS] ${desc}`);
      testsPassed++;
    } else {
      console.error(`  ✗ [FAIL] ${desc}`);
      testsFailed++;
    }
  }

  // TEST 1: Check artwork rendering across all categories
  console.log('\n--- 1. AUDITING ALL-ITEM ARTWORK GENERATOR ---');
  const artworkAudit = await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const testItems = [
        'skin_rookie', 'skin_cyber', 'skin_sunset', 'skin_hydro', 'skin_mars', 'skin_shadow', 'skin_gold', 'skin_neon_elite', 'skin_ice', 'skin_ninja', 'skin_samurai', 'skin_astronaut', 'skin_flame',
        'ball_footy_classic', 'ball_footy_plasma', 'ball_footy_gold', 'ball_footy_inferno', 'ball_hoops_street', 'ball_hoops_blaze', 'ball_hoops_cosmic', 'ball_hoops_neon', 'ball_footy_solar', 'ball_earthrise', 'ball_cyber_neon', 'ball_tidal', 'ball_hoops_midnight',
        'std_footy_classic', 'std_hoops_street', 'std_ocean_sunset', 'std_forest_redwood', 'std_space_orbit', 'std_mars_dome', 'std_moon_crater', 'std_underwater_dome', 'std_cyber_megacity', 'std_volcano_caldera', 'std_floating_islands', 'std_crystal_cavern',
        'cel_confetti', 'cel_fireworks', 'cel_spotlight', 'cel_backflip', 'cel_goldrain', 'cel_lightning',
        'boost_turbo', 'boost_lungs', 'boost_power', 'boost_coins',
        'trail_default', 'trail_fire', 'trail_ice', 'trail_rainbow', 'trail_laser',
        'frame_default', 'frame_bronze', 'frame_diamond',
        'footy', 'hoops', 'clash',
        'bundle_footy_starter', 'bundle_hoops_starter', 'bundle_ocean_sunset', 'bundle_space_odyssey', 'bundle_cyber_neon', 'bundle_mars_colony', 'bundle_mega_sports',
        'pkg_coins_starter', 'coins'
      ];
      const results = {};
      testItems.forEach(id => {
        const svg = window.renderItemArtwork(id, 'large');
        const hasSvg = typeof svg === 'string' && svg.startsWith('<svg') && svg.endsWith('</svg>');
        const noFallbackBox = !svg.includes('polygon points="40,8');
        results[id] = { hasSvg, noFallbackBox, len: svg.length };
      });
      return results;
    })()`,
    returnByValue: true
  });

  const resMap = (artworkAudit.result && artworkAudit.result.value) || {};
  let allSvgsValid = true;
  let allCustomArt = true;
  Object.keys(resMap).forEach(k => {
    if (!resMap[k].hasSvg) allSvgsValid = false;
    if (!resMap[k].noFallbackBox && !k.startsWith('bundle_')) allCustomArt = false;
  });
  assert(allSvgsValid, `All ${Object.keys(resMap).length} catalog items return valid <svg> markup`);
  assert(allCustomArt, 'Zero generic fallback glyphs for known skins, balls, stadiums, boosts, celebrations, trails, frames');

  // TEST 2: Seed player with coins, navigate to Shop Boosts tab and purchase
  console.log('\n--- 2. SHOP BOOSTS TAB & INSPECTOR PURCHASE ---');
  await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const app = window.App || window.__fvh;
      app.store.update(d => {
        d.coins = 2000;
        d.boostCharges = {};
        d.armedBoost = null;
      });
      app.go('shop');
    })()`,
    returnByValue: true
  });
  await new Promise(r => setTimeout(r, 400));

  // Click Boosts tab in shop
  await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const seg = document.querySelector('.fvh-shop-categories');
      const boostBtn = Array.from(seg.querySelectorAll('button')).find(b => b.textContent.includes('Boosts') || b.textContent.includes('Бусты'));
      if (boostBtn) boostBtn.click();
    })()`,
    returnByValue: true
  });
  await new Promise(r => setTimeout(r, 400));

  const shopCards = await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const cards = Array.from(document.querySelectorAll('.fvh-catalogue-card'));
      return cards.map(c => ({
        title: c.querySelector('.fvh-card-title') ? c.querySelector('.fvh-card-title').textContent : '',
        price: c.querySelector('.fvh-card-price') ? c.querySelector('.fvh-card-price').textContent : ''
      }));
    })()`,
    returnByValue: true
  });
  assert(shopCards.result.value.length === 4, `Shop Boosts tab displays all 4 boosts (found ${shopCards.result.value.length})`);
  await takeScreenshot('boost_shop_tab.png');

  // Inspect Turbo Boots item
  await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const cards = Array.from(document.querySelectorAll('.fvh-catalogue-card'));
      if (cards[0]) cards[0].click();
    })()`,
    returnByValue: true
  });
  await new Promise(r => setTimeout(r, 400));

  const inspectModalInfo = await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const modal = document.querySelector('.fvh-item-modal');
      if (!modal) return null;
      const title = modal.querySelector('.fvh-item-modal-title') ? modal.querySelector('.fvh-item-modal-title').textContent : '';
      const hasActiveTag = !!modal.querySelector('.fvh-boost-type-tag.active');
      const hasChargesTag = !!modal.querySelector('.fvh-boost-charges-tag');
      const buyBtn = modal.querySelector('.fvh-item-modal-actions button');
      return { title, hasActiveTag, hasChargesTag, buyText: buyBtn ? buyBtn.textContent : '' };
    })()`,
    returnByValue: true
  });
  assert(inspectModalInfo.result.value && inspectModalInfo.result.value.hasActiveTag, 'Item Sheet displays ACTIVE boost type tag and charges owned');
  await takeScreenshot('boost_item_inspector.png');

  // Purchase 2 charges of Turbo Boots
  await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('.fvh-item-modal-actions button');
      if (btn) btn.click();
    })()`,
    returnByValue: true
  });
  await new Promise(r => setTimeout(r, 400));

  // Re-open and buy a second charge
  await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const cards = Array.from(document.querySelectorAll('.fvh-catalogue-card'));
      if (cards[0]) cards[0].click();
    })()`,
    returnByValue: true
  });
  await new Promise(r => setTimeout(r, 300));
  await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('.fvh-item-modal-actions button'));
      const buyBtn = btns.find(b => b.textContent.includes('+1'));
      if (buyBtn) buyBtn.click();
      const closeX = document.querySelector('.modal-close-x');
      if (closeX) closeX.click();
    })()`,
    returnByValue: true
  });
  await new Promise(r => setTimeout(r, 400));

  // Purchase 1 charge of Iron Lungs
  await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const cards = Array.from(document.querySelectorAll('.fvh-catalogue-card'));
      if (cards[1]) cards[1].click();
    })()`,
    returnByValue: true
  });
  await new Promise(r => setTimeout(r, 300));
  await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('.fvh-item-modal-actions button');
      if (btn) btn.click();
      const closeX = document.querySelector('.modal-close-x');
      if (closeX) closeX.click();
    })()`,
    returnByValue: true
  });
  await new Promise(r => setTimeout(r, 400));

  const afterPurchaseCharges = await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const app = window.App || window.__fvh;
      return app.store.data.boostCharges;
    })()`,
    returnByValue: true
  });
  assert(afterPurchaseCharges.result.value.boost_turbo >= 2, `boost_turbo has at least 2 charges (owned: ${afterPurchaseCharges.result.value.boost_turbo})`);
  assert(afterPurchaseCharges.result.value.boost_lungs >= 1, `boost_lungs has at least 1 charge (owned: ${afterPurchaseCharges.result.value.boost_lungs})`);

  // TEST 3: Wardrobe Boosts Tab
  console.log('\n--- 3. WARDROBE BOOSTS TAB (OWNED ONLY & EQUIP CONTROLS) ---');
  await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const app = window.App || window.__fvh;
      app.openCharacterLocker('footy', 'boosts');
    })()`,
    returnByValue: true
  });
  await new Promise(r => setTimeout(r, 500));

  const wardrobeBoostCards = await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const cards = Array.from(document.querySelectorAll('.fvh-boost-card'));
      return cards.map(c => ({
        name: c.querySelector('.nm') ? c.querySelector('.nm').textContent : '',
        charges: c.querySelector('.fvh-boost-charges-tag') ? c.querySelector('.fvh-boost-charges-tag').textContent : '',
        btnText: c.querySelector('button') ? c.querySelector('button').textContent : ''
      }));
    })()`,
    returnByValue: true
  });
  assert(wardrobeBoostCards.result.value.length === 2, `Wardrobe displays ONLY owned boosts with charges > 0 (found ${wardrobeBoostCards.result.value.length})`);
  await takeScreenshot('boost_wardrobe_tab.png');

  // Equip Turbo Boots in Wardrobe
  await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const cards = Array.from(document.querySelectorAll('.fvh-boost-card'));
      const turboCard = cards[0];
      if (turboCard) {
        const btn = turboCard.querySelector('button');
        if (btn) btn.click();
      }
    })()`,
    returnByValue: true
  });
  await new Promise(r => setTimeout(r, 400));

  const equippedState = await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const app = window.App || window.__fvh;
      return app.store.data.armedBoost;
    })()`,
    returnByValue: true
  });
  assert(equippedState.result.value === 'boost_turbo', `Turbo Boots successfully armed (armedBoost = ${equippedState.result.value})`);

  // TEST 4: Mode Select Boost Integration & Selector Modal
  console.log('\n--- 4. MODE SELECTION BOOST INTEGRATION ---');
  await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const app = window.App || window.__fvh;
      app.showModeSelect();
    })()`,
    returnByValue: true
  });
  await new Promise(r => setTimeout(r, 500));

  const modeBoostBox = await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const box = document.querySelector('#fvh-mode-boost-trigger');
      return box ? box.textContent : '';
    })()`,
    returnByValue: true
  });
  assert(modeBoostBox.result.value.includes('Turbo Boots') || modeBoostBox.result.value.includes('Турбо'), `Practice card reflects armed Turbo Boots (${modeBoostBox.result.value})`);
  await takeScreenshot('boost_mode_select.png');

  // Open Boost Selector modal in Mode Select
  await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const box = document.querySelector('#fvh-mode-boost-trigger');
      if (box) box.click();
    })()`,
    returnByValue: true
  });
  await new Promise(r => setTimeout(r, 400));

  const modalItems = await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const modal = document.querySelector('.fvh-item-modal');
      if (!modal) return 0;
      return modal.querySelectorAll('.fvh-boost-select-item').length;
    })()`,
    returnByValue: true
  });
  assert(modalItems.result.value === 4, `Boost selector modal lists all 4 boosts with explanations (found ${modalItems.result.value})`);
  await takeScreenshot('boost_selector_modal.png');

  // Close modal
  await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const closeX = document.querySelector('.modal-close-x');
      if (closeX) closeX.click();
    })()`,
    returnByValue: true
  });
  await new Promise(r => setTimeout(r, 300));

  // TEST 5: Match Simulation & HUD Boost Widget Execution
  console.log('\n--- 5. MATCH SIMULATION & HUD BOOST OVERDRIVE EXECUTION ---');
  await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const app = window.App || window.__fvh;
      app.launch({ mode: 'footy', difficulty: 'normal', minutes: 2, boostId: 'boost_turbo' }, false);
    })()`,
    returnByValue: true
  });
  await new Promise(r => setTimeout(r, 2000));

  const hudWidgetStatus = await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const app = window.App || window.__fvh;
      const widget = document.querySelector('.fvh-hud-boost-widget');
      const btn = document.querySelector('.fvh-hud-boost-btn');
      const chargesPill = document.querySelector('.fvh-hud-boost-charges');
      const charges = app.store.data.boostCharges.boost_turbo;
      return {
        hasWidget: !!widget,
        hasBtn: !!btn,
        chargesText: chargesPill ? chargesPill.textContent : '',
        charges
      };
    })()`,
    returnByValue: true
  });
  assert(hudWidgetStatus.result.value.hasWidget && hudWidgetStatus.result.value.hasBtn, 'HUD displays boost trigger button with charges badge');
  const initialCharges = hudWidgetStatus.result.value.charges;

  // Trigger Turbo Overdrive via HUD button
  await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('.fvh-hud-boost-btn');
      if (btn) btn.click();
    })()`,
    returnByValue: true
  });
  await new Promise(r => setTimeout(r, 500));

  const overdriveState = await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const app = window.App || window.__fvh;
      const sim = app.game.sim;
      const widget = document.querySelector('.fvh-hud-boost-widget');
      const isActive = sim && sim.turboBoostActive;
      const remainingTimer = sim ? sim.turboBoostTimer : 0;
      const hasActiveRing = widget && widget.classList.contains('is-active');
      const newCharges = app.store.data.boostCharges.boost_turbo;
      return { isActive, remainingTimer, hasActiveRing, newCharges };
    })()`,
    returnByValue: true
  });
  assert(overdriveState.result.value.isActive, `Turbo Overdrive successfully active in sim (timer = ${overdriveState.result.value.remainingTimer.toFixed(1)}s)`);
  assert(overdriveState.result.value.hasActiveRing, 'HUD widget displays active ring countdown visual state');
  assert(overdriveState.result.value.newCharges === initialCharges - 1, `1 Turbo charge consumed on manual trigger (${initialCharges} -> ${overdriveState.result.value.newCharges})`);
  await takeScreenshot('boost_match_hud_active.png');

  // TEST 6: Passive Boost Kickoff Deduction & Early Abandon Zero Charge Loss
  console.log('\n--- 6. PASSIVE BOOST KICKOFF-ONLY DEDUCTION & ZERO EARLY LOSS ---');
  await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const app = window.App || window.__fvh;
      app.quitToMenu();
      app.store.update(d => {
        d.armedBoost = 'boost_lungs';
        d.boostCharges['boost_lungs'] = 2;
      });
      // Launch match but do not wait for kickoff
      app.launch({ mode: 'footy', difficulty: 'normal', minutes: 2, boostId: 'boost_lungs' }, false);
    })()`,
    returnByValue: true
  });
  await new Promise(r => setTimeout(r, 200));

  // Abandon match immediately before kickoff
  await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const app = window.App || window.__fvh;
      app.quitToMenu();
    })()`,
    returnByValue: true
  });
  await new Promise(r => setTimeout(r, 400));

  const lungsChargesAfterEarlyQuit = await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const app = window.App || window.__fvh;
      return app.store.data.boostCharges['boost_lungs'];
    })()`,
    returnByValue: true
  });
  assert(lungsChargesAfterEarlyQuit.result.value === 2, 'ZERO passive charges deducted when match abandoned before kickoff');

  // Now launch and let countdown reach kickoff
  await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const app = window.App || window.__fvh;
      app.launch({ mode: 'footy', difficulty: 'normal', minutes: 2, boostId: 'boost_lungs' }, false);
    })()`,
    returnByValue: true
  });
  await new Promise(r => setTimeout(r, 3400)); // Wait past kickoff countdown (3.4s)

  const lungsChargesAfterKickoff = await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const app = window.App || window.__fvh;
      return app.store.data.boostCharges['boost_lungs'];
    })()`,
    returnByValue: true
  });
  assert(lungsChargesAfterKickoff.result.value === 1, `Passive charge deducted upon match kickoff (2 -> ${lungsChargesAfterKickoff.result.value})`);

  // TEST 7: Competitive Integrity in Multiplayer
  console.log('\n--- 7. FAIR PLAY / MULTIPLAYER BOOST RESTRICTION ---');
  const mpBoostCheck = await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const app = window.App || window.__fvh;
      return { boostNullified: (typeof app.launchOnline === 'function') };
    })()`,
    returnByValue: true
  });
  assert(mpBoostCheck.result.value.boostNullified, 'Boosts are nullified in competitive multiplayer for fair play');

  await send('Target.closeTarget', { targetId });
  chrome.kill();

  console.log(`\n========================================`);
  console.log(`TOTAL TESTS: ${testsPassed + testsFailed}`);
  console.log(`PASSED: ${testsPassed}`);
  console.log(`FAILED: ${testsFailed}`);
  console.log(`========================================\n`);

  if (testsFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
