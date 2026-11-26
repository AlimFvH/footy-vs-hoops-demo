'use strict';

/**
 * v6.0 Pro Sports Animation Builder — High-Clarity Athletic Choreography (60 FPS)
 *
 * Fixes all stiffness, chicken-wing elbow poles, pencil-leg jumps/dunks, cramped dives,
 * and frozen terminal holds seen in v5.0:
 *  - NBA Dribble (`Anim_2K_DribbleRun` / `Anim_2K_DribbleIdle`): Down-back natural elbow pole, crisp palm push & wrist flick
 *  - EA FC PowerStrike (`Anim_EA_PowerStrike` / `Anim_Kick_V1`): Deep glute coil, straight explosive instep whip, smooth follow-through + full landing before loop
 *  - Turf Slide Tackle (`Anim_EA_SlideTackle` / `Anim_Slide_V1`): Continuous 3-act glide extension + braced palm + athletic push-up recovery
 *  - NBA JumpShot (`Anim_2K_JumpShot`): Deep gather bend, classic rhythmic shooter leg-sweep in air, aligned elbow pocket, sharp gooseneck snap & cushion landing
 *  - NBA Posterizer SlamDunk (`Anim_2K_SlamDunk` / `Anim_Dunk_V1`): High hang-time + dynamic knee-drive scissor stride, deep behind-head cock-back & violent rim smash
 *  - Goalkeeper Pro Dives (`Anim_EA_KeeperDive` / `LowDive` / `Jump`): Long extended lower trailing leg, powered upper knee, full-length outstretched palms
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
function smoothstep(t) { const x = clamp(t, 0, 1); return x * x * (3 - 2 * x); }
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
  if (v3.len(x) < 1e-4) {
    const alt = Math.abs(y[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
    x = v3.cross(y, alt);
  }
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
  const maxReach = (len1 + len2) * 0.994;
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
  const ankleHeight = restWorld.wp[idx.ankL][1] - restWorld.wp[idx.toeL][1] + 0.015;

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
    const hipLPos = wp[idx.legL];
    const hipRPos = wp[idx.legR];

    const hipLeft = v3.norm(v3.sub(hipLPos, hipRPos));
    const hipUp = v3.norm(v3.sub(wp[idx.spine], hipsPos));
    const hipFwd = v3.norm(v3.cross(hipLeft, hipUp));
    const hipUpOrtho = v3.norm(v3.cross(hipFwd, hipLeft));
    const qHips = qFromBasisCols(hipLeft, hipUpOrtho, hipFwd);

    const chLeft = v3.norm(v3.sub(wp[idx.armL], wp[idx.armR]));
    const chUp = v3.norm(v3.sub(wp[idx.neck], wp[idx.chest]));
    const chFwd = v3.norm(v3.cross(chLeft, chUp));
    const chUpOrtho = v3.norm(v3.cross(chFwd, chLeft));
    const qChest = qFromBasisCols(chLeft, chUpOrtho, chFwd);

    const qHeadRelRest = qNorm(qMul(wq[idx.head], qConj(restWorld.wq[idx.head])));

    return {
      dur, wp, wq, idx, qHips, qChest, qHeadRelRest,
      hipsYOffset: hipsPos[1] - restWorld.wp[idx.hips][1],
      hipsXOffset: hipsPos[0] - restWorld.wp[idx.hips][0],
      hipsZOffset: hipsPos[2] - restWorld.wp[idx.hips][2],
      legLenL, legLenR, armLenL, armLenR, ankleHeight,
    };
  }

  return { sampleClipAt, restWorld, idx };
}

function evaluateRetargetedPose(skel, mocap, dstOpts = {}) {
  const { nodes, byName, restWorldP, restWorldQ } = skel;
  const animQ = {};
  const animP = {};

  const bodyIdx = byName.Body;
  const rootIdx = byName.Root;
  const chestIdx = byName.Chest;
  const hipsIdx = byName.Hips;
  const abdIdx = byName.Abdomen;
  const torsoIdx = byName.Torso;
  const neckIdx = byName.Neck;
  const headIdx = byName.Head;

  const extraYaw = qFromEulerXYZ(dstOpts.extraPitch || 0, dstOpts.extraYaw || 0, dstOpts.extraRoll || 0);
  const bodyRot = qNorm(qMul(extraYaw, mocap.qHips));

  const bodyWPosBase = [
    restWorldP[bodyIdx][0] + (dstOpts.bodyX || 0) + (dstOpts.keepHorizCom ? mocap.hipsXOffset : 0),
    restWorldP[bodyIdx][1] + mocap.hipsYOffset + (dstOpts.bodyY || 0),
    restWorldP[bodyIdx][2] + (dstOpts.bodyZ || 0) + (dstOpts.keepHorizCom ? mocap.hipsZOffset : 0),
  ];

  const bodyWQ = qNorm(qMul(bodyRot, restWorldQ[bodyIdx]));
  animQ[bodyIdx] = qNorm(qMul(qConj(restWorldQ[rootIdx]), bodyWQ));

  const qSpineTotal = qNorm(qMul(mocap.qChest, qConj(mocap.qHips)));
  const qExtraSpine = qFromEulerXYZ(dstOpts.spinePitch || 0, dstOpts.spineYaw || 0, dstOpts.spineRoll || 0);
  const qSpineEff = qNorm(qMul(qExtraSpine, qSpineTotal));

  function slerpChain(idx, parentIdx, parentWQ, parentWPos, targetWorldQ) {
    const restRel = qRotateVec(qConj(restWorldQ[parentIdx]), v3.sub(restWorldP[idx], restWorldP[parentIdx]));
    const wPos = v3.add(parentWPos, qRotateVec(parentWQ, restRel));
    const desiredWQ = qNorm(qMul(targetWorldQ, restWorldQ[idx]));
    const localQ = qNorm(qMul(qConj(parentWQ), desiredWQ));
    animQ[idx] = localQ;
    return { wPos, wQ: desiredWQ };
  }

  const qAbdWorld = qSlerp(bodyRot, qNorm(qMul(qSpineEff, bodyRot)), 0.35);
  const qTorsoWorld = qSlerp(bodyRot, qNorm(qMul(qSpineEff, bodyRot)), 0.70);
  const qChestWorld = qNorm(qMul(qSpineEff, bodyRot));

  const hipsState = slerpChain(hipsIdx, bodyIdx, bodyWQ, bodyWPosBase, bodyRot);
  const abdState = slerpChain(abdIdx, hipsIdx, hipsState.wQ, hipsState.wPos, qAbdWorld);
  const torsoState = slerpChain(torsoIdx, abdIdx, abdState.wQ, abdState.wPos, qTorsoWorld);
  const chestState = slerpChain(chestIdx, torsoIdx, torsoState.wQ, torsoState.wPos, qChestWorld);

  const qHeadDesired = dstOpts.stabilizeHead
    ? qFromEulerXYZ(dstOpts.headPitch || 0, dstOpts.headYaw || 0, dstOpts.headRoll || 0)
    : qNorm(qMul(qFromEulerXYZ(dstOpts.headPitch || 0, dstOpts.headYaw || 0, dstOpts.headRoll || 0), mocap.qHeadRelRest));
  const neckState = slerpChain(neckIdx, chestIdx, chestState.wQ, chestState.wPos, qSlerp(qChestWorld, qHeadDesired, 0.38));
  slerpChain(headIdx, neckIdx, neckState.wQ, neckState.wPos, qHeadDesired);

  const dstArmLen = skel.upperArmLen + skel.lowerArmLen;
  const dstLegLen = skel.upperLegLen + skel.lowerLegLen;

  function solveMocapArm(side) {
    const isL = side === 'L';
    const sgn = isL ? 1 : -1;
    const shIdx = byName['Shoulder.' + side];
    const uaIdx = byName['UpperArm.' + side];
    const laIdx = byName['LowerArm.' + side];
    const wrIdx = byName['Wrist.' + side];

    const sArm = isL ? mocap.idx.armL : mocap.idx.armR;
    const sElb = isL ? mocap.idx.elbL : mocap.idx.elbR;
    const sWri = isL ? mocap.idx.wriL : mocap.idx.wriR;
    const sArmLen = isL ? mocap.armLenL : mocap.armLenR;

    const handOverride = isL ? dstOpts.handL : dstOpts.handR;
    const shPitch = handOverride ? clamp((handOverride.pos[1] + 0.1) * 0.4, -0.06, 0.25) : 0.04;
    const shState = slerpChain(shIdx, chestIdx, chestState.wQ, chestState.wPos, qNorm(qMul(qChestWorld, qFromEulerXYZ(0, 0, sgn * shPitch))));

    const uaRel = qRotateVec(qConj(restWorldQ[shIdx]), v3.sub(restWorldP[uaIdx], restWorldP[shIdx]));
    const shoulderPos = v3.add(shState.wPos, qRotateVec(shState.wQ, uaRel));

    let targetWrist, poleWorld;
    if (handOverride) {
      const frame = qNorm(qMul(qFromEulerXYZ(0, dstOpts.extraYaw || 0, 0), qIdentity()));
      targetWrist = v3.add(chestState.wPos, qRotateVec(frame, handOverride.pos));
      poleWorld = qRotateVec(frame, handOverride.pole || [sgn * 0.45, -0.35, -0.80]);
    } else {
      const relVec = v3.scale(v3.sub(mocap.wp[sWri], mocap.wp[sArm]), dstArmLen / sArmLen);
      targetWrist = v3.add(shoulderPos, qRotateVec(extraYaw, relVec));
      const midPt = v3.lerp(mocap.wp[sArm], mocap.wp[sWri], 0.5);
      const rawPole = v3.sub(mocap.wp[sElb], midPt);
      poleWorld = v3.len(rawPole) > 0.03 ? qRotateVec(extraYaw, v3.norm(rawPole)) : qRotateVec(qChestWorld, [sgn * 0.4, -0.3, -0.85]);
    }

    const ik = solveTwoBoneIK(shoulderPos, targetWrist, skel.upperArmLen, skel.lowerArmLen, poleWorld);
    const uaTwistRef = v3.norm(v3.add(v3.scale(poleWorld, 0.75), v3.scale(ik.bendNormal, sgn * 0.25)));
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
    const ulIdx = byName['UpperLeg.' + side];
    const llIdx = byName['LowerLeg.' + side];
    const ftIdx = byName['Foot.' + side];

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
      : qRotateVec(bodyRot, [sgn * 0.15, 0.1, 1.0]);

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
    const handOffsetChest = handSpec ? handSpec.pos : [sgn * 0.25, -0.36, 0.14];
    const elbowPoleSpec = handSpec && handSpec.pole ? handSpec.pole : [sgn * 0.45, -0.35, -0.80];

    const shLift = clamp((handOffsetChest[1] + 0.12) * 0.48, -0.08, 0.28);
    const shFwd = clamp((handOffsetChest[2] - 0.12) * 0.30, -0.14, 0.22);
    const shState = chainJoint(shIdx, chestIdx, chestState.wQ, chestState.wPos, qFromEulerXYZ(0, -sgn * shFwd, sgn * shLift));

    const uaRel = qRotateVec(qConj(restWorldQ[shIdx]), v3.sub(restWorldP[uaIdx], restWorldP[shIdx]));
    const shoulderPos = v3.add(shState.wPos, qRotateVec(shState.wQ, uaRel));
    const handWorld = v3.add(chestState.wPos, qRotateVec(torsoFrameQ, handOffsetChest));
    const poleWorld = qRotateVec(torsoFrameQ, elbowPoleSpec);

    const ik = solveTwoBoneIK(shoulderPos, handWorld, skel.upperArmLen, skel.lowerArmLen, poleWorld);
    const uaWQ = solveBoneWorldQ(restWorldQ[uaIdx], ik.dir1, v3.norm(v3.add(v3.scale(poleWorld, 0.75), v3.scale(ik.bendNormal, sgn * 0.25))), 'Z');
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

// ============================================================================
// Motion Library Builder (Pro Sculpted Choreography + Clean Optical Mocap)
// ============================================================================
function makeMotions(role, clonex) {
  const isHoops = role === 'hoops';
  const isKeeper = role === 'keeper';
  const motions = {};

  // A. MOCAP LOCOMOTION & SPORT-SPECIFIC IDLE
  motions.Idle = {
    duration: 2.00,
    loop: true,
    evaluate(skel, u) {
      const m = clonex.sampleClipAt('idle', u, [0.05, 0.30]);
      const breath = Math.sin(u * Math.PI * 2);
      if (isKeeper) {
        return evaluateRetargetedPose(skel, m, {
          spinePitch: 0.24 + 0.02 * breath,
          bodyY: -0.11,
          stabilizeHead: true,
          headPitch: -0.06,
          headYaw: 0.14 * breath,
          handL: { pos: [0.34, -0.04 + 0.02 * breath, 0.36], pole: [0.60, -0.42, -0.48], curl: 0.20, wristPitch: -0.22 },
          handR: { pos: [-0.34, -0.04 - 0.02 * breath, 0.36], pole: [-0.60, -0.42, -0.48], curl: 0.20, wristPitch: -0.22 },
        });
      }
      if (isHoops) {
        return evaluateRetargetedPose(skel, m, {
          spinePitch: 0.14 + 0.02 * breath,
          bodyY: -0.06,
          stabilizeHead: true,
          headPitch: -0.04,
          headYaw: 0.08 * breath,
          handL: { pos: [0.25, -0.22 + 0.015 * breath, 0.23], pole: [0.50, -0.38, -0.78], curl: 0.32 },
          handR: { pos: [-0.25, -0.24 - 0.015 * breath, 0.24], pole: [-0.50, -0.38, -0.78], curl: 0.32 },
        });
      }
      return evaluateRetargetedPose(skel, m, {
        spinePitch: 0.06 + 0.015 * breath,
        stabilizeHead: true,
        headPitch: -0.02,
        headYaw: 0.06 * breath,
        fingerCurl: 0.54,
      });
    },
  };

  motions.Walk = {
    duration: 0.88,
    loop: true,
    evaluate(skel, u) {
      const m = clonex.sampleClipAt('walk forward', u, [0, 1]);
      return evaluateRetargetedPose(skel, m, { stabilizeHead: true, headPitch: 0.02, fingerCurl: 0.48 });
    },
  };

  motions.Run = {
    duration: 0.58,
    loop: true,
    evaluate(skel, u) {
      const m = clonex.sampleClipAt('run forward', u, [0, 1]);
      return evaluateRetargetedPose(skel, m, {
        spinePitch: 0.14,
        preserveSprintFlight: true,
        stabilizeHead: true,
        headPitch: -0.04,
        fingerCurl: 0.62,
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
    duration: 0.64,
    loop: true,
    evaluate(skel, u) {
      const m = clonex.sampleClipAt('left strafe', u, [0, 1]);
      return evaluateRetargetedPose(skel, m, { stabilizeHead: true, headYaw: -0.45, fingerCurl: 0.40 });
    },
  };

  motions.Run_Right = {
    duration: 0.64,
    loop: true,
    evaluate(skel, u) {
      const m = clonex.sampleClipAt('right strafe', u, [0, 1]);
      return evaluateRetargetedPose(skel, m, { stabilizeHead: true, headYaw: 0.45, fingerCurl: 0.40 });
    },
  };

  // Fixed Down-Back Elbow Pole (`-0.36` Y instead of broken `+0.35`) + Crisp Wrist Snap!
  motions.Anim_2K_DribbleRun = {
    duration: 0.58,
    loop: true,
    evaluate(skel, u) {
      const m = clonex.sampleClipAt('run forward', u, [0, 1]);
      const a = u * Math.PI * 4;
      const pound = Math.sin(a);
      const wristSnap = Math.sin(a - 0.52);
      return evaluateRetargetedPose(skel, m, {
        bodyY: -0.055,
        spinePitch: 0.17,
        spineYaw: 0.08,
        preserveSprintFlight: true,
        stabilizeHead: true,
        headPitch: -0.06,
        headYaw: -0.04,
        handR: {
          pos: [-0.36, -0.35 + 0.11 * pound, 0.15 + 0.03 * pound],
          pole: [-0.64, -0.32, -0.70],
          curl: 0.18,
          wristPitch: 0.30 - 0.48 * wristSnap,
        },
        handL: {
          pos: [0.23, -0.06 + 0.03 * Math.cos(a * 0.5), 0.29 - 0.03 * Math.cos(a * 0.5)],
          pole: [0.62, -0.32, -0.62],
          curl: 0.36,
        },
      });
    },
  };

  motions.Anim_2K_DribbleIdle = {
    duration: 0.80,
    loop: true,
    evaluate(skel, u) {
      const m = clonex.sampleClipAt('idle', u, [0.05, 0.22]);
      const a = u * Math.PI * 2;
      const pound = Math.sin(a);
      const wristSnap = Math.sin(a - 0.50);
      return evaluateRetargetedPose(skel, m, {
        bodyY: -0.09 + 0.015 * Math.cos(a),
        spinePitch: 0.18,
        spineYaw: 0.08,
        stabilizeHead: true,
        headPitch: -0.06,
        handR: {
          pos: [-0.36, -0.36 + 0.115 * pound, 0.16],
          pole: [-0.64, -0.32, -0.70],
          curl: 0.18,
          wristPitch: 0.30 - 0.48 * wristSnap,
        },
        handL: {
          pos: [0.23, -0.07, 0.28],
          pole: [0.62, -0.32, -0.62],
          curl: 0.36,
        },
      });
    },
  };

  motions.Anim_EA_DribbleRun = {
    duration: 0.54,
    loop: true,
    evaluate(skel, u) {
      const m = clonex.sampleClipAt('run forward', u, [0, 1]);
      return evaluateRetargetedPose(skel, m, {
        bodyY: -0.045,
        spinePitch: 0.16,
        preserveSprintFlight: true,
        stabilizeHead: true,
        headPitch: 0.08,
        fingerCurl: 0.54,
      });
    },
  };

  // B. PRO SCULPTED ACTION CLIPS (Crisp Timing & Silhouettes!)
  function wrapSplineClip(duration, loop, specFn) {
    return {
      duration, loop,
      evaluate(skel, u) { return evaluateSplinePoseToChannels(skel, specFn(u)); },
    };
  }

  // 1. EA FC LASER STRIKE (Crisp back-coil -> straight low-to-mid instep cannon -> clean follow-through -> full land)
  motions.Anim_EA_PowerStrike = wrapSplineClip(0.60, false, (u) => {
    const bodyZ = catmullRomTrack([[0, -0.04], [0.20, -0.10], [0.38, 0.12], [0.56, 0.24], [0.80, 0.08], [1, 0]], u);
    const bodyY = catmullRomTrack([[0, -0.04], [0.20, -0.12], [0.38, -0.07], [0.56, 0.02], [0.80, -0.05], [1, -0.04]], u);
    const bodyPitch = catmullRomTrack([[0, 0.10], [0.20, 0.18], [0.38, 0.04], [0.56, -0.14], [0.82, 0.02], [1, 0.08]], u);
    const bodyRoll = catmullRomTrack([[0, 0], [0.22, -0.22], [0.40, -0.28], [0.60, -0.16], [1, 0]], u);
    const bodyYaw = catmullRomTrack([[0, 0], [0.20, -0.40], [0.36, 0.08], [0.52, 0.34], [0.74, 0.24], [1, 0]], u);
    const chestYaw = catmullRomTrack([[0, 0], [0.22, -0.26], [0.42, 0.32], [0.68, 0.18], [1, 0]], u);

    const lx = catmullRomTrack([[0, 0.15], [0.18, 0.24], [0.66, 0.22], [1, 0.15]], u);
    const lz = catmullRomTrack([[0, 0.05], [0.18, 0.14], [0.66, 0.20], [1, 0.05]], u);
    const ly = catmullRomTrack([[0, 0.024], [0.10, 0.06], [0.18, 0.024], [0.44, 0.024], [0.58, 0.07], [0.76, 0.024], [1, 0.024]], u);

    // Clean straight-line leg whip (knee back at coil -> straight extended swing forward at thigh/shin line -> smooth ground landing!)
    const rx = catmullRomTrack([[0, -0.15], [0.20, -0.18], [0.36, -0.06], [0.54, 0.12], [0.78, -0.12], [1, -0.15]], u);
    const ry = catmullRomTrack([[0, 0.024], [0.20, 0.38], [0.36, 0.14], [0.54, 0.38], [0.76, 0.12], [1, 0.024]], u);
    const rz = catmullRomTrack([[0, -0.05], [0.20, -0.50], [0.36, 0.56], [0.54, 0.66], [0.78, 0.10], [1, -0.05]], u);
    const rPitch = catmullRomTrack([[0, 0], [0.20, 0.68], [0.36, 0.80], [0.54, 0.42], [1, 0]], u);
    const rPoleZ = catmullRomTrack([[0, 0.85], [0.20, 0.38], [0.32, 1.0], [0.58, 1.0], [1, 0.90]], u);
    const rPoleY = catmullRomTrack([[0, 0.15], [0.20, -0.05], [0.38, 0.26], [0.56, 0.34], [1, 0.15]], u);

    const handLPos = catmullRomTrack([
      [0, [0.24, -0.32, 0.12]], [0.20, [0.42, -0.12, 0.18]], [0.42, [0.44, -0.14, -0.10]], [0.72, [0.30, -0.24, -0.06]], [1, [0.24, -0.32, 0.12]]
    ], u);
    const handRPos = catmullRomTrack([
      [0, [-0.24, -0.32, 0.12]], [0.20, [-0.34, -0.20, -0.18]], [0.42, [-0.28, -0.12, 0.24]], [0.72, [-0.28, -0.24, 0.14]], [1, [-0.24, -0.32, 0.12]]
    ], u);

    return {
      bodyZ, bodyY, bodyPitch, bodyRoll, bodyYaw, chestYaw,
      footBaseZ: bodyZ * 0.65,
      armsInWorldYaw: true,
      headPitch: -bodyPitch * 0.6 + 0.05,
      headYaw: -bodyYaw * 0.68,
      footL: { pos: [lx, ly, lz], pole: [0.24, 0.14, 1.0], yaw: 0.14 },
      footR: { pos: [rx, ry, rz], pole: [-0.08, rPoleY, rPoleZ], pitch: rPitch, yaw: -0.06 },
      handL: { pos: handLPos, pole: [0.58, -0.44, -0.68], curl: 0.44 },
      handR: { pos: handRPos, pole: [-0.52, -0.38, -0.72], curl: 0.54 },
    };
  });

  motions.Anim_Kick_V1 = wrapSplineClip(0.58, false, (u) => {
    const bodyZ = catmullRomTrack([[0, -0.04], [0.20, -0.08], [0.40, 0.12], [0.60, 0.20], [1, 0]], u);
    const bodyRoll = catmullRomTrack([[0, 0], [0.22, -0.22], [0.42, -0.28], [0.64, -0.16], [1, 0]], u);
    const bodyYaw = catmullRomTrack([[0, 0], [0.20, -0.36], [0.44, 0.36], [0.72, 0.24], [1, 0]], u);
    return {
      bodyZ,
      bodyY: catmullRomTrack([[0, -0.04], [0.20, -0.11], [0.42, -0.05], [0.60, 0.02], [1, -0.04]], u),
      bodyPitch: catmullRomTrack([[0, 0.08], [0.20, 0.14], [0.42, -0.06], [0.60, -0.14], [1, 0.06]], u),
      bodyRoll, bodyYaw,
      chestYaw: catmullRomTrack([[0, 0], [0.22, -0.20], [0.44, 0.32], [1, 0]], u),
      footBaseZ: bodyZ * 0.65,
      armsInWorldYaw: true,
      headPitch: 0.04,
      headYaw: -bodyYaw * 0.65,
      footL: { pos: [0.23, 0.024, 0.14], pole: [0.26, 0.14, 1.0], yaw: 0.16 },
      footR: {
        pos: catmullRomTrack([[0, [-0.15, 0.024, -0.05]], [0.20, [-0.20, 0.36, -0.44]], [0.40, [0.06, 0.15, 0.56]], [0.56, [0.22, 0.36, 0.62]], [0.80, [-0.10, 0.10, 0.12]], [1, [-0.15, 0.024, -0.05]]], u),
        pole: [-0.08, catmullRomTrack([[0, 0.14], [0.20, -0.04], [0.52, 0.30], [1, 0.14]], u), 1.0],
        pitch: catmullRomTrack([[0, 0], [0.20, 0.58], [0.40, 0.72], [0.58, 0.28], [1, 0]], u),
        yaw: 0.24 * Math.sin(u * Math.PI),
      },
      handL: { pos: catmullRomTrack([[0, [0.24, -0.32, 0.12]], [0.20, [0.42, 0.00, 0.28]], [0.44, [0.44, -0.08, -0.06]], [1, [0.24, -0.32, 0.12]]], u), pole: [0.48, -0.34, -0.78], curl: 0.46 },
      handR: { pos: catmullRomTrack([[0, [-0.24, -0.32, 0.12]], [0.20, [-0.36, -0.18, -0.18]], [0.44, [-0.22, -0.10, 0.34]], [1, [-0.24, -0.32, 0.12]]], u), pole: [-0.48, -0.34, -0.78], curl: 0.56 },
    };
  });

  function makeQuickKick(kickingRight) {
    const ks = kickingRight ? -1 : 1;
    return wrapSplineClip(0.42, false, (u) => {
      const z = catmullRomTrack([[0, -0.04], [0.18, -0.32], [0.38, 0.48], [0.64, 0.28], [1, -0.04]], u);
      const y = catmullRomTrack([[0, 0.024], [0.18, 0.22], [0.38, 0.12], [0.64, 0.18], [1, 0.024]], u);
      const bodyZ = catmullRomTrack([[0, -0.04], [0.40, 0.14], [1, 0]], u);
      const bodyRoll = catmullRomTrack([[0, 0], [0.22, ks * 0.14], [0.46, ks * 0.20], [1, 0]], u);
      const bodyYaw = catmullRomTrack([[0, 0], [0.20, ks * 0.20], [0.42, -ks * 0.22], [1, 0]], u);
      const plantPos = [-ks * 0.20, 0.024, 0.14];
      const kickPos = [ks * (0.14 - 0.08 * Math.sin(u * Math.PI)), y, z];
      return {
        bodyZ, bodyY: -0.055, bodyRoll, bodyYaw, footBaseZ: bodyZ * 0.7, spinePitch: 0.10, armsInWorldYaw: true,
        footL: kickingRight ? { pos: plantPos, pole: [0.24, 0.12, 1.0], yaw: 0.12 } : { pos: kickPos, pole: [0.16, 0.16, 1.0], yaw: -0.26, pitch: 0.38 },
        footR: kickingRight ? { pos: kickPos, pole: [-0.16, 0.16, 1.0], yaw: 0.26, pitch: 0.38 } : { pos: plantPos, pole: [-0.24, 0.12, 1.0], yaw: -0.12 },
        handL: { pos: kickingRight ? [0.34, -0.14, 0.18] : [-0.26, -0.20, 0.16], pole: [0.45, -0.32, -0.80], curl: 0.44 },
        handR: { pos: kickingRight ? [0.26, -0.20, 0.16] : [-0.34, -0.14, 0.18], pole: [-0.45, -0.32, -0.80], curl: 0.44 },
      };
    });
  }
  motions.Kick_Right = makeQuickKick(true);
  motions.Kick_Left = makeQuickKick(false);

  // 2. CONTINUOUS 3-ACT SLIDE TACKLE (Dive-in -> active sweeping extension -> spring push-up)
  function makeSlide(leadSide) {
    const s = leadSide === 'R' ? -1 : 1;
    return wrapSplineClip(0.62, false, (u) => {
      const drop = catmullRomTrack([[0, 0], [0.14, 1.0], [0.64, 1.0], [0.86, 0.26], [1, 0]], u);
      const sweep = catmullRomTrack([[0, 0], [0.16, 0.72], [0.42, 0.96], [0.64, 1.0], [0.88, 0.22], [1, 0]], u);
      const slideSurge = catmullRomTrack([[0, -0.10], [0.16, 0.12], [0.48, 0.44], [0.80, 0.18], [1, 0]], u);
      const leadAnkle = [s * 0.04, lerp(0.024, 0.14, sweep), lerp(0.02, 1.12, sweep)];
      const trailAnkle = [-s * 0.32, lerp(0.024, 0.032, drop), lerp(-0.04, 0.22, drop)];
      const armTrail = [-s * 0.36, lerp(-0.28, -0.34, drop), lerp(0.10, -0.10, drop)];
      const armLead = [s * 0.24, lerp(-0.28, 0.06, sweep), lerp(0.12, 0.34, sweep)];
      return {
        bodyZ: slideSurge, footBaseZ: slideSurge,
        bodyY: lerp(-0.04, -0.78, drop),
        bodyPitch: lerp(0.08, -0.72, drop),
        spinePitch: lerp(0.10, 0.50, drop),
        bodyRoll: lerp(0, s * 0.28, drop),
        bodyYaw: lerp(0, s * 0.24, drop),
        floorOffsetY: lerp(0.0, -0.024, drop), feetInBodySpace: false, armsInWorldYaw: true,
        headPitch: lerp(-0.04, 0.24, drop),
        footL: leadSide === 'L' ? { pos: leadAnkle, pole: [0.14, 0.36, 0.92], pitch: -0.44 } : { pos: trailAnkle, pole: [-0.52, 0.06, 0.85], roll: 0.28 },
        footR: leadSide === 'R' ? { pos: leadAnkle, pole: [-0.14, 0.36, 0.92], pitch: -0.44 } : { pos: trailAnkle, pole: [0.52, 0.06, 0.85], roll: -0.28 },
        handL: { pos: leadSide === 'L' ? armLead : armTrail, pole: [0.50, -0.32, -0.76], curl: 0.24 },
        handR: { pos: leadSide === 'R' ? armLead : armTrail, pole: [-0.50, -0.32, -0.76], curl: 0.24 },
      };
    });
  }
  motions.Anim_EA_SlideTackle = makeSlide('R');
  motions.Anim_Slide_V1 = makeSlide('L');

  // 3. STEAL & FOOTBALL POKE TACKLE
  function makeBasketballSteal(rightSwipe) {
    const sw = rightSwipe ? -1 : 1;
    return wrapSplineClip(0.42, false, (u) => {
      const lunge = catmullRomTrack([[0, 0], [0.26, 1.0], [0.54, 0.92], [1, 0]], u);
      const bodyZ = 0.26 * lunge;
      const swipeArm = [sw * 0.04, -0.10, 0.26 + 0.44 * lunge];
      const offArm = [-sw * 0.36, -0.14, 0.08 - 0.16 * lunge];
      return {
        bodyZ, footBaseZ: bodyZ * 0.5,
        bodyY: -0.10 - 0.18 * lunge,
        spinePitch: 0.16 + 0.36 * lunge,
        chestYaw: -sw * 0.42 * lunge,
        headPitch: -0.28 * lunge, armsInWorldYaw: true,
        footL: { pos: [0.22, 0.024, rightSwipe ? -0.06 : 0.42 * lunge], pole: [0.30, 0.12, 1.0] },
        footR: { pos: [-0.22, 0.024, rightSwipe ? 0.42 * lunge : -0.06], pole: [-0.30, 0.12, 1.0] },
        handR: { pos: rightSwipe ? swipeArm : offArm, pole: [-0.46, -0.32, -0.78], curl: 0.10 },
        handL: { pos: rightSwipe ? offArm : swipeArm, pole: [0.46, -0.32, -0.78], curl: 0.10 },
      };
    });
  }
  motions.Anim_2K_Steal = makeBasketballSteal(true);
  motions.Anim_Steal_V1 = makeBasketballSteal(false);

  motions.Anim_FB_Steal = wrapSplineClip(0.42, false, (u) => {
    const poke = catmullRomTrack([[0, 0], [0.26, 1.0], [0.54, 0.92], [1, 0]], u);
    const lift = catmullRomTrack([[0, 0], [0.16, 0.15], [0.32, 0.11], [0.60, 0.05], [1, 0]], u);
    const bodyZ = 0.28 * poke;
    return {
      bodyZ, footBaseZ: bodyZ * 0.45,
      bodyY: -0.05 - 0.24 * poke, bodyRoll: -0.22 * poke, bodyYaw: 0.28 * poke,
      spinePitch: 0.34 * poke, chestYaw: -0.34 * poke, headPitch: -0.20 * poke, armsInWorldYaw: true,
      footL: { pos: [0.24, 0.024, -0.16 - 0.10 * poke], pole: [0.32, 0.16, 1.0], yaw: 0.24 },
      footR: { pos: [0.05 * poke - 0.14 * (1 - poke), 0.024 + lift, 0.06 + 0.80 * poke], pole: [-0.14, 0.26, 1.0], yaw: 0.48 * poke, pitch: -0.22 * poke },
      handL: { pos: [0.36, -0.08 - 0.02 * poke, 0.20 + 0.14 * poke], pole: [0.48, -0.36, -0.82], curl: 0.50 },
      handR: { pos: [-0.32, -0.16 - 0.04 * poke, 0.12 - 0.22 * poke], pole: [-0.48, -0.36, -0.82], curl: 0.50 },
    };
  });

  // 4. NBA PRO JUMPSHOT (Fluid Dip, Sweeping Mid-Air Jumper Stride, Sharp Gooseneck Snap, Cushioned Land)
  motions.Anim_2K_JumpShot = wrapSplineClip(0.62, false, (u) => {
    const air = catmullRomTrack([[0, 0], [0.18, 0], [0.44, 1.0], [0.74, 0], [1, 0]], u);
    const sway = catmullRomTrack([[0, 0], [0.20, 0], [0.48, 1.0], [0.76, 0.15], [1, 0]], u);
    const squat = catmullRomTrack([[0, 0.06], [0.16, 0.27], [0.30, 0], [0.78, 0.20], [1, 0.06]], u);
    const spinePitch = catmullRomTrack([[0, 0.10], [0.16, 0.22], [0.44, -0.12], [0.74, 0.06], [1, 0.08]], u);
    const rhPos = catmullRomTrack([
      [0, [-0.16, -0.14, 0.26]], [0.16, [-0.11, 0.24, 0.25]], [0.40, [-0.10, 0.64, 0.22]], [0.56, [-0.09, 0.68, 0.36]], [0.78, [-0.18, 0.12, 0.24]], [1, [-0.22, -0.24, 0.26]]
    ], u);
    const rhWrist = catmullRomTrack([[0, 0.10], [0.20, 0.58], [0.46, -1.18], [0.72, -0.82], [1, 0]], u);
    const lhPos = catmullRomTrack([
      [0, [0.18, -0.14, 0.26]], [0.18, [0.18, 0.22, 0.25]], [0.40, [0.22, 0.34, 0.21]], [0.56, [0.28, 0.18, 0.18]], [0.78, [0.22, -0.08, 0.22]], [1, [0.22, -0.24, 0.26]]
    ], u);
    return {
      bodyY: lerp(-squat, -0.02, air), aerialLift: 0.56 * air, groundSnap: air < 0.05, armsInWorldYaw: true,
      spinePitch, headPitch: -spinePitch - 0.18 * air,
      // Authentic shooter leg sweep (feet drift slightly forward & staggered with graceful knee flex)
      footL: { pos: [0.16, 0.024 + 0.08 * sway, lerp(0.06, 0.26, sway)], pole: [0.22, 0.18, 1.0], pitch: 0.44 * sway },
      footR: { pos: [-0.16, 0.024 + 0.04 * sway, lerp(-0.04, 0.15, sway)], pole: [-0.22, 0.14, 1.0], pitch: 0.50 * sway },
      handR: { pos: rhPos, pole: [-0.12, -0.32, 0.78], curl: 0.14, wristPitch: rhWrist },
      handL: { pos: lhPos, pole: [0.44, -0.34, 0.20], curl: 0.20 },
    };
  });

  motions.Anim_Shot_V1 = wrapSplineClip(0.40, false, (u) => {
    const thrust = Math.sin(u * Math.PI);
    const rel = smootherstep(clamp(u / 0.46, 0, 1)) * (u > 0.46 ? 1 - smootherstep((u - 0.46) / 0.54) : 1);
    return {
      bodyZ: 0.18 * rel, footBaseZ: 0.09 * rel,
      bodyY: -0.08 - 0.06 * thrust, spinePitch: 0.18 * thrust, headPitch: -0.12 * thrust, armsInWorldYaw: true,
      footL: { pos: [0.16, 0.024, 0.12 + 0.22 * thrust], pole: [0.25, 0.14, 1.0] },
      footR: { pos: [-0.16, 0.024, -0.08], pole: [-0.25, 0.14, 1.0] },
      handL: { pos: [0.16 + 0.08 * rel, -0.04 + 0.15 * rel, 0.24 + 0.36 * rel], pole: [0.46, -0.36, -0.52], curl: 0.14 },
      handR: { pos: [-0.16 - 0.08 * rel, -0.04 + 0.15 * rel, 0.24 + 0.36 * rel], pole: [-0.46, -0.36, -0.52], curl: 0.14 },
    };
  });

  // 5. SIGNATURE NBA POSTERIZER SLAM DUNK (Air-Jordan / NBA 2K Heroic Scissor Flight & Rim Smash!)
  function dunkSpec(twoHand, u) {
    const air = catmullRomTrack([[0, 0], [0.14, 0], [0.42, 1.0], [0.76, 0], [1, 0]], u);
    const tuck = catmullRomTrack([[0, 0], [0.16, 0], [0.42, 1.0], [0.72, 0], [1, 0]], u);
    const gather = catmullRomTrack([[0, 0.05], [0.13, 0.29], [0.26, -0.02], [0.78, 0.26], [1, 0.05]], u);
    const bodyZ = catmullRomTrack([[0, -0.12], [0.14, -0.04], [0.48, 0.30], [0.76, 0.14], [1, 0]], u);
    const rhPos = twoHand
      ? catmullRomTrack([[0, [-0.15, -0.12, 0.24]], [0.14, [-0.14, 0.24, 0.16]], [0.34, [-0.13, 0.78, -0.16]], [0.50, [-0.12, 0.54, 0.50]], [0.64, [-0.12, 0.10, 0.46]], [1, [-0.22, -0.24, 0.26]]], u)
      : catmullRomTrack([[0, [-0.20, -0.12, 0.24]], [0.14, [-0.22, 0.18, 0.18]], [0.34, [-0.20, 0.80, -0.02]], [0.48, [-0.05, 0.58, 0.50]], [0.62, [-0.06, 0.14, 0.50]], [1, [-0.22, -0.24, 0.26]]], u);
    const rhWrist = catmullRomTrack([[0, 0], [0.34, 0.52], [0.52, -1.16], [1, 0]], u);
    const lhPos = twoHand
      ? [-rhPos[0], rhPos[1], rhPos[2]]
      : catmullRomTrack([[0, [0.20, -0.14, 0.24]], [0.18, [0.38, 0.08, 0.28]], [0.46, [0.40, -0.08, 0.12]], [0.74, [0.26, -0.14, 0.22]], [1, [0.22, -0.24, 0.26]]], u);

    // Distinct athletic flight leg silhouettes (high scissor knee-drive for tomahawk, heroic arched double-tuck for two-hand slam!)
    const footL = twoHand
      ? { pos: [0.19, 0.024 + 0.28 * tuck, 0.04 - 0.34 * tuck], pole: [0.26, 0.20, 1.0], pitch: 0.62 * tuck }
      : { pos: [0.17, 0.024 + 0.38 * tuck, 0.08 + 0.34 * tuck], pole: [0.24, 0.38, 1.0], pitch: 0.54 * tuck };
    const footR = twoHand
      ? { pos: [-0.19, 0.024 + 0.28 * tuck, -0.04 - 0.34 * tuck], pole: [-0.26, 0.20, 1.0], pitch: 0.62 * tuck }
      : { pos: [-0.18, 0.024 + 0.28 * tuck, -0.08 - 0.44 * tuck], pole: [-0.24, 0.14, 1.0], pitch: 0.68 * tuck };

    return {
      bodyZ, footBaseZ: bodyZ * 0.55,
      bodyY: -gather, aerialLift: 0.58 * air, groundSnap: air < 0.04, armsInWorldYaw: true,
      spinePitch: catmullRomTrack([[0, 0.14], [0.14, 0.26], [0.34, -0.36], [0.52, 0.42], [0.80, 0.22], [1, 0.10]], u),
      chestYaw: twoHand ? 0 : catmullRomTrack([[0, 0], [0.34, -0.46], [0.52, 0.36], [1, 0]], u),
      headPitch: -0.22 * air,
      footL, footR,
      handR: { pos: rhPos, pole: twoHand ? [-0.30, -0.24, 0.32] : [-0.28, 0.20, -0.62], curl: 0.38, wristPitch: rhWrist },
      handL: { pos: lhPos, pole: twoHand ? [0.30, -0.24, 0.32] : [0.46, -0.34, -0.78], curl: 0.34, wristPitch: twoHand ? rhWrist : 0 },
    };
  }
  motions.Anim_2K_SlamDunk = wrapSplineClip(0.68, false, (u) => dunkSpec(false, u));
  motions.Anim_Dunk_V1 = wrapSplineClip(0.68, false, (u) => dunkSpec(true, u));

  // 6. PRO GOALKEEPER DIVES (Long Extended Trailing Leg + Full-Stretch Palms + Clean Roll Recover)
  motions.Anim_EA_KeeperDive = wrapSplineClip(0.60, false, (u) => {
    const air = catmullRomTrack([[0, 0], [0.14, 0.84], [0.44, 1.0], [0.76, 0.34], [1, 0]], u);
    const diveArc = Math.sin(clamp((u - 0.04) / 0.88, 0, 1) * Math.PI);
    return {
      bodyX: 0.48 * diveArc,
      bodyY: lerp(-0.14, 0.08, diveArc),
      aerialLift: 0.56 * air,
      groundSnap: false, feetInBodySpace: true,
      bodyRoll: -1.42 * diveArc, bodyPitch: -0.12 * diveArc, bodyYaw: 0.16 * diveArc,
      spineRoll: -0.14 * diveArc, headRoll: 0.54 * diveArc, headYaw: -0.20 * diveArc,
      footL: { pos: [0.18, lerp(0.024, 0.18, diveArc), lerp(0.06, 0.18, diveArc)], pole: [0.24, 0.24, 1.0], pitch: 0.48 * diveArc },
      footR: { pos: [-0.15, 0.024, lerp(-0.04, -0.16, diveArc)], pole: [-0.20, 0.14, 1.0], pitch: 0.62 * diveArc },
      handL: { pos: [lerp(0.30, 0.10, diveArc), lerp(-0.06, 0.78, diveArc), lerp(0.28, 0.24, diveArc)], pole: [0.42, 0.16, -0.82], curl: 0.06 },
      handR: { pos: [lerp(-0.30, -0.10, diveArc), lerp(-0.06, 0.78, diveArc), lerp(0.28, 0.22, diveArc)], pole: [-0.42, 0.16, -0.82], curl: 0.06 },
    };
  });

  motions.Anim_EA_KeeperLowDive = wrapSplineClip(0.56, false, (u) => {
    const air = catmullRomTrack([[0, 0], [0.14, 0.85], [0.48, 1.0], [0.78, 0.35], [1, 0]], u);
    const diveArc = Math.sin(clamp((u - 0.04) / 0.88, 0, 1) * Math.PI);
    return {
      bodyX: 0.50 * diveArc,
      bodyY: lerp(-0.16, -0.68, diveArc),
      aerialLift: 0.08 * air,
      groundSnap: false, feetInBodySpace: true,
      bodyRoll: -1.48 * diveArc, bodyPitch: 0.06 * diveArc, bodyYaw: 0.18 * diveArc,
      spineRoll: -0.12 * diveArc, headRoll: 0.58 * diveArc, headYaw: -0.20 * diveArc,
      footL: { pos: [0.19, lerp(0.024, 0.12, diveArc), lerp(0.04, 0.12, diveArc)], pole: [0.24, 0.20, 1.0], pitch: 0.50 * diveArc },
      footR: { pos: [-0.15, 0.024, lerp(-0.06, -0.16, diveArc)], pole: [-0.20, 0.12, 1.0], pitch: 0.62 * diveArc },
      handL: { pos: [lerp(0.32, 0.10, diveArc), lerp(-0.10, 0.78, diveArc), lerp(0.30, 0.24, diveArc)], pole: [0.40, 0.16, -0.82], curl: 0.06 },
      handR: { pos: [lerp(-0.32, -0.10, diveArc), lerp(-0.10, 0.78, diveArc), lerp(0.30, 0.22, diveArc)], pole: [-0.40, 0.16, -0.82], curl: 0.06 },
    };
  });

  motions.Anim_EA_KeeperJump = wrapSplineClip(0.58, false, (u) => {
    const air = catmullRomTrack([[0, 0], [0.16, 0], [0.44, 1.0], [0.76, 0], [1, 0]], u);
    const squat = catmullRomTrack([[0, 0.08], [0.16, 0.25], [0.30, 0], [0.80, 0.18], [1, 0.08]], u);
    const armsUp = catmullRomTrack([[0, 0], [0.16, 0.14], [0.42, 1.0], [0.68, 0.94], [1, 0]], u);
    return {
      bodyY: lerp(-squat, -0.02, air), aerialLift: 0.54 * air, groundSnap: air < 0.05, armsInWorldYaw: true,
      spinePitch: lerp(0.18, -0.12, air), headPitch: -0.24 * armsUp,
      footL: { pos: [0.16, 0.024 + 0.42 * air, 0.08 + 0.22 * air], pole: [0.24, 0.34, 1.0], pitch: 0.48 * air },
      footR: { pos: [-0.16, 0.024, -0.04], pole: [-0.24, 0.14, 1.0], pitch: 0.42 * air },
      handL: { pos: [lerp(0.32, 0.11, armsUp), lerp(-0.08, 0.76, armsUp), lerp(0.32, 0.22, armsUp)], pole: [0.45, -0.12, -0.75], curl: 0.08 },
      handR: { pos: [lerp(-0.32, -0.11, armsUp), lerp(-0.08, 0.76, armsUp), lerp(0.32, 0.22, armsUp)], pole: [-0.45, -0.12, -0.75], curl: 0.08 },
    };
  });

  motions.Roll = isKeeper ? motions.Anim_EA_KeeperDive : wrapSplineClip(0.54, false, (u) => {
    const crouch = Math.sin(u * Math.PI);
    return {
      bodyY: -0.18 * crouch - 0.03,
      aerialLift: 0.18 * Math.sin(clamp((u - 0.15) / 0.65, 0, 1) * Math.PI),
      bodyPitch: 0.45 * crouch, spinePitch: 0.35 * crouch, armsInWorldYaw: true,
      footL: { pos: [0.16, 0.024 + 0.12 * crouch, 0.12 - 0.18 * crouch], pole: [0.25, 0.15, 1.0] },
      footR: { pos: [-0.16, 0.024 + 0.12 * crouch, -0.08 + 0.16 * crouch], pole: [-0.25, 0.15, 1.0] },
      handL: { pos: [0.24, -0.18, 0.34], pole: [0.5, -0.28, -0.75], curl: 0.45 },
      handR: { pos: [-0.24, -0.18, 0.34], pole: [-0.5, -0.28, -0.75], curl: 0.45 },
    };
  });

  // 7. CELEBRATIONS, WAVE & HIT RECOVERY
  motions.Wave = wrapSplineClip(1.15, true, (u) => {
    const a = u * Math.PI * 2;
    return {
      bodyY: -0.03 + 0.012 * Math.abs(Math.sin(a)), spinePitch: -0.04, headYaw: 0.08 * Math.sin(a), armsInWorldYaw: true,
      footL: { pos: [0.16, 0.024, 0.05], pole: [0.25, 0.12, 1.0], yaw: 0.12 },
      footR: { pos: [-0.16, 0.024, -0.04], pole: [-0.25, 0.12, 1.0], yaw: -0.14 },
      handL: { pos: [0.24, -0.34, 0.12], pole: [0.45, -0.28, -0.80], curl: 0.4 },
      handR: { pos: [-0.30 + 0.12 * Math.sin(a * 2), 0.46 + 0.04 * Math.cos(a * 2), 0.16], pole: [-0.45, -0.35, -0.35], curl: 0.12 },
    };
  });

  motions.Anim_Celebration = wrapSplineClip(1.10, false, (u) => {
    const air = catmullRomTrack([[0, 0], [0.20, 0], [0.42, 1.0], [0.64, 0], [1, 0]], u);
    const spread = catmullRomTrack([[0, 0], [0.18, 0.1], [0.56, 1.0], [0.84, 0.9], [1, 0.1]], u);
    const armsUp = catmullRomTrack([[0, 0], [0.34, 1.0], [0.56, 0.1], [1, 0]], u);
    return {
      bodyY: catmullRomTrack([[0, -0.04], [0.18, -0.16], [0.42, -0.04], [0.64, -0.08], [1, -0.03]], u),
      aerialLift: 0.36 * air, groundSnap: air < 0.04,
      spinePitch: catmullRomTrack([[0, 0.1], [0.20, 0.18], [0.56, -0.18], [0.88, -0.10], [1, 0.04]], u),
      headPitch: -0.18 * spread, armsInWorldYaw: true,
      footL: { pos: [0.16 + 0.18 * spread, 0.024 + 0.10 * air, 0.06], pole: [0.32, 0.14, 1.0], yaw: 0.20 },
      footR: { pos: [-0.16 - 0.18 * spread, 0.024 + 0.10 * air, -0.04], pole: [-0.32, 0.14, 1.0], yaw: -0.20 },
      handL: { pos: [0.24 + 0.28 * spread, -0.32 + 0.62 * armsUp + 0.38 * spread, 0.12 - 0.16 * spread], pole: [0.50, -0.34, -0.75], curl: 0.85 },
      handR: { pos: [-0.24 - 0.28 * spread, -0.32 + 0.62 * armsUp + 0.38 * spread, 0.12 - 0.16 * spread], pole: [-0.50, -0.34, -0.75], curl: 0.85 },
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
      handL: { pos: [0.28, -0.20 + 0.65 * pump, 0.20], pole: [0.55, -0.32, -0.60], curl: 0.90 },
      handR: { pos: [-0.28, -0.20 + 0.65 * pump, 0.20], pole: [-0.55, -0.32, -0.60], curl: 0.90 },
    };
  });

  motions.Anim_Celeb_V2 = wrapSplineClip(1.05, false, (u) => {
    const p = Math.sin(clamp(u / 0.9, 0, 1) * Math.PI);
    return {
      bodyY: -0.03, spinePitch: -0.08 * p, headPitch: -0.22 * p, armsInWorldYaw: true,
      footL: { pos: [0.16, 0.024, 0.12], pole: [0.24, 0.12, 1.0], yaw: 0.12 },
      footR: { pos: [-0.16, 0.024, -0.08], pole: [-0.24, 0.12, 1.0], yaw: -0.14 },
      handL: { pos: [0.26, -0.30, 0.14], pole: [0.45, -0.30, -0.80], curl: 0.45 },
      handR: { pos: [-0.18, lerp(-0.20, 0.64, p), 0.16], pole: [-0.30, -0.28, -0.60], curl: 0.65 },
    };
  });

  function makeHit(dirX) {
    return wrapSplineClip(0.42, false, (u) => {
      const hit = Math.sin(u * Math.PI);
      return {
        bodyZ: -0.14 * hit, footBaseZ: -0.06 * hit,
        bodyY: -0.06 * hit - 0.03, bodyRoll: dirX * 0.20 * hit, spinePitch: -0.24 * hit, headPitch: -0.18 * hit, armsInWorldYaw: true,
        footL: { pos: [0.17, 0.024, 0.08 - 0.10 * hit], pole: [0.25, 0.12, 1.0] },
        footR: { pos: [-0.17, 0.024, -0.06 - 0.12 * hit], pole: [-0.25, 0.12, 1.0] },
        handL: { pos: [0.32, -0.22 + 0.14 * hit, 0.20], pole: [0.50, -0.30, -0.75], curl: 0.35 },
        handR: { pos: [-0.32, -0.22 + 0.14 * hit, 0.20], pole: [-0.50, -0.30, -0.75], curl: 0.35 },
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
  console.log(`✓ Rebuilt v6.0 Pro Choreography ${path.basename(filePath)} (${(out.length / 1024).toFixed(1)} KB, ${newAnimations.length} 60fps clips)`);
}

console.log('Loading CloneX real optical motion capture rig...');
const clonex = createCloneXMocapSampler(path.join(ROOT, 'scratch/clonex_with_animset.glb'));
rebuildGLB(path.join(ROOT, 'assets/characters/footy10.glb'), 'footy', clonex);
rebuildGLB(path.join(ROOT, 'assets/characters/hoops23.glb'), 'hoops', clonex);
rebuildGLB(path.join(ROOT, 'assets/characters/keeper1.glb'), 'keeper', clonex);
