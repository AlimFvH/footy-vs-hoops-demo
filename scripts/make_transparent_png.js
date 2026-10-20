const fs = require('fs');
const { spawn } = require('child_process');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

async function extractTransparentPng(inputPath, outputPath, isDarkBg = true) {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9288',
    '--disable-gpu',
    '--no-sandbox',
    'about:blank'
  ]);

  let ver;
  for (let i = 0; i < 25; i++) {
    try {
      await new Promise(r => setTimeout(r, 200));
      const res = await fetch('http://127.0.0.1:9288/json/version');
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

  const target = await sendBrowser('Target.createTarget', { url: 'about:blank' });
  const pageWs = new WebSocket(`ws://127.0.0.1:9288/devtools/page/${target.targetId}`);
  let pid = 1;
  const pCallbacks = new Map();
  pageWs.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pCallbacks.has(msg.id)) { pCallbacks.get(msg.id)(msg); pCallbacks.delete(msg.id); }
  };
  await new Promise(r => pageWs.onopen = r);

  function sendPage(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = pid++;
      pCallbacks.set(msgId, (res) => { if (res.error) reject(new Error(res.error.message)); else resolve(res.result); });
      pageWs.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await sendPage('Page.enable');

  const base64Data = fs.readFileSync(inputPath).toString('base64');
  const mimeType = inputPath.endsWith('.png') ? 'image/png' : 'image/jpeg';
  const dataUri = `data:${mimeType};base64,${base64Data}`;

  const res = await sendPage('Runtime.evaluate', {
    expression: `(async () => {
      const img = new Image();
      img.src = "${dataUri}";
      await new Promise(r => img.onload = r);

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;

      // Sample background color from corners
      const corners = [
        [0, 0],
        [canvas.width - 1, 0],
        [0, canvas.height - 1],
        [canvas.width - 1, canvas.height - 1]
      ];
      let bgR = 0, bgG = 0, bgB = 0;
      for (const [cx, cy] of corners) {
        const idx = (cy * canvas.width + cx) * 4;
        bgR += d[idx];
        bgG += d[idx + 1];
        bgB += d[idx + 2];
      }
      bgR /= 4; bgG /= 4; bgB /= 4;

      const isDark = (bgR + bgG + bgB) / 3 < 50;

      // Alpha mask extraction
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i+1], b = d[i+2];
        const dist = Math.hypot(r - bgR, g - bgG, b - bgB);
        if (isDark) {
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          if (lum < 18) {
            d[i+3] = 0;
          } else if (lum < 38) {
            d[i+3] = Math.round(((lum - 18) / 20) * 255);
          }
        } else {
          if (dist < 22) {
            d[i+3] = 0;
          } else if (dist < 45) {
            d[i+3] = Math.round(((dist - 22) / 23) * 255);
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      return canvas.toDataURL('image/png');
    })()`,
    awaitPromise: true,
    returnByValue: true
  });

  if (res.exceptionDetails) {
    console.error('Canvas evaluation error:', res.exceptionDetails);
    throw new Error(res.exceptionDetails.text || 'Evaluation failed');
  }

  const outDataUri = (res.result && res.result.value) || res.value;
  if (!outDataUri || typeof outDataUri !== 'string') {
    console.error('Unexpected res:', res);
    throw new Error('No outDataUri string returned');
  }

  const outBase64 = outDataUri.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync(outputPath, Buffer.from(outBase64, 'base64'));

  pageWs.close();
  browserWs.close();
  chrome.kill();
  console.log(`Saved transparent cutout to ${outputPath}`);
}

module.exports = { extractTransparentPng };
