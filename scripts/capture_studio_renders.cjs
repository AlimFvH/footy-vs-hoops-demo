const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const ARTIFACTS_DIR = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 960, deviceScaleFactor: 1 });

  page.on('console', msg => console.log('[Browser Console]', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('[Browser Error]', err));

  console.log('Navigating to http://localhost:8099/character_studio.html ...');
  await page.goto('http://localhost:8099/character_studio.html', { waitUntil: 'networkidle0' });

  // Wait for studio to be ready
  await page.waitForFunction(() => window.__STUDIO__ && window.__STUDIO__.ready);
  console.log('Studio ready!');

  // Stop auto spin
  await page.evaluate(() => {
    if (window.__STUDIO__.toggleSpin) {
      // make sure spin is off
      const btn = document.getElementById('btn-spin');
      if (btn && btn.classList.contains('active')) {
        btn.click();
      }
    }
  });

  async function snap(name, charType, angle, zoom) {
    console.log(`Capturing ${name} (${charType}, angle=${angle}, zoom=${zoom})...`);
    await page.evaluate((c, a, z) => {
      window.__STUDIO__.selectChar(c);
      window.__STUDIO__.setPresetAngle(a);
      window.__STUDIO__.zoomTarget(z);
    }, charType, angle, zoom);

    // Wait 400ms for smooth camera tweening
    await new Promise(r => setTimeout(r, 450));

    const shotPath = path.join(ARTIFACTS_DIR, `${name}.png`);
    await page.screenshot({ path: shotPath, type: 'png' });
    console.log(`Saved ${shotPath}`);
  }

  // 1. Hoops #23
  await snap('studio_v2_01_hoops_front', 'hoops', 0, 'full');
  await snap('studio_v2_02_hoops_face', 'hoops', 0, 'face');
  await snap('studio_v2_03_hoops_threeq', 'hoops', 0.65, 'full');
  await snap('studio_v2_04_hoops_back', 'hoops', Math.PI, 'full');

  // 2. Footy #10
  await snap('studio_v2_05_footy_front', 'footy', 0, 'full');
  await snap('studio_v2_06_footy_face', 'footy', 0, 'face');
  await snap('studio_v2_07_footy_threeq', 'footy', 0.65, 'full');
  await snap('studio_v2_07b_footy_back', 'footy', Math.PI, 'full');

  // 3. Keeper #1
  await snap('studio_v2_08_keeper_front', 'keeper', 0, 'full');
  await snap('studio_v2_09_keeper_face', 'keeper', 0, 'face');
  await snap('studio_v2_10_keeper_threeq', 'keeper', 0.65, 'full');
  await snap('studio_v2_11_keeper_back', 'keeper', Math.PI, 'full');

  await browser.close();
  console.log('All studio captures complete!');
}

capture().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
