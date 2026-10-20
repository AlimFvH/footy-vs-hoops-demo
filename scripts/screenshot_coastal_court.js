const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

async function captureCoastalCourt() {
    console.log('Launching Headless Chrome for Coastal Court 3D gameplay capture...');
    const chrome = spawn(chromePath, [
        '--headless=new',
        '--remote-debugging-port=9231',
        '--disable-gpu',
        '--no-sandbox',
        'about:blank'
    ]);

    await new Promise(r => setTimeout(r, 1200));

    try {
        const verRes = await fetch('http://127.0.0.1:9231/json/version');
        const ver = await verRes.json();
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
        const ws1 = new WebSocket(`ws://127.0.0.1:9231/devtools/page/${t1.targetId}`);
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

        await new Promise(r => setTimeout(r, 2000));

        // Equip Coastal Court and launch football match
        console.log('Equipping Coastal Sunset Court and launching football match via app.launch...');
        const launchRes = await send1('Runtime.evaluate', {
            expression: `
                (function() {
                    var app = window.__fvh;
                    if (app) {
                        app.store.update(function(d) {
                            if (!d.equipped) d.equipped = {};
                            d.equipped['stadium.footy'] = 'std_ocean_sunset';
                            d.equipped['stadium.hoops'] = 'std_ocean_sunset';
                        });
                        app.launch({ mode: 'footy', difficulty: 1, minutes: 2 }, false);
                        return { launched: true, state: app.state };
                    }
                    return { launched: false };
                })()
            `,
            returnByValue: true
        });
        console.log('Launch response:', launchRes.result.value);

        // Wait 3.5s for 3D arena to render frames, animations and ads
        await new Promise(r => setTimeout(r, 3500));

        console.log('Capturing football screenshot...');
        const snap1 = await send1('Page.captureScreenshot', { format: 'png' });
        const footyOut = path.join(
            'C:',
            'Users',
            'ASUS',
            '.gemini',
            'antigravity',
            'brain',
            '867d5f43-aefc-4485-baf3-3ce7b3f49ce3',
            'proof_coastal_sunset_football_gameplay.png'
        );
        fs.writeFileSync(footyOut, Buffer.from(snap1.data, 'base64'));
        console.log('[OK] Football coastal gameplay screenshot saved to:', footyOut);

        // Launch basketball match on Coastal Court
        console.log('Launching basketball match on Coastal Court...');
        await send1('Runtime.evaluate', {
            expression: `
                (function() {
                    var app = window.__fvh;
                    if (app) {
                        app.launch({ mode: 'hoops', difficulty: 1, minutes: 2 }, false);
                    }
                })()
            `
        });

        await new Promise(r => setTimeout(r, 3500));

        console.log('Capturing basketball screenshot...');
        const snap2 = await send1('Page.captureScreenshot', { format: 'png' });
        const hoopsOut = path.join(
            'C:',
            'Users',
            'ASUS',
            '.gemini',
            'antigravity',
            'brain',
            '867d5f43-aefc-4485-baf3-3ce7b3f49ce3',
            'proof_coastal_sunset_basketball_gameplay.png'
        );
        fs.writeFileSync(hoopsOut, Buffer.from(snap2.data, 'base64'));
        console.log('[OK] Basketball coastal gameplay screenshot saved to:', hoopsOut);

        ws1.close();
        ws.close();
    } finally {
        chrome.kill();
    }
}

captureCoastalCourt().catch(console.error);
