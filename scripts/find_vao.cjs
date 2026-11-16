const fs = require('fs');
const content = fs.readFileSync('js/game.js', 'utf8');
const idx = content.indexOf('createVertexArray');
console.log(content.substring(idx - 100, idx + 800));
