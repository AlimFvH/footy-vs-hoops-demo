const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 }); // Authentic iPhone / mobile Telegram viewport

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

  console.log('[1/4] Navigating to game...');
  await page.goto('http://127.0.0.1:8099/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // --- 1. Basketball Match Capture (HOOPS vs FOOTY) ---
  console.log('[2/4] Launching Basketball Match (std_hoops_street)...');
  await page.evaluate(() => {
    window.app.launch({ mode: 'hoops', difficulty: 'easy', minutes: 2, char: 'hoops', arenaId: 'std_hoops_street' }, false);
  });
  await new Promise(r => setTimeout(r, 2200));

  const hoopsPath = path.join(__dirname, '../match_fortnite_basketball_live.png');
  await page.screenshot({ path: hoopsPath });
  console.log('Saved:', hoopsPath);

  // --- 2. Football Match Capture (FOOTY vs HOOPS) ---
  console.log('[3/4] Launching Football Match (std_footy_classic)...');
  await page.evaluate(() => {
    window.app.launch({ mode: 'footy', difficulty: 'easy', minutes: 2, char: 'footy', arenaId: 'std_footy_classic' }, false);
  });
  await new Promise(r => setTimeout(r, 2200));

  const footyPath = path.join(__dirname, '../match_fortnite_football_live.png');
  await page.screenshot({ path: footyPath });
  console.log('Saved:', footyPath);

  console.log('[4/4] Done!');
  await browser.close();
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
