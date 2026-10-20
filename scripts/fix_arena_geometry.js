const fs = require('fs');
const path = require('path');

const gameJsPath = path.join(__dirname, '..', 'js', 'game.js');
let content = fs.readFileSync(gameJsPath, 'utf8');

// Find start of buildFootyArena and end of buildCourtArena
const startMark = '    function buildFootyArena(t, quality) {';
const endMark = '    function buildCourtArena(t, quality) {';

const startIndex = content.indexOf(startMark);
if (startIndex === -1) {
    console.error('Could not find buildFootyArena in js/game.js');
    process.exit(1);
}

const courtIndex = content.indexOf(endMark, startIndex);
if (courtIndex === -1) {
    console.error('Could not find buildCourtArena in js/game.js');
    process.exit(1);
}

// Find end of buildCourtArena: it ends with `    }\r\n});` or `    }\n});`
const closeDefineIndex = content.indexOf('\n});\ndefine("render/camera"', courtIndex);
if (closeDefineIndex === -1) {
    console.error('Could not find end of render/arena in js/game.js');
    process.exit(1);
}

const replacement = `    function buildFootyArena(t, quality) {
        const root = new scene_js_1.Node();
        const { W, L, GW, GH, GD, POST_R } = football_js_2.FB;
        const isDefault = Boolean(t && (t.isDefault || t.id === 'std_footy_classic' || t.id === 'std_footy_night'));
        const groundCol = (0, math_js_6.rgb)(t && t.floor ? t.floor : (t && t.hemiGround ? t.hemiGround : 0x0b1220));
        const ground = new scene_js_1.Node(G.plane(400, 400), (0, scene_js_1.material)({ color: groundCol, receiveShadow: false, fog: true }));
        ground.setPos(0, -0.06, 0);

        const [pw, pd] = (0, textures_js_1.pitchPlaneSize)();
        const pitch = new scene_js_1.Node(G.plane(pw, pd), (0, scene_js_1.material)({ texture: new scene_js_1.Texture((0, textures_js_1.makePitchTexture)(t), { mipmap: true, srgb: true }), receiveShadow: true, spec: 0.05 }));
        root.add(ground, pitch);

        const postMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xf4f6f8), spec: 0.7, shininess: 70, rim: 0.2, castShadow: true });
        const netTex = new scene_js_1.Texture((0, textures_js_1.makeNetTexture)(), { repeat: true, mipmap: true, srgb: true });
        const mkNet = (w, h, ux, uy) => new scene_js_1.Node(G.quad(w, h), (0, scene_js_1.material)({ texture: netTex, transparent: true, alpha: 0.85, doubleSided: true, depthWrite: false, uvScale: [ux, uy], receiveShadow: false, castShadow: false, color: (0, math_js_6.rgb)(0xe8eef5) }));
        const nets = [];
        for (const s of [-1, 1]) {
            const goal = new scene_js_1.Node();
            goal.setPos(0, 0, s * L);
            const pr = GW + POST_R;
            for (const sx of [-1, 1]) {
                const post = new scene_js_1.Node(G.cylinder(POST_R, POST_R, GH + POST_R, 10), postMat);
                post.setPos(sx * pr, (GH + POST_R) / 2, 0);
                const back = new scene_js_1.Node(G.cylinder(POST_R * 0.7, POST_R * 0.7, GH * 0.9, 8), postMat);
                back.setPos(sx * pr, GH * 0.45, s * GD);
                goal.add(post, back);
            }
            const bar = new scene_js_1.Node(G.cylinder(POST_R, POST_R, 2 * pr + POST_R, 10), postMat);
            bar.rotation = [0, 0, Math.PI / 2];
            bar.setPos(0, GH + POST_R * 0.5, 0);
            const backBar = new scene_js_1.Node(G.cylinder(POST_R * 0.7, POST_R * 0.7, 2 * pr, 8), postMat);
            backBar.rotation = [0, 0, Math.PI / 2];
            backBar.setPos(0, GH * 0.9, s * GD);
            goal.add(bar, backBar);
            const net = new scene_js_1.Node();
            const back = mkNet(2 * GW, GH * 0.9, 10, 5);
            back.setPos(0, GH * 0.45, s * GD);
            const top = new scene_js_1.Node(G.plane(2 * GW, GD), back.material);
            top.setPos(0, GH * 0.5 + GH * 0.5, s * GD * 0.5);
            top.material = (0, scene_js_1.material)(Object.assign(Object.assign({}, back.material), { uvScale: [10, 5] }));
            top.rotation = [0, 0, 0];
            for (const sx of [-1, 1]) {
                const side = mkNet(GD, GH * 0.9, 5, 5);
                side.rotation = [0, Math.PI / 2, 0];
                side.setPos(sx * GW, GH * 0.45, s * GD * 0.5);
                net.add(side);
            }
            net.add(back, top);
            goal.add(net);
            nets.push(net);
            root.add(goal);
        }

        const led = ads_js_1.AD_CONFIG.enabled ? ledMaterials(t.boards, 2 * L + 2, (2 * W + 2 - (2 * GW + 3)) / 2, 'footy') : null;
        if (led) {
            for (const s of [-1, 1]) {
                ledBoard(root, led, true, 2 * L + 2, s * (W + 1.4), 0, s);
                for (const e of [-1, 1]) {
                    const seg = (2 * W + 2 - (2 * GW + 3)) / 2;
                    ledBoard(root, led, false, seg, s * (GW + 1.5 + seg / 2), e * (L + GD + 0.9), e);
                }
            }
            for (const e of [-1, 1]) {
                ledBoard(root, led, false, 12.0, 0, e * (L + GD + 2.2), e, 1.8, true);
            }
        }

        let crowd = { visible: false };
        if (!isDefault) {
            // THEMED ARENA: Build realistic 3D world! Zero spectator stands!
            buildThemedEnvironment(root, t, W, L, GD, false, quality);
        } else {
            // DEFAULT ARENA: Traditional spectator stadium with crowd, stands & floodlights
            const stands = [
                { alongX: false, sign: -1, offset: W + 3.2, length: 2 * L + 8, rows: 7, center: 0 },
                { alongX: false, sign: 1, offset: W + 3.2, length: 2 * L + 8, rows: 7, center: 0 },
                { alongX: true, sign: -1, offset: L + GD + 3, length: 2 * W + 10, rows: 5, center: 0 },
                { alongX: true, sign: 1, offset: L + GD + 3, length: 2 * W + 10, rows: 5, center: 0 },
            ];
            crowd = crowdAndStands(root, stands, t.crowd, t.stand, quality);
            for (const sx of [-1, 1]) {
                for (const sz of [-1, 1]) {
                    floodlight(root, sx * (W + 9), sz * (L + 6), 18, t.glow);
                }
            }
        }
        let netT = [0, 0];
        const arena = {
            root,
            bounds: { halfW: W, halfL: L },
            apply(scene) {
                scene.sunDir = t.sunDir;
                scene.sunColor = t.sunColor;
                scene.sky = (0, math_js_6.rgb)(t.hemiSky);
                scene.ground = (0, math_js_6.rgb)(t.hemiGround);
                scene.fogColor = (0, math_js_6.rgb)(t.fog);
                scene.fogNear = 70;
                scene.fogFar = 190;
                scene.pointLights = [
                    [-1, -1],
                    [1, -1],
                    [-1, 1],
                    [1, 1],
                ].map(([sx, sz], i) => ({ pos: [sx * (W + 9), 14, sz * (L + 6)], radius: 55, color: (0, math_js_6.rgb)(t.lights[i % t.lights.length]).map((v) => v * t.lightIntensity) }));
            },
            update(dt, _sim, excite) {
                for (let i = 0; i < 2; i++) {
                    netT[i] = Math.max(0, netT[i] - dt);
                    const k = netT[i] > 0 ? Math.sin((1 - netT[i] / 1.1) * 14) * netT[i] : 0;
                    const n = nets[i === 0 ? 1 : 0];
                    if (n) n.scale = [1 + k * 0.05, 1 + k * 0.1, 1 + k * 0.28];
                }
                if (crowd) crowd.visible = true;
                void excite;
                pulseLed(led, dt);
            },
            netHit(side) {
                netT[side] = 1.1;
            },
        };
        netT = [0, 0];
        return arena;
    }
    function buildCourtArena(t, quality) {
        const root = new scene_js_1.Node();
        const { W, L, APRON } = basketball_js_2.BB;
        const isDefault = Boolean(t && (t.isDefault || t.id === 'std_hoops_street'));
        const groundCol = (0, math_js_6.rgb)(t && t.floor ? t.floor : 0x0b0e16);
        const ground = new scene_js_1.Node(G.plane(400, 400), (0, scene_js_1.material)({ color: groundCol, receiveShadow: false }));
        ground.setPos(0, -0.06, 0);

        const [pw, pd] = (0, textures_js_1.courtPlaneSize)();
        const court = new scene_js_1.Node(G.plane(pw, pd), (0, scene_js_1.material)({ texture: new scene_js_1.Texture((0, textures_js_1.makeCourtTexture)(t), { mipmap: true, srgb: true }), spec: 0.35, shininess: 40, receiveShadow: true }));
        root.add(ground, court);

        const boardTex = new scene_js_1.Texture((0, textures_js_1.makeBackboardTexture)(), { srgb: true });
        const glassMat = (0, scene_js_1.material)({ texture: boardTex, transparent: true, alpha: 0.55, spec: 0.8, depthWrite: false, receiveShadow: false, castShadow: false, doubleSided: true });
        const frameMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0xf2f4f7), spec: 0.5, castShadow: true });
        const rimMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(t.rim), emissive: (0, math_js_6.rgb)(t.rim).map((v) => v * 0.25), spec: 0.9, shininess: 60, castShadow: true });
        const poleMat = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x3b4252), spec: 0.4, castShadow: true });
        const netTex = new scene_js_1.Texture((0, textures_js_1.makeNetTexture)(), { repeat: true, mipmap: true, srgb: true });
        const hoopNets = [];
        const hoopRoots = [];
        for (const s of [-1, 1]) {
            const hz = s * basketball_js_2.BB.HOOP_Z;
            const bz = hz + s * basketball_js_2.BB.BOARD_OFFSET;
            const hoop = new scene_js_1.Node();
            const bh = basketball_js_2.BB.BOARD_TOP - basketball_js_2.BB.BOARD_BOTTOM;
            const board = new scene_js_1.Node(G.box(2 * basketball_js_2.BB.BOARD_W, bh, 2 * basketball_js_2.BB.BOARD_T), glassMat);
            board.setPos(0, (basketball_js_2.BB.BOARD_TOP + basketball_js_2.BB.BOARD_BOTTOM) / 2, bz);
            const fr = [
                [2 * basketball_js_2.BB.BOARD_W + 0.08, 0.06, 0, basketball_js_2.BB.BOARD_TOP],
                [2 * basketball_js_2.BB.BOARD_W + 0.08, 0.06, 0, basketball_js_2.BB.BOARD_BOTTOM],
            ];
            for (const [w, h, x, y] of fr) {
                const f = new scene_js_1.Node(G.box(w, h, 2 * basketball_js_2.BB.BOARD_T + 0.04), frameMat);
                f.setPos(x, y, bz);
                hoop.add(f);
            }
            for (const sx of [-1, 1]) {
                const f = new scene_js_1.Node(G.box(0.06, bh, 2 * basketball_js_2.BB.BOARD_T + 0.04), frameMat);
                f.setPos(sx * basketball_js_2.BB.BOARD_W, (basketball_js_2.BB.BOARD_TOP + basketball_js_2.BB.BOARD_BOTTOM) / 2, bz);
                hoop.add(f);
            }
            const edge = hz + s * (basketball_js_2.BB.RIM_R + basketball_js_2.BB.RIM_TUBE);
            const br = new scene_js_1.Node(G.box(0.2, 0.09, Math.abs(bz - edge) + 0.06), rimMat);
            br.setPos(0, basketball_js_2.BB.RIM_H, (bz + edge) / 2);
            const rimR = basketball_js_2.BB.RIM_R + basketball_js_2.BB.RIM_TUBE;
            const rim = new scene_js_1.Node(G.torus(rimR, basketball_js_2.BB.RIM_TUBE * 1.15, 40, 8), rimMat);
            rim.setPos(0, basketball_js_2.BB.RIM_H, hz);
            const net = new scene_js_1.Node(G.openCone(basketball_js_2.BB.RIM_R, 0.34, 0.5, 20), (0, scene_js_1.material)({ texture: netTex, transparent: true, alpha: 0.9, doubleSided: true, depthWrite: false, uvScale: [10, 2], receiveShadow: false, color: (0, math_js_6.rgb)(0xffffff) }));
            const holder = new scene_js_1.Node();
            holder.setPos(0, basketball_js_2.BB.RIM_H, hz);
            net.setPos(0, -0.25, 0);
            holder.add(net);
            hoopNets.push(holder);
            const poleZ = s * (L + 1.0);
            const pole = new scene_js_1.Node(G.cylinder(0.11, 0.14, basketball_js_2.BB.BOARD_TOP + 0.4, 10), poleMat);
            pole.setPos(0, (basketball_js_2.BB.BOARD_TOP + 0.4) / 2, poleZ);
            const arm = new scene_js_1.Node(G.box(0.16, 0.16, Math.abs(poleZ - bz) + 0.1), poleMat);
            arm.setPos(0, basketball_js_2.BB.BOARD_TOP + 0.3, (poleZ + bz) / 2);
            hoop.add(board, br, rim, holder, pole, arm);
            root.add(hoop);
            hoopRoots.push(hoop);
        }

        const led = ads_js_1.AD_CONFIG.enabled ? ledMaterials(t.board, 2 * L, 2 * W, 'hoops') : null;
        if (led) {
            for (const s of [-1, 1]) {
                ledBoard(root, led, true, 2 * L, s * (W + APRON + 0.3), 0, s);
                for (const e of [-1, 1]) {
                    const seg = (2 * W - 3.2) / 2;
                    ledBoard(root, led, false, seg, s * (1.6 + seg / 2), e * (L + APRON + 1.4), e);
                }
            }
            for (const e of [-1, 1]) {
                ledBoard(root, led, false, 9.0, 0, e * (L + APRON + 2.4), e, 1.8, true);
            }
        }

        let crowd = { visible: false };
        if (!isDefault) {
            // THEMED ARENA: Build realistic 3D world! Zero spectator stands!
            buildThemedEnvironment(root, t, W, L, APRON, true, quality);
        } else {
            // DEFAULT ARENA: Traditional spectator basketball arena with crowd & stands
            const stands = [
                { alongX: false, sign: -1, offset: W + APRON + 2.4, length: 2 * L + 6, rows: 6, center: 0 },
                { alongX: false, sign: 1, offset: W + APRON + 2.4, length: 2 * L + 6, rows: 6, center: 0 },
                { alongX: true, sign: -1, offset: L + APRON + 4.4, length: 2 * W + 10, rows: 5, center: 0 },
                { alongX: true, sign: 1, offset: L + APRON + 4.4, length: 2 * W + 10, rows: 5, center: 0 },
            ];
            crowd = crowdAndStands(root, stands, t.crowd, t.stand, quality);
            for (const sx of [-1, 1]) {
                for (const sz of [-1, 1]) {
                    const bar = new scene_js_1.Node(G.box(2.2, 0.2, 0.7), (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x20242e), emissive: (0, math_js_6.rgb)(t.glow).map((v) => v * 0.95), receiveShadow: false, fog: false }));
                    bar.setPos(sx * 7.5, 10, sz * 8);
                    root.add(bar);
                }
            }
        }
        const nt = [0, 0];
        return {
            root,
            bounds: { halfW: W + APRON, halfL: L + APRON },
            apply(scene) {
                scene.sunDir = t.sunDir;
                scene.sunColor = t.sunColor;
                scene.sky = (0, math_js_6.rgb)(t.hemiSky);
                scene.ground = (0, math_js_6.rgb)(t.hemiGround);
                scene.fogColor = (0, math_js_6.rgb)(t.fog);
                scene.fogNear = 60;
                scene.fogFar = 150;
                scene.pointLights = [
                    [-1, -1],
                    [1, -1],
                    [-1, 1],
                    [1, 1],
                ].map(([sx, sz], i) => ({ pos: [sx * 7.5, 9.5, sz * 8], radius: 24, color: (0, math_js_6.rgb)(t.lights[i % t.lights.length]).map((v) => v * t.lightIntensity) }));
            },
            update(dt, sim, _excite) {
                var _a;
                const bs = sim;
                for (let i = 0; i < 2; i++) {
                    const hp = (_a = bs.hoops) === null || _a === void 0 ? void 0 : _a[i];
                    nt[i] = Math.max(nt[i] - dt, 0);
                    const k = hp ? Math.min(1, hp.net) : 0;
                    const holder = hoopNets[i === 0 ? 1 : 0];
                    if (holder) holder.scale = [1 - k * 0.22, 1 + k * 0.45, 1 - k * 0.22];
                }
                void hoopRoots;
                if (crowd) crowd.visible = true;
                pulseLed(led, dt);
            },
            netHit() {
            },
        };
    }
`;

content = content.slice(0, startIndex) + replacement + content.slice(closeDefineIndex);
fs.writeFileSync(gameJsPath, content, 'utf8');
console.log('Successfully updated buildFootyArena and buildCourtArena with complete surfaces, goals, hoops and ads!');
