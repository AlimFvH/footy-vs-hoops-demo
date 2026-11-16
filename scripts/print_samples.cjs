const fs = require('fs');

for (const name of ['footy', 'hoops', 'keeper']) {
  const data = JSON.parse(fs.readFileSync(`scripts/samples_${name}.json`, 'utf8'));
  console.log(`\n================ ${name.toUpperCase()} ================`);
  // Print key samples
  let lastDiff = 0;
  for (let s of data.samples) {
    if (s.y % 10 === 0) {
      console.log(`y=${s.y.toString().padStart(3)}: RGB(${s.r.toString().padStart(3)}, ${s.g.toString().padStart(3)}, ${s.b.toString().padStart(3)})`);
    }
  }
}
