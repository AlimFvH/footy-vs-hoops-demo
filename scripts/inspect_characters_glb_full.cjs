const fs = require('fs');
const content = fs.readFileSync('render/characters_glb.js', 'utf8');
const lines = content.split('\n');
console.log('Lines count:', lines.length);

// Find main classes / methods
lines.forEach((l, i) => {
  if (l.includes('class ') || l.includes('function ') || l.includes('loadModel') || l.includes('renderChar')) {
    if (i < 200 || i > 1200) {
      console.log((i+1) + ': ' + l.trim());
    }
  }
});
