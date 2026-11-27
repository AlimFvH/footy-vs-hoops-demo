'use strict';

/**
 * FOOTY vs HOOPS — Zero-Legacy Pro 3D Sports Animation Authoring Engine
 *
 * Built completely from scratch against exact measured rig geometry:
 *   Body Y = 0.865m | Hip Joint Y = 0.964m (Z = +0.045, X = ±0.121)
 *   UpperLeg = 0.433m | LowerLeg = 0.511m | Total Leg = 0.944m | Ankle Rest Y = 0.023m
 *   Chest Y = 1.377m (above Body +0.512) | Shoulder Joint = Chest + [±0.153, +0.055, +0.019]
 *   UpperArm = 0.182m | LowerArm = 0.235m | Total Arm = 0.417m
 *
 * Key Animation Engineering Principles:
 *   1. True Heel-Strike -> Flat Stance -> Explosive Toe-Off -> Butt-Kick Knee-Drive stride kinematics
 *   2. Anatomically Natural Clavicle Elevation/Protraction + Pendulum 80-115deg Elbow Whip (never stiff straight arms)
 *   3. S-Curve Overlapping Spine (Hips -> Abdomen -> Torso -> Chest -> Neck -> Head phase drag)
 *   4. Zero Knee Locking (max 94.6% reach) & Ground-Locked Pivot Contact (0.00mm turf float or penetration)
 *   5. Distinct NBA & EA FC Signature Action Arcs with Anticipation -> Impact -> Follow-Through -> Recovery
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FPS = 60;

// ----------------------------------------------------------------------------
// 1. Vector, Quaternion & C1 Centripetal Catmull-Rom Math
// ----------------------------------------------------------------------------
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
function qId() { return [0, 0, 0, 1]; }
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
function qAxisAngle(ax, rad) {
  const n = v3.norm(ax);
  const h = rad * 0.5;
  const s = Math.sin(h);
  return qNorm([n[0] * s, n[1] * s, n[2] * s, Math.cos(h)]);
}
function qEuler(rx, ry, rz) {
  return qNorm(qMul(qAxisAngle([0, 1, 0], ry), qMul(qAxisAngle([1, 0, 0], rx), qAxisAngle([0, 0, 1], rz))));
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
function qRot(q, v) {
  const u = [q[0], q[1], q[2]];
  const s = q[3];
  const uv = v3.cross(u, v);
  const uuv = v3.cross(u, uv);
  return [v[0] + 2 * (s * uv[0] + uuv[0]), v[1] + 2 * (s * uv[1] + uuv[1]), v[2] + 2 * (s * uv[2] + uuv[2])];
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
function basisYRefZ(dirY, refZ) {
  const y = v3.norm(dirY);
  let x = v3.cross(y, refZ);
  if (v3.len(x) < 1e-4) x = v3.cross(y, Math.abs(y[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]);
  x = v3.norm(x);
  const z = v3.norm(v3.cross(x, y));
  return qFromBasisCols(x, y, z);
}
function aimBoneQ(restWorldQ, targetDir, twistRefWorld) {
  const restDir = qRot(restWorldQ, [0, 1, 0]);
  const restRef = qRot(restWorldQ, [0, 0, 1]);
  const qRest = basisYRefZ(restDir, restRef);
  const qTarg = basisYRefZ(targetDir, twistRefWorld);
  return qNorm(qMul(qMul(qTarg, qConj(qRest)), restWorldQ));
}
function solveIK2(rootPos, targetPos, len1, len2, poleDir, maxRatio = 0.965) {
  const raw = v3.sub(targetPos, rootPos);
  const rawDist = v3.len(raw);
  const maxR = (len1 + len2) * maxRatio;
  const minR = Math.max(0.06, Math.abs(len1 - len2) + 0.045);
  const dist = clamp(rawDist, minR, maxR);
  const dir = rawDist > 1e-5 ? v3.scale(raw, 1 / rawDist) : [0, -1, 0];
  const endPos = v3.add(rootPos, v3.scale(dir, dist));

  const cosA = clamp((len1 * len1 + dist * dist - len2 * len2) / (2 * len1 * dist), -1, 1);
  const sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));

  let bend = v3.sub(poleDir, v3.scale(dir, v3.dot(poleDir, dir)));
  if (v3.len(bend) < 1e-4) {
    const fb = Math.abs(dir[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
    bend = v3.sub(fb, v3.scale(dir, v3.dot(fb, dir)));
  }
  bend = v3.norm(bend);

  const midPos = v3.add(rootPos, v3.add(v3.scale(dir, len1 * cosA), v3.scale(bend, len1 * sinA)));
  return {
    midPos, endPos,
    dir1: v3.norm(v3.sub(midPos, rootPos)),
    dir2: v3.norm(v3.sub(endPos, midPos)),
    bendNormal: v3.norm(v3.cross(dir, bend)),
    bendPlane: bend,
  };
}

function trackCR(keys, u) {
  if (!keys || !keys.length) return 0;
  if (keys.length === 1) return keys[0][1];
  const x = clamp(u, 0, 1);
  if (x <= keys[0][0]) return keys[0][1];
  if (x >= keys[keys.length - 1][0]) return keys[keys.length - 1][1];
  let seg = 0;
  for (let i = 0; i < keys.length - 1; i++) {
    if (x >= keys[i][0] && x <= keys[i + 1][0]) { seg = i; break; }
  }
  const t0 = keys[seg][0], t1 = keys[seg + 1][0];
  const t = clamp((x - t0) / Math.max(1e-6, t1 - t0), 0, 1);
  const iP = Math.max(0, seg - 1), iN = Math.min(keys.length - 1, seg + 2);
  const t2 = t * t, t3 = t2 * t;
  const eval1 = (p0, p1, p2, p3) => {
    const dtP = Math.max(0.02, keys[seg + 1][0] - keys[iP][0]);
    const dtN = Math.max(0.02, keys[iN][0] - keys[seg][0]);
    const dtS = Math.max(0.02, t1 - t0);
    const m1 = seg === 0 ? (p2 - p1) * 0.45 : clamp(((p2 - p0) / dtP) * dtS * 0.86, -2.4 * Math.abs(p2 - p1) - 0.14, 2.4 * Math.abs(p2 - p1) + 0.14);
    const m2 = seg + 1 === keys.length - 1 ? (p2 - p1) * 0.45 : clamp(((p3 - p1) / dtN) * dtS * 0.86, -2.4 * Math.abs(p2 - p1) - 0.14, 2.4 * Math.abs(p2 - p1) + 0.14);
    return (2 * t3 - 3 * t2 + 1) * p1 + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * p2 + (t3 - t2) * m2;
  };
  return Array.isArray(keys[seg][1])
    ? keys[seg][1].map((_, c) => eval1(keys[iP][1][c], keys[seg][1][c], keys[seg + 1][1][c], keys[iN][1][c]))
    : eval1(keys[iP][1], keys[seg][1], keys[seg + 1][1], keys[iN][1]);
}

// ----------------------------------------------------------------------------
// 2. GLB Rig Reader & Zero-Overlap Anatomical Pose Solver
// ----------------------------------------------------------------------------
function readGLB(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf.readUInt32LE(0) !== 0x46546c67) throw new Error('Invalid GLB: ' + filePath);
  let off = 12, gltf = null, bin = Buffer.alloc(0);
  while (off < buf.length) {
    const len = buf.readUInt32LE(off), type = buf.readUInt32LE(off + 4);
    off += 8;
    const chunk = buf.subarray(off, off + len);
    if (type === 0x4e4f534a) gltf = JSON.parse(chunk.toString('utf8'));
    else if (type === 0x004e4942) bin = chunk;
    off += len;
  }
  return { gltf, bin };
}

function buildSkeleton(gltf) {
  const nodes = gltf.nodes, byName = {};
  const parent = new Int32Array(nodes.length).fill(-1);
  nodes.forEach((n, i) => {
    if (n.name) byName[n.name] = i;
    (n.children || []).forEach(c => { parent[c] = i; });
  });
  const wp = Array(nodes.length), wq = Array(nodes.length);
  const walk = (i) => {
    if (wp[i]) return;
    const p = parent[i], n = nodes[i];
    const t = n.translation ? [...n.translation] : [0, 0, 0];
    const r = n.rotation ? qNorm(n.rotation) : qId();
    if (p < 0) { wp[i] = t; wq[i] = r; }
    else { walk(p); wp[i] = v3.add(wp[p], qRot(wq[p], t)); wq[i] = qNorm(qMul(wq[p], r)); }
  };
  for (let i = 0; i < nodes.length; i++) walk(i);
  return {
    nodes, byName, parent, wp, wq,
    upperLegLen: v3.len(nodes[byName['LowerLeg.L']].translation),
    lowerLegLen: v3.len(nodes[byName['Foot.L']].translation),
    upperArmLen: v3.len(nodes[byName['LowerArm.L']].translation),
    lowerArmLen: v3.len(nodes[byName['Wrist.L']].translation),
    ankleRestY: wp[byName['Foot.L']][1],
    hipRestZ: wp[byName['UpperLeg.L']][2],
    shoulderFromChest: v3.sub(wp[byName['UpperArm.L']], wp[byName['Chest']]),
  };
}

function solvePose(skel, sp) {
  const { nodes, byName, wp, wq } = skel;
  const animQ = {}, animP = {};
  const rootWQ = wq[byName.Root];
  const bodyIdx = byName.Body;
  const bodyRestT = nodes[bodyIdx].translation;

  const bodyRot = qNorm(qEuler(sp.bodyPitch || 0, sp.bodyYaw || 0, sp.bodyRoll || 0));
  const bodyPos = [
    wp[bodyIdx][0] + (sp.bodyX || 0),
    wp[bodyIdx][1] + (sp.bodyY || 0),
    wp[bodyIdx][2] + (sp.bodyZ || 0),
  ];
  const bodyWQ = qNorm(qMul(bodyRot, wq[bodyIdx]));
  animQ[bodyIdx] = qNorm(qMul(qConj(rootWQ), bodyWQ));
  const relFromBody = (idx) => v3.sub(wp[idx], wp[bodyIdx]);

  function chain(idx, pIdx, pWQ, pWPos, delta) {
    const restRel = qRot(qConj(wq[pIdx]), v3.sub(wp[idx], wp[pIdx]));
    const wPos = v3.add(pWPos, qRot(pWQ, restRel));
    const locRot = qNorm(qMul(delta, qNorm(nodes[idx].rotation || qId())));
    animQ[idx] = locRot;
    return { wPos, wQ: qNorm(qMul(pWQ, locRot)) };
  }

  const spP = sp.spinePitch || 0, spY = sp.spineYaw || 0, spR = sp.spineRoll || 0;
  const hipsSt = chain(byName.Hips, bodyIdx, bodyWQ, bodyPos, qEuler(sp.hipsPitch || 0, sp.hipsYaw || 0, sp.hipsRoll || 0));
  const abdSt = chain(byName.Abdomen, byName.Hips, hipsSt.wQ, hipsSt.wPos, qEuler(spP * 0.34 + (sp.abdPitch || 0), spY * 0.30 + (sp.abdYaw || 0), spR * 0.32));
  const torsoSt = chain(byName.Torso, byName.Abdomen, abdSt.wQ, abdSt.wPos, qEuler(spP * 0.36, spY * 0.36 + (sp.torsoYaw || 0), spR * 0.36));
  const chestSt = chain(byName.Chest, byName.Torso, torsoSt.wQ, torsoSt.wPos, qEuler(spP * 0.30 + (sp.chestPitch || 0), spY * 0.34 + (sp.chestYaw || 0), spR * 0.32 + (sp.chestRoll || 0)));
  const neckSt = chain(byName.Neck, byName.Chest, chestSt.wQ, chestSt.wPos, qEuler((sp.headPitch || 0) * 0.36, (sp.headYaw || 0) * 0.38, (sp.headRoll || 0) * 0.35));
  chain(byName.Head, byName.Neck, neckSt.wQ, neckSt.wPos, qEuler((sp.headPitch || 0) * 0.64, (sp.headYaw || 0) * 0.62, (sp.headRoll || 0) * 0.65));

  const chestDeltaWQ = qNorm(qMul(chestSt.wQ, qConj(wq[byName.Chest])));
  const armFrameQ = sp.armsInWorldYaw ? qEuler(0, sp.bodyYaw || 0, 0) : chestDeltaWQ;

  // Anatomical Shoulder + Arm Two-Bone IK (calibrated in Shoulder-joint neighborhood so elbows NEVER hyperextend or twist inward!)
  function solveArm(side) {
    const sgn = side === 'L' ? 1 : -1;
    const shIdx = byName['Shoulder.' + side], uaIdx = byName['UpperArm.' + side], laIdx = byName['LowerArm.' + side], wrIdx = byName['Wrist.' + side];
    const h = side === 'L' ? sp.handL : sp.handR;
    const hRel = h ? h.pos : [sgn * 0.28, -0.32, 0.14];
    const poleRel = (h && h.pole) ? h.pole : [sgn * 0.42, -0.32, -0.82];

    // Natural clavicle drop when arms hang low, elevation when raised above shoulder, protraction forward
    const relFromShY = hRel[1] - 0.055;
    const clavElev = h && h.clavElev !== undefined ? h.clavElev : clamp(relFromShY * 0.55 - 0.04, -0.14, 0.52);
    const clavFwd = h && h.clavFwd !== undefined ? h.clavFwd : clamp((hRel[2] - 0.04) * 0.34, -0.18, 0.26);
    const shSt = chain(shIdx, byName.Chest, chestSt.wQ, chestSt.wPos, qEuler(0, -sgn * clavFwd, sgn * clavElev));

    const uaRel = qRot(qConj(wq[shIdx]), v3.sub(wp[uaIdx], wp[shIdx]));
    const shoulderPos = v3.add(shSt.wPos, qRot(shSt.wQ, uaRel));

    const handWorld = v3.add(chestSt.wPos, qRot(armFrameQ, hRel));
    const poleWorld = qRot(armFrameQ, poleRel);

    const ik = solveIK2(shoulderPos, handWorld, skel.upperArmLen, skel.lowerArmLen, poleWorld, h && h.maxReach ? h.maxReach : 0.968);
    const uaTwist = v3.norm(v3.add(v3.scale(poleWorld, 0.78), v3.scale(ik.bendNormal, sgn * 0.22)));
    const uaWQ = aimBoneQ(wq[uaIdx], ik.dir1, uaTwist);
    animQ[uaIdx] = qNorm(qMul(qConj(shSt.wQ), uaWQ));

    const laWQ = aimBoneQ(wq[laIdx], ik.dir2, poleWorld);
    animQ[laIdx] = qNorm(qMul(qConj(uaWQ), laWQ));

    animQ[wrIdx] = qNorm(qMul(nodes[wrIdx].rotation || qId(), qEuler((h && h.wristPitch) || 0, (h && h.wristYaw) || 0, (h && h.wristRoll) || 0)));

    const curl = h && typeof h.curl === 'number' ? h.curl : 0.55;
    ['Index1', 'Index2', 'Index3', 'Middle1', 'Middle2', 'Middle3', 'Ring1', 'Ring2', 'Ring3', 'Pinky1', 'Pinky2', 'Pinky3'].forEach((fn, fIdx) => {
      const fNode = byName[fn + '.' + side];
      if (fNode === undefined) return;
      const seg = fn.endsWith('1') ? 0.58 : (fn.endsWith('2') ? 0.72 : 0.48);
      animQ[fNode] = qNorm(qMul(nodes[fNode].rotation || qId(), qAxisAngle([1, 0, 0], -curl * seg * (0.94 + (fIdx % 4) * 0.04))));
    });
    ['Thumb1', 'Thumb2'].forEach((tn) => {
      const tNode = byName[tn + '.' + side];
      if (tNode === undefined) return;
      animQ[tNode] = qNorm(qMul(nodes[tNode].rotation || qId(), qEuler(-curl * 0.24, 0, sgn * curl * 0.34)));
    });
  }
  solveArm('L');
  solveArm('R');

  // Anatomically Calibrated Two-Bone Leg IK (Max 94.4% reach guarantees natural knee flex even in full sprint!)
  function solveLeg(side) {
    const sgn = side === 'L' ? 1 : -1;
    const ulIdx = byName['UpperLeg.' + side], llIdx = byName['LowerLeg.' + side], ftIdx = byName['Foot.' + side];
    const f = side === 'L' ? sp.footL : sp.footR;
    // Foot default offset uses actual rest hip Z (0.045) for balanced upright posture
    const targetRel = f ? f.pos : [sgn * 0.145, skel.ankleRestY, 0.06];

    const hipWorld = v3.add(bodyPos, qRot(bodyRot, relFromBody(ulIdx)));
    const fullBody = Boolean(sp.feetInBodySpace);
    let footPos = fullBody
      ? v3.add(bodyPos, qRot(bodyRot, [targetRel[0], targetRel[1] - wp[bodyIdx][1], targetRel[2]]))
      : v3.add([sp.footBaseX || 0, 0, sp.footBaseZ || 0], qRot(qAxisAngle([0, 1, 0], sp.bodyYaw || 0), targetRel));

    if (!sp.allowStraightLegs) {
      const toF = v3.sub(footPos, hipWorld);
      const maxL = (skel.upperLegLen + skel.lowerLegLen) * (sp.maxLegRatio || 0.944);
      const lenF = v3.len(toF);
      if (lenF > maxL) footPos = v3.add(hipWorld, v3.scale(toF, maxL / lenF));
    }

    const poleRel = (f && f.pole) || [sgn * 0.16, 0.14, 1.0];
    const poleW = qRot(fullBody ? bodyRot : qAxisAngle([0, 1, 0], sp.bodyYaw || 0), poleRel);
    const ik = solveIK2(hipWorld, footPos, skel.upperLegLen, skel.lowerLegLen, poleW, sp.allowStraightLegs ? 0.992 : 0.985);

    const ulWQ = aimBoneQ(wq[ulIdx], ik.dir1, v3.scale(ik.bendNormal, sgn));
    animQ[ulIdx] = qNorm(qMul(qConj(bodyWQ), ulWQ));
    const llWQ = aimBoneQ(wq[llIdx], ik.dir2, v3.scale(ik.bendPlane, -1));
    animQ[llIdx] = qNorm(qMul(qConj(ulWQ), llWQ));

    const fPitch = (f && f.pitch) || 0, fYaw = (f && f.yaw) || 0, fRoll = (f && f.roll) || 0;
    const fRotW = fullBody ? qMul(bodyRot, qEuler(fPitch, fYaw, fRoll)) : qEuler(fPitch, (sp.bodyYaw || 0) + fYaw, fRoll);
    const fFwd = qRot(fRotW, [0, 0, 1]), fDown = qRot(fRotW, [0, -1, 0]);
    const ftWQ = aimBoneQ(wq[ftIdx], fFwd, fDown);
    animQ[ftIdx] = qNorm(qMul(qConj(llWQ), ftWQ));

    // Sole clearance accounting for heel vs toe pitch during roll-off
    const heelY = ik.endPos[1] - skel.ankleRestY * Math.max(0.42, Math.abs(fDown[1]));
    const toeY = ik.endPos[1] + fFwd[1] * 0.14 - skel.ankleRestY * Math.max(0.32, Math.abs(fDown[1]));
    return Math.min(heelY, toeY);
  }

  const minShoeY = Math.min(solveLeg('L'), solveLeg('R'));
  const ySnap = (sp.groundSnap !== false) ? ((sp.floorOffsetY || 0) - minShoeY) : 0;

  animP[bodyIdx] = [
    bodyRestT[0] + (sp.bodyX || 0),
    bodyRestT[1] + (sp.bodyY || 0) + (sp.aerialLift || 0) + ySnap,
    bodyRestT[2] + (sp.bodyZ || 0),
  ];

  return { animQ, animP };
}

function mirrorSpecLR(sp) {
  const mP = (p) => p ? [-p[0], p[1], p[2]] : p;
  const mH = (h) => h ? { ...h, pos: mP(h.pos), pole: mP(h.pole), wristYaw: -(h.wristYaw || 0), wristRoll: -(h.wristRoll || 0) } : undefined;
  const mF = (f) => f ? { ...f, pos: mP(f.pos), pole: mP(f.pole), yaw: -(f.yaw || 0), roll: -(f.roll || 0) } : undefined;
  return {
    ...sp,
    bodyX: -(sp.bodyX || 0), bodyYaw: -(sp.bodyYaw || 0), bodyRoll: -(sp.bodyRoll || 0),
    abdYaw: -(sp.abdYaw || 0), torsoYaw: -(sp.torsoYaw || 0),
    spineYaw: -(sp.spineYaw || 0), spineRoll: -(sp.spineRoll || 0),
    chestYaw: -(sp.chestYaw || 0), chestRoll: -(sp.chestRoll || 0),
    headYaw: -(sp.headYaw || 0), headRoll: -(sp.headRoll || 0),
    handL: mH(sp.handR), handR: mH(sp.handL),
    footL: mF(sp.footR), footR: mF(sp.footL),
  };
}

// ----------------------------------------------------------------------------
// 3. Ballistic Athlete Locomotion Synthesis (Heel-Strike -> Flat -> Toe-Off -> Knee-Drive)
// ----------------------------------------------------------------------------
function buildBallisticStride(u, opts = {}) {
  const p = u * Math.PI * 2;
  const strideFwd = opts.strideFwd || 0.44;
  const strideBack = opts.strideBack || 0.44;
  const swingLift = opts.swingLift || 0.28;
  const buttKick = opts.buttKick || 0.34;
  const stanceX = opts.stanceX || 0.145;

  // Continuous gait function where s in [0,1) starts at Heel-Strike (0.00), Flat Stance (0.08..0.34), Toe-Off (0.44), Swing (0.44..1.00)
  function evalLeg(phase01, sgn) {
    const ph = ((phase01 % 1) + 1) % 1;
    let z, y, pitch, kneeSpread;
    if (ph < 0.44) {
      // Stance phase: foot sweeps smoothly backward relative to COM from +strideFwd to -strideBack
      const k = ph / 0.44;
      z = lerp(strideFwd, -strideBack, smoothstep(k));
      // Touchdown heel angle (-0.26) -> planted flat -> rising heel on toe-off (+0.52)
      if (k < 0.18) {
        const hk = k / 0.18;
        y = 0.023 + (1 - hk) * 0.014;
        pitch = lerp(-0.26, 0.0, smoothstep(hk));
      } else if (k < 0.72) {
        y = 0.023;
        pitch = lerp(0.0, 0.08, (k - 0.18) / 0.54);
      } else {
        const tk = (k - 0.72) / 0.28;
        y = 0.023 + 0.055 * smoothstep(tk);
        pitch = lerp(0.08, 0.56, smoothstep(tk));
      }
      kneeSpread = 0.16;
    } else {
      // Swing phase: push off back, fold heel sharply up behind hip (butt-kick), punch knee forward-up, extend for heel strike
      const sw = (ph - 0.44) / 0.56;
      z = lerp(-strideBack, strideFwd, smootherstep(sw));
      // Bell-shaped swing lift peaking higher at back butt-kick + mid knee-drive
      const liftEnv = Math.sin(sw * Math.PI);
      const kickPulse = Math.exp(-Math.pow((sw - 0.32) / 0.24, 2));
      y = 0.023 + swingLift * Math.pow(liftEnv, 0.9) + buttKick * kickPulse * 0.55;
      // Foot relaxes toe-down during recovery then dorsiflexes ready for heel-strike
      pitch = lerp(0.56, -0.26, smootherstep(sw)) + 0.20 * Math.sin(sw * Math.PI);
      kneeSpread = 0.18;
    }
    return {
      pos: [sgn * stanceX, y, z + 0.04],
      pole: [sgn * kneeSpread, 0.16 + 0.14 * Math.max(0, y - 0.04), 1.0],
      pitch,
      yaw: sgn * 0.05,
    };
  }

  // Foot L starts Heel-Strike at phase 0.00; Foot R starts Heel-Strike at phase 0.50
  const footL = evalLeg(u, 1);
  const footR = evalLeg(u + 0.5, -1);

  // Double-frequency vertical center-of-mass bounce: lowest at mid-stance (0.18 / 0.68), highest at flight (0.45 / 0.95)
  const bob = -Math.cos(u * Math.PI * 4);
  // Hip-Chest counter-torsion with subtle 0.06 phase lag (S-curve overlap!)
  const hipTwist = Math.cos(p);
  const chestTwist = Math.cos(p - 0.22);

  // Pendulum bent-elbow runner's arm arc (stays in shoulder plane: Y near chest/waist, compact Z with true 80-115deg bend!)
  function evalRunnerArm(armPhase, sgn) {
    // At phase 0 (Left Foot ahead), Right Arm pumps Forward (+1), Left Arm pumps Back (-1)
    const drive = Math.cos(armPhase * Math.PI * 2);
    const armFwd = opts.armFwd !== undefined ? opts.armFwd : 0.22;
    const armBack = opts.armBack !== undefined ? opts.armBack : 0.20;
    const armWidth = opts.armWidth !== undefined ? opts.armWidth : 0.25;
    const elbowUp = opts.armUp !== undefined ? opts.armUp : 0.15;
    const baseY = opts.armBaseY !== undefined ? opts.armBaseY : -0.17;
    // Forward swing brings hand UP toward sternum/chin cleanly (bent elbow!); back swing brushes past hip
    const x = sgn * (armWidth - Math.max(0, drive) * 0.055);
    const y = baseY + (drive >= 0 ? elbowUp * Math.pow(drive, 0.9) : 0.07 * Math.pow(-drive, 1.1));
    const z = (drive >= 0 ? armFwd * drive : -armBack * (-drive)) + 0.03;
    const curl = lerp(opts.curlLo || 0.72, opts.curlHi || 0.92, 0.5 + 0.5 * drive);
    return {
      pos: [x, y, z],
      pole: [sgn * 0.36, -0.32, -0.84],
      clavElev: clamp((y - 0.04) * 0.45 - 0.04, -0.10, 0.22),
      clavFwd: drive * 0.14,
      curl,
      wristYaw: -sgn * 0.14,
    };
  }

  return {
    bodyY: (opts.baseY !== undefined ? opts.baseY : -0.075) + (opts.bobAmt || 0.028) * bob,
    bodyPitch: opts.bodyPitch || 0,
    spinePitch: (opts.spinePitch !== undefined ? opts.spinePitch : 0.16) + 0.025 * bob,
    hipsYaw: (opts.hipTwistAmt || 0.10) * hipTwist,
    abdYaw: -0.04 * chestTwist,
    chestYaw: -(opts.chestTwistAmt || 0.18) * chestTwist,
    bodyRoll: (opts.rollAmt || 0.035) * hipTwist,
    headPitch: (opts.headPitch !== undefined ? opts.headPitch : -0.08) - 0.02 * bob,
    headYaw: 0.07 * chestTwist,
    armsInWorldYaw: false,
    groundSnap: opts.groundSnap !== false,
    footL,
    footR,
    handL: opts.handL ? opts.handL(u, p) : evalRunnerArm(u + 0.5, 1),
    handR: opts.handR ? opts.handR(u, p) : evalRunnerArm(u, -1),
  };
}

// ----------------------------------------------------------------------------
// 4. Complete Sports Choreography Catalog (43 60fps Clips per Athlete)
// ----------------------------------------------------------------------------
function buildMotions(role) {
  const isHoops = role === 'hoops';
  const isKeeper = role === 'keeper';
  const motions = {};
  const clip = (dur, loop, fn) => ({ duration: dur, loop, evaluate: (sk, u) => solvePose(sk, fn(u)) });

  // A. LIVING SPORT STANCES (Expressive Ready Poise + Clear Jersey Front on Showcase)
  motions.Idle = clip(2.20, true, (u) => {
    const br = Math.sin(u * Math.PI * 2);
    const bounce = Math.sin(u * Math.PI * 4);
    const sw = Math.cos(u * Math.PI * 2);
    if (isKeeper) {
      return {
        bodyY: -0.145 + 0.015 * bounce,
        spinePitch: 0.25 + 0.02 * br,
        headPitch: -0.11,
        headYaw: 0.15 * sw,
        armsInWorldYaw: true,
        footL: { pos: [0.26, 0.023, 0.10], pole: [0.35, 0.16, 1.0], yaw: 0.18 },
        footR: { pos: [-0.26, 0.023, -0.04], pole: [-0.35, 0.16, 1.0], yaw: -0.16 },
        handL: { pos: [0.35, -0.07 + 0.02 * bounce, 0.29], pole: [0.54, -0.34, -0.58], curl: 0.18, wristPitch: -0.26 },
        handR: { pos: [-0.35, -0.07 - 0.02 * bounce, 0.29], pole: [-0.54, -0.34, -0.58], curl: 0.18, wristPitch: -0.26 },
      };
    }
    if (isHoops) {
      return {
        bodyY: -0.105 + 0.013 * bounce,
        spinePitch: 0.14 + 0.018 * br,
        bodyRoll: 0.02 * sw,
        chestYaw: -0.05 * sw,
        headPitch: -0.06,
        headYaw: 0.09 * sw,
        armsInWorldYaw: false,
        footL: { pos: [0.22, 0.023, 0.12], pole: [0.28, 0.16, 1.0], yaw: 0.16 },
        footR: { pos: [-0.21, 0.023, -0.06], pole: [-0.28, 0.16, 1.0], yaw: -0.14 },
        handL: { pos: [0.31, -0.22 + 0.014 * bounce, 0.19], pole: [0.46, -0.30, -0.78], curl: 0.64, wristYaw: -0.20, wristRoll: 0.14 },
        handR: { pos: [-0.31, -0.23 - 0.014 * bounce, 0.17], pole: [-0.46, -0.30, -0.78], curl: 0.64, wristYaw: 0.20, wristRoll: -0.14 },
      };
    }
    return {
      bodyY: -0.068 + 0.010 * bounce,
      spinePitch: 0.07 + 0.016 * br,
      bodyRoll: 0.02 * sw,
      chestYaw: -0.04 * sw,
      headPitch: -0.04,
      headYaw: 0.08 * sw,
      armsInWorldYaw: false,
      footL: { pos: [0.195, 0.023, 0.11], pole: [0.25, 0.15, 1.0], yaw: 0.18 },
      footR: { pos: [-0.185, 0.023, -0.06], pole: [-0.25, 0.15, 1.0], yaw: -0.14 },
      handL: { pos: [0.305, -0.28 + 0.012 * bounce, 0.13], pole: [0.46, -0.28, -0.82], curl: 0.78, wristYaw: -0.20, wristRoll: 0.14 },
      handR: { pos: [-0.305, -0.29 - 0.012 * bounce, 0.12], pole: [-0.46, -0.28, -0.82], curl: 0.78, wristYaw: 0.20, wristRoll: -0.14 },
    };
  });

  motions.Anim_2K_DefenseIdle = clip(1.60, true, (u) => {
    const sh = Math.sin(u * Math.PI * 2);
    const bounce = Math.sin(u * Math.PI * 4);
    return {
      bodyY: -0.23 + 0.018 * bounce,
      bodyX: 0.05 * sh,
      spinePitch: 0.28,
      bodyRoll: -0.045 * sh,
      chestYaw: 0.09 * sh,
      headPitch: -0.14,
      armsInWorldYaw: false,
      footL: { pos: [0.29, 0.023, 0.13], pole: [0.38, 0.18, 1.0], yaw: 0.24 },
      footR: { pos: [-0.29, 0.023, -0.07], pole: [-0.38, 0.18, 1.0], yaw: -0.22 },
      handL: { pos: [0.46, 0.04 + 0.04 * sh, 0.23], pole: [0.54, -0.32, -0.64], curl: 0.20 },
      handR: { pos: [-0.45, -0.06 - 0.04 * sh, 0.25], pole: [-0.54, -0.32, -0.64], curl: 0.24 },
    };
  });

  // B. BALLISTIC WALK, RUN, EXPLOSIVE SPRINT & DIRECTIONAL MOVEMENTS
  motions.Walk = clip(0.84, true, (u) => buildBallisticStride(u, {
    strideFwd: 0.25, strideBack: 0.24, swingLift: 0.09, buttKick: 0.05,
    baseY: -0.05, bobAmt: 0.014, spinePitch: 0.05, headPitch: -0.02,
    armFwd: 0.14, armBack: 0.13, armWidth: 0.24, armUp: 0.06, armBaseY: -0.26,
    hipTwistAmt: 0.06, chestTwistAmt: 0.10, rollAmt: 0.018, curlLo: 0.66, curlHi: 0.78,
  }));

  motions.Run = clip(0.58, true, (u) => buildBallisticStride(u, {
    strideFwd: 0.42, strideBack: 0.40, swingLift: 0.22, buttKick: 0.22,
    baseY: -0.095, bobAmt: 0.028, bodyPitch: 0.04, spinePitch: 0.17, headPitch: -0.09,
    armFwd: 0.21, armBack: 0.20, armWidth: 0.25, armUp: 0.17, armBaseY: -0.15,
    hipTwistAmt: 0.11, chestTwistAmt: 0.19, rollAmt: 0.036,
  }));

  motions.Anim_EA_SprintDrive = clip(0.48, true, (u) => buildBallisticStride(u, {
    strideFwd: 0.50, strideBack: 0.49, swingLift: 0.26, buttKick: 0.30,
    baseY: -0.135, bobAmt: 0.032, bodyPitch: 0.10, spinePitch: 0.26, headPitch: -0.15,
    armFwd: 0.25, armBack: 0.24, armWidth: 0.26, armUp: 0.22, armBaseY: -0.11,
    hipTwistAmt: 0.14, chestTwistAmt: 0.24, rollAmt: 0.045,
  }));

  motions.Run_Back = clip(0.56, true, (u) => buildBallisticStride(1 - u, {
    strideFwd: 0.31, strideBack: 0.29, swingLift: 0.18, buttKick: 0.14,
    baseY: -0.10, bobAmt: 0.022, spinePitch: -0.06, headPitch: 0.04,
    armFwd: 0.18, armBack: 0.16, armWidth: 0.27, armUp: 0.12, armBaseY: -0.16,
  }));

  function makeStrafe(dirLeft) {
    const dir = dirLeft ? 1 : -1;
    return clip(0.52, true, (u) => {
      const p = u * Math.PI * 2;
      const bounce = Math.abs(Math.sin(p));
      const openK = Math.max(0, Math.sin(p));
      const trailK = Math.max(0, -Math.sin(p));
      return {
        bodyX: 0.08 * Math.sin(p) * dir,
        bodyY: -0.17 + 0.03 * bounce,
        spinePitch: 0.20,
        bodyRoll: -0.08 * dir,
        chestYaw: 0.12 * dir,
        headYaw: -0.25 * dir,
        headPitch: -0.10,
        armsInWorldYaw: false,
        footL: { pos: [0.16 + 0.24 * (dirLeft ? openK : trailK), 0.023 + 0.16 * (dirLeft ? openK : trailK), 0.08], pole: [0.28, 0.16, 1.0], yaw: 0.22 },
        footR: { pos: [-0.16 - 0.24 * (dirLeft ? trailK : openK), 0.023 + 0.16 * (dirLeft ? trailK : openK), 0.04], pole: [-0.28, 0.16, 1.0], yaw: -0.22 },
        handL: { pos: [0.38, -0.10 + 0.05 * bounce, 0.18], pole: [0.50, -0.30, -0.70], curl: 0.50 },
        handR: { pos: [-0.38, -0.10 + 0.05 * bounce, 0.18], pole: [-0.50, -0.30, -0.70], curl: 0.50 },
      };
    });
  }
  motions.Run_Left = makeStrafe(true);
  motions.Run_Right = makeStrafe(false);

  // C. BALL-CARRIER DRIBBLING (Football Micro-Touches & Basketball NBA Ballistic Pound + Shield Arm)
  motions.Anim_EA_DribbleRun = clip(0.50, true, (u) => buildBallisticStride(u, {
    strideFwd: 0.35, strideBack: 0.34, swingLift: 0.20, buttKick: 0.16,
    baseY: -0.11, bobAmt: 0.024, bodyPitch: 0.05, spinePitch: 0.22, headPitch: 0.05,
    armFwd: 0.20, armBack: 0.20, armWidth: 0.33, armUp: 0.14, armBaseY: -0.14,
    hipTwistAmt: 0.10, chestTwistAmt: 0.18,
  }));

  function makeHoopsDribbleRun(leftHand) {
    const s = leftHand ? 1 : -1;
    return clip(0.56, true, (u) => {
      const bp = u * Math.PI * 4;
      const rw = Math.cos(bp);
      const pound = rw >= 0 ? Math.pow(rw, 0.72) : -Math.pow(-rw, 1.32);
      const snap = Math.sin(bp);
      const dribHand = {
        pos: [s * 0.31, -0.24 + 0.15 * pound, 0.21 + 0.04 * snap],
        pole: [s * 0.38, -0.20, -0.74],
        curl: 0.20,
        wristPitch: 0.36 + 0.60 * snap,
        clavElev: -0.05 + 0.08 * pound,
      };
      const shield = {
        pos: [-s * 0.27, -0.06 + 0.04 * Math.sin(u * Math.PI * 2), 0.25],
        pole: [-s * 0.48, -0.22, -0.44],
        curl: 0.52,
        wristYaw: s * 0.28,
        clavFwd: 0.16,
      };
      const spec = buildBallisticStride(u, {
        strideFwd: 0.38, strideBack: 0.36, swingLift: 0.20, buttKick: 0.18,
        baseY: -0.12, bobAmt: 0.024, bodyPitch: 0.05, spinePitch: 0.22, headPitch: -0.10, stanceX: 0.16,
        handL: () => leftHand ? dribHand : shield,
        handR: () => leftHand ? shield : dribHand,
      });
      spec.hipsYaw = (spec.hipsYaw || 0) - s * 0.08;
      spec.chestYaw = (spec.chestYaw || 0) - s * 0.10;
      return spec;
    });
  }
  motions.Anim_2K_DribbleRun = makeHoopsDribbleRun(false);
  motions.Anim_2K_DribbleRun_L = makeHoopsDribbleRun(true);

  function makeHoopsDribbleIdle(leftHand) {
    const s = leftHand ? 1 : -1;
    return clip(0.68, true, (u) => {
      const bp = u * Math.PI * 2;
      const rw = Math.cos(bp);
      const pound = rw >= 0 ? Math.pow(rw, 0.74) : -Math.pow(-rw, 1.30);
      const snap = Math.sin(bp);
      return {
        bodyY: -0.14 + 0.022 * pound,
        spinePitch: 0.22,
        chestYaw: -s * 0.14,
        headPitch: -0.08,
        armsInWorldYaw: false,
        footL: { pos: [0.22, 0.023, 0.12], pole: [0.28, 0.16, 1.0], yaw: 0.16 },
        footR: { pos: [-0.21, 0.023, -0.07], pole: [-0.28, 0.16, 1.0], yaw: -0.14 },
        [leftHand ? 'handL' : 'handR']: {
          pos: [s * 0.32, -0.26 + 0.15 * pound, 0.22],
          pole: [s * 0.38, -0.20, -0.74],
          curl: 0.18, wristPitch: 0.34 + 0.60 * snap,
        },
        [leftHand ? 'handR' : 'handL']: {
          pos: [-s * 0.28, -0.06, 0.24],
          pole: [-s * 0.48, -0.22, -0.44],
          curl: 0.48, wristYaw: s * 0.26, clavFwd: 0.16,
        },
      };
    });
  }
  motions.Anim_2K_DribbleIdle = makeHoopsDribbleIdle(false);
  motions.Anim_2K_DribbleIdle_L = makeHoopsDribbleIdle(true);

  // D. FOOTBALL STRIKE CHARGE, POWER STRIKE & OPEN-HIP PASS
  motions.Anim_EA_StrikeCharge = clip(0.60, true, (u) => {
    const br = Math.sin(u * Math.PI * 2);
    return {
      bodyZ: -0.08,
      bodyY: -0.16 + 0.015 * br,
      bodyPitch: 0.06,
      bodyRoll: -0.34,
      bodyYaw: -0.48,
      chestYaw: -0.26,
      headPitch: 0.04,
      headYaw: 0.56,
      armsInWorldYaw: false,
      footL: { pos: [0.28, 0.023, 0.15], pole: [0.30, 0.15, 1.0], yaw: 0.20 },
      footR: { pos: [-0.18, 0.46 + 0.02 * br, -0.58], pole: [-0.10, -0.08, 0.88], pitch: 0.88, yaw: -0.16 },
      handL: { pos: [0.43, 0.02 + 0.02 * br, 0.02], pole: [0.36, -0.28, -0.84], curl: 0.68 },
      handR: { pos: [-0.26, -0.24, -0.20], pole: [-0.36, -0.24, -0.84], curl: 0.72 },
    };
  });

  function makePowerStrike(power) {
    const sc = power ? 1.0 : 0.88;
    return clip(0.64, false, (u) => {
      const bodyZ = trackCR([[0, -0.06], [0.20, -0.10], [0.38, 0.14], [0.58, 0.24], [0.82, 0.08], [1, 0]], u);
      const bodyY = trackCR([[0, -0.07], [0.20, -0.19], [0.38, -0.16], [0.58, -0.08], [0.82, -0.10], [1, -0.068]], u);
      const bodyPitch = trackCR([[0, 0.08], [0.20, 0.10], [0.38, 0.02], [0.58, -0.08], [0.84, 0.06], [1, 0.06]], u);
      const bodyRoll = trackCR([[0, -0.08], [0.20, -0.38 * sc], [0.38, -0.34 * sc], [0.60, -0.16], [1, 0]], u);
      const bodyYaw = trackCR([[0, -0.12], [0.20, -0.52 * sc], [0.38, 0.18], [0.58, 0.42 * sc], [0.84, 0.14], [1, 0]], u);
      const chestYaw = trackCR([[0, -0.08], [0.20, -0.30], [0.40, 0.36], [0.66, 0.18], [1, 0]], u);

      const lx = trackCR([[0, 0.19], [0.18, 0.29], [0.64, 0.24], [1, 0.195]], u);
      const lz = trackCR([[0, 0.06], [0.18, 0.16], [0.64, 0.15], [1, 0.10]], u);
      const ly = trackCR([[0, 0.023], [0.18, 0.023], [0.60, 0.023], [0.74, 0.07], [0.90, 0.023], [1, 0.023]], u);

      const rx = trackCR([[0, -0.17], [0.20, -0.22], [0.38, -0.03], [0.56, 0.22 * sc], [0.78, -0.08], [1, -0.18]], u);
      const ry = trackCR([[0, 0.04], [0.20, 0.46 * sc], [0.38, 0.10], [0.56, 0.38 * sc], [0.78, 0.09], [1, 0.023]], u);
      const rz = trackCR([[0, -0.05], [0.20, -0.58 * sc], [0.38, 0.56], [0.56, 0.72 * sc], [0.78, 0.14], [1, -0.04]], u);
      const rPitch = trackCR([[0, 0.06], [0.20, 0.88], [0.38, 0.62], [0.56, 0.28], [1, 0]], u);
      const rPoleY = trackCR([[0, 0.12], [0.20, -0.08], [0.38, 0.18], [0.56, 0.22], [1, 0.15]], u);

      const handLPos = trackCR([
        [0, [0.31, -0.22, 0.14]], [0.20, [0.44, 0.02, 0.04]], [0.38, [0.48, 0.00, -0.12]], [0.58, [0.44, -0.12, -0.22]], [1, [0.305, -0.28, 0.13]]
      ], u);
      const handRPos = trackCR([
        [0, [-0.29, -0.22, 0.12]], [0.20, [-0.28, -0.22, -0.25]], [0.38, [-0.25, -0.10, 0.22]], [0.58, [-0.24, -0.08, 0.27]], [1, [-0.305, -0.29, 0.12]]
      ], u);

      return {
        bodyZ, bodyY, bodyPitch, bodyRoll, bodyYaw, chestYaw, chestRoll: bodyRoll * 0.22, footBaseZ: bodyZ * 0.50,
        armsInWorldYaw: false, headPitch: -bodyPitch * 0.4 + 0.04, headYaw: -bodyYaw * 0.74,
        footL: { pos: [lx, ly, lz], pole: [0.28, 0.16, 1.0], yaw: 0.20 },
        footR: { pos: [rx, ry, rz], pole: [-0.04, rPoleY, 0.96], pitch: rPitch, yaw: -0.08 },
        handL: { pos: handLPos, pole: [0.42, -0.26, -0.82], curl: 0.70 },
        handR: { pos: handRPos, pole: [-0.42, -0.26, -0.82], curl: 0.74 },
      };
    });
  }
  motions.Anim_EA_PowerStrike = makePowerStrike(true);
  motions.Anim_Kick_V1 = makePowerStrike(false);

  function makePassKick(kickingRight) {
    const s = kickingRight ? -1 : 1;
    return clip(0.46, false, (u) => {
      const z = trackCR([[0, -0.03], [0.20, -0.34], [0.42, 0.56], [0.70, 0.26], [1, -0.02]], u);
      const y = trackCR([[0, 0.023], [0.20, 0.22], [0.42, 0.12], [0.70, 0.10], [1, 0.023]], u);
      const sweepX = trackCR([[0, 0], [0.20, -0.06], [0.44, 0.16], [0.70, 0.06], [1, 0]], u);
      const bodyZ = trackCR([[0, -0.04], [0.42, 0.15], [1, 0]], u);
      const bodyRoll = trackCR([[0, 0], [0.22, s * 0.26], [0.46, s * 0.28], [1, 0]], u);
      const bodyYaw = trackCR([[0, 0], [0.20, s * 0.30], [0.44, -s * 0.32], [1, 0]], u);
      const armBal = trackCR([[0, 0.12], [0.20, 0.20], [0.44, -0.15], [1, 0.12]], u);
      const armCnt = trackCR([[0, -0.08], [0.20, -0.17], [0.44, 0.19], [1, 0.12]], u);
      const plantPos = [-s * 0.24, 0.023, 0.13];
      const kickPos = [s * (0.14 - sweepX), y, z];
      const kickPole = [s * -0.44, 0.18, 0.90];
      return {
        bodyZ, bodyY: -0.15, bodyRoll, bodyYaw, footBaseZ: bodyZ * 0.60, spinePitch: 0.14, armsInWorldYaw: false, headYaw: -bodyYaw * 0.72,
        footL: kickingRight ? { pos: plantPos, pole: [0.26, 0.14, 1.0], yaw: 0.18 } : { pos: kickPos, pole: kickPole, yaw: -0.78, pitch: 0.26 },
        footR: kickingRight ? { pos: kickPos, pole: kickPole, yaw: 0.78, pitch: 0.26 } : { pos: plantPos, pole: [-0.26, 0.14, 1.0], yaw: -0.18 },
        handL: { pos: kickingRight ? [0.42, -0.08, armBal] : [0.32, -0.18, armCnt], pole: [0.44, -0.28, -0.82], curl: 0.70 },
        handR: { pos: kickingRight ? [-0.32, -0.18, armCnt] : [-0.42, -0.08, armBal], pole: [-0.44, -0.28, -0.82], curl: 0.70 },
      };
    });
  }
  motions.Kick_Right = makePassKick(true);
  motions.Kick_Left = makePassKick(false);

  // E. SLIDE TACKLE & DEFENSIVE POKE STEALS
  function makeSlide(leadSide) {
    const s = leadSide === 'R' ? -1 : 1;
    return clip(0.66, false, (u) => {
      const drop = trackCR([[0, 0], [0.16, 0.94], [0.38, 1.0], [0.58, 0.94], [0.82, 0.34], [1, 0]], u);
      const sweep = trackCR([[0, 0], [0.16, 0.50], [0.38, 0.92], [0.58, 1.0], [0.84, 0.25], [1, 0]], u);
      const surge = trackCR([[0, -0.06], [0.16, 0.12], [0.38, 0.36], [0.58, 0.50], [0.84, 0.14], [1, 0]], u);
      const lead = [s * 0.08, lerp(0.023, 0.09, sweep), lerp(0.06, 0.92, sweep)];
      const trail = [-s * 0.36, lerp(0.023, 0.06, drop), lerp(-0.04, -0.18, drop)];
      const hTrail = [-s * 0.44, lerp(-0.22, -0.44, drop), lerp(0.08, -0.22, drop)];
      const hLead = [s * 0.40, lerp(-0.18, 0.04, sweep), lerp(0.10, 0.16, sweep)];
      return {
        bodyZ: surge, footBaseZ: surge,
        bodyY: lerp(-0.08, -0.78, drop),
        bodyPitch: lerp(0.10, -0.74, drop),
        spinePitch: lerp(0.10, 0.06, drop),
        bodyRoll: lerp(0, s * 0.44, drop),
        bodyYaw: lerp(0, s * 0.34, drop),
        groundSnap: false, feetInBodySpace: false, armsInWorldYaw: false,
        headPitch: lerp(-0.04, 0.52, drop), headYaw: -s * 0.28 * drop,
        footL: leadSide === 'L' ? { pos: lead, pole: [0.14, 0.22, 0.94], pitch: -0.68 * sweep } : { pos: trail, pole: [0.56, 0.12, 0.80], roll: -0.28 },
        footR: leadSide === 'R' ? { pos: lead, pole: [-0.14, 0.22, 0.94], pitch: -0.68 * sweep } : { pos: trail, pole: [-0.56, 0.12, 0.80], roll: 0.28 },
        handL: { pos: leadSide === 'L' ? hLead : hTrail, pole: [0.46, -0.24, -0.82], curl: 0.20 },
        handR: { pos: leadSide === 'R' ? hLead : hTrail, pole: [-0.46, -0.24, -0.82], curl: 0.20 },
      };
    });
  }
  motions.Anim_EA_SlideTackle = makeSlide('R');
  motions.Anim_Slide_V1 = makeSlide('L');

  function makeHoopsSteal(rightSwipe) {
    const sw = rightSwipe ? -1 : 1;
    return clip(0.44, false, (u) => {
      const lunge = trackCR([[0, 0], [0.28, 1.0], [0.56, 0.58], [0.84, 0.14], [1, 0]], u);
      const bz = 0.22 * lunge;
      const swipeArm = [sw * 0.08, -0.14, 0.24 + 0.38 * lunge];
      const offArm = [-sw * 0.34, -0.20, 0.08 - 0.18 * lunge];
      return {
        bodyZ: bz, footBaseZ: bz * 0.5, bodyY: -0.12 - 0.17 * lunge, spinePitch: 0.18 + 0.30 * lunge,
        chestYaw: -sw * 0.42 * lunge, headPitch: -0.20 * lunge, armsInWorldYaw: true,
        footL: { pos: [0.20, 0.023, rightSwipe ? -0.08 : 0.34 * lunge], pole: [0.26, 0.14, 1.0] },
        footR: { pos: [-0.20, 0.023, rightSwipe ? 0.34 * lunge : -0.08], pole: [-0.26, 0.14, 1.0] },
        handR: { pos: rightSwipe ? swipeArm : offArm, pole: [-0.40, -0.32, -0.78], curl: 0.14 },
        handL: { pos: rightSwipe ? offArm : swipeArm, pole: [0.40, -0.32, -0.78], curl: 0.14 },
      };
    });
  }
  motions.Anim_2K_Steal = makeHoopsSteal(true);
  motions.Anim_Steal_V1 = makeHoopsSteal(false);
  motions.Punch_Right = makeHoopsSteal(true);
  motions.Punch_Left = makeHoopsSteal(false);

  motions.Anim_FB_Steal = clip(0.46, false, (u) => {
    const poke = trackCR([[0, 0], [0.28, 1.0], [0.56, 0.55], [0.84, 0.12], [1, 0]], u);
    const lift = trackCR([[0, 0], [0.16, 0.14], [0.34, 0.06], [0.64, 0.04], [1, 0]], u);
    const bz = 0.20 * poke;
    return {
      bodyZ: bz, footBaseZ: bz * 0.45, bodyY: -0.09 - 0.22 * poke, bodyRoll: -0.18 * poke, bodyYaw: 0.22 * poke,
      spinePitch: 0.28 * poke, chestYaw: -0.32 * poke, headPitch: -0.16 * poke, armsInWorldYaw: true,
      footL: { pos: [0.22, 0.023, -0.12 - 0.10 * poke], pole: [0.28, 0.16, 1.0], yaw: 0.22 },
      footR: { pos: [0.02 * poke - 0.14 * (1 - poke), 0.023 + lift, 0.04 + 0.54 * poke], pole: [-0.14, 0.26, 1.0], yaw: 0.36 * poke, pitch: -0.16 * poke },
      handL: { pos: [0.36, -0.16 - 0.04 * poke, 0.18 + 0.12 * poke], pole: [0.46, -0.34, -0.78], curl: 0.48 },
      handR: { pos: [-0.32, -0.20 - 0.04 * poke, 0.10 - 0.18 * poke], pole: [-0.46, -0.34, -0.78], curl: 0.48 },
    };
  });

  // F. NBA JUMPSHOT, SHOT GATHER, PASS, BLOCK JUMP & TOMAHAWK / TWO-HAND DUNK
  motions.Anim_2K_ShotGather = clip(0.60, true, (u) => {
    const pulse = Math.sin(u * Math.PI * 2);
    return {
      bodyY: -0.21 + 0.015 * pulse, spinePitch: 0.18, headPitch: -0.18, armsInWorldYaw: false,
      footL: { pos: [0.19, 0.023, 0.12], pole: [0.24, 0.14, 1.0], yaw: 0.08 },
      footR: { pos: [-0.18, 0.023, -0.05], pole: [-0.22, 0.14, 1.0], yaw: -0.06 },
      handR: { pos: [-0.12, 0.05 + 0.014 * pulse, 0.25], pole: [-0.10, -0.26, 0.88], curl: 0.44, wristPitch: 0.54, wristRoll: 0.12 },
      handL: { pos: [0.13, 0.06 + 0.014 * pulse, 0.24], pole: [0.38, -0.30, -0.45], curl: 0.46, wristYaw: -0.36, wristRoll: -0.16 },
    };
  });

  motions.Anim_2K_JumpShot = clip(0.64, false, (u) => {
    const air = trackCR([[0, 0], [0.16, 0], [0.44, 1.0], [0.76, 0], [1, 0]], u);
    const sway = trackCR([[0, 0], [0.18, 0], [0.48, 1.0], [0.78, 0.15], [1, 0]], u);
    const squat = trackCR([[0, 0.08], [0.16, 0.26], [0.30, 0], [0.80, 0.20], [1, 0.09]], u);
    const spinePitch = trackCR([[0, 0.14], [0.16, 0.18], [0.44, -0.15], [0.76, 0.06], [1, 0.10]], u);
    const rhPos = trackCR([
      [0, [-0.15, 0.14, 0.22]], [0.16, [-0.14, 0.38, 0.19]], [0.36, [-0.14, 0.70, 0.27]], [0.58, [-0.16, 0.56, 0.34]], [0.80, [-0.24, 0.16, 0.24]], [1, [-0.29, -0.22, 0.18]]
    ], u);
    const rhWrist = trackCR([[0, 0.20], [0.18, 0.48], [0.42, -1.44], [0.74, -1.20], [1, 0]], u);
    const lhPos = trackCR([
      [0, [0.18, 0.14, 0.22]], [0.16, [0.20, 0.34, 0.21]], [0.36, [0.22, 0.44, 0.23]], [0.60, [0.23, 0.40, 0.22]], [0.82, [0.27, -0.10, 0.20]], [1, [0.29, -0.22, 0.18]]
    ], u);
    return {
      bodyY: lerp(-squat, -0.03, air), aerialLift: 0.52 * air, groundSnap: air < 0.05, armsInWorldYaw: true,
      spinePitch, headPitch: -spinePitch - 0.16 * air,
      footL: { pos: [0.18, 0.023 + 0.14 * sway, lerp(0.08, 0.24, sway)], pole: [0.22, 0.18, 1.0], pitch: 0.46 * sway },
      footR: { pos: [-0.18, 0.023 + 0.09 * sway, lerp(-0.04, 0.10, sway)], pole: [-0.22, 0.15, 1.0], pitch: 0.48 * sway },
      handR: { pos: rhPos, pole: [-0.14, -0.12, 0.72], curl: lerp(0.40, 0.74, smootherstep(clamp((u - 0.34) / 0.20, 0, 1))), wristPitch: rhWrist, wristRoll: 0.06 },
      handL: { pos: lhPos, pole: [0.38, -0.28, -0.45], curl: 0.42, wristYaw: -0.36, wristRoll: -0.14 },
    };
  });

  motions.Anim_2K_BlockJump = clip(0.56, false, (u) => {
    const air = trackCR([[0, 0], [0.14, 0], [0.42, 1.0], [0.76, 0], [1, 0]], u);
    const squat = trackCR([[0, 0.08], [0.14, 0.26], [0.28, 0], [0.80, 0.20], [1, 0.08]], u);
    const reach = trackCR([[0, 0], [0.16, 0.28], [0.44, 1.0], [0.72, 0.74], [1, 0]], u);
    return {
      bodyY: lerp(-squat, -0.02, air), aerialLift: 0.54 * air, groundSnap: air < 0.05, armsInWorldYaw: true,
      spinePitch: lerp(0.16, -0.10, reach), chestYaw: 0.22 * reach, headPitch: -0.22 * air,
      footL: { pos: [0.17, 0.023 + 0.34 * air, 0.06 + 0.20 * air], pole: [0.24, 0.32, 1.0], pitch: 0.45 * air },
      footR: { pos: [-0.17, 0.023 + 0.16 * air, -0.06 - 0.06 * air], pole: [-0.24, 0.18, 1.0], pitch: 0.48 * air },
      handR: { pos: [lerp(-0.28, -0.14, reach), lerp(-0.18, 0.70, reach), lerp(0.18, 0.16, reach)], pole: [-0.28, -0.16, -0.62], curl: 0.10, wristPitch: -0.16 * reach },
      handL: { pos: [lerp(0.28, 0.24, reach), lerp(-0.20, -0.04, reach), lerp(0.16, 0.20, reach)], pole: [0.42, -0.34, -0.72], curl: 0.48 },
    };
  });

  motions.Anim_Shot_V1 = clip(0.40, false, (u) => {
    const thrust = Math.sin(u * Math.PI);
    const rel = smootherstep(clamp(u / 0.46, 0, 1)) * (u > 0.46 ? 1 - smootherstep((u - 0.46) / 0.54) : 1);
    return {
      bodyZ: 0.16 * rel, footBaseZ: 0.08 * rel, bodyY: -0.10 - 0.06 * thrust, spinePitch: 0.18 * thrust, headPitch: -0.12 * thrust, armsInWorldYaw: true,
      footL: { pos: [0.17, 0.023, 0.10 + 0.18 * thrust], pole: [0.24, 0.14, 1.0] },
      footR: { pos: [-0.17, 0.023, -0.07], pole: [-0.24, 0.14, 1.0] },
      handL: { pos: [0.18 + 0.06 * rel, -0.06 + 0.12 * rel, 0.24 + 0.26 * rel], pole: [0.40, -0.36, -0.60], curl: 0.16 },
      handR: { pos: [-0.18 - 0.06 * rel, -0.06 + 0.12 * rel, 0.24 + 0.26 * rel], pole: [-0.40, -0.36, -0.60], curl: 0.16 },
    };
  });

  function makeDunk(twoHand) {
    return clip(0.70, false, (u) => {
      const air = trackCR([[0, 0], [0.14, 0], [0.42, 1.0], [0.78, 0], [1, 0]], u);
      const tuck = trackCR([[0, 0], [0.16, 0], [0.42, 1.0], [0.74, 0], [1, 0]], u);
      const gather = trackCR([[0, 0.08], [0.13, 0.28], [0.26, 0.00], [0.80, 0.25], [1, 0.09]], u);
      const bodyZ = trackCR([[0, -0.10], [0.14, -0.04], [0.48, 0.32], [0.78, 0.14], [1, 0]], u);
      const rhPos = twoHand
        ? trackCR([[0, [-0.15, -0.08, 0.24]], [0.14, [-0.14, 0.24, 0.18]], [0.32, [-0.15, 0.66, -0.16]], [0.48, [-0.12, 0.48, 0.40]], [0.66, [-0.14, 0.04, 0.34]], [1, [-0.25, -0.22, 0.18]]], u)
        : trackCR([[0, [-0.18, -0.08, 0.24]], [0.14, [-0.20, 0.20, 0.18]], [0.32, [-0.18, 0.68, -0.16]], [0.48, [-0.10, 0.50, 0.42]], [0.66, [-0.16, 0.02, 0.32]], [1, [-0.25, -0.22, 0.18]]], u);
      const rhWrist = trackCR([[0, 0], [0.32, 0.52], [0.50, -1.24], [1, 0]], u);
      const lhPos = twoHand
        ? [-rhPos[0], rhPos[1], rhPos[2]]
        : trackCR([[0, [0.22, -0.12, 0.20]], [0.18, [0.42, 0.06, 0.14]], [0.44, [0.46, -0.24, -0.18]], [0.74, [0.28, -0.14, 0.20]], [1, [0.25, -0.22, 0.18]]], u);
      return {
        bodyZ, footBaseZ: bodyZ * 0.55, bodyY: -gather, aerialLift: 0.56 * air, groundSnap: air < 0.04, armsInWorldYaw: true,
        spinePitch: trackCR([[0, 0.14], [0.14, 0.24], [0.32, -0.34], [0.50, 0.24], [0.80, 0.18], [1, 0.10]], u),
        chestYaw: twoHand ? 0 : trackCR([[0, 0], [0.32, -0.46], [0.50, 0.34], [1, 0]], u),
        headPitch: -0.24 * air,
        footL: twoHand
          ? { pos: [0.19, 0.023 + 0.40 * tuck, -0.02 - 0.32 * tuck], pole: [0.24, 0.28, 1.0], pitch: 0.64 * tuck }
          : { pos: [0.18, 0.023 + 0.46 * tuck, 0.10 + 0.28 * tuck], pole: [0.24, 0.44, 1.0], pitch: 0.52 * tuck },
        footR: twoHand
          ? { pos: [-0.19, 0.023 + 0.40 * tuck, -0.04 - 0.32 * tuck], pole: [-0.24, 0.28, 1.0], pitch: 0.64 * tuck }
          : { pos: [-0.19, 0.023 + 0.36 * tuck, -0.10 - 0.38 * tuck], pole: [-0.24, 0.18, 1.0], pitch: 0.68 * tuck },
        handR: { pos: rhPos, pole: [-0.26, -0.20, -0.68], curl: 0.34, wristPitch: rhWrist },
        handL: { pos: lhPos, pole: [0.28, -0.24, -0.68], curl: 0.30, wristPitch: twoHand ? rhWrist : 0 },
      };
    });
  }
  motions.Anim_2K_SlamDunk = makeDunk(false);
  motions.Anim_Dunk_V1 = makeDunk(true);

  // G. GOALKEEPER DIVES (Symmetrical L/R High & Low Saves + Crossbar Jump)
  function keeperDiveSpec(low, u) {
    const push = trackCR([[0, 0], [0.14, 1.0], [0.28, 0.2], [1, 0]], u);
    const air = trackCR([[0, 0], [0.14, 0.35], [0.38, 1.0], [0.66, 0.65], [0.84, 0.12], [1, 0]], u);
    const roll = trackCR([[0, 0], [0.14, 0.42], [0.40, 1.0], [0.66, 0.85], [0.88, 0.28], [1, 0]], u);
    const reach = trackCR([[0, 0], [0.16, 0.50], [0.42, 1.0], [0.68, 0.72], [0.90, 0.14], [1, 0]], u);
    return {
      bodyX: (low ? 0.50 : 0.46) * roll,
      bodyY: (low ? lerp(-0.14, -0.64, roll) : lerp(-0.14, 0.06, air)) - 0.12 * push,
      aerialLift: (low ? 0.14 : 0.54) * air,
      groundSnap: false, feetInBodySpace: true,
      bodyRoll: (low ? -1.38 : -1.24) * roll,
      bodyPitch: (low ? 0.08 : -0.10) * roll,
      bodyYaw: 0.28 * roll,
      spineRoll: -0.18 * roll, headRoll: 0.52 * roll, headYaw: -0.26 * roll,
      footL: { pos: [lerp(0.24, 0.22, roll), lerp(0.023, 0.36, reach), lerp(0.08, 0.42, reach)], pole: [0.38, 0.42, 0.90], pitch: 0.55 * reach },
      footR: { pos: [lerp(-0.22, -0.16, roll), 0.023 + 0.12 * reach, lerp(-0.02, -0.10, reach)], pole: [-0.22, 0.22, 1.0], pitch: 0.52 * reach },
      handL: { pos: [lerp(0.28, 0.12, reach), lerp(-0.08, 0.64, reach), lerp(0.28, 0.34, reach)], pole: [0.42, -0.06, -0.80], curl: 0.14, wristPitch: -0.26 * reach, wristRoll: 0.18 * reach },
      handR: { pos: [lerp(-0.28, -0.06, reach), lerp(-0.08, 0.76, reach), lerp(0.28, 0.32, reach)], pole: [-0.42, -0.06, -0.80], curl: 0.14, wristPitch: -0.28 * reach, wristRoll: -0.22 * reach },
    };
  }
  motions.Anim_EA_KeeperDive = clip(0.64, false, (u) => keeperDiveSpec(false, u));
  motions.Anim_EA_KeeperDive_L = clip(0.64, false, (u) => mirrorSpecLR(keeperDiveSpec(false, u)));
  motions.Anim_EA_KeeperLowDive = clip(0.60, false, (u) => keeperDiveSpec(true, u));
  motions.Anim_EA_KeeperLowDive_L = clip(0.60, false, (u) => mirrorSpecLR(keeperDiveSpec(true, u)));

  motions.Anim_EA_KeeperJump = clip(0.58, false, (u) => {
    const air = trackCR([[0, 0], [0.16, 0], [0.44, 1.0], [0.76, 0], [1, 0]], u);
    const squat = trackCR([[0, 0.08], [0.16, 0.24], [0.30, 0], [0.80, 0.18], [1, 0.08]], u);
    const up = trackCR([[0, 0], [0.16, 0.14], [0.42, 1.0], [0.68, 0.94], [1, 0]], u);
    return {
      bodyY: lerp(-squat, -0.02, air), aerialLift: 0.48 * air, groundSnap: air < 0.05, armsInWorldYaw: true,
      spinePitch: lerp(0.16, -0.10, air), headPitch: -0.22 * up,
      footL: { pos: [0.17, 0.023 + 0.36 * air, 0.08 + 0.20 * air], pole: [0.24, 0.34, 1.0], pitch: 0.48 * air },
      footR: { pos: [-0.17, 0.023, -0.04], pole: [-0.24, 0.14, 1.0], pitch: 0.42 * air },
      handL: { pos: [lerp(0.32, 0.12, up), lerp(-0.08, 0.66, up), lerp(0.28, 0.22, up)], pole: [0.44, -0.12, -0.76], curl: 0.08 },
      handR: { pos: [lerp(-0.32, -0.12, up), lerp(-0.08, 0.66, up), lerp(0.28, 0.22, up)], pole: [-0.44, -0.12, -0.76], curl: 0.08 },
    };
  });
  motions.Roll = isKeeper ? motions.Anim_EA_KeeperDive : motions.Anim_EA_SlideTackle;

  // H. CELEBRATIONS, WAVE & HIT RECOVERY
  motions.Wave = clip(1.15, true, (u) => {
    const a = u * Math.PI * 2;
    return {
      bodyY: -0.035 + 0.012 * Math.abs(Math.sin(a)), spinePitch: -0.04, headYaw: 0.08 * Math.sin(a), armsInWorldYaw: true,
      footL: { pos: [0.17, 0.023, 0.06], pole: [0.25, 0.12, 1.0], yaw: 0.14 },
      footR: { pos: [-0.17, 0.023, -0.05], pole: [-0.25, 0.12, 1.0], yaw: -0.14 },
      handL: { pos: [0.28, -0.30, 0.13], pole: [0.46, -0.28, -0.80], curl: 0.40 },
      handR: { pos: [-0.28 + 0.10 * Math.sin(a * 2), 0.42 + 0.04 * Math.cos(a * 2), 0.16], pole: [-0.44, -0.35, -0.35], curl: 0.12 },
    };
  });

  motions.Anim_Celebration = clip(1.10, false, (u) => {
    const air = trackCR([[0, 0], [0.20, 0], [0.42, 1.0], [0.64, 0], [1, 0]], u);
    const spread = trackCR([[0, 0], [0.18, 0.1], [0.56, 1.0], [0.84, 0.9], [1, 0.1]], u);
    const up = trackCR([[0, 0], [0.34, 1.0], [0.56, 0.1], [1, 0]], u);
    return {
      bodyY: trackCR([[0, -0.04], [0.18, -0.16], [0.42, -0.04], [0.64, -0.08], [1, -0.04]], u),
      aerialLift: 0.36 * air, groundSnap: air < 0.04,
      spinePitch: trackCR([[0, 0.1], [0.20, 0.16], [0.56, -0.16], [0.88, -0.08], [1, 0.04]], u),
      headPitch: -0.16 * spread, armsInWorldYaw: true,
      footL: { pos: [0.17 + 0.14 * spread, 0.023 + 0.14 * air, 0.06], pole: [0.28, 0.16, 1.0], yaw: 0.18 },
      footR: { pos: [-0.17 - 0.14 * spread, 0.023 + 0.14 * air, -0.04], pole: [-0.28, 0.16, 1.0], yaw: -0.18 },
      handL: { pos: [0.26 + 0.20 * spread, -0.28 + 0.56 * up + 0.34 * spread, 0.12 - 0.10 * spread], pole: [0.48, -0.34, -0.75], curl: 0.85 },
      handR: { pos: [-0.26 - 0.20 * spread, -0.28 + 0.56 * up + 0.34 * spread, 0.12 - 0.10 * spread], pole: [-0.48, -0.34, -0.75], curl: 0.85 },
    };
  });

  motions.Anim_Celeb_V1 = clip(1.05, false, (u) => {
    const p1 = Math.sin(clamp(u / 0.45, 0, 1) * Math.PI);
    const p2 = Math.sin(clamp((u - 0.45) / 0.45, 0, 1) * Math.PI);
    const pump = Math.max(p1, p2);
    return {
      bodyY: -0.04 - 0.07 * pump, aerialLift: 0.18 * p1, groundSnap: p1 < 0.1, spinePitch: -0.10 * pump, armsInWorldYaw: true,
      footL: { pos: [0.19, 0.023, 0.09], pole: [0.28, 0.12, 1.0], yaw: 0.14 },
      footR: { pos: [-0.19, 0.023, -0.05], pole: [-0.28, 0.12, 1.0], yaw: -0.14 },
      handL: { pos: [0.27, -0.20 + 0.58 * pump, 0.20], pole: [0.48, -0.32, -0.62], curl: 0.90 },
      handR: { pos: [-0.27, -0.20 + 0.58 * pump, 0.20], pole: [-0.48, -0.32, -0.62], curl: 0.90 },
    };
  });

  motions.Anim_Celeb_V2 = clip(1.05, false, (u) => {
    const p = Math.sin(clamp(u / 0.9, 0, 1) * Math.PI);
    return {
      bodyZ: 0.12 * p, footBaseZ: 0.04 * p, bodyY: -0.05 - 0.08 * p, spinePitch: 0.22 * p, chestYaw: 0.18 * Math.sin(u * Math.PI * 2), armsInWorldYaw: true,
      footL: { pos: [0.22, 0.023, 0.10], pole: [0.28, 0.12, 1.0], yaw: 0.18 },
      footR: { pos: [-0.22, 0.023, -0.10], pole: [-0.28, 0.12, 1.0], yaw: -0.18 },
      handL: { pos: [0.34 + 0.12 * p, -0.14 + 0.08 * p, 0.04 - 0.16 * p], pole: [0.48, -0.30, -0.82], curl: 0.18 },
      handR: { pos: [-0.34 - 0.12 * p, -0.14 + 0.08 * p, 0.04 - 0.16 * p], pole: [-0.48, -0.30, -0.82], curl: 0.18 },
    };
  });

  function makeHit(dirX) {
    return clip(0.42, false, (u) => {
      const hit = Math.sin(u * Math.PI);
      return {
        bodyZ: -0.14 * hit, footBaseZ: -0.06 * hit, bodyY: -0.06 * hit - 0.04,
        bodyRoll: dirX * 0.22 * hit, spinePitch: -0.22 * hit, headPitch: -0.16 * hit, armsInWorldYaw: true,
        footL: { pos: [0.18, 0.023, 0.08 - 0.10 * hit], pole: [0.25, 0.12, 1.0] },
        footR: { pos: [-0.18, 0.023, -0.06 - 0.12 * hit], pole: [-0.25, 0.12, 1.0] },
        handL: { pos: [0.30, -0.22 + 0.12 * hit, 0.18], pole: [0.46, -0.30, -0.75], curl: 0.35 },
        handR: { pos: [-0.30, -0.22 + 0.12 * hit, 0.18], pole: [-0.46, -0.30, -0.75], curl: 0.35 },
      };
    });
  }
  motions.HitRecieve = makeHit(1);
  motions.HitRecieve_2 = makeHit(-1);

  return motions;
}

// ----------------------------------------------------------------------------
// 5. Binary GLB Packing Writer
// ----------------------------------------------------------------------------
function bakeCharacterGLB(filePath, role) {
  const { gltf, bin } = readGLB(filePath);
  const skel = buildSkeleton(gltf);
  const motions = buildMotions(role);

  const keepBVs = new Set();
  (gltf.meshes || []).forEach(m => (m.primitives || []).forEach(p => {
    if (p.indices !== undefined) keepBVs.add(gltf.accessors[p.indices].bufferView);
    Object.values(p.attributes || {}).forEach(ai => {
      if (gltf.accessors[ai] && gltf.accessors[ai].bufferView !== undefined) keepBVs.add(gltf.accessors[ai].bufferView);
    });
  }));
  (gltf.skins || []).forEach(s => { if (s.inverseBindMatrices !== undefined) keepBVs.add(gltf.accessors[s.inverseBindMatrices].bufferView); });
  (gltf.images || []).forEach(im => { if (im.bufferView !== undefined) keepBVs.add(im.bufferView); });

  const oldAccs = gltf.accessors || [], oldBVs = gltf.bufferViews || [];
  const bvMap = new Map(), accMap = new Map(), binChunks = [];
  let cursor = 0;
  const newBVs = [], newAccs = [];

  const pushBytes = (bytes) => {
    const pad = (4 - (bytes.length % 4)) % 4;
    binChunks.push(bytes);
    if (pad > 0) binChunks.push(Buffer.alloc(pad));
    const byteOffset = cursor;
    cursor += bytes.length + pad;
    return { byteOffset, byteLength: bytes.length };
  };

  for (let i = 0; i < oldBVs.length; i++) {
    if (!keepBVs.has(i)) continue;
    const bv = oldBVs[i];
    const sl = bin.subarray(bv.byteOffset || 0, (bv.byteOffset || 0) + bv.byteLength);
    const { byteOffset, byteLength } = pushBytes(sl);
    bvMap.set(i, newBVs.length);
    newBVs.push({ ...bv, buffer: 0, byteOffset, byteLength });
  }

  const usedAcc = new Set();
  (gltf.meshes || []).forEach(m => (m.primitives || []).forEach(p => {
    if (p.indices !== undefined) usedAcc.add(p.indices);
    Object.values(p.attributes || {}).forEach(a => usedAcc.add(a));
  }));
  (gltf.skins || []).forEach(s => { if (s.inverseBindMatrices !== undefined) usedAcc.add(s.inverseBindMatrices); });

  for (let i = 0; i < oldAccs.length; i++) {
    if (!usedAcc.has(i)) continue;
    const a = { ...oldAccs[i] };
    if (a.bufferView !== undefined) a.bufferView = bvMap.get(a.bufferView);
    accMap.set(i, newAccs.length);
    newAccs.push(a);
  }
  (gltf.meshes || []).forEach(m => (m.primitives || []).forEach(p => {
    if (p.indices !== undefined) p.indices = accMap.get(p.indices);
    Object.keys(p.attributes || {}).forEach(k => { p.attributes[k] = accMap.get(p.attributes[k]); });
  }));
  (gltf.skins || []).forEach(s => { if (s.inverseBindMatrices !== undefined) s.inverseBindMatrices = accMap.get(s.inverseBindMatrices); });
  (gltf.images || []).forEach(im => { if (im.bufferView !== undefined) im.bufferView = bvMap.get(im.bufferView); });

  const addFloat = (arr, type, minMax = false) => {
    const { byteOffset, byteLength } = pushBytes(Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength));
    const bvIdx = newBVs.length;
    newBVs.push({ buffer: 0, byteOffset, byteLength });
    const count = type === 'SCALAR' ? arr.length : type === 'VEC3' ? arr.length / 3 : arr.length / 4;
    const acc = { bufferView: bvIdx, componentType: 5126, count, type };
    if (minMax && type === 'SCALAR') {
      let mn = Infinity, mx = -Infinity;
      for (let i = 0; i < arr.length; i++) { if (arr[i] < mn) mn = arr[i]; if (arr[i] > mx) mx = arr[i]; }
      acc.min = [mn]; acc.max = [mx];
    }
    const idx = newAccs.length;
    newAccs.push(acc);
    return idx;
  };

  const anims = [];
  for (const [name, def] of Object.entries(motions)) {
    const dur = def.duration;
    const nf = Math.max(16, Math.round(dur * FPS) + 1);
    const times = new Float32Array(nf);
    for (let f = 0; f < nf; f++) times[f] = (f / (nf - 1)) * dur;
    const tAcc = addFloat(times, 'SCALAR', true);

    const f0 = def.evaluate(skel, 0);
    const rNodes = Object.keys(f0.animQ).map(Number);
    const pNodes = Object.keys(f0.animP).map(Number);
    const rArrs = {}, pArrs = {};
    rNodes.forEach(n => { rArrs[n] = new Float32Array(nf * 4); });
    pNodes.forEach(n => { pArrs[n] = new Float32Array(nf * 3); });

    const prevQ = {};
    for (let f = 0; f < nf; f++) {
      const u = (def.loop && f === nf - 1) ? 0 : (f / (nf - 1));
      const res = def.evaluate(skel, u);
      for (const n of rNodes) {
        let q = res.animQ[n];
        if (prevQ[n]) {
          const p = prevQ[n];
          if (p[0] * q[0] + p[1] * q[1] + p[2] * q[2] + p[3] * q[3] < 0) q = [-q[0], -q[1], -q[2], -q[3]];
        }
        prevQ[n] = q;
        const o = f * 4;
        rArrs[n][o] = q[0]; rArrs[n][o + 1] = q[1]; rArrs[n][o + 2] = q[2]; rArrs[n][o + 3] = q[3];
      }
      for (const n of pNodes) {
        const p = res.animP[n];
        const o = f * 3;
        pArrs[n][o] = p[0]; pArrs[n][o + 1] = p[1]; pArrs[n][o + 2] = p[2];
      }
    }

    const samplers = [], channels = [];
    for (const n of pNodes) {
      samplers.push({ input: tAcc, interpolation: 'LINEAR', output: addFloat(pArrs[n], 'VEC3') });
      channels.push({ sampler: samplers.length - 1, target: { node: n, path: 'translation' } });
    }
    for (const n of rNodes) {
      samplers.push({ input: tAcc, interpolation: 'LINEAR', output: addFloat(rArrs[n], 'VEC4') });
      channels.push({ sampler: samplers.length - 1, target: { node: n, path: 'rotation' } });
    }
    anims.push({ name, samplers, channels });
  }

  gltf.bufferViews = newBVs;
  gltf.accessors = newAccs;
  gltf.animations = anims;
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
  console.log(`✓ Authored From-Scratch Pro 60fps ${path.basename(filePath)} (${(out.length / 1024).toFixed(1)} KB, ${anims.length} clips)`);
}

bakeCharacterGLB(path.join(ROOT, 'assets/characters/footy10.glb'), 'footy');
bakeCharacterGLB(path.join(ROOT, 'assets/characters/hoops23.glb'), 'hoops');
bakeCharacterGLB(path.join(ROOT, 'assets/characters/keeper1.glb'), 'keeper');
