const fs = require('fs');
const content = fs.readFileSync('js/character_studio_app.js', 'utf8');
const lines = content.split('\n');
console.log(lines.slice(75, 140).join('\n'));
