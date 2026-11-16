const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');
const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

async function captureLiveMatches() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--window-size=600,1000']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 2 });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.toString()));

  await page.goto('http://127.0.0.1:8099/index.html');
  await new Promise(r => setTimeout(r, 1200));

  // 1. Launch Football Match
  console.log('Launching Footy Match...');
  await page.evaluate(() => {
    window.app.launch({ mode: 'footy', difficulty: 'easy', minutes: 2, char: 'footy', arenaId: 'std_footy_classic' }, false);
  });
  await new Promise(r => setTimeout(r, 2500));

  await page.screenshot({ path: 'scratch/live_footy_match_pixar.png' });
  console.log('✓ Saved scratch/live_footy_match_pixar.png');

  // 2. Launch Basketball Match
  console.log('Launching Hoops Match...');
  await page.evaluate(() => {
    window.app.launch({ mode: 'hoops', difficulty: 'easy', minutes: 2, char: 'hoops', arenaId: 'std_hoops_court' }, false);
  });
  await new Promise(r => setTimeout(r, 2500));

  await page.screenshot({ path: 'scratch/live_hoops_match_pixar.png' });
  console.log('✓ Saved scratch/live_hoops_match_pixar.png');

  await browser.close();
}

captureLiveMatches().catch(console.error);
