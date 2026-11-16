const loader = require('../assets/loaders/glb_loader.js');
const fs = require('fs');

const buf = fs.readFileSync('assets/characters/footy10_raw_backup.glb');
const parsed = loader.parseGLBContainer(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const gltf = parsed.gltf;
const bin = parsed.bin;

const prim = gltf.meshes[0].primitives[0];
const accPos = gltf.accessors[prim.attributes.POSITION];
const bvPos = gltf.bufferViews[accPos.bufferView];
const basePos = new Float32Array(bin, bvPos.byteOffset, accPos.count * 3);
const curPos = new Float32Array(basePos);
const count = accPos.count;

function clampVal(v, min, max) {
  return v < min ? min : (v > max ? max : v);
}

function computeSkinWeights(basePos) {
  const weights = new Float32Array(count * 10);
  for (let i = 0; i < count; i++) {
    const bx = basePos[i * 3];
    const by = basePos[i * 3 + 1];
    const bz = basePos[i * 3 + 2];

    const wHead = clampVal((by - 0.28) / 0.05, 0, 1) * (1.0 - clampVal((Math.abs(bx) - 0.10) / 0.05, 0, 1));

    const inLegL = clampVal((bx - 0.01) / 0.02, 0, 1) * (1.0 - clampVal((by - (-0.01)) / 0.03, 0, 1));
    const wShinL = inLegL * (1.0 - clampVal((by - (-0.24)) / 0.06, 0, 1));
    const wThighL = inLegL - wShinL;

    const inLegR = clampVal((-bx - 0.01) / 0.02, 0, 1) * (1.0 - clampVal((by - (-0.01)) / 0.03, 0, 1));
    const wShinR = inLegR * (1.0 - clampVal((by - (-0.24)) / 0.06, 0, 1));
    const wThighR = inLegR - wShinR;

    const inArmL = clampVal((bx - 0.13) / 0.05, 0, 1) * clampVal((by - (-0.05)) / 0.15, 0, 1);
    const wForearmL = inArmL * (1.0 - clampVal((by - 0.10) / 0.08, 0, 1));
    const wArmL = inArmL - wForearmL;

    const inArmR = clampVal((-bx - 0.13) / 0.05, 0, 1) * clampVal((by - (-0.05)) / 0.15, 0, 1);
    const wForearmR = inArmR * (1.0 - clampVal((by - 0.10) / 0.08, 0, 1));
    const wArmR = inArmR - wForearmR;

    const nonTorso = wHead + inLegL + inLegR + inArmL + inArmR;
    const wTorso = Math.max(0, 1.0 - nonTorso);

    const off = i * 10;
    weights[off] = wHead;
    weights[off + 1] = wThighL;
    weights[off + 2] = wShinL;
    weights[off + 3] = wThighR;
    weights[off + 4] = wShinR;
    weights[off + 5] = wArmL;
    weights[off + 6] = wForearmL;
    weights[off + 7] = wArmR;
    weights[off + 8] = wForearmR;
    weights[off + 9] = wTorso;
  }
  return weights;
}

const weights = computeSkinWeights(basePos);

// Benchmarking 60 frames of skinning
const t0 = performance.now();
for (let frame = 0; frame < 60; frame++) {
  const stride = frame * 0.1;
  const legSin = Math.sin(stride);
  const legCos = Math.cos(stride);

  // joint angles
  const legLP = legSin * 0.65;
  const kneeLP = Math.max(0, legSin) * 1.1;
  const legRP = -legSin * 0.65;
  const kneeRP = Math.max(0, -legSin) * 1.1;
  const armLP = -legSin * 0.75;
  const armRP = legSin * 0.75;

  const cosLegL = Math.cos(legLP), sinLegL = Math.sin(legLP);
  const cosKneeL = Math.cos(kneeLP), sinKneeL = Math.sin(kneeLP);
  const cosLegR = Math.cos(legRP), sinLegR = Math.sin(legRP);
  const cosKneeR = Math.cos(kneeRP), sinKneeR = Math.sin(kneeRP);
  const cosArmL = Math.cos(armLP), sinArmL = Math.sin(armLP);
  const cosArmR = Math.cos(armRP), sinArmR = Math.sin(armRP);

  for (let i = 0; i < count; i++) {
    const off = i * 10;
    const wHead = weights[off];
    const wThighL = weights[off + 1];
    const wShinL = weights[off + 2];
    const wThighR = weights[off + 3];
    const wShinR = weights[off + 4];
    const wArmL = weights[off + 5];
    const wForearmL = weights[off + 6];
    const wArmR = weights[off + 7];
    const wForearmR = weights[off + 8];
    const wTorso = weights[off + 9];

    const bx = basePos[i * 3];
    const by = basePos[i * 3 + 1];
    const bz = basePos[i * 3 + 2];

    let px = bx * wTorso, py = by * wTorso, pz = bz * wTorso;

    if (wHead > 0) {
      px += bx * wHead; py += by * wHead; pz += bz * wHead;
    }
    if (wThighL > 0) {
      const y = by - 0.00, z = bz;
      const ry = y * cosLegL - z * sinLegL;
      const rz = y * sinLegL + z * cosLegL;
      px += bx * wThighL; py += (ry + 0.00) * wThighL; pz += rz * wThighL;
    }
    if (wShinL > 0) {
      // Rotate around knee (y=-0.22)
      const ky = by - (-0.22), kz = bz;
      const kry = ky * cosKneeL - kz * sinKneeL + (-0.22);
      const krz = ky * sinKneeL + kz * cosKneeL;
      // Then hip
      const ry = kry * cosLegL - krz * sinLegL;
      const rz = kry * sinLegL + krz * cosLegL;
      px += bx * wShinL; py += ry * wShinL; pz += rz * wShinL;
    }
    if (wThighR > 0) {
      const y = by - 0.00, z = bz;
      const ry = y * cosLegR - z * sinLegR;
      const rz = y * sinLegR + z * cosLegR;
      px += bx * wThighR; py += (ry + 0.00) * wThighR; pz += rz * wThighR;
    }
    if (wShinR > 0) {
      const ky = by - (-0.22), kz = bz;
      const kry = ky * cosKneeR - kz * sinKneeR + (-0.22);
      const krz = ky * sinKneeR + kz * cosKneeR;
      const ry = kry * cosLegR - krz * sinLegR;
      const rz = kry * sinLegR + krz * cosLegR;
      px += bx * wShinR; py += ry * wShinR; pz += rz * wShinR;
    }
    if (wArmL > 0 || wForearmL > 0) {
      const wTotal = wArmL + wForearmL;
      const y = by - 0.24, z = bz;
      const ry = y * cosArmL - z * sinArmL;
      const rz = y * sinArmL + z * cosArmL;
      px += bx * wTotal; py += (ry + 0.24) * wTotal; pz += rz * wTotal;
    }
    if (wArmR > 0 || wForearmR > 0) {
      const wTotal = wArmR + wForearmR;
      const y = by - 0.24, z = bz;
      const ry = y * cosArmR - z * sinArmR;
      const rz = y * sinArmR + z * cosArmR;
      px += bx * wTotal; py += (ry + 0.24) * wTotal; pz += rz * wTotal;
    }

    curPos[i * 3] = px; curPos[i * 3 + 1] = py; curPos[i * 3 + 2] = pz;
  }
}
const t1 = performance.now();
console.log(`60 frames completed in ${(t1 - t0).toFixed(2)} ms! Average per frame: ${((t1 - t0) / 60).toFixed(3)} ms!`);
