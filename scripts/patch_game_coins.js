const fs = require('fs');
const path = require('path');

const gamePath = path.resolve('js/game.js');
let code = fs.readFileSync(gamePath, 'utf8');

// Replace post-match coin chip
code = code.replace(
  "(0, dom_js_6.h)('span', { class: 'chip gold' }, '🪙 ', (0, index_js_7.t)('result.coins', { n: rewards.coins }))",
  "(0, dom_js_6.h)('span', { class: 'chip gold' }, (0, dom_js_6.h)('span', { class: 'w-ico' }), ' ', (0, index_js_7.t)('result.coins', { n: rewards.coins }))"
);

// Replace post-match toast
code = code.replace(
  "`+${rewards.coins} 🪙`",
  "`+${rewards.coins} FvH Coin`"
);

// Replace rewardChips in quests
code = code.replace(
  "(0, dom_js_5.h)('span', { class: 'rw coin' }, `🪙 ${r.coins}`)",
  "(0, dom_js_5.h)('span', { class: 'rw coin' }, (0, dom_js_5.h)('span', { class: 'w-ico' }), ` ${r.coins}`)"
);

code = code.replace(
  "(0, dom_js_5.h)('span', { class: 'rw coin' }, `🪙 ${q.coins}`)",
  "(0, dom_js_5.h)('span', { class: 'rw coin' }, (0, dom_js_5.h)('span', { class: 'w-ico' }), ` ${q.coins}`)"
);

fs.writeFileSync(gamePath, code);

new Function(fs.readFileSync(gamePath, 'utf8'));
console.log('Successfully patched js/game.js with w-ico coin elements!');
