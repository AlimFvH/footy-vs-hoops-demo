const http = require('http');
const { spawn } = require('child_process');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9222',
  '--window-size=375,667',
  'http://localhost:8099/index.html?page=quests&tab=gameplay'
]);

setTimeout(async () => {
  try {
    const listRes = await fetch('http://127.0.0.1:9222/json');
    const targets = await listRes.json();
    const pageTarget = targets.find(t => t.type === 'page');
    if (!pageTarget) {
      console.log('No page target found');
      chrome.kill();
      return;
    }
    
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

    ws.addEventListener('open', () => {
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            (() => {
              const segs = Array.from(document.querySelectorAll('.fvh-quest-top-nav, .fvh-quest-sub-nav, .seg'));
              const segInfo = segs.map(s => ({
                class: s.className,
                rect: s.getBoundingClientRect(),
                parent: s.parentElement ? s.parentElement.className : null,
                buttons: Array.from(s.querySelectorAll('button')).map(b => ({
                  text: b.textContent.trim(),
                  class: b.className,
                  rect: b.getBoundingClientRect(),
                  color: getComputedStyle(b).color,
                  bg: getComputedStyle(b).backgroundColor,
                  bgImg: getComputedStyle(b).backgroundImage,
                  width: getComputedStyle(b).width,
                  display: getComputedStyle(b).display,
                  flex: getComputedStyle(b).flex,
                  minWidth: getComputedStyle(b).minWidth
                }))
              }));
              return JSON.stringify(segInfo, null, 2);
            })()
          `,
          returnByValue: true
        }
      }));
    });

    ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data.id === 1) {
        console.log('DOM & STYLE INSPECTION RESULT:');
        console.log(data.result.result.value);
        ws.close();
        chrome.kill();
        process.exit(0);
      }
    });
  } catch (err) {
    console.error('Error:', err);
    chrome.kill();
    process.exit(1);
  }
}, 2000);
