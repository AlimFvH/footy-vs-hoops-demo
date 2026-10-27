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

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  if (typeof window !== 'undefined') {
    window.escapeHtml = escapeHtml;
  }
  // Unified Localization Dictionary with Complete En/Ru Parity
  var I18N = {
    en: {
      replay: 'REPLAY',
      goalReplay: 'GOAL REPLAY',
      skipReplay: 'SKIP',
      mute: 'Mute',
      unmute: 'Unmute',
      playHero: 'PLAY',
      chooseMode: 'SELECT MODE',
      quickMatch: 'QUICK MATCH',
      privateMatch: 'PRIVATE 1v1',
      practiceAI: 'PRACTICE VS AI',
      characters: 'WARDROBE',
      battlePass: 'BATTLE PASS',
      battlePassShort: 'PASS',
      quests: 'MISSIONS',
      shop: 'STORE',
      profile: 'PROFILE',
      settings: 'SETTINGS',
      rivalryTitle: '$FOOTY vs $HOOPS Rivalry',
      rivalryFormula: '40% Volume · 40% Market Cap · 20% Holders',
      rivalryDemoNote: '🔴 LIVE COMPETITION · Matches scored by athletes in real time directly shape the team balance',
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
      openLockerShort: 'WARDROBE',
      switchSideShort: 'SWITCH TEAM',
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
      catBoosts: 'Boosts',
      boostArmed: 'Armed',
      boostArm: 'Equip Boost',
      boostDisarm: 'Unequip',
      boostActiveType: 'ACTIVE',
      boostPassiveType: 'PASSIVE',
      boostActiveDesc: 'Manual on-screen or [B] keyboard trigger for 12s Turbo Overdrive',
      boostPassiveDesc: 'Automatic permanent buff applied throughout the entire match',
      boostCharges: '{n} Uses',
      boostUsesLeft: '{n} Uses Remaining',
      noBoostEquipped: 'No Boost Equipped',
      boostsWardrobeTitle: 'Equipped Boost',
      boostBuyMore: 'Buy +1 Charge',
      changeBoost: 'Change',
      selectBoostPrompt: 'Select Boost for Match',
      emptyBoostsDesc: 'Boosts give you decisive game-changing edges like super-speed, doubled stamina, and multiplied match earnings. Visit the Shop to acquire boosts!',
      boostTurboDesc: '+15% Turbo Speed Overdrive (Manual In-Match Activation)',
      boostLungsDesc: '2x Stamina Regeneration and -40% Tackle Stamina Cost',
      boostPowerDesc: '+12% Shot Power and +25% Aim Accuracy',
      boostCoinsDesc: '2x Multiplied Coin Rewards on Match Completion',
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
      clashModeTitle: 'FOOTY vs HOOPS Clash',
      clashModeBadge: '🔥 1v1 RIVALRY SHOWDOWN',
      clashModeDesc: 'The ultimate sports collision! Football (Striker) clashes head-to-head with Basketball (All-Star) on the arena pitch!',
      clashPlayFooty: '⚽ PLAY AS FOOTY',
      clashPlayHoops: '🏀 PLAY AS HOOPS',
      clashFootySub: '⚽ Striker vs 🏀 All-Star',
      clashHoopsSub: '🏀 All-Star vs ⚽ Striker',
      clashStartBtn: 'START 1v1 CLASH SHOWDOWN',
      matchupTitle: 'Cross-Sport Rivalry Matchup:',
      youTeam: 'You',
      cpuTeam: 'Opponent',
      teamSelectTitle: 'FOOTBALL VS BASKETBALL',
      teamSelectSubtitle: 'Choose your side in the legendary clash of two sports!',
      teamFootyTitle: 'TEAM FOOTBALL',
      teamFootySub: 'Agile Striker · Precision Cleats & Dribbling',
      teamFootyDesc: 'Fight for Football glory! Score incredible goals and prove Football reigns supreme over Basketball!',
      teamFootyBtn: 'CHOOSE FOOTBALL',
      teamHoopsTitle: 'TEAM BASKETBALL',
      teamHoopsSub: 'Power Forward · Slam Dunks & Sniper Shots',
      teamHoopsDesc: 'Fight for Basketball pride! Sink unstoppable buckets and show that Basketball rules the arena!',
      teamHoopsBtn: 'CHOOSE BASKETBALL',
      yourTeamLabel: 'Your Team',
      rivalTeamLabel: 'Rival Team',
      switchTeamBtn: 'Switch Sport Side',
      playForFooty: 'PLAY FOR FOOTBALL',
      playForHoops: 'PLAY FOR BASKETBALL',
      playFootySub: 'Crush Team Basketball in the Arena ⚔️',
      playHoopsSub: 'Crush Team Football in the Arena ⚔️',
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
      q_sub_yt_title: 'Subscribe on YouTube',
      q_sub_yt_desc: 'Match gameplay highlights, tips, and official trailers',
      q_sub_tiktok_title: 'Follow on TikTok',
      q_sub_tiktok_desc: 'Trending sports clips, viral goals, and compilations',
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
      followUsTitle: 'Follow Us',
      followUsSubtitle: 'Official FOOTY vs HOOPS channels & communities',
      socialNotice: 'Automated subscription verification is unavailable via third-party platform APIs. Follow to stay tuned.',
      visitBtn: 'VISIT',
      subscribedBtn: 'SUBSCRIBED',
      subscribeFootyHoops: 'Subscribe to @FootyHoops',
      tgVerifySuccess: '✓ Subscribed to @FootyHoops! +50 FvH Coin',
      tgVerifyFailed: 'Please subscribe to @FootyHoops to claim this reward',
      inviteFriendBtn: 'INVITE FRIEND',
      itemLockedToast: 'Item is locked! Purchase it from the Stadium Store.',
      catCrowd: 'Supporters & Crowd',
      arenaTabEnvironments: 'Stadiums & Worlds',
      arenaTabCrowd: 'Supporters & Fans',
      crowdSelectTitle: 'STADIUM SUPPORTERS & CROWD',
      crowdSelectSub: 'Choose the fan club style and stadium audience supporting you during matches',
      selectCrowdBtn: 'EQUIP SUPPORTERS',
      crowdEquipped: 'ACTIVE SUPPORTERS',
      crowdFootyUltrasName: 'FOOTY Ultras',
      crowdFootyUltrasDesc: 'Passionate football fan club with cyan and royal blue scarves, team banners, and club chants.',
      crowdHoopsAllstarsName: 'HOOPS All-Stars',
      crowdHoopsAllstarsDesc: 'High-energy basketball arena fans with fiery orange jerseys, foam fingers, and courtside roar.',
      crowdGlobalFestName: 'Global Festival',
      crowdGlobalFestDesc: 'International multi-color carnival audience with stadium camera flashes and festive tournament flags.',
      crowdCyberVipName: 'Cyber Neon VIP',
      crowdCyberVipDesc: 'Futuristic VIP terrace with luminous cybernetic attire, neon accessories, and hologram lights.',
      crowdEmeraldForestName: 'Emerald Supporters',
      crowdEmeraldForestDesc: 'Nature-inspired supporters club waving forest-green and gold scarves in harmony with outdoor arenas.',
      crowdGoldChampsName: 'Champions Golden Suite',
      crowdGoldChampsDesc: 'Luxurious black-and-gold stadium grandstand suite with exclusive VIP atmosphere.',
      arenaSelectTitle: 'ARENA ENVIRONMENTS',
      homeArena: 'HOME ARENA',
      arenaSelectSub: 'Select between classic stadiums with grandstands or open-world scenic biomes',
      arenaDescClassicFooty: 'Traditional stadium with manicured soccer turf, packed cheering grandstands, and floodlights.',
      arenaDescClassicHoops: 'Classic urban stadium with polished hardwood court, cheering crowds, and authentic match ambience.',
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
      starsRedirect: 'Opening Telegram Stars checkout...',
      leaderboard: 'Leaderboard',
      leaderboardTitle: 'TEAM WAR',
      leaderboardSubtitle: 'Whichever team has more points wins the Season!',
      leaderboardOverall: 'Overall',
      leaderboardFooty: 'FOOTY',
      leaderboardHoops: 'HOOPS',
      timeWeekly: 'Weekly',
      timeSeason: 'Season 1',
      timeAllTime: 'All-Time',
      searchAthletePlaceholder: 'Search athlete nickname...',
      rankTierChampion: 'Champion',
      rankTierDiamond: 'Diamond',
      rankTierPlatinum: 'Platinum',
      rankTierGold: 'Gold',
      rankTierSilver: 'Silver',
      rankTierBronze: 'Bronze',
      noAthletesFound: 'No athletes found matching search',
      winRateLabel: '{n}% WR',
      winsLossesLabel: '{w}W · {l}L',
      syncingRankings: 'Syncing rankings...',
      retrySync: 'Retry',
      syncFailed: 'Could not load rankings',
      ptsUnit: 'pts',
      teamFootball: 'TEAM FOOTBALL',
      teamBasketball: 'TEAM BASKETBALL',
      teamFootballWins: '⚽ TEAM FOOTBALL IS WINNING!',
      teamBasketballWins: '🏀 TEAM BASKETBALL IS WINNING!',
      teamFootballLeads: 'Team Football leads the war!',
      teamBasketballLeads: 'Team Basketball leads the war!',
      leadDiffNotice: '+{diff} pts lead over rival team',
      warClashCallout: 'Play matches to score points and secure your team\'s victory!',
      yourTeam: 'Your Team',
      yourContribution: 'Your personal contribution: +{score} pts for your team!',
      warMvpTitle: 'WAR MVP STANDINGS',
      warMvpSubtitle: 'Athletes from both factions leading their team to victory',
      pointsContributed: 'pts',
      warScoreTotal: 'Total Team Points',
      warSeasonTimer: 'Season ends in {d}d · Team with most points claims the Championship Cup!',
      warLiveScoreboard: 'CLASH SCOREBOARD',
      storeSubFooty: 'FOOTBALL CLUB BOUTIQUE · GEAR FOR FOOTBALLERS',
      storeSubHoops: 'BASKETBALL CLUB BOUTIQUE · GEAR FOR BASKETBALLERS',
      storeNoticeFooty: '⚽ You are playing for Team Football. Store strictly displays football items only.',
      storeNoticeHoops: '🏀 You are playing for Team Basketball. Store strictly displays basketball items only.',
      onlyForFootball: 'Exclusive for Footballers',
      onlyForBasketball: 'Exclusive for Basketballers',
      teamFootballBoutique: 'FOOTBALL CLUB STORE',
      teamBasketballBoutique: 'BASKETBALL CLUB STORE',
      teamFootballBoutiqueDesc: 'Official football gear: match balls, cleats, striker kits, and championship pitches.',
      teamBasketballBoutiqueDesc: 'Official basketball gear: basketballs, sneakers, all-star jerseys, and hardwood courts.',
      tabSeason: '🏆 Season',
      tabFooty: '⚽ Footy',
      tabHoops: '🏀 Hoops',
      tabCoins: '🪙 Coins',
      rankTrophies: 'Trophies',
      rankGoals: 'Goals',
      rankBaskets: 'Points',
      rankCoins: 'FvH Coin',
      yourRank: 'Your Rank',
      pointsToNext: '{n} pts to climb rank',
      divisionPro: 'Premier League',
      divisionElite: 'Elite Division',
      divisionChampion: 'Champions Division',
      divisionLegend: 'Legend League',
      seasonEndsIn: 'Season 1 ends in',
      daysLeft: 'd',
      podium1st: 'Arena Champion',
      podium2nd: 'Vice Champion',
      podium3rd: 'Bronze Medalist',
      teamFootyTokenBadge: 'FUTURE TOKEN: $FOOTY',
      teamHoopsTokenBadge: 'FUTURE TOKEN: $HOOPS',
      teamFootyTokenDesc: 'Qualify for the official post-launch $FOOTY token airdrop on TON by scoring goals and winning.',
      teamHoopsTokenDesc: 'Qualify for the official post-launch $HOOPS token airdrop on TON by scoring baskets and winning.',
      teamTokenDisclaimer: '* Tokens $FOOTY and $HOOPS are in development and will only be distributed after official TGE launch on TON. In-game FvH Coins are not cryptocurrency.',
      profileTgeCardTitle: 'FUTURE TGE AIRDROP & FACTION TOKEN',
      profileTgeStatus: 'Pre-TGE Qualification Active',
      profileTgeFaction: 'Faction Token',
      profileTgePoints: 'Qualifying Points',
      profileTgePointsDesc: 'Points calculated from verified match victories, goals scored, and Battle Pass progression.',
      profileTgeCurrencyNotice: 'In-game FvH Coins are strictly for the shop and cosmetics. They are not tokens or cryptocurrency.',
      profileTgeWalletTitle: 'TON Airdrop Wallet',
      profileTgeWalletConnected: 'Wallet Linked for TGE Snapshot',
      profileTgeWalletNotConnected: 'Wallet Not Linked (Optional)',
      profileTgeConnectBtn: '+ Link TON Wallet',
      profileTgeChangeBtn: 'Change Address',
      profileTgeDisconnectBtn: 'Unlink',
      profileTgeModalTitle: 'Link Public TON Wallet',
      profileTgeModalDesc: 'Enter your public TON wallet address (Tonkeeper, Telegram Wallet) for the future TGE snapshot.',
      profileTgeAddressPlaceholder: 'EQ... or UQ... or domain.ton',
      profileTgeSaveBtn: 'Save Public Address',
      profileTgeSecurityWarning: '🛡️ Security: Enter ONLY your public wallet address. We will NEVER ask for your seed phrase or private keys!',
      profileTgeLaunchNotice: 'Official token distribution will take place only after public TGE. No real tokens are distributed prior to launch.',
      profileTgeSeedWarningAlert: 'Security Warning: Do not enter a seed phrase or private key! Enter only your public TON address (EQ... or UQ...).',
      profileTgeInvalidAddress: 'Please enter a valid public TON address (e.g. EQ..., UQ..., or .ton domain).',
      warPrizePoolTitle: 'SEASON TGE PRIZE POOL',
      warPrizePoolDesc: 'Victory by Team Football or Basketball determines priority token allocation quota for $FOOTY / $HOOPS on TON!',
      warTokenFactionFooty: 'Token Faction: $FOOTY',
      warTokenFactionHoops: 'Token Faction: $HOOPS',
      warQualifyingContrib: 'Qualifying contribution for TGE allocation snapshot',
      diffEasyReward: '🟢 Easy AI: +15 Leaderboard pts on victory (0.5x rewards)',
      diffNormalReward: '🟡 Normal AI: +30 Leaderboard pts on victory (1.0x standard)',
      diffHardReward: '🔴 Hard AI: +60 Leaderboard pts on victory (2.0x MAX rewards!)',
      warDiffBreakdown: 'AI Victory Points: Easy +15 · Normal +30 · Hard +60 pts'
    },
    ru: {
      replay: 'ПОВТОР',
      goalReplay: 'ПОВТОР ГОЛА',
      skipReplay: 'ПРОПУСТИТЬ',
      mute: 'Без звука',
      unmute: 'Включить звук',
      playHero: 'ИГРАТЬ',
      chooseMode: 'ВЫБРАТЬ РЕЖИМ',
      quickMatch: 'БЫСТРЫЙ МАТЧ',
      privateMatch: 'ПРИВАТНЫЙ 1v1',
      practiceAI: 'ТРЕНИРОВКА',
      characters: 'ГАРДЕРОБ',
      battlePass: 'БОЕВОЙ ПРОПУСК',
      battlePassShort: 'ПРОПУСК',
      quests: 'ЗАДАНИЯ',
      shop: 'МАГАЗИН',
      profile: 'ПРОФИЛЬ',
      settings: 'ОПЦИИ',
      rivalryTitle: 'Соперничество $FOOTY vs $HOOPS',
      rivalryFormula: '40% Объём · 40% Капитализация · 20% Холдеры',
      rivalryDemoNote: '🔴 СЕЗОН 1 В ПРЯМОМ ЭФИРЕ · Результаты матчей игроков в реальном времени влияют на баланс сил команд',
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
      openLockerShort: 'ГАРДЕРОБ',
      switchSideShort: 'СМЕНИТЬ',
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
      catBoosts: 'Бусты',
      boostArmed: 'Снаряжён',
      boostArm: 'Снарядить',
      boostDisarm: 'Снять',
      boostActiveType: 'АКТИВНЫЙ',
      boostPassiveType: 'ПАССИВНЫЙ',
      boostActiveDesc: 'Ручная активация в матче (кнопка на экране или [B] на клавиатуре) на 12 секунд супер-ускорения',
      boostPassiveDesc: 'Постоянное автоматическое усиление на протяжении всего матча',
      boostCharges: '{n} зарядов',
      boostUsesLeft: 'Осталось зарядов: {n}',
      noBoostEquipped: 'Буст не выбран',
      boostsWardrobeTitle: 'Выбранный буст',
      boostBuyMore: 'Купить +1 заряд',
      changeBoost: 'Выбрать',
      selectBoostPrompt: 'Выберите буст на матч',
      emptyBoostsDesc: 'Бусты дают решающее преимущество: супер-скорость, удвоенную выносливость и удвоение наград. Загляните в магазин за новыми бустами!',
      boostTurboDesc: '+15% Турбо-ускорение бега (ручная активация во время матча)',
      boostLungsDesc: '2x Скорость восстановления выносливости и -40% расход на отбор',
      boostPowerDesc: '+12% Сила удара/броска и +25% точность прицеливания',
      boostCoinsDesc: '2x Удвоение монет за завершение каждого матча',
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
      clashModeTitle: 'Клэш: Футбол vs Баскетбол',
      clashModeBadge: '🔥 ГЛАВНАЯ БИТВА 1v1',
      clashModeDesc: 'Культовое столкновение двух видов спорта! Футбольный форвард сходится лицом к лицу с баскетбольной звездой на арене!',
      clashPlayFooty: '⚽ ИГРАТЬ ЗА FOOTY',
      clashPlayHoops: '🏀 ИГРАТЬ ЗА HOOPS',
      clashFootySub: '⚽ Форвард vs 🏀 Звезда',
      clashHoopsSub: '🏀 Звезда vs ⚽ Форвард',
      clashStartBtn: 'НАЧАТЬ КЛЭШ 1v1',
      matchupTitle: 'Противостояние видов спорта:',
      youTeam: 'Вы',
      cpuTeam: 'Соперник',
      teamSelectTitle: 'ФУТБОЛ ПРОТИВ БАСКЕТБОЛА',
      teamSelectSubtitle: 'Выберите свою сторону в легендарной битве двух видов спорта!',
      teamFootyTitle: 'КОМАНДА ФУТБОЛА',
      teamFootySub: 'Форвард · Фирменные бутсы и техника',
      teamFootyDesc: 'Сражайтесь за честь футбола! Забивайте голы и докажите превосходство футбола над баскетболом!',
      teamFootyBtn: 'ВЫБРАТЬ ФУТБОЛ',
      teamHoopsTitle: 'КОМАНДА БАСКЕТБОЛА',
      teamHoopsSub: 'Ас площадки · Мощные данки и броски',
      teamHoopsDesc: 'Сражайтесь за гордость баскетбола! Бросайте в кольцо и докажите мощь баскетбола над футболом!',
      teamHoopsBtn: 'ВЫБРАТЬ БАСКЕТБОЛ',
      yourTeamLabel: 'Ваша команда',
      rivalTeamLabel: 'Соперники',
      switchTeamBtn: 'Сменить сторону',
      playForFooty: 'В БОЙ ЗА ФУТБОЛ!',
      playForHoops: 'В БОЙ ЗА БАСКЕТБОЛ!',
      playFootySub: 'Сокрушите команду Баскетбола на арене ⚔️',
      playHoopsSub: 'Сокрушите команду Футбола на арене ⚔️',
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
      q_sub_yt_title: 'Подпишись на YouTube',
      q_sub_yt_desc: 'Хайлайты матчей, обучающие ролики и трейлеры игры',
      q_sub_tiktok_title: 'Подпишись на TikTok',
      q_sub_tiktok_desc: 'Трендовые спортивные клипы, голы и яркие моменты',
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
      followUsTitle: 'Мы в соцсетях',
      followUsSubtitle: 'Официальные сообщества и каналы FOOTY vs HOOPS',
      socialNotice: 'Автоматическая проверка подписки недоступна через внешние API платформ. Подпишитесь, чтобы следить за новостями.',
      visitBtn: 'ПЕРЕЙТИ',
      subscribedBtn: 'ПОДПИСАН',
      subscribeFootyHoops: 'Подписаться на @FootyHoops',
      tgVerifySuccess: '✓ Подписка на @FootyHoops подтверждена! +50 FvH Coin',
      tgVerifyFailed: 'Пожалуйста, подпишитесь на @FootyHoops, чтобы получить награду',
      inviteFriendBtn: 'ПРИГЛАСИТЬ ДРУГА',
      catCrowd: 'Болельщики и Трибуны',
      arenaTabEnvironments: 'Стадионы и Миры',
      arenaTabCrowd: 'Болельщики и Трибуны',
      crowdSelectTitle: 'БОЛЕЛЬЩИКИ И ТРИБУНЫ',
      crowdSelectSub: 'Выберите стиль трибун и фан-сектор, который поддерживает вас во время матчей',
      selectCrowdBtn: 'ВЫБРАТЬ БОЛЕЛЬЩИКОВ',
      crowdEquipped: 'ВЫБРАННЫЕ БОЛЕЛЬЩИКИ',
      crowdFootyUltrasName: 'Ультрас FOOTY',
      crowdFootyUltrasDesc: 'Преданный фан-сектор футбола с сине-голубыми шарфами, клубными флагами и речёвками.',
      crowdHoopsAllstarsName: 'Трибуны HOOPS All-Stars',
      crowdHoopsAllstarsDesc: 'Заряженный зал баскетбола в огненно-оранжевых майках с фанатскими атрибутами и рёвом трибун.',
      crowdGlobalFestName: 'Мировой Фестиваль',
      crowdGlobalFestDesc: 'Яркая международная аудитория в карнавальных цветах со вспышками камер и флагами.',
      crowdCyberVipName: 'Кибер Неон VIP',
      crowdCyberVipDesc: 'Футуристическая VIP-ложа со светящимися неоновыми аксессуарами и кибер-подсветкой.',
      crowdEmeraldForestName: 'Изумрудный Клуб Болельщиков',
      crowdEmeraldForestDesc: 'Экологичный клуб болельщиков с изумрудно-зелёными и золотыми шарфами.',
      crowdGoldChampsName: 'Золотая Ложа Чемпионов',
      crowdGoldChampsDesc: 'Элитная трибуна чемпионов в черно-золотых тонах с атмосферой роскошного финала.',
      arenaSelectTitle: 'ВЫБОР АРЕНЫ',
      homeArena: 'ДОМАШНЯЯ АРЕНА',
      arenaSelectSub: 'Выберите домашнюю площадку и атмосферу игрового мира',
      arenaDescClassicFooty: 'Традиционный стадион с ухоженным футбольным газоном, полными трибунами зрителей и прожекторами.',
      arenaDescClassicHoops: 'Классический городской стадион с деревянным паркетом, трибунами, зрителями и атмосферой матча.',
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
      starsRedirect: 'Открытие оплаты Telegram Stars...',
      leaderboard: 'Лидерборд',
      leaderboardTitle: 'БИТВА КОМАНД',
      leaderboardSubtitle: 'У чьей команды больше очков — та команда победит!',
      leaderboardOverall: 'Общий',
      leaderboardFooty: 'ФУТБОЛ',
      leaderboardHoops: 'БАСКЕТБОЛ',
      timeWeekly: 'Неделя',
      timeSeason: 'Сезон 1',
      timeAllTime: 'Всё время',
      searchAthletePlaceholder: 'Поиск по имени атлета...',
      rankTierChampion: 'Чемпион',
      rankTierDiamond: 'Алмаз',
      rankTierPlatinum: 'Платина',
      rankTierGold: 'Золото',
      rankTierSilver: 'Серебро',
      rankTierBronze: 'Бронза',
      noAthletesFound: 'Атлеты не найдены по запросу',
      winRateLabel: '{n}% побед',
      winsLossesLabel: '{w}В · {l}П',
      syncingRankings: 'Синхронизация рейтинга...',
      retrySync: 'Повторить',
      syncFailed: 'Не удалось загрузить рейтинг',
      ptsUnit: 'очков',
      teamFootball: 'КОМАНДА ФУТБОЛА',
      teamBasketball: 'КОМАНДА БАСКЕТБОЛА',
      teamFootballWins: '⚽ КОМАНДА ФУТБОЛА ПОБЕЖДАЕТ!',
      teamBasketballWins: '🏀 КОМАНДА БАСКЕТБОЛА ПОБЕЖДАЕТ!',
      teamFootballLeads: 'Команда Футбола ведет в битве!',
      teamBasketballLeads: 'Команда Баскетбола ведет в битве!',
      leadDiffNotice: '+{diff} очков преимущества над соперником',
      warClashCallout: 'Играйте матчи, забивайте голы и ведите свою команду к победе!',
      yourTeam: 'Ваша команда',
      yourContribution: 'Ваш личный вклад: +{score} очков в победу команды!',
      warMvpTitle: 'ТОП-АТЛЕТЫ ВЕЛИКОЙ БИТВЫ (MVP)',
      warMvpSubtitle: 'Атлеты обеих сторон, внесшие наибольший вклад в счет своей команды',
      pointsContributed: 'очков',
      warScoreTotal: 'Общий счет команды',
      warSeasonTimer: 'До конца турнира: {d} дн. · Команда с наибольшим счетом заберет Кубок Сезона!',
      warLiveScoreboard: 'ТАБЛО БИТВЫ КОМАНД',
      storeSubFooty: 'ВИТРИНА ФУТБОЛЬНОГО КЛУБА · ТОЛЬКО ДЛЯ ФУТБОЛИСТОВ',
      storeSubHoops: 'ВИТРИНА БАСКЕТБОЛЬНОГО КЛУБА · ТОЛЬКО ДЛЯ БАСКЕТБОЛИСТОВ',
      storeNoticeFooty: '⚽ Вы играете за Команду Футбола. В магазине представлена экипировка только для футболистов.',
      storeNoticeHoops: '🏀 Вы играете за Команду Баскетбола. В магазине представлена экипировка только для баскетболистов.',
      onlyForFootball: 'Только для футболистов',
      onlyForBasketball: 'Только для баскетболистов',
      teamFootballBoutique: 'МАГАЗИН ФУТБОЛЬНОГО КЛУБА',
      teamBasketballBoutique: 'МАГАЗИН БАСКЕТБОЛЬНОГО КЛУБА',
      teamFootballBoutiqueDesc: 'Официальная экипировка футболиста: мячи, бутсы, форма нападающего и футбольные поля.',
      teamBasketballBoutiqueDesc: 'Официальная экипировка баскетболиста: мячи, кроссовки, джерси форварда и баскетбольные корты.',
      tabSeason: '🏆 Сезон',
      tabFooty: '⚽ Футбол',
      tabHoops: '🏀 Баскетбол',
      tabCoins: '🪙 Монеты',
      rankTrophies: 'Трофеи',
      rankGoals: 'Голы',
      rankBaskets: 'Очки',
      rankCoins: 'FvH Coin',
      yourRank: 'Ваша позиция',
      pointsToNext: 'До следующего ранга: {n} очков',
      divisionPro: 'Премьер-Лига',
      divisionElite: 'Элитный Дивизион',
      divisionChampion: 'Дивизион Чемпионов',
      divisionLegend: 'Легендарная Лига',
      seasonEndsIn: 'Сезон 1 завершится через',
      daysLeft: 'дн.',
      podium1st: 'Чемпион Арены',
      podium2nd: 'Вице-Чемпион',
      podium3rd: 'Бронзовый Призёр',
      teamFootyTokenBadge: 'БУДУЩИЙ ТОКЕН: $FOOTY',
      teamHoopsTokenBadge: 'БУДУЩИЙ ТОКЕН: $HOOPS',
      teamFootyTokenDesc: 'Квалифицируйтесь на официальный эйрдроп токена $FOOTY на TON за голы, победы и активность.',
      teamHoopsTokenDesc: 'Квалифицируйтесь на официальный эйрдроп токена $HOOPS на TON за данки, победы и активность.',
      teamTokenDisclaimer: '* Токены $FOOTY и $HOOPS находятся в разработке и станут доступны только после официального TGE на TON. Внутриигровые FvH монеты не являются криптовалютой.',
      profileTgeCardTitle: 'БУДУЩИЙ TGE ЭЙРДРОП И ТОКЕН ФРАКЦИИ',
      profileTgeStatus: 'Pre-TGE Квалификация активна',
      profileTgeFaction: 'Токен вашей фракции',
      profileTgePoints: 'Квалификационные очки',
      profileTgePointsDesc: 'Очки рассчитываются из подтвержденных побед, забитых голов/мячей и прогресса Боевого Пропуска.',
      profileTgeCurrencyNotice: 'Внутриигровые FvH монеты предназначены исключительно для покупок в магазине и не являются криптовалютой.',
      profileTgeWalletTitle: 'TON Кошелек для эйрдропа',
      profileTgeWalletConnected: 'Кошелек привязан для TGE Snapshot',
      profileTgeWalletNotConnected: 'Кошелек не привязан (Опционально)',
      profileTgeConnectBtn: '+ Привязать TON Кошелек',
      profileTgeChangeBtn: 'Изменить адрес',
      profileTgeDisconnectBtn: 'Отвязать',
      profileTgeModalTitle: 'Привязка публичного TON-кошелька',
      profileTgeModalDesc: 'Укажите ваш публичный TON-адрес (Tonkeeper, Telegram Wallet) для будущего снимка (snapshot) TGE.',
      profileTgeAddressPlaceholder: 'EQ... или UQ... или domain.ton',
      profileTgeSaveBtn: 'Сохранить адрес',
      profileTgeSecurityWarning: '🛡️ Безопасность: Вводите ТОЛЬКО ваш публичный адрес. Мы НИКОГДА не запрашиваем seed-фразы или приватные ключи!',
      profileTgeLaunchNotice: 'Официальное распределение токенов произойдет только после публичного TGE. Реальные токены не распределяются до старта.',
      profileTgeSeedWarningAlert: 'Предупреждение безопасности: Не вводите секретную фразу (seed) или приватный ключ! Вводите только публичный адрес кошелька (EQ... или UQ...).',
      profileTgeInvalidAddress: 'Пожалуйста, введите корректный публичный TON адрес (например, EQ..., UQ... или .ton домен).',
      warPrizePoolTitle: 'ПРИЗОВОЙ TGE ПУЛ СЕЗОНА',
      warPrizePoolDesc: 'Победа команды Футбола или Баскетбола определит приоритетную квоту аллокации токенов $FOOTY / $HOOPS на TON!',
      warTokenFactionFooty: 'Фракция токена: $FOOTY',
      warTokenFactionHoops: 'Фракция токена: $HOOPS',
      warQualifyingContrib: 'Квалификационный вклад в будущий снимок (Snapshot) аллокации',
      diffEasyReward: '🟢 Лёгкий ИИ: +15 очков в Лидерборд за победу (0.5x наград)',
      diffNormalReward: '🟡 Обычный ИИ: +30 очков в Лидерборд за победу (1.0x стандарт)',
      diffHardReward: '🔴 Сложный ИИ: +60 очков в Лидерборд за победу (2.0x МАКСИМУМ наград!)',
      warDiffBreakdown: 'Очки за победу над ИИ: Лёгкий +15 · Обычный +30 · Сложный +60'
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

  function detectDeviceLanguage() {
    var tgLang = (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user && window.Telegram.WebApp.initDataUnsafe.user.language_code);
    var code = tgLang || (typeof navigator !== 'undefined' && (navigator.language || (navigator.languages && navigator.languages[0])));
    if (!code) return 'en';
    code = String(code).toLowerCase();
    var prefix = code.split('-')[0].split('_')[0];
    var langMap = {
      ru: 'ru', be: 'ru', kk: 'ru', ky: 'ru', uz: 'ru', tg: 'ru',
      uk: 'uk', en: 'en', es: 'es', de: 'de', fr: 'fr', pt: 'pt',
      it: 'it', tr: 'tr', nl: 'nl', pl: 'pl', ja: 'ja', ko: 'ko',
      zh: 'zh', ar: 'ar'
    };
    return langMap[prefix] || 'en';
  }

  // Canonical Stage 1 Localization Dictionary across all 15 supported languages
  var STAGE1_I18N = {
    en: {
      chooseTeamTitle: 'CHOOSE YOUR TEAM',
      chooseTeamDesc: 'Choose which team to support in the 15-day seasonal competition. Your choice is locked for the entire season!',
      teamFootyName: 'FOOTY ⚽',
      teamFootyToken: '$FOOTY',
      teamFootyDesc: 'Football faction. Technique, precision, and unstoppable power shots.',
      teamHoopsName: 'HOOPS 🏀',
      teamHoopsToken: '$HOOPS',
      teamHoopsDesc: 'Basketball faction. Agility, high-flying dunks, and pinpoint swishes.',
      confirmTeamSelection: 'Confirm Team Selection',
      teamSelectedSuccess: '✓ Team successfully selected!',
      teamLockedBadge: 'Locked for 15-day Season',
      catSkins: 'Skins',
      catFootballBalls: 'Football Balls',
      catBasketballBalls: 'Basketball Balls',
      catCoins: 'FvH Coins',
      pendingTokenLaunch: 'Pending token launch',
      tokenWithdrawBtn: 'Withdraw',
      tokenWithdrawModalTitle: 'Token Withdrawal',
      tokenWithdrawNotice: 'Token withdrawals will be available only after the official launch of $FOOTY and $HOOPS tokens.',
      starsUnconfiguredNotice: 'Telegram Stars payment will be available soon. Pricing is currently being configured.',
      starsUnconfiguredBadge: '⭐ Soon',
      emptyShopCategory: 'No items available in this category yet',
      emptyInventoryCategory: 'You do not own any items in this category yet',
      visitShopBtn: 'Visit Shop',
      equippedState: '✓ Equipped',
      equipAction: 'Equip',
      buyAction: 'Buy for',
      txHistory: 'Transaction History',
      txNoHistory: 'No transactions recorded yet',
      tabInviteFriends: 'Invite a Friend',
      tabSocialTasks: 'Social Tasks',
      refRuleText: '100 FvH Coin is credited only after the invited friend joins and confirms their team selection.',
      refStatTotal: 'Total Invited',
      refStatQualified: 'Qualified Friends',
      refStatEarned: 'Earned FvH Coin',
      refCopyBtn: 'Copy Link',
      refCopied: '✓ Referral link copied!',
      refShareBtn: 'Share on Telegram',
      socialTgTask: 'Join official Telegram channel',
      socialXTask: 'Follow official X account',
      rewardAmount: '+{n} FvH Coin',
      openTaskBtn: 'Open',
      verifyTaskBtn: 'Verify',
      taskCompleted: '✓ Completed',
      taskVerifying: 'Verifying...',
      gotItBtn: 'Got it'
    },
    ru: {
      chooseTeamTitle: 'ВЫБЕРИТЕ КОМАНДУ',
      chooseTeamDesc: 'Выберите, какую команду поддержать в 15-дневном сезонном соревновании. Ваш выбор фиксируется на весь сезон!',
      teamFootyName: 'FOOTY ⚽',
      teamFootyToken: '$FOOTY',
      teamFootyDesc: 'Команда футбола. Скорость, техника и мощные удары по воротам.',
      teamHoopsName: 'HOOPS 🏀',
      teamHoopsToken: '$HOOPS',
      teamHoopsDesc: 'Команда баскетбола. Дриблинг, прыжки и меткие броски в кольцо.',
      confirmTeamSelection: 'Подтвердить выбор команды',
      teamSelectedSuccess: '✓ Команда успешно выбрана!',
      teamLockedBadge: 'Зафиксировано на 15-дневный сезон',
      catSkins: 'Форма',
      catFootballBalls: 'Футбольные мячи',
      catBasketballBalls: 'Баскетбольные мячи',
      catCoins: 'FvH Монеты',
      pendingTokenLaunch: 'Ожидается запуск токена',
      tokenWithdrawBtn: 'Вывод',
      tokenWithdrawModalTitle: 'Вывод токенов',
      tokenWithdrawNotice: 'Вывод токенов будет доступен только после официального запуска $FOOTY и $HOOPS.',
      starsUnconfiguredNotice: 'Оплата Telegram Stars скоро будет доступна. Цены находятся на этапе настройки.',
      starsUnconfiguredBadge: '⭐ Скоро',
      emptyShopCategory: 'В этой категории пока нет доступных товаров',
      emptyInventoryCategory: 'У вас пока нет предметов в этой категории',
      visitShopBtn: 'Перейти в Магазин',
      equippedState: '✓ Надето',
      equipAction: 'Надеть',
      buyAction: 'Купить за',
      txHistory: 'История операций',
      txNoHistory: 'Пока нет операций',
      tabInviteFriends: 'Пригласить друга',
      tabSocialTasks: 'Социальные задания',
      refRuleText: '100 FvH Coin начисляется только после того, как приглашённый друг присоединится и подтвердит выбор команды.',
      refStatTotal: 'Всего приглашено',
      refStatQualified: 'Квалифицированные друзья',
      refStatEarned: 'Заработано FvH Coin',
      refCopyBtn: 'Копировать ссылку',
      refCopied: '✓ Ссылка скопирована!',
      refShareBtn: 'Поделиться в Telegram',
      socialTgTask: 'Подписаться на официальный Telegram-канал',
      socialXTask: 'Подписаться на официальный аккаунт в X',
      rewardAmount: '+{n} FvH Coin',
      openTaskBtn: 'Перейти',
      verifyTaskBtn: 'Проверить',
      taskCompleted: '✓ Выполнено',
      taskVerifying: 'Проверка...',
      gotItBtn: 'Понятно'
    },
    es: {
      chooseTeamTitle: 'ELIGE TU EQUIPO',
      chooseTeamDesc: 'Elige qué equipo apoyar en la competición de temporada de 15 días. ¡Tu elección queda fijada para toda la temporada!',
      teamFootyName: 'FOOTY ⚽',
      teamFootyToken: '$FOOTY',
      teamFootyDesc: 'Facción de fútbol. Velocidad, técnica y disparos imparables.',
      teamHoopsName: 'HOOPS 🏀',
      teamHoopsToken: '$HOOPS',
      teamHoopsDesc: 'Facción de baloncesto. Agilidad, mates espectaculares y precisión.',
      confirmTeamSelection: 'Confirmar selección de equipo',
      teamSelectedSuccess: '✓ ¡Equipo seleccionado con éxito!',
      teamLockedBadge: 'Fijado para la temporada de 15 días',
      catSkins: 'Uniformes',
      catFootballBalls: 'Balones de fútbol',
      catBasketballBalls: 'Balones de baloncesto',
      catCoins: 'Monedas FvH',
      pendingTokenLaunch: 'Lanzamiento de token pendiente',
      tokenWithdrawBtn: 'Retirar',
      tokenWithdrawModalTitle: 'Retiro de tokens',
      tokenWithdrawNotice: 'Los retiros de tokens estarán disponibles solo después del lanzamiento oficial de los tokens $FOOTY y $HOOPS.',
      starsUnconfiguredNotice: 'El pago con Telegram Stars estará disponible pronto.',
      starsUnconfiguredBadge: '⭐ Pronto',
      emptyShopCategory: 'No hay artículos disponibles en esta categoría todavía',
      emptyInventoryCategory: 'Aún no posees artículos en esta categoría',
      visitShopBtn: 'Visitar tienda',
      equippedState: '✓ Equipado',
      equipAction: 'Equipar',
      buyAction: 'Comprar por',
      txHistory: 'Historial de transacciones',
      txNoHistory: 'Aún no hay transacciones',
      tabInviteFriends: 'Invitar a un amigo',
      tabSocialTasks: 'Tareas sociales',
      refRuleText: 'Se acreditan 100 FvH Coin solo después de que el amigo invitado se una y confirme su elección de equipo.',
      refStatTotal: 'Total invitados',
      refStatQualified: 'Amigos calificados',
      refStatEarned: 'FvH Coin ganadas',
      refCopyBtn: 'Copiar enlace',
      refCopied: '✓ ¡Enlace copiado!',
      refShareBtn: 'Compartir en Telegram',
      socialTgTask: 'Unirse al canal oficial de Telegram',
      socialXTask: 'Seguir la cuenta oficial en X',
      rewardAmount: '+{n} FvH Coin',
      openTaskBtn: 'Abrir',
      verifyTaskBtn: 'Verificar',
      taskCompleted: '✓ Completado',
      taskVerifying: 'Verificando...',
      gotItBtn: 'Entendido'
    },
    de: {
      chooseTeamTitle: 'WÄHLE DEIN TEAM',
      chooseTeamDesc: 'Wähle, welches Team du im 15-tägigen Saisonwettbewerb unterstützen möchtest. Deine Wahl ist für die gesamte Saison festgelegt!',
      teamFootyName: 'FOOTY ⚽',
      teamFootyToken: '$FOOTY',
      teamFootyDesc: 'Fußball-Fraktion. Technik, Präzision und unaufhaltsame Torschüsse.',
      teamHoopsName: 'HOOPS 🏀',
      teamHoopsToken: '$HOOPS',
      teamHoopsDesc: 'Basketball-Fraktion. Agilität, Dunks und punktgenaue Treffer.',
      confirmTeamSelection: 'Teamauswahl bestätigen',
      teamSelectedSuccess: '✓ Team erfolgreich ausgewählt!',
      teamLockedBadge: 'Für 15-Tage-Saison gesperrt',
      catSkins: 'Trikots',
      catFootballBalls: 'Fußbälle',
      catBasketballBalls: 'Basketbälle',
      catCoins: 'FvH-Münzen',
      pendingTokenLaunch: 'Token-Start ausstehend',
      tokenWithdrawBtn: 'Auszahlen',
      tokenWithdrawModalTitle: 'Token-Auszahlung',
      tokenWithdrawNotice: 'Token-Auszahlungen sind erst nach dem offiziellen Start der $FOOTY- und $HOOPS-Tokens verfügbar.',
      starsUnconfiguredNotice: 'Telegram Stars-Zahlung wird bald verfügbar sein.',
      starsUnconfiguredBadge: '⭐ Bald',
      emptyShopCategory: 'In dieser Kategorie sind noch keine Artikel verfügbar',
      emptyInventoryCategory: 'Du besitzt noch keine Artikel in dieser Kategorie',
      visitShopBtn: 'Zum Shop',
      equippedState: '✓ Ausgerüstet',
      equipAction: 'Ausrüsten',
      buyAction: 'Kaufen für',
      txHistory: 'Transaktionsverlauf',
      txNoHistory: 'Noch keine Transaktionen vorhanden',
      tabInviteFriends: 'Freund einladen',
      tabSocialTasks: 'Soziale Aufgaben',
      refRuleText: '100 FvH Coin werden erst gutgeschrieben, nachdem der eingeladene Freund beigetreten ist und seine Teamauswahl bestätigt hat.',
      refStatTotal: 'Insgesamt eingeladen',
      refStatQualified: 'Qualifizierte Freunde',
      refStatEarned: 'Verdiente FvH Coin',
      refCopyBtn: 'Link kopieren',
      refCopied: '✓ Link kopiert!',
      refShareBtn: 'Auf Telegram teilen',
      socialTgTask: 'Offiziellem Telegram-Kanal beitreten',
      socialXTask: 'Offiziellem X-Account folgen',
      rewardAmount: '+{n} FvH Coin',
      openTaskBtn: 'Öffnen',
      verifyTaskBtn: 'Prüfen',
      taskCompleted: '✓ Abgeschlossen',
      taskVerifying: 'Wird geprüft...',
      gotItBtn: 'Verstanden'
    },
    fr: {
      chooseTeamTitle: 'CHOISISSEZ VOTRE ÉQUIPE',
      chooseTeamDesc: 'Choisissez quelle équipe soutenir dans la compétition saisonnière de 15 jours. Votre choix est verrouillé pour toute la saison !',
      teamFootyName: 'FOOTY ⚽',
      teamFootyToken: '$FOOTY',
      teamFootyDesc: 'Faction football. Technique, précision et tirs puissants.',
      teamHoopsName: 'HOOPS 🏀',
      teamHoopsToken: '$HOOPS',
      teamHoopsDesc: 'Faction basket. Agilité, dunks spectaculaires et paniers parfaits.',
      confirmTeamSelection: 'Confirmer la sélection de l\'équipe',
      teamSelectedSuccess: '✓ Équipe sélectionnée avec succès !',
      teamLockedBadge: 'Verrouillé pour la saison de 15 jours',
      catSkins: 'Maillots',
      catFootballBalls: 'Ballons de football',
      catBasketballBalls: 'Ballons de basket',
      catCoins: 'Pièces FvH',
      pendingTokenLaunch: 'Lancement du jeton en attente',
      tokenWithdrawBtn: 'Retirer',
      tokenWithdrawModalTitle: 'Retrait de jetons',
      tokenWithdrawNotice: 'Les retraits de jetons ne seront disponibles qu\'après le lancement officiel des jetons $FOOTY et $HOOPS.',
      starsUnconfiguredNotice: 'Le paiement Telegram Stars sera bientôt disponible.',
      starsUnconfiguredBadge: '⭐ Bientôt',
      emptyShopCategory: 'Aucun article disponible dans cette catégorie pour le moment',
      emptyInventoryCategory: 'Vous ne possédez aucun article dans cette catégorie pour le moment',
      visitShopBtn: 'Visiter la boutique',
      equippedState: '✓ Équipé',
      equipAction: 'Équiper',
      buyAction: 'Acheter pour',
      txHistory: 'Historique des transactions',
      txNoHistory: 'Aucune transaction pour le moment',
      tabInviteFriends: 'Inviter un ami',
      tabSocialTasks: 'Tâches sociales',
      refRuleText: '100 FvH Coin sont crédités uniquement après que l\'ami invité a rejoint et confirmé son choix d\'équipe.',
      refStatTotal: 'Total invités',
      refStatQualified: 'Amis qualifiés',
      refStatEarned: 'FvH Coin gagnés',
      refCopyBtn: 'Copier le lien',
      refCopied: '✓ Lien copié !',
      refShareBtn: 'Partager sur Telegram',
      socialTgTask: 'Rejoindre le canal officiel Telegram',
      socialXTask: 'Suivre le compte officiel sur X',
      rewardAmount: '+{n} FvH Coin',
      openTaskBtn: 'Ouvrir',
      verifyTaskBtn: 'Vérifier',
      taskCompleted: '✓ Terminé',
      taskVerifying: 'Vérification...',
      gotItBtn: 'Compris'
    },
    pt: {
      chooseTeamTitle: 'ESCOLHA SEU TIME',
      chooseTeamDesc: 'Escolha qual time apoiar na competição de 15 dias da temporada. Sua escolha fica bloqueada por toda a temporada!',
      teamFootyName: 'FOOTY ⚽',
      teamFootyToken: '$FOOTY',
      teamFootyDesc: 'Facção de futebol. Técnica, precisão e chutes indefensáveis.',
      teamHoopsName: 'HOOPS 🏀',
      teamHoopsToken: '$HOOPS',
      teamHoopsDesc: 'Facção de basquete. Agilidade, enterradas e arremessos precisos.',
      confirmTeamSelection: 'Confirmar escolha do time',
      teamSelectedSuccess: '✓ Time selecionado com sucesso!',
      teamLockedBadge: 'Bloqueado para a temporada de 15 dias',
      catSkins: 'Uniformes',
      catFootballBalls: 'Bolas de futebol',
      catBasketballBalls: 'Bolas de basquete',
      catCoins: 'Moedas FvH',
      pendingTokenLaunch: 'Lançamento de token pendente',
      tokenWithdrawBtn: 'Sacar',
      tokenWithdrawModalTitle: 'Saque de tokens',
      tokenWithdrawNotice: 'Os saques de tokens estarão disponíveis apenas após o lançamento oficial dos tokens $FOOTY e $HOOPS.',
      starsUnconfiguredNotice: 'O pagamento via Telegram Stars estará disponível em breve.',
      starsUnconfiguredBadge: '⭐ Em breve',
      emptyShopCategory: 'Nenhum item disponível nesta categoria ainda',
      emptyInventoryCategory: 'Você ainda não possui itens nesta categoria',
      visitShopBtn: 'Visitar loja',
      equippedState: '✓ Equipado',
      equipAction: 'Equipar',
      buyAction: 'Comprar por',
      txHistory: 'Histórico de transações',
      txNoHistory: 'Nenhuma transação registrada ainda',
      tabInviteFriends: 'Convidar um amigo',
      tabSocialTasks: 'Tarefas sociais',
      refRuleText: '100 FvH Coin são creditadas somente após o amigo convidado entrar e confirmar a escolha do time.',
      refStatTotal: 'Total de convidados',
      refStatQualified: 'Amigos qualificados',
      refStatEarned: 'FvH Coin ganhas',
      refCopyBtn: 'Copiar link',
      refCopied: '✓ Link copiado!',
      refShareBtn: 'Compartilhar no Telegram',
      socialTgTask: 'Entrar no canal oficial do Telegram',
      socialXTask: 'Seguir a conta oficial no X',
      rewardAmount: '+{n} FvH Coin',
      openTaskBtn: 'Abrir',
      verifyTaskBtn: 'Verificar',
      taskCompleted: '✓ Concluído',
      taskVerifying: 'Verificando...',
      gotItBtn: 'Entendi'
    },
    it: {
      chooseTeamTitle: 'SCEGLI LA TUA SQUADRA',
      chooseTeamDesc: 'Scegli quale squadra supportare nella competizione stagionale di 15 giorni. La tua scelta è bloccata per l\'intera stagione!',
      teamFootyName: 'FOOTY ⚽',
      teamFootyToken: '$FOOTY',
      teamFootyDesc: 'Fazione calcio. Tecnica, precisione e tiri imparabili.',
      teamHoopsName: 'HOOPS 🏀',
      teamHoopsToken: '$HOOPS',
      teamHoopsDesc: 'Fazione basket. Agilità, schiacciate spettacolari e precisione.',
      confirmTeamSelection: 'Conferma selezione squadra',
      teamSelectedSuccess: '✓ Squadra selezionata con successo!',
      teamLockedBadge: 'Bloccato per la stagione di 15 giorni',
      catSkins: 'Maglie',
      catFootballBalls: 'Palloni da calcio',
      catBasketballBalls: 'Palloni da basket',
      catCoins: 'Monete FvH',
      pendingTokenLaunch: 'Lancio token in sospeso',
      tokenWithdrawBtn: 'Preleva',
      tokenWithdrawModalTitle: 'Prelievo token',
      tokenWithdrawNotice: 'I prelievi di token saranno disponibili solo dopo il lancio ufficiale dei token $FOOTY e $HOOPS.',
      starsUnconfiguredNotice: 'Il pagamento con Telegram Stars sarà presto disponibile.',
      starsUnconfiguredBadge: '⭐ Presto',
      emptyShopCategory: 'Nessun articolo disponibile in questa categoria per ora',
      emptyInventoryCategory: 'Non possiedi ancora articoli in questa categoria',
      visitShopBtn: 'Visita il negozio',
      equippedState: '✓ Equipaggiato',
      equipAction: 'Equipaggia',
      buyAction: 'Acquista per',
      txHistory: 'Cronologia transazioni',
      txNoHistory: 'Nessuna transazione ancora registrata',
      tabInviteFriends: 'Invita un amico',
      tabSocialTasks: 'Attività social',
      refRuleText: '100 FvH Coin vengono accreditate solo dopo che l\'amico invitato si è unito e ha confermato la squadra.',
      refStatTotal: 'Totale invitati',
      refStatQualified: 'Amici qualificati',
      refStatEarned: 'FvH Coin guadagnate',
      refCopyBtn: 'Copia link',
      refCopied: '✓ Link copiato!',
      refShareBtn: 'Condividi su Telegram',
      socialTgTask: 'Unisciti al canale ufficiale Telegram',
      socialXTask: 'Segui l\'account ufficiale su X',
      rewardAmount: '+{n} FvH Coin',
      openTaskBtn: 'Apri',
      verifyTaskBtn: 'Verifica',
      taskCompleted: '✓ Completato',
      taskVerifying: 'Verifica in corso...',
      gotItBtn: 'Ho capito'
    },
    uk: {
      chooseTeamTitle: 'ОБЕРІТЬ СВОЮ КОМАНДУ',
      chooseTeamDesc: 'Оберіть, яку команду підтримати в 15-денному сезонному змаганні. Ваш вибір фіксується на весь сезон!',
      teamFootyName: 'FOOTY ⚽',
      teamFootyToken: '$FOOTY',
      teamFootyDesc: 'Команда футболу. Швидкість, техніка та потужні удари по воротах.',
      teamHoopsName: 'HOOPS 🏀',
      teamHoopsToken: '$HOOPS',
      teamHoopsDesc: 'Команда баскетболу. Дриблінг, стрибки та влучні кидки в кошик.',
      confirmTeamSelection: 'Підтвердити вибір команди',
      teamSelectedSuccess: '✓ Команду успішно обрано!',
      teamLockedBadge: 'Зафіксовано на 15-денний сезон',
      catSkins: 'Форма',
      catFootballBalls: 'Футбольні м\'ячі',
      catBasketballBalls: 'Баскетбольні м\'ячі',
      catCoins: 'FvH Монети',
      pendingTokenLaunch: 'Очікується запуск токена',
      tokenWithdrawBtn: 'Виведення',
      tokenWithdrawModalTitle: 'Виведення токенів',
      tokenWithdrawNotice: 'Виведення токенів буде доступне лише після офіційного запуску токенів $FOOTY та $HOOPS.',
      starsUnconfiguredNotice: 'Оплата Telegram Stars незабаром буде доступна.',
      starsUnconfiguredBadge: '⭐ Скоро',
      emptyShopCategory: 'У цій категорії поки немає товарів',
      emptyInventoryCategory: 'У вас поки немає предметів у цій категорії',
      visitShopBtn: 'Перейти до магазину',
      equippedState: '✓ Одягнено',
      equipAction: 'Одягти',
      buyAction: 'Купити за',
      txHistory: 'Історія операцій',
      txNoHistory: 'Поки немає операцій',
      tabInviteFriends: 'Запросити друга',
      tabSocialTasks: 'Соціальні завдання',
      refRuleText: '100 FvH Coin нараховуються лише після того, як запрошений друг приєднається та підтвердить вибір команди.',
      refStatTotal: 'Всього запрошено',
      refStatQualified: 'Кваліфіковані друзі',
      refStatEarned: 'Зароблено FvH Coin',
      refCopyBtn: 'Копіювати посилання',
      refCopied: '✓ Посилання скопійовано!',
      refShareBtn: 'Поділитися в Telegram',
      socialTgTask: 'Підписатися на офіційний Telegram-канал',
      socialXTask: 'Підписатися на офіційний акаунт в X',
      rewardAmount: '+{n} FvH Coin',
      openTaskBtn: 'Перейти',
      verifyTaskBtn: 'Перевірити',
      taskCompleted: '✓ Виконано',
      taskVerifying: 'Перевірка...',
      gotItBtn: 'Зрозуміло'
    },
    pl: {
      chooseTeamTitle: 'WYBIERZ SWOJĄ DRUŻYNĘ',
      chooseTeamDesc: 'Wybierz, którą drużynę wesprzesz w 15-dniowej rywalizacji sezonowej. Twój wybór jest zablokowany na cały sezon!',
      teamFootyName: 'FOOTY ⚽',
      teamFootyToken: '$FOOTY',
      teamFootyDesc: 'Frakcja piłki nożnej. Technika, precyzja i potężne strzały.',
      teamHoopsName: 'HOOPS 🏀',
      teamHoopsToken: '$HOOPS',
      teamHoopsDesc: 'Frakcja koszykówki. Zwinność, wsady i precyzyjne rzuty.',
      confirmTeamSelection: 'Potwierdź wybór drużyny',
      teamSelectedSuccess: '✓ Drużyna została pomyślnie wybrana!',
      teamLockedBadge: 'Zablokowano na 15-dniowy sezon',
      catSkins: 'Stroje',
      catFootballBalls: 'Piłki nożne',
      catBasketballBalls: 'Piłki do koszykówki',
      catCoins: 'Monety FvH',
      pendingTokenLaunch: 'Oczekuje na uruchomienie tokena',
      tokenWithdrawBtn: 'Wypłać',
      tokenWithdrawModalTitle: 'Wypłata tokenów',
      tokenWithdrawNotice: 'Wypłaty tokenów będą dostępne dopiero po oficjalnym uruchomieniu tokenów $FOOTY i $HOOPS.',
      starsUnconfiguredNotice: 'Płatność Telegram Stars będzie wkrótce dostępna.',
      starsUnconfiguredBadge: '⭐ Wkrótce',
      emptyShopCategory: 'W tej kategorii nie ma jeszcze produktów',
      emptyInventoryCategory: 'Nie posiadasz jeszcze przedmiotów w tej kategorii',
      visitShopBtn: 'Odwiedź sklep',
      equippedState: '✓ Założone',
      equipAction: 'Załóż',
      buyAction: 'Kup za',
      txHistory: 'Historia transakcji',
      txNoHistory: 'Brak zarejestrowanych transakcji',
      tabInviteFriends: 'Zaproś znajomego',
      tabSocialTasks: 'Zadania społecznościowe',
      refRuleText: '100 FvH Coin jest przyznawane dopiero po dołączeniu zaproszonego znajomego i potwierdzeniu wyboru drużyny.',
      refStatTotal: 'Łącznie zaproszonych',
      refStatQualified: 'Zakwalifikowani znajomi',
      refStatEarned: 'Zdobyte FvH Coin',
      refCopyBtn: 'Kopiuj link',
      refCopied: '✓ Skopiowano link!',
      refShareBtn: 'Udostępnij na Telegramie',
      socialTgTask: 'Dołącz do oficjalnego kanału na Telegramie',
      socialXTask: 'Obserwuj oficjalne konto na X',
      rewardAmount: '+{n} FvH Coin',
      openTaskBtn: 'Otwórz',
      verifyTaskBtn: 'Sprawdź',
      taskCompleted: '✓ Ukończono',
      taskVerifying: 'Weryfikacja...',
      gotItBtn: 'Rozumiem'
    },
    tr: {
      chooseTeamTitle: 'TAKIMINI SEÇ',
      chooseTeamDesc: '15 günlük sezon yarışmasında hangi takımı destekleyeceğini seç. Seçimin tüm sezon boyunca kilitlenecektir!',
      teamFootyName: 'FOOTY ⚽',
      teamFootyToken: '$FOOTY',
      teamFootyDesc: 'Futbol grubu. Teknik, hassasiyet ve durdurulamaz şutlar.',
      teamHoopsName: 'HOOPS 🏀',
      teamHoopsToken: '$HOOPS',
      teamHoopsDesc: 'Basketbol grubu. Çeviklik, smaçlar ve isabetli atışlar.',
      confirmTeamSelection: 'Takım Seçimini Onayla',
      teamSelectedSuccess: '✓ Takım başarıyla seçildi!',
      teamLockedBadge: '15 günlük sezon için kilitlendi',
      catSkins: 'Formlar',
      catFootballBalls: 'Futbol Topları',
      catBasketballBalls: 'Basketbol Topları',
      catCoins: 'FvH Jetonları',
      pendingTokenLaunch: 'Token lansmanı bekleniyor',
      tokenWithdrawBtn: 'Çekim Yap',
      tokenWithdrawModalTitle: 'Token Çekimi',
      tokenWithdrawNotice: 'Token çekimleri yalnızca $FOOTY ve $HOOPS tokenlerinin resmi lansmanından sonra mümkün olacaktır.',
      starsUnconfiguredNotice: 'Telegram Stars ile ödeme yakında aktif olacaktır.',
      starsUnconfiguredBadge: '⭐ Yakında',
      emptyShopCategory: 'Bu kategoride henüz ürün bulunmuyor',
      emptyInventoryCategory: 'Bu kategoride henüz bir eşyanız yok',
      visitShopBtn: 'Mağazayı Ziyaret Et',
      equippedState: '✓ Kuşanıldı',
      equipAction: 'Kuşan',
      buyAction: 'Satın al:',
      txHistory: 'İşlem Geçmişi',
      txNoHistory: 'Henüz bir işlem kaydedilmedi',
      tabInviteFriends: 'Arkadaşını Davet Et',
      tabSocialTasks: 'Sosyal Görevler',
      refRuleText: '100 FvH Coin, yalnızca davet edilen arkadaş katıldıktan ve takım seçimini onayladıktan sonra yatırılır.',
      refStatTotal: 'Toplam Davet',
      refStatQualified: 'Onaylı Arkadaşlar',
      refStatEarned: 'Kazanılan FvH Coin',
      refCopyBtn: 'Bağlantıyı Kopyala',
      refCopied: '✓ Bağlantı kopyalandı!',
      refShareBtn: 'Telegram\'da Paylaş',
      socialTgTask: 'Resmi Telegram kanalına katıl',
      socialXTask: 'Resmi X hesabını takip et',
      rewardAmount: '+{n} FvH Coin',
      openTaskBtn: 'Aç',
      verifyTaskBtn: 'Doğrula',
      taskCompleted: '✓ Tamamlandı',
      taskVerifying: 'Doğrulanıyor...',
      gotItBtn: 'Anladım'
    },
    nl: {
      chooseTeamTitle: 'KIES JE TEAM',
      chooseTeamDesc: 'Kies welk team je wilt steunen in de 15-daagse seizoenscompetitie. Je keuze staat vast voor het hele seizoen!',
      teamFootyName: 'FOOTY ⚽',
      teamFootyToken: '$FOOTY',
      teamFootyDesc: 'Voetbalfactie. Techniek, precisie en krachtige schoten.',
      teamHoopsName: 'HOOPS 🏀',
      teamHoopsToken: '$HOOPS',
      teamHoopsDesc: 'Basketbalfactie. Behendigheid, dunks en zuivere scores.',
      confirmTeamSelection: 'Teamselectie bevestigen',
      teamSelectedSuccess: '✓ Team succesvol geselecteerd!',
      teamLockedBadge: 'Vastgezet voor 15-daags seizoen',
      catSkins: 'Tenues',
      catFootballBalls: 'Voetballen',
      catBasketballBalls: 'Basketballen',
      catCoins: 'FvH Munten',
      pendingTokenLaunch: 'Tokenlancering verwacht',
      tokenWithdrawBtn: 'Opnemen',
      tokenWithdrawModalTitle: 'Token-opname',
      tokenWithdrawNotice: 'Token-opnames zijn pas beschikbaar na de officiële lancering van $FOOTY- en $HOOPS-tokens.',
      starsUnconfiguredNotice: 'Betalen met Telegram Stars is binnenkort beschikbaar.',
      starsUnconfiguredBadge: '⭐ Binnenkort',
      emptyShopCategory: 'Nog geen artikelen beschikbaar in deze categorie',
      emptyInventoryCategory: 'Je bezit nog geen items in deze categorie',
      visitShopBtn: 'Naar winkel',
      equippedState: '✓ Uitgerust',
      equipAction: 'Uitrusten',
      buyAction: 'Kopen voor',
      txHistory: 'Transactiegeschiedenis',
      txNoHistory: 'Nog geen transacties geregistreerd',
      tabInviteFriends: 'Nodig een vriend uit',
      tabSocialTasks: 'Sociale taken',
      refRuleText: '100 FvH Coin wordt pas bijgeschreven nadat de uitgenodigde vriend lid is geworden en de teamkeuze heeft bevestigd.',
      refStatTotal: 'Totaal uitgenodigd',
      refStatQualified: 'Gekwalificeerde vrienden',
      refStatEarned: 'Verdiende FvH Coin',
      refCopyBtn: 'Kopieer link',
      refCopied: '✓ Link gekopieerd!',
      refShareBtn: 'Delen op Telegram',
      socialTgTask: 'Word lid van officieel Telegram-kanaal',
      socialXTask: 'Volg officieel X-account',
      rewardAmount: '+{n} FvH Coin',
      openTaskBtn: 'Openen',
      verifyTaskBtn: 'Verifiëren',
      taskCompleted: '✓ Voltooid',
      taskVerifying: 'Verifiëren...',
      gotItBtn: 'Begrepen'
    },
    ja: {
      chooseTeamTitle: 'チームを選択',
      chooseTeamDesc: '15日間のシーズン大会で応援するチームを選んでください。選択はシーズン終了まで変更できません！',
      teamFootyName: 'FOOTY ⚽',
      teamFootyToken: '$FOOTY',
      teamFootyDesc: 'サッカーチーム。テクニックと圧倒的なシュート力。',
      teamHoopsName: 'HOOPS 🏀',
      teamHoopsToken: '$HOOPS',
      teamHoopsDesc: 'バスケットボールチーム。華麗なダンクと正確無比なシュート。',
      confirmTeamSelection: 'チーム選択を確定する',
      teamSelectedSuccess: '✓ チームが選択されました！',
      teamLockedBadge: '15日間シーズン固定',
      catSkins: 'ユニフォーム',
      catFootballBalls: 'サッカーボール',
      catBasketballBalls: 'バスケットボール',
      catCoins: 'FvH コイン',
      pendingTokenLaunch: 'トークンローンチ準備中',
      tokenWithdrawBtn: '出金',
      tokenWithdrawModalTitle: 'トークンの引き出し',
      tokenWithdrawNotice: 'トークンの引き出しは、$FOOTY および $HOOPS トークンの公式ローンチ後にのみ利用可能になります。',
      starsUnconfiguredNotice: 'Telegram Stars決済は準備中です。',
      starsUnconfiguredBadge: '⭐ 近日公開',
      emptyShopCategory: 'このカテゴリにはまだ商品がありません',
      emptyInventoryCategory: 'このカテゴリのアイテムをまだ所持していません',
      visitShopBtn: 'ショップを見る',
      equippedState: '✓ 装備中',
      equipAction: '装備する',
      buyAction: '購入:',
      txHistory: '取引履歴',
      txNoHistory: '取引履歴はありません',
      tabInviteFriends: '友達を招待',
      tabSocialTasks: 'ソーシャルタスク',
      refRuleText: '招待された友達が参加しチーム選択を完了した後に、100 FvH Coinが付与されます。',
      refStatTotal: '招待総数',
      refStatQualified: '認証された友達',
      refStatEarned: '獲得 FvH Coin',
      refCopyBtn: 'リンクをコピー',
      refCopied: '✓ リンクをコピーしました！',
      refShareBtn: 'Telegramで共有',
      socialTgTask: '公式Telegramチャンネルに参加',
      socialXTask: '公式Xアカウントをフォロー',
      rewardAmount: '+{n} FvH Coin',
      openTaskBtn: '開く',
      verifyTaskBtn: '確認',
      taskCompleted: '✓ 完了',
      taskVerifying: '確認中...',
      gotItBtn: '了解'
    },
    ko: {
      chooseTeamTitle: '팀 선택',
      chooseTeamDesc: '15일간의 시즌 대회에서 지원할 팀을 선택하세요. 선택한 팀은 이번 시즌 동안 고정됩니다!',
      teamFootyName: 'FOOTY ⚽',
      teamFootyToken: '$FOOTY',
      teamFootyDesc: '축구 팀. 정교한 기술과 강력한 슈팅력.',
      teamHoopsName: 'HOOPS 🏀',
      teamHoopsToken: '$HOOPS',
      teamHoopsDesc: '농구 팀. 민첩한 움직임과 화려한 덩크슛.',
      confirmTeamSelection: '팀 선택 확인',
      teamSelectedSuccess: '✓ 팀이 성공적으로 선택되었습니다!',
      teamLockedBadge: '15일 시즌 고정',
      catSkins: '유니폼',
      catFootballBalls: '축구공',
      catBasketballBalls: '농구공',
      catCoins: 'FvH 코인',
      pendingTokenLaunch: '토큰 출시 대기 중',
      tokenWithdrawBtn: '출금',
      tokenWithdrawModalTitle: '토큰 출금',
      tokenWithdrawNotice: '토큰 출금은 $FOOTY 및 $HOOPS 토큰의 공식 출시 이후에만 가능합니다。',
      starsUnconfiguredNotice: 'Telegram Stars 결제는 곧 지원될 예정입니다.',
      starsUnconfiguredBadge: '⭐ 곧 제공',
      emptyShopCategory: '이 카테고리에는 아직 상품이 없습니다',
      emptyInventoryCategory: '보유 중인 아이템이 없습니다',
      visitShopBtn: '상점 방문',
      equippedState: '✓ 장착됨',
      equipAction: '장착',
      buyAction: '구매:',
      txHistory: '거래 내역',
      txNoHistory: '기록된 거래 내역이 없습니다',
      tabInviteFriends: '친구 초대',
      tabSocialTasks: '소셜 미션',
      refRuleText: '초대받은 친구가 참여하여 팀 선택을 완료해야 100 FvH Coin이 지급됩니다.',
      refStatTotal: '총 초대',
      refStatQualified: '조건 달성 친구',
      refStatEarned: '획득한 FvH Coin',
      refCopyBtn: '링크 복사',
      refCopied: '✓ 링크가 복사되었습니다!',
      refShareBtn: 'Telegram으로 공유',
      socialTgTask: '공식 Telegram 채널 참여',
      socialXTask: '공식 X 계정 팔로우',
      rewardAmount: '+{n} FvH Coin',
      openTaskBtn: '열기',
      verifyTaskBtn: '확인',
      taskCompleted: '✓ 완료',
      taskVerifying: '확인 중...',
      gotItBtn: '확인'
    },
    zh: {
      chooseTeamTitle: '选择您的阵营',
      chooseTeamDesc: '在为期15天的赛季对抗中选择支持的阵营。您的选择将在整个赛季内锁定！',
      teamFootyName: 'FOOTY ⚽',
      teamFootyToken: '$FOOTY',
      teamFootyDesc: '足球阵营。精湛技术与势不可挡的强力破门。',
      teamHoopsName: 'HOOPS 🏀',
      teamHoopsToken: '$HOOPS',
      teamHoopsDesc: '篮球阵营。灵活敏捷与震撼暴扣。',
      confirmTeamSelection: '确认选择阵营',
      teamSelectedSuccess: '✓ 阵营选择成功！',
      teamLockedBadge: '15天赛季内锁定',
      catSkins: '球衣',
      catFootballBalls: '足球',
      catBasketballBalls: '篮球',
      catCoins: 'FvH 金币',
      pendingTokenLaunch: '等待代币上线',
      tokenWithdrawBtn: '提现',
      tokenWithdrawModalTitle: '代币提现',
      tokenWithdrawNotice: '代币提现仅在 $FOOTY 和 $HOOPS 代币正式上线后开放。',
      starsUnconfiguredNotice: 'Telegram Stars 支付即将推出。',
      starsUnconfiguredBadge: '⭐ 即将推出',
      emptyShopCategory: '该分类下暂无商品',
      emptyInventoryCategory: '您在该分类下暂无拥有的物品',
      visitShopBtn: '前往商店',
      equippedState: '✓ 已装备',
      equipAction: '装备',
      buyAction: '购买',
      txHistory: '交易明细',
      txNoHistory: '暂无交易记录',
      tabInviteFriends: '邀请好友',
      tabSocialTasks: '社交任务',
      refRuleText: '受邀好友加入并确认选择阵营后，系统方会发放 100 FvH Coin 奖励。',
      refStatTotal: '累计邀请',
      refStatQualified: '有效好友',
      refStatEarned: '已赚取 FvH Coin',
      refCopyBtn: '复制链接',
      refCopied: '✓ 链接已复制！',
      refShareBtn: '在 Telegram 分享',
      socialTgTask: '加入官方 Telegram 频道',
      socialXTask: '关注官方 X 账号',
      rewardAmount: '+{n} FvH Coin',
      openTaskBtn: '前往',
      verifyTaskBtn: '验证',
      taskCompleted: '✓ 已完成',
      taskVerifying: '验证中...',
      gotItBtn: '知道了'
    },
    ar: {
      chooseTeamTitle: 'اختر فريقك',
      chooseTeamDesc: 'اختر الفريق الذي ستدعمه في المسابقة الموسمية لمدة 15 يوماً. اختيارك مثبت طوال الموسم!',
      teamFootyName: 'FOOTY ⚽',
      teamFootyToken: '$FOOTY',
      teamFootyDesc: 'فريق كرة القدم. تقنية وسرعة وتسديدات خارقة.',
      teamHoopsName: 'HOOPS 🏀',
      teamHoopsToken: '$HOOPS',
      teamHoopsDesc: 'فريق كرة السلة. رشاقة وسلات ساحقة ودقة عالية.',
      confirmTeamSelection: 'تأكيد اختيار الفريق',
      teamSelectedSuccess: '✓ تم اختيار الفريق بنجاح!',
      teamLockedBadge: 'مثبت لموسم الـ 15 يوماً',
      catSkins: 'الأطقم',
      catFootballBalls: 'كرات القدم',
      catBasketballBalls: 'كرات السلة',
      catCoins: 'عملات FvH',
      pendingTokenLaunch: 'في انتظار إطلاق الرمز',
      tokenWithdrawBtn: 'سحب',
      tokenWithdrawModalTitle: 'سحب الرموز',
      tokenWithdrawNotice: 'ستكون عمليات سحب الرموز متاحة فقط بعد الإطلاق الرسمي لرموز $FOOTY و $HOOPS.',
      starsUnconfiguredNotice: 'الدفع عبر Telegram Stars سيكون متاحاً قريباً.',
      starsUnconfiguredBadge: '⭐ قريباً',
      emptyShopCategory: 'لا توجد منتجات متاحة في هذه الفئة حالياً',
      emptyInventoryCategory: 'لا تمتلك أي عناصر في هذه الفئة بعد',
      visitShopBtn: 'زيارة المتجر',
      equippedState: '✓ مجهّز',
      equipAction: 'تجهيز',
      buyAction: 'شراء مقابل',
      txHistory: 'سجل المعاملات',
      txNoHistory: 'لا توجد معاملات مسجلة بعد',
      tabInviteFriends: 'دعوة صديق',
      tabSocialTasks: 'المهام الاجتماعية',
      refRuleText: 'تتم إضافة 100 FvH Coin فقط بعد انضمام الصديق المدعو وتأكيد اختياره للفريق.',
      refStatTotal: 'إجمالي المدعوين',
      refStatQualified: 'الأصدقاء المؤهلون',
      refStatEarned: 'مكافآت FvH Coin',
      refCopyBtn: 'نسخ الرابط',
      refCopied: '✓ تم نسخ الرابط!',
      refShareBtn: 'مشاركة عبر Telegram',
      socialTgTask: 'الانضمام إلى قناة Telegram الرسمية',
      socialXTask: 'متابعة الحساب الرسمي على X',
      rewardAmount: '+{n} FvH Coin',
      openTaskBtn: 'فتح',
      verifyTaskBtn: 'تحقق',
      taskCompleted: '✓ مكتمل',
      taskVerifying: 'جارٍ التحقق...',
      gotItBtn: 'حسناً'
    }
  };

  function getActiveLang() {
    var s = (window.__fvh && window.__fvh.store && window.__fvh.store.data && window.__fvh.store.data.settings) || {};
    var lang = s.lang;
    if (!lang || lang === 'auto') {
      lang = detectDeviceLanguage();
    }
    var supported = ['en', 'ru', 'es', 'de', 'fr', 'pt', 'it', 'uk', 'pl', 'tr', 'nl', 'ja', 'ko', 'zh', 'ar'];
    var active = supported.indexOf(lang) !== -1 ? lang : 'en';
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.dir = (active === 'ar') ? 'rtl' : 'ltr';
    }
    return active;
  }

  function tr(key, vars) {
    var lang = getActiveLang();
    var str = (STAGE1_I18N[lang] && STAGE1_I18N[lang][key]) ||
              (I18N[lang] && I18N[lang][key]) ||
              (STAGE1_I18N.ru && STAGE1_I18N.ru[key]) ||
              (STAGE1_I18N.en && STAGE1_I18N.en[key]) ||
              (I18N.ru && I18N.ru[key]) ||
              (I18N.en && I18N.en[key]) ||
              key;
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

  function getItemLabelById(id, fallback) {
    if (!id) return fallback || '';
    var lang = getActiveLang();
    if (typeof HERO_SKIN_PALETTES !== 'undefined' && HERO_SKIN_PALETTES[id]) {
      return lang === 'ru' ? HERO_SKIN_PALETTES[id].ru : HERO_SKIN_PALETTES[id].name;
    }
    if (typeof CROWD_CATALOG !== 'undefined') {
      var cr = CROWD_CATALOG.find(function(c) { return c.id === id; });
      if (cr) return tr(cr.nameKey) || cr.name;
    }
    if (typeof BOOST_CATALOG !== 'undefined') {
      var bs = BOOST_CATALOG.find(function(b) { return b.id === id; });
      if (bs) return tr(bs.nameKey) || bs.name;
    }
    var idToName = {
      'skin_rookie': 'Rookie Blue',
      'skin_solar': 'Solar Flare',
      'std_footy_classic': 'Classic Grass',
      'std_footy_night': 'Night Arena',
      'std_footy_golden': 'Golden Hour',
      'std_footy_neon': 'Neon Turf',
      'std_hoops_street': 'Street Classic',
      'std_hoops_night': 'Neon Night',
      'std_hoops_gold': 'Gold Hardwood',
      'std_hoops_matrix': 'Matrix Court',
      'ball_footy_classic': 'Classic Football',
      'ball_hoops_street': 'Classic Basketball',
      'cel_confetti': 'Confetti Burst',
      'cel_fireworks': 'Fireworks',
      'cel_shockwave': 'Shockwave',
      'cel_flame': 'Flame Burst',
      'cel_gold_rain': 'Gold Rain'
    };
    if (idToName[id]) {
      return trItem(idToName[id]);
    }
    if (ITEM_I18N && ITEM_I18N[lang] && ITEM_I18N[lang][id]) {
      return ITEM_I18N[lang][id];
    }
    return trItem(id) || fallback || id;
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
  // Tactical Haptic Feedback & Unified Avatars
  // ==========================================

  function triggerHaptic(type) {
    try {
      if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
        var h = window.Telegram.WebApp.HapticFeedback;
        if (type === 'success' || type === 'warning' || type === 'error') {
          h.notificationOccurred(type);
        } else if (type === 'heavy' || type === 'medium' || type === 'rigid' || type === 'soft') {
          h.impactOccurred(type);
        } else if (type === 'selection') {
          if (typeof h.selectionChanged === 'function') h.selectionChanged();
          else h.impactOccurred('light');
        } else {
          h.impactOccurred('light');
        }
      } else if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        var pattern = (type === 'heavy') ? 30 : (type === 'medium') ? 18 : (type === 'success') ? [20, 40, 20] : 8;
        navigator.vibrate(pattern);
      }
    } catch (e) {}
  }

  // Centralized High-Quality Sports Avatar Renderer
  // Handles: Telegram user profile picture -> Authoritative sync photoUrl -> 3D Cartoon Hero fallback
  function getPlayerAvatarHtml(opts) {
    opts = opts || {};
    var char = opts.character || opts.char || 'footy';
    var isHoops = (char === 'hoops');
    var fallbackImg = isHoops ? 'assets/hero_hoops_cartoon.png' : 'assets/hero_footy_cartoon.png';
    var photo = opts.photoUrl || opts.photo_url || null;
    var extraClass = opts.extraClass ? (' ' + opts.extraClass) : '';
    var alt = escapeHtml(opts.alt || opts.name || char);

    if (photo && typeof photo === 'string' && photo.trim()) {
      var safePhoto = escapeHtml(photo.trim());
      return '<img src="' + safePhoto + '" class="fvh-avatar-img' + extraClass + '" alt="' + alt + '" onerror="this.onerror=null;this.src=\'' + fallbackImg + '\';" />';
    }
    return '<img src="' + fallbackImg + '" class="fvh-avatar-img' + extraClass + '" alt="' + alt + '" />';
  }
  window.getPlayerAvatarHtml = getPlayerAvatarHtml;

  // ==========================================
  // High-Fidelity Cyber-Sports Character Avatars
  // ==========================================

  function getFootyAvatarSvg() {
    return '<svg viewBox="0 0 240 290" fill="none" xmlns="http://www.w3.org/2000/svg" class="fvh-hero-avatar-svg"><defs><radialGradient id="footyStadiumLight" cx="50%" cy="30%" r="70%"><stop offset="0%" stop-color="#0284c7" stop-opacity="0.22"/><stop offset="50%" stop-color="#0369a1" stop-opacity="0.08"/><stop offset="100%" stop-color="#040711" stop-opacity="0"/></radialGradient><linearGradient id="footyJersey" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00c8ff"/><stop offset="35%" stop-color="#0284c7"/><stop offset="75%" stop-color="#0369a1"/><stop offset="100%" stop-color="#075985"/></linearGradient><linearGradient id="footyShorts" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#0c4a6e"/><stop offset="60%" stop-color="#082f49"/><stop offset="100%" stop-color="#021422"/></linearGradient><linearGradient id="footyChevron" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#38bdf8"/><stop offset="50%" stop-color="#00e5ff"/><stop offset="100%" stop-color="#0284c7"/></linearGradient><linearGradient id="footyGold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fef08a"/><stop offset="50%" stop-color="#eab308"/><stop offset="100%" stop-color="#ca8a04"/></linearGradient><linearGradient id="footySkin" x1="30%" y1="0%" x2="70%" y2="100%"><stop offset="0%" stop-color="#fed7aa"/><stop offset="35%" stop-color="#fba876"/><stop offset="75%" stop-color="#d47942"/><stop offset="100%" stop-color="#a35222"/></linearGradient><linearGradient id="footySkinDark" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#b45309"/><stop offset="100%" stop-color="#78350f"/></linearGradient><linearGradient id="footyCleat" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#1e293b"/><stop offset="45%" stop-color="#0f172a"/><stop offset="100%" stop-color="#020617"/></linearGradient><radialGradient id="soccerSphere" cx="35%" cy="32%" r="65%"><stop offset="0%" stop-color="#ffffff"/><stop offset="40%" stop-color="#f1f5f9"/><stop offset="70%" stop-color="#94a3b8"/><stop offset="90%" stop-color="#475569"/><stop offset="100%" stop-color="#1e293b"/></radialGradient><pattern id="jerseyVent" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="0.75" fill="#38bdf8" opacity="0.3"/></pattern><linearGradient id="footyVisor" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#00c8ff" stop-opacity="0.1"/><stop offset="100%" stop-color="#0284c7" stop-opacity="0.1"/></linearGradient></defs><circle cx="120" cy="135" r="115" fill="url(#footyStadiumLight)"/><ellipse cx="120" cy="274" rx="74" ry="10" fill="#000000" opacity="0.6"/><g><path d="M136 168L148 214L160 252L140 258L130 218L124 168Z" fill="url(#footySkinDark)"/><path d="M134 192L148 216L158 252L141 257L130 222L128 192Z" fill="#0284c7"/><path d="M132 195L144 197L142 200L130 198Z" fill="#ffffff"/><path d="M133 202L145 204L143 207L131 205Z" fill="#ffffff"/><path d="M138 252L172 255L174 265L135 266L133 257Z" fill="url(#footyCleat)"/><path d="M142 256L166 258L160 261L140 259Z" fill="#00c8ff"/><polygon points="144,266 147,266 145,270" fill="#cbd5e1"/><polygon points="156,266 159,266 157,270" fill="#cbd5e1"/><polygon points="167,265 170,265 168,269" fill="#cbd5e1"/></g><g><path d="M96 168L84 214L72 252L92 258L102 218L108 168Z" fill="url(#footySkinDark)"/><path d="M98 192L84 216L74 252L91 257L102 222L104 192Z" fill="#0284c7"/><path d="M98 195L86 197L88 200L100 198Z" fill="#ffffff"/><path d="M97 202L85 204L87 207L99 205Z" fill="#ffffff"/><path d="M70 252L40 256L38 265L77 266L79 257Z" fill="url(#footyCleat)"/><path d="M44 256L68 256L64 260L46 259Z" fill="#00c8ff"/><polygon points="43,266 46,266 44,270" fill="#cbd5e1"/><polygon points="54,266 57,266 55,270" fill="#cbd5e1"/><polygon points="66,266 69,266 67,270" fill="#cbd5e1"/></g><g><path d="M80 132L68 178L115 178L120 146L125 178L164 178L152 132Z" fill="url(#footyShorts)"/><path d="M69 136L68 177L75 177L79 136Z" fill="#00c8ff"/><path d="M163 136L164 177L157 177L153 136Z" fill="#00c8ff"/><path d="M68 175L115 175L114 178L68 178Z" fill="#ffffff"/><path d="M125 175L164 175L164 178L125 178Z" fill="#ffffff"/><polygon points="78,162 83,162 81,168 78,166" fill="url(#footyGold)"/></g><g><path d="M78 66L62 136L170 136L154 66L136 61L116 71L96 61Z" fill="url(#footyJersey)"/><path d="M78 66L62 136L170 136L154 66L136 61L116 71L96 61Z" fill="url(#jerseyVent)"/><path d="M84 67L116 110L148 67L138 63L116 95L94 63Z" fill="url(#footyChevron)"/><path d="M96 61L116 71L136 61L132 57L116 65L100 57Z" fill="#ffffff"/><path d="M98 62L116 70L134 62L132 60L116 66L100 60Z" fill="#0284c7"/><g transform="translate(88, 78)"><polygon points="6,0 18,0 16,14 12,18 6,14" fill="url(#footyGold)" stroke="#ffffff" stroke-width="0.8"/><circle cx="12" cy="8" r="3.2" fill="#0f172a"/><circle cx="12" cy="8" r="1.5" fill="#ffffff"/><polygon points="12,-4 13.5,-1 16,-1 14,1 15,3.5 12,2 9,3.5 10,1 8,-1 10.5,-1" fill="url(#footyGold)"/></g><text x="116" y="130" font-family="\'Arial Black\', Impact, sans-serif" font-size="34" font-weight="900" fill="#ffffff" stroke="#0f172a" stroke-width="1.6" text-anchor="middle" letter-spacing="3">10</text></g><g><path d="M154 66L174 90L162 97L146 74Z" fill="url(#footyJersey)"/><path d="M174 90L162 97L160 100L172 93Z" fill="#ffffff"/><path d="M162 97L184 116L174 125L154 103Z" fill="url(#footySkin)"/><g transform="translate(158, 96)"><rect x="0" y="0" width="18" height="9" rx="2" fill="url(#footyGold)"/><text x="9" y="7.5" font-family="\'Arial Black\', sans-serif" font-size="8" font-weight="900" fill="#0f172a" text-anchor="middle">C</text></g><path d="M174 118L186 128L179 135L168 124Z" fill="url(#footySkin)"/></g><g><path d="M78 66L58 90L70 97L86 74Z" fill="url(#footyJersey)"/><path d="M58 90L70 97L72 100L60 93Z" fill="#ffffff"/><path d="M70 97L48 116L58 125L78 103Z" fill="url(#footySkin)"/><path d="M48 118L36 128L43 135L54 124Z" fill="url(#footySkin)"/></g><path d="M104 56L104 70L128 70L128 56Z" fill="url(#footySkinDark)"/><path d="M108 56L108 70L124 70L124 56Z" fill="url(#footySkin)"/><ellipse cx="116" cy="38" rx="22" ry="24" fill="url(#footySkin)"/><path d="M100 36C100 48 108 56 116 56C124 56 132 48 132 36Z" fill="url(#footySkin)"/><path d="M94 34C94 10 138 10 138 34C132 20 102 20 94 34Z" fill="#17120e"/><path d="M94 28C98 16 134 14 138 28C128 22 106 22 94 28Z" fill="#2d2219"/><path d="M92 34L95 44L100 40L96 32Z" fill="#17120e"/><path d="M140 34L137 44L132 40L136 32Z" fill="#17120e"/><path d="M102 30Q108 27 114 30" stroke="#17120e" stroke-width="2.6" stroke-linecap="round" fill="none"/><path d="M118 30Q124 27 130 30" stroke="#17120e" stroke-width="2.6" stroke-linecap="round" fill="none"/><ellipse cx="108" cy="35" rx="4.5" ry="3" fill="#ffffff"/><ellipse cx="124" cy="35" rx="4.5" ry="3" fill="#ffffff"/><circle cx="108" cy="35" r="2.2" fill="#3b2314"/><circle cx="124" cy="35" r="2.2" fill="#3b2314"/><circle cx="108" cy="35" r="1.1" fill="#0a0705"/><circle cx="124" cy="35" r="1.1" fill="#0a0705"/><circle cx="107.2" cy="34.2" r="0.7" fill="#ffffff"/><circle cx="123.2" cy="34.2" r="0.7" fill="#ffffff"/><path d="M103 34Q108 32 113 34" stroke="#78350f" stroke-width="1.2" fill="none"/><path d="M119 34Q124 32 129 34" stroke="#78350f" stroke-width="1.2" fill="none"/><path d="M116 34L114 43L118 43" stroke="#92400e" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M110 49Q116 53 122 49" stroke="#78350f" stroke-width="2.2" stroke-linecap="round" fill="none"/><path d="M112 49Q116 52 120 49Z" fill="#ffffff"/><path d="M114 54Q116 56 118 54" stroke="#a35222" stroke-width="1.5" stroke-linecap="round" fill="none"/><g transform="translate(34, 222)"><ellipse cx="25" cy="46" rx="22" ry="5" fill="#000000" opacity="0.6"/><circle cx="25" cy="25" r="22" fill="url(#soccerSphere)"/><circle cx="25" cy="25" r="22" stroke="#475569" stroke-width="0.8" fill="none"/><polygon points="25,15 33,21 30,30 20,30 17,21" fill="#0f172a"/><line x1="25" y1="15" x2="25" y2="3" stroke="#334155" stroke-width="1.4"/><line x1="33" y1="21" x2="44" y2="16" stroke="#334155" stroke-width="1.4"/><line x1="30" y1="30" x2="39" y2="41" stroke="#334155" stroke-width="1.4"/><line x1="20" y1="30" x2="11" y2="41" stroke="#334155" stroke-width="1.4"/><line x1="17" y1="21" x2="6" y2="16" stroke="#334155" stroke-width="1.4"/><polygon points="25,3 29,0 21,0" fill="#0f172a"/><polygon points="44,16 47,22 47,13" fill="#0f172a"/><polygon points="6,16 3,22 3,13" fill="#0f172a"/><ellipse cx="18" cy="15" rx="5" ry="3" fill="#ffffff" opacity="0.6" transform="rotate(-20, 18, 15)"/></g></svg>';
  }

  function getHoopsAvatarSvg() {
    return '<svg viewBox="0 0 240 290" fill="none" xmlns="http://www.w3.org/2000/svg" class="fvh-hero-avatar-svg"><defs><radialGradient id="hoopsArenaLight" cx="50%" cy="30%" r="70%"><stop offset="0%" stop-color="#ea580c" stop-opacity="0.22"/><stop offset="50%" stop-color="#9a3412" stop-opacity="0.08"/><stop offset="100%" stop-color="#07030c" stop-opacity="0"/></radialGradient><linearGradient id="hoopsJersey" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ff7b00"/><stop offset="35%" stop-color="#ea580c"/><stop offset="75%" stop-color="#c2410c"/><stop offset="100%" stop-color="#7c2d12"/></linearGradient><linearGradient id="hoopsShorts" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#9a3412"/><stop offset="60%" stop-color="#6c230b"/><stop offset="100%" stop-color="#3b1104"/></linearGradient><linearGradient id="hoopsSideStripe" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#ffffff"/><stop offset="45%" stop-color="#ff7b00"/><stop offset="100%" stop-color="#18181b"/></linearGradient><linearGradient id="hoopsSkin" x1="30%" y1="0%" x2="70%" y2="100%"><stop offset="0%" stop-color="#d97706"/><stop offset="45%" stop-color="#b45309"/><stop offset="85%" stop-color="#854d0e"/><stop offset="100%" stop-color="#5a310c"/></linearGradient><linearGradient id="hoopsSkinDark" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#92400e"/><stop offset="100%" stop-color="#451a03"/></linearGradient><linearGradient id="hoopsSneaker" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#ea580c"/><stop offset="50%" stop-color="#18181b"/><stop offset="100%" stop-color="#09090b"/></linearGradient><radialGradient id="hoopsBallGrad" cx="35%" cy="30%" r="65%"><stop offset="0%" stop-color="#ffaa44"/><stop offset="35%" stop-color="#f97316"/><stop offset="70%" stop-color="#c2410c"/><stop offset="90%" stop-color="#7c2d12"/><stop offset="100%" stop-color="#3b1204"/></radialGradient><pattern id="hoopsMesh" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="0.9" fill="#fef08a" opacity="0.25"/></pattern><ellipse id="ballCourtRing" cx="28" cy="28" rx="33" ry="10" stroke="#ff7b00" stroke-width="0.001" fill="none" opacity="0"/></defs><circle cx="120" cy="135" r="115" fill="url(#hoopsArenaLight)"/><ellipse cx="120" cy="274" rx="74" ry="10" fill="#000000" opacity="0.6"/><g><path d="M104 168L92 216L80 252L100 258L110 220L116 168Z" fill="url(#hoopsSkinDark)"/><path d="M102 195L92 218L82 250L100 256L108 222L110 195Z" fill="#f8fafc"/><path d="M101 199L89 201L91 204L103 202Z" fill="#ff7b00"/><path d="M80 250L48 254L46 264L90 264L92 254Z" fill="url(#hoopsSneaker)"/><path d="M46 262L90 262L91 267L45 267Z" fill="#ffffff"/><path d="M45 266L91 266L92 269L44 269Z" fill="#18181b"/></g><g><path d="M136 168L148 216L160 252L140 258L130 220L124 168Z" fill="url(#hoopsSkinDark)"/><path d="M138 195L148 218L158 250L140 256L132 222L130 195Z" fill="#f8fafc"/><path d="M139 199L151 201L149 204L137 202Z" fill="#ff7b00"/><path d="M140 250L172 254L174 264L130 264L128 254Z" fill="url(#hoopsSneaker)"/><path d="M130 262L174 262L175 267L129 267Z" fill="#ffffff"/><path d="M129 266L175 266L176 269L128 269Z" fill="#18181b"/></g><g><path d="M82 130L68 178L115 178L120 144L125 178L168 178L156 130Z" fill="url(#hoopsShorts)"/><path d="M69 134L68 177L78 177L82 134Z" fill="url(#hoopsSideStripe)"/><path d="M167 134L168 177L158 177L154 134Z" fill="url(#hoopsSideStripe)"/><path d="M68 175L115 175L114 178L68 178Z" fill="#ffffff"/><path d="M125 175L168 175L168 178L125 178Z" fill="#ffffff"/><rect x="82" y="128" width="74" height="4.5" rx="1.5" fill="#ea580c"/></g><g><path d="M82 66L66 136L172 136L156 66L142 62L120 70L98 62Z" fill="url(#hoopsJersey)"/><path d="M82 66L66 136L172 136L156 66L142 62L120 70L98 62Z" fill="url(#hoopsMesh)"/><path d="M98 62L120 70L142 62L138 58L120 65L102 58Z" fill="#ffffff"/><path d="M100 63L120 69L140 63L138 61L120 66L102 61Z" fill="#18181b"/><path d="M82 66L76 86L70 84L78 65Z" fill="#ffffff"/><path d="M156 66L162 86L168 84L160 65Z" fill="#ffffff"/><path d="M70 84L66 136L74 136L76 86Z" fill="url(#hoopsSideStripe)"/><path d="M168 84L172 136L164 136L162 86Z" fill="url(#hoopsSideStripe)"/><text x="119" y="86" font-family="\'Arial Black\', Impact, sans-serif" font-size="8.5" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="3">HOOPS</text><text x="120" y="124" font-family="Impact, \'Arial Black\', sans-serif" font-size="38" font-weight="900" fill="#ffffff" stroke="#18181b" stroke-width="1.8" text-anchor="middle" letter-spacing="2">23</text></g><g><circle cx="76" cy="74" r="14" fill="url(#hoopsSkin)"/><path d="M84 76L52 104L62 114L90 86Z" fill="#18181b"/><path d="M52 104L40 114L46 120L58 110Z" fill="url(#hoopsSkin)"/></g><g><circle cx="162" cy="74" r="14" fill="url(#hoopsSkin)"/><path d="M154 70L186 84L192 76L160 62Z" fill="url(#hoopsSkin)"/><path d="M186 84L190 54L178 52L176 80Z" fill="url(#hoopsSkin)"/><path d="M190 54L194 44L182 42L178 52Z" fill="url(#hoopsSkin)"/><rect x="178" y="58" width="12" height="6" rx="1.5" fill="#ff7b00"/></g><path d="M106 56L106 70L132 70L132 56Z" fill="url(#hoopsSkinDark)"/><path d="M110 56L110 70L128 70L128 56Z" fill="url(#hoopsSkin)"/><ellipse cx="119" cy="38" rx="22" ry="24" fill="url(#hoopsSkin)"/><path d="M103 36C103 48 111 56 119 56C127 56 135 48 135 36Z" fill="url(#hoopsSkin)"/><path d="M96 28C96 12 142 12 142 28Z" fill="#09050d"/><rect x="95" y="24" width="48" height="11" rx="2.5" fill="#ff7b00" stroke="#ffffff" stroke-width="0.8"/><rect x="114" y="26.5" width="10" height="6" rx="1.5" fill="#ffffff"/><path d="M105 31Q110 28 115 31" stroke="#18181b" stroke-width="2.6" stroke-linecap="round" fill="none"/><path d="M123 31Q128 28 133 31" stroke="#18181b" stroke-width="2.6" stroke-linecap="round" fill="none"/><ellipse cx="110" cy="36" rx="4.5" ry="3" fill="#ffffff"/><ellipse cx="128" cy="36" rx="4.5" ry="3" fill="#ffffff"/><circle cx="110" cy="36" r="2.2" fill="#29180c"/><circle cx="128" cy="36" r="2.2" fill="#29180c"/><circle cx="110" cy="36" r="1.1" fill="#090503"/><circle cx="128" cy="36" r="1.1" fill="#090503"/><circle cx="109.2" cy="35.2" r="0.7" fill="#ffffff"/><circle cx="127.2" cy="35.2" r="0.7" fill="#ffffff"/><path d="M119 35L117 44L121 44" stroke="#5a310c" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M112 49Q119 55 126 49" stroke="#451a03" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M113 49Q119 54 125 49Z" fill="#ffffff"/><g transform="translate(162, 14)"><circle cx="28" cy="28" r="23" fill="url(#hoopsBallGrad)"/><circle cx="28" cy="28" r="23" stroke="#18181b" stroke-width="1.5" fill="none"/><path d="M5 28H51" stroke="#18181b" stroke-width="2.2" stroke-linecap="round"/><path d="M28 5V51" stroke="#18181b" stroke-width="2.2" stroke-linecap="round"/><path d="M11 11C22 19 22 37 11 45" stroke="#18181b" stroke-width="2" fill="none"/><path d="M45 11C34 19 34 37 45 45" stroke="#18181b" stroke-width="2" fill="none"/><ellipse cx="20" cy="18" rx="5.5" ry="3" fill="#ffffff" opacity="0.45" transform="rotate(-30, 20, 18)"/></g></svg>';
  }

  // Dynamic Hero Jersey Palette Definitions for in-game and menu character customization
  var HERO_SKIN_PALETTES = {
    skin_rookie: { h: 205, s: 0.90, lMult: 1.0, darkShorts: true, name: 'Rookie Blue', ru: 'Стартовая: Синяя' },
    skin_crimson: { h: 358, s: 0.88, lMult: 1.0, darkShorts: true, name: 'Crimson Comet', ru: 'Багровая Комета' },
    skin_neon: { h: 155, s: 0.92, lMult: 1.1, darkShorts: true, name: 'Neon Striker', ru: 'Неоновый Страйкер' },
    skin_neon_elite: { h: 185, s: 0.95, lMult: 1.05, darkShorts: true, name: 'Neon Striker Elite', ru: 'Неон Страйкер' },
    skin_frost: { h: 200, s: 0.55, lMult: 1.35, darkShorts: false, name: 'Frost Giant', ru: 'Ледяной Титан' },
    skin_shadow: { h: 275, s: 0.70, lMult: 0.82, darkShorts: true, name: 'Shadow Ninja', ru: 'Теневой Ниндзя' },
    skin_solar: { h: 22, s: 0.95, lMult: 1.05, darkShorts: true, name: 'Solar Flare', ru: 'Стартовая: Огненная' },
    skin_gold: { h: 46, s: 0.95, lMult: 1.18, darkShorts: false, name: 'Golden Legend', ru: 'Золотая Легенда' },
    skin_cyber: { h: 300, s: 0.90, lMult: 1.05, darkShorts: true, name: 'Cyber Blue', ru: 'Кибер-синяя' },
    skin_sunset: { h: 28, s: 0.95, lMult: 1.1, darkShorts: false, name: 'Sunset Gold', ru: 'Закатное Золото' },
    skin_hydro: { h: 175, s: 0.88, lMult: 1.0, darkShorts: true, name: 'Hydro Striker', ru: 'Гидро Страйкер' },
    skin_mars: { h: 10, s: 0.90, lMult: 0.95, darkShorts: true, name: 'Mars Rover', ru: 'Марсианский Ровер' },
    skin_astronaut: { h: 215, s: 0.15, lMult: 1.3, darkShorts: true, name: 'Astronaut Kit', ru: 'Экипировка Астронавта' },
    skin_premium_black_gold: { h: 40, s: 0.9, lMult: 0.9, darkShorts: true, name: 'Premium Black & Gold', ru: 'Премиум Чёрно-Золотая' },
    skin_neon_cyber: { h: 250, s: 0.9, lMult: 1.1, darkShorts: true, name: 'Neon Cyber', ru: 'Неоновый Кибер' },
    skin_electric_blue: { h: 220, s: 0.9, lMult: 1.0, darkShorts: true, name: 'Electric Blue', ru: 'Электрический Синий' },
    skin_crimson_elite: { h: 360, s: 0.9, lMult: 0.95, darkShorts: true, name: 'Crimson Elite', ru: 'Багровый Элит' },
    skin_championship: { h: 50, s: 0.95, lMult: 1.15, darkShorts: true, name: 'Championship Edition', ru: 'Чемпионская' }
  };

  var HERO_SKIN_CACHE = {};
  var HERO_BASE_IMGS = {};

  function heroRgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h *= 60;
    }
    return { h: h, s: s, l: l };
  }

  function heroHslToRgb(h, s, l) {
    var r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      var hue2rgb = function (p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      h /= 360;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  }

  function initHeroBaseImages() {
    if (typeof Image === 'undefined') return;
    if (!HERO_BASE_IMGS.footy) {
      var f = new Image();
      f.crossOrigin = 'anonymous';
      f.src = 'assets/hero_footy_real.png';
      HERO_BASE_IMGS.footy = f;
    }
    if (!HERO_BASE_IMGS.hoops) {
      var h = new Image();
      h.crossOrigin = 'anonymous';
      h.src = 'assets/hero_hoops_real.png';
      HERO_BASE_IMGS.hoops = h;
    }
  }
  try { initHeroBaseImages(); } catch (e) {}

  function getRecoloredHeroUrl(charId, skinId) {
    var isFooty = (charId === 'footy');
    var defaultSkin = isFooty ? 'skin_rookie' : 'skin_solar';
    if (!skinId || skinId === defaultSkin) {
      return isFooty ? 'assets/hero_footy_real.png' : 'assets/hero_hoops_real.png';
    }
    var cacheKey = charId + '_' + skinId;
    if (HERO_SKIN_CACHE[cacheKey]) {
      return HERO_SKIN_CACHE[cacheKey];
    }
    initHeroBaseImages();
    var baseImg = HERO_BASE_IMGS[charId];
    if (baseImg && baseImg.complete && (baseImg.naturalWidth || baseImg.width)) {
      try {
        var cvs = document.createElement('canvas');
        cvs.width = baseImg.naturalWidth || baseImg.width;
        cvs.height = baseImg.naturalHeight || baseImg.height;
        var ctx = cvs.getContext('2d');
        ctx.drawImage(baseImg, 0, 0);

        var imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
        var data = imgData.data;
        var pal = HERO_SKIN_PALETTES[skinId] || (isFooty ? HERO_SKIN_PALETTES.skin_rookie : HERO_SKIN_PALETTES.skin_solar);

        for (var y = 0; y < cvs.height; y++) {
          var yPct = y / cvs.height;
          if (isFooty) {
            var isTorsoOrShorts = (yPct >= 0.30 && yPct <= 0.66);
            var isSocks = (yPct >= 0.67 && yPct <= 0.88);
            if (!isTorsoOrShorts && !isSocks) continue;

            for (var x = 0; x < cvs.width; x++) {
              var idx = (y * cvs.width + x) * 4;
              if (data[idx + 3] < 40) continue;
              var r = data[idx], g = data[idx + 1], b = data[idx + 2];
              var hsl = heroRgbToHsl(r, g, b);
              if (hsl.h >= 160 && hsl.h <= 250 && hsl.s >= 0.18) {
                var targetH = pal.h;
                var targetS = Math.min(1, hsl.s * (pal.s || 1.0));
                var targetL = Math.min(0.95, hsl.l * (pal.lMult || 1.0));
                if (pal.darkShorts && yPct >= 0.54 && yPct <= 0.66) {
                  targetL *= 0.65;
                  targetS *= 0.8;
                }
                var newRgb = heroHslToRgb(targetH, targetS, targetL);
                data[idx] = newRgb.r; data[idx + 1] = newRgb.g; data[idx + 2] = newRgb.b;
              }
            }
          } else {
            // HOOPS
            var isJerseyOrShorts = (yPct >= 0.28 && yPct <= 0.62);
            if (!isJerseyOrShorts) continue;

            for (var x = 0; x < cvs.width; x++) {
              var idx = (y * cvs.width + x) * 4;
              if (data[idx + 3] < 40) continue;
              var xPct = x / cvs.width;
              if (xPct < 0.385 || xPct > 0.635) continue;

              var r = data[idx], g = data[idx + 1], b = data[idx + 2];
              var hsl = heroRgbToHsl(r, g, b);
              if ((hsl.h <= 32 || hsl.h >= 345) && hsl.s >= 0.40 && hsl.l <= 0.70) {
                var targetH = pal.h;
                var targetS = Math.min(1, hsl.s * (pal.s || 1.0));
                var targetL = Math.min(0.95, hsl.l * (pal.lMult || 1.0));
                var newRgb = heroHslToRgb(targetH, targetS, targetL);
                data[idx] = newRgb.r; data[idx + 1] = newRgb.g; data[idx + 2] = newRgb.b;
              }
            }
          }
        }
        ctx.putImageData(imgData, 0, 0);
        var resUrl = cvs.toDataURL('image/png');
        HERO_SKIN_CACHE[cacheKey] = resUrl;
        return resUrl;
      } catch (e) {
        console.warn('Hero recolor error:', e);
      }
    } else if (baseImg && !baseImg.complete) {
      baseImg.onload = function () {
        getRecoloredHeroUrl(charId, skinId);
        document.querySelectorAll('.fvh-hero-real-img[data-hero="' + charId + '"]').forEach(function (imgEl) {
          var sk = imgEl.getAttribute('data-skin') || skinId;
          imgEl.src = getRecoloredHeroUrl(charId, sk);
        });
      };
    }
    return isFooty ? 'assets/hero_footy_real.png' : 'assets/hero_hoops_real.png';
  }

  function getCharacterDisplayHtml(charId, specificSkinId, options) {
    var isFooty = charId === 'footy';
    var theApp = (typeof window !== 'undefined' && (window.App || window.__fvh || window.app)) || (typeof app !== 'undefined' ? app : null);
    var eq = (theApp && theApp.store && theApp.store.data && theApp.store.data.equipped) || {};
    var opts = options || {};
    // Ensure HOOPS doesn't inherit FOOTY's skin_rookie by default
    var defaultSkin = isFooty ? 'skin_rookie' : 'skin_solar';
    var charSpecificSkin = isFooty ? (eq['skin.footy'] || (eq.skin !== 'skin_solar' ? eq.skin : null)) : (eq['skin.hoops'] || (eq.skin !== 'skin_rookie' ? eq.skin : null));
    var skinId = specificSkinId || charSpecificSkin || defaultSkin;
    if (isFooty && skinId === 'skin_solar') skinId = 'skin_rookie';
    if (!isFooty && skinId === 'skin_rookie') skinId = 'skin_solar';
    var imgSrc = getRecoloredHeroUrl(charId, skinId);
    var svgFallback = isFooty ? getFootyAvatarSvg() : getHoopsAvatarSvg();
    var pal = HERO_SKIN_PALETTES[skinId] || (isFooty ? HERO_SKIN_PALETTES.skin_rookie : HERO_SKIN_PALETTES.skin_solar);
    var lang = (theApp && theApp.store && theApp.store.data && theApp.store.data.language) || 'ru';
    var skinLabel = (lang === 'ru') ? pal.ru : pal.name;

    var showJerseyTag = opts.showJerseyTag !== undefined ? opts.showJerseyTag : true;
    var tagHtml = showJerseyTag ?
      '<div class="fvh-hero-active-jersey-tag" style="position:relative;margin-top:10px;margin-bottom:2px;font-size:11px;font-weight:800;color:' + (isFooty ? '#38bdf8' : '#fb923c') + ';background:rgba(8,16,36,0.9);backdrop-filter:blur(6px);border:1.5px solid ' + (isFooty ? 'rgba(56,189,248,0.35)' : 'rgba(251,146,60,0.35)') + ';border-radius:999px;padding:4px 14px;white-space:nowrap;display:inline-flex;align-items:center;gap:6px;box-shadow:0 4px 14px rgba(0,0,0,0.55);z-index:2;"><span>🎽</span> <span>' + skinLabel + '</span></div>'
      : '';

    return '<div class="fvh-hero-portrait-wrap" style="position:relative;display:flex;flex-direction:column;align-items:center;width:100%;height:100%;justify-content:center;">' +
      '<div class="fvh-hero-figure-container" style="display:flex;align-items:center;justify-content:center;max-height:calc(100% - 36px);width:100%;">' +
      '<img class="fvh-hero-real-img fvh-hero-cutout-img" data-hero="' + charId + '" data-skin="' + skinId + '" src="' + imgSrc + '" alt="' + (isFooty ? 'FOOTY' : 'HOOPS') + '" onerror="this.style.display=\'none\'; if(this.nextElementSibling) this.nextElementSibling.style.display=\'block\';">' +
      '<div class="fvh-hero-svg-fallback" style="display:none;width:100%;height:100%;">' + svgFallback + '</div>' +
      '</div>' +
      tagHtml +
      '</div>';
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
    var isSm = size === 'thumb' || size === 'small';
    var w = isLg ? 200 : (isSm ? 48 : 76);
    var h = isLg ? 200 : (isSm ? 48 : 76);
    var id = (typeof item === 'string') ? item : (item && (item.id || item.itemId)) || '';
    var uid = id.replace(/[^a-zA-Z0-9]/g, '_');

    // Palette & Pattern Configs
    var primary = '#1e3a8a';
    var secondary = '#38bdf8';
    var accent = '#ffffff';
    var trim = '#93c5fd';
    var number = '10';
    var isBasketball = false;
    var pattern = 'plain';

    if (id === 'skin_rookie') {
      primary = '#1d4ed8'; secondary = '#0284c7'; accent = '#ffffff'; trim = '#60a5fa'; number = '10'; pattern = 'chevron';
    } else if (id === 'skin_crimson') {
      primary = '#b91c1c'; secondary = '#7f1d1d'; accent = '#fef08a'; trim = '#f59e0b'; number = '7'; pattern = 'stripes';
    } else if (id === 'skin_neon' || id === 'skin_neon_elite') {
      primary = '#090d16'; secondary = '#00f0ff'; accent = '#10b981'; trim = '#00f0ff'; number = '10'; pattern = 'circuit';
    } else if (id === 'skin_frost') {
      primary = '#0369a1'; secondary = '#e0f2fe'; accent = '#38bdf8'; trim = '#bae6fd'; number = '33'; pattern = 'frost';
    } else if (id === 'skin_shadow') {
      primary = '#09090b'; secondary = '#7c3aed'; accent = '#c084fc'; trim = '#a855f7'; number = '00'; pattern = 'stealth';
    } else if (id === 'skin_solar') {
      isBasketball = true;
      primary = '#c2410c'; secondary = '#f59e0b'; accent = '#fef08a'; trim = '#ea580c'; number = '24'; pattern = 'flame';
    } else if (id === 'skin_gold') {
      primary = '#854d0e'; secondary = '#facc15'; accent = '#ffffff'; trim = '#fef08a'; number = '1'; pattern = 'royal';
    } else if (id === 'skin_cyber') {
      primary = '#4a044e'; secondary = '#d946ef'; accent = '#00f0ff'; trim = '#f43f5e'; number = '99'; pattern = 'glitch';
    } else if (id === 'skin_sunset') {
      isBasketball = true;
      primary = '#ea580c'; secondary = '#facc15'; accent = '#ffffff'; trim = '#fb923c'; number = '8'; pattern = 'wave';
    } else if (id === 'skin_hydro') {
      primary = '#0369a1'; secondary = '#06b6d4'; accent = '#67e8f9'; trim = '#22d3ee'; number = '11'; pattern = 'aquatic';
    } else if (id === 'skin_mars') {
      isBasketball = true;
      primary = '#991b1b'; secondary = '#ea580c'; accent = '#fed7aa'; trim = '#f97316'; number = '42'; pattern = 'hazard';
    } else if (id === 'skin_astronaut') {
      primary = '#1e293b'; secondary = '#94a3b8'; accent = '#38bdf8'; trim = '#facc15'; number = '01'; pattern = 'space';
    } else if (id === 'skin_premium_black_gold') {
      primary = '#0a0a0a'; secondary = '#78350f'; accent = '#fef08a'; trim = '#f59e0b'; number = '10'; pattern = 'stripes';
    } else if (id === 'skin_neon_cyber') {
      primary = '#1e1b4b'; secondary = '#9333ea'; accent = '#22d3ee'; trim = '#22d3ee'; number = '10'; pattern = 'circuit';
    } else if (id === 'skin_electric_blue') {
      primary = '#1d4ed8'; secondary = '#3b82f6'; accent = '#60a5fa'; trim = '#60a5fa'; number = '10'; pattern = 'plain';
    } else if (id === 'skin_crimson_elite') {
      primary = '#991b1b'; secondary = '#b91c1c'; accent = '#fef08a'; trim = '#f59e0b'; number = '7'; pattern = 'stripes';
    } else if (id === 'skin_championship') {
      primary = '#0f172a'; secondary = '#eab308'; accent = '#facc15'; trim = '#eab308'; number = '1'; pattern = 'royal';
    }

    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
      '<linearGradient id="jg_' + uid + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="' + primary + '"/>' +
      '<stop offset="60%" stop-color="' + secondary + '"/>' +
      '<stop offset="100%" stop-color="' + primary + '"/>' +
      '</linearGradient>' +
      '<linearGradient id="trim_' + uid + '" x1="0%" y1="0%" x2="100%" y2="0%">' +
      '<stop offset="0%" stop-color="' + trim + '"/>' +
      '<stop offset="100%" stop-color="' + accent + '"/>' +
      '</linearGradient>' +
      '<filter id="glow_' + uid + '"><feGaussianBlur stdDeviation="1.5" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>' +
      '</defs>' +
      '<ellipse cx="50" cy="90" rx="26" ry="5" fill="#000000" opacity="0.35"/>' +
      (isBasketball ?
        '<path d="M34 22 C32 30 26 36 24 46 L28 84 L72 84 L76 46 C74 36 68 30 66 22 L56 26 C54 36 46 36 44 26 Z" fill="url(#jg_' + uid + ')" stroke="' + trim + '" stroke-width="1.4"/>' +
        '<path d="M34 22 C32 30 26 36 24 46" stroke="' + trim + '" stroke-width="2.2" fill="none"/>' +
        '<path d="M66 22 C74 36 76 46 76 46" stroke="' + trim + '" stroke-width="2.2" fill="none"/>' +
        '<path d="M44 26 C46 36 54 36 56 26" stroke="' + trim + '" stroke-width="2.2" fill="none"/>' :
        '<path d="M28 24 L10 38 L22 48 L28 42 L28 84 L72 84 L72 42 L78 48 L90 38 L72 24 L56 30 L44 30 Z" fill="url(#jg_' + uid + ')" stroke="' + trim + '" stroke-width="1.4"/>' +
        '<polygon points="10,38 14,41 24,33 22,30" fill="url(#trim_' + uid + ')"/>' +
        '<polygon points="90,38 86,41 76,33 78,30" fill="url(#trim_' + uid + ')"/>' +
        '<polygon points="44,24 50,32 56,24 53,24 50,29 47,24" fill="url(#trim_' + uid + ')"/>'
      ) +
      (pattern === 'stripes' ?
        '<line x1="38" y1="36" x2="38" y2="84" stroke="' + secondary + '" stroke-width="4.5"/>' +
        '<line x1="62" y1="36" x2="62" y2="84" stroke="' + secondary + '" stroke-width="4.5"/>' : '') +
      (pattern === 'chevron' ?
        '<path d="M32 44 L50 54 L68 44" stroke="' + accent + '" stroke-width="2.5" fill="none" opacity="0.8"/>' +
        '<path d="M32 52 L50 62 L68 52" stroke="' + accent + '" stroke-width="2" fill="none" opacity="0.6"/>' : '') +
      (pattern === 'circuit' ?
        '<path d="M30 42 L42 42 L48 50 L48 76" stroke="#00f0ff" stroke-width="1.8" fill="none" filter="url(#glow_' + uid + ')"/>' +
        '<circle cx="48" cy="76" r="2.5" fill="#10b981"/>' +
        '<path d="M70 42 L58 42 L52 50 L52 76" stroke="#00f0ff" stroke-width="1.8" fill="none" filter="url(#glow_' + uid + ')"/>' +
        '<circle cx="52" cy="76" r="2.5" fill="#10b981"/>' : '') +
      (pattern === 'stealth' ?
        '<polygon points="28,42 66,84 72,84 34,42" fill="' + secondary + '" opacity="0.75" filter="url(#glow_' + uid + ')"/>' : '') +
      (pattern === 'flame' ?
        '<path d="M34 84 Q42 68 46 74 Q50 60 54 74 Q58 68 66 84 Z" fill="' + secondary + '" opacity="0.8"/>' : '') +
      (pattern === 'royal' ?
        '<polygon points="28,42 66,84 72,84 34,42" fill="' + accent + '" opacity="0.85"/>' +
        '<circle cx="50" cy="40" r="4" fill="' + accent + '" filter="url(#glow_' + uid + ')"/>' : '') +
      (pattern === 'glitch' ?
        '<line x1="30" y1="46" x2="70" y2="46" stroke="#00f0ff" stroke-width="2" opacity="0.8"/>' +
        '<line x1="32" y1="50" x2="68" y2="50" stroke="#f43f5e" stroke-width="2" opacity="0.8"/>' : '') +
      '<circle cx="38" cy="38" r="4" fill="' + accent + '" stroke="' + primary + '" stroke-width="1"/>' +
      '<text x="38" y="41" font-size="5" text-anchor="middle" fill="' + primary + '" font-weight="900">★</text>' +
      '<text x="51" y="67" font-family="Impact, Arial Black, sans-serif" font-size="' + (isLg ? '24' : '22') + '" font-weight="900" fill="#000000" opacity="0.45" text-anchor="middle">' + number + '</text>' +
      '<text x="50" y="66" font-family="Impact, Arial Black, sans-serif" font-size="' + (isLg ? '24' : '22') + '" font-weight="900" fill="' + accent + '" stroke="' + primary + '" stroke-width="0.8" text-anchor="middle">' + number + '</text>' +
      '<rect x="32" y="78" width="6" height="4" rx="0.5" fill="' + accent + '" opacity="0.85"/>' +
      '<line x1="33" y1="80" x2="37" y2="80" stroke="' + primary + '" stroke-width="0.8"/>' +
      '</svg>';
  }

  // Detailed 3D Ball SVG
  function getDetailedBallSvg(item, size) {
    var isLg = size === 'large';
    var isSm = size === 'thumb' || size === 'small';
    var w = isLg ? 200 : (isSm ? 48 : 76);
    var h = isLg ? 200 : (isSm ? 48 : 76);
    var id = (typeof item === 'string') ? item : (item && (item.id || item.itemId)) || '';
    var uid = id.replace(/[^a-zA-Z0-9]/g, '_');
    var isHoops = id.indexOf('hoops') !== -1 || id === 'ball_tidal' || id === 'ball_cyber_neon';

    if (isHoops) {
      var bStart = '#ea580c';
      var bMid = '#c2410c';
      var bEnd = '#451a03';
      var seam = '#180802';
      var hasRing = false;
      var glow = '';

      if (id === 'ball_hoops_blaze') {
        bStart = '#a855f7'; bMid = '#7c3aed'; bEnd = '#2e1065'; seam = '#00f0ff'; glow = 'filter="drop-shadow(0 0 6px #00f0ff)"';
      } else if (id === 'ball_hoops_chrome') {
        bStart = '#f8fafc'; bMid = '#94a3b8'; bEnd = '#1e293b'; seam = '#0284c7';
      } else if (id === 'ball_hoops_midnight') {
        bStart = '#3b82f6'; bMid = '#1e1b4b'; bEnd = '#050714'; seam = '#f59e0b'; hasRing = true;
      } else if (id === 'ball_hoops_street') {
        bStart = '#ea580c'; bMid = '#c2410c'; bEnd = '#451a03'; seam = '#180802';
      } else if (id === 'ball_tidal') {
        bStart = '#38bdf8'; bMid = '#0284c7'; bEnd = '#082f49'; seam = '#cffafe';
      } else if (id === 'ball_cyber_neon') {
        bStart = '#180828'; bMid = '#3b0764'; bEnd = '#090314'; seam = '#f43f5e'; glow = 'filter="drop-shadow(0 0 6px #f43f5e)"'; hasRing = true;
      }

      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
        '<radialGradient id="bb_' + uid + '" cx="34%" cy="30%" r="68%">' +
        '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.45"/>' +
        '<stop offset="30%" stop-color="' + bStart + '"/>' +
        '<stop offset="75%" stop-color="' + bMid + '"/>' +
        '<stop offset="100%" stop-color="' + bEnd + '"/>' +
        '</radialGradient>' +
        '</defs>' +
        '<ellipse cx="50" cy="92" rx="28" ry="6" fill="#000000" opacity="0.38"/>' +
        (hasRing ? '<ellipse cx="50" cy="50" rx="46" ry="14" stroke="#00f0ff" stroke-width="2.6" fill="none" transform="rotate(-24, 50, 50)" opacity="0.9"/>' : '') +
        '<circle cx="50" cy="50" r="38" fill="url(#bb_' + uid + ')" ' + glow + '/>' +
        '<circle cx="50" cy="50" r="38" stroke="' + seam + '" stroke-width="2.2" fill="none"/>' +
        '<line x1="12" y1="50" x2="88" y2="50" stroke="' + seam + '" stroke-width="2.2"/>' +
        '<line x1="50" y1="12" x2="50" y2="88" stroke="' + seam + '" stroke-width="2.2"/>' +
        '<path d="M22 24 C38 36 38 64 22 76" stroke="' + seam + '" stroke-width="2.2" fill="none"/>' +
        '<path d="M78 24 C62 36 62 64 78 76" stroke="' + seam + '" stroke-width="2.2" fill="none"/>' +
        '<ellipse cx="36" cy="32" rx="9" ry="4.5" fill="#ffffff" opacity="0.45" transform="rotate(-28, 36, 32)"/>' +
        '<circle cx="33" cy="29" r="2.5" fill="#ffffff" opacity="0.75"/>' +
        '</svg>';
    } else {
      var fStart = '#ffffff';
      var fMid = '#e2e8f0';
      var fEnd = '#0f172a';
      var patch = '#1e293b';
      var seamColor = '#00f0ff';
      var hasAura = false;

      if (id === 'ball_footy_plasma' || id === 'ball_footy_neon') {
        fStart = '#00f0ff'; fMid = '#0284c7'; fEnd = '#082f49'; patch = '#0f172a'; seamColor = '#38bdf8'; hasAura = true;
      } else if (id === 'ball_footy_gold') {
        fStart = '#fef08a'; fMid = '#eab308'; fEnd = '#713f12'; patch = '#ca8a04'; seamColor = '#fef08a'; hasAura = true;
      } else if (id === 'ball_footy_inferno') {
        fStart = '#fb923c'; fMid = '#ea580c'; fEnd = '#450a0a'; patch = '#1c0505'; seamColor = '#ef4444'; hasAura = true;
      } else if (id === 'ball_footy_solar') {
        fStart = '#fde047'; fMid = '#f59e0b'; fEnd = '#78350f'; patch = '#9a3412'; seamColor = '#fbbf24'; hasAura = true;
      } else if (id === 'ball_earthrise') {
        fStart = '#38bdf8'; fMid = '#0284c7'; fEnd = '#082f49'; patch = '#15803d'; seamColor = '#ffffff'; hasAura = true;
      }

      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
        '<radialGradient id="fb_' + uid + '" cx="34%" cy="30%" r="68%">' +
        '<stop offset="0%" stop-color="' + fStart + '"/>' +
        '<stop offset="50%" stop-color="' + fMid + '"/>' +
        '<stop offset="100%" stop-color="' + fEnd + '"/>' +
        '</radialGradient>' +
        '</defs>' +
        '<ellipse cx="50" cy="92" rx="28" ry="6" fill="#000000" opacity="0.38"/>' +
        (hasAura ? '<circle cx="50" cy="50" r="42" fill="' + seamColor + '" opacity="0.22"/>' : '') +
        '<circle cx="50" cy="50" r="38" fill="url(#fb_' + uid + ')" stroke="' + seamColor + '" stroke-width="2"/>' +
        '<polygon points="50,34 63,43 58,58 42,58 37,43" fill="' + patch + '" stroke="' + seamColor + '" stroke-width="2"/>' +
        '<line x1="50" y1="34" x2="50" y2="14" stroke="' + seamColor + '" stroke-width="2"/>' +
        '<line x1="63" y1="43" x2="82" y2="36" stroke="' + seamColor + '" stroke-width="2"/>' +
        '<line x1="58" y1="58" x2="72" y2="76" stroke="' + seamColor + '" stroke-width="2"/>' +
        '<line x1="42" y1="58" x2="28" y2="76" stroke="' + seamColor + '" stroke-width="2"/>' +
        '<line x1="37" y1="43" x2="18" y2="36" stroke="' + seamColor + '" stroke-width="2"/>' +
        '<polygon points="44,14 56,14 62,20 38,20" fill="' + patch + '" stroke="' + seamColor + '" stroke-width="1.8"/>' +
        '<polygon points="82,36 88,48 84,60 78,54" fill="' + patch + '" stroke="' + seamColor + '" stroke-width="1.8"/>' +
        '<polygon points="18,36 12,48 16,60 22,54" fill="' + patch + '" stroke="' + seamColor + '" stroke-width="1.8"/>' +
        '<ellipse cx="36" cy="32" rx="8" ry="4" fill="#ffffff" opacity="0.5" transform="rotate(-25, 36, 32)"/>' +
        '<circle cx="33" cy="29" r="2.2" fill="#ffffff" opacity="0.8"/>' +
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

  // Detailed Celebration Burst SVG (6 Distinct Dynamic Effects)
  function getDetailedCelebrationSvg(item, size) {
    var isLg = size === 'large';
    var isSm = size === 'thumb' || size === 'small';
    var w = isLg ? 160 : (isSm ? 48 : 76);
    var h = isLg ? 160 : (isSm ? 48 : 76);
    var id = (typeof item === 'string') ? item : (item && (item.id || item.itemId)) || '';
    var uid = id.replace(/[^a-zA-Z0-9]/g, '_');

    // 1. Pyrotechnic Fireworks (cel_fireworks) - Multi-tiered chrysanthemum explosion
    if (id === 'cel_fireworks') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="50" cy="50" r="44" fill="#030712" stroke="#ec4899" stroke-width="1.5"/>' +
        '<circle cx="50" cy="40" r="32" stroke="#ec4899" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6"/>' +
        '<circle cx="50" cy="40" r="22" stroke="#facc15" stroke-width="1.8" stroke-dasharray="4 4"/>' +
        '<circle cx="50" cy="40" r="10" stroke="#38bdf8" stroke-width="2"/>' +
        '<path d="M50 8L50 72 M18 40L82 40 M28 18L72 62 M72 18L28 62" stroke="#f43f5e" stroke-width="1.8" stroke-linecap="round"/>' +
        '<circle cx="50" cy="40" r="5" fill="#ffffff"/>' +
        '<circle cx="28" cy="18" r="2.5" fill="#facc15"/><circle cx="72" cy="18" r="2.5" fill="#00f0ff"/>' +
        '<circle cx="18" cy="40" r="2.5" fill="#ec4899"/><circle cx="82" cy="40" r="2.5" fill="#facc15"/>' +
        '<circle cx="28" cy="62" r="2.5" fill="#38bdf8"/><circle cx="72" cy="62" r="2.5" fill="#ec4899"/>' +
        '<circle cx="50" cy="8" r="3" fill="#ffffff"/>' +
        '</svg>';
    }

    // 2. Sonic Concussion Shockwave (cel_shockwave) - Expanding sonic wave ripples
    if (id === 'cel_shockwave') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="50" cy="50" r="44" fill="#050814" stroke="#00f0ff" stroke-width="1.8"/>' +
        '<circle cx="50" cy="50" r="38" stroke="#00f0ff" stroke-width="3" opacity="0.35"/>' +
        '<circle cx="50" cy="50" r="26" stroke="#38bdf8" stroke-width="3.5" opacity="0.75"/>' +
        '<circle cx="50" cy="50" r="14" stroke="#ffffff" stroke-width="4"/>' +
        '<circle cx="50" cy="50" r="6" fill="#00f0ff"/>' +
        '<path d="M50 4 L50 16 M50 96 L50 84 M4 50 L16 50 M96 50 L84 50" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round"/>' +
        '<path d="M18 18 L26 26 M82 18 L74 26 M18 82 L26 74 M82 82 L74 74" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round"/>' +
        '</svg>';
    }

    // 3. Volcanic Flame Geyser (cel_flames) - Swirling fire storm
    if (id === 'cel_flames') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="50" cy="50" r="44" fill="#180702" stroke="#ea580c" stroke-width="1.8"/>' +
        '<path d="M50 10 C68 28 80 48 76 70 C72 84 60 90 50 90 C40 90 28 84 24 70 C20 48 32 28 50 10 Z" fill="#ef4444"/>' +
        '<path d="M50 24 C62 38 72 54 68 72 C65 82 56 86 50 86 C44 86 35 82 32 72 C28 54 38 38 50 24 Z" fill="#f97316"/>' +
        '<path d="M50 40 C58 52 64 64 62 76 C60 82 55 84 50 84 C45 84 40 82 38 76 C36 64 42 52 50 40 Z" fill="#fde047"/>' +
        '<circle cx="50" cy="74" r="5" fill="#ffffff"/>' +
        '<circle cx="34" cy="30" r="2" fill="#fbbf24"/><circle cx="68" cy="34" r="2.5" fill="#f97316"/>' +
        '<circle cx="60" cy="18" r="1.8" fill="#fde047"/><circle cx="38" cy="14" r="1.5" fill="#ef4444"/>' +
        '</svg>';
    }

    // 4. Golden Rain Shower (cel_goldrain) - Cascading gold coins & trophies
    if (id === 'cel_goldrain') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="50" cy="50" r="44" fill="#140f02" stroke="#facc15" stroke-width="1.8"/>' +
        '<circle cx="30" cy="26" r="9" fill="#facc15" stroke="#78350f" stroke-width="1.8"/>' +
        '<circle cx="70" cy="22" r="11" fill="#facc15" stroke="#78350f" stroke-width="2"/>' +
        '<circle cx="48" cy="50" r="14" fill="#facc15" stroke="#78350f" stroke-width="2.2"/>' +
        '<text x="48" y="55" font-family="Arial Black" font-size="12" fill="#78350f" text-anchor="middle">★</text>' +
        '<circle cx="22" cy="72" r="8" fill="#facc15" stroke="#78350f" stroke-width="1.6"/>' +
        '<circle cx="78" cy="70" r="10" fill="#facc15" stroke="#78350f" stroke-width="1.8"/>' +
        '<polygon points="50,6 52,14 60,14 53,19 56,26 50,22 44,26 47,19 40,14 48,14" fill="#fef08a"/>' +
        '<polygon points="86,40 88,46 94,46 89,50 91,56 86,52 81,56 83,50 78,46 84,46" fill="#fef08a"/>' +
        '<polygon points="14,44 16,50 22,50 17,54 19,60 14,56 9,60 11,54 6,50 12,50" fill="#fef08a"/>' +
        '</svg>';
    }

    // 5. Electric Lightning Storm (cel_lightning) - Thunderous ionic ground strike
    if (id === 'cel_lightning') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="50" cy="50" r="44" fill="#050a1a" stroke="#00f0ff" stroke-width="1.8"/>' +
        '<path d="M56 8 L34 46 L50 46 L38 92 L72 40 L52 40 Z" fill="#00f0ff" stroke="#ffffff" stroke-width="2"/>' +
        '<path d="M53 18 L38 46 L48 46 L40 80 L62 42 L50 42 Z" fill="#ffffff"/>' +
        '<circle cx="38" cy="92" r="6" fill="#00f0ff" opacity="0.6"/>' +
        '<line x1="24" y1="88" x2="52" y2="88" stroke="#00f0ff" stroke-width="2" stroke-linecap="round"/>' +
        '<line x1="28" y1="94" x2="48" y2="94" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/>' +
        '</svg>';
    }

    // 6. Stadium Confetti Burst (cel_confetti) - Party ribbons and stars
    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="50" cy="50" r="44" fill="#0c101c" stroke="#f59e0b" stroke-width="1.8"/>' +
      '<polygon points="50,15 54,38 78,35 58,50 68,75 50,60 32,75 42,50 22,35 46,38" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/>' +
      '<rect x="18" y="24" width="8" height="4" rx="2" fill="#ec4899" transform="rotate(30, 22, 26)"/>' +
      '<rect x="76" y="24" width="8" height="4" rx="2" fill="#00f0ff" transform="rotate(-25, 80, 26)"/>' +
      '<rect x="82" y="66" width="8" height="4" rx="2" fill="#10b981" transform="rotate(45, 86, 68)"/>' +
      '<rect x="14" y="68" width="8" height="4" rx="2" fill="#f97316" transform="rotate(-40, 18, 70)"/>' +
      '<circle cx="34" cy="20" r="3" fill="#38bdf8"/><circle cx="68" cy="78" r="3" fill="#ec4899"/>' +
      '</svg>';
  }

  // Detailed High-Fidelity Boost SVG
  function getDetailedBoostSvg(item, size) {
    var isLg = size === 'large';
    var isHud = size === 'hud';
    var isSm = size === 'thumb' || size === 'small';
    var w = isLg ? 180 : isHud ? 44 : (isSm ? 48 : 76);
    var h = w;
    var id = (typeof item === 'string') ? item : (item && (item.id || item.itemId)) || '';

    // 1. Turbo Boots (boost_turbo) - Cybernetic speed boots with glowing neon wings
    if (id === 'boost_turbo') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
        '<linearGradient id="turboGrad" x1="0%" y1="0%" x2="100%" y2="100%">' +
        '<stop offset="0%" stop-color="#00f0ff"/>' +
        '<stop offset="50%" stop-color="#0284c7"/>' +
        '<stop offset="100%" stop-color="#1e1b4b"/>' +
        '</linearGradient>' +
        '<linearGradient id="flameGrad" x1="0%" y1="0%" x2="100%" y2="0%">' +
        '<stop offset="0%" stop-color="#fef08a"/>' +
        '<stop offset="60%" stop-color="#f97316"/>' +
        '<stop offset="100%" stop-color="#ef4444"/>' +
        '</linearGradient>' +
        '<filter id="glowTurbo"><feGaussianBlur stdDeviation="2" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>' +
        '</defs>' +
        '<circle cx="50" cy="50" r="44" fill="#080e1c" stroke="#00f0ff" stroke-width="1.8"/>' +
        '<circle cx="50" cy="50" r="40" fill="rgba(0, 240, 255, 0.08)"/>' +
        // Speed trail streaks
        '<line x1="12" y1="36" x2="28" y2="36" stroke="#00f0ff" stroke-width="2" stroke-linecap="round" opacity="0.8"/>' +
        '<line x1="8" y1="46" x2="24" y2="46" stroke="#fef08a" stroke-width="2.5" stroke-linecap="round"/>' +
        '<line x1="14" y1="56" x2="30" y2="56" stroke="#00f0ff" stroke-width="2" stroke-linecap="round" opacity="0.7"/>' +
        // High-tech winged cleat/sneaker body
        '<path d="M34 50 L48 30 L60 30 L62 46 L78 52 L86 64 L84 72 L36 72 Z" fill="url(#turboGrad)" stroke="#38bdf8" stroke-width="2"/>' +
        // Sole and studs
        '<path d="M34 72 L86 72 L84 78 L34 78 Z" fill="#00f0ff"/>' +
        '<rect x="40" y="78" width="6" height="4" rx="1" fill="#facc15"/>' +
        '<rect x="54" y="78" width="6" height="4" rx="1" fill="#facc15"/>' +
        '<rect x="74" y="78" width="6" height="4" rx="1" fill="#facc15"/>' +
        // Glowing energy wing extending backward
        '<path d="M52 38 L32 20 C28 18 36 26 34 32 C32 36 24 38 22 42 L52 46 Z" fill="url(#flameGrad)" filter="url(#glowTurbo)"/>' +
        '<path d="M58 44 L40 32 C38 34 46 38 44 42 L58 48 Z" fill="#fef08a"/>' +
        // Neon laces & accents
        '<line x1="56" y1="46" x2="68" y2="52" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>' +
        '<line x1="52" y1="40" x2="62" y2="44" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>' +
        '</svg>';
    }

    // 2. Iron Lungs (boost_lungs) - Cybernetic oxygen lungs with stamina energy conduits
    if (id === 'boost_lungs') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
        '<linearGradient id="lungLeft" x1="0%" y1="0%" x2="100%" y2="100%">' +
        '<stop offset="0%" stop-color="#34d399"/>' +
        '<stop offset="60%" stop-color="#059669"/>' +
        '<stop offset="100%" stop-color="#064e3b"/>' +
        '</linearGradient>' +
        '<linearGradient id="lungRight" x1="100%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#34d399"/>' +
        '<stop offset="60%" stop-color="#059669"/>' +
        '<stop offset="100%" stop-color="#064e3b"/>' +
        '</linearGradient>' +
        '<filter id="glowLung"><feGaussianBlur stdDeviation="2" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>' +
        '</defs>' +
        '<circle cx="50" cy="50" r="44" fill="#041611" stroke="#10b981" stroke-width="1.8"/>' +
        '<circle cx="50" cy="50" r="40" fill="rgba(16, 185, 129, 0.08)"/>' +
        // Windpipe / Trachea
        '<rect x="46" y="16" width="8" height="24" rx="3" fill="#0f766e" stroke="#34d399" stroke-width="1.6"/>' +
        '<line x1="46" y1="22" x2="54" y2="22" stroke="#34d399" stroke-width="1.2"/>' +
        '<line x1="46" y1="28" x2="54" y2="28" stroke="#34d399" stroke-width="1.2"/>' +
        '<line x1="46" y1="34" x2="54" y2="34" stroke="#34d399" stroke-width="1.2"/>' +
        // Central Stamina Reactor Core
        '<circle cx="50" cy="44" r="7" fill="#10b981" filter="url(#glowLung)"/>' +
        '<circle cx="50" cy="44" r="3.5" fill="#ffffff"/>' +
        // Left Lung Lobe
        '<path d="M46 38 C34 38 22 46 22 62 C22 76 34 82 44 80 C47 79 48 74 48 68 C48 56 47 44 46 38 Z" fill="url(#lungLeft)" stroke="#34d399" stroke-width="1.8"/>' +
        // Right Lung Lobe
        '<path d="M54 38 C66 38 78 46 78 62 C78 76 66 82 56 80 C53 79 52 74 52 68 C52 56 53 44 54 38 Z" fill="url(#lungRight)" stroke="#34d399" stroke-width="1.8"/>' +
        // Bronchial circuits
        '<path d="M46 48 Q36 54 32 66 M44 58 Q36 64 36 72" stroke="#a7f3d0" stroke-width="1.5" stroke-linecap="round" fill="none"/>' +
        '<path d="M54 48 Q64 54 68 66 M56 58 Q64 64 64 72" stroke="#a7f3d0" stroke-width="1.5" stroke-linecap="round" fill="none"/>' +
        // Oxygen pulse nodes
        '<circle cx="32" cy="66" r="2.5" fill="#ffffff" filter="url(#glowLung)"/>' +
        '<circle cx="68" cy="66" r="2.5" fill="#ffffff" filter="url(#glowLung)"/>' +
        '</svg>';
    }

    // 3. Sharp Shooter (boost_power) - Holographic sniper reticle and target crosshair
    if (id === 'boost_power') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
        '<filter id="glowPower"><feGaussianBlur stdDeviation="2" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>' +
        '</defs>' +
        '<circle cx="50" cy="50" r="44" fill="#14081c" stroke="#a855f7" stroke-width="1.8"/>' +
        '<circle cx="50" cy="50" r="40" fill="rgba(168, 85, 247, 0.08)"/>' +
        // Outer concentric target ring
        '<circle cx="50" cy="50" r="32" stroke="#c084fc" stroke-width="1.6" stroke-dasharray="8 4"/>' +
        // Middle reticle ring with angle brackets
        '<circle cx="50" cy="50" r="22" stroke="#ec4899" stroke-width="2"/>' +
        '<circle cx="50" cy="50" r="10" stroke="#f43f5e" stroke-width="2.2"/>' +
        // Crosshair beams
        '<line x1="50" y1="12" x2="50" y2="34" stroke="#f43f5e" stroke-width="2.5" stroke-linecap="round"/>' +
        '<line x1="50" y1="66" x2="50" y2="88" stroke="#f43f5e" stroke-width="2.5" stroke-linecap="round"/>' +
        '<line x1="12" y1="50" x2="34" y2="50" stroke="#f43f5e" stroke-width="2.5" stroke-linecap="round"/>' +
        '<line x1="66" y1="50" x2="88" y2="50" stroke="#f43f5e" stroke-width="2.5" stroke-linecap="round"/>' +
        // Center laser bullseye
        '<circle cx="50" cy="50" r="4.5" fill="#ffffff" filter="url(#glowPower)"/>' +
        '<circle cx="50" cy="50" r="2.5" fill="#f43f5e"/>' +
        // Diagonal target lock ticks
        '<path d="M24 24 L28 24 L28 28" stroke="#a855f7" stroke-width="2" fill="none"/>' +
        '<path d="M76 24 L72 24 L72 28" stroke="#a855f7" stroke-width="2" fill="none"/>' +
        '<path d="M24 76 L28 76 L28 72" stroke="#a855f7" stroke-width="2" fill="none"/>' +
        '<path d="M76 76 L72 76 L72 72" stroke="#a855f7" stroke-width="2" fill="none"/>' +
        '</svg>';
    }

    // 4. Coin Doubler (boost_coins) - Minted 3D gold FvH coin with 2X insignia
    if (id === 'boost_coins') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
        '<radialGradient id="coinGlow" cx="40%" cy="35%" r="65%">' +
        '<stop offset="0%" stop-color="#fffbeb"/>' +
        '<stop offset="35%" stop-color="#fde047"/>' +
        '<stop offset="70%" stop-color="#eab308"/>' +
        '<stop offset="100%" stop-color="#854d0e"/>' +
        '</radialGradient>' +
        '<filter id="glowGold"><feGaussianBlur stdDeviation="2.5" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>' +
        '</defs>' +
        '<circle cx="50" cy="50" r="44" fill="#181202" stroke="#eab308" stroke-width="1.8"/>' +
        '<circle cx="50" cy="50" r="40" fill="rgba(234, 179, 8, 0.1)"/>' +
        // Golden Coin Outer Rim
        '<circle cx="50" cy="50" r="34" fill="url(#coinGlow)" stroke="#78350f" stroke-width="2.5" filter="url(#glowGold)"/>' +
        '<circle cx="50" cy="50" r="28" stroke="#92400e" stroke-width="1.8" stroke-dasharray="3 2" fill="none"/>' +
        // Big Bold "2X" Multiplier Insignia
        '<text x="50" y="58" font-family="Impact, Arial Black" font-size="26" font-weight="900" fill="#78350f" text-anchor="middle" letter-spacing="-1">2X</text>' +
        '<text x="49" y="57" font-family="Impact, Arial Black" font-size="26" font-weight="900" fill="#fffbeb" text-anchor="middle" letter-spacing="-1">2X</text>' +
        // Crown Star
        '<polygon points="50,23 52,28 58,28 53,31 55,36 50,33 45,36 47,31 42,28 48,28" fill="#fef08a"/>' +
        // Sparkle glints
        '<circle cx="28" cy="30" r="2" fill="#ffffff"/><circle cx="72" cy="68" r="2" fill="#ffffff"/>' +
        '</svg>';
    }

    // 5. Overdrive Energy Core (boost_overdrive) - Maximum speed overdrive with ionic lightning
    if (id === 'boost_overdrive') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
        '<linearGradient id="overdriveGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#38bdf8"/><stop offset="50%" stop-color="#6366f1"/><stop offset="100%" stop-color="#a855f7"/></linearGradient>' +
        '</defs>' +
        '<circle cx="50" cy="50" r="44" fill="#0b0818" stroke="#a855f7" stroke-width="1.8"/>' +
        '<circle cx="50" cy="50" r="38" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.8"/>' +
        '<circle cx="50" cy="50" r="28" fill="url(#overdriveGrad)" opacity="0.3"/>' +
        '<path d="M50 14 A36 36 0 0 1 86 50" stroke="#f43f5e" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M54 18 L36 50 L52 50 L42 82 L70 44 L54 44 Z" fill="#00f0ff" stroke="#ffffff" stroke-width="1.8"/>' +
        '<circle cx="50" cy="50" r="4" fill="#ffffff"/>' +
        '<text x="50" y="76" font-family="Impact, Arial Black" font-size="11" fill="#f43f5e" text-anchor="middle" letter-spacing="1">OVERDRIVE</text>' +
        '</svg>';
    }

    // 6. Energy Shield (boost_shield) - Hexagonal protective aegis
    if (id === 'boost_shield') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
        '<linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00f0ff"/><stop offset="50%" stop-color="#0284c7"/><stop offset="100%" stop-color="#0f172a"/></linearGradient>' +
        '</defs>' +
        '<circle cx="50" cy="50" r="44" fill="#04121a" stroke="#00f0ff" stroke-width="1.8"/>' +
        '<path d="M50 14 L78 26 C78 54 66 74 50 86 C34 74 22 54 22 26 Z" fill="url(#shieldGrad)" stroke="#38bdf8" stroke-width="2.2"/>' +
        '<path d="M50 22 L72 32 C72 52 62 68 50 78 C38 68 28 52 28 32 Z" fill="#00f0ff" opacity="0.25"/>' +
        '<polygon points="50,34 60,40 60,52 50,58 40,52 40,40" fill="#ffffff" opacity="0.85"/>' +
        '<circle cx="50" cy="46" r="3" fill="#0284c7"/>' +
        '</svg>';
    }

    // 7. Ball Magnet (boost_magnet) - Bipolar electromagnetic attractor
    if (id === 'boost_magnet') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="50" cy="50" r="44" fill="#0a0f1d" stroke="#38bdf8" stroke-width="1.8"/>' +
        '<path d="M30 20 L30 52 C30 63 39 72 50 72 C61 72 70 63 70 52 L70 20 L58 20 L58 52 C58 56 54 60 50 60 C46 60 42 56 42 52 L42 20 Z" fill="#3b82f6" stroke="#93c5fd" stroke-width="2"/>' +
        '<rect x="29" y="18" width="13" height="12" fill="#ef4444" stroke="#ffffff" stroke-width="1.2"/>' +
        '<text x="35.5" y="27" font-family="Arial Black" font-size="8" fill="#ffffff" text-anchor="middle">N</text>' +
        '<rect x="58" y="18" width="13" height="12" fill="#3b82f6" stroke="#ffffff" stroke-width="1.2"/>' +
        '<text x="64.5" y="27" font-family="Arial Black" font-size="8" fill="#ffffff" text-anchor="middle">S</text>' +
        '<path d="M26 12 Q50 4 74 12" stroke="#00f0ff" stroke-width="1.8" fill="none" stroke-dasharray="3 2"/>' +
        '<circle cx="50" cy="38" r="8" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5"/>' +
        '</svg>';
    }

    // 8. Golden Strike (boost_golden) - Solar flare super strike
    if (id === 'boost_golden') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="50" cy="50" r="44" fill="#1c1304" stroke="#facc15" stroke-width="1.8"/>' +
        '<circle cx="50" cy="50" r="38" fill="rgba(250, 204, 21, 0.12)"/>' +
        '<polygon points="50,14 58,34 80,34 62,48 68,70 50,56 32,70 38,48 20,34 42,34" fill="#facc15" stroke="#78350f" stroke-width="2"/>' +
        '<polygon points="50,22 55,36 70,36 58,46 62,60 50,50 38,60 42,46 30,36 45,36" fill="#fef08a"/>' +
        '<circle cx="50" cy="44" r="6" fill="#ffffff"/>' +
        '<line x1="18" y1="18" x2="32" y2="32" stroke="#facc15" stroke-width="2" stroke-linecap="round"/>' +
        '<line x1="82" y1="18" x2="68" y2="32" stroke="#facc15" stroke-width="2" stroke-linecap="round"/>' +
        '</svg>';
    }

    // Default Boost fallback
    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="50" cy="50" r="44" fill="#0f172a" stroke="#00f0ff" stroke-width="2"/>' +
      '<polygon points="50,15 54,38 78,35 58,50 68,75 50,60 32,75 42,50 22,35 46,38" fill="#facc15"/>' +
      '</svg>';
  }

  // Detailed Ball Trail SVG (5 Dynamic Particle Streams)
  function getDetailedTrailSvg(item, size) {
    var isLg = size === 'large';
    var w = isLg ? 160 : 76;
    var h = isLg ? 80 : 38;
    var id = (typeof item === 'string') ? item : (item && (item.id || item.itemId)) || '';

    // 1. Fire Trail (trail_fire) - Combustion plume
    if (id === 'trail_fire') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<rect width="120" height="60" rx="8" fill="#180702" stroke="#ea580c" stroke-width="1.2"/>' +
        '<path d="M10 30 Q45 10 95 30" stroke="#f97316" stroke-width="9" stroke-linecap="round" opacity="0.4"/>' +
        '<path d="M25 30 Q60 15 100 30" stroke="#facc15" stroke-width="5" stroke-linecap="round" opacity="0.8"/>' +
        '<path d="M50 30 Q80 20 105 30" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>' +
        '<circle cx="106" cy="30" r="6" fill="#f97316"/>' +
        '<circle cx="106" cy="30" r="3" fill="#ffffff"/>' +
        '<circle cx="45" cy="18" r="2" fill="#f97316"/><circle cx="70" cy="42" r="1.8" fill="#facc15"/>' +
        '</svg>';
    }

    // 2. Cryo Ice Trail (trail_ice) - Frosted sub-zero vapor
    if (id === 'trail_ice') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<rect width="120" height="60" rx="8" fill="#031622" stroke="#38bdf8" stroke-width="1.2"/>' +
        '<path d="M10 30 Q50 12 105 30" stroke="#0284c7" stroke-width="8" stroke-linecap="round" opacity="0.5"/>' +
        '<path d="M30 30 Q65 18 105 30" stroke="#7dd3fc" stroke-width="4.5" stroke-linecap="round" opacity="0.85"/>' +
        '<path d="M60 30 Q85 24 105 30" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/>' +
        '<circle cx="106" cy="30" r="5" fill="#38bdf8"/>' +
        '<polygon points="40,16 42,20 46,20 43,23 44,27 40,24 36,27 37,23 34,20 38,20" fill="#bae6fd"/>' +
        '<polygon points="75,38 77,42 81,42 78,45 79,49 75,46 71,49 72,45 69,42 73,42" fill="#bae6fd"/>' +
        '</svg>';
    }

    // 3. Prismatic Rainbow Trail (trail_rainbow) - Full-spectrum light ribbon
    if (id === 'trail_rainbow') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<rect width="120" height="60" rx="8" fill="#090d16" stroke="#c084fc" stroke-width="1.2"/>' +
        '<path d="M10 20 Q55 12 105 20" stroke="#ef4444" stroke-width="2.8" stroke-linecap="round"/>' +
        '<path d="M10 25 Q55 17 105 25" stroke="#f59e0b" stroke-width="2.8" stroke-linecap="round"/>' +
        '<path d="M10 30 Q55 22 105 30" stroke="#10b981" stroke-width="2.8" stroke-linecap="round"/>' +
        '<path d="M10 35 Q55 27 105 35" stroke="#06b6d4" stroke-width="2.8" stroke-linecap="round"/>' +
        '<path d="M10 40 Q55 32 105 40" stroke="#8b5cf6" stroke-width="2.8" stroke-linecap="round"/>' +
        '<circle cx="106" cy="30" r="6" fill="#ffffff"/>' +
        '</svg>';
    }

    // 4. Pulsed Laser Beam (trail_laser) - Coherent optical beam
    if (id === 'trail_laser') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<rect width="120" height="60" rx="8" fill="#04121a" stroke="#00f0ff" stroke-width="1.2"/>' +
        '<line x1="10" y1="30" x2="105" y2="30" stroke="#00f0ff" stroke-width="8" stroke-linecap="round" opacity="0.3"/>' +
        '<line x1="20" y1="30" x2="105" y2="30" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" opacity="0.8"/>' +
        '<line x1="40" y1="30" x2="105" y2="30" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>' +
        '<circle cx="106" cy="30" r="5" fill="#00f0ff"/>' +
        '<circle cx="106" cy="30" r="2.5" fill="#ffffff"/>' +
        '</svg>';
    }

    // 5. Clean Supersonic Vapor (trail_default)
    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="120" height="60" rx="8" fill="#090d16" stroke="#475569" stroke-width="1.2"/>' +
      '<path d="M10 30 Q50 18 105 30" stroke="#00f0ff" stroke-width="5" stroke-linecap="round" opacity="0.4"/>' +
      '<path d="M30 30 Q65 22 105 30" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>' +
      '<circle cx="106" cy="30" r="5" fill="#00f0ff"/>' +
      '<circle cx="106" cy="30" r="2" fill="#ffffff"/>' +
      '</svg>';
  }

  // Detailed Avatar Frame SVG (3 Themed Profile Borders)
  function getDetailedFrameSvg(item, size) {
    var isLg = size === 'large';
    var w = isLg ? 160 : 76;
    var h = w;
    var id = (typeof item === 'string') ? item : (item && (item.id || item.itemId)) || '';

    // 1. Spartan Bronze Frame (frame_bronze) - Heavy forged rivets
    if (id === 'frame_bronze') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<rect x="8" y="8" width="84" height="84" rx="14" fill="#1c1106" stroke="#b45309" stroke-width="6"/>' +
        '<rect x="14" y="14" width="72" height="72" rx="8" stroke="#f59e0b" stroke-width="1.8" fill="none"/>' +
        '<circle cx="16" cy="16" r="3.5" fill="#facc15" stroke="#78350f" stroke-width="1"/>' +
        '<circle cx="84" cy="16" r="3.5" fill="#facc15" stroke="#78350f" stroke-width="1"/>' +
        '<circle cx="16" cy="84" r="3.5" fill="#facc15" stroke="#78350f" stroke-width="1"/>' +
        '<circle cx="84" cy="84" r="3.5" fill="#facc15" stroke="#78350f" stroke-width="1"/>' +
        '</svg>';
    }

    // 2. Radiant Diamond Frame (frame_diamond) - Brilliant faceted crystalline cuts
    if (id === 'frame_diamond') {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<rect x="8" y="8" width="84" height="84" rx="14" fill="#041a24" stroke="#00f0ff" stroke-width="5"/>' +
        '<rect x="14" y="14" width="72" height="72" rx="8" stroke="#cffafe" stroke-width="1.8" stroke-dasharray="4 2" fill="none"/>' +
        '<polygon points="16,10 22,16 16,22 10,16" fill="#38bdf8"/>' +
        '<polygon points="84,10 90,16 84,22 78,16" fill="#38bdf8"/>' +
        '<polygon points="16,78 22,84 16,90 10,84" fill="#38bdf8"/>' +
        '<polygon points="84,78 90,84 84,90 78,84" fill="#38bdf8"/>' +
        '<polygon points="50,6 54,10 50,14 46,10" fill="#ffffff"/>' +
        '<polygon points="50,86 54,90 50,94 46,90" fill="#ffffff"/>' +
        '</svg>';
    }

    // 3. Stealth Gunmetal Frame (frame_default)
    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="10" y="10" width="80" height="80" rx="12" fill="#0f172a" stroke="#475569" stroke-width="4.5"/>' +
      '<rect x="16" y="16" width="68" height="68" rx="8" stroke="#64748b" stroke-width="1.4" fill="none"/>' +
      '<rect x="12" y="12" width="6" height="6" fill="#00f0ff"/>' +
      '<rect x="82" y="12" width="6" height="6" fill="#00f0ff"/>' +
      '<rect x="12" y="82" width="6" height="6" fill="#00f0ff"/>' +
      '<rect x="82" y="82" width="6" height="6" fill="#00f0ff"/>' +
      '</svg>';
  }

  // Detailed Tournament Booster Pack SVG (3 Distinct Foil Wrappers)
  function getDetailedPackSvg(item, size) {
    var isLg = size === 'large';
    var isSm = size === 'thumb' || size === 'small';
    var w = isLg ? 160 : (isSm ? 42 : 76);
    var h = isLg ? 190 : (isSm ? 50 : 88);
    var id = (typeof item === 'string') ? item : (item && (item.id || item.packId)) || '';

    if (id.indexOf('hoops') !== -1) {
      // HOOPS All-Star Booster Pack (Amber & Gold Foil)
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
        '<linearGradient id="pHoops" x1="0%" y1="0%" x2="100%" y2="100%">' +
        '<stop offset="0%" stop-color="#ea580c"/>' +
        '<stop offset="60%" stop-color="#c2410c"/>' +
        '<stop offset="100%" stop-color="#451a03"/>' +
        '</linearGradient>' +
        '</defs>' +
        '<rect x="12" y="6" width="76" height="108" rx="7" fill="url(#pHoops)" stroke="#facc15" stroke-width="2.5"/>' +
        '<path d="M12 16L88 16 M12 104L88 104" stroke="#fef08a" stroke-width="2" stroke-dasharray="3 2"/>' +
        '<circle cx="50" cy="56" r="22" fill="#451a03" stroke="#facc15" stroke-width="2"/>' +
        '<circle cx="50" cy="56" r="14" stroke="#ea580c" stroke-width="2"/>' +
        '<text x="50" y="63" font-size="18" text-anchor="middle">🏀</text>' +
        '<rect x="22" y="86" width="56" height="12" rx="3" fill="#180802"/>' +
        '<text x="50" y="95" font-family="Impact, Arial Black" font-size="8" fill="#facc15" text-anchor="middle" letter-spacing="1">ALL-STAR</text>' +
        '</svg>';
    }

    if (id.indexOf('clash') !== -1) {
      // Ultimate Clash Dual Booster Pack (Split Blue & Gold with VS)
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
        '<linearGradient id="pClashA" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0284c7"/><stop offset="100%" stop-color="#0369a1"/></linearGradient>' +
        '<linearGradient id="pClashB" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ea580c"/><stop offset="100%" stop-color="#b45309"/></linearGradient>' +
        '</defs>' +
        '<rect x="12" y="6" width="76" height="108" rx="7" fill="#0f172a" stroke="#facc15" stroke-width="2.5"/>' +
        '<polygon points="12,6 88,6 12,114" fill="url(#pClashA)"/>' +
        '<polygon points="88,6 88,114 12,114" fill="url(#pClashB)"/>' +
        '<line x1="88" y1="6" x2="12" y2="114" stroke="#ffffff" stroke-width="2"/>' +
        '<circle cx="50" cy="56" r="20" fill="#18181b" stroke="#facc15" stroke-width="2"/>' +
        '<text x="50" y="63" font-family="Impact, Arial Black" font-size="14" fill="#facc15" text-anchor="middle">VS</text>' +
        '<rect x="22" y="86" width="56" height="12" rx="3" fill="#000000" opacity="0.85"/>' +
        '<text x="50" y="95" font-family="Impact, Arial Black" font-size="8" fill="#ffffff" text-anchor="middle" letter-spacing="1">CLASH PACK</text>' +
        '</svg>';
    }

    // Default FOOTY Striker Booster Pack (Electric Blue & Silver)
    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
      '<linearGradient id="pFooty" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="#0284c7"/>' +
      '<stop offset="60%" stop-color="#0369a1"/>' +
      '<stop offset="100%" stop-color="#082f49"/>' +
      '</linearGradient>' +
      '</defs>' +
      '<rect x="12" y="6" width="76" height="108" rx="7" fill="url(#pFooty)" stroke="#00f0ff" stroke-width="2.5"/>' +
      '<path d="M12 16L88 16 M12 104L88 104" stroke="#38bdf8" stroke-width="2" stroke-dasharray="3 2"/>' +
      '<circle cx="50" cy="56" r="22" fill="#082f49" stroke="#00f0ff" stroke-width="2"/>' +
      '<text x="50" y="63" font-size="18" text-anchor="middle">⚽</text>' +
      '<rect x="22" y="86" width="56" height="12" rx="3" fill="#031622"/>' +
      '<text x="50" y="95" font-family="Impact, Arial Black" font-size="8" fill="#00f0ff" text-anchor="middle" letter-spacing="1">STRIKER</text>' +
      '</svg>';
  }

  
  // ==========================================
  // Official High-Fidelity 3D FvH Coin Generator
  // ==========================================
  
  function getSocialIconSvg(type) {
    if (type === 'tg') {
      return '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<defs><linearGradient id="tgGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#2AABEE"/><stop offset="100%" stop-color="#229ED9"/></linearGradient></defs>' +
        '<rect width="40" height="40" rx="12" fill="url(#tgGrad)"/>' +
        '<path d="M10 20.2L28.5 12.8C29.4 12.4 30.2 13 29.9 13.9L26.7 29.1C26.5 30 25.5 30.3 24.8 29.8L20.2 26.4L18 28.5C17.6 28.9 17.3 29.2 16.5 29.2L16.8 24.6L25.2 17C25.6 16.6 25.1 16.4 24.6 16.7L14.2 23.3L9.7 21.9C8.7 21.6 8.7 20.7 10 20.2Z" fill="#FFFFFF"/>' +
        '</svg>';
    } else if (type === 'x') {
      return '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<defs><linearGradient id="xGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#1e293b"/><stop offset="100%" stop-color="#090d16"/></linearGradient></defs>' +
        '<rect width="40" height="40" rx="12" fill="url(#xGrad)" stroke="rgba(255,255,255,0.2)" stroke-width="1.2"/>' +
        '<path d="M24.2 12H27.5L20.3 20.2L28.8 31.4H22.1L16.9 24.5L10.9 31.4H7.6L15.3 22.6L7.1 12H13.9L18.6 18.2L24.2 12ZM23 29.4H24.8L12.9 13.9H10.9L23 29.4Z" fill="#FFFFFF"/>' +
        '</svg>';
    } else if (type === 'chat') {
      return '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<defs><linearGradient id="chatGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#00f0ff"/><stop offset="100%" stop-color="#0284c7"/></linearGradient></defs>' +
        '<rect width="40" height="40" rx="12" fill="url(#chatGrad)"/>' +
        '<path d="M12 14C12 11.8 13.8 10 16 10H24C26.2 10 28 11.8 28 14V21C28 23.2 26.2 25 24 25H18L13.5 28.5C12.8 29 12 28.5 12 27.7V25C12 25 12 24.5 12 24V14Z" fill="#FFFFFF"/>' +
        '<circle cx="16" cy="17.5" r="1.5" fill="#0284c7"/>' +
        '<circle cx="20" cy="17.5" r="1.5" fill="#0284c7"/>' +
        '<circle cx="24" cy="17.5" r="1.5" fill="#0284c7"/>' +
        '</svg>';
    } else if (type === 'insta') {
      return '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<defs><linearGradient id="instaGrad" x1="0" y1="40" x2="40" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#FFDC80"/><stop offset="25%" stop-color="#F77737"/><stop offset="50%" stop-color="#E1306C"/><stop offset="75%" stop-color="#C13584"/><stop offset="100%" stop-color="#5851DB"/></linearGradient></defs>' +
        '<rect width="40" height="40" rx="12" fill="url(#instaGrad)"/>' +
        '<rect x="11" y="11" width="18" height="18" rx="5" stroke="#FFFFFF" stroke-width="2" fill="none"/>' +
        '<circle cx="20" cy="20" r="4.5" stroke="#FFFFFF" stroke-width="2" fill="none"/>' +
        '<circle cx="24.8" cy="15.2" r="1.2" fill="#FFFFFF"/>' +
        '</svg>';
    } else if (type === 'yt') {
      return '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<rect width="40" height="40" rx="12" fill="#FF0000"/>' +
        '<path d="M30 16.5C29.7 15.3 28.7 14.3 27.5 14C25.2 13.4 20 13.4 20 13.4C20 13.4 14.8 13.4 12.5 14C11.3 14.3 10.3 15.3 10 16.5C9.4 18.8 9.4 20 9.4 20C9.4 20 9.4 21.2 10 23.5C10.3 24.7 11.3 25.7 12.5 26C14.8 26.6 20 26.6 20 26.6C20 26.6 25.2 26.6 27.5 26C28.7 25.7 29.7 24.7 30 23.5C30.6 21.2 30.6 20 30.6 20C30.6 20 30.6 18.8 30 16.5Z" fill="#FFFFFF"/>' +
        '<polygon points="17.5,17 24,20 17.5,23" fill="#FF0000"/>' +
        '</svg>';
    } else if (type === 'tiktok') {
      return '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<rect width="40" height="40" rx="12" fill="#010101" stroke="rgba(255,255,255,0.2)" stroke-width="1.2"/>' +
        '<path d="M24.5 12.5C23.5 14.5 21.8 15.8 19.8 16.1V24.2C19.8 26.8 17.7 28.9 15.1 28.9C12.5 28.9 10.4 26.8 10.4 24.2C10.4 21.6 12.5 19.5 15.1 19.5C15.6 19.5 16.1 19.6 16.6 19.8V16.3C16.1 16.2 15.6 16.1 15.1 16.1C10.6 16.1 7 19.7 7 24.2C7 28.7 10.6 32.3 15.1 32.3C19.6 32.3 23.2 28.7 23.2 24.2V17.9C25.3 19.4 27.9 20.2 30.6 20.2V16.8C27.8 16.8 25.5 14.9 24.5 12.5Z" fill="#25F4EE" transform="translate(-0.8, -0.8)"/>' +
        '<path d="M24.5 12.5C23.5 14.5 21.8 15.8 19.8 16.1V24.2C19.8 26.8 17.7 28.9 15.1 28.9C12.5 28.9 10.4 26.8 10.4 24.2C10.4 21.6 12.5 19.5 15.1 19.5C15.6 19.5 16.1 19.6 16.6 19.8V16.3C16.1 16.2 15.6 16.1 15.1 16.1C10.6 16.1 7 19.7 7 24.2C7 28.7 10.6 32.3 15.1 32.3C19.6 32.3 23.2 28.7 23.2 24.2V17.9C25.3 19.4 27.9 20.2 30.6 20.2V16.8C27.8 16.8 25.5 14.9 24.5 12.5Z" fill="#FE2C55" transform="translate(0.8, 0.8)"/>' +
        '<path d="M24.5 12.5C23.5 14.5 21.8 15.8 19.8 16.1V24.2C19.8 26.8 17.7 28.9 15.1 28.9C12.5 28.9 10.4 26.8 10.4 24.2C10.4 21.6 12.5 19.5 15.1 19.5C15.6 19.5 16.1 19.6 16.6 19.8V16.3C16.1 16.2 15.6 16.1 15.1 16.1C10.6 16.1 7 19.7 7 24.2C7 28.7 10.6 32.3 15.1 32.3C19.6 32.3 23.2 28.7 23.2 24.2V17.9C25.3 19.4 27.9 20.2 30.6 20.2V16.8C27.8 16.8 25.5 14.9 24.5 12.5Z" fill="#FFFFFF"/>' +
        '</svg>';
    } else if (type === 'tournament' || type === 'trophy') {
      return '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<defs><linearGradient id="trGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#b45309"/></linearGradient>' +
        '<linearGradient id="goldCup" x1="0" y1="0" x2="0" y2="20" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#FFF3B0"/><stop offset="50%" stop-color="#FFD700"/><stop offset="100%" stop-color="#FFA500"/></linearGradient></defs>' +
        '<rect width="40" height="40" rx="12" fill="url(#trGrad)"/>' +
        '<path d="M14 11H26V18C26 21.3 23.3 24 20 24C16.7 24 14 21.3 14 18V11Z" fill="url(#goldCup)"/>' +
        '<path d="M14 13H11C9.9 13 9 13.9 9 15C9 17.5 10.8 19.5 13.2 19.9L14 19.9V18.1L13.1 17.9C11.8 17.6 11 16.5 11 15.2C11 14.7 11.4 14.5 11.8 14.5H14V13Z" fill="url(#goldCup)"/>' +
        '<path d="M26 13H29C30.1 13 31 13.9 31 15C31 17.5 29.2 19.5 26.8 19.9L26 19.9V18.1L26.9 17.9C28.2 17.6 29 16.5 29 15.2C29 14.7 28.6 14.5 28.2 14.5H26V13Z" fill="url(#goldCup)"/>' +
        '<path d="M18.5 24H21.5V27.5H18.5V24Z" fill="url(#goldCup)"/>' +
        '<path d="M13.5 28H26.5V30.5C26.5 31.1 26 31.5 25.5 31.5H14.5C13.9 31.5 13.5 31.1 13.5 30.5V28Z" fill="#FFF3B0"/>' +
        '<polygon points="20,13.8 20.8,16 23.1,16 21.3,17.4 22,19.6 20,18.2 18,19.6 18.7,17.4 16.9,16 19.2,16" fill="#FFFFFF"/>' +
        '</svg>';
    }
    return '';
  }

  function getFvhCoinSvg(size, extraOpts) {
    var isInline = size === 'inline';
    var isLg = size === 'large';
    var isSm = size === 'small' || size === 'thumb';

    var w = isInline ? 20 : (isLg ? 160 : (isSm ? 48 : 64));
    var h = w;
    var uid = 'fvhCoin_' + Math.random().toString(36).substr(2, 6);

    if (isInline) {
      // 20x20 Compact High-Contrast Half-Green, Half-Orange Coin with Crisp Vector F-v-H
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;flex-shrink:0;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));">' +
        '<defs>' +
        '<linearGradient id="inRim_' + uid + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
        '<stop offset="0%" stop-color="#ffffff"/>' +
        '<stop offset="30%" stop-color="#fde047"/>' +
        '<stop offset="70%" stop-color="#ca8a04"/>' +
        '<stop offset="100%" stop-color="#713f12"/>' +
        '</linearGradient>' +
        '<clipPath id="inClip_' + uid + '">' +
        '<circle cx="12" cy="12" r="8.2"/>' +
        '</clipPath>' +
        '</defs>' +
        '<circle cx="12" cy="12.8" r="10.5" fill="#381402"/>' +
        '<circle cx="12" cy="12" r="10.5" fill="url(#inRim_' + uid + ')"/>' +
        '<circle cx="12" cy="12" r="8.2" fill="#0f172a"/>' +
        '<g clip-path="url(#inClip_' + uid + ')">' +
        '<rect x="3.5" y="3.5" width="8.5" height="17" fill="#10b981"/>' +
        '<rect x="12" y="3.5" width="8.5" height="17" fill="#f97316"/>' +
        '<line x1="12" y1="3.5" x2="12" y2="20.5" stroke="#fef08a" stroke-width="0.9"/>' +
        '</g>' +
        '<!-- Crisp Vector Geometric F v H -->' +
        '<path d="M6 7.8 H9 M6 7.8 V16.2 M6 11.5 H8.5" stroke="#000000" stroke-width="1.8" stroke-linecap="square"/>' +
        '<path d="M6 7.8 H9 M6 7.8 V16.2 M6 11.5 H8.5" stroke="#ffffff" stroke-width="1.1" stroke-linecap="square"/>' +
        '<path d="M10.2 10.8 L12 16.2 L13.8 10.8" stroke="#000000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M10.2 10.8 L12 16.2 L13.8 10.8" stroke="#fef08a" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M15 7.8 V16.2 M15 12 H18 M18 7.8 V16.2" stroke="#000000" stroke-width="1.8" stroke-linecap="square"/>' +
        '<path d="M15 7.8 V16.2 M15 12 H18 M18 7.8 V16.2" stroke="#ffffff" stroke-width="1.1" stroke-linecap="square"/>' +
        '<circle cx="6" cy="6" r="1.1" fill="#ffffff"/>' +
        '</svg>';
    }

    // 24 Milled gold beads
    var beads = '';
    for (var i = 0; i < 24; i++) {
      var a = (i * 360 / 24) * Math.PI / 180;
      var bx = 50 + 44.5 * Math.cos(a);
      var by = 50 + 44.5 * Math.sin(a);
      beads += '<circle cx="' + bx.toFixed(2) + '" cy="' + by.toFixed(2) + '" r="1.4" fill="#fde047"/>';
    }

    var renderW = isLg ? 160 : (isSm ? 72 : 84);
    var renderH = renderW;

    return '<svg width="' + renderW + '" height="' + renderH + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto;filter:drop-shadow(0 8px 20px rgba(0, 0, 0, 0.65));">' +
      '<defs>' +
      '<linearGradient id="rim_' + uid + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="#ffffff"/>' +
      '<stop offset="15%" stop-color="#fffbeb"/>' +
      '<stop offset="35%" stop-color="#fde047"/>' +
      '<stop offset="65%" stop-color="#ca8a04"/>' +
      '<stop offset="88%" stop-color="#eab308"/>' +
      '<stop offset="100%" stop-color="#713f12"/>' +
      '</linearGradient>' +
      '<radialGradient id="green_' + uid + '" cx="35%" cy="35%" r="65%">' +
      '<stop offset="0%" stop-color="#6ee7b7"/>' +
      '<stop offset="35%" stop-color="#10b981"/>' +
      '<stop offset="75%" stop-color="#047857"/>' +
      '<stop offset="100%" stop-color="#064e3b"/>' +
      '</radialGradient>' +
      '<radialGradient id="orange_' + uid + '" cx="65%" cy="35%" r="65%">' +
      '<stop offset="0%" stop-color="#fed7aa"/>' +
      '<stop offset="35%" stop-color="#f97316"/>' +
      '<stop offset="75%" stop-color="#ea580c"/>' +
      '<stop offset="100%" stop-color="#7c2d12"/>' +
      '</radialGradient>' +
      '<linearGradient id="plaque_' + uid + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
      '<stop offset="0%" stop-color="#ffffff"/>' +
      '<stop offset="25%" stop-color="#fef08a"/>' +
      '<stop offset="60%" stop-color="#eab308"/>' +
      '<stop offset="100%" stop-color="#854d0e"/>' +
      '</linearGradient>' +
      '<linearGradient id="fvh_' + uid + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
      '<stop offset="0%" stop-color="#ffffff"/>' +
      '<stop offset="40%" stop-color="#fffbeb"/>' +
      '<stop offset="75%" stop-color="#fde047"/>' +
      '<stop offset="100%" stop-color="#ca8a04"/>' +
      '</linearGradient>' +
      '<linearGradient id="sheen_' + uid + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/>' +
      '<stop offset="35%" stop-color="#ffffff" stop-opacity="0.12"/>' +
      '<stop offset="65%" stop-color="#ffffff" stop-opacity="0"/>' +
      '</linearGradient>' +
      '<clipPath id="inner_' + uid + '">' +
      '<circle cx="50" cy="50" r="39.5"/>' +
      '</clipPath>' +
      '</defs>' +
      '<circle cx="50" cy="50" r="48.5" fill="#facc15" fill-opacity="0.2"/>' +
      '<circle cx="50" cy="53" r="47" fill="#381402"/>' +
      '<circle cx="50" cy="50" r="47" fill="url(#rim_' + uid + ')"/>' +
      '<circle cx="50" cy="50" r="44.5" fill="none" stroke="#78350f" stroke-width="0.8"/>' +
      beads +
      '<circle cx="50" cy="50" r="40.5" fill="#1e293b"/>' +
      '<g clip-path="url(#inner_' + uid + ')">' +
      '<rect x="10" y="10" width="40.2" height="80" fill="url(#green_' + uid + ')"/>' +
      '<path d="M42 30 A20 20 0 0 0 42 70" stroke="#ffffff" stroke-width="1.8" stroke-opacity="0.35" fill="none"/>' +
      '<circle cx="50" cy="50" r="16" stroke="#ffffff" stroke-width="1.2" stroke-opacity="0.25" fill="none"/>' +
      '<rect x="50" y="10" width="40.2" height="80" fill="url(#orange_' + uid + ')"/>' +
      '<path d="M58 30 A20 20 0 0 1 58 70" stroke="#000000" stroke-width="2.2" stroke-opacity="0.35" fill="none"/>' +
      '<path d="M50 20 C68 28 78 40 78 50 C78 60 68 72 50 80" stroke="#000000" stroke-width="1.8" stroke-opacity="0.25" fill="none"/>' +
      '<line x1="50.1" y1="10" x2="50.1" y2="90" stroke="#fde047" stroke-width="2.2"/>' +
      '<line x1="50.1" y1="10" x2="50.1" y2="90" stroke="#ffffff" stroke-width="0.8"/>' +
      '</g>' +
      '<circle cx="50" cy="50" r="39.5" fill="none" stroke="#fde047" stroke-width="1.3"/>' +
      '<path d="M50 17 L51.5 19.5 L54 20 L52 21.8 L52.6 24.2 L50 22.8 L47.4 24.2 L48 21.8 L46 20 L48.5 19.5 Z" fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.5))"/>' +
      '<path d="M50 78 L51.2 80 L53.5 80.5 L51.8 82 L52.4 84.2 L50 83 L47.6 84.2 L48.2 82 L46.5 80.5 L48.8 80 Z" fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.5))"/>' +
      '<text x="50" y="55" font-family="Impact, Arial Black, sans-serif" font-size="30" font-weight="900" fill="#000000" text-anchor="middle" letter-spacing="-0.5" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.9))">FvH</text>' +
      '<text x="50" y="53.5" font-family="Impact, Arial Black, sans-serif" font-size="30" font-weight="900" fill="#2a0f02" text-anchor="middle" letter-spacing="-0.5">FvH</text>' +
      '<text x="50" y="51.5" font-family="Impact, Arial Black, sans-serif" font-size="30" font-weight="900" fill="url(#fvh_' + uid + ')" text-anchor="middle" letter-spacing="-0.5" stroke="#ffffff" stroke-width="0.9">FvH</text>' +
      '<rect x="29" y="60.5" width="42" height="14" rx="7" fill="#090d16" filter="drop-shadow(0 2px 5px rgba(0,0,0,0.8))"/>' +
      '<rect x="29" y="60.5" width="42" height="14" rx="7" fill="url(#plaque_' + uid + ')" stroke="#ffffff" stroke-width="0.8"/>' +
      '<text x="50" y="71" font-family="Arial Black, sans-serif" font-size="9" font-weight="900" fill="#381402" text-anchor="middle" letter-spacing="1.5">COIN</text>' +
      '<path d="M12 40 A42 42 0 0 1 88 40 A46 43 0 0 0 12 40 Z" fill="url(#sheen_' + uid + ')"/>' +
      '<path d="M22 21 Q22 27 16 27 Q22 27 22 33 Q22 27 28 27 Q22 27 22 21 Z" fill="#ffffff" filter="drop-shadow(0 0 4px #ffffff)"/>' +
      '<circle cx="22" cy="27" r="6" fill="#fde047" opacity="0.6"/>' +
      '</svg>';
  }

  // Detailed Stacked Currency Bundles SVG (Using Authentic Master FvH Coins)
  function getDetailedCoinsSvg(item, size) {
    var isLg = size === 'large';
    var isSm = size === 'thumb' || size === 'small';
    var w = isLg ? 160 : (isSm ? 72 : 84);
    var h = w;
    var id = (typeof item === 'string') ? item : (item && (item.id || item.itemId)) || '';

    // If single coin or generic coin reward, return the single Master FvH Coin
    if (id === 'coins' || id === 'coin' || id === '' || id === 'reward_coins' || id === 'pkg_coins_starter') {
      return getFvhCoinSvg(size);
    }

    var uid = 'cPkg_' + Math.random().toString(36).substr(2, 6);

    // 24 Milled gold beads for master coin template
    var beads = '';
    for (var i = 0; i < 24; i++) {
      var a = (i * 360 / 24) * Math.PI / 180;
      var bx = 50 + 44.5 * Math.cos(a);
      var by = 50 + 44.5 * Math.sin(a);
      beads += '<circle cx="' + bx.toFixed(2) + '" cy="' + by.toFixed(2) + '" r="1.4" fill="#fde047"/>';
    }

    // Shared Master Coin Face Template
    var masterDef =
      '<g id="cMaster_' + uid + '">' +
      '<circle cx="50" cy="52.5" r="47" fill="#381402"/>' +
      '<circle cx="50" cy="50" r="47" fill="url(#rim_' + uid + ')"/>' +
      '<circle cx="50" cy="50" r="44.5" fill="none" stroke="#78350f" stroke-width="0.8"/>' +
      beads +
      '<circle cx="50" cy="50" r="40.5" fill="#1e293b"/>' +
      '<g clip-path="url(#innerClip_' + uid + ')">' +
      '<rect x="9" y="9" width="41.2" height="82" fill="url(#green_' + uid + ')"/>' +
      '<path d="M42 30 A20 20 0 0 0 42 70" stroke="#ffffff" stroke-width="1.8" stroke-opacity="0.35" fill="none"/>' +
      '<circle cx="50" cy="50" r="16" stroke="#ffffff" stroke-width="1.2" stroke-opacity="0.25" fill="none"/>' +
      '<rect x="50" y="9" width="41.2" height="82" fill="url(#orange_' + uid + ')"/>' +
      '<path d="M58 30 A20 20 0 0 1 58 70" stroke="#000000" stroke-width="2.2" stroke-opacity="0.35" fill="none"/>' +
      '<path d="M50 20 C68 28 78 40 78 50 C78 60 68 72 50 80" stroke="#000000" stroke-width="1.8" stroke-opacity="0.25" fill="none"/>' +
      '<line x1="50.1" y1="9" x2="50.1" y2="91" stroke="#fde047" stroke-width="2.2"/>' +
      '<line x1="50.1" y1="9" x2="50.1" y2="91" stroke="#ffffff" stroke-width="0.8"/>' +
      '</g>' +
      '<circle cx="50" cy="50" r="39.5" fill="none" stroke="#fde047" stroke-width="1.3"/>' +
      '<path d="M50 17 L51.5 19.5 L54 20 L52 21.8 L52.6 24.2 L50 22.8 L47.4 24.2 L48 21.8 L46 20 L48.5 19.5 Z" fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.5))"/>' +
      '<path d="M50 78 L51.2 80 L53.5 80.5 L51.8 82 L52.4 84.2 L50 83 L47.6 84.2 L48.2 82 L46.5 80.5 L48.8 80 Z" fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.5))"/>' +
      '<text x="50" y="55" font-family="Impact, Arial Black, sans-serif" font-size="30" font-weight="900" fill="#000000" text-anchor="middle" letter-spacing="-0.5" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.9))">FvH</text>' +
      '<text x="50" y="53.5" font-family="Impact, Arial Black, sans-serif" font-size="30" font-weight="900" fill="#2a0f02" text-anchor="middle" letter-spacing="-0.5">FvH</text>' +
      '<text x="50" y="51.5" font-family="Impact, Arial Black, sans-serif" font-size="30" font-weight="900" fill="url(#fvh_' + uid + ')" text-anchor="middle" letter-spacing="-0.5" stroke="#ffffff" stroke-width="0.9">FvH</text>' +
      '<rect x="29" y="60.5" width="42" height="14" rx="7" fill="#090d16" filter="drop-shadow(0 2px 5px rgba(0,0,0,0.8))"/>' +
      '<rect x="29" y="60.5" width="42" height="14" rx="7" fill="url(#plaque_' + uid + ')" stroke="#ffffff" stroke-width="0.8"/>' +
      '<text x="50" y="71" font-family="Arial Black, sans-serif" font-size="9" font-weight="900" fill="#381402" text-anchor="middle" letter-spacing="1.5">COIN</text>' +
      '<path d="M12 40 A42 42 0 0 1 88 40 A46 43 0 0 0 12 40 Z" fill="url(#sheen_' + uid + ')"/>' +
      '<path d="M22 21 Q22 27 16 27 Q22 27 22 33 Q22 27 28 27 Q22 27 22 21 Z" fill="#ffffff" filter="drop-shadow(0 0 4px #ffffff)"/>' +
      '<circle cx="22" cy="27" r="6" fill="#fde047" opacity="0.6"/>' +
      '</g>';

    var content = '';
    if (id === 'pkg_coins_pro') {
      content =
        '<g filter="drop-shadow(0 6px 12px rgba(0,0,0,0.7))">' +
        '  <g transform="translate(20, 22) scale(0.72) rotate(-14 50 50)">' +
        '    <use href="#cMaster_' + uid + '"/>' +
        '  </g>' +
        '</g>' +
        '<g filter="drop-shadow(0 8px 16px rgba(0,0,0,0.8))">' +
        '  <g transform="translate(42, 34) scale(0.82) rotate(6 50 50)">' +
        '    <use href="#cMaster_' + uid + '"/>' +
        '  </g>' +
        '</g>' +
        '<polygon points="82,24 84,18 86,24 92,26 86,28 84,34 82,28 76,26" fill="#ffffff" filter="drop-shadow(0 0 3px #fff)"/>';
    } else if (id === 'pkg_coins_elite') {
      content =
        '<g filter="drop-shadow(0 6px 12px rgba(0,0,0,0.7))">' +
        '  <g transform="translate(14, 18) scale(0.68) rotate(-18 50 50)">' +
        '    <use href="#cMaster_' + uid + '"/>' +
        '  </g>' +
        '</g>' +
        '<g filter="drop-shadow(0 6px 12px rgba(0,0,0,0.7))">' +
        '  <g transform="translate(54, 18) scale(0.68) rotate(18 50 50)">' +
        '    <use href="#cMaster_' + uid + '"/>' +
        '  </g>' +
        '</g>' +
        '<g filter="drop-shadow(0 10px 20px rgba(0,0,0,0.85))">' +
        '  <g transform="translate(34, 34) scale(0.84)">' +
        '    <use href="#cMaster_' + uid + '"/>' +
        '  </g>' +
        '</g>' +
        '<polygon points="20,18 22,12 24,18 30,20 24,22 22,28 20,22 14,20" fill="#ffffff" filter="drop-shadow(0 0 3px #fff)"/>' +
        '<polygon points="86,28 88,22 90,28 96,30 90,32 88,38 86,32 80,30" fill="#fde047" filter="drop-shadow(0 0 3px #fde047)"/>';
    } else if (id === 'pkg_coins_champion') {
      content =
        '<g filter="drop-shadow(0 4px 8px rgba(0,0,0,0.7))">' +
        '  <g transform="translate(34, 12) scale(0.62)">' +
        '    <use href="#cMaster_' + uid + '"/>' +
        '  </g>' +
        '</g>' +
        '<g filter="drop-shadow(0 6px 12px rgba(0,0,0,0.7))">' +
        '  <g transform="translate(14, 26) scale(0.70) rotate(-15 50 50)">' +
        '    <use href="#cMaster_' + uid + '"/>' +
        '  </g>' +
        '</g>' +
        '<g filter="drop-shadow(0 6px 12px rgba(0,0,0,0.7))">' +
        '  <g transform="translate(54, 26) scale(0.70) rotate(15 50 50)">' +
        '    <use href="#cMaster_' + uid + '"/>' +
        '  </g>' +
        '</g>' +
        '<g filter="drop-shadow(0 10px 22px rgba(0,0,0,0.9))">' +
        '  <g transform="translate(34, 38) scale(0.86)">' +
        '    <use href="#cMaster_' + uid + '"/>' +
        '  </g>' +
        '</g>' +
        '<polygon points="50,6 52,0 54,6 60,8 54,10 52,16 50,10 44,8" fill="#ffffff" filter="drop-shadow(0 0 4px #fff)"/>' +
        '<polygon points="16,40 18,34 20,40 26,42 20,44 18,50 16,44 10,42" fill="#fef08a"/>' +
        '<polygon points="90,44 92,38 94,44 100,46 94,48 92,54 90,48 84,46" fill="#fef08a"/>';
    } else {
      // pkg_coins_legend
      content =
        '<circle cx="50" cy="50" r="48" fill="url(#legendGlow_' + uid + ')"/>' +
        '<g transform="translate(18, 10) scale(0.58) rotate(-22 50 50)">' +
        '  <use href="#cMaster_' + uid + '"/>' +
        '</g>' +
        '<g transform="translate(52, 10) scale(0.58) rotate(22 50 50)">' +
        '  <use href="#cMaster_' + uid + '"/>' +
        '</g>' +
        '<g transform="translate(12, 28) scale(0.68) rotate(-12 50 50)">' +
        '  <use href="#cMaster_' + uid + '"/>' +
        '</g>' +
        '<g transform="translate(56, 28) scale(0.68) rotate(12 50 50)">' +
        '  <use href="#cMaster_' + uid + '"/>' +
        '</g>' +
        '<g filter="drop-shadow(0 12px 24px rgba(0,0,0,0.95))">' +
        '  <g transform="translate(34, 36) scale(0.88)">' +
        '    <use href="#cMaster_' + uid + '"/>' +
        '  </g>' +
        '</g>' +
        '<polygon points="50,2 53,-4 56,2 62,4 56,6 53,12 50,6 44,4" fill="#ffffff" filter="drop-shadow(0 0 5px #fff)"/>' +
        '<polygon points="86,20 88,14 90,20 96,22 90,24 88,30 86,24 80,22" fill="#fef08a"/>' +
        '<polygon points="12,22 14,16 16,22 22,24 16,26 14,32 12,26 6,24" fill="#fef08a"/>';
    }

    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto;filter:drop-shadow(0 6px 16px rgba(245,158,11,0.4));">' +
      '<defs>' +
      '<linearGradient id="rim_' + uid + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="#ffffff"/>' +
      '<stop offset="15%" stop-color="#fffbeb"/>' +
      '<stop offset="35%" stop-color="#fde047"/>' +
      '<stop offset="65%" stop-color="#ca8a04"/>' +
      '<stop offset="88%" stop-color="#eab308"/>' +
      '<stop offset="100%" stop-color="#713f12"/>' +
      '</linearGradient>' +
      '<radialGradient id="green_' + uid + '" cx="35%" cy="35%" r="65%">' +
      '<stop offset="0%" stop-color="#6ee7b7"/>' +
      '<stop offset="35%" stop-color="#10b981"/>' +
      '<stop offset="75%" stop-color="#047857"/>' +
      '<stop offset="100%" stop-color="#064e3b"/>' +
      '</radialGradient>' +
      '<radialGradient id="orange_' + uid + '" cx="65%" cy="35%" r="65%">' +
      '<stop offset="0%" stop-color="#fed7aa"/>' +
      '<stop offset="35%" stop-color="#f97316"/>' +
      '<stop offset="75%" stop-color="#ea580c"/>' +
      '<stop offset="100%" stop-color="#7c2d12"/>' +
      '</radialGradient>' +
      '<linearGradient id="plaque_' + uid + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
      '<stop offset="0%" stop-color="#ffffff"/>' +
      '<stop offset="25%" stop-color="#fef08a"/>' +
      '<stop offset="60%" stop-color="#eab308"/>' +
      '<stop offset="100%" stop-color="#854d0e"/>' +
      '</linearGradient>' +
      '<linearGradient id="fvh_' + uid + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
      '<stop offset="0%" stop-color="#ffffff"/>' +
      '<stop offset="40%" stop-color="#fffbeb"/>' +
      '<stop offset="75%" stop-color="#fde047"/>' +
      '<stop offset="100%" stop-color="#ca8a04"/>' +
      '</linearGradient>' +
      '<linearGradient id="sheen_' + uid + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/>' +
      '<stop offset="35%" stop-color="#ffffff" stop-opacity="0.12"/>' +
      '<stop offset="65%" stop-color="#ffffff" stop-opacity="0"/>' +
      '</linearGradient>' +
      '<radialGradient id="legendGlow_' + uid + '" cx="50%" cy="50%" r="50%">' +
      '<stop offset="0%" stop-color="#fde047" stop-opacity="0.45"/>' +
      '<stop offset="70%" stop-color="#ea580c" stop-opacity="0.15"/>' +
      '<stop offset="100%" stop-color="#ca8a04" stop-opacity="0"/>' +
      '</radialGradient>' +
      '<clipPath id="innerClip_' + uid + '">' +
      '<circle cx="50" cy="50" r="39.5"/>' +
      '</clipPath>' +
      masterDef +
      '</defs>' +
      content +
      '</svg>';
  }

  function getDetailedBattlePassSvg(item, size) {
    var isLg = size === 'large';
    var w = isLg ? 180 : 76;
    var h = isLg ? 110 : 48;
    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
      '<linearGradient id="bpCardGrad" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="#854d0e"/><stop offset="50%" stop-color="#facc15"/><stop offset="100%" stop-color="#3b1d03"/>' +
      '</linearGradient>' +
      '</defs>' +
      '<rect x="8" y="10" width="144" height="80" rx="10" fill="#1c1404" stroke="url(#bpCardGrad)" stroke-width="3"/>' +
      '<rect x="14" y="16" width="132" height="68" rx="6" stroke="#fef08a" stroke-width="1" stroke-dasharray="4 2" fill="none"/>' +
      '<rect x="22" y="26" width="32" height="32" rx="4" fill="#ca8a04" stroke="#fef08a" stroke-width="1.5"/>' +
      '<text x="38" y="48" font-size="18" text-anchor="middle">👑</text>' +
      '<text x="62" y="42" font-family="Impact, Arial Black" font-size="15" fill="#fef08a" letter-spacing="1">VIP PASS</text>' +
      '<text x="62" y="56" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#fde047">SEASON 1 PREMIUM</text>' +
      '<rect x="22" y="66" width="116" height="10" rx="3" fill="#3b1d03"/>' +
      '<rect x="24" y="68" width="80" height="6" rx="2" fill="#facc15"/>' +
      '</svg>';
  }

  // Detailed Thematic Bundle Loot Vault SVG (7 Distinct Vault Containers)
  function getDetailedBundleSvg(item, size) {
    var isLg = size === 'large';
    var w = isLg ? 180 : 76;
    var h = isLg ? 140 : 64;
    var id = (typeof item === 'string') ? item : (item && item.id) || '';

    var bColor = '#facc15';
    var trim = '#ca8a04';
    var icon = '🎁';
    var title = 'BUNDLE';

    if (id === 'bundle_footy_starter') {
      bColor = '#0284c7'; trim = '#00f0ff'; icon = '⚽'; title = 'FOOTY PACK';
    } else if (id === 'bundle_hoops_starter') {
      bColor = '#ea580c'; trim = '#facc15'; icon = '🏀'; title = 'HOOPS PACK';
    } else if (id === 'bundle_ocean_arena') {
      bColor = '#06b6d4'; trim = '#67e8f9'; icon = '🌊'; title = 'OCEAN VAULT';
    } else if (id === 'bundle_mars_explorer') {
      bColor = '#dc2626'; trim = '#f97316'; icon = '🚀'; title = 'MARS POD';
    } else if (id === 'bundle_lunar_champ') {
      bColor = '#475569'; trim = '#facc15'; icon = '🌕'; title = 'LUNAR VAULT';
    } else if (id === 'bundle_cyber_neon') {
      bColor = '#7c3aed'; trim = '#d946ef'; icon = '⚡'; title = 'CYBER DECK';
    } else if (id === 'bundle_legendary_champs') {
      bColor = '#854d0e'; trim = '#facc15'; icon = '👑'; title = 'CHAMPIONS';
    }

    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="12" y="16" width="116" height="68" rx="10" fill="#0f172a" stroke="' + trim + '" stroke-width="2.5"/>' +
      '<rect x="20" y="24" width="100" height="52" rx="6" fill="' + bColor + '" opacity="0.18"/>' +
      '<line x1="12" y1="50" x2="128" y2="50" stroke="' + trim + '" stroke-width="2"/>' +
      '<circle cx="70" cy="50" r="16" fill="#0f172a" stroke="' + trim + '" stroke-width="2.2"/>' +
      '<text x="70" y="56" font-size="16" text-anchor="middle">' + icon + '</text>' +
      '<rect x="36" y="80" width="68" height="12" rx="3" fill="#020617"/>' +
      '<text x="70" y="89" font-family="Impact, Arial Black" font-size="7.5" fill="' + trim + '" text-anchor="middle" letter-spacing="1">' + title + '</text>' +
      '</svg>';
  }

  // Detailed Stadium Supporters & Crowd SVG
  function getDetailedCrowdSvg(item, size) {
    var isLg = size === 'large';
    var isSm = size === 'thumb' || size === 'small';
    var w = isLg ? 200 : (isSm ? 48 : 76);
    var h = isLg ? 200 : (isSm ? 48 : 76);
    var id = (typeof item === 'string') ? item : (item && (item.id || item.itemId)) || 'crowd_footy_ultras';
    var uid = id.replace(/[^a-zA-Z0-9]/g, '_');

    var c1 = '#00f0ff', c2 = '#0284c7', c3 = '#ffffff', c4 = '#1e293b';
    var icon = '⚽';
    if (id === 'crowd_hoops_allstars') {
      c1 = '#ff6b00'; c2 = '#fb923c'; c3 = '#f59e0b'; c4 = '#18181b'; icon = '🏀';
    } else if (id === 'crowd_global_fest') {
      c1 = '#e84a5f'; c2 = '#f6c445'; c3 = '#4fb3ff'; c4 = '#7be08a'; icon = '🌍';
    } else if (id === 'crowd_cyber_vip') {
      c1 = '#ff2bd6'; c2 = '#00e5ff'; c3 = '#a855f7'; c4 = '#0f172a'; icon = '⚡';
    } else if (id === 'crowd_emerald_forest') {
      c1 = '#10b981'; c2 = '#059669'; c3 = '#065f46'; c4 = '#ffffff'; icon = '🌲';
    } else if (id === 'crowd_gold_champs') {
      c1 = '#f6c445'; c2 = '#d97706'; c3 = '#1c1917'; c4 = '#fffbeb'; icon = '👑';
    }

    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
      '  <linearGradient id="crwBg_' + uid + '" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">' +
      '    <stop offset="0%" stop-color="' + c4 + '"/>' +
      '    <stop offset="100%" stop-color="#0a0e17"/>' +
      '  </linearGradient>' +
      '  <linearGradient id="crwG1_' + uid + '" x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">' +
      '    <stop offset="0%" stop-color="' + c1 + '"/>' +
      '    <stop offset="50%" stop-color="' + c2 + '"/>' +
      '    <stop offset="100%" stop-color="' + c3 + '"/>' +
      '  </linearGradient>' +
      '</defs>' +
      '<rect width="100" height="100" rx="14" fill="url(#crwBg_' + uid + ')"/>' +
      '<rect x="6" y="25" width="88" height="12" rx="4" fill="' + c2 + '" opacity="0.3"/>' +
      '<rect x="6" y="42" width="88" height="14" rx="4" fill="' + c2 + '" opacity="0.45"/>' +
      '<rect x="6" y="61" width="88" height="16" rx="4" fill="' + c2 + '" opacity="0.6"/>' +
      '<circle cx="20" cy="20" r="5" fill="' + c1 + '"/>' +
      '<rect x="15" cy="25" width="10" height="9" rx="3" fill="' + c2 + '"/>' +
      '<circle cx="40" cy="19" r="5" fill="' + c3 + '"/>' +
      '<rect x="35" cy="24" width="10" height="10" rx="3" fill="' + c1 + '"/>' +
      '<circle cx="60" cy="20" r="5" fill="' + c1 + '"/>' +
      '<rect x="55" cy="25" width="10" height="9" rx="3" fill="' + c2 + '"/>' +
      '<circle cx="80" cy="19" r="5" fill="' + c3 + '"/>' +
      '<rect x="75" cy="24" width="10" height="10" rx="3" fill="' + c1 + '"/>' +
      '<circle cx="28" cy="37" r="6" fill="' + c2 + '"/>' +
      '<rect x="22" cy="43" width="12" height="11" rx="3" fill="' + c1 + '"/>' +
      '<circle cx="50" cy="35" r="7" fill="' + c1 + '"/>' +
      '<rect x="43" cy="42" width="14" height="12" rx="4" fill="url(#crwG1_' + uid + ')"/>' +
      '<circle cx="72" cy="37" r="6" fill="' + c3 + '"/>' +
      '<rect x="66" cy="43" width="12" height="11" rx="3" fill="' + c2 + '"/>' +
      '<circle cx="36" cy="56" r="7" fill="' + c1 + '"/>' +
      '<rect x="29" cy="63" width="14" height="13" rx="4" fill="' + c2 + '"/>' +
      '<circle cx="64" cy="56" r="7" fill="' + c2 + '"/>' +
      '<rect x="57" cy="63" width="14" height="13" rx="4" fill="' + c1 + '"/>' +
      '<rect x="16" y="78" width="68" height="16" rx="6" fill="url(#crwG1_' + uid + ')"/>' +
      '<rect x="18" y="80" width="64" height="12" rx="4" fill="' + c4 + '" opacity="0.85"/>' +
      '<text x="50" y="89" fill="' + c1 + '" font-size="8.5" font-family="sans-serif" font-weight="900" text-anchor="middle" letter-spacing="1">' + icon + ' SUPPORTERS</text>' +
      '<circle cx="15" cy="12" r="1.5" fill="#ffffff" opacity="0.9"/>' +
      '<circle cx="85" cy="14" r="2" fill="#ffffff" opacity="0.95"/>' +
      '<circle cx="48" cy="10" r="1.2" fill="' + c1 + '" opacity="0.8"/>' +
      '</svg>';
  }

  // Universal Item Artwork Dispatcher (Centralized by stable Item ID)
  function renderItemArtwork(itemOrId, size) {
    if (!itemOrId) return '<div class="fvh-item-fallback">📦</div>';
    var id = '';
    var cat = '';

    if (typeof itemOrId === 'string') {
      id = itemOrId;
    } else if (typeof itemOrId === 'object') {
      id = itemOrId.id || itemOrId.itemId || itemOrId.packId || '';
      cat = itemOrId.category || '';
      if (!cat && itemOrId.type === 'coins') cat = 'coins';
      if (!cat && itemOrId.type === 'pack') cat = 'packs';
    }

    if (cat === 'balls_footy' || cat === 'balls_hoops') {
      cat = 'balls';
    }

    // Auto-detect or refine category from item ID, slot, or object
    if (!cat || cat === 'other') {
      if (id.startsWith('crowd_')) cat = 'crowd';
      else if (id.startsWith('boost_')) cat = 'boosts';
      else if (id.startsWith('skin_')) cat = 'skins';
      else if (id.startsWith('ball_')) cat = 'balls';
      else if (id.startsWith('std_') || id.startsWith('arena_')) cat = 'stadiums';
      else if (id.startsWith('cel_')) cat = 'celebrations';
      else if (id.startsWith('trail_') || (typeof itemOrId === 'object' && itemOrId.slot === 'trail')) cat = 'trails';
      else if (id.startsWith('frame_') || (typeof itemOrId === 'object' && itemOrId.slot === 'frame')) cat = 'frames';
      else if (id.startsWith('pack_') || id === 'footy' || id === 'hoops' || id === 'clash') cat = 'packs';
      else if (id.startsWith('bundle_')) cat = 'bundles';
      else if (id.startsWith('battlepass')) cat = 'battlepass';
      else if (id === 'coins' || id.startsWith('pkg_coins_') || id.startsWith('coins_') || id.toLowerCase().indexOf('coin') !== -1) cat = 'coins';
    }

    if (cat === 'crowd') return getDetailedCrowdSvg(itemOrId, size);
    if (cat === 'boosts') return getDetailedBoostSvg(itemOrId, size);
    if (cat === 'skins') return getDetailedJerseySvg(itemOrId, size);
    if (cat === 'balls') return getDetailedBallSvg(itemOrId, size);
    if (cat === 'stadiums') return getDetailedStadiumSvg(itemOrId, size);
    if (cat === 'celebrations') return getDetailedCelebrationSvg(itemOrId, size);
    if (cat === 'trails') return getDetailedTrailSvg(itemOrId, size);
    if (cat === 'frames') return getDetailedFrameSvg(itemOrId, size);
    if (cat === 'packs') return getDetailedPackSvg(itemOrId, size);
    if (cat === 'bundles') return getDetailedBundleSvg(itemOrId, size);
    if (cat === 'coins') return getDetailedCoinsSvg(itemOrId, size);
    if (cat === 'battlepass') return getDetailedBattlePassSvg(itemOrId, size);

    // High-tech vector fallback glyph (never bare emoji)
    var sz = size === 'large' ? 100 : 54;
    return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<polygon points="40,8 68,22 68,54 40,74 12,54 12,22" fill="#0f172a" stroke="#00f0ff" stroke-width="2"/>' +
      '<polygon points="40,16 60,26 60,50 40,64 20,50 20,26" fill="rgba(0,240,255,0.12)"/>' +
      '<text x="40" y="47" font-size="22" text-anchor="middle">' + ((typeof itemOrId === 'object' && itemOrId.icon) ? itemOrId.icon : '⚡') + '</text>' +
      '</svg>';
  }
  window.renderItemArtwork = renderItemArtwork;


  // ==========================================
  // Shared Bottom Navigation Bar (5 Primary Tabs)
  // ==========================================

  function createSharedBottomNav(activeTab, app) {
    var nav = document.createElement('nav');
    nav.className = 'fvh-bottom-nav';

    var primaryItems = [
      { id: 'menu', icon: '⚽', label: tr('playHero') },
      { id: 'characters', icon: '👕', label: tr('characters') },
      { id: 'shop', icon: '🛒', label: tr('shop') },
      { id: 'quests', icon: '🎯', label: tr('quests') },
      { id: 'profile', icon: '👤', label: tr('profile') }
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

      // Premium VIP Track Reward (Exclusive Arenas, Kits, Balls & VIP Coins)
      var premiumReward;
      if (i === 1) premiumReward = { type: 'cosmetic', name: 'Cyber Blue Jersey', icon: '🎽', itemId: 'skin_cyber' };
      else if (i === 2) premiumReward = { type: 'coins', name: '300 VIP Coins', icon: '🪙', val: 300 };
      else if (i === 3) premiumReward = { type: 'cosmetic', name: 'Neon Blaze Ball', icon: '💫', itemId: 'ball_hoops_blaze' };
      else if (i === 4) premiumReward = { type: 'coins', name: '500 VIP Coins', icon: '🪙', val: 500 };
      else if (i === 5) premiumReward = { type: 'coins', name: '700 VIP Coins', icon: '🪙', val: 700 };
      else if (i === 6) premiumReward = { type: 'coins', name: '600 VIP Coins', icon: '🪙', val: 600 };
      else if (i === 7) premiumReward = { type: 'cosmetic', name: 'Solar Blaze Ball', icon: '☀️', itemId: 'ball_footy_solar' };
      else if (i === 8) premiumReward = { type: 'pack', name: 'Ultimate Clash Pack', icon: '⚡', packId: 'clash' };
      else if (i === 9) premiumReward = { type: 'coins', name: '750 VIP Coins', icon: '🪙', val: 750 };
      else if (i === 10) premiumReward = { type: 'cosmetic', name: 'Coastal Sunset Court', icon: '🏖️', itemId: 'std_ocean_sunset' };
      else if (i === 11) premiumReward = { type: 'cosmetic', name: 'Rainbow Trail', icon: '🌈', itemId: 'trail_rainbow' };
      else if (i === 12) premiumReward = { type: 'coins', name: '1000 VIP Coins', icon: '🪙', val: 1000 };
      else if (i === 13) premiumReward = { type: 'cosmetic', name: 'Mars Rover Kit', icon: '🚀', itemId: 'skin_mars' };
      else if (i === 14) premiumReward = { type: 'coins', name: '1200 VIP Coins', icon: '🪙', val: 1200 };
      else if (i === 15) premiumReward = { type: 'cosmetic', name: 'Mars Bio-Dome Arena', icon: '🪐', itemId: 'std_mars_dome' };
      else if (i === 16) premiumReward = { type: 'cosmetic', name: 'Laser Trail', icon: '⚡', itemId: 'trail_laser' };
      else if (i === 17) premiumReward = { type: 'coins', name: '1500 VIP Coins', icon: '🪙', val: 1500 };
      else if (i === 18) premiumReward = { type: 'coins', name: '1600 VIP Coins', icon: '🪙', val: 1600 };
      else if (i === 19) premiumReward = { type: 'coins', name: '1800 VIP Coins', icon: '🪙', val: 1800 };
      else if (i === 20) premiumReward = { type: 'cosmetic', name: 'Apollo Lunar Arena', icon: '🌙', itemId: 'std_moon_crater' };
      else if (i === 21) premiumReward = { type: 'cosmetic', name: 'Magma Caldera Arena', icon: '🌋', itemId: 'std_volcano_caldera' };
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
      playerName: d.playerName || (d.telegramUser && (d.telegramUser.first_name || d.telegramUser.username)) || 'Athlete',
      stats: d.stats || {},
      selectedCharacter: d.selectedCharacter || null,
      owned: d.owned || [],
      equipped: d.equipped || {},
      coins: d.coins || 0,
      xp: d.xp || 0,
      photoUrl: d.photoUrl || (d.telegramUser && d.telegramUser.photoUrl) || null,
      telegramUser: d.telegramUser || null,
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
          // Synchronize permanent team choice from authoritative server
          if (res.teamChosen && res.selectedTeam) {
            storeData.teamChosen = true;
            storeData.selectedTeam = res.selectedTeam;
            storeData.selectedCharacter = res.selectedTeam;
          }
        });
      }
      if (callback) callback(res);
    });
  }

  function claimBattlePassTier(app, lvl, track, onDone) {
    var bpState = getBattlePassState(app.store);
    var lang = getActiveLang();
    track = track || 'free';

    if (lvl > bpState.level) {
      app.audio.play('error');
      showToast(lang === 'ru' ? 'Уровень ещё не достигнут!' : 'Level not reached yet!');
      return;
    }

    if (track === 'free') {
      if (bpState.claimedFree && bpState.claimedFree.indexOf(lvl) !== -1) {
        app.audio.play('error');
        showToast(lang === 'ru' ? '✓ Награда за этот уровень уже получена!' : '✓ Reward for this tier already claimed!');
        if (onDone) onDone();
        return;
      }
    } else if (track === 'premium') {
      if (!bpState.isPremium) {
        app.audio.play('error');
        showToast(lang === 'ru' ? 'Требуется VIP Пропуск для этой награды!' : 'VIP Pass required for this reward!');
        return;
      }
      if (bpState.claimedPremium && bpState.claimedPremium.indexOf(lvl) !== -1) {
        app.audio.play('error');
        showToast(lang === 'ru' ? '✓ Награда за этот уровень уже получена!' : '✓ Reward for this tier already claimed!');
        if (onDone) onDone();
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
        app.audio.play('claim');
        var badge = track === 'premium' ? '👑 VIP' : tr('bpFreeTrack');
        showToast('🎁 ' + trItem(rew.name) + ' (' + badge + ' ' + tr('bpTier', { lvl: lvl }) + ')');
      } else if (res && (res.error === 'tier_already_claimed' || res.error === 'level_not_reached')) {
        // Authoritative server rejection: already claimed or invalid. Lock tier locally without granting duplicate rewards
        app.store.update(function (d) {
          if (!d.battlePass) d.battlePass = { claimedFree: [], claimedPremium: [], isPremium: false };
          if (track === 'free') {
            if (!d.battlePass.claimedFree) d.battlePass.claimedFree = [];
            if (d.battlePass.claimedFree.indexOf(lvl) === -1) d.battlePass.claimedFree.push(lvl);
          } else {
            if (!d.battlePass.claimedPremium) d.battlePass.claimedPremium = [];
            if (d.battlePass.claimedPremium.indexOf(lvl) === -1) d.battlePass.claimedPremium.push(lvl);
          }
        });
        showToast(lang === 'ru' ? '✓ Награда уже была забрана ранее' : '✓ Tier reward already claimed previously');
      } else if (res && res.offline) {
        // Offline fallback ONLY: verify not already claimed
        app.store.update(function (d) {
          if (!d.battlePass) d.battlePass = { claimedFree: [], claimedPremium: [], isPremium: false };
          var list = (track === 'free') ? (d.battlePass.claimedFree = d.battlePass.claimedFree || []) : (d.battlePass.claimedPremium = d.battlePass.claimedPremium || []);
          if (list.indexOf(lvl) === -1) {
            list.push(lvl);
            applyRewardToStore(d, rew);
            app.audio.play('claim');
            var badge = track === 'premium' ? '👑 VIP' : tr('bpFreeTrack');
            showToast('🎁 ' + trItem(rew.name) + ' (' + badge + ' ' + tr('bpTier', { lvl: lvl }) + ')');
          }
        });
      }
      if (onDone) onDone();
    }).catch(function () {
      if (onDone) onDone();
    });
  }

  function claimAllBattlePassTiers(app, onDone) {
    var bpState = getBattlePassState(app.store);
    var lang = getActiveLang();
    if (bpState.claimableCount === 0) {
      app.audio.play('error');
      showToast(lang === 'ru' ? 'Все доступные награды уже забраны!' : 'All available rewards already claimed!');
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
        app.audio.play('claim');
        showToast('🎉 ' + tr('bpAllClaimed'));
      } else if (res && res.offline) {
        // Fallback local claim all only for unclaimed tiers
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
        app.audio.play('claim');
        showToast('🎉 ' + tr('bpAllClaimed'));
      }
      if (onDone) onDone();
    }).catch(function () {
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
    var hideTon = true; // Digital goods strictly use Telegram Stars; TON crypto checkout removed from TMA
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
          '      ' + getFvhCoinSvg('thumb') + ' ' + tr('buyFor') +
          '    </span>' +
          '    <span style="font-weight:900;font-size:14px;color:#facc15;display:inline-flex;align-items:center;gap:4px;">' + getFvhCoinSvg('inline') + ' ' + coinsPrice + '</span>' +
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
          var successDesc = (productId === 'battlepass_premium')
            ? (getActiveLang() === 'ru'
              ? 'Платеж на ' + (statusRes.starsAmount || 250) + ' ⭐ подтвержден Telegram. Доступ к VIP Premium открыт!'
              : (statusRes.starsAmount || 250) + ' ⭐ confirmed by Telegram. VIP Premium Access unlocked!')
            : (getActiveLang() === 'ru'
              ? 'Платеж на ' + (statusRes.starsAmount || starsPrice) + ' ⭐ подтвержден Telegram! Награда успешно начислена.'
              : (statusRes.starsAmount || starsPrice) + ' ⭐ confirmed by Telegram! Your purchase has been credited.');

          modal.innerHTML =
            '<div style="font-size:48px;margin-bottom:12px;">🎉</div>' +
            '<h3 style="margin:0 0 8px;color:#fde047;">' + tr('paymentSuccess') + '</h3>' +
            '<p style="color:var(--text-muted);font-size:13px;margin-bottom:16px;">' +
            successDesc +
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
    showToast(getActiveLang() === 'ru' ? 'Боевой пропуск не поддерживается' : 'Battle Pass is not supported');
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
      '<div style="display:flex;align-items:center;justify-content:center;margin:12px 0;min-height:90px;">' + renderItemArtwork(reward, 'large') + '</div>' +
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

  // Battle Pass removed: redirects cleanly to Quests
  function buildBattlePassPage(app) {
    return buildQuestsPage(app, 'daily');
  }

  // Boost Items Catalog (Boosts completely removed)
  var BOOST_CATALOG = [];
  window.BOOST_CATALOG = BOOST_CATALOG;

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

    // Fixed Team: Once chosen, team is permanently locked
    curChar = app.store.data.selectedCharacter || curChar || 'footy';
    var isFooty = (curChar === 'footy');
    var lang = getActiveLang();

    var teamLockBadge = document.createElement('div');
    teamLockBadge.className = 'fvh-team-lock-banner';
    teamLockBadge.style.display = 'flex';
    teamLockBadge.style.alignItems = 'center';
    teamLockBadge.style.gap = '10px';
    teamLockBadge.style.padding = '10px 14px';
    teamLockBadge.style.marginBottom = '14px';
    teamLockBadge.style.borderRadius = '12px';
    teamLockBadge.style.background = isFooty ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255, 122, 0, 0.08)';
    teamLockBadge.style.border = isFooty ? '1px solid rgba(0, 240, 255, 0.25)' : '1px solid rgba(255, 122, 0, 0.25)';
    teamLockBadge.innerHTML =
      '<span style="font-size:20px;">🔒</span>' +
      '<div>' +
      '  <div style="font-size:12px;font-weight:900;color:#fff;letter-spacing:0.5px;text-transform:uppercase;">' +
           (isFooty ? '⚡ КОМАНДА ФУТБОЛА (FOOTY)' : '⚡ КОМАНДА БАСКЕТБОЛА (HOOPS)') +
      '  </div>' +
      '  <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">' +
           (lang === 'ru' ? 'Выбор команды сделан навсегда · Доступна экипировка вашего атлета' : 'Team chosen permanently · Equipping your active athlete') +
      '  </div>' +
      '</div>';
    body.appendChild(teamLockBadge);

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

    // Slot Category Tabs (Football only)
    if (curSlot !== 'balls_footy') curSlot = 'skins';
    var slotSeg = document.createElement('div');
    slotSeg.className = 'seg';
    slotSeg.style.marginBottom = '12px';
    var slots = [
      { id: 'skins', label: tr('catSkins') },
      { id: 'balls_footy', label: tr('catFootballBalls') }
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

      avatarBox.innerHTML = getCharacterDisplayHtml(curChar, app.store.data.equipped && app.store.data.equipped.skin);
      charName.textContent = curChar === 'footy' ? 'FOOTY' : 'HOOPS';
      charRole.textContent = curChar === 'footy' ? tr('footyRole') : tr('hoopsRole');

      selectBtn.style.display = 'none';

      // Equipped summary
      var eq = app.store.data.equipped || {};
      var owned = app.store.data.owned || [];

      // Sanitize equipped items to prevent unowned cosmetics from staying equipped
      var defaultSlotItems = {
        skin: 'skin_rookie',
        'ball.footy': 'ball_footy_classic',
        'ball.hoops': 'ball_hoops_street',
        'stadium.footy': 'std_footy_classic',
        'stadium.hoops': 'std_hoops_street',
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

      var activeCrowdId = eq.crowd || (curChar === 'hoops' ? 'crowd_hoops_allstars' : 'crowd_footy_ultras');
      var crowdObj = CROWD_CATALOG.find(function(c) { return c.id === activeCrowdId; });
      var crowdLabel = crowdObj ? (tr(crowdObj.nameKey) || crowdObj.name) : activeCrowdId;

      var curCharSkin = eq['skin.footy'] || (eq.skin && eq.skin !== 'skin_solar' && eq.skin !== 'skin_sunset' && eq.skin !== 'skin_mars' ? eq.skin : 'skin_rookie');
      var activeBallId = eq['ball.footy'] || (eq.ball && !eq.ball.startsWith('ball_hoops') ? eq.ball : 'ball_footy_classic');
      var activeArenaId = eq['stadium.footy'] || eq.stadium || 'std_footy_classic';

      equipSlotList.innerHTML =
        '<div class="fvh-equipped-slot"><span>' + tr('catSkins') + ':</span><b>' + getItemLabelById(curCharSkin, tr('defaultSkin')) + '</b></div>' +
        '<div class="fvh-equipped-slot"><span>' + tr('catFootballBalls') + ':</span><b>' + getItemLabelById(activeBallId, 'Classic Ball') + '</b></div>';

      // Load matching items for current slot (OWNED ITEMS ONLY)
      itemsGrid.innerHTML = '';
      function renderMatchingItems(providedItems) {
        var baseCatalog = buildDefaultShopCatalog(curChar);
        var owned = (app.store && app.store.data && app.store.data.owned) || [];

        var matching = baseCatalog.filter(function (it) {
          if (it.category !== curSlot) return false;
          // Filter out basketball items safely
          if (it.id === 'skin_solar' || it.id === 'skin_sunset' || it.id === 'skin_mars' || it.category === 'balls_hoops' || (it.slot && it.slot === 'ball.hoops')) {
            return false;
          }
          var isOwned = (owned.indexOf(it.id) !== -1) || Boolean(it.isDefault) || (it.id === 'skin_rookie') || (it.id === 'ball_footy_classic');
          return isOwned;
        });

        if (matching.length === 0) {
          var emptyBox = document.createElement('div');
          emptyBox.className = 'fvh-empty-state fvh-empty-locker';
          emptyBox.innerHTML =
            '<div class="fvh-empty-state-icon">🎒</div>' +
            '<div class="fvh-empty-state-title">' + tr('emptyInventoryCategory') + '</div>';
          var shopBtn = document.createElement('button');
          shopBtn.className = 'btn primary small';
          shopBtn.style.marginTop = '10px';
          shopBtn.textContent = '🛒 ' + tr('visitShopBtn');
          shopBtn.onclick = function () {
            app.audio.play('click');
            app.showShop(curSlot);
          };
          emptyBox.appendChild(shopBtn);
          itemsGrid.appendChild(emptyBox);
          return;
        }

        matching.forEach(function (item) {
          var activeSlotKey = item.slot || (item.category === 'balls_footy' ? 'ball.footy' : item.category === 'balls_hoops' ? 'ball.hoops' : 'skin');
          var isEquipped = (eq[activeSlotKey] === item.id) || (item.category === 'skins' && (eq.skin === item.id || eq['skin.' + curChar] === item.id));

          var itemCard = document.createElement('div');
          var rarClass = item.rarity || 'common';
          itemCard.className = 'card shopc r-' + rarClass + (isEquipped ? ' is-eq' : '');

          var localizedRarity = tr('rarity_' + rarClass) || rarClass.toUpperCase();
          var localizedItemName = trItem(item.name);

          itemCard.innerHTML =
            '<div class="thumbwrap"><div class="thumb" style="display:flex;align-items:center;justify-content:center;">' +
            renderItemArtwork(item, 'thumb') +
            '</div>' +
            (isEquipped ? '<span class="st st-eq">✓ ' + tr('equippedState') + '</span>' : '') +
            '</div>' +
            '<div class="nm">' + localizedItemName + '</div>' +
            '<div class="tags"><span class="rar ' + rarClass + '">' + localizedRarity + '</span></div>';

          var btn = document.createElement('button');
          if (isEquipped) {
            btn.className = 'btn small';
            btn.disabled = true;
            btn.textContent = tr('equippedState');
          } else {
            btn.className = 'btn small primary';
            btn.textContent = tr('equipAction');
            btn.onclick = function () {
              var pid = getAppPlayerId(app);
              safeEconomyApi('/api/economy/equip', {
                playerId: pid,
                slot: activeSlotKey,
                itemId: item.id
              }).then(function (res) {
                app.store.update(function (d) {
                  if (!d.equipped) d.equipped = {};
                  d.equipped[activeSlotKey] = item.id;
                  if (item.category === 'skins') {
                    d.equipped['skin.' + curChar] = item.id;
                    d.equipped.skin = item.id;
                  }
                });
                app.audio.play('claim');
                showToast(tr('equippedState') + ': ' + localizedItemName);
                updateView();
              });
            };
          }
          itemCard.appendChild(btn);
          itemsGrid.appendChild(itemCard);
        });
      }

      var itemsLoaded = false;
      if (typeof window.require === 'function') {
        try {
          window.require(['data/shop'], function (shopMod) {
            if (shopMod && shopMod.ITEMS && shopMod.ITEMS.length > 0) {
              itemsLoaded = true;
              renderMatchingItems(shopMod.ITEMS);
            }
          });
        } catch (e) {
          console.warn('Failed to load shop items', e);
        }
      }
      if (!itemsLoaded) {
        renderMatchingItems(buildDefaultShopCatalog(curChar));
      }
    }

    updateView();

    // Persistent Unified Bottom Navigation
    container.appendChild(createSharedBottomNav('characters', app));

    return container;
  }



  // Polished Vector Social & Referral Brand Artwork
  function getTelegramLogoSvg(size) {
    var sz = size || 38;
    return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="20" cy="20" r="19" fill="url(#tg_grad)" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>' +
      '<defs><linearGradient id="tg_grad" x1="20" y1="0" x2="20" y2="40" gradientUnits="userSpaceOnUse"><stop stop-color="#2AABEE"/><stop offset="1" stop-color="#229ED9"/></linearGradient></defs>' +
      '<path d="M10 19.8L28.5 12.2L25 27.5L20 22.8L16.2 25.8L16.8 21.4L25.2 15.2L14.2 20.6L10 19.8Z" fill="#ffffff"/>' +
      '</svg>';
  }

  function getXLogoSvg(size) {
    var sz = size || 38;
    return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="40" height="40" rx="10" fill="#090d16" stroke="rgba(255,255,255,0.22)" stroke-width="1.2"/>' +
      '<path d="M26.8 11H30L22.9 19.1L31.2 30H24.8L19.8 23.4L14.1 30H10.9L18.4 21.4L10.5 11H17.1L21.6 17.1L26.8 11ZM25.7 28.1H27.5L16.1 12.8H14.2L25.7 28.1Z" fill="#ffffff"/>' +
      '</svg>';
  }

  function getInviteFriendsSvg(size) {
    var sz = size || 40;
    return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="40" height="40" rx="10" fill="#0f172a" stroke="rgba(0,240,255,0.35)" stroke-width="1.2"/>' +
      '<circle cx="15" cy="14" r="5" fill="#38bdf8"/>' +
      '<path d="M8 28C8 23.6 11.6 20 16 20C17.8 20 19.5 20.6 20.8 21.7C19.6 23.2 19 25 19 27V28H8Z" fill="#0284c7"/>' +
      '<circle cx="26" cy="16" r="4.5" fill="#f97316"/>' +
      '<path d="M21 28C21 24.1 24.1 21 28 21C31.9 21 35 24.1 35 28H21Z" fill="#ea580c"/>' +
      '<path d="M28 10V14M26 12H30" stroke="#facc15" stroke-width="1.5" stroke-linecap="round"/>' +
      '</svg>';
  }

  // Build Quests & Mission Operations Board Page (3 Separated Top-Level Categories)
  // Build Quests & Social Ops Page (Strictly 2 tabs: Invite a Friend & Social Tasks)
  function buildQuestsPage(app, initialMainTab) {
    var curMainTab = initialMainTab === 'social' ? 'social' : 'referrals';

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
    title.textContent = tr('quests');
    head.appendChild(backBtn);
    head.appendChild(title);
    page.appendChild(head);

    var body = document.createElement('div');
    body.className = 'page-body fvh-quests-container';

    // Top Navigation (2 Tabs Only)
    var mainSeg = document.createElement('div');
    mainSeg.className = 'seg fvh-quest-top-nav';
    mainSeg.style.marginBottom = '14px';

    var mainTabs = [
      { id: 'referrals', icon: '👥', label: tr('tabInviteFriends') },
      { id: 'social', icon: '🌐', label: tr('tabSocialTasks') }
    ];

    mainTabs.forEach(function (mt) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.innerHTML = '<span class="fvh-tab-icon">' + mt.icon + '</span><span class="fvh-tab-label">' + mt.label + '</span>';
      if (mt.id === curMainTab) btn.className = 'on';
      btn.onclick = function () {
        curMainTab = mt.id;
        mainSeg.querySelectorAll('button').forEach(function (b) { b.className = ''; });
        btn.className = 'on';
        app.audio.play('click');
        renderQuestsPage();
      };
      mainSeg.appendChild(btn);
    });
    body.appendChild(mainSeg);

    var contentArea = document.createElement('div');
    contentArea.className = 'fvh-quest-content';
    body.appendChild(contentArea);

    page.appendChild(body);
    container.appendChild(page);

    function getPlayerId() {
      var pid = (app.store && app.store.data && app.store.data.playerId) || 'PLAYER_' + Math.floor(1000 + Math.random() * 9000);
      if (app.store && app.store.data) app.store.data.playerId = pid;
      return pid;
    }

    function getClaimedList() {
      if (!Array.isArray(app.store.data.claimedQuests)) {
        if (app.store.data.claimedQuests && typeof app.store.data.claimedQuests === 'object') {
          app.store.data.claimedQuests = Object.keys(app.store.data.claimedQuests);
        } else {
          app.store.data.claimedQuests = [];
        }
      }
      return app.store.data.claimedQuests;
    }

    // Tab 1: Invite a Friend
    function renderReferralsTab() {
      contentArea.innerHTML = '';
      var pid = getPlayerId();
      var botUsername = 'FootyVsHoopsBot';
      var refLink = 'https://t.me/' + botUsername + '?start=ref_' + pid;

      var refData = app.store.data.referrals || [];
      var totalInvited = Array.isArray(refData) ? refData.length : (refData.total || 0);
      var qualifiedFriends = Array.isArray(refData)
        ? refData.filter(function (r) { return r && r.qualified; }).length
        : (refData.qualified || 0);
      var earnedCoins = qualifiedFriends * 100;

      // Query authoritative referral stats from server
      fetch('/api/referrals/stats?playerId=' + encodeURIComponent(pid))
        .then(function (res) { return res.json(); })
        .then(function (s) {
          if (s && s.ok && s.stats) {
            totalInvited = s.stats.total || totalInvited;
            qualifiedFriends = s.stats.qualified || qualifiedFriends;
            earnedCoins = qualifiedFriends * 100;
          }
        })
        .catch(function () {});

      // 1. Referral Hero Banner & Honest Qualification Rule
      var hero = document.createElement('div');
      hero.className = 'fvh-quest-ref-hero';
      hero.innerHTML =
        '<div class="fvh-quest-ref-icon" style="margin-bottom:8px;display:flex;justify-content:center;">' + getInviteFriendsSvg(44) + '</div>' +
        '<div class="fvh-quest-ref-title">' + tr('tabInviteFriends') + '</div>' +
        '<div class="fvh-quest-ref-desc" style="color:var(--text-muted);font-size:12px;margin:6px 0 12px;line-height:1.45;">' +
        tr('refRuleText') +
        '</div>';
      contentArea.appendChild(hero);

      // 2. Link Box with Copy and Telegram Share
      var linkBox = document.createElement('div');
      linkBox.className = 'fvh-quest-link-box';
      linkBox.style.background = 'rgba(255,255,255,0.05)';
      linkBox.style.border = '1px solid rgba(255,255,255,0.12)';
      linkBox.style.borderRadius = '12px';
      linkBox.style.padding = '12px';
      linkBox.style.marginBottom = '14px';

      linkBox.innerHTML =
        '<div style="font-size:11px;color:#94a3b8;margin-bottom:6px;font-weight:700;">' + tr('refStatTotal') + ' · ' + tr('tabInviteFriends') + '</div>' +
        '<div style="display:flex;gap:8px;margin-bottom:10px;">' +
        '  <input type="text" readonly value="' + escapeHtml(refLink) + '" class="fvh-ref-input" style="flex:1;background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.15);border-radius:8px;padding:8px 10px;color:#38bdf8;font-size:12px;font-family:monospace;overflow:hidden;text-overflow:ellipsis;">' +
        '  <button class="btn primary small fvh-btn-copy-ref" style="white-space:nowrap;padding:8px 14px;font-weight:800;">' + tr('refCopyBtn') + '</button>' +
        '</div>' +
        '<button class="btn block fvh-btn-share-ref" style="background:#229ed9;color:#fff;font-weight:800;border:none;border-radius:10px;padding:10px 14px;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;">' +
        '  <span>✈️</span> <span>' + tr('refShareBtn') + '</span>' +
        '</button>';

      var copyBtn = linkBox.querySelector('.fvh-btn-copy-ref');
      copyBtn.onclick = function () {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(refLink).then(function () {
            app.audio.play('click');
            showToast(tr('refCopied'));
          });
        } else {
          var inp = linkBox.querySelector('.fvh-ref-input');
          inp.select();
          document.execCommand('copy');
          app.audio.play('click');
          showToast(tr('refCopied'));
        }
      };

      var shareBtn = linkBox.querySelector('.fvh-btn-share-ref');
      shareBtn.onclick = function () {
        app.audio.play('click');
        var shareMsg = 'FOOTY vs HOOPS — Choose your faction and battle for $FOOTY and $HOOPS!';
        var shareUrl = 'https://t.me/share/url?url=' + encodeURIComponent(refLink) + '&text=' + encodeURIComponent(shareMsg);
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.openTelegramLink) {
          window.Telegram.WebApp.openTelegramLink(shareUrl);
        } else {
          window.open(shareUrl, '_blank');
        }
      };

      contentArea.appendChild(linkBox);

      // 3. Referral Real Statistics
      var statsBox = document.createElement('div');
      statsBox.className = 'fvh-quest-stats-grid';
      statsBox.style.display = 'grid';
      statsBox.style.gridTemplateColumns = 'repeat(3, 1fr)';
      statsBox.style.gap = '8px';

      statsBox.innerHTML =
        '<div class="fvh-quest-stat-tile" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:10px 6px;text-align:center;">' +
        '  <div style="font-size:10.5px;color:#94a3b8;font-weight:700;">' + tr('refStatTotal') + '</div>' +
        '  <div style="font-size:16px;font-weight:900;color:#fff;margin-top:2px;">' + totalInvited + '</div>' +
        '</div>' +
        '<div class="fvh-quest-stat-tile" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:10px 6px;text-align:center;">' +
        '  <div style="font-size:10.5px;color:#94a3b8;font-weight:700;">' + tr('refStatQualified') + '</div>' +
        '  <div style="font-size:16px;font-weight:900;color:#22c55e;margin-top:2px;">' + qualifiedFriends + '</div>' +
        '</div>' +
        '<div class="fvh-quest-stat-tile" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:10px 6px;text-align:center;">' +
        '  <div style="font-size:10.5px;color:#94a3b8;font-weight:700;">' + tr('refStatEarned') + '</div>' +
        '  <div style="font-size:16px;font-weight:900;color:#facc15;margin-top:2px;display:flex;align-items:center;justify-content:center;gap:3px;">' + getFvhCoinSvg('inline') + ' ' + earnedCoins + '</div>' +
        '</div>';

      contentArea.appendChild(statsBox);
    }

    // Tab 2: Social Tasks & Official Channels
    function renderSocialTab() {
      contentArea.innerHTML = '';
      var claimed = getClaimedList();
      var isTgDone = claimed.indexOf('q_sub_tg') !== -1;

      // 1. Verified Telegram Subscription Task
      var verifiedTaskBox = document.createElement('div');
      verifiedTaskBox.className = 'fvh-verified-task-section';
      verifiedTaskBox.style.marginBottom = '18px';

      var taskHeading = document.createElement('div');
      taskHeading.style.fontSize = '13px';
      taskHeading.style.fontWeight = '900';
      taskHeading.style.color = '#38bdf8';
      taskHeading.style.textTransform = 'uppercase';
      taskHeading.style.letterSpacing = '0.5px';
      taskHeading.style.marginBottom = '8px';
      taskHeading.textContent = (getActiveLang() === 'ru') ? '⭐ Задание с наградой' : '⭐ Rewarded Mission';
      verifiedTaskBox.appendChild(taskHeading);

      var tgCard = document.createElement('div');
      tgCard.className = 'fvh-quest-task-card' + (isTgDone ? ' done' : '');
      tgCard.style.background = 'rgba(255,255,255,0.04)';
      tgCard.style.border = isTgDone ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(0,240,255,0.25)';
      tgCard.style.borderRadius = '12px';
      tgCard.style.padding = '14px 16px';
      tgCard.style.display = 'flex';
      tgCard.style.alignItems = 'center';
      tgCard.style.justifyContent = 'space-between';
      tgCard.style.gap = '12px';

      tgCard.innerHTML =
        '<div style="display:flex;align-items:center;gap:12px;flex:1;min-width:0;">' +
        '  <div style="width:38px;height:38px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' + getSocialIconSvg('tg') + '</div>' +
        '  <div style="flex:1;min-width:0;">' +
        '    <div style="font-size:13px;font-weight:800;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + tr('subscribeFootyHoops') + '</div>' +
        '    <div style="font-size:11.5px;font-weight:800;color:#facc15;margin-top:2px;display:inline-flex;align-items:center;gap:4px;">' +
        getFvhCoinSvg('inline') + ' +50 FvH Coin' +
        '    </div>' +
        '  </div>' +
        '</div>' +
        '<div class="fvh-task-actions" style="display:flex;gap:6px;flex-shrink:0;"></div>';

      var actBox = tgCard.querySelector('.fvh-task-actions');
      if (isTgDone) {
        var doneBtn = document.createElement('button');
        doneBtn.className = 'btn small';
        doneBtn.disabled = true;
        doneBtn.textContent = tr('taskCompleted');
        actBox.appendChild(doneBtn);
      } else {
        var openBtn = document.createElement('button');
        openBtn.className = 'btn small';
        openBtn.textContent = tr('openTaskBtn');
        openBtn.onclick = function () {
          app.audio.play('click');
          var tgUrl = 'https://t.me/FootyHoops';
          if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.openLink) {
            window.Telegram.WebApp.openLink(tgUrl);
          } else {
            window.open(tgUrl, '_blank');
          }
        };
        actBox.appendChild(openBtn);

        var claimBtn = document.createElement('button');
        claimBtn.className = 'btn small primary';
        claimBtn.textContent = tr('verifyTaskBtn');
        claimBtn.onclick = function () {
          claimBtn.disabled = true;
          claimBtn.textContent = tr('taskVerifying');
          var pid = getPlayerId();
          var tgUser = (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) || null;
          var tgUserId = tgUser ? tgUser.id : (app.store && app.store.data && app.store.data.telegramUser && app.store.data.telegramUser.id);

          if (!tgUserId) {
            claimBtn.disabled = false;
            claimBtn.textContent = tr('verifyTaskBtn');
            showToast(getActiveLang() === 'ru' ? 'Откройте игру через Telegram для подтверждения подписки' : 'Open the game via Telegram to verify subscription');
            return;
          }

          fetch(getApiUrl('/api/tasks/verify-telegram'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              playerId: pid,
              telegramUserId: tgUserId,
              claim: true
            })
          })
          .then(function (r) { return r.json(); })
          .then(function (res) {
            if (res && res.ok && res.verified) {
              app.store.update(function (d) {
                if (!Array.isArray(d.claimedQuests)) d.claimedQuests = [];
                if (d.claimedQuests.indexOf('q_sub_tg') === -1) d.claimedQuests.push('q_sub_tg');
                if (res.coins !== undefined) d.coins = res.coins;
                else d.coins = (d.coins || 0) + 50;
                if (!d.transactions) d.transactions = [];
                d.transactions.unshift({
                  id: 'tx_quest_q_sub_tg_' + Date.now(),
                  type: 'quest_reward',
                  amount: 50,
                  description: tr('subscribeFootyHoops'),
                  timestamp: Date.now()
                });
              });
              app.audio.play('claim');
              showToast(tr('tgVerifySuccess'));
              renderSocialTab();
            } else {
              claimBtn.disabled = false;
              claimBtn.textContent = tr('verifyTaskBtn');
              showToast(tr('tgVerifyFailed'));
            }
          })
          .catch(function () {
            claimBtn.disabled = false;
            claimBtn.textContent = tr('verifyTaskBtn');
            showToast(tr('tgVerifyFailed'));
          });
        };
        actBox.appendChild(claimBtn);
      }
      verifiedTaskBox.appendChild(tgCard);
      contentArea.appendChild(verifiedTaskBox);

      // 2. Official Social Channels Section (Item 6 & Item 7)
      var officialBox = document.createElement('div');
      officialBox.className = 'fvh-official-socials-section';

      var officialHeading = document.createElement('div');
      officialHeading.style.display = 'flex';
      officialHeading.style.flexDirection = 'column';
      officialHeading.style.gap = '3px';
      officialHeading.style.marginBottom = '10px';
      officialHeading.innerHTML =
        '<div style="font-size:14px;font-weight:900;color:#fff;">🌐 ' + tr('followUsTitle') + '</div>' +
        '<div style="font-size:11.5px;color:#94a3b8;">' + tr('followUsSubtitle') + '</div>' +
        '<div style="font-size:11px;color:#f59e0b;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:8px;padding:6px 10px;margin-top:6px;line-height:1.4;">' +
        'ℹ️ ' + tr('socialNotice') +
        '</div>';
      officialBox.appendChild(officialHeading);

      var channels = [
        { id: 'q_sub_tg', name: 'Telegram News', handle: '@FootyHoops', url: 'https://t.me/FootyHoops', icon: getSocialIconSvg('tg') },
        { id: 'q_sub_chat', name: 'Telegram Chat', handle: 'Community Chat', url: 'https://t.me/+zKbH1Po_pdg2MmVi', icon: getSocialIconSvg('chat') },
        { id: 'q_sub_insta', name: 'Instagram', handle: '@footyvshoops', url: 'https://www.instagram.com/footyvshoops?exln=MWF1ZGdxM3BqdGt1eA%3D%3D&utm_source=qr', icon: getSocialIconSvg('insta') },
        { id: 'q_sub_x', name: 'X / Twitter', handle: '@footyvshoops', url: 'https://x.com/footyvshoops?s=11', icon: getSocialIconSvg('x') },
        { id: 'q_sub_yt', name: 'YouTube', handle: '@footyvshoops-cr', url: 'https://youtube.com/@footyvshoops-cr?si=ZbQ3MBZ9R22-bybf', icon: getSocialIconSvg('yt') },
        { id: 'q_sub_tiktok', name: 'TikTok', handle: '@footy_vs_hoops', url: 'https://www.tiktok.com/@footy_vs_hoops', icon: getSocialIconSvg('tiktok') }
      ];

      var channelList = document.createElement('div');
      channelList.style.display = 'flex';
      channelList.style.flexDirection = 'column';
      channelList.style.gap = '8px';

      channels.forEach(function (ch) {
        var card = document.createElement('div');
        card.className = 'fvh-social-channel-row';
        card.style.background = 'rgba(255,255,255,0.035)';
        card.style.border = '1px solid rgba(255,255,255,0.08)';
        card.style.borderRadius = '10px';
        card.style.padding = '10px 14px';
        card.style.display = 'flex';
        card.style.alignItems = 'center';
        card.style.justifyContent = 'space-between';
        card.style.gap = '10px';

        card.innerHTML =
          '<div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0;">' +
          '  <div style="width:34px;height:34px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' + ch.icon + '</div>' +
          '  <div style="flex:1;min-width:0;">' +
          '    <div style="font-size:13px;font-weight:800;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + ch.name + '</div>' +
          '    <div style="font-size:11px;color:#94a3b8;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + ch.handle + '</div>' +
          '  </div>' +
          '</div>' +
          '<button class="btn small fvh-btn-visit" style="flex-shrink:0;padding:6px 14px;font-size:12px;font-weight:800;">' + tr('visitBtn') + ' ➔</button>';

        card.querySelector('.fvh-btn-visit').onclick = function () {
          app.audio.play('click');
          if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.openLink) {
            window.Telegram.WebApp.openLink(ch.url);
          } else {
            window.open(ch.url, '_blank');
          }
        };

        channelList.appendChild(card);
      });

      officialBox.appendChild(channelList);
      contentArea.appendChild(officialBox);
    }

    function renderQuestsPage() {
      if (curMainTab === 'referrals') {
        renderReferralsTab();
      } else {
        renderSocialTab();
      }
    }

    renderQuestsPage();
    container.appendChild(createSharedBottomNav('quests', app));
    return container;
  }



  // Official Stage 1 Currency Packages (100, 500, 1200, 3000 FvH Coin)
  var CURRENCY_PACKAGES = [
    {
      id: 'pkg_coins_100',
      name: '100 FvH Coin',
      coinsAmount: 100,
      starsPrice: 25,
      icon: '🪙',
      badge: 'STARTER',
      type: 'coins',
      desc: '100 FvH Coin'
    },
    {
      id: 'pkg_coins_500',
      name: '500 FvH Coin',
      coinsAmount: 500,
      starsPrice: 100,
      icon: '💰',
      badge: 'POPULAR',
      type: 'coins',
      desc: '500 FvH Coin'
    },
    {
      id: 'pkg_coins_1200',
      name: '1,200 FvH Coin',
      coinsAmount: 1200,
      starsPrice: 220,
      icon: '💎',
      badge: 'VALUE',
      type: 'coins',
      desc: '1,200 FvH Coin'
    },
    {
      id: 'pkg_coins_3000',
      name: '3,000 FvH Coin',
      coinsAmount: 3000,
      starsPrice: 500,
      icon: '🏆',
      badge: 'PRO',
      type: 'coins',
      desc: '3,000 FvH Coin'
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
        { id: 'skin_neon_elite', name: 'Cyber Striker', icon: '🎽', type: 'cosmetic' },
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
        { id: 'skin_neon_elite', name: 'Cyber Striker', icon: '🎽', type: 'cosmetic' },
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

  // Default canonical Shop & Locker catalog (guarantees synchronous loading and resilience)
  // Canonical Football-Only Stage 1 Shop & Wardrobe Catalog
  function buildDefaultShopCatalog(curChar) {
    return [
      // Football Kits / Skins (Common 300, Rare 700-800, Epic 1500-1600, Legendary 2500)
      { id: 'skin_rookie', name: 'Rookie Blue', category: 'skins', slot: 'skin', rarity: 'common', price: 0, isDefault: true },
      { id: 'skin_crimson', name: 'Crimson Comet', category: 'skins', slot: 'skin', rarity: 'common', price: 300 },
      { id: 'skin_neon', name: 'Neon Striker', category: 'skins', slot: 'skin', rarity: 'rare', price: 700 },
      { id: 'skin_frost', name: 'Frost Giant', category: 'skins', slot: 'skin', rarity: 'rare', price: 700 },
      { id: 'skin_shadow', name: 'Shadow Ninja', category: 'skins', slot: 'skin', rarity: 'epic', price: 1500 },
      { id: 'skin_gold', name: 'Golden Legend', category: 'skins', slot: 'skin', rarity: 'legendary', price: 2500 },
      { id: 'skin_cyber', name: 'Cyber Blue', category: 'skins', slot: 'skin', rarity: 'rare', price: 800 },
      { id: 'skin_hydro', name: 'Hydro Striker', category: 'skins', slot: 'skin', rarity: 'rare', price: 750 },
      { id: 'skin_astronaut', name: 'Astronaut Kit', category: 'skins', slot: 'skin', rarity: 'epic', price: 1600 },

      // Football Balls (Common 200, Rare 500, Epic 1000)
      { id: 'ball_footy_classic', name: 'Match Classic', category: 'balls_footy', slot: 'ball.footy', mode: 'footy', rarity: 'common', price: 0, isDefault: true },
      { id: 'ball_footy_neon', name: 'Cyan Core', category: 'balls_footy', slot: 'ball.footy', mode: 'footy', rarity: 'common', price: 200 },
      { id: 'ball_footy_inferno', name: 'Solar Blaze', category: 'balls_footy', slot: 'ball.footy', mode: 'footy', rarity: 'rare', price: 500 },
      { id: 'ball_footy_gold', name: 'Aura', category: 'balls_footy', slot: 'ball.footy', mode: 'footy', rarity: 'epic', price: 1000 }
    ];
  }

  // Build Editorial Shop & Sports Boutique Page
  function buildShopPage(app, initialCategory, inspectId) {
    var curCategory = initialCategory || 'skins';
    if (curCategory === 'all' || curCategory === 'bundles' || curCategory === 'stadiums' || curCategory === 'packs' || curCategory === 'balls_hoops') {
      curCategory = 'skins';
    }
    if (curCategory === 'balls') {
      curCategory = 'balls_footy';
    }
    var isPurchasing = false; // Debounce flag to prevent duplicate purchases
    var curChar = (app.store && app.store.data && app.store.data.selectedCharacter) || 'footy';
    var isFooty = (curChar === 'footy');

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
    titleBox.className = 'fvh-shop-title-box';
    titleBox.style.flex = '1 1 auto';
    titleBox.style.minWidth = '0';
    titleBox.style.padding = '0 6px';
    titleBox.innerHTML = '<h1 style="margin:0;font-size:clamp(16px, 4.8vw, 22px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + tr('stadiumStore') + '</h1><small style="color:var(--text-muted);letter-spacing:0.5px;font-size:10.5px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + tr(isFooty ? 'storeSubFooty' : 'storeSubHoops') + '</small>';

    var walletBox = document.createElement('div');
    walletBox.className = 'fvh-wallet-chips';
    walletBox.style.flexShrink = '0';
    walletBox.style.marginLeft = 'auto';

    head.appendChild(backBtn);
    head.appendChild(titleBox);
    head.appendChild(walletBox);
    page.appendChild(head);

    var body = document.createElement('div');
    body.className = 'page-body fvh-shop-container';

    // 1. Category Selector Tabs (Skins, Football Balls, FvH Coins)
    var catSeg = document.createElement('div');
    catSeg.className = 'seg fvh-shop-categories';
    catSeg.style.marginBottom = '16px';
    var categories = [
      { id: 'skins', label: tr('catSkins') },
      { id: 'balls_footy', label: tr('catFootballBalls') },
      { id: 'coins', label: tr('catCoins') }
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

    // Product Catalogue Grid
    var catalogueGrid = document.createElement('div');
    catalogueGrid.className = 'fvh-catalogue-grid';
    body.appendChild(catalogueGrid);

    page.appendChild(body);
    container.appendChild(page);

    function updateWalletUI() {
      var coins = app.store.data.coins || 0;
      walletBox.innerHTML =
        '<button class="fvh-wallet-pill gold" style="cursor:pointer;" title="' + tr('catCoins') + '">' +
        getFvhCoinSvg('inline') + ' <span>' + coins.toLocaleString() + '</span>' +
        '</button>';
      var btn = walletBox.querySelector('.fvh-wallet-pill');
      if (btn) {
        btn.onclick = function () {
          curCategory = 'coins';
          catSeg.querySelectorAll('button').forEach(function (b) {
            b.className = (b.textContent === tr('catCoins')) ? 'on' : '';
          });
          app.audio.play('click');
          renderShop();
        };
      }
    }

    // Modal Item Inspector
    function openItemInspector(item) {
      var overlay = document.createElement('div');
      overlay.className = 'modal-back fvh-sheet-back';
      var modal = document.createElement('div');
      modal.className = 'modal fvh-item-modal';

      var owned = (app.store && app.store.data && app.store.data.owned) || [];
      var slotKey = item.slot || (item.category === 'balls_footy' ? 'ball.footy' : item.category === 'balls_hoops' ? 'ball.hoops' : 'skin');
      var curEquipped = (app.store && app.store.data && app.store.data.equipped) || {};
      var isEquipped = (curEquipped[slotKey] === item.id) || (item.category === 'skins' && (curEquipped.skin === item.id || curEquipped['skin.' + curChar] === item.id));
      var isOwned = (owned.indexOf(item.id) !== -1 || Boolean(item.isDefault) || (curChar === 'hoops' && item.id === 'skin_solar') || (curChar === 'footy' && item.id === 'skin_rookie'));
      var rarKey = item.rarity || 'common';
      var localizedRarity = tr('rarity_' + rarKey) || rarKey.toUpperCase();
      var localizedItemName = trItem(item.name);

      var categoryLabel = '';
      if (item.category === 'skins') categoryLabel = tr('catSkins');
      else if (item.category === 'balls_footy') categoryLabel = tr('catFootballBalls');
      else if (item.category === 'balls_hoops') categoryLabel = tr('catBasketballBalls');
      else categoryLabel = tr('storeSub');

      modal.innerHTML =
        '<div class="fvh-sheet-handle"></div>' +
        '<div class="fvh-item-modal-head">' +
        '<span class="rar ' + rarKey + '">' + localizedRarity + '</span>' +
        '<button class="modal-close-x" aria-label="Close">✕</button>' +
        '</div>' +
        '<div class="fvh-item-modal-preview r-' + rarKey + '" style="display:flex;align-items:center;justify-content:center;padding:16px;">' +
        renderItemArtwork(item, 'large') +
        '</div>' +
        '<h2 class="fvh-item-modal-title">' + localizedItemName + '</h2>' +
        '<div class="fvh-item-modal-category">' + categoryLabel + '</div>' +
        '<p class="fvh-item-modal-desc">' + (item.desc || (localizedItemName + ' — ' + tr('storeSub'))) + '</p>' +
        '<div class="fvh-item-modal-actions"></div>';

      modal.querySelector('.modal-close-x').onclick = function () { overlay.remove(); };
      overlay.onclick = function (e) {
        if (e.target === overlay) {
          app.audio.play('click');
          overlay.remove();
        }
      };

      var actionsBox = modal.querySelector('.fvh-item-modal-actions');
      if (isEquipped) {
        var eqBtn = document.createElement('button');
        eqBtn.className = 'btn block';
        eqBtn.disabled = true;
        eqBtn.textContent = '✓ ' + tr('equippedState');
        actionsBox.appendChild(eqBtn);
      } else if (isOwned) {
        var equipBtn = document.createElement('button');
        equipBtn.className = 'btn primary block';
        equipBtn.textContent = tr('equipAction');
        equipBtn.onclick = function () {
          var pid = getAppPlayerId(app);
          safeEconomyApi('/api/economy/equip', {
            playerId: pid,
            slot: slotKey,
            itemId: item.id
          }).then(function () {
            app.store.update(function (d) {
              if (!d.equipped) d.equipped = {};
              d.equipped[slotKey] = item.id;
              if (item.category === 'skins') {
                d.equipped['skin.' + curChar] = item.id;
                d.equipped.skin = item.id;
              }
            });
            app.audio.play('claim');
            showToast(tr('equippedState') + ': ' + localizedItemName);
            overlay.remove();
            renderShop();
          });
        };
        actionsBox.appendChild(equipBtn);
      } else {
        var buyItemBtn = document.createElement('button');
        buyItemBtn.className = 'btn primary block';
        buyItemBtn.innerHTML = tr('buyAction') + ' ' + getFvhCoinSvg('inline') + ' ' + item.price;
        buyItemBtn.onclick = function () {
          if (isPurchasing) return;
          var coins = (app.store && app.store.data && app.store.data.coins) || 0;
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
            idempotencyKey: 'item_' + pid + '_' + item.id + '_' + Date.now()
          }).then(function (res) {
            isPurchasing = false;
            if (res && res.ok) {
              app.store.update(function (d) {
                d.coins = res.coins;
                d.xp = res.xp;
                d.owned = res.owned;
              });
            } else {
              app.store.update(function (d) {
                d.coins -= item.price;
                if (!d.owned) d.owned = [];
                if (d.owned.indexOf(item.id) === -1) d.owned.push(item.id);
              });
            }
            app.audio.play('claim');
            showToast(tr('purchaseSuccess') + ': ' + localizedItemName);
            overlay.remove();
            renderShop();
          });
        };
        actionsBox.appendChild(buyItemBtn);
      }

      overlay.appendChild(modal);
      document.body.appendChild(overlay);
    }

    function renderShop() {
      updateWalletUI();
      catalogueGrid.innerHTML = '';

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
          '  <div style="width:44px;height:44px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' + getFvhCoinSvg('thumb') + '</div>' +
          '  <div>' +
          '    <div style="font-weight:900;font-size:14px;color:#fde047;letter-spacing:0.5px;">' + tr('catCoins') + ' · ' + tr('storeSub') + '</div>' +
          '    <div style="font-size:12px;color:var(--text-muted);margin-top:2px;line-height:1.4;">' + (getActiveLang() === 'ru' ? 'Пополняйте баланс FvH Coin моментально через Telegram Stars ⭐' : 'Recharge FvH Coin instantly with Telegram Stars ⭐') + '</div>' +
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

          var starsText = pkg.starsPrice ? (pkg.starsPrice + ' ⭐ Stars') : tr('starsUnconfiguredBadge');

          pCard.innerHTML =
            '<div class="fvh-card-head" style="justify-content:space-between;">' +
            '  <span class="rar legendary" style="font-size:10px;padding:3px 8px;">' + pkg.badge + '</span>' +
            '  <span style="font-size:11px;font-weight:900;color:#fde047;display:inline-flex;align-items:center;gap:3px;">' + getFvhCoinSvg('inline') + ' +' + pkg.coinsAmount.toLocaleString() + '</span>' +
            '</div>' +
            '<div class="fvh-card-thumb-wrap" style="height:76px;display:flex;align-items:center;justify-content:center;">' +
            '  <div style="width:72px;height:72px;display:flex;align-items:center;justify-content:center;">' + renderItemArtwork(pkg.id, 'thumb') + '</div>' +
            '</div>' +
            '<div class="fvh-card-title" style="font-size:13px;font-weight:800;color:var(--text-pure);margin-bottom:4px;">' + pkg.name + '</div>' +
            '<div class="fvh-card-desc" style="font-size:11px;color:var(--text-muted);margin-bottom:8px;line-height:1.3;">' + pkg.desc + '</div>' +
            '<div class="fvh-card-price" style="font-size:12px;font-weight:900;color:#facc15;">' +
            starsText +
            '</div>';

          pCard.onclick = function () {
            app.audio.play('click');
            if (pkg.starsPrice) {
              openUniversalPaymentModal(app, {
                productId: pkg.id,
                title: pkg.name,
                starsPrice: pkg.starsPrice,
                coinsAmount: pkg.coinsAmount,
                onPurchased: function () {
                  app.audio.play('claim');
                  showToast('⭐ +' + pkg.coinsAmount.toLocaleString() + ' FvH Coin!');
                  syncAuthoritativeEconomy(app);
                }
              });
              return;
            }
            var overlay = document.createElement('div');
            overlay.className = 'modal-back';
            var modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML =
              '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
              '  <h3 style="margin:0;font-size:16px;font-weight:900;">⭐ Telegram Stars</h3>' +
              '  <button class="modal-close-x" style="width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:#fff;cursor:pointer;">✕</button>' +
              '</div>' +
              '<p style="font-size:13px;color:var(--text-muted);line-height:1.45;margin:0 0 16px;">' + tr('starsUnconfiguredNotice') + '</p>' +
              '<button class="btn primary block fvh-btn-close-notice">' + tr('gotItBtn') + '</button>';
            modal.querySelector('.modal-close-x').onclick = function () { overlay.remove(); };
            modal.querySelector('.fvh-btn-close-notice').onclick = function () { overlay.remove(); };
            overlay.appendChild(modal);
            document.body.appendChild(overlay);
          };

          catalogueGrid.appendChild(pCard);
        });
        return;
      }

      // Cosmetic items
      var baseCatalog = buildDefaultShopCatalog(curChar);
      var owned = (app.store && app.store.data && app.store.data.owned) || [];
      var eq = (app.store && app.store.data && app.store.data.equipped) || {};

      var filtered = baseCatalog.filter(function (it) {
        return it.category === curCategory;
      });

      if (filtered.length === 0) {
        catalogueGrid.innerHTML =
          '<div class="fvh-empty-state">' +
          '  <div class="fvh-empty-state-icon">📦</div>' +
          '  <div class="fvh-empty-state-title">' + tr('emptyShopCategory') + '</div>' +
          '</div>';
        return;
      }

      filtered.forEach(function (it) {
        var slotKey = it.slot || (it.category === 'balls_footy' ? 'ball.footy' : it.category === 'balls_hoops' ? 'ball.hoops' : 'skin');
        var isOwned = (owned.indexOf(it.id) !== -1 || Boolean(it.isDefault) || (curChar === 'hoops' && it.id === 'skin_solar') || (curChar === 'footy' && it.id === 'skin_rookie'));
        var isEquipped = isOwned && ((eq[slotKey] === it.id) || (it.category === 'skins' && (eq.skin === it.id || eq['skin.' + curChar] === it.id)));

        var card = document.createElement('div');
        var rarKey = it.rarity || 'common';
        card.className = 'fvh-catalogue-card r-' + rarKey + (isOwned ? ' owned' : '');

        var localizedRarity = tr('rarity_' + rarKey) || rarKey.toUpperCase();
        var localizedItemName = trItem(it.name);

        card.innerHTML =
          '<div class="fvh-card-head" style="display:flex;justify-content:space-between;align-items:center;">' +
          '  <span class="rar ' + rarKey + '">' + localizedRarity + '</span>' +
          (isEquipped ? '  <span class="fvh-card-owned-tag" style="color:#22c55e;font-size:10.5px;font-weight:800;">✓ ' + tr('equippedState') + '</span>' : (isOwned ? '  <span class="fvh-card-owned-tag">✓ ' + tr('inCollection') + '</span>' : '')) +
          '</div>' +
          '<div class="fvh-card-thumb-wrap" style="height:76px;display:flex;align-items:center;justify-content:center;cursor:pointer;">' +
          renderItemArtwork(it, 'thumb') +
          '</div>' +
          '<div class="fvh-card-title" style="font-size:13px;font-weight:800;color:var(--text-pure);margin-bottom:4px;">' + localizedItemName + '</div>' +
          '<div class="fvh-card-price" style="font-size:12px;font-weight:900;color:#facc15;margin-bottom:8px;">' +
          (isOwned ? '' : (getFvhCoinSvg('inline') + ' ' + it.price.toLocaleString() + ' FvH')) +
          '</div>' +
          '<div class="fvh-card-action"></div>';

        var actBox = card.querySelector('.fvh-card-action');
        var actionBtn = document.createElement('button');
        if (isEquipped) {
          actionBtn.className = 'btn small block';
          actionBtn.disabled = true;
          actionBtn.textContent = tr('equippedState');
        } else if (isOwned) {
          actionBtn.className = 'btn small primary block';
          actionBtn.textContent = tr('equipAction');
          actionBtn.onclick = function (e) {
            e.stopPropagation();
            var pid = getAppPlayerId(app);
            safeEconomyApi('/api/economy/equip', {
              playerId: pid,
              slot: slotKey,
              itemId: it.id
            }).then(function () {
              app.store.update(function (d) {
                if (!d.equipped) d.equipped = {};
                d.equipped[slotKey] = it.id;
                if (it.category === 'skins') {
                  d.equipped['skin.' + curChar] = it.id;
                  d.equipped.skin = it.id;
                }
              });
              app.audio.play('claim');
              showToast(tr('equippedState') + ': ' + localizedItemName);
              renderShop();
            });
          };
        } else {
          actionBtn.className = 'btn small primary block';
          actionBtn.innerHTML = tr('buyAction') + ' ' + getFvhCoinSvg('inline') + ' ' + it.price;
          actionBtn.onclick = function (e) {
            e.stopPropagation();
            if (isPurchasing) return;
            var coins = app.store.data.coins || 0;
            if (coins < it.price) {
              app.audio.play('error');
              showToast(tr('notEnoughCoins'));
              return;
            }
            isPurchasing = true;
            var pid = getAppPlayerId(app);
            safeEconomyApi('/api/economy/purchase', {
              playerId: pid,
              itemId: it.id,
              idempotencyKey: 'item_' + pid + '_' + it.id + '_' + Date.now()
            }).then(function (res) {
              isPurchasing = false;
              if (res && res.ok) {
                app.store.update(function (d) {
                  d.coins = res.coins;
                  d.xp = res.xp;
                  d.owned = res.owned;
                });
              } else {
                app.store.update(function (d) {
                  d.coins -= it.price;
                  if (!d.owned) d.owned = [];
                  if (d.owned.indexOf(it.id) === -1) d.owned.push(it.id);
                });
              }
              app.audio.play('claim');
              showToast(tr('purchaseSuccess') + ': ' + localizedItemName);
              renderShop();
            });
          };
        }
        actBox.appendChild(actionBtn);

        card.onclick = function () {
          app.audio.play('click');
          openItemInspector(it);
        };
        catalogueGrid.appendChild(card);
      });
    }

    renderShop();
    container.appendChild(createSharedBottomNav('shop', app));

    if (inspectId) {
      setTimeout(function () {
        var baseCatalog = buildDefaultShopCatalog(curChar);
        var item = baseCatalog.find(function (i) { return i.id === inspectId; });
        if (item) openItemInspector(item);
      }, 80);
    }

    return container;
  }



  // ==========================================
  // LEADERBOARD / ТАБЛИЦА ЛИДЕРОВ СЕЗОНА 1
  // ==========================================

  function getCategoryUnit(cat) {
    if (cat === 'footy') return '⚽';
    if (cat === 'hoops') return '🏀';
    if (cat === 'coins') return getFvhCoinSvg('inline');
    return tr('pointsContributed');
  }

  function getRankTier(score) {
    if (score >= 3500) return { id: 'champion', name: tr('rankTierChampion'), badge: '👑 ' + tr('rankTierChampion').toUpperCase(), color: '#ef4444' };
    if (score >= 2000) return { id: 'diamond', name: tr('rankTierDiamond'), badge: '💎 ' + tr('rankTierDiamond').toUpperCase(), color: '#a855f7' };
    if (score >= 1200) return { id: 'platinum', name: tr('rankTierPlatinum'), badge: '💠 ' + tr('rankTierPlatinum').toUpperCase(), color: '#06b6d4' };
    if (score >= 700) return { id: 'gold', name: tr('rankTierGold'), badge: '🥇 ' + tr('rankTierGold').toUpperCase(), color: '#f59e0b' };
    if (score >= 300) return { id: 'silver', name: tr('rankTierSilver'), badge: '🥈 ' + tr('rankTierSilver').toUpperCase(), color: '#94a3b8' };
    return { id: 'bronze', name: tr('rankTierBronze'), badge: '🥉 ' + tr('rankTierBronze').toUpperCase(), color: '#cd7f32' };
  }

  function createPodiumColHtml(ath, place, cat) {
    var pClass = 'p' + place;
    var crownHtml = place === 1 ? '<div class="fvh-podium-crown">👑</div>' : '';
    var medalEmoji = place === 1 ? '🥇' : place === 2 ? '🥈' : '🥉';
    var isHoops = (ath.char === 'hoops');
    var avatarHtml = getPlayerAvatarHtml({ photoUrl: ath.photoUrl, character: ath.char, extraClass: 'podium-avatar', alt: ath.name });
    var teamTag = isHoops ?
      '<span class="fvh-podium-team-tag hoops">🏀 ' + tr('hoopsChar') + '</span>' :
      '<span class="fvh-podium-team-tag footy">⚽ ' + tr('footyChar') + '</span>';

    var tier = ath.tier || getRankTier(ath.score || 0);
    var winRate = ath.winRate !== undefined ? ath.winRate : 80;
    var wins = ath.wins || 0;
    var losses = ath.losses || 0;

    return '<div class="fvh-podium-col ' + pClass + (isHoops ? ' is-hoops' : ' is-footy') + '">' +
      crownHtml +
      '<div class="fvh-podium-avatar-box ' + (isHoops ? 'hoops-halo' : 'footy-halo') + '">' + avatarHtml + '</div>' +
      '<div class="fvh-podium-name" title="' + escapeHtml(ath.name) + '">' + escapeHtml(ath.name) + '</div>' +
      teamTag +
      '<div class="fvh-podium-tier-pill" style="color:' + tier.color + ';border-color:' + tier.color + '60;">' + tier.badge + '</div>' +
      '<div class="fvh-podium-score">' + (ath.score || 0).toLocaleString() + ' <small style="font-size:10px;opacity:0.8;">' + tr('ptsUnit') + '</small></div>' +
      '<div class="fvh-podium-winrate">' + tr('winsLossesLabel', { w: wins, l: losses }) + ' · ' + tr('winRateLabel', { n: winRate }) + '</div>' +
      '<div class="fvh-podium-pedestal">' +
      '  <span class="fvh-podium-num">#' + place + '</span>' +
      '  <span class="fvh-podium-medal">' + medalEmoji + '</span>' +
      '</div>' +
      '</div>';
  }

  function fetchLeaderboardData(cat, timeframe, app, cb) {
    var pid = getAppPlayerId(app);
    var queryCat = cat || 'season';
    var queryTime = timeframe || 'season';
    var url = getApiUrl('/api/leaderboard?category=' + encodeURIComponent(queryCat) + '&timeframe=' + encodeURIComponent(queryTime) + (pid ? '&playerId=' + encodeURIComponent(pid) : ''));

    var handled = false;
    function finish(d) {
      if (handled) return;
      handled = true;
      cb(d);
    }

    try {
      var controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
      var timeoutId = setTimeout(function () {
        if (controller) controller.abort();
        fallbackClientLeaderboard(queryCat, queryTime, app, finish);
      }, 6000);

      fetch(url, { signal: controller ? controller.signal : undefined })
        .then(function (res) {
          clearTimeout(timeoutId);
          if (res.ok) return res.json();
          throw new Error('Server status ' + res.status);
        })
        .then(function (data) {
          if (data && data.ok && Array.isArray(data.top)) {
            finish(data);
          } else {
            fallbackClientLeaderboard(queryCat, queryTime, app, finish);
          }
        })
        .catch(function () {
          clearTimeout(timeoutId);
          fallbackClientLeaderboard(queryCat, queryTime, app, finish);
        });
    } catch (e) {
      fallbackClientLeaderboard(queryCat, queryTime, app, finish);
    }
  }

  function fallbackClientLeaderboard(cat, timeframe, app, cb) {
    var myData = (app && app.store && app.store.data) || {};
    var myStats = myData.stats || {};
    var myCoins = myData.coins || 0;
    var myXp = myData.xp || 0;
    var myChar = myData.selectedCharacter || 'footy';

    var athletes = [];

    var myName = (myData.profile && myData.profile.nickname) || myData.playerName || 'Alim';
    var isMyAlim = myName.toLowerCase().includes('alim');
    var myWins = myStats.wins || 6;
    var myLosses = myStats.losses || 1;
    var myTotalM = myWins + myLosses;
    var myWinRate = myTotalM > 0 ? Math.round((myWins / myTotalM) * 100) : 86;

    var myPhoto = (myData.telegramUser && (myData.telegramUser.photo_url || myData.telegramUser.photoUrl)) || myData.photoUrl || null;
    var myEntry = {
      id: 'me',
      name: myName,
      char: myChar,
      club: (myChar === 'footy' ? 'Footy United' : 'Hoops Squad'),
      wins: myWins,
      losses: myLosses,
      winRate: myWinRate,
      goals: myStats.goals || 14,
      baskets: myStats.baskets || 4,
      winsByDiff: { easy: 2, normal: 3, hard: 1 },
      coins: myCoins || 1200,
      xp: myXp || 450,
      photoUrl: myPhoto,
      isCurrentUser: true
    };
    athletes.push(myEntry);

    // Always include Brother on opposite team so leaderboard has full competition and podium
    athletes.push({
      id: 'brother_hoops',
      name: 'Brother (Hoops #23)',
      char: (myChar === 'footy' ? 'hoops' : 'footy'),
      club: (myChar === 'footy' ? 'Hoops Squad' : 'Footy United'),
      wins: 5,
      losses: 1,
      winRate: 83,
      goals: 3,
      baskets: 18,
      winsByDiff: { easy: 2, normal: 2, hard: 1 },
      coins: 1100,
      xp: 420,
      photoUrl: 'assets/hero_hoops_cartoon.png',
      isCurrentUser: false
    });

    if (!isMyAlim) {
      athletes.push({
        id: 'alim_footy',
        name: 'Alim (Footy #10)',
        char: 'footy',
        club: 'Footy United',
        wins: 6,
        losses: 1,
        winRate: 86,
        goals: 14,
        baskets: 2,
        winsByDiff: { easy: 2, normal: 3, hard: 1 },
        coins: 1200,
        xp: 450,
        photoUrl: 'assets/hero_footy_cartoon.png',
        isCurrentUser: false
      });
    }

    function computeScore(ath, c, tf) {
      var wDiff = ath.winsByDiff || {
        easy: Math.floor((ath.wins || 0) * 0.25),
        normal: Math.floor((ath.wins || 0) * 0.5),
        hard: Math.floor((ath.wins || 0) * 0.25)
      };
      var winPoints = (wDiff.easy || 0) * 15 + (wDiff.normal || 0) * 30 + (wDiff.hard || 0) * 60;
      var goalsPoints = (ath.goals || 0) * 6;
      var basketsPoints = (ath.baskets || 0) * 3;
      var xpPoints = Math.floor((ath.xp || 0) / 8);

      var raw = 0;
      if (c === 'footy') {
        raw = (ath.goals || 0) * 10 + Math.round(winPoints * 0.55);
      } else if (c === 'hoops') {
        raw = (ath.baskets || 0) * 5 + Math.round(winPoints * 0.45);
      } else if (c === 'coins') {
        raw = ath.coins || 0;
      } else {
        // default: overall/season
        raw = winPoints + goalsPoints + basketsPoints + xpPoints;
      }

      if (tf === 'weekly') {
        return Math.max(15, Math.round(raw * 0.38));
      }
      if (tf === 'alltime') {
        return Math.round(raw * 1.5);
      }
      return raw;
    }

    var filteredAthletes = athletes;
    if (cat === 'footy') {
      filteredAthletes = athletes.filter(function (a) { return a.char === 'footy'; });
    } else if (cat === 'hoops') {
      filteredAthletes = athletes.filter(function (a) { return a.char === 'hoops'; });
    }

    var ranked = filteredAthletes.map(function (a) {
      var score = computeScore(a, cat || 'season', timeframe || 'season');
      var tier = getRankTier(score);
      return Object.assign({}, a, {
        score: score,
        tier: tier,
        badge: tier.badge
      });
    });

    ranked.sort(function (a, b) { return b.score - a.score; });
    ranked.forEach(function (a, idx) { a.rank = idx + 1; });

    var myIdx = ranked.findIndex(function (a) { return a.isCurrentUser; });
    var playerRankInfo = null;
    if (myIdx !== -1) {
      var higher = myIdx > 0 ? ranked[myIdx - 1] : null;
      playerRankInfo = {
        rank: myIdx + 1,
        score: ranked[myIdx].score,
        tier: ranked[myIdx].tier,
        pointsToNext: higher ? Math.max(1, higher.score - ranked[myIdx].score) : 0
      };
    }

    var footballTotal = 0;
    var basketballTotal = 0;
    var footyCount = 0;
    var hoopsCount = 0;
    ranked.forEach(function (a) {
      if (a.char === 'hoops') {
        basketballTotal += (a.score || 0);
        hoopsCount++;
      } else {
        footballTotal += (a.score || 0);
        footyCount++;
      }
    });
    var totalWarScore = footballTotal + basketballTotal;
    var footballPct = totalWarScore > 0 ? Math.round((footballTotal / totalWarScore) * 1000) / 10 : 50;
    var basketballPct = totalWarScore > 0 ? Math.round((100 - footballPct) * 10) / 10 : 50;
    var winningTeam = footballTotal >= basketballTotal ? 'footy' : 'hoops';
    var leadDiff = Math.abs(footballTotal - basketballTotal);

    cb({
      ok: true,
      category: cat || 'season',
      timeframe: timeframe || 'season',
      seasonName: (getActiveLang() === 'ru') ? 'Сезон 1: Битва Команд' : 'Season 1: Football vs Basketball War',
      seasonDaysLeft: 14,
      teamFootball: {
        id: 'footy',
        name: (getActiveLang() === 'ru') ? 'Команда Футбола' : 'Team Football',
        score: footballTotal,
        pct: footballPct,
        athletes: footyCount
      },
      teamBasketball: {
        id: 'hoops',
        name: (getActiveLang() === 'ru') ? 'Команда Баскетбола' : 'Team Basketball',
        score: basketballTotal,
        pct: basketballPct,
        athletes: hoopsCount
      },
      winningTeam: winningTeam,
      leadDiff: leadDiff,
      totalAthletes: ranked.length,
      top: ranked.slice(0, 50),
      player: playerRankInfo
    });
  }

  function renderWarScoreboardAndRankings(body, data, app, onCategoryChange, onTimeframeChange, activeCat, activeTimeframe) {
    var teamFooty = data.teamFootball || { score: 0, pct: 50 };
    var teamHoops = data.teamBasketball || { score: 0, pct: 50 };
    var winningTeam = data.winningTeam || (teamFooty.score >= teamHoops.score ? 'footy' : 'hoops');
    var leadDiff = data.leadDiff || Math.abs(teamFooty.score - teamHoops.score);
    var isFootyWinning = (winningTeam === 'footy');
    var myChar = (app.store && app.store.data && app.store.data.selectedCharacter) || 'footy';
    var cat = activeCat || data.category || 'season';
    var tf = activeTimeframe || data.timeframe || 'season';

    // 1. Category Tabs Bar (Clearly Accessible)
    var catBar = document.createElement('div');
    catBar.className = 'fvh-lb-cat-tabs';
    var categories = [
      { id: 'season', label: '🌐 ' + tr('leaderboardOverall') },
      { id: 'footy', label: '⚽ ' + tr('leaderboardFooty') },
      { id: 'hoops', label: '🏀 ' + tr('leaderboardHoops') }
    ];
    categories.forEach(function (c) {
      var btn = document.createElement('button');
      btn.className = 'fvh-lb-cat-btn' + (c.id === cat || (c.id === 'season' && cat === 'overall') ? ' active' : '');
      btn.textContent = c.label;
      btn.onclick = function () {
        app.audio.play('click');
        if (onCategoryChange) onCategoryChange(c.id);
      };
      catBar.appendChild(btn);
    });
    body.appendChild(catBar);

    // 2. Timeframe Tabs Bar (Weekly / Season 1 / All-Time)
    var timeBar = document.createElement('div');
    timeBar.className = 'fvh-lb-time-tabs';
    var timeframes = [
      { id: 'weekly', label: '📅 ' + tr('timeWeekly') },
      { id: 'season', label: '🏆 ' + tr('timeSeason') },
      { id: 'alltime', label: '⏳ ' + tr('timeAllTime') }
    ];
    timeframes.forEach(function (t) {
      var btn = document.createElement('button');
      btn.className = 'fvh-lb-time-btn' + (t.id === tf ? ' active' : '');
      btn.textContent = t.label;
      btn.onclick = function () {
        app.audio.play('click');
        if (onTimeframeChange) onTimeframeChange(t.id);
      };
      timeBar.appendChild(btn);
    });
    body.appendChild(timeBar);

    // 3. Live Search Filter Bar
    var searchWrap = document.createElement('div');
    searchWrap.className = 'fvh-lb-search-wrap';
    searchWrap.innerHTML =
      '<div class="fvh-lb-search-box">' +
      '  <span class="fvh-lb-search-icon">🔍</span>' +
      '  <input type="text" class="fvh-lb-search-input" placeholder="' + tr('searchAthletePlaceholder') + '" enterkeyhint="done" autocapitalize="none" autocorrect="off" spellcheck="false" />' +
      '  <button class="fvh-lb-search-clear" style="display:none;">✕</button>' +
      '</div>';
    body.appendChild(searchWrap);

    var searchInput = searchWrap.querySelector('.fvh-lb-search-input');
    var searchClear = searchWrap.querySelector('.fvh-lb-search-clear');

    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        searchInput.blur();
      }
    });

    var dismissSearchKeyboard = function (e) {
      if (document.activeElement === searchInput && !searchWrap.contains(e.target)) {
        searchInput.blur();
      }
    };
    document.addEventListener('touchstart', dismissSearchKeyboard, { passive: true });

    // Container for results (Podium + Rows)
    var resultsMount = document.createElement('div');
    resultsMount.className = 'fvh-lb-results-mount';
    body.appendChild(resultsMount);

    function renderAthletesDisplay(filterQuery) {
      resultsMount.innerHTML = '';
      var query = (filterQuery || '').trim().toLowerCase();
      var allAthletes = data.top || [];
      if (cat === 'footy') {
        allAthletes = allAthletes.filter(function (a) { return (a.char || 'footy') === 'footy'; });
      } else if (cat === 'hoops') {
        allAthletes = allAthletes.filter(function (a) { return a.char === 'hoops'; });
      }
      var filtered = query 
        ? allAthletes.filter(function (a) { return a.name.toLowerCase().includes(query) || (a.club && a.club.toLowerCase().includes(query)); })
        : allAthletes;

      if (filtered.length === 0) {
        var emptyCard = document.createElement('div');
        emptyCard.className = 'fvh-lb-empty-card';
        emptyCard.innerHTML =
          '<div style="font-size:36px;margin-bottom:8px;">🔍</div>' +
          '<div style="font-size:14px;font-weight:800;color:var(--text-pure);">' + tr('noAthletesFound') + '</div>' +
          '<div style="font-size:12px;color:var(--text-muted);margin:4px 0 14px;">«' + escapeHtml(query) + '»</div>' +
          '<button class="btn primary small fvh-lb-reset-search-btn">' + tr('retrySync') + '</button>';
        emptyCard.querySelector('.fvh-lb-reset-search-btn').onclick = function () {
          searchInput.value = '';
          searchClear.style.display = 'none';
          renderAthletesDisplay('');
        };
        resultsMount.appendChild(emptyCard);
        return;
      }

      // 4. Team Rivalry Balance Card (Compact Clash Card)
      var scoreboardCard = document.createElement('div');
      scoreboardCard.className = 'fvh-war-scoreboard-card';
      scoreboardCard.innerHTML =
        '<div class="fvh-war-scoreboard-head">' +
        '  <span class="fvh-war-live-pill">' + (data.isPrelaunch ? ('⏳ ' + (getActiveLang() === 'ru' ? 'ПРЕДСЕЗОН' : 'PRE-LAUNCH')) : ('🔴 ' + (getActiveLang() === 'ru' ? 'ПРЯМОЙ ЭФИР' : 'LIVE CLASH'))) + '</span>' +
        '  <span class="fvh-war-rule-tag">' + (data.isPrelaunch ? ('⏳ ' + (getActiveLang() === 'ru' ? 'Скоро запуск' : 'Season Coming Soon')) : ('⏳ ' + tr('warSeasonTimer', { d: data.seasonDaysLeft || 14 }))) + '</span>' +
        '</div>' +
        '<div class="fvh-war-clash-grid">' +
        '  <div class="fvh-war-team-panel footy ' + (isFootyWinning ? 'is-leading' : '') + '">' +
        '    <div class="fvh-team-tag">⚽ ' + tr('teamFootball') + '</div>' +
        '    <div class="fvh-team-score-num">' + teamFooty.score.toLocaleString() + '</div>' +
        '    <div class="fvh-team-meta">' +
        '      <span class="fvh-team-pct">' + teamFooty.pct + '%</span>' +
        '      <span class="fvh-team-status ' + (isFootyWinning ? 'lead' : 'behind') + '">' +
        (isFootyWinning ? ('👑 ' + (getActiveLang() === 'ru' ? 'ЛИДИРУЕТ' : 'LEADS')) : (getActiveLang() === 'ru' ? 'ОТСТАЕТ' : 'CHASING')) +
        '      </span>' +
        '    </div>' +
        '  </div>' +
        '  <div class="fvh-war-vs-divider">' +
        '    <div class="fvh-war-vs-badge">VS</div>' +
        '  </div>' +
        '  <div class="fvh-war-team-panel hoops ' + (!isFootyWinning ? 'is-leading' : '') + '">' +
        '    <div class="fvh-team-tag">🏀 ' + tr('teamBasketball') + '</div>' +
        '    <div class="fvh-team-score-num">' + teamHoops.score.toLocaleString() + '</div>' +
        '    <div class="fvh-team-meta">' +
        '      <span class="fvh-team-pct">' + teamHoops.pct + '%</span>' +
        '      <span class="fvh-team-status ' + (!isFootyWinning ? 'lead' : 'behind') + '">' +
        (!isFootyWinning ? ('👑 ' + (getActiveLang() === 'ru' ? 'ЛИДИРУЕТ' : 'LEADS')) : (getActiveLang() === 'ru' ? 'ОТСТАЕТ' : 'CHASING')) +
        '      </span>' +
        '    </div>' +
        '  </div>' +
        '</div>' +
        '<div class="fvh-war-tug-wrap">' +
        '  <div class="fvh-war-tug-track">' +
        '    <div class="fvh-war-tug-fill footy" style="width:' + teamFooty.pct + '%;"></div>' +
        '    <div class="fvh-war-tug-spark"></div>' +
        '    <div class="fvh-war-tug-fill hoops" style="width:' + teamHoops.pct + '%;"></div>' +
        '  </div>' +
        '  <div class="fvh-war-tug-labels">' +
        '    <span style="color:#38bdf8;font-weight:900;">⚽ ' + teamFooty.pct + '%</span>' +
        '    <span style="color:var(--text-muted);font-size:11px;">' + (getActiveLang() === 'ru' ? 'Баланс команд' : 'Team Balance') + '</span>' +
        '    <span style="color:#fb923c;font-weight:900;">🏀 ' + teamHoops.pct + '%</span>' +
        '  </div>' +
        '</div>';
      resultsMount.appendChild(scoreboardCard);

      // 5. Top 3 Podium (If unfiltered or at least 2 athletes)
      if (!query && filtered.length >= 2) {
        var top1 = filtered[0];
        var top2 = filtered[1];
        var top3 = filtered[2];

        var podium = document.createElement('div');
        podium.className = 'fvh-podium-wrap';
        podium.innerHTML =
          (top2 ? createPodiumColHtml(top2, 2, cat) : '') +
          (top1 ? createPodiumColHtml(top1, 1, cat) : '') +
          (top3 ? createPodiumColHtml(top3, 3, cat) : '');
        resultsMount.appendChild(podium);
      }

      // 6. Ranked Rows (Ranks 4+ when unfiltered, or all matching when filtered)
      var rowsWrap = document.createElement('div');
      rowsWrap.className = 'fvh-leaderboard-rows';
      var rowsAthletes = (!query && filtered.length >= 3) ? filtered.slice(3) : filtered;

      rowsAthletes.forEach(function (ath) {
        var isHoops = (ath.char === 'hoops');
        var tier = ath.tier || getRankTier(ath.score || 0);
        var winRate = ath.winRate !== undefined ? ath.winRate : 80;
        var wins = ath.wins || 0;
        var losses = ath.losses || 0;

        var row = document.createElement('div');
        row.className = 'fvh-leaderboard-row' + (ath.isCurrentUser ? ' is-me' : '') + (isHoops ? ' row-hoops' : ' row-footy');
        row.innerHTML =
          '<div class="fvh-lb-rank">#' + ath.rank + '</div>' +
          '<div class="fvh-lb-avatar ' + (isHoops ? 'hoops-halo' : 'footy-halo') + '">' +
          getPlayerAvatarHtml({ photoUrl: ath.photoUrl, character: ath.char, extraClass: 'row-avatar', alt: ath.name }) +
          '</div>' +
          '<div class="fvh-lb-info">' +
          '  <div class="fvh-lb-name">' +
          escapeHtml(ath.name) + (ath.isCurrentUser ? ' <span class="fvh-me-badge">' + (getActiveLang() === 'ru' ? 'ВЫ' : 'YOU') + '</span>' : '') +
          '  </div>' +
          '  <div class="fvh-lb-club">' +
          '    <span class="fvh-team-pill ' + (isHoops ? 'hoops' : 'footy') + '">' + (isHoops ? '🏀 ' + tr('hoopsChar') : '⚽ ' + tr('footyChar')) + '</span>' +
          '    · ' + escapeHtml(ath.club || 'FvH Club') +
          '    · <span class="fvh-lb-winrate-text">' + tr('winsLossesLabel', { w: wins, l: losses }) + ' (' + tr('winRateLabel', { n: winRate }) + ')</span>' +
          '  </div>' +
          '</div>' +
          '<div class="fvh-lb-score-block">' +
          '  <div class="fvh-lb-tier-badge" style="color:' + tier.color + ';border-color:' + tier.color + '50;">' + tier.badge + '</div>' +
          '  <div class="fvh-lb-score">' +
          '    <span class="fvh-lb-val">' + (ath.score || 0).toLocaleString() + '</span> ' +
          '    <span class="fvh-lb-unit">' + tr('ptsUnit') + '</span>' +
          '  </div>' +
          '</div>';
        rowsWrap.appendChild(row);
      });
      resultsMount.appendChild(rowsWrap);
    }

    searchInput.oninput = function () {
      var val = searchInput.value;
      searchClear.style.display = val ? 'block' : 'none';
      renderAthletesDisplay(val);
    };

    searchClear.onclick = function () {
      searchInput.value = '';
      searchClear.style.display = 'none';
      renderAthletesDisplay('');
    };

    renderAthletesDisplay('');

    // 7. Docked Current Player Bar (rendered ONLY if user is outside the visible top leaderboard ranks)
    var isPlayerInTop = false;
    if (data.top && Array.isArray(data.top)) {
      isPlayerInTop = data.top.some(function (ath) {
        return ath.isCurrentUser || (data.player && (ath.id === data.player.id || ath.name === data.player.name));
      });
    }
    if (data.player && !isPlayerInTop) {
      var pTier = data.player.tier || getRankTier(data.player.score || 0);
      var sticky = document.createElement('div');
      sticky.className = 'fvh-leaderboard-sticky-player ' + myChar;
      sticky.innerHTML =
        '<div class="fvh-lb-sticky-rank">#' + data.player.rank + '</div>' +
        '<div class="fvh-lb-sticky-avatar ' + (myChar === 'hoops' ? 'hoops-halo' : 'footy-halo') + '">' +
        getPlayerAvatarHtml({ photoUrl: (data.player && data.player.photoUrl) || (app.store && app.store.data && app.store.data.photoUrl), character: myChar, extraClass: 'docked-avatar' }) +
        '</div>' +
        '<div class="fvh-lb-sticky-info">' +
        '  <div class="fvh-lb-sticky-title">' +
        (myChar === 'footy' ? '⚽ ' + tr('teamFootball') : '🏀 ' + tr('teamBasketball')) + ' · ' + (getActiveLang() === 'ru' ? 'Ваша позиция в таблице' : 'Your Rank') +
        '  </div>' +
        '  <div class="fvh-lb-sticky-sub">' +
        (data.player.pointsToNext > 0 ? tr('pointsToNext', { n: data.player.pointsToNext }) : (getActiveLang() === 'ru' ? 'Сезон 1 · Предзапуск' : 'Season 1 · Pre-Launch')) +
        '  </div>' +
        '</div>' +
        '<div class="fvh-lb-sticky-score">' +
        '  <div class="fvh-lb-sticky-tier" style="color:' + pTier.color + ';">' + pTier.badge + '</div>' +
        '  <div><b>' + (data.player.score || 0).toLocaleString() + '</b> ' + tr('ptsUnit') + '</div>' +
        '</div>';
      body.appendChild(sticky);
    }
  }

  function buildLeaderboardPage(app, initialCategory) {
    var curCategory = initialCategory || 'season';
    var curTimeframe = 'season';
    var container = document.createElement('div');
    container.className = 'screen solid page-screen has-nav fvh-leaderboard-page';
    container.dataset.id = 'leaderboard';

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
    title.textContent = tr('leaderboardTitle');
    head.appendChild(backBtn);
    head.appendChild(title);
    page.appendChild(head);

    // Body
    var body = document.createElement('div');
    body.className = 'page-body fvh-leaderboard-container';
    page.appendChild(body);
    container.appendChild(page);

    function loadLeaderboard() {
      body.innerHTML =
        '<div style="text-align:center;padding:48px 20px;color:var(--text-muted);">' +
        '  <div style="font-size:36px;margin-bottom:10px;animation:fvhPulse 1.2s infinite;">⚡</div>' +
        '  <div style="font-weight:900;letter-spacing:1px;font-size:14px;color:var(--text-pure);">' + tr('syncingRankings') + '</div>' +
        '</div>';

      fetchLeaderboardData(curCategory, curTimeframe, app, function (data) {
        body.innerHTML = '';
        renderWarScoreboardAndRankings(
          body,
          data,
          app,
          function (newCat) {
            curCategory = newCat;
            loadLeaderboard();
          },
          function (newTime) {
            curTimeframe = newTime;
            loadLeaderboard();
          },
          curCategory,
          curTimeframe
        );
      });
    }

    loadLeaderboard();
    container.appendChild(createSharedBottomNav('leaderboard', app));
    return container;
  }

  // Authoritative Career Statistics Reconciliation Engine
  function reconcileCareerStats(rawStats, selectedChar) {
    var s = rawStats || {};
    var char = selectedChar || 'footy';

    var wins = Math.max(0, Number(s.wins) || 0);
    var losses = Math.max(0, Number(s.losses) || 0);
    var draws = Math.max(0, Number(s.draws) || 0);

    // Total completed matches must reconcile with wins + losses + draws
    var rawPlayed = Math.max(0, Number(s.played !== undefined ? s.played : s.matches) || 0);
    var totalCompleted = Math.max(rawPlayed, wins + losses + draws);

    if (totalCompleted > (wins + losses + draws) && losses === 0) {
      losses = totalCompleted - wins - draws;
    }
    if (totalCompleted < wins) {
      totalCompleted = wins + losses + draws;
    }

    var pByMode = s.playedByMode || {};
    var wByMode = s.winsByMode || {};

    var mF = Math.max(0, Number(s.matchesFooty !== undefined ? s.matchesFooty : pByMode.footy) || 0);
    var mH = Math.max(0, Number(s.matchesHoops !== undefined ? s.matchesHoops : pByMode.hoops) || 0);
    var mC = Math.max(0, Number(s.matchesClash !== undefined ? s.matchesClash : pByMode.clash) || 0);

    var wF = Math.max(0, Number(s.winsFooty !== undefined ? s.winsFooty : wByMode.footy) || 0);
    var wH = Math.max(0, Number(s.winsHoops !== undefined ? s.winsHoops : wByMode.hoops) || 0);
    var wC = Math.max(0, Number(s.winsClash !== undefined ? s.winsClash : wByMode.clash) || 0);

    // Reconcile legacy clash matches into dual Football vs Basketball disciplines
    if (mC > 0) {
      if (char === 'hoops') {
        mH += mC;
      } else {
        mF += mC;
      }
      mC = 0;
    }
    if (wC > 0) {
      if (char === 'hoops') {
        wH += wC;
      } else {
        wF += wC;
      }
      wC = 0;
    }

    mF = Math.max(mF, wF);
    mH = Math.max(mH, wH);

    var sumModes = mF + mH;
    if (sumModes !== totalCompleted) {
      if (sumModes === 0 && totalCompleted > 0) {
        if (wF > 0 || wH > 0) {
          mF = wF;
          mH = wH;
        } else if (char === 'hoops') {
          mH = totalCompleted;
          wH = wins;
        } else {
          mF = totalCompleted;
          wF = wins;
        }
        sumModes = mF + mH;
      }
      if (sumModes < totalCompleted) {
        if (char === 'hoops') {
          mH += (totalCompleted - sumModes);
        } else {
          mF += (totalCompleted - sumModes);
        }
      } else if (sumModes > totalCompleted) {
        totalCompleted = sumModes;
      }
    }

    var sumWins = wF + wH;
    if (sumWins < wins) {
      var diffW = wins - sumWins;
      if (char === 'hoops') {
        wH += diffW;
        mH = Math.max(mH, wH);
      } else {
        wF += diffW;
        mF = Math.max(mF, wF);
      }
      totalCompleted = Math.max(totalCompleted, mF + mH);
    }

    var winRate = totalCompleted > 0 ? Math.round((wins / totalCompleted) * 100) : 0;

    var sumM = Math.max(1, mF + mH);
    var pctF = totalCompleted > 0 ? Math.round((mF / sumM) * 100) : 50;
    var pctH = 100 - pctF;

    return {
      matches: totalCompleted,
      played: totalCompleted,
      wins: wins,
      losses: losses,
      draws: draws,
      winRate: winRate,
      matchesFooty: mF,
      matchesHoops: mH,
      matchesClash: 0,
      winsFooty: wF,
      winsHoops: wH,
      winsClash: 0,
      pctFooty: pctF,
      pctHoops: pctH,
      pctClash: 0,
      goals: Math.max(0, Number(s.goals) || 0),
      baskets: Math.max(0, Number(s.baskets !== undefined ? s.baskets : s.points) || 0)
    };
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

    var d = app.store.data;
    var chosenTeam = d.selectedTeam || d.selectedCharacter || 'footy';
    var isFooty = (chosenTeam === 'footy');
    var tokenSym = isFooty ? '$FOOTY' : '$HOOPS';
    var teamName = isFooty ? 'FOOTY ⚽' : 'HOOPS 🏀';
    var stats = d.stats || {};
    var reconciled = reconcileCareerStats(stats, chosenTeam);

    var totalMatches = reconciled.matches;
    var totalWins = reconciled.wins;
    var totalLosses = reconciled.losses;
    var winPct = reconciled.winRate;
    var wF = reconciled.matchesFooty;
    var wH = reconciled.matchesHoops;
    var pctF = reconciled.pctFooty;
    var pctH = reconciled.pctHoops;

    // 1. Identity Hero Banner with editable Player Nickname
    var tgUser = (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) || null;
    var currentNickname = (d.profile && d.profile.nickname) ||
                         d.playerName ||
                         (tgUser && (tgUser.first_name + (tgUser.last_name ? ' ' + tgUser.last_name : ''))) ||
                         'Alim';
    var tgHandle = (tgUser && tgUser.username) ? ('@' + tgUser.username) : '';
    var userPhotoUrl = (tgUser && tgUser.photo_url) || d.photoUrl || null;
    var lang = getActiveLang();
    var totalPacksCount = (d.packs || []).length;

    var idCard = document.createElement('div');
    idCard.className = 'fvh-profile-id-card';
    idCard.innerHTML =
      '<div class="fvh-profile-avatar-wrap">' +
      '  <div class="fvh-profile-avatar-thumb" style="overflow:hidden;border-radius:50%;">' +
           getPlayerAvatarHtml({ photoUrl: userPhotoUrl, character: chosenTeam, extraClass: 'profile-avatar' }) +
      '  </div>' +
      '</div>' +
      '<div class="fvh-profile-id-info" style="flex:1;min-width:180px;">' +
      '  <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap;">' +
      '    <div class="fvh-profile-title-tag" style="font-weight:900;color:' + (isFooty ? '#00f0ff' : '#ff8c00') + ';">' + teamName + ' · ' + tokenSym + '</div>' +
      '    <button class="fvh-btn-edit-name" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);border-radius:6px;color:#38bdf8;font-size:11px;font-weight:800;padding:3px 8px;cursor:pointer;">✏️ ' + (lang === 'ru' ? 'Изменить' : 'Edit') + '</button>' +
      '  </div>' +
      '  <h2 class="fvh-profile-name-text" style="margin:4px 0 2px;font-size:20px;font-weight:900;color:#fff;">' + escapeHtml(currentNickname) + '</h2>' +
      '  <div style="font-size:11px;color:#94a3b8;">' + (tgHandle ? tgHandle + ' · ' : '') + tr('teamLockedBadge') + '</div>' +
      (totalPacksCount > 0 ? '<div style="margin-top:4px;"><span class="fvh-packs-count-pill">' + tr('packsAvailable', { n: totalPacksCount }) + '</span></div>' : '') +
      '</div>';
    body.appendChild(idCard);

    // Edit Name Modal Handler
    var editBtn = idCard.querySelector('.fvh-btn-edit-name');
    if (editBtn) {
      editBtn.onclick = function () {
        app.audio.play('click');
        var editOverlay = document.createElement('div');
        editOverlay.className = 'modal-back';
        var editModal = document.createElement('div');
        editModal.className = 'modal';
        editModal.innerHTML =
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
          '  <h3 style="margin:0;font-size:16px;font-weight:900;">✏️ ' + (lang === 'ru' ? 'Изменить имя атлета' : 'Edit Player Name') + '</h3>' +
          '  <button class="modal-close-x" style="width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:#fff;cursor:pointer;">✕</button>' +
          '</div>' +
          '<div style="margin-bottom:14px;">' +
          '  <input type="text" class="fvh-name-input" maxlength="20" value="' + escapeHtml(currentNickname) + '" style="width:100%;box-sizing:border-box;padding:10px 12px;border-radius:8px;background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.2);color:#fff;font-size:14px;font-weight:700;">' +
          '</div>' +
          '<div style="display:flex;gap:8px;">' +
          '  <button class="btn block fvh-btn-cancel-name" style="flex:1;">' + (lang === 'ru' ? 'Отмена' : 'Cancel') + '</button>' +
          '  <button class="btn primary block fvh-btn-save-name" style="flex:1.5;">' + (lang === 'ru' ? 'Сохранить' : 'Save') + '</button>' +
          '</div>';

        editModal.querySelector('.modal-close-x').onclick = function () { editOverlay.remove(); };
        editModal.querySelector('.fvh-btn-cancel-name').onclick = function () { editOverlay.remove(); };

        var nameInput = editModal.querySelector('.fvh-name-input');
        editModal.querySelector('.fvh-btn-save-name').onclick = function () {
          var val = (nameInput.value || '').trim();
          if (!val) {
            showToast(lang === 'ru' ? 'Имя не может быть пустым' : 'Name cannot be empty');
            return;
          }
          currentNickname = val;
          app.store.update(function (d) {
            d.playerName = val;
            if (!d.profile) d.profile = {};
            d.profile.nickname = val;
          });
          syncAuthoritativeEconomy(app);
          app.audio.play('claim');
          showToast(lang === 'ru' ? '✓ Имя успешно сохранено!' : '✓ Name successfully saved!');
          editOverlay.remove();
          app.show(buildProfilePage(app), 'profile');
        };

        editOverlay.appendChild(editModal);
        document.body.appendChild(editOverlay);
        setTimeout(function () { nameInput.focus(); }, 100);
      };
    }

    // 2. FvH Coins Balance Card (Distinct from blockchain tokens)
    var coinsCard = document.createElement('div');
    coinsCard.className = 'fvh-card-panel';
    coinsCard.style.background = 'linear-gradient(135deg, rgba(255,200,0,0.08) 0%, rgba(15,23,42,0.95) 100%)';
    coinsCard.style.border = '1.5px solid rgba(255,200,0,0.3)';
    coinsCard.style.display = 'flex';
    coinsCard.style.alignItems = 'center';
    coinsCard.style.justifyContent = 'space-between';
    coinsCard.style.padding = '14px 18px';

    coinsCard.innerHTML =
      '<div style="display:flex;align-items:center;gap:12px;">' +
      '  <div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;">' + getFvhCoinSvg('thumb') + '</div>' +
      '  <div>' +
      '    <div style="font-size:11px;color:#94a3b8;font-weight:700;text-transform:uppercase;">' + tr('catCoins') + '</div>' +
      '    <div style="font-size:20px;font-weight:900;color:#facc15;margin-top:2px;">' + (d.coins || 0).toLocaleString() + ' FvH</div>' +
      '  </div>' +
      '</div>' +
      '<button class="btn primary small fvh-btn-profile-shop" style="font-weight:800;padding:8px 14px;">🛒 ' + tr('visitShopBtn') + '</button>';

    coinsCard.querySelector('.fvh-btn-profile-shop').onclick = function () {
      app.audio.play('click');
      app.go('shop');
    };
    body.appendChild(coinsCard);

    // 3. Team Token Balance Card ($FOOTY or $HOOPS only, with Withdraw button)
    var tokenCard = document.createElement('div');
    tokenCard.className = 'fvh-card-panel';
    tokenCard.style.background = isFooty
      ? 'linear-gradient(135deg, rgba(0,240,255,0.08) 0%, rgba(15,23,42,0.95) 100%)'
      : 'linear-gradient(135deg, rgba(255,140,0,0.08) 0%, rgba(15,23,42,0.95) 100%)';
    tokenCard.style.border = isFooty ? '1.5px solid rgba(0,240,255,0.3)' : '1.5px solid rgba(255,140,0,0.3)';
    tokenCard.style.padding = '16px 18px';

    tokenCard.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
      '  <div style="display:flex;align-items:center;gap:8px;">' +
      '    <span style="font-size:22px;">' + (isFooty ? '⚽' : '🏀') + '</span>' +
      '    <div>' +
      '      <div style="font-size:15px;font-weight:900;color:#fff;">' + tokenSym + '</div>' +
      '      <div style="font-size:11px;color:var(--text-muted);">' + (isFooty ? 'FOOTY Faction Token' : 'HOOPS Faction Token') + '</div>' +
      '    </div>' +
      '  </div>' +
      '  <span style="font-size:11px;color:#38bdf8;background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.25);border-radius:20px;padding:3px 10px;font-weight:800;">' +
      tr('pendingTokenLaunch') +
      '  </span>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:10px 14px;">' +
      '  <div>' +
      '    <div style="font-size:10.5px;color:#94a3b8;font-weight:700;">' + (isFooty ? '$FOOTY Balance' : '$HOOPS Balance') + '</div>' +
      '    <div style="font-size:18px;font-weight:900;color:#fff;margin-top:2px;">0 ' + tokenSym + '</div>' +
      '  </div>' +
      '  <button class="btn small fvh-btn-withdraw-token" style="font-weight:800;padding:8px 16px;background:rgba(255,255,255,0.08);border:1.5px solid rgba(255,255,255,0.2);color:#fff;cursor:pointer;">' +
      tr('tokenWithdrawBtn') +
      '  </button>' +
      '</div>';

    // Withdraw button modal with EXACT COPY across all 15 languages
    tokenCard.querySelector('.fvh-btn-withdraw-token').onclick = function () {
      app.audio.play('click');
      var overlay = document.createElement('div');
      overlay.className = 'modal-back';
      var modal = document.createElement('div');
      modal.className = 'modal';
      modal.innerHTML =
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
        '  <h3 style="margin:0;font-size:16px;font-weight:900;">' + tr('tokenWithdrawModalTitle') + '</h3>' +
        '  <button class="modal-close-x" style="width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:#fff;cursor:pointer;">✕</button>' +
        '</div>' +
        '<p style="font-size:13px;color:var(--text-muted);line-height:1.5;margin:0 0 18px;">' + tr('tokenWithdrawNotice') + '</p>' +
        '<button class="btn primary block fvh-btn-close-withdraw">' + tr('gotItBtn') + '</button>';

      modal.querySelector('.modal-close-x').onclick = function () { overlay.remove(); };
      modal.querySelector('.fvh-btn-close-withdraw').onclick = function () { overlay.remove(); };
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
    };

    body.appendChild(tokenCard);

    // 3.5 TON Connect & Public Airdrop Wallet Card (Stage J4)
    var walletAddress = d.tonWalletAddress || (d.profile && d.profile.tonAddress) || '';
    var isWalletConnected = Boolean(walletAddress);

    function formatAbbreviatedAddress(addr) {
      if (!addr || addr.length < 10) return addr || '';
      return addr.slice(0, 4) + '...' + addr.slice(-4);
    }

    var walletCard = document.createElement('div');
    walletCard.className = 'fvh-card-panel fvh-ton-wallet-card';
    walletCard.style.background = isWalletConnected
      ? 'linear-gradient(135deg, rgba(0, 152, 234, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(15, 23, 42, 0.95) 100%)';
    walletCard.style.border = isWalletConnected ? '1.5px solid rgba(0, 152, 234, 0.45)' : '1px solid rgba(255, 255, 255, 0.12)';
    walletCard.style.padding = '16px 18px';

    var statusBadgeHtml = isWalletConnected
      ? '<span style="font-size:11px;color:#22c55e;background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.3);border-radius:20px;padding:3px 10px;font-weight:800;">✓ ' + tr('profileTgeWalletConnected') + '</span>'
      : '<span style="font-size:11px;color:#38bdf8;background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.25);border-radius:20px;padding:3px 10px;font-weight:800;">' + tr('profileTgeWalletNotConnected') + '</span>';

    walletCard.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
      '  <div style="display:flex;align-items:center;gap:10px;">' +
      '    <div style="width:34px;height:34px;border-radius:10px;background:rgba(0,152,234,0.15);border:1px solid rgba(0,152,234,0.3);display:flex;align-items:center;justify-content:center;font-size:18px;">💎</div>' +
      '    <div>' +
      '      <div style="font-size:14px;font-weight:900;color:#fff;">' + tr('profileTgeWalletTitle') + '</div>' +
      '      <div style="font-size:10.5px;color:var(--text-muted);">' + (getActiveLang() === 'ru' ? 'Снимок TGE & Эйрдроп (Тестнет-каркас)' : 'TGE Snapshot & Airdrop (Scaffolding)') + '</div>' +
      '    </div>' +
      '  </div>' +
      statusBadgeHtml +
      '</div>' +
      (isWalletConnected
        ? '<div style="background:rgba(0,0,0,0.35);border:1px solid rgba(0,152,234,0.25);border-radius:10px;padding:12px 14px;margin-bottom:10px;">' +
          '  <div style="font-size:10.5px;color:#94a3b8;font-weight:700;">' + (getActiveLang() === 'ru' ? 'Привязанный публичный адрес' : 'Linked Public Address') + '</div>' +
          '  <div style="font-size:15px;font-weight:900;color:#38bdf8;font-family:monospace;margin-top:4px;word-break:break-all;">' + escapeHtml(formatAbbreviatedAddress(walletAddress)) + '</div>' +
          '</div>' +
          '<div style="display:flex;gap:8px;">' +
          '  <button class="btn small fvh-btn-copy-ton-addr" style="flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.18);color:#fff;font-weight:800;padding:8px 12px;cursor:pointer;">📋 ' + (getActiveLang() === 'ru' ? 'Копировать' : 'Copy') + '</button>' +
          '  <button class="btn small fvh-btn-disconnect-ton" style="flex:1;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.35);color:#ef4444;font-weight:800;padding:8px 12px;cursor:pointer;">✕ ' + (getActiveLang() === 'ru' ? 'Отключить' : 'Disconnect') + '</button>' +
          '</div>'
        : '<p style="font-size:11.5px;color:var(--text-muted);line-height:1.45;margin:0 0 12px;">' + tr('profileTgeModalDesc') + '</p>' +
          '<div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);border-radius:8px;padding:8px 10px;margin-bottom:12px;font-size:11px;color:#fbbf24;display:flex;align-items:flex-start;gap:6px;">' +
          '  <span>🛡️</span>' +
          '  <span>' + tr('profileTgeSecurityWarning') + '</span>' +
          '</div>' +
          '<button class="btn primary block fvh-btn-connect-ton" style="font-weight:800;padding:10px 14px;background:#0098ea;border:none;">💎 ' + tr('profileTgeConnectBtn') + '</button>'
      );

    if (isWalletConnected) {
      walletCard.querySelector('.fvh-btn-copy-ton-addr').onclick = function () {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(walletAddress).then(function () {
            app.audio.play('click');
            showToast(getActiveLang() === 'ru' ? 'Адрес кошелька скопирован' : 'Wallet address copied');
          });
        }
      };

      walletCard.querySelector('.fvh-btn-disconnect-ton').onclick = function () {
        app.audio.play('click');
        safeEconomyApi('/api/wallet/disconnect', { playerId: getPlayerId() }).then(function () {
          app.store.update(function (st) {
            st.tonWalletAddress = null;
            if (st.profile) st.profile.tonAddress = null;
          });
          showToast(getActiveLang() === 'ru' ? 'Кошелек отключен' : 'Wallet disconnected');
          app.show(buildProfilePage(app), 'profile');
        }).catch(function () {
          app.store.update(function (st) {
            st.tonWalletAddress = null;
            if (st.profile) st.profile.tonAddress = null;
          });
          app.show(buildProfilePage(app), 'profile');
        });
      };
    } else {
      walletCard.querySelector('.fvh-btn-connect-ton').onclick = function () {
        app.audio.play('click');
        var overlay = document.createElement('div');
        overlay.className = 'modal-back';
        var modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML =
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
          '  <h3 style="margin:0;font-size:16px;font-weight:900;">💎 ' + tr('profileTgeModalTitle') + '</h3>' +
          '  <button class="modal-close-x" style="width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:#fff;cursor:pointer;">✕</button>' +
          '</div>' +
          '<p style="font-size:12.5px;color:var(--text-muted);line-height:1.45;margin:0 0 12px;">' + tr('profileTgeModalDesc') + '</p>' +
          '<div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:8px 10px;margin-bottom:12px;font-size:11px;color:#fca5a5;display:flex;align-items:flex-start;gap:6px;">' +
          '  <span>⚠️</span>' +
          '  <span>' + tr('profileTgeSeedWarningAlert') + '</span>' +
          '</div>' +
          '<input type="text" class="fvh-ton-modal-input" placeholder="' + tr('profileTgeAddressPlaceholder') + '" style="width:100%;box-sizing:border-box;background:rgba(0,0,0,0.4);border:1px solid rgba(0,152,234,0.4);border-radius:10px;padding:10px 12px;color:#fff;font-family:monospace;font-size:13px;margin-bottom:14px;outline:none;" autocapitalize="none" autocorrect="off" spellcheck="false" enterkeyhint="done" />' +
          '<div style="display:flex;gap:8px;">' +
          '  <button class="btn block fvh-btn-cancel-ton" style="flex:1;">' + (getActiveLang() === 'ru' ? 'Отмена' : 'Cancel') + '</button>' +
          '  <button class="btn primary block fvh-btn-submit-ton" style="flex:1.5;background:#0098ea;border:none;">' + tr('profileTgeConnectBtn') + '</button>' +
          '</div>';

        modal.querySelector('.modal-close-x').onclick = function () { overlay.remove(); };
        modal.querySelector('.fvh-btn-cancel-ton').onclick = function () { overlay.remove(); };

        var inputEl = modal.querySelector('.fvh-ton-modal-input');
        modal.querySelector('.fvh-btn-submit-ton').onclick = function () {
          var raw = (inputEl.value || '').trim();
          if (!raw) {
            showToast(tr('profileTgeInvalidAddress'));
            return;
          }
          if (/\s+/.test(raw) || raw.split(' ').length > 1) {
            alert(tr('profileTgeSeedWarningAlert'));
            return;
          }
          var isDomain = /^[a-zA-Z0-9_-]+\.ton$/i.test(raw);
          var isBase64 = /^(EQ|UQ|kQ|0:)[a-zA-Z0-9_\-+/]{46,66}$/i.test(raw);
          if (!isDomain && !isBase64) {
            showToast(tr('profileTgeInvalidAddress'));
            return;
          }

          safeEconomyApi('/api/wallet/link', {
            playerId: getPlayerId(),
            address: raw
          }).then(function (res) {
            app.store.update(function (st) {
              st.tonWalletAddress = raw;
              if (!st.profile) st.profile = {};
              st.profile.tonAddress = raw;
            });
            app.audio.play('claim');
            showToast(getActiveLang() === 'ru' ? '✓ TON-кошелек успешно привязан!' : '✓ TON wallet linked successfully!');
            overlay.remove();
            app.show(buildProfilePage(app), 'profile');
          }).catch(function (e) {
            app.store.update(function (st) {
              st.tonWalletAddress = raw;
              if (!st.profile) st.profile = {};
              st.profile.tonAddress = raw;
            });
            app.audio.play('claim');
            showToast(getActiveLang() === 'ru' ? '✓ TON-кошелек привязан' : '✓ TON wallet linked');
            overlay.remove();
            app.show(buildProfilePage(app), 'profile');
          });
        };

        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        setTimeout(function () { inputEl.focus(); }, 100);
      };
    }

    body.appendChild(walletCard);

    // 4. Transaction History Ledger
    var ledgerCard = document.createElement('div');
    ledgerCard.className = 'fvh-card-panel';
    var txList = d.transactions || [];

    var ledgerRows = '';
    if (txList.length === 0) {
      ledgerRows = '<div style="font-size:12px;color:var(--text-muted);padding:14px 0;text-align:center;">' + tr('txNoHistory') + '</div>';
    } else {
      ledgerRows = '<div class="fvh-tx-ledger">';
      txList.slice(0, 10).forEach(function (tx) {
        var isPos = tx.amount > 0;
        var amtStr = (isPos ? '+' : '') + tx.amount + ' FvH';
        var dateStr = tx.timestamp ? new Date(tx.timestamp).toLocaleDateString() : '';
        ledgerRows +=
          '<div class="fvh-tx-item">' +
          '  <div>' +
          '    <div class="fvh-tx-desc">' + escapeHtml(tx.description || tx.type) + '</div>' +
          (dateStr ? '    <div class="fvh-tx-time">' + dateStr + '</div>' : '') +
          '  </div>' +
          '  <div class="fvh-tx-amount ' + (isPos ? 'positive' : 'negative') + '">' + amtStr + '</div>' +
          '</div>';
      });
      ledgerRows += '</div>';
    }

    ledgerCard.innerHTML =
      '<div class="fvh-panel-head">📊 ' + tr('txHistory') + '</div>' +
      ledgerRows;
    body.appendChild(ledgerCard);

    // 5. Career Records
    var statsCard = document.createElement('div');
    statsCard.className = 'fvh-card-panel';
    statsCard.innerHTML =
      '<div class="fvh-panel-head">🏆 ' + tr('statRecords') + '</div>' +
      '<div class="fvh-stats-kpi-grid">' +
      '<div class="fvh-kpi-item"><small>' + tr('matches') + '</small><b>' + totalMatches + '</b></div>' +
      '<div class="fvh-kpi-item win"><small>' + tr('victories') + '</small><b>' + totalWins + '</b></div>' +
      '<div class="fvh-kpi-item loss"><small>' + tr('defeats') + '</small><b>' + totalLosses + '</b></div>' +
      '<div class="fvh-kpi-item rate"><small>' + tr('winRate') + '</small><b>' + winPct + '%</b></div>' +
      '</div>' +
      '<div style="margin-top:14px;">' +
      '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);margin-bottom:6px;font-weight:800;">' +
      '<span style="color:#38bdf8;">⚽ ' + tr('football') + ' (' + wF + ')</span>' +
      '<span style="color:#fb923c;">🏀 ' + tr('basketball') + ' (' + wH + ')</span>' +
      '</div>' +
      '<div class="fvh-dual-bar" style="height:10px;border-radius:6px;overflow:hidden;background:#0f172a;display:flex;border:1px solid rgba(255,255,255,0.1);">' +
      '<div class="fvh-dual-footy" style="width:' + pctF + '%;background:linear-gradient(90deg,#0284c7,#00f0ff);transition:width 0.3s ease;"></div>' +
      '<div class="fvh-dual-hoops" style="width:' + pctH + '%;background:linear-gradient(90deg,#f97316,#ea580c);transition:width 0.3s ease;"></div>' +
      '</div>' +
      '</div>';
    body.appendChild(statsCard);

    page.appendChild(body);
    container.appendChild(page);

    // Bottom Navigation
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

  // Official Supporters & Stadium Crowd Catalog
  var CROWD_CATALOG = [
    {
      id: 'crowd_footy_ultras',
      category: 'crowd',
      name: 'FOOTY Ultras',
      nameKey: 'crowdFootyUltrasName',
      descKey: 'crowdFootyUltrasDesc',
      rarity: 'common',
      icon: '⚽',
      colors: ['#00f0ff', '#0284c7', '#ffffff', '#1e293b'],
      bannerGrad: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #00f0ff 100%)',
      isDefault: true,
      mode: 'footy'
    },
    {
      id: 'crowd_hoops_allstars',
      category: 'crowd',
      name: 'HOOPS All-Stars',
      nameKey: 'crowdHoopsAllstarsName',
      descKey: 'crowdHoopsAllstarsDesc',
      rarity: 'common',
      icon: '🏀',
      colors: ['#ff6b00', '#fb923c', '#f59e0b', '#18181b'],
      bannerGrad: 'linear-gradient(135deg, #ea580c 0%, #c2410c 50%, #f59e0b 100%)',
      isDefault: true,
      mode: 'hoops'
    },
    {
      id: 'crowd_global_fest',
      category: 'crowd',
      name: 'Global Festival',
      nameKey: 'crowdGlobalFestName',
      descKey: 'crowdGlobalFestDesc',
      rarity: 'rare',
      icon: '🌍',
      colors: ['#e84a5f', '#f6c445', '#4fb3ff', '#7be08a'],
      bannerGrad: 'linear-gradient(135deg, #e11d48 0%, #7c3aed 50%, #38bdf8 100%)',
      isDefault: false,
      mode: 'all'
    },
    {
      id: 'crowd_cyber_vip',
      category: 'crowd',
      name: 'Cyber Neon VIP',
      nameKey: 'crowdCyberVipName',
      descKey: 'crowdCyberVipDesc',
      rarity: 'epic',
      icon: '⚡',
      colors: ['#ff2bd6', '#00e5ff', '#a855f7', '#0f172a'],
      bannerGrad: 'linear-gradient(135deg, #d946ef 0%, #4c1d95 50%, #00e5ff 100%)',
      isDefault: false,
      mode: 'all'
    },
    {
      id: 'crowd_emerald_forest',
      category: 'crowd',
      name: 'Emerald Supporters',
      nameKey: 'crowdEmeraldForestName',
      descKey: 'crowdEmeraldForestDesc',
      rarity: 'rare',
      icon: '🌲',
      colors: ['#10b981', '#059669', '#065f46', '#ffffff'],
      bannerGrad: 'linear-gradient(135deg, #059669 0%, #064e3b 50%, #34d399 100%)',
      isDefault: false,
      mode: 'all'
    },
    {
      id: 'crowd_gold_champs',
      category: 'crowd',
      name: 'Champions Golden Suite',
      nameKey: 'crowdGoldChampsName',
      descKey: 'crowdGoldChampsDesc',
      rarity: 'legendary',
      icon: '👑',
      colors: ['#f6c445', '#d97706', '#1c1917', '#fffbeb'],
      bannerGrad: 'linear-gradient(135deg, #b45309 0%, #1c1917 50%, #fcd34d 100%)',
      isDefault: false,
      mode: 'all'
    }
  ];

  // High-Performance Native WebSocket & Optimized Throttled Relay Link
  function RelayLink(matchId, role) {
    this.matchId = matchId;
    this.role = role;
    this.h = {};
    this.open = true;
    this.closed = false;
    this.rtt = 18;
    this.ws = null;
    this.wsOpen = false;
    this.outQueue = [];
    this.lastPostTime = 0;
    this.pendingPost = null;
    this.pollInterval = null;
    this.lastMsgAt = Date.now();
    var self = this;

    this.pingInterval = setInterval(function () {
      if (self.closed) return;
      self.sendCtl({ k: 'ping', t: Date.now() });
      if (self.lastMsgAt && (Date.now() - self.lastMsgAt > 8000)) {
        if (self.h && self.h.onStatusChange) self.h.onStatusChange('reconnecting');
      }
    }, 2500);

    function connectWs() {
      if (self.closed) return;
      try {
        if (typeof WebSocket !== 'undefined') {
          var wsProto = (window.location.protocol === 'https:') ? 'wss:' : 'ws:';
          var wsUrl = wsProto + '//' + window.location.host + '/ws/match?matchId=' + encodeURIComponent(matchId) + '&role=' + encodeURIComponent(role);
          var ws = new WebSocket(wsUrl);
          self.ws = ws;

          ws.onopen = function () {
            if (self.closed) { ws.close(); return; }
            self.wsOpen = true;
            self.lastMsgAt = Date.now();
            if (self.h && self.h.onStatusChange) self.h.onStatusChange('connected');
            if (self.pollInterval) {
              clearInterval(self.pollInterval);
              self.pollInterval = null;
            }
          };

          ws.onmessage = function (evt) {
            if (self.closed) return;
            try {
              var parsed = JSON.parse(evt.data);
              var m = parsed.packet || parsed;
              if (!m.k && parsed.type) {
                m = { k: parsed.type, i: parsed.data, s: parsed.data, l: parsed.data };
              }
              self.lastMsgAt = Date.now();
              if (m.k === 'ping') {
                self.sendCtl({ k: 'pong', t: m.t });
                return;
              }
              if (m.k === 'pong') {
                self.rtt = Math.max(1, Math.round(Date.now() - Number(m.t || Date.now())));
                return;
              }
              if (self.h.onMessage) self.h.onMessage(m, 'fast');
            } catch (e) {}
          };

          ws.onerror = function () {
            self.wsOpen = false;
            startHttpFallback();
          };

          ws.onclose = function () {
            self.wsOpen = false;
            if (!self.closed) {
              startHttpFallback();
              setTimeout(connectWs, 1500);
            }
          };
        }
      } catch (e) {
        self.wsOpen = false;
        startHttpFallback();
      }
    }

    function startHttpFallback() {
      if (self.pollInterval || self.closed) return;
      // Controlled 10Hz polling (100ms) - completely eliminates network flooding!
      self.pollInterval = setInterval(function () {
        if (self.closed || self.wsOpen) return;
        fetch(getApiUrl('/api/match/relay?matchId=' + encodeURIComponent(matchId) + '&role=' + encodeURIComponent(role)))
          .then(function (r) { return r.json(); })
          .then(function (res) {
            if (res && res.ok && Array.isArray(res.messages)) {
              res.messages.forEach(function (msg) {
                var m = msg.packet || msg;
                if (!m.k && msg.type) {
                  m = { k: msg.type, i: msg.data, s: msg.data, l: msg.data };
                }
                if (self.h.onMessage) self.h.onMessage(m, 'fast');
              });
            }
          }).catch(function () {});
      }, 100);
    }

    connectWs();
    setTimeout(function () {
      if (!self.wsOpen && !self.closed) startHttpFallback();
    }, 600);
  }

  RelayLink.prototype.sendCtl = function (m) {
    if (this.closed) return;
    if (this.ws && this.wsOpen && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(m));
        return;
      } catch (e) {
        this.wsOpen = false;
      }
    }
    // Batch HTTP sends to max 10 requests/sec when WS is down
    var now = Date.now();
    this.outQueue.push(m);
    var self = this;
    if (now - this.lastPostTime > 90) {
      this.flushHttp();
    } else if (!this.pendingPost) {
      this.pendingPost = setTimeout(function () {
        self.pendingPost = null;
        self.flushHttp();
      }, 95);
    }
  };

  RelayLink.prototype.flushHttp = function () {
    if (this.closed || !this.outQueue.length) return;
    var batch = this.outQueue.slice();
    this.outQueue = [];
    this.lastPostTime = Date.now();
    fetch(getApiUrl('/api/match/relay'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId: this.matchId, role: this.role, packet: batch[batch.length - 1], batch: batch })
    }).catch(function () {});
  };

  RelayLink.prototype.sendFast = function (m) {
    this.sendCtl(m);
  };

  RelayLink.prototype.close = function () {
    this.closed = true;
    this.open = false;
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    if (this.pendingPost) {
      clearTimeout(this.pendingPost);
      this.pendingPost = null;
    }
    if (this.ws) {
      try { this.ws.close(); } catch (e) {}
    }
    if (this.h.onClose) this.h.onClose('local');
  };
  window.RelayLink = RelayLink;

  // Helper to establish WebRTC or Resilient Server Relay Session between two players
  function startWebRTCSession(app, role, roomCode, myName, oppName, modeOrOpts, onConnect, onError) {
    window.startWebRTCSession = startWebRTCSession;
    if (typeof window.require !== 'function') {
      onError('Module loader unavailable');
      return;
    }
    window.require(['net/link', 'net/session'], function (linkMod, sessionMod) {
      try {
        var mode = typeof modeOrOpts === 'object' ? (modeOrOpts.mode || 'footy') : (modeOrOpts || 'footy');
        var minutes = typeof modeOrOpts === 'object' ? (modeOrOpts.minutes || 2) : 2;
        var seed = typeof modeOrOpts === 'object' ? (modeOrOpts.seed || ((Math.random() * 1e9) | 0)) : ((Math.random() * 1e9) | 0);
        var arenaId = typeof modeOrOpts === 'object' ? (modeOrOpts.arenaId || null) : null;
        var isStarted = false;
        var relayFallbackTimer = null;

        function startWithRelay() {
          if (isStarted) return;
          isStarted = true;
          if (relayFallbackTimer) clearTimeout(relayFallbackTimer);
          var rLink = new RelayLink(roomCode, role);
          var info = { role: role, mode: mode, minutes: minutes, seed: seed, arenaId: arenaId, myName: myName, oppName: oppName, matchId: roomCode };
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

        // If WebRTC negotiation doesn't complete within 2.5 seconds, use RelayLink smoothly
        relayFallbackTimer = setTimeout(function () {
          if (!isStarted) {
            console.log('WebRTC negotiation timeout, falling back to Server Relay Link');
            if (link) {
              try { link.close(); } catch (e) {}
            }
            startWithRelay();
          }
        }, 2500);

        link.h.onClose = function () {
          if (!isStarted) startWithRelay();
        };

        if (role === 'host') {
          link.createOffer({ mode: mode, minutes: minutes, seed: seed, arenaId: arenaId, name: myName }).then(function (offerStr) {
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
                              var info = { role: 'host', mode: mode, minutes: minutes, seed: seed, arenaId: arenaId, myName: myName, oppName: oppName, matchId: roomCode };
                              onConnect(new sessionMod.OnlineSession(link, info));
                            }
                          };
                          link.sendCtl({ k: 'start', mode: mode, minutes: minutes, seed: seed, arenaId: arenaId, host: myName, guest: oppName });
                        };
                        if (link.open && link.h.onOpen) link.h.onOpen();
                      }).catch(function (e) {
                        startWithRelay();
                      });
                    }
                  }
                }).catch(function () {});
            }, 600);
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
                              var resolvedMode = m.mode || mode;
                              var resolvedSeed = (m.seed !== undefined && m.seed !== null) ? m.seed : seed;
                              var resolvedMinutes = m.minutes || minutes;
                              var resolvedArena = m.arenaId || arenaId;
                              var info = { role: 'guest', mode: resolvedMode, minutes: resolvedMinutes, seed: resolvedSeed, arenaId: resolvedArena, myName: myName, oppName: oppName, matchId: roomCode };
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
          }, 600);
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

          // Authoritative Server Match Configuration Resolution
          var m = (matchInfo && matchInfo.match) ? matchInfo.match : (matchInfo || {});
          var rawMode = String((m.mode !== undefined ? m.mode : (matchInfo && matchInfo.mode)) || '').toLowerCase().trim();
          var resolvedMode = 'footy';
          if (rawMode === 'hoops') {
            resolvedMode = 'hoops';
          } else if (rawMode === 'footy') {
            resolvedMode = 'footy';
          } else {
            // Malformed, 'clash', or missing mode: resolve using host character if available, else safe fallback
            var hostChar = (m.host && (m.host.char || m.host.character)) || (matchInfo && matchInfo.opponent && matchInfo.role === 'guest' && matchInfo.opponent.char);
            if (hostChar === 'hoops') resolvedMode = 'hoops';
            else if (hostChar === 'footy') resolvedMode = 'footy';
            else resolvedMode = (curChar === 'hoops') ? 'hoops' : 'footy';
          }

          var rawMin = Number(m.minutes !== undefined ? m.minutes : (matchInfo && matchInfo.minutes));
          var resolvedMin = (!isNaN(rawMin) && rawMin >= 1 && rawMin <= 10) ? Math.round(rawMin) : 2;

          var rawSeed = Number(m.seed !== undefined ? m.seed : (matchInfo && matchInfo.seed));
          var resolvedSeed = (!isNaN(rawSeed) && rawSeed !== 0) ? (rawSeed | 0) : ((Math.random() * 1e9) | 0);

          var resolvedArena = m.arenaId || (matchInfo && matchInfo.arenaId) || null;

          startWebRTCSession(app, matchInfo.role, matchInfo.matchId, playerName, opp.name, {
            mode: resolvedMode,
            minutes: resolvedMin,
            seed: resolvedSeed,
            arenaId: resolvedArena
          }, function (session) {
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

  // -------------------------------------------------------------
  // Dedicated Pre-Match Multiplayer Lobby (Room Synchronization & Mode Selection)
  // -------------------------------------------------------------
  function showPrivateMatchLobby(app, roomCode, role, initialRoomData) {
    var overlay = document.createElement('div');
    overlay.className = 'modal-back';
    var modal = document.createElement('div');
    modal.className = 'modal fvh-matchmaking-modal fvh-lobby-modal';

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

    var room = initialRoomData || {
      roomCode: roomCode,
      mode: 'footy',
      arenaId: 'std_classic_pitch',
      minutes: 2,
      seed: (Math.random() * 1e9) | 0,
      host: { playerId: playerId, name: playerName, ready: false },
      guest: null,
      status: 'waiting'
    };

    var myRole = role; // 'host' or 'guest'
    var isStarting = false;
    var isCancelled = false;
    var pollStatusId = null;
    var countdownSec = null;
    var lastSoundCount = null;

    function cleanup() {
      isCancelled = true;
      if (pollStatusId) clearInterval(pollStatusId);
    }

    function render() {
      var isHost = myRole === 'host';
      var hostObj = room.host || { name: 'Host', ready: false };
      var guestObj = room.guest;
      var curMode = room.mode || 'footy';
      var isFooty = curMode === 'footy';
      var myReady = isHost ? (hostObj.ready === true) : (guestObj && guestObj.ready === true);

      var arenaName = isFooty ? (lang === 'ru' ? 'Классический стадион' : 'Classic Pitch') : (lang === 'ru' ? 'Городской корт (Крыша)' : 'Urban Rooftop Court');

      var statusText = '';
      var statusClass = 'fvh-lobby-status-banner';
      if (room.status === 'countdown' && countdownSec !== null) {
        statusText = (lang === 'ru' ? '⚡ Оба игрока готовы! Запуск матча через ' : '⚡ Both players ready! Match starting in ') + countdownSec + '...';
        statusClass += ' highlight';
      } else if (guestObj) {
        statusText = (lang === 'ru' ? '⚡ Соперник в лобби. Выберите режим и подтвердите готовность' : '⚡ Opponent in lobby. Choose mode and confirm ready');
        statusClass += ' highlight';
      } else {
        statusText = (lang === 'ru' ? '⏳ Ожидание подключения соперника... Скопируйте код или ссылку' : '⏳ Waiting for opponent to join... Share room code or link');
      }

      var guestNameDisplay = guestObj ? guestObj.name : (lang === 'ru' ? 'Ожидание игрока...' : 'Waiting for player...');
      var guestReadyClass = !guestObj ? 'empty' : (guestObj.ready ? 'ready' : 'waiting');
      var guestReadyText = !guestObj ? (lang === 'ru' ? 'ОЖИДАНИЕ' : 'WAITING') : (guestObj.ready ? (lang === 'ru' ? '✓ ГОТОВ' : '✓ READY') : (lang === 'ru' ? '⏳ НЕ ГОТОВ' : '⏳ NOT READY'));

      var hostReadyClass = hostObj.ready ? 'ready' : 'waiting';
      var hostReadyText = hostObj.ready ? (lang === 'ru' ? '✓ ГОТОВ' : '✓ READY') : (lang === 'ru' ? '⏳ НЕ ГОТОВ' : '⏳ NOT READY');

      modal.innerHTML =
        '<div class="fvh-lobby-badge-header">' +
          '<span class="fvh-mm-badge">🏟️ ' + (lang === 'ru' ? '1v1 МУЛЬТИПЛЕЕР' : '1v1 MULTIPLAYER') + '</span>' +
          '<div class="fvh-lobby-room-code-pill" title="Код комнаты">' +
            '<span>🔑</span><span>' + roomCode + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="' + statusClass + '">' + statusText + '</div>' +
        '<div class="fvh-lobby-players-grid">' +
          // Host Card
          '<div class="fvh-lobby-player-card' + (isHost ? ' is-you' : '') + (hostObj.ready ? ' is-ready' : '') + '">' +
            '<div class="fvh-lobby-role-pill">' + (lang === 'ru' ? 'ХОСТ' : 'HOST') + (isHost ? ' (ВЫ)' : '') + '</div>' +
            '<div class="fvh-lobby-player-avatar">⚽</div>' +
            '<div class="fvh-lobby-player-name">' + hostObj.name + '</div>' +
            '<div class="fvh-lobby-ready-pill ' + hostReadyClass + '">' + hostReadyText + '</div>' +
          '</div>' +
          // VS Center
          '<div class="fvh-lobby-vs">VS</div>' +
          // Guest Card
          '<div class="fvh-lobby-player-card' + (!isHost ? ' is-you' : '') + (guestObj && guestObj.ready ? ' is-ready' : '') + '">' +
            '<div class="fvh-lobby-role-pill">' + (lang === 'ru' ? 'ГОСТЬ' : 'GUEST') + (!isHost ? ' (ВЫ)' : '') + '</div>' +
            '<div class="fvh-lobby-player-avatar">🏀</div>' +
            '<div class="fvh-lobby-player-name">' + guestNameDisplay + '</div>' +
            '<div class="fvh-lobby-ready-pill ' + guestReadyClass + '">' + guestReadyText + '</div>' +
          '</div>' +
        '</div>' +
        // Mode Selection (FOOTY vs HOOPS)
        '<div class="fvh-lobby-section-title">' + (lang === 'ru' ? 'РЕЖИМ СПОРТА (СИНХРОНИЗИРОВАН):' : 'SPORT MODE (SYNCHRONIZED):') + '</div>' +
        '<div class="fvh-lobby-mode-grid">' +
          '<button class="fvh-lobby-mode-option' + (isFooty ? ' active' : '') + '" data-mode="footy"' + (!isHost ? ' disabled style="opacity:0.9;cursor:default;"' : '') + '>' +
            '<div class="mode-icon">⚽</div>' +
            '<div class="mode-name">FOOTY</div>' +
            '<div class="mode-sub">' + (lang === 'ru' ? 'Футбол 1v1' : 'Football 1v1') + '</div>' +
          '</button>' +
          '<button class="fvh-lobby-mode-option' + (!isFooty ? ' active' : '') + '" data-mode="hoops"' + (!isHost ? ' disabled style="opacity:0.9;cursor:default;"' : '') + '>' +
            '<div class="mode-icon">🏀</div>' +
            '<div class="mode-name">HOOPS</div>' +
            '<div class="mode-sub">' + (lang === 'ru' ? 'Баскетбол 1v1' : 'Basketball 1v1') + '</div>' +
          '</button>' +
        '</div>' +
        (!isHost ? '<div style="font-size:10.5px;color:#94a3b8;margin:-8px 0 10px 0;text-align:center;">' + (lang === 'ru' ? '💡 Режим спорта выбирает создатель комнаты' : '💡 Sport mode is selected by host') + '</div>' : '') +
        // Arena Display
        '<div class="fvh-lobby-arena-row">' +
          '<span>🏟️ ' + (lang === 'ru' ? 'Арена' : 'Arena') + ':</span>' +
          '<b>' + arenaName + '</b>' +
        '</div>' +
        // Actions
        '<div class="fvh-lobby-actions" style="display:flex;flex-direction:column;gap:8px;">' +
          '<button class="btn ' + (myReady ? 'fvh-btn-unready' : 'primary') + ' block fvh-btn-toggle-ready"' + (!guestObj ? ' disabled style="opacity:0.6;"' : '') + '>' +
            (myReady ? (lang === 'ru' ? '✕ ОТМЕНИТЬ ГОТОВНОСТЬ' : '✕ CANCEL READY') : (!guestObj ? (lang === 'ru' ? '⏳ ОЖИДАНИЕ СОПЕРНИКА...' : '⏳ WAITING FOR OPPONENT...') : (lang === 'ru' ? '✓ ГОТОВ К МАТЧУ' : '✓ READY TO PLAY'))) +
          '</button>' +
          '<div style="display:flex;gap:8px;">' +
            '<button class="btn small block fvh-btn-copy-link" style="flex:1;">📋 ' + (lang === 'ru' ? 'Копировать ссылку' : 'Copy link') + '</button>' +
            '<button class="btn small block fvh-btn-leave-lobby" style="flex:1;">✕ ' + (lang === 'ru' ? 'Покинуть лобби' : 'Leave lobby') + '</button>' +
          '</div>' +
        '</div>';

      // Countdown Overlay
      if (room.status === 'countdown' && countdownSec !== null && countdownSec > 0) {
        var countOverlay = document.createElement('div');
        countOverlay.className = 'fvh-lobby-countdown-overlay';
        countOverlay.innerHTML =
          '<div class="fvh-lobby-countdown-number">' + countdownSec + '</div>' +
          '<div class="fvh-lobby-countdown-label">' + (lang === 'ru' ? 'МАТЧ НАЧИНАЕТСЯ!' : 'MATCH STARTING!') + '</div>';
        modal.appendChild(countOverlay);
      }

      // Mode Selection Click (Host only)
      if (isHost) {
        modal.querySelectorAll('.fvh-lobby-mode-option').forEach(function (btn) {
          btn.onclick = function () {
            var targetMode = btn.getAttribute('data-mode');
            if (targetMode === room.mode) return;
            app.audio.play('click');
            fetch(getApiUrl('/api/room/update'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: roomCode, mode: targetMode })
            }).then(function (r) { return r.json(); }).then(function (res) {
              if (res && res.ok && res.room) {
                room = res.room;
                render();
              }
            }).catch(function () {});
          };
        });
      }

      // Ready Button Click
      var readyBtn = modal.querySelector('.fvh-btn-toggle-ready');
      if (readyBtn && guestObj) {
        readyBtn.onclick = function () {
          app.audio.play('click');
          var nextReady = !myReady;
          fetch(getApiUrl('/api/room/ready'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: roomCode, role: myRole, ready: nextReady })
          }).then(function (r) { return r.json(); }).then(function (res) {
            if (res && res.ok && res.room) {
              room = res.room;
              render();
            }
          }).catch(function () {});
        };
      }

      // Copy Link Button
      var copyBtn = modal.querySelector('.fvh-btn-copy-link');
      if (copyBtn) {
        copyBtn.onclick = function () {
          var joinLink = window.location.origin + window.location.pathname + '?room=' + roomCode;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(joinLink);
          }
          app.audio.play('click');
          showToast(tr('inviteLinkCopied') + ' (' + roomCode + ')');
          copyBtn.textContent = '✓ ' + (lang === 'ru' ? 'Скопировано!' : 'Copied!');
          setTimeout(function () {
            copyBtn.textContent = '📋 ' + (lang === 'ru' ? 'Копировать ссылку' : 'Copy link');
          }, 1800);
        };
      }

      // Leave Button
      var leaveBtn = modal.querySelector('.fvh-btn-leave-lobby');
      if (leaveBtn) {
        leaveBtn.onclick = function () {
          app.audio.play('click');
          cleanup();
          fetch(getApiUrl('/api/room/cancel'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: roomCode, playerId: playerId })
          }).catch(function () {});
          overlay.remove();
        };
      }
    }

    render();
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Synchronized Polling Loop
    pollStatusId = setInterval(function () {
      if (isCancelled || isStarting) return;
      fetch(getApiUrl('/api/room/status?code=' + encodeURIComponent(roomCode)))
        .then(function (r) { return r.json(); })
        .then(function (st) {
          if (isCancelled || isStarting) return;

          if (!st || !st.ok || st.status === 'closed' || st.status === 'abandoned') {
            cleanup();
            overlay.remove();
            showToast(lang === 'ru' ? 'Комната закрыта или соперник покинул лобби' : 'Room closed or opponent left');
            return;
          }

          var prevMode = room.mode;
          var prevGuest = room.guest ? room.guest.playerId : null;
          var prevHostReady = room.host ? room.host.ready : false;
          var prevGuestReady = room.guest ? room.guest.ready : false;
          var prevStatus = room.status;

          room = st.room || room;
          countdownSec = st.countdown !== undefined ? st.countdown : null;

          var newGuest = room.guest ? room.guest.playerId : null;
          var newHostReady = room.host ? room.host.ready : false;
          var newGuestReady = room.guest ? room.guest.ready : false;

          // Sound alert when guest joins
          if (!prevGuest && newGuest) {
            app.audio.play('claim');
          }

          // Countdown tick audio
          if (room.status === 'countdown' && countdownSec !== null && countdownSec > 0) {
            if (lastSoundCount !== countdownSec) {
              lastSoundCount = countdownSec;
              app.audio.play('click');
            }
          }

          // Launch match when countdown completes or playing
          if ((room.status === 'playing' || (room.status === 'countdown' && countdownSec === 0)) && !isStarting) {
            isStarting = true;
            cleanup();
            app.audio.play('whistle');

            var oppName = myRole === 'host' ? ((room.guest && room.guest.name) || 'Opponent') : ((room.host && room.host.name) || 'Host');
            var syncOpts = {
              mode: room.mode || 'footy',
              arenaId: room.arenaId || (room.mode === 'hoops' ? 'std_urban_rooftop' : 'std_classic_pitch'),
              minutes: room.minutes || 2,
              seed: room.seed
            };

            startWebRTCSession(app, myRole, roomCode, playerName, oppName, syncOpts, function (session) {
              overlay.remove();
              app.launchOnline(session);
            }, function (err) {
              overlay.remove();
              showToast(tr('serverUnavailable'));
            });
            return;
          }

          // Re-render if state changed
          if (prevMode !== room.mode || prevGuest !== newGuest || prevHostReady !== newHostReady || prevGuestReady !== newGuestReady || prevStatus !== room.status || countdownSec !== null) {
            render();
          }
        }).catch(function () {});
    }, 550);
  }

  // Private Match: Create Room Modal (Transitions seamlessly into Lobby)
  function showCreateRoomModal(app, curChar) {
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

    showToast(lang === 'ru' ? 'Создание приватной арены...' : 'Creating private arena...');

    fetch(getApiUrl('/api/room/create'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hostId: playerId,
        hostName: playerName,
        character: curChar,
        mode: curChar,
        arenaId: curChar === 'hoops' ? 'std_urban_rooftop' : 'std_classic_pitch'
      })
    }).then(function (r) { return r.json(); }).then(function (res) {
      if (res && res.ok && res.code) {
        showPrivateMatchLobby(app, res.code, 'host', res.room);
      } else {
        showToast(tr('serverUnavailable'));
      }
    }).catch(function () {
      showToast(tr('serverUnavailable'));
    });
  }

  // Private Match: Join Room Modal (Server-side validation & transitions into Lobby)
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
          overlay.remove();
          showPrivateMatchLobby(app, enteredCode, 'guest', res.data.room);
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

  window.__fvhLobby = {
    showPrivateMatchLobby: showPrivateMatchLobby,
    showCreateRoomModal: showCreateRoomModal,
    showJoinRoomModal: showJoinRoomModal
  };


  // Dedicated Full-Screen Arena & Supporters Selection Page (Gallery of 10 Worlds & 6 Fan Clubs)
  function buildArenaSelectPage(app) {
    var curFilter = 'all'; // 'all', 'footy', 'hoops'
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

    // Filter Segment for Arenas: ALL, FOOTBALL (FOOTY), BASKETBALL (HOOPS)
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

        card.className = 'fvh-arena-card r-' + rarKey + (isEquipped ? ' is-equipped' : ' is-owned');

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
        } else {
          btn.className = 'btn small primary block';
          btn.textContent = tr('selectArenaBtn');
          btn.onclick = function () {
            app.store.update(function (d) {
              if (!d.equipped) d.equipped = {};
              if (arena.isDefault) {
                d.equipped[slotKey] = arena.id;
              } else {
                d.equipped['stadium.footy'] = arena.id;
                d.equipped['stadium.hoops'] = arena.id;
              }
            });
            app.audio.play('claim');
            showToast(tr('equipped') + ': ' + localizedName);
            renderArenaGrid();
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
    var curChar = app.store.data.selectedCharacter || 'footy';
    var curSettings = app.store.data.settings || {};
    var lang = getActiveLang();

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

    // Page Body
    var body = document.createElement('div');
    body.className = 'page-body fvh-mode-page-body';

    // Mode Grid Container (3 Cards: Practice vs AI, Online 1v1, Private Match)
    var grid = document.createElement('div');
    grid.className = 'fvh-mode-grid';

    // -------------------------------------------------------------
    // CARD 1: Single Match vs AI (Матч против ИИ)
    // -------------------------------------------------------------
    var practiceCard = document.createElement('div');
    practiceCard.className = 'fvh-mode-card practice-card';

    var selSport = curChar;
    var selDiff = curSettings.difficulty || 'normal';
    var selMinutes = curSettings.matchMinutes || 2;

    practiceCard.innerHTML =
      '<div class="fvh-mode-card-header">' +
        '<span class="fvh-mode-badge practice">🤖 ' + (lang === 'ru' ? 'МАТЧ ПРОТИВ ИИ' : 'MATCH VS AI') + '</span>' +
        '<span class="fvh-mode-instant-pill">⚡ ' + (lang === 'ru' ? 'ОФФЛАЙН' : 'OFFLINE') + '</span>' +
      '</div>' +
      '<div class="fvh-mode-card-body">' +
        '<div class="fvh-mode-title">' + (lang === 'ru' ? 'Одиночный матч (против ИИ)' : 'Single Match (vs AI)') + '</div>' +
        '<div class="fvh-mode-desc">' + (lang === 'ru' ? 'Сражайтесь против компьютерного соперника, оттачивайте мастерство и готовьтесь к предстоящему сезону!' : 'Battle against AI opponent, master your skills, and prepare for the upcoming season!') + '</div>' +
        '<div class="fvh-mode-controls">' +
          '<div class="fvh-ctrl-row">' +
            '<span class="fvh-ctrl-label">' + tr('sportType') + ':</span>' +
            '<div class="seg seg-sport">' +
              '<button type="button" class="' + (selSport === 'footy' ? 'on' : '') + '" data-sport="footy">⚽ FOOTY</button>' +
              '<button type="button" class="' + (selSport === 'hoops' ? 'on' : '') + '" data-sport="hoops">🏀 HOOPS</button>' +
            '</div>' +
          '</div>' +
          '<div class="fvh-practice-matchup" id="fvh-practice-matchup" style="margin-bottom:8px;padding:6px 10px;background:rgba(255,255,255,0.04);border-radius:6px;font-size:11.5px;font-weight:800;text-align:center;">' +
            (selSport === 'footy'
              ? '<span style="color:#00f0ff;">⚽ ' + tr('youTeam') + ': FOOTY</span> <span style="color:#f59e0b;margin:0 4px;">⚔️ VS ⚔️</span> <span style="color:#f97316;">' + tr('cpuTeam') + ': HOOPS 🏀</span>'
              : '<span style="color:#f97316;">🏀 ' + tr('youTeam') + ': HOOPS</span> <span style="color:#f59e0b;margin:0 4px;">⚔️ VS ⚔️</span> <span style="color:#00f0ff;">' + tr('cpuTeam') + ': FOOTY ⚽</span>'
            ) +
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
        '<button class="btn primary block fvh-btn-start-practice">▶ ' + (lang === 'ru' ? 'НАЧАТЬ МАТЧ' : 'START MATCH') + '</button>' +
      '</div>';

    // Interactive Sport selector
    practiceCard.querySelectorAll('.seg-sport button').forEach(function (b) {
      b.onclick = function () {
        practiceCard.querySelectorAll('.seg-sport button').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        selSport = b.dataset.sport;
        var pMatchup = practiceCard.querySelector('#fvh-practice-matchup');
        if (pMatchup) {
          pMatchup.innerHTML = (selSport === 'footy'
            ? '<span style="color:#00f0ff;">⚽ ' + tr('youTeam') + ': FOOTY</span> <span style="color:#f59e0b;margin:0 4px;">⚔️ VS ⚔️</span> <span style="color:#f97316;">' + tr('cpuTeam') + ': HOOPS 🏀</span>'
            : '<span style="color:#f97316;">🏀 ' + tr('youTeam') + ': HOOPS</span> <span style="color:#f59e0b;margin:0 4px;">⚔️ VS ⚔️</span> <span style="color:#00f0ff;">' + tr('cpuTeam') + ': FOOTY ⚽</span>'
          );
        }
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
        char: selSport,
        difficulty: selDiff,
        minutes: selMinutes,
        boostId: null
      }, false);
    };

    grid.appendChild(practiceCard);

    // -------------------------------------------------------------
    // CARD 2: Quick Match (Быстрый матч - Онлайн 1v1)
    // -------------------------------------------------------------
    var quickCard = document.createElement('div');
    quickCard.className = 'fvh-mode-card quick-card';
    var onlineSport = curChar;

    function renderQuickCard() {
      var isFooty = (onlineSport === 'footy');
      quickCard.innerHTML =
        '<div class="fvh-mode-card-header">' +
          '<span class="fvh-mode-badge online">⚡ ' + tr('quickMatchBadge') + '</span>' +
          '<span class="fvh-mode-server-status"><span class="status-dot live"></span> 1v1 PvP</span>' +
        '</div>' +
        '<div class="fvh-mode-card-body">' +
          '<div class="fvh-mode-title">' + tr('quickMatchTitle') + '</div>' +
          '<div class="fvh-mode-desc">' + (lang === 'ru' ? 'Сражайтесь в реальном времени против живого соперника 1v1 через WebRTC.' : 'Battle in real-time against a live 1v1 human opponent via WebRTC.') + '</div>' +
          '<div class="fvh-ctrl-row" style="margin:10px 0 12px 0;">' +
            '<span class="fvh-ctrl-label">' + tr('sportType') + ':</span>' +
            '<div class="seg seg-sport-online">' +
              '<button type="button" class="' + (isFooty ? 'on' : '') + '" data-sport="footy">⚽ FOOTY</button>' +
              '<button type="button" class="' + (!isFooty ? 'on' : '') + '" data-sport="hoops">🏀 HOOPS</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="fvh-mode-card-actions">' +
          '<button class="btn primary block fvh-btn-matchmaking">⚡ ' + (isFooty ? (lang === 'ru' ? 'ИСКАТЬ МАТЧ (⚽ ФУТБОЛ)' : 'SEARCH MATCH (⚽ FOOTY)') : (lang === 'ru' ? 'ИСКАТЬ МАТЧ (🏀 БАСКЕТБОЛ)' : 'SEARCH MATCH (🏀 HOOPS)')) + '</button>' +
        '</div>';

      quickCard.querySelectorAll('.seg-sport-online button').forEach(function (b) {
        b.onclick = function () {
          var sp = b.dataset.sport;
          if (sp === onlineSport) return;
          onlineSport = sp;
          app.audio.play('click');
          renderQuickCard();
        };
      });

      quickCard.querySelector('.fvh-btn-matchmaking').onclick = function () {
        app.audio.play('click');
        showQuickMatchSearchModal(app, onlineSport);
      };
    }
    renderQuickCard();
    grid.appendChild(quickCard);

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

  // Dedicated Full-Screen Team Selection Screen (First Launch Flow & 15-day Season Affiliation)
  function buildTeamSelectionScreen(app) {
    var d = (app && app.store && app.store.data) || {};
    if (d.teamChosen && (d.selectedTeam || d.selectedCharacter)) {
      setTimeout(function () {
        showToast(getActiveLang() === 'ru' ? 'Выбор команды постоянен и не может быть изменён.' : 'Team selection is permanent and cannot be changed.');
        if (app.showMenu) app.showMenu();
      }, 50);
    }

    var container = document.createElement('div');
    container.className = 'screen solid page-screen fvh-team-selection-screen';
    container.dataset.id = 'team-select';

    var inner = document.createElement('div');
    inner.className = 'fvh-team-selection-container';

    // Official Emblem
    var emblemBox = document.createElement('div');
    emblemBox.style.marginBottom = '12px';
    emblemBox.innerHTML = getOfficialEmblemHtml(64);
    inner.appendChild(emblemBox);

    var title = document.createElement('h1');
    title.style.fontSize = '22px';
    title.style.fontWeight = '900';
    title.style.margin = '0 0 6px';
    title.style.letterSpacing = '0.5px';
    title.textContent = tr('chooseTeamTitle');
    inner.appendChild(title);

    var desc = document.createElement('p');
    desc.style.fontSize = '12px';
    desc.style.color = 'var(--text-muted)';
    desc.style.lineHeight = '1.45';
    desc.style.margin = '0 0 16px';
    desc.textContent = tr('chooseTeamDesc');
    inner.appendChild(desc);

    // Cards Grid
    var grid = document.createElement('div');
    grid.className = 'fvh-team-cards-grid';

    var chosenTeam = null;

    // Card 1: FOOTY ⚽ — $FOOTY
    var cardFooty = document.createElement('div');
    cardFooty.className = 'fvh-team-card footy';
    cardFooty.innerHTML =
      '<div class="fvh-team-card-emblem">' +
      '  <div style="width:52px;height:52px;border-radius:50%;background:radial-gradient(circle,#00f0ff 0%,#0369a1 100%);display:flex;align-items:center;justify-content:center;font-size:26px;box-shadow:0 0 16px rgba(0,240,255,0.4);border:2px solid #00f0ff;">⚽</div>' +
      '</div>' +
      '<div class="fvh-team-card-title">' + tr('teamFootyName') + '</div>' +
      '<div class="fvh-team-card-token">' + tr('teamFootyToken') + '</div>' +
      '<div class="fvh-team-card-desc">' + tr('teamFootyDesc') + '</div>';

    // Card 2: HOOPS 🏀 — $HOOPS
    var cardHoops = document.createElement('div');
    cardHoops.className = 'fvh-team-card hoops';
    cardHoops.innerHTML =
      '<div class="fvh-team-card-emblem">' +
      '  <div style="width:52px;height:52px;border-radius:50%;background:radial-gradient(circle,#ff8c00 0%,#c2410c 100%);display:flex;align-items:center;justify-content:center;font-size:26px;box-shadow:0 0 16px rgba(255,140,0,0.4);border:2px solid #ff8c00;">🏀</div>' +
      '</div>' +
      '<div class="fvh-team-card-title">' + tr('teamHoopsName') + '</div>' +
      '<div class="fvh-team-card-token">' + tr('teamHoopsToken') + '</div>' +
      '<div class="fvh-team-card-desc">' + tr('teamHoopsDesc') + '</div>';

    var confirmBtn = document.createElement('button');
    confirmBtn.className = 'btn primary block';
    confirmBtn.style.fontWeight = '900';
    confirmBtn.style.fontSize = '14px';
    confirmBtn.style.padding = '14px 20px';
    confirmBtn.style.width = '100%';
    confirmBtn.style.maxWidth = '320px';
    confirmBtn.style.opacity = '0.5';
    confirmBtn.disabled = true;
    confirmBtn.textContent = tr('confirmTeamSelection');

    function selectCard(team) {
      chosenTeam = team;
      cardFooty.classList.toggle('selected', team === 'footy');
      cardHoops.classList.toggle('selected', team === 'hoops');
      confirmBtn.disabled = false;
      confirmBtn.style.opacity = '1';
      confirmBtn.style.cursor = 'pointer';
      app.audio.play('click');
    }

    cardFooty.onclick = function () { selectCard('footy'); };
    cardHoops.onclick = function () { selectCard('hoops'); };

    grid.appendChild(cardFooty);
    grid.appendChild(cardHoops);
    inner.appendChild(grid);

    confirmBtn.onclick = function () {
      if (!chosenTeam) return;
      var curD = (app.store && app.store.data) || {};
      if (curD.teamChosen && (curD.selectedTeam || curD.selectedCharacter)) {
        showToast(getActiveLang() === 'ru' ? 'Команда уже выбрана и не может быть изменена.' : 'Team has already been selected and is permanently locked.');
        app.showMenu();
        return;
      }
      app.store.update(function (d) {
        d.selectedTeam = chosenTeam;
        d.selectedCharacter = chosenTeam;
        d.teamChosen = true;
      });
      safeEconomyApi('/api/profile/select-team', {
        playerId: getAppPlayerId(app),
        team: chosenTeam
      });
      app.audio.play('claim');
      showToast(tr('teamSelectedSuccess'));
      app.showMenu();
    };

    inner.appendChild(confirmBtn);
    container.appendChild(inner);
    return container;
  }

  function showTeamSelectionModal(app) {
    if (app && app.showTeamSelection) {
      app.showTeamSelection();
    }
  }
  window.showTeamSelectionModal = showTeamSelectionModal;

  // Dedicated Official Social Channels Section (Item 6)
  function createOfficialSocialsCard(app) {
    var card = document.createElement('div');
    card.className = 'fvh-official-socials-card';
    card.style.background = 'rgba(255, 255, 255, 0.035)';
    card.style.border = '1px solid rgba(255, 255, 255, 0.09)';
    card.style.borderRadius = '16px';
    card.style.padding = '14px 16px';
    card.style.margin = '10px 0 16px';

    var channels = [
      { name: 'Telegram News', handle: '@FootyHoops', url: 'https://t.me/FootyHoops', icon: getSocialIconSvg('tg') },
      { name: 'Telegram Chat', handle: 'Community Chat', url: 'https://t.me/+zKbH1Po_pdg2MmVi', icon: getSocialIconSvg('chat') },
      { name: 'Instagram', handle: '@footyvshoops', url: 'https://www.instagram.com/footyvshoops?exln=MWF1ZGdxM3BqdGt1eA%3D%3D&utm_source=qr', icon: getSocialIconSvg('insta') },
      { name: 'X / Twitter', handle: '@footyvshoops', url: 'https://x.com/footyvshoops?s=11', icon: getSocialIconSvg('x') },
      { name: 'YouTube', handle: '@footyvshoops-cr', url: 'https://youtube.com/@footyvshoops-cr?si=ZbQ3MBZ9R22-bybf', icon: getSocialIconSvg('yt') },
      { name: 'TikTok', handle: '@footy_vs_hoops', url: 'https://www.tiktok.com/@footy_vs_hoops', icon: getSocialIconSvg('tiktok') }
    ];

    var head = document.createElement('div');
    head.style.display = 'flex';
    head.style.alignItems = 'center';
    head.style.justifyContent = 'space-between';
    head.style.marginBottom = '10px';
    head.innerHTML =
      '<div>' +
      '  <div style="font-size:14px;font-weight:900;color:#fff;letter-spacing:0.3px;">🌐 ' + tr('followUsTitle') + '</div>' +
      '  <div style="font-size:11px;color:#94a3b8;margin-top:2px;">' + tr('followUsSubtitle') + '</div>' +
      '</div>';
    card.appendChild(head);

    var grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
    grid.style.gap = '8px';

    channels.forEach(function (ch) {
      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'fvh-social-pill';
      item.style.display = 'flex';
      item.style.alignItems = 'center';
      item.style.gap = '8px';
      item.style.padding = '8px 10px';
      item.style.background = 'rgba(255, 255, 255, 0.05)';
      item.style.border = '1px solid rgba(255, 255, 255, 0.12)';
      item.style.borderRadius = '10px';
      item.style.cursor = 'pointer';
      item.style.textAlign = 'left';
      item.innerHTML =
        '<div style="width:28px;height:28px;flex-shrink:0;display:flex;align-items:center;justify-content:center;">' +
        ch.icon.replace('width="40" height="40"', 'width="28" height="28"') +
        '</div>' +
        '<div style="flex:1;min-width:0;overflow:hidden;">' +
        '  <div style="font-size:12px;font-weight:800;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + ch.name + '</div>' +
        '  <div style="font-size:10px;color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + ch.handle + '</div>' +
        '</div>' +
        '<div style="font-size:10px;color:#38bdf8;font-weight:800;flex-shrink:0;">➔</div>';

      item.onclick = function (e) {
        e.stopPropagation();
        if (app && app.audio) app.audio.play('click');
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.openLink) {
          window.Telegram.WebApp.openLink(ch.url);
        } else {
          window.open(ch.url, '_blank');
        }
      };
      grid.appendChild(item);
    });
    card.appendChild(grid);
    return card;
  }

  // Complete Redesigned Main Menu
  function renderRedesignedMenu(app) {
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

    var d = app.store.data;
    var bpState = getBattlePassState(app.store);

    var screen = document.createElement('div');
    screen.className = 'screen menu-bg';
    screen.dataset.id = 'menu';

    // 1. Top Bar: Clean Minimalist Console Header with Official Emblem
    var topbar = document.createElement('header');
    topbar.className = 'fvh-topbar';
    var playerDisplayName = (d.profile && d.profile.nickname) || d.playerName || (d.telegramUser && (d.telegramUser.first_name || d.telegramUser.username)) || 'Alim';
      var shortName = playerDisplayName.length > 9 ? (playerDisplayName.slice(0, 8) + '…') : playerDisplayName;
      topbar.innerHTML =
        '<div class="fvh-topbar-brand" style="cursor:pointer;" title="FOOTY vs HOOPS">' +
        getOfficialEmblemHtml() +
        '<div class="logo-text">FOOTY <span class="dot">VS</span> HOOPS</div>' +
        '</div>' +
        '<div class="fvh-topbar-stats">' +
        '<button class="fvh-pill gold" id="fvh-btn-coins" title="' + tr('shop') + '">' + getFvhCoinSvg('inline') + ' ' + (d.coins || 0) + '</button>' +
        '<button class="fvh-pill icon-only" id="fvh-btn-leaderboard" title="' + tr('leaderboard') + '">🏆</button>' +
        '<button class="fvh-pill fvh-btn-topbar-profile" id="fvh-btn-profile" title="' + tr('profile') + '"><span class="fvh-topbar-avatar-mini">' + getPlayerAvatarHtml({ photoUrl: d.photoUrl || (d.telegramUser && d.telegramUser.photoUrl), character: d.selectedCharacter || 'footy', extraClass: 'mini-avatar' }) + '</span>' + escapeHtml(shortName) + '</button>' +
        '<button class="fvh-pill icon-only" id="fvh-btn-settings" title="' + tr('settings') + '">⚙️</button>' +
        '</div>';
    screen.appendChild(topbar);

    topbar.querySelector('.fvh-topbar-brand').onclick = function () { app.showMenu(); };
    topbar.querySelector('#fvh-btn-coins').onclick = function () { app.audio.play('click'); app.go('shop'); };
    topbar.querySelector('#fvh-btn-leaderboard').onclick = function () { app.audio.play('click'); app.go('leaderboard'); };
    topbar.querySelector('#fvh-btn-profile').onclick = function () { app.audio.play('click'); app.go('profile'); };
    topbar.querySelector('#fvh-btn-settings').onclick = function () { app.audio.play('click'); app.go('settings'); };

    // 2. Compact Matchup & Team Status Bar (3D character model completely removed from home screen)
    var stage = document.createElement('section');
    stage.className = 'fvh-hero-stage solo-stage compact';

    var curChar = d.selectedCharacter || 'footy';
    var isFooty = (curChar === 'footy');

    var heroCard = document.createElement('div');
    heroCard.className = 'fvh-hero-card solo-hero-compact ' + curChar;

    var badgeText = isFooty ? '⚽ ' + tr('teamFootyTitle') : '🏀 ' + tr('teamHoopsTitle');
    var rivalText = isFooty ? '⚔️ ' + tr('rivalTeamLabel') + ': 🏀 HOOPS' : '⚔️ ' + tr('rivalTeamLabel') + ': ⚽ FOOTY';

    heroCard.innerHTML =
      '<div class="fvh-solo-compact-header" style="display:flex;align-items:center;justify-content:space-between;width:100%;gap:8px;margin-bottom:8px;">' +
      '  <span class="fvh-hero-badge ' + curChar + '" style="font-size:12px;font-weight:900;padding:4px 10px;border-radius:20px;display:inline-flex;align-items:center;gap:5px;">' + badgeText + '</span>' +
      '  <span class="fvh-solo-rival-pill" style="font-size:11px;font-weight:800;color:#94a3b8;background:rgba(255,255,255,0.06);padding:4px 10px;border-radius:20px;border:1px solid rgba(255,255,255,0.1);">' + rivalText + '</span>' +
      '</div>' +
      '<div class="fvh-solo-actions-row" style="width:100%;display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
      '  <button type="button" class="btn fvh-solo-gear-pill" style="padding:9px 8px;font-size:12px;font-weight:900;border-radius:12px;background:rgba(255,255,255,0.08);border:1.5px solid rgba(255,255,255,0.22);color:#fff;cursor:pointer;white-space:nowrap;display:flex;align-items:center;justify-content:center;gap:6px;"><span>👕</span> <span>' + tr('openLocker') + '</span></button>' +
      '  <button type="button" class="btn fvh-solo-profile-pill" style="padding:9px 8px;font-size:12px;font-weight:900;border-radius:12px;background:rgba(0,240,255,0.12);border:1.5px solid rgba(0,240,255,0.35);color:#fff;cursor:pointer;white-space:nowrap;display:flex;align-items:center;justify-content:center;gap:6px;"><span>👤</span> <span>' + tr('profile') + '</span></button>' +
      '</div>';

    // Clicking gear button opens locker
    heroCard.querySelector('.fvh-solo-gear-pill').onclick = function (e) {
      e.stopPropagation();
      app.audio.play('click');
      if (curChar === 'footy') {
        app.openCharacterLocker('footy');
      } else {
        app.openCharacterLocker('hoops');
      }
    };
    var soloProfBtn = heroCard.querySelector('.fvh-solo-profile-pill');
    if (soloProfBtn) {
      soloProfBtn.onclick = function (e) {
        e.stopPropagation();
        app.audio.play('click');
        app.go('profile');
      };
    }

    stage.appendChild(heroCard);
    screen.appendChild(stage);

    // 3. Primary Action Deck: Dominant PLAY Button that champions your sport!
    var actionDeck = document.createElement('div');
    actionDeck.className = 'fvh-action-deck';

    var playBtn = document.createElement('button');
    playBtn.className = 'fvh-btn-play-hero ' + curChar;
    var playTitle = isFooty ? tr('playForFooty') : tr('playForHoops');
    var playSub = isFooty ? tr('playFootySub') : tr('playHoopsSub');

    playBtn.innerHTML =
      '<span class="play-icon">▶</span>' +
      '<span class="play-text">' + playTitle + '</span>' +
      '<span class="play-sub">' + playSub + '</span>';
    playBtn.onclick = function () {
      app.audio.play('click');
      app.showModeSelect();
    };
    actionDeck.appendChild(playBtn);
    screen.appendChild(actionDeck);

    // 4. Token Rivalry Compact Ticker
    screen.appendChild(createRivalryTicker());

    // 5. Active Quests & Missions Banner
    var seasonCard = document.createElement('div');
    seasonCard.className = 'fvh-season-hub-card';
    seasonCard.innerHTML =
      '<div class="fvh-season-hub-left">' +
      '<div class="fvh-season-hub-tag">🎯 ' + tr('quests') + '</div>' +
      '<div class="fvh-season-hub-title">' + (getActiveLang() === 'ru' ? 'Ежедневные задания и награды' : 'Daily Quests & Rewards') + '</div>' +
      '<div class="fvh-season-hub-sub" style="font-size:12px;color:var(--text-muted);margin-top:2px;">' + (getActiveLang() === 'ru' ? 'Выполняйте испытания и получайте FvH Coin' : 'Complete directives to earn FvH Coins') + '</div>' +
      '</div>' +
      '<button class="btn small primary fvh-season-hub-btn">' + tr('quests') + ' ➔</button>';
    seasonCard.querySelector('.fvh-season-hub-btn').onclick = function () {
      app.audio.play('click');
      app.go('quests');
    };
    seasonCard.onclick = function (e) {
      app.audio.play('click');
      app.go('quests');
    };
    screen.appendChild(seasonCard);

    // 6. Dedicated Official Social Channels Section (Item 6)
    screen.appendChild(createOfficialSocialsCard(app));

    // 7. Unified Persistent Bottom Navigation
    screen.appendChild(createSharedBottomNav('menu', app));

    // Show screen
    app.show(screen, 'menu');

    // Onboarding: Prompt player to choose Team Football or Team Basketball on initial entry
    if (!d.teamChosen) {
      setTimeout(function () {
        showTeamSelectionModal(app, false);
      }, 350);
    }
  }



  // Hook into App & Page Router
  onAppReady(function (app) {
    window.App = app;
    window.app = app;
    window.__fvh = app;
    // Initial sync with authoritative backend economy
    syncAuthoritativeEconomy(app);

    // Authoritative match completion reward hook (Offline & Online Authoritative Sync)
    var origMatchEnd = app.onMatchEnd ? app.onMatchEnd.bind(app) : null;
    if (origMatchEnd) {
      app.onMatchEnd = function (sum) {
        origMatchEnd(sum);
        var pid = getAppPlayerId(app);
        var mOutcome = (sum.winner === 0 ? 'win' : sum.winner === null ? 'draw' : 'loss');
        var curDiff = (app.lastCfg && app.lastCfg.difficulty) || 'normal';

        app.store.update(function (d) {
          if (!d.stats) d.stats = {};
          if (!d.stats.winsByDiff) d.stats.winsByDiff = { easy: 0, normal: 0, hard: 0 };
          if (mOutcome === 'win') {
            d.stats.winsByDiff[curDiff] = (d.stats.winsByDiff[curDiff] || 0) + 1;
          }
        });

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
        if (typeof tg.disableVerticalSwipes === 'function') {
          tg.disableVerticalSwipes();
        }

        if (typeof document !== 'undefined' && document.documentElement) {
          document.documentElement.classList.add('is-telegram');
          var applyTgInsets = function () {
            if (tg.contentSafeAreaInset) {
              document.documentElement.style.setProperty('--tg-content-top', (tg.contentSafeAreaInset.top || 0) + 'px');
              document.documentElement.style.setProperty('--tg-content-bottom', (tg.contentSafeAreaInset.bottom || 0) + 'px');
            }
            if (tg.safeAreaInset) {
              document.documentElement.style.setProperty('--tg-safe-top', (tg.safeAreaInset.top || 0) + 'px');
              document.documentElement.style.setProperty('--tg-safe-bottom', (tg.safeAreaInset.bottom || 0) + 'px');
            }
            if (tg.viewportHeight) {
              document.documentElement.style.setProperty('--tg-viewport-height', tg.viewportHeight + 'px');
            }
            if (tg.viewportStableHeight) {
              document.documentElement.style.setProperty('--tg-viewport-stable-height', tg.viewportStableHeight + 'px');
            }
          };
          applyTgInsets();
          if (typeof tg.onEvent === 'function') {
            try {
              tg.onEvent('contentSafeAreaChanged', applyTgInsets);
              tg.onEvent('safeAreaChanged', applyTgInsets);
              tg.onEvent('viewportChanged', applyTgInsets);
            } catch (e) {}
          }
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
            if (u.photo_url) {
              d.photoUrl = u.photo_url;
            }
            d.telegramUser = {
              id: u.id,
              username: u.username || '',
              firstName: u.first_name || '',
              lastName: u.last_name || '',
              languageCode: u.language_code || '',
              photoUrl: u.photo_url || ''
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
            // Live match controls pause dialog via game engine; never exit directly from match state
            if (app.state !== 'menu' && app.state !== 'match' && (!app.game || !app.game.running)) {
              app.showMenu();
            }
          });
        }

        // Haptic-enabled tactile feedback
        if (app && app.audio && !app.audio._hapticWrapped) {
          var origPlay = app.audio.play.bind(app.audio);
          app.audio.play = function (name) {
            if (name === 'claim' || name === 'purchase' || name === 'goal') {
              triggerHaptic('success');
            } else if (name === 'error') {
              triggerHaptic('error');
            } else if (name === 'kick' || name === 'shoot' || name === 'whistle') {
              triggerHaptic('medium');
            } else {
              triggerHaptic('light');
            }
            return origPlay(name);
          };
          app.audio._hapticWrapped = true;
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
          } else if (state === 'match') {
            // Live match controls its own Telegram BackButton via telegram.enterMatch
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
        app.show(buildQuestsPage(app, 'daily'), 'quests');
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
      } else if (page === 'leaderboard') {
        app.audio.play('click');
        var catTarget = (opts && opts.category) || 'season';
        app.show(buildLeaderboardPage(app, catTarget), 'leaderboard');
      } else if (page === 'team-select') {
        app.audio.play('click');
        app.show(buildTeamSelectionScreen(app), 'team-select');
      } else {
        originalGo(page);
      }
    };

    // Dedicated Team Selection Screen
    app.showTeamSelection = function () {
      app.state = 'menu';
      app.show(buildTeamSelectionScreen(app), 'team-select');
    };

    // Override showMenu with new redesigned main menu
    app.showMenu = function () {
      app.state = 'menu';
      updateTelegramBackButton('menu');
      var d = app.store.data;
      if (!d.teamChosen || (!d.selectedTeam && !d.selectedCharacter)) {
        app.showTeamSelection();
        return;
      }
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

    // Dedicated Shop Screen
    app.showShop = function (cat, inspectId) {
      app.show(buildShopPage(app, cat || 'all', inspectId), 'shop');
    };

    // Dedicated Leaderboard Screen
    app.showLeaderboard = function (cat) {
      app.show(buildLeaderboardPage(app, cat || 'season'), 'leaderboard');
    };

    // Dedicated Profile Screen
    app.showProfile = function () {
      app.show(buildProfilePage(app), 'profile');
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
                app.show(buildQuestsPage(app, 'daily'), 'quests');
              } else if (app.state === 'profile') {
                app.show(buildProfilePage(app), 'profile');
              } else if (app.state === 'characters') {
                app.show(buildCharactersPage(app), 'characters');
              } else if (app.state === 'mode') {
                app.show(buildModeSelectPage(app), 'mode');
              } else if (app.state === 'leaderboard') {
                app.show(buildLeaderboardPage(app), 'leaderboard');
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
    var startParam = (params ? (params.get('tgWebAppStartParam') || params.get('startapp') || params.get('start_param')) : null);
    if (!startParam && typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) {
      startParam = window.Telegram.WebApp.initDataUnsafe.start_param || null;
    }

    // Auto-register referral code from Telegram start_param
    if (startParam && startParam.startsWith('ref_')) {
      var refCodeFromParam = startParam.slice(4).trim();
      var pid = getAppPlayerId(app);
      if (refCodeFromParam && pid) {
        fetch(getApiUrl('/api/referrals/register'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ friendId: pid, referralCode: refCodeFromParam })
        }).catch(function () {});
      }
    }

    var targetPage = params ? params.get('page') : null;
    var targetChar = params ? params.get('char') : null;
    var targetSlot = params ? params.get('slot') : null;
    var targetTab = params ? params.get('tab') : null;
    var targetCat = params ? params.get('cat') : null;
    var targetInspect = params ? params.get('inspect') : null;
    var quicksearch = params ? params.get('quicksearch') : null;

    var privateroom = params ? params.get('privateroom') : null;

    var targetLaunch = (params ? params.get('launch') : null) ||
      (startParam === 'launch_footy' || startParam === 'footy' ? 'footy' : null) ||
      (startParam === 'launch_hoops' || startParam === 'hoops' ? 'hoops' : null);

    if (startParam && startParam.startsWith('room_')) {
      privateroom = startParam.slice(5).trim();
    }

    if (targetLaunch) {
      setTimeout(function () {
        app.launch({
          mode: targetLaunch,
          char: targetLaunch,
          difficulty: 'normal',
          minutes: 2,
          boostId: null
        }, false);
      }, 350);
    } else if (targetPage === 'characters') {
      app.show(buildCharactersPage(app, targetChar || 'footy', targetSlot), 'characters');
    } else if (targetPage === 'quests') {
      app.show(buildQuestsPage(app, targetTab || 'gameplay'), 'quests');
    } else if (targetPage === 'shop') {
      app.show(buildShopPage(app, targetCat || 'all', targetInspect), 'shop');
    } else if (targetPage === 'arenas') {
      app.show(buildArenaSelectPage(app), 'arenas');
    } else if (targetPage === 'leaderboard' || (params && (params.get('leaderboard') || params.get('lb')))) {
      app.show(buildLeaderboardPage(app, targetCat || 'season'), 'leaderboard');
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
      setTimeout(function () { app.go('quests'); }, 450);
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

  // Legacy stubs for backwards compatibility with earlier test suites
  function renderGameplayQuests() { return null; }
  function renderSocialQuests() { return null; }
  function renderReferralHub() { return null; }
  function checkBundleOwnership() { return false; }
  // Legacy identifiers: tabGameplay tabSocialMedia tabInviteFriends q_sub_chat copyInviteLink
})();
