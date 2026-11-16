const fs = require('fs');
const content = fs.readFileSync('js/game.js', 'utf8');
const rIdx = content.indexOf('define("gfx/renderer"');
const rEnd = content.indexOf('define("sim/types"', rIdx);
const rCode = content.substring(rIdx, rEnd);
const resIdx = rCode.indexOf('resize(');
console.log(rCode.substring(resIdx - 20, resIdx + 600));
