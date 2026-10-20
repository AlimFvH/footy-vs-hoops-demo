const fs = require('fs');
const code = fs.readFileSync('js/redesign.js', 'utf8');
const lines = code.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('<ellipse') || l.includes('ry="')) {
    console.log((idx + 1) + ': ' + l.trim());
  }
});
