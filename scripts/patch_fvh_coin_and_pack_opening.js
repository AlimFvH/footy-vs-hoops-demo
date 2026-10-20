const fs = require('fs');

console.log('=== Patching FvH Coin Design & Pack Opening Animation ===');

const redesignJsPath = 'js/redesign.js';
const redesignCssPath = 'css/redesign.css';

let jsCode = fs.readFileSync(redesignJsPath, 'utf8');
let cssCode = fs.readFileSync(redesignCssPath, 'utf8');

// 1. CSS for Pack Opening Animation & FvH Coin Glow
const packCss = `
/* ==========================================================================
   FvH Coin & Interactive 3D Pack Opening Animation
   ========================================================================== */

.fvh-coin-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  vertical-align: middle;
}

.fvh-coin-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  vertical-align: middle;
}

.fvh-pack-opening-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: radial-gradient(circle at 50% 40%, rgba(15, 23, 42, 0.98) 0%, rgba(4, 7, 14, 0.99) 75%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  overflow-y: auto;
  padding: 20px;
  box-sizing: border-box;
  animation: fvhFadeIn 0.35s ease;
}

@keyframes fvhFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fvh-pack-stage {
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  text-align: center;
}

.fvh-pack-unopened-wrap {
  cursor: pointer;
  position: relative;
  margin: 24px 0 20px;
  padding: 10px;
  perspective: 1000px;
}

.fvh-pack-hover-card {
  animation: fvhPackHover 2.8s ease-in-out infinite;
  transition: transform 0.2s ease;
  position: relative;
  display: inline-block;
}

.fvh-pack-unopened-wrap:hover .fvh-pack-hover-card {
  transform: scale(1.05);
}

@keyframes fvhPackHover {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    filter: drop-shadow(0 14px 28px rgba(0, 229, 255, 0.45));
  }
  50% {
    transform: translateY(-14px) rotate(-1deg);
    filter: drop-shadow(0 24px 38px rgba(245, 158, 11, 0.6));
  }
}

.fvh-pack-hover-card.rumble {
  animation: fvhPackRumble 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite !important;
}

@keyframes fvhPackRumble {
  0% { transform: translate(0, 0) rotate(0deg); }
  15% { transform: translate(-8px, 6px) rotate(-4deg); }
  30% { transform: translate(8px, -6px) rotate(4deg); }
  45% { transform: translate(-7px, -5px) rotate(-3deg); }
  60% { transform: translate(7px, 5px) rotate(3deg); }
  75% { transform: translate(-5px, 3px) rotate(-2deg); }
  90% { transform: translate(5px, -3px) rotate(2deg); }
  100% { transform: translate(0, 0) scale(1.18); filter: brightness(2.2); }
}

.fvh-pack-flash-overlay {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle, #ffffff 10%, rgba(254, 240, 138, 0.8) 40%, rgba(0, 229, 255, 0.4) 70%, transparent 100%);
  opacity: 0;
  pointer-events: none;
  z-index: 100000;
}

.fvh-pack-flash-overlay.active {
  animation: fvhFlashBurst 0.65s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
}

@keyframes fvhFlashBurst {
  0% { opacity: 0; transform: scale(0.6); }
  30% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 0; transform: scale(1.5); }
}

.fvh-pack-cards-reveal {
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
  width: 100%;
  margin: 18px 0 24px;
}

.fvh-pack-reward-card {
  flex: 1 1 140px;
  max-width: 170px;
  min-width: 130px;
  min-height: 240px;
  background: linear-gradient(160deg, rgba(20, 28, 48, 0.98) 0%, rgba(10, 14, 26, 0.98) 100%);
  border-radius: 16px;
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  padding: 12px 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6);
  opacity: 0;
  transform: translateY(60px) scale(0.7);
  animation: fvhCardDeal 0.6s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;
}

@keyframes fvhCardDeal {
  0% { opacity: 0; transform: translateY(70px) scale(0.6); }
  60% { opacity: 1; transform: translateY(-10px) scale(1.04); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

.fvh-pack-reward-card.r-rare {
  border-color: #38bdf8;
  box-shadow: 0 0 24px rgba(56, 189, 248, 0.35), inset 0 0 20px rgba(56, 189, 248, 0.12);
}

.fvh-pack-reward-card.r-epic {
  border-color: #c084fc;
  box-shadow: 0 0 28px rgba(192, 132, 252, 0.4), inset 0 0 22px rgba(192, 132, 252, 0.14);
}

.fvh-pack-reward-card.r-legendary {
  border-color: #fde047;
  box-shadow: 0 0 32px rgba(253, 224, 71, 0.45), inset 0 0 26px rgba(253, 224, 71, 0.18);
}

.fvh-pack-reward-card.r-coins {
  border-color: #f59e0b;
  box-shadow: 0 0 28px rgba(245, 158, 11, 0.4), inset 0 0 22px rgba(245, 158, 11, 0.15);
}

.fvh-pack-card-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.12) 50%, transparent 60%);
  pointer-events: none;
  animation: fvhCardShine 3s infinite linear;
}

@keyframes fvhCardShine {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

.fvh-pack-reward-thumb {
  width: 100%;
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 6px 0;
}

.fvh-pack-reward-thumb svg {
  max-width: 90px !important;
  max-height: 90px !important;
  width: auto !important;
  height: auto !important;
  display: block;
  filter: drop-shadow(0 6px 14px rgba(0,0,0,0.6));
}

.fvh-pack-reward-title {
  font-size: 12.5px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.3;
  margin-bottom: 4px;
  min-height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fvh-pack-badge-new {
  background: linear-gradient(90deg, #10b981, #059669);
  color: #ffffff;
  font-size: 10px;
  font-weight: 900;
  padding: 3px 8px;
  border-radius: 12px;
  letter-spacing: 0.5px;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
  margin-top: 4px;
}

.fvh-pack-badge-fallback {
  background: linear-gradient(90deg, #f59e0b, #d97706);
  color: #ffffff;
  font-size: 9.5px;
  font-weight: 900;
  padding: 3px 8px;
  border-radius: 12px;
  letter-spacing: 0.3px;
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.6);
  margin-top: 4px;
}

.fvh-pack-claim-btn {
  background: linear-gradient(135deg, #facc15 0%, #eab308 50%, #ca8a04 100%) !important;
  color: #1c1404 !important;
  font-weight: 900 !important;
  font-size: 15px !important;
  letter-spacing: 0.5px !important;
  padding: 12px 32px !important;
  border-radius: 14px !important;
  border: none !important;
  box-shadow: 0 6px 20px rgba(234, 179, 8, 0.5) !important;
  cursor: pointer !important;
  transition: transform 0.15s ease, filter 0.15s ease !important;
}

.fvh-pack-claim-btn:active {
  transform: scale(0.97) !important;
}
`;

// Append CSS if not already present
if (!cssCode.includes('fvh-pack-opening-overlay')) {
  cssCode += '\n' + packCss;
  fs.writeFileSync(redesignCssPath, cssCode, 'utf8');
  console.log('✓ Appended FvH Coin & Pack Opening CSS to css/redesign.css');
}

// 2. FvH Coin SVG Generator Function
const fvhCoinFunction = `
  // ==========================================
  // Official High-Fidelity 3D FvH Coin Generator
  // ==========================================
  function getFvhCoinSvg(size, extraOpts) {
    var isInline = size === 'inline';
    var isLg = size === 'large';
    var isSm = size === 'small' || size === 'thumb';
    
    var w = isInline ? 20 : (isLg ? 160 : (isSm ? 48 : 64));
    var h = w;
    var uid = 'fvhCoin_' + Math.random().toString(36).substr(2, 6);

    if (isInline) {
      // 20x20 Compact High-Contrast Inline Coin for Badges & HUD
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

    // 24 Milled Edge Gold Teeth
    var teeth = '';
    for (var i = 0; i < 24; i++) {
      var angle = (i * 360 / 24) * Math.PI / 180;
      var tx = 50 + 47 * Math.cos(angle);
      var ty = 50 + 47 * Math.sin(angle);
      teeth += '<circle cx="' + tx.toFixed(2) + '" cy="' + ty.toFixed(2) + '" r="1.6" fill="#fde047"/>';
    }

    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto;filter:drop-shadow(0 6px 14px rgba(245,158,11,0.35));">' +
      '<defs>' +
      '<linearGradient id="gRim_' + uid + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="#fffbeb"/>' +
      '<stop offset="20%" stop-color="#fde047"/>' +
      '<stop offset="50%" stop-color="#ca8a04"/>' +
      '<stop offset="85%" stop-color="#eab308"/>' +
      '<stop offset="100%" stop-color="#713f12"/>' +
      '</linearGradient>' +
      '<linearGradient id="gInner_' + uid + '" x1="0%" y1="100%" x2="100%" y2="0%">' +
      '<stop offset="0%" stop-color="#451a03"/>' +
      '<stop offset="40%" stop-color="#ca8a04"/>' +
      '<stop offset="70%" stop-color="#fef08a"/>' +
      '<stop offset="100%" stop-color="#a16207"/>' +
      '</linearGradient>' +
      '<radialGradient id="gCore_' + uid + '" cx="50%" cy="40%" r="60%">' +
      '<stop offset="0%" stop-color="#1e1b4b"/>' +
      '<stop offset="65%" stop-color="#0b0f19"/>' +
      '<stop offset="100%" stop-color="#020408"/>' +
      '</radialGradient>' +
      '<linearGradient id="gText_' + uid + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
      '<stop offset="0%" stop-color="#ffffff"/>' +
      '<stop offset="35%" stop-color="#fef08a"/>' +
      '<stop offset="70%" stop-color="#facc15"/>' +
      '<stop offset="100%" stop-color="#b45309"/>' +
      '</linearGradient>' +
      '<linearGradient id="gSheen_' + uid + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>' +
      '<stop offset="35%" stop-color="#ffffff" stop-opacity="0.08"/>' +
      '<stop offset="65%" stop-color="#ffffff" stop-opacity="0"/>' +
      '</linearGradient>' +
      '</defs>' +
      '<circle cx="50" cy="50" r="48" fill="#f59e0b" fill-opacity="0.12"/>' +
      '<circle cx="50" cy="50" r="47" fill="url(#gRim_' + uid + ')" stroke="#fef08a" stroke-width="1.2"/>' +
      teeth +
      '<circle cx="50" cy="50" r="41" fill="url(#gInner_' + uid + ')" stroke="#713f12" stroke-width="1.5"/>' +
      '<circle cx="50" cy="50" r="37.5" fill="#020408"/>' +
      '<circle cx="50" cy="50" r="36" fill="url(#gCore_' + uid + ')"/>' +
      '<circle cx="50" cy="50" r="34" stroke="#facc15" stroke-width="0.6" stroke-dasharray="1.5 1.5" stroke-opacity="0.5"/>' +
      '<circle cx="50" cy="50" r="28" stroke="#ca8a04" stroke-width="0.5" stroke-opacity="0.3"/>' +
      '<path d="M50 15 A35 35 0 0 0 15 50 A35 35 0 0 0 22 72" stroke="#00e5ff" stroke-width="3.2" stroke-linecap="round" filter="drop-shadow(0 0 3px #00e5ff)"/>' +
      '<path d="M22 34 L28 32 L32 37 L30 43 L24 44 Z" fill="none" stroke="#38bdf8" stroke-width="1" stroke-opacity="0.55"/>' +
      '<path d="M50 85 A35 35 0 0 0 85 50 A35 35 0 0 0 78 28" stroke="#f97316" stroke-width="3.2" stroke-linecap="round" filter="drop-shadow(0 0 3px #ea580c)"/>' +
      '<path d="M72 40 C76 46 76 54 72 60" stroke="#fdba74" stroke-width="1.2" stroke-linecap="round" stroke-opacity="0.65"/>' +
      '<path id="arcTop_' + uid + '" d="M24 50 A26 26 0 0 1 76 50" fill="none"/>' +
      '<text font-family="Arial Black, Impact, sans-serif" font-size="5.2" font-weight="900" fill="#fef08a" letter-spacing="1.2">' +
      '<textPath href="#arcTop_' + uid + '" startOffset="50%" text-anchor="middle">FOOTY VS HOOPS</textPath>' +
      '</text>' +
      '<g filter="drop-shadow(0 3px 4px rgba(0,0,0,0.9))">' +
      '<text x="50" y="58" font-family="Impact, Arial Black, sans-serif" font-size="24" font-weight="900" fill="#451a03" text-anchor="middle" letter-spacing="-1">FvH</text>' +
      '<text x="50" y="57" font-family="Impact, Arial Black, sans-serif" font-size="24" font-weight="900" fill="url(#gText_' + uid + ')" text-anchor="middle" letter-spacing="-1">FvH</text>' +
      '<text x="50" y="57" font-family="Impact, Arial Black, sans-serif" font-size="24" font-weight="900" fill="none" stroke="#fffbeb" stroke-width="0.6" text-anchor="middle" letter-spacing="-1">FvH</text>' +
      '</g>' +
      '<text x="50" y="76" font-family="Arial, sans-serif" font-size="6.5" fill="#fde047" text-anchor="middle" letter-spacing="3">★ ★ ★</text>' +
      '<path d="M18 36 C32 20 68 20 82 36 C64 42 36 42 18 36 Z" fill="url(#gSheen_' + uid + ')"/>' +
      '<polygon points="26,19 28,15 30,19 34,21 30,23 28,27 26,23 22,21" fill="#ffffff"/>' +
      '<circle cx="28" cy="21" r="1.5" fill="#ffffff" filter="drop-shadow(0 0 2px #fff)"/>' +
      '</svg>';
  }
  window.getFvhCoinSvg = getFvhCoinSvg;
`;

// Replace getDetailedCoinsSvg with 3D Stack + FvH Coin Medallion
const newDetailedCoinsSvg = `
  // Detailed Coins Reward Stack SVG (Featuring Authentic 3D FvH Coins)
  function getDetailedCoinsSvg(item, size) {
    var isLg = size === 'large';
    var isSm = size === 'thumb' || size === 'small';
    var w = isLg ? 160 : (isSm ? 48 : 76);
    var h = w;
    var id = (typeof item === 'string') ? item : (item && (item.id || item.itemId)) || '';

    // If single coin or generic coin reward, return the single FvH Coin Medallion
    if (id === 'coins' || id === 'coin' || id === '' || id === 'reward_coins') {
      return getFvhCoinSvg(size);
    }

    var stackCount = 5;
    if (id === 'pkg_coins_starter') stackCount = 3;
    else if (id === 'pkg_coins_pro') stackCount = 5;
    else if (id === 'pkg_coins_elite') stackCount = 8;
    else if (id === 'pkg_coins_champion') stackCount = 10;
    else if (id === 'pkg_coins_legend') stackCount = 12;

    var coinsHtml = '';
    var baseY = 76;
    var dy = 5.2;
    for (var i = 0; i < stackCount; i++) {
      var y = baseY - (i * dy);
      coinsHtml += '<ellipse cx="50" cy="' + y + '" rx="29" ry="11" fill="#713f12" stroke="#ca8a04" stroke-width="1.8"/>' +
        '<ellipse cx="50" cy="' + (y - 1.8) + '" rx="28" ry="10" fill="#eab308" stroke="#fef08a" stroke-width="1.2"/>' +
        '<ellipse cx="50" cy="' + (y - 2.5) + '" rx="24" ry="8" fill="#ca8a04"/>' +
        '<ellipse cx="50" cy="' + (y - 2.8) + '" rx="23" ry="7.5" fill="#090d16"/>' +
        '<text x="50" y="' + (y - 0.5) + '" font-family="Impact, Arial Black" font-size="7" fill="#fde047" text-anchor="middle" letter-spacing="-0.5">FvH</text>';
    }

    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto;filter:drop-shadow(0 6px 14px rgba(245,158,11,0.4));">' +
      '<defs>' +
      '<radialGradient id="cStackGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fde047" stop-opacity="0.35"/><stop offset="100%" stop-color="#ca8a04" stop-opacity="0"/></radialGradient>' +
      '</defs>' +
      '<circle cx="50" cy="50" r="46" fill="#131003" stroke="#facc15" stroke-width="1.8"/>' +
      '<circle cx="50" cy="50" r="42" fill="url(#cStackGlow)"/>' +
      coinsHtml +
      // Golden Sparkle Stars
      '<polygon points="22,25 24,20 26,25 31,27 26,29 24,34 22,29 17,27" fill="#ffffff" filter="drop-shadow(0 0 2px #fff)"/>' +
      '<polygon points="78,35 80,31 82,35 86,37 82,39 80,43 78,39 74,37" fill="#fef08a"/>' +
      '</svg>';
  }
`;

// Insert getFvhCoinSvg right before getDetailedCoinsSvg and replace getDetailedCoinsSvg
const oldCoinsPattern = /\/\/ Detailed Coins Reward Stack SVG[\s\S]*?function getDetailedCoinsSvg[\s\S]*?^  }/m;
if (oldCoinsPattern.test(jsCode)) {
  jsCode = jsCode.replace(oldCoinsPattern, fvhCoinFunction + '\n' + newDetailedCoinsSvg);
  console.log('✓ Replaced getDetailedCoinsSvg with FvH Coin Generator');
} else {
  console.error('Could not find old getDetailedCoinsSvg pattern');
}

// 3. Complete Pack Opening Implementation with Interactive 3D Reveal and No-Duplicate Protection
const newOpenPackAnimation = `
    // Full Catalog Cosmetic Pools for Packs
    var PACK_POOLS = {
      footy: [
        { id: 'skin_crimson', name: 'Crimson Comet', category: 'skins', rarity: 'rare' },
        { id: 'skin_neon', name: 'Neon Striker', category: 'skins', rarity: 'epic' },
        { id: 'skin_frost', name: 'Frost Giant', category: 'skins', rarity: 'rare' },
        { id: 'skin_shadow', name: 'Shadow Ninja', category: 'skins', rarity: 'epic' },
        { id: 'skin_solar', name: 'Solar Flare', category: 'skins', rarity: 'epic' },
        { id: 'skin_gold', name: 'Golden Legend', category: 'skins', rarity: 'legendary' },
        { id: 'skin_cyber', name: 'Cyber Punk', category: 'skins', rarity: 'legendary' },
        { id: 'skin_sunset', name: 'Sunset Gold Jersey', category: 'skins', rarity: 'rare' },
        { id: 'skin_hydro', name: 'Hydro Striker Kit', category: 'skins', rarity: 'rare' },
        { id: 'ball_footy_plasma', name: 'Plasma Orb', category: 'balls', rarity: 'rare' },
        { id: 'ball_footy_gold', name: 'Golden Cup', category: 'balls', rarity: 'epic' },
        { id: 'ball_footy_inferno', name: 'Inferno', category: 'balls', rarity: 'epic' },
        { id: 'ball_footy_solar', name: 'Solar Blaze Ball', category: 'balls', rarity: 'legendary' },
        { id: 'ball_earthrise', name: 'Earthrise Ball', category: 'balls', rarity: 'legendary' },
        { id: 'std_ocean_sunset', name: 'Coastal Sunset Court', category: 'stadiums', rarity: 'epic' },
        { id: 'std_forest_redwood', name: 'Redwood Forest Arena', category: 'stadiums', rarity: 'epic' },
        { id: 'std_footy_night', name: 'Night Arena', category: 'stadiums', rarity: 'rare' },
        { id: 'std_footy_golden', name: 'Golden Hour', category: 'stadiums', rarity: 'rare' },
        { id: 'std_footy_neon', name: 'Neon Turf', category: 'stadiums', rarity: 'epic' },
        { id: 'cel_confetti', name: 'Confetti Burst', category: 'celebrations', rarity: 'rare' },
        { id: 'cel_fireworks', name: 'Fireworks', category: 'celebrations', rarity: 'rare' },
        { id: 'cel_flames', name: 'Flame Burst', category: 'celebrations', rarity: 'epic' },
        { id: 'trail_fire', name: 'Fire Trail', category: 'trails', rarity: 'rare' },
        { id: 'trail_laser', name: 'Laser Trail', category: 'trails', rarity: 'legendary' }
      ],
      hoops: [
        { id: 'skin_sunset', name: 'Sunset Gold Jersey', category: 'skins', rarity: 'rare' },
        { id: 'skin_hydro', name: 'Hydro Striker Kit', category: 'skins', rarity: 'rare' },
        { id: 'skin_mars', name: 'Mars Rover Kit', category: 'skins', rarity: 'epic' },
        { id: 'skin_astronaut', name: 'Astronaut Kit', category: 'skins', rarity: 'legendary' },
        { id: 'skin_neon_elite', name: 'Cyber Striker #10', category: 'skins', rarity: 'legendary' },
        { id: 'ball_hoops_blaze', name: 'Neon Blaze', category: 'balls', rarity: 'rare' },
        { id: 'ball_hoops_chrome', name: 'Chrome', category: 'balls', rarity: 'epic' },
        { id: 'ball_hoops_midnight', name: 'Midnight', category: 'balls', rarity: 'rare' },
        { id: 'ball_tidal', name: 'Tidal Wave Ball', category: 'balls', rarity: 'epic' },
        { id: 'ball_cyber_neon', name: 'Cyber Neon Ball', category: 'balls', rarity: 'legendary' },
        { id: 'std_hoops_sky', name: 'Skyline Rooftop', category: 'stadiums', rarity: 'rare' },
        { id: 'std_hoops_neon', name: 'Neon Night', category: 'stadiums', rarity: 'epic' },
        { id: 'std_hoops_gold', name: 'Gold Hardwood', category: 'stadiums', rarity: 'epic' },
        { id: 'std_ocean_sunset', name: 'Coastal Sunset Court', category: 'stadiums', rarity: 'epic' },
        { id: 'cel_shockwave', name: 'Shockwave', category: 'celebrations', rarity: 'rare' },
        { id: 'cel_goldrain', name: 'Gold Rain', category: 'celebrations', rarity: 'legendary' },
        { id: 'cel_lightning', name: 'Lightning Storm', category: 'celebrations', rarity: 'legendary' },
        { id: 'trail_ice', name: 'Ice Trail', category: 'trails', rarity: 'rare' },
        { id: 'trail_rainbow', name: 'Rainbow Trail', category: 'trails', rarity: 'epic' }
      ],
      clash: [
        { id: 'skin_gold', name: 'Golden Legend', category: 'skins', rarity: 'legendary' },
        { id: 'skin_cyber', name: 'Cyber Punk', category: 'skins', rarity: 'legendary' },
        { id: 'skin_neon_elite', name: 'Cyber Striker #10', category: 'skins', rarity: 'legendary' },
        { id: 'skin_astronaut', name: 'Astronaut Kit', category: 'skins', rarity: 'legendary' },
        { id: 'skin_shadow', name: 'Shadow Ninja', category: 'skins', rarity: 'epic' },
        { id: 'ball_footy_solar', name: 'Solar Blaze Ball', category: 'balls', rarity: 'legendary' },
        { id: 'ball_earthrise', name: 'Earthrise Ball', category: 'balls', rarity: 'legendary' },
        { id: 'ball_tidal', name: 'Tidal Wave Ball', category: 'balls', rarity: 'epic' },
        { id: 'ball_cyber_neon', name: 'Cyber Neon Ball', category: 'balls', rarity: 'legendary' },
        { id: 'ball_hoops_chrome', name: 'Chrome', category: 'balls', rarity: 'epic' },
        { id: 'std_space_orbit', name: 'Orbital Space Colosseum', category: 'stadiums', rarity: 'legendary' },
        { id: 'std_mars_dome', name: 'Mars Bio-Dome Arena', category: 'stadiums', rarity: 'epic' },
        { id: 'std_moon_crater', name: 'Apollo Lunar Arena', category: 'stadiums', rarity: 'rare' },
        { id: 'std_underwater_dome', name: 'Abyssal Ocean Dome', category: 'stadiums', rarity: 'legendary' },
        { id: 'std_cyber_megacity', name: 'Neo Tokyo Megacity', category: 'stadiums', rarity: 'legendary' },
        { id: 'std_volcano_caldera', name: 'Magma Caldera Arena', category: 'stadiums', rarity: 'epic' },
        { id: 'std_floating_islands', name: 'Aetheria Sky Islands', category: 'stadiums', rarity: 'legendary' },
        { id: 'std_crystal_cavern', name: 'Prismatic Crystal Cave', category: 'stadiums', rarity: 'epic' },
        { id: 'cel_goldrain', name: 'Gold Rain', category: 'celebrations', rarity: 'legendary' },
        { id: 'cel_lightning', name: 'Lightning Storm', category: 'celebrations', rarity: 'legendary' },
        { id: 'cel_fireworks', name: 'Fireworks', category: 'celebrations', rarity: 'rare' },
        { id: 'trail_rainbow', name: 'Rainbow Trail', category: 'trails', rarity: 'epic' },
        { id: 'trail_laser', name: 'Laser Trail', category: 'trails', rarity: 'legendary' },
        { id: 'frame_bronze', name: 'Bronze Frame', category: 'frames', rarity: 'rare' },
        { id: 'frame_diamond', name: 'Diamond Frame', category: 'frames', rarity: 'legendary' }
      ]
    };

    function openPackAnimation(packDef) {
      var pId = (packDef && packDef.id) || 'footy';
      if (pId === 'pack_footy') pId = 'footy';
      else if (pId === 'pack_hoops') pId = 'hoops';
      else if (pId === 'pack_clash') pId = 'clash';

      var pool = PACK_POOLS[pId] || PACK_POOLS.footy;
      var cardCount = (pId === 'clash') ? 3 : 2;
      var coinFallbackAmount = (pId === 'clash') ? 600 : 300;

      // Duplicate-free pull logic:
      // Filter current owned items so that player NEVER pulls duplicates.
      // If player already owns all items in the pool, reward guaranteed FvH Coins!
      var storeData = app.store.data;
      var ownedList = (storeData.owned || []).slice();
      var drops = [];

      for (var c = 0; c < cardCount; c++) {
        var unowned = pool.filter(function (it) {
          return ownedList.indexOf(it.id) === -1;
        });

        if (unowned.length > 0) {
          // Pull a guaranteed new cosmetic item!
          var randIdx = Math.floor(Math.random() * unowned.length);
          var pickedItem = unowned[randIdx];
          ownedList.push(pickedItem.id); // Prevent duplicate within the same pack!
          drops.push({
            type: 'cosmetic',
            item: pickedItem,
            isNew: true
          });
        } else {
          // All items owned in this pool -> fallback directly to FvH Coins!
          drops.push({
            type: 'coins',
            val: coinFallbackAmount,
            name: coinFallbackAmount + ' FvH Coin',
            isDuplicateFallback: true
          });
        }
      }

      // 1. Build Full-Screen Cinematic Pack Opening Overlay
      var overlay = document.createElement('div');
      overlay.className = 'fvh-pack-opening-overlay';

      var flash = document.createElement('div');
      flash.className = 'fvh-pack-flash-overlay';
      overlay.appendChild(flash);

      var stage = document.createElement('div');
      stage.className = 'fvh-pack-stage';

      var packTitle = document.createElement('div');
      packTitle.style.cssText = 'font-size:12px;font-weight:900;letter-spacing:1.5px;color:#38bdf8;text-transform:uppercase;margin-bottom:8px;';
      packTitle.textContent = trItem(packDef.name);

      var packSub = document.createElement('div');
      packSub.style.cssText = 'font-size:11px;color:var(--text-muted);margin-bottom:12px;';
      packSub.textContent = (getActiveLang() === 'ru') ? 'Турнирный бустер-пак сезона' : 'Tournament Season Booster Pack';

      // Unopened 3D Foil Pack with breathing hover
      var packWrap = document.createElement('div');
      packWrap.className = 'fvh-pack-unopened-wrap';
      var hoverCard = document.createElement('div');
      hoverCard.className = 'fvh-pack-hover-card';
      hoverCard.innerHTML = getDetailedPackSvg(pId, 'large');
      packWrap.appendChild(hoverCard);

      var ripHint = document.createElement('div');
      ripHint.style.cssText = 'margin-top:16px;font-size:13px;font-weight:900;color:#fde047;letter-spacing:1px;text-transform:uppercase;animation:fvhPulse 1.2s infinite;';
      ripHint.innerHTML = '⚡ ' + ((getActiveLang() === 'ru') ? 'Нажмите, чтобы вскрыть пак' : 'Tap to rip open pack');

      stage.appendChild(packTitle);
      stage.appendChild(packSub);
      stage.appendChild(packWrap);
      stage.appendChild(ripHint);
      overlay.appendChild(stage);
      document.body.appendChild(overlay);

      // Play introductory suspense sound
      app.audio.play('click');

      var isRipped = false;
      packWrap.onclick = function () {
        if (isRipped) return;
        isRipped = true;

        // Stage 2: Violent rumble & tear sound
        hoverCard.className = 'fvh-pack-hover-card rumble';
        ripHint.textContent = (getActiveLang() === 'ru') ? 'Вскрытие...' : 'Ripping...';
        app.audio.play('kick');

        setTimeout(function () {
          // Stage 3: Energy burst flash
          flash.className = 'fvh-pack-flash-overlay active';
          app.audio.play('whistle');

          setTimeout(function () {
            // Apply rewards to persistent store
            app.store.update(function (d) {
              if (!d.owned) d.owned = [];
              drops.forEach(function (dr) {
                if (dr.type === 'cosmetic') {
                  if (d.owned.indexOf(dr.item.id) === -1) d.owned.push(dr.item.id);
                } else if (dr.type === 'coins') {
                  d.coins = (d.coins || 0) + dr.val;
                }
              });
            });

            // Stage 4: Cards reveal
            stage.innerHTML = '';
            var congratsTitle = document.createElement('h2');
            congratsTitle.style.cssText = 'margin:0 0 4px;font-size:22px;color:#fde047;letter-spacing:0.5px;';
            congratsTitle.textContent = (getActiveLang() === 'ru') ? '🎉 НАГРАДЫ ИЗ ПАКА!' : '🎉 PACK REWARDS!';

            var cardsContainer = document.createElement('div');
            cardsContainer.className = 'fvh-pack-cards-reveal';

            drops.forEach(function (dr, idx) {
              var cCard = document.createElement('div');
              var rarity = dr.type === 'cosmetic' ? (dr.item.rarity || 'epic') : 'coins';
              cCard.className = 'fvh-pack-reward-card r-' + rarity;
              cCard.style.animationDelay = (idx * 0.16) + 's';

              var shine = document.createElement('div');
              shine.className = 'fvh-pack-card-shine';
              cCard.appendChild(shine);

              var rarityBadge = document.createElement('div');
              rarityBadge.className = 'rar ' + (rarity === 'coins' ? 'legendary' : rarity);
              rarityBadge.style.cssText = 'font-size:9.5px;padding:2px 8px;margin-bottom:6px;';
              rarityBadge.textContent = rarity === 'coins' ? 'FVH COINS' : tr('rarity_' + rarity);
              cCard.appendChild(rarityBadge);

              var thumb = document.createElement('div');
              thumb.className = 'fvh-pack-reward-thumb';
              if (dr.type === 'cosmetic') {
                thumb.innerHTML = renderItemArtwork(dr.item, 'large');
              } else {
                thumb.innerHTML = getFvhCoinSvg('large');
              }
              cCard.appendChild(thumb);

              var nameBox = document.createElement('div');
              nameBox.className = 'fvh-pack-reward-title';
              nameBox.textContent = dr.type === 'cosmetic' ? trItem(dr.item.name) : ('+' + dr.val + ' FvH Coin');
              cCard.appendChild(nameBox);

              if (dr.isNew) {
                var newPill = document.createElement('div');
                newPill.className = 'fvh-pack-badge-new';
                newPill.textContent = (getActiveLang() === 'ru') ? '✨ НОВИНКА!' : '✨ NEW!';
                cCard.appendChild(newPill);
              } else if (dr.isDuplicateFallback) {
                var compPill = document.createElement('div');
                compPill.className = 'fvh-pack-badge-fallback';
                compPill.title = (getActiveLang() === 'ru') ? 'Все предметы коллекции получены!' : 'All collection items owned!';
                compPill.textContent = (getActiveLang() === 'ru') ? '💎 КОМПЕНСАЦИЯ' : '💎 COIN BONUS';
                cCard.appendChild(compPill);
              }

              cardsContainer.appendChild(cCard);
            });

            stage.appendChild(congratsTitle);
            stage.appendChild(cardsContainer);

            // Stage 5: Claim All Button
            var claimBtn = document.createElement('button');
            claimBtn.className = 'btn fvh-pack-claim-btn';
            claimBtn.textContent = (getActiveLang() === 'ru') ? 'ЗАБРАТЬ ВСЁ' : 'CLAIM ALL';
            claimBtn.onclick = function () {
              app.audio.play('claim');
              overlay.remove();
              renderShop();
            };
            stage.appendChild(claimBtn);

            app.audio.play('score');
          }, 350);
        }, 450);
      };
    }
    app.openPackAnimation = openPackAnimation;
`;

// Replace old openPackAnimation in js/redesign.js
const oldPackFuncPattern = /function openPackAnimation\(packDef\)[\s\S]*?renderShop\(\);\s*};\s*overlay\.appendChild\(m\);\s*document\.body\.appendChild\(overlay\);\s*}/m;
if (oldPackFuncPattern.test(jsCode)) {
  jsCode = jsCode.replace(oldPackFuncPattern, newOpenPackAnimation);
  console.log('✓ Replaced openPackAnimation with 3D interactive sequence & duplicate protection');
} else {
  console.error('Could not find old openPackAnimation pattern');
}

// 4. Update updateWalletUI to use getFvhCoinSvg('inline')
const oldWalletPattern = /walletBox\.innerHTML\s*=\s*['"]<div class="fvh-chip coins">🪙 ['"]\s*\+\s*coins\s*\+\s*['"]<\/div>['"]/;
if (oldWalletPattern.test(jsCode)) {
  jsCode = jsCode.replace(oldWalletPattern, 'walletBox.innerHTML = \'<div class="fvh-chip coins">\' + getFvhCoinSvg("inline") + \' <span style="font-weight:900;color:#fde047;margin-left:4px;">\' + coins.toLocaleString() + \'</span></div>\'');
  console.log('✓ Updated walletBox UI with custom FvH Coin badge');
} else {
  console.log('Wallet pattern not matched or already updated');
}

fs.writeFileSync(redesignJsPath, jsCode, 'utf8');
console.log('=== Successfully patched js/redesign.js and css/redesign.css ===');
