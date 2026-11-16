const fs = require('fs');
const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

async function cropFaceTexture(name, texPath) {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  const b64 = fs.readFileSync(texPath).toString('base64');
  const crop = await page.evaluate(async (b64) => {
    const img = new Image();
    await new Promise(r => { img.onload = r; img.src = 'data:image/png;base64,' + b64; });
    const cvs = document.createElement('canvas');
    cvs.width = 800; cvs.height = 800;
    const ctx = cvs.getContext('2d');
    // Save whole texture scaled down
    ctx.drawImage(img, 0, 0, 800, 800);
    return cvs.toDataURL('image/png').slice(22);
  }, b64);

  fs.writeFileSync(`C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/debug_full_tex_${name}.png`, Buffer.from(crop, 'base64'));
  console.log(`Saved debug_full_tex_${name}.png`);
  await browser.close();
}

async function run() {
  await cropFaceTexture('keeper', 'assets/characters/keeper1_final_texture.png');
  await cropFaceTexture('hoops', 'assets/characters/hoops23_final_texture.png');
}

run();
