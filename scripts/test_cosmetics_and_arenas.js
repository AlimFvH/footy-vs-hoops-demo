const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

const SCENIC_ARENAS = [
  { id: 'std_ocean_sunset', name: 'Coastal Sunset Court', mode: 'footy' },
  { id: 'std_forest_redwood', name: 'Redwood Forest Arena', mode: 'hoops' },
  { id: 'std_space_orbit', name: 'Orbital Space Colosseum', mode: 'footy' },
  { id: 'std_mars_dome', name: 'Mars Bio-Dome Arena', mode: 'hoops' },
  { id: 'std_moon_crater', name: 'Apollo Lunar Arena', mode: 'footy' },
  { id: 'std_underwater_dome', name: 'Abyssal Ocean Dome', mode: 'hoops' },
  { id: 'std_cyber_megacity', name: 'Neo Tokyo Megacity', mode: 'footy' },
  { id: 'std_volcano_caldera', name: 'Magma Caldera Arena', mode: 'hoops' },
  { id: 'std_floating_islands', name: 'Aetheria Sky Islands', mode: 'footy' },
  { id: 'std_crystal_cavern', name: 'Prismatic Crystal Cave', mode: 'hoops' }
];

async function main() {
  console.log('=== Stage E: 10 Custom Arenas & Cross-Sport Cosmetics In-Engine Audit ===');

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9234',
    '--user-data-dir=C:\\Users\\ASUS\\AppData\\Local\\Temp\\chrome_debug_stage_e_arenas4',
    '--disable-gpu',
    '--no-sandbox',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const verRes = await fetch('http://127.0.0.1:9234/json/version');
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
  const pageWs = new WebSocket(`ws://127.0.0.1:9234/devtools/page/${targetId}`);
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
    width: 800,
    height: 600,
    deviceScaleFactor: 1,
    mobile: false
  });

  await sendPage('Page.navigate', { url: 'http://127.0.0.1:8099' });
  await new Promise(r => setTimeout(r, 2500));

  async function evalExpr(expr) {
    const res = await sendPage('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.exception.description);
    }
    return res.result.value;
  }

  console.log('\n--- 1. Testing WebGL 2.0 In-Engine Rendering for all 10 Arenas ---');
  const results = [];

  for (let i = 0; i < SCENIC_ARENAS.length; i++) {
    const arena = SCENIC_ARENAS[i];
    const testCode = `
      (function() {
        const app = window.__fvh || window.app;
        if (!app) return { ok: false, error: 'app object not found' };

        const mode = '${arena.mode}';
        const arenaId = '${arena.id}';

        if (app.game && app.game.running) {
          app.game.stop();
        }

        // Equip the arena
        if (!app.store.data.equipped) app.store.data.equipped = {};
        if (mode === 'footy') {
          app.store.data.equipped['stadium.footy'] = arenaId;
        } else {
          app.store.data.equipped['stadium.hoops'] = arenaId;
        }

        app.launch({
          mode: mode,
          difficulty: 'normal',
          minutes: 1,
          skipCountdown: true,
          boostId: null
        }, false);

        const game = app.game;
        if (!game) return { ok: false, error: 'game instance not found' };
        const view = game.view;
        if (!view) return { ok: false, error: 'game.view instance not found' };

        const gl = view.renderer.gl;
        const glErr = gl.getError();

        return {
          ok: true,
          glError: glErr,
          mode: mode,
          arenaId: arenaId,
          hasArenaRoot: Boolean(view.arena && view.arena.root),
          charsCount: view.chars ? view.chars.length : 0,
          hasBall: Boolean(view.ball)
        };
      })()
    `;

    try {
      const res = await evalExpr(testCode);
      const pass = res && res.ok && res.glError === 0 && res.hasArenaRoot && res.charsCount > 0 && res.hasBall;
      console.log(`[${pass ? 'PASS' : 'FAIL'}] Arena ${i+1}/10: ${arena.id} (${arena.name}) [${arena.mode}] -> glError:${res.glError}, root:${res.hasArenaRoot}, chars:${res.charsCount}, ball:${res.hasBall}`);
      results.push({ arena, res, pass });

      if (i === 0 || i === 1) {
        // Wait 300ms for a frame to render
        await new Promise(r => setTimeout(r, 400));
        const snap = await sendPage('Page.captureScreenshot', { format: 'png' });
        const snapPath = path.join(artifactDir, `stage_e_arena_${arena.mode}_${arena.id}.png`);
        fs.writeFileSync(snapPath, Buffer.from(snap.data, 'base64'));
        console.log(`  -> Saved proof screenshot: stage_e_arena_${arena.mode}_${arena.id}.png`);
      }
    } catch(err) {
      console.error(`Error testing arena ${arena.id}:`, err.message);
      results.push({ arena, res: { ok: false, error: err.message }, pass: false });
    }
  }

  console.log('\n--- 2. Testing Cross-Sport Cosmetics: Skins, Balls & Persistence ---');
  const cosCode = `
    (function() {
      const app = window.__fvh || window.app;
      const store = app.store.data;
      const initialEq = JSON.parse(JSON.stringify(store.equipped));

      // 1. Check Football cosmetics
      app.launch({ mode: 'footy', difficulty: 'normal', minutes: 1, skipCountdown: true }, false);
      const footyView = app.game.view;
      const footyBallId = footyView.ballVisual ? footyView.ballVisual.id : 'missing';
      const footyBallMode = footyView.ballVisual ? footyView.ballVisual.mode : 'missing';
      const footySkinShorts = footyView.chars[0].skin ? footyView.chars[0].skin.shorts : 0;

      // 2. Check Basketball cosmetics
      app.launch({ mode: 'hoops', difficulty: 'normal', minutes: 1, skipCountdown: true }, false);
      const hoopsView = app.game.view;
      const hoopsBallId = hoopsView.ballVisual ? hoopsView.ballVisual.id : 'missing';
      const hoopsBallMode = hoopsView.ballVisual ? hoopsView.ballVisual.mode : 'missing';
      const hoopsSkinShorts = hoopsView.chars[0].skin ? hoopsView.chars[0].skin.shorts : 0;

      // 3. Post-match persistence
      const finalEq = app.store.data.equipped;
      const persistent = JSON.stringify(initialEq) === JSON.stringify(finalEq);

      return {
        ok: true,
        footyBallId,
        footyBallMode,
        hoopsBallId,
        hoopsBallMode,
        ballsAreDistinct: footyBallId !== hoopsBallId,
        ballsModesDistinct: footyBallMode === 'footy' && hoopsBallMode === 'hoops',
        persistent
      };
    })()
  `;

  let cosRes = null;
  try {
    cosRes = await evalExpr(cosCode);
    console.log('Cosmetic separation & persistence verification:', JSON.stringify(cosRes, null, 2));
  } catch(err) {
    console.error('Error verifying cosmetics:', err.message);
  }

  console.log('\n--- 3. Testing Unowned Item Equip Rejection (Server Security) ---');
  const equipRes = await fetch('http://127.0.0.1:8099/api/economy/equip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      playerId: 'fvh_default_guest',
      slot: 'skin.footy',
      itemId: 'skin_cyber_dunker_nonexistent'
    })
  });
  const equipJson = await equipRes.json();
  console.log(`Unowned item equip response (Status ${equipRes.status}):`, equipJson);

  pageWs.close();
  ws.close();
  chrome.kill();

  const allArenasPass = results.every(r => r.pass);
  console.log('\n=== Stage E Arena and Cosmetic Audit Summary ===');
  console.log('All 10 Arenas Pass in WebGL2:', allArenasPass);
  console.log('Cross-Sport Cosmetics Separation Verified:', cosRes && cosRes.ballsAreDistinct && cosRes.ballsModesDistinct && cosRes.persistent);
  console.log('Server Unowned Equip Blocked:', equipRes.status === 403);

  fs.writeFileSync(path.join(artifactDir, 'stage_e_cosmetics_audit.json'), JSON.stringify({
    arenas: results,
    cosmetics: cosRes,
    unownedBlock: { status: equipRes.status, body: equipJson }
  }, null, 2));
}

main().catch(console.error);
