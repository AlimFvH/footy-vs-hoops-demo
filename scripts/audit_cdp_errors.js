const { spawn } = require('child_process');
const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  console.log('=== FOOTY vs HOOPS Console & Network Audit ===\n');

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--disable-gpu',
    '--no-sandbox',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1200));

  const verRes = await fetch('http://127.0.0.1:9223/json/version');
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
  const pageWs = new WebSocket(`ws://127.0.0.1:9223/devtools/page/${targetId}`);
  await new Promise(r => pageWs.onopen = r);

  let pageId = 1;
  const pageCallbacks = new Map();
  const consoleMessages = [];

  pageWs.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Console.messageAdded') {
      consoleMessages.push(msg.params.message);
    }
    if (msg.method === 'Runtime.consoleAPICalled') {
      consoleMessages.push({
        type: msg.params.type,
        text: (msg.params.args || []).map(a => a.value || a.description || '').join(' ')
      });
    }
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
  await sendPage('Console.enable');
  await sendPage('Runtime.enable');

  const pages = ['menu', 'battlepass', 'shop', 'quests', 'arenas', 'settings', 'profile'];
  let errors = 0;

  for (const p of pages) {
    consoleMessages.length = 0;
    await sendPage('Page.navigate', { url: `http://localhost:8099/index.html?page=${p}` });
    await new Promise(r => setTimeout(r, 1200));

    const pageErrors = consoleMessages.filter(m => m.type === 'error' || m.level === 'error');
    if (pageErrors.length > 0) {
      console.log(`[WARN] Page ${p} had console errors:`, pageErrors);
      errors += pageErrors.length;
    } else {
      console.log(`[PASS] Page ${p}: 0 console errors`);
    }
  }

  console.log(`\nAudit complete: ${errors} console errors across ${pages.length} pages.`);

  ws.close();
  pageWs.close();
  chrome.kill();

  if (errors > 0) process.exit(1);
}

run().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
