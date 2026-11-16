const fs = require('fs');
const content = fs.readFileSync('js/game.js', 'utf8');

const rIdx = content.indexOf('class Renderer');
const renderFnIdx = content.indexOf('render(scene, camera', rIdx);
console.log('=== RENDER METHOD ===');
console.log(content.slice(renderFnIdx, renderFnIdx + 1500));
