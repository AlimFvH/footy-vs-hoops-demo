const fs = require('fs');
const content = fs.readFileSync('js/game.js', 'utf8');

const rIdx = content.indexOf('class Renderer');
const nextClass = content.indexOf('class ', rIdx + 10);
const rendererClass = content.slice(rIdx, nextClass !== -1 ? nextClass : rIdx + 8000);

const methods = [...rendererClass.matchAll(/(\w+)\s*\([^)]*\)\s*\{/g)].map(m => m[0]);
console.log('Renderer methods:', methods);
