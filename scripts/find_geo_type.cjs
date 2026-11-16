const fs = require('fs');
const content = fs.readFileSync('js/game.js', 'utf8');
let idx = 0;
while ((idx = content.indexOf('geo.type', idx)) !== -1) {
  console.log(content.substring(idx - 100, idx + 100));
  idx += 10;
}
