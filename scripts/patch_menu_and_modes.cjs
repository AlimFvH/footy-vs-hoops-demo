const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'redesign.js');
let code = fs.readFileSync(filePath, 'utf8');

// 1. New buildModeSelectPage implementation
const newBuildModeSelectPage = `  function buildModeSelectPage(app) {
    var playerChosenChar = (app.store && app.store.data && (app.store.data.selectedCharacter || app.store.data.selectedTeam)) || 'footy';
    var curSettings = app.store.data.settings || {};
    var lang = getActiveLang();
    var isPlayerFooty = (playerChosenChar === 'footy');

    var container = document.createElement('div');
    container.className = 'screen solid page-screen has-nav fvh-mode-select-screen';
    container.dataset.id = 'mode';

    var page = document.createElement('div');
    page.className = 'page';

    // Page Head
    var head = document.createElement('div');
    head.className = 'page-head';
    var backBtn = document.createElement('button');
    backBtn.className = 'btn icon back';
    backBtn.innerHTML = getUiIconSvg('arrow_back', 18);
    backBtn.onclick = function () {
      app.audio.play('click');
      app.showMenu();
    };
    var title = document.createElement('h1');
    title.textContent = (lang === 'ru' ? 'ВЫБОР АРЕНЫ И РЕЖИМА' : 'CHAMPIONSHIP ARENA SELECT');
    head.appendChild(backBtn);
    head.appendChild(title);
    page.appendChild(head);

    // Page Body
    var body = document.createElement('div');
    body.className = 'page-body fvh-mode-page-body';

    // Team Parity Status Banner
    var teamBanner = document.createElement('div');
    teamBanner.className = 'fvh-mode-team-banner ' + playerChosenChar;
    teamBanner.innerHTML =
      '<span class="fvh-team-tag">' + (isPlayerFooty ? '⚽ ВАША КОМАНДА: FOOTY #10' : '🏀 ВАША КОМАНДА: HOOPS #23') + '</span>' +
      '<span class="fvh-team-sub">' + (lang === 'ru' ? 'Вы играете за своего атлета во ВСЕХ видах спорта!' : 'You compete with your chosen hero across ALL sports!') + '</span>';
    body.appendChild(teamBanner);

    var grid = document.createElement('div');
    grid.className = 'fvh-mode-grid';

    var selDiffFooty = curSettings.difficulty || 'normal';
    var selDiffHoops = curSettings.difficulty || 'normal';

    // -------------------------------------------------------------
    // CARD 1: ⚽ ФУТБОЛЬНАЯ АРЕНА (CYBER PITCH 2026)
    // -------------------------------------------------------------
    var footyCard = document.createElement('div');
    footyCard.className = 'fvh-mode-card stadium-card footy-card';
    footyCard.innerHTML =
      '<div class="fvh-mode-card-header footy">' +
      '  <span class="fvh-mode-badge stadium">⚽ ' + (lang === 'ru' ? 'ФУТБОЛЬНАЯ АРЕНА 2026' : 'CYBER FOOTBALL ARENA') + '</span>' +
      '  <span class="fvh-mode-instant-pill">🏟️ LED BOWL</span>' +
      '</div>' +
      '<div class="fvh-mode-card-body">' +
      '  <div class="fvh-mode-title">' + (lang === 'ru' ? 'Матч на Большом Стадионе' : 'Grand Stadium Match') + '</div>' +
      '  <div class="fvh-mode-desc">' + (lang === 'ru' ? 'Изумрудный газон, светящиеся LED-борды, ликующие трибуны. Пробивайте мощные удары и побеждайте!' : 'Emerald turf, illuminated LED ribbon boards, dynamic crowd. Score incredible goals!') + '</div>' +
      '  <div class="fvh-ctrl-row" style="margin-top:10px;">' +
      '    <span class="fvh-ctrl-label">' + tr('difficulty') + ':</span>' +
      '    <div class="seg seg-diff seg-diff-footy">' +
      '      <button type="button" class="' + (selDiffFooty === 'easy' ? 'on' : '') + '" data-diff="easy">' + tr('easy') + '</button>' +
      '      <button type="button" class="' + (selDiffFooty === 'normal' ? 'on' : '') + '" data-diff="normal">' + tr('normal') + '</button>' +
      '      <button type="button" class="' + (selDiffFooty === 'hard' ? 'on' : '') + '" data-diff="hard">' + tr('hard') + '</button>' +
      '    </div>' +
      '  </div>' +
      '</div>' +
      '<div class="fvh-mode-card-actions fvh-dual-actions">' +
      '  <button type="button" class="btn primary block fvh-btn-play-ai-footy"><span>⚽ ' + (lang === 'ru' ? 'ОДИНОЧНЫЙ МАТЧ (VS ИИ)' : 'PLAY VS AI') + '</span></button>' +
      '  <button type="button" class="btn secondary block fvh-btn-play-pvp-footy"><span>⚡ ' + (lang === 'ru' ? '1v1 ОНЛАЙН PVP' : '1v1 ONLINE PVP') + '</span></button>' +
      '</div>';

    footyCard.querySelectorAll('.seg-diff-footy button').forEach(function(b) {
      b.onclick = function() {
        footyCard.querySelectorAll('.seg-diff-footy button').forEach(function(x) { x.classList.remove('on'); });
        b.classList.add('on');
        selDiffFooty = b.dataset.diff;
        app.audio.play('click');
      };
    });

    footyCard.querySelector('.fvh-btn-play-ai-footy').onclick = function() {
      app.audio.play('click');
      app.store.update(function(d) {
        if (!d.settings) d.settings = {};
        d.settings.difficulty = selDiffFooty;
      });
      app.launch({
        mode: 'footy',
        char: playerChosenChar,
        difficulty: selDiffFooty,
        minutes: 2,
        arenaId: 'std_footy_classic',
        boostId: null
      }, false);
    };

    footyCard.querySelector('.fvh-btn-play-pvp-footy').onclick = function() {
      app.audio.play('click');
      showQuickMatchSearchModal(app, 'footy');
    };

    grid.appendChild(footyCard);

    // -------------------------------------------------------------
    // CARD 2: 🏀 БАСКЕТБОЛЬНЫЙ ПАРКЕТ (NEON HOOPS ARENA 2026)
    // -------------------------------------------------------------
    var hoopsCard = document.createElement('div');
    hoopsCard.className = 'fvh-mode-card stadium-card hoops-card';
    hoopsCard.innerHTML =
      '<div class="fvh-mode-card-header hoops">' +
      '  <span class="fvh-mode-badge stadium">🏀 ' + (lang === 'ru' ? 'БАСКЕТБОЛЬНЫЙ ПАРКЕТ 2026' : 'NEON HOOPS ARENA') + '</span>' +
      '  <span class="fvh-mode-instant-pill">🔥 CYBER COURT</span>' +
      '</div>' +
      '<div class="fvh-mode-card-body">' +
      '  <div class="fvh-mode-title">' + (lang === 'ru' ? 'Матч на Неоновом Паркете' : 'Neon Hardwood Clash') + '</div>' +
      '  <div class="fvh-mode-desc">' + (lang === 'ru' ? 'Полированный паркет с неоновыми контурами, пылающие LED-щиты и мощные данки с высоты!' : 'Polished hardwood court, neon boundary lighting, soaring dunks and three-pointers!') + '</div>' +
      '  <div class="fvh-ctrl-row" style="margin-top:10px;">' +
      '    <span class="fvh-ctrl-label">' + tr('difficulty') + ':</span>' +
      '    <div class="seg seg-diff seg-diff-hoops">' +
      '      <button type="button" class="' + (selDiffHoops === 'easy' ? 'on' : '') + '" data-diff="easy">' + tr('easy') + '</button>' +
      '      <button type="button" class="' + (selDiffHoops === 'normal' ? 'on' : '') + '" data-diff="normal">' + tr('normal') + '</button>' +
      '      <button type="button" class="' + (selDiffHoops === 'hard' ? 'on' : '') + '" data-diff="hard">' + tr('hard') + '</button>' +
      '    </div>' +
      '  </div>' +
      '</div>' +
      '<div class="fvh-mode-card-actions fvh-dual-actions">' +
      '  <button type="button" class="btn primary block fvh-btn-play-ai-hoops"><span>🏀 ' + (lang === 'ru' ? 'ОДИНОЧНЫЙ МАТЧ (VS ИИ)' : 'PLAY VS AI') + '</span></button>' +
      '  <button type="button" class="btn secondary block fvh-btn-play-pvp-hoops"><span>⚡ ' + (lang === 'ru' ? '1v1 ОНЛАЙН PVP' : '1v1 ONLINE PVP') + '</span></button>' +
      '</div>';

    hoopsCard.querySelectorAll('.seg-diff-hoops button').forEach(function(b) {
      b.onclick = function() {
        hoopsCard.querySelectorAll('.seg-diff-hoops button').forEach(function(x) { x.classList.remove('on'); });
        b.classList.add('on');
        selDiffHoops = b.dataset.diff;
        app.audio.play('click');
      };
    });

    hoopsCard.querySelector('.fvh-btn-play-ai-hoops').onclick = function() {
      app.audio.play('click');
      app.store.update(function(d) {
        if (!d.settings) d.settings = {};
        d.settings.difficulty = selDiffHoops;
      });
      app.launch({
        mode: 'hoops',
        char: playerChosenChar,
        difficulty: selDiffHoops,
        minutes: 2,
        arenaId: 'std_hoops_street',
        boostId: null
      }, false);
    };

    hoopsCard.querySelector('.fvh-btn-play-pvp-hoops').onclick = function() {
      app.audio.play('click');
      showQuickMatchSearchModal(app, 'hoops');
    };

    grid.appendChild(hoopsCard);

    body.appendChild(grid);
    page.appendChild(body);
    page.appendChild(createScrollBottomSpacer());
    container.appendChild(page);

    container.appendChild(createSharedBottomNav('menu', app));
    return container;
  }`;

// 2. New renderRedesignedMenu implementation
const newRenderRedesignedMenu = `  function renderRedesignedMenu(app) {
    window.renderRedesignedMenu = renderRedesignedMenu;
    if (!app) app = window.App || window.app || window.__fvh;
    if (!app || !app.store || !app.store.data) return;
    if (app.game && app.game.running) {
      try { app.game.stop(); } catch (e) {}
    }
    if (app.hud) {
      try { app.hud.show(false); app.hud.resetState(); } catch (e) {}
    }
    if (typeof app.closePause === 'function') {
      try { app.closePause(); } catch (e) {}
    }
    document.querySelectorAll('.fvh-pause-overlay, .fvh-forfeit-victory-screen').forEach(function (el) {
      try { el.remove(); } catch (e) {}
    });
    if (typeof updateTelegramBackButton === 'function') updateTelegramBackButton('menu');
    var d = app.store.data;
    if (!d.teamChosen || (!d.selectedTeam && !d.selectedCharacter)) {
      app.showTeamSelection();
      return;
    }
    app.state = 'menu';
    if (app.game && app.game.running) {
      app.game.stop();
    }
    app.closePause();

    var lang = getActiveLang();
    var curChar = d.selectedCharacter || 'footy';
    var isFooty = (curChar === 'footy');

    var screen = document.createElement('div');
    screen.className = 'screen menu-bg fvh-stadium-arena-bg ' + curChar;
    screen.dataset.id = 'menu';

    // 1. Top Bar: Console Cyber Header with Emblem, Currency, Profile & Settings
    var topbar = document.createElement('header');
    topbar.className = 'fvh-topbar';
    var playerDisplayName = (d.profile && d.profile.nickname) || d.playerName || (d.telegramUser && (d.telegramUser.first_name || d.telegramUser.username)) || 'Alim';
    var playerLevel = (d.profile && d.profile.level) ? d.profile.level : (d.level || 1);
    var shortName = playerDisplayName.length > 8 ? (playerDisplayName.slice(0, 7) + '…') : playerDisplayName;

    topbar.innerHTML =
      '<div class="fvh-topbar-brand" style="cursor:pointer;" title="FOOTY vs HOOPS">' +
      getOfficialEmblemHtml() +
      '<div class="logo-text">FOOTY <span class="dot">VS</span> HOOPS</div>' +
      '</div>' +
      '<div class="fvh-topbar-stats">' +
      '<button class="fvh-pill gold" id="fvh-btn-coins" title="' + tr('shop') + '">' + getFvhCoinSvg('inline') + ' <span>' + (d.coins || 0).toLocaleString() + '</span></button>' +
      '<button class="fvh-pill icon-only" id="fvh-btn-leaderboard" title="' + tr('leaderboard') + '">' + getUiIconSvg('trophy', 17) + '</button>' +
      '<button class="fvh-pill icon-only" id="fvh-btn-settings" title="' + tr('settings') + '">' + getUiIconSvg('settings', 17) + '</button>' +
      '<button class="fvh-pill fvh-btn-topbar-profile" id="fvh-btn-profile" title="' + tr('profile') + '"><span class="fvh-topbar-avatar-mini">' + getPlayerAvatarHtml({ photoUrl: d.photoUrl || (d.telegramUser && d.telegramUser.photoUrl), character: curChar, extraClass: 'mini-avatar' }) + '</span><span class="fvh-profile-name">' + escapeHtml(shortName) + '</span><span class="fvh-profile-lvl" style="font-size:10px;opacity:0.75;margin-left:3px;">Lv.' + playerLevel + '</span></button>' +
      '</div>';
    screen.appendChild(topbar);

    topbar.querySelector('.fvh-topbar-brand').onclick = function () { app.showMenu(); };
    topbar.querySelector('#fvh-btn-coins').onclick = function () { app.audio.play('click'); app.go('shop'); };
    topbar.querySelector('#fvh-btn-leaderboard').onclick = function () { app.audio.play('click'); app.go('leaderboard'); };
    topbar.querySelector('#fvh-btn-settings').onclick = function () { app.audio.play('click'); app.go('settings'); };
    topbar.querySelector('#fvh-btn-profile').onclick = function () { app.audio.play('click'); app.go('profile'); };

    // 2. Open Stadium Hero Stage ("БЕЗ ФОНА" - NO BOX CONTAINER!)
    var stage = document.createElement('section');
    stage.className = 'fvh-open-hero-stage ' + curChar;

    var up = d.upgrades || { power: 1, stamina: 1, keeper: 1 };
    var pLvl = Math.max(1, Math.min(10, up.power || 1));
    var sLvl = Math.max(1, Math.min(10, up.stamina || 1));
    var kLvl = Math.max(1, Math.min(10, up.keeper || 1));
    var avgLvl = (pLvl + sLvl + kLvl) / 3;
    var ovr = Math.round(70 + ((avgLvl - 1) / 9) * 29);

    var equippedJersey = isFooty
      ? (d.equippedFootyJersey || d.equippedKit || (lang === 'ru' ? 'Форма FOOTY' : 'FOOTY Kit'))
      : (d.equippedHoopsJersey || d.equippedJersey || (lang === 'ru' ? 'Джерси HOOPS' : 'HOOPS Jersey'));
    var equippedBall = isFooty
      ? (d.equippedFootyBall || d.equippedBall || (lang === 'ru' ? 'Мяч Classic' : 'Classic Ball'))
      : (d.equippedHoopsBall || (lang === 'ru' ? 'Баскетбольный мяч' : 'Pro Leather'));

    if (typeof getItemLabelById === 'function') {
      equippedJersey = getItemLabelById(equippedJersey, equippedJersey);
      equippedBall = getItemLabelById(equippedBall, equippedBall);
    }

    var charPortraitHtml = getCharacterDisplayHtml(curChar, null, { showJerseyTag: false });

    stage.innerHTML =
      '<div class="fvh-hero-hologram-header">' +
      '  <div class="fvh-holo-pill ' + curChar + '">' +
      '    <span class="fvh-holo-icon">' + (isFooty ? '⚽' : '🏀') + '</span>' +
      '    <span class="fvh-holo-name">' + (isFooty ? 'FOOTY #10' : 'HOOPS #23') + '</span>' +
      '    <span class="fvh-holo-ovr">OVR ' + ovr + '</span>' +
      '  </div>' +
      '  <button type="button" class="fvh-btn-fast-switch" title="' + (lang === 'ru' ? 'Сменить команду' : 'Switch Team') + '">' +
      '    <span>⇄ ' + (isFooty ? 'HOOPS' : 'FOOTY') + '</span>' +
      '  </button>' +
      '</div>' +
      '<div class="fvh-hero-open-viewport" style="width:100%;height:clamp(290px, 42vh, 380px);display:flex;align-items:center;justify-content:center;position:relative;margin:0 auto;cursor:pointer;">' +
      charPortraitHtml +
      '  <div class="fvh-neon-podium ' + curChar + '"></div>' +
      '</div>' +
      '<div class="fvh-hero-gear-dock">' +
      '  <div class="fvh-gear-pill jersey" title="' + (lang === 'ru' ? 'Открыть гардероб' : 'Open Locker') + '">' +
      '    <span class="fvh-gear-icon">' + getUiIconSvg('jersey', 14) + '</span>' +
      '    <span class="fvh-gear-name">' + escapeHtml(equippedJersey) + '</span>' +
      '  </div>' +
      '  <div class="fvh-gear-pill ball" title="' + (lang === 'ru' ? 'Открыть гардероб' : 'Open Locker') + '">' +
      '    <span class="fvh-gear-icon">' + getUiIconSvg(isFooty ? 'nav_home_footy' : 'nav_home_hoops', 14) + '</span>' +
      '    <span class="fvh-gear-name">' + escapeHtml(equippedBall) + '</span>' +
      '  </div>' +
      '</div>';

    stage.querySelector('.fvh-btn-fast-switch').onclick = function(e) {
      e.stopPropagation();
      app.audio.play('click');
      var nextTeam = (curChar === 'footy') ? 'hoops' : 'footy';
      app.store.update(function(d) {
        d.selectedCharacter = nextTeam;
        d.selectedTeam = nextTeam;
      });
      app.showMenu();
    };

    stage.querySelector('.fvh-hero-open-viewport').onclick = function() {
      app.audio.play('click');
      app.openCharacterLocker(curChar);
    };

    stage.querySelectorAll('.fvh-gear-pill').forEach(function(pill) {
      pill.onclick = function(e) {
        e.stopPropagation();
        app.audio.play('click');
        app.openCharacterLocker(curChar);
      };
    });

    screen.appendChild(stage);

    // 3. Dominant High-Voltage PLAY Match Launcher
    var playWrap = document.createElement('div');
    playWrap.className = 'fvh-play-launcher-wrap';

    var playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'fvh-btn-play-hero ' + curChar;
    var playTitle = lang === 'ru' ? '⚡ В БОЙ ➔' : '⚡ PLAY MATCH ➔';
    var playSub = lang === 'ru' ? 'Футбол & Баскетбол · 1v1 Онлайн и Одиночный' : 'Football & Hoops · 1v1 PvP & vs AI';

    playBtn.innerHTML =
      '<div class="play-row">' +
      '  <span class="play-icon">▶</span>' +
      '  <span class="play-text">' + playTitle + '</span>' +
      '</div>' +
      '<span class="play-sub">' + playSub + '</span>';

    playBtn.onclick = function () {
      app.audio.play('click');
      app.showModeSelect();
    };
    playWrap.appendChild(playBtn);
    screen.appendChild(playWrap);

    // 4. Dynamic 2x2 Quick Feature Hub Grid
    var hubGrid = document.createElement('div');
    hubGrid.className = 'fvh-quick-grid';
    hubGrid.innerHTML =
      '<button type="button" class="fvh-quick-tile tile-modes">' +
      '  <div class="fvh-tile-icon">🏟️</div>' +
      '  <div class="fvh-tile-info">' +
      '    <div class="fvh-tile-title">' + (lang === 'ru' ? 'РЕЖИМЫ' : 'MODES') + '</div>' +
      '    <div class="fvh-tile-sub">' + (lang === 'ru' ? 'Футбол & Баскетбол' : 'Soccer & Hoops') + '</div>' +
      '  </div>' +
      '</button>' +
      '<button type="button" class="fvh-quick-tile tile-wardrobe">' +
      '  <div class="fvh-tile-icon">👕</div>' +
      '  <div class="fvh-tile-info">' +
      '    <div class="fvh-tile-title">' + (lang === 'ru' ? 'ГАРДЕРОБ' : 'LOCKER') + '</div>' +
      '    <div class="fvh-tile-sub">' + (lang === 'ru' ? 'Формы, мячи' : 'Kits & Balls') + '</div>' +
      '  </div>' +
      '</button>' +
      '<button type="button" class="fvh-quick-tile tile-shop">' +
      '  <div class="fvh-tile-icon">🛒</div>' +
      '  <div class="fvh-tile-info">' +
      '    <div class="fvh-tile-title">' + (lang === 'ru' ? 'МАГАЗИН' : 'SHOP') + '</div>' +
      '    <div class="fvh-tile-sub">' + (lang === 'ru' ? 'Экипировка клуба' : 'Team Gear') + '</div>' +
      '  </div>' +
      '</button>' +
      '<button type="button" class="fvh-quick-tile tile-quests">' +
      '  <div class="fvh-tile-icon">🎁</div>' +
      '  <div class="fvh-tile-info">' +
      '    <div class="fvh-tile-title">' + (lang === 'ru' ? 'ЗАДАНИЯ' : 'QUESTS') + '</div>' +
      '    <div class="fvh-tile-sub">' + (lang === 'ru' ? 'Pass & Airdrop' : 'Pass & Airdrop') + '</div>' +
      '  </div>' +
      '</button>';

    hubGrid.querySelector('.tile-modes').onclick = function() { app.audio.play('click'); app.showModeSelect(); };
    hubGrid.querySelector('.tile-wardrobe').onclick = function() { app.audio.play('click'); app.openCharacterLocker(curChar); };
    hubGrid.querySelector('.tile-shop').onclick = function() { app.audio.play('click'); app.go('shop'); };
    hubGrid.querySelector('.tile-quests').onclick = function() { app.audio.play('click'); app.go('quests'); };
    screen.appendChild(hubGrid);

    // 5. Airdrop & War Ticker
    var airdropStats = calculateAirdropStats(d);
    var airdropBanner = document.createElement('div');
    airdropBanner.className = 'fvh-airdrop-banner ' + curChar;
    var airdropTokenTag = isFooty ? '<span>⚽ $FOOTY</span>' : '<span>🏀 $HOOPS</span>';

    airdropBanner.innerHTML =
      '<div class="fvh-airdrop-banner-left">' +
      '  <div class="fvh-airdrop-banner-icon">' + getUiIconSvg('coin', 24) + '</div>' +
      '  <div class="fvh-airdrop-banner-text">' +
      '    <div class="fvh-airdrop-banner-title">' + (lang === 'ru' ? 'СЕЗОННЫЙ AIRDROP ' + airdropTokenTag : 'SEASON AIRDROP ' + airdropTokenTag) + '</div>' +
      '    <div class="fvh-airdrop-banner-sub">' +
      (lang === 'ru' ? 'Очки: <b>' + airdropStats.pts.toLocaleString() + ' PTS</b> · Буст: <b>' + airdropStats.multiplier + '</b>' : 'Score: <b>' + airdropStats.pts.toLocaleString() + ' PTS</b> · Boost: <b>' + airdropStats.multiplier + '</b>') +
      '    </div>' +
      '  </div>' +
      '</div>' +
      '<button type="button" class="fvh-airdrop-banner-badge">' + tr('airdropBannerBtn') + '</button>';

    airdropBanner.onclick = function () {
      app.audio.play('click');
      app.go('airdrop');
    };
    screen.appendChild(airdropBanner);

    // Bottom Spacer for iOS WebKit Telegram Mini App safe scrolling
    screen.appendChild(createScrollBottomSpacer());

    // Unified Persistent Bottom Navigation (Floating Cyber Dock)
    screen.appendChild(createSharedBottomNav('menu', app));

    // Show screen
    app.show(screen, 'menu');

    // Onboarding: Prompt player to choose Team Football or Team Basketball on initial entry
    if (!d.teamChosen) {
      setTimeout(function () {
        showTeamSelectionModal(app, false);
      }, 350);
    }
  }`;

// Find boundaries for buildModeSelectPage
const startModeIdx = code.indexOf('function buildModeSelectPage(app) {');
const endModeIdx = code.indexOf('function decorateResultPanelWithTaunt');
const liveWarIdx = code.indexOf('// Live Authoritative Faction War State', startModeIdx);

if (startModeIdx !== -1 && liveWarIdx !== -1) {
  // Replace buildModeSelectPage
  const beforeMode = code.substring(0, startModeIdx);
  const afterMode = code.substring(liveWarIdx);
  code = beforeMode + newBuildModeSelectPage + '\n\n  ' + afterMode;
  console.log('Replaced buildModeSelectPage successfully');
} else {
  console.error('Failed to locate buildModeSelectPage boundaries', { startModeIdx, liveWarIdx });
}

// Find boundaries for renderRedesignedMenu
const startMenuIdx = code.indexOf('function renderRedesignedMenu(app) {');
const endMenuIdx = code.indexOf('function decorateResultPanelWithTaunt', startMenuIdx);

if (startMenuIdx !== -1 && endMenuIdx !== -1) {
  // Find closing of renderRedesignedMenu right before decorateResultPanelWithTaunt
  const beforeMenu = code.substring(0, startMenuIdx);
  // Find where decorateResultPanelWithTaunt starts (with comment)
  const commentIdx = code.lastIndexOf('// Victory / Defeat Faction Taunt Banner', endMenuIdx);
  const targetEnd = commentIdx !== -1 ? commentIdx : endMenuIdx;
  const afterMenu = code.substring(targetEnd);
  code = beforeMenu + newRenderRedesignedMenu + '\n\n  ' + afterMenu;
  console.log('Replaced renderRedesignedMenu successfully');
} else {
  console.error('Failed to locate renderRedesignedMenu boundaries', { startMenuIdx, endMenuIdx });
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('Finished updating redesign.js with radical menu and modes!');
