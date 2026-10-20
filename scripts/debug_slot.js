const fs = require('fs');
const { execFileSync } = require('child_process');
const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

const script = `
<script>
window.addEventListener('load', () => {
  setTimeout(() => {
    const wide = [];
    document.querySelectorAll('*').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.right > 376) {
        wide.push({
          tag: el.tagName,
          id: el.id,
          cls: (typeof el.className === 'string' ? el.className : ''),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          sw: el.scrollWidth
        });
      }
    });
    fetch('http://localhost:8099/api/stars/create-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 'battlepass_premium', playerId: 'OVERFLOW_ELS:' + JSON.stringify(wide.slice(0, 20)) })
    });
  }, 1200);
});
</script>
`;

fs.writeFileSync('temp_slot_check.html', fs.readFileSync('index.html', 'utf8').replace('</body>', script + '</body>'));
execFileSync(chromePath, [
  '--headless=new',
  '--use-mobile-user-agent',
  '--user-agent=Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
  '--window-size=375,667',
  '--virtual-time-budget=2000',
  'http://localhost:8099/temp_slot_check.html?page=characters&char=footy'
]);
setTimeout(() => {
  const data = JSON.parse(fs.readFileSync('server/data.json', 'utf8'));
  const invs = Object.values(data.starsInvoices || {});
  const s = invs.filter(i => typeof i.playerId === 'string' && i.playerId.startsWith('OVERFLOW_ELS:')).pop();
  if (s) console.log(JSON.stringify(JSON.parse(s.playerId.replace('OVERFLOW_ELS:', '')), null, 2));
  fs.unlinkSync('temp_slot_check.html');
}, 500);
