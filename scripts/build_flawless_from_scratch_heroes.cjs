const fs = require('fs');
const path = require('path');
const { bakeTextures } = require('./bake_scratch_hero_textures.cjs');

const ROOT = path.resolve(__dirname, '..');
const CANDIDATE_PATH = path.join(ROOT, 'archive/dev_assets/candidate_a_france.glb');
const RIG_PATH = path.join(ROOT, 'archive/dev_assets/test_quaternius_casual2.glb');

async function buildAllHeroes() {
  console.log('=== Step 1: Generating High-Resolution Hero Textures ===');
  await bakeTextures();

  console.log('\n=== Step 2: Reading Base Candidate A Mesh (9,661 vertices) ===');
  const candBuf = fs.readFileSync(CANDIDATE_PATH);
  const candChunk0Len = candBuf.readUInt32LE(12);
  const candGltf = JSON.parse(candBuf.toString('utf8', 20, 20 + candChunk0Len));
  const candBinStart = 20 + candChunk0Len + 8;

  const candPrim = candGltf.meshes[0].primitives[0];
  const candPosAcc = candGltf.accessors[candPrim.attributes.POSITION];
  const candPosBv = candGltf.bufferViews[candPosAcc.bufferView];
  const candPosStart = candBinStart + (candPosBv.byteOffset || 0) + (candPosAcc.byteOffset || 0);

  const candNormAcc = candGltf.accessors[candPrim.attributes.NORMAL];
  const candNormBv = candGltf.bufferViews[candNormAcc.bufferView];
  const candNormStart = candBinStart + (candNormBv.byteOffset || 0) + (candNormAcc.byteOffset || 0);

  const candUvAcc = candGltf.accessors[candPrim.attributes.TEXCOORD_0];
  const candUvBv = candGltf.bufferViews[candUvAcc.bufferView];
  const candUvStart = candBinStart + (candUvBv.byteOffset || 0) + (candUvAcc.byteOffset || 0);

  const candIndAcc = candGltf.accessors[candPrim.indices];
  const candIndBv = candGltf.bufferViews[candIndAcc.bufferView];
  const candIndStart = candBinStart + (candIndBv.byteOffset || 0) + (candIndAcc.byteOffset || 0);

  const vertexCount = candPosAcc.count;
  const indexCount = candIndAcc.count;
  console.log(`Loaded base mesh: ${vertexCount} vertices, ${indexCount / 3} triangles.`);

  console.log('\n=== Step 3: Reading Rig & 24 Skeletal Animation Clips ===');
  const rigBuf = fs.readFileSync(RIG_PATH);
  const rigChunk0Len = rigBuf.readUInt32LE(12);
  const rigGltf = JSON.parse(rigBuf.toString('utf8', 20, 20 + rigChunk0Len));
  const rigBinStart = 20 + rigChunk0Len + 8;
  const origSkin = rigGltf.skins[0];

  console.log(`Loaded rig: ${rigGltf.nodes.length} nodes, ${origSkin.joints.length} joints, ${rigGltf.animations.length} anims.`);

  // Function to build a rigged GLB for a specific character
  function buildHeroGLB(charType, outPath, atlasPath) {
    console.log(`\n--- Assembling GLB for ${charType.toUpperCase()} -> ${path.basename(outPath)} ---`);
    const isHoops = (charType === 'hoops');
    const isKeeper = (charType === 'keeper');

    // Scale and Grounding Offsets
    // Candidate A raw Y: 0.16846 to 11.26014 (span: 11.09168)
    const targetHeight = isHoops ? 1.94 : (isKeeper ? 1.86 : 1.80);
    const scale = targetHeight / 11.09168;
    const yOffset = -0.16846 * scale;

    const positions = new Float32Array(vertexCount * 3);
    const normals = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);

    for (let i = 0; i < vertexCount; i++) {
      let x = candBuf.readFloatLE(candPosStart + i * 12);
      let y = candBuf.readFloatLE(candPosStart + i * 12 + 4);
      let z = candBuf.readFloatLE(candPosStart + i * 12 + 8);

      let wx = x * scale;
      let wy = y * scale + yOffset;
      let wz = z * scale;

      // Sculpt Hoops Athletic Proportions
      if (isHoops) {
        // Broader athletic shoulders and chest
        if (wy > 1.25 && wy < 1.55) {
          wx *= 1.08;
        }
        // Athletic V-taper waist
        if (wy > 0.95 && wy < 1.20) {
          wx *= 0.96;
        }
        // Flatten soccer cleats studs into flat cushioned basketball sneaker soles
        if (wy < 0.045) {
          wy = 0.022;
        }
      }

      positions[i * 3 + 0] = wx;
      positions[i * 3 + 1] = wy;
      positions[i * 3 + 2] = wz;

      normals[i * 3 + 0] = candBuf.readFloatLE(candNormStart + i * 12);
      normals[i * 3 + 1] = candBuf.readFloatLE(candNormStart + i * 12 + 4);
      normals[i * 3 + 2] = candBuf.readFloatLE(candNormStart + i * 12 + 8);

      uvs[i * 2 + 0] = candBuf.readFloatLE(candUvStart + i * 8);
      uvs[i * 2 + 1] = candBuf.readFloatLE(candUvStart + i * 8 + 4);
    }

    // Auto-Rig Skinning Weights (62 bones)
    const joints = new Uint16Array(vertexCount * 4);
    const weights = new Float32Array(vertexCount * 4);

    function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

    for (let i = 0; i < vertexCount; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];

      const j = [0, 0, 0, 0];
      const w = [0, 0, 0, 0];

      // Head and Neck
      if (y >= 1.45) {
        const headFactor = clamp((y - 1.45) / 0.15, 0, 1);
        j[0] = 7; w[0] = headFactor; // Head
        j[1] = 6; w[1] = 1 - headFactor; // Neck
      }
      // Upper Limbs (Left vs Right)
      else if (Math.abs(x) > 0.16 && y >= 0.85) {
        const isLeft = x > 0;
        const ax = Math.abs(x);
        const bShoulder = isLeft ? 8 : 31;
        const bUpperArm = isLeft ? 9 : 32;
        const bLowerArm = isLeft ? 10 : 33;
        const bWrist    = isLeft ? 11 : 34;

        if (ax < 0.28) {
          const f = (ax - 0.16) / 0.12;
          j[0] = bShoulder; w[0] = 1 - f;
          j[1] = bUpperArm; w[1] = f;
          j[2] = 5; w[2] = 0.2 * (1 - f); // chest influence
        } else if (ax < 0.44) {
          const f = (ax - 0.28) / 0.16;
          j[0] = bUpperArm; w[0] = 1 - f;
          j[1] = bLowerArm; w[1] = f;
        } else {
          const f = clamp((ax - 0.44) / 0.14, 0, 1);
          j[0] = bLowerArm; w[0] = 1 - f;
          j[1] = bWrist;    w[1] = f;
        }
      }
      // Lower Limbs (Legs and Feet)
      else if (y < 0.86) {
        const isLeft = x >= 0;
        const bUpperLeg = isLeft ? 54 : 56;
        const bLowerLeg = isLeft ? 55 : 57;
        const bFoot     = isLeft ? 58 : 60;

        if (y > 0.48) {
          // Thigh
          const f = clamp((y - 0.48) / 0.38, 0, 1);
          j[0] = bUpperLeg; w[0] = f;
          j[1] = bLowerLeg; w[1] = 1 - f;
          if (y > 0.75) {
            const hipBlend = (y - 0.75) / 0.11;
            j[2] = 2; w[2] = hipBlend * 0.4;
          }
        } else if (y > 0.12) {
          // Calf / Shin
          const f = clamp((y - 0.12) / 0.36, 0, 1);
          j[0] = bLowerLeg; w[0] = f;
          j[1] = bFoot;     w[1] = 1 - f;
        } else {
          // Foot
          j[0] = bFoot; w[0] = 1.0;
        }
      }
      // Central Torso
      else {
        if (y >= 1.25) {
          const f = (y - 1.25) / 0.20;
          j[0] = 5; w[0] = 1 - f; // Chest
          j[1] = 6; w[1] = f;     // Neck
          j[2] = 4; w[2] = 0.3 * (1 - f); // Torso
        } else if (y >= 1.05) {
          const f = (y - 1.05) / 0.20;
          j[0] = 4; w[0] = 1 - f; // Torso
          j[1] = 5; w[1] = f;     // Chest
        } else if (y >= 0.88) {
          const f = (y - 0.88) / 0.17;
          j[0] = 3; w[0] = 1 - f; // Abdomen
          j[1] = 4; w[1] = f;     // Torso
          j[2] = 2; w[2] = 0.3 * (1 - f); // Hips
        } else {
          j[0] = 2; w[0] = 1.0; // Hips
        }
      }

      // Normalize weights
      let sum = w[0] + w[1] + w[2] + w[3];
      if (sum > 0.0001) {
        const inv = 1.0 / sum;
        weights[i * 4 + 0] = w[0] * inv;
        weights[i * 4 + 1] = w[1] * inv;
        weights[i * 4 + 2] = w[2] * inv;
        weights[i * 4 + 3] = w[3] * inv;
      } else {
        weights[i * 4 + 0] = 1.0;
      }

      joints[i * 4 + 0] = j[0];
      joints[i * 4 + 1] = j[1];
      joints[i * 4 + 2] = j[2];
      joints[i * 4 + 3] = j[3];
    }

    // Read Indices
    const indices = new Uint32Array(indexCount);
    for (let i = 0; i < indexCount; i++) {
      indices[i] = candBuf.readUInt32LE(candIndStart + i * 4);
    }

    const texBuf = fs.readFileSync(atlasPath);

    // Calculate min/max bounds
    let minPos = [Infinity, Infinity, Infinity];
    let maxPos = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < vertexCount; i++) {
      const x = positions[i * 3], y = positions[i * 3 + 1], z = positions[i * 3 + 2];
      minPos[0] = Math.min(minPos[0], x); maxPos[0] = Math.max(maxPos[0], x);
      minPos[1] = Math.min(minPos[1], y); maxPos[1] = Math.max(maxPos[1], y);
      minPos[2] = Math.min(minPos[2], z); maxPos[2] = Math.max(maxPos[2], z);
    }

    // Assemble glTF Structure
    const bufferParts = [];
    let currentOffset = 0;

    function addBufferView(buf, target) {
      const pad = (4 - (buf.length % 4)) % 4;
      const paddedBuf = pad > 0 ? Buffer.concat([buf, Buffer.alloc(pad)]) : buf;
      const bv = { buffer: 0, byteOffset: currentOffset, byteLength: buf.length };
      if (target) bv.target = target;
      currentOffset += paddedBuf.length;
      bufferParts.push(paddedBuf);
      return bv;
    }

    const bufferViews = [];
    const accessors = [];

    // BV 0: Positions
    bufferViews.push(addBufferView(Buffer.from(positions.buffer), 34962));
    accessors.push({ bufferView: 0, componentType: 5126, count: vertexCount, type: 'VEC3', min: minPos, max: maxPos });

    // BV 1: Normals
    bufferViews.push(addBufferView(Buffer.from(normals.buffer), 34962));
    accessors.push({ bufferView: 1, componentType: 5126, count: vertexCount, type: 'VEC3' });

    // BV 2: UVs
    bufferViews.push(addBufferView(Buffer.from(uvs.buffer), 34962));
    accessors.push({ bufferView: 2, componentType: 5126, count: vertexCount, type: 'VEC2' });

    // BV 3: Joints
    bufferViews.push(addBufferView(Buffer.from(joints.buffer), 34962));
    accessors.push({ bufferView: 3, componentType: 5123, count: vertexCount, type: 'VEC4' });

    // BV 4: Weights
    bufferViews.push(addBufferView(Buffer.from(weights.buffer), 34962));
    accessors.push({ bufferView: 4, componentType: 5126, count: vertexCount, type: 'VEC4' });

    // BV 5: Indices
    bufferViews.push(addBufferView(Buffer.from(indices.buffer), 34963));
    accessors.push({ bufferView: 5, componentType: 5125, count: indexCount, type: 'SCALAR' });

    // BV 6: Texture Image Data
    bufferViews.push(addBufferView(texBuf));
    const texBufferViewIndex = 6;

    // BV 7: Inverse Bind Matrices
    const origIbmAcc = rigGltf.accessors[origSkin.inverseBindMatrices];
    const origIbmBv = rigGltf.bufferViews[origIbmAcc.bufferView];
    const ibmOffset = rigBinStart + (origIbmBv.byteOffset || 0) + (origIbmAcc.byteOffset || 0);
    const ibmBuf = rigBuf.subarray(ibmOffset, ibmOffset + origSkin.joints.length * 64);

    const ibmBvIndex = bufferViews.length;
    bufferViews.push(addBufferView(ibmBuf));
    const ibmAccIndex = accessors.length;
    accessors.push({ bufferView: ibmBvIndex, componentType: 5126, count: origSkin.joints.length, type: 'MAT4' });

    // BV 8+: Animation Samplers (Copy all 24 animations!)
    const newAnimations = [];
    const accMap = new Map();

    rigGltf.animations.forEach((origAnim) => {
      const newSamplers = [];
      const newChannels = [];

      origAnim.samplers.forEach(s => {
        function copyAccessor(oldAccIdx) {
          if (accMap.has(oldAccIdx)) return accMap.get(oldAccIdx);
          const oldAcc = rigGltf.accessors[oldAccIdx];
          const oldBv = rigGltf.bufferViews[oldAcc.bufferView];
          const start = rigBinStart + (oldBv.byteOffset || 0) + (oldAcc.byteOffset || 0);
          const byteLen = oldAcc.count * (oldAcc.type === 'VEC4' ? 16 : oldAcc.type === 'VEC3' ? 12 : 4);
          const rawData = rigBuf.subarray(start, start + byteLen);

          const bvIdx = bufferViews.length;
          bufferViews.push(addBufferView(rawData));
          const newAccIdx = accessors.length;
          const newAcc = { bufferView: bvIdx, componentType: oldAcc.componentType, count: oldAcc.count, type: oldAcc.type };
          if (oldAcc.min) newAcc.min = oldAcc.min;
          if (oldAcc.max) newAcc.max = oldAcc.max;
          accessors.push(newAcc);
          accMap.set(oldAccIdx, newAccIdx);
          return newAccIdx;
        }

        newSamplers.push({
          input: copyAccessor(s.input),
          interpolation: s.interpolation || 'LINEAR',
          output: copyAccessor(s.output)
        });
      });

      origAnim.channels.forEach(ch => {
        newChannels.push({
          sampler: ch.sampler,
          target: { node: ch.target.node, path: ch.target.path }
        });
      });

      newAnimations.push({
        name: origAnim.name,
        channels: newChannels,
        samplers: newSamplers
      });
    });

    // Copy all 67 nodes from rig
    const nodes = rigGltf.nodes.map(n => {
      const copy = { name: n.name };
      if (n.translation) copy.translation = n.translation;
      if (n.rotation) copy.rotation = n.rotation;
      if (n.scale) copy.scale = n.scale;
      if (n.children) copy.children = [...n.children];
      return copy;
    });

    // Add mesh node
    nodes.push({
      name: `${charType}_Mesh`,
      mesh: 0,
      skin: 0
    });

    const childSet = new Set();
    nodes.forEach(n => (n.children || []).forEach(c => childSet.add(c)));
    const rootNodeIndices = nodes.map((_, i) => i).filter(i => !childSet.has(i));

    const outGltf = {
      asset: { generator: 'FOOTY vs HOOPS Flawless Hero Pipeline', version: '2.0' },
      scene: 0,
      scenes: [{ name: 'DefaultScene', nodes: rootNodeIndices }],
      nodes: nodes,
      meshes: [
        {
          name: `${charType}_Mesh`,
          primitives: [
            {
              attributes: {
                POSITION: 0,
                NORMAL: 1,
                TEXCOORD_0: 2,
                JOINTS_0: 3,
                WEIGHTS_0: 4
              },
              indices: 5,
              material: 0,
              mode: 4
            }
          ]
        }
      ],
      skins: [
        {
          name: 'CharacterSkin',
          joints: origSkin.joints,
          skeleton: origSkin.skeleton,
          inverseBindMatrices: ibmAccIndex
        }
      ],
      animations: newAnimations,
      materials: [
        {
          name: `${charType}_Material`,
          pbrMetallicRoughness: {
            baseColorFactor: [1, 1, 1, 1],
            metallicFactor: isHoops ? 0.35 : 0.05,
            roughnessFactor: isHoops ? 0.45 : 0.65,
            baseColorTexture: { index: 0 }
          }
        }
      ],
      textures: [{ sampler: 0, source: 0 }],
      images: [{ mimeType: 'image/png', bufferView: texBufferViewIndex, name: `${charType}_atlas` }],
      samplers: [{ magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497 }],
      accessors: accessors,
      bufferViews: bufferViews,
      buffers: [{ byteLength: currentOffset }]
    };

    const jsonString = JSON.stringify(outGltf);
    const jsonBuffer = Buffer.from(jsonString, 'utf8');
    const jsonPadding = (4 - (jsonBuffer.length % 4)) % 4;
    const paddedJsonBuffer = jsonPadding > 0 ? Buffer.concat([jsonBuffer, Buffer.alloc(jsonPadding, 0x20)]) : jsonBuffer;

    const binaryBuffer = Buffer.concat(bufferParts);
    const totalLength = 12 + 8 + paddedJsonBuffer.length + 8 + binaryBuffer.length;

    const glbHeader = Buffer.alloc(12);
    glbHeader.write('glTF', 0, 4, 'ascii');
    glbHeader.writeUInt32LE(2, 4);
    glbHeader.writeUInt32LE(totalLength, 8);

    const jsonHeader = Buffer.alloc(8);
    jsonHeader.writeUInt32LE(paddedJsonBuffer.length, 0);
    jsonHeader.writeUInt32LE(0x4E4F534A, 4);

    const binHeader = Buffer.alloc(8);
    binHeader.writeUInt32LE(binaryBuffer.length, 0);
    binHeader.writeUInt32LE(0x004E4942, 4);

    const finalGLB = Buffer.concat([glbHeader, jsonHeader, paddedJsonBuffer, binHeader, binaryBuffer]);
    fs.writeFileSync(outPath, finalGLB);
    console.log(`✓ Saved ${path.basename(outPath)} (${(finalGLB.length / 1024 / 1024).toFixed(2)} MB, ${vertexCount} verts, ${newAnimations.length} animations)`);
  }

  // Build the 3 Hero GLB models
  buildHeroGLB('footy', path.join(ROOT, 'assets/characters/footy10.glb'), path.join(ROOT, 'assets/characters/footy10_atlas.png'));
  buildHeroGLB('hoops', path.join(ROOT, 'assets/characters/hoops23.glb'), path.join(ROOT, 'assets/characters/hoops23_atlas.png'));
  buildHeroGLB('keeper', path.join(ROOT, 'assets/characters/keeper1.glb'), path.join(ROOT, 'assets/characters/keeper1_atlas.png'));

  console.log('\n=== All 3 True Hero Characters Built From Scratch Successfully! ===');
}

buildAllHeroes().catch(console.error);
