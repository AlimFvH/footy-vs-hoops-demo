const fs = require('fs');
const content = fs.readFileSync('js/character_studio_app.js', 'utf8');
const idx = content.indexOf('function renderLoop');
console.log(content.substring(idx + 800, idx + 1600));
