const fs = require('fs');
const path = require('path');

const files = [
  'js/game.js',
  'C:/Users/ASUS/Desktop/FOOTY vs HOOPS/js/game.js'
];

console.log('=== Step 1: Upgrading Kits in MatchView ===');

files.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');

  // Fix playerChar === 'hoops' and playerChar === 'footy' kit defaults
  const oldPlayerKits = `            if (playerChar === 'hoops') {
                if (!charSkinId || charSkinId === 'skin_bb_onyx') {
                    skin.primary = 0xff6b00;
                    skin.secondary = 0x14151a;
                    skin.shorts = 0x14151a;
                    skin.boots = 0xff6b00;
                    skin.accent = 0xffffff;
                    skin.style = 'hoops';
                }
                skin.skin = 0x6c4424; // Rich athletic dark skin matching wardrobe
                skin.hair = 0x0a0a0a; // Deep black cropped fade hair
            } else {
                if (!charSkinId || charSkinId === 'skin_rookie') {
                    skin.primary = 0x00c8ff;
                    skin.secondary = 0x0a1e3f;
                    skin.shorts = 0x0a1e3f;
                    skin.boots = 0x00c8ff;
                    skin.accent = 0xffffff;
                    skin.style = 'plain';
                }
                skin.skin = 0xdfa070; // Athletic European skin tone matching wardrobe
                skin.hair = 0x221810; // Dark brown swept fringe hair
            }`;

  const newPlayerKits = `            if (playerChar === 'hoops') {
                if (!charSkinId || charSkinId === 'skin_bb_onyx') {
                    skin.primary = 0x111318; // Matte carbon black
                    skin.secondary = 0xf59e0b; // Metallic gold
                    skin.shorts = 0x111318; // Matte black shorts with gold chevrons
                    skin.boots = 0x111318; // Black & gold high-top sneakers
                    skin.accent = 0xfbbf24; // Metallic gold accent
                    skin.style = 'allstar';
                }
                skin.skin = 0x5a3825; // Rich dark skin tone from hoops23_preview.png
                skin.hair = 0x0a0a0c; // Black flat top fade + beard
            } else {
                if (!charSkinId || charSkinId === 'skin_rookie') {
                    skin.primary = 0x00c4e2; // Vibrant turquoise forward jersey
                    skin.secondary = 0xffffff; // White raglan sleeves & squad text
                    skin.shorts = 0x0f172a; // Dark navy athletic shorts with crest
                    skin.boots = 0x00c4e2; // Turquoise pro speed cleats
                    skin.accent = 0x0f172a; // Dark navy V-neck collar
                    skin.style = 'raglan';
                }
                skin.skin = 0xdfa57e; // Stylized skin tone from footy10_preview.png
                skin.hair = 0x2d1a0e; // Styled brown pompadour quiff
            }`;

  // Fix signature opponent kits
  const oldOppKits = `            // Signature Cross-Sport Kits for Football vs Basketball Rivalry
            const hoopsOppKit = {
                id: 'skin_bb_onyx',
                primary: 0xff6b00,
                secondary: 0x14151a,
                shorts: 0x14151a,
                skin: 0x6c4424,
                hair: 0x0a0a0a,
                boots: 0xff6b00,
                accent: 0xffffff,
                style: 'hoops'
            };
            const footyOppKit = {
                id: 'skin_rookie',
                primary: 0x00c8ff,
                secondary: 0x0a1e3f,
                shorts: 0x0a1e3f,
                skin: 0xdfa070,
                hair: 0x221810,
                boots: 0x00c8ff,
                accent: 0xffffff,
                style: 'plain'
            };
            const oppSkin = (oppChar === 'hoops') ? hoopsOppKit : footyOppKit;
            const keeperHome = Object.assign(Object.assign({}, characters_js_1.KEEPER_SKIN), { id: 'keeper_home', primary: 0x2bd96b, secondary: 0x0a3a1c });`;

  const newOppKits = `            // Signature Cross-Sport Kits for Football vs Basketball Rivalry
            const hoopsOppKit = {
                id: 'skin_bb_onyx',
                primary: 0x111318, // Matte carbon black
                secondary: 0xf59e0b, // Metallic gold
                shorts: 0x111318,
                skin: 0x5a3825,
                hair: 0x0a0a0c,
                boots: 0x111318,
                accent: 0xfbbf24,
                style: 'allstar'
            };
            const footyOppKit = {
                id: 'skin_rookie',
                primary: 0x00c4e2, // Turquoise
                secondary: 0xffffff, // White
                shorts: 0x0f172a, // Dark navy
                skin: 0xdfa57e,
                hair: 0x2d1a0e,
                boots: 0x00c4e2,
                accent: 0x0f172a,
                style: 'raglan'
            };
            const oppSkin = (oppChar === 'hoops') ? hoopsOppKit : footyOppKit;
            const keeperHome = Object.assign(Object.assign({}, characters_js_1.KEEPER_SKIN), { id: 'keeper_home', primary: 0x10b981, secondary: 0x064e3b, shorts: 0x0f172a, boots: 0x10b981, skin: 0xdfa57e, hair: 0x18181b, style: 'keeper' });`;

  const normCode = code.replace(/\r\n/g, '\n');
  const normOldPlayer = oldPlayerKits.replace(/\r\n/g, '\n');
  const normNewPlayer = newPlayerKits.replace(/\r\n/g, '\n');
  const normOldOpp = oldOppKits.replace(/\r\n/g, '\n');
  const normNewOpp = newOppKits.replace(/\r\n/g, '\n');

  let updated = normCode;
  if (updated.includes(normOldPlayer)) {
    updated = updated.replace(normOldPlayer, normNewPlayer);
    console.log('✓ Updated player kit defaults in', filePath);
  } else {
    console.warn('✗ Could not match oldPlayerKits in', filePath);
  }

  if (updated.includes(normOldOpp)) {
    updated = updated.replace(normOldOpp, normNewOpp);
    console.log('✓ Updated opponent kit defaults in', filePath);
  } else {
    console.warn('✗ Could not match oldOppKits in', filePath);
  }

  // Restore skin_solar rare item in ITEMS
  updated = updated.replace(
    "skin('skin_bb_onyx', 'Solar Flare', 'rare', 450,",
    "skin('skin_solar', 'Solar Flare', 'rare', 450,"
  );

  fs.writeFileSync(filePath, updated, 'utf8');
  console.log('✓ Successfully saved kit updates to', filePath);
});
