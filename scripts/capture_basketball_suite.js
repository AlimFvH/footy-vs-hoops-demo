const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

// Prefix can be 'stage_d_before_' or 'stage_d_after_'
const prefix = process.argv[2] || 'stage_d_before_';

async function captureBasketballSuite() {
  console.log(`=== Capturing Basketball Suite: Prefix "${prefix}" ===`);

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9226',
    '--user-data-dir=C:\\Users\\ASUS\\AppData\\Local\\Temp\\chrome_debug_hoops_' + prefix.replace(/[^a-z0-9]/gi, ''),
    '--disable-gpu',
    '--no-sandbox',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const verRes = await fetch('http://127.0.0.1:9226/json/version');
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
  const pageWs = new WebSocket(`ws://127.0.0.1:9226/devtools/page/${targetId}`);
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

  // 1. Launch Basketball Match
  await evalExpr(`
    window.__fvh.launch({ mode: 'hoops', difficulty: 'normal', minutes: 5, skipCountdown: true }, false);
  `);
  await new Promise(r => setTimeout(r, 600));

  // Dismiss banner and start active play
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

  async function setCam(posExpr, targetExpr, fov = 38) {
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

  // SCENARIO 1: Full Basketball Player Front Profile (Collegiate sleeveless jersey #23)
  console.log('Capturing 1. Basketball Player Front...');
  await evalExpr(`(() => {
    const sim = window.__fvh.game.sim;
    const h = sim.human;
    h.x = 0; h.z = 2.0;
    h.fx = 0; h.fz = -1;
    h.vx = 0; h.vz = 0;
    sim.ball.x = 0; sim.ball.z = -15; // out of camera frustum
  })()`);
  await setCam(['sim.human.x', '1.30', 'sim.human.z - 4.8'], ['sim.human.x', '1.12', 'sim.human.z'], 42);
  await snap('1_player_front');

  // SCENARIO 1b: Full Basketball Player Side Profile (High-top sneakers, compression sleeve)
  console.log('Capturing 1b. Basketball Player Side...');
  await setCam(['sim.human.x + 4.8', '1.30', 'sim.human.z'], ['sim.human.x', '1.12', 'sim.human.z'], 42);
  await snap('1_player_side');

  // SCENARIO 2: Hardwood Court Surface & Arena (Wood grain, paint, markings, reflections)
  console.log('Capturing 2. Hardwood Court Surface...');
  await setCam(['0', '7.2', '9.5'], ['0', '0', '0'], 48);
  await snap('2_hardwood_court');

  // SCENARIO 3: Hoop, Backboard, Rim & Net Detail (Glass, shooter square, orange rim, net mesh)
  console.log('Capturing 3. Hoop and Backboard...');
  await setCam(['0', '3.6', '-15.8'], ['0', '3.05', '-12.2'], 38);
  await snap('3_hoop_backboard_net');

  // SCENARIO 4: Dribble Locomotion (Ball bounce & crossover)
  console.log('Capturing 4. Dribble Locomotion...');
  await evalExpr(`(() => {
    const sim = window.__fvh.game.sim;
    const h = sim.human;
    h.x = 0; h.z = 1.0;
    h.fx = 0; h.fz = -1;
    h.vx = 0; h.vz = -5.0; // full running speed
    sim.ball.owner = h;
    sim.ball.x = 0.5;
    sim.ball.y = 0.45;
    sim.ball.z = h.z - 0.5;
  })()`);
  await setCam(['sim.human.x + 4.2', '1.25', 'sim.human.z - 0.8'], ['sim.human.x', '1.0', 'sim.human.z'], 38);
  await snap('4_dribble_run');

  // SCENARIO 5: Jump Shot at Apex with Wrist Follow-Through
  console.log('Capturing 5. Jump Shot Apex...');
  await evalExpr(`(() => {
    const sim = window.__fvh.game.sim;
    const h = sim.human;
    h.x = 0; h.z = -6.0;
    h.fx = 0; h.fz = -1;
    h.vx = 0; h.vz = 0;
    h.jumpT = 0.28; // mid-air apex
    h.shotT = 0.20;
    sim.ball.x = 0.15;
    sim.ball.y = 3.15;
    sim.ball.z = h.z - 0.4;
  })()`);
  await setCam(['sim.human.x + 3.8', '2.2', 'sim.human.z - 0.4'], ['sim.human.x', '2.0', 'sim.human.z'], 38);
  await snap('5_jumpshot_apex');

  // SCENARIO 6: Slam Dunk at the Rim
  console.log('Capturing 6. Slam Dunk...');
  await evalExpr(`(() => {
    const sim = window.__fvh.game.sim;
    const h = sim.human;
    h.x = 0; h.z = -11.5;
    h.fx = 0; h.fz = -1;
    h.jumpT = 0.25;
    h.shotT = 0.35;
    sim.ball.x = 0;
    sim.ball.y = 3.35;
    sim.ball.z = -12.1;
  })()`);
  await setCam(['2.6', '3.4', '-14.8'], ['0', '3.05', '-12.2'], 42);
  await snap('6_slam_dunk');

  console.log(`\n=== All basketball screenshots for prefix "${prefix}" successfully captured! ===\n`);

  ws.close();
  pageWs.close();
  chrome.kill();
}

captureBasketballSuite().catch(err => {
  console.error('Fatal error during capture:', err);
  process.exit(1);
});
