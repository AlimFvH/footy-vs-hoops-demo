const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function captureViewports(prefix = 'before') {
  console.log(`Starting capture for prefix: ${prefix}...`);
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  let wsUrl;
  for (let i = 0; i < 10; i++) {
    try {
      const verRes = await fetch('http://127.0.0.1:9222/json/version');
      const ver = await verRes.json();
      if (ver && ver.webSocketDebuggerUrl) {
        wsUrl = ver.webSocketDebuggerUrl;
        break;
      }
    } catch (e) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  if (!wsUrl) {
    chrome.kill();
    throw new Error('Chrome remote debug not ready');
  }

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

  const arenasToTest = [
    { id: 'view1_crystal_neon_footy', arenaId: 'std_crystal_cavern', mode: 'footy', name: 'Screenshot 1: Crystal / Neon Football' },
    { id: 'view2_forest_redwood_footy', arenaId: 'std_forest_redwood', mode: 'footy', name: 'Screenshot 2: Forest Redwood Football' },
    { id: 'view3_neon_hoops_court', arenaId: 'std_hoops_neon', mode: 'hoops', name: 'Screenshot 3: Neon Street Basketball' },
    { id: 'view4_floating_sky_footy', arenaId: 'std_floating_islands', mode: 'footy', name: 'Screenshot 4: Floating Sky Islands Football' }
  ];

  for (const item of arenasToTest) {
    console.log(`\nCapturing ${item.name} (${item.arenaId})...`);
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
    await sendPage('Runtime.enable');
    await sendPage('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 812, // Modern mobile portrait aspect
      deviceScaleFactor: 2,
      mobile: true
    });

    await sendPage('Page.navigate', { url: 'http://localhost:8099/index.html' });
    await new Promise(r => setTimeout(r, 2200));

    // Equip arena and launch match
    const evalRes = await sendPage('Runtime.evaluate', {
      expression: `
        (function() {
          var app = window.__fvh;
          if (!app) return { ok: false, error: 'no __fvh' };
          var slot = '${item.mode}' === 'footy' ? 'stadium.footy' : 'stadium.hoops';
          app.store.update(function(d) {
            if (!d.equipped) d.equipped = {};
            d.equipped[slot] = '${item.arenaId}';
          });
          app.launch({ mode: '${item.mode}', difficulty: 'normal', minutes: 2 }, false);
          return { ok: true, state: app.state, equipped: app.store.data.equipped[slot] };
        })()
      `,
      returnByValue: true
    });
    console.log('  Launched match:', evalRes.result ? evalRes.result.value : 'unknown');

    // Wait 2.5s for countdown and render
    await new Promise(r => setTimeout(r, 2600));

    const shot = await sendPage('Page.captureScreenshot', { format: 'png' });
    const fileName = `${prefix}_${item.id}.png`;
    const outPath = path.join(artifactDir, fileName);
    fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
    console.log(`  Saved screenshot: ${fileName} (${fs.statSync(outPath).size} bytes)`);

    await send('Target.closeTarget', { targetId });
  }

  chrome.kill();
  console.log(`\nCompleted capture for ${prefix}!`);
}

const modeArg = process.argv[2] || 'before';
captureViewports(modeArg).catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
