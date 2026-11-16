const fs = require('fs');
const loader = require('../assets/loaders/glb_loader.js');

function findUVClusters(glbPath, name) {
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

  // Analyze Front Torso: Y between 0.05 and 0.28, Z > 0.02
  // Analyze Back Torso: Y between 0.05 and 0.28, Z < -0.02
  // Analyze Head/Face: Y between 0.32 and 0.48, Z > 0.01

  function getBox(filterFn) {
    let minU = 1, maxU = 0, minV = 1, maxV = 0, count = 0;
    for (let i = 0; i < pos.length / 3; i++) {
      const x = pos[i*3], y = pos[i*3+1], z = pos[i*3+2];
      if (filterFn(x, y, z)) {
        const u = uvs[i*2], v = uvs[i*2+1];
        minU = Math.min(minU, u); maxU = Math.max(maxU, u);
        minV = Math.min(minV, v); maxV = Math.max(maxV, v);
        count++;
      }
    }
    return { count, minU, maxU, minV, maxV };
  }

  const chest = getBox((x, y, z) => y >= 0.05 && y <= 0.28 && z > 0.02 && Math.abs(x) < 0.12);
  const back = getBox((x, y, z) => y >= 0.05 && y <= 0.28 && z < -0.02 && Math.abs(x) < 0.12);
  const face = getBox((x, y, z) => y >= 0.32 && y <= 0.48 && z > 0.01 && Math.abs(x) < 0.08);

  console.log('=== ' + name + ' ===');
  console.log('Chest:', chest.count, 'verts, U: [' + chest.minU.toFixed(3) + ', ' + chest.maxU.toFixed(3) + '], V: [' + chest.minV.toFixed(3) + ', ' + chest.maxV.toFixed(3) + ']');
  console.log('Back:', back.count, 'verts, U: [' + back.minU.toFixed(3) + ', ' + back.maxU.toFixed(3) + '], V: [' + back.minV.toFixed(3) + ', ' + back.maxV.toFixed(3) + ']');
  console.log('Face:', face.count, 'verts, U: [' + face.minU.toFixed(3) + ', ' + face.maxU.toFixed(3) + '], V: [' + face.minV.toFixed(3) + ', ' + face.maxV.toFixed(3) + ']');
}

findUVClusters('assets/characters/footy10.glb', 'FOOTY #10');
findUVClusters('assets/characters/hoops23.glb', 'HOOPS #23');
findUVClusters('assets/characters/keeper1.glb', 'KEEPER #1');
