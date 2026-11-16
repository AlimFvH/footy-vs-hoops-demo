const fs = require('fs');
console.log(fs.readFileSync('character_studio.html', 'utf8').substring(0, 1500));
