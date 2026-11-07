const fs = require('fs');
const path = require('path');

const gameJsPath = path.join(__dirname, '../js/game.js');
let code = fs.readFileSync(gameJsPath, 'utf8');
const hadCRLF = code.includes('\r\n');
code = code.replace(/\r\n/g, '\n');

const oldMakeLedText = `            // Main Text (Bold, crisp, proportional)
            let fs = s.sub ? 64 : 80;
            g.font = \`900 \${fs}px system-ui, -apple-system, sans-serif\`;
            while (g.measureText(slideText).width > pw - 60 && fs > 26) {
                fs -= 2;
                g.font = \`900 \${fs}px system-ui, -apple-system, sans-serif\`;
            }
            g.textAlign = 'center';
            g.textBaseline = 'middle';
            g.shadowColor = accentHex;
            g.shadowBlur = 14;
            g.fillStyle = hex((_a = s.color) !== null && _a !== void 0 ? _a : 0xffffff);
            g.fillText(slideText, x0 + pw / 2, s.sub ? 58 : H / 2);`;

const newMakeLedText = `            // Main Text (Bold, crisp, proportional with Fortnite esports chevrons)
            let fs = s.sub ? 64 : 76;
            g.font = \`900 \${fs}px system-ui, -apple-system, sans-serif\`;
            while (g.measureText(slideText).width > pw - 240 && fs > 26) {
                fs -= 2;
                g.font = \`900 \${fs}px system-ui, -apple-system, sans-serif\`;
            }
            g.textAlign = 'center';
            g.textBaseline = 'middle';
            g.shadowColor = accentHex;
            g.shadowBlur = 16;
            g.fillStyle = hex((_a = s.color) !== null && _a !== void 0 ? _a : 0xffffff);
            const textY = s.sub ? 58 : H / 2;
            g.fillText(slideText, x0 + pw / 2, textY);

            // Fortnite esports chevron speed wings flanking the text
            const textHalfW = g.measureText(slideText).width / 2;
            g.fillStyle = accentHex;
            g.font = '900 42px system-ui, -apple-system, sans-serif';
            g.shadowBlur = 12;
            const leftWingX = Math.max(x0 + 40, (x0 + pw / 2) - textHalfW - 55);
            const rightWingX = Math.min(x0 + pw - 40, (x0 + pw / 2) + textHalfW + 55);
            g.fillText('««', leftWingX, textY);
            g.fillText('»»', rightWingX, textY);
            g.shadowBlur = 0;`;

if (!code.includes(oldMakeLedText)) {
    console.error('Could not find oldMakeLedText in js/game.js');
    process.exit(1);
}
code = code.replace(oldMakeLedText, newMakeLedText);

if (hadCRLF) {
    code = code.replace(/\n/g, '\r\n');
}

fs.writeFileSync(gameJsPath, code, 'utf8');
console.log('✅ Successfully enhanced LED ribbon boards with Fortnite esports chevrons!');
