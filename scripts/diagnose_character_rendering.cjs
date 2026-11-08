const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

async function diagnose() {
  console.log('=== Character Rendering Diagnostic ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });

  const logs = [];
  page.on('console', msg => {
    logs.push(`[${msg.type().toUpperCase()}] ${msg.text()}`);
  });
  page.on('pageerror', err => {
    logs.push(`[PAGE ERROR] ${err.message}\n${err.stack}`);
  });
  page.on('requestfailed', req => {
    logs.push(`[REQ FAILED] ${req.url()} - ${req.failure() ? req.failure().errorText : 'unknown'}`);
  });

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

  console.log('Loading index.html...');
  await page.goto('http://127.0.0.1:8099/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  console.log('Launching Hoops match...');
  await page.evaluate(() => {
    document.querySelectorAll('.fvh-onboarding-overlay, .fvh-modal-overlay').forEach(el => el.remove());
    window.app.launch({ mode: 'hoops', difficulty: 'easy', minutes: 2, char: 'hoops', arenaId: 'std_hoops_street' }, false);
  });
  await new Promise(r => setTimeout(r, 2000));

  const hoopsDiagnosis = await page.evaluate(() => {
    const mv = window.app.game ? window.app.game.view : null;
    const sim = window.app.game ? window.app.game.sim : null;
    const glbInsts = (window.CharactersGLB && mv) ? window.CharactersGLB.instances.get(mv) : null;

    return {
      mvExists: !!mv,
      charsCount: mv ? mv.chars.length : 0,
      chars: mv ? mv.chars.map((c, i) => ({
        index: i,
        sport: c.sport,
        pivotVisible: c.pivot ? c.pivot.visible : null,
        rootChildren: c.root ? c.root.children.length : null,
        pivotChildren: c.pivot ? c.pivot.children.length : null,
        scale: c.pivot ? c.pivot.scale : null
      })) : [],
      glbEnabled: window.CharactersGLB ? window.CharactersGLB.enabled : null,
      glbInstancesCount: glbInsts ? glbInsts.length : 0,
      glbInstances: glbInsts ? glbInsts.map((inst, i) => ({
        index: i,
        modelUrl: inst.modelUrl,
        loaded: inst.loaded,
        failed: inst.failed,
        visible: inst.visible,
        hasModel: !!inst.model,
        hasSkinTexture: !!inst.customTexture,
        charRefPivotVisible: inst.charRef && inst.charRef.pivot ? inst.charRef.pivot.visible : null
      })) : []
    };
  });

  console.log('Hoops Diagnosis:', JSON.stringify(hoopsDiagnosis, null, 2));

  console.log('\n--- Console Logs ---');
  logs.forEach(l => console.log(l));

  await browser.close();
}

diagnose().catch(err => {
  console.error('Diagnostic error:', err);
  process.exit(1);
});
