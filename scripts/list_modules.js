const fs = require('fs');
const text = fs.readFileSync('js/game.js', 'utf8');
const reg = /define\(\s*["']([^"']+)["']/g;
let m;
const list = [];
while ((m = reg.exec(text)) !== null) {
  list.push(m[1]);
}
console.log(JSON.stringify(list, null, 2));
