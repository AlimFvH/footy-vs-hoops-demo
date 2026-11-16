const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');

async function testRender() {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setViewport({ width: 1200, height: 900 });
  await page.goto('http://localhost:8099/character_studio.html');
  await new Promise(r => setTimeout(r, 1200));

  // Turn off auto-spin and set front view
  await page.click('#btn-spin');
  await page.click('#btn-front');
  await new Promise(r => setTimeout(r, 500));

  // 1. FOOTY #10 (Front & Face)
  await page.screenshot({ path: 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/fresh_footy_front.png' });
  await page.click('#btn-face');
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/fresh_footy_face.png' });

  // 2. HOOPS #23 (Front, Face, 3/4)
  await page.click('#tab-hoops');
  await new Promise(r => setTimeout(r, 1200));
  await page.click('#btn-full');
  await page.click('#btn-front');
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/fresh_hoops_front.png' });

  await page.click('#btn-threeq');
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/fresh_hoops_threeq.png' });

  await page.click('#btn-face');
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/fresh_hoops_face.png' });

  // 3. KEEPER #1 (Front & Face)
  await page.click('#tab-keeper');
  await new Promise(r => setTimeout(r, 1200));
  await page.click('#btn-full');
  await page.click('#btn-front');
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/fresh_keeper_front.png' });

  await page.click('#btn-face');
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/fresh_keeper_face.png' });

  await browser.close();
  console.log('Capture complete!');
}

testRender().catch(err => {
  console.error(err);
  process.exit(1);
});
