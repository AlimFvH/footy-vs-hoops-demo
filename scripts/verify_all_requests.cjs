const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const path = require('path');
const ARTIFACT_DIR = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function testAll() {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 440, height: 860, deviceScaleFactor: 2 });

  // 1. Wardrobe (Footy) - Check no character toggle
  console.log('1. Checking Wardrobe Footy...');
  await page.goto('http://localhost:8099/?char=footy&page=characters', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  const hasCharToggle = await page.evaluate(() => {
    return Boolean(document.querySelector('.fvh-wardrobe-char-toggle'));
  });
  console.log('Wardrobe character toggle present:', hasCharToggle);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_task_01_wardrobe_footy.png') });

  // 2. Shop - Check no stars balance
  console.log('2. Checking Shop...');
  await page.goto('http://localhost:8099/?page=shop', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  const starsPillPresent = await page.evaluate(() => {
    return Boolean(document.querySelector('.fvh-wallet-pill.stars'));
  });
  console.log('Stars wallet pill present:', starsPillPresent);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_task_02_shop.png') });

  // 3. Football Match HUD - Check centered pause & mute under scoreboard
  console.log('3. Checking Football Match HUD...');
  await page.goto('http://localhost:8099/?launch=footy', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3500));
  const hudPositions = await page.evaluate(() => {
    const sb = document.querySelector('.scoreboard');
    const ctrls = document.querySelector('.hud-top-ctrls');
    if (!sb || !ctrls) return null;
    const sbR = sb.getBoundingClientRect();
    const ctrlsR = ctrls.getBoundingClientRect();
    return {
      scoreboard: { top: sbR.top, bottom: sbR.bottom, left: sbR.left, right: sbR.right, cx: (sbR.left + sbR.right) / 2 },
      ctrls: { top: ctrlsR.top, bottom: ctrlsR.bottom, left: ctrlsR.left, right: ctrlsR.right, cx: (ctrlsR.left + ctrlsR.right) / 2 },
      isUnder: ctrlsR.top >= sbR.bottom - 4,
      isCentered: Math.abs(((ctrlsR.left + ctrlsR.right)/2) - ((sbR.left + sbR.right)/2)) < 30
    };
  });
  console.log('HUD Positions:', hudPositions);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_task_03_footy_hud.png') });

  // 4. Basketball Match HUD
  console.log('4. Checking Basketball Match HUD...');
  await page.goto('http://localhost:8099/?launch=hoops', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3500));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_task_04_hoops_hud.png') });

  // 5. Play vs Friend / Private Room Lobby
  console.log('5. Checking Private Room Lobby...');
  await page.goto('http://localhost:8099/?page=mode&privateroom=1', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_task_05_private_room.png') });

  // 6. Quests & Leaderboard
  console.log('6. Checking Quests...');
  await page.goto('http://localhost:8099/?page=quests', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_task_06_quests.png') });

  console.log('7. Checking Leaderboard...');
  await page.goto('http://localhost:8099/?page=leaderboard', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_task_07_leaderboard.png') });

  await browser.close();
  console.log('All comprehensive verifications completed!');
}

testAll().catch(console.error);
