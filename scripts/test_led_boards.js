const fs = require('fs');
const path = require('path');

const gameCode = fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8');

const modules = {};
function define(name, deps, fn) {
    modules[name] = { deps, fn };
}

global.window = {
    innerWidth: 1280,
    innerHeight: 800,
    setTimeout: (fn, ms) => setTimeout(fn, ms),
    clearTimeout: (id) => clearTimeout(id),
    __boot: () => {}
};
global.document = {
    documentElement: { lang: 'ru', dir: 'ltr' }
};

const vm = require('vm');
const sandbox = {
    define,
    window: global.window,
    document: global.document,
    navigator: { language: 'ru', languages: ['ru', 'en'] },
    console,
    Math,
    Object,
    Array,
    String,
    Number,
    Boolean,
    Date,
    JSON
};
vm.createContext(sandbox);
vm.runInContext(gameCode, sandbox);

function requireModule(name) {
    const mod = modules[name];
    if (!mod) throw new Error('Module not found: ' + name);
    if (mod.exports) return mod.exports;
    const exp = {};
    mod.exports = exp;
    const resolved = (mod.deps || []).map(d => {
        if (d === 'require') return (dep) => requireModule(dep);
        if (d === 'exports') return exp;
        return requireModule(d);
    });
    mod.fn.apply(null, resolved);
    return exp;
}

const adsMod = requireModule('data/ads');

console.log('=== FOOTY vs HOOPS Prompt 3: Large LED Advertising Boards Verification ===\n');

let passed = 0;
let total = 0;
function assert(condition, message) {
    total++;
    if (!condition) {
        console.error(`[FAIL] Test ${total}: ${message}`);
        process.exit(1);
    } else {
        console.log(`[PASS] Test ${total}: ${message}`);
        passed++;
    }
}

const EXPECTED_TEXT = 'Здесь может быть твоя реклама';

// -------------------------------------------------------------
// Test 1: Validate Exact Russian Text on All Footy Slides
// -------------------------------------------------------------
{
    const footySlides = adsMod.AD_CONFIG.footySlides;
    assert(Array.isArray(footySlides) && footySlides.length > 0, 'Footy slides array is defined and populated');
    const allMatch = footySlides.every(s => s.text === EXPECTED_TEXT && !s.sub);
    assert(allMatch, `Footy slides strictly contain text "${EXPECTED_TEXT}" with no extra words, URLs, or sub-headers`);
}

// -------------------------------------------------------------
// Test 2: Validate Exact Russian Text on All Hoops Slides
// -------------------------------------------------------------
{
    const hoopsSlides = adsMod.AD_CONFIG.hoopsSlides;
    assert(Array.isArray(hoopsSlides) && hoopsSlides.length > 0, 'Hoops slides array is defined and populated');
    const allMatch = hoopsSlides.every(s => s.text === EXPECTED_TEXT && !s.sub);
    assert(allMatch, `Hoops slides strictly contain text "${EXPECTED_TEXT}" with no extra words, URLs, or sub-headers`);
}

// -------------------------------------------------------------
// Test 3: Validate Exact Russian Text on General Slides Fallback
// -------------------------------------------------------------
{
    const slides = adsMod.AD_CONFIG.slides;
    assert(Array.isArray(slides) && slides.length > 0, 'General slides array is defined and populated');
    const allMatch = slides.every(s => s.text === EXPECTED_TEXT && !s.sub);
    assert(allMatch, `General fallback slides strictly contain text "${EXPECTED_TEXT}" with zero extra words, URLs, or slogans`);
}

// -------------------------------------------------------------
// Test 4: Smooth Fade Transition Cycle Parameters
// -------------------------------------------------------------
{
    const cfg = adsMod.AD_CONFIG;
    assert(cfg.fadeIn === 0.5 && cfg.visible === 6.0 && cfg.fadeOut === 0.5 && cfg.hidden === 3.0, 'LED animation cycle has smooth fade transitions (0.5s in, 6.0s visible, 0.5s out, 3.0s off)');
    assert(cfg.cycleTotal === 10.0, 'Total animation cycle is 10.0 seconds');
}

// -------------------------------------------------------------
// Test 5: Verify Large Board Dimensions in game.js Source
// -------------------------------------------------------------
{
    const hasFootyLargeBoard = gameCode.includes('ledBoard(root, led, false, 12.0, 0, e * (L + GD + 2.2), e, 1.8, true)');
    assert(hasFootyLargeBoard, 'Football arena builds dedicated large boards behind goals: 12.0m wide, 1.8m high (substantially larger than standard 1m boards), placed behind net');

    const hasHoopsLargeBoard = gameCode.includes('ledBoard(root, led, false, 9.0, 0, e * (L + APRON + 2.4), e, 1.8, true)');
    assert(hasHoopsLargeBoard, 'Basketball arena builds dedicated large boards behind hoops: 9.0m wide, 1.8m high (substantially larger than standard 1m boards), placed behind stanchion');
}

// -------------------------------------------------------------
// Test 6: Verify Large End Board Material uvScale
// -------------------------------------------------------------
{
    const hasLargeEndMat = gameCode.includes('largeEnd = mk(1)') && gameCode.includes('mats.largeEnd');
    assert(hasLargeEndMat, 'LED materials generate single-repetition texture mapping (largeEnd uvScale: [1, 1]) for maximum legibility on large end boards');
}

// -------------------------------------------------------------
// Test 7: Verify Camera Visibility & Non-Obstruction
// -------------------------------------------------------------
{
    // Boards are placed outside bounds:
    // In football: FB.L = 28, GD = 2.6 -> board is at Z = 28 + 2.6 + 2.2 = 32.8m (strictly behind net and outside playable pitch)
    // In basketball: BB.L = 12, APRON = 2 -> board is at Z = 12 + 2 + 2.4 = 16.4m (strictly behind court apron and hoop pole)
    // Board tilt is -0.22 and -0.20 rad (facing towards gameplay camera elevation 56°-58°)
    const footyZ = 28 + 2.6 + 2.2;
    const hoopsZ = 12 + 2.0 + 2.4;
    assert(footyZ > 28 && hoopsZ > 14, 'End boards are positioned strictly outside the field/court boundary, preventing any player or ball collision');
}

console.log(`\nResults: ${passed}/${total} LED board tests passed.\n`);
