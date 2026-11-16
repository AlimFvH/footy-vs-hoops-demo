const fs = require('fs');
const content = fs.readFileSync('js/game.js', 'utf8');

// Mock browser
global.window = global;
global.document = {
  getElementById: () => null,
  createElement: () => ({ getContext: () => ({}) })
};

eval(fs.readFileSync('js/module-loader.js', 'utf8'));

// Override __boot
window.__boot = () => {};

eval(content);

const sc = window.require('gfx/scene');
console.log('sc keys:', Object.keys(sc));
console.log('sc.Node:', typeof sc.Node);
