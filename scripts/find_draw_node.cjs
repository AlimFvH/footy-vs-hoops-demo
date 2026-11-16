const fs = require('fs');
const content = fs.readFileSync('js/game.js', 'utf8');
const idx = content.indexOf('drawNode(n, inst, scene');
console.log(content.substring(idx - 20, idx + 1000));
