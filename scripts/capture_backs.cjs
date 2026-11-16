const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');

async function checkBack() {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 900 });
  await page.goto('http://localhost:8099/character_studio.html');
  await new Promise(r => setTimeout(r, 1200));

  await page.click('#btn-spin'); // stop spin
  await page.click('#btn-back'); // view back
  await new Promise(r => setTimeout(r, 500));

  // Footy back
  await page.screenshot({ path: 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/debug_footy_back.png' });

  // Hoops back
  await page.click('#tab-hoops');
  await new Promise(r => setTimeout(r, 1000));
  await page.click('#btn-back');
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/debug_hoops_back.png' });

  // Keeper back
  await page.click('#tab-keeper');
  await new Promise(r => setTimeout(r, 1000));
  await page.click('#btn-back');
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/debug_keeper_back.png' });

  await browser.close();
  console.log('Back views captured!');
}

checkBack().catch(console.error);
