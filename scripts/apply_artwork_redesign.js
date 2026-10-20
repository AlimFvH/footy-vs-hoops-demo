const fs = require('fs');

console.log('Generating updated artwork in js/redesign.js...');

let code = fs.readFileSync('js/redesign.js', 'utf8');

// Replacement for getDetailedJerseySvg and getDetailedBallSvg
const newJerseysAndBalls = `  // Detailed Athletic Jersey SVG
  function getDetailedJerseySvg(item, size) {
    var isLg = size === 'large';
    var w = isLg ? 200 : 76;
    var h = isLg ? 200 : 76;
    var id = (typeof item === 'string') ? item : (item && (item.id || item.itemId)) || '';
    var uid = id.replace(/[^a-zA-Z0-9]/g, '_');

    // Palette & Pattern Configs
    var primary = '#1e3a8a';
    var secondary = '#38bdf8';
    var accent = '#ffffff';
    var trim = '#93c5fd';
    var number = '10';
    var isBasketball = false;
    var pattern = 'plain';

    if (id === 'skin_rookie') {
      primary = '#1d4ed8'; secondary = '#0284c7'; accent = '#ffffff'; trim = '#60a5fa'; number = '10'; pattern = 'chevron';
    } else if (id === 'skin_crimson') {
      primary = '#b91c1c'; secondary = '#7f1d1d'; accent = '#fef08a'; trim = '#f59e0b'; number = '7'; pattern = 'stripes';
    } else if (id === 'skin_neon' || id === 'skin_neon_elite') {
      primary = '#090d16'; secondary = '#00f0ff'; accent = '#10b981'; trim = '#00f0ff'; number = '10'; pattern = 'circuit';
    } else if (id === 'skin_frost') {
      primary = '#0369a1'; secondary = '#e0f2fe'; accent = '#38bdf8'; trim = '#bae6fd'; number = '33'; pattern = 'frost';
    } else if (id === 'skin_shadow') {
      primary = '#09090b'; secondary = '#7c3aed'; accent = '#c084fc'; trim = '#a855f7'; number = '00'; pattern = 'stealth';
    } else if (id === 'skin_solar') {
      isBasketball = true;
      primary = '#c2410c'; secondary = '#f59e0b'; accent = '#fef08a'; trim = '#ea580c'; number = '24'; pattern = 'flame';
    } else if (id === 'skin_gold') {
      primary = '#854d0e'; secondary = '#facc15'; accent = '#ffffff'; trim = '#fef08a'; number = '1'; pattern = 'royal';
    } else if (id === 'skin_cyber') {
      primary = '#4a044e'; secondary = '#d946ef'; accent = '#00f0ff'; trim = '#f43f5e'; number = '99'; pattern = 'glitch';
    } else if (id === 'skin_sunset') {
      isBasketball = true;
      primary = '#ea580c'; secondary = '#facc15'; accent = '#ffffff'; trim = '#fb923c'; number = '8'; pattern = 'wave';
    } else if (id === 'skin_hydro') {
      primary = '#0369a1'; secondary = '#06b6d4'; accent = '#67e8f9'; trim = '#22d3ee'; number = '11'; pattern = 'aquatic';
    } else if (id === 'skin_mars') {
      isBasketball = true;
      primary = '#991b1b'; secondary = '#ea580c'; accent = '#fed7aa'; trim = '#f97316'; number = '42'; pattern = 'hazard';
    } else if (id === 'skin_astronaut') {
      primary = '#1e293b'; secondary = '#94a3b8'; accent = '#38bdf8'; trim = '#facc15'; number = '01'; pattern = 'space';
    }

    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
      '<linearGradient id="jg_' + uid + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="' + primary + '"/>' +
      '<stop offset="60%" stop-color="' + secondary + '"/>' +
      '<stop offset="100%" stop-color="' + primary + '"/>' +
      '</linearGradient>' +
      '<linearGradient id="trim_' + uid + '" x1="0%" y1="0%" x2="100%" y2="0%">' +
      '<stop offset="0%" stop-color="' + trim + '"/>' +
      '<stop offset="100%" stop-color="' + accent + '"/>' +
      '</linearGradient>' +
      '<filter id="glow_' + uid + '"><feGaussianBlur stdDeviation="1.5" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>' +
      '</defs>' +
      '<ellipse cx="50" cy="90" rx="26" ry="5" fill="#000000" opacity="0.35"/>' +
      (isBasketball ?
        '<path d="M34 22 C32 30 26 36 24 46 L28 84 L72 84 L76 46 C74 36 68 30 66 22 L56 26 C54 36 46 36 44 26 Z" fill="url(#jg_' + uid + ')" stroke="' + trim + '" stroke-width="1.4"/>' +
        '<path d="M34 22 C32 30 26 36 24 46" stroke="' + trim + '" stroke-width="2.2" fill="none"/>' +
        '<path d="M66 22 C74 36 76 46 76 46" stroke="' + trim + '" stroke-width="2.2" fill="none"/>' +
        '<path d="M44 26 C46 36 54 36 56 26" stroke="' + trim + '" stroke-width="2.2" fill="none"/>' :
        '<path d="M28 24 L10 38 L22 48 L28 42 L28 84 L72 84 L72 42 L78 48 L90 38 L72 24 L56 30 L44 30 Z" fill="url(#jg_' + uid + ')" stroke="' + trim + '" stroke-width="1.4"/>' +
        '<polygon points="10,38 14,41 24,33 22,30" fill="url(#trim_' + uid + ')"/>' +
        '<polygon points="90,38 86,41 76,33 78,30" fill="url(#trim_' + uid + ')"/>' +
        '<polygon points="44,24 50,32 56,24 53,24 50,29 47,24" fill="url(#trim_' + uid + ')"/>'
      ) +
      (pattern === 'stripes' ?
        '<line x1="38" y1="36" x2="38" y2="84" stroke="' + secondary + '" stroke-width="4.5"/>' +
        '<line x1="62" y1="36" x2="62" y2="84" stroke="' + secondary + '" stroke-width="4.5"/>' : '') +
      (pattern === 'chevron' ?
        '<path d="M32 44 L50 54 L68 44" stroke="' + accent + '" stroke-width="2.5" fill="none" opacity="0.8"/>' +
        '<path d="M32 52 L50 62 L68 52" stroke="' + accent + '" stroke-width="2" fill="none" opacity="0.6"/>' : '') +
      (pattern === 'circuit' ?
        '<path d="M30 42 L42 42 L48 50 L48 76" stroke="#00f0ff" stroke-width="1.8" fill="none" filter="url(#glow_' + uid + ')"/>' +
        '<circle cx="48" cy="76" r="2.5" fill="#10b981"/>' +
        '<path d="M70 42 L58 42 L52 50 L52 76" stroke="#00f0ff" stroke-width="1.8" fill="none" filter="url(#glow_' + uid + ')"/>' +
        '<circle cx="52" cy="76" r="2.5" fill="#10b981"/>' : '') +
      (pattern === 'stealth' ?
        '<polygon points="28,42 66,84 72,84 34,42" fill="' + secondary + '" opacity="0.75" filter="url(#glow_' + uid + ')"/>' : '') +
      (pattern === 'flame' ?
        '<path d="M34 84 Q42 68 46 74 Q50 60 54 74 Q58 68 66 84 Z" fill="' + secondary + '" opacity="0.8"/>' : '') +
      (pattern === 'royal' ?
        '<polygon points="28,42 66,84 72,84 34,42" fill="' + accent + '" opacity="0.85"/>' +
        '<circle cx="50" cy="40" r="4" fill="' + accent + '" filter="url(#glow_' + uid + ')"/>' : '') +
      (pattern === 'glitch' ?
        '<line x1="30" y1="46" x2="70" y2="46" stroke="#00f0ff" stroke-width="2" opacity="0.8"/>' +
        '<line x1="32" y1="50" x2="68" y2="50" stroke="#f43f5e" stroke-width="2" opacity="0.8"/>' : '') +
      '<circle cx="38" cy="38" r="4" fill="' + accent + '" stroke="' + primary + '" stroke-width="1"/>' +
      '<text x="38" y="41" font-size="5" text-anchor="middle" fill="' + primary + '" font-weight="900">★</text>' +
      '<text x="51" y="67" font-family="Impact, Arial Black, sans-serif" font-size="' + (isLg ? '24' : '22') + '" font-weight="900" fill="#000000" opacity="0.45" text-anchor="middle">' + number + '</text>' +
      '<text x="50" y="66" font-family="Impact, Arial Black, sans-serif" font-size="' + (isLg ? '24' : '22') + '" font-weight="900" fill="' + accent + '" stroke="' + primary + '" stroke-width="0.8" text-anchor="middle">' + number + '</text>' +
      '<rect x="32" y="78" width="6" height="4" rx="0.5" fill="' + accent + '" opacity="0.85"/>' +
      '<line x1="33" y1="80" x2="37" y2="80" stroke="' + primary + '" stroke-width="0.8"/>' +
      '</svg>';
  }

  // Detailed 3D Ball SVG
  function getDetailedBallSvg(item, size) {
    var isLg = size === 'large';
    var w = isLg ? 200 : 76;
    var h = isLg ? 200 : 76;
    var id = (typeof item === 'string') ? item : (item && (item.id || item.itemId)) || '';
    var uid = id.replace(/[^a-zA-Z0-9]/g, '_');
    var isHoops = id.indexOf('hoops') !== -1 || id === 'ball_tidal' || id === 'ball_cyber_neon';

    if (isHoops) {
      var bStart = '#ea580c';
      var bMid = '#c2410c';
      var bEnd = '#451a03';
      var seam = '#180802';
      var hasRing = false;
      var glow = '';

      if (id === 'ball_hoops_blaze') {
        bStart = '#a855f7'; bMid = '#7c3aed'; bEnd = '#2e1065'; seam = '#00f0ff'; glow = 'filter="drop-shadow(0 0 6px #00f0ff)"';
      } else if (id === 'ball_hoops_chrome') {
        bStart = '#f8fafc'; bMid = '#94a3b8'; bEnd = '#1e293b'; seam = '#0284c7';
      } else if (id === 'ball_hoops_midnight') {
        bStart = '#3b82f6'; bMid = '#1e1b4b'; bEnd = '#050714'; seam = '#f59e0b'; hasRing = true;
      } else if (id === 'ball_tidal') {
        bStart = '#38bdf8'; bMid = '#0284c7'; bEnd = '#082f49'; seam = '#cffafe';
      } else if (id === 'ball_cyber_neon') {
        bStart = '#180828'; bMid = '#3b0764'; bEnd = '#090314'; seam = '#f43f5e'; glow = 'filter="drop-shadow(0 0 6px #f43f5e)"'; hasRing = true;
      }

      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
        '<radialGradient id="bb_' + uid + '" cx="34%" cy="30%" r="68%">' +
        '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.45"/>' +
        '<stop offset="30%" stop-color="' + bStart + '"/>' +
        '<stop offset="75%" stop-color="' + bMid + '"/>' +
        '<stop offset="100%" stop-color="' + bEnd + '"/>' +
        '</radialGradient>' +
        '</defs>' +
        '<ellipse cx="50" cy="92" rx="28" ry="6" fill="#000000" opacity="0.38"/>' +
        (hasRing ? '<ellipse cx="50" cy="50" rx="46" ry="14" stroke="#00f0ff" stroke-width="2.6" fill="none" transform="rotate(-24, 50, 50)" opacity="0.9"/>' : '') +
        '<circle cx="50" cy="50" r="38" fill="url(#bb_' + uid + ')" ' + glow + '/>' +
        '<circle cx="50" cy="50" r="38" stroke="' + seam + '" stroke-width="2.2" fill="none"/>' +
        '<line x1="12" y1="50" x2="88" y2="50" stroke="' + seam + '" stroke-width="2.2"/>' +
        '<line x1="50" y1="12" x2="50" y2="88" stroke="' + seam + '" stroke-width="2.2"/>' +
        '<path d="M22 24 C38 36 38 64 22 76" stroke="' + seam + '" stroke-width="2.2" fill="none"/>' +
        '<path d="M78 24 C62 36 62 64 78 76" stroke="' + seam + '" stroke-width="2.2" fill="none"/>' +
        '<ellipse cx="36" cy="32" rx="9" ry="4.5" fill="#ffffff" opacity="0.45" transform="rotate(-28, 36, 32)"/>' +
        '<circle cx="33" cy="29" r="2.5" fill="#ffffff" opacity="0.75"/>' +
        '</svg>';
    } else {
      var fStart = '#ffffff';
      var fMid = '#e2e8f0';
      var fEnd = '#0f172a';
      var patch = '#1e293b';
      var seamColor = '#00f0ff';
      var hasAura = false;

      if (id === 'ball_footy_plasma') {
        fStart = '#00f0ff'; fMid = '#0284c7'; fEnd = '#0f172a'; patch = '#10b981'; seamColor = '#00f0ff'; hasAura = true;
      } else if (id === 'ball_footy_gold') {
        fStart = '#fef08a'; fMid = '#eab308'; fEnd = '#713f12'; patch = '#ca8a04'; seamColor = '#fef08a'; hasAura = true;
      } else if (id === 'ball_footy_inferno') {
        fStart = '#fb923c'; fMid = '#ea580c'; fEnd = '#450a0a'; patch = '#1c0505'; seamColor = '#ef4444'; hasAura = true;
      } else if (id === 'ball_footy_solar') {
        fStart = '#fde047'; fMid = '#f59e0b'; fEnd = '#78350f'; patch = '#9a3412'; seamColor = '#fbbf24'; hasAura = true;
      } else if (id === 'ball_earthrise') {
        fStart = '#38bdf8'; fMid = '#0284c7'; fEnd = '#082f49'; patch = '#15803d'; seamColor = '#ffffff'; hasAura = true;
      }

      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
        '<radialGradient id="fb_' + uid + '" cx="34%" cy="30%" r="68%">' +
        '<stop offset="0%" stop-color="' + fStart + '"/>' +
        '<stop offset="50%" stop-color="' + fMid + '"/>' +
        '<stop offset="100%" stop-color="' + fEnd + '"/>' +
        '</radialGradient>' +
        '</defs>' +
        '<ellipse cx="50" cy="92" rx="28" ry="6" fill="#000000" opacity="0.38"/>' +
        (hasAura ? '<circle cx="50" cy="50" r="42" fill="' + seamColor + '" opacity="0.22"/>' : '') +
        '<circle cx="50" cy="50" r="38" fill="url(#fb_' + uid + ')" stroke="' + seamColor + '" stroke-width="2"/>' +
        '<polygon points="50,34 63,43 58,58 42,58 37,43" fill="' + patch + '" stroke="' + seamColor + '" stroke-width="2"/>' +
        '<line x1="50" y1="34" x2="50" y2="14" stroke="' + seamColor + '" stroke-width="2"/>' +
        '<line x1="63" y1="43" x2="82" y2="36" stroke="' + seamColor + '" stroke-width="2"/>' +
        '<line x1="58" y1="58" x2="72" y2="76" stroke="' + seamColor + '" stroke-width="2"/>' +
        '<line x1="42" y1="58" x2="28" y2="76" stroke="' + seamColor + '" stroke-width="2"/>' +
        '<line x1="37" y1="43" x2="18" y2="36" stroke="' + seamColor + '" stroke-width="2"/>' +
        '<polygon points="44,14 56,14 62,20 38,20" fill="' + patch + '" stroke="' + seamColor + '" stroke-width="1.8"/>' +
        '<polygon points="82,36 88,48 84,60 78,54" fill="' + patch + '" stroke="' + seamColor + '" stroke-width="1.8"/>' +
        '<polygon points="18,36 12,48 16,60 22,54" fill="' + patch + '" stroke="' + seamColor + '" stroke-width="1.8"/>' +
        '<ellipse cx="36" cy="32" rx="8" ry="4" fill="#ffffff" opacity="0.5" transform="rotate(-25, 36, 32)"/>' +
        '<circle cx="33" cy="29" r="2.2" fill="#ffffff" opacity="0.8"/>' +
        '</svg>';
    }
  }`;

// Find start and end of getDetailedJerseySvg to end of getDetailedBallSvg
const startMarker = '  // Detailed Athletic Jersey SVG\n  function getDetailedJerseySvg';
const endMarker = '  // Detailed Scenic Stadium & Court Artwork (10 Unique Environments)';

const sIdx = code.indexOf(startMarker);
const eIdx = code.indexOf(endMarker);

if (sIdx === -1 || eIdx === -1) {
  console.error('Markers not found in js/redesign.js', { sIdx, eIdx });
  process.exit(1);
}

code = code.slice(0, sIdx) + newJerseysAndBalls + '\n\n' + code.slice(eIdx);
fs.writeFileSync('js/redesign.js', code, 'utf8');
console.log('Successfully updated Jerseys and Balls artwork in js/redesign.js!');
