const fs = require('fs');
const path = require('path');

const gameJsPath = path.join(__dirname, '../js/game.js');
let code = fs.readFileSync(gameJsPath, 'utf8');

const targetOld = `        // Dark obsidian / cyber navy planks
        const colA = hex(t.woodA || 0x141824);
        const colB = hex(t.woodB || 0x1a2032);`;

const targetNew = `        // Golden NBA All-Star / Fortnite Maple Hardwood Planks
        const colA = hex(t.woodA || 0xd29054);
        const colB = hex(t.woodB || 0xe5a666);`;

const norm = s => s.replace(/\r\n/g, '\n');
const normCode = norm(code);
const normOld = norm(targetOld);
const normNew = norm(targetNew);

if (!normCode.includes(normOld)) {
  console.log('Target old hardwood block not found or already patched.');
} else {
  const patched = normCode.replace(normOld, normNew);
  fs.writeFileSync(gameJsPath, patched.replace(/\n/g, '\r\n'), 'utf8');
  console.log('✓ Successfully patched golden hardwood in js/game.js!');
}
