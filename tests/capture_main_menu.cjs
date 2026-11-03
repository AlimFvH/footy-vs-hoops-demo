const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const PORT = 8645;

process.env.PORT = String(PORT);
process.env.NODE_ENV = 'test';
process.env.TELEGRAM_BOT_TOKEN = '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ123456789';

const serverApp = require('../server/server.js');

async function capture() {
  await new Promise(r => setTimeout(r, 600));
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  await page.setRequestInterception(true);
  page.on('request', req => {
    if (req.url().includes('telegram.org')) {
      req.respond({ status: 200, contentType: 'application/javascript', body: 'window.Telegram = window.Telegram || { WebApp: {} };' });
    } else {
      req.continue();
    }
  });

  await page.evaluateOnNewDocument(() => {
    window.Telegram = {
      WebApp: {
        initData: '',
        ready: () => {},
        expand: () => {},
        BackButton: { show: () => {}, hide: () => {}, onClick: () => {} }
      }
    };
    const save = {
      selectedTeam: 'footy',
      selectedCharacter: 'footy',
      teamChosen: true,
      coins: 3500,
      xp: 350,
      owned: ['skin_rookie', 'ball_footy_classic'],
      equipped: { skin: 'skin_rookie', 'skin.footy': 'skin_rookie' },
      stats: { played: 10, wins: 8, goals: 24, baskets: 0 }
    };
    localStorage.setItem('fvh.save.v1', JSON.stringify(save));
  });

  await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await new Promise(r => setTimeout(r, 1500));

  const artifactDir = path.join('C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3');
  const screenshotPath = path.join(artifactDir, 'main_screen_topbar_390.png');
  await page.screenshot({ path: screenshotPath });
  console.log('Saved screenshot to:', screenshotPath);

  await page.setViewport({ width: 360, height: 740, deviceScaleFactor: 2 });
  await new Promise(r => setTimeout(r, 400));
  const screenshotPath360 = path.join(artifactDir, 'main_screen_topbar_360.png');
  await page.screenshot({ path: screenshotPath360 });
  console.log('Saved 360 screenshot to:', screenshotPath360);

  // Check element visibility
  const brandInfo = await page.evaluate(() => {
    const brand = document.querySelector('.fvh-topbar-brand');
    const emblem = document.querySelector('.fvh-topbar-brand img, .fvh-topbar-brand .fvh-official-emblem');
    const logoText = document.querySelector('.fvh-topbar-brand .logo-text');
    return {
      brandFound: Boolean(brand),
      emblemFound: Boolean(emblem),
      logoTextFound: Boolean(logoText),
      logoTextVisible: logoText ? window.getComputedStyle(logoText).display !== 'none' : false,
      logoTextContent: logoText ? logoText.textContent.trim() : null,
      logoTextFontSize: logoText ? window.getComputedStyle(logoText).fontSize : null
    };
  });
  console.log('Brand Info 360:', brandInfo);

  await browser.close();
  process.exit(0);
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
