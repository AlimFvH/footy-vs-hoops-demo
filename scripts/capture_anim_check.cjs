const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');

async function testAnimations() {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 900 });
  await page.goto('http://localhost:8099/character_studio.html');
  await new Promise(r => setTimeout(r, 1200));

  // Turn off spin
  await page.click('#btn-spin');
  await page.click('#btn-front');

  // 1. Hoops Dunk Action
  await page.click('#tab-hoops');
  await new Promise(r => setTimeout(r, 1000));
  await page.click('#pose-action');
  await new Promise(r => setTimeout(r, 1200)); // mid-air slam dunk
  await page.screenshot({ path: 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/anim_hoops_dunk.png' });

  // 2. Footy Bicycle Kick Action
  await page.click('#tab-footy');
  await new Promise(r => setTimeout(r, 1000));
  await page.click('#pose-action');
  await new Promise(r => setTimeout(r, 1100)); // mid-air bicycle kick
  await page.screenshot({ path: 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/anim_footy_bicycle.png' });

  // 3. Footy SIUUU Celebration
  await page.click('#pose-celebrate');
  await new Promise(r => setTimeout(r, 1800)); // SIUUU power landing
  await page.screenshot({ path: 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/anim_footy_siuuu.png' });

  // 4. Keeper Diving Save Action
  await page.click('#tab-keeper');
  await new Promise(r => setTimeout(r, 1000));
  await page.click('#pose-action');
  await new Promise(r => setTimeout(r, 1200)); // diving save
  await page.screenshot({ path: 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/anim_keeper_dive.png' });

  await browser.close();
  console.log('Animation capture complete!');
}

testAnimations().catch(err => {
  console.error(err);
  process.exit(1);
});
