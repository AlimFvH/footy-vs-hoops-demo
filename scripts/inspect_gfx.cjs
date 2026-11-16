const fs = require('fs');
const content = fs.readFileSync('js/game.js', 'utf8');

const geoIdx = content.indexOf('define("gfx/geometry"');
console.log('=== GFX/GEOMETRY ===');
console.log(content.slice(geoIdx, geoIdx + 1200));

const sceneIdx = content.indexOf('define("gfx/scene"');
console.log('=== GFX/SCENE ===');
console.log(content.slice(sceneIdx, sceneIdx + 1200));
