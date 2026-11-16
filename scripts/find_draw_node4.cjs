const fs = require('fs');
const content = fs.readFileSync('js/game.js', 'utf8');
const rIdx = content.indexOf('define("gfx/renderer"');
const rEnd = content.indexOf('define("sim/types"', rIdx);
const rCode = content.substring(rIdx, rEnd);
const dIdx = rCode.indexOf('drawNode(');
const dIdx2 = rCode.indexOf('drawNode(', dIdx + 1);
const dIdx3 = rCode.indexOf('drawNode(', dIdx2 + 1);
const dIdx4 = rCode.indexOf('drawNode(', dIdx3 + 1);
console.log('dIdx4:', dIdx4);
if (dIdx4 !== -1) {
  console.log(rCode.substring(dIdx4 - 30, dIdx4 + 1000));
}
