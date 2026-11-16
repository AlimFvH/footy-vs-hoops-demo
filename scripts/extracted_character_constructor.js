class Character {
        constructor(agent, skin, mode, scaleMul = 1, quality = 1) {
            var _a;
            this.agent = agent;
            this.skin = skin;
            this.mode = mode;
            this.root = new scene_js_3.Node();
            this.pivot = new scene_js_3.Node();
            this.legL = new scene_js_3.Node();
            this.legR = new scene_js_3.Node();
            this.kneeL = new scene_js_3.Node();
            this.kneeR = new scene_js_3.Node();
            this.armL = new scene_js_3.Node();
            this.armR = new scene_js_3.Node();
            this.elbowL = new scene_js_3.Node();
            this.elbowR = new scene_js_3.Node();
            this.fine = [];
            this.ringMat = (0, scene_js_3.material)({ color: [1, 1, 1], unlit: true, transparent: true, alpha: 0.9, depthWrite: false, receiveShadow: false, castShadow: false, fog: false });
            this.t = Math.random() * 10;
            this.yaw = 0;
            this.yawInit = false;
            this.pose = {};
            this.prevLift = 0;
            this.landT = 0;
            this.lod = 0;
            const foot = mode === 'footy';
            this.vs = scaleMul * exports.PLAYER_SCALE * (foot ? exports.FOOTY_GROW : 1);
            // Both athletes stand at perfectly balanced 1:1 rival height and athletic stature
            const S = 1.0 * this.vs;
            const sg = quality >= 1 ? 1 : 0;
            const mk = (g, color, o = {}) => {
                var _a, _b;
                const spec = o.spec !== undefined ? o.spec : (o.shoe ? 0.72 : (o.fabric ? 0.40 : (o.skin ? 0.28 : 0.32)));
                const shininess = o.shininess !== undefined ? o.shininess : (o.shoe ? 64 : (o.fabric ? 35 : (o.skin ? 24 : 28)));
                const rim = o.rim !== undefined ? o.rim : (o.fabric ? 0.42 : (o.skin ? 0.38 : 0.28));
                const rimColor = o.rimColor || (o.skin ? [1.0, 0.88, 0.75] : [0.95, 0.98, 1.0]);
                const n = new scene_js_3.Node(g, (0, scene_js_3.material)({
                    color: lin(color),
                    spec: spec,
                    shininess: shininess,
                    rim: rim,
                    rimColor: rimColor,
                    castShadow: true,
                    emissive: o.emissive ? lin(o.emissive, o.emissiveMul || 0.6) : [0, 0, 0]
                }));
                if (o.fine)
                    this.fine.push(n);
                return n;
            };
            const at = (n, x, y, z) => (n.setPos(x, y, z), n);
            const white = 0xf2f4f8;
            const dark = 0x14151a;
            const trim = (_a = skin.accent) !== null && _a !== void 0 ? _a : white;
            this.root.add(this.pivot);
            this.pivot.setScale(S);
            // Character is immediately visible (zero transparency); GLB seamless replaces it on frame 0
            this.pivot.visible = true;
            const sockCol = skin.style === 'hoops' ? skin.secondary : skin.primary;

            // 1. Muscular Legs, Dynamic Pro Shorts, Compression Socks & Authentic Footwear
            for (const [leg, knee, sx] of [[this.legL, this.kneeL, -0.14], [this.legR, this.kneeR, 0.14]]) {
                leg.setPos(sx, 1.03, 0);
                leg.add(at(mk(G.capsule(0.11, 0.55, 14, 4), skin.skin, { skin: true }), 0, -0.22, 0));
                
                // Continuous Spherical Knee Saddle Cap at thigh joint terminus
                leg.add(at(mk(G.sphere(0.093, 12, 8), skin.skin, { skin: true }), 0, -0.47, 0));

                knee.setPos(0, -0.47, 0);
                knee.add(at(mk(G.capsule(0.087, 0.55, 14, 4), skin.skin, { skin: true }), 0, -0.2, 0));
                
                // Anatomical Patella Knee Cap (smoothly contoured on front of knee)
                const patella = mk(G.sphere(0.080, 10, 8), skin.skin, { skin: true, fine: true });
                patella.scale = [0.85, 1.25, 0.45];
                patella.rotation = [-0.15, 0, 0];
                knee.add(at(patella, 0, 0.02, 0.082));
                knee.add(at(mk(G.sphere(0.086, 10, 8), skin.skin, { skin: true }), 0, 0, 0));

                if (foot) {
                    // Football: Athletic shorts with lateral lightning stripe and bottom white hem piping
                    leg.add(at(mk(G.cylinder(0.14, 0.158, 0.36, 14), skin.shorts, { fabric: true }), 0, -0.13, 0));
                    leg.add(at(mk(G.box(0.035, 0.34, 0.16), skin.secondary, { fabric: true }), sx < 0 ? -0.145 : 0.145, -0.13, 0));
                    leg.add(at(mk(G.cylinder(0.162, 0.162, 0.035, 14), white, { fine: true, fabric: true }), 0, -0.295, 0));

                    // Knee-high football compression socks with double white hoop rings
                    knee.add(at(mk(G.cylinder(0.098, 0.088, 0.5, 12), sockCol, { fabric: true }), 0, -0.22, 0));
                    knee.add(at(mk(G.cylinder(0.102, 0.102, 0.03, 12), white, { fine: true }), 0, -0.05, 0));
                    knee.add(at(mk(G.cylinder(0.101, 0.101, 0.03, 12), white, { fine: true }), 0, -0.10, 0));
                    knee.add(at(mk(G.cylinder(0.104, 0.104, 0.06, 12), skin.secondary, { fine: true }), 0, -0.01, 0));

                    // High-performance pro football speed boots with strike zone & chrome stud plate
                    knee.add(at(mk(G.box(0.17, 0.085, 0.3), skin.boots, { shoe: true }), 0, -0.41, 0.06));
                    const toe = mk(G.sphere(0.085, 10, 8), skin.boots, { shoe: true });
                    toe.scale = [1, 0.8, 1.15];
                    knee.add(at(toe, 0, -0.41, 0.2));

                    // Chrome external heel counter cup
                    const heelCounter = mk(G.box(0.165, 0.075, 0.10), skin.secondary, { shoe: true, spec: 0.82, shininess: 85 });
                    knee.add(at(heelCounter, 0, -0.41, -0.06));

                    // Outsole soleplate
                    knee.add(at(mk(G.box(0.18, 0.03, 0.35), dark, { shoe: true }), 0, -0.455, 0.07));
                    knee.add(at(mk(G.box(0.045, 0.05, 0.16), skin.accent, { fine: true, shoe: true }), sx < 0 ? -0.075 : 0.075, -0.405, 0.06));

                    // Instep textured ball strike zone ridges
                    for (let rz = 0; rz < 3; rz++) {
                        const ridge = mk(G.box(0.018, 0.028, 0.052), trim, { fine: true, shoe: true });
                        ridge.rotation = [0.2, 0, sx < 0 ? 0.3 : -0.3];
                        knee.add(at(ridge, sx < 0 ? 0.075 : -0.075, -0.395, 0.09 + rz * 0.045));
                    }

                    // 6 Molded Chrome Studs under outsole (4 forefoot, 2 rear heel) for authentic pitch traction
                    const studMat = { shoe: true, spec: 0.88, shininess: 90 };
                    knee.add(at(mk(G.cylinder(0.015, 0.011, 0.038, 8), dark, studMat), -0.05, -0.48, 0.16));
                    knee.add(at(mk(G.cylinder(0.015, 0.011, 0.038, 8), dark, studMat), 0.05, -0.48, 0.16));
                    knee.add(at(mk(G.cylinder(0.015, 0.011, 0.038, 8), dark, studMat), -0.048, -0.48, 0.07));
                    knee.add(at(mk(G.cylinder(0.015, 0.011, 0.038, 8), dark, studMat), 0.048, -0.48, 0.07));
                    knee.add(at(mk(G.cylinder(0.016, 0.012, 0.040, 8), dark, studMat), -0.042, -0.48, -0.05));
                    knee.add(at(mk(G.cylinder(0.016, 0.012, 0.040, 8), dark, studMat), 0.042, -0.48, -0.05));
                }
                else {
                    // Basketball: Loose long basketball shorts with prominent dual side stripes and split hem
                    leg.add(at(mk(G.cylinder(0.165, 0.195, 0.58, 14), skin.shorts, { fabric: true }), 0, -0.2, 0));
                    leg.add(at(mk(G.box(0.045, 0.56, 0.22), skin.secondary, { fabric: true }), sx < 0 ? -0.17 : 0.17, -0.2, 0));
                    leg.add(at(mk(G.box(0.018, 0.54, 0.225), trim, { fine: true, fabric: true }), sx < 0 ? -0.18 : 0.18, -0.2, 0));
                    leg.add(at(mk(G.cylinder(0.198, 0.198, 0.04, 14), white, { fine: true, fabric: true }), 0, -0.47, 0));

                    // Ribbed crew socks with collegiate dual stripes
                    knee.add(at(mk(G.cylinder(0.096, 0.090, 0.24, 12), white, { fabric: true }), 0, -0.32, 0));
                    knee.add(at(mk(G.cylinder(0.098, 0.098, 0.03, 12), skin.secondary, { fine: true }), 0, -0.24, 0));
                    knee.add(at(mk(G.cylinder(0.097, 0.097, 0.02, 12), skin.primary, { fine: true }), 0, -0.28, 0));

                    // Pro High-Top Basketball Sneaker:
                    // Padded High-top Ankle Collar
                    const collar = mk(G.cylinder(0.106, 0.106, 0.12, 12), skin.boots, { shoe: true });
                    knee.add(at(collar, 0, -0.38, 0.02));

                    // Main Sneaker Upper Body
                    knee.add(at(mk(G.box(0.19, 0.12, 0.32), skin.boots, { shoe: true }), 0, -0.41, 0.06));
                    const toe = mk(G.sphere(0.095, 10, 8), skin.boots, { shoe: true });
                    toe.scale = [1, 0.75, 1.1];
                    knee.add(at(toe, 0, -0.42, 0.21));

                    // Sculpted EVA Foam Midsole with colored heel Air/Gel Cushion window
                    knee.add(at(mk(G.box(0.205, 0.055, 0.37), white, { shoe: true }), 0, -0.455, 0.07));
                    const airWindow = mk(G.box(0.07, 0.03, 0.12), skin.accent, { fine: true, shoe: true, spec: 0.9, shininess: 90 });
                    knee.add(at(airWindow, sx < 0 ? -0.095 : 0.095, -0.455, -0.04));

                    // Grippy Multi-Directional Herringbone Rubber Outsole
                    knee.add(at(mk(G.box(0.21, 0.022, 0.375), dark, { shoe: true }), 0, -0.485, 0.07));
                    knee.add(at(mk(G.box(0.048, 0.06, 0.18), skin.secondary, { fine: true, shoe: true }), sx < 0 ? -0.095 : 0.095, -0.40, 0.06));
                }
                leg.add(knee);
                this.pivot.add(leg);
            }

            // 2. Athletic Hip, Waistband & Drawstring Accent
            const hip = mk(G.cylinder(0.25, 0.27, 0.30, 16), skin.shorts, { fabric: true });
            hip.scale = [1, 1, 0.72];
            this.pivot.add(at(hip, 0, 0.98, 0));
            const waist = mk(G.cylinder(0.255, 0.255, 0.05, 16), skin.secondary, { fine: true, fabric: true });
            waist.scale = [1, 1, 0.72];
            this.pivot.add(at(waist, 0, 1.12, 0));

            // 3. High-Definition Torso & Pro Athletic Jersey (#10 Striker / #23 All-Star)
            this.torso = new scene_js_3.Node();
            this.torso.setPos(0, 1.41, 0);
            const chest = mk(G.cylinder(0.315, 0.218, 0.74, 16), skin.primary, { fabric: true, rim: 0.42 });
            chest.scale = [1, 1, 0.63];
            this.torso.add(chest);

            // Anatomical Pectoral Muscle Shelf (Left & Right pectorals with sternum division)
            for (const sx of [-1, 1]) {
                const pec = mk(G.box(0.123, 0.15, 0.038), skin.primary, { fabric: true, rim: 0.35 });
                pec.rotation = [0.12, sx < 0 ? -0.12 : 0.12, 0];
                this.torso.add(at(pec, sx * 0.12, 0.19, 0.195));
                
                // Latissimus Dorsi flank V-taper
                const lat = mk(G.box(0.038, 0.40, 0.17), skin.primary, { fabric: true });
                lat.rotation = [0, 0, sx < 0 ? 0.12 : -0.12];
                this.torso.add(at(lat, sx * 0.265, -0.04, -0.02));

                // Posterior Scapular contours on back yoke
                const scap = mk(G.box(0.11, 0.16, 0.03), skin.primary, { fabric: true });
                scap.rotation = [-0.1, sx < 0 ? 0.14 : -0.14, 0];
                this.torso.add(at(scap, sx * 0.12, 0.18, -0.195));
            }

            // Muscular Deltoid Shoulders
            for (const sx of [-1, 1])
                this.torso.add(at(mk(G.sphere(0.13, 12, 8), foot ? skin.primary : skin.skin, { fabric: foot, skin: !foot }), sx * 0.318, 0.29, 0));

            if (!foot) {
                // Basketball Tank Top: Contrasting side flank stripes and ribbed scoop neckline
                for (const sx of [-1, 1]) {
                    this.torso.add(at(mk(G.box(0.045, 0.62, 0.24), skin.secondary, { fabric: true, rim: 0.38 }), sx * 0.26, -0.02, 0));
                    this.torso.add(at(mk(G.box(0.018, 0.60, 0.245), trim, { fine: true }), sx * 0.275, -0.02, 0));
                }
                const hem = at(mk(G.cylinder(0.228, 0.228, 0.05, 16), skin.secondary, { fine: true, fabric: true }), 0, -0.34, 0);
                hem.scale = [1, 1, 0.64];
                this.torso.add(hem);
                const hoopCollar = mk(G.cylinder(0.125, 0.138, 0.05, 14), white, { fabric: true, fine: true });
                this.torso.add(at(hoopCollar, 0, 0.37, 0));

                // Front Official FOOTY vs HOOPS Chest Emblem Badge for Basketball
                const hoopsBadgeBack = mk(G.cylinder(0.068, 0.068, 0.015, 16), 0x0a0f1a, { spec: 0.7, fine: true });
                const hoopsBadgeRing = mk(G.cylinder(0.071, 0.071, 0.008, 16), 0xf97316, { fine: true, emissive: 0xf97316, emissiveMul: 0.5 });
                const hoopsHalfWhite = mk(G.cylinder(0.058, 0.058, 0.018, 14), white, { fine: true });
                const hoopsHalfOrange = mk(G.box(0.058, 0.116, 0.020), 0xff6b00, { fine: true });
                const hoopsDivider = mk(G.box(0.012, 0.125, 0.024), white, { fine: true });
                hoopsDivider.rotation = [0, 0, 0.45];
                this.torso.add(at(hoopsBadgeBack, 0, 0.04, 0.205), at(hoopsBadgeRing, 0, 0.04, 0.206), at(hoopsHalfWhite, 0, 0.04, 0.21), at(hoopsHalfOrange, 0.029, 0.04, 0.212), at(hoopsDivider, 0, 0.04, 0.214));

                // 3D SQUAD NUMBER #23 ON JERSEY BACK (Visible in in-game matches!)
                const num23Node = build3DNumber('23', trim, skin.secondary, this.fine);
                num23Node.rotation = [0, Math.PI, 0];
                this.torso.add(at(num23Node, 0, 0.05, -0.21));
            }
            else {
                // Football: Ribbed V-neck collar, dynamic kit accents, and Golden Club Shield
                const collar = mk(G.cylinder(0.11, 0.125, 0.06, 14), skin.secondary, { fabric: true, fine: true });
                this.torso.add(at(collar, 0, 0.375, 0));
                const collarTrim = mk(G.cylinder(0.114, 0.128, 0.02, 14), trim, { fabric: true, fine: true });
                this.torso.add(at(collarTrim, 0, 0.39, 0));

                // Dynamic V-Chevron Kit Accent across chest
                const chevL = mk(G.box(0.13, 0.045, 0.03), skin.secondary, { fabric: true });
                chevL.rotation = [0, 0, 0.36];
                const chevR = mk(G.box(0.13, 0.045, 0.03), skin.secondary, { fabric: true });
                chevR.rotation = [0, 0, -0.36];
                this.torso.add(at(chevL, -0.062, 0.15, 0.205), at(chevR, 0.062, 0.15, 0.205));

                // Dynamic front aerodynamic kit stripe
                const centerStripe = mk(G.box(0.05, 0.26, 0.02), trim, { fabric: true, fine: true });
                this.torso.add(at(centerStripe, 0, -0.02, 0.205));

                // Front Official FOOTY vs HOOPS Chest Emblem Badge for Football
                const footyBadgeBack = mk(G.cylinder(0.055, 0.055, 0.015, 16), 0x0a0f1a, { spec: 0.7, fine: true });
                const footyBadgeRing = mk(G.cylinder(0.058, 0.058, 0.008, 16), 0x00f0ff, { fine: true, emissive: 0x00f0ff, emissiveMul: 0.5 });
                const footyHalfWhite = mk(G.cylinder(0.046, 0.046, 0.018, 14), white, { fine: true });
                const footyHalfOrange = mk(G.box(0.046, 0.092, 0.020), 0xff6b00, { fine: true });
                const footyDivider = mk(G.box(0.010, 0.100, 0.024), white, { fine: true });
                footyDivider.rotation = [0, 0, 0.45];
                this.torso.add(at(footyBadgeBack, 0.12, 0.16, 0.205), at(footyBadgeRing, 0.12, 0.16, 0.206), at(footyHalfWhite, 0.12, 0.16, 0.21), at(footyHalfOrange, 0.143, 0.16, 0.212), at(footyDivider, 0.12, 0.16, 0.214));

                // 3D SQUAD NUMBER #10 ON JERSEY BACK (Or #1 for Keeper)
                const isKeeper = agent && agent.role === 'keeper';
                const squadNum = isKeeper ? '1' : '10';
                const numNode = build3DNumber(squadNum, trim, skin.secondary, this.fine);
                numNode.rotation = [0, Math.PI, 0];
                this.torso.add(at(numNode, 0, 0.05, -0.21));
            }

            // Defined Athletic Neck
            this.torso.add(at(mk(G.cylinder(0.068, 0.076, 0.13, 12), skin.skin, { skin: true }), 0, 0.42, 0));

            // Clean Athletic Back Yoke and Aerodynamic Trim
            this.torso.add(at(mk(G.box(0.24, 0.055, 0.02), trim, { fine: true, fabric: true }), 0, 0.24, -0.195));
            this.torso.add(at(mk(G.box(0.05, 0.42, 0.02), skin.secondary, { fine: true, fabric: true }), 0, 0.02, -0.20));

            // Custom pattern rendering for equipped skin styles
            if (skin.style !== 'plain') {
                const band = (y, rz = 0) => {
                    const bd = mk(G.cylinder(0.265, 0.255, 0.11, 14), skin.secondary, { fabric: true });
                    bd.scale = [1, 1, 0.65];
                    bd.setPos(0, y, 0);
                    bd.rotation = [0, 0, rz];
                    return bd;
                };
                if (skin.style === 'stripes') {
                    // Triple vertical pro racing stripes down chest
                    for (const sx of [-0.09, 0, 0.09]) {
                        const strp = mk(G.box(0.04, 0.68, 0.022), skin.secondary, { fabric: true });
                        this.torso.add(at(strp, sx, 0, 0.202));
                    }
                }
                else if (skin.style === 'hoops') {
                    this.torso.add(band(0.1), band(-0.14));
                }
                else if (skin.style === 'sash') {
                    // Bold diagonal athletic sash across torso
                    const sashFront = mk(G.box(0.38, 0.08, 0.022), skin.secondary, { fabric: true });
                    sashFront.rotation = [0, 0, -0.65];
                    this.torso.add(at(sashFront, 0, 0.02, 0.204));
                    const sashBack = mk(G.box(0.38, 0.08, 0.022), skin.secondary, { fabric: true });
                    sashBack.rotation = [0, 0, 0.65];
                    this.torso.add(at(sashBack, 0, 0.02, -0.204));
                }
                else {
                    this.torso.add(band(0.0, 0.55));
                }
            }
            this.pivot.add(this.torso);

            // 4. Athletic Arms: Short Sleeves with Cuffs, Elbow Saddle Caps & Forearms
            for (const [arm, elbow, sx] of [[this.armL, this.elbowL, -0.38], [this.armR, this.elbowR, 0.38]]) {
                arm.setPos(sx, 1.66, 0);
                arm.add(at(mk(G.capsule(0.072, 0.41, 12, 4), skin.skin, { skin: true }), 0, -0.17, 0));
                
                // Continuous Spherical Elbow Saddle Cap at joint pivot
                arm.add(at(mk(G.sphere(0.068, 10, 8), skin.skin, { skin: true }), 0, -0.34, 0));

                if (foot) {
                    // Football: Sleeves with contrasting cuffs
                    arm.add(at(mk(G.cylinder(0.102, 0.090, 0.27, 12), skin.primary, { fabric: true }), 0, -0.1, 0));
                    arm.add(at(mk(G.cylinder(0.098, 0.098, 0.035, 12), white, { fine: true }), 0, -0.23, 0));
                    arm.add(at(mk(G.cylinder(0.094, 0.094, 0.025, 12), skin.secondary, { fine: true }), 0, -0.25, 0));
                    // Captain's Armband on left arm
                    if (sx < 0) {
                        arm.add(at(mk(G.cylinder(0.096, 0.096, 0.055, 12), 0xf6c445, { spec: 0.5, fine: true }), 0, -0.15, 0));
                    }
                }
                else {
                    // Basketball: Sleeveless armhole trim
                    arm.add(at(mk(G.cylinder(0.098, 0.098, 0.04, 12), white, { fine: true }), 0, -0.04, 0));
                    // Compression shooting sleeve on right arm
                    if (sx > 0) {
                        arm.add(at(mk(G.cylinder(0.078, 0.072, 0.30, 12), dark, { spec: 0.35 }), 0, -0.16, 0));
                    }
                }
                elbow.setPos(0, -0.34, 0);
                elbow.add(at(mk(G.capsule(0.064, 0.43, 12, 4), skin.skin, { skin: true }), 0, -0.17, 0));
                
                // Olecranon posterior elbow contour
                elbow.add(at(mk(G.sphere(0.055, 8, 6), skin.skin, { fine: true, skin: true }), 0, 0.015, -0.065));
                elbow.add(at(mk(G.sphere(0.072, 9, 6), skin.skin, { fine: true, skin: true }), 0, -0.4, 0.01));
                if (!foot)
                    elbow.add(at(mk(G.cylinder(0.072, 0.072, 0.055, 12), skin.secondary, { fine: true }), 0, -0.32, 0));
                arm.add(elbow);
                this.pivot.add(arm);
            }

            // 5. Stylized 3D Human Athlete: Expressive Eyes, Athletic Features & Hair
            this.head = new scene_js_3.Node();
            this.head.setPos(0, 2.02, 0);

            // Sculpted cranium and athletic tapered jaw
            const skullR = 0.178;
            const skull = mk(G.sphere(skullR, 16, 12), skin.skin, { skin: true });
            skull.scale = [0.94, 1.05, 0.98];
            this.head.add(skull);

            const jawR = 0.122;
            const jaw = mk(G.sphere(jawR, 12, 8), skin.skin, { skin: true });
            this.head.add(at(jaw, 0, -0.085, 0.052));

            // Athletic Cheeks and Ears
            for (const sx of [-1, 1]) {
                // Cheeks
                this.head.add(at(mk(G.sphere(0.063, 8, 6), skin.skin, { fine: true, skin: true }), sx * 0.098, -0.04, 0.108));
                // Ears
                this.head.add(at(mk(G.sphere(0.039, 8, 6), skin.skin, { fine: true, skin: true }), sx * 0.175, 0.0, 0.0));
                this.head.add(at(mk(G.sphere(0.023, 6, 5), dark, { fine: true }), sx * 0.179, 0.0, 0.0));

                // Sculpted Zygomatic Arch & Athletic Mandible Contour
                const zygoma = mk(G.box(0.040, 0.024, 0.026), skin.skin, { fine: true, skin: true });
                zygoma.rotation = [0, sx < 0 ? 0.22 : -0.22, sx < 0 ? -0.15 : 0.15];
                this.head.add(at(zygoma, sx * 0.116, -0.02, 0.120));
            }

            // Expressive 3D Athlete Eyes
            const irisCol = foot ? 0x00b4d8 : 0x78350f;
            const eyeX = 0.068;
            const eyeY = 0.022;
            const eyeZ = 0.165;
            const eyeScale = 0.92;
            for (const sx of [-1, 1]) {
                // 1. White Eye Sclera
                this.head.add(at(mk(G.sphere(0.045 * eyeScale, 10, 8), white, { fine: true }), sx * eyeX, eyeY, eyeZ));
                // 2. Vibrant Colored Iris
                this.head.add(at(mk(G.sphere(0.027 * eyeScale, 10, 8), irisCol, { fine: true }), sx * eyeX, eyeY, eyeZ + 0.020 * eyeScale));
                // 3. Deep Black Pupil
                this.head.add(at(mk(G.sphere(0.016 * eyeScale, 8, 6), 0x0a0a0a, { fine: true }), sx * eyeX, eyeY, eyeZ + 0.032 * eyeScale));
                // 4. Specular Highlight Glint
                this.head.add(at(mk(G.sphere(0.007 * eyeScale, 6, 6), white, { emissive: white, fine: true }), sx * eyeX + 0.009 * eyeScale, eyeY + 0.010 * eyeScale, eyeZ + 0.039 * eyeScale));

                // Determined Athletic Eyebrows
                const brow = mk(G.box(0.052 * eyeScale, 0.016 * eyeScale, 0.022 * eyeScale), skin.hair, { fine: true });
                brow.rotation = [0, 0, sx < 0 ? -0.16 : 0.16];
                this.head.add(at(brow, sx * eyeX, eyeY + 0.044 * eyeScale, eyeZ + 0.010 * eyeScale));
            }

            // Sculpted Athletic Nose
            this.head.add(at(mk(G.box(0.022, 0.048, 0.024), skin.skin, { fine: true, skin: true }), 0, -0.01, 0.194));
            this.head.add(at(mk(G.sphere(0.024, 8, 6), skin.skin, { fine: true, skin: true }), 0, -0.036, 0.204));

            // Confident Athletic Smile / Mouth
            this.head.add(at(mk(G.box(0.062, 0.014, 0.020), 0x8b3a3a, { fine: true }), 0, -0.082, 0.174));

            // Stylized 3D Hair and Authentic Sports Headwear
            if (foot) {
                // Football: Modern athletic crop fade with 3D swept fringe and sideburns
                const hairBase = mk(G.sphere(0.192, 14, 10), skin.hair, { spec: 0.22 });
                hairBase.scale = [0.96, 0.90, 1.02];
                this.head.add(at(hairBase, 0, 0.055, -0.025));
                const hairTop = mk(G.sphere(0.165, 12, 8), skin.hair, { spec: 0.22 });
                this.head.add(at(hairTop, 0, 0.095, 0.01));
                const hairFringe = mk(G.box(0.155, 0.055, 0.048), skin.hair, { spec: 0.25, fine: true });
                hairFringe.rotation = [0.15, 0, 0];
                this.head.add(at(hairFringe, 0, 0.076, 0.145));
                for (const sx of [-1, 1]) {
                    this.head.add(at(mk(G.box(0.022, 0.052, 0.035), skin.hair, { fine: true }), sx * 0.152, 0.012, 0.05));
                }
            }
            else {
                // Basketball: Authentic high-fade taper and sports cotton headband
                const hairBase = mk(G.sphere(0.198, 14, 10), skin.hair, { spec: 0.18 });
                hairBase.scale = [0.96, 0.95, 1.0];
                this.head.add(at(hairBase, 0, 0.075, -0.02));
                const hairTop = mk(G.box(0.20, 0.085, 0.24), skin.hair, { spec: 0.18 });
                this.head.add(at(hairTop, 0, 0.130, 0.01));

                // Authentic cotton athletic headband with embroidered logo patch
                const hb = mk(G.cylinder(0.208, 0.208, 0.062, 16), 0xff6b00, { spec: 0.15, fine: true });
                const hbLogo = mk(G.box(0.052, 0.036, 0.022), white, { fine: true });
                this.head.add(at(hb, 0, 0.078, 0), at(hbLogo, 0, 0.078, 0.208));
            }
            this.pivot.add(this.head);
            this.shadowBlob = new scene_js_3.Node(G.plane(1.5 * this.vs, 1.5 * this.vs), (0, scene_js_3.material)({ color: [1, 1, 1], texture: shadowBlobTexture(), unlit: true, transparent: true, alpha: 0.9, depthWrite: false, receiveShadow: false, castShadow: false, fog: false }));
            this.shadowBlob.setPos(0, 0.015, 0);
            this.ring = new scene_js_3.Node(geo.ring, this.ringMat);
            this.ring.setPos(0, 0.03, 0);
            this.ring.setScale(this.vs);
            this.marker = new scene_js_3.Node();
            this.chevron = new scene_js_3.Node(geo.chevron, (0, scene_js_3.material)({ color: [1, 0.95, 0.4], emissive: [1, 0.9, 0.3], unlit: true, receiveShadow: false, castShadow: false, fog: false }));
            this.chevron.rotation = [Math.PI, 0, 0];
            this.chevron.setPos(0, 2.9 * S + 0.3, 0);
            this.marker.add(this.chevron);
            this.root.add(this.ring, this.marker);
            this.ring.visible = agent.human;
            this.marker.visible = agent.human;
            this.shadowBlob.visible = true;
            this.root.add(this.shadowBlob);
            this.ringMat.color = agent.human ? [0.2, 1, 0.7] : [1, 1, 1];
        }
        