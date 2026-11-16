const fs = require('fs');

function getFaceUVs(name) {
  const buf = fs.readFileSync('assets/characters/' + name + '_raw_backup.glb');
  const jsonLen = buf.readUInt32LE(12);
  const gltf = JSON.parse(buf.toString('utf8', 20, 20 + jsonLen));
  const bin = buf.subarray(20 + jsonLen + 8);

  function getAcc(idx) {
    const acc = gltf.accessors[idx];
    const bv = gltf.bufferViews[acc.bufferView];
    const off = (bv.byteOffset || 0) + (acc.byteOffset || 0);
    if (acc.componentType === 5126) return new Float32Array(bin.buffer, bin.byteOffset + off, acc.count * (acc.type === 'VEC3' ? 3 : 2));
    if (acc.componentType === 5125) return new Uint32Array(bin.buffer, bin.byteOffset + off, acc.count);
    if (acc.componentType === 5123) return new Uint16Array(bin.buffer, bin.byteOffset + off, acc.count);
  }

  const pos = getAcc(gltf.meshes[0].primitives[0].attributes.POSITION);
  const uvs = getAcc(gltf.meshes[0].primitives[0].attributes.TEXCOORD_0);
  const ind = getAcc(gltf.meshes[0].primitives[0].indices);

  // Filter triangles on the front of the face:
  // z > 0.02, y between 0.36 and 0.48, |x| < 0.06
  const faceTris = [];
  for (let t = 0; t < ind.length; t += 3) {
    const i0 = ind[t], i1 = ind[t+1], i2 = ind[t+2];
    const x0 = pos[i0*3], y0 = pos[i0*3+1], z0 = pos[i0*3+2];
    const x1 = pos[i1*3], y1 = pos[i1*3+1], z1 = pos[i1*3+2];
    const x2 = pos[i2*3], y2 = pos[i2*3+1], z2 = pos[i2*3+2];

    const cx = (x0 + x1 + x2) / 3;
    const cy = (y0 + y1 + y2) / 3;
    const cz = (z0 + z1 + z2) / 3;

    // Normal vector
    const ax = x1 - x0, ay = y1 - y0, az = z1 - z0;
    const bx = x2 - x0, by = y2 - y0, bz = z2 - z0;
    const nz = ax * by - ay * bx;

    if (cy >= 0.36 && cy <= 0.49 && cz > 0.02 && Math.abs(cx) < 0.06 && nz > 0) {
      faceTris.push({
        t,
        cx, cy, cz,
        uv0: [Math.round(uvs[i0*2]*1024), Math.round(uvs[i0*2+1]*1024)],
        uv1: [Math.round(uvs[i1*2]*1024), Math.round(uvs[i1*2+1]*1024)],
        uv2: [Math.round(uvs[i2*2]*1024), Math.round(uvs[i2*2+1]*1024)]
      });
    }
  }

  console.log(name, 'face triangles count:', faceTris.length);
  // Find which UV region they cluster in
  let u0 = 1024, u1 = 0, v0 = 1024, v1 = 0;
  for (const ft of faceTris) {
    for (const p of [ft.uv0, ft.uv1, ft.uv2]) {
      if (p[0] < u0) u0 = p[0]; if (p[0] > u1) u1 = p[0];
      if (p[1] < v0) v0 = p[1]; if (p[1] > v1) v1 = p[1];
    }
  }
  console.log(name, 'overall Face UV box: [', u0, '..', u1, '] x [', v0, '..', v1, ']');

  // Check if they are clustered into one or two islands
  const bins = {};
  for (const ft of faceTris) {
    const cu = Math.floor((ft.uv0[0] + ft.uv1[0] + ft.uv2[0]) / 3 / 128) * 128;
    const cv = Math.floor((ft.uv0[1] + ft.uv1[1] + ft.uv2[1]) / 3 / 128) * 128;
    const key = `${cu},${cv}`;
    bins[key] = (bins[key] || 0) + 1;
  }
  console.log(name, 'clusters (U,V):', bins);
}

getFaceUVs('hoops23');
getFaceUVs('footy10');
getFaceUVs('keeper1');
