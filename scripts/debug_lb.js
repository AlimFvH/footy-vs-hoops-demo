const fs = require('fs');
const { spawn } = require('child_process');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

async function debug() {
  const chrome = spawn(chromePath, ['--headless=new', '--remote-debugging-port=9258', '--disable-gpu', '--window-size=393,852', '--no-sandbox', 'about:blank']);
  let ver;
  for (let i = 0; i < 25; i++) {
    try {
      await new Promise(r => setTimeout(r, 300));
      const res = await fetch('http://127.0.0.1:9258/json/version');
      ver = await res.json();
      if (ver && ver.webSocketDebuggerUrl) break;
    } catch (e) {}
  }
  const browserWs = new WebSocket(ver.webSocketDebuggerUrl);
  let bid = 1;
  const bCallbacks = new Map();
  browserWs.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && bCallbacks.has(msg.id)) { bCallbacks.get(msg.id)(msg); bCallbacks.delete(msg.id); }
  };
  await new Promise(r => browserWs.onopen = r);
  function sendBrowser(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = bid++;
      bCallbacks.set(msgId, (res) => { if (res.error) reject(new Error(res.error.message)); else resolve(res.result); });
      browserWs.send(JSON.stringify({ id: msgId, method, params }));
    });
  }
  const { targetId } = await sendBrowser('Target.createTarget', { url: 'about:blank' });
  const pageWs = new WebSocket('ws://127.0.0.1:9258/devtools/page/' + targetId);
  await new Promise(r => pageWs.onopen = r);
  let pid = 1;
  const pCallbacks = new Map();
  pageWs.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.method === 'Runtime.consoleAPICalled') {
      console.log('BROWSER CONSOLE:', msg.params.type, msg.params.args.map(a => a.value));
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      console.error('BROWSER EXCEPTION:', msg.params.exceptionDetails);
    }
    if (msg.id && pCallbacks.has(msg.id)) { pCallbacks.get(msg.id)(msg); pCallbacks.delete(msg.id); }
  };
  function sendPage(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = pid++;
      pCallbacks.set(msgId, (res) => { if (res.error) reject(new Error(res.error.message)); else resolve(res.result); });
      pageWs.send(JSON.stringify({ id: msgId, method, params }));
    });
  }
  await sendPage('Page.enable');
  await sendPage('Runtime.enable');
  await sendPage('Page.navigate', { url: 'http://localhost:8099' });
  await new Promise(r => setTimeout(r, 2200));

  const res1 = await sendPage('Runtime.evaluate', {
    expression: `(function(){
      try {
        var app = window.App || window.__fvh;
        app.go('leaderboard', { category: 'coins' });
        return 'SUCCESS';
      } catch(e) {
        return e.stack;
      }
    })()`
  });
  console.log('res1:', res1);
  await new Promise(r => setTimeout(r, 1200));

  const res2 = await sendPage('Runtime.evaluate', {
    expression: 'document.querySelector(".fvh-leaderboard-container").innerHTML.slice(0, 300)'
  });
  console.log('container HTML:', res2);

  chrome.kill();
  process.exit(0);
}
debug();
