const fs = require('fs');
const content = fs.readFileSync('js/game.js', 'utf8');
const idx = content.indexOf('frameUniforms(pr, scene, cam');
console.log(content.substring(idx - 20, idx + 800));
