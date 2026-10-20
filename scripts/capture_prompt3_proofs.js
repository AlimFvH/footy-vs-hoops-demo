const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function run() {
  console.log('=== Capturing Prompt 3 Visual Proofs via Headless Chrome CDP ===\n');

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

  async function evalExpr(code) {
    const res = await sendPage('Runtime.evaluate', {
      expression: code,
      returnByValue: true
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.exception.description);
    }
    return res.result.value;
  }

  async function snap(filename) {
    const shot = await sendPage('Page.captureScreenshot', { format: 'png' });
    const fullPath = path.join(artifactDir, filename);
    fs.writeFileSync(fullPath, Buffer.from(shot.data, 'base64'));
    console.log(`Saved screenshot: ${filename}`);
  }

  // ------------------------------------------------------------------------
  // 1. MOBILE PROOFS (375 x 667)
  // ------------------------------------------------------------------------
  console.log('\n--- Mobile Viewport (375x667) ---');
  await sendPage('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 667,
    deviceScaleFactor: 1,
    mobile: true
  });
  await sendPage('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });

  await sendPage('Page.navigate', { url: 'http://localhost:8099/index.html' });
  await new Promise(r => setTimeout(r, 2000));

  // Launch Football match on mobile and trigger Overtime banner
  await evalExpr(`
    window.__fvh.launch({
      mode: 'footy',
      difficulty: 'normal',
      minutes: 1,
      skipCountdown: true,
      boostId: null
    }, false);
  `);
  await new Promise(r => setTimeout(r, 600));

  // Set sim into overtime phase
  await evalExpr(`
    window.__fvh.game.sim.matchPhase = 'overtime';
    window.__fvh.game.sim.timeLeft = 28;
    window.__fvh.game.sim.score = [1, 1];
    window.__fvh.game.hud.showBanner('ОВЕРТАЙМ', 'goal', 5000);
  `);
  await new Promise(r => setTimeout(r, 400));
  await snap('prompt3_football_overtime_mobile.png');

  // Trigger Sudden Death in Football on mobile
  await evalExpr(`
    window.__fvh.game.sim.matchPhase = 'suddendeath';
    window.__fvh.game.sim.timeLeft = 0;
    window.__fvh.game.hud.showBanner('ВНЕЗАПНАЯ СМЕРТЬ', 'big', 5000);
  `);
  await new Promise(r => setTimeout(r, 400));
  await snap('prompt3_football_suddendeath_mobile.png');

  // Launch Basketball match on mobile and capture gameplay with overtime clock
  await evalExpr(`
    window.__fvh.launch({
      mode: 'hoops',
      difficulty: 'normal',
      minutes: 1,
      skipCountdown: true,
      boostId: null
    }, false);
  `);
  await new Promise(r => setTimeout(r, 600));
  await evalExpr(`
    window.__fvh.game.sim.matchPhase = 'overtime';
    window.__fvh.game.sim.timeLeft = 25;
    window.__fvh.game.sim.score = [12, 12];
    window.__fvh.game.hud.showBanner('ОВЕРТАЙМ', 'goal', 4000);
  `);
  await new Promise(r => setTimeout(r, 400));
  await snap('prompt3_basketball_overtime_mobile.png');

  // ------------------------------------------------------------------------
  // 2. DESKTOP PROOFS (1280 x 800)
  // ------------------------------------------------------------------------
  console.log('\n--- Desktop Viewport (1280x800) ---');
  await sendPage('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false
  });
  await sendPage('Emulation.setTouchEmulationEnabled', { enabled: false });

  // Launch Football on Desktop and position camera towards goal to display large LED advertising board
  await evalExpr(`
    window.__fvh.launch({
      mode: 'footy',
      difficulty: 'normal',
      minutes: 1,
      skipCountdown: true,
      boostId: null
    }, false);
  `);
  await new Promise(r => setTimeout(r, 800));

  // Advance game so ball/camera moves near the goal area with the board visible
  await evalExpr(`
    {
      const sim = window.__fvh.game.sim;
      sim.ball.x = 0;
      sim.ball.z = -18;
      sim.ball.y = 0.5;
      sim.human.x = 0;
      sim.human.z = -14;
      window.__fvh.game.view.rig.update(0.1, sim.ball, sim.human);
    }
  `);
  await new Promise(r => setTimeout(r, 400));
  await snap('prompt3_football_led_desktop.png');

  // Launch Basketball on Desktop and position camera near hoop to display large LED advertising board
  await evalExpr(`
    window.__fvh.launch({
      mode: 'hoops',
      difficulty: 'normal',
      minutes: 1,
      skipCountdown: true,
      boostId: null
    }, false);
  `);
  await new Promise(r => setTimeout(r, 800));

  await evalExpr(`
    {
      const sim = window.__fvh.game.sim;
      sim.ball.x = 0;
      sim.ball.z = 8;
      sim.ball.y = 1.0;
      sim.human.x = 0;
      sim.human.z = 6;
      window.__fvh.game.view.rig.update(0.1, sim.ball, sim.human);
    }
  `);
  await new Promise(r => setTimeout(r, 400));
  await snap('prompt3_basketball_led_desktop.png');

  // Trigger match results screen on Desktop
  await evalExpr(`
    window.__fvh.game.finish(0); // Player wins
  `);
  await new Promise(r => setTimeout(r, 2600)); // wait for results transition
  await snap('prompt3_match_results_desktop.png');

  ws.close();
  pageWs.close();
  chrome.kill();
  console.log('\n=== All Prompt 3 visual proofs successfully captured! ===');
}

run().catch(err => {
  console.error('Error capturing proofs:', err);
  process.exit(1);
});
