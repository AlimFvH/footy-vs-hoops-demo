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
    const btn = document.getElementById('btn-spin');
    if (btn && btn.classList.contains('active')) {
      btn.click();
    }
  });

  async function capturePose(name, charType, pose, waitMs = 500, angle = 0.55) {
    console.log(`Setting up ${name} (${charType}, pose=${pose})...`);
    await page.evaluate((c, p, a) => {
      window.__STUDIO__.selectChar(c);
      window.__STUDIO__.setPose(p);
      window.__STUDIO__.setPresetAngle(a);
      window.__STUDIO__.zoomTarget('full');
    }, charType, pose, angle);

    await new Promise(r => setTimeout(r, waitMs));

    const shotPath = path.join(ARTIFACTS_DIR, `${name}.png`);
    await page.screenshot({ path: shotPath, type: 'png' });
    console.log(`✓ Saved ${name}.png`);
  }

  // 1. Footy #10 Animations
  await capturePose('anim_01_footy_sprint', 'footy', 'run', 600, 0.55);
  await capturePose('anim_02_footy_bicycle_kick', 'footy', 'action', 1100, 0.45);
  await capturePose('anim_03_footy_siuu_celebration', 'footy', 'celebrate', 1900, 0.35);

  // 2. Hoops #23 Animations
  await capturePose('anim_04_hoops_sprint', 'hoops', 'run', 600, 0.55);
  await capturePose('anim_05_hoops_tomahawk_dunk', 'hoops', 'action', 1200, 0.50);
  await capturePose('anim_06_hoops_crossover_dribble', 'hoops', 'dribble', 600, 0.50);

  // 3. Keeper #1 Animations
  await capturePose('anim_07_keeper_diving_save', 'keeper', 'action', 1100, 0.35);
  await capturePose('anim_08_keeper_titan_roar', 'keeper', 'celebrate', 700, 0.45);

  await browser.close();
  console.log('All animation renders successfully captured!');
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
