const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const glbPath = path.join(ROOT, 'render/characters_glb.js');
let s = fs.readFileSync(glbPath, 'utf8');

// 1. Update FS_SRC lighting and rim light
s = s.replace(
  /\/\/ Crisp Athletic Stadium Rim Contour[\s\S]*?fragColor = vec4\(finalRgb, baseColor\.a\);/,
  `// Soft Broadcast-Grade Stadium Rim Light (gentle contour without harsh halos)
    float rim = pow(1.0 - NdotV, 3.5);
    vec3 rimColor = mix(vec3(0.85, 0.92, 1.0), vec3(1.0, 0.95, 0.82), NdotL * 0.5 + 0.5);
    vec3 rimLight = rim * rimColor * 0.35;

    // Vibrant Broadcast Color Grading (Fortnite / Pixar warm daylight)
    vec3 finalRgb = ambient * 1.15 + diffuse * 1.05 + specular * 0.75 + rimLight;
    fragColor = vec4(finalRgb, baseColor.a);`
);

// 2. getOrCreateSkinTexture: return null for default hero skins
s = s.replace(
  /function getOrCreateSkinTexture\(gl, model, skin, isFooty\) \{\r?\n\s*if \(!gl \|\| !model \|\| !skin \|\| !skin\.id\) return null;/,
  `function getOrCreateSkinTexture(gl, model, skin, isFooty) {
    if (!gl || !model || !skin || !skin.id) return null;
    // Default hero skins use the pristine embedded 1024x1024 atlas directly
    if (skin.id === 'skin_rookie' || skin.id === 'skin_solar' || skin.id === 'skin_bb_onyx' || skin.id === 'skin_classic') {
      return null;
    }`
);

fs.writeFileSync(glbPath, s, 'utf8');
console.log('✓ Shading and default skin bypass cleanly patched!');
