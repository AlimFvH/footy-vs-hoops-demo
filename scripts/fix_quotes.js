const fs = require('fs');
const path = require('path');

const redesignPath = path.resolve('js/redesign.js');
let code = fs.readFileSync(redesignPath, 'utf8');

code = code.replace(/font-family="'Impact', 'Arial Black', sans-serif"/g, 'font-family="Impact, Arial Black, sans-serif"');
code = code.replace(/font-family="'Arial Black', sans-serif"/g, 'font-family="Arial Black, sans-serif"');

fs.writeFileSync(redesignPath, code);

new Function(fs.readFileSync(redesignPath, 'utf8'));
console.log('js/redesign.js parsed successfully!');
