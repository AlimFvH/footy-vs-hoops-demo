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
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERR:', err.message));
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

  await page.goto('http://127.0.0.1:8099/index.html');
  await new Promise(r => setTimeout(r, 1200));

  // Dismiss start modal / team choice if present
  await page.evaluate(() => {
    const card = document.querySelector('.fvh-team-card.footy');
    if (card) {
      card.click();
      const btn = document.querySelector('.btn.primary.block');
      if (btn) btn.click();
    }
    const modalBtn = document.querySelector('.fvh-team-modal button, .fvh-choice-btn, .btn.primary');
    if (modalBtn) modalBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  await page.waitForFunction(() => !!(window.app || window.__fvh));
  console.log('App ready. Launching Footy mobile portrait...');
  await page.evaluate(() => {
    const a = window.app || window.__fvh;
    a.launch({ mode: 'footy', difficulty: 'easy', minutes: 2, skipCountdown: true }, false);
  });

  await new Promise(r => setTimeout(r, 1200));

  // 1. Kickoff play
  const mobileKickoff = path.join(ARTIFACT_DIR, 'live_match_mobile_footy_kickoff.png');
  await page.screenshot({ path: mobileKickoff });
  console.log('Saved:', mobileKickoff);

  // 2. Sprint with ball
  await page.keyboard.down('KeyW');
  await new Promise(r => setTimeout(r, 1200));
  const mobileSprint = path.join(ARTIFACT_DIR, 'live_match_mobile_footy_sprint.png');
  await page.screenshot({ path: mobileSprint });
  console.log('Saved:', mobileSprint);

  // 3. Shoot towards goal
  await page.keyboard.press('Space');
  await new Promise(r => setTimeout(r, 400));
  const mobileShoot = path.join(ARTIFACT_DIR, 'live_match_mobile_footy_shoot.png');
  await page.screenshot({ path: mobileShoot });
  console.log('Saved:', mobileShoot);

  await page.keyboard.up('KeyW');

  // Now Launch Hoops Basketball mobile portrait
  console.log('Launching Hoops mobile portrait...');
  await page.evaluate(() => {
    const a = window.app || window.__fvh;
    a.launch({ mode: 'hoops', difficulty: 'easy', minutes: 2, char: 'hoops', skipCountdown: true }, false);
  });
  await new Promise(r => setTimeout(r, 1200));

  await page.keyboard.down('KeyW');
  await new Promise(r => setTimeout(r, 1000));
  const mobileHoops = path.join(ARTIFACT_DIR, 'live_match_mobile_hoops_play.png');
  await page.screenshot({ path: mobileHoops });
  console.log('Saved:', mobileHoops);

  await page.keyboard.up('KeyW');
  await browser.close();
  console.log('Mobile portrait tests completed successfully!');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
