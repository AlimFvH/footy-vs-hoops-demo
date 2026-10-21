const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const { spawn } = require('child_process');

async function test() {
  const chrome = spawn(chromePath, ['--headless=new', '--remote-debugging-port=9298', '--disable-gpu', '--no-sandbox', 'http://localhost:8099/index.html']);
  let ver;
  for (let i = 0; i < 20; i++) {
    try {
      await new Promise(r => setTimeout(r, 200));
      const res = await fetch('http://127.0.0.1:9298/json/version');
      ver = await res.json();
      if (ver && ver.webSocketDebuggerUrl) break;
    } catch(e){}
  }
  const ws = new WebSocket(ver.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 1;
  function send(m, p={}) {
    return new Promise(res => {
      const cur = id++;
      const fn = (e) => {
        const d = JSON.parse(e.data);
        if (d.id === cur) { ws.removeEventListener('message', fn); res(d.result); }
      };
      ws.addEventListener('message', fn);
      ws.send(JSON.stringify({ id: cur, method: m, params: p }));
    });
  }
  const t = await send('Target.createTarget', { url: 'http://localhost:8099/index.html' });
  const pws = new WebSocket('ws://127.0.0.1:9298/devtools/page/' + t.targetId);
  await new Promise(r => pws.onopen = r);
  function sendP(m, p={}) {
    return new Promise(res => {
      const cur = id++;
      const fn = (e) => {
        const d = JSON.parse(e.data);
        if (d.id === cur) { pws.removeEventListener('message', fn); res(d.result); }
      };
      pws.addEventListener('message', fn);
      pws.send(JSON.stringify({ id: cur, method: m, params: p }));
    });
  }
  await sendP('Page.enable');
  await sendP('Runtime.enable');
  await new Promise(r => setTimeout(r, 1000));
  const res = await sendP('Runtime.evaluate', {
    expression: `(() => {
      const chooseBtn = document.querySelector('.fvh-btn-choose-footy');
      if (chooseBtn) chooseBtn.click();
      window.app.store.update(d => { d.selectedCharacter = 'footy'; d.teamChosen = true; });
      window.app.showLeaderboard();
      const all = Array.from(document.querySelectorAll('*'));
      return all.filter(el => el.scrollHeight > el.clientHeight && el.clientHeight > 0).map(el => ({
        tag: el.tagName,
        cls: el.className,
        sh: el.scrollHeight,
        ch: el.clientHeight,
        st: el.scrollTop
      }));
    })()`,
    returnByValue: true
  });
  console.log('Scrollable elements:', res.result.value);
  chrome.kill();
}
test();
