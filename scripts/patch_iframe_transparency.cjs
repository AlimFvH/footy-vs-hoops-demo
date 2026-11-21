const fs = require('fs');
let code = fs.readFileSync('js/redesign.js', 'utf8');

const target = `'<iframe class="fvh-3d-athlete-frame" data-hero="'`;
const replacement = `'<iframe class="fvh-3d-athlete-frame" allowtransparency="true" data-hero="'`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('js/redesign.js', code, 'utf8');
  console.log('Added allowtransparency to iframe in js/redesign.js');
} else {
  console.log('Target iframe tag not found');
}
