const fs = require('fs');
const { spawn } = require('child_process');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function main() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9297',
    '--disable-gpu',
    '--no-sandbox',
    'about:blank'
  ]);

  let ver;
  for (let i = 0; i < 25; i++) {
    try {
      await new Promise(r => setTimeout(r, 250));
      const res = await fetch('http://127.0.0.1:9297/json/version');
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
  const pageWs = new WebSocket(`ws://127.0.0.1:9297/devtools/page/${target.targetId}`);
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
      function hexToRgb(hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        const num = parseInt(hex, 16);
        return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
      }

      function rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) {
          h = s = 0;
        } else {
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

      function hslToRgb(h, s, l) {
        let r, g, b;
        if (s === 0) {
          r = g = b = l;
        } else {
          const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
          };
          const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          const p = 2 * l - q;
          h /= 360;
          r = hue2rgb(p, q, h + 1/3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1/3);
        }
        return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
      }

      const img = new Image();
      img.src = 'assets/hero_footy_cartoon.png';
      await new Promise(r => img.onload = r);

      const cvs = document.createElement('canvas');
      cvs.width = img.width;
      cvs.height = img.height;
      const ctx = cvs.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
      const data = imgData.data;

      // Target skin: Crimson Comet (Red #dc2626)
      const targetHsl = rgbToHsl(220, 38, 38);

      for (let y = 0; y < cvs.height; y++) {
        const yPct = y / cvs.height;
        // The jersey + shorts are roughly between 32% and 58% height, socks 68-78%
        const isUniformY = (yPct >= 0.32 && yPct <= 0.58) || (yPct >= 0.68 && yPct <= 0.78);
        if (!isUniformY) continue;

        for (let x = 0; x < cvs.width; x++) {
          const idx = (y * cvs.width + x) * 4;
          const a = data[idx + 3];
          if (a < 50) continue;

          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          const hsl = rgbToHsl(r, g, b);

          // In footy: jersey & shorts are cyan/blue: hue between 170 and 240, and saturation > 0.25
          if (hsl.h >= 170 && hsl.h <= 240 && hsl.s >= 0.25) {
            // Recolor to target hue while preserving lighting/luminance (l) and saturation!
            const newRgb = hslToRgb(targetHsl.h, Math.min(1, hsl.s * 1.1), hsl.l);
            data[idx] = newRgb.r;
            data[idx + 1] = newRgb.g;
            data[idx + 2] = newRgb.b;
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      return cvs.toDataURL('image/png');
    })()`,
    awaitPromise: true,
    returnByValue: true
  });

  const base64Data = res.result.value.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync(artifactDir + '/test_recolor_crimson.png', Buffer.from(base64Data, 'base64'));
  console.log('Saved test_recolor_crimson.png');

  chrome.kill();
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
