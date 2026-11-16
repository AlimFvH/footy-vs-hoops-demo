const fs = require('fs');
const loader = require('../assets/loaders/glb_loader.js');

const buf = fs.readFileSync('assets/characters/keeper1_raw_backup.glb');
const parsed = loader.parseGLBContainer(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const gltf = parsed.gltf;
const bin = parsed.bin;

function getAcc(idx) {
  const acc = gltf.accessors[idx];
  const bv = gltf.bufferViews[acc.bufferView];
  const offset = (bv.byteOffset || 0) + (acc.byteOffset || 0);
  if (acc.componentType === 5126) return new Float32Array(bin, offset, acc.count * (acc.type === 'VEC3' ? 3 : 2));
  if (acc.componentType === 5125) return new Uint32Array(bin, offset, acc.count);
  if (acc.componentType === 5123) return new Uint16Array(bin, offset, acc.count);
}

const prim = gltf.meshes[0].primitives[0];
const pos = getAcc(prim.attributes.POSITION);

// Check distances between vertices near nose
const noseVerts = [];
for (let i = 0; i < pos.length / 3; i++) {
  const x = pos[i*3], y = pos[i*3+1], z = pos[i*3+2];
  if (Math.abs(x) < 0.03 && y > 0.41 && y < 0.45 && z > 0.08) {
    noseVerts.push({ idx: i, x, y, z });
  }
}

console.log('Nose vertices count:', noseVerts.length);
let nearDups = 0;
for (let i = 0; i < noseVerts.length; i++) {
  for (let j = i + 1; j < noseVerts.length; j++) {
    const v1 = noseVerts[i], v2 = noseVerts[j];
    const dist = Math.hypot(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
    if (dist < 0.003 && dist > 0.00001) {
      nearDups++;
      console.log(`Near duplicate pair: dist=${dist.toFixed(5)} | V1=[${v1.x.toFixed(4)},${v1.y.toFixed(4)},${v1.z.toFixed(4)}] V2=[${v2.x.toFixed(4)},${v2.y.toFixed(4)},${v2.z.toFixed(4)}]`);
    }
  }
}
console.log('Total near duplicates found:', nearDups);
