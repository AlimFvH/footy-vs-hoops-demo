const fs = require('fs');
const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

async function extractFlawless() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();

  const configs = [
    {
      id: 'footy',
      file: 'assets/characters/footy_turnaround.jpg',
      target: 'assets/characters/footy10_preview.png',
      crop: { x: 8, y: 14, w: 255, h: 915 }
    },
    {
      id: 'keeper',
      file: 'assets/characters/keeper_turnaround.jpg',
      target: 'assets/characters/keeper1_preview.png',
      crop: { x: 10, y: 10, w: 265, h: 920 }
    },
    {
      id: 'hoops',
      file: 'assets/characters/hoops_turnaround.jpg',
      target: 'assets/characters/hoops23_preview.png',
      crop: { x: 12, y: 10, w: 255, h: 920 }
    }
  ];

  for (const cfg of configs) {
    const b64 = fs.readFileSync(cfg.file).toString('base64');
    const resB64 = await page.evaluate(async (data) => {
      const img = new Image();
      await new Promise(r => { img.onload = r; img.src = 'data:image/jpeg;base64,' + data.b64; });

      const cw = data.cfg.crop.w;
      const ch = data.cfg.crop.h;

      const cvs = document.createElement('canvas');
      cvs.width = cw;
      cvs.height = ch;
      const ctx = cvs.getContext('2d');
      ctx.drawImage(img, data.cfg.crop.x, data.cfg.crop.y, cw, ch, 0, 0, cw, ch);

      const imgData = ctx.getImageData(0, 0, cw, ch);
      const d = imgData.data;

      function isBackground(r, g, b, x, y) {
        // Floor below soles of boots
        if (y > ch * 0.942) return true;

        // Dark studio background (blue/navy tint, or very dark)
        const maxVal = Math.max(r, g, b);
        if (maxVal < 36) return true;

        // Stadium spotlight flare: blue-dominant with low red
        if (r < 75 && b > r + 18 && b > g) return true;
        if (r < 55 && b > 60) return true;
        if (maxVal < 60 && r < 45) return true;

        return false;
      }

      // 2D Alpha Mask
      const alphaMask = new Float32Array(cw * ch);

      // Flood fill from all 4 boundaries
      const queue = new Int32Array(cw * ch * 2);
      let qHead = 0, qTail = 0;
      const visited = new Uint8Array(cw * ch);

      // Seed borders
      for (let x = 0; x < cw; x++) {
        const topIdx = x;
        const botIdx = (ch - 1) * cw + x;
        visited[topIdx] = 1; queue[qTail++] = topIdx;
        visited[botIdx] = 1; queue[qTail++] = botIdx;
      }
      for (let y = 0; y < ch; y++) {
        const leftIdx = y * cw;
        const rightIdx = y * cw + (cw - 1);
        if (!visited[leftIdx]) { visited[leftIdx] = 1; queue[qTail++] = leftIdx; }
        if (!visited[rightIdx]) { visited[rightIdx] = 1; queue[qTail++] = rightIdx; }
      }

      while (qHead < qTail) {
        const idx = queue[qHead++];
        const x = idx % cw;
        const y = (idx / cw) | 0;
        const px = idx * 4;
        const r = d[px], g = d[px+1], b = d[px+2];

        if (isBackground(r, g, b, x, y)) {
          alphaMask[idx] = 0.0; // Definite background

          // 4-connected neighbors
          if (x > 0) {
            const n = idx - 1;
            if (!visited[n]) { visited[n] = 1; queue[qTail++] = n; }
          }
          if (x < cw - 1) {
            const n = idx + 1;
            if (!visited[n]) { visited[n] = 1; queue[qTail++] = n; }
          }
          if (y > 0) {
            const n = idx - cw;
            if (!visited[n]) { visited[n] = 1; queue[qTail++] = n; }
          }
          if (y < ch - 1) {
            const n = idx + cw;
            if (!visited[n]) { visited[n] = 1; queue[qTail++] = n; }
          }
        } else {
          // Hit character silhouette boundary
          alphaMask[idx] = 1.0;
        }
      }

      // Any unvisited interior pixel is character
      for (let i = 0; i < cw * ch; i++) {
        if (!visited[i]) {
          alphaMask[i] = 1.0;
        }
      }

      // Smooth 1.5px edge feathering
      for (let y = 1; y < ch - 1; y++) {
        for (let x = 1; x < cw - 1; x++) {
          const idx = y * cw + x;
          if (alphaMask[idx] === 1.0) {
            const bgNeighbors = (alphaMask[idx - 1] === 0 ? 1 : 0) +
                                (alphaMask[idx + 1] === 0 ? 1 : 0) +
                                (alphaMask[idx - cw] === 0 ? 1 : 0) +
                                (alphaMask[idx + cw] === 0 ? 1 : 0);
            if (bgNeighbors > 0) {
              d[idx * 4 + 3] = Math.round(255 * (1.0 - bgNeighbors * 0.18));
            } else {
              d[idx * 4 + 3] = 255;
            }
          } else {
            d[idx * 4 + 3] = 0;
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);

      const outCvs = document.createElement('canvas');
      outCvs.width = 512;
      outCvs.height = 1024;
      const oCtx = outCvs.getContext('2d');
      oCtx.imageSmoothingEnabled = true;
      oCtx.imageSmoothingQuality = 'high';

      const scale = 980 / ch;
      const dw = cw * scale;
      const dh = ch * scale;
      const dx = (512 - dw) / 2;
      const dy = (1024 - dh) / 2;

      oCtx.drawImage(cvs, dx, dy, dw, dh);
      return outCvs.toDataURL('image/png');
    }, { b64, cfg });

    const buf = Buffer.from(resB64.replace(/^data:image\/png;base64,/, ''), 'base64');
    fs.writeFileSync(cfg.target, buf);
    console.log('Saved ' + cfg.target + ' (' + buf.length + ' bytes)');
  }

  await browser.close();
  console.log('All 3 preview images extracted with flawless flood fill!');
}

extractFlawless().catch(console.error);
