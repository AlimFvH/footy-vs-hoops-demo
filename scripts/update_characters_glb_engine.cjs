const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const glbJsPath = path.join(ROOT, 'render/characters_glb.js');
let code = fs.readFileSync(glbJsPath, 'utf8');

// Normalize line endings to LF for clean manipulation
code = code.replace(/\r\n/g, '\n');

// 1. Hook onPostAnimate in GLBCharacterInstance.update
const targetAnim = '      // 3. Step skeletal bones\n      this.model.update(dt);';
const replAnim = `      // 3. Step skeletal bones with procedural athletic animation blending
      this.model.onPostAnimate = (nodes, time) => {
        // A. Basketball Kinetic Arm & Dribbling Animations
        if (isBasketballMode) {
          if (a.dunk && a.dunk.active) {
            // Soaring Slam Dunk: Reach high overhead with right arm to rim
            if (nodes[46]) { nodes[46].rotation[0] = -1.85; nodes[46].rotation[2] = 0.25; }
            if (nodes[45]) { nodes[45].rotation[0] = -0.45; }
            if (nodes[23]) { nodes[23].rotation[0] = -1.20; nodes[23].rotation[2] = -0.35; }
          } else if (a.shotT > 0) {
            // Jump Shot: High elevation release with wrist cocked
            if (nodes[46]) { nodes[46].rotation[0] = -1.95; nodes[46].rotation[2] = 0.15; }
            if (nodes[45]) { nodes[45].rotation[0] = -0.60; }
            if (nodes[23]) { nodes[23].rotation[0] = -1.65; nodes[23].rotation[2] = -0.20; }
          } else if (isBallCarrier) {
            // Live Basketball Dribbling: Right hand rhythmically pushes ball to court
            const bounce = Math.sin(time * 14);
            if (nodes[46]) { // UpperArm.R
              nodes[46].rotation[0] = 0.42 + bounce * 0.22;
              nodes[46].rotation[1] = -0.15;
              nodes[46].rotation[2] = 0.20;
            }
            if (nodes[45]) { // LowerArm.R
              nodes[45].rotation[0] = -0.55 + bounce * 0.32;
            }
            if (nodes[23]) { // UpperArm.L (Shielding off defender)
              nodes[23].rotation[0] = -0.45;
              nodes[23].rotation[2] = -0.35;
            }
          }
        }
      };

      this.model.update(dt);`;

if (code.includes(targetAnim)) {
  code = code.replace(targetAnim, replAnim);
  console.log('✓ Hooked onPostAnimate in characters_glb.js');
} else {
  console.log('✗ targetAnim not found');
}

// 2. Enable textures for all primitives in renderMatch
const oldMatLogic = `          // Strict Material Separation: ONLY Clothing & Footwear sample textures!
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
              // Focused athletic eyes (dark espresso iris)
              baseCol = [0.08, 0.06, 0.05, 1.0];
            } else if (isEyebrow) {
              // Crisp dark brows
              baseCol = inst.isFooty ? [0.18, 0.12, 0.08, 1.0] : [0.08, 0.08, 0.10, 1.0];
            }
          }`;

const newMatLogic = `          // All Hero athlete primitives (Torso, Legs, Boots, Skin, Hair, Eye, Brows)
          // sample the baked high-definition Fortnite atlas for photorealistic stylized fidelity!
          useTex = !!bindTex;
          baseCol = [1, 1, 1, 1];

          if (inst.isKeeper) {
            if (isTorso) baseCol = [0.10, 0.95, 0.50, 1.0]; // Vibrant Goalkeeper Green
            else if (isLegs) baseCol = [0.05, 0.22, 0.12, 1.0];
            else if (isBoots) baseCol = [0.10, 0.95, 0.50, 1.0];
          }`;

if (code.includes(oldMatLogic)) {
  code = code.replace(oldMatLogic, newMatLogic);
  console.log('✓ Updated material texture logic in characters_glb.js');
} else {
  console.log('✗ oldMatLogic not found');
}

fs.writeFileSync(glbJsPath, code, 'utf8');

const ALT_PATH = 'C:/Users/ASUS/Desktop/игра Footy Vs Hoops/render/characters_glb.js';
if (fs.existsSync(ALT_PATH)) {
  fs.writeFileSync(ALT_PATH, code, 'utf8');
  console.log('✓ Synced to alternate workspace:', ALT_PATH);
}

const ALT_LOADER = 'C:/Users/ASUS/Desktop/игра Footy Vs Hoops/assets/loaders/glb_loader.js';
const SRC_LOADER = path.join(ROOT, 'assets/loaders/glb_loader.js');
if (fs.existsSync(ALT_LOADER) && fs.existsSync(SRC_LOADER)) {
  fs.copyFileSync(SRC_LOADER, ALT_LOADER);
  console.log('✓ Synced glb_loader.js to alternate workspace');
}
