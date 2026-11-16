const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const fs = require('fs');
const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

async function testScreens() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 2 });
  await page.goto('http://127.0.0.1:8099/index.html');
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({ path: 'verified_hub_screen.png' });
  console.log('Saved verified_hub_screen.png');

  await page.evaluate(() => {
    if (window.app && window.app.pages) {
      window.app.pages.open('wardrobe');
    }
  });

  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'verified_wardrobe_screen.png' });
  console.log('Saved verified_wardrobe_screen.png');

  await browser.close();
}

testScreens().catch(console.error);
