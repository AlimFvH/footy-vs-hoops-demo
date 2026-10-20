const fs = require('fs');
const text = fs.readFileSync('js/game.js', 'utf8');

const modulesToInspect = [
  'net/support',
  'net/codec',
  'net/link',
  'net/protocol',
  'net/session',
  'ui/online',
  'services/backend'
];

modulesToInspect.forEach(modName => {
  const pattern = new RegExp(`define\\("${modName}",[^\n]*function[^{]*\\{([\\s\\S]*?)\\n\\}\\);`);
  const match = text.match(pattern);
  if (match) {
    console.log(`=== MODULE: ${modName} (length: ${match[1].length}) ===`);
    console.log(match[1].slice(0, 400));
    console.log('...\n');
  } else {
    console.log(`=== MODULE: ${modName} NOT FOUND by regex ===`);
  }
});
