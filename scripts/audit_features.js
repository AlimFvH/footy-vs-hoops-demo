const fs = require('fs');
const code = fs.readFileSync('js/game.js', 'utf8');

function showModule(name) {
  const target = `define("${name}"`;
  const idx = code.indexOf(target);
  if (idx === -1) {
    console.log(`Module ${name} not found`);
    return;
  }
  const nextIdx = code.indexOf('define("', idx + 1);
  console.log(`=== MODULE: ${name} (len: ${nextIdx - idx}) ===`);
  console.log(code.substring(idx, Math.min(nextIdx !== -1 ? nextIdx : idx + 2000, idx + 2000)));
}

showModule('core/telegram');
const idx = code.indexOf('define("core/telegram"');
const nextIdx = code.indexOf('define("', idx + 1);
console.log(code.substring(idx + 1500, nextIdx));
