const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function main() {
  console.log('=== CAPTURING PACK OPENING ANIMATION & FVH COIN PROOFS ===');

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9227',
    '--disable-gpu',
    '--no-sandbox',
    'about:blank'
  ]);

  let ver;
  for (let i = 0; i < 20; i++) {
    try {
      await new Promise(r => setTimeout(r, 400));
      const res = await fetch('http://127.0.0.1:9227/json/version');
      ver = await res.json();
      if (ver && ver.webSocketDebuggerUrl) break;
    } catch (e) {}
  }

  if (!ver || !ver.webSocketDebuggerUrl) {
    chrome.kill();
    throw new Error('Could not connect to Chrome debugging port 9227');
  }

  const ws = new WebSocket(ver.webSocketDebuggerUrl);
  let id = 1;
  const callbacks = new Map();
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && callbacks.has(msg.id)) {
      callbacks.get(msg.id)(msg);
      callbacks.delete(msg.id);
    }
  };
  await new Promise(r => ws.onopen = r);

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      callbacks.set(msgId, (res) => {
        if (res.error) reject(new Error(res.error.message));
        else resolve(res.result);
      });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const pageWs = new WebSocket(`ws://127.0.0.1:9227/devtools/page/${targetId}`);
  await new Promise(r => pageWs.onopen = r);

  let pid = 1;
  const pageCallbacks = new Map();
  pageWs.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pageCallbacks.has(msg.id)) {
      pageCallbacks.get(msg.id)(msg);
      pageCallbacks.delete(msg.id);
    }
  };

  function sendPage(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = pid++;
      pageCallbacks.set(msgId, (res) => {
        if (res.error) reject(new Error(res.error.message));
        else resolve(res.result);
      });
      pageWs.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  async function takeScreenshot(fileName) {
    const shot = await sendPage('Page.captureScreenshot', { format: 'png' });
    const fullPath = path.join(artifactDir, fileName);
    fs.writeFileSync(fullPath, Buffer.from(shot.data, 'base64'));
    console.log(`✓ Saved ${fileName} (${fs.statSync(fullPath).size} bytes)`);
  }

  await sendPage('Page.enable');
  await sendPage('Runtime.enable');
  await sendPage('Emulation.setDeviceMetricsOverride', {
    width: 393,
    height: 852,
    deviceScaleFactor: 2,
    mobile: true
  });

  console.log('Navigating to http://localhost:8099 ...');
  await sendPage('Page.navigate', { url: 'http://localhost:8099' });
  await new Promise(r => setTimeout(r, 2200));

  // 1. Go to Shop and capture FvH Coin Wallet
  console.log('1. Navigating to Shop with FvH Coin badge...');
  await sendPage('Runtime.evaluate', {
    expression: `
      (function() {
        var app = window.App || window.__fvh;
        if (app) {
          app.store.update(function(d) {
            d.coins = 2450;
          });
          app.go('shop');
        }
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1000));
  await takeScreenshot('shop_fvh_coin_wallet.png');

  // 2. Open Footy Striker Pack - Stage 1 (Hovering Pack Presentation)
  console.log('2. Triggering pack opening animation (Stage 1: Hovering Pack)...');
  await sendPage('Runtime.evaluate', {
    expression: `
      (function() {
        var app = window.App || window.__fvh;
        if (app && app.openPackAnimation) {
          app.openPackAnimation({ id: 'footy', name: 'Footy Striker Pack' });
        }
      })()
    `
  });
  await new Promise(r => setTimeout(r, 800));
  await takeScreenshot('pack_opening_stage1_hover.png');

  // 3. Click Pack to Rip Open -> Wait for rumble & cards reveal (Stage 2)
  console.log('3. Clicking pack to trigger rumble, burst flash and card reveal...');
  await sendPage('Runtime.evaluate', {
    expression: `
      (function() {
        var packWrap = document.querySelector('.fvh-pack-unopened-wrap');
        if (packWrap) packWrap.click();
      })()
    `
  });
  // Wait 1.4s for rumble, flash, and card dealing animation to settle
  await new Promise(r => setTimeout(r, 1600));
  await takeScreenshot('pack_opening_stage2_revealed.png');

  // 4. Click "ЗАБРАТЬ ВСЁ"
  console.log('4. Clicking claim button...');
  await sendPage('Runtime.evaluate', {
    expression: `
      (function() {
        var claimBtn = document.querySelector('.fvh-pack-claim-btn');
        if (claimBtn) claimBtn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 600));

  // 5. Test Case B: 100% Owned Collection -> Duplicate Fallback to FvH Coins
  console.log('5. Testing 100% owned collection -> FvH Coin fallback compensation...');
  await sendPage('Runtime.evaluate', {
    expression: `
      (function() {
        var app = window.App || window.__fvh;
        if (app) {
          // Give player ALL items in Footy pool
          var footyItems = [
            'skin_crimson', 'skin_neon', 'skin_frost', 'skin_shadow', 'skin_solar', 'skin_gold', 'skin_cyber', 'skin_sunset', 'skin_hydro',
            'ball_footy_plasma', 'ball_footy_gold', 'ball_footy_inferno', 'ball_footy_solar', 'ball_earthrise',
            'std_ocean_sunset', 'std_forest_redwood', 'std_footy_night', 'std_footy_golden', 'std_footy_neon',
            'cel_confetti', 'cel_fireworks', 'cel_flames',
            'trail_fire', 'trail_laser'
          ];
          app.store.update(function(d) {
            if (!d.owned) d.owned = [];
            footyItems.forEach(function(id) {
              if (d.owned.indexOf(id) === -1) d.owned.push(id);
            });
          });
          if (app.openPackAnimation) {
            app.openPackAnimation({ id: 'footy', name: 'Footy Striker Pack' });
          }
        }
      })()
    `
  });
  await new Promise(r => setTimeout(r, 600));

  // Click pack to rip open
  await sendPage('Runtime.evaluate', {
    expression: `
      (function() {
        var packWrap = document.querySelector('.fvh-pack-unopened-wrap');
        if (packWrap) packWrap.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1600));
  await takeScreenshot('pack_opening_stage3_duplicate_fallback.png');

  // Click claim button to close
  await sendPage('Runtime.evaluate', {
    expression: `
      (function() {
        var claimBtn = document.querySelector('.fvh-pack-claim-btn');
        if (claimBtn) claimBtn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 600));

  console.log('Closing sessions and browser...');
  pageWs.close();
  ws.close();
  chrome.kill();
  console.log('=== PACK OPENING PROOFS CAPTURE COMPLETE ===');
}

main().catch(console.error);
