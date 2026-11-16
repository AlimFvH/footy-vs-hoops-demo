const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');

async function checkAnimations() {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 900 });
  await page.goto('http://localhost:8099/character_studio.html');
  await new Promise(r => setTimeout(r, 1200));

  await page.click('#btn-spin'); // stop spin
  await page.click('#btn-threeq'); // 3/4 view

  const poses = ['idle', 'run', 'action', 'celebrate', 'dribble'];
  for (let pose of poses) {
    await page.click(`#pose-${pose}`);
    await new Promise(r => setTimeout(r, 800)); // let animation run a bit
    await page.screenshot({ path: `C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/debug_anim_footy_${pose}.png` });
  }

  // Hoops
  await page.click('#tab-hoops');
  await new Promise(r => setTimeout(r, 1000));
  for (let pose of poses) {
    await page.click(`#pose-${pose}`);
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: `C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/debug_anim_hoops_${pose}.png` });
  }

  // Keeper
  await page.click('#tab-keeper');
  await new Promise(r => setTimeout(r, 1000));
  for (let pose of poses) {
    await page.click(`#pose-${pose}`);
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: `C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/debug_anim_keeper_${pose}.png` });
  }

  await browser.close();
  console.log('All animations captured successfully!');
}

checkAnimations().catch(console.error);
