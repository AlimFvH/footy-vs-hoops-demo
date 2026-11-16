const fs = require('fs');
const content = fs.readFileSync('render/hero_characters_3d.js', 'utf8');
const lines = content.split('\n');
console.log(lines.slice(465, 495).map((l, i) => `${466 + i}: ${l}`).join('\n'));
