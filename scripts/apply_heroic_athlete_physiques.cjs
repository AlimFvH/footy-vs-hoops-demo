const fs = require('fs');
const path = require('path');

const files = [
  'js/game.js',
  'C:/Users/ASUS/Desktop/FOOTY vs HOOPS/js/game.js'
];

console.log('=== Step 2: Sculpting Flawless 3D Heroic Athletes in game.js ===');

files.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  console.log('Processing:', filePath);
  let code = fs.readFileSync(filePath, 'utf8');

  // Find Character constructor
  const charIdx = code.indexOf('class Character {');
  if (charIdx === -1) {
    console.error('Character class not found in', filePath);
    return;
  }

  // 1. Replace the torso section
  const oldTorsoMarker = '// 3. High-Definition Torso & Pro Athletic Jersey';
  const oldArmsMarker = '// 4. Athletic Arms: Short Sleeves with Cuffs';
  const tStart = code.indexOf(oldTorsoMarker);
  const tEnd = code.indexOf(oldArmsMarker);

  if (tStart !== -1 && tEnd !== -1) {
    const newTorsoSection = `// 3. Flawless Athletic Torso with High-Definition Uniform Branding
            this.torso = new scene_js_3.Node();
            this.torso.setPos(0, 1.41, 0);

            // Sculpted anatomical chest core (Athletic V-taper)
            const chest = mk(G.cylinder(0.315, 0.225, 0.74, 16), skin.primary, { fabric: true, rim: 0.42 });
            chest.scale = [1, 1, 0.63];
            this.torso.add(chest);

            // Contoured Pectoral muscle shelves
            for (const sx of [-1, 1]) {
                const pec = mk(G.box(0.125, 0.155, 0.040), skin.primary, { fabric: true, rim: 0.35 });
                pec.rotation = [0.12, sx < 0 ? -0.12 : 0.12, 0];
                this.torso.add(at(pec, sx * 0.12, 0.19, 0.195));

                // Latissimus dorsi V-taper flank contours
                const lat = mk(G.box(0.042, 0.40, 0.17), skin.primary, { fabric: true });
                lat.rotation = [0, 0, sx < 0 ? 0.12 : -0.12];
                this.torso.add(at(lat, sx * 0.265, -0.04, -0.02));
            }

            // Muscular Deltoid Shoulders
            for (const sx of [-1, 1]) {
                const deltMat = foot ? white : skin.skin;
                this.torso.add(at(mk(G.sphere(0.138, 14, 10), deltMat, { fabric: foot, skin: !foot }), sx * 0.318, 0.29, 0));
            }

            // High-Definition Official Uniform Front & Back Plates with Official Emblem & Crisp Typography
            const charType = (agent && agent.role === 'keeper') ? 'keeper' : (foot ? 'footy' : 'hoops');
            const squadNum = (charType === 'keeper') ? '1' : (foot ? '10' : '23');

            const frontTex = (0, textures_js_2.getJerseyTexture)(charType, squadNum, false, skin.primary, skin.secondary, skin.accent);
            const backTex = (0, textures_js_2.getJerseyTexture)(charType, squadNum, true, skin.primary, skin.secondary, skin.accent);

            // Front Jersey Plate (Displays Official Emblem & Team Wordmark & Number)
            const frontPlate = new scene_js_3.Node(G.plane(0.48, 0.64), (0, scene_js_3.material)({
                texture: frontTex,
                color: [1, 1, 1],
                spec: 0.35,
                shininess: 32,
                rim: 0.25,
                depthWrite: true,
                receiveShadow: true
            }));
            this.torso.add(at(frontPlate, 0, 0.035, 0.208));

            // Back Jersey Plate (Displays Squad Number #10 / #23 & Name)
            const backPlate = new scene_js_3.Node(G.plane(0.48, 0.64), (0, scene_js_3.material)({
                texture: backTex,
                color: [1, 1, 1],
                spec: 0.35,
                shininess: 32,
                rim: 0.25,
                depthWrite: true,
                receiveShadow: true
            }));
            backPlate.rotation = [0, Math.PI, 0];
            this.torso.add(at(backPlate, 0, 0.035, -0.208));

            // Collar Styling
            if (foot) {
                // Football: Navy ribbed V-neck collar
                const collar = mk(G.cylinder(0.115, 0.130, 0.06, 16), 0x0f172a, { fabric: true, fine: true });
                this.torso.add(at(collar, 0, 0.375, 0));
            } else {
                // Basketball: Metallic Gold ribbed scoop collar
                const collar = mk(G.cylinder(0.125, 0.140, 0.05, 16), 0xf59e0b, { spec: 0.7, fine: true });
                this.torso.add(at(collar, 0, 0.375, 0));
            }

            // Defined Athletic Neck
            this.torso.add(at(mk(G.cylinder(0.068, 0.076, 0.13, 12), skin.skin, { skin: true }), 0, 0.42, 0));

            this.pivot.add(this.torso);

            `;

    code = code.slice(0, tStart) + newTorsoSection + code.slice(tEnd);
    console.log('✓ Replaced torso section in', filePath);
  }

  // 2. Replace the arms section
  const oldArmsStart = code.indexOf('// 4. Athletic Arms: Short Sleeves with Cuffs');
  const oldHeadStart = code.indexOf('// 5. Stylized 3D Human Athlete');

  if (oldArmsStart !== -1 && oldHeadStart !== -1) {
    const newArmsSection = `// 4. Pro Athletic Arms with Compression Sleeves & Gold Wristbands
            for (const [arm, elbow, sx] of [[this.armL, this.elbowL, -0.38], [this.armR, this.elbowR, 0.38]]) {
                arm.setPos(sx, 1.66, 0);
                arm.add(at(mk(G.capsule(0.074, 0.42, 12, 4), skin.skin, { skin: true }), 0, -0.17, 0));

                // Spherical Elbow joint
                arm.add(at(mk(G.sphere(0.068, 10, 8), skin.skin, { skin: true }), 0, -0.34, 0));

                if (foot) {
                    // Football: White raglan sleeves with turquoise cuffs
                    arm.add(at(mk(G.cylinder(0.104, 0.092, 0.28, 14), white, { fabric: true }), 0, -0.10, 0));
                    arm.add(at(mk(G.cylinder(0.096, 0.096, 0.035, 14), skin.primary, { fine: true }), 0, -0.23, 0));
                    // Captain's Gold Armband on left arm
                    if (sx < 0) {
                        arm.add(at(mk(G.cylinder(0.098, 0.098, 0.06, 14), 0xf59e0b, { spec: 0.75, shininess: 65, fine: true }), 0, -0.15, 0));
                    }
                } else {
                    // Basketball: Metallic Gold armhole trim
                    arm.add(at(mk(G.cylinder(0.098, 0.098, 0.035, 14), 0xf59e0b, { spec: 0.7, fine: true }), 0, -0.035, 0));
                    // Matte Black Compression Sleeve on left shooting arm
                    if (sx < 0) {
                        arm.add(at(mk(G.cylinder(0.078, 0.072, 0.36, 14), 0x111318, { spec: 0.3 }), 0, -0.17, 0));
                    }
                }

                elbow.setPos(0, -0.34, 0);
                const forearmSkin = (sx < 0 && !foot) ? 0x111318 : skin.skin;
                elbow.add(at(mk(G.capsule(0.066, 0.44, 12, 4), forearmSkin, { skin: (sx >= 0 || foot) }), 0, -0.17, 0));

                // Hands / Wrists: Metallic Gold wristbands on both wrists for Hoops
                if (!foot) {
                    elbow.add(at(mk(G.cylinder(0.075, 0.075, 0.055, 14), 0xf59e0b, { spec: 0.85, shininess: 80, fine: true }), 0, -0.32, 0));
                }
                elbow.add(at(mk(G.sphere(0.074, 10, 8), skin.skin, { skin: true }), 0, -0.40, 0.01));

                arm.add(elbow);
                this.pivot.add(arm);
            }

            `;

    code = code.slice(0, oldArmsStart) + newArmsSection + code.slice(oldHeadStart);
    console.log('✓ Replaced arms section in', filePath);
  }

  // 3. Replace the head section
  const headStart = code.indexOf('// 5. Stylized 3D Human Athlete');
  const headEnd = code.indexOf('this.shadowBlob = new scene_js_3.Node(');

  if (headStart !== -1 && headEnd !== -1) {
    const newHeadSection = `// 5. Stylized 3D Human Hero Athlete: Handsome Pixar/Fortnite Features & Hairstyles
            this.head = new scene_js_3.Node();
            this.head.setPos(0, 2.02, 0);

            // Sculpted cranium with defined athletic jawline
            const skullR = 0.180;
            const skull = mk(G.sphere(skullR, 16, 12), skin.skin, { skin: true });
            skull.scale = [0.94, 1.05, 0.98];
            this.head.add(skull);

            const jawR = 0.124;
            const jaw = mk(G.sphere(jawR, 12, 8), skin.skin, { skin: true });
            this.head.add(at(jaw, 0, -0.085, 0.052));

            // Athletic Cheeks and Ears
            for (const sx of [-1, 1]) {
                this.head.add(at(mk(G.sphere(0.064, 8, 6), skin.skin, { fine: true, skin: true }), sx * 0.098, -0.04, 0.108));
                this.head.add(at(mk(G.sphere(0.040, 8, 6), skin.skin, { fine: true, skin: true }), sx * 0.175, 0.0, 0.0));
            }

            // Expressive Pixar/Fortnite Stylized Eyes (Cyan for Footy, Warm Amber for Hoops)
            const irisCol = foot ? 0x00c4e2 : 0xb45309;
            const eyeX = 0.068;
            const eyeY = 0.024;
            const eyeZ = 0.165;
            const eyeScale = 0.95;

            for (const sx of [-1, 1]) {
                // 1. Sclera
                this.head.add(at(mk(G.sphere(0.046 * eyeScale, 10, 8), white, { fine: true }), sx * eyeX, eyeY, eyeZ));
                // 2. Vibrant Iris
                this.head.add(at(mk(G.sphere(0.028 * eyeScale, 10, 8), irisCol, { fine: true }), sx * eyeX, eyeY, eyeZ + 0.020 * eyeScale));
                // 3. Pupil
                this.head.add(at(mk(G.sphere(0.016 * eyeScale, 8, 6), 0x0a0a0a, { fine: true }), sx * eyeX, eyeY, eyeZ + 0.032 * eyeScale));
                // 4. Double Specular Highlights
                this.head.add(at(mk(G.sphere(0.008 * eyeScale, 6, 6), white, { emissive: white, fine: true }), sx * eyeX + 0.010 * eyeScale, eyeY + 0.010 * eyeScale, eyeZ + 0.039 * eyeScale));

                // Athletic Eyebrows
                const brow = mk(G.box(0.054 * eyeScale, 0.018 * eyeScale, 0.022 * eyeScale), skin.hair, { fine: true });
                brow.rotation = [0, 0, sx < 0 ? -0.16 : 0.16];
                this.head.add(at(brow, sx * eyeX, eyeY + 0.046 * eyeScale, eyeZ + 0.010 * eyeScale));
            }

            // Sculpted Nose
            this.head.add(at(mk(G.box(0.022, 0.048, 0.024), skin.skin, { fine: true, skin: true }), 0, -0.01, 0.194));
            this.head.add(at(mk(G.sphere(0.024, 8, 6), skin.skin, { fine: true, skin: true }), 0, -0.036, 0.204));

            // Confident Athletic Mouth / Smile
            this.head.add(at(mk(G.box(0.064, 0.014, 0.020), 0x7c2d2d, { fine: true }), 0, -0.082, 0.174));

            // Hairstyles & Facial Hair
            if (foot) {
                // FOOTY Striker #10: Volumetric 3D Quiff / Pompadour with clean side taper fade
                const hairBase = mk(G.sphere(0.195, 14, 10), skin.hair, { spec: 0.25 });
                hairBase.scale = [0.96, 0.90, 1.02];
                this.head.add(at(hairBase, 0, 0.065, -0.025));

                const quiff = mk(G.sphere(0.168, 12, 8), skin.hair, { spec: 0.25 });
                quiff.scale = [0.92, 1.15, 1.25];
                this.head.add(at(quiff, 0, 0.115, 0.04));

                const fringe = mk(G.box(0.155, 0.055, 0.06), skin.hair, { spec: 0.25, fine: true });
                fringe.rotation = [0.25, 0, 0];
                this.head.add(at(fringe, 0, 0.095, 0.155));

                for (const sx of [-1, 1]) {
                    this.head.add(at(mk(G.box(0.022, 0.052, 0.035), skin.hair, { fine: true }), sx * 0.152, 0.012, 0.05));
                }
            } else {
                // HOOPS All-Star #23: Sharp High Flat-Top Fade + Trimmed Athletic Beard & Mustache
                const hairBase = mk(G.sphere(0.198, 14, 10), skin.hair, { spec: 0.18 });
                hairBase.scale = [0.96, 0.95, 1.0];
                this.head.add(at(hairBase, 0, 0.075, -0.02));

                // Crisp Flat-Top Cylinder
                const flatTop = mk(G.cylinder(0.186, 0.172, 0.135, 16), skin.hair, { spec: 0.18 });
                this.head.add(at(flatTop, 0, 0.150, 0));

                // Trimmed Athletic Beard & Mustache
                const beard = mk(G.cylinder(0.128, 0.120, 0.075, 14), skin.hair, { fine: true });
                beard.scale = [1, 0.60, 1.12];
                this.head.add(at(beard, 0, -0.088, 0.045));

                const mustache = mk(G.box(0.082, 0.020, 0.025), skin.hair, { fine: true });
                this.head.add(at(mustache, 0, -0.058, 0.185));
            }

            this.pivot.add(this.head);

            `;

    code = code.slice(0, headStart) + newHeadSection + code.slice(headEnd);
    console.log('✓ Replaced head section in', filePath);
  }

  // 4. Update Shorts details in legs loop
  code = code.replace(
    /leg\.add\(at\(mk\(G\.cylinder\(0\.165, 0\.195, 0\.58, 14\), skin\.shorts, \{ fabric: true \}\), 0, -0\.2, 0\)\);[\s\S]*?leg\.add\(at\(mk\(G\.cylinder\(0\.198, 0\.198, 0\.04, 14\), white, \{ fine: true, fabric: true \}\), 0, -0\.47, 0\)\);/,
    `// Basketball: Sleek black basketball shorts with metallic gold chevron side stripes
                    leg.add(at(mk(G.cylinder(0.165, 0.195, 0.58, 14), skin.shorts, { fabric: true }), 0, -0.2, 0));
                    leg.add(at(mk(G.box(0.040, 0.54, 0.22), 0xf59e0b, { spec: 0.7, fabric: true }), sx < 0 ? -0.17 : 0.17, -0.2, 0));
                    leg.add(at(mk(G.cylinder(0.198, 0.198, 0.035, 14), 0xf59e0b, { spec: 0.7, fine: true, fabric: true }), 0, -0.47, 0));`
  );

  fs.writeFileSync(filePath, code, 'utf8');
  console.log('✓ Successfully written all athlete updates to', filePath);
});
