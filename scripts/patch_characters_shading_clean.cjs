const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const glbPath = path.join(ROOT, 'render/characters_glb.js');
let s = fs.readFileSync(glbPath, 'utf8');

// 1. Update FS_SRC lighting and rim light
const targetFsSrc = `    // Crisp Athletic Stadium Rim Contour (High-clarity player silhouette)
    float rim = pow(1.0 - NdotV, 2.4);
    vec3 rimColor = mix(vec3(0.42, 0.78, 1.0), vec3(1.0, 0.92, 0.65), NdotL * 0.5 + 0.5);
    vec3 rimLight = rim * rimColor * (1.65 + (1.0 - uRoughness) * 1.25);

    // Console-grade contrast curve for crisp, vivid athlete details
    vec3 finalRgb = ambient + diffuse + specular + rimLight;
    finalRgb = mix(finalRgb, finalRgb * finalRgb * (3.0 - 2.0 * finalRgb), 0.12);
    fragColor = vec4(finalRgb, baseColor.a);`;

const replaceFsSrc = `    // Soft Broadcast-Grade Stadium Rim Light (gentle contour without harsh halos)
    float rim = pow(1.0 - NdotV, 3.5);
    vec3 rimColor = mix(vec3(0.85, 0.92, 1.0), vec3(1.0, 0.95, 0.82), NdotL * 0.5 + 0.5);
    vec3 rimLight = rim * rimColor * 0.35;

    // Vibrant Broadcast Color Grading (Fortnite / Pixar warm daylight)
    vec3 finalRgb = ambient * 1.15 + diffuse * 1.05 + specular * 0.75 + rimLight;
    fragColor = vec4(finalRgb, baseColor.a);`;

if (s.includes(targetFsSrc)) {
  s = s.replace(targetFsSrc, replaceFsSrc);
  console.log('✓ Patched FS_SRC lighting and soft rim');
} else {
  console.warn('targetFsSrc not found');
}

// 2. Update ambient and sun lighting uniforms in renderMatch
s = s.replace(/const sunDir = scene\.sunDir \|\| \[0\.35, 0\.85, 0\.40\];/, 'const sunDir = [0.45, 0.85, 0.38];');
s = s.replace(/const sunCol = scene\.sunColor \|\| \[1\.1, 1\.05, 0\.98\];/, 'const sunCol = [1.25, 1.20, 1.12];');
s = s.replace(/const skyCol = scene\.sky \|\| \[0\.22, 0\.32, 0\.48\];/, 'const skyCol = [0.72, 0.80, 0.92];');
s = s.replace(/const gndCol = scene\.ground \|\| \[0\.12, 0\.15, 0\.20\];/, 'const gndCol = [0.45, 0.50, 0.55];');
console.log('✓ Patched renderMatch sun and ambient colors to bright daylight');

// 3. Update getOrCreateSkinTexture: Default skins use embedded pristine atlas directly!
const targetGetSkin = `function getOrCreateSkinTexture(gl, model, skin, isFooty) {
    if (!gl || !model || !skin || !skin.id) return null;

    const key = (isFooty ? 'footy_' : 'hoops_') + skin.id + '_' + (skin.primary || 0);`;

const replaceGetSkin = `function getOrCreateSkinTexture(gl, model, skin, isFooty) {
    if (!gl || !model || !skin || !skin.id) return null;
    // Default hero skins use the pristine embedded 1024x1024 atlas directly
    if (skin.id === 'skin_rookie' || skin.id === 'skin_solar' || skin.id === 'skin_bb_onyx' || skin.id === 'skin_classic') {
      return null;
    }

    const key = (isFooty ? 'footy_' : 'hoops_') + skin.id + '_' + (skin.primary || 0);`;

if (s.includes(targetGetSkin)) {
  s = s.replace(targetGetSkin, replaceGetSkin);
  console.log('✓ Patched getOrCreateSkinTexture for pristine default hero skins');
} else {
  console.warn('targetGetSkin not found');
}

// 4. Update Material Mapping in renderMatch loop: Strictly isolate skin/hair/eyes from texture!
const targetMatMap = /buffers\.forEach\(pBuf => \{[\s\S]*?gl\.uniform1i\(glLocations\.uHasTex, useTex \? 1 : 0\);/;

const replaceMatMap = `buffers.forEach(pBuf => {
          gl.bindVertexArray(pBuf.vao);

          const matName = (pBuf.material && pBuf.material.name) ? pBuf.material.name : '';
          let baseCol = [1, 1, 1, 1];
          let bindTex = inst.customTexture || pBuf.texture;
          let useTex = false;

          const isTorso = (matName === 'LightBrown');
          const isLegs = (matName === 'LightBlue');
          const isBoots = (matName === 'Red_Dark');
          const isOutsole = (matName === 'White');
          const isSkin = (matName === 'Skin' || matName === 'Skin_Darker');
          const isHair = (matName === 'Hair');
          const isEye = (matName === 'Eye');
          const isEyebrow = (matName === 'Eyebrows');

          // Strict Material Separation: ONLY Clothing & Footwear sample textures!
          if (isTorso || isLegs || isBoots || isOutsole) {
            useTex = !!bindTex;
            baseCol = [1, 1, 1, 1];
            if (inst.isKeeper) {
              if (isTorso) baseCol = [0.10, 0.95, 0.50, 1.0]; // Vibrant Goalkeeper Green
              else if (isLegs) baseCol = [0.05, 0.22, 0.12, 1.0];
              else if (isBoots) baseCol = [0.10, 0.95, 0.50, 1.0];
            }
          } else {
            // Anatomy: Pure, radiant, healthy PBR materials with ZERO texture bleed!
            useTex = false;
            if (isSkin) {
              // Radiant athletic skin
              if (inst.isFooty) {
                baseCol = [0.96, 0.76, 0.63, 1.0]; // Bright natural tan
              } else {
                baseCol = [0.52, 0.33, 0.20, 1.0]; // Warm athletic bronze
              }
              if (inst.skin && inst.skin.skin) {
                const sRgb = hexToVec3(inst.skin.skin);
                baseCol = [sRgb[0] * 1.15, sRgb[1] * 1.15, sRgb[2] * 1.15, 1.0];
              }
            } else if (isHair) {
              // Rich styled hair
              if (inst.isFooty) {
                baseCol = [0.24, 0.15, 0.10, 1.0]; // Dark chestnut brown
              } else {
                baseCol = [0.08, 0.08, 0.10, 1.0]; // Midnight black fade
              }
              if (inst.skin && inst.skin.hair) {
                const hRgb = hexToVec3(inst.skin.hair);
                baseCol = [hRgb[0], hRgb[1], hRgb[2], 1.0];
              }
            } else if (isEye) {
              // Sparkling white sclera
              baseCol = [0.98, 0.98, 1.0, 1.0];
            } else if (isEyebrow) {
              // Crisp dark brows
              baseCol = inst.isFooty ? [0.18, 0.12, 0.08, 1.0] : [0.08, 0.08, 0.10, 1.0];
            }
          }

          gl.uniform1i(glLocations.uHasTex, useTex ? 1 : 0);`;

if (s.match(targetMatMap)) {
  s = s.replace(targetMatMap, replaceMatMap);
  console.log('✓ Patched Material Mapping: pure radiant skin/hair/eyes, crisp uniforms');
} else {
  console.warn('targetMatMap not matched');
}

fs.writeFileSync(glbPath, s, 'utf8');
console.log('=== characters_glb.js clean shading patch complete! ===');
