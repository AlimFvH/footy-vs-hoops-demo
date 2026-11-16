const fs = require('fs');
const content = fs.readFileSync('js/game.js', 'utf8');
const idx = content.indexOf('getTexture(');
console.log(content.substring(idx - 50, idx + 600));
