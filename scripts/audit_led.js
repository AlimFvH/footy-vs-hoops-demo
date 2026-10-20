const fs = require('fs');
const code = fs.readFileSync('js/game.js', 'utf8');

const pIdx = code.indexOf('function pulseLed(');
console.log('=== pulseLed context ===');
console.log(code.substring(pIdx - 100, pIdx + 700));

const mIdx = code.indexOf('function makeLedTexture(');
console.log('=== makeLedTexture context ===');
console.log(code.substring(mIdx - 50, mIdx + 1200));
