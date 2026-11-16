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
const idx = getAcc(prim.indices);

// In check_nose_mesh:
// Tri 20: indices were around 20*3
// Let's compute face normal for all triangles near nose bridge:
for (let i = 0; i < idx.length; i += 3) {
  const i0 = idx[i], i1 = idx[i+1], i2 = idx[i+2];
  const p0 = [pos[i0*3], pos[i0*3+1], pos[i0*3+2]];
  const p1 = [pos[i1*3], pos[i1*3+1], pos[i1*3+2]];
  const p2 = [pos[i2*3], pos[i2*3+1], pos[i2*3+2]];

  const midY = (p0[1] + p1[1] + p2[1]) / 3;
  const midX = (p0[0] + p1[0] + p2[0]) / 3;
  const midZ = (p0[2] + p1[2] + p2[2]) / 3;

  if (Math.abs(midX) < 0.015 && midY > 0.425 && midY < 0.440 && midZ > 0.10) {
    // Face normal: (p1 - p0) x (p2 - p0)
    const ax = p1[0] - p0[0], ay = p1[1] - p0[1], az = p1[2] - p0[2];
    const bx = p2[0] - p0[0], by = p2[1] - p0[1], bz = p2[2] - p0[2];
    let nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
    const l = Math.hypot(nx, ny, nz) || 1;
    nx /= l; ny /= l; nz /= l;
    console.log(`Tri at [${midX.toFixed(3)}, ${midY.toFixed(3)}, ${midZ.toFixed(3)}]: normal = [${nx.toFixed(3)}, ${ny.toFixed(3)}, ${nz.toFixed(3)}]`);
  }
}
