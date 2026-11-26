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

    apply(timeSeconds, nodes, loop = true) {
      let t = timeSeconds;
      if (this.duration > 0) {
        if (loop) {
          t = timeSeconds % this.duration;
          if (t < 0) t += this.duration;
        } else {
          t = Math.max(0, Math.min(this.duration, timeSeconds));
        }
      } else {
        t = 0;
      }

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
      // Default to 'idle_neutral' animation if present, otherwise 'idle'
      let idleIdx = this.animations.findIndex(a => a.name.toLowerCase() === 'idle_neutral');
      if (idleIdx === -1) idleIdx = this.animations.findIndex(a => a.name.toLowerCase().includes('idle'));
      this.activeAnimIndex = idleIdx !== -1 ? idleIdx : 0;
      this.activeAnimLoop = true;
      this.playbackTime = 0;
      this.playing = true;
      this.playbackSpeed = 1.0;
      this.stats = data.stats;

      // Dual live-clip crossfade blend state (zero snapping, zero frozen-pose smearing)
      this._restPose = this._capturePose();
      this._prevPoseBuf = null;
      this._redirectFreezeBuf = null;
      this._prevAnimIndex = -1;
      this._prevAnimTime = 0;
      this._prevAnimLoop = true;
      this._prevAnimSpeed = 1.0;
      this._blendElapsed = 0;
      this._blendDuration = 0;
      this._defaultBlendDuration = 0.16;
      this._qTmp = new Float32Array(4);

      // Up to 96 bones supported in vertex uniform array (standard in WebGL2)
      this.boneMatrices = new Float32Array(96 * 16);
      for (let b = 0; b < 96; b++) {
        mat4Identity(this.boneMatrices.subarray(b * 16, (b + 1) * 16));
      }
    }

    _capturePose() {
      return this.nodes.map(n => ({
        t: [n.translation[0], n.translation[1], n.translation[2]],
        r: [n.rotation[0], n.rotation[1], n.rotation[2], n.rotation[3]],
        s: [n.scale[0], n.scale[1], n.scale[2]],
        hasMatrix: !!n.hasMatrix
      }));
    }

    _restoreRestPose() {
      if (!this._restPose) return;
      for (let i = 0; i < this.nodes.length; i++) {
        const rest = this._restPose[i];
        const node = this.nodes[i];
        if (!rest || rest.hasMatrix || node.hasMatrix) continue;
        node.translation[0] = rest.t[0];
        node.translation[1] = rest.t[1];
        node.translation[2] = rest.t[2];
        node.rotation[0] = rest.r[0];
        node.rotation[1] = rest.r[1];
        node.rotation[2] = rest.r[2];
        node.rotation[3] = rest.r[3];
        node.scale[0] = rest.s[0];
        node.scale[1] = rest.s[1];
        node.scale[2] = rest.s[2];
      }
    }

    setAnimation(clipIndexOrName, opts) {
      const resetOnSame = opts && opts.restart === true;
      const blendDur = (opts && typeof opts.blendDuration === 'number') ? opts.blendDuration : this._defaultBlendDuration;
      let targetIdx = -1;

      if (typeof clipIndexOrName === 'number') {
        if (clipIndexOrName >= 0 && clipIndexOrName < this.animations.length) {
          targetIdx = clipIndexOrName;
        }
      } else {
        const raw = String(clipIndexOrName).toLowerCase();
        const query = raw.replace(/[^a-z0-9]/g, '');
        // 1. Exact match (case-insensitive)
        let idx = this.animations.findIndex(a => a.name.toLowerCase() === raw);
        // 2. Normalized alphanumeric exact match
        if (idx === -1) {
          idx = this.animations.findIndex(a => a.name.toLowerCase().replace(/[^a-z0-9]/g, '') === query);
        }
        // 3. Substring match
        if (idx === -1) {
          idx = this.animations.findIndex(a => {
            const norm = a.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            return norm.includes(query) || query.includes(norm);
          });
        }
        if (idx === -1 && (query.includes('idle') || query === 'stand')) {
          idx = this.animations.findIndex(a => a.name.toLowerCase().includes('idle'));
        } else if (idx === -1 && (query.includes('run') || query.includes('sprint') || query.includes('dash') || query.includes('fast'))) {
          idx = this.animations.findIndex(a => a.name.toLowerCase().includes('sprint') || a.name.toLowerCase() === 'run');
        } else if (idx === -1 && (query.includes('walk') || query.includes('jog') || query.includes('step') || query.includes('slow'))) {
          idx = this.animations.findIndex(a => a.name.toLowerCase() === 'walk');
        } else if (idx === -1 && (query.includes('kick') || query.includes('shoot') || query.includes('strike'))) {
          if (query.includes('shoot') && !query.includes('kick')) {
            idx = this.animations.findIndex(a => a.name.toLowerCase().includes('jumpshot') || a.name.toLowerCase().includes('powerstrike'));
          } else {
            idx = this.animations.findIndex(a => a.name.toLowerCase().includes('powerstrike') || a.name.toLowerCase().includes('kick_right') || a.name.toLowerCase().includes('kick'));
          }
        } else if (idx === -1 && (query.includes('roll') || query.includes('slide') || query.includes('tackle'))) {
          idx = this.animations.findIndex(a => a.name.toLowerCase().includes('slidetackle') || a.name.toLowerCase().includes('roll'));
        } else if (idx === -1 && (query.includes('jump') || query.includes('shot'))) {
          idx = this.animations.findIndex(a => a.name.toLowerCase().includes('jumpshot') || a.name.toLowerCase().includes('punch_right'));
        } else if (idx === -1 && (query.includes('dunk') || query.includes('slam'))) {
          idx = this.animations.findIndex(a => a.name.toLowerCase().includes('slamdunk') || a.name.toLowerCase().includes('interact'));
        } else if (idx === -1 && (query.includes('steal') || query.includes('strip'))) {
          idx = this.animations.findIndex(a => a.name.toLowerCase().includes('steal') || a.name.toLowerCase().includes('hitrecieve'));
        } else if (idx === -1 && (query.includes('lowdive') || query.includes('lowsave'))) {
          idx = this.animations.findIndex(a => a.name.toLowerCase().includes('keeperlowdive') || a.name.toLowerCase().includes('keeperdive'));
        } else if (idx === -1 && (query.includes('dive') || query.includes('save') || query.includes('keeper'))) {
          idx = this.animations.findIndex(a => a.name.toLowerCase() === 'anim_ea_keeperdive' || a.name.toLowerCase().includes('keeperdive') || a.name.toLowerCase().includes('kick_left'));
        } else if (idx === -1 && (query.includes('punch') || query.includes('pass'))) {
          idx = this.animations.findIndex(a => a.name.toLowerCase() === 'punch_right');
          if (idx === -1) idx = this.animations.findIndex(a => a.name.toLowerCase().includes('punch'));
        } else if (idx === -1 && (query.includes('wave') || query.includes('celebrat') || query.includes('win') || query.includes('cheer'))) {
          idx = this.animations.findIndex(a => a.name.toLowerCase().includes('celebrat') || a.name.toLowerCase() === 'wave');
        } else if (idx === -1 && (query.includes('hit') || query.includes('hurt') || query.includes('stun'))) {
          idx = this.animations.findIndex(a => a.name.toLowerCase() === 'hitrecieve');
        }
        targetIdx = idx;
      }

      const targetClip = targetIdx !== -1 ? this.animations[targetIdx] : null;
      const defaultLoop = targetClip ? !/kick|shot|dunk|slide|tackle|dive|steal|hit|roll|punch/i.test(targetClip.name) : true;
      const shouldLoop = (opts && typeof opts.loop === 'boolean') ? opts.loop : defaultLoop;

      if (targetIdx !== -1 && (this.activeAnimIndex !== targetIdx || resetOnSame)) {
        if (blendDur > 0.005 && this.activeAnimIndex >= 0 && this.animations[this.activeAnimIndex]) {
          // If interrupting an active crossfade, freeze current live blended pose as bridge
          if (this._blendDuration > 0 && this._blendElapsed < this._blendDuration) {
            this._redirectFreezeBuf = this._capturePose();
          } else {
            this._redirectFreezeBuf = null;
          }
          this._prevAnimIndex = this.activeAnimIndex;
          this._prevAnimTime = this.playbackTime;
          this._prevAnimLoop = this.activeAnimLoop !== false;
          this._prevAnimSpeed = this.playbackSpeed || 1.0;
          this._blendElapsed = 0;
          this._blendDuration = blendDur;
        } else {
          this._redirectFreezeBuf = null;
          this._prevAnimIndex = -1;
          this._blendDuration = 0;
        }
        this.activeAnimIndex = targetIdx;
        this.activeAnimLoop = shouldLoop;
        this.playbackTime = 0;
      } else if (targetIdx !== -1) {
        this.activeAnimLoop = shouldLoop;
      }
    }

    getActiveClipDuration() {
      const a = this.animations[this.activeAnimIndex];
      return a ? a.duration : 1.0;
    }

    update(dt) {
      if (this.animations.length > 0 && this.playing) {
        const currentAnim = this.animations[this.activeAnimIndex];
        const canBlendPrev = this._redirectFreezeBuf || (this._prevAnimIndex >= 0 && this.animations[this._prevAnimIndex]);
        if (this._blendDuration > 0 && canBlendPrev) {
          this._blendElapsed += dt;
          const rawW = Math.min(1, this._blendElapsed / this._blendDuration);
          // Smoothstep ease so transition accelerates and settles organically
          const w = rawW * rawW * (3 - 2 * rawW);
          if (rawW >= 1) {
            this._redirectFreezeBuf = null;
            this._prevAnimIndex = -1;
            this._blendDuration = 0;
            this._restoreRestPose();
            this.playbackTime += dt * this.playbackSpeed;
            if (currentAnim) {
              currentAnim.apply(this.playbackTime, this.nodes, this.activeAnimLoop !== false);
            }
          } else {
            if (!this._prevPoseBuf) this._prevPoseBuf = this._capturePose();
            if (this._redirectFreezeBuf) {
              for (let i = 0; i < this.nodes.length; i++) {
                const s = this._redirectFreezeBuf[i];
                const dst = this._prevPoseBuf[i];
                if (!s || !dst) continue;
                dst.t[0] = s.t[0]; dst.t[1] = s.t[1]; dst.t[2] = s.t[2];
                dst.r[0] = s.r[0]; dst.r[1] = s.r[1]; dst.r[2] = s.r[2]; dst.r[3] = s.r[3];
                dst.s[0] = s.s[0]; dst.s[1] = s.s[1]; dst.s[2] = s.s[2];
              }
            } else {
              // Dual live-clip crossfade: keep advancing outgoing clip so velocity/inertia carries cleanly
              this._prevAnimTime += dt * this._prevAnimSpeed;
              this._restoreRestPose();
              this.animations[this._prevAnimIndex].apply(this._prevAnimTime, this.nodes, this._prevAnimLoop);
              for (let i = 0; i < this.nodes.length; i++) {
                const n = this.nodes[i];
                const dst = this._prevPoseBuf[i];
                if (!dst || n.hasMatrix) continue;
                dst.t[0] = n.translation[0]; dst.t[1] = n.translation[1]; dst.t[2] = n.translation[2];
                dst.r[0] = n.rotation[0]; dst.r[1] = n.rotation[1]; dst.r[2] = n.rotation[2]; dst.r[3] = n.rotation[3];
                dst.s[0] = n.scale[0]; dst.s[1] = n.scale[1]; dst.s[2] = n.scale[2];
              }
            }
            this._restoreRestPose();
            this.playbackTime += dt * this.playbackSpeed;
            if (currentAnim) {
              currentAnim.apply(this.playbackTime, this.nodes, this.activeAnimLoop !== false);
            }
            const qTmp = this._qTmp || (this._qTmp = new Float32Array(4));
            for (let i = 0; i < this.nodes.length; i++) {
              const prev = this._prevPoseBuf[i];
              const node = this.nodes[i];
              if (!prev || node.hasMatrix) continue;
              node.translation[0] = prev.t[0] + (node.translation[0] - prev.t[0]) * w;
              node.translation[1] = prev.t[1] + (node.translation[1] - prev.t[1]) * w;
              node.translation[2] = prev.t[2] + (node.translation[2] - prev.t[2]) * w;
              quatSlerp(qTmp, prev.r, node.rotation, w);
              node.rotation[0] = qTmp[0];
              node.rotation[1] = qTmp[1];
              node.rotation[2] = qTmp[2];
              node.rotation[3] = qTmp[3];
              node.scale[0] = prev.s[0] + (node.scale[0] - prev.s[0]) * w;
              node.scale[1] = prev.s[1] + (node.scale[1] - prev.s[1]) * w;
              node.scale[2] = prev.s[2] + (node.scale[2] - prev.s[2]) * w;
            }
          }
        } else {
          this.playbackTime += dt * this.playbackSpeed;
          if (currentAnim) {
            this._restoreRestPose();
            currentAnim.apply(this.playbackTime, this.nodes, this.activeAnimLoop !== false);
          }
        }
      }

      if (this.onPostAnimate) {
        this.onPostAnimate(this.nodes, this.playbackTime, dt);
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

      const numJoints = Math.min(this.skin.joints.length, 96);
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

    clone() {
      // Instant deep-copy of mutable node graph & bone matrices (geometry, buffers, textures are shared)
      const clonedNodes = this.nodes.map(n => ({
        name: n.name,
        children: n.children ? n.children.slice() : [],
        mesh: n.mesh,
        skin: n.skin,
        translation: n.translation ? [n.translation[0], n.translation[1], n.translation[2]] : [0, 0, 0],
        rotation: n.rotation ? [n.rotation[0], n.rotation[1], n.rotation[2], n.rotation[3]] : [0, 0, 0, 1],
        scale: n.scale ? [n.scale[0], n.scale[1], n.scale[2]] : [1, 1, 1],
        hasMatrix: n.hasMatrix,
        localMatrix: n.localMatrix ? new Float32Array(n.localMatrix) : new Float32Array(16),
        worldMatrix: new Float32Array(16)
      }));

      return new GLBModel({
        nodes: clonedNodes,
        rootNodeIndices: this.rootNodeIndices.slice(),
        primitives: this.primitives,
        skin: this.skin,
        animations: this.animations,
        stats: this.stats
      });
    }
  }

  // --- Master Cache & Synchronous Instant Instantiation ---
  const masterCache = new Map();   // canonicalKey -> Promise<GLBModel>
  const resolvedCache = new Map(); // canonicalKey -> GLBModel

  function normalizeGLBKey(url) {
    if (typeof url !== 'string') return url;
    const clean = url.split('?')[0].split('#')[0];
    return clean.startsWith('/') ? clean : ('/' + clean);
  }

  function getCachedModel(url) {
    const key = normalizeGLBKey(url);
    if (resolvedCache.has(key)) {
      return resolvedCache.get(key).clone();
    }
    return null;
  }

  // Root-relative URLs to ensure preloading succeeds from any subpath (e.g. /benchmark/)
  const PRELOAD_URLS = [
    '/assets/characters/footy10.glb',
    '/assets/characters/hoops23.glb',
    '/assets/characters/keeper1.glb'
  ];

  function preloadAll() {
    if (typeof window !== 'undefined' && typeof fetch === 'function') {
      return Promise.all(PRELOAD_URLS.map(u =>
        loadGLB(u).catch(e => { console.warn('[GLBLoader] Preload error for', u, e); return null; })
      ));
    }
    return Promise.resolve([]);
  }

  // Auto-preload core character models after first tick so initial script parse isn't blocked
  if (typeof setTimeout === 'function') setTimeout(preloadAll, 0);

  // --- Main Loader Function ---

  async function loadGLB(arrayBufferOrUrl) {
    if (typeof arrayBufferOrUrl === 'string') {
      const key = normalizeGLBKey(arrayBufferOrUrl);
      const url = key;
      if (resolvedCache.has(key)) {
        return resolvedCache.get(key).clone();
      }
      if (masterCache.has(key)) {
        const master = await masterCache.get(key);
        return master.clone();
      }
      const p = (async () => {
        const t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        const resp = await fetch(url, { cache: 'force-cache' });
        if (!resp.ok) throw new Error('Failed to load GLB file: ' + resp.status + ' ' + resp.statusText);
        const buf = await resp.arrayBuffer();
        const model = await parseAndBuildModel(buf, t0);
        resolvedCache.set(key, model);
        return model;
      })();
      masterCache.set(key, p);
      const master = await p;
      return master.clone();
    }

    let arrayBuffer = null;
    if (arrayBufferOrUrl instanceof ArrayBuffer) {
      arrayBuffer = arrayBufferOrUrl;
    } else if (arrayBufferOrUrl && arrayBufferOrUrl.buffer instanceof ArrayBuffer) {
      arrayBuffer = arrayBufferOrUrl.buffer.slice(arrayBufferOrUrl.byteOffset, arrayBufferOrUrl.byteOffset + arrayBufferOrUrl.byteLength);
    } else {
      throw new Error('Invalid input to loadGLB: expected URL string or ArrayBuffer');
    }
    const t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    return parseAndBuildModel(arrayBuffer, t0);
  }

  async function parseAndBuildModel(arrayBuffer, t0 = Date.now()) {

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

        // Compute smooth vertex normals if missing
        let finalNormals = normData;
        if (!finalNormals) {
          finalNormals = new Float32Array(posData.length);
          const numTris = indexData.length / 3;
          for (let t = 0; t < numTris; t++) {
            const i0 = indexData[t * 3];
            const i1 = indexData[t * 3 + 1];
            const i2 = indexData[t * 3 + 2];

            const p0x = posData[i0 * 3], p0y = posData[i0 * 3 + 1], p0z = posData[i0 * 3 + 2];
            const p1x = posData[i1 * 3], p1y = posData[i1 * 3 + 1], p1z = posData[i1 * 3 + 2];
            const p2x = posData[i2 * 3], p2y = posData[i2 * 3 + 1], p2z = posData[i2 * 3 + 2];

            const e1x = p1x - p0x, e1y = p1y - p0y, e1z = p1z - p0z;
            const e2x = p2x - p0x, e2y = p2y - p0y, e2z = p2z - p0z;

            // Cross product: e1 x e2
            const nx = e1y * e2z - e1z * e2y;
            const ny = e1z * e2x - e1x * e2z;
            const nz = e1x * e2y - e1y * e2x;

            finalNormals[i0 * 3] += nx; finalNormals[i0 * 3 + 1] += ny; finalNormals[i0 * 3 + 2] += nz;
            finalNormals[i1 * 3] += nx; finalNormals[i1 * 3 + 1] += ny; finalNormals[i1 * 3 + 2] += nz;
            finalNormals[i2 * 3] += nx; finalNormals[i2 * 3 + 1] += ny; finalNormals[i2 * 3 + 2] += nz;
          }
          // Normalize
          const vCount = posData.length / 3;
          for (let v = 0; v < vCount; v++) {
            const nx = finalNormals[v * 3], ny = finalNormals[v * 3 + 1], nz = finalNormals[v * 3 + 2];
            const len = Math.hypot(nx, ny, nz);
            if (len > 0.00001) {
              const inv = 1.0 / len;
              finalNormals[v * 3] = nx * inv;
              finalNormals[v * 3 + 1] = ny * inv;
              finalNormals[v * 3 + 2] = nz * inv;
            } else {
              finalNormals[v * 3 + 1] = 1.0;
            }
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
  exports.getCachedModel = getCachedModel;
  exports.preloadAll = preloadAll;
  exports.parseGLBContainer = parseGLBContainer;
  exports.GLBModel = GLBModel;
});
