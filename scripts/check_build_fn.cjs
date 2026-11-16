const fs = require('fs');
const content = fs.readFileSync('render/hero_characters_3d.js', 'utf8');
const fnIdx = content.indexOf('function buildHeroCharacter');
console.log(content.slice(fnIdx, fnIdx + 400));
