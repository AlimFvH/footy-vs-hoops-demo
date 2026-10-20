const fs = require('fs');
const { spawn } = require('child_process');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function main() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9273',
    '--disable-gpu',
    '--window-size=1200,900',
    '--no-sandbox',
    'about:blank'
  ]);

  let ver;
  for (let i = 0; i < 25; i++) {
    try {
      await new Promise(r => setTimeout(r, 250));
      const res = await fetch('http://127.0.0.1:9273/json/version');
      ver = await res.json();
      if (ver && ver.webSocketDebuggerUrl) break;
    } catch (e) {}
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

  const target = await sendBrowser('Target.createTarget', { url: 'http://localhost:8099/index.html' });
  const pageWs = new WebSocket(`ws://127.0.0.1:9273/devtools/page/${target.targetId}`);
  let pid = 1;
  const pCallbacks = new Map();
  pageWs.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pCallbacks.has(msg.id)) { pCallbacks.get(msg.id)(msg); pCallbacks.delete(msg.id); }
  };
  await new Promise(r => pageWs.onopen = r);

  function sendPage(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = pid++;
      pCallbacks.set(msgId, (res) => { if (res.error) reject(new Error(res.error.message)); else resolve(res.result); });
      pageWs.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await sendPage('Page.enable');
  await sendPage('Emulation.setDeviceMetricsOverride', {
    width: 800,
    height: 700,
    deviceScaleFactor: 2,
    mobile: false
  });

  await new Promise(r => setTimeout(r, 1200));

  // Start Football practice match
  await sendPage('Runtime.evaluate', {
    expression: "window.App.startPractice('footy')"
  });
  await new Promise(r => setTimeout(r, 2200));

  // Capture close-up of center field where player is
  const snapFootyClose = await sendPage('Page.captureScreenshot', {
    format: 'png',
    clip: { x: 250, y: 300, width: 300, height: 350, scale: 2 }
  });
  fs.writeFileSync(`${artifactDir}/audit_closeup_game_footy_player.png`, Buffer.from(snapFootyClose.data, 'base64'));

  // Switch to Hoops
  await sendPage('Runtime.evaluate', {
    expression: "window.App.game.stop(); window.App.startPractice('hoops');"
  });
  await new Promise(r => setTimeout(r, 2200));

  const snapHoopsClose = await sendPage('Page.captureScreenshot', {
    format: 'png',
    clip: { x: 250, y: 300, width: 300, height: 350, scale: 2 }
  });
  fs.writeFileSync(`${artifactDir}/audit_closeup_game_hoops_player.png`, Buffer.from(snapHoopsClose.data, 'base64'));

  pageWs.close();
  browserWs.close();
  chrome.kill();
  console.log('Saved audit_closeup_game_footy_player.png and audit_closeup_game_hoops_player.png');
}

main().catch(console.error);
