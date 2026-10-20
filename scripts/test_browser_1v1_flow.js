const { spawn } = require('child_process');
const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

async function testTwoTabsInBrowser() {
  console.log('Testing 2 live tabs in browser for 1v1 Private Match...');

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9224',
    '--disable-gpu',
    '--no-sandbox',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1200));

  const verRes = await fetch('http://127.0.0.1:9224/json/version');
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

  // Tab 1: Host creates room
  const t1 = await send('Target.createTarget', { url: 'http://localhost:8099/index.html?page=mode&privateroom=1' });
  const ws1 = new WebSocket(`ws://127.0.0.1:9224/devtools/page/${t1.targetId}`);
  await new Promise(r => ws1.onopen = r);

  let id1 = 1;
  const cb1 = new Map();
  ws1.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.consoleAPICalled') {
      console.log('[Tab 1 console]:', (msg.params.args || []).map(a => a.value || '').join(' '));
    }
    if (msg.id && cb1.has(msg.id)) {
      cb1.get(msg.id)(msg);
      cb1.delete(msg.id);
    }
  };
  function send1(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id1++;
      cb1.set(msgId, (res) => {
        if (res.error) reject(new Error(res.error.message));
        else resolve(res.result);
      });
      ws1.send(JSON.stringify({ id: msgId, method, params }));
    });
  }
  await send1('Runtime.enable');
  await send1('Page.enable');

  // Wait for room code to generate
  await new Promise(r => setTimeout(r, 1500));
  const codeRes = await send1('Runtime.evaluate', {
    expression: `(function() {
      var el = document.querySelector('.fvh-room-code-display');
      return el ? el.textContent.trim() : null;
    })()`
  });

  const roomCode = codeRes.result.value;
  console.log('Tab 1 created room with code:', roomCode);

  if (!roomCode || !roomCode.startsWith('FVH-')) {
    throw new Error('Failed to get room code from Tab 1');
  }

  // Tab 2: Guest joins room
  const t2 = await send('Target.createTarget', { url: `http://localhost:8099/index.html?page=mode&joinroom=1&room=${roomCode}` });
  const ws2 = new WebSocket(`ws://127.0.0.1:9224/devtools/page/${t2.targetId}`);
  await new Promise(r => ws2.onopen = r);

  let id2 = 1;
  const cb2 = new Map();
  ws2.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && cb2.has(msg.id)) {
      cb2.get(msg.id)(msg);
      cb2.delete(msg.id);
    }
  };
  function send2(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id2++;
      cb2.set(msgId, (res) => {
        if (res.error) reject(new Error(res.error.message));
        else resolve(res.result);
      });
      ws2.send(JSON.stringify({ id: msgId, method, params }));
    });
  }
  await send2('Runtime.enable');
  await send2('Page.enable');

  await new Promise(r => setTimeout(r, 1200));

  // In Tab 2, click Connect button
  const joinRes = await send2('Runtime.evaluate', {
    expression: `(function() {
      var btn = document.querySelector('.fvh-btn-confirm-join');
      if (btn) { btn.click(); return 'clicked'; }
      return 'btn_not_found';
    })()`
  });
  console.log('Tab 2 join click:', joinRes.result.value);

  // Wait 6 seconds for room status poll (1.2s) and WebRTC / Relay connection (3.5s)
  await new Promise(r => setTimeout(r, 6000));

  const state1 = await send1('Runtime.evaluate', {
    returnByValue: true,
    expression: `(function() {
      var app = window.__fvh;
      return {
        hasApp: !!app,
        appState: app ? app.state : null,
        hasGame: !!(app && app.game),
        gameRunning: !!(app && app.game && app.game.running),
        gameMode: app && app.game && app.game.cfg ? app.game.cfg.mode : null,
        isOnline: app && app.game && app.game.cfg ? !!app.game.cfg.online : false
      };
    })()`
  });

  const state2 = await send2('Runtime.evaluate', {
    returnByValue: true,
    expression: `(function() {
      var app = window.__fvh;
      return {
        hasApp: !!app,
        appState: app ? app.state : null,
        hasGame: !!(app && app.game),
        gameRunning: !!(app && app.game && app.game.running),
        gameMode: app && app.game && app.game.cfg ? app.game.cfg.mode : null,
        isOnline: app && app.game && app.game.cfg ? !!app.game.cfg.online : false
      };
    })()`
  });

  console.log('Tab 1 state:', JSON.stringify(state1.result.value));
  console.log('Tab 2 state:', JSON.stringify(state2.result.value));

  // Capture proof screenshot of Tab 1 in live online match
  const shot1 = await send1('Page.captureScreenshot', { format: 'png' });
  const outShot = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3\\live_1v1_match_tab1.png';
  require('fs').writeFileSync(outShot, Buffer.from(shot1.data, 'base64'));
  console.log('Saved screenshot of live 1v1 match:', outShot);

  ws1.close();
  ws2.close();
  ws.close();
  chrome.kill();

  if (state1.result.value.isOnline && state2.result.value.isOnline) {
    console.log('SUCCESS: Both tabs are in live online 1v1 match!');
  } else {
    console.log('Tab states:', state1.result.value, state2.result.value);
  }
}

testTwoTabsInBrowser().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
