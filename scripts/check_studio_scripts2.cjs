const fs = require('fs');
const content = fs.readFileSync('character_studio.html', 'utf8');
const idx = content.indexOf('<script src="js/module-loader.js">');
console.log(content.substring(idx));
