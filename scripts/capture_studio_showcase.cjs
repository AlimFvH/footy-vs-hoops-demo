const path = require('path');
const fs = require('fs');
let puppeteer;
try {
  puppeteer = require('puppeteer-core');
} catch (e) {
  puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
}

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const ARTIFACT_DIR = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function main() {
  console.log('=== Capturing 3D Character Studio Showcase ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--use-angle=swiftshader']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

  page.on('console', msg => console.log('STUDIO LOG:', msg.text()));
  page.on('pageerror', err => console.error('STUDIO PAGE ERROR:', err));

  console.log('Navigating to http://localhost:8099/character_studio.html ...');
  await page.goto('http://localhost:8099/character_studio.html', { waitUntil: 'networkidle0', timeout: 15000 });

  await page.waitForFunction(() => window.__STUDIO__ && window.__STUDIO__.ready, { timeout: 10000 });
  console.log('✓ Studio initialized and ready.');

  // Helper to wait ms
  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  // 1. FOOTY #10 — Front View
  await page.evaluate(() => {
    window.__STUDIO__.selectChar('footy');
    window.__STUDIO__.setPresetAngle(0);
    window.__STUDIO__.zoomTarget('full');
  });
  await wait(800);
  const p1 = path.join(ARTIFACT_DIR, 'studio_01_footy_front.png');
  await page.screenshot({ path: p1 });
  console.log('Saved:', p1);

  // 2. FOOTY #10 — 3/4 Hero View
  await page.evaluate(() => {
    window.__STUDIO__.setPresetAngle(0.65);
  });
  await wait(800);
  const p2 = path.join(ARTIFACT_DIR, 'studio_02_footy_three_quarter.png');
  await page.screenshot({ path: p2 });
  console.log('Saved:', p2);

  // 3. FOOTY #10 — Back View
  await page.evaluate(() => {
    window.__STUDIO__.setPresetAngle(Math.PI);
  });
  await wait(800);
  const p3 = path.join(ARTIFACT_DIR, 'studio_03_footy_back.png');
  await page.screenshot({ path: p3 });
  console.log('Saved:', p3);

  // 4. FOOTY #10 — Face Close-Up
  await page.evaluate(() => {
    window.__STUDIO__.setPresetAngle(0.20);
    window.__STUDIO__.zoomTarget('face');
  });
  await wait(800);
  const p4 = path.join(ARTIFACT_DIR, 'studio_04_footy_face.png');
  await page.screenshot({ path: p4 });
  console.log('Saved:', p4);

  // 5. HOOPS #23 — Front View
  await page.evaluate(() => {
    window.__STUDIO__.selectChar('hoops');
    window.__STUDIO__.setPresetAngle(0);
    window.__STUDIO__.zoomTarget('full');
  });
  await wait(800);
  const p5 = path.join(ARTIFACT_DIR, 'studio_05_hoops_front.png');
  await page.screenshot({ path: p5 });
  console.log('Saved:', p5);

  // 6. HOOPS #23 — 3/4 Hero View
  await page.evaluate(() => {
    window.__STUDIO__.setPresetAngle(0.65);
  });
  await wait(800);
  const p6 = path.join(ARTIFACT_DIR, 'studio_06_hoops_three_quarter.png');
  await page.screenshot({ path: p6 });
  console.log('Saved:', p6);

  // 7. HOOPS #23 — Back View
  await page.evaluate(() => {
    window.__STUDIO__.setPresetAngle(Math.PI);
  });
  await wait(800);
  const p7 = path.join(ARTIFACT_DIR, 'studio_07_hoops_back.png');
  await page.screenshot({ path: p7 });
  console.log('Saved:', p7);

  // 8. HOOPS #23 — Face Close-Up
  await page.evaluate(() => {
    window.__STUDIO__.setPresetAngle(0.20);
    window.__STUDIO__.zoomTarget('face');
  });
  await wait(800);
  const p8 = path.join(ARTIFACT_DIR, 'studio_08_hoops_face.png');
  await page.screenshot({ path: p8 });
  console.log('Saved:', p8);

  // 9. KEEPER #1 — Front View
  await page.evaluate(() => {
    window.__STUDIO__.selectChar('keeper');
    window.__STUDIO__.setPresetAngle(0);
    window.__STUDIO__.zoomTarget('full');
  });
  await wait(800);
  const p9 = path.join(ARTIFACT_DIR, 'studio_09_keeper_front.png');
  await page.screenshot({ path: p9 });
  console.log('Saved:', p9);

  // 10. KEEPER #1 — 3/4 Hero View
  await page.evaluate(() => {
    window.__STUDIO__.setPresetAngle(0.65);
  });
  await wait(800);
  const p10 = path.join(ARTIFACT_DIR, 'studio_10_keeper_three_quarter.png');
  await page.screenshot({ path: p10 });
  console.log('Saved:', p10);

  await browser.close();
  console.log('=== All 3D Studio Renders Captured Successfully! ===');
}

main().catch(err => {
  console.error('Fatal studio capture error:', err);
  process.exit(1);
});
