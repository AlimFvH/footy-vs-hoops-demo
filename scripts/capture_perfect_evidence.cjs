const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const ARTIFACT_DIR = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function captureAll() {
  console.log('Starting Stage 6.2 Perfect Evidence Capture...');
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

  console.log('[1/7] Navigating and bypassing team onboarding...');
  await page.goto('http://127.0.0.1:8099/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
    if (window.app && window.app.store) {
      window.app.store.update(d => {
        d.selectedTeam = 'footy';
        d.selectedCharacter = 'footy';
        d.teamChosen = true;
      });
    }
    document.querySelectorAll('.fvh-onboarding-overlay, .fvh-modal-overlay').forEach(el => el.remove());
    if (window.app && window.app.showMenu) window.app.showMenu();
  });
  await new Promise(r => setTimeout(r, 600));

  // --- 1. FOOTY WARDROBE LOCKER ---
  console.log('[2/7] Capturing FOOTY Locker with Official Emblem...');
  await page.evaluate(() => {
    if (window.app && window.app.openCharacterLocker) {
      window.app.openCharacterLocker('footy');
    }
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'stage6_2_wardrobe_footy_emblem.png') });
  console.log('Saved: stage6_2_wardrobe_footy_emblem.png');

  // --- 2. HOOPS WARDROBE LOCKER ---
  console.log('[3/7] Capturing HOOPS Locker with Official Emblem...');
  await page.evaluate(() => {
    if (window.app && window.app.openCharacterLocker) {
      window.app.openCharacterLocker('hoops');
    }
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'stage6_2_wardrobe_hoops_emblem.png') });
  console.log('Saved: stage6_2_wardrobe_hoops_emblem.png');

  // --- 3. FOOTBALL MATCH: THIRD-PERSON CAMERA & OFFICIAL EMBLEM ---
  console.log('[4/7] Launching Football Match (Third-Person Follow & Pitch Center Emblem)...');
  await page.evaluate(() => {
    window.app.launch({ mode: 'footy', difficulty: 'easy', minutes: 2, char: 'footy', arenaId: 'std_footy_classic' }, false);
  });
  await new Promise(r => setTimeout(r, 2200));

  // Regular kickoff third-person camera
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'stage6_2_footy_match_camera.png') });
  console.log('Saved: stage6_2_footy_match_camera.png');

  // Front view of Footy athlete showing official chest emblem in-match
  await page.evaluate(() => {
    const mv = window.app.game.view;
    const human = window.app.game.sim.human;
    if (mv && mv.rig && human) {
      mv.rig.update = function() {
        this.cam.position = [human.x, 1.85, human.z - 3.2];
        this.cam.target = [human.x, 1.35, human.z];
        this.cam.update();
      };
    }
  });
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'stage6_2_footy_front_emblem_match.png') });
  console.log('Saved: stage6_2_footy_front_emblem_match.png');

  // Central circle overview of football pitch
  await page.evaluate(() => {
    const mv = window.app.game.view;
    if (mv && mv.rig) {
      mv.rig.update = function() {
        this.cam.position = [0, 14.0, 12.0];
        this.cam.target = [0, 0, 0];
        this.cam.update();
      };
    }
  });
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'stage6_2_footy_pitch_center_emblem.png') });
  console.log('Saved: stage6_2_footy_pitch_center_emblem.png');

  // --- 4. BASKETBALL MATCH: THIRD-PERSON CAMERA & OFFICIAL EMBLEM ---
  console.log('[5/7] Launching Basketball Match (Third-Person Follow & Court Center Emblem)...');
  await page.goto('http://127.0.0.1:8099/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));

  await page.evaluate(() => {
    if (window.app && window.app.store) {
      window.app.store.update(d => {
        d.selectedTeam = 'hoops';
        d.selectedCharacter = 'hoops';
        d.teamChosen = true;
      });
    }
    document.querySelectorAll('.fvh-onboarding-overlay, .fvh-modal-overlay').forEach(el => el.remove());
    window.app.launch({ mode: 'hoops', difficulty: 'easy', minutes: 2, char: 'hoops', arenaId: 'std_hoops_street' }, false);
  });
  await new Promise(r => setTimeout(r, 2200));

  // Regular kickoff third-person camera behind hoops player
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'stage6_2_hoops_match_camera.png') });
  console.log('Saved: stage6_2_hoops_match_camera.png');

  // Front view of Hoops athlete showing official chest emblem in-match
  await page.evaluate(() => {
    const mv = window.app.game.view;
    const human = window.app.game.sim.human;
    if (mv && mv.rig && human) {
      mv.rig.update = function() {
        this.cam.position = [human.x, 1.85, human.z - 3.2];
        this.cam.target = [human.x, 1.35, human.z];
        this.cam.update();
      };
    }
  });
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'stage6_2_hoops_front_emblem_match.png') });
  console.log('Saved: stage6_2_hoops_front_emblem_match.png');

  // Basketball court center jump circle overview
  await page.evaluate(() => {
    const mv = window.app.game.view;
    if (mv && mv.rig) {
      mv.rig.update = function() {
        this.cam.position = [0, 9.5, 7.0];
        this.cam.target = [0, 0, 0];
        this.cam.update();
      };
    }
  });
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'stage6_2_hoops_court_center_emblem.png') });
  console.log('Saved: stage6_2_hoops_court_center_emblem.png');

  // Action approach towards basket
  await page.goto('http://127.0.0.1:8099/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.evaluate(() => {
    document.querySelectorAll('.fvh-onboarding-overlay, .fvh-modal-overlay').forEach(el => el.remove());
    window.app.launch({ mode: 'hoops', difficulty: 'easy', minutes: 2, char: 'hoops', arenaId: 'std_hoops_street' }, false);
  });
  await new Promise(r => setTimeout(r, 1800));
  await page.evaluate(() => {
    const sim = window.app.game.sim;
    if (sim && sim.human) {
      sim.human.x = 0;
      sim.human.z = -4.5;
      sim.human.vz = -5.0;
    }
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'stage6_2_hoops_basket_approach.png') });
  console.log('Saved: stage6_2_hoops_basket_approach.png');

  // --- 5. MOBILE VIEWPORT TESTS (360x800, 390x844, 430x932) ---
  console.log('[6/7] Testing Viewports (360x800, 390x844, 430x932)...');
  await page.setViewport({ width: 360, height: 800, deviceScaleFactor: 2 });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'stage6_2_viewport_360x800.png') });
  console.log('Saved: stage6_2_viewport_360x800.png');

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'stage6_2_viewport_390x844.png') });
  console.log('Saved: stage6_2_viewport_390x844.png');

  await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 2 });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'stage6_2_viewport_430x932.png') });
  console.log('Saved: stage6_2_viewport_430x932.png');

  console.log('[7/7] All Stage 6.2 Perfect Evidence Screenshots Captured Successfully!');
  await browser.close();
}

captureAll().catch(err => {
  console.error('Error during captureAll:', err);
  process.exit(1);
});
