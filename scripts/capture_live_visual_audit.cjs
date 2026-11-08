const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const ARTIFACT_DIR = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=450,920']
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

  console.log('Navigating to http://127.0.0.1:8099/index.html ...');
  await page.goto('http://127.0.0.1:8099/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  // Dismiss any modal
  await page.evaluate(() => {
    const modalBtn = document.querySelector('.fvh-team-modal button, .fvh-choice-btn, .btn.primary');
    if (modalBtn) modalBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // 1. Launch Footy match
  console.log('1. Launch Footy Match...');
  await page.evaluate(() => {
    window.app.launch({ mode: 'footy', difficulty: 'easy', minutes: 2, char: 'footy', arenaId: 'std_footy_classic' }, false);
  });
  await new Promise(r => setTimeout(r, 4500));

  const footyKickoff = path.join(ARTIFACT_DIR, 'live_audit_01_footy_kickoff.png');
  await page.screenshot({ path: footyKickoff });
  console.log('Saved:', footyKickoff);

  // 2. Football Action
  console.log('2. Football Action...');
  await page.evaluate(() => {
    const game = window.app.game;
    if (game && game.sim) {
      game.sim.human.z = -14;
      game.sim.human.x = 0;
      game.sim.ball.z = -20;
      game.sim.ball.x = 0;
      game.sim.ball.vz = -15;
      game.sim.ball.shot = true;
    }
  });
  await new Promise(r => setTimeout(r, 800));

  const footyGoal = path.join(ARTIFACT_DIR, 'live_audit_02_footy_goal.png');
  await page.screenshot({ path: footyGoal });
  console.log('Saved:', footyGoal);

  // 3. Launch Hoops match
  console.log('3. Launch Hoops Match...');
  await page.evaluate(() => {
    window.app.launch({ mode: 'hoops', difficulty: 'easy', minutes: 2, char: 'hoops', arenaId: 'std_hoops_street' }, false);
  });
  await new Promise(r => setTimeout(r, 4500));

  const hoopsKickoff = path.join(ARTIFACT_DIR, 'live_audit_03_hoops_kickoff.png');
  await page.screenshot({ path: hoopsKickoff });
  console.log('Saved:', hoopsKickoff);

  // 4. Hoops Dunk Action
  console.log('4. Hoops Dunk Action...');
  await page.evaluate(() => {
    const game = window.app.game;
    if (game && game.sim) {
      game.sim.human.z = -10.5;
      game.sim.human.x = 0;
      game.sim.human.y = 1.6;
      game.sim.ball.z = -12.4;
      game.sim.ball.x = 0;
      game.sim.ball.y = 3.1;
      game.sim.shot = { dunk: true };
    }
  });
  await new Promise(r => setTimeout(r, 800));

  const hoopsDunk = path.join(ARTIFACT_DIR, 'live_audit_04_hoops_dunk.png');
  await page.screenshot({ path: hoopsDunk });
  console.log('Saved:', hoopsDunk);

  await browser.close();
  console.log('✓ All visual audit captures saved successfully.');
}

capture().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
