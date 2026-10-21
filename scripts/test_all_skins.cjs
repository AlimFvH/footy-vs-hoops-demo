const fs = require('fs');

// We will test all skins in data/shop to ensure Character instantiates with every single one of them without any crash!
global.window = { __boot: () => {} };
global.document = {
  createElement: () => ({
    getContext: () => ({
      createRadialGradient: () => ({ addColorStop: () => {} }),
      createLinearGradient: () => ({ addColorStop: () => {} }),
      fillRect: () => {},
      beginPath: () => {},
      arc: () => {},
      fill: () => {},
      stroke: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      measureText: () => ({ width: 10 })
    })
  })
};

let defineMap = {};
global.define = (name, deps, fn) => {
  defineMap[name] = { deps, fn };
};
global.__importStar = (o) => o;

const code = fs.readFileSync('js/game.js', 'utf8');
eval(code);

function getMod(name) {
  const d = defineMap[name];
  if (!d) throw new Error('Not found: ' + name);
  const exports = {};
  const resolved = d.deps.map(dep => {
    if (dep === 'require') return (n) => getMod(n);
    if (dep === 'exports') return exports;
    return getMod(dep);
  });
  d.fn.apply(null, resolved);
  return exports;
}

const shopMod = getMod('data/shop');
const charMod = getMod('render/characters');

console.log('Testing Character instantiation for all shop skins...');
const dummyAgent = { human: true, x: 0, z: 0, vx: 0, vz: 0, fx: 0, fz: 1, runPhase: 0, kickT: 0, shotT: 0, jumpT: 0, celebrateT: 0, tackle: { phase: 'idle' }, diveT: 0, stun: 0 };

const skins = shopMod.ITEMS.filter(it => it.category === 'skins');
console.log('Found ' + skins.length + ' skins to test:');

skins.forEach(s => {
  const char = new charMod.Character(dummyAgent, s.visual, 'footy', 1.0, 1);
  char.update(0.016, false, null);
  const charH = new charMod.Character(dummyAgent, s.visual, 'hoops', 1.0, 1);
  charH.update(0.016, true, null);
  console.log(`[PASS] Skin: ${s.id} (${s.name}) - Footy & Hoops render OK!`);
});

const texMod = getMod('render/textures');
console.log('Testing makeBallTexture for all shop balls...');
const balls = shopMod.ITEMS.filter(it => it.category === 'balls');
balls.forEach(b => {
  const tex = texMod.makeBallTexture(b.visual);
  console.log(`[PASS] Ball: ${b.id} (${b.name}) - Texture generated OK!`);
});

console.log('ALL SKINS AND BALLS TESTS PASSED!');
