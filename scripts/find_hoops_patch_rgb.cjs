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
  const b64 = fs.readFileSync('assets/characters/hoops23_orig_texture.png').toString('base64');
  const stats = await page.evaluate(async (b64) => {
    const img = new Image();
    await new Promise(r => { img.onload = r; img.src = 'data:image/png;base64,' + b64; });
    const cvs = document.createElement('canvas');
    cvs.width = img.width; cvs.height = img.height;
    const ctx = cvs.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, cvs.width, cvs.height).data;

    // Scan top-right quadrant for non-black, non-gold, non-dark skin pixels
    const colors = [];
    for (let y = 0; y < 512; y += 16) {
      for (let x = 512; x < 1024; x += 16) {
        const idx = (y * cvs.width + x) * 4;
        const r = d[idx], g = d[idx+1], b = d[idx+2];
        if (r > 80 && g > 70 && b > 60 && Math.abs(r - g) < 25 && Math.abs(g - b) < 25) {
          colors.push({ x, y, r, g, b });
        }
      }
    }
    return colors.slice(0, 15);
  }, b64);
  console.log('Light patches in top-right:', stats);
  await browser.close();
})();
