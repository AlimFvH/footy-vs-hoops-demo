const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function run() {
  const prefix = process.argv[2] || 'layout_before';
  console.log(`Capturing layout verification screenshots (${prefix})...`);
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

  // Test across iPhone dimensions: 393x852 (iPhone 14/15/16 Pro as in screenshot)
  const screens = [
    {
      id: `${prefix}_1_main_menu`,
      name: 'Main Menu (Home)',
      action: async (sendPage) => {
        // Just let menu render
        await new Promise(r => setTimeout(r, 1000));
      }
    },
    {
      id: `${prefix}_2_shop_sheet`,
      name: 'Shop Item Detail Sheet',
      action: async (sendPage) => {
        await sendPage('Runtime.evaluate', {
          expression: `(() => {
            if (window.App) {
              window.App.go('shop');
              setTimeout(() => {
                // Find coin doubler or any boost/item to open sheet
                const card = document.querySelector('.card.shopc') || document.querySelector('.fvh-item-card');
                if (card) card.click();
                else if (typeof window.openItemInspector === 'function') {
                  window.openItemInspector({ id: 'boost_coin_2x', name: 'coinDoubler', category: 'boosts', price: 150, rarity: 'epic', desc: 'Удвоитель монет — СПОРТИВНЫЙ БУТИК · СЕЗОН 1' });
                }
              }, 400);
            }
          })()`
        });
        await new Promise(r => setTimeout(r, 1200));
      }
    },
    {
      id: `${prefix}_3_battle_pass`,
      name: 'Battle Pass Screen',
      action: async (sendPage) => {
        await sendPage('Runtime.evaluate', {
          expression: `(() => {
            if (window.App) {
              window.App.go('battlepass');
              setTimeout(() => {
                const track = document.querySelector('.fvh-bp-track-scroll');
                if (track) track.scrollLeft = 900;
              }, 500);
            }
          })()`
        });
        await new Promise(r => setTimeout(r, 1200));
      }
    }
  ];

  for (const s of screens) {
    console.log(`Capturing ${s.name}...`);
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const pageWs = new WebSocket(`ws://127.0.0.1:9222/devtools/page/${targetId}`);
    await new Promise(r => pageWs.onopen = r);
    let pid = 1;
    const pcb = new Map();
    pageWs.onmessage = (e) => {
      const msg = JSON.parse(e.data);
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
    // iPhone 14/15/16 Pro dimensions (393 x 852, scale factor 3)
    await sendPage('Emulation.setDeviceMetricsOverride', { width: 393, height: 852, deviceScaleFactor: 2, mobile: true });
    await sendPage('Page.navigate', { url: 'http://localhost:8099' });
    await new Promise(r => setTimeout(r, 1500));
    await s.action(sendPage);
    const ss = await sendPage('Page.captureScreenshot', { format: 'png' });
    const outPath = path.join(artifactDir, `${s.id}.png`);
    fs.writeFileSync(outPath, Buffer.from(ss.data, 'base64'));
    console.log(`Saved ${outPath}`);
    await send('Target.closeTarget', { targetId });
  }

  chrome.kill();
  console.log('Done captures!');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
