const { execFileSync } = require('child_process');
const fs = require('fs');
const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

const inspectScript = `
  window.addEventListener('load', function() {
    setTimeout(function() {
      var cols = document.querySelectorAll('.fvh-bp-dual-column');
      var col20 = cols[19];
      var vip = col20 ? col20.querySelector('.fvh-bp-card-vip') : null;
      if (!vip) return;
      var children = Array.from(vip.children).map(function(el) {
        return { tag: el.tagName, class: el.className, text: el.innerText.substring(0, 30), rect: el.getBoundingClientRect(), offsetH: el.offsetHeight };
      });
      fetch('http://localhost:8099/api/stars/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: 'battlepass_premium',
          playerId: 'VIP20_INNER:' + JSON.stringify({
            col20Rect: col20.getBoundingClientRect(),
            vipRect: vip.getBoundingClientRect(),
            vipComputed: {
              height: getComputedStyle(vip).height,
              overflow: getComputedStyle(vip).overflow,
              flex: getComputedStyle(vip).flex,
              padding: getComputedStyle(vip).padding
            },
            children: children
          })
        })
      });
    }, 1200);
  });
`;

fs.writeFileSync('temp_inspect_bp.html', fs.readFileSync('index.html', 'utf8').replace('</body>', '<script>' + inspectScript + '</script></body>'));

execFileSync(chromePath, [
  '--headless=new',
  '--window-size=375,667',
  '--virtual-time-budget=2500',
  'http://localhost:8099/temp_inspect_bp.html?page=battlepass'
]);

setTimeout(() => {
  const data = JSON.parse(fs.readFileSync('server/data.json', 'utf8'));
  const invoices = Object.values(data.starsInvoices || {});
  const debugInvs = invoices.filter(i => typeof i.playerId === 'string' && i.playerId.startsWith('VIP20_INNER:'));
  if (debugInvs.length > 0) {
    const last = debugInvs[debugInvs.length - 1];
    console.log(JSON.stringify(JSON.parse(last.playerId.replace('VIP20_INNER:', '')), null, 2));
  } else {
    console.log('No report found');
  }
}, 500);
