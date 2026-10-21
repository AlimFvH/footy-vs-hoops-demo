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
      characters: 'WARDROBE',
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
      profileTgeSaveBtn: 'Сохранить публичный адрес',
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
    skin_neon_elite: { h: 185, s: 0.95, lMult: 1.05, darkShorts: true, name: 'Cyber Striker', ru: 'Кибер Страйкер' },
    skin_frost: { h: 200, s: 0.55, lMult: 1.35, darkShorts: false, name: 'Frost Giant', ru: 'Ледяной Титан' },
    skin_shadow: { h: 275, s: 0.70, lMult: 0.82, darkShorts: true, name: 'Shadow Ninja', ru: 'Теневой Ниндзя' },
    skin_solar: { h: 22, s: 0.95, lMult: 1.05, darkShorts: true, name: 'Solar Flare', ru: 'Стартовая: Огненная' },
    skin_gold: { h: 46, s: 0.95, lMult: 1.18, darkShorts: false, name: 'Golden Legend', ru: 'Золотая Легенда' },
    skin_cyber: { h: 300, s: 0.90, lMult: 1.05, darkShorts: true, name: 'Cyber Punk', ru: 'Киберпанк' },
    skin_sunset: { h: 28, s: 0.95, lMult: 1.1, darkShorts: false, name: 'Sunset Gold', ru: 'Закатное Золото' },
    skin_hydro: { h: 175, s: 0.88, lMult: 1.0, darkShorts: true, name: 'Hydro Striker', ru: 'Гидро Страйкер' },
    skin_mars: { h: 10, s: 0.90, lMult: 0.95, darkShorts: true, name: 'Mars Rover', ru: 'Марсианский Ровер' },
    skin_astronaut: { h: 215, s: 0.15, lMult: 1.3, darkShorts: true, name: 'Astronaut Kit', ru: 'Экипировка Астронавта' }
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
      '<div class="fvh-hero-active-jersey-tag" style="position:absolute;bottom:0px;font-size:10.5px;font-weight:800;color:' + (isFooty ? '#38bdf8' : '#fb923c') + ';background:rgba(8,16,36,0.85);backdrop-filter:blur(6px);border:1px solid ' + (isFooty ? 'rgba(56,189,248,0.3)' : 'rgba(251,146,60,0.3)') + ';border-radius:999px;padding:3px 12px;white-space:nowrap;display:inline-flex;align-items:center;gap:5px;box-shadow:0 4px 12px rgba(0,0,0,0.5);"><span>🎽</span> <span>' + skinLabel + '</span></div>'
      : '';

    return '<div class="fvh-hero-portrait-wrap" style="position:relative;display:flex;flex-direction:column;align-items:center;width:100%;height:100%;justify-content:center;">' +
      '<img class="fvh-hero-real-img fvh-hero-cutout-img" data-hero="' + charId + '" data-skin="' + skinId + '" src="' + imgSrc + '" alt="' + (isFooty ? 'FOOTY' : 'HOOPS') + '" onerror="this.style.display=\'none\'; if(this.nextElementSibling) this.nextElementSibling.style.display=\'block\';">' +
      '<div class="fvh-hero-svg-fallback" style="display:none;width:100%;height:100%;">' + svgFallback + '</div>' +
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

      if (id === 'ball_footy_plasma') {
        fStart = '#00f0ff'; fMid = '#0284c7'; fEnd = '#0f172a'; patch = '#10b981'; seamColor = '#00f0ff'; hasAura = true;
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

    // Auto-detect category from item ID if unspecified
    if (!cat && id) {
      if (id.startsWith('crowd_')) cat = 'crowd';
      else if (id.startsWith('boost_')) cat = 'boosts';
      else if (id.startsWith('skin_')) cat = 'skins';
      else if (id.startsWith('ball_')) cat = 'balls';
      else if (id.startsWith('std_') || id.startsWith('arena_')) cat = 'stadiums';
      else if (id.startsWith('cel_')) cat = 'celebrations';
      else if (id.startsWith('trail_')) cat = 'trails';
      else if (id.startsWith('frame_')) cat = 'frames';
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
      playerName: d.playerName || (d.telegramUser && (d.telegramUser.first_name || d.telegramUser.username)) || 'Athlete',
      stats: d.stats || {},
      selectedCharacter: d.selectedCharacter || 'footy',
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
          '      <div style="font-weight:900;font-size:14px;color:#fef08a;letter-spacing:0.5px;">' + tr('bpUnlockPremium') + ' · 250 ⭐</div>' +
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
        var freeIcon = '<div class="fvh-bp-level-reward-icon" style="cursor:pointer;height:52px;display:flex;align-items:center;justify-content:center;margin:4px 0;flex-shrink:0;">' + renderItemArtwork(lvlDef.freeReward, 'thumb') + '</div>';
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
        var vipIcon = '<div class="fvh-bp-level-reward-icon" style="cursor:pointer;height:52px;display:flex;align-items:center;justify-content:center;margin:4px 0;flex-shrink:0;">' + renderItemArtwork(lvlDef.premiumReward, 'thumb') + '</div>';
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

    // Auto-scroll to current active level or specific level from URL
    var urlParams = (typeof window !== 'undefined' && window.location) ? new URLSearchParams(window.location.search) : null;
    var targetLvl = urlParams ? parseInt(urlParams.get('lvl'), 10) : null;
    var activeLvl = (targetLvl && targetLvl >= 1 && targetLvl <= 30) ? targetLvl : Math.max(1, Math.min(30, (getBattlePassState(app.store).level || 1)));
    setTimeout(function () {
      var targetCol = scrollTrack.querySelector('.fvh-bp-dual-column:nth-child(' + activeLvl + ')');
      if (targetCol) {
        targetCol.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }, 150);

    // Persistent Unified Bottom Navigation
    container.appendChild(createSharedBottomNav('battlepass', app));

    return container;
  }

  // Boost Items Catalog (4 Distinct Boosts)
  var BOOST_CATALOG = [
    { id: 'boost_turbo', category: 'boosts', slot: 'boost', name: 'Turbo Boots', rarity: 'common', price: 60, icon: '👟', type: 'active', duration: '12s', descKey: 'boostTurboDesc' },
    { id: 'boost_lungs', category: 'boosts', slot: 'boost', name: 'Iron Lungs', rarity: 'common', price: 70, icon: '🫁', type: 'passive', duration: 'match', descKey: 'boostLungsDesc' },
    { id: 'boost_power', category: 'boosts', slot: 'boost', name: 'Sharp Shooter', rarity: 'rare', price: 110, icon: '🎯', type: 'passive', duration: 'match', descKey: 'boostPowerDesc' },
    { id: 'boost_coins', category: 'boosts', slot: 'boost', name: 'Coin Doubler', rarity: 'epic', price: 150, icon: '🪙', type: 'passive', duration: 'match', descKey: 'boostCoinsDesc' }
  ];
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
      { id: 'celebrations', label: tr('catCelebrations') },
      { id: 'boosts', label: tr('catBoosts') }
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

      avatarBox.innerHTML = getCharacterDisplayHtml(curChar, app.store.data.equipped && app.store.data.equipped.skin);
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

      var armedBoostId = app.store.data.armedBoost;
      var armedName = armedBoostId ? trItem(armedBoostId === 'boost_turbo' ? 'Turbo Boots' : armedBoostId === 'boost_lungs' ? 'Iron Lungs' : armedBoostId === 'boost_power' ? 'Sharp Shooter' : armedBoostId === 'boost_coins' ? 'Coin Doubler' : armedBoostId) : tr('noBoostEquipped');

      var activeCrowdId = eq.crowd || (curChar === 'hoops' ? 'crowd_hoops_allstars' : 'crowd_footy_ultras');
      var crowdObj = CROWD_CATALOG.find(function(c) { return c.id === activeCrowdId; });
      var crowdLabel = crowdObj ? (tr(crowdObj.nameKey) || crowdObj.name) : activeCrowdId;

      var curCharSkin = curChar === 'hoops'
        ? (eq['skin.hoops'] || (eq.skin && eq.skin !== 'skin_rookie' ? eq.skin : 'skin_solar'))
        : (eq['skin.footy'] || (eq.skin && eq.skin !== 'skin_solar' ? eq.skin : 'skin_rookie'));
      var activeBallId = eq['ball.' + curChar] || (curChar === 'hoops' ? 'ball_hoops_street' : 'ball_footy_classic');
      var activeArenaId = eq['stadium.' + curChar] || (curChar === 'hoops' ? 'std_hoops_street' : 'std_footy_classic');
      var activeCelId = eq.celebration || 'cel_confetti';

      equipSlotList.innerHTML =
        '<div class="fvh-equipped-slot"><span>' + tr('slotJersey') + ':</span><b>' + getItemLabelById(curCharSkin, tr('defaultSkin')) + '</b></div>' +
        '<div class="fvh-equipped-slot"><span>' + tr('slotBall') + ':</span><b>' + getItemLabelById(activeBallId, 'Classic Ball') + '</b></div>' +
        '<div class="fvh-equipped-slot"><span>' + tr('slotArena') + ':</span><b>' + getItemLabelById(activeArenaId, 'Standard Arena') + '</b></div>' +
        '<div class="fvh-equipped-slot"><span>' + tr('slotCelebration') + ':</span><b>' + getItemLabelById(activeCelId, 'Confetti') + '</b></div>' +
        '<div class="fvh-equipped-slot"><span>' + tr('catBoosts') + ':</span><b>' + armedName + '</b></div>';

      // Load matching items for current slot (OWNED ITEMS ONLY)
      itemsGrid.innerHTML = '';
      function renderMatchingItems(allItems) {
        BOOST_CATALOG.forEach(function (bc) {
          if (!allItems.some(function (i) { return i.id === bc.id; })) {
            allItems.push(Object.assign({}, bc, { desc: tr(bc.descKey) }));
          }
        });

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

        var boostCharges = app.store.data.boostCharges || {};
        var armed = app.store.data.armedBoost;
        var owned = app.store.data.owned || [];
        var matching;
        if (curSlot === 'boosts') {
          matching = BOOST_CATALOG.filter(function (it) {
            var ch = boostCharges[it.id] || 0;
            var isArmed = armed === it.id;
            var isOwnedLegacy = owned.indexOf(it.id) !== -1;
            return ch > 0 || isArmed || isOwnedLegacy;
          });
        } else if (curSlot === 'crowd') {
          matching = CROWD_CATALOG.filter(function (c) {
            return c.mode === 'all' || c.mode === curChar;
          });
        } else {
          matching = allItems.filter(function (it) {
            if (it.category !== curSlot) return false;
            if (it.mode && it.mode !== 'all' && it.mode !== curChar) return false;
            if (it.category === 'skins') {
              if (curChar === 'hoops' && it.id === 'skin_rookie') return false;
              if (curChar === 'footy' && it.id === 'skin_solar') return false;
            }
            var isOwned = (owned.indexOf(it.id) !== -1) || Boolean(it.isDefault) || (curChar === 'hoops' && it.id === 'skin_solar') || (curChar === 'footy' && it.id === 'skin_rookie');
            return isOwned;
          });
        }

        if (matching.length === 0) {
          var emptyBox = document.createElement('div');
          emptyBox.className = 'fvh-empty-locker';
          emptyBox.innerHTML =
            '<div class="fvh-empty-icon">' + (curSlot === 'boosts' ? '⚡' : '🎒') + '</div>' +
            '<div class="fvh-empty-title">' + (curSlot === 'boosts' ? tr('catBoosts') : tr('emptyCategory')) + '</div>' +
            '<div class="fvh-empty-desc">' + (curSlot === 'boosts' ? tr('emptyBoostsDesc') : tr('emptyCategoryDesc')) + '</div>';
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
          if (curSlot === 'boosts') {
            var isArmed = armed === item.id;
            var ch = boostCharges[item.id] || 0;
            var boostCard = document.createElement('div');
            var rarClass = item.rarity || 'common';
            boostCard.className = 'card shopc fvh-boost-card r-' + rarClass + (isArmed ? ' is-eq' : '');

            var localizedRarity = tr('rarity_' + rarClass) || rarClass.toUpperCase();
            var localizedItemName = trItem(item.name);
            var typeTag = item.type === 'active'
              ? '<span class="fvh-boost-type-tag active">⚡ ' + tr('boostActiveType') + '</span>'
              : '<span class="fvh-boost-type-tag passive">🛡️ ' + tr('boostPassiveType') + '</span>';
            var durationTag = '<span style="font-size:10px;color:var(--text-muted);font-weight:700;">⏱️ ' + (item.type === 'active' ? '12s' : 'Match') + '</span>';
            var chargesPill = '<span class="fvh-boost-charges-tag">' + tr('boostCharges', { n: ch }) + '</span>';

            boostCard.innerHTML =
              '<div class="thumbwrap"><div class="thumb" style="display:flex;align-items:center;justify-content:center;">' +
              renderItemArtwork(item, 'thumb') +
              '</div>' +
              (isArmed ? '<span class="st st-eq">✓ ' + tr('boostArmed') + '</span>' : '') +
              '</div>' +
              '<div class="nm">' + localizedItemName + '</div>' +
              '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:4px 0;">' +
              typeTag + durationTag + chargesPill +
              '</div>' +
              '<div class="fvh-boost-effect-desc">' + (item.desc || '') + '</div>';

            var bBtn = document.createElement('button');
            if (isArmed) {
              bBtn.className = 'btn small';
              bBtn.textContent = '✕ ' + tr('boostDisarm');
              bBtn.onclick = function () {
                var pid = getAppPlayerId(app);
                safeEconomyApi('/api/economy/equip', {
                  playerId: pid,
                  slot: 'boost',
                  itemId: 'none'
                }).then(function () {
                  app.store.update(function (d) { d.armedBoost = null; });
                  app.audio.play('click');
                  showToast(tr('boostDisarm') + ': ' + localizedItemName);
                  updateView();
                });
              };
            } else {
              bBtn.className = 'btn small primary';
              bBtn.textContent = tr('boostArm');
              bBtn.onclick = function () {
                var pid = getAppPlayerId(app);
                safeEconomyApi('/api/economy/equip', {
                  playerId: pid,
                  slot: 'boost',
                  itemId: item.id
                }).then(function (res) {
                  if (res && res.error === 'item_not_owned') {
                    app.audio.play('error');
                    showToast('⚠️ No charges remaining');
                    return;
                  }
                  app.store.update(function (d) { d.armedBoost = item.id; });
                  app.audio.play('click');
                  showToast(tr('boostArmed') + ': ' + localizedItemName);
                  updateView();
                });
              };
            }
            boostCard.appendChild(bBtn);
            itemsGrid.appendChild(boostCard);
            return;
          }
          var activeSlotKey = item.slot || (item.category === 'balls' ? 'ball.' + curChar : item.category === 'stadiums' ? 'stadium.' + curChar : item.category === 'skins' ? 'skin' : item.category === 'crowd' ? 'crowd' : item.category);
          var isEquipped = (item.category === 'skins')
            ? (curCharSkin === item.id)
            : (item.category === 'crowd')
              ? (activeCrowdId === item.id)
              : (eq[activeSlotKey] === item.id);

          var itemCard = document.createElement('div');
          var rarClass = item.rarity || 'common';
          itemCard.className = 'card shopc r-' + rarClass + (isEquipped ? ' is-eq' : '');

          var localizedRarity = tr('rarity_' + rarClass) || rarClass.toUpperCase();
          var localizedItemName = item.category === 'crowd' ? (tr(item.nameKey) || item.name) : trItem(item.name);

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
              if (item.category === 'crowd') {
                app.store.update(function (d) {
                  if (!d.equipped) d.equipped = {};
                  d.equipped.crowd = item.id;
                });
                app.audio.play('claim');
                showToast(tr('equipped') + ': ' + localizedItemName);
                updateView();
                return;
              }
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
                  d.equipped[activeSlotKey] = item.id;
                  if (item.category === 'skins') {
                    d.equipped['skin.' + curChar] = item.id;
                    d.equipped.skin = item.id;
                  }
                  if (item.id === 'std_ocean_sunset') { d.equipped['stadium.footy'] = 'std_ocean_sunset'; d.equipped['stadium.hoops'] = 'std_ocean_sunset'; }
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
        '<div class="fvh-prime-reward">' + getFvhCoinSvg('inline') + ' 250 + 100 XP</div>' +
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
          '<div class="fvh-mission-reward">' + getFvhCoinSvg('inline') + ' ' + q.coins + ' · ' + q.xp + ' XP</div>' +
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
        '<div class="fvh-prime-reward">🎁 3,200 ' + getFvhCoinSvg('inline') + '</div>' +
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
          url: 'https://t.me/FootyHoops',
          coins: 500,
          xp: 150,
          icon: getSocialIconSvg('tg'),
          actionText: tr('subscribeBtn')
        },
        {
          id: 'q_sub_chat',
          title: tr('q_sub_chat_title'),
          desc: tr('q_sub_chat_desc'),
          url: 'https://t.me/+zKbH1Po_pdg2MmVi',
          coins: 450,
          xp: 120,
          icon: getSocialIconSvg('chat'),
          actionText: tr('joinBtn')
        },
        {
          id: 'q_sub_x',
          title: tr('q_sub_x_title'),
          desc: tr('q_sub_x_desc'),
          url: 'https://x.com/footyvshoops',
          coins: 400,
          xp: 100,
          icon: getSocialIconSvg('x'),
          actionText: tr('followBtn')
        },
        {
          id: 'q_sub_insta',
          title: tr('q_sub_insta_title'),
          desc: tr('q_sub_insta_desc'),
          url: 'https://www.instagram.com/footyvshoops',
          coins: 400,
          xp: 100,
          icon: getSocialIconSvg('insta'),
          actionText: tr('followBtn')
        },
        {
          id: 'q_sub_yt',
          title: tr('q_sub_yt_title'),
          desc: tr('q_sub_yt_desc'),
          url: 'https://youtube.com/@footyvshoops-cr',
          coins: 450,
          xp: 120,
          icon: getSocialIconSvg('yt'),
          actionText: tr('subscribeBtn')
        },
        {
          id: 'q_sub_tiktok',
          title: tr('q_sub_tiktok_title'),
          desc: tr('q_sub_tiktok_desc'),
          url: 'https://www.tiktok.com/@footy_vs_hoops',
          coins: 400,
          xp: 100,
          icon: getSocialIconSvg('tiktok'),
          actionText: tr('followBtn')
        },
        {
          id: 'q_community_event',
          title: tr('q_community_event_title'),
          desc: tr('q_community_event_desc'),
          url: 'https://t.me/FootyHoops',
          coins: 600,
          xp: 200,
          icon: getSocialIconSvg('tournament'),
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
          '<div class="fvh-mission-reward">' + getFvhCoinSvg('inline') + ' ' + task.coins + ' · ' + task.xp + ' XP</div>' +
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
          btn.innerHTML = tr('claim') + ' ' + getFvhCoinSvg('inline') + ' ' + task.coins;
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
            '<div class="fvh-mission-reward">' + getFvhCoinSvg('inline') + ' ' + m.coins + '</div>' +
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
      type: 'coins',
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

  // Build Editorial Shop & Sports Boutique Page
  function buildShopPage(app, initialCategory, inspectId) {
    var curCategory = initialCategory || 'all';
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
    titleBox.innerHTML = '<h1 style="margin:0;">' + tr('stadiumStore') + '</h1><small style="color:var(--text-muted);letter-spacing:1px;font-size:10px;">' + tr(isFooty ? 'storeSubFooty' : 'storeSubHoops') + '</small>';

    var walletBox = document.createElement('div');
    walletBox.className = 'fvh-wallet-chips';

    head.appendChild(backBtn);
    head.appendChild(titleBox);
    head.appendChild(walletBox);
    page.appendChild(head);

    var body = document.createElement('div');
    body.className = 'page-body fvh-shop-container';

    // Faction Boutique Allegiance Banner
    var allegianceBanner = document.createElement('div');
    allegianceBanner.className = 'fvh-shop-allegiance-banner ' + (isFooty ? 'footy' : 'hoops');
    allegianceBanner.innerHTML =
      '<div class="fvh-shop-allegiance-icon">' + (isFooty ? '⚽' : '🏀') + '</div>' +
      '<div class="fvh-shop-allegiance-info">' +
      '  <div class="fvh-shop-allegiance-title">' + tr(isFooty ? 'teamFootballBoutique' : 'teamBasketballBoutique') + '</div>' +
      '  <div class="fvh-shop-allegiance-sub">' + tr(isFooty ? 'teamFootballBoutiqueDesc' : 'teamBasketballBoutiqueDesc') + '</div>' +
      '</div>' +
      '<div class="fvh-shop-allegiance-badge">' + (isFooty ? tr('onlyForFootball') : tr('onlyForBasketball')) + '</div>';
    body.appendChild(allegianceBanner);

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
      { id: 'boosts', label: tr('catBoosts') },
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

      walletBox.innerHTML = '<div class="fvh-chip coins">' + getFvhCoinSvg("inline") + ' <span style="font-weight:900;color:#fde047;margin-left:4px;">' + coins.toLocaleString() + '</span></div>' +
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
          '    <div style="width:36px;height:36px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">' + renderItemArtwork(it.id, 'small') + '</div>' +
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
        '    <del style="opacity:0.6;">' + (bundle.originalValue ? bundle.originalValue.toLocaleString() : '') + '</del> ➔ <b style="color:#fde047;display:inline-flex;align-items:center;gap:3px;">' + getFvhCoinSvg('inline') + ' ' + bundle.coinsPrice.toLocaleString() + '</b>' +
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
        buyBtn.innerHTML = tr('buyFor') + ' ' + getFvhCoinSvg('inline') + ' ' + bundle.coinsPrice.toLocaleString() + ' &nbsp;·&nbsp; ' + bundle.starsPrice + ' ⭐';
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
      overlay.className = 'modal-back fvh-sheet-back';
      var modal = document.createElement('div');
      modal.className = 'modal fvh-item-modal';

      var owned = app.store.data.owned || [];
      var isBoost = (item.category === 'boosts');
      var boostCharges = (app.store.data.boostCharges && app.store.data.boostCharges[item.id]) || 0;
      var isArmed = (app.store.data.armedBoost === item.id);
      var isOwned = isBoost ? (boostCharges > 0 || isArmed) : (owned.indexOf(item.id) !== -1 || item.isDefault);
      var charMode = app.store.data.selectedCharacter || 'footy';
      var slotKey = item.slot || (item.category === 'balls' ? 'ball.' + charMode : item.category === 'stadiums' ? 'stadium.' + charMode : item.category === 'skins' ? 'skin' : item.category);
      var isEquipped = isBoost ? isArmed : (app.store.data.equipped && app.store.data.equipped[slotKey] === item.id);
      var rarKey = item.rarity || 'common';
      var localizedRarity = tr('rarity_' + rarKey) || rarKey.toUpperCase();
      var localizedItemName = trItem(item.name);

      var categoryLabel = '';
      if (item.category === 'stadiums') categoryLabel = tr('catArenas');
      else if (item.category === 'skins') categoryLabel = tr('catJerseys');
      else if (item.category === 'balls') categoryLabel = tr('catBalls');
      else if (item.category === 'boosts') categoryLabel = tr('catBoosts');
      else if (item.category === 'packs') categoryLabel = tr('catPacks');
      else if (item.category) categoryLabel = tr('cat' + item.category.charAt(0).toUpperCase() + item.category.slice(1)) || item.category;
      else categoryLabel = tr('storeSub');

      var boostExtraInfo = '';
      if (isBoost) {
        var bDef = BOOST_CATALOG.find(function (b) { return b.id === item.id; });
        if (bDef) {
          if (!item.type) item.type = bDef.type;
          if (!item.duration) item.duration = bDef.duration;
          if (!item.descKey) item.descKey = bDef.descKey;
          if (!item.desc) item.desc = tr(bDef.descKey);
        }
        var isAct = item.type === 'active' || item.id === 'boost_turbo';
        var typeBadge = isAct
          ? '<span class="fvh-boost-type-tag active">⚡ ' + tr('boostActiveType') + ' (12s)</span>'
          : '<span class="fvh-boost-type-tag passive">🛡️ ' + tr('boostPassiveType') + ' (Match)</span>';
        var chargesTag = '<span class="fvh-boost-charges-tag">' + tr('boostCharges', { n: boostCharges }) + '</span>';
        var boostExpl = isAct ? tr('boostActiveDesc') : tr('boostPassiveDesc');
        boostExtraInfo =
          '<div style="display:flex;align-items:center;gap:8px;justify-content:center;margin:6px 0 10px;">' +
          typeBadge + chargesTag +
          '</div>' +
          '<div style="font-size:11.5px;color:var(--text-muted);background:rgba(255,255,255,0.05);border-radius:8px;padding:8px 12px;margin:8px 0;line-height:1.4;text-align:left;">' +
          (isAct ? '⚡ <b>' + tr('boostActiveType') + '</b>: ' : '🛡️ <b>' + tr('boostPassiveType') + '</b>: ') + boostExpl +
          '<br><span style="color:#fde047;font-size:10.5px;">🔒 Disabled in online multiplayer (fair play).</span>' +
          '</div>';
      }

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
        '<div class="fvh-item-modal-category">' + categoryLabel + (item.mode ? ' · ' + (item.mode === 'footy' ? tr('football') : tr('basketball')) : '') + '</div>' +
        boostExtraInfo +
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

      if (isBoost) {
        if (boostCharges > 0) {
          var armBtn = document.createElement('button');
          if (isArmed) {
            armBtn.className = 'btn block';
            armBtn.textContent = '✕ ' + tr('boostDisarm');
            armBtn.onclick = function () {
              var pid = getAppPlayerId(app);
              safeEconomyApi('/api/economy/equip', {
                playerId: pid,
                slot: 'boost',
                itemId: 'none'
              }).then(function () {
                app.store.update(function (d) { d.armedBoost = null; });
                app.audio.play('click');
                showToast(tr('boostDisarm') + ': ' + localizedItemName);
                overlay.remove();
                renderShop();
              });
            };
          } else {
            armBtn.className = 'btn primary block';
            armBtn.textContent = '⚡ ' + tr('boostArm');
            armBtn.onclick = function () {
              var pid = getAppPlayerId(app);
              safeEconomyApi('/api/economy/equip', {
                playerId: pid,
                slot: 'boost',
                itemId: item.id
              }).then(function (res) {
                if (res && res.error === 'item_not_owned') {
                  app.audio.play('error');
                  showToast('⚠️ No charges remaining');
                  return;
                }
                app.store.update(function (d) { d.armedBoost = item.id; });
                app.audio.play('claim');
                showToast(tr('boostArmed') + ': ' + localizedItemName);
                overlay.remove();
                renderShop();
              });
            };
          }
          actionsBox.appendChild(armBtn);
        }

        var buyChargeBtn = document.createElement('button');
        buyChargeBtn.className = (boostCharges === 0 ? 'btn primary block' : 'btn block');
        buyChargeBtn.style.marginTop = boostCharges > 0 ? '8px' : '0';
        buyChargeBtn.innerHTML = tr('buyFor') + ' ' + getFvhCoinSvg('inline') + ' ' + item.price + ' (+1 ' + tr('boostCharges', { n: 1 }) + ')';
        buyChargeBtn.onclick = function () {
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
            idempotencyKey: 'boost_' + pid + '_' + item.id + '_' + Date.now()
          }).then(function (res) {
            isPurchasing = false;
            if (res && res.ok) {
              app.store.update(function (d) {
                d.coins = res.coins;
                d.xp = res.xp;
                d.owned = res.owned;
                d.packs = res.packs;
                d.boostCharges = res.boostCharges;
                d.armedBoost = res.armedBoost;
              });
            } else {
              app.store.update(function (d) {
                d.coins -= item.price;
                if (!d.boostCharges) d.boostCharges = {};
                d.boostCharges[item.id] = (d.boostCharges[item.id] || 0) + 1;
              });
            }
            app.audio.play('claim');
            showToast(tr('purchaseSuccess') + ' (' + localizedItemName + ' +1)');
            overlay.remove();
            renderShop();
          });
        };
        actionsBox.appendChild(buyChargeBtn);
      } else if (isEquipped) {
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
        buyBtn.innerHTML = tr('buyFor') + ' ' + getFvhCoinSvg('inline') + ' ' + item.price;
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

    
    // Full Catalog Cosmetic Pools for Packs
    var PACK_POOLS = {
      footy: [
        { id: 'skin_crimson', name: 'Crimson Comet', category: 'skins', rarity: 'rare' },
        { id: 'skin_neon', name: 'Neon Striker', category: 'skins', rarity: 'epic' },
        { id: 'skin_frost', name: 'Frost Giant', category: 'skins', rarity: 'rare' },
        { id: 'skin_shadow', name: 'Shadow Ninja', category: 'skins', rarity: 'epic' },
        { id: 'skin_solar', name: 'Solar Flare', category: 'skins', rarity: 'epic' },
        { id: 'skin_gold', name: 'Golden Legend', category: 'skins', rarity: 'legendary' },
        { id: 'skin_cyber', name: 'Cyber Punk', category: 'skins', rarity: 'legendary' },
        { id: 'skin_sunset', name: 'Sunset Gold Jersey', category: 'skins', rarity: 'rare' },
        { id: 'skin_hydro', name: 'Hydro Striker Kit', category: 'skins', rarity: 'rare' },
        { id: 'ball_footy_plasma', name: 'Plasma Orb', category: 'balls', rarity: 'rare' },
        { id: 'ball_footy_gold', name: 'Golden Cup', category: 'balls', rarity: 'epic' },
        { id: 'ball_footy_inferno', name: 'Inferno', category: 'balls', rarity: 'epic' },
        { id: 'ball_footy_solar', name: 'Solar Blaze Ball', category: 'balls', rarity: 'legendary' },
        { id: 'ball_earthrise', name: 'Earthrise Ball', category: 'balls', rarity: 'legendary' },
        { id: 'std_ocean_sunset', name: 'Coastal Sunset Court', category: 'stadiums', rarity: 'epic' },
        { id: 'std_forest_redwood', name: 'Redwood Forest Arena', category: 'stadiums', rarity: 'epic' },
        { id: 'std_footy_night', name: 'Night Arena', category: 'stadiums', rarity: 'rare' },
        { id: 'std_footy_golden', name: 'Golden Hour', category: 'stadiums', rarity: 'rare' },
        { id: 'std_footy_neon', name: 'Neon Turf', category: 'stadiums', rarity: 'epic' },
        { id: 'cel_confetti', name: 'Confetti Burst', category: 'celebrations', rarity: 'rare' },
        { id: 'cel_fireworks', name: 'Fireworks', category: 'celebrations', rarity: 'rare' },
        { id: 'cel_flames', name: 'Flame Burst', category: 'celebrations', rarity: 'epic' },
        { id: 'trail_fire', name: 'Fire Trail', category: 'trails', rarity: 'rare' },
        { id: 'trail_laser', name: 'Laser Trail', category: 'trails', rarity: 'legendary' }
      ],
      hoops: [
        { id: 'skin_sunset', name: 'Sunset Gold Jersey', category: 'skins', rarity: 'rare' },
        { id: 'skin_hydro', name: 'Hydro Striker Kit', category: 'skins', rarity: 'rare' },
        { id: 'skin_mars', name: 'Mars Rover Kit', category: 'skins', rarity: 'epic' },
        { id: 'skin_astronaut', name: 'Astronaut Kit', category: 'skins', rarity: 'legendary' },
        { id: 'skin_neon_elite', name: 'Cyber Striker', category: 'skins', rarity: 'legendary' },
        { id: 'ball_hoops_blaze', name: 'Neon Blaze', category: 'balls', rarity: 'rare' },
        { id: 'ball_hoops_chrome', name: 'Chrome', category: 'balls', rarity: 'epic' },
        { id: 'ball_hoops_midnight', name: 'Midnight', category: 'balls', rarity: 'rare' },
        { id: 'ball_tidal', name: 'Tidal Wave Ball', category: 'balls', rarity: 'epic' },
        { id: 'ball_cyber_neon', name: 'Cyber Neon Ball', category: 'balls', rarity: 'legendary' },
        { id: 'std_hoops_sky', name: 'Skyline Rooftop', category: 'stadiums', rarity: 'rare' },
        { id: 'std_hoops_neon', name: 'Neon Night', category: 'stadiums', rarity: 'epic' },
        { id: 'std_hoops_gold', name: 'Gold Hardwood', category: 'stadiums', rarity: 'epic' },
        { id: 'std_ocean_sunset', name: 'Coastal Sunset Court', category: 'stadiums', rarity: 'epic' },
        { id: 'cel_shockwave', name: 'Shockwave', category: 'celebrations', rarity: 'rare' },
        { id: 'cel_goldrain', name: 'Gold Rain', category: 'celebrations', rarity: 'legendary' },
        { id: 'cel_lightning', name: 'Lightning Storm', category: 'celebrations', rarity: 'legendary' },
        { id: 'trail_ice', name: 'Ice Trail', category: 'trails', rarity: 'rare' },
        { id: 'trail_rainbow', name: 'Rainbow Trail', category: 'trails', rarity: 'epic' }
      ],
      clash: [
        { id: 'skin_gold', name: 'Golden Legend', category: 'skins', rarity: 'legendary' },
        { id: 'skin_cyber', name: 'Cyber Punk', category: 'skins', rarity: 'legendary' },
        { id: 'skin_neon_elite', name: 'Cyber Striker', category: 'skins', rarity: 'legendary' },
        { id: 'skin_astronaut', name: 'Astronaut Kit', category: 'skins', rarity: 'legendary' },
        { id: 'skin_shadow', name: 'Shadow Ninja', category: 'skins', rarity: 'epic' },
        { id: 'ball_footy_solar', name: 'Solar Blaze Ball', category: 'balls', rarity: 'legendary' },
        { id: 'ball_earthrise', name: 'Earthrise Ball', category: 'balls', rarity: 'legendary' },
        { id: 'ball_tidal', name: 'Tidal Wave Ball', category: 'balls', rarity: 'epic' },
        { id: 'ball_cyber_neon', name: 'Cyber Neon Ball', category: 'balls', rarity: 'legendary' },
        { id: 'ball_hoops_chrome', name: 'Chrome', category: 'balls', rarity: 'epic' },
        { id: 'std_space_orbit', name: 'Orbital Space Colosseum', category: 'stadiums', rarity: 'legendary' },
        { id: 'std_mars_dome', name: 'Mars Bio-Dome Arena', category: 'stadiums', rarity: 'epic' },
        { id: 'std_moon_crater', name: 'Apollo Lunar Arena', category: 'stadiums', rarity: 'rare' },
        { id: 'std_underwater_dome', name: 'Abyssal Ocean Dome', category: 'stadiums', rarity: 'legendary' },
        { id: 'std_cyber_megacity', name: 'Neo Tokyo Megacity', category: 'stadiums', rarity: 'legendary' },
        { id: 'std_volcano_caldera', name: 'Magma Caldera Arena', category: 'stadiums', rarity: 'epic' },
        { id: 'std_floating_islands', name: 'Aetheria Sky Islands', category: 'stadiums', rarity: 'legendary' },
        { id: 'std_crystal_cavern', name: 'Prismatic Crystal Cave', category: 'stadiums', rarity: 'epic' },
        { id: 'cel_goldrain', name: 'Gold Rain', category: 'celebrations', rarity: 'legendary' },
        { id: 'cel_lightning', name: 'Lightning Storm', category: 'celebrations', rarity: 'legendary' },
        { id: 'cel_fireworks', name: 'Fireworks', category: 'celebrations', rarity: 'rare' },
        { id: 'trail_rainbow', name: 'Rainbow Trail', category: 'trails', rarity: 'epic' },
        { id: 'trail_laser', name: 'Laser Trail', category: 'trails', rarity: 'legendary' },
        { id: 'frame_bronze', name: 'Bronze Frame', category: 'frames', rarity: 'rare' },
        { id: 'frame_diamond', name: 'Diamond Frame', category: 'frames', rarity: 'legendary' }
      ]
    };

    function openPackAnimation(packDef) {
      var pId = (packDef && packDef.id) || 'footy';
      if (pId === 'pack_footy') pId = 'footy';
      else if (pId === 'pack_hoops') pId = 'hoops';
      else if (pId === 'pack_clash') pId = 'clash';

      var pool = PACK_POOLS[pId] || PACK_POOLS.footy;
      var cardCount = (pId === 'clash') ? 3 : 2;
      var coinFallbackAmount = (pId === 'clash') ? 600 : 300;

      // Duplicate-free pull logic:
      // Filter current owned items so that player NEVER pulls duplicates.
      // If player already owns all items in the pool, reward guaranteed FvH Coins!
      var storeData = app.store.data;
      var ownedList = (storeData.owned || []).slice();
      var drops = [];

      for (var c = 0; c < cardCount; c++) {
        var unowned = pool.filter(function (it) {
          return ownedList.indexOf(it.id) === -1;
        });

        if (unowned.length > 0) {
          // Pull a guaranteed new cosmetic item!
          var randIdx = Math.floor(Math.random() * unowned.length);
          var pickedItem = unowned[randIdx];
          ownedList.push(pickedItem.id); // Prevent duplicate within the same pack!
          drops.push({
            type: 'cosmetic',
            item: pickedItem,
            isNew: true
          });
        } else {
          // All items owned in this pool -> fallback directly to FvH Coins!
          drops.push({
            type: 'coins',
            val: coinFallbackAmount,
            name: coinFallbackAmount + ' FvH Coin',
            isDuplicateFallback: true
          });
        }
      }

      // 1. Build Full-Screen Cinematic Pack Opening Overlay
      var overlay = document.createElement('div');
      overlay.className = 'fvh-pack-opening-overlay';

      var flash = document.createElement('div');
      flash.className = 'fvh-pack-flash-overlay';
      overlay.appendChild(flash);

      var stage = document.createElement('div');
      stage.className = 'fvh-pack-stage';

      var packTitle = document.createElement('div');
      packTitle.style.cssText = 'font-size:12px;font-weight:900;letter-spacing:1.5px;color:#38bdf8;text-transform:uppercase;margin-bottom:8px;';
      packTitle.textContent = trItem(packDef.name);

      var packSub = document.createElement('div');
      packSub.style.cssText = 'font-size:11px;color:var(--text-muted);margin-bottom:12px;';
      packSub.textContent = (getActiveLang() === 'ru') ? 'Турнирный бустер-пак сезона' : 'Tournament Season Booster Pack';

      // Unopened 3D Foil Pack with breathing hover
      var packWrap = document.createElement('div');
      packWrap.className = 'fvh-pack-unopened-wrap';
      var hoverCard = document.createElement('div');
      hoverCard.className = 'fvh-pack-hover-card';
      hoverCard.innerHTML = getDetailedPackSvg(pId, 'large');
      packWrap.appendChild(hoverCard);

      var ripHint = document.createElement('div');
      ripHint.style.cssText = 'margin-top:16px;font-size:13px;font-weight:900;color:#fde047;letter-spacing:1px;text-transform:uppercase;animation:fvhPulse 1.2s infinite;';
      ripHint.innerHTML = '⚡ ' + ((getActiveLang() === 'ru') ? 'Нажмите, чтобы вскрыть пак' : 'Tap to rip open pack');

      stage.appendChild(packTitle);
      stage.appendChild(packSub);
      stage.appendChild(packWrap);
      stage.appendChild(ripHint);
      overlay.appendChild(stage);
      document.body.appendChild(overlay);

      // Play introductory suspense sound
      app.audio.play('click');

      var isRipped = false;
      packWrap.onclick = function () {
        if (isRipped) return;
        isRipped = true;

        // Stage 2: Violent rumble & tear sound
        hoverCard.className = 'fvh-pack-hover-card rumble';
        ripHint.textContent = (getActiveLang() === 'ru') ? 'Вскрытие...' : 'Ripping...';
        app.audio.play('kick');

        setTimeout(function () {
          // Stage 3: Energy burst flash
          flash.className = 'fvh-pack-flash-overlay active';
          app.audio.play('whistle');

          setTimeout(function () {
            // Apply rewards to persistent store
            app.store.update(function (d) {
              if (!d.owned) d.owned = [];
              drops.forEach(function (dr) {
                if (dr.type === 'cosmetic') {
                  if (d.owned.indexOf(dr.item.id) === -1) d.owned.push(dr.item.id);
                } else if (dr.type === 'coins') {
                  d.coins = (d.coins || 0) + dr.val;
                }
              });
            });

            // Stage 4: Cards reveal
            stage.innerHTML = '';
            var congratsTitle = document.createElement('h2');
            congratsTitle.style.cssText = 'margin:0 0 4px;font-size:22px;color:#fde047;letter-spacing:0.5px;';
            congratsTitle.textContent = (getActiveLang() === 'ru') ? '🎉 НАГРАДЫ ИЗ ПАКА!' : '🎉 PACK REWARDS!';

            var cardsContainer = document.createElement('div');
            cardsContainer.className = 'fvh-pack-cards-reveal';

            drops.forEach(function (dr, idx) {
              var cCard = document.createElement('div');
              var rarity = dr.type === 'cosmetic' ? (dr.item.rarity || 'epic') : 'coins';
              cCard.className = 'fvh-pack-reward-card r-' + rarity;
              cCard.style.animationDelay = (idx * 0.16) + 's';

              var shine = document.createElement('div');
              shine.className = 'fvh-pack-card-shine';
              cCard.appendChild(shine);

              var rarityBadge = document.createElement('div');
              rarityBadge.className = 'rar ' + (rarity === 'coins' ? 'legendary' : rarity);
              rarityBadge.style.cssText = 'font-size:9.5px;padding:2px 8px;margin-bottom:6px;';
              rarityBadge.textContent = rarity === 'coins' ? 'FVH COINS' : tr('rarity_' + rarity);
              cCard.appendChild(rarityBadge);

              var thumb = document.createElement('div');
              thumb.className = 'fvh-pack-reward-thumb';
              if (dr.type === 'cosmetic') {
                thumb.innerHTML = renderItemArtwork(dr.item, 'large');
              } else {
                thumb.innerHTML = getFvhCoinSvg('large');
              }
              cCard.appendChild(thumb);

              var nameBox = document.createElement('div');
              nameBox.className = 'fvh-pack-reward-title';
              nameBox.textContent = dr.type === 'cosmetic' ? trItem(dr.item.name) : ('+' + dr.val + ' FvH Coin');
              cCard.appendChild(nameBox);

              if (dr.isNew) {
                var newPill = document.createElement('div');
                newPill.className = 'fvh-pack-badge-new';
                newPill.textContent = (getActiveLang() === 'ru') ? '✨ НОВИНКА!' : '✨ NEW!';
                cCard.appendChild(newPill);
              } else if (dr.isDuplicateFallback) {
                var compPill = document.createElement('div');
                compPill.className = 'fvh-pack-badge-fallback';
                compPill.title = (getActiveLang() === 'ru') ? 'Все предметы коллекции получены!' : 'All collection items owned!';
                compPill.textContent = (getActiveLang() === 'ru') ? '💎 КОМПЕНСАЦИЯ' : '💎 COIN BONUS';
                cCard.appendChild(compPill);
              }

              cardsContainer.appendChild(cCard);
            });

            stage.appendChild(congratsTitle);
            stage.appendChild(cardsContainer);

            // Stage 5: Claim All Button
            var claimBtn = document.createElement('button');
            claimBtn.className = 'btn fvh-pack-claim-btn';
            claimBtn.textContent = (getActiveLang() === 'ru') ? 'ЗАБРАТЬ ВСЁ' : 'CLAIM ALL';
            claimBtn.onclick = function () {
              app.audio.play('claim');
              overlay.remove();
              renderShop();
            };
            stage.appendChild(claimBtn);

            app.audio.play('score');
          }, 350);
        }, 450);
      };
    }
    app.openPackAnimation = openPackAnimation;


    function renderShop() {
      updateWalletUI();

      // Featured Hero Item (Featured Drop of the Day) - Discipline-specific
      var featuredItem = isFooty ? {
        id: 'skin_neon_elite',
        name: 'CYBER STRIKER KIT',
        category: 'skins',
        rarity: 'legendary',
        icon: '🎽',
        price: 650,
        desc: (getActiveLang() === 'ru') ?
          'Эксклюзивная легендарная форма футбольного нападающего с неоновой подсветкой для побед Команды Футбола.' :
          'Exclusive high-voltage neon soccer kit with responsive reactive lighting for Team Football victories.'
      } : {
        id: 'skin_astronaut',
        name: 'CYBER ALL-STAR KIT',
        category: 'skins',
        rarity: 'legendary',
        icon: '🎽',
        price: 650,
        desc: (getActiveLang() === 'ru') ?
          'Эксклюзивная легендарная форма баскетбольного форварда с реактивной подсветкой для побед Команды Баскетбола.' :
          'Exclusive high-voltage neon basketball kit with responsive reactive lighting for Team Basketball victories.'
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
          '<button class="btn primary small feat-buy-btn">' + tr('buyFor') + ' ' + getFvhCoinSvg('inline') + ' ' + featuredItem.price + '</button>') +
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
          '  <div style="width:44px;height:44px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' + getFvhCoinSvg('thumb') + '</div>' +
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
            '  <span style="font-size:11px;font-weight:900;color:#fde047;display:inline-flex;align-items:center;gap:3px;">' + getFvhCoinSvg('inline') + ' +' + pkg.coinsAmount.toLocaleString() + '</span>' +
            '</div>' +
            '<div class="fvh-card-thumb-wrap" style="height:76px;display:flex;align-items:center;justify-content:center;">' +
            '  <div style="width:72px;height:72px;display:flex;align-items:center;justify-content:center;">' + renderItemArtwork(pkg.id, 'thumb') + '</div>' +
            '</div>' +
            '<div class="fvh-card-title" style="font-size:13px;font-weight:800;color:var(--text-pure);margin-bottom:4px;">' + tr(pkg.id === 'pkg_coins_starter' ? 'pkgStarter' : pkg.id === 'pkg_coins_pro' ? 'pkgPro' : pkg.id === 'pkg_coins_elite' ? 'pkgElite' : pkg.id === 'pkg_coins_champion' ? 'pkgChampion' : 'pkgLegend') + '</div>' +
            '<div class="fvh-card-desc" style="font-size:11px;color:var(--text-muted);margin-bottom:8px;line-height:1.3;">' + pkg.desc + '</div>' +
            '<div class="fvh-card-price" style="font-size:12px;font-weight:900;color:#facc15;">' +
            pkg.starsPrice + ' ⭐ Stars' +
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

      // 1. Dedicated BUNDLES Tab (Filtered strictly by player's sport)
      if (curCategory === 'bundles') {
        var visibleBundles = BUNDLE_ITEMS.filter(function (b) {
          if (isFooty && b.id === 'bundle_hoops_starter') return false;
          if (!isFooty && b.id === 'bundle_footy_starter') return false;
          return true;
        });
        visibleBundles.forEach(function (b) {
          var ownInfo = checkBundleOwnership(b);
          var bCard = document.createElement('div');
          bCard.className = 'fvh-catalogue-card fvh-bundle-card r-legendary' + (ownInfo.isFullyOwned ? ' owned' : '');
          bCard.style.position = 'relative';
          bCard.style.background = 'linear-gradient(135deg, rgba(25, 20, 40, 0.95) 0%, rgba(12, 10, 24, 0.98) 100%)';
          bCard.style.border = ownInfo.isFullyOwned ? '1.5px solid rgba(255,255,255,0.1)' : '1.5px solid rgba(255, 200, 0, 0.45)';
          bCard.style.cursor = 'pointer';

          var previewIcons = b.items.slice(0, 4).map(function (it) {
            return '<div style="width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;" title="' + trItem(it.name) + '">' + renderItemArtwork(it.id, 'small') + '</div>';
          }).join(' ');

          bCard.innerHTML =
            '<div class="fvh-card-head" style="justify-content:space-between;">' +
            '  <span class="rar legendary" style="font-size:10px;padding:3px 8px;">' + b.badge + '</span>' +
            '  <span style="font-size:10px;font-weight:900;color:#fde047;background:rgba(255,200,0,0.2);padding:2px 6px;border-radius:10px;">-' + b.discount + '%</span>' +
            '</div>' +
            '<div class="fvh-card-thumb-wrap" style="height:76px;display:flex;align-items:center;justify-content:center;">' +
            '  <div style="width:72px;height:72px;display:flex;align-items:center;justify-content:center;">' + renderItemArtwork(b.id, 'medium') + '</div>' +
            '</div>' +
            '<div class="fvh-card-title" style="font-size:13px;font-weight:800;color:var(--text-pure);margin-bottom:4px;">' + trItem(b.name) + '</div>' +
            '<div style="display:flex;align-items:center;gap:6px;justify-content:center;margin-bottom:8px;opacity:0.85;">' + previewIcons + '</div>' +
            '<div class="fvh-card-price" style="font-size:12px;font-weight:900;color:#facc15;">' +
            (ownInfo.isFullyOwned ?
              '✓ ' + tr('bundleAlreadyOwned') :
              getFvhCoinSvg('inline') + ' ' + b.coinsPrice.toLocaleString() + ' · ' + b.starsPrice + ' ⭐'
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

      // 2. PACKS Tab (Filtered strictly by player's sport)
      if (curCategory === 'packs') {
        var packsData = app.store.data.packs || { free: {}, paid: {} };
        var visiblePacks = PACKS_DEF.filter(function (pk) {
          if (isFooty && pk.id === 'hoops') return false;
          if (!isFooty && pk.id === 'footy') return false;
          return true;
        });
        visiblePacks.forEach(function (pk) {
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
            buyPackBtn.innerHTML = getFvhCoinSvg('inline') + ' ' + pk.price;
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
          { id: 'std_ocean_sunset', category: 'stadiums', slot: 'stadium.' + curChar, mode: curChar, name: 'Coastal Sunset Court', rarity: 'epic', price: 580, icon: '🌅', desc: tr('scenicCoastalDesc') },
          { id: 'std_forest_redwood', category: 'stadiums', slot: 'stadium.' + curChar, mode: curChar, name: 'Redwood Forest Arena', rarity: 'epic', price: 560, icon: '🌲', desc: tr('scenicForestDesc') },
          { id: 'std_space_orbit', category: 'stadiums', slot: 'stadium.' + curChar, mode: curChar, name: 'Orbital Space Colosseum', rarity: 'legendary', price: 900, icon: '🚀', desc: tr('scenicSpaceDesc') },
          { id: 'std_mars_dome', category: 'stadiums', slot: 'stadium.' + curChar, mode: curChar, name: 'Mars Bio-Dome Arena', rarity: 'epic', price: 750, icon: '🔴', desc: tr('scenicMarsDesc') },
          { id: 'std_moon_crater', category: 'stadiums', slot: 'stadium.' + curChar, mode: curChar, name: 'Apollo Lunar Arena', rarity: 'rare', price: 680, icon: '🌕', desc: tr('scenicMoonDesc') },
          { id: 'std_underwater_dome', category: 'stadiums', slot: 'stadium.' + curChar, mode: curChar, name: 'Abyssal Ocean Dome', rarity: 'legendary', price: 820, icon: '🫧', desc: tr('scenicUnderwaterDesc') },
          { id: 'std_cyber_megacity', category: 'stadiums', slot: 'stadium.' + curChar, mode: curChar, name: 'Neo Tokyo Megacity', rarity: 'legendary', price: 950, icon: '🏙️', desc: tr('scenicCyberDesc') },
          { id: 'std_volcano_caldera', category: 'stadiums', slot: 'stadium.' + curChar, mode: curChar, name: 'Magma Caldera Arena', rarity: 'epic', price: 850, icon: '🌋', desc: tr('scenicVolcanoDesc') },
          { id: 'std_floating_islands', category: 'stadiums', slot: 'stadium.' + curChar, mode: curChar, name: 'Aetheria Sky Islands', rarity: 'legendary', price: 880, icon: '☁️', desc: tr('scenicFloatingDesc') },
          { id: 'std_crystal_cavern', category: 'stadiums', slot: 'stadium.' + curChar, mode: curChar, name: 'Prismatic Crystal Cave', rarity: 'epic', price: 790, icon: '💎', desc: tr('scenicCrystalDesc') }
        ];
        scenicArenas.forEach(function (sa) {
          var existing = allItems.find(function (i) { return i.id === sa.id; });
          if (!existing) {
            allItems.push(sa);
          } else {
            existing.slot = 'stadium.' + curChar;
            existing.mode = curChar;
          }
        });

        BOOST_CATALOG.forEach(function (bc) {
          if (!allItems.some(function (i) { return i.id === bc.id; })) {
            allItems.push(Object.assign({}, bc, { desc: tr(bc.descKey) }));
          }
        });

        // If category is "all", also show the bundles at the top of the store
        if (curCategory === 'all') {
          var visibleAllBundles = BUNDLE_ITEMS.filter(function (b) {
            if (isFooty && b.id === 'bundle_hoops_starter') return false;
            if (!isFooty && b.id === 'bundle_footy_starter') return false;
            return true;
          });
          visibleAllBundles.forEach(function (b) {
            var ownInfo = checkBundleOwnership(b);
            var bCard = document.createElement('div');
            bCard.className = 'fvh-catalogue-card fvh-bundle-card r-legendary' + (ownInfo.isFullyOwned ? ' owned' : '');
            bCard.style.border = ownInfo.isFullyOwned ? '1.5px solid rgba(255,255,255,0.1)' : '1.5px solid rgba(255, 200, 0, 0.45)';
            bCard.style.background = 'linear-gradient(135deg, rgba(25, 20, 40, 0.95) 0%, rgba(12, 10, 24, 0.98) 100%)';
            bCard.style.cursor = 'pointer';

            var previewIcons = b.items.slice(0, 4).map(function (it) {
              return '<div style="width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;" title="' + trItem(it.name) + '">' + renderItemArtwork(it.id, 'small') + '</div>';
            }).join(' ');

            bCard.innerHTML =
              '<div class="fvh-card-head" style="justify-content:space-between;">' +
              '  <span class="rar legendary" style="font-size:10px;padding:3px 8px;">' + b.badge + '</span>' +
              '  <span style="font-size:10px;font-weight:900;color:#fde047;background:rgba(255,200,0,0.2);padding:2px 6px;border-radius:10px;">-' + b.discount + '%</span>' +
              '</div>' +
              '<div class="fvh-card-thumb-wrap" style="height:76px;display:flex;align-items:center;justify-content:center;">' +
              '  <div style="width:72px;height:72px;display:flex;align-items:center;justify-content:center;">' + renderItemArtwork(b.id, 'medium') + '</div>' +
              '</div>' +
              '<div class="fvh-card-title" style="font-size:13px;font-weight:800;color:var(--text-pure);margin-bottom:4px;">' + trItem(b.name) + '</div>' +
              '<div style="display:flex;align-items:center;gap:6px;justify-content:center;margin-bottom:8px;opacity:0.85;">' + previewIcons + '</div>' +
              '<div class="fvh-card-price" style="font-size:12px;font-weight:900;color:#facc15;">' +
              (ownInfo.isFullyOwned ?
                '✓ ' + tr('bundleAlreadyOwned') :
                getFvhCoinSvg('inline') + ' ' + b.coinsPrice.toLocaleString() + ' · ' + b.starsPrice + ' ⭐'
              ) +
              '</div>';

            bCard.onclick = function () {
              app.audio.play('click');
              openBundleInspector(b);
            };
            catalogueGrid.appendChild(bCard);
          });
        }

        // Discipline-specific catalog filter
        function isItemAllowedForCurrentAthlete(it) {
          if (isFooty) {
            // Player is Football: strictly NO basketball items
            if (it.mode === 'hoops') return false;
            if (it.category === 'basketball') return false;
            if (it.slot && it.slot === 'ball.hoops') return false;
            if (it.id && (it.id.startsWith('ball_hoops') || it.id === 'ball_cyber_neon' || it.id === 'ball_tidal')) return false;
            if (it.id && (it.id === 'std_hoops_street' || it.id === 'std_hoops_neon' || it.id === 'std_hoops_gold' || it.id === 'std_hoops_sky')) return false;
          } else {
            // Player is Basketball: strictly NO football items
            if (it.mode === 'footy') return false;
            if (it.category === 'football') return false;
            if (it.slot && it.slot === 'ball.footy') return false;
            if (it.id && (it.id.startsWith('ball_footy') || it.id === 'ball_earthrise')) return false;
            if (it.id && (it.id === 'std_footy_classic' || it.id === 'std_footy_night' || it.id === 'std_footy_golden' || it.id === 'std_footy_neon')) return false;
          }
          return true;
        }

        var filtered = allItems.filter(function (it) {
          if (!isItemAllowedForCurrentAthlete(it)) return false;
          if (curCategory === 'all') return true;
          return it.category === curCategory;
        });

        if (filtered.length === 0 && curCategory !== 'all') {
          catalogueGrid.innerHTML = '<div style="color:var(--text-muted);font-size:13px;grid-column:1/-1;padding:24px 0;text-align:center;">' + tr('inCollection') + ': 0</div>';
          return;
        }

        filtered.forEach(function (it) {
          var isBoost = (it.category === 'boosts');
          var boostCharges = (app.store.data.boostCharges && app.store.data.boostCharges[it.id]) || 0;
          var isArmed = (app.store.data.armedBoost === it.id);
          var isOwned = isBoost ? (boostCharges > 0 || isArmed) : (owned.indexOf(it.id) !== -1 || it.isDefault);
          var card = document.createElement('div');
          var rarKey = it.rarity || 'common';
          var localizedRarity = tr('rarity_' + rarKey) || rarKey.toUpperCase();
          var localizedItemName = trItem(it.name);

          card.className = 'fvh-catalogue-card r-' + rarKey + (isOwned ? ' owned' : '') + (isBoost ? ' fvh-boost-card' : '');

          var tagHtml = '';
          if (isBoost) {
            if (isArmed) {
              tagHtml = '<span class="fvh-card-owned-tag" style="background:#3b82f6;color:#fff;">✓ ' + tr('boostArmed') + '</span>';
            } else if (boostCharges > 0) {
              tagHtml = '<span class="fvh-card-owned-tag">' + tr('boostCharges', { n: boostCharges }) + '</span>';
            }
          } else if (isOwned) {
            tagHtml = '<span class="fvh-card-owned-tag">✓ ' + tr('inCollection') + '</span>';
          }

          var priceLabel = '';
          if (isBoost) {
            priceLabel = getFvhCoinSvg('inline') + ' <span style="vertical-align:middle;margin-left:4px;">' + it.price + '</span>' + (boostCharges > 0 ? ' · ' + tr('boostCharges', { n: boostCharges }) : '');
          } else {
            priceLabel = isOwned ? tr('inCollection') : (getFvhCoinSvg('inline') + ' <span style="vertical-align:middle;margin-left:4px;">' + it.price + '</span>');
          }

          card.innerHTML =
            '<div class="fvh-card-head">' +
            '<span class="rar ' + rarKey + '">' + localizedRarity + '</span>' +
            tagHtml +
            '</div>' +
            '<div class="fvh-card-thumb-wrap">' +
            renderItemArtwork(it, 'thumb') +
            '</div>' +
            '<div class="fvh-card-title">' + localizedItemName + '</div>' +
            '<div class="fvh-card-price">' + priceLabel + '</div>';

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



  // ==========================================
  // LEADERBOARD / ТАБЛИЦА ЛИДЕРОВ СЕЗОНА 1
  // ==========================================

  function getCategoryUnit(cat) {
    if (cat === 'footy') return '⚽';
    if (cat === 'hoops') return '🏀';
    if (cat === 'coins') return getFvhCoinSvg('inline');
    return tr('pointsContributed');
  }

  function createPodiumColHtml(ath, place, cat) {
    var pClass = 'p' + place;
    var crownHtml = place === 1 ? '<div class="fvh-podium-crown">👑</div>' : '';
    var medalEmoji = place === 1 ? '🥇' : place === 2 ? '🥈' : '🥉';
    var isHoops = (ath.char === 'hoops');
    var avatarSvg = isHoops ? getHoopsAvatarSvg() : getFootyAvatarSvg();
    var teamTag = isHoops ?
      '<span class="fvh-podium-team-tag hoops">🏀 ' + tr('hoopsChar') + '</span>' :
      '<span class="fvh-podium-team-tag footy">⚽ ' + tr('footyChar') + '</span>';

    return '<div class="fvh-podium-col ' + pClass + (isHoops ? ' is-hoops' : ' is-footy') + '">' +
      crownHtml +
      '<div class="fvh-podium-avatar-box ' + (isHoops ? 'hoops-halo' : 'footy-halo') + '">' + avatarSvg + '</div>' +
      '<div class="fvh-podium-name" title="' + ath.name + '">' + ath.name + '</div>' +
      teamTag +
      '<div class="fvh-podium-score">' + ath.score.toLocaleString() + ' <small style="font-size:10px;opacity:0.8;">' + tr('pointsContributed') + '</small></div>' +
      '<div class="fvh-podium-pedestal">' +
      '  <span class="fvh-podium-num">#' + place + '</span>' +
      '  <span class="fvh-podium-medal">' + medalEmoji + '</span>' +
      '</div>' +
      '</div>';
  }

  function fetchLeaderboardData(cat, app, cb) {
    var pid = getAppPlayerId(app);
    var url = '/api/leaderboard?category=' + encodeURIComponent(cat || 'season') + (pid ? '&playerId=' + encodeURIComponent(pid) : '');

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
        fallbackClientLeaderboard(cat, app, finish);
      }, 1800);

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
            fallbackClientLeaderboard(cat, app, finish);
          }
        })
        .catch(function () {
          clearTimeout(timeoutId);
          fallbackClientLeaderboard(cat, app, finish);
        });
    } catch (e) {
      fallbackClientLeaderboard(cat, app, finish);
    }
  }

  function fallbackClientLeaderboard(cat, app, cb) {
    var myData = (app && app.store && app.store.data) || {};
    var myStats = myData.stats || {};
    var myCoins = myData.coins || 0;
    var myXp = myData.xp || 0;
    var myChar = myData.selectedCharacter || 'footy';

    var athletes = [];

    var myEntry = {
      id: 'me',
      name: myData.playerName || (myChar === 'footy' ? 'STRIKER (ВЫ)' : 'FORWARD (ВЫ)'),
      char: myChar,
      club: 'FvH Global Club',
      wins: myStats.wins || 0,
      goals: myStats.goals || 0,
      baskets: myStats.baskets || 0,
      winsFooty: myStats.winsFooty || Math.floor((myStats.wins || 0) * 0.5),
      winsHoops: myStats.winsHoops || Math.floor((myStats.wins || 0) * 0.35),
      coins: myCoins,
      xp: myXp,
      badge: 'ACTIVE',
      isCurrentUser: true
    };
    athletes.push(myEntry);

    function computeScore(ath, c) {
      var wDiff = ath.winsByDiff || {
        easy: Math.floor((ath.wins || 0) * 0.25),
        normal: Math.floor((ath.wins || 0) * 0.5),
        hard: Math.floor((ath.wins || 0) * 0.25)
      };
      // Separate points per AI difficulty: Easy=15, Normal=30, Hard=60
      var winPoints = (wDiff.easy || 0) * 15 + (wDiff.normal || 0) * 30 + (wDiff.hard || 0) * 60;
      var goalsPoints = (ath.goals || 0) * 6;
      var basketsPoints = (ath.baskets || 0) * 3;
      var xpPoints = Math.floor((ath.xp || 0) / 8);

      if (c === 'footy') {
        return (ath.goals || 0) * 10 + Math.round(winPoints * 0.55);
      }
      if (c === 'hoops') {
        return (ath.baskets || 0) * 5 + Math.round(winPoints * 0.45);
      }
      if (c === 'coins') {
        return ath.coins || 0;
      }
      return winPoints + goalsPoints + basketsPoints + xpPoints;
    }

    var ranked = athletes.map(function (a) {
      return Object.assign({}, a, { score: computeScore(a, cat || 'season') });
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

  function renderWarScoreboardAndRankings(body, data, app) {
    var teamFooty = data.teamFootball || { score: 0, pct: 50 };
    var teamHoops = data.teamBasketball || { score: 0, pct: 50 };
    var winningTeam = data.winningTeam || (teamFooty.score >= teamHoops.score ? 'footy' : 'hoops');
    var leadDiff = data.leadDiff || Math.abs(teamFooty.score - teamHoops.score);
    var isFootyWinning = (winningTeam === 'footy');
    var myChar = (app.store && app.store.data && app.store.data.selectedCharacter) || 'footy';

    // 1. Victory Callout Banner
    var victoryBanner = document.createElement('div');
    victoryBanner.className = 'fvh-war-victory-banner ' + winningTeam;
    victoryBanner.innerHTML =
      '<div class="fvh-war-trophy-wrap">🏆</div>' +
      '<div class="fvh-war-victory-info">' +
      '  <div class="fvh-war-victory-badge">' + (isFootyWinning ? tr('teamFootballWins') : tr('teamBasketballWins')) + '</div>' +
      '  <div class="fvh-war-victory-lead">' + tr('leadDiffNotice', { diff: leadDiff.toLocaleString() }) + '</div>' +
      '  <div class="fvh-war-victory-timer">⏳ ' + tr('warSeasonTimer', { d: data.seasonDaysLeft || 14 }) + '</div>' +
      '</div>';
    body.appendChild(victoryBanner);

    // 2. Scoreboard Clash Card
    var scoreboardCard = document.createElement('div');
    scoreboardCard.className = 'fvh-war-scoreboard-card';
    scoreboardCard.innerHTML =
      '<div class="fvh-war-scoreboard-head">' +
      '  <span class="fvh-war-live-pill">🔴 ' + (getActiveLang() === 'ru' ? 'СЕЗОН 1 · ПРЯМОЙ ЭФИР' : 'SEASON 1 · LIVE CLASH') + '</span>' +
      '  <span class="fvh-war-rule-tag">⚡ ' + (getActiveLang() === 'ru' ? 'Кто наберет больше очков — тот победил' : 'Most team points wins the Season') + '</span>' +
      '</div>' +
      '<div class="fvh-war-diff-subhead">🤖 ' + tr('warDiffBreakdown') + '</div>' +
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
      '    <span style="color:var(--text-muted);font-size:11px;">' + (getActiveLang() === 'ru' ? 'Линия противостояния' : 'Frontline tug-of-war') + '</span>' +
      '    <span style="color:#fb923c;font-weight:900;">🏀 ' + teamHoops.pct + '%</span>' +
      '  </div>' +
      '</div>';
    body.appendChild(scoreboardCard);

    // 2b. Season TGE Prize Pool Banner ($FOOTY vs $HOOPS on TON)
    var tgeBanner = document.createElement('div');
    tgeBanner.className = 'fvh-war-tge-banner';
    tgeBanner.innerHTML =
      '<div class="fvh-war-tge-title">💎 ' + tr('warPrizePoolTitle') + '</div>' +
      '<div class="fvh-war-tge-desc">' + tr('warPrizePoolDesc') + '</div>' +
      '<div class="fvh-war-tge-factions">' +
      '  <span class="fvh-tge-faction-pill footy">⚽ ' + tr('warTokenFactionFooty') + '</span>' +
      '  <span class="fvh-tge-faction-vs">VS</span>' +
      '  <span class="fvh-tge-faction-pill hoops">🏀 ' + tr('warTokenFactionHoops') + '</span>' +
      '</div>';
    body.appendChild(tgeBanner);

    // 3. Player Allegiance & Personal Contribution Card
    var myContribScore = (data.player && data.player.score) ? data.player.score : 0;
    var playerCard = document.createElement('div');
    playerCard.className = 'fvh-war-player-card ' + myChar;
    playerCard.innerHTML =
      '<div class="fvh-war-player-avatar ' + (myChar === 'hoops' ? 'hoops-halo' : 'footy-halo') + '">' +
      (myChar === 'hoops' ? getHoopsAvatarSvg() : getFootyAvatarSvg()) +
      '</div>' +
      '<div class="fvh-war-player-info">' +
      '  <div class="fvh-war-player-side-row">' +
      '    <span class="fvh-player-side-badge ' + myChar + '">' +
      (myChar === 'footy' ? '⚽ ' + tr('teamFootball') : '🏀 ' + tr('teamBasketball')) +
      '    </span>' +
      '    <span class="fvh-player-my-badge">' + (getActiveLang() === 'ru' ? 'ВАША КОМАНДА' : 'YOUR TEAM') + '</span>' +
      '  </div>' +
      '  <div class="fvh-war-player-contrib-num">' + tr('yourContribution', { score: myContribScore.toLocaleString() }) + '</div>' +
      '  <div class="fvh-war-tge-subrow">' +
      '    <span class="fvh-war-tge-token-pill">💎 ' + (myChar === 'footy' ? tr('warTokenFactionFooty') : tr('warTokenFactionHoops')) + '</span>' +
      '    <span class="fvh-war-tge-token-sub">' + tr('warQualifyingContrib') + '</span>' +
      '  </div>' +
      '  <div class="fvh-war-player-hint">' +
      (getActiveLang() === 'ru' ?
        'Очки за победу над ИИ: Лёгкий (+15), Обычный (+30), Сложный (+60). Забитый гол/мяч (+6/+3) и XP сразу добавляются к общему счёту вашей команды!' :
        'AI Victory Points: Easy (+15), Normal (+30), Hard (+60). Scored goals (+6/+3) and earned XP directly boost your team\'s total score!') +
      '  </div>' +
      '</div>';
    body.appendChild(playerCard);

    // 4. MVP Standings Header
    var mvpHeader = document.createElement('div');
    mvpHeader.className = 'fvh-war-mvp-head';
    mvpHeader.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin:20px 0 12px;">' +
      '  <div>' +
      '    <h3 style="margin:0 0 2px;font-size:16px;font-weight:900;color:var(--text-pure);">' + tr('warMvpTitle') + '</h3>' +
      '    <div style="font-size:11.5px;color:var(--text-muted);">' + tr('warMvpSubtitle') + '</div>' +
      '  </div>' +
      '  <span style="font-size:11px;font-weight:800;color:#fde047;background:rgba(255,200,0,0.15);padding:4px 10px;border-radius:20px;border:1px solid rgba(255,200,0,0.3);">' +
      '    ТОП-50 MVP' +
      '  </span>' +
      '</div>';
    body.appendChild(mvpHeader);

    // 5. Top 3 Podium
    var topAthletes = data.top || [];
    var top1 = topAthletes[0];
    var top2 = topAthletes[1];
    var top3 = topAthletes[2];
    var rest = topAthletes.slice(3);

    var podium = document.createElement('div');
    podium.className = 'fvh-podium-wrap';
    podium.innerHTML =
      (top2 ? createPodiumColHtml(top2, 2, 'season') : '') +
      (top1 ? createPodiumColHtml(top1, 1, 'season') : '') +
      (top3 ? createPodiumColHtml(top3, 3, 'season') : '');
    body.appendChild(podium);

    // 6. Ranks 4 to 50
    var rowsWrap = document.createElement('div');
    rowsWrap.className = 'fvh-leaderboard-rows';
    rest.forEach(function (ath) {
      var isHoops = (ath.char === 'hoops');
      var row = document.createElement('div');
      row.className = 'fvh-leaderboard-row' + (ath.isCurrentUser ? ' is-me' : '') + (isHoops ? ' row-hoops' : ' row-footy');
      row.innerHTML =
        '<div class="fvh-lb-rank">#' + ath.rank + '</div>' +
        '<div class="fvh-lb-avatar ' + (isHoops ? 'hoops-halo' : 'footy-halo') + '">' +
        (isHoops ? getHoopsAvatarSvg() : getFootyAvatarSvg()) +
        '</div>' +
        '<div class="fvh-lb-info">' +
        '  <div class="fvh-lb-name">' +
        ath.name + (ath.isCurrentUser ? ' <span class="fvh-me-badge">' + (getActiveLang() === 'ru' ? 'ВЫ' : 'YOU') + '</span>' : '') +
        '  </div>' +
        '  <div class="fvh-lb-club">' +
        '    <span class="fvh-team-pill ' + (isHoops ? 'hoops' : 'footy') + '">' + (isHoops ? '🏀 ' + tr('teamBasketball') : '⚽ ' + tr('teamFootball')) + '</span>' +
        '    · ' + (ath.club || 'FvH Club') +
        '  </div>' +
        '</div>' +
        '<div class="fvh-lb-score">' +
        '  <span class="fvh-lb-val">' + ath.score.toLocaleString() + '</span> ' +
        '  <span class="fvh-lb-unit" style="font-size:10px;color:var(--text-muted);">' + tr('pointsContributed') + '</span>' +
        '</div>';
      rowsWrap.appendChild(row);
    });
    body.appendChild(rowsWrap);

    // 7. Docked Current Player Bar
    if (data.player) {
      var sticky = document.createElement('div');
      sticky.className = 'fvh-leaderboard-sticky-player ' + myChar;
      sticky.innerHTML =
        '<div class="fvh-lb-sticky-rank">#' + data.player.rank + '</div>' +
        '<div class="fvh-lb-sticky-avatar ' + (myChar === 'hoops' ? 'hoops-halo' : 'footy-halo') + '">' +
        (myChar === 'hoops' ? getHoopsAvatarSvg() : getFootyAvatarSvg()) +
        '</div>' +
        '<div class="fvh-lb-sticky-info">' +
        '  <div class="fvh-lb-sticky-title">' +
        (myChar === 'footy' ? '⚽ ' + tr('teamFootball') : '🏀 ' + tr('teamBasketball')) + ' · ' + tr('yourRank') +
        '  </div>' +
        '  <div class="fvh-lb-sticky-sub">' +
        (data.player.pointsToNext > 0 ? tr('pointsToNext', { n: data.player.pointsToNext }) : (getActiveLang() === 'ru' ? 'Лидер дивизиона!' : 'Division Leader!')) +
        '  </div>' +
        '</div>' +
        '<div class="fvh-lb-sticky-score">' +
        '  <b>' + data.player.score.toLocaleString() + '</b> ' + tr('pointsContributed') +
        '</div>';
      body.appendChild(sticky);
    }
  }

  function buildLeaderboardPage(app, initialCategory) {
    var curCategory = initialCategory || 'season';
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

    function renderWarLeaderboard() {
      body.innerHTML =
        '<div style="text-align:center;padding:48px 20px;color:var(--text-muted);">' +
        '  <div style="font-size:36px;margin-bottom:10px;animation:fvhPulse 1.2s infinite;">⚡</div>' +
        '  <div style="font-weight:900;letter-spacing:1px;font-size:14px;color:var(--text-pure);">' + (getActiveLang() === 'ru' ? 'СИНХРОНИЗАЦИЯ БИТВЫ КОМАНД...' : 'SYNCING TEAM WAR...') + '</div>' +
        '</div>';

      fetchLeaderboardData('season', app, function (data) {
        body.innerHTML = '';
        renderWarScoreboardAndRankings(body, data, app);
      });
    }

    renderWarLeaderboard();
    container.appendChild(createSharedBottomNav('leaderboard', app));
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
      '<h2 style="margin:2px 0 4px;font-size:22px;">' + (curChar === 'footy' ? 'STRIKER' : 'FORWARD') + '</h2>' +
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
    var lbBtn = document.createElement('button');
    lbBtn.className = 'btn primary small block';
    lbBtn.style.marginTop = '12px';
    lbBtn.innerHTML = '🏆 ' + tr('leaderboard') + ' ➔';
    lbBtn.onclick = function () {
      app.audio.play('click');
      app.go('leaderboard');
    };
    metricsCard.appendChild(lbBtn);
    body.appendChild(metricsCard);

    // 3b. Future TGE Airdrop & Faction Token Card ($FOOTY / $HOOPS)
    var tgeCard = document.createElement('div');
    tgeCard.className = 'fvh-tge-card ' + curChar;

    var qualifyingScore = (stats.wins || 0) * 40 + (stats.goals || 0) * 10 + (stats.baskets || 0) * 10 + (bpState.level || 1) * 50;
    var tokenSym = (curChar === 'footy' ? '$FOOTY' : '$HOOPS');
    var tokenIcon = (curChar === 'footy' ? '⚽' : '🏀');
    var tokenFactionName = (curChar === 'footy' ? tr('warTokenFactionFooty') : tr('warTokenFactionHoops'));
    var userWallet = app.store.data.walletAddress || null;

    function renderTgeCardContent() {
      var isConnected = Boolean(userWallet);
      var displayAddr = isConnected ? (userWallet.length > 14 ? userWallet.slice(0, 6) + '...' + userWallet.slice(-4) : userWallet) : '';

      tgeCard.innerHTML =
        '<div class="fvh-tge-head">' +
        '  <div class="fvh-tge-title">💎 ' + tr('profileTgeCardTitle') + '</div>' +
        '  <span class="fvh-tge-status">🟢 ' + tr('profileTgeStatus') + '</span>' +
        '</div>' +
        '<div class="fvh-tge-token-hero">' +
        '  <div class="fvh-tge-token-icon ' + curChar + '">' + tokenIcon + '</div>' +
        '  <div class="fvh-tge-token-details">' +
        '    <div class="fvh-tge-token-sym ' + curChar + '">' + tokenSym + '</div>' +
        '    <div class="fvh-tge-token-network">' + tokenFactionName + ' · TON Blockchain</div>' +
        '  </div>' +
        '</div>' +
        '<div class="fvh-tge-stats-grid">' +
        '  <div class="fvh-tge-stat-box">' +
        '    <div class="fvh-tge-stat-label">🎯 ' + tr('profileTgePoints') + '</div>' +
        '    <div class="fvh-tge-stat-val">' + qualifyingScore.toLocaleString() + ' pts</div>' +
        '    <div class="fvh-tge-stat-sub">' + tr('profileTgePointsDesc') + '</div>' +
        '  </div>' +
        '  <div class="fvh-tge-stat-box">' +
        '    <div class="fvh-tge-stat-label">🪙 FvH Coin</div>' +
        '    <div class="fvh-tge-stat-val">' + (app.store.data.coins || 0).toLocaleString() + ' FvH</div>' +
        '    <div class="fvh-tge-stat-sub">' + tr('profileTgeCurrencyNotice') + '</div>' +
        '  </div>' +
        '</div>' +
        '<div class="fvh-tge-wallet-wrap">' +
        '  <div class="fvh-tge-wallet-head">' +
        '    <span class="fvh-tge-wallet-title">👛 ' + tr('profileTgeWalletTitle') + '</span>' +
        '    <span class="fvh-tge-wallet-status ' + (isConnected ? 'connected' : 'not-connected') + '">' +
        (isConnected ? ('✓ ' + tr('profileTgeWalletConnected')) : tr('profileTgeWalletNotConnected')) +
        '    </span>' +
        '  </div>' +
        (isConnected ?
          '<div class="fvh-tge-wallet-addr-row">' +
          '  <span class="fvh-tge-addr-text">' + displayAddr + '</span>' +
          '  <div style="display:flex;gap:6px;">' +
          '    <button class="btn small fvh-tge-btn-edit">' + tr('profileTgeChangeBtn') + '</button>' +
          '    <button class="btn small danger fvh-tge-btn-del">' + tr('profileTgeDisconnectBtn') + '</button>' +
          '  </div>' +
          '</div>' :
          '<button class="btn primary small block fvh-tge-btn-connect">' + tr('profileTgeConnectBtn') + '</button>') +
        '</div>' +
        '<div class="fvh-tge-security-note">' + tr('profileTgeSecurityWarning') + '</div>' +
        '<div class="fvh-tge-legal-note">' + tr('profileTgeLaunchNotice') + '</div>';

      var connectBtn = tgeCard.querySelector('.fvh-tge-btn-connect');
      if (connectBtn) connectBtn.onclick = openWalletLinkModal;

      var editBtn = tgeCard.querySelector('.fvh-tge-btn-edit');
      if (editBtn) editBtn.onclick = openWalletLinkModal;

      var delBtn = tgeCard.querySelector('.fvh-tge-btn-del');
      if (delBtn) delBtn.onclick = function () {
        app.audio.play('click');
        app.store.update(function (d) {
          d.walletAddress = null;
        });
        userWallet = null;
        renderTgeCardContent();
      };
    }

    function openWalletLinkModal() {
      app.audio.play('click');
      var overlay = document.createElement('div');
      overlay.className = 'modal-back';
      var modal = document.createElement('div');
      modal.className = 'modal';
      modal.innerHTML =
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">' +
        '  <h3 style="margin:0;font-size:16px;font-weight:900;">👛 ' + tr('profileTgeModalTitle') + '</h3>' +
        '  <button class="modal-close-x" style="width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:#fff;cursor:pointer;">✕</button>' +
        '</div>' +
        '<p style="font-size:12px;color:var(--text-muted);margin:0 0 12px;line-height:1.4;">' + tr('profileTgeModalDesc') + '</p>' +
        '<div style="margin-bottom:12px;">' +
        '  <input type="text" id="fvh-tge-input-wallet" class="fvh-input-wallet" value="' + (userWallet || '') + '" placeholder="' + tr('profileTgeAddressPlaceholder') + '" style="width:100%;box-sizing:border-box;padding:10px 12px;border-radius:8px;background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.2);color:#fff;font-family:monospace;font-size:13px;">' +
        '</div>' +
        '<div style="font-size:11px;color:#f59e0b;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);border-radius:8px;padding:8px 10px;margin-bottom:14px;line-height:1.35;">' +
        tr('profileTgeSecurityWarning') +
        '</div>' +
        '<div style="display:flex;gap:8px;">' +
        '  <button class="btn block fvh-btn-cancel" style="flex:1;">' + (getActiveLang() === 'ru' ? 'Отмена' : 'Cancel') + '</button>' +
        '  <button class="btn primary block fvh-btn-save-wallet" style="flex:2;">' + tr('profileTgeSaveBtn') + '</button>' +
        '</div>';

      modal.querySelector('.modal-close-x').onclick = function () { overlay.remove(); };
      modal.querySelector('.fvh-btn-cancel').onclick = function () { overlay.remove(); };
      modal.querySelector('.fvh-btn-save-wallet').onclick = function () {
        var input = modal.querySelector('#fvh-tge-input-wallet');
        var val = input ? input.value.trim() : '';
        if (!val) {
          app.store.update(function (d) { d.walletAddress = null; });
          userWallet = null;
          overlay.remove();
          renderTgeCardContent();
          return;
        }
        if (val.includes(' ') && val.split(/\s+/).length > 2) {
          alert(tr('profileTgeSeedWarningAlert'));
          return;
        }
        if (val.length < 8) {
          alert(tr('profileTgeInvalidAddress'));
          return;
        }
        app.audio.play('claim');
        app.store.update(function (d) {
          d.walletAddress = val;
        });
        userWallet = val;
        overlay.remove();
        renderTgeCardContent();
      };
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
    }

    renderTgeCardContent();
    body.appendChild(tgeCard);

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

  // High-Reliability Native WebSocket & Server Relay Link for Authoritative Multiplayer
  function RelayLink(matchId, role) {
    this.matchId = matchId;
    this.role = role;
    this.h = {};
    this.open = true;
    this.closed = false;
    this.rtt = 25;
    var self = this;

    // 1. Native WebSocket connection for sub-10ms real-time state sync
    this.ws = null;
    this.wsOpen = false;
    try {
      if (typeof WebSocket !== 'undefined') {
        var wsProto = (window.location.protocol === 'https:') ? 'wss:' : 'ws:';
        var wsUrl = wsProto + '//' + window.location.host + '/ws/match?matchId=' + encodeURIComponent(matchId) + '&role=' + encodeURIComponent(role);
        var ws = new WebSocket(wsUrl);
        this.ws = ws;

        ws.onopen = function () {
          if (self.closed) { ws.close(); return; }
          self.wsOpen = true;
        };

        ws.onmessage = function (evt) {
          if (self.closed) return;
          try {
            var parsed = JSON.parse(evt.data);
            var m = parsed.packet || parsed;
            if (!m.k && parsed.type) {
              m = { k: parsed.type, i: parsed.data, s: parsed.data, l: parsed.data };
            }
            if (self.h.onMessage) self.h.onMessage(m, 'fast');
          } catch (e) {}
        };

        ws.onerror = function () {
          self.wsOpen = false;
        };

        ws.onclose = function () {
          self.wsOpen = false;
        };
      }
    } catch (e) {
      this.wsOpen = false;
    }

    // 2. High-Frequency HTTP Polling Fallback (ensures reliability even if WebSocket is filtered)
    this.pollInterval = setInterval(function () {
      if (self.closed) return;
      // If WebSocket is actively streaming, keep polling minimal
      if (self.wsOpen && Math.random() > 0.08) return;

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
    }, 40); // 25Hz polling fallback
  }

  RelayLink.prototype.sendCtl = function (m) {
    if (this.closed) return;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(m));
        return;
      } catch (e) {}
    }
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
    if (this.ws) {
      try { this.ws.close(); } catch (e) {}
    }
    if (this.h.onClose) this.h.onClose('local');
  };

  // Helper to establish WebRTC or Resilient Server Relay Session between two players
  function startWebRTCSession(app, role, roomCode, myName, oppName, modeOrOpts, onConnect, onError) {
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

          startWebRTCSession(app, matchInfo.role, matchInfo.matchId, playerName, opp.name, {
            mode: matchInfo.mode || curChar,
            minutes: matchInfo.minutes || 2,
            seed: matchInfo.seed,
            arenaId: matchInfo.arenaId
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
          btn.innerHTML = getFvhCoinSvg('inline') + ' ' + arena.price + ' · ' + tr('buyArenaBtn');
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

  // Boost Selector Modal for Practice & Match Setup
  function showModeBoostSelectorModal(app, onArmedChange) {
    var overlay = document.createElement('div');
    overlay.className = 'modal-back fvh-sheet-back';
    var modal = document.createElement('div');
    modal.className = 'modal fvh-item-modal';
    modal.style.maxWidth = '460px';

    var lang = getActiveLang();
    var armed = app.store.data.armedBoost;
    var charges = app.store.data.boostCharges || {};

    var listHtml = BOOST_CATALOG.map(function (b) {
      var ch = charges[b.id] || 0;
      var isArmed = (armed === b.id);
      var isAct = b.type === 'active';
      return '<div class="fvh-boost-select-item ' + (isArmed ? 'is-armed' : '') + '" style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:rgba(255,255,255,0.04);border-radius:10px;border:1px solid ' + (isArmed ? '#38bdf8' : 'rgba(255,255,255,0.08)') + ';margin-bottom:8px;">' +
        '  <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:0;">' +
        '    <div style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;">' + renderItemArtwork(b, 'thumb') + '</div>' +
        '    <div style="min-width:0;text-align:left;">' +
        '      <div style="display:flex;align-items:center;gap:6px;">' +
        '        <span style="font-weight:800;font-size:13px;color:#fff;">' + trItem(b.name) + '</span>' +
        '        <span class="fvh-boost-type-tag ' + b.type + '" style="font-size:9px;padding:1px 5px;">' + (isAct ? '⚡ ' + tr('boostActiveType') : '🛡️ ' + tr('boostPassiveType')) + '</span>' +
        '      </div>' +
        '      <div style="font-size:11px;color:var(--text-muted);margin:2px 0;">' + tr(b.descKey) + '</div>' +
        '      <div style="font-size:10px;color:' + (ch > 0 ? '#4ade80' : 'var(--text-muted)') + ';font-weight:700;">' + tr('boostCharges', { n: ch }) + (isAct ? ' · 12s Overdrive' : ' · ' + (lang === 'ru' ? 'Весь матч' : 'Full Match')) + '</div>' +
        '    </div>' +
        '  </div>' +
        '  <div style="margin-left:8px;flex-shrink:0;">' +
        (isArmed
          ? '<button class="btn small disarm-btn" data-id="' + b.id + '">✕ ' + tr('boostDisarm') + '</button>'
          : ch > 0
            ? '<button class="btn small primary arm-btn" data-id="' + b.id + '">⚡ ' + tr('boostArm') + '</button>'
            : '<button class="btn small buy-btn" data-id="' + b.id + '" style="font-size:11px;">🛒 ' + tr('boostBuyMore') + '</button>'
        ) +
        '  </div>' +
        '</div>';
    }).join('');

    modal.innerHTML =
      '<div class="fvh-sheet-handle"></div>' +
      '<div class="fvh-item-modal-head">' +
      '<span class="rar epic">⚡ ' + tr('catBoosts').toUpperCase() + '</span>' +
      '<button class="modal-close-x" aria-label="Close">✕</button>' +
      '</div>' +
      '<h2 style="margin:4px 0 6px;font-size:18px;color:#fff;">' + tr('selectBoostPrompt') + '</h2>' +
      '<div style="font-size:11.5px;color:var(--text-muted);background:rgba(255,255,255,0.04);border-radius:8px;padding:8px 12px;margin-bottom:12px;line-height:1.4;text-align:left;">' +
      '💡 <b>' + (lang === 'ru' ? 'Как работают бусты' : 'How Boosts Work') + ':</b><br>' +
      '• <b>' + tr('boostActiveType') + '</b>: ' + tr('boostActiveDesc') + '.<br>' +
      '• <b>' + tr('boostPassiveType') + '</b>: ' + tr('boostPassiveDesc') + '.<br>' +
      '<span style="color:#fde047;font-size:10.5px;">✓ ' + (lang === 'ru' ? 'Заряд расходуется ТОЛЬКО после старта матча (при отмене заряд не теряется).' : 'Charge is consumed ONLY upon match start (never if cancelled).') + '</span>' +
      '</div>' +
      '<div class="fvh-boost-modal-list" style="max-height:280px;overflow-y:auto;margin-bottom:12px;">' +
      listHtml +
      '</div>' +
      '<div style="display:flex;gap:8px;">' +
      (armed ? '<button class="btn block clear-boost-btn">✕ ' + tr('noBoostEquipped') + '</button>' : '') +
      '<button class="btn primary block close-modal-btn">' + tr('close') + '</button>' +
      '</div>';

    modal.querySelector('.modal-close-x').onclick = function () { overlay.remove(); };
    var closeBtn = modal.querySelector('.close-modal-btn');
    if (closeBtn) closeBtn.onclick = function () { overlay.remove(); };
    overlay.onclick = function (e) { if (e.target === overlay) overlay.remove(); };

    var clearBtn = modal.querySelector('.clear-boost-btn');
    if (clearBtn) {
      clearBtn.onclick = function () {
        var pid = getAppPlayerId(app);
        safeEconomyApi('/api/economy/equip', { playerId: pid, slot: 'boost', itemId: 'none' }).then(function () {
          app.store.update(function (d) { d.armedBoost = null; });
          app.audio.play('click');
          overlay.remove();
          if (onArmedChange) onArmedChange();
        });
      };
    }

    modal.querySelectorAll('.arm-btn').forEach(function (btn) {
      btn.onclick = function () {
        var bId = btn.dataset.id;
        var pid = getAppPlayerId(app);
        safeEconomyApi('/api/economy/equip', { playerId: pid, slot: 'boost', itemId: bId }).then(function (res) {
          if (res && res.error === 'item_not_owned') {
            app.audio.play('error');
            showToast('⚠️ No charges remaining');
            return;
          }
          app.store.update(function (d) { d.armedBoost = bId; });
          app.audio.play('claim');
          var bDef = BOOST_CATALOG.find(function (x) { return x.id === bId; });
          showToast(tr('boostArmed') + ': ' + trItem(bDef ? bDef.name : bId));
          overlay.remove();
          if (onArmedChange) onArmedChange();
        });
      };
    });

    modal.querySelectorAll('.disarm-btn').forEach(function (btn) {
      btn.onclick = function () {
        var pid = getAppPlayerId(app);
        safeEconomyApi('/api/economy/equip', { playerId: pid, slot: 'boost', itemId: 'none' }).then(function () {
          app.store.update(function (d) { d.armedBoost = null; });
          app.audio.play('click');
          overlay.remove();
          if (onArmedChange) onArmedChange();
        });
      };
    });

    modal.querySelectorAll('.buy-btn').forEach(function (btn) {
      btn.onclick = function () {
        var bId = btn.dataset.id;
        var bDef = BOOST_CATALOG.find(function (x) { return x.id === bId; });
        if (!bDef) return;
        var coins = app.store.data.coins || 0;
        if (coins < bDef.price) {
          app.audio.play('error');
          showToast(tr('notEnoughCoins'));
          return;
        }
        var pid = getAppPlayerId(app);
        safeEconomyApi('/api/economy/purchase', {
          playerId: pid,
          itemId: bId,
          idempotencyKey: 'mode_boost_' + pid + '_' + bId + '_' + Date.now()
        }).then(function (res) {
          if (res && res.ok) {
            app.store.update(function (d) {
              d.coins = res.coins;
              d.xp = res.xp;
              d.owned = res.owned;
              d.packs = res.packs;
              d.boostCharges = res.boostCharges;
              d.armedBoost = bId;
            });
          } else {
            app.store.update(function (d) {
              d.coins -= bDef.price;
              if (!d.boostCharges) d.boostCharges = {};
              d.boostCharges[bId] = (d.boostCharges[bId] || 0) + 1;
              d.armedBoost = bId;
            });
          }
          app.audio.play('claim');
          showToast(tr('purchaseSuccess') + ' (' + trItem(bDef.name) + ' +1)');
          overlay.remove();
          if (onArmedChange) onArmedChange();
        });
      };
    });

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
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

    // Arena Selection Banner at top of Mode Selection
    var currentArenaId = (app.store.data.equipped && (app.store.data.equipped['stadium.' + curChar] || app.store.data.equipped.stadium)) || (curChar === 'hoops' ? 'std_hoops_street' : 'std_footy_classic');
    var currentArenaDef = SCENIC_ARENAS_CATALOG.find(function (a) { return a.id === currentArenaId; }) || (curChar === 'hoops' ? { name: 'Street Classic', icon: '🏀' } : { name: 'Classic Grass', icon: '🏟️' });

    var arenaBanner = document.createElement('div');
    arenaBanner.className = 'fvh-mode-arena-banner';
    arenaBanner.style.cursor = 'pointer';
    arenaBanner.innerHTML =
      '<div class="fvh-mode-arena-left">' +
      '  <span class="fvh-mode-arena-icon">' + (currentArenaDef.icon || '🏟️') + '</span>' +
      '  <div>' +
      '    <div class="fvh-mode-arena-sub">' + tr('homeArena') + '</div>' +
      '    <div class="fvh-mode-arena-name">' + trItem(currentArenaDef.name) + '</div>' +
      '  </div>' +
      '</div>' +
      '<button class="btn small primary" style="white-space:nowrap;">🏟️ ' + tr('arenaSelectTitle') + ' ➔</button>';

    arenaBanner.onclick = function () {
      app.audio.play('click');
      app.show(buildArenaSelectPage(app), 'arenas');
    };
    body.appendChild(arenaBanner);

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
        '<div class="fvh-mode-desc">' + (lang === 'ru' ? 'Сражайтесь против компьютерного соперника, оттачивайте мастерство и зарабатывайте очки в Битву Команд!' : 'Battle against AI opponent, master your skills, and earn Team War leaderboard points!') + '</div>' +
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
          '<div class="fvh-diff-reward-pill" id="fvh-diff-reward-info"></div>' +
          '<div class="fvh-ctrl-row fvh-ctrl-boost-row">' +
            '<span class="fvh-ctrl-label">' + tr('catBoosts') + ':</span>' +
            '<div class="fvh-mode-boost-box" id="fvh-mode-boost-trigger" style="cursor:pointer;">' +
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

    function updateDiffRewardPill(dVal) {
      var pill = practiceCard.querySelector('#fvh-diff-reward-info');
      if (!pill) return;
      if (dVal === 'easy') {
        pill.className = 'fvh-diff-reward-pill easy';
        pill.textContent = tr('diffEasyReward');
      } else if (dVal === 'hard') {
        pill.className = 'fvh-diff-reward-pill hard';
        pill.textContent = tr('diffHardReward');
      } else {
        pill.className = 'fvh-diff-reward-pill normal';
        pill.textContent = tr('diffNormalReward');
      }
    }

    // Interactive Difficulty selector
    practiceCard.querySelectorAll('.seg-diff button').forEach(function (b) {
      b.onclick = function () {
        practiceCard.querySelectorAll('.seg-diff button').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        selDiff = b.dataset.diff;
        updateDiffRewardPill(selDiff);
        app.audio.play('click');
      };
    });
    updateDiffRewardPill(selDiff);

    function updatePracticeBoostBox() {
      var boostBox = practiceCard.querySelector('#fvh-mode-boost-trigger');
      if (!boostBox) return;
      var armedId = app.store.data.armedBoost;
      var boostCharges = app.store.data.boostCharges || {};
      if (armedId) {
        var bDef = BOOST_CATALOG.find(function (b) { return b.id === armedId; }) || { name: armedId, icon: '⚡', type: 'active' };
        var ch = boostCharges[armedId] || 0;
        boostBox.innerHTML =
          '<div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0;">' +
          '  <span style="font-size:22px;line-height:1;">' + bDef.icon + '</span>' +
          '  <div style="min-width:0;text-align:left;">' +
          '    <div style="font-weight:800;font-size:12px;color:#fff;display:flex;align-items:center;gap:6px;">' +
          '      ' + trItem(bDef.name) +
          '      <span class="fvh-boost-type-tag ' + bDef.type + '" style="font-size:9px;padding:1px 5px;">' + (bDef.type === 'active' ? '⚡ ' + tr('boostActiveType') : '🛡️ ' + tr('boostPassiveType')) + '</span>' +
          '    </div>' +
          '    <div style="font-size:10.5px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + tr('boostCharges', { n: ch }) + ' · ' + (bDef.type === 'active' ? '12s Overdrive' : tr('boostPassiveDesc')) + '</div>' +
          '  </div>' +
          '</div>' +
          '<button class="btn small" type="button" style="padding:4px 8px;font-size:11px;font-weight:700;">' + tr('changeBoost') + ' ➔</button>';
      } else {
        boostBox.innerHTML =
          '<div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0;">' +
          '  <span style="font-size:20px;opacity:0.5;">⚡</span>' +
          '  <div style="min-width:0;text-align:left;">' +
          '    <div style="font-weight:800;font-size:12px;color:var(--text-muted);">' + tr('noBoostEquipped') + '</div>' +
          '    <div style="font-size:10px;color:var(--text-muted);opacity:0.8;">' + tr('selectBoostPrompt') + '</div>' +
          '  </div>' +
          '</div>' +
          '<button class="btn small" type="button" style="padding:4px 8px;font-size:11px;font-weight:700;">+ ' + tr('boostArm') + '</button>';
      }
    }
    updatePracticeBoostBox();

    var boostTrigger = practiceCard.querySelector('#fvh-mode-boost-trigger');
    if (boostTrigger) {
      boostTrigger.onclick = function () {
        app.audio.play('click');
        showModeBoostSelectorModal(app, function () {
          updatePracticeBoostBox();
        });
      };
    }

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
        boostId: app.store.data.armedBoost
      }, false);
    };

    grid.appendChild(practiceCard);

    // -------------------------------------------------------------
    // CARD 2: Quick Match (Быстрый матч - Онлайн 1v1)
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
    // CARD 3: Private Match (Приватный матч - 1v1 с другом)
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

  // Onboarding & Sport Team Selection Modal (Football vs Basketball)
  function showTeamSelectionModal(app, canClose) {
    window.showTeamSelectionModal = showTeamSelectionModal;
    if (document.querySelector('.fvh-team-modal-back')) return;

    var overlay = document.createElement('div');
    overlay.className = 'modal-back fvh-team-modal-back';

    var modal = document.createElement('div');
    modal.className = 'modal fvh-team-modal';

    var d = app.store.data;
    var curChar = d.selectedCharacter || 'footy';

    var closeBtnHtml = canClose
      ? '<button class="modal-close-x" style="width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;">✕</button>'
      : '';

    modal.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
      '  <span class="fvh-mode-badge clash" style="font-size:11px;padding:3px 10px;">🔥 ' + tr('teamSelectTitle') + '</span>' +
         closeBtnHtml +
      '</div>' +
      '<h2 style="margin:4px 0 6px 0;font-size:20px;font-weight:900;letter-spacing:0.3px;color:#fff;text-align:center;">' + tr('teamSelectTitle') + '</h2>' +
      '<div style="font-size:12px;color:var(--text-muted);text-align:center;margin-bottom:16px;line-height:1.4;">' + tr('teamSelectSubtitle') + '</div>' +
      '<div class="fvh-team-cards-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
      '  <div class="fvh-team-choice-card footy ' + (curChar === 'footy' ? 'selected' : '') + '" style="cursor:pointer;">' +
      '    <div class="fvh-team-card-badge" style="color:#00f0ff;font-size:12px;font-weight:900;">⚽ ' + tr('teamFootyTitle') + '</div>' +
      '    <div class="fvh-team-token-badge footy">💎 ' + tr('teamFootyTokenBadge') + '</div>' +
      '    <div class="fvh-team-avatar-box" style="height:150px;display:flex;align-items:center;justify-content:center;position:relative;">' +
             getCharacterDisplayHtml('footy', 'skin_rookie', { showJerseyTag: false }) +
      '    </div>' +
      '    <div class="fvh-team-card-sub" style="font-size:11px;font-weight:800;color:#fff;margin-top:6px;text-align:center;">' + tr('teamFootySub') + '</div>' +
      '    <div class="fvh-team-card-desc" style="font-size:10px;color:var(--text-muted);margin:6px 0 6px 0;line-height:1.3;text-align:center;">' + tr('teamFootyDesc') + '</div>' +
      '    <div class="fvh-team-token-desc">' + tr('teamFootyTokenDesc') + '</div>' +
      '    <button class="btn block fvh-btn-choose-footy">' + tr('teamFootyBtn') + ' ▶</button>' +
      '  </div>' +
      '  <div class="fvh-team-choice-card hoops ' + (curChar === 'hoops' ? 'selected' : '') + '" style="cursor:pointer;">' +
      '    <div class="fvh-team-card-badge" style="color:#f97316;font-size:12px;font-weight:900;">🏀 ' + tr('teamHoopsTitle') + '</div>' +
      '    <div class="fvh-team-token-badge hoops">💎 ' + tr('teamHoopsTokenBadge') + '</div>' +
      '    <div class="fvh-team-avatar-box" style="height:150px;display:flex;align-items:center;justify-content:center;position:relative;">' +
             getCharacterDisplayHtml('hoops', 'skin_solar', { showJerseyTag: false }) +
      '    </div>' +
      '    <div class="fvh-team-card-sub" style="font-size:11px;font-weight:800;color:#fff;margin-top:6px;text-align:center;">' + tr('teamHoopsSub') + '</div>' +
      '    <div class="fvh-team-card-desc" style="font-size:10px;color:var(--text-muted);margin:6px 0 6px 0;line-height:1.3;text-align:center;">' + tr('teamHoopsDesc') + '</div>' +
      '    <div class="fvh-team-token-desc">' + tr('teamHoopsTokenDesc') + '</div>' +
      '    <button class="btn block fvh-btn-choose-hoops">' + tr('teamHoopsBtn') + ' ▶</button>' +
      '  </div>' +
      '</div>' +
      '<div class="fvh-team-token-disclaimer">' + tr('teamTokenDisclaimer') + '</div>';

    function selectSide(side) {
      app.audio.play('claim');
      app.store.update(function (storeData) {
        storeData.selectedCharacter = side;
        storeData.teamChosen = true;
      });
      document.querySelectorAll('.fvh-team-modal-back').forEach(function (el) { el.remove(); });
      app.showMenu();
    }

    modal.querySelector('.fvh-btn-choose-footy').onclick = function (e) {
      e.stopPropagation();
      selectSide('footy');
    };
    modal.querySelector('.fvh-team-choice-card.footy').onclick = function () {
      selectSide('footy');
    };

    modal.querySelector('.fvh-btn-choose-hoops').onclick = function (e) {
      e.stopPropagation();
      selectSide('hoops');
    };
    modal.querySelector('.fvh-team-choice-card.hoops').onclick = function () {
      selectSide('hoops');
    };

    if (canClose) {
      var xBtn = modal.querySelector('.modal-close-x');
      if (xBtn) xBtn.onclick = function () { overlay.remove(); };
      overlay.onclick = function (e) {
        if (e.target === overlay) overlay.remove();
      };
    }

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
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
      '<button class="fvh-pill gold" id="fvh-btn-coins" title="' + tr('shop') + '">' + getFvhCoinSvg('inline') + ' ' + (d.coins || 0) + '</button>' +
      '<button class="fvh-pill icon-only" id="fvh-btn-leaderboard" title="' + tr('leaderboard') + '">🏆</button>' +
      '<button class="fvh-pill" id="fvh-btn-profile" title="' + tr('profile') + '">⭐ LVL ' + bpState.level + '</button>' +
      '<button class="fvh-pill icon-only" id="fvh-btn-settings" title="' + tr('settings') + '">⚙️</button>' +
      '</div>';
    screen.appendChild(topbar);

    topbar.querySelector('.fvh-topbar-brand').onclick = function () { app.showMenu(); };
    topbar.querySelector('#fvh-btn-coins').onclick = function () { app.audio.play('click'); app.go('shop'); };
    topbar.querySelector('#fvh-btn-leaderboard').onclick = function () { app.audio.play('click'); app.go('leaderboard'); };
    topbar.querySelector('#fvh-btn-profile').onclick = function () { app.audio.play('click'); app.go('profile'); };
    topbar.querySelector('#fvh-btn-settings').onclick = function () { app.audio.play('click'); app.go('settings'); };

    // 2. Hero Area: Solo Champion Showcase (Shows ONLY the chosen sport hero!)
    var stage = document.createElement('section');
    stage.className = 'fvh-hero-stage solo-stage';

    var curChar = d.selectedCharacter || 'footy';
    var isFooty = (curChar === 'footy');

    var heroCard = document.createElement('div');
    heroCard.className = 'fvh-hero-card solo-hero ' + curChar;

    var badgeText = isFooty ? '⚽ ' + tr('teamFootyTitle') : '🏀 ' + tr('teamHoopsTitle');
    var rivalText = isFooty ? '⚔️ ' + tr('rivalTeamLabel') + ': 🏀 HOOPS' : '⚔️ ' + tr('rivalTeamLabel') + ': ⚽ FOOTY';
    var heroRoleText = isFooty ? tr('teamFootySub') : tr('teamHoopsSub');
    var heroLoreDesc = isFooty ? tr('teamFootyDesc') : tr('teamHoopsDesc');

    heroCard.innerHTML =
      '<div class="fvh-solo-header" style="display:flex;justify-content:space-between;align-items:center;width:100%;margin-bottom:8px;gap:6px;">' +
      '  <span class="fvh-hero-badge ' + curChar + '" style="font-size:11px;padding:3px 8px;font-weight:900;white-space:nowrap;">' + badgeText + '</span>' +
      '  <span class="fvh-solo-rival-pill" style="font-size:10.5px;color:#f59e0b;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.3);padding:3px 8px;border-radius:999px;font-weight:800;white-space:nowrap;">' + rivalText + '</span>' +
      '</div>' +
      '<div class="fvh-hero-avatar-box solo-avatar-box" style="height:230px;position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer;">' +
         getCharacterDisplayHtml(curChar, curChar === 'hoops' ? (d.equipped && (d.equipped['skin.hoops'] || (d.equipped.skin !== 'skin_rookie' ? d.equipped.skin : null))) : (d.equipped && (d.equipped['skin.footy'] || (d.equipped.skin !== 'skin_solar' ? d.equipped.skin : null)))) +
      '</div>' +
      '<div class="fvh-hero-name" style="font-size:22px;font-weight:900;letter-spacing:0.5px;margin-top:6px;text-align:center;">' + (isFooty ? '⚽ FOOTY' : '🏀 HOOPS') + '</div>' +
      '<div class="fvh-hero-role" style="font-size:12.5px;color:var(--text-muted);font-weight:700;margin-top:2px;text-align:center;">' + heroRoleText + '</div>' +
      '<div class="fvh-hero-lore" style="font-size:11px;color:#94a3b8;margin-top:4px;margin-bottom:12px;text-align:center;line-height:1.35;max-width:340px;">' + heroLoreDesc + '</div>' +
      '<div class="fvh-solo-actions-row" style="width:100%;display:flex;justify-content:center;">' +
      '  <button type="button" class="btn fvh-solo-gear-pill" style="width:100%;padding:10px 16px;font-size:12.5px;font-weight:900;border-radius:14px;background:rgba(255,255,255,0.08);border:1.5px solid rgba(255,255,255,0.22);color:#fff;cursor:pointer;white-space:nowrap;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 14px rgba(0,0,0,0.35);"><span>👕</span> <span>' + tr('openLocker') + ' ➔</span></button>' +
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

    // Tapping the card / hero directly opens the locker
    heroCard.onclick = function () {
      app.audio.play('click');
      if (curChar === 'footy') {
        app.openCharacterLocker('footy');
      } else {
        app.openCharacterLocker('hoops');
      }
    };

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

    // 5. Active Season 1 Directives Banner
    var seasonCard = document.createElement('div');
    seasonCard.className = 'fvh-season-hub-card';
    seasonCard.innerHTML =
      '<div class="fvh-season-hub-left">' +
      '<div class="fvh-season-hub-tag">👑 ' + tr('seasonBannerTitle') + '</div>' +
      '<div class="fvh-season-hub-title">' + tr('bpTier', { lvl: bpState.level }) + ' (' + bpState.percent + '% XP)</div>' +
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
          };
          applyTgInsets();
          if (typeof tg.onEvent === 'function') {
            try {
              tg.onEvent('contentSafeAreaChanged', applyTgInsets);
              tg.onEvent('safeAreaChanged', applyTgInsets);
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
      } else if (page === 'leaderboard') {
        app.audio.play('click');
        var catTarget = (opts && opts.category) || 'season';
        app.show(buildLeaderboardPage(app, catTarget), 'leaderboard');
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
                app.show(buildBattlePassPage(app), 'battlepass');
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
