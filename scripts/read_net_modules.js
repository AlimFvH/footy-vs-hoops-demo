const fs = require('fs');
const text = fs.readFileSync('js/game.js', 'utf8');

function printModule(name) {
  const startStr = `define("${name}"`;
  const idx = text.indexOf(startStr);
  if (idx === -1) {
    console.log(`Module ${name} not found`);
    return;
  }
  const nextIdx = text.indexOf('define("', idx + 1);
  console.log(`=== FULL MODULE: ${name} ===`);
  console.log(text.slice(idx, nextIdx !== -1 ? nextIdx : idx + 3000));
  console.log('\n===============================\n');
}

printModule('services/backend');
printModule('ui/online');
