const fs = require('fs');

const files = [
  'js/game.js',
  'C:/Users/ASUS/Desktop/FOOTY vs HOOPS/js/game.js'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');

  // Replace Camera follow parameters
  const oldSection = `            // 4. Tight Fortnite Third-Person Hero Follow Camera ("жесткая посадка за спину")
            // Perfectly frames the hero athlete's muscular back, squad number, and boots in the lower view
            // while giving a clear, unobstructed sightline to the goal, ball, and entire arena!
            let followDist = isFooty ? 4.5 : 3.8;
            let followHeight = isFooty ? 2.00 : 1.70;

            if (this.aspect < 0.9) {
                // Portrait mobile framing: hero athlete fills a commanding ~44% of screen height
                followDist *= 1.02;
                followHeight *= 1.02;
                this.cam.fov = 52;
            } else {
                this.cam.fov = 46;
            }

            const distToGoal = Math.abs(hzPlayer - goalZ);
            const threshold = isFooty ? 15.0 : 8.5;
            let nearK = 0;
            if (distToGoal < threshold) {
                nearK = 1.0 - (distToGoal / threshold);
                followHeight += nearK * 0.90;
                followDist += nearK * 0.70;
            }

            if (human && (human.sprint || speed > 6.0)) {
                followDist *= 1.04;
                followHeight *= 1.02;
            }

            if (forceFull) {
                followDist = isFooty ? 7.2 : 5.8;
                followHeight = 3.0;
                this.camYaw += dt * 0.5;
            }

            const sinY = Math.sin(this.camYaw);
            const cosY = Math.cos(this.camYaw);

            // Tight over-the-shoulder tactical offset (+0.30m)
            const shoulderOffset = (this.aspect < 0.9) ? 0.30 : 0.38;
            let wantCamX = focusX + sinY * followDist + shoulderOffset;
            let wantCamY = focusY + followHeight;
            let wantCamZ = focusZ + cosY * followDist;

            const maxBoundX = this.limitX + (isFooty ? 2.5 : 1.5);
            wantCamX = Math.max(-maxBoundX, Math.min(maxBoundX, wantCamX));
            wantCamY = Math.max(1.65, wantCamY);

            if (!isFooty) {
                if (wantCamZ > 11.8) {
                    const extra = wantCamZ - 11.8;
                    wantCamY += extra * 0.35;
                    wantCamZ = 11.8;
                }
            } else {
                wantCamZ = Math.min(this.limitZ + 2.5, wantCamZ);
            }

            // Look forward towards the opponent's goal/hoop (at -Z) with heroic horizon elevation!
            const lookAheadZ = isFooty ? 4.2 : 3.2;
            const targetPosX = focusX * 0.35;
            const targetPosY = 1.32 + (nearK * 0.55) + (isShotOrDunk ? Math.min(2.8, by * 0.40) : 0);
            const targetPosZ = focusZ - (lookAheadZ + nearK * 1.0);`;

  const newSection = `            // 4. Heroic Third-Person Arcade Sports Follow Camera
            // Perfectly positions the hero athlete in the lower third of the screen
            // providing an unobstructed, epic view of the ball, pitch markings, opponent, and goal/hoop!
            let followDist = isFooty ? 9.2 : 7.2;
            let followHeight = isFooty ? 4.2 : 3.2;

            if (this.aspect < 0.9) {
                // Portrait mobile framing: athlete fills ~35% of lower frame, clear view of entire arena
                followDist *= 1.05;
                followHeight *= 1.06;
                this.cam.fov = 50;
            } else {
                this.cam.fov = 46;
            }

            const distToGoal = Math.abs(hzPlayer - goalZ);
            const threshold = isFooty ? 16.0 : 9.0;
            let nearK = 0;
            if (distToGoal < threshold) {
                nearK = 1.0 - (distToGoal / threshold);
                followHeight += nearK * 0.85;
                followDist += nearK * 0.60;
            }

            if (human && (human.sprint || speed > 6.0)) {
                followDist *= 1.04;
                followHeight *= 1.02;
            }

            if (forceFull) {
                followDist = isFooty ? 11.5 : 8.5;
                followHeight = 4.8;
                this.camYaw += dt * 0.5;
            }

            const sinY = Math.sin(this.camYaw);
            const cosY = Math.cos(this.camYaw);

            // Subtle tactical over-the-shoulder offset (+0.35m) so the hero never blocks the ball
            const shoulderOffset = (this.aspect < 0.9) ? 0.32 : 0.40;
            let wantCamX = focusX + sinY * followDist + shoulderOffset;
            let wantCamY = focusY + followHeight;
            let wantCamZ = focusZ + cosY * followDist;

            const maxBoundX = this.limitX + (isFooty ? 3.0 : 1.8);
            wantCamX = Math.max(-maxBoundX, Math.min(maxBoundX, wantCamX));
            wantCamY = Math.max(2.2, wantCamY);

            if (!isFooty) {
                if (wantCamZ > 12.2) {
                    const extra = wantCamZ - 12.2;
                    wantCamY += extra * 0.35;
                    wantCamZ = 12.2;
                }
            } else {
                wantCamZ = Math.min(this.limitZ + 3.5, wantCamZ);
            }

            // Look forward towards the opponent's goal/hoop (at -Z) with stadium sightlines!
            const lookAheadZ = isFooty ? 12.5 : 8.5;
            const targetPosX = focusX * 0.42;
            const targetPosY = 1.40 + (nearK * 0.40) + (isShotOrDunk ? Math.min(2.8, by * 0.40) : 0);
            const targetPosZ = focusZ - (lookAheadZ + nearK * 1.5);`;

  if (code.includes(oldSection)) {
    code = code.replace(oldSection, newSection);
    fs.writeFileSync(f, code, 'utf8');
    console.log('✓ Successfully upgraded CameraRig in', f);
  } else {
    // Try normalized newlines
    const normCode = code.replace(/\r\n/g, '\n');
    const normOld = oldSection.replace(/\r\n/g, '\n');
    const normNew = newSection.replace(/\r\n/g, '\n');
    if (normCode.includes(normOld)) {
      const updated = normCode.replace(normOld, normNew);
      fs.writeFileSync(f, updated, 'utf8');
      console.log('✓ Successfully upgraded CameraRig (normalized) in', f);
    } else {
      console.error('✗ CameraRig target not found in', f);
    }
  }
});
