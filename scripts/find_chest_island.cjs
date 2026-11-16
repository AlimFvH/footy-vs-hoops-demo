const fs = require('fs');
const loader = require('../assets/loaders/glb_loader.js');

function findChestIslands(glbPath) {
  const buf = fs.readFileSync(glbPath);
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  const parsed = loader.parseGLBContainer(ab);
  const gltf = parsed.gltf;
  const bin = parsed.bin;

  function getAccessor(idx) {
    const acc = gltf.accessors[idx];
    const bv = gltf.bufferViews[acc.bufferView];
    const byteOffset = (bv.byteOffset || 0) + (acc.byteOffset || 0);
    if (acc.componentType === 5126) return new Float32Array(bin, byteOffset, acc.count * (acc.type === 'VEC3' ? 3 : acc.type === 'VEC2' ? 2 : 1));
    if (acc.componentType === 5125) return new Uint32Array(bin, byteOffset, acc.count);
    if (acc.componentType === 5123) return new Uint16Array(bin, byteOffset, acc.count);
  }

  const prim = gltf.meshes[0].primitives[0];
  const pos = getAccessor(prim.attributes.POSITION);
  const uvs = getAccessor(prim.attributes.TEXCOORD_0);
  const indices = getAccessor(prim.indices);

  // Group triangles by UV regions
  // Center of chest: x in [-0.08, 0.08], y in [0.08, 0.22], z > 0.04
  const chestTriangles = [];
  for (let i = 0; i < indices.length; i += 3) {
    const i0 = indices[i], i1 = indices[i+1], i2 = indices[i+2];
    const mx = (pos[i0*3] + pos[i1*3] + pos[i2*3]) / 3;
    const my = (pos[i0*3+1] + pos[i1*3+1] + pos[i2*3+1]) / 3;
    const mz = (pos[i0*3+2] + pos[i1*3+2] + pos[i2*3+2]) / 3;

    if (Math.abs(mx) < 0.08 && my >= 0.08 && my <= 0.22 && mz > 0.03) {
      const u0 = uvs[i0*2], v0 = uvs[i0*2+1];
      const u1 = uvs[i1*2], v1 = uvs[i1*2+1];
      const u2 = uvs[i2*2], v2 = uvs[i2*2+1];
      const avgU = (u0 + u1 + u2) / 3;
      const avgV = (v0 + v1 + v2) / 3;
      chestTriangles.push({ mx, my, mz, avgU, avgV });
    }
  }

  console.log('Center chest triangles count:', chestTriangles.length);
  // Average U and V
  const uVals = chestTriangles.map(t => t.avgU);
  const vVals = chestTriangles.map(t => t.avgV);
  console.log('U range:', Math.min(...uVals).toFixed(3), 'to', Math.max(...uVals).toFixed(3));
  console.log('V range:', Math.min(...vVals).toFixed(3), 'to', Math.max(...vVals).toFixed(3));
}

findChestIslands('assets/characters/hoops23.glb');
