const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function main() {
  console.log('Capturing updated Battle Pass screen with fixed icon sizing...');

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9226',
    '--disable-gpu',
    '--no-sandbox',
    'about:blank'
  ]);

  let ver;
  for (let i = 0; i < 20; i++) {
    try {
      await new Promise(r => setTimeout(r, 400));
      const res = await fetch('http://127.0.0.1:9226/json/version');
      ver = await res.json();
      if (ver && ver.webSocketDebuggerUrl) break;
    } catch (e) {}
  }

  if (!ver || !ver.webSocketDebuggerUrl) {
    chrome.kill();
    throw new Error('Could not connect to Chrome debugging port 9226');
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
  const pageWs = new WebSocket(`ws://127.0.0.1:9226/devtools/page/${targetId}`);
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

  await sendPage('Runtime.evaluate', {
    expression: `
      (function() {
        var app = window.App || window.__fvh;
        if (app) app.go('battlepass');
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1200));

  const shot = await sendPage('Page.captureScreenshot', { format: 'png' });
  const fullPath = path.join(artifactDir, 'battlepass_dual_track_rewards.png');
  fs.writeFileSync(fullPath, Buffer.from(shot.data, 'base64'));
  console.log('✓ Saved updated battlepass_dual_track_rewards.png (' + fs.statSync(fullPath).size + ' bytes)');

  // Also capture a close-up crop of Level 2 card to inspect pixel perfection!
  const boxInfo = await sendPage('Runtime.evaluate', {
    expression: `
      (function() {
        var cards = document.querySelectorAll('.fvh-bp-level-card');
        if (cards.length > 1) {
          var rect = cards[1].getBoundingClientRect();
          return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
        }
        return null;
      })()
    `,
    returnByValue: true
  });
  console.log('Level 2 Card rect:', boxInfo.result && boxInfo.result.value);

  pageWs.close();
  ws.close();
  chrome.kill();
}

main().catch(console.error);
