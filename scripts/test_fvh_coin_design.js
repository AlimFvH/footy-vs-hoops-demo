const fs = require('fs');

function getFvhCoinSvg(size, extraOpts) {
  var isInline = size === 'inline';
  var isLg = size === 'large';
  var isMed = size === 'medium' || (!isInline && !isLg);
  
  var w = isInline ? 20 : (isLg ? 160 : 64);
  var h = w;
  var uid = 'fvhCoin_' + Math.random().toString(36).substr(2, 6);

  if (isInline) {
    // Compact high-contrast 20x20 inline coin badge for price tags & HUD
    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;flex-shrink:0;">' +
      '<circle cx="12" cy="12" r="11" fill="url(#inRim_' + uid + ')" stroke="#fef08a" stroke-width="1"/>' +
      '<circle cx="12" cy="12" r="8.5" fill="#090d16"/>' +
      '<path d="M12 3.5C7.3 3.5 3.5 7.3 3.5 12" stroke="#00e5ff" stroke-width="1.8" stroke-linecap="round"/>' +
      '<path d="M20.5 12C20.5 16.7 16.7 20.5 12 20.5" stroke="#ea580c" stroke-width="1.8" stroke-linecap="round"/>' +
      '<text x="12" y="15" font-family="Impact, Arial Black, sans-serif" font-size="8.5" font-weight="900" fill="#fde047" text-anchor="middle" letter-spacing="-0.5">FvH</text>' +
      '<defs>' +
      '<linearGradient id="inRim_' + uid + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="#fde047"/>' +
      '<stop offset="50%" stop-color="#eab308"/>' +
      '<stop offset="100%" stop-color="#854d0e"/>' +
      '</linearGradient>' +
      '</defs>' +
      '</svg>';
  }

  // Medium (64px) & Large (160px) High-Fidelity 3D Tournament Coin Medallion
  // 24 Milled Edge Teeth
  var teeth = '';
  for (var i = 0; i < 24; i++) {
    var angle = (i * 360 / 24) * Math.PI / 180;
    var tx = 50 + 47 * Math.cos(angle);
    var ty = 50 + 47 * Math.sin(angle);
    teeth += '<circle cx="' + tx.toFixed(2) + '" cy="' + ty.toFixed(2) + '" r="1.6" fill="#fde047"/>';
  }

  return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto;filter:drop-shadow(0 6px 14px rgba(245,158,11,0.35));">' +
    '<defs>' +
    // Outer Gold Rim Bevel
    '<linearGradient id="gRim_' + uid + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
    '<stop offset="0%" stop-color="#fffbeb"/>' +
    '<stop offset="20%" stop-color="#fde047"/>' +
    '<stop offset="50%" stop-color="#ca8a04"/>' +
    '<stop offset="85%" stop-color="#eab308"/>' +
    '<stop offset="100%" stop-color="#713f12"/>' +
    '</linearGradient>' +
    // Inner Recessed Gold Ring
    '<linearGradient id="gInner_' + uid + '" x1="0%" y1="100%" x2="100%" y2="0%">' +
    '<stop offset="0%" stop-color="#451a03"/>' +
    '<stop offset="40%" stop-color="#ca8a04"/>' +
    '<stop offset="70%" stop-color="#fef08a"/>' +
    '<stop offset="100%" stop-color="#a16207"/>' +
    '</linearGradient>' +
    // Deep Sapphire / Obsidian Coin Core
    '<radialGradient id="gCore_' + uid + '" cx="50%" cy="40%" r="60%">' +
    '<stop offset="0%" stop-color="#1e1b4b"/>' +
    '<stop offset="65%" stop-color="#0b0f19"/>' +
    '<stop offset="100%" stop-color="#020408"/>' +
    '</radialGradient>' +
    // Metallic Text Shading
    '<linearGradient id="gText_' + uid + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
    '<stop offset="0%" stop-color="#ffffff"/>' +
    '<stop offset="35%" stop-color="#fef08a"/>' +
    '<stop offset="70%" stop-color="#facc15"/>' +
    '<stop offset="100%" stop-color="#b45309"/>' +
    '</linearGradient>' +
    // Specular Sheen
    '<linearGradient id="gSheen_' + uid + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
    '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>' +
    '<stop offset="35%" stop-color="#ffffff" stop-opacity="0.08"/>' +
    '<stop offset="65%" stop-color="#ffffff" stop-opacity="0"/>' +
    '</linearGradient>' +
    '</defs>' +

    // Outer Glow Halo
    '<circle cx="50" cy="50" r="48" fill="#f59e0b" fill-opacity="0.12"/>' +

    // Heavy Milled Gold Outer Edge Rim
    '<circle cx="50" cy="50" r="47" fill="url(#gRim_' + uid + ')" stroke="#fef08a" stroke-width="1.2"/>' +
    teeth +

    // Stepped Inner Bevel Ring
    '<circle cx="50" cy="50" r="41" fill="url(#gInner_' + uid + ')" stroke="#713f12" stroke-width="1.5"/>' +
    '<circle cx="50" cy="50" r="37.5" fill="#020408"/>' +

    // Deep Obsidian Coin Field Face
    '<circle cx="50" cy="50" r="36" fill="url(#gCore_' + uid + ')"/>' +

    // Micro-Engraved Guilloche Ring Lines
    '<circle cx="50" cy="50" r="34" stroke="#facc15" stroke-width="0.6" stroke-dasharray="1.5 1.5" stroke-opacity="0.5"/>' +
    '<circle cx="50" cy="50" r="28" stroke="#ca8a04" stroke-width="0.5" stroke-opacity="0.3"/>' +

    // Dual Sports Clash Accents:
    // Left: Electric Cyan Soccer Arc with hexagon pattern hint
    '<path d="M50 15 A35 35 0 0 0 15 50 A35 35 0 0 0 22 72" stroke="#00e5ff" stroke-width="3.2" stroke-linecap="round" filter="drop-shadow(0 0 3px #00e5ff)"/>' +
    '<path d="M22 34 L28 32 L32 37 L30 43 L24 44 Z" fill="none" stroke="#38bdf8" stroke-width="1" stroke-opacity="0.55"/>' +

    // Right: Blazing Molten Orange Basketball Arc with seam hint
    '<path d="M50 85 A35 35 0 0 0 85 50 A35 35 0 0 0 78 28" stroke="#f97316" stroke-width="3.2" stroke-linecap="round" filter="drop-shadow(0 0 3px #ea580c)"/>' +
    '<path d="M72 40 C76 46 76 54 72 60" stroke="#fdba74" stroke-width="1.2" stroke-linecap="round" stroke-opacity="0.65"/>' +

    // Top Arc Engraving: "FOOTY VS HOOPS"
    '<path id="arcTop_' + uid + '" d="M24 50 A26 26 0 0 1 76 50" fill="none"/>' +
    '<text font-family="Arial Black, Impact, sans-serif" font-size="5.2" font-weight="900" fill="#fef08a" letter-spacing="1.2">' +
    '<textPath href="#arcTop_' + uid + '" startOffset="50%" text-anchor="middle">FOOTY VS HOOPS</textPath>' +
    '</text>' +

    // Center 3D Embossed Monogram "FvH"
    '<g filter="drop-shadow(0 3px 4px rgba(0,0,0,0.9))">' +
    // Drop shadow under text
    '<text x="50" y="58" font-family="Impact, Arial Black, sans-serif" font-size="24" font-weight="900" fill="#451a03" text-anchor="middle" letter-spacing="-1">FvH</text>' +
    // Main 3D Gold Text
    '<text x="50" y="57" font-family="Impact, Arial Black, sans-serif" font-size="24" font-weight="900" fill="url(#gText_' + uid + ')" text-anchor="middle" letter-spacing="-1">FvH</text>' +
    // Stroke highlight on letters
    '<text x="50" y="57" font-family="Impact, Arial Black, sans-serif" font-size="24" font-weight="900" fill="none" stroke="#fffbeb" stroke-width="0.6" text-anchor="middle" letter-spacing="-1">FvH</text>' +
    '</g>' +

    // Bottom 3 Stars Arc: "★ ★ ★"
    '<text x="50" y="76" font-family="Arial, sans-serif" font-size="6.5" fill="#fde047" text-anchor="middle" letter-spacing="3">★ ★ ★</text>' +

    // Glass / Metallic Specular Sheen (Top Left to Bottom Right)
    '<path d="M18 36 C32 20 68 20 82 36 C64 42 36 42 18 36 Z" fill="url(#gSheen_' + uid + ')"/>' +

    // Brilliant Glint Sparkle at top-left rim
    '<polygon points="26,19 28,15 30,19 34,21 30,23 28,27 26,23 22,21" fill="#ffffff"/>' +
    '<circle cx="28" cy="21" r="1.5" fill="#ffffff" filter="drop-shadow(0 0 2px #fff)"/>' +
    '</svg>';
}

// Generate an HTML preview file to inspect
const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>FvH Coin Preview</title>
<style>
body { background: #0b0f19; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; gap: 30px; margin: 0; }
.card { background: #131a2b; padding: 24px 32px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); text-align: center; }
.row { display: flex; align-items: center; justify-content: center; gap: 24px; }
.pill { display: inline-flex; align-items: center; gap: 8px; background: rgba(245,158,11,0.15); border: 1.5px solid #f59e0b; padding: 6px 14px; border-radius: 20px; font-weight: 800; font-size: 16px; color: #fde047; }
</style>
</head>
<body>
  <h1>Official FvH Coin Design Showcase</h1>
  <div class="card">
    <h3>Large (160x160) Trophy Medallion</h3>
    ${getFvhCoinSvg('large')}
  </div>
  <div class="row">
    <div class="card">
      <h3>Medium (64x64) Catalogue & Rewards</h3>
      ${getFvhCoinSvg('medium')}
    </div>
    <div class="card">
      <h3>Inline (20x20) Wallet & Price Badges</h3>
      <div style="margin-top: 14px;">
        <span class="pill">${getFvhCoinSvg('inline')} 1,250 FvH</span>
      </div>
      <div style="margin-top: 14px;">
        <button style="background: #0284c7; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 800; display: inline-flex; align-items: center; gap: 6px; cursor: pointer;">
          Купить за ${getFvhCoinSvg('inline')} 650
        </button>
      </div>
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync('C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/fvh_coin_preview.html', html, 'utf8');
console.log('Saved fvh_coin_preview.html');
