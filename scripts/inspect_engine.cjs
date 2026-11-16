const fs = require('fs');
const glbJs = fs.readFileSync('render/characters_glb.js', 'utf8');

const pIdx = glbJs.indexOf('function preloadGLBModels');
console.log(glbJs.slice(pIdx, pIdx + 500));
