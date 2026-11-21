const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const ARTIFACT_DIR = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 420, height: 860, deviceScaleFactor: 2 });

  await page.setRequestInterception(true);
  page.on('request', req => {
    if (req.url().includes('telegram.org')) {
      req.abort();
    } else {
      req.continue();
    }
  });

  console.log('Navigating to http://localhost:8099...');
  await page.goto('http://localhost:8099', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3000));

  // 1. Home Footy
  await page.evaluate(() => {
    window.App.store.update(d => {
      d.teamChosen = true;
      d.selectedTeam = 'footy';
      d.selectedCharacter = 'footy';
    });
    window.App.showMenu();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_radical_01_home_footy.png') });
  console.log('1. Captured verify_radical_01_home_footy.png');

  // 2. Home Hoops
  await page.evaluate(() => {
    window.App.store.update(d => {
      d.teamChosen = true;
      d.selectedTeam = 'hoops';
      d.selectedCharacter = 'hoops';
    });
    window.App.showMenu();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_radical_02_home_hoops.png') });
  console.log('2. Captured verify_radical_02_home_hoops.png');

  // 3. Mode Select (Arena Showcase)
  await page.evaluate(() => {
    window.App.store.update(d => {
      d.teamChosen = true;
      d.selectedTeam = 'footy';
      d.selectedCharacter = 'footy';
    });
    window.App.showModeSelect();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_radical_03_mode_select.png') });
  console.log('3. Captured verify_radical_03_mode_select.png');

  // 4. Wardrobe Footy (Locker without background)
  await page.evaluate(() => {
    window.App.openCharacterLocker('footy');
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_radical_04_wardrobe_footy.png') });
  console.log('4. Captured verify_radical_04_wardrobe_footy.png');

  // 5. Wardrobe Hoops (Locker without background)
  await page.evaluate(() => {
    window.App.store.update(d => {
      d.selectedTeam = 'hoops';
      d.selectedCharacter = 'hoops';
    });
    window.App.openCharacterLocker('hoops');
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_radical_05_wardrobe_hoops.png') });
  console.log('5. Captured verify_radical_05_wardrobe_hoops.png');

  // 6. Shop Footy
  await page.evaluate(() => {
    window.App.store.update(d => {
      d.selectedTeam = 'footy';
      d.selectedCharacter = 'footy';
    });
    window.App.go('shop');
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_radical_06_shop.png') });
  console.log('6. Captured verify_radical_06_shop.png');

  // 7. Quests
  await page.evaluate(() => {
    window.App.go('quests');
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_radical_07_quests.png') });
  console.log('7. Captured verify_radical_07_quests.png');

  // 8. Live In-Game Football Match Action
  console.log('Launching live Football match...');
  await page.evaluate(() => {
    window.App.launch({ mode: 'footy', char: 'footy', difficulty: 'easy', minutes: 2, arenaId: 'std_footy_classic' }, false);
  });
  // Wait for kickoff
  for (let i = 0; i < 30; i++) {
    const phase = await page.evaluate(() => {
      const g = window.App && window.App.game;
      return g && g.sim ? g.sim.phase : null;
    });
    if (phase === 'playing') break;
    await new Promise(r => setTimeout(r, 200));
  }
  // Run forward with ball
  await page.keyboard.down('KeyW');
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_radical_08_match_football.png') });
  console.log('8. Captured verify_radical_08_match_football.png');
  await page.keyboard.up('KeyW');

  // 9. Live In-Game Basketball Match Action
  console.log('Launching live Basketball match...');
  await page.evaluate(() => {
    window.App.launch({ mode: 'hoops', char: 'footy', difficulty: 'easy', minutes: 2, arenaId: 'std_hoops_street' }, false);
  });
  for (let i = 0; i < 30; i++) {
    const phase = await page.evaluate(() => {
      const g = window.App && window.App.game;
      return g && g.sim ? g.sim.phase : null;
    });
    if (phase === 'playing') break;
    await new Promise(r => setTimeout(r, 200));
  }
  await page.keyboard.down('KeyW');
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_radical_09_match_basketball.png') });
  console.log('9. Captured verify_radical_09_match_basketball.png');
  await page.keyboard.up('KeyW');

  await browser.close();
  console.log('All 9 visual verifications completed successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
