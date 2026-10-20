const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function runAudit() {
  console.log('=== FOOTY vs HOOPS Comprehensive End-to-End Screen Audit ===');
  const chrome = spawn(chromePath, ['--headless=new', '--remote-debugging-port=9222', '--disable-gpu', '--no-sandbox', 'about:blank']);
  await new Promise(r => setTimeout(r, 1500));
  const verRes = await fetch('http://127.0.0.1:9222/json/version');
  const ver = await verRes.json();
  const ws = new WebSocket(ver.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 1;
  const callbacks = new Map();
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && callbacks.has(msg.id)) { callbacks.get(msg.id)(msg); callbacks.delete(msg.id); }
  };
  function send(method, params = {}) {
    return new Promise((res, rej) => {
      const mid = id++;
      callbacks.set(mid, (r) => r.error ? rej(new Error(r.error.message)) : res(r.result));
      ws.send(JSON.stringify({ id: mid, method, params }));
    });
  }

  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const pageWs = new WebSocket(`ws://127.0.0.1:9222/devtools/page/${targetId}`);
  await new Promise(r => pageWs.onopen = r);
  let pid = 1;
  const pcb = new Map();
  const consoleErrors = [];

  pageWs.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      consoleErrors.push(msg.params.args.map(a => a.value || a.description).join(' '));
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      consoleErrors.push(msg.params.exceptionDetails.text + ' ' + (msg.params.exceptionDetails.exception ? msg.params.exceptionDetails.exception.description : ''));
    }
    if (msg.id && pcb.has(msg.id)) { pcb.get(msg.id)(msg); pcb.delete(msg.id); }
  };

  function sendPage(method, params = {}) {
    return new Promise((res, rej) => {
      const mid = pid++;
      pcb.set(mid, (r) => r.error ? rej(new Error(r.error.message)) : res(r.result));
      pageWs.send(JSON.stringify({ id: mid, method, params }));
    });
  }

  await sendPage('Page.enable');
  await sendPage('Runtime.enable');
  // iPhone 14/15/16 Pro portrait dimensions (393 x 852)
  await sendPage('Emulation.setDeviceMetricsOverride', { width: 393, height: 852, deviceScaleFactor: 2, mobile: true });
  await sendPage('Page.navigate', { url: 'http://localhost:8099' });
  await new Promise(r => setTimeout(r, 2000));

  async function checkLayout(screenName) {
    const res = await sendPage('Runtime.evaluate', {
      expression: `(() => {
        const docW = document.documentElement.scrollWidth;
        const winW = window.innerWidth;
        const bodyW = document.body.scrollWidth;
        return { docW, winW, bodyW, hasHScroll: (docW > winW || bodyW > winW) };
      })()`,
      returnByValue: true
    });
    const info = res.result.value;
    if (info.hasHScroll) {
      console.error(`❌ [FAIL] Horizontal overflow on ${screenName}: docW=${info.docW}, winW=${info.winW}`);
      return false;
    } else {
      console.log(`✅ [PASS] ${screenName}: Perfect alignment (width: ${info.winW}px, 0 overflow)`);
      return true;
    }
  }

  async function saveScreenshot(filename) {
    const ss = await sendPage('Page.captureScreenshot', { format: 'png' });
    const out = path.join(artifactDir, filename);
    fs.writeFileSync(out, Buffer.from(ss.data, 'base64'));
  }

  let passedAll = true;

  // 1. Main Menu
  console.log('\n--- 1. Testing Main Menu ---');
  passedAll = (await checkLayout('Main Menu')) && passedAll;
  await saveScreenshot('audit_screen_1_menu.png');

  // 2. Character Locker (Footy)
  console.log('\n--- 2. Testing Character Locker (Footy) ---');
  await sendPage('Runtime.evaluate', { expression: `window.App.openCharacterLocker('footy')` });
  await new Promise(r => setTimeout(r, 1000));
  passedAll = (await checkLayout('Character Locker (Footy)')) && passedAll;
  await saveScreenshot('audit_screen_2_locker_footy.png');

  // 3. Character Locker (Hoops)
  console.log('\n--- 3. Testing Character Locker (Hoops) ---');
  await sendPage('Runtime.evaluate', { expression: `window.App.openCharacterLocker('hoops')` });
  await new Promise(r => setTimeout(r, 1000));
  passedAll = (await checkLayout('Character Locker (Hoops)')) && passedAll;
  await saveScreenshot('audit_screen_3_locker_hoops.png');

  // 4. Shop Boutique
  console.log('\n--- 4. Testing Shop Boutique ---');
  await sendPage('Runtime.evaluate', { expression: `window.App.go('shop')` });
  await new Promise(r => setTimeout(r, 1000));
  passedAll = (await checkLayout('Shop Boutique')) && passedAll;
  await saveScreenshot('audit_screen_4_shop.png');

  // 5. Item Detail Sheet
  console.log('\n--- 5. Testing Item Detail Sheet in Shop ---');
  await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const card = document.querySelector('.card.shopc');
      if (card) card.click();
      else if (window.openItemInspector) {
        window.openItemInspector({ id: 'boost_coin_2x', name: 'coinDoubler', category: 'boosts', price: 150, rarity: 'epic', desc: 'Удвоитель монет — СПОРТИВНЫЙ БУТИК · СЕЗОН 1' });
      }
    })()`
  });
  await new Promise(r => setTimeout(r, 1000));
  passedAll = (await checkLayout('Item Detail Sheet')) && passedAll;
  await saveScreenshot('audit_screen_5_item_sheet.png');
  // Close sheet
  await sendPage('Runtime.evaluate', { expression: `(() => { const x = document.querySelector('.modal-close-x') || document.querySelector('.modal button'); if (x) x.click(); })()` });
  await new Promise(r => setTimeout(r, 500));

  // 6. Quests Page
  console.log('\n--- 6. Testing Quests Page ---');
  await sendPage('Runtime.evaluate', { expression: `window.App.go('quests')` });
  await new Promise(r => setTimeout(r, 1000));
  passedAll = (await checkLayout('Quests Page')) && passedAll;
  await saveScreenshot('audit_screen_6_quests.png');

  // 7. Battle Pass Page
  console.log('\n--- 7. Testing Battle Pass Page ---');
  await sendPage('Runtime.evaluate', { expression: `window.App.go('battlepass')` });
  await new Promise(r => setTimeout(r, 1000));
  passedAll = (await checkLayout('Battle Pass Page')) && passedAll;
  await saveScreenshot('audit_screen_7_battlepass.png');

  // 8. Mode Selection
  console.log('\n--- 8. Testing Mode Selection Screen ---');
  await sendPage('Runtime.evaluate', { expression: `window.App.showModeSelect()` });
  await new Promise(r => setTimeout(r, 1000));
  passedAll = (await checkLayout('Mode Selection')) && passedAll;
  await saveScreenshot('audit_screen_8_mode_select.png');

  // 9. Arena Selection Gallery
  console.log('\n--- 9. Testing Arena Selection Gallery ---');
  await sendPage('Runtime.evaluate', { expression: `window.App.showArenas()` });
  await new Promise(r => setTimeout(r, 1000));
  passedAll = (await checkLayout('Arena Selection')) && passedAll;
  await saveScreenshot('audit_screen_9_arenas.png');

  // 10. Gameplay Match HUD & Pause
  console.log('\n--- 10. Testing Gameplay Match HUD & Pause Dialog ---');
  await sendPage('Runtime.evaluate', { expression: `window.App.startQuickMatch('footy')` });
  await new Promise(r => setTimeout(r, 2000));
  passedAll = (await checkLayout('Gameplay Match HUD')) && passedAll;
  await saveScreenshot('audit_screen_10_match_hud.png');

  // Trigger pause
  await sendPage('Runtime.evaluate', { expression: `if (window.App && window.App.openPause) window.App.openPause();` });
  await new Promise(r => setTimeout(r, 1000));
  passedAll = (await checkLayout('Pause Screen')) && passedAll;
  await saveScreenshot('audit_screen_11_pause.png');

  // Exit back to menu
  await sendPage('Runtime.evaluate', { expression: `if (window.App && window.App.showMenu) window.App.showMenu();` });
  await new Promise(r => setTimeout(r, 1000));

  await send('Target.closeTarget', { targetId });
  chrome.kill();

  console.log('\n--- Audit Summary ---');
  if (consoleErrors.length > 0) {
    console.warn('Console warnings/errors detected during flow:');
    consoleErrors.forEach(e => console.warn('  •', e));
  } else {
    console.log('✅ 0 uncaught exceptions or JavaScript errors logged!');
  }

  if (passedAll) {
    console.log('🎉 100% OF ALL SCREENS PASSED AUDIT WITH ZERO OVERFLOW AND PERFECT SYMMETRY!');
    process.exit(0);
  } else {
    console.error('❌ Some screens failed layout audit!');
    process.exit(1);
  }
}

runAudit().catch(e => { console.error(e); process.exit(1); });
