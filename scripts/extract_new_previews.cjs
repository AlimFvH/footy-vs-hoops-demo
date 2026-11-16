const fs = require('fs');
const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

async function extractPreviews() {
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
      crop: { x: 5, y: 15, w: 260, h: 920 }
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
      crop: { x: 10, y: 10, w: 260, h: 920 }
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

      // Color keying based on studio backdrop
      for (let y = 0; y < ch; y++) {
        let leftX = 0;
        while (leftX < cw / 2) {
          const idx = (y * cw + leftX) * 4;
          const r = d[idx], g = d[idx+1], b = d[idx+2];
          const isFloor = (y > ch * 0.94);
          if (isFloor) {
            if (Math.max(r, g, b) < 70) { leftX++; continue; } else break;
          }
          if (r < 38 && g < 42 && b < 65) { leftX++; }
          else break;
        }

        let rightX = cw - 1;
        while (rightX > cw / 2) {
          const idx = (y * cw + rightX) * 4;
          const r = d[idx], g = d[idx+1], b = d[idx+2];
          const isFloor = (y > ch * 0.94);
          if (isFloor) {
            if (Math.max(r, g, b) < 70) { rightX--; continue; } else break;
          }
          if (r < 38 && g < 42 && b < 65) { rightX--; }
          else break;
        }

        for (let x = 0; x < leftX; x++) {
          d[(y * cw + x) * 4 + 3] = 0;
        }
        for (let x = rightX + 1; x < cw; x++) {
          d[(y * cw + x) * 4 + 3] = 0;
        }

        if (leftX > 0 && leftX < cw) {
          d[(y * cw + leftX) * 4 + 3] = 160;
        }
        if (rightX >= 0 && rightX < cw - 1) {
          d[(y * cw + rightX) * 4 + 3] = 160;
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
  console.log('All 3 preview images extracted cleanly!');
}

extractPreviews().catch(console.error);
