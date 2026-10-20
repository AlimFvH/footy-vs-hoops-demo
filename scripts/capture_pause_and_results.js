const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function run() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1200));

  const verRes = await fetch('http://127.0.0.1:9222/json/version');
  const ver = await verRes.json();
  const wsUrl = ver.webSocketDebuggerUrl;

  const ws = new WebSocket(wsUrl);
  let id = 1;
  const callbacks = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
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
  const pageWs = new WebSocket(`ws://127.0.0.1:9222/devtools/page/${targetId}`);
  await new Promise(r => pageWs.onopen = r);

  let pageId = 1;
  const pageCallbacks = new Map();
  pageWs.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pageCallbacks.has(msg.id)) {
      pageCallbacks.get(msg.id)(msg);
      pageCallbacks.delete(msg.id);
    }
  };

  function sendPage(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = pageId++;
      pageCallbacks.set(msgId, (res) => {
        if (res.error) reject(new Error(res.error.message));
        else resolve(res.result);
      });
      pageWs.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await sendPage('Page.enable');
  await sendPage('Runtime.enable');

  // Mobile Viewport
  await sendPage('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 667,
    deviceScaleFactor: 1,
    mobile: true
  });
  await sendPage('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });

  await sendPage('Page.navigate', { url: 'http://localhost:8099/index.html' });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Launch match & open pause menu on mobile
  await sendPage('Runtime.evaluate', {
    expression: `
      (function() {
        var app = window.__fvh;
        app.launch({ mode: 'footy', difficulty: 'normal', minutes: 2, skipCountdown: true }, false);
        app.game.sim.phase = 'playing';
        app.setPause(true);
      })()
    `
  });
  await new Promise(r => setTimeout(r, 600));

  let shotPauseMobile = await sendPage('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'audit_pause_menu_mobile.png'), Buffer.from(shotPauseMobile.data, 'base64'));
  console.log('Captured audit_pause_menu_mobile.png');

  // 2. Trigger match results on mobile
  await sendPage('Runtime.evaluate', {
    expression: `
      (function() {
        var app = window.__fvh;
        app.setPause(false);
        var sum = {
          mode: 'footy',
          difficulty: 'normal',
          duration: 120,
          score: [2, 1],
          stats: {
            goals: [2, 1],
            shots: [5, 3],
            threes: [0, 0],
            humanGoals: 2,
            humanShots: 4,
            humanPasses: 6,
            humanTackles: 3
          },
          humanThrees: 0
        };
        app.onMatchEnd(sum);
      })()
    `
  });
  await new Promise(r => setTimeout(r, 600));

  let shotResultsMobile = await sendPage('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'audit_match_results_mobile.png'), Buffer.from(shotResultsMobile.data, 'base64'));
  console.log('Captured audit_match_results_mobile.png');

  // 3. Switch to Desktop Viewport
  await sendPage('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false
  });
  await sendPage('Emulation.setTouchEmulationEnabled', { enabled: false });

  await new Promise(r => setTimeout(r, 600));

  let shotResultsDesktop = await sendPage('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'audit_match_results_desktop.png'), Buffer.from(shotResultsDesktop.data, 'base64'));
  console.log('Captured audit_match_results_desktop.png');

  // Pause on desktop
  await sendPage('Runtime.evaluate', {
    expression: `
      (function() {
        var app = window.__fvh;
        app.launch({ mode: 'footy', difficulty: 'normal', minutes: 2, skipCountdown: true }, false);
        app.game.sim.phase = 'playing';
        app.setPause(true);
      })()
    `
  });
  await new Promise(r => setTimeout(r, 600));

  let shotPauseDesktop = await sendPage('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'audit_pause_menu_desktop.png'), Buffer.from(shotPauseDesktop.data, 'base64'));
  console.log('Captured audit_pause_menu_desktop.png');

  ws.close();
  pageWs.close();
  chrome.kill();
}

run().catch(console.error);
