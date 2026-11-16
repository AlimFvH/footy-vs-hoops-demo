const fs = require('fs');
const loader = require('../assets/loaders/glb_loader.js');

function parseMesh(glbPath) {
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

  // Compute normals
  const normals = new Float32Array(pos.length);
  for (let i = 0; i < indices.length; i += 3) {
    const i0 = indices[i] * 3, i1 = indices[i+1] * 3, i2 = indices[i+2] * 3;
    const ax = pos[i1] - pos[i0], ay = pos[i1+1] - pos[i0+1], az = pos[i1+2] - pos[i0+2];
    const bx = pos[i2] - pos[i0], by = pos[i2+1] - pos[i0+1], bz = pos[i2+2] - pos[i0+2];
    const nx = ay * bz - az * by;
    const ny = az * bx - ax * bz;
    const nz = ax * by - ay * bx;
    normals[i0] += nx; normals[i0+1] += ny; normals[i0+2] += nz;
    normals[i1] += nx; normals[i1+1] += ny; normals[i1+2] += nz;
    normals[i2] += nx; normals[i2+1] += ny; normals[i2+2] += nz;
  }
  for (let i = 0; i < normals.length; i += 3) {
    const l = Math.hypot(normals[i], normals[i+1], normals[i+2]) || 1;
    normals[i] /= l; normals[i+1] /= l; normals[i+2] /= l;
  }

  // Extract embedded texture
  const imgDef = gltf.images[0];
  const bv = gltf.bufferViews[imgDef.bufferView];
  const imgBuf = Buffer.from(bin, bv.byteOffset, bv.byteLength);

  return { pos, normals, uvs, indices, imgBuf };
}

['footy10.glb', 'hoops23.glb', 'keeper1.glb'].forEach(f => {
  const m = parseMesh('assets/characters/' + f);
  console.log(f, '=> Vertices:', m.pos.length / 3, 'Triangles:', m.indices.length / 3, 'Texture bytes:', m.imgBuf.length);
});
