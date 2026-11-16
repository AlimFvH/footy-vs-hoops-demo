const fs = require('fs');
const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();

  const list = [
    { id: 'footy10_preview', src: 'assets/characters/footy_turnaround.jpg', colX: 135, colW: 190 },
    { id: 'keeper1_preview', src: 'assets/characters/keeper_turnaround.jpg', colX: 125, colW: 200 },
    { id: 'hoops23_preview', src: 'assets/characters/hoops_turnaround.jpg', colX: 120, colW: 200 }
  ];

  for (const item of list) {
    const b64 = fs.readFileSync(item.src).toString('base64');
    const resultB64 = await page.evaluate(async (data) => {
      function loadImg(s) {
        return new Promise(r => {
          const img = new Image();
          img.onload = () => r(img);
          img.src = s;
        });
      }
      const img = await loadImg('data:image/jpeg;base64,' + data.b64);
      const W = img.width, H = img.height;

      // Crop column
      const halfW = Math.floor(data.colW / 2);
      const cropX = Math.max(0, data.colX - halfW);
      const w = data.colW;

      const c = document.createElement('canvas');
      c.width = w;
      c.height = H;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, cropX, 0, w, H, 0, 0, w, H);

      const imgData = ctx.getImageData(0, 0, w, H);
      const d = imgData.data;

      // Scan rows from left and right to find character silhouette boundary
      // Background pixels on the left and right edges are dark
      for (let y = 0; y < H; y++) {
        // Find left boundary of character on this row
        let leftEdge = -1;
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const r = d[idx], g = d[idx+1], b = d[idx+2];
          const lum = 0.299*r + 0.587*g + 0.114*b;
          const maxVal = Math.max(r, g, b);
          // Character has warm skin, white/bright clothing, or boots
          const isChar = (maxVal > 48 && (lum > 40 || r > b + 15));
          if (isChar) {
            leftEdge = x;
            break;
          }
        }

        // Find right boundary of character on this row
        let rightEdge = -1;
        for (let x = w - 1; x >= 0; x--) {
          const idx = (y * w + x) * 4;
          const r = d[idx], g = d[idx+1], b = d[idx+2];
          const lum = 0.299*r + 0.587*g + 0.114*b;
          const maxVal = Math.max(r, g, b);
          const isChar = (maxVal > 48 && (lum > 40 || r > b + 15));
          if (isChar) {
            rightEdge = x;
            break;
          }
        }

        // Clear everything outside leftEdge and rightEdge
        if (leftEdge === -1 || rightEdge === -1 || leftEdge >= rightEdge) {
          for (let x = 0; x < w; x++) {
            d[(y * w + x) * 4 + 3] = 0;
          }
        } else {
          for (let x = 0; x < leftEdge; x++) {
            d[(y * w + x) * 4 + 3] = 0;
          }
          for (let x = rightEdge + 1; x < w; x++) {
            d[(y * w + x) * 4 + 3] = 0;
          }
          // Smooth 2px feathering at edges
          for (let f = 0; f < 3; f++) {
            if (leftEdge + f < w) d[(y * w + (leftEdge + f)) * 4 + 3] = Math.round(d[(y * w + (leftEdge + f)) * 4 + 3] * ((f + 1) / 3));
            if (rightEdge - f >= 0) d[(y * w + (rightEdge - f)) * 4 + 3] = Math.round(d[(y * w + (rightEdge - f)) * 4 + 3] * ((f + 1) / 3));
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      return c.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
    }, item);

    const outPath = `assets/characters/${item.id}.png`;
    fs.writeFileSync(outPath, Buffer.from(resultB64, 'base64'));
    console.log(`Saved: ${outPath}`);
  }

  await browser.close();
}

main().catch(console.error);
