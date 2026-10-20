const fs = require('fs');

const redesign = fs.readFileSync('js/redesign.js', 'utf8');
const game = fs.readFileSync('js/game.js', 'utf8');
const server = fs.readFileSync('server/server.js', 'utf8');

// Collect all known item IDs across the codebase
const itemsMap = new Map();

function addItem(id, cat, name, meta = {}) {
  if (!id) return;
  id = String(id).trim();
  if (!itemsMap.has(id)) {
    itemsMap.set(id, { id, cat, name: name || id, ...meta });
  } else {
    const existing = itemsMap.get(id);
    if (!existing.name || existing.name === id) existing.name = name || id;
    if (!existing.cat) existing.cat = cat;
  }
}

// 1. From exports.ITEMS in js/game.js
const itemRegex = /id:\s*['"]([a-zA-Z0-9_\-\.]+)['"],\s*(?:category:\s*['"]([^'"]+)['"],\s*)?(?:slot:\s*['"]([^'"]+)['"],\s*)?(?:mode:\s*['"]([^'"]+)['"],\s*)?name:\s*['"]([^'"]+)['"]/g;
let m;
while ((m = itemRegex.exec(game)) !== null) {
  addItem(m[1], m[2] || m[3], m[5], { mode: m[4] || 'shared' });
}

// Skins from skin() function in game.js: skin('skin_id', 'Name', ...)
const skinRegex = /skin\(\s*['"]([^'"]+)['"],\s*['"]([^'"]+)['"]/g;
while ((m = skinRegex.exec(game)) !== null) {
  addItem(m[1], 'skins', m[2]);
}

// 2. From server.js PRODUCT_CATALOG
const prodRegex = /['"]([a-zA-Z0-9_\-]+)['"]:\s*\{[\s\S]*?name:\s*['"]([^'"]+)['"]/g;
while ((m = prodRegex.exec(server)) !== null) {
  const id = m[1];
  const name = m[2];
  let cat = 'shop';
  if (id.startsWith('pkg_coins_')) cat = 'coins';
  else if (id.startsWith('bundle_')) cat = 'bundles';
  else if (id.startsWith('battlepass')) cat = 'battlepass';
  addItem(id, cat, name);
}

// 3. From redesign.js BP rewards
const bpRewardRegex = /(?:freeReward|premiumReward)\s*=\s*\{\s*type:\s*['"]([^'"]+)['"],\s*name:\s*['"]([^'"]+)['"](?:,\s*icon:\s*['"][^'"]+['"])?,\s*itemId:\s*['"]([^'"]+)['"]/g;
while ((m = bpRewardRegex.exec(redesign)) !== null) {
  const type = m[1];
  const name = m[2];
  const id = m[3];
  let cat = type;
  if (id.startsWith('skin_')) cat = 'skins';
  else if (id.startsWith('ball_')) cat = 'balls';
  else if (id.startsWith('std_')) cat = 'stadiums';
  else if (id.startsWith('boost_')) cat = 'boosts';
  else if (id.startsWith('trail_')) cat = 'trails';
  addItem(id, cat, name);
}

// 4. Boosts
const boosts = [
  { id: 'boost_turbo', name: 'Turbo Boots', cat: 'boosts' },
  { id: 'boost_lungs', name: 'Iron Lungs', cat: 'boosts' },
  { id: 'boost_power', name: 'Sharp Shooter', cat: 'boosts' },
  { id: 'boost_coins', name: 'Coin Doubler', cat: 'boosts' },
  { id: 'boost_overdrive', name: 'Overdrive', cat: 'boosts' },
  { id: 'boost_shield', name: 'Energy Shield', cat: 'boosts' },
  { id: 'boost_magnet', name: 'Ball Magnet', cat: 'boosts' },
  { id: 'boost_golden', name: 'Golden Strike', cat: 'boosts' }
];
boosts.forEach(b => addItem(b.id, b.cat, b.name));

console.log('Total catalog items indexed:', itemsMap.size);

const list = Array.from(itemsMap.values()).sort((a, b) => (a.cat || '').localeCompare(b.cat || '') || a.id.localeCompare(b.id));

const byCategory = {};
list.forEach(it => {
  const c = it.cat || 'other';
  byCategory[c] = byCategory[c] || [];
  byCategory[c].push(it);
});

for (const cat in byCategory) {
  console.log(`\n=== Category: ${cat.toUpperCase()} (${byCategory[cat].length} items) ===`);
  byCategory[cat].forEach(it => {
    console.log(`  [${it.id}] "${it.name}"`);
  });
}
