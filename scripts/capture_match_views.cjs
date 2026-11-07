const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const serverApp = require('../server/server.js');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const artifactDir = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function captureMatchGameplay() {
  console.log('Capturing live in-match gameplay screenshots...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 2 }); // iPhone Pro Max viewport

  await page.setRequestInterception(true);
  page.on('request', r => {
    if (r.url().includes('telegram.org')) {
      r.respond({ status: 200, contentType: 'application/javascript', body: 'window.Telegram = window.Telegram || { WebApp: {} };' });
    } else r.continue();
  });

  // Setup save with Footy & Hoops
  await page.evaluateOnNewDocument(() => {
    const save = {
      selectedTeam: 'footy',
      selectedCharacter: 'footy',
      teamChosen: true,
      coins: 5000,
      xp: 1200,
      owned: ['skin_rookie', 'skin_bb_onyx', 'ball_footy_classic', 'ball_hoops_classic', 'std_footy_classic', 'std_hoops_street'],
      equipped: {
        skin: 'skin_rookie',
        'skin.footy': 'skin_rookie',
        'skin.hoops': 'skin_bb_onyx',
        ball: 'ball_footy_classic',
        'ball.footy': 'ball_footy_classic',
        'ball.hoops': 'ball_hoops_classic'
      },
      stats: { played: 15, wins: 14 }
    };
    localStorage.setItem('fvh.save.v1', JSON.stringify(save));
  });

  await page.goto('http://127.0.0.1:8099/index.html', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));

  // 1. FOOTY MATCH GAMEPLAY CAPTURE
  console.log('Launching FOOTY match on football pitch...');
  await page.evaluate(() => {
    window.app.launch({ mode: 'footy', difficulty: 'easy', minutes: 2, char: 'footy', arenaId: 'std_footy_classic' }, false);
  });
  await new Promise(r => setTimeout(r, 2200));

  // Simulate FOOTY striker dribbling ball toward goal
  await page.evaluate(() => {
    const sim = window.app.game.sim;
    sim.phase = 'playing';
    const human = sim.human;
    human.x = 1.0;
    human.z = -12.0;
    sim.setOwner(human);
  });
  // Advance 30 frames
  for (let i = 0; i < 30; i++) {
    await page.evaluate(() => {
      window.app.game.sim.step(1 / 60);
      for (const e of window.app.game.sim.drainEvents()) window.app.game.onEvent(e);
    });
  }

  const footyMatchPath1 = path.join(artifactDir, 'match_footy_gameplay_action.png');
  await page.screenshot({ path: footyMatchPath1 });
  console.log(`✓ Captured FOOTY match action -> ${footyMatchPath1}`);

  // Simulate shot toward goal
  await page.evaluate(() => {
    const sim = window.app.game.sim;
    const human = sim.human;
    sim.kickBall(human, -0.3, -1.0, 22.0, 1.2, 'shot');
  });
  for (let i = 0; i < 20; i++) {
    await page.evaluate(() => {
      window.app.game.sim.step(1 / 60);
      for (const e of window.app.game.sim.drainEvents()) window.app.game.onEvent(e);
    });
  }

  const footyShotPath = path.join(artifactDir, 'match_footy_shot_on_goal.png');
  await page.screenshot({ path: footyShotPath });
  console.log(`✓ Captured FOOTY shot on goal -> ${footyShotPath}`);

  // Quit to Menu
  await page.evaluate(() => { window.app.quitToMenu(); });
  await new Promise(r => setTimeout(r, 800));

  // 2. HOOPS MATCH GAMEPLAY CAPTURE
  console.log('Launching HOOPS match on basketball court...');
  await page.evaluate(() => {
    window.app.launch({ mode: 'hoops', difficulty: 'easy', minutes: 2, char: 'hoops', arenaId: 'std_hoops_street' }, false);
  });
  await new Promise(r => setTimeout(r, 2200));

  // Simulate HOOPS player dribbling toward rim
  await page.evaluate(() => {
    const sim = window.app.game.sim;
    sim.phase = 'playing';
    const human = sim.human;
    human.x = 0;
    human.z = 8.0;
    sim.setOwner(human);
  });
  for (let i = 0; i < 25; i++) {
    await page.evaluate(() => {
      window.app.game.sim.step(1 / 60);
      for (const e of window.app.game.sim.drainEvents()) window.app.game.onEvent(e);
    });
  }

  const hoopsMatchPath1 = path.join(artifactDir, 'match_hoops_gameplay_dribble.png');
  await page.screenshot({ path: hoopsMatchPath1 });
  console.log(`✓ Captured HOOPS match dribble -> ${hoopsMatchPath1}`);

  // Simulate dunk jump at the rim
  await page.evaluate(() => {
    const sim = window.app.game.sim;
    const human = sim.human;
    const hoop = sim.hoopFor(human.team);
    human.x = 0;
    human.z = hoop.z - hoop.dir * 1.8;
    sim.setOwner(human);
    sim.launchShot(human, 0, 0, true);
  });
  for (let i = 0; i < 20; i++) {
    await page.evaluate(() => {
      window.app.game.sim.step(1 / 60);
      for (const e of window.app.game.sim.drainEvents()) window.app.game.onEvent(e);
    });
  }

  const hoopsDunkPath = path.join(artifactDir, 'match_hoops_slam_dunk.png');
  await page.screenshot({ path: hoopsDunkPath });
  console.log(`✓ Captured HOOPS slam dunk action -> ${hoopsDunkPath}`);

  await browser.close();
  console.log('All match gameplay views captured successfully!');
  process.exit(0);
}

captureMatchGameplay().catch(err => {
  console.error('Error capturing match gameplay:', err);
  process.exit(1);
});
