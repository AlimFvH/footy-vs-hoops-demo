const fs = require('fs');
const path = require('path');

console.log('=== Stage 6.2: Official Branding & Third-Person Camera Implementation ===\n');

// -------------------------------------------------------------
// 1. UPDATE index.html (Preload Official Emblem)
// -------------------------------------------------------------
console.log('[1/4] Updating index.html with preloaded official emblem...');
const indexHtmlPath = path.join(__dirname, '../index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

if (!indexHtml.includes('id="fvh-official-emblem"')) {
  indexHtml = indexHtml.replace(
    '<div id="stage">',
    '<img id="fvh-official-emblem" src="assets/emblem.png" alt="FOOTY vs HOOPS" style="display:none;" />\n  <div id="stage">'
  );
  fs.writeFileSync(indexHtmlPath, indexHtml, 'utf8');
  console.log('  -> Preloaded emblem added to index.html');
} else {
  console.log('  -> Already present in index.html');
}

// -------------------------------------------------------------
// 2. UPDATE js/game.js (Center Circles, Uniform Crests & Third-Person Camera)
// -------------------------------------------------------------
console.log('[2/4] Updating js/game.js...');
const gameJsPath = path.join(__dirname, '../js/game.js');
let gameCode = fs.readFileSync(gameJsPath, 'utf8');

// A. Add Official Emblem Helper in textures module
const emblemHelperCode = `
    let cachedOfficialEmblem = null;
    function getOfficialEmblem() {
        if (cachedOfficialEmblem && cachedOfficialEmblem.complete && cachedOfficialEmblem.naturalWidth > 0) return cachedOfficialEmblem;
        if (typeof document !== 'undefined') {
            cachedOfficialEmblem = document.getElementById('fvh-official-emblem');
            if (!cachedOfficialEmblem) {
                cachedOfficialEmblem = new Image();
                cachedOfficialEmblem.src = 'assets/emblem.png';
            }
        }
        return cachedOfficialEmblem;
    }
    function drawOfficialCenterEmblem(g, cx, cy, radius, isBasketball) {
        g.save();
        // 1. Subtle dark circular backing plate with glowing accent border
        g.beginPath();
        g.arc(cx, cy, radius, 0, Math.PI * 2);
        g.fillStyle = isBasketball ? 'rgba(10, 14, 26, 0.78)' : 'rgba(6, 12, 22, 0.72)';
        g.fill();
        g.lineWidth = isBasketball ? 4 : 5;
        g.strokeStyle = isBasketball ? '#f97316' : '#00f0ff';
        g.shadowColor = isBasketball ? '#f97316' : '#00f0ff';
        g.shadowBlur = 12;
        g.stroke();
        g.shadowBlur = 0;

        // 2. Official Emblem Image (Strict 1:1 proportions from assets/emblem.png)
        const emb = getOfficialEmblem();
        const emSize = radius * 1.78;
        if (typeof g.drawImage === 'function' && emb && emb.complete && emb.naturalWidth > 0) {
            g.drawImage(emb, cx - emSize / 2, cy - emSize / 2, emSize, emSize);
        } else {
            // High-fidelity fallback circle matching the official emblem's colors
            const halfR = radius * 0.82;
            // Football half (left, white with dark accents)
            g.fillStyle = '#ffffff';
            g.beginPath();
            g.arc(cx, cy, halfR, Math.PI * 0.5, Math.PI * 1.5);
            g.fill();
            // Basketball half (right, vibrant orange)
            g.fillStyle = '#ff6b00';
            g.beginPath();
            g.arc(cx, cy, halfR, -Math.PI * 0.5, Math.PI * 0.5);
            g.fill();
            // White diagonal dividing line
            g.strokeStyle = '#ffffff';
            g.lineWidth = 4;
            g.beginPath();
            g.moveTo(cx - 2, cy - halfR);
            g.lineTo(cx + 6, cy + halfR);
            g.stroke();
        }
        g.restore();
    }
`;

if (!gameCode.includes('drawOfficialCenterEmblem')) {
  gameCode = gameCode.replace(
    'const hex = (c) => \'#\' + c.toString(16).padStart(6, \'0\');',
    'const hex = (c) => \'#\' + c.toString(16).padStart(6, \'0\');\n' + emblemHelperCode
  );
  console.log('  -> drawOfficialCenterEmblem added to textures module');
}

// B. Football Pitch: draw official emblem in center circle
const oldPitchCenter = `        // Glowing center energy spot
        g.fillStyle = '#00f0ff';
        g.beginPath();
        g.arc(X(0), Z(0), 0.42 * PPM_F, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#ffffff';
        g.beginPath();
        g.arc(X(0), Z(0), 0.22 * PPM_F, 0, Math.PI * 2);
        g.fill();`;

const newPitchCenter = `        // Official FOOTY vs HOOPS Center Pitch Emblem
        drawOfficialCenterEmblem(g, X(0), Z(0), football_js_1.FB.CIRCLE_R * 0.88 * PPM_F, false);`;

if (gameCode.includes(oldPitchCenter)) {
  gameCode = gameCode.replace(oldPitchCenter, newPitchCenter);
  console.log('  -> Football pitch center circle updated with Official Emblem');
}

// C. Basketball Court: draw official emblem in center jump circle
const oldCourtCenter = `        // Central Fortnite diamond sports icon
        g.fillStyle = '#ffffff';
        g.beginPath();
        g.moveTo(X(0), Z(-0.6));
        g.lineTo(X(0.55), Z(0));
        g.lineTo(X(0), Z(0.6));
        g.lineTo(X(-0.55), Z(0));
        g.closePath();
        g.fill();`;

const newCourtCenter = `        // Official FOOTY vs HOOPS Center Court Emblem
        drawOfficialCenterEmblem(g, X(0), Z(0), centerR * 0.82, true);`;

if (gameCode.includes(oldCourtCenter)) {
  gameCode = gameCode.replace(oldCourtCenter, newCourtCenter);
  console.log('  -> Basketball court center jump circle updated with Official Emblem');
}

// D. Third-Person Follow Camera in CameraRig
// Replace CameraRig.update while strictly preserving assertions and helper methods
const oldCameraUpdate = `        update(dt, ball, human, forceFull = false) {
            const [hx, hz] = this.halfExtents();
            let tx = ball.x * 0.65 + human.x * 0.35;
            let tz = ball.z * 0.65 + human.z * 0.35 - (this.mode === 'footy' ? 4.5 : 2.0);
            const maxX = Math.max(0, this.limitX - hx * 0.55);
            tx = Math.max(-maxX, Math.min(maxX, tx));
            const maxZ = this.limitZ - hz * 0.65;
            tz = Math.max(-maxZ, Math.min(maxZ, tz));
            if (forceFull) {
                tx = 0;
                tz = 0;
            }
            const k = this.snap ? 1 : 1 - Math.exp(-dt * 7);
            this.fx += (tx - this.fx) * k;
            this.fz += (tz - this.fz) * k;
            const wantD = this.fitDistance(this.fx, this.fz, forceFull ? Math.min(this.maxHalfX, this.limitX + 2) : hx, forceFull ? this.limitZ + 2 : hz);
            this.dist += (wantD - this.dist) * (this.snap ? 1 : 1 - Math.exp(-dt * 3));
            this.snap = false;
            this.shakeT += dt * 60;
            const sh = this.shakeAmt * 0.35;
            const ox = Math.sin(this.shakeT * 1.7) * sh;
            const oy = Math.cos(this.shakeT * 2.3) * sh * 0.7;
            this.shakeAmt = Math.max(0, this.shakeAmt - dt * 2.2);
            const c = this.cam;
            const dy = Math.sin(this.elev);
            const dz = Math.cos(this.elev);
            c.position = [this.fx + ox, dy * this.dist + oy, this.fz + dz * this.dist];
            c.target = [this.fx + ox * 0.6, 0, this.fz];
            c.update();
        }`;

const newCameraUpdate = `        update(dt, ball, human, forceFull = false) {
            const [hx, hz] = this.halfExtents();
            let tx = ball.x * 0.65 + human.x * 0.35;
            let tz = ball.z * 0.65 + human.z * 0.35 - (this.mode === 'footy' ? 4.5 : 2.0);
            const maxX = Math.max(0, this.limitX - hx * 0.55);
            tx = Math.max(-maxX, Math.min(maxX, tx));
            const maxZ = this.limitZ - hz * 0.65;
            tz = Math.max(-maxZ, Math.min(maxZ, tz));
            if (forceFull) {
                tx = 0;
                tz = 0;
            }

            // --- MODERN THIRD-PERSON FOLLOW CAMERA IMPLEMENTATION ---
            // Positioned behind and slightly above the controlled player
            const isFooty = (this.mode === 'footy');
            const hxPlayer = (human && typeof human.x === 'number') ? human.x : 0;
            const hzPlayer = (human && typeof human.z === 'number') ? human.z : 0;
            const pvx = (human && typeof human.vx === 'number') ? human.vx : 0;
            const pvz = (human && typeof human.vz === 'number') ? human.vz : 0;
            const speed = Math.sqrt(pvx * pvx + pvz * pvz);

            // 1. Target Goal/Basket Position (Team 0 attacks toward -Z / North)
            const goalZ = -this.limitZ;
            const toGoalX = hxPlayer;
            const toGoalZ = goalZ;

            // 2. Ball Tracking & Dynamic Shot Elevation
            const bx = (ball && typeof ball.x === 'number') ? ball.x : hxPlayer;
            const by = (ball && typeof ball.y === 'number') ? ball.y : 0;
            const bz = (ball && typeof ball.z === 'number') ? ball.z : hzPlayer;
            const isShotOrDunk = (ball && (ball.shot || by > 2.0 || Math.abs(ball.vz || 0) > 11));

            // Weight focus between player and ball
            const ballW = isShotOrDunk ? 0.42 : (speed > 4.5 ? 0.16 : 0.28);
            const leadX = pvx * (isFooty ? 0.25 : 0.18);
            const leadZ = pvz * (isFooty ? 0.20 : 0.14);

            const focusX = hxPlayer * (1 - ballW) + bx * ballW + leadX;
            const focusY = 1.45 + (isShotOrDunk ? Math.min(3.2, by * 0.45) : 0);
            const focusZ = hzPlayer * (1 - ballW) + bz * ballW + leadZ;

            // 3. Smooth Yaw Rotation (Facing towards target goal with gentle sway)
            const angleToGoal = Math.atan2(focusX, focusZ - goalZ);
            const moveAngle = speed > 1.2 ? Math.atan2(pvx, pvz) : 0;
            const bias = isFooty ? 0.72 : 0.65;
            let targetYaw = angleToGoal * bias + moveAngle * (1 - bias);
            targetYaw = Math.max(-0.62, Math.min(0.62, targetYaw));

            if (!this.camYaw) this.camYaw = 0;
            const rotK = this.snap ? 1.0 : 1.0 - Math.exp(-dt * 6.5);
            this.camYaw += (targetYaw - this.camYaw) * rotK;

            // 4. Follow Distance & Height Behind Player
            // Behind player in attack direction means +Z relative to player
            let followDist = isFooty ? 9.8 : 7.4;
            let followHeight = isFooty ? 4.8 : 3.8;

            // Responsive Mobile Portrait Adjustments (aspect < 0.9, e.g. iPhone 390x844)
            if (this.aspect < 0.9) {
                followDist *= 1.10;
                followHeight *= 1.12;
                this.cam.fov = (isFooty ? 48 : 46);
            } else {
                this.cam.fov = (isFooty ? 46 : 44);
            }

            // Approaching the basket/goal: raise camera slightly for dramatic finish framing
            const distToGoal = Math.abs(hzPlayer - goalZ);
            const threshold = isFooty ? 18.0 : 8.5;
            if (distToGoal < threshold) {
                const nearK = 1.0 - (distToGoal / threshold);
                followHeight += nearK * 0.75;
                followDist -= nearK * 0.45;
            }

            // Sprinting: dynamic speed pull-back
            if (human && (human.sprint || speed > 6.0)) {
                followDist *= 1.07;
                followHeight *= 1.04;
            }

            // End of Match Celebration: Orbit around victorious player
            if (forceFull) {
                followDist = isFooty ? 12.0 : 9.5;
                followHeight = 4.5;
                this.camYaw += dt * 0.5;
            }

            // Compute Third-Person Camera World Coordinates
            const sinY = Math.sin(this.camYaw);
            const cosY = Math.cos(this.camYaw);

            let wantCamX = focusX + sinY * followDist;
            let wantCamY = focusY + followHeight;
            let wantCamZ = focusZ + cosY * followDist;

            // Clamp inside arena side barriers so camera never clips outside
            const maxBoundX = this.limitX + (isFooty ? 3.5 : 2.0);
            wantCamX = Math.max(-maxBoundX, Math.min(maxBoundX, wantCamX));
            wantCamY = Math.max(1.85, wantCamY); // Never clip through ground

            // Smooth Position Follow
            if (!this.curCamPos) this.curCamPos = [wantCamX, wantCamY, wantCamZ];
            if (!this.curTarget) this.curTarget = [focusX, focusY, focusZ];

            const posK = this.snap ? 1.0 : 1.0 - Math.exp(-dt * 9.0);
            this.curCamPos[0] += (wantCamX - this.curCamPos[0]) * posK;
            this.curCamPos[1] += (wantCamY - this.curCamPos[1]) * posK;
            this.curCamPos[2] += (wantCamZ - this.curCamPos[2]) * posK;

            this.curTarget[0] += (focusX - this.curTarget[0]) * posK;
            this.curTarget[1] += (focusY - this.curTarget[1]) * posK;
            this.curTarget[2] += (focusZ - this.curTarget[2]) * posK;

            this.snap = false;

            // Camera Shake on dynamic events (tackles, dunks, crossbar hits)
            this.shakeT += dt * 60;
            const sh = this.shakeAmt * 0.32;
            const ox = Math.sin(this.shakeT * 1.7) * sh;
            const oy = Math.cos(this.shakeT * 2.3) * sh * 0.65;
            this.shakeAmt = Math.max(0, this.shakeAmt - dt * 2.2);

            // Apply to Camera Object
            const c = this.cam;
            c.position = [this.curCamPos[0] + ox, this.curCamPos[1] + oy, this.curCamPos[2]];
            c.target = [this.curTarget[0] + ox * 0.4, this.curTarget[1], this.curTarget[2]];
            c.update();
        }`;

if (gameCode.includes(oldCameraUpdate)) {
  gameCode = gameCode.replace(oldCameraUpdate, newCameraUpdate);
  console.log('  -> CameraRig.update successfully upgraded to Modern Third-Person Follow Camera');
} else {
  console.warn('  -> Could not find oldCameraUpdate target!');
}

fs.writeFileSync(gameJsPath, gameCode, 'utf8');
console.log('=== js/game.js updated! ===\n');

// -------------------------------------------------------------
// 3. UPDATE render/characters_glb.js (Uniform Chest Crest on 3D GLB Characters)
// -------------------------------------------------------------
console.log('[3/4] Updating render/characters_glb.js...');
const glbJsPath = path.join(__dirname, '../render/characters_glb.js');
let glbCode = fs.readFileSync(glbJsPath, 'utf8');

// Ensure emblem image is loaded for GLB texture generation
const glbEmblemHelper = `
  let glbEmblemImg = null;
  function getGlbOfficialEmblem() {
    if (glbEmblemImg && glbEmblemImg.complete && glbEmblemImg.naturalWidth > 0) return glbEmblemImg;
    if (typeof document !== 'undefined') {
      glbEmblemImg = document.getElementById('fvh-official-emblem');
      if (!glbEmblemImg) {
        glbEmblemImg = new Image();
        glbEmblemImg.src = 'assets/emblem.png';
      }
    }
    return glbEmblemImg;
  }
`;

if (!glbCode.includes('getGlbOfficialEmblem')) {
  glbCode = glbCode.replace(
    '  function hexToRgb(h) {',
    glbEmblemHelper + '\n  function hexToRgb(h) {'
  );
}

// In drawGlbJerseyPattern: draw the official emblem onto front chest of every jersey
const oldGlbCrest = `        // 2. Club Crest & Athlete Number Detailing
        if (isFront) {
          // Official Club Crest on left chest
          ctx.fillStyle = accCol;
          ctx.beginPath();
          ctx.arc(cx - W * 0.052, topY + hH * 0.28, W * 0.016, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();`;

const newGlbCrest = `        // 2. Official FOOTY vs HOOPS Crest & Athlete Number Detailing
        if (isFront) {
          // Official Project Emblem Badge on Chest (Strict 1:1 Aspect Ratio)
          const emb = getGlbOfficialEmblem();
          const embRadius = W * 0.024;
          const embSize = embRadius * 2;
          const embX = isFooty ? (cx - W * 0.052) : (cx - W * 0.048);
          const embY = topY + hH * 0.27;

          // Subtle dark contrast underlay so emblem pops on both light & dark kits
          ctx.beginPath();
          ctx.arc(embX, embY, embRadius + 1.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(10, 15, 26, 0.75)';
          ctx.fill();
          ctx.strokeStyle = isFooty ? '#00f0ff' : '#f97316';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          if (emb && emb.complete && emb.naturalWidth > 0) {
            ctx.drawImage(emb, embX - embRadius, embY - embRadius, embSize, embSize);
          } else {
            // High-fidelity fallback circle matching the official emblem
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(embX, embY, embRadius, Math.PI * 0.5, Math.PI * 1.5);
            ctx.fill();
            ctx.fillStyle = '#ff6b00';
            ctx.beginPath();
            ctx.arc(embX, embY, embRadius, -Math.PI * 0.5, Math.PI * 0.5);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            ctx.moveTo(embX - 1, embY - embRadius);
            ctx.lineTo(embX + 2, embY + embRadius);
            ctx.stroke();
          }`;

if (glbCode.includes(oldGlbCrest)) {
  glbCode = glbCode.replace(oldGlbCrest, newGlbCrest);
  console.log('  -> render/characters_glb.js: Official Emblem integrated onto 3D character jerseys');
} else {
  console.warn('  -> Could not find oldGlbCrest in render/characters_glb.js');
}

fs.writeFileSync(glbJsPath, glbCode, 'utf8');
console.log('=== render/characters_glb.js updated! ===\n');

// -------------------------------------------------------------
// 4. UPDATE js/redesign.js (Wardrobe Item Previews with Official Emblem)
// -------------------------------------------------------------
console.log('[4/4] Updating js/redesign.js...');
const redesignJsPath = path.join(__dirname, '../js/redesign.js');
let redesignCode = fs.readFileSync(redesignJsPath, 'utf8');

// A. Football kit preview: embed official emblem on chest
const oldFootySvgCrest = `    // Official Club Crest Shield on Chest
    var crest =
      '<g transform="translate(35, 36)">' +
      crestStars +
      '<path d="M0 0 L8 0 L8 7 C8 11 4 13 4 13 C4 13 0 11 0 7 Z" fill="' + accent + '" stroke="' + primary + '" stroke-width="0.8" filter="url(#drop_' + uid + ')"/>' +
      '<polygon points="4,2 5,4.5 7.5,4.5 5.5,6 6.3,8.5 4,7 1.7,8.5 2.5,6 0.5,4.5 3,4.5" fill="' + (primary.includes('ca8a') || primary.includes('854d') ? '#d97706' : '#f59e0b') + '"/>' +
      '</g>';`;

const newFootySvgCrest = `    // Official FOOTY vs HOOPS Crest Badge on Chest
    var crest =
      '<g transform="translate(33, 34)">' +
      crestStars +
      '<circle cx="6" cy="6" r="6.5" fill="rgba(10,15,26,0.75)" stroke="' + trim + '" stroke-width="0.8"/>' +
      '<image href="assets/emblem.png" x="0" y="0" width="12" height="12" preserveAspectRatio="xMidYMid meet"/>' +
      '</g>';`;

if (redesignCode.includes(oldFootySvgCrest)) {
  redesignCode = redesignCode.replace(oldFootySvgCrest, newFootySvgCrest);
  console.log('  -> Football jersey SVG updated with Official Emblem');
} else {
  console.warn('  -> Could not find oldFootySvgCrest in js/redesign.js');
}

// B. Basketball tank top preview: embed official emblem on chest
const oldHoopsSvgTag = `      // Jock tag on bottom hem
      var jockTag = '<rect x="30" y="78" width="8" height="5" rx="0.5" fill="#1e293b" stroke="#64748b" stroke-width="0.5"/>' +`;

const newHoopsSvgTag = `      // Official FOOTY vs HOOPS Chest Crest Badge for Basketball Tank Top
      var hoopsEmblem =
        '<g transform="translate(43, 29)">' +
        '<circle cx="7" cy="7" r="7.5" fill="rgba(10,15,26,0.75)" stroke="' + trim + '" stroke-width="0.8"/>' +
        '<image href="assets/emblem.png" x="0" y="0" width="14" height="14" preserveAspectRatio="xMidYMid meet"/>' +
        '</g>';

      // Jock tag on bottom hem
      var jockTag = hoopsEmblem + '<rect x="30" y="78" width="8" height="5" rx="0.5" fill="#1e293b" stroke="#64748b" stroke-width="0.5"/>' +`;

if (redesignCode.includes(oldHoopsSvgTag)) {
  redesignCode = redesignCode.replace(oldHoopsSvgTag, newHoopsSvgTag);
  console.log('  -> Basketball tank top SVG updated with Official Emblem');
} else {
  console.warn('  -> Could not find oldHoopsSvgTag in js/redesign.js');
}

fs.writeFileSync(redesignJsPath, redesignCode, 'utf8');
console.log('=== js/redesign.js updated! ===\n');

console.log('=== ALL STAGE 6.2 UPDATES APPLIED SUCCESSFULLY! ===');
