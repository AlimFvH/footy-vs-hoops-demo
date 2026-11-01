/**
 * FOOTY vs HOOPS — Zero-Dependency GLB & glTF 2.0 Binary Micro-Loader
 * 
 * Standalone parser for rigged, textured, and animated 3D characters.
 * Compatible with WebGL2 and modern mobile browsers.
 *
 * Features supported:
 *  - GLB container binary unpacker (JSON chunk 0 + BIN chunk 1)
 *  - BufferView & Accessor decoding (Float32, Uint16, Uint8, interleaved byteStride)
 *  - Vertex attributes: POSITION, NORMAL, TEXCOORD_0, JOINTS_0, WEIGHTS_0
 *  - Automatic weight normalization (sum = 1.0)
 *  - Embedded texture extraction (PNG, JPEG via Blob URL)
 *  - Material extraction (BaseColor, Metallic, Roughness)
 *  - Hierarchical skeleton and node TRS graphs
 *  - glTF keyframe animations with Quaternion SLERP & Vector LERP
 *  - Real-time bone matrix generation for GPU vertex skinning
 */

(function(root, factory) {
  var exp = {};
  factory(exp);
  if (root) root.GLBLoader = exp;
  if (typeof window !== 'undefined') window.GLBLoader = exp;
  if (typeof globalThis !== 'undefined') globalThis.GLBLoader = exp;
  if (typeof define === 'function' && define.amd) {
    define([], function() { return exp; });
  }
  if (typeof module === 'object' && module && module.exports) {
    module.exports = exp;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function(exports) {
  'use strict';

  // --- Math Helpers for TRS & Quaternions ---

  function quatSlerp(out, a, b, t) {
    let ax = a[0], ay = a[1], az = a[2], aw = a[3];
    let bx = b[0], by = b[1], bz = b[2], bw = b[3];
    let cosHalfTheta = ax * bx + ay * by + az * bz + aw * bw;
    if (cosHalfTheta < 0) {
      bx = -bx; by = -by; bz = -bz; bw = -bw;
      cosHalfTheta = -cosHalfTheta;
    }
    if (Math.abs(cosHalfTheta) >= 1.0) {
      out[0] = ax; out[1] = ay; out[2] = az; out[3] = aw;
      return out;
    }
    const halfTheta = Math.acos(cosHalfTheta);
    const sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);
    if (Math.abs(sinHalfTheta) < 0.001) {
      out[0] = 0.5 * (ax + bx);
      out[1] = 0.5 * (ay + by);
      out[2] = 0.5 * (az + bz);
      out[3] = 0.5 * (aw + bw);
      return out;
    }
    const ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta;
    const ratioB = Math.sin(t * halfTheta) / sinHalfTheta;
    out[0] = ax * ratioA + bx * ratioB;
    out[1] = ay * ratioA + by * ratioB;
    out[2] = az * ratioA + bz * ratioB;
    out[3] = aw * ratioA + bw * ratioB;
    return out;
  }

  function mat4Identity(out) {
    out.fill(0);
    out[0] = out[5] = out[10] = out[15] = 1;
    return out;
  }

  function mat4FromTRS(out, t, q, s) {
    const x = q[0], y = q[1], z = q[2], w = q[3];
    const x2 = x + x, y2 = y + y, z2 = z + z;
    const xx = x * x2, xy = x * y2, xz = x * z2;
    const yy = y * y2, yz = y * z2, zz = z * z2;
    const wx = w * x2, wy = w * y2, wz = w * z2;
    const sx = s[0], sy = s[1], sz = s[2];

    out[0] = (1 - (yy + zz)) * sx;
    out[1] = (xy + wz) * sx;
    out[2] = (xz - wy) * sx;
    out[3] = 0;

    out[4] = (xy - wz) * sy;
    out[5] = (1 - (xx + zz)) * sy;
    out[6] = (yz + wx) * sy;
    out[7] = 0;

    out[8] = (xz + wy) * sz;
    out[9] = (yz - wx) * sz;
    out[10] = (1 - (xx + yy)) * sz;
    out[11] = 0;

    out[12] = t[0];
    out[13] = t[1];
    out[14] = t[2];
    out[15] = 1;
    return out;
  }

  function mat4Multiply(out, a, b) {
    const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
    const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
    const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
    const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
    out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
    out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
    out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    return out;
  }

  // --- GLB Binary Container Unpacking ---

  function parseGLBContainer(arrayBuffer) {
    const dataView = new DataView(arrayBuffer);
    const magic = dataView.getUint32(0, true);
    if (magic !== 0x46546C67) {
      throw new Error('Not a valid GLB file (magic header mismatch: 0x' + magic.toString(16) + ')');
    }
    const version = dataView.getUint32(4, true);
    if (version !== 2) {
      throw new Error('Unsupported glTF version ' + version + ' (expected version 2)');
    }
    const totalLength = dataView.getUint32(8, true);

    let offset = 12;
    let jsonChunk = null;
    let binChunk = null;

    while (offset < totalLength) {
      const chunkLength = dataView.getUint32(offset, true);
      const chunkType = dataView.getUint32(offset + 4, true);
      offset += 8;

      if (chunkType === 0x4E4F534A) { // JSON chunk
        const jsonBytes = new Uint8Array(arrayBuffer, offset, chunkLength);
        const decoder = new TextDecoder('utf-8');
        jsonChunk = JSON.parse(decoder.decode(jsonBytes));
      } else if (chunkType === 0x004E4942) { // BIN chunk
        binChunk = arrayBuffer.slice(offset, offset + chunkLength);
      }
      offset += chunkLength;
    }

    if (!jsonChunk) {
      throw new Error('GLB file has no JSON metadata chunk');
    }

    return { gltf: jsonChunk, bin: binChunk };
  }

  // --- BufferView & Accessor Reader ---

  function getAccessorData(gltf, bin, accessorIdx) {
    const accessor = gltf.accessors[accessorIdx];
    if (!accessor) return null;
    const bufferView = gltf.bufferViews[accessor.bufferView];
    const byteOffset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
    const count = accessor.count;

    const typeCounts = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
    const numComponents = typeCounts[accessor.type] || 1;

    // Component types:
    // 5120: BYTE, 5121: UBYTE, 5122: SHORT, 5123: USHORT, 5125: UINT, 5126: FLOAT
    const compType = accessor.componentType;
    let TypedArrayCtor = Float32Array;
    if (compType === 5120) TypedArrayCtor = Int8Array;
    else if (compType === 5121) TypedArrayCtor = Uint8Array;
    else if (compType === 5122) TypedArrayCtor = Int16Array;
    else if (compType === 5123) TypedArrayCtor = Uint16Array;
    else if (compType === 5125) TypedArrayCtor = Uint32Array;
    else if (compType === 5126) TypedArrayCtor = Float32Array;

    const byteStride = bufferView.byteStride || 0;
    const compBytes = TypedArrayCtor.BYTES_PER_ELEMENT;

    if (byteStride === 0 || byteStride === compBytes * numComponents) {
      return new TypedArrayCtor(bin, byteOffset, count * numComponents);
    }

    // Interleaved buffer extraction
    const out = new TypedArrayCtor(count * numComponents);
    const srcView = new DataView(bin, byteOffset);
    for (let i = 0; i < count; i++) {
      const rowOffset = i * byteStride;
      for (let c = 0; c < numComponents; c++) {
        const elOffset = rowOffset + c * compBytes;
        let val = 0;
        if (compType === 5120) val = srcView.getInt8(elOffset);
        else if (compType === 5121) val = srcView.getUint8(elOffset);
        else if (compType === 5122) val = srcView.getInt16(elOffset, true);
        else if (compType === 5123) val = srcView.getUint16(elOffset, true);
        else if (compType === 5125) val = srcView.getUint32(elOffset, true);
        else if (compType === 5126) val = srcView.getFloat32(elOffset, true);
        out[i * numComponents + c] = val;
      }
    }
    return out;
  }

  // --- Animation Clip Player ---

  class GLBAnimation {
    constructor(name, duration, samplers, channels) {
      this.name = name;
      this.duration = duration;
      this.samplers = samplers;
      this.channels = channels;
    }

    apply(timeSeconds, nodes) {
      const t = this.duration > 0 ? (timeSeconds % this.duration) : 0;

      for (let c = 0; c < this.channels.length; c++) {
        const ch = this.channels[c];
        const sampler = this.samplers[ch.sampler];
        const node = nodes[ch.nodeIndex];
        if (!node) continue;

        const times = sampler.times;
        const values = sampler.values;
        const nKeys = times.length;

        if (nKeys === 1 || t <= times[0]) {
          this.writeTarget(node, ch.path, values, 0);
          continue;
        }
        if (t >= times[nKeys - 1]) {
          this.writeTarget(node, ch.path, values, (nKeys - 1) * ch.stride);
          continue;
        }

        // Binary search for keyframe segment
        let low = 0, high = nKeys - 1;
        while (low <= high) {
          const mid = (low + high) >> 1;
          if (times[mid] <= t) {
            low = mid + 1;
          } else {
            high = mid - 1;
          }
        }
        const i0 = Math.max(0, high);
        const i1 = Math.min(nKeys - 1, i0 + 1);

        const t0 = times[i0];
        const t1 = times[i1];
        const alpha = t1 > t0 ? (t - t0) / (t1 - t0) : 0;

        if (ch.path === 'rotation') {
          const q0 = [values[i0 * 4], values[i0 * 4 + 1], values[i0 * 4 + 2], values[i0 * 4 + 3]];
          const q1 = [values[i1 * 4], values[i1 * 4 + 1], values[i1 * 4 + 2], values[i1 * 4 + 3]];
          quatSlerp(node.rotation, q0, q1, alpha);
        } else {
          const offset0 = i0 * 3;
          const offset1 = i1 * 3;
          const target = ch.path === 'translation' ? node.translation : node.scale;
          for (let k = 0; k < 3; k++) {
            target[k] = values[offset0 + k] * (1 - alpha) + values[offset1 + k] * alpha;
          }
        }
      }
    }

    writeTarget(node, path, values, offset) {
      node.hasMatrix = false;
      if (path === 'rotation') {
        node.rotation[0] = values[offset];
        node.rotation[1] = values[offset + 1];
        node.rotation[2] = values[offset + 2];
        node.rotation[3] = values[offset + 3];
      } else if (path === 'translation') {
        node.translation[0] = values[offset];
        node.translation[1] = values[offset + 1];
        node.translation[2] = values[offset + 2];
      } else if (path === 'scale') {
        node.scale[0] = values[offset];
        node.scale[1] = values[offset + 1];
        node.scale[2] = values[offset + 2];
      }
    }
  }

  // --- GLB Character Model Instance ---

  class GLBModel {
    constructor(data) {
      this.nodes = data.nodes;
      this.rootNodeIndices = data.rootNodeIndices;
      this.primitives = data.primitives;
      this.skin = data.skin;
      this.animations = data.animations;
      // Default to 'idle' animation if present, otherwise 0
      const idleIdx = this.animations.findIndex(a => a.name.toLowerCase().includes('idle'));
      this.activeAnimIndex = idleIdx !== -1 ? idleIdx : 0;
      this.playbackTime = 0;
      this.playing = true;
      this.playbackSpeed = 1.0;
      this.stats = data.stats;

      // Up to 64 bones supported in vertex uniform array (256 uniform vectors, standard in WebGL2)
      this.boneMatrices = new Float32Array(64 * 16);
      for (let b = 0; b < 64; b++) {
        mat4Identity(this.boneMatrices.subarray(b * 16, (b + 1) * 16));
      }
    }

    setAnimation(clipIndexOrName) {
      if (typeof clipIndexOrName === 'number') {
        if (clipIndexOrName >= 0 && clipIndexOrName < this.animations.length) {
          this.activeAnimIndex = clipIndexOrName;
        }
      } else {
        const idx = this.animations.findIndex(a => a.name.toLowerCase() === String(clipIndexOrName).toLowerCase());
        if (idx !== -1) this.activeAnimIndex = idx;
      }
    }

    update(dt) {
      if (this.animations.length > 0 && this.playing) {
        this.playbackTime += dt * this.playbackSpeed;
        const currentAnim = this.animations[this.activeAnimIndex];
        if (currentAnim) {
          currentAnim.apply(this.playbackTime, this.nodes);
        }
      }

      this.updateNodeMatrices();
      this.updateBoneMatrices();
    }

    updateNodeMatrices() {
      // Traverse from root nodes downwards
      const traverse = (nodeIdx, parentWorldMatrix) => {
        const node = this.nodes[nodeIdx];
        if (!node.hasMatrix) {
          mat4FromTRS(node.localMatrix, node.translation, node.rotation, node.scale);
        }

        if (parentWorldMatrix) {
          mat4Multiply(node.worldMatrix, parentWorldMatrix, node.localMatrix);
        } else {
          node.worldMatrix.set(node.localMatrix);
        }

        if (node.children) {
          for (let i = 0; i < node.children.length; i++) {
            traverse(node.children[i], node.worldMatrix);
          }
        }
      };

      for (let r = 0; r < this.rootNodeIndices.length; r++) {
        traverse(this.rootNodeIndices[r], null);
      }
    }

    updateBoneMatrices() {
      if (!this.skin) return;

      const numJoints = Math.min(this.skin.joints.length, 64);
      const ibm = this.skin.inverseBindMatrices;

      for (let j = 0; j < numJoints; j++) {
        const jointNodeIdx = this.skin.joints[j];
        const jointNode = this.nodes[jointNodeIdx];
        const invBind = ibm.subarray(j * 16, (j + 1) * 16);
        const outBone = this.boneMatrices.subarray(j * 16, (j + 1) * 16);

        // boneMatrix = jointWorldMatrix * inverseBindMatrix
        mat4Multiply(outBone, jointNode.worldMatrix, invBind);
      }
    }
  }

  // --- Main Loader Function ---

  async function loadGLB(arrayBufferOrUrl) {
    const t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    let arrayBuffer = null;

    if (typeof arrayBufferOrUrl === 'string') {
      const resp = await fetch(arrayBufferOrUrl);
      if (!resp.ok) throw new Error('Failed to load GLB file: ' + resp.status + ' ' + resp.statusText);
      arrayBuffer = await resp.arrayBuffer();
    } else if (arrayBufferOrUrl instanceof ArrayBuffer) {
      arrayBuffer = arrayBufferOrUrl;
    } else if (arrayBufferOrUrl && arrayBufferOrUrl.buffer instanceof ArrayBuffer) {
      arrayBuffer = arrayBufferOrUrl.buffer.slice(arrayBufferOrUrl.byteOffset, arrayBufferOrUrl.byteOffset + arrayBufferOrUrl.byteLength);
    } else {
      throw new Error('Invalid input to loadGLB: expected URL string or ArrayBuffer');
    }

    const { gltf, bin } = parseGLBContainer(arrayBuffer);

    // 1. Decode Embedded Textures & Images
    const loadedImages = [];
    const hasImageDOM = typeof Image !== 'undefined' && typeof Blob !== 'undefined' && typeof URL !== 'undefined';
    if (gltf.images && gltf.images.length > 0) {
      for (let i = 0; i < gltf.images.length; i++) {
        const imgDef = gltf.images[i];
        if (hasImageDOM && imgDef.bufferView !== undefined) {
          const bv = gltf.bufferViews[imgDef.bufferView];
          const imgBytes = new Uint8Array(bin, bv.byteOffset || 0, bv.byteLength);
          const mime = imgDef.mimeType || 'image/png';
          const blob = new Blob([imgBytes], { type: mime });
          const url = URL.createObjectURL(blob);
          const img = new Image();
          await new Promise((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => {
              console.warn('[GLBLoader] Image failed to decode:', imgDef.name);
              resolve();
            };
            img.src = url;
          });
          loadedImages.push(img);
        } else if (hasImageDOM && imgDef.uri) {
          const img = new Image();
          await new Promise((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = imgDef.uri;
          });
          loadedImages.push(img);
        } else {
          // In headless Node or non-DOM test environment, retain raw image metadata
          loadedImages.push({ name: imgDef.name, mimeType: imgDef.mimeType, bufferView: imgDef.bufferView });
        }
      }
    }

    // 2. Decode Materials
    const materials = [];
    if (gltf.materials && gltf.materials.length > 0) {
      for (let m = 0; m < gltf.materials.length; m++) {
        const matDef = gltf.materials[m];
        const pbr = matDef.pbrMetallicRoughness || {};
        let image = null;

        if (pbr.baseColorTexture && gltf.textures) {
          const texDef = gltf.textures[pbr.baseColorTexture.index];
          if (texDef && texDef.source !== undefined && loadedImages[texDef.source]) {
            image = loadedImages[texDef.source];
          }
        }

        materials.push({
          name: matDef.name || ('Material_' + m),
          baseColorFactor: pbr.baseColorFactor || [1, 1, 1, 1],
          metallicFactor: pbr.metallicFactor !== undefined ? pbr.metallicFactor : 0.0,
          roughnessFactor: pbr.roughnessFactor !== undefined ? pbr.roughnessFactor : 0.75,
          image: image
        });
      }
    }

    // 3. Build Nodes Graph
    const nodes = (gltf.nodes || []).map((nDef, idx) => {
      const translation = nDef.translation ? new Float32Array(nDef.translation) : new Float32Array([0, 0, 0]);
      const rotation = nDef.rotation ? new Float32Array(nDef.rotation) : new Float32Array([0, 0, 0, 1]);
      const scale = nDef.scale ? new Float32Array(nDef.scale) : new Float32Array([1, 1, 1]);
      const localMatrix = new Float32Array(16);
      let hasMatrix = false;
      if (nDef.matrix) {
        localMatrix.set(nDef.matrix);
        hasMatrix = true;
      } else {
        mat4FromTRS(localMatrix, translation, rotation, scale);
      }

      return {
        index: idx,
        name: nDef.name || ('Node_' + idx),
        mesh: nDef.mesh,
        skin: nDef.skin,
        children: nDef.children || [],
        translation: translation,
        rotation: rotation,
        scale: scale,
        hasMatrix: hasMatrix,
        localMatrix: localMatrix,
        worldMatrix: new Float32Array(16)
      };
    });

    // Find root nodes (nodes not referenced as children)
    const childSet = new Set();
    nodes.forEach(n => n.children.forEach(c => childSet.add(c)));
    const rootNodeIndices = nodes.map((_, i) => i).filter(i => !childSet.has(i));

    // 4. Decode Skins
    let skinData = null;
    if (gltf.skins && gltf.skins.length > 0) {
      const sDef = gltf.skins[0];
      const ibm = getAccessorData(gltf, bin, sDef.inverseBindMatrices);
      skinData = {
        name: sDef.name || 'Skin_0',
        joints: sDef.joints,
        skeletonRootNode: sDef.skeleton,
        inverseBindMatrices: ibm || new Float32Array(sDef.joints.length * 16)
      };
    }

    // 5. Decode Meshes & Primitives
    const primitives = [];
    let totalVertices = 0;
    let totalTriangles = 0;

    (gltf.meshes || []).forEach((mDef, mIdx) => {
      (mDef.primitives || []).forEach((pDef, pIdx) => {
        const attrs = pDef.attributes;
        const posData = getAccessorData(gltf, bin, attrs.POSITION);
        if (!posData) return;

        const normData = attrs.NORMAL !== undefined ? getAccessorData(gltf, bin, attrs.NORMAL) : null;
        const uvData = attrs.TEXCOORD_0 !== undefined ? getAccessorData(gltf, bin, attrs.TEXCOORD_0) : null;

        // Skinned attributes: JOINTS_0, WEIGHTS_0
        let jointsData = null;
        let weightsData = null;

        if (attrs.JOINTS_0 !== undefined) {
          const rawJoints = getAccessorData(gltf, bin, attrs.JOINTS_0);
          jointsData = new Float32Array(rawJoints.length);
          for (let j = 0; j < rawJoints.length; j++) {
            jointsData[j] = rawJoints[j];
          }
        }

        if (attrs.WEIGHTS_0 !== undefined) {
          const rawWeights = getAccessorData(gltf, bin, attrs.WEIGHTS_0);
          weightsData = new Float32Array(rawWeights.length);
          // Normalize weights (4 per vertex)
          for (let w = 0; w < rawWeights.length; w += 4) {
            let sum = rawWeights[w] + rawWeights[w + 1] + rawWeights[w + 2] + rawWeights[w + 3];
            if (sum > 0.0001) {
              const invSum = 1.0 / sum;
              weightsData[w] = rawWeights[w] * invSum;
              weightsData[w + 1] = rawWeights[w + 1] * invSum;
              weightsData[w + 2] = rawWeights[w + 2] * invSum;
              weightsData[w + 3] = rawWeights[w + 3] * invSum;
            } else {
              weightsData[w] = 1.0;
              weightsData[w + 1] = 0.0;
              weightsData[w + 2] = 0.0;
              weightsData[w + 3] = 0.0;
            }
          }
        }

        // Indices
        let indexData = null;
        if (pDef.indices !== undefined) {
          const rawIndices = getAccessorData(gltf, bin, pDef.indices);
          if (rawIndices instanceof Uint32Array) {
            indexData = rawIndices;
          } else {
            indexData = new Uint16Array(rawIndices.length);
            indexData.set(rawIndices);
          }
        } else {
          // Generate non-indexed sequential triangles
          const vCount = posData.length / 3;
          indexData = new Uint16Array(vCount);
          for (let k = 0; k < vCount; k++) indexData[k] = k;
        }

        // Default normals if missing
        let finalNormals = normData;
        if (!finalNormals) {
          finalNormals = new Float32Array(posData.length);
          for (let i = 0; i < finalNormals.length; i += 3) {
            finalNormals[i + 1] = 1.0;
          }
        }

        // Default UVs if missing
        let finalUVs = uvData;
        if (!finalUVs) {
          finalUVs = new Float32Array((posData.length / 3) * 2);
        }

        const vCount = posData.length / 3;
        const triCount = indexData.length / 3;
        totalVertices += vCount;
        totalTriangles += triCount;

        const mat = (pDef.material !== undefined && materials[pDef.material])
          ? materials[pDef.material]
          : { name: 'DefaultMat', baseColorFactor: [0.85, 0.85, 0.85, 1], metallicFactor: 0, roughnessFactor: 0.8, image: null };

        primitives.push({
          meshName: mDef.name || ('Mesh_' + mIdx),
          primitiveIndex: pIdx,
          positions: posData,
          normals: finalNormals,
          uvs: finalUVs,
          joints: jointsData,
          weights: weightsData,
          indices: indexData,
          material: mat,
          vertexCount: vCount,
          triangleCount: triCount,
          isSkinned: !!(jointsData && weightsData)
        });
      });
    });

    // 6. Decode Animations
    const animations = [];
    if (gltf.animations && gltf.animations.length > 0) {
      for (let a = 0; a < gltf.animations.length; a++) {
        const aDef = gltf.animations[a];
        let maxTime = 0;

        const samplers = (aDef.samplers || []).map(sDef => {
          const times = getAccessorData(gltf, bin, sDef.input);
          const values = getAccessorData(gltf, bin, sDef.output);
          if (times && times.length > 0) {
            const clipMax = times[times.length - 1];
            if (clipMax > maxTime) maxTime = clipMax;
          }
          return {
            times: times,
            values: values,
            interpolation: sDef.interpolation || 'LINEAR'
          };
        });

        const channels = (aDef.channels || []).map(cDef => {
          const stride = cDef.target.path === 'rotation' ? 4 : 3;
          return {
            sampler: cDef.sampler,
            nodeIndex: cDef.target.node,
            path: cDef.target.path,
            stride: stride
          };
        });

        const clipName = aDef.name || ('Animation_' + a);
        animations.push(new GLBAnimation(clipName, maxTime, samplers, channels));
      }
    }

    const t1 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    const parseTimeMs = +(t1 - t0).toFixed(2);

    const stats = {
      vertexCount: totalVertices,
      triangleCount: totalTriangles,
      meshCount: (gltf.meshes || []).length,
      primitiveCount: primitives.length,
      boneCount: skinData ? skinData.joints.length : 0,
      materialCount: materials.length,
      animationCount: animations.length,
      parseTimeMs: parseTimeMs
    };

    return new GLBModel({
      nodes: nodes,
      rootNodeIndices: rootNodeIndices,
      primitives: primitives,
      skin: skinData,
      animations: animations,
      stats: stats
    });
  }

  // Export public API
  exports.loadGLB = loadGLB;
  exports.parseGLBContainer = parseGLBContainer;
  exports.GLBModel = GLBModel;
});
