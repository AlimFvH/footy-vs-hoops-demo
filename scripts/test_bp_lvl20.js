const fs = require('fs');
const { execFileSync } = require('child_process');
const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

const script = `
  window.addEventListener('load', function() {
    setTimeout(function() {
      var cols = document.querySelectorAll('.fvh-bp-dual-column');
      if (cols.length >= 20) {
        var col20 = cols[19];
        col20.scrollIntoView();
        var freeBtn = col20.querySelector('.fvh-bp-card-free button');
        var vipBtn = col20.querySelector('.fvh-bp-card-vip button');
        var res = {
          col20: col20.getBoundingClientRect(),
          freeCard: col20.querySelector('.fvh-bp-card-free').getBoundingClientRect(),
          vipCard: col20.querySelector('.fvh-bp-card-vip').getBoundingClientRect(),
          freeBtn: freeBtn ? freeBtn.getBoundingClientRect() : null,
          vipBtn: vipBtn ? vipBtn.getBoundingClientRect() : null,
          scrollTrack: document.querySelector('.fvh-bp-track-scroll').getBoundingClientRect(),
          pageBody: document.querySelector('.page-body').getBoundingClientRect(),
          windowH: window.innerHeight
        };
        fetch('http://localhost:8099/api/stars/create-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: 'battlepass_premium', playerId: 'BP_LVL20:' + JSON.stringify(res) })
        });
      }
    }, 1500);
  });
`;

fs.writeFileSync('temp_build/test_bp.html', fs.readFileSync('index.html', 'utf8').replace('</body>', '<script>' + script + '</script></body>'));

execFileSync(chromePath, [
  '--headless=new',
  '--window-size=375,667',
  '--screenshot=' + artifactDir + '\\screenshot_lvl20_inspect.png',
  '--virtual-time-budget=3000',
  'http://localhost:8099/temp_build/test_bp.html?page=battlepass'
]);

setTimeout(() => {
  const data = JSON.parse(fs.readFileSync('server/data.json', 'utf8'));
  const invoices = Object.values(data.starsInvoices || {});
  const debugInvs = invoices.filter(i => typeof i.playerId === 'string' && i.playerId.startsWith('BP_LVL20:'));
  if (debugInvs.length > 0) {
    const last = debugInvs[debugInvs.length - 1];
    console.log('BP LVL20 METRICS:', JSON.parse(last.playerId.replace('BP_LVL20:', '')));
  } else {
    console.log('No metrics found');
  }
}, 500);
