const fs = require('fs');
const content = fs.readFileSync('js/game.js', 'utf8');
const idx = content.indexOf('resize(w, h');
console.log(content.substring(idx - 20, idx + 600));
