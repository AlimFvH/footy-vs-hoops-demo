const fs = require('fs');
const path = require('path');

const gameJsPath = path.join(__dirname, '..', 'js', 'game.js');
let content = fs.readFileSync(gameJsPath, 'utf8');

// 1. Ensure AD_CONFIG texts: strictly 'Здесь может быть твоя реклама'
content = content.replace(/'«Здесь может быть твоя реклама»'/g, "'Здесь может быть твоя реклама'");

// 2. Add noWall support in crowdAndStands
const targetWallAdd = `            slabs.add(wall);
            for (let r = 0; r < st.rows; r++) {`;
const replacementWallAdd = `            if (!st.noWall) slabs.add(wall);
            for (let r = 0; r < st.rows; r++) {`;
if (content.includes(targetWallAdd)) {
    content = content.replace(targetWallAdd, replacementWallAdd);
    console.log('[OK] crowdAndStands noWall support added');
}

// 3. Update addCoastalScenery helper
const oldHelperRegex = /function addCoastalScenery\([\s\S]*?makePalm\(0, -[\s\S]*?\);\s*\}/;
const newHelper = `function addCoastalScenery(root, W, L, GD, isHoops) {
        const shoreZ = -(L + GD + 4.5);
        const oceanLen = 400;
        const ocean = new scene_js_1.Node(G.plane(600, oceanLen), (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x08537c), spec: 0.95, shininess: 85, receiveShadow: false, fog: true }));
        ocean.setPos(0, -0.06, shoreZ - oceanLen / 2);

        const surf = new scene_js_1.Node(G.plane(260, 3.5), (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xbae6fd), spec: 0.9, transparent: true, alpha: 0.85, receiveShadow: false }));
        surf.setPos(0, -0.04, shoreZ + 0.8);

        const shimmer = new scene_js_1.Node(G.plane(36, 260), (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xfbcfe8), emissive: [0.6, 0.35, 0.25], unlit: true, transparent: true, alpha: 0.55, receiveShadow: false }));
        shimmer.setPos(18, -0.05, shoreZ - 120);

        const pier = new scene_js_1.Node(G.box(2 * W + 24, 0.45, 1.4), (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x854d0e), spec: 0.3 }));
        pier.setPos(0, 0.16, shoreZ + 2.5);
        root.add(ocean, surf, shimmer, pier);

        const palmMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x654321), spec: 0.15 });
        const frondMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x15803d), spec: 0.25, doubleSided: true });
        function makePalm(x, z, s) {
            s = s || 1.0;
            const p = new scene_js_1.Node();
            p.setPos(x, 0, z);
            const h = 5.2 * s;
            const trunk = new scene_js_1.Node(G.cylinder(0.18 * s, 0.28 * s, h, 6), palmMat);
            trunk.setPos(0, h / 2, 0);
            trunk.rotation = [0.08, 0, 0.06];
            p.add(trunk);
            const crown = new scene_js_1.Node();
            crown.setPos(0, h, 0);
            for (let i = 0; i < 6; i++) {
                const f = new scene_js_1.Node(G.cone(2.4 * s, 0.55 * s, 5), frondMat);
                f.rotation = [0.46, (i * Math.PI) / 3, 0];
                crown.add(f);
            }
            const topF = new scene_js_1.Node(G.cone(1.6 * s, 0.45 * s, 5), frondMat);
            topF.rotation = [0.15, 0.4, 0];
            crown.add(topF);
            p.add(crown);
            root.add(p);
        }

        makePalm(-(W + 7.5), -(L + 4.5), 1.15);
        makePalm(-(W + 12.0), -(L + 7.5), 0.95);
        makePalm(W + 7.5, -(L + 4.5), 1.15);
        makePalm(W + 12.0, -(L + 7.5), 0.95);
        makePalm(-(W + 8.5), 0, 1.05);
        makePalm(W + 8.5, 0, 1.05);
        makePalm(-(W + 8.0), L * 0.55, 1.1);
        makePalm(W + 8.0, L * 0.55, 1.1);
        makePalm(-12, shoreZ + 5.5, 1.25);
        makePalm(12, shoreZ + 5.5, 1.25);
        makePalm(-22, shoreZ + 8.5, 1.4);
        makePalm(22, shoreZ + 8.5, 1.4);
    }`;

content = content.replace(oldHelperRegex, newHelper);
console.log('[OK] addCoastalScenery helper updated');

// 4. Update buildFootyArena sand ground and stands
const oldFootyGroundRegex = /const groundCol = isCoastal \? \(0, math_js_6\.rgb\)\(0xdeb877\) : \(0, math_js_6\.rgb\)\(0x0b1220\);\s*const ground = new scene_js_1\.Node\(G\.plane\(400, 400\),[\s\S]*?ground\.setPos\(0, -0\.06, 0\);/;
const newFootyGround = `const groundCol = isCoastal ? (0, math_js_6.rgb)(0xdeb877) : (0, math_js_6.rgb)(0x0b1220);
        const shoreZ = -(L + GD + 4.5);
        const sandLen = isCoastal ? 260 : 400;
        const ground = new scene_js_1.Node(G.plane(400, sandLen), (0, scene_js_1.material)({ color: groundCol, receiveShadow: false, fog: true }));
        ground.setPos(0, -0.06, isCoastal ? (shoreZ + sandLen / 2) : 0);`;

content = content.replace(oldFootyGroundRegex, newFootyGround);
console.log('[OK] buildFootyArena sand ground horizon updated');

// Update footyStands to include noWall
content = content.replace(
    `const footyStands = isCoastal ? [
            { alongX: false, sign: -1, offset: W + 3.2, length: 2 * L + 8, rows: 2, center: 0 },
            { alongX: false, sign: 1, offset: W + 3.2, length: 2 * L + 8, rows: 2, center: 0 },
            { alongX: true, sign: 1, offset: L + GD + 3, length: 2 * W + 10, rows: 2, center: 0 },
        ]`,
    `const footyStands = isCoastal ? [
            { alongX: false, sign: -1, offset: W + 3.2, length: 2 * L + 8, rows: 2, center: 0, noWall: true },
            { alongX: false, sign: 1, offset: W + 3.2, length: 2 * L + 8, rows: 2, center: 0, noWall: true },
            { alongX: true, sign: 1, offset: L + GD + 3, length: 2 * W + 10, rows: 2, center: 0, noWall: true },
        ]`
);
console.log('[OK] footyStands noWall set');

// 5. Update buildCourtArena sand ground and stands
const oldCourtGroundRegex = /const groundCol = isCoastal \? \(0, math_js_6\.rgb\)\(0xdeb877\) : \(0, math_js_6\.rgb\)\(t\.floor\);\s*const ground = new scene_js_1\.Node\(G\.plane\(400, 400\),[\s\S]*?ground\.setPos\(0, -0\.06, 0\);/;
const newCourtGround = `const groundCol = isCoastal ? (0, math_js_6.rgb)(0xdeb877) : (0, math_js_6.rgb)(t.floor);
        const shoreZ = -(L + APRON + 4.5);
        const sandLen = isCoastal ? 240 : 400;
        const ground = new scene_js_1.Node(G.plane(400, sandLen), (0, scene_js_1.material)({ color: groundCol, receiveShadow: false }));
        ground.setPos(0, -0.06, isCoastal ? (shoreZ + sandLen / 2) : 0);`;

content = content.replace(oldCourtGroundRegex, newCourtGround);
console.log('[OK] buildCourtArena sand ground horizon updated');

content = content.replace(
    `const courtStands = isCoastal ? [
            { alongX: false, sign: -1, offset: W + APRON + 2.4, length: 2 * L + 6, rows: 2, center: 0 },
            { alongX: false, sign: 1, offset: W + APRON + 2.4, length: 2 * L + 6, rows: 2, center: 0 },
            { alongX: true, sign: 1, offset: L + APRON + 4.4, length: 2 * W + 10, rows: 2, center: 0 },
        ]`,
    `const courtStands = isCoastal ? [
            { alongX: false, sign: -1, offset: W + APRON + 2.4, length: 2 * L + 6, rows: 2, center: 0, noWall: true },
            { alongX: false, sign: 1, offset: W + APRON + 2.4, length: 2 * L + 6, rows: 2, center: 0, noWall: true },
            { alongX: true, sign: 1, offset: L + APRON + 4.4, length: 2 * W + 10, rows: 2, center: 0, noWall: true },
        ]`
);
console.log('[OK] courtStands noWall set');

fs.writeFileSync(gameJsPath, content, 'utf8');
console.log('Successfully re-patched js/game.js with open coastal shoreline!');
