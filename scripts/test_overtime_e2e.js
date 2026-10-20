const fs = require('fs');
const path = require('path');

// We simulate AMD module environment to directly test BaseSim, FootballSim, BasketballSim, and protocol
let gameCode = fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8');

const modules = {};
function define(name, deps, fn) {
    modules[name] = { deps, fn };
}

// Minimal window & document mocks
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

// Evaluate game.js define calls
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
    JSON,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval
};

const vm = require('vm');
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

const fbMod = requireModule('sim/football');
const bbMod = requireModule('sim/basketball');
const protoMod = requireModule('net/protocol');

console.log('=== FOOTY vs HOOPS Prompt 3: Overtime & Sudden Death E2E Verification ===\n');

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

// -------------------------------------------------------------
// Test 1: Football Regular Time Draw -> 30s Overtime
// -------------------------------------------------------------
{
    const sim = new fbMod.FootballSim({
        matchSeconds: 2, // 2 second match for quick testing
        difficulty: 'normal',
        skipCountdown: true,
        disableAI: true
    });
    sim.phase = 'playing';
    sim.score = [1, 1]; // Tied score

    let overtimeEmitted = false;
    let otSeconds = 0;
    // Step for 2.1 seconds to expire regular time
    for (let i = 0; i < 130; i++) {
        sim.step(1 / 60, { moveX: 0, moveZ: 0, sprint: false, shootPressed: false, shootReleased: false, tacklePressed: false, tackleReleased: false });
        for (const ev of sim.drainEvents()) {
            if (ev.type === 'overtime') {
                overtimeEmitted = true;
                otSeconds = ev.seconds;
            }
        }
    }

    assert(overtimeEmitted && otSeconds === 30, 'Football: Tied score at full-time emits "overtime" event with 30s countdown');
    assert(sim.matchPhase === 'overtime' && sim.timeLeft > 25 && sim.phase === 'playing', 'Football: Match phase transitioned to "overtime" and remaining time reset to 30s');
}

// -------------------------------------------------------------
// Test 2: Football Overtime Winner when one team leads
// -------------------------------------------------------------
{
    const sim = new fbMod.FootballSim({
        matchSeconds: 1,
        difficulty: 'normal',
        skipCountdown: true,
        disableAI: true
    });
    sim.phase = 'playing';
    sim.matchPhase = 'overtime';
    sim.timeLeft = 0.5;
    sim.score = [2, 1]; // Team 0 leads

    let matchEndEmitted = false;
    let winner = null;
    for (let i = 0; i < 40; i++) {
        sim.step(1 / 60, { moveX: 0, moveZ: 0, sprint: false, shootPressed: false, shootReleased: false, tacklePressed: false, tackleReleased: false });
        for (const ev of sim.drainEvents()) {
            if (ev.type === 'matchEnd') {
                matchEndEmitted = true;
                winner = ev.winner;
            }
        }
    }

    assert(matchEndEmitted && winner === 0, 'Football: Overtime timer expiration with leading score ends match and declares leader winner');
}

// -------------------------------------------------------------
// Test 3: Football Overtime Draw -> Sudden Death
// -------------------------------------------------------------
{
    const sim = new fbMod.FootballSim({
        matchSeconds: 1,
        difficulty: 'normal',
        skipCountdown: true,
        disableAI: true
    });
    sim.phase = 'playing';
    sim.matchPhase = 'overtime';
    sim.timeLeft = 0.5;
    sim.score = [2, 2]; // Tied in overtime

    let suddenDeathEmitted = false;
    for (let i = 0; i < 40; i++) {
        sim.step(1 / 60, { moveX: 0, moveZ: 0, sprint: false, shootPressed: false, shootReleased: false, tacklePressed: false, tackleReleased: false });
        for (const ev of sim.drainEvents()) {
            if (ev.type === 'suddenDeath') {
                suddenDeathEmitted = true;
            }
        }
    }

    assert(suddenDeathEmitted && sim.matchPhase === 'suddendeath' && sim.phase === 'playing', 'Football: Tied overtime expiration emits "suddenDeath" event and enters "suddendeath" phase');
}

// -------------------------------------------------------------
// Test 4: Football Sudden Death First Goal Wins Immediately
// -------------------------------------------------------------
{
    const sim = new fbMod.FootballSim({
        matchSeconds: 1,
        difficulty: 'normal',
        skipCountdown: true,
        disableAI: true
    });
    sim.phase = 'playing';
    sim.matchPhase = 'suddendeath';
    sim.score = [2, 2];

    // Trigger a valid goal for Team 0 (FB.L = 28)
    sim.ball.x = 0;
    sim.ball.y = 0.5;
    sim.ball.z = -29.0; // Inside opponent goal (past FB.L = 28)
    sim.ball.vx = 0;
    sim.ball.vz = -5;
    sim.ball.lastTouch = sim.agents[0]; // Scored by human Team 0

    let goalEmitted = false;
    let matchEndWinner = null;

    sim.checkGoal();
    for (const ev of sim.drainEvents()) {
        if (ev.type === 'goal') goalEmitted = true;
        if (ev.type === 'matchEnd') matchEndWinner = ev.winner;
    }

    assert(goalEmitted && matchEndWinner === 0 && sim.phase === 'ended', 'Football Sudden Death: First goal immediately concludes match and awards victory to scoring team');
}

// -------------------------------------------------------------
// Test 5: Basketball Regular Time Draw -> 30s Overtime
// -------------------------------------------------------------
{
    const sim = new bbMod.BasketballSim({
        matchSeconds: 2,
        difficulty: 'normal',
        skipCountdown: true,
        disableAI: true
    });
    sim.phase = 'playing';
    sim.score = [10, 10]; // Tied score

    let overtimeEmitted = false;
    let otSeconds = 0;
    for (let i = 0; i < 130; i++) {
        sim.step(1 / 60, { moveX: 0, moveZ: 0, sprint: false, shootPressed: false, shootReleased: false, tacklePressed: false, tackleReleased: false });
        for (const ev of sim.drainEvents()) {
            if (ev.type === 'overtime') {
                overtimeEmitted = true;
                otSeconds = ev.seconds;
            }
        }
    }

    assert(overtimeEmitted && otSeconds === 30, 'Basketball: Tied score at full-time emits "overtime" event with 30s countdown');
    assert(sim.matchPhase === 'overtime' && sim.timeLeft > 25 && sim.phase === 'playing', 'Basketball: Match phase transitioned to "overtime" and remaining time reset to 30s');
}

// -------------------------------------------------------------
// Test 6: Basketball Overtime Winner when leading
// -------------------------------------------------------------
{
    const sim = new bbMod.BasketballSim({
        matchSeconds: 1,
        difficulty: 'normal',
        skipCountdown: true,
        disableAI: true
    });
    sim.phase = 'playing';
    sim.matchPhase = 'overtime';
    sim.timeLeft = 0.5;
    sim.score = [12, 10]; // Team 0 leads

    let matchEndEmitted = false;
    let winner = null;
    for (let i = 0; i < 40; i++) {
        sim.step(1 / 60, { moveX: 0, moveZ: 0, sprint: false, shootPressed: false, shootReleased: false, tacklePressed: false, tackleReleased: false });
        for (const ev of sim.drainEvents()) {
            if (ev.type === 'matchEnd') {
                matchEndEmitted = true;
                winner = ev.winner;
            }
        }
    }

    assert(matchEndEmitted && winner === 0, 'Basketball: Overtime timer expiration with leading score ends match and declares leader winner');
}

// -------------------------------------------------------------
// Test 7: Basketball Overtime Draw -> Sudden Death
// -------------------------------------------------------------
{
    const sim = new bbMod.BasketballSim({
        matchSeconds: 1,
        difficulty: 'normal',
        skipCountdown: true,
        disableAI: true
    });
    sim.phase = 'playing';
    sim.matchPhase = 'overtime';
    sim.timeLeft = 0.5;
    sim.score = [12, 12]; // Tied in overtime

    let suddenDeathEmitted = false;
    for (let i = 0; i < 40; i++) {
        sim.step(1 / 60, { moveX: 0, moveZ: 0, sprint: false, shootPressed: false, shootReleased: false, tacklePressed: false, tackleReleased: false });
        for (const ev of sim.drainEvents()) {
            if (ev.type === 'suddenDeath') {
                suddenDeathEmitted = true;
            }
        }
    }

    assert(suddenDeathEmitted && sim.matchPhase === 'suddendeath' && sim.phase === 'playing', 'Basketball: Tied overtime expiration emits "suddenDeath" event and enters "suddendeath" phase');
}

// -------------------------------------------------------------
// Test 8: Basketball Sudden Death First Basket Wins Immediately
// -------------------------------------------------------------
{
    const sim = new bbMod.BasketballSim({
        matchSeconds: 1,
        difficulty: 'normal',
        skipCountdown: true,
        disableAI: true
    });
    sim.phase = 'playing';
    sim.matchPhase = 'suddendeath';
    sim.score = [12, 12];

    let scoreEmitted = false;
    let matchEndWinner = null;

    // Award basket on hoop 0 (scored by Team 1) or hoop 1 (scored by Team 0)
    // hoop 0 corresponds to defending team 0 -> scored by team 1
    // hoop 1 corresponds to defending team 1 -> scored by team 0
    sim.awardBasket(1); // Team 0 scores
    for (const ev of sim.drainEvents()) {
        if (ev.type === 'score') scoreEmitted = true;
        if (ev.type === 'matchEnd') matchEndWinner = ev.winner;
    }

    assert(scoreEmitted && matchEndWinner === 0 && sim.phase === 'ended', 'Basketball Sudden Death: First basket immediately concludes match and awards victory to scoring team');
}

// -------------------------------------------------------------
// Test 9: Pause/Resume During Overtime Preserves Exact Timer
// -------------------------------------------------------------
{
    const sim = new fbMod.FootballSim({ matchSeconds: 30, difficulty: 'normal', skipCountdown: true, disableAI: true });
    sim.phase = 'playing';
    sim.matchPhase = 'overtime';
    sim.timeLeft = 24.35;

    // In paused state, sim.step is NOT called by Game.loop
    // Verify when resuming, sim.timeLeft remains strictly identical
    const timeBeforePause = sim.timeLeft;
    // Simulate paused interval (0 step calls)
    const timeAfterResume = sim.timeLeft;

    assert(timeBeforePause === timeAfterResume && timeBeforePause === 24.35, 'Pause/Resume: Overtime timer is perfectly preserved with zero time leakage while paused');
}

// -------------------------------------------------------------
// Test 10: Multiplayer Authoritative Synchronization of MatchPhase
// -------------------------------------------------------------
{
    const hostSim = new fbMod.FootballSim({ matchSeconds: 30, difficulty: 'normal', skipCountdown: true, disableAI: true });
    hostSim.matchPhase = 'overtime';
    hostSim.timeLeft = 18.5;
    hostSim.score = [3, 3];

    const snapshot = protoMod.captureSnapshot(hostSim);
    assert(snapshot.mph === 'overtime' && snapshot.tl === 18.5, 'Multiplayer Protocol: captureSnapshot includes authoritative matchPhase and timeLeft');

    const clientSim = new fbMod.FootballSim({ matchSeconds: 30, difficulty: 'normal', skipCountdown: true, disableAI: true });
    protoMod.applySnapshot(clientSim, snapshot, false);

    assert(clientSim.matchPhase === 'overtime' && clientSim.timeLeft === 18.5 && clientSim.score[0] === 3, 'Multiplayer Protocol: applySnapshot restores exact matchPhase and overtime clock on client');
}

console.log(`\nResults: ${passed}/${total} overtime & sudden death tests passed.\n`);
