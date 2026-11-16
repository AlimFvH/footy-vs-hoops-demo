const fs = require('fs');
const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  const b64 = fs.readFileSync('assets/characters/keeper1_preview.png').toString('base64');
  const vals = await page.evaluate(async (b64) => {
    const img = new Image();
    await new Promise(r => { img.onload = r; img.src = 'data:image/jpeg;base64,' + b64; });
    const cvs = document.createElement('canvas');
    cvs.width = img.width; cvs.height = img.height;
    const ctx = cvs.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, cvs.width, cvs.height).data;
    const out = [];
    for (let x = 0; x <= 890; x += 50) {
      const idx = (0 * cvs.width + x) * 4;
      out.push({ x, r: d[idx], g: d[idx+1], b: d[idx+2] });
    }
    return out;
  }, b64);
  console.log(vals);
  await browser.close();
})();
