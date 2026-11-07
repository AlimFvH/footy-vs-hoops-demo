const puppeteer = require('puppeteer-core');
const serverApp = require('../server/server.js');
const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

async function test() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.setRequestInterception(true);
  page.on('request', r => {
    if (r.url().includes('telegram.org')) {
      r.respond({ status: 200, contentType: 'application/javascript', body: 'window.Telegram = window.Telegram || { WebApp: {} };' });
    } else r.continue();
  });

  console.log('Navigating to index.html...');
  await page.goto('http://127.0.0.1:8099/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
  await new Promise(r => setTimeout(r, 1500));
  
  console.log('Launching match...');
  await page.evaluate(() => {
    window.app.launch({ mode: 'hoops', difficulty: 'easy', minutes: 2, char: 'hoops', arenaId: 'std_hoops_street' }, false);
  });
  await new Promise(r => setTimeout(r, 2000));

  const status = await page.evaluate(() => {
    const mv = window.app.game.view;
    const list = window.CharactersGLB.instances.get(mv) || [];
    return {
      mvExists: !!mv,
      charsCount: mv.chars.length,
      charPivotsVisible: mv.chars.map(c => c.pivot.visible),
      glbListLength: list.length,
      glbDetails: list.map(inst => ({
        url: inst.modelUrl,
        loaded: inst.loaded,
        failed: inst.failed,
        hasModel: !!inst.model,
        visible: inst.visible,
        charPivotVisible: inst.charRef.pivot ? inst.charRef.pivot.visible : null
      }))
    };
  });
  console.log('Match Character Status:', JSON.stringify(status, null, 2));

  await browser.close();
  process.exit(0);
}
test().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
