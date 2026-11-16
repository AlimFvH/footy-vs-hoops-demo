const fs = require('fs');
const content = fs.readFileSync('js/game.js', 'utf8');
const idx = content.indexOf('r = { vao, vbo, ibo, coun');
console.log(content.substring(idx - 50, idx + 300));
