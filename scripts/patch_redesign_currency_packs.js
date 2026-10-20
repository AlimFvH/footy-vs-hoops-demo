const fs = require('fs');
const path = require('path');

const redesignPath = path.resolve('js/redesign.js');
let code = fs.readFileSync(redesignPath, 'utf8');

// 1. In coins tab notice banner, replace 🪙 with getFvhCoinSvg('thumb')
code = code.replace(
  "'  <span style=\"font-size:32px;\">🪙</span>' +",
  "'  <div style=\"width:44px;height:44px;display:flex;align-items:center;justify-content:center;flex-shrink:0;\">' + getFvhCoinSvg('thumb') + '</div>' +"
);

// 2. In currency package card, replace pkg.icon with renderItemArtwork(pkg.id, 'thumb')
code = code.replace(
  "'<div class=\"fvh-card-thumb-wrap\" style=\"height:76px;display:flex;align-items:center;justify-content:center;\">' +\n            '  <div style=\"font-size:42px;\">' + pkg.icon + '</div>' +\n            '</div>' +",
  "'<div class=\"fvh-card-thumb-wrap\" style=\"height:76px;display:flex;align-items:center;justify-content:center;\">' +\n            '  <div style=\"width:72px;height:72px;display:flex;align-items:center;justify-content:center;\">' + renderItemArtwork(pkg.id, 'thumb') + '</div>' +\n            '</div>' +"
);

// Also handle single-line formatting of thumb wrap if present
code = code.replace(
  "'  <div style=\"font-size:42px;\">' + pkg.icon + '</div>'",
  "'  <div style=\"width:72px;height:72px;display:flex;align-items:center;justify-content:center;\">' + renderItemArtwork(pkg.id, 'thumb') + '</div>'"
);

// 3. In CURRENCY_PACKAGES, update definitions so icon is rendered with SVG
code = code.replace(
  "icon: '🪙',\n      badge: 'STARTER',",
  "icon: '🪙',\n      badge: 'STARTER',\n      type: 'coins',"
);

// 4. In quest hub missions, replace any remaining 🪙
code = code.replace(
  "btn.textContent = tr('claim') + ' 🪙 ' + task.coins;",
  "btn.innerHTML = tr('claim') + ' ' + getFvhCoinSvg('inline') + ' ' + task.coins;"
);

code = code.replace(
  "buyBtn.textContent = tr('buyFor') + ' 🪙 ' + item.price;",
  "buyBtn.innerHTML = tr('buyFor') + ' ' + getFvhCoinSvg('inline') + ' ' + item.price;"
);

code = code.replace(
  "buyPackBtn.textContent = '🪙 ' + pk.price;",
  "buyPackBtn.innerHTML = getFvhCoinSvg('inline') + ' ' + pk.price;"
);

code = code.replace(
  "'<div class=\"fvh-prime-reward\">🎁 1,950 🪙</div>'",
  "'<div class=\"fvh-prime-reward\">🎁 1,950 ' + getFvhCoinSvg('inline') + '</div>'"
);

fs.writeFileSync(redesignPath, code);

new Function(fs.readFileSync(redesignPath, 'utf8'));
console.log('Successfully updated js/redesign.js currency packages & banners!');
