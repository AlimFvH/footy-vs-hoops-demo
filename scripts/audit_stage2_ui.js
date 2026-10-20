const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

// All screens required by Stage 2 specification
const auditScreens = [
  // 1. Main Menu
  { id: 'menu_mobile', url: 'http://localhost:8099/index.html?page=menu', size: '375,667', name: 'Main Menu (Mobile 375x667)' },
  { id: 'menu_desktop', url: 'http://localhost:8099/index.html?page=menu', size: '1280,800', name: 'Main Menu (Desktop 1280x800)' },

  // 2. Mode Selection & Modals
  { id: 'mode_select_mobile', url: 'http://localhost:8099/index.html?page=mode', size: '375,667', name: 'Mode Selection (Mobile)' },
  { id: 'mode_quick_search', url: 'http://localhost:8099/index.html?page=mode&quicksearch=1', size: '375,667', name: 'Quick Match Radar Modal' },
  { id: 'mode_private_room', url: 'http://localhost:8099/index.html?page=mode&privateroom=1', size: '375,667', name: 'Private Room Host/Join Modal' },

  // 3. Characters & Wardrobe
  { id: 'char_footy_mobile', url: 'http://localhost:8099/index.html?page=characters&char=footy', size: '375,667', name: 'FOOTY Locker (Mobile)' },
  { id: 'char_hoops_mobile', url: 'http://localhost:8099/index.html?page=characters&char=hoops', size: '375,667', name: 'HOOPS Locker (Mobile)' },
  { id: 'char_footy_desktop', url: 'http://localhost:8099/index.html?page=characters&char=footy', size: '1280,800', name: 'FOOTY Locker (Desktop)' },

  // 4. Shop & Bundles
  { id: 'shop_featured_mobile', url: 'http://localhost:8099/index.html?page=shop', size: '375,667', name: 'Shop Featured (Mobile)' },
  { id: 'shop_bundles_mobile', url: 'http://localhost:8099/index.html?page=shop&cat=bundles', size: '375,667', name: 'Shop Bundles (Mobile)' },
  { id: 'shop_bundle_inspector', url: 'http://localhost:8099/index.html?page=shop&cat=bundles&openbundle=bundle_footy_starter', size: '375,667', name: 'Bundle Inspector Modal' },
  { id: 'shop_bundles_desktop', url: 'http://localhost:8099/index.html?page=shop&cat=bundles', size: '1280,800', name: 'Shop Bundles (Desktop)' },

  // 5. Arenas Gallery (10 Distinct World Environments)
  { id: 'arenas_mobile', url: 'http://localhost:8099/index.html?page=arenas', size: '375,667', name: 'Arenas Gallery (Mobile)' },
  { id: 'arenas_desktop', url: 'http://localhost:8099/index.html?page=arenas', size: '1280,800', name: 'Arenas Gallery (Desktop)' },

  // 6. Quests (3 Categories)
  { id: 'quests_gameplay_mobile', url: 'http://localhost:8099/index.html?page=quests&tab=gameplay', size: '375,667', name: 'Gameplay Quests (Mobile)' },
  { id: 'quests_social_mobile', url: 'http://localhost:8099/index.html?page=quests&tab=social', size: '375,667', name: 'Social Quests (Mobile)' },
  { id: 'quests_referrals_mobile', url: 'http://localhost:8099/index.html?page=quests&tab=referrals', size: '375,667', name: 'Referral Hub (Mobile)' },
  { id: 'quests_desktop', url: 'http://localhost:8099/index.html?page=quests&tab=gameplay', size: '1280,800', name: 'Quests (Desktop)' },

  // 7. Battle Pass & Checkout
  { id: 'bp_dual_mobile', url: 'http://localhost:8099/index.html?page=battlepass', size: '375,667', name: 'Battle Pass (Mobile)' },
  { id: 'bp_checkout_modal', url: 'http://localhost:8099/index.html?page=battlepass&opencheckout=bp', size: '375,667', name: 'Battle Pass Checkout Modal' },
  { id: 'bp_dual_desktop', url: 'http://localhost:8099/index.html?page=battlepass', size: '1280,800', name: 'Battle Pass (Desktop)' },

  // 8. Profile & Progression
  { id: 'profile_mobile', url: 'http://localhost:8099/index.html?page=profile', size: '375,667', name: 'Player Profile (Mobile)' },
  { id: 'profile_desktop', url: 'http://localhost:8099/index.html?page=profile', size: '1280,800', name: 'Player Profile (Desktop)' },

  // 9. Settings & Localization
  { id: 'settings_mobile', url: 'http://localhost:8099/index.html?page=settings', size: '375,667', name: 'Settings (Mobile)' },
  { id: 'settings_desktop', url: 'http://localhost:8099/index.html?page=settings', size: '1280,800', name: 'Settings (Desktop)' }
];

console.log('=== Starting Stage 2 Complete Interface Visual & Usability Audit ===');
console.log(`Auditing ${auditScreens.length} total view configurations...\n`);

const results = [];

auditScreens.forEach((scr, idx) => {
  const screenshotFileName = `audit_stage2_${scr.id}.png`;
  const screenshotPath = path.join(artifactDir, screenshotFileName);
  console.log(`[${idx + 1}/${auditScreens.length}] Auditing: ${scr.name} (${scr.size})...`);

  try {
    execFileSync(chromePath, [
      '--headless=new',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      `--window-size=${scr.size}`,
      '--virtual-time-budget=2500',
      `--screenshot=${screenshotPath}`,
      scr.url
    ]);

    const exists = fs.existsSync(screenshotPath);
    const size = exists ? fs.statSync(screenshotPath).size : 0;
    console.log(`  ✓ Captured ${screenshotFileName} (${size} bytes)`);

    results.push({
      id: scr.id,
      name: scr.name,
      size: scr.size,
      status: size > 10000 ? 'PASS' : 'WARN_SMALL',
      bytes: size,
      file: screenshotFileName
    });
  } catch (err) {
    console.error(`  ✗ Error auditing ${scr.name}:`, err.message);
    results.push({
      id: scr.id,
      name: scr.name,
      size: scr.size,
      status: 'FAIL',
      error: err.message
    });
  }
});

console.log('\n=== Summary of Captured Screens ===');
results.forEach(r => {
  console.log(`[${r.status}] ${r.name}: ${r.bytes ? r.bytes + ' bytes' : r.error}`);
});

fs.writeFileSync('temp_build/audit_results.json', JSON.stringify(results, null, 2));
console.log('\nAudit screenshots written to artifacts.');
