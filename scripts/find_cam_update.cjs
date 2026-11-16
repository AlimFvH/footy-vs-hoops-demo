const fs = require('fs');
const content = fs.readFileSync('js/game.js', 'utf8');
const idx = content.indexOf('class Camera');
console.log(content.substring(idx, idx + 800));
