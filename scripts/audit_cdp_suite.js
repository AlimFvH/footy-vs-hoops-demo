const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

const mobileScreens = [
  { id: 'settings_mobile', url: 'http://localhost:8099/index.html?page=settings', name: 'Settings (Mobile 375x667)' },
  { id: 'menu_mobile', url: 'http://localhost:8099/index.html?page=menu', name: 'Main Menu (Mobile 375x667)' },
  { id: 'mode_select_mobile', url: 'http://localhost:8099/index.html?page=mode', name: 'Mode Selection (Mobile 375x667)' },
  { id: 'char_footy_mobile', url: 'http://localhost:8099/index.html?page=characters&char=footy', name: 'FOOTY Locker (Mobile 375x667)' },
  { id: 'char_hoops_mobile', url: 'http://localhost:8099/index.html?page=characters&char=hoops', name: 'HOOPS Locker (Mobile 375x667)' },
  { id: 'shop_featured_mobile', url: 'http://localhost:8099/index.html?page=shop', name: 'Shop Featured (Mobile 375x667)' },
  { id: 'shop_bundles_mobile', url: 'http://localhost:8099/index.html?page=shop&cat=bundles', name: 'Shop Bundles (Mobile 375x667)' },
  { id: 'arenas_mobile', url: 'http://localhost:8099/index.html?page=arenas', name: 'Arenas Gallery (Mobile 375x667)' },
  { id: 'quests_gameplay_mobile', url: 'http://localhost:8099/index.html?page=quests&tab=gameplay', name: 'Gameplay Quests (Mobile 375x667)' },
  { id: 'quests_social_mobile', url: 'http://localhost:8099/index.html?page=quests&tab=social', name: 'Social Quests (Mobile 375x667)' },
  { id: 'quests_referrals_mobile', url: 'http://localhost:8099/index.html?page=quests&tab=referrals', name: 'Referral Squad Hub (Mobile 375x667)' },
  { id: 'bp_dual_mobile', url: 'http://localhost:8099/index.html?page=battlepass', name: 'Battle Pass Dual Track (Mobile 375x667)' },
  { id: 'profile_mobile', url: 'http://localhost:8099/index.html?page=profile', name: 'Player Profile (Mobile 375x667)' }
];

async function captureScreens() {
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

  // Create new page target
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
  await sendPage('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 667,
    deviceScaleFactor: 1,
    mobile: true
  });

  for (const scr of mobileScreens) {
    console.log(`Auditing ${scr.name}...`);
    await sendPage('Page.navigate', { url: scr.url });
    await new Promise(r => setTimeout(r, 1500));
    const shot = await sendPage('Page.captureScreenshot', { format: 'png' });
    const outPath = path.join(artifactDir, `true_mobile_${scr.id}.png`);
    fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
    console.log(`  ✓ Saved: true_mobile_${scr.id}.png (${fs.statSync(outPath).size} bytes)`);
  }

  ws.close();
  pageWs.close();
  chrome.kill();
  console.log('\nAll true mobile screenshots captured successfully!');
}

captureScreens().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
