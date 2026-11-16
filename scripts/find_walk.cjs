const fs = require('fs');
const content = fs.readFileSync('js/game.js', 'utf8');
const idx = content.indexOf('render(scene, cam');
console.log(content.substring(idx + 500, idx + 1400));
