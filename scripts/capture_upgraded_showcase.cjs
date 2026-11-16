const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const fs = require('fs');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const ARTIFACT_DIR = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function captureUpgradedAthletes() {
  console.log('=== Capturing Upgraded Articulated Athletes & Animations ===');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 1 });
  await page.goto('http://localhost:8099/character_studio.html');
  await new Promise(r => setTimeout(r, 2500));

  async function snap(name, charType, pose, angle = 0.65, delay = 1200) {
    console.log(`Snapping ${name} (${charType} | ${pose})...`);
    await page.evaluate((c, p, a) => {
      window.selectChar(c);
      window.setPose(p);
      window.setPresetAngle(a);
    }, charType, pose, angle);

    await new Promise(r => setTimeout(r, delay));
    const filename = `${ARTIFACT_DIR}/${name}.png`;
    await page.screenshot({ path: filename });
    console.log(`✓ Saved ${filename}`);
  }

  // 1. Hoops #23: Hero Front & Detail Shots
  await snap('hyper_01_hoops_front', 'hoops', 'idle', 0, 800);
  await snap('hyper_02_hoops_threeq', 'hoops', 'idle', 0.65, 800);

  // 2. Hoops #23: Articulated Sprint & Slam Dunk
  await snap('hyper_03_hoops_sprint', 'hoops', 'run', 0.85, 1000);
  await snap('hyper_04_hoops_slam_dunk', 'hoops', 'action', 0.55, 1400);
  await snap('hyper_05_hoops_crossover', 'hoops', 'dribble', 0.45, 1000);
  await snap('hyper_06_hoops_crown', 'hoops', 'celebrate', 0.45, 1200);

  // 3. Footy #10: Hero Front, Bicycle Kick & SIUUU
  await snap('hyper_07_footy_front', 'footy', 'idle', 0, 800);
  await snap('hyper_08_footy_sprint', 'footy', 'run', 0.85, 1000);
  await snap('hyper_09_footy_bicycle_kick', 'footy', 'action', 0.70, 1400);
  await snap('hyper_10_footy_siuuu', 'footy', 'celebrate', 0, 1600);

  // 4. Keeper #1: Diving Save & Victory Roar
  await snap('hyper_11_keeper_front', 'keeper', 'idle', 0, 800);
  await snap('hyper_12_keeper_diving_save', 'keeper', 'action', 0.45, 1400);
  await snap('hyper_13_keeper_titan_roar', 'keeper', 'celebrate', 0.25, 1200);

  await browser.close();
  console.log('\n✓ All 13 master showcases successfully captured!');
}

captureUpgradedAthletes().catch(console.error);
