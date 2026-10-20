const assert = require('assert');

// Test the loot logic and duplicate prevention
function simulatePackDrop(ownedItems, packType) {
  var footyPool = [
    'skin_crimson', 'skin_neon', 'skin_frost', 'skin_shadow', 'skin_solar', 'skin_gold', 'skin_cyber', 'skin_sunset', 'skin_hydro',
    'ball_footy_plasma', 'ball_footy_gold', 'ball_footy_inferno', 'ball_footy_solar', 'ball_earthrise',
    'std_ocean_sunset', 'std_forest_redwood', 'std_footy_night', 'std_footy_golden', 'std_footy_neon',
    'cel_confetti', 'cel_fireworks', 'cel_flames',
    'trail_fire', 'trail_laser',
    'boost_turbo', 'boost_lungs', 'boost_power', 'boost_coins'
  ];

  var hoopsPool = [
    'skin_sunset', 'skin_hydro', 'skin_mars', 'skin_astronaut', 'skin_neon_elite',
    'ball_hoops_blaze', 'ball_hoops_chrome', 'ball_hoops_midnight', 'ball_tidal', 'ball_cyber_neon',
    'std_hoops_street', 'std_hoops_sky', 'std_hoops_neon', 'std_hoops_gold', 'std_ocean_sunset',
    'cel_shockwave', 'cel_goldrain', 'cel_lightning',
    'trail_ice', 'trail_rainbow',
    'boost_overdrive', 'boost_shield', 'boost_magnet', 'boost_golden'
  ];

  var clashPool = [
    'skin_gold', 'skin_cyber', 'skin_neon_elite', 'skin_astronaut', 'skin_shadow',
    'ball_footy_solar', 'ball_earthrise', 'ball_tidal', 'ball_cyber_neon', 'ball_hoops_chrome',
    'std_space_orbit', 'std_mars_dome', 'std_moon_crater', 'std_underwater_dome', 'std_cyber_megacity', 'std_volcano_caldera', 'std_floating_islands', 'std_crystal_cavern',
    'cel_goldrain', 'cel_lightning', 'cel_fireworks',
    'trail_rainbow', 'trail_laser',
    'frame_bronze', 'frame_diamond'
  ];

  var pool = packType === 'hoops' ? hoopsPool : (packType === 'clash' ? clashPool : footyPool);
  var fallbackCoinAmount = packType === 'clash' ? 600 : 300;

  var currentOwned = ownedItems.slice();
  var cardCount = packType === 'clash' ? 3 : 2;
  var drops = [];

  for (var c = 0; c < cardCount; c++) {
    var unowned = pool.filter(function(id) { return currentOwned.indexOf(id) === -1; });
    if (unowned.length > 0) {
      // Pick random unowned
      var pickedId = unowned[Math.floor(Math.random() * unowned.length)];
      currentOwned.push(pickedId);
      drops.push({ type: 'cosmetic', itemId: pickedId, isNew: true });
    } else {
      // Complete collection owned -> guaranteed coin fallback!
      drops.push({ type: 'coins', val: fallbackCoinAmount, isDuplicateFallback: true });
    }
  }

  return drops;
}

console.log('=== TESTING PACK LOOT & DUPLICATE PROTECTION ===');

// Case 1: Fresh player opens Footy pack
var freshOwned = ['skin_rookie', 'ball_footy_classic', 'std_footy_classic'];
var drops1 = simulatePackDrop(freshOwned, 'footy');
console.log('1. Fresh player drops:', drops1);
assert.strictEqual(drops1.length, 2, 'Should drop 2 cards');
assert(drops1[0].isNew, 'Card 1 should be an unowned new item');
assert(drops1[1].isNew, 'Card 2 should be an unowned new item');
assert(freshOwned.indexOf(drops1[0].itemId) === -1, 'Dropped item 1 must not be already owned');
assert(freshOwned.indexOf(drops1[1].itemId) === -1, 'Dropped item 2 must not be already owned');
assert.notStrictEqual(drops1[0].itemId, drops1[1].itemId, 'Both dropped items must be unique');
console.log('✓ PASS: Fresh player gets unique unowned items');

// Case 2: Player owns almost all items, only 1 item left
var almostAllOwned = [
  'skin_crimson', 'skin_neon', 'skin_frost', 'skin_shadow', 'skin_solar', 'skin_gold', 'skin_cyber', 'skin_sunset', 'skin_hydro',
  'ball_footy_plasma', 'ball_footy_gold', 'ball_footy_inferno', 'ball_footy_solar', 'ball_earthrise',
  'std_ocean_sunset', 'std_forest_redwood', 'std_footy_night', 'std_footy_golden', 'std_footy_neon',
  'cel_confetti', 'cel_fireworks', 'cel_flames',
  'trail_fire',
  'boost_turbo', 'boost_lungs', 'boost_power', 'boost_coins'
]; // missing only trail_laser!
var drops2 = simulatePackDrop(almostAllOwned, 'footy');
console.log('2. Almost full collection drops:', drops2);
assert.strictEqual(drops2[0].itemId, 'trail_laser', 'Card 1 must be the only missing unowned item');
assert.strictEqual(drops2[1].type, 'coins', 'Card 2 must fallback to FvH Coins because pool is exhausted');
assert.strictEqual(drops2[1].val, 300, 'Fallback coins must be 300');
assert(drops2[1].isDuplicateFallback, 'Must be marked as duplicate fallback');
console.log('✓ PASS: Exhausted pool converts to FvH Coins fallback');

// Case 3: Player owns 100% of the pool
var fullOwned = almostAllOwned.concat(['trail_laser']);
var drops3 = simulatePackDrop(fullOwned, 'footy');
console.log('3. 100% owned drops:', drops3);
assert.strictEqual(drops3[0].type, 'coins', 'Card 1 must be coins');
assert.strictEqual(drops3[1].type, 'coins', 'Card 2 must be coins');
assert.strictEqual(drops3[0].val, 300);
assert.strictEqual(drops3[1].val, 300);
console.log('✓ PASS: 100% owned player receives coins for all cards');

console.log('\n🎉 ALL PACK LOOT LOGIC TESTS PASSED!');
