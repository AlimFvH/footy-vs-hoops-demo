const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const ARTIFACT_DIR = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });

  await page.goto('http://localhost:8099/?tgWebAppPlatform=weba');
  await new Promise(r => setTimeout(r, 2000));

  console.log('Launching Basketball match...');
  await page.evaluate(() => {
    window.__fvh.launch({ mode: 'hoops', difficulty: 'easy', minutes: 2, char: 'hoops' }, false);
  });

  console.log('Waiting for kickoff countdown to finish...');
  for (let i = 0; i < 40; i++) {
    const phase = await page.evaluate(() => {
      const g = window.app && window.app.game;
      return g && g.sim ? g.sim.phase : null;
    });
    if (phase === 'playing') {
      console.log(`Basketball match is now actively playing! (after ${i * 200}ms)`);
      break;
    }
    await new Promise(r => setTimeout(r, 200));
  }

  // Run towards hoop with ball
  console.log('Running towards hoop with KeyW...');
  await page.keyboard.down('KeyW');
  await new Promise(r => setTimeout(r, 1200));

  const hoopsRunPath = path.join(ARTIFACT_DIR, 'live_match_3d_hoops_run.png');
  await page.screenshot({ path: hoopsRunPath });
  console.log('Saved live_match_3d_hoops_run.png');

  // Dunk / Shoot
  console.log('Dunking on rim with Space...');
  await page.keyboard.press('Space');
  await new Promise(r => setTimeout(r, 400));

  const hoopsDunkPath = path.join(ARTIFACT_DIR, 'live_match_3d_hoops_dunk.png');
  await page.screenshot({ path: hoopsDunkPath });
  console.log('Saved live_match_3d_hoops_dunk.png');

  await page.keyboard.up('KeyW');
  await browser.close();
  console.log('Basketball match captured successfully!');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
