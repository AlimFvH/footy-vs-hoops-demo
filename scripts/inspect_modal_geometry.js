const { execFileSync } = require('child_process');
const fs = require('fs');
const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

const inspectScript = `
  window.addEventListener('load', () => {
    setTimeout(() => {
      const back = document.querySelector('.modal-back');
      const modal = document.querySelector('.modal');
      const bRect = back ? back.getBoundingClientRect() : null;
      const mRect = modal ? modal.getBoundingClientRect() : null;
      const bodyRect = document.body.getBoundingClientRect();
      console.log('EVAL_RESULT:' + JSON.stringify({
        windowWidth: window.innerWidth,
        bodyWidth: bodyRect.width,
        bodyScrollWidth: document.body.scrollWidth,
        bRect,
        mRect,
        modalComputed: modal ? {
          width: getComputedStyle(modal).width,
          maxWidth: getComputedStyle(modal).maxWidth,
          left: getComputedStyle(modal).left,
          margin: getComputedStyle(modal).margin,
          padding: getComputedStyle(modal).padding,
          boxSizing: getComputedStyle(modal).boxSizing,
          transform: getComputedStyle(modal).transform
        } : null
      }));
    }, 1500);
  });
`;

const html = fs.readFileSync('index.html', 'utf8').replace('</body>', '<script>' + inspectScript + '</script></body>');
fs.writeFileSync('temp_build/test_inspect.html', html);

try {
  const out = execFileSync(chromePath, [
    '--headless=new',
    '--window-size=375,667',
    '--enable-logging=stderr',
    '--v=1',
    '--virtual-time-budget=3000',
    'http://localhost:8099/temp_build/test_inspect.html?page=battlepass&opencheckout=bp'
  ], { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
} catch (e) {
  const all = (e.stdout || '') + (e.stderr || '');
  const match = all.match(/EVAL_RESULT:(\{.*\})/);
  if (match) {
    console.log('INSPECT RESULT:', JSON.parse(match[1]));
  } else {
    console.log('STDERR length:', (e.stderr || '').length);
  }
}
