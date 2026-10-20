const fs = require('fs');
const { execFileSync } = require('child_process');
const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

const script = `
<script>
window.addEventListener('load', () => {
  setTimeout(() => {
    const st = document.querySelector('.fvh-bp-track-scroll');
    const col = document.querySelector('.fvh-bp-dual-column');
    const body = document.querySelector('.page-body');
    const info = {
      bodyRect: body ? { ch: body.clientHeight, sh: body.scrollHeight } : null,
      stRect: st.getBoundingClientRect(),
      colRect: col.getBoundingClientRect(),
      colComputed: {
        height: getComputedStyle(col).height,
        display: getComputedStyle(col).display,
        position: getComputedStyle(col).position,
        overflow: getComputedStyle(col).overflow
      },
      colChildren: Array.from(col.children).map(c => ({
        tag: c.tagName,
        cls: c.className,
        rect: c.getBoundingClientRect(),
        h: getComputedStyle(c).height,
        pos: getComputedStyle(c).position
      })),
      stComputed: {
        height: getComputedStyle(st).height,
        maxHeight: getComputedStyle(st).maxHeight,
        overflowY: getComputedStyle(st).overflowY,
        boxSizing: getComputedStyle(st).boxSizing
      }
    };
    fetch('http://localhost:8099/api/stars/create-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 'battlepass_premium', playerId: 'TRACK_INFO:' + JSON.stringify(info) })
    });
  }, 1200);
});
</script>
`;

fs.writeFileSync('temp_track_check.html', fs.readFileSync('index.html', 'utf8').replace('</body>', script + '</body>'));
execFileSync(chromePath, ['--headless=new', '--window-size=375,667', '--virtual-time-budget=2500', 'http://localhost:8099/temp_track_check.html?page=battlepass']);
setTimeout(() => {
  const data = JSON.parse(fs.readFileSync('server/data.json', 'utf8'));
  const invs = Object.values(data.starsInvoices || {});
  const s = invs.filter(i => typeof i.playerId === 'string' && i.playerId.startsWith('TRACK_INFO:')).pop();
  if (s) console.log(JSON.stringify(JSON.parse(s.playerId.replace('TRACK_INFO:', '')), null, 2));
}, 500);
