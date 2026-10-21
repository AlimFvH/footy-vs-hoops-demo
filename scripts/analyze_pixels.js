const fs = require('fs');
const { spawn } = require('child_process');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9296',
    '--disable-gpu',
    '--no-sandbox',
    'about:blank'
  ]);

  let ver;
  for (let i = 0; i < 25; i++) {
    try {
      await new Promise(r => setTimeout(r, 250));
      const res = await fetch('http://127.0.0.1:9296/json/version');
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

  const target = await sendBrowser('Target.createTarget', { url: 'http://localhost:8099/index.html' });
  const pageWs = new WebSocket(`ws://127.0.0.1:9296/devtools/page/${target.targetId}`);
  let pid = 1;
  const pCallbacks = new Map();
  pageWs.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pCallbacks.has(msg.id)) { pCallbacks.get(msg.id)(msg); pCallbacks.delete(msg.id); }
  };
  await new Promise(r => pageWs.onopen = r);

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = pid++;
      pCallbacks.set(msgId, (res) => { if (res.error) reject(new Error(res.error.message)); else resolve(res.result); });
      pageWs.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await send('Runtime.enable');
  await new Promise(r => setTimeout(r, 1000));

  const res = await send('Runtime.evaluate', {
    expression: `(async () => {
      function rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) h = s = 0;
        else {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
          }
          h *= 60;
        }
        return { h, s, l };
      }

      const img = new Image();
      img.src = 'assets/hero_footy_cartoon.png';
      await new Promise(r => img.onload = r);
      const cvs = document.createElement('canvas');
      cvs.width = img.width; cvs.height = img.height;
      const ctx = cvs.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, cvs.width, cvs.height).data;

      // Check shoulder point at y = 29% (approx y=366), x = 400
      const y1 = Math.floor(cvs.height * 0.29);
      const x1 = Math.floor(cvs.width * 0.5);
      const idx1 = (y1 * cvs.width + x1) * 4;
      const rgb1 = { r: data[idx1], g: data[idx1+1], b: data[idx1+2] };
      const hsl1 = rgbToHsl(rgb1.r, rgb1.g, rgb1.b);

      // Check shorts point at y = 62%
      const y2 = Math.floor(cvs.height * 0.62);
      const x2 = Math.floor(cvs.width * 0.58);
      const idx2 = (y2 * cvs.width + x2) * 4;
      const rgb2 = { r: data[idx2], g: data[idx2+1], b: data[idx2+2] };
      const hsl2 = rgbToHsl(rgb2.r, rgb2.g, rgb2.b);

      return { shoulder: { rgb: rgb1, hsl: hsl1, yPct: 0.29 }, shorts: { rgb: rgb2, hsl: hsl2, yPct: 0.62 } };
    })()`,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('Analysis:', JSON.stringify(res.result.value, null, 2));

  chrome.kill();
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
