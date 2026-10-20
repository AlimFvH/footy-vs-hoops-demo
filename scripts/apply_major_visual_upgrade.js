const fs = require('fs');
const path = require('path');

const gameJsPath = path.join(__dirname, '..', 'js', 'game.js');
let content = fs.readFileSync(gameJsPath, 'utf8');

console.log('Applying Major Visual Upgrade to js/game.js...');

// ============================================================================
// 1. ALL 12 THEMED ARENAS DUAL-MODE COMPATIBILITY IN data/shop
// ============================================================================
// Replace the stadium visual definitions so all 12 themed arenas have BOTH
// football and basketball properties (pitchA, pitchB, line, woodA, woodB, apron, floor, paint, rim, etc.)

const oldShopArenasRegex = /id:\s*'std_forest_redwood'[\s\S]*?id:\s*'std_crystal_cavern'[\s\S]*?visual:\s*Object\.assign\([\s\S]*?\),?\s*\},/g;

const enhancedShopArenas = `id: 'std_forest_redwood',
            category: 'stadiums',
            slot: 'stadium.hoops',
            mode: 'hoops',
            name: 'Redwood Forest Arena',
            rarity: 'epic',
            price: 560,
            icon: '🌲',
            visual: Object.assign(Object.assign(Object.assign({}, FOOTY_BASE), COURT_BASE), {
                id: 'std_forest_redwood',
                pitchA: 0x166534,
                pitchB: 0x14532d,
                line: 0xffffff,
                woodA: 0xb45309,
                woodB: 0x92400e,
                apron: 0x14532d,
                floor: 0x1e3a1e,
                paint: 0x15803d,
                centerPaint: 0x15803d,
                rim: 0x22c55e,
                skyTop: 0x0f2b1d,
                skyBottom: 0x164e32,
                fog: 0x0a2216,
                sunColor: [1.05, 1.15, 0.9],
                sunDir: [0.3, 0.85, 0.4],
                hemiSky: 0x86efac,
                hemiGround: 0x14532d,
                lights: [0xa7f3d0, 0xa7f3d0, 0xa7f3d0, 0xa7f3d0],
                glow: 0x86efac,
                accent: 0x22c55e,
                boards: 0x082014,
                board: 0x082014
            }),
        },
        {
            id: 'std_space_orbit',
            category: 'stadiums',
            slot: 'stadium.footy',
            mode: 'footy',
            name: 'Orbital Space Colosseum',
            rarity: 'legendary',
            price: 900,
            icon: '🚀',
            visual: Object.assign(Object.assign(Object.assign({}, FOOTY_BASE), COURT_BASE), {
                id: 'std_space_orbit',
                pitchA: 0x0f172a,
                pitchB: 0x020617,
                line: 0x00f0ff,
                woodA: 0x1e1b4b,
                woodB: 0x0f172a,
                apron: 0x0f172a,
                floor: 0x050714,
                paint: 0x7c3aed,
                centerPaint: 0x7c3aed,
                rim: 0x00f0ff,
                skyTop: 0x030712,
                skyBottom: 0x1e1b4b,
                fog: 0x050714,
                sunColor: [0.8, 0.6, 1.2],
                sunDir: [0.4, 0.7, 0.5],
                hemiSky: 0xa855f7,
                hemiGround: 0x0284c7,
                lights: [0x00f0ff, 0xa855f7, 0x00f0ff, 0xa855f7],
                lightIntensity: 1.15,
                glow: 0x00f0ff,
                accent: 0x38bdf8,
                boards: 0x060919,
                board: 0x060919
            }),
        },
        {
            id: 'std_mars_dome',
            category: 'stadiums',
            slot: 'stadium.hoops',
            mode: 'hoops',
            name: 'Mars Bio-Dome Arena',
            rarity: 'epic',
            price: 750,
            icon: '🔴',
            visual: Object.assign(Object.assign(Object.assign({}, FOOTY_BASE), COURT_BASE), {
                id: 'std_mars_dome',
                pitchA: 0x7c2d12,
                pitchB: 0x9a3412,
                line: 0xfef08a,
                woodA: 0xc2410c,
                woodB: 0x9a3412,
                apron: 0x451a03,
                floor: 0x451a03,
                paint: 0x7c2d12,
                centerPaint: 0x7c2d12,
                rim: 0xf97316,
                skyTop: 0x450a0a,
                skyBottom: 0x7f1d1d,
                fog: 0x2a0808,
                sunColor: [1.2, 0.7, 0.5],
                sunDir: [0.5, 0.75, 0.3],
                hemiSky: 0xfca5a5,
                hemiGround: 0x451a03,
                lights: [0xfdba74, 0xfdba74, 0xfdba74, 0xfdba74],
                glow: 0xf97316,
                accent: 0xe11d48,
                boards: 0x260a0a,
                board: 0x260a0a
            }),
        },
        {
            id: 'std_moon_crater',
            category: 'stadiums',
            slot: 'stadium.footy',
            mode: 'footy',
            name: 'Apollo Lunar Arena',
            rarity: 'rare',
            price: 680,
            icon: '🌕',
            visual: Object.assign(Object.assign(Object.assign({}, FOOTY_BASE), COURT_BASE), {
                id: 'std_moon_crater',
                pitchA: 0x334155,
                pitchB: 0x1e293b,
                line: 0xf8fafc,
                woodA: 0x475569,
                woodB: 0x334155,
                apron: 0x1e293b,
                floor: 0x0f172a,
                paint: 0x1e293b,
                centerPaint: 0x1e293b,
                rim: 0x38bdf8,
                skyTop: 0x020617,
                skyBottom: 0x0f172a,
                fog: 0x090d16,
                sunColor: [1.4, 1.4, 1.45],
                sunDir: [0.45, 0.8, 0.35],
                hemiSky: 0x94a3b8,
                hemiGround: 0x0f172a,
                lights: [0xffffff, 0xe2e8f0, 0xffffff, 0xe2e8f0],
                lightIntensity: 1.0,
                glow: 0x93c5fd,
                accent: 0x38bdf8,
                boards: 0x0f172a,
                board: 0x0f172a
            }),
        },
        {
            id: 'std_underwater_dome',
            category: 'stadiums',
            slot: 'stadium.hoops',
            mode: 'hoops',
            name: 'Abyssal Ocean Dome',
            rarity: 'legendary',
            price: 820,
            icon: '🫧',
            visual: Object.assign(Object.assign(Object.assign({}, FOOTY_BASE), COURT_BASE), {
                id: 'std_underwater_dome',
                pitchA: 0x0e7490,
                pitchB: 0x075985,
                line: 0x67e8f9,
                woodA: 0x0369a1,
                woodB: 0x075985,
                apron: 0x082f49,
                floor: 0x041f30,
                paint: 0x0e7490,
                centerPaint: 0x0e7490,
                rim: 0x22d3ee,
                skyTop: 0x022c44,
                skyBottom: 0x083344,
                fog: 0x041f30,
                sunColor: [0.6, 0.9, 1.1],
                sunDir: [0.1, 0.95, 0.2],
                hemiSky: 0x38bdf8,
                hemiGround: 0x021d2e,
                lights: [0x22d3ee, 0x06b6d4, 0x22d3ee, 0x06b6d4],
                lightIntensity: 1.05,
                glow: 0x22d3ee,
                accent: 0x06b6d4,
                boards: 0x041d2e,
                board: 0x041d2e
            }),
        },
        {
            id: 'std_cyber_megacity',
            category: 'stadiums',
            slot: 'stadium.footy',
            mode: 'footy',
            name: 'Neo Tokyo Megacity',
            rarity: 'legendary',
            price: 950,
            icon: '🏙️',
            visual: Object.assign(Object.assign(Object.assign({}, FOOTY_BASE), COURT_BASE), {
                id: 'std_cyber_megacity',
                pitchA: 0x18181b,
                pitchB: 0x09090b,
                line: 0xf43f5e,
                woodA: 0x1f1f23,
                woodB: 0x141416,
                apron: 0x18181b,
                floor: 0x09090b,
                paint: 0xe11d48,
                centerPaint: 0xe11d48,
                rim: 0x06b6d4,
                skyTop: 0x0f051d,
                skyBottom: 0x2e1065,
                fog: 0x150826,
                sunColor: [0.9, 0.4, 1.1],
                sunDir: [0.3, 0.8, 0.4],
                hemiSky: 0xd946ef,
                hemiGround: 0x09090b,
                lights: [0xf43f5e, 0x06b6d4, 0xf43f5e, 0x06b6d4],
                lightIntensity: 1.2,
                glow: 0xf43f5e,
                accent: 0x06b6d4,
                boards: 0x1c0b38,
                board: 0x1c0b38
            }),
        },
        {
            id: 'std_volcano_caldera',
            category: 'stadiums',
            slot: 'stadium.hoops',
            mode: 'hoops',
            name: 'Magma Caldera Arena',
            rarity: 'epic',
            price: 850,
            icon: '🌋',
            visual: Object.assign(Object.assign(Object.assign({}, FOOTY_BASE), COURT_BASE), {
                id: 'std_volcano_caldera',
                pitchA: 0x27272a,
                pitchB: 0x18181b,
                line: 0xfbbf24,
                woodA: 0x262626,
                woodB: 0x171717,
                apron: 0x450a0a,
                floor: 0x1c0505,
                paint: 0xb91c1c,
                centerPaint: 0xb91c1c,
                rim: 0xf59e0b,
                skyTop: 0x1c0505,
                skyBottom: 0x450a0a,
                fog: 0x200505,
                sunColor: [1.3, 0.6, 0.3],
                sunDir: [0.2, 0.85, 0.4],
                hemiSky: 0xf97316,
                hemiGround: 0x18181b,
                lights: [0xef4444, 0xf97316, 0xef4444, 0xf97316],
                lightIntensity: 1.1,
                glow: 0xef4444,
                accent: 0xf59e0b,
                boards: 0x1a0606,
                board: 0x1a0606
            }),
        },
        {
            id: 'std_floating_islands',
            category: 'stadiums',
            slot: 'stadium.footy',
            mode: 'footy',
            name: 'Aetheria Sky Islands',
            rarity: 'legendary',
            price: 880,
            icon: '☁️',
            visual: Object.assign(Object.assign(Object.assign({}, FOOTY_BASE), COURT_BASE), {
                id: 'std_floating_islands',
                pitchA: 0x22c55e,
                pitchB: 0x16a34a,
                line: 0xffffff,
                woodA: 0x0284c7,
                woodB: 0x0369a1,
                apron: 0x166534,
                floor: 0x0c4a6e,
                paint: 0x38bdf8,
                centerPaint: 0x38bdf8,
                rim: 0xfacc15,
                skyTop: 0x0284c7,
                skyBottom: 0x7dd3fc,
                fog: 0x38bdf8,
                sunColor: [1.35, 1.25, 1.0],
                sunDir: [0.5, 0.75, 0.35],
                hemiSky: 0xbae6fd,
                hemiGround: 0x166534,
                lights: [0xfffbeb, 0xfffbeb, 0xfffbeb, 0xfffbeb],
                lightIntensity: 1.0,
                glow: 0xfef08a,
                accent: 0x38bdf8,
                boards: 0x0c4a6e,
                board: 0x0c4a6e
            }),
        },
        {
            id: 'std_crystal_cavern',
            category: 'stadiums',
            slot: 'stadium.hoops',
            mode: 'hoops',
            name: 'Prismatic Crystal Cave',
            rarity: 'epic',
            price: 790,
            icon: '💎',
            visual: Object.assign(Object.assign(Object.assign({}, FOOTY_BASE), COURT_BASE), {
                id: 'std_crystal_cavern',
                pitchA: 0x3b0764,
                pitchB: 0x2e1065,
                line: 0xe879f9,
                woodA: 0x581c87,
                woodB: 0x3b0764,
                apron: 0x1e1b4b,
                floor: 0x160728,
                paint: 0x6b21a8,
                centerPaint: 0x6b21a8,
                rim: 0xc084fc,
                skyTop: 0x1e1b4b,
                skyBottom: 0x3b0764,
                fog: 0x160728,
                sunColor: [0.9, 0.6, 1.3],
                sunDir: [0.2, 0.9, 0.3],
                hemiSky: 0xc084fc,
                hemiGround: 0x1e1b4b,
                lights: [0xc084fc, 0xe879f9, 0xc084fc, 0xe879f9],
                lightIntensity: 1.15,
                glow: 0xe879f9,
                accent: 0xa855f7,
                boards: 0x1f0b3a,
                board: 0x1f0b3a
            }),
        },`;

content = content.replace(oldShopArenasRegex, enhancedShopArenas);
console.log('[OK] All 10 scenic arenas updated with complete dual-mode visual properties');

// ============================================================================
// 2. ENHANCED PROCEDURAL BALL TEXTURES in render/textures
// ============================================================================
const oldMakeBallTextureRegex = /function makeBallTexture\(v\) \{[\s\S]*?return c;\s*\}/;

const enhancedMakeBallTexture = `function makeBallTexture(v) {
        const [c, g] = makeCanvas(512, 256);
        const base = hex(v.base || (v.mode === 'footy' ? 0xf5f5f5 : 0xe8772e));
        const acc = hex(v.accent || (v.mode === 'footy' ? 0x111111 : 0x1a0d05));
        
        g.fillStyle = base;
        g.fillRect(0, 0, 512, 256);

        if (v.mode === 'footy') {
            // Subtle embossed leather grain micro-texture
            g.fillStyle = 'rgba(0,0,0,0.03)';
            for (let i = 0; i < 4000; i++) {
                g.fillRect(Math.random() * 512, Math.random() * 256, 1.5, 1.5);
            }

            // Authentic 32-panel geodesic pattern with double-stitched 3D seams
            const spots = [];
            for (let i = 0; i < 6; i++) {
                spots.push([i * 85.3 + 20, 128]);
            }
            for (let i = 0; i < 6; i++) {
                spots.push([i * 85.3 + 62, 36], [i * 85.3 + 62, 220]);
            }

            // Draw stitched hex boundary lines between panels
            g.strokeStyle = 'rgba(0,0,0,0.45)';
            g.lineWidth = 3.5;
            for (const [x, y] of spots) {
                g.beginPath();
                for (let k = 0; k < 6; k++) {
                    const a = (k / 6) * Math.PI * 2;
                    const px = x + Math.cos(a) * 44;
                    const py = y + Math.sin(a) * 44;
                    if (k === 0) g.moveTo(px, py);
                    else g.lineTo(px, py);
                }
                g.closePath();
                g.stroke();
            }

            // Draw contrasting pentagons with embossed highlights
            for (const [x, y] of spots) {
                // Shadow under pentagon
                g.fillStyle = 'rgba(0,0,0,0.35)';
                g.beginPath();
                for (let k = 0; k < 5; k++) {
                    const a = (k / 5) * Math.PI * 2 - Math.PI / 2;
                    g.lineTo(x + Math.cos(a) * 28 + 1, y + Math.sin(a) * 28 + 1.5);
                }
                g.closePath();
                g.fill();

                // Pentagon body
                g.fillStyle = acc;
                g.beginPath();
                for (let k = 0; k < 5; k++) {
                    const a = (k / 5) * Math.PI * 2 - Math.PI / 2;
                    g.lineTo(x + Math.cos(a) * 27, y + Math.sin(a) * 27);
                }
                g.closePath();
                g.fill();

                // Specular highlight rim inside pentagon
                g.strokeStyle = 'rgba(255,255,255,0.4)';
                g.lineWidth = 1.8;
                g.stroke();
            }

            // Special style rendering
            if (v.style === 'plasma') {
                g.strokeStyle = '#00f0ff';
                g.lineWidth = 4;
                g.shadowColor = '#00f0ff';
                g.shadowBlur = 12;
                for (let i = 0; i < 8; i++) {
                    g.beginPath();
                    g.arc(i * 64 + 32, 128, 24, 0, Math.PI * 2);
                    g.stroke();
                }
                g.shadowBlur = 0;
            } else if (v.style === 'stars') {
                g.fillStyle = '#ffffff';
                g.shadowColor = '#ffe27a';
                g.shadowBlur = 8;
                for (let i = 0; i < 12; i++) {
                    const sx = (i * 42.6 + 21) % 512;
                    const sy = 30 + (i % 3) * 90;
                    g.beginPath();
                    g.arc(sx, sy, 5, 0, Math.PI * 2);
                    g.fill();
                }
                g.shadowBlur = 0;
            } else if (v.style === 'flame') {
                g.fillStyle = 'rgba(255,100,0,0.4)';
                for (let i = 0; i < 16; i++) {
                    g.beginPath();
                    g.arc(i * 32 + 16, 128 + Math.sin(i) * 50, 18, 0, Math.PI * 2);
                    g.fill();
                }
            }
        } else {
            // Basketball: authentic composite pebbled leather grip texture
            g.fillStyle = 'rgba(0,0,0,0.18)';
            for (let y = 0; y < 256; y += 4) {
                for (let x = 0; x < 512; x += 4) {
                    if ((x + y) % 8 === 0) {
                        g.fillRect(x + 1, y + 1, 1.8, 1.8);
                    }
                }
            }

            // Highlight pebble dots
            g.fillStyle = 'rgba(255,255,255,0.15)';
            for (let y = 0; y < 256; y += 6) {
                for (let x = 0; x < 512; x += 6) {
                    g.fillRect(x, y, 1.2, 1.2);
                }
            }

            // Deep recessed black rubber grip seams
            g.strokeStyle = acc;
            g.lineWidth = 7;
            g.lineCap = 'round';

            // Center horizontal equator seam
            g.beginPath();
            g.moveTo(0, 128);
            g.lineTo(512, 128);
            g.stroke();

            // Vertical rib seams
            for (let x = 0; x <= 512; x += 128) {
                g.beginPath();
                g.moveTo(x, 0);
                g.lineTo(x, 256);
                g.stroke();
            }

            // Curved side ribs
            for (const x of [64, 192, 320, 448]) {
                g.beginPath();
                g.arc(x, 128, 92, -1.1, 1.1);
                g.stroke();
                g.beginPath();
                g.arc(x, 128, 92, Math.PI - 1.1, Math.PI + 1.1);
                g.stroke();
            }

            // Inner shadow groove for 3D depth
            g.strokeStyle = 'rgba(0,0,0,0.85)';
            g.lineWidth = 3.5;
            g.beginPath();
            g.moveTo(0, 128);
            g.lineTo(512, 128);
            g.stroke();
            for (let x = 0; x <= 512; x += 128) {
                g.beginPath();
                g.moveTo(x, 0);
                g.lineTo(x, 256);
                g.stroke();
            }

            // Special style rendering
            if (v.style === 'stripes') {
                g.strokeStyle = '#00f0ff';
                g.lineWidth = 3;
                g.shadowColor = '#00f0ff';
                g.shadowBlur = 10;
                for (let x = 32; x < 512; x += 64) {
                    g.beginPath();
                    g.moveTo(x, 0);
                    g.lineTo(x, 256);
                    g.stroke();
                }
                g.shadowBlur = 0;
            } else if (v.style === 'chrome') {
                const grad = g.createLinearGradient(0, 0, 512, 0);
                grad.addColorStop(0, 'rgba(255,255,255,0.4)');
                grad.addColorStop(0.5, 'rgba(0,0,0,0.3)');
                grad.addColorStop(1, 'rgba(255,255,255,0.4)');
                g.fillStyle = grad;
                g.fillRect(0, 0, 512, 256);
            }
        }
        return c;
    }`;

content = content.replace(oldMakeBallTextureRegex, enhancedMakeBallTexture);
console.log('[OK] makeBallTexture upgraded to 512x256 high-res procedural materials');

// ============================================================================
// 3. MASTER THEMED 3D ENVIRONMENTS ENGINE IN render/arena
// ============================================================================
// Replace the old addCoastalScenery helper with comprehensive buildThemedEnvironment
const oldSceneryRegex = /function addCoastalScenery\([\s\S]*?makePalm\(24, shoreZ \+ 8\.5, 1\.35\);\s*\}/;

const masterThemedEnvironmentBuilder = `function buildThemedEnvironment(root, t, W, L, borderZ, isHoops, quality) {
        const id = (t && t.id) || '';
        const shoreZ = -(L + borderZ + 4.5);
        const edgeZ = -(L + borderZ + 3.5);

        // 1. COASTAL SUNSET COURT
        if (id === 'std_ocean_sunset' || t.fog === 0x3a1a2e) {
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
            makePalm(-16, shoreZ + 5.5, 1.25);
            makePalm(16, shoreZ + 5.5, 1.25);
            makePalm(-24, shoreZ + 8.5, 1.35);
            makePalm(24, shoreZ + 8.5, 1.35);

            // Coastal beach rocks
            const rockMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x64748b), spec: 0.3 });
            for (const [rx, rz, rs] of [[-(W + 5), shoreZ + 3, 1.3], [W + 5, shoreZ + 3, 1.2], [-W - 14, -L * 0.3, 1.6], [W + 14, -L * 0.3, 1.5], [-W - 10, L * 0.7, 1.1]]) {
                const rock = new scene_js_1.Node(G.sphere(0.9 * rs, 7, 5), rockMat);
                rock.scale = [1.4, 0.65, 1.1];
                rock.setPos(rx, 0.3 * rs, rz);
                root.add(rock);
            }
            return;
        }

        // 2. REDWOOD FOREST ARENA
        if (id === 'std_forest_redwood' || t.fog === 0x0a2216) {
            const barkMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x451a03), spec: 0.15 });
            const pineMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x14532d), spec: 0.2 });
            const fernMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x22c55e), spec: 0.25, doubleSided: true });
            const logMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x361c0d), spec: 0.2 });

            function makeRedwood(x, z, h, r) {
                h = h || 26;
                r = r || 1.8;
                const tree = new scene_js_1.Node();
                tree.setPos(x, 0, z);
                const trunk = new scene_js_1.Node(G.cylinder(r * 0.65, r, h, 8), barkMat);
                trunk.setPos(0, h / 2, 0);
                tree.add(trunk);
                for (let i = 0; i < 4; i++) {
                    const branchY = h * (0.45 + i * 0.15);
                    const bRad = (4 - i * 0.7) * (r / 1.8);
                    const foliage = new scene_js_1.Node(G.cone(bRad, 2.8, 6), pineMat);
                    foliage.setPos(0, branchY, 0);
                    tree.add(foliage);
                }
                const topCrown = new scene_js_1.Node(G.cone(2.2 * (r / 1.8), 4.5, 6), pineMat);
                topCrown.setPos(0, h + 1.2, 0);
                tree.add(topCrown);
                root.add(tree);
            }

            const trees = [
                [-(W + 8), -(L + 6), 28, 2.0], [W + 8, -(L + 6), 28, 2.0],
                [-(W + 15), -(L + 12), 32, 2.4], [W + 15, -(L + 12), 32, 2.4],
                [-14, -(L + borderZ + 8), 24, 1.7], [14, -(L + borderZ + 8), 24, 1.7],
                [-(W + 9), 0, 26, 1.9], [W + 9, 0, 26, 1.9],
                [-(W + 14), 0, 30, 2.2], [W + 14, 0, 30, 2.2],
                [-(W + 8), L * 0.6, 26, 1.8], [W + 8, L * 0.6, 26, 1.8],
                [-(W + 10), L + 8, 28, 2.0], [W + 10, L + 8, 28, 2.0],
                [-16, L + borderZ + 8, 25, 1.7], [16, L + borderZ + 8, 25, 1.7]
            ];
            for (const [tx, tz, th, tr] of trees) {
                makeRedwood(tx, tz, th, tr);
            }

            const log = new scene_js_1.Node(G.cylinder(0.55, 0.7, 16, 7), logMat);
            log.rotation = [0, 0, Math.PI / 2];
            log.setPos(0, 0.45, -(L + borderZ + 5.5));
            root.add(log);

            for (const [fx, fz] of [[-(W + 5), -L * 0.4], [W + 5, -L * 0.4], [-(W + 5), L * 0.4], [W + 5, L * 0.4], [-8, -(L + borderZ + 4)], [8, -(L + borderZ + 4)]]) {
                const fern = new scene_js_1.Node(G.cone(1.4, 0.45, 5), fernMat);
                fern.setPos(fx, 0.2, fz);
                root.add(fern);
            }
            return;
        }

        // 3. MARS BIO-DOME ARENA
        if (id === 'std_mars_dome' || t.fog === 0x2a0808) {
            const rockMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x9a3412), spec: 0.2 });
            const darkRockMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x5c1d06), spec: 0.15 });
            const strutMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x475569), spec: 0.7, shininess: 50 });
            const glowMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xf97316), emissive: [1.2, 0.4, 0.1], unlit: true });

            for (const archSign of [-1, 1]) {
                const arch = new scene_js_1.Node(G.torus(38, 0.4, 28, 8), strutMat);
                arch.rotation = [Math.PI / 2, archSign * 0.22, 0];
                arch.setPos(0, 8, 0);
                root.add(arch);
            }

            for (const [bx, bz, bs] of [
                [-(W + 6), -(L + 4), 2.2], [W + 6, -(L + 4), 2.0],
                [-14, -(L + borderZ + 6), 2.5], [14, -(L + borderZ + 6), 2.4],
                [-(W + 11), 0, 2.8], [W + 11, 0, 2.6],
                [-(W + 7), L * 0.6, 2.0], [W + 7, L * 0.6, 2.1],
                [-(W + 6), L + 6, 2.4], [W + 6, L + 6, 2.3]
            ]) {
                const boulder = new scene_js_1.Node(G.sphere(bs * 0.8, 8, 6), (bx * bz > 0 ? rockMat : darkRockMat));
                boulder.scale = [1.3, 0.75, 1.1];
                boulder.setPos(bx, bs * 0.4, bz);
                root.add(boulder);
            }

            for (const sx of [-1, 1]) {
                for (const sz of [-1, 1]) {
                    const pylon = new scene_js_1.Node(G.cylinder(0.35, 0.55, 9.0, 8), strutMat);
                    pylon.setPos(sx * (W + 6.5), 4.5, sz * (L + borderZ + 3.5));
                    const beacon = new scene_js_1.Node(G.sphere(0.65, 8, 6), glowMat);
                    beacon.setPos(sx * (W + 6.5), 9.2, sz * (L + borderZ + 3.5));
                    root.add(pylon, beacon);
                }
            }
            return;
        }

        // 4. APOLLO LUNAR ARENA
        if (id === 'std_moon_crater' || t.fog === 0x090d16) {
            const moonRockMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x475569), spec: 0.25 });
            const goldFoilMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xd4af37), spec: 0.9, shininess: 80 });
            const solarMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x1d4ed8), spec: 0.85, shininess: 90 });
            const frameMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xe2e8f0), spec: 0.5 });

            // Glowing Earth on Horizon
            const earth = new scene_js_1.Node(G.sphere(9.5, 24, 18), (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x0284c7), spec: 0.8, emissive: [0.08, 0.25, 0.55] }));
            earth.setPos(18, 24, edgeZ - 130);
            const earthCloud = new scene_js_1.Node(G.sphere(9.65, 20, 16), (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xffffff), transparent: true, alpha: 0.65, unlit: true }));
            earthCloud.setPos(18, 24, edgeZ - 130);
            const earthAtmosphere = new scene_js_1.Node(G.ring(9.7, 12.0, 32), (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x38bdf8), unlit: true, transparent: true, alpha: 0.45, additive: true }));
            earthAtmosphere.setPos(18, 24, edgeZ - 128);
            root.add(earth, earthCloud, earthAtmosphere);

            // Lunar Lander Outpost
            const lander = new scene_js_1.Node();
            lander.setPos(W + 9, 0, -(L + borderZ + 7));
            const base = new scene_js_1.Node(G.cylinder(2.2, 2.8, 2.0, 8), goldFoilMat);
            base.setPos(0, 1.0, 0);
            const cabin = new scene_js_1.Node(G.cylinder(1.6, 1.6, 1.5, 8), frameMat);
            cabin.setPos(0, 2.7, 0);
            const antenna = new scene_js_1.Node(G.cone(1.1, 0.5, 10), goldFoilMat);
            antenna.rotation = [0.4, 0.2, 0];
            antenna.setPos(0, 3.8, 0);
            lander.add(base, cabin, antenna);
            root.add(lander);

            // Solar Arrays
            for (const [px, pz] of [[-(W + 10), -(L + borderZ + 6)], [-(W + 10), L * 0.4]]) {
                const solar = new scene_js_1.Node();
                solar.setPos(px, 0, pz);
                const pole = new scene_js_1.Node(G.cylinder(0.12, 0.12, 2.6, 6), frameMat);
                pole.setPos(0, 1.3, 0);
                const panel = new scene_js_1.Node(G.box(5.2, 0.08, 2.6), solarMat);
                panel.setPos(0, 2.6, 0);
                panel.rotation = [0.45, 0.3, 0];
                solar.add(pole, panel);
                root.add(solar);
            }

            for (const [mx, mz, ms] of [[-16, -(L + borderZ + 5), 2.0], [14, -(L + borderZ + 5), 1.8], [-W - 6, 0, 2.2], [W + 6, 0, 2.1], [-W - 6, L * 0.5, 1.7]]) {
                const rock = new scene_js_1.Node(G.sphere(0.85 * ms, 8, 6), moonRockMat);
                rock.scale = [1.2, 0.7, 1.3];
                rock.setPos(mx, 0.4 * ms, mz);
                root.add(rock);
            }
            return;
        }

        // 5. ORBITAL SPACE COLOSSEUM
        if (id === 'std_space_orbit' || t.fog === 0x050714) {
            const metalMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x0f172a), spec: 0.8, shininess: 70 });
            const cyanGlow = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x00f0ff), emissive: [0.2, 1.2, 1.5], unlit: true });
            const purpleGlow = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xa855f7), emissive: [1.2, 0.3, 1.5], unlit: true });

            for (const [nx, ny, nz, col, rot] of [
                [0, 25, edgeZ - 140, 0x7c3aed, 0.2],
                [-45, 18, edgeZ - 120, 0x06b6d4, -0.3],
                [45, 20, edgeZ - 130, 0xa855f7, 0.15]
            ]) {
                const neb = new scene_js_1.Node(G.plane(180, 80), (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(col), unlit: true, transparent: true, alpha: 0.4, additive: true }));
                neb.setPos(nx, ny, nz);
                neb.rotation = [0, 0, rot];
                root.add(neb);
            }

            for (const sx of [-1, 1]) {
                for (const sz of [-1, 1]) {
                    const pylon = new scene_js_1.Node(G.cylinder(0.4, 0.65, 8.5, 8), metalMat);
                    pylon.setPos(sx * (W + 4.5), 4.25, sz * (L + borderZ + 2.5));
                    const orb = new scene_js_1.Node(G.sphere(0.7, 8, 6), (sx * sz > 0 ? cyanGlow : purpleGlow));
                    orb.setPos(sx * (W + 4.5), 8.8, sz * (L + borderZ + 2.5));
                    root.add(pylon, orb);
                }
            }

            for (const sx of [-1, 1]) {
                const wing = new scene_js_1.Node(G.box(14.0, 0.15, 3.8), (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x1e3a8a), spec: 0.9, shininess: 85 }));
                wing.setPos(sx * (W + 16), 5.0, 0);
                wing.rotation = [0.3, 0, sx * 0.1];
                root.add(wing);
            }
            return;
        }

        // 6. ABYSSAL OCEAN DOME
        if (id === 'std_underwater_dome' || t.fog === 0x041f30) {
            const domeMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x0e7490), spec: 0.8, shininess: 60 });
            const pinkCoral = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xf43f5e), emissive: [1.2, 0.2, 0.4], unlit: true });
            const cyanCoral = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x22d3ee), emissive: [0.2, 1.2, 1.4], unlit: true });
            const kelpMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x059669), spec: 0.3, doubleSided: true });

            for (const archSign of [-1, 1]) {
                const arch = new scene_js_1.Node(G.torus(36, 0.35, 24, 8), domeMat);
                arch.rotation = [Math.PI / 2, archSign * 0.25, 0];
                arch.setPos(0, 8, 0);
                root.add(arch);
            }

            for (const [cx, cz, cType] of [
                [-(W + 6), -(L + 4), 1], [W + 6, -(L + 4), 2],
                [-14, -(L + borderZ + 5), 2], [14, -(L + borderZ + 5), 1],
                [-(W + 8), 0, 1], [W + 8, 0, 2],
                [-(W + 6), L * 0.6, 2], [W + 6, L * 0.6, 1]
            ]) {
                const cMat = (cType === 1 ? pinkCoral : cyanCoral);
                for (let i = 0; i < 4; i++) {
                    const spire = new scene_js_1.Node(G.cone(0.45, 1.8 + i * 0.4, 5), cMat);
                    spire.setPos(cx + (i - 1.5) * 0.4, (1.8 + i * 0.4) / 2, cz + ((i % 2) - 0.5) * 0.4);
                    spire.rotation = [0.15 * (i - 1.5), 0, 0.12 * (i - 1.5)];
                    root.add(spire);
                }
            }

            for (const [kx, kz] of [[-(W + 11), -L * 0.3], [W + 11, -L * 0.3], [-(W + 11), L * 0.3], [W + 11, L * 0.3], [-18, -(L + borderZ + 8)], [18, -(L + borderZ + 8)]]) {
                const kelp = new scene_js_1.Node(G.cylinder(0.2, 0.35, 9.5, 6), kelpMat);
                kelp.setPos(kx, 4.75, kz);
                kelp.rotation = [0.1, 0, 0.08];
                root.add(kelp);
            }
            return;
        }

        // 7. NEO TOKYO MEGACITY
        if (id === 'std_cyber_megacity' || t.fog === 0x150826) {
            const towerMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x18181b), spec: 0.6, shininess: 40 });
            const windowCyan = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x06b6d4), emissive: [0.1, 1.1, 1.3], unlit: true });
            const windowMagenta = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xf43f5e), emissive: [1.3, 0.2, 0.5], unlit: true });
            const windowGold = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xfbbf24), emissive: [1.2, 0.9, 0.2], unlit: true });

            const towers = [
                [-22, -(L + borderZ + 18), 34, 12, 10, windowCyan],
                [0, -(L + borderZ + 22), 42, 16, 12, windowMagenta],
                [22, -(L + borderZ + 18), 36, 12, 10, windowGold],
                [-(W + 18), -L * 0.4, 28, 10, 14, windowMagenta],
                [W + 18, -L * 0.4, 30, 10, 14, windowCyan],
                [-(W + 20), L * 0.4, 32, 12, 14, windowGold],
                [W + 20, L * 0.4, 28, 12, 14, windowMagenta]
            ];
            for (const [tx, tz, th, tw, td, winMat] of towers) {
                const bldg = new scene_js_1.Node();
                bldg.setPos(tx, 0, tz);
                const block = new scene_js_1.Node(G.box(tw, th, td), towerMat);
                block.setPos(0, th / 2, 0);
                bldg.add(block);
                for (let fl = 0; fl < 5; fl++) {
                    const strip = new scene_js_1.Node(G.box(tw + 0.1, 0.6, td + 0.1), winMat);
                    strip.setPos(0, th * (0.2 + fl * 0.15), 0);
                    bldg.add(strip);
                }
                root.add(bldg);
            }
            return;
        }

        // 8. MAGMA CALDERA ARENA
        if (id === 'std_volcano_caldera' || t.fog === 0x200505) {
            const lavaMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xff4500), emissive: [1.4, 0.45, 0.08], unlit: true, spec: 0.9 });
            const basaltMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x1c1917), spec: 0.2 });

            const lavaLake = new scene_js_1.Node(G.plane(500, 300), lavaMat);
            lavaLake.setPos(0, -0.09, -(L + borderZ + 80));
            root.add(lavaLake);

            for (const [vx, vz, vh] of [
                [-(W + 8), -(L + 4), 7.5], [W + 8, -(L + 4), 6.8],
                [-14, -(L + borderZ + 6), 8.5], [14, -(L + borderZ + 6), 8.0],
                [-(W + 12), 0, 9.0], [W + 12, 0, 8.5],
                [-(W + 8), L * 0.55, 6.5], [W + 8, L * 0.55, 7.0]
            ]) {
                const spire = new scene_js_1.Node(G.cone(2.2, vh, 5), basaltMat);
                spire.setPos(vx, vh / 2, vz);
                root.add(spire);
            }
            return;
        }

        // 9. AETHERIA SKY ISLANDS
        if (id === 'std_floating_islands' || t.fog === 0x38bdf8) {
            const cloudMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xf1f5f9), unlit: true, transparent: true, alpha: 0.92 });
            const pillarMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xe2e8f0), spec: 0.4 });
            const runeMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x38bdf8), emissive: [0.3, 1.1, 1.5], unlit: true });

            const clouds = new scene_js_1.Node(G.plane(600, 600), cloudMat);
            clouds.setPos(0, -12.0, 0);
            root.add(clouds);

            for (const [px, pz, ph] of [
                [-(W + 7), -(L + 4), 8.0], [W + 7, -(L + 4), 7.5],
                [-14, -(L + borderZ + 5), 8.5], [14, -(L + borderZ + 5), 8.0],
                [-(W + 8), 0, 9.0], [W + 8, 0, 8.5],
                [-(W + 7), L * 0.5, 7.5], [W + 7, L * 0.5, 8.0]
            ]) {
                const pillar = new scene_js_1.Node();
                pillar.setPos(px, 1.2, pz);
                const col = new scene_js_1.Node(G.cylinder(0.7, 0.75, ph, 8), pillarMat);
                col.setPos(0, ph / 2, 0);
                const rune = new scene_js_1.Node(G.box(0.3, 1.8, 0.3), runeMat);
                rune.setPos(0, ph * 0.6, 0.6);
                pillar.add(col, rune);
                root.add(pillar);
            }
            return;
        }

        // 10. PRISMATIC CRYSTAL CAVE
        if (id === 'std_crystal_cavern' || t.fog === 0x160728) {
            const crystalPurple = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xc084fc), emissive: [0.9, 0.3, 1.3], spec: 0.95, shininess: 85, unlit: true });
            const crystalPink = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xe879f9), emissive: [1.2, 0.4, 1.4], spec: 0.95, shininess: 85, unlit: true });
            const crystalCyan = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x38bdf8), emissive: [0.3, 1.0, 1.5], spec: 0.95, shininess: 85, unlit: true });

            for (const [cx, cz, ch, cMat] of [
                [-(W + 6), -(L + 4), 6.5, crystalPurple], [W + 6, -(L + 4), 5.8, crystalPink],
                [-14, -(L + borderZ + 5), 7.5, crystalCyan], [14, -(L + borderZ + 5), 7.0, crystalPurple],
                [-(W + 8), 0, 8.0, crystalPink], [W + 8, 0, 7.5, crystalCyan],
                [-(W + 6), L * 0.5, 6.0, crystalPurple], [W + 6, L * 0.5, 6.5, crystalPink]
            ]) {
                const cluster = new scene_js_1.Node();
                cluster.setPos(cx, 0, cz);
                for (let k = 0; k < 3; k++) {
                    const spire = new scene_js_1.Node(G.cone(0.8 - k * 0.15, ch - k * 1.0, 6), cMat);
                    spire.setPos((k - 1) * 0.6, (ch - k * 1.0) / 2, (k % 2) * 0.4);
                    spire.rotation = [(k - 1) * 0.18, 0, (1 - k) * 0.15];
                    cluster.add(spire);
                }
                root.add(cluster);
            }
            return;
        }

        // 11. SKYLINE ROOFTOP
        if (id === 'std_hoops_sky' || t.fog === 0x3a2a4a) {
            const bldgMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x2a3340), spec: 0.5 });
            for (const [tx, tz, th, tw] of [[-(W + 14), -L * 0.4, 26, 12], [W + 14, -L * 0.4, 24, 12], [0, -(L + borderZ + 16), 30, 18], [-(W + 15), L * 0.4, 25, 12], [W + 15, L * 0.4, 28, 12]]) {
                const tower = new scene_js_1.Node(G.box(tw, th, 12), bldgMat);
                tower.setPos(tx, th / 2, tz);
                root.add(tower);
            }
            return;
        }

        // 12. GOLD HARDWOOD
        if (id === 'std_hoops_gold') {
            const goldMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xf6c445), spec: 0.95, shininess: 90 });
            const marbleMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xf8fafc), spec: 0.5 });
            for (const [px, pz] of [[-(W + 5), -(L + 4)], [W + 5, -(L + 4)], [-(W + 5), L + 4], [W + 5, L + 4], [-12, -(L + borderZ + 4)], [12, -(L + borderZ + 4)]]) {
                const ped = new scene_js_1.Node(G.cylinder(0.6, 0.7, 1.4, 8), marbleMat);
                ped.setPos(px, 0.7, pz);
                const trophy = new scene_js_1.Node(G.cone(0.45, 1.2, 7), goldMat);
                trophy.setPos(px, 1.4 + 0.6, pz);
                root.add(ped, trophy);
            }
            return;
        }
    }`;

content = content.replace(oldSceneryRegex, masterThemedEnvironmentBuilder);
console.log('[OK] Master buildThemedEnvironment injected into render/arena');

// ============================================================================
// 4. DISTINGUISH DEFAULT ARENAS VS THEMED ARENAS in buildFootyArena & buildCourtArena
// ============================================================================

// Footy arena stands update
const oldFootyBuildRegex = /function buildFootyArena\(t, quality\) \{[\s\S]*?const footyStands =[\s\S]*?const crowd = crowdAndStands\(root, footyStands, t\.crowd, t\.stand, quality\);[\s\S]*?for \(const sx of \[-1, 1\]\)[\s\S]*?floodlight\(root, sx \* \(W \+ 9\), sz \* \(L \+ 6\), 18, t\.glow\);/;

const newFootyBuild = `function buildFootyArena(t, quality) {
        const root = new scene_js_1.Node();
        const { W, L, GW, GH, GD, POST_R } = football_js_2.FB;
        const isDefault = Boolean(t && (t.isDefault || t.id === 'std_footy_classic' || t.id === 'std_footy_night'));
        const groundCol = (0, math_js_6.rgb)(t && t.floor ? t.floor : (t && t.hemiGround ? t.hemiGround : 0x0b1220));
        const ground = new scene_js_1.Node(G.plane(400, 400), (0, scene_js_1.material)({ color: groundCol, receiveShadow: false, fog: true }));
        ground.setPos(0, -0.06, 0);
        root.add(ground);

        if (!isDefault) {
            // THEMED ARENA: Build realistic 3D world! Zero spectator stands!
            buildThemedEnvironment(root, t, W, L, GD, false, quality);
        } else {
            // DEFAULT ARENA: Traditional spectator stadium with crowd, stands & floodlights
            const stands = [
                { alongX: false, sign: -1, offset: W + 3.2, length: 2 * L + 8, rows: 7, center: 0 },
                { alongX: false, sign: 1, offset: W + 3.2, length: 2 * L + 8, rows: 7, center: 0 },
                { alongX: true, sign: -1, offset: L + GD + 3, length: 2 * W + 10, rows: 5, center: 0 },
                { alongX: true, sign: 1, offset: L + GD + 3, length: 2 * W + 10, rows: 5, center: 0 },
            ];
            const crowd = crowdAndStands(root, stands, t.crowd, t.stand, quality);
            for (const sx of [-1, 1]) {
                for (const sz of [-1, 1]) {
                    floodlight(root, sx * (W + 9), sz * (L + 6), 18, t.glow);
                }
            }
        }`;

content = content.replace(oldFootyBuildRegex, newFootyBuild);
console.log('[OK] buildFootyArena: strict distinction between default stadiums and themed worlds');

// Court arena stands update
const oldCourtBuildRegex = /function buildCourtArena\(t, quality\) \{[\s\S]*?const courtStands =[\s\S]*?const crowd = crowdAndStands\(root, courtStands, t\.crowd, t\.stand, quality\);[\s\S]*?for \(const sx of \[-1, 1\]\)[\s\S]*?bar\.setPos\(sx \* 7\.5, 10, sz \* 8\);[\s\S]*?root\.add\(bar\);[\s\S]*?\}/;

const newCourtBuild = `function buildCourtArena(t, quality) {
        const root = new scene_js_1.Node();
        const { W, L, APRON } = basketball_js_2.BB;
        const isDefault = Boolean(t && (t.isDefault || t.id === 'std_hoops_street'));
        const groundCol = (0, math_js_6.rgb)(t && t.floor ? t.floor : 0x0b0e16);
        const ground = new scene_js_1.Node(G.plane(400, 400), (0, scene_js_1.material)({ color: groundCol, receiveShadow: false }));
        ground.setPos(0, -0.06, 0);
        root.add(ground);

        if (!isDefault) {
            // THEMED ARENA: Build realistic 3D world! Zero spectator stands!
            buildThemedEnvironment(root, t, W, L, APRON, true, quality);
        } else {
            // DEFAULT ARENA: Traditional spectator basketball arena with crowd & stands
            const stands = [
                { alongX: false, sign: -1, offset: W + APRON + 2.4, length: 2 * L + 6, rows: 6, center: 0 },
                { alongX: false, sign: 1, offset: W + APRON + 2.4, length: 2 * L + 6, rows: 6, center: 0 },
                { alongX: true, sign: -1, offset: L + APRON + 4.4, length: 2 * W + 10, rows: 5, center: 0 },
                { alongX: true, sign: 1, offset: L + APRON + 4.4, length: 2 * W + 10, rows: 5, center: 0 },
            ];
            const crowd = crowdAndStands(root, stands, t.crowd, t.stand, quality);
            for (const sx of [-1, 1]) {
                for (const sz of [-1, 1]) {
                    const bar = new scene_js_1.Node(G.box(2.2, 0.2, 0.7), (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x20242e), emissive: (0, math_js_6.rgb)(t.glow).map((v) => v * 0.95), receiveShadow: false, fog: false }));
                    bar.setPos(sx * 7.5, 10, sz * 8);
                    root.add(bar);
                }
            }
        }`;

content = content.replace(oldCourtBuildRegex, newCourtBuild);
console.log('[OK] buildCourtArena: strict distinction between default stadiums and themed worlds');

// ============================================================================
// 5. 3D BOOST VISUAL AURA ON HUMAN PLAYER in MatchView
// ============================================================================
const oldMatchViewSetupRegex = /this\.fx = new effects_js_1\.Particles\(opts\.quality, visualOf\(eq\.trail, 'trail_default'\), visualOf\(eq\.celebration, 'cel_confetti'\)\);/;

const enhancedMatchViewSetup = `this.fx = new effects_js_1.Particles(opts.quality, visualOf(eq.trail, 'trail_default'), visualOf(eq.celebration, 'cel_confetti'));
            // 3D Boost visual aura
            this.boostId = opts.boostId || (eq && eq.boost);
            this.boostAura = null;
            if (this.boostId && this.chars.length > 0) {
                const bCols = {
                    boost_turbo: 0x00f0ff,
                    boost_lungs: 0x10b981,
                    boost_power: 0xf59e0b,
                    boost_coins: 0xf6c445
                };
                const bCol = bCols[this.boostId] || 0x00f0ff;
                const bRingMat = (0, scene_js_5.material)({
                    color: (0, math_js_10.rgb)(bCol),
                    emissive: (0, math_js_10.rgb)(bCol).map(v => v * 0.8),
                    unlit: true,
                    transparent: true,
                    alpha: 0.85,
                    additive: true,
                    depthWrite: false,
                    fog: false
                });
                this.boostAura = new scene_js_5.Node(G.ring(0.75, 0.98, 32), bRingMat);
                this.boostAura.setPos(0, 0.05, 0);
                // Attach to human character root
                for (const c of this.chars) {
                    if (c.agent && c.agent.human) {
                        c.root.add(this.boostAura);
                        break;
                    }
                }
            }`;

content = content.replace(oldMatchViewSetupRegex, enhancedMatchViewSetup);
console.log('[OK] 3D Boost visual aura attached to player');

// Smoothly pulse boost aura in MatchView.render / update
const oldMatchViewUpdateRegex = /this\.arena\.update\(dt, this\.sim, this\.excite\);/;
const enhancedMatchViewUpdate = `this.arena.update(dt, this.sim, this.excite);
        if (this.boostAura) {
            const bScale = 1.0 + 0.08 * Math.sin(this.time * 6.5);
            this.boostAura.scale = [bScale, 1.0, bScale];
        }`;

content = content.replace(oldMatchViewUpdateRegex, enhancedMatchViewUpdate);
console.log('[OK] Boost aura animation connected');

fs.writeFileSync(gameJsPath, content, 'utf8');
console.log('Successfully applied visual upgrades to js/game.js!');
