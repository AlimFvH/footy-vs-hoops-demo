const fs = require('fs');
const path = require('path');

const files = [
  'js/game.js',
  'C:/Users/ASUS/Desktop/FOOTY vs HOOPS/js/game.js'
];

files.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.warn('File not found:', filePath);
    return;
  }
  console.log('Processing:', filePath);
  let code = fs.readFileSync(filePath, 'utf8');

  // 1. Upgrade MatchView default skin for Hoops from orange 'skin_solar' to black/gold 'skin_bb_onyx'
  code = code.replace(
    /'skin_solar'/g,
    "'skin_bb_onyx'"
  );

  // 2. Adjust CameraRig for Hoops to give slightly more breathing room
  code = code.replace(
    /let followDist = isFooty \? 9\.2 : 7\.2;\s*let followHeight = isFooty \? 4\.2 : 3\.2;/,
    `let followDist = isFooty ? 9.2 : 8.0;
            let followHeight = isFooty ? 4.0 : 3.6;`
  );

  fs.writeFileSync(filePath, code, 'utf8');
  console.log('✓ Stage 1 (skin defaults & camera breathing room) applied to', filePath);
});
