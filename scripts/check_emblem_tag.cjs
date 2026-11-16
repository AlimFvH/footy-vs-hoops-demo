const fs = require('fs');
const content = fs.readFileSync('character_studio.html', 'utf8');
console.log('Has emblem tag:', content.includes('fvh-official-emblem'));
