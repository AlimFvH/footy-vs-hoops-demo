'use strict';

/**
 * v4.8 Studio Sports Animation Builder — Crafted From Scratch at 60 FPS.
 * Rebuilds footy10.glb, hoops23.glb, and keeper1.glb with full expressive sports biomechanics:
 *  - Run / Walk / Strafe / Backpedal (true butt-kick fold, knee drive, 90° arm pump, pelvic counter-twist)
 *  - Anim_EA_PowerStrike / Anim_Kick_V1 / Kick_Right / Kick_Left (plant + coil + hip-lead calf whip + high follow-through)
 *  - Anim_2K_JumpShot / Anim_Shot_V1 (one-motion NBA load -> vertical lift -> gooseneck wrist snap)
 *  - Anim_EA_SlideTackle / Anim_Slide_V1 (grass-skimming slide + braced turf arm + athletic spring-up)
 *  - Anim_2K_Steal / Anim_Steal_V1 / Anim_FB_Steal (NBA reach-swipe + Football standing poke block)
 *  - Anim_2K_SlamDunk / Anim_Dunk_V1 (two-foot gather -> tomahawk cock -> violent downward rim slam)
 *  - Anim_EA_KeeperDive / Anim_EA_KeeperJump (horizontal corner flight + vertical crossbar tip-save with knee drive)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FPS = 60;

// ============================================================================
// Quaternion & Vec3 Math Utilities
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

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function smoothstep(t) {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

function smootherstep(t) {
  const x = clamp(t, 0, 1);
  return x * x * x * (x * (x * 6 - 15) + 10);
}

function qIdentity() {
  return [0, 0, 0, 1];
}

function qNorm(q) {
  const l = Math.hypot(q[0], q[1], q[2], q[3]) || 1;
  return [q[0] / l, q[1] / l, q[2] / l, q[3] / l];
}

function qConj(q) {
  return [-q[0], -q[1], -q[2], q[3]];
}

function qMul(a, b) {
  return [
    a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
    a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
    a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
    a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
  ];
}

function qRotateVec(q, v) {
  const u = [q[0], q[1], q[2]];
  const s = q[3];
  const uv = v3.cross(u, v);
  const uuv = v3.cross(u, uv);
  return [
    v[0] + 2 * (s * uv[0] + uuv[0]),
    v[1] + 2 * (s * uv[1] + uuv[1]),
    v[2] + 2 * (s * uv[2] + uuv[2]),
  ];
}

function qAxisAngle(ax, rad) {
  const n = v3.norm(ax);
  const h = rad * 0.5;
  const s = Math.sin(h);
  return qNorm([n[0] * s, n[1] * s, n[2] * s, Math.cos(h)]);
}

function qFromEulerXYZ(rx, ry, rz) {
  const qx = qAxisAngle([1, 0, 0], rx);
  const qy = qAxisAngle([0, 1, 0], ry);
  const qz = qAxisAngle([0, 0, 1], rz);
  return qNorm(qMul(qy, qMul(qx, qz)));
}

function qFromBasisCols(c0, c1, c2) {
  const m00 = c0[0], m01 = c1[0], m02 = c2[0];
  const m10 = c0[1], m11 = c1[1], m12 = c2[1];
  const m20 = c0[2], m21 = c1[2], m22 = c2[2];
  const tr = m00 + m11 + m22;
  let x, y, z, w;
  if (tr > 0) {
    const s = Math.sqrt(tr + 1.0) * 2;
    w = 0.25 * s;
    x = (m21 - m12) / s;
    y = (m02 - m20) / s;
    z = (m10 - m01) / s;
  } else if (m00 > m11 && m00 > m22) {
    const s = Math.sqrt(1.0 + m00 - m11 - m22) * 2;
    w = (m21 - m12) / s;
    x = 0.25 * s;
    y = (m01 + m10) / s;
    z = (m02 + m20) / s;
  } else if (m11 > m22) {
    const s = Math.sqrt(1.0 + m11 - m00 - m22) * 2;
    w = (m02 - m20) / s;
    x = (m01 + m10) / s;
    y = 0.25 * s;
    z = (m12 + m21) / s;
  } else {
    const s = Math.sqrt(1.0 + m22 - m00 - m11) * 2;
    w = (m10 - m01) / s;
    x = (m02 + m20) / s;
    y = (m12 + m21) / s;
    z = 0.25 * s;
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
  const restRef = twistMode === 'X'
    ? qRotateVec(restWorldQ, [1, 0, 0])
    : qRotateVec(restWorldQ, [0, 0, 1]);

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

  const midPos = v3.add(
    rootPos,
    v3.add(v3.scale(dir, len1 * cosAlpha), v3.scale(bendPlane, len1 * sinAlpha))
  );
  return {
    midPos,
    endPos: clampedTarget,
    dir1: v3.norm(v3.sub(midPos, rootPos)),
    dir2: v3.norm(v3.sub(clampedTarget, midPos)),
    bendNormal: v3.norm(v3.cross(dir, bendPlane)),
    bendPlane,
  };
}

function sampleTrack(keys, u) {
  if (!keys || keys.length === 0) return 0;
  if (keys.length === 1) return keys[0][1];
  const x = clamp(u, 0, 1);
  if (x <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const k0 = keys[i];
    const k1 = keys[i + 1];
    if (x >= k0[0] && x <= k1[0]) {
      const span = Math.max(1e-6, k1[0] - k0[0]);
      const t = (x - k0[0]) / span;
      const e = 0.5 - 0.5 * Math.cos(Math.PI * t);
      if (Array.isArray(k0[1])) {
        return k0[1].map((v, idx) => lerp(v, k1[1][idx], e));
      }
      return lerp(k0[1], k1[1], e);
    }
  }
  return keys[keys.length - 1][1];
}

// ============================================================================
// Parse GLB & Inspect Skeleton
// ============================================================================
function readGLB(filePath) {
  const buf = fs.readFileSync(filePath);
  const magic = buf.readUInt32LE(0);
  if (magic !== 0x46546c67) throw new Error('Invalid GLB: ' + filePath);
  let off = 12;
  let gltf = null;
  let bin = Buffer.alloc(0);
  while (off < buf.length) {
    const chunkLen = buf.readUInt32LE(off);
    const chunkType = buf.readUInt32LE(off + 4);
    off += 8;
    const chunkData = buf.subarray(off, off + chunkLen);
    if (chunkType === 0x4e4f534a) {
      gltf = JSON.parse(chunkData.toString('utf8'));
    } else if (chunkType === 0x004e4942) {
      bin = chunkData;
    }
    off += chunkLen;
  }
  return { gltf, bin };
}

function buildSkeletonHelper(gltf) {
  const nodes = gltf.nodes;
  const byName = {};
  const parent = new Int32Array(nodes.length).fill(-1);
  nodes.forEach((n, i) => {
    if (n.name) byName[n.name] = i;
    (n.children || []).forEach((c) => {
      parent[c] = i;
    });
  });

  const restWorldP = Array(nodes.length);
  const restWorldQ = Array(nodes.length);

  function computeWorld(idx) {
    if (restWorldP[idx]) return;
    const p = parent[idx];
    const n = nodes[idx];
    const lt = n.translation ? [...n.translation] : [0, 0, 0];
    const lr = n.rotation ? qNorm(n.rotation) : qIdentity();
    if (p < 0) {
      restWorldP[idx] = lt;
      restWorldQ[idx] = lr;
    } else {
      computeWorld(p);
      const pt = qRotateVec(restWorldQ[p], lt);
      restWorldP[idx] = v3.add(restWorldP[p], pt);
      restWorldQ[idx] = qNorm(qMul(restWorldQ[p], lr));
    }
  }
  for (let i = 0; i < nodes.length; i++) computeWorld(i);

  const upperLegLen = v3.len(nodes[byName['LowerLeg.L']].translation);
  const lowerLegLen = v3.len(nodes[byName['Foot.L']].translation);
  const upperArmLen = v3.len(nodes[byName['LowerArm.L']].translation);
  const lowerArmLen = v3.len(nodes[byName['Wrist.L']].translation);
  const ankleRestY = restWorldP[byName['Foot.L']][1];

  return {
    nodes,
    byName,
    parent,
    restWorldP,
    restWorldQ,
    upperLegLen,
    lowerLegLen,
    upperArmLen,
    lowerArmLen,
    ankleRestY,
  };
}

// ============================================================================
// Pose Evaluation -> Exact Full-Torso + 2-Bone IK + Auto Grounding
// ============================================================================
function evaluatePoseToChannels(skel, pSpec) {
  const { nodes, byName, restWorldP, restWorldQ } = skel;
  const animQ = {};
  const animP = {};

  const rootIdx = byName.Root;
  const rootWQ = restWorldQ[rootIdx];

  const bodyIdx = byName.Body;
  const bodyRestT = nodes[bodyIdx].translation;

  // 1. Body base rotation & tentative translation
  const bodyRot = qNorm(qFromEulerXYZ(pSpec.bodyPitch || 0, pSpec.bodyYaw || 0, pSpec.bodyRoll || 0));
  const bodyWPosBase = [
    restWorldP[bodyIdx][0] + (pSpec.bodyX || 0),
    restWorldP[bodyIdx][1] + (pSpec.bodyY || 0),
    restWorldP[bodyIdx][2] + (pSpec.bodyZ || 0),
  ];
  const bodyWQ = qNorm(qMul(bodyRot, restWorldQ[bodyIdx]));
  animQ[bodyIdx] = qNorm(qMul(qConj(rootWQ), bodyWQ));

  const relFromBodyRest = (idx) => v3.sub(restWorldP[idx], restWorldP[bodyIdx]);

  // 2. Spine Chain (Hips -> Abdomen -> Torso -> Chest -> Neck -> Head)
  const hipsIdx = byName.Hips;
  const abdIdx = byName.Abdomen;
  const torsoIdx = byName.Torso;
  const chestIdx = byName.Chest;
  const neckIdx = byName.Neck;
  const headIdx = byName.Head;

  const spPitch = pSpec.spinePitch || 0;
  const spYaw = pSpec.spineYaw || 0;
  const spRoll = pSpec.spineRoll || 0;

  const hipsDelta = qFromEulerXYZ(pSpec.hipsPitch || 0, pSpec.hipsYaw || 0, pSpec.hipsRoll || 0);
  const abdDelta = qFromEulerXYZ(spPitch * 0.35, spYaw * 0.35, spRoll * 0.35);
  const torsoDelta = qFromEulerXYZ(spPitch * 0.35, spYaw * 0.35, spRoll * 0.35);
  const chestDelta = qFromEulerXYZ(
    spPitch * 0.30 + (pSpec.chestPitch || 0),
    spYaw * 0.30 + (pSpec.chestYaw || 0),
    spRoll * 0.30 + (pSpec.chestRoll || 0)
  );
  const neckDelta = qFromEulerXYZ((pSpec.headPitch || 0) * 0.35, (pSpec.headYaw || 0) * 0.35, (pSpec.headRoll || 0) * 0.35);
  const headDelta = qFromEulerXYZ((pSpec.headPitch || 0) * 0.65, (pSpec.headYaw || 0) * 0.65, (pSpec.headRoll || 0) * 0.65);

  function chainJoint(idx, parentIdx, parentWQ, parentWPos, worldRotDelta) {
    const restRel = qRotateVec(qConj(restWorldQ[parentIdx]), v3.sub(restWorldP[idx], restWorldP[parentIdx]));
    const wPos = v3.add(parentWPos, qRotateVec(parentWQ, restRel));
    const restLocal = qNorm(nodes[idx].rotation || qIdentity());
    const localAdjusted = qNorm(qMul(worldRotDelta, restLocal));
    animQ[idx] = localAdjusted;
    const wQ = qNorm(qMul(parentWQ, localAdjusted));
    return { wPos, wQ };
  }

  const hipsState = chainJoint(hipsIdx, bodyIdx, bodyWQ, bodyWPosBase, hipsDelta);
  const abdState = chainJoint(abdIdx, hipsIdx, hipsState.wQ, hipsState.wPos, abdDelta);
  const torsoState = chainJoint(torsoIdx, abdIdx, abdState.wQ, abdState.wPos, torsoDelta);
  const chestState = chainJoint(chestIdx, torsoIdx, torsoState.wQ, torsoState.wPos, chestDelta);
  const neckState = chainJoint(neckIdx, chestIdx, chestState.wQ, chestState.wPos, neckDelta);
  chainJoint(headIdx, neckIdx, neckState.wQ, neckState.wPos, headDelta);

  // Full chest orientation delta so hands/elbows follow bodyPitch, bodyRoll, spinePitch, and chestYaw naturally!
  const qChestWorldDelta = qNorm(qMul(chestState.wQ, qConj(restWorldQ[chestIdx])));
  const torsoFrameQ = pSpec.armsInWorldYaw
    ? qFromEulerXYZ(0, pSpec.bodyYaw || 0, 0)
    : qChestWorldDelta;

  // 3. Arms via Shoulder + 2-Bone IK
  function solveArm(side) {
    const sgn = side === 'L' ? 1 : -1;
    const shIdx = byName['Shoulder.' + side];
    const uaIdx = byName['UpperArm.' + side];
    const laIdx = byName['LowerArm.' + side];
    const wrIdx = byName['Wrist.' + side];

    const handSpec = side === 'L' ? pSpec.handL : pSpec.handR;
    const handOffsetChest = handSpec ? handSpec.pos : [sgn * 0.25, -0.36, 0.14];
    const elbowPoleSpec = handSpec && handSpec.pole ? handSpec.pole : [sgn * 0.45, -0.35, -0.80];

    const shLift = clamp((handOffsetChest[1] + 0.12) * 0.48, -0.08, 0.28);
    const shFwd = clamp((handOffsetChest[2] - 0.12) * 0.30, -0.14, 0.22);
    const shDelta = qFromEulerXYZ(0, -sgn * shFwd, sgn * shLift);
    const shState = chainJoint(shIdx, chestIdx, chestState.wQ, chestState.wPos, shDelta);

    const uaRel = qRotateVec(qConj(restWorldQ[shIdx]), v3.sub(restWorldP[uaIdx], restWorldP[shIdx]));
    const shoulderPos = v3.add(shState.wPos, qRotateVec(shState.wQ, uaRel));

    const handWorld = v3.add(chestState.wPos, qRotateVec(torsoFrameQ, handOffsetChest));
    const poleWorld = qRotateVec(torsoFrameQ, elbowPoleSpec);

    const ik = solveTwoBoneIK(shoulderPos, handWorld, skel.upperArmLen, skel.lowerArmLen, poleWorld);

    const uaTwistRef = v3.norm(v3.add(v3.scale(poleWorld, 0.75), v3.scale(ik.bendNormal, sgn * 0.25)));
    const uaWQ = solveBoneWorldQ(restWorldQ[uaIdx], ik.dir1, uaTwistRef, 'Z');
    animQ[uaIdx] = qNorm(qMul(qConj(shState.wQ), uaWQ));

    const laWQ = solveBoneWorldQ(restWorldQ[laIdx], ik.dir2, poleWorld, 'Z');
    animQ[laIdx] = qNorm(qMul(qConj(uaWQ), laWQ));

    const wrRoll = (handSpec && handSpec.wristRoll) || 0;
    const wrPitch = (handSpec && handSpec.wristPitch) || 0;
    const wrYaw = (handSpec && handSpec.wristYaw) || 0;
    const wrRestLocal = nodes[wrIdx].rotation || qIdentity();
    animQ[wrIdx] = qNorm(qMul(wrRestLocal, qFromEulerXYZ(wrPitch, wrYaw, wrRoll)));

    const curl = handSpec && typeof handSpec.curl === 'number' ? handSpec.curl : 0.52;
    const fingerNames = [
      'Index1', 'Index2', 'Index3',
      'Middle1', 'Middle2', 'Middle3',
      'Ring1', 'Ring2', 'Ring3',
      'Pinky1', 'Pinky2', 'Pinky3',
    ];
    fingerNames.forEach((fn, fIdx) => {
      const fNodeIdx = byName[fn + '.' + side];
      if (fNodeIdx === undefined) return;
      const segFactor = fn.endsWith('1') ? 0.58 : (fn.endsWith('2') ? 0.72 : 0.48);
      const baseR = nodes[fNodeIdx].rotation || qIdentity();
      animQ[fNodeIdx] = qNorm(qMul(baseR, qAxisAngle([1, 0, 0], -curl * segFactor * (0.94 + (fIdx % 4) * 0.04))));
    });
    ['Thumb1', 'Thumb2'].forEach((tn) => {
      const tIdx = byName[tn + '.' + side];
      if (tIdx === undefined) return;
      const baseR = nodes[tIdx].rotation || qIdentity();
      animQ[tIdx] = qNorm(qMul(baseR, qFromEulerXYZ(-curl * 0.25, 0, sgn * curl * 0.35)));
    });
  }

  solveArm('L');
  solveArm('R');

  // 4. Legs via 2-Bone IK + World Foot Orientation + Automatic Floor Grounding
  function solveLeg(side) {
    const sgn = side === 'L' ? 1 : -1;
    const ulIdx = byName['UpperLeg.' + side];
    const llIdx = byName['LowerLeg.' + side];
    const ftIdx = byName['Foot.' + side];

    const footSpec = side === 'L' ? pSpec.footL : pSpec.footR;
    const defaultAnkle = [sgn * 0.145, skel.ankleRestY, 0.02];
    const targetRelFoot = footSpec ? footSpec.pos : defaultAnkle;

    const hipWorld = v3.add(bodyWPosBase, qRotateVec(bodyRot, relFromBodyRest(ulIdx)));

    const useFullBodySpace = Boolean(pSpec.feetInBodySpace);
    // Keep foot anchor in body base plane so `aerialLift` cleanly elevates the full solved skeleton at animP[Body]
    const footAnchorPos = useFullBodySpace
      ? v3.add(bodyWPosBase, qRotateVec(bodyRot, [targetRelFoot[0], targetRelFoot[1] - restWorldP[bodyIdx][1], targetRelFoot[2]]))
      : v3.add([pSpec.bodyX || 0, 0, pSpec.bodyZ || 0], qRotateVec(qAxisAngle([0, 1, 0], pSpec.bodyYaw || 0), targetRelFoot));

    const defaultPole = [sgn * 0.24, 0.12, 1.0];
    const poleRel = (footSpec && footSpec.pole) || defaultPole;
    const kneePole = qRotateVec(useFullBodySpace ? bodyRot : qAxisAngle([0, 1, 0], pSpec.bodyYaw || 0), poleRel);

    const ik = solveTwoBoneIK(hipWorld, footAnchorPos, skel.upperLegLen, skel.lowerLegLen, kneePole);

    const bendNormalSigned = v3.scale(ik.bendNormal, sgn);
    const ulWQ = solveBoneWorldQ(restWorldQ[ulIdx], ik.dir1, bendNormalSigned, 'Z');
    animQ[ulIdx] = qNorm(qMul(qConj(bodyWQ), ulWQ));

    const backRef = v3.scale(ik.bendPlane, -1);
    const llWQ = solveBoneWorldQ(restWorldQ[llIdx], ik.dir2, backRef, 'Z');
    animQ[llIdx] = qNorm(qMul(qConj(ulWQ), llWQ));

    const fPitch = (footSpec && footSpec.pitch) || 0;
    const fYaw = (footSpec && footSpec.yaw) || 0;
    const fRoll = (footSpec && footSpec.roll) || 0;
    const fRotWorld = useFullBodySpace
      ? qMul(bodyRot, qFromEulerXYZ(fPitch, fYaw, fRoll))
      : qFromEulerXYZ(fPitch, (pSpec.bodyYaw || 0) + fYaw, fRoll);
    const footFwd = qRotateVec(fRotWorld, [0, 0, 1]);
    const footDown = qRotateVec(fRotWorld, [0, -1, 0]);
    const ftWQ = solveBoneWorldQ(restWorldQ[ftIdx], footFwd, footDown, 'Z');
    animQ[ftIdx] = qNorm(qMul(qConj(llWQ), ftWQ));

    const ankleY = ik.endPos[1];
    const heelY = ankleY - skel.ankleRestY * Math.max(0.4, Math.abs(footDown[1]));
    const toeY = ankleY + footFwd[1] * 0.14 - skel.ankleRestY * Math.max(0.3, Math.abs(footDown[1]));
    return Math.min(heelY, toeY);
  }

  const minShoeL = solveLeg('L');
  const minShoeR = solveLeg('R');
  const minShoeY = Math.min(minShoeL, minShoeR);

  let bodyYAdjust = 0;
  if (pSpec.groundSnap !== false) {
    const desiredFloorY = pSpec.floorOffsetY || 0;
    bodyYAdjust = desiredFloorY - minShoeY;
  }

  animP[bodyIdx] = [
    bodyRestT[0] + (pSpec.bodyX || 0),
    bodyRestT[1] + (pSpec.bodyY || 0) + (pSpec.aerialLift || 0) + bodyYAdjust,
    bodyRestT[2] + (pSpec.bodyZ || 0),
  ];

  return { animQ, animP };
}

// ============================================================================
// Motion Choreography Definitions (v4.8 Crafted From Scratch at 60 FPS)
// ============================================================================
function makeMotions(role) {
  const isHoops = role === 'hoops';
  const isKeeper = role === 'keeper';
  const motions = {};

  // --------------------------------------------------------------------------
  // 1. IDLE (Athletic Living Breathing Stance)
  // --------------------------------------------------------------------------
  motions.Idle = {
    duration: 1.60,
    loop: true,
    sample(u) {
      const a = u * Math.PI * 2;
      const b1 = Math.sin(a);
      const b2 = Math.sin(a * 2 + 0.4);
      const sway = Math.cos(a) * 0.015;

      if (isKeeper) {
        return {
          bodyX: sway * 1.5,
          bodyY: -0.115 + 0.012 * b2,
          bodyYaw: 0.05 * b1,
          spinePitch: 0.25 + 0.025 * b2,
          chestPitch: 0.06,
          headPitch: -0.24 - 0.02 * b2,
          headYaw: 0.16 * b1,
          armsInWorldYaw: true,
          footL: { pos: [0.22, 0.024, 0.06], pole: [0.38, 0.15, 1.0], yaw: 0.16 },
          footR: { pos: [-0.22, 0.024, -0.02], pole: [-0.38, 0.15, 1.0], yaw: -0.16 },
          handL: { pos: [0.34, -0.06 + 0.022 * b1, 0.34], pole: [0.60, -0.40, -0.45], curl: 0.24, wristPitch: -0.20 },
          handR: { pos: [-0.34, -0.06 - 0.022 * b1, 0.34], pole: [-0.60, -0.40, -0.45], curl: 0.24, wristPitch: -0.20 },
        };
      }

      if (isHoops) {
        return {
          bodyX: sway,
          bodyY: -0.072 + 0.009 * b2,
          bodyYaw: -0.10 + 0.03 * b1,
          spinePitch: 0.14 + 0.02 * b2,
          spineYaw: 0.06,
          headPitch: -0.12,
          headYaw: 0.08 * b1,
          armsInWorldYaw: true,
          footL: { pos: [0.18, 0.024, 0.10], pole: [0.32, 0.12, 1.0], yaw: 0.14 },
          footR: { pos: [-0.18, 0.024, -0.08], pole: [-0.32, 0.12, 1.0], yaw: -0.18 },
          handL: { pos: [0.25, -0.22 + 0.014 * b1, 0.26], pole: [0.50, -0.35, -0.60], curl: 0.35 },
          handR: { pos: [-0.24, -0.24 - 0.014 * b1, 0.28], pole: [-0.50, -0.35, -0.60], curl: 0.35 },
        };
      }

      return {
        bodyX: sway,
        bodyY: -0.036 + 0.008 * b2,
        bodyYaw: 0.10 + 0.025 * b1,
        spinePitch: 0.07 + 0.018 * b2,
        chestYaw: -0.06,
        headPitch: -0.06,
        headYaw: -0.04 + 0.06 * b1,
        armsInWorldYaw: true,
        footL: { pos: [0.15, 0.024, 0.09], pole: [0.26, 0.12, 1.0], yaw: 0.12 },
        footR: { pos: [-0.15, 0.024, -0.07], pole: [-0.26, 0.12, 1.0], yaw: -0.16 },
        handL: { pos: [0.23, -0.34 + 0.012 * b1, 0.14], pole: [0.45, -0.25, -0.82], curl: 0.62 },
        handR: { pos: [-0.23, -0.33 - 0.012 * b1, 0.16], pole: [-0.45, -0.25, -0.82], curl: 0.62 },
      };
    },
  };

  // --------------------------------------------------------------------------
  // 2. WALK (Smooth Natural Jog / Stride)
  // --------------------------------------------------------------------------
  motions.Walk = {
    duration: 0.88,
    loop: true,
    sample(u) {
      const a = u * Math.PI * 2;
      const b2 = Math.cos(a * 2);
      const strideZ = 0.28;

      const legTraj = (phase) => {
        const p = (phase % 1 + 1) % 1;
        if (p < 0.48) {
          const k = p / 0.48;
          return {
            z: lerp(strideZ, -strideZ, k),
            y: 0.024 + Math.pow(k, 2.2) * 0.035,
            pitch: lerp(-0.18, 0.28, k),
          };
        }
        const k = (p - 0.48) / 0.52;
        const s = smootherstep(k);
        return {
          z: lerp(-strideZ, strideZ, s),
          y: 0.024 + 0.13 * Math.sin(k * Math.PI),
          pitch: lerp(0.30, -0.22, k),
        };
      };

      const fl = legTraj(u);
      const fr = legTraj(u + 0.5);
      const swingL = Math.cos(a);

      return {
        bodyY: -0.045 + 0.018 * (-b2),
        hipsYaw: 0.10 * swingL,
        hipsRoll: 0.035 * Math.sin(a),
        spinePitch: 0.10,
        chestYaw: -0.15 * swingL,
        headPitch: -0.08,
        armsInWorldYaw: true,
        footL: { pos: [0.125, fl.y, fl.z], pole: [0.18, 0.12, 1.0], pitch: fl.pitch },
        footR: { pos: [-0.125, fr.y, fr.z], pole: [-0.18, 0.12, 1.0], pitch: fr.pitch },
        handL: {
          pos: [0.22, -0.24 + 0.06 * Math.abs(swingL), 0.10 - 0.22 * swingL],
          pole: [0.40, -0.25, -0.85],
          curl: 0.50,
        },
        handR: {
          pos: [-0.22, -0.24 + 0.06 * Math.abs(swingL), 0.10 + 0.22 * swingL],
          pole: [-0.40, -0.25, -0.85],
          curl: 0.50,
        },
      };
    },
  };

  // --------------------------------------------------------------------------
  // 3. RUN (v4.8 Pro Sprint: Butt-Kick Fold + Explosive High Knee + 90° Pump)
  // --------------------------------------------------------------------------
  motions.Run = {
    duration: 0.54,
    loop: true,
    sample(u) {
      const a = u * Math.PI * 2;
      const runLeg = (phase) => {
        const p = (phase % 1 + 1) % 1;
        // Phase A (0..0.40): Ground contact drive + strong toe push-off
        if (p < 0.40) {
          const k = p / 0.40;
          const z = lerp(0.35, -0.37, k);
          const heelLift = Math.pow(k, 2.4) * 0.065;
          const pitch = lerp(-0.20, 0.52, k);
          return { z, y: 0.024 + heelLift, pitch };
        }
        // Phase B (0.40..0.68): Tight athlete butt-kick fold (fast swing initiation)
        if (p < 0.68) {
          const k = (p - 0.40) / 0.28;
          const z = lerp(-0.37, -0.04, smoothstep(k));
          const y = lerp(0.089, 0.34, Math.sin(clamp(k * 0.85, 0, 1) * Math.PI * 0.65));
          const pitch = lerp(0.54, 0.36, k);
          return { z, y, pitch };
        }
        // Phase C (0.68..1.00): High knee A-skip whip forward -> prepare heel/midfoot strike
        const k = (p - 0.68) / 0.32;
        const z = lerp(-0.04, 0.35, smootherstep(k));
        const y = lerp(0.34, 0.024, Math.pow(k, 1.35));
        const pitch = lerp(0.36, -0.20, k);
        return { z, y, pitch };
      };

      const fl = runLeg(u);
      const fr = runLeg(u + 0.5);
      const flight = Math.max(0, Math.min(fl.y, fr.y) - 0.030);
      const twist = Math.cos(a);
      const phaseL = -twist; // +1 when L leg is back / L arm drives front!
      const phaseR = twist;

      return {
        bodyY: -0.088 + 0.022 * Math.cos(a * 2),
        aerialLift: flight * 0.82,
        hipsYaw: 0.16 * twist,
        hipsRoll: 0.048 * Math.sin(a),
        spinePitch: 0.24 + 0.025 * Math.abs(Math.sin(a)),
        chestYaw: -0.26 * twist,
        headPitch: -0.21,
        armsInWorldYaw: true,
        footL: { pos: [0.125, fl.y, fl.z], pole: [0.16, 0.18, 1.0], pitch: fl.pitch },
        footR: { pos: [-0.125, fr.y, fr.z], pole: [-0.16, 0.18, 1.0], pitch: fr.pitch },
        // Crisp 90-degree bent elbows pumping tightly chest-to-hip!
        handL: {
          pos: [0.22 - 0.04 * phaseL, -0.14 + 0.10 * phaseL, 0.06 + 0.22 * phaseL],
          pole: [0.38, -0.42, -0.88],
          curl: 0.72,
        },
        handR: {
          pos: [-0.22 + 0.04 * phaseR, -0.14 + 0.10 * phaseR, 0.06 + 0.22 * phaseR],
          pole: [-0.38, -0.42, -0.88],
          curl: 0.72,
        },
      };
    },
  };

  // --------------------------------------------------------------------------
  // 4. RUN_BACK & RUN_LEFT / RUN_RIGHT
  // --------------------------------------------------------------------------
  motions.Run_Back = {
    duration: 0.58,
    loop: true,
    sample(u) {
      const base = motions.Run.sample((1 - u) % 1);
      return {
        ...base,
        spinePitch: 0.04,
        headPitch: -0.04,
        handL: { pos: [0.24, -0.20, 0.22], pole: [0.45, -0.30, -0.80], curl: 0.45 },
        handR: { pos: [-0.24, -0.20, 0.22], pole: [-0.45, -0.30, -0.80], curl: 0.45 },
      };
    },
  };

  function makeStrafe(dirSign) {
    return {
      duration: 0.50,
      loop: true,
      sample(u) {
        const a = u * Math.PI * 2;
        const step = Math.sin(a);
        const hopL = Math.max(0, Math.sin(a)) * 0.12;
        const hopR = Math.max(0, -Math.sin(a)) * 0.12;
        return {
          bodyY: -0.10 + 0.025 * Math.abs(Math.sin(a)),
          bodyRoll: -dirSign * 0.06,
          spinePitch: 0.19,
          headPitch: -0.16,
          armsInWorldYaw: true,
          footL: { pos: [0.16 + dirSign * (0.14 + 0.16 * step), 0.024 + hopL, 0.05], pole: [0.30, 0.12, 1.0], yaw: 0.12 },
          footR: { pos: [-0.16 + dirSign * (-0.14 + 0.16 * step), 0.024 + hopR, -0.04], pole: [-0.30, 0.12, 1.0], yaw: -0.12 },
          handL: { pos: [0.35, -0.17 + 0.04 * hopL, 0.24], pole: [0.55, -0.35, -0.65], curl: 0.35 },
          handR: { pos: [-0.35, -0.17 + 0.04 * hopR, 0.24], pole: [-0.55, -0.35, -0.65], curl: 0.35 },
        };
      },
    };
  }
  motions.Run_Left = makeStrafe(1);
  motions.Run_Right = makeStrafe(-1);

  // --------------------------------------------------------------------------
  // 5. KICK (Anim_EA_PowerStrike / Anim_Kick_V1 / Kick_Right / Kick_Left)
  //    True kinetic whip: wide plant + deep windup + LEFT bank (-roll) + high follow-through!
  // --------------------------------------------------------------------------
  motions.Anim_EA_PowerStrike = {
    duration: 0.66,
    loop: false,
    sample(u) {
      // Bank gently over left plant foot (-0.22 rad) without excessive side flop, then whip leg high through ball!
      const bodyY = sampleTrack([[0, -0.035], [0.22, -0.12], [0.42, -0.07], [0.60, -0.02], [1, -0.035]], u);
      const bodyPitch = sampleTrack([[0, 0.06], [0.22, 0.10], [0.42, -0.10], [0.62, -0.22], [1, 0.05]], u);
      const bodyRoll = sampleTrack([[0, 0.0], [0.24, -0.20], [0.44, -0.24], [0.64, -0.14], [1, 0.0]], u);
      const bodyYaw = sampleTrack([[0, 0.0], [0.24, -0.42], [0.44, 0.34], [0.62, 0.44], [1, 0.04]], u);
      const chestYaw = sampleTrack([[0, 0.0], [0.24, -0.24], [0.44, 0.30], [0.64, 0.16], [1, 0.0]], u);

      // Left plant foot stomps firmly beside ball (x: +0.25, z: +0.16)
      const lx = sampleTrack([[0, 0.15], [0.20, 0.26], [0.62, 0.24], [1, 0.15]], u);
      const lz = sampleTrack([[0, 0.06], [0.20, 0.16], [0.62, 0.14], [1, 0.06]], u);
      const ly = sampleTrack([[0, 0.024], [0.10, 0.07], [0.20, 0.024], [0.66, 0.024], [1, 0.024]], u);

      // Right kicking foot: deep coil behind -> low Whip through ball at z=+0.62 -> high straight follow-through z=+0.78!
      const rx = sampleTrack([[0, -0.15], [0.24, -0.22], [0.34, -0.12], [0.43, 0.02], [0.60, 0.24], [0.84, -0.08], [1, -0.15]], u);
      const ry = sampleTrack([[0, 0.024], [0.24, 0.46], [0.34, 0.22], [0.43, 0.16], [0.58, 0.54], [0.84, 0.12], [1, 0.024]], u);
      const rz = sampleTrack([[0, -0.06], [0.24, -0.48], [0.34, -0.06], [0.43, 0.62], [0.58, 0.78], [0.84, 0.10], [1, -0.06]], u);
      const rPitch = sampleTrack([[0, 0.0], [0.24, 0.68], [0.43, 0.80], [0.60, 0.32], [1, 0.0]], u);

      const rPoleZ = sampleTrack([[0, 0.85], [0.24, 0.25], [0.34, 1.0], [0.58, 1.0], [1, 0.9]], u);
      const rPoleY = sampleTrack([[0, 0.15], [0.24, -0.10], [0.43, 0.28], [0.58, 0.45], [1, 0.15]], u);

      // Bent athletic balance arms (no straight T-pose wings!)
      const handLPos = sampleTrack([
        [0, [0.24, -0.32, 0.12]],
        [0.24, [0.38, -0.04, 0.32]],
        [0.44, [0.42, -0.10, -0.06]],
        [0.66, [0.34, -0.22, -0.12]],
        [1, [0.24, -0.32, 0.12]],
      ], u);
      const handRPos = sampleTrack([
        [0, [-0.24, -0.32, 0.12]],
        [0.24, [-0.34, -0.18, -0.18]],
        [0.44, [-0.24, -0.12, 0.34]],
        [0.66, [-0.30, -0.22, 0.18]],
        [1, [-0.24, -0.32, 0.12]],
      ], u);

      return {
        bodyY,
        bodyPitch,
        bodyRoll,
        bodyYaw,
        chestYaw,
        armsInWorldYaw: true,
        headPitch: -bodyPitch * 0.6 + 0.06,
        headYaw: -bodyYaw * 0.65,
        footL: { pos: [lx, ly, lz], pole: [0.26, 0.15, 1.0], yaw: 0.16 },
        footR: { pos: [rx, ry, rz], pole: [-0.10, rPoleY, rPoleZ], pitch: rPitch, yaw: -0.12 },
        handL: { pos: handLPos, pole: [0.48, -0.32, -0.78], curl: 0.52 },
        handR: { pos: handRPos, pole: [-0.48, -0.32, -0.78], curl: 0.62 },
      };
    },
  };

  motions.Anim_Kick_V1 = {
    duration: 0.64,
    loop: false,
    sample(u) {
      const k = motions.Anim_EA_PowerStrike.sample(u);
      k.bodyRoll = (k.bodyRoll || 0) * 1.18;
      k.footR.pos[0] += 0.12 * Math.sin(u * Math.PI);
      return k;
    },
  };

  function makeQuickKick(kickingRight) {
    const ks = kickingRight ? -1 : 1;
    return {
      duration: 0.48,
      loop: false,
      sample(u) {
        const z = sampleTrack([[0, -0.04], [0.20, -0.30], [0.44, 0.46], [0.68, 0.28], [1, -0.04]], u);
        const y = sampleTrack([[0, 0.024], [0.20, 0.24], [0.44, 0.12], [0.68, 0.22], [1, 0.024]], u);
        // Lean away from kicking foot cleanly (-ks * 0.18 means toward planted side!)
        const bodyRoll = sampleTrack([[0, 0], [0.24, ks * 0.16], [0.48, ks * 0.20], [1, 0]], u);
        const bodyYaw = sampleTrack([[0, 0], [0.22, ks * 0.20], [0.46, -ks * 0.22], [1, 0]], u);

        const plantPos = [-ks * 0.20, 0.024, 0.15];
        const kickPos = [ks * (0.14 - 0.06 * Math.sin(u * Math.PI)), y, z];

        const handKickArm = [ks * 0.26, -0.20, 0.06 + 0.20 * Math.sin(u * Math.PI)];
        const handPlantArm = [-ks * 0.36, -0.14 - 0.06 * Math.sin(u * Math.PI), 0.18 - 0.12 * Math.sin(u * Math.PI)];

        return {
          bodyY: -0.055,
          bodyRoll,
          bodyYaw,
          spinePitch: 0.08,
          armsInWorldYaw: true,
          footL: kickingRight ? { pos: plantPos, pole: [0.24, 0.12, 1.0], yaw: 0.12 } : { pos: kickPos, pole: [0.16, 0.16, 1.0], yaw: -0.28, pitch: 0.38 },
          footR: kickingRight ? { pos: kickPos, pole: [-0.16, 0.16, 1.0], yaw: 0.28, pitch: 0.38 } : { pos: plantPos, pole: [-0.24, 0.12, 1.0], yaw: -0.12 },
          handL: { pos: kickingRight ? handPlantArm : handKickArm, pole: [0.45, -0.25, -0.80], curl: 0.45 },
          handR: { pos: kickingRight ? handKickArm : handPlantArm, pole: [-0.45, -0.25, -0.80], curl: 0.45 },
        };
      },
    };
  }
  motions.Kick_Right = makeQuickKick(true);
  motions.Kick_Left = makeQuickKick(false);

  // --------------------------------------------------------------------------
  // 6. SLIDE TACKLE (Anim_EA_SlideTackle / Anim_Slide_V1)
  //    Low turf glide, flexed lead ankle + tucked bottom leg + braced hand + spring-up!
  // --------------------------------------------------------------------------
  function makeSlide(leadSide) {
    const s = leadSide === 'R' ? -1 : 1; // R extends (-X side), L extends (+X side)
    return {
      duration: 0.66,
      loop: false,
      sample(u) {
        const drop = sampleTrack([[0, 0], [0.15, 1.0], [0.68, 1.0], [0.88, 0.35], [1, 0.0]], u);
        const bodyY = lerp(-0.04, -0.60, drop);
        const bodyPitch = lerp(0.08, -0.92, drop);
        // Bank toward trailing tucked thigh (-s * -0.28 = s * 0.28 -> puts hip on turf)
        const bodyRoll = lerp(0, s * 0.30, drop);
        const bodyYaw = lerp(0, s * 0.24, drop);

        // Extended lead leg slides directly along centerline just above blades of grass
        const leadAnkle = [s * 0.04, lerp(0.024, 0.085, drop), lerp(0.0, 0.96, drop)];
        // Trailing knee bent tucked beside hip for authentic slide triangle
        const trailAnkle = [-s * 0.30, lerp(0.024, 0.055, drop), lerp(0.0, 0.20, drop)];

        // Trailing hand braces bent cleanly beside hip on grass; lead arm balances comfortably
        const armTrail = [-s * 0.31, lerp(-0.32, -0.15, drop), lerp(0.12, -0.22, drop)];
        const armLead = [s * 0.30, lerp(-0.32, -0.02, drop), lerp(0.12, 0.24, drop)];

        return {
          bodyY,
          bodyPitch,
          bodyRoll,
          bodyYaw,
          floorOffsetY: 0.006,
          feetInBodySpace: false,
          armsInWorldYaw: true,
          headPitch: lerp(-0.05, 0.58, drop),
          footL: leadSide === 'L'
            ? { pos: leadAnkle, pole: [0.14, 0.42, 0.9], pitch: -0.46 }
            : { pos: trailAnkle, pole: [-0.42, 0.20, 0.9], roll: 0.25 },
          footR: leadSide === 'R'
            ? { pos: leadAnkle, pole: [-0.14, 0.42, 0.9], pitch: -0.46 }
            : { pos: trailAnkle, pole: [0.42, 0.20, 0.9], roll: -0.25 },
          handL: { pos: leadSide === 'L' ? armLead : armTrail, pole: [0.5, -0.2, -0.7], curl: 0.3 },
          handR: { pos: leadSide === 'R' ? armLead : armTrail, pole: [-0.5, -0.2, -0.7], curl: 0.3 },
        };
      },
    };
  }
  motions.Anim_EA_SlideTackle = makeSlide('R');
  motions.Anim_Slide_V1 = makeSlide('L');

  // --------------------------------------------------------------------------
  // 7. STEAL (NBA Reach-Swipe Anim_2K_Steal + Football Poke Tackle Anim_FB_Steal!)
  // --------------------------------------------------------------------------
  function makeBasketballSteal(rightSwipe) {
    const sw = rightSwipe ? -1 : 1;
    return {
      duration: 0.46,
      loop: false,
      sample(u) {
        const lunge = sampleTrack([[0, 0], [0.30, 1.0], [0.56, 0.92], [1, 0]], u);
        const swipeArm = [sw * 0.06, -0.12, 0.24 + 0.38 * lunge];
        const offArm = [-sw * 0.38, -0.14, 0.06 - 0.18 * lunge];
        return {
          bodyY: -0.09 - 0.16 * lunge,
          spinePitch: 0.15 + 0.32 * lunge,
          chestYaw: -sw * 0.38 * lunge,
          headPitch: -0.26 * lunge,
          armsInWorldYaw: true,
          footL: { pos: [0.20, 0.024, (rightSwipe ? -0.04 : 0.36 * lunge)], pole: [0.30, 0.12, 1.0] },
          footR: { pos: [-0.20, 0.024, (rightSwipe ? 0.36 * lunge : -0.04)], pole: [-0.30, 0.12, 1.0] },
          handR: { pos: rightSwipe ? swipeArm : offArm, pole: [-0.45, -0.25, -0.75], curl: 0.12 },
          handL: { pos: rightSwipe ? offArm : swipeArm, pole: [0.45, -0.25, -0.75], curl: 0.12 },
        };
      },
    };
  }
  motions.Anim_2K_Steal = makeBasketballSteal(true);
  motions.Anim_Steal_V1 = makeBasketballSteal(false);

  // Football Standing Block / Poke Steal — Low athletic split-lunge + sharp inside-foot stab + compact guard arms!
  motions.Anim_FB_Steal = {
    duration: 0.46,
    loop: false,
    sample(u) {
      const poke = sampleTrack([[0, 0], [0.28, 1.0], [0.54, 0.90], [1, 0]], u);
      const lift = sampleTrack([[0, 0], [0.16, 0.11], [0.30, 0.09], [0.58, 0.04], [1, 0]], u);
      return {
        bodyY: -0.05 - 0.16 * poke,
        bodyRoll: -0.20 * poke,
        bodyYaw: 0.28 * poke,
        spinePitch: 0.22 * poke,
        chestYaw: -0.34 * poke,
        headPitch: -0.16 * poke,
        armsInWorldYaw: true,
        footL: { pos: [0.22, 0.024, -0.12 - 0.08 * poke], pole: [0.30, 0.14, 1.0], yaw: 0.22 },
        footR: { pos: [0.02 * poke - 0.12 * (1 - poke), 0.024 + lift, 0.06 + 0.70 * poke], pole: [-0.14, 0.24, 1.0], yaw: 0.48 * poke, pitch: -0.18 * poke },
        handL: { pos: [0.30, -0.12 - 0.04 * poke, 0.18 + 0.10 * poke], pole: [0.45, -0.35, -0.82], curl: 0.55 },
        handR: { pos: [-0.26, -0.18 - 0.04 * poke, 0.12 - 0.24 * poke], pole: [-0.45, -0.35, -0.82], curl: 0.55 },
      };
    },
  };

  // --------------------------------------------------------------------------
  // 8. JUMP SHOT (Anim_2K_JumpShot / Anim_Shot_V1)
  //    Smooth gather dip -> tall extended NBA elevation -> crisp downward gooseneck snap -> soft landing!
  // --------------------------------------------------------------------------
  motions.Anim_2K_JumpShot = {
    duration: 0.68,
    loop: false,
    sample(u) {
      const air = sampleTrack([[0, 0], [0.20, 0], [0.46, 1.0], [0.76, 0.0], [1, 0]], u);
      const squat = sampleTrack([[0, 0.05], [0.18, 0.24], [0.32, 0.0], [0.78, 0.15], [1, 0.05]], u);
      const spinePitch = sampleTrack([[0, 0.08], [0.18, 0.20], [0.46, -0.10], [0.72, 0.06], [1, 0.08]], u);

      const rhPos = sampleTrack([
        [0, [-0.18, -0.16, 0.28]],
        [0.18, [-0.12, 0.20, 0.26]],
        [0.42, [-0.08, 0.56, 0.22]],
        [0.58, [-0.08, 0.62, 0.34]],
        [0.80, [-0.18, 0.10, 0.26]],
        [1, [-0.22, -0.24, 0.26]],
      ], u);
      // Negative wristPitch flexes fingers palm-downward into true NBA gooseneck follow-through!
      const rhWrist = sampleTrack([[0, 0.1], [0.24, 0.55], [0.50, -0.95], [0.74, -0.70], [1, 0]], u);
      const lhPos = sampleTrack([
        [0, [0.18, -0.16, 0.28]],
        [0.20, [0.16, 0.18, 0.28]],
        [0.48, [0.20, 0.32, 0.24]],
        [0.78, [0.22, -0.08, 0.24]],
        [1, [0.22, -0.24, 0.26]],
      ], u);

      return {
        bodyY: lerp(-squat, -0.025, air),
        aerialLift: 0.44 * air,
        groundSnap: air < 0.05,
        armsInWorldYaw: true,
        spinePitch,
        headPitch: -spinePitch - 0.16 * air,
        footL: { pos: [0.15, 0.024, lerp(0.05, 0.14, air)], pole: [0.22, 0.14, 1.0], pitch: 0.38 * air },
        footR: { pos: [-0.15, 0.024, lerp(-0.04, 0.06, air)], pole: [-0.22, 0.14, 1.0], pitch: 0.42 * air },
        handR: { pos: rhPos, pole: [-0.20, -0.45, 0.58], curl: 0.20, wristPitch: rhWrist },
        handL: { pos: lhPos, pole: [0.40, -0.35, 0.25], curl: 0.26 },
      };
    },
  };

  motions.Anim_Shot_V1 = {
    duration: 0.44,
    loop: false,
    sample(u) {
      const thrust = Math.sin(u * Math.PI);
      const rel = smootherstep(clamp(u / 0.50, 0, 1)) * (u > 0.50 ? 1 - smootherstep((u - 0.50) / 0.50) : 1);
      return {
        bodyY: -0.075 - 0.06 * thrust,
        spinePitch: 0.16 * thrust,
        headPitch: -0.12 * thrust,
        armsInWorldYaw: true,
        footL: { pos: [0.16, 0.024, 0.12 + 0.16 * thrust], pole: [0.25, 0.12, 1.0] },
        footR: { pos: [-0.16, 0.024, -0.08], pole: [-0.25, 0.12, 1.0] },
        handL: { pos: [0.16 + 0.08 * rel, -0.04 + 0.14 * rel, 0.24 + 0.34 * rel], pole: [0.45, -0.35, -0.50], curl: 0.15 },
        handR: { pos: [-0.16 - 0.08 * rel, -0.04 + 0.14 * rel, 0.24 + 0.34 * rel], pole: [-0.45, -0.35, -0.50], curl: 0.15 },
      };
    },
  };

  // --------------------------------------------------------------------------
  // 9. SLAM DUNK (Anim_2K_SlamDunk / Anim_Dunk_V1)
  // --------------------------------------------------------------------------
  motions.Anim_2K_SlamDunk = {
    duration: 0.72,
    loop: false,
    sample(u) {
      const air = sampleTrack([[0, 0], [0.16, 0.0], [0.44, 1.0], [0.76, 0.0], [1, 0]], u);
      const tuck = sampleTrack([[0, 0.0], [0.20, 0.0], [0.44, 1.0], [0.74, 0.0], [1, 0]], u);
      const gather = sampleTrack([[0, 0.04], [0.14, 0.24], [0.30, -0.02], [0.78, 0.20], [1, 0.04]], u);

      // Right hand cocks way back behind head -> hammers straight forward & down into rim (+Z)!
      const rhPos = sampleTrack([
        [0, [-0.20, -0.12, 0.24]],
        [0.16, [-0.22, 0.12, 0.16]],
        [0.36, [-0.14, 0.66, -0.12]],
        [0.50, [-0.06, 0.56, 0.44]],
        [0.62, [-0.06, 0.18, 0.48]],
        [1, [-0.22, -0.24, 0.26]],
      ], u);
      const rhWrist = sampleTrack([[0, 0], [0.36, 0.4], [0.56, -0.90], [1, 0]], u);
      // Left arm shields tightly across ribs rather than wings!
      const lhPos = sampleTrack([
        [0, [0.20, -0.14, 0.24]],
        [0.22, [0.32, 0.02, 0.26]],
        [0.48, [0.34, -0.10, 0.14]],
        [0.74, [0.26, -0.14, 0.22]],
        [1, [0.22, -0.24, 0.26]],
      ], u);

      const spinePitch = sampleTrack([[0, 0.12], [0.16, 0.22], [0.36, -0.26], [0.54, 0.30], [0.80, 0.18], [1, 0.10]], u);
      const chestYaw = sampleTrack([[0, 0], [0.36, -0.36], [0.54, 0.26], [1, 0]], u);

      return {
        bodyY: -gather,
        aerialLift: 0.48 * air,
        groundSnap: air < 0.04,
        armsInWorldYaw: true,
        spinePitch,
        chestYaw,
        headPitch: -0.18 * air,
        // Graceful NBA trail knee sweep (35deg flex, feet behind pelvis, NOT folded flat!)
        footL: { pos: [0.16, 0.024 + 0.10 * tuck, 0.04 - 0.18 * tuck], pole: [0.24, 0.16, 1.0], pitch: 0.45 * tuck },
        footR: { pos: [-0.16, 0.024 + 0.18 * tuck, -0.06 - 0.24 * tuck], pole: [-0.24, 0.18, 1.0], pitch: 0.52 * tuck },
        handR: { pos: rhPos, pole: [-0.28, 0.20, -0.55], curl: 0.48, wristPitch: rhWrist },
        handL: { pos: lhPos, pole: [0.46, -0.30, -0.78], curl: 0.40 },
      };
    },
  };

  motions.Anim_Dunk_V1 = {
    duration: 0.72,
    loop: false,
    sample(u) {
      const base = motions.Anim_2K_SlamDunk.sample(u);
      const symPos = sampleTrack([
        [0, [-0.15, -0.12, 0.24]],
        [0.16, [-0.14, 0.20, 0.16]],
        [0.36, [-0.13, 0.64, -0.08]],
        [0.52, [-0.12, 0.50, 0.46]],
        [0.64, [-0.12, 0.14, 0.44]],
        [1, [-0.22, -0.24, 0.26]],
      ], u);
      base.chestYaw = 0;
      base.handR = { pos: symPos, pole: [-0.30, -0.20, 0.35], curl: 0.45, wristPitch: base.handR.wristPitch };
      base.handL = { pos: [-symPos[0], symPos[1], symPos[2]], pole: [0.30, -0.20, 0.35], curl: 0.45, wristPitch: base.handR.wristPitch };
      return base;
    },
  };

  // --------------------------------------------------------------------------
  // 10. KEEPER SAVES (Horizontal Anim_EA_KeeperDive + Vertical Anim_EA_KeeperJump!)
  // --------------------------------------------------------------------------
  motions.Anim_EA_KeeperDive = {
    duration: 0.62,
    loop: false,
    sample(u) {
      const air = sampleTrack([[0, 0], [0.14, 0.76], [0.42, 1.0], [0.74, 0.36], [1, 0]], u);
      const diveArc = Math.sin(clamp((u - 0.06) / 0.86, 0, 1) * Math.PI);
      return {
        bodyY: lerp(-0.14, 0.04, diveArc),
        aerialLift: 0.42 * air,
        groundSnap: false,
        feetInBodySpace: true,
        bodyRoll: -1.24 * diveArc,
        bodyPitch: -0.16 * diveArc,
        bodyYaw: 0.20 * diveArc,
        spineRoll: -0.16 * diveArc,
        headRoll: 0.46 * diveArc,
        headYaw: -0.24 * diveArc,
        footL: { pos: [0.18, lerp(0.024, 0.16, diveArc), lerp(0.05, 0.08, diveArc)], pole: [0.25, 0.2, 1.0], pitch: 0.48 * diveArc },
        footR: { pos: [-0.20, lerp(0.024, 0.34, diveArc), lerp(-0.04, 0.24, diveArc)], pole: [-0.30, 0.3, 1.0], pitch: 0.56 * diveArc },
        handL: { pos: [lerp(0.30, 0.10, diveArc), lerp(-0.08, 0.60, diveArc), lerp(0.28, 0.24, diveArc)], pole: [0.4, 0.2, -0.8], curl: 0.12 },
        handR: { pos: [lerp(-0.30, -0.10, diveArc), lerp(-0.08, 0.58, diveArc), lerp(0.28, 0.22, diveArc)], pole: [-0.4, 0.2, -0.8], curl: 0.12 },
      };
    },
  };

  // Vertical Crossbar Tip / Aerial Catch Save with Athletic One-Knee Drive & Tall Extended Take-off Leg!
  motions.Anim_EA_KeeperJump = {
    duration: 0.60,
    loop: false,
    sample(u) {
      const air = sampleTrack([[0, 0], [0.16, 0.0], [0.44, 1.0], [0.76, 0.0], [1, 0]], u);
      const squat = sampleTrack([[0, 0.08], [0.16, 0.22], [0.30, 0.0], [0.80, 0.16], [1, 0.08]], u);
      const armsUp = sampleTrack([[0, 0], [0.16, 0.1], [0.42, 1.0], [0.68, 0.92], [1, 0]], u);
      const spinePitch = lerp(0.16, -0.10, air);
      return {
        bodyY: lerp(-squat, -0.02, air),
        aerialLift: 0.46 * air,
        groundSnap: air < 0.05,
        armsInWorldYaw: true,
        spinePitch,
        headPitch: -0.24 * armsUp,
        // Left knee drives sharply up in goalkeeper aerial protection while right takeoff leg extends cleanly!
        footL: { pos: [0.16, 0.024 + 0.36 * air, 0.08 + 0.20 * air], pole: [0.24, 0.30, 1.0], pitch: 0.45 * air },
        footR: { pos: [-0.16, 0.024, -0.04], pole: [-0.24, 0.14, 1.0], pitch: 0.40 * air },
        handL: { pos: [lerp(0.32, 0.14, armsUp), lerp(-0.08, 0.68, armsUp), lerp(0.32, 0.26, armsUp)], pole: [0.45, -0.10, -0.75], curl: 0.14 },
        handR: { pos: [lerp(-0.32, -0.14, armsUp), lerp(-0.08, 0.68, armsUp), lerp(0.32, 0.26, armsUp)], pole: [-0.45, -0.10, -0.75], curl: 0.14 },
      };
    },
  };

  // ROLL (Athletic Dodge / Keeper Dive fallback)
  motions.Roll = {
    duration: 0.56,
    loop: false,
    sample(u) {
      if (isKeeper) return motions.Anim_EA_KeeperDive.sample(u);
      const crouch = Math.sin(u * Math.PI);
      return {
        bodyY: -0.18 * crouch - 0.03,
        aerialLift: 0.18 * Math.sin(clamp((u - 0.15) / 0.65, 0, 1) * Math.PI),
        bodyPitch: 0.45 * crouch,
        spinePitch: 0.35 * crouch,
        armsInWorldYaw: true,
        footL: { pos: [0.16, 0.024 + 0.12 * crouch, 0.12 - 0.18 * crouch], pole: [0.25, 0.15, 1.0] },
        footR: { pos: [-0.16, 0.024 + 0.12 * crouch, -0.08 + 0.16 * crouch], pole: [-0.25, 0.15, 1.0] },
        handL: { pos: [0.24, -0.18, 0.34], pole: [0.5, -0.25, -0.75], curl: 0.45 },
        handR: { pos: [-0.24, -0.18, 0.34], pole: [-0.5, -0.25, -0.75], curl: 0.45 },
      };
    },
  };

  // --------------------------------------------------------------------------
  // 11. CELEBRATIONS, WAVE & HIT STUMBLES
  // --------------------------------------------------------------------------
  motions.Wave = {
    duration: 1.15,
    loop: true,
    sample(u) {
      const a = u * Math.PI * 2;
      return {
        bodyY: -0.03 + 0.012 * Math.abs(Math.sin(a)),
        spinePitch: -0.04,
        headYaw: 0.08 * Math.sin(a),
        armsInWorldYaw: true,
        footL: { pos: [0.16, 0.024, 0.05], pole: [0.25, 0.12, 1.0], yaw: 0.12 },
        footR: { pos: [-0.16, 0.024, -0.04], pole: [-0.25, 0.12, 1.0], yaw: -0.14 },
        handL: { pos: [0.24, -0.34, 0.12], pole: [0.45, -0.25, -0.80], curl: 0.4 },
        handR: { pos: [-0.30 + 0.12 * Math.sin(a * 2), 0.46 + 0.04 * Math.cos(a * 2), 0.16], pole: [-0.45, -0.35, -0.35], curl: 0.12 },
      };
    },
  };

  motions.Anim_Celebration = {
    duration: 1.15,
    loop: false,
    sample(u) {
      const air = sampleTrack([[0, 0], [0.22, 0], [0.42, 1.0], [0.62, 0], [1, 0]], u);
      const spread = sampleTrack([[0, 0], [0.20, 0.1], [0.58, 1.0], [0.85, 0.9], [1, 0.15]], u);
      const armsUp = sampleTrack([[0, 0], [0.35, 1.0], [0.55, 0.1], [1, 0]], u);
      return {
        bodyY: sampleTrack([[0, -0.04], [0.20, -0.16], [0.42, -0.04], [0.64, -0.08], [1, -0.03]], u),
        aerialLift: 0.34 * air,
        groundSnap: air < 0.04,
        spinePitch: sampleTrack([[0, 0.1], [0.22, 0.18], [0.58, -0.18], [0.88, -0.10], [1, 0.04]], u),
        headPitch: -0.18 * spread,
        armsInWorldYaw: true,
        footL: { pos: [0.16 + 0.18 * spread, 0.024 + 0.08 * air, 0.06], pole: [0.32, 0.12, 1.0], yaw: 0.20 },
        footR: { pos: [-0.16 - 0.18 * spread, 0.024 + 0.08 * air, -0.04], pole: [-0.32, 0.12, 1.0], yaw: -0.20 },
        handL: { pos: [0.24 + 0.28 * spread, -0.32 + 0.62 * armsUp + 0.38 * spread, 0.12 - 0.16 * spread], pole: [0.50, -0.30, -0.75], curl: 0.85 },
        handR: { pos: [-0.24 - 0.28 * spread, -0.32 + 0.62 * armsUp + 0.38 * spread, 0.12 - 0.16 * spread], pole: [-0.50, -0.30, -0.75], curl: 0.85 },
      };
    },
  };

  motions.Anim_Celeb_V1 = {
    duration: 1.05,
    loop: false,
    sample(u) {
      const p1 = Math.sin(clamp(u / 0.45, 0, 1) * Math.PI);
      const p2 = Math.sin(clamp((u - 0.45) / 0.45, 0, 1) * Math.PI);
      const pump = Math.max(p1, p2);
      return {
        bodyY: -0.04 - 0.06 * pump,
        aerialLift: 0.14 * p1,
        groundSnap: p1 < 0.1,
        spinePitch: -0.10 * pump,
        armsInWorldYaw: true,
        footL: { pos: [0.18, 0.024, 0.08], pole: [0.28, 0.12, 1.0], yaw: 0.14 },
        footR: { pos: [-0.18, 0.024, -0.05], pole: [-0.28, 0.12, 1.0], yaw: -0.14 },
        handL: { pos: [0.28, -0.20 + 0.65 * pump, 0.20], pole: [0.55, -0.30, -0.60], curl: 0.90 },
        handR: { pos: [-0.28, -0.20 + 0.65 * pump, 0.20], pole: [-0.55, -0.30, -0.60], curl: 0.90 },
      };
    },
  };

  motions.Anim_Celeb_V2 = {
    duration: 1.10,
    loop: false,
    sample(u) {
      const p = Math.sin(clamp(u / 0.9, 0, 1) * Math.PI);
      return {
        bodyY: -0.03,
        spinePitch: -0.08 * p,
        headPitch: -0.22 * p,
        armsInWorldYaw: true,
        footL: { pos: [0.16, 0.024, 0.12], pole: [0.24, 0.12, 1.0], yaw: 0.12 },
        footR: { pos: [-0.16, 0.024, -0.08], pole: [-0.24, 0.12, 1.0], yaw: -0.14 },
        handL: { pos: [0.26, -0.30, 0.14], pole: [0.45, -0.25, -0.80], curl: 0.45 },
        handR: { pos: [-0.18, lerp(-0.20, 0.64, p), 0.16], pole: [-0.30, -0.25, -0.60], curl: 0.65 },
      };
    },
  };

  function makeHit(dirX) {
    return {
      duration: 0.48,
      loop: false,
      sample(u) {
        const hit = Math.sin(u * Math.PI);
        return {
          bodyY: -0.06 * hit - 0.03,
          bodyRoll: dirX * 0.20 * hit,
          spinePitch: -0.24 * hit,
          headPitch: -0.18 * hit,
          armsInWorldYaw: true,
          footL: { pos: [0.17, 0.024, 0.08 - 0.10 * hit], pole: [0.25, 0.12, 1.0] },
          footR: { pos: [-0.17, 0.024, -0.06 - 0.12 * hit], pole: [-0.25, 0.12, 1.0] },
          handL: { pos: [0.32, -0.22 + 0.14 * hit, 0.20], pole: [0.50, -0.25, -0.75], curl: 0.35 },
          handR: { pos: [-0.32, -0.22 + 0.14 * hit, 0.20], pole: [-0.50, -0.25, -0.75], curl: 0.35 },
        };
      },
    };
  }
  motions.HitRecieve = makeHit(1);
  motions.HitRecieve_2 = makeHit(-1);
  motions.Punch_Left = makeBasketballSteal(false);
  motions.Punch_Right = makeBasketballSteal(true);

  return motions;
}

// ============================================================================
// Pack Binary Buffer & Emit Clean Compact GLBs
// ============================================================================
function rebuildGLB(filePath, role) {
  const { gltf, bin } = readGLB(filePath);
  const skel = buildSkeletonHelper(gltf);
  const motions = makeMotions(role);

  const keepBufViews = new Set();
  (gltf.meshes || []).forEach((m) => {
    (m.primitives || []).forEach((p) => {
      if (p.indices !== undefined) keepBufViews.add(gltf.accessors[p.indices].bufferView);
      Object.values(p.attributes || {}).forEach((accIdx) => {
        if (gltf.accessors[accIdx] && gltf.accessors[accIdx].bufferView !== undefined) {
          keepBufViews.add(gltf.accessors[accIdx].bufferView);
        }
      });
    });
  });
  (gltf.skins || []).forEach((s) => {
    if (s.inverseBindMatrices !== undefined) {
      keepBufViews.add(gltf.accessors[s.inverseBindMatrices].bufferView);
    }
  });
  (gltf.images || []).forEach((im) => {
    if (im.bufferView !== undefined) keepBufViews.add(im.bufferView);
  });

  const oldAccList = gltf.accessors || [];
  const oldBVList = gltf.bufferViews || [];
  const bvRemap = new Map();
  const accRemap = new Map();
  const binChunks = [];
  let byteCursor = 0;

  const newBufferViews = [];
  const newAccessors = [];

  function pushBin(bytes) {
    const pad = (4 - (bytes.length % 4)) % 4;
    const total = bytes.length + pad;
    binChunks.push(bytes);
    if (pad > 0) binChunks.push(Buffer.alloc(pad));
    const offset = byteCursor;
    byteCursor += total;
    return { byteOffset: offset, byteLength: bytes.length };
  }

  for (let oldBvIdx = 0; oldBvIdx < oldBVList.length; oldBvIdx++) {
    if (!keepBufViews.has(oldBvIdx)) continue;
    const bv = oldBVList[oldBvIdx];
    const slice = bin.subarray(bv.byteOffset || 0, (bv.byteOffset || 0) + bv.byteLength);
    const { byteOffset, byteLength } = pushBin(slice);
    const newBvIdx = newBufferViews.length;
    bvRemap.set(oldBvIdx, newBvIdx);
    newBufferViews.push({ ...bv, buffer: 0, byteOffset, byteLength });
  }

  const usedAcc = new Set();
  (gltf.meshes || []).forEach((m) => {
    (m.primitives || []).forEach((p) => {
      if (p.indices !== undefined) usedAcc.add(p.indices);
      Object.values(p.attributes || {}).forEach((a) => usedAcc.add(a));
    });
  });
  (gltf.skins || []).forEach((s) => {
    if (s.inverseBindMatrices !== undefined) usedAcc.add(s.inverseBindMatrices);
  });

  for (let i = 0; i < oldAccList.length; i++) {
    if (!usedAcc.has(i)) continue;
    const acc = { ...oldAccList[i] };
    if (acc.bufferView !== undefined) acc.bufferView = bvRemap.get(acc.bufferView);
    accRemap.set(i, newAccessors.length);
    newAccessors.push(acc);
  }

  (gltf.meshes || []).forEach((m) => {
    (m.primitives || []).forEach((p) => {
      if (p.indices !== undefined) p.indices = accRemap.get(p.indices);
      Object.keys(p.attributes || {}).forEach((k) => {
        p.attributes[k] = accRemap.get(p.attributes[k]);
      });
    });
  });
  (gltf.skins || []).forEach((s) => {
    if (s.inverseBindMatrices !== undefined) s.inverseBindMatrices = accRemap.get(s.inverseBindMatrices);
  });
  (gltf.images || []).forEach((im) => {
    if (im.bufferView !== undefined) im.bufferView = bvRemap.get(im.bufferView);
  });

  function addFloatAccessor(floatArr, type, withMinMax = false) {
    const raw = Buffer.from(floatArr.buffer, floatArr.byteOffset, floatArr.byteLength);
    const { byteOffset, byteLength } = pushBin(raw);
    const bvIdx = newBufferViews.length;
    newBufferViews.push({ buffer: 0, byteOffset, byteLength });
    const count = type === 'SCALAR' ? floatArr.length : type === 'VEC3' ? floatArr.length / 3 : floatArr.length / 4;
    const acc = { bufferView: bvIdx, componentType: 5126, count, type };
    if (withMinMax && type === 'SCALAR') {
      let mn = Infinity, mx = -Infinity;
      for (let i = 0; i < floatArr.length; i++) {
        if (floatArr[i] < mn) mn = floatArr[i];
        if (floatArr[i] > mx) mx = floatArr[i];
      }
      acc.min = [mn];
      acc.max = [mx];
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
    for (let f = 0; f < numFrames; f++) {
      times[f] = (f / (numFrames - 1)) * dur;
    }
    const timeAcc = addFloatAccessor(times, 'SCALAR', true);

    const firstEval = evaluatePoseToChannels(skel, def.sample(0));
    const rotNodeIds = Object.keys(firstEval.animQ).map(Number);
    const posNodeIds = Object.keys(firstEval.animP).map(Number);

    const rotArrays = {};
    const posArrays = {};
    rotNodeIds.forEach((nId) => { rotArrays[nId] = new Float32Array(numFrames * 4); });
    posNodeIds.forEach((nId) => { posArrays[nId] = new Float32Array(numFrames * 3); });

    const prevQ = {};
    for (let f = 0; f < numFrames; f++) {
      const u = (def.loop && f === numFrames - 1) ? 0 : (f / (numFrames - 1));
      const res = evaluatePoseToChannels(skel, def.sample(u));

      for (const nId of rotNodeIds) {
        let q = res.animQ[nId];
        if (prevQ[nId]) {
          const p = prevQ[nId];
          if (p[0] * q[0] + p[1] * q[1] + p[2] * q[2] + p[3] * q[3] < 0) {
            q = [-q[0], -q[1], -q[2], -q[3]];
          }
        }
        prevQ[nId] = q;
        const off = f * 4;
        rotArrays[nId][off] = q[0];
        rotArrays[nId][off + 1] = q[1];
        rotArrays[nId][off + 2] = q[2];
        rotArrays[nId][off + 3] = q[3];
      }
      for (const nId of posNodeIds) {
        const p = res.animP[nId];
        const off = f * 3;
        posArrays[nId][off] = p[0];
        posArrays[nId][off + 1] = p[1];
        posArrays[nId][off + 2] = p[2];
      }
    }

    const samplers = [];
    const channels = [];

    for (const nId of posNodeIds) {
      const outAcc = addFloatAccessor(posArrays[nId], 'VEC3');
      samplers.push({ input: timeAcc, interpolation: 'LINEAR', output: outAcc });
      channels.push({ sampler: samplers.length - 1, target: { node: nId, path: 'translation' } });
    }
    for (const nId of rotNodeIds) {
      const outAcc = addFloatAccessor(rotArrays[nId], 'VEC4');
      samplers.push({ input: timeAcc, interpolation: 'LINEAR', output: outAcc });
      channels.push({ sampler: samplers.length - 1, target: { node: nId, path: 'rotation' } });
    }

    newAnimations.push({ name: animName, samplers, channels });
  }

  gltf.bufferViews = newBufferViews;
  gltf.accessors = newAccessors;
  gltf.animations = newAnimations;
  const fullBin = Buffer.concat(binChunks);
  gltf.buffers = [{ byteLength: fullBin.length }];

  const jsonText = JSON.stringify(gltf);
  let jsonBuf = Buffer.from(jsonText, 'utf8');
  const jsonPad = (4 - (jsonBuf.length % 4)) % 4;
  if (jsonPad > 0) jsonBuf = Buffer.concat([jsonBuf, Buffer.alloc(jsonPad, 0x20)]);

  const totalLen = 12 + 8 + jsonBuf.length + 8 + fullBin.length;
  const out = Buffer.alloc(totalLen);
  out.writeUInt32LE(0x46546c67, 0);
  out.writeUInt32LE(2, 4);
  out.writeUInt32LE(totalLen, 8);

  out.writeUInt32LE(jsonBuf.length, 12);
  out.writeUInt32LE(0x4e4f534a, 16);
  jsonBuf.copy(out, 20);

  const binOff = 20 + jsonBuf.length;
  out.writeUInt32LE(fullBin.length, binOff);
  out.writeUInt32LE(0x004e4942, binOff + 4);
  fullBin.copy(out, binOff + 8);

  fs.writeFileSync(filePath, out);
  console.log(`✓ Rebuilt v4.8 ${path.basename(filePath)} (${(out.length / 1024).toFixed(1)} KB, ${newAnimations.length} 60fps clips)`);
}

rebuildGLB(path.join(ROOT, 'assets/characters/footy10.glb'), 'footy');
rebuildGLB(path.join(ROOT, 'assets/characters/hoops23.glb'), 'hoops');
rebuildGLB(path.join(ROOT, 'assets/characters/keeper1.glb'), 'keeper');
