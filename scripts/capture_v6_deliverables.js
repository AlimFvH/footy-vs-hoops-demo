const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

const targets = [
  // 1. Dual-Track Battle Pass (iPhone SE & Desktop)
  {
    name: 'screenshot_battlepass_dual_track_iphone_se.png',
    url: 'http://localhost:8099/index.html?page=battlepass',
    size: '375,667',
    delay: '2500'
  },
  {
    name: 'screenshot_battlepass_dual_track_desktop.png',
    url: 'http://localhost:8099/index.html?page=battlepass',
    size: '1280,800',
    delay: '2500'
  },
  // 2. Battle Pass VIP Checkout Modal with Stars & TON
  {
    name: 'screenshot_battlepass_checkout_modal.png',
    url: 'http://localhost:8099/index.html?page=battlepass&opencheckout=bp',
    size: '375,667',
    delay: '3000'
  },
  // 3. Shop Bundles Tab (iPhone SE & Desktop)
  {
    name: 'screenshot_shop_bundles_iphone_se.png',
    url: 'http://localhost:8099/index.html?page=shop&cat=bundles',
    size: '375,667',
    delay: '2500'
  },
  {
    name: 'screenshot_shop_bundles_desktop.png',
    url: 'http://localhost:8099/index.html?page=shop&cat=bundles',
    size: '1280,800',
    delay: '2500'
  },
  // 4. Bundle Inspector & Payment Options Modal
  {
    name: 'screenshot_bundle_inspector_modal.png',
    url: 'http://localhost:8099/index.html?page=shop&cat=bundles&openbundle=bundle_footy_starter',
    size: '375,667',
    delay: '3000'
  }
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
