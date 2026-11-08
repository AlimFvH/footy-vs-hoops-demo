const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../render/characters_glb.js');
let s = fs.readFileSync(file, 'utf8');

s = s.replace(
  'const MV = matchviewMod.MatchView;',
  'const MV = matchviewMod.MatchView;\n        if (MV.__glbHooked) return true;\n        MV.__glbHooked = true;'
);

s = s.replace(
  "console.log('[CharactersGLB] Seamless MatchView hooks installed successfully.');",
  "console.log('[CharactersGLB] Seamless MatchView hooks installed successfully.');\n        return true;"
);

s = s.replace(
  /installHook\(\);\r?\n\s*if \(\+\+hookTries < 25\)/,
  'if (installHook()) return;\n      if (++hookTries < 25)'
);

fs.writeFileSync(file, s, 'utf8');
console.log('Hook logic cleanly updated!');
