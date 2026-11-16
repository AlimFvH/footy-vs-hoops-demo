const fs = require('fs');
const content = fs.readFileSync('js/game.js', 'utf8');
let idx = 0;
while ((idx = content.indexOf('drawElements', idx)) !== -1) {
  console.log(content.substring(idx - 50, idx + 100));
  idx += 12;
}
