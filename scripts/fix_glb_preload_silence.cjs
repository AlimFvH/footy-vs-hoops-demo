const fs = require('fs');

const files = [
  'render/characters_glb.js',
  'C:/Users/ASUS/Desktop/FOOTY vs HOOPS/render/characters_glb.js'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');

  code = code.replace(
    'function preloadGLBModels() {\n    const loader = getLoader();',
    'function preloadGLBModels() {\n    if (typeof CharactersGLB !== "undefined" && !CharactersGLB.enabled) return;\n    const loader = getLoader();'
  );

  fs.writeFileSync(f, code, 'utf8');
  console.log('✓ Silenced GLB preloads in', f);
});
