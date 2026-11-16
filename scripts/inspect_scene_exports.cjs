const fs = require('fs');
const content = fs.readFileSync('js/game.js', 'utf8');

const sIdx = content.indexOf('define("gfx/scene"');
console.log(content.slice(sIdx, sIdx + 500));
