const { spawn } = require('child_process');
const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

async function test() {
    const chrome = spawn(chromePath, ['--headless=new', '--remote-debugging-port=9241', '--disable-gpu', '--no-sandbox', 'about:blank']);
    try {
        await new Promise(r => setTimeout(r, 800));
        const ver = await (await fetch('http://127.0.0.1:9241/json/version')).json();
        const ws = new WebSocket(ver.webSocketDebuggerUrl);
        await new Promise(r => ws.onopen = r);
        let id = 1;
        const cb = new Map();
        ws.onmessage = (e) => {
            const m = JSON.parse(e.data);
            if (m.id && cb.has(m.id)) { cb.get(m.id)(m); cb.delete(m.id); }
        };
        const send = (method, params = {}) => new Promise((res, rej) => {
            const msgId = id++;
            cb.set(msgId, r => r.error ? rej(new Error(r.error.message)) : res(r.result));
            ws.send(JSON.stringify({ id: msgId, method, params }));
        });
        const t = await send('Target.createTarget', { url: 'http://localhost:8099/index.html' });
        const wsPage = new WebSocket('ws://127.0.0.1:9241/devtools/page/' + t.targetId);
        await new Promise(r => wsPage.onopen = r);
        let pid = 1;
        const pcb = new Map();
        wsPage.onmessage = (e) => {
            const m = JSON.parse(e.data);
            if (m.method === 'Runtime.consoleAPICalled') {
                console.log('CONSOLE:', m.params.type, m.params.args.map(a => a.value || a.description).join(' '));
            }
            if (m.method === 'Runtime.exceptionThrown') {
                console.error('EXCEPTION:', JSON.stringify(m.params.exceptionDetails));
            }
            if (m.id && pcb.has(m.id)) { pcb.get(m.id)(m); pcb.delete(m.id); }
        };
        const psend = (method, params = {}) => new Promise((res, rej) => {
            const msgId = pid++;
            pcb.set(msgId, r => r.error ? rej(new Error(r.error.message)) : res(r.result));
            wsPage.send(JSON.stringify({ id: msgId, method, params }));
        });
        await psend('Page.enable');
        await psend('Runtime.enable');
        await new Promise(r => setTimeout(r, 2000));
        const res = await psend('Runtime.evaluate', {
            expression: 'typeof window.__fvh',
            returnByValue: true
        });
        console.log('__fvh defined:', res);

        const launchRes = await psend('Runtime.evaluate', {
            expression: `(function() {
                var a = window.__fvh;
                if(!a) return "no app";
                a.store.update(function(d){
                    if(!d.equipped) d.equipped = {};
                    d.equipped["stadium.footy"] = "std_footy_classic";
                });
                a.launch({ mode: "footy", difficulty: 1, minutes: 2 }, false);
                return "launched successfully";
            })()`,
            returnByValue: true
        });
        console.log('Launch result:', launchRes);

        await new Promise(r => setTimeout(r, 2500));
        const status = await psend('Runtime.evaluate', {
            expression: 'window.__fvh && window.__fvh.game ? ("game active: " + !!window.__fvh.game.sim + ", root children: " + (window.__fvh.game.view && window.__fvh.game.view.scene && window.__fvh.game.view.scene.root.children.length)) : "no game"',
            returnByValue: true
        });
        console.log('Game status:', status);

        const snap = await psend('Page.captureScreenshot', { format: 'png' });
        console.log('Screenshot length:', snap.data.length);
    } finally {
        chrome.kill();
    }
}
test().catch(console.error);
