const fs = require('fs');
const path = require('path');

const gameJsPath = path.join(__dirname, '..', 'js', 'game.js');
let content = fs.readFileSync(gameJsPath, 'utf8');

// Helper for CRLF / LF resilient replacement
function replaceSection(src, oldText, newText, label) {
  const normSrc = src.replace(/\r\n/g, '\n');
  const normOld = oldText.replace(/\r\n/g, '\n');
  const normNew = newText.replace(/\r\n/g, '\n');

  if (!normSrc.includes(normOld)) {
    console.warn(`[WARN] Target not found for: ${label}`);
    return src;
  }
  console.log(`[SUCCESS] Replaced: ${label}`);
  const replaced = normSrc.replace(normOld, normNew);
  // Preserve CRLF if original used CRLF
  return src.includes('\r\n') ? replaced.replace(/\n/g, '\r\n') : replaced;
}

// 1. Basketball camera stanchion clamping & follow distance refinement
const oldCamBlock = `            // 4. Follow Distance & Height Behind Player
            let followDist = isFooty ? 13.5 : 10.2;
            let followHeight = isFooty ? 5.8 : 4.8;

            if (this.aspect < 0.9) {
                followDist *= 1.10;
                followHeight *= 1.12;
                this.cam.fov = (isFooty ? 48 : 46);
            } else {
                this.cam.fov = (isFooty ? 46 : 44);
            }

            const distToGoal = Math.abs(hzPlayer - goalZ);
            const threshold = isFooty ? 18.0 : 8.5;
            if (distToGoal < threshold) {
                const nearK = 1.0 - (distToGoal / threshold);
                followHeight += nearK * 0.75;
                followDist -= nearK * 0.45;
            }

            if (human && (human.sprint || speed > 6.0)) {
                followDist *= 1.07;
                followHeight *= 1.04;
            }

            if (forceFull) {
                followDist = isFooty ? 12.0 : 9.5;
                followHeight = 4.5;
                this.camYaw += dt * 0.5;
            }

            const sinY = Math.sin(this.camYaw);
            const cosY = Math.cos(this.camYaw);

            let wantCamX = focusX + sinY * followDist;
            let wantCamY = focusY + followHeight;
            let wantCamZ = focusZ + cosY * followDist;

            const maxBoundX = this.limitX + (isFooty ? 3.5 : 2.0);
            wantCamX = Math.max(-maxBoundX, Math.min(maxBoundX, wantCamX));
            wantCamY = Math.max(1.85, wantCamY);`;

const newCamBlock = `            // 4. Follow Distance & Height Behind Player
            let followDist = isFooty ? 13.5 : 7.2;
            let followHeight = isFooty ? 5.8 : 3.8;

            if (this.aspect < 0.9) {
                followDist *= (isFooty ? 1.10 : 1.05);
                followHeight *= (isFooty ? 1.12 : 1.05);
                this.cam.fov = (isFooty ? 48 : 46);
            } else {
                this.cam.fov = (isFooty ? 46 : 44);
            }

            const distToGoal = Math.abs(hzPlayer - goalZ);
            const threshold = isFooty ? 18.0 : 8.5;
            if (distToGoal < threshold) {
                const nearK = 1.0 - (distToGoal / threshold);
                followHeight += nearK * 0.75;
                followDist -= nearK * 0.45;
            }

            if (human && (human.sprint || speed > 6.0)) {
                followDist *= 1.07;
                followHeight *= 1.04;
            }

            if (forceFull) {
                followDist = isFooty ? 12.0 : 8.0;
                followHeight = 4.2;
                this.camYaw += dt * 0.5;
            }

            const sinY = Math.sin(this.camYaw);
            const cosY = Math.cos(this.camYaw);

            let wantCamX = focusX + sinY * followDist;
            let wantCamY = focusY + followHeight;
            let wantCamZ = focusZ + cosY * followDist;

            const maxBoundX = this.limitX + (isFooty ? 3.5 : 2.0);
            wantCamX = Math.max(-maxBoundX, Math.min(maxBoundX, wantCamX));
            wantCamY = Math.max(1.85, wantCamY);

            if (!isFooty) {
                // South basket backboard is at z = 12.6, stanchion post is at z = 13.5
                // Strictly clamp wantCamZ to 10.8 so the camera never clips through or goes behind the south stanchion pole!
                wantCamZ = Math.min(10.8, wantCamZ);
            } else {
                wantCamZ = Math.min(this.limitZ + 3.0, wantCamZ);
            }`;

content = replaceSection(content, oldCamBlock, newCamBlock, 'CameraRig Stanchion Avoidance & Follow Dist');

// 2. Procedural Character Basketball Chest Badge
const oldHoopsCrest = `                // Front Collegiate Team Crest Badge for Basketball
                const hoopsCrest = mk(G.cylinder(0.065, 0.065, 0.02, 10), 0xfb923c, { spec: 0.6, fine: true });
                const hoopsStar = mk(G.box(0.045, 0.045, 0.025), white, { fine: true });
                hoopsStar.rotation = [0, 0, Math.PI / 4];
                this.torso.add(at(hoopsCrest, 0, 0.03, 0.205), at(hoopsStar, 0, 0.03, 0.21));`;

const newHoopsCrest = `                // Front Official FOOTY vs HOOPS Chest Emblem Badge for Basketball
                const hoopsBadgeBack = mk(G.cylinder(0.068, 0.068, 0.015, 16), 0x0a0f1a, { spec: 0.7, fine: true });
                const hoopsBadgeRing = mk(G.cylinder(0.071, 0.071, 0.008, 16), 0xf97316, { fine: true, emissive: 0xf97316, emissiveMul: 0.5 });
                const hoopsHalfWhite = mk(G.cylinder(0.058, 0.058, 0.018, 14), white, { fine: true });
                const hoopsHalfOrange = mk(G.box(0.058, 0.116, 0.020), 0xff6b00, { fine: true });
                const hoopsDivider = mk(G.box(0.012, 0.125, 0.024), white, { fine: true });
                hoopsDivider.rotation = [0, 0, 0.45];
                this.torso.add(at(hoopsBadgeBack, 0, 0.04, 0.205), at(hoopsBadgeRing, 0, 0.04, 0.206), at(hoopsHalfWhite, 0, 0.04, 0.21), at(hoopsHalfOrange, 0.029, 0.04, 0.212), at(hoopsDivider, 0, 0.04, 0.214));`;

content = replaceSection(content, oldHoopsCrest, newHoopsCrest, 'Procedural Hoops Chest Emblem Badge');

// 3. Procedural Character Football Chest Badge
const oldFootyCrest = `                // Golden Club Crest on left chest
                this.torso.add(at(mk(G.cylinder(0.045, 0.045, 0.02, 10), 0xf6c445, { spec: 0.6, fine: true }), 0.12, 0.16, 0.21));`;

const newFootyCrest = `                // Front Official FOOTY vs HOOPS Chest Emblem Badge for Football
                const footyBadgeBack = mk(G.cylinder(0.055, 0.055, 0.015, 16), 0x0a0f1a, { spec: 0.7, fine: true });
                const footyBadgeRing = mk(G.cylinder(0.058, 0.058, 0.008, 16), 0x00f0ff, { fine: true, emissive: 0x00f0ff, emissiveMul: 0.5 });
                const footyHalfWhite = mk(G.cylinder(0.046, 0.046, 0.018, 14), white, { fine: true });
                const footyHalfOrange = mk(G.box(0.046, 0.092, 0.020), 0xff6b00, { fine: true });
                const footyDivider = mk(G.box(0.010, 0.100, 0.024), white, { fine: true });
                footyDivider.rotation = [0, 0, 0.45];
                this.torso.add(at(footyBadgeBack, 0.12, 0.16, 0.205), at(footyBadgeRing, 0.12, 0.16, 0.206), at(footyHalfWhite, 0.12, 0.16, 0.21), at(footyHalfOrange, 0.143, 0.16, 0.212), at(footyDivider, 0.12, 0.16, 0.214));`;

content = replaceSection(content, oldFootyCrest, newFootyCrest, 'Procedural Footy Chest Emblem Badge');

fs.writeFileSync(gameJsPath, content, 'utf8');
console.log('Finished updating game.js');
