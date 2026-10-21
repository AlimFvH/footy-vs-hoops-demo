const fs = require('fs');
const { spawn } = require('child_process');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function main() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9295',
    '--disable-gpu',
    '--window-size=412,915',
    '--no-sandbox',
    'about:blank'
  ]);

  let ver;
  for (let i = 0; i < 25; i++) {
    try {
      await new Promise(r => setTimeout(r, 250));
      const res = await fetch('http://127.0.0.1:9295/json/version');
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

  const target = await sendBrowser('Target.createTarget', { url: 'http://localhost:8099/index.html?page=mode' });
  const pageWs = new WebSocket(`ws://127.0.0.1:9295/devtools/page/${target.targetId}`);
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
    width: 393,
    height: 852,
    deviceScaleFactor: 2,
    mobile: true
  });

  await new Promise(r => setTimeout(r, 2000));

  // 1. Capture Mode Selection with Featured Clash Card
  console.log('Capturing Mode Select screen...');
  const snapMode = await sendPage('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}/audit_screen_mode_clash.png`, Buffer.from(snapMode.data, 'base64'));
  console.log('Saved audit_screen_mode_clash.png');

  // 2. Launch Footy vs Hoops Clash match
  console.log('Launching Footy vs Hoops clash match...');
  await sendPage('Runtime.evaluate', {
    expression: "window.App.launch({ mode: 'footy', char: 'footy', difficulty: 'normal', minutes: 2 }, false)"
  });
  await new Promise(r => setTimeout(r, 2600));

  const snapClashFooty = await sendPage('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}/audit_screen_clash_football_match.png`, Buffer.from(snapClashFooty.data, 'base64'));
  console.log('Saved audit_screen_clash_football_match.png');

  // 3. Launch Hoops vs Footy Clash match
  console.log('Launching Hoops vs Footy clash match...');
  await sendPage('Runtime.evaluate', {
    expression: "window.App.launch({ mode: 'hoops', char: 'hoops', difficulty: 'normal', minutes: 2 }, false)"
  });
  await new Promise(r => setTimeout(r, 2600));

  const snapClashHoops = await sendPage('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}/audit_screen_clash_basketball_match.png`, Buffer.from(snapClashHoops.data, 'base64'));
  console.log('Saved audit_screen_clash_basketball_match.png');

  chrome.kill();
  console.log('Finished capturing clash matches.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
