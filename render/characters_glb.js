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
  uniform mat4 uBones[96];
  uniform bool uUseSkinning;

  uniform float uRunPhase;
  uniform float uRunSpeed;
  uniform float uKickPhase;

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
  uniform float uMatRole;
  uniform sampler2D uTex;
  uniform bool uHasTex;

  out vec4 fragColor;

  vec3 acesFilm(vec3 x) {
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;
    return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
  }

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(uEye - vWorldPos);
    vec3 L = normalize(uSunDir);
    vec3 H = normalize(L + V);

    // Secondary cool stadium/studio fill light so shadow sides stay sculpted & readable
    vec3 L2 = normalize(vec3(-uSunDir.x * 0.9 - 0.35, 0.38, -uSunDir.z * 0.8 - 0.25));
    float fillDiff = clamp(dot(N, L2) * 0.5 + 0.5, 0.0, 1.0);

    vec4 baseColor = uBaseColor;
    if (uHasTex) {
      baseColor *= texture(uTex, vUv);
    }

    // Subtle procedural woven jersey micro-grain on athletic apparel (role < 0.5)
    if (uMatRole < 0.5) {
      float weaveX = sin(vUv.x * 520.0);
      float weaveY = sin(vUv.y * 520.0);
      float weave = 1.0 + (weaveX * weaveY) * 0.018;
      baseColor.rgb *= weave;
    }

    float NdotL = dot(N, L);
    float NdotV = max(dot(N, V), 0.001);

    // Warm wrapped diffuse tailored by material role (higher wrap on skin & cloth)
    float wrapAmt = (uMatRole > 0.5 && uMatRole < 1.5) ? 0.54 : 0.44;
    float wrappedL = clamp((NdotL + wrapAmt) / (1.0 + wrapAmt), 0.0, 1.0);
    float directL = smoothstep(0.04, 0.96, wrappedL);

    // Subsurface scattering strictly on skin (uMatRole ~ 1.0) so white fabric never muddies
    vec3 sssContrib = vec3(0.0);
    if (uMatRole > 0.5 && uMatRole < 1.5) {
      float backRim = pow(clamp(1.0 - max(NdotL, 0.0), 0.0, 1.0), 2.2) * (0.35 + 0.65 * fillDiff);
      sssContrib = baseColor.rgb * vec3(1.24, 0.72, 0.54) * backRim * 0.26;
    }

    // Hemispheric Ambient + Stadium Bounce Fill (eliminates dark silhouette limbs)
    vec3 hemi = mix(uGroundColor, uSkyColor, N.y * 0.50 + 0.50);
    vec3 bounceFill = vec3(0.32, 0.42, 0.56) * fillDiff * 0.42;
    vec3 ambient = baseColor.rgb * (hemi * 0.78 + bounceFill);

    // Direct Stadium / Key Light
    vec3 diffuse = baseColor.rgb * uSunColor * directL * (1.0 - uMetallic * 0.72) + sssContrib;

    // Material-aware Specular Highlights
    float specPow = mix(18.0, 96.0, clamp(1.0 - uRoughness, 0.0, 1.0));
    float specStrength = 0.08;
    if (uMatRole > 2.5 && uMatRole < 3.5) {
      // Eye wet cornea catchlight
      specPow = 128.0;
      specStrength = 0.62;
    } else if (uMatRole > 1.5 && uMatRole < 2.5) {
      // Satin hair crown highlight (anisotropic-inspired shifted half vector)
      vec3 hairH = normalize(H + vec3(0.0, 0.22, 0.0));
      float hSpec = pow(max(dot(N, hairH), 0.0), 34.0);
      specStrength = 0.22;
      diffuse += vec3(1.0, 0.96, 0.90) * hSpec * 0.14;
    } else if (uMatRole > 3.5) {
      // Cleats / Sneakers / Keeper Latex & Metal Trim
      specPow = mix(36.0, 92.0, 1.0 - uRoughness);
      specStrength = mix(0.28, 0.68, uMetallic);
    } else if (uMatRole > 0.5 && uMatRole < 1.5) {
      // Natural skin oil sheen
      specPow = 28.0;
      specStrength = 0.10;
    }
    float specInt = pow(max(dot(N, H), 0.0), specPow) * specStrength;
    vec3 specTint = mix(uSunColor, baseColor.rgb * 1.15, uMetallic);
    vec3 specular = specTint * specInt;

    // Broadcast Rim Light (crisp separation against turf/hardwood/arena backdrop)
    float rim = pow(clamp(1.0 - NdotV, 0.0, 1.0), 2.75);
    vec3 rimColor = mix(vec3(0.75, 0.90, 1.0), vec3(1.0, 0.93, 0.84), clamp(N.y * 0.5 + 0.5, 0.0, 1.0));
    float rimBoost = (uMatRole > 0.5 && uMatRole < 1.5) ? 0.16 : 0.26;
    vec3 rimLight = rim * rimColor * rimBoost;

    // Linear Lighting -> Gentle ACES Filmic Curve (preserves crisp whites & vibrant team colors)
    vec3 hdrColor = ambient * 0.68 + diffuse * 0.72 + specular + rimLight;
    vec3 finalRgb = acesFilm(hdrColor * 1.12);
    finalRgb = mix(hdrColor / (1.0 + hdrColor * 0.18), finalRgb, 0.65);
    fragColor = vec4(finalRgb, baseColor.a);
  }
  `;

  // Shared Per-Context GL State & Cache (prevents cross-context handle leaks between Match & Wardrobe WebGL contexts)
  const glContextMap = new WeakMap();
  function getGLState(gl) {
    let st = glContextMap.get(gl);
    if (!st) {
      st = {
        program: null,
        locs: null,
        bufferCache: new WeakMap(),
        skinTextureCache: new Map(),
        shadowProg: null,
        shadowVao: null,
        shadowLocs: null
      };
      glContextMap.set(gl, st);
    }
    return st;
  }
  const modelCache = new Map(); // url -> Promise<GLBModel>
  const activeMatches = new Set();
  // Preload GLB Character Models immediately into memory to eliminate match start lag
  function preloadGLBModels() {
    if (typeof CharactersGLB !== "undefined" && !CharactersGLB.enabled) return;
    const loader = getLoader();
    if (!loader || !loader.loadGLB) return;
    const urls = ['/assets/characters/footy10.glb', '/assets/characters/hoops23.glb', '/assets/characters/keeper1.glb'];
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


  let glbEmblemImg = null;
  function getGlbOfficialEmblem() {
    if (glbEmblemImg && glbEmblemImg.complete && glbEmblemImg.naturalWidth > 0) return glbEmblemImg;
    if (typeof document !== 'undefined') {
      glbEmblemImg = document.getElementById('fvh-official-emblem');
      if (!glbEmblemImg) {
        glbEmblemImg = new Image();
        glbEmblemImg.src = 'assets/emblem.png';
      }
    }
    return glbEmblemImg;
  }

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
      if (sId.includes('titan') || sId.includes('mythic') || sId.includes('beast') || (skin && skin.rarity === 'mythic')) {
        rarity = 'mythic';
      } else if (sId.includes('gold') || sId.includes('cyber') || sId.includes('phantom') || sId.includes('championship') || sId.includes('matrix') || sId.includes('premium')) {
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

        // --- SPECIFIC HIGH-CONTRAST JERSEY SIGNATURE ARTWORK ---
        if (sId.includes('dragon')) {
          // DRAGON FLAME: Rising blazing fire tongues & gold warrior accents
          const fGrad = ctx.createLinearGradient(cx, topY + hH, cx, topY);
          fGrad.addColorStop(0, '#7f1d1d');
          fGrad.addColorStop(0.35, '#dc2626');
          fGrad.addColorStop(0.7, '#ea580c');
          fGrad.addColorStop(1, '#fde047');
          ctx.fillStyle = fGrad;
          ctx.beginPath();
          ctx.moveTo(cx - W * 0.11, topY + hH);
          ctx.lineTo(cx - W * 0.08, topY + hH * 0.25);
          ctx.lineTo(cx - W * 0.04, topY + hH * 0.55);
          ctx.lineTo(cx, topY + hH * 0.10);
          ctx.lineTo(cx + W * 0.04, topY + hH * 0.55);
          ctx.lineTo(cx + W * 0.08, topY + hH * 0.25);
          ctx.lineTo(cx + W * 0.11, topY + hH);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 3.2;
          ctx.stroke();
          if (isFront) {
            ctx.fillStyle = '#fde047';
            ctx.beginPath();
            ctx.arc(cx, topY + hH * 0.38, W * 0.024, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#7f1d1d';
            ctx.lineWidth = 2.0;
            ctx.stroke();
          }
        } else if (sId.includes('phoenix')) {
          // PHOENIX REBIRTH: Radiant golden sunburst with soaring wings
          const pGrad = ctx.createRadialGradient(cx, topY + hH * 0.4, 4, cx, topY + hH * 0.4, W * 0.14);
          pGrad.addColorStop(0, '#ffffff');
          pGrad.addColorStop(0.4, '#facc15');
          pGrad.addColorStop(0.75, '#ea580c');
          pGrad.addColorStop(1, '#7f1d1d');
          ctx.fillStyle = pGrad;
          ctx.beginPath();
          ctx.arc(cx, topY + hH * 0.4, W * 0.11, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fde047';
          ctx.lineWidth = 4.0;
          ctx.beginPath();
          ctx.arc(cx - W * 0.04, topY + hH * 0.4, W * 0.08, Math.PI * 0.9, Math.PI * 1.8);
          ctx.arc(cx + W * 0.04, topY + hH * 0.4, W * 0.08, Math.PI * 1.2, Math.PI * 0.1);
          ctx.stroke();
        } else if (sId.includes('chrono') || sId.includes('void')) {
          // CHRONO SOVEREIGN / VOID WALKER: Obsidian cyber suit with glowing neon cyan power core
          ctx.fillStyle = '#050811';
          ctx.fillRect(cx - W * 0.12, topY, W * 0.24, hH);
          ctx.strokeStyle = '#00f0ff';
          ctx.lineWidth = 3.0;
          ctx.beginPath();
          ctx.moveTo(cx - W * 0.09, topY); ctx.lineTo(cx - W * 0.09, topY + hH * 0.35);
          ctx.lineTo(cx, topY + hH * 0.5); ctx.lineTo(cx + W * 0.09, topY + hH * 0.35);
          ctx.lineTo(cx + W * 0.09, topY);
          ctx.moveTo(cx, topY + hH * 0.5); ctx.lineTo(cx, topY + hH);
          ctx.stroke();
          ctx.fillStyle = '#00f0ff';
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(cx, topY + hH * 0.48, W * 0.026, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.0;
          ctx.stroke();
        } else if (sId.includes('nebula')) {
          // CELESTIAL NEBULA: Cosmic violet galaxy nebula with glowing starfield
          const nGrad = ctx.createLinearGradient(cx - W * 0.12, topY, cx + W * 0.12, topY + hH);
          nGrad.addColorStop(0, '#2e1065');
          nGrad.addColorStop(0.5, '#701a75');
          nGrad.addColorStop(1, '#0284c7');
          ctx.fillStyle = nGrad;
          ctx.fillRect(cx - W * 0.12, topY, W * 0.24, hH);
          ctx.fillStyle = '#ffffff';
          for (let s = 0; s < 18; s++) {
            const sx = cx - W * 0.10 + ((s * 47) % Math.round(W * 0.20));
            const sy = topY + ((s * 61) % Math.round(hH));
            ctx.beginPath();
            ctx.arc(sx, sy, (s % 3 === 0) ? 2.5 : 1.4, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (sId.includes('golden')) {
          // GOLDEN CREST: Regal metallic 24K gold sash with royal laurel
          const gGrad = ctx.createLinearGradient(cx - W * 0.11, topY, cx + W * 0.11, topY + hH);
          gGrad.addColorStop(0, '#fef08a');
          gGrad.addColorStop(0.5, '#f59e0b');
          gGrad.addColorStop(1, '#b45309');
          ctx.strokeStyle = gGrad;
          ctx.lineWidth = W * 0.054;
          ctx.beginPath();
          ctx.moveTo(cx - W * 0.11, topY);
          ctx.lineTo(cx + W * 0.11, topY + hH);
          ctx.stroke();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.stroke();
          if (isFront) {
            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.arc(cx, topY + hH * 0.4, W * 0.025, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (sId.includes('bib') || sId.includes('training_bib')) {
          // TRAINING BIB: High-vis volt green training pinnie
          ctx.fillStyle = '#a3e635';
          ctx.fillRect(cx - W * 0.10, topY + hH * 0.12, W * 0.20, hH * 0.82);
          ctx.strokeStyle = '#4d7c0f';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(cx - W * 0.10, topY + hH * 0.12, W * 0.20, hH * 0.82);
          ctx.fillStyle = 'rgba(0,0,0,0.18)';
          for (let my = topY + hH * 0.16; my < topY + hH * 0.9; my += 12) {
            for (let mx = cx - W * 0.08; mx < cx + W * 0.08; mx += 12) {
              ctx.fillRect(mx, my, 2.5, 2.5);
            }
          }
        } else if (sId.includes('block') || sId.includes('dual')) {
          // DUAL BLOCK: 50/50 vertical split
          ctx.fillStyle = sCol;
          ctx.fillRect(cx, topY, W * 0.12, hH);
          ctx.strokeStyle = accCol;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(cx, topY); ctx.lineTo(cx, topY + hH);
          ctx.stroke();
        } else if (sId.includes('contrast_v') || sId.includes('vneck')) {
          // CONTRAST V: Sharp bold chevron V
          ctx.fillStyle = sCol;
          ctx.beginPath();
          ctx.moveTo(cx - W * 0.10, topY);
          ctx.lineTo(cx, topY + hH * 0.42);
          ctx.lineTo(cx + W * 0.10, topY);
          ctx.lineTo(cx + W * 0.10, topY + hH * 0.14);
          ctx.lineTo(cx, topY + hH * 0.56);
          ctx.lineTo(cx - W * 0.10, topY + hH * 0.14);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = accCol;
          ctx.lineWidth = 2.8;
          ctx.stroke();
        } else if (sId.includes('velocity')) {
          // NEON VELOCITY: Electric lime & cyan lightning chevrons
          ctx.strokeStyle = '#a3e635';
          ctx.lineWidth = 4.0;
          ctx.beginPath();
          ctx.moveTo(cx - W * 0.09, topY + hH * 0.2);
          ctx.lineTo(cx, topY + hH * 0.38);
          ctx.lineTo(cx + W * 0.09, topY + hH * 0.2);
          ctx.moveTo(cx - W * 0.09, topY + hH * 0.45);
          ctx.lineTo(cx, topY + hH * 0.63);
          ctx.lineTo(cx + W * 0.09, topY + hH * 0.45);
          ctx.stroke();
        } else if (sId.includes('solar')) {
          // SOLAR FLARE: Blazing sunburst orange & yellow chevron
          const sGrad = ctx.createLinearGradient(cx, topY, cx, topY + hH);
          sGrad.addColorStop(0, '#f97316');
          sGrad.addColorStop(1, '#facc15');
          ctx.fillStyle = sGrad;
          ctx.beginPath();
          ctx.moveTo(cx - W * 0.10, topY + hH * 0.1);
          ctx.lineTo(cx, topY + hH * 0.45);
          ctx.lineTo(cx + W * 0.10, topY + hH * 0.1);
          ctx.lineTo(cx + W * 0.10, topY + hH * 0.25);
          ctx.lineTo(cx, topY + hH * 0.60);
          ctx.lineTo(cx - W * 0.10, topY + hH * 0.25);
          ctx.closePath();
          ctx.fill();
        } else if (sId.includes('miami')) {
          // VAPORWAVE MIAMI: Hot pink and cyan split gradient
          const vGrad = ctx.createLinearGradient(cx - W * 0.12, topY, cx + W * 0.12, topY + hH);
          vGrad.addColorStop(0, '#ec4899');
          vGrad.addColorStop(1, '#06b6d4');
          ctx.fillStyle = vGrad;
          ctx.fillRect(cx - W * 0.12, topY, W * 0.24, hH);
        } else if (sId.includes('titan')) {
          // TITAN VANGUARD: Mecha armored plates with gold energy vents
          ctx.fillStyle = '#334155';
          ctx.fillRect(cx - W * 0.11, topY + hH * 0.15, W * 0.22, hH * 0.75);
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 3.0;
          ctx.strokeRect(cx - W * 0.11, topY + hH * 0.15, W * 0.22, hH * 0.75);
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(cx - W * 0.08, topY + hH * 0.35, W * 0.16, 4);
          ctx.fillRect(cx - W * 0.08, topY + hH * 0.55, W * 0.16, 4);
        } else

        // --- RARITY-BASED FALLBACK PATTERNS ---

        if (rarity === 'mythic') {
          // MYTHIC TITAN / HYPER BEAST: Celestial Double Aurora Sash & Cosmic Core
          const mGrad = ctx.createLinearGradient(cx - W * 0.12, topY, cx + W * 0.12, topY + hH);
          mGrad.addColorStop(0, '#c084fc');
          mGrad.addColorStop(0.5, '#00f0ff');
          mGrad.addColorStop(1, '#ec4899');
          ctx.strokeStyle = mGrad;
          ctx.lineWidth = W * 0.052;
          ctx.beginPath();
          ctx.moveTo(cx - W * 0.11, topY);
          ctx.lineTo(cx + W * 0.11, topY + hH);
          ctx.stroke();

          // Dual glowing laser pinstripes
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 3.0;
          ctx.beginPath();
          ctx.moveTo(cx - W * 0.11 - 4, topY);
          ctx.lineTo(cx + W * 0.11 - 4, topY + hH);
          ctx.moveTo(cx - W * 0.11 + 4, topY);
          ctx.lineTo(cx + W * 0.11 + 4, topY + hH);
          ctx.stroke();

          // Mythic Gem Core
          ctx.fillStyle = '#00f0ff';
          ctx.beginPath();
          ctx.arc(cx, topY + hH * 0.38, W * 0.026, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.0;
          ctx.stroke();
        } else if (rarity === 'legendary') {
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

        // 2. Official FOOTY vs HOOPS Crest & Athlete Number Detailing
        if (isFront) {
          // Official Project Emblem Badge on Chest (Strict 1:1 Aspect Ratio)
          const emb = getGlbOfficialEmblem();
          const embRadius = W * 0.024;
          const embSize = embRadius * 2;
          const embX = isFooty ? (cx - W * 0.052) : (cx - W * 0.048);
          const embY = topY + hH * 0.27;

          // Subtle dark contrast underlay so emblem pops on both light & dark kits
          ctx.beginPath();
          ctx.arc(embX, embY, embRadius + 1.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(10, 15, 26, 0.75)';
          ctx.fill();
          ctx.strokeStyle = isFooty ? '#00f0ff' : '#f97316';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          if (emb && emb.complete && emb.naturalWidth > 0) {
            ctx.drawImage(emb, embX - embRadius, embY - embRadius, embSize, embSize);
          } else {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(embX, embY, embRadius, Math.PI * 0.5, Math.PI * 1.5);
            ctx.fill();
            ctx.fillStyle = '#ff6b00';
            ctx.beginPath();
            ctx.arc(embX, embY, embRadius, -Math.PI * 0.5, Math.PI * 0.5);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            ctx.moveTo(embX - 1, embY - embRadius);
            ctx.lineTo(embX + 2, embY + embRadius);
            ctx.stroke();
          }

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
  const KIT_ATLAS_MAP = {
    // Football Regular Kits
    'footy_classic': 'assets/kits/footy_kit_classic.png',
    'footy_kit_classic': 'assets/kits/footy_kit_classic.png',
    'footy_2_white': 'assets/kits/footy_kit_2_white.png',
    'footy_kit_2_white': 'assets/kits/footy_kit_2_white.png',
    'skin_rookie': 'assets/kits/footy_kit_classic.png',
    'footy_6_crimson': 'assets/kits/footy_kit_6_crimson.png',
    'footy_kit_6_crimson': 'assets/kits/footy_kit_6_crimson.png',
    'footy_2_crimson': 'assets/kits/footy_kit_6_crimson.png',
    'footy_7_gold': 'assets/kits/footy_kit_7_gold.png',
    'footy_kit_7_gold': 'assets/kits/footy_kit_7_gold.png',
    'footy_2_gold': 'assets/kits/footy_kit_7_gold.png',
    'footy_1_sapphire': 'assets/kits/footy_kit_1_sapphire.png',
    'footy_kit_1_sapphire': 'assets/kits/footy_kit_1_sapphire.png',
    'footy_4_amber': 'assets/kits/footy_kit_4_amber.png',
    'footy_kit_4_amber': 'assets/kits/footy_kit_4_amber.png',
    'footy_7_amber': 'assets/kits/footy_kit_4_amber.png',
    'footy_5_amethyst': 'assets/kits/footy_kit_5_amethyst.png',
    'footy_kit_5_amethyst': 'assets/kits/footy_kit_5_amethyst.png',
    'footy_9_dragon': 'assets/kits/footy_kit_9_dragon.png',
    'footy_kit_9_dragon': 'assets/kits/footy_kit_9_dragon.png',
    'footy_3_neon': 'assets/kits/footy_kit_3_neon.png',
    'footy_kit_3_neon': 'assets/kits/footy_kit_3_neon.png',
    'footy_8_obsidian': 'assets/kits/footy_kit_8_obsidian.png',
    'footy_kit_8_obsidian': 'assets/kits/footy_kit_8_obsidian.png',
    'footy_0_tiffany': 'assets/kits/footy_kit_0_tiffany.png',
    'footy_kit_0_tiffany': 'assets/kits/footy_kit_0_tiffany.png',
    'footy_star_holiday': 'assets/kits/footy_kit_star_holiday.png',
    'footy_kit_star_holiday': 'assets/kits/footy_kit_star_holiday.png',
    'footy_star_emperor': 'assets/kits/footy_kit_star_emperor.png',
    'footy_kit_star_emperor': 'assets/kits/footy_kit_star_emperor.png',
    'footy_star_samurai': 'assets/kits/footy_kit_star_samurai.png',
    'footy_kit_star_samurai': 'assets/kits/footy_kit_star_samurai.png',
    'skin_footy_cyber_strike': 'assets/kits/footy_kit_4_cyber.png',
    'skin_footy_golden_legend': 'assets/kits/footy_kit_7_gold24k.png',
    'skin_footy_stealth_shadow': 'assets/kits/footy_kit_6_midnight.png',
    'skin_footy_neon_matrix': 'assets/kits/footy_kit_3_neon.png',
    'skin_footy_mythic_titan': 'assets/kits/footy_kit_star_emperor.png',

    // Basketball Regular Tanks
    'hoops_classic': 'assets/kits/hoops_kit_classic.png',
    'hoops_kit_classic': 'assets/kits/hoops_kit_classic.png',
    'hoops_2_chicago': 'assets/kits/hoops_kit_2_crimson.png',
    'hoops_2_crimson': 'assets/kits/hoops_kit_2_crimson.png',
    'hoops_kit_2_crimson': 'assets/kits/hoops_kit_2_crimson.png',
    'skin_solar': 'assets/kits/hoops_kit_classic.png',
    'skin_bb_onyx': 'assets/kits/hoops_kit_classic.png',
    'hoops_3_la': 'assets/kits/hoops_kit_3_gold.png',
    'hoops_3_gold': 'assets/kits/hoops_kit_3_gold.png',
    'hoops_kit_3_gold': 'assets/kits/hoops_kit_3_gold.png',
    'hoops_4_boston': 'assets/kits/hoops_kit_4_emerald.png',
    'hoops_4_emerald': 'assets/kits/hoops_kit_4_emerald.png',
    'hoops_kit_4_emerald': 'assets/kits/hoops_kit_4_emerald.png',
    'hoops_6_charlotte': 'assets/kits/hoops_kit_6_cyan.png',
    'hoops_6_cyan': 'assets/kits/hoops_kit_6_cyan.png',
    'hoops_kit_6_cyan': 'assets/kits/hoops_kit_6_cyan.png',
    'hoops_5_raptor': 'assets/kits/hoops_kit_5_amethyst.png',
    'hoops_5_amethyst': 'assets/kits/hoops_kit_5_amethyst.png',
    'hoops_kit_5_amethyst': 'assets/kits/hoops_kit_5_amethyst.png',
    'hoops_0_neon': 'assets/kits/hoops_kit_0_neon.png',
    'hoops_kit_0_neon': 'assets/kits/hoops_kit_0_neon.png',
    'hoops_7_phoenix': 'assets/kits/hoops_kit_7_amber.png',
    'hoops_7_amber': 'assets/kits/hoops_kit_7_amber.png',
    'hoops_kit_7_amber': 'assets/kits/hoops_kit_7_amber.png',
    'hoops_9_beast': 'assets/kits/hoops_kit_9_galaxy.png',
    'hoops_9_galaxy': 'assets/kits/hoops_kit_9_galaxy.png',
    'hoops_kit_9_galaxy': 'assets/kits/hoops_kit_9_galaxy.png',
    'hoops_8_mamba': 'assets/kits/hoops_kit_8_stealth.png',
    'hoops_8_stealth': 'assets/kits/hoops_kit_8_stealth.png',
    'hoops_kit_8_stealth': 'assets/kits/hoops_kit_8_stealth.png',
    'hoops_1_miami': 'assets/kits/hoops_kit_1_pink.png',
    'hoops_1_pink': 'assets/kits/hoops_kit_1_pink.png',
    'hoops_kit_1_pink': 'assets/kits/hoops_kit_1_pink.png',
    'hoops_star_holiday': 'assets/kits/hoops_kit_star_holiday.png',
    'hoops_kit_star_holiday': 'assets/kits/hoops_kit_star_holiday.png',
    'hoops_star_astral': 'assets/kits/hoops_kit_star_astral.png',
    'hoops_kit_star_astral': 'assets/kits/hoops_kit_star_astral.png',
    'hoops_star_phantom': 'assets/kits/hoops_kit_star_phantom.png',
    'hoops_kit_star_phantom': 'assets/kits/hoops_kit_star_phantom.png',
    'skin_hoops_street_legend': 'assets/kits/hoops_kit_2_brooklyn.png',
    'skin_hoops_phantom_black': 'assets/kits/hoops_kit_8_stealth.png',
    'skin_hoops_hyper_beast': 'assets/kits/hoops_kit_9_beast.png',

    // Keeper Kits
    'keeper_0_volt': 'assets/kits/keeper_kit_0_volt.png',
    'keeper_volt': 'assets/kits/keeper_kit_0_volt.png',
    'keeper_home': 'assets/kits/keeper_kit_0_volt.png'
  };

  const _preloadedImages = new Map();
  function preloadImage(url) {
    if (_preloadedImages.has(url)) return _preloadedImages.get(url);
    if (typeof Image === 'undefined') return null;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    _preloadedImages.set(url, img);
    return img;
  }

  function loadAtlasTexture(gl, url) {
    const st = getGLState(gl);
    if (st.skinTextureCache.has(url)) return st.skinTextureCache.get(url);
    const tex = gl.createTexture();
    st.skinTextureCache.set(url, tex);

    const img = preloadImage(url) || (typeof Image !== 'undefined' ? new Image() : null);

    function uploadToGl(imageElement) {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageElement);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      const aniso = gl.getExtension('EXT_texture_filter_anisotropic') || gl.getExtension('MOZ_EXT_texture_filter_anisotropic') || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
      if (aniso) {
        const maxA = gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT) || 4;
        gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, maxA));
      }
      gl.bindTexture(gl.TEXTURE_2D, null);
    }

    if (img && img.complete && img.naturalWidth > 0) {
      uploadToGl(img);
    } else if (img) {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([200, 210, 225, 255]));
      gl.bindTexture(gl.TEXTURE_2D, null);

      img.onload = function() {
        uploadToGl(img);
      };
    }
    return tex;
  }

  function getOrCreateSkinTexture(gl, model, skin, isFooty, isKeeper) {
    if (!gl) return null;
    if (isKeeper) {
      return loadAtlasTexture(gl, 'assets/kits/keeper_kit_0_volt.png');
    }
    const skId = (skin && skin.id) ? skin.id : (isFooty ? 'footy_classic' : 'hoops_classic');
    const atlasUrl = KIT_ATLAS_MAP[skId];
    if (atlasUrl) {
      return loadAtlasTexture(gl, atlasUrl);
    }
    return null;
  }

  function getLoader() {
    if (glbLoaderModule && glbLoaderModule.loadGLB) return glbLoaderModule;
    if (typeof window !== 'undefined' && window.GLBLoader) return window.GLBLoader;
    return null;
  }

  function resolveMaterialPBR(matName, pbrMat, skinId) {
    let role = 0.0; // 0: cloth, 1: skin, 2: hair, 3: eye, 4: footwear/leather, 5: gold/metal
    let roughness = (pbrMat && pbrMat.roughnessFactor !== undefined) ? pbrMat.roughnessFactor : 0.65;
    let metallic = (pbrMat && pbrMat.metallicFactor !== undefined) ? pbrMat.metallicFactor : 0.0;

    if (matName === 'Skin' || matName === 'Skin_Darker') {
      role = 1.0; roughness = 0.56; metallic = 0.0;
    } else if (matName === 'Hair' || matName === 'Eyebrows') {
      role = 2.0; roughness = 0.44; metallic = 0.04;
    } else if (matName === 'Eye') {
      role = 3.0; roughness = 0.14; metallic = 0.02;
    } else if (matName === 'Red_Dark' || matName === 'White') {
      role = 4.0; roughness = 0.30; metallic = 0.08;
    } else {
      role = 0.0;
      roughness = Math.max(0.58, roughness);
      metallic = Math.min(0.05, metallic);
      const sk = String(skinId || '').toLowerCase();
      if (sk.includes('gold') || sk.includes('championship') || sk.includes('emperor')) {
        role = 5.0; metallic = 0.42; roughness = 0.30;
      } else if (sk.includes('neon') || sk.includes('cyber') || sk.includes('dragon')) {
        metallic = 0.22; roughness = 0.42;
      } else if (sk.includes('frost') || sk.includes('tiffany') || sk.includes('sapphire')) {
        metallic = 0.12; roughness = 0.46;
      }
    }
    return { role, roughness, metallic };
  }

  function initShader(gl) {
    const st = getGLState(gl);
    if (st.program) return st;

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

    st.program = p;
    st.locs = {
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
      uMatRole: gl.getUniformLocation(p, 'uMatRole'),
      uTex: gl.getUniformLocation(p, 'uTex'),
      uHasTex: gl.getUniformLocation(p, 'uHasTex'),
      uRunPhase: gl.getUniformLocation(p, 'uRunPhase'),
      uRunSpeed: gl.getUniformLocation(p, 'uRunSpeed'),
      uKickPhase: gl.getUniformLocation(p, 'uKickPhase')
    };
    return st;
  }

  function getOrCreateBuffers(gl, model) {
    const st = getGLState(gl);
    if (st.bufferCache.has(model)) return st.bufferCache.get(model);

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
        const anisoExt = gl.getExtension('EXT_texture_filter_anisotropic') || gl.getExtension('MOZ_EXT_texture_filter_anisotropic') || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
        if (anisoExt) {
          const maxAniso = gl.getParameter(anisoExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT) || 4;
          gl.texParameterf(gl.TEXTURE_2D, anisoExt.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, maxAniso));
        }
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

    st.bufferCache.set(model, primitiveBuffers);
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

      // Keep procedural mesh visible while GLB model is loading/parsing
      if (this.charRef && this.charRef.pivot) {
        this.charRef.pivot.visible = true;
      }

      // Visual Placement & Orientation
      this.yaw = 0;
      this.targetYaw = 0;
      this.pitch = 0;
      this.roll = 0;
      this.elevationLift = 0;
      // Athletic, calibrated player scale (fits comfortably in goal & under rim)
      this.scale = options.scale || 1.96;
      this.currentAnim = 'idle';
      this.modelMatrix = new Float32Array(16);

      // Instant Synchronous Cache Check
      const loader = getLoader();
      if (loader && loader.getCachedModel) {
        const cached = loader.getCachedModel(this.modelUrl);
        if (cached) {
          this.model = cached;
          this.loaded = true;
          // Model is fully ready and drawn this frame: safely hide procedural mesh
          if (this.charRef && this.charRef.pivot) {
            this.charRef.pivot.visible = false;
          }
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

    setAnimation(name, speed = 1.0, blendDuration) {
      if (!this.model) return;
      this.model.playbackSpeed = speed;

      let targetClip = name;
      const lower = String(name).toLowerCase();
      if (lower === 'idle' || lower === 'idle_neutral') {
        targetClip = 'Idle';
      } else if (lower === 'walk' || lower === 'jog') {
        targetClip = 'Walk';
      } else if (lower === 'run' || lower === 'sprint' || lower === 'anim_ea_sprintdrive') {
        targetClip = 'Run';
      } else if (lower === 'run_back') {
        targetClip = 'Run_Back';
      } else if (lower === 'run_left') {
        targetClip = 'Run_Left';
      } else if (lower === 'run_right') {
        targetClip = 'Run_Right';
      } else if (lower === 'kick' || lower === 'shot' || lower === 'shoot' || lower === 'kick_right' || lower === 'anim_ea_powerstrike') {
        const isHoops = (this.isHoops || this.mode === 'hoops' || (this.agent && this.agent.char === 'hoops') || (this.matchView && this.matchView.mode === 'hoops'));
        targetClip = (name === 'Kick_Right' || name === 'Anim_Kick_V1' || name === 'Anim_Shot_V1') ? name : (isHoops ? 'Anim_2K_JumpShot' : 'Anim_EA_PowerStrike');
      } else if (lower === 'kick_left') {
        targetClip = 'Kick_Left';
      } else if (lower === 'punch' || lower === 'punch_right') {
        targetClip = 'Punch_Right';
      } else if (lower === 'punch_left') {
        targetClip = 'Punch_Left';
      } else if (lower === 'slide' || lower === 'tackle' || lower === 'anim_ea_slidetackle') {
        const isHoops = (this.isHoops || this.mode === 'hoops' || (this.agent && this.agent.char === 'hoops') || (this.matchView && this.matchView.mode === 'hoops'));
        targetClip = (name === 'Anim_Slide_V1' || name === 'Anim_Steal_V1') ? name : (isHoops ? 'Anim_2K_Steal' : 'Anim_EA_SlideTackle');
      } else if (lower === 'dunk' || lower === 'slamdunk' || lower === 'anim_2k_slamdunk') {
        targetClip = (name === 'Anim_Dunk_V1') ? 'Anim_Dunk_V1' : 'Anim_2K_SlamDunk';
      } else if (lower === 'steal' || lower === 'anim_2k_steal') {
        targetClip = (name === 'Anim_Steal_V1') ? 'Anim_Steal_V1' : 'Anim_2K_Steal';
      } else if (lower === 'roll' || lower === 'dive' || lower === 'anim_ea_keeperdive' || lower === 'save') {
        targetClip = (lower === 'roll') ? 'Roll' : 'Anim_EA_KeeperDive';
      } else if (lower === 'wave' || lower === 'celebrate' || lower === 'win' || lower === 'anim_celebration') {
        targetClip = (name === 'Anim_Celeb_V1' || name === 'Anim_Celeb_V2') ? name : 'Anim_Celebration';
      } else if (lower === 'hit' || lower === 'hitrecieve') {
        targetClip = 'HitRecieve';
      }

      if (this.currentAnim !== targetClip) {
        const prevWasAction = /Kick|Shot|Dunk|Slide|Dive|Steal|Celeb|Hit|Roll|Punch/i.test(this.currentAnim || '');
        const nextIsAction = /Kick|Shot|Dunk|Slide|Dive|Steal|Celeb|Hit|Roll|Punch/i.test(targetClip);
        const blend = (typeof blendDuration === 'number')
          ? blendDuration
          : (nextIsAction ? 0.08 : (prevWasAction ? 0.22 : 0.15));
        this.currentAnim = targetClip;
        this.model.setAnimation(targetClip, { blendDuration: blend, restart: nextIsAction });
      }
    }

    _pickLocomotionClip(vx, vz, speed) {
      if (speed <= 0.22) return { clip: 'Idle', rate: 1.0 };
      if (speed <= 1.35) {
        return { clip: 'Walk', rate: Math.max(0.74, Math.min(1.52, speed / 1.48)) };
      }
      const fwdX = Math.sin(this.yaw);
      const fwdZ = Math.cos(this.yaw);
      const invS = 1 / (speed || 1);
      const dotF = (vx * fwdX + vz * fwdZ) * invS;
      const dotR = (vx * fwdZ - vz * fwdX) * invS;
      const rate = Math.max(0.92, Math.min(2.05, speed / 3.05));
      if (dotF < -0.52) return { clip: 'Run_Back', rate };
      if (dotR > 0.72 && dotF < 0.48) return { clip: 'Run_Right', rate };
      if (dotR < -0.72 && dotF < 0.48) return { clip: 'Run_Left', rate };
      return { clip: 'Run', rate };
    }

    _cycleVariant(tag, list) {
      this._varState = this._varState || {};
      this._varSeq = this._varSeq || {};
      const seq = (this._varSeq[tag] = (this._varSeq[tag] || 0) + 1);
      return list[seq % list.length];
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

      // 2. Fortnite-Style Kinetic Animation Tracks & Procedural Motion Mechanics
      // A. Dynamic body bank & cornering lean (lean into turns at speed like Fortnite & Rocket League)
      const corneringLean = Math.max(-0.24, Math.min(0.24, -dy * Math.min(1.0, speed / 2.2)));
      const sprintDrive = Math.min(1.0, speed / 3.4);
      this.roll = corneringLean;
      this.pitch = 0.18 * sprintDrive; // Fortnite athletic forward sprint posture
      this.elevationLift = (speed > 1.2) ? Math.sin((this.model.playbackTime || 0) * 16) * 0.04 * sprintDrive : 0;

      // Real-time athletic leg locomotion
      this.runSpeed = Math.min(1.0, speed / 2.6);
      this.runPhase = (this.runPhase || 0) + dt * Math.min(22.0, speed * 5.2);

      // Kicking animation state
      const isBasketballMode = Boolean(this.matchView && this.matchView.mode === 'hoops');
      const isKicking = (a.state === 'kick' || (typeof a.kickT === 'number' && a.kickT > 0));
      if (isKicking && !isBasketballMode) {
        this.kickPhase = Math.min(1.0, (this.kickPhase || 0) + dt * 8.0);
      } else {
        this.kickPhase = Math.max(0.0, (this.kickPhase || 0) - dt * 5.0);
      }

      const isBallCarrier = Boolean(
        this.matchView &&
        this.matchView.sim &&
        this.matchView.sim.ball &&
        this.matchView.sim.ball.owner === a
      );

      // Strict Mode Distinction: Any player in basketball match plays BASKETBALL with hands!

      // Track clean action entry edges for variant clip variety
      const curActionTag = (isBasketballMode
        ? (a.dunk && a.dunk.active ? 'dunk' : a.shotT > 0 ? 'shot' : a.kickT > 0 ? 'pass' : a.jumpT > 0 ? 'jump' : (a.tackle && (a.tackle.phase === 'lunge' || a.tackle.phase === 'charge')) ? 'steal' : a.celebrateT > 0 ? 'celeb' : a.stunT > 0 ? 'hit' : 'none')
        : (a.role === 'keeper' && a.diveT > 0 ? 'dive' : a.role === 'keeper' && a.jumpT > 0 ? 'kjump' : a.shotT > 0 ? 'fshot' : a.kickT > 0 ? 'fkick' : (a.tackle && (a.tackle.phase === 'lunge' || a.tackle.phase === 'charge')) ? 'slide' : a.celebrateT > 0 ? 'celeb' : a.stunT > 0 ? 'hit' : 'none'));
      if (curActionTag !== 'none' && curActionTag !== this._lastActionTag) {
        this._activeVariantClip = this._cycleVariant(curActionTag, ({
          dunk: ['Anim_2K_SlamDunk', 'Anim_Dunk_V1'],
          shot: ['Anim_2K_JumpShot', 'Anim_Shot_V1'],
          pass: ['Anim_Shot_V1'],
          jump: ['Anim_2K_JumpShot'],
          steal: ['Anim_2K_Steal', 'Anim_Steal_V1'],
          celeb: ['Anim_Celebration', 'Anim_Celeb_V1', 'Anim_Celeb_V2'],
          hit: ['HitRecieve', 'HitRecieve_2'],
          dive: ['Anim_EA_KeeperDive'],
          kjump: ['Anim_EA_KeeperDive'],
          fshot: ['Anim_EA_PowerStrike', 'Anim_Kick_V1'],
          fkick: ['Kick_Right', 'Kick_Left'],
          slide: ['Anim_EA_SlideTackle', 'Anim_Slide_V1']
        })[curActionTag] || ['Idle']);
      }
      this._lastActionTag = curActionTag;

      // ==========================================
      // A. BASKETBALL MATCH ACTIONS (100% HANDS, NO FOOT KICKS!)
      // ==========================================
      if (isBasketballMode) {
        // 1. Slam Dunk: Explosive Hang-Time & Rim Hammer
        if (a.dunk && a.dunk.active) {
          const dk = a.dunk;
          const dunkProgress = Math.min(1, Math.max(0, dk.t / (dk.dur || 0.65)));
          const hangTimeArc = Math.pow(Math.sin(dunkProgress * Math.PI), 0.65);
          this.elevationLift = hangTimeArc * 0.85;
          this.pitch = 0.20 * Math.sin(dunkProgress * Math.PI);
          this.roll = corneringLean + 0.08 * Math.sin(dunkProgress * Math.PI * 2);
          this.setAnimation(this._activeVariantClip || 'Anim_2K_SlamDunk', 1.75, 0.08);
        }
        // 2. Jump Shot / Block Elevation & Release
        else if (a.shotT > 0) {
          const shotProgress = Math.min(1, Math.max(0, 1 - a.shotT / 0.5));
          this.elevationLift = Math.sin(shotProgress * Math.PI) * 0.65;
          this.pitch = -0.08;
          this.setAnimation(this._activeVariantClip || 'Anim_2K_JumpShot', 1.55, 0.08);
        }
        else if (a.jumpT > 0) {
          const jp = Math.min(1, Math.max(0, 1 - a.jumpT / 0.45));
          this.elevationLift = Math.sin(jp * Math.PI) * 0.52;
          this.pitch = -0.05;
          this.setAnimation('Anim_2K_JumpShot', 1.45, 0.08);
        }
        // 3. Passing in Basketball (Chest pass / push pass - NO KICKING!)
        else if (a.kickT > 0) {
          this.pitch = 0.12;
          this.setAnimation('Anim_Shot_V1', 2.0, 0.07);
        }
        // 4. Interception Lunge / Hand Steal
        else if (a.tackle && (a.tackle.phase === 'lunge' || a.tackle.phase === 'charge')) {
          this.pitch = 0.18;
          this.setAnimation(this._activeVariantClip || 'Anim_2K_Steal', 1.6, 0.08);
        }
        // 5. Recovery / Stumble
        else if (a.stunT > 0) {
          this.setAnimation(this._activeVariantClip || 'HitRecieve', 1.25, 0.09);
        }
        // 6. Celebration Emotes
        else if (a.celebrateT > 0) {
          this.setAnimation(this._activeVariantClip || 'Anim_Celebration', 1.45, 0.12);
        }
        // 7. Basketball Dribbling (Athletic crouch protecting the ball)
        else if (isBallCarrier) {
          if (speed > 0.3) {
            const sprintCadence = Math.max(1.05, Math.min(2.1, speed / 2.95));
            this.setAnimation('Run', sprintCadence, 0.14);
            this.pitch = 0.14;
          } else {
            this.setAnimation('Idle', 1.0, 0.16);
            this.pitch = 0.11;
          }
        }
        // 8. Directional Defense / Outfield Running / Walking / Idle
        else {
          const loco = this._pickLocomotionClip(vx, vz, speed);
          this.setAnimation(loco.clip, loco.rate);
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
          const diveDir = a.diveDir || (a.aiTargetX !== undefined && a.aiTargetX >= a.x ? 1 : -1);
          this.roll = -diveDir * (0.85 + 0.25 * diveArc);
          this.elevationLift = 0.20 * diveArc;
          this.pitch = 0.15 * diveArc;
          this.setAnimation('Anim_EA_KeeperDive', 1.6, 0.07);
        }
        else if (a.role === 'keeper' && a.jumpT > 0) {
          const jumpProg = Math.max(0, Math.min(1, 1 - a.jumpT / 0.5));
          this.elevationLift = Math.sin(jumpProg * Math.PI) * 0.34;
          this.pitch = -0.10;
          this.setAnimation('Anim_EA_KeeperDive', 1.75, 0.08);
        }
        // 2. Football Power Shot vs Crisp Pass
        else if (a.shotT > 0) {
          const strikeProgress = Math.min(1, Math.max(0, 1 - a.shotT / 0.45));
          this.elevationLift = 0.0;
          this.pitch = 0.22 * Math.sin(strikeProgress * Math.PI);
          this.roll = -0.06 * Math.sin(strikeProgress * Math.PI);
          this.setAnimation(this._activeVariantClip || 'Anim_EA_PowerStrike', 1.55, 0.07);
        }
        else if (a.kickT > 0) {
          const passProg = Math.min(1, Math.max(0, 1 - a.kickT / 0.35));
          this.elevationLift = 0.0;
          this.pitch = 0.12 * Math.sin(passProg * Math.PI);
          this.setAnimation(this._activeVariantClip || 'Kick_Right', 1.5, 0.07);
        }
        // 3. Football Turf Slide Tackle
        else if (a.tackle && (a.tackle.phase === 'lunge' || a.tackle.phase === 'charge')) {
          this.elevationLift = -0.36;
          this.pitch = -0.44;
          this.roll = -0.20;
          this.setAnimation(this._activeVariantClip || 'Anim_EA_SlideTackle', 1.55, 0.08);
        }
        // 4. Recovery / Stumble after tackle collision
        else if (a.stunT > 0) {
          this.setAnimation(this._activeVariantClip || 'HitRecieve', 1.2, 0.09);
        }
        // 5. Celebration Emotes
        else if (a.celebrateT > 0) {
          const cT = a.celebrateT || 0;
          this.elevationLift = Math.max(0, Math.sin(cT * 9) * 0.28);
          this.pitch = -0.10 * Math.sin(cT * 7);
          this.roll = Math.sin(cT * 5) * 0.14;
          this.setAnimation(this._activeVariantClip || 'Anim_Celebration', 1.45, 0.12);
        }
        // 6. Directional Strafe / Sprint / Walk / Idle
        else {
          const loco = this._pickLocomotionClip(vx, vz, speed);
          this.setAnimation(loco.clip, loco.rate);
        }
      }

      // 3. Step skeletal bones with procedural athletic animation blending
      this.model.update(dt);

      // 4. Update world transform matrix with 3D lean, jump elevation, and athletic width
      // Stand on grass at Y=0 (feet are at Y=0)
      const px = a.x || 0;
      const py = (a.y || 0) + this.elevationLift;
      const pz = a.z || 0;
      // Athletic proportions: broader athletic shoulders, taller basketball build
      const sx = this.isFooty ? this.scale * 1.02 : this.scale * 1.04;
      const sy = this.isFooty ? this.scale : this.scale * 1.02;
      const sz = this.scale * 0.98;
      makeTransformMatrix(this.modelMatrix, px, py, pz, this.yaw, sx, sy, sz, this.pitch, this.roll);
    }
  }

  // --- 2.5D Hi-Res Pre-rendered Animation Instance (Supercell / Brawl Stars / Pixar style) ---
  const _hiResImgCache = new Map();
  function loadHiResImage(src) {
    if (_hiResImgCache.has(src)) return _hiResImgCache.get(src);
    const p = new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = () => {
        console.warn('[CharactersGLB] Failed to load 2.5D image:', src);
        resolve(null);
      };
    });
    _hiResImgCache.set(src, p);
    return p;
  }

  class HiRes25DCharacterInstance {
    constructor(charRef, imgSrc, opts = {}) {
      this.charRef = charRef;
      this.agent = charRef.agent;
      this.matchView = opts.matchView;
      this.height = opts.height || 2.40;
      this.isKeeper = Boolean(opts.isKeeper);
      this.isFooty = Boolean(opts.isFooty);
      this.frontSrc = opts.frontSrc || imgSrc;
      this.backSrc = opts.backSrc || imgSrc;
      this.loaded = false;
      this.stepTime = Math.random() * 10;
      this.idleTime = Math.random() * 10;
      this.facingLeft = false;

      // Hide the procedural mannequin on frame 0
      if (charRef.pivot) {
        charRef.pivot.visible = false;
      }

      this.init();
    }

    async init() {
      const [imgFront, imgBack] = await Promise.all([
        loadHiResImage(this.frontSrc),
        loadHiResImage(this.backSrc)
      ]);
      if (!imgFront || !this.charRef || !this.charRef.root) return;

      const scene = window.require ? window.require('gfx/scene') : null;
      const G = window.require ? window.require('gfx/geometry') : null;
      if (!scene || !G) return;

      const aspect = imgFront.width / imgFront.height;
      this.w = this.height * aspect;
      this.h = this.height;

      this.frontTex = new scene.Texture(imgFront, { srgb: true, mipmap: true });
      this.backTex = imgBack ? new scene.Texture(imgBack, { srgb: true, mipmap: true }) : this.frontTex;

      this.mat = scene.material({
        texture: this.frontTex,
        transparent: true,
        alpha: 1.0,
        doubleSided: true,
        unlit: true,
        depthWrite: false
      });

      const quadGeo = G.quad ? G.quad(this.w, this.h) : G.plane(this.w, this.h);
      this.spriteNode = new scene.Node(quadGeo, this.mat);
      this.spriteNode.setPos(0, this.h * 0.5, 0);
      this.spriteNode.rotation = [-0.38, 0, 0];

      this.charRef.root.add(this.spriteNode);
      this.loaded = true;

      if (this.charRef.pivot) {
        this.charRef.pivot.visible = false;
      }
    }

    update(dt) {
      if (this.charRef && this.charRef.pivot && this.charRef.pivot.visible) {
        this.charRef.pivot.visible = false;
      }
      if (!this.loaded || !this.spriteNode || !this.agent) return;

      const a = this.agent;
      const vx = a.vx || 0;
      const vz = a.vz || 0;
      const speed = Math.hypot(vx, vz);

      // Facing orientation: flip quad horizontally
      if (vx < -0.2) {
        this.facingLeft = true;
      } else if (vx > 0.2) {
        this.facingLeft = false;
      } else if (typeof a.fx === 'number') {
        if (a.fx < -0.15) this.facingLeft = true;
        else if (a.fx > 0.15) this.facingLeft = false;
      }

      // Front vs Back texture selection based on vertical facing (towards goal or towards camera)
      let fz = typeof a.fz === 'number' ? a.fz : (vz < -0.1 ? -1 : 1);
      if (this.isKeeper) {
        fz = 1; // Keeper in goal always faces into field
      }
      if (fz < -0.1 && this.mat && this.mat.texture !== this.backTex) {
        this.mat.texture = this.backTex;
      } else if (fz >= -0.1 && this.mat && this.mat.texture !== this.frontTex) {
        this.mat.texture = this.frontTex;
      }

      // Keep billboard facing the camera directly regardless of agent's world yaw
      if (this.charRef.root) {
        this.spriteNode.rotation[1] = -this.charRef.root.rotation[1];
      }

      // Athletic camera angle tilt
      const cam = (this.matchView && this.matchView.rig && this.matchView.rig.cam) ? this.matchView.rig.cam : null;
      if (cam && this.charRef.root) {
        const dy = cam.position[1] - (this.charRef.root.position[1] + this.h * 0.5);
        const dz = cam.position[2] - this.charRef.root.position[2];
        const pitchAngle = Math.atan2(dy, Math.max(0.1, dz));
        this.spriteNode.rotation[0] = -pitchAngle;
      }

      // Athletic breathing & run stride
      if (speed > 0.35) {
        this.stepTime += dt * Math.min(18, speed * 4.6);
        const bob = Math.abs(Math.sin(this.stepTime)) * 0.06;
        const tilt = Math.sin(this.stepTime) * 0.05;
        this.spriteNode.position[1] = this.h * 0.5 + bob;
        // Lean slightly into lateral movement
        const lean = Math.max(-0.15, Math.min(0.15, -vx * 0.03));
        this.spriteNode.rotation[2] = lean + tilt;
      } else {
        this.idleTime += dt * 3.4;
        const breath = Math.sin(this.idleTime) * 0.025;
        this.spriteNode.position[1] = this.h * 0.5 + breath;
        this.spriteNode.rotation[2] = 0;
      }

      // Jump / header / dunk elevation
      const elevation = (typeof a.elevation === 'number') ? a.elevation : ((typeof a.y === 'number' && a.y > 0) ? a.y : 0);
      if (elevation > 0) {
        this.spriteNode.position[1] += elevation;
      }
    }

    dispose() {
      if (this.spriteNode && this.charRef && this.charRef.root) {
        try { this.charRef.root.remove(this.spriteNode); } catch (e) {}
      }
      if (this.charRef && this.charRef.pivot) {
        this.charRef.pivot.visible = true;
      }
    }
  }

  // --- Public API & Hook Manager ---

  const CharactersGLB = {
    enabled: true,
    mode: '3d', // High-Fidelity 3D GLB Athletes with Skeletal GPU Skinning & Authentic Sports Animations
    instances: new Map(), // matchView -> (HiRes25DCharacterInstance | GLBCharacterInstance)[]

    init(gl) {
      if (!gl) return;
      initShader(gl);
    },

    setupMatch(matchView) {
      if (!this.enabled || !matchView || !matchView.chars) return;

      if (this.mode === 'procedural') {
        // High-Fidelity Articulated 3D Athletes with natural biomechanics
        matchView.chars.forEach(c => {
          if (c && c.pivot) c.pivot.visible = true;
        });
        return;
      }

      const list = [];
      const mode = matchView.mode;
      const playerChar = matchView.playerChar || (matchView.mode === 'hoops' ? 'hoops' : 'footy');
      const oppChar = matchView.oppChar || (playerChar === 'footy' ? 'hoops' : 'footy');

      matchView.chars.forEach(c => {
        if (!c.agent) return;
        if (c.pivot) {
          c.pivot.visible = false;
        }

        const role = c.agent.role;
        const isKeeper = (role === 'keeper');
        const isTeam0 = (c.agent.team === 0);
        const charSport = isKeeper ? 'footy' : (c.sport || (isTeam0 ? playerChar : oppChar));

        if (this.mode === '2.5d') {
          let frontSrc = 'assets/characters/footy10_front_clean.png';
          let backSrc = 'assets/characters/footy10_back_clean.png';
          let height = 2.45;
          if (isKeeper) {
            frontSrc = 'assets/characters/keeper1_front_clean.png';
            backSrc = 'assets/characters/keeper1_front_clean.png';
            height = 2.60;
          } else if (charSport !== 'footy') {
            frontSrc = 'assets/characters/hoops10_front_clean.png';
            backSrc = 'assets/characters/hoops10_back_clean.png';
            height = 2.55;
          }
          const inst = new HiRes25DCharacterInstance(c, frontSrc, {
            frontSrc,
            backSrc,
            height,
            isKeeper,
            isFooty: (charSport === 'footy'),
            matchView
          });
          list.push(inst);
        } else {
          // 3D GLB Mode (Scaled to prominent, heroic, easily readable stature on mobile screens)
          if (isKeeper) {
            const inst = new GLBCharacterInstance(c, 'assets/characters/keeper1.glb', {
              scale: 1.96,
              skin: c.skin,
              isFooty: true,
              isKeeper: true,
              matchView
            });
            list.push(inst);
          } else if (charSport === 'footy') {
            const inst = new GLBCharacterInstance(c, 'assets/characters/footy10.glb', {
              scale: 1.96,
              skin: c.skin,
              isFooty: true,
              isKeeper: false,
              matchView
            });
            list.push(inst);
          } else {
            const inst = new GLBCharacterInstance(c, 'assets/characters/hoops23.glb', {
              scale: 2.05,
              skin: c.skin,
              isFooty: false,
              isKeeper: false,
              matchView
            });
            list.push(inst);
          }
        }
      });

      if (list.length > 0) {
        this.instances.set(matchView, list);
        activeMatches.add(matchView);
      }
    },

    renderMatch(matchView, dt) {
      if (!this.enabled || !matchView || !matchView.renderer || this.mode === 'procedural') return;
      const list = this.instances.get(matchView);
      if (!list || list.length === 0) return;

      // In 2.5D Mode, instances update their transforms and the scene graph renders them natively!
      if (this.mode === '2.5d') {
        list.forEach(inst => inst.update(dt));
        return;
      }

      const gl = matchView.renderer.gl;
      if (!gl) return;

      const glState = initShader(gl);
      const glProgram = glState.program;
      const glLocations = glState.locs;

      const cam = matchView.rig.cam;
      const scene = matchView.scene;

      // Update character transforms and skeletal animation
      list.forEach(inst => inst.update(dt));

      // Draw all loaded GLB characters
      gl.useProgram(glProgram);
      gl.enable(gl.DEPTH_TEST);
      gl.depthMask(true);
      gl.depthFunc(gl.LEQUAL);
      gl.enable(gl.CULL_FACE);
      gl.cullFace(gl.BACK);

      // Set Camera Uniforms
      gl.uniformMatrix4fv(glLocations.uProj, false, cam.proj);
      gl.uniformMatrix4fv(glLocations.uView, false, cam.view);
      gl.uniform3fv(glLocations.uEye, cam.position);

      // Set balanced Stadium / Indoor Arena Bounce Lighting from Match Scene
      const isFootyMatch = Boolean(matchView && matchView.isFooty);
      const sunDir = [0.42, 0.86, 0.42];
      const sunCol = isFootyMatch ? [1.28, 1.24, 1.15] : [1.32, 1.24, 1.08];
      const skyCol = isFootyMatch ? [0.76, 0.85, 0.98] : [0.80, 0.84, 0.94];
      const gndCol = isFootyMatch ? [0.34, 0.48, 0.36] : [0.52, 0.42, 0.32];

      gl.uniform3fv(glLocations.uSunDir, sunDir);
      gl.uniform3fv(glLocations.uSunColor, sunCol);
      gl.uniform3fv(glLocations.uSkyColor, skyCol);
      gl.uniform3fv(glLocations.uGroundColor, gndCol);

      list.forEach(inst => {
        if (!inst.loaded || !inst.model) {
          // While GLB is loading or parsing, ensure procedural fallback is visible
          if (inst.charRef && inst.charRef.pivot) {
            inst.charRef.pivot.visible = true;
          }
          return;
        }

        // Model is fully ready and drawn this frame: safely hide procedural mesh
        if (inst.charRef && inst.charRef.pivot && inst.charRef.pivot.visible) {
          inst.charRef.pivot.visible = false;
        }

        // Bind custom kit texture whenever any kit is equipped
        if (!inst.customTexture) {
          inst.customTexture = getOrCreateSkinTexture(gl, inst.model, inst.skin, inst.isFooty, inst.isKeeper);
        }

        const buffers = getOrCreateBuffers(gl, inst.model);
        gl.uniformMatrix4fv(glLocations.uModel, false, inst.modelMatrix);
        gl.uniform1f(glLocations.uRunPhase, inst.runPhase || 0.0);
        gl.uniform1f(glLocations.uRunSpeed, inst.runSpeed || 0.0);
        gl.uniform1f(glLocations.uKickPhase, inst.kickPhase || 0.0);

        const skinActive = !!inst.model.skin;
        gl.uniform1i(glLocations.uUseSkinning, skinActive ? 1 : 0);
        if (skinActive) {
          gl.uniformMatrix4fv(glLocations.uBones, false, inst.model.boneMatrices);
        }

        buffers.forEach(pBuf => {
          gl.bindVertexArray(pBuf.vao);

          const matName = (pBuf.material && pBuf.material.name) ? pBuf.material.name : '';
          let bindTex = inst.customTexture || pBuf.texture;
          let useTex = !!bindTex;
          let baseCol = [1, 1, 1, 1];
          if (!useTex && pBuf.material && pBuf.material.baseColorFactor) {
            baseCol = pBuf.material.baseColorFactor;
          }

          gl.uniform1i(glLocations.uHasTex, useTex ? 1 : 0);
          if (useTex && bindTex) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, bindTex);
            gl.uniform1i(glLocations.uTex, 0);
          }

          gl.uniform4fv(glLocations.uBaseColor, baseCol);

          // 3D PBR Material tuning based on body-part material + equipped kit
          const pbr = resolveMaterialPBR(matName, pBuf.material, inst.skin && inst.skin.id);
          gl.uniform1f(glLocations.uRoughness, pbr.roughness);
          gl.uniform1f(glLocations.uMetallic, pbr.metallic);
          if (glLocations.uMatRole) gl.uniform1f(glLocations.uMatRole, pbr.role);

          gl.drawElements(gl.TRIANGLES, pBuf.indexCount, pBuf.indexType, 0);
        });

        gl.bindVertexArray(null);
      });

      gl.useProgram(null);
    },

    disposeMatch(matchView) {
      const list = this.instances.get(matchView);
      if (list) {
        list.forEach(inst => {
          if (inst && typeof inst.dispose === 'function') {
            try { inst.dispose(); } catch (e) {}
          }
        });
        this.instances.delete(matchView);
        activeMatches.delete(matchView);
      }
    },

    mountWardrobePreview(containerEl, charId, kitId, opts) {
      if (typeof document === 'undefined' || !containerEl) return false;
      const preview = ensureWardrobeStage();
      if (!preview || !preview.gl) return false;

      if (preview.canvas.parentElement !== containerEl) {
        containerEl.innerHTML = '';
        containerEl.appendChild(preview.canvas);
      }
      preview.resize(containerEl);
      preview.setSubject(charId || 'footy', kitId || (charId === 'hoops' ? 'hoops_classic' : 'footy_classic'), opts);
      preview.start();
      return true;
    },

    setWardrobePreviewKit(charId, kitId) {
      if (!wardrobeStageState) return false;
      wardrobeStageState.setSubject(charId, kitId);
      return true;
    },

    playWardrobePreviewAnim(animName) {
      if (!wardrobeStageState || !wardrobeStageState.model) return false;
      wardrobeStageState.model.setAnimation(animName, { blendDuration: 0.16, restart: true });
      wardrobeStageState.animResetAt = performance.now() + 2200;
      return true;
    },

    unmountWardrobePreview() {
      if (wardrobeStageState) {
        wardrobeStageState.stop();
        if (wardrobeStageState.canvas && wardrobeStageState.canvas.parentElement) {
          wardrobeStageState.canvas.remove();
        }
      }
    },

    async renderSnapshotPng(charId, kitId, opts) {
      const o = opts || {};
      const st = ensureWardrobeStage();
      if (!st || !st.gl) return null;
      const wasConnected = st.canvas.isConnected;
      if (!wasConnected) {
        st.canvas.style.position = 'fixed';
        st.canvas.style.left = '-9999px';
        st.canvas.style.top = '-9999px';
        document.body.appendChild(st.canvas);
      }
      st.stop();
      const w = o.width || 360;
      const h = o.height || 360;
      st.canvas.width = w;
      st.canvas.height = h;
      st.setSubject(charId || 'footy', kitId || 'footy_classic', Object.assign({ autoRotate: false, hideShadow: o.hideShadow !== false }, o));
      // Ensure GLB model & kit atlas image finishes uploading
      const loader = getLoader();
      const url = (charId === 'keeper') ? '/assets/characters/keeper1.glb' : (charId === 'hoops' ? '/assets/characters/hoops23.glb' : '/assets/characters/footy10.glb');
      if (loader && loader.loadGLB) {
        const m = await loader.loadGLB(url);
        st.modelsByChar[charId || 'footy'] = m;
        st.model = m;
        st.model.setAnimation(o.anim || 'Idle', { blendDuration: 0 });
      }
      const atlasUrl = KIT_ATLAS_MAP[kitId] || (charId === 'hoops' ? KIT_ATLAS_MAP.hoops_classic : (charId === 'keeper' ? KIT_ATLAS_MAP.keeper_0_volt : KIT_ATLAS_MAP.footy_classic));
      if (atlasUrl) {
        await new Promise(resolve => {
          const im = preloadImage(atlasUrl);
          if (!im || im.complete) return resolve();
          im.addEventListener('load', resolve, { once: true });
          im.addEventListener('error', resolve, { once: true });
        });
        st.customTexture = loadAtlasTexture(st.gl, atlasUrl);
      }
      st.drawFrame(0.016);
      const dataUrl = st.canvas.toDataURL('image/png');
      if (!wasConnected) st.canvas.remove();
      return dataUrl;
    }
  };

  // --- Persistent Instant In-Page 3D Showcase Stage (Zero Iframe Lag) ---
  let wardrobeStageState = null;

  function _mat4Perspective(out, fov, aspect, near, far) {
    const f = 1.0 / Math.tan(fov / 2), nf = 1 / (near - far);
    out.fill(0);
    out[0] = f / aspect; out[5] = f;
    out[10] = (far + near) * nf; out[11] = -1;
    out[14] = (2 * far * near) * nf;
  }

  function _mat4LookAt(out, eye, center, up) {
    let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
    z0 = eye[0] - center[0]; z1 = eye[1] - center[1]; z2 = eye[2] - center[2];
    len = 1 / (Math.hypot(z0, z1, z2) || 1);
    z0 *= len; z1 *= len; z2 *= len;
    x0 = up[1] * z2 - up[2] * z1; x1 = up[2] * z0 - up[0] * z2; x2 = up[0] * z1 - up[1] * z0;
    len = Math.hypot(x0, x1, x2);
    if (len) { x0 /= len; x1 /= len; x2 /= len; }
    y0 = z1 * x2 - z2 * x1; y1 = z2 * x0 - z0 * x2; y2 = z0 * x1 - z1 * x0;
    out[0] = x0; out[1] = y0; out[2] = z0; out[3] = 0;
    out[4] = x1; out[5] = y1; out[6] = z1; out[7] = 0;
    out[8] = x2; out[9] = y2; out[10] = z2; out[11] = 0;
    out[12] = -(x0 * eye[0] + x1 * eye[1] + x2 * eye[2]);
    out[13] = -(y0 * eye[0] + y1 * eye[1] + y2 * eye[2]);
    out[14] = -(z0 * eye[0] + z1 * eye[1] + z2 * eye[2]);
    out[15] = 1;
  }

  function ensureWardrobeStage() {
    if (wardrobeStageState) return wardrobeStageState;
    if (typeof document === 'undefined') return null;

    const canvas = document.createElement('canvas');
    canvas.className = 'fvh-wardrobe-3d-canvas';
    canvas.style.cssText = 'width:100%;height:100%;display:block;background:transparent;touch-action:none;cursor:grab;outline:none;';

    const gl = canvas.getContext('webgl2', { antialias: true, alpha: true, premultipliedAlpha: false, depth: true });
    if (!gl) return null;

    const glState = initShader(gl);

    // Soft studio ground contact shadow shader
    const shVS = `#version 300 es
    precision highp float;
    layout(location=0) in vec2 aP;
    uniform mat4 uProj, uView;
    out vec2 vP;
    void main(){ vP = aP; gl_Position = uProj * uView * vec4(aP.x * 0.72, 0.005, aP.y * 0.72, 1.0); }`;
    const shFS = `#version 300 es
    precision highp float;
    in vec2 vP;
    out vec4 o;
    void main(){ float d = length(vP); float a = exp(-d * d * 4.5) * 0.65 * smoothstep(1.0, 0.25, d); o = vec4(0.0, 0.02, 0.06, a); }`;
    const cs = (t, s) => { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); return sh; };
    const sp = gl.createProgram();
    gl.attachShader(sp, cs(gl.VERTEX_SHADER, shVS));
    gl.attachShader(sp, cs(gl.FRAGMENT_SHADER, shFS));
    gl.linkProgram(sp);
    glState.shadowProg = sp;
    glState.shadowLocs = { uProj: gl.getUniformLocation(sp, 'uProj'), uView: gl.getUniformLocation(sp, 'uView') };
    const sVao = gl.createVertexArray();
    gl.bindVertexArray(sVao);
    const sBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    glState.shadowVao = sVao;

    const st = {
      canvas, gl, glState,
      charId: null, kitId: null,
      modelsByChar: {},
      model: null, customTexture: null,
      yaw: 0.22, pitch: 0.08, dist: 3.15, target: [0, 0.90, 0], hideShadow: false,
      dragging: false, lastX: 0, lastY: 0, autoSpin: true,
      rafId: 0, lastT: performance.now(), animResetAt: 0,
      proj: new Float32Array(16), view: new Float32Array(16), modelMat: new Float32Array(16),

      resize(containerEl) {
        const rect = (containerEl || canvas.parentElement || canvas).getBoundingClientRect();
        const w = Math.max(240, Math.round(rect.width || 300));
        const h = Math.max(240, Math.round(rect.height || 300));
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
          canvas.width = Math.round(w * dpr);
          canvas.height = Math.round(h * dpr);
        }
      },

      setSubject(charId, kitId, opts) {
        const o = opts || {};
        if (o.autoRotate !== undefined) st.autoSpin = Boolean(o.autoRotate);
        if (o.yaw !== undefined) st.yaw = Number(o.yaw);
        else if (o.targetYaw !== undefined) st.yaw = Number(o.targetYaw);
        if (o.pitch !== undefined) st.pitch = Number(o.pitch);
        if (o.dist !== undefined) st.dist = Number(o.dist);
        if (o.targetY !== undefined) st.target[1] = Number(o.targetY);
        if (o.hideShadow !== undefined) st.hideShadow = Boolean(o.hideShadow);
        const nextChar = charId || 'footy';
        const nextKit = kitId || (nextChar === 'hoops' ? 'hoops_classic' : nextChar === 'keeper' ? 'keeper_0_volt' : 'footy_classic');
        const charChanged = (st.charId !== nextChar) || !st.model;
        st.charId = nextChar;
        st.kitId = nextKit;

        const isFooty = nextChar === 'footy';
        const isKeeper = nextChar === 'keeper';
        const url = isKeeper ? '/assets/characters/keeper1.glb' : (nextChar === 'hoops' ? '/assets/characters/hoops23.glb' : '/assets/characters/footy10.glb');

        // Apply texture immediately if mapped
        const fakeSkin = { id: nextKit };
        st.customTexture = getOrCreateSkinTexture(gl, st.model, fakeSkin, isFooty, isKeeper);

        if (charChanged) {
          if (st.modelsByChar[nextChar]) {
            st.model = st.modelsByChar[nextChar];
            st.model.setAnimation('Idle', { blendDuration: 0 });
            return;
          }
          const loader = getLoader();
          if (!loader) return;
          const cached = loader.getCachedModel ? loader.getCachedModel(url) : null;
          if (cached) {
            st.modelsByChar[nextChar] = cached;
            st.model = cached;
            st.model.setAnimation('Idle', { blendDuration: 0 });
          } else {
            loader.loadGLB(url).then(m => {
              st.modelsByChar[nextChar] = m;
              if (st.charId === nextChar) {
                st.model = m;
                st.model.setAnimation('Idle', { blendDuration: 0 });
              }
            }).catch(e => console.warn('[Wardrobe3D] Load error:', e));
          }
        }
      },

      drawFrame(dt) {
          const now = performance.now();
          if (st.autoSpin && !st.dragging) {
            st.yaw += dt * 0.35;
          }
          if (st.animResetAt && now > st.animResetAt && st.model) {
            st.animResetAt = 0;
            st.model.setAnimation('Idle', { blendDuration: 0.20 });
          }

          gl.viewport(0, 0, canvas.width, canvas.height);
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

          const aspect = canvas.width / Math.max(1, canvas.height);
          const fitDist = aspect < 0.85 ? st.dist / Math.max(0.68, aspect) * 0.88 : st.dist;
          _mat4Perspective(st.proj, 38 * Math.PI / 180, aspect, 0.1, 40.0);
          const eye = [
            st.target[0] + Math.sin(st.yaw) * Math.cos(st.pitch) * fitDist,
            st.target[1] + Math.sin(st.pitch) * fitDist,
            st.target[2] + Math.cos(st.yaw) * Math.cos(st.pitch) * fitDist
          ];
          _mat4LookAt(st.view, eye, st.target, [0, 1, 0]);

          if (!st.hideShadow) {
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.depthMask(false);
            gl.useProgram(glState.shadowProg);
            gl.uniformMatrix4fv(glState.shadowLocs.uProj, false, st.proj);
            gl.uniformMatrix4fv(glState.shadowLocs.uView, false, st.view);
            gl.bindVertexArray(glState.shadowVao);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            gl.bindVertexArray(null);
            gl.depthMask(true);
            gl.disable(gl.BLEND);
          }

          if (!st.model) return;
          st.model.update(dt);

          const p = glState.program, l = glState.locs;
          gl.useProgram(p);
          gl.enable(gl.DEPTH_TEST);
          gl.depthMask(true);
          gl.depthFunc(gl.LEQUAL);
          gl.enable(gl.CULL_FACE);
          gl.cullFace(gl.BACK);

          gl.uniformMatrix4fv(l.uProj, false, st.proj);
          gl.uniformMatrix4fv(l.uView, false, st.view);
          gl.uniform3fv(l.uEye, eye);
          gl.uniform3f(l.uSunDir, 0.45, 0.85, 0.55);
          gl.uniform3f(l.uSunColor, 1.30, 1.24, 1.15);
          gl.uniform3f(l.uSkyColor, 0.72, 0.82, 0.98);
          gl.uniform3f(l.uGroundColor, 0.30, 0.34, 0.42);

          makeTransformMatrix(st.modelMat, 0, 0, 0, 0, 1.0, 1.0, 1.0);
          gl.uniformMatrix4fv(l.uModel, false, st.modelMat);
          gl.uniform1f(l.uRunPhase, 0);
          gl.uniform1f(l.uRunSpeed, 0);
          gl.uniform1f(l.uKickPhase, 0);

          const skinned = !!st.model.skin;
          gl.uniform1i(l.uUseSkinning, skinned ? 1 : 0);
          if (skinned) gl.uniformMatrix4fv(l.uBones, false, st.model.boneMatrices);

          const buffers = getOrCreateBuffers(gl, st.model);
          buffers.forEach(pBuf => {
            gl.bindVertexArray(pBuf.vao);
            const bindTex = st.customTexture || pBuf.texture;
            const useTex = !!bindTex;
            const baseCol = (!useTex && pBuf.material && pBuf.material.baseColorFactor) ? pBuf.material.baseColorFactor : [1, 1, 1, 1];
            gl.uniform1i(l.uHasTex, useTex ? 1 : 0);
            if (useTex) {
              gl.activeTexture(gl.TEXTURE0);
              gl.bindTexture(gl.TEXTURE_2D, bindTex);
              gl.uniform1i(l.uTex, 0);
            }
            gl.uniform4fv(l.uBaseColor, baseCol);
            const matName = (pBuf.material && pBuf.material.name) ? pBuf.material.name : '';
            const pbr = resolveMaterialPBR(matName, pBuf.material, st.kitId);
            gl.uniform1f(l.uRoughness, pbr.roughness);
            gl.uniform1f(l.uMetallic, pbr.metallic);
            if (l.uMatRole) gl.uniform1f(l.uMatRole, pbr.role);
            gl.drawElements(gl.TRIANGLES, pBuf.indexCount, pBuf.indexType, 0);
          });
          gl.bindVertexArray(null);
          gl.useProgram(null);
      },

      start() {
        if (st.rafId) return;
        st.lastT = performance.now();
        const tick = (now) => {
          if (!canvas.isConnected) {
            st.rafId = 0;
            return;
          }
          st.rafId = requestAnimationFrame(tick);
          st.resize(canvas.parentElement);
          const dt = Math.min(0.05, Math.max(0.001, (now - st.lastT) / 1000));
          st.lastT = now;
          st.drawFrame(dt);
        };
        st.rafId = requestAnimationFrame(tick);
      },

      stop() {
        if (st.rafId) { cancelAnimationFrame(st.rafId); st.rafId = 0; }
      }
    };

    // 360° Pointer/Touch Orbit & Wheel Zoom
    canvas.addEventListener('pointerdown', (e) => {
      st.dragging = true;
      st.autoSpin = false;
      st.lastX = e.clientX;
      st.lastY = e.clientY;
      canvas.style.cursor = 'grabbing';
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!st.dragging) return;
      const dx = e.clientX - st.lastX;
      const dy = e.clientY - st.lastY;
      st.lastX = e.clientX;
      st.lastY = e.clientY;
      st.yaw -= dx * 0.011;
      st.pitch = Math.max(-0.22, Math.min(0.65, st.pitch + dy * 0.008));
    });
    const endDrag = () => {
      if (!st.dragging) return;
      st.dragging = false;
      canvas.style.cursor = 'grab';
    };
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      st.dist = Math.max(2.15, Math.min(4.4, st.dist + e.deltaY * 0.002));
    }, { passive: false });

    wardrobeStageState = st;
    return st;
  }

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
        if (MV.__glbHooked) return true;
        MV.__glbHooked = true;

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
        return true;
      }
    } catch (err) {
      console.warn('[CharactersGLB] MatchView hook deferred:', err.message);
    }
  }

  if (typeof window !== 'undefined') {
    window.CharactersGLB = CharactersGLB;
    let hookTries = 0;
    function tryHook() {
      if (installHook()) return;
      if (++hookTries < 25) setTimeout(tryHook, 40);
    }
    tryHook();
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', tryHook);
    }
  }

  exports.CharactersGLB = CharactersGLB;
  exports.GLBCharacterInstance = GLBCharacterInstance;
});
