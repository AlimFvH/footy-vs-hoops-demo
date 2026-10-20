/**
 * FOOTY vs HOOPS - Premium Console UI/UX Reconstruction
 * Full Arcade Experience & Coherent Design System
 */
(function () {
  'use strict';

  function onAppReady(callback) {
    if (window.__fvh && window.__fvh.store) {
      callback(window.__fvh);
    } else {
      var check = setInterval(function () {
        if (window.__fvh && window.__fvh.store) {
          clearInterval(check);
          callback(window.__fvh);
        }
      }, 50);
    }
  }
  function getApiUrl(path) {
    if (!path || typeof path !== 'string') return path;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;

    if (typeof window !== 'undefined') {
      // 1. Explicit window config
      if (window.FVH_CONFIG && window.FVH_CONFIG.apiUrl) {
        var base = window.FVH_CONFIG.apiUrl.replace(/\/+$/, '');
        return base + (path.startsWith('/') ? path : '/' + path);
      }
      // 2. URL query param override, e.g. ?api=http://...
      try {
        if (window.location && window.location.search) {
          var params = new URLSearchParams(window.location.search);
          var apiParam = params.get('api');
          if (apiParam) {
            var clean = apiParam.replace(/\/+$/, '');
            try { localStorage.setItem('fvh_api_url', clean); } catch (e) {}
            return clean + (path.startsWith('/') ? path : '/' + path);
          }
        }
      } catch (e) {}
      // 3. Stored API URL
      try {
        var stored = localStorage.getItem('fvh_api_url');
        if (stored) {
          var baseStored = stored.replace(/\/+$/, '');
          return baseStored + (path.startsWith('/') ? path : '/' + path);
        }
      } catch (e) {}
      // 4. Local dev fallback (file:/// or local static servers on ports like 5500, 3000, 8080)
      if (window.location) {
        var host = window.location.hostname;
        var port = window.location.port;
        if (window.location.protocol === 'file:' || ((host === 'localhost' || host === '127.0.0.1') && port !== '8099')) {
          return 'http://localhost:8099' + (path.startsWith('/') ? path : '/' + path);
        }
      }
    }
    return path;
  }
  // Unified Localization Dictionary with Complete En/Ru Parity
  var I18N = {
    en: {
      playHero: 'PLAY',
      chooseMode: 'SELECT MODE',
      quickMatch: 'QUICK MATCH',
      privateMatch: 'PRIVATE 1v1',
      practiceAI: 'PRACTICE VS AI',
      characters: 'HEROES',
      battlePass: 'BATTLE PASS',
      battlePassShort: 'PASS',
      quests: 'MISSIONS',
      shop: 'STORE',
      profile: 'PROFILE',
      settings: 'SETTINGS',
      rivalryTitle: '$FOOTY vs $HOOPS Rivalry',
      rivalryFormula: '40% Volume · 40% Market Cap · 20% Holders',
      rivalryDemoNote: 'DEMO FEED · Live on-chain oracle syncing in production',
      rivalryTickerSub: 'Rivalry 40/40/20',
      bpSeason: 'Season 1: Kickoff Clash',
      bpTier: 'Level {lvl} / 30',
      bpClaim: 'CLAIM',
      bpClaimed: 'CLAIMED',
      bpLocked: 'LOCKED',
      bpReady: 'READY',
      bpXpNeeded: '{cur}/{need} XP to Level {next}',
      bpFreeNotice: 'Free 30-Tier Track: Play matches and finish daily directives to earn XP!',
      bpClaimAll: 'CLAIM ALL ({n} READY)',
      bpAllClaimed: 'All unlocked tier rewards claimed',
      bpDualTrack: 'Dual-Track Battle Pass',
      bpFreeTrack: 'FREE TRACK',
      bpPremiumTrack: 'PREMIUM VIP TRACK',
      bpUnlockPremium: 'UNLOCK VIP PASS',
      bpPremiumActive: 'VIP PASS ACTIVE',
      bpUnlockPremiumDesc: 'Unlock all 30 premium rewards, exclusive cosmetics, and legendary arenas!',
      bpLateUnlockNotice: 'Instant retroactive unlock! All previously reached premium tiers unlock immediately.',
      bpClaimFree: 'CLAIM FREE',
      bpClaimPremium: 'CLAIM VIP',
      bpRequiresPremium: 'Requires VIP Pass',
      bpPurchaseModalTitle: 'Unlock Premium Pass Season 1',
      bpPurchaseModalDesc: 'Select payment method to activate 30 VIP tiers and instant bonuses:',
      bpPriceStars: '250 ⭐ Stars',
      bpPriceTon: '1.5 💎 TON',
      bpClaimAllFreeAndPrem: 'CLAIM ALL READY ({n})',
      footyChar: 'FOOTY',
      hoopsChar: 'HOOPS',
      footyRole: 'Agile Striker',
      hoopsRole: 'Power Forward',
      footyBadge: '⚽ FOOTY (Football)',
      hoopsBadge: '🏀 HOOPS (Basketball)',
      selectChar: 'SET AS ACTIVE CHAMPION',
      selected: 'ACTIVE CHAMPION',
      openLocker: 'WARDROBE & GEAR',
      tapToInspect: 'Tap player to customize wardrobe, balls & stadiums',
      practiceTitle: 'Practice Match vs AI',
      selectDifficulty: 'Choose match rules and difficulty',
      playMatch: 'START MATCH',
      cancel: 'Cancel',
      easy: 'Easy',
      normal: 'Normal',
      hard: 'Hard',
      football: 'Football',
      basketball: 'Basketball',
      stadiumStore: 'STADIUM STORE',
      storeSub: 'VIRTUAL SPORTS BOUTIQUE · SEASON 1',
      featuredTitle: 'FEATURED DROP OF THE DAY',
      catAll: 'All Items',
      catBundles: 'Bundles',
      catCoins: 'FvH Coins',
      catJerseys: 'Jerseys',
      catBalls: 'Balls',
      catArenas: 'Arenas',
      catCelebrations: 'Celebrations',
      catPacks: 'Packs',
      coinPackageNotice: 'Official internal game sports currency. Separate from future tokens ($FOOTY / $HOOPS).',
      pkgStarter: 'Starter: 500 FvH Coin',
      pkgPro: 'Pro: 1,200 FvH Coin',
      pkgElite: 'Elite: 2,800 FvH Coin',
      pkgChampion: 'Champion: 6,500 FvH Coin',
      pkgLegend: 'Legend: 15,000 FvH Coin',
      buyFor: 'Buy for',
      inCollection: 'In Collection',
      ownedInLocker: 'In Wardrobe',
      equipped: 'Equipped',
      equip: 'Equip',
      inspect: 'Inspect',
      itemDetails: 'Item Details',
      close: 'Close',
      notEnoughCoins: 'Not enough coins! Win matches to earn more.',
      purchaseSuccess: 'Item purchased successfully!',
      packOpened: 'Pack Opened!',
      packAdded: 'Item added to your collection and ready to use!',
      claimAndContinue: 'CLAIM & CONTINUE',
      missionOps: 'MISSION OPERATIONS',
      primeChallenge: 'PRIME DAILY CHALLENGE',
      streakBadge: '{n} DAY STREAK',
      resetsIn: 'Resets in {t}',
      tabGameplay: 'Gameplay Ops',
      tabDaily: 'Daily Ops',
      tabWeekly: 'Weekly Tournaments',
      tabAchievements: 'Achievements',
      tabSocialMedia: 'Official Socials',
      tabInviteFriends: 'Invite Friends',
      tabSocial: 'Socials',
      progress: 'Progress',
      completed: 'Completed',
      inProgress: 'In Progress',
      claim: 'Claim',
      statRecords: 'Career Match Records',
      matches: 'Matches',
      victories: 'Victories',
      defeats: 'Defeats',
      winRate: 'Win Rate',
      sportMetrics: 'Athletic Performance',
      goalsScored: 'Goals Scored',
      hoopsScored: 'Hoops Scored',
      coinsEarned: 'Coins Earned',
      bpUnlocks: 'BP Unlocks',
      packsInventory: 'Sports Packs Inventory',
      packsAvailable: '{n} Available',
      openPack: 'OPEN',
      goToPacks: 'GO TO PACK OPENER',
      visitShopForPacks: 'VISIT SHOP FOR PACKS',
      audioAtmosphere: 'Audio & Atmosphere',
      sfxTitle: 'Sound Effects (SFX)',
      sfxDesc: 'Impact sounds, whistles, cheering crowd',
      musicTitle: 'Arena Music & Beats',
      musicDesc: 'Dynamic electronic stadium themes',
      interfaceLang: 'Interface Language',
      langDesc: 'Select your preferred language. The interface updates instantly.',
      controlsRef: 'Controls Reference',
      moveAthlete: 'Move Athlete',
      moveAthleteKeys: 'WASD / Arrow Keys / Virtual Joystick',
      kickShoot: 'Kick / Shoot',
      kickShootKeys: 'Spacebar / Action Button',
      sprintBoost: 'Sprint Boost',
      sprintBoostKeys: 'Shift Key / Turbo Button',
      pauseMatch: 'Pause Match',
      pauseMatchKeys: 'P / Esc / Pause Button',
      dangerZone: 'Reset Account Progress',
      dangerDesc: 'Resetting will wipe coins, custom equipped items, and match records back to rookie state.',
      resetBtn: 'RESET ALL PROGRESS',
      confirmReset: 'Are you sure you want to reset all game data?',
      lockerTitle: 'WARDROBE & GEAR: {char}',
      slotJersey: 'Jersey / Kit',
      slotBall: 'Match Ball',
      slotArena: 'Home Arena',
      slotCelebration: 'Celebration',
      lockedInShop: 'Locked (Shop 🪙 {price})',
      rarity_common: 'COMMON',
      rarity_rare: 'RARE',
      rarity_epic: 'EPIC',
      rarity_legendary: 'LEGENDARY',
      seasonBannerTitle: 'SEASON 1 ARENA CLASH',
      seasonBannerSub: 'Compete, earn XP, and unlock all 30 milestone tiers',
      q_prime_title: 'Score 5 Points Across All Arenas',
      q_prime_desc: 'Score in football goals or hoops to unlock',
      q_play1_title: 'First Step on Pitch',
      q_play1_desc: 'Play 1 complete match in any discipline',
      q_play3_title: 'Complete 3 Matches',
      q_play3_desc: 'Play in football, basketball, or clash mode',
      q_score_footy_title: 'Striker Precision',
      q_score_footy_desc: 'Score a goal in Football',
      q_score_hoops_title: 'Swish Mastery',
      q_score_hoops_desc: 'Score a basket in Basketball',
      q_score5_title: 'Score 5 Goals or Baskets',
      q_score5_desc: 'Put points on the board against any opponent',
      q_win1_title: 'Achieve Victory',
      q_win1_desc: 'Win at least 1 match today',
      q_try_arena_title: 'World Explorer',
      q_try_arena_desc: 'Equip and play on a scenic themed arena',
      q_duo_athlete_title: 'Two Disciplines',
      q_duo_athlete_desc: 'Play at least 1 match with FOOTY and 1 with HOOPS',
      q_win10_title: 'Weekly Champion',
      q_win10_desc: 'Secure 10 victories this week',
      q_score20_title: 'Shooting Frenzy',
      q_score20_desc: 'Score 20 total goals or hoops',
      q_matches15_title: 'Dedicated Athlete',
      q_matches15_desc: 'Participate in 15 full matches',
      q_first_win_title: 'First Victory',
      q_first_win_desc: 'Win your first competitive match',
      q_footy_master_title: 'Footy Master',
      q_footy_master_desc: 'Win 10 Football matches',
      q_hoops_master_title: 'Hoops All-Star',
      q_hoops_master_desc: 'Win 10 Basketball matches',
      modeSelectTitle: 'GAME MODES',
      modeSelectSubtitle: 'Select your competition arena and challenge level',
      quickMatchTitle: 'Quick Match',
      quickMatchBadge: 'ONLINE 1v1',
      quickMatchDesc: 'Real-time online matchmaking against live athletes worldwide.',
      quickMatchBtn: 'FIND MATCH',
      privateMatchTitle: 'Private Match',
      privateMatchBadge: 'WITH A FRIEND',
      privateMatchDesc: 'Create a private arena room or enter code to duel a friend.',
      privateMatchCreate: 'CREATE ROOM',
      privateMatchJoin: 'JOIN WITH CODE',
      practiceAITitle: 'Practice vs AI',
      practiceAIBadge: 'OFFLINE BOT',
      practiceAIDesc: 'Sharpen your shooting, dribbling, and defense against smart AI.',
      startPracticeBtn: 'START PRACTICE',
      emptyCategory: 'No items owned in this category',
      emptyCategoryDesc: 'Unlock seasonal packs or visit Stadium Store to expand your collection.',
      goToShop: 'GO TO STORE',
      equippedBadge: 'EQUIPPED',
      matchDuration: 'Duration',
      difficulty: 'Difficulty',
      sportType: 'Sport Discipline',
      searchingOpponent: 'Searching for opponent...',
      matchFoundTitle: 'OPPONENT FOUND!',
      startingMatchIn: 'Match starting in {n}...',
      connectingServer: 'Connecting to matchmaking server...',
      serverUnavailable: 'Matchmaking server is currently unavailable. Please check your connection and try again.',
      matchmakingTimeout: 'No online opponents found in queue right now. You can try searching again or invite a friend via Private Room code.',
      tryAgainBtn: 'TRY AGAIN',
      backToLobbyBtn: 'BACK TO LOBBY',
      roomClosed: 'This room session has ended or was closed by the host',
      opponentForfeit: 'Opponent disconnected from arena. Forfeit victory awarded!',
      offlineNotice: 'Offline match plays instantly without network connection.',
      cancelSearch: 'CANCEL',
      roomCodeTitle: 'Room Invite Code:',
      enterRoomCode: 'Enter 6-char Code (e.g. FVH-K8M2)',
      connectRoomBtn: 'CONNECT',
      roomWaitingStatus: 'Waiting for friend to connect...',
      roomReadyStatus: 'Friend connected! Launching arena...',
      roomNotFound: 'Room code not found or expired',
      roomFull: 'Room is already full (2/2 athletes)',
      socialMissionTitle: 'Official Community Channels',
      socialMissionSubtitle: 'Follow official project media to get drops, updates, and token rivalry alerts',
      q_sub_tg_title: 'Join Official Telegram',
      q_sub_tg_desc: 'Stay tuned for game updates, drops, and tournaments',
      q_sub_x_title: 'Follow on X (Twitter)',
      q_sub_x_desc: 'Follow official announcements and on-chain rivalry alerts',
      q_sub_chat_title: 'Join Community Chat',
      q_sub_chat_desc: 'Connect with players, share highlights, and find rivals',
      q_sub_insta_title: 'Follow on Instagram',
      q_sub_insta_desc: 'Official artwork, game reels, and behind-the-scenes',
      q_share_post_title: 'Share Official Post',
      q_share_post_desc: 'Share the Season 1 Kickoff post to earn rewards',
      q_community_event_title: 'Community Clash Event',
      q_community_event_desc: 'Register for the upcoming weekend tournament',
      verifyClaimBtn: 'CHECK & CLAIM',
      referralHubTitle: 'REFERRAL SQUAD HUB',
      referralHubSubtitle: 'Invite friends to FOOTY vs HOOPS and earn massive milestone rewards',
      yourRefLink: 'Your Personal Invite Code & Link:',
      copyInviteLink: 'COPY LINK',
      inviteLinkCopied: 'Invite link copied to clipboard!',
      friendsInvited: 'Verified Friends Invited: {n}',
      refRulesTitle: 'How Invitations Count:',
      refRulesDesc: 'Your friend must open your link, register, and complete at least 1 match. Self-referrals and duplicate devices are strictly prevented.',
      refMilestoneReward: 'Milestone Reward: 🪙 {coins} + {xp} XP',
      subscribeBtn: 'SUBSCRIBE',
      followBtn: 'FOLLOW',
      joinBtn: 'JOIN CHAT',
      inviteFriendBtn: 'INVITE FRIEND',
      arenaSelectTitle: 'ARENA ENVIRONMENTS',
      arenaSelectSub: 'Выбирайте классические стадионы с трибунами или открытые тематические миры',
    arenaDescClassicFooty: 'Традиционный стадион с ухоженным футбольным газоном, полными трибунами зрителей и прожекторами.',
    arenaDescClassicHoops: 'Классический городской стадион с деревянным паркетом, трибунами, зрителями и атмосферой матча.',
      selectArenaBtn: 'EQUIP ARENA',
      buyArenaBtn: 'UNLOCK IN STORE',
      arenaEquipped: 'EQUIPPED ARENA',
      scenicCoastalTitle: 'Coastal Sunset Court',
      scenicCoastalDesc: 'Polished hardwood court with sunset ocean waves, palm trees, and tropical breeze',
      scenicForestTitle: 'Redwood Forest Arena',
      scenicForestDesc: 'Emerald pitch surrounded by lush misty pine trees, redwoods, and mountain air',
      scenicSpaceTitle: 'Orbital Space Colosseum',
      scenicSpaceDesc: 'Futuristic orbital station in zero-G with views of planet Earth, nebula, and stars',
      scenicMarsTitle: 'Mars Bio-Dome Arena',
      scenicMarsDesc: 'Red Martian canyon stadium inside a pressurized bio-dome with terraforming towers',
      scenicMoonTitle: 'Apollo Lunar Arena',
      scenicMoonDesc: 'Moon crater court with lunar dust, Earthrise in the dark sky, and solar glare',
      scenicUnderwaterTitle: 'Abyssal Ocean Dome',
      scenicUnderwaterDesc: 'Deep-sea stadium beneath the ocean with swimming marine life and bioluminescent glow',
      scenicCyberTitle: 'Neo Tokyo Megacity',
      scenicCyberDesc: 'Skyscraper rooftop court framed by holographic neon billboards and night skyline',
      scenicVolcanoTitle: 'Magma Caldera Arena',
      scenicVolcanoDesc: 'Stadium bordered by volcanic rock, distant flowing lava rivers, and embers',
      scenicFloatingTitle: 'Aetheria Sky Islands',
      scenicFloatingDesc: 'Sky sanctuary court on floating islands above the clouds with cascading waterfalls',
      scenicCrystalTitle: 'Prismatic Crystal Cave',
      scenicCrystalDesc: 'Subterranean court in a vast cavern filled with radiant amethyst geodes and reflections',
      bundleIncludedItems: 'Included in Bundle:',
      bundleDiscount: '{n}% OFF',
      bundleAlreadyOwned: 'Already Owned',
      bundleOwnedPartial: '{owned}/{total} Items Owned',
      bundleCompleteSet: 'Complete Set Owned',
      buyWithCoins: 'Pay 🪙 {n}',
      buyWithStars: 'Pay {n} ⭐ Stars',
      buyWithTon: 'Pay {n} 💎 TON',
      starsPrice: '{n} ⭐ Stars',
      tonPrice: '{n} 💎 TON',
      bundleFootyStarterName: 'FOOTY Starter Bundle',
      bundleFootyStarterDesc: 'Equip FOOTY with Cyber Blue jersey, Inferno ball, 500 coins and 2 Bronze Packs.',
      bundleHoopsStarterName: 'HOOPS Starter Bundle',
      bundleHoopsStarterDesc: 'Gear up HOOPS with Sunset Gold jersey, Neon Blaze ball, 500 coins and 2 Pro Packs.',
      bundleOceanArenaName: 'Ocean Arena Collection',
      bundleOceanArenaDesc: 'Abyssal Ocean Dome & Coastal Sunset Court with Tidal Wave & Neon Hydro kit.',
      bundleMarsExplorerName: 'Mars Explorer Collection',
      bundleMarsExplorerDesc: 'Mars Bio-Dome Arena, Solar Blaze ball, Crimson Rover kit and 1,000 Coins.',
      bundleLunarChampName: 'Lunar Championship Collection',
      bundleLunarChampDesc: 'Apollo Lunar Arena, Earthrise match ball, Astronaut silver kit and 1,500 Coins.',
      bundleCyberNeonName: 'Cyber Neon Collection',
      bundleCyberNeonDesc: 'Neo Tokyo Megacity rooftop, Cyber Neon ball, Neon Striker kit and Laser Trail.',
      bundleLegendaryChampsName: 'Legendary Champions Bundle',
      bundleLegendaryChampsDesc: 'All 4 signature jerseys, 4 premium balls, 3 scenic arenas, 5,000 coins and 5 Clash Packs.',
      payWithTelegramStars: 'Telegram Stars',
      payWithTonCrypto: 'TON Cryptocurrency',
      paymentProcessing: 'Processing payment...',
      paymentSuccess: 'Payment Successful! Items unlocked.',
      paymentFailed: 'Payment was not completed.',
      tonTransferInstructions: 'Send {amount} TON to the recipient address with the exact memo below:',
      tonAddress: 'Recipient TON Address',
      tonMemo: 'Payment Memo (Required)',
      copyAddress: 'Copy Address',
      copyMemo: 'Copy Memo',
      checkTonPayment: 'VERIFY TRANSACTION',
      copiedToClipboard: 'Copied to clipboard!',
      tonQrCode: 'Scan with TON Wallet (Tonkeeper, Telegram Wallet)',
      tonPending: 'Waiting for on-chain transaction...',
      tonConfirmed: 'TON transaction verified on-chain!',
      starsRedirect: 'Opening Telegram Stars checkout...'
    },
    ru: {
      playHero: 'ИГРАТЬ',
      chooseMode: 'ВЫБРАТЬ РЕЖИМ',
      quickMatch: 'БЫСТРЫЙ МАТЧ',
      privateMatch: 'ПРИВАТНЫЙ 1v1',
      practiceAI: 'ТРЕНИРОВКА',
      characters: 'ГЕРОИ',
      battlePass: 'БОЕВОЙ ПРОПУСК',
      battlePassShort: 'ПРОПУСК',
      quests: 'ЗАДАНИЯ',
      shop: 'МАГАЗИН',
      profile: 'ПРОФИЛЬ',
      settings: 'ОПЦИИ',
      rivalryTitle: 'Соперничество $FOOTY vs $HOOPS',
      rivalryFormula: '40% Объём · 40% Капитализация · 20% Холдеры',
      rivalryDemoNote: 'ДЕМО ДАННЫЕ · Живой ончейн-фид в разработке',
      rivalryTickerSub: 'Соперничество 40/40/20',
      bpSeason: 'Сезон 1: Стартовый свисток',
      bpTier: 'Уровень {lvl} / 30',
      bpClaim: 'ЗАБРАТЬ',
      bpClaimed: 'ПОЛУЧЕНО',
      bpLocked: 'ЗАКРЫТО',
      bpReady: 'ГОТОВО',
      bpXpNeeded: '{cur}/{need} XP до Уровня {next}',
      bpFreeNotice: 'Бесплатный трек из 30 уровней: зарабатывайте XP в матчах и заданиях!',
      bpClaimAll: 'ЗАБРАТЬ ВСЁ ({n} ГОТОВО)',
      bpAllClaimed: 'Все открытые награды получены',
      bpDualTrack: 'Двухуровневый боевой пропуск',
      bpFreeTrack: 'БЕСПЛАТНЫЙ ТРЕК',
      bpPremiumTrack: 'ПРЕМИУМ VIP ТРЕК',
      bpUnlockPremium: 'ОТКРЫТЬ VIP ПРОПУСК',
      bpPremiumActive: 'VIP ПРОПУСК АКТИВЕН',
      bpUnlockPremiumDesc: 'Откройте все 30 премиум-наград, эксклюзивные арены, скины и легендарные эффекты!',
      bpLateUnlockNotice: 'Мгновенная ретроспективная разблокировка! Все ранее достигнутые уровни откроются сразу.',
      bpClaimFree: 'ЗАБРАТЬ',
      bpClaimPremium: 'ЗАБРАТЬ VIP',
      bpRequiresPremium: 'Требуется Премиум-пропуск',
      bpPurchaseModalTitle: 'Активация Премиум-пропуска',
      bpPurchaseModalDesc: 'Выберите способ оплаты для открытия 30 уровней VIP и бонусов:',
      bpPriceStars: '250 ⭐ Stars',
      bpPriceTon: '1.5 💎 TON',
      bpClaimAllFreeAndPrem: 'ЗАБРАТЬ ВСЕ НАГРАДЫ ({n})',
      footyChar: 'ФУТИ',
      hoopsChar: 'ХУПС',
      footyRole: 'Ловкий нападающий',
      hoopsRole: 'Мощный форвард',
      footyBadge: '⚽ ФУТИ (Футбол)',
      hoopsBadge: '🏀 ХУПС (Баскетбол)',
      selectChar: 'СДЕЛАТЬ АКТИВНЫМ',
      selected: 'АКТИВНЫЙ ЧЕМПИОН',
      openLocker: 'ГАРДЕРОБ И ЭКИПИРОВКА',
      tapToInspect: 'Нажмите на персонажа для настройки гардероба и экипировки',
      practiceTitle: 'Тренировка с ИИ',
      selectDifficulty: 'Выберите сложность и режим',
      playMatch: 'ИГРАТЬ МАТЧ',
      cancel: 'Отмена',
      easy: 'Лёгкая',
      normal: 'Обычная',
      hard: 'Сложная',
      football: 'Футбол',
      basketball: 'Баскетбол',
      stadiumStore: 'СТАДИОННЫЙ МАГАЗИН',
      storeSub: 'СПОРТИВНЫЙ БУТИК · СЕЗОН 1',
      featuredTitle: 'ГЛАВНЫЙ ЭКСКЛЮЗИВ ДНЯ',
      catAll: 'Все товары',
      catBundles: 'Наборы',
      catCoins: 'FvH Монеты',
      catJerseys: 'Форма',
      catBalls: 'Мячи',
      catArenas: 'Арены',
      catCelebrations: 'Празднования',
      catPacks: 'Пакеты',
      coinPackageNotice: 'Официальная внутриигровая спортивная валюта. Полностью отделена от будущих токенов ($FOOTY / $HOOPS).',
      pkgStarter: 'Стартовый: 500 FvH Монет',
      pkgPro: 'Про: 1 200 FvH Монет',
      pkgElite: 'Элитный: 2 800 FvH Монет',
      pkgChampion: 'Чемпион: 6 500 FvH Монет',
      pkgLegend: 'Легенда: 15 000 FvH Монет',
      buyFor: 'Купить за',
      inCollection: 'В коллекции',
      ownedInLocker: 'В гардеробе',
      equipped: 'Надето',
      equip: 'Надеть',
      inspect: 'Осмотр',
      itemDetails: 'Детали предмета',
      close: 'Закрыть',
      notEnoughCoins: 'Недостаточно монет! Побеждайте в матчах, чтобы заработать ещё.',
      purchaseSuccess: 'Предмет успешно приобретен!',
      packOpened: 'Набор открыт!',
      packAdded: 'Предмет добавлен в вашу коллекцию и готов к использованию!',
      claimAndContinue: 'ЗАБРАТЬ И ПРОДОЛЖИТЬ',
      missionOps: 'БОЕВЫЕ ОПЕРАЦИИ',
      primeChallenge: 'ГЛАВНОЕ ЗАДАНИЕ ДНЯ',
      streakBadge: '{n} ДНЕЙ ПОДРЯД',
      resetsIn: 'Обновление через {t}',
      tabGameplay: 'Игровые задания',
      tabDaily: 'Ежедневные',
      tabWeekly: 'Еженедельные',
      tabAchievements: 'Достижения',
      tabSocialMedia: 'Официальные соцсети',
      tabInviteFriends: 'Пригласить друзей',
      tabSocial: 'Соцсети',
      progress: 'Прогресс',
      completed: 'Выполнено',
      inProgress: 'В процессе',
      claim: 'Забрать',
      statRecords: 'Карьерная статистика матчей',
      matches: 'Матчи',
      victories: 'Победы',
      defeats: 'Поражения',
      winRate: 'Винрейт',
      sportMetrics: 'Спортивные показатели',
      goalsScored: 'Забито голов',
      hoopsScored: 'Заброшено мячей',
      coinsEarned: 'Заработано монет',
      bpUnlocks: 'Наград пропуска',
      packsInventory: 'Коллекция наборов',
      packsAvailable: '{n} доступно',
      openPack: 'ОТКРЫТЬ',
      goToPacks: 'ПЕРЕЙТИ К НАБОРАМ',
      visitShopForPacks: 'ПОСЕТИТЬ МАГАЗИН',
      audioAtmosphere: 'Звук и атмосфера',
      sfxTitle: 'Звуковые эффекты (SFX)',
      sfxDesc: 'Удары по мячу, свистки судьи, шум трибун',
      musicTitle: 'Музыка и ритм арены',
      musicDesc: 'Динамичный электронный саундтрек',
      interfaceLang: 'Язык интерфейса',
      langDesc: 'Выберите предпочитаемый язык. Интерфейс переключится моментально.',
      controlsRef: 'Справка по управлению',
      moveAthlete: 'Движение атлета',
      moveAthleteKeys: 'WASD / Стрелки / Виртуальный джойстик',
      kickShoot: 'Удар / Бросок',
      kickShootKeys: 'Пробел / Кнопка действия',
      sprintBoost: 'Турбо-ускорение',
      sprintBoostKeys: 'Shift / Кнопка Турбо',
      pauseMatch: 'Пауза матча',
      pauseMatchKeys: 'P / Esc / Кнопка паузы',
      dangerZone: 'Сброс прогресса аккаунта',
      dangerDesc: 'Сброс удалит все заработанные монеты, экипировку и статистику побед.',
      resetBtn: 'СБРОСИТЬ ПРОГРЕСС',
      confirmReset: 'Вы уверены, что хотите сбросить весь игровой прогресс?',
      lockerTitle: 'ГАРДЕРОБ: {char}',
      slotJersey: 'Комплект формы',
      slotBall: 'Игровой мяч',
      slotArena: 'Домашняя арена',
      slotCelebration: 'Празднование',
      lockedInShop: 'Заблокировано (Магазин 🪙 {price})',
      rarity_common: 'ОБЫЧНЫЙ',
      rarity_rare: 'РЕДКИЙ',
      rarity_epic: 'ЭПИЧЕСКИЙ',
      rarity_legendary: 'ЛЕГЕНДАРНЫЙ',
      itemLockedToast: 'Предмет заблокирован! Купите его в магазине.',
      seasonBannerTitle: 'СЕЗОН 1: БИТВА АРЕН',
      seasonBannerSub: 'Соревнуйтесь, получайте XP и откройте все 30 уровней наград',
      q_prime_title: 'Забейте 5 очков на любых аренах',
      q_prime_desc: 'Забивайте в ворота или забрасывайте в кольцо',
      q_play1_title: 'Первый шаг на поле',
      q_play1_desc: 'Сыграйте 1 полный матч в любой дисциплине',
      q_play3_title: 'Завершите 3 матча',
      q_play3_desc: 'Сыграйте в футбол, баскетбол или клэш',
      q_score_footy_title: 'Точность бомбардира',
      q_score_footy_desc: 'Забейте гол в футболе',
      q_score_hoops_title: 'Чистый бросок',
      q_score_hoops_desc: 'Забросьте мяч в баскетбольное кольцо',
      q_score5_title: 'Забейте 5 мячей',
      q_score5_desc: 'Забивайте в ворота или забрасывайте в кольцо',
      q_win1_title: 'Одержите победу',
      q_win1_desc: 'Победите хотя бы в 1 матче сегодня',
      q_try_arena_title: 'Исследователь миров',
      q_try_arena_desc: 'Сыграйте матч на необычной живописной арене',
      q_duo_athlete_title: 'Две дисциплины',
      q_duo_athlete_desc: 'Сыграйте хотя бы 1 матч за ФУТИ и 1 за ХУПС',
      q_win10_title: 'Чемпион недели',
      q_win10_desc: 'Одержите 10 побед за эту неделю',
      q_score20_title: 'Снайпер арены',
      q_score20_desc: 'Забейте 20 голов или мячей',
      q_matches15_title: 'Опытный спортсмен',
      q_matches15_desc: 'Примите участие в 15 матчах',
      q_first_win_title: 'Первый триумф',
      q_first_win_desc: 'Выиграйте свой первый матч',
      q_footy_master_title: 'Мастер Футбола',
      q_footy_master_desc: 'Выиграйте 10 матчей в футболе',
      q_hoops_master_title: 'Звезда Баскетбола',
      q_hoops_master_desc: 'Выиграйте 10 матчей в баскетболе',
      modeSelectTitle: 'ВЫБОР РЕЖИМА',
      modeSelectSubtitle: 'Выберите формат соревнований и уровень соперника',
      quickMatchTitle: 'Быстрый матч',
      quickMatchBadge: 'ОНЛАЙН 1v1',
      quickMatchDesc: 'Моментальный поиск реального соперника в глобальной сети.',
      quickMatchBtn: 'ПОИСК МАТЧА',
      privateMatchTitle: 'Приватный матч',
      privateMatchBadge: 'С ДРУГОМ',
      privateMatchDesc: 'Создайте закрытую комнату или введите код для дуэли с другом.',
      privateMatchCreate: 'СОЗДАТЬ КОМНАТУ',
      privateMatchJoin: 'ВОЙТИ ПО КОДУ',
      practiceAITitle: 'Тренировка с ИИ',
      practiceAIBadge: 'ОФФЛАЙН БОТ',
      practiceAIDesc: 'Одиночный матч против компьютерного бота для отработки навыков.',
      startPracticeBtn: 'НАЧАТЬ ТРЕНИРОВКУ',
      emptyCategory: 'Пока нет предметов в этой категории',
      emptyCategoryDesc: 'Открывайте наборы или посетите магазин стадиона, чтобы пополнить гардероб.',
      goToShop: 'ПЕРЕЙТИ В МАГАЗИН',
      equippedBadge: 'НАДЕТО',
      matchDuration: 'Длительность',
      difficulty: 'Сложность',
      sportType: 'Вид спорта',
      searchingOpponent: 'Поиск соперника...',
      matchFoundTitle: 'СОПЕРНИК НАЙДЕН!',
      startingMatchIn: 'Запуск матча через {n}...',
      connectingServer: 'Подключение к серверу матчмейкинга...',
      serverUnavailable: 'Сервер матчмейкинга временно недоступен. Проверьте соединение и попробуйте снова.',
      matchmakingTimeout: 'В очереди сейчас нет свободных соперников. Попробуйте поиск снова или пригласите друга по коду комнаты.',
      tryAgainBtn: 'ИСКАТЬ СНОВА',
      backToLobbyBtn: 'В МЕНЮ',
      roomClosed: 'Комната закрыта или сессия была прервана создателем',
      opponentForfeit: 'Соперник покинул арену. Присуждена техническая победа!',
      offlineNotice: 'Оффлайн-матч запускается мгновенно без подключения к сети.',
      cancelSearch: 'ОТМЕНА',
      roomCodeTitle: 'Код комнаты:',
      enterRoomCode: 'Введите код (например, FVH-K8M2)',
      connectRoomBtn: 'ПОДКЛЮЧИТЬСЯ',
      roomWaitingStatus: 'Ожидание подключения друга...',
      roomReadyStatus: 'Друг подключился! Запуск арены...',
      roomNotFound: 'Код комнаты не найден или устарел',
      roomFull: 'В комнате уже есть двое игроков (2/2)',
      socialMissionTitle: 'Официальные каналы сообщества',
      socialMissionSubtitle: 'Подписывайтесь на официальные медиа игры: получайте дропы и новости ончейн-соперничества',
      q_sub_tg_title: 'Подпишись на Telegram',
      q_sub_tg_desc: 'Следите за обновлениями игры, дропами и турнирами',
      q_sub_x_title: 'Подпишись на X (Twitter)',
      q_sub_x_desc: 'Официальные анонсы, новости и ончейн-соперничество',
      q_sub_chat_title: 'Вступи в Чат Сообщества',
      q_sub_chat_desc: 'Общайтесь с игроками, делитесь тактиками и находите соперников',
      q_sub_insta_title: 'Подпишись на Instagram',
      q_sub_insta_desc: 'Официальные арты, игровые ролики и события',
      q_share_post_title: 'Поделись публикацией',
      q_share_post_desc: 'Опубликуйте новость о старте Сезона 1 в соцсетях',
      q_community_event_title: 'Турнир Сообщества',
      q_community_event_desc: 'Зарегистрируйтесь на участие в еженедельном турнире',
      verifyClaimBtn: 'ПРОВЕРИТЬ & ЗАБРАТЬ',
      referralHubTitle: 'РЕФЕРАЛЬНЫЙ ЦЕНТР',
      referralHubSubtitle: 'Приглашайте друзей в FOOTY vs HOOPS и получайте крупные награды за этапы',
      yourRefLink: 'Ваш реферальный код и ссылка:',
      copyInviteLink: 'СКОПИРОВАТЬ ССЫЛКУ',
      inviteLinkCopied: 'Реферальная ссылка скопирована в буфер обмена!',
      friendsInvited: 'Подтверждённых друзей: {n}',
      refRulesTitle: 'Условия зачёта приглашений:',
      refRulesDesc: 'Друг должен перейти по вашей ссылке, зарегистрироваться и сыграть как минимум 1 матч. Накрутки и повторные устройства строго блокируются сервером.',
      refMilestoneReward: 'Награда этапа: 🪙 {coins} + {xp} XP',
      subscribeBtn: 'ПОДПИСАТЬСЯ',
      followBtn: 'ЧИТАТЬ',
      joinBtn: 'ВСТУПИТЬ В ЧАТ',
      inviteFriendBtn: 'ПРИГЛАСИТЬ ДРУГА',
      arenaSelectTitle: 'ВЫБОР АРЕНЫ',
      arenaSelectSub: 'Выберите домашнюю площадку и атмосферу игрового мира',
      selectArenaBtn: 'ВЫБРАТЬ АРЕНУ',
      buyArenaBtn: 'ОТКРЫТЬ В МАГАЗИНЕ',
      arenaEquipped: 'ВЫБРАННАЯ АРЕНА',
      scenicCoastalTitle: 'Прибрежный Паркет у моря',
      scenicCoastalDesc: 'Полированный паркет на фоне заката, морских волн и пальм',
      scenicForestTitle: 'Лесная Арена среди сосен',
      scenicForestDesc: 'Изумрудное поле в окружении хвойного леса, сосен и горного тумана',
      scenicSpaceTitle: 'Орбитальный Колизей',
      scenicSpaceDesc: 'Футуристическая орбитальная станция с панорамой Земли, туманностями и звёздами',
      scenicMarsTitle: 'Марсианский Био-Купол',
      scenicMarsDesc: 'Арена в марсианском каньоне под герметичным куполом с терраформирующими башнями',
      scenicMoonTitle: 'Лунный Кратер Аполлон',
      scenicMoonDesc: 'Площадка в лунном кратере с видом на восход Земли в чёрном звёздном небе',
      scenicUnderwaterTitle: 'Подводный Купол Бездны',
      scenicUnderwaterDesc: 'Глубоководный стадион на дне океана с биолюминесцентными кораллами и рыбами',
      scenicCyberTitle: 'Нео-Токио Мегаполис',
      scenicCyberDesc: 'Крыша футуристического небоскрёба с голографическими неоновыми баннерами',
      scenicVolcanoTitle: 'Вулканическая Кальдера',
      scenicVolcanoDesc: 'Арена среди лавовых рек, базальтовых скал и раскалённого пара',
      scenicFloatingTitle: 'Парящие Острова Этерии',
      scenicFloatingDesc: 'Небесный стадион на парящих скалах над облаками с водопадами',
      scenicCrystalTitle: 'Призматическая Пещера',
      scenicCrystalDesc: 'Подземный стадион в гигантской пещере среди сияющих кристаллов аметиста',
      bundleIncludedItems: 'Содержимое набора:',
      bundleDiscount: 'СКИДКА {n}%',
      bundleAlreadyOwned: 'Уже приобретено',
      bundleOwnedPartial: 'Владеете: {owned} из {total}',
      bundleCompleteSet: 'Весь набор уже в коллекции',
      buyWithCoins: 'Купить за 🪙 {n}',
      buyWithStars: 'Купить за {n} ⭐ Stars',
      buyWithTon: 'Купить за {n} 💎 TON',
      starsPrice: '{n} ⭐ Stars',
      tonPrice: '{n} 💎 TON',
      bundleFootyStarterName: 'Стартовый набор ФУТИ',
      bundleFootyStarterDesc: 'Экипировка ФУТИ: кибер-синяя форма, огненный мяч, 500 монет и 2 бронзовых набора.',
      bundleHoopsStarterName: 'Стартовый набор ХУПС',
      bundleHoopsStarterDesc: 'Экипировка ХУПС: форма "Золотой закат", мяч Неон Блейз, 500 монет и 2 про-набора.',
      bundleOceanArenaName: 'Океаническая коллекция',
      bundleOceanArenaDesc: 'Глубоководный купол и закатный корт с гидро-формой и мячом морской волны.',
      bundleMarsExplorerName: 'Коллекция «Исследователь Марса»',
      bundleMarsExplorerDesc: 'Купол на Марсе, мяч Солнечная вспышка, форма марсохода и 1000 монет.',
      bundleLunarChampName: 'Лунное чемпионство',
      bundleLunarChampDesc: 'Лунная арена Аполлон, мяч Восход Земли, серебряная форма и 1500 монет.',
      bundleCyberNeonName: 'Кибернеон коллекция',
      bundleCyberNeonDesc: 'Крыша Нео-Токио, кибернеоновый мяч, форма Неон Страйкер и лазерный след.',
      bundleLegendaryChampsName: 'Набор легендарных чемпионов',
      bundleLegendaryChampsDesc: 'Все 4 фирменные формы, 4 мяча, 3 атмосферные арены, 5000 монет и 5 супер-наборов.',
      payWithTelegramStars: 'Telegram Stars',
      payWithTonCrypto: 'Криптовалюта TON',
      paymentProcessing: 'Обработка платежа...',
      paymentSuccess: 'Оплата успешна! Награды начислены.',
      paymentFailed: 'Оплата не была завершена.',
      tonTransferInstructions: 'Отправьте {amount} TON на указанный адрес с обязательным комментарием:',
      tonAddress: 'Адрес получателя TON',
      tonMemo: 'Комментарий / Memo (Обязательно)',
      copyAddress: 'Скопировать адрес',
      copyMemo: 'Скопировать комментарий',
      checkTonPayment: 'ПРОВЕРИТЬ ОПЛАТУ',
      copiedToClipboard: 'Скопировано в буфер обмена!',
      tonQrCode: 'Сканируйте кошельком TON (Tonkeeper, Telegram Кошелёк)',
      tonPending: 'Ожидание транзакции в сети TON...',
      tonConfirmed: 'Транзакция TON успешно подтверждена!',
      starsRedirect: 'Открытие оплаты Telegram Stars...'
    }
  };

  // Item Names & Descriptions Localizer
  var ITEM_I18N = {
    ru: {
      'Rookie Blue': 'Форма Новичка',
      'Crimson Comet': 'Алая Комета',
      'Neon Striker': 'Неоновый Страйкер',
      'Frost Giant': 'Ледяной Страж',
      'Shadow Ninja': 'Теневой Ниндзя',
      'Solar Flare': 'Солнечная Вспышка',
      'Cyber Striker': 'Кибер Страйкер',
      'Neon Striker Kit': 'Комплект Неонового Страйкера',
      'Inferno Ball': 'Огненный Мяч',
      'Inferno Ball Skin': 'Скин Мяча "Инферно"',
      'Neon Blaze Ball': 'Мяч "Неоновый Вихрь"',
      'Gold Rain Celebration': 'Празднование "Золотой Дождь"',
      'Rainbow Trail': 'Радужный След',
      'Footy Striker Pack': 'Набор Страйкера FOOTY',
      'Hoops All-Star Pack': 'Набор Олл-Стара HOOPS',
      'Ultimate Clash Pack': 'Легендарный Набор Клэш',
      'Footy Bronze Pack': 'Бронзовый Набор FOOTY',
      'Hoops Pro Pack': 'Про-Набор HOOPS',
      'Ultimate Clash Champion Pack': 'Чемпионский Набор Клэш',
      '150 Starter Coins': '150 Стартовых Монет',
      '100 Coins': '100 Монет',
      '250 Coins': '250 Монет',
      '1000 Mega Coins': '1000 Мега-Монет',
      'Coastal Sunset Court': 'Прибрежный Паркет (Море и Закат)',
      'Redwood Forest Arena': 'Лесная Арена (Хвойный Лес)',
      'Orbital Space Colosseum': 'Орбитальный Колизей (Космос)',
      'Mars Bio-Dome Arena': 'Марсианский Био-Купол (Марс)',
      'Apollo Lunar Arena': 'Лунный Кратер Аполлон (Луна)',
      'Abyssal Ocean Dome': 'Подводный Купол Бездны (Океан)',
      'Neo Tokyo Megacity': 'Нео-Токио Мегаполис (Киберпанк)',
      'Magma Caldera Arena': 'Вулканическая Кальдера (Лава)',
      'Aetheria Sky Islands': 'Парящие Острова Этерии (Небо)',
      'Prismatic Crystal Cave': 'Призматическая Пещера (Кристаллы)',
      'Classic Grass': 'Классический Газон',
      'Night Arena': 'Ночная Арена (Прожекторы)',
      'Golden Hour': 'Золотой Закат',
      'Neon Turf': 'Неоновый Газон',
      'Street Classic': 'Уличный Паркет',
      'Neon Night': 'Неоновый Паркет (Ночь)',
      'Gold Hardwood': 'Золотой Чемпионский Паркет',
      'Matrix Court': 'Кибер-Матрица',
      'Classic Football': 'Классический Мяч',
      'Classic Ball': 'Классический Мяч',
      'Classic Basketball': 'Классический Баскетбольный Мяч',
      'Cyber Blue Jersey': 'Кибер-синяя форма',
      'Sunset Gold Jersey': 'Форма "Золотой закат"',
      'Hydro Striker Kit': 'Гидро-форма "Морская волна"',
      'Mars Rover Kit': 'Форма "Марсоход"',
      'Astronaut Kit': 'Серебряная форма Астронавта',
      'Solar Blaze Ball': 'Мяч "Солнечная вспышка"',
      'Earthrise Ball': 'Мяч "Восход Земли"',
      'Cyber Neon Ball': 'Кибернеоновый мяч',
      'Tidal Wave Ball': 'Мяч "Морская волна"',
      'Laser Trail': 'Лазерный след',
      'Victory Fireworks': 'Праздничный фейерверк',
      'Star Confetti': 'Звёздное конфетти',
      'FOOTY Starter Bundle': 'Стартовый набор ФУТИ',
      'HOOPS Starter Bundle': 'Стартовый набор ХУПС',
      'Ocean Arena Collection': 'Океаническая коллекция',
      'Mars Explorer Collection': 'Коллекция «Исследователь Марса»',
      'Lunar Championship Collection': 'Лунное чемпионство',
      'Cyber Neon Collection': 'Кибернеон коллекция',
      'Legendary Champions Bundle': 'Набор легендарных чемпионов',
      'Skyline Rooftop': 'Крыша Небоскрёба (Панорама)',
      'Turbo Boots': 'Турбо-бутсы',
      'Iron Lungs': 'Железные лёгкие',
      'Sharp Shooter': 'Меткий стрелок',
      'Coin Doubler': 'Удвоитель монет',
      'Classic White': 'Классический белый',
      'Plasma Orb': 'Плазменный шар',
      'Golden Cup': 'Золотой кубок',
      'Inferno': 'Инферно',
      'Street Orange': 'Уличный оранжевый',
      'Neon Blaze': 'Неоновое пламя',
      'Chrome': 'Хром',
      'Midnight': 'Полночь',
      'Confetti Burst': 'Взрыв конфетти',
      'Fireworks': 'Фейерверк',
      'Shockwave': 'Ударная волна',
      'Flame Burst': 'Вспышка пламени',
      'Gold Rain': 'Золотой дождь',
      'Clean Trail': 'Чистый след',
      'Fire Trail': 'Огненный след',
      'Ice Trail': 'Ледяной след',
      'Plain Frame': 'Простая рамка',
      'Bronze Frame': 'Бронзовая рамка',
      'Diamond Frame': 'Алмазная рамка'
    }
  };

  function getActiveLang() {
    var s = (window.__fvh && window.__fvh.store && window.__fvh.store.data && window.__fvh.store.data.settings) || {};
    var lang = s.lang;
    if (!lang || lang === 'auto') {
      return 'ru';
    }
    return (lang === 'en') ? 'en' : 'ru';
  }

  function tr(key, vars) {
    var lang = getActiveLang();
    var dict = I18N[lang] || I18N.ru;
    var str = dict[key] || (I18N.ru && I18N.ru[key]) || (I18N.en && I18N.en[key]) || key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        str = str.split('{' + k + '}').join(vars[k]);
      });
    }
    return str;
  }

  function trItem(name) {
    var lang = getActiveLang();
    if (lang === 'ru' && ITEM_I18N.ru[name]) {
      return ITEM_I18N.ru[name];
    }
    return name;
  }

  function showToast(text) {
    var existing = document.querySelector('.toast-ui');
    if (existing) existing.remove();
    var t = document.createElement('div');
    t.className = 'toast-ui';
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2400);
  }



  // ==========================================
  // High-Fidelity Cyber-Sports Character Avatars
  // ==========================================

  function getFootyAvatarSvg() {
    return '<svg viewBox="0 0 240 290" fill="none" xmlns="http://www.w3.org/2000/svg" class="fvh-hero-avatar-svg">' +
      '<defs>' +
      // Shading and lighting filters
      '<radialGradient id="footyAura" cx="50%" cy="45%" r="55%">' +
      '<stop offset="0%" stop-color="#00f0ff" stop-opacity="0.35"/>' +
      '<stop offset="45%" stop-color="#10b981" stop-opacity="0.18"/>' +
      '<stop offset="85%" stop-color="#080c18" stop-opacity="0"/>' +
      '</radialGradient>' +
      '<linearGradient id="footyBeam" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="#00f0ff" stop-opacity="0.22"/>' +
      '<stop offset="100%" stop-color="#10b981" stop-opacity="0"/>' +
      '</linearGradient>' +
      '<linearGradient id="footyJersey" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="#152438"/>' +
      '<stop offset="50%" stop-color="#0c1726"/>' +
      '<stop offset="100%" stop-color="#060c14"/>' +
      '</linearGradient>' +
      '<linearGradient id="footyChevron" x1="0%" y1="0%" x2="100%" y2="0%">' +
      '<stop offset="0%" stop-color="#00f0ff"/>' +
      '<stop offset="100%" stop-color="#10b981"/>' +
      '</linearGradient>' +
      '<linearGradient id="footySkin" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="#fed7aa"/>' +
      '<stop offset="50%" stop-color="#fba876"/>' +
      '<stop offset="100%" stop-color="#d47942"/>' +
      '</linearGradient>' +
      '<linearGradient id="footyVisor" x1="0%" y1="0%" x2="100%" y2="50%">' +
      '<stop offset="0%" stop-color="#00f0ff"/>' +
      '<stop offset="40%" stop-color="#38bdf8"/>' +
      '<stop offset="100%" stop-color="#10b981"/>' +
      '</linearGradient>' +
      '<linearGradient id="footyCleat" x1="0%" y1="0%" x2="0%" y2="100%">' +
      '<stop offset="0%" stop-color="#334155"/>' +
      '<stop offset="60%" stop-color="#1e293b"/>' +
      '<stop offset="100%" stop-color="#090d16"/>' +
      '</linearGradient>' +
      '<linearGradient id="ballShade" x1="20%" y1="15%" x2="90%" y2="90%">' +
      '<stop offset="0%" stop-color="#ffffff"/>' +
      '<stop offset="40%" stop-color="#e2e8f0"/>' +
      '<stop offset="80%" stop-color="#64748b"/>' +
      '<stop offset="100%" stop-color="#0f172a"/>' +
      '</linearGradient>' +
      '<filter id="cyanGlow" x="-30%" y="-30%" width="160%" height="160%">' +
      '<feGaussianBlur stdDeviation="3.5" result="blur"/>' +
      '<feComposite in="SourceGraphic" in2="blur" operator="over"/>' +
      '</filter>' +
      '<filter id="ballGlow" x="-40%" y="-40%" width="180%" height="180%">' +
      '<feGaussianBlur stdDeviation="4" result="blur"/>' +
      '<feComposite in="SourceGraphic" in2="blur" operator="over"/>' +
      '</filter>' +
      '<pattern id="hexMesh" width="12" height="12" patternUnits="userSpaceOnUse">' +
      '<path d="M6 0L12 3.5V10.5L6 14L0 10.5V3.5Z" fill="none" stroke="#00f0ff" stroke-width="0.35" opacity="0.12"/>' +
      '</pattern>' +
      '</defs>' +

      // Atmosphere aura and stadium spotlights
      '<circle cx="120" cy="140" r="115" fill="url(#footyAura)"/>' +
      '<polygon points="30,0 85,0 155,275 60,275" fill="url(#footyBeam)" opacity="0.35"/>' +
      '<polygon points="175,0 220,0 185,275 130,275" fill="url(#footyBeam)" opacity="0.25"/>' +

      // Soft ground contact shadow
      '<ellipse cx="120" cy="274" rx="76" ry="11" fill="#000000" opacity="0.65"/>' +

      // Legs & High-Tech Football Boots
      // Left leg (viewer right)
      '<path d="M136 172L146 226L160 256L142 262L132 228L126 172Z" fill="#0b121e"/>' +
      '<line x1="145" y1="184" x2="138" y2="242" stroke="#00f0ff" stroke-width="1.8" opacity="0.8"/>' +
      // Left Boot
      '<path d="M142 256L174 259L176 266L138 267L136 260Z" fill="url(#footyCleat)"/>' +
      '<path d="M144 265L174 265L176 269L140 269Z" fill="#00f0ff" filter="url(#cyanGlow)"/>' +
      '<circle cx="146" cy="270" r="1.5" fill="#10b981"/>' +
      '<circle cx="158" cy="270.5" r="1.5" fill="#10b981"/>' +
      '<circle cx="170" cy="270.5" r="1.5" fill="#10b981"/>' +

      // Right leg (viewer left)
      '<path d="M96 172L84 224L72 256L90 262L102 226L108 172Z" fill="#0f192b"/>' +
      '<line x1="93" y1="184" x2="80" y2="242" stroke="#10b981" stroke-width="1.8" opacity="0.8"/>' +
      // Right Boot
      '<path d="M70 256L42 260L40 267L78 267L80 260Z" fill="url(#footyCleat)"/>' +
      '<path d="M42 266L76 266L78 270L40 270Z" fill="#10b981" filter="url(#cyanGlow)"/>' +
      '<circle cx="46" cy="271" r="1.5" fill="#00f0ff"/>' +
      '<circle cx="58" cy="271.5" r="1.5" fill="#00f0ff"/>' +
      '<circle cx="70" cy="271" r="1.5" fill="#00f0ff"/>' +

      // Shorts
      '<path d="M82 138L72 182L115 182L120 150L125 182L162 182L152 138Z" fill="#070c14"/>' +
      '<path d="M72 178L115 178L114 182L72 182Z" fill="url(#footyChevron)"/>' +
      '<path d="M125 178L162 178L162 182L125 182Z" fill="url(#footyChevron)"/>' +
      '<line x1="120" y1="138" x2="120" y2="152" stroke="#00f0ff" stroke-width="1.5" opacity="0.6"/>' +

      // Torso / Jersey
      '<path d="M80 72L66 140L168 140L154 72L136 67L117 76L98 67Z" fill="url(#footyJersey)"/>' +
      '<path d="M80 72L66 140L168 140L154 72L136 67L117 76L98 67Z" fill="url(#hexMesh)"/>' +

      // Cyan V-Neck / Chevron
      '<path d="M88 72L117 114L146 72L138 68L117 99L96 68Z" fill="url(#footyChevron)" filter="url(#cyanGlow)"/>' +

      // Club Crest on right chest
      '<polygon points="90,88 98,88 96,98 90,95" fill="#00f0ff" filter="url(#cyanGlow)"/>' +
      '<circle cx="94" cy="92" r="1.5" fill="#ffffff"/>' +

      // Iconic #10 on chest
      '<text x="117" y="132" font-family="Impact, Arial Black, sans-serif" font-size="30" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.8))">10</text>' +

      // Left Arm (viewer right)
      '<path d="M152 74L186 112L176 122L146 88Z" fill="url(#footySkin)"/>' +
      '<line x1="152" y1="84" x2="178" y2="114" stroke="#d47942" stroke-width="1.5" opacity="0.4"/>' +
      // Wristband & Glove
      '<path d="M174 108L186 120L180 126L168 116Z" fill="#070c14"/>' +
      '<rect x="174" y="110" width="7" height="4" rx="1.5" fill="#00f0ff" filter="url(#cyanGlow)"/>' +

      // Right Arm (viewer left)
      '<path d="M82 74L48 108L58 118L88 88Z" fill="url(#footySkin)"/>' +
      '<line x1="82" y1="84" x2="56" y2="110" stroke="#d47942" stroke-width="1.5" opacity="0.4"/>' +
      // Wristband & Glove
      '<path d="M48 108L38 118L44 124L54 116Z" fill="#070c14"/>' +
      '<rect x="43" y="112" width="7" height="4" rx="1.5" fill="#10b981" filter="url(#cyanGlow)"/>' +

      // Neck
      '<path d="M106 63L106 76L128 76L128 63Z" fill="#d47942"/>' +
      '<path d="M110 63L110 76L124 76L124 63Z" fill="url(#footySkin)"/>' +

      // Head
      '<circle cx="117" cy="42" r="24" fill="url(#footySkin)"/>' +
      // Hair with stylish cyan crest on top
      '<path d="M93 38C93 16 141 16 141 38C134 24 100 24 93 38Z" fill="#090d16"/>' +
      '<polygon points="110,16 124,12 120,24" fill="#00f0ff" filter="url(#cyanGlow)"/>' +
      '<polygon points="117,14 128,15 124,24" fill="#10b981"/>' +

      // Futuristic Cyber-Visor
      '<path d="M99 36Q117 41 135 36L134 46Q117 51 100 46Z" fill="url(#footyVisor)" filter="url(#cyanGlow)"/>' +
      // Visor Frame & Glare
      '<path d="M103 38L122 39" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" opacity="0.85"/>' +
      '<circle cx="99" cy="41" r="2" fill="#00f0ff"/>' +
      '<circle cx="135" cy="41" r="2" fill="#10b981"/>' +

      // Smile & Jaw
      '<path d="M112 53Q117 56 122 53" stroke="#8c431b" stroke-width="2.2" stroke-linecap="round"/>' +

      // High-Tech Cyber Football at foot with realistic hexagonal/pentagonal panels & glowing seams
      '<g transform="translate(36, 226)">' +
      // Outer orbital energy trail
      '<ellipse cx="24" cy="24" rx="30" ry="11" stroke="#00f0ff" stroke-width="2.2" fill="none" transform="rotate(-28, 24, 24)" filter="url(#ballGlow)"/>' +
      '<circle cx="6" cy="14" r="2" fill="#ffffff" filter="url(#cyanGlow)"/>' +
      // 3D Sphere base
      '<circle cx="24" cy="24" r="21" fill="url(#ballShade)"/>' +
      '<circle cx="24" cy="24" r="21" stroke="#00f0ff" stroke-width="1.8" filter="url(#cyanGlow)"/>' +
      // Central pentagon panel
      '<polygon points="24,14 31,19 28,27 20,27 17,19" fill="#070c14" stroke="#00f0ff" stroke-width="1.6"/>' +
      // Hexagonal seam lines to ball perimeter
      '<line x1="24" y1="14" x2="24" y2="4" stroke="#00f0ff" stroke-width="1.6"/>' +
      '<line x1="31" y1="19" x2="41" y2="15" stroke="#00f0ff" stroke-width="1.6"/>' +
      '<line x1="28" y1="27" x2="36" y2="38" stroke="#00f0ff" stroke-width="1.6"/>' +
      '<line x1="20" y1="27" x2="12" y2="38" stroke="#00f0ff" stroke-width="1.6"/>' +
      '<line x1="17" y1="19" x2="7" y2="15" stroke="#00f0ff" stroke-width="1.6"/>' +
      // Specular highlight
      '<ellipse cx="18" cy="14" rx="4" ry="2.5" fill="#ffffff" opacity="0.65" transform="rotate(-20, 18, 14)"/>' +
      '</g>' +
      '</svg>';
  }

  function getHoopsAvatarSvg() {
    return '<svg viewBox="0 0 240 290" fill="none" xmlns="http://www.w3.org/2000/svg" class="fvh-hero-avatar-svg">' +
      '<defs>' +
      // Warm arena aura and neon lighting
      '<radialGradient id="hoopsAura" cx="50%" cy="45%" r="55%">' +
      '<stop offset="0%" stop-color="#f97316" stop-opacity="0.38"/>' +
      '<stop offset="45%" stop-color="#d946ef" stop-opacity="0.2"/>' +
      '<stop offset="85%" stop-color="#080c18" stop-opacity="0"/>' +
      '</radialGradient>' +
      '<linearGradient id="hoopsBeam" x1="100%" y1="0%" x2="0%" y2="100%">' +
      '<stop offset="0%" stop-color="#f97316" stop-opacity="0.25"/>' +
      '<stop offset="100%" stop-color="#d946ef" stop-opacity="0"/>' +
      '</linearGradient>' +
      '<linearGradient id="hoopsJersey" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="#1c1224"/>' +
      '<stop offset="50%" stop-color="#120a1a"/>' +
      '<stop offset="100%" stop-color="#07040a"/>' +
      '</linearGradient>' +
      '<linearGradient id="hoopsSkin" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="#c47a50"/>' +
      '<stop offset="50%" stop-color="#9a522c"/>' +
      '<stop offset="100%" stop-color="#6b3417"/>' +
      '</linearGradient>' +
      '<linearGradient id="hoopsBallGrad" x1="25%" y1="20%" x2="90%" y2="90%">' +
      '<stop offset="0%" stop-color="#ff9a3d"/>' +
      '<stop offset="45%" stop-color="#ea580c"/>' +
      '<stop offset="85%" stop-color="#9a3412"/>' +
      '<stop offset="100%" stop-color="#431407"/>' +
      '</linearGradient>' +
      '<linearGradient id="hoopsSneaker" x1="0%" y1="0%" x2="0%" y2="100%">' +
      '<stop offset="0%" stop-color="#33243a"/>' +
      '<stop offset="60%" stop-color="#1b1222"/>' +
      '<stop offset="100%" stop-color="#09050d"/>' +
      '</linearGradient>' +
      '<filter id="orangeGlow" x="-30%" y="-30%" width="160%" height="160%">' +
      '<feGaussianBlur stdDeviation="3.5" result="blur"/>' +
      '<feComposite in="SourceGraphic" in2="blur" operator="over"/>' +
      '</filter>' +
      '<filter id="magentaGlow" x="-30%" y="-30%" width="160%" height="160%">' +
      '<feGaussianBlur stdDeviation="3.5" result="blur"/>' +
      '<feComposite in="SourceGraphic" in2="blur" operator="over"/>' +
      '</filter>' +
      '<pattern id="meshHoops" width="10" height="10" patternUnits="userSpaceOnUse">' +
      '<circle cx="5" cy="5" r="0.75" fill="#f97316" opacity="0.15"/>' +
      '</pattern>' +
      '</defs>' +

      // Atmosphere aura and spotlights
      '<circle cx="120" cy="140" r="115" fill="url(#hoopsAura)"/>' +
      '<polygon points="210,0 240,0 170,275 115,275" fill="url(#hoopsBeam)" opacity="0.35"/>' +
      '<polygon points="65,0 110,0 85,275 35,275" fill="url(#hoopsBeam)" opacity="0.25"/>' +

      // Soft ground shadow
      '<ellipse cx="120" cy="274" rx="76" ry="11" fill="#000000" opacity="0.65"/>' +

      // Legs & High-Top Basketball Sneakers
      // Right leg (viewer left)
      '<path d="M102 168L92 224L80 254L98 260L108 226L114 168Z" fill="#150d1e"/>' +
      '<line x1="97" y1="180" x2="88" y2="242" stroke="#f97316" stroke-width="1.8" opacity="0.8"/>' +
      // Right Sneaker with Glowing Orange Sole
      '<path d="M78 252L52 256L50 265L88 265L90 256Z" fill="url(#hoopsSneaker)"/>' +
      '<path d="M50 264L88 264L90 268L48 268Z" fill="#f97316" filter="url(#orangeGlow)"/>' +
      '<rect x="62" y="254" width="8" height="3" rx="1.5" fill="#ffffff" opacity="0.8"/>' +

      // Left leg (viewer right)
      '<path d="M138 168L148 222L160 254L142 260L132 226L126 168Z" fill="#110918"/>' +
      '<line x1="143" y1="180" x2="152" y2="242" stroke="#d946ef" stroke-width="1.8" opacity="0.8"/>' +
      // Left Sneaker with Glowing Magenta Sole
      '<path d="M142 252L168 255L170 264L134 265L132 256Z" fill="url(#hoopsSneaker)"/>' +
      '<path d="M136 263L168 263L170 267L134 267Z" fill="#d946ef" filter="url(#magentaGlow)"/>' +
      '<rect x="150" y="254" width="8" height="3" rx="1.5" fill="#ffffff" opacity="0.8"/>' +

      // Shorts with Orange & Magenta Trims
      '<path d="M84 132L72 178L114 178L120 146L126 178L166 178L156 132Z" fill="#0c0712"/>' +
      // Orange trim on right (viewer left)
      '<path d="M72 174L114 174L113 178L72 178Z" fill="#f97316" filter="url(#orangeGlow)"/>' +
      // Magenta trim on left (viewer right)
      '<path d="M126 174L166 174L166 178L126 178Z" fill="#d946ef" filter="url(#magentaGlow)"/>' +

      // Torso / Basketball Jersey
      '<path d="M84 68L68 136L170 136L156 68L140 64L120 72L100 64Z" fill="url(#hoopsJersey)"/>' +
      '<path d="M84 68L68 136L170 136L156 68L140 64L120 72L100 64Z" fill="url(#meshHoops)"/>' +

      // Two-Tone Side Stripes (Orange on left, Magenta on right)
      '<path d="M72 74L78 134L85 134L80 74Z" fill="#f97316" filter="url(#orangeGlow)"/>' +
      '<path d="M168 74L162 134L155 134L160 74Z" fill="#d946ef" filter="url(#magentaGlow)"/>' +

      // Iconic #23 on chest with 3D drop shadow
      '<text x="120" y="122" font-family="Impact, Arial Black, sans-serif" font-size="34" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.8))">23</text>' +

      // Right Arm with Shooting Sleeve (viewer left)
      '<path d="M84 70L50 102L60 110L90 82Z" fill="#1b1224"/>' +
      '<line x1="80" y1="76" x2="56" y2="104" stroke="#f97316" stroke-width="2.5" filter="url(#orangeGlow)"/>' +
      '<line x1="84" y1="82" x2="64" y2="106" stroke="#d946ef" stroke-width="1.8"/>' +
      // Hand
      '<path d="M50 102L40 112L46 118L56 108Z" fill="url(#hoopsSkin)"/>' +

      // Left Arm Raised holding/spinning basketball (viewer right)
      '<path d="M154 70L184 84L190 76L160 64Z" fill="url(#hoopsSkin)"/>' +
      '<path d="M184 84L188 56L176 54L174 80Z" fill="url(#hoopsSkin)"/>' +
      // Hand under ball
      '<path d="M188 56L192 48L182 46L176 54Z" fill="url(#hoopsSkin)"/>' +

      // Neck
      '<path d="M108 58L108 72L132 72L132 58Z" fill="#6b3417"/>' +
      '<path d="M112 58L112 72L128 72L128 58Z" fill="url(#hoopsSkin)"/>' +

      // Head
      '<circle cx="120" cy="38" r="23" fill="url(#hoopsSkin)"/>' +
      // Dark athletic hair
      '<path d="M96 28C96 12 144 12 144 28Z" fill="#09050d"/>' +
      // Orange Headband with white badge
      '<rect x="95" y="26" width="50" height="11" rx="3" fill="#ff6b00" filter="url(#orangeGlow)"/>' +
      '<rect x="114" y="28" width="12" height="7" rx="2" fill="#ffffff"/>' +

      // Eyes & Brow
      '<rect x="109" y="38" width="3.5" height="4.5" rx="1.5" fill="#18131d"/>' +
      '<rect x="127" y="38" width="3.5" height="4.5" rx="1.5" fill="#18131d"/>' +

      // Energetic White Teeth Smile
      '<path d="M112 48Q120 55 128 48Z" fill="#ffffff"/>' +
      '<path d="M112 48Q120 55 128 48" stroke="#5a2710" stroke-width="1.8" fill="none"/>' +

      // Realistic 3D Basketball with glowing cyan orbital ring in HOOPS' hand
      '<g transform="translate(162, 18)">' +
      // Glowing Cyan Orbital Ring
      '<ellipse cx="28" cy="28" rx="33" ry="10" stroke="#00f0ff" stroke-width="2.5" fill="none" transform="rotate(-26, 28, 28)" opacity="0.95" filter="url(#cyanGlow)"/>' +
      '<circle cx="5" cy="18" r="2" fill="#ffffff" filter="url(#cyanGlow)"/>' +
      // 3D Shaded Basketball
      '<circle cx="28" cy="28" r="23" fill="url(#hoopsBallGrad)" filter="url(#orangeGlow)"/>' +
      '<circle cx="28" cy="28" r="23" stroke="#120c18" stroke-width="2.2" fill="none"/>' +
      // Curved Ribbed Black Seams
      '<path d="M5 28H51" stroke="#120c18" stroke-width="2"/>' +
      '<path d="M28 5V51" stroke="#120c18" stroke-width="2"/>' +
      '<path d="M11 11C22 19 22 37 11 45" stroke="#120c18" stroke-width="2"/>' +
      '<path d="M45 11C34 19 34 37 45 45" stroke="#120c18" stroke-width="2"/>' +
      // Specular shine
      '<ellipse cx="20" cy="18" rx="5" ry="3" fill="#ffffff" opacity="0.45" transform="rotate(-30, 20, 18)"/>' +
      '</g>' +
      '</svg>';
  }

  // Official FOOTY vs HOOPS Authentic Emblem (Square 1:1, transparent alpha PNG)
  function getOfficialEmblemHtml() {
    return '<img class="fvh-official-emblem" src="assets/emblem.png" alt="FOOTY vs HOOPS" width="38" height="38">';
  }
  var getOfficialEmblemSvg = getOfficialEmblemHtml;


  // ==========================================
  // Detailed High-Fidelity Shop & Wardrobe Previews
  // ==========================================

  // Detailed Athletic Jersey SVG
  function getDetailedJerseySvg(item, size) {
    var isLg = size === 'large';
    var w = isLg ? 200 : 76;
    var h = isLg ? 200 : 76;
    var id = item.id || '';

    // Color configs based on skin ID
    var primary = '#1e3a8a';
    var secondary = '#38bdf8';
    var accent = '#ffffff';
    var number = '10';
    var stripe = false;
    var sash = false;

    if (id === 'skin_crimson') {
      primary = '#b91c1c'; secondary = '#7f1d1d'; accent = '#fef08a'; number = '7'; stripe = true;
    } else if (id === 'skin_neon' || id === 'skin_neon_elite') {
      primary = '#0f172a'; secondary = '#00f0ff'; accent = '#10b981'; number = '10'; sash = true;
    } else if (id === 'skin_frost') {
      primary = '#0284c7'; secondary = '#e0f2fe'; accent = '#38bdf8'; number = '33';
    } else if (id === 'skin_shadow') {
      primary = '#09090b'; secondary = '#8b5cf6'; accent = '#c084fc'; number = '00'; sash = true;
    } else if (id === 'skin_solar') {
      primary = '#c2410c'; secondary = '#f59e0b'; accent = '#fef08a'; number = '24'; stripe = true;
    } else if (id === 'skin_gold') {
      primary = '#854d0e'; secondary = '#fef08a'; accent = '#ffffff'; number = '1'; sash = true;
    } else if (id === 'skin_cyber') {
      primary = '#581c87'; secondary = '#d946ef'; accent = '#00f0ff'; number = '99'; sash = true;
    }

    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
      '<linearGradient id="jg_' + id + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="' + primary + '"/>' +
      '<stop offset="100%" stop-color="' + secondary + '"/>' +
      '</linearGradient>' +
      '<filter id="glow_' + id + '"><feGaussianBlur stdDeviation="1.5" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>' +
      '</defs>' +
      // Body of Jersey
      '<path d="M28 24L12 40L24 50L30 42L30 84L70 84L70 42L76 50L88 40L72 24L58 32L42 32Z" fill="url(#jg_' + id + ')" stroke="' + accent + '" stroke-width="1.2"/>' +
      // V-Neck Collar
      '<polygon points="42,24 50,34 58,24 54,24 50,30 46,24" fill="' + accent + '"/>' +
      // Design embellishments
      (stripe ?
        '<line x1="42" y1="36" x2="42" y2="84" stroke="' + secondary + '" stroke-width="4"/>' +
        '<line x1="58" y1="36" x2="58" y2="84" stroke="' + secondary + '" stroke-width="4"/>' : '') +
      (sash ?
        '<polygon points="30,42 66,84 70,84 34,42" fill="' + accent + '" opacity="0.85" filter="url(#glow_' + id + ')"/>' : '') +
      // Number
      '<text x="50" y="66" font-family="Impact, Arial Black, sans-serif" font-size="' + (isLg ? '22' : '20') + '" font-weight="900" fill="' + accent + '" text-anchor="middle" letter-spacing="1">' + number + '</text>' +
      // Hem Lines
      '<line x1="30" y1="82" x2="70" y2="82" stroke="' + accent + '" stroke-width="1.5" opacity="0.7"/>' +
      '</svg>';
  }

  // Detailed 3D Ball SVG
  function getDetailedBallSvg(item, size) {
    var isLg = size === 'large';
    var w = isLg ? 200 : 76;
    var h = isLg ? 200 : 76;
    var id = item.id || '';
    var isHoops = id.indexOf('hoops') !== -1;

    if (isHoops) {
      // Basketball variations
      var baseColor = '#ea580c';
      var seamColor = '#120c18';
      var glowFilter = '';
      var orbital = false;

      if (id === 'ball_hoops_blaze') {
        baseColor = '#7e22ce'; seamColor = '#00f0ff'; glowFilter = 'filter="drop-shadow(0 0 6px #00f0ff)"';
      } else if (id === 'ball_hoops_chrome') {
        baseColor = '#94a3b8'; seamColor = '#334155';
      } else if (id === 'ball_hoops_midnight') {
        baseColor = '#1e1b4b'; seamColor = '#f59e0b'; orbital = true;
      }

      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
        '<radialGradient id="bb_' + id + '" cx="35%" cy="30%" r="65%">' +
        '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.4"/>' +
        '<stop offset="40%" stop-color="' + baseColor + '"/>' +
        '<stop offset="100%" stop-color="#0f0702"/>' +
        '</radialGradient>' +
        '</defs>' +
        (orbital ? '<ellipse cx="50" cy="50" rx="46" ry="14" stroke="#00f0ff" stroke-width="2.5" fill="none" transform="rotate(-25, 50, 50)"/>' : '') +
        '<circle cx="50" cy="50" r="38" fill="url(#bb_' + id + ')" ' + glowFilter + '/>' +
        '<circle cx="50" cy="50" r="38" stroke="' + seamColor + '" stroke-width="2.2" fill="none"/>' +
        '<line x1="12" y1="50" x2="88" y2="50" stroke="' + seamColor + '" stroke-width="2"/>' +
        '<line x1="50" y1="12" x2="50" y2="88" stroke="' + seamColor + '" stroke-width="2"/>' +
        '<path d="M22 22C38 34 38 66 22 78" stroke="' + seamColor + '" stroke-width="2" fill="none"/>' +
        '<path d="M78 22C62 34 62 66 78 78" stroke="' + seamColor + '" stroke-width="2" fill="none"/>' +
        '<ellipse cx="38" cy="34" rx="8" ry="4" fill="#ffffff" opacity="0.3" transform="rotate(-30, 38, 34)"/>' +
        '</svg>';
    } else {
      // Football / Soccer variations
      var ballGradStart = '#ffffff';
      var ballGradEnd = '#1e293b';
      var patchColor = '#0f172a';
      var seamColor = '#00f0ff';
      var hasAura = false;

      if (id === 'ball_footy_plasma') {
        ballGradStart = '#00f0ff'; ballGradEnd = '#0f172a'; patchColor = '#10b981'; hasAura = true;
      } else if (id === 'ball_footy_gold') {
        ballGradStart = '#fef08a'; ballGradEnd = '#713f12'; patchColor = '#ca8a04'; seamColor = '#fef08a';
      } else if (id === 'ball_footy_inferno') {
        ballGradStart = '#f97316'; ballGradEnd = '#431407'; patchColor = '#1f0803'; seamColor = '#ef4444'; hasAura = true;
      }

      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
        '<radialGradient id="fb_' + id + '" cx="35%" cy="30%" r="65%">' +
        '<stop offset="0%" stop-color="' + ballGradStart + '"/>' +
        '<stop offset="100%" stop-color="' + ballGradEnd + '"/>' +
        '</radialGradient>' +
        '</defs>' +
        (hasAura ? '<circle cx="50" cy="50" r="42" fill="' + seamColor + '" opacity="0.25"/>' : '') +
        '<circle cx="50" cy="50" r="38" fill="url(#fb_' + id + ')" stroke="' + seamColor + '" stroke-width="2"/>' +
        // Hexagonal / Pentagonal patches
        '<polygon points="50,34 62,42 57,56 43,56 38,42" fill="' + patchColor + '" stroke="' + seamColor + '" stroke-width="1.8"/>' +
        '<line x1="50" y1="34" x2="50" y2="16" stroke="' + seamColor + '" stroke-width="1.8"/>' +
        '<line x1="62" y1="42" x2="78" y2="34" stroke="' + seamColor + '" stroke-width="1.8"/>' +
        '<line x1="57" y1="56" x2="70" y2="72" stroke="' + seamColor + '" stroke-width="1.8"/>' +
        '<line x1="43" y1="56" x2="30" y2="72" stroke="' + seamColor + '" stroke-width="1.8"/>' +
        '<line x1="38" y1="42" x2="22" y2="34" stroke="' + seamColor + '" stroke-width="1.8"/>' +
        '<ellipse cx="38" cy="32" rx="7" ry="3.5" fill="#ffffff" opacity="0.4" transform="rotate(-25, 38, 32)"/>' +
        '</svg>';
    }
  }

  // Detailed Scenic Stadium & Court Artwork (10 Unique Environments)
  function getDetailedStadiumSvg(item, size) {
    var isLg = size === 'large';
    var w = isLg ? 240 : 88;
    var h = isLg ? 150 : 66;
    var id = (item && item.id) || '';

    // 0. Classic Grass Football Stadium (Default with Spectator Stands & Crowd)
    if (id === 'std_footy_classic') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius:8px;overflow:hidden;">' +
        '<defs>' +
        '<linearGradient id="stadiumSky" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#0a1630"/>' +
        '<stop offset="100%" stop-color="#213a5c"/>' +
        '</linearGradient>' +
        '<linearGradient id="grassTurf" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#2f8f3e"/>' +
        '<stop offset="100%" stop-color="#287a35"/>' +
        '</linearGradient>' +
        '</defs>' +
        '<rect width="160" height="52" fill="url(#stadiumSky)"/>' +
        '<rect y="32" width="160" height="24" fill="#1e293b"/>' +
        '<circle cx="20" cy="38" r="2" fill="#ef4444"/><circle cx="35" cy="36" r="2" fill="#3b82f6"/><circle cx="50" cy="40" r="2" fill="#facc15"/><circle cx="65" cy="37" r="2" fill="#ffffff"/><circle cx="80" cy="39" r="2" fill="#ef4444"/><circle cx="95" cy="36" r="2" fill="#22c55e"/><circle cx="110" cy="40" r="2" fill="#3b82f6"/><circle cx="125" cy="37" r="2" fill="#facc15"/><circle cx="140" cy="38" r="2" fill="#ffffff"/>' +
        '<circle cx="25" cy="46" r="2" fill="#3b82f6"/><circle cx="45" cy="44" r="2" fill="#ffffff"/><circle cx="60" cy="48" r="2" fill="#ef4444"/><circle cx="75" cy="45" r="2" fill="#22c55e"/><circle cx="90" cy="47" r="2" fill="#facc15"/><circle cx="105" cy="44" r="2" fill="#ef4444"/><circle cx="120" cy="46" r="2" fill="#3b82f6"/><circle cx="135" cy="45" r="2" fill="#ffffff"/>' +
        '<polygon points="12,14 16,14 18,34 10,34" fill="#475569"/>' +
        '<rect x="8" y="10" width="12" height="6" fill="#fef08a"/>' +
        '<polygon points="144,14 148,14 150,34 142,34" fill="#475569"/>' +
        '<rect x="140" y="10" width="12" height="6" fill="#fef08a"/>' +
        '<polygon points="0,52 160,52 160,100 0,100" fill="url(#grassTurf)"/>' +
        '<polygon points="26,56 134,56 146,96 14,96" fill="none" stroke="#ffffff" stroke-width="1.6" opacity="0.9"/>' +
        '<line x1="80" y1="56" x2="80" y2="96" stroke="#ffffff" stroke-width="1.6"/>' +
        '<ellipse cx="80" cy="76" rx="16" ry="7" fill="none" stroke="#ffffff" stroke-width="1.5"/>' +
        '<rect x="68" y="52" width="24" height="6" fill="none" stroke="#ffffff" stroke-width="1.5"/>' +
        '</svg>';
    }

    // 00. Street Classic Basketball Arena (Default with Spectator Stands & Crowd)
    if (id === 'std_hoops_street') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius:8px;overflow:hidden;">' +
        '<defs>' +
        '<linearGradient id="streetSky" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#05070e"/>' +
        '<stop offset="100%" stop-color="#10162a"/>' +
        '</linearGradient>' +
        '<linearGradient id="hardwood" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#c98a4b"/>' +
        '<stop offset="100%" stop-color="#b87a3e"/>' +
        '</linearGradient>' +
        '</defs>' +
        '<rect width="160" height="52" fill="url(#streetSky)"/>' +
        '<rect y="32" width="160" height="24" fill="#1a1f2e"/>' +
        '<circle cx="20" cy="38" r="2" fill="#f97316"/><circle cx="35" cy="36" r="2" fill="#ec4899"/><circle cx="50" cy="40" r="2" fill="#facc15"/><circle cx="65" cy="37" r="2" fill="#ffffff"/><circle cx="80" cy="39" r="2" fill="#06b6d4"/><circle cx="95" cy="36" r="2" fill="#f97316"/><circle cx="110" cy="40" r="2" fill="#a855f7"/><circle cx="125" cy="37" r="2" fill="#facc15"/><circle cx="140" cy="38" r="2" fill="#ffffff"/>' +
        '<circle cx="25" cy="46" r="2" fill="#ec4899"/><circle cx="45" cy="44" r="2" fill="#ffffff"/><circle cx="60" cy="48" r="2" fill="#f97316"/><circle cx="75" cy="45" r="2" fill="#06b6d4"/><circle cx="90" cy="47" r="2" fill="#facc15"/><circle cx="105" cy="44" r="2" fill="#a855f7"/><circle cx="120" cy="46" r="2" fill="#ec4899"/><circle cx="135" cy="45" r="2" fill="#ffffff"/>' +
        '<rect x="70" y="24" width="20" height="14" fill="rgba(255,255,255,0.4)" stroke="#ffffff" stroke-width="1"/>' +
        '<circle cx="80" cy="38" r="4.5" fill="none" stroke="#ff6a1a" stroke-width="1.8"/>' +
        '<polygon points="0,52 160,52 160,100 0,100" fill="url(#hardwood)"/>' +
        '<polygon points="30,56 130,56 142,96 18,96" fill="none" stroke="#ffffff" stroke-width="1.6"/>' +
        '<ellipse cx="80" cy="76" rx="14" ry="7" fill="none" stroke="#ffffff" stroke-width="1.5"/>' +
        '<line x1="80" y1="56" x2="80" y2="96" stroke="#ffffff" stroke-width="1.5"/>' +
        '</svg>';
    }

    // 1. Ocean Arena (Coastal Sunset Court)
    if (id === 'std_ocean_sunset') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius:8px;overflow:hidden;">' +
        '<defs>' +
        '<linearGradient id="oceanSky" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#ec4899"/>' +
        '<stop offset="45%" stop-color="#f97316"/>' +
        '<stop offset="100%" stop-color="#fef08a"/>' +
        '</linearGradient>' +
        '<linearGradient id="oceanWater" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#0284c7"/>' +
        '<stop offset="50%" stop-color="#06b6d4"/>' +
        '<stop offset="100%" stop-color="#14b8a6"/>' +
        '</linearGradient>' +
        '<linearGradient id="oceanWood" x1="0%" y1="0%" x2="100%" y2="0%">' +
        '<stop offset="0%" stop-color="#b45309"/>' +
        '<stop offset="50%" stop-color="#d97706"/>' +
        '<stop offset="100%" stop-color="#92400e"/>' +
        '</linearGradient>' +
        '</defs>' +
        '<rect width="160" height="52" fill="url(#oceanSky)"/>' +
        '<circle cx="80" cy="50" r="18" fill="#fef08a" opacity="0.95"/>' +
        '<rect y="50" width="160" height="22" fill="url(#oceanWater)"/>' +
        '<path d="M0 56 Q20 54 40 56 T80 56 T120 56 T160 56" stroke="#ffffff" stroke-width="1.2" opacity="0.6"/>' +
        '<path d="M0 64 Q20 62 40 64 T80 64 T120 64 T160 64" stroke="#ffffff" stroke-width="1.4" opacity="0.8"/>' +
        '<path d="M12 70 Q18 45 22 28 Q24 20 26 12" stroke="#1c1917" stroke-width="3" fill="none"/>' +
        '<path d="M26 12 Q14 10 6 18 M26 12 Q20 4 10 6 M26 12 Q34 6 42 12 M26 12 Q36 16 38 24 M26 12 Q24 20 20 26" stroke="#1c1917" stroke-width="2" fill="none"/>' +
        '<path d="M148 70 Q142 45 138 28 Q136 20 134 12" stroke="#1c1917" stroke-width="3" fill="none"/>' +
        '<path d="M134 12 Q146 10 154 18 M134 12 Q140 4 150 6 M134 12 Q126 6 118 12 M134 12 Q124 16 122 24" stroke="#1c1917" stroke-width="2" fill="none"/>' +
        '<polygon points="0,72 160,72 160,100 0,100" fill="url(#oceanWood)"/>' +
        '<polygon points="30,76 130,76 142,98 18,98" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.9"/>' +
        '<ellipse cx="80" cy="87" rx="14" ry="7" fill="none" stroke="#ffffff" stroke-width="1.5"/>' +
        '<line x1="80" y1="76" x2="80" y2="98" stroke="#ffffff" stroke-width="1.5"/>' +
        '</svg>';
    }

    // 2. Redwood Forest Arena
    if (id === 'std_forest_redwood') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius:8px;overflow:hidden;">' +
        '<defs>' +
        '<linearGradient id="forestSky" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#0f2b1d"/>' +
        '<stop offset="50%" stop-color="#164e32"/>' +
        '<stop offset="100%" stop-color="#86efac"/>' +
        '</linearGradient>' +
        '<linearGradient id="forestTurf" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#15803d"/>' +
        '<stop offset="100%" stop-color="#14532d"/>' +
        '</linearGradient>' +
        '</defs>' +
        '<rect width="160" height="58" fill="url(#forestSky)"/>' +
        '<polygon points="40,0 60,0 85,58 55,58" fill="#fef08a" opacity="0.15"/>' +
        '<polygon points="100,0 120,0 145,58 115,58" fill="#fef08a" opacity="0.12"/>' +
        '<polygon points="20,18 28,38 12,38" fill="#064e3b" opacity="0.7"/>' +
        '<polygon points="45,12 55,36 35,36" fill="#064e3b" opacity="0.7"/>' +
        '<polygon points="115,14 125,36 105,36" fill="#064e3b" opacity="0.7"/>' +
        '<polygon points="140,20 148,40 132,40" fill="#064e3b" opacity="0.7"/>' +
        '<polygon points="10,4 22,50 -2,50" fill="#022c22"/>' +
        '<polygon points="28,10 38,54 18,54" fill="#022c22"/>' +
        '<polygon points="150,6 162,50 138,50" fill="#022c22"/>' +
        '<polygon points="132,12 142,54 122,54" fill="#022c22"/>' +
        '<rect y="48" width="160" height="12" fill="#ffffff" opacity="0.25"/>' +
        '<polygon points="0,58 160,58 160,100 0,100" fill="url(#forestTurf)"/>' +
        '<polygon points="24,62 136,62 148,96 12,96" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.85"/>' +
        '<line x1="80" y1="62" x2="80" y2="96" stroke="#ffffff" stroke-width="1.5"/>' +
        '<ellipse cx="80" cy="79" rx="16" ry="7" fill="none" stroke="#ffffff" stroke-width="1.5"/>' +
        '</svg>';
    }

    // 3. Space Orbit Arena (Orbital Colosseum)
    if (id === 'std_space_orbit') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius:8px;overflow:hidden;">' +
        '<defs>' +
        '<linearGradient id="spaceSky" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#030712"/>' +
        '<stop offset="50%" stop-color="#0f172a"/>' +
        '<stop offset="100%" stop-color="#1e1b4b"/>' +
        '</linearGradient>' +
        '<linearGradient id="spaceDeck" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#0f172a"/>' +
        '<stop offset="100%" stop-color="#020617"/>' +
        '</linearGradient>' +
        '</defs>' +
        '<rect width="160" height="58" fill="url(#spaceSky)"/>' +
        // Stars
        '<circle cx="20" cy="12" r="1" fill="#ffffff" opacity="0.9"/>' +
        '<circle cx="55" cy="8" r="0.8" fill="#00f0ff" opacity="0.8"/>' +
        '<circle cx="85" cy="18" r="1.2" fill="#ffffff" opacity="0.9"/>' +
        '<circle cx="125" cy="10" r="0.8" fill="#facc15" opacity="0.8"/>' +
        '<circle cx="145" cy="22" r="1" fill="#ffffff" opacity="0.9"/>' +
        // Earth horizon glow
        '<circle cx="80" cy="120" r="85" fill="#0284c7" opacity="0.35"/>' +
        '<circle cx="80" cy="120" r="82" fill="#0369a1" opacity="0.6"/>' +
        '<path d="M30 46 Q80 38 130 46" stroke="#38bdf8" stroke-width="2" fill="none" opacity="0.9"/>' +
        // Station solar trusses
        '<rect x="8" y="22" width="28" height="12" fill="#0369a1" stroke="#00f0ff" stroke-width="1"/>' +
        '<rect x="124" y="22" width="28" height="12" fill="#0369a1" stroke="#00f0ff" stroke-width="1"/>' +
        '<line x1="0" y1="28" x2="160" y2="28" stroke="#00f0ff" stroke-width="1.2" opacity="0.5"/>' +
        // High-tech Titanium Deck
        '<polygon points="0,58 160,58 160,100 0,100" fill="url(#spaceDeck)"/>' +
        '<polygon points="26,62 134,62 146,96 14,96" fill="none" stroke="#00f0ff" stroke-width="1.8"/>' +
        '<line x1="80" y1="62" x2="80" y2="96" stroke="#00f0ff" stroke-width="1.6"/>' +
        '<ellipse cx="80" cy="79" rx="18" ry="8" fill="none" stroke="#f43f5e" stroke-width="1.8"/>' +
        '<circle cx="80" cy="79" r="2.5" fill="#00f0ff"/>' +
        '</svg>';
    }

    // 4. Mars Bio-Dome Arena
    if (id === 'std_mars_dome') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius:8px;overflow:hidden;">' +
        '<defs>' +
        '<linearGradient id="marsSky" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#450a0a"/>' +
        '<stop offset="60%" stop-color="#991b1b"/>' +
        '<stop offset="100%" stop-color="#f97316"/>' +
        '</linearGradient>' +
        '<linearGradient id="marsGround" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#9a3412"/>' +
        '<stop offset="100%" stop-color="#7c2d12"/>' +
        '</linearGradient>' +
        '</defs>' +
        '<rect width="160" height="58" fill="url(#marsSky)"/>' +
        // Geodesic Dome Arches
        '<path d="M10 58 Q80 6 150 58" stroke="#fdba74" stroke-width="2" fill="none" opacity="0.6"/>' +
        '<path d="M30 58 Q80 18 130 58" stroke="#fdba74" stroke-width="1.5" fill="none" opacity="0.4"/>' +
        '<line x1="80" y1="12" x2="80" y2="58" stroke="#fdba74" stroke-width="1" opacity="0.4"/>' +
        '<line x1="45" y1="24" x2="45" y2="58" stroke="#fdba74" stroke-width="1" opacity="0.3"/>' +
        '<line x1="115" y1="24" x2="115" y2="58" stroke="#fdba74" stroke-width="1" opacity="0.3"/>' +
        // Martian Red Dunes
        '<path d="M0 48 Q40 40 85 48 T160 44 L160 58 L0 58 Z" fill="#7c2d12" opacity="0.8"/>' +
        // Red Basalt Court
        '<polygon points="0,58 160,58 160,100 0,100" fill="url(#marsGround)"/>' +
        '<polygon points="24,62 136,62 148,96 12,96" fill="none" stroke="#ffedd5" stroke-width="1.6"/>' +
        '<line x1="80" y1="62" x2="80" y2="96" stroke="#ffedd5" stroke-width="1.5"/>' +
        '<ellipse cx="80" cy="79" rx="16" ry="7" fill="none" stroke="#f97316" stroke-width="1.8"/>' +
        '</svg>';
    }

    // 5. Apollo Lunar Arena
    if (id === 'std_moon_crater') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius:8px;overflow:hidden;">' +
        '<defs>' +
        '<linearGradient id="moonFloor" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#475569"/>' +
        '<stop offset="100%" stop-color="#1e293b"/>' +
        '</linearGradient>' +
        '</defs>' +
        '<rect width="160" height="58" fill="#050811"/>' +
        // Earthrise
        '<circle cx="120" cy="22" r="14" fill="#0284c7"/>' +
        '<circle cx="118" cy="20" r="13" fill="#38bdf8" opacity="0.4"/>' +
        '<path d="M112 18 Q120 14 126 22 Q122 28 116 26 Z" fill="#ffffff" opacity="0.8"/>' +
        // Stadium Floodlights
        '<polygon points="20,12 24,12 26,58 18,58" fill="#94a3b8"/>' +
        '<circle cx="22" cy="12" r="3" fill="#facc15"/>' +
        '<polygon points="136,12 140,12 142,58 134,58" fill="#94a3b8"/>' +
        '<circle cx="138" cy="12" r="3" fill="#facc15"/>' +
        // Lunar Crater Ridges
        '<path d="M0 50 Q30 42 70 50 T160 48 L160 58 L0 58 Z" fill="#334155"/>' +
        // Regolith Court
        '<polygon points="0,58 160,58 160,100 0,100" fill="url(#moonFloor)"/>' +
        '<polygon points="26,62 134,62 146,96 14,96" fill="none" stroke="#facc15" stroke-width="1.6"/>' +
        '<line x1="80" y1="62" x2="80" y2="96" stroke="#facc15" stroke-width="1.5"/>' +
        '<ellipse cx="80" cy="79" rx="16" ry="7" fill="none" stroke="#ffffff" stroke-width="1.5"/>' +
        '</svg>';
    }

    // 6. Abyssal Ocean Dome
    if (id === 'std_underwater_dome') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius:8px;overflow:hidden;">' +
        '<defs>' +
        '<linearGradient id="abyssWater" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#082f49"/>' +
        '<stop offset="60%" stop-color="#0e7490"/>' +
        '<stop offset="100%" stop-color="#06b6d4"/>' +
        '</linearGradient>' +
        '<linearGradient id="aquaFloor" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#0f766e"/>' +
        '<stop offset="100%" stop-color="#042f2e"/>' +
        '</linearGradient>' +
        '</defs>' +
        '<rect width="160" height="58" fill="url(#abyssWater)"/>' +
        // Dome Arch
        '<path d="M8 58 Q80 8 152 58" stroke="#67e8f9" stroke-width="2.5" fill="none" opacity="0.7"/>' +
        '<path d="M25 58 Q80 20 135 58" stroke="#67e8f9" stroke-width="1.5" fill="none" opacity="0.4"/>' +
        // Bioluminescent creatures
        '<ellipse cx="40" cy="25" rx="6" ry="3" fill="#a5f3fc" opacity="0.8"/>' +
        '<path d="M46 25 Q52 23 56 26" stroke="#a5f3fc" stroke-width="1" fill="none"/>' +
        '<ellipse cx="115" cy="32" rx="5" ry="2.5" fill="#a5f3fc" opacity="0.7"/>' +
        // Water caustics
        '<path d="M10 40 Q40 32 80 40 T150 36" stroke="#cffafe" stroke-width="1" opacity="0.4" fill="none"/>' +
        // Aquamarine Court
        '<polygon points="0,58 160,58 160,100 0,100" fill="url(#aquaFloor)"/>' +
        '<polygon points="26,62 134,62 146,96 14,96" fill="none" stroke="#22d3ee" stroke-width="1.8"/>' +
        '<line x1="80" y1="62" x2="80" y2="96" stroke="#22d3ee" stroke-width="1.5"/>' +
        '<ellipse cx="80" cy="79" rx="16" ry="7" fill="none" stroke="#5eead4" stroke-width="1.8"/>' +
        '</svg>';
    }

    // 7. Neo Tokyo Cyberpunk Megacity
    if (id === 'std_cyber_megacity') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius:8px;overflow:hidden;">' +
        '<defs>' +
        '<linearGradient id="cyberSky" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#180828"/>' +
        '<stop offset="60%" stop-color="#3b0764"/>' +
        '<stop offset="100%" stop-color="#581c87"/>' +
        '</linearGradient>' +
        '<linearGradient id="cyberPitch" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#1e1b4b"/>' +
        '<stop offset="100%" stop-color="#090514"/>' +
        '</linearGradient>' +
        '</defs>' +
        '<rect width="160" height="58" fill="url(#cyberSky)"/>' +
        // Skyscrapers with glowing neon windows
        '<rect x="12" y="16" width="22" height="42" fill="#0f172a" stroke="#d946ef" stroke-width="1"/>' +
        '<rect x="16" y="22" width="4" height="6" fill="#f43f5e"/>' +
        '<rect x="24" y="22" width="4" height="6" fill="#00f0ff"/>' +
        '<rect x="16" y="34" width="4" height="6" fill="#00f0ff"/>' +
        '<rect x="24" y="34" width="4" height="6" fill="#f43f5e"/>' +
        '<rect x="42" y="8" width="28" height="50" fill="#090d16" stroke="#00f0ff" stroke-width="1"/>' +
        '<rect x="48" y="14" width="16" height="4" fill="#00f0ff" opacity="0.9"/>' +
        '<rect x="94" y="12" width="26" height="46" fill="#090d16" stroke="#f43f5e" stroke-width="1"/>' +
        '<rect x="126" y="20" width="22" height="38" fill="#0f172a" stroke="#a855f7" stroke-width="1"/>' +
        // Neon traffic light streaks
        '<line x1="0" y1="52" x2="160" y2="52" stroke="#00f0ff" stroke-width="1.5" opacity="0.7"/>' +
        '<line x1="0" y1="55" x2="160" y2="55" stroke="#f43f5e" stroke-width="1.2" opacity="0.8"/>' +
        // Cyber Court
        '<polygon points="0,58 160,58 160,100 0,100" fill="url(#cyberPitch)"/>' +
        '<polygon points="26,62 134,62 146,96 14,96" fill="none" stroke="#00f0ff" stroke-width="1.8"/>' +
        '<line x1="80" y1="62" x2="80" y2="96" stroke="#00f0ff" stroke-width="1.5"/>' +
        '<ellipse cx="80" cy="79" rx="16" ry="7" fill="none" stroke="#d946ef" stroke-width="2"/>' +
        '</svg>';
    }

    // 8. Magma Caldera Volcano
    if (id === 'std_volcano_caldera') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius:8px;overflow:hidden;">' +
        '<defs>' +
        '<linearGradient id="volcanoSky" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#18181b"/>' +
        '<stop offset="50%" stop-color="#450a0a"/>' +
        '<stop offset="100%" stop-color="#7f1d1d"/>' +
        '</linearGradient>' +
        '<linearGradient id="lavaFloor" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#27272a"/>' +
        '<stop offset="100%" stop-color="#09090b"/>' +
        '</linearGradient>' +
        '</defs>' +
        '<rect width="160" height="58" fill="url(#volcanoSky)"/>' +
        // Distant smoking volcano peaks
        '<polygon points="40,24 65,58 15,58" fill="#27272a"/>' +
        '<polygon points="120,20 150,58 90,58" fill="#27272a"/>' +
        // Molten lava streams
        '<path d="M40 28 Q48 40 52 58" stroke="#f97316" stroke-width="2.5" fill="none"/>' +
        '<path d="M120 25 Q115 38 118 58" stroke="#ef4444" stroke-width="2" fill="none"/>' +
        // Flying sparks / embers
        '<circle cx="35" cy="18" r="1.2" fill="#fbbf24"/>' +
        '<circle cx="75" cy="28" r="1.5" fill="#f97316"/>' +
        '<circle cx="125" cy="14" r="1.2" fill="#fbbf24"/>' +
        // Obsidian Rock Pitch
        '<polygon points="0,58 160,58 160,100 0,100" fill="url(#lavaFloor)"/>' +
        '<polygon points="26,62 134,62 146,96 14,96" fill="none" stroke="#f97316" stroke-width="1.8"/>' +
        '<line x1="80" y1="62" x2="80" y2="96" stroke="#f97316" stroke-width="1.5"/>' +
        '<ellipse cx="80" cy="79" rx="16" ry="7" fill="none" stroke="#ef4444" stroke-width="2"/>' +
        '<circle cx="80" cy="79" r="2.5" fill="#fbbf24"/>' +
        '</svg>';
    }

    // 9. Aetheria Sky Islands
    if (id === 'std_floating_islands') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius:8px;overflow:hidden;">' +
        '<defs>' +
        '<linearGradient id="skyHeaven" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#0284c7"/>' +
        '<stop offset="50%" stop-color="#38bdf8"/>' +
        '<stop offset="100%" stop-color="#bae6fd"/>' +
        '</linearGradient>' +
        '<linearGradient id="marbleFloor" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#e2e8f0"/>' +
        '<stop offset="100%" stop-color="#cbd5e1"/>' +
        '</linearGradient>' +
        '</defs>' +
        '<rect width="160" height="58" fill="url(#skyHeaven)"/>' +
        // Floating cloud puffs
        '<ellipse cx="30" cy="46" rx="28" ry="10" fill="#ffffff" opacity="0.8"/>' +
        '<ellipse cx="130" cy="48" rx="32" ry="12" fill="#ffffff" opacity="0.85"/>' +
        // Floating rock island with waterfall
        '<polygon points="60,20 100,20 90,44 70,44" fill="#78716c"/>' +
        '<line x1="80" y1="26" x2="80" y2="52" stroke="#e0f2fe" stroke-width="2" opacity="0.9"/>' +
        // Sky palace spire
        '<polygon points="78,8 82,8 84,20 76,20" fill="#facc15"/>' +
        // Sky Marble Court
        '<polygon points="0,58 160,58 160,100 0,100" fill="url(#marbleFloor)"/>' +
        '<polygon points="26,62 134,62 146,96 14,96" fill="none" stroke="#0284c7" stroke-width="1.8"/>' +
        '<line x1="80" y1="62" x2="80" y2="96" stroke="#0284c7" stroke-width="1.5"/>' +
        '<ellipse cx="80" cy="79" rx="16" ry="7" fill="none" stroke="#eab308" stroke-width="1.8"/>' +
        '</svg>';
    }

    // 10. Prismatic Crystal Cave
    if (id === 'std_crystal_cavern') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius:8px;overflow:hidden;">' +
        '<defs>' +
        '<linearGradient id="caveCeiling" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#0f0728"/>' +
        '<stop offset="50%" stop-color="#1e1b4b"/>' +
        '<stop offset="100%" stop-color="#312e81"/>' +
        '</linearGradient>' +
        '<linearGradient id="crystalFloor" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#431407"/>' +
        '<stop offset="50%" stop-color="#2e1065"/>' +
        '<stop offset="100%" stop-color="#170d38"/>' +
        '</linearGradient>' +
        '</defs>' +
        '<rect width="160" height="58" fill="url(#caveCeiling)"/>' +
        // Crystal stalactites from ceiling
        '<polygon points="20,0 26,0 23,24" fill="#a855f7"/>' +
        '<polygon points="45,0 52,0 48,32" fill="#06b6d4"/>' +
        '<polygon points="80,0 88,0 84,20" fill="#ec4899"/>' +
        '<polygon points="115,0 123,0 119,30" fill="#a855f7"/>' +
        '<polygon points="140,0 148,0 144,22" fill="#06b6d4"/>' +
        // Crystal clusters rising from edges
        '<polygon points="4,58 12,38 18,58" fill="#c084fc"/>' +
        '<polygon points="144,58 150,36 156,58" fill="#38bdf8"/>' +
        // Glowing Crystal Floor
        '<polygon points="0,58 160,58 160,100 0,100" fill="url(#crystalFloor)"/>' +
        '<polygon points="26,62 134,62 146,96 14,96" fill="none" stroke="#c084fc" stroke-width="1.8"/>' +
        '<line x1="80" y1="62" x2="80" y2="96" stroke="#c084fc" stroke-width="1.5"/>' +
        '<ellipse cx="80" cy="79" rx="16" ry="7" fill="none" stroke="#22d3ee" stroke-width="1.8"/>' +
        '</svg>';
    }

    // 11. Skyline Rooftop Court (High-altitude skyscraper basketball)
    if (id === 'std_hoops_sky' || id.indexOf('skyline') !== -1 || id.indexOf('rooftop') !== -1) {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius:8px;overflow:hidden;">' +
        '<defs>' +
        '<linearGradient id="rooftopSky" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#1e1b4b"/>' +
        '<stop offset="55%" stop-color="#4c1d95"/>' +
        '<stop offset="100%" stop-color="#ea580c"/>' +
        '</linearGradient>' +
        '<linearGradient id="rooftopDeck" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#334155"/>' +
        '<stop offset="100%" stop-color="#0f172a"/>' +
        '</linearGradient>' +
        '</defs>' +
        '<rect width="160" height="60" fill="url(#rooftopSky)"/>' +
        // City skyline background towers
        '<rect x="8" y="24" width="18" height="36" fill="#090d16" opacity="0.9"/>' +
        '<rect x="30" y="14" width="22" height="46" fill="#0f172a"/>' +
        '<rect x="34" y="18" width="3" height="4" fill="#facc15" opacity="0.8"/>' +
        '<rect x="42" y="18" width="3" height="4" fill="#facc15" opacity="0.8"/>' +
        '<rect x="34" y="26" width="3" height="4" fill="#facc15" opacity="0.8"/>' +
        '<rect x="56" y="28" width="16" height="32" fill="#090d16" opacity="0.85"/>' +
        '<rect x="96" y="10" width="26" height="50" fill="#0f172a"/>' +
        '<rect x="102" y="16" width="4" height="4" fill="#38bdf8" opacity="0.9"/>' +
        '<rect x="112" y="16" width="4" height="4" fill="#38bdf8" opacity="0.9"/>' +
        '<rect x="102" y="24" width="4" height="4" fill="#38bdf8" opacity="0.9"/>' +
        '<rect x="126" y="22" width="22" height="38" fill="#090d16" opacity="0.9"/>' +
        // Antennas with blinking red warning lights
        '<line x1="41" y1="6" x2="41" y2="14" stroke="#f43f5e" stroke-width="1.5"/>' +
        '<circle cx="41" cy="5" r="1.5" fill="#f43f5e"/>' +
        '<line x1="109" y1="2" x2="109" y2="10" stroke="#f43f5e" stroke-width="1.5"/>' +
        '<circle cx="109" cy="2" r="1.5" fill="#f43f5e"/>' +
        // Rooftop Court Surface
        '<polygon points="0,60 160,60 160,100 0,100" fill="url(#rooftopDeck)"/>' +
        '<polygon points="26,64 134,64 146,96 14,96" fill="none" stroke="#f97316" stroke-width="1.8"/>' +
        '<line x1="80" y1="64" x2="80" y2="96" stroke="#f97316" stroke-width="1.5"/>' +
        '<ellipse cx="80" cy="80" rx="16" ry="7" fill="none" stroke="#facc15" stroke-width="1.8"/>' +
        // Basketball hoop silhouettes
        '<line x1="28" y1="52" x2="28" y2="70" stroke="#e2e8f0" stroke-width="1.5"/>' +
        '<rect x="25" y="48" width="6" height="5" fill="#f97316"/>' +
        '<line x1="132" y1="52" x2="132" y2="70" stroke="#e2e8f0" stroke-width="1.5"/>' +
        '<rect x="129" y="48" width="6" height="5" fill="#f97316"/>' +
        '</svg>';
    }

    // Classic Football Pitch fallback
    if (id.indexOf('footy_classic') !== -1 || id.indexOf('turf') !== -1) {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius:8px;overflow:hidden;">' +
        '<rect width="160" height="100" fill="#15803d"/>' +
        '<rect x="0" y="0" width="160" height="20" fill="#166534"/>' +
        '<rect x="0" y="40" width="160" height="20" fill="#166534"/>' +
        '<rect x="0" y="80" width="160" height="20" fill="#166534"/>' +
        '<rect x="15" y="10" width="130" height="80" fill="none" stroke="#ffffff" stroke-width="2"/>' +
        '<line x1="80" y1="10" x2="80" y2="90" stroke="#ffffff" stroke-width="2"/>' +
        '<circle cx="80" cy="50" r="18" fill="none" stroke="#ffffff" stroke-width="2"/>' +
        '</svg>';
    }

    // Default High-Tech Arena Frame
    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius:8px;overflow:hidden;">' +
      '<rect width="160" height="100" fill="#0f172a"/>' +
      '<polygon points="20,15 140,15 152,85 8,85" fill="#1e293b" stroke="#00f0ff" stroke-width="1.5"/>' +
      '<ellipse cx="80" cy="50" rx="25" ry="14" fill="none" stroke="#f97316" stroke-width="1.8"/>' +
      '<line x1="80" y1="15" x2="80" y2="85" stroke="#00f0ff" stroke-width="1.5"/>' +
      '</svg>';
  }

  // Detailed Celebration Burst SVG
  function getDetailedCelebrationSvg(item, size) {
    var isLg = size === 'large';
    var w = isLg ? 160 : 76;
    var h = isLg ? 160 : 76;
    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="50" cy="50" r="30" fill="#f59e0b" opacity="0.2"/>' +
      '<polygon points="50,15 54,38 78,35 58,50 68,75 50,60 32,75 42,50 22,35 46,38" fill="#facc15"/>' +
      '<circle cx="20" cy="25" r="3" fill="#ec4899"/>' +
      '<circle cx="80" cy="25" r="3" fill="#00f0ff"/>' +
      '<circle cx="85" cy="70" r="3" fill="#10b981"/>' +
      '<circle cx="15" cy="70" r="3" fill="#f97316"/>' +
      '</svg>';
  }

  // Detailed Mystery Pack Booster SVG
  function getDetailedPackSvg(item, size) {
    var isLg = size === 'large';
    var w = isLg ? 160 : 76;
    var h = isLg ? 190 : 88;
    var id = item.id || '';
    var pColor = id === 'hoops' ? '#ea580c' : id === 'clash' ? '#eab308' : '#00f0ff';

    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="15" y="8" width="70" height="104" rx="6" fill="#0f172a" stroke="' + pColor + '" stroke-width="2.5"/>' +
      '<path d="M15 18L85 18 M15 102L85 102" stroke="' + pColor + '" stroke-width="1.5" stroke-dasharray="3 2"/>' +
      '<circle cx="50" cy="58" r="20" fill="' + pColor + '" opacity="0.25"/>' +
      '<text x="50" y="65" font-family="Impact, Arial Black" font-size="20" fill="#ffffff" text-anchor="middle">' + (id === 'hoops' ? '🏀' : id === 'clash' ? '⚡' : '⚽') + '</text>' +
      '</svg>';
  }

  // Universal Item Artwork Dispatcher
  function renderItemArtwork(item, size) {
    if (!item) return '<div class="fvh-item-fallback">📦</div>';
    var cat = item.category || '';
    if (cat === 'skins') return getDetailedJerseySvg(item, size);
    if (cat === 'balls') return getDetailedBallSvg(item, size);
    if (cat === 'stadiums') return getDetailedStadiumSvg(item, size);
    if (cat === 'celebrations') return getDetailedCelebrationSvg(item, size);
    if (cat === 'packs') return getDetailedPackSvg(item, size);
    return '<div class="fvh-item-fallback" style="font-size:' + (size === 'large' ? '64px' : '32px') + ';">' + (item.icon || '👕') + '</div>';
  }


  // ==========================================
  // Shared Bottom Navigation Bar (5 Primary Tabs)
  // ==========================================

  function createSharedBottomNav(activeTab, app) {
    var nav = document.createElement('nav');
    nav.className = 'fvh-bottom-nav';

    var primaryItems = [
      { id: 'menu', icon: '⚽', label: tr('playHero') },
      { id: 'characters', icon: '👕', label: tr('characters') },
      { id: 'quests', icon: '🎯', label: tr('quests') },
      { id: 'shop', icon: '🛒', label: tr('shop') },
      { id: 'battlepass', icon: '👑', label: tr('battlePassShort') }
    ];

    primaryItems.forEach(function (it) {
      var btn = document.createElement('button');
      var isActive = it.id === activeTab;
      btn.className = 'fvh-nav-item' + (isActive ? ' active' : '');
      btn.setAttribute('type', 'button');
      btn.setAttribute('aria-label', it.label);
      btn.innerHTML =
        '<span class="fvh-nav-icon">' + it.icon + '</span>' +
        '<span class="fvh-nav-label">' + it.label + '</span>';
      btn.onclick = function () {
        if (!isActive) {
          app.audio.play('click');
          app.go(it.id);
        }
      };
      nav.appendChild(btn);
    });

    return nav;
  }



  // 30 Levels Battle Pass Dual-Track Config (Free & VIP Premium)
  var BATTLE_PASS_LEVELS = (function () {
    var freeItemsPool = [
      { type: 'coins', name: '100 Coins', icon: '🪙', val: 100 },
      { type: 'coins', name: '250 Coins', icon: '🪙', val: 250 },
      { type: 'pack', name: 'Footy Striker Pack', icon: '🎁', packId: 'footy' },
      { type: 'pack', name: 'Hoops All-Star Pack', icon: '🎁', packId: 'hoops' },
      { type: 'pack', name: 'Footy Bronze Pack', icon: '🎁', packId: 'footy' },
      { type: 'pack', name: 'Hoops Pro Pack', icon: '🎁', packId: 'hoops' },
      { type: 'pack', name: 'Ultimate Clash Pack', icon: '⚡', packId: 'clash' }
    ];

    var levels = [];
    for (var i = 1; i <= 30; i++) {
      var xpReq = 100 + (i - 1) * 35; // XP curve

      // Free Track Reward
      var freeReward;
      if (i === 1) freeReward = { type: 'coins', name: '150 Starter Coins', icon: '🪙', val: 150 };
      else if (i === 5) freeReward = { type: 'pack', name: 'Footy Bronze Pack', icon: '🎁', packId: 'footy' };
      else if (i === 10) freeReward = { type: 'cosmetic', name: 'Neon Striker Kit', icon: '🎽', itemId: 'skin_neon' };
      else if (i === 15) freeReward = { type: 'pack', name: 'Hoops Pro Pack', icon: '🎁', packId: 'hoops' };
      else if (i === 20) freeReward = { type: 'cosmetic', name: 'Inferno Ball Skin', icon: '🔥', itemId: 'ball_footy_inferno' };
      else if (i === 25) freeReward = { type: 'coins', name: '1000 Mega Coins', icon: '🪙', val: 1000 };
      else if (i === 30) freeReward = { type: 'pack', name: 'Ultimate Clash Champion Pack', icon: '⚡', packId: 'clash' };
      else {
        var pickFree = freeItemsPool[(i * 3) % freeItemsPool.length];
        freeReward = Object.assign({}, pickFree);
      }

      // Premium VIP Track Reward (Exclusive Arenas, Kits, Balls, Celebrations & VIP Coins)
      var premiumReward;
      if (i === 1) premiumReward = { type: 'cosmetic', name: 'Cyber Blue Jersey', icon: '🎽', itemId: 'skin_cyber' };
      else if (i === 2) premiumReward = { type: 'coins', name: '300 VIP Coins', icon: '🪙', val: 300 };
      else if (i === 3) premiumReward = { type: 'cosmetic', name: 'Neon Blaze Ball', icon: '💫', itemId: 'ball_hoops_blaze' };
      else if (i === 4) premiumReward = { type: 'coins', name: '500 VIP Coins', icon: '🪙', val: 500 };
      else if (i === 5) premiumReward = { type: 'cosmetic', name: 'Gold Rain Celebration', icon: '✨', itemId: 'cel_goldrain' };
      else if (i === 6) premiumReward = { type: 'coins', name: '600 VIP Coins', icon: '🪙', val: 600 };
      else if (i === 7) premiumReward = { type: 'cosmetic', name: 'Solar Blaze Ball', icon: '☀️', itemId: 'ball_footy_solar' };
      else if (i === 8) premiumReward = { type: 'pack', name: 'Ultimate Clash Pack', icon: '⚡', packId: 'clash' };
      else if (i === 9) premiumReward = { type: 'coins', name: '750 VIP Coins', icon: '🪙', val: 750 };
      else if (i === 10) premiumReward = { type: 'cosmetic', name: 'Coastal Sunset Court', icon: '🏖️', itemId: 'arena_coastal' };
      else if (i === 11) premiumReward = { type: 'cosmetic', name: 'Rainbow Trail', icon: '🌈', itemId: 'trail_rainbow' };
      else if (i === 12) premiumReward = { type: 'coins', name: '1000 VIP Coins', icon: '🪙', val: 1000 };
      else if (i === 13) premiumReward = { type: 'cosmetic', name: 'Mars Rover Kit', icon: '🚀', itemId: 'skin_mars' };
      else if (i === 14) premiumReward = { type: 'coins', name: '1200 VIP Coins', icon: '🪙', val: 1200 };
      else if (i === 15) premiumReward = { type: 'cosmetic', name: 'Mars Bio-Dome Arena', icon: '🪐', itemId: 'arena_mars' };
      else if (i === 16) premiumReward = { type: 'cosmetic', name: 'Laser Trail', icon: '⚡', itemId: 'trail_laser' };
      else if (i === 17) premiumReward = { type: 'coins', name: '1500 VIP Coins', icon: '🪙', val: 1500 };
      else if (i === 18) premiumReward = { type: 'cosmetic', name: 'Victory Fireworks', icon: '🎆', itemId: 'cel_fireworks' };
      else if (i === 19) premiumReward = { type: 'coins', name: '1800 VIP Coins', icon: '🪙', val: 1800 };
      else if (i === 20) premiumReward = { type: 'cosmetic', name: 'Apollo Lunar Arena', icon: '🌙', itemId: 'arena_moon' };
      else if (i === 21) premiumReward = { type: 'cosmetic', name: 'Star Confetti', icon: '🌟', itemId: 'cel_confetti' };
      else if (i === 22) premiumReward = { type: 'coins', name: '2000 VIP Coins', icon: '🪙', val: 2000 };
      else if (i === 23) premiumReward = { type: 'cosmetic', name: 'Earthrise Ball', icon: '🌍', itemId: 'ball_earthrise' };
      else if (i === 24) premiumReward = { type: 'coins', name: '2500 VIP Coins', icon: '🪙', val: 2500 };
      else if (i === 25) premiumReward = { type: 'cosmetic', name: 'Neo Tokyo Megacity', icon: '🏙️', itemId: 'arena_cyber' };
      else if (i === 26) premiumReward = { type: 'cosmetic', name: 'Astronaut Kit', icon: '👨‍🚀', itemId: 'skin_astronaut' };
      else if (i === 27) premiumReward = { type: 'coins', name: '3000 VIP Coins', icon: '🪙', val: 3000 };
      else if (i === 28) premiumReward = { type: 'cosmetic', name: 'Tidal Wave Ball', icon: '🌊', itemId: 'ball_tidal' };
      else if (i === 29) premiumReward = { type: 'cosmetic', name: 'Abyssal Ocean Dome', icon: '🌊', itemId: 'arena_underwater' };
      else if (i === 30) premiumReward = { type: 'coins', name: '5000 VIP Coins', icon: '🪙', val: 5000 };

      levels.push({
        level: i,
        xpRequired: xpReq,
        freeReward: freeReward,
        premiumReward: premiumReward,
        reward: freeReward // Legacy backward compatibility
      });
    }
    return levels;
  })();

  function getBattlePassState(store) {
    if (!store.data.battlePass) {
      store.data.battlePass = { claimedFree: [], claimedPremium: [], isPremium: false };
    }
    var bp = store.data.battlePass;
    // Migration helper
    if (!bp.claimedFree && bp.claimed) {
      bp.claimedFree = bp.claimed.slice();
    }
    if (!bp.claimedFree) bp.claimedFree = [];
    if (!bp.claimedPremium) bp.claimedPremium = [];
    bp.isPremium = !!bp.isPremium;

    var totalXp = store.data.xp || 0;
    var currentLevel = 1;
    var xpAccum = 0;
    for (var i = 0; i < BATTLE_PASS_LEVELS.length; i++) {
      if (totalXp >= xpAccum + BATTLE_PASS_LEVELS[i].xpRequired) {
        xpAccum += BATTLE_PASS_LEVELS[i].xpRequired;
        currentLevel = Math.min(30, i + 2);
      } else {
        break;
      }
    }
    var curLvlConfig = BATTLE_PASS_LEVELS[Math.min(29, currentLevel - 1)];
    var intoLvl = Math.max(0, totalXp - xpAccum);
    var needed = curLvlConfig.xpRequired;

    var claimableFreeCount = 0;
    var claimablePremiumCount = 0;
    for (var l = 1; l <= currentLevel; l++) {
      if (bp.claimedFree.indexOf(l) === -1) {
        claimableFreeCount++;
      }
      if (bp.isPremium && bp.claimedPremium.indexOf(l) === -1) {
        claimablePremiumCount++;
      }
    }

    return {
      level: currentLevel,
      intoLevel: intoLvl,
      needed: needed,
      percent: Math.min(100, Math.floor((intoLvl / needed) * 100)),
      isPremium: bp.isPremium,
      claimedFree: bp.claimedFree,
      claimedPremium: bp.claimedPremium,
      claimed: bp.claimedFree, // Backward compatibility
      claimableFreeCount: claimableFreeCount,
      claimablePremiumCount: claimablePremiumCount,
      claimableCount: claimableFreeCount + claimablePremiumCount
    };
  }

  function applyRewardToStore(d, rew) {
    if (!rew) return;
    if (rew.type === 'coins') {
      d.coins = (d.coins || 0) + (rew.val || 0);
    } else if (rew.type === 'pack') {
      if (!d.packs) d.packs = { free: {}, paid: {} };
      if (!d.packs.free) d.packs.free = {};
      d.packs.free[rew.packId] = (d.packs.free[rew.packId] || 0) + 1;
    } else if (rew.type === 'cosmetic') {
      if (!d.owned) d.owned = [];
      if (d.owned.indexOf(rew.itemId) === -1) {
        d.owned.push(rew.itemId);
      }
    }
  }

  function getAppPlayerId(app) {
    if (app && app.store && app.store.data && app.store.data.playerId) {
      return app.store.data.playerId;
    }
    var saved = null;
    try { saved = localStorage.getItem('fvh_player_id'); } catch (e) {}
    if (!saved) {
      saved = 'fvh_' + Math.random().toString(36).slice(2, 10);
      try { localStorage.setItem('fvh_player_id', saved); } catch (e) {}
    }
    if (app && app.store && app.store.data) {
      app.store.data.playerId = saved;
    }
    return saved;
  }

  function safeEconomyApi(endpoint, body) {
    return fetch(getApiUrl(endpoint), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    })
    .then(function (res) {
      return res.json().then(function (json) {
        if (!res.ok) {
          json.ok = false;
        }
        return json;
      }).catch(function () {
        return { ok: res.ok, status: res.status };
      });
    })
    .catch(function (err) {
      console.warn('Backend economy offline or unreachable:', err);
      return { ok: false, offline: true, error: 'network_error', message: err.message };
    });
  }

  function syncAuthoritativeEconomy(app, callback) {
    if (!app || !app.store || !app.store.data) return;
    var pid = getAppPlayerId(app);
    var d = app.store.data;
    safeEconomyApi('/api/economy/sync', {
      playerId: pid,
      owned: d.owned || [],
      equipped: d.equipped || {},
      coins: d.coins || 0,
      xp: d.xp || 0,
      isPremium: Boolean(d.battlePass && d.battlePass.isPremium)
    }).then(function (res) {
      if (res && res.ok) {
        app.store.update(function (storeData) {
          storeData.playerId = res.playerId;
          storeData.coins = res.coins;
          storeData.xp = res.xp;
          if (Array.isArray(res.owned)) storeData.owned = res.owned;
          if (res.equipped) storeData.equipped = res.equipped;
          if (res.battlePass) storeData.battlePass = res.battlePass;
          if (res.packs) storeData.packs = res.packs;
        });
      }
      if (callback) callback(res);
    });
  }

  function claimBattlePassTier(app, lvl, track, onDone) {
    var bpState = getBattlePassState(app.store);
    track = track || 'free';

    if (lvl > bpState.level) {
      app.audio.play('error');
      return;
    }

    if (track === 'free') {
      if (bpState.claimedFree.indexOf(lvl) !== -1) {
        app.audio.play('error');
        return;
      }
    } else if (track === 'premium') {
      if (!bpState.isPremium || bpState.claimedPremium.indexOf(lvl) !== -1) {
        app.audio.play('error');
        return;
      }
    }

    var cfg = BATTLE_PASS_LEVELS[lvl - 1];
    var rew = track === 'premium' ? cfg.premiumReward : cfg.freeReward;
    var pid = getAppPlayerId(app);

    safeEconomyApi('/api/economy/reward', {
      playerId: pid,
      rewardType: 'battlepass',
      level: lvl,
      track: track,
      idempotencyKey: 'bp_' + pid + '_' + lvl + '_' + track
    }).then(function (res) {
      if (res && res.ok) {
        app.store.update(function (d) {
          d.coins = res.coins;
          d.xp = res.xp;
          d.owned = res.owned;
          d.packs = res.packs;
          d.battlePass = res.battlePass;
        });
      } else {
        // Fallback local update if backend offline
        app.store.update(function (d) {
          if (!d.battlePass) d.battlePass = { claimedFree: [], claimedPremium: [], isPremium: false };
          if (track === 'free') {
            if (!d.battlePass.claimedFree) d.battlePass.claimedFree = [];
            if (d.battlePass.claimedFree.indexOf(lvl) === -1) d.battlePass.claimedFree.push(lvl);
          } else {
            if (!d.battlePass.claimedPremium) d.battlePass.claimedPremium = [];
            if (d.battlePass.claimedPremium.indexOf(lvl) === -1) d.battlePass.claimedPremium.push(lvl);
          }
          applyRewardToStore(d, rew);
        });
      }

      app.audio.play('claim');
      var badge = track === 'premium' ? '👑 VIP' : tr('bpFreeTrack');
      showToast('🎁 ' + trItem(rew.name) + ' (' + badge + ' ' + tr('bpTier', { lvl: lvl }) + ')');
      if (onDone) onDone();
    });
  }

  function claimAllBattlePassTiers(app, onDone) {
    var bpState = getBattlePassState(app.store);
    if (bpState.claimableCount === 0) {
      app.audio.play('error');
      return;
    }

    var pid = getAppPlayerId(app);
    safeEconomyApi('/api/economy/reward', {
      playerId: pid,
      rewardType: 'battlepass_all',
      idempotencyKey: 'bp_all_' + pid + '_' + Date.now()
    }).then(function (res) {
      if (res && res.ok) {
        app.store.update(function (d) {
          d.coins = res.coins;
          d.xp = res.xp;
          d.owned = res.owned;
          d.packs = res.packs;
          d.battlePass = res.battlePass;
        });
      } else {
        // Fallback local claim all
        app.store.update(function (d) {
          if (!d.battlePass) d.battlePass = { claimedFree: [], claimedPremium: [], isPremium: false };
          if (!d.battlePass.claimedFree) d.battlePass.claimedFree = [];
          if (!d.battlePass.claimedPremium) d.battlePass.claimedPremium = [];

          for (var l = 1; l <= bpState.level; l++) {
            var cfg = BATTLE_PASS_LEVELS[l - 1];
            if (d.battlePass.claimedFree.indexOf(l) === -1) {
              d.battlePass.claimedFree.push(l);
              applyRewardToStore(d, cfg.freeReward);
            }
            if (bpState.isPremium && d.battlePass.claimedPremium.indexOf(l) === -1) {
              d.battlePass.claimedPremium.push(l);
              applyRewardToStore(d, cfg.premiumReward);
            }
          }
        });
      }

      app.audio.play('claim');
      showToast('🎉 ' + tr('bpAllClaimed'));
      if (onDone) onDone();
    });
  }

  // ========================================================
  // Universal Secure Payment Modal (Telegram Stars & TON)
  // ========================================================
  function openUniversalPaymentModal(app, options) {
    var productId = options.productId;
    var title = options.title || 'Checkout';
    var starsPrice = options.starsPrice || 250;
    var tonPrice = options.tonPrice || 1.5;
    var coinsPrice = options.coinsPrice || 0;
    var hideTon = options.hideTon || (productId === 'battlepass_premium');
    var onPurchased = options.onPurchased;

    var overlay = document.createElement('div');
    overlay.className = 'modal-back';
    var modal = document.createElement('div');
    modal.className = 'modal fvh-payment-modal';
    modal.style.maxWidth = '420px';
    modal.style.width = '100%';
    modal.style.boxSizing = 'border-box';
    modal.style.textAlign = 'center';

    function renderSelectionScreen() {
      modal.innerHTML =
        '<div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">' +
        tr('bpPurchaseModalTitle') +
        '</div>' +
        '<h2 style="margin:0 0 8px;font-size:18px;color:var(--text-pure);word-break:break-word;">' + title + '</h2>' +
        '<p style="color:var(--text-muted);font-size:12px;line-height:1.4;margin:0 0 16px;">' +
        tr('bpPurchaseModalDesc') +
        '</p>' +
        '<div class="fvh-pay-methods" style="display:flex;flex-direction:column;gap:10px;margin-bottom:18px;">' +
        '  <button class="btn fvh-pay-opt-stars" style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:linear-gradient(135deg,rgba(255,200,0,0.15) 0%,rgba(255,140,0,0.15) 100%);border:1.5px solid rgba(255,200,0,0.4);border-radius:12px;cursor:pointer;">' +
        '    <span style="display:flex;align-items:center;gap:10px;font-weight:800;font-size:14px;color:#fde047;">' +
        '      <span style="font-size:22px;">⭐</span> ' + tr('payWithTelegramStars') +
        '    </span>' +
        '    <span style="font-weight:900;font-size:14px;color:#fef08a;">' + starsPrice + ' ⭐</span>' +
        '  </button>' +
        (!hideTon ?
          '  <button class="btn fvh-pay-opt-ton" style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:linear-gradient(135deg,rgba(0,152,234,0.15) 0%,rgba(0,102,204,0.15) 100%);border:1.5px solid rgba(0,152,234,0.4);border-radius:12px;cursor:pointer;">' +
          '    <span style="display:flex;align-items:center;gap:10px;font-weight:800;font-size:14px;color:#38bdf8;">' +
          '      <span style="font-size:22px;">💎</span> ' + tr('payWithTonCrypto') +
          '    </span>' +
          '    <span style="font-weight:900;font-size:14px;color:#7dd3fc;">' + tonPrice + ' 💎 TON</span>' +
          '  </button>' : ''
        ) +
        (coinsPrice > 0 ?
          '  <button class="btn fvh-pay-opt-coins" style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.15);border-radius:12px;cursor:pointer;">' +
          '    <span style="display:flex;align-items:center;gap:10px;font-weight:800;font-size:14px;color:var(--text-pure);">' +
          '      <span style="font-size:22px;">🪙</span> ' + tr('buyFor') +
          '    </span>' +
          '    <span style="font-weight:900;font-size:14px;color:#facc15;">' + coinsPrice + ' 🪙</span>' +
          '  </button>' : ''
        ) +
        '</div>' +
        '<button class="btn block fvh-pay-cancel" style="background:transparent;border:1px solid rgba(255,255,255,0.15);color:var(--text-muted);">' + tr('cancel') + '</button>';

      var cancelBtn = modal.querySelector('.fvh-pay-cancel');
      if (cancelBtn) cancelBtn.onclick = function () { overlay.remove(); };

      var starsBtn = modal.querySelector('.fvh-pay-opt-stars');
      if (starsBtn) starsBtn.onclick = function () { startStarsPayment(); };

      var tonBtn = modal.querySelector('.fvh-pay-opt-ton');
      if (tonBtn && !hideTon) tonBtn.onclick = function () { startTonPayment(); };

      var coinsBtn = modal.querySelector('.fvh-pay-opt-coins');
      if (coinsBtn) coinsBtn.onclick = function () { processCoinsPayment(); };
    }

    function processCoinsPayment() {
      var curCoins = app.store.data.coins || 0;
      if (curCoins < coinsPrice) {
        app.audio.play('error');
        showToast('⚠️ ' + tr('notEnoughCoins'));
        return;
      }
      app.store.update(function (d) {
        d.coins = (d.coins || 0) - coinsPrice;
      });
      overlay.remove();
      if (onPurchased) onPurchased();
    }

    function safeApiRequest(endpoint, payload) {
      var targetUrl = getApiUrl(endpoint);
      return fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .catch(function (netErr) {
        var isRu = getActiveLang() === 'ru';
        throw new Error(
          isRu
            ? 'Сервер игры недоступен (Connection Refused: ' + targetUrl + ').'
            : 'Game server is unreachable (Connection Refused: ' + targetUrl + ').'
        );
      })
      .then(function (res) {
        var contentType = (res.headers && res.headers.get('content-type')) || '';
        if (!contentType.includes('application/json')) {
          return res.text().then(function (rawText) {
            throw new Error('HTTP ' + res.status + ': Server returned non-JSON response.');
          });
        }
        return res.json().then(function (data) {
          if (!res.ok) {
            throw new Error((data && (data.message || data.error)) || ('HTTP ' + res.status));
          }
          return data;
        });
      });
    }

    function showPaymentError(err, onRetry) {
      var isRu = getActiveLang() === 'ru';
      var errorMsg = (err && err.message) ? err.message : tr('paymentFailed');

      modal.innerHTML =
        '<div style="font-size:42px;margin-bottom:12px;">⚠️</div>' +
        '<h3 style="margin:0 0 8px;color:#f87171;font-size:18px;">' + tr('paymentFailed') + '</h3>' +
        '<div style="background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.35);border-radius:12px;padding:12px 14px;margin:0 0 18px;text-align:left;">' +
        '  <div style="font-size:11px;font-weight:800;color:#fca5a5;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">' +
        (isRu ? 'Диагностика ошибки' : 'Error Diagnostics') + ':</div>' +
        '  <div style="color:var(--text-pure);font-size:12px;line-height:1.4;word-break:break-word;">' + errorMsg + '</div>' +
        '</div>' +
        '<div style="display:flex;gap:10px;">' +
        (onRetry ?
          '<button class="btn primary block fvh-pay-retry" style="flex:1;font-weight:800;">' + (isRu ? '🔄 Повторить' : '🔄 Retry') + '</button>' : ''
        ) +
        '<button class="btn block fvh-pay-cancel" style="flex:1;background:rgba(255,255,255,0.08);">' + tr('cancel') + '</button>' +
        '</div>';

      var retryBtn = modal.querySelector('.fvh-pay-retry');
      if (retryBtn && onRetry) {
        retryBtn.onclick = function () { onRetry(); };
      }

      var cancelBtn = modal.querySelector('.fvh-pay-cancel');
      if (cancelBtn) {
        cancelBtn.onclick = function () { overlay.remove(); };
      }
    }

    function startStarsPayment() {
      modal.innerHTML =
        '<div style="font-size:36px;margin-bottom:12px;">⭐</div>' +
        '<h3 style="margin:0 0 8px;">' + tr('paymentProcessing') + '</h3>' +
        '<p style="color:var(--text-muted);font-size:13px;margin-bottom:16px;">' + tr('starsRedirect') + '</p>' +
        '<div class="fvh-spinner" style="width:32px;height:32px;border:3px solid rgba(255,200,0,0.2);border-top-color:#fde047;border-radius:50%;margin:0 auto 16px;animation:fvhSpin 0.8s linear infinite;"></div>';

      var playerId = (app.store.data && app.store.data.playerId) || 'player_' + Math.random().toString(36).slice(2, 8);
      var tgUser = (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) || null;
      var telegramUserId = tgUser ? tgUser.id : null;

      safeApiRequest('/api/stars/create-invoice', {
        productId: productId,
        playerId: playerId,
        telegramUserId: telegramUserId
      })
      .then(function (invData) {
        if (!invData.ok || (!invData.orderId && !invData.invoiceId)) {
          throw new Error(invData.message || invData.error || 'Failed to create invoice');
        }

        var orderId = invData.orderId || invData.invoiceId;
        var invoiceLink = invData.invoiceLink;

        if (!invoiceLink) {
          throw new Error(invData.message || 'Telegram Bot Token is not configured on the server. Telegram Stars invoices cannot be created.');
        }

        // Native Telegram Mini App invoice support
        if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.openInvoice) {
          window.Telegram.WebApp.openInvoice(invoiceLink, function (status) {
            if (status === 'paid' || status === 'pending') {
              // Telegram client completed payment!
              // Authoritatively verify with backend webhook before granting entitlement
              pollOrderStatus(orderId, playerId, 0);
            } else if (status === 'cancelled') {
              // User dismissed checkout without paying -> Keep Free status
              renderSelectionScreen();
            } else if (status === 'failed') {
              showPaymentError(new Error('Telegram Stars payment failed or was declined.'), function () { startStarsPayment(); });
            }
          });
          return;
        }

        // Outside Telegram environment notice
        modal.innerHTML =
          '<div style="font-size:36px;margin-bottom:12px;">📱</div>' +
          '<h3 style="margin:0 0 8px;">' + (getActiveLang() === 'ru' ? 'Оплата через Telegram Stars' : 'Telegram Stars Checkout') + '</h3>' +
          '<p style="color:var(--text-muted);font-size:13px;line-height:1.5;margin-bottom:16px;">' +
          (getActiveLang() === 'ru'
            ? 'Оплата Telegram Stars работает внутри Telegram. Откройте игру через бота @FootyHoopsGameBot.'
            : 'Telegram Stars purchases must be completed inside the Telegram app via @FootyHoopsGameBot.') +
          '</p>' +
          '<a class="btn primary block" href="' + invoiceLink + '" target="_blank" style="margin-bottom:8px;text-decoration:none;">⭐ ' +
          (getActiveLang() === 'ru' ? 'Оплатить в Telegram' : 'Pay in Telegram') + '</a>' +
          '<button class="btn block fvh-check-status" style="background:rgba(255,255,255,0.08);margin-bottom:8px;">🔄 ' +
          (getActiveLang() === 'ru' ? 'Проверить статус' : 'Check Status') + '</button>' +
          '<button class="btn block fvh-pay-cancel" style="background:transparent;border:none;color:var(--text-muted);">' + tr('cancel') + '</button>';

        modal.querySelector('.fvh-pay-cancel').onclick = function () { overlay.remove(); };
        modal.querySelector('.fvh-check-status').onclick = function () {
          pollOrderStatus(orderId, playerId, 0);
        };
      })
      .catch(function (err) {
        showPaymentError(err, function () { startStarsPayment(); });
      });
    }

    function pollOrderStatus(orderId, playerId, attempt) {
      modal.innerHTML =
        '<div style="font-size:36px;margin-bottom:12px;">⏳</div>' +
        '<h3 style="margin:0 0 8px;">' + (getActiveLang() === 'ru' ? 'Подтверждение платежа...' : 'Verifying Payment...') + '</h3>' +
        '<p style="color:var(--text-muted);font-size:13px;margin-bottom:16px;">' +
        (getActiveLang() === 'ru' ? 'Ожидание официального подтверждения от Telegram...' : 'Waiting for official confirmation from Telegram...') +
        '</p>' +
        '<div class="fvh-spinner" style="width:32px;height:32px;border:3px solid rgba(255,200,0,0.2);border-top-color:#fde047;border-radius:50%;margin:0 auto 16px;animation:fvhSpin 0.8s linear infinite;"></div>';

      safeApiRequest('/api/stars/check-order', { orderId: orderId, playerId: playerId })
      .then(function (statusRes) {
        if (statusRes.ok && statusRes.status === 'paid') {
          // Genuinely confirmed by Telegram webhook!
          if (productId === 'battlepass_premium') {
            app.store.update(function (d) {
              if (!d.battlePass) d.battlePass = { claimedFree: [], claimedPremium: [], isPremium: false };
              d.battlePass.isPremium = true;
              d.battlePass.premiumUnlockedAt = statusRes.paidAt || Date.now();
            });
          }
          modal.innerHTML =
            '<div style="font-size:48px;margin-bottom:12px;">🎉</div>' +
            '<h3 style="margin:0 0 8px;color:#fde047;">' + tr('paymentSuccess') + '</h3>' +
            '<p style="color:var(--text-muted);font-size:13px;margin-bottom:16px;">' +
            (getActiveLang() === 'ru'
              ? 'Платеж на ' + (statusRes.starsAmount || 250) + ' ⭐ подтвержден Telegram. Доступ к VIP Premium открыт!'
              : (statusRes.starsAmount || 250) + ' ⭐ confirmed by Telegram. VIP Premium Access unlocked!') +
            '</p>' +
            '<button class="btn primary block fvh-pay-done">' + tr('claimAndContinue') + '</button>';

          modal.querySelector('.fvh-pay-done').onclick = function () {
            overlay.remove();
            if (onPurchased) onPurchased();
          };
          return;
        }

        if (attempt < 5) {
          setTimeout(function () {
            pollOrderStatus(orderId, playerId, attempt + 1);
          }, 1500);
          return;
        }

        // After 5 attempts, still pending / processing
        modal.innerHTML =
          '<div style="font-size:36px;margin-bottom:12px;">⌛</div>' +
          '<h3 style="margin:0 0 8px;">' + (getActiveLang() === 'ru' ? 'Платеж в обработке' : 'Payment Processing') + '</h3>' +
          '<p style="color:var(--text-muted);font-size:12px;line-height:1.4;margin-bottom:16px;">' +
          (getActiveLang() === 'ru'
            ? 'Telegram еще обрабатывает платеж. Доступ откроется автоматически, как только сервер получит подтверждение.'
            : 'Telegram is processing the transaction. Access will unlock once confirmed.') +
          '</p>' +
          '<button class="btn primary block fvh-check-again" style="margin-bottom:8px;font-weight:800;">🔄 ' +
          (getActiveLang() === 'ru' ? 'Проверить статус' : 'Check Status') + '</button>' +
          '<button class="btn block fvh-pay-close" style="background:transparent;border:none;color:var(--text-muted);">' + tr('cancel') + '</button>';

        modal.querySelector('.fvh-check-again').onclick = function () {
          pollOrderStatus(orderId, playerId, 0);
        };
        modal.querySelector('.fvh-pay-close').onclick = function () {
          overlay.remove();
        };
      })
      .catch(function (err) {
        showPaymentError(err, function () { pollOrderStatus(orderId, playerId, 0); });
      });
    }

    function startTonPayment() {
      // Fallback for non-digital items if any
      modal.innerHTML =
        '<div style="font-size:36px;margin-bottom:12px;">💎</div>' +
        '<h3 style="margin:0 0 8px;">' + tr('paymentProcessing') + '</h3>' +
        '<div class="fvh-spinner" style="width:32px;height:32px;border:3px solid rgba(0,152,234,0.2);border-top-color:#38bdf8;border-radius:50%;margin:0 auto 16px;animation:fvhSpin 0.8s linear infinite;"></div>';

      var playerId = (app.store.data && app.store.data.playerId) || 'player_' + Math.random().toString(36).slice(2, 8);

      safeApiRequest('/api/ton/create-payload', { productId: productId, playerId: playerId })
      .then(function (payload) {
        if (!payload.ok || !payload.txId) throw new Error(payload.error || 'Failed to create TON payload');

        modal.innerHTML =
          '<div style="font-size:11px;color:#38bdf8;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">' +
          tr('payWithTonCrypto') +
          '</div>' +
          '<h3 style="margin:0 0 6px;font-size:18px;">' + tonPrice + ' 💎 TON</h3>' +
          '<p style="color:var(--text-muted);font-size:12px;margin:0 0 14px;">' +
          tr('tonTransferInstructions', { amount: tonPrice }) +
          '</p>' +
          '<div style="text-align:left;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;margin-bottom:10px;">' +
          '  <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">' + tr('tonAddress') + '</div>' +
          '  <div style="font-family:monospace;font-size:11px;word-break:break-all;color:#7dd3fc;margin:4px 0 6px;">' + payload.recipientAddress + '</div>' +
          '  <button class="btn small fvh-copy-addr" style="font-size:10px;padding:3px 8px;">' + tr('copyAddress') + '</button>' +
          '</div>' +
          '<div style="text-align:left;background:rgba(0,0,0,0.3);border:1px solid rgba(255,200,0,0.25);border-radius:10px;padding:10px 12px;margin-bottom:16px;">' +
          '  <div style="font-size:10px;color:#fbbf24;text-transform:uppercase;letter-spacing:0.5px;font-weight:800;">' + tr('tonMemo') + '</div>' +
          '  <div style="font-family:monospace;font-size:13px;font-weight:900;color:#fde047;margin:4px 0 6px;">' + payload.memo + '</div>' +
          '  <button class="btn small fvh-copy-memo" style="font-size:10px;padding:3px 8px;">' + tr('copyMemo') + '</button>' +
          '</div>' +
          '<button class="btn block fvh-cancel-ton" style="background:transparent;border:none;color:var(--text-muted);font-size:12px;">' + tr('cancel') + '</button>';

        var copyAddrBtn = modal.querySelector('.fvh-copy-addr');
        if (copyAddrBtn) copyAddrBtn.onclick = function () {
          navigator.clipboard.writeText(payload.recipientAddress);
          showToast('📋 ' + tr('copiedToClipboard'));
        };

        var copyMemoBtn = modal.querySelector('.fvh-copy-memo');
        if (copyMemoBtn) copyMemoBtn.onclick = function () {
          navigator.clipboard.writeText(payload.memo);
          showToast('📋 ' + tr('copiedToClipboard'));
        };

        var cancelBtn = modal.querySelector('.fvh-cancel-ton');
        if (cancelBtn) cancelBtn.onclick = function () { overlay.remove(); };
      })
      .catch(function (err) {
        showPaymentError(err, function () { startTonPayment(); });
      });
    }

    renderSelectionScreen();
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

  // Attach payment service globally for Store Bundles & Battle Pass
  window.__fvhPayments = {
    openPaymentModal: openUniversalPaymentModal
  };

  function openBattlePassCheckout(app, onUnlocked) {
    openUniversalPaymentModal(app, {
      productId: 'battlepass_premium',
      title: tr('bpPurchaseModalTitle'),
      starsPrice: 250,
      tonPrice: 1.5,
      onPurchased: function () {
        app.store.update(function (d) {
          if (!d.battlePass) d.battlePass = { claimedFree: [], claimedPremium: [], isPremium: false };
          d.battlePass.isPremium = true;
          d.battlePass.premiumUnlockedAt = Date.now();
        });
        syncAuthoritativeEconomy(app);
        app.audio.play('purchase');
        showToast('👑 ' + tr('bpPremiumActive') + '! ' + tr('bpLateUnlockNotice'));
        if (onUnlocked) onUnlocked();
      }
    });
  }

  function showRewardModal(reward, lvl, track) {
    var overlay = document.createElement('div');
    overlay.className = 'modal-back';
    var modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.maxWidth = '360px';
    modal.style.textAlign = 'center';

    var trackLabel = track === 'premium' ? '👑 ' + tr('bpPremiumTrack') : '⭐ ' + tr('bpFreeTrack');

    modal.innerHTML =
      '<div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">' +
      trackLabel + ' · ' + tr('bpTier', { lvl: lvl }) +
      '</div>' +
      '<div style="font-size:52px;margin:12px 0;">' + reward.icon + '</div>' +
      '<h3 style="margin:0 0 8px;font-size:20px;color:var(--text-pure);">' + trItem(reward.name) + '</h3>' +
      '<p style="color:var(--text-muted);font-size:13px;line-height:1.4;margin:0 0 20px;">' +
      (reward.type === 'coins' ? (trItem(reward.name) + ' — ' + tr('storeSub')) :
       reward.type === 'pack' ? (trItem(reward.name) + ' — ' + tr('packsInventory')) :
       tr('ownedInLocker')) +
      '</p>' +
      '<button class="btn primary block">' + tr('close') + '</button>';

    modal.querySelector('button').onclick = function () { overlay.remove(); };
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

  // Build the Dual-Track 30-Level Battle Pass Page
  function buildBattlePassPage(app) {
    var container = document.createElement('div');
    container.className = 'screen solid page-screen has-nav';
    container.dataset.id = 'battlepass';

    var page = document.createElement('div');
    page.className = 'page';

    // Page Head
    var head = document.createElement('div');
    head.className = 'page-head';
    var backBtn = document.createElement('button');
    backBtn.className = 'btn icon back';
    backBtn.textContent = '←';
    backBtn.onclick = function () {
      app.audio.play('click');
      app.showMenu();
    };
    var title = document.createElement('h1');
    title.textContent = tr('battlePass');
    head.appendChild(backBtn);
    head.appendChild(title);
    page.appendChild(head);

    // Body
    var body = document.createElement('div');
    body.className = 'page-body fvh-bp-container';

    // 1. Top Progress Banner Card
    var headerCard = document.createElement('div');
    headerCard.className = 'fvh-bp-header-card';
    body.appendChild(headerCard);

    // 2. VIP Status / Late Unlock Banner
    var vipBanner = document.createElement('div');
    vipBanner.className = 'fvh-bp-vip-banner';
    body.appendChild(vipBanner);

    // 3. Dual-Track Horizontal List (Level 1..30 with Free and Premium rows)
    var scrollTrack = document.createElement('div');
    scrollTrack.className = 'fvh-bp-track-scroll fvh-bp-dual-track';
    body.appendChild(scrollTrack);

    function refreshUI() {
      var bpState = getBattlePassState(app.store);

      // Header Card
      headerCard.innerHTML =
        '<div class="fvh-bp-lvl-badge">' +
        '<div class="fvh-bp-lvl-num">' + bpState.level + '</div>' +
        '<div>' +
        '<div style="font-weight:900;font-size:18px;letter-spacing:0.5px;">' + tr('bpSeason') + '</div>' +
        '<div style="color:var(--muted);font-size:13px;">' + tr('bpXpNeeded', { cur: bpState.intoLevel, need: bpState.needed, next: Math.min(30, bpState.level + 1) }) + '</div>' +
        '</div>' +
        '</div>' +
        '<div style="flex:1;min-width:200px;">' +
        '<div class="pbar" style="height:12px;margin:0 0 10px 0;"><i style="width:' + bpState.percent + '%;"></i></div>' +
        (bpState.claimableCount > 0 ?
          '<button class="btn small primary claim-all-btn" style="width:100%;font-weight:800;letter-spacing:0.5px;">' + tr('bpClaimAllFreeAndPrem', { n: bpState.claimableCount }) + '</button>' :
          '<div style="font-size:12px;color:var(--text-muted);text-align:right;">' + tr('bpAllClaimed') + '</div>'
        ) +
        '</div>';

      var claimAllBtn = headerCard.querySelector('.claim-all-btn');
      if (claimAllBtn) {
        claimAllBtn.onclick = function () {
          claimAllBattlePassTiers(app, function () {
            refreshUI();
          });
        };
      }

      // VIP Status Banner
      if (bpState.isPremium) {
        vipBanner.innerHTML =
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;background:linear-gradient(135deg,rgba(255,200,0,0.18) 0%,rgba(180,100,0,0.18) 100%);border:1.5px solid rgba(255,200,0,0.5);border-radius:14px;padding:12px 16px;box-shadow:0 0 20px rgba(255,200,0,0.15);">' +
          '  <div style="display:flex;align-items:center;gap:10px;">' +
          '    <span style="font-size:24px;">👑</span>' +
          '    <div>' +
          '      <div style="font-weight:900;font-size:14px;color:#fef08a;letter-spacing:0.5px;">' + tr('bpPremiumActive') + '</div>' +
          '      <div style="font-size:12px;color:var(--text-muted);">' + tr('bpUnlockPremiumDesc') + '</div>' +
          '    </div>' +
          '  </div>' +
          '  <div style="font-size:11px;font-weight:800;color:#fde047;background:rgba(255,200,0,0.2);padding:4px 10px;border-radius:20px;border:1px solid rgba(255,200,0,0.3);">' +
          '    ✓ VIP UNLOCKED' +
          '  </div>' +
          '</div>';
      } else {
        vipBanner.innerHTML =
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;background:linear-gradient(135deg,rgba(255,200,0,0.12) 0%,rgba(120,60,0,0.15) 100%);border:1.5px solid rgba(255,200,0,0.4);border-radius:14px;padding:12px 16px;cursor:pointer;transition:all 0.2s ease;">' +
          '  <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:200px;">' +
          '    <span style="font-size:26px;">👑</span>' +
          '    <div>' +
          '      <div style="font-weight:900;font-size:14px;color:#fef08a;letter-spacing:0.5px;">' + tr('bpUnlockPremium') + ' · 250 ⭐ / 1.5 💎 TON</div>' +
          '      <div style="font-size:12px;color:var(--text-muted);">' + tr('bpLateUnlockNotice') + '</div>' +
          '    </div>' +
          '  </div>' +
          '  <button class="btn primary fvh-unlock-vip-btn" style="font-weight:900;background:linear-gradient(135deg,#fde047 0%,#f59e0b 100%);color:#000;border:none;box-shadow:0 0 16px rgba(253,224,71,0.4);">' +
          '    ' + tr('bpUnlockPremium') +
          '  </button>' +
          '</div>';

        var unlockBtn = vipBanner.querySelector('.fvh-unlock-vip-btn');
        if (unlockBtn) {
          unlockBtn.onclick = function (e) {
            e.stopPropagation();
            openBattlePassCheckout(app, refreshUI);
          };
        }
        vipBanner.firstElementChild.onclick = function () {
          openBattlePassCheckout(app, refreshUI);
        };
      }

      // Render 30 Dual-Track Columns
      scrollTrack.innerHTML = '';
      BATTLE_PASS_LEVELS.forEach(function (lvlDef) {
        var col = document.createElement('div');
        col.className = 'fvh-bp-dual-column';
        col.style.display = 'flex';
        col.style.flexDirection = 'column';
        col.style.gap = '10px';
        col.style.flex = '0 0 170px';

        var isLevelReached = bpState.level >= lvlDef.level;
        var isMilestone = lvlDef.level % 5 === 0;

        // Tier Header
        var colHead = document.createElement('div');
        colHead.className = 'fvh-bp-col-head';
        colHead.style.display = 'flex';
        colHead.style.alignItems = 'center';
        colHead.style.justifyContent = 'space-between';
        colHead.style.padding = '4px 8px';
        colHead.style.borderRadius = '8px';
        colHead.style.background = isLevelReached ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)';
        colHead.style.border = isLevelReached ? '1px solid rgba(0, 240, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)';
        colHead.innerHTML =
          '<span style="font-weight:900;font-size:12px;color:' + (isLevelReached ? 'var(--neon-cyan)' : 'var(--text-muted)') + ';">' +
          tr('bpTier', { lvl: lvlDef.level }) +
          '</span>' +
          '<span>' + (isMilestone ? '⭐' : '') + (isLevelReached ? ' ✓' : ' 🔒') + '</span>';
        col.appendChild(colHead);

        // --- 1. FREE TRACK CARD ---
        var freeCard = document.createElement('div');
        var isFreeClaimed = bpState.claimedFree.indexOf(lvlDef.level) !== -1;
        freeCard.className = 'fvh-bp-level-card fvh-bp-card-free' +
          (isLevelReached ? ' unlocked' : '') +
          (isFreeClaimed ? ' claimed' : '');
        freeCard.style.minHeight = '180px';
        freeCard.style.display = 'flex';
        freeCard.style.flexDirection = 'column';
        freeCard.style.justifyContent = 'space-between';
        freeCard.style.boxSizing = 'border-box';
        freeCard.style.padding = '10px 8px';

        var freeTag = '<div style="font-size:9.5px;font-weight:800;letter-spacing:0.8px;color:#38bdf8;text-transform:uppercase;margin-bottom:4px;flex-shrink:0;">' + tr('bpFreeTrack') + '</div>';
        var freeIcon = '<div class="fvh-bp-level-reward-icon" style="cursor:pointer;font-size:32px;margin:4px 0;flex-shrink:0;">' + lvlDef.freeReward.icon + '</div>';
        var freeName = '<div class="fvh-bp-level-reward-name" style="cursor:pointer;font-size:11px;min-height:38px;line-height:1.25;margin-bottom:8px;word-break:break-word;">' + trItem(lvlDef.freeReward.name) + '</div>';

        freeCard.innerHTML = freeTag + freeIcon + freeName;

        freeCard.onclick = function () {
          app.audio.play('click');
          showRewardModal(lvlDef.freeReward, lvlDef.level, 'free');
        };

        var freeActionBtn = document.createElement('button');
        freeActionBtn.style.marginTop = 'auto';
        freeActionBtn.style.width = '100%';
        freeActionBtn.style.flexShrink = '0';
        if (isFreeClaimed) {
          freeActionBtn.className = 'btn small';
          freeActionBtn.disabled = true;
          freeActionBtn.style.opacity = '0.5';
          freeActionBtn.textContent = '✓ ' + tr('bpClaimed');
        } else if (isLevelReached) {
          freeActionBtn.className = 'btn small primary';
          freeActionBtn.textContent = tr('bpClaimFree');
          freeActionBtn.onclick = function (e) {
            e.stopPropagation();
            claimBattlePassTier(app, lvlDef.level, 'free', refreshUI);
          };
        } else {
          freeActionBtn.className = 'btn small';
          freeActionBtn.disabled = true;
          freeActionBtn.textContent = '🔒 ' + lvlDef.xpRequired + ' XP';
        }
        freeCard.appendChild(freeActionBtn);
        col.appendChild(freeCard);

        // --- 2. PREMIUM VIP TRACK CARD ---
        var vipCard = document.createElement('div');
        var isVipClaimed = bpState.claimedPremium.indexOf(lvlDef.level) !== -1;
        var isVipAvailable = bpState.isPremium && isLevelReached;

        vipCard.className = 'fvh-bp-level-card fvh-bp-card-vip' +
          (isVipAvailable ? ' unlocked' : '') +
          (isVipClaimed ? ' claimed' : '');
        vipCard.style.minHeight = '180px';
        vipCard.style.display = 'flex';
        vipCard.style.flexDirection = 'column';
        vipCard.style.justifyContent = 'space-between';
        vipCard.style.boxSizing = 'border-box';
        vipCard.style.padding = '10px 8px';
        vipCard.style.border = bpState.isPremium ?
          (isVipAvailable ? '1.5px solid rgba(255, 200, 0, 0.6)' : '1px solid rgba(255, 200, 0, 0.25)') :
          '1px solid rgba(255, 200, 0, 0.2)';
        vipCard.style.background = isVipAvailable ?
          'linear-gradient(180deg, rgba(40, 30, 10, 0.95) 0%, rgba(20, 15, 5, 0.98) 100%)' :
          'rgba(25, 20, 10, 0.6)';

        var vipTag = '<div style="font-size:9.5px;font-weight:900;letter-spacing:0.8px;color:#fde047;text-transform:uppercase;margin-bottom:4px;flex-shrink:0;">👑 ' + tr('bpPremiumTrack') + '</div>';
        var vipIcon = '<div class="fvh-bp-level-reward-icon" style="cursor:pointer;font-size:32px;margin:4px 0;flex-shrink:0;">' + lvlDef.premiumReward.icon + '</div>';
        var vipName = '<div class="fvh-bp-level-reward-name" style="cursor:pointer;font-size:11px;min-height:38px;line-height:1.25;color:#fef08a;margin-bottom:8px;word-break:break-word;">' + trItem(lvlDef.premiumReward.name) + '</div>';

        vipCard.innerHTML = vipTag + vipIcon + vipName;

        vipCard.onclick = function () {
          app.audio.play('click');
          showRewardModal(lvlDef.premiumReward, lvlDef.level, 'premium');
        };

        var vipActionBtn = document.createElement('button');
        vipActionBtn.style.marginTop = 'auto';
        vipActionBtn.style.width = '100%';
        vipActionBtn.style.flexShrink = '0';
        if (!bpState.isPremium) {
          vipActionBtn.className = 'btn small';
          vipActionBtn.style.background = 'rgba(255,200,0,0.15)';
          vipActionBtn.style.color = '#fde047';
          vipActionBtn.style.border = '1px solid rgba(255,200,0,0.3)';
          vipActionBtn.textContent = '🔒 VIP';
          vipActionBtn.onclick = function (e) {
            e.stopPropagation();
            openBattlePassCheckout(app, refreshUI);
          };
        } else if (isVipClaimed) {
          vipActionBtn.className = 'btn small';
          vipActionBtn.disabled = true;
          vipActionBtn.style.opacity = '0.5';
          vipActionBtn.textContent = '✓ ' + tr('bpClaimed');
        } else if (isVipAvailable) {
          vipActionBtn.className = 'btn small primary';
          vipActionBtn.style.background = 'linear-gradient(135deg, #fde047 0%, #f59e0b 100%)';
          vipActionBtn.style.color = '#000';
          vipActionBtn.style.fontWeight = '900';
          vipActionBtn.textContent = tr('bpClaimPremium');
          vipActionBtn.onclick = function (e) {
            e.stopPropagation();
            claimBattlePassTier(app, lvlDef.level, 'premium', refreshUI);
          };
        } else {
          vipActionBtn.className = 'btn small';
          vipActionBtn.disabled = true;
          vipActionBtn.textContent = '🔒 LVL ' + lvlDef.level;
        }
        vipCard.appendChild(vipActionBtn);
        col.appendChild(vipCard);

        scrollTrack.appendChild(col);
      });
    }

    refreshUI();
    page.appendChild(body);
    container.appendChild(page);

    // Auto-scroll to specific level if requested via URL param (e.g. ?page=battlepass&lvl=20)
    var urlParams = (typeof window !== 'undefined' && window.location) ? new URLSearchParams(window.location.search) : null;
    var targetLvl = urlParams ? parseInt(urlParams.get('lvl'), 10) : null;
    if (targetLvl && targetLvl >= 1 && targetLvl <= 30) {
      setTimeout(function () {
        var targetCol = scrollTrack.querySelector('.fvh-bp-dual-column:nth-child(' + targetLvl + ')');
        if (targetCol) {
          targetCol.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
        }
      }, 150);
    }

    // Persistent Unified Bottom Navigation
    container.appendChild(createSharedBottomNav('battlepass', app));

    return container;
  }



  // Build Characters & Wardrobe Page
  function buildCharactersPage(app, initialChar, initialSlot) {
    var curChar = initialChar || (app.store.data.selectedCharacter) || 'footy';
    var curSlot = initialSlot || 'skins';

    var container = document.createElement('div');
    container.className = 'screen solid page-screen has-nav';
    container.dataset.id = 'characters';

    var page = document.createElement('div');
    page.className = 'page';

    var head = document.createElement('div');
    head.className = 'page-head';
    var backBtn = document.createElement('button');
    backBtn.className = 'btn icon back';
    backBtn.textContent = '←';
    backBtn.onclick = function () {
      app.audio.play('click');
      app.showMenu();
    };
    var title = document.createElement('h1');
    title.textContent = tr('lockerTitle', { char: curChar === 'footy' ? tr('footyChar') : tr('hoopsChar') });
    head.appendChild(backBtn);
    head.appendChild(title);
    page.appendChild(head);

    var body = document.createElement('div');
    body.className = 'page-body';

    // Character Tabs: FOOTY vs HOOPS
    var charSeg = document.createElement('div');
    charSeg.className = 'seg';
    charSeg.style.marginBottom = '14px';

    var btnFooty = document.createElement('button');
    btnFooty.textContent = tr('footyBadge');
    if (curChar === 'footy') btnFooty.className = 'on';

    var btnHoops = document.createElement('button');
    btnHoops.textContent = tr('hoopsBadge');
    if (curChar === 'hoops') btnHoops.className = 'on';

    charSeg.appendChild(btnFooty);
    charSeg.appendChild(btnHoops);
    body.appendChild(charSeg);

    // Wardrobe & Inspection Layout
    var layout = document.createElement('div');
    layout.className = 'fvh-wardrobe-grid';

    // Left Preview Column
    var previewCol = document.createElement('div');
    previewCol.className = 'fvh-wardrobe-preview';

    var avatarBox = document.createElement('div');
    avatarBox.className = 'fvh-wardrobe-avatar';

    var charName = document.createElement('h2');
    charName.style.margin = '8px 0 2px';

    var charRole = document.createElement('div');
    charRole.className = 'note';

    var equipSlotList = document.createElement('div');
    equipSlotList.className = 'fvh-equipped-list';

    var selectBtn = document.createElement('button');
    selectBtn.className = 'btn primary block';
    selectBtn.style.marginTop = '14px';

    previewCol.appendChild(avatarBox);
    previewCol.appendChild(charName);
    previewCol.appendChild(charRole);
    previewCol.appendChild(equipSlotList);
    previewCol.appendChild(selectBtn);
    layout.appendChild(previewCol);

    // Right Locker Items Column
    var itemsCol = document.createElement('div');
    itemsCol.className = 'list';

    // Slot Category Tabs
    var slotSeg = document.createElement('div');
    slotSeg.className = 'seg';
    slotSeg.style.marginBottom = '12px';
    var slots = [
      { id: 'skins', label: tr('catJerseys') },
      { id: 'balls', label: tr('catBalls') },
      { id: 'stadiums', label: tr('catArenas') },
      { id: 'celebrations', label: tr('catCelebrations') }
    ];
    slots.forEach(function (s) {
      var sb = document.createElement('button');
      sb.textContent = s.label;
      if (s.id === curSlot) sb.className = 'on';
      sb.onclick = function () {
        curSlot = s.id;
        slotSeg.querySelectorAll('button').forEach(function (b) { b.className = ''; });
        sb.className = 'on';
        app.audio.play('click');
        updateView();
      };
      slotSeg.appendChild(sb);
    });
    itemsCol.appendChild(slotSeg);

    var itemsGrid = document.createElement('div');
    itemsGrid.className = 'grid shop-grid';
    itemsCol.appendChild(itemsGrid);
    layout.appendChild(itemsCol);

    body.appendChild(layout);
    page.appendChild(body);
    container.appendChild(page);

    function updateView() {
      title.textContent = tr('lockerTitle', { char: curChar === 'footy' ? tr('footyChar') : tr('hoopsChar') });
      btnFooty.className = curChar === 'footy' ? 'on' : '';
      btnHoops.className = curChar === 'hoops' ? 'on' : '';

      avatarBox.innerHTML = curChar === 'footy' ? getFootyAvatarSvg() : getHoopsAvatarSvg();
      charName.textContent = curChar === 'footy' ? 'FOOTY' : 'HOOPS';
      charRole.textContent = curChar === 'footy' ? tr('footyRole') : tr('hoopsRole');

      var isSelected = (app.store.data.selectedCharacter || 'footy') === curChar;
      selectBtn.textContent = isSelected ? '✓ ' + tr('selected') : tr('selectChar');
      selectBtn.disabled = isSelected;

      // Equipped summary
      var eq = app.store.data.equipped || {};
      var owned = app.store.data.owned || [];

      // Sanitize equipped items to prevent unowned cosmetics from staying equipped (Prompt 4 Section 6)
      var defaultSlotItems = {
        skin: 'skin_rookie',
        'ball.footy': 'ball_footy_classic',
        'ball.hoops': 'ball_hoops_street',
        'stadium.footy': 'std_footy_classic',
        'stadium.hoops': 'std_hoops_street',
        celebration: 'cel_confetti',
        trail: 'trail_default',
        frame: 'frame_default'
      };
      var changedEquip = false;
      Object.keys(defaultSlotItems).forEach(function (slot) {
        var currentEq = eq[slot];
        if (currentEq && owned.indexOf(currentEq) === -1 && currentEq !== defaultSlotItems[slot]) {
          eq[slot] = defaultSlotItems[slot];
          changedEquip = true;
        }
      });
      if (changedEquip) {
        app.store.update(function (d) { d.equipped = eq; });
      }

      equipSlotList.innerHTML =
        '<div class="fvh-equipped-slot"><span>' + tr('slotJersey') + ':</span><b>' + trItem(eq.skin || 'Rookie Blue') + '</b></div>' +
        '<div class="fvh-equipped-slot"><span>' + tr('slotBall') + ':</span><b>' + trItem(eq['ball.' + curChar] || 'Classic Ball') + '</b></div>' +
        '<div class="fvh-equipped-slot"><span>' + tr('slotArena') + ':</span><b>' + trItem(eq['stadium.' + curChar] || 'Standard Arena') + '</b></div>' +
        '<div class="fvh-equipped-slot"><span>' + tr('slotCelebration') + ':</span><b>' + trItem(eq.celebration || 'Confetti Rain') + '</b></div>';

      // Load matching items for current slot (OWNED ITEMS ONLY)
      itemsGrid.innerHTML = '';
      function renderMatchingItems(allItems) {
        var scenicArenas = [
          { id: 'std_ocean_sunset', category: 'stadiums', slot: 'stadium.footy', mode: 'footy', name: 'Coastal Sunset Court', rarity: 'epic', price: 580, icon: '🌅', desc: tr('scenicCoastalDesc') },
          { id: 'std_forest_redwood', category: 'stadiums', slot: 'stadium.hoops', mode: 'hoops', name: 'Redwood Forest Arena', rarity: 'epic', price: 560, icon: '🌲', desc: tr('scenicForestDesc') },
          { id: 'std_space_orbit', category: 'stadiums', slot: 'stadium.footy', mode: 'footy', name: 'Orbital Space Colosseum', rarity: 'legendary', price: 900, icon: '🚀', desc: tr('scenicSpaceDesc') },
          { id: 'std_mars_dome', category: 'stadiums', slot: 'stadium.hoops', mode: 'hoops', name: 'Mars Bio-Dome Arena', rarity: 'epic', price: 750, icon: '🔴', desc: tr('scenicMarsDesc') },
          { id: 'std_moon_crater', category: 'stadiums', slot: 'stadium.footy', mode: 'footy', name: 'Apollo Lunar Arena', rarity: 'rare', price: 680, icon: '🌕', desc: tr('scenicMoonDesc') },
          { id: 'std_underwater_dome', category: 'stadiums', slot: 'stadium.hoops', mode: 'hoops', name: 'Abyssal Ocean Dome', rarity: 'legendary', price: 820, icon: '🫧', desc: tr('scenicUnderwaterDesc') },
          { id: 'std_cyber_megacity', category: 'stadiums', slot: 'stadium.footy', mode: 'footy', name: 'Neo Tokyo Megacity', rarity: 'legendary', price: 950, icon: '🏙️', desc: tr('scenicCyberDesc') },
          { id: 'std_volcano_caldera', category: 'stadiums', slot: 'stadium.hoops', mode: 'hoops', name: 'Magma Caldera Arena', rarity: 'epic', price: 850, icon: '🌋', desc: tr('scenicVolcanoDesc') },
          { id: 'std_floating_islands', category: 'stadiums', slot: 'stadium.footy', mode: 'footy', name: 'Aetheria Sky Islands', rarity: 'legendary', price: 880, icon: '☁️', desc: tr('scenicFloatingDesc') },
          { id: 'std_crystal_cavern', category: 'stadiums', slot: 'stadium.hoops', mode: 'hoops', name: 'Prismatic Crystal Cave', rarity: 'epic', price: 790, icon: '💎', desc: tr('scenicCrystalDesc') }
        ];
        scenicArenas.forEach(function (sa) {
          if (!allItems.some(function (i) { return i.id === sa.id; })) {
            allItems.push(sa);
          }
        });

        var owned = app.store.data.owned || [];
        var matching = allItems.filter(function (it) {
          if (it.category !== curSlot) return false;
          if (it.mode && it.mode !== curChar) return false;
          var isOwned = (owned.indexOf(it.id) !== -1) || Boolean(it.isDefault);
          return isOwned;
        });

        if (matching.length === 0) {
          var emptyBox = document.createElement('div');
          emptyBox.className = 'fvh-empty-locker';
          emptyBox.innerHTML =
            '<div class="fvh-empty-icon">🎒</div>' +
            '<div class="fvh-empty-title">' + tr('emptyCategory') + '</div>' +
            '<div class="fvh-empty-desc">' + tr('emptyCategoryDesc') + '</div>';
          var shopBtn = document.createElement('button');
          shopBtn.className = 'btn primary small fvh-empty-btn';
          shopBtn.textContent = '🛒 ' + tr('goToShop');
          shopBtn.onclick = function () {
            app.audio.play('click');
            app.go('shop');
          };
          emptyBox.appendChild(shopBtn);
          itemsGrid.appendChild(emptyBox);
          return;
        }

        matching.forEach(function (item) {
          var activeSlotKey = item.slot || (item.category === 'balls' ? 'ball.' + curChar : item.category === 'stadiums' ? 'stadium.' + curChar : item.category === 'skins' ? 'skin' : item.category);
          var isEquipped = eq[activeSlotKey] === item.id;

          var itemCard = document.createElement('div');
          var rarClass = item.rarity || 'common';
          itemCard.className = 'card shopc r-' + rarClass + (isEquipped ? ' is-eq' : '');

          var localizedRarity = tr('rarity_' + rarClass) || rarClass.toUpperCase();
          var localizedItemName = trItem(item.name);

          itemCard.innerHTML =
            '<div class="thumbwrap"><div class="thumb" style="display:flex;align-items:center;justify-content:center;">' +
            renderItemArtwork(item, 'thumb') +
            '</div>' +
            (isEquipped ? '<span class="st st-eq">✓ ' + tr('equippedBadge') + '</span>' : '') +
            '</div>' +
            '<div class="nm">' + localizedItemName + '</div>' +
            '<div class="tags"><span class="rar ' + rarClass + '">' + localizedRarity + '</span></div>';

          var btn = document.createElement('button');
          if (isEquipped) {
            btn.className = 'btn small';
            btn.disabled = true;
            btn.textContent = '✓ ' + tr('equipped');
          } else {
            btn.className = 'btn small primary';
            btn.textContent = tr('equip');
            btn.onclick = function () {
              var pid = getAppPlayerId(app);
              safeEconomyApi('/api/economy/equip', {
                playerId: pid,
                slot: activeSlotKey,
                itemId: item.id
              }).then(function (res) {
                if (res && res.error === 'item_not_owned') {
                  app.audio.play('error');
                  showToast('⚠️ ' + tr('lockedInShop', { price: item.price || 500 }));
                  return;
                }
                app.store.update(function (d) {
                  if (!d.equipped) d.equipped = {};
                  d.equipped[activeSlotKey] = item.id; if (item.id === 'std_ocean_sunset') { d.equipped['stadium.footy'] = 'std_ocean_sunset'; d.equipped['stadium.hoops'] = 'std_ocean_sunset'; }
                });
                app.audio.play('click');
                showToast(tr('equipped') + ': ' + localizedItemName);
                updateView();
              });
            };
          }
          itemCard.appendChild(btn);
          itemsGrid.appendChild(itemCard);
        });
      }

      if (typeof window.require === 'function') {
        try {
          window.require(['data/shop'], function (shopMod) {
            renderMatchingItems((shopMod && shopMod.ITEMS) || []);
          });
        } catch (e) {
          console.warn('Failed to load shop items', e);
        }
      }
    }

    btnFooty.onclick = function () {
      curChar = 'footy';
      app.audio.play('click');
      updateView();
    };
    btnHoops.onclick = function () {
      curChar = 'hoops';
      app.audio.play('click');
      updateView();
    };
    selectBtn.onclick = function () {
      app.store.update(function (d) {
        d.selectedCharacter = curChar;
      });
      app.audio.play('claim');
      showToast(tr('selected') + ': ' + (curChar === 'footy' ? 'FOOTY' : 'HOOPS'));
      updateView();
    };

    updateView();

    // Persistent Unified Bottom Navigation
    container.appendChild(createSharedBottomNav('characters', app));

    return container;
  }



  // Build Quests & Mission Operations Board Page (3 Separated Top-Level Categories)
  function buildQuestsPage(app, initialMainTab, initialSubTab) {
    var curMainTab = 'gameplay';
    var curSubTab = 'daily';

    if (initialMainTab === 'social') {
      curMainTab = 'social';
    } else if (initialMainTab === 'referrals' || initialMainTab === 'invite') {
      curMainTab = 'referrals';
    } else if (initialMainTab === 'daily' || initialMainTab === 'weekly' || initialMainTab === 'achieve') {
      curMainTab = 'gameplay';
      curSubTab = initialMainTab;
    } else if (initialMainTab === 'gameplay') {
      curMainTab = 'gameplay';
      curSubTab = initialSubTab || 'daily';
    }

    var container = document.createElement('div');
    container.className = 'screen solid page-screen has-nav';
    container.dataset.id = 'quests';

    var page = document.createElement('div');
    page.className = 'page';

    // Page Header
    var head = document.createElement('div');
    head.className = 'page-head';
    var backBtn = document.createElement('button');
    backBtn.className = 'btn icon back';
    backBtn.textContent = '←';
    backBtn.onclick = function () {
      app.audio.play('click');
      app.showMenu();
    };
    var title = document.createElement('h1');
    title.textContent = tr('missionOps');
    head.appendChild(backBtn);
    head.appendChild(title);
    page.appendChild(head);

    var body = document.createElement('div');
    body.className = 'page-body fvh-quests-container';

    // Top-Level Category Navigation (3 Clear Tabs)
    var mainSeg = document.createElement('div');
    mainSeg.className = 'seg fvh-quest-top-nav';
    mainSeg.style.marginBottom = '14px';

    var mainTabs = [
      { id: 'gameplay', icon: '🎯', label: tr('tabGameplay') },
      { id: 'social', icon: '🌐', label: tr('tabSocialMedia') },
      { id: 'referrals', icon: '👥', label: tr('tabInviteFriends') }
    ];

    mainTabs.forEach(function (mt) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.innerHTML = '<span class="fvh-tab-icon">' + mt.icon + '</span><span class="fvh-tab-label">' + mt.label + '</span>';
      if (mt.id === curMainTab) {
        btn.className = 'on';
        setTimeout(function () {
          try { btn.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' }); } catch (e) {}
        }, 50);
      }
      btn.onclick = function () {
        curMainTab = mt.id;
        mainSeg.querySelectorAll('button').forEach(function (b) { b.className = ''; });
        btn.className = 'on';
        app.audio.play('click');
        try { btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }); } catch (e) {}
        renderQuestsPage();
      };
      mainSeg.appendChild(btn);
    });
    body.appendChild(mainSeg);

    // Dynamic Content Area
    var contentArea = document.createElement('div');
    contentArea.className = 'fvh-quest-content';
    body.appendChild(contentArea);

    page.appendChild(body);
    container.appendChild(page);

    function getStats() {
      return app.store.data.stats || {
        matches: 0, wins: 0, losses: 0, goals: 0, baskets: 0,
        winsFooty: 0, winsHoops: 0, winsClash: 0
      };
    }

    function getClaimedList() {
      if (!app.store.data.claimedQuests) {
        app.store.data.claimedQuests = [];
      }
      return app.store.data.claimedQuests;
    }

    function getSocialState() {
      if (!app.store.data.socialState) {
        app.store.data.socialState = {};
      }
      return app.store.data.socialState;
    }

    function getPlayerId() {
      var pid = app.store.data.playerId || 'PLAYER_' + Math.floor(1000 + Math.random() * 9000);
      app.store.data.playerId = pid;
      return pid;
    }

    // ==========================================
    // 1. GAMEPLAY QUESTS SECTION
    // ==========================================
    function renderGameplayQuests() {
      contentArea.innerHTML = '';

      // Sub-Navigation for Gameplay (Daily, Weekly, Achievements)
      var subSeg = document.createElement('div');
      subSeg.className = 'seg fvh-quest-sub-nav';
      subSeg.style.marginBottom = '14px';
      var subTabs = [
        { id: 'daily', label: tr('tabDaily') },
        { id: 'weekly', label: tr('tabWeekly') },
        { id: 'achieve', label: tr('tabAchievements') }
      ];
      subTabs.forEach(function (st) {
        var sbtn = document.createElement('button');
        sbtn.textContent = st.label;
        if (st.id === curSubTab) sbtn.className = 'on';
        sbtn.onclick = function () {
          curSubTab = st.id;
          app.audio.play('click');
          renderGameplayQuests();
        };
        subSeg.appendChild(sbtn);
      });
      contentArea.appendChild(subSeg);

      var stats = getStats();
      var claimed = getClaimedList();
      var totalScore = (stats.goals || 0) + (stats.baskets || 0);
      var lang = getActiveLang();

      // Prime Daily Directive Hero Banner
      var primeTarget = 5;
      var primeCur = Math.min(primeTarget, totalScore);
      var primeClaimed = claimed.indexOf('prime_daily') !== -1;
      var primeReady = primeCur >= primeTarget && !primeClaimed;
      var primeTitleStr = tr('q_prime_title');

      var primeBanner = document.createElement('div');
      primeBanner.className = 'fvh-prime-card';
      primeBanner.innerHTML =
        '<div class="fvh-prime-header">' +
        '<div>' +
        '<span class="fvh-prime-tag">🔥 ' + tr('primeChallenge') + '</span>' +
        '<h2 style="margin:4px 0 2px;font-size:18px;">' + primeTitleStr + '</h2>' +
        '</div>' +
        '<div class="fvh-prime-reward">🪙 250 + 100 XP</div>' +
        '</div>' +
        '<div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">' + tr('resetsIn', { t: '14h 22m' }) + ' · ' + tr('streakBadge', { n: 3 }) + '</div>' +
        '<div class="pbar" style="height:10px;margin:0 0 10px 0;"><i style="width:' + Math.min(100, Math.floor((primeCur / primeTarget) * 100)) + '%;"></i></div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center;">' +
        '<span style="font-size:12px;color:var(--text-muted);">' + tr('progress') + ': ' + primeCur + ' / ' + primeTarget + '</span>' +
        (primeClaimed ?
          '<button class="btn small" disabled>✓ ' + tr('completed') + '</button>' :
          primeReady ?
          '<button class="btn small primary prime-claim-btn" style="font-weight:800;">' + tr('claim') + ' 🪙 250</button>' :
          '<button class="btn small" disabled>' + tr('inProgress') + '</button>') +
        '</div>';

      var primeBtn = primeBanner.querySelector('.prime-claim-btn');
      if (primeBtn) {
        primeBtn.onclick = function () {
          var pid = getAppPlayerId(app);
          safeEconomyApi('/api/economy/reward', {
            playerId: pid,
            rewardType: 'quest',
            questId: 'prime_daily',
            idempotencyKey: 'quest_' + pid + '_prime_daily'
          }).then(function (res) {
            if (res && res.ok) {
              app.store.update(function (d) {
                if (!d.claimedQuests) d.claimedQuests = [];
                if (d.claimedQuests.indexOf('prime_daily') === -1) d.claimedQuests.push('prime_daily');
                d.coins = res.coins;
                d.xp = res.xp;
              });
            } else {
              app.store.update(function (d) {
                if (!d.claimedQuests) d.claimedQuests = [];
                if (d.claimedQuests.indexOf('prime_daily') === -1) d.claimedQuests.push('prime_daily');
                d.coins = (d.coins || 0) + 250;
                d.xp = (d.xp || 0) + 100;
              });
            }
            app.audio.play('claim');
            showToast(lang === 'ru' ? '🎉 +250 Монет, +100 XP!' : '🎉 +250 Coins, +100 XP!');
            renderGameplayQuests();
          });
        };
      }
      contentArea.appendChild(primeBanner);

      // Quest pools
      var dailyPool = [
        { id: 'd_play3', title: tr('q_play3_title'), desc: tr('q_play3_desc'), cur: Math.min(3, stats.matches || 0), target: 3, coins: 80, xp: 40, icon: '⚽' },
        { id: 'd_score5', title: tr('q_score5_title'), desc: tr('q_score5_desc'), cur: Math.min(5, totalScore), target: 5, coins: 120, xp: 60, icon: '🎯' },
        { id: 'd_win1', title: tr('q_win1_title'), desc: tr('q_win1_desc'), cur: Math.min(1, stats.wins || 0), target: 1, coins: 150, xp: 75, icon: '🏆' }
      ];

      var weeklyPool = [
        { id: 'w_win10', title: tr('q_win10_title'), desc: tr('q_win10_desc'), cur: Math.min(10, stats.wins || 0), target: 10, coins: 500, xp: 300, icon: '👑' },
        { id: 'w_score20', title: tr('q_score20_title'), desc: tr('q_score20_desc'), cur: Math.min(20, totalScore), target: 20, coins: 400, xp: 250, icon: '🔥' },
        { id: 'w_matches15', title: tr('q_matches15_title'), desc: tr('q_matches15_desc'), cur: Math.min(15, stats.matches || 0), target: 15, coins: 350, xp: 200, icon: '🏃' }
      ];

      var achievePool = [
        { id: 'a_first_win', title: tr('q_first_win_title'), desc: tr('q_first_win_desc'), cur: Math.min(1, stats.wins || 0), target: 1, coins: 200, xp: 100, icon: '🎖️' },
        { id: 'a_footy_master', title: tr('q_footy_master_title'), desc: tr('q_footy_master_desc'), cur: Math.min(10, stats.winsFooty || 0), target: 10, coins: 800, xp: 500, icon: '⚽' },
        { id: 'a_hoops_master', title: tr('q_hoops_master_title'), desc: tr('q_hoops_master_desc'), cur: Math.min(10, stats.winsHoops || 0), target: 10, coins: 800, xp: 500, icon: '🏀' }
      ];

      var missionList = document.createElement('div');
      missionList.className = 'fvh-mission-list';

      var activePool = curSubTab === 'daily' ? dailyPool : curSubTab === 'weekly' ? weeklyPool : achievePool;

      activePool.forEach(function (q) {
        var card = document.createElement('div');
        var isClaimed = claimed.indexOf(q.id) !== -1;
        var isReady = q.cur >= q.target && !isClaimed;

        card.className = 'fvh-mission-card' + (isReady ? ' ready' : '') + (isClaimed ? ' completed' : '');
        var pct = Math.min(100, Math.floor((q.cur / q.target) * 100));

        card.innerHTML =
          '<div class="fvh-mission-icon">' + q.icon + '</div>' +
          '<div class="fvh-mission-content">' +
          '<div class="fvh-mission-title-row">' +
          '<div class="fvh-mission-title">' + q.title + '</div>' +
          '<div class="fvh-mission-reward">🪙 ' + q.coins + ' · ' + q.xp + ' XP</div>' +
          '</div>' +
          '<div class="fvh-mission-desc">' + q.desc + '</div>' +
          '<div class="pbar" style="height:6px;margin:8px 0 4px 0;"><i style="width:' + pct + '%;"></i></div>' +
          '<div class="fvh-mission-meta">' +
          '<span>' + tr('progress') + ': ' + q.cur + ' / ' + q.target + '</span>' +
          '<span>' + pct + '%</span>' +
          '</div>' +
          '</div>' +
          '<div class="fvh-mission-action"></div>';

        var actBox = card.querySelector('.fvh-mission-action');
        var btn = document.createElement('button');

        if (isClaimed) {
          btn.className = 'btn small';
          btn.disabled = true;
          btn.textContent = '✓ ' + tr('completed');
        } else if (isReady) {
          btn.className = 'btn small primary';
          btn.textContent = tr('claim');
          btn.onclick = function () {
            var pid = getAppPlayerId(app);
            safeEconomyApi('/api/economy/reward', {
              playerId: pid,
              rewardType: 'quest',
              questId: q.id,
              idempotencyKey: 'quest_' + pid + '_' + q.id
            }).then(function (res) {
              if (res && res.ok) {
                app.store.update(function (d) {
                  if (!d.claimedQuests) d.claimedQuests = [];
                  if (d.claimedQuests.indexOf(q.id) === -1) d.claimedQuests.push(q.id);
                  d.coins = res.coins;
                  d.xp = res.xp;
                });
              } else {
                app.store.update(function (d) {
                  if (!d.claimedQuests) d.claimedQuests = [];
                  if (d.claimedQuests.indexOf(q.id) === -1) {
                    d.claimedQuests.push(q.id);
                    d.coins = (d.coins || 0) + q.coins;
                    d.xp = (d.xp || 0) + q.xp;
                  }
                });
              }
              app.audio.play('claim');
              showToast(lang === 'ru' ? ('🎁 +' + q.coins + ' Монет, +' + q.xp + ' XP!') : ('🎁 +' + q.coins + ' Coins, +' + q.xp + ' XP!'));
              renderGameplayQuests();
            });
          };
        } else {
          btn.className = 'btn small';
          btn.disabled = true;
          btn.textContent = q.cur + '/' + q.target;
        }

        actBox.appendChild(btn);
        missionList.appendChild(card);
      });

      contentArea.appendChild(missionList);
    }

    // ==========================================
    // 2. OFFICIAL SOCIAL QUESTS SECTION
    // ==========================================
    function renderSocialQuests() {
      contentArea.innerHTML = '';

      var claimed = getClaimedList();
      var socialState = getSocialState();
      var lang = getActiveLang();

      // Header Banner
      var banner = document.createElement('div');
      banner.className = 'fvh-prime-card';
      banner.innerHTML =
        '<div class="fvh-prime-header">' +
        '<div>' +
        '<span class="fvh-prime-tag">🌐 ' + tr('socialMissionTitle') + '</span>' +
        '<h2 style="margin:4px 0 2px;font-size:18px;">' + tr('socialMissionSubtitle') + '</h2>' +
        '</div>' +
        '<div class="fvh-prime-reward">🎁 1,950 🪙</div>' +
        '</div>' +
        '<div style="font-size:12px;color:var(--text-muted);margin-top:8px;">' +
        (lang === 'ru' ? '✓ Подпишитесь на официальные каналы проекта. Награда выдаётся после подтверждения перехода.' : '✓ Follow official project channels. Rewards unlocked upon verified visit.') +
        '</div>';
      contentArea.appendChild(banner);

      var officialSocialTasks = [
        {
          id: 'q_sub_tg',
          title: tr('q_sub_tg_title'),
          desc: tr('q_sub_tg_desc'),
          url: 'https://t.me/footy_vs_hoops_news',
          coins: 500,
          xp: 150,
          icon: '📢',
          actionText: tr('subscribeBtn')
        },
        {
          id: 'q_sub_x',
          title: tr('q_sub_x_title'),
          desc: tr('q_sub_x_desc'),
          url: 'https://x.com/FootyVsHoops',
          coins: 400,
          xp: 100,
          icon: '🐦',
          actionText: tr('followBtn')
        },
        {
          id: 'q_sub_chat',
          title: tr('q_sub_chat_title'),
          desc: tr('q_sub_chat_desc'),
          url: 'https://t.me/footy_vs_hoops_chat',
          coins: 450,
          xp: 120,
          icon: '💬',
          actionText: tr('joinBtn')
        },
        {
          id: 'q_sub_insta',
          title: tr('q_sub_insta_title'),
          desc: tr('q_sub_insta_desc'),
          url: 'https://instagram.com/footy_vs_hoops',
          coins: 400,
          xp: 100,
          icon: '📸',
          actionText: tr('followBtn')
        },
        {
          id: 'q_community_event',
          title: tr('q_community_event_title'),
          desc: tr('q_community_event_desc'),
          url: 'https://footyvshoops.io/tournaments/season1',
          coins: 600,
          xp: 200,
          icon: '🏆',
          actionText: tr('verifyClaimBtn')
        }
      ];

      var missionList = document.createElement('div');
      missionList.className = 'fvh-mission-list';

      officialSocialTasks.forEach(function (task) {
        var card = document.createElement('div');
        var isClaimed = claimed.indexOf(task.id) !== -1;
        var st = socialState[task.id] || { status: 'available' };
        var isVerifying = st.status === 'verifying';
        var isReady = st.status === 'ready' && !isClaimed;

        // Auto-resolve verification if 8 seconds elapsed
        if (isVerifying && st.startTime && Date.now() - st.startTime > 8000) {
          st.status = 'ready';
          app.store.update(function (d) {
            if (!d.socialState) d.socialState = {};
            d.socialState[task.id] = { status: 'ready' };
          });
          isVerifying = false;
          isReady = true;
        }

        card.className = 'fvh-mission-card' + (isReady ? ' ready' : '') + (isClaimed ? ' completed' : '');

        var statusTag = isClaimed ?
          '<span style="color:#10b981;font-weight:700;">✓ ' + tr('completed') + '</span>' :
          isReady ?
          '<span style="color:#f59e0b;font-weight:700;">⚡ ' + tr('verifyClaimBtn') + '</span>' :
          isVerifying ?
          '<span style="color:#38bdf8;font-weight:700;">⏳ ' + (lang === 'ru' ? 'Проверка...' : 'Verifying...') + '</span>' :
          '<span style="color:var(--text-muted);">' + (lang === 'ru' ? 'Доступно' : 'Available') + '</span>';

        card.innerHTML =
          '<div class="fvh-mission-icon">' + task.icon + '</div>' +
          '<div class="fvh-mission-content">' +
          '<div class="fvh-mission-title-row">' +
          '<div class="fvh-mission-title">' + task.title + '</div>' +
          '<div class="fvh-mission-reward">🪙 ' + task.coins + ' · ' + task.xp + ' XP</div>' +
          '</div>' +
          '<div class="fvh-mission-desc">' + task.desc + '</div>' +
          '<div class="fvh-mission-meta" style="margin-top:6px;">' +
          '<span>' + statusTag + '</span>' +
          '</div>' +
          '</div>' +
          '<div class="fvh-mission-action"></div>';

        var actBox = card.querySelector('.fvh-mission-action');
        var btn = document.createElement('button');

        if (isClaimed) {
          btn.className = 'btn small';
          btn.disabled = true;
          btn.textContent = '✓ ' + tr('completed');
        } else if (isReady) {
          btn.className = 'btn small primary';
          btn.textContent = tr('claim') + ' 🪙 ' + task.coins;
          btn.onclick = function () {
            app.store.update(function (d) {
              if (!d.equipped) d.equipped = {};
              if (arena.isDefault) {
                d.equipped[slotKey] = arena.id;
              } else {
                // Themed arena equips for both football and basketball
                d.equipped['stadium.footy'] = arena.id;
                d.equipped['stadium.hoops'] = arena.id;
              }
            });
            app.audio.play('claim');
            showToast(lang === 'ru' ? ('🎉 +' + task.coins + ' Монет, +' + task.xp + ' XP!') : ('🎉 +' + task.coins + ' Coins, +' + task.xp + ' XP!'));
            renderSocialQuests();
          };
        } else if (isVerifying) {
          btn.className = 'btn small';
          btn.disabled = true;
          btn.textContent = (lang === 'ru' ? '⏳ Проверка' : '⏳ Checking');
          // Auto refresh after delay
          setTimeout(function () {
            renderSocialQuests();
          }, 3500);
        } else {
          btn.className = 'btn small primary';
          btn.textContent = task.actionText + ' ↗';
          btn.onclick = function () {
            window.open(task.url, '_blank');
            app.store.update(function (d) {
              if (!d.socialState) d.socialState = {};
              d.socialState[task.id] = { status: 'verifying', startTime: Date.now() };
            });
            app.audio.play('click');
            showToast(lang === 'ru' ? 'Канал открыт! Идёт верификация...' : 'Channel opened! Verification started...');
            renderSocialQuests();
          };
        }

        actBox.appendChild(btn);
        missionList.appendChild(card);
      });

      contentArea.appendChild(missionList);
    }

    // ==========================================
    // 3. INVITE FRIENDS / REFERRAL SQUAD HUB
    // ==========================================
    function renderReferralHub() {
      contentArea.innerHTML = '';

      var pid = getPlayerId();
      var lang = getActiveLang();
      var claimed = getClaimedList();

      var hashNum = Math.abs(pid.split('').reduce(function (a, b) { return ((a << 5) - a) + b.charCodeAt(0); }, 0) % 90000 + 10000);
      var refCode = 'FVH-' + hashNum;
      var refLink = 'https://t.me/FootyHoopsGameBot?start=ref_' + refCode;

      // Loading Container
      var hubWrap = document.createElement('div');
      hubWrap.className = 'fvh-referral-hub';
      contentArea.appendChild(hubWrap);

      function drawHubUI(statsData) {
        var qualifiedCount = statsData.qualifiedCount || 0;
        var totalInvited = statsData.totalInvited || 0;
        var claimedMilestones = statsData.claimedMilestones || [];

        // Save local count sync
        app.store.update(function (d) {
          d.referralCount = qualifiedCount;
        });

        hubWrap.innerHTML =
          // Hero Overview Card
          '<div class="fvh-prime-card" style="margin-bottom:14px;">' +
          '<div class="fvh-prime-header">' +
          '<div>' +
          '<span class="fvh-prime-tag">👥 ' + tr('referralHubTitle') + '</span>' +
          '<h2 style="margin:4px 0 2px;font-size:18px;">' + tr('referralHubSubtitle') + '</h2>' +
          '</div>' +
          '<div class="fvh-prime-reward">👑 SQUAD</div>' +
          '</div>' +
          '<div style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:12px;margin:12px 0;">' +
          '<div style="font-size:11px;color:var(--text-muted);letter-spacing:1px;text-transform:uppercase;">' + tr('yourRefLink') + '</div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:6px;">' +
          '<code style="color:var(--accent-cyan);font-weight:800;font-size:15px;letter-spacing:1px;">' + refCode + '</code>' +
          '<button class="btn small primary ref-copy-btn" style="white-space:nowrap;">📋 ' + tr('copyInviteLink') + '</button>' +
          '</div>' +
          '</div>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
          '<button class="btn small ref-share-btn">🚀 Telegram Share</button>' +
          '<button class="btn small ref-simulate-btn" style="opacity:0.75;">🎮 +1 ' + (lang === 'ru' ? 'Тест-друг' : 'Test Friend') + '</button>' +
          '</div>' +
          '</div>' +

          // Stats Metric Cards
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">' +
          '<div class="fvh-stat-card" style="padding:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px;text-align:center;">' +
          '<div style="font-size:22px;font-weight:900;color:var(--accent-cyan);">' + totalInvited + '</div>' +
          '<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">' + (lang === 'ru' ? 'Переходов / Регистраций' : 'Total Joined') + '</div>' +
          '</div>' +
          '<div class="fvh-stat-card" style="padding:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px;text-align:center;">' +
          '<div style="font-size:22px;font-weight:900;color:#10b981;">' + qualifiedCount + '</div>' +
          '<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">' + (lang === 'ru' ? 'Квалифицировано (1+ матч)' : 'Qualified (1+ Match)') + '</div>' +
          '</div>' +
          '</div>' +

          // Rules Explainer Box
          '<div style="background:rgba(30,41,59,0.5);border-left:3px solid var(--accent-cyan);padding:10px 14px;border-radius:0 8px 8px 0;margin-bottom:16px;">' +
          '<div style="font-size:12px;font-weight:700;color:#ffffff;margin-bottom:2px;">' + tr('refRulesTitle') + '</div>' +
          '<div style="font-size:11px;color:var(--text-muted);line-height:1.4;">' + tr('refRulesDesc') + '</div>' +
          '</div>' +

          // Milestone Progress Title
          '<h3 style="margin:0 0 10px 0;font-size:14px;letter-spacing:1px;text-transform:uppercase;color:var(--text-muted);">' +
          (lang === 'ru' ? 'ШКАЛА НАГРАД ЗА ДРУЗЕЙ' : 'FRIEND MILESTONE TRACK') +
          '</h3>' +

          // Milestones Container
          '<div class="fvh-milestone-list" style="display:flex;flex-direction:column;gap:8px;"></div>';

        // Bind Copy Button
        var copyBtn = hubWrap.querySelector('.ref-copy-btn');
        if (copyBtn) {
          copyBtn.onclick = function () {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(refLink);
            }
            app.audio.play('click');
            showToast(tr('inviteLinkCopied'));
            copyBtn.textContent = '✓ ' + (lang === 'ru' ? 'Скопировано!' : 'Copied!');
            setTimeout(function () {
              copyBtn.textContent = '📋 ' + tr('copyInviteLink');
            }, 1800);
          };
        }

        // Bind Share Button
        var shareBtn = hubWrap.querySelector('.ref-share-btn');
        if (shareBtn) {
          shareBtn.onclick = function () {
            var shareUrl = 'https://t.me/share/url?url=' + encodeURIComponent(refLink) + '&text=' + encodeURIComponent('Play FOOTY vs HOOPS with me! Compete in fast-paced arcade matches and earn crypto rewards!');
            window.open(shareUrl, '_blank');
            app.audio.play('click');
          };
        }

        // Bind Simulate Button (Tests backend qualify flow)
        var simBtn = hubWrap.querySelector('.ref-simulate-btn');
        if (simBtn) {
          simBtn.onclick = function () {
            simBtn.disabled = true;
            simBtn.textContent = '...';
            var demoFriendId = 'demo_friend_' + Math.floor(1000 + Math.random() * 9000);
            fetch(getApiUrl('/api/referrals/register'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ friendId: demoFriendId, referralCode: refCode })
            }).then(function () {
              return fetch(getApiUrl('/api/referrals/qualify'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ friendId: demoFriendId })
              });
            }).then(function () {
              app.audio.play('claim');
              showToast(lang === 'ru' ? '🎉 Новый квалифицированный друг добавлен!' : '🎉 Qualified friend registered!');
              loadStats();
            }).catch(function (e) {
              console.warn(e);
              // Local fallback simulation
              app.store.update(function (d) {
                d.referralCount = (d.referralCount || 0) + 1;
              });
              loadStats();
            });
          };
        }

        // Milestone Definitions (1, 3, 5, 10, 25 Friends)
        var milestones = [
          { target: 1, coins: 500, xp: 150, rewardTitle: (lang === 'ru' ? '500 🪙 + 150 XP' : '500 🪙 + 150 XP'), icon: '🥉' },
          { target: 3, coins: 1500, xp: 300, rewardTitle: (lang === 'ru' ? '1,500 🪙 + Форма Rookie Blue' : '1,500 🪙 + Rookie Blue Jersey'), icon: '🥈' },
          { target: 5, coins: 3000, xp: 500, rewardTitle: (lang === 'ru' ? '3,000 🪙 + Мяч Cyber Neon' : '3,000 🪙 + Cyber Neon Ball'), icon: '🥇' },
          { target: 10, coins: 7500, xp: 1000, rewardTitle: (lang === 'ru' ? '7,500 🪙 + Арена Космос' : '7,500 🪙 + Space Orbit Arena'), icon: '💎' },
          { target: 25, coins: 20000, xp: 3000, rewardTitle: (lang === 'ru' ? '20,000 🪙 + Легендарный Трофей' : '20,000 🪙 + Legendary Trophy'), icon: '👑' }
        ];

        var mList = hubWrap.querySelector('.fvh-milestone-list');

        milestones.forEach(function (m) {
          var isClaimed = claimedMilestones.indexOf(m.target) !== -1 || claimed.indexOf('ref_m_' + m.target) !== -1;
          var isReady = qualifiedCount >= m.target && !isClaimed;
          var mCard = document.createElement('div');
          mCard.className = 'fvh-mission-card' + (isReady ? ' ready' : '') + (isClaimed ? ' completed' : '');

          mCard.innerHTML =
            '<div class="fvh-mission-icon">' + m.icon + '</div>' +
            '<div class="fvh-mission-content">' +
            '<div class="fvh-mission-title-row">' +
            '<div class="fvh-mission-title">' + (lang === 'ru' ? (m.target + ' Друзей в отряде') : (m.target + ' Squad Friends')) + '</div>' +
            '<div class="fvh-mission-reward">🪙 ' + m.coins + '</div>' +
            '</div>' +
            '<div class="fvh-mission-desc">' + m.rewardTitle + '</div>' +
            '<div class="fvh-mission-meta" style="margin-top:4px;">' +
            '<span>' + tr('progress') + ': ' + Math.min(qualifiedCount, m.target) + ' / ' + m.target + '</span>' +
            '</div>' +
            '</div>' +
            '<div class="fvh-mission-action"></div>';

          var actBox = mCard.querySelector('.fvh-mission-action');
          var btn = document.createElement('button');

          if (isClaimed) {
            btn.className = 'btn small';
            btn.disabled = true;
            btn.textContent = '✓ ' + tr('completed');
          } else if (isReady) {
            btn.className = 'btn small primary';
            btn.textContent = tr('claim');
            btn.onclick = function () {
              btn.disabled = true;
              fetch(getApiUrl('/api/referrals/claim'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: pid, milestoneTarget: m.target })
              }).then(function (r) { return r.json(); }).then(function (res) {
                app.store.update(function (d) {
                  if (!d.claimedQuests) d.claimedQuests = [];
                  d.claimedQuests.push('ref_m_' + m.target);
                  d.coins = (d.coins || 0) + m.coins;
                  d.xp = (d.xp || 0) + m.xp;
                });
                app.audio.play('claim');
                showToast(lang === 'ru' ? ('🎉 Награда получена: +' + m.coins + ' 🪙!') : ('🎉 Reward claimed: +' + m.coins + ' 🪙!'));
                loadStats();
              }).catch(function (e) {
                console.warn(e);
                app.store.update(function (d) {
                  if (!d.claimedQuests) d.claimedQuests = [];
                  d.claimedQuests.push('ref_m_' + m.target);
                  d.coins = (d.coins || 0) + m.coins;
                  d.xp = (d.xp || 0) + m.xp;
                });
                app.audio.play('claim');
                loadStats();
              });
            };
          } else {
            btn.className = 'btn small';
            btn.disabled = true;
            btn.textContent = Math.min(qualifiedCount, m.target) + '/' + m.target;
          }

          actBox.appendChild(btn);
          mList.appendChild(mCard);
        });
      }

      function loadStats() {
        fetch(getApiUrl('/api/referrals/stats?userId=' + encodeURIComponent(pid)))
          .then(function (res) { return res.json(); })
          .then(function (data) {
            if (data.ok) drawHubUI(data);
            else drawHubUI({ qualifiedCount: app.store.data.referralCount || 0, totalInvited: app.store.data.referralCount || 0, claimedMilestones: [] });
          })
          .catch(function () {
            drawHubUI({ qualifiedCount: app.store.data.referralCount || 0, totalInvited: app.store.data.referralCount || 0, claimedMilestones: [] });
          });
      }

      loadStats();
    }

    function renderQuestsPage() {
      if (curMainTab === 'gameplay') renderGameplayQuests();
      else if (curMainTab === 'social') renderSocialQuests();
      else if (curMainTab === 'referrals') renderReferralHub();
    }

    renderQuestsPage();

    // Persistent Unified Bottom Navigation
    container.appendChild(createSharedBottomNav('quests', app));

    return container;
  }



  // 5 Configured Currency Packages (Prompt 4 Section 4)
  var CURRENCY_PACKAGES = [
    {
      id: 'pkg_coins_starter',
      name: 'Starter Coin Pack',
      coinsAmount: 500,
      starsPrice: 50,
      tonPrice: 0.3,
      icon: '🪙',
      badge: 'STARTER',
      desc: '500 FvH Coin for quick cosmetics & early match boosts.'
    },
    {
      id: 'pkg_coins_pro',
      name: 'Pro Coin Pack',
      coinsAmount: 1200,
      starsPrice: 100,
      tonPrice: 0.6,
      icon: '💰',
      badge: 'POPULAR',
      desc: '1,200 FvH Coin. Unlocks rare kits and signature balls.'
    },
    {
      id: 'pkg_coins_elite',
      name: 'Elite Coin Pack',
      coinsAmount: 2800,
      starsPrice: 200,
      tonPrice: 1.2,
      icon: '💎',
      badge: 'ELITE VALUE',
      desc: '2,800 FvH Coin. Enough for scenic themed arenas & elite bundles.'
    },
    {
      id: 'pkg_coins_champion',
      name: 'Champion Coin Pack',
      coinsAmount: 6500,
      starsPrice: 400,
      tonPrice: 2.5,
      icon: '🏆',
      badge: 'CHAMPION',
      desc: '6,500 FvH Coin. Unlock legendary stadium environments & effects.'
    },
    {
      id: 'pkg_coins_legend',
      name: 'Legend Coin Pack',
      coinsAmount: 15000,
      starsPrice: 800,
      tonPrice: 5.0,
      icon: '👑',
      badge: 'BEST VALUE',
      desc: '15,000 FvH Coin. Complete boutique wardrobe access for both sports.'
    }
  ];

  function computeBundleRegularValue(bundle) {
    var val = 0;
    var priceMap = {
      skin_cyber: 1100, skin_sunset: 260, skin_hydro: 480, skin_mars: 520, skin_astronaut: 950, skin_neon_elite: 1100, skin_shadow: 480, skin_frost: 280,
      ball_footy_inferno: 700, ball_hoops_blaze: 200, ball_footy_solar: 550, ball_earthrise: 650, ball_cyber_neon: 800, ball_tidal: 600, ball_hoops_midnight: 750,
      std_underwater_dome: 820, std_ocean_sunset: 580, std_mars_dome: 750, std_moon_crater: 680, std_cyber_megacity: 950, std_space_orbit: 900, std_floating_islands: 880, std_volcano_caldera: 850,
      trail_laser: 650
    };
    bundle.items.forEach(function (it) {
      if (it.type === 'coins') val += (it.val || 0);
      else if (it.type === 'pack') val += (it.packId === 'clash' ? 500 : 250) * (it.count || 1);
      else if (it.type === 'cosmetic') val += (priceMap[it.id] || 500);
    });
    return val;
  }

  // Thematic Store Bundles Definition (with mathematically verified discounts)
  var BUNDLE_ITEMS = [
    {
      id: 'bundle_footy_starter',
      category: 'bundles',
      badge: 'STARTER PACK',
      name: 'FOOTY Starter Bundle',
      desc: 'Equip FOOTY with Cyber Blue jersey, Inferno ball, 500 coins and 2 Bronze Packs.',
      originalValue: 2800,
      coinsPrice: 1950,
      discount: 30,
      starsPrice: 150,
      tonPrice: 0.9,
      icon: '⚽🔥',
      items: [
        { id: 'skin_cyber', name: 'Cyber Blue Jersey', icon: '🎽', type: 'cosmetic' },
        { id: 'ball_footy_inferno', name: 'Inferno Ball Skin', icon: '🔥', type: 'cosmetic' },
        { name: '500 Coins', icon: '🪙', type: 'coins', val: 500 },
        { name: '2x Bronze Pack', icon: '🎁', type: 'pack', packId: 'footy', count: 2 }
      ]
    },
    {
      id: 'bundle_hoops_starter',
      category: 'bundles',
      badge: 'STARTER PACK',
      name: 'HOOPS Starter Bundle',
      desc: 'Gear up HOOPS with Cyber Blue jersey, Midnight ball, 500 coins and 2 Pro Packs.',
      originalValue: 2850,
      coinsPrice: 1950,
      discount: 32,
      starsPrice: 150,
      tonPrice: 0.9,
      icon: '🏀✨',
      items: [
        { id: 'skin_cyber', name: 'Cyber Blue Jersey', icon: '🎽', type: 'cosmetic' },
        { id: 'ball_hoops_midnight', name: 'Midnight Matte Ball', icon: '💫', type: 'cosmetic' },
        { name: '500 Coins', icon: '🪙', type: 'coins', val: 500 },
        { name: '2x Pro Pack', icon: '🎁', type: 'pack', packId: 'hoops', count: 2 }
      ]
    },
    {
      id: 'bundle_ocean_arena',
      category: 'bundles',
      badge: 'OCEAN WORLD',
      name: 'Ocean Arena Collection',
      desc: 'Abyssal Ocean Dome & Coastal Sunset Court with Tidal Wave ball, Hydro kit and 1,000 Coins.',
      originalValue: 3480,
      coinsPrice: 2400,
      discount: 31,
      starsPrice: 350,
      tonPrice: 2.2,
      icon: '🌊🏖️',
      items: [
        { id: 'std_underwater_dome', name: 'Abyssal Ocean Dome', icon: '🫧', type: 'cosmetic' },
        { id: 'std_ocean_sunset', name: 'Coastal Sunset Court', icon: '🌅', type: 'cosmetic' },
        { id: 'skin_hydro', name: 'Hydro Striker Kit', icon: '🎽', type: 'cosmetic' },
        { id: 'ball_tidal', name: 'Tidal Wave Ball', icon: '🌊', type: 'cosmetic' },
        { name: '1000 Coins', icon: '🪙', type: 'coins', val: 1000 }
      ]
    },
    {
      id: 'bundle_mars_explorer',
      category: 'bundles',
      badge: 'RED PLANET',
      name: 'Mars Explorer Collection',
      desc: 'Mars Bio-Dome Arena, Solar Blaze ball, Crimson Rover kit, 1,000 Coins and 2 Clash Packs.',
      originalValue: 3820,
      coinsPrice: 2600,
      discount: 32,
      starsPrice: 400,
      tonPrice: 2.5,
      icon: '🔴🪐',
      items: [
        { id: 'std_mars_dome', name: 'Mars Bio-Dome Arena', icon: '🪐', type: 'cosmetic' },
        { id: 'ball_footy_solar', name: 'Solar Blaze Ball', icon: '☀️', type: 'cosmetic' },
        { id: 'skin_mars', name: 'Mars Rover Kit', icon: '🚀', type: 'cosmetic' },
        { name: '1000 Coins', icon: '🪙', type: 'coins', val: 1000 },
        { name: '2x Ultimate Clash Pack', icon: '⚡', type: 'pack', packId: 'clash', count: 2 }
      ]
    },
    {
      id: 'bundle_lunar_champ',
      category: 'bundles',
      badge: 'APOLLO VIP',
      name: 'Lunar Championship Collection',
      desc: 'Apollo Lunar Arena, Earthrise match ball, Astronaut silver kit, 1,500 Coins and 2 Clash Packs.',
      originalValue: 4780,
      coinsPrice: 3200,
      discount: 33,
      starsPrice: 450,
      tonPrice: 2.8,
      icon: '🌕🚀',
      items: [
        { id: 'std_moon_crater', name: 'Apollo Lunar Arena', icon: '🌕', type: 'cosmetic' },
        { id: 'ball_earthrise', name: 'Earthrise Ball', icon: '🌍', type: 'cosmetic' },
        { id: 'skin_astronaut', name: 'Astronaut Kit', icon: '👨‍🚀', type: 'cosmetic' },
        { name: '1500 Coins', icon: '🪙', type: 'coins', val: 1500 },
        { name: '2x Ultimate Clash Pack', icon: '⚡', type: 'pack', packId: 'clash', count: 2 }
      ]
    },
    {
      id: 'bundle_cyber_neon',
      category: 'bundles',
      badge: 'CYBERPUNK',
      name: 'Cyber Neon Collection',
      desc: 'Neo Tokyo Megacity rooftop, Cyber Neon ball, Cyber Striker kit, Laser Trail and 2,000 Coins.',
      originalValue: 5500,
      coinsPrice: 3800,
      discount: 31,
      starsPrice: 500,
      tonPrice: 3.2,
      icon: '🏙️⚡',
      items: [
        { id: 'std_cyber_megacity', name: 'Neo Tokyo Megacity', icon: '🏙️', type: 'cosmetic' },
        { id: 'ball_cyber_neon', name: 'Cyber Neon Ball', icon: '💫', type: 'cosmetic' },
        { id: 'skin_neon_elite', name: 'Cyber Striker #10', icon: '🎽', type: 'cosmetic' },
        { id: 'trail_laser', name: 'Laser Trail', icon: '⚡', type: 'cosmetic' },
        { name: '2000 Coins', icon: '🪙', type: 'coins', val: 2000 }
      ]
    },
    {
      id: 'bundle_legendary_champs',
      category: 'bundles',
      badge: 'ALL-STAR MEGA',
      name: 'Legendary Champions Bundle',
      desc: 'All 4 signature jerseys, 4 premium balls, 3 scenic arenas, 5,000 coins and 5 Clash Packs.',
      originalValue: 15240,
      coinsPrice: 8500,
      discount: 44,
      starsPrice: 850,
      tonPrice: 5.0,
      icon: '👑🏆',
      items: [
        { id: 'std_space_orbit', name: 'Orbital Space Colosseum', icon: '🚀', type: 'cosmetic' },
        { id: 'std_floating_islands', name: 'Aetheria Sky Islands', icon: '☁️', type: 'cosmetic' },
        { id: 'std_volcano_caldera', name: 'Magma Caldera Arena', icon: '🌋', type: 'cosmetic' },
        { id: 'skin_neon_elite', name: 'Cyber Striker #10', icon: '🎽', type: 'cosmetic' },
        { id: 'skin_cyber', name: 'Cyber Blue Jersey', icon: '🎽', type: 'cosmetic' },
        { id: 'skin_shadow', name: 'Shadow Ninja', icon: '🥷', type: 'cosmetic' },
        { id: 'skin_frost', name: 'Frost Giant', icon: '❄️', type: 'cosmetic' },
        { id: 'ball_footy_inferno', name: 'Inferno Ball Skin', icon: '🔥', type: 'cosmetic' },
        { id: 'ball_hoops_blaze', name: 'Neon Blaze Ball', icon: '💫', type: 'cosmetic' },
        { id: 'ball_tidal', name: 'Tidal Wave Ball', icon: '🌊', type: 'cosmetic' },
        { id: 'ball_earthrise', name: 'Earthrise Ball', icon: '🌍', type: 'cosmetic' },
        { name: '5000 Coins', icon: '🪙', type: 'coins', val: 5000 },
        { name: '5x Ultimate Clash Pack', icon: '⚡', type: 'pack', packId: 'clash', count: 5 }
      ]
    }
  ];

  // Build Editorial Shop & Sports Boutique Page
  function buildShopPage(app, initialCategory, inspectId) {
    var curCategory = initialCategory || 'all';
    var isPurchasing = false; // Debounce flag to prevent duplicate purchases

    var container = document.createElement('div');
    container.className = 'screen solid page-screen has-nav';
    container.dataset.id = 'shop';

    var page = document.createElement('div');
    page.className = 'page';

    // Page Head
    var head = document.createElement('div');
    head.className = 'page-head fvh-shop-head';
    var backBtn = document.createElement('button');
    backBtn.className = 'btn icon back';
    backBtn.textContent = '←';
    backBtn.onclick = function () {
      app.audio.play('click');
      app.showMenu();
    };

    var titleBox = document.createElement('div');
    titleBox.innerHTML = '<h1 style="margin:0;">' + tr('stadiumStore') + '</h1><small style="color:var(--text-muted);letter-spacing:1px;font-size:10px;">' + tr('storeSub') + '</small>';

    var walletBox = document.createElement('div');
    walletBox.className = 'fvh-wallet-chips';

    head.appendChild(backBtn);
    head.appendChild(titleBox);
    head.appendChild(walletBox);
    page.appendChild(head);

    var body = document.createElement('div');
    body.className = 'page-body fvh-shop-container';

    // 1. Featured Item Hero Spotlight
    var featuredHero = document.createElement('div');
    featuredHero.className = 'fvh-featured-hero';
    body.appendChild(featuredHero);

    // 2. Category Selector Tabs (Added Bundles Category)
    var catSeg = document.createElement('div');
    catSeg.className = 'seg fvh-shop-categories';
    catSeg.style.marginBottom = '16px';
    var categories = [
      { id: 'all', label: tr('catAll') },
      { id: 'bundles', label: tr('catBundles') },
      { id: 'coins', label: tr('catCoins') },
      { id: 'skins', label: tr('catJerseys') },
      { id: 'balls', label: tr('catBalls') },
      { id: 'stadiums', label: tr('catArenas') },
      { id: 'celebrations', label: tr('catCelebrations') },
      { id: 'packs', label: tr('catPacks') }
    ];
    categories.forEach(function (c) {
      var btn = document.createElement('button');
      btn.textContent = c.label;
      if (c.id === curCategory) btn.className = 'on';
      btn.onclick = function () {
        curCategory = c.id;
        catSeg.querySelectorAll('button').forEach(function (b) { b.className = ''; });
        btn.className = 'on';
        app.audio.play('click');
        renderShop();
      };
      catSeg.appendChild(btn);
    });
    body.appendChild(catSeg);

    // 3. Product Catalogue Grid
    var catalogueGrid = document.createElement('div');
    catalogueGrid.className = 'fvh-catalogue-grid';
    body.appendChild(catalogueGrid);

    page.appendChild(body);
    container.appendChild(page);

    function updateWalletUI() {
      var coins = app.store.data.coins || 0;
      var packs = app.store.data.packs || { free: {}, paid: {} };
      var totalPacks = 0;
      if (packs.free) Object.keys(packs.free).forEach(function (k) { totalPacks += packs.free[k] || 0; });
      if (packs.paid) Object.keys(packs.paid).forEach(function (k) { totalPacks += packs.paid[k] || 0; });

      walletBox.innerHTML =
        '<div class="fvh-chip coins">🪙 ' + coins + '</div>' +
        '<div class="fvh-chip packs">🎁 ' + totalPacks + '</div>';
    }

    function checkBundleOwnership(bundle) {
      var owned = app.store.data.owned || [];
      var cosmeticItems = bundle.items.filter(function (it) { return it.type === 'cosmetic'; });
      if (cosmeticItems.length === 0) return { isFullyOwned: false, ownedCount: 0, totalCount: 0 };
      var ownedCount = 0;
      cosmeticItems.forEach(function (it) {
        if (owned.indexOf(it.id) !== -1) ownedCount++;
      });
      return {
        isFullyOwned: (ownedCount === cosmeticItems.length),
        ownedCount: ownedCount,
        totalCount: cosmeticItems.length
      };
    }

    function grantBundle(bundle) {
      app.store.update(function (d) {
        if (!d.owned) d.owned = [];
        if (!d.packs) d.packs = { free: {}, paid: {} };
        if (!d.packs.paid) d.packs.paid = {};

        bundle.items.forEach(function (it) {
          if (it.type === 'cosmetic') {
            if (d.owned.indexOf(it.id) === -1) {
              d.owned.push(it.id);
            }
          } else if (it.type === 'coins') {
            d.coins = (d.coins || 0) + (it.val || 0);
          } else if (it.type === 'pack') {
            var pId = it.packId || 'footy';
            var c = it.count || 1;
            d.packs.paid[pId] = (d.packs.paid[pId] || 0) + c;
          }
        });
      });
      app.audio.play('claim');
      showToast('🎁 ' + trItem(bundle.name) + ' ' + tr('purchaseSuccess'));
      renderShop();
    }

    // Bundle Inspector & Purchase Modal
    function openBundleInspector(bundle) {
      var ownInfo = checkBundleOwnership(bundle);

      var overlay = document.createElement('div');
      overlay.className = 'modal-back';
      var modal = document.createElement('div');
      modal.className = 'modal fvh-bundle-modal';
      modal.style.maxWidth = '460px';
      modal.style.width = '100%';
      modal.style.boxSizing = 'border-box';
      modal.style.textAlign = 'left';

      var localizedBundleName = trItem(bundle.name);

      var itemsHtml = bundle.items.map(function (it) {
        var owned = (app.store.data.owned || []).indexOf(it.id) !== -1;
        return '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:rgba(255,255,255,0.04);border-radius:10px;border:1px solid rgba(255,255,255,0.08);">' +
          '  <div style="display:flex;align-items:center;gap:10px;">' +
          '    <span style="font-size:24px;">' + it.icon + '</span>' +
          '    <div>' +
          '      <div style="font-weight:800;font-size:13px;color:var(--text-pure);">' + trItem(it.name) + '</div>' +
          '      <div style="font-size:10.5px;color:var(--text-muted);text-transform:uppercase;">' + it.type + '</div>' +
          '    </div>' +
          '  </div>' +
          '  <div>' +
          (it.type === 'cosmetic' ?
            (owned ? '<span style="font-size:11px;color:#4ade80;font-weight:800;">✓ ' + tr('inCollection') + '</span>' : '<span style="font-size:11px;color:#fde047;font-weight:800;">NEW</span>') :
            '<span style="font-size:11px;color:#38bdf8;font-weight:800;">+' + (it.val ? it.val + ' 🪙' : (it.count || 1) + ' 🎁') + '</span>'
          ) +
          '  </div>' +
          '</div>';
      }).join('');

      modal.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;gap:8px;flex-wrap:wrap;">' +
        '  <span style="font-size:11px;font-weight:900;letter-spacing:1px;color:#fbbf24;background:rgba(255,200,0,0.15);padding:4px 10px;border-radius:20px;border:1px solid rgba(255,200,0,0.3);">' +
        '    ' + bundle.badge + ' · -' + bundle.discount + '% OFF' +
        '  </span>' +
        '  <span style="font-size:12px;color:var(--text-muted);">' +
        '    <del style="opacity:0.6;">' + (bundle.originalValue ? bundle.originalValue.toLocaleString() : '') + ' 🪙</del> ➔ <b style="color:#fde047;">' + bundle.coinsPrice.toLocaleString() + ' 🪙</b>' +
        '  </span>' +
        '  <button class="modal-close-x">✕</button>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;">' +
        '  <div style="font-size:42px;line-height:1;">' + bundle.icon + '</div>' +
        '  <div>' +
        '    <h2 style="margin:0 0 4px;font-size:18px;color:var(--text-pure);">' + localizedBundleName + '</h2>' +
        '    <div style="font-size:12px;color:var(--text-muted);">' + (bundle.desc || '') + '</div>' +
        '  </div>' +
        '</div>' +
        '<div style="font-size:11px;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.8px;margin:14px 0 8px;">' +
        tr('bundleIncludedItems') +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:6px;max-height:220px;overflow-y:auto;margin-bottom:16px;">' +
        itemsHtml +
        '</div>' +
        '<div class="fvh-bundle-modal-actions"></div>';

      modal.querySelector('.modal-close-x').onclick = function () { overlay.remove(); };

      var actionsBox = modal.querySelector('.fvh-bundle-modal-actions');
      if (ownInfo.isFullyOwned) {
        var ownedBtn = document.createElement('button');
        ownedBtn.className = 'btn block';
        ownedBtn.disabled = true;
        ownedBtn.style.opacity = '0.6';
        ownedBtn.textContent = '✓ ' + tr('bundleCompleteSet');
        actionsBox.appendChild(ownedBtn);
      } else {
        var buyBtn = document.createElement('button');
        buyBtn.className = 'btn primary block';
        buyBtn.style.fontWeight = '900';
        buyBtn.style.fontSize = '13px';
        buyBtn.style.padding = '12px 8px';
        buyBtn.style.lineHeight = '1.3';
        buyBtn.innerHTML = tr('buyFor') + ' 🪙 ' + bundle.coinsPrice.toLocaleString() + ' &nbsp;·&nbsp; ' + bundle.starsPrice + ' ⭐ &nbsp;·&nbsp; ' + bundle.tonPrice + ' 💎';
        buyBtn.onclick = function () {
          overlay.remove();
          if (window.__fvhPayments && window.__fvhPayments.openPaymentModal) {
            window.__fvhPayments.openPaymentModal(app, {
              productId: bundle.id,
              title: localizedBundleName,
              coinsPrice: bundle.coinsPrice,
              starsPrice: bundle.starsPrice,
              tonPrice: bundle.tonPrice,
              onPurchased: function () {
                var pid = getAppPlayerId(app);
                safeEconomyApi('/api/economy/purchase', {
                  playerId: pid,
                  itemId: bundle.id,
                  idempotencyKey: 'bundle_' + pid + '_' + bundle.id + '_' + Date.now()
                }).then(function (res) {
                  if (res && res.ok) {
                    app.store.update(function (d) {
                      d.coins = res.coins;
                      d.xp = res.xp;
                      d.owned = res.owned;
                      d.packs = res.packs;
                    });
                  } else {
                    grantBundle(bundle);
                  }
                  app.audio.play('claim');
                  showToast('🎁 ' + localizedBundleName + ' ' + tr('purchaseSuccess'));
                  renderShop();
                });
              }
            });
          }
        };
        actionsBox.appendChild(buyBtn);
      }

      overlay.appendChild(modal);
      document.body.appendChild(overlay);
    }

    app.openBundleInspector = openBundleInspector;
    window.__openBundleInspectorModal = function (bundle) { openBundleInspector(bundle); };

    // Dedicated Item Inspector & Purchase Modal
    function openItemInspector(item) {
      var overlay = document.createElement('div');
      overlay.className = 'modal-back';
      var modal = document.createElement('div');
      modal.className = 'modal fvh-item-modal';

      var owned = app.store.data.owned || [];
      var isOwned = owned.indexOf(item.id) !== -1 || item.isDefault;
      var charMode = app.store.data.selectedCharacter || 'footy';
      var slotKey = item.slot || (item.category === 'balls' ? 'ball.' + charMode : item.category === 'stadiums' ? 'stadium.' + charMode : item.category === 'skins' ? 'skin' : item.category);
      var isEquipped = (app.store.data.equipped && app.store.data.equipped[slotKey] === item.id);
      var rarKey = item.rarity || 'common';
      var localizedRarity = tr('rarity_' + rarKey) || rarKey.toUpperCase();
      var localizedItemName = trItem(item.name);

      modal.innerHTML =
        '<div class="fvh-item-modal-head">' +
        '<span class="rar ' + rarKey + '">' + localizedRarity + '</span>' +
        '<button class="modal-close-x">✕</button>' +
        '</div>' +
        '<div class="fvh-item-modal-preview r-' + rarKey + '" style="display:flex;align-items:center;justify-content:center;padding:16px;">' +
        renderItemArtwork(item, 'large') +
        '</div>' +
        '<h2 class="fvh-item-modal-title">' + localizedItemName + '</h2>' +
        '<div class="fvh-item-modal-category">' + (item.category === 'stadiums' ? tr('catArenas') : item.category === 'skins' ? tr('catJerseys') : item.category ? tr('cat' + item.category.charAt(0).toUpperCase() + item.category.slice(1)) : tr('storeSub')) + (item.mode ? ' · ' + (item.mode === 'footy' ? tr('football') : tr('basketball')) : '') + '</div>' +
        '<p class="fvh-item-modal-desc">' + (item.desc || (localizedItemName + ' — ' + tr('storeSub'))) + '</p>' +
        '<div class="fvh-item-modal-actions"></div>';

      modal.querySelector('.modal-close-x').onclick = function () { overlay.remove(); };

      var actionsBox = modal.querySelector('.fvh-item-modal-actions');

      if (isEquipped) {
        var eqBtn = document.createElement('button');
        eqBtn.className = 'btn block';
        eqBtn.disabled = true;
        eqBtn.textContent = '✓ ' + tr('equipped');
        actionsBox.appendChild(eqBtn);
      } else if (isOwned) {
        var equipBtn = document.createElement('button');
        equipBtn.className = 'btn primary block';
        equipBtn.textContent = tr('equip');
        equipBtn.onclick = function () {
          var pid = getAppPlayerId(app);
          safeEconomyApi('/api/economy/equip', {
            playerId: pid,
            slot: slotKey,
            itemId: item.id
          }).then(function (res) {
            if (res && res.error === 'item_not_owned') {
              app.audio.play('error');
              showToast('⚠️ ' + tr('lockedInShop', { price: item.price || 500 }));
              return;
            }
            app.store.update(function (d) {
              if (!d.equipped) d.equipped = {};
              d.equipped[slotKey] = item.id;
            });
            app.audio.play('claim');
            showToast(tr('equipped') + ': ' + localizedItemName);
            overlay.remove();
            renderShop();
          });
        };
        actionsBox.appendChild(equipBtn);
      } else {
        var buyBtn = document.createElement('button');
        buyBtn.className = 'btn primary block';
        buyBtn.textContent = tr('buyFor') + ' 🪙 ' + item.price;
        buyBtn.onclick = function () {
          if (isPurchasing) return;
          var coins = app.store.data.coins || 0;
          if (coins < item.price) {
            app.audio.play('error');
            showToast(tr('notEnoughCoins'));
            return;
          }

          isPurchasing = true;
          var pid = getAppPlayerId(app);
          safeEconomyApi('/api/economy/purchase', {
            playerId: pid,
            itemId: item.id,
            idempotencyKey: 'buy_' + pid + '_' + item.id + '_' + Date.now()
          }).then(function (res) {
            isPurchasing = false;
            if (res && res.ok) {
              app.store.update(function (d) {
                d.coins = res.coins;
                d.xp = res.xp;
                d.owned = res.owned;
                d.packs = res.packs;
              });
              app.audio.play('claim');
              showToast(tr('purchaseSuccess') + ' (' + localizedItemName + ')');
              overlay.remove();
              renderShop();
            } else if (res && res.error === 'already_owned') {
              showToast(tr('inCollection'));
              overlay.remove();
              renderShop();
            } else if (res && res.error === 'insufficient_funds') {
              app.audio.play('error');
              showToast(tr('notEnoughCoins'));
            } else {
              // Local fallback if offline
              app.store.update(function (d) {
                d.coins -= item.price;
                if (!d.owned) d.owned = [];
                if (d.owned.indexOf(item.id) === -1) {
                  d.owned.push(item.id);
                }
              });
              app.audio.play('claim');
              showToast(tr('purchaseSuccess') + ' (' + localizedItemName + ')');
              overlay.remove();
              renderShop();
            }
          });
        };
        actionsBox.appendChild(buyBtn);
      }

      overlay.appendChild(modal);
      document.body.appendChild(overlay);
    }

    // Mystery Packs Config
    var PACKS_DEF = [
      { id: 'footy', category: 'packs', name: 'Footy Striker Pack', price: 250, icon: '⚽', desc: 'Guaranteed 2 football cards + bonus chance for legendary gear.' },
      { id: 'hoops', category: 'packs', name: 'Hoops All-Star Pack', price: 250, icon: '🏀', desc: 'Guaranteed 2 basketball cards + bonus chance for neon cosmetics.' },
      { id: 'clash', category: 'packs', name: 'Ultimate Clash Pack', price: 500, icon: '⚡', desc: 'High-tier pack with rare celebrations, stadiums, and high coin drops.' }
    ];

    function openPackAnimation(packDef) {
      app.audio.play('claim');
      var pool = [
        { name: '150 Starter Coins', icon: '🪙', type: 'coins', val: 150 },
        { name: 'Shadow Ninja', icon: '🥷', type: 'cosmetic', itemId: 'skin_shadow' },
        { name: 'Rainbow Trail', icon: '🌈', type: 'cosmetic', itemId: 'trail_rainbow' },
        { name: 'Gold Rain Celebration', icon: '✨', type: 'cosmetic', itemId: 'cel_goldrain' },
        { name: 'Coastal Sunset Court', icon: '🌅', type: 'cosmetic', itemId: 'std_ocean_sunset' }
      ];
      var drop = pool[Math.floor(Math.random() * pool.length)];

      app.store.update(function (d) {
        if (drop.type === 'coins') d.coins = (d.coins || 0) + drop.val;
        else if (drop.type === 'cosmetic') {
          if (!d.owned) d.owned = [];
          if (d.owned.indexOf(drop.itemId) === -1) d.owned.push(drop.itemId);
        }
      });

      var overlay = document.createElement('div');
      overlay.className = 'modal-back';
      var m = document.createElement('div');
      m.className = 'modal';
      m.style.textAlign = 'center';
      m.innerHTML =
        '<div style="font-size:12px;color:var(--text-muted);letter-spacing:1px;text-transform:uppercase;">' + tr('packOpened') + '</div>' +
        '<div style="margin:16px 0;animation:bounce 0.6s ease;">' + (drop.icon || '🎁') + '</div>' +
        '<h2 style="margin:0 0 8px;">' + trItem(drop.name) + '</h2>' +
        '<p style="color:var(--text-muted);font-size:13px;margin:0 0 20px;">' + tr('packAdded') + '</p>' +
        '<button class="btn primary block">' + tr('claimAndContinue') + '</button>';
      m.querySelector('button').onclick = function () {
        overlay.remove();
        renderShop();
      };
      overlay.appendChild(m);
      document.body.appendChild(overlay);
    }

    function renderShop() {
      updateWalletUI();

      // Featured Hero Item (Featured Drop of the Day)
      var featuredItem = {
        id: 'skin_neon_elite',
        name: 'CYBER STRIKER #10',
        category: 'skins',
        rarity: 'legendary',
        icon: '🎽',
        price: 650,
        desc: 'Exclusive high-voltage neon athlete jersey with responsive reactive lighting and custom stadium flare.'
      };

      var owned = app.store.data.owned || [];
      var isFeatOwned = owned.indexOf(featuredItem.id) !== -1;
      var localizedFeatRarity = tr('rarity_legendary');

      featuredHero.innerHTML =
        '<div class="fvh-featured-glow"></div>' +
        '<div class="fvh-featured-badge">⚡ ' + tr('featuredTitle') + '</div>' +
        '<div class="fvh-featured-content">' +
        '<div class="fvh-featured-preview">' +
        renderItemArtwork(featuredItem, 'large') +
        '<span class="rar legendary" style="margin-top:6px;">' + localizedFeatRarity + '</span>' +
        '</div>' +
        '<div class="fvh-featured-details">' +
        '<h2 class="fvh-featured-name">' + featuredItem.name + '</h2>' +
        '<p class="fvh-featured-desc">' + featuredItem.desc + '</p>' +
        '<div class="fvh-featured-actions">' +
        (isFeatOwned ?
          '<button class="btn small" disabled>✓ ' + tr('ownedInLocker') + '</button>' :
          '<button class="btn primary small feat-buy-btn">' + tr('buyFor') + ' 🪙 ' + featuredItem.price + '</button>') +
        '<button class="btn small feat-inspect-btn">' + tr('inspect') + '</button>' +
        '</div>' +
        '</div>' +
        '</div>';

      var buyFeat = featuredHero.querySelector('.feat-buy-btn');
      if (buyFeat) {
        buyFeat.onclick = function () {
          if (isPurchasing) return;
          var coins = app.store.data.coins || 0;
          if (coins < featuredItem.price) {
            app.audio.play('error');
            showToast(tr('notEnoughCoins'));
            return;
          }
          isPurchasing = true;
          var pid = getAppPlayerId(app);
          safeEconomyApi('/api/economy/purchase', {
            playerId: pid,
            itemId: featuredItem.id,
            idempotencyKey: 'feat_' + pid + '_' + featuredItem.id + '_' + Date.now()
          }).then(function (res) {
            isPurchasing = false;
            if (res && res.ok) {
              app.store.update(function (d) {
                d.coins = res.coins;
                d.xp = res.xp;
                d.owned = res.owned;
                d.packs = res.packs;
              });
            } else {
              app.store.update(function (d) {
                d.coins -= featuredItem.price;
                if (!d.owned) d.owned = [];
                if (d.owned.indexOf(featuredItem.id) === -1) {
                  d.owned.push(featuredItem.id);
                }
              });
            }
            app.audio.play('claim');
            showToast(tr('purchaseSuccess') + ' (' + featuredItem.name + ')');
            renderShop();
          });
        };
      }

      var inspFeat = featuredHero.querySelector('.feat-inspect-btn');
      if (inspFeat) {
        inspFeat.onclick = function () {
          openItemInspector(featuredItem);
        };
      }

      // Render Catalogue Items
      catalogueGrid.innerHTML = '';

      // 0. Dedicated FvH COINS Currency Packages Tab (Prompt 4 Section 4)
      if (curCategory === 'coins') {
        var noticeBox = document.createElement('div');
        noticeBox.className = 'fvh-coin-notice-banner';
        noticeBox.style.gridColumn = '1 / -1';
        noticeBox.style.background = 'linear-gradient(135deg, rgba(255,200,0,0.1) 0%, rgba(20,15,35,0.95) 100%)';
        noticeBox.style.border = '1.5px solid rgba(255,200,0,0.3)';
        noticeBox.style.borderRadius = '12px';
        noticeBox.style.padding = '14px 18px';
        noticeBox.style.marginBottom = '12px';
        noticeBox.innerHTML =
          '<div style="display:flex;align-items:center;gap:12px;">' +
          '  <span style="font-size:32px;">🪙</span>' +
          '  <div>' +
          '    <div style="font-weight:900;font-size:14px;color:#fde047;letter-spacing:0.5px;">' + tr('catCoins') + ' · ' + tr('storeSub') + '</div>' +
          '    <div style="font-size:12px;color:var(--text-muted);margin-top:2px;line-height:1.4;">' + tr('coinPackageNotice') + '</div>' +
          '  </div>' +
          '</div>';
        catalogueGrid.appendChild(noticeBox);

        CURRENCY_PACKAGES.forEach(function (pkg) {
          var pCard = document.createElement('div');
          pCard.className = 'fvh-catalogue-card fvh-coin-package-card r-legendary';
          pCard.style.position = 'relative';
          pCard.style.background = 'linear-gradient(135deg, rgba(28, 22, 45, 0.95) 0%, rgba(14, 11, 26, 0.98) 100%)';
          pCard.style.border = '1.5px solid rgba(255, 200, 0, 0.45)';
          pCard.style.cursor = 'pointer';

          pCard.innerHTML =
            '<div class="fvh-card-head" style="justify-content:space-between;">' +
            '  <span class="rar legendary" style="font-size:10px;padding:3px 8px;">' + pkg.badge + '</span>' +
            '  <span style="font-size:11px;font-weight:900;color:#fde047;">🪙 +' + pkg.coinsAmount.toLocaleString() + '</span>' +
            '</div>' +
            '<div class="fvh-card-thumb-wrap" style="height:76px;display:flex;align-items:center;justify-content:center;">' +
            '  <div style="font-size:42px;">' + pkg.icon + '</div>' +
            '</div>' +
            '<div class="fvh-card-title" style="font-size:13px;font-weight:800;color:var(--text-pure);margin-bottom:4px;">' + tr(pkg.id === 'pkg_coins_starter' ? 'pkgStarter' : pkg.id === 'pkg_coins_pro' ? 'pkgPro' : pkg.id === 'pkg_coins_elite' ? 'pkgElite' : pkg.id === 'pkg_coins_champion' ? 'pkgChampion' : 'pkgLegend') + '</div>' +
            '<div class="fvh-card-desc" style="font-size:11px;color:var(--text-muted);margin-bottom:8px;line-height:1.3;">' + pkg.desc + '</div>' +
            '<div class="fvh-card-price" style="font-size:12px;font-weight:900;color:#facc15;">' +
            pkg.starsPrice + ' ⭐ Stars &nbsp;·&nbsp; ' + pkg.tonPrice + ' 💎 TON' +
            '</div>';

          pCard.onclick = function () {
            app.audio.play('click');
            openUniversalPaymentModal(app, {
              productId: pkg.id,
              title: pkg.name,
              starsPrice: pkg.starsPrice,
              tonPrice: pkg.tonPrice,
              onPurchased: function () {
                syncAuthoritativeEconomy(app, function () {
                  renderShop();
                });
              }
            });
          };

          catalogueGrid.appendChild(pCard);
        });
        return;
      }

      // 1. Dedicated BUNDLES Tab
      if (curCategory === 'bundles') {
        BUNDLE_ITEMS.forEach(function (b) {
          var ownInfo = checkBundleOwnership(b);
          var bCard = document.createElement('div');
          bCard.className = 'fvh-catalogue-card fvh-bundle-card r-legendary' + (ownInfo.isFullyOwned ? ' owned' : '');
          bCard.style.position = 'relative';
          bCard.style.background = 'linear-gradient(135deg, rgba(25, 20, 40, 0.95) 0%, rgba(12, 10, 24, 0.98) 100%)';
          bCard.style.border = ownInfo.isFullyOwned ? '1.5px solid rgba(255,255,255,0.1)' : '1.5px solid rgba(255, 200, 0, 0.45)';
          bCard.style.cursor = 'pointer';

          var previewIcons = b.items.slice(0, 4).map(function (it) {
            return '<span style="font-size:20px;" title="' + trItem(it.name) + '">' + it.icon + '</span>';
          }).join(' ');

          bCard.innerHTML =
            '<div class="fvh-card-head" style="justify-content:space-between;">' +
            '  <span class="rar legendary" style="font-size:10px;padding:3px 8px;">' + b.badge + '</span>' +
            '  <span style="font-size:10px;font-weight:900;color:#fde047;background:rgba(255,200,0,0.2);padding:2px 6px;border-radius:10px;">-' + b.discount + '%</span>' +
            '</div>' +
            '<div class="fvh-card-thumb-wrap" style="height:76px;display:flex;align-items:center;justify-content:center;gap:6px;">' +
            '  <div style="font-size:38px;">' + b.icon + '</div>' +
            '</div>' +
            '<div class="fvh-card-title" style="font-size:13px;font-weight:800;color:var(--text-pure);margin-bottom:4px;">' + trItem(b.name) + '</div>' +
            '<div style="display:flex;align-items:center;gap:6px;justify-content:center;margin-bottom:8px;opacity:0.85;">' + previewIcons + '</div>' +
            '<div class="fvh-card-price" style="font-size:12px;font-weight:900;color:#facc15;">' +
            (ownInfo.isFullyOwned ?
              '✓ ' + tr('bundleAlreadyOwned') :
              '🪙 ' + b.coinsPrice.toLocaleString() + ' · ' + b.starsPrice + ' ⭐'
            ) +
            '</div>';

          bCard.onclick = function () {
            app.audio.play('click');
            openBundleInspector(b);
          };

          catalogueGrid.appendChild(bCard);
        });
        return;
      }

      // 2. PACKS Tab
      if (curCategory === 'packs') {
        var packsData = app.store.data.packs || { free: {}, paid: {} };
        PACKS_DEF.forEach(function (pk) {
          var freeCount = (packsData.free && packsData.free[pk.id]) || 0;
          var paidCount = (packsData.paid && packsData.paid[pk.id]) || 0;
          var totalCount = freeCount + paidCount;
          var localizedPackName = trItem(pk.name);

          var pCard = document.createElement('div');
          pCard.className = 'fvh-catalogue-card r-epic';
          pCard.innerHTML =
            '<div class="fvh-card-head"><span class="rar epic">' + tr('catPacks').toUpperCase() + '</span></div>' +
            '<div class="fvh-card-thumb-wrap">' + renderItemArtwork(pk, 'thumb') + '</div>' +
            '<div class="fvh-card-title">' + localizedPackName + '</div>' +
            '<div class="fvh-card-desc">' + pk.desc + '</div>' +
            '<div class="fvh-card-action"></div>';

          var actBox = pCard.querySelector('.fvh-card-action');
          if (totalCount > 0) {
            var openBtn = document.createElement('button');
            openBtn.className = 'btn primary small block';
            openBtn.textContent = tr('openPack') + ' (' + totalCount + ')';
            openBtn.onclick = function () {
              app.store.update(function (d) {
                if (d.packs.free && d.packs.free[pk.id] > 0) d.packs.free[pk.id]--;
                else if (d.packs.paid && d.packs.paid[pk.id] > 0) d.packs.paid[pk.id]--;
              });
              openPackAnimation(pk);
            };
            actBox.appendChild(openBtn);
          } else {
            var buyPackBtn = document.createElement('button');
            buyPackBtn.className = 'btn small block';
            buyPackBtn.textContent = '🪙 ' + pk.price;
            buyPackBtn.onclick = function () {
              if (isPurchasing) return;
              var coins = app.store.data.coins || 0;
              if (coins < pk.price) {
                app.audio.play('error');
                showToast(tr('notEnoughCoins'));
                return;
              }
              isPurchasing = true;
              var pid = getAppPlayerId(app);
              safeEconomyApi('/api/economy/purchase', {
                playerId: pid,
                itemId: pk.id,
                idempotencyKey: 'pack_' + pid + '_' + pk.id + '_' + Date.now()
              }).then(function (res) {
                isPurchasing = false;
                if (res && res.ok) {
                  app.store.update(function (d) {
                    d.coins = res.coins;
                    d.xp = res.xp;
                    d.owned = res.owned;
                    d.packs = res.packs;
                  });
                } else {
                  app.store.update(function (d) {
                    d.coins -= pk.price;
                    if (!d.packs) d.packs = { free: {}, paid: {} };
                    if (!d.packs.paid) d.packs.paid = {};
                    d.packs.paid[pk.id] = (d.packs.paid[pk.id] || 0) + 1;
                  });
                }
                app.audio.play('claim');
                showToast(tr('purchaseSuccess') + ': ' + localizedPackName);
                renderShop();
              });
            };
            actBox.appendChild(buyPackBtn);
          }

          catalogueGrid.appendChild(pCard);
        });
        return;
      }

      // Fetch standard items from data/shop and ensure scenic arenas are included
      function renderItemsList(allItems) {
        var scenicArenas = [
          { id: 'std_ocean_sunset', category: 'stadiums', slot: 'stadium.footy', mode: 'footy', name: 'Coastal Sunset Court', rarity: 'epic', price: 580, icon: '🌅', desc: tr('scenicCoastalDesc') },
          { id: 'std_forest_redwood', category: 'stadiums', slot: 'stadium.hoops', mode: 'hoops', name: 'Redwood Forest Arena', rarity: 'epic', price: 560, icon: '🌲', desc: tr('scenicForestDesc') },
          { id: 'std_space_orbit', category: 'stadiums', slot: 'stadium.footy', mode: 'footy', name: 'Orbital Space Colosseum', rarity: 'legendary', price: 900, icon: '🚀', desc: tr('scenicSpaceDesc') },
          { id: 'std_mars_dome', category: 'stadiums', slot: 'stadium.hoops', mode: 'hoops', name: 'Mars Bio-Dome Arena', rarity: 'epic', price: 750, icon: '🔴', desc: tr('scenicMarsDesc') },
          { id: 'std_moon_crater', category: 'stadiums', slot: 'stadium.footy', mode: 'footy', name: 'Apollo Lunar Arena', rarity: 'rare', price: 680, icon: '🌕', desc: tr('scenicMoonDesc') },
          { id: 'std_underwater_dome', category: 'stadiums', slot: 'stadium.hoops', mode: 'hoops', name: 'Abyssal Ocean Dome', rarity: 'legendary', price: 820, icon: '🫧', desc: tr('scenicUnderwaterDesc') },
          { id: 'std_cyber_megacity', category: 'stadiums', slot: 'stadium.footy', mode: 'footy', name: 'Neo Tokyo Megacity', rarity: 'legendary', price: 950, icon: '🏙️', desc: tr('scenicCyberDesc') },
          { id: 'std_volcano_caldera', category: 'stadiums', slot: 'stadium.hoops', mode: 'hoops', name: 'Magma Caldera Arena', rarity: 'epic', price: 850, icon: '🌋', desc: tr('scenicVolcanoDesc') },
          { id: 'std_floating_islands', category: 'stadiums', slot: 'stadium.footy', mode: 'footy', name: 'Aetheria Sky Islands', rarity: 'legendary', price: 880, icon: '☁️', desc: tr('scenicFloatingDesc') },
          { id: 'std_crystal_cavern', category: 'stadiums', slot: 'stadium.hoops', mode: 'hoops', name: 'Prismatic Crystal Cave', rarity: 'epic', price: 790, icon: '💎', desc: tr('scenicCrystalDesc') }
        ];
        scenicArenas.forEach(function (sa) {
          if (!allItems.some(function (i) { return i.id === sa.id; })) {
            allItems.push(sa);
          }
        });

        // If category is "all", also show the bundles at the top of the store
        if (curCategory === 'all') {
          BUNDLE_ITEMS.forEach(function (b) {
            var ownInfo = checkBundleOwnership(b);
            var bCard = document.createElement('div');
            bCard.className = 'fvh-catalogue-card fvh-bundle-card r-legendary' + (ownInfo.isFullyOwned ? ' owned' : '');
            bCard.style.border = ownInfo.isFullyOwned ? '1.5px solid rgba(255,255,255,0.1)' : '1.5px solid rgba(255, 200, 0, 0.45)';
            bCard.style.background = 'linear-gradient(135deg, rgba(25, 20, 40, 0.95) 0%, rgba(12, 10, 24, 0.98) 100%)';
            bCard.style.cursor = 'pointer';

            bCard.innerHTML =
              '<div class="fvh-card-head" style="justify-content:space-between;">' +
              '  <span class="rar legendary" style="font-size:10px;padding:3px 8px;">' + b.badge + '</span>' +
              '  <span style="font-size:10px;font-weight:900;color:#fde047;background:rgba(255,200,0,0.2);padding:2px 6px;border-radius:10px;">-' + b.discount + '%</span>' +
              '</div>' +
              '<div class="fvh-card-thumb-wrap" style="height:76px;display:flex;align-items:center;justify-content:center;gap:6px;">' +
              '  <div style="font-size:38px;">' + b.icon + '</div>' +
              '</div>' +
              '<div class="fvh-card-title" style="font-size:13px;font-weight:800;color:var(--text-pure);margin-bottom:4px;">' + trItem(b.name) + '</div>' +
              '<div class="fvh-card-price" style="font-size:12px;font-weight:900;color:#facc15;">' +
              (ownInfo.isFullyOwned ?
                '✓ ' + tr('bundleAlreadyOwned') :
                '🪙 ' + b.coinsPrice + ' · ' + b.starsPrice + ' ⭐'
              ) +
              '</div>';

            bCard.onclick = function () {
              app.audio.play('click');
              openBundleInspector(b);
            };
            catalogueGrid.appendChild(bCard);
          });
        }

        var filtered = allItems.filter(function (it) {
          if (curCategory === 'all') return true;
          return it.category === curCategory;
        });

        if (filtered.length === 0 && curCategory !== 'all') {
          catalogueGrid.innerHTML = '<div style="color:var(--text-muted);font-size:13px;grid-column:1/-1;padding:24px 0;text-align:center;">' + tr('inCollection') + ': 0</div>';
          return;
        }

        filtered.forEach(function (it) {
          var isOwned = owned.indexOf(it.id) !== -1 || it.isDefault;
          var card = document.createElement('div');
          var rarKey = it.rarity || 'common';
          var localizedRarity = tr('rarity_' + rarKey) || rarKey.toUpperCase();
          var localizedItemName = trItem(it.name);

          card.className = 'fvh-catalogue-card r-' + rarKey + (isOwned ? ' owned' : '');

          card.innerHTML =
            '<div class="fvh-card-head">' +
            '<span class="rar ' + rarKey + '">' + localizedRarity + '</span>' +
            (isOwned ? '<span class="fvh-card-owned-tag">✓ ' + tr('inCollection') + '</span>' : '') +
            '</div>' +
            '<div class="fvh-card-thumb-wrap">' +
            renderItemArtwork(it, 'thumb') +
            '</div>' +
            '<div class="fvh-card-title">' + localizedItemName + '</div>' +
            '<div class="fvh-card-price">' + (isOwned ? tr('inCollection') : '🪙 ' + it.price) + '</div>';

          card.onclick = function () {
            app.audio.play('click');
            openItemInspector(it);
          };

          catalogueGrid.appendChild(card);
        });
      }

      if (typeof window.require === 'function') {
        try {
          window.require(['data/shop'], function (shopMod) {
            renderItemsList((shopMod && shopMod.ITEMS) || []);
          });
        } catch (e) {
          console.warn('Failed to load shop items', e);
        }
      }
    }

    renderShop();

    if (inspectId && typeof window.require === 'function') {
      window.require(['data/shop'], function (shopMod) {
        var it = ((shopMod && shopMod.ITEMS) || []).find(function (x) { return x.id === inspectId; });
        if (it) {
          setTimeout(function () { openItemInspector(it); }, 350);
        }
      });
    }

    // Persistent Unified Bottom Navigation
    container.appendChild(createSharedBottomNav('shop', app));

    return container;
  }



  // Build Profile Screen
  function buildProfilePage(app) {
    var container = document.createElement('div');
    container.className = 'screen solid page-screen has-nav';
    container.dataset.id = 'profile';

    var page = document.createElement('div');
    page.className = 'page';

    // Head
    var head = document.createElement('div');
    head.className = 'page-head';
    var backBtn = document.createElement('button');
    backBtn.className = 'btn icon back';
    backBtn.textContent = '←';
    backBtn.onclick = function () {
      app.audio.play('click');
      app.showMenu();
    };
    var title = document.createElement('h1');
    title.textContent = tr('profile');
    head.appendChild(backBtn);
    head.appendChild(title);
    page.appendChild(head);

    // Body
    var body = document.createElement('div');
    body.className = 'page-body fvh-profile-container';

    var curChar = app.store.data.selectedCharacter || 'footy';
    var stats = app.store.data.stats || {
      matches: 0, wins: 0, losses: 0, goals: 0, baskets: 0,
      winsFooty: 0, winsHoops: 0, winsClash: 0
    };

    var totalMatches = stats.matches || 0;
    var totalWins = stats.wins || 0;
    var totalLosses = Math.max(0, totalMatches - totalWins);
    var winPct = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;

    var wF = stats.winsFooty || Math.floor(totalWins * 0.5);
    var wH = stats.winsHoops || Math.floor(totalWins * 0.35);
    var wC = stats.winsClash || Math.max(0, totalWins - wF - wH);
    var sumW = Math.max(1, wF + wH + wC);
    var pctF = Math.round((wF / sumW) * 100);
    var pctH = Math.round((wH / sumW) * 100);
    var pctC = Math.max(0, 100 - pctF - pctH);

    var bpState = getBattlePassState(app.store);

    // 1. Identity Hero Banner
    var idCard = document.createElement('div');
    idCard.className = 'fvh-profile-id-card';
    idCard.innerHTML =
      '<div class="fvh-profile-avatar-wrap">' +
      '<div class="fvh-profile-avatar-thumb">' + (curChar === 'footy' ? getFootyAvatarSvg() : getHoopsAvatarSvg()) + '</div>' +
      '<div class="fvh-profile-lvl-badge">LVL ' + bpState.level + '</div>' +
      '</div>' +
      '<div class="fvh-profile-id-info">' +
      '<div class="fvh-profile-title-tag">ALL-STAR ATHLETE</div>' +
      '<h2 style="margin:2px 0 4px;font-size:22px;">' + (curChar === 'footy' ? 'STRIKER #10' : 'FORWARD #23') + '</h2>' +
      '<div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">' + tr('bpXpNeeded', { cur: bpState.intoLevel, need: bpState.needed, next: Math.min(30, bpState.level + 1) }) + '</div>' +
      '<div class="pbar" style="height:8px;margin:0;"><i style="width:' + bpState.percent + '%;"></i></div>' +
      '</div>';
    body.appendChild(idCard);

    // 2. Career Records & Tri-Color Win Rate
    var statsCard = document.createElement('div');
    statsCard.className = 'fvh-card-panel';
    statsCard.innerHTML =
      '<div class="fvh-panel-head">📊 ' + tr('statRecords') + '</div>' +
      '<div class="fvh-stats-kpi-grid">' +
      '<div class="fvh-kpi-item"><small>' + tr('matches') + '</small><b>' + totalMatches + '</b></div>' +
      '<div class="fvh-kpi-item win"><small>' + tr('victories') + '</small><b>' + totalWins + '</b></div>' +
      '<div class="fvh-kpi-item loss"><small>' + tr('defeats') + '</small><b>' + totalLosses + '</b></div>' +
      '<div class="fvh-kpi-item rate"><small>' + tr('winRate') + '</small><b>' + winPct + '%</b></div>' +
      '</div>' +
      '<div style="margin-top:14px;">' +
      '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-bottom:6px;">' +
      '<span>⚽ ' + tr('football') + ' (' + wF + ')</span>' +
      '<span>🏀 ' + tr('basketball') + ' (' + wH + ')</span>' +
      '<span>⚡ Clash (' + wC + ')</span>' +
      '</div>' +
      '<div class="fvh-tri-bar">' +
      '<div class="fvh-tri-footy" style="width:' + pctF + '%;" title="' + tr('football') + ': ' + pctF + '%"></div>' +
      '<div class="fvh-tri-hoops" style="width:' + pctH + '%;" title="' + tr('basketball') + ': ' + pctH + '%"></div>' +
      '<div class="fvh-tri-clash" style="width:' + pctC + '%;" title="Clash: ' + pctC + '%"></div>' +
      '</div>' +
      '</div>';
    body.appendChild(statsCard);

    // 3. Sport Metrics
    var metricsCard = document.createElement('div');
    metricsCard.className = 'fvh-card-panel';
    metricsCard.innerHTML =
      '<div class="fvh-panel-head">⚡ ' + tr('sportMetrics') + '</div>' +
      '<div class="fvh-metrics-grid">' +
      '<div class="fvh-metric-tile"><span>⚽ ' + tr('goalsScored') + '</span><b>' + (stats.goals || 0) + '</b></div>' +
      '<div class="fvh-metric-tile"><span>🏀 ' + tr('hoopsScored') + '</span><b>' + (stats.baskets || 0) + '</b></div>' +
      '<div class="fvh-metric-tile"><span>🪙 ' + tr('coinsEarned') + '</span><b>' + (app.store.data.coins || 0) + '</b></div>' +
      '<div class="fvh-metric-tile"><span>👑 ' + tr('bpUnlocks') + '</span><b>' + (bpState.claimed.length) + ' / 30</b></div>' +
      '</div>';
    body.appendChild(metricsCard);

    // 4. Mystery Packs Unopened Inventory
    var packsCard = document.createElement('div');
    packsCard.className = 'fvh-card-panel';
    var packsData = app.store.data.packs || { free: {}, paid: {} };
    var totalPacksCount = 0;
    if (packsData.free) Object.keys(packsData.free).forEach(function (k) { totalPacksCount += packsData.free[k] || 0; });
    if (packsData.paid) Object.keys(packsData.paid).forEach(function (k) { totalPacksCount += packsData.paid[k] || 0; });

    packsCard.innerHTML =
      '<div class="fvh-panel-head" style="display:flex;justify-content:space-between;align-items:center;">' +
      '<span>🎁 ' + tr('packsInventory') + '</span>' +
      '<span class="badge">' + tr('packsAvailable', { n: totalPacksCount }) + '</span>' +
      '</div>' +
      '<p style="color:var(--text-muted);font-size:12px;margin:4px 0 12px;">' + tr('storeSub') + '</p>' +
      (totalPacksCount > 0 ?
        '<button class="btn primary small block goto-shop-packs">' + tr('goToPacks') + '</button>' :
        '<button class="btn small block goto-shop-packs">' + tr('visitShopForPacks') + '</button>');

    packsCard.querySelector('.goto-shop-packs').onclick = function () {
      app.go('shop');
    };
    body.appendChild(packsCard);

    page.appendChild(body);
    container.appendChild(page);

    // Unified Persistent Bottom Navigation
    container.appendChild(createSharedBottomNav('profile', app));

    return container;
  }

  // Build Settings Screen
  function buildSettingsPage(app) {
    var container = document.createElement('div');
    container.className = 'screen solid page-screen has-nav';
    container.dataset.id = 'settings';

    var page = document.createElement('div');
    page.className = 'page';

    // Head
    var head = document.createElement('div');
    head.className = 'page-head';
    var backBtn = document.createElement('button');
    backBtn.className = 'btn icon back';
    backBtn.textContent = '←';
    backBtn.onclick = function () {
      app.audio.play('click');
      app.showMenu();
    };
    var title = document.createElement('h1');
    title.textContent = tr('settings');
    head.appendChild(backBtn);
    head.appendChild(title);
    page.appendChild(head);

    // Body
    var body = document.createElement('div');
    body.className = 'page-body fvh-settings-container';

    var st = app.store.data.settings || { lang: 'ru', sfx: true, music: true, masterVolume: 1 };

    // 1. Audio Controls Panel
    var audioPanel = document.createElement('div');
    audioPanel.className = 'fvh-card-panel';
    audioPanel.innerHTML =
      '<div class="fvh-panel-head">🔊 ' + tr('audioAtmosphere') + '</div>' +
      '<div class="fvh-setting-row">' +
      '<div><b>' + tr('sfxTitle') + '</b><div style="font-size:11px;color:var(--text-muted);">' + tr('sfxDesc') + '</div></div>' +
      '<input type="checkbox" id="fvh-chk-sfx" ' + (st.sfx !== false ? 'checked' : '') + ' class="fvh-toggle">' +
      '</div>' +
      '<div class="fvh-setting-row">' +
      '<div><b>' + tr('musicTitle') + '</b><div style="font-size:11px;color:var(--text-muted);">' + tr('musicDesc') + '</div></div>' +
      '<input type="checkbox" id="fvh-chk-music" ' + (st.music !== false ? 'checked' : '') + ' class="fvh-toggle">' +
      '</div>';
    body.appendChild(audioPanel);

    audioPanel.querySelector('#fvh-chk-sfx').onchange = function (e) {
      var enabled = e.target.checked;
      app.store.update(function (d) { d.settings.sfx = enabled; });
      app.audio.setSfxEnabled(enabled);
      if (enabled) app.audio.play('click');
    };
    audioPanel.querySelector('#fvh-chk-music').onchange = function (e) {
      var enabled = e.target.checked;
      app.store.update(function (d) { d.settings.music = enabled; });
      app.audio.setMusicEnabled(enabled);
    };

    // 2. Multilingual Language Selector (All 15 Languages)
    var langPanel = document.createElement('div');
    langPanel.className = 'fvh-card-panel';
    var curLang = st.lang || 'ru';
    langPanel.innerHTML =
      '<div class="fvh-panel-head">🌐 ' + tr('interfaceLang') + '</div>' +
      '<p style="font-size:12px;color:var(--text-muted);margin:4px 0 10px;">' + tr('langDesc') + '</p>' +
      '<div class="fvh-lang-quick-pills" style="display:flex;gap:10px;margin-bottom:12px;">' +
      '  <button class="btn block fvh-btn-lang-ru" style="flex:1;font-weight:800;padding:10px 12px;font-size:13px;' + (curLang === 'ru' ? 'background:rgba(0,240,255,0.18);border:1.5px solid var(--neon-cyan);color:#fff;' : 'background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);color:var(--text-muted);') + '">🇷🇺 Русский' + (curLang === 'ru' ? ' ✓' : '') + '</button>' +
      '  <button class="btn block fvh-btn-lang-en" style="flex:1;font-weight:800;padding:10px 12px;font-size:13px;' + (curLang === 'en' ? 'background:rgba(0,240,255,0.18);border:1.5px solid var(--neon-cyan);color:#fff;' : 'background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);color:var(--text-muted);') + '">🇬🇧 English' + (curLang === 'en' ? ' ✓' : '') + '</button>' +
      '</div>' +
      '<select class="fvh-select" id="fvh-select-lang" style="color:#ffffff !important;background:#0d1424 !important;border:1.5px solid rgba(255,255,255,0.2);padding:10px 14px;border-radius:12px;font-size:13px;font-weight:700;width:100%;box-sizing:border-box;cursor:pointer;">' +
      '<option value="ru" style="background:#0d1424;color:#fff;">🇷🇺 Русский (Russian)</option>' +
      '<option value="en" style="background:#0d1424;color:#fff;">🇬🇧 English (English)</option>' +
      '<option value="es" style="background:#0d1424;color:#fff;">🇪🇸 Español (Spanish)</option>' +
      '<option value="fr" style="background:#0d1424;color:#fff;">🇫🇷 Français (French)</option>' +
      '<option value="de" style="background:#0d1424;color:#fff;">🇩🇪 Deutsch (German)</option>' +
      '<option value="it" style="background:#0d1424;color:#fff;">🇮🇹 Italiano (Italian)</option>' +
      '<option value="pt" style="background:#0d1424;color:#fff;">🇵🇹 Português (Portuguese)</option>' +
      '<option value="tr" style="background:#0d1424;color:#fff;">🇹🇷 Türkçe (Turkish)</option>' +
      '<option value="nl" style="background:#0d1424;color:#fff;">🇳🇱 Nederlands (Dutch)</option>' +
      '<option value="pl" style="background:#0d1424;color:#fff;">🇵🇱 Polski (Polish)</option>' +
      '<option value="uk" style="background:#0d1424;color:#fff;">🇺🇦 Українська (Ukrainian)</option>' +
      '<option value="ja" style="background:#0d1424;color:#fff;">🇯🇵 日本語 (Japanese)</option>' +
      '<option value="ko" style="background:#0d1424;color:#fff;">🇰🇷 한국어 (Korean)</option>' +
      '<option value="zh" style="background:#0d1424;color:#fff;">🇨🇳 中文 (Chinese)</option>' +
      '<option value="ar" style="background:#0d1424;color:#fff;">🇸🇦 العربية (Arabic)</option>' +
      '</select>';
    body.appendChild(langPanel);

    function applyNewLanguage(newLang) {
      app.store.update(function (d) { d.settings.lang = newLang; });
      if (typeof window.require === 'function') {
        try {
          window.require(['i18n/index'], function (i18nMod) {
            if (i18nMod && i18nMod.setLanguage) i18nMod.setLanguage(newLang);
          });
        } catch (e) {
          console.warn('Failed to switch language', e);
        }
      }
      app.audio.play('click');
      showToast('Language: ' + newLang.toUpperCase());
      app.go('settings');
    }

    var btnRu = langPanel.querySelector('.fvh-btn-lang-ru');
    if (btnRu) btnRu.onclick = function () { applyNewLanguage('ru'); };
    var btnEn = langPanel.querySelector('.fvh-btn-lang-en');
    if (btnEn) btnEn.onclick = function () { applyNewLanguage('en'); };

    var langSelect = langPanel.querySelector('#fvh-select-lang');
    langSelect.value = curLang;
    langSelect.onchange = function () {
      applyNewLanguage(langSelect.value);
    };

    // 3. Controls Reference Panel
    var ctrlPanel = document.createElement('div');
    ctrlPanel.className = 'fvh-card-panel';
    ctrlPanel.innerHTML =
      '<div class="fvh-panel-head">🎮 ' + tr('controlsRef') + '</div>' +
      '<div class="fvh-ctrl-grid">' +
      '<div class="fvh-ctrl-row"><span>' + tr('moveAthlete') + '</span><b>' + tr('moveAthleteKeys') + '</b></div>' +
      '<div class="fvh-ctrl-row"><span>' + tr('kickShoot') + '</span><b>' + tr('kickShootKeys') + '</b></div>' +
      '<div class="fvh-ctrl-row"><span>' + tr('sprintBoost') + '</span><b>' + tr('sprintBoostKeys') + '</b></div>' +
      '<div class="fvh-ctrl-row"><span>' + tr('pauseMatch') + '</span><b>' + tr('pauseMatchKeys') + '</b></div>' +
      '</div>';
    body.appendChild(ctrlPanel);

    // 4. Data Management & Danger Zone
    var dataPanel = document.createElement('div');
    dataPanel.className = 'fvh-card-panel danger';
    dataPanel.innerHTML =
      '<div class="fvh-panel-head" style="color:var(--danger);">⚠️ ' + tr('dangerZone') + '</div>' +
      '<p style="font-size:12px;color:var(--text-muted);margin:4px 0 12px;">' + tr('dangerDesc') + '</p>' +
      '<button class="btn small danger reset-btn">' + tr('resetBtn') + '</button>';
    body.appendChild(dataPanel);

    dataPanel.querySelector('.reset-btn').onclick = function () {
      if (window.confirm(tr('confirmReset'))) {
        localStorage.removeItem('fvh.save.v1');
        app.store.reset();
        app.audio.play('error');
        showToast('Save wiped. Reloading...');
        setTimeout(function () {
          window.location.reload();
        }, 800);
      }
    };

    page.appendChild(body);
    container.appendChild(page);

    // Unified Persistent Bottom Navigation
    container.appendChild(createSharedBottomNav('settings', app));

    return container;
  }



  // All 10 Scenic Arenas Definitions
  var SCENIC_ARENAS_CATALOG = [
    { id: 'std_ocean_sunset', category: 'stadiums', slot: 'stadium.footy', mode: 'footy', name: 'Coastal Sunset Court', rarity: 'epic', price: 580, icon: '🌅', desc: tr('scenicCoastalDesc') },
    { id: 'std_forest_redwood', category: 'stadiums', slot: 'stadium.hoops', mode: 'hoops', name: 'Redwood Forest Arena', rarity: 'epic', price: 560, icon: '🌲', desc: tr('scenicForestDesc') },
    { id: 'std_space_orbit', category: 'stadiums', slot: 'stadium.footy', mode: 'footy', name: 'Orbital Space Colosseum', rarity: 'legendary', price: 900, icon: '🚀', desc: tr('scenicSpaceDesc') },
    { id: 'std_mars_dome', category: 'stadiums', slot: 'stadium.hoops', mode: 'hoops', name: 'Mars Bio-Dome Arena', rarity: 'epic', price: 750, icon: '🔴', desc: tr('scenicMarsDesc') },
    { id: 'std_moon_crater', category: 'stadiums', slot: 'stadium.footy', mode: 'footy', name: 'Apollo Lunar Arena', rarity: 'rare', price: 680, icon: '🌕', desc: tr('scenicMoonDesc') },
    { id: 'std_underwater_dome', category: 'stadiums', slot: 'stadium.hoops', mode: 'hoops', name: 'Abyssal Ocean Dome', rarity: 'legendary', price: 820, icon: '🫧', desc: tr('scenicUnderwaterDesc') },
    { id: 'std_cyber_megacity', category: 'stadiums', slot: 'stadium.footy', mode: 'footy', name: 'Neo Tokyo Megacity', rarity: 'legendary', price: 950, icon: '🏙️', desc: tr('scenicCyberDesc') },
    { id: 'std_volcano_caldera', category: 'stadiums', slot: 'stadium.hoops', mode: 'hoops', name: 'Magma Caldera Arena', rarity: 'epic', price: 850, icon: '🌋', desc: tr('scenicVolcanoDesc') },
    { id: 'std_floating_islands', category: 'stadiums', slot: 'stadium.footy', mode: 'footy', name: 'Aetheria Sky Islands', rarity: 'legendary', price: 880, icon: '☁️', desc: tr('scenicFloatingDesc') },
    { id: 'std_crystal_cavern', category: 'stadiums', slot: 'stadium.hoops', mode: 'hoops', name: 'Prismatic Crystal Cave', rarity: 'epic', price: 790, icon: '💎', desc: tr('scenicCrystalDesc') }
  ];

  // High-Reliability Server Relay Link for Authoritative Multiplayer
  function RelayLink(matchId, role) {
    this.matchId = matchId;
    this.role = role;
    this.h = {};
    this.open = true;
    this.closed = false;
    this.rtt = 45;
    var self = this;

    this.pollInterval = setInterval(function () {
      if (self.closed) return;
      fetch(getApiUrl('/api/match/relay?matchId=' + encodeURIComponent(matchId) + '&role=' + encodeURIComponent(role)))
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res && res.ok && Array.isArray(res.messages)) {
            res.messages.forEach(function (msg) {
              var m = msg.data || msg;
              if (self.h.onMessage) self.h.onMessage(m, 'fast');
            });
          }
        }).catch(function () {});
    }, 50); // 20Hz polling
  }

  RelayLink.prototype.sendCtl = function (m) {
    if (this.closed) return;
    fetch(getApiUrl('/api/match/relay'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId: this.matchId, role: this.role, packet: m })
    }).catch(function () {});
  };

  RelayLink.prototype.sendFast = function (m) {
    this.sendCtl(m);
  };

  RelayLink.prototype.close = function () {
    this.closed = true;
    this.open = false;
    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.h.onClose) this.h.onClose('local');
  };

  // Helper to establish WebRTC or Resilient Server Relay Session between two players
  function startWebRTCSession(app, role, roomCode, myName, oppName, mode, onConnect, onError) {
    if (typeof window.require !== 'function') {
      onError('Module loader unavailable');
      return;
    }
    window.require(['net/link', 'net/session'], function (linkMod, sessionMod) {
      try {
        var seed = (Math.random() * 1e9) | 0;
        var minutes = 2;
        var isStarted = false;
        var relayFallbackTimer = null;

        function startWithRelay() {
          if (isStarted) return;
          isStarted = true;
          if (relayFallbackTimer) clearTimeout(relayFallbackTimer);
          var rLink = new RelayLink(roomCode, role);
          var info = { role: role, mode: mode, minutes: minutes, seed: seed, myName: myName, oppName: oppName, matchId: roomCode };
          var session = new sessionMod.OnlineSession(rLink, info);
          onConnect(session);
        }

        // Try WebRTC PeerLink first
        var link = null;
        try {
          link = new linkMod.PeerLink();
        } catch (e) {
          console.log('Direct WebRTC PeerLink not supported, using Server Relay Link', e);
          startWithRelay();
          return;
        }

        // If WebRTC negotiation doesn't complete within 3.5 seconds, use RelayLink smoothly
        relayFallbackTimer = setTimeout(function () {
          if (!isStarted) {
            console.log('WebRTC negotiation timeout, falling back to Server Relay Link');
            if (link) {
              try { link.close(); } catch (e) {}
            }
            startWithRelay();
          }
        }, 3500);

        link.h.onClose = function () {
          if (!isStarted) startWithRelay();
        };

        if (role === 'host') {
          link.createOffer({ mode: mode, minutes: minutes, name: myName }).then(function (offerStr) {
            return fetch(getApiUrl('/api/room/signal'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: roomCode, from: myName, role: 'host', signal: { type: 'offer', data: offerStr } })
            });
          }).then(function () {
            var pollAnswerInterval = setInterval(function () {
              if (isStarted || link.closed) {
                clearInterval(pollAnswerInterval);
                return;
              }
              fetch(getApiUrl('/api/room/signals?code=' + encodeURIComponent(roomCode) + '&role=host'))
                .then(function (r) { return r.json(); })
                .then(function (data) {
                  if (data.ok && data.signals) {
                    var ans = data.signals.find(function (s) { return s.type === 'answer'; });
                    if (ans) {
                      clearInterval(pollAnswerInterval);
                      link.acceptAnswer(ans.data).then(function (res) {
                        link.h.onOpen = function () {
                          if (isStarted) return;
                          isStarted = true;
                          if (relayFallbackTimer) clearTimeout(relayFallbackTimer);
                          link.h.onMessage = function (m) {
                            if (m.k === 'ready') {
                              var info = { role: 'host', mode: mode, minutes: minutes, seed: seed, myName: myName, oppName: oppName, matchId: roomCode };
                              onConnect(new sessionMod.OnlineSession(link, info));
                            }
                          };
                          link.sendCtl({ k: 'start', mode: mode, minutes: minutes, seed: seed, host: myName, guest: oppName });
                        };
                        if (link.open && link.h.onOpen) link.h.onOpen();
                      }).catch(function (e) {
                        startWithRelay();
                      });
                    }
                  }
                }).catch(function () {});
            }, 800);
          }).catch(function (e) {
            startWithRelay();
          });
        } else {
          // Guest role
          var pollOfferInterval = setInterval(function () {
            if (isStarted || link.closed) {
              clearInterval(pollOfferInterval);
              return;
            }
            fetch(getApiUrl('/api/room/signals?code=' + encodeURIComponent(roomCode) + '&role=guest'))
              .then(function (r) { return r.json(); })
              .then(function (data) {
                if (data.ok && data.signals) {
                  var off = data.signals.find(function (s) { return s.type === 'offer'; });
                  if (off) {
                    clearInterval(pollOfferInterval);
                    link.acceptOffer(off.data, myName).then(function (r) {
                      if (!r) { startWithRelay(); return; }
                      fetch(getApiUrl('/api/room/signal'), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code: roomCode, from: myName, role: 'guest', signal: { type: 'answer', data: r.reply } })
                      }).then(function () {
                        link.h.onOpen = function () {
                          if (isStarted) return;
                          isStarted = true;
                          if (relayFallbackTimer) clearTimeout(relayFallbackTimer);
                          link.h.onMessage = function (m) {
                            if (m.k === 'start') {
                              link.sendCtl({ k: 'ready' });
                              var info = { role: 'guest', mode: m.mode || mode, minutes: m.minutes || 2, seed: m.seed, myName: myName, oppName: oppName, matchId: roomCode };
                              onConnect(new sessionMod.OnlineSession(link, info));
                            }
                          };
                        };
                        if (link.open && link.h.onOpen) link.h.onOpen();
                      }).catch(function (e) {
                        startWithRelay();
                      });
                    }).catch(function (e) {
                      startWithRelay();
                    });
                  }
                }
              }).catch(function () {});
          }, 800);
        }
      } catch (e) {
        startWithRelay();
      }
    });
  }

  // Quick Match Search Modal (Real Matchmaking Server Integration - No Fake Opponents)
  function showQuickMatchSearchModal(app, curChar) {
    var overlay = document.createElement('div');
    overlay.className = 'modal-back';

    var modal = document.createElement('div');
    modal.className = 'modal fvh-matchmaking-modal';

    var isCancelled = false;
    var timerId = null;
    var pollId = null;

    var tabId = '';
    try {
      tabId = sessionStorage.getItem('fvh_tab_id');
      if (!tabId) {
        tabId = Math.random().toString(36).slice(2, 6);
        sessionStorage.setItem('fvh_tab_id', tabId);
      }
    } catch (e) {}
    var basePid = app.store.data.playerId || ('PLAYER_' + Math.floor(1000 + Math.random() * 9000));
    var playerId = basePid + (tabId ? '_' + tabId : '');
    var playerName = (app.store.data.profile && app.store.data.profile.nickname) || ('Athlete #' + basePid.slice(-4));
    var lang = getActiveLang();

    function renderModalUI() {
      modal.innerHTML =
        '<div class="fvh-mm-header">' +
        '<span class="fvh-mm-badge">⚡ ' + tr('quickMatchBadge') + '</span>' +
        '<h3>' + tr('quickMatchTitle') + '</h3>' +
        '</div>' +
        '<div class="fvh-mm-radar-box">' +
        '<div class="fvh-mm-radar-ring r1"></div>' +
        '<div class="fvh-mm-radar-ring r2"></div>' +
        '<div class="fvh-mm-radar-ring r3"></div>' +
        '<div class="fvh-mm-radar-center">' + (curChar === 'footy' ? '⚽' : '🏀') + '</div>' +
        '</div>' +
        '<div class="fvh-mm-status" id="fvh-mm-status-text">' + tr('searchingOpponent') + '</div>' +
        '<div class="fvh-mm-timer" id="fvh-mm-timer">00:01</div>' +
        '<div class="actions" id="fvh-mm-actions" style="margin-top:18px;">' +
        '<button class="btn block fvh-btn-cancel-mm">' + tr('cancelSearch') + '</button>' +
        '</div>';

      modal.querySelector('.fvh-btn-cancel-mm').onclick = function () {
        cleanup();
        overlay.remove();
      };
    }

    renderModalUI();

    var seconds = 1;
    var timerEl = modal.querySelector('#fvh-mm-timer');
    var statusEl = modal.querySelector('#fvh-mm-status-text');
    var actionsEl = modal.querySelector('#fvh-mm-actions');

    function cleanup() {
      isCancelled = true;
      if (timerId) clearInterval(timerId);
      if (pollId) clearInterval(pollId);
      fetch(getApiUrl('/api/matchmaking/cancel'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: playerId })
      }).catch(function () {});
    }

    function showMatchmakingError(msg) {
      if (timerId) clearInterval(timerId);
      if (pollId) clearInterval(pollId);
      var radarBox = modal.querySelector('.fvh-mm-radar-box');
      if (radarBox) radarBox.classList.add('error');
      if (timerEl) {
        timerEl.textContent = '--:--';
        timerEl.style.color = '#f87171';
      }
      if (statusEl) {
        statusEl.textContent = msg || tr('serverUnavailable');
        statusEl.style.color = '#f59e0b';
      }
      if (actionsEl) {
        actionsEl.innerHTML =
          '<button class="btn primary block fvh-btn-retry-mm" style="margin-bottom:8px;">🔍 ' + tr('tryAgainBtn') + '</button>' +
          '<button class="btn block fvh-btn-back-lobby">' + tr('backToLobbyBtn') + '</button>';
        actionsEl.querySelector('.fvh-btn-retry-mm').onclick = function () { startSearch(); };
        actionsEl.querySelector('.fvh-btn-back-lobby').onclick = function () { cleanup(); overlay.remove(); };
      }
    }

    function startSearch() {
      isCancelled = false;
      seconds = 1;
      renderModalUI();
      timerEl = modal.querySelector('#fvh-mm-timer');
      statusEl = modal.querySelector('#fvh-mm-status-text');
      actionsEl = modal.querySelector('#fvh-mm-actions');

      timerId = setInterval(function () {
        if (isCancelled) return;
        seconds++;
        var secStr = seconds < 10 ? '0' + seconds : '' + seconds;
        if (timerEl) timerEl.textContent = '00:' + secStr;
      }, 1000);

      var consecutivePollErrors = 0;

      fetch(getApiUrl('/api/matchmaking/join'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: playerId,
          playerName: playerName,
          character: curChar,
          mode: curChar
        })
      })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (res) {
        if (isCancelled) return;
        if (!res.ok) {
          throw new Error(res.error || res.message || 'Join failed');
        }
        if (res.status === 'matched') {
          onMatched(res);
        } else {
          pollId = setInterval(function () {
            if (isCancelled) {
              clearInterval(pollId);
              return;
            }
            fetch(getApiUrl('/api/matchmaking/poll?playerId=' + encodeURIComponent(playerId)))
              .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
              })
              .then(function (pollRes) {
                if (isCancelled) return;
                consecutivePollErrors = 0;
                if (!pollRes.ok) {
                  showMatchmakingError(pollRes.message || tr('serverUnavailable'));
                  return;
                }
                if (pollRes.status === 'matched') {
                  clearInterval(pollId);
                  onMatched(pollRes);
                } else if (pollRes.status === 'timeout') {
                  // Transparent Matchmaking Timeout: NO fake bots!
                  clearInterval(pollId);
                  clearInterval(timerId);
                  showTimeoutState(pollRes.message || tr('matchmakingTimeout'));
                }
              })
              .catch(function (err) {
                consecutivePollErrors++;
                if (consecutivePollErrors >= 3) {
                  showMatchmakingError(tr('serverUnavailable'));
                }
              });
          }, 1200);
        }
      })
      .catch(function (err) {
        showMatchmakingError(tr('serverUnavailable'));
      });
    }

    function showTimeoutState(msg) {
      if (statusEl) {
        statusEl.style.color = '#f59e0b';
        statusEl.textContent = msg;
      }
      if (timerEl) timerEl.textContent = '--:--';
      if (actionsEl) {
        actionsEl.innerHTML =
          '<button class="btn primary block fvh-btn-retry-mm" style="margin-bottom:8px;">🔍 ' + tr('tryAgainBtn') + '</button>' +
          '<button class="btn block fvh-btn-back-lobby">' + tr('backToLobbyBtn') + '</button>';

        actionsEl.querySelector('.fvh-btn-retry-mm').onclick = function () {
          startSearch();
        };
        actionsEl.querySelector('.fvh-btn-back-lobby').onclick = function () {
          cleanup();
          overlay.remove();
        };
      }
    }

    function onMatched(matchInfo) {
      if (isCancelled) return;
      clearInterval(timerId);
      if (pollId) clearInterval(pollId);

      var opp = matchInfo.opponent || { name: 'Challenger', char: curChar === 'footy' ? 'hoops' : 'footy' };
      statusEl.style.color = '#10b981';
      statusEl.innerHTML = '<b>' + tr('matchFoundTitle') + '</b><br><span style="font-size:13px;color:#fff;">vs ' + opp.name + ' (' + (opp.char === 'footy' ? '⚽ FOOTY' : '🏀 HOOPS') + ')</span>';

      var countdown = 3;
      timerEl.textContent = tr('startingMatchIn', { n: countdown });
      app.audio.play('claim');

      var cdInterval = setInterval(function () {
        countdown--;
        if (countdown > 0) {
          timerEl.textContent = tr('startingMatchIn', { n: countdown });
        } else {
          clearInterval(cdInterval);
          overlay.remove();

          startWebRTCSession(app, matchInfo.role, matchInfo.matchId, playerName, opp.name, curChar, function (session) {
            app.launchOnline(session);
          }, function (err) {
            showToast(tr('serverUnavailable'));
          });
        }
      }, 1000);
    }

    startSearch();
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

  // Private Match: Create Room Modal (Cryptographically Unpredictable 6-char Code FVH-XXXX)
  function showCreateRoomModal(app, curChar) {
    var overlay = document.createElement('div');
    overlay.className = 'modal-back';
    var modal = document.createElement('div');
    modal.className = 'modal fvh-matchmaking-modal';

    var tabId = '';
    try {
      tabId = sessionStorage.getItem('fvh_tab_id');
      if (!tabId) {
        tabId = Math.random().toString(36).slice(2, 6);
        sessionStorage.setItem('fvh_tab_id', tabId);
      }
    } catch (e) {}
    var basePid = app.store.data.playerId || ('PLAYER_' + Math.floor(1000 + Math.random() * 9000));
    var playerId = basePid + (tabId ? '_' + tabId : '');
    var playerName = (app.store.data.profile && app.store.data.profile.nickname) || ('Athlete #' + basePid.slice(-4));
    var lang = getActiveLang();

    var roomCode = '';
    var pollStatusId = null;
    var isCancelled = false;

    modal.innerHTML =
      '<div class="fvh-mm-header">' +
      '<span class="fvh-mm-badge">🔑 ' + tr('privateMatchBadge') + '</span>' +
      '<h3>' + tr('privateMatchCreate') + '</h3>' +
      '</div>' +
      '<div style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:14px;margin:12px 0;text-align:center;">' +
      '<div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;">' + tr('roomCodeTitle') + '</div>' +
      '<div class="fvh-room-code-display" style="font-size:28px;font-weight:900;letter-spacing:4px;color:var(--accent-cyan);margin:8px 0;">...</div>' +
      '<button class="btn small primary fvh-copy-room-btn">📋 ' + tr('copyInviteLink') + '</button>' +
      '</div>' +
      '<div class="fvh-mm-status" id="fvh-room-status" style="margin:12px 0;">' + tr('roomWaitingStatus') + '</div>' +
      '<div class="actions">' +
      '<button class="btn block fvh-btn-cancel-room">' + tr('cancelSearch') + '</button>' +
      '</div>';

    var codeEl = modal.querySelector('.fvh-room-code-display');
    var statusEl = modal.querySelector('#fvh-room-status');
    var copyBtn = modal.querySelector('.fvh-copy-room-btn');

    function cleanup() {
      isCancelled = true;
      if (pollStatusId) clearInterval(pollStatusId);
      if (roomCode) {
        fetch(getApiUrl('/api/room/cancel'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: roomCode, hostId: playerId })
        }).catch(function () {});
      }
    }

    fetch(getApiUrl('/api/room/create'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hostId: playerId,
        hostName: playerName,
        character: curChar,
        mode: curChar
      })
    }).then(function (r) { return r.json(); }).then(function (res) {
      if (isCancelled) return;
      if (res.ok && res.code) {
        roomCode = res.code;
        codeEl.textContent = roomCode;

        copyBtn.onclick = function () {
          var joinLink = window.location.origin + window.location.pathname + '?room=' + roomCode;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(joinLink);
          }
          app.audio.play('click');
          showToast(tr('inviteLinkCopied') + ' (' + roomCode + ')');
          copyBtn.textContent = '✓ ' + (lang === 'ru' ? 'Скопировано!' : 'Copied!');
          setTimeout(function () { copyBtn.textContent = '📋 ' + tr('copyInviteLink'); }, 1800);
        };

        pollStatusId = setInterval(function () {
          if (isCancelled) return;
          fetch(getApiUrl('/api/room/status?code=' + encodeURIComponent(roomCode)))
            .then(function (r) { return r.json(); })
            .then(function (st) {
              if (st.ok && (st.status === 'ready' || st.status === 'playing') && st.guest) {
                clearInterval(pollStatusId);
                statusEl.style.color = '#10b981';
                statusEl.textContent = tr('roomReadyStatus');
                app.audio.play('claim');

                startWebRTCSession(app, 'host', roomCode, playerName, st.guest.name, curChar, function (session) {
                  overlay.remove();
                  app.launchOnline(session);
                }, function (err) {
                  statusEl.textContent = tr('serverUnavailable');
                  statusEl.style.color = '#f59e0b';
                });
              }
            }).catch(function () {});
        }, 1200);
      }
    }).catch(function () {
      statusEl.textContent = tr('serverUnavailable');
      statusEl.style.color = '#f59e0b';
    });

    modal.querySelector('.fvh-btn-cancel-room').onclick = function () {
      cleanup();
      overlay.remove();
    };

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

  // Private Match: Join Room Modal (Server-side validation & connection)
  function showJoinRoomModal(app, curChar) {
    var overlay = document.createElement('div');
    overlay.className = 'modal-back';
    var modal = document.createElement('div');
    modal.className = 'modal fvh-matchmaking-modal';

    var tabId = '';
    try {
      tabId = sessionStorage.getItem('fvh_tab_id');
      if (!tabId) {
        tabId = Math.random().toString(36).slice(2, 6);
        sessionStorage.setItem('fvh_tab_id', tabId);
      }
    } catch (e) {}
    var basePid = app.store.data.playerId || ('PLAYER_' + Math.floor(1000 + Math.random() * 9000));
    var playerId = basePid + (tabId ? '_' + tabId : '');
    var playerName = (app.store.data.profile && app.store.data.profile.nickname) || ('Athlete #' + basePid.slice(-4));
    var lang = getActiveLang();

    modal.innerHTML =
      '<div class="fvh-mm-header">' +
      '<span class="fvh-mm-badge">🔗 ' + tr('privateMatchBadge') + '</span>' +
      '<h3>' + tr('privateMatchJoin') + '</h3>' +
      '</div>' +
      '<div style="margin:14px 0;">' +
      '<input type="text" id="fvh-input-room-code" placeholder="' + tr('enterRoomCode') + '" style="width:100%;text-align:center;font-size:20px;font-weight:900;letter-spacing:3px;text-transform:uppercase;padding:12px;background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;" maxlength="10">' +
      '</div>' +
      '<div class="fvh-mm-status" id="fvh-join-status" style="margin-bottom:14px;color:var(--text-muted);font-size:12px;">' + (lang === 'ru' ? 'Введите 6-значный код комнаты (например, FVH-K8M2)' : 'Enter 6-character room code (e.g. FVH-K8M2)') + '</div>' +
      '<div class="actions" style="display:flex;flex-direction:column;gap:8px;">' +
      '<button class="btn primary block fvh-btn-confirm-join">' + tr('connectRoomBtn') + '</button>' +
      '<button class="btn block fvh-btn-cancel-join">' + tr('cancelSearch') + '</button>' +
      '</div>';

    var inputEl = modal.querySelector('#fvh-input-room-code');
    var statusEl = modal.querySelector('#fvh-join-status');
    var confirmBtn = modal.querySelector('.fvh-btn-confirm-join');

    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('room')) {
      inputEl.value = urlParams.get('room').toUpperCase();
    }

    confirmBtn.onclick = function () {
      var rawCode = (inputEl.value || '').trim().toUpperCase();
      if (!rawCode) {
        statusEl.style.color = '#f43f5e';
        statusEl.textContent = tr('roomNotFound');
        return;
      }

      var enteredCode = rawCode;
      if (!enteredCode.startsWith('FVH-') && !enteredCode.startsWith('FVH')) {
        enteredCode = 'FVH-' + enteredCode;
      }
      if (!enteredCode.includes('-') && enteredCode.startsWith('FVH')) {
        enteredCode = enteredCode.slice(0, 3) + '-' + enteredCode.slice(3);
      }

      confirmBtn.disabled = true;
      statusEl.style.color = '#38bdf8';
      statusEl.textContent = tr('connectingServer');

      fetch(getApiUrl('/api/room/join'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: enteredCode,
          guestId: playerId,
          guestName: playerName,
          character: curChar,
          role: 'guest'
        })
      }).then(function (r) {
        return r.json().then(function (data) {
          return { status: r.status, data: data };
        });
      }).then(function (res) {
        if (res.data && res.data.ok) {
          statusEl.style.color = '#10b981';
          statusEl.textContent = tr('roomReadyStatus');
          app.audio.play('claim');

          var hostName = (res.data.room && res.data.room.host && res.data.room.host.name) || 'Host';
          startWebRTCSession(app, 'guest', enteredCode, playerName, hostName, curChar, function (session) {
            overlay.remove();
            app.launchOnline(session);
          }, function (err) {
            confirmBtn.disabled = false;
            statusEl.textContent = tr('serverUnavailable');
            statusEl.style.color = '#f59e0b';
          });
        } else {
          confirmBtn.disabled = false;
          statusEl.style.color = '#f43f5e';
          var errType = (res.data && res.data.error) || '';
          if (errType === 'room_full' || res.status === 409) {
            statusEl.textContent = tr('roomFull');
          } else if (errType === 'room_closed' || res.status === 410) {
            statusEl.textContent = tr('roomClosed');
          } else {
            statusEl.textContent = tr('roomNotFound');
          }
        }
      }).catch(function () {
        confirmBtn.disabled = false;
        statusEl.style.color = '#f59e0b';
        statusEl.textContent = tr('serverUnavailable');
      });
    };

    modal.querySelector('.fvh-btn-cancel-join').onclick = function () {
      overlay.remove();
    };

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }


  // Dedicated Full-Screen Arena Selection Page (Gallery of 10 Worlds)
  function buildArenaSelectPage(app) {
    var curFilter = 'all'; // 'all', 'footy', 'hoops'
    var curChar = app.store.data.selectedCharacter || 'footy';
    var lang = getActiveLang();

    var container = document.createElement('div');
    container.className = 'screen solid page-screen has-nav fvh-arena-select-screen';
    container.dataset.id = 'arenas';

    var page = document.createElement('div');
    page.className = 'page';

    var head = document.createElement('div');
    head.className = 'page-head';
    var backBtn = document.createElement('button');
    backBtn.className = 'btn icon back';
    backBtn.textContent = '←';
    backBtn.onclick = function () {
      app.audio.play('click');
      app.showModeSelect();
    };

    var titleBox = document.createElement('div');
    titleBox.innerHTML =
      '<h1 style="margin:0;">' + tr('arenaSelectTitle') + '</h1>' +
      '<small style="color:var(--text-muted);font-size:11px;">' + tr('arenaSelectSub') + '</small>';

    head.appendChild(backBtn);
    head.appendChild(titleBox);
    page.appendChild(head);

    var body = document.createElement('div');
    body.className = 'page-body fvh-arena-page-body';

    // Filter Segment: ALL, FOOTBALL (FOOTY), BASKETBALL (HOOPS)
    var filterSeg = document.createElement('div');
    filterSeg.className = 'seg';
    filterSeg.style.marginBottom = '16px';
    var filterOptions = [
      { id: 'all', label: lang === 'ru' ? 'Все 10 Арен' : 'All 10 Arenas' },
      { id: 'footy', label: '⚽ FOOTY (' + (lang === 'ru' ? 'Газон' : 'Turf') + ')' },
      { id: 'hoops', label: '🏀 HOOPS (' + (lang === 'ru' ? 'Паркет' : 'Court') + ')' }
    ];
    filterOptions.forEach(function (fo) {
      var btn = document.createElement('button');
      btn.textContent = fo.label;
      if (fo.id === curFilter) btn.className = 'on';
      btn.onclick = function () {
        curFilter = fo.id;
        filterSeg.querySelectorAll('button').forEach(function (b) { b.className = ''; });
        btn.className = 'on';
        app.audio.play('click');
        renderArenaGrid();
      };
      filterSeg.appendChild(btn);
    });
    body.appendChild(filterSeg);

    // Arena Grid
    var arenaGrid = document.createElement('div');
    arenaGrid.className = 'fvh-arena-grid';
    body.appendChild(arenaGrid);

    page.appendChild(body);
    container.appendChild(page);

    function renderArenaGrid() {
      arenaGrid.innerHTML = '';
      var owned = app.store.data.owned || [];
      var eq = app.store.data.equipped || {};

      var filtered = SCENIC_ARENAS_CATALOG.filter(function (a) {
        if (curFilter === 'all') return true;
        if (a.id === 'std_ocean_sunset') return true;
        return a.mode === curFilter;
      });

      filtered.forEach(function (arena) {
        var card = document.createElement('div');
        var slotKey = arena.slot || ('stadium.' + arena.mode);
        var isEquipped = (eq[slotKey] === arena.id);
        var isOwned = (owned.indexOf(arena.id) !== -1) || Boolean(arena.isDefault);
        var rarKey = arena.rarity || 'epic';
        var localizedRarity = tr('rarity_' + rarKey) || rarKey.toUpperCase();
        var localizedName = trItem(arena.name);

        card.className = 'fvh-arena-card r-' + rarKey + (isEquipped ? ' is-equipped' : isOwned ? ' is-owned' : ' is-locked');

        var isDefaultStadium = Boolean(arena.isDefault);
        var envBadgeHtml = isDefaultStadium
          ? '<span class="fvh-arena-badge-env default">🏟️ ' + (lang === 'ru' ? 'СТАДИОН' : 'STADIUM') + '</span>'
          : '<span class="fvh-arena-badge-env themed">🌍 ' + (lang === 'ru' ? 'ТЕМАТИЧЕСКИЙ МИР' : 'THEMED WORLD') + '</span>';

        card.innerHTML =
          '<div class="fvh-arena-preview-wrap">' +
          renderItemArtwork(arena, 'large') +
          '<span class="fvh-arena-badge-mode">' + (arena.mode === 'footy' ? '⚽ FOOTY' : '🏀 HOOPS') + '</span>' +
          (isEquipped ? '<span class="fvh-arena-badge-equipped">✓ ' + tr('arenaEquipped') + '</span>' : '') +
          '</div>' +
          '<div class="fvh-arena-info">' +
          '<div class="fvh-arena-meta-row">' +
          envBadgeHtml +
          '<span class="rar ' + rarKey + '">' + localizedRarity + '</span>' +
          (isOwned && !isEquipped ? '<span style="font-size:11px;color:#10b981;font-weight:700;">✓ ' + tr('inCollection') + '</span>' : '') +
          '</div>' +
          '<h3 class="fvh-arena-title">' + localizedName + '</h3>' +
          '<p class="fvh-arena-desc">' + arena.desc + '</p>' +
          '</div>' +
          '<div class="fvh-arena-actions"></div>';

        var actBox = card.querySelector('.fvh-arena-actions');
        var btn = document.createElement('button');

        if (isEquipped) {
          btn.className = 'btn small block';
          btn.disabled = true;
          btn.textContent = '✓ ' + tr('equipped');
        } else if (isOwned) {
          btn.className = 'btn small primary block';
          btn.textContent = tr('selectArenaBtn');
          btn.onclick = function () {
            app.store.update(function (d) {
              if (!d.equipped) d.equipped = {};
              if (arena.isDefault) {
                d.equipped[slotKey] = arena.id;
              } else {
                // Themed arena equips for both football and basketball
                d.equipped['stadium.footy'] = arena.id;
                d.equipped['stadium.hoops'] = arena.id;
              }
            });
            app.audio.play('claim');
            showToast(tr('equipped') + ': ' + localizedName);
            renderArenaGrid();
          };
        } else {
          btn.className = 'btn small block';
          btn.textContent = '🪙 ' + arena.price + ' · ' + tr('buyArenaBtn');
          btn.onclick = function () {
            app.audio.play('click');
            app.go('shop');
          };
        }

        actBox.appendChild(btn);
        arenaGrid.appendChild(card);
      });
    }

    renderArenaGrid();

    // Persistent Bottom Nav
    container.appendChild(createSharedBottomNav('menu', app));
    return container;
  }

  // Dedicated Full-Screen Mode Selection Page
  function buildModeSelectPage(app) {
    var container = document.createElement('div');
    container.className = 'screen solid page-screen has-nav fvh-mode-select-screen';
    container.dataset.id = 'mode';

    var page = document.createElement('div');
    page.className = 'page';

    // Header with Back button
    var head = document.createElement('div');
    head.className = 'page-head';
    var backBtn = document.createElement('button');
    backBtn.className = 'btn icon back';
    backBtn.textContent = '←';
    backBtn.onclick = function () {
      app.audio.play('click');
      app.showMenu();
    };
    var title = document.createElement('h1');
    title.textContent = tr('modeSelectTitle');
    head.appendChild(backBtn);
    head.appendChild(title);
    page.appendChild(head);

    var body = document.createElement('div');
    body.className = 'page-body fvh-mode-page-body';

    var subtitle = document.createElement('div');
    subtitle.className = 'fvh-mode-subtitle';
    subtitle.textContent = tr('modeSelectSubtitle');
    body.appendChild(subtitle);

    var curChar = app.store.data.selectedCharacter || 'footy';
    var curSettings = (app.store.data.settings) || {};
    var lang = getActiveLang();

    // Active Arena Shortcut Pill
    var eq = app.store.data.equipped || {};
    var curArenaId = eq['stadium.' + curChar] || (curChar === 'footy' ? 'std_ocean_sunset' : 'std_forest_redwood');
    var curArenaDef = SCENIC_ARENAS_CATALOG.find(function (a) { return a.id === curArenaId; }) || SCENIC_ARENAS_CATALOG[0];

    var arenaBanner = document.createElement('div');
    arenaBanner.className = 'fvh-mode-arena-banner';
    arenaBanner.style.cssText = 'display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 14px;margin-bottom:14px;cursor:pointer;';
    arenaBanner.innerHTML =
      '<div style="display:flex;align-items:center;gap:10px;">' +
      '<span style="font-size:24px;">' + curArenaDef.icon + '</span>' +
      '<div>' +
      '<div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;">' + (lang === 'ru' ? 'Домашняя Арена' : 'Home Arena') + '</div>' +
      '<div style="font-size:14px;font-weight:800;color:#fff;">' + trItem(curArenaDef.name) + '</div>' +
      '</div>' +
      '</div>' +
      '<button class="btn small primary" style="white-space:nowrap;">🏟️ ' + tr('arenaSelectTitle') + ' ➔</button>';

    arenaBanner.onclick = function () {
      app.audio.play('click');
      app.show(buildArenaSelectPage(app), 'arenas');
    };
    body.appendChild(arenaBanner);

    // Mode Grid Container (3 Prominent Cards, Responsive down to 375px)
    var grid = document.createElement('div');
    grid.className = 'fvh-mode-grid';

    // -------------------------------------------------------------
    // CARD 1: Quick Match (Быстрый матч - Онлайн 1v1)
    // -------------------------------------------------------------
    var quickCard = document.createElement('div');
    quickCard.className = 'fvh-mode-card quick-card';
    quickCard.innerHTML =
      '<div class="fvh-mode-card-header">' +
        '<span class="fvh-mode-badge online">⚡ ' + tr('quickMatchBadge') + '</span>' +
        '<span class="fvh-mode-server-status"><span class="status-dot"></span> P2P Live</span>' +
      '</div>' +
      '<div class="fvh-mode-card-body">' +
        '<div class="fvh-mode-title">' + tr('quickMatchTitle') + '</div>' +
        '<div class="fvh-mode-desc">' + tr('quickMatchDesc') + '</div>' +
      '</div>' +
      '<div class="fvh-mode-card-actions">' +
        '<button class="btn primary block fvh-btn-matchmaking">⚡ ' + tr('quickMatchBtn') + '</button>' +
      '</div>';

    quickCard.querySelector('.fvh-btn-matchmaking').onclick = function () {
      app.audio.play('click');
      showQuickMatchSearchModal(app, curChar);
    };
    grid.appendChild(quickCard);

    // -------------------------------------------------------------
    // CARD 2: Private Match (Приватный матч - 1v1 с другом)
    // -------------------------------------------------------------
    var privateCard = document.createElement('div');
    privateCard.className = 'fvh-mode-card private-card';
    privateCard.innerHTML =
      '<div class="fvh-mode-card-header">' +
        '<span class="fvh-mode-badge private">🔑 ' + tr('privateMatchBadge') + '</span>' +
      '</div>' +
      '<div class="fvh-mode-card-body">' +
        '<div class="fvh-mode-title">' + tr('privateMatchTitle') + '</div>' +
        '<div class="fvh-mode-desc">' + tr('privateMatchDesc') + '</div>' +
      '</div>' +
      '<div class="fvh-mode-card-actions two-btn">' +
        '<button class="btn block fvh-btn-create-room">🏠 ' + tr('privateMatchCreate') + '</button>' +
        '<button class="btn block fvh-btn-join-room">🔗 ' + tr('privateMatchJoin') + '</button>' +
      '</div>';

    privateCard.querySelector('.fvh-btn-create-room').onclick = function () {
      app.audio.play('click');
      showCreateRoomModal(app, curChar);
    };
    privateCard.querySelector('.fvh-btn-join-room').onclick = function () {
      app.audio.play('click');
      showJoinRoomModal(app, curChar);
    };
    grid.appendChild(privateCard);

    // -------------------------------------------------------------
    // CARD 3: Practice vs AI (Тренировка с ИИ)
    // -------------------------------------------------------------
    var practiceCard = document.createElement('div');
    practiceCard.className = 'fvh-mode-card practice-card';

    var selSport = curChar;
    var selDiff = curSettings.difficulty || 'normal';
    var selMinutes = curSettings.matchMinutes || 2;

    practiceCard.innerHTML =
      '<div class="fvh-mode-card-header">' +
        '<span class="fvh-mode-badge practice">🤖 ' + tr('practiceAIBadge') + '</span>' +
        '<span class="fvh-mode-instant-pill">⚡ ' + tr('offlineNotice') + '</span>' +
      '</div>' +
      '<div class="fvh-mode-card-body">' +
        '<div class="fvh-mode-title">' + tr('practiceAITitle') + '</div>' +
        '<div class="fvh-mode-desc">' + tr('practiceAIDesc') + '</div>' +
        '<div class="fvh-mode-controls">' +
          '<div class="fvh-ctrl-row">' +
            '<span class="fvh-ctrl-label">' + tr('sportType') + ':</span>' +
            '<div class="seg seg-sport">' +
              '<button type="button" class="' + (selSport === 'footy' ? 'on' : '') + '" data-sport="footy">⚽ FOOTY</button>' +
              '<button type="button" class="' + (selSport === 'hoops' ? 'on' : '') + '" data-sport="hoops">🏀 HOOPS</button>' +
            '</div>' +
          '</div>' +
          '<div class="fvh-ctrl-row">' +
            '<span class="fvh-ctrl-label">' + tr('difficulty') + ':</span>' +
            '<div class="seg seg-diff">' +
              '<button type="button" class="' + (selDiff === 'easy' ? 'on' : '') + '" data-diff="easy">' + tr('easy') + '</button>' +
              '<button type="button" class="' + (selDiff === 'normal' ? 'on' : '') + '" data-diff="normal">' + tr('normal') + '</button>' +
              '<button type="button" class="' + (selDiff === 'hard' ? 'on' : '') + '" data-diff="hard">' + tr('hard') + '</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="fvh-mode-card-actions">' +
        '<button class="btn primary block fvh-btn-start-practice">▶ ' + tr('startPracticeBtn') + '</button>' +
      '</div>';

    // Interactive Sport selector
    practiceCard.querySelectorAll('.seg-sport button').forEach(function (b) {
      b.onclick = function () {
        practiceCard.querySelectorAll('.seg-sport button').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        selSport = b.dataset.sport;
        app.audio.play('click');
      };
    });

    // Interactive Difficulty selector
    practiceCard.querySelectorAll('.seg-diff button').forEach(function (b) {
      b.onclick = function () {
        practiceCard.querySelectorAll('.seg-diff button').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        selDiff = b.dataset.diff;
        app.audio.play('click');
      };
    });

    practiceCard.querySelector('.fvh-btn-start-practice').onclick = function () {
      app.audio.play('click');
      app.store.update(function (d) {
        if (!d.settings) d.settings = {};
        d.settings.difficulty = selDiff;
      });
      app.launch({
        mode: selSport,
        difficulty: selDiff,
        minutes: selMinutes,
        boostId: app.store.data.armedBoost
      }, false);
    };
    grid.appendChild(practiceCard);

    body.appendChild(grid);
    page.appendChild(body);
    container.appendChild(page);

    // Unified Persistent Bottom Navigation
    container.appendChild(createSharedBottomNav('menu', app));
    return container;
  }

  // Token Rivalry Ticker & Expandable Modal ($FOOTY vs $HOOPS 40/40/20)
  function showRivalryModal() {
    var overlay = document.createElement('div');
    overlay.className = 'modal-back fvh-sheet-back';
    var modal = document.createElement('div');
    modal.className = 'modal fvh-rivalry-modal';

    var lang = getActiveLang();
    var volLabel = lang === 'ru' ? 'Объём (40%)' : 'Volume (40%)';
    var capLabel = lang === 'ru' ? 'Капитализация (40%)' : 'Market Cap (40%)';
    var hldLabel = lang === 'ru' ? 'Холдеры (20%)' : 'Holders (20%)';

    modal.innerHTML =
      '<div class="fvh-sheet-handle"></div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
      '<h3 style="margin:0;font-size:17px;font-weight:900;letter-spacing:0.3px;">' + tr('rivalryTitle') + '</h3>' +
      '<button class="modal-close-x" style="width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;">✕</button>' +
      '</div>' +
      '<div style="font-size:12px;color:var(--text-muted);margin-bottom:14px;line-height:1.4;">' + tr('rivalryFormula') + '</div>' +
      '<div class="fvh-rivalry-bar-wrap" style="margin-bottom:16px;">' +
      '  <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;font-weight:900;margin-bottom:6px;">' +
      '    <span style="color:#00f0ff;">⚽ $FOOTY <b style="font-size:14px;margin-left:2px;">52%</b></span>' +
      '    <span style="color:#f97316;"><b style="font-size:14px;margin-right:2px;">48%</b> $HOOPS 🏀</span>' +
      '  </div>' +
      '  <div class="fvh-rivalry-bar" style="height:10px;border-radius:6px;overflow:hidden;margin-bottom:0;">' +
      '    <div class="fvh-rivalry-fill-footy" style="width:52%;"></div>' +
      '    <div class="fvh-rivalry-fill-hoops" style="width:48%;"></div>' +
      '  </div>' +
      '</div>' +
      '<div class="fvh-rivalry-grid">' +
      '<div class="fvh-rivalry-stat"><small>' + volLabel + '</small><b>52% : 48%</b></div>' +
      '<div class="fvh-rivalry-stat"><small>' + capLabel + '</small><b>51% : 49%</b></div>' +
      '<div class="fvh-rivalry-stat"><small>' + hldLabel + '</small><b>54% : 46%</b></div>' +
      '</div>' +
      '<div class="note" style="margin-top:14px;font-size:11px;opacity:0.85;">' + tr('rivalryDemoNote') + '</div>';

    modal.querySelector('.modal-close-x').onclick = function () { overlay.remove(); };
    overlay.onclick = function (e) {
      if (e.target === overlay) overlay.remove();
    };
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

  function createRivalryTicker() {
    var ticker = document.createElement('div');
    ticker.className = 'fvh-rivalry-ticker';
    ticker.innerHTML =
      '<div class="fvh-ticker-left">' +
      '<span class="footy-dot">●</span> <b>$FOOTY</b> 52%' +
      '<span class="vs-text">vs</span>' +
      '48% <b>$HOOPS</b> <span class="hoops-dot">●</span>' +
      '</div>' +
      '<div class="fvh-ticker-right">' +
      '<span>' + tr('rivalryTickerSub') + '</span> ➔' +
      '</div>';
    ticker.onclick = function () {
      showRivalryModal();
    };
    return ticker;
  }

  // Complete Redesigned Main Menu
  function renderRedesignedMenu(app) {
    app.state = 'menu';
    if (app.game && app.game.running) {
      app.game.stop();
    }
    app.closePause();

    var d = app.store.data;
    var bpState = getBattlePassState(app.store);

    var screen = document.createElement('div');
    screen.className = 'screen menu-bg';
    screen.dataset.id = 'menu';

    // 1. Top Bar: Clean Minimalist Console Header with Official Emblem
    var topbar = document.createElement('header');
    topbar.className = 'fvh-topbar';
    topbar.innerHTML =
      '<div class="fvh-topbar-brand" style="cursor:pointer;" title="FOOTY vs HOOPS">' +
      getOfficialEmblemHtml() +
      '<div class="logo-text">FOOTY <span class="dot">VS</span> HOOPS</div>' +
      '</div>' +
      '<div class="fvh-topbar-stats">' +
      '<button class="fvh-pill gold" id="fvh-btn-coins" title="' + tr('shop') + '">🪙 ' + (d.coins || 0) + '</button>' +
      '<button class="fvh-pill" id="fvh-btn-profile" title="' + tr('profile') + '">⭐ LVL ' + bpState.level + '</button>' +
      '<button class="fvh-pill icon-only" id="fvh-btn-settings" title="' + tr('settings') + '">⚙️</button>' +
      '</div>';
    screen.appendChild(topbar);

    topbar.querySelector('.fvh-topbar-brand').onclick = function () { app.showMenu(); };
    topbar.querySelector('#fvh-btn-coins').onclick = function () { app.audio.play('click'); app.go('shop'); };
    topbar.querySelector('#fvh-btn-profile').onclick = function () { app.audio.play('click'); app.go('profile'); };
    topbar.querySelector('#fvh-btn-settings').onclick = function () { app.audio.play('click'); app.go('settings'); };

    // 2. Hero Area: Side-by-Side Face-Off Showcase
    var stage = document.createElement('section');
    stage.className = 'fvh-hero-stage';

    var curChar = d.selectedCharacter || 'footy';

    // Footy Hero Card
    var footyHero = document.createElement('div');
    footyHero.className = 'fvh-hero-card footy' + (curChar === 'footy' ? ' selected' : '');
    footyHero.innerHTML =
      '<div class="fvh-hero-badge">' + tr('footyBadge') + '</div>' +
      '<div class="fvh-hero-avatar-box">' + getFootyAvatarSvg() + '</div>' +
      '<div class="fvh-hero-name">' + tr('footyChar') + '</div>' +
      '<div class="fvh-hero-role">' + tr('footyRole') + '</div>' +
      '<div class="fvh-hero-gear-pill">👕 ' + tr('openLocker') + ' ➔</div>';

    // Hoops Hero Card
    var hoopsHero = document.createElement('div');
    hoopsHero.className = 'fvh-hero-card hoops' + (curChar === 'hoops' ? ' selected' : '');
    hoopsHero.innerHTML =
      '<div class="fvh-hero-badge">' + tr('hoopsBadge') + '</div>' +
      '<div class="fvh-hero-avatar-box">' + getHoopsAvatarSvg() + '</div>' +
      '<div class="fvh-hero-name">' + tr('hoopsChar') + '</div>' +
      '<div class="fvh-hero-role">' + tr('hoopsRole') + '</div>' +
      '<div class="fvh-hero-gear-pill">👕 ' + tr('openLocker') + ' ➔</div>';

    // Tapping hero opens respective wardrobe / locker directly
    footyHero.onclick = function () {
      app.audio.play('click');
      app.openCharacterLocker('footy');
    };

    hoopsHero.onclick = function () {
      app.audio.play('click');
      app.openCharacterLocker('hoops');
    };

    var vsMiddle = document.createElement('div');
    vsMiddle.className = 'fvh-vs-middle';
    vsMiddle.textContent = 'VS';

    stage.appendChild(footyHero);
    stage.appendChild(vsMiddle);
    stage.appendChild(hoopsHero);
    screen.appendChild(stage);

    // 3. Primary Action Deck: Dominant PLAY Button that opens Mode Selection
    var actionDeck = document.createElement('div');
    actionDeck.className = 'fvh-action-deck';

    var playBtn = document.createElement('button');
    playBtn.className = 'fvh-btn-play-hero';
    playBtn.innerHTML =
      '<span class="play-icon">▶</span>' +
      '<span class="play-text">' + tr('playHero') + '</span>' +
      '<span class="play-sub">' + tr('chooseMode') + '</span>';
    playBtn.onclick = function () {
      app.audio.play('click');
      app.showModeSelect();
    };
    actionDeck.appendChild(playBtn);
    screen.appendChild(actionDeck);

    // 4. Token Rivalry Compact Ticker
    screen.appendChild(createRivalryTicker());

    // 5. Active Season 1 Directives Banner
    var seasonCard = document.createElement('div');
    seasonCard.className = 'fvh-season-hub-card';
    seasonCard.innerHTML =
      '<div class="fvh-season-hub-left">' +
      '<div class="fvh-season-hub-tag">👑 ' + tr('seasonBannerTitle') + '</div>' +
      '<div class="fvh-season-hub-title">' + tr('bpTier', { lvl: bpState.level }) + ' · ' + tr('bpSeason') + '</div>' +
      '<div class="pbar" style="height:6px;margin:6px 0 0 0;"><i style="width:' + bpState.percent + '%;"></i></div>' +
      '</div>' +
      '<button class="btn small primary fvh-season-hub-btn">' + tr('quests') + ' ➔</button>';
    seasonCard.querySelector('.fvh-season-hub-btn').onclick = function () {
      app.audio.play('click');
      app.go('quests');
    };
    seasonCard.onclick = function (e) {
      if (e.target.tagName !== 'BUTTON') {
        app.audio.play('click');
        app.go('battlepass');
      }
    };
    screen.appendChild(seasonCard);

    // 6. Unified Persistent Bottom Navigation
    screen.appendChild(createSharedBottomNav('menu', app));

    // Show screen
    app.show(screen, 'menu');
  }



  // Hook into App & Page Router
  onAppReady(function (app) {
    // Initial sync with authoritative backend economy
    syncAuthoritativeEconomy(app);

    // Authoritative match completion reward hook (Offline & Online Authoritative Sync)
    var origMatchEnd = app.onMatchEnd ? app.onMatchEnd.bind(app) : null;
    if (origMatchEnd) {
      app.onMatchEnd = function (sum) {
        origMatchEnd(sum);
        var pid = getAppPlayerId(app);
        var mOutcome = (sum.winner === 0 ? 'win' : sum.winner === null ? 'draw' : 'loss');

        if (!sum.online) {
          safeEconomyApi('/api/economy/reward', {
            playerId: pid,
            rewardType: 'match',
            matchId: 'm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
            meta: {
              mode: sum.mode,
              outcome: mOutcome,
              difficulty: (app.lastCfg && app.lastCfg.difficulty) || 'normal',
              goals: (sum.stats && sum.stats.humanGoals) || 0,
              tackles: (sum.stats && sum.stats.humanTackles) || 0
            }
          }).then(function (res) {
            if (res && res.ok) {
              app.store.update(function (d) {
                d.coins = res.coins;
                d.xp = res.xp;
              });
            }
          });
        } else {
          // Real Online Multiplayer: Authoritative Server Match Completion & Reward
          var onlineInfo = (app.game && app.game.cfg && app.game.cfg.online && app.game.cfg.online.info) || {};
          var mId = onlineInfo.matchId || ('FVH-M' + Date.now());
          var mPhase = (app.game && app.game.sim && app.game.sim.matchPhase) || 'regulation';

          fetch(getApiUrl('/api/match/complete'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              matchId: mId,
              playerId: pid,
              finalScore: sum.score,
              winner: sum.winner,
              phase: mPhase,
              stats: sum.stats || {}
            })
          }).then(function (r) { return r.json(); }).then(function (compRes) {
            if (compRes && compRes.ok && compRes.matchToken) {
              safeEconomyApi('/api/economy/reward', {
                playerId: pid,
                rewardType: 'match',
                matchId: compRes.matchId,
                matchToken: compRes.matchToken,
                onlineMatch: true,
                meta: {
                  mode: sum.mode,
                  outcome: mOutcome,
                  difficulty: 'normal',
                  goals: (sum.stats && sum.stats.humanGoals) || 0,
                  tackles: (sum.stats && sum.stats.humanTackles) || 0
                }
              }).then(function (rewRes) {
                if (rewRes && rewRes.ok) {
                  app.store.update(function (d) {
                    d.coins = rewRes.coins;
                    d.xp = rewRes.xp;
                  });
                }
              });
            }
          }).catch(function (err) {
            console.warn('Authoritative match complete error', err);
          });
        }
      };
    }

    // Authoritative Opponent Disconnect / Forfeit hook
    var origOnlineLost = app.onOnlineLost ? app.onOnlineLost.bind(app) : null;
    app.onOnlineLost = function (why) {
      var pid = getAppPlayerId(app);
      var onlineInfo = (app.game && app.game.cfg && app.game.cfg.online && app.game.cfg.online.info) || {};
      var mId = onlineInfo.matchId;

      if (mId && (why === 'left' || why === 'timeout' || why === 'lost')) {
        fetch(getApiUrl('/api/match/forfeit'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ matchId: mId, playerId: pid, reason: why })
        }).then(function (r) { return r.json(); }).then(function (forfeitRes) {
          if (forfeitRes && forfeitRes.ok && forfeitRes.matchToken) {
            safeEconomyApi('/api/economy/reward', {
              playerId: pid,
              rewardType: 'match',
              matchId: mId,
              matchToken: forfeitRes.matchToken,
              onlineMatch: true,
              meta: {
                mode: (app.game && app.game.cfg && app.game.cfg.mode) || 'footy',
                outcome: 'win',
                difficulty: 'normal',
                goals: 1
              }
            }).then(function (rewRes) {
              if (rewRes && rewRes.ok) {
                app.store.update(function (d) {
                  d.coins = rewRes.coins;
                  d.xp = rewRes.xp;
                });
              }
            });
          }
        }).catch(function () {});
      }

      if (origOnlineLost) {
        origOnlineLost(why);
      }
    };

    // Telegram Mini App (TMA) Integration
    function initTelegramMiniApp(app) {
      if (typeof window === 'undefined' || !window.Telegram || !window.Telegram.WebApp) return;
      var tg = window.Telegram.WebApp;
      try {
        tg.ready();
        tg.expand();
        if (typeof tg.enableClosingConfirmation === 'function') {
          tg.enableClosingConfirmation();
        }

        if (tg.setHeaderColor) {
          tg.setHeaderColor('#060a14');
        }
        if (tg.setBackgroundColor) {
          tg.setBackgroundColor('#040710');
        }

        // Auto-extract Telegram user profile
        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
          var u = tg.initDataUnsafe.user;
          var tgName = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username || ('Athlete #' + u.id);
          app.store.update(function (d) {
            if (!d.profile) d.profile = {};
            if (!d.profile.nickname || d.profile.nickname.startsWith('Athlete #') || d.profile.nickname === 'Player') {
              d.profile.nickname = tgName;
            }
            d.telegramUser = {
              id: u.id,
              username: u.username || '',
              firstName: u.first_name || '',
              lastName: u.last_name || '',
              languageCode: u.language_code || ''
            };
            if (u.language_code && (!d.settings || !d.settings.lang || d.settings.lang === 'auto')) {
              if (!d.settings) d.settings = {};
              d.settings.lang = u.language_code.startsWith('ru') ? 'ru' : 'en';
            }
          });
        }

        // Native Telegram BackButton
        if (tg.BackButton) {
          tg.BackButton.onClick(function () {
            if (app.state !== 'menu') {
              app.showMenu();
            }
          });
        }
      } catch (tgErr) {
        console.warn('Telegram WebApp initialization error:', tgErr);
      }
    }

    function updateTelegramBackButton(state) {
      if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.BackButton) {
        try {
          if (state === 'menu') {
            window.Telegram.WebApp.BackButton.hide();
          } else {
            window.Telegram.WebApp.BackButton.show();
          }
        } catch (e) {}
      }
    }

    var originalGo = app.go.bind(app);
    var originalShow = app.show ? app.show.bind(app) : null;

    app.show = function (el, id) {
      if (this.ui) {
        this.ui.innerHTML = '';
      }
      if (originalShow) {
        originalShow(el, id);
      } else {
        el.dataset.id = id;
        this.ui.append(el);
      }
      this.current = el;
    };

    // Dedicated Character Locker opener (Tapping FOOTY or HOOPS opens their respective inventory)
    app.openCharacterLocker = function (charId, slotId) {
      app.show(buildCharactersPage(app, charId, slotId), 'characters');
    };

    app.go = function (page, opts) {
      updateTelegramBackButton(page);
      if (page === 'menu') {
        renderRedesignedMenu(app);
      } else if (page === 'characters') {
        app.audio.play('click');
        var charTarget = (opts && opts.char) || (app.store.data.selectedCharacter) || 'footy';
        var slotTarget = (opts && opts.slot) || 'skins';
        app.show(buildCharactersPage(app, charTarget, slotTarget), 'characters');
      } else if (page === 'quests') {
        app.audio.play('click');
        var questTab = (opts && opts.tab) || 'daily';
        app.show(buildQuestsPage(app, questTab), 'quests');
      } else if (page === 'shop') {
        app.audio.play('click');
        app.show(buildShopPage(app), 'shop');
      } else if (page === 'battlepass') {
        app.audio.play('click');
        app.show(buildBattlePassPage(app), 'battlepass');
      } else if (page === 'profile') {
        app.audio.play('click');
        app.show(buildProfilePage(app), 'profile');
      } else if (page === 'mode') {
        app.audio.play('click');
        app.show(buildModeSelectPage(app), 'mode');
      } else if (page === 'settings') {
        app.audio.play('click');
        app.show(buildSettingsPage(app), 'settings');
      } else if (page === 'arenas') {
        app.audio.play('click');
        app.show(buildArenaSelectPage(app), 'arenas');
      } else {
        originalGo(page);
      }
    };

    // Override showMenu with new redesigned main menu
    app.showMenu = function () {
      updateTelegramBackButton('menu');
      renderRedesignedMenu(app);
    };

    initTelegramMiniApp(app);

    // Dedicated Mode Selection Screen
    app.showModeSelect = function () {
      app.show(buildModeSelectPage(app), 'mode');
    };

    // Dedicated Arena Selection Gallery
    app.showArenas = function () {
      app.show(buildArenaSelectPage(app), 'arenas');
    };

    // Refresh menu on language change
    if (typeof window.require === 'function') {
      try {
        window.require(['i18n/index'], function (i18nMod) {
          if (i18nMod && i18nMod.onLanguageChange) {
            i18nMod.onLanguageChange(function () {
              if (app.state === 'menu') {
                renderRedesignedMenu(app);
              } else if (app.state === 'settings') {
                app.show(buildSettingsPage(app), 'settings');
              } else if (app.state === 'shop') {
                app.show(buildShopPage(app), 'shop');
              } else if (app.state === 'quests') {
                app.show(buildQuestsPage(app), 'quests');
              } else if (app.state === 'battlepass') {
                app.show(buildBattlePassPage(app), 'battlepass');
              } else if (app.state === 'profile') {
                app.show(buildProfilePage(app), 'profile');
              } else if (app.state === 'characters') {
                app.show(buildCharactersPage(app), 'characters');
              } else if (app.state === 'mode') {
                app.show(buildModeSelectPage(app), 'mode');
              }
            });
          }
        });
      } catch (e) {
        console.warn('Language change listener not attached', e);
      }
    }

    // Initial render or URL parameter
    var params = (typeof window !== 'undefined' && window.location) ? new URLSearchParams(window.location.search) : null;
    var targetPage = params ? params.get('page') : null;
    var targetChar = params ? params.get('char') : null;
    var targetSlot = params ? params.get('slot') : null;
    var targetTab = params ? params.get('tab') : null;
    var targetCat = params ? params.get('cat') : null;
    var targetInspect = params ? params.get('inspect') : null;
    var quicksearch = params ? params.get('quicksearch') : null;

    var privateroom = params ? params.get('privateroom') : null;

    var targetLaunch = params ? params.get('launch') : null;

    if (targetLaunch) {
      setTimeout(function () {
        app.launch({
          mode: targetLaunch,
          difficulty: 'normal',
          minutes: 2,
          boostId: null
        }, false);
      }, 250);
    } else if (targetPage === 'characters') {
      app.show(buildCharactersPage(app, targetChar || 'footy', targetSlot), 'characters');
    } else if (targetPage === 'quests') {
      app.show(buildQuestsPage(app, targetTab || 'gameplay'), 'quests');
    } else if (targetPage === 'shop') {
      app.show(buildShopPage(app, targetCat || 'all', targetInspect), 'shop');
    } else if (targetPage === 'arenas') {
      app.show(buildArenaSelectPage(app), 'arenas');
    } else if (targetPage === 'mode') {
      app.show(buildModeSelectPage(app), 'mode');
      if (quicksearch) {
        setTimeout(function () { showQuickMatchSearchModal(app, targetChar || 'footy'); }, 300);
      } else if (privateroom) {
        setTimeout(function () { showCreateRoomModal(app, targetChar || 'footy'); }, 300);
      } else if (params && (params.get('joinroom') || params.get('room'))) {
        setTimeout(function () { showJoinRoomModal(app, targetChar || 'footy'); }, 300);
      }
    } else if (targetPage && targetPage !== 'menu') {
      app.go(targetPage);
    } else {
      renderRedesignedMenu(app);
    }

    if (params && params.get('opencheckout') === 'bp') {
      setTimeout(function () { openBattlePassCheckout(app); }, 450);
    } else if (params && (params.get('openrivalry') || params.get('rivalry'))) {
      setTimeout(function () { showRivalryModal(); }, 400);
    } else if (params && params.get('openbundle')) {
      setTimeout(function () {
        var bId = params.get('openbundle');
        var b = BUNDLE_ITEMS.find(function (x) { return x.id === bId; });
        if (b) {
          if (app.openBundleInspector) {
            app.openBundleInspector(b);
          } else if (window.__openBundleInspectorModal) {
            window.__openBundleInspectorModal(b);
          }
        }
      }, 450);
    }
  });
})();
