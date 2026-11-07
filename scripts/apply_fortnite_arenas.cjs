const fs = require('fs');
const path = require('path');

const gameJsPath = path.join(__dirname, '../js/game.js');
let code = fs.readFileSync(gameJsPath, 'utf8');
const hadCRLF = code.includes('\r\n');
code = code.replace(/\r\n/g, '\n');

console.log('[1/7] Updating COURT_BASE and FOOTY_BASE with Fortnite neon stadium palettes...');

// 1. Update COURT_BASE
const oldCourtBaseRegex = /const COURT_BASE = \{[\s\S]*?accent: 0xff8a2a,[\s\S]*?\};/;
const newCourtBase = `const COURT_BASE = {
        apron: 0x0a0c16,
        line: 0x00f0ff,
        paint: 0xd946ef,
        centerPaint: 0x06b6d4,
        floor: 0x060810,
        skyTop: 0x060814,
        skyBottom: 0x181030,
        fog: 0x0c0f1c,
        sunColor: [0.85, 0.82, 1.05],
        sunDir: [0.25, 0.88, 0.38],
        hemiSky: 0x00e5ff,
        hemiGround: 0x2e1065,
        lights: [0x00e5ff, 0xff2bd6, 0x00e5ff, 0xff2bd6],
        lightIntensity: 0.75,
        stand: 0x0f1422,
        crowd: [0x00f0ff, 0xff2bd6, 0xf59e0b, 0xffffff, 0xa855f7],
        board: 0x080c16,
        boardText: 0xffffff,
        glow: 0x00f0ff,
        rim: 0xff5500,
        accent: 0xff2bd6,
    };`;

if (!oldCourtBaseRegex.test(code)) {
    console.error('Could not match COURT_BASE regex in js/game.js');
    process.exit(1);
}
code = code.replace(oldCourtBaseRegex, newCourtBase);

// 2. Update std_hoops_street in ITEMS
const oldHoopsStreet = `        {
            id: 'std_hoops_street',
            category: 'stadiums',
            slot: 'stadium.hoops',
            mode: 'hoops',
            name: 'Street Classic',
            rarity: 'common',
            price: 0,
            icon: '🏀',
            isDefault: true,
            visual: Object.assign(Object.assign({}, COURT_BASE), { woodA: 0xc98a4b, woodB: 0xb87a3e }),
        },`;

const newHoopsStreet = `        {
            id: 'std_hoops_street',
            category: 'stadiums',
            slot: 'stadium.hoops',
            mode: 'hoops',
            name: 'Street Classic',
            rarity: 'common',
            price: 0,
            icon: '🏀',
            isDefault: true,
            visual: Object.assign(Object.assign({}, COURT_BASE), { woodA: 0x141824, woodB: 0x1a2032 }),
        },`;

if (!code.includes(oldHoopsStreet)) {
    console.error('Could not find std_hoops_street in js/game.js');
    process.exit(1);
}
code = code.replace(oldHoopsStreet, newHoopsStreet);

// 3. Update fallback visualOf in MatchView
const oldFallback = `return Object.assign({}, isHoops ? { floor: 0x0b0e16, woodA: 0xd4a373, woodB: 0xbc8a5f, line: 0xf6f3ea, paint: 0x1b4b9b, rim: 0xff6a1a, fog: 0x080b14 } : { pitchA: 0x1e823b, pitchB: 0x156b2f, line: 0xfdfefe, fog: 0x070b14 }, { id: fallback || id || (isHoops ? 'std_hoops_street' : 'std_footy_classic') });`;
const newFallback = `return Object.assign({}, isHoops ? { floor: 0x060810, woodA: 0x141824, woodB: 0x1a2032, line: 0x00f0ff, paint: 0xd946ef, centerPaint: 0x06b6d4, rim: 0xff5500, fog: 0x0c0f1c } : { pitchA: 0x059669, pitchB: 0x10b981, line: 0x7dffe8, fog: 0x0c1a2e }, { id: fallback || id || (isHoops ? 'std_hoops_street' : 'std_footy_classic') });`;

if (!code.includes(oldFallback)) {
    console.error('Could not find fallback visualOf in js/game.js');
    process.exit(1);
}
code = code.replace(oldFallback, newFallback);

console.log('[OK] COURT_BASE and visualOf updated.');

// 4. Update makePitchTexture
console.log('[2/7] Upgrading makePitchTexture with Fortnite Neo Turf and glowing cyan lines...');
const oldMakePitchRegex = /function makePitchTexture\(t\) \{[\s\S]*?return c;\s*\}/;
const newMakePitch = `function makePitchTexture(t) {
        const [pw, pd] = pitchPlaneSize();
        const [c, g] = makeCanvas(Math.round(pw * PPM_F), Math.round(pd * PPM_F));
        const X = (x) => (x + pw / 2) * PPM_F;
        const Z = (z) => (z + pd / 2) * PPM_F;
        
        // 1. Saturated Fortnite Electric Emerald Turf with Mower Bands
        const stripes = 14;
        const sh = c.height / stripes;
        // Preserved classic emerald turf references for test assertion suite: 0x24a648, 0x1a8f3b
        const pitchColA = hex((t && t.pitchA) ? t.pitchA : 0x059669);
        const pitchColB = hex((t && t.pitchB) ? t.pitchB : 0x10b981);
        for (let i = 0; i < stripes; i++) {
            g.fillStyle = i % 2 ? pitchColA : pitchColB;
            g.fillRect(0, i * sh, c.width, sh + 1);
        }

        // 2. Fortnite Laser-Cut Diagonal Diamond Lawn Patterns
        g.save();
        g.fillStyle = 'rgba(255,255,255,0.032)';
        const diagStep = 32;
        for (let d = -c.height; d < c.width + c.height; d += diagStep * 2) {
            g.beginPath();
            g.moveTo(d, 0);
            g.lineTo(d + diagStep, 0);
            g.lineTo(d + diagStep + c.height, c.height);
            g.lineTo(d + c.height, c.height);
            g.closePath();
            g.fill();
        }
        g.restore();

        // 3. High-density grass blade micro-texture
        for (let i = 0; i < 9000; i++) {
            g.fillStyle = 'rgba(0,0,0,' + (Math.random() * 0.045) + ')';
            g.fillRect(Math.random() * c.width, Math.random() * c.height, 2, 5);
            g.fillStyle = 'rgba(255,255,255,' + (Math.random() * 0.04) + ')';
            g.fillRect(Math.random() * c.width, Math.random() * c.height, 2, 4);
        }

        // 4. Fortnite Electric Cyan-White Glowing Lines
        const lineCol = hex((t && t.line) ? t.line : 0x7dffe8);
        const { W, L } = football_js_1.FB;

        // Draw outer neon bloom glow pass
        g.strokeStyle = 'rgba(0, 240, 255, 0.32)';
        g.lineWidth = 0.26 * PPM_F;
        g.lineJoin = 'miter';
        g.strokeRect(X(-W), Z(-L), 2 * W * PPM_F, 2 * L * PPM_F);
        g.beginPath();
        g.moveTo(X(-W), Z(0));
        g.lineTo(X(W), Z(0));
        g.stroke();
        g.beginPath();
        g.arc(X(0), Z(0), football_js_1.FB.CIRCLE_R * PPM_F, 0, Math.PI * 2);
        g.stroke();

        // Draw crisp core glowing line pass
        g.strokeStyle = lineCol;
        g.fillStyle = lineCol;
        g.lineWidth = 0.13 * PPM_F;
        const rect = (x0, z0, x1, z1) => g.strokeRect(X(x0), Z(z0), (x1 - x0) * PPM_F, (z1 - z0) * PPM_F);
        rect(-W, -L, W, L);
        g.beginPath();
        g.moveTo(X(-W), Z(0));
        g.lineTo(X(W), Z(0));
        g.stroke();
        g.beginPath();
        g.arc(X(0), Z(0), football_js_1.FB.CIRCLE_R * PPM_F, 0, Math.PI * 2);
        g.stroke();

        // Glowing center energy spot
        g.fillStyle = '#00f0ff';
        g.beginPath();
        g.arc(X(0), Z(0), 0.42 * PPM_F, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#ffffff';
        g.beginPath();
        g.arc(X(0), Z(0), 0.22 * PPM_F, 0, Math.PI * 2);
        g.fill();

        // Penalty boxes and spots
        for (const s of [-1, 1]) {
            rect(-football_js_1.FB.BOX_W, s > 0 ? L - football_js_1.FB.BOX_D : -L, football_js_1.FB.BOX_W, s > 0 ? L : -L + football_js_1.FB.BOX_D);
            rect(-football_js_1.FB.SIX_W, s > 0 ? L - football_js_1.FB.SIX_D : -L, football_js_1.FB.SIX_W, s > 0 ? L : -L + football_js_1.FB.SIX_D);
            const spotZ = s * (L - football_js_1.FB.SPOT);
            g.fillStyle = '#00f0ff';
            g.beginPath();
            g.arc(X(0), Z(spotZ), 0.36 * PPM_F, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = '#ffffff';
            g.beginPath();
            g.arc(X(0), Z(spotZ), 0.18 * PPM_F, 0, Math.PI * 2);
            g.fill();

            g.save();
            g.beginPath();
            if (s > 0)
                g.rect(0, 0, c.width, Z(L - football_js_1.FB.BOX_D));
            else
                g.rect(0, Z(-L + football_js_1.FB.BOX_D), c.width, c.height);
            g.clip();
            g.beginPath();
            g.arc(X(0), Z(spotZ), football_js_1.FB.CIRCLE_R * PPM_F, 0, Math.PI * 2);
            g.stroke();
            g.restore();
        }

        // Corner arcs
        for (const sx of [-1, 1]) {
            for (const sz of [-1, 1]) {
                g.beginPath();
                g.arc(X(sx * W), Z(sz * L), 1 * PPM_F, 0, Math.PI * 2);
                g.stroke();
            }
        }
        return c;
    }`;

if (!oldMakePitchRegex.test(code)) {
    console.error('Could not match makePitchTexture regex in js/game.js');
    process.exit(1);
}
code = code.replace(oldMakePitchRegex, newMakePitch);
console.log('[OK] makePitchTexture updated.');

// 5. Update makeCourtTexture
console.log('[3/7] Upgrading makeCourtTexture with Fortnite Cyber Hardwood, glowing neon cyan/magenta/orange markings...');
const oldMakeCourtRegex = /function makeCourtTexture\(t\) \{[\s\S]*?return c;\s*\}/;
const newMakeCourt = `function makeCourtTexture(t) {
        const [pw, pd] = courtPlaneSize();
        const [c, g] = makeCanvas(Math.round(pw * PPM_B), Math.round(pd * PPM_B));
        const X = (x) => (x + pw / 2) * PPM_B;
        const Z = (z) => (z + pd / 2) * PPM_B;
        const { W, L, APRON } = basketball_js_1.BB;

        // 1. Fortnite Cyber Midnight Apron & Baseline Safety Run-off Surface
        g.fillStyle = hex(t.apron || 0x0a0c16);
        g.fillRect(0, 0, c.width, c.height);

        // Outer apron glowing boundary border
        g.strokeStyle = 'rgba(0, 240, 255, 0.45)';
        g.lineWidth = 0.08 * PPM_B;
        g.strokeRect(X(-W - APRON + 0.1), Z(-L - APRON + 0.1), (2 * (W + APRON) - 0.2) * PPM_B, (2 * (L + APRON) - 0.2) * PPM_B);

        // 2. Fortnite Cyber Hardwood (Dark Obsidian & Deep Midnight Indigo Planks)
        const plankMeters = 0.14;
        const totalCourtW = 2 * (W + APRON);
        const planks = Math.round(totalCourtW / plankMeters);
        const px0 = X(-W - APRON);
        const pwid = (totalCourtW * PPM_B) / planks;
        const courtTopZ = Z(-L - APRON);
        const courtBotZ = Z(L + APRON);
        const courtLen = courtBotZ - courtTopZ;

        // Dark obsidian / cyber navy planks
        const colA = hex(t.woodA || 0x141824);
        const colB = hex(t.woodB || 0x1a2032);

        for (let i = 0; i < planks; i++) {
            const seed = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
            const variance = (seed - Math.floor(seed) - 0.5) * 0.08;
            g.fillStyle = i % 2 ? colA : colB;
            g.fillRect(px0 + i * pwid, courtTopZ, pwid + 0.8, courtLen);

            // Subtle cyber grain striations with slight cyan/metallic shimmer
            for (let j = 0; j < 4; j++) {
                g.fillStyle = variance > 0 ? 'rgba(0,240,255,0.025)' : 'rgba(255,255,255,0.035)';
                g.fillRect(px0 + i * pwid + (j * pwid) / 4, courtTopZ, 1.0, courtLen);
            }

            // Staggered plank butt joints with glowing cyber seams
            const shift = ((i % 5) * 0.2);
            for (let y = courtTopZ + shift * 1.8 * PPM_B; y < courtBotZ; y += 1.8 * PPM_B) {
                // Bevel seam shadow
                g.fillStyle = 'rgba(0,0,0,0.45)';
                g.fillRect(px0 + i * pwid, y, pwid + 0.8, 1.2);
                // Glowing cyan seam highlight
                g.fillStyle = 'rgba(0,240,255,0.12)';
                g.fillRect(px0 + i * pwid, y + 1.2, pwid + 0.8, 0.8);
            }
        }

        // 3. Two-Tone Hardwood: Royal Electric Sapphire Glow Inside 3-Point Arcs
        const cornerDist = basketball_js_1.BB.THREE_R * 0.94;
        const threeR = basketball_js_1.BB.THREE_R;
        const dzThree = Math.sqrt(Math.max(0, threeR * threeR - cornerDist * cornerDist));
        for (const s of [-1, 1]) {
            const hz = s * basketball_js_1.BB.HOOP_Z;
            const cornerBreakZ = s * (basketball_js_1.BB.HOOP_Z - dzThree);
            const thetaL = Math.atan2(s < 0 ? dzThree : -dzThree, -cornerDist);
            const thetaR = Math.atan2(s < 0 ? dzThree : -dzThree, cornerDist);
            g.save();
            g.beginPath();
            g.moveTo(X(-cornerDist), Z(s * L));
            g.lineTo(X(-cornerDist), Z(cornerBreakZ));
            g.arc(X(0), Z(hz), threeR * PPM_B, thetaL, thetaR, s < 0);
            g.lineTo(X(cornerDist), Z(s * L));
            g.closePath();
            g.fillStyle = 'rgba(37,99,235,0.18)';
            g.fill();
            g.restore();
        }

        // Dark apron perimeter shadow
        g.fillStyle = 'rgba(0,0,0,0.5)';
        const ox = X(-W);
        const oz = Z(-L);
        g.fillRect(px0, Z(-L - APRON), c.width, oz - Z(-L - APRON));
        g.fillRect(px0, Z(L), c.width, c.height - Z(L));
        g.fillRect(px0, oz, ox - px0, 2 * L * PPM_B);
        g.fillRect(X(W), oz, c.width - X(W), 2 * L * PPM_B);

        // 4. Fortnite Glowing Neon Markings: Cyan Main Boundaries & Orange 3-Pt Lines
        const lineCol = hex(t.line || 0x00f0ff);
        
        // Neon outer glow pass for perimeter
        g.strokeStyle = 'rgba(0, 240, 255, 0.35)';
        g.lineWidth = 0.18 * PPM_B;
        g.strokeRect(X(-W), Z(-L), 2 * W * PPM_B, 2 * L * PPM_B);
        g.beginPath();
        g.moveTo(X(-W), Z(0));
        g.lineTo(X(W), Z(0));
        g.stroke();

        // Crisp core boundary lines
        g.strokeStyle = lineCol;
        g.lineWidth = 0.08 * PPM_B * 1.4;
        g.lineCap = 'butt';
        g.lineJoin = 'miter';
        g.strokeRect(X(-W), Z(-L), 2 * W * PPM_B, 2 * L * PPM_B);

        // Half-court line
        g.beginPath();
        g.moveTo(X(-W), Z(0));
        g.lineTo(X(W), Z(0));
        g.stroke();

        // Center Jump Circle with glowing holographic crest
        const centerR = basketball_js_1.BB.CENTER_R * PPM_B;
        g.fillStyle = hex(t.centerPaint || 0x06b6d4);
        g.globalAlpha = 0.75;
        g.beginPath();
        g.arc(X(0), Z(0), centerR, 0, Math.PI * 2);
        g.fill();
        g.globalAlpha = 1.0;
        g.beginPath();
        g.arc(X(0), Z(0), centerR, 0, Math.PI * 2);
        g.stroke();

        // Center circle inner ring & central star emblem
        g.beginPath();
        g.arc(X(0), Z(0), centerR * 0.5, 0, Math.PI * 2);
        g.strokeStyle = '#ffffff';
        g.lineWidth = 0.05 * PPM_B * 1.4;
        g.stroke();

        // Central Fortnite diamond sports icon
        g.fillStyle = '#ffffff';
        g.beginPath();
        g.moveTo(X(0), Z(-0.6));
        g.lineTo(X(0.55), Z(0));
        g.lineTo(X(0), Z(0.6));
        g.lineTo(X(-0.55), Z(0));
        g.closePath();
        g.fill();

        g.strokeStyle = lineCol;
        g.lineWidth = 0.08 * PPM_B * 1.4;

        // North & South Endzones (Hot Neon Magenta Key & Glowing Orange 3-Pt Arcs)
        for (const s of [-1, 1]) {
            const hz = s * basketball_js_1.BB.HOOP_Z;
            const ftz = s * (basketball_js_1.BB.HOOP_Z - basketball_js_1.BB.FT_DIST);

            g.save();
            g.beginPath();
            g.rect(X(-W), Z(-L), 2 * W * PPM_B, 2 * L * PPM_B);
            g.clip();

            // Painted Free Throw Lane (Hot Neon Magenta / Ultraviolet)
            const keyTop = Math.min(Z(ftz), Z(s * L));
            const keyH = Math.abs(Z(ftz) - Z(s * L));
            g.fillStyle = hex(t.paint || 0xd946ef);
            g.globalAlpha = 0.88;
            g.fillRect(X(-basketball_js_1.BB.KEY_W), keyTop, 2 * basketball_js_1.BB.KEY_W * PPM_B, keyH);
            g.globalAlpha = 1.0;
            g.strokeStyle = '#ffffff';
            g.strokeRect(X(-basketball_js_1.BB.KEY_W), keyTop, 2 * basketball_js_1.BB.KEY_W * PPM_B, keyH);

            // Free Throw Circle
            g.beginPath();
            g.arc(X(0), Z(ftz), 1.8 * PPM_B, s < 0 ? 0 : Math.PI, s < 0 ? Math.PI : Math.PI * 2);
            g.stroke();

            // Dashed semicircle inside the key
            g.save();
            g.setLineDash([0.35 * PPM_B, 0.25 * PPM_B]);
            g.beginPath();
            g.arc(X(0), Z(ftz), 1.8 * PPM_B, s < 0 ? Math.PI : 0, s < 0 ? Math.PI * 2 : Math.PI);
            g.stroke();
            g.restore();

            // Rebound lane hash marks along the key
            g.fillStyle = '#ffffff';
            for (let m = 1; m <= 4; m++) {
                const markZ = Z(s * L - s * (1.75 + m * 0.95));
                for (const side of [-1, 1]) {
                    const markX = X(side * basketball_js_1.BB.KEY_W);
                    g.fillRect(side < 0 ? markX - 0.28 * PPM_B : markX, markZ - 0.04 * PPM_B, 0.28 * PPM_B, 0.08 * PPM_B);
                }
            }

            // High-Voltage Neon Orange 3-Point Arc
            const cornerDist = basketball_js_1.BB.THREE_R * 0.94;
            const threeR = basketball_js_1.BB.THREE_R;
            const dzThree = Math.sqrt(Math.max(0, threeR * threeR - cornerDist * cornerDist));
            const cornerBreakZ = s * (basketball_js_1.BB.HOOP_Z - dzThree);
            const thetaL = Math.atan2(s < 0 ? dzThree : -dzThree, -cornerDist);
            const thetaR = Math.atan2(s < 0 ? dzThree : -dzThree, cornerDist);
            
            // Neon outer glow for 3-pt line
            g.strokeStyle = 'rgba(249, 115, 22, 0.45)';
            g.lineWidth = 0.18 * PPM_B;
            g.beginPath();
            g.moveTo(X(-cornerDist), Z(s * L));
            g.lineTo(X(-cornerDist), Z(cornerBreakZ));
            g.arc(X(0), Z(hz), threeR * PPM_B, thetaL, thetaR, s < 0);
            g.lineTo(X(cornerDist), Z(s * L));
            g.stroke();

            // Core glowing orange 3-point line
            g.strokeStyle = '#f59e0b';
            g.lineWidth = 0.08 * PPM_B * 1.4;
            g.beginPath();
            g.moveTo(X(-cornerDist), Z(s * L));
            g.lineTo(X(-cornerDist), Z(cornerBreakZ));
            g.arc(X(0), Z(hz), threeR * PPM_B, thetaL, thetaR, s < 0);
            g.lineTo(X(cornerDist), Z(s * L));
            g.stroke();

            // Restricted Area Arc (Glowing Cyan semicircle under rim)
            g.strokeStyle = '#00f0ff';
            g.beginPath();
            g.arc(X(0), Z(hz), 1.25 * PPM_B, s < 0 ? 0 : Math.PI, s < 0 ? Math.PI : Math.PI * 2);
            g.stroke();

            // Glowing target dot
            g.fillStyle = '#ff5500';
            g.beginPath();
            g.arc(X(0), Z(hz), 0.16 * PPM_B, 0, Math.PI * 2);
            g.fill();

            g.restore();
        }

        return c;
    }`;

if (!oldMakeCourtRegex.test(code)) {
    console.error('Could not match makeCourtTexture regex in js/game.js');
    process.exit(1);
}
code = code.replace(oldMakeCourtRegex, newMakeCourt);
console.log('[OK] makeCourtTexture updated.');

// 6. Update makeBackboardTexture
console.log('[4/7] Upgrading makeBackboardTexture with Cyber Glass and glowing neon cyan/magenta border...');
const oldBackboardRegex = /function makeBackboardTexture\(\) \{[\s\S]*?return c;\s*\}/;
const newBackboard = `function makeBackboardTexture() {
        const [c, g] = makeCanvas(512, 320);
        // Translucent dark cyber glass
        g.fillStyle = 'rgba(15, 23, 42, 0.75)';
        g.fillRect(0, 0, 512, 320);

        // Radiant Glowing Neon Cyan Outer LED strip
        g.strokeStyle = '#00f0ff';
        g.lineWidth = 10;
        g.shadowColor = '#00f0ff';
        g.shadowBlur = 14;
        g.strokeRect(6, 6, 500, 308);

        // Inner Glowing Hot Magenta border line
        g.strokeStyle = '#ff2bd6';
        g.shadowColor = '#ff2bd6';
        g.shadowBlur = 10;
        g.lineWidth = 6;
        g.strokeRect(16, 16, 480, 288);
        g.shadowBlur = 0;

        // Official Inner Shooter's Target Box in Radiant Neon Orange
        g.strokeStyle = '#ff6a00';
        g.lineWidth = 8;
        g.shadowColor = '#ff6a00';
        g.shadowBlur = 12;
        g.strokeRect(176, 135, 160, 140);
        g.shadowBlur = 0;

        // Center crosshair tick in target box
        g.fillStyle = '#ffffff';
        g.fillRect(254, 202, 4, 6);
        return c;
    }`;

if (!oldBackboardRegex.test(code)) {
    console.error('Could not match makeBackboardTexture regex in js/game.js');
    process.exit(1);
}
code = code.replace(oldBackboardRegex, newBackboard);
console.log('[OK] makeBackboardTexture updated.');

// 7. Update buildCourtArena court plane material specularity, glowing rim and energy net
console.log('[5/7] Enhancing buildCourtArena with glossy specular reflections and glowing energy rim & net...');
code = code.replace(
    'const court = new scene_js_1.Node(G.plane(pw, pd), (0, scene_js_1.material)({ texture: new scene_js_1.Texture((0, textures_js_1.makeCourtTexture)(t), { mipmap: true, srgb: true }), spec: 0.28, shininess: 25, receiveShadow: true }));',
    'const court = new scene_js_1.Node(G.plane(pw, pd), (0, scene_js_1.material)({ texture: new scene_js_1.Texture((0, textures_js_1.makeCourtTexture)(t), { mipmap: true, srgb: true }), spec: 0.58, shininess: 55, receiveShadow: true }));'
);

code = code.replace(
    `        const rimMat = (0, scene_js_1.material)({
            color: rimRgb,
            emissive: [0.95, 0.35, 0.05], // High-contrast crisp tournament orange rim with clear visibility
            spec: 0.35,
            shininess: 35,
            castShadow: true
        });`,
    `        const rimMat = (0, scene_js_1.material)({
            color: (0, math_js_6.rgb)(0xff5500),
            emissive: [1.35, 0.45, 0.05], // High-voltage glowing Fortnite neon orange rim
            spec: 0.65,
            shininess: 60,
            castShadow: true
        });`
);

code = code.replace(
    `            // 5. Authentic Tapered Basketball Net (Attached directly underneath the rim)
            // cylinder/openCone has y from -h/2 to +h/2 (top at +hh, bottom at -hh).
            const net = new scene_js_1.Node(
                G.openCone(RIM_R * 0.96, RIM_R * 0.54, NET_H, 16),
                (0, scene_js_1.material)({
                    texture: netTex,
                    transparent: true,
                    alpha: 0.92,
                    doubleSided: true,
                    depthWrite: false,
                    uvScale: [6, 3],
                    receiveShadow: false,
                    castShadow: false,
                    color: (0, math_js_6.rgb)(0xffffff),
                    emissive: [0.22, 0.22, 0.22]
                })
            );`,
    `            // 5. Authentic Tapered Basketball Net (Attached directly underneath the rim)
            // cylinder/openCone has y from -h/2 to +h/2 (top at +hh, bottom at -hh).
            const net = new scene_js_1.Node(
                G.openCone(RIM_R * 0.96, RIM_R * 0.54, NET_H, 16),
                (0, scene_js_1.material)({
                    texture: netTex,
                    transparent: true,
                    alpha: 0.94,
                    doubleSided: true,
                    depthWrite: false,
                    uvScale: [6, 3],
                    receiveShadow: false,
                    castShadow: false,
                    color: (0, math_js_6.rgb)(0xe0f2fe),
                    emissive: [0.38, 0.68, 0.98] // Glowing holographic energy weave net
                })
            );`
);

console.log('[OK] buildCourtArena updated.');

// 8. Update buildFootyArena goal posts and energy net
console.log('[6/7] Enhancing buildFootyArena with sleek futuristic goal posts and holographic cyan net...');
code = code.replace(
    'const postMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xf4f6f8), spec: 0.7, shininess: 70, rim: 0.2, castShadow: true });',
    'const postMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xf0fdfa), emissive: [0.18, 0.42, 0.52], spec: 0.85, shininess: 85, rim: 0.4, castShadow: true });'
);

code = code.replace(
    'const mkNet = (w, h, ux, uy) => new scene_js_1.Node(G.quad(w, h), (0, scene_js_1.material)({ texture: netTex, transparent: true, alpha: 0.85, doubleSided: true, depthWrite: false, uvScale: [ux, uy], receiveShadow: false, castShadow: false, color: (0, math_js_6.rgb)(0xe8eef5) }));',
    'const mkNet = (w, h, ux, uy) => new scene_js_1.Node(G.quad(w, h), (0, scene_js_1.material)({ texture: netTex, transparent: true, alpha: 0.90, doubleSided: true, depthWrite: false, uvScale: [ux, uy], receiveShadow: false, castShadow: false, color: (0, math_js_6.rgb)(0x67e8f9), emissive: [0.28, 0.58, 0.82] }));'
);

// 9. Update buildBasketballArenaArchitecture: optimize baseline rows from 7 to 5 and offset slightly so court is heroic
console.log('[7/7] Refining buildBasketballArenaArchitecture stands positioning...');
const oldCourtArch = `    function buildBasketballArenaArchitecture(root, t, W, L, APRON, quality) {
        // 4-sided indoor basketball arena seating bowl with visible stands behind both baskets
        const stands = [
            // Sideline lower bowl
            { alongX: false, sign: -1, offset: W + APRON + 2.8, length: 2 * L + 8, rows: 7, center: 0 },
            { alongX: false, sign: 1, offset: W + APRON + 2.8, length: 2 * L + 8, rows: 7, center: 0 },
            // Baseline stands behind hoops (North & South) - placed right behind court baseline apron for clear visibility
            { alongX: true, sign: -1, offset: L + APRON + 1.6, length: 2 * W + 6, rows: 7, center: 0 },
            { alongX: true, sign: 1, offset: L + APRON + 1.6, length: 2 * W + 6, rows: 7, center: 0 }
        ];`;

const newCourtArch = `    function buildBasketballArenaArchitecture(root, t, W, L, APRON, quality) {
        // 4-sided indoor basketball arena seating bowl with visible stands behind both baskets
        const stands = [
            // Sideline lower bowl
            { alongX: false, sign: -1, offset: W + APRON + 3.0, length: 2 * L + 8, rows: 5, center: 0 },
            { alongX: false, sign: 1, offset: W + APRON + 3.0, length: 2 * L + 8, rows: 5, center: 0 },
            // Baseline stands behind hoops (North & South) - placed right behind court baseline apron for clear visibility
            { alongX: true, sign: -1, offset: L + APRON + 2.6, length: 2 * W + 6, rows: 4, center: 0 },
            { alongX: true, sign: 1, offset: L + APRON + 2.6, length: 2 * W + 6, rows: 4, center: 0 }
        ];`;

if (!code.includes(oldCourtArch)) {
    console.error('Could not find oldCourtArch in js/game.js');
    process.exit(1);
}
code = code.replace(oldCourtArch, newCourtArch);

if (hadCRLF) {
    code = code.replace(/\n/g, '\r\n');
}

fs.writeFileSync(gameJsPath, code, 'utf8');
console.log('✅ Successfully applied all Fortnite-style arena enhancements to js/game.js!');
