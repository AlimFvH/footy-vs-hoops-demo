const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

const targets = [
  { name: 'screenshot_inspector_ocean_court.png', url: 'http://localhost:8099/index.html?page=shop&cat=stadiums&inspect=std_ocean_sunset', size: '375,667' },
  { name: 'screenshot_inspector_forest_arena.png', url: 'http://localhost:8099/index.html?page=shop&cat=stadiums&inspect=std_forest_redwood', size: '375,667' }
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
      '--virtual-time-budget=2500',
      t.url
    ]);
    if (fs.existsSync(outPath)) {
      console.log(`✓ Saved ${t.name} (${fs.statSync(outPath).size} bytes)`);
    }
  } catch (err) {
    console.error(`Error capturing ${t.name}:`, err.message);
  }
});
