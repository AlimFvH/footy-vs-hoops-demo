const fs = require('fs');
const content = fs.readFileSync('js/game.js', 'utf8');
const texIdx = content.indexOf('define("render/textures"');
console.log(content.slice(texIdx, texIdx + 2000));
