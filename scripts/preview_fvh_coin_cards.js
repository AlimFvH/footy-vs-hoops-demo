const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

// Function to generate the master FvH coin face definition
function getMasterFvhCoinSvg(opts = {}) {
  const size = opts.size || 72;
  const id = opts.id || 'pkg_coins_starter';
  const uid = 'coin_' + Math.random().toString(36).substr(2, 6);

  // Milled gold beads
  let beads = '';
  for (let i = 0; i < 24; i++) {
    const a = (i * 360 / 24) * Math.PI / 180;
    const bx = 50 + 44.5 * Math.cos(a);
    const by = 50 + 44.5 * Math.sin(a);
    beads += `<circle cx="${bx.toFixed(2)}" cy="${by.toFixed(2)}" r="1.4" fill="#fde047"/>`;
  }

  // Master Coin Face definition (centered at 50,50, radius ~48)
  const masterDef = `
    <g id="masterCoin_${uid}">
      <!-- Outer Drop Shadow & Gold Rim -->
      <circle cx="50" cy="52.5" r="47" fill="#381402"/>
      <circle cx="50" cy="50" r="47" fill="url(#rim_${uid})"/>
      <circle cx="50" cy="50" r="44.5" fill="none" stroke="#78350f" stroke-width="0.8"/>
      ${beads}
      <circle cx="50" cy="50" r="40.5" fill="#1e293b"/>
      <!-- Split Court/Turf -->
      <g clip-path="url(#innerClip_${uid})">
        <!-- Football Emerald Left -->
        <rect x="9" y="9" width="41.2" height="82" fill="url(#green_${uid})"/>
        <path d="M42 30 A20 20 0 0 0 42 70" stroke="#ffffff" stroke-width="1.8" stroke-opacity="0.35" fill="none"/>
        <circle cx="50" cy="50" r="16" stroke="#ffffff" stroke-width="1.2" stroke-opacity="0.25" fill="none"/>
        <!-- Basketball Fiery Orange Right -->
        <rect x="50" y="9" width="41.2" height="82" fill="url(#orange_${uid})"/>
        <path d="M58 30 A20 20 0 0 1 58 70" stroke="#000000" stroke-width="2.2" stroke-opacity="0.35" fill="none"/>
        <path d="M50 20 C68 28 78 40 78 50 C78 60 68 72 50 80" stroke="#000000" stroke-width="1.8" stroke-opacity="0.25" fill="none"/>
        <!-- Gold Seam -->
        <line x1="50.1" y1="9" x2="50.1" y2="91" stroke="#fde047" stroke-width="2.2"/>
        <line x1="50.1" y1="9" x2="50.1" y2="91" stroke="#ffffff" stroke-width="0.8"/>
      </g>
      <circle cx="50" cy="50" r="39.5" fill="none" stroke="#fde047" stroke-width="1.3"/>
      <!-- Stars at top and bottom -->
      <path d="M50 17 L51.5 19.5 L54 20 L52 21.8 L52.6 24.2 L50 22.8 L47.4 24.2 L48 21.8 L46 20 L48.5 19.5 Z" fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.5))"/>
      <path d="M50 78 L51.2 80 L53.5 80.5 L51.8 82 L52.4 84.2 L50 83 L47.6 84.2 L48.2 82 L46.5 80.5 L48.8 80 Z" fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.5))"/>
      <!-- FvH Chiseled Text -->
      <text x="50" y="55" font-family="Impact, Arial Black, sans-serif" font-size="30" font-weight="900" fill="#000000" text-anchor="middle" letter-spacing="-0.5" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.9))">FvH</text>
      <text x="50" y="53.5" font-family="Impact, Arial Black, sans-serif" font-size="30" font-weight="900" fill="#2a0f02" text-anchor="middle" letter-spacing="-0.5">FvH</text>
      <text x="50" y="51.5" font-family="Impact, Arial Black, sans-serif" font-size="30" font-weight="900" fill="url(#fvh_${uid})" text-anchor="middle" letter-spacing="-0.5" stroke="#ffffff" stroke-width="0.9">FvH</text>
      <!-- COIN Plaque -->
      <rect x="29" y="60.5" width="42" height="14" rx="7" fill="#090d16" filter="drop-shadow(0 2px 5px rgba(0,0,0,0.8))"/>
      <rect x="29" y="60.5" width="42" height="14" rx="7" fill="url(#plaque_${uid})" stroke="#ffffff" stroke-width="0.8"/>
      <text x="50" y="71" font-family="Arial Black, sans-serif" font-size="9" font-weight="900" fill="#381402" text-anchor="middle" letter-spacing="1.5">COIN</text>
      <!-- Glass Sheen Arc -->
      <path d="M12 40 A42 42 0 0 1 88 40 A46 43 0 0 0 12 40 Z" fill="url(#sheen_${uid})"/>
      <!-- Sparkle -->
      <path d="M22 21 Q22 27 16 27 Q22 27 22 33 Q22 27 28 27 Q22 27 22 21 Z" fill="#ffffff" filter="drop-shadow(0 0 4px #ffffff)"/>
      <circle cx="22" cy="27" r="6" fill="#fde047" opacity="0.6"/>
    </g>
  `;

  // Depending on package, build layout
  let content = '';
  if (id === 'pkg_coins_starter' || id === 'coins' || id === 'single') {
    // Single authentic FvH coin (facing front, 100% crisp!)
    content = `
      <use href="#masterCoin_${uid}" x="0" y="0"/>
    `;
  } else if (id === 'pkg_coins_pro') {
    // 2 Authentic Coins cluster
    content = `
      <g filter="drop-shadow(0 6px 12px rgba(0,0,0,0.7))">
        <g transform="translate(20, 22) scale(0.72) rotate(-14 50 50)">
          <use href="#masterCoin_${uid}"/>
        </g>
      </g>
      <g filter="drop-shadow(0 8px 16px rgba(0,0,0,0.8))">
        <g transform="translate(42, 34) scale(0.82) rotate(6 50 50)">
          <use href="#masterCoin_${uid}"/>
        </g>
      </g>
      <polygon points="82,24 84,18 86,24 92,26 86,28 84,34 82,28 76,26" fill="#ffffff" filter="drop-shadow(0 0 3px #fff)"/>
    `;
  } else if (id === 'pkg_coins_elite') {
    // 3 Authentic Coins cluster
    content = `
      <g filter="drop-shadow(0 6px 12px rgba(0,0,0,0.7))">
        <g transform="translate(14, 18) scale(0.68) rotate(-18 50 50)">
          <use href="#masterCoin_${uid}"/>
        </g>
      </g>
      <g filter="drop-shadow(0 6px 12px rgba(0,0,0,0.7))">
        <g transform="translate(54, 18) scale(0.68) rotate(18 50 50)">
          <use href="#masterCoin_${uid}"/>
        </g>
      </g>
      <g filter="drop-shadow(0 10px 20px rgba(0,0,0,0.85))">
        <g transform="translate(34, 34) scale(0.84)">
          <use href="#masterCoin_${uid}"/>
        </g>
      </g>
      <polygon points="20,18 22,12 24,18 30,20 24,22 22,28 20,22 14,20" fill="#ffffff" filter="drop-shadow(0 0 3px #fff)"/>
      <polygon points="86,28 88,22 90,28 96,30 90,32 88,38 86,32 80,30" fill="#fde047" filter="drop-shadow(0 0 3px #fde047)"/>
    `;
  } else if (id === 'pkg_coins_champion') {
    // 4 Authentic Coins pyramid with golden champion aura
    content = `
      <!-- Back Top Coin -->
      <g filter="drop-shadow(0 4px 8px rgba(0,0,0,0.7))">
        <g transform="translate(34, 12) scale(0.62)">
          <use href="#masterCoin_${uid}"/>
        </g>
      </g>
      <!-- Mid Left Coin -->
      <g filter="drop-shadow(0 6px 12px rgba(0,0,0,0.7))">
        <g transform="translate(14, 26) scale(0.70) rotate(-15 50 50)">
          <use href="#masterCoin_${uid}"/>
        </g>
      </g>
      <!-- Mid Right Coin -->
      <g filter="drop-shadow(0 6px 12px rgba(0,0,0,0.7))">
        <g transform="translate(54, 26) scale(0.70) rotate(15 50 50)">
          <use href="#masterCoin_${uid}"/>
        </g>
      </g>
      <!-- Front Star Coin -->
      <g filter="drop-shadow(0 10px 22px rgba(0,0,0,0.9))">
        <g transform="translate(34, 38) scale(0.86)">
          <use href="#masterCoin_${uid}"/>
        </g>
      </g>
      <polygon points="50,6 52,0 54,6 60,8 54,10 52,16 50,10 44,8" fill="#ffffff" filter="drop-shadow(0 0 4px #fff)"/>
      <polygon points="16,40 18,34 20,40 26,42 20,44 18,50 16,44 10,42" fill="#fef08a"/>
      <polygon points="90,44 92,38 94,44 100,46 94,48 92,54 90,48 84,46" fill="#fef08a"/>
    `;
  } else {
    // Legend: 5 Authentic Coins with radiant starburst aura
    content = `
      <circle cx="50" cy="50" r="48" fill="url(#legendGlow_${uid})"/>
      <!-- 2 Far Back Coins -->
      <g transform="translate(18, 10) scale(0.58) rotate(-22 50 50)">
        <use href="#masterCoin_${uid}"/>
      </g>
      <g transform="translate(52, 10) scale(0.58) rotate(22 50 50)">
        <use href="#masterCoin_${uid}"/>
      </g>
      <!-- 2 Mid Coins -->
      <g transform="translate(12, 28) scale(0.68) rotate(-12 50 50)">
        <use href="#masterCoin_${uid}"/>
      </g>
      <g transform="translate(56, 28) scale(0.68) rotate(12 50 50)">
        <use href="#masterCoin_${uid}"/>
      </g>
      <!-- Front Supreme Center Coin -->
      <g filter="drop-shadow(0 12px 24px rgba(0,0,0,0.95))">
        <g transform="translate(34, 36) scale(0.88)">
          <use href="#masterCoin_${uid}"/>
        </g>
      </g>
      <polygon points="50,2 53,-4 56,2 62,4 56,6 53,12 50,6 44,4" fill="#ffffff" filter="drop-shadow(0 0 5px #fff)"/>
      <polygon points="86,20 88,14 90,20 96,22 90,24 88,30 86,24 80,22" fill="#fef08a"/>
      <polygon points="12,22 14,16 16,22 22,24 16,26 14,32 12,26 6,24" fill="#fef08a"/>
    `;
  }

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto;filter:drop-shadow(0 6px 16px rgba(245,158,11,0.4));">
      <defs>
        <linearGradient id="rim_${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="15%" stop-color="#fffbeb"/>
          <stop offset="35%" stop-color="#fde047"/>
          <stop offset="65%" stop-color="#ca8a04"/>
          <stop offset="88%" stop-color="#eab308"/>
          <stop offset="100%" stop-color="#713f12"/>
        </linearGradient>
        <radialGradient id="green_${uid}" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#6ee7b7"/>
          <stop offset="35%" stop-color="#10b981"/>
          <stop offset="75%" stop-color="#047857"/>
          <stop offset="100%" stop-color="#064e3b"/>
        </radialGradient>
        <radialGradient id="orange_${uid}" cx="65%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#fed7aa"/>
          <stop offset="35%" stop-color="#f97316"/>
          <stop offset="75%" stop-color="#ea580c"/>
          <stop offset="100%" stop-color="#7c2d12"/>
        </radialGradient>
        <linearGradient id="plaque_${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="25%" stop-color="#fef08a"/>
          <stop offset="60%" stop-color="#eab308"/>
          <stop offset="100%" stop-color="#854d0e"/>
        </linearGradient>
        <linearGradient id="fvh_${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="40%" stop-color="#fffbeb"/>
          <stop offset="75%" stop-color="#fde047"/>
          <stop offset="100%" stop-color="#ca8a04"/>
        </linearGradient>
        <linearGradient id="sheen_${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/>
          <stop offset="35%" stop-color="#ffffff" stop-opacity="0.12"/>
          <stop offset="65%" stop-color="#ffffff" stop-opacity="0"/>
        </linearGradient>
        <radialGradient id="legendGlow_${uid}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fde047" stop-opacity="0.45"/>
          <stop offset="70%" stop-color="#ea580c" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="#ca8a04" stop-opacity="0"/>
        </radialGradient>
        <clipPath id="innerClip_${uid}">
          <circle cx="50" cy="50" r="39.5"/>
        </clipPath>
        ${masterDef}
      </defs>
      ${content}
    </svg>
  `;
}

// Crisp Vector Inline Icon
function getCrispInlineCoinSvg(size = 20) {
  const uid = 'in_' + Math.random().toString(36).substr(2, 6);
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;flex-shrink:0;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
      <defs>
        <linearGradient id="inRim_${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="30%" stop-color="#fde047"/>
          <stop offset="70%" stop-color="#ca8a04"/>
          <stop offset="100%" stop-color="#713f12"/>
        </linearGradient>
        <clipPath id="inClip_${uid}">
          <circle cx="12" cy="12" r="8.2"/>
        </clipPath>
      </defs>
      <!-- Base & Rim -->
      <circle cx="12" cy="12.8" r="10.5" fill="#381402"/>
      <circle cx="12" cy="12" r="10.5" fill="url(#inRim_${uid})"/>
      <circle cx="12" cy="12" r="8.2" fill="#0f172a"/>
      <!-- Split 50% Green / 50% Orange -->
      <g clip-path="url(#inClip_${uid})">
        <rect x="3.5" y="3.5" width="8.5" height="17" fill="#10b981"/>
        <rect x="12" y="3.5" width="8.5" height="17" fill="#f97316"/>
        <line x1="12" y1="3.5" x2="12" y2="20.5" stroke="#fef08a" stroke-width="0.9"/>
      </g>
      <!-- Vector Geometric High-Legibility F v H -->
      <!-- Letter F -->
      <path d="M6 7.8 H9 M6 7.8 V16.2 M6 11.5 H8.5" stroke="#000000" stroke-width="1.8" stroke-linecap="square"/>
      <path d="M6 7.8 H9 M6 7.8 V16.2 M6 11.5 H8.5" stroke="#ffffff" stroke-width="1.1" stroke-linecap="square"/>
      <!-- Letter v -->
      <path d="M10.2 10.8 L12 16.2 L13.8 10.8" stroke="#000000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10.2 10.8 L12 16.2 L13.8 10.8" stroke="#fef08a" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- Letter H -->
      <path d="M15 7.8 V16.2 M15 12 H18 M18 7.8 V16.2" stroke="#000000" stroke-width="1.8" stroke-linecap="square"/>
      <path d="M15 7.8 V16.2 M15 12 H18 M18 7.8 V16.2" stroke="#ffffff" stroke-width="1.1" stroke-linecap="square"/>
      <!-- Corner Specular Dot -->
      <circle cx="6" cy="6" r="1.1" fill="#ffffff"/>
    </svg>
  `;
}

// Build preview page
const pageHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {
    background: #090d16;
    color: #fff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    padding: 30px;
  }
  .card {
    width: 170px;
    background: linear-gradient(135deg, rgba(28, 22, 45, 0.95) 0%, rgba(14, 11, 26, 0.98) 100%);
    border: 1.5px solid rgba(255, 200, 0, 0.45);
    border-radius: 12px;
    padding: 12px;
    display: inline-block;
    margin: 8px;
    vertical-align: top;
    box-sizing: border-box;
  }
  .thumb {
    width: 72px;
    height: 72px;
    margin: 10px auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .badge {
    background: #eab308;
    color: #000;
    font-size: 10px;
    font-weight: 900;
    padding: 2px 6px;
    border-radius: 4px;
  }
  .amount {
    font-size: 11px;
    font-weight: 900;
    color: #fde047;
    display: inline-flex;
    align-items: center;
    gap: 3px;
  }
  .title {
    font-size: 13px;
    font-weight: 800;
    color: #ffffff;
    margin-bottom: 4px;
    text-align: left;
  }
  .desc {
    font-size: 11px;
    color: #94a3b8;
    line-height: 1.3;
    margin-bottom: 8px;
    text-align: left;
  }
  .price {
    font-size: 12px;
    font-weight: 900;
    color: #facc15;
    text-align: left;
  }
  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
  h2 {
    color: #facc15;
    border-bottom: 1px solid rgba(250,204,21,0.2);
    padding-bottom: 8px;
  }
</style>
</head>
<body>
  <h2>Fixed Shop Cards with Master FvH Coin Art</h2>
  <div class="row">
    <!-- Starter -->
    <div class="card">
      <div class="head">
        <span class="badge">STARTER</span>
        <span class="amount">${getCrispInlineCoinSvg(20)} +500</span>
      </div>
      <div class="thumb">${getMasterFvhCoinSvg({ id: 'pkg_coins_starter', size: 72 })}</div>
      <div class="title">Стартовый: 500 FvH Монет</div>
      <div class="desc">500 FvH Coin for quick cosmetics & early match boosts.</div>
      <div class="price">50 ⭐ Stars</div>
    </div>

    <!-- Pro -->
    <div class="card">
      <div class="head">
        <span class="badge">POPULAR</span>
        <span class="amount">${getCrispInlineCoinSvg(20)} +1,200</span>
      </div>
      <div class="thumb">${getMasterFvhCoinSvg({ id: 'pkg_coins_pro', size: 72 })}</div>
      <div class="title">Профи: 1,200 Монет</div>
      <div class="desc">1,200 FvH Coin. Unlocks rare kits and signature balls.</div>
      <div class="price">100 ⭐ Stars</div>
    </div>

    <!-- Elite -->
    <div class="card">
      <div class="head">
        <span class="badge">ELITE VALUE</span>
        <span class="amount">${getCrispInlineCoinSvg(20)} +2,800</span>
      </div>
      <div class="thumb">${getMasterFvhCoinSvg({ id: 'pkg_coins_elite', size: 72 })}</div>
      <div class="title">Элитный: 2,800 Монет</div>
      <div class="desc">2,800 FvH Coin. Enough for scenic themed arenas & bundles.</div>
      <div class="price">200 ⭐ Stars</div>
    </div>

    <!-- Champion -->
    <div class="card">
      <div class="head">
        <span class="badge">CHAMPION</span>
        <span class="amount">${getCrispInlineCoinSvg(20)} +6,500</span>
      </div>
      <div class="thumb">${getMasterFvhCoinSvg({ id: 'pkg_coins_champion', size: 72 })}</div>
      <div class="title">Чемпион: 6,500 Монет</div>
      <div class="desc">6,500 FvH Coin. Unlock legendary stadium environments.</div>
      <div class="price">400 ⭐ Stars</div>
    </div>

    <!-- Legend -->
    <div class="card">
      <div class="head">
        <span class="badge">BEST VALUE</span>
        <span class="amount">${getCrispInlineCoinSvg(20)} +15,000</span>
      </div>
      <div class="thumb">${getMasterFvhCoinSvg({ id: 'pkg_coins_legend', size: 72 })}</div>
      <div class="title">Легенда: 15,000 Монет</div>
      <div class="desc">15,000 FvH Coin. Complete boutique wardrobe access.</div>
      <div class="price">800 ⭐ Stars</div>
    </div>
  </div>

  <h2>Master Coin Large View (120px) & Vector Inline (20px, 40px, 60px)</h2>
  <div style="display:flex;align-items:center;gap:30px;background:#1e293b;padding:20px;border-radius:12px;width:fit-content;">
    <div>${getMasterFvhCoinSvg({ id: 'pkg_coins_starter', size: 120 })}</div>
    <div>
      <div style="font-size:14px;color:#94a3b8;margin-bottom:6px;">Inline Crisp Vector (20px):</div>
      <div style="display:flex;align-items:center;gap:10px;font-size:16px;font-weight:900;color:#fde047;">
        ${getCrispInlineCoinSvg(20)} <span>500 FvH Coin</span>
      </div>
      <div style="font-size:14px;color:#94a3b8;margin-top:14px;margin-bottom:6px;">Zoomed 2x (40px):</div>
      <div>${getCrispInlineCoinSvg(40)}</div>
      <div style="font-size:14px;color:#94a3b8;margin-top:14px;margin-bottom:6px;">Zoomed 3x (60px):</div>
      <div>${getCrispInlineCoinSvg(60)}</div>
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync('./artifacts_test_cards.html', pageHtml);
console.log('Written ./artifacts_test_cards.html');

async function capture() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9241',
    '--disable-gpu',
    '--window-size=1020,800',
    '--no-sandbox',
    'about:blank'
  ]);

  let ver;
  for (let i = 0; i < 25; i++) {
    try {
      await new Promise(r => setTimeout(r, 300));
      const res = await fetch('http://127.0.0.1:9241/json/version');
      ver = await res.json();
      if (ver && ver.webSocketDebuggerUrl) break;
    } catch (e) {}
  }

  const browserWs = new WebSocket(ver.webSocketDebuggerUrl);
  let bid = 1;
  const bCallbacks = new Map();
  browserWs.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && bCallbacks.has(msg.id)) {
      bCallbacks.get(msg.id)(msg);
      bCallbacks.delete(msg.id);
    }
  };
  await new Promise(r => browserWs.onopen = r);

  function sendBrowser(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = bid++;
      bCallbacks.set(msgId, (res) => {
        if (res.error) reject(new Error(res.error.message));
        else resolve(res.result);
      });
      browserWs.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  const { targetId } = await sendBrowser('Target.createTarget', { url: 'about:blank' });
  const pageWs = new WebSocket(`ws://127.0.0.1:9241/devtools/page/${targetId}`);
  await new Promise(r => pageWs.onopen = r);

  let pid = 1;
  const pCallbacks = new Map();
  pageWs.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pCallbacks.has(msg.id)) {
      pCallbacks.get(msg.id)(msg);
      pCallbacks.delete(msg.id);
    }
  };

  function sendPage(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = pid++;
      pCallbacks.set(msgId, (res) => {
        if (res.error) reject(new Error(res.error.message));
        else resolve(res.result);
      });
      pageWs.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await sendPage('Page.enable');
  const fileUrl = 'file:///' + path.resolve('./artifacts_test_cards.html').replace(/\\/g, '/');
  console.log('Navigating to', fileUrl);
  await sendPage('Page.navigate', { url: fileUrl });
  await new Promise(r => setTimeout(r, 1500));

  const screenshot = await sendPage('Page.captureScreenshot', { format: 'png' });
  const outPath = path.join(artifactDir, 'fvh_cards_and_inline_fixed.png');
  fs.writeFileSync(outPath, Buffer.from(screenshot.data, 'base64'));
  console.log('Captured screenshot to:', outPath);

  try { chrome.kill(); } catch (e) {}
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
