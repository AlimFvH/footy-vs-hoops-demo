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
const uvs = getAcc(prim.attributes.TEXCOORD_0);
const idx = getAcc(prim.indices);

// Check triangles around nose bridge: x near 0, y ~ 0.41..0.44, z > 0.08
console.log('Checking triangles around nose bridge...');
let count = 0;
for (let i = 0; i < idx.length; i += 3) {
  const i0 = idx[i], i1 = idx[i+1], i2 = idx[i+2];
  const p0 = [pos[i0*3], pos[i0*3+1], pos[i0*3+2]];
  const p1 = [pos[i1*3], pos[i1*3+1], pos[i1*3+2]];
  const p2 = [pos[i2*3], pos[i2*3+1], pos[i2*3+2]];

  const midY = (p0[1] + p1[1] + p2[1]) / 3;
  const midX = (p0[0] + p1[0] + p2[0]) / 3;
  const midZ = (p0[2] + p1[2] + p2[2]) / 3;

  if (Math.abs(midX) < 0.03 && midY > 0.41 && midY < 0.45 && midZ > 0.08) {
    count++;
    const uv0 = [uvs[i0*2], uvs[i0*2+1]];
    const uv1 = [uvs[i1*2], uvs[i1*2+1]];
    const uv2 = [uvs[i2*2], uvs[i2*2+1]];
    console.log(`Tri ${count}: midX=${midX.toFixed(3)}, midY=${midY.toFixed(3)}, midZ=${midZ.toFixed(3)} | UV0=[${uv0.map(v=>v.toFixed(3))}], UV1=[${uv1.map(v=>v.toFixed(3))}], UV2=[${uv2.map(v=>v.toFixed(3))}]`);
  }
}
