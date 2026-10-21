const fs = require('fs');
const { spawn } = require('child_process');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function main() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9293',
    '--disable-gpu',
    '--no-sandbox',
    'about:blank'
  ]);

  let ver;
  for (let i = 0; i < 25; i++) {
    try {
      await new Promise(r => setTimeout(r, 250));
      const res = await fetch('http://127.0.0.1:9293/json/version');
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
  const pageWs = new WebSocket(`ws://127.0.0.1:9293/devtools/page/${target.targetId}`);
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

  await send('Page.enable');
  await send('Runtime.enable');
  await new Promise(r => setTimeout(r, 1500));

  // 1. Inpaint FOOTY: remove 10 from chest and 10 from shorts
  const resFooty = await send('Runtime.evaluate', {
    expression: `(async () => {
      const img = new Image();
      img.src = 'assets/hero_footy_cartoon.png';
      await new Promise(r => img.onload = r);
      const cvs = document.createElement('canvas');
      cvs.width = img.width; cvs.height = img.height;
      const ctx = cvs.getContext('2d');
      ctx.drawImage(img, 0, 0);

      // Inpaint chest 10 (sample from left fabric x-40)
      const w = img.width, h = img.height;
      const imgData = ctx.getImageData(0, 0, w, h);
      const d = imgData.data;

      // Chest 10: x ~ 390 to 455, y ~ 450 to 535
      for (let y = Math.floor(h * 0.36); y <= Math.floor(h * 0.43); y++) {
        for (let x = Math.floor(w * 0.465); x <= Math.floor(w * 0.535); x++) {
          const idx = (y * w + x) * 4;
          // sample from x - 50 (clean fabric to the left)
          const srcX = x - Math.floor(w * 0.06);
          const srcIdx = (y * w + srcX) * 4;
          d[idx] = d[srcIdx];
          d[idx+1] = d[srcIdx+1];
          d[idx+2] = d[srcIdx+2];
        }
      }

      // Shorts 10: x ~ 480 to 530, y ~ 740 to 810
      for (let y = Math.floor(h * 0.585); y <= Math.floor(h * 0.645); y++) {
        for (let x = Math.floor(w * 0.565); x <= Math.floor(w * 0.63); x++) {
          const idx = (y * w + x) * 4;
          // sample from x - 45 (clean shorts fabric to the left)
          const srcX = x - Math.floor(w * 0.055);
          const srcIdx = (y * w + srcX) * 4;
          d[idx] = d[srcIdx];
          d[idx+1] = d[srcIdx+1];
          d[idx+2] = d[srcIdx+2];
        }
      }

      ctx.putImageData(imgData, 0, 0);
      return cvs.toDataURL('image/png');
    })()`,
    awaitPromise: true,
    returnByValue: true
  });

  const base64Footy = resFooty.result.value.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync('assets/hero_footy_cartoon.png', Buffer.from(base64Footy, 'base64'));
  fs.writeFileSync('assets/hero_footy_real.png', Buffer.from(base64Footy, 'base64'));
  fs.writeFileSync(artifactDir + '/clean_footy_no_number.png', Buffer.from(base64Footy, 'base64'));
  console.log('Saved clean FOOTY without number 10');

  // 2. Inpaint HOOPS: remove 23 from chest
  const resHoops = await send('Runtime.evaluate', {
    expression: `(async () => {
      const img = new Image();
      img.src = 'assets/hero_hoops_cartoon.png';
      await new Promise(r => img.onload = r);
      const cvs = document.createElement('canvas');
      cvs.width = img.width; cvs.height = img.height;
      const ctx = cvs.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const w = img.width, h = img.height;
      const imgData = ctx.getImageData(0, 0, w, h);
      const d = imgData.data;

      // Chest 23: x ~ 60% to 68%, y ~ 28.5% to 33.5%
      for (let y = Math.floor(h * 0.285); y <= Math.floor(h * 0.335); y++) {
        for (let x = Math.floor(w * 0.60); x <= Math.floor(w * 0.68); x++) {
          const idx = (y * w + x) * 4;
          // sample from x - 40 (clean jersey fabric to the left or below)
          const srcX = x - Math.floor(w * 0.06);
          const srcIdx = (y * w + srcX) * 4;
          // Only replace if it's the black/white number pixel
          const r = d[idx], g = d[idx+1], b = d[idx+2];
          // if it's dark or white number
          const isDark = (r < 60 && g < 60 && b < 60);
          const isWhite = (r > 180 && g > 180 && b > 180);
          if (isDark || isWhite) {
            d[idx] = d[srcIdx];
            d[idx+1] = d[srcIdx+1];
            d[idx+2] = d[srcIdx+2];
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      return cvs.toDataURL('image/png');
    })()`,
    awaitPromise: true,
    returnByValue: true
  });

  const base64Hoops = resHoops.result.value.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync('assets/hero_hoops_cartoon.png', Buffer.from(base64Hoops, 'base64'));
  fs.writeFileSync('assets/hero_hoops_real.png', Buffer.from(base64Hoops, 'base64'));
  fs.writeFileSync(artifactDir + '/clean_hoops_no_number.png', Buffer.from(base64Hoops, 'base64'));
  console.log('Saved clean HOOPS without number 23');

  chrome.kill();
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
