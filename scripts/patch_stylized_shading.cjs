const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '../render/characters_glb.js');
let code = fs.readFileSync(targetPath, 'utf8');

// 1. Replace eye color from zombie white to athletic focused dark espresso
code = code.replace(
  /\/\/ Sparkling white sclera[\s\S]*?baseCol\s*=\s*\[0\.98,\s*0\.98,\s*1\.0,\s*1\.0\];/g,
  '// Focused athletic eyes (dark espresso iris)\n              baseCol = [0.08, 0.06, 0.05, 1.0];'
);

// 2. Replace FS_SRC with stylized Half-Lambert wrapped diffuse + SSS skin shader
const fsStart = code.indexOf('const FS_SRC = `#version 300 es');
const fsEnd = code.indexOf('// Shared GL State & Cache', fsStart);

if (fsStart !== -1 && fsEnd !== -1) {
  const newFS = `const FS_SRC = \`#version 300 es
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

    float NdotL = dot(N, L);
    float NdotV = max(dot(N, V), 0.001);

    // Stylized Half-Lambert Wrapped Diffuse (eliminates harsh low-poly facet lines)
    float wrappedL = NdotL * 0.42 + 0.58;
    float directL = smoothstep(0.10, 0.90, wrappedL);

    // Subsurface Skin Scatter (gives skin organic depth and eliminates polygon edges)
    float sss = pow(clamp(1.0 - NdotL, 0.0, 1.0), 2.2) * 0.24;
    vec3 sssTint = baseColor.rgb * vec3(1.25, 0.68, 0.50);

    // Hemispheric Ambient Lighting
    vec3 ambient = mix(uGroundColor, uSkyColor, N.y * 0.45 + 0.55) * baseColor.rgb * 0.95;

    // Diffuse Sunlight + SSS
    vec3 diffuse = baseColor.rgb * uSunColor * directL * (1.0 - uMetallic) + sssTint * sss;

    // Stylized Soft Specular (Pixar / Fortnite smooth sheen)
    float specPow = mix(18.0, 72.0, 1.0 - uRoughness);
    float specInt = pow(max(dot(N, H), 0.0), specPow) * mix(0.18, 0.65, uMetallic);
    vec3 specular = uSunColor * specInt;

    // Broadcast Stadium Rim Light (heroic silhouette contour)
    float rim = pow(clamp(1.0 - NdotV, 0.0, 1.0), 3.0);
    vec3 rimColor = mix(vec3(0.85, 0.95, 1.0), vec3(1.0, 0.92, 0.80), N.y * 0.5 + 0.5);
    vec3 rimLight = rim * rimColor * 0.45;

    // Vibrant Final Color
    vec3 finalRgb = ambient * 1.10 + diffuse * 1.05 + specular + rimLight;
    fragColor = vec4(finalRgb, baseColor.a);
  \`;\n\n  `;

  code = code.slice(0, fsStart) + newFS + code.slice(fsEnd);
  fs.writeFileSync(targetPath, code);
  console.log('✓ Successfully patched render/characters_glb.js with stylized Fortnite/Pixar shader & focused eyes!');
} else {
  console.error('Could not find FS_SRC boundaries', fsStart, fsEnd);
  process.exit(1);
}
