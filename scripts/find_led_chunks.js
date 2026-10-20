const fs = require('fs');
const code = fs.readFileSync('js/game.js', 'utf8');

function findChunk(signature, len = 500) {
  const idx = code.indexOf(signature);
  console.log(`=== ${signature} at ${idx} ===`);
  if (idx !== -1) {
    console.log(code.substring(idx, idx + len));
  }
}

findChunk('function makeLedTexture(');
findChunk('function ledMaterials(');
findChunk('function ledBoard(');
findChunk('function pulseLed(');
findChunk('const led = ads_js_1.AD_CONFIG.enabled ? ledMaterials(t.boards');
findChunk('const led = ads_js_1.AD_CONFIG.enabled ? ledMaterials(t.board');
