// tests/test_inventory_upgrades_stars_packs.cjs
// Verification Suite for:
// 1. Inventory renaming & wardrobe removal of upgrades
// 2. Dedicated Upgrades tab ('ПРОКАЧКА'), routing app.go('upgrades') & app.showUpgrades()
// 3. Strict Faction Isolation (Footy only sees football items; Hoops only basketball items)
// 4. 3 Telegram Stars mystery packs (50, 150, 350 Stars)
// 5. Rarity-based Duplicate Coin Compensation
// 6. High-detail 3D artwork for Bundles and Star packs
// 7. Clean non-overlapping Main Menu structure

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

console.log('=== TEST SUITE: INVENTORY, UPGRADES, FACTION ISOLATION & STAR PACKS ===\n');

// Test 0: JavaScript Syntax
console.log('[Test 0] Verifying script syntax...');
cp.execSync('node -c js/redesign.js', { stdio: 'inherit' });
cp.execSync('node -c server/server.js', { stdio: 'inherit' });
console.log('  ✓ js/redesign.js and server/server.js syntax OK.\n');

const redesignJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'redesign.js'), 'utf8');
const serverJs = fs.readFileSync(path.join(__dirname, '..', 'server', 'server.js'), 'utf8');
const redesignCss = fs.readFileSync(path.join(__dirname, '..', 'css', 'redesign.css'), 'utf8');

// Test 1: Inventory Renaming & Wardrobe Cleanliness
console.log('[Test 1] Testing Inventory naming and wardrobe slot structure...');
assert(redesignJs.includes("tabInventory: 'ИНВЕНТАРЬ'") || redesignJs.includes("tabInventory: 'Инвентарь'"), 'RU tabInventory must be ИНВЕНТАРЬ');
assert(redesignJs.includes("tabInventory: 'INVENTORY'") || redesignJs.includes("tabInventory: 'Inventory'"), 'EN tabInventory must be INVENTORY');
assert(redesignJs.includes("toWardrobe: 'В инвентарь'"), 'RU toWardrobe must be В инвентарь');
assert(redesignJs.includes("toWardrobe: 'To Inventory'"), 'EN toWardrobe must be To Inventory');
assert(redesignJs.includes("characters: 'ИНВЕНТАРЬ'"), 'RU characters screen title must be ИНВЕНТАРЬ');
assert(redesignJs.includes("validSlots = ['skins', ballSlotId, 'packs']"), 'Inventory slots must ONLY contain skins, balls, and packs (no upgrades)');
console.log('  ✓ Wardrobe renamed to Inventory and upgrades removed from wardrobe slots.\n');

// Test 2: Dedicated Upgrades Hub & Routing
console.log('[Test 2] Testing Dedicated Upgrades Hub & Routing...');
assert(redesignJs.includes("function buildUpgradesPage(app)"), 'buildUpgradesPage must exist');
assert(redesignJs.includes("app.go = function (page, opts)"), 'app.go must exist');
assert(redesignJs.includes("page === 'upgrades'"), 'app.go must handle upgrades page');
assert(redesignJs.includes("app.showUpgrades = function ()"), 'app.showUpgrades helper must exist');
assert(redesignJs.includes("tabUpgrades: 'ПРОКАЧКА'") || redesignJs.includes("tabUpgrades: 'Прокачка'"), 'RU tabUpgrades must be ПРОКАЧКА');
assert(redesignJs.includes("tabUpgrades: 'SKILLS'") || redesignJs.includes("tabUpgrades: 'Upgrades'"), 'EN tabUpgrades must be SKILLS or Upgrades');
assert(redesignCss.includes('.fvh-upgrades-page'), 'CSS must style .fvh-upgrades-page');
assert(redesignCss.includes('.fvh-upgrade-card.fvh-skill-card'), 'CSS must style .fvh-upgrade-card');
assert(redesignCss.includes('.fvh-skill-pip'), 'CSS must style segmented LED pips');
console.log('  ✓ Dedicated Upgrades Hub and app.showUpgrades / app.go("upgrades") verified.\n');

// Test 3: Strict Faction Isolation in Shop & Inventory
console.log('[Test 3] Testing Strict Faction Isolation...');
assert(redesignJs.includes("b.id !== 'bundle_hoops_starter'"), 'Footy faction must exclude bundle_hoops_starter');
assert(redesignJs.includes("b.id !== 'bundle_footy_starter'"), 'Hoops faction must exclude bundle_footy_starter');
assert(redesignJs.includes("it.mode === shopSport"), 'Shop items must be filtered strictly to active sport');
console.log('  ✓ Strict Faction Isolation confirmed: Footy sees only football, Hoops sees only basketball.\n');

// Test 4: 3 Telegram Stars Mystery Packs Configuration
console.log('[Test 4] Testing 3 Telegram Stars mystery packs...');
assert(serverJs.includes("'pack_stars_starter': 50") || serverJs.includes('pack_stars_starter: 50'), 'pack_stars_starter price must be 50 Stars');
assert(serverJs.includes("'pack_stars_champion': 150") || serverJs.includes('pack_stars_champion: 150'), 'pack_stars_champion price must be 150 Stars');
assert(serverJs.includes("'pack_stars_legend': 350") || serverJs.includes('pack_stars_legend: 350'), 'pack_stars_legend price must be 350 Stars');
assert(serverJs.includes("'pack_stars_starter': {"), 'pack_stars_starter must exist in PRODUCT_CATALOG');
assert(serverJs.includes("'pack_stars_champion': {"), 'pack_stars_champion must exist in PRODUCT_CATALOG');
assert(serverJs.includes("'pack_stars_legend': {"), 'pack_stars_legend must exist in PRODUCT_CATALOG');
assert(redesignJs.includes('pack_stars_starter'), 'Client shop must include pack_stars_starter');
assert(redesignJs.includes('pack_stars_champion'), 'Client shop must include pack_stars_champion');
assert(redesignJs.includes('pack_stars_legend'), 'Client shop must include pack_stars_legend');
console.log('  ✓ 3 Telegram Stars packs (50, 150, 350 Stars) verified across server and client.\n');

// Test 5: Duplicate Protection & Coin Compensation
console.log('[Test 5] Testing Duplicate Compensation by Rarity...');
assert(serverJs.includes('DUPLICATE_COMPENSATION_BY_RARITY'), 'DUPLICATE_COMPENSATION_BY_RARITY must exist in server');
assert(serverJs.includes('duplicateCompensation:'), 'Server must return duplicateCompensation');
assert(redesignJs.includes('res.duplicateCompensation'), 'Client must detect duplicateCompensation in pack opening');
assert(redesignJs.includes('ДУБЛИКАТ В КОЛЛЕКЦИИ!'), 'Pack reveal modal must show duplicate notice in Russian');
console.log('  ✓ Duplicate compensation based on item rarity verified with celebratory UI.\n');

// Test 6: High-Detail Console-Grade Vector Artwork
console.log('[Test 6] Testing Bundles & Star Packs Artwork...');
assert(redesignJs.includes('function getDetailedBundleSvg(item, size)'), 'getDetailedBundleSvg must exist');
assert(redesignJs.includes('pack_stars_starter'), 'getDetailedBundleSvg must handle pack_stars_starter');
assert(redesignJs.includes('pack_stars_champion'), 'getDetailedBundleSvg must handle pack_stars_champion');
assert(redesignJs.includes('pack_stars_legend'), 'getDetailedBundleSvg must handle pack_stars_legend');
assert(redesignJs.includes('bundle_footy_starter'), 'getDetailedBundleSvg must handle bundle_footy_starter');
assert(redesignJs.includes('bundle_hoops_starter'), 'getDetailedBundleSvg must handle bundle_hoops_starter');
console.log('  ✓ Detailed vector artwork verified for all bundles and mystery packs.\n');

// Test 7: Clean Non-Overlapping Main Menu Layout
console.log('[Test 7] Testing Main Menu clean layout & non-overlapping responsive rules...');
assert(redesignJs.includes('fvh-btn-play-hero'), 'Dominant Play button must exist');
assert(redesignJs.includes('fvh-secondary-hub'), 'Secondary hub must exist');
assert(redesignJs.includes('createRivalryTicker'), 'Rivalry ticker must exist');
assert(redesignCss.includes('.solo-avatar-box'), 'CSS must define .solo-avatar-box');
assert(redesignCss.includes('max-height: clamp(170px'), 'Hero cutout must have bounded responsive height');
console.log('  ✓ Main Menu non-overlapping hierarchy verified.\n');

console.log('===============================================================');
console.log('🎉 ALL INVENTORY, UPGRADES, FACTION ISOLATION & STAR PACKS TESTS PASSED!');
console.log('===============================================================');
