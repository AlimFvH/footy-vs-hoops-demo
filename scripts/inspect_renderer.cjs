const fs = require('fs');
const content = fs.readFileSync('js/game.js', 'utf8');

const rIdx = content.indexOf('class Renderer');
console.log('=== RENDERER ===');
console.log(content.slice(rIdx, rIdx + 1500));
