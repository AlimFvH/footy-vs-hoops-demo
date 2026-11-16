const fs = require('fs');
const content = fs.readFileSync('js/game.js', 'utf8');

// Search for 'gfx/geometry' definition
const idx = content.indexOf("define('gfx/geometry'");
console.log(content.substring(idx, idx + 1200));
