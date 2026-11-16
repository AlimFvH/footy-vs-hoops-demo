const fs = require('fs');
const content = fs.readFileSync('js/game.js', 'utf8');
let idx = 0;
while ((idx = content.indexOf('texImage2D', idx)) !== -1) {
  if (content.substring(idx - 100, idx).includes('tex.source')) {
    console.log(content.substring(idx - 100, idx + 400));
  }
  idx += 10;
}
