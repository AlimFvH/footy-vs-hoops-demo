const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');
const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

async function makePerfectCutouts() {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:8099/index.html');

  const cuts = [
    { name: 'footy10_front', sheet: 'assets/characters/footy_turnaround.jpg', wFrac: 0.28, out: 'assets/characters/footy10_front_clean.png' },
    { name: 'footy10_back', sheet: 'assets/characters/footy_turnaround.jpg', wFrac: 0.28, startFrac: 0.49, out: 'assets/characters/footy10_back_clean.png' },
    { name: 'hoops10_front', sheet: 'assets/characters/hoops_turnaround.jpg', wFrac: 0.29, out: 'assets/characters/hoops10_front_clean.png' },
    { name: 'hoops10_back', sheet: 'assets/characters/hoops_turnaround.jpg', wFrac: 0.28, startFrac: 0.49, out: 'assets/characters/hoops10_back_clean.png' },
    { name: 'keeper1_front', sheet: 'assets/characters/keeper_turnaround.jpg', wFrac: 0.29, out: 'assets/characters/keeper1_front_clean.png' }
  ];

  for (const c of cuts) {
    const b64 = await page.evaluate(async (c) => {
      function loadImg(src) {
        return new Promise(r => { const img = new Image(); img.onload = () => r(img); img.src = src; });
      }
      const img = await loadImg(c.sheet);
      const W_sheet = img.width, H = img.height;
      const startX = Math.round(W_sheet * (c.startFrac || 0));
      const W = Math.round(W_sheet * c.wFrac);

      const cvs = document.createElement('canvas');
      cvs.width = W; cvs.height = H;
      const ctx = cvs.getContext('2d');
      ctx.drawImage(img, startX, 0, W, H, 0, 0, W, H);
      const idata = ctx.getImageData(0, 0, W, H);
      const d = idata.data;

      const isBg = new Uint8Array(W * H);
      const q = [];

      function isDarkStadiumBg(r, g, b, y) {
        // Floor below feet
        if (y > H - 85 && (r < 55 && g < 60 && b < 90)) return true;
        // Deep blue stadium background
        if (r < 40 && g < 45 && b < 70) return true;
        // Blue bokeh lights
        if (b > r + 20 && r < 120 && g < 160) return true;
        return false;
      }

      function isCharacterCore(x, y) {
        const nx = x / W;
        const ny = y / H;
        // Head core
        if (nx > 0.32 && nx < 0.68 && ny > 0.06 && ny < 0.21) return true;
        // Torso core
        if (nx > 0.34 && nx < 0.66 && ny >= 0.23 && ny < 0.51) return true;
        // Shorts core
        if (nx > 0.30 && nx < 0.70 && ny >= 0.52 && ny < 0.60) return true;
        // Left Leg core
        if (nx > 0.20 && nx < 0.40 && ny >= 0.62 && ny < 0.92) return true;
        // Right Leg core
        if (nx > 0.60 && nx < 0.80 && ny >= 0.62 && ny < 0.92) return true;
        // Left Arm core
        if (nx > 0.10 && nx < 0.24 && ny >= 0.26 && ny < 0.50) return true;
        // Right Arm core
        if (nx > 0.76 && nx < 0.90 && ny >= 0.26 && ny < 0.50) return true;
        return false;
      }

      function enqueueIfBg(x, y) {
        if (x < 0 || x >= W || y < 0 || y >= H) return;
        const idx = y * W + x;
        if (isBg[idx]) return;
        if (isCharacterCore(x, y)) return;
        const p = idx * 4;
        if (isDarkStadiumBg(d[p], d[p+1], d[p+2], y)) {
          isBg[idx] = 1;
          q.push(idx);
        }
      }

      // 1. Borders
      for (let x = 0; x < W; x++) { enqueueIfBg(x, 0); enqueueIfBg(x, H - 1); }
      for (let y = 0; y < H; y++) { enqueueIfBg(0, y); enqueueIfBg(W - 1, y); }

      // 2. Leg Gap Seeds
      for (let y = Math.round(H * 0.62); y < Math.round(H * 0.88); y += 4) {
        for (let x = Math.round(W * 0.46); x <= Math.round(W * 0.54); x += 2) {
          enqueueIfBg(x, y);
        }
      }

      // 3. Armpit Seeds (Right & Left)
      for (let y = Math.round(H * 0.32); y < Math.round(H * 0.46); y += 4) {
        enqueueIfBg(Math.round(W * 0.27), y);
        enqueueIfBg(Math.round(W * 0.73), y);
      }

      // 4. Floor Seeds
      for (let y = H - 80; y < H; y += 2) {
        for (let x = 0; x < W; x += 4) {
          enqueueIfBg(x, y);
        }
      }

      // Run BFS
      let head = 0;
      while (head < q.length) {
        const curr = q[head++];
        const cx = curr % W;
        const cy = Math.floor(curr / W);

        const neighbors = [
          cx > 0 ? curr - 1 : -1,
          cx < W - 1 ? curr + 1 : -1,
          cy > 0 ? curr - W : -1,
          cy < H - 1 ? curr + W : -1
        ];

        for (const n of neighbors) {
          if (n !== -1 && !isBg[n]) {
            const nx = n % W;
            const ny = Math.floor(n / W);
            if (!isCharacterCore(nx, ny)) {
              const p = n * 4;
              if (isDarkStadiumBg(d[p], d[p+1], d[p+2], ny)) {
                isBg[n] = 1;
                q.push(n);
              }
            }
          }
        }
      }

      // Apply Alpha
      for (let i = 0; i < W * H; i++) {
        if (isBg[i]) {
          d[i * 4 + 3] = 0;
        }
      }

      ctx.putImageData(idata, 0, 0);
      return cvs.toDataURL('image/png');
    }, c);

    fs.writeFileSync(c.out, Buffer.from(b64.split(',')[1], 'base64'));
    console.log('✓ Flawless cutout saved: ' + c.out);
  }

  // Copy to previews and cutouts
  fs.copyFileSync('assets/characters/footy10_front_clean.png', 'assets/characters/footy10_preview.png');
  fs.copyFileSync('assets/characters/hoops10_front_clean.png', 'assets/characters/hoops23_preview.png');
  fs.copyFileSync('assets/characters/keeper1_front_clean.png', 'assets/characters/keeper1_preview.png');
  fs.copyFileSync('assets/characters/keeper1_front_clean.png', 'assets/characters/keeper1_cutout.png');
  console.log('✓ All character assets synchronized cleanly!');

  await browser.close();
}

makePerfectCutouts().catch(console.error);
