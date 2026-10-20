const { execFileSync } = require('child_process');
const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

const codeToEval = `
  const wide = [];
  document.querySelectorAll('*').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.right > 375) {
      wide.push({ tag: el.tagName, id: el.id, class: el.className, right: rect.right, width: rect.width });
    }
  });
  console.log('WIDE ELEMENTS:', JSON.stringify(wide.slice(0, 10), null, 2));
`;

// Let's create an html file that loads index.html and runs this script
const testHtml = `
<!DOCTYPE html>
<html>
<body>
<iframe id="f" src="http://localhost:8099/index.html?page=battlepass&opencheckout=bp" style="width:375px;height:667px;border:none;"></iframe>
<script>
window.onload = () => {
  setTimeout(() => {
    const doc = document.getElementById('f').contentDocument;
    const wide = [];
    doc.querySelectorAll('*').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.right > 375.5) {
        wide.push({ tag: el.tagName, id: el.id, class: (typeof el.className === 'string' ? el.className : ''), right: Math.round(rect.right), width: Math.round(rect.width) });
      }
    });
    console.log('=== WIDE ELEMENTS REPORT ===');
    console.log(JSON.stringify(wide.slice(0, 15), null, 2));
  }, 1200);
};
</script>
</body>
</html>
`;

const fs = require('fs');
fs.writeFileSync('temp_build/test_wide.html', testHtml);

try {
  const out = execFileSync(chromePath, [
    '--headless=new',
    '--window-size=375,667',
    '--enable-logging=stderr',
    '--v=1',
    '--virtual-time-budget=3000',
    'http://localhost:8099/temp_build/test_wide.html'
  ], { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  console.log('OUT:', out);
} catch (e) {
  console.log('ERR / STDERR:', e.stderr ? e.stderr.toString() : e.message);
}
