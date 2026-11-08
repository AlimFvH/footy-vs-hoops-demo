const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const ARTIFACT_DIR = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function run() {
  console.log('Launching headless Chrome for Stage 6.2 Master Verification Capture...');
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

  console.log('[1/8] Loading game application...');
  await page.goto('http://127.0.0.1:8099/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  // --- A. BASKETBALL MATCH & BRANDING ---
  console.log('[2/8] Launching Basketball Match (Third-Person Camera & Court Branding)...');
  await page.evaluate(() => {
    window.app.launch({ mode: 'hoops', difficulty: 'easy', minutes: 2, char: 'hoops', arenaId: 'std_hoops_street' }, false);
  });
  await new Promise(r => setTimeout(r, 2000));

  // 1. In-Match Third Person Follow Camera at Kickoff (with zero stanchion occlusion)
  const hoopsMatchShot = path.join(ARTIFACT_DIR, 'stage6_2_hoops_match_camera.png');
  await page.screenshot({ path: hoopsMatchShot });
  console.log('Saved:', hoopsMatchShot);

  // 2. Front View in Basketball Match showing Uniform Emblem on Chest
  await page.evaluate(() => {
    const mv = window.app.game.view;
    const human = window.app.game.sim.human;
    if (mv && mv.rig && human) {
      mv.rig.cam.position = [human.x, 2.1, human.z - 3.2];
      mv.rig.cam.target = [human.x, 1.45, human.z];
      mv.rig.cam.update();
    }
  });
  await new Promise(r => setTimeout(r, 200));
  const hoopsFrontShot = path.join(ARTIFACT_DIR, 'stage6_2_hoops_front_emblem_match.png');
  await page.screenshot({ path: hoopsFrontShot });
  console.log('Saved:', hoopsFrontShot);

  // 3. High View of Basketball Court Center Jump Circle Official Emblem
  await page.evaluate(() => {
    const mv = window.app.game.view;
    if (mv && mv.rig) {
      mv.rig.cam.position = [0, 8.5, 5.2];
      mv.rig.cam.target = [0, 0, 0];
      mv.rig.cam.update();
    }
  });
  await new Promise(r => setTimeout(r, 200));
  const hoopsCenterCourtShot = path.join(ARTIFACT_DIR, 'stage6_2_hoops_court_center_emblem.png');
  await page.screenshot({ path: hoopsCenterCourtShot });
  console.log('Saved:', hoopsCenterCourtShot);

  // 4. Basketball Basket Approach View
  await page.evaluate(() => {
    const sim = window.app.game.sim;
    if (sim && sim.human) {
      sim.human.x = 0;
      sim.human.z = -5.0;
      sim.human.vz = -5.5;
    }
  });
  await new Promise(r => setTimeout(r, 400));
  const hoopsApproachShot = path.join(ARTIFACT_DIR, 'stage6_2_hoops_basket_approach.png');
  await page.screenshot({ path: hoopsApproachShot });
  console.log('Saved:', hoopsApproachShot);

  // --- B. FOOTBALL MATCH & BRANDING ---
  console.log('[3/8] Launching Football Match (Third-Person Camera & Pitch Branding)...');
  await page.goto('http://127.0.0.1:8099/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
    window.app.launch({ mode: 'footy', difficulty: 'easy', minutes: 2, char: 'footy', arenaId: 'std_footy_classic' }, false);
  });
  await new Promise(r => setTimeout(r, 2000));

  // 5. In-Match Football Third-Person Follow Camera & Pitch Center Circle Emblem
  const footyMatchShot = path.join(ARTIFACT_DIR, 'stage6_2_footy_match_camera.png');
  await page.screenshot({ path: footyMatchShot });
  console.log('Saved:', footyMatchShot);

  // 6. Front View in Football Match showing Uniform Emblem on Chest
  await page.evaluate(() => {
    const mv = window.app.game.view;
    const human = window.app.game.sim.human;
    if (mv && mv.rig && human) {
      mv.rig.cam.position = [human.x, 2.0, human.z - 3.2];
      mv.rig.cam.target = [human.x, 1.45, human.z];
      mv.rig.cam.update();
    }
  });
  await new Promise(r => setTimeout(r, 200));
  const footyFrontShot = path.join(ARTIFACT_DIR, 'stage6_2_footy_front_emblem_match.png');
  await page.screenshot({ path: footyFrontShot });
  console.log('Saved:', footyFrontShot);

  // 7. Football Goal Approach View
  await page.evaluate(() => {
    const sim = window.app.game.sim;
    if (sim && sim.human) {
      sim.human.x = 1.5;
      sim.human.z = -12.0;
      sim.human.vx = 0.5;
      sim.human.vz = -5.0;
    }
  });
  await new Promise(r => setTimeout(r, 400));
  const footyGoalApproachShot = path.join(ARTIFACT_DIR, 'stage6_2_footy_goal_approach.png');
  await page.screenshot({ path: footyGoalApproachShot });
  console.log('Saved:', footyGoalApproachShot);

  // --- C. WARDROBE UNIFORMS WITH OFFICIAL EMBLEM ---
  console.log('[4/8] Capturing Wardrobe Uniforms with Official Emblem...');
  await page.goto('http://127.0.0.1:8099/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
    if (window.openCharacterLocker) window.openCharacterLocker('footy');
    else if (window.openWardrobePage) window.openWardrobePage();
  });
  await new Promise(r => setTimeout(r, 800));

  const wardrobeFootyShot = path.join(ARTIFACT_DIR, 'stage6_2_wardrobe_footy_emblem.png');
  await page.screenshot({ path: wardrobeFootyShot });
  console.log('Saved:', wardrobeFootyShot);

  await page.evaluate(() => {
    if (window.openCharacterLocker) window.openCharacterLocker('hoops');
  });
  await new Promise(r => setTimeout(r, 800));

  const wardrobeHoopsShot = path.join(ARTIFACT_DIR, 'stage6_2_wardrobe_hoops_emblem.png');
  await page.screenshot({ path: wardrobeHoopsShot });
  console.log('Saved:', wardrobeHoopsShot);

  // --- D. MOBILE VIEWPORT TESTS (360x800, 390x844, 430x932) ---
  console.log('[5/8] Testing Mobile Viewport 360x800...');
  await page.setViewport({ width: 360, height: 800, deviceScaleFactor: 2 });
  await page.evaluate(() => {
    window.app.launch({ mode: 'hoops', difficulty: 'easy', minutes: 2, char: 'hoops', arenaId: 'std_hoops_street' }, false);
  });
  await new Promise(r => setTimeout(r, 1500));
  const mobile360Shot = path.join(ARTIFACT_DIR, 'stage6_2_viewport_360x800.png');
  await page.screenshot({ path: mobile360Shot });
  console.log('Saved:', mobile360Shot);

  console.log('[6/8] Testing Mobile Viewport 390x844 (iPhone standard)...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'stage6_2_viewport_390x844.png') });

  console.log('[7/8] Testing Mobile Viewport 430x932 (iPhone Pro Max)...');
  await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 2 });
  await page.evaluate(() => {
    window.app.launch({ mode: 'footy', difficulty: 'easy', minutes: 2, char: 'footy', arenaId: 'std_footy_classic' }, false);
  });
  await new Promise(r => setTimeout(r, 1500));
  const mobile430Shot = path.join(ARTIFACT_DIR, 'stage6_2_viewport_430x932.png');
  await page.screenshot({ path: mobile430Shot });
  console.log('Saved:', mobile430Shot);

  console.log('[8/8] All Master Evidence Screenshots Captured Successfully!');
  await browser.close();
}

run().catch(err => {
  console.error('Error during master evidence capture:', err);
  process.exit(1);
});
