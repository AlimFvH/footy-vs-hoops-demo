const fs = require('fs');
const code = fs.readFileSync('js/game.js', 'utf8');
const lines = code.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('🪙')) {
    console.log((idx + 1) + ': ' + l.trim());
  }
});
