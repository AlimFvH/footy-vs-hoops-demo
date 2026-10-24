const fs = require('fs');

const redesign = fs.readFileSync('js/redesign.js', 'utf8');
const game = fs.readFileSync('js/game.js', 'utf8');

const scenicArenas = [
  { id: 'std_ocean_sunset', name: 'Coastal Sunset Court', mode: 'footy' },
  { id: 'std_forest_redwood', name: 'Redwood Forest Arena', mode: 'hoops' },
  { id: 'std_space_orbit', name: 'Orbital Space Colosseum', mode: 'footy' },
  { id: 'std_mars_dome', name: 'Mars Bio-Dome Arena', mode: 'hoops' },
  { id: 'std_moon_crater', name: 'Apollo Lunar Arena', mode: 'footy' },
  { id: 'std_underwater_dome', name: 'Abyssal Ocean Dome', mode: 'hoops' },
  { id: 'std_cyber_megacity', name: 'Neo Tokyo Megacity', mode: 'footy' },
  { id: 'std_volcano_caldera', name: 'Magma Caldera Arena', mode: 'hoops' },
  { id: 'std_floating_islands', name: 'Aetheria Sky Islands', mode: 'footy' },
  { id: 'std_crystal_cavern', name: 'Prismatic Crystal Cave', mode: 'hoops' }
];

console.log('=== 1. SCENIC ARENAS (10/10) AUDIT ===');
const arenaResults = [];
for (const a of scenicArenas) {
  const inRedesign = redesign.includes(a.id);
  const inGameThemes = game.includes(`id: '${a.id}'`);
  // Check for 3D environment geometry / backdrop building
  const hasSkyBackdrop = game.includes(`id === '${a.id}'`);
  const hasArena3D = game.includes(`'${a.id}'`);
  
  const status = inRedesign && inGameThemes && hasSkyBackdrop;
  arenaResults.push({ ...a, inRedesign, inGameThemes, hasSkyBackdrop, status });
  console.log(`[${status ? 'PASS' : 'FAIL'}] ${a.id} (${a.name}) [${a.mode}] -> inRedesign:${inRedesign}, inGameThemes:${inGameThemes}, hasSkyBackdrop:${hasSkyBackdrop}`);
}

console.log('\n=== 2. BALLS AUDIT ===');
const balls = [
  { id: 'ball_footy_classic', mode: 'footy' },
  { id: 'ball_footy_plasma', mode: 'footy' },
  { id: 'ball_footy_gold', mode: 'footy' },
  { id: 'ball_footy_inferno', mode: 'footy' },
  { id: 'ball_hoops_street', mode: 'hoops' },
  { id: 'ball_hoops_blaze', mode: 'hoops' },
  { id: 'ball_hoops_chrome', mode: 'hoops' },
  { id: 'ball_hoops_midnight', mode: 'hoops' }
];
const ballResults = [];
for (const b of balls) {
  const inGame = game.includes(`id: '${b.id}'`);
  const inRedesign = redesign.includes(b.id);
  ballResults.push({ ...b, inGame, inRedesign, status: inGame && inRedesign });
  console.log(`[${inGame && inRedesign ? 'PASS' : 'FAIL'}] ${b.id} [${b.mode}] -> inGame:${inGame}, inRedesign:${inRedesign}`);
}

console.log('\n=== 3. SKINS & CHARACTERS AUDIT ===');
const skins = [
  { id: 'skin_rookie', sport: 'footy', default: true },
  { id: 'skin_solar', sport: 'hoops', default: true },
  { id: 'skin_neon_striker', sport: 'footy' },
  { id: 'skin_cyber_dunker', sport: 'hoops' },
  { id: 'skin_golden_legend', sport: 'both' }
];
const skinResults = [];
for (const s of skins) {
  const inGame = game.includes(s.id);
  const inRedesign = redesign.includes(s.id);
  skinResults.push({ ...s, inGame, inRedesign, status: inGame && inRedesign });
  console.log(`[${inGame && inRedesign ? 'PASS' : 'FAIL'}] ${s.id} -> inGame:${inGame}, inRedesign:${inRedesign}`);
}

// 4. Client manipulation test: Unowned items equip prevention
console.log('\n=== 4. SECURITY & CLIENT MANIPULATION (UNOWNED EQUIP REJECTION) ===');
// Let's check store.equip implementation in redesign.js
const equipCode = redesign.slice(redesign.indexOf('equip: function'), redesign.indexOf('equip: function') + 800);
const hasOwnershipCheck = equipCode.includes('owned') && (equipCode.includes('indexOf') || equipCode.includes('includes'));
console.log('Equip logic has ownership validation check:', hasOwnershipCheck);
console.log('Equip snippet:\n', equipCode.substring(0, 350));
