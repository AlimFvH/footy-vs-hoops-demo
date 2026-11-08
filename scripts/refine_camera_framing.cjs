const fs = require('fs');
const path = require('path');

const gameJsPath = path.join(__dirname, '../js/game.js');
let gameCode = fs.readFileSync(gameJsPath, 'utf8');

// Replace camera distance & height
gameCode = gameCode.replace(
  'let followDist = isFooty ? 9.8 : 7.4;',
  'let followDist = isFooty ? 13.5 : 10.2;'
);
gameCode = gameCode.replace(
  'let followHeight = isFooty ? 4.8 : 3.8;',
  'let followHeight = isFooty ? 5.8 : 4.8;'
);
gameCode = gameCode.replace(
  'const focusY = 1.45 + (isShotOrDunk ? Math.min(3.2, by * 0.45) : 0);',
  'const focusY = 1.15 + (isShotOrDunk ? Math.min(3.2, by * 0.45) : 0);'
);

fs.writeFileSync(gameJsPath, gameCode, 'utf8');
console.log('Refined CameraRig distance, height, and focusY for optimal third-person framing');
