const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

const targets = [
  {
    name: 'proof_fixed_rivalry_modal.png',
    url: 'http://localhost:8099/index.html?openrivalry=1&lang=ru',
    size: '375,812',
    delay: '2500'
  },
  {
    name: 'proof_fixed_arena_shop_cards.png',
    url: 'http://localhost:8099/index.html?page=shop&cat=stadiums&lang=ru',
    size: '800,600',
    delay: '2500'
  },
  {
    name: 'proof_fixed_arena_mobile_grid.png',
    url: 'http://localhost:8099/index.html?page=shop&cat=stadiums&lang=ru',
    size: '375,812',
    delay: '2500'
  },
  {
    name: 'proof_fixed_quickmatch_footy.png',
    url: 'http://localhost:8099/index.html?page=mode&quicksearch=1&char=footy&lang=ru',
    size: '375,812',
    delay: '2500'
  },
  {
    name: 'proof_fixed_quickmatch_hoops.png',
    url: 'http://localhost:8099/index.html?page=mode&quicksearch=1&char=hoops&lang=ru',
    size: '375,812',
    delay: '2500'
  },
  {
    name: 'proof_fixed_payment_modal.png',
    url: 'http://localhost:8099/index.html?page=battlepass&opencheckout=bp&lang=ru',
    size: '375,812',
    delay: '2500'
  }
];

targets.forEach(t => {
  const outPath = path.join(artifactDir, t.name);
  console.log(`Capturing ${t.name}...`);
  try {
    execFileSync(chromePath, [
      '--headless=new',
      `--screenshot=${outPath}`,
      `--window-size=${t.size}`,
      '--hide-scrollbars',
      `--virtual-time-budget=${t.delay}`,
      t.url
    ]);
    if (fs.existsSync(outPath)) {
      console.log(`✓ Saved ${t.name} (${fs.statSync(outPath).size} bytes)`);
    } else {
      console.error(`✗ File not created: ${outPath}`);
    }
  } catch (err) {
    console.error(`Error capturing ${t.name}:`, err.message);
  }
});

console.log('Capture finished.');
