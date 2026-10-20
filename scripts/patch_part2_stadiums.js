const fs = require('fs');

const genPart2Path = 'temp_build/gen_part2.js';
let content = fs.readFileSync(genPart2Path, 'utf8');

// Replacement for getDetailedStadiumSvg
const newStadiumSvgFunction = `  // Detailed Scenic Stadium & Court Artwork (10 Unique Environments)
  function getDetailedStadiumSvg(item, size) {
    var isLg = size === 'large';
    var w = isLg ? 240 : 88;
    var h = isLg ? 150 : 66;
    var id = (item && item.id) || '';

    // 1. Ocean Arena (Coastal Sunset Court)
    if (id === 'std_ocean_sunset') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius:8px;overflow:hidden;">' +
        '<defs>' +
        '<linearGradient id="oceanSky" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#ec4899"/>' +
        '<stop offset="45%" stop-color="#f97316"/>' +
        '<stop offset="100%" stop-color="#fef08a"/>' +
        '</linearGradient>' +
        '<linearGradient id="oceanWater" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#0284c7"/>' +
        '<stop offset="50%" stop-color="#06b6d4"/>' +
        '<stop offset="100%" stop-color="#14b8a6"/>' +
        '</linearGradient>' +
        '<linearGradient id="oceanWood" x1="0%" y1="0%" x2="100%" y2="0%">' +
        '<stop offset="0%" stop-color="#b45309"/>' +
        '<stop offset="50%" stop-color="#d97706"/>' +
        '<stop offset="100%" stop-color="#92400e"/>' +
        '</linearGradient>' +
        '</defs>' +
        '<rect width="160" height="52" fill="url(#oceanSky)"/>' +
        '<circle cx="80" cy="50" r="18" fill="#fef08a" opacity="0.95"/>' +
        '<rect y="50" width="160" height="22" fill="url(#oceanWater)"/>' +
        '<path d="M0 56 Q20 54 40 56 T80 56 T120 56 T160 56" stroke="#ffffff" stroke-width="1.2" opacity="0.6"/>' +
        '<path d="M0 64 Q20 62 40 64 T80 64 T120 64 T160 64" stroke="#ffffff" stroke-width="1.4" opacity="0.8"/>' +
        '<path d="M12 70 Q18 45 22 28 Q24 20 26 12" stroke="#1c1917" stroke-width="3" fill="none"/>' +
        '<path d="M26 12 Q14 10 6 18 M26 12 Q20 4 10 6 M26 12 Q34 6 42 12 M26 12 Q36 16 38 24 M26 12 Q24 20 20 26" stroke="#1c1917" stroke-width="2" fill="none"/>' +
        '<path d="M148 70 Q142 45 138 28 Q136 20 134 12" stroke="#1c1917" stroke-width="3" fill="none"/>' +
        '<path d="M134 12 Q146 10 154 18 M134 12 Q140 4 150 6 M134 12 Q126 6 118 12 M134 12 Q124 16 122 24" stroke="#1c1917" stroke-width="2" fill="none"/>' +
        '<polygon points="0,72 160,72 160,100 0,100" fill="url(#oceanWood)"/>' +
        '<polygon points="30,76 130,76 142,98 18,98" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.9"/>' +
        '<ellipse cx="80" cy="87" rx="14" ry="7" fill="none" stroke="#ffffff" stroke-width="1.5"/>' +
        '<line x1="80" y1="76" x2="80" y2="98" stroke="#ffffff" stroke-width="1.5"/>' +
        '</svg>';
    }

    // 2. Redwood Forest Arena
    if (id === 'std_forest_redwood') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius:8px;overflow:hidden;">' +
        '<defs>' +
        '<linearGradient id="forestSky" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#0f2b1d"/>' +
        '<stop offset="50%" stop-color="#164e32"/>' +
        '<stop offset="100%" stop-color="#86efac"/>' +
        '</linearGradient>' +
        '<linearGradient id="forestTurf" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#15803d"/>' +
        '<stop offset="100%" stop-color="#14532d"/>' +
        '</linearGradient>' +
        '</defs>' +
        '<rect width="160" height="58" fill="url(#forestSky)"/>' +
        '<polygon points="40,0 60,0 85,58 55,58" fill="#fef08a" opacity="0.15"/>' +
        '<polygon points="100,0 120,0 145,58 115,58" fill="#fef08a" opacity="0.12"/>' +
        '<polygon points="20,18 28,38 12,38" fill="#064e3b" opacity="0.7"/>' +
        '<polygon points="45,12 55,36 35,36" fill="#064e3b" opacity="0.7"/>' +
        '<polygon points="115,14 125,36 105,36" fill="#064e3b" opacity="0.7"/>' +
        '<polygon points="140,20 148,40 132,40" fill="#064e3b" opacity="0.7"/>' +
        '<polygon points="10,4 22,50 -2,50" fill="#022c22"/>' +
        '<polygon points="28,10 38,54 18,54" fill="#022c22"/>' +
        '<polygon points="150,6 162,50 138,50" fill="#022c22"/>' +
        '<polygon points="132,12 142,54 122,54" fill="#022c22"/>' +
        '<rect y="48" width="160" height="12" fill="#ffffff" opacity="0.25"/>' +
        '<polygon points="0,58 160,58 160,100 0,100" fill="url(#forestTurf)"/>' +
        '<polygon points="24,62 136,62 148,96 12,96" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.85"/>' +
        '<line x1="80" y1="62" x2="80" y2="96" stroke="#ffffff" stroke-width="1.5"/>' +
        '<ellipse cx="80" cy="79" rx="16" ry="7" fill="none" stroke="#ffffff" stroke-width="1.5"/>' +
        '</svg>';
    }

    // 3. Space Orbit Arena (Orbital Colosseum)
    if (id === 'std_space_orbit') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius:8px;overflow:hidden;">' +
        '<defs>' +
        '<linearGradient id="spaceSky" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#030712"/>' +
        '<stop offset="50%" stop-color="#0f172a"/>' +
        '<stop offset="100%" stop-color="#1e1b4b"/>' +
        '</linearGradient>' +
        '<linearGradient id="spaceDeck" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#0f172a"/>' +
        '<stop offset="100%" stop-color="#020617"/>' +
        '</linearGradient>' +
        '</defs>' +
        '<rect width="160" height="58" fill="url(#spaceSky)"/>' +
        // Stars
        '<circle cx="20" cy="12" r="1" fill="#ffffff" opacity="0.9"/>' +
        '<circle cx="55" cy="8" r="0.8" fill="#00f0ff" opacity="0.8"/>' +
        '<circle cx="85" cy="18" r="1.2" fill="#ffffff" opacity="0.9"/>' +
        '<circle cx="125" cy="10" r="0.8" fill="#facc15" opacity="0.8"/>' +
        '<circle cx="145" cy="22" r="1" fill="#ffffff" opacity="0.9"/>' +
        // Earth horizon glow
        '<circle cx="80" cy="120" r="85" fill="#0284c7" opacity="0.35"/>' +
        '<circle cx="80" cy="120" r="82" fill="#0369a1" opacity="0.6"/>' +
        '<path d="M30 46 Q80 38 130 46" stroke="#38bdf8" stroke-width="2" fill="none" opacity="0.9"/>' +
        // Station solar trusses
        '<rect x="8" y="22" width="28" height="12" fill="#0369a1" stroke="#00f0ff" stroke-width="1"/>' +
        '<rect x="124" y="22" width="28" height="12" fill="#0369a1" stroke="#00f0ff" stroke-width="1"/>' +
        '<line x1="0" y1="28" x2="160" y2="28" stroke="#00f0ff" stroke-width="1.2" opacity="0.5"/>' +
        // High-tech Titanium Deck
        '<polygon points="0,58 160,58 160,100 0,100" fill="url(#spaceDeck)"/>' +
        '<polygon points="26,62 134,62 146,96 14,96" fill="none" stroke="#00f0ff" stroke-width="1.8"/>' +
        '<line x1="80" y1="62" x2="80" y2="96" stroke="#00f0ff" stroke-width="1.6"/>' +
        '<ellipse cx="80" cy="79" rx="18" ry="8" fill="none" stroke="#f43f5e" stroke-width="1.8"/>' +
        '<circle cx="80" cy="79" r="2.5" fill="#00f0ff"/>' +
        '</svg>';
    }

    // 4. Mars Bio-Dome Arena
    if (id === 'std_mars_dome') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius:8px;overflow:hidden;">' +
        '<defs>' +
        '<linearGradient id="marsSky" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#450a0a"/>' +
        '<stop offset="60%" stop-color="#991b1b"/>' +
        '<stop offset="100%" stop-color="#f97316"/>' +
        '</linearGradient>' +
        '<linearGradient id="marsGround" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#9a3412"/>' +
        '<stop offset="100%" stop-color="#7c2d12"/>' +
        '</linearGradient>' +
        '</defs>' +
        '<rect width="160" height="58" fill="url(#marsSky)"/>' +
        // Geodesic Dome Arches
        '<path d="M10 58 Q80 6 150 58" stroke="#fdba74" stroke-width="2" fill="none" opacity="0.6"/>' +
        '<path d="M30 58 Q80 18 130 58" stroke="#fdba74" stroke-width="1.5" fill="none" opacity="0.4"/>' +
        '<line x1="80" y1="12" x2="80" y2="58" stroke="#fdba74" stroke-width="1" opacity="0.4"/>' +
        '<line x1="45" y1="24" x2="45" y2="58" stroke="#fdba74" stroke-width="1" opacity="0.3"/>' +
        '<line x1="115" y1="24" x2="115" y2="58" stroke="#fdba74" stroke-width="1" opacity="0.3"/>' +
        // Martian Red Dunes
        '<path d="M0 48 Q40 40 85 48 T160 44 L160 58 L0 58 Z" fill="#7c2d12" opacity="0.8"/>' +
        // Red Basalt Court
        '<polygon points="0,58 160,58 160,100 0,100" fill="url(#marsGround)"/>' +
        '<polygon points="24,62 136,62 148,96 12,96" fill="none" stroke="#ffedd5" stroke-width="1.6"/>' +
        '<line x1="80" y1="62" x2="80" y2="96" stroke="#ffedd5" stroke-width="1.5"/>' +
        '<ellipse cx="80" cy="79" rx="16" ry="7" fill="none" stroke="#f97316" stroke-width="1.8"/>' +
        '</svg>';
    }

    // 5. Apollo Lunar Arena
    if (id === 'std_moon_crater') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius:8px;overflow:hidden;">' +
        '<defs>' +
        '<linearGradient id="moonFloor" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#475569"/>' +
        '<stop offset="100%" stop-color="#1e293b"/>' +
        '</linearGradient>' +
        '</defs>' +
        '<rect width="160" height="58" fill="#050811"/>' +
        // Earthrise
        '<circle cx="120" cy="22" r="14" fill="#0284c7"/>' +
        '<circle cx="118" cy="20" r="13" fill="#38bdf8" opacity="0.4"/>' +
        '<path d="M112 18 Q120 14 126 22 Q122 28 116 26 Z" fill="#ffffff" opacity="0.8"/>' +
        // Stadium Floodlights
        '<polygon points="20,12 24,12 26,58 18,58" fill="#94a3b8"/>' +
        '<circle cx="22" cy="12" r="3" fill="#facc15"/>' +
        '<polygon points="136,12 140,12 142,58 134,58" fill="#94a3b8"/>' +
        '<circle cx="138" cy="12" r="3" fill="#facc15"/>' +
        // Lunar Crater Ridges
        '<path d="M0 50 Q30 42 70 50 T160 48 L160 58 L0 58 Z" fill="#334155"/>' +
        // Regolith Court
        '<polygon points="0,58 160,58 160,100 0,100" fill="url(#moonFloor)"/>' +
        '<polygon points="26,62 134,62 146,96 14,96" fill="none" stroke="#facc15" stroke-width="1.6"/>' +
        '<line x1="80" y1="62" x2="80" y2="96" stroke="#facc15" stroke-width="1.5"/>' +
        '<ellipse cx="80" cy="79" rx="16" ry="7" fill="none" stroke="#ffffff" stroke-width="1.5"/>' +
        '</svg>';
    }

    // 6. Abyssal Ocean Dome
    if (id === 'std_underwater_dome') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius:8px;overflow:hidden;">' +
        '<defs>' +
        '<linearGradient id="abyssWater" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#082f49"/>' +
        '<stop offset="60%" stop-color="#0e7490"/>' +
        '<stop offset="100%" stop-color="#06b6d4"/>' +
        '</linearGradient>' +
        '<linearGradient id="aquaFloor" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#0f766e"/>' +
        '<stop offset="100%" stop-color="#042f2e"/>' +
        '</linearGradient>' +
        '</defs>' +
        '<rect width="160" height="58" fill="url(#abyssWater)"/>' +
        // Dome Arch
        '<path d="M8 58 Q80 8 152 58" stroke="#67e8f9" stroke-width="2.5" fill="none" opacity="0.7"/>' +
        '<path d="M25 58 Q80 20 135 58" stroke="#67e8f9" stroke-width="1.5" fill="none" opacity="0.4"/>' +
        // Bioluminescent creatures
        '<ellipse cx="40" cy="25" rx="6" ry="3" fill="#a5f3fc" opacity="0.8"/>' +
        '<path d="M46 25 Q52 23 56 26" stroke="#a5f3fc" stroke-width="1" fill="none"/>' +
        '<ellipse cx="115" cy="32" rx="5" ry="2.5" fill="#a5f3fc" opacity="0.7"/>' +
        // Water caustics
        '<path d="M10 40 Q40 32 80 40 T150 36" stroke="#cffafe" stroke-width="1" opacity="0.4" fill="none"/>' +
        // Aquamarine Court
        '<polygon points="0,58 160,58 160,100 0,100" fill="url(#aquaFloor)"/>' +
        '<polygon points="26,62 134,62 146,96 14,96" fill="none" stroke="#22d3ee" stroke-width="1.8"/>' +
        '<line x1="80" y1="62" x2="80" y2="96" stroke="#22d3ee" stroke-width="1.5"/>' +
        '<ellipse cx="80" cy="79" rx="16" ry="7" fill="none" stroke="#5eead4" stroke-width="1.8"/>' +
        '</svg>';
    }

    // 7. Neo Tokyo Cyberpunk Megacity
    if (id === 'std_cyber_megacity') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius:8px;overflow:hidden;">' +
        '<defs>' +
        '<linearGradient id="cyberSky" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#180828"/>' +
        '<stop offset="60%" stop-color="#3b0764"/>' +
        '<stop offset="100%" stop-color="#581c87"/>' +
        '</linearGradient>' +
        '<linearGradient id="cyberPitch" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#1e1b4b"/>' +
        '<stop offset="100%" stop-color="#090514"/>' +
        '</linearGradient>' +
        '</defs>' +
        '<rect width="160" height="58" fill="url(#cyberSky)"/>' +
        // Skyscrapers with glowing neon windows
        '<rect x="12" y="16" width="22" height="42" fill="#0f172a" stroke="#d946ef" stroke-width="1"/>' +
        '<rect x="16" y="22" width="4" height="6" fill="#f43f5e"/>' +
        '<rect x="24" y="22" width="4" height="6" fill="#00f0ff"/>' +
        '<rect x="16" y="34" width="4" height="6" fill="#00f0ff"/>' +
        '<rect x="24" y="34" width="4" height="6" fill="#f43f5e"/>' +
        '<rect x="42" y="8" width="28" height="50" fill="#090d16" stroke="#00f0ff" stroke-width="1"/>' +
        '<rect x="48" y="14" width="16" height="4" fill="#00f0ff" opacity="0.9"/>' +
        '<rect x="94" y="12" width="26" height="46" fill="#090d16" stroke="#f43f5e" stroke-width="1"/>' +
        '<rect x="126" y="20" width="22" height="38" fill="#0f172a" stroke="#a855f7" stroke-width="1"/>' +
        // Neon traffic light streaks
        '<line x1="0" y1="52" x2="160" y2="52" stroke="#00f0ff" stroke-width="1.5" opacity="0.7"/>' +
        '<line x1="0" y1="55" x2="160" y2="55" stroke="#f43f5e" stroke-width="1.2" opacity="0.8"/>' +
        // Cyber Court
        '<polygon points="0,58 160,58 160,100 0,100" fill="url(#cyberPitch)"/>' +
        '<polygon points="26,62 134,62 146,96 14,96" fill="none" stroke="#00f0ff" stroke-width="1.8"/>' +
        '<line x1="80" y1="62" x2="80" y2="96" stroke="#00f0ff" stroke-width="1.5"/>' +
        '<ellipse cx="80" cy="79" rx="16" ry="7" fill="none" stroke="#d946ef" stroke-width="2"/>' +
        '</svg>';
    }

    // 8. Magma Caldera Volcano
    if (id === 'std_volcano_caldera') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius:8px;overflow:hidden;">' +
        '<defs>' +
        '<linearGradient id="volcanoSky" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#18181b"/>' +
        '<stop offset="50%" stop-color="#450a0a"/>' +
        '<stop offset="100%" stop-color="#7f1d1d"/>' +
        '</linearGradient>' +
        '<linearGradient id="lavaFloor" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#27272a"/>' +
        '<stop offset="100%" stop-color="#09090b"/>' +
        '</linearGradient>' +
        '</defs>' +
        '<rect width="160" height="58" fill="url(#volcanoSky)"/>' +
        // Distant smoking volcano peaks
        '<polygon points="40,24 65,58 15,58" fill="#27272a"/>' +
        '<polygon points="120,20 150,58 90,58" fill="#27272a"/>' +
        // Molten lava streams
        '<path d="M40 28 Q48 40 52 58" stroke="#f97316" stroke-width="2.5" fill="none"/>' +
        '<path d="M120 25 Q115 38 118 58" stroke="#ef4444" stroke-width="2" fill="none"/>' +
        // Flying sparks / embers
        '<circle cx="35" cy="18" r="1.2" fill="#fbbf24"/>' +
        '<circle cx="75" cy="28" r="1.5" fill="#f97316"/>' +
        '<circle cx="125" cy="14" r="1.2" fill="#fbbf24"/>' +
        // Obsidian Rock Pitch
        '<polygon points="0,58 160,58 160,100 0,100" fill="url(#lavaFloor)"/>' +
        '<polygon points="26,62 134,62 146,96 14,96" fill="none" stroke="#f97316" stroke-width="1.8"/>' +
        '<line x1="80" y1="62" x2="80" y2="96" stroke="#f97316" stroke-width="1.5"/>' +
        '<ellipse cx="80" cy="79" rx="16" ry="7" fill="none" stroke="#ef4444" stroke-width="2"/>' +
        '<circle cx="80" cy="79" r="2.5" fill="#fbbf24"/>' +
        '</svg>';
    }

    // 9. Aetheria Sky Islands
    if (id === 'std_floating_islands') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius:8px;overflow:hidden;">' +
        '<defs>' +
        '<linearGradient id="skyHeaven" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#0284c7"/>' +
        '<stop offset="50%" stop-color="#38bdf8"/>' +
        '<stop offset="100%" stop-color="#bae6fd"/>' +
        '</linearGradient>' +
        '<linearGradient id="marbleFloor" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#e2e8f0"/>' +
        '<stop offset="100%" stop-color="#cbd5e1"/>' +
        '</linearGradient>' +
        '</defs>' +
        '<rect width="160" height="58" fill="url(#skyHeaven)"/>' +
        // Floating cloud puffs
        '<ellipse cx="30" cy="46" rx="28" ry="10" fill="#ffffff" opacity="0.8"/>' +
        '<ellipse cx="130" cy="48" rx="32" ry="12" fill="#ffffff" opacity="0.85"/>' +
        // Floating rock island with waterfall
        '<polygon points="60,20 100,20 90,44 70,44" fill="#78716c"/>' +
        '<line x1="80" y1="26" x2="80" y2="52" stroke="#e0f2fe" stroke-width="2" opacity="0.9"/>' +
        // Sky palace spire
        '<polygon points="78,8 82,8 84,20 76,20" fill="#facc15"/>' +
        // Sky Marble Court
        '<polygon points="0,58 160,58 160,100 0,100" fill="url(#marbleFloor)"/>' +
        '<polygon points="26,62 134,62 146,96 14,96" fill="none" stroke="#0284c7" stroke-width="1.8"/>' +
        '<line x1="80" y1="62" x2="80" y2="96" stroke="#0284c7" stroke-width="1.5"/>' +
        '<ellipse cx="80" cy="79" rx="16" ry="7" fill="none" stroke="#eab308" stroke-width="1.8"/>' +
        '</svg>';
    }

    // 10. Prismatic Crystal Cave
    if (id === 'std_crystal_cavern') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius:8px;overflow:hidden;">' +
        '<defs>' +
        '<linearGradient id="caveCeiling" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#0f0728"/>' +
        '<stop offset="50%" stop-color="#1e1b4b"/>' +
        '<stop offset="100%" stop-color="#312e81"/>' +
        '</linearGradient>' +
        '<linearGradient id="crystalFloor" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#431407"/>' +
        '<stop offset="50%" stop-color="#2e1065"/>' +
        '<stop offset="100%" stop-color="#170d38"/>' +
        '</linearGradient>' +
        '</defs>' +
        '<rect width="160" height="58" fill="url(#caveCeiling)"/>' +
        // Crystal stalactites from ceiling
        '<polygon points="20,0 26,0 23,24" fill="#a855f7"/>' +
        '<polygon points="45,0 52,0 48,32" fill="#06b6d4"/>' +
        '<polygon points="80,0 88,0 84,20" fill="#ec4899"/>' +
        '<polygon points="115,0 123,0 119,30" fill="#a855f7"/>' +
        '<polygon points="140,0 148,0 144,22" fill="#06b6d4"/>' +
        // Crystal clusters rising from edges
        '<polygon points="4,58 12,38 18,58" fill="#c084fc"/>' +
        '<polygon points="144,58 150,36 156,58" fill="#38bdf8"/>' +
        // Glowing Crystal Floor
        '<polygon points="0,58 160,58 160,100 0,100" fill="url(#crystalFloor)"/>' +
        '<polygon points="26,62 134,62 146,96 14,96" fill="none" stroke="#c084fc" stroke-width="1.8"/>' +
        '<line x1="80" y1="62" x2="80" y2="96" stroke="#c084fc" stroke-width="1.5"/>' +
        '<ellipse cx="80" cy="79" rx="16" ry="7" fill="none" stroke="#22d3ee" stroke-width="1.8"/>' +
        '</svg>';
    }

    // Classic Football Pitch fallback
    if (id.indexOf('footy_classic') !== -1 || id.indexOf('turf') !== -1) {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius:8px;overflow:hidden;">' +
        '<rect width="160" height="100" fill="#15803d"/>' +
        '<rect x="0" y="0" width="160" height="20" fill="#166534"/>' +
        '<rect x="0" y="40" width="160" height="20" fill="#166534"/>' +
        '<rect x="0" y="80" width="160" height="20" fill="#166534"/>' +
        '<rect x="15" y="10" width="130" height="80" fill="none" stroke="#ffffff" stroke-width="2"/>' +
        '<line x1="80" y1="10" x2="80" y2="90" stroke="#ffffff" stroke-width="2"/>' +
        '<circle cx="80" cy="50" r="18" fill="none" stroke="#ffffff" stroke-width="2"/>' +
        '</svg>';
    }

    // Default High-Tech Arena Frame
    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius:8px;overflow:hidden;">' +
      '<rect width="160" height="100" fill="#0f172a"/>' +
      '<polygon points="20,15 140,15 152,85 8,85" fill="#1e293b" stroke="#00f0ff" stroke-width="1.5"/>' +
      '<ellipse cx="80" cy="50" rx="25" ry="14" fill="none" stroke="#f97316" stroke-width="1.8"/>' +
      '<line x1="80" y1="15" x2="80" y2="85" stroke="#00f0ff" stroke-width="1.5"/>' +
      '</svg>';
  }`;

// Find start and end of getDetailedStadiumSvg in gen_part2.js
const startMarker = '  // Detailed Scenic Stadium & Court Artwork';
const endMarker = '  // Detailed Celebration Burst SVG';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not locate markers in gen_part2.js');
  process.exit(1);
}

const newContent = content.substring(0, startIndex) + newStadiumSvgFunction + '\n\n' + content.substring(endIndex);
fs.writeFileSync(genPart2Path, newContent);
console.log('Successfully updated gen_part2.js with all 10 stadiums.');
