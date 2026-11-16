const fs = require('fs');
const content = fs.readFileSync('js/game.js', 'utf8');
const re = /define\s*\(\s*['"]([^'"]+)['"]/g;
let m, list = [];
while (m = re.exec(content)) {
  list.push(m[1]);
}
console.log('Modules count:', list.length);
console.log('Modules:', list);
