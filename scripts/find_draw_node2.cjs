const fs = require('fs');
const content = fs.readFileSync('js/game.js', 'utf8');
const rIdx = content.indexOf('define("gfx/renderer"');
const rEnd = content.indexOf('define("sim/types"', rIdx);
const rCode = content.substring(rIdx, rEnd);
const dIdx = rCode.indexOf('drawNode(');
console.log(rCode.substring(dIdx - 30, dIdx + 800));
