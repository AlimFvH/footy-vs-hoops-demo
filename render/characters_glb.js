/**
 * FOOTY vs HOOPS — High-Performance GLB Skinned Character Adapter
 * 
 * Bridges high-fidelity GLB models (with 3D FG boots, PBR materials, and skeletal animations)
 * into the game's MatchView, Scene, and Agent systems.
 * 
 * Supports Football Striker #10, Basketball All-Star #23, and Goalkeeper #1.
 * Fully isolated: if GLB is loading or unavailable, seamlessly falls back to procedural meshes.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define('render/characters_glb', ['exports', 'gfx/scene', 'gfx/math', 'assets/loaders/glb_loader'], factory);
  } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
    factory(exports, require('../js/game').scene || {}, require('../js/game').math || {}, require('../assets/loaders/glb_loader'));
  } else {
    root.CharactersGLB = {};
    factory(root.CharactersGLB, root.Scene || {}, root.Math || {}, root.GLBLoader);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function(exports, sceneModule, mathModule, glbLoaderModule) {
  'use strict';

  const VS_SRC = `#version 300 es
  precision highp float;

  layout(location = 0) in vec3 aPos;
  layout(location = 1) in vec3 aNormal;
  layout(location = 2) in vec2 aUv;
  layout(location = 3) in vec4 aJoints;
  layout(location = 4) in vec4 aWeights;

  uniform mat4 uProj;
  uniform mat4 uView;
  uniform mat4 uModel;
  uniform mat4 uBones[64];
  uniform bool uUseSkinning;

  out vec3 vWorldPos;
  out vec3 vNormal;
  out vec2 vUv;

  void main() {
    vUv = aUv;
    vec4 localPos = vec4(aPos, 1.0);
    vec3 localNorm = aNormal;

    if (uUseSkinning) {
      int j0 = int(aJoints.x);
      int j1 = int(aJoints.y);
      int j2 = int(aJoints.z);
      int j3 = int(aJoints.w);

      mat4 skinMat =
        aWeights.x * uBones[j0] +
        aWeights.y * uBones[j1] +
        aWeights.z * uBones[j2] +
        aWeights.w * uBones[j3];

      localPos = skinMat * localPos;
      localNorm = mat3(skinMat) * localNorm;
    }

    vec4 worldPos = uModel * localPos;
    vWorldPos = worldPos.xyz;
    vNormal = normalize(mat3(uModel) * localNorm);
    gl_Position = uProj * uView * worldPos;
  }`;

  const FS_SRC = `#version 300 es
  precision highp float;

  in vec3 vWorldPos;
  in vec3 vNormal;
  in vec2 vUv;

  uniform vec3 uEye;
  uniform vec3 uSunDir;
  uniform vec3 uSunColor;
  uniform vec3 uSkyColor;
  uniform vec3 uGroundColor;

  uniform vec4 uBaseColor;
  uniform float uRoughness;
  uniform float uMetallic;
  uniform sampler2D uTex;
  uniform bool uHasTex;

  out vec4 fragColor;

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(uEye - vWorldPos);
    vec3 L = normalize(uSunDir);
    vec3 H = normalize(L + V);

    vec4 baseColor = uBaseColor;
    if (uHasTex) {
      baseColor *= texture(uTex, vUv);
    }

    float NdotL = max(dot(N, L), 0.0);
    float NdotV = max(dot(N, V), 0.001);
    float NdotH = max(dot(N, H), 0.0);
    float VdotH = max(dot(V, H), 0.0);

    // Hemispheric Ambient Lighting
    vec3 ambient = mix(uGroundColor, uSkyColor, N.y * 0.5 + 0.5) * baseColor.rgb * 0.85;

    // Direct Sun Diffuse (Lambert)
    vec3 diffuse = baseColor.rgb * uSunColor * NdotL * (1.0 - uMetallic);

    // Specular GGX
    float a = uRoughness * uRoughness;
    float a2 = a * a;
    float denom = (NdotH * NdotH * (a2 - 1.0) + 1.0);
    float D = a2 / (3.14159265 * denom * denom + 0.0001);

    vec3 F0 = mix(vec3(0.04), baseColor.rgb, uMetallic);
    vec3 F = F0 + (1.0 - F0) * pow(1.0 - VdotH, 5.0);

    float k = (uRoughness + 1.0) * (uRoughness + 1.0) / 8.0;
    float G = (NdotV / (NdotV * (1.0 - k) + k)) * (NdotL / (NdotL * (1.0 - k) + k));

    vec3 specular = (D * F * G) / (4.0 * NdotV * NdotL + 0.001) * uSunColor * NdotL * 1.5;

    // Subtle Athletic Rim Light
    float rim = pow(1.0 - NdotV, 3.0) * (1.0 - uRoughness * 0.5);
    vec3 rimLight = rim * vec3(0.35, 0.65, 0.95) * baseColor.rgb * 0.8;

    vec3 finalRgb = ambient + diffuse + specular + rimLight;
    fragColor = vec4(finalRgb, baseColor.a);
  }`;

  // Shared GL State & Cache
  let glProgram = null;
  let glLocations = null;
  const modelCache = new Map(); // url -> Promise<GLBModel>
  const bufferCache = new Map(); // model -> PrimitiveBuffer[]
  const activeMatches = new Set();

  function getLoader() {
    if (glbLoaderModule && glbLoaderModule.loadGLB) return glbLoaderModule;
    if (typeof window !== 'undefined' && window.GLBLoader) return window.GLBLoader;
    return null;
  }

  function initShader(gl) {
    if (glProgram) return;

    function createShader(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        const err = gl.getShaderInfoLog(s);
        gl.deleteShader(s);
        throw new Error('GLB Shader Compile Error: ' + err);
      }
      return s;
    }

    const vs = createShader(gl.VERTEX_SHADER, VS_SRC);
    const fs = createShader(gl.FRAGMENT_SHADER, FS_SRC);
    const p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);

    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      const err = gl.getProgramInfoLog(p);
      gl.deleteProgram(p);
      throw new Error('GLB Shader Link Error: ' + err);
    }

    glProgram = p;
    glLocations = {
      uProj: gl.getUniformLocation(p, 'uProj'),
      uView: gl.getUniformLocation(p, 'uView'),
      uModel: gl.getUniformLocation(p, 'uModel'),
      uBones: gl.getUniformLocation(p, 'uBones[0]'),
      uUseSkinning: gl.getUniformLocation(p, 'uUseSkinning'),
      uEye: gl.getUniformLocation(p, 'uEye'),
      uSunDir: gl.getUniformLocation(p, 'uSunDir'),
      uSunColor: gl.getUniformLocation(p, 'uSunColor'),
      uSkyColor: gl.getUniformLocation(p, 'uSkyColor'),
      uGroundColor: gl.getUniformLocation(p, 'uGroundColor'),
      uBaseColor: gl.getUniformLocation(p, 'uBaseColor'),
      uRoughness: gl.getUniformLocation(p, 'uRoughness'),
      uMetallic: gl.getUniformLocation(p, 'uMetallic'),
      uTex: gl.getUniformLocation(p, 'uTex'),
      uHasTex: gl.getUniformLocation(p, 'uHasTex')
    };
  }

  function getOrCreateBuffers(gl, model) {
    if (bufferCache.has(model)) return bufferCache.get(model);

    const primitiveBuffers = [];
    model.primitives.forEach(prim => {
      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);

      // Positions (loc 0)
      const vboPos = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vboPos);
      gl.bufferData(gl.ARRAY_BUFFER, prim.positions, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

      // Normals (loc 1)
      const vboNorm = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vboNorm);
      gl.bufferData(gl.ARRAY_BUFFER, prim.normals, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

      // UVs (loc 2)
      const vboUv = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vboUv);
      gl.bufferData(gl.ARRAY_BUFFER, prim.uvs, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(2);
      gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);

      // Joints (loc 3)
      let vboJoints = null;
      if (prim.joints) {
        vboJoints = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vboJoints);
        gl.bufferData(gl.ARRAY_BUFFER, prim.joints, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(3);
        gl.vertexAttribPointer(3, 4, gl.FLOAT, false, 0, 0);
      }

      // Weights (loc 4)
      let vboWeights = null;
      if (prim.weights) {
        vboWeights = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vboWeights);
        gl.bufferData(gl.ARRAY_BUFFER, prim.weights, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(4);
        gl.vertexAttribPointer(4, 4, gl.FLOAT, false, 0, 0);
      }

      // Indices
      const ibo = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, prim.indices, gl.STATIC_DRAW);

      gl.bindVertexArray(null);

      // Texture
      let glTexture = null;
      if (prim.material && prim.material.image) {
        glTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, glTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, prim.material.image);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.bindTexture(gl.TEXTURE_2D, null);
      }

      const indexType = (prim.indices instanceof Uint32Array) ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;

      primitiveBuffers.push({
        vao: vao,
        indexCount: prim.indices.length,
        indexType: indexType,
        material: prim.material,
        texture: glTexture,
        isSkinned: prim.isSkinned
      });
    });

    bufferCache.set(model, primitiveBuffers);
    return primitiveBuffers;
  }

  // Model Matrix Generator
  function makeTransformMatrix(out, x, y, z, yaw, scale) {
    const cosY = Math.cos(yaw) * scale;
    const sinY = Math.sin(yaw) * scale;

    out[0] = cosY;  out[4] = 0;      out[8] = sinY;   out[12] = x;
    out[1] = 0;     out[5] = scale;  out[9] = 0;      out[13] = y;
    out[2] = -sinY; out[6] = 0;      out[10] = cosY;  out[14] = z;
    out[3] = 0;     out[7] = 0;      out[11] = 0;     out[15] = 1;
    return out;
  }

  class GLBCharacterInstance {
    constructor(charRef, modelUrl, options = {}) {
      this.charRef = charRef;
      this.agent = charRef.agent;
      this.modelUrl = modelUrl;
      this.model = null;
      this.loaded = false;
      this.failed = false;

      // Visual Placement & Orientation
      this.yaw = 0;
      this.targetYaw = 0;
      this.scale = options.scale || 1.38; // Matches procedural character stature (top of head ≈ 2.48m)
      this.currentAnim = 'idle';
      this.modelMatrix = new Float32Array(16);

      this.loadModel();
    }

    async loadModel() {
      try {
        const loader = getLoader();
        if (!loader) throw new Error('GLBLoader unavailable');

        if (!modelCache.has(this.modelUrl)) {
          modelCache.set(this.modelUrl, loader.loadGLB(this.modelUrl));
        }
        const masterModel = await modelCache.get(this.modelUrl);

        // Clone model instance so this character has independent skeletal animations
        const clone = getLoader().loadGLB ? await loader.loadGLB(this.modelUrl) : masterModel;
        this.model = clone;
        this.loaded = true;

        // Hide procedural body mesh once GLB is loaded (retains selection ring & shadow blob)
        if (this.charRef && this.charRef.pivot) {
          this.charRef.pivot.visible = false;
        }
      } catch (err) {
        console.warn('[CharactersGLB] Model load failed, falling back to procedural:', err);
        this.failed = true;
        if (this.charRef && this.charRef.pivot) {
          this.charRef.pivot.visible = true;
        }
      }
    }

    setAnimation(name, speed = 1.0) {
      if (!this.model) return;
      this.model.playbackSpeed = speed;
      if (this.currentAnim !== name) {
        this.currentAnim = name;
        this.model.setAnimation(name);
      }
    }

    update(dt) {
      if (!this.loaded || !this.model || !this.agent) return;

      const a = this.agent;
      const vx = a.vx || 0;
      const vz = a.vz || 0;
      const speed = Math.hypot(vx, vz);

      // 1. Facing Orientation: Smooth facing interpolation towards velocity or facing direction
      if (typeof a.fx === 'number' && typeof a.fz === 'number' && (a.fx !== 0 || a.fz !== 0)) {
        this.targetYaw = Math.atan2(a.fx, a.fz);
      } else if (speed > 0.3) {
        this.targetYaw = Math.atan2(vx, vz);
      }

      let dy = this.targetYaw - this.yaw;
      while (dy > Math.PI) dy -= Math.PI * 2;
      while (dy < -Math.PI) dy += Math.PI * 2;
      this.yaw += dy * Math.min(1, dt * 14);

      // 2. Animation Track Mapping
      if (a.kickT > 0 || a.shotT > 0) {
        this.setAnimation('kick', 1.3);
      } else if (a.celebrateT > 0) {
        this.setAnimation('celebrate', 1.0);
      } else if (speed > 0.35) {
        const animSpeed = Math.max(0.75, Math.min(1.85, speed / 5.2));
        this.setAnimation('run', animSpeed);
      } else {
        this.setAnimation('idle', 1.0);
      }

      // 3. Step skeletal bones
      this.model.update(dt);

      // 4. Update world transform matrix
      const px = a.x || 0;
      const py = a.y || 0;
      const pz = a.z || 0;
      makeTransformMatrix(this.modelMatrix, px, py, pz, this.yaw, this.scale);
    }
  }

  // --- Public API & Hook Manager ---

  const CharactersGLB = {
    enabled: true,
    instances: new Map(), // matchView -> GLBCharacterInstance[]

    init(gl) {
      if (!gl) return;
      initShader(gl);
    },

    setupMatch(matchView) {
      if (!this.enabled || !matchView || !matchView.chars) return;

      const list = [];
      const mode = matchView.mode;

      matchView.chars.forEach(c => {
        if (!c.agent) return;
        const role = c.agent.role;

        // 1. Football Striker #10
        if (mode === 'footy' && role !== 'keeper') {
          const inst = new GLBCharacterInstance(c, 'assets/characters/footy10.glb', { scale: 1.38 });
          list.push(inst);
        }
        // 2. Football Goalkeeper #1
        else if (mode === 'footy' && role === 'keeper') {
          const inst = new GLBCharacterInstance(c, 'assets/characters/keeper1.glb', { scale: 1.40 });
          list.push(inst);
        }
        // 3. Basketball All-Star #23
        else if (mode === 'hoops') {
          const inst = new GLBCharacterInstance(c, 'assets/characters/hoops23.glb', { scale: 1.42 });
          list.push(inst);
        }
      });

      if (list.length > 0) {
        this.instances.set(matchView, list);
        activeMatches.add(matchView);
      }
    },

    renderMatch(matchView, dt) {
      if (!this.enabled || !matchView || !matchView.renderer) return;
      const list = this.instances.get(matchView);
      if (!list || list.length === 0) return;

      const gl = matchView.renderer.gl;
      if (!gl) return;

      initShader(gl);

      const cam = matchView.rig.cam;
      const scene = matchView.scene;

      // Update character transforms and skeletal animation
      list.forEach(inst => inst.update(dt));

      // Draw all loaded GLB characters
      gl.useProgram(glProgram);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);

      // Set Camera Uniforms
      gl.uniformMatrix4fv(glLocations.uProj, false, cam.proj);
      gl.uniformMatrix4fv(glLocations.uView, false, cam.view);
      gl.uniform3fv(glLocations.uEye, cam.position);

      // Set Lighting Uniforms from Match Scene
      const sunDir = scene.sunDir || [0.35, 0.85, 0.40];
      const sunCol = scene.sunColor || [1.1, 1.05, 0.98];
      const skyCol = scene.sky || [0.22, 0.32, 0.48];
      const gndCol = scene.ground || [0.12, 0.15, 0.20];

      gl.uniform3fv(glLocations.uSunDir, sunDir);
      gl.uniform3fv(glLocations.uSunColor, sunCol);
      gl.uniform3fv(glLocations.uSkyColor, skyCol);
      gl.uniform3fv(glLocations.uGroundColor, gndCol);

      list.forEach(inst => {
        if (!inst.loaded || !inst.model) return;

        const buffers = getOrCreateBuffers(gl, inst.model);
        gl.uniformMatrix4fv(glLocations.uModel, false, inst.modelMatrix);

        const skinActive = !!inst.model.skin;
        gl.uniform1i(glLocations.uUseSkinning, skinActive ? 1 : 0);
        if (skinActive) {
          gl.uniformMatrix4fv(glLocations.uBones, false, inst.model.boneMatrices);
        }

        buffers.forEach(pBuf => {
          gl.bindVertexArray(pBuf.vao);

          const hasTex = !!pBuf.texture;
          gl.uniform1i(glLocations.uHasTex, hasTex ? 1 : 0);
          if (hasTex) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, pBuf.texture);
            gl.uniform1i(glLocations.uTex, 0);
          }

          const baseCol = (pBuf.material && pBuf.material.baseColorFactor) ? pBuf.material.baseColorFactor : [1, 1, 1, 1];
          gl.uniform4fv(glLocations.uBaseColor, baseCol);
          gl.uniform1f(glLocations.uRoughness, pBuf.material ? pBuf.material.roughnessFactor : 0.7);
          gl.uniform1f(glLocations.uMetallic, pBuf.material ? pBuf.material.metallicFactor : 0.0);

          gl.drawElements(gl.TRIANGLES, pBuf.indexCount, pBuf.indexType, 0);
        });

        gl.bindVertexArray(null);
      });

      gl.useProgram(null);
    },

    disposeMatch(matchView) {
      if (this.instances.has(matchView)) {
        this.instances.delete(matchView);
        activeMatches.delete(matchView);
      }
    }
  };

  // --- Automatic Game & MatchView Hook Installation ---
  function installHook() {
    if (typeof window === 'undefined' || !window.require) return;

    try {
      // Expose window.app on App.prototype.init
      const appMod = window.require('app');
      if (appMod && appMod.App) {
        const origInit = appMod.App.prototype.init;
        appMod.App.prototype.init = async function() {
          window.app = this;
          return origInit.call(this);
        };
      }
    } catch (e) {}

    try {
      const matchviewMod = window.require('render/matchview');
      if (matchviewMod && matchviewMod.MatchView) {
        const MV = matchviewMod.MatchView;

        // Wrap MatchView.render: auto-setup on first frame, then render GLB characters
        const origRender = MV.prototype.render;
        MV.prototype.render = function(dt) {
          if (!CharactersGLB.instances.has(this)) {
            try {
              CharactersGLB.setupMatch(this);
            } catch (e) {
              console.warn('[CharactersGLB] Setup match error:', e);
            }
          }
          origRender.call(this, dt);
          try {
            CharactersGLB.renderMatch(this, dt);
          } catch (e) {
            console.warn('[CharactersGLB] Render match error:', e);
          }
        };

        // Wrap MatchView.dispose
        const origDispose = MV.prototype.dispose;
        MV.prototype.dispose = function() {
          try {
            CharactersGLB.disposeMatch(this);
          } catch (e) {}
          origDispose.call(this);
        };

        console.log('[CharactersGLB] Seamless MatchView hooks installed successfully.');
      }
    } catch (err) {
      console.warn('[CharactersGLB] MatchView hook deferred:', err.message);
    }
  }

  if (typeof window !== 'undefined') {
    window.CharactersGLB = CharactersGLB;
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', () => setTimeout(installHook, 50));
    } else {
      setTimeout(installHook, 50);
    }
  }

  exports.CharactersGLB = CharactersGLB;
  exports.GLBCharacterInstance = GLBCharacterInstance;
});
