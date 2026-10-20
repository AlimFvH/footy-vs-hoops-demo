const fs = require('fs');
const code = fs.readFileSync('js/game.js', 'utf8');
const matches = code.match(/go\(['"][a-zA-Z_-]+['"]\)/g) || [];
console.log('Routes:', [...new Set(matches)]);
