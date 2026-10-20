const fs = require('fs');
const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div></body></html>', {
  runScripts: 'dangerously'
});
const { window } = dom;
const { document } = window;

// Attach mock globals
window.app = {
  store: {
    data: {
      bpXp: 0,
      coins: 500,
      owned: [],
      equipped: {},
      claimedFree: [],
      claimedPremium: []
    },
    update: function(fn) { fn(window.app.store.data); }
  },
  audio: { play: () => {} }
};

const redesignCode = fs.readFileSync('js/redesign.js', 'utf8');
window.eval(redesignCode);

// Call buildBattlePassPage
const bpContainer = window.buildBattlePassPage(window.app);
document.body.appendChild(bpContainer);

// Query Level 1 card
const firstCard = document.querySelector('.fvh-bp-dual-column');
if (firstCard) {
  console.log('Level 1 Column HTML:\n', firstCard.innerHTML);
} else {
  console.log('No firstCard found');
}
