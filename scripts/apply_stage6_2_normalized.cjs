const fs = require('fs');
const path = require('path');

function replaceNormalized(filePath, searchStr, replaceStr, label) {
  let content = fs.readFileSync(filePath, 'utf8');
  const isCRLF = content.includes('\r\n');
  const normContent = content.replace(/\r\n/g, '\n');
  const normSearch = searchStr.replace(/\r\n/g, '\n');
  const normReplace = replaceStr.replace(/\r\n/g, '\n');

  if (normContent.includes(normSearch)) {
    const updated = normContent.replace(normSearch, normReplace);
    fs.writeFileSync(filePath, isCRLF ? updated.replace(/\n/g, '\r\n') : updated, 'utf8');
    console.log(`[SUCCESS] ${label}`);
    return true;
  } else {
    console.warn(`[FAILED] ${label} - search string not found`);
    return false;
  }
}

// 1. Football pitch center
const gameJsPath = path.join(__dirname, '../js/game.js');
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

replaceNormalized(gameJsPath, oldPitchCenter, newPitchCenter, 'Pitch Center Emblem');

// 2. Basketball court center
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

replaceNormalized(gameJsPath, oldCourtCenter, newCourtCenter, 'Court Center Emblem');

// 3. CameraRig.update
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

            // --- MODERN THIRD-PERSON FOLLOW CAMERA ---
            // Positioned behind and slightly above the controlled human player
            const isFooty = (this.mode === 'footy');
            const hxPlayer = (human && typeof human.x === 'number') ? human.x : 0;
            const hzPlayer = (human && typeof human.z === 'number') ? human.z : 0;
            const pvx = (human && typeof human.vx === 'number') ? human.vx : 0;
            const pvz = (human && typeof human.vz === 'number') ? human.vz : 0;
            const speed = Math.sqrt(pvx * pvx + pvz * pvz);

            // 1. Goal / Target direction (Team 0 attacks toward -Z)
            const goalZ = -this.limitZ;

            // 2. Ball Tracking & Dynamic Shot Elevation
            const bx = (ball && typeof ball.x === 'number') ? ball.x : hxPlayer;
            const by = (ball && typeof ball.y === 'number') ? ball.y : 0;
            const bz = (ball && typeof ball.z === 'number') ? ball.z : hzPlayer;
            const isShotOrDunk = (ball && (ball.shot || by > 2.0 || Math.abs(ball.vz || 0) > 11));

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
            let followDist = isFooty ? 9.8 : 7.4;
            let followHeight = isFooty ? 4.8 : 3.8;

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
            wantCamY = Math.max(1.85, wantCamY);

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

            this.shakeT += dt * 60;
            const sh = this.shakeAmt * 0.32;
            const ox = Math.sin(this.shakeT * 1.7) * sh;
            const oy = Math.cos(this.shakeT * 2.3) * sh * 0.65;
            this.shakeAmt = Math.max(0, this.shakeAmt - dt * 2.2);

            const c = this.cam;
            c.position = [this.curCamPos[0] + ox, this.curCamPos[1] + oy, this.curCamPos[2]];
            c.target = [this.curTarget[0] + ox * 0.4, this.curTarget[1], this.curTarget[2]];
            c.update();
        }`;

replaceNormalized(gameJsPath, oldCameraUpdate, newCameraUpdate, 'CameraRig Third-Person Follow');

// 4. render/characters_glb.js
const glbJsPath = path.join(__dirname, '../render/characters_glb.js');
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

replaceNormalized(glbJsPath, oldGlbCrest, newGlbCrest, 'GLB Jersey Crest with Official Emblem');

// 5. js/redesign.js
const redesignJsPath = path.join(__dirname, '../js/redesign.js');
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

replaceNormalized(redesignJsPath, oldFootySvgCrest, newFootySvgCrest, 'Redesign Football Jersey SVG Emblem');

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

replaceNormalized(redesignJsPath, oldHoopsSvgTag, newHoopsSvgTag, 'Redesign Basketball Tank Top SVG Emblem');
