const fs = require('fs');
const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

async function findFeatureY(name, b64) {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  const res = await page.evaluate(async (b64, name) => {
    const img = new Image();
    await new Promise(r => { img.onload = r; img.src = (b64.startsWith('/9j/') ? 'data:image/jpeg;base64,' : 'data:image/png;base64,') + b64; });
    const cvs = document.createElement('canvas');
    cvs.width = img.width; cvs.height = img.height;
    const ctx = cvs.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Save a crop of head with marked pixel coordinates
    return { W: img.width, H: img.height };
  }, b64, name);
  console.log(name, res);
  await browser.close();
}

async function run() {
  await findFeatureY('Footy', fs.readFileSync('assets/characters/footy10_preview.png').toString('base64'));
}
run();
