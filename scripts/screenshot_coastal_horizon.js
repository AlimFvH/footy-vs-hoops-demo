const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

async function captureForwardView() {
    console.log('Capturing forward view towards ocean horizon...');
    const chrome = spawn(chromePath, [
        '--headless=new',
        '--remote-debugging-port=9232',
        '--disable-gpu',
        '--no-sandbox',
        'about:blank'
    ]);

    let ver;
    for (let i = 0; i < 10; i++) {
        try {
            await new Promise(r => setTimeout(r, 600));
            const verRes = await fetch('http://127.0.0.1:9232/json/version');
            ver = await verRes.json();
            if (ver && ver.webSocketDebuggerUrl) break;
        } catch (e) {}
    }
    if (!ver) throw new Error('Could not connect to Chrome debugging port');
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

        const t1 = await send('Target.createTarget', { url: 'http://localhost:8099/index.html' });
        const ws1 = new WebSocket(`ws://127.0.0.1:9232/devtools/page/${t1.targetId}`);
        await new Promise(r => ws1.onopen = r);

        let id1 = 1;
        const cb1 = new Map();
        ws1.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.id && cb1.has(msg.id)) {
                cb1.get(msg.id)(msg);
                cb1.delete(msg.id);
            }
        };

        function send1(method, params = {}) {
            return new Promise((resolve, reject) => {
                const msgId = id1++;
                cb1.set(msgId, (res) => {
                    if (res.error) reject(new Error(res.error.message));
                    else resolve(res.result);
                });
                ws1.send(JSON.stringify({ id: msgId, method, params }));
            });
        }

        await send1('Page.enable');
        await send1('Runtime.enable');
        await send1('Emulation.setDeviceMetricsOverride', {
            width: 1200,
            height: 750,
            deviceScaleFactor: 1,
            mobile: false
        });

        await new Promise(r => setTimeout(r, 1500));

        await send1('Runtime.evaluate', {
            expression: `
                (function() {
                    var app = window.__fvh;
                    if (app) {
                        app.store.update(function(d) {
                            if (!d.equipped) d.equipped = {};
                            d.equipped['stadium.footy'] = 'std_ocean_sunset';
                        });
                        app.launch({ mode: 'footy', difficulty: 1, minutes: 2 }, false);
                    }
                })()
            `
        });

        // Wait 1.5s for kickoff
        await new Promise(r => setTimeout(r, 1500));

        // Move ball and player towards opponent goal (-Z) to bring ocean into view
        await send1('Runtime.evaluate', {
            expression: `
                (function() {
                    var app = window.__fvh;
                    if (app && app.game && app.game.sim) {
                        var sim = app.game.sim;
                        sim.human.z = -16;
                        sim.human.x = 0;
                        sim.ball.z = -18;
                        sim.ball.x = 0;
                        sim.ball.vx = 0;
                        sim.ball.vz = -1;
                    }
                })()
            `
        });

        // Wait 1.2s for camera to smooth follow
        await new Promise(r => setTimeout(r, 1200));

        console.log('Capturing forward view screenshot...');
        const snap = await send1('Page.captureScreenshot', { format: 'png' });
        const out = path.join(
            'C:',
            'Users',
            'ASUS',
            '.gemini',
            'antigravity',
            'brain',
            '867d5f43-aefc-4485-baf3-3ce7b3f49ce3',
            'proof_coastal_sunset_ocean_horizon.png'
        );
        fs.writeFileSync(out, Buffer.from(snap.data, 'base64'));
        console.log('[OK] Ocean horizon screenshot saved to:', out);

        ws1.close();
        ws.close();
    } finally {
        chrome.kill();
    }
}

captureForwardView().catch(console.error);
