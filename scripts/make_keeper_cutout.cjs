const fs = require('fs');
const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  const b64 = fs.readFileSync('assets/characters/keeper1_preview.png').toString('base64');
  
  const cutoutB64 = await page.evaluate(async (b64) => {
    const img = new Image();
    await new Promise(r => { img.onload = r; img.src = 'data:image/jpeg;base64,' + b64; });
    const cvs = document.createElement('canvas');
    const W = img.width, H = img.height;
    cvs.width = W; cvs.height = H;
    const ctx = cvs.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, W, H);
    const d = imgData.data;

    // Use a large circular buffer or JS array for queue
    const isBg = new Uint8Array(W * H);
    const queue = [];

    function isBackground(x, y) {
      if (y >= 1060) return true; // pedestal
      const idx = (y * W + x) * 4;
      const r = d[idx], g = d[idx+1], b = d[idx+2];
      // Dark background gradient
      return (r < 18 && g < 45 && b < 35);
    }

    // Push all 4 borders
    for (let x = 0; x < W; x++) {
      if (isBackground(x, 0)) { isBg[x] = 1; queue.push(x); }
      if (isBackground(x, H - 1)) { isBg[(H - 1) * W + x] = 1; queue.push((H - 1) * W + x); }
    }
    for (let y = 0; y < H; y++) {
      if (isBackground(0, y)) { isBg[y * W] = 1; queue.push(y * W); }
      if (isBackground(W - 1, y)) { isBg[y * W + (W - 1)] = 1; queue.push(y * W + (W - 1)); }
    }

    let head = 0;
    while (head < queue.length) {
      const curr = queue[head++];
      const cx = curr % W;
      const cy = Math.floor(curr / W);

      const neighbors = [
        cx > 0 ? curr - 1 : -1,
        cx < W - 1 ? curr + 1 : -1,
        cy > 0 ? curr - W : -1,
        cy < H - 1 ? curr + W : -1
      ];

      for (let n of neighbors) {
        if (n >= 0 && isBg[n] === 0) {
          const nx = n % W;
          const ny = Math.floor(n / W);
          if (isBackground(nx, ny)) {
            isBg[n] = 1;
            queue.push(n);
          }
        }
      }
    }

    // Now set alpha
    for (let i = 0; i < W * H; i++) {
      if (isBg[i] === 1) {
        d[i * 4 + 3] = 0;
      } else {
        d[i * 4 + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return cvs.toDataURL('image/png').slice(22);
  }, b64);

  fs.writeFileSync('assets/characters/keeper1_cutout.png', Buffer.from(cutoutB64, 'base64'));
  console.log('✓ Successfully created keeper1_cutout.png');
  await browser.close();
})();
