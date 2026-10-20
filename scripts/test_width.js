const fs = require('fs');
const { execFileSync } = require('child_process');
const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

const script = `
  setTimeout(() => {
    const b = document.body.getBoundingClientRect();
    const m = document.querySelector('.modal') ? document.querySelector('.modal').getBoundingClientRect() : null;
    const mb = document.querySelector('.modal-back') ? document.querySelector('.modal-back').getBoundingClientRect() : null;
    const btn = document.querySelector('.fvh-pay-opt-stars') ? document.querySelector('.fvh-pay-opt-stars').getBoundingClientRect() : null;
    const btnSpans = document.querySelector('.fvh-pay-opt-stars') ? Array.from(document.querySelectorAll('.fvh-pay-opt-stars span')).map(s => ({ text: s.innerText, rect: s.getBoundingClientRect() })) : [];
    const res = {
      windowW: window.innerWidth,
      bodyW: b.width,
      scrollW: document.body.scrollWidth,
      modalRect: m,
      modalBackRect: mb,
      btnRect: btn,
      btnSpans: btnSpans
    };
    fetch('http://localhost:8099/api/stars/create-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 'battlepass_premium', playerId: 'DEBUG_METRICS:' + JSON.stringify(res) })
    });
  }, 1200);
`;

const html = fs.readFileSync('index.html', 'utf8').replace('</body>', '<script>' + script + '</script></body>');
fs.writeFileSync('temp_build/test_run.html', html);

execFileSync(chromePath, [
  '--headless=new',
  '--window-size=375,667',
  '--virtual-time-budget=2500',
  'http://localhost:8099/temp_build/test_run.html?page=battlepass&opencheckout=bp'
]);

setTimeout(() => {
  const data = JSON.parse(fs.readFileSync('server/data.json', 'utf8'));
  const invoices = Object.values(data.starsInvoices || {});
  const debugInv = invoices.find(i => typeof i.playerId === 'string' && i.playerId.startsWith('DEBUG_METRICS:'));
  if (debugInv) {
    console.log('CAPTURED METRICS:', JSON.parse(debugInv.playerId.replace('DEBUG_METRICS:', '')));
  } else {
    console.log('Not found');
  }
}, 500);
