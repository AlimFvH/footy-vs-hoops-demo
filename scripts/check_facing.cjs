const fs = require('fs');
const loader = require('../assets/loaders/glb_loader.js');

function checkFacing(glbPath) {
  const buf = fs.readFileSync(glbPath);
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  const parsed = loader.parseGLBContainer(ab);
  const gltf = parsed.gltf;
  const bin = parsed.bin;

  const prim = gltf.meshes[0].primitives[0];
  const acc = gltf.accessors[prim.attributes.POSITION];
  const bv = gltf.bufferViews[acc.bufferView];
  const pos = new Float32Array(bin, (bv.byteOffset || 0) + (acc.byteOffset || 0), acc.count * 3);

  // Compute average Z of nose/face (high Y) vs chest vs feet
  let zHighY = 0, countHigh = 0;
  let zMidY = 0, countMid = 0;
  for (let i = 0; i < pos.length / 3; i++) {
    const y = pos[i*3+1];
    const z = pos[i*3+2];
    if (y > 0.35) { zHighY += z; countHigh++; }
    if (y >= 0.0 && y <= 0.25) { zMidY += z; countMid++; }
  }
  console.log(glbPath, 'High Y avg Z:', (zHighY / countHigh).toFixed(4), 'Mid Y avg Z:', (zMidY / countMid).toFixed(4));
}

checkFacing('assets/characters/footy10.glb');
checkFacing('assets/characters/hoops23.glb');
checkFacing('assets/characters/keeper1.glb');
