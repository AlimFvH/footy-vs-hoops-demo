const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

// Script to trigger inspect modal for Coastal Sunset Court
const inspectHtml = `
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="css/style.css">
<link rel="stylesheet" href="css/redesign.css">
<script src="js/error-handler.js"></script>
<script src="js/module-loader.js"></script>
<script src="js/game.js"></script>
<script src="js/redesign.js"></script>
<script>
window.addEventListener('load', function() {
  setTimeout(function() {
    // Open inspector for Coastal Sunset Court
    const item = {
      id: 'std_ocean_sunset',
      category: 'stadiums',
      slot: 'stadium.footy',
      mode: 'footy',
      name: 'Coastal Sunset Court',
      rarity: 'epic',
      price: 580,
      icon: '🌅',
      desc: 'Полированный паркет и газон на фоне лазурного моря, заката с мягким солнцем и пальмами.'
    };
    // Click through or create inspector
    const allCards = document.querySelectorAll('.fvh-catalogue-card');
    for (let c of allCards) {
      if (c.textContent.includes('Прибрежный') || c.textContent.includes('Coastal')) {
        c.click();
        return;
      }
    }
  }, 1000);
});
</script>
</head>
<body>
</body>
</html>
`;

fs.writeFileSync('temp_inspect.html', inspectHtml);

const outPath = path.join(artifactDir, 'screenshot_inspector_ocean_court.png');
try {
  execFileSync(chromePath, [
    '--headless=new',
    `--screenshot=${outPath}`,
    '--window-size=375,667',
    '--hide-scrollbars',
    '--virtual-time-budget=3000',
    'http://localhost:8099/temp_inspect.html'
  ]);
  if (fs.existsSync(outPath)) {
    console.log(`✓ Saved screenshot_inspector_ocean_court.png (${fs.statSync(outPath).size} bytes)`);
  }
} catch (e) {
  console.error(e.message);
}
