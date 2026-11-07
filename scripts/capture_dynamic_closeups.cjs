const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const serverApp = require('../server/server.js');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const artifactDir = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function captureDynamicCloseups() {
  console.log('Capturing dynamic in-engine close-up match action...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  await page.setRequestInterception(true);
  page.on('request', r => {
    if (r.url().includes('telegram.org')) {
      r.respond({ status: 200, contentType: 'application/javascript', body: 'window.Telegram = window.Telegram || { WebApp: {} };' });
    } else r.continue();
  });

  await page.goto('http://127.0.0.1:8099/index.html', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1200));

  // 1. FOOTY DYNAMIC CLOSE-UP
  await page.evaluate(() => {
    window.app.launch({ mode: 'footy', difficulty: 'easy', minutes: 2, char: 'footy', arenaId: 'std_footy_classic' }, false);
  });
  await new Promise(r => setTimeout(r, 2000));

  // Position player & position camera close-up
  await page.evaluate(() => {
    const sim = window.app.game.sim;
    const view = window.app.game.view;
    sim.phase = 'playing';
    const human = sim.human;
    human.x = 0;
    human.z = -8;
    human.fx = 0;
    human.fz = -1;
    sim.setOwner(human);

    // Zoom camera right up to player
    if (view && view.rig && view.rig.cam) {
      view.rig.cam.position = [0, 2.2, -4.5];
      view.rig.cam.target = [0, 1.1, -8.0];
    }
  });

  // Step 20 frames so running animation blends in
  for (let i = 0; i < 20; i++) {
    await page.evaluate(() => {
      window.app.game.sim.step(1 / 60);
      for (const e of window.app.game.sim.drainEvents()) window.app.game.onEvent(e);
      const view = window.app.game.view;
      if (view && view.rig && view.rig.cam) {
        view.rig.cam.position = [0, 2.2, -4.5];
        view.rig.cam.target = [0, 1.1, -8.0];
      }
    });
  }

  const footyCloseupPath = path.join(artifactDir, 'in_match_footy_3d_action_closeup.png');
  await page.screenshot({ path: footyCloseupPath });
  console.log(`✓ Captured FOOTY 3D close-up action -> ${footyCloseupPath}`);

  // Quit to menu
  await page.evaluate(() => { window.app.quitToMenu(); });
  await new Promise(r => setTimeout(r, 800));

  // 2. HOOPS DYNAMIC CLOSE-UP
  await page.evaluate(() => {
    window.app.launch({ mode: 'hoops', difficulty: 'easy', minutes: 2, char: 'hoops', arenaId: 'std_hoops_street' }, false);
  });
  await new Promise(r => setTimeout(r, 2000));

  await page.evaluate(() => {
    const sim = window.app.game.sim;
    const view = window.app.game.view;
    sim.phase = 'playing';
    const human = sim.human;
    human.x = 0;
    human.z = 4.0;
    human.fx = 0;
    human.fz = 1;
    sim.setOwner(human);

    // Zoom camera right up to player
    if (view && view.rig && view.rig.cam) {
      view.rig.cam.position = [0, 2.4, 0.5];
      view.rig.cam.target = [0, 1.2, 4.0];
    }
  });

  for (let i = 0; i < 20; i++) {
    await page.evaluate(() => {
      window.app.game.sim.step(1 / 60);
      for (const e of window.app.game.sim.drainEvents()) window.app.game.onEvent(e);
      const view = window.app.game.view;
      if (view && view.rig && view.rig.cam) {
        view.rig.cam.position = [0, 2.4, 0.5];
        view.rig.cam.target = [0, 1.2, 4.0];
      }
    });
  }

  const hoopsCloseupPath = path.join(artifactDir, 'in_match_hoops_3d_action_closeup.png');
  await page.screenshot({ path: hoopsCloseupPath });
  console.log(`✓ Captured HOOPS 3D close-up action -> ${hoopsCloseupPath}`);

  await browser.close();
  console.log('Close-up match captures complete!');
  process.exit(0);
}

captureDynamicCloseups().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
