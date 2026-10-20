const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

const targets = [
  {
    name: 'screenshot_football_arena_ad_boards.png',
    url: 'http://localhost:8099/index.html?launch=footy',
    size: '1280,800',
    delay: '4000'
  },
  {
    name: 'screenshot_basketball_arena_ad_boards.png',
    url: 'http://localhost:8099/index.html?launch=hoops',
    size: '1280,800',
    delay: '4000'
  },
  {
    name: 'screenshot_bundle_inspector_modal.png',
    url: 'http://localhost:8099/index.html?page=shop&cat=bundles&openbundle=bundle_footy_starter',
    size: '375,667',
    delay: '3000'
  },
  {
    name: 'screenshot_battlepass_checkout_modal.png',
    url: 'http://localhost:8099/index.html?page=battlepass&opencheckout=bp',
    size: '375,667',
    delay: '3000'
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
