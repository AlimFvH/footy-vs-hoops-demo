const fs = require('fs');
const content = fs.readFileSync('js/game.js', 'utf8');
const idx = content.indexOf('define("gfx/scene"');
console.log(content.substring(idx, idx + 1200));
