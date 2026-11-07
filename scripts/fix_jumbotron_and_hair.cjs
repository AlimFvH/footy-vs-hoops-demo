const fs = require('fs');
const path = require('path');

// 1. Fix Jumbotron in js/game.js: Only create North Jumbotron (s = -1)
const gameJsPath = path.join(__dirname, '../js/game.js');
let gameCode = fs.readFileSync(gameJsPath, 'utf8');

console.log('[1/3] Fixing Jumbotron positioning in js/game.js...');

// Basketball Jumbotron: change loop to only s = -1
const hoopsJumboOld = `for (const s of [-1, 1]) {
            const jumbo = new scene_js_1.Node();
            jumbo.setPos(0, 5.8, s * (L + APRON + 1.8));
            jumbo.rotation = [s * 0.12, s < 0 ? 0 : Math.PI, 0];`;

const hoopsJumboNew = `for (const s of [-1]) {
            const jumbo = new scene_js_1.Node();
            jumbo.setPos(0, 5.8, -(L + APRON + 1.8));
            jumbo.rotation = [-0.08, 0, 0];`;

if (gameCode.includes(hoopsJumboOld)) {
  gameCode = gameCode.replace(hoopsJumboOld, hoopsJumboNew);
  console.log('  -> Basketball North Jumbotron fixed (South camera-blocking box eliminated)');
} else {
  // Try regex replacement
  gameCode = gameCode.replace(
    /for\s*\(const\s+s\s+of\s+\[-1,\s*1\]\)\s*\{\s*const\s+jumbo\s*=\s*new\s+scene_js_1\.Node\(\);\s*jumbo\.setPos\(0,\s*5\.8,\s*s\s*\*\s*\(L\s*\+\s*APRON\s*\+\s*1\.8\)\);/g,
    `for (const s of [-1]) {
            const jumbo = new scene_js_1.Node();
            jumbo.setPos(0, 5.8, -(L + APRON + 1.8));`
  );
  console.log('  -> Applied regex fix for Basketball Jumbotron.');
}

// Football Jumbotron: change loop to only s = -1
const footyJumboOld = `for (const s of [-1, 1]) {
            const jumbo = new scene_js_1.Node();
            jumbo.setPos(0, 5.8, s * (L + GD + 2.0));
            jumbo.rotation = [s * 0.12, s < 0 ? 0 : Math.PI, 0];`;

const footyJumboNew = `for (const s of [-1]) {
            const jumbo = new scene_js_1.Node();
            jumbo.setPos(0, 5.8, -(L + GD + 2.0));
            jumbo.rotation = [-0.08, 0, 0];`;

if (gameCode.includes(footyJumboOld)) {
  gameCode = gameCode.replace(footyJumboOld, footyJumboNew);
  console.log('  -> Football North Jumbotron fixed (South camera-blocking box eliminated)');
} else {
  gameCode = gameCode.replace(
    /for\s*\(const\s+s\s+of\s+\[-1,\s*1\]\)\s*\{\s*const\s+jumbo\s*=\s*new\s+scene_js_1\.Node\(\);\s*jumbo\.setPos\(0,\s*5\.8,\s*s\s*\*\s*\(L\s*\+\s*GD\s*\+\s*2\.0\)\);/g,
    `for (const s of [-1]) {
            const jumbo = new scene_js_1.Node();
            jumbo.setPos(0, 5.8, -(L + GD + 2.0));`
  );
  console.log('  -> Applied regex fix for Football Jumbotron.');
}

fs.writeFileSync(gameJsPath, gameCode, 'utf8');

// 2. Fix characters_glb.js to explicitly color hair, skin, eyes, and eyebrows
console.log('[2/3] Updating render/characters_glb.js texture atlas painting...');
const glbJsPath = path.join(__dirname, '../render/characters_glb.js');
let glbCode = fs.readFileSync(glbJsPath, 'utf8');

// Find buildSkinTexture
const buildSkinOld = `      // Render high-detail rarity patterns, club crest, and squad numbers onto uniform
      drawGlbJerseyPattern(ctx, W, H, isFooty, skin.id, skin);`;

const buildSkinNew = `      // Explicitly paint genuine Fortnite stylized Hair, Face Skin, and Facial Features onto Atlas
      const hColor = isFooty ? (skin.hair ? hexToRgb(skin.hair) : [34, 24, 16]) : (skin.hair ? hexToRgb(skin.hair) : [10, 10, 10]);
      const sColor = isFooty ? (skin.skin ? hexToRgb(skin.skin) : [223, 160, 112]) : (skin.skin ? hexToRgb(skin.skin) : [108, 68, 36]);

      // 1. Stylized Hair (U: 0.78 to 0.98, V: 0.51 to 0.63)
      ctx.fillStyle = \`rgb(\${hColor[0]}, \${hColor[1]}, \${hColor[2]})\`;
      ctx.fillRect(W * 0.78, H * 0.51, W * 0.20, H * 0.12);
      // Subtle hair highlight gradient for Pixar/Fortnite look
      const hairGrad = ctx.createLinearGradient(W * 0.78, H * 0.51, W * 0.98, H * 0.63);
      hairGrad.addColorStop(0, \`rgba(\${Math.min(255, hColor[0] + 35)}, \${Math.min(255, hColor[1] + 35)}, \${Math.min(255, hColor[2] + 45)}, 0.45)\`);
      hairGrad.addColorStop(0.5, 'rgba(255,255,255,0)');
      ctx.fillStyle = hairGrad;
      ctx.fillRect(W * 0.78, H * 0.51, W * 0.20, H * 0.12);

      // 2. Face & Neck Skin (U: 0.54 to 0.74, V: 0.53 to 0.74)
      ctx.fillStyle = \`rgb(\${sColor[0]}, \${sColor[1]}, \${sColor[2]})\`;
      ctx.fillRect(W * 0.54, H * 0.53, W * 0.20, H * 0.21);
      // Warm Pixar cheek blush
      const blushGrad = ctx.createRadialGradient(W * 0.64, H * 0.64, 4, W * 0.64, H * 0.64, W * 0.08);
      blushGrad.addColorStop(0, \`rgba(\${Math.min(255, sColor[0] + 40)}, \${Math.max(0, sColor[1] - 20)}, \${Math.max(0, sColor[2] - 20)}, 0.35)\`);
      blushGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = blushGrad;
      ctx.fillRect(W * 0.54, H * 0.53, W * 0.20, H * 0.21);

      // 3. Eyebrows (U: 0.90 to 0.98, V: 0.65 to 0.72)
      ctx.fillStyle = \`rgb(\${Math.max(0, hColor[0] - 10)}, \${Math.max(0, hColor[1] - 10)}, \${Math.max(0, hColor[2] - 10)})\`;
      ctx.fillRect(W * 0.90, H * 0.65, W * 0.08, H * 0.07);

      // 4. Eyes (U: 0.78 to 0.86, V: 0.65 to 0.72)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(W * 0.78, H * 0.65, W * 0.08, H * 0.07);
      // Iris & pupil
      ctx.fillStyle = isFooty ? '#1d4ed8' : '#451a03';
      ctx.beginPath();
      ctx.arc(W * 0.82, H * 0.685, W * 0.022, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(W * 0.82, H * 0.685, W * 0.012, 0, Math.PI * 2);
      ctx.fill();
      // White reflection dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(W * 0.825, H * 0.680, W * 0.005, 0, Math.PI * 2);
      ctx.fill();

      // Render high-detail rarity patterns, club crest, and squad numbers onto uniform
      drawGlbJerseyPattern(ctx, W, H, isFooty, skin.id, skin);`;

if (glbCode.includes(buildSkinOld)) {
  glbCode = glbCode.replace(buildSkinOld, buildSkinNew);
  fs.writeFileSync(glbJsPath, glbCode, 'utf8');
  console.log('  -> render/characters_glb.js: stylized Hair, Skin, Eyebrow and Eye atlas rendering added.');
} else {
  console.warn('  -> Could not find target in render/characters_glb.js');
}

console.log('[3/3] Complete!');
