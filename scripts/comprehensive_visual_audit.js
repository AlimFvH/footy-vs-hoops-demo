const fs = require('fs');
const { spawn } = require('child_process');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function main() {
  console.log('=== Starting Comprehensive Visual Audit ===');
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
    throw new Error('Chrome remote debugging connection failed');
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
  const consoleErrors = [];

  pageWs.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.method === 'Runtime.consoleAPICalled') {
      if (msg.params.type === 'error') {
        consoleErrors.push(msg.params.args.map(a => a.value || a.description).join(' '));
      }
    }
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
  await send('Emulation.setDeviceMetricsOverride', { width: 393, height: 852, deviceScaleFactor: 2, mobile: true });

  async function evaluate(exp) {
    const r = await send('Runtime.evaluate', { expression: exp, returnByValue: true });
    return r.result ? r.result.value : null;
  }

  async function snap(name) {
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`${artifactDir}/vis_audit_${name}.png`, Buffer.from(shot.data, 'base64'));
    console.log(`[SNAPSHOT] Saved: vis_audit_${name}.png`);
  }

  // 1. Initial load - allow UI to initialize
  await new Promise(r => setTimeout(r, 2200));

  // 2. Capture Team Select Modal first (it pops up on clean launch)
  await snap('03_team_select_modal');

  // Dismiss modal and pick Football to unlock full app
  await evaluate(`
    (function() {
      document.querySelectorAll('.fvh-team-modal-back').forEach(function(el) { el.remove(); });
      window.app.store.update(function(d) {
        d.teamChosen = true;
        d.selectedCharacter = 'footy';
        d.language = 'ru';
      });
      window.app.showMenu();
    })()
  `);
  await new Promise(r => setTimeout(r, 600));

  // 3. Menu: Football (FOOTY)
  await snap('01_menu_footy');

  // 4. Menu: Basketball (HOOPS)
  await evaluate(`
    (function() {
      window.app.store.update(function(d) {
        d.selectedCharacter = 'hoops';
      });
      window.app.showMenu();
    })()
  `);
  await new Promise(r => setTimeout(r, 600));
  await snap('02_menu_hoops');

  // Check layout overflow without modals
  const layoutIssues = await evaluate(`
    (function() {
      var elWithOverflow = [];
      document.querySelectorAll('*').forEach(function(el) {
        if (el.scrollWidth > el.clientWidth && el.clientWidth > 0) {
          var isScrollable = window.getComputedStyle(el).overflowX === 'auto' || window.getComputedStyle(el).overflowX === 'scroll';
          if (!isScrollable && el.scrollWidth - el.clientWidth > 10) {
            elWithOverflow.push(el.className || el.tagName);
          }
        }
      });
      return elWithOverflow;
    })()
  `);
  console.log('Unintentional overflow elements:', layoutIssues);

  // 5. Wardrobe: Football player with jerseys
  await evaluate(`
    (function() {
      window.app.openCharacterLocker('footy', 'skins');
    })()
  `);
  await new Promise(r => setTimeout(r, 600));
  await snap('04_wardrobe_footy_jerseys');

  // 6. Wardrobe: Balls tab
  await evaluate(`
    (function() {
      window.app.openCharacterLocker('footy', 'balls');
    })()
  `);
  await new Promise(r => setTimeout(r, 600));
  await snap('05_wardrobe_footy_balls');

  // 7. Wardrobe: Basketball player
  await evaluate(`
    (function() {
      window.app.openCharacterLocker('hoops', 'skins');
    })()
  `);
  await new Promise(r => setTimeout(r, 600));
  await snap('06_wardrobe_hoops_jerseys');

  // 8. Arena Gallery: All Arenas
  await evaluate(`
    (function() {
      window.app.showArenas();
    })()
  `);
  await new Promise(r => setTimeout(r, 600));
  await snap('07_arena_gallery_stadiums');

  // 9. Arena Gallery: Filtered by Basketball
  await evaluate(`
    (function() {
      var buttons = document.querySelectorAll('.page-body .seg button');
      if (buttons.length > 2) buttons[2].click();
    })()
  `);
  await new Promise(r => setTimeout(r, 600));
  await snap('08_arena_gallery_hoops');

  // 10. Store: Filtered for Football
  await evaluate(`
    (function() {
      window.app.store.update(function(d) { d.selectedCharacter = 'footy'; });
      window.app.go('shop');
    })()
  `);
  await new Promise(r => setTimeout(r, 600));
  await snap('09_store_football_filtered');

  // 11. Store: Filtered for Basketball
  await evaluate(`
    (function() {
      window.app.store.update(function(d) { d.selectedCharacter = 'hoops'; });
      window.app.go('shop');
    })()
  `);
  await new Promise(r => setTimeout(r, 600));
  await snap('10_store_basketball_filtered');

  // 12. Leaderboard: War of Teams
  await evaluate(`
    (function() {
      window.app.go('leaderboard');
    })()
  `);
  await new Promise(r => setTimeout(r, 600));
  await snap('11_leaderboard_team_war');

  // 13. Battle Pass
  await evaluate(`
    (function() {
      window.app.go('battlepass');
    })()
  `);
  await new Promise(r => setTimeout(r, 600));
  await snap('12_battlepass');

  // 14. Quests & Missions
  await evaluate(`
    (function() {
      window.app.go('quests');
    })()
  `);
  await new Promise(r => setTimeout(r, 600));
  await snap('13_quests');

  // 15. Mode Select Screen
  await evaluate(`
    (function() {
      window.app.showModeSelect();
    })()
  `);
  await new Promise(r => setTimeout(r, 600));
  await snap('14_mode_select');

  // 16. In-game Football Match: 3D Cartoon Athlete + Dynamic Crowd
  await evaluate(`
    (function() {
      window.app.store.update(function(d) {
        d.selectedCharacter = 'footy';
        if (!d.equipped) d.equipped = {};
        d.equipped.skin = 'skin_gold';
        d.equipped.crowd = 'crowd_cyber_vip';
      });
      window.app.launch({
        mode: 'footy',
        char: 'footy',
        difficulty: 'normal',
        minutes: 2
      }, false);
    })()
  `);
  await new Promise(r => setTimeout(r, 2500));
  await snap('15_match_footy_3d_action');

  // 17. In-game Basketball Match: 3D Cartoon Athlete + Dynamic Crowd
  await evaluate(`
    (function() {
      if (window.app.game && window.app.game.stop) window.app.game.stop();
      window.app.store.update(function(d) {
        d.selectedCharacter = 'hoops';
        if (!d.equipped) d.equipped = {};
        d.equipped.skin = 'skin_crimson';
        d.equipped.crowd = 'crowd_hoops_allstars';
      });
      window.app.launch({
        mode: 'hoops',
        char: 'hoops',
        difficulty: 'normal',
        minutes: 2
      }, false);
    })()
  `);
  await new Promise(r => setTimeout(r, 2500));
  await snap('16_match_hoops_3d_action');

  browserWs.close();
  pageWs.close();
  chrome.kill();

  console.log('\n=== Visual Audit Complete ===');
  console.log('Console Errors detected:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.log(consoleErrors);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
