const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function runCapture() {
    console.log('Starting headless Chrome for visual proof capture...');
    const chrome = spawn(chromePath, [
        '--headless=new',
        '--remote-debugging-port=9240',
        '--disable-gpu',
        '--no-sandbox',
        'about:blank'
    ]);

    let ver;
    for (let i = 0; i < 15; i++) {
        try {
            await new Promise(r => setTimeout(r, 500));
            const verRes = await fetch('http://127.0.0.1:9240/json/version');
            ver = await verRes.json();
            if (ver && ver.webSocketDebuggerUrl) break;
        } catch (e) {}
    }
    if (!ver) {
        chrome.kill();
        throw new Error('Could not connect to Chrome debugging port');
    }

    try {
        const ws = new WebSocket(ver.webSocketDebuggerUrl);
        let id = 1;
        const callbacks = new Map();
        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.id && callbacks.has(msg.id)) {
                callbacks.get(msg.id)(msg);
                callbacks.delete(msg.id);
            }
        };
        await new Promise(r => ws.onopen = r);

        function send(method, params = {}) {
            return new Promise((resolve, reject) => {
                const msgId = id++;
                callbacks.set(msgId, (res) => {
                    if (res.error) reject(new Error(res.error.message));
                    else resolve(res.result);
                });
                ws.send(JSON.stringify({ id: msgId, method, params }));
            });
        }

        async function createPageSession() {
            const t = await send('Target.createTarget', { url: 'http://localhost:8099/index.html' });
            const pageWs = new WebSocket(`ws://127.0.0.1:9240/devtools/page/${t.targetId}`);
            await new Promise(r => pageWs.onopen = r);

            let pageId = 1;
            const pageCallbacks = new Map();
            pageWs.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                if (msg.id && pageCallbacks.has(msg.id)) {
                    pageCallbacks.get(msg.id)(msg);
                    pageCallbacks.delete(msg.id);
                }
            };

            function pageSend(method, params = {}) {
                return new Promise((resolve, reject) => {
                    const msgId = pageId++;
                    pageCallbacks.set(msgId, (res) => {
                        if (res.error) reject(new Error(res.error.message));
                        else resolve(res.result);
                    });
                    pageWs.send(JSON.stringify({ id: msgId, method, params }));
                });
            }

            await pageSend('Page.enable');
            await pageSend('Runtime.enable');
            await pageSend('Emulation.setDeviceMetricsOverride', {
                width: 1280,
                height: 800,
                deviceScaleFactor: 1,
                mobile: false
            });

            return { ws: pageWs, send: pageSend, targetId: t.targetId };
        }

        // 1. Proof: Arena Selection Gallery with Badges
        console.log('Capturing Arena Selection Gallery with badging...');
        const s1 = await createPageSession();
        await new Promise(r => setTimeout(r, 1200));
        await s1.send('Runtime.evaluate', {
            expression: `
                (function() {
                    var app = window.__fvh;
                    if (app && app.showArenas) {
                        app.showArenas();
                    }
                })()
            `
        });
        await new Promise(r => setTimeout(r, 1200));
        const snap1 = await s1.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artifactDir, 'proof_arena_selection_gallery.png'), Buffer.from(snap1.data, 'base64'));
        console.log('[OK] Saved proof_arena_selection_gallery.png');
        s1.ws.close();

        // 2. Proof: Default Footy Classic Stadium with Spectator Stands and Crowds
        console.log('Capturing Default Football Stadium (Classic Grass with Spectator Stands)...');
        const s2 = await createPageSession();
        await new Promise(r => setTimeout(r, 1000));
        await s2.send('Runtime.evaluate', {
            expression: `
                (function() {
                    var app = window.__fvh;
                    if (app) {
                        app.store.update(function(d) {
                            if (!d.equipped) d.equipped = {};
                            d.equipped['stadium.footy'] = 'std_footy_classic';
                        });
                        app.launch({ mode: 'footy', difficulty: 1, minutes: 2 }, false);
                    }
                })()
            `
        });
        await new Promise(r => setTimeout(r, 1800));
        // Rotate camera slightly or position player to show the grandstands and crowd clearly
        await s2.send('Runtime.evaluate', {
            expression: `
                (function() {
                    var app = window.__fvh;
                    if (app && app.game && app.game.sim) {
                        var sim = app.game.sim;
                        sim.human.z = 6;
                        sim.human.x = -4;
                        sim.ball.z = 5;
                        sim.ball.x = -3;
                    }
                })()
            `
        });
        await new Promise(r => setTimeout(r, 1000));
        const snap2 = await s2.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artifactDir, 'proof_default_footy_classic_stadium.png'), Buffer.from(snap2.data, 'base64'));
        console.log('[OK] Saved proof_default_footy_classic_stadium.png');
        s2.ws.close();

        // 3. Proof: Default Hoops Street Classic Stadium with Spectator Stands
        console.log('Capturing Default Basketball Stadium (Street Classic with Spectator Stands)...');
        const s3 = await createPageSession();
        await new Promise(r => setTimeout(r, 1000));
        await s3.send('Runtime.evaluate', {
            expression: `
                (function() {
                    var app = window.__fvh;
                    if (app) {
                        app.store.update(function(d) {
                            if (!d.equipped) d.equipped = {};
                            d.equipped['stadium.hoops'] = 'std_hoops_street';
                        });
                        app.launch({ mode: 'hoops', difficulty: 1, minutes: 2 }, false);
                    }
                })()
            `
        });
        await new Promise(r => setTimeout(r, 1800));
        const snap3 = await s3.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artifactDir, 'proof_default_hoops_street_stadium.png'), Buffer.from(snap3.data, 'base64'));
        console.log('[OK] Saved proof_default_hoops_street_stadium.png');
        s3.ws.close();

        // 4. Proof: Themed Arena - Redwood Forest (No Spectator Stands, Open Redwoods & Forest Cabin)
        console.log('Capturing Themed Arena (Redwood Forest - Open Nature, Zero Stands)...');
        const s4 = await createPageSession();
        await new Promise(r => setTimeout(r, 1000));
        await s4.send('Runtime.evaluate', {
            expression: `
                (function() {
                    var app = window.__fvh;
                    if (app) {
                        app.store.update(function(d) {
                            if (!d.equipped) d.equipped = {};
                            d.equipped['stadium.footy'] = 'std_forest_redwood';
                        });
                        app.launch({ mode: 'footy', difficulty: 1, minutes: 2 }, false);
                    }
                })()
            `
        });
        await new Promise(r => setTimeout(r, 1500));
        // Move towards center-forward to showcase panoramic redwoods
        await s4.send('Runtime.evaluate', {
            expression: `
                (function() {
                    var app = window.__fvh;
                    if (app && app.game && app.game.sim) {
                        var sim = app.game.sim;
                        sim.human.z = -14;
                        sim.human.x = 2;
                        sim.ball.z = -15;
                        sim.ball.x = 2;
                    }
                })()
            `
        });
        await new Promise(r => setTimeout(r, 1200));
        const snap4 = await s4.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artifactDir, 'proof_themed_redwood_forest.png'), Buffer.from(snap4.data, 'base64'));
        console.log('[OK] Saved proof_themed_redwood_forest.png');
        s4.ws.close();

        // 5. Proof: Themed Arena - Apollo Lunar Arena (Moon Crater, Starfield, Lunar Module, Zero Stands)
        console.log('Capturing Themed Arena (Apollo Lunar Arena - Space & Moon, Zero Stands)...');
        const s5 = await createPageSession();
        await new Promise(r => setTimeout(r, 1000));
        await s5.send('Runtime.evaluate', {
            expression: `
                (function() {
                    var app = window.__fvh;
                    if (app) {
                        app.store.update(function(d) {
                            if (!d.equipped) d.equipped = {};
                            d.equipped['stadium.hoops'] = 'std_moon_crater';
                        });
                        app.launch({ mode: 'hoops', difficulty: 1, minutes: 2 }, false);
                    }
                })()
            `
        });
        await new Promise(r => setTimeout(r, 1500));
        await s5.send('Runtime.evaluate', {
            expression: `
                (function() {
                    var app = window.__fvh;
                    if (app && app.game && app.game.sim) {
                        var sim = app.game.sim;
                        sim.human.z = -8;
                        sim.human.x = 0;
                        sim.ball.z = -9;
                        sim.ball.x = 0;
                    }
                })()
            `
        });
        await new Promise(r => setTimeout(r, 1200));
        const snap5 = await s5.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artifactDir, 'proof_themed_moon_crater.png'), Buffer.from(snap5.data, 'base64'));
        console.log('[OK] Saved proof_themed_moon_crater.png');
        s5.ws.close();

        // 6. Proof: HD Ball and Active 3D Boost Energy Aura
        console.log('Capturing HD Ball & Active 3D Boost Energy Aura...');
        const s6 = await createPageSession();
        await new Promise(r => setTimeout(r, 1000));
        await s6.send('Runtime.evaluate', {
            expression: `
                (function() {
                    var app = window.__fvh;
                    if (app) {
                        app.armedBoost = 'boost_turbo';
                        app.store.update(function(d) {
                            if (!d.equipped) d.equipped = {};
                            d.equipped['ball.footy'] = 'ball_footy_fire';
                            d.equipped.boost = 'boost_turbo';
                        });
                        app.launch({ mode: 'footy', difficulty: 1, minutes: 2, boostId: 'boost_turbo' }, false);
                    }
                })()
            `
        });
        await new Promise(r => setTimeout(r, 1500));
        await s6.send('Runtime.evaluate', {
            expression: `
                (function() {
                    var app = window.__fvh;
                    if (app && app.game && app.game.sim) {
                        var sim = app.game.sim;
                        // Bring ball and human close together in front of camera
                        sim.human.z = 2;
                        sim.human.x = 0;
                        sim.ball.z = 1.2;
                        sim.ball.x = 0.5;
                        sim.ball.vx = 0;
                        sim.ball.vz = 0;
                    }
                })()
            `
        });
        await new Promise(r => setTimeout(r, 1200));
        const snap6 = await s6.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artifactDir, 'proof_hd_ball_and_boost_aura.png'), Buffer.from(snap6.data, 'base64'));
        console.log('[OK] Saved proof_hd_ball_and_boost_aura.png');
        s6.ws.close();

        ws.close();
        console.log('All 6 visual proof screenshots successfully captured!');
    } finally {
        chrome.kill();
    }
}

runCapture().catch(e => {
    console.error('Capture failed:', e);
    process.exit(1);
});
