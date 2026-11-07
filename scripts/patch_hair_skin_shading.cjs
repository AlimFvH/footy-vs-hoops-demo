const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../render/characters_glb.js');
let code = fs.readFileSync(filePath, 'utf8');

const target = `            if (isDefaultSkin) {
              // Default hero athlete: show 100% of the pristine Pixar/Fortnite arcade atlas!
              baseCol = [1, 1, 1, 1];
            } else {`;

const targetCRLF = "            if (isDefaultSkin) {\r\n              // Default hero athlete: show 100% of the pristine Pixar/Fortnite arcade atlas!\r\n              baseCol = [1, 1, 1, 1];\r\n            } else {";

const replacement = `            if (isHair) {
              const hRgb = hexToVec3(sk.hair || (inst.isFooty ? 0x221810 : 0x0a0a0a));
              baseCol = [hRgb[0], hRgb[1], hRgb[2], 1.0];
              useTex = false; // Rich stylish sculpted hair without atlas bleed
            } else if (isSkin) {
              const sRgb = hexToVec3(sk.skin || (inst.isFooty ? 0xdfa070 : 0x6c4424));
              baseCol = [sRgb[0], sRgb[1], sRgb[2], 1.0];
              useTex = false; // Smooth athletic skin tone
            } else if (isDefaultSkin) {
              // Default hero athlete: show 100% of the pristine Pixar/Fortnite arcade jersey & footwear!
              baseCol = [1, 1, 1, 1];
            } else {`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Successfully patched LF in characters_glb.js for hair & skin shading');
} else if (code.includes(targetCRLF)) {
  code = code.replace(targetCRLF, replacement);
  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Successfully patched CRLF in characters_glb.js for hair & skin shading');
} else {
  console.error('Target block not found!');
  process.exit(1);
}
