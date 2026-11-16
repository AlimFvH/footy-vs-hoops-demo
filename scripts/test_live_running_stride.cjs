const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const ARTIFACT_DIR = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function testRunningStride() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1.5 });

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

  page.on('console', msg => console.log('[Browser]', msg.text()));
  page.on('pageerror', err => console.error('[Browser Error]', err));

  console.log('Navigating to game...');
  await page.goto('http://127.0.0.1:8099/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // Dismiss start modal
  await page.evaluate(() => {
    const modalBtn = document.querySelector('.fvh-team-modal button, .fvh-choice-btn, .btn.primary');
    if (modalBtn) modalBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // Launch Footy Match with skipCountdown
  console.log('Launching Footy Match...');
  await page.evaluate(() => {
    window.app.launch({
      mode: 'footy',
      difficulty: 'easy',
      minutes: 2,
      char: 'footy',
      arenaId: 'std_footy_classic',
      skipCountdown: true
    }, false);
  });

  // Wait 1.5s for game simulation to start and load GLB
  await new Promise(r => setTimeout(r, 1500));

  // Check state
  const stateInfo = await page.evaluate(() => {
    const game = window.app.game;
    const sim = game ? game.sim : null;
    const human = sim ? sim.human : null;
    return {
      phase: sim ? sim.phase : 'none',
      humanPos: human ? { x: human.x, z: human.z, vx: human.vx, vz: human.vz } : null,
      glbMode: window.CharactersGLB ? window.CharactersGLB.mode : null
    };
  });
  console.log('Initial Game State:', JSON.stringify(stateInfo));

  // Hold KeyW to run forward
  console.log('Pressing KeyW...');
  await page.keyboard.down('KeyW');
  await new Promise(r => setTimeout(r, 600));

  // Capture running stride
  const runPath1 = path.join(ARTIFACT_DIR, 'live_match_3d_stride_wide.png');
  await page.screenshot({ path: runPath1 });
  console.log('Saved:', runPath1);

  // Position camera closer to athlete to inspect 3D fidelity and stride
  await page.evaluate(() => {
    const game = window.app.game;
    if (game && game.view && game.view.cam) {
      const h = game.sim.human;
      // Camera directly tracking close behind-angle
      game.view.cam.position = [h.x - 1.5, 2.2, h.z + 4.5];
      game.view.cam.target = [h.x, 1.1, h.z];
      game.view.cam.update();
    }
  });
  await new Promise(r => setTimeout(r, 200));

  const runPath2 = path.join(ARTIFACT_DIR, 'live_match_3d_stride_closeup.png');
  await page.screenshot({ path: runPath2 });
  console.log('Saved:', runPath2);

  // Release KeyW and hold KeyD + Kick
  await page.keyboard.up('KeyW');
  await page.keyboard.down('KeyD');
  await page.keyboard.down('Space');
  await new Promise(r => setTimeout(r, 300));

  const kickPath = path.join(ARTIFACT_DIR, 'live_match_3d_kick_closeup.png');
  await page.screenshot({ path: kickPath });
  console.log('Saved:', kickPath);

  await page.keyboard.up('KeyD');
  await page.keyboard.up('Space');

  await browser.close();
  console.log('All tests completed successfully!');
}

testRunningStride().catch(err => {
  console.error(err);
  process.exit(1);
});
