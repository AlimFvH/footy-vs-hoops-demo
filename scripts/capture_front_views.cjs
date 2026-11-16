const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const ARTIFACT_DIR = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function captureFrontViews() {
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
  await new Promise(r => setTimeout(r, 1200));

  // 1. Launch Footy match and rotate camera to see player front
  console.log('1. Footy front view...');
  await page.evaluate(() => {
    window.app.launch({ mode: 'footy', difficulty: 'easy', minutes: 2, char: 'footy', arenaId: 'std_footy_classic' }, false);
  });
  await new Promise(r => setTimeout(r, 3000));

  // Rotate camera around to front of player
  await page.evaluate(() => {
    const game = window.app.game;
    if (game && game.matchView && game.matchView.rig) {
      const rig = game.matchView.rig;
      // Force camera position in front of human player
      const h = game.sim.human;
      rig.cam.position = [h.x, 2.0, h.z - 4.5];
      rig.cam.target = [h.x, 1.4, h.z];
      rig.cam.update();
    }
  });
  await new Promise(r => setTimeout(r, 600));

  const footyFront = path.join(ARTIFACT_DIR, 'live_audit_05_footy_front.png');
  await page.screenshot({ path: footyFront });
  console.log('Saved:', footyFront);

  // 2. Launch Hoops match and rotate camera to see player front
  console.log('2. Hoops front view...');
  await page.evaluate(() => {
    window.app.launch({ mode: 'hoops', difficulty: 'easy', minutes: 2, char: 'hoops', arenaId: 'std_hoops_street' }, false);
  });
  await new Promise(r => setTimeout(r, 3000));

  await page.evaluate(() => {
    const game = window.app.game;
    if (game && game.matchView && game.matchView.rig) {
      const rig = game.matchView.rig;
      const h = game.sim.human;
      rig.cam.position = [h.x, 2.2, h.z - 4.5];
      rig.cam.target = [h.x, 1.4, h.z];
      rig.cam.update();
    }
  });
  await new Promise(r => setTimeout(r, 600));

  const hoopsFront = path.join(ARTIFACT_DIR, 'live_audit_06_hoops_front.png');
  await page.screenshot({ path: hoopsFront });
  console.log('Saved:', hoopsFront);

  await browser.close();
}

captureFrontViews().catch(console.error);
