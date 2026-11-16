const fs = require('fs');
const content = fs.readFileSync('js/game.js', 'utf8');
const idx = content.indexOf('define("gfx/renderer"');
const part = content.substring(idx, idx + 4000);
const lines = part.split('\n');
lines.forEach((l, i) => {
  if (l.includes('drawElements') || l.includes('ELEMENT_ARRAY_BUFFER') || l.includes('UNSIGNED_SHORT') || l.includes('UNSIGNED_INT')) {
    console.log(i + 1, l.trim());
  }
});
