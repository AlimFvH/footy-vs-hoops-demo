const fs = require('fs');

// 1. Patch js/redesign.js
let redesignCode = fs.readFileSync('js/redesign.js', 'utf8');

// Update CROWD_CATALOG isDefault flags
const crowdIds = ['crowd_global_fest', 'crowd_cyber_vip', 'crowd_emerald_forest', 'crowd_gold_champs'];
crowdIds.forEach(id => {
  const re = new RegExp('(id:\\s*[\'"]' + id + '[\'"][\\s\\S]*?isDefault:\\s*)true');
  redesignCode = redesignCode.replace(re, '$1false');
});

// Update Leaderboard titles to avoid mobile clipping
redesignCode = redesignCode.replace("leaderboardTitle: 'TEAM WAR: FOOTBALL VS BASKETBALL',", "leaderboardTitle: 'TEAM WAR',");
redesignCode = redesignCode.replace("leaderboardTitle: 'БИТВА КОМАНД: ФУТБОЛ VS БАСКЕТБОЛ',", "leaderboardTitle: 'БИТВА КОМАНД',");

// Also check main menu curChar skin passing around line 9576
// In buildSoloScreen: getCharacterDisplayHtml(curChar, d.equipped && d.equipped.skin)
redesignCode = redesignCode.replace(
  "getCharacterDisplayHtml(curChar, d.equipped && d.equipped.skin)",
  "getCharacterDisplayHtml(curChar, curChar === 'hoops' ? (d.equipped && (d.equipped['skin.hoops'] || (d.equipped.skin !== 'skin_rookie' ? d.equipped.skin : null))) : (d.equipped && (d.equipped['skin.footy'] || (d.equipped.skin !== 'skin_solar' ? d.equipped.skin : null))))"
);

fs.writeFileSync('js/redesign.js', redesignCode, 'utf8');
console.log('Successfully patched js/redesign.js');

// 2. Patch css/redesign.css to make .key-hints fit on narrow mobile screens
let cssCode = fs.readFileSync('css/redesign.css', 'utf8');
if (!cssCode.includes('/* Mobile responsive in-match controls hints bar */')) {
  cssCode += `\n
/* Mobile responsive in-match controls hints bar */
@media (max-width: 480px) {
  .key-hints {
    font-size: 10px !important;
    gap: 6px !important;
    padding: 4px 10px !important;
    max-width: 95vw !important;
    box-sizing: border-box !important;
  }
  .key-hints kbd {
    padding: 2px 4px !important;
    font-size: 9.5px !important;
  }
}
`;
  fs.writeFileSync('css/redesign.css', cssCode, 'utf8');
  console.log('Successfully patched css/redesign.css');
}
