const fs = require('fs');
const { spawn } = require('child_process');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function main() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9294',
    '--disable-gpu',
    '--window-size=412,915',
    '--no-sandbox',
    'about:blank'
  ]);

  let ver;
  for (let i = 0; i < 25; i++) {
    try {
      await new Promise(r => setTimeout(r, 250));
      const res = await fetch('http://127.0.0.1:9294/json/version');
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
  const pageWs = new WebSocket(`ws://127.0.0.1:9294/devtools/page/${target.targetId}`);
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

  // Wait for window.app to initialize
  console.log('Waiting for game app to initialize...');
  for (let i = 0; i < 40; i++) {
    const evalRes = await send('Runtime.evaluate', { expression: 'typeof window.app !== "undefined" && typeof window.app.showMenu === "function"' });
    if (evalRes.result && evalRes.result.value === true) break;
    await new Promise(r => setTimeout(r, 200));
  }
  await new Promise(r => setTimeout(r, 1500));

  // Initialize with menu first
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('.fvh-btn-choose-footy');
      if (btn) btn.click();
      window.app.store.update(d => {
        d.selectedCharacter = 'footy';
        d.teamChosen = true;
      });
      window.app.showMenu();
    })()`
  });
  await new Promise(r => setTimeout(r, 1200));

  // 1. Football: Open Shop (All Items)
  console.log('1. Testing Football Shop (all items)...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      window.app.showShop('all');
    })()`
  });
  await new Promise(r => setTimeout(r, 1500));

  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}/audit_screen_shop_football_filtered.png`, Buffer.from(shot.data, 'base64'));
  console.log('Saved audit_screen_shop_football_filtered.png');

  // 1b. Football: Switch to Balls category in Shop
  console.log('1b. Testing Football Shop Balls category...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      window.app.showShop('balls');
    })()`
  });
  await new Promise(r => setTimeout(r, 1200));

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}/audit_screen_shop_football_balls.png`, Buffer.from(shot.data, 'base64'));
  console.log('Saved audit_screen_shop_football_balls.png');

  // 2. Football: Open Single Leaderboard
  console.log('2. Testing Single Team War Leaderboard...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      window.app.showLeaderboard();
    })()`
  });
  await new Promise(r => setTimeout(r, 1800));

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}/audit_screen_leaderboard_team_war.png`, Buffer.from(shot.data, 'base64'));
  console.log('Saved audit_screen_leaderboard_team_war.png');

  // 3. Basketball: Switch to Hoops & Open Shop
  console.log('3. Testing Basketball Shop (all items)...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      window.app.store.update(d => {
        d.selectedCharacter = 'hoops';
        d.teamChosen = true;
      });
      window.app.showShop('all');
    })()`
  });
  await new Promise(r => setTimeout(r, 1500));

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}/audit_screen_shop_basketball_filtered.png`, Buffer.from(shot.data, 'base64'));
  console.log('Saved audit_screen_shop_basketball_filtered.png');

  // 3b. Basketball: Switch to Balls category in Shop
  console.log('3b. Testing Basketball Shop Balls category...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      window.app.showShop('balls');
    })()`
  });
  await new Promise(r => setTimeout(r, 1200));

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}/audit_screen_shop_basketball_balls.png`, Buffer.from(shot.data, 'base64'));
  console.log('Saved audit_screen_shop_basketball_balls.png');

  // 4. Basketball: Open Leaderboard as Basketball athlete
  console.log('4. Testing Leaderboard from Basketball side...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      window.app.showLeaderboard();
    })()`
  });
  await new Promise(r => setTimeout(r, 1800));

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}/audit_screen_leaderboard_basketball_player.png`, Buffer.from(shot.data, 'base64'));
  console.log('Saved audit_screen_leaderboard_basketball_player.png');

  chrome.kill();
  console.log('All visual audit screenshots successfully captured!');
}

main().catch(console.error);
