const fs = require('fs');
const path = require('path');

const redesignPath = path.resolve('js/redesign.js');
let code = fs.readFileSync(redesignPath, 'utf8');

// Replace bundle card prices
code = code.replace(
  "'🪙 ' + b.coinsPrice.toLocaleString() + ' · ' + b.starsPrice + ' ⭐'",
  "getFvhCoinSvg('inline') + ' ' + b.coinsPrice.toLocaleString() + ' · ' + b.starsPrice + ' ⭐'"
);

// Replace pack buy button
code = code.replace(
  "buyPackBtn.textContent = '🪙 ' + pk.price;",
  "buyPackBtn.innerHTML = getFvhCoinSvg('inline') + ' ' + pk.price;"
);

// Replace bundle card in other locations
code = code.replace(
  "'🪙 ' + b.coinsPrice.toLocaleString() + ' · ' + b.starsPrice + ' ⭐'",
  "getFvhCoinSvg('inline') + ' ' + b.coinsPrice.toLocaleString() + ' · ' + b.starsPrice + ' ⭐'"
);

// Replace arena buy button
code = code.replace(
  "btn.textContent = '🪙 ' + arena.price + ' · ' + tr('buyArenaBtn');",
  "btn.innerHTML = getFvhCoinSvg('inline') + ' ' + arena.price + ' · ' + tr('buyArenaBtn');"
);

// Replace home header gold coin pill
code = code.replace(
  "'<button class=\"fvh-pill gold\" id=\"fvh-btn-coins\" title=\"' + tr('shop') + '\">🪙 ' + (d.coins || 0) + '</button>'",
  "'<button class=\"fvh-pill gold\" id=\"fvh-btn-coins\" title=\"' + tr('shop') + '\">' + getFvhCoinSvg('inline') + ' ' + (d.coins || 0) + '</button>'"
);

// Replace mission reward coins in quests
code = code.replace(
  "'<div class=\"fvh-mission-reward\">🪙 ' + q.coins + ' · ' + q.xp + ' XP</div>'",
  "'<div class=\"fvh-mission-reward\">' + getFvhCoinSvg('inline') + ' ' + q.coins + ' · ' + q.xp + ' XP</div>'"
);

code = code.replace(
  "'<div class=\"fvh-mission-reward\">🪙 ' + task.coins + ' · ' + task.xp + ' XP</div>'",
  "'<div class=\"fvh-mission-reward\">' + getFvhCoinSvg('inline') + ' ' + task.coins + ' · ' + task.xp + ' XP</div>'"
);

code = code.replace(
  "'<div class=\"fvh-mission-reward\">🪙 ' + m.coins + '</div>'",
  "'<div class=\"fvh-mission-reward\">' + getFvhCoinSvg('inline') + ' ' + m.coins + '</div>'"
);

// Replace coin package badge
code = code.replace(
  "'  <span style=\"font-size:11px;font-weight:900;color:#fde047;\">🪙 +' + pkg.coinsAmount.toLocaleString() + '</span>'",
  "'  <span style=\"font-size:11px;font-weight:900;color:#fde047;display:inline-flex;align-items:center;gap:3px;\">' + getFvhCoinSvg('inline') + ' +' + pkg.coinsAmount.toLocaleString() + '</span>'"
);

fs.writeFileSync(redesignPath, code);

new Function(fs.readFileSync(redesignPath, 'utf8'));
console.log('Successfully updated all shop & UI coin icons to use getFvhCoinSvg(inline)!');
