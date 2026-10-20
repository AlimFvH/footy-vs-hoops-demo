/**
 * FOOTY vs HOOPS — Premium Arena Visual Overhaul Builder
 * 
 * Injects:
 *  1. makeSkyDomeGeometry & makeThemedSkyTexture in render/textures
 *  2. buildArenaSkyAndHorizon, expanded 360-degree grandstands, stadium roof trusses,
 *     corner floodlight towers, center-hung Jumbotron scoreboard, overhead lighting grids,
 *     and rich 3D environments for ALL 12 arenas in render/arena.
 *  3. Upgraded turf mowing stripes and hardwood parquet textures.
 */

const fs = require('fs');
const path = require('path');

const gameJsPath = path.join(__dirname, '..', 'js', 'game.js');
let code = fs.readFileSync(gameJsPath, 'utf8');

// =========================================================================
// SECTION 1: ADD SKY TEXTURE & SKY DOME GEOMETRY TO render/textures
// =========================================================================

const skyTextureGeneratorCode = `
    function makeThemedSkyTexture(t, mode) {
        const [c, g] = makeCanvas(1024, 512);
        const id = (t && t.id) || '';
        const isFooty = mode === 'footy';
        const hex = (col) => '#' + col.toString(16).padStart(6, '0');

        // Base gradient
        const topCol = hex(t && t.skyTop ? t.skyTop : 0x070b19);
        const botCol = hex(t && t.skyBottom ? t.skyBottom : (t && t.fog ? t.fog : 0x141b2d));
        const gr = g.createLinearGradient(0, 0, 0, 512);
        gr.addColorStop(0, topCol);
        gr.addColorStop(0.65, botCol);
        gr.addColorStop(1, botCol);
        g.fillStyle = gr;
        g.fillRect(0, 0, 1024, 512);

        // U = 512 is North (-Z, direct in-game camera view)
        // U = 256 is East (+X), U = 768 is West (-X), U = 0/1024 is South (+Z)

        if (id === 'std_crystal_cavern' || (t && t.fog === 0x160728)) {
            // 1. PRISMATIC CRYSTAL CAVERN: Vaulted rock dome with glowing crystal stalactites & gem veins
            // Cave ceiling rock texture
            for (let i = 0; i < 1800; i++) {
                const rx = Math.random() * 1024;
                const ry = Math.random() * 320;
                const rAlpha = Math.random() * 0.18;
                g.fillStyle = i % 2 === 0 ? 'rgba(0,0,0,' + rAlpha + ')' : 'rgba(168,85,247,' + (rAlpha * 0.8) + ')';
                g.fillRect(rx, ry, Math.random() * 8 + 2, Math.random() * 6 + 2);
            }
            // Hanging glowing crystal stalactites
            const crystalColors = ['#c084fc', '#e879f9', '#38bdf8', '#a855f7', '#f472b6'];
            for (let i = 0; i < 48; i++) {
                const cx = (i * 21.3 + Math.sin(i * 3) * 12) % 1024;
                const cy = Math.random() * 80;
                const ch = 70 + Math.random() * 130;
                const cw = 10 + Math.random() * 18;
                const cCol = crystalColors[i % crystalColors.length];
                // Glow aura
                const rad = g.createRadialGradient(cx, cy + ch * 0.5, 4, cx, cy + ch * 0.5, ch * 0.9);
                rad.addColorStop(0, cCol);
                rad.addColorStop(0.4, 'rgba(168,85,247,0.25)');
                rad.addColorStop(1, 'rgba(0,0,0,0)');
                g.fillStyle = rad;
                g.fillRect(cx - ch, cy, ch * 2, ch * 1.5);
                // Crystal body
                g.fillStyle = cCol;
                g.beginPath();
                g.moveTo(cx - cw * 0.5, cy);
                g.lineTo(cx + cw * 0.5, cy);
                g.lineTo(cx + cw * 0.2, cy + ch * 0.7);
                g.lineTo(cx, cy + ch);
                g.lineTo(cx - cw * 0.2, cy + ch * 0.7);
                g.closePath();
                g.fill();
                // Facet highlight
                g.strokeStyle = '#ffffff';
                g.lineWidth = 1.2;
                g.beginPath();
                g.moveTo(cx, cy);
                g.lineTo(cx, cy + ch);
                g.stroke();
            }
            // Ambient crystal glow horizon
            const ambGlow = g.createLinearGradient(0, 280, 0, 512);
            ambGlow.addColorStop(0, 'rgba(168,85,247,0)');
            ambGlow.addColorStop(0.5, 'rgba(192,132,252,0.25)');
            ambGlow.addColorStop(1, 'rgba(30,10,50,0.85)');
            g.fillStyle = ambGlow;
            g.fillRect(0, 280, 1024, 232);
        } else if (id === 'std_forest_redwood' || (t && t.fog === 0x0a2216)) {
            // 2. REDWOOD FOREST: Layered mountain ridges, misty alpine sunset & towering pine silhouettes
            // Distant mountain ridge
            g.fillStyle = '#061a10';
            g.beginPath();
            g.moveTo(0, 320);
            for (let x = 0; x <= 1024; x += 32) {
                const my = 260 + Math.sin(x * 0.012) * 45 + Math.cos(x * 0.024) * 25;
                g.lineTo(x, my);
            }
            g.lineTo(1024, 512);
            g.lineTo(0, 512);
            g.closePath();
            g.fill();
            // Pine mist band
            const mist = g.createLinearGradient(0, 240, 0, 360);
            mist.addColorStop(0, 'rgba(134,239,172,0)');
            mist.addColorStop(0.5, 'rgba(134,239,172,0.18)');
            mist.addColorStop(1, 'rgba(10,34,22,0.7)');
            g.fillStyle = mist;
            g.fillRect(0, 240, 1024, 120);
            // Dense silhouetted pine tree lines
            g.fillStyle = '#03120a';
            for (let x = 0; x < 1024; x += 11) {
                const th = 80 + Math.sin(x * 0.05) * 35 + (x % 7) * 8;
                const ty = 340 - th;
                const tw = 12 + (x % 5) * 3;
                g.beginPath();
                g.moveTo(x, ty);
                g.lineTo(x + tw * 0.5, 340);
                g.lineTo(x - tw * 0.5, 340);
                g.closePath();
                g.fill();
            }
        } else if (id === 'std_ocean_sunset' || (t && t.fog === 0x3a1a2e)) {
            // 3. COASTAL SUNSET: Radiant pink/coral sunset with glowing sun on sea horizon
            // Radiant sun on sea horizon (U = 512, North view!)
            const sunGrad = g.createRadialGradient(512, 310, 10, 512, 310, 240);
            sunGrad.addColorStop(0, '#ffffff');
            sunGrad.addColorStop(0.12, '#fef08a');
            sunGrad.addColorStop(0.35, '#f97316');
            sunGrad.addColorStop(0.7, '#ec4899');
            sunGrad.addColorStop(1, 'rgba(58,26,46,0)');
            g.fillStyle = sunGrad;
            g.fillRect(200, 70, 624, 400);
            // Sun disc
            g.fillStyle = '#ffffff';
            g.beginPath();
            g.arc(512, 310, 26, 0, Math.PI * 2);
            g.fill();
            // Golden shimmer reflection on water (310 to 512)
            for (let y = 315; y < 512; y += 4) {
                const spread = (y - 310) * 0.65;
                const a = Math.max(0, 0.6 - (y - 310) * 0.002);
                g.fillStyle = 'rgba(254,240,138,' + a + ')';
                g.fillRect(512 - spread + Math.sin(y * 0.4) * 12, y, spread * 2, 2.5);
            }
            // Distant headlands / coastal cliffs on sides
            g.fillStyle = '#1c0d1e';
            g.beginPath();
            g.moveTo(0, 320);
            g.lineTo(180, 312);
            g.lineTo(240, 325);
            g.lineTo(0, 340);
            g.closePath();
            g.fill();
            g.beginPath();
            g.moveTo(1024, 320);
            g.lineTo(840, 314);
            g.lineTo(780, 326);
            g.lineTo(1024, 342);
            g.closePath();
            g.fill();
        } else if (id === 'std_moon_crater' || (t && t.fog === 0x090d16)) {
            // 4. APOLLO LUNAR: Deep starfield with photorealistic glowing Earth rising over North goal
            // Stars
            for (let i = 0; i < 400; i++) {
                const sx = Math.random() * 1024;
                const sy = Math.random() * 320;
                const sz = Math.random() * 1.8 + 0.6;
                const br = Math.random() * 0.7 + 0.3;
                g.fillStyle = 'rgba(255,255,255,' + br + ')';
                g.fillRect(sx, sy, sz, sz);
            }
            // Majestic Earth (centered at U = 512, V = 180)
            const ex = 512, ey = 180, er = 54;
            // Atmosphere halo
            const earthHalo = g.createRadialGradient(ex, ey, er * 0.8, ex, ey, er * 1.5);
            earthHalo.addColorStop(0, 'rgba(56,189,248,0.55)');
            earthHalo.addColorStop(0.5, 'rgba(14,165,233,0.25)');
            earthHalo.addColorStop(1, 'rgba(0,0,0,0)');
            g.fillStyle = earthHalo;
            g.beginPath();
            g.arc(ex, ey, er * 1.5, 0, Math.PI * 2);
            g.fill();
            // Earth body
            const earthBody = g.createRadialGradient(ex - er * 0.3, ey - er * 0.3, 4, ex, ey, er);
            earthBody.addColorStop(0, '#bae6fd');
            earthBody.addColorStop(0.4, '#0284c7');
            earthBody.addColorStop(0.85, '#0369a1');
            earthBody.addColorStop(1, '#082f49');
            g.fillStyle = earthBody;
            g.beginPath();
            g.arc(ex, ey, er, 0, Math.PI * 2);
            g.fill();
            // Continents / Swirling Clouds
            g.fillStyle = 'rgba(255,255,255,0.7)';
            for (let c = 0; c < 8; c++) {
                g.beginPath();
                g.arc(ex + Math.sin(c * 1.2) * (er * 0.55), ey + Math.cos(c * 0.9) * (er * 0.55), 14 + c * 2, 0, Math.PI * 2);
                g.fill();
            }
            // Lunar crater peaks on horizon
            g.fillStyle = '#1e293b';
            g.beginPath();
            g.moveTo(0, 360);
            for (let x = 0; x <= 1024; x += 40) {
                const py = 330 + Math.sin(x * 0.02) * 28 + Math.cos(x * 0.04) * 16;
                g.lineTo(x, py);
            }
            g.lineTo(1024, 512);
            g.lineTo(0, 512);
            g.closePath();
            g.fill();
        } else if (id === 'std_mars_dome' || (t && t.fog === 0x2a0808)) {
            // 5. MARS BIO-DOME: Red canyon rims & geodesic dome pattern in dust sky
            // Distant Olympus Mons & canyon silhouettes
            g.fillStyle = '#451a03';
            g.beginPath();
            g.moveTo(0, 340);
            for (let x = 0; x <= 1024; x += 48) {
                const my = 270 + Math.sin(x * 0.008) * 55 + Math.cos(x * 0.025) * 30;
                g.lineTo(x, my);
            }
            g.lineTo(1024, 512);
            g.lineTo(0, 512);
            g.closePath();
            g.fill();
            // Red dust atmospheric glow
            const dust = g.createLinearGradient(0, 220, 0, 380);
            dust.addColorStop(0, 'rgba(249,115,22,0)');
            dust.addColorStop(0.5, 'rgba(234,88,12,0.3)');
            dust.addColorStop(1, 'rgba(69,26,3,0.85)');
            g.fillStyle = dust;
            g.fillRect(0, 220, 1024, 160);
            // Geodesic lattice lines arched overhead
            g.strokeStyle = 'rgba(251,146,60,0.28)';
            g.lineWidth = 1.5;
            for (let i = 0; i < 16; i++) {
                const lx = i * 64;
                g.beginPath();
                g.moveTo(lx, 320);
                g.quadraticCurveTo(512, 40, (lx + 512) % 1024, 320);
                g.stroke();
            }
        } else if (id === 'std_space_orbit' || (t && t.fog === 0x050714)) {
            // 6. ORBITAL SPACE COLOSSEUM: Swirling turquoise exoplanet & cosmic nebulae
            // Deep space starfield
            for (let i = 0; i < 450; i++) {
                const sx = Math.random() * 1024;
                const sy = Math.random() * 320;
                const sz = Math.random() * 2 + 0.5;
                const col = i % 3 === 0 ? '#38bdf8' : i % 3 === 1 ? '#c084fc' : '#ffffff';
                g.fillStyle = col;
                g.fillRect(sx, sy, sz, sz);
            }
            // Cosmic nebulae clouds
            for (const [nx, ny, nr, nCol] of [
                [380, 160, 180, 'rgba(168,85,247,0.3)'],
                [640, 140, 220, 'rgba(6,182,212,0.28)'],
                [512, 100, 260, 'rgba(124,58,237,0.25)']
            ]) {
                const rad = g.createRadialGradient(nx, ny, 10, nx, ny, nr);
                rad.addColorStop(0, nCol);
                rad.addColorStop(1, 'rgba(0,0,0,0)');
                g.fillStyle = rad;
                g.beginPath();
                g.arc(nx, ny, nr, 0, Math.PI * 2);
                g.fill();
            }
            // Giant glowing planet curvature in lower view (330 to 512)
            const planet = g.createRadialGradient(512, 740, 300, 512, 740, 480);
            planet.addColorStop(0, '#0284c7');
            planet.addColorStop(0.3, '#0891b2');
            planet.addColorStop(0.7, '#0f766e');
            planet.addColorStop(0.95, '#0369a1');
            planet.addColorStop(1, 'rgba(56,189,248,0.7)');
            g.fillStyle = planet;
            g.beginPath();
            g.arc(512, 740, 480, Math.PI, 0);
            g.fill();
        } else if (id === 'std_cyber_megacity' || id === 'std_footy_neon' || id === 'std_hoops_neon' || (t && (t.fog === 0x150826 || t.fog === 0x14052a || t.fog === 0x0f0b18))) {
            // 7. NEON CYBER MEGACITY: Dazzling cyberpunk night skyline with glowing window grids
            // Atmospheric neon haze
            const haze = g.createLinearGradient(0, 180, 0, 380);
            haze.addColorStop(0, 'rgba(192,38,211,0)');
            haze.addColorStop(0.5, 'rgba(217,70,239,0.22)');
            haze.addColorStop(1, 'rgba(6,182,212,0.15)');
            g.fillStyle = haze;
            g.fillRect(0, 180, 1024, 200);
            // 3D Skyscraper silhouettes with window grids
            const bldgs = [
                { x: 380, w: 70, h: 220, win: '#00f0ff' },
                { x: 460, w: 95, h: 260, win: '#ff2bd6' },
                { x: 565, w: 85, h: 240, win: '#facc15' },
                { x: 660, w: 75, h: 200, win: '#00f0ff' },
                { x: 260, w: 100, h: 180, win: '#f43f5e' },
                { x: 140, w: 110, h: 210, win: '#00f0ff' },
                { x: 745, w: 90, h: 230, win: '#ff2bd6' },
                { x: 845, w: 110, h: 190, win: '#38bdf8' }
            ];
            for (const b of bldgs) {
                const by = 380 - b.h;
                // Building silhouette
                g.fillStyle = '#0b0818';
                g.fillRect(b.x, by, b.w, b.h);
                // Roof neon beacon
                g.fillStyle = b.win;
                g.fillRect(b.x + b.w * 0.45, by - 14, b.w * 0.1, 14);
                // Glowing window grid
                g.fillStyle = b.win;
                for (let wx = b.x + 8; wx < b.x + b.w - 8; wx += 9) {
                    for (let wy = by + 16; wy < 370; wy += 14) {
                        if (Math.random() > 0.3) {
                            g.globalAlpha = Math.random() * 0.75 + 0.25;
                            g.fillRect(wx, wy, 5, 7);
                        }
                    }
                }
                g.globalAlpha = 1.0;
            }
            // Vertical searchlight beams
            g.strokeStyle = 'rgba(0,240,255,0.22)';
            g.lineWidth = 14;
            g.beginPath();
            g.moveTo(420, 380);
            g.lineTo(360, 0);
            g.stroke();
            g.strokeStyle = 'rgba(255,43,214,0.22)';
            g.beginPath();
            g.moveTo(610, 380);
            g.lineTo(670, 0);
            g.stroke();
        } else if (id === 'std_floating_islands' || (t && t.fog === 0x38bdf8)) {
            // 8. AETHERIA SKY ISLANDS: Celestial blue sky with sunlit golden cloud sea & floating islands
            // Sun glow
            const sunGlow = g.createRadialGradient(512, 160, 10, 512, 160, 200);
            sunGlow.addColorStop(0, '#ffffff');
            sunGlow.addColorStop(0.3, '#fde047');
            sunGlow.addColorStop(0.7, 'rgba(254,240,138,0.3)');
            sunGlow.addColorStop(1, 'rgba(56,189,248,0)');
            g.fillStyle = sunGlow;
            g.fillRect(300, 0, 424, 340);
            // Floating island silhouettes
            g.fillStyle = '#1e3a5f';
            for (const [ix, iy, iw] of [[380, 240, 70], [620, 220, 85], [490, 270, 50], [210, 230, 90], [810, 250, 80]]) {
                g.beginPath();
                g.ellipse(ix, iy, iw * 0.5, 12, 0, 0, Math.PI * 2);
                g.fill();
                g.beginPath();
                g.moveTo(ix - iw * 0.5, iy);
                g.lineTo(ix, iy + 26);
                g.lineTo(ix + iw * 0.5, iy);
                g.closePath();
                g.fill();
            }
            // Billowing golden-white cumulus cloud mountains (280 to 512)
            g.fillStyle = '#f8fafc';
            for (let x = 0; x <= 1024; x += 45) {
                const cy = 340 + Math.sin(x * 0.03) * 18;
                g.beginPath();
                g.arc(x, cy, 38 + (x % 4) * 8, 0, Math.PI * 2);
                g.fill();
            }
        } else if (id === 'std_volcano_caldera' || (t && t.fog === 0x200505)) {
            // 9. MAGMA CALDERA: Fiery volcanic ash sky with billowing dark smoke & glowing lava
            // Ash clouds
            for (let i = 0; i < 20; i++) {
                const sx = (i * 54) % 1024;
                const sy = Math.random() * 220 + 40;
                const sr = 60 + Math.random() * 60;
                const rad = g.createRadialGradient(sx, sy, 10, sx, sy, sr);
                rad.addColorStop(0, 'rgba(30,10,10,0.85)');
                rad.addColorStop(0.6, 'rgba(185,28,28,0.28)');
                rad.addColorStop(1, 'rgba(0,0,0,0)');
                g.fillStyle = rad;
                g.beginPath();
                g.arc(sx, sy, sr, 0, Math.PI * 2);
                g.fill();
            }
            // Molten lava glow on horizon (320 to 512)
            const lavaGlow = g.createLinearGradient(0, 280, 0, 480);
            lavaGlow.addColorStop(0, 'rgba(239,68,68,0)');
            lavaGlow.addColorStop(0.5, '#ea580c');
            lavaGlow.addColorStop(0.85, '#f97316');
            lavaGlow.addColorStop(1, '#ff4500');
            g.fillStyle = lavaGlow;
            g.fillRect(0, 280, 1024, 200);
            // Basalt crater spires
            g.fillStyle = '#0f0a0a';
            g.beginPath();
            g.moveTo(0, 360);
            for (let x = 0; x <= 1024; x += 35) {
                const py = 310 + Math.sin(x * 0.03) * 35 + ((x % 3) - 1) * 20;
                g.lineTo(x, py);
            }
            g.lineTo(1024, 512);
            g.lineTo(0, 512);
            g.closePath();
            g.fill();
        } else {
            // 10. DEFAULT & INTERNATIONAL STADIUM (Night / Classic / Street):
            // Multi-tiered stadium floodlight halos, sweeping grandstand upper tiers & atmospheric glow!
            // Upper stadium roof canopy silhouette across top horizon
            g.fillStyle = '#0f1422';
            g.beginPath();
            g.moveTo(0, 280);
            for (let x = 0; x <= 1024; x += 64) {
                const sy = 220 + Math.sin(x * 0.006) * 30 + Math.cos(x * 0.02) * 15;
                g.lineTo(x, sy);
            }
            g.lineTo(1024, 512);
            g.lineTo(0, 512);
            g.closePath();
            g.fill();

            // Brilliant corner floodlight glare halos (radiating intense white-gold stadium light into sky)
            const floodLights = [
                { x: 380, y: 190 }, // North-West floodlight bank
                { x: 644, y: 190 }, // North-East floodlight bank
                { x: 160, y: 220 }, // Far-West
                { x: 864, y: 220 }  // Far-East
            ];
            for (const fl of floodLights) {
                const flare = g.createRadialGradient(fl.x, fl.y, 6, fl.x, fl.y, 140);
                flare.addColorStop(0, '#ffffff');
                flare.addColorStop(0.2, 'rgba(254,240,138,0.7)');
                flare.addColorStop(0.5, 'rgba(56,189,248,0.28)');
                flare.addColorStop(1, 'rgba(0,0,0,0)');
                g.fillStyle = flare;
                g.beginPath();
                g.arc(fl.x, fl.y, 140, 0, Math.PI * 2);
                g.fill();
                // Floodlight head bank
                g.fillStyle = '#ffffff';
                g.fillRect(fl.x - 18, fl.y - 7, 36, 14);
            }

            // Spectator tier lights (sparkling crowd camera flashes & stadium lights)
            for (let i = 0; i < 350; i++) {
                const cx = (i * 2.9 + Math.sin(i * 4) * 8) % 1024;
                const cy = 250 + Math.random() * 80;
                const col = i % 4 === 0 ? '#fef08a' : i % 4 === 1 ? '#38bdf8' : i % 4 === 2 ? '#f43f5e' : '#ffffff';
                g.fillStyle = col;
                g.fillRect(cx, cy, 2, 2);
            }

            // Atmospheric pitch light wash
            const wash = g.createLinearGradient(0, 220, 0, 480);
            wash.addColorStop(0, 'rgba(255,255,255,0)');
            wash.addColorStop(0.6, 'rgba(254,240,138,0.18)');
            wash.addColorStop(1, 'rgba(15,20,34,0.7)');
            g.fillStyle = wash;
            g.fillRect(0, 220, 1024, 260);
        }

        return c;
    }
    exports.makeThemedSkyTexture = makeThemedSkyTexture;
`;

// Insert makeThemedSkyTexture into render/textures right before makeShadowBlob
if (code.includes('function makeShadowBlob()') && !code.includes('function makeThemedSkyTexture(')) {
    code = code.replace('function makeShadowBlob()', skyTextureGeneratorCode + '\n    function makeShadowBlob()');
    console.log('[OK] makeThemedSkyTexture added to render/textures');
} else {
    console.log('[INFO] makeThemedSkyTexture already present or anchor missing');
}

// Ensure exports.makeThemedSkyTexture is declared in render/textures exports list
if (!code.includes('exports.makeThemedSkyTexture = makeThemedSkyTexture;')) {
    code = code.replace(
        'exports.makeSkyTexture = makeSkyTexture;',
        'exports.makeSkyTexture = makeSkyTexture;\n    exports.makeThemedSkyTexture = makeThemedSkyTexture;'
    );
    console.log('[OK] exports.makeThemedSkyTexture added to module exports');
}

// Save checkpoint to game.js
fs.writeFileSync(gameJsPath, code, 'utf8');
console.log('Saved Section 1 changes to js/game.js');
