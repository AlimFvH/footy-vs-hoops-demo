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
  const b64 = fs.readFileSync('C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/fresh_keeper_face.png').toString('base64');
  const crop = await page.evaluate(async (b64) => {
    const img = new Image();
    await new Promise(r => { img.onload = r; img.src = 'data:image/png;base64,' + b64; });
    const cvs = document.createElement('canvas');
    cvs.width = 400; cvs.height = 400;
    const ctx = cvs.getContext('2d');
    // Zoom in on center of face
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 450, 250, 300, 300, 0, 0, 400, 400);
    return cvs.toDataURL('image/png').slice(22);
  }, b64);
  fs.writeFileSync('C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/debug_keeper_nose_zoom.png', Buffer.from(crop, 'base64'));
  console.log('Saved debug_keeper_nose_zoom.png');
  await browser.close();
})();
