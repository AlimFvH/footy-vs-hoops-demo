const path = require('path');
const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const ARTIFACT_DIR = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--use-angle=swiftshader']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 800, deviceScaleFactor: 1 });

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err));
  page.on('response', res => {
    if (res.status() >= 400) console.log('HTTP ' + res.status() + ':', res.url());
  });

  await page.goto('http://localhost:8099/test_glb_direct.html', { waitUntil: 'networkidle0', timeout: 15000 });
  await page.waitForFunction(() => window.__TEST_READY__ || window.__TEST_ERROR__, { timeout: 10000 });

  await new Promise(r => setTimeout(r, 1000));

  const shotPath = path.join(ARTIFACT_DIR, 'test_hoops_raw_render.png');
  await page.screenshot({ path: shotPath });
  console.log('Saved screenshot to:', shotPath);

  await browser.close();
}

main().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
