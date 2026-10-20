const { execSync } = require('child_process');
const oldCode = execSync('git show 42f67c4:js/redesign.js', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
const lines = oldCode.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('ellipse') && (l.includes('ry=') || l.includes('fill='))) {
    console.log((idx + 1) + ': ' + l.trim());
  }
});
