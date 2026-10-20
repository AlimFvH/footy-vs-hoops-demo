const fs = require('fs');
const lines = fs.readFileSync('js/redesign.js', 'utf8').split('\n');
const scenicIdx = lines.findIndex(l => l.includes('SCENIC_ARENAS_CATALOG ='));
console.log('SCENIC_ARENAS_CATALOG line:', scenicIdx + 1);
for (let i = scenicIdx; i < scenicIdx + 40; i++) {
  console.log(lines[i]);
}
