const fs = require('fs');
const content = fs.readFileSync('render/characters_glb.js', 'utf8');
const lines = content.split('\n');
console.log(lines.slice(260, 390).join('\n'));
