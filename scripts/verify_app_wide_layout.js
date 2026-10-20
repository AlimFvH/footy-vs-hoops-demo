const { spawn } = require('child_process');
const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  console.log('Starting app-wide viewport audit across multiple screen sizes...');
  const chrome = spawn(chromePath, ['--headless=new', '--remote-debugging-port=9222', '--disable-gpu', '--no-sandbox', 'about:blank']);
  await new Promise(r => setTimeout(r, 1500));
  const verRes = await fetch('http://127.0.0.1:9222/json/version');
  const ver = await verRes.json();
  const ws = new WebSocket(ver.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 1;
  const callbacks = new Map();
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && callbacks.has(msg.id)) { callbacks.get(msg.id)(msg); callbacks.delete(msg.id); }
  };
  function send(method, params = {}) {
    return new Promise((res, rej) => {
      const mid = id++;
      callbacks.set(mid, (r) => r.error ? rej(new Error(r.error.message)) : res(r.result));
      ws.send(JSON.stringify({ id: mid, method, params }));
    });
  }

  const viewports = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 14/15/16 Pro', width: 393, height: 852 },
    { name: 'iPhone 14/15/16 Pro Max', width: 430, height: 932 }
  ];

  const pages = ['menu', 'characters', 'shop', 'quests', 'battlepass', 'mode', 'arenas'];

  let allOk = true;

  for (const vp of viewports) {
    console.log(`\nTesting ${vp.name} (${vp.width}x${vp.height})...`);
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const pageWs = new WebSocket(`ws://127.0.0.1:9222/devtools/page/${targetId}`);
    await new Promise(r => pageWs.onopen = r);
    let pid = 1;
    const pcb = new Map();
    pageWs.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id && pcb.has(msg.id)) { pcb.get(msg.id)(msg); pcb.delete(msg.id); }
    };
    function sendPage(method, params = {}) {
      return new Promise((res, rej) => {
        const mid = pid++;
        pcb.set(mid, (r) => r.error ? rej(new Error(r.error.message)) : res(r.result));
        pageWs.send(JSON.stringify({ id: mid, method, params }));
      });
    }
    await sendPage('Page.enable');
    await sendPage('Runtime.enable');
    await sendPage('Emulation.setDeviceMetricsOverride', { width: vp.width, height: vp.height, deviceScaleFactor: 2, mobile: true });
    await sendPage('Page.navigate', { url: 'http://localhost:8099' });
    await new Promise(r => setTimeout(r, 1500));

    for (const p of pages) {
      const res = await sendPage('Runtime.evaluate', {
        expression: `(() => {
          if (window.App) {
            if ('${p}' === 'mode') window.App.showModeSelect();
            else if ('${p}' === 'arenas') window.App.showArenas();
            else if ('${p}' === 'characters') window.App.openCharacterLocker('footy');
            else window.App.go('${p}');
          }
          const docW = document.documentElement.scrollWidth;
          const winW = window.innerWidth;
          const bodyW = document.body.scrollWidth;
          const hasHScroll = docW > winW || bodyW > winW;
          return { page: '${p}', docW, winW, bodyW, hasHScroll };
        })()`,
        returnByValue: true
      });
      const data = res.result.value;
      if (data.hasHScroll) {
        console.error(`  [FAIL] ${vp.name} on page ${p}: docW=${data.docW}, winW=${data.winW}`);
        allOk = false;
      } else {
        console.log(`  [PASS] ${p}: No horizontal document overflow (docW=${data.docW}, winW=${data.winW})`);
      }
    }
    await send('Target.closeTarget', { targetId });
  }

  chrome.kill();
  if (!allOk) {
    console.error('\nLayout audit failed some checks!');
    process.exit(1);
  } else {
    console.log('\nApp-wide layout audit passed: 0 horizontal overflow across all viewports!');
    process.exit(0);
  }
}

run().catch(e => { console.error(e); process.exit(1); });
