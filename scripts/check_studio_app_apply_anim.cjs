const fs = require('fs');
const content = fs.readFileSync('js/character_studio_app.js', 'utf8');
const idx = content.indexOf('function applyAnimation');
console.log(content.substring(idx, idx + 400));
