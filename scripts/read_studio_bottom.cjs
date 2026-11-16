const fs = require('fs');
const content = fs.readFileSync('character_studio.html', 'utf8');
const lines = content.split('\n');
console.log(lines.slice(lines.length - 60).join('\n'));
