const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function createClient(port, dirSuffix) {
  const chrome = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=C:\\Users\\ASUS\\AppData\\Local\\Temp\\chrome_debug_pvp_${dirSuffix}`,
    '--disable-gpu',
    '--no-sandbox',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const verRes = await fetch(`http://127.0.0.1:${port}/json/version`);
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
  const pageWs = new WebSocket(`ws://127.0.0.1:${port}/devtools/page/${targetId}`);
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

  return {
    chrome,
    ws,
    pageWs,
    sendPage,
    evalExpr: async (expr) => {
      const res = await sendPage('Runtime.evaluate', {
        expression: expr,
        returnByValue: true,
        awaitPromise: true
      });
      if (res.exceptionDetails) {
        throw new Error(res.exceptionDetails.exception.description);
      }
      return res.result.value;
    },
    close: () => {
      try { pageWs.close(); } catch(e) {}
      try { ws.close(); } catch(e) {}
      try { chrome.kill(); } catch(e) {}
    }
  };
}

async function runSameSportPvPTest() {
  console.log('=== Testing Same-Sport (Footy vs Footy) Online PvP with Two Independent Clients ===');

  let clientA, clientB;
  try {
    clientA = await createClient(9243, 'host_footy');
    clientB = await createClient(9244, 'guest_footy');

    await clientA.sendPage('Page.navigate', { url: 'http://127.0.0.1:8099' });
    await clientB.sendPage('Page.navigate', { url: 'http://127.0.0.1:8099' });
    await new Promise(r => setTimeout(r, 2500));

    // Both choose footy
    await clientA.evalExpr(`
      (function() {
        window.app.store.update(function(d) {
          d.playerId = 'player_f1_' + Date.now();
          d.playerName = 'Striker One';
          d.teamChosen = true;
          d.selectedTeam = 'footy';
          d.selectedCharacter = 'footy';
        });
        window.app.showModeSelect();
      })()
    `);

    await clientB.evalExpr(`
      (function() {
        window.app.store.update(function(d) {
          d.playerId = 'player_f2_' + Date.now();
          d.playerName = 'Striker Two';
          d.teamChosen = true;
          d.selectedTeam = 'footy';
          d.selectedCharacter = 'footy';
        });
        window.app.showModeSelect();
      })()
    `);

    await new Promise(r => setTimeout(r, 1000));

    // Click Matchmaking
    await clientA.evalExpr(`document.querySelector('.fvh-btn-matchmaking').click();`);
    await new Promise(r => setTimeout(r, 300));
    await clientB.evalExpr(`document.querySelector('.fvh-btn-matchmaking').click();`);

    console.log('Both Footy players searching, waiting 6.5s for match launch...');
    await new Promise(r => setTimeout(r, 6500));

    const stateA = await clientA.evalExpr(`
      (function() {
        const game = window.app.game;
        if (!game) return { inGame: false };
        return {
          inGame: true,
          running: game.running,
          mode: game.cfg ? game.cfg.mode : null,
          isOnline: Boolean(game.cfg && game.cfg.online),
          role: game.cfg && game.cfg.online ? game.cfg.online.role : null,
          ballPos: game.sim && game.sim.ball ? [Math.round(game.sim.ball.x*100)/100, Math.round(game.sim.ball.y*100)/100, Math.round(game.sim.ball.z*100)/100] : null,
          score: game.sim ? [game.sim.score[0], game.sim.score[1]] : null,
          simTime: game.sim ? Math.round(game.sim.time*10)/10 : 0
        };
      })()
    `);

    const stateB = await clientB.evalExpr(`
      (function() {
        const game = window.app.game;
        if (!game) return { inGame: false };
        return {
          inGame: true,
          running: game.running,
          mode: game.cfg ? game.cfg.mode : null,
          isOnline: Boolean(game.cfg && game.cfg.online),
          role: game.cfg && game.cfg.online ? game.cfg.online.role : null,
          ballPos: game.sim && game.sim.ball ? [Math.round(game.sim.ball.x*100)/100, Math.round(game.sim.ball.y*100)/100, Math.round(game.sim.ball.z*100)/100] : null,
          score: game.sim ? [game.sim.score[0], game.sim.score[1]] : null,
          simTime: game.sim ? Math.round(game.sim.time*10)/10 : 0
        };
      })()
    `);

    console.log('Same-sport Client A (Host) state:', stateA);
    console.log('Same-sport Client B (Guest) state:', stateB);

    const sameMode = stateA.mode === stateB.mode && stateA.mode === 'footy';
    console.log('Both clients running identical Footy mode:', sameMode);
    console.log('Both clients in active online session:', stateA.isOnline && stateB.isOnline);

    fs.writeFileSync(path.join(artifactDir, 'stage_e_same_sport_pvp_audit.json'), JSON.stringify({
      stateA,
      stateB,
      sameMode
    }, null, 2));

  } finally {
    if (clientA) clientA.close();
    if (clientB) clientB.close();
  }
}

runSameSportPvPTest().catch(console.error);
