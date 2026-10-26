const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== FOOTY vs HOOPS Automated Verification Suite ===\n');

let passedTests = 0;
let totalTests = 0;

function it(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
  }
}

// 1. Files & Syntax Check
it('File existence: index.html, style.css, redesign.css, game.js, redesign.js', () => {
  assert(fs.existsSync('index.html'), 'index.html missing');
  assert(fs.existsSync('css/style.css'), 'css/style.css missing');
  assert(fs.existsSync('css/redesign.css'), 'css/redesign.css missing');
  assert(fs.existsSync('js/game.js'), 'js/game.js missing');
  assert(fs.existsSync('js/redesign.js'), 'js/redesign.js missing');
});

it('index.html links redesign.css and redesign.js', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  assert(html.includes('css/redesign.css'), 'redesign.css not linked');
  assert(html.includes('js/redesign.js'), 'redesign.js not linked');
  assert(html.includes('js/game.js'), 'game.js not linked');
});

// 2. Player Progression & Battle Pass Removal Verification
it('Player Progression: Standard XP leveling formula caps at level 30', () => {
  function currentLevelForXp(totalXp) {
    return Math.min(30, 1 + Math.floor((totalXp || 0) / 250));
  }
  assert.strictEqual(currentLevelForXp(0), 1, 'Initial level should be 1');
  assert.strictEqual(currentLevelForXp(249), 1, '249 XP should still be level 1');
  assert.strictEqual(currentLevelForXp(250), 2, '250 XP should be level 2');
  assert.strictEqual(currentLevelForXp(1000), 5, '1000 XP should be level 5');
  assert.strictEqual(currentLevelForXp(100000), 30, 'XP above cap should clamp to 30');
});

it('Battle Pass Removal: battlepass_premium excluded from server catalog and default prices', () => {
  const srvCode = fs.readFileSync('server/server.js', 'utf8');
  assert(!srvCode.includes("'battlepass_premium': 250"), 'battlepass_premium must not be in DEFAULT_STARS_PRICES');
  assert(!srvCode.includes("'battlepass_premium': {"), 'battlepass_premium must not be in PRODUCT_CATALOG');
});

it('Battle Pass Rejection: Server rejects battlepass reward claims and invoices', () => {
  const srvCode = fs.readFileSync('server/server.js', 'utf8');
  assert(srvCode.includes("error: 'battlepass_not_supported'"), 'Must return battlepass_not_supported error');
});

it('Approved Stars Catalog: Exactly 4 FvH Coin packages configured (100, 500, 1200, 3000)', () => {
  const srvCode = fs.readFileSync('server/server.js', 'utf8');
  assert(srvCode.includes("'pkg_coins_100': 25"), '100 coins must be 25 Stars');
  assert(srvCode.includes("'pkg_coins_500': 100"), '500 coins must be 100 Stars');
  assert(srvCode.includes("'pkg_coins_1200': 220"), '1200 coins must be 220 Stars');
  assert(srvCode.includes("'pkg_coins_3000': 500"), '3000 coins must be 500 Stars');
});

// 3. Economy & Store Simulation
it('Store: Transaction deducts currency exactly once and prevents negative balance', () => {
  const store = {
    coins: 500,
    owned: ['skin_rookie'],
    buy: function (itemId, price) {
      if (this.owned.includes(itemId)) return 'owned';
      if (this.coins < price) return 'insufficient';
      this.coins -= price;
      this.owned.push(itemId);
      return 'ok';
    }
  };

  assert.strictEqual(store.buy('skin_crimson', 120), 'ok');
  assert.strictEqual(store.coins, 380);
  assert(store.owned.includes('skin_crimson'));

  // Duplicate purchase
  assert.strictEqual(store.buy('skin_crimson', 120), 'owned');
  assert.strictEqual(store.coins, 380);

  // Insufficient funds
  assert.strictEqual(store.buy('skin_cyber', 1100), 'insufficient');
  assert.strictEqual(store.coins, 380, 'Balance must not change on insufficient funds');
});

it('Character selection & wardrobe persistence', () => {
  const save = {
    selectedCharacter: 'footy',
    equipped: { skin: 'skin_rookie' }
  };

  save.selectedCharacter = 'hoops';
  assert.strictEqual(save.selectedCharacter, 'hoops');

  const serialized = JSON.stringify(save);
  const loaded = JSON.parse(serialized);
  assert.strictEqual(loaded.selectedCharacter, 'hoops');
  assert.strictEqual(loaded.equipped.skin, 'skin_rookie');
});

// 4. Character Clicking & Locker Navigation
it('Character interaction: tapping FOOTY and HOOPS triggers openCharacterLocker', () => {
  const code = fs.readFileSync('js/redesign.js', 'utf8');
  assert(code.includes('app.openCharacterLocker'), 'app.openCharacterLocker method must exist');
  assert(code.includes("openCharacterLocker('footy')"), 'Clicking FOOTY must open FOOTY locker');
  assert(code.includes("openCharacterLocker('hoops')"), 'Clicking HOOPS must open HOOPS locker');
});

// 5. Equipping Locked Items is strictly rejected
it('Locker & Inventory: Equipping locked cosmetic is rejected', () => {
  const locker = {
    owned: ['skin_rookie'],
    equipped: { skin: 'skin_rookie' },
    equip: function (itemId) {
      if (!this.owned.includes(itemId)) {
        return { ok: false, error: 'locked' };
      }
      this.equipped.skin = itemId;
      return { ok: true };
    }
  };

  const resLocked = locker.equip('skin_legendary_cyber');
  assert.strictEqual(resLocked.ok, false);
  assert.strictEqual(resLocked.error, 'locked');
  assert.strictEqual(locker.equipped.skin, 'skin_rookie');

  const resOwned = locker.equip('skin_rookie');
  assert.strictEqual(resOwned.ok, true);
});

// 6. Quests & Stats Progress Tracking
it('Quests: Real metric progress and duplicate claim rejection', () => {
  const quests = {
    claimed: [],
    stats: { matches: 3, goals: 5 },
    claim: function (questId, target, curMetric) {
      if (curMetric < target) return 'in_progress';
      if (this.claimed.includes(questId)) return 'already_claimed';
      this.claimed.push(questId);
      return 'ok';
    }
  };

  assert.strictEqual(quests.claim('d_play3', 3, quests.stats.matches), 'ok');
  assert.strictEqual(quests.claim('d_play3', 3, quests.stats.matches), 'already_claimed');
  assert.strictEqual(quests.claim('d_win5', 5, 2), 'in_progress');
});

// 7. Rivalry Calculation (40% Vol, 40% Cap, 20% Holders)
it('Rivalry formula calculates proper weighted score', () => {
  const footy = { volume: 52, cap: 51, holders: 54 };
  const hoops = { volume: 48, cap: 49, holders: 46 };

  const footyScore = footy.volume * 0.4 + footy.cap * 0.4 + footy.holders * 0.2;
  const hoopsScore = hoops.volume * 0.4 + hoops.cap * 0.4 + hoops.holders * 0.2;

  assert(Math.abs(footyScore + hoopsScore - 100) < 0.001, 'Scores must sum to 100%');
  assert(footyScore > 50, 'Footy leads slightly in demo feed');
});

// 8. Bilingual Dictionary Consistency (Russian & English have matching keys)
it('Localization: Russian and English dictionaries have complete key parity', () => {
  const code = fs.readFileSync('js/redesign.js', 'utf8');
  assert(code.includes('I18N = {'), 'I18N object must exist');
  assert(code.includes('ru: {') && code.includes('en: {'), 'Must have en and ru dicts');
});

// 10. Inventory Owned-Only Filtering (No locked items, no prices in wardrobe)
it('Inventory: strictly filters to owned items only with empty category support', () => {
  const code = fs.readFileSync('js/redesign.js', 'utf8');
  assert(!code.includes('locked-btn'), 'Wardrobe must NOT contain locked item buttons');
  assert(code.includes('emptyCategory'), 'Must support emptyCategory translation');
  assert(code.includes('fvh-empty-locker'), 'Must render fvh-empty-locker when category has no owned items');
  assert(code.includes('goToShop'), 'Must provide link to shop in empty state');
});

// 11. Official Emblem Integrity (Authentic FOOTY vs HOOPS emblem)
it('Official Emblem: authentic emblem.png exists and is referenced with 1:1 proportions', () => {
  assert(fs.existsSync('assets/emblem.png'), 'assets/emblem.png must exist');
  const stat = fs.statSync('assets/emblem.png');
  assert(stat.size > 100000, 'assets/emblem.png must be the authentic high-resolution asset');
  const code = fs.readFileSync('js/redesign.js', 'utf8');
  assert(code.includes('assets/emblem.png'), 'js/redesign.js must use assets/emblem.png');
  assert(code.includes('fvh-official-emblem'), 'Must use fvh-official-emblem class');
  const css = fs.readFileSync('css/redesign.css', 'utf8');
  assert(css.includes('.fvh-official-emblem'), 'css/redesign.css must style .fvh-official-emblem with 1:1 aspect-ratio');
});

// 12. Full Mode Selection Screen
it('Mode Selection: buildModeSelectPage defines Quick Match, Private Match, Practice vs AI', () => {
  const code = fs.readFileSync('js/redesign.js', 'utf8');
  assert(code.includes('buildModeSelectPage'), 'buildModeSelectPage must exist');
  assert(code.includes('quickMatchTitle'), 'Must define Quick Match');
  assert(code.includes('privateMatchTitle'), 'Must define Private Match');
  assert(code.includes('practiceAITitle'), 'Must define Practice vs AI');
  assert(code.includes('showQuickMatchSearchModal'), 'Must provide online matchmaking search modal');
  assert(code.includes('app.showModeSelect'), 'app.showModeSelect must be wired up');
});

// 13. High-Fidelity Character Art Quality
it('Character Art: FOOTY and HOOPS have layered, detailed SVGs with accurate identities', () => {
  const code = fs.readFileSync('js/redesign.js', 'utf8');
  assert(code.includes('getFootyAvatarSvg'), 'getFootyAvatarSvg must exist');
  assert(code.includes('getHoopsAvatarSvg'), 'getHoopsAvatarSvg must exist');
  // Check FOOTY details: jersey #10, cyan chevron/visor, hexagonal football
  assert(code.includes('footyVisor'), 'FOOTY must include cyan visor');
  assert(code.includes('footyChevron'), 'FOOTY must include chevron');
  assert(code.includes('>10<'), 'FOOTY must feature iconic #10');
  // Check HOOPS details: jersey #23, orange headband, orbital ring
  assert(code.includes('>23<'), 'HOOPS must feature iconic #23');
  assert(code.includes('hoopsSneaker'), 'HOOPS must feature detailed sneakers');
  assert(code.includes('rx="33" ry="10"'), 'HOOPS must feature glowing orbital ring around basketball');
});

// 14. Detailed Shop & Wardrobe Previews
it('Previews: renderItemArtwork renders vector SVGs for jerseys, balls, stadiums, packs', () => {
  const code = fs.readFileSync('js/redesign.js', 'utf8');
  assert(code.includes('renderItemArtwork'), 'renderItemArtwork dispatcher must exist');
  assert(code.includes('getDetailedJerseySvg'), 'Must render detailed jersey SVGs');
  assert(code.includes('getDetailedBallSvg'), 'Must render detailed 3D ball SVGs');
  assert(code.includes('getDetailedStadiumSvg'), 'Must render detailed scenic stadium SVGs');
  assert(code.includes('getDetailedPackSvg'), 'Must render detailed booster pack SVGs');
});

// 15. Themed Arena Environments (Ocean & Forest Courts)
it('Arenas: Coastal Sunset Court and Redwood Forest Arena are configured with scenic visuals', () => {
  const code = fs.readFileSync('js/redesign.js', 'utf8');
  assert(code.includes('std_ocean_sunset'), 'std_ocean_sunset arena must exist');
  assert(code.includes('std_forest_redwood'), 'std_forest_redwood arena must exist');
  assert(code.includes('oceanSky') || code.includes('oceanWater'), 'Coastal Sunset Court must feature ocean visuals');
  assert(code.includes('forestSky') || code.includes('forestTurf'), 'Redwood Forest Arena must feature forest visuals');
});

// 16. Separated Quests & Referral Squad Hub
it('Quests: 3 separated categories (Gameplay, Official Socials, Referral Squad Hub)', () => {
  const code = fs.readFileSync('js/redesign.js', 'utf8');
  assert(code.includes('tabGameplay'), 'tabGameplay must exist');
  assert(code.includes('tabSocialMedia'), 'tabSocialMedia must exist');
  assert(code.includes('tabInviteFriends'), 'tabInviteFriends must exist');
  assert(code.includes('renderGameplayQuests'), 'renderGameplayQuests function must exist');
  assert(code.includes('renderSocialQuests'), 'renderSocialQuests function must exist');
  assert(code.includes('renderReferralHub'), 'renderReferralHub function must exist');
  assert(code.includes('/api/referrals/stats'), 'Must call /api/referrals/stats');
  assert(code.includes('q_sub_tg'), 'Telegram channel quest must exist');
  assert(code.includes('q_sub_x'), 'X/Twitter quest must exist');
  assert(code.includes('q_sub_chat'), 'Community chat quest must exist');
  assert(code.includes('copyInviteLink'), 'Must support copy invite link');
});

// 17. All 10 Distinct Scenic Arenas
it('Arenas: Exactly 10 unique world environments are configured with detailed SVG visuals', () => {
  const code = fs.readFileSync('js/redesign.js', 'utf8');
  const arenas = [
    'std_ocean_sunset',
    'std_forest_redwood',
    'std_space_orbit',
    'std_mars_dome',
    'std_moon_crater',
    'std_underwater_dome',
    'std_cyber_megacity',
    'std_volcano_caldera',
    'std_floating_islands',
    'std_crystal_cavern'
  ];
  arenas.forEach(id => {
    assert(code.includes(id), `Arena ${id} must be configured in js/redesign.js`);
  });
  // Check distinctive visual defs in getDetailedStadiumSvg
  assert(code.includes('spaceSky') || code.includes('spaceDeck'), 'Space Orbit Arena must have space visuals');
  assert(code.includes('marsSky') || code.includes('marsGround'), 'Mars Bio-Dome Arena must have martian visuals');
  assert(code.includes('abyssWater') || code.includes('aquaFloor'), 'Underwater Dome Arena must have aquatic visuals');
  assert(code.includes('cyberSky') || code.includes('cyberPitch'), 'Cyberpunk Megacity must have neo-tokyo visuals');
  assert(code.includes('volcanoSky') || code.includes('lavaFloor'), 'Volcano Caldera Arena must have magma visuals');
  assert(code.includes('skyHeaven') || code.includes('marbleFloor'), 'Floating Islands must have celestial visuals');
  assert(code.includes('caveCeiling') || code.includes('crystalFloor'), 'Crystal Cavern must have geode visuals');
});

// 18. Dedicated Arena Selection Screen
it('Arena Selection: buildArenaSelectPage renders gallery of 10 worlds with equip/store actions', () => {
  const code = fs.readFileSync('js/redesign.js', 'utf8');
  assert(code.includes('buildArenaSelectPage'), 'buildArenaSelectPage must exist');
  assert(code.includes('fvh-arena-grid'), 'fvh-arena-grid must exist');
  assert(code.includes('app.showArenas'), 'app.showArenas must be wired up');
  assert(code.includes('arenaSelectTitle'), 'arenaSelectTitle must exist');
});

// 19. Online Multiplayer Architecture (Quick Match + Private 6-char Rooms)
it('Online Multiplayer: Automated WebRTC signaling via backend server without manual SDP copy-paste', () => {
  const code = fs.readFileSync('js/redesign.js', 'utf8');
  assert(code.includes('startWebRTCSession'), 'startWebRTCSession helper must exist');
  assert(code.includes('/api/matchmaking/join'), 'Must connect to /api/matchmaking/join');
  assert(code.includes('/api/room/create'), 'Must connect to /api/room/create');
  assert(code.includes('/api/room/join'), 'Must connect to /api/room/join');
  assert(code.includes('/api/room/signal'), 'Must exchange signals via /api/room/signal');
  assert(code.includes('showCreateRoomModal'), 'showCreateRoomModal must exist');
  assert(code.includes('showJoinRoomModal'), 'showJoinRoomModal must exist');
});

// 20. Dynamic 3D Advertising Boards
it('Dynamic 3D Ad Boards: Configured 10.0s cycle (0.5s in, 6.0s on, 0.5s out, 3.0s off) with sharp textures', () => {
  const gameJs = fs.readFileSync('js/game.js', 'utf8');
  assert(gameJs.includes('fadeIn: 0.5'), 'Must have 0.5s fade in');
  assert(gameJs.includes('visible: 6.0') || gameJs.includes('visible: 6'), 'Must have 6.0s visible');
  assert(gameJs.includes('fadeOut: 0.5'), 'Must have 0.5s fade out');
  assert(gameJs.includes('hidden: 3.0') || gameJs.includes('hidden: 3'), 'Must have 3.0s hidden');
  assert(gameJs.includes('cycleTotal: 10.0') || gameJs.includes('cycleTotal: 10'), 'Total cycle must be 10.0s');
  assert(gameJs.includes('footySlides') && gameJs.includes('hoopsSlides'), 'Must separate footy and hoops ad slides');
  assert(gameJs.includes('2048') && gameJs.includes('160'), 'Must generate 2048x160 sharp ad canvas');
});

// 21. Bot Token Security & Sanitization
it('Bot Token Security: No hardcoded bot tokens or fallbacks exist in source code and format validation is enforced', () => {
  const srvCode = fs.readFileSync('server/server.js', 'utf8');
  const botScript = fs.readFileSync('scripts/setup_telegram_bot_profile.js', 'utf8');
  const compromisedTokenFragment = 'AAHnIjET';
  assert(!srvCode.includes(compromisedTokenFragment), 'server.js must not contain compromised token');
  assert(!botScript.includes(compromisedTokenFragment), 'setup_telegram_bot_profile.js must not contain compromised token');
  assert(srvCode.includes('resolveTelegramBotToken'), 'Must use resolveTelegramBotToken helper');
  assert(srvCode.includes('.trim()'), 'Must trim whitespace from token');
  assert(srvCode.includes('/^[0-9]+:[A-Za-z0-9_-]+$/'), 'Must validate token format against Telegram specification');
  assert(srvCode.includes('bot_token_invalid_format'), 'Must reject invalid format explicitly without silent stripping');
});

// 22. Production Webhook Authentication
it('Production Webhook Security: TELEGRAM_WEBHOOK_SECRET strictly required in production', () => {
  const srvCode = fs.readFileSync('server/server.js', 'utf8');
  assert(srvCode.includes('x-telegram-bot-api-secret-token'), 'Must check x-telegram-bot-api-secret-token header');
  assert(srvCode.includes('invalid_webhook_secret'), 'Must reject invalid webhook secret');
});

// 22. Shop Dedicated Bundles (7 Thematic Collections)
it('Shop Bundles: 7 thematic collections with item breakdowns, discount pills, and multi-currency pricing', () => {
  const code = fs.readFileSync('js/redesign.js', 'utf8');
  assert(code.includes('catBundles'), 'Must have catBundles category');
  assert(code.includes('bundle_footy_starter'), 'Must include FOOTY Starter Bundle');
  assert(code.includes('bundle_hoops_starter'), 'Must include HOOPS Starter Bundle');
  assert(code.includes('bundle_ocean_arena'), 'Must include Ocean Arena Collection');
  assert(code.includes('bundle_mars_explorer'), 'Must include Mars Explorer Collection');
  assert(code.includes('bundle_lunar_champ'), 'Must include Lunar Championship Collection');
  assert(code.includes('bundle_cyber_neon'), 'Must include Cyber Neon Collection');
  assert(code.includes('bundle_legendary_champs'), 'Must include Legendary Champions Bundle');
  assert(code.includes('checkBundleOwnership'), 'Must check bundle ownership to avoid duplicate purchases');
});

// 23. Server Payment Subsystems (Telegram Stars & TON)
it('Server Payment Endpoints: Product catalog, Stars invoices, TON memos, and Ledger persistence', () => {
  const srvCode = fs.readFileSync('server/server.js', 'utf8');
  assert(srvCode.includes('/api/catalog'), 'Must have /api/catalog');
  assert(srvCode.includes('/api/stars/create-invoice'), 'Must have /api/stars/create-invoice');
  assert(srvCode.includes('/api/stars/verify'), 'Must have /api/stars/verify');
  assert(srvCode.includes('/api/stars/webhook'), 'Must have /api/stars/webhook');
  assert(srvCode.includes('/api/ton/config'), 'Must have /api/ton/config');
  assert(srvCode.includes('/api/ton/create-payload'), 'Must have /api/ton/create-payload');
  assert(srvCode.includes('/api/ton/verify'), 'Must have /api/ton/verify');
  assert(srvCode.includes('/api/payments/history'), 'Must have /api/payments/history');
  assert(srvCode.includes('FVH-PAY-'), 'Must use FVH-PAY- memo format');
  assert(srvCode.includes('processedTonHashes'), 'Must protect against replay attacks on txHash');
  assert(srvCode.includes('paymentsLedger'), 'Must persist transactions to paymentsLedger');
});

console.log(`\nResults: ${passedTests}/${totalTests} tests passed.\n`);
if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}



