const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function run() {
  console.log('=== FOOTY vs HOOPS Football Gameplay Engine E2E Verification ===\n');

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
  await sendPage('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 667,
    deviceScaleFactor: 1,
    mobile: true
  });
  await sendPage('Emulation.setTouchEmulationEnabled', {
    enabled: true,
    maxTouchPoints: 5
  });

  await sendPage('Page.navigate', { url: 'http://localhost:8099/index.html' });
  await new Promise(r => setTimeout(r, 2000));

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

  let passed = 0;
  let total = 0;
  function test(name, ok, details = '') {
    total++;
    if (ok) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} ${details}`);
    }
  }

  // 1. Kickoff test
  await evalExpr(`
    window.__fvh.launch({ mode: 'footy', difficulty: 'normal', minutes: 2, skipCountdown: true }, false);
  `);
  await new Promise(r => setTimeout(r, 400));

  const kickoff = await evalExpr(`
    (function() {
      var s = window.__fvh.game.sim;
      return {
        mode: s.mode,
        ball: { x: s.ball.x, y: s.ball.y, z: s.ball.z, r: s.ball.r },
        human: { x: s.human.x, z: s.human.z, stamina: s.human.stamina },
        agentsCount: s.agents.length,
        score: s.score
      };
    })()
  `);

  test('Test 1: Football Kickoff & Pitch Setup',
    kickoff.mode === 'footy' &&
    Math.abs(kickoff.ball.x) < 0.1 &&
    Math.abs(kickoff.ball.z) < 0.1 &&
    kickoff.ball.y === kickoff.ball.r &&
    kickoff.agentsCount === 4 &&
    kickoff.score[0] === 0 && kickoff.score[1] === 0,
    JSON.stringify(kickoff)
  );

  // 2. Dribble & movement test: set phase to 'playing'
  await evalExpr(`
    window.__fvh.game.sim.phase = 'playing';
    window.__fvh.game.sim.countdownTimer = 0;
    window.__fvh.input.setStick(0, -1);
  `);
  await new Promise(r => setTimeout(r, 600));

  const dribble = await evalExpr(`
    (function() {
      var s = window.__fvh.game.sim;
      return {
        humanZ: s.human.z,
        ballZ: s.ball.z,
        hasOwner: s.ball.owner === s.human
      };
    })()
  `);

  test('Test 2: Dribble & Forward Locomotion',
    dribble.humanZ < 2.0 && dribble.ballZ < 2.5 && (dribble.hasOwner || Math.abs(dribble.ballZ - dribble.humanZ) < 1.8),
    `humanZ=${dribble.humanZ}, ballZ=${dribble.ballZ}`
  );

  // 3. Sprint Mechanic & Stamina
  await evalExpr(`
    window.__fvh.input.setTouchButton('sprint', true);
  `);
  await new Promise(r => setTimeout(r, 500));
  await evalExpr(`
    window.__fvh.input.setTouchButton('sprint', false);
    window.__fvh.input.setStick(0, 0);
  `);

  const sprint = await evalExpr(`
    (function() {
      var s = window.__fvh.game.sim;
      return {
        stamina: s.human.stamina
      };
    })()
  `);

  test('Test 3: Sprint Mechanic & Stamina Consumption',
    sprint.stamina < 100,
    `stamina=${sprint.stamina}`
  );

  // 4. Shooting Physics
  const shotInit = await evalExpr(`
    (function() {
      var s = window.__fvh.game.sim;
      s.setOwner(s.human);
      s.human.fx = 0;
      s.human.fz = -1;
      s.humanShootRelease(s.human, 0.8);
      return {
        vx: s.ball.vx,
        vy: s.ball.vy,
        vz: s.ball.vz,
        humanShots: s.stats.humanShots
      };
    })()
  `);

  test('Test 4: Charged Shot Physics & Velocity Vector',
    shotInit.vz < -15 && shotInit.vy > 1.0 && shotInit.humanShots >= 1,
    JSON.stringify(shotInit)
  );

  // 5. Goal Line Detection & Score Increment
  const goalTest = await evalExpr(`
    (function() {
      var s = window.__fvh.game.sim;
      s.phase = 'playing';
      s.goalLocked = false;
      s.ball.owner = null;
      s.ball.x = 0;
      s.ball.y = 1.0;
      s.ball.z = -29.0;
      s.ball.lastTouch = s.human;
      s.checkGoal();
      return {
        score: s.score,
        phase: s.phase,
        humanGoals: s.stats.humanGoals
      };
    })()
  `);

  test('Test 5: Goal Scoring Detection, Event & Celebration',
    goalTest.score[0] === 1 && goalTest.phase === 'celebrate' && goalTest.humanGoals >= 1,
    JSON.stringify(goalTest)
  );

  // 6. Wall Rebound Physics
  const wallTest = await evalExpr(`
    (function() {
      var s = window.__fvh.game.sim;
      s.ball.owner = null;
      s.ball.x = -16.5;
      s.ball.vx = -10;
      s.ball.vz = 5;
      s.wallHit('x');
      return {
        vx: s.ball.vx,
        vz: s.ball.vz
      };
    })()
  `);

  test('Test 6: Sideline Wall Rebound & Damping',
    wallTest.vx > 4 && wallTest.vz > 0,
    JSON.stringify(wallTest)
  );

  // 7. Tackle / Slide Lunge Mechanics
  const tackleTest = await evalExpr(`
    (function() {
      var s = window.__fvh.game.sim;
      s.human.stamina = 100;
      s.human.tackle.phase = 'idle';
      s.human.tackle.cooldown = 0;
      s.beginLunge(s.human, 0.5, { x: 0, z: -1 });
      return {
        phase: s.human.tackle.phase,
        t: s.human.tackle.t,
        stamina: s.human.stamina
      };
    })()
  `);

  test('Test 7: Tackle Slide Lunge & Stamina Cost',
    tackleTest.phase === 'lunge' && tackleTest.stamina < 100,
    JSON.stringify(tackleTest)
  );

  // 8. Goalkeeper Reach & Deflection
  const keeperTest = await evalExpr(`
    (function() {
      var s = window.__fvh.game.sim;
      var gk = s.agents.find(function(a) { return a.role === 'keeper' && a.team === 1; });
      s.ball.owner = null;
      s.ball.x = gk.x;
      s.ball.z = gk.z + 0.5;
      s.ball.y = 0.5;
      s.ball.vx = 0;
      s.ball.vz = -10;
      gk.pickupLock = 0;
      s.deflectOffAgents();
      return {
        vz: s.ball.vz
      };
    })()
  `);

  test('Test 8: Goalkeeper Dive Reach & Ball Deflection',
    keeperTest.vz > 0,
    JSON.stringify(keeperTest)
  );

  console.log(`\nResults: ${passed}/${total} football gameplay tests passed.`);

  // Capture final active gameplay screenshot
  await new Promise(r => setTimeout(r, 600));
  let finalShot = await sendPage('Page.captureScreenshot', { format: 'png' });
  const outShot = path.join(artifactDir, 'stage3_football_gameplay_active.png');
  fs.writeFileSync(outShot, Buffer.from(finalShot.data, 'base64'));
  console.log('Saved proof screenshot:', outShot);

  ws.close();
  pageWs.close();
  chrome.kill();

  if (passed !== total) {
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
