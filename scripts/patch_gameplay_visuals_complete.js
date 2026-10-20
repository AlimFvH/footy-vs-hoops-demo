const fs = require('fs');
const path = require('path');

const gameJsPath = path.join(__dirname, '..', 'js', 'game.js');
let code = fs.readFileSync(gameJsPath, 'utf8');

// Target region start: function floodlight(root, x, z, h, glow) {
const startMarker = '    function floodlight(root, x, z, h, glow) {';
// Target region end: right before define("render/camera"
const endMarker = '    function buildCourtArena(t, quality) {';

if (!code.includes(startMarker)) {
    throw new Error('startMarker not found in js/game.js');
}
if (!code.includes(endMarker)) {
    throw new Error('endMarker not found in js/game.js');
}

// Find index of endMarker and the end of buildCourtArena
const endMarkerIdx = code.indexOf(endMarker);
// Find the closing of buildCourtArena before define("render/camera"
const cameraDefIdx = code.indexOf('define("render/camera"', endMarkerIdx);
if (cameraDefIdx === -1) {
    throw new Error('define("render/camera" not found');
}

// Search backward from cameraDefIdx for the closing of buildCourtArena
const targetCloseIdx = code.lastIndexOf('    }', cameraDefIdx);
if (targetCloseIdx === -1) {
    throw new Error('targetCloseIdx not found');
}
const endRegionIdx = targetCloseIdx + 5; // include "    }\n"

const startRegionIdx = code.indexOf(startMarker);

console.log(`Replacing region from ${startRegionIdx} to ${endRegionIdx}...`);

const newArenaModuleCode = `    function makeSkyDomeGeometry(radius, height, seg = 32) {
        const hh = height / 2;
        const pos = [], nor = [], uv = [], idx = [];
        for (let j = 0; j <= seg; j++) {
            const a = (j / seg) * Math.PI * 2;
            const s = Math.sin(a);
            const c = Math.cos(a);
            pos.push(radius * s, -hh, radius * c);
            nor.push(-s, 0, -c);
            uv.push(j / seg, 0.0);
            pos.push(radius * s, hh, radius * c);
            nor.push(-s, 0, -c);
            uv.push(j / seg, 1.0);
        }
        for (let j = 0; j < seg; j++) {
            const b0 = j * 2;
            const t0 = j * 2 + 1;
            const b1 = (j + 1) * 2;
            const t1 = (j + 1) * 2 + 1;
            idx.push(b0, b1, t0, t0, b1, t1);
        }
        return new G.Geometry(new Float32Array(pos), new Float32Array(nor), new Float32Array(uv), new Uint16Array(idx));
    }

    function floodlight(root, x, z, h, glow) {
        const poleMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x2a3040), spec: 0.6, shininess: 50, receiveShadow: false });
        const pole = new scene_js_1.Node(G.cylinder(0.24, 0.42, h, 8), poleMat);
        pole.setPos(x, h / 2, z);

        // Tower cross-braces
        for (let b = 1; b <= 3; b++) {
            const brace = new scene_js_1.Node(G.box(1.8, 0.12, 1.8), poleMat);
            brace.setPos(x, h * (b * 0.24), z);
            root.add(brace);
        }

        // Floodlight bank head
        const head = new scene_js_1.Node(G.box(3.6, 2.0, 0.6), (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x181c24), spec: 0.5, receiveShadow: false }));
        head.setPos(x, h + 0.6, z);
        head.rotation = [0.52, Math.atan2(-x, -z) + Math.PI, 0];

        // 12 Glowing lamp lenses
        const lampMat = (0, scene_js_1.material)({ color: [1, 1, 1], emissive: [1.8, 1.7, 1.4], unlit: true, fog: false });
        for (let lx = -1; lx <= 1; lx++) {
            for (let ly = -0.5; ly <= 0.5; ly += 1.0) {
                const lens = new scene_js_1.Node(G.box(0.9, 0.7, 0.1), lampMat);
                lens.setPos(lx * 1.1, ly * 0.8, 0.32);
                head.add(lens);
            }
        }
        root.add(pole, head);
    }

    function buildArenaSkyAndHorizon(root, t, W, L, isHoops, quality) {
        const skyGeo = makeSkyDomeGeometry(140, 80, 32);
        const skyTex = new scene_js_1.Texture(textures_js_1.makeThemedSkyTexture(t, isHoops ? 'hoops' : 'footy'), { srgb: true, mipmap: true, clamp: false });
        const skyMat = (0, scene_js_1.material)({ texture: skyTex, unlit: true, fog: false, doubleSided: true, depthWrite: false });
        const skyNode = new scene_js_1.Node(skyGeo, skyMat);
        skyNode.setPos(0, 25, 0);
        root.add(skyNode);
    }

    function buildFootballStadiumArchitecture(root, t, W, L, GD, quality) {
        // 4-sided grandstands enclosing the pitch!
        const stands = [
            // East and West touchline stands
            { alongX: false, sign: -1, offset: W + 3.2, length: 2 * L + 10, rows: 9, center: 0 },
            { alongX: false, sign: 1, offset: W + 3.2, length: 2 * L + 10, rows: 9, center: 0 },
            // North and South goal grandstands (behind the goals - fills camera view!)
            { alongX: true, sign: -1, offset: L + GD + 2.8, length: 2 * W + 12, rows: 8, center: 0 },
            { alongX: true, sign: 1, offset: L + GD + 2.8, length: 2 * W + 12, rows: 8, center: 0 }
        ];
        const crowd = crowdAndStands(root, stands, t.crowd || [0xff2bd6, 0x00e5ff, 0xffffff, 0x3b82f6], t.stand || 0x1e2433, quality);

        // Stadium roof canopies & steel lattice trusses
        const roofMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x1a202c), spec: 0.4, shininess: 30 });
        const trussMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x334155), spec: 0.6, shininess: 50 });

        for (const s of [-1, 1]) {
            // Sideline roof canopies
            const roofW = 7.0;
            const roof = new scene_js_1.Node(G.box(roofW, 0.35, 2 * L + 12), roofMat);
            roof.setPos(s * (W + 7.5), 11.2, 0);
            roof.rotation = [0, 0, -s * 0.18];
            root.add(roof);

            // Roof support truss pillars
            for (let z = -L; z <= L; z += L) {
                const truss = new scene_js_1.Node(G.cylinder(0.18, 0.28, 12.0, 8), trussMat);
                truss.setPos(s * (W + 11.2), 6.0, z);
                root.add(truss);
            }

            // End goal roof canopies (North & South)
            const endRoof = new scene_js_1.Node(G.box(2 * W + 14, 0.35, 6.5), roofMat);
            endRoof.setPos(0, 10.4, s * (L + GD + 6.5));
            endRoof.rotation = [-s * 0.18, 0, 0];
            root.add(endRoof);
        }

        // 4 Monumental Corner Floodlight Towers
        for (const sx of [-1, 1]) {
            for (const sz of [-1, 1]) {
                floodlight(root, sx * (W + 12.0), sz * (L + 8.5), 22, t.glow || 0xffd29a);
            }
        }

        return crowd;
    }

    function buildBasketballArenaArchitecture(root, t, W, L, APRON, quality) {
        // 4-sided indoor basketball arena seating bowl
        const stands = [
            // Sideline lower bowl
            { alongX: false, sign: -1, offset: W + APRON + 2.8, length: 2 * L + 8, rows: 7, center: 0 },
            { alongX: false, sign: 1, offset: W + APRON + 2.8, length: 2 * L + 8, rows: 7, center: 0 },
            // Baseline stands behind hoops (North & South)
            { alongX: true, sign: -1, offset: L + APRON + 4.8, length: 2 * W + 12, rows: 6, center: 0 },
            { alongX: true, sign: 1, offset: L + APRON + 4.8, length: 2 * W + 12, rows: 6, center: 0 }
        ];
        const crowd = crowdAndStands(root, stands, t.crowd || [0xf59e0b, 0xef4444, 0x3b82f6, 0xffffff], t.stand || 0x161c28, quality);

        // Center-Hung 4-Sided Jumbotron Scoreboard directly over center court!
        const jumbotron = new scene_js_1.Node();
        jumbotron.setPos(0, 14.0, 0);

        // Jumbotron main body
        const jumbBodyMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x0f172a), spec: 0.8, shininess: 60 });
        const jumbCube = new scene_js_1.Node(G.box(5.0, 2.6, 5.0), jumbBodyMat);
        jumbotron.add(jumbCube);

        // 4 Glowing LED Video Displays
        const screenMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x0284c7), emissive: [0.3, 0.8, 1.2], unlit: true, spec: 0.9 });
        for (const [sx, sz, rot] of [[0, 2.52, 0], [0, -2.52, Math.PI], [2.52, 0, Math.PI / 2], [-2.52, 0, -Math.PI / 2]]) {
            const screen = new scene_js_1.Node(G.box(4.4, 2.1, 0.08), screenMat);
            screen.setPos(sx, 0, sz);
            screen.rotation = [0, rot, 0];
            jumbotron.add(screen);
        }

        // Bottom LED Ring
        const ringMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xf59e0b), emissive: [1.2, 0.8, 0.1], unlit: true });
        const ring = new scene_js_1.Node(G.cylinder(2.6, 2.6, 0.45, 20), ringMat);
        ring.setPos(0, -1.5, 0);
        jumbotron.add(ring);

        // Suspension Cables to Arena Ceiling
        const cableMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x64748b), spec: 0.8 });
        for (const [cx, cz] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) {
            const cable = new scene_js_1.Node(G.cylinder(0.04, 0.04, 12.0, 6), cableMat);
            cable.setPos(cx, 7.3, cz);
            jumbotron.add(cable);
        }
        root.add(jumbotron);

        // Overhead Arena Steel Truss Grid & Spotlights
        const trussMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x334155), spec: 0.6 });
        for (const s of [-1, 1]) {
            const longBeam = new scene_js_1.Node(G.box(0.35, 0.35, 2 * L + 14), trussMat);
            longBeam.setPos(s * (W + 6.0), 16.5, 0);
            root.add(longBeam);

            const crossBeam = new scene_js_1.Node(G.box(2 * W + 14, 0.35, 0.35), trussMat);
            crossBeam.setPos(0, 16.5, s * (L + 6.0));
            root.add(crossBeam);
        }

        // Courtside Team Benches & Media Desks
        const benchMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x1e293b), spec: 0.3 });
        for (const s of [-1, 1]) {
            const desk = new scene_js_1.Node(G.box(0.7, 0.75, 12.0), benchMat);
            desk.setPos(s * (W + APRON + 1.2), 0.38, 0);
            root.add(desk);
        }

        return crowd;
    }

    function buildThemedEnvironment(root, t, W, L, borderZ, isHoops, quality) {
        const id = (t && t.id) || '';
        const shoreZ = -(L + borderZ + 4.5);
        const edgeZ = -(L + borderZ + 3.5);

        // 1. COASTAL SUNSET COURT
        if (id === 'std_ocean_sunset' || t.fog === 0x3a1a2e) {
            const oceanLen = 500;
            const ocean = new scene_js_1.Node(G.plane(600, oceanLen), (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x08537c), spec: 0.95, shininess: 85, receiveShadow: false, fog: false }));
            ocean.setPos(0, -0.06, shoreZ - oceanLen / 2);

            const surf = new scene_js_1.Node(G.plane(300, 4.0), (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xbae6fd), spec: 0.9, transparent: true, alpha: 0.85, receiveShadow: false }));
            surf.setPos(0, -0.04, shoreZ + 1.0);

            const shimmer = new scene_js_1.Node(G.plane(45, 300), (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xfbcfe8), emissive: [0.65, 0.4, 0.3], unlit: true, transparent: true, alpha: 0.55, receiveShadow: false }));
            shimmer.setPos(0, -0.05, shoreZ - 130);

            const pier = new scene_js_1.Node(G.box(2 * W + 28, 0.5, 1.8), (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x854d0e), spec: 0.35 }));
            pier.setPos(0, 0.18, shoreZ + 2.5);
            root.add(ocean, surf, shimmer, pier);

            const palmMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x654321), spec: 0.15 });
            const frondMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x15803d), spec: 0.25, doubleSided: true });
            function makePalm(x, z, s) {
                s = s || 1.0;
                const p = new scene_js_1.Node();
                p.setPos(x, 0, z);
                const h = 5.5 * s;
                const trunk = new scene_js_1.Node(G.cylinder(0.18 * s, 0.3 * s, h, 6), palmMat);
                trunk.setPos(0, h / 2, 0);
                trunk.rotation = [0.08, 0, 0.06];
                p.add(trunk);
                const crown = new scene_js_1.Node();
                crown.setPos(0, h, 0);
                for (let i = 0; i < 6; i++) {
                    const f = new scene_js_1.Node(G.cone(2.6 * s, 0.6 * s, 5), frondMat);
                    f.rotation = [0.46, (i * Math.PI) / 3, 0];
                    crown.add(f);
                }
                const topF = new scene_js_1.Node(G.cone(1.8 * s, 0.5 * s, 5), frondMat);
                topF.rotation = [0.15, 0.4, 0];
                crown.add(topF);
                p.add(crown);
                root.add(p);
            }

            // Palm groves enclosing sides and background
            const palmCoords = [
                [-(W + 8), -(L + 5), 1.2], [W + 8, -(L + 5), 1.2],
                [-(W + 14), -(L + 8), 1.0], [W + 14, -(L + 8), 1.0],
                [-(W + 9), 0, 1.1], [W + 9, 0, 1.1],
                [-(W + 15), 0, 1.3], [W + 15, 0, 1.3],
                [-(W + 8), L * 0.6, 1.15], [W + 8, L * 0.6, 1.15],
                [-(W + 9), L + 6, 1.2], [W + 9, L + 6, 1.2],
                [-20, shoreZ + 5.5, 1.3], [20, shoreZ + 5.5, 1.3],
                [-30, shoreZ + 8.5, 1.4], [30, shoreZ + 8.5, 1.4]
            ];
            for (const [px, pz, ps] of palmCoords) {
                makePalm(px, pz, ps);
            }
            return;
        }

        // 2. REDWOOD FOREST ARENA
        if (id === 'std_forest_redwood' || t.fog === 0x0a2216) {
            const barkMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x451a03), spec: 0.15 });
            const pineMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x14532d), spec: 0.2 });
            const logMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x361c0d), spec: 0.2 });

            function makeRedwood(x, z, h, r) {
                h = h || 28;
                r = r || 1.9;
                const tree = new scene_js_1.Node();
                tree.setPos(x, 0, z);
                const trunk = new scene_js_1.Node(G.cylinder(r * 0.65, r, h, 8), barkMat);
                trunk.setPos(0, h / 2, 0);
                tree.add(trunk);
                for (let i = 0; i < 4; i++) {
                    const branchY = h * (0.42 + i * 0.15);
                    const bRad = (4.2 - i * 0.7) * (r / 1.8);
                    const foliage = new scene_js_1.Node(G.cone(bRad, 3.2, 6), pineMat);
                    foliage.setPos(0, branchY, 0);
                    tree.add(foliage);
                }
                const topCrown = new scene_js_1.Node(G.cone(2.4 * (r / 1.8), 5.0, 6), pineMat);
                topCrown.setPos(0, h + 1.2, 0);
                tree.add(topCrown);
                root.add(tree);
            }

            // Dense tree lines on ALL 4 SIDES!
            const trees = [
                // Behind North Goal / Hoop (Direct in camera view!)
                [-18, -(L + borderZ + 12), 34, 2.4], [-8, -(L + borderZ + 14), 38, 2.6],
                [0, -(L + borderZ + 16), 42, 2.8], [8, -(L + borderZ + 14), 38, 2.6], [18, -(L + borderZ + 12), 34, 2.4],
                [-28, -(L + borderZ + 18), 32, 2.2], [28, -(L + borderZ + 18), 32, 2.2],
                // West touchline
                [-(W + 8), -(L + 6), 30, 2.1], [-(W + 15), -(L + 12), 34, 2.4], [-(W + 24), -(L + 8), 30, 2.0],
                [-(W + 9), 0, 28, 2.0], [-(W + 16), 0, 32, 2.3], [-(W + 24), 0, 28, 1.9],
                [-(W + 8), L * 0.6, 28, 1.9], [-(W + 15), L * 0.6, 32, 2.2],
                [-(W + 9), L + 8, 30, 2.1], [-(W + 16), L + 12, 34, 2.4],
                // East touchline
                [W + 8, -(L + 6), 30, 2.1], [W + 15, -(L + 12), 34, 2.4], [W + 24, -(L + 8), 30, 2.0],
                [W + 9, 0, 28, 2.0], [W + 16, 0, 32, 2.3], [W + 24, 0, 28, 1.9],
                [W + 8, L * 0.6, 28, 1.9], [W + 15, L * 0.6, 32, 2.2],
                [W + 9, L + 8, 30, 2.1], [W + 16, L + 12, 34, 2.4],
                // South boundary
                [-14, L + borderZ + 10, 28, 2.0], [14, L + borderZ + 10, 28, 2.0]
            ];
            for (const [tx, tz, th, tr] of trees) {
                makeRedwood(tx, tz, th, tr);
            }

            // Split rail wooden perimeter fence
            for (const s of [-1, 1]) {
                const rail = new scene_js_1.Node(G.box(0.18, 0.9, 2 * L + 8), logMat);
                rail.setPos(s * (W + 2.5), 0.45, 0);
                root.add(rail);
            }
            return;
        }

        // 3. PRISMATIC CRYSTAL CAVE
        if (id === 'std_crystal_cavern' || t.fog === 0x160728) {
            const crystalPurple = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xc084fc), emissive: [1.2, 0.4, 1.5], spec: 0.95, shininess: 85, unlit: true });
            const crystalPink = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xe879f9), emissive: [1.4, 0.5, 1.5], spec: 0.95, shininess: 85, unlit: true });
            const crystalCyan = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x38bdf8), emissive: [0.4, 1.2, 1.8], spec: 0.95, shininess: 85, unlit: true });
            const cavernRock = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x1e1528), spec: 0.35 });

            // Massive cavern rock arches across the northern and sideline background!
            for (const [ax, az, asz, arot] of [
                [0, -(L + borderZ + 14), 42, 0],
                [-24, -(L + borderZ + 8), 34, 0.35],
                [24, -(L + borderZ + 8), 34, -0.35],
                [-(W + 16), 0, 36, Math.PI / 2],
                [W + 16, 0, 36, Math.PI / 2]
            ]) {
                const arch = new scene_js_1.Node(G.torus(asz, 1.2, 28, 8), cavernRock);
                arch.rotation = [Math.PI / 2, arot, 0];
                arch.setPos(ax, 10, az);
                root.add(arch);
            }

            // 16 Towering Crystal Spires surrounding field
            const crystalClusters = [
                [-14, -(L + borderZ + 8), 12.0, crystalCyan], [14, -(L + borderZ + 8), 11.0, crystalPurple],
                [0, -(L + borderZ + 12), 14.0, crystalPink], [-26, -(L + borderZ + 10), 10.0, crystalPurple], [26, -(L + borderZ + 10), 10.0, crystalCyan],
                [-(W + 7), -(L + 4), 8.5, crystalPurple], [W + 7, -(L + 4), 8.0, crystalPink],
                [-(W + 12), -(L * 0.3), 11.0, crystalCyan], [W + 12, -(L * 0.3), 10.5, crystalPurple],
                [-(W + 8), 0, 9.5, crystalPink], [W + 8, 0, 9.0, crystalCyan],
                [-(W + 12), L * 0.4, 10.0, crystalPurple], [W + 12, L * 0.4, 10.5, crystalPink],
                [-(W + 7), L + 6, 8.5, crystalCyan], [W + 7, L + 6, 8.0, crystalPurple],
                [-14, L + borderZ + 8, 9.0, crystalPink], [14, L + borderZ + 8, 9.5, crystalCyan]
            ];
            for (const [cx, cz, ch, cMat] of crystalClusters) {
                const spire = new scene_js_1.Node(G.cone(1.4, ch, 6), cMat);
                spire.setPos(cx, ch / 2, cz);
                root.add(spire);
            }
            return;
        }

        // 4. NEON TURF / NEON NIGHT / CYBER MEGACITY
        if (id === 'std_cyber_megacity' || id === 'std_footy_neon' || id === 'std_hoops_neon' || t.fog === 0x150826 || t.fog === 0x14052a || t.fog === 0x0f0b18) {
            const towerMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x0f0a1c), spec: 0.7, shininess: 50 });
            const windowCyan = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x00f0ff), emissive: [0.2, 1.4, 1.6], unlit: true });
            const windowMagenta = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xff2bd6), emissive: [1.6, 0.2, 1.4], unlit: true });
            const windowGold = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xfbbf24), emissive: [1.4, 1.1, 0.2], unlit: true });

            // Holographic Arena Archway spanning over the north goal / hoop!
            const arch = new scene_js_1.Node(G.torus(2 * W + 6, 0.45, 32, 8), windowCyan);
            arch.rotation = [Math.PI / 2, 0, 0];
            arch.setPos(0, 10, -(L + borderZ + 5));
            root.add(arch);

            // 12 Cyberpunk Skyscrapers surrounding the arena
            const towers = [
                [-20, -(L + borderZ + 16), 36, 12, 12, windowCyan],
                [0, -(L + borderZ + 20), 44, 16, 14, windowMagenta],
                [20, -(L + borderZ + 16), 38, 12, 12, windowGold],
                [-34, -(L + borderZ + 12), 30, 10, 10, windowMagenta],
                [34, -(L + borderZ + 12), 32, 10, 10, windowCyan],
                [-(W + 14), -L * 0.4, 28, 10, 12, windowMagenta],
                [W + 14, -L * 0.4, 30, 10, 12, windowCyan],
                [-(W + 16), 0, 32, 12, 12, windowGold],
                [W + 16, 0, 34, 12, 12, windowMagenta],
                [-(W + 14), L * 0.5, 28, 10, 12, windowCyan],
                [W + 14, L * 0.5, 30, 10, 12, windowGold],
                [0, L + borderZ + 16, 32, 14, 12, windowCyan]
            ];
            for (const [tx, tz, th, tw, td, winMat] of towers) {
                const bldg = new scene_js_1.Node();
                bldg.setPos(tx, 0, tz);
                const block = new scene_js_1.Node(G.box(tw, th, td), towerMat);
                block.setPos(0, th / 2, 0);
                bldg.add(block);
                for (let fl = 0; fl < 5; fl++) {
                    const strip = new scene_js_1.Node(G.box(tw + 0.15, 0.7, td + 0.15), winMat);
                    strip.setPos(0, th * (0.2 + fl * 0.16), 0);
                    bldg.add(strip);
                }
                root.add(bldg);
            }
            return;
        }

        // 5. AETHERIA SKY ISLANDS
        if (id === 'std_floating_islands' || t.fog === 0x38bdf8) {
            const cloudMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xf1f5f9), unlit: true, transparent: true, alpha: 0.95 });
            const marbleMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xf8fafc), spec: 0.6, shininess: 40 });
            const runeMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x38bdf8), emissive: [0.4, 1.2, 1.8], unlit: true });

            // Cloud sea beneath the island
            const clouds = new scene_js_1.Node(G.plane(600, 600), cloudMat);
            clouds.setPos(0, -8.0, 0);
            root.add(clouds);

            // Temple Columns with glowing runes
            const pillars = [
                [-14, -(L + borderZ + 8), 12.0], [14, -(L + borderZ + 8), 12.0],
                [-24, -(L + borderZ + 10), 10.0], [24, -(L + borderZ + 10), 10.0],
                [-(W + 6), -(L + 4), 9.0], [W + 6, -(L + 4), 9.0],
                [-(W + 8), 0, 10.0], [W + 8, 0, 10.0],
                [-(W + 6), L * 0.5, 9.0], [W + 6, L * 0.5, 9.0],
                [-14, L + borderZ + 8, 10.0], [14, L + borderZ + 8, 10.0]
            ];
            for (const [px, pz, ph] of pillars) {
                const col = new scene_js_1.Node(G.cylinder(0.65, 0.75, ph, 8), marbleMat);
                col.setPos(px, ph / 2, pz);
                const rune = new scene_js_1.Node(G.box(0.3, 2.0, 0.3), runeMat);
                rune.setPos(px, ph * 0.6, pz + 0.55);
                root.add(col, rune);
            }

            // Classical Marble Temple Arch behind the North Goal / Hoop!
            const arch = new scene_js_1.Node(G.box(2 * W + 4, 1.2, 1.4), marbleMat);
            arch.setPos(0, 11.5, -(L + borderZ + 8));
            root.add(arch);
            return;
        }

        // 6. APOLLO LUNAR ARENA
        if (id === 'std_moon_crater' || t.fog === 0x090d16) {
            const moonRockMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x475569), spec: 0.25 });
            const goldFoilMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xd4af37), spec: 0.95, shininess: 80 });
            const frameMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xe2e8f0), spec: 0.5 });
            const solarMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x1d4ed8), spec: 0.85, shininess: 90 });

            // Apollo Lunar Lander Outpost (behind north goal)
            const lander = new scene_js_1.Node();
            lander.setPos(W + 10, 0, -(L + borderZ + 8));
            const base = new scene_js_1.Node(G.cylinder(2.6, 3.2, 2.4, 8), goldFoilMat);
            base.setPos(0, 1.2, 0);
            const cabin = new scene_js_1.Node(G.cylinder(1.8, 1.8, 1.8, 8), frameMat);
            cabin.setPos(0, 3.2, 0);
            const antenna = new scene_js_1.Node(G.cone(1.3, 0.6, 10), goldFoilMat);
            antenna.rotation = [0.4, 0.2, 0];
            antenna.setPos(0, 4.5, 0);
            lander.add(base, cabin, antenna);
            root.add(lander);

            // Solar Arrays
            for (const [px, pz] of [[-(W + 11), -(L + borderZ + 8)], [-(W + 11), L * 0.4]]) {
                const solar = new scene_js_1.Node();
                solar.setPos(px, 0, pz);
                const pole = new scene_js_1.Node(G.cylinder(0.14, 0.14, 3.2, 6), frameMat);
                pole.setPos(0, 1.6, 0);
                const panel = new scene_js_1.Node(G.box(6.0, 0.1, 3.0), solarMat);
                panel.setPos(0, 3.2, 0);
                panel.rotation = [0.45, 0.3, 0];
                solar.add(pole, panel);
                root.add(solar);
            }

            // Crater rocks enclosing perimeter
            for (const [mx, mz, ms] of [
                [-18, -(L + borderZ + 6), 2.5], [16, -(L + borderZ + 6), 2.2],
                [-(W + 8), 0, 2.6], [W + 8, 0, 2.4],
                [-(W + 7), L * 0.5, 2.1], [W + 7, L * 0.5, 2.0]
            ]) {
                const rock = new scene_js_1.Node(G.sphere(0.9 * ms, 8, 6), moonRockMat);
                rock.scale = [1.3, 0.75, 1.2];
                rock.setPos(mx, 0.45 * ms, mz);
                root.add(rock);
            }
            return;
        }

        // 7. MARS BIO-DOME ARENA
        if (id === 'std_mars_dome' || t.fog === 0x2a0808) {
            const rockMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x9a3412), spec: 0.2 });
            const strutMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x475569), spec: 0.7, shininess: 50 });
            const glowMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xf97316), emissive: [1.4, 0.5, 0.1], unlit: true });

            // Geodesic bio-dome lattice arches overhead!
            for (const archSign of [-1, 1]) {
                const arch = new scene_js_1.Node(G.torus(40, 0.5, 32, 8), strutMat);
                arch.rotation = [Math.PI / 2, archSign * 0.24, 0];
                arch.setPos(0, 10, 0);
                root.add(arch);
            }

            // Martian canyon boulders
            for (const [bx, bz, bs] of [
                [-16, -(L + borderZ + 8), 2.8], [16, -(L + borderZ + 8), 2.6],
                [-(W + 8), -(L + 4), 2.4], [W + 8, -(L + 4), 2.2],
                [-(W + 12), 0, 3.0], [W + 12, 0, 2.8],
                [-(W + 8), L * 0.6, 2.4], [W + 8, L * 0.6, 2.5]
            ]) {
                const boulder = new scene_js_1.Node(G.sphere(bs * 0.9, 8, 6), rockMat);
                boulder.scale = [1.3, 0.8, 1.15];
                boulder.setPos(bx, bs * 0.45, bz);
                root.add(boulder);
            }

            // Habitat antenna beacon pylons
            for (const sx of [-1, 1]) {
                for (const sz of [-1, 1]) {
                    const pylon = new scene_js_1.Node(G.cylinder(0.35, 0.6, 10.0, 8), strutMat);
                    pylon.setPos(sx * (W + 7.5), 5.0, sz * (L + borderZ + 4.5));
                    const beacon = new scene_js_1.Node(G.sphere(0.75, 8, 6), glowMat);
                    beacon.setPos(sx * (W + 7.5), 10.3, sz * (L + borderZ + 4.5));
                    root.add(pylon, beacon);
                }
            }
            return;
        }

        // 8. ORBITAL SPACE COLOSSEUM
        if (id === 'std_space_orbit' || t.fog === 0x050714) {
            const metalMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x0f172a), spec: 0.8, shininess: 70 });
            const cyanGlow = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x00f0ff), emissive: [0.3, 1.3, 1.7], unlit: true });
            const purpleGlow = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xa855f7), emissive: [1.4, 0.4, 1.7], unlit: true });

            for (const sx of [-1, 1]) {
                for (const sz of [-1, 1]) {
                    const pylon = new scene_js_1.Node(G.cylinder(0.45, 0.7, 9.5, 8), metalMat);
                    pylon.setPos(sx * (W + 5.5), 4.75, sz * (L + borderZ + 3.0));
                    const orb = new scene_js_1.Node(G.sphere(0.8, 8, 6), sx * sz > 0 ? cyanGlow : purpleGlow);
                    orb.setPos(sx * (W + 5.5), 9.9, sz * (L + borderZ + 3.0));
                    root.add(pylon, orb);
                }
            }

            for (const sx of [-1, 1]) {
                const wing = new scene_js_1.Node(G.box(16.0, 0.2, 4.2), (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x1e3a8a), spec: 0.9, shininess: 85 }));
                wing.setPos(sx * (W + 18), 5.5, 0);
                wing.rotation = [0.3, 0, sx * 0.1];
                root.add(wing);
            }
            return;
        }

        // 9. MAGMA CALDERA ARENA
        if (id === 'std_volcano_caldera' || t.fog === 0x200505) {
            const lavaMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xff4500), emissive: [1.5, 0.5, 0.1], unlit: true, spec: 0.9 });
            const basaltMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x1c1917), spec: 0.25 });

            const lavaLake = new scene_js_1.Node(G.plane(500, 300), lavaMat);
            lavaLake.setPos(0, -0.09, -(L + borderZ + 70));
            root.add(lavaLake);

            for (const [vx, vz, vh] of [
                [-(W + 9), -(L + 5), 8.5], [W + 9, -(L + 5), 8.0],
                [-16, -(L + borderZ + 8), 10.0], [16, -(L + borderZ + 8), 9.5],
                [-(W + 13), 0, 10.5], [W + 13, 0, 10.0],
                [-(W + 9), L * 0.55, 7.5], [W + 9, L * 0.55, 8.0]
            ]) {
                const spire = new scene_js_1.Node(G.cone(2.6, vh, 5), basaltMat);
                spire.setPos(vx, vh / 2, vz);
                root.add(spire);
            }
            return;
        }

        // 10. ABYSSAL OCEAN DOME
        if (id === 'std_underwater_dome' || t.fog === 0x041f30) {
            const domeMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x0e7490), spec: 0.8, shininess: 60 });
            const pinkCoral = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xf43f5e), emissive: [1.3, 0.2, 0.4], unlit: true });
            const cyanCoral = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x22d3ee), emissive: [0.2, 1.3, 1.5], unlit: true });

            for (const archSign of [-1, 1]) {
                const arch = new scene_js_1.Node(G.torus(38, 0.4, 28, 8), domeMat);
                arch.rotation = [Math.PI / 2, archSign * 0.25, 0];
                arch.setPos(0, 9, 0);
                root.add(arch);
            }

            for (const [cx, cz, cType] of [
                [-(W + 7), -(L + 5), 1], [W + 7, -(L + 5), 2],
                [-15, -(L + borderZ + 6), 2], [15, -(L + borderZ + 6), 1],
                [-(W + 9), 0, 1], [W + 9, 0, 2],
                [-(W + 7), L * 0.6, 2], [W + 7, L * 0.6, 1]
            ]) {
                const cMat = cType === 1 ? pinkCoral : cyanCoral;
                for (let i = 0; i < 4; i++) {
                    const spire = new scene_js_1.Node(G.cone(0.5, 2.0 + i * 0.45, 5), cMat);
                    spire.setPos(cx + (i - 1.5) * 0.45, (2.0 + i * 0.45) / 2, cz + ((i % 2) - 0.5) * 0.45);
                    spire.rotation = [0.15 * (i - 1.5), 0, 0.12 * (i - 1.5)];
                    root.add(spire);
                }
            }
            return;
        }

        // 11. SKYLINE ROOFTOP
        if (id === 'std_hoops_sky' || t.fog === 0x3a2a4a) {
            const bldgMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x2a3340), spec: 0.5 });
            for (const [tx, tz, th, tw] of [
                [-(W + 16), -L * 0.4, 28, 14], [W + 16, -L * 0.4, 26, 14],
                [0, -(L + borderZ + 18), 34, 20], [-(W + 16), L * 0.4, 28, 14], [W + 16, L * 0.4, 30, 14]
            ]) {
                const tower = new scene_js_1.Node(G.box(tw, th, 14), bldgMat);
                tower.setPos(tx, th / 2, tz);
                root.add(tower);
            }
            return;
        }

        // 12. GOLD HARDWOOD
        if (id === 'std_hoops_gold') {
            const goldMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xf6c445), spec: 0.95, shininess: 90 });
            const marbleMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xf8fafc), spec: 0.5 });
            for (const [px, pz] of [
                [-(W + 6), -(L + 5)], [W + 6, -(L + 5)],
                [-(W + 6), L + 5], [W + 6, L + 5],
                [-14, -(L + borderZ + 5)], [14, -(L + borderZ + 5)]
            ]) {
                const ped = new scene_js_1.Node(G.cylinder(0.7, 0.8, 1.6, 8), marbleMat);
                ped.setPos(px, 0.8, pz);
                const trophy = new scene_js_1.Node(G.cone(0.55, 1.4, 7), goldMat);
                trophy.setPos(px, 1.6 + 0.7, pz);
                root.add(ped, trophy);
            }
            return;
        }
    }

    function buildFootyArena(t, quality) {
        const root = new scene_js_1.Node();
        const { W, L, GW, GH, GD, POST_R } = football_js_2.FB;
        const isDefault = Boolean(t && (t.isDefault || t.id === 'std_footy_classic' || t.id === 'std_footy_night' || t.id === 'std_footy_golden'));
        
        // Massive seamless ground plane (500x500)
        const groundCol = (0, math_js_6.rgb)(t && t.floor ? t.floor : (t && t.hemiGround ? t.hemiGround : 0x0b1220));
        const ground = new scene_js_1.Node(G.plane(500, 500), (0, scene_js_1.material)({ color: groundCol, receiveShadow: true, spec: 0.05, fog: false }));
        ground.setPos(0, -0.06, 0);

        // 360-Degree Panoramic Sky Dome
        buildArenaSkyAndHorizon(root, t, W, L, false, quality);

        const [pw, pd] = (0, textures_js_1.pitchPlaneSize)();
        const pitch = new scene_js_1.Node(G.plane(pw, pd), (0, scene_js_1.material)({ texture: new scene_js_1.Texture((0, textures_js_1.makePitchTexture)(t), { mipmap: true, srgb: true }), receiveShadow: true, spec: 0.12, shininess: 25 }));
        root.add(ground, pitch);

        const postMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xf4f6f8), spec: 0.7, shininess: 70, rim: 0.2, castShadow: true });
        const netTex = new scene_js_1.Texture((0, textures_js_1.makeNetTexture)(), { repeat: true, mipmap: true, srgb: true });
        const mkNet = (w, h, ux, uy) => new scene_js_1.Node(G.quad(w, h), (0, scene_js_1.material)({ texture: netTex, transparent: true, alpha: 0.85, doubleSided: true, depthWrite: false, uvScale: [ux, uy], receiveShadow: false, castShadow: false, color: (0, math_js_6.rgb)(0xe8eef5) }));
        const nets = [];
        for (const s of [-1, 1]) {
            const goal = new scene_js_1.Node();
            goal.setPos(0, 0, s * L);
            const pr = GW + POST_R;
            for (const sx of [-1, 1]) {
                const post = new scene_js_1.Node(G.cylinder(POST_R, POST_R, GH + POST_R, 10), postMat);
                post.setPos(sx * pr, (GH + POST_R) / 2, 0);
                const back = new scene_js_1.Node(G.cylinder(POST_R * 0.7, POST_R * 0.7, GH * 0.9, 8), postMat);
                back.setPos(sx * pr, GH * 0.45, s * GD);
                goal.add(post, back);
            }
            const bar = new scene_js_1.Node(G.cylinder(POST_R, POST_R, 2 * pr + POST_R, 10), postMat);
            bar.rotation = [0, 0, Math.PI / 2];
            bar.setPos(0, GH + POST_R * 0.5, 0);
            const backBar = new scene_js_1.Node(G.cylinder(POST_R * 0.7, POST_R * 0.7, 2 * pr, 8), postMat);
            backBar.rotation = [0, 0, Math.PI / 2];
            backBar.setPos(0, GH * 0.9, s * GD);
            goal.add(bar, backBar);
            const net = new scene_js_1.Node();
            const back = mkNet(2 * GW, GH * 0.9, 10, 5);
            back.setPos(0, GH * 0.45, s * GD);
            const top = new scene_js_1.Node(G.plane(2 * GW, GD), back.material);
            top.setPos(0, GH * 0.5 + GH * 0.5, s * GD * 0.5);
            top.material = (0, scene_js_1.material)(Object.assign(Object.assign({}, back.material), { uvScale: [10, 5] }));
            top.rotation = [0, 0, 0];
            for (const sx of [-1, 1]) {
                const side = mkNet(GD, GH * 0.9, 5, 5);
                side.rotation = [0, Math.PI / 2, 0];
                side.setPos(sx * GW, GH * 0.45, s * GD * 0.5);
                net.add(side);
            }
            net.add(back, top);
            goal.add(net);
            nets.push(net);
            root.add(goal);
        }

        const led = ads_js_1.AD_CONFIG.enabled ? ledMaterials(t.boards, 2 * L + 2, (2 * W + 2 - (2 * GW + 3)) / 2, 'footy') : null;
        if (led) {
            for (const s of [-1, 1]) {
                ledBoard(root, led, true, 2 * L + 2, s * (W + 1.4), 0, s);
                for (const e of [-1, 1]) {
                    const seg = (2 * W + 2 - (2 * GW + 3)) / 2;
                    ledBoard(root, led, false, seg, s * (GW + 1.5 + seg / 2), e * (L + GD + 0.9), e);
                }
            }
            for (const e of [-1, 1]) {
                ledBoard(root, led, false, 12.0, 0, e * (L + GD + 2.2), e, 1.8, true);
            }
        }

        let crowd = { visible: false };
        if (!isDefault) {
            buildThemedEnvironment(root, t, W, L, GD, false, quality);
        } else {
            crowd = buildFootballStadiumArchitecture(root, t, W, L, GD, quality);
        }

        let netT = [0, 0];
        const arena = {
            root,
            bounds: { halfW: W, halfL: L },
            apply(scene) {
                scene.sunDir = t.sunDir;
                scene.sunColor = t.sunColor;
                scene.sky = (0, math_js_6.rgb)(t.hemiSky);
                scene.ground = (0, math_js_6.rgb)(t.hemiGround);
                scene.fogColor = (0, math_js_6.rgb)(t.fog);
                scene.fogNear = 75;
                scene.fogFar = 220;
                scene.pointLights = [
                    [-1, -1],
                    [1, -1],
                    [-1, 1],
                    [1, 1],
                ].map(([sx, sz], i) => ({ pos: [sx * (W + 9), 14, sz * (L + 6)], radius: 55, color: (0, math_js_6.rgb)(t.lights[i % t.lights.length]).map((v) => v * t.lightIntensity) }));
            },
            update(dt, _sim, excite) {
                for (let i = 0; i < 2; i++) {
                    netT[i] = Math.max(0, netT[i] - dt);
                    const k = netT[i] > 0 ? Math.sin((1 - netT[i] / 1.1) * 14) * netT[i] : 0;
                    const n = nets[i === 0 ? 1 : 0];
                    if (n) n.scale = [1 + k * 0.05, 1 + k * 0.1, 1 + k * 0.28];
                }
                if (crowd) crowd.visible = true;
                void excite;
                pulseLed(led, dt);
            },
            netHit(side) {
                netT[side] = 1.1;
            },
        };
        netT = [0, 0];
        return arena;
    }

    function buildCourtArena(t, quality) {
        const root = new scene_js_1.Node();
        const { W, L, APRON } = basketball_js_2.BB;
        const isDefault = Boolean(t && (t.isDefault || t.id === 'std_hoops_street' || t.id === 'std_hoops_gold'));
        
        // Massive seamless ground plane (500x500)
        const groundCol = (0, math_js_6.rgb)(t && t.floor ? t.floor : 0x0b0e16);
        const ground = new scene_js_1.Node(G.plane(500, 500), (0, scene_js_1.material)({ color: groundCol, receiveShadow: true, spec: 0.1, fog: false }));
        ground.setPos(0, -0.06, 0);

        // 360-Degree Panoramic Sky Dome
        buildArenaSkyAndHorizon(root, t, W, L, true, quality);

        const [pw, pd] = (0, textures_js_1.courtPlaneSize)();
        const court = new scene_js_1.Node(G.plane(pw, pd), (0, scene_js_1.material)({ texture: new scene_js_1.Texture((0, textures_js_1.makeCourtTexture)(t), { mipmap: true, srgb: true }), spec: 0.55, shininess: 65, receiveShadow: true }));
        root.add(ground, court);

        const boardTex = new scene_js_1.Texture((0, textures_js_1.makeBackboardTexture)(), { srgb: true });
        const glassMat = (0, scene_js_1.material)({ texture: boardTex, transparent: true, alpha: 0.7, spec: 0.9, depthWrite: false, receiveShadow: false, castShadow: false, doubleSided: true });
        const frameMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xf2f4f7), spec: 0.6, castShadow: true });
        const rimMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(t.rim), emissive: (0, math_js_6.rgb)(t.rim).map((v) => v * 0.3), spec: 0.9, shininess: 60, castShadow: true });
        const poleMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x3b4252), spec: 0.4, castShadow: true });
        const netTex = new scene_js_1.Texture((0, textures_js_1.makeNetTexture)(), { repeat: true, mipmap: true, srgb: true });
        const hoopNets = [];
        const hoopRoots = [];
        for (const s of [-1, 1]) {
            const hz = s * basketball_js_2.BB.HOOP_Z;
            const bz = hz + s * basketball_js_2.BB.BOARD_OFFSET;
            const hoop = new scene_js_1.Node();
            const bh = basketball_js_2.BB.BOARD_TOP - basketball_js_2.BB.BOARD_BOTTOM;
            const board = new scene_js_1.Node(G.box(2 * basketball_js_2.BB.BOARD_W, bh, 2 * basketball_js_2.BB.BOARD_T), glassMat);
            board.setPos(0, (basketball_js_2.BB.BOARD_TOP + basketball_js_2.BB.BOARD_BOTTOM) / 2, bz);
            const fr = [
                [2 * basketball_js_2.BB.BOARD_W + 0.08, 0.06, 0, basketball_js_2.BB.BOARD_TOP],
                [2 * basketball_js_2.BB.BOARD_W + 0.08, 0.06, 0, basketball_js_2.BB.BOARD_BOTTOM],
                [0.06, bh, -basketball_js_2.BB.BOARD_W, (basketball_js_2.BB.BOARD_TOP + basketball_js_2.BB.BOARD_BOTTOM) / 2],
                [0.06, bh, basketball_js_2.BB.BOARD_W, (basketball_js_2.BB.BOARD_TOP + basketball_js_2.BB.BOARD_BOTTOM) / 2],
            ];
            for (const [w, h, x, y] of fr) {
                const f = new scene_js_1.Node(G.box(w, h, 2 * basketball_js_2.BB.BOARD_T + 0.02), frameMat);
                f.setPos(x, y, bz);
                hoop.add(f);
            }
            const rim = new scene_js_1.Node(G.torus(basketball_js_2.BB.RIM_R, basketball_js_2.BB.RIM_T, 14, 8), rimMat);
            rim.rotation = [Math.PI / 2, 0, 0];
            rim.setPos(0, basketball_js_2.BB.RIM_Y, hz);
            const mount = new scene_js_1.Node(G.box(0.14, 0.08, Math.abs(bz - hz) - basketball_js_2.BB.RIM_R), frameMat);
            mount.setPos(0, basketball_js_2.BB.RIM_Y, (hz + bz - s * basketball_js_2.BB.RIM_R) / 2);
            const net = new scene_js_1.Node(G.openCone(basketball_js_2.BB.RIM_R * 0.95, basketball_js_2.BB.NET_H, 12), (0, scene_js_1.material)({ texture: netTex, transparent: true, alpha: 0.85, doubleSided: true, depthWrite: false, uvScale: [6, 3], receiveShadow: false, castShadow: false, color: (0, math_js_6.rgb)(0xf1f5f9) }));
            net.rotation = [Math.PI, 0, 0];
            net.setPos(0, basketball_js_2.BB.RIM_Y - basketball_js_2.BB.NET_H, hz);
            hoopNets.push(net);
            const stanchion = new scene_js_1.Node();
            const poleZ = s * (L + APRON + 1.2);
            const poleH = basketball_js_2.BB.BOARD_TOP + 0.4;
            const pole = new scene_js_1.Node(G.cylinder(0.18, 0.24, poleH, 8), poleMat);
            pole.setPos(0, poleH / 2, poleZ);
            const armLen = Math.hypot(bz - poleZ, 0.3);
            const arm = new scene_js_1.Node(G.cylinder(0.1, 0.1, armLen, 6), poleMat);
            arm.rotation = [-s * Math.atan2(Math.abs(bz - poleZ), 0.3), 0, 0];
            arm.setPos(0, (basketball_js_2.BB.BOARD_TOP + basketball_js_2.BB.BOARD_BOTTOM) / 2, (bz + poleZ) / 2);
            const base = new scene_js_1.Node(G.box(1.6, 0.7, 1.4), (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x1f2937), spec: 0.4 }));
            base.setPos(0, 0.35, poleZ);
            stanchion.add(pole, arm, base);
            hoop.add(board, rim, mount, net, stanchion);
            root.add(hoop);
            hoopRoots.push(hoop);
        }

        const led = ads_js_1.AD_CONFIG.enabled ? ledMaterials(t.board, 2 * L, 2 * W, 'hoops') : null;
        if (led) {
            for (const s of [-1, 1]) {
                ledBoard(root, led, true, 2 * L, s * (W + APRON + 0.3), 0, s);
                for (const e of [-1, 1]) {
                    const seg = (2 * W - 3.2) / 2;
                    ledBoard(root, led, false, seg, s * (1.6 + seg / 2), e * (L + APRON + 1.4), e);
                }
            }
            for (const e of [-1, 1]) {
                ledBoard(root, led, false, 9.0, 0, e * (L + APRON + 2.4), e, 1.8, true);
            }
        }

        let crowd = { visible: false };
        if (!isDefault) {
            buildThemedEnvironment(root, t, W, L, APRON, true, quality);
        } else {
            crowd = buildBasketballArenaArchitecture(root, t, W, L, APRON, quality);
        }

        const nt = [0, 0];
        return {
            root,
            bounds: { halfW: W + APRON, halfL: L + APRON },
            apply(scene) {
                scene.sunDir = t.sunDir;
                scene.sunColor = t.sunColor;
                scene.sky = (0, math_js_6.rgb)(t.hemiSky);
                scene.ground = (0, math_js_6.rgb)(t.hemiGround);
                scene.fogColor = (0, math_js_6.rgb)(t.fog);
                scene.fogNear = 65;
                scene.fogFar = 180;
                scene.pointLights = [
                    [-1, -1],
                    [1, -1],
                    [-1, 1],
                    [1, 1],
                ].map(([sx, sz], i) => ({ pos: [sx * 7.5, 9.5, sz * 8], radius: 24, color: (0, math_js_6.rgb)(t.lights[i % t.lights.length]).map((v) => v * t.lightIntensity) }));
            },
            update(dt, sim, _excite) {
                var _a;
                const bs = sim;
                for (let i = 0; i < 2; i++) {
                    const hp = (_a = bs.hoops) === null || _a === void 0 ? void 0 : _a[i];
                    nt[i] = Math.max(nt[i] - dt, 0);
                    const k = hp ? Math.min(1, hp.net) : 0;
                    const holder = hoopNets[i === 0 ? 1 : 0];
                    if (holder) holder.scale = [1 - k * 0.22, 1 + k * 0.45, 1 - k * 0.22];
                }
                void hoopRoots;
                if (crowd) crowd.visible = true;
                pulseLed(led, dt);
            },
            netHit() {
            },
        };
    }
`;

code = code.substring(0, startRegionIdx) + newArenaModuleCode + code.substring(endRegionIdx);
fs.writeFileSync(gameJsPath, code, 'utf8');
console.log('Successfully patched js/game.js with complete Premium Arena Visual Overhaul!');
