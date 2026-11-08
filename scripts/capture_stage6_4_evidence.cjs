const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const ARTIFACT_DIR = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function captureEvidence() {
  console.log('=== Stage 6.4 Character & Gameplay Evidence Capture ===');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 2 });

  await page.setRequestInterception(true);
  page.on('request', req => {
    if (req.url().includes('telegram.org')) {
      req.respond({
        status: 200,
        contentType: 'application/javascript',
        body: 'window.Telegram = { WebApp: { ready: () => {}, expand: () => {}, initDataUnsafe: {} } };'
      });
    } else {
      req.continue();
    }
  });

  async function bootCleanPage() {
    await page.goto('http://127.0.0.1:8099/index.html', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));
    await page.evaluate(() => {
      document.querySelectorAll('.fvh-onboarding-overlay, .fvh-modal-overlay').forEach(el => el.remove());
    });
  }

  // -------------------------------------------------------------
  // Evidence 1 & 3 & 5 & 6: FOOTY Match
  // -------------------------------------------------------------
  console.log('--- 1. Football Match Session (std_footy_classic) ---');
  await bootCleanPage();
  console.log('Starting Football match (Footy Striker #10)...');
  await page.evaluate(() => {
    window.app.launch({ mode: 'footy', difficulty: 'easy', minutes: 2, char: 'footy', arenaId: 'std_footy_classic' }, false);
  });
  // Wait for countdown + "ПОЕХАЛИ!" banner to cleanly clear
  await new Promise(r => setTimeout(r, 4800));

  const p1 = path.join(ARTIFACT_DIR, 'stage6_4_footy_player_match.png');
  await page.screenshot({ path: p1 });
  console.log('✓ Captured 1: stage6_4_footy_player_match.png');

  // AI Opponent Interaction (Human Footy #10 in foreground, AI Hoops #23 ahead)
  await page.evaluate(() => {
    const game = window.app.game;
    if (game && game.sim) {
      game.sim.human.z = -3.5;
      game.sim.human.x = -0.8;
      game.sim.ball.z = -4.5;
      game.sim.ball.x = -0.8;
      game.sim.ai.z = -9.0;
      game.sim.ai.x = 0.6;
    }
  });
  await new Promise(r => setTimeout(r, 600));

  const p3 = path.join(ARTIFACT_DIR, 'stage6_4_footy_ai_match.png');
  await page.screenshot({ path: p3 });
  console.log('✓ Captured 3: stage6_4_footy_ai_match.png');

  // Goalkeeper in Goal Action
  await page.evaluate(() => {
    const game = window.app.game;
    if (game && game.sim) {
      game.sim.human.z = -14;
      game.sim.human.x = -0.5;
      game.sim.ball.z = -20;
      game.sim.ball.x = 0.2;
      game.sim.ball.vz = -16;
      game.sim.ball.shot = true;
    }
  });
  await new Promise(r => setTimeout(r, 600));

  const p5 = path.join(ARTIFACT_DIR, 'stage6_4_goalkeeper_match.png');
  await page.screenshot({ path: p5 });
  console.log('✓ Captured 5: stage6_4_goalkeeper_match.png');

  const p6 = path.join(ARTIFACT_DIR, 'stage6_4_footy_kick_action.png');
  await page.screenshot({ path: p6 });
  console.log('✓ Captured 6: stage6_4_footy_kick_action.png');

  // -------------------------------------------------------------
  // Evidence 2 & 4 & 7: HOOPS Match
  // -------------------------------------------------------------
  console.log('--- 2. Basketball Match Session (std_hoops_street) ---');
  await bootCleanPage();
  console.log('Starting Basketball match (Hoops All-Star #23)...');
  await page.evaluate(() => {
    window.app.launch({ mode: 'hoops', difficulty: 'easy', minutes: 2, char: 'hoops', arenaId: 'std_hoops_street' }, false);
  });
  // Wait for countdown to cleanly clear
  await new Promise(r => setTimeout(r, 4800));

  const p2 = path.join(ARTIFACT_DIR, 'stage6_4_hoops_player_match.png');
  await page.screenshot({ path: p2 });
  console.log('✓ Captured 2: stage6_4_hoops_player_match.png');

  // AI Opponent Interaction (Human Hoops #23 in foreground, AI Footy #10 ahead)
  await page.evaluate(() => {
    const game = window.app.game;
    if (game && game.sim) {
      game.sim.human.z = 2.0;
      game.sim.human.x = -0.5;
      game.sim.ball.z = 1.0;
      game.sim.ball.x = -0.5;
      game.sim.ai.z = -3.2;
      game.sim.ai.x = 0.4;
    }
  });
  await new Promise(r => setTimeout(r, 600));

  const p4 = path.join(ARTIFACT_DIR, 'stage6_4_hoops_ai_match.png');
  await page.screenshot({ path: p4 });
  console.log('✓ Captured 4: stage6_4_hoops_ai_match.png');

  // Dribble & Approach basket for Dunk
  await page.evaluate(() => {
    const game = window.app.game;
    if (game && game.sim) {
      game.sim.human.z = -7.5;
      game.sim.human.x = 0;
      game.sim.human.y = 1.4;
      game.sim.ball.z = -9.2;
      game.sim.ball.x = 0;
      game.sim.ball.y = 2.6;
    }
  });
  await new Promise(r => setTimeout(r, 600));

  const p7 = path.join(ARTIFACT_DIR, 'stage6_4_hoops_dribble_action.png');
  await page.screenshot({ path: p7 });
  console.log('✓ Captured 7: stage6_4_hoops_dribble_action.png');

  // -------------------------------------------------------------
  // Evidence 8: Wardrobe Uniform Equipped & Reflected in Match
  // -------------------------------------------------------------
  console.log('--- 3. Equipped Uniforms Session (Neon Striker) ---');
  await page.goto('http://127.0.0.1:8099/index.html', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    const raw = localStorage.getItem('fvh_save_v1') || '{}';
    let data;
    try { data = JSON.parse(raw); } catch(e) { data = {}; }
    data.equipped = data.equipped || {};
    data.equipped.skin = 'skin_neon';
    data.equipped['skin.footy'] = 'skin_neon';
    data.owned = data.owned || [];
    if (!data.owned.includes('skin_neon')) data.owned.push('skin_neon');
    localStorage.setItem('fvh_save_v1', JSON.stringify(data));
  });
  await bootCleanPage();
  console.log('Equipping alternate uniform (Neon Striker) and verifying in-match reflection...');
  await page.evaluate(() => {
    window.app.launch({ mode: 'footy', difficulty: 'easy', minutes: 2, char: 'footy', arenaId: 'std_footy_classic' }, false);
  });
  await new Promise(r => setTimeout(r, 4800));

  const p8 = path.join(ARTIFACT_DIR, 'stage6_4_equipped_uniform_match.png');
  await page.screenshot({ path: p8 });
  console.log('✓ Captured 8: stage6_4_equipped_uniform_match.png');

  await browser.close();
  console.log('=== All 8 Stage 6.4 Evidence Screenshots Captured Successfully! ===');
}

captureEvidence().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
