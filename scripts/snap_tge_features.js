const fs = require('fs');
const { spawn } = require('child_process');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function main() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9299',
    '--disable-gpu',
    '--window-size=412,915',
    '--no-sandbox',
    'about:blank'
  ]);

  let ver;
  for (let i = 0; i < 25; i++) {
    try {
      await new Promise(r => setTimeout(r, 250));
      const res = await fetch('http://127.0.0.1:9299/json/version');
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
  const pageWs = new WebSocket(`ws://127.0.0.1:9299/devtools/page/${target.targetId}`);
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

  // 1. Snapshot: Team Selection Modal with $FOOTY and $HOOPS token badges
  console.log('1. Capturing Team Selection Modal with Tokens...');
  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}/audit_screen_team_selection_tokens.png`, Buffer.from(shot.data, 'base64'));
  console.log('Saved audit_screen_team_selection_tokens.png');

  // Choose Football and dismiss modal
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
  await new Promise(r => setTimeout(r, 1200));

  // 2. Snapshot: War Leaderboard with TGE Prize Pool
  console.log('2. Capturing War Leaderboard with TGE Prize Pool...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      window.app.showLeaderboard();
    })()`
  });
  await new Promise(r => setTimeout(r, 1500));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}/audit_screen_war_leaderboard_tge_pool.png`, Buffer.from(shot.data, 'base64'));
  console.log('Saved audit_screen_war_leaderboard_tge_pool.png');

  // 3. Snapshot: Profile for Football ($FOOTY airdrop qualification & wallet box)
  console.log('3. Capturing Profile for Football ($FOOTY card)...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      window.app.showProfile();
      setTimeout(() => {
        const c = document.querySelector('.page-body') || document.querySelector('.fvh-profile-container');
        if (c) c.scrollTop = 380;
      }, 200);
    })()`
  });
  await new Promise(r => setTimeout(r, 1500));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}/audit_screen_profile_footy_tge_card.png`, Buffer.from(shot.data, 'base64'));
  console.log('Saved audit_screen_profile_footy_tge_card.png');

  // 4. Snapshot: Open TON Wallet Link Modal
  console.log('4. Capturing Wallet Link Modal...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('.fvh-tge-btn-connect');
      if (btn) btn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 800));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}/audit_screen_wallet_link_modal.png`, Buffer.from(shot.data, 'base64'));
  console.log('Saved audit_screen_wallet_link_modal.png');

  // Connect wallet with mock public address and close modal
  await send('Runtime.evaluate', {
    expression: `(() => {
      const input = document.querySelector('#fvh-tge-input-wallet');
      if (input) input.value = 'EQBvW8Z5huBkMJYdn3PCDpjuvuFu3FZbVIiksmAA00112233';
      const saveBtn = document.querySelector('.fvh-btn-save-wallet');
      if (saveBtn) saveBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 800));

  // 5. Snapshot: Switch to Hoops & Capture Basketball Profile ($HOOPS card)
  console.log('5. Capturing Profile for Basketball ($HOOPS card)...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      window.app.store.update(d => {
        d.selectedCharacter = 'hoops';
      });
      window.app.showProfile();
      setTimeout(() => {
        const c = document.querySelector('.page-body') || document.querySelector('.fvh-profile-container');
        if (c) c.scrollTop = 380;
      }, 200);
    })()`
  });
  await new Promise(r => setTimeout(r, 1500));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}/audit_screen_profile_hoops_tge_card.png`, Buffer.from(shot.data, 'base64'));
  console.log('Saved audit_screen_profile_hoops_tge_card.png');

  chrome.kill();
  console.log('All TGE features screenshots successfully captured!');
}

main().catch(console.error);
