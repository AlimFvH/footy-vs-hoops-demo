const loader = require('../assets/loaders/glb_loader.js');
const fs = require('fs');
const glb = loader.parseGLBContainer(fs.readFileSync('assets/characters/keeper1_raw_backup.glb').buffer);
const prim = glb.gltf.meshes[0].primitives[0];
const accPos = glb.gltf.accessors[prim.attributes.POSITION];
const bvPos = glb.gltf.bufferViews[accPos.bufferView];
const posArr = new Float32Array(glb.bin, bvPos.byteOffset, accPos.count * 3);

const accIdx = glb.gltf.accessors[prim.indices];
const bvIdx = glb.gltf.bufferViews[accIdx.bufferView];
const idxArr = new Uint32Array(glb.bin, bvIdx.byteOffset, accIdx.count);

const accUV = glb.gltf.accessors[prim.attributes.TEXCOORD_0];
const bvUV = glb.gltf.bufferViews[accUV.bufferView];
const uvArr = new Float32Array(glb.bin, bvUV.byteOffset, accUV.count * 2);

const normalMap = new Map();
const posToKey = (idx) => Math.round(posArr[idx*3]*10000) + ',' + Math.round(posArr[idx*3+1]*10000) + ',' + Math.round(posArr[idx*3+2]*10000);
for (let i = 0; i < idxArr.length; i += 3) {
  const i0 = idxArr[i], i1 = idxArr[i+1], i2 = idxArr[i+2];
  const ax = posArr[i1*3] - posArr[i0*3], ay = posArr[i1*3+1] - posArr[i0*3+1], az = posArr[i1*3+2] - posArr[i0*3+2];
  const bx = posArr[i2*3] - posArr[i0*3], by = posArr[i2*3+1] - posArr[i0*3+1], bz = posArr[i2*3+2] - posArr[i0*3+2];
  const nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
  for (const idx of [i0, i1, i2]) {
    const k = posToKey(idx);
    let cur = normalMap.get(k) || [0, 0, 0];
    cur[0] += nx; cur[1] += ny; cur[2] += nz;
    normalMap.set(k, cur);
  }
}

for (let i = 0; i < idxArr.length; i += 3) {
  const i0 = idxArr[i], i1 = idxArr[i+1], i2 = idxArr[i+2];
  const u0 = uvArr[i0*2], v0 = uvArr[i0*2+1];
  if (Math.abs(u0 - 0.448) < 0.005 && Math.abs(v0 - 0.038) < 0.005) {
    console.log('Found tri on island 1:');
    for (const vIdx of [i0, i1, i2]) {
      const p = [posArr[vIdx*3], posArr[vIdx*3+1], posArr[vIdx*3+2]];
      const nRaw = normalMap.get(posToKey(vIdx));
      const l = Math.hypot(nRaw[0], nRaw[1], nRaw[2]) || 1;
      const n = [nRaw[0]/l, nRaw[1]/l, nRaw[2]/l];
      const uv = [uvArr[vIdx*2], uvArr[vIdx*2+1]];
      console.log(`Vertex ${vIdx}: p=[${p.map(x=>x.toFixed(4))}], n=[${n.map(x=>x.toFixed(4))}], uv=[${uv.map(x=>x.toFixed(4))}]`);

      const uScaleX = (1067.0 - 71.0) / 896.0;
      const uScaleY = (1067.0 - 71.0) / 1200.0;
      const uOffsetY = 71.0 / 1200.0;
      const projUV = [0.50 + p[0] * uScaleX, (0.50 - p[1]) * uScaleY + uOffsetY];
      const sampleUV = [p[1] > 0.30 ? Math.min(Math.max(projUV[0], 0.26), 0.74) : projUV[0], projUV[1]];
      
      const depthWeight = Math.min(Math.max((p[2] - (-0.015)) / (0.025 - (-0.015)), 0.0), 1.0);
      let normalMin = 0.12, normalMax = 0.42;
      if (p[1] > 0.30) { normalMin = -0.45; normalMax = 0.10; }
      let normalWeight = Math.min(Math.max((n[2] - normalMin) / (normalMax - normalMin), 0.0), 1.0);
      if (p[2] > 0.005 && p[1] > 0.05) normalWeight = 1.0;

      console.log(`  projUV=[${projUV.map(x=>x.toFixed(4))}], sampleUV=[${sampleUV.map(x=>x.toFixed(4))}], depthW=${depthWeight.toFixed(3)}, normW=${normalWeight.toFixed(3)}`);
    }
    break;
  }
}
