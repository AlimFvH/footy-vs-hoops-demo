const fs = require('fs');
const content = fs.readFileSync('render/hero_characters_3d.js', 'utf8');
const lines = content.split('\n');
console.log(lines.slice(lines.length - 40).join('\n'));
