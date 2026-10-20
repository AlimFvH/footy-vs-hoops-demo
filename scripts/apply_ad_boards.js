const fs = require('fs');
let rawCode = fs.readFileSync('js/game.js', 'utf8');
const isCRLF = rawCode.includes('\r\n');
let code = rawCode.replace(/\r\n/g, '\n');

// 1. Update AD_CONFIG in data/ads
const oldAdDef = `define("data/ads", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AD_CONFIG = void 0;
    exports.AD_CONFIG = {
        enabled: true,
        brightness: 1,
        pulse: 0.08,
        slides: [
            { text: 'FOOTY vs HOOPS', sub: '⚽ · 🏀', accent: 0x19e0b0, color: 0xffffff },
            { text: 'FOLLOW US ON X', accent: 0x5ac8ff, color: 0xffffff },
            { text: '@footyvshoops', accent: 0xffcf33, color: 0xfff3c4 },
        ],
    };
});`;

const newAdDef = `define("data/ads", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AD_CONFIG = void 0;
    exports.AD_CONFIG = {
        enabled: true,
        brightness: 1,
        pulse: 0.08,
        fadeIn: 0.5,
        visible: 6.0,
        fadeOut: 0.5,
        hidden: 3.0,
        cycleTotal: 10.0,
        footySlides: [
            { text: 'FOOTY vs HOOPS', sub: '⚽ THE ULTIMATE DERBY ⚽', accent: 0x00f0ff, color: 0xffffff },
            { text: 'STRIKER #10', sub: '★ OFFICIAL MATCHWEAR ★', accent: 0x10b981, color: 0xffffff },
            { text: '$FOOTY ONCHAIN', sub: 'COMMUNITY & TOURNAMENTS', accent: 0x38bdf8, color: 0xffffff },
            { text: 'BATTLE PASS S1', sub: 'UNLOCK PREMIUM WITH STARS', accent: 0xfacc15, color: 0xfffbeb }
        ],
        hoopsSlides: [
            { text: 'FOOTY vs HOOPS', sub: '🏀 ALL-STAR HARDCOURT CIRCUIT 🏀', accent: 0xf97316, color: 0xffffff },
            { text: 'DUNK KING #23', sub: '★ OFFICIAL HOOPS GEAR ★', accent: 0xec4899, color: 0xffffff },
            { text: '$HOOPS ONCHAIN', sub: 'COMPETE & CLIMB THE RANKS', accent: 0xfb923c, color: 0xffffff },
            { text: 'TELEGRAM STARS', sub: 'UNLOCK EXCLUSIVE REWARDS', accent: 0xfacc15, color: 0xfffbeb }
        ],
        slides: [
            { text: 'FOOTY vs HOOPS', sub: '⚽ · 🏀 THE ULTIMATE CLASH', accent: 0x00f0ff, color: 0xffffff },
            { text: 'TELEGRAM STARS', sub: 'PREMIUM SHOP & REWARDS', accent: 0xfacc15, color: 0xffffff },
            { text: '@footyvshoops', sub: 'JOIN THE ARENA BATTLE', accent: 0x38bdf8, color: 0xfff3c4 }
        ]
    };
});`;

if (!code.includes(oldAdDef)) {
  console.error('Could not find oldAdDef in js/game.js');
  process.exit(1);
}
code = code.replace(oldAdDef, newAdDef);

// 2. Enhance makeLedTexture to support high-contrast sharp rendering of slide sets
const oldMakeLed = `function makeLedTexture(slides, bg) {
        const W = 2048;
        const H = 128;
        const [c, g] = makeCanvas(W, H);
        g.fillStyle = hex(bg);
        g.fillRect(0, 0, W, H);
        const n = Math.max(1, slides.length);
        const pw = W / n;
        slides.forEach((s, i) => {
            var _a;
            const x0 = i * pw;
            const grad = g.createLinearGradient(0, 0, 0, H);
            grad.addColorStop(0, 'rgba(255,255,255,0.05)');
            grad.addColorStop(1, 'rgba(0,0,0,0.25)');
            g.fillStyle = grad;
            g.fillRect(x0 + 6, 6, pw - 12, H - 12);
            g.fillStyle = hex(s.accent);
            g.fillRect(x0 + 14, 10, pw - 28, 5);
            g.fillRect(x0 + 14, H - 15, pw - 28, 5);
            let fs = s.sub ? 62 : 78;
            g.font = \`900 \${fs}px system-ui, Arial, sans-serif\`;
            while (g.measureText(s.text).width > pw - 70 && fs > 24) {
                fs -= 2;
                g.font = \`900 \${fs}px system-ui, Arial, sans-serif\`;
            }
            g.textAlign = 'center';
            g.textBaseline = 'middle';
            g.shadowColor = hex(s.accent);
            g.shadowBlur = 18;
            g.fillStyle = hex((_a = s.color) !== null && _a !== void 0 ? _a : 0xffffff);
            g.fillText(s.text, x0 + pw / 2, s.sub ? 52 : H / 2);
            if (s.sub) {
                g.shadowBlur = 8;
                g.font = '800 32px system-ui, Arial, sans-serif';
                g.fillStyle = hex(s.accent);
                g.fillText(s.sub, x0 + pw / 2, 96);
            }
            g.shadowBlur = 0;
        });
        g.globalCompositeOperation = 'multiply';
        g.fillStyle = 'rgba(0,0,0,0.55)';
        for (let x = 0; x < W; x += 4)
            g.fillRect(x + 3, 0, 1, H);
        for (let y = 0; y < H; y += 4)
            g.fillRect(0, y + 3, W, 1);
        g.globalCompositeOperation = 'source-over';
        g.textAlign = 'left';
        return c;
    }`;

const newMakeLed = `function makeLedTexture(slides, bg) {
        const W = 2048;
        const H = 160;
        const [c, g] = makeCanvas(W, H);
        g.fillStyle = hex(bg || 0x070c14);
        g.fillRect(0, 0, W, H);
        const list = Array.isArray(slides) ? slides : [slides];
        const n = Math.max(1, list.length);
        const pw = W / n;
        list.forEach((s, i) => {
            var _a;
            const x0 = i * pw;
            const grad = g.createLinearGradient(0, 0, 0, H);
            grad.addColorStop(0, 'rgba(255,255,255,0.06)');
            grad.addColorStop(0.5, 'rgba(0,0,0,0.15)');
            grad.addColorStop(1, 'rgba(0,0,0,0.4)');
            g.fillStyle = grad;
            g.fillRect(x0 + 4, 4, pw - 8, H - 8);
            
            // Neon accent bars (top and bottom)
            const accentHex = hex(s.accent || 0x00f0ff);
            g.fillStyle = accentHex;
            g.shadowColor = accentHex;
            g.shadowBlur = 8;
            g.fillRect(x0 + 10, 8, pw - 20, 6);
            g.fillRect(x0 + 10, H - 14, pw - 20, 6);
            g.shadowBlur = 0;

            // Main Text (Bold, crisp, proportional)
            let fs = s.sub ? 64 : 80;
            g.font = \`900 \${fs}px system-ui, -apple-system, sans-serif\`;
            while (g.measureText(s.text).width > pw - 60 && fs > 26) {
                fs -= 2;
                g.font = \`900 \${fs}px system-ui, -apple-system, sans-serif\`;
            }
            g.textAlign = 'center';
            g.textBaseline = 'middle';
            g.shadowColor = accentHex;
            g.shadowBlur = 14;
            g.fillStyle = hex((_a = s.color) !== null && _a !== void 0 ? _a : 0xffffff);
            g.fillText(s.text, x0 + pw / 2, s.sub ? 58 : H / 2);

            // Subtitle
            if (s.sub) {
                g.shadowBlur = 6;
                g.font = '800 28px system-ui, -apple-system, sans-serif';
                g.fillStyle = accentHex;
                g.fillText(s.sub, x0 + pw / 2, 114);
            }
            g.shadowBlur = 0;
        });

        // Subtle LED diode grid for authentic stadium board look without blurring
        g.globalCompositeOperation = 'multiply';
        g.fillStyle = 'rgba(0,0,0,0.35)';
        for (let x = 0; x < W; x += 4) g.fillRect(x + 3, 0, 1, H);
        for (let y = 0; y < H; y += 4) g.fillRect(0, y + 3, W, 1);
        g.globalCompositeOperation = 'source-over';
        g.textAlign = 'left';
        return c;
    }`;

if (!code.includes(oldMakeLed)) {
  console.error('Could not find oldMakeLed in js/game.js');
  process.exit(1);
}
code = code.replace(oldMakeLed, newMakeLed);

// 3. Update ledMaterials to support slide sets & textures rotation
const oldLedMats = `function ledMaterials(bg, longLen, endLen) {
        const tex = new scene_js_1.Texture((0, textures_js_1.makeLedTexture)(ads_js_1.AD_CONFIG.slides, bg), { repeat: true, mipmap: true, srgb: true });
        const k = ads_js_1.AD_CONFIG.brightness;
        const mk = (rep) => (0, scene_js_1.material)({ texture: tex, unlit: true, fog: false, receiveShadow: false, castShadow: false, uvScale: [rep, 1], emissive: [0.12 * k, 0.12 * k, 0.12 * k], color: [k, k, k] });
        const reps = (len) => Math.max(1, Math.round(len / (1.0 * 16)));
        const long = mk(reps(longLen));
        const end = mk(reps(endLen));
        const frame = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x0b0f18), spec: 0.4, shininess: 60, receiveShadow: false });
        return { long, end, frame, all: [long, end] };
    }`;

const newLedMats = `function ledMaterials(bg, longLen, endLen, sportType) {
        const slides = (sportType === 'hoops' ? ads_js_1.AD_CONFIG.hoopsSlides : ads_js_1.AD_CONFIG.footySlides) || ads_js_1.AD_CONFIG.slides;
        // Pre-create textures for all rotated slides
        const textures = slides.map(function(s) {
            return new scene_js_1.Texture((0, textures_js_1.makeLedTexture)([s], bg), { repeat: true, mipmap: true, srgb: true });
        });
        const defaultTex = textures[0];
        const k = ads_js_1.AD_CONFIG.brightness;
        const mk = (rep) => (0, scene_js_1.material)({ texture: defaultTex, unlit: true, fog: false, receiveShadow: false, castShadow: false, uvScale: [rep, 1], emissive: [0.15 * k, 0.15 * k, 0.15 * k], color: [k, k, k] });
        const reps = (len) => Math.max(1, Math.round(len / (1.0 * 16)));
        const long = mk(reps(longLen));
        const end = mk(reps(endLen));
        const frame = (0, scene_js_1.material)({ color: (0, math_js_6.rgb)(0x080c14), spec: 0.4, shininess: 60, receiveShadow: false });
        return { long, end, frame, all: [long, end], textures: textures, currentSlide: 0 };
    }`;

if (!code.includes(oldLedMats)) {
  console.error('Could not find oldLedMats in js/game.js');
  process.exit(1);
}
code = code.replace(oldLedMats, newLedMats);

// 4. Update pulseLed with the exact 0.5s fade-in, 6s visible, 0.5s fade-out, 3s hidden cycle
const oldPulseLed = `let ledClock = 0;
    function pulseLed(led, dt) {
        if (!led || ads_js_1.AD_CONFIG.pulse <= 0)
            return;
        ledClock += dt;
        const v = ads_js_1.AD_CONFIG.brightness * (1 - ads_js_1.AD_CONFIG.pulse * 0.5 + ads_js_1.AD_CONFIG.pulse * 0.5 * Math.sin(ledClock * 2.2));
        for (const m of led.all)
            m.color = [v, v, v];
    }`;

const newPulseLed = `let ledClock = 0;
    function pulseLed(led, dt) {
        if (!led) return;
        ledClock += dt;
        
        // Exact continuous configurable animation cycle:
        // 1. Fade in over 0.5s
        // 2. Remain fully visible for 6.0s
        // 3. Fade out over 0.5s
        // 4. Remain hidden for 3.0s (content completely disappears)
        // Repeat indefinitely (10.0s total cycle, synchronized)
        const tFadeIn = ads_js_1.AD_CONFIG.fadeIn || 0.5;
        const tVis = ads_js_1.AD_CONFIG.visible || 6.0;
        const tFadeOut = ads_js_1.AD_CONFIG.fadeOut || 0.5;
        const tHide = ads_js_1.AD_CONFIG.hidden || 3.0;
        const tCycle = tFadeIn + tVis + tFadeOut + tHide; // 10.0s
        
        const phase = (ledClock % tCycle);
        let alpha = 0.0;
        if (phase < tFadeIn) {
            alpha = phase / tFadeIn;
        } else if (phase < tFadeIn + tVis) {
            alpha = 1.0;
        } else if (phase < tFadeIn + tVis + tFadeOut) {
            alpha = 1.0 - (phase - (tFadeIn + tVis)) / tFadeOut;
        } else {
            alpha = 0.0; // Completely hidden for 3s
        }
        
        // During hidden phase, smoothly advance to next slide texture
        if (led.textures && led.textures.length > 0) {
            const slideIndex = Math.floor(ledClock / tCycle) % led.textures.length;
            if (slideIndex !== led.currentSlide) {
                led.currentSlide = slideIndex;
                const nextTex = led.textures[slideIndex];
                if (nextTex) {
                    led.long.texture = nextTex;
                    led.end.texture = nextTex;
                }
            }
        }
        
        const brightness = ads_js_1.AD_CONFIG.brightness || 1.0;
        const v = Math.max(0, Math.min(1, alpha)) * brightness;
        for (const m of led.all) {
            m.color = [v, v, v];
            if (m.emissive) {
                m.emissive = [0.18 * v, 0.18 * v, 0.18 * v];
            }
        }
    }`;

if (!code.includes(oldPulseLed)) {
  console.error('Could not find oldPulseLed in js/game.js');
  process.exit(1);
}
code = code.replace(oldPulseLed, newPulseLed);

// 5. Update buildFootyArena to place advertising boards behind football goals
const oldFootyBoards = `const led = ads_js_1.AD_CONFIG.enabled ? ledMaterials(t.boards, 2 * L + 2, (2 * W + 2 - (2 * GW + 3)) / 2) : null;
        if (led) {
            for (const s of [-1, 1]) {
                ledBoard(root, led, true, 2 * L + 2, s * (W + 1.4), 0, s);
                for (const e of [-1, 1]) {
                    const seg = (2 * W + 2 - (2 * GW + 3)) / 2;
                    ledBoard(root, led, false, seg, s * (GW + 1.5 + seg / 2), e * (L + GD + 0.9), e);
                }
            }
        }`;

const newFootyBoards = `const led = ads_js_1.AD_CONFIG.enabled ? ledMaterials(t.boards, 2 * L + 2, (2 * W + 2 - (2 * GW + 3)) / 2, 'footy') : null;
        if (led) {
            for (const s of [-1, 1]) {
                // Sideline continuous LED advertising boards
                ledBoard(root, led, true, 2 * L + 2, s * (W + 1.4), 0, s);
                // Endline boards flanking the goals
                for (const e of [-1, 1]) {
                    const seg = (2 * W + 2 - (2 * GW + 3)) / 2;
                    ledBoard(root, led, false, seg, s * (GW + 1.5 + seg / 2), e * (L + GD + 0.9), e);
                }
            }
            // Dedicated advertising boards behind both football goals (placed 1.8m behind net, naturally framed)
            for (const e of [-1, 1]) {
                ledBoard(root, led, false, 2 * GW + 2.0, 0, e * (L + GD + 1.8), e);
            }
        }`;

if (!code.includes(oldFootyBoards)) {
  console.error('Could not find oldFootyBoards in js/game.js');
  process.exit(1);
}
code = code.replace(oldFootyBoards, newFootyBoards);

// 6. Update buildCourtArena to place advertising boards behind & around basketball hoops
const oldCourtBoards = `const led = ads_js_1.AD_CONFIG.enabled ? ledMaterials(t.board, 2 * L, 2 * W) : null;
        if (led)
            for (const s of [-1, 1])
                ledBoard(root, led, true, 2 * L, s * (W + APRON + 0.2), 0, s);`;

const newCourtBoards = `const led = ads_js_1.AD_CONFIG.enabled ? ledMaterials(t.board, 2 * L, 2 * W, 'hoops') : null;
        if (led) {
            for (const s of [-1, 1]) {
                // Sideline continuous LED advertising boards
                ledBoard(root, led, true, 2 * L, s * (W + APRON + 0.3), 0, s);
                // Baseline boards flanking basketball hoops (behind baseline and stanchions)
                for (const e of [-1, 1]) {
                    const seg = (2 * W - 3.2) / 2;
                    ledBoard(root, led, false, seg, s * (1.6 + seg / 2), e * (L + APRON + 1.4), e);
                }
            }
            // Dedicated advertising boards behind both basketball hoops
            for (const e of [-1, 1]) {
                ledBoard(root, led, false, 3.2, 0, e * (L + APRON + 2.2), e);
            }
        }`;

if (!code.includes(oldCourtBoards)) {
  console.error('Could not find oldCourtBoards in js/game.js');
  process.exit(1);
}
code = code.replace(oldCourtBoards, newCourtBoards);

if (isCRLF) code = code.replace(/\n/g, '\r\n');
fs.writeFileSync('js/game.js', code);
console.log('Successfully updated js/game.js with dynamic advertising boards!');
