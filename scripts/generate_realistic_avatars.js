// Generate ultra-realistic, sharp, high-definition character SVGs for FOOTY and HOOPS
// with vibrant, prominent kits/uniforms, athletic anatomy, authentic numbers, and 3D lighting.

function getRealisticFootyAvatarSvg() {
  return '<svg viewBox="0 0 240 290" fill="none" xmlns="http://www.w3.org/2000/svg" class="fvh-hero-avatar-svg">' +
    '<defs>' +
    // Dynamic Stadium Atmosphere & Volumetric Floodlights
    '<radialGradient id="footyAura" cx="50%" cy="42%" r="58%">' +
    '<stop offset="0%" stop-color="#00f0ff" stop-opacity="0.48"/>' +
    '<stop offset="35%" stop-color="#0284c7" stop-opacity="0.25"/>' +
    '<stop offset="70%" stop-color="#10b981" stop-opacity="0.10"/>' +
    '<stop offset="100%" stop-color="#040711" stop-opacity="0"/>' +
    '</radialGradient>' +
    '<linearGradient id="footyBeam" x1="0%" y1="0%" x2="100%" y2="100%">' +
    '<stop offset="0%" stop-color="#00f0ff" stop-opacity="0.32"/>' +
    '<stop offset="50%" stop-color="#38bdf8" stop-opacity="0.14"/>' +
    '<stop offset="100%" stop-color="#10b981" stop-opacity="0"/>' +
    '</linearGradient>' +

    // Vibrant High-Definition Pro Football Jersey (#10 Striker Kit)
    '<linearGradient id="footyJersey" x1="0%" y1="0%" x2="100%" y2="100%">' +
    '<stop offset="0%" stop-color="#00e5ff"/>' +
    '<stop offset="30%" stop-color="#0284c7"/>' +
    '<stop offset="70%" stop-color="#0369a1"/>' +
    '<stop offset="100%" stop-color="#0c4a6e"/>' +
    '</linearGradient>' +
    '<linearGradient id="footyJerseyDark" x1="0%" y1="0%" x2="0%" y2="100%">' +
    '<stop offset="0%" stop-color="#0369a1"/>' +
    '<stop offset="100%" stop-color="#082f49"/>' +
    '</linearGradient>' +
    '<linearGradient id="footyChevron" x1="0%" y1="0%" x2="100%" y2="0%">' +
    '<stop offset="0%" stop-color="#38bdf8"/>' +
    '<stop offset="50%" stop-color="#00f0ff"/>' +
    '<stop offset="100%" stop-color="#22d3ee"/>' +
    '</linearGradient>' +
    '<linearGradient id="footyGold" x1="0%" y1="0%" x2="100%" y2="100%">' +
    '<stop offset="0%" stop-color="#fde047"/>' +
    '<stop offset="50%" stop-color="#eab308"/>' +
    '<stop offset="100%" stop-color="#ca8a04"/>' +
    '</linearGradient>' +

    // Athletic Anatomical Skin & Muscle Tones
    '<linearGradient id="footySkin" x1="25%" y1="0%" x2="85%" y2="100%">' +
    '<stop offset="0%" stop-color="#fed7aa"/>' +
    '<stop offset="40%" stop-color="#fba876"/>' +
    '<stop offset="80%" stop-color="#d47942"/>' +
    '<stop offset="100%" stop-color="#b45309"/>' +
    '</linearGradient>' +
    '<linearGradient id="footySkinShadow" x1="0%" y1="0%" x2="0%" y2="100%">' +
    '<stop offset="0%" stop-color="#d47942"/>' +
    '<stop offset="100%" stop-color="#92400e"/>' +
    '</linearGradient>' +

    // Glowing Cyber-Visor
    '<linearGradient id="footyVisor" x1="0%" y1="0%" x2="100%" y2="0%">' +
    '<stop offset="0%" stop-color="#00f0ff" stop-opacity="0.95"/>' +
    '<stop offset="40%" stop-color="#67e8f9" stop-opacity="0.98"/>' +
    '<stop offset="70%" stop-color="#38bdf8" stop-opacity="0.95"/>' +
    '<stop offset="100%" stop-color="#06b6d4" stop-opacity="0.95"/>' +
    '</linearGradient>' +

    // Pro Football Cleats & Studs
    '<linearGradient id="footyCleat" x1="0%" y1="0%" x2="0%" y2="100%">' +
    '<stop offset="0%" stop-color="#0284c7"/>' +
    '<stop offset="50%" stop-color="#0f172a"/>' +
    '<stop offset="100%" stop-color="#020617"/>' +
    '</linearGradient>' +
    '<linearGradient id="footyStuds" x1="0%" y1="0%" x2="0%" y2="100%">' +
    '<stop offset="0%" stop-color="#00f0ff"/>' +
    '<stop offset="100%" stop-color="#0284c7"/>' +
    '</linearGradient>' +

    // Realistic 3D Match Football Shading
    '<radialGradient id="ballSpherical" cx="36%" cy="32%" r="65%">' +
    '<stop offset="0%" stop-color="#ffffff"/>' +
    '<stop offset="30%" stop-color="#f1f5f9"/>' +
    '<stop offset="65%" stop-color="#94a3b8"/>' +
    '<stop offset="88%" stop-color="#334155"/>' +
    '<stop offset="100%" stop-color="#0f172a"/>' +
    '</radialGradient>' +

    // Filters & Micro-Weave Pattern
    '<filter id="cyanGlow" x="-40%" y="-40%" width="180%" height="180%">' +
    '<feGaussianBlur stdDeviation="3.2" result="blur"/>' +
    '<feComposite in="SourceGraphic" in2="blur" operator="over"/>' +
    '</filter>' +
    '<filter id="goldGlow" x="-30%" y="-30%" width="160%" height="160%">' +
    '<feGaussianBlur stdDeviation="2.5" result="blur"/>' +
    '<feComposite in="SourceGraphic" in2="blur" operator="over"/>' +
    '</filter>' +
    '<filter id="ballGlow" x="-40%" y="-40%" width="180%" height="180%">' +
    '<feGaussianBlur stdDeviation="4" result="blur"/>' +
    '<feComposite in="SourceGraphic" in2="blur" operator="over"/>' +
    '</filter>' +
    '<filter id="sharpShadow" x="-20%" y="-20%" width="140%" height="140%">' +
    '<feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.6"/>' +
    '</filter>' +

    // Micro-Hex Athletic Jersey Weave
    '<pattern id="hexMesh" width="8" height="8" patternUnits="userSpaceOnUse">' +
    '<path d="M4 0L8 2.3V6.9L4 9.2L0 6.9V2.3Z" fill="none" stroke="#38bdf8" stroke-width="0.45" opacity="0.25"/>' +
    '</pattern>' +
    '</defs>' +

    // 1. Volumetric Arena Lighting & Contact Shadows
    '<circle cx="120" cy="138" r="116" fill="url(#footyAura)"/>' +
    '<polygon points="25,0 85,0 155,275 55,275" fill="url(#footyBeam)" opacity="0.4"/>' +
    '<polygon points="175,0 225,0 185,275 130,275" fill="url(#footyBeam)" opacity="0.3"/>' +
    '<ellipse cx="120" cy="274" rx="78" ry="12" fill="#000000" opacity="0.75"/>' +

    // 2. Muscular Athletic Legs with Pro Socks & Studded Cleats
    // Left Leg (Viewer Right)
    '<g>' +
    '<path d="M135 170L148 214L162 254L140 260L130 220L124 170Z" fill="url(#footySkinShadow)"/>' +
    '<path d="M134 195L148 218L160 254L141 259L130 224L128 195Z" fill="url(#footyJerseyDark)"/>' +
    '<path d="M132 198L144 200L142 203L130 201Z" fill="#ffffff" opacity="0.9"/>' +
    '<path d="M133 205L145 207L143 210L131 208Z" fill="#ffffff" opacity="0.9"/>' +
    '<line x1="145" y1="214" x2="136" y2="252" stroke="#00f0ff" stroke-width="2.2" opacity="0.9"/>' +
    '<path d="M138 254L174 257L176 266L135 267L133 258Z" fill="url(#footyCleat)"/>' +
    '<path d="M144 257L170 259L164 262L142 260Z" fill="#00f0ff" filter="url(#cyanGlow)"/>' +
    '<polygon points="144,267 148,267 146,271" fill="url(#footyStuds)"/>' +
    '<polygon points="156,267 160,267 158,271" fill="url(#footyStuds)"/>' +
    '<polygon points="168,266 172,266 170,270" fill="url(#footyStuds)"/>' +
    '</g>' +

    // Right Leg (Viewer Left)
    '<g>' +
    '<path d="M98 170L84 214L70 254L92 260L102 220L108 170Z" fill="url(#footySkinShadow)"/>' +
    '<path d="M98 195L84 218L72 254L91 259L102 224L104 195Z" fill="url(#footyJerseyDark)"/>' +
    '<path d="M98 198L86 200L88 203L100 201Z" fill="#ffffff" opacity="0.9"/>' +
    '<path d="M97 205L85 207L87 210L99 208Z" fill="#ffffff" opacity="0.9"/>' +
    '<line x1="93" y1="214" x2="82" y2="252" stroke="#00f0ff" stroke-width="2.2" opacity="0.9"/>' +
    '<path d="M68 254L38 258L36 267L77 267L79 258Z" fill="url(#footyCleat)"/>' +
    '<path d="M42 258L72 258L68 262L44 261Z" fill="#00f0ff" filter="url(#cyanGlow)"/>' +
    '<polygon points="42,267 46,267 44,271" fill="url(#footyStuds)"/>' +
    '<polygon points="54,267 58,267 56,271" fill="url(#footyStuds)"/>' +
    '<polygon points="68,267 72,267 70,271" fill="url(#footyStuds)"/>' +
    '</g>' +

    // 3. Vibrant Pro Soccer Shorts with Contrast Trim
    '<g>' +
    '<path d="M80 134L68 180L115 180L120 148L125 180L164 180L152 134Z" fill="url(#footyJerseyDark)"/>' +
    '<path d="M69 138L68 179L76 179L80 138Z" fill="url(#footyChevron)"/>' +
    '<path d="M163 138L164 179L156 179L152 138Z" fill="url(#footyChevron)"/>' +
    '<path d="M68 176L115 176L114 180L68 180Z" fill="#ffffff" opacity="0.95"/>' +
    '<path d="M125 176L164 176L164 180L125 180Z" fill="#ffffff" opacity="0.95"/>' +
    '<polygon points="78,162 84,162 82,170 78,168" fill="url(#footyGold)"/>' +
    '<line x1="120" y1="136" x2="120" y2="150" stroke="#00f0ff" stroke-width="2" opacity="0.8"/>' +
    '</g>' +

    // 4. High-Definition Football Jersey (Torso)
    '<g>' +
    '<path d="M78 68L62 138L170 138L154 68L136 63L116 73L96 63Z" fill="url(#footyJersey)" filter="url(#sharpShadow)"/>' +
    '<path d="M78 68L62 138L170 138L154 68L136 63L116 73L96 63Z" fill="url(#hexMesh)"/>' +
    '<path d="M84 69L116 112L148 69L138 65L116 97L94 65Z" fill="url(#footyChevron)" filter="url(#cyanGlow)"/>' +
    '<path d="M96 63L116 73L136 63L132 59L116 67L100 59Z" fill="#ffffff" opacity="0.95"/>' +
    // Pro Club Crest on Left Chest
    '<g transform="translate(88, 80)" filter="url(#goldGlow)">' +
    '<polygon points="6,0 18,0 16,14 12,18 6,14" fill="url(#footyGold)" stroke="#ffffff" stroke-width="0.8"/>' +
    '<circle cx="12" cy="8" r="3.5" fill="#0f172a"/>' +
    '<circle cx="12" cy="8" r="1.8" fill="#ffffff"/>' +
    '<polygon points="12,-4 13.5,-1 16,-1 14,1 15,3.5 12,2 9,3.5 10,1 8,-1 10.5,-1" fill="url(#footyGold)"/>' +
    '</g>' +
    // Tech Sponsor Wordmark on Chest
    '<text x="116" y="94" font-family="\'Arial Black\', Impact, sans-serif" font-size="7" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2" opacity="0.85">HYPERKICK</text>' +
    // Iconic #10 in Bold 3D Athletic Typography
    '<g filter="url(#sharpShadow)">' +
    '<text x="116" y="132" font-family="Impact, \'Arial Black\', sans-serif" font-size="34" font-weight="900" fill="#0284c7" text-anchor="middle" letter-spacing="3">10</text>' +
    '<text x="116" y="130" font-family="Impact, \'Arial Black\', sans-serif" font-size="34" font-weight="900" fill="#ffffff" stroke=\"#0f172a\" stroke-width=\"1.5\" text-anchor="middle" letter-spacing="3">10</text>' +
    '</g>' +
    '</g>' +

    // 5. Muscular Athletic Arms & Sleeves
    // Left Arm (Viewer Right) with Captain\'s Armband
    '<g>' +
    '<path d="M154 68L174 92L162 99L146 76Z" fill="url(#footyJersey)"/>' +
    '<path d="M174 92L162 99L160 102L172 95Z" fill="#ffffff"/>' +
    '<path d="M162 99L184 116L174 125L154 105Z" fill="url(#footySkin)"/>' +
    '<g transform="translate(158, 97)" filter="url(#goldGlow)">' +
    '<rect x="0" y="0" width="18" height="9" rx="2" fill="url(#footyGold)" stroke="#ffffff" stroke-width="0.6"/>' +
    '<text x="9" y="7.5" font-family="\'Arial Black\', sans-serif" font-size="8" font-weight="900" fill="#0f172a" text-anchor="middle">C</text>' +
    '</g>' +
    '<path d="M174 118L186 128L179 135L168 124Z" fill="#090d16"/>' +
    '<rect x="173" y="119" width="7" height="4" rx="1.5" fill="#00f0ff" filter="url(#cyanGlow)"/>' +
    '</g>' +

    // Right Arm (Viewer Left)
    '<g>' +
    '<path d="M78 68L58 92L70 99L86 76Z" fill="url(#footyJersey)"/>' +
    '<path d="M58 92L70 99L72 102L60 95Z" fill="#ffffff"/>' +
    '<path d="M70 99L48 116L58 125L78 105Z" fill="url(#footySkin)"/>' +
    '<path d="M48 118L36 128L43 135L54 124Z" fill="#090d16"/>' +
    '<rect x="43" y="119" width="7" height="4" rx="1.5" fill="#10b981" filter="url(#cyanGlow)"/>' +
    '</g>' +

    // 6. Athletic Neck, Head & Expressive Facial Features
    '<path d="M104 58L104 72L128 72L128 58Z" fill="url(#footySkinShadow)"/>' +
    '<path d="M108 58L108 72L124 72L124 58Z" fill="url(#footySkin)"/>' +
    '<circle cx="116" cy="40" r="24" fill="url(#footySkin)"/>' +
    '<path d="M92 36C92 12 142 12 142 36C134 22 100 22 92 36Z" fill="#090d16"/>' +
    '<polygon points="108,14 122,10 118,22" fill="#00f0ff" filter="url(#cyanGlow)"/>' +
    '<polygon points="116,12 128,13 124,22" fill="#38bdf8"/>' +
    '<path d="M92 32C98 22 134 20 142 32C130 25 104 25 92 32Z" fill="#1e293b"/>' +

    // Sleek Glowing Cyber-Visor
    '<g filter="url(#cyanGlow)">' +
    '<path d="M97 34Q116 39 135 34L134 45Q116 50 98 45Z" fill="url(#footyVisor)"/>' +
    '<path d="M101 37L122 38" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" opacity="0.95"/>' +
    '<circle cx="98" cy="39.5" r="2" fill="#00f0ff"/>' +
    '<circle cx="134" cy="39.5" r="2" fill="#38bdf8"/>' +
    '</g>' +

    // Expressive Athletic Grin & Chiseled Jawline
    '<path d="M110 52Q116 56 122 52" stroke="#92400e" stroke-width="2.2" stroke-linecap="round" fill="none"/>' +
    '<path d="M112 52Q116 55 120 52Z" fill="#ffffff"/>' +

    // 7. High-Fidelity 3D Cyber Match Football at Foot
    '<g transform="translate(34, 222)">' +
    '<ellipse cx="25" cy="25" rx="31" ry="11" stroke="#00f0ff" stroke-width="2.4" fill="none" transform="rotate(-28, 25, 25)" filter="url(#ballGlow)"/>' +
    '<circle cx="6" cy="15" r="2" fill="#ffffff" filter="url(#cyanGlow)"/>' +
    '<circle cx="44" cy="35" r="1.6" fill="#38bdf8" filter="url(#cyanGlow)"/>' +
    '<circle cx="25" cy="25" r="22" fill="url(#ballSpherical)"/>' +
    '<circle cx="25" cy="25" r="22" stroke="#00f0ff" stroke-width="2" filter="url(#cyanGlow)"/>' +
    '<polygon points="25,14 33,20 30,29 20,29 17,20" fill="#0a101d" stroke="#00f0ff" stroke-width="1.6"/>' +
    '<line x1="25" y1="14" x2="25" y2="3" stroke="#00f0ff" stroke-width="1.6"/>' +
    '<line x1="33" y1="20" x2="44" y2="15" stroke="#00f0ff" stroke-width="1.6"/>' +
    '<line x1="30" y1="29" x2="39" y2="41" stroke="#00f0ff" stroke-width="1.6"/>' +
    '<line x1="20" y1="29" x2="11" y2="41" stroke="#00f0ff" stroke-width="1.6"/>' +
    '<line x1="17" y1="20" x2="6" y2="15" stroke="#00f0ff" stroke-width="1.6"/>' +
    '<ellipse cx="18" cy="15" rx="4.5" ry="2.8" fill="#ffffff" opacity="0.8" transform="rotate(-20, 18, 15)"/>' +
    '</g>' +
    '</svg>';
}

function getRealisticHoopsAvatarSvg() {
  return '<svg viewBox="0 0 240 290" fill="none" xmlns="http://www.w3.org/2000/svg" class="fvh-hero-avatar-svg">' +
    '<defs>' +
    // Warm High-Energy Arena Atmosphere
    '<radialGradient id="hoopsAura" cx="50%" cy="42%" r="58%">' +
    '<stop offset="0%" stop-color="#ff7b00" stop-opacity="0.48"/>' +
    '<stop offset="35%" stop-color="#ea580c" stop-opacity="0.25"/>' +
    '<stop offset="70%" stop-color="#d946ef" stop-opacity="0.10"/>' +
    '<stop offset="100%" stop-color="#07030c" stop-opacity="0"/>' +
    '</radialGradient>' +
    '<linearGradient id="hoopsBeam" x1="100%" y1="0%" x2="0%" y2="100%">' +
    '<stop offset="0%" stop-color="#ff8800" stop-opacity="0.32"/>' +
    '<stop offset="50%" stop-color="#ea580c" stop-opacity="0.15"/>' +
    '<stop offset="100%" stop-color="#d946ef" stop-opacity="0"/>' +
    '</linearGradient>' +

    // Vibrant Basketball Jersey (#23 All-Star Fiery Kit)
    '<linearGradient id="hoopsJersey" x1="0%" y1="0%" x2="100%" y2="100%">' +
    '<stop offset="0%" stop-color="#ff8800"/>' +
    '<stop offset="35%" stop-color="#ea580c"/>' +
    '<stop offset="75%" stop-color="#c2410c"/>' +
    '<stop offset="100%" stop-color="#7c2d12"/>' +
    '</linearGradient>' +
    '<linearGradient id="hoopsJerseyDark" x1="0%" y1="0%" x2="0%" y2="100%">' +
    '<stop offset="0%" stop-color="#9a3412"/>' +
    '<stop offset="100%" stop-color="#431407"/>' +
    '</linearGradient>' +
    '<linearGradient id="hoopsSideStripe" x1="0%" y1="0%" x2="100%" y2="0%">' +
    '<stop offset="0%" stop-color="#fde047"/>' +
    '<stop offset="50%" stop-color="#ff7b00"/>' +
    '<stop offset="100%" stop-color="#d946ef"/>' +
    '</linearGradient>' +

    // Athletic Muscular Skin Tones
    '<linearGradient id="hoopsSkin" x1="25%" y1="0%" x2="85%" y2="100%">' +
    '<stop offset="0%" stop-color="#d97706"/>' +
    '<stop offset="45%" stop-color="#b45309"/>' +
    '<stop offset="85%" stop-color="#854d0e"/>' +
    '<stop offset="100%" stop-color="#5a310c"/>' +
    '</linearGradient>' +
    '<linearGradient id="hoopsSkinShadow" x1="0%" y1="0%" x2="0%" y2="100%">' +
    '<stop offset="0%" stop-color="#92400e"/>' +
    '<stop offset="100%" stop-color="#451a03"/>' +
    '</linearGradient>' +

    // High-Top Basketball Sneaker
    '<linearGradient id="hoopsSneaker" x1="0%" y1="0%" x2="0%" y2="100%">' +
    '<stop offset="0%" stop-color="#ff7b00"/>' +
    '<stop offset="40%" stop-color="#ea580c"/>' +
    '<stop offset="75%" stop-color="#18181b"/>' +
    '<stop offset="100%" stop-color="#09090b"/>' +
    '</linearGradient>' +

    // Realistic 3D Shaded Basketball with Pebble Grain Texture
    '<radialGradient id="hoopsBallGrad" cx="35%" cy="30%" r="65%">' +
    '<stop offset="0%" stop-color="#ffaa44"/>' +
    '<stop offset="35%" stop-color="#f97316"/>' +
    '<stop offset="70%" stop-color="#c2410c"/>' +
    '<stop offset="90%" stop-color="#7c2d12"/>' +
    '<stop offset="100%" stop-color="#2a0d05"/>' +
    '</radialGradient>' +

    // Glow and Lighting Filters
    '<filter id="orangeGlow" x="-40%" y="-40%" width="180%" height="180%">' +
    '<feGaussianBlur stdDeviation="3.2" result="blur"/>' +
    '<feComposite in="SourceGraphic" in2="blur" operator="over"/>' +
    '</filter>' +
    '<filter id="magentaGlow" x="-30%" y="-30%" width="160%" height="160%">' +
    '<feGaussianBlur stdDeviation="3" result="blur"/>' +
    '<feComposite in="SourceGraphic" in2="blur" operator="over"/>' +
    '</filter>' +

    // Perforated Basketball Mesh Eyelet Pattern
    '<pattern id="meshHoops" width="8" height="8" patternUnits="userSpaceOnUse">' +
    '<circle cx="4" cy="4" r="1.1" fill="#fde047" opacity="0.3"/>' +
    '<circle cx="0" cy="0" r="0.8" fill="#ffffff" opacity="0.2"/>' +
    '<circle cx="8" cy="8" r="0.8" fill="#ffffff" opacity="0.2"/>' +
    '</pattern>' +
    '</defs>' +

    // 1. Warm Arena Glow & Contact Shadow
    '<circle cx="120" cy="138" r="116" fill="url(#hoopsAura)"/>' +
    '<polygon points=\"215,0 240,0 170,275 110,275\" fill=\"url(#hoopsBeam)\" opacity=\"0.4\"/>' +
    '<polygon points=\"60,0 110,0 80,275 30,275\" fill=\"url(#hoopsBeam)\" opacity=\"0.28\"/>' +
    '<ellipse cx=\"120\" cy=\"274\" rx=\"78\" ry=\"12\" fill=\"#000000\" opacity=\"0.75\"/>' +

    // 2. Muscular Athletic Legs with Crew Socks & High-Top Sneakers
    // Right Leg (Viewer Left)
    '<g>' +
    '<path d=\"M104 168L92 216L80 252L100 258L110 220L116 168Z\" fill=\"url(#hoopsSkinShadow)\"/>' +
    // White ribbed crew sock with orange stripe
    '<path d=\"M102 196L92 218L82 250L100 256L108 222L110 196Z\" fill=\"#ffffff\" opacity=\"0.95\"/>' +
    '<path d=\"M101 200L89 202L91 205L103 203Z\" fill=\"#ff7b00\"/>' +
    '<line x1=\"98\" y1=\"208\" x2=\"88\" y2=\"248\" stroke=\"#e4e4e7\" stroke-width=\"1.8\"/>' +
    // Right High-Top Sneaker
    '<path d=\"M80 250L48 254L46 264L90 264L92 254Z\" fill=\"url(#hoopsSneaker)\"/>' +
    // Sculpted White EVA Midsole & Cushion
    '<path d=\"M46 262L90 262L91 267L45 267Z\" fill=\"#ffffff\"/>' +
    '<rect x=\"64\" y=\"263\" width=\"12\" height=\"2.5\" rx=\"1\" fill=\"#ea580c\"/>' +
    // Grippy Fiery Orange Outsole Tread
    '<path d=\"M45 266L91 266L92 269L44 269Z\" fill=\"#ff7b00\" filter=\"url(#orangeGlow)\"/>' +
    '</g>' +

    // Left Leg (Viewer Right)
    '<g>' +
    '<path d=\"M136 168L148 216L160 252L140 258L130 220L124 168Z\" fill=\"url(#hoopsSkinShadow)\"/>' +
    // White ribbed crew sock with magenta/orange stripe
    '<path d=\"M138 196L148 218L158 250L140 256L132 222L130 196Z\" fill=\"#ffffff\" opacity=\"0.95\"/>' +
    '<path d=\"M139 200L151 202L149 205L137 203Z\" fill=\"#d946ef\"/>' +
    '<line x1=\"142\" y1=\"208\" x2=\"152\" y2=\"248\" stroke=\"#e4e4e7\" stroke-width=\"1.8\"/>' +
    // Left High-Top Sneaker
    '<path d=\"M140 250L172 254L174 264L130 264L128 254Z\" fill=\"url(#hoopsSneaker)\"/>' +
    // Sculpted White EVA Midsole
    '<path d=\"M130 262L174 262L175 267L129 267Z\" fill=\"#ffffff\"/>' +
    '<rect x=\"144\" y=\"263\" width=\"12\" height=\"2.5\" rx=\"1\" fill=\"#d946ef\"/>' +
    // Grippy Fiery Outsole Tread
    '<path d=\"M129 266L175 266L176 269L128 269Z\" fill=\"#d946ef\" filter=\"url(#magentaGlow)\"/>' +
    '</g>' +

    // 3. Pro Basketball Shorts with Bold Side Panels
    '<g>' +
    '<path d=\"M82 130L68 178L115 178L120 144L125 178L168 178L156 130Z\" fill=\"url(#hoopsJerseyDark)\"/>' +
    // Wide Side Stripe Panels
    '<path d=\"M69 134L68 177L78 177L82 134Z\" fill=\"url(#hoopsSideStripe)\"/>' +
    '<path d=\"M167 134L168 177L158 177L154 134Z\" fill=\"url(#hoopsSideStripe)\"/>' +
    // Contrasting Split-Hem Piping
    '<path d=\"M68 174L115 174L114 178L68 178Z\" fill=\"#ffffff\" opacity=\"0.95\"/>' +
    '<path d=\"M125 174L168 174L168 178L125 178Z\" fill=\"#ffffff\" opacity=\"0.95\"/>' +
    // Elastic Waistband & Drawstring
    '<rect x=\"82\" y=\"128\" width=\"74\" height=\"5\" rx=\"2\" fill=\"#ff7b00\"/>' +
    '<circle cx=\"118\" cy=\"133\" r=\"1.5\" fill=\"#ffffff\"/>' +
    '<circle cx=\"122\" cy=\"133\" r=\"1.5\" fill=\"#ffffff\"/>' +
    '</g>' +

    // 4. Vibrant Basketball Tank Top (Torso)
    '<g>' +
    // Jersey Body
    '<path d=\"M82 66L66 136L172 136L156 66L142 62L120 70L98 62Z\" fill=\"url(#hoopsJersey)\" filter=\"url(#sharpShadow)\"/>' +
    // Perforated Eyelet Mesh Texture
    '<path d=\"M82 66L66 136L172 136L156 66L142 62L120 70L98 62Z\" fill=\"url(#meshHoops)\"/>' +
    // Wide Ribbed Neckline / Scoop Collar
    '<path d=\"M98 62L120 70L142 62L138 58L120 65L102 58Z\" fill=\"#ffffff\" opacity=\"0.95\"/>' +
    '<path d=\"M100 63L120 69L140 63L138 61L120 66L102 61Z\" fill=\"#ff7b00\"/>' +
    // Ribbed Armhole Trims
    '<path d=\"M82 66L76 86L70 84L78 65Z\" fill=\"#ffffff\" opacity=\"0.95\"/>' +
    '<path d=\"M156 66L162 86L168 84L160 65Z\" fill=\"#ffffff\" opacity=\"0.95\"/>' +
    // Side Flares
    '<path d=\"M70 84L66 136L74 136L76 86Z\" fill=\"url(#hoopsSideStripe)\"/>' +
    '<path d=\"M168 84L172 136L164 136L162 86Z\" fill=\"url(#hoopsSideStripe)\"/>' +
    // Arched Team Wordmark across Upper Chest
    '<text x=\"119\" y=\"88\" font-family=\"\'Arial Black\', Impact, sans-serif\" font-size=\"9\" font-weight=\"900\" fill=\"#ffffff\" text-anchor=\"middle\" letter-spacing=\"3\" opacity=\"0.9\">HOOPS</text>' +
    // Iconic #23 in Heavy 3D Collegiate Typography
    '<g filter=\"url(#sharpShadow)\">' +
    '<text x=\"120\" y=\"126\" font-family=\"Impact, \'Arial Black\', sans-serif\" font-size=\"38\" font-weight=\"900\" fill=\"#7c2d12\" text-anchor=\"middle\" letter-spacing=\"2\">23</text>' +
    '<text x=\"120\" y=\"124\" font-family=\"Impact, \'Arial Black\', sans-serif\" font-size=\"38\" font-weight=\"900\" fill=\"#ffffff\" stroke=\"#18181b\" stroke-width=\"1.8\" text-anchor=\"middle\" letter-spacing=\"2\">23</text>' +
    '</g>' +
    '</g>' +

    // 5. Broad Muscular Arms & Basketball Shooting Sleeve
    // Right Arm (Viewer Left) with Compression Hex Sleeve
    '<g>' +
    // Deltoid
    '<circle cx=\"76\" cy=\"74\" r=\"14\" fill=\"url(#hoopsSkin)\"/>' +
    // Compression Shooting Sleeve (Dark with Neon Orange Trim)
    '<path d=\"M84 76L52 104L62 114L90 86Z\" fill=\"#18181b\"/>' +
    '<line x1=\"80\" y1=\"78\" x2=\"56\" y2=\"106\" stroke=\"#ff7b00\" stroke-width=\"2.5\" filter=\"url(#orangeGlow)\"/>' +
    '<line x1=\"84\" y1=\"84\" x2=\"64\" y2=\"108\" stroke=\"#d946ef\" stroke-width=\"1.8\"/>' +
    // Hand
    '<path d=\"M52 104L40 114L46 120L58 110Z\" fill=\"url(#hoopsSkin)\"/>' +
    '</g>' +

    // Left Arm (Viewer Right) Raised Spinning Basketball
    '<g>' +
    // Deltoid
    '<circle cx=\"162\" cy=\"74\" r=\"14\" fill=\"url(#hoopsSkin)\"/>' +
    // Muscular Bicep & Tricep
    '<path d=\"M154 70L186 84L192 76L160 62Z\" fill=\"url(#hoopsSkin)\"/>' +
    // Forearm reaching up to balance ball
    '<path d=\"M186 84L190 54L178 52L176 80Z\" fill=\"url(#hoopsSkin)\"/>' +
    // Hand with fingers palming/spinning
    '<path d=\"M190 54L194 44L182 42L178 52Z\" fill=\"url(#hoopsSkin)\"/>' +
    // Terrycloth wristband on left wrist
    '<rect x=\"178\" y=\"58\" width=\"12\" height=\"6\" rx=\"2\" fill=\"#ff7b00\" filter=\"url(#orangeGlow)\"/>' +
    '</g>' +

    // 6. Athletic Neck, Head & Signature Orange Headband
    '<path d=\"M106 56L106 70L132 70L132 56Z\" fill=\"url(#hoopsSkinShadow)\"/>' +
    '<path d=\"M110 56L110 70L128 70L128 56Z\" fill=\"url(#hoopsSkin)\"/>' +
    '<circle cx=\"119\" cy=\"38\" r=\"23\" fill=\"url(#hoopsSkin)\"/>' +
    // Athletic Fade Haircut
    '<path d=\"M95 28C95 12 143 12 143 28Z\" fill=\"#09050d\"/>' +
    // Signature Fiery Orange Headband with White Logo
    '<g filter=\"url(#orangeGlow)\">' +
    '<rect x=\"94\" y=\"25\" width=\"51\" height=\"12\" rx=\"3.5\" fill=\"#ff6b00\"/>' +
    '<rect x=\"113\" y=\"27.5\" width=\"13\" height=\"7\" rx=\"2\" fill=\"#ffffff\"/>' +
    '</g>' +
    // Intense Athletic Game-Ready Eyes & Grin
    '<rect x=\"108\" y=\"38\" width=\"4\" height=\"4.5\" rx=\"1.5\" fill=\"#18181b\"/>' +
    '<rect x=\"126\" y=\"38\" width=\"4\" height=\"4.5\" rx=\"1.5\" fill=\"#18181b\"/>' +
    '<path d=\"M111 48Q119 55 127 48Z\" fill=\"#ffffff\"/>' +
    '<path d=\"M111 48Q119 55 127 48\" stroke=\"#5a2710\" stroke-width=\"2\" fill=\"none\"/>' +

    // 7. Realistic 3D Basketball with Glowing Cyan Orbital Energy Ring
    '<g transform=\"translate(162, 14)\">' +
    // Dynamic Orbital Ring around Basketball
    '<ellipse cx=\"28\" cy=\"28\" rx=\"33\" ry=\"10\" stroke=\"#00f0ff\" stroke-width=\"2.6\" fill=\"none\" transform=\"rotate(-26, 28, 28)\" opacity=\"0.95\" filter=\"url(#cyanGlow)\"/>' +
    '<circle cx=\"5\" cy=\"18\" r=\"2\" fill=\"#ffffff\" filter=\"url(#cyanGlow)\"/>' +
    '<circle cx=\"48\" cy=\"38\" r=\"1.8\" fill=\"#ff7b00\" filter=\"url(#orangeGlow)\"/>' +
    // 3D Shaded Basketball
    '<circle cx=\"28\" cy=\"28\" r=\"23\" fill=\"url(#hoopsBallGrad)\" filter=\"url(#orangeGlow)\"/>' +
    '<circle cx=\"28\" cy=\"28\" r=\"23\" stroke=\"#18181b\" stroke-width=\"2.2\" fill=\"none\"/>' +
    // Authentic Curved Rubber Seams
    '<path d=\"M5 28H51\" stroke=\"#18181b\" stroke-width=\"2.2\" stroke-linecap=\"round\"/>' +
    '<path d=\"M28 5V51\" stroke=\"#18181b\" stroke-width=\"2.2\" stroke-linecap=\"round\"/>' +
    '<path d=\"M11 11C22 19 22 37 11 45\" stroke=\"#18181b\" stroke-width=\"2.2\" fill=\"none\"/>' +
    '<path d=\"M45 11C34 19 34 37 45 45\" stroke=\"#18181b\" stroke-width=\"2.2\" fill=\"none\"/>' +
    // Specular Highlight Glint
    '<ellipse cx=\"20\" cy=\"18\" rx=\"5.5\" ry=\"3\" fill=\"#ffffff\" opacity=\"0.55\" transform=\"rotate(-30, 20, 18)\"/>' +
    '</g>' +
    '</svg>';
}

module.exports = {
  getRealisticFootyAvatarSvg,
  getRealisticHoopsAvatarSvg
};
