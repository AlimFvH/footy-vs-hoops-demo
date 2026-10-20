const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

const targets = [
  { name: 'screenshot_menu_iphone_se.png', url: 'http://localhost:8099/index.html?page=menu', size: '375,667' },
  { name: 'screenshot_mode_select_iphone_se.png', url: 'http://localhost:8099/index.html?page=mode', size: '375,667' },
  { name: 'screenshot_arena_select_iphone_se.png', url: 'http://localhost:8099/index.html?page=arenas', size: '375,667' },
  { name: 'screenshot_arena_select_desktop.png', url: 'http://localhost:8099/index.html?page=arenas', size: '1280,800' },
  { name: 'screenshot_quests_gameplay_iphone_se.png', url: 'http://localhost:8099/index.html?page=quests&tab=gameplay', size: '375,667' },
  { name: 'screenshot_quests_social_iphone_se.png', url: 'http://localhost:8099/index.html?page=quests&tab=social', size: '375,667' },
  { name: 'screenshot_quests_referral_hub_iphone_se.png', url: 'http://localhost:8099/index.html?page=quests&tab=referrals', size: '375,667' },
  { name: 'screenshot_quests_gameplay_mobile_wide.png', url: 'http://localhost:8099/index.html?page=quests&tab=gameplay', size: '430,932' },
  { name: 'screenshot_quests_gameplay_desktop.png', url: 'http://localhost:8099/index.html?page=quests&tab=gameplay', size: '1280,800' },
  { name: 'screenshot_quick_match_radar.png', url: 'http://localhost:8099/index.html?page=mode&quicksearch=1', size: '375,667' },
  { name: 'screenshot_private_match_room.png', url: 'http://localhost:8099/index.html?page=mode&privateroom=1', size: '375,667' },
  { name: 'screenshot_menu_desktop.png', url: 'http://localhost:8099/index.html?page=menu', size: '1280,800' }
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
