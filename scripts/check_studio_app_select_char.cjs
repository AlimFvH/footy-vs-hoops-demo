const fs = require('fs');
const content = fs.readFileSync('js/character_studio_app.js', 'utf8');
const idx = content.indexOf('function selectChar(');
console.log(content.substring(idx, idx + 600));
