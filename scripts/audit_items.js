const fs = require('fs');

const redesign = fs.readFileSync('js/redesign.js', 'utf8');
const game = fs.readFileSync('js/game.js', 'utf8');
const server = fs.readFileSync('server/server.js', 'utf8');

console.log('=== FOOTY vs HOOPS Complete Item Catalog Audit ===');

// Let's inspect renderItemArtwork in js/redesign.js
const renderFnMatch = redesign.match(/function renderItemArtwork\s*\([^)]*\)\s*\{([\s\S]*?)\nfunction /);
console.log('renderItemArtwork exists:', !!renderFnMatch);

// Let's find all items in CATALOG array in redesign.js
const allItems = [];
const itemRegex = /\{\s*id:\s*['"]([^'"]+)['"],\s*name:\s*['"]([^'"]+)['"],\s*category:\s*['"]([^'"]+)['"](?:,\s*mode:\s*['"]([^'"]+)['"])?(?:,\s*rarity:\s*['"]([^'"]+)['"])?/g;
let match;
while ((match = itemRegex.exec(redesign)) !== null) {
  allItems.push({
    id: match[1],
    name: match[2],
    category: match[3],
    mode: match[4] || 'shared',
    rarity: match[5] || 'common'
  });
}

console.log(`Found ${allItems.length} items in CATALOG array in js/redesign.js`);

// Group by category
const byCat = {};
for (const it of allItems) {
  byCat[it.category] = byCat[it.category] || [];
  byCat[it.category].push(it);
}

for (const cat in byCat) {
  console.log(`\nCategory: ${cat} (${byCat[cat].length} items):`);
  byCat[cat].forEach(it => {
    console.log(`  - [${it.id}] ${it.name} (${it.rarity}, mode: ${it.mode})`);
  });
}

// Check other items: Bundles, Currency packs, Battle Pass VIP, etc.
console.log('\n--- Shop Bundles & Currency Packages ---');
const bundles = [];
for (const m of redesign.matchAll(/id:\s*['"](bundle_[^'"]+|pkg_[^'"]+|battlepass[^'"]*)['"]/g)) {
  if (!bundles.includes(m[1])) bundles.push(m[1]);
}
console.log('Special items / packs:', bundles);
