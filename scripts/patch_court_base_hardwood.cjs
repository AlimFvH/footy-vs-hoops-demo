const fs = require('fs');
const path = require('path');

const gameJsPath = path.join(__dirname, '../js/game.js');
let code = fs.readFileSync(gameJsPath, 'utf8');

// 1. In shop items: std_hoops_street
code = code.replace(
  "visual: Object.assign(Object.assign({}, COURT_BASE), { woodA: 0x141824, woodB: 0x1a2032 })",
  "visual: Object.assign(Object.assign({}, COURT_BASE), { woodA: 0xd99557, woodB: 0xe8a968 })"
);

// 2. In matchview default fallback
code = code.replace(
  "woodA: 0x141824, woodB: 0x1a2032",
  "woodA: 0xd99557, woodB: 0xe8a968"
);

fs.writeFileSync(gameJsPath, code, 'utf8');
console.log('✓ Successfully updated std_hoops_street to golden maple hardwood!');
