const fs = require('fs');
const path = require('path');

const files = [
  'js/game.js',
  'C:/Users/ASUS/Desktop/FOOTY vs HOOPS/js/game.js'
];

console.log('=== Applying Flawless Athletes & Arenas Overhaul ===');

files.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  console.log('Processing:', filePath);
  let code = fs.readFileSync(filePath, 'utf8');

  // 1. Fix COURT_BASE paint: replace 0xd946ef (magenta) with 0x0f172a (midnight navy)
  code = code.replace(
    /paint:\s*0xd946ef,\s*centerPaint:\s*0x06b6d4,/,
    'paint: 0x0f172a, centerPaint: 0x0f172a,'
  );

  // 2. Add Jersey Texture Generator in render/textures
  const textureAnchor = 'function drawOfficialCenterEmblem(g, cx, cy, radius, isBasketball) {';
  const jerseyTextureFuncs = `    const jerseyTexCache = new Map();
    function getJerseyTexture(sport, squadNum, isBack, primaryColor, secondaryColor, accentColor) {
        const cacheKey = sport + '_' + squadNum + '_' + (isBack ? 'back' : 'front') + '_' + primaryColor + '_' + secondaryColor;
        if (jerseyTexCache.has(cacheKey)) return jerseyTexCache.get(cacheKey);

        const [c, g] = makeCanvas(512, 512);
        const isFooty = (sport === 'footy');
        const isHoops = (sport === 'hoops');
        const isKeeper = (sport === 'keeper');

        // Base Jersey Color
        const pCol = hex(primaryColor);
        const sCol = hex(secondaryColor);
        const aCol = hex(accentColor);

        // Gradient & Mesh Fabric Texture
        const grad = g.createLinearGradient(0, 0, 0, 512);
        if (isFooty) {
            grad.addColorStop(0, '#00d2f0');
            grad.addColorStop(0.5, '#00b4d8');
            grad.addColorStop(1, '#0077b6');
        } else if (isHoops) {
            grad.addColorStop(0, '#1c1e24');
            grad.addColorStop(0.5, '#111318');
            grad.addColorStop(1, '#0b0c10');
        } else {
            grad.addColorStop(0, '#10b981');
            grad.addColorStop(0.5, '#059669');
            grad.addColorStop(1, '#047857');
        }
        g.fillStyle = grad;
        g.fillRect(0, 0, 512, 512);

        // Subtle fabric mesh perforation grid
        g.fillStyle = 'rgba(0, 0, 0, 0.06)';
        for (let y = 8; y < 512; y += 12) {
            for (let x = (y % 24 === 0 ? 6 : 0); x < 512; x += 12) {
                g.fillRect(x, y, 2.5, 2.5);
            }
        }

        if (isFooty) {
            // White raglan shoulder curves
            g.fillStyle = '#ffffff';
            g.beginPath();
            g.moveTo(0, 0);
            g.quadraticCurveTo(120, 40, 160, 0);
            g.lineTo(0, 0);
            g.fill();

            g.beginPath();
            g.moveTo(512, 0);
            g.quadraticCurveTo(392, 40, 352, 0);
            g.lineTo(512, 0);
            g.fill();

            // Navy V-neck collar trim at top
            g.fillStyle = '#0f172a';
            g.beginPath();
            g.moveTo(210, 0);
            g.lineTo(256, 75);
            g.lineTo(302, 0);
            g.closePath();
            g.fill();
        } else if (isHoops) {
            // Metallic Gold collar trim
            g.fillStyle = '#f59e0b';
            g.fillRect(180, 0, 152, 28);
            g.fillStyle = '#facc15';
            g.fillRect(180, 24, 152, 6);

            // Gold armhole trims
            g.fillStyle = '#f59e0b';
            g.fillRect(0, 0, 22, 512);
            g.fillRect(490, 0, 22, 512);
            g.fillStyle = '#facc15';
            g.fillRect(20, 0, 6, 512);
            g.fillRect(486, 0, 6, 512);
        }

        // Official Emblem & Typography
        const emb = getOfficialEmblem();

        if (isBack) {
            // --- BACK OF JERSEY ---
            // Wordmark arched across shoulder blades
            g.save();
            g.textAlign = 'center';
            g.textBaseline = 'middle';
            g.font = '900 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

            if (isFooty) {
                g.fillStyle = '#0f172a';
                g.fillText('FOOTY', 256 + 2, 90 + 3);
                g.fillStyle = '#ffffff';
                g.fillText('FOOTY', 256, 90);
            } else if (isHoops) {
                g.fillStyle = '#0a0a0a';
                g.fillText('HOOPS', 256 + 2, 90 + 3);
                g.fillStyle = '#f59e0b';
                g.fillText('HOOPS', 256, 90);
            }

            // Big Bold Squad Number
            g.font = '900 210px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            if (isFooty) {
                // Navy drop shadow
                g.fillStyle = '#0f172a';
                g.fillText(squadNum, 256 + 6, 305 + 6);
                // Crisp white number
                g.fillStyle = '#ffffff';
                g.fillText(squadNum, 256, 305);
            } else if (isHoops) {
                // Dark shadow
                g.fillStyle = '#000000';
                g.fillText(squadNum, 256 + 6, 305 + 6);
                // Metallic gold gradient fill
                const goldGrad = g.createLinearGradient(0, 190, 0, 410);
                goldGrad.addColorStop(0, '#fef08a');
                goldGrad.addColorStop(0.5, '#f59e0b');
                goldGrad.addColorStop(1, '#d97706');
                g.fillStyle = goldGrad;
                g.fillText(squadNum, 256, 305);
                g.strokeStyle = '#fef08a';
                g.lineWidth = 4;
                g.strokeText(squadNum, 256, 305);
            } else {
                g.fillStyle = '#064e3b';
                g.fillText(squadNum, 256 + 6, 305 + 6);
                g.fillStyle = '#ffffff';
                g.fillText(squadNum, 256, 305);
            }
            g.restore();

        } else {
            // --- FRONT OF JERSEY ---
            // 1. Official Emblem on Left Chest
            if (emb && emb.complete && emb.naturalWidth > 0) {
                g.save();
                const ex = 120, ey = 140, er = 54;
                g.beginPath();
                g.arc(ex, ey, er + 4, 0, Math.PI * 2);
                g.fillStyle = '#0a0f1a';
                g.fill();
                g.strokeStyle = isHoops ? '#f59e0b' : '#00f0ff';
                g.lineWidth = 4;
                g.stroke();
                g.drawImage(emb, ex - er, ey - er, er * 2, er * 2);
                g.restore();
            }

            // 2. Wordmark across chest
            g.save();
            g.textAlign = 'center';
            g.textBaseline = 'middle';
            g.font = '900 64px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

            if (isFooty) {
                g.fillStyle = '#0f172a';
                g.fillText('FOOTY', 256 + 3, 230 + 3);
                g.fillStyle = '#ffffff';
                g.fillText('FOOTY', 256, 230);

                // Squad number on front chest
                g.font = '900 125px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                g.fillStyle = '#0f172a';
                g.fillText(squadNum, 256 + 4, 355 + 4);
                g.fillStyle = '#ffffff';
                g.fillText(squadNum, 256, 355);
            } else if (isHoops) {
                g.fillStyle = '#000000';
                g.fillText('HOOPS', 256 + 3, 220 + 3);
                const goldGrad = g.createLinearGradient(0, 180, 0, 260);
                goldGrad.addColorStop(0, '#fef08a');
                goldGrad.addColorStop(0.5, '#f59e0b');
                goldGrad.addColorStop(1, '#d97706');
                g.fillStyle = goldGrad;
                g.fillText('HOOPS', 256, 220);

                // Squad number 23 on front chest
                g.font = '900 135px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                g.fillStyle = '#000000';
                g.fillText(squadNum, 256 + 4, 355 + 4);
                g.fillStyle = goldGrad;
                g.fillText(squadNum, 256, 355);
                g.strokeStyle = '#fef08a';
                g.lineWidth = 3;
                g.strokeText(squadNum, 256, 355);
            } else {
                g.font = '900 140px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                g.fillStyle = '#064e3b';
                g.fillText(squadNum, 256 + 4, 340 + 4);
                g.fillStyle = '#ffffff';
                g.fillText(squadNum, 256, 340);
            }
            g.restore();
        }

        const tex = new scene_js_2.Texture(c);
        jerseyTexCache.set(cacheKey, tex);
        return tex;
    }
    exports.getJerseyTexture = getJerseyTexture;

`;

  if (code.includes(textureAnchor) && !code.includes('getJerseyTexture')) {
    code = code.replace(textureAnchor, jerseyTextureFuncs + '\n' + textureAnchor);
    console.log('✓ Injected getJerseyTexture into render/textures in', filePath);
  }

  // 3. Replace wooden peg crowd in crowdAndStands
  const oldCrowdNodes = `        // Polished, curved stadium crowd geometry (Smooth athletic torsos, rounded arms, natural caps)
        const supporterTorso = G.cylinder(0.36, 0.44, 1.0, 8, true);
        const supporterArm = G.capsule(0.16, 0.82, 6, 2);
        const supporterHead = G.sphere(0.5, 10, 8);
        const supporterCap = G.sphere(0.54, 10, 8);
        const supporterSeat = G.box(0.92, 0.22, 0.88);
        const crowd = new scene_js_1.Node();
        for (const n of [mkBatch(S, supporterSeat, 0, false), mkBatch(B, supporterTorso), mkBatch(H, supporterHead), mkBatch(R, supporterCap), mkBatch(A, supporterArm, 1)])
            if (n)
                crowd.add(n);`;

  const newCrowdNodes = `        // Modern Tiered Stadium Architecture with LED ribbons (Zero wooden peg dolls!)
        const supporterSeat = G.box(0.92, 0.22, 0.88);
        const supporterLightstick = G.cylinder(0.06, 0.06, 0.75, 6);
        const crowd = new scene_js_1.Node();
        for (const n of [mkBatch(S, supporterSeat, 0, false), mkBatch(A, supporterLightstick, 1)])
            if (n)
                crowd.add(n);`;

  const normCode = code.replace(/\r\n/g, '\n');
  const normOldCrowd = oldCrowdNodes.replace(/\r\n/g, '\n');
  const normNewCrowd = newCrowdNodes.replace(/\r\n/g, '\n');

  if (normCode.includes(normOldCrowd)) {
    code = normCode.replace(normOldCrowd, normNewCrowd);
    console.log('✓ Replaced wooden peg crowd with modern stadium seating in', filePath);
  }

  fs.writeFileSync(filePath, code, 'utf8');
  console.log('✓ Saved updates to', filePath);
});
