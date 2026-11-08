const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const htmlPath = path.join(ROOT, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const s1 = '  <script src="js/game.js?v=3.2.0-fortnite-hyper"></script>';
const s2 = '  <script src="assets/loaders/glb_loader.js?v=3.2.0-fortnite-hyper"></script>';
const s3 = '  <script src="render/characters_glb.js?v=3.2.0-fortnite-hyper"></script>';

// Reorder so loaders are before game.js
if (html.indexOf(s1) < html.indexOf(s2)) {
  const lines = html.split(/\r?\n/);
  const idx1 = lines.findIndex(l => l.includes('js/game.js'));
  const idx2 = lines.findIndex(l => l.includes('assets/loaders/glb_loader.js'));
  const idx3 = lines.findIndex(l => l.includes('render/characters_glb.js'));

  if (idx1 !== -1 && idx2 !== -1 && idx3 !== -1) {
    const l1 = lines[idx1];
    const l2 = lines[idx2];
    const l3 = lines[idx3];

    // Remove old positions
    lines.splice(idx3, 1);
    lines.splice(idx2, 1);
    lines.splice(idx1, 1);

    // Insert new order at idx1
    lines.splice(idx1, 0, l2, l3, l1);

    const isCRLF = html.includes('\r\n');
    fs.writeFileSync(htmlPath, lines.join(isCRLF ? '\r\n' : '\n'), 'utf8');
    console.log('Successfully reordered script tags in index.html!');
  }
} else {
  console.log('Script tags already in correct order.');
}
