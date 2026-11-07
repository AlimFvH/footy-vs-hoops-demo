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

    // Crisp Athletic Stadium Rim Contour (High-clarity player silhouette)
    float rim = pow(1.0 - NdotV, 2.4);
    vec3 rimColor = mix(vec3(0.42, 0.78, 1.0), vec3(1.0, 0.92, 0.65), NdotL * 0.5 + 0.5);
    vec3 rimLight = rim * rimColor * (0.50 + (1.0 - uRoughness) * 0.60);

    // Console-grade contrast curve for crisp, vivid athlete details
    vec3 finalRgb = ambient + diffuse + specular + rimLight;
    finalRgb = mix(finalRgb, finalRgb * finalRgb * (3.0 - 2.0 * finalRgb), 0.12);
    fragColor = vec4(finalRgb, baseColor.a);
  }`;

  // Shared GL State & Cache
  let glProgram = null;
  let glLocations = null;
  const modelCache = new Map(); // url -> Promise<GLBModel>
  const bufferCache = new Map(); // model -> PrimitiveBuffer[]
  const activeMatches = new Set();
  const skinTextureCache = new Map();
  // Preload GLB Character Models immediately into memory to eliminate match start lag
  function preloadGLBModels() {
    const loader = getLoader();
    if (!loader || !loader.loadGLB) return;
    const urls = ['assets/characters/footy10.glb', 'assets/characters/hoops23.glb', 'assets/characters/keeper1.glb'];
    urls.forEach(url => {
      if (!modelCache.has(url)) {
        modelCache.set(url, loader.loadGLB(url).catch(e => {
          console.warn('[CharactersGLB] Preload warning for', url, e);
          return null;
        }));
      }
    });
  }
  if (typeof setTimeout === 'function') setTimeout(preloadGLBModels, 50);
 // key -> WebGLTexture

  function hexToRgb(h) {
    if (typeof h === 'string') {
      if (h.startsWith('#')) h = parseInt(h.slice(1), 16);
      else if (h.startsWith('0x')) h = parseInt(h, 16);
      else h = parseInt(h, 16);
    }
    if (typeof h !== 'number' || isNaN(h)) return null;
    return [(h >> 16) & 255, (h >> 8) & 255, h & 255];
  }

  function hexToVec3(h, fallback = [1, 1, 1]) {
    const rgb = hexToRgb(h);
    if (!rgb) return fallback;
    return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255];
  }

  function drawGlbJerseyPattern(ctx, W, H, isFooty, skinId, skin) {
    if (!skinId) return;
    try {
      ctx.save();
      const pCol = skin && skin.primary ? (typeof skin.primary === 'number' ? '#' + skin.primary.toString(16).padStart(6, '0') : skin.primary) : (isFooty ? '#00f0ff' : '#f97316');
      const sCol = skin && skin.secondary ? (typeof skin.secondary === 'number' ? '#' + skin.secondary.toString(16).padStart(6, '0') : skin.secondary) : '#ffffff';
      const accCol = skin && skin.accent ? (typeof skin.accent === 'number' ? '#' + skin.accent.toString(16).padStart(6, '0') : skin.accent) : '#facc15';

      const sId = String(skinId).toLowerCase();
      let rarity = 'common';
      if (sId.includes('gold') || sId.includes('cyber') || sId.includes('phantom') || sId.includes('championship') || sId.includes('matrix') || sId.includes('premium')) {
        rarity = 'legendary';
      } else if (sId.includes('solar') || sId.includes('shadow') || sId.includes('electric') || sId.includes('crimson_elite') || sId.includes('golden_state') || sId.includes('cyber_dunk') || sId.includes('stealth') || sId.includes('astronaut') || sId.includes('mars')) {
        rarity = 'epic';
      } else if (sId.includes('neon') || sId.includes('frost') || sId.includes('royal') || sId.includes('hydro') || sId.includes('street') || sId.includes('splash') || sId.includes('sunset')) {
        rarity = 'rare';
      }

      const frontCX = W * 0.25;
      const backCX = W * 0.75;
      const topY = H * 0.09;
      const hH = H * 0.34;

      [frontCX, backCX].forEach((cx, idx) => {
        const isFront = (idx === 0);
        ctx.save();
        ctx.beginPath();
        ctx.rect(cx - W * 0.13, topY, W * 0.26, hH);
        ctx.clip();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.90;

        // --- RARITY-BASED HIGH-DETAIL JERSEY PATTERNS ---

        if (rarity === 'legendary') {
          // CHAMPIONSHIP GOLD / CYBER MATRIX / PHANTOM BLACK
          // Royal Gold Sash with metallic borders
          const grad = ctx.createLinearGradient(cx - W * 0.11, topY, cx + W * 0.11, topY + hH);
          grad.addColorStop(0, '#fef08a');
          grad.addColorStop(0.5, '#f59e0b');
          grad.addColorStop(1, '#b45309');
          ctx.strokeStyle = grad;
          ctx.lineWidth = W * 0.048;
          ctx.beginPath();
          ctx.moveTo(cx - W * 0.11, topY);
          ctx.lineTo(cx + W * 0.11, topY + hH);
          ctx.stroke();

          // Gold border pinstripes
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Cyber / Circuit geometric tracery
          if (sId.includes('cyber') || sId.includes('matrix')) {
            ctx.strokeStyle = '#22d3ee';
            ctx.lineWidth = 3.0;
            ctx.beginPath();
            ctx.moveTo(cx - W * 0.08, topY + hH * 0.25);
            ctx.lineTo(cx, topY + hH * 0.45);
            ctx.lineTo(cx + W * 0.08, topY + hH * 0.25);
            ctx.moveTo(cx - W * 0.08, topY + hH * 0.55);
            ctx.lineTo(cx, topY + hH * 0.75);
            ctx.lineTo(cx + W * 0.08, topY + hH * 0.55);
            ctx.stroke();
          }

          // Gold Crown emblem in center
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(cx, topY + hH * 0.38, W * 0.024, 0, Math.PI * 2);
          ctx.fill();
        } else if (rarity === 'epic') {
          // ELECTRIC BLUE / SOLAR FLARE / STEALTH SHADOW
          // High-voltage lightning / angled chevron panels
          const eGrad = ctx.createLinearGradient(cx - W * 0.1, topY, cx + W * 0.1, topY + hH);
          eGrad.addColorStop(0, pCol);
          eGrad.addColorStop(1, sCol);
          ctx.fillStyle = eGrad;

          ctx.beginPath();
          ctx.moveTo(cx - W * 0.10, topY + hH * 0.15);
          ctx.lineTo(cx, topY + hH * 0.38);
          ctx.lineTo(cx + W * 0.10, topY + hH * 0.15);
          ctx.lineTo(cx + W * 0.10, topY + hH * 0.26);
          ctx.lineTo(cx, topY + hH * 0.49);
          ctx.lineTo(cx - W * 0.10, topY + hH * 0.26);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = accCol;
          ctx.lineWidth = 3.2;
          ctx.stroke();
        } else if (rarity === 'rare') {
          // NEON STRIKER / FROST GIANT / ROYAL STRIKER
          if (sId.includes('stripes') || sId.includes('royal')) {
            ctx.fillStyle = sCol;
            const sw = W * 0.024;
            ctx.fillRect(cx - sw * 2.2, topY, sw, hH);
            ctx.fillRect(cx - sw * 0.5, topY, sw, hH);
            ctx.fillRect(cx + sw * 1.2, topY, sw, hH);
            ctx.strokeStyle = accCol;
            ctx.lineWidth = 2.0;
            ctx.strokeRect(cx - sw * 2.2, topY, sw, hH);
            ctx.strokeRect(cx - sw * 0.5, topY, sw, hH);
            ctx.strokeRect(cx + sw * 1.2, topY, sw, hH);
          } else {
            // Dynamic diagonal sash
            ctx.strokeStyle = sCol;
            ctx.lineWidth = W * 0.038;
            ctx.beginPath();
            ctx.moveTo(cx - W * 0.10, topY);
            ctx.lineTo(cx + W * 0.10, topY + hH);
            ctx.stroke();
            ctx.strokeStyle = accCol;
            ctx.lineWidth = 2.5;
            ctx.stroke();
          }
        } else {
          // COMMON: Clean athletic cut with contrast collar trim & subtle federation pinstripes
          ctx.strokeStyle = 'rgba(255,255,255,0.4)';
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          ctx.moveTo(cx - W * 0.07, topY); ctx.lineTo(cx - W * 0.07, topY + hH);
          ctx.moveTo(cx + W * 0.07, topY); ctx.lineTo(cx + W * 0.07, topY + hH);
          ctx.stroke();
        }

        // 2. Club Crest & Athlete Number Detailing
        if (isFront) {
          // Official Club Crest on left chest
          ctx.fillStyle = accCol;
          ctx.beginPath();
          ctx.arc(cx - W * 0.052, topY + hH * 0.28, W * 0.016, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // High-visibility athlete number (#10 for Footy, #23 for Hoops)
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold ' + Math.round(W * 0.040) + 'px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = 'rgba(0,0,0,0.85)';
          ctx.shadowBlur = 6;
          ctx.fillText(isFooty ? '10' : '23', cx, topY + hH * 0.56);
          ctx.shadowBlur = 0;
        } else {
          // Back: Large athlete number (#10 / #23)
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold ' + Math.round(W * 0.072) + 'px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = 'rgba(0,0,0,0.85)';
          ctx.shadowBlur = 8;
          ctx.fillText(isFooty ? '10' : '23', cx, topY + hH * 0.50);
          ctx.shadowBlur = 0;
        }

        ctx.restore();
      });
      ctx.restore();
    } catch (e) {
      console.warn('drawGlbJerseyPattern error', e);
    }
  }
  function getOrCreateSkinTexture(gl, model, skin, isFooty) {
    if (!gl || !model || !skin || !skin.id) return null;
    const defSkin = isFooty ? 'skin_rookie' : 'skin_solar';
    if (skin.id === defSkin) return null; // Default texture matches default athlete uniform

    const key = (isFooty ? 'footy_' : 'hoops_') + skin.id + '_' + (skin.primary || 0);
    if (skinTextureCache.has(key)) {
      return skinTextureCache.get(key);
    }

    if (!model.primitives || model.primitives.length === 0) return null;
    const primWithImg = model.primitives.find(p => p.material && p.material.image && (p.material.image.naturalWidth || p.material.image.width));
    if (!primWithImg) return null;
    const srcImg = primWithImg.material.image;

    try {
      const cvs = document.createElement('canvas');
      const W = srcImg.naturalWidth || srcImg.width || 1024;
      const H = srcImg.naturalHeight || srcImg.height || 1024;
      cvs.width = W;
      cvs.height = H;
      const ctx = cvs.getContext('2d');
      ctx.drawImage(srcImg, 0, 0);

      const imgData = ctx.getImageData(0, 0, W, H);
      const data = imgData.data;

      const pCol = hexToRgb(skin.primary) || (isFooty ? [0, 200, 255] : [255, 107, 0]);
      const sCol = hexToRgb(skin.secondary) || (isFooty ? [10, 30, 63] : [20, 21, 26]);
      const shCol = hexToRgb(skin.shorts) || sCol;
      const accCol = hexToRgb(skin.accent) || [255, 255, 255];
      const bCol = hexToRgb(skin.boots) || pCol;

      if (isFooty) {
        // Striker #10 Texture Recoloring
        for (let y = 0; y < H; y++) {
          const v = y / H;
          for (let x = 0; x < W; x++) {
            const u = x / W;
            const idx = (y * W + x) * 4;
            const r = data[idx], g = data[idx + 1], b = data[idx + 2];

            // 1. Jersey (Front u < 0.5 & Back u >= 0.5, v < 0.5)
            if (v < 0.5) {
              // Blue jersey fabric (leave white chevron and gold collar trim and white #10 intact)
              if (b > 120 && b > r + 35 && b > g - 25) {
                const lum = (r * 0.15 + g * 0.35 + b * 0.5) / 165.0;
                data[idx] = Math.min(255, Math.max(0, Math.round(pCol[0] * lum)));
                data[idx + 1] = Math.min(255, Math.max(0, Math.round(pCol[1] * lum)));
                data[idx + 2] = Math.min(255, Math.max(0, Math.round(pCol[2] * lum)));
              }
            }
            // 2. Shorts (u < 0.5, 0.5 <= v < 0.75)
            else if (u < 0.5 && v < 0.75) {
              // White fabric
              if (r > 200 && g > 200 && b > 200) {
                const lum = (r * 0.3 + g * 0.59 + b * 0.11) / 250.0;
                data[idx] = Math.min(255, Math.max(0, Math.round(shCol[0] * lum)));
                data[idx + 1] = Math.min(255, Math.max(0, Math.round(shCol[1] * lum)));
                data[idx + 2] = Math.min(255, Math.max(0, Math.round(shCol[2] * lum)));
              }
              // Cyan side stripe
              else if (b > 180 && r < 100) {
                data[idx] = accCol[0];
                data[idx + 1] = accCol[1];
                data[idx + 2] = accCol[2];
              }
            }
            // 3. Socks & Limbs (u < 0.5, v >= 0.75)
            else if (u < 0.5 && v >= 0.75) {
              // Cyan sock stripes (r < 100, b > 160)
              if (b > 160 && r < 100) {
                const lum = b / 240.0;
                data[idx] = Math.min(255, Math.max(0, Math.round(pCol[0] * lum)));
                data[idx + 1] = Math.min(255, Math.max(0, Math.round(pCol[1] * lum)));
                data[idx + 2] = Math.min(255, Math.max(0, Math.round(pCol[2] * lum)));
              }
            }
            // 4. Cleats / Boots (u >= 0.5, v >= 0.75)
            else if (u >= 0.5 && v >= 0.75) {
              // Cyan upper boot body
              if (b > 160 && r < 100) {
                const lum = b / 235.0;
                data[idx] = Math.min(255, Math.max(0, Math.round(bCol[0] * lum)));
                data[idx + 1] = Math.min(255, Math.max(0, Math.round(bCol[1] * lum)));
                data[idx + 2] = Math.min(255, Math.max(0, Math.round(bCol[2] * lum)));
              }
            }
            // Face & hair (u >= 0.5, 0.5 <= v < 0.75) left untouched
          }
        }
      } else {
        // All-Star #23 Texture Recoloring
        for (let y = 0; y < H; y++) {
          const v = y / H;
          for (let x = 0; x < W; x++) {
            const u = x / W;
            const idx = (y * W + x) * 4;
            const r = data[idx], g = data[idx + 1], b = data[idx + 2];

            // 1. Jersey (Front & Back, v < 0.5)
            if (v < 0.5) {
              // Orange jersey fabric (leave white piping, white wordmark and #23 number intact)
              if (r > 150 && r > b + 60) {
                const lum = (r * 0.5 + g * 0.4 + b * 0.1) / 180.0;
                data[idx] = Math.min(255, Math.max(0, Math.round(pCol[0] * lum)));
                data[idx + 1] = Math.min(255, Math.max(0, Math.round(pCol[1] * lum)));
                data[idx + 2] = Math.min(255, Math.max(0, Math.round(pCol[2] * lum)));
              }
              // Flank panels (dark)
              else if (r < 40 && g < 40 && b < 45 && !(r === g && g === b && r > 200)) {
                const lum = (r + g + b) / 90.0;
                data[idx] = Math.min(255, Math.max(0, Math.round(sCol[0] * lum)));
                data[idx + 1] = Math.min(255, Math.max(0, Math.round(sCol[1] * lum)));
                data[idx + 2] = Math.min(255, Math.max(0, Math.round(sCol[2] * lum)));
              }
            }
            // 2. Shorts (u < 0.5, v >= 0.5)
            else if (u < 0.5 && v >= 0.5) {
              // Orange shorts fabric
              if (r > 150 && r > b + 60) {
                const lum = (r * 0.5 + g * 0.4 + b * 0.1) / 180.0;
                data[idx] = Math.min(255, Math.max(0, Math.round(shCol[0] * lum)));
                data[idx + 1] = Math.min(255, Math.max(0, Math.round(shCol[1] * lum)));
                data[idx + 2] = Math.min(255, Math.max(0, Math.round(shCol[2] * lum)));
              }
              // Side panels
              else if (r < 40 && g < 40 && b < 45) {
                const lum = (r + g + b) / 90.0;
                data[idx] = Math.min(255, Math.max(0, Math.round(sCol[0] * lum)));
                data[idx + 1] = Math.min(255, Math.max(0, Math.round(sCol[1] * lum)));
                data[idx + 2] = Math.min(255, Math.max(0, Math.round(sCol[2] * lum)));
              }
            }
            // Face, hair, arms (u >= 0.5, v >= 0.5) left untouched
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);

      const skinTex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, skinTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cvs);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.bindTexture(gl.TEXTURE_2D, null);

      skinTextureCache.set(key, skinTex);
      return skinTex;
    } catch (err) {
      console.warn('[CharactersGLB] Error generating skin texture:', err);
      return null;
    }
  }

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

  // 3D Model Matrix Generator with Yaw, Pitch, Roll & Scaling (supports non-uniform sx, sy, sz)
  function makeTransformMatrix(out, x, y, z, yaw, sx, sy, sz, pitch = 0, roll = 0) {
    if (sy === undefined) { sy = sx; sz = sx; }
    const cy = Math.cos(yaw), sy_ = Math.sin(yaw);
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    const cr = Math.cos(roll), sr = Math.sin(roll);

    out[0] = (cy * cr + sy_ * sp * sr) * sx;
    out[1] = (cp * sr) * sx;
    out[2] = (-sy_ * cr + cy * sp * sr) * sx;
    out[3] = 0;

    out[4] = (-cy * sr + sy_ * sp * cr) * sy;
    out[5] = (cp * cr) * sy;
    out[6] = (sy_ * sr + cy * sp * cr) * sy;
    out[7] = 0;

    out[8] = (sy_ * cp) * sz;
    out[9] = (-sp) * sz;
    out[10] = (cy * cp) * sz;
    out[11] = 0;

    out[12] = x;
    out[13] = y;
    out[14] = z;
    out[15] = 1;
    return out;
  }

  class GLBCharacterInstance {
    constructor(charRef, modelUrl, options = {}) {
      this.charRef = charRef;
      this.agent = charRef.agent;
      this.modelUrl = modelUrl;
      this.matchView = options.matchView || null;
      this.model = null;
      this.loaded = false;
      this.failed = false;
      this.skin = options.skin || (charRef ? charRef.skin : null);
      this.isFooty = options.isFooty !== undefined ? options.isFooty : true;
      this.isKeeper = !!options.isKeeper;
      this.customTexture = null;

      // Hide procedural body mesh immediately to prevent old blocky characters from flashing
      if (this.charRef && this.charRef.pivot) {
        this.charRef.pivot.visible = false;
      }

      // Visual Placement & Orientation
      this.yaw = 0;
      this.targetYaw = 0;
      this.pitch = 0;
      this.roll = 0;
      this.elevationLift = 0;
      // Athletic, calibrated player scale (fits comfortably in goal & under rim)
      this.scale = options.scale || 1.76;
      this.currentAnim = 'idle';
      this.modelMatrix = new Float32Array(16);

      // Instant Synchronous Cache Check
      const loader = getLoader();
      if (loader && loader.getCachedModel) {
        const cached = loader.getCachedModel(this.modelUrl);
        if (cached) {
          this.model = cached;
          this.loaded = true;
        }
      }

      if (!this.loaded) {
        this.loadModel();
      }
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
        const clone = masterModel ? (masterModel.clone ? masterModel.clone() : masterModel) : (loader.loadGLB ? await loader.loadGLB(this.modelUrl) : null);
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

      // Smart Animation Clip Resolution for High-Performance GLB Skeletons
      let targetClip = name;
      const lower = String(name).toLowerCase();
      if (lower === 'kick' || lower === 'shot' || lower === 'shoot') {
        targetClip = 'Kick_Right';
      } else if (lower === 'celebrate' || lower === 'wave' || lower === 'win') {
        targetClip = 'Wave';
      } else if (lower === 'tackle' || lower === 'slide' || lower === 'roll') {
        targetClip = 'Roll';
      } else if (lower === 'run') {
        targetClip = 'Run';
      } else if (lower === 'walk') {
        targetClip = 'Walk';
      } else if (lower === 'idle') {
        targetClip = 'Idle';
      }

      if (this.currentAnim !== targetClip) {
        this.currentAnim = targetClip;
        this.model.setAnimation(targetClip);
      }
    }

    update(dt) {
      if (!this.loaded || !this.model || !this.agent) return;

      // Keep skin visuals strictly updated with equipped character loadout
      if (this.charRef && this.charRef.skin && this.charRef.skin !== this.skin) {
        this.skin = this.charRef.skin;
        this.customTexture = null;
      }

      const a = this.agent;
      const vx = a.vx || 0;
      const vz = a.vz || 0;
      const speed = Math.hypot(vx, vz);

      // 1. Rock-Solid Facing Orientation (Fixes opponent wobbling/shaking):
      // Only adjust facing when intention or speed has clear non-zero magnitude
      const fMag = (typeof a.fx === 'number' && typeof a.fz === 'number') ? Math.hypot(a.fx, a.fz) : 0;
      if (fMag > 0.18) {
        this.targetYaw = Math.atan2(a.fx, a.fz);
      } else if (speed > 0.40) {
        this.targetYaw = Math.atan2(vx, vz);
      }

      let dy = this.targetYaw - this.yaw;
      while (dy > Math.PI) dy -= Math.PI * 2;
      while (dy < -Math.PI) dy += Math.PI * 2;

      // Angular deadband: eliminate small floating point jitter
      if (Math.abs(dy) < 0.04) {
        dy = 0;
      }
      this.yaw += dy * Math.min(1, dt * 8.5);

      // 2. Realistic Dynamic Animation Track Mapping & Kinematics
      this.pitch = 0;
      this.roll = 0;
      this.elevationLift = 0;

      const isBallCarrier = Boolean(
        this.matchView &&
        this.matchView.sim &&
        this.matchView.sim.ball &&
        this.matchView.sim.ball.owner === a
      );

      // Strict Mode Distinction: Any player in basketball match plays BASKETBALL with hands!
      const isBasketballMode = Boolean(this.matchView && this.matchView.mode === 'hoops');

      // ==========================================
      // A. BASKETBALL MATCH ACTIONS (100% HANDS, NO FOOT KICKS!)
      // ==========================================
      if (isBasketballMode) {
        // 1. Explosive Slam Dunk Sequence (Airborne 2-hand/1-hand rim slam)
        if (a.dunk && a.dunk.active) {
          const dk = a.dunk;
          const dunkProgress = Math.min(1, Math.max(0, dk.t / (dk.dur || 0.65)));
          // Calibrated parabolic jump arc reaching rim height (3.05m)
          this.elevationLift = Math.sin(dunkProgress * Math.PI) * 0.98;
          this.pitch = 0.28 * (1 - dunkProgress * 0.7); // Athletic forward airborne attack
          // Overhead one-handed slam down into rim
          this.setAnimation('Punch_Right', 2.0);
        }
        // 2. Jump Shot Elevation & Release (Overhead wrist flick with elevation)
        else if (a.shotT > 0) {
          const shotProgress = Math.min(1, Math.max(0, 1 - a.shotT / 0.5));
          this.elevationLift = Math.sin(shotProgress * Math.PI) * 0.65;
          this.pitch = -0.08; // High elevation arch
          this.setAnimation('Punch_Right', 1.8);
        }
        // 3. Passing in Basketball (Chest pass / push pass - NO KICKING!)
        else if (a.kickT > 0) {
          this.pitch = 0.12;
          this.setAnimation('Punch_Right', 2.2);
        }
        // 4. Interception Lunge / Hand Steal
        else if (a.tackle && (a.tackle.phase === 'lunge' || a.tackle.phase === 'charge')) {
          this.pitch = 0.18;
          this.setAnimation('Punch_Left', 1.8);
        }
        // 5. Celebration Wave
        else if (a.celebrateT > 0) {
          this.setAnimation('Wave', 1.25);
        }
        // 6. Basketball Dribbling (Athletic crouch protecting the ball with hand bounce)
        else if (isBallCarrier) {
          if (speed > 0.3) {
            const sprintCadence = Math.max(1.1, Math.min(2.2, speed / 3.0));
            this.setAnimation('Run', sprintCadence);
            this.pitch = 0.14; // Athletic forward crouch protecting the ball
          } else {
            this.setAnimation('Idle', 1.0);
            this.pitch = 0.12; // Ready triple-threat stance
          }
        }
        // 7. Outfield running / walking / idle
        else if (speed > 1.8) {
          const sprintCadence = Math.max(0.95, Math.min(2.1, speed / 3.4));
          this.setAnimation('Run', sprintCadence);
        } else if (speed > 0.25) {
          const walkCadence = Math.max(0.85, Math.min(1.6, speed / 1.5));
          this.setAnimation('Walk', walkCadence);
        } else {
          this.setAnimation('Idle', 1.0);
        }
      }
      // ==========================================
      // B. FOOTBALL (SOCCER) MATCH ACTIONS
      // ==========================================
      else {
        // 1. Goalkeeper Dynamic Parrying Dives & Aerial Saves
        if (a.role === 'keeper' && a.diveT > 0) {
          const diveProg = Math.max(0, Math.min(1, 1 - a.diveT / 0.42));
          const diveArc = Math.sin(diveProg * Math.PI);
          const diveDir = a.diveDir || (a.aiTargetX !== undefined && a.aiTargetX >= a.x ? 1 : 1);
          this.roll = -diveDir * (1.15 + 0.3 * diveArc);
          this.elevationLift = 0.55 * diveArc;
          this.pitch = 0.15 * diveArc;
          this.setAnimation('Roll', 1.7);
        }
        else if (a.role === 'keeper' && a.jumpT > 0) {
          const jumpProg = Math.max(0, Math.min(1, 1 - a.jumpT / 0.5));
          this.elevationLift = Math.sin(jumpProg * Math.PI) * 0.90;
          this.pitch = -0.10;
          this.setAnimation('Punch_Right', 2.0);
        }
        // 2. High-Impact Dynamic Soccer Strike / Shot
        else if (a.kickT > 0 || a.shotT > 0) {
          const timer = a.kickT || a.shotT || 0;
          this.pitch = 0.22 * Math.sin(timer * 12); // Clean torso drive into strike
          this.setAnimation('Kick_Right', 1.9);
        }
        // 3. Sliding Tackle / Interception Dive
        else if (a.tackle && (a.tackle.phase === 'lunge' || a.tackle.phase === 'charge')) {
          this.setAnimation('Roll', 1.6);
        }
        // 4. Celebration Wave
        else if (a.celebrateT > 0) {
          this.setAnimation('Wave', 1.2);
        }
        // 5. Sprinting (Stable upright posture, zero side wobbling)
        else if (speed > 1.8) {
          const sprintCadence = Math.max(0.95, Math.min(2.1, speed / 3.4));
          this.setAnimation('Run', sprintCadence);
        }
        // 6. Tactical jog / walking
        else if (speed > 0.25) {
          const walkCadence = Math.max(0.85, Math.min(1.6, speed / 1.5));
          this.setAnimation('Walk', walkCadence);
        }
        // 7. Idle
        else {
          this.setAnimation('Idle', 1.0);
        }
      }

      // 3. Step skeletal bones
      this.model.update(dt);

      // 4. Update world transform matrix with 3D lean, jump elevation, and athletic width
      const px = a.x || 0;
      const py = (a.y || 0) + this.elevationLift;
      const pz = a.z || 0;
      // Muscular, broader athletic torso and shoulders for football players
      const sx = this.isFooty ? (this.scale * 1.15) : this.scale;
      const sy = this.scale;
      const sz = this.isFooty ? (this.scale * 1.10) : this.scale;
      makeTransformMatrix(this.modelMatrix, px, py, pz, this.yaw, sx, sy, sz, this.pitch, this.roll);
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
      const playerChar = matchView.playerChar || 'footy';
      const oppChar = matchView.oppChar || (playerChar === 'footy' ? 'hoops' : 'footy');

      matchView.chars.forEach(c => {
        if (!c.agent) return;
        // Eliminate old character flash on kickoff
        if (c.pivot) {
          c.pivot.visible = false;
        }

        const role = c.agent.role;
        const isKeeper = (role === 'keeper');
        const isTeam0 = (c.agent.team === 0);

        // Core FOOTY vs HOOPS Rivalry: Football Striker vs Basketball All-Star
        const charSport = isKeeper ? 'footy' : (c.sport || (isTeam0 ? playerChar : oppChar));

        // 1. Goalkeeper in goal (Goalkeeper #1) - scale 1.82 (athletic keeper, fits perfectly in 2.5m goal)
        if (isKeeper) {
          const inst = new GLBCharacterInstance(c, 'assets/characters/keeper1.glb', {
            scale: 1.82,
            skin: c.skin,
            isFooty: true,
            isKeeper: true,
            matchView
          });
          list.push(inst);
        }
        // 2. Football Athlete (Striker #10) - scale 1.76 (balanced athletic forward)
        else if (charSport === 'footy') {
          const inst = new GLBCharacterInstance(c, 'assets/characters/footy10.glb', {
            scale: 1.76,
            skin: c.skin,
            isFooty: true,
            isKeeper: false,
            matchView
          });
          list.push(inst);
        }
        // 3. Basketball Athlete (All-Star #23) - scale 1.82 (athletic basketball guard/forward)
        else {
          const inst = new GLBCharacterInstance(c, 'assets/characters/hoops23.glb', {
            scale: 1.82,
            skin: c.skin,
            isFooty: false,
            isKeeper: false,
            matchView
          });
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

        // Lazy-generate custom skin texture if equipped with an alternative skin
        if (!inst.customTexture && inst.skin && !inst.isKeeper) {
          inst.customTexture = getOrCreateSkinTexture(gl, inst.model, inst.skin, inst.isFooty);
        }

        const buffers = getOrCreateBuffers(gl, inst.model);
        gl.uniformMatrix4fv(glLocations.uModel, false, inst.modelMatrix);

        const skinActive = !!inst.model.skin;
        gl.uniform1i(glLocations.uUseSkinning, skinActive ? 1 : 0);
        if (skinActive) {
          gl.uniformMatrix4fv(glLocations.uBones, false, inst.model.boneMatrices);
        }

        buffers.forEach(pBuf => {
          gl.bindVertexArray(pBuf.vao);

          const matName = (pBuf.material && pBuf.material.name) ? pBuf.material.name : '';
          let baseCol = (pBuf.material && pBuf.material.baseColorFactor) ? pBuf.material.baseColorFactor.slice() : [1, 1, 1, 1];
          let bindTex = inst.customTexture || pBuf.texture;
          let useTex = !!bindTex;

          // Dynamic 3D PBR Kit Tinting & Texture Assignment based on equipped uniform
          if (inst.skin && !inst.isKeeper) {
            const sk = inst.skin;
            if (matName === 'LightBlue') {
              // Jersey / Shirt primitive
              if (sk.primary !== undefined) {
                const pRgb = hexToVec3(sk.primary);
                baseCol = [pRgb[0], pRgb[1], pRgb[2], 1.0];
              }
              // When custom texture with patterns is present use it, otherwise render pure saturated jersey color
              if (!inst.customTexture) {
                useTex = false;
              }
            } else if (matName === 'White') {
              // Shorts & Socks primitive
              const shColor = (sk.shorts !== undefined) ? sk.shorts : ((sk.secondary !== undefined) ? sk.secondary : (inst.isFooty ? 0x0a1e3f : 0x14151a));
              const shRgb = hexToVec3(shColor);
              baseCol = [shRgb[0], shRgb[1], shRgb[2], 1.0];
              if (!inst.customTexture) {
                useTex = false;
              }
            } else if (matName === 'Red_Dark') {
              // Cleats / Boots primitive
              const bColor = (sk.boots !== undefined) ? sk.boots : (sk.primary !== undefined ? sk.primary : (inst.isFooty ? 0x00c8ff : 0xff6b00));
              const bRgb = hexToVec3(bColor);
              baseCol = [bRgb[0], bRgb[1], bRgb[2], 1.0];
              if (!inst.customTexture) {
                useTex = false;
              }
            } else if (matName === 'Skin' || matName === 'Skin_Darker' || matName === 'LightBrown') {
              // Athlete skin tone
              if (sk.skin) {
                const sRgb = hexToVec3(sk.skin);
                baseCol = [sRgb[0] * 1.05, sRgb[1] * 1.05, sRgb[2] * 1.05, 1.0];
              }
            } else if (matName === 'Hair') {
              // Athlete hair color
              if (sk.hair) {
                const hRgb = hexToVec3(sk.hair);
                baseCol = [hRgb[0], hRgb[1], hRgb[2], 1.0];
                useTex = false;
              }
            }
          } else if (inst.isKeeper) {
            // High-visibility Goalkeeper uniform
            if (matName === 'LightBlue') {
              baseCol = [0.17, 0.85, 0.42, 1.0]; // Vibrant neon keeper green
              useTex = false;
            } else if (matName === 'White') {
              baseCol = [0.04, 0.23, 0.11, 1.0]; // Dark forest green keeper shorts
              useTex = false;
            } else if (matName === 'Red_Dark') {
              baseCol = [0.10, 0.95, 0.50, 1.0]; // Neon keeper boots
              useTex = false;
            }
          }

          gl.uniform1i(glLocations.uHasTex, useTex ? 1 : 0);
          if (useTex && bindTex) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, bindTex);
            gl.uniform1i(glLocations.uTex, 0);
          }

          gl.uniform4fv(glLocations.uBaseColor, baseCol);

          // 3D PBR Material tuning based on equipped skin
          let roughness = pBuf.material ? pBuf.material.roughnessFactor : 0.7;
          let metallic = pBuf.material ? pBuf.material.metallicFactor : 0.0;
          if (inst.skin && inst.skin.id) {
            const skId = inst.skin.id;
            if (skId.includes('gold') || skId.includes('championship')) {
              metallic = 0.65;
              roughness = 0.28;
            } else if (skId.includes('neon') || skId.includes('cyber')) {
              metallic = 0.35;
              roughness = 0.38;
            } else if (skId.includes('frost')) {
              metallic = 0.20;
              roughness = 0.30;
            }
          }
          gl.uniform1f(glLocations.uRoughness, roughness);
          gl.uniform1f(glLocations.uMetallic, metallic);

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
