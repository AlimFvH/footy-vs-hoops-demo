const fs = require('fs');
const path = require('path');

const redesignPath = path.resolve('js/redesign.js');
let code = fs.readFileSync(redesignPath, 'utf8');

// Find start of getFvhCoinSvg and end of getDetailedCoinsSvg
const start = code.indexOf('function getFvhCoinSvg(size, extraOpts) {');
if (start === -1) {
  console.error('Could not find getFvhCoinSvg in js/redesign.js');
  process.exit(1);
}

const endMarker = 'function getDetailedBattlePassSvg(item, size) {';
const end = code.indexOf(endMarker);
if (end === -1) {
  console.error('Could not find getDetailedBattlePassSvg in js/redesign.js');
  process.exit(1);
}

const newFunctions = `function getFvhCoinSvg(size, extraOpts) {
    var isInline = size === 'inline';
    var isLg = size === 'large';
    var isSm = size === 'small' || size === 'thumb';

    var w = isInline ? 20 : (isLg ? 160 : (isSm ? 48 : 64));
    var h = w;
    var uid = 'fvhCoin_' + Math.random().toString(36).substr(2, 6);

    if (isInline) {
      // 20x20 Compact High-Contrast Half-Green, Half-Orange Coin for Badges & HUD
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;flex-shrink:0;filter:drop-shadow(0 2px 5px rgba(245,158,11,0.5));">' +
        '<defs>' +
        '<linearGradient id="inRim_' + uid + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
        '<stop offset="0%" stop-color="#ffffff"/>' +
        '<stop offset="30%" stop-color="#fde047"/>' +
        '<stop offset="70%" stop-color="#ca8a04"/>' +
        '<stop offset="100%" stop-color="#713f12"/>' +
        '</linearGradient>' +
        '<clipPath id="inClip_' + uid + '">' +
        '<circle cx="12" cy="12" r="8.2"/>' +
        '</clipPath>' +
        '</defs>' +
        '<circle cx="12" cy="12.8" r="10.5" fill="#381402"/>' +
        '<circle cx="12" cy="12" r="10.5" fill="url(#inRim_' + uid + ')"/>' +
        '<circle cx="12" cy="12" r="8.2" fill="#1e293b"/>' +
        '<g clip-path="url(#inClip_' + uid + ')">' +
        '<rect x="3.5" y="3.5" width="8.5" height="17" fill="#10b981"/>' +
        '<rect x="12" y="3.5" width="8.5" height="17" fill="#f97316"/>' +
        '<line x1="12" y1="3.5" x2="12" y2="20.5" stroke="#fef08a" stroke-width="0.9"/>' +
        '</g>' +
        '<text x="12" y="15.2" font-family="\'Impact\', \'Arial Black\', sans-serif" font-size="8.4" font-weight="900" fill="#000000" text-anchor="middle" letter-spacing="-0.3">FvH</text>' +
        '<text x="12" y="14.5" font-family="\'Impact\', \'Arial Black\', sans-serif" font-size="8.4" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="-0.3">FvH</text>' +
        '<circle cx="6" cy="6" r="1.3" fill="#ffffff" opacity="0.95"/>' +
        '</svg>';
    }

    // 24 Milled gold beads
    var beads = '';
    for (var i = 0; i < 24; i++) {
      var a = (i * 360 / 24) * Math.PI / 180;
      var bx = 50 + 44.5 * Math.cos(a);
      var by = 50 + 44.5 * Math.sin(a);
      beads += '<circle cx="' + bx.toFixed(2) + '" cy="' + by.toFixed(2) + '" r="1.4" fill="#fde047"/>';
    }

    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto;filter:drop-shadow(0 8px 20px rgba(0, 0, 0, 0.65));">' +
      '<defs>' +
      '<linearGradient id="rim_' + uid + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="#ffffff"/>' +
      '<stop offset="15%" stop-color="#fffbeb"/>' +
      '<stop offset="35%" stop-color="#fde047"/>' +
      '<stop offset="65%" stop-color="#ca8a04"/>' +
      '<stop offset="88%" stop-color="#eab308"/>' +
      '<stop offset="100%" stop-color="#713f12"/>' +
      '</linearGradient>' +
      '<radialGradient id="green_' + uid + '" cx="35%" cy="35%" r="65%">' +
      '<stop offset="0%" stop-color="#6ee7b7"/>' +
      '<stop offset="35%" stop-color="#10b981"/>' +
      '<stop offset="75%" stop-color="#047857"/>' +
      '<stop offset="100%" stop-color="#064e3b"/>' +
      '</radialGradient>' +
      '<radialGradient id="orange_' + uid + '" cx="65%" cy="35%" r="65%">' +
      '<stop offset="0%" stop-color="#fed7aa"/>' +
      '<stop offset="35%" stop-color="#f97316"/>' +
      '<stop offset="75%" stop-color="#ea580c"/>' +
      '<stop offset="100%" stop-color="#7c2d12"/>' +
      '</radialGradient>' +
      '<linearGradient id="plaque_' + uid + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
      '<stop offset="0%" stop-color="#ffffff"/>' +
      '<stop offset="25%" stop-color="#fef08a"/>' +
      '<stop offset="60%" stop-color="#eab308"/>' +
      '<stop offset="100%" stop-color="#854d0e"/>' +
      '</linearGradient>' +
      '<linearGradient id="fvh_' + uid + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
      '<stop offset="0%" stop-color="#ffffff"/>' +
      '<stop offset="40%" stop-color="#fffbeb"/>' +
      '<stop offset="75%" stop-color="#fde047"/>' +
      '<stop offset="100%" stop-color="#ca8a04"/>' +
      '</linearGradient>' +
      '<linearGradient id="sheen_' + uid + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/>' +
      '<stop offset="35%" stop-color="#ffffff" stop-opacity="0.12"/>' +
      '<stop offset="65%" stop-color="#ffffff" stop-opacity="0"/>' +
      '</linearGradient>' +
      '<clipPath id="inner_' + uid + '">' +
      '<circle cx="50" cy="50" r="39.5"/>' +
      '</clipPath>' +
      '</defs>' +
      '<circle cx="50" cy="50" r="48.5" fill="#facc15" fill-opacity="0.2"/>' +
      '<circle cx="50" cy="53" r="47" fill="#381402"/>' +
      '<circle cx="50" cy="50" r="47" fill="url(#rim_' + uid + ')"/>' +
      '<circle cx="50" cy="50" r="44.5" fill="none" stroke="#78350f" stroke-width="0.8"/>' +
      beads +
      '<circle cx="50" cy="50" r="40.5" fill="#1e293b"/>' +
      '<g clip-path="url(#inner_' + uid + ')">' +
      '<rect x="10" y="10" width="40.2" height="80" fill="url(#green_' + uid + ')"/>' +
      '<path d="M42 30 A20 20 0 0 0 42 70" stroke="#ffffff" stroke-width="1.8" stroke-opacity="0.35" fill="none"/>' +
      '<circle cx="50" cy="50" r="16" stroke="#ffffff" stroke-width="1.2" stroke-opacity="0.25" fill="none"/>' +
      '<rect x="50" y="10" width="40.2" height="80" fill="url(#orange_' + uid + ')"/>' +
      '<path d="M58 30 A20 20 0 0 1 58 70" stroke="#000000" stroke-width="2.2" stroke-opacity="0.35" fill="none"/>' +
      '<path d="M50 20 C68 28 78 40 78 50 C78 60 68 72 50 80" stroke="#000000" stroke-width="1.8" stroke-opacity="0.25" fill="none"/>' +
      '<line x1="50.1" y1="10" x2="50.1" y2="90" stroke="#fde047" stroke-width="2.2"/>' +
      '<line x1="50.1" y1="10" x2="50.1" y2="90" stroke="#ffffff" stroke-width="0.8"/>' +
      '</g>' +
      '<circle cx="50" cy="50" r="39.5" fill="none" stroke="#fde047" stroke-width="1.3"/>' +
      '<path d="M50 17 L51.5 19.5 L54 20 L52 21.8 L52.6 24.2 L50 22.8 L47.4 24.2 L48 21.8 L46 20 L48.5 19.5 Z" fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.5))"/>' +
      '<path d="M50 78 L51.2 80 L53.5 80.5 L51.8 82 L52.4 84.2 L50 83 L47.6 84.2 L48.2 82 L46.5 80.5 L48.8 80 Z" fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.5))"/>' +
      '<text x="50" y="55" font-family="\'Impact\', \'Arial Black\', sans-serif" font-size="30" font-weight="900" fill="#000000" text-anchor="middle" letter-spacing="-0.5" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.9))">FvH</text>' +
      '<text x="50" y="53.5" font-family="\'Impact\', \'Arial Black\', sans-serif" font-size="30" font-weight="900" fill="#2a0f02" text-anchor="middle" letter-spacing="-0.5">FvH</text>' +
      '<text x="50" y="51.5" font-family="\'Impact\', \'Arial Black\', sans-serif" font-size="30" font-weight="900" fill="url(#fvh_' + uid + ')" text-anchor="middle" letter-spacing="-0.5" stroke="#ffffff" stroke-width="0.9">FvH</text>' +
      '<rect x="29" y="60.5" width="42" height="14" rx="7" fill="#090d16" filter="drop-shadow(0 2px 5px rgba(0,0,0,0.8))"/>' +
      '<rect x="29" y="60.5" width="42" height="14" rx="7" fill="url(#plaque_' + uid + ')" stroke="#ffffff" stroke-width="0.8"/>' +
      '<text x="50" y="71" font-family="\'Arial Black\', sans-serif" font-size="9" font-weight="900" fill="#381402" text-anchor="middle" letter-spacing="1.5">COIN</text>' +
      '<path d="M12 40 A42 42 0 0 1 88 40 A46 43 0 0 0 12 40 Z" fill="url(#sheen_' + uid + ')"/>' +
      '<path d="M22 21 Q22 27 16 27 Q22 27 22 33 Q22 27 28 27 Q22 27 22 21 Z" fill="#ffffff" filter="drop-shadow(0 0 4px #ffffff)"/>' +
      '<circle cx="22" cy="27" r="6" fill="#fde047" opacity="0.6"/>' +
      '</svg>';
  }

  // Detailed Stacked Currency Bundles SVG
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

    var uid = 'cStack_' + Math.random().toString(36).substr(2, 6);
    var coinsHtml = '';
    var baseY = 76;
    var dy = 5.2;
    for (var i = 0; i < stackCount; i++) {
      var y = baseY - (i * dy);
      coinsHtml += '<ellipse cx="50" cy="' + y + '" rx="29" ry="11" fill="#381402" stroke="#ca8a04" stroke-width="1.8"/>' +
        '<ellipse cx="50" cy="' + (y - 1.8) + '" rx="28" ry="10" fill="#eab308" stroke="#fef08a" stroke-width="1.2"/>' +
        '<ellipse cx="50" cy="' + (y - 2.5) + '" rx="24" ry="8" fill="#1e293b"/>' +
        '<g clip-path="url(#cStackClip_' + uid + '_' + i + ')">' +
        '<rect x="25" y="' + (y - 11) + '" width="25" height="18" fill="#10b981"/>' +
        '<rect x="50" y="' + (y - 11) + '" width="25" height="18" fill="#f97316"/>' +
        '<line x1="50" y1="' + (y - 11) + '" x2="50" y2="' + (y + 7) + '" stroke="#fef08a" stroke-width="0.8"/>' +
        '</g>' +
        '<text x="50" y="' + (y - 0.5) + '" font-family="Impact, Arial Black" font-size="7.5" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="-0.5" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.8))">FvH</text>';
    }

    var defsClips = '';
    for (var i = 0; i < stackCount; i++) {
      var y = baseY - (i * dy);
      defsClips += '<clipPath id="cStackClip_' + uid + '_' + i + '"><ellipse cx="50" cy="' + (y - 2.5) + '" rx="24" ry="8"/></clipPath>';
    }

    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto;filter:drop-shadow(0 6px 16px rgba(245,158,11,0.45));">' +
      '<defs>' +
      '<radialGradient id="cStackGlow_' + uid + '" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fde047" stop-opacity="0.35"/><stop offset="100%" stop-color="#ca8a04" stop-opacity="0"/></radialGradient>' +
      defsClips +
      '</defs>' +
      '<circle cx="50" cy="50" r="46" fill="#0d131f" stroke="#facc15" stroke-width="1.8"/>' +
      '<circle cx="50" cy="50" r="42" fill="url(#cStackGlow_' + uid + ')"/>' +
      coinsHtml +
      '<polygon points="22,25 24,20 26,25 31,27 26,29 24,34 22,29 17,27" fill="#ffffff" filter="drop-shadow(0 0 2px #fff)"/>' +
      '<polygon points="78,35 80,31 82,35 86,37 82,39 80,43 78,39 74,37" fill="#fef08a"/>' +
      '</svg>';
  }

  `;

code = code.slice(0, start) + newFunctions + code.slice(end);
fs.writeFileSync(redesignPath, code);
console.log('Successfully patched getFvhCoinSvg and getDetailedCoinsSvg with 50/50 Green & Orange design!');
