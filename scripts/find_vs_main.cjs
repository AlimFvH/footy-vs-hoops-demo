const fs = require('fs');
const content = fs.readFileSync('js/game.js', 'utf8');
const idx = content.indexOf('const VS_MAIN =');
console.log(content.substring(idx - 100, idx + 1000));
