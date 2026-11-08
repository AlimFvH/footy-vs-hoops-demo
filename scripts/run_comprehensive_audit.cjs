const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
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

  // 1. Main Menu
  console.log('1. Main Menu...');
  await page.goto('http://127.0.0.1:8099/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_final_01_main_menu.png') });

  // 2. Wardrobe - Footy
  console.log('2. Wardrobe Footy...');
  await page.evaluate(() => {
    if (window.app && window.app.showPage) window.app.showPage('wardrobe');
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_final_02_wardrobe_footy.png') });

  // 3. Wardrobe - Hoops
  console.log('3. Wardrobe Hoops...');
  await page.evaluate(() => {
    if (window.app && window.app.switchWardrobeCharacter) {
      window.app.switchWardrobeCharacter();
    } else {
      const sw = document.querySelector('.fvh-athlete-switch, [data-action="switch-character"]');
      if (sw) sw.click();
    }
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_final_03_wardrobe_hoops.png') });

  // 4. Shop
  console.log('4. Shop...');
  await page.evaluate(() => {
    if (window.app && window.app.showPage) window.app.showPage('shop');
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_final_04_shop.png') });

  // 5. Football Match Live
  console.log('5. Football Match Kickoff...');
  await page.evaluate(() => {
    window.app.launch({ mode: 'footy', difficulty: 'easy', minutes: 2, char: 'footy', arenaId: 'std_footy_classic' }, false);
  });
  await new Promise(r => setTimeout(r, 4800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_final_05_footy_kickoff.png') });

  // 6. Football Action & Goal
  console.log('6. Football Goal Shot...');
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
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_final_06_footy_goal.png') });

  // 7. Basketball Match Live
  console.log('7. Basketball Match Kickoff...');
  await page.evaluate(() => {
    window.app.launch({ mode: 'hoops', difficulty: 'easy', minutes: 2, char: 'hoops', arenaId: 'std_hoops_street' }, false);
  });
  await new Promise(r => setTimeout(r, 4800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_final_07_hoops_kickoff.png') });

  // 8. Basketball Dunk
  console.log('8. Basketball Dunk Action...');
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
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_final_08_hoops_dunk.png') });

  // 9. Pause Menu
  console.log('9. Pause Menu...');
  await page.evaluate(() => {
    if (window.app && window.app.game && window.app.game.pause) {
      window.app.game.pause();
    }
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_final_09_pause_menu.png') });

  // 10. Desktop Viewport (1280x800) Basketball match
  console.log('10. Desktop Landscape Viewport...');
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
  await page.evaluate(() => {
    if (window.app && window.app.game && window.app.game.resume) {
      window.app.game.resume();
    }
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_final_10_desktop_landscape.png') });

  await browser.close();
  console.log('=== All 10 Audit Screenshots Captured Successfully! ===');
})();
