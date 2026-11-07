const fs = require('fs');
const path = require('path');

const gameJsPath = path.join(__dirname, '../js/game.js');
let code = fs.readFileSync(gameJsPath, 'utf8');

console.log('[1/5] Updating AD_CONFIG in js/game.js...');

// 1. Replace AD_CONFIG slides with genuine Fortnite esports branding
const oldAdConfigMatch = code.match(/exports\.AD_CONFIG\s*=\s*\{[\s\S]*?slides:\s*\[[\s\S]*?\]\s*\};/);
if (oldAdConfigMatch) {
  const newAdConfig = `exports.AD_CONFIG = {
        enabled: true,
        brightness: 1.15,
        pulse: 0.12,
        fadeIn: 0.4,
        visible: 6.0,
        fadeOut: 0.4,
        hidden: 2.0,
        cycleTotal: 8.8,
        footySlides: [
            { text: '⚡ FOOTY vs HOOPS ⚡', accent: 0x00f0ff, color: 0xffffff },
            { text: '★ VICTORY ROYALE ★', accent: 0x10b981, color: 0xffffff },
            { text: '⚡ HYPER STRIKER #10 ⚡', accent: 0x38bdf8, color: 0xffffff },
            { text: '🏆 CYBER ARENA 🏆', accent: 0xfacc15, color: 0xffffff }
        ],
        hoopsSlides: [
            { text: '🔥 ALL-STAR HOOPS #23 🔥', accent: 0xf97316, color: 0xffffff },
            { text: '★ VICTORY ROYALE ★', accent: 0xec4899, color: 0xffffff },
            { text: '⚡ METEOR SLAM DUNK ⚡', accent: 0xfb923c, color: 0xffffff },
            { text: '🏆 CYBER ARENA 🏆', accent: 0xfacc15, color: 0xffffff }
        ],
        slides: [
            { text: '⚡ FOOTY vs HOOPS ⚡', accent: 0x00f0ff, color: 0xffffff },
            { text: '★ VICTORY ROYALE ★', accent: 0xfacc15, color: 0xffffff },
            { text: '🔥 ALL-STAR SPORTS 🔥', accent: 0x38bdf8, color: 0xffffff }
        ]
    };`;
  code = code.replace(oldAdConfigMatch[0], newAdConfig);
  console.log('  -> AD_CONFIG successfully updated with Fortnite esports branding.');
} else {
  console.warn('  -> Could not match AD_CONFIG block!');
}

// 2. Eradicate 'ЗДЕСЬ МОЖЕТ БЫТЬ ТВОЯ РЕКЛАМА' from makeLedTexture and ledMaterials
console.log('[2/5] Eliminating Russian placeholder ad strings...');
code = code.replace(
  /slideText\s*=\s*isEnglish\s*\?\s*'YOUR AD HERE'\s*:\s*'ЗДЕСЬ МОЖЕТ БЫТЬ ТВОЯ РЕКЛАМА';/g,
  "slideText = '⚡ FOOTY vs HOOPS ⚡';"
);
code = code.replace(
  /txt\s*=\s*isEnglish\s*\?\s*'YOUR AD HERE'\s*:\s*'ЗДЕСЬ МОЖЕТ БЫТЬ ТВОЯ РЕКЛАМА';/g,
  "txt = sportType === 'hoops' ? '🔥 ALL-STAR HOOPS #23 🔥' : '⚡ FOOTY vs HOOPS ⚡';"
);
code = code.replace(
  /txt\.includes\('Здесь может быть'\)\s*\|\|\s*txt\.toUpperCase\(\)\.includes\('YOUR AD HERE'\)/g,
  "false"
);
code = code.replace(
  /slideText\.includes\('Здесь может быть'\)\s*\|\|\s*slideText\.toUpperCase\(\)\.includes\('YOUR AD HERE'\)/g,
  "false"
);

// 3. Update PLAYER_SCALE from 1.68 to 2.25
console.log('[3/5] Upgrading PLAYER_SCALE to 2.25 for heroic athlete proportions...');
code = code.replace(/exports\.PLAYER_SCALE\s*=\s*1\.68;/, 'exports.PLAYER_SCALE = 2.25;');

// 4. Update Jumbotron positioning and eliminate wooden peg dolls in buildBasketballArenaArchitecture & buildFootballStadiumArchitecture
console.log('[4/5] Refining Jumbotrons and eliminating peg-doll bleachers...');

// Jumbotron in Basketball: lower y from 12.8 to 5.8, z from L + APRON + 6.8 to L + APRON + 1.8
code = code.replace(
  /jumbo\.setPos\(0,\s*12\.8,\s*s\s*\*\s*\(L\s*\+\s*APRON\s*\+\s*6\.8\)\);/g,
  'jumbo.setPos(0, 5.8, s * (L + APRON + 1.8));'
);

// Jumbotron in Football: lower y from 13.5 to 5.8, z from L + GD + 7.5 to L + GD + 2.0
code = code.replace(
  /jumbo\.setPos\(0,\s*13\.5,\s*s\s*\*\s*\(L\s*\+\s*GD\s*\+\s*7\.5\)\);/g,
  'jumbo.setPos(0, 5.8, s * (L + GD + 2.0));'
);

// Make sure buildBasketballArenaArchitecture returns clean crowd without peg dolls
const oldHoopsReturn = 'return crowdAndStands(root, stands, t.crowd || [0x00f0ff, 0xff2bd6, 0xf59e0b, 0xffffff, 0xa855f7], t.stand || 0x0f1422, quality);';
const newHoopsReturn = `// Clean futuristic cyber arena: zero wooden peg dolls in direct sightline!
        return { visible: false };`;
if (code.includes(oldHoopsReturn)) {
  code = code.replace(oldHoopsReturn, newHoopsReturn);
  console.log('  -> buildBasketballArenaArchitecture: peg dolls completely eliminated.');
}

const oldFootyReturn = 'return crowdAndStands(root, stands, t.crowd || [0x00f0ff, 0x10b981, 0x38bdf8, 0xffffff, 0xfacc15], t.stand || 0x0b1329, quality);';
const newFootyReturn = `// Clean futuristic cyber stadium: zero wooden peg dolls in direct sightline!
        return { visible: false };`;
if (code.includes(oldFootyReturn)) {
  code = code.replace(oldFootyReturn, newFootyReturn);
  console.log('  -> buildFootballStadiumArchitecture: peg dolls completely eliminated.');
}

// 5. Add Cyberpunk skyline to default arena sky
console.log('[5/5] Adding futuristic skyline to default sky...');
const skyTarget = `            // Floodlights & Arena Illumination
            if (isFooty) {`;

const skyReplacement = `            // Futuristic Cyber Skyline Silhouette & Searchlight Beams (North View)
            const skyBldCol = isFooty ? '#09152b' : '#0c0f1d';
            const skyWinCol1 = '#00f0ff';
            const skyWinCol2 = '#f59e0b';
            const skyWinCol3 = '#ec4899';
            // Tower silhouettes across North horizon (x: 280 to 744, center is 512)
            const towers = [
                { x: 310, w: 55, h: 140 },
                { x: 380, w: 70, h: 180 },
                { x: 465, w: 90, h: 220 }, // Center-left mega spire
                { x: 570, w: 85, h: 210 }, // Center-right mega spire
                { x: 670, w: 65, h: 160 },
                { x: 750, w: 50, h: 120 }
            ];
            for (const tw of towers) {
                g.fillStyle = skyBldCol;
                g.fillRect(tw.x, 260 - tw.h, tw.w, tw.h + 60);
                // Glowing spire antenna
                g.fillStyle = isFooty ? '#00f0ff' : '#f97316';
                g.fillRect(tw.x + tw.w / 2 - 1.5, 260 - tw.h - 35, 3, 35);
                // High-tech window matrix
                for (let wy = 260 - tw.h + 20; wy < 260; wy += 14) {
                    for (let wx = tw.x + 8; wx < tw.x + tw.w - 8; wx += 12) {
                        if (Math.random() > 0.45) {
                            const rCol = Math.random();
                            g.fillStyle = rCol > 0.6 ? skyWinCol1 : (rCol > 0.3 ? skyWinCol2 : skyWinCol3);
                            g.fillRect(wx, wy, 4, 6);
                        }
                    }
                }
            }
            // Vertical Cyber Searchlight Beams sweeping into night sky
            const beams = [360, 480, 560, 680];
            for (const bx of beams) {
                const bGrad = g.createLinearGradient(bx, 260, bx, 40);
                bGrad.addColorStop(0, isFooty ? 'rgba(0,240,255,0.32)' : 'rgba(249,115,22,0.32)');
                bGrad.addColorStop(0.5, isFooty ? 'rgba(16,185,129,0.18)' : 'rgba(236,72,153,0.18)');
                bGrad.addColorStop(1, 'rgba(0,0,0,0)');
                g.fillStyle = bGrad;
                g.beginPath();
                g.moveTo(bx - 18, 260);
                g.lineTo(bx - 45, 40);
                g.lineTo(bx + 45, 40);
                g.lineTo(bx + 18, 260);
                g.closePath();
                g.fill();
            }

            // Floodlights & Arena Illumination
            if (isFooty) {`;

if (code.includes(skyTarget)) {
  code = code.replace(skyTarget, skyReplacement);
  console.log('  -> Futuristic Cyber Skyline added to default sky.');
}

fs.writeFileSync(gameJsPath, code, 'utf8');
console.log('=== SUCCESS: js/game.js updated! ===\n');
