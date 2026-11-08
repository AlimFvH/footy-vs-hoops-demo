const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const ARTIFACT_DIR = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function capture() {
  console.log('Starting Wardrobe & Turnaround Capture...');
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

  // Navigate to root
  await page.goto('http://127.0.0.1:8099/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // Initialize and bypass onboarding modal
  await page.evaluate(() => {
    localStorage.setItem('fvh_selected_team', 'footy');
    localStorage.setItem('fvh_team_chosen', 'true');
    localStorage.setItem('fvh_onboarded', 'true');
    const modal = document.querySelector('.fvh-onboarding-overlay, .fvh-modal-overlay');
    if (modal) modal.remove();
    if (window.app && window.app.selectTeam) window.app.selectTeam('footy');
  });
  await new Promise(r => setTimeout(r, 600));

  // 1. Open FOOTY Locker
  console.log('[1/4] Capturing Footy Wardrobe Locker with Official Emblem...');
  await page.evaluate(() => {
    if (window.app && window.app.openCharacterLocker) {
      window.app.openCharacterLocker('footy');
    }
  });
  await new Promise(r => setTimeout(r, 1200));
  const footyLockerPath = path.join(ARTIFACT_DIR, 'stage6_2_wardrobe_footy_emblem.png');
  await page.screenshot({ path: footyLockerPath });
  console.log('Saved:', footyLockerPath);

  // 2. Open HOOPS Locker
  console.log('[2/4] Capturing Hoops Wardrobe Locker with Official Emblem...');
  await page.evaluate(() => {
    if (window.app && window.app.openCharacterLocker) {
      window.app.openCharacterLocker('hoops');
    }
  });
  await new Promise(r => setTimeout(r, 1200));
  const hoopsLockerPath = path.join(ARTIFACT_DIR, 'stage6_2_wardrobe_hoops_emblem.png');
  await page.screenshot({ path: hoopsLockerPath });
  console.log('Saved:', hoopsLockerPath);

  // 3. Recapture Third-Person Basketball Match with Refined Camera Distance
  console.log('[3/4] Capturing Refined Basketball Third-Person Follow Camera & Center Emblem...');
  await page.evaluate(() => {
    const modal = document.querySelector('.fvh-modal-overlay, .fvh-locker-modal');
    if (modal) modal.remove();
    window.app.launch({ mode: 'hoops', difficulty: 'easy', minutes: 2, char: 'hoops', arenaId: 'std_hoops_street' }, false);
  });
  await new Promise(r => setTimeout(r, 2200));
  const hoopsRefinedPath = path.join(ARTIFACT_DIR, 'stage6_2_hoops_match_camera.png');
  await page.screenshot({ path: hoopsRefinedPath });
  console.log('Saved:', hoopsRefinedPath);

  // 4. Recapture Third-Person Football Match with Refined Camera Distance
  console.log('[4/4] Capturing Refined Football Third-Person Follow Camera & Center Emblem...');
  await page.evaluate(() => {
    window.app.launch({ mode: 'footy', difficulty: 'easy', minutes: 2, char: 'footy', arenaId: 'std_footy_classic' }, false);
  });
  await new Promise(r => setTimeout(r, 2200));
  const footyRefinedPath = path.join(ARTIFACT_DIR, 'stage6_2_footy_match_camera.png');
  await page.screenshot({ path: footyRefinedPath });
  console.log('Saved:', footyRefinedPath);

  // 5. Front-Facing 3D Athlete Turnaround (showing official emblem on chest in 3D WebGL)
  console.log('[5/5] Capturing Front-Facing 3D Athlete with Official Chest Emblem...');
  await page.evaluate(() => {
    // Rotate character 180 deg to face camera
    const mv = window.app.game ? window.app.game.view : null;
    const glbInst = window.CharactersGLB ? window.CharactersGLB.instances.get(mv) : null;
    if (glbInst && glbInst.length > 0) {
      glbInst[0].yaw = Math.PI; // Face directly toward camera!
    }
  });
  await new Promise(r => setTimeout(r, 600));
  const frontEmblemPath = path.join(ARTIFACT_DIR, 'stage6_2_front_athlete_emblem_3d.png');
  await page.screenshot({ path: frontEmblemPath });
  console.log('Saved:', frontEmblemPath);

  await browser.close();
  console.log('All Wardrobe & Turnaround captures complete!');
}

capture().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
