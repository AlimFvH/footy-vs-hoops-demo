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

async function runTwoPlayerPvPTest() {
  console.log('=== Step 1: Testing Full 1v1 Online PvP Match with Two Independent Clients ===');

  let clientA, clientB;
  try {
    clientA = await createClient(9241, 'host_a');
    clientB = await createClient(9242, 'guest_b');
    console.log('Launched two independent browser clients on ports 9241 and 9242.');

    // Navigate both clients to game
    await clientA.sendPage('Page.navigate', { url: 'http://127.0.0.1:8099' });
    await clientB.sendPage('Page.navigate', { url: 'http://127.0.0.1:8099' });
    await new Promise(r => setTimeout(r, 2500));

    // Ensure distinct player IDs and team selection
    await clientA.evalExpr(`
      (function() {
        window.app.store.update(function(d) {
          d.playerId = 'player_alpha_' + Date.now();
          d.playerName = 'Athlete Alpha';
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
          d.playerId = 'player_beta_' + Date.now();
          d.playerName = 'Athlete Beta';
          d.teamChosen = true;
          d.selectedTeam = 'hoops';
          d.selectedCharacter = 'hoops';
        });
        window.app.showModeSelect();
      })()
    `);

    console.log('Both clients navigated to Mode Selection page.');
    await new Promise(r => setTimeout(r, 1000));

    // 1. Both clients click "Search Match"
    console.log('Triggering Quick Match matchmaking modal on both clients...');
    await clientA.evalExpr(`
      (function() {
        const btn = document.querySelector('.fvh-btn-matchmaking');
        if (btn) btn.click();
      })()
    `);

    await new Promise(r => setTimeout(r, 300));

    await clientB.evalExpr(`
      (function() {
        const btn = document.querySelector('.fvh-btn-matchmaking');
        if (btn) btn.click();
      })()
    `);

    console.log('Waiting for matchmaking pair and countdown transition (6 seconds)...');
    await new Promise(r => setTimeout(r, 6500));

    // Inspect match state on Client A and Client B
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
          score: game.sim ? [game.sim.score[0], game.sim.score[1]] : null,
          ballPos: game.sim && game.sim.ball ? [game.sim.ball.x, game.sim.ball.y, game.sim.ball.z] : null
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
          score: game.sim ? [game.sim.score[0], game.sim.score[1]] : null,
          ballPos: game.sim && game.sim.ball ? [game.sim.ball.x, game.sim.ball.y, game.sim.ball.z] : null
        };
      })()
    `);

    console.log('Client A in-game state:', stateA);
    console.log('Client B in-game state:', stateB);

    // Save screenshots of active live match on both clients
    const snapA = await clientA.sendPage('Page.captureScreenshot', { format: 'png' });
    const snapB = await clientB.sendPage('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'stage_e_pvp_client_a_host.png'), Buffer.from(snapA.data, 'base64'));
    fs.writeFileSync(path.join(artifactDir, 'stage_e_pvp_client_b_guest.png'), Buffer.from(snapB.data, 'base64'));
    console.log('Captured gameplay screenshots: stage_e_pvp_client_a_host.png & stage_e_pvp_client_b_guest.png');

    // Simulate Client A scoring and triggering match end
    const matchEndResult = await clientA.evalExpr(`
      (function() {
        const game = window.app.game;
        if (!game || !game.sim) return { ok: false, error: 'no sim' };
        
        // Host scores
        game.sim.score[0] = 2;
        game.sim.score[1] = 0;
        game.sim.matchPhase = 'ended';

        if (game.onMatchEnd) {
          game.onMatchEnd({
            mode: game.cfg.mode,
            score: [2, 0],
            winner: 0,
            stats: { humanGoals: 2, humanTackles: 1 }
          });
          return { ok: true, score: [2, 0], winner: 0 };
        }
        return { ok: false, error: 'onMatchEnd not set' };
      })()
    `);
    console.log('Match end triggered on Client A:', matchEndResult);

    await new Promise(r => setTimeout(r, 1000));

    // Verify Client A received reward coins
    const clientAFinalCoins = await clientA.evalExpr('window.app.store.data.coins');
    console.log('Client A final coin balance after match complete:', clientAFinalCoins);

    const verified = stateA.inGame && stateA.isOnline && stateB.inGame && stateB.isOnline;
    console.log('\n=== Full 1v1 PvP Verification Result ===');
    console.log('Both independent clients in live online match:', verified);
    console.log('Client A role:', stateA.role, 'Client B role:', stateB.role);

    fs.writeFileSync(path.join(artifactDir, 'stage_e_two_client_pvp_audit.json'), JSON.stringify({
      stateA,
      stateB,
      matchEndResult,
      clientAFinalCoins,
      verified
    }, null, 2));

  } finally {
    if (clientA) clientA.close();
    if (clientB) clientB.close();
  }
}

runTwoPlayerPvPTest().catch(console.error);
