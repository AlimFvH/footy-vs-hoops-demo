const fs = require('fs');
let s = fs.readFileSync('render/hero_characters_3d.js', 'utf8');

// Check isKeeper occurrences
console.log('isKeeper count:', (s.match(/isKeeper/g) || []).length);
