const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function main() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9260',
    '--disable-gpu',
    '--window-size=393,852',
    '--no-sandbox',
    'about:blank'
  ]);

  let ver;
  for (let i = 0; i < 25; i++) {
    try {
      await new Promise(r => setTimeout(r, 300));
      const res = await fetch('http://127.0.0.1:9260/json/version');
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

  const { targetId } = await sendBrowser('Target.createTarget', { url: 'about:blank' });
  const pageWs = new WebSocket(`ws://127.0.0.1:9260/devtools/page/${targetId}`);
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
    console.log('Saved', name);
  }

  console.log('Navigating to http://localhost:8099 ...');
  await sendPage('Page.navigate', { url: 'http://localhost:8099' });
  await new Promise(r => setTimeout(r, 2200));

  // 1. Menu with Leaderboard trophy button
  await snap('audit_screen_menu_leaderboard.png');

  // 2. Go to leaderboard (Season)
  await sendPage('Runtime.evaluate', {
    expression: 'var app = window.App || window.__fvh; if (app) app.go("leaderboard", { category: "season" });'
  });
  await new Promise(r => setTimeout(r, 1200));
  await snap('audit_screen_leaderboard_season.png');

  // 3. Switch to Footy tab
  await sendPage('Runtime.evaluate', {
    expression: `(function(){
      var btns = Array.from(document.querySelectorAll('.fvh-tab-seg'));
      var b = btns.find(x => x.textContent.includes('Футбол') || x.textContent.includes('Footy'));
      if (b) b.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1200));
  await snap('audit_screen_leaderboard_footy.png');

  // 4. Switch to Coins tab
  await sendPage('Runtime.evaluate', {
    expression: `(function(){
      var btns = Array.from(document.querySelectorAll('.fvh-tab-seg'));
      var b = btns.find(x => x.textContent.includes('Монеты') || x.textContent.includes('Coins'));
      if (b) b.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1200));
  await snap('audit_screen_leaderboard_coins.png');

  pageWs.close();
  browserWs.close();
  chrome.kill();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
