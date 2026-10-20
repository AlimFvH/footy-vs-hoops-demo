const fs = require('fs');
const { spawn } = require('child_process');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function main() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9271',
    '--disable-gpu',
    '--window-size=412,915',
    '--no-sandbox',
    'about:blank'
  ]);

  let ver;
  for (let i = 0; i < 25; i++) {
    try {
      await new Promise(r => setTimeout(r, 250));
      const res = await fetch('http://127.0.0.1:9271/json/version');
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
  const pageWs = new WebSocket(`ws://127.0.0.1:9271/devtools/page/${target.targetId}`);
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

  await new Promise(r => setTimeout(r, 1500));

  // Snap 1: Full Main Menu with Realistic Heroes
  const snapMenu = await sendPage('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}/audit_screen_menu_realistic.png`, Buffer.from(snapMenu.data, 'base64'));
  console.log('Saved audit_screen_menu_realistic.png');

  // Snap 2: Footy Locker / Wardrobe with Gear
  await sendPage('Runtime.evaluate', {
    expression: "document.querySelector('.fvh-hero-card.footy').click()"
  });
  await new Promise(r => setTimeout(r, 600));
  const snapLockerFooty = await sendPage('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}/audit_screen_locker_footy_realistic.png`, Buffer.from(snapLockerFooty.data, 'base64'));
  console.log('Saved audit_screen_locker_footy_realistic.png');

  // Close locker and open Hoops locker
  await sendPage('Runtime.evaluate', {
    expression: "window.App.showMenu()"
  });
  await new Promise(r => setTimeout(r, 500));

  await sendPage('Runtime.evaluate', {
    expression: "document.querySelector('.fvh-hero-card.hoops').click()"
  });
  await new Promise(r => setTimeout(r, 600));
  const snapLockerHoops = await sendPage('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}/audit_screen_locker_hoops_realistic.png`, Buffer.from(snapLockerHoops.data, 'base64'));
  console.log('Saved audit_screen_locker_hoops_realistic.png');

  pageWs.close();
  browserWs.close();
  chrome.kill();
  console.log('All menu snapshots captured successfully!');
}

main().catch(console.error);
