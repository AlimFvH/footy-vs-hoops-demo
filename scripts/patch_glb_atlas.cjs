const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../render/characters_glb.js');
let code = fs.readFileSync(filePath, 'utf8');

const target = '      // Render high-detail rarity patterns, club crest, and squad numbers onto uniform\r\n      drawGlbJerseyPattern(ctx, W, H, isFooty, skin.id, skin);';
const targetLF = '      // Render high-detail rarity patterns, club crest, and squad numbers onto uniform\n      drawGlbJerseyPattern(ctx, W, H, isFooty, skin.id, skin);';

const replacement = `      // Explicitly paint genuine Fortnite stylized Hair, Face Skin, and Facial Features onto Atlas
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

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Successfully patched CRLF target in render/characters_glb.js');
} else if (code.includes(targetLF)) {
  code = code.replace(targetLF, replacement);
  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Successfully patched LF target in render/characters_glb.js');
} else {
  console.error('Target not found!');
  process.exit(1);
}
