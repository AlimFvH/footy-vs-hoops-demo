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

console.log(`Mesh loaded: ${accPos.count} vertices.`);

// Test a quick run deformation pass and measure execution time
function rotatePoint(px, py, pz, ox, oy, oz, pitch, yaw, roll) {
  // Translate to origin
  let x = px - ox, y = py - oy, z = pz - oz;

  // Yaw (Y axis)
  if (yaw !== 0) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const x1 = x * cy + z * sy;
    const z1 = -x * sy + z * cy;
    x = x1; z = z1;
  }
  // Pitch (X axis)
  if (pitch !== 0) {
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    const y1 = y * cp - z * sp;
    const z1 = y * sp + z * cp;
    y = y1; z = z1;
  }
  // Roll (Z axis)
  if (roll !== 0) {
    const cr = Math.cos(roll), sr = Math.sin(roll);
    const x1 = x * cr - y * sr;
    const y1 = x * sr + y * cr;
    x = x1; y = y1;
  }

  return [x + ox, y + oy, z + oz];
}

function smoothstep(min, max, val) {
  const t = Math.max(0, Math.min(1, (val - min) / (max - min)));
  return t * t * (3 - 2 * t);
}

const t0 = performance.now();
// Deform 1 frame of running pose
const legSin = Math.sin(2.5);
const legLPitch = legSin * 0.72;
const kneeLPitch = Math.max(0, legSin) * 1.15;
const legRPitch = -legSin * 0.72;
const kneeRPitch = Math.max(0, -legSin) * 1.15;
const armLPitch = -legSin * 0.85;
const armRPitch = legSin * 0.85;

const n = accPos.count;
for (let i = 0; i < n; i++) {
  const bx = basePos[i*3], by = basePos[i*3+1], bz = basePos[i*3+2];

  // Head weight: y > 0.28, |x| < 0.12
  const wHead = smoothstep(0.27, 0.32, by) * (1.0 - smoothstep(0.10, 0.15, Math.abs(bx)));

  // Left Leg: x > 0.015, y < 0.02
  const inLegL = smoothstep(0.005, 0.025, bx) * (1.0 - smoothstep(-0.01, 0.03, by));
  const wShinL = inLegL * (1.0 - smoothstep(-0.25, -0.19, by));
  const wThighL = inLegL - wShinL;

  // Right Leg: x < -0.015, y < 0.02
  const inLegR = (1.0 - smoothstep(-0.025, -0.005, bx)) * (1.0 - smoothstep(-0.01, 0.03, by));
  const wShinR = inLegR * (1.0 - smoothstep(-0.25, -0.19, by));
  const wThighR = inLegR - wShinR;

  // Left Arm: x > 0.14, y > -0.05
  const inArmL = smoothstep(0.13, 0.18, bx) * smoothstep(-0.05, 0.15, by);
  const wForearmL = inArmL * (1.0 - smoothstep(0.10, 0.18, by));
  const wUpperArmL = inArmL - wForearmL;

  // Right Arm: x < -0.14, y > -0.05
  const inArmR = (1.0 - smoothstep(-0.18, -0.13, bx)) * smoothstep(-0.05, 0.15, by);
  const wForearmR = inArmR * (1.0 - smoothstep(0.10, 0.18, by));
  const wUpperArmR = inArmR - wForearmR;

  const wTorso = Math.max(0, 1.0 - (wHead + inLegL + inLegR + inArmL + inArmR));

  // Compute positions
  let fx = bx * wTorso, fy = by * wTorso, fz = bz * wTorso;

  if (wHead > 0) {
    const p = rotatePoint(bx, by, bz, 0, 0.30, 0, 0.05, 0.10, 0);
    fx += p[0] * wHead; fy += p[1] * wHead; fz += p[2] * wHead;
  }
  if (wThighL > 0) {
    const p = rotatePoint(bx, by, bz, 0.08, 0.00, 0, -legLPitch, 0, 0);
    fx += p[0] * wThighL; fy += p[1] * wThighL; fz += p[2] * wThighL;
  }
  if (wShinL > 0) {
    // Shin rotates around knee, and also parent hip
    const pKnee = rotatePoint(bx, by, bz, 0.08, -0.22, 0, kneeLPitch, 0, 0);
    const p = rotatePoint(pKnee[0], pKnee[1], pKnee[2], 0.08, 0.00, 0, -legLPitch, 0, 0);
    fx += p[0] * wShinL; fy += p[1] * wShinL; fz += p[2] * wShinL;
  }
  if (wThighR > 0) {
    const p = rotatePoint(bx, by, bz, -0.08, 0.00, 0, -legRPitch, 0, 0);
    fx += p[0] * wThighR; fy += p[1] * wThighR; fz += p[2] * wThighR;
  }
  if (wShinR > 0) {
    const pKnee = rotatePoint(bx, by, bz, -0.08, -0.22, 0, kneeRPitch, 0, 0);
    const p = rotatePoint(pKnee[0], pKnee[1], pKnee[2], -0.08, 0.00, 0, -legRPitch, 0, 0);
    fx += p[0] * wShinR; fy += p[1] * wShinR; fz += p[2] * wShinR;
  }
  if (wUpperArmL > 0) {
    const p = rotatePoint(bx, by, bz, 0.18, 0.24, 0, armLPitch, 0, 0.12);
    fx += p[0] * wUpperArmL; fy += p[1] * wUpperArmL; fz += p[2] * wUpperArmL;
  }
  if (wForearmL > 0) {
    const pElbow = rotatePoint(bx, by, bz, 0.22, 0.12, 0, 0.45, 0, 0);
    const p = rotatePoint(pElbow[0], pElbow[1], pElbow[2], 0.18, 0.24, 0, armLPitch, 0, 0.12);
    fx += p[0] * wForearmL; fy += p[1] * wForearmL; fz += p[2] * wForearmL;
  }
  if (wUpperArmR > 0) {
    const p = rotatePoint(bx, by, bz, -0.18, 0.24, 0, armRPitch, 0, -0.12);
    fx += p[0] * wUpperArmR; fy += p[1] * wUpperArmR; fz += p[2] * wUpperArmR;
  }
  if (wForearmR > 0) {
    const pElbow = rotatePoint(bx, by, bz, -0.22, 0.12, 0, 0.45, 0, 0);
    const p = rotatePoint(pElbow[0], pElbow[1], pElbow[2], -0.18, 0.24, 0, armRPitch, 0, -0.12);
    fx += p[0] * wForearmR; fy += p[1] * wForearmR; fz += p[2] * wForearmR;
  }

  curPos[i*3] = fx; curPos[i*3+1] = fy; curPos[i*3+2] = fz;
}

const t1 = performance.now();
console.log(`Deformation of ${n} vertices completed in ${(t1 - t0).toFixed(2)} ms!`);
