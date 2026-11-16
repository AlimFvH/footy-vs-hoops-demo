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
  await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 1 });

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err));

  await page.goto('http://localhost:8099/test_face_and_uniform.html', { waitUntil: 'networkidle0', timeout: 15000 });
  await page.waitForFunction(() => window.__TEST_READY__, { timeout: 10000 });

  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  // 1. Full Body Hero View
  await page.evaluate(() => window.setCameraView('full'));
  await wait(500);
  const pFull = path.join(ARTIFACT_DIR, 'refined_01_hoops_full.png');
  await page.screenshot({ path: pFull });
  console.log('Saved:', pFull);

  // 2. Face Close-Up
  await page.evaluate(() => window.setCameraView('face'));
  await wait(500);
  const pFace = path.join(ARTIFACT_DIR, 'refined_02_hoops_face.png');
  await page.screenshot({ path: pFace });
  console.log('Saved:', pFace);

  // 3. Uniform Close-Up
  await page.evaluate(() => window.setCameraView('uniform'));
  await wait(500);
  const pUniform = path.join(ARTIFACT_DIR, 'refined_03_hoops_uniform.png');
  await page.screenshot({ path: pUniform });
  console.log('Saved:', pUniform);

  await browser.close();
  console.log('✓ All refinement renders captured!');
}

main().catch(err => {
  console.error('Fatal capture error:', err);
  process.exit(1);
});
