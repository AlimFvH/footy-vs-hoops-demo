const fs = require('fs');
let content = fs.readFileSync('render/hero_characters_3d.js', 'utf8');

// Replace remaining scene. and G. in buildHeroCharacter
const startIdx = content.indexOf('function buildHeroCharacter');
let before = content.slice(0, startIdx);
let after = content.slice(startIdx);

after = after.replace(/\bscene\.Node\b/g, 'sc.Node');
after = after.replace(/\bscene\.Texture\b/g, 'sc.Texture');
after = after.replace(/\bscene\.material\b/g, 'sc.material');
after = after.replace(/\bG\./g, 'geo.');

fs.writeFileSync('render/hero_characters_3d.js', before + after);
console.log('Updated buildHeroCharacter to use sc and geo.');
