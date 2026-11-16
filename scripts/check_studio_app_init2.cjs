const fs = require('fs');
const content = fs.readFileSync('js/character_studio_app.js', 'utf8');
const idx = content.indexOf('const emblemImg = document.getElementById');
console.log(content.substring(idx - 50, idx + 800));
