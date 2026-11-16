const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');
const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

async function testProtected() {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:8099/index.html');

  const cuts = [
    { name: 'footy10_front', sheet: 'assets/characters/footy_turnaround.jpg', col: 0, wFrac: 0.28, out: 'assets/characters/footy10_front_clean.png' },
    { name: 'footy10_back', sheet: 'assets/characters/footy_turnaround.jpg', col: 2, wFrac: 0.28, startFrac: 0.49, out: 'assets/characters/footy10_back_clean.png' },
    { name: 'hoops10_front', sheet: 'assets/characters/hoops_turnaround.jpg', col: 0, wFrac: 0.29, out: 'assets/characters/hoops10_front_clean.png' },
    { name: 'hoops10_back', sheet: 'assets/characters/hoops_turnaround.jpg', col: 2, wFrac: 0.28, startFrac: 0.49, out: 'assets/characters/hoops10_back_clean.png' },
    { name: 'keeper1_front', sheet: 'assets/characters/keeper_turnaround.jpg', col: 0, wFrac: 0.29, out: 'assets/characters/keeper1_front_clean.png' }
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

      function isProtected(x, y) {
        const nx = x / W;
        const ny = y / H;
        // Head
        if (nx > 0.25 && nx < 0.75 && ny > 0.05 && ny < 0.23) return true;
        // Neck & Torso
        if (nx > 0.28 && nx < 0.72 && ny >= 0.23 && ny < 0.52) return true;
        // Shorts
        if (nx > 0.25 && nx < 0.75 && ny >= 0.52 && ny < 0.63) return true;
        // Left Leg
        if (nx > 0.16 && nx < 0.46 && ny >= 0.63 && ny < 0.94) return true;
        // Right Leg
        if (nx > 0.54 && nx < 0.84 && ny >= 0.63 && ny < 0.94) return true;
        // Left Arm core
        if (nx > 0.06 && nx < 0.30 && ny >= 0.24 && ny < 0.54) return true;
        // Right Arm core
        if (nx > 0.70 && nx < 0.94 && ny >= 0.24 && ny < 0.54) return true;
        return false;
      }

      function isDarkStadiumBg(r, g, b, y) {
        if (y > H - 30) return true; // floor reflection
        // Stadium background is dark blue
        if (r < 35 && g < 40 && b < 65) return true;
        // Stadium bokeh lights
        if (b > r + 25 && r < 110 && g < 150) return true;
        return false;
      }

      for (let x = 0; x < W; x++) {
        let t = 0 * W + x;
        if (!isProtected(x, 0) && isDarkStadiumBg(d[t*4], d[t*4+1], d[t*4+2], 0)) { isBg[t] = 1; q.push(t); }
        let b = (H-1) * W + x;
        if (!isProtected(x, H-1) && isDarkStadiumBg(d[b*4], d[b*4+1], d[b*4+2], H-1)) { isBg[b] = 1; q.push(b); }
      }
      for (let y = 0; y < H; y++) {
        let l = y * W + 0;
        if (!isProtected(0, y) && isDarkStadiumBg(d[l*4], d[l*4+1], d[l*4+2], y)) { isBg[l] = 1; q.push(l); }
        let r = y * W + (W - 1);
        if (!isProtected(W-1, y) && isDarkStadiumBg(d[r*4], d[r*4+1], d[r*4+2], y)) { isBg[r] = 1; q.push(r); }
      }

      let head = 0;
      while (head < q.length) {
        const curr = q[head++];
        const cx = curr % W;
        const cy = Math.floor(curr / W);

        const nb = [
          cx > 0 ? curr - 1 : -1,
          cx < W - 1 ? curr + 1 : -1,
          cy > 0 ? curr - W : -1,
          cy < H - 1 ? curr + W : -1
        ];

        for (const n of nb) {
          if (n !== -1 && !isBg[n]) {
            const nx = n % W;
            const ny = Math.floor(n / W);
            if (!isProtected(nx, ny)) {
              const nidx = n * 4;
              if (isDarkStadiumBg(d[nidx], d[nidx+1], d[nidx+2], ny)) {
                isBg[n] = 1;
                q.push(n);
              }
            }
          }
        }
      }

      // Also clean leg gap:
      const midLegY1 = Math.round(H * 0.65);
      const midLegY2 = Math.round(H * 0.88);
      const midX1 = Math.round(W * 0.44);
      const midX2 = Math.round(W * 0.56);
      for (let y = midLegY1; y < midLegY2; y++) {
        for (let x = midX1; x <= midX2; x++) {
          let idx = (y * W + x) * 4;
          if (isDarkStadiumBg(d[idx], d[idx+1], d[idx+2], y)) {
            isBg[y * W + x] = 1;
          }
        }
      }

      // Apply alpha
      for (let i = 0; i < W * H; i++) {
        if (isBg[i]) {
          d[i * 4 + 3] = 0;
        }
      }

      ctx.putImageData(idata, 0, 0);
      return cvs.toDataURL('image/png');
    }, c);

    fs.writeFileSync(c.out, Buffer.from(b64.split(',')[1], 'base64'));
    console.log('Saved ' + c.out);
  }

  // Overwrite previews
  fs.copyFileSync('assets/characters/footy10_front_clean.png', 'assets/characters/footy10_preview.png');
  fs.copyFileSync('assets/characters/hoops10_front_clean.png', 'assets/characters/hoops23_preview.png');
  fs.copyFileSync('assets/characters/keeper1_front_clean.png', 'assets/characters/keeper1_preview.png');
  fs.copyFileSync('assets/characters/keeper1_front_clean.png', 'assets/characters/keeper1_cutout.png');
  console.log('Done creating and overwriting all cutouts!');

  await browser.close();
}

testProtected().catch(console.error);
