const fs = require('fs');

const files = [
  'js/game.js',
  'C:/Users/ASUS/Desktop/FOOTY vs HOOPS/js/game.js'
];

files.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  console.log('Processing:', filePath);
  let code = fs.readFileSync(filePath, 'utf8');

  // 1. Change G.plane to G.quad for frontPlate and backPlate
  code = code.replace(
    /const frontPlate = new scene_js_3\.Node\(G\.plane\(0\.48, 0\.64\),/g,
    'const frontPlate = new scene_js_3.Node(G.quad(0.48, 0.64),'
  );
  code = code.replace(
    /const backPlate = new scene_js_3.Node\(G\.plane\(0\.48, 0\.64\),/g,
    'const backPlate = new scene_js_3.Node(G.quad(0.48, 0.64),'
  );

  // 2. Camera: ensure Hoops has the same comfortable distance as Footy
  code = code.replace(
    /let followDist = isFooty \? 9\.2 : 8\.0;\s*let followHeight = isFooty \? 4\.0 : 3\.6;/,
    `let followDist = isFooty ? 9.2 : 9.0;
            let followHeight = isFooty ? 4.2 : 4.0;`
  );

  // 3. Clean up the side boxes on shorts
  code = code.replace(
    /leg\.add\(at\(mk\(G\.box\(0\.035, 0\.34, 0\.16\), skin\.secondary, \{ fabric: true \}\), sx < 0 \? -0\.145 : 0\.145, -0\.13, 0\)\);/,
    '// Clean athletic shorts contour'
  );
  code = code.replace(
    /leg\.add\(at\(mk\(G\.box\(0\.040, 0\.54, 0\.22\), 0xf59e0b, \{ spec: 0\.7, fabric: true \}\), sx < 0 \? -0\.17 : 0\.17, -0\.2, 0\)\);/,
    '// Clean basketball shorts contour'
  );

  fs.writeFileSync(filePath, code, 'utf8');
  console.log('✓ Successfully applied flawless athlete details to', filePath);
});
