const fs = require('fs');
const content = fs.readFileSync('js/game.js', 'utf8');

const sIdx = content.indexOf('function createScene');
console.log('=== CREATE SCENE ===');
console.log(content.slice(sIdx, sIdx + 800));
