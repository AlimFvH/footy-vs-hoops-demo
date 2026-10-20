const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function main() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9231',
    '--disable-gpu',
    '--window-size=1200,900',
    '--no-sandbox',
    'about:blank'
  ]);

  let ver;
  for (let i = 0; i < 25; i++) {
    try {
      await new Promise(r => setTimeout(r, 300));
      const res = await fetch('http://127.0.0.1:9231/json/version');
      ver = await res.json();
      if (ver && ver.webSocketDebuggerUrl) break;
    } catch (e) {}
  }

  if (!ver || !ver.webSocketDebuggerUrl) {
    chrome.kill();
    throw new Error('Could not connect to Chrome debugging port 9231');
  }

  const browserWs = new WebSocket(ver.webSocketDebuggerUrl);
  let bid = 1;
  const bCallbacks = new Map();
  browserWs.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && bCallbacks.has(msg.id)) {
      bCallbacks.get(msg.id)(msg);
      bCallbacks.delete(msg.id);
    }
  };
  await new Promise(r => browserWs.onopen = r);

  function sendBrowser(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = bid++;
      bCallbacks.set(msgId, (res) => {
        if (res.error) reject(new Error(res.error.message));
        else resolve(res.result);
      });
      browserWs.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  const { targetId } = await sendBrowser('Target.createTarget', { url: 'about:blank' });
  const pageWs = new WebSocket(`ws://127.0.0.1:9231/devtools/page/${targetId}`);
  await new Promise(r => pageWs.onopen = r);

  let pid = 1;
  const pCallbacks = new Map();
  pageWs.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pCallbacks.has(msg.id)) {
      pCallbacks.get(msg.id)(msg);
      pCallbacks.delete(msg.id);
    }
  };

  function sendPage(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = pid++;
      pCallbacks.set(msgId, (res) => {
        if (res.error) reject(new Error(res.error.message));
        else resolve(res.result);
      });
      pageWs.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await sendPage('Page.enable');
  await sendPage('DOM.enable');

  const fileUrl = 'file:///' + path.resolve('scripts/fvh_half_green_orange.html').replace(/\\/g, '/');
  console.log('Navigating to', fileUrl);
  await sendPage('Page.navigate', { url: fileUrl });

  await new Promise(r => setTimeout(r, 1500));

  const screenshot = await sendPage('Page.captureScreenshot', { format: 'png' });
  const outPath = path.join(artifactDir, 'fvh_half_green_orange.png');
  fs.writeFileSync(outPath, Buffer.from(screenshot.data, 'base64'));
  console.log('Saved screenshot to:', outPath);

  pageWs.close();
  browserWs.close();
  chrome.kill();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
