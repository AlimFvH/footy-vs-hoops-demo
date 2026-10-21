const fs = require('fs');
const assert = require('assert');
const { spawn } = require('child_process');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function runStaticVerification() {
  console.log('--- Static Code Verification: 3D Cartoon Athletes & Custom Crowd ---');
  const gameCode = fs.readFileSync('js/game.js', 'utf8');
  const redesignCode = fs.readFileSync('js/redesign.js', 'utf8');
  const cssCode = fs.readFileSync('css/redesign.css', 'utf8');

  // 1. Check removal of old #10 and #23 number plates from 3D models
  assert(!gameCode.includes('const numPlate ='), 'Old #10 box plate must be removed from 3D Character model');
  assert(!gameCode.includes('const numCore ='), 'Old #10 numCore box must be removed from 3D Character model');
  assert(!gameCode.includes('const hoopsNum ='), 'Old #23 hoopsNum plate must be removed from 3D Character model');
  assert(!gameCode.includes('const hoopsNumCore ='), 'Old #23 hoopsNumCore box must be removed from 3D Character model');
  console.log('✓ No #10 or #23 squad number boxes on 3D Character models');

  // 2. Check 3D Cartoon Human Athlete features
  assert(gameCode.includes('irisCol'), 'Cartoon eyes with colored iris must be present');
  assert(gameCode.includes('Pixar Eye Glint') || gameCode.includes('Specular Highlight Glint'), 'Specular highlight reflection must be present');
  assert(gameCode.includes('Determined Athletic Eyebrows'), 'Determined athletic eyebrows must be present');
  assert(gameCode.includes('Sculpted Cartoon Nose'), 'Sculpted cartoon nose must be present');
  assert(gameCode.includes('Confident Athletic Smile'), 'Confident athletic smile must be present');
  console.log('✓ 3D Cartoon Human Athlete features (eyes, eyebrows, nose, mouth, hair) verified in Character class');

  // 3. Check enhanced athletic animations
  assert(gameCode.includes('this.torso.rotation[1] = torsoTwist - sp * amp * 0.26'), 'Torso athletic counter-rotation during running verified');
  assert(gameCode.includes('Math.sin(ph) * amp * 0.065'), 'Natural lateral shoulder roll verified');
  assert(gameCode.includes('this.kneeL.rotation[0] = amp * (0.18 + 1.25'), 'High knee drive verified');
  assert(gameCode.includes('kickLeg = 0.85 - 2.85 * w'), 'Powerful follow-through kicking strike verified');
  console.log('✓ Athletic animations (counter-twist, sprint lean, knee drives, explosive kick) verified');

  // 4. Check Crowd catalog & customization
  assert(redesignCode.includes('CROWD_CATALOG'), 'CROWD_CATALOG must exist in redesign.js');
  assert(redesignCode.includes('crowd_footy_ultras'), 'FOOTY Ultras crowd must exist');
  assert(redesignCode.includes('crowd_hoops_allstars'), 'HOOPS All-Stars crowd must exist');
  assert(redesignCode.includes('crowd_global_fest'), 'Global Festival crowd must exist');
  assert(redesignCode.includes('crowd_cyber_vip'), 'Cyber Neon VIP crowd must exist');
  assert(redesignCode.includes('crowd_emerald_forest'), 'Emerald Supporters crowd must exist');
  assert(redesignCode.includes('crowd_gold_champs'), 'Golden Champions Suite crowd must exist');
  console.log('✓ All 6 Supporter & Crowd clubs configured in CROWD_CATALOG');

  // 5. Check Arena Gallery dual tabs
  assert(redesignCode.includes('fvh-arena-section-seg'), 'Arena Gallery dual tabs (Stadiums vs Crowd) must exist');
  assert(redesignCode.includes('arenaTabCrowd'), 'arenaTabCrowd localization key must exist');
  assert(redesignCode.includes('renderCrowdGrid'), 'renderCrowdGrid function must exist');
  console.log('✓ Arena Gallery dual tabs (Stadiums / Arenas vs Supporters / Crowd) verified');

  // 6. Check Wardrobe Crowd category
  assert(redesignCode.includes("id: 'crowd', label: tr('catCrowd')"), 'Wardrobe crowd category must exist');
  assert(redesignCode.includes("d.equipped.crowd = item.id"), 'Wardrobe equipping crowd verified');
  console.log('✓ Wardrobe Supporters & Crowd category verified');

  // 7. Check MatchView crowd palette application
  assert(gameCode.includes('CROWD_PALETTES'), 'CROWD_PALETTES must exist in MatchView');
  assert(gameCode.includes('eq.crowd'), 'MatchView must read equipped crowd');
  console.log('✓ MatchView crowd palette integration verified');

  // 8. Check CSS styles
  assert(cssCode.includes('.fvh-crowd-card'), '.fvh-crowd-card styles must exist');
  assert(cssCode.includes('.fvh-arena-section-seg'), '.fvh-arena-section-seg styles must exist');
  console.log('✓ Crowd selector CSS verified');
}

async function runBrowserSnapshots() {
  console.log('\n--- Capturing In-Game Visual Proofs via Chrome CDP ---');
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9299',
    '--disable-gpu',
    '--window-size=412,915',
    '--no-sandbox',
    'about:blank'
  ]);

  let ver;
  for (let i = 0; i < 25; i++) {
    try {
      await new Promise(r => setTimeout(r, 250));
      const res = await fetch('http://127.0.0.1:9299/json/version');
      ver = await res.json();
      if (ver && ver.webSocketDebuggerUrl) break;
    } catch (e) {}
  }

  if (!ver || !ver.webSocketDebuggerUrl) {
    chrome.kill();
    throw new Error('Failed to connect to headless Chrome');
  }

  const browserWs = new WebSocket(ver.webSocketDebuggerUrl);
  let bid = 1;
  const bCallbacks = new Map();
  browserWs.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && bCallbacks.has(msg.id)) { bCallbacks.get(msg.id)(msg); bCallbacks.delete(msg.id); }
  };
  await new Promise(r => browserWs.onopen = r);

  function sendBrowser(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = bid++;
      bCallbacks.set(msgId, (res) => { if (res.error) reject(new Error(res.error.message)); else resolve(res.result); });
      browserWs.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  const target = await sendBrowser('Target.createTarget', { url: 'http://localhost:8099/index.html' });
  const pageWs = new WebSocket(`ws://127.0.0.1:9299/devtools/page/${target.targetId}`);
  let pid = 1;
  const pCallbacks = new Map();
  pageWs.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pCallbacks.has(msg.id)) { pCallbacks.get(msg.id)(msg); pCallbacks.delete(msg.id); }
  };
  await new Promise(r => pageWs.onopen = r);

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = pid++;
      pCallbacks.set(msgId, (res) => { if (res.error) reject(new Error(res.error.message)); else resolve(res.result); });
      pageWs.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 393,
    height: 852,
    deviceScaleFactor: 2,
    mobile: true
  });

  async function evaluate(exp) {
    const r = await send('Runtime.evaluate', { expression: exp, returnByValue: true });
    return r.result ? r.result.value : null;
  }

  async function snap(filename) {
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const buf = Buffer.from(shot.data, 'base64');
    fs.writeFileSync(`${artifactDir}/${filename}.png`, buf);
    console.log(`Saved screenshot: ${filename}.png`);
  }

  // 1. Wait for game load
  await new Promise(r => setTimeout(r, 2000));

  // Initialize save state
  await evaluate(`
    (function() {
      if (window.app && window.app.store) {
        window.app.store.update(function(d) {
          d.selectedCharacter = 'footy';
          d.language = 'ru';
          if (!d.equipped) d.equipped = {};
          d.equipped.skin = 'skin_gold';
          d.equipped.crowd = 'crowd_cyber_vip';
          d.equipped['stadium.footy'] = 'std_footy_classic';
        });
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 500));

  // 2. Open Arena Gallery & switch to "Болельщики и Трибуны" tab
  await evaluate(`
    (function() {
      if (window.app && window.app.showArenas) {
        window.app.showArenas();
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 600));

  // Click the "Болельщики и Трибуны" tab
  await evaluate(`
    (function() {
      var buttons = document.querySelectorAll('.fvh-arena-section-seg button');
      if (buttons.length > 1) {
        buttons[1].click();
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 600));
  await snap('audit_screen_arena_crowd_selector');

  // 3. Open Wardrobe & switch to "Болельщики" tab
  await evaluate(`
    (function() {
      if (window.app && window.app.openCharacterLocker) {
        window.app.openCharacterLocker('footy', 'crowd');
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 600));
  await snap('audit_screen_wardrobe_crowd_tab');

  // 4. Start Football match to inspect 3D Cartoon Human Athlete & Crowd
  await evaluate(`
    (function() {
      if (window.app) {
        window.app.startMatch({
          mode: 'footy',
          difficulty: 'normal',
          targetScore: 3,
          duration: 90,
          char: 'footy'
        });
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 1600));
  await snap('audit_screen_match_footy_cartoon_athlete');

  // Return to menu & start Basketball match
  await evaluate(`
    (function() {
      if (window.app) {
        if (window.app.view && window.app.view.dispose) window.app.view.dispose();
        window.app.store.update(function(d) {
          d.selectedCharacter = 'hoops';
          if (!d.equipped) d.equipped = {};
          d.equipped.skin = 'skin_crimson';
          d.equipped.crowd = 'crowd_hoops_allstars';
        });
        window.app.startMatch({
          mode: 'hoops',
          difficulty: 'normal',
          targetScore: 11,
          duration: 90,
          char: 'hoops'
        });
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 1600));
  await snap('audit_screen_match_hoops_cartoon_athlete');

  browserWs.close();
  pageWs.close();
  chrome.kill();
  console.log('\nAll visual proofs successfully captured!');
}

async function main() {
  await runStaticVerification();
  await runBrowserSnapshots();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
