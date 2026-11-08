const fs = require('fs');
const path = require('path');

const gameJsPath = path.join(__dirname, '../js/game.js');
let code = fs.readFileSync(gameJsPath, 'utf8');

const targetOld = `            // --- MODERN THIRD-PERSON FOLLOW CAMERA ---
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
            const focusY = 1.15 + (isShotOrDunk ? Math.min(3.2, by * 0.45) : 0);
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
            let followDist = isFooty ? 13.5 : 12.0;
            let followHeight = isFooty ? 5.8 : 5.4;

            if (this.aspect < 0.9) {
                followDist *= (isFooty ? 1.08 : 1.12);
                followHeight *= (isFooty ? 1.10 : 1.14);
                this.cam.fov = (isFooty ? 48 : 48);
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
            }

            if (!this.curCamPos) this.curCamPos = [wantCamX, wantCamY, wantCamZ];
            if (!this.curTarget) this.curTarget = [focusX, focusY, focusZ];

            const posK = this.snap ? 1.0 : 1.0 - Math.exp(-dt * 9.0);
            this.curCamPos[0] += (wantCamX - this.curCamPos[0]) * posK;
            this.curCamPos[1] += (wantCamY - this.curCamPos[1]) * posK;
            this.curCamPos[2] += (wantCamZ - this.curCamPos[2]) * posK;

            this.curTarget[0] += (focusX - this.curTarget[0]) * posK;
            this.curTarget[1] += (focusY - this.curTarget[1]) * posK;
            this.curTarget[2] += (focusZ - this.curTarget[2]) * posK;`;

const newCode = `            // --- MODERN THIRD-PERSON FOLLOW CAMERA ---
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

            const ballW = isShotOrDunk ? 0.35 : (speed > 4.5 ? 0.12 : 0.22);
            const leadX = pvx * (isFooty ? 0.20 : 0.14);
            const leadZ = pvz * (isFooty ? 0.18 : 0.12);

            const focusX = hxPlayer * (1 - ballW) + bx * ballW + leadX;
            const focusY = 1.35 + (isShotOrDunk ? Math.min(3.0, by * 0.40) : 0);
            const focusZ = hzPlayer * (1 - ballW) + bz * ballW + leadZ;

            // 3. Smooth Yaw Rotation (Facing towards target goal with gentle sway)
            const angleToGoal = Math.atan2(focusX, focusZ - goalZ);
            const moveAngle = speed > 1.2 ? Math.atan2(pvx, pvz) : 0;
            const bias = isFooty ? 0.78 : 0.72;
            let targetYaw = angleToGoal * bias + moveAngle * (1 - bias);
            targetYaw = Math.max(-0.45, Math.min(0.45, targetYaw));

            if (!this.camYaw) this.camYaw = 0;
            const rotK = this.snap ? 1.0 : 1.0 - Math.exp(-dt * 6.5);
            this.camYaw += (targetYaw - this.camYaw) * rotK;

            // 4. Heroic Follow Distance & Height Behind Player
            // Close enough to clearly see the hero athlete and uniform, elevated to see the goal/hoop ahead
            let followDist = isFooty ? 6.5 : 5.2;
            let followHeight = isFooty ? 3.1 : 2.6;

            if (this.aspect < 0.9) {
                followDist *= (isFooty ? 1.04 : 1.06);
                followHeight *= (isFooty ? 1.05 : 1.06);
                this.cam.fov = 50;
            } else {
                this.cam.fov = 46;
            }

            const distToGoal = Math.abs(hzPlayer - goalZ);
            const threshold = isFooty ? 16.0 : 8.0;
            if (distToGoal < threshold) {
                const nearK = 1.0 - (distToGoal / threshold);
                followHeight += nearK * 0.55;
                followDist -= nearK * 0.35;
            }

            if (human && (human.sprint || speed > 6.0)) {
                followDist *= 1.06;
                followHeight *= 1.03;
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
                // South basket backboard is at z = 12.6, stanchion post is at z = 13.5
                // Clamp wantCamZ to 11.6 so camera stays safely in front of backboard and never clips
                if (wantCamZ > 11.6) {
                    const extra = wantCamZ - 11.6;
                    wantCamY += extra * 0.35; // Lift up slightly when backed up
                    wantCamZ = 11.6;
                }
            } else {
                wantCamZ = Math.min(this.limitZ + 2.5, wantCamZ);
            }

            // Look forward towards the opponent's goal/hoop (at -Z) with comfortable pitch!
            const lookAheadZ = isFooty ? 4.5 : 3.8;
            const targetPosX = focusX * 0.70;
            const targetPosY = 1.55 + (isShotOrDunk ? Math.min(3.2, by * 0.40) : 0);
            const targetPosZ = focusZ - lookAheadZ;

            if (!this.curCamPos) this.curCamPos = [wantCamX, wantCamY, wantCamZ];
            if (!this.curTarget) this.curTarget = [targetPosX, targetPosY, targetPosZ];

            const posK = this.snap ? 1.0 : 1.0 - Math.exp(-dt * 9.0);
            this.curCamPos[0] += (wantCamX - this.curCamPos[0]) * posK;
            this.curCamPos[1] += (wantCamY - this.curCamPos[1]) * posK;
            this.curCamPos[2] += (wantCamZ - this.curCamPos[2]) * posK;

            this.curTarget[0] += (targetPosX - this.curTarget[0]) * posK;
            this.curTarget[1] += (targetPosY - this.curTarget[1]) * posK;
            this.curTarget[2] += (targetPosZ - this.curTarget[2]) * posK;`;

// Normalize line endings
const norm = str => str.replace(/\r\n/g, '\n');
const normCode = norm(code);
const normOld = norm(targetOld);
const normNew = norm(newCode);

if (!normCode.includes(normOld)) {
  console.error('Target old block not found in js/game.js');
  process.exit(1);
}

const patched = normCode.replace(normOld, normNew);
fs.writeFileSync(gameJsPath, patched.replace(/\n/g, '\r\n'), 'utf8');
console.log('✓ Successfully patched CameraRig in js/game.js!');
