const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const ARTIFACTS_DIR = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function captureDemo() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });

  page.on('console', msg => console.log('[Demo Log]', msg.text()));
  page.on('pageerror', err => console.error('[Demo Error]', err));

  await page.goto('http://localhost:8099/test_25d_match_demo.html');
  await new Promise(r => setTimeout(r, 1200));

  // 1. Broadcast Match View (Whole Pitch with Footy, Hoops, Keeper)
  const fullPath = path.join(ARTIFACTS_DIR, 'demo_25d_match_broadcast.png');
  await page.screenshot({ path: fullPath });
  console.log('Saved demo_25d_match_broadcast.png');

  // 2. Close-up Action View (Footy Dribbling with Ball vs Hoops)
  await page.evaluate(() => {
    const demo = window.__MATCH_DEMO__;
    demo.cam.position = [-0.5, 4.2, 7.5];
    demo.cam.target = [0, 1.2, 1.5];
    demo.cam.update();
  });
  await new Promise(r => setTimeout(r, 300));
  const actionPath = path.join(ARTIFACTS_DIR, 'demo_25d_match_action.png');
  await page.screenshot({ path: actionPath });
  console.log('Saved demo_25d_match_action.png');

  // 3. Keeper in Goal View
  await page.evaluate(() => {
    const demo = window.__MATCH_DEMO__;
    demo.cam.position = [0, 3.8, -4.5];
    demo.cam.target = [0, 1.2, -9.5];
    demo.cam.update();
  });
  await new Promise(r => setTimeout(r, 300));
  const keeperPath = path.join(ARTIFACTS_DIR, 'demo_25d_match_keeper.png');
  await page.screenshot({ path: keeperPath });
  console.log('Saved demo_25d_match_keeper.png');

  await browser.close();
  console.log('All 2.5D match demo screenshots successfully captured!');
}

captureDemo().catch(err => {
  console.error(err);
  process.exit(1);
});
