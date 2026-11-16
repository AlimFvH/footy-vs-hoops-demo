const fs = require('fs');
const content = fs.readFileSync('js/game.js', 'utf8');
const rIdx = content.indexOf('define("gfx/renderer"');
const rEnd = content.indexOf('define("sim/types"', rIdx);
const rCode = content.substring(rIdx, rEnd);

let idx = 0;
while ((idx = rCode.indexOf('Texture(', idx)) !== -1) {
  console.log(rCode.substring(idx - 50, idx + 200));
  idx += 8;
}
