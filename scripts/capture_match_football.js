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
  await sendPage('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 667,
    deviceScaleFactor: 1,
    mobile: true
  });
  await sendPage('Emulation.setTouchEmulationEnabled', {
    enabled: true,
    maxTouchPoints: 5
  });

  console.log('Navigating to game and launching football match...');
  await sendPage('Page.navigate', { url: 'http://localhost:8099/index.html' });
  await new Promise(r => setTimeout(r, 2000));

  // Launch football match via app
  const launchRes = await sendPage('Runtime.evaluate', {
    expression: `
      (function() {
        var app = window.__fvh;
        if (app) {
          app.launch({ mode: 'footy', difficulty: 'normal', minutes: 2 }, false);
          return { ok: true, state: app.state };
        }
        return { ok: false, error: 'no __fvh' };
      })()
    `,
    returnByValue: true
  });
  console.log('Launch result:', launchRes.result.value);

  // Wait 1.5s for countdown and gameplay to render
  await new Promise(r => setTimeout(r, 2000));

  const shot = await sendPage('Page.captureScreenshot', { format: 'png' });
  const outPath = path.join(artifactDir, 'football_gameplay_mobile_kickoff.png');
  fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
  console.log('Saved screenshot:', outPath);

  // Check state of the match in memory
  const simState = await sendPage('Runtime.evaluate', {
    expression: `
      (function() {
        var app = window.__fvh;
        var g = app && app.game;
        if (!g || !g.sim) return { error: 'no sim' };
        var s = g.sim;
        return {
          mode: s.mode,
          ball: { x: s.ball.x, y: s.ball.y, z: s.ball.z, vx: s.ball.vx, vy: s.ball.vy, vz: s.ball.vz },
          human: { x: s.human.x, z: s.human.z, stamina: s.human.stamina },
          phase: s.phase,
          score: s.score
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Simulation state:', JSON.stringify(simState.result.value, null, 2));

  ws.close();
  pageWs.close();
  chrome.kill();
}

run().catch(console.error);
