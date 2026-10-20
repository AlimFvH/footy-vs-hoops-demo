const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

// Capture taller mobile screenshot (375x1200) to see both featured and the full catalogue grid with scenic stadiums
const targets = [
  { name: 'screenshot_shop_stadiums_full.png', url: 'http://localhost:8099/index.html?page=shop&cat=stadiums', size: '375,1000' },
  { name: 'screenshot_quests_social_full.png', url: 'http://localhost:8099/index.html?page=quests&tab=social', size: '375,1000' },
  { name: 'screenshot_wardrobe_footy_full.png', url: 'http://localhost:8099/index.html?page=characters&char=footy&slot=skins', size: '375,900' }
];

targets.forEach(t => {
  const outPath = path.join(artifactDir, t.name);
  console.log(`Capturing ${t.name} (${t.size})...`);
  try {
    execFileSync(chromePath, [
      '--headless=new',
      `--screenshot=${outPath}`,
      `--window-size=${t.size}`,
      '--hide-scrollbars',
      '--virtual-time-budget=2500',
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
