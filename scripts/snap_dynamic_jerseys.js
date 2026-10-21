const fs = require('fs');
const { spawn } = require('child_process');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function main() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9290',
    '--disable-gpu',
    '--window-size=412,915',
    '--no-sandbox',
    'about:blank'
  ]);

  let ver;
  for (let i = 0; i < 25; i++) {
    try {
      await new Promise(r => setTimeout(r, 250));
      const res = await fetch('http://127.0.0.1:9290/json/version');
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
  const pageWs = new WebSocket(`ws://127.0.0.1:9290/devtools/page/${target.targetId}`);
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
  await new Promise(r => setTimeout(r, 1500));

  // Wait for app and onboarding modal
  await send('Runtime.evaluate', {
    expression: `(async () => {
      // If modal button exists, click it, or set teamChosen
      const btn = document.querySelector('.fvh-btn-choose-footy');
      if (btn) btn.click();
      window.app.store.update(d => {
        d.teamChosen = true;
        d.selectedCharacter = 'footy';
        if (!d.equipped) d.equipped = {};
        d.equipped.skin = 'skin_rookie';
      });
      window.app.showMenu();
    })()`,
    awaitPromise: true
  });
  await new Promise(r => setTimeout(r, 1500));

  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(artifactDir + '/audit_screen_main_menu_footy_no_switch.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved audit_screen_main_menu_footy_no_switch.png');

  // 2. Equip Crimson Comet (Red) on FOOTY and capture main menu
  await send('Runtime.evaluate', {
    expression: `(() => {
      window.app.store.update(d => {
        d.teamChosen = true;
        d.selectedCharacter = 'footy';
        if (!d.equipped) d.equipped = {};
        d.equipped.skin = 'skin_crimson';
      });
      window.app.showMenu();
    })()`
  });
  await new Promise(r => setTimeout(r, 1500));

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(artifactDir + '/audit_screen_main_menu_footy_crimson_jersey.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved audit_screen_main_menu_footy_crimson_jersey.png');

  // 3. Equip Golden Legend on FOOTY and capture wardrobe preview
  await send('Runtime.evaluate', {
    expression: `(() => {
      window.app.store.update(d => {
        d.teamChosen = true;
        d.selectedCharacter = 'footy';
        if (!d.equipped) d.equipped = {};
        d.equipped.skin = 'skin_gold';
      });
      window.app.openCharacterLocker('footy');
    })()`
  });
  await new Promise(r => setTimeout(r, 1500));

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(artifactDir + '/audit_screen_wardrobe_footy_gold_jersey.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved audit_screen_wardrobe_footy_gold_jersey.png');

  // 4. Return to main menu with Golden Legend and capture
  await send('Runtime.evaluate', {
    expression: `(() => {
      window.app.showMenu();
    })()`
  });
  await new Promise(r => setTimeout(r, 1500));

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(artifactDir + '/audit_screen_main_menu_footy_gold_jersey.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved audit_screen_main_menu_footy_gold_jersey.png');

  // 5. Basketball side: HOOPS with Cyber Punk jersey
  await send('Runtime.evaluate', {
    expression: `(() => {
      window.app.store.update(d => {
        d.teamChosen = true;
        d.selectedCharacter = 'hoops';
        if (!d.equipped) d.equipped = {};
        d.equipped.skin = 'skin_gold';
      });
      window.app.showMenu();
    })()`
  });
  await new Promise(r => setTimeout(r, 1500));

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(artifactDir + '/audit_screen_main_menu_hoops_cyber_jersey.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved audit_screen_main_menu_hoops_cyber_jersey.png');

  chrome.kill();
  console.log('All verification screenshots captured!');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
