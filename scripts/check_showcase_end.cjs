const fs = require('fs');
const content = fs.readFileSync('scripts/capture_studio_showcase.cjs', 'utf8');
const lines = content.split('\n');
console.log(lines.slice(70, 140).join('\n'));
