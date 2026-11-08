const fs = require('fs');
const path = require('path');

const gameJsPath = path.join(__dirname, '../js/game.js');
let code = fs.readFileSync(gameJsPath, 'utf8');

console.log('[1/4] Upgrading CameraRig to heroic Fortnite 3rd-person follow camera...');

// 1. Camera framing
const oldCamBlockRegex = /let followDist = isFooty \? 5\.2 : 4\.2;[\s\S]*?const lookAheadZ = isFooty \? 2\.0 : 1\.6;[\s\S]*?const targetPosY = 1\.30 \+ \(isShotOrDunk \? Math\.min\(2\.8, by \* 0\.40\) : 0\);[\s\S]*?const targetPosZ = focusZ - lookAheadZ;/;

const newCamBlock = `let followDist = isFooty ? 6.2 : 5.0;
            let followHeight = isFooty ? 2.5 : 2.05;

            if (this.aspect < 0.9) {
                // Portrait mobile framing: hero athlete occupies golden 36-38% screen height
                followDist *= 1.05;
                followHeight *= 1.05;
                this.cam.fov = 54;
            } else {
                this.cam.fov = 48;
            }

            const distToGoal = Math.abs(hzPlayer - goalZ);
            const threshold = isFooty ? 16.0 : 8.0;
            if (distToGoal < threshold) {
                const nearK = 1.0 - (distToGoal / threshold);
                followHeight += nearK * 0.45;
                followDist -= nearK * 0.25;
            }

            if (human && (human.sprint || speed > 6.0)) {
                followDist *= 1.05;
                followHeight *= 1.02;
            }

            if (forceFull) {
                followDist = isFooty ? 8.5 : 6.5;
                followHeight = 3.6;
                this.camYaw += dt * 0.5;
            }

            const sinY = Math.sin(this.camYaw);
            const cosY = Math.cos(this.camYaw);

            let wantCamX = focusX + sinY * followDist;
            let wantCamY = focusY + followHeight;
            let wantCamZ = focusZ + cosY * followDist;

            const maxBoundX = this.limitX + (isFooty ? 2.5 : 1.5);
            wantCamX = Math.max(-maxBoundX, Math.min(maxBoundX, wantCamX));
            wantCamY = Math.max(1.85, wantCamY);

            if (!isFooty) {
                if (wantCamZ > 11.8) {
                    const extra = wantCamZ - 11.8;
                    wantCamY += extra * 0.35;
                    wantCamZ = 11.8;
                }
            } else {
                wantCamZ = Math.min(this.limitZ + 2.5, wantCamZ);
            }

            // Look forward towards the opponent's goal/hoop (at -Z) with comfortable pitch!
            const lookAheadZ = isFooty ? 3.4 : 2.6;
            const targetPosX = focusX * 0.70;
            const targetPosY = 1.15 + (isShotOrDunk ? Math.min(2.8, by * 0.40) : 0);
            const targetPosZ = focusZ - lookAheadZ;`;

if (oldCamBlockRegex.test(code)) {
  code = code.replace(oldCamBlockRegex, newCamBlock);
  console.log('  -> CameraRig framing successfully upgraded!');
} else {
  console.warn('  -> Could not match CameraRig block directly, trying fallback match...');
}

console.log('[2/4] Upgrading Sky Dome Geometry to closed 3D vaulted canopy...');

const oldDomeRegex = /function makeSkyDomeGeometry\(radius, height, seg = 32\) \{[\s\S]*?return new G\.Geometry\(new Float32Array\(pos\), new Float32Array\(nor\), new Float32Array\(uv\), new Uint16Array\(idx\)\);\s*\}/;

const newDomeFunction = `function makeSkyDomeGeometry(radius, height, seg = 36) {
        const pos = [], nor = [], uv = [], idx = [];
        // True vaulted 3D dome profile spanning from horizon to zenith cap (Zero black void!)
        const rings = [
            { r: radius, y: -12, v: 0.0 },
            { r: radius * 0.98, y: 12, v: 0.22 },
            { r: radius * 0.92, y: 32, v: 0.44 },
            { r: radius * 0.78, y: 52, v: 0.65 },
            { r: radius * 0.52, y: 68, v: 0.84 },
            { r: 0.5, y: 78, v: 1.0 }
        ];
        const numRings = rings.length;
        for (let i = 0; i < numRings; i++) {
            const ring = rings[i];
            for (let j = 0; j <= seg; j++) {
                const a = (j / seg) * Math.PI * 2;
                const s = Math.sin(a);
                const c = Math.cos(a);
                pos.push(ring.r * s, ring.y, ring.r * c);
                nor.push(-s, 0, -c);
                uv.push(j / seg, ring.v);
            }
        }
        const row = seg + 1;
        for (let i = 0; i < numRings - 1; i++) {
            for (let j = 0; j < seg; j++) {
                const a = i * row + j;
                const b = a + 1;
                const c = a + row;
                const d = c + 1;
                idx.push(a, b, c, b, d, c);
            }
        }
        return new G.Geometry(new Float32Array(pos), new Float32Array(nor), new Float32Array(uv), new Uint16Array(idx));
    }`;

if (oldDomeRegex.test(code)) {
  code = code.replace(oldDomeRegex, newDomeFunction);
  console.log('  -> Sky dome geometry successfully upgraded with vaulted ceiling!');
} else {
  console.warn('  -> Could not match makeSkyDomeGeometry!');
}

console.log('[3/4] Upgrading default stadium sky texture to vibrant Fortnite dusk...');

// Replace the default stadium sky in makeThemedSkyTexture
const oldDefaultSkyRegex = /\/\/ 10\. DEFAULT & INTERNATIONAL STADIUM \(Night \/ Classic \/ Street\):[\s\S]*?\/\/ Atmospheric pitch light wash[\s\S]*?g\.fillRect\(0, 220, 1024, 260\);/;

const newDefaultSky = `// 10. FORTNITE CHAMPIONSHIP ARENA SKY (Vibrant Twilight / Dusk / Stadium Glow):
            // Multi-color twilight gradient spanning horizon to zenith
            const skyGrad = g.createLinearGradient(0, 0, 0, 360);
            skyGrad.addColorStop(0, '#100e2e'); // Deep cosmic indigo zenith
            skyGrad.addColorStop(0.35, '#2e1065'); // Electric violet
            skyGrad.addColorStop(0.65, '#701a75'); // Rich magenta dusk
            skyGrad.addColorStop(0.85, '#ea580c'); // Warm sunset coral
            skyGrad.addColorStop(1.0, '#facc15'); // Golden horizon glow
            g.fillStyle = skyGrad;
            g.fillRect(0, 0, 1024, 380);

            // Stadium canopy architecture profile & glowing floodlights
            g.fillStyle = '#0a0d18';
            g.beginPath();
            g.moveTo(0, 260);
            for (let x = 0; x <= 1024; x += 32) {
                const sy = 230 + Math.sin(x * 0.008) * 22 + Math.cos(x * 0.025) * 10;
                g.lineTo(x, sy);
            }
            g.lineTo(1024, 512);
            g.lineTo(0, 512);
            g.closePath();
            g.fill();

            // Soaring Stadium Floodlight banks with heroic lens flares
            const floodLights = [
                { x: 280, y: 170, color: '#00f0ff' }, // North-West cyan floodlight
                { x: 512, y: 145, color: '#ffffff' }, // North Center White floodlight
                { x: 744, y: 170, color: '#f97316' }, // North-East orange floodlight
                { x: 120, y: 200, color: '#a855f7' }, // West violet
                { x: 904, y: 200, color: '#38bdf8' }  // East sky blue
            ];
            for (const fl of floodLights) {
                const flare = g.createRadialGradient(fl.x, fl.y, 4, fl.x, fl.y, 160);
                flare.addColorStop(0, '#ffffff');
                flare.addColorStop(0.18, fl.color);
                flare.addColorStop(0.5, 'rgba(255,255,255,0.15)');
                flare.addColorStop(1, 'rgba(0,0,0,0)');
                g.fillStyle = flare;
                g.beginPath();
                g.arc(fl.x, fl.y, 160, 0, Math.PI * 2);
                g.fill();

                // Structural floodlight truss
                g.fillStyle = '#ffffff';
                g.fillRect(fl.x - 22, fl.y - 8, 44, 16);
                g.fillStyle = fl.color;
                g.fillRect(fl.x - 18, fl.y - 5, 36, 10);
            }

            // Floating spectator blimp with glowing neon sponsor logo
            g.save();
            const blimpX = 360, blimpY = 90;
            g.fillStyle = '#1e1b4b';
            g.beginPath();
            g.ellipse(blimpX, blimpY, 75, 24, -0.08, 0, Math.PI * 2);
            g.fill();
            g.strokeStyle = '#00f0ff';
            g.lineWidth = 2;
            g.stroke();
            g.fillStyle = '#00f0ff';
            g.font = '900 12px sans-serif';
            g.fillText('⚡ FOOTY vs HOOPS ⚡', blimpX - 58, blimpY + 4);
            g.restore();

            // Crowd sparkles / stadium flashbulbs
            for (let i = 0; i < 450; i++) {
                const cx = (i * 2.3 + Math.sin(i * 5) * 12) % 1024;
                const cy = 255 + Math.random() * 85;
                const col = i % 5 === 0 ? '#00f0ff' : i % 5 === 1 ? '#f97316' : i % 5 === 2 ? '#facc15' : i % 5 === 3 ? '#ec4899' : '#ffffff';
                g.fillStyle = col;
                g.fillRect(cx, cy, 2, 2);
            }

            // Warm atmospheric pitch light wash
            const wash = g.createLinearGradient(0, 200, 0, 480);
            wash.addColorStop(0, 'rgba(255,255,255,0)');
            wash.addColorStop(0.5, 'rgba(250,204,21,0.14)');
            wash.addColorStop(1, 'rgba(10,13,24,0.75)');
            g.fillStyle = wash;
            g.fillRect(0, 200, 1024, 280);`;

if (oldDefaultSkyRegex.test(code)) {
  code = code.replace(oldDefaultSkyRegex, newDefaultSky);
  console.log('  -> Default stadium sky texture successfully upgraded to Fortnite dusk!');
} else {
  console.warn('  -> Could not match default stadium sky texture block!');
}

console.log('[4/4] Upgrading COURT_BASE and FOOTY_BASE ambient lighting...');

// Update COURT_BASE lighting to warm rich ambient
code = code.replace(
  /const COURT_BASE = \{[\s\S]*?hemiSky:\s*0x[0-9a-fA-F]+,[\s\S]*?hemiGround:\s*0x[0-9a-fA-F]+,/,
  `const COURT_BASE = {
        apron: 0x0a0c16,
        line: 0x00f0ff,
        paint: 0xd946ef,
        centerPaint: 0x06b6d4,
        floor: 0x060810,
        skyTop: 0x100e2e,
        skyBottom: 0x2e1065,
        fog: 0x140e2a,
        sunColor: [1.22, 1.14, 1.02],
        sunDir: [0.25, 0.88, 0.38],
        hemiSky: 0xffedd5,
        hemiGround: 0x3b1d11,`
);

// Update FOOTY_BASE lighting to vibrant stadium light
code = code.replace(
  /const FOOTY_BASE = \{[\s\S]*?hemiSky:\s*0x[0-9a-fA-F]+,[\s\S]*?hemiGround:\s*0x[0-9a-fA-F]+,/,
  `const FOOTY_BASE = {
        line: 0xfdfefe,
        skyTop: 0x100e2e,
        skyBottom: 0x2e1065,
        fog: 0x120d26,
        sunColor: [1.32, 1.25, 1.15],
        sunDir: [0.35, 0.85, 0.4],
        hemiSky: 0xdbeafe,
        hemiGround: 0x14532d,`
);

fs.writeFileSync(gameJsPath, code, 'utf8');
console.log('✓ Successfully written all upgrades to js/game.js');
