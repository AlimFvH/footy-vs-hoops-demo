const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const PORT = 8642;

process.env.PORT = String(PORT);
process.env.NODE_ENV = 'development';
process.env.TELEGRAM_BOT_TOKEN = '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ123456789';
const serverApp = require('../server/server.js');

async function runMultiCapture() {
  await new Promise(r => setTimeout(r, 600));
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const testCases = [
    { name: 'footy_skins_ru_390', team: 'footy', slot: 'skins', lang: 'ru', w: 390, h: 844 },
    { name: 'footy_balls_ru_390', team: 'footy', slot: 'balls_footy', lang: 'ru', w: 390, h: 844 },
    { name: 'hoops_skins_ru_390', team: 'hoops', slot: 'skins', lang: 'ru', w: 390, h: 844 },
    { name: 'hoops_balls_ru_390', team: 'hoops', slot: 'balls_hoops', lang: 'ru', w: 390, h: 844 },
    { name: 'footy_skins_en_375', team: 'footy', slot: 'skins', lang: 'en', w: 375, h: 667 },
    { name: 'hoops_skins_en_390', team: 'hoops', slot: 'skins', lang: 'en', w: 390, h: 844 },
    { name: 'desktop_wide_820', team: 'footy', slot: 'skins', lang: 'ru', w: 820, h: 900 }
  ];

  for (const tc of testCases) {
    const page = await browser.newPage();
    await page.setViewport({ width: tc.w, height: tc.h, deviceScaleFactor: 2 });

    const isFooty = tc.team === 'footy';
    await page.evaluateOnNewDocument((tc) => {
      window.Telegram = {
        WebApp: {
          initData: '',
          ready: () => {},
          expand: () => {},
          BackButton: { show: () => {}, hide: () => {}, onClick: () => {} }
        }
      };
      const save = {
        selectedTeam: tc.team,
        selectedCharacter: tc.team,
        teamChosen: true,
        coins: 3500,
        xp: 350,
        language: tc.lang,
        settings: { lang: tc.lang },
        owned: [
          'skin_rookie', 'skin_footy_cyber_strike', 'skin_footy_golden_legend',
          'skin_solar', 'skin_hoops_street_legend', 'skin_hoops_phantom_black',
          'ball_footy_classic', 'ball_footy_inferno', 'ball_footy_golden_elite',
          'ball_hoops_street', 'ball_hoops_molten_fire', 'ball_hoops_cosmic'
        ],
        unseenItems: [tc.team === 'footy' ? 'skin_footy_cyber_strike' : 'skin_hoops_phantom_black'],
        equipped: {
          skin: tc.team === 'footy' ? 'skin_footy_cyber_strike' : 'skin_hoops_street_legend',
          ['skin.' + tc.team]: tc.team === 'footy' ? 'skin_footy_cyber_strike' : 'skin_hoops_street_legend',
          ['ball.' + tc.team]: tc.team === 'footy' ? 'ball_footy_classic' : 'ball_hoops_street'
        }
      };
      localStorage.setItem('fvh.save.v1', JSON.stringify(save));
      localStorage.setItem('fvh_save_v1', JSON.stringify(save));
    }, tc);

    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    await page.evaluate((tc) => {
      const wardrobeBtn = Array.from(document.querySelectorAll('.fvh-nav-item, button')).find(b => b.textContent.includes('ГАРДЕРОБ') || b.textContent.includes('WARDROBE'));
      if (wardrobeBtn) wardrobeBtn.click();
      if (window.App && window.App.showCharacters) {
        window.App.showCharacters(tc.team, tc.slot);
      }
    }, tc);
    await new Promise(r => setTimeout(r, 600));

    // If ball slot requested, ensure the ball slot button in seg is activated
    if (tc.slot.startsWith('balls')) {
      await page.evaluate(() => {
        const segBtns = document.querySelectorAll('.fvh-wardrobe-grid .seg button');
        if (segBtns && segBtns.length > 1) {
          segBtns[1].click();
        }
      });
      await new Promise(r => setTimeout(r, 600));
    }

    const outPath = path.join(__dirname, `${tc.name}.png`);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`Saved screenshot: ${tc.name}.png`);

    // Also copy to artifacts dir
    const artifactPath = path.join('C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3', `${tc.name}.png`);
    try {
      fs.copyFileSync(outPath, artifactPath);
    } catch (e) {}

    await page.close();
  }

  await browser.close();
  console.log('ALL VARIATIONS CAPTURED SUCCESSFULLY!');
  process.exit(0);
}

runMultiCapture().catch(e => {
  console.error(e);
  process.exit(1);
});
