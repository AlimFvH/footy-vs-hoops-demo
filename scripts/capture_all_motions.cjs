const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');

async function testAllMotions() {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 900 });
  await page.goto('http://localhost:8099/character_studio.html');
  await new Promise(r => setTimeout(r, 1200));

  await page.click('#btn-spin'); // Turn off auto-spin
  await page.click('#btn-front'); // Front view

  // 1. Hoops #23 Running
  await page.click('#tab-hoops');
  await new Promise(r => setTimeout(r, 1000));
  await page.click('#pose-run');
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/motion_hoops_run.png' });

  // 2. Hoops #23 Dribbling
  await page.click('#pose-dribble');
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/motion_hoops_dribble.png' });

  // 3. Footy #10 Running
  await page.click('#tab-footy');
  await new Promise(r => setTimeout(r, 1000));
  await page.click('#pose-run');
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/motion_footy_run.png' });

  // 4. Keeper #1 Stance
  await page.click('#tab-keeper');
  await new Promise(r => setTimeout(r, 1000));
  await page.click('#pose-idle');
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/motion_keeper_stance.png' });

  await browser.close();
  console.log('Motions captured successfully!');
}

testAllMotions().catch(err => {
  console.error(err);
  process.exit(1);
});
