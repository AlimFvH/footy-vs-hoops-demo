const fs = require('fs');
console.log(fs.readFileSync('scripts/capture_studio_showcase.cjs', 'utf8').substring(0, 1500));
