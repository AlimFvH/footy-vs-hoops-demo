const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const fs = require('fs');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const ARTIFACT_DIR = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function runComparison() {
  console.log('Comparing Original GLB vs Current Modified GLB...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 1 });
  await page.goto('http://localhost:8099/character_studio.html');
  await new Promise(r => setTimeout(r, 2000));

  // Current Hoops front
  await page.evaluate(() => {
    window.selectChar('hoops');
    window.setPresetAngle(0);
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: `${ARTIFACT_DIR}/current_hoops_compare.png` });

  // Current Hoops face
  await page.evaluate(() => {
    window.zoomTarget('face');
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: `${ARTIFACT_DIR}/current_hoops_face_compare.png` });

  await browser.close();
  console.log('Comparison screenshots saved!');
}

runComparison().catch(console.error);
