const fs = require('fs');
const content = fs.readFileSync('js/game.js', 'utf8');
const idx = content.indexOf('function plane(');
console.log(content.substring(idx - 10, idx + 400));
const idx2 = content.indexOf('function quad(');
console.log(content.substring(idx2 - 10, idx2 + 400));
