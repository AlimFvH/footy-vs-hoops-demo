const fs = require('fs');

const gameJsPath = 'js/game.js';
let code = fs.readFileSync(gameJsPath, 'utf8');

const startMarker = '            const sg = quality >= 1 ? 1 : 0;\n            const mk = (g, color, o = {}) => {';
const endMarker = '            this.pivot.add(this.head);\n            this.shadowBlob = new scene_js_3.Node';

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Failed to locate markers in js/game.js:', { startIndex, endIndex });
  process.exit(1);
}

const newBody = `            const sg = quality >= 1 ? 1 : 0;
            const mk = (g, color, o = {}) => {
                var _a, _b;
                const spec = o.spec !== undefined ? o.spec : (o.shoe ? 0.65 : (o.fabric ? 0.35 : 0.22));
                const shininess = o.shininess !== undefined ? o.shininess : (o.shoe ? 48 : (o.fabric ? 28 : 20));
                const rim = o.rim !== undefined ? o.rim : (o.fabric ? 0.35 : 0.24);
                const rimColor = o.rimColor || (o.skin ? [1.0, 0.9, 0.8] : [0.92, 0.96, 1.0]);
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
            const sockCol = skin.style === 'hoops' ? skin.secondary : skin.primary;

            // 1. Muscular Legs, Dynamic Pro Shorts, Compression Socks & Authentic Footwear
            for (const [leg, knee, sx] of [[this.legL, this.kneeL, -0.14], [this.legR, this.kneeR, 0.14]]) {
                leg.setPos(sx, 0.95, 0);
                leg.add(at(mk(G.capsule(0.105, 0.52, 8 + 2 * sg, 3), skin.skin, { skin: true }), 0, -0.22, 0));
                knee.setPos(0, -0.47, 0);
                knee.add(at(mk(G.capsule(0.082, 0.52, 8, 3), skin.skin, { skin: true }), 0, -0.2, 0));
                if (foot) {
                    // Football: Athletic shorts with lateral lightning stripe and bottom white hem piping
                    leg.add(at(mk(G.cylinder(0.14, 0.158, 0.36, 9 + sg), skin.shorts, { fabric: true }), 0, -0.13, 0));
                    leg.add(at(mk(G.box(0.035, 0.34, 0.16), skin.secondary, { fabric: true }), sx < 0 ? -0.145 : 0.145, -0.13, 0));
                    leg.add(at(mk(G.cylinder(0.162, 0.162, 0.035, 10), white, { fine: true, fabric: true }), 0, -0.295, 0));

                    // Knee-high football compression socks with double white hoop rings
                    knee.add(at(mk(G.cylinder(0.098, 0.088, 0.5, 8 + sg), sockCol, { fabric: true }), 0, -0.22, 0));
                    knee.add(at(mk(G.cylinder(0.102, 0.102, 0.03, 8), white, { fine: true }), 0, -0.05, 0));
                    knee.add(at(mk(G.cylinder(0.101, 0.101, 0.03, 8), white, { fine: true }), 0, -0.10, 0));
                    knee.add(at(mk(G.cylinder(0.104, 0.104, 0.06, 8), skin.secondary, { fine: true }), 0, -0.01, 0));

                    // High-performance pro football cleats with aerodynamic speed swoosh and chrome stud plate
                    knee.add(at(mk(G.box(0.17, 0.085, 0.3), skin.boots, { shoe: true }), 0, -0.41, 0.06));
                    const toe = mk(G.sphere(0.085, 8, 6), skin.boots, { shoe: true });
                    toe.scale = [1, 0.8, 1.15];
                    knee.add(at(toe, 0, -0.41, 0.2));
                    knee.add(at(mk(G.box(0.18, 0.03, 0.34), dark, { shoe: true }), 0, -0.455, 0.07));
                    knee.add(at(mk(G.box(0.045, 0.05, 0.16), skin.accent, { fine: true, shoe: true }), sx < 0 ? -0.075 : 0.075, -0.405, 0.06));
                }
                else {
                    // Basketball: Loose long basketball shorts with prominent dual side stripes and split hem
                    leg.add(at(mk(G.cylinder(0.17, 0.2, 0.62, 9 + sg), skin.shorts, { fabric: true }), 0, -0.2, 0));
                    leg.add(at(mk(G.box(0.05, 0.58, 0.22), skin.secondary, { fabric: true }), sx < 0 ? -0.175 : 0.175, -0.2, 0));
                    leg.add(at(mk(G.box(0.02, 0.56, 0.225), trim, { fine: true, fabric: true }), sx < 0 ? -0.185 : 0.185, -0.2, 0));
                    leg.add(at(mk(G.cylinder(0.204, 0.204, 0.04, 10), white, { fine: true, fabric: true }), 0, -0.47, 0));

                    // Ribbed white crew socks
                    knee.add(at(mk(G.cylinder(0.094, 0.088, 0.18, 8), white, { fabric: true }), 0, -0.35, 0));
                    knee.add(at(mk(G.cylinder(0.096, 0.096, 0.035, 8), skin.secondary, { fine: true }), 0, -0.28, 0));

                    // Chunky High-Top Basketball Sneakers with thick white EVA midsole cushion & colored tread
                    knee.add(at(mk(G.box(0.19, 0.13, 0.31), skin.boots, { shoe: true }), 0, -0.39, 0.05));
                    const toe = mk(G.sphere(0.095, 8, 6), skin.boots, { shoe: true });
                    toe.scale = [1, 0.75, 1.1];
                    knee.add(at(toe, 0, -0.41, 0.2));
                    // Thick sculpted white EVA midsole
                    knee.add(at(mk(G.box(0.205, 0.06, 0.36), white, { shoe: true }), 0, -0.455, 0.07));
                    // Grippy colored outsole tread
                    knee.add(at(mk(G.box(0.21, 0.025, 0.37), skin.boots, { shoe: true }), 0, -0.485, 0.07));
                    knee.add(at(mk(G.box(0.05, 0.07, 0.2), skin.accent, { fine: true, shoe: true }), sx < 0 ? -0.098 : 0.098, -0.39, 0.05));
                }
                leg.add(knee);
                this.pivot.add(leg);
            }

            // 2. Athletic Hip, Waistband & Drawstring Accent
            const hip = mk(G.cylinder(0.25, 0.27, foot ? 0.24 : 0.34, 10 + 2 * sg), skin.shorts, { fabric: true });
            hip.scale = [1, 1, 0.72];
            this.pivot.add(at(hip, 0, foot ? 0.99 : 0.97, 0));
            const waist = mk(G.cylinder(0.255, 0.255, 0.05, 10), skin.secondary, { fine: true, fabric: true });
            waist.scale = [1, 1, 0.72];
            this.pivot.add(at(waist, 0, foot ? 1.1 : 1.14, 0));

            // 3. High-Definition Torso & Pro Athletic Jersey (#10 Striker / #23 All-Star)
            this.torso = new scene_js_3.Node();
            this.torso.setPos(0, 1.38, 0);
            const chest = mk(G.cylinder(foot ? 0.3 : 0.31, 0.215, 0.72, 10 + 2 * sg), skin.primary, { fabric: true, rim: 0.35 });
            chest.scale = [1, 1, 0.64];
            this.torso.add(chest);

            // Muscular Deltoid Shoulders
            for (const sx of [-1, 1])
                this.torso.add(at(mk(G.sphere(0.125, 8, 6), foot ? skin.primary : skin.skin, { fabric: foot, skin: !foot }), sx * 0.31, 0.29, 0));

            if (!foot) {
                // Basketball Tank Top: Contrasting side flank stripes and ribbed scoop neckline
                for (const sx of [-1, 1]) {
                    this.torso.add(at(mk(G.box(0.045, 0.62, 0.24), skin.secondary, { fabric: true, rim: 0.3 }), sx * 0.26, -0.02, 0));
                    this.torso.add(at(mk(G.box(0.018, 0.60, 0.245), trim, { fine: true }), sx * 0.275, -0.02, 0));
                }
                const hem = at(mk(G.cylinder(0.228, 0.228, 0.05, 10), skin.secondary, { fine: true, fabric: true }), 0, -0.34, 0);
                hem.scale = [1, 1, 0.64];
                this.torso.add(hem);
                const hoopCollar = mk(G.cylinder(0.125, 0.138, 0.05, 10), white, { fabric: true, fine: true });
                this.torso.add(at(hoopCollar, 0, 0.37, 0));

                // Front Collegiate #23 squad number plate for Basketball
                const hoopsNum = mk(G.box(0.14, 0.15, 0.025), white, { fine: true });
                const hoopsNumCore = mk(G.box(0.09, 0.10, 0.03), 0x9a3412, { fine: true });
                this.torso.add(at(hoopsNum, 0, 0.02, 0.205), at(hoopsNumCore, 0, 0.02, 0.21));
            }
            else {
                // Football: Ribbed V-neck collar, dynamic V-chevron kit stripes, and Golden Club Shield
                const collar = mk(G.cylinder(0.11, 0.125, 0.06, 10), skin.secondary, { fabric: true, fine: true });
                this.torso.add(at(collar, 0, 0.375, 0));
                const collarTrim = mk(G.cylinder(0.114, 0.128, 0.02, 10), trim, { fabric: true, fine: true });
                this.torso.add(at(collarTrim, 0, 0.39, 0));

                // Dynamic V-Chevron Kit Accent across chest
                const chevL = mk(G.box(0.13, 0.045, 0.03), skin.secondary, { fabric: true });
                chevL.rotation = [0, 0, 0.36];
                const chevR = mk(G.box(0.13, 0.045, 0.03), skin.secondary, { fabric: true });
                chevR.rotation = [0, 0, -0.36];
                this.torso.add(at(chevL, -0.062, 0.15, 0.205), at(chevR, 0.062, 0.15, 0.205));

                // Front #10 squad number plate
                const numPlate = mk(G.box(0.13, 0.14, 0.025), white, { fine: true });
                const numCore = mk(G.box(0.08, 0.09, 0.03), dark, { fine: true });
                this.torso.add(at(numPlate, 0, -0.02, 0.205), at(numCore, 0, -0.02, 0.21));

                // Golden Club Crest on left chest
                this.torso.add(at(mk(G.cylinder(0.045, 0.045, 0.02, 6), 0xf6c445, { spec: 0.6, fine: true }), 0.12, 0.16, 0.21));
            }

            // Defined Athletic Neck
            this.torso.add(at(mk(G.cylinder(0.068, 0.076, 0.13, 8), skin.skin, { skin: true }), 0, 0.42, 0));

            // Back Squad Number & Nameplate Bar (High Contrast)
            this.torso.add(at(mk(G.box(0.22, 0.28, 0.02), trim, { fabric: true }), 0, 0.06, -0.2));
            this.torso.add(at(mk(G.box(0.12, 0.06, 0.025), dark, { fine: true }), 0, 0.06, -0.205));
            this.torso.add(at(mk(G.box(0.08, 0.14, 0.025), dark, { fine: true }), 0, -0.02, -0.205));
            this.torso.add(at(mk(G.box(0.24, 0.045, 0.022), white, { fine: true }), 0, 0.24, -0.195));

            if (skin.style !== 'plain') {
                const band = (y, rz = 0) => {
                    const bd = mk(G.cylinder(0.265, 0.255, 0.11, 10), skin.secondary, { fabric: true });
                    bd.scale = [1, 1, 0.65];
                    bd.setPos(0, y, 0);
                    bd.rotation = [0, 0, rz];
                    return bd;
                };
                if (skin.style === 'stripes') {
                    const b1 = mk(G.box(0.1, 0.7, 0.4), skin.secondary, { fabric: true });
                    b1.scale = [1, 0.95, 0.86];
                    this.torso.add(b1);
                }
                else if (skin.style === 'hoops')
                    this.torso.add(band(0.1), band(-0.14));
                else
                    this.torso.add(band(0.0, 0.55));
            }
            this.pivot.add(this.torso);

            // 4. Athletic Arms: Short Sleeves with Cuffs, Captain's Armband, Compression Sleeve & Wristbands
            for (const [arm, elbow, sx] of [[this.armL, this.elbowL, -0.38], [this.armR, this.elbowR, 0.38]]) {
                arm.setPos(sx, 1.65, 0);
                arm.add(at(mk(G.capsule(0.07, 0.4, 8, 3), skin.skin, { skin: true }), 0, -0.17, 0));
                if (foot) {
                    // Football: Sleeves with contrasting cuffs
                    arm.add(at(mk(G.cylinder(0.098, 0.088, 0.26, 8), skin.primary, { fabric: true }), 0, -0.1, 0));
                    arm.add(at(mk(G.cylinder(0.096, 0.096, 0.035, 8), white, { fine: true }), 0, -0.225, 0));
                    arm.add(at(mk(G.cylinder(0.092, 0.092, 0.025, 8), skin.secondary, { fine: true }), 0, -0.245, 0));
                    // Captain's Armband on left arm
                    if (sx < 0) {
                        arm.add(at(mk(G.cylinder(0.095, 0.095, 0.055, 8), 0xf6c445, { spec: 0.5, fine: true }), 0, -0.15, 0));
                    }
                }
                else {
                    // Basketball: Sleeveless armhole trim
                    arm.add(at(mk(G.cylinder(0.098, 0.098, 0.04, 8), white, { fine: true }), 0, -0.04, 0));
                    // Compression shooting sleeve on right arm
                    if (sx > 0) {
                        arm.add(at(mk(G.cylinder(0.078, 0.072, 0.30, 8), dark, { spec: 0.35 }), 0, -0.16, 0));
                    }
                }
                elbow.setPos(0, -0.34, 0);
                elbow.add(at(mk(G.capsule(0.062, 0.42, 8, 3), skin.skin, { skin: true }), 0, -0.17, 0));
                elbow.add(at(mk(G.sphere(0.072, 7, 5), skin.skin, { fine: true, skin: true }), 0, -0.4, 0.01));
                if (!foot)
                    elbow.add(at(mk(G.cylinder(0.072, 0.072, 0.055, 8), skin.secondary, { fine: true }), 0, -0.32, 0));
                arm.add(elbow);
                this.pivot.add(arm);
            }

            // 5. Head, Facial Structure, Cyber-Visor & Headband
            this.head = new scene_js_3.Node();
            this.head.setPos(0, 1.99, 0);
            const skull = mk(G.sphere(0.2, 12 + 2 * sg, 9), skin.skin, { skin: true });
            skull.scale = [0.95, 1.07, 1];
            this.head.add(skull);
            const jaw = mk(G.sphere(0.15, 8, 6), skin.skin, { skin: true });
            this.head.add(at(jaw, 0, -0.1, 0.05));
            const style = this.agent.id % 3;
            const hair = mk(G.sphere(0.215, 10, 7), skin.hair, { spec: 0.15 });
            hair.scale = style === 2 ? [0.96, 0.62, 0.98] : [1.0, style === 1 ? 0.95 : 0.8, 1.0];
            this.head.add(at(hair, 0, style === 2 ? 0.09 : 0.06, -0.035));
            for (const sx of [-1, 1]) {
                this.head.add(at(mk(G.sphere(0.04, 6, 4), skin.skin, { fine: true, skin: true }), sx * 0.19, -0.01, 0));
                this.head.add(at(mk(G.box(0.045, 0.03, 0.02), dark, { fine: true }), sx * 0.075, 0.0, 0.19));
            }
            this.head.add(at(mk(G.box(0.04, 0.05, 0.03), skin.skin, { fine: true, skin: true }), 0, -0.04, 0.2));

            if (foot) {
                // Football: Futuristic glowing cyber-visor
                const visor = mk(G.box(0.16, 0.045, 0.04), 0x00f0ff, { spec: 0.9, emissive: 0x00f0ff, emissiveMul: 0.8, fine: true });
                this.head.add(at(visor, 0, 0.005, 0.195));
            }
            else {
                // Basketball: Signature fiery orange headband with embroidered logo patch
                const hb = mk(G.cylinder(0.218, 0.218, 0.065, 12), 0xff6b00, { spec: 0.4, fine: true });
                const hbLogo = mk(G.box(0.06, 0.04, 0.02), white, { fine: true });
                this.head.add(at(hb, 0, 0.08, 0), at(hbLogo, 0, 0.08, 0.215));
            }
`;

const updatedCode = code.slice(0, startIndex) + newBody + code.slice(endIndex);
fs.writeFileSync(gameJsPath, updatedCode, 'utf8');
console.log('Successfully updated Character 3D models in js/game.js!');
