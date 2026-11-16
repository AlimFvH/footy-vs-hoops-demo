const fs = require('fs');
const content = fs.readFileSync('js/game.js', 'utf8');
const idx = content.indexOf('texImage2D');
console.log(content.substring(idx - 100, idx + 400));
