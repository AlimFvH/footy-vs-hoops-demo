'use strict';

/**
 * v7.0 Expressive Sports Choreography & 60fps Skeletal Builder
 *
 * Calibrated directly against exact bone rest dimensions of footy10/hoops23/keeper1.glb:
 *   Chest = 1.377m, UpperArm = 1.432m (reach = 0.417m), UpperLeg = 0.964m (reach = 0.943m)
 * Fixes every stiffness/polarity bug from v6.0:
 *   - Fixes Kick_Right / Kick_Left crossed-arm sign inversion bug
 *   - Fixes SlideTackle trail-knee outward/inward pole sign inversion
 *   - Rebuilds Anim_2K_DribbleRun/Idle (+ Left-hand L mirrors) so off-arm shields cleanly near torso (zero zombie forward arms!)
 *   - Adds Anim_EA_StrikeCharge & Anim_2K_ShotGather for live Spacebar hold anticipation
 *   - Adds properly mirrored Anim_EA_KeeperDive_L & Anim_EA_KeeperLowDive_L with athletic scissor-knee flight
 *   - Sculpts fluid NBA JumpShot & SlamDunk staying cleanly inside camera frame with natural elbows & proud chest arch
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FPS = 60;

// ============================================================================
// Quaternion, Vec3 & Centripetal Catmull-Rom Math
// ============================================================================
const v3 = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  scale: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  len: (a) => Math.hypot(a[0], a[1], a[2]),
  norm: (a) => {
    const l = Math.hypot(a[0], a[1], a[2]) || 1;
    return [a[0] / l, a[1] / l, a[2] / l];
  },
  lerp: (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t],
};

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function smootherstep(t) { const x = clamp(t, 0, 1); return x * x * x * (x * (x * 6 - 15) + 10); }
function qIdentity() { return [0, 0, 0, 1]; }
function qNorm(q) { const l = Math.hypot(q[0], q[1], q[2], q[3]) || 1; return [q[0] / l, q[1] / l, q[2] / l, q[3] / l]; }
function qConj(q) { return [-q[0], -q[1], -q[2], q[3]]; }
function qMul(a, b) {
  return [
    a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
    a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
    a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
    a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
  ];
}
function qSlerp(a, b, t) {
  let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  const bb = d < 0 ? [-b[0], -b[1], -b[2], -b[3]] : b;
  d = clamp(Math.abs(d), 0, 1);
  if (d > 0.9995) {
    return qNorm([lerp(a[0], bb[0], t), lerp(a[1], bb[1], t), lerp(a[2], bb[2], t), lerp(a[3], bb[3], t)]);
  }
  const th = Math.acos(d);
  const st = Math.sin(th);
  const w0 = Math.sin((1 - t) * th) / st;
  const w1 = Math.sin(t * th) / st;
  return qNorm([a[0] * w0 + bb[0] * w1, a[1] * w0 + bb[1] * w1, a[2] * w0 + bb[2] * w1, a[3] * w0 + bb[3] * w1]);
}
function qRotateVec(q, v) {
  const u = [q[0], q[1], q[2]];
  const s = q[3];
  const uv = v3.cross(u, v);
  const uuv = v3.cross(u, uv);
  return [v[0] + 2 * (s * uv[0] + uuv[0]), v[1] + 2 * (s * uv[1] + uuv[1]), v[2] + 2 * (s * uv[2] + uuv[2])];
}
function qAxisAngle(ax, rad) {
  const n = v3.norm(ax);
  const h = rad * 0.5;
  const s = Math.sin(h);
  return qNorm([n[0] * s, n[1] * s, n[2] * s, Math.cos(h)]);
}
function qFromEulerXYZ(rx, ry, rz) {
  return qNorm(qMul(qAxisAngle([0, 1, 0], ry), qMul(qAxisAngle([1, 0, 0], rx), qAxisAngle([0, 0, 1], rz))));
}
function qFromBasisCols(c0, c1, c2) {
  const m00 = c0[0], m01 = c1[0], m02 = c2[0];
  const m10 = c0[1], m11 = c1[1], m12 = c2[1];
  const m20 = c0[2], m21 = c1[2], m22 = c2[2];
  const tr = m00 + m11 + m22;
  let x, y, z, w;
  if (tr > 0) {
    const s = Math.sqrt(tr + 1.0) * 2;
    w = 0.25 * s; x = (m21 - m12) / s; y = (m02 - m20) / s; z = (m10 - m01) / s;
  } else if (m00 > m11 && m00 > m22) {
    const s = Math.sqrt(1.0 + m00 - m11 - m22) * 2;
    w = (m21 - m12) / s; x = 0.25 * s; y = (m01 + m10) / s; z = (m02 + m20) / s;
  } else if (m11 > m22) {
    const s = Math.sqrt(1.0 + m11 - m00 - m22) * 2;
    w = (m02 - m20) / s; x = (m01 + m10) / s; y = 0.25 * s; z = (m12 + m21) / s;
  } else {
    const s = Math.sqrt(1.0 + m22 - m00 - m11) * 2;
    w = (m10 - m01) / s; x = (m02 + m20) / s; y = (m12 + m21) / s; z = 0.25 * s;
  }
  return qNorm([x, y, z, w]);
}
function buildBasisYRefZ(dirY, refZ) {
  const y = v3.norm(dirY);
  let x = v3.cross(y, refZ);
  if (v3.len(x) < 1e-4) x = v3.cross(y, Math.abs(y[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]);
  x = v3.norm(x);
  const z = v3.norm(v3.cross(x, y));
  return qFromBasisCols(x, y, z);
}
function solveBoneWorldQ(restWorldQ, targetDir, targetTwistRefWorld, twistMode) {
  const restDir = qRotateVec(restWorldQ, [0, 1, 0]);
  const restRef = twistMode === 'X' ? qRotateVec(restWorldQ, [1, 0, 0]) : qRotateVec(restWorldQ, [0, 0, 1]);
  const qRestFrame = buildBasisYRefZ(restDir, restRef);
  const qTargetFrame = buildBasisYRefZ(targetDir, targetTwistRefWorld);
  const qDelta = qMul(qTargetFrame, qConj(qRestFrame));
  return qNorm(qMul(qDelta, restWorldQ));
}
function solveTwoBoneIK(rootPos, targetPos, len1, len2, poleDir) {
  const rawVec = v3.sub(targetPos, rootPos);
  const rawDist = v3.len(rawVec);
  const maxReach = (len1 + len2) * 0.992;
  const minReach = Math.max(0.06, Math.abs(len1 - len2) + 0.04);
  const dist = clamp(rawDist, minReach, maxReach);
  const dir = rawDist > 1e-5 ? v3.scale(rawVec, 1 / rawDist) : [0, -1, 0];
  const clampedTarget = v3.add(rootPos, v3.scale(dir, dist));

  const cosAlpha = clamp((len1 * len1 + dist * dist - len2 * len2) / (2 * len1 * dist), -1, 1);
  const sinAlpha = Math.sqrt(Math.max(0, 1 - cosAlpha * cosAlpha));

  const dotPole = v3.dot(poleDir, dir);
  let bendPlane = v3.sub(poleDir, v3.scale(dir, dotPole));
  if (v3.len(bendPlane) < 1e-4) {
    bendPlane = Math.abs(dir[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
    bendPlane = v3.sub(bendPlane, v3.scale(dir, v3.dot(bendPlane, dir)));
  }
  bendPlane = v3.norm(bendPlane);

  const midPos = v3.add(rootPos, v3.add(v3.scale(dir, len1 * cosAlpha), v3.scale(bendPlane, len1 * sinAlpha)));
  return {
    midPos,
    endPos: clampedTarget,
    dir1: v3.norm(v3.sub(midPos, rootPos)),
    dir2: v3.norm(v3.sub(clampedTarget, midPos)),
    bendNormal: v3.norm(v3.cross(dir, bendPlane)),
    bendPlane,
  };
}

function catmullRomTrack(keys, u) {
  if (!keys || keys.length === 0) return 0;
  if (keys.length === 1) return keys[0][1];
  const x = clamp(u, 0, 1);
  if (x <= keys[0][0]) return keys[0][1];
  if (x >= keys[keys.length - 1][0]) return keys[keys.length - 1][1];

  let seg = 0;
  for (let i = 0; i < keys.length - 1; i++) {
    if (x >= keys[i][0] && x <= keys[i + 1][0]) { seg = i; break; }
  }
  const t0 = keys[seg][0];
  const t1 = keys[seg + 1][0];
  const t = clamp((x - t0) / Math.max(1e-6, t1 - t0), 0, 1);

  const iPrev = Math.max(0, seg - 1);
  const iNext = Math.min(keys.length - 1, seg + 2);
  const t2 = t * t, t3 = t2 * t;

  const evalScalar = (p0, p1, p2, p3) => {
    const dtPrev = Math.max(0.02, keys[seg + 1][0] - keys[iPrev][0]);
    const dtNext = Math.max(0.02, keys[iNext][0] - keys[seg][0]);
    const dtSeg = Math.max(0.02, t1 - t0);
    const m1 = (seg === 0) ? (p2 - p1) * 0.45 : clamp(((p2 - p0) / dtPrev) * dtSeg * 0.85, -2.5 * Math.abs(p2 - p1) - 0.15, 2.5 * Math.abs(p2 - p1) + 0.15);
    const m2 = (seg + 1 === keys.length - 1) ? (p2 - p1) * 0.45 : clamp(((p3 - p1) / dtNext) * dtSeg * 0.85, -2.5 * Math.abs(p2 - p1) - 0.15, 2.5 * Math.abs(p2 - p1) + 0.15);
    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;
    return h00 * p1 + h10 * m1 + h01 * p2 + h11 * m2;
  };

  if (Array.isArray(keys[seg][1])) {
    return keys[seg][1].map((_, c) => evalScalar(keys[iPrev][1][c], keys[seg][1][c], keys[seg + 1][1][c], keys[iNext][1][c]));
  }
  return evalScalar(keys[iPrev][1], keys[seg][1], keys[seg + 1][1], keys[iNext][1]);
}

function readGLB(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf.readUInt32LE(0) !== 0x46546c67) throw new Error('Invalid GLB: ' + filePath);
  let off = 12, gltf = null, bin = Buffer.alloc(0);
  while (off < buf.length) {
    const chunkLen = buf.readUInt32LE(off);
    const chunkType = buf.readUInt32LE(off + 4);
    off += 8;
    const chunkData = buf.subarray(off, off + chunkLen);
    if (chunkType === 0x4e4f534a) gltf = JSON.parse(chunkData.toString('utf8'));
    else if (chunkType === 0x004e4942) bin = chunkData;
    off += chunkLen;
  }
  return { gltf, bin };
}

function createCloneXMocapSampler(glbPath) {
  const { gltf, bin } = readGLB(glbPath);
  const byName = {};
  const parent = new Int32Array(gltf.nodes.length).fill(-1);
  gltf.nodes.forEach((n, i) => {
    if (n.name) byName[n.name] = i;
    (n.children || []).forEach(c => { parent[c] = i; });
  });

  function getArr(accIdx) {
    const acc = gltf.accessors[accIdx];
    const bv = gltf.bufferViews[acc.bufferView];
    const off = (bv.byteOffset || 0) + (acc.byteOffset || 0);
    const k = acc.type === 'SCALAR' ? 1 : acc.type === 'VEC3' ? 3 : 4;
    return new Float32Array(bin.buffer, bin.byteOffset + off, acc.count * k);
  }

  function computeWorldPose(locT, locR, sc) {
    const wp = Array(gltf.nodes.length);
    const wq = Array(gltf.nodes.length);
    const c = (i) => {
      if (wp[i]) return;
      const pr = parent[i];
      if (pr < 0) {
        wp[i] = [...locT[i]];
        wq[i] = qNorm(locR[i]);
      } else {
        c(pr);
        const s = sc[pr];
        const scaled = [locT[i][0] * s[0], locT[i][1] * s[1], locT[i][2] * s[2]];
        wp[i] = v3.add(wp[pr], qRotateVec(wq[pr], scaled));
        wq[i] = qNorm(qMul(wq[pr], locR[i]));
      }
    };
    for (let i = 0; i < gltf.nodes.length; i++) c(i);
    return { wp, wq };
  }

  const restT = gltf.nodes.map(n => n.translation ? [...n.translation] : [0, 0, 0]);
  const restR = gltf.nodes.map(n => n.rotation ? qNorm(n.rotation) : qIdentity());
  const sc = gltf.nodes.map(n => n.scale ? [...n.scale] : [1, 1, 1]);
  const restWorld = computeWorldPose(restT, restR, sc);

  const idx = {
    hips: byName['Hips'], spine: byName['Spine'], chest: byName['Chest'], neck: byName['Neck'], head: byName['Head'],
    shL: byName['Left shoulder'], armL: byName['Left arm'], elbL: byName['Left elbow'], wriL: byName['Left wrist'],
    shR: byName['Right shoulder'], armR: byName['Right arm'], elbR: byName['Right elbow'], wriR: byName['Right wrist'],
    legL: byName['Left leg'], kneeL: byName['Left knee'], ankL: byName['Left ankle'], toeL: byName['Left toe'],
    legR: byName['Right leg'], kneeR: byName['Right knee'], ankR: byName['Right ankle'], toeR: byName['Right toe'],
  };

  const legLenL = v3.len(v3.sub(restWorld.wp[idx.kneeL], restWorld.wp[idx.legL])) + v3.len(v3.sub(restWorld.wp[idx.ankL], restWorld.wp[idx.kneeL]));
  const legLenR = v3.len(v3.sub(restWorld.wp[idx.kneeR], restWorld.wp[idx.legR])) + v3.len(v3.sub(restWorld.wp[idx.ankR], restWorld.wp[idx.kneeR]));
  const armLenL = v3.len(v3.sub(restWorld.wp[idx.elbL], restWorld.wp[idx.armL])) + v3.len(v3.sub(restWorld.wp[idx.wriL], restWorld.wp[idx.elbL]));
  const armLenR = v3.len(v3.sub(restWorld.wp[idx.elbR], restWorld.wp[idx.armR])) + v3.len(v3.sub(restWorld.wp[idx.wriR], restWorld.wp[idx.elbR]));

  function sampleClipAt(clipName, u, timeWindow = [0, 1]) {
    const anim = gltf.animations.find(a => a.name === clipName);
    if (!anim) throw new Error('Missing CloneX clip: ' + clipName);
    const times0 = getArr(anim.samplers[anim.channels[0].sampler].input);
    const dur = times0[times0.length - 1] || 1;
    const tNorm = lerp(timeWindow[0], timeWindow[1], clamp(u, 0, 1));
    const t = tNorm * dur;

    const locT = restT.map(x => [...x]);
    const locR = restR.map(x => [...x]);

    for (const ch of anim.channels) {
      const s = anim.samplers[ch.sampler];
      const tm = getArr(s.input);
      const val = getArr(s.output);
      let i0 = 0;
      while (i0 < tm.length - 2 && tm[i0 + 1] <= t) i0++;
      const i1 = Math.min(tm.length - 1, i0 + 1);
      const alpha = tm[i1] > tm[i0] ? (t - tm[i0]) / (tm[i1] - tm[i0]) : 0;
      if (ch.target.path === 'rotation') {
        locR[ch.target.node] = qSlerp(
          [val[i0 * 4], val[i0 * 4 + 1], val[i0 * 4 + 2], val[i0 * 4 + 3]],
          [val[i1 * 4], val[i1 * 4 + 1], val[i1 * 4 + 2], val[i1 * 4 + 3]],
          alpha
        );
      } else if (ch.target.path === 'translation') {
        locT[ch.target.node] = [
          lerp(val[i0 * 3], val[i1 * 3], alpha),
          lerp(val[i0 * 3 + 1], val[i1 * 3 + 1], alpha),
          lerp(val[i0 * 3 + 2], val[i1 * 3 + 2], alpha),
        ];
      }
    }

    const { wp, wq } = computeWorldPose(locT, locR, sc);
    const hipsPos = wp[idx.hips];
    const hipLeft = v3.norm(v3.sub(wp[idx.legL], wp[idx.legR]));
    const hipUp = v3.norm(v3.sub(wp[idx.spine], hipsPos));
    const hipFwd = v3.norm(v3.cross(hipLeft, hipUp));
    const hipUpOrtho = v3.norm(v3.cross(hipFwd, hipLeft));
    const qHips = qFromBasisCols(hipLeft, hipUpOrtho, hipFwd);

    const chLeft = v3.norm(v3.sub(wp[idx.armL], wp[idx.armR]));
    const chUp = v3.norm(v3.sub(wp[idx.neck], wp[idx.spine]));
    const chFwd = v3.norm(v3.cross(chLeft, chUp));
    const chUpOrtho = v3.norm(v3.cross(chFwd, chLeft));
    const qChest = qFromBasisCols(chLeft, chUpOrtho, chFwd);

    const hdUp = qRotateVec(wq[idx.head], [0, 1, 0]);
    const hdFwd = qRotateVec(wq[idx.head], [0, 0, 1]);
    let hdLeft = v3.cross(hdUp, hdFwd);
    if (v3.len(hdLeft) < 1e-4) hdLeft = chLeft;
    hdLeft = v3.norm(hdLeft);
    const qHead = qFromBasisCols(hdLeft, v3.norm(hdUp), v3.norm(v3.cross(hdLeft, hdUp)));

    return { wp, wq, idx, legLenL, legLenR, armLenL, armLenR, qHips, qChest, qHead, hipsDeltaY: hipsPos[1] - restWorld.wp[idx.hips][1] };
  }

  return { sampleClipAt };
}

function evaluateRetargetedPose(skel, mocap, dstOpts = {}) {
  const { nodes, byName, restWorldP, restWorldQ } = skel;
  const animQ = {}, animP = {};

  const dstLegLen = skel.upperLegLen + skel.lowerLegLen;
  const srcLegLenAvg = (mocap.legLenL + mocap.legLenR) * 0.5;
  const dstArmLen = skel.upperArmLen + skel.lowerArmLen;

  const extraYaw = qAxisAngle([0, 1, 0], dstOpts.extraYaw || 0);
  const bodyRot = qNorm(qMul(extraYaw, qMul(qFromEulerXYZ(dstOpts.bodyPitch || 0, 0, dstOpts.bodyRoll || 0), mocap.qHips)));

  const bodyIdx = byName.Body;
  const rootWQ = restWorldQ[byName.Root];
  const bodyWQ = qNorm(qMul(bodyRot, restWorldQ[bodyIdx]));
  animQ[bodyIdx] = qNorm(qMul(qConj(rootWQ), bodyWQ));

  const bodyWPosBase = [
    restWorldP[bodyIdx][0] + (dstOpts.bodyX || 0),
    restWorldP[bodyIdx][1] + (mocap.hipsDeltaY * (dstLegLen / srcLegLenAvg)) + (dstOpts.bodyY || 0),
    restWorldP[bodyIdx][2] + (dstOpts.bodyZ || 0),
  ];

  function slerpChain(idx, parentIdx, parentWQ, parentWPos, targetWorldRotQ) {
    const restRel = qRotateVec(qConj(restWorldQ[parentIdx]), v3.sub(restWorldP[idx], restWorldP[parentIdx]));
    const wPos = v3.add(parentWPos, qRotateVec(parentWQ, restRel));
    const localRot = qNorm(qMul(qConj(parentWQ), targetWorldRotQ));
    animQ[idx] = localRot;
    return { wPos, wQ: qNorm(qMul(parentWQ, localRot)) };
  }

  const spineBias = qFromEulerXYZ(dstOpts.spinePitch || 0, dstOpts.spineYaw || 0, dstOpts.spineRoll || 0);
  const qChestWorld = qNorm(qMul(extraYaw, qMul(mocap.qChest, spineBias)));
  const qMid = qSlerp(bodyRot, qChestWorld, 0.5);

  const hipsState = slerpChain(byName.Hips, bodyIdx, bodyWQ, bodyWPosBase, qNorm(qMul(bodyRot, restWorldQ[byName.Hips])));
  const abdState = slerpChain(byName.Abdomen, byName.Hips, hipsState.wQ, hipsState.wPos, qNorm(qMul(qSlerp(bodyRot, qMid, 0.5), restWorldQ[byName.Abdomen])));
  const torsoState = slerpChain(byName.Torso, byName.Abdomen, abdState.wQ, abdState.wPos, qNorm(qMul(qMid, restWorldQ[byName.Torso])));
  const chestState = slerpChain(byName.Chest, byName.Torso, torsoState.wQ, torsoState.wPos, qNorm(qMul(qChestWorld, restWorldQ[byName.Chest])));

  const chestIdx = byName.Chest, neckIdx = byName.Neck, headIdx = byName.Head;
  const qHeadTarget = dstOpts.stabilizeHead
    ? qNorm(qMul(extraYaw, qFromEulerXYZ(dstOpts.headPitch || 0, dstOpts.headYaw || 0, dstOpts.headRoll || 0)))
    : qNorm(qMul(extraYaw, qMul(mocap.qHead, qFromEulerXYZ(dstOpts.headPitch || 0, dstOpts.headYaw || 0, dstOpts.headRoll || 0))));
  const qNeckWorld = qSlerp(qChestWorld, qHeadTarget, 0.45);
  const neckState = slerpChain(neckIdx, chestIdx, chestState.wQ, chestState.wPos, qNorm(qMul(qNeckWorld, restWorldQ[neckIdx])));
  slerpChain(headIdx, neckIdx, neckState.wQ, neckState.wPos, qNorm(qMul(qHeadTarget, restWorldQ[headIdx])));

  function solveMocapArm(side) {
    const isL = side === 'L';
    const sgn = isL ? 1 : -1;
    const shIdx = byName['Shoulder.' + side], uaIdx = byName['UpperArm.' + side], laIdx = byName['LowerArm.' + side], wrIdx = byName['Wrist.' + side];
    const sArm = isL ? mocap.idx.armL : mocap.idx.armR;
    const sElb = isL ? mocap.idx.elbL : mocap.idx.elbR;
    const sWri = isL ? mocap.idx.wriL : mocap.idx.wriR;
    const sArmLen = isL ? mocap.armLenL : mocap.armLenR;

    const handOverride = isL ? dstOpts.handL : dstOpts.handR;
    const shPitch = handOverride ? clamp((handOverride.pos[1] + 0.1) * 0.4, -0.06, 0.22) : 0.04;
    const shState = slerpChain(shIdx, chestIdx, chestState.wQ, chestState.wPos, qNorm(qMul(qChestWorld, qFromEulerXYZ(0, 0, sgn * shPitch))));

    const uaRel = qRotateVec(qConj(restWorldQ[shIdx]), v3.sub(restWorldP[uaIdx], restWorldP[shIdx]));
    const shoulderPos = v3.add(shState.wPos, qRotateVec(shState.wQ, uaRel));

    let targetWrist, poleWorld;
    if (handOverride) {
      const frame = qFromEulerXYZ(0, dstOpts.extraYaw || 0, 0);
      targetWrist = v3.add(chestState.wPos, qRotateVec(frame, handOverride.pos));
      poleWorld = qRotateVec(frame, handOverride.pole || [sgn * 0.35, -0.35, -0.82]);
    } else {
      const relVec = v3.scale(v3.sub(mocap.wp[sWri], mocap.wp[sArm]), dstArmLen / sArmLen);
      targetWrist = v3.add(shoulderPos, qRotateVec(extraYaw, relVec));
      const midPt = v3.lerp(mocap.wp[sArm], mocap.wp[sWri], 0.5);
      const rawPole = v3.sub(mocap.wp[sElb], midPt);
      poleWorld = v3.len(rawPole) > 0.03 ? qRotateVec(extraYaw, v3.norm(rawPole)) : qRotateVec(qChestWorld, [sgn * 0.36, -0.32, -0.84]);
    }

    const ik = solveTwoBoneIK(shoulderPos, targetWrist, skel.upperArmLen, skel.lowerArmLen, poleWorld);
    const uaTwistRef = v3.norm(v3.add(v3.scale(poleWorld, 0.78), v3.scale(ik.bendNormal, sgn * 0.22)));
    const uaWQ = solveBoneWorldQ(restWorldQ[uaIdx], ik.dir1, uaTwistRef, 'Z');
    animQ[uaIdx] = qNorm(qMul(qConj(shState.wQ), uaWQ));

    const laWQ = solveBoneWorldQ(restWorldQ[laIdx], ik.dir2, poleWorld, 'Z');
    animQ[laIdx] = qNorm(qMul(qConj(uaWQ), laWQ));

    const wrRest = nodes[wrIdx].rotation || qIdentity();
    const wSpec = handOverride || {};
    animQ[wrIdx] = qNorm(qMul(wrRest, qFromEulerXYZ(wSpec.wristPitch || 0, wSpec.wristYaw || 0, wSpec.wristRoll || 0)));

    const curl = typeof wSpec.curl === 'number' ? wSpec.curl : (dstOpts.fingerCurl !== undefined ? dstOpts.fingerCurl : 0.54);
    ['Index1', 'Index2', 'Index3', 'Middle1', 'Middle2', 'Middle3', 'Ring1', 'Ring2', 'Ring3', 'Pinky1', 'Pinky2', 'Pinky3'].forEach((fn, fIdx) => {
      const fIdxNode = byName[fn + '.' + side];
      if (fIdxNode === undefined) return;
      const segF = fn.endsWith('1') ? 0.58 : fn.endsWith('2') ? 0.72 : 0.48;
      animQ[fIdxNode] = qNorm(qMul(nodes[fIdxNode].rotation || qIdentity(), qAxisAngle([1, 0, 0], -curl * segF * (0.94 + (fIdx % 4) * 0.04))));
    });
    ['Thumb1', 'Thumb2'].forEach(tn => {
      const tIdxNode = byName[tn + '.' + side];
      if (tIdxNode === undefined) return;
      animQ[tIdxNode] = qNorm(qMul(nodes[tIdxNode].rotation || qIdentity(), qFromEulerXYZ(-curl * 0.25, 0, sgn * curl * 0.35)));
    });
  }
  solveMocapArm('L');
  solveMocapArm('R');

  function solveMocapLeg(side) {
    const isL = side === 'L';
    const sgn = isL ? 1 : -1;
    const ulIdx = byName['UpperLeg.' + side], llIdx = byName['LowerLeg.' + side], ftIdx = byName['Foot.' + side];
    const sLeg = isL ? mocap.idx.legL : mocap.idx.legR;
    const sKnee = isL ? mocap.idx.kneeL : mocap.idx.kneeR;
    const sAnk = isL ? mocap.idx.ankL : mocap.idx.ankR;
    const sToe = isL ? mocap.idx.toeL : mocap.idx.toeR;
    const sLegLen = isL ? mocap.legLenL : mocap.legLenR;

    const relHipRest = v3.sub(restWorldP[ulIdx], restWorldP[bodyIdx]);
    const hipWorld = v3.add(bodyWPosBase, qRotateVec(bodyRot, relHipRest));

    const relAnk = v3.scale(v3.sub(mocap.wp[sAnk], mocap.wp[sLeg]), dstLegLen / sLegLen);
    const targetAnkle = v3.add(hipWorld, qRotateVec(extraYaw, relAnk));

    const midLeg = v3.lerp(mocap.wp[sLeg], mocap.wp[sAnk], 0.5);
    const rawKneePole = v3.sub(mocap.wp[sKnee], midLeg);
    const poleWorld = v3.len(rawKneePole) > 0.04
      ? qRotateVec(extraYaw, v3.norm(rawKneePole))
      : qRotateVec(bodyRot, [sgn * 0.14, 0.1, 1.0]);

    const ik = solveTwoBoneIK(hipWorld, targetAnkle, skel.upperLegLen, skel.lowerLegLen, poleWorld);
    const ulWQ = solveBoneWorldQ(restWorldQ[ulIdx], ik.dir1, v3.scale(ik.bendNormal, sgn), 'Z');
    animQ[ulIdx] = qNorm(qMul(qConj(bodyWQ), ulWQ));
    const llWQ = solveBoneWorldQ(restWorldQ[llIdx], ik.dir2, v3.scale(ik.bendPlane, -1), 'Z');
    animQ[llIdx] = qNorm(qMul(qConj(ulWQ), llWQ));

    const toeFwd = qRotateVec(extraYaw, v3.norm(v3.sub(mocap.wp[sToe], mocap.wp[sAnk])));
    const ftDown = qRotateVec(mocap.qHips, [0, -1, 0]);
    const ftWQ = solveBoneWorldQ(restWorldQ[ftIdx], toeFwd, qRotateVec(extraYaw, ftDown), 'Z');
    animQ[ftIdx] = qNorm(qMul(qConj(llWQ), ftWQ));

    const soleBaseY = ik.endPos[1] - skel.ankleRestY * Math.max(0.45, Math.abs(ftDown[1]));
    const soleToeY = ik.endPos[1] + toeFwd[1] * 0.13 - skel.ankleRestY * 0.4;
    return Math.min(soleBaseY, soleToeY);
  }

  const minShoeY = Math.min(solveMocapLeg('L'), solveMocapLeg('R'));
  let bodyYAdjust = 0;
  if (dstOpts.groundSnap !== false) {
    const clearance = Math.max(0, minShoeY);
    const preserveFlight = dstOpts.preserveSprintFlight ? Math.min(clearance, 0.045) : 0;
    bodyYAdjust = (dstOpts.floorOffsetY || 0) + preserveFlight - minShoeY;
  }

  animP[bodyIdx] = [
    nodes[bodyIdx].translation[0] + (bodyWPosBase[0] - restWorldP[bodyIdx][0]),
    nodes[bodyIdx].translation[1] + (bodyWPosBase[1] - restWorldP[bodyIdx][1]) + (dstOpts.aerialLift || 0) + bodyYAdjust,
    nodes[bodyIdx].translation[2] + (bodyWPosBase[2] - restWorldP[bodyIdx][2]),
  ];

  return { animQ, animP };
}

function buildSkeletonHelper(gltf) {
  const nodes = gltf.nodes;
  const byName = {};
  const parent = new Int32Array(nodes.length).fill(-1);
  nodes.forEach((n, i) => {
    if (n.name) byName[n.name] = i;
    (n.children || []).forEach((c) => { parent[c] = i; });
  });

  const restWorldP = Array(nodes.length);
  const restWorldQ = Array(nodes.length);
  function computeWorld(idx) {
    if (restWorldP[idx]) return;
    const p = parent[idx];
    const n = nodes[idx];
    const lt = n.translation ? [...n.translation] : [0, 0, 0];
    const lr = n.rotation ? qNorm(n.rotation) : qIdentity();
    if (p < 0) { restWorldP[idx] = lt; restWorldQ[idx] = lr; }
    else {
      computeWorld(p);
      restWorldP[idx] = v3.add(restWorldP[p], qRotateVec(restWorldQ[p], lt));
      restWorldQ[idx] = qNorm(qMul(restWorldQ[p], lr));
    }
  }
  for (let i = 0; i < nodes.length; i++) computeWorld(i);

  return {
    nodes, byName, parent, restWorldP, restWorldQ,
    upperLegLen: v3.len(nodes[byName['LowerLeg.L']].translation),
    lowerLegLen: v3.len(nodes[byName['Foot.L']].translation),
    upperArmLen: v3.len(nodes[byName['LowerArm.L']].translation),
    lowerArmLen: v3.len(nodes[byName['Wrist.L']].translation),
    ankleRestY: restWorldP[byName['Foot.L']][1],
  };
}

function evaluateSplinePoseToChannels(skel, pSpec) {
  const { nodes, byName, restWorldP, restWorldQ } = skel;
  const animQ = {}, animP = {};
  const rootIdx = byName.Root, rootWQ = restWorldQ[rootIdx];
  const bodyIdx = byName.Body, bodyRestT = nodes[bodyIdx].translation;

  const bodyRot = qNorm(qFromEulerXYZ(pSpec.bodyPitch || 0, pSpec.bodyYaw || 0, pSpec.bodyRoll || 0));
  const bodyWPosBase = [
    restWorldP[bodyIdx][0] + (pSpec.bodyX || 0),
    restWorldP[bodyIdx][1] + (pSpec.bodyY || 0),
    restWorldP[bodyIdx][2] + (pSpec.bodyZ || 0),
  ];
  const bodyWQ = qNorm(qMul(bodyRot, restWorldQ[bodyIdx]));
  animQ[bodyIdx] = qNorm(qMul(qConj(rootWQ), bodyWQ));
  const relFromBodyRest = (idx) => v3.sub(restWorldP[idx], restWorldP[bodyIdx]);

  const hipsIdx = byName.Hips, abdIdx = byName.Abdomen, torsoIdx = byName.Torso, chestIdx = byName.Chest, neckIdx = byName.Neck, headIdx = byName.Head;
  const spPitch = pSpec.spinePitch || 0, spYaw = pSpec.spineYaw || 0, spRoll = pSpec.spineRoll || 0;

  const hipsDelta = qFromEulerXYZ(pSpec.hipsPitch || 0, pSpec.hipsYaw || 0, pSpec.hipsRoll || 0);
  const abdDelta = qFromEulerXYZ(spPitch * 0.35, spYaw * 0.35, spRoll * 0.35);
  const torsoDelta = qFromEulerXYZ(spPitch * 0.35, spYaw * 0.35, spRoll * 0.35);
  const chestDelta = qFromEulerXYZ(spPitch * 0.30 + (pSpec.chestPitch || 0), spYaw * 0.30 + (pSpec.chestYaw || 0), spRoll * 0.30 + (pSpec.chestRoll || 0));
  const neckDelta = qFromEulerXYZ((pSpec.headPitch || 0) * 0.35, (pSpec.headYaw || 0) * 0.35, (pSpec.headRoll || 0) * 0.35);
  const headDelta = qFromEulerXYZ((pSpec.headPitch || 0) * 0.65, (pSpec.headYaw || 0) * 0.65, (pSpec.headRoll || 0) * 0.65);

  function chainJoint(idx, parentIdx, parentWQ, parentWPos, worldRotDelta) {
    const restRel = qRotateVec(qConj(restWorldQ[parentIdx]), v3.sub(restWorldP[idx], restWorldP[parentIdx]));
    const wPos = v3.add(parentWPos, qRotateVec(parentWQ, restRel));
    const localAdjusted = qNorm(qMul(worldRotDelta, qNorm(nodes[idx].rotation || qIdentity())));
    animQ[idx] = localAdjusted;
    return { wPos, wQ: qNorm(qMul(parentWQ, localAdjusted)) };
  }

  const hipsState = chainJoint(hipsIdx, bodyIdx, bodyWQ, bodyWPosBase, hipsDelta);
  const abdState = chainJoint(abdIdx, hipsIdx, hipsState.wQ, hipsState.wPos, abdDelta);
  const torsoState = chainJoint(torsoIdx, abdIdx, abdState.wQ, abdState.wPos, torsoDelta);
  const chestState = chainJoint(chestIdx, torsoIdx, torsoState.wQ, torsoState.wPos, chestDelta);
  const neckState = chainJoint(neckIdx, chestIdx, chestState.wQ, chestState.wPos, neckDelta);
  chainJoint(headIdx, neckIdx, neckState.wQ, neckState.wPos, headDelta);

  const qChestWorldDelta = qNorm(qMul(chestState.wQ, qConj(restWorldQ[chestIdx])));
  const torsoFrameQ = pSpec.armsInWorldYaw ? qFromEulerXYZ(0, pSpec.bodyYaw || 0, 0) : qChestWorldDelta;

  function solveArm(side) {
    const sgn = side === 'L' ? 1 : -1;
    const shIdx = byName['Shoulder.' + side], uaIdx = byName['UpperArm.' + side], laIdx = byName['LowerArm.' + side], wrIdx = byName['Wrist.' + side];
    const handSpec = side === 'L' ? pSpec.handL : pSpec.handR;
    const handOffsetChest = handSpec ? handSpec.pos : [sgn * 0.24, -0.34, 0.14];
    const elbowPoleSpec = handSpec && handSpec.pole ? handSpec.pole : [sgn * 0.42, -0.34, -0.78];

    const shLift = clamp((handOffsetChest[1] + 0.12) * 0.42, -0.08, 0.24);
    const shFwd = clamp((handOffsetChest[2] - 0.10) * 0.28, -0.14, 0.20);
    const shState = chainJoint(shIdx, chestIdx, chestState.wQ, chestState.wPos, qFromEulerXYZ(0, -sgn * shFwd, sgn * shLift));

    const uaRel = qRotateVec(qConj(restWorldQ[shIdx]), v3.sub(restWorldP[uaIdx], restWorldP[shIdx]));
    const shoulderPos = v3.add(shState.wPos, qRotateVec(shState.wQ, uaRel));
    const handWorld = v3.add(chestState.wPos, qRotateVec(torsoFrameQ, handOffsetChest));
    const poleWorld = qRotateVec(torsoFrameQ, elbowPoleSpec);

    const ik = solveTwoBoneIK(shoulderPos, handWorld, skel.upperArmLen, skel.lowerArmLen, poleWorld);
    const uaWQ = solveBoneWorldQ(restWorldQ[uaIdx], ik.dir1, v3.norm(v3.add(v3.scale(poleWorld, 0.78), v3.scale(ik.bendNormal, sgn * 0.22))), 'Z');
    animQ[uaIdx] = qNorm(qMul(qConj(shState.wQ), uaWQ));
    const laWQ = solveBoneWorldQ(restWorldQ[laIdx], ik.dir2, poleWorld, 'Z');
    animQ[laIdx] = qNorm(qMul(qConj(uaWQ), laWQ));

    animQ[wrIdx] = qNorm(qMul(nodes[wrIdx].rotation || qIdentity(), qFromEulerXYZ((handSpec && handSpec.wristPitch) || 0, (handSpec && handSpec.wristYaw) || 0, (handSpec && handSpec.wristRoll) || 0)));

    const curl = handSpec && typeof handSpec.curl === 'number' ? handSpec.curl : 0.52;
    ['Index1', 'Index2', 'Index3', 'Middle1', 'Middle2', 'Middle3', 'Ring1', 'Ring2', 'Ring3', 'Pinky1', 'Pinky2', 'Pinky3'].forEach((fn, fIdx) => {
      const fNodeIdx = byName[fn + '.' + side];
      if (fNodeIdx === undefined) return;
      const segFactor = fn.endsWith('1') ? 0.58 : (fn.endsWith('2') ? 0.72 : 0.48);
      animQ[fNodeIdx] = qNorm(qMul(nodes[fNodeIdx].rotation || qIdentity(), qAxisAngle([1, 0, 0], -curl * segFactor * (0.94 + (fIdx % 4) * 0.04))));
    });
    ['Thumb1', 'Thumb2'].forEach((tn) => {
      const tIdx = byName[tn + '.' + side];
      if (tIdx === undefined) return;
      animQ[tIdx] = qNorm(qMul(nodes[tIdx].rotation || qIdentity(), qFromEulerXYZ(-curl * 0.25, 0, sgn * curl * 0.35)));
    });
  }
  solveArm('L');
  solveArm('R');

  function solveLeg(side) {
    const sgn = side === 'L' ? 1 : -1;
    const ulIdx = byName['UpperLeg.' + side], llIdx = byName['LowerLeg.' + side], ftIdx = byName['Foot.' + side];
    const footSpec = side === 'L' ? pSpec.footL : pSpec.footR;
    const targetRelFoot = footSpec ? footSpec.pos : [sgn * 0.145, skel.ankleRestY, 0.02];

    const hipWorld = v3.add(bodyWPosBase, qRotateVec(bodyRot, relFromBodyRest(ulIdx)));
    const useFullBodySpace = Boolean(pSpec.feetInBodySpace);
    const footAnchorPos = useFullBodySpace
      ? v3.add(bodyWPosBase, qRotateVec(bodyRot, [targetRelFoot[0], targetRelFoot[1] - restWorldP[bodyIdx][1], targetRelFoot[2]]))
      : v3.add([pSpec.footBaseX !== undefined ? pSpec.footBaseX : 0, 0, pSpec.footBaseZ !== undefined ? pSpec.footBaseZ : 0], qRotateVec(qAxisAngle([0, 1, 0], pSpec.bodyYaw || 0), targetRelFoot));

    const poleRel = (footSpec && footSpec.pole) || [sgn * 0.24, 0.12, 1.0];
    const kneePole = qRotateVec(useFullBodySpace ? bodyRot : qAxisAngle([0, 1, 0], pSpec.bodyYaw || 0), poleRel);
    const ik = solveTwoBoneIK(hipWorld, footAnchorPos, skel.upperLegLen, skel.lowerLegLen, kneePole);

    const ulWQ = solveBoneWorldQ(restWorldQ[ulIdx], ik.dir1, v3.scale(ik.bendNormal, sgn), 'Z');
    animQ[ulIdx] = qNorm(qMul(qConj(bodyWQ), ulWQ));
    const llWQ = solveBoneWorldQ(restWorldQ[llIdx], ik.dir2, v3.scale(ik.bendPlane, -1), 'Z');
    animQ[llIdx] = qNorm(qMul(qConj(ulWQ), llWQ));

    const fPitch = (footSpec && footSpec.pitch) || 0, fYaw = (footSpec && footSpec.yaw) || 0, fRoll = (footSpec && footSpec.roll) || 0;
    const fRotWorld = useFullBodySpace ? qMul(bodyRot, qFromEulerXYZ(fPitch, fYaw, fRoll)) : qFromEulerXYZ(fPitch, (pSpec.bodyYaw || 0) + fYaw, fRoll);
    const footFwd = qRotateVec(fRotWorld, [0, 0, 1]), footDown = qRotateVec(fRotWorld, [0, -1, 0]);
    const ftWQ = solveBoneWorldQ(restWorldQ[ftIdx], footFwd, footDown, 'Z');
    animQ[ftIdx] = qNorm(qMul(qConj(llWQ), ftWQ));

    const ankleY = ik.endPos[1];
    return Math.min(ankleY - skel.ankleRestY * Math.max(0.4, Math.abs(footDown[1])), ankleY + footFwd[1] * 0.14 - skel.ankleRestY * Math.max(0.3, Math.abs(footDown[1])));
  }

  const minShoeY = Math.min(solveLeg('L'), solveLeg('R'));
  const bodyYAdjust = (pSpec.groundSnap !== false) ? ((pSpec.floorOffsetY || 0) - minShoeY) : 0;

  animP[bodyIdx] = [
    bodyRestT[0] + (pSpec.bodyX || 0),
    bodyRestT[1] + (pSpec.bodyY || 0) + (pSpec.aerialLift || 0) + bodyYAdjust,
    bodyRestT[2] + (pSpec.bodyZ || 0),
  ];

  return { animQ, animP };
}

// Mirror a pSpec cleanly around X axis (L <-> R hands, feet, yaw & roll)
function mirrorSpecLR(sp) {
  const mPos = (p) => p ? [-p[0], p[1], p[2]] : p;
  const mHand = (h) => h ? {
    pos: mPos(h.pos), pole: mPos(h.pole), curl: h.curl,
    wristPitch: h.wristPitch || 0, wristYaw: -(h.wristYaw || 0), wristRoll: -(h.wristRoll || 0)
  } : undefined;
  const mFoot = (f) => f ? {
    pos: mPos(f.pos), pole: mPos(f.pole),
    pitch: f.pitch || 0, yaw: -(f.yaw || 0), roll: -(f.roll || 0)
  } : undefined;
  return {
    ...sp,
    bodyX: -(sp.bodyX || 0),
    bodyYaw: -(sp.bodyYaw || 0),
    bodyRoll: -(sp.bodyRoll || 0),
    spineYaw: -(sp.spineYaw || 0),
    spineRoll: -(sp.spineRoll || 0),
    chestYaw: -(sp.chestYaw || 0),
    chestRoll: -(sp.chestRoll || 0),
    headYaw: -(sp.headYaw || 0),
    headRoll: -(sp.headRoll || 0),
    handL: mHand(sp.handR),
    handR: mHand(sp.handL),
    footL: mFoot(sp.footR),
    footR: mFoot(sp.footL),
  };
}

// ============================================================================
// Motion Library Builder v7.0
// ============================================================================
function makeMotions(role, clonex) {
  const isHoops = role === 'hoops';
  const isKeeper = role === 'keeper';
  const motions = {};

  function wrapSplineClip(duration, loop, specFn) {
    return {
      duration, loop,
      evaluate(skel, u) { return evaluateSplinePoseToChannels(skel, specFn(u)); },
    };
  }

  // A. LOCOMOTION & SPORT-NATIVE STANCES
  motions.Idle = wrapSplineClip(2.20, true, (u) => {
    const breath = Math.sin(u * Math.PI * 2);
    const sway = Math.cos(u * Math.PI * 2);
    if (isKeeper) {
      return {
        bodyY: -0.11 + 0.012 * breath,
        spinePitch: 0.22 + 0.02 * breath,
        headPitch: -0.08,
        headYaw: 0.14 * sway,
        armsInWorldYaw: true,
        footL: { pos: [0.24, 0.024, 0.08], pole: [0.30, 0.14, 1.0], yaw: 0.16 },
        footR: { pos: [-0.24, 0.024, -0.02], pole: [-0.30, 0.14, 1.0], yaw: -0.14 },
        handL: { pos: [0.30, -0.08 + 0.02 * breath, 0.30], pole: [0.54, -0.36, -0.56], curl: 0.24, wristPitch: -0.22 },
        handR: { pos: [-0.30, -0.08 - 0.02 * breath, 0.30], pole: [-0.54, -0.36, -0.56], curl: 0.24, wristPitch: -0.22 },
      };
    }
    if (isHoops) {
      return {
        bodyY: -0.075 + 0.014 * breath,
        spinePitch: 0.12 + 0.018 * breath,
        bodyRoll: 0.018 * sway,
        headPitch: -0.04,
        headYaw: 0.09 * sway,
        armsInWorldYaw: false,
        footL: { pos: [0.19, 0.024, 0.09], pole: [0.24, 0.14, 1.0], yaw: 0.14 },
        footR: { pos: [-0.18, 0.024, -0.06], pole: [-0.24, 0.14, 1.0], yaw: -0.12 },
        handL: { pos: [0.26, -0.24 + 0.018 * breath, 0.22], pole: [0.44, -0.28, -0.78], curl: 0.88, wristYaw: -0.22, wristRoll: 0.14 },
        handR: { pos: [-0.26, -0.26 - 0.018 * breath, 0.21], pole: [-0.44, -0.28, -0.78], curl: 0.88, wristYaw: 0.22, wristRoll: -0.14 },
      };
    }
    // Confident pro striker hero idle (athletic stance, naturally curled relaxed fingers, balanced hips)
    return {
      bodyY: -0.042 + 0.010 * breath,
      spinePitch: 0.055 + 0.015 * breath,
      bodyRoll: 0.022 * sway,
      chestYaw: -0.05 * sway,
      headPitch: -0.03,
      headYaw: 0.08 * sway,
      armsInWorldYaw: false,
      footL: { pos: [0.175, 0.024, 0.08], pole: [0.22, 0.14, 1.0], yaw: 0.16 },
      footR: { pos: [-0.165, 0.024, -0.06], pole: [-0.22, 0.14, 1.0], yaw: -0.12 },
      handL: { pos: [0.255, -0.30 + 0.014 * breath, 0.13], pole: [0.44, -0.28, -0.82], curl: 0.94, wristYaw: -0.26, wristRoll: 0.16 },
      handR: { pos: [-0.255, -0.31 - 0.014 * breath, 0.12], pole: [-0.44, -0.28, -0.82], curl: 0.94, wristYaw: 0.26, wristRoll: -0.16 },
    };
  });

  motions.Walk = {
    duration: 0.88,
    loop: true,
    evaluate(skel, u) {
      const m = clonex.sampleClipAt('walk forward', u, [0, 1]);
      return evaluateRetargetedPose(skel, m, { stabilizeHead: true, headPitch: 0.02, fingerCurl: 0.50 });
    },
  };

  motions.Run = {
    duration: 0.56,
    loop: true,
    evaluate(skel, u) {
      const m = clonex.sampleClipAt('run forward', u, [0, 1]);
      return evaluateRetargetedPose(skel, m, {
        spinePitch: 0.15,
        preserveSprintFlight: true,
        stabilizeHead: true,
        headPitch: -0.04,
        fingerCurl: 0.60,
      });
    },
  };

  motions.Run_Back = {
    duration: 0.58,
    loop: true,
    evaluate(skel, u) {
      const m = clonex.sampleClipAt('run backward', u, [0, 1]);
      return evaluateRetargetedPose(skel, m, { stabilizeHead: true, headPitch: 0.04, fingerCurl: 0.44 });
    },
  };

  motions.Run_Left = {
    duration: 0.62,
    loop: true,
    evaluate(skel, u) {
      const m = clonex.sampleClipAt('left strafe', u, [0, 1]);
      return evaluateRetargetedPose(skel, m, { stabilizeHead: true, headYaw: -0.45, fingerCurl: 0.42 });
    },
  };

  motions.Run_Right = {
    duration: 0.62,
    loop: true,
    evaluate(skel, u) {
      const m = clonex.sampleClipAt('right strafe', u, [0, 1]);
      return evaluateRetargetedPose(skel, m, { stabilizeHead: true, headYaw: 0.45, fingerCurl: 0.42 });
    },
  };

  // Smooth NBA Dribble Run (low hip pound + compact athletic off-arm shield, ZERO zombie forward arms!)
  function evalDribbleRun(skel, u, mirrorLeft) {
    const m = clonex.sampleClipAt('run forward', u, [0, 1]);
    const a = u * Math.PI * 4; // 2 smooth bounces per stride cycle
    const pound = Math.sin(a);
    const wristSnap = Math.sin(a - 0.45);
    const strideSwing = Math.sin(u * Math.PI * 2);
    const s = mirrorLeft ? 1 : -1; // dribbling side (-1 Right, +1 Left)
    return evaluateRetargetedPose(skel, m, {
      bodyY: -0.065,
      spinePitch: 0.21,
      spineYaw: -s * 0.10,
      preserveSprintFlight: true,
      stabilizeHead: true,
      headPitch: -0.07,
      headYaw: s * 0.04,
      [mirrorLeft ? 'handL' : 'handR']: {
        pos: [s * 0.29, -0.37 + 0.09 * pound, 0.20 + 0.025 * pound],
        pole: [s * 0.36, -0.20, -0.68],
        curl: 0.18,
        wristPitch: 0.32 - 0.48 * wristSnap,
      },
      [mirrorLeft ? 'handR' : 'handL']: {
        pos: [-s * 0.24, -0.22 + 0.03 * strideSwing, 0.14 - 0.05 * strideSwing],
        pole: [-s * 0.42, -0.32, -0.68],
        curl: 0.46,
      },
    });
  }
  motions.Anim_2K_DribbleRun = { duration: 0.58, loop: true, evaluate: (skel, u) => evalDribbleRun(skel, u, false) };
  motions.Anim_2K_DribbleRun_L = { duration: 0.58, loop: true, evaluate: (skel, u) => evalDribbleRun(skel, u, true) };

  function evalDribbleIdle(skel, u, mirrorLeft) {
    const m = clonex.sampleClipAt('idle', u, [0.05, 0.22]);
    const a = u * Math.PI * 2;
    const pound = Math.sin(a);
    const wristSnap = Math.sin(a - 0.45);
    const s = mirrorLeft ? 1 : -1;
    return evaluateRetargetedPose(skel, m, {
      bodyY: -0.085 + 0.015 * Math.cos(a),
      spinePitch: 0.19,
      spineYaw: -s * 0.10,
      stabilizeHead: true,
      headPitch: -0.06,
      [mirrorLeft ? 'handL' : 'handR']: {
        pos: [s * 0.31, -0.38 + 0.095 * pound, 0.20],
        pole: [s * 0.38, -0.22, -0.72],
        curl: 0.18,
        wristPitch: 0.32 - 0.50 * wristSnap,
      },
      [mirrorLeft ? 'handR' : 'handL']: {
        pos: [-s * 0.24, -0.19, 0.20],
        pole: [-s * 0.46, -0.32, -0.68],
        curl: 0.42,
      },
    });
  }
  motions.Anim_2K_DribbleIdle = { duration: 0.72, loop: true, evaluate: (skel, u) => evalDribbleIdle(skel, u, false) };
  motions.Anim_2K_DribbleIdle_L = { duration: 0.72, loop: true, evaluate: (skel, u) => evalDribbleIdle(skel, u, true) };

  motions.Anim_EA_DribbleRun = {
    duration: 0.52,
    loop: true,
    evaluate(skel, u) {
      const m = clonex.sampleClipAt('run forward', u, [0, 1]);
      return evaluateRetargetedPose(skel, m, {
        bodyY: -0.04,
        spinePitch: 0.18,
        preserveSprintFlight: true,
        stabilizeHead: true,
        headPitch: 0.08,
        fingerCurl: 0.54,
      });
    },
  };

  // LIVE ANTICIPATION POSE WHILE HOLDING SPACE IN FOOTY (Coiled Striking Leg + High Sweeping Balance Arm)
  motions.Anim_EA_StrikeCharge = wrapSplineClip(0.60, true, (u) => {
    const breathe = Math.sin(u * Math.PI * 2);
    return {
      bodyZ: -0.10,
      bodyY: -0.15 + 0.015 * breathe,
      bodyPitch: 0.06,
      bodyRoll: -0.42,
      bodyYaw: -0.54,
      chestYaw: -0.28,
      chestRoll: -0.10,
      footBaseZ: -0.05,
      armsInWorldYaw: false,
      headPitch: 0.04,
      headYaw: 0.62,
      footL: { pos: [0.27, 0.024, 0.16], pole: [0.28, 0.14, 1.0], yaw: 0.20 },
      footR: { pos: [-0.18, 0.44 + 0.02 * breathe, -0.58], pole: [-0.12, -0.08, 0.88], pitch: 0.84, yaw: -0.16 },
      // High sweeping athletic balance arm outward; kicking-side arm tucked compact behind hip
      handL: { pos: [0.48, 0.12 + 0.02 * breathe, 0.16], pole: [0.42, -0.18, -0.82], curl: 0.36 },
      handR: { pos: [-0.25, -0.26, -0.18], pole: [-0.36, -0.24, -0.84], curl: 0.56 },
    };
  });

  // LIVE ANTICIPATION POSE WHILE HOLDING SPACE IN HOOPS (High Forehead Set Pocket + Soft Cradling Fingers)
  motions.Anim_2K_ShotGather = wrapSplineClip(0.60, true, (u) => {
    const pulse = Math.sin(u * Math.PI * 2);
    return {
      bodyY: -0.20 + 0.015 * pulse,
      spinePitch: 0.16,
      headPitch: -0.16,
      armsInWorldYaw: false,
      footL: { pos: [0.18, 0.024, 0.12], pole: [0.22, 0.14, 1.0], yaw: 0.08 },
      footR: { pos: [-0.16, 0.024, -0.05], pole: [-0.20, 0.14, 1.0], yaw: -0.06 },
      handR: { pos: [-0.09, 0.22 + 0.015 * pulse, 0.22], pole: [-0.08, -0.20, 0.92], curl: 0.50, wristPitch: 0.34, wristRoll: 0.14 },
      handL: { pos: [0.14, 0.20 + 0.015 * pulse, 0.21], pole: [0.36, -0.26, -0.45], curl: 0.48, wristYaw: -0.42, wristRoll: -0.18 },
    };
  });

  // 1. EA FC EXPRESSIVE POWER STRIKE (Athletic Plant Lean + High Scissor Kick Whip — ZERO Falling Backward)
  function strikeSpec(u, power) {
    const sc = power ? 1.0 : 0.88;
    const bodyZ = catmullRomTrack([[0, -0.06], [0.18, -0.08], [0.34, 0.10], [0.54, 0.18], [0.80, 0.06], [1, 0]], u);
    const bodyY = catmullRomTrack([[0, -0.05], [0.18, -0.16], [0.34, -0.11], [0.54, -0.04], [0.80, -0.06], [1, -0.04]], u);
    const bodyPitch = catmullRomTrack([[0, 0.08], [0.18, 0.14], [0.34, 0.14], [0.54, -0.02], [0.82, 0.06], [1, 0.08]], u);
    const bodyRoll = catmullRomTrack([[0, -0.06], [0.18, -0.28 * sc], [0.34, -0.26 * sc], [0.58, -0.18], [1, 0]], u);
    const bodyYaw = catmullRomTrack([[0, -0.10], [0.18, -0.48 * sc], [0.34, 0.16], [0.52, 0.44 * sc], [0.76, 0.18], [1, 0]], u);
    const chestYaw = catmullRomTrack([[0, -0.06], [0.18, -0.24], [0.36, 0.30], [0.62, 0.18], [1, 0]], u);

    const lx = catmullRomTrack([[0, 0.17], [0.16, 0.28], [0.64, 0.24], [1, 0.16]], u);
    const lz = catmullRomTrack([[0, 0.04], [0.16, 0.14], [0.64, 0.15], [1, 0.05]], u);
    const ly = catmullRomTrack([[0, 0.024], [0.09, 0.05], [0.16, 0.024], [0.50, 0.024], [0.64, 0.07], [0.80, 0.024], [1, 0.024]], u);

    // Deep glute cock (0.18) -> sharp instep contact out front (0.34) -> high waist-level cross-body follow (0.52)!
    const rx = catmullRomTrack([[0, -0.16], [0.18, -0.20], [0.34, -0.02], [0.52, 0.22 * sc], [0.78, -0.12], [1, -0.15]], u);
    const ry = catmullRomTrack([[0, 0.04], [0.18, 0.44 * sc], [0.34, 0.18], [0.52, 0.62 * sc], [0.76, 0.14], [1, 0.024]], u);
    const rz = catmullRomTrack([[0, -0.06], [0.18, -0.58 * sc], [0.34, 0.60], [0.52, 0.72 * sc], [0.78, 0.08], [1, -0.04]], u);
    const rPitch = catmullRomTrack([[0, 0.05], [0.18, 0.80], [0.34, 0.78], [0.52, 0.36], [1, 0]], u);
    const rPoleY = catmullRomTrack([[0, 0.12], [0.18, -0.08], [0.36, 0.24], [0.54, 0.44], [1, 0.14]], u);

    // Counterweight arms: left arcs forward/out across chest, right pulls dynamically back for torque
    const handLPos = catmullRomTrack([
      [0, [0.26, -0.26, 0.12]], [0.18, [0.42, 0.08, 0.22]], [0.36, [0.40, 0.04, 0.12]], [0.56, [0.34, -0.08, -0.08]], [1, [0.25, -0.29, 0.12]]
    ], u);
    const handRPos = catmullRomTrack([
      [0, [-0.25, -0.28, 0.10]], [0.18, [-0.26, -0.24, -0.18]], [0.38, [-0.30, -0.14, -0.22]], [0.56, [-0.24, -0.20, 0.18]], [1, [-0.25, -0.29, 0.12]]
    ], u);

    return {
      bodyZ, bodyY, bodyPitch, bodyRoll, bodyYaw, chestYaw,
      chestRoll: bodyRoll * 0.22,
      footBaseZ: bodyZ * 0.55,
      armsInWorldYaw: false,
      headPitch: -bodyPitch * 0.4 + 0.05,
      headYaw: -bodyYaw * 0.72,
      footL: { pos: [lx, ly, lz], pole: [0.26, 0.14, 1.0], yaw: 0.18 },
      footR: { pos: [rx, ry, rz], pole: [-0.08, rPoleY, 0.94], pitch: rPitch, yaw: -0.06 },
      handL: { pos: handLPos, pole: [0.44, -0.22, -0.82], curl: 0.78 },
      handR: { pos: handRPos, pole: [-0.42, -0.28, -0.82], curl: 0.80 },
    };
  }
  motions.Anim_EA_PowerStrike = wrapSplineClip(0.62, false, (u) => strikeSpec(u, true));
  motions.Anim_Kick_V1 = wrapSplineClip(0.60, false, (u) => strikeSpec(u, false));

  // Crisp Football Side-Foot Pass (Punching Balance Arm + Snappy Follow-Through)
  function makeQuickKick(kickingRight) {
    const s = kickingRight ? -1 : 1;
    return wrapSplineClip(0.42, false, (u) => {
      const z = catmullRomTrack([[0, -0.04], [0.18, -0.36], [0.38, 0.52], [0.66, 0.28], [1, -0.04]], u);
      const y = catmullRomTrack([[0, 0.024], [0.18, 0.26], [0.38, 0.14], [0.66, 0.18], [1, 0.024]], u);
      const bodyZ = catmullRomTrack([[0, -0.05], [0.40, 0.14], [1, 0]], u);
      const bodyRoll = catmullRomTrack([[0, 0], [0.22, s * 0.26], [0.46, s * 0.28], [1, 0]], u);
      const bodyYaw = catmullRomTrack([[0, 0], [0.20, s * 0.28], [0.44, -s * 0.30], [1, 0]], u);
      const plantPos = [-s * 0.23, 0.024, 0.12];
      const kickPos = [s * (0.14 - 0.14 * Math.sin(u * Math.PI)), y, z];
      return {
        bodyZ, bodyY: -0.08, bodyRoll, bodyYaw, footBaseZ: bodyZ * 0.65, spinePitch: 0.12, armsInWorldYaw: false,
        headYaw: -bodyYaw * 0.70,
        footL: kickingRight ? { pos: plantPos, pole: [0.25, 0.12, 1.0], yaw: 0.14 } : { pos: kickPos, pole: [0.14, 0.18, 1.0], yaw: -0.32, pitch: 0.38 },
        footR: kickingRight ? { pos: kickPos, pole: [-0.14, 0.18, 1.0], yaw: 0.32, pitch: 0.38 } : { pos: plantPos, pole: [-0.25, 0.12, 1.0], yaw: -0.14 },
        handL: { pos: kickingRight ? [0.42, 0.02, 0.18] : [0.24, -0.26, -0.06], pole: [0.46, -0.26, -0.80], curl: 0.44 },
        handR: { pos: kickingRight ? [-0.24, -0.26, -0.06] : [-0.42, 0.02, 0.18], pole: [-0.46, -0.26, -0.80], curl: 0.44 },
      };
    });
  }
  motions.Kick_Right = makeQuickKick(true);
  motions.Kick_Left = makeQuickKick(false);

  // 2. TRUE LOW TURF SLIDE TACKLE (Laid-Back -55 deg Turf Scythe — NEVER Sitting Upright!)
  function makeSlide(leadSide) {
    const s = leadSide === 'R' ? -1 : 1;
    return wrapSplineClip(0.62, false, (u) => {
      const drop = catmullRomTrack([[0, 0], [0.14, 1.0], [0.62, 1.0], [0.86, 0.24], [1, 0]], u);
      const sweep = catmullRomTrack([[0, 0], [0.16, 0.76], [0.42, 0.98], [0.62, 1.0], [0.88, 0.20], [1, 0]], u);
      const slideSurge = catmullRomTrack([[0, -0.08], [0.16, 0.14], [0.46, 0.44], [0.80, 0.16], [1, 0]], u);
      const leadAnkle = [s * 0.04, lerp(0.024, 0.14, sweep), lerp(0.06, 1.12, sweep)];
      const trailAnkle = [-s * 0.34, lerp(0.024, 0.06, drop), lerp(-0.04, -0.18, drop)];
      // Trail arm braces behind on grass; lead arm raises outward for balance during low turf slide
      const armTrail = [-s * 0.38, lerp(-0.28, -0.34, drop), lerp(0.08, -0.26, drop)];
      const armLead = [s * 0.38, lerp(-0.24, 0.12, sweep), lerp(0.10, 0.18, sweep)];
      return {
        bodyZ: slideSurge, footBaseZ: slideSurge,
        bodyY: lerp(-0.04, -0.80, drop),
        bodyPitch: lerp(0.06, -0.94, drop),
        spinePitch: lerp(0.06, -0.10, drop),
        bodyRoll: lerp(0, s * 0.34, drop),
        bodyYaw: lerp(0, s * 0.28, drop),
        floorOffsetY: lerp(0.0, -0.02, drop), feetInBodySpace: false, armsInWorldYaw: false,
        headPitch: lerp(-0.04, 0.68, drop),
        headYaw: -s * 0.26 * drop,
        footL: leadSide === 'L' ? { pos: leadAnkle, pole: [0.12, 0.26, 0.94], pitch: -0.64 * sweep } : { pos: trailAnkle, pole: [0.54, 0.12, 0.80], roll: -0.28 },
        footR: leadSide === 'R' ? { pos: leadAnkle, pole: [-0.12, 0.26, 0.94], pitch: -0.64 * sweep } : { pos: trailAnkle, pole: [-0.54, 0.12, 0.80], roll: 0.28 },
        handL: { pos: leadSide === 'L' ? armLead : armTrail, pole: [0.46, -0.24, -0.80], curl: 0.28 },
        handR: { pos: leadSide === 'R' ? armLead : armTrail, pole: [-0.46, -0.24, -0.80], curl: 0.28 },
      };
    });
  }
  motions.Anim_EA_SlideTackle = makeSlide('R');
  motions.Anim_Slide_V1 = makeSlide('L');

  // 3. STEAL & FOOTBALL POKE TACKLE
  function makeBasketballSteal(rightSwipe) {
    const sw = rightSwipe ? -1 : 1;
    return wrapSplineClip(0.42, false, (u) => {
      const lunge = catmullRomTrack([[0, 0], [0.24, 1.0], [0.54, 0.90], [1, 0]], u);
      const bodyZ = 0.24 * lunge;
      const swipeArm = [sw * 0.06, -0.14, 0.24 + 0.40 * lunge];
      const offArm = [-sw * 0.30, -0.22, 0.08 - 0.16 * lunge];
      return {
        bodyZ, footBaseZ: bodyZ * 0.5,
        bodyY: -0.10 - 0.16 * lunge,
        spinePitch: 0.16 + 0.34 * lunge,
        chestYaw: -sw * 0.44 * lunge,
        headPitch: -0.24 * lunge, armsInWorldYaw: true,
        footL: { pos: [0.20, 0.024, rightSwipe ? -0.06 : 0.38 * lunge], pole: [0.26, 0.12, 1.0] },
        footR: { pos: [-0.20, 0.024, rightSwipe ? 0.38 * lunge : -0.06], pole: [-0.26, 0.12, 1.0] },
        handR: { pos: rightSwipe ? swipeArm : offArm, pole: [-0.40, -0.32, -0.78], curl: 0.14 },
        handL: { pos: rightSwipe ? offArm : swipeArm, pole: [0.40, -0.32, -0.78], curl: 0.14 },
      };
    });
  }
  motions.Anim_2K_Steal = makeBasketballSteal(true);
  motions.Anim_Steal_V1 = makeBasketballSteal(false);

  motions.Anim_FB_Steal = wrapSplineClip(0.42, false, (u) => {
    const poke = catmullRomTrack([[0, 0], [0.26, 1.0], [0.54, 0.90], [1, 0]], u);
    const lift = catmullRomTrack([[0, 0], [0.16, 0.15], [0.32, 0.11], [0.60, 0.05], [1, 0]], u);
    const bodyZ = 0.26 * poke;
    return {
      bodyZ, footBaseZ: bodyZ * 0.45,
      bodyY: -0.06 - 0.20 * poke, bodyRoll: -0.22 * poke, bodyYaw: 0.26 * poke,
      spinePitch: 0.30 * poke, chestYaw: -0.34 * poke, headPitch: -0.18 * poke, armsInWorldYaw: true,
      footL: { pos: [0.23, 0.024, -0.14 - 0.08 * poke], pole: [0.28, 0.16, 1.0], yaw: 0.22 },
      footR: { pos: [0.02 * poke - 0.14 * (1 - poke), 0.024 + lift, 0.06 + 0.74 * poke], pole: [-0.12, 0.24, 1.0], yaw: 0.42 * poke, pitch: -0.20 * poke },
      handL: { pos: [0.32, -0.16 - 0.04 * poke, 0.18 + 0.12 * poke], pole: [0.44, -0.34, -0.78], curl: 0.50 },
      handR: { pos: [-0.28, -0.20 - 0.04 * poke, 0.10 - 0.18 * poke], pole: [-0.44, -0.34, -0.78], curl: 0.50 },
    };
  });

  // 4. NBA ONE-MOTION JUMPSHOT (High Above-Head Release, Crisp Gooseneck Follow-Through, Clean Guide Separation)
  motions.Anim_2K_JumpShot = wrapSplineClip(0.62, false, (u) => {
    const air = catmullRomTrack([[0, 0], [0.16, 0], [0.44, 1.0], [0.74, 0], [1, 0]], u);
    const sway = catmullRomTrack([[0, 0], [0.18, 0], [0.48, 1.0], [0.76, 0.15], [1, 0]], u);
    const squat = catmullRomTrack([[0, 0.08], [0.16, 0.24], [0.30, 0], [0.78, 0.18], [1, 0.06]], u);
    const spinePitch = catmullRomTrack([[0, 0.14], [0.16, 0.18], [0.44, -0.20], [0.74, 0.06], [1, 0.08]], u);
    // Keep z small as arm drives vertically above chest so IK extends HIGH over forehead (max reach 0.417m)
    const rhPos = catmullRomTrack([
      [0, [-0.10, 0.08, 0.24]], [0.16, [-0.09, 0.24, 0.20]], [0.38, [-0.07, 0.41, 0.11]], [0.56, [-0.07, 0.38, 0.22]], [0.78, [-0.16, 0.06, 0.22]], [1, [-0.22, -0.24, 0.22]]
    ], u);
    const rhWrist = catmullRomTrack([[0, 0.20], [0.18, 0.46], [0.44, -1.25], [0.76, -0.88], [1, 0]], u);
    const lhPos = catmullRomTrack([
      [0, [0.14, 0.08, 0.22]], [0.16, [0.15, 0.22, 0.20]], [0.36, [0.24, 0.26, 0.15]], [0.56, [0.31, -0.02, 0.12]], [0.78, [0.24, -0.14, 0.20]], [1, [0.22, -0.24, 0.22]]
    ], u);
    return {
      bodyY: lerp(-squat, -0.03, air), aerialLift: 0.48 * air, groundSnap: air < 0.05, armsInWorldYaw: true,
      spinePitch, headPitch: -spinePitch - 0.16 * air,
      footL: { pos: [0.16, 0.024 + 0.07 * sway, lerp(0.06, 0.22, sway)], pole: [0.22, 0.18, 1.0], pitch: 0.38 * sway },
      footR: { pos: [-0.16, 0.024 + 0.04 * sway, lerp(-0.04, 0.12, sway)], pole: [-0.22, 0.14, 1.0], pitch: 0.44 * sway },
      handR: { pos: rhPos, pole: [-0.06, -0.18, 0.96], curl: lerp(0.40, 0.68, smootherstep(clamp((u - 0.34) / 0.22, 0, 1))), wristPitch: rhWrist, wristRoll: 0.10 },
      handL: { pos: lhPos, pole: [0.40, -0.28, -0.32], curl: 0.48, wristYaw: -0.45, wristRoll: -0.18 },
    };
  });

  motions.Anim_Shot_V1 = wrapSplineClip(0.40, false, (u) => {
    const thrust = Math.sin(u * Math.PI);
    const rel = smootherstep(clamp(u / 0.46, 0, 1)) * (u > 0.46 ? 1 - smootherstep((u - 0.46) / 0.54) : 1);
    return {
      bodyZ: 0.16 * rel, footBaseZ: 0.08 * rel,
      bodyY: -0.08 - 0.06 * thrust, spinePitch: 0.18 * thrust, headPitch: -0.12 * thrust, armsInWorldYaw: true,
      footL: { pos: [0.16, 0.024, 0.10 + 0.20 * thrust], pole: [0.24, 0.14, 1.0] },
      footR: { pos: [-0.16, 0.024, -0.08], pole: [-0.24, 0.14, 1.0] },
      handL: { pos: [0.16 + 0.06 * rel, -0.06 + 0.12 * rel, 0.24 + 0.30 * rel], pole: [0.40, -0.36, -0.60], curl: 0.16 },
      handR: { pos: [-0.16 - 0.06 * rel, -0.06 + 0.12 * rel, 0.24 + 0.30 * rel], pole: [-0.40, -0.36, -0.60], curl: 0.16 },
    };
  });

  // 5. ICONIC NBA SLAM DUNK (Proud Chest Arch, Crisp Cock-Back, High Scissor/Folded Flight, Violent Rim Flush!)
  function dunkSpec(twoHand, u) {
    const air = catmullRomTrack([[0, 0], [0.14, 0], [0.42, 1.0], [0.76, 0], [1, 0]], u);
    const tuck = catmullRomTrack([[0, 0], [0.16, 0], [0.42, 1.0], [0.72, 0], [1, 0]], u);
    const gather = catmullRomTrack([[0, 0.06], [0.13, 0.26], [0.26, 0.00], [0.78, 0.22], [1, 0.06]], u);
    const bodyZ = catmullRomTrack([[0, -0.10], [0.14, -0.04], [0.48, 0.28], [0.76, 0.12], [1, 0]], u);
    const rhPos = twoHand
      ? catmullRomTrack([[0, [-0.14, -0.08, 0.24]], [0.14, [-0.13, 0.20, 0.18]], [0.32, [-0.13, 0.56, -0.12]], [0.48, [-0.12, 0.44, 0.44]], [0.64, [-0.12, 0.08, 0.40]], [1, [-0.20, -0.22, 0.22]]], u)
      : catmullRomTrack([[0, [-0.18, -0.08, 0.24]], [0.14, [-0.20, 0.18, 0.18]], [0.32, [-0.18, 0.58, -0.04]], [0.48, [-0.06, 0.46, 0.46]], [0.64, [-0.08, 0.10, 0.42]], [1, [-0.20, -0.22, 0.22]]], u);
    const rhWrist = catmullRomTrack([[0, 0], [0.32, 0.50], [0.50, -1.16], [1, 0]], u);
    const lhPos = twoHand
      ? [-rhPos[0], rhPos[1], rhPos[2]]
      : catmullRomTrack([[0, [0.18, -0.14, 0.20]], [0.18, [0.34, 0.02, 0.16]], [0.44, [0.40, -0.24, -0.12]], [0.74, [0.24, -0.16, 0.18]], [1, [0.20, -0.22, 0.22]]], u);

    const footL = twoHand
      ? { pos: [0.18, 0.024 + 0.34 * tuck, -0.02 - 0.28 * tuck], pole: [0.24, 0.26, 1.0], pitch: 0.58 * tuck }
      : { pos: [0.17, 0.024 + 0.44 * tuck, 0.10 + 0.32 * tuck], pole: [0.24, 0.42, 1.0], pitch: 0.50 * tuck };
    const footR = twoHand
      ? { pos: [-0.18, 0.024 + 0.34 * tuck, -0.04 - 0.28 * tuck], pole: [-0.24, 0.26, 1.0], pitch: 0.58 * tuck }
      : { pos: [-0.18, 0.024 + 0.34 * tuck, -0.08 - 0.40 * tuck], pole: [-0.24, 0.18, 1.0], pitch: 0.68 * tuck };

    return {
      bodyZ, footBaseZ: bodyZ * 0.55,
      bodyY: -gather, aerialLift: 0.50 * air, groundSnap: air < 0.04, armsInWorldYaw: true,
      // Keep proud chest up into flight & controlled rim attack instead of awkward hunch!
      spinePitch: catmullRomTrack([[0, 0.12], [0.14, 0.22], [0.32, -0.28], [0.50, 0.20], [0.80, 0.16], [1, 0.08]], u),
      chestYaw: twoHand ? 0 : catmullRomTrack([[0, 0], [0.32, -0.44], [0.50, 0.32], [1, 0]], u),
      headPitch: -0.24 * air,
      footL, footR,
      handR: { pos: rhPos, pole: twoHand ? [-0.24, -0.24, 0.36] : [-0.24, 0.18, -0.60], curl: 0.38, wristPitch: rhWrist },
      handL: { pos: lhPos, pole: twoHand ? [0.24, -0.24, 0.36] : [0.42, -0.34, -0.74], curl: 0.34, wristPitch: twoHand ? rhWrist : 0 },
    };
  }
  motions.Anim_2K_SlamDunk = wrapSplineClip(0.68, false, (u) => dunkSpec(false, u));
  motions.Anim_Dunk_V1 = wrapSplineClip(0.68, false, (u) => dunkSpec(true, u));

  // 6. DYNAMIC GOALKEEPER DIVES (Athletic Bent Top Scissor Knee + Outstretched Asymmetric Parry Arms + Left Mirror!)
  function keeperDiveSpec(low, u) {
    const air = catmullRomTrack([[0, 0], [0.14, 0.86], [0.46, 1.0], [0.76, 0.32], [1, 0]], u);
    const diveArc = Math.sin(clamp((u - 0.03) / 0.88, 0, 1) * Math.PI);
    return {
      bodyX: (low ? 0.54 : 0.50) * diveArc,
      bodyY: low ? lerp(-0.16, -0.64, diveArc) : lerp(-0.14, 0.04, diveArc),
      aerialLift: (low ? 0.08 : 0.48) * air,
      groundSnap: false, feetInBodySpace: true,
      bodyRoll: (low ? -1.42 : -1.30) * diveArc,
      bodyPitch: (low ? 0.06 : -0.10) * diveArc,
      bodyYaw: 0.22 * diveArc,
      spineRoll: -0.14 * diveArc, headRoll: 0.52 * diveArc, headYaw: -0.24 * diveArc,
      // Upper leg (L) drives knee flexed forward for spring; lower leg (R) stays extended trailing push-off
      footL: { pos: [0.24, lerp(0.024, 0.32, diveArc), lerp(0.06, 0.34, diveArc)], pole: [0.34, 0.36, 0.90], pitch: 0.50 * diveArc },
      footR: { pos: [-0.15, 0.024, lerp(-0.04, -0.14, diveArc)], pole: [-0.20, 0.14, 1.0], pitch: 0.60 * diveArc },
      // Asymmetric reach toward ball corner (+0.18 top hand higher, trail hand braced lower!)
      handL: { pos: [lerp(0.28, 0.14, diveArc), lerp(-0.08, 0.62, diveArc), lerp(0.26, 0.26, diveArc)], pole: [0.42, 0.10, -0.80], curl: 0.06 },
      handR: { pos: [lerp(-0.28, -0.06, diveArc), lerp(-0.08, 0.76, diveArc), lerp(0.26, 0.22, diveArc)], pole: [-0.42, 0.10, -0.80], curl: 0.06 },
    };
  }
  motions.Anim_EA_KeeperDive = wrapSplineClip(0.60, false, (u) => keeperDiveSpec(false, u));
  motions.Anim_EA_KeeperDive_L = wrapSplineClip(0.60, false, (u) => mirrorSpecLR(keeperDiveSpec(false, u)));
  motions.Anim_EA_KeeperLowDive = wrapSplineClip(0.56, false, (u) => keeperDiveSpec(true, u));
  motions.Anim_EA_KeeperLowDive_L = wrapSplineClip(0.56, false, (u) => mirrorSpecLR(keeperDiveSpec(true, u)));

  motions.Anim_EA_KeeperJump = wrapSplineClip(0.58, false, (u) => {
    const air = catmullRomTrack([[0, 0], [0.16, 0], [0.44, 1.0], [0.76, 0], [1, 0]], u);
    const squat = catmullRomTrack([[0, 0.08], [0.16, 0.24], [0.30, 0], [0.80, 0.18], [1, 0.08]], u);
    const armsUp = catmullRomTrack([[0, 0], [0.16, 0.14], [0.42, 1.0], [0.68, 0.94], [1, 0]], u);
    return {
      bodyY: lerp(-squat, -0.02, air), aerialLift: 0.48 * air, groundSnap: air < 0.05, armsInWorldYaw: true,
      spinePitch: lerp(0.16, -0.10, air), headPitch: -0.22 * armsUp,
      footL: { pos: [0.16, 0.024 + 0.36 * air, 0.08 + 0.20 * air], pole: [0.24, 0.34, 1.0], pitch: 0.48 * air },
      footR: { pos: [-0.16, 0.024, -0.04], pole: [-0.24, 0.14, 1.0], pitch: 0.42 * air },
      handL: { pos: [lerp(0.30, 0.12, armsUp), lerp(-0.08, 0.66, armsUp), lerp(0.28, 0.22, armsUp)], pole: [0.44, -0.12, -0.76], curl: 0.08 },
      handR: { pos: [lerp(-0.30, -0.12, armsUp), lerp(-0.08, 0.66, armsUp), lerp(0.28, 0.22, armsUp)], pole: [-0.44, -0.12, -0.76], curl: 0.08 },
    };
  });

  motions.Roll = isKeeper ? motions.Anim_EA_KeeperDive : motions.Anim_EA_SlideTackle;

  // 7. CELEBRATIONS, WAVE & HIT RECOVERY
  motions.Wave = wrapSplineClip(1.15, true, (u) => {
    const a = u * Math.PI * 2;
    return {
      bodyY: -0.03 + 0.012 * Math.abs(Math.sin(a)), spinePitch: -0.04, headYaw: 0.08 * Math.sin(a), armsInWorldYaw: true,
      footL: { pos: [0.16, 0.024, 0.05], pole: [0.25, 0.12, 1.0], yaw: 0.12 },
      footR: { pos: [-0.16, 0.024, -0.04], pole: [-0.25, 0.12, 1.0], yaw: -0.14 },
      handL: { pos: [0.24, -0.34, 0.12], pole: [0.45, -0.28, -0.80], curl: 0.4 },
      handR: { pos: [-0.28 + 0.10 * Math.sin(a * 2), 0.42 + 0.04 * Math.cos(a * 2), 0.16], pole: [-0.44, -0.35, -0.35], curl: 0.12 },
    };
  });

  motions.Anim_Celebration = wrapSplineClip(1.10, false, (u) => {
    const air = catmullRomTrack([[0, 0], [0.20, 0], [0.42, 1.0], [0.64, 0], [1, 0]], u);
    const spread = catmullRomTrack([[0, 0], [0.18, 0.1], [0.56, 1.0], [0.84, 0.9], [1, 0.1]], u);
    const armsUp = catmullRomTrack([[0, 0], [0.34, 1.0], [0.56, 0.1], [1, 0]], u);
    return {
      bodyY: catmullRomTrack([[0, -0.04], [0.18, -0.15], [0.42, -0.04], [0.64, -0.08], [1, -0.03]], u),
      aerialLift: 0.34 * air, groundSnap: air < 0.04,
      spinePitch: catmullRomTrack([[0, 0.1], [0.20, 0.16], [0.56, -0.16], [0.88, -0.08], [1, 0.04]], u),
      headPitch: -0.16 * spread, armsInWorldYaw: true,
      footL: { pos: [0.16 + 0.14 * spread, 0.024 + 0.12 * air, 0.06], pole: [0.28, 0.16, 1.0], yaw: 0.18 },
      footR: { pos: [-0.16 - 0.14 * spread, 0.024 + 0.12 * air, -0.04], pole: [-0.28, 0.16, 1.0], yaw: -0.18 },
      handL: { pos: [0.24 + 0.22 * spread, -0.30 + 0.56 * armsUp + 0.34 * spread, 0.12 - 0.12 * spread], pole: [0.48, -0.34, -0.75], curl: 0.85 },
      handR: { pos: [-0.24 - 0.22 * spread, -0.30 + 0.56 * armsUp + 0.34 * spread, 0.12 - 0.12 * spread], pole: [-0.48, -0.34, -0.75], curl: 0.85 },
    };
  });

  motions.Anim_Celeb_V1 = wrapSplineClip(1.05, false, (u) => {
    const p1 = Math.sin(clamp(u / 0.45, 0, 1) * Math.PI);
    const p2 = Math.sin(clamp((u - 0.45) / 0.45, 0, 1) * Math.PI);
    const pump = Math.max(p1, p2);
    return {
      bodyY: -0.04 - 0.06 * pump, aerialLift: 0.16 * p1, groundSnap: p1 < 0.1, spinePitch: -0.10 * pump, armsInWorldYaw: true,
      footL: { pos: [0.18, 0.024, 0.08], pole: [0.28, 0.12, 1.0], yaw: 0.14 },
      footR: { pos: [-0.18, 0.024, -0.05], pole: [-0.28, 0.12, 1.0], yaw: -0.14 },
      handL: { pos: [0.26, -0.20 + 0.58 * pump, 0.20], pole: [0.48, -0.32, -0.62], curl: 0.90 },
      handR: { pos: [-0.26, -0.20 + 0.58 * pump, 0.20], pole: [-0.48, -0.32, -0.62], curl: 0.90 },
    };
  });

  motions.Anim_Celeb_V2 = wrapSplineClip(1.05, false, (u) => {
    const p = Math.sin(clamp(u / 0.9, 0, 1) * Math.PI);
    return {
      bodyZ: 0.12 * p, footBaseZ: 0.04 * p,
      bodyY: -0.05 - 0.08 * p, spinePitch: 0.22 * p, chestYaw: 0.18 * Math.sin(u * Math.PI * 2), armsInWorldYaw: true,
      footL: { pos: [0.22, 0.024, 0.10], pole: [0.28, 0.12, 1.0], yaw: 0.18 },
      footR: { pos: [-0.22, 0.024, -0.10], pole: [-0.28, 0.12, 1.0], yaw: -0.18 },
      handL: { pos: [0.34 + 0.12 * p, -0.14 + 0.08 * p, 0.04 - 0.16 * p], pole: [0.48, -0.30, -0.82], curl: 0.18 },
      handR: { pos: [-0.34 - 0.12 * p, -0.14 + 0.08 * p, 0.04 - 0.16 * p], pole: [-0.48, -0.30, -0.82], curl: 0.18 },
    };
  });

  function makeHit(dirX) {
    return wrapSplineClip(0.42, false, (u) => {
      const hit = Math.sin(u * Math.PI);
      return {
        bodyZ: -0.14 * hit, footBaseZ: -0.06 * hit,
        bodyY: -0.06 * hit - 0.03, bodyRoll: dirX * 0.20 * hit, spinePitch: -0.22 * hit, headPitch: -0.16 * hit, armsInWorldYaw: true,
        footL: { pos: [0.17, 0.024, 0.08 - 0.10 * hit], pole: [0.25, 0.12, 1.0] },
        footR: { pos: [-0.17, 0.024, -0.06 - 0.12 * hit], pole: [-0.25, 0.12, 1.0] },
        handL: { pos: [0.28, -0.22 + 0.12 * hit, 0.18], pole: [0.46, -0.30, -0.75], curl: 0.35 },
        handR: { pos: [-0.28, -0.22 + 0.12 * hit, 0.18], pole: [-0.46, -0.30, -0.75], curl: 0.35 },
      };
    });
  }
  motions.HitRecieve = makeHit(1);
  motions.HitRecieve_2 = makeHit(-1);
  motions.Punch_Left = makeBasketballSteal(false);
  motions.Punch_Right = makeBasketballSteal(true);

  return motions;
}

function rebuildGLB(filePath, role, clonex) {
  const { gltf, bin } = readGLB(filePath);
  const skel = buildSkeletonHelper(gltf);
  const motions = makeMotions(role, clonex);

  const keepBufViews = new Set();
  (gltf.meshes || []).forEach((m) => {
    (m.primitives || []).forEach((p) => {
      if (p.indices !== undefined) keepBufViews.add(gltf.accessors[p.indices].bufferView);
      Object.values(p.attributes || {}).forEach((accIdx) => {
        if (gltf.accessors[accIdx] && gltf.accessors[accIdx].bufferView !== undefined) keepBufViews.add(gltf.accessors[accIdx].bufferView);
      });
    });
  });
  (gltf.skins || []).forEach((s) => { if (s.inverseBindMatrices !== undefined) keepBufViews.add(gltf.accessors[s.inverseBindMatrices].bufferView); });
  (gltf.images || []).forEach((im) => { if (im.bufferView !== undefined) keepBufViews.add(im.bufferView); });

  const oldAccList = gltf.accessors || [], oldBVList = gltf.bufferViews || [];
  const bvRemap = new Map(), accRemap = new Map(), binChunks = [];
  let byteCursor = 0;
  const newBufferViews = [], newAccessors = [];

  function pushBin(bytes) {
    const pad = (4 - (bytes.length % 4)) % 4;
    binChunks.push(bytes);
    if (pad > 0) binChunks.push(Buffer.alloc(pad));
    const offset = byteCursor;
    byteCursor += bytes.length + pad;
    return { byteOffset: offset, byteLength: bytes.length };
  }

  for (let oldBvIdx = 0; oldBvIdx < oldBVList.length; oldBvIdx++) {
    if (!keepBufViews.has(oldBvIdx)) continue;
    const bv = oldBVList[oldBvIdx];
    const slice = bin.subarray(bv.byteOffset || 0, (bv.byteOffset || 0) + bv.byteLength);
    const { byteOffset, byteLength } = pushBin(slice);
    bvRemap.set(oldBvIdx, newBufferViews.length);
    newBufferViews.push({ ...bv, buffer: 0, byteOffset, byteLength });
  }

  const usedAcc = new Set();
  (gltf.meshes || []).forEach((m) => (m.primitives || []).forEach((p) => {
    if (p.indices !== undefined) usedAcc.add(p.indices);
    Object.values(p.attributes || {}).forEach((a) => usedAcc.add(a));
  }));
  (gltf.skins || []).forEach((s) => { if (s.inverseBindMatrices !== undefined) usedAcc.add(s.inverseBindMatrices); });

  for (let i = 0; i < oldAccList.length; i++) {
    if (!usedAcc.has(i)) continue;
    const acc = { ...oldAccList[i] };
    if (acc.bufferView !== undefined) acc.bufferView = bvRemap.get(acc.bufferView);
    accRemap.set(i, newAccessors.length);
    newAccessors.push(acc);
  }
  (gltf.meshes || []).forEach((m) => (m.primitives || []).forEach((p) => {
    if (p.indices !== undefined) p.indices = accRemap.get(p.indices);
    Object.keys(p.attributes || {}).forEach((k) => { p.attributes[k] = accRemap.get(p.attributes[k]); });
  }));
  (gltf.skins || []).forEach((s) => { if (s.inverseBindMatrices !== undefined) s.inverseBindMatrices = accRemap.get(s.inverseBindMatrices); });
  (gltf.images || []).forEach((im) => { if (im.bufferView !== undefined) im.bufferView = bvRemap.get(im.bufferView); });

  function addFloatAccessor(floatArr, type, withMinMax = false) {
    const raw = Buffer.from(floatArr.buffer, floatArr.byteOffset, floatArr.byteLength);
    const { byteOffset, byteLength } = pushBin(raw);
    const bvIdx = newBufferViews.length;
    newBufferViews.push({ buffer: 0, byteOffset, byteLength });
    const count = type === 'SCALAR' ? floatArr.length : type === 'VEC3' ? floatArr.length / 3 : floatArr.length / 4;
    const acc = { bufferView: bvIdx, componentType: 5126, count, type };
    if (withMinMax && type === 'SCALAR') {
      let mn = Infinity, mx = -Infinity;
      for (let i = 0; i < floatArr.length; i++) { if (floatArr[i] < mn) mn = floatArr[i]; if (floatArr[i] > mx) mx = floatArr[i]; }
      acc.min = [mn]; acc.max = [mx];
    }
    const accIdx = newAccessors.length;
    newAccessors.push(acc);
    return accIdx;
  }

  const newAnimations = [];
  for (const [animName, def] of Object.entries(motions)) {
    const dur = def.duration;
    const numFrames = Math.max(14, Math.round(dur * FPS) + 1);
    const times = new Float32Array(numFrames);
    for (let f = 0; f < numFrames; f++) times[f] = (f / (numFrames - 1)) * dur;
    const timeAcc = addFloatAccessor(times, 'SCALAR', true);

    const firstEval = def.evaluate(skel, 0);
    const rotNodeIds = Object.keys(firstEval.animQ).map(Number);
    const posNodeIds = Object.keys(firstEval.animP).map(Number);

    const rotArrays = {}, posArrays = {};
    rotNodeIds.forEach((nId) => { rotArrays[nId] = new Float32Array(numFrames * 4); });
    posNodeIds.forEach((nId) => { posArrays[nId] = new Float32Array(numFrames * 3); });

    const prevQ = {};
    for (let f = 0; f < numFrames; f++) {
      const u = (def.loop && f === numFrames - 1) ? 0 : (f / (numFrames - 1));
      const res = def.evaluate(skel, u);
      for (const nId of rotNodeIds) {
        let q = res.animQ[nId];
        if (prevQ[nId]) {
          const p = prevQ[nId];
          if (p[0] * q[0] + p[1] * q[1] + p[2] * q[2] + p[3] * q[3] < 0) q = [-q[0], -q[1], -q[2], -q[3]];
        }
        prevQ[nId] = q;
        const off = f * 4;
        rotArrays[nId][off] = q[0]; rotArrays[nId][off + 1] = q[1]; rotArrays[nId][off + 2] = q[2]; rotArrays[nId][off + 3] = q[3];
      }
      for (const nId of posNodeIds) {
        const p = res.animP[nId];
        const off = f * 3;
        posArrays[nId][off] = p[0]; posArrays[nId][off + 1] = p[1]; posArrays[nId][off + 2] = p[2];
      }
    }

    const samplers = [], channels = [];
    for (const nId of posNodeIds) {
      samplers.push({ input: timeAcc, interpolation: 'LINEAR', output: addFloatAccessor(posArrays[nId], 'VEC3') });
      channels.push({ sampler: samplers.length - 1, target: { node: nId, path: 'translation' } });
    }
    for (const nId of rotNodeIds) {
      samplers.push({ input: timeAcc, interpolation: 'LINEAR', output: addFloatAccessor(rotArrays[nId], 'VEC4') });
      channels.push({ sampler: samplers.length - 1, target: { node: nId, path: 'rotation' } });
    }
    newAnimations.push({ name: animName, samplers, channels });
  }

  gltf.bufferViews = newBufferViews;
  gltf.accessors = newAccessors;
  gltf.animations = newAnimations;
  const fullBin = Buffer.concat(binChunks);
  gltf.buffers = [{ byteLength: fullBin.length }];

  let jsonBuf = Buffer.from(JSON.stringify(gltf), 'utf8');
  const jsonPad = (4 - (jsonBuf.length % 4)) % 4;
  if (jsonPad > 0) jsonBuf = Buffer.concat([jsonBuf, Buffer.alloc(jsonPad, 0x20)]);

  const totalLen = 12 + 8 + jsonBuf.length + 8 + fullBin.length;
  const out = Buffer.alloc(totalLen);
  out.writeUInt32LE(0x46546c67, 0); out.writeUInt32LE(2, 4); out.writeUInt32LE(totalLen, 8);
  out.writeUInt32LE(jsonBuf.length, 12); out.writeUInt32LE(0x4e4f534a, 16); jsonBuf.copy(out, 20);
  const binOff = 20 + jsonBuf.length;
  out.writeUInt32LE(fullBin.length, binOff); out.writeUInt32LE(0x004e4942, binOff + 4); fullBin.copy(out, binOff + 8);

  fs.writeFileSync(filePath, out);
  console.log(`✓ Rebuilt v8.0 Choreography ${path.basename(filePath)} (${(out.length / 1024).toFixed(1)} KB, ${newAnimations.length} 60fps clips)`);
}

console.log('Loading CloneX real optical motion capture rig...');
const clonex = createCloneXMocapSampler(path.join(ROOT, 'scratch/clonex_with_animset.glb'));
rebuildGLB(path.join(ROOT, 'assets/characters/footy10.glb'), 'footy', clonex);
rebuildGLB(path.join(ROOT, 'assets/characters/hoops23.glb'), 'hoops', clonex);
rebuildGLB(path.join(ROOT, 'assets/characters/keeper1.glb'), 'keeper', clonex);
