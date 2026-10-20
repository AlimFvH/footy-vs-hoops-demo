const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function run() {
  console.log('Capturing Default Football and Basketball Arena proofs...');
  const chrome = spawn(chromePath, ['--headless=new', '--remote-debugging-port=9222', '--disable-gpu', '--no-sandbox', 'about:blank']);
  await new Promise(r => setTimeout(r, 1500));
  const verRes = await fetch('http://127.0.0.1:9222/json/version');
  const ver = await verRes.json();
  const ws = new WebSocket(ver.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 1;
  const callbacks = new Map();
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && callbacks.has(msg.id)) { callbacks.get(msg.id)(msg); callbacks.delete(msg.id); }
  };
  function send(method, params = {}) {
    return new Promise((res, rej) => {
      const mid = id++;
      callbacks.set(mid, (r) => r.error ? rej(new Error(r.error.message)) : res(r.result));
      ws.send(JSON.stringify({ id: mid, method, params }));
    });
  }

  const items = [
    { id: 'after_default_football_stadium', arenaId: 'std_footy_classic', mode: 'footy', name: 'Default Football Arena' },
    { id: 'after_default_basketball_court', arenaId: 'std_hoops_street', mode: 'hoops', name: 'Default Basketball Arena' }
  ];

  for (const it of items) {
    console.log(`Capturing ${it.name} (${it.arenaId})...`);
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const pageWs = new WebSocket(`ws://127.0.0.1:9222/devtools/page/${targetId}`);
    await new Promise(r => pageWs.onopen = r);
    let pid = 1;
    const pcb = new Map();
    pageWs.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id && pcb.has(msg.id)) { pcb.get(msg.id)(msg); pcb.delete(msg.id); }
    };
    function sendPage(method, params = {}) {
      return new Promise((res, rej) => {
        const mid = pid++;
        pcb.set(mid, (r) => r.error ? rej(new Error(r.error.message)) : res(r.result));
        pageWs.send(JSON.stringify({ id: mid, method, params }));
      });
    }
    await sendPage('Page.enable');
    await sendPage('Runtime.enable');
    await sendPage('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 2, mobile: true });
    await sendPage('Page.navigate', { url: 'http://localhost:8099' });
    await new Promise(r => setTimeout(r, 2000));
    await sendPage('Runtime.evaluate', {
      expression: `(() => {
        try {
          const st = window.__debugStore || JSON.parse(localStorage.getItem('fvh_store_v1') || '{}');
          st.equipped = st.equipped || {};
          st.equipped.stadium = '${it.arenaId}';
          localStorage.setItem('fvh_store_v1', JSON.stringify(st));
          if (window.App && typeof window.App.startQuickMatch === 'function') {
            window.App.startQuickMatch('${it.mode}');
          } else if (window.__debugEngine && typeof window.__debugEngine.startMatch === 'function') {
            window.__debugEngine.startMatch('${it.mode}', { stadium: '${it.arenaId}' });
          }
        } catch(e) {}
      })()`
    });
    await new Promise(r => setTimeout(r, 2500));
    const ss = await sendPage('Page.captureScreenshot', { format: 'png' });
    const outPath = path.join(artifactDir, `${it.id}.png`);
    fs.writeFileSync(outPath, Buffer.from(ss.data, 'base64'));
    console.log(`Saved ${outPath}`);
    await send('Target.closeTarget', { targetId });
  }
  chrome.kill();
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
