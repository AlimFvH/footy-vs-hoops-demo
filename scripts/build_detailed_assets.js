const fs = require('fs');

// High-Fidelity Cyber-Sports Character Avatars
function getFootyAvatarSvg() {
  return '<svg viewBox="0 0 240 290" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<defs>' +
    '<radialGradient id="ftAura" cx="50%" cy="40%" r="58%">' +
    '<stop offset="0%" stop-color="#00f0ff" stop-opacity="0.35"/>' +
    '<stop offset="50%" stop-color="#10b981" stop-opacity="0.15"/>' +
    '<stop offset="100%" stop-color="#080c18" stop-opacity="0"/>' +
    '</radialGradient>' +
    '<linearGradient id="ftBeamL" x1="0%" y1="0%" x2="100%" y2="100%">' +
    '<stop offset="0%" stop-color="#00f0ff" stop-opacity="0.28"/>' +
    '<stop offset="100%" stop-color="#10b981" stop-opacity="0"/>' +
    '</linearGradient>' +
    '<linearGradient id="ftBeamR" x1="100%" y1="0%" x2="0%" y2="100%">' +
    '<stop offset="0%" stop-color="#10b981" stop-opacity="0.22"/>' +
    '<stop offset="100%" stop-color="#00f0ff" stop-opacity="0"/>' +
    '</linearGradient>' +
    '<linearGradient id="ftJerseyBody" x1="0%" y1="0%" x2="100%" y2="100%">' +
    '<stop offset="0%" stop-color="#1a2e4a"/>' +
    '<stop offset="45%" stop-color="#101c2e"/>' +
    '<stop offset="100%" stop-color="#09101b"/>' +
    '</linearGradient>' +
    '<linearGradient id="ftCyberStripe" x1="0%" y1="0%" x2="100%" y2="100%">' +
    '<stop offset="0%" stop-color="#00f0ff"/>' +
    '<stop offset="50%" stop-color="#00d2be"/>' +
    '<stop offset="100%" stop-color="#10b981"/>' +
    '</linearGradient>' +
    '<linearGradient id="ftSkin" x1="0%" y1="0%" x2="100%" y2="100%">' +
    '<stop offset="0%" stop-color="#fcd34d"/>' +
    '<stop offset="50%" stop-color="#f59e0b"/>' +
    '<stop offset="100%" stop-color="#d97706"/>' +
    '</linearGradient>' +
    '<linearGradient id="ftVisor" x1="0%" y1="0%" x2="100%" y2="0%">' +
    '<stop offset="0%" stop-color="#00f0ff" stop-opacity="0.95"/>' +
    '<stop offset="100%" stop-color="#10b981" stop-opacity="0.95"/>' +
    '</linearGradient>' +
    '<linearGradient id="ftCleatGrad" x1="0%" y1="0%" x2="0%" y2="100%">' +
    '<stop offset="0%" stop-color="#24344d"/>' +
    '<stop offset="50%" stop-color="#131e2d"/>' +
    '<stop offset="100%" stop-color="#070b12"/>' +
    '</linearGradient>' +
    '<linearGradient id="ftHair" x1="0%" y1="0%" x2="0%" y2="100%">' +
    '<stop offset="0%" stop-color="#1e293b"/>' +
    '<stop offset="100%" stop-color="#090d16"/>' +
    '</linearGradient>' +
    '<linearGradient id="ftBallGrad" x1="30%" y1="20%" x2="80%" y2="90%">' +
    '<stop offset="0%" stop-color="#ffffff"/>' +
    '<stop offset="55%" stop-color="#cbd5e1"/>' +
    '<stop offset="100%" stop-color="#475569"/>' +
    '</linearGradient>' +
    '<filter id="cyanGlowF" x="-30%" y="-30%" width="160%" height="160%">' +
    '<feGaussianBlur stdDeviation="3.5" result="blur"/>' +
    '<feComposite in="SourceGraphic" in2="blur" operator="over"/>' +
    '</filter>' +
    '</defs>' +
    // Atmosphere
    '<circle cx="120" cy="135" r="115" fill="url(#ftAura)"/>' +
    '<polygon points="35,0 95,0 155,270 65,270" fill="url(#ftBeamL)" opacity="0.35"/>' +
    '<polygon points="175,0 220,0 185,270 130,270" fill="url(#ftBeamR)" opacity="0.25"/>' +
    '<ellipse cx="120" cy="272" rx="76" ry="12" fill="#000000" opacity="0.65"/>' +
    // Left Leg & Cleat
    '<path d="M96 166L84 216L72 248L90 255L102 218L108 166Z" fill="#0d1524"/>' +
    '<path d="M84 216L72 248L80 252L92 220Z" fill="url(#ftCyberStripe)" opacity="0.8"/>' +
    '<path d="M70 248L40 254L38 262L78 262L80 255Z" fill="url(#ftCleatGrad)"/>' +
    '<path d="M40 261L78 261L80 264L38 264Z" fill="#00f0ff" filter="url(#cyanGlowF)"/>' +
    '<circle cx="44" cy="265" r="2" fill="#00f0ff"/>' +
    '<circle cx="56" cy="265" r="2" fill="#00f0ff"/>' +
    '<circle cx="72" cy="265" r="2" fill="#00f0ff"/>' +
    // Right Leg & Cleat
    '<path d="M136 166L148 218L160 248L142 255L132 220L128 166Z" fill="#09101c"/>' +
    '<path d="M148 218L160 248L152 252L140 220Z" fill="url(#ftCyberStripe)" opacity="0.8"/>' +
    '<path d="M142 250L172 254L174 262L134 262L136 255Z" fill="url(#ftCleatGrad)"/>' +
    '<path d="M140 261L174 261L174 264L136 264Z" fill="#10b981" filter="url(#cyanGlowF)"/>' +
    '<circle cx="144" cy="265" r="2" fill="#10b981"/>' +
    '<circle cx="158" cy="265" r="2" fill="#10b981"/>' +
    '<circle cx="170" cy="265" r="2" fill="#10b981"/>' +
    // Athletic Shorts
    '<path d="M82 134L72 178L114 178L120 148L126 178L164 178L154 134Z" fill="#0a1220"/>' +
    '<path d="M72 173L114 173L113 178L72 178Z" fill="url(#ftCyberStripe)"/>' +
    '<path d="M126 173L164 173L164 178L126 178Z" fill="url(#ftCyberStripe)"/>' +
    '<line x1="120" y1="135" x2="120" y2="152" stroke="#00f0ff" stroke-width="2"/>' +
    // Striker Jersey
    '<path d="M80 68L64 138L172 138L156 68L136 64L118 72L100 64Z" fill="url(#ftJerseyBody)"/>' +
    '<path d="M88 70L118 108L148 70L142 66L118 96L94 66Z" fill="url(#ftCyberStripe)" opacity="0.95"/>' +
    '<path d="M68 96L64 138L78 138L80 96Z" fill="#00f0ff" opacity="0.35"/>' +
    '<path d="M168 96L172 138L158 138L156 96Z" fill="#10b981" opacity="0.35"/>' +
    '<rect x="94" y="80" width="10" height="8" rx="2" fill="#00f0ff" filter="url(#cyanGlowF)"/>' +
    '<polygon points="99,82 102,86 96,86" fill="#0a1220"/>' +
    '<text x="118" y="130" font-family="Impact, Arial Black, sans-serif" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2">10</text>' +
    // Arms & Hands
    '<path d="M78 72L46 108L56 116L86 86Z" fill="url(#ftSkin)"/>' +
    '<path d="M46 108L38 116L44 122L54 114Z" fill="#09101c"/>' +
    '<rect x="44" y="108" width="6" height="5" rx="1.5" fill="#00f0ff" filter="url(#cyanGlowF)"/>' +
    '<path d="M156 72L188 108L178 116L148 86Z" fill="url(#ftSkin)"/>' +
    '<rect x="156" y="84" width="16" height="8" rx="2" fill="#00f0ff" opacity="0.85" filter="url(#cyanGlowF)"/>' +
    '<text x="164" y="91" font-family="Arial, sans-serif" font-size="6" font-weight="900" fill="#0a1220" text-anchor="middle">C</text>' +
    '<path d="M188 108L196 116L190 122L180 114Z" fill="#09101c"/>' +
    '<rect x="184" y="108" width="6" height="5" rx="1.5" fill="#10b981" filter="url(#cyanGlowF)"/>' +
    // Head, Visor & Hair
    '<path d="M106 60L106 72L130 72L130 60Z" fill="#d97706"/>' +
    '<circle cx="118" cy="42" r="23" fill="url(#ftSkin)"/>' +
    '<path d="M93 38C93 16 143 14 143 38C136 24 100 24 93 38Z" fill="url(#ftHair)"/>' +
    '<path d="M108 16L126 14L122 26Z" fill="#00f0ff" opacity="0.85" filter="url(#cyanGlowF)"/>' +
    '<path d="M92 34L98 28L106 32Z" fill="#00f0ff" opacity="0.6"/>' +
    '<path d="M100 36Q118 41 136 36L135 46Q118 51 101 46Z" fill="url(#ftVisor)" filter="url(#cyanGlowF)"/>' +
    '<line x1="97" y1="40" x2="101" y2="40" stroke="#cbd5e1" stroke-width="2"/>' +
    '<line x1="135" y1="40" x2="139" y2="40" stroke="#cbd5e1" stroke-width="2"/>' +
    '<circle cx="118" cy="41" r="2.5" fill="#ffffff"/>' +
    '<line x1="114" y1="41" x2="122" y2="41" stroke="#ffffff" stroke-width="1"/>' +
    '<line x1="118" y1="37" x2="118" y2="45" stroke="#ffffff" stroke-width="1"/>' +
    '<path d="M112 54Q118 57 124 54" stroke="#78350f" stroke-width="2.5" stroke-linecap="round"/>' +
    // High-Tech Cyber Football at foot
    '<g transform="translate(36, 220)">' +
    '<circle cx="24" cy="24" r="22" fill="url(#ftBallGrad)"/>' +
    '<circle cx="24" cy="24" r="22" stroke="#00f0ff" stroke-width="2.5" fill="none" filter="url(#cyanGlowF)"/>' +
    '<polygon points="24,12 32,18 29,28 19,28 16,18" fill="#0f172a"/>' +
    '<line x1="24" y1="12" x2="24" y2="3" stroke="#00f0ff" stroke-width="2"/>' +
    '<line x1="32" y1="18" x2="41" y2="13" stroke="#00f0ff" stroke-width="2"/>' +
    '<line x1="29" y1="28" x2="38" y2="36" stroke="#00f0ff" stroke-width="2"/>' +
    '<line x1="19" y1="28" x2="10" y2="36" stroke="#00f0ff" stroke-width="2"/>' +
    '<line x1="16" y1="18" x2="7" y2="13" stroke="#00f0ff" stroke-width="2"/>' +
    '<path d="M-6 16A28 28 0 0 1 38 -2" stroke="#10b981" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.9" filter="url(#cyanGlowF)"/>' +
    '<circle cx="-4" cy="26" r="2" fill="#00f0ff"/>' +
    '<circle cx="48" cy="18" r="1.5" fill="#10b981"/>' +
    '</g>' +
    '</svg>';
}

console.log('Footy SVG length:', getFootyAvatarSvg().length);
