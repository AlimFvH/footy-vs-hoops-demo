const fs = require('fs');
const { spawn } = require('child_process');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function main() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9291',
    '--disable-gpu',
    '--no-sandbox',
    'about:blank'
  ]);

  let ver;
  for (let i = 0; i < 25; i++) {
    try {
      await new Promise(r => setTimeout(r, 250));
      const res = await fetch('http://127.0.0.1:9291/json/version');
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
  const pageWs = new WebSocket(`ws://127.0.0.1:9291/devtools/page/${target.targetId}`);
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

  const res = await send('Runtime.evaluate', {
    expression: `(async () => {
      const HERO_SKIN_PALETTES = {
        skin_rookie: { h: 205, s: 0.90, lMult: 1.0, darkShorts: true },
        skin_crimson: { h: 358, s: 0.88, lMult: 1.0, darkShorts: true },
        skin_neon: { h: 155, s: 0.92, lMult: 1.1, darkShorts: true },
        skin_neon_elite: { h: 185, s: 0.95, lMult: 1.05, darkShorts: true },
        skin_frost: { h: 200, s: 0.55, lMult: 1.35, darkShorts: false },
        skin_shadow: { h: 275, s: 0.70, lMult: 0.82, darkShorts: true },
        skin_solar: { h: 22, s: 0.95, lMult: 1.05, darkShorts: true },
        skin_gold: { h: 46, s: 0.95, lMult: 1.18, darkShorts: false },
        skin_cyber: { h: 300, s: 0.90, lMult: 1.05, darkShorts: true },
        skin_sunset: { h: 28, s: 0.95, lMult: 1.1, darkShorts: false },
        skin_hydro: { h: 175, s: 0.88, lMult: 1.0, darkShorts: true },
        skin_mars: { h: 10, s: 0.90, lMult: 0.95, darkShorts: true },
        skin_astronaut: { h: 215, s: 0.15, lMult: 1.3, darkShorts: true }
      };

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

      const imgFooty = new Image();
      imgFooty.src = 'assets/hero_footy_cartoon.png';
      await new Promise(r => imgFooty.onload = r);

      const imgHoops = new Image();
      imgHoops.src = 'assets/hero_hoops_cartoon.png';
      await new Promise(r => imgHoops.onload = r);

      function recolorHero(img, charId, skinId) {
        const isFooty = (charId === 'footy');
        const pal = HERO_SKIN_PALETTES[skinId] || (isFooty ? HERO_SKIN_PALETTES.skin_rookie : HERO_SKIN_PALETTES.skin_solar);
        const cvs = document.createElement('canvas');
        cvs.width = img.width; cvs.height = img.height;
        const ctx = cvs.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
        const data = imgData.data;

        for (let y = 0; y < cvs.height; y++) {
          const yPct = y / cvs.height;
          if (isFooty) {
            const isTorsoOrShorts = (yPct >= 0.30 && yPct <= 0.66);
            const isSocks = (yPct >= 0.67 && yPct <= 0.88);
            if (!isTorsoOrShorts && !isSocks) continue;

            for (let x = 0; x < cvs.width; x++) {
              const idx = (y * cvs.width + x) * 4;
              if (data[idx + 3] < 40) continue;
              const r = data[idx], g = data[idx + 1], b = data[idx + 2];
              const hsl = rgbToHsl(r, g, b);
              if (hsl.h >= 160 && hsl.h <= 250 && hsl.s >= 0.18) {
                let targetH = pal.h;
                let targetS = Math.min(1, hsl.s * (pal.s || 1.0));
                let targetL = Math.min(0.95, hsl.l * (pal.lMult || 1.0));
                if (pal.darkShorts && yPct >= 0.54 && yPct <= 0.66) {
                  targetL *= 0.65;
                  targetS *= 0.8;
                }
                const newRgb = hslToRgb(targetH, targetS, targetL);
                data[idx] = newRgb.r; data[idx + 1] = newRgb.g; data[idx + 2] = newRgb.b;
              }
            }
          } else {
            // HOOPS
            const isJerseyOrShorts = (yPct >= 0.28 && yPct <= 0.62);
            if (!isJerseyOrShorts) continue;

            for (let x = 0; x < cvs.width; x++) {
              const idx = (y * cvs.width + x) * 4;
              if (data[idx + 3] < 40) continue;
              const xPct = x / cvs.width;
              if (xPct < 0.385 || xPct > 0.635) continue;

              const r = data[idx], g = data[idx + 1], b = data[idx + 2];
              const hsl = rgbToHsl(r, g, b);
              if ((hsl.h <= 32 || hsl.h >= 345) && hsl.s >= 0.40 && hsl.l <= 0.70) {
                let targetH = pal.h;
                let targetS = Math.min(1, hsl.s * (pal.s || 1.0));
                let targetL = Math.min(0.95, hsl.l * (pal.lMult || 1.0));
                const newRgb = hslToRgb(targetH, targetS, targetL);
                data[idx] = newRgb.r; data[idx + 1] = newRgb.g; data[idx + 2] = newRgb.b;
              }
            }
          }
        }
        ctx.putImageData(imgData, 0, 0);
        return cvs.toDataURL('image/png');
      }

      const t0 = performance.now();
      const testUrl1 = recolorHero(imgFooty, 'footy', 'skin_crimson');
      const testUrl2 = recolorHero(imgHoops, 'hoops', 'skin_gold');
      const duration = performance.now() - t0;

      return { durationMs: duration, testUrl1Length: testUrl1.length, testUrl2Length: testUrl2.length };
    })()`,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('Recolor Engine Benchmark:', JSON.stringify(res.result.value, null, 2));

  chrome.kill();
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
