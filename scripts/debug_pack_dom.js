const { spawn } = require('child_process');

async function main() {
  const chrome = spawn('C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9229',
    '--disable-gpu',
    '--no-sandbox',
    'http://localhost:8099'
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://127.0.0.1:9229/json/version');
  const { webSocketDebuggerUrl } = await res.json();
  const ws = new WebSocket(webSocketDebuggerUrl);
  let id = 1;
  const callbacks = new Map();
  ws.onmessage = (e) => {
    const d = JSON.parse(e.data);
    if (d.id && callbacks.has(d.id)) {
      callbacks.get(d.id)(d.result);
      callbacks.delete(d.id);
    }
  };
  await new Promise(r => ws.onopen = r);

  const send = (m, p = {}) => new Promise(res => {
    const mid = id++;
    callbacks.set(mid, res);
    ws.send(JSON.stringify({ id: mid, method: m, params: p }));
  });

  const t = await send('Target.createTarget', { url: 'http://localhost:8099' });
  const pws = new WebSocket('ws://127.0.0.1:9229/devtools/page/' + t.targetId);
  let pid = 1;
  const pcallbacks = new Map();
  pws.onmessage = (e) => {
    const d = JSON.parse(e.data);
    if (d.id && pcallbacks.has(d.id)) {
      pcallbacks.get(d.id)(d.result);
      pcallbacks.delete(d.id);
    }
  };
  await new Promise(r => pws.onopen = r);

  const psend = (m, p = {}) => new Promise(res => {
    const mid = pid++;
    pcallbacks.set(mid, res);
    pws.send(JSON.stringify({ id: mid, method: m, params: p }));
  });

  await psend('Page.enable');
  await psend('Runtime.enable');
  await new Promise(r => setTimeout(r, 2000));

  const evalRes = await psend('Runtime.evaluate', {
    expression: `
      (async () => {
        var app = window.App || window.__fvh;
        if (!app) return { error: 'no app' };
        app.go('shop');
        await new Promise(r => setTimeout(r, 600));
        
        if (!app.openPackAnimation) return { error: 'no openPackAnimation' };
        
        app.openPackAnimation({ id: 'footy', name: 'Footy Striker Pack' });
        var packWrap = document.querySelector('.fvh-pack-unopened-wrap');
        if (!packWrap) return { error: 'no packWrap' };
        packWrap.click();
        
        await new Promise(r => setTimeout(r, 1200));
        
        var cards = document.querySelectorAll('.fvh-pack-reward-card');
        var cardData = Array.from(cards).map(c => ({
          classes: c.className,
          title: c.querySelector('.fvh-pack-reward-title')?.textContent,
          hasThumb: !!c.querySelector('.fvh-pack-reward-thumb svg'),
          display: window.getComputedStyle(c).display,
          opacity: window.getComputedStyle(c).opacity,
          rect: c.getBoundingClientRect()
        }));
        
        return {
          cardCount: cards.length,
          cards: cardData,
          stageHtml: document.querySelector('.fvh-pack-stage')?.innerHTML?.slice(0, 600)
        };
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('Result:', JSON.stringify(evalRes.result.value, null, 2));

  pws.close();
  ws.close();
  chrome.kill();
}

main().catch(console.error);
