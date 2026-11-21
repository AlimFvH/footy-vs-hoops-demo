const fs = require('fs');

let code = fs.readFileSync('js/redesign.js', 'utf8');

// Normalize line endings to \n
code = code.replace(/\r\n/g, '\n');

// 1. Remove Athlete Switcher in Wardrobe
const startTag = "    // Athlete Switcher at top of Wardrobe";
const endTag = "    body.appendChild(charSwitchSeg);";

const sIdx = code.indexOf(startTag);
const eIdx = code.indexOf(endTag);

if (sIdx !== -1 && eIdx !== -1 && eIdx > sIdx) {
  const fullBlock = code.slice(sIdx, eIdx + endTag.length);
  code = code.replace(fullBlock, "    // Locker athlete is strictly determined by player's selected hero on the Home Screen");
  console.log("Successfully removed wardrobe character toggle!");
} else {
  console.error("Wardrobe toggle not found by index!", sIdx, eIdx);
}

// 2. Remove Stars Balance in Shop
const walletStartTag = "    function updateWalletUI() {";
const walletEndTag = "      walletBox.innerHTML =";
const walletBtnsEndTag = "        '</div>';";

const wIdx = code.indexOf(walletStartTag);
if (wIdx !== -1) {
  const bIdx = code.indexOf(walletBtnsEndTag, wIdx);
  if (bIdx !== -1) {
    const origWalletBlock = code.slice(wIdx, bIdx + walletBtnsEndTag.length);
    const newWalletBlock = [
      "    function updateWalletUI() {",
      "      var coins = (app.store && app.store.data && app.store.data.coins) || 0;",
      "      walletBox.innerHTML =",
      "        '<div style=\"display:flex;align-items:center;gap:6px;\">' +",
      "        '  <button class=\"fvh-wallet-pill gold\" style=\"cursor:pointer;\" title=\"' + tr('catCoins') + '\">' +",
      "        getFvhCoinSvg('inline') + ' <span>' + coins.toLocaleString() + '</span>' +",
      "        '  </button>' +",
      "        '</div>';"
    ].join('\n');
    code = code.replace(origWalletBlock, newWalletBlock);
    console.log("Successfully removed stars balance pill in shop!");
  } else {
    console.error("walletBtnsEndTag not found!");
  }
} else {
  console.error("walletStartTag not found!");
}

// 3. Enhance Room Code copy in showPrivateMatchLobby
const copySearch = "      // Copy Link Button\n      var copyBtn = modal.querySelector('.fvh-btn-copy-link');";
const codePillEnhancement = `      // Room Code Pill Click To Copy
      var codePill = modal.querySelector('.fvh-lobby-room-code-pill');
      if (codePill) {
        codePill.style.cursor = 'pointer';
        codePill.onclick = function () {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(roomCode);
          }
          app.audio.play('click');
          showToast((lang === 'ru' ? '🔑 Код комнаты скопирован: ' : '🔑 Room code copied: ') + roomCode);
        };
      }

      // Copy Link Button
      var copyBtn = modal.querySelector('.fvh-btn-copy-link');`;

if (code.includes(copySearch)) {
  code = code.replace(copySearch, codePillEnhancement);
  console.log("Successfully added room code click-to-copy handler!");
} else {
  console.warn("copySearch not matched exactly, trying fallback");
}

fs.writeFileSync('js/redesign.js', code, 'utf8');
console.log("Saved js/redesign.js successfully!");

// 4. Center pause and sound buttons under scoreboard in css/redesign.css
let css = fs.readFileSync('css/redesign.css', 'utf8').replace(/\r\n/g, '\n');

const oldCtrl = `.hud-top-ctrls {
  position: absolute !important;
  top: 0 !important;
  right: 0 !important;
  left: auto !important;
  bottom: auto !important;
  margin: 0 !important;
  pointer-events: auto !important;
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: flex-end !important;
  gap: 8px !important;
  z-index: 1000 !important;
}`;

const newCtrl = `.hud-top-ctrls {
  position: static !important;
  top: auto !important;
  right: auto !important;
  left: auto !important;
  bottom: auto !important;
  margin: 6px auto 0 auto !important;
  pointer-events: auto !important;
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 12px !important;
  z-index: 1000 !important;
}`;

if (css.includes(oldCtrl)) {
  css = css.replace(oldCtrl, newCtrl);
  fs.writeFileSync('css/redesign.css', css, 'utf8');
  console.log('Successfully centered hud-top-ctrls under scoreboard in css/redesign.css!');
} else {
  console.warn('oldCtrl not matched in css/redesign.css');
}
