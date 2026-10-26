const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

// Prefix can be 'c2_' (Stage C.2) or 'c_before_' (Stage C baseline)
const prefix = process.argv[2] || 'c2_';

async function captureAcceptanceSuite() {
  console.log(`=== Capturing Acceptance Suite: Prefix "${prefix}" ===`);

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9225',
    '--user-data-dir=C:\\Users\\ASUS\\AppData\\Local\\Temp\\chrome_debug_acceptance2_' + prefix.replace(/[^a-z0-9]/gi, ''),
    '--disable-gpu',
    '--no-sandbox',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const verRes = await fetch('http://127.0.0.1:9225/json/version');
  const ver = await verRes.json();
  const ws = new WebSocket(ver.webSocketDebuggerUrl);
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
  const pageWs = new WebSocket(`ws://127.0.0.1:9225/devtools/page/${targetId}`);
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
    width: 1080,
    height: 810,
    deviceScaleFactor: 1,
    mobile: false
  });

  await sendPage('Page.navigate', { url: 'http://localhost:8099/index.html' });
  await new Promise(r => setTimeout(r, 2000));

  async function evalExpr(code) {
    const res = await sendPage('Runtime.evaluate', {
      expression: code,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.exception.description);
    }
    return res.result.value;
  }

  // 1. Launch Game
  await evalExpr(`
    window.__fvh.launch({ mode: 'footy', difficulty: 'normal', minutes: 5, skipCountdown: true }, false);
  `);
  await new Promise(r => setTimeout(r, 600));

  // Dismiss banner and hide HUD for pure 3D character review
  await evalExpr(`(() => {
    const sim = window.__fvh.game.sim;
    sim.phase = 'play';
    sim.hold = false;
    const banner = document.querySelector('.banner');
    if (banner) banner.remove();
    const hud = document.getElementById('hud');
    if (hud) hud.style.display = 'none';
  })()`);
  await new Promise(r => setTimeout(r, 300));

  // Measure FPS over 60 frames
  const fpsResult = await evalExpr(`
    new Promise(resolve => {
      let frames = 0;
      let t0 = performance.now();
      function tick() {
        frames++;
        if (frames >= 60) {
          let t1 = performance.now();
          let fps = (frames / ((t1 - t0) / 1000));
          resolve(fps);
        } else {
          requestAnimationFrame(tick);
        }
      }
      requestAnimationFrame(tick);
    })
  `);
  console.log(`Measured Active In-Game FPS (${prefix}): ${fpsResult.toFixed(1)} FPS`);
  fs.writeFileSync(path.join(artifactDir, `${prefix}fps.json`), JSON.stringify({ fps: fpsResult }));

  async function snap(name) {
    const shot = await sendPage('Page.captureScreenshot', { format: 'png' });
    const filePath = path.join(artifactDir, `${prefix}${name}.png`);
    fs.writeFileSync(filePath, Buffer.from(shot.data, 'base64'));
    console.log(`Saved screenshot: ${prefix}${name}.png`);
  }

  // Helper to set custom camera
  async function setCam(posExpr, targetExpr, fov = 35) {
    await evalExpr(`(() => {
      window.__fvh.game.view.rig.update = function() {
        const sim = window.__fvh.game.sim;
        const c = this.cam;
        c.fov = ${fov};
        c.near = 0.1;
        c.position = [${posExpr.join(',')}];
        c.target = [${targetExpr.join(',')}];
        c.update();
      };
    })()`);
    await new Promise(r => setTimeout(r, 200));
  }

  // SCENARIO 1: Full Player Model from the Front (head-to-toe framed)
  console.log('Capturing 1. Player Front...');
  await evalExpr(`(() => {
    const sim = window.__fvh.game.sim;
    const h = sim.human;
    h.x = 0; h.z = 2.4;
    h.fx = 0; h.fz = -1;
    h.vx = 0; h.vz = 0;
    h.kickT = 0; h.diveT = 0;
    h.tackle = { phase: 'none' };
    sim.ball.x = 0;
    sim.ball.z = -15; // Move ball away to eliminate camera occlusion
  })()`);
  await setCam(['sim.human.x', '1.25', 'sim.human.z - 5.0'], ['sim.human.x', '1.10', 'sim.human.z'], 42);
  await snap('1_player_front');

  // SCENARIO 1b: Full Player Model from the Side (90 degrees profile)
  console.log('Capturing 1b. Player Side...');
  await setCam(['sim.human.x + 5.0', '1.25', 'sim.human.z'], ['sim.human.x', '1.10', 'sim.human.z'], 42);
  await snap('1_player_side');

  // SCENARIO 2: Knee and Elbow Joints Close-Up during deep bending / stance
  console.log('Capturing 2. Knee and Elbow Joints...');
  await evalExpr(`(() => {
    const sim = window.__fvh.game.sim;
    const h = sim.human;
    h.fx = 0; h.fz = -1;
    h.vx = 0; h.vz = -2.5; // active stance load
  })()`);
  await setCam(['sim.human.x + 1.45', '0.72', 'sim.human.z - 1.55'], ['sim.human.x', '0.58', 'sim.human.z'], 28);
  await snap('2_knee_elbow_joints');

  // SCENARIO 3: Running and Acceleration (high speed sprint, full body framed)
  console.log('Capturing 3. Running and Acceleration...');
  await evalExpr(`(() => {
    const sim = window.__fvh.game.sim;
    const h = sim.human;
    h.fx = 0; h.fz = -1;
    h.vx = 0; h.vz = -6.2; // full sprint speed
    h.kickT = 0;
  })()`);
  await setCam(['sim.human.x + 5.0', '1.25', 'sim.human.z - 1.0'], ['sim.human.x', '1.05', 'sim.human.z'], 42);
  await snap('3_running_acceleration');

  // SCENARIO 4a: Kicking Animation - Phase 2 Ball Contact / Strike
  console.log('Capturing 4a. Kicking Strike (Contact)...');
  await evalExpr(`(() => {
    const sim = window.__fvh.game.sim;
    const h = sim.human;
    h.fx = 0; h.fz = -1;
    h.vx = 0; h.vz = -1.5;
    h.kickT = 0.14; // Phase 2: Foot strikes ball
    sim.ball.x = h.x;
    sim.ball.y = 0.22;
    sim.ball.z = h.z - 0.55;
  })()`);
  await setCam(['sim.human.x + 3.8', '1.15', 'sim.human.z - 1.4'], ['sim.human.x', '0.90', 'sim.human.z'], 38);
  await snap('4_kicking_strike');

  // SCENARIO 4b: Kicking Animation - Phase 3 Follow-Through
  console.log('Capturing 4b. Kicking Follow-Through...');
  await evalExpr(`(() => {
    const sim = window.__fvh.game.sim;
    const h = sim.human;
    h.fx = 0; h.fz = -1;
    h.kickT = 0.05; // Phase 3: Extended follow-through
    sim.ball.z = h.z - 3.2; // ball flew ahead
    sim.ball.y = 0.65;
  })()`);
  await setCam(['sim.human.x + 3.8', '1.15', 'sim.human.z - 1.4'], ['sim.human.x', '0.90', 'sim.human.z'], 38);
  await snap('4_kicking_followthrough');

  // SCENARIO 5: Slide Tackle (full sliding body framed in view)
  console.log('Capturing 5. Slide Tackle...');
  await evalExpr(`(() => {
    const sim = window.__fvh.game.sim;
    const h = sim.human;
    h.x = 0; h.z = 2.0;
    h.fx = 0; h.fz = -1;
    h.vx = 0; h.vz = 0;
    h.tackle = { phase: 'lunge', t: 0.18, dur: 0.45, recoverDur: 0.25, charge: 1 };
  })()`);
  await setCam(['sim.human.x + 3.6', '0.85', 'sim.human.z - 0.5'], ['sim.human.x', '0.40', 'sim.human.z - 0.5'], 38);
  await snap('5_slide_tackle');

  // SCENARIO 6: Goalkeeper Dive (full keeper body and hands outstretched toward post)
  console.log('Capturing 6. Goalkeeper Dive...');
  await evalExpr(`(() => {
    const sim = window.__fvh.game.sim;
    const k = sim.agents.find(a => a.role === 'keeper' && a.team === 0);
    k.diveT = 0.24;
    k.mx = -1; // diving left towards post
    k.x = -1.8;
    k.vx = 0; k.vz = 0;
    sim.ball.x = -2.8;
    sim.ball.y = 0.75;
    sim.ball.z = k.z - 0.4;
  })()`);
  await evalExpr(`(() => {
    window.__fvh.game.view.rig.update = function() {
      const sim = window.__fvh.game.sim;
      const k = sim.agents.find(a => a.role === 'keeper' && a.team === 0);
      const c = this.cam;
      c.fov = 42;
      c.near = 0.1;
      // Center camera to show full diving keeper body and ball
      c.position = [k.x + 0.6, 1.25, k.z - 4.8];
      c.target = [k.x + 0.3, 0.75, k.z];
      c.update();
    };
  })()`);
  await new Promise(r => setTimeout(r, 200));
  await snap('6_goalkeeper_dive');

  console.log(`\n=== All screenshots for prefix "${prefix}" successfully captured! ===\n`);

  ws.close();
  pageWs.close();
  chrome.kill();
}

captureAcceptanceSuite().catch(err => {
  console.error('Fatal error during capture:', err);
  process.exit(1);
});
