const fs = require('fs');
const { execFileSync } = require('child_process');
const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

const inspectScript = `
  window.addEventListener("load", function () {
    setTimeout(function () {
      const btn = document.querySelector(".fvh-pay-opt-stars");
      console.log("BTN_OUTER_HTML:", btn ? btn.outerHTML : "NONE");
      if (btn) {
        console.log("BTN_BOUNDS:", JSON.stringify(btn.getBoundingClientRect()));
        const spans = Array.from(btn.querySelectorAll("span"));
        spans.forEach((s, idx) => {
          console.log("SPAN_" + idx + ":", s.innerText, JSON.stringify(s.getBoundingClientRect()));
        });
      }
    }, 1500);
  });
`;

const html = fs.readFileSync('index.html', 'utf8').replace('</body>', '<script>' + inspectScript + '</script></body>');
fs.writeFileSync('temp_build/test_btn.html', html);

let all = '';
try {
  all = execFileSync(chromePath, [
    '--headless=new',
    '--window-size=375,667',
    '--enable-logging=stderr',
    '--v=1',
    '--virtual-time-budget=3000',
    'http://localhost:8099/temp_build/test_btn.html?page=battlepass&opencheckout=bp'
  ], { encoding: 'utf8' });
} catch (e) {
  all = (e.stdout || '') + (e.stderr || '');
}
console.log(all.split('\n').filter(l => l.includes('BTN_') || l.includes('SPAN_')).join('\n'));
