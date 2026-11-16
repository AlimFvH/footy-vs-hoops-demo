const fs = require('fs');
const path = require('path');

const gameJsPath = path.resolve(__dirname, '../js/game.js');
let code = fs.readFileSync(gameJsPath, 'utf8');

console.log('--- Applying Arena & Camera Polish to js/game.js ---');

// 1. Basketball Court Key Paint: replace hot magenta (0xd946ef) with elegant deep midnight navy (0x0f172a)
code = code.replace(
  'g.fillStyle = hex(t.paint || 0xd946ef);',
  'g.fillStyle = hex(t.paint || 0x0f172a);'
);

// 2. Football Jumbotron: elevate from 7.6m to 16.5m (mounted on stadium canopy)
code = code.replace(
  'jumbo.setPos(0, 7.6, s * (L + GD + 5.5));',
  'jumbo.setPos(0, 16.5, s * (L + GD + 8.5));'
);

// 3. Basketball Jumbotron: Replace behind-the-hoop billboard with Center-Hung 4-Sided Scoreboard (y = 15.0m)
const oldHoopsJumboMarker = '        // 2. High-Visibility Floating Holographic Jumbotron directly behind North Hoop (-Z)';
const oldHoopsJumboEnd = '        // 3. Cyber Stadium Floodlight Pylons (4 corners of basketball court)';

const idxStart = code.indexOf(oldHoopsJumboMarker);
const idxEnd = code.indexOf(oldHoopsJumboEnd);

if (idxStart !== -1 && idxEnd !== -1) {
  const newHoopsJumboCode = `        // 2. Modern Center-Hung Arena Cube Scoreboard (Suspended high above center court at y = 15.0m)
        const hoopsJumboTex = new scene_js_1.Texture(makeJumbotronTexture('★ HOOPS #23 ALL-STAR ★', 'CYBER HARDWOOD ARENA', '#f97316', 'hoops'), { srgb: true, mipmap: true });
        const hoopsJumboMat = (0, scene_js_1.material)({ texture: hoopsJumboTex, unlit: true, doubleSided: true });

        // Center-hung 4-sided mega jumbotron high above center court
        const jumbo = new scene_js_1.Node();
        jumbo.setPos(0, 15.0, 0);

        for (const s of [-1, 1]) {
            const sideNode = new scene_js_1.Node();
            sideNode.setPos(0, 0, s * 4.8);
            sideNode.rotation = [s * 0.22, s < 0 ? 0 : Math.PI, 0];

            const screen = new scene_js_1.Node(G.plane(10.5, 4.0), hoopsJumboMat);
            screen.rotation = [Math.PI / 2, 0, 0];

            const caseNode = new scene_js_1.Node(G.box(11.0, 4.4, 0.6), barrierMat);
            caseNode.setPos(0, 0, -0.32);
            const trimNode = new scene_js_1.Node(G.box(11.2, 4.6, 0.08), s < 0 ? neonOrangeMat : neonCyanMat);
            trimNode.setPos(0, 0, -0.04);

            sideNode.add(caseNode, trimNode, screen);
            jumbo.add(sideNode);
        }
        root.add(jumbo);\n\n`;

  code = code.substring(0, idxStart) + newHoopsJumboCode + code.substring(idxEnd);
  console.log('✓ Successfully upgraded Basketball Arena to center-hung scoreboard.');
} else {
  console.warn('Could not locate old hoops jumbo marker:', { idxStart, idxEnd });
}

fs.writeFileSync(gameJsPath, code, 'utf8');
console.log('✓ Successfully wrote updates to js/game.js');
