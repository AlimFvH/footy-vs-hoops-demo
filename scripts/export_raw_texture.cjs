const fs = require('fs');
const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');

async function exportTexturePreview() {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 1024 });

  const b64Keeper = fs.readFileSync('assets/characters/keeper1_orig_texture.png').toString('base64');
  await page.setContent(`<body style="margin:0;background:#111;"><img src="data:image/png;base64,${b64Keeper}" style="width:1024px;height:1024px;" /></body>`);
  await page.screenshot({ path: 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/keeper_raw_texture_view.png' });

  await browser.close();
  console.log('Saved keeper texture view!');
}
exportTexturePreview().catch(console.error);
