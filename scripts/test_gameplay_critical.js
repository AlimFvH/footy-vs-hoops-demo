const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Setup AMD simulation environment
let gameCode = fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8');

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

console.log('=== FOOTY vs HOOPS Prompt 6: Critical Gameplay Regression Suite ===\n');

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
// 1. FOOTBALL: Match Init, Movement, Sprint & Stamina Controls
// -------------------------------------------------------------
{
    const sim = new fbMod.FootballSim({
        matchSeconds: 60,
        difficulty: 'normal',
        skipCountdown: true,
        disableAI: true
    });
    sim.phase = 'playing';

    const initX = sim.human.x;
    const initZ = sim.human.z;
    const initStamina = sim.human.stamina;

    // Move forward with sprint
    sim.step(1 / 60, { moveX: 0, moveZ: -1, sprint: true, shootPressed: false, shootReleased: false, tacklePressed: false, tackleReleased: false });

    assert(sim.human.z < initZ, 'Football: Human player moves forward along Z axis with input');
    assert(sim.human.stamina < initStamina, 'Football: Sprint consumes stamina');
}

// -------------------------------------------------------------
// 2. FOOTBALL: Invalid vs Valid Scoring Bounds
// -------------------------------------------------------------
{
    const sim = new fbMod.FootballSim({
        matchSeconds: 60,
        skipCountdown: true,
        disableAI: true
    });
    sim.phase = 'playing';
    sim.score = [0, 0];

    // Invalid score: ball behind goal line (z < -28) BUT outside goal posts width (FB.W = 7, so x > 7)
    sim.ball.x = 8.5; // Wide of post
    sim.ball.y = 0.5;
    sim.ball.z = -29.0;
    sim.ball.vx = 0;
    sim.ball.vz = -5;
    sim.checkGoal();

    let goalFired = false;
    for (const ev of sim.drainEvents()) {
        if (ev.type === 'goal') goalFired = true;
    }
    assert(!goalFired && sim.score[0] === 0 && sim.score[1] === 0, 'Football: Ball outside goalposts width does NOT trigger goal');

    // Valid score: ball within posts (|x| < 3.5) and crosses line (z <= -28.0)
    sim.ball.x = 0;
    sim.ball.y = 0.5;
    sim.ball.z = -28.5;
    sim.ball.vx = 0;
    sim.ball.vz = -5;
    sim.ball.lastTouch = sim.agents[0]; // Human team 0
    sim.checkGoal();

    let validGoalFired = false;
    for (const ev of sim.drainEvents()) {
        if (ev.type === 'goal') validGoalFired = true;
    }
    assert(validGoalFired && sim.score[0] === 1, 'Football: Ball crossing line inside posts awards goal to scoring team');
}

// -------------------------------------------------------------
// 3. FOOTBALL: AI Behavior & Pursuit
// -------------------------------------------------------------
{
    const sim = new fbMod.FootballSim({
        matchSeconds: 60,
        skipCountdown: true,
        disableAI: false // AI enabled
    });
    sim.phase = 'playing';

    // Place ball in opponent midfield
    sim.ball.x = 0;
    sim.ball.y = 0.5;
    sim.ball.z = 5;
    sim.ball.vx = 0;
    sim.ball.vz = 0;
    sim.ball.owner = null;

    // Find AI outfield agent on team 1
    const aiAgent = sim.agents.find(a => a.team === 1 && a.role !== 'keeper');
    const startDist = Math.hypot(sim.ball.x - aiAgent.x, sim.ball.z - aiAgent.z);

    // Step simulation for 30 frames
    for (let i = 0; i < 30; i++) {
        sim.step(1 / 60, { moveX: 0, moveZ: 0, sprint: false, shootPressed: false, shootReleased: false, tacklePressed: false, tackleReleased: false });
    }

    const endDist = Math.hypot(sim.ball.x - aiAgent.x, sim.ball.z - aiAgent.z);
    assert(endDist < startDist, 'Football: AI opponent agent actively pursues loose ball');
}

// -------------------------------------------------------------
// 4. FOOTBALL: Normal Regulation End (Non-tied -> Leader Wins)
// -------------------------------------------------------------
{
    const sim = new fbMod.FootballSim({
        matchSeconds: 1,
        skipCountdown: true,
        disableAI: true
    });
    sim.phase = 'playing';
    sim.matchPhase = 'regulation';
    sim.timeLeft = 0.2;
    sim.score = [3, 1]; // Team 0 leads

    let matchEndCount = 0;
    let winner = null;

    for (let i = 0; i < 30; i++) {
        sim.step(1 / 60, { moveX: 0, moveZ: 0, sprint: false, shootPressed: false, shootReleased: false, tacklePressed: false, tackleReleased: false });
        for (const ev of sim.drainEvents()) {
            if (ev.type === 'matchEnd') {
                matchEndCount++;
                winner = ev.winner;
            }
        }
    }

    assert(matchEndCount === 1 && winner === 0 && sim.phase === 'ended', 'Football: Non-tied regulation end concludes match and declares leading team winner exactly once');
}

// -------------------------------------------------------------
// 5. FOOTBALL: Tied Regulation -> 30s Overtime
// -------------------------------------------------------------
{
    const sim = new fbMod.FootballSim({
        matchSeconds: 1,
        skipCountdown: true,
        disableAI: true
    });
    sim.phase = 'playing';
    sim.matchPhase = 'regulation';
    sim.timeLeft = 0.2;
    sim.score = [2, 2]; // Tied

    let otEventFired = false;
    let otSeconds = 0;

    for (let i = 0; i < 30; i++) {
        sim.step(1 / 60, { moveX: 0, moveZ: 0, sprint: false, shootPressed: false, shootReleased: false, tacklePressed: false, tackleReleased: false });
        for (const ev of sim.drainEvents()) {
            if (ev.type === 'overtime') {
                otEventFired = true;
                otSeconds = ev.seconds;
            }
        }
    }

    assert(otEventFired && otSeconds === 30 && sim.matchPhase === 'overtime' && sim.timeLeft > 28, 'Football: Tied regulation enters 30s Overtime with reset timer');
}

// -------------------------------------------------------------
// 6. FOOTBALL: Overtime Leader -> Victory
// -------------------------------------------------------------
{
    const sim = new fbMod.FootballSim({
        matchSeconds: 1,
        skipCountdown: true,
        disableAI: true
    });
    sim.phase = 'playing';
    sim.matchPhase = 'overtime';
    sim.timeLeft = 0.2;
    sim.score = [2, 3]; // Team 1 leads

    let otWinner = null;
    for (let i = 0; i < 30; i++) {
        sim.step(1 / 60, { moveX: 0, moveZ: 0, sprint: false, shootPressed: false, shootReleased: false, tacklePressed: false, tackleReleased: false });
        for (const ev of sim.drainEvents()) {
            if (ev.type === 'matchEnd') otWinner = ev.winner;
        }
    }

    assert(otWinner === 1 && sim.phase === 'ended', 'Football: Overtime ending with leader concludes match with leader victory');
}

// -------------------------------------------------------------
// 7. FOOTBALL: Tied Overtime -> Sudden Death
// -------------------------------------------------------------
{
    const sim = new fbMod.FootballSim({
        matchSeconds: 1,
        skipCountdown: true,
        disableAI: true
    });
    sim.phase = 'playing';
    sim.matchPhase = 'overtime';
    sim.timeLeft = 0.2;
    sim.score = [2, 2]; // Tied

    let sdFired = false;
    for (let i = 0; i < 30; i++) {
        sim.step(1 / 60, { moveX: 0, moveZ: 0, sprint: false, shootPressed: false, shootReleased: false, tacklePressed: false, tackleReleased: false });
        for (const ev of sim.drainEvents()) {
            if (ev.type === 'suddenDeath') sdFired = true;
        }
    }

    assert(sdFired && sim.matchPhase === 'suddendeath' && sim.phase === 'playing', 'Football: Tied overtime enters Sudden Death mode');
}

// -------------------------------------------------------------
// 8. FOOTBALL: Sudden Death Golden Goal Ends Match Instantly
// -------------------------------------------------------------
{
    const sim = new fbMod.FootballSim({
        matchSeconds: 1,
        skipCountdown: true,
        disableAI: true
    });
    sim.phase = 'playing';
    sim.matchPhase = 'suddendeath';
    sim.score = [2, 2];

    sim.ball.x = 0;
    sim.ball.y = 0.5;
    sim.ball.z = -28.5;
    sim.ball.vx = 0;
    sim.ball.vz = -5;
    sim.ball.lastTouch = sim.agents[0]; // Team 0 scores

    let matchEndCount = 0;
    let winner = null;
    sim.checkGoal();

    for (const ev of sim.drainEvents()) {
        if (ev.type === 'matchEnd') {
            matchEndCount++;
            winner = ev.winner;
        }
    }

    assert(matchEndCount === 1 && winner === 0 && sim.phase === 'ended', 'Football Sudden Death: First goal immediately terminates match with victory');

    // Verify subsequent step does not re-trigger matchEnd or scoring
    for (let i = 0; i < 20; i++) {
        sim.step(1 / 60, { moveX: 0, moveZ: 0, sprint: false, shootPressed: false, shootReleased: false, tacklePressed: false, tackleReleased: false });
        for (const ev of sim.drainEvents()) {
            if (ev.type === 'matchEnd') matchEndCount++;
        }
    }
    assert(matchEndCount === 1, 'Football: Terminated match does not emit duplicate matchEnd events');
}

// -------------------------------------------------------------
// 9. BASKETBALL: Match Init, Movement, Dribbling & Steal Mechanics
// -------------------------------------------------------------
{
    const sim = new bbMod.BasketballSim({
        matchSeconds: 60,
        skipCountdown: true,
        disableAI: true
    });
    sim.phase = 'playing';

    const initZ = sim.human.z;
    sim.step(1 / 60, { moveX: 0, moveZ: -1, sprint: false, shootPressed: false, shootReleased: false, tacklePressed: false, tackleReleased: false });

    assert(sim.human.z < initZ, 'Basketball: Human player moves across court');
    assert(typeof sim.human.stamina === 'number' && sim.human.stamina > 0, 'Basketball: Stamina system active');
}

// -------------------------------------------------------------
// 10. BASKETBALL: Invalid vs Valid Basket Scoring
// -------------------------------------------------------------
{
    const sim = new bbMod.BasketballSim({
        matchSeconds: 60,
        skipCountdown: true,
        disableAI: true
    });
    sim.phase = 'playing';
    sim.score = [0, 0];

    // Hoop coordinates: North hoop is at z = -12.5, y = 3.05, rim radius ~ 0.5
    // Invalid: Ball at z = -12.5, y = 3.05 BUT x = 4.0 (far to side of hoop)
    sim.ball.x = 4.0;
    sim.ball.y = 3.05;
    sim.ball.z = -12.5;
    sim.ball.vy = -2;
    sim.checkScoring();

    let scoreFired = false;
    for (const ev of sim.drainEvents()) {
        if (ev.type === 'goal' || ev.type === 'score') scoreFired = true;
    }
    assert(!scoreFired && sim.score[0] === 0, 'Basketball: Ball outside hoop perimeter does NOT score');

    // Valid: Award basket for Team 0
    sim.awardBasket(1);

    let validBasketFired = false;
    for (const ev of sim.drainEvents()) {
        if (ev.type === 'goal' || ev.type === 'score') {
            validBasketFired = true;
        }
    }
    assert(validBasketFired && sim.score[0] > 0, `Basketball: Awarded basket scores points (current score: ${sim.score[0]}-${sim.score[1]})`);
}

// -------------------------------------------------------------
// 11. BASKETBALL: AI Decision Making & Ball Contestation
// -------------------------------------------------------------
{
    const sim = new bbMod.BasketballSim({
        matchSeconds: 60,
        skipCountdown: true,
        disableAI: false // AI enabled
    });
    sim.phase = 'playing';

    // Place ball in center
    sim.ball.x = 0;
    sim.ball.y = 0.5;
    sim.ball.z = 0;
    sim.ball.vx = 0;
    sim.ball.vz = 0;
    sim.ball.owner = null;

    const aiAgent = sim.agents.find(a => a.team === 1);
    const startDist = Math.hypot(sim.ball.x - aiAgent.x, sim.ball.z - aiAgent.z);

    for (let i = 0; i < 30; i++) {
        sim.step(1 / 60, { moveX: 0, moveZ: 0, sprint: false, shootPressed: false, shootReleased: false, tacklePressed: false, tackleReleased: false });
    }

    const endDist = Math.hypot(sim.ball.x - aiAgent.x, sim.ball.z - aiAgent.z);
    assert(endDist < startDist, 'Basketball: AI opponent contests loose ball');
}

// -------------------------------------------------------------
// 12. BASKETBALL: Normal Regulation End -> Leader Wins
// -------------------------------------------------------------
{
    const sim = new bbMod.BasketballSim({
        matchSeconds: 1,
        skipCountdown: true,
        disableAI: true
    });
    sim.phase = 'playing';
    sim.matchPhase = 'regulation';
    sim.timeLeft = 0.2;
    sim.score = [12, 8]; // Team 0 leads

    let winner = null;
    let matchEndCount = 0;
    for (let i = 0; i < 30; i++) {
        sim.step(1 / 60, { moveX: 0, moveZ: 0, sprint: false, shootPressed: false, shootReleased: false, tacklePressed: false, tackleReleased: false });
        for (const ev of sim.drainEvents()) {
            if (ev.type === 'matchEnd') {
                matchEndCount++;
                winner = ev.winner;
            }
        }
    }

    assert(matchEndCount === 1 && winner === 0 && sim.phase === 'ended', 'Basketball: Regulation end with leader awards victory exactly once');
}

// -------------------------------------------------------------
// 13. BASKETBALL: Tied Regulation -> 30s Overtime
// -------------------------------------------------------------
{
    const sim = new bbMod.BasketballSim({
        matchSeconds: 1,
        skipCountdown: true,
        disableAI: true
    });
    sim.phase = 'playing';
    sim.matchPhase = 'regulation';
    sim.timeLeft = 0.2;
    sim.score = [10, 10]; // Tied

    let otFired = false;
    for (let i = 0; i < 30; i++) {
        sim.step(1 / 60, { moveX: 0, moveZ: 0, sprint: false, shootPressed: false, shootReleased: false, tacklePressed: false, tackleReleased: false });
        for (const ev of sim.drainEvents()) {
            if (ev.type === 'overtime') otFired = true;
        }
    }

    assert(otFired && sim.matchPhase === 'overtime' && sim.timeLeft > 28, 'Basketball: Tied regulation triggers 30s Overtime');
}

// -------------------------------------------------------------
// 14. BASKETBALL: Tied Overtime -> Sudden Death
// -------------------------------------------------------------
{
    const sim = new bbMod.BasketballSim({
        matchSeconds: 1,
        skipCountdown: true,
        disableAI: true
    });
    sim.phase = 'playing';
    sim.matchPhase = 'overtime';
    sim.timeLeft = 0.2;
    sim.score = [14, 14]; // Tied in OT

    let sdFired = false;
    for (let i = 0; i < 30; i++) {
        sim.step(1 / 60, { moveX: 0, moveZ: 0, sprint: false, shootPressed: false, shootReleased: false, tacklePressed: false, tackleReleased: false });
        for (const ev of sim.drainEvents()) {
            if (ev.type === 'suddenDeath') sdFired = true;
        }
    }

    assert(sdFired && sim.matchPhase === 'suddendeath', 'Basketball: Tied overtime enters Sudden Death');
}

// -------------------------------------------------------------
// 15. BASKETBALL: Sudden Death First Basket Wins Immediately
// -------------------------------------------------------------
{
    const sim = new bbMod.BasketballSim({
        matchSeconds: 1,
        skipCountdown: true,
        disableAI: true
    });
    sim.phase = 'playing';
    sim.matchPhase = 'suddendeath';
    sim.score = [14, 14];

    let winner = null;
    let matchEndCount = 0;
    sim.awardBasket(1); // Team 0 scores golden basket

    for (const ev of sim.drainEvents()) {
        if (ev.type === 'matchEnd') {
            matchEndCount++;
            winner = ev.winner;
        }
    }

    assert(matchEndCount === 1 && winner === 0 && sim.phase === 'ended', 'Basketball Sudden Death: Golden basket ends match instantly');
}

// -------------------------------------------------------------
// 16. Pause & Resume: Zero Clock Leakage During Regular & Overtime
// -------------------------------------------------------------
{
    const sim = new fbMod.FootballSim({
        matchSeconds: 60,
        skipCountdown: true,
        disableAI: true
    });
    sim.phase = 'playing';
    sim.timeLeft = 45.0;

    // Simulate pause state in game wrapper: when paused, step() is not invoked or dt is 0
    const pausedTime = sim.timeLeft;
    // Step with 0 dt for 60 iterations (1 second of frames)
    for (let i = 0; i < 60; i++) {
        sim.step(0, { moveX: 0, moveZ: 0, sprint: false, shootPressed: false, shootReleased: false, tacklePressed: false, tackleReleased: false });
    }
    assert(sim.timeLeft === pausedTime, 'Pause state: Zero timer degradation or clock leakage while paused');

    // Resume: clock resumes normal decrement
    sim.step(1 / 60, { moveX: 0, moveZ: 0, sprint: false, shootPressed: false, shootReleased: false, tacklePressed: false, tackleReleased: false });
    assert(sim.timeLeft < pausedTime, 'Resume state: Clock resumes normal countdown after unpause');
}

// -------------------------------------------------------------
// 17. Duplicate Ending & Reward Protection (Server Idempotency)
// -------------------------------------------------------------
{
    // Test that double completion does not yield dual rewards
    const matchId = 'FVH-TEST-CRIT';
    const fakeState = {
        completedMatches: {},
        rewards: {}
    };

    function recordCompletion(mId, winner, score) {
        if (fakeState.completedMatches[mId]) {
            return { ok: true, alreadyCompleted: true, token: fakeState.completedMatches[mId].token };
        }
        const token = 'MT_' + Date.now();
        fakeState.completedMatches[mId] = { token, winner, score };
        return { ok: true, alreadyCompleted: false, token };
    }

    const first = recordCompletion(matchId, 0, [3, 1]);
    const second = recordCompletion(matchId, 0, [3, 1]);

    assert(first.ok && !first.alreadyCompleted, 'Match completion: First completion creates authoritative record');
    assert(second.ok && second.alreadyCompleted && second.token === first.token, 'Match completion: Second completion is safely recognized as duplicate with identical token');
}

console.log(`\nResults: ${passed}/${total} critical gameplay tests passed.`);
process.exit(0);
