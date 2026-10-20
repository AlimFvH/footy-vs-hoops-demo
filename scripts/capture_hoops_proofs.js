const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function main() {
  console.log('=== CAPTURING HOOPS & ARTWORK PROOF SCREENSHOTS ===');
  
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9225',
    '--disable-gpu',
    '--no-sandbox',
    'about:blank'
  ]);

  let ver;
  for (let i = 0; i < 20; i++) {
    try {
      await new Promise(r => setTimeout(r, 400));
      const res = await fetch('http://127.0.0.1:9225/json/version');
      ver = await res.json();
      if (ver && ver.webSocketDebuggerUrl) break;
    } catch (e) {}
  }

  if (!ver || !ver.webSocketDebuggerUrl) {
    chrome.kill();
    throw new Error('Failed to connect to Chrome debugging port 9225');
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
  const pageWs = new WebSocket(`ws://127.0.0.1:9225/devtools/page/${targetId}`);
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
  await sendPage('Emulation.setTouchEmulationEnabled', {
    enabled: true,
    maxTouchPoints: 5
  });

  console.log('Navigating to http://localhost:8099 ...');
  await sendPage('Page.navigate', { url: 'http://localhost:8099' });
  await new Promise(r => setTimeout(r, 2200));

  // 1. Basketball Match - North Hoop Visible
  console.log('1. Launching basketball match (attacking North hoop)...');
  await sendPage('Runtime.evaluate', {
    expression: `
      (function() {
        var app = window.App || window.__fvh;
        if (!app) return { error: 'no app' };
        app.store.update(function(d) {
          if (!d.equipped) d.equipped = {};
          d.equipped['ball.hoops'] = 'ball_hoops_street';
        });
        app.launch({ mode: 'hoops', difficulty: 'normal', minutes: 2 }, false);
        return { ok: true };
      })()
    `,
    returnByValue: true
  });
  // Wait for kickoff countdown to finish (3.5s)
  await new Promise(r => setTimeout(r, 3600));

  // Position human & ball near the 3-point line facing North hoop
  await sendPage('Runtime.evaluate', {
    expression: `
      (function() {
        var app = window.App || window.__fvh;
        if (app && app.game && app.game.sim) {
          var sim = app.game.sim;
          sim.phase = 'play';
          sim.human.x = 0;
          sim.human.z = -5.0;
          sim.ball.x = 0;
          sim.ball.z = -4.5;
          sim.ball.y = 0.5;
          sim.ai.x = 2.0;
          sim.ai.z = -8.5;
          if (app.game.view && app.game.view.rig) {
            app.game.view.rig.update(0.1, sim.ball, sim.human);
          }
        }
      })()
    `
  });
  await new Promise(r => setTimeout(r, 600));
  await takeScreenshot('basketball_north_hoop_gameplay.png');

  // 2. Basketball South Hoop In-Game Screenshot
  console.log('2. Positioning near South hoop...');
  await sendPage('Runtime.evaluate', {
    expression: `
      (function() {
        var app = window.App || window.__fvh;
        if (app && app.game && app.game.sim) {
          var sim = app.game.sim;
          sim.human.x = 0;
          sim.human.z = 6.0;
          sim.ball.x = 0;
          sim.ball.z = 5.5;
          sim.ball.y = 0.5;
          sim.ai.x = -1.5;
          sim.ai.z = 8.5;
          if (app.game.view && app.game.view.rig) {
            app.game.view.rig.update(0.1, sim.ball, sim.human);
          }
        }
      })()
    `
  });
  await new Promise(r => setTimeout(r, 600));
  await takeScreenshot('basketball_south_hoop_gameplay.png');

  // 3. Return to Main Menu then Wardrobe / Characters Screen
  console.log('3. Returning to menu and opening Wardrobe (Characters)...');
  await sendPage('Runtime.evaluate', {
    expression: `
      (function() {
        var app = window.App || window.__fvh;
        if (app) {
          app.showMenu();
        }
      })()
    `
  });
  await new Promise(r => setTimeout(r, 600));

  await sendPage('Runtime.evaluate', {
    expression: `
      (function() {
        var app = window.App || window.__fvh;
        if (app) {
          app.go('characters');
        }
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1000));
  await takeScreenshot('wardrobe_redesigned_items.png');

  // 4. Wardrobe Boosts Tab
  console.log('4. Switching to Wardrobe Boosts Tab with owned boosts...');
  await sendPage('Runtime.evaluate', {
    expression: `
      (function() {
        var app = window.App || window.__fvh;
        if (app) {
          app.store.update(function(d) {
            if (!d.boostCharges) d.boostCharges = {};
            d.boostCharges['boost_turbo'] = 3;
            d.boostCharges['boost_lungs'] = 2;
            d.boostCharges['boost_power'] = 1;
            d.boostCharges['boost_coins'] = 2;
            d.armedBoost = 'boost_turbo';
          });
        }
        var btns = Array.from(document.querySelectorAll('button, .fvh-locker-tab, .fvh-sub-tab'));
        var boostTab = btns.find(function(b) {
          return b.textContent.includes('Бусты') || b.textContent.includes('Boosts');
        });
        if (boostTab) {
          boostTab.click();
          setTimeout(function() {
            var grid = document.querySelector('.grid.shop-grid, .fvh-locker-grid');
            if (grid) grid.scrollIntoView({ behavior: 'instant', block: 'start' });
            else window.scrollBy(0, 320);
          }, 200);
        }
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1200));
  await takeScreenshot('wardrobe_boosts_tab.png');

  // 5. Shop Screen (Packs & Bundles)
  console.log('5. Navigating to Shop Screen...');
  await sendPage('Runtime.evaluate', {
    expression: `
      (function() {
        var app = window.App || window.__fvh;
        if (app) app.go('shop');
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1000));
  await takeScreenshot('shop_packs_and_bundles.png');

  // 6. Battle Pass Screen
  console.log('6. Navigating to Battle Pass Screen...');
  await sendPage('Runtime.evaluate', {
    expression: `
      (function() {
        var app = window.App || window.__fvh;
        if (app) app.go('battlepass');
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1000));
  await takeScreenshot('battlepass_dual_track_rewards.png');

  console.log('Closing sessions and browser...');
  pageWs.close();
  ws.close();
  chrome.kill();
  console.log('=== CAPTURE COMPLETE ===');
}

main().catch(err => {
  console.error('Fatal error in capture script:', err);
  process.exit(1);
});
