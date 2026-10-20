const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

const targets = [
  {
    name: 'prompt4_shop_coins_packages_desktop.png',
    url: 'http://localhost:8099/index.html?page=shop&cat=coins',
    size: '1280,800'
  },
  {
    name: 'prompt4_bundle_modal_desktop.png',
    url: 'http://localhost:8099/index.html?page=shop&openbundle=bundle_footy_starter',
    size: '1280,800'
  },
  {
    name: 'prompt4_battlepass_apollo_mobile.png',
    url: 'http://localhost:8099/index.html?page=battlepass&lvl=20',
    size: '375,667'
  },
  {
    name: 'prompt4_inventory_owned_mobile.png',
    url: 'http://localhost:8099/index.html?page=characters&char=footy&slot=skins',
    size: '375,667'
  }
];

console.log('Capturing Prompt 4 visual proofs with Headless Chrome...');

targets.forEach(t => {
  const outPath = path.join(artifactDir, t.name);
  console.log(`\n• Capturing ${t.name} (${t.size})...`);
  try {
    execFileSync(chromePath, [
      '--headless=new',
      `--screenshot=${outPath}`,
      `--window-size=${t.size}`,
      '--hide-scrollbars',
      '--virtual-time-budget=3000',
      t.url
    ]);
    if (fs.existsSync(outPath)) {
      console.log(`  ✓ Saved ${t.name} (${fs.statSync(outPath).size} bytes)`);
    } else {
      console.error(`  ✗ Output file not found: ${outPath}`);
    }
  } catch (err) {
    console.error(`  ✗ Failed capturing ${t.name}:`, err.message);
  }
});

console.log('\nAll visual proofs captured.');
