const fs = require('fs');
const content = fs.readFileSync('js/game.js', 'utf8');
const idx = content.indexOf("define('gfx/geometry'");
console.log(content.substring(idx + 1200, idx + 2400));
