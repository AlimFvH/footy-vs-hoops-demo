const fs = require('fs');

console.log('Building Section B upgraded artwork generators...');

let code = fs.readFileSync('js/redesign.js', 'utf8');

const sIdx = code.indexOf('  // Detailed Celebration Burst SVG\n  function getDetailedCelebrationSvg');
const eIdx = code.indexOf('  window.renderItemArtwork = renderItemArtwork;');

if (sIdx === -1 || eIdx === -1) {
  console.error('Section B markers not found!', { sIdx, eIdx });
  process.exit(1);
}

// Extract getDetailedBoostSvg from existing code so we preserve its verified logic
const boostStart = code.indexOf('  // Detailed High-Fidelity Boost SVG\n  function getDetailedBoostSvg');
const trailStart = code.indexOf('  // Detailed Speed Trail SVG\n  function getDetailedTrailSvg');

if (boostStart === -1 || trailStart === -1) {
  console.error('Boost markers not found!', { boostStart, trailStart });
  process.exit(1);
}

const preservedBoostCode = code.slice(boostStart, trailStart);

const newSectionB = `  // Detailed Celebration Burst SVG (6 Distinct Dynamic Effects)
  function getDetailedCelebrationSvg(item, size) {
    var isLg = size === 'large';
    var w = isLg ? 160 : 76;
    var h = isLg ? 160 : 76;
    var id = (typeof item === 'string') ? item : (item && (item.id || item.itemId)) || '';
    var uid = id.replace(/[^a-zA-Z0-9]/g, '_');

    // 1. Pyrotechnic Fireworks (cel_fireworks) - Multi-tiered chrysanthemum explosion
    if (id === 'cel_fireworks') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="50" cy="50" r="44" fill="#030712" stroke="#ec4899" stroke-width="1.5"/>' +
        '<circle cx="50" cy="40" r="32" stroke="#ec4899" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6"/>' +
        '<circle cx="50" cy="40" r="22" stroke="#facc15" stroke-width="1.8" stroke-dasharray="4 4"/>' +
        '<circle cx="50" cy="40" r="10" stroke="#38bdf8" stroke-width="2"/>' +
        '<path d="M50 8L50 72 M18 40L82 40 M28 18L72 62 M72 18L28 62" stroke="#f43f5e" stroke-width="1.8" stroke-linecap="round"/>' +
        '<circle cx="50" cy="40" r="5" fill="#ffffff"/>' +
        '<circle cx="28" cy="18" r="2.5" fill="#facc15"/><circle cx="72" cy="18" r="2.5" fill="#00f0ff"/>' +
        '<circle cx="18" cy="40" r="2.5" fill="#ec4899"/><circle cx="82" cy="40" r="2.5" fill="#facc15"/>' +
        '<circle cx="28" cy="62" r="2.5" fill="#38bdf8"/><circle cx="72" cy="62" r="2.5" fill="#ec4899"/>' +
        '<circle cx="50" cy="8" r="3" fill="#ffffff"/>' +
        '</svg>';
    }

    // 2. Sonic Concussion Shockwave (cel_shockwave) - Expanding sonic wave ripples
    if (id === 'cel_shockwave') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="50" cy="50" r="44" fill="#050814" stroke="#00f0ff" stroke-width="1.8"/>' +
        '<circle cx="50" cy="50" r="38" stroke="#00f0ff" stroke-width="3" opacity="0.35"/>' +
        '<circle cx="50" cy="50" r="26" stroke="#38bdf8" stroke-width="3.5" opacity="0.75"/>' +
        '<circle cx="50" cy="50" r="14" stroke="#ffffff" stroke-width="4"/>' +
        '<circle cx="50" cy="50" r="6" fill="#00f0ff"/>' +
        '<path d="M50 4 L50 16 M50 96 L50 84 M4 50 L16 50 M96 50 L84 50" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round"/>' +
        '<path d="M18 18 L26 26 M82 18 L74 26 M18 82 L26 74 M82 82 L74 74" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round"/>' +
        '</svg>';
    }

    // 3. Volcanic Flame Geyser (cel_flames) - Swirling fire storm
    if (id === 'cel_flames') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="50" cy="50" r="44" fill="#180702" stroke="#ea580c" stroke-width="1.8"/>' +
        '<path d="M50 10 C68 28 80 48 76 70 C72 84 60 90 50 90 C40 90 28 84 24 70 C20 48 32 28 50 10 Z" fill="#ef4444"/>' +
        '<path d="M50 24 C62 38 72 54 68 72 C65 82 56 86 50 86 C44 86 35 82 32 72 C28 54 38 38 50 24 Z" fill="#f97316"/>' +
        '<path d="M50 40 C58 52 64 64 62 76 C60 82 55 84 50 84 C45 84 40 82 38 76 C36 64 42 52 50 40 Z" fill="#fde047"/>' +
        '<circle cx="50" cy="74" r="5" fill="#ffffff"/>' +
        '<circle cx="34" cy="30" r="2" fill="#fbbf24"/><circle cx="68" cy="34" r="2.5" fill="#f97316"/>' +
        '<circle cx="60" cy="18" r="1.8" fill="#fde047"/><circle cx="38" cy="14" r="1.5" fill="#ef4444"/>' +
        '</svg>';
    }

    // 4. Golden Rain Shower (cel_goldrain) - Cascading gold coins & trophies
    if (id === 'cel_goldrain') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="50" cy="50" r="44" fill="#140f02" stroke="#facc15" stroke-width="1.8"/>' +
        '<circle cx="30" cy="26" r="9" fill="#facc15" stroke="#78350f" stroke-width="1.8"/>' +
        '<circle cx="70" cy="22" r="11" fill="#facc15" stroke="#78350f" stroke-width="2"/>' +
        '<circle cx="48" cy="50" r="14" fill="#facc15" stroke="#78350f" stroke-width="2.2"/>' +
        '<text x="48" y="55" font-family="Arial Black" font-size="12" fill="#78350f" text-anchor="middle">★</text>' +
        '<circle cx="22" cy="72" r="8" fill="#facc15" stroke="#78350f" stroke-width="1.6"/>' +
        '<circle cx="78" cy="70" r="10" fill="#facc15" stroke="#78350f" stroke-width="1.8"/>' +
        '<polygon points="50,6 52,14 60,14 53,19 56,26 50,22 44,26 47,19 40,14 48,14" fill="#fef08a"/>' +
        '<polygon points="86,40 88,46 94,46 89,50 91,56 86,52 81,56 83,50 78,46 84,46" fill="#fef08a"/>' +
        '<polygon points="14,44 16,50 22,50 17,54 19,60 14,56 9,60 11,54 6,50 12,50" fill="#fef08a"/>' +
        '</svg>';
    }

    // 5. Electric Lightning Storm (cel_lightning) - Thunderous ionic ground strike
    if (id === 'cel_lightning') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="50" cy="50" r="44" fill="#050a1a" stroke="#00f0ff" stroke-width="1.8"/>' +
        '<path d="M56 8 L34 46 L50 46 L38 92 L72 40 L52 40 Z" fill="#00f0ff" stroke="#ffffff" stroke-width="2"/>' +
        '<path d="M53 18 L38 46 L48 46 L40 80 L62 42 L50 42 Z" fill="#ffffff"/>' +
        '<circle cx="38" cy="92" r="6" fill="#00f0ff" opacity="0.6"/>' +
        '<line x1="24" y1="88" x2="52" y2="88" stroke="#00f0ff" stroke-width="2" stroke-linecap="round"/>' +
        '<line x1="28" y1="94" x2="48" y2="94" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/>' +
        '</svg>';
    }

    // 6. Stadium Confetti Burst (cel_confetti) - Party ribbons and stars
    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="50" cy="50" r="44" fill="#0c101c" stroke="#f59e0b" stroke-width="1.8"/>' +
      '<polygon points="50,15 54,38 78,35 58,50 68,75 50,60 32,75 42,50 22,35 46,38" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/>' +
      '<rect x="18" y="24" width="8" height="4" rx="2" fill="#ec4899" transform="rotate(30, 22, 26)"/>' +
      '<rect x="76" y="24" width="8" height="4" rx="2" fill="#00f0ff" transform="rotate(-25, 80, 26)"/>' +
      '<rect x="82" y="66" width="8" height="4" rx="2" fill="#10b981" transform="rotate(45, 86, 68)"/>' +
      '<rect x="14" y="68" width="8" height="4" rx="2" fill="#f97316" transform="rotate(-40, 18, 70)"/>' +
      '<circle cx="34" cy="20" r="3" fill="#38bdf8"/><circle cx="68" cy="78" r="3" fill="#ec4899"/>' +
      '</svg>';
  }

${preservedBoostCode}  // Detailed Ball Trail SVG (5 Dynamic Particle Streams)
  function getDetailedTrailSvg(item, size) {
    var isLg = size === 'large';
    var w = isLg ? 160 : 76;
    var h = isLg ? 80 : 38;
    var id = (typeof item === 'string') ? item : (item && (item.id || item.itemId)) || '';

    // 1. Fire Trail (trail_fire) - Combustion plume
    if (id === 'trail_fire') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<rect width="120" height="60" rx="8" fill="#180702" stroke="#ea580c" stroke-width="1.2"/>' +
        '<path d="M10 30 Q45 10 95 30" stroke="#f97316" stroke-width="9" stroke-linecap="round" opacity="0.4"/>' +
        '<path d="M25 30 Q60 15 100 30" stroke="#facc15" stroke-width="5" stroke-linecap="round" opacity="0.8"/>' +
        '<path d="M50 30 Q80 20 105 30" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>' +
        '<circle cx="106" cy="30" r="6" fill="#f97316"/>' +
        '<circle cx="106" cy="30" r="3" fill="#ffffff"/>' +
        '<circle cx="45" cy="18" r="2" fill="#f97316"/><circle cx="70" cy="42" r="1.8" fill="#facc15"/>' +
        '</svg>';
    }

    // 2. Cryo Ice Trail (trail_ice) - Frosted sub-zero vapor
    if (id === 'trail_ice') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<rect width="120" height="60" rx="8" fill="#031622" stroke="#38bdf8" stroke-width="1.2"/>' +
        '<path d="M10 30 Q50 12 105 30" stroke="#0284c7" stroke-width="8" stroke-linecap="round" opacity="0.5"/>' +
        '<path d="M30 30 Q65 18 105 30" stroke="#7dd3fc" stroke-width="4.5" stroke-linecap="round" opacity="0.85"/>' +
        '<path d="M60 30 Q85 24 105 30" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/>' +
        '<circle cx="106" cy="30" r="5" fill="#38bdf8"/>' +
        '<polygon points="40,16 42,20 46,20 43,23 44,27 40,24 36,27 37,23 34,20 38,20" fill="#bae6fd"/>' +
        '<polygon points="75,38 77,42 81,42 78,45 79,49 75,46 71,49 72,45 69,42 73,42" fill="#bae6fd"/>' +
        '</svg>';
    }

    // 3. Prismatic Rainbow Trail (trail_rainbow) - Full-spectrum light ribbon
    if (id === 'trail_rainbow') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<rect width="120" height="60" rx="8" fill="#090d16" stroke="#c084fc" stroke-width="1.2"/>' +
        '<path d="M10 20 Q55 12 105 20" stroke="#ef4444" stroke-width="2.8" stroke-linecap="round"/>' +
        '<path d="M10 25 Q55 17 105 25" stroke="#f59e0b" stroke-width="2.8" stroke-linecap="round"/>' +
        '<path d="M10 30 Q55 22 105 30" stroke="#10b981" stroke-width="2.8" stroke-linecap="round"/>' +
        '<path d="M10 35 Q55 27 105 35" stroke="#06b6d4" stroke-width="2.8" stroke-linecap="round"/>' +
        '<path d="M10 40 Q55 32 105 40" stroke="#8b5cf6" stroke-width="2.8" stroke-linecap="round"/>' +
        '<circle cx="106" cy="30" r="6" fill="#ffffff"/>' +
        '</svg>';
    }

    // 4. Pulsed Laser Beam (trail_laser) - Coherent optical beam
    if (id === 'trail_laser') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<rect width="120" height="60" rx="8" fill="#04121a" stroke="#00f0ff" stroke-width="1.2"/>' +
        '<line x1="10" y1="30" x2="105" y2="30" stroke="#00f0ff" stroke-width="8" stroke-linecap="round" opacity="0.3"/>' +
        '<line x1="20" y1="30" x2="105" y2="30" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" opacity="0.8"/>' +
        '<line x1="40" y1="30" x2="105" y2="30" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>' +
        '<circle cx="106" cy="30" r="5" fill="#00f0ff"/>' +
        '<circle cx="106" cy="30" r="2.5" fill="#ffffff"/>' +
        '</svg>';
    }

    // 5. Clean Supersonic Vapor (trail_default)
    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="120" height="60" rx="8" fill="#090d16" stroke="#475569" stroke-width="1.2"/>' +
      '<path d="M10 30 Q50 18 105 30" stroke="#00f0ff" stroke-width="5" stroke-linecap="round" opacity="0.4"/>' +
      '<path d="M30 30 Q65 22 105 30" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>' +
      '<circle cx="106" cy="30" r="5" fill="#00f0ff"/>' +
      '<circle cx="106" cy="30" r="2" fill="#ffffff"/>' +
      '</svg>';
  }

  // Detailed Avatar Frame SVG (3 Themed Profile Borders)
  function getDetailedFrameSvg(item, size) {
    var isLg = size === 'large';
    var w = isLg ? 160 : 76;
    var h = w;
    var id = (typeof item === 'string') ? item : (item && (item.id || item.itemId)) || '';

    // 1. Spartan Bronze Frame (frame_bronze) - Heavy forged rivets
    if (id === 'frame_bronze') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<rect x="8" y="8" width="84" height="84" rx="14" fill="#1c1106" stroke="#b45309" stroke-width="6"/>' +
        '<rect x="14" y="14" width="72" height="72" rx="8" stroke="#f59e0b" stroke-width="1.8" fill="none"/>' +
        '<circle cx="16" cy="16" r="3.5" fill="#facc15" stroke="#78350f" stroke-width="1"/>' +
        '<circle cx="84" cy="16" r="3.5" fill="#facc15" stroke="#78350f" stroke-width="1"/>' +
        '<circle cx="16" cy="84" r="3.5" fill="#facc15" stroke="#78350f" stroke-width="1"/>' +
        '<circle cx="84" cy="84" r="3.5" fill="#facc15" stroke="#78350f" stroke-width="1"/>' +
        '</svg>';
    }

    // 2. Radiant Diamond Frame (frame_diamond) - Brilliant faceted crystalline cuts
    if (id === 'frame_diamond') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<rect x="8" y="8" width="84" height="84" rx="14" fill="#041a24" stroke="#00f0ff" stroke-width="5"/>' +
        '<rect x="14" y="14" width="72" height="72" rx="8" stroke="#cffafe" stroke-width="1.8" stroke-dasharray="4 2" fill="none"/>' +
        '<polygon points="16,10 22,16 16,22 10,16" fill="#38bdf8"/>' +
        '<polygon points="84,10 90,16 84,22 78,16" fill="#38bdf8"/>' +
        '<polygon points="16,78 22,84 16,90 10,84" fill="#38bdf8"/>' +
        '<polygon points="84,78 90,84 84,90 78,84" fill="#38bdf8"/>' +
        '<polygon points="50,6 54,10 50,14 46,10" fill="#ffffff"/>' +
        '<polygon points="50,86 54,90 50,94 46,90" fill="#ffffff"/>' +
        '</svg>';
    }

    // 3. Stealth Gunmetal Frame (frame_default)
    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="10" y="10" width="80" height="80" rx="12" fill="#0f172a" stroke="#475569" stroke-width="4.5"/>' +
      '<rect x="16" y="16" width="68" height="68" rx="8" stroke="#64748b" stroke-width="1.4" fill="none"/>' +
      '<rect x="12" y="12" width="6" height="6" fill="#00f0ff"/>' +
      '<rect x="82" y="12" width="6" height="6" fill="#00f0ff"/>' +
      '<rect x="12" y="82" width="6" height="6" fill="#00f0ff"/>' +
      '<rect x="82" y="82" width="6" height="6" fill="#00f0ff"/>' +
      '</svg>';
  }

  // Detailed Tournament Booster Pack SVG (3 Distinct Foil Wrappers)
  function getDetailedPackSvg(item, size) {
    var isLg = size === 'large';
    var w = isLg ? 160 : 76;
    var h = isLg ? 190 : 88;
    var id = (typeof item === 'string') ? item : (item && (item.id || item.packId)) || '';

    if (id.indexOf('hoops') !== -1) {
      // HOOPS All-Star Booster Pack (Amber & Gold Foil)
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
        '<linearGradient id="pHoops" x1="0%" y1="0%" x2="100%" y2="100%">' +
        '<stop offset="0%" stop-color="#ea580c"/>' +
        '<stop offset="60%" stop-color="#c2410c"/>' +
        '<stop offset="100%" stop-color="#451a03"/>' +
        '</linearGradient>' +
        '</defs>' +
        '<rect x="12" y="6" width="76" height="108" rx="7" fill="url(#pHoops)" stroke="#facc15" stroke-width="2.5"/>' +
        '<path d="M12 16L88 16 M12 104L88 104" stroke="#fef08a" stroke-width="2" stroke-dasharray="3 2"/>' +
        '<circle cx="50" cy="56" r="22" fill="#451a03" stroke="#facc15" stroke-width="2"/>' +
        '<circle cx="50" cy="56" r="14" stroke="#ea580c" stroke-width="2"/>' +
        '<text x="50" y="63" font-size="18" text-anchor="middle">🏀</text>' +
        '<rect x="22" y="86" width="56" height="12" rx="3" fill="#180802"/>' +
        '<text x="50" y="95" font-family="Impact, Arial Black" font-size="8" fill="#facc15" text-anchor="middle" letter-spacing="1">ALL-STAR</text>' +
        '</svg>';
    }

    if (id.indexOf('clash') !== -1) {
      // Ultimate Clash Dual Booster Pack (Split Blue & Gold with VS)
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
        '<linearGradient id="pClashA" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0284c7"/><stop offset="100%" stop-color="#0369a1"/></linearGradient>' +
        '<linearGradient id="pClashB" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ea580c"/><stop offset="100%" stop-color="#b45309"/></linearGradient>' +
        '</defs>' +
        '<rect x="12" y="6" width="76" height="108" rx="7" fill="#0f172a" stroke="#facc15" stroke-width="2.5"/>' +
        '<polygon points="12,6 88,6 12,114" fill="url(#pClashA)"/>' +
        '<polygon points="88,6 88,114 12,114" fill="url(#pClashB)"/>' +
        '<line x1="88" y1="6" x2="12" y2="114" stroke="#ffffff" stroke-width="2"/>' +
        '<circle cx="50" cy="56" r="20" fill="#18181b" stroke="#facc15" stroke-width="2"/>' +
        '<text x="50" y="63" font-family="Impact, Arial Black" font-size="14" fill="#facc15" text-anchor="middle">VS</text>' +
        '<rect x="22" y="86" width="56" height="12" rx="3" fill="#000000" opacity="0.85"/>' +
        '<text x="50" y="95" font-family="Impact, Arial Black" font-size="8" fill="#ffffff" text-anchor="middle" letter-spacing="1">CLASH PACK</text>' +
        '</svg>';
    }

    // Default FOOTY Striker Booster Pack (Electric Blue & Silver)
    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
      '<linearGradient id="pFooty" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="#0284c7"/>' +
      '<stop offset="60%" stop-color="#0369a1"/>' +
      '<stop offset="100%" stop-color="#082f49"/>' +
      '</linearGradient>' +
      '</defs>' +
      '<rect x="12" y="6" width="76" height="108" rx="7" fill="url(#pFooty)" stroke="#00f0ff" stroke-width="2.5"/>' +
      '<path d="M12 16L88 16 M12 104L88 104" stroke="#38bdf8" stroke-width="2" stroke-dasharray="3 2"/>' +
      '<circle cx="50" cy="56" r="22" fill="#082f49" stroke="#00f0ff" stroke-width="2"/>' +
      '<text x="50" y="63" font-size="18" text-anchor="middle">⚽</text>' +
      '<rect x="22" y="86" width="56" height="12" rx="3" fill="#031622"/>' +
      '<text x="50" y="95" font-family="Impact, Arial Black" font-size="8" fill="#00f0ff" text-anchor="middle" letter-spacing="1">STRIKER</text>' +
      '</svg>';
  }

  // Detailed Coins Reward Stack SVG (Differentiated by Coin Quantity / Pack)
  function getDetailedCoinsSvg(item, size) {
    var isLg = size === 'large';
    var w = isLg ? 160 : 76;
    var h = w;
    var id = (typeof item === 'string') ? item : (item && (item.id || item.itemId)) || '';

    var stackCount = 5;
    if (id === 'pkg_coins_starter') stackCount = 3;
    else if (id === 'pkg_coins_pro') stackCount = 5;
    else if (id === 'pkg_coins_elite') stackCount = 8;
    else if (id === 'pkg_coins_champion') stackCount = 10;
    else if (id === 'pkg_coins_legend') stackCount = 12;

    var coinsHtml = '';
    var baseY = 74;
    var dy = 6;
    for (var i = 0; i < stackCount; i++) {
      var y = baseY - (i * dy);
      coinsHtml += '<ellipse cx="50" cy="' + y + '" rx="28" ry="11" fill="#ca8a04" stroke="#facc15" stroke-width="2"/>' +
        '<ellipse cx="50" cy="' + (y - 2) + '" rx="27" ry="10" fill="#facc15" stroke="#fef08a" stroke-width="1.4"/>';
    }

    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
      '<radialGradient id="coinGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fef08a" stop-opacity="0.35"/><stop offset="100%" stop-color="#ca8a04" stop-opacity="0"/></radialGradient>' +
      '</defs>' +
      '<circle cx="50" cy="50" r="44" fill="#181302" stroke="#facc15" stroke-width="1.8"/>' +
      '<circle cx="50" cy="50" r="40" fill="url(#coinGlow)"/>' +
      coinsHtml +
      '<text x="50" y="' + (baseY - (stackCount - 1) * dy + 2) + '" font-family="Arial Black" font-size="11" fill="#78350f" text-anchor="middle">★</text>' +
      '</svg>';
  }

  // Detailed Battle Pass VIP Season Pass SVG
  function getDetailedBattlePassSvg(item, size) {
    var isLg = size === 'large';
    var w = isLg ? 180 : 76;
    var h = isLg ? 110 : 48;
    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
      '<linearGradient id="bpCardGrad" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="#854d0e"/><stop offset="50%" stop-color="#facc15"/><stop offset="100%" stop-color="#3b1d03"/>' +
      '</linearGradient>' +
      '</defs>' +
      '<rect x="8" y="10" width="144" height="80" rx="10" fill="#1c1404" stroke="url(#bpCardGrad)" stroke-width="3"/>' +
      '<rect x="14" y="16" width="132" height="68" rx="6" stroke="#fef08a" stroke-width="1" stroke-dasharray="4 2" fill="none"/>' +
      '<rect x="22" y="26" width="32" height="32" rx="4" fill="#ca8a04" stroke="#fef08a" stroke-width="1.5"/>' +
      '<text x="38" y="48" font-size="18" text-anchor="middle">👑</text>' +
      '<text x="62" y="42" font-family="Impact, Arial Black" font-size="15" fill="#fef08a" letter-spacing="1">VIP PASS</text>' +
      '<text x="62" y="56" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#fde047">SEASON 1 PREMIUM</text>' +
      '<rect x="22" y="66" width="116" height="10" rx="3" fill="#3b1d03"/>' +
      '<rect x="24" y="68" width="80" height="6" rx="2" fill="#facc15"/>' +
      '</svg>';
  }

  // Detailed Thematic Bundle Loot Vault SVG (7 Distinct Vault Containers)
  function getDetailedBundleSvg(item, size) {
    var isLg = size === 'large';
    var w = isLg ? 180 : 76;
    var h = isLg ? 140 : 64;
    var id = (typeof item === 'string') ? item : (item && item.id) || '';

    var bColor = '#facc15';
    var trim = '#ca8a04';
    var icon = '🎁';
    var title = 'BUNDLE';

    if (id === 'bundle_footy_starter') {
      bColor = '#0284c7'; trim = '#00f0ff'; icon = '⚽'; title = 'FOOTY PACK';
    } else if (id === 'bundle_hoops_starter') {
      bColor = '#ea580c'; trim = '#facc15'; icon = '🏀'; title = 'HOOPS PACK';
    } else if (id === 'bundle_ocean_arena') {
      bColor = '#06b6d4'; trim = '#67e8f9'; icon = '🌊'; title = 'OCEAN VAULT';
    } else if (id === 'bundle_mars_explorer') {
      bColor = '#dc2626'; trim = '#f97316'; icon = '🚀'; title = 'MARS POD';
    } else if (id === 'bundle_lunar_champ') {
      bColor = '#475569'; trim = '#facc15'; icon = '🌕'; title = 'LUNAR VAULT';
    } else if (id === 'bundle_cyber_neon') {
      bColor = '#7c3aed'; trim = '#d946ef'; icon = '⚡'; title = 'CYBER DECK';
    } else if (id === 'bundle_legendary_champs') {
      bColor = '#854d0e'; trim = '#facc15'; icon = '👑'; title = 'CHAMPIONS';
    }

    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="12" y="16" width="116" height="68" rx="10" fill="#0f172a" stroke="' + trim + '" stroke-width="2.5"/>' +
      '<rect x="20" y="24" width="100" height="52" rx="6" fill="' + bColor + '" opacity="0.18"/>' +
      '<line x1="12" y1="50" x2="128" y2="50" stroke="' + trim + '" stroke-width="2"/>' +
      '<circle cx="70" cy="50" r="16" fill="#0f172a" stroke="' + trim + '" stroke-width="2.2"/>' +
      '<text x="70" y="56" font-size="16" text-anchor="middle">' + icon + '</text>' +
      '<rect x="36" y="80" width="68" height="12" rx="3" fill="#020617"/>' +
      '<text x="70" y="89" font-family="Impact, Arial Black" font-size="7.5" fill="' + trim + '" text-anchor="middle" letter-spacing="1">' + title + '</text>' +
      '</svg>';
  }

  // Universal Item Artwork Dispatcher (Centralized by stable Item ID)
  function renderItemArtwork(itemOrId, size) {
    if (!itemOrId) return '<div class="fvh-item-fallback">📦</div>';
    var id = '';
    var cat = '';

    if (typeof itemOrId === 'string') {
      id = itemOrId;
    } else if (typeof itemOrId === 'object') {
      id = itemOrId.id || itemOrId.itemId || itemOrId.packId || '';
      cat = itemOrId.category || '';
      if (!cat && itemOrId.type === 'coins') cat = 'coins';
      if (!cat && itemOrId.type === 'pack') cat = 'packs';
    }

    // Auto-detect category from item ID if unspecified
    if (!cat && id) {
      if (id.startsWith('boost_')) cat = 'boosts';
      else if (id.startsWith('skin_')) cat = 'skins';
      else if (id.startsWith('ball_')) cat = 'balls';
      else if (id.startsWith('std_') || id.startsWith('arena_')) cat = 'stadiums';
      else if (id.startsWith('cel_')) cat = 'celebrations';
      else if (id.startsWith('trail_')) cat = 'trails';
      else if (id.startsWith('frame_')) cat = 'frames';
      else if (id.startsWith('pack_') || id === 'footy' || id === 'hoops' || id === 'clash') cat = 'packs';
      else if (id.startsWith('bundle_')) cat = 'bundles';
      else if (id.startsWith('battlepass')) cat = 'battlepass';
      else if (id === 'coins' || id.startsWith('pkg_coins_') || id.startsWith('coins_') || id.toLowerCase().indexOf('coin') !== -1) cat = 'coins';
    }

    if (cat === 'boosts') return getDetailedBoostSvg(itemOrId, size);
    if (cat === 'skins') return getDetailedJerseySvg(itemOrId, size);
    if (cat === 'balls') return getDetailedBallSvg(itemOrId, size);
    if (cat === 'stadiums') return getDetailedStadiumSvg(itemOrId, size);
    if (cat === 'celebrations') return getDetailedCelebrationSvg(itemOrId, size);
    if (cat === 'trails') return getDetailedTrailSvg(itemOrId, size);
    if (cat === 'frames') return getDetailedFrameSvg(itemOrId, size);
    if (cat === 'packs') return getDetailedPackSvg(itemOrId, size);
    if (cat === 'bundles') return getDetailedBundleSvg(itemOrId, size);
    if (cat === 'coins') return getDetailedCoinsSvg(itemOrId, size);
    if (cat === 'battlepass') return getDetailedBattlePassSvg(itemOrId, size);

    // High-tech vector fallback glyph (never bare emoji)
    var sz = size === 'large' ? 100 : 54;
    return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<polygon points="40,8 68,22 68,54 40,74 12,54 12,22" fill="#0f172a" stroke="#00f0ff" stroke-width="2"/>' +
      '<polygon points="40,16 60,26 60,50 40,64 20,50 20,26" fill="rgba(0,240,255,0.12)"/>' +
      '<text x="40" y="47" font-size="22" text-anchor="middle">' + ((typeof itemOrId === 'object' && itemOrId.icon) ? itemOrId.icon : '⚡') + '</text>' +
      '</svg>';
  }\n`;

code = code.slice(0, sIdx) + newSectionB + code.slice(eIdx);
fs.writeFileSync('js/redesign.js', code, 'utf8');
console.log('Successfully updated Section B artwork generators in js/redesign.js!');
