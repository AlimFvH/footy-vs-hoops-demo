const fs = require('fs');
const { spawn } = require('child_process');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function main() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9300',
    '--disable-gpu',
    '--window-size=412,915',
    '--no-sandbox',
    'about:blank'
  ]);

  let ver;
  for (let i = 0; i < 25; i++) {
    try {
      await new Promise(r => setTimeout(r, 250));
      const res = await fetch('http://127.0.0.1:9300/json/version');
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
  const pageWs = new WebSocket(`ws://127.0.0.1:9300/devtools/page/${target.targetId}`);
  let pid = 1;
  const pCallbacks = new Map();
  pageWs.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pCallbacks.has(msg.id)) { pCallbacks.get(msg.id)(msg); pCallbacks.delete(msg.id); }
  };
  await new Promise(r => pageWs.onopen = r);

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = pid++;
      pCallbacks.set(msgId, (res) => { if (res.error) reject(new Error(res.error.message)); else resolve(res.result); });
      pageWs.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 393,
    height: 852,
    deviceScaleFactor: 2,
    mobile: true
  });

  // Wait for game app to initialize
  console.log('Waiting for game app...');
  for (let i = 0; i < 40; i++) {
    const evalRes = await send('Runtime.evaluate', { expression: 'typeof window.app !== "undefined" && typeof window.app.showMenu === "function"' });
    if (evalRes.result && evalRes.result.value === true) break;
    await new Promise(r => setTimeout(r, 200));
  }
  await new Promise(r => setTimeout(r, 1000));

  // Dismiss onboarding modal
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('.fvh-btn-choose-footy');
      if (btn) btn.click();
      window.app.store.update(d => {
        d.selectedCharacter = 'footy';
        d.teamChosen = true;
      });
      const sheet = document.querySelector('.fvh-team-modal-back');
      if (sheet) sheet.remove();
      window.app.showMenu();
    })()`
  });
  await new Promise(r => setTimeout(r, 1000));

  // 1. Open Mode Select & switch difficulty to Hard
  console.log('1. Capturing Mode Selection with Hard Difficulty selected...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      window.app.showModeSelect();
      setTimeout(() => {
        const c = document.querySelector('.page-body') || document.querySelector('.screen') || window;
        if (c.scrollTop !== undefined) c.scrollTop = 650;
        const hardBtn = document.querySelector('.seg-diff button[data-diff="hard"]');
        if (hardBtn) hardBtn.click();
      }, 300);
    })()`
  });
  await new Promise(r => setTimeout(r, 1200));
  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}/audit_screen_mode_select_hard_diff.png`, Buffer.from(shot.data, 'base64'));
  console.log('Saved audit_screen_mode_select_hard_diff.png');

  // 2. Open War Leaderboard showing AI points breakdown
  console.log('2. Capturing War Leaderboard with AI Points Breakdown...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      window.app.showLeaderboard();
    })()`
  });
  await new Promise(r => setTimeout(r, 1500));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}/audit_screen_war_lb_diff_rules.png`, Buffer.from(shot.data, 'base64'));
  console.log('Saved audit_screen_war_lb_diff_rules.png');

  chrome.kill();
  console.log('All difficulty snapshot tests complete!');
}

main().catch(console.error);
