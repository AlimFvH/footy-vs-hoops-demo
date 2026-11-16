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

  page.on('console', m => console.log('[LOG]', m.type(), m.text()));
  page.on('pageerror', e => console.error('[ERR]', e.message));

  console.log('Opening match...');
  await page.goto('http://localhost:8099/?tgWebAppPlatform=weba');
  await new Promise(r => setTimeout(r, 2000));

  console.log('Launching match...');
  await page.evaluate(() => {
    window.__fvh.launch({ mode: 'footy', difficulty: 'easy', minutes: 2 }, false);
  });

  // Wait until sim phase is 'playing'
  console.log('Waiting for kickoff countdown to finish...');
  for (let i = 0; i < 40; i++) {
    const phase = await page.evaluate(() => {
      const g = window.app && window.app.game;
      return g && g.sim ? g.sim.phase : null;
    });
    if (phase === 'playing') {
      console.log(`Match is now actively playing! (after ${i * 200}ms)`);
      break;
    }
    await new Promise(r => setTimeout(r, 200));
  }

  // 1. Run forward and right with ball
  console.log('Running forward with KeyW + KeyD...');
  await page.keyboard.down('KeyW');
  await page.keyboard.down('KeyD');
  await new Promise(r => setTimeout(r, 1200));

  const runShotPath = path.join(ARTIFACT_DIR, 'live_match_3d_action_run.png');
  await page.screenshot({ path: runShotPath });
  console.log('Saved live_match_3d_action_run.png');

  // 2. Sprint towards opponent goal
  await new Promise(r => setTimeout(r, 800));
  const sprintShotPath = path.join(ARTIFACT_DIR, 'live_match_3d_action_sprint.png');
  await page.screenshot({ path: sprintShotPath });
  console.log('Saved live_match_3d_action_sprint.png');

  // 3. Take a powerful shot on goal
  console.log('Shooting on goal with Space...');
  await page.keyboard.press('Space');
  await new Promise(r => setTimeout(r, 400));
  const goalShotPath = path.join(ARTIFACT_DIR, 'live_match_3d_action_kick.png');
  await page.screenshot({ path: goalShotPath });
  console.log('Saved live_match_3d_action_kick.png');

  await page.keyboard.up('KeyW');
  await page.keyboard.up('KeyD');

  await browser.close();
  console.log('Done!');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
