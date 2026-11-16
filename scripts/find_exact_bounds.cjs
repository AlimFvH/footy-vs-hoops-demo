const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();

  const configs = [
    { id: 'footy', file: 'assets/characters/footy_turnaround.jpg', colW: 240 },
    { id: 'keeper', file: 'assets/characters/keeper_turnaround.jpg', colW: 256 },
    { id: 'hoops', file: 'assets/characters/hoops_turnaround.jpg', colW: 256 }
  ];

  for (const c of configs) {
    const b64 = fs.readFileSync(c.file).toString('base64');
    const bounds = await page.evaluate(data => new Promise(res => {
      const img = new Image();
      img.onload = () => {
        const cvs = document.createElement('canvas');
        cvs.width = img.width; cvs.height = img.height;
        const ctx = cvs.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const d = ctx.getImageData(0, 0, img.width, img.height).data;

        function findCenter(xStart, xEnd, yStart, yEnd) {
          let sumX = 0, count = 0;
          let minY = yEnd, maxY = yStart, minX = xEnd, maxX = xStart;
          for (let y = yStart; y < yEnd; y++) {
            for (let x = xStart; x < xEnd; x++) {
              const idx = (y * img.width + x) * 4;
              const r = d[idx], g = d[idx+1], b = d[idx+2];
              if (r > 45 || g > 45 || b > 45) {
                sumX += x;
                count++;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
              }
            }
          }
          return { cx: count ? Math.round(sumX / count) : (xStart + xEnd) / 2, count, minX, maxX, minY, maxY };
        }

        // Front view (col 0)
        const headFront = findCenter(0, data.colW, 10, Math.floor(img.height * 0.22));
        const torsoFront = findCenter(0, data.colW, Math.floor(img.height * 0.22), Math.floor(img.height * 0.45));
        const shortsFront = findCenter(0, data.colW, Math.floor(img.height * 0.45), Math.floor(img.height * 0.60));

        // Back view (col 2)
        const xBackStart = Math.floor(img.width * 0.50);
        const xBackEnd = Math.floor(img.width * 0.75);
        const headBack = findCenter(xBackStart, xBackEnd, 10, Math.floor(img.height * 0.22));
        const torsoBack = findCenter(xBackStart, xBackEnd, Math.floor(img.height * 0.22), Math.floor(img.height * 0.45));
        const shortsBack = findCenter(xBackStart, xBackEnd, Math.floor(img.height * 0.45), Math.floor(img.height * 0.60));

        res({ headFront, torsoFront, shortsFront, headBack, torsoBack, shortsBack, w: img.width, h: img.height });
      };
      img.src = 'data:image/jpeg;base64,' + data.b64;
    }), { b64, colW: c.colW });

    console.log(c.id, bounds);
  }

  await browser.close();
})();
