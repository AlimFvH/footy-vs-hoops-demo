/**
 * scripts/capture_mvp_audit_visuals.cjs
 * Captures clean, high-resolution visual evidence of the MVP in headless Chrome.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';
const TEST_PORT = '8497';
const tmpDataPath = path.join(__dirname, 'temp_mvp_capture_data.json');

async function run() {
  fs.copyFileSync('server/data.json', tmpDataPath);

  const server = spawn('node', ['server/server.js'], {
    env: Object.assign({}, process.env, {
      PORT: TEST_PORT,
      NODE_ENV: 'test',
      FVH_TEST_FAST: '1',
      DATA_FILE: tmpDataPath
    })
  });

  await new Promise(r => setTimeout(r, 1500));

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--user-data-dir=C:\\Users\\ASUS\\AppData\\Local\\Temp\\chrome_debug_mvp_capture',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1280,720',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const verRes = await fetch('http://127.0.0.1:9222/json/version');
    const ver = await verRes.json();
    const ws = new WebSocket(ver.webSocketDebuggerUrl);
    let msgId = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        callbacks.get(msg.id)(msg);
        callbacks.delete(msg.id);
      }
    };
    await new Promise(r => ws.onopen = r);

    function sendRoot(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        callbacks.set(id, (res) => {
          if (res.error) reject(new Error(res.error.message));
          else resolve(res.result);
        });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    const { targetId } = await sendRoot('Target.createTarget', { url: 'about:blank' });
    const pageWs = new WebSocket(`ws://127.0.0.1:9222/devtools/page/${targetId}`);
    await new Promise(r => pageWs.onopen = r);

    let pId = 1;
    const pCallbacks = new Map();
    pageWs.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pCallbacks.has(msg.id)) {
        pCallbacks.get(msg.id)(msg);
        pCallbacks.delete(msg.id);
      }
    };

    function call(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = pId++;
        pCallbacks.set(id, (res) => {
          if (res.error) reject(new Error(res.error.message));
          else resolve(res.result);
        });
        pageWs.send(JSON.stringify({ id, method, params }));
      });
    }

    await call('Page.enable');
    await call('Runtime.enable');
    await call('Page.navigate', { url: `http://127.0.0.1:${TEST_PORT}/` });
    await new Promise(r => setTimeout(r, 2500));

    async function evalJs(expr) {
      const res = await call('Runtime.evaluate', { expression: `(async () => {\n${expr}\n})()`, returnByValue: true, awaitPromise: true });
      return res.result?.value;
    }

    async function snap(fileName) {
      const { data } = await call('Page.captureScreenshot', { format: 'png' });
      const p = path.join(artifactDir, fileName);
      fs.writeFileSync(p, Buffer.from(data, 'base64'));
      console.log('Saved visual artifact:', fileName);
    }

    // 1. Arenas Screen
    await evalJs(`
      window.__fvh.showArenas();
    `);
    await new Promise(r => setTimeout(r, 800));
    await snap('mvp_arena_selector.png');

    // 2. Football Match Visual
    await evalJs(`
      window.__fvh.launch({ mode: 'footy', difficulty: 'normal', minutes: 1, boostId: null }, false);
    `);
    await new Promise(r => setTimeout(r, 1500));
    await snap('mvp_football_match.png');

    // 3. Match Results Screen
    await evalJs(`
      window.__fvh.game.onMatchEnd({
        mode: 'footy',
        score: [2, 1],
        winner: 0,
        stats: { humanGoals: 2, cpuGoals: 1, humanShots: 5, humanTackles: 3, humanPasses: 4 },
        humanThrees: 0,
        humanDunks: 0,
        boostId: null
      });
    `);
    await new Promise(r => setTimeout(r, 1000));
    await snap('mvp_results_screen.png');

    // 4. Basketball Match Visual
    await evalJs(`
      window.__fvh.launch({ mode: 'hoops', difficulty: 'normal', minutes: 1, boostId: null }, false);
    `);
    await new Promise(r => setTimeout(r, 1500));
    await snap('mvp_basketball_match.png');

    // 5. Mobile Touch Emulation
    await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await call('Emulation.setTouchEmulationEnabled', { enabled: true });
    await evalJs(`
      window.__fvh.hud.setTouchVisible(true);
    `);
    await new Promise(r => setTimeout(r, 800));
    await snap('mvp_touch_mobile.png');

    console.log('All MVP visual captures complete!');
    await sendRoot('Target.closeTarget', { targetId });
  } finally {
    try { chrome.kill(); } catch (e) {}
    try { server.kill(); } catch (e) {}
    if (fs.existsSync(tmpDataPath)) {
      try { fs.unlinkSync(tmpDataPath); } catch (e) {}
    }
  }
}

run().catch(console.error);
