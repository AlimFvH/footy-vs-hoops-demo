const fs = require('fs');
const path = require('path');

const redesignPath = path.resolve('js/redesign.js');
let code = fs.readFileSync(redesignPath, 'utf8');

// Replace 🪙 in price labels with getFvhCoinSvg('inline')
code = code.replace(
  "priceLabel = '🪙 ' + it.price + (boostCharges > 0 ? ' · ' + tr('boostCharges', { n: boostCharges }) : '');",
  "priceLabel = getFvhCoinSvg('inline') + ' <span style=\"vertical-align:middle;margin-left:4px;\">' + it.price + '</span>' + (boostCharges > 0 ? ' · ' + tr('boostCharges', { n: boostCharges }) : '');"
);

code = code.replace(
  "priceLabel = isOwned ? tr('inCollection') : ('🪙 ' + it.price);",
  "priceLabel = isOwned ? tr('inCollection') : (getFvhCoinSvg('inline') + ' <span style=\"vertical-align:middle;margin-left:4px;\">' + it.price + '</span>');"
);

code = code.replace(
  "buyChargeBtn.textContent = tr('buyFor') + ' 🪙 ' + item.price + ' (+1 ' + tr('boostCharges', { n: 1 }) + ')';",
  "buyChargeBtn.innerHTML = tr('buyFor') + ' ' + getFvhCoinSvg('inline') + ' ' + item.price + ' (+1 ' + tr('boostCharges', { n: 1 }) + ')';"
);

code = code.replace(
  "tr('buyFor') + ' 🪙 ' + featuredItem.price",
  "tr('buyFor') + ' ' + getFvhCoinSvg('inline') + ' ' + featuredItem.price"
);

// Replace in bundle cards
code = code.replace(
  "'    <span style=\"font-weight:900;font-size:14px;color:#facc15;\">' + coinsPrice + ' 🪙</span>'",
  "'    <span style=\"font-weight:900;font-size:14px;color:#facc15;display:inline-flex;align-items:center;gap:4px;\">' + getFvhCoinSvg('inline') + ' ' + coinsPrice + '</span>'"
);

code = code.replace(
  "<span style=\"font-size:22px;\">🪙</span>",
  "' + getFvhCoinSvg('thumb') + '"
);

// Bundle modal buy button
code = code.replace(
  "buyBtn.innerHTML = tr('buyFor') + ' 🪙 ' + bundle.coinsPrice.toLocaleString()",
  "buyBtn.innerHTML = tr('buyFor') + ' ' + getFvhCoinSvg('inline') + ' ' + bundle.coinsPrice.toLocaleString()"
);

// Bundle modal items list
code = code.replace(
  "'+' + (it.val ? it.val + ' 🪙'",
  "'+' + (it.val ? it.val + ' ' + getFvhCoinSvg('inline')"
);

code = code.replace(
  "(bundle.originalValue ? bundle.originalValue.toLocaleString() : '') + ' 🪙</del> ➔ <b style=\"color:#fde047;\">' + bundle.coinsPrice.toLocaleString() + ' 🪙</b>'",
  "(bundle.originalValue ? bundle.originalValue.toLocaleString() : '') + '</del> ➔ <b style=\"color:#fde047;display:inline-flex;align-items:center;gap:3px;\">' + getFvhCoinSvg('inline') + ' ' + bundle.coinsPrice.toLocaleString() + '</b>'"
);

// Quest hub & prime rewards
code = code.replace(
  "'<div class=\"fvh-prime-reward\">🪙 250 + 100 XP</div>'",
  "'<div class=\"fvh-prime-reward\">' + getFvhCoinSvg('inline') + ' 250 + 100 XP</div>'"
);

code = code.replace(
  "tr('claim') + ' 🪙 250'",
  "tr('claim') + ' ' + getFvhCoinSvg('inline') + ' 250'"
);

fs.writeFileSync(redesignPath, code);

new Function(fs.readFileSync(redesignPath, 'utf8'));
console.log('Successfully replaced all shop emojis with inline FvH coin SVGs and validated JS syntax!');
