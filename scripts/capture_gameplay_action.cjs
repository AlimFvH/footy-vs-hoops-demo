const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const ARTIFACT_DIR = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function captureGameplayAction() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=600,1000']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 2 });

  await page.setRequestInterception(true);
  page.on('request', req => {
    if (req.url().includes('telegram.org')) {
      req.respond({
        status: 200,
        contentType: 'application/javascript',
        body: 'window.Telegram = { WebApp: { ready: () => {}, expand: () => {}, initDataUnsafe: {} } };'
      });
    } else {
      req.continue();
    }
  });

  await page.goto('http://127.0.0.1:8099/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // 1. Launch Footy match and wait for countdown to finish into active play
  console.log('1. Active Footy play...');
  await page.evaluate(() => {
    window.app.launch({ mode: 'footy', difficulty: 'easy', minutes: 2, char: 'footy', arenaId: 'std_footy_classic' }, false);
  });
  // Wait for countdown to finish (4.5s)
  await new Promise(r => setTimeout(r, 5500));

  // Simulate pressing 'W' or running forward towards the goal with the ball
  await page.evaluate(() => {
    const game = window.app.game;
    if (game && game.sim) {
      game.sim.human.vz = -5.5;
      game.sim.human.z -= 4.0;
      game.sim.ball.z = game.sim.human.z - 1.2;
      game.sim.ball.x = game.sim.human.x;
    }
  });
  await new Promise(r => setTimeout(r, 800));

  const footyPlay = path.join(ARTIFACT_DIR, 'live_audit_07_footy_active_run.png');
  await page.screenshot({ path: footyPlay });
  console.log('Saved:', footyPlay);

  // 2. Launch Hoops match and wait for active play
  console.log('2. Active Hoops play...');
  await page.evaluate(() => {
    window.app.launch({ mode: 'hoops', difficulty: 'easy', minutes: 2, char: 'hoops', arenaId: 'std_hoops_street' }, false);
  });
  await new Promise(r => setTimeout(r, 5500));

  await page.evaluate(() => {
    const game = window.app.game;
    if (game && game.sim) {
      game.sim.human.vz = -4.5;
      game.sim.human.z -= 3.5;
      game.sim.ball.z = game.sim.human.z - 1.0;
      game.sim.ball.x = game.sim.human.x;
    }
  });
  await new Promise(r => setTimeout(r, 800));

  const hoopsPlay = path.join(ARTIFACT_DIR, 'live_audit_08_hoops_active_dribble.png');
  await page.screenshot({ path: hoopsPlay });
  console.log('Saved:', hoopsPlay);

  await browser.close();
}

captureGameplayAction().catch(console.error);
