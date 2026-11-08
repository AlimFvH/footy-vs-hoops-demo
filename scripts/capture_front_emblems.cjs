const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const ARTIFACT_DIR = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function captureFronts() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

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

  console.log('Capturing Football Athlete Front Chest Uniform with Official Emblem...');
  await page.goto('http://127.0.0.1:8099/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));

  await page.evaluate(() => {
    document.querySelectorAll('.fvh-onboarding-overlay, .fvh-modal-overlay').forEach(el => el.remove());
    window.app.launch({ mode: 'footy', difficulty: 'easy', minutes: 2, char: 'footy', arenaId: 'std_footy_classic' }, false);
  });
  await new Promise(r => setTimeout(r, 2000));

  await page.evaluate(() => {
    const mv = window.app.game.view;
    const human = window.app.game.sim.human;
    if (mv && mv.rig && human) {
      mv.rig.update = function() {
        this.cam.position = [human.x, 1.95, human.z - 5.2];
        this.cam.target = [human.x, 1.25, human.z];
        this.cam.update();
      };
    }
  });
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'stage6_2_footy_front_emblem_match.png') });
  console.log('Saved: stage6_2_footy_front_emblem_match.png');

  console.log('Capturing Basketball Athlete Front Chest Uniform with Official Emblem...');
  await page.goto('http://127.0.0.1:8099/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));

  await page.evaluate(() => {
    document.querySelectorAll('.fvh-onboarding-overlay, .fvh-modal-overlay').forEach(el => el.remove());
    window.app.launch({ mode: 'hoops', difficulty: 'easy', minutes: 2, char: 'hoops', arenaId: 'std_hoops_street' }, false);
  });
  await new Promise(r => setTimeout(r, 2000));

  await page.evaluate(() => {
    const mv = window.app.game.view;
    const human = window.app.game.sim.human;
    if (mv && mv.rig && human) {
      mv.rig.update = function() {
        this.cam.position = [human.x, 1.95, human.z - 5.2];
        this.cam.target = [human.x, 1.25, human.z];
        this.cam.update();
      };
    }
  });
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'stage6_2_hoops_front_emblem_match.png') });
  console.log('Saved: stage6_2_hoops_front_emblem_match.png');

  await browser.close();
}

captureFronts().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
