const fs = require('fs');
const text = fs.readFileSync('js/game.js', 'utf8');
const start = text.indexOf('define("data/shop"');
const end = text.indexOf('define("data/ads"');
console.log(text.slice(start, end));
