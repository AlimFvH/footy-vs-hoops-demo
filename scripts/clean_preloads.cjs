const fs = require('fs');

const files = [
  'index.html',
  'C:/Users/ASUS/Desktop/FOOTY vs HOOPS/index.html'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let html = fs.readFileSync(f, 'utf8');
    html = html.replace(/\r?\n\s*<link rel="preload" href="assets\/characters\/[^"]+" as="fetch" crossorigin>/g, '');
    fs.writeFileSync(f, html, 'utf8');
    console.log('Cleaned preloads in', f);
  }
});
