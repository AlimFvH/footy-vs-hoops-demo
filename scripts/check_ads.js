const fs = require('fs');
let code = fs.readFileSync('js/game.js', 'utf8');

const mIdx = code.indexOf('function makeLedTexture(');
const nextFn = code.indexOf('function ', mIdx + 30);
console.log(code.substring(mIdx, nextFn));
