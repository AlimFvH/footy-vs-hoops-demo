const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const ARTIFACT_DIR = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function runEvidenceCapture() {
  console.log('Launching headless Chrome for Stage 6.2 Evidence Capture...');
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

  console.log('[1/7] Loading game...');
  await page.goto('http://127.0.0.1:8099/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  // 1. Basketball Arena Center Court with Official Emblem & Third-Person Camera
  console.log('[2/7] Launching Basketball Match (Third-Person Follow & Center Emblem)...');
  await page.evaluate(() => {
    window.app.launch({ mode: 'hoops', difficulty: 'easy', minutes: 2, char: 'hoops', arenaId: 'std_hoops_street' }, false);
  });
  await new Promise(r => setTimeout(r, 2000));

  const hoopsMatchShot = path.join(ARTIFACT_DIR, 'stage6_2_hoops_match_camera.png');
  await page.screenshot({ path: hoopsMatchShot });
  console.log('Saved:', hoopsMatchShot);

  // Take an action shot during movement / dribble approach
  await page.evaluate(() => {
    // Simulate player moving forward towards basket
    const sim = window.app.game.sim;
    if (sim && sim.human) {
      sim.human.x = 0;
      sim.human.z = -4.0;
      sim.human.vz = -5.0;
    }
  });
  await new Promise(r => setTimeout(r, 500));
  const hoopsApproachShot = path.join(ARTIFACT_DIR, 'stage6_2_hoops_basket_approach.png');
  await page.screenshot({ path: hoopsApproachShot });
  console.log('Saved:', hoopsApproachShot);

  // Return to menu
  await page.goto('http://127.0.0.1:8099/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // 2. Football Arena Center Pitch with Official Emblem & Third-Person Camera
  console.log('[3/7] Launching Football Match (Third-Person Follow & Center Emblem)...');
  await page.evaluate(() => {
    window.app.launch({ mode: 'footy', difficulty: 'easy', minutes: 2, char: 'footy', arenaId: 'std_footy_classic' }, false);
  });
  await new Promise(r => setTimeout(r, 2000));

  const footyMatchShot = path.join(ARTIFACT_DIR, 'stage6_2_footy_match_camera.png');
  await page.screenshot({ path: footyMatchShot });
  console.log('Saved:', footyMatchShot);

  // Take an action shot approaching opponent goal
  await page.evaluate(() => {
    const sim = window.app.game.sim;
    if (sim && sim.human) {
      sim.human.x = 2.0;
      sim.human.z = -12.0;
      sim.human.vx = 1.0;
      sim.human.vz = -6.0;
    }
  });
  await new Promise(r => setTimeout(r, 500));
  const footyGoalApproachShot = path.join(ARTIFACT_DIR, 'stage6_2_footy_goal_approach.png');
  await page.screenshot({ path: footyGoalApproachShot });
  console.log('Saved:', footyGoalApproachShot);

  // 3. Wardrobe Uniform Previews with Official Emblem
  console.log('[4/7] Capturing Wardrobe Uniforms with Official Emblem...');
  await page.goto('http://127.0.0.1:8099/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // Open Wardrobe / Locker
  await page.evaluate(() => {
    if (window.openWardrobePage) window.openWardrobePage();
    else if (window.openCharacterLocker) window.openCharacterLocker('footy');
  });
  await new Promise(r => setTimeout(r, 800));

  const wardrobeFootyShot = path.join(ARTIFACT_DIR, 'stage6_2_wardrobe_footy_emblem.png');
  await page.screenshot({ path: wardrobeFootyShot });
  console.log('Saved:', wardrobeFootyShot);

  // Switch to Hoops Locker
  await page.evaluate(() => {
    if (window.openCharacterLocker) window.openCharacterLocker('hoops');
  });
  await new Promise(r => setTimeout(r, 800));

  const wardrobeHoopsShot = path.join(ARTIFACT_DIR, 'stage6_2_wardrobe_hoops_emblem.png');
  await page.screenshot({ path: wardrobeHoopsShot });
  console.log('Saved:', wardrobeHoopsShot);

  // 4. Viewport Responsiveness: 360x800 and 430x932
  console.log('[5/7] Testing Mobile Viewport 360x800...');
  await page.setViewport({ width: 360, height: 800, deviceScaleFactor: 2 });
  await page.evaluate(() => {
    window.app.launch({ mode: 'hoops', difficulty: 'easy', minutes: 2, char: 'hoops', arenaId: 'std_hoops_street' }, false);
  });
  await new Promise(r => setTimeout(r, 1500));
  const mobile360Shot = path.join(ARTIFACT_DIR, 'stage6_2_viewport_360x800.png');
  await page.screenshot({ path: mobile360Shot });
  console.log('Saved:', mobile360Shot);

  console.log('[6/7] Testing Mobile Viewport 430x932...');
  await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 2 });
  await page.evaluate(() => {
    window.app.launch({ mode: 'footy', difficulty: 'easy', minutes: 2, char: 'footy', arenaId: 'std_footy_classic' }, false);
  });
  await new Promise(r => setTimeout(r, 1500));
  const mobile430Shot = path.join(ARTIFACT_DIR, 'stage6_2_viewport_430x932.png');
  await page.screenshot({ path: mobile430Shot });
  console.log('Saved:', mobile430Shot);

  console.log('[7/7] All Evidence Screenshots Captured Successfully!');
  await browser.close();
}

runEvidenceCapture().catch(e => {
  console.error('Error in evidence capture:', e);
  process.exit(1);
});
