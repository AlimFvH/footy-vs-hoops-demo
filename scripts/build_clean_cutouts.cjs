const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');
const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

async function extractAllClean() {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:8099/index.html');

  const configs = [
    {
      sheet: 'assets/characters/footy_turnaround.jpg',
      col: 0, // front
      outFile: 'assets/characters/footy10_front_clean.png',
      cropX: [0.0, 0.28],
      innerGaps: { armR: [70, 95, 320, 480], armL: [170, 195, 320, 480], legs: [100, 155, 590, 880] }
    },
    {
      sheet: 'assets/characters/footy_turnaround.jpg',
      col: 2, // back
      outFile: 'assets/characters/footy10_back_clean.png',
      cropX: [0.49, 0.77],
      innerGaps: { armR: [70, 95, 320, 480], armL: [170, 195, 320, 480], legs: [100, 155, 590, 880] }
    },
    {
      sheet: 'assets/characters/hoops_turnaround.jpg',
      col: 0, // front
      outFile: 'assets/characters/hoops10_front_clean.png',
      cropX: [0.0, 0.28],
      innerGaps: { armR: [65, 95, 310, 490], armL: [175, 205, 310, 490], legs: [100, 155, 590, 880] }
    },
    {
      sheet: 'assets/characters/hoops_turnaround.jpg',
      col: 2, // back
      outFile: 'assets/characters/hoops10_back_clean.png',
      cropX: [0.49, 0.77],
      innerGaps: { armR: [65, 95, 310, 490], armL: [175, 205, 310, 490], legs: [100, 155, 590, 880] }
    },
    {
      sheet: 'assets/characters/keeper_turnaround.jpg',
      col: 0, // front
      outFile: 'assets/characters/keeper1_front_clean.png',
      cropX: [0.0, 0.28],
      innerGaps: { armR: [70, 100, 320, 480], armL: [175, 205, 320, 480], legs: [100, 155, 590, 880] }
    }
  ];

  for (const cfg of configs) {
    console.log(`Processing ${cfg.outFile}...`);
    const b64 = await page.evaluate(async (cfg) => {
      function loadImg(src) {
        return new Promise(r => { const img = new Image(); img.onload = () => r(img); img.src = src; });
      }
      const img = await loadImg(cfg.sheet);
      const W_sheet = img.width, H = img.height;
      const startX = Math.round(W_sheet * cfg.cropX[0]);
      const endX = Math.round(W_sheet * cfg.cropX[1]);
      const W = endX - startX;

      const srcCvs = document.createElement('canvas');
      srcCvs.width = W; srcCvs.height = H;
      const sCtx = srcCvs.getContext('2d');
      sCtx.drawImage(img, startX, 0, W, H, 0, 0, W, H);
      const idata = sCtx.getImageData(0, 0, W, H);
      const d = idata.data;

      function isDarkBg(r, g, b) {
        // Deep blue background
        if (r < 35 && g < 40 && b < 65) return true;
        // Blue bokeh lights
        if (b > r + 30 && r < 100 && g < 140) return true;
        if (r < 25 && g < 25 && b < 40) return true;
        return false;
      }

      const outData = sCtx.createImageData(W, H);
      const out = outData.data;

      for (let y = 0; y < H; y++) {
        if (y < 45 || y > 945) continue;

        let minX = 0, maxX = W - 1;
        if (y < 230) { minX = 40; maxX = W - 40; }
        else if (y < 530) { minX = 12; maxX = W - 12; }
        else if (y < 610) { minX = 30; maxX = W - 30; }
        else { minX = 25; maxX = W - 25; }

        for (let x = minX; x <= maxX; x++) {
          let idx = (y * W + x) * 4;
          let r = d[idx], g = d[idx+1], b = d[idx+2];

          // Outer hair edge check
          if (y < 230 && (x < 55 || x > W - 55)) {
            if (isDarkBg(r, g, b)) continue;
          }
          // Outer arms edge check
          if (y >= 230 && y < 530 && (x < 25 || x > W - 25)) {
            if (isDarkBg(r, g, b)) continue;
          }
          // Gap between right arm and torso
          const gapR = cfg.innerGaps.armR;
          if (y > gapR[2] && y < gapR[3] && x > gapR[0] && x < gapR[1]) {
            if (isDarkBg(r, g, b)) continue;
          }
          // Gap between left arm and torso
          const gapL = cfg.innerGaps.armL;
          if (y > gapL[2] && y < gapL[3] && x > gapL[0] && x < gapL[1]) {
            if (isDarkBg(r, g, b)) continue;
          }
          // Gap between legs
          const gapLegs = cfg.innerGaps.legs;
          if (y > gapLegs[2] && y < gapLegs[3] && x > gapLegs[0] && x < gapLegs[1]) {
            if (isDarkBg(r, g, b)) continue;
          }

          out[idx] = r;
          out[idx+1] = g;
          out[idx+2] = b;
          out[idx+3] = 255;
        }
      }

      sCtx.putImageData(outData, 0, 0);
      return srcCvs.toDataURL('image/png');
    }, cfg);

    fs.writeFileSync(cfg.outFile, Buffer.from(b64.split(',')[1], 'base64'));
    console.log(`✓ Saved ${cfg.outFile}`);
  }

  // Also overwrite preview and cutout files so everything uses these clean versions:
  fs.copyFileSync('assets/characters/footy10_front_clean.png', 'assets/characters/footy10_preview.png');
  fs.copyFileSync('assets/characters/hoops10_front_clean.png', 'assets/characters/hoops23_preview.png');
  fs.copyFileSync('assets/characters/keeper1_front_clean.png', 'assets/characters/keeper1_preview.png');
  fs.copyFileSync('assets/characters/keeper1_front_clean.png', 'assets/characters/keeper1_cutout.png');
  console.log('✓ Overwrote legacy previews and keeper1_cutout.png cleanly!');

  await browser.close();
}

extractAllClean().catch(console.error);
