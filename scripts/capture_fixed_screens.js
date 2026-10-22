const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function main() {
  console.log('1. Starting local server on 8099...');
  const server = spawn('node', ['server/server.js'], { env: { ...process.env, PORT: '8099' } });
  server.stdout.on('data', d => {});
  server.stderr.on('data', d => console.error('Server err:', d.toString()));

  // Wait for server ready
  for (let i = 0; i < 30; i++) {
    try {
      await new Promise(r => setTimeout(r, 200));
      const res = await fetch('http://127.0.0.1:8099/health');
      if (res.ok) {
        console.log('Server is online!');
        break;
      }
    } catch (e) {}
  }

  console.log('2. Launching headless Chrome...');
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9265',
    '--disable-gpu',
    '--window-size=390,844',
    '--no-sandbox',
    'about:blank'
  ]);

  let ver;
  for (let i = 0; i < 30; i++) {
    try {
      await new Promise(r => setTimeout(r, 200));
      const res = await fetch('http://127.0.0.1:9265/json/version');
      ver = await res.json();
      if (ver && ver.webSocketDebuggerUrl) break;
    } catch (e) {}
  }

  if (!ver || !ver.webSocketDebuggerUrl) {
    console.error('Could not connect to Chrome debugger');
    server.kill();
    chrome.kill();
    process.exit(1);
  }

  const browserWs = new WebSocket(ver.webSocketDebuggerUrl);
  let bid = 1;
  const bCallbacks = new Map();
  browserWs.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && bCallbacks.has(msg.id)) { bCallbacks.get(msg.id)(msg); bCallbacks.delete(msg.id); }
  };
  await new Promise(r => browserWs.onopen = r);

  function sendBrowser(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = bid++;
      bCallbacks.set(msgId, (res) => { if (res.error) reject(new Error(res.error.message)); else resolve(res.result); });
      browserWs.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  const { targetId } = await sendBrowser('Target.createTarget', { url: 'about:blank' });
  const pageWs = new WebSocket(`ws://127.0.0.1:9265/devtools/page/${targetId}`);
  await new Promise(r => pageWs.onopen = r);

  let pid = 1;
  const pCallbacks = new Map();
  pageWs.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pCallbacks.has(msg.id)) { pCallbacks.get(msg.id)(msg); pCallbacks.delete(msg.id); }
  };

  function sendPage(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = pid++;
      pCallbacks.set(msgId, (res) => { if (res.error) reject(new Error(res.error.message)); else resolve(res.result); });
      pageWs.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await sendPage('Page.enable');
  await sendPage('Runtime.enable');

  async function snap(name) {
    const shot = await sendPage('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, name), Buffer.from(shot.data, 'base64'));
    console.log('[SNAPSHOT] Saved', name);
  }

  async function evalCode(expression) {
    const res = await sendPage('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    return res && res.result && res.result.value;
  }

  console.log('Navigating to http://localhost:8099 ...');
  await sendPage('Page.navigate', { url: 'http://localhost:8099' });
  await new Promise(r => setTimeout(r, 2500));

  // Initialize player data with 1 win so we can verify the exact scenario of Screenshot 1
  await evalCode(`
    (function() {
      if (window.App && window.App.store) {
        window.App.store.update(function(d) {
          d.selectedCharacter = 'footy';
          d.playerName = 'Alim FvH';
          d.coins = 7670;
          d.stats = { played: 1, matches: 1, wins: 1, losses: 0, goals: 4, baskets: 0, matchesFooty: 1, winsFooty: 1, matchesHoops: 0, winsHoops: 0, matchesClash: 0, winsClash: 0 };
        });
        window.App.render();
      }
    })();
  `);
  await new Promise(r => setTimeout(r, 600));

  // 1. Home screen (Screenshot 2 comparison)
  await snap('audit_screen2_fixed_home.png');

  // 2. Open Profile screen (Screenshot 1 comparison)
  await evalCode(`window.App.go('profile');`);
  await new Promise(r => setTimeout(r, 800));
  await snap('audit_screen1_fixed_profile.png');

  // 3. Open Wardrobe / Locker (Screenshot 3 comparison - confirms NO btnFooty crash)
  await evalCode(`window.App.openCharacterLocker('footy');`);
  await new Promise(r => setTimeout(r, 800));
  await snap('audit_screen3_fixed_wardrobe.png');

  // 4. Open Shop screen - Featured Hero (Screenshot 4 comparison)
  await evalCode(`window.App.go('shop');`);
  await new Promise(r => setTimeout(r, 800));
  await snap('audit_screen4_fixed_shop_featured.png');

  // 5. Scroll Shop screen down to Product Grid (Screenshot 5 comparison)
  await evalCode(`
    (function() {
      var body = document.querySelector('.page-body') || document.querySelector('.fvh-shop-container') || document.querySelector('.screen');
      if (body) body.scrollTop = 380;
    })();
  `);
  await new Promise(r => setTimeout(r, 600));
  await snap('audit_screen5_fixed_shop_grid.png');

  // 6. Open Mode Selection screen (Screenshot 6 comparison)
  await evalCode(`
    (function() {
      window.App.showMenu();
      setTimeout(function() {
        var playBtn = document.querySelector('.fvh-btn-play-hero');
        if (playBtn) playBtn.click();
      }, 200);
    })();
  `);
  await new Promise(r => setTimeout(r, 1000));
  await snap('audit_screen6_fixed_arena_selector.png');

  console.log('\nAll 6 verification snapshots captured successfully!');

  // Cleanup
  chrome.kill();
  server.kill();
  process.exit(0);
}

main().catch(err => {
  console.error('Snapshot capture error:', err);
  process.exit(1);
});
