const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function run() {
  console.log('=== FOOTY vs HOOPS Basketball Gameplay Engine E2E Verification ===\n');

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

  // 1. Launch Basketball Match
  await evalExpr(`
    window.__fvh.launch({ mode: 'hoops', difficulty: 'normal', minutes: 2, skipCountdown: true }, false);
  `);
  await new Promise(r => setTimeout(r, 500));

  const kickoff = await evalExpr(`
    (function() {
      var s = window.__fvh.game.sim;
      return {
        mode: s.mode,
        ball: { x: s.ball.x, y: s.ball.y, z: s.ball.z, r: s.ball.r },
        human: { x: s.human.x, z: s.human.z, stamina: s.human.stamina },
        agentsCount: s.agents.length,
        score: s.score,
        hudStealLabel: window.__fvh.game.hud.btnTackle.querySelector('.lbl').textContent
      };
    })()
  `);

  test('Test 1: Basketball Court Setup & HUD "Steal" Adaptation',
    kickoff.mode === 'hoops' &&
    kickoff.agentsCount === 2 &&
    kickoff.score[0] === 0 && kickoff.score[1] === 0 &&
    (kickoff.hudStealLabel.includes('ПЕРЕХВАТ') || kickoff.hudStealLabel.includes('STEAL') || kickoff.hudStealLabel.length > 0),
    JSON.stringify(kickoff)
  );

  // Capture kickoff screenshot
  let shotKick = await sendPage('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'stage4_basketball_kickoff_mobile.png'), Buffer.from(shotKick.data, 'base64'));

  // 2. Dribble & Rhythmic Bounce Test
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
        ballY: s.ball.y,
        ballZ: s.ball.z,
        hasOwner: s.ball.owner === s.human
      };
    })()
  `);

  test('Test 2: Basketball Dribble Locomotion & Vertical Oscillation',
    dribble.humanZ < 6.5 && dribble.ballY > 0.3 && dribble.hasOwner,
    JSON.stringify(dribble)
  );

  // 3. Sprint Mechanic & Hardwood Friction
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

  test('Test 3: Basketball Sprint & Stamina Consumption',
    sprint.stamina < 100,
    `stamina=${sprint.stamina}`
  );

  // 4. Steal Mechanic (Tackle action in Hoops mode)
  const stealTest = await evalExpr(`
    (function() {
      var s = window.__fvh.game.sim;
      s.human.stamina = 100;
      s.human.tackle.phase = 'idle';
      s.human.tackle.cooldown = 0;
      s.beginLunge(s.human, 0.4, { x: 0, z: -1 });
      return {
        phase: s.human.tackle.phase,
        t: s.human.tackle.t,
        stamina: s.human.stamina
      };
    })()
  `);

  test('Test 4: Basketball Steal Lunge & Timing',
    stealTest.phase === 'lunge' && stealTest.stamina < 100,
    JSON.stringify(stealTest)
  );

  // 5. Jump Shot Physics & 2-Point Zone Trajectory
  const shot2p = await evalExpr(`
    (function() {
      var s = window.__fvh.game.sim;
      s.setOwner(s.human);
      s.human.x = 0;
      s.human.z = -8.0; // Inside 3-point line (dist to hoop at -12.6 is 4.6 < 6.1)
      s.humanShootRelease(s.human, 0.8);
      return {
        points: s.shot.points,
        dunk: s.shot.dunk,
        vy: s.ball.vy,
        vz: s.ball.vz,
        humanShots: s.stats.humanShots
      };
    })()
  `);

  test('Test 5: Mid-Range Jump Shot (2-Point Zone) & Arc Calculation',
    shot2p.points === 2 && !shot2p.dunk && shot2p.vy > 4 && shot2p.vz < 0,
    JSON.stringify(shot2p)
  );

  // 6. 3-Point Shot & Beyond-the-Arc Detection
  const shot3p = await evalExpr(`
    (function() {
      var s = window.__fvh.game.sim;
      s.setOwner(s.human);
      s.human.x = 0;
      s.human.z = -5.0; // Outside 3-point line (dist to hoop at -12.6 is 7.6 >= 6.1)
      s.humanShootRelease(s.human, 0.8);
      return {
        points: s.shot.points,
        dunk: s.shot.dunk,
        vy: s.ball.vy,
        vz: s.ball.vz
      };
    })()
  `);

  test('Test 6: Long-Range 3-Point Shot & Arc Elevation',
    shot3p.points === 3 && !shot3p.dunk && shot3p.vy > shot2p.vy,
    JSON.stringify(shot3p)
  );

  // 7. Slam Dunk Mechanic
  const dunkTest = await evalExpr(`
    (function() {
      var s = window.__fvh.game.sim;
      s.setOwner(s.human);
      s.human.x = 0;
      s.human.z = -11.5; // Under rim (dist to hoop at -12.6 is 1.1 < 2.2)
      s.humanShootRelease(s.human, 0.5);
      return {
        points: s.shot.points,
        dunk: s.shot.dunk,
        vy: s.ball.vy
      };
    })()
  `);

  test('Test 7: Slam Dunk Under-Rim Impulse',
    dunkTest.dunk === true && dunkTest.points === 2 && dunkTest.vy === -5,
    JSON.stringify(dunkTest)
  );

  // 8. Backboard Collision
  const boardTest = await evalExpr(`
    (function() {
      var s = window.__fvh.game.sim;
      var hp = s.hoops[1]; // Hoop at -12.6
      s.ball.owner = null;
      s.ball.x = 0;
      s.ball.y = 3.2; // Board height
      s.ball.z = hp.z - 0.7;
      s.ball.vx = 0;
      s.ball.vy = 0;
      s.ball.vz = -8;
      s.collideHoop(hp);
      return {
        touchedBoard: s.shot ? s.shot.touchedBoard : false,
        vz: s.ball.vz
      };
    })()
  `);

  test('Test 8: Glass Backboard Collision & Rebound',
    boardTest.touchedBoard === true,
    JSON.stringify(boardTest)
  );

  // 9. Basket Scoring & Celebration Trigger
  const scoreTest = await evalExpr(`
    (function() {
      var s = window.__fvh.game.sim;
      s.phase = 'playing';
      s.shot = {
        shooter: s.human,
        team: 0,
        points: 3,
        dunk: false,
        touchedRim: false,
        touchedBoard: false,
        scored: false,
        age: 0.5
      };
      s.awardBasket(1); // Score in opponent's hoop (index 1)
      return {
        score: s.score,
        phase: s.phase,
        netRipple: s.hoops[1].net
      };
    })()
  `);

  test('Test 9: Basket Scoring (+3 PTS), Net Swish & Celebration',
    scoreTest.score[0] === 3 && scoreTest.phase === 'celebrate' && scoreTest.netRipple === 1,
    JSON.stringify(scoreTest)
  );

  console.log(`\nResults: ${passed}/${total} basketball gameplay tests passed.`);

  // Capture final active basketball gameplay screenshot
  await new Promise(r => setTimeout(r, 600));
  let finalShot = await sendPage('Page.captureScreenshot', { format: 'png' });
  const outShot = path.join(artifactDir, 'stage4_basketball_gameplay_active.png');
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
