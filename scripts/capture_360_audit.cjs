const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const ARTIFACTS_DIR = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function audit360() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setViewport({ width: 1200, height: 900 });

  page.on('console', msg => console.log('[Console]', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('[PageError]', err));

  await page.goto('http://localhost:8099/character_studio.html');
  await new Promise(r => setTimeout(r, 1200));

  // Turn off auto-spin
  await page.evaluate(() => {
    const btn = document.getElementById('btn-spin');
    if (btn && btn.classList.contains('active')) btn.click();
  });

  const chars = ['footy', 'hoops', 'keeper'];
  const angles = [
    { id: 'btn-front', name: 'front' },
    { id: 'btn-threeq', name: 'threeq' },
    { id: 'btn-back', name: 'back' },
    { id: 'btn-face', name: 'face' },
    { id: 'btn-boots', name: 'boots' }
  ];

  for (const c of chars) {
    console.log(`\n=== Auditing ${c.toUpperCase()} ===`);
    // Select char
    await page.evaluate((type) => {
      window.selectChar(type);
      window.setPose('idle');
    }, c);
    await new Promise(r => setTimeout(r, 500));

    for (const a of angles) {
      if (a.name === 'front' || a.name === 'threeq' || a.name === 'back') {
        await page.click('#btn-full');
        await new Promise(r => setTimeout(r, 200));
      }
      await page.click('#' + a.id);
      await new Promise(r => setTimeout(r, 400));

      const file = `audit360_${c}_${a.name}.png`;
      const outPath = path.join(ARTIFACTS_DIR, file);
      await page.screenshot({ path: outPath });
      console.log(`Saved ${file}`);
    }
  }

  await browser.close();
  console.log('\n360° All-Angle Audit Capture Complete!');
}

audit360().catch(err => {
  console.error(err);
  process.exit(1);
});
