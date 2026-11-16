const fs = require('fs');
const content = fs.readFileSync('assets/loaders/glb_loader.js', 'utf8');
const lines = content.split('\n');
console.log(lines.slice(380, 480).join('\n'));
