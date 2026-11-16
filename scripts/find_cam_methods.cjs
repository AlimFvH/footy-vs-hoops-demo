const fs = require('fs');
const content = fs.readFileSync('js/character_studio_app.js', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('studioCam.')) console.log(i + 1, l.trim());
});
