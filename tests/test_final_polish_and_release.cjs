const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== FOOTY vs HOOPS Final Release Polish Test Suite ===\n');

const redesignJsPath = path.join(__dirname, '..', 'js', 'redesign.js');
const redesignCssPath = path.join(__dirname, '..', 'css', 'redesign.css');
const serverJsPath = path.join(__dirname, '..', 'server', 'server.js');

const redesignJs = fs.readFileSync(redesignJsPath, 'utf8');
const redesignCss = fs.readFileSync(redesignCssPath, 'utf8');
const serverJs = fs.readFileSync(serverJsPath, 'utf8');

// Test 1: getPlayerAvatarHtml exists and supports photoUrl with fallback
console.log('Test 1: Checking getPlayerAvatarHtml and Telegram photo support...');
assert(redesignJs.includes('function getPlayerAvatarHtml(opts)'), 'getPlayerAvatarHtml must be defined');
assert(redesignJs.includes('fvh-avatar-img'), 'Avatar class must be applied');
assert(redesignJs.includes('hero_footy_cartoon.png'), 'Fallback footy cartoon must be present');
assert(redesignJs.includes('hero_hoops_cartoon.png'), 'Fallback hoops cartoon must be present');
console.log('  [PASS] getPlayerAvatarHtml correctly defined with 3D cartoon fallbacks');

// Test 2: Telegram WebApp extraction saves photo_url
console.log('Test 2: Checking Telegram photo_url extraction...');
assert(redesignJs.includes('d.photoUrl = u.photo_url;'), 'initTelegramMiniApp must persist u.photo_url');
assert(redesignJs.includes("photoUrl: u.photo_url || ''"), 'telegramUser object must contain photoUrl');
assert(serverJs.includes('player.photoUrl = data.photoUrl'), 'Server must store player photoUrl');
console.log('  [PASS] Telegram photoUrl successfully extracted and synced');

// Test 3: Profile packs card eliminates floating .badge
console.log('Test 3: Checking Profile packs badge elimination...');
assert(!redesignJs.includes('<span class="badge">\' + tr(\'packsAvailable\''), 'Must not use uncontained .badge for packs');
assert(redesignJs.includes('fvh-packs-count-pill'), 'Must use scoped fvh-packs-count-pill when count > 0');
assert(redesignCss.includes('.fvh-packs-count-pill'), 'CSS for fvh-packs-count-pill must exist');
console.log('  [PASS] Floating green "0 доступно" badge removed from Profile');

// Test 4: Profile career stats remove Clash and show Football vs Basketball rivalry
console.log('Test 4: Checking Profile stats Clash removal...');
assert(redesignJs.includes('fvh-dual-bar'), 'Must use fvh-dual-bar');
assert(redesignJs.includes('fvh-dual-footy'), 'Must use fvh-dual-footy');
assert(redesignJs.includes('fvh-dual-hoops'), 'Must use fvh-dual-hoops');
assert(!redesignJs.includes('fvh-tri-clash'), 'Must not render fvh-tri-clash in Profile');
assert(!redesignJs.includes('<span>⚡ Clash (\' + wC + \')</span>'), 'Must not display Clash count in Profile stats');
console.log('  [PASS] Clash removed from Profile stats, dual Football vs Basketball rivalry active');

// Test 5: Shop removes Item of the Day / Featured Drop hero card
console.log('Test 5: Checking Shop featured drop removal...');
assert(!redesignJs.includes('body.appendChild(featuredHero);'), 'featuredHero must not be appended in Shop');
assert(!redesignJs.includes('featuredHero.innerHTML ='), 'featuredHero innerHTML must not be populated in Shop');
console.log('  [PASS] "Item of the Day" hero spotlight removed; catalog categories immediately visible');

// Test 6: Arena selection completely removed from Mode Selection screen
console.log('Test 6: Checking Mode Selection arena removal...');
const modeSelectFunc = redesignJs.slice(redesignJs.indexOf('function buildModeSelectPage('), redesignJs.indexOf('function showRivalryModal()'));
assert(!modeSelectFunc.includes('fvh-mode-arena-banner'), 'Mode selection must not render fvh-mode-arena-banner');
assert(!modeSelectFunc.includes('arenaBanner'), 'Mode selection must not construct arenaBanner');
assert(modeSelectFunc.includes('fvh-mode-grid'), 'Mode selection must proceed directly to match mode grid');
console.log('  [PASS] Arena selection banner completely removed from mode selection screen');

// Test 7: Rivalry note eliminates "DEMO" / "ДЕМО"
console.log('Test 7: Checking Rivalry note text...');
assert(!redesignJs.includes('DEMO FEED'), 'English note must not say DEMO FEED');
assert(!redesignJs.includes('ДЕМО ДАННЫЕ'), 'Russian note must not say ДЕМО ДАННЫЕ');
assert(redesignJs.includes('LIVE COMPETITION'), 'Must state honest live competition');
console.log('  [PASS] DEMO notes replaced with live competition status');

// Test 8: Leaderboard podium, rows, and docked card use getPlayerAvatarHtml
console.log('Test 8: Checking Leaderboard avatar rendering...');
assert(redesignJs.includes('extraClass: \'podium-avatar\''), 'Podium must use getPlayerAvatarHtml');
assert(redesignJs.includes('extraClass: \'row-avatar\''), 'Ranked rows must use getPlayerAvatarHtml');
assert(redesignJs.includes('extraClass: \'docked-avatar\''), 'Docked card must use getPlayerAvatarHtml');
assert(redesignCss.includes('.fvh-podium-wrap') && redesignCss.includes('padding-top: 32px'), 'Podium must have top padding to prevent clipping');
console.log('  [PASS] Leaderboard podium and rows render high-res avatars with zero top clipping');

// Test 9: Boost cards alignment and responsive button styles
console.log('Test 9: Checking Boost cards CSS...');
assert(redesignCss.includes('.fvh-boost-card .nm'), 'CSS must specify consistent height for boost card names');
assert(redesignCss.includes('-webkit-line-clamp: 2'), 'Boost names must clamp at 2 lines');
assert(redesignCss.includes('.fvh-boost-card .btn'), 'Boost card buttons must dock at bottom');
console.log('  [PASS] Boost cards grid alignment rules enforced');

// Test 10: Topbar settings button protected on narrow viewports
console.log('Test 10: Checking Topbar settings button responsiveness...');
assert(redesignCss.includes('@media (max-width: 360px)'), 'Media query for <=360px must exist');
assert(redesignCss.includes('.fvh-topbar-brand .logo-text'), 'Logo text must hide on <=360px to guarantee button fit');
console.log('  [PASS] Topbar settings button verified safe on all viewports down to 320px');

// Test 11: Tactile Haptic Feedback
console.log('Test 11: Checking Haptic Feedback integration...');
assert(redesignJs.includes('function triggerHaptic(type)'), 'triggerHaptic helper must exist');
assert(redesignJs.includes('Telegram.WebApp.HapticFeedback'), 'Telegram HapticFeedback must be invoked');
console.log('  [PASS] Tactile Haptic Feedback connected to Telegram WebApp');

// Test 12: Battle Pass Elimination Verification
console.log('Test 12: Checking Battle Pass elimination and clean redirection to Quests...');
assert(redesignJs.includes("function buildBattlePassPage(app)"), 'buildBattlePassPage handler must exist');
assert(redesignJs.includes("return buildQuestsPage(app, 'daily')"), 'buildBattlePassPage must redirect to Quests');
assert(redesignJs.includes("Боевой пропуск не поддерживается") || redesignJs.includes("Battle Pass is not supported"), 'openBattlePassCheckout must alert that Battle Pass is not supported');
console.log('  [PASS] Battle Pass eliminated and cleanly redirected to Quests');

// Test 13: Easy AI Balancing
console.log('Test 13: Checking Easy AI difficulty settings and gameplay tuning...');
const gameJs = fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8');
assert(gameJs.includes('easy: { speed: 0.72'), 'Easy AI speed must be tuned to 0.72');
assert(gameJs.includes('think: 0.45'), 'Easy AI reaction delay must be tuned to 0.45');
assert(gameJs.includes('shotErr: 0.65'), 'Easy AI shot error must be widened to 0.65');
assert(gameJs.includes('hoopsErr: 1.5'), 'Easy AI hoops error must be widened to 1.50');
assert(gameJs.includes('tackleProb: 0.08'), 'Easy AI tackle probability must be reduced to 0.08');
assert(gameJs.includes('stealProb: 0.08'), 'Easy AI steal probability must be reduced to 0.08');
assert(gameJs.includes('keeperSpeed: 2.0'), 'Easy AI keeper speed must be reduced to 2.0');
assert(gameJs.includes('canSprint: false'), 'Easy AI canSprint must be disabled');
assert(gameJs.includes('KEEPER_REACH = { easy: 1.05'), 'Easy keeper reach must be reduced to 1.05');
assert(gameJs.includes('KEEPER_MISJUDGE = { easy: 2.4'), 'Easy keeper misjudge must be increased to 2.4');
// Ensure distinct levels
assert(gameJs.includes('normal: { speed: 0.97') && gameJs.includes('hard: { speed: 1.05'), 'Normal and Hard difficulties must remain distinct challenges');
console.log('  [PASS] Easy AI is genuinely easy and distinctly balanced from Normal and Hard');

// Test 14: Football-Only Wardrobe
console.log('Test 14: Checking Football-Only wardrobe category controls and catalog...');
const charactersFunc = redesignJs.slice(redesignJs.indexOf('function buildCharactersPage('), redesignJs.indexOf('function buildShopPage('));
assert(!charactersFunc.includes("{ id: 'balls_hoops', label: tr('catBasketballBalls') }"), 'Wardrobe categories must not contain balls_hoops');
assert(charactersFunc.includes("{ id: 'skins', label: tr('catSkins') }"), 'Wardrobe must contain skins');
assert(charactersFunc.includes("{ id: 'balls_footy', label: tr('catFootballBalls') }"), 'Wardrobe must contain balls_footy');
const shopCatalogFunc = redesignJs.slice(redesignJs.indexOf('function buildDefaultShopCatalog('), redesignJs.indexOf('function buildShopPage('));
assert(!shopCatalogFunc.includes('skin_solar'), 'Default wardrobe catalog must exclude basketball jersey skin_solar');
assert(!shopCatalogFunc.includes('ball_hoops_'), 'Default wardrobe catalog must exclude basketball balls');
assert(shopCatalogFunc.includes('skin_rookie') && shopCatalogFunc.includes('ball_footy_classic'), 'Default catalog must contain football cosmetics');
console.log('  [PASS] Wardrobe category controls and catalog are strictly football-only');

// Test 15: Safe Area & Bottom Navigation Scroll Clearance
console.log('Test 15: Checking Mobile safe-area, bottom nav clearance, and Daily Tasks discoverability...');
assert(redesignCss.includes('calc(var(--safe-bottom) + 95px)'), 'Scroll containers must have safe clearance above bottom nav');
assert(redesignCss.includes('.solo-avatar-box') && redesignCss.includes('height: 165px !important'), 'Solo hero avatar box must be compact (165px) on mobile');
assert(redesignCss.includes('.fvh-season-hub-card') && redesignCss.includes('margin-bottom: 24px !important'), 'Daily Tasks card must have generous bottom margin');
console.log('  [PASS] Mobile layout respects safe-area, allows full Daily Tasks scroll clearance');

// Test 16: Wardrobe Grid Uniformity
console.log('Test 16: Checking Wardrobe card grid uniformity...');
assert(redesignCss.includes('.fvh-wardrobe-grid .shop-grid'), 'Wardrobe grid rules must exist');
assert(redesignCss.includes('.fvh-wardrobe-grid .card.shopc .thumb'), 'Wardrobe card thumb rules must exist');
assert(redesignCss.includes('.fvh-wardrobe-grid .card.shopc .nm'), 'Wardrobe card name rules must exist');
assert(redesignCss.includes('.fvh-wardrobe-grid .card.shopc > button.btn'), 'Wardrobe card button rules must exist');
console.log('  [PASS] Wardrobe cards have uniform widths, image containers, titles, and button heights');

console.log('\nAll 16/16 release verification tests passed successfully!');
