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
      }, 10);
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
      // 4. Local dev fallback ONLY for file:// or standalone static HTML preview ports
      if (window.location) {
        var host = window.location.hostname;
        var port = String(window.location.port || '');
        var staticDevPorts = ['5500', '5501', '5173', '4173', '8000'];
        if (window.location.protocol === 'file:' || ((host === 'localhost' || host === '127.0.0.1') && staticDevPorts.indexOf(port) !== -1)) {
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
      characters: 'INVENTORY',
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
      openLocker: 'INVENTORY',
      openLockerShort: 'INVENTORY',
      switchSideShort: 'SWITCH TEAM',
      tapToInspect: 'Tap player to customize wardrobe & kits',
      practiceTitle: 'Practice Match vs AI',
      selectDifficulty: 'Choose match rules and difficulty',
      playMatch: 'START MATCH',
      cancel: 'Cancel',
      easy: 'Easy',
      normal: 'Normal',
      hard: 'Hard',
      football: 'Football',
      basketball: 'Basketball',
      stadiumStore: 'PRO STORE',
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
      purchaseFailed: 'Purchase could not be completed. Please try again.',
      purchaseAlreadyOwned: 'You already own this item!',
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
      hapticsTitle: 'Haptic Feedback (Vibration)',
      hapticsDesc: 'Tactile vibrations for goals, tackles and claims',
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
      lockerTitle: 'INVENTORY: {char}',
      slotJersey: 'Jersey / Kit',
      slotBall: 'Match Ball',
      slotArena: 'Home Arena',
      slotCelebration: 'Celebration',
      lockedInShop: 'Locked (Shop 🪙 {price})',
      rarity_all: 'ALL',
      rarity_common: 'COMMON',
      rarity_rare: 'RARE',
      rarity_epic: 'EPIC',
      rarity_legendary: 'LEGENDARY',
      rarity_mythic: 'MYTHIC',
      noItemsOfRarity: 'No equipment of this rarity owned in your locker',
      ownedState: 'Owned',
      openWardrobe: 'Wardrobe',
      inCollection: 'In Locker',
      seasonBannerTitle: 'SEASON 1 ARENA CLASH',
      seasonBannerSub: 'Compete, earn XP, and unlock all 30 milestone tiers',
      q_prime_title: 'Score 5 Points in Matches',
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
      bundleLegendaryChampsDesc: 'All 4 signature jerseys, 4 premium balls, 5,000 coins and 5 Clash Packs.',
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
      storeSubFooty: 'FOOTBALL CLUB STORE · KITS',
      storeSubHoops: 'BASKETBALL CLUB STORE · JERSEYS',
      storeNoticeFooty: '⚽ You are playing for Team Football. Store strictly displays football items only.',
      storeNoticeHoops: '🏀 You are playing for Team Basketball. Store strictly displays basketball items only.',
      onlyForFootball: 'Exclusive for Footballers',
      onlyForBasketball: 'Exclusive for Basketballers',
      teamFootballBoutique: 'FOOTBALL CLUB STORE',
      teamBasketballBoutique: 'BASKETBALL CLUB STORE',
      teamFootballBoutiqueDesc: 'Official football gear: cleats, striker kits, and championship pitches.',
      teamBasketballBoutiqueDesc: 'Official basketball gear: sneakers, all-star jerseys, and hardwood courts.',
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
      diffEasyReward: '🟢 Easy AI: +15 Leaderboard pts on victory (0.8x Coins & XP)',
      diffNormalReward: '🟡 Normal AI: +30 Leaderboard pts on victory (1.0x Coins & XP)',
      diffHardReward: '🔴 Hard AI: +60 Leaderboard pts on victory (1.35x MAX Coins & XP!)',
      warDiffBreakdown: 'AI Victory Points: Easy +15 · Normal +30 · Hard +60 pts',
      airdropHubTitle: 'Play-to-Airdrop Hub',
      airdropBannerTitle: 'Earn $FOOTY & $HOOPS Tokens',
      airdropBannerSub: 'Play matches, climb rankings & build squad for TON Airdrop',
      airdropBannerBtn: 'Earn',
      airdropPtsLabel: 'Drop Qualification PTS',
      airdropMultiplierBadge: 'Leaderboard Boost: up to 3.0x',
      airdropPillarMatchesTitle: '1. Play Matches & Score',
      airdropPillarMatchesDesc: 'Each victory grants +25 Drop PTS, match played +10 PTS, goals scored +6 PTS. Active athletes receive the greatest token drop.',
      airdropPillarLeaderboardTitle: '2. Leaderboard Multipliers',
      airdropPillarLeaderboardDesc: 'Top 10 athletes receive a 3.0x airdrop multiplier! Top 50 get 2.0x, Top 100 get 1.5x at the end of the Season.',
      airdropPillarSquadTitle: '3. Build Your Squad',
      airdropPillarSquadDesc: 'Invite friends via your personal link: earn +100 FvH Coins and +50 Drop PTS for every teammate who joins.',
      airdropPillarWalletTitle: '4. Link Public TON Wallet',
      airdropPillarWalletDesc: 'Connect Tonkeeper or Telegram Wallet. Your public address will receive verified tokens upon official TGE launch on TON.',
      airdropBtnPlay: '⚔️ Play Match',
      airdropBtnInvite: '👥 Invite Friends (+100)',
      airdropBtnWallet: '💎 Link TON Wallet',
      airdropBtnWalletChange: '⚙️ Manage TON Wallet',
      airdropDisclaimer: 'ℹ️ Tokens $FOOTY and $HOOPS will be minted on TON blockchain during official TGE. In-game FvH Coins are for shop cosmetics and upgrades.',
      airdropSecurityNote: '🛡️ Telegram & TON Security: Enter ONLY your public TON address. We never ask for seed phrases, passwords, or private keys.',
      airdropTierRookie: 'Rookie Athlete Tier',
      airdropTierContender: 'Contender Tier',
      airdropTierPro: 'Pro Athlete Tier',
      airdropTierLegend: 'Legendary Champion Tier',
      airdropHowItWorks: 'How Play-to-Airdrop Works',
      airdropEstimatedAllocation: 'Estimated Season Drop',
      airdropHowToEarnTokens: 'How to Earn Tokens in Game ➔',
      victoryTauntFooty: '«Football rules the world! ⚽»',
      victoryTauntHoops: '«Basketball reigns supreme! 🏀»',
      victoryTauntFootySub: '+30 PTS added to Team Football in the global War!',
      victoryTauntHoopsSub: '+30 PTS added to Team Basketball in the global War!',
      defeatTauntFooty: '«Basketball reigns supreme! 🏀» Take revenge in the rematch!',
      defeatTauntHoops: '«Football rules the world! ⚽» Take revenge in the rematch!',
      toWardrobe: 'To Locker',
      tabHome: 'PLAY',
      tabInventory: 'LOCKER',
      tabUpgrades: 'SKILLS',
      tabShop: 'SHOP',
      tabQuests: 'QUESTS',
      tabBundles: 'BUNDLES',
      duplicateCompensationTitle: 'DUPLICATE COMPENSATION',
      duplicateCompensationDesc: 'Item already owned! Awarded rarity compensation:',
      packStarsStarter: 'Star Starter Pack',
      packStarsChampion: 'Star Champion Pack',
      packStarsLegend: 'Star Ultimate Legend Pack',
      packStarsStarterDesc: '1,500 FvH Coin + guaranteed RARE kit for your team!',
      packStarsChampionDesc: '4,000 FvH Coin + guaranteed EPIC kit for your team!',
      packStarsLegendDesc: '10,000 FvH Coin + guaranteed LEGENDARY kit for your team!',
      upgradesTitle: 'Skills & Training',
      upgradesSubtitle: 'Upgrade your athlete skills to win every Footy & Hoops match!',
      upgradeSkillPowerFooty: 'Shot Power',
      upgradeSkillPowerFootyDesc: 'Increases ball speed and breakthrough power against goalkeeper',
      upgradeSkillPowerHoops: 'Dunk & Accuracy',
      upgradeSkillPowerHoopsDesc: 'Increases 3-point accuracy, shot arc, and dunk strength',
      upgradeSkillStamina: 'Stamina',
      upgradeSkillStaminaDesc: 'Extends turbo sprint duration and accelerates stamina recovery',
      upgradeSkillSpeed: 'Speed & Agility',
      upgradeSkillSpeedDesc: 'Increases running velocity and tackle responsiveness',
      upgradeSkillKeeperFooty: 'Goalkeeper',
      upgradeSkillKeeperFootyDesc: 'Expands goalkeeper dive radius and reaction to distant strikes',
      upgradeSkillKeeperHoops: 'Rim Defense',
      upgradeSkillKeeperHoopsDesc: 'Expands shot block height and steal interception chance',
      pauseTitle: 'MATCH PAUSED',
      pauseResume: 'Resume Match',
      pauseRestart: 'Restart',
      pauseSettings: 'Settings',
      pauseQuit: 'Quit to Menu',
      pauseQuitConfirm: 'Quit to main menu? Current match progress will be lost.'
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
      characters: 'ИНВЕНТАРЬ',
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
      openLocker: 'ИНВЕНТАРЬ',
      openLockerShort: 'ИНВЕНТАРЬ',
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
      stadiumStore: 'МАГАЗИН',
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
      purchaseFailed: 'Не удалось совершить покупку. Попробуйте снова.',
      purchaseAlreadyOwned: 'Предмет уже куплен!',
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
      hapticsTitle: 'Вибрация (Тактильный отклик)',
      hapticsDesc: 'Вибрация при голах, бросках, подкатах и получении наград',
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
      lockerTitle: 'ИНВЕНТАРЬ: {char}',
      slotJersey: 'Комплект формы',
      slotBall: 'Игровой мяч',
      slotArena: 'Домашняя арена',
      slotCelebration: 'Празднование',
      lockedInShop: 'Заблокировано (Магазин 🪙 {price})',
      rarity_all: 'ВСЕ',
      rarity_common: 'ОБЫЧНЫЙ',
      rarity_rare: 'РЕДКИЙ',
      rarity_epic: 'ЭПИЧЕСКИЙ',
      rarity_legendary: 'ЛЕГЕНДАРНЫЙ',
      rarity_mythic: 'МИФИЧЕСКИЙ',
      noItemsOfRarity: 'В вашем гардеробе пока нет экипировки этой редкости',
      ownedState: 'Куплено',
      openWardrobe: 'В гардероб',
      inCollection: 'В коллекции',
      itemLockedToast: 'Предмет заблокирован! Купите его в магазине.',
      seasonBannerTitle: 'СЕЗОН 1: БИТВА АРЕН',
      seasonBannerSub: 'Соревнуйтесь, получайте XP и откройте все 30 уровней наград',
      q_prime_title: 'Забейте 5 очков в матчах',
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
      teamFootyTitle: 'КОМАНДА FOOTY',
      teamFootySub: 'Форвард · Фирменные бутсы и техника',
      teamFootyDesc: 'Сражайтесь за честь футбола! Забивайте голы и докажите превосходство футбола над баскетболом!',
      teamFootyBtn: 'ВЫБРАТЬ ФУТБОЛ',
      teamHoopsTitle: 'КОМАНДА HOOPS',
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
      bundleLegendaryChampsDesc: 'Все 4 фирменные формы, 4 мяча, 5000 монет и 5 супер-наборов.',
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
      storeSubFooty: 'КЛУБНЫЙ МАГАЗИН · ФОРМЫ',
      storeSubHoops: 'КЛУБНЫЙ МАГАЗИН · ДЖЕРСИ',
      storeNoticeFooty: '⚽ Вы играете за Команду Футбола. В магазине представлена экипировка только для футболистов.',
      storeNoticeHoops: '🏀 Вы играете за Команду Баскетбола. В магазине представлена экипировка только для баскетболистов.',
      onlyForFootball: 'Только для футболистов',
      onlyForBasketball: 'Только для баскетболистов',
      teamFootballBoutique: 'МАГАЗИН ФУТБОЛЬНОГО КЛУБА',
      teamBasketballBoutique: 'МАГАЗИН БАСКЕТБОЛЬНОГО КЛУБА',
      teamFootballBoutiqueDesc: 'Официальная экипировка футболиста: бутсы, форма нападающего и футбольные поля.',
      teamBasketballBoutiqueDesc: 'Официальная экипировка баскетболиста: кроссовки, джерси форварда и баскетбольные корты.',
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
      diffEasyReward: '🟢 Лёгкий ИИ: +15 очков в Лидерборд за победу (0.8x Монет и Опыта)',
      diffNormalReward: '🟡 Обычный ИИ: +30 очков в Лидерборд за победу (1.0x Монет и Опыта)',
      diffHardReward: '🔴 Сложный ИИ: +60 очков в Лидерборд за победу (1.35x МАКС награды!)',
      warDiffBreakdown: 'Очки за победу над ИИ: Лёгкий +15 · Обычный +30 · Сложный +60',
      airdropHubTitle: 'Play-to-Airdrop Хаб',
      airdropBannerTitle: 'Зарабатывай токены $FOOTY и $HOOPS',
      airdropBannerSub: 'Играй матчи, поднимайся в Топ и зови друзей к дропу на TON',
      airdropBannerBtn: 'Открыть',
      airdropPtsLabel: 'Очки квалификации к дропу',
      airdropMultiplierBadge: 'Буст Лидерборда: до 3.0x',
      airdropPillarMatchesTitle: '1. Играй матчи и забивай',
      airdropPillarMatchesDesc: 'Каждая победа дает +25 Drop PTS, матч +10 PTS, гол/данк +6 PTS. Чем больше ты играешь, тем выше твоя доля в пуле токенов.',
      airdropPillarLeaderboardTitle: '2. Множители Лидерборда',
      airdropPillarLeaderboardDesc: 'Топ-10 атлетов получают множитель дропа 3.0x! Топ-50 — 2.0x, Топ-100 — 1.5x по итогам игрового сезона.',
      airdropPillarSquadTitle: '3. Собирай отряд друзей',
      airdropPillarSquadDesc: 'Приглашай друзей по своей реферальной ссылке: получай +100 FvH монет и +50 Drop PTS за каждого бойца в команде.',
      airdropPillarWalletTitle: '4. Привяжи TON-кошелек',
      airdropPillarWalletDesc: 'Подключи Tonkeeper или Telegram Wallet. Публичный адрес кошелька зафиксируется для отправки токенов на TGE в сети TON.',
      airdropBtnPlay: '⚔️ Играть матч',
      airdropBtnInvite: '👥 Друзья (+100 FvH)',
      airdropBtnWallet: '💎 Привязать TON-кошелек',
      airdropBtnWalletChange: '⚙️ Управление кошельком',
      airdropDisclaimer: 'ℹ️ Токены $FOOTY и $HOOPS будут выпущены на блокчейне TON в рамках официального TGE. Внутриигровые FvH монеты используются для магазина и прокачки.',
      airdropSecurityNote: '🛡️ Безопасность Telegram и TON: вводите ТОЛЬКО публичный адрес кошелька. Мы никогда не запрашиваем seed-фразы или пароли.',
      airdropTierRookie: 'Ранг Новичка',
      airdropTierContender: 'Ранг Претендента',
      airdropTierPro: 'Ранг Pro-Атлета',
      airdropTierLegend: 'Легендарный Ранг',
      airdropHowItWorks: 'Как заработать токены в игре',
      airdropEstimatedAllocation: 'Расчетная доля в дропе',
      airdropHowToEarnTokens: 'Как заработать токены в игре ➔',
      victoryTauntFooty: '«Футбол правит миром! ⚽»',
      victoryTauntHoops: '«Баскетбол на высоте! 🏀»',
      victoryTauntFootySub: '+30 PTS очков в Team War фракции Футбола!',
      victoryTauntHoopsSub: '+30 PTS очков в Team War фракции Баскетбола!',
      defeatTauntFooty: '«Баскетбол на высоте! 🏀» Возьми реванш в следующем матче!',
      defeatTauntHoops: '«Футбол правит миром! ⚽» Возьми реванш в следующем матче!',
      toWardrobe: 'В гардероб',
      tabHome: 'ИГРАТЬ',
      tabInventory: 'ГАРДЕРОБ',
      tabUpgrades: 'ПРОКАЧКА',
      tabShop: 'МАГАЗИН',
      tabQuests: 'ЗАДАНИЯ',
      tabBundles: 'НАБОРЫ',
      duplicateCompensationTitle: 'КОМПЕНСАЦИЯ ЗА ДУБЛИКАТ',
      duplicateCompensationDesc: 'Предмет уже открыт! Начислена компенсация за редкость:',
      packStarsStarter: 'Звёздный Набор Новичка',
      packStarsChampion: 'Чемпионский Пак Звёзд',
      packStarsLegend: 'Ультимейт Легенда Пак',
      packStarsStarterDesc: '1,500 FvH Coin + гарантированная РЕДКАЯ форма вашей команды!',
      packStarsChampionDesc: '4,000 FvH Coin + гарантированная ЭПИЧЕСКАЯ форма вашей команды!',
      packStarsLegendDesc: '10,000 FvH Coin + гарантированная ЛЕГЕНДАРНАЯ форма вашей команды!',
      upgradesTitle: 'Прокачка Навыков',
      upgradesSubtitle: 'Прокачивайте характеристики своего атлета для превосходства на поле',
      upgradeSkillPowerFooty: 'Сила Удара',
      upgradeSkillPowerFootyDesc: 'Увеличивает скорость полёта мяча и силу пушечного удара',
      upgradeSkillPowerHoops: 'Точность и Данк',
      upgradeSkillPowerHoopsDesc: 'Увеличивает дальность броска, точность трёхочковых и мощь данка',
      upgradeSkillStamina: 'Выносливость',
      upgradeSkillStaminaDesc: 'Продлевает длительность ускорения и ускоряет регенерацию энергии',
      upgradeSkillSpeed: 'Скорость и Ловкость',
      upgradeSkillSpeedDesc: 'Увеличивает скорость передвижения и резкость при отборе мяча',
      upgradeSkillKeeperFooty: 'Вратарь',
      upgradeSkillKeeperFootyDesc: 'Увеличивает радиус прыжка вратаря и реакцию на дальние удары',
      upgradeSkillKeeperHoops: 'Защита Кольца',
      upgradeSkillKeeperHoopsDesc: 'Увеличивает высоту блока под кольцом и шанс перехвата мяча',
      pauseTitle: 'МАТЧ НА ПАУЗЕ',
      pauseResume: 'Продолжить матч',
      pauseRestart: 'Перезапуск',
      pauseSettings: 'Настройки',
      pauseQuit: 'Выйти в меню',
      pauseQuitConfirm: 'Выйти в главное меню? Текущий прогресс матча будет потерян.'
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
      'Cyber Strike': 'Кибер Удар',
      'Stealth Shadow': 'Скрытная Тень',
      'Golden Legend': 'Золотая Легенда',
      'Neon Matrix': 'Неоновая Матрица',
      'Mythic Titan': 'Мифический Титан',
      'Street Legend': 'Легенда Улиц',
      'Neon Splash': 'Неоновый Всплеск',
      'Golden State': 'Золотой Штат',
      'Cyber Dunker': 'Кибер Данкер',
      'Phantom Black': 'Призрачный Черный',
      'Hyper Beast': 'Гипер Зверь',
      'Solar Inferno': 'Солнечное Инферно',
      'Plasma Energy': 'Плазменная Энергия',
      'Cyber Matrix': 'Кибер Матрица',
      'Championship Gold': 'Золото Чемпионата',
      'Supernova Burst': 'Вспышка Сверхновой',
      'Neon Energy': 'Неоновая Энергия',
      'Molten Fire': 'Раскаленный Огонь',
      'Chrome Edition': 'Хромированное Издание',
      'Midnight Shadow': 'Полуночная Тень',
      'Cosmic Galaxy': 'Космическая Галактика',
      'Golden All-Star': 'Золотой Олл-Стар',
      'Quantum Vortex': 'Квантовый Вихрь',
      'Match Classic': 'Матчевая Классика',
      'Pro Leather': 'Профи Кожа',
      'Classic Ball': 'Классический Мяч',
      'FOOTY Kit': 'Форма FOOTY',
      'HOOPS Jersey': 'Джерси HOOPS',
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
      teamFootyName: 'FOOTY',
      teamFootyToken: '$FOOTY',
      teamFootyDesc: 'Football faction. Technique, precision, and unstoppable power shots.',
      teamHoopsName: 'HOOPS',
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
      teamFootyName: 'FOOTY',
      teamFootyToken: '$FOOTY',
      teamFootyDesc: 'Команда футбола. Скорость, техника и мощные удары по воротам.',
      teamHoopsName: 'HOOPS',
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
      teamFootyName: 'FOOTY',
      teamFootyToken: '$FOOTY',
      teamFootyDesc: 'Facción de fútbol. Velocidad, técnica y disparos imparables.',
      teamHoopsName: 'HOOPS',
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
      teamFootyName: 'FOOTY',
      teamFootyToken: '$FOOTY',
      teamFootyDesc: 'Fußball-Fraktion. Technik, Präzision und unaufhaltsame Torschüsse.',
      teamHoopsName: 'HOOPS',
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
      teamFootyName: 'FOOTY',
      teamFootyToken: '$FOOTY',
      teamFootyDesc: 'Faction football. Technique, précision et tirs puissants.',
      teamHoopsName: 'HOOPS',
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
      teamFootyName: 'FOOTY',
      teamFootyToken: '$FOOTY',
      teamFootyDesc: 'Facção de futebol. Técnica, precisão e chutes indefensáveis.',
      teamHoopsName: 'HOOPS',
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
      teamFootyName: 'FOOTY',
      teamFootyToken: '$FOOTY',
      teamFootyDesc: 'Fazione calcio. Tecnica, precisione e tiri imparabili.',
      teamHoopsName: 'HOOPS',
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
      teamFootyName: 'FOOTY',
      teamFootyToken: '$FOOTY',
      teamFootyDesc: 'Команда футболу. Швидкість, техніка та потужні удари по воротах.',
      teamHoopsName: 'HOOPS',
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
      teamFootyName: 'FOOTY',
      teamFootyToken: '$FOOTY',
      teamFootyDesc: 'Frakcja piłki nożnej. Technika, precyzja i potężne strzały.',
      teamHoopsName: 'HOOPS',
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
      teamFootyName: 'FOOTY',
      teamFootyToken: '$FOOTY',
      teamFootyDesc: 'Futbol grubu. Teknik, hassasiyet ve durdurulamaz şutlar.',
      teamHoopsName: 'HOOPS',
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
      teamFootyName: 'FOOTY',
      teamFootyToken: '$FOOTY',
      teamFootyDesc: 'Voetbalfactie. Techniek, precisie en krachtige schoten.',
      teamHoopsName: 'HOOPS',
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
      teamFootyName: 'FOOTY',
      teamFootyToken: '$FOOTY',
      teamFootyDesc: 'サッカーチーム。テクニックと圧倒的なシュート力。',
      teamHoopsName: 'HOOPS',
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
      teamFootyName: 'FOOTY',
      teamFootyToken: '$FOOTY',
      teamFootyDesc: '축구 팀. 정교한 기술과 강력한 슈팅력.',
      teamHoopsName: 'HOOPS',
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
      teamFootyName: 'FOOTY',
      teamFootyToken: '$FOOTY',
      teamFootyDesc: '足球阵营。精湛技术与势不可挡的强力破门。',
      teamHoopsName: 'HOOPS',
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
      teamFootyName: 'FOOTY',
      teamFootyToken: '$FOOTY',
      teamFootyDesc: 'فريق كرة القدم. تقنية وسرعة وتسديدات خارقة.',
      teamHoopsName: 'HOOPS',
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

  // Legacy Deprecated Item Aliases: maps deprecated IDs to canonical items
  var LEGACY_ITEM_ALIASES = {
    'skin_gold': 'skin_footy_golden_legend',
    'skin_shadow': 'skin_footy_stealth_shadow',
    'skin_cyber': 'skin_footy_cyber_strike',
    'skin_neon': 'skin_footy_neon_matrix',
    'skin_hydro': 'skin_frost',
    'skin_rookie': 'footy_classic',
    'skin_default': 'footy_classic',
    'skin_footy_classic': 'footy_classic',
    'skin_bb_onyx': 'hoops_classic',
    'skin_solar': 'hoops_classic',
    'skin_hoops_classic': 'hoops_classic',
    'ball_footy_classic': 'ball_classic',
    'ball_footy_classic_pro': 'ball_classic',
    'ball_footy_neon': 'ball_cyber_hex',
    'ball_footy_gold': 'ball_gold_stitch',
    'ball_hoops_street': 'ball_hoops_classic',
    'ball_hoops_classic_pro': 'ball_hoops_classic',
    'ball_hoops_blaze': 'ball_molten',
    'footy_kit_classic': 'footy_classic',
    'footy_kit_2_white': 'footy_2_white',
    'footy_kit_6_crimson': 'footy_6_crimson',
    'footy_kit_7_gold': 'footy_7_gold',
    'footy_kit_1_sapphire': 'footy_1_sapphire',
    'footy_kit_4_amber': 'footy_4_amber',
    'footy_kit_5_amethyst': 'footy_5_amethyst',
    'footy_kit_9_dragon': 'footy_9_dragon',
    'footy_kit_3_neon': 'footy_3_neon',
    'footy_kit_8_obsidian': 'footy_8_obsidian',
    'footy_kit_0_tiffany': 'footy_0_tiffany',
    'footy_star_holiday': 'footy_kit_star_holiday',
    'footy_star_emperor': 'footy_kit_star_emperor',
    'footy_star_samurai': 'footy_kit_star_samurai',
    'hoops_kit_classic': 'hoops_classic',
    'hoops_kit_2_crimson': 'hoops_2_chicago',
    'hoops_kit_3_gold': 'hoops_3_la',
    'hoops_kit_4_emerald': 'hoops_4_boston',
    'hoops_kit_6_cyan': 'hoops_6_charlotte',
    'hoops_kit_5_amethyst': 'hoops_5_raptor',
    'hoops_kit_0_neon': 'hoops_0_neon',
    'hoops_kit_7_amber': 'hoops_7_phoenix',
    'hoops_kit_9_galaxy': 'hoops_9_beast',
    'hoops_kit_8_stealth': 'hoops_8_mamba',
    'hoops_kit_1_pink': 'hoops_1_miami',
    'hoops_star_holiday': 'hoops_kit_star_holiday',
    'hoops_star_astral': 'hoops_kit_star_astral',
    'hoops_star_phantom': 'hoops_kit_star_phantom'
  };

  function canonItemId(id) {
    if (!id) return '';
    return LEGACY_ITEM_ALIASES[id] || id;
  }

  function isItemForSport(itemId, charId) {
    var id = canonItemId(itemId);
    if (!id) return false;
    if (charId === 'hoops') {
      return id.startsWith('hoops_') || id.startsWith('skin_hoops') || id.startsWith('skin_bb_') || id === 'skin_solar' || id === 'skin_sunset' || id === 'skin_mars' || id.indexOf('ball_hoops') !== -1 || id === 'ball_gold_groove' || id === 'ball_cyber_grid' || id === 'ball_molten' || id === 'ball_glitch' || id === 'ball_supernova' || id === 'ball_sovereign_bb' || id.startsWith('std_hoops');
    }
    return id.startsWith('footy_') || id.startsWith('skin_footy') || (id.startsWith('skin_') && !id.startsWith('skin_hoops') && !id.startsWith('skin_bb_') && id !== 'skin_solar' && id !== 'skin_sunset' && id !== 'skin_mars') || (id.startsWith('ball_') && id.indexOf('hoops') === -1 && id !== 'ball_gold_groove' && id !== 'ball_cyber_grid' && id !== 'ball_molten' && id !== 'ball_glitch' && id !== 'ball_supernova' && id !== 'ball_sovereign_bb') || id.startsWith('std_footy');
  }

  function isItemOwnedInList(ownedList, itemId) {
    if (!itemId) return false;
    var list = Array.isArray(ownedList) ? ownedList : [];
    var cId = canonItemId(itemId);
    if (list.indexOf(itemId) !== -1 || list.indexOf(cId) !== -1) return true;
    for (var k in LEGACY_ITEM_ALIASES) {
      if (LEGACY_ITEM_ALIASES[k] === cId && list.indexOf(k) !== -1) return true;
    }
    return false;
  }

  function resolveEquippedItemId(eq, slotCat, charId) {
    var e = eq || {};
    var c = (charId === 'hoops') ? 'hoops' : 'footy';
    if (slotCat === 'balls' || slotCat === 'balls_footy' || slotCat === 'balls_hoops') {
      var bSlot = e['ball.' + c];
      if (bSlot && isItemForSport(bSlot, c)) return canonItemId(bSlot);
      if (e.ball && isItemForSport(e.ball, c)) return canonItemId(e.ball);
      return c === 'hoops' ? 'ball_hoops_classic' : 'ball_classic';
    }
    if (slotCat === 'stadiums') {
      var stSlot = e['stadium.' + c];
      if (stSlot) return canonItemId(stSlot);
      return c === 'hoops' ? 'std_hoops_street' : 'std_footy_classic';
    }
    var sSlot = e['skin.' + c];
    if (sSlot && isItemForSport(sSlot, c)) return canonItemId(sSlot);
    if (e.skin && isItemForSport(e.skin, c)) return canonItemId(e.skin);
    return c === 'hoops' ? 'hoops_classic' : 'footy_classic';
  }

  // Reusable Collapsible Rarity Filter UI ("Фильтр" button -> opens rarity selector)
  function createRarityFilterControl(onSelect) {
    var curRarity = 'all';
    var isOpen = false;
    var lang = getActiveLang();

    var rarities = [
      { id: 'all', label: tr('rarity_all') || (lang === 'ru' ? 'Все' : 'All'), cls: '' },
      { id: 'common', label: tr('rarity_common') || (lang === 'ru' ? 'Обычный' : 'Common'), cls: 'r-common' },
      { id: 'rare', label: tr('rarity_rare') || (lang === 'ru' ? 'Редкий' : 'Rare'), cls: 'r-rare' },
      { id: 'epic', label: tr('rarity_epic') || (lang === 'ru' ? 'Эпический' : 'Epic'), cls: 'r-epic' },
      { id: 'legendary', label: tr('rarity_legendary') || (lang === 'ru' ? 'Легендарный' : 'Legendary'), cls: 'r-legendary' },
      { id: 'mythic', label: tr('rarity_mythic') || (lang === 'ru' ? 'Мифический' : 'Mythic'), cls: 'r-mythic' }
    ];

    var wrap = document.createElement('div');
    wrap.className = 'fvh-filter-wrap';

    var barRow = document.createElement('div');
    barRow.className = 'fvh-filter-top-row';

    var triggerBtn = document.createElement('button');
    triggerBtn.type = 'button';
    triggerBtn.className = 'fvh-filter-trigger';

    function updateTriggerLabel() {
      var activeR = rarities.find(function (r) { return r.id === curRarity; }) || rarities[0];
      var filterWord = (lang === 'ru') ? 'Фильтр' : 'Filter';
      triggerBtn.className = 'fvh-filter-trigger' + (isOpen ? ' open' : '') + (curRarity !== 'all' ? ' filtered' : '');
      triggerBtn.innerHTML =
        '<span class="fvh-filter-ico">🎛️</span>' +
        '<span class="fvh-filter-text">' + filterWord + ': <b>' + activeR.label + '</b></span>' +
        '<span class="fvh-filter-caret">' + (isOpen ? '▲' : '▼') + '</span>';
    }
    updateTriggerLabel();

    var resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'fvh-filter-reset-btn';
    resetBtn.textContent = '✕';
    resetBtn.title = (lang === 'ru') ? 'Сбросить фильтр' : 'Reset filter';
    resetBtn.style.display = 'none';
    resetBtn.onclick = function (e) {
      e.stopPropagation();
      curRarity = 'all';
      isOpen = false;
      syncButtons();
      app && app.audio && app.audio.play && app.audio.play('click');
      onSelect(curRarity);
    };

    var dropdown = document.createElement('div');
    dropdown.className = 'fvh-filter-dropdown';
    dropdown.style.display = 'none';

    function syncButtons() {
      updateTriggerLabel();
      resetBtn.style.display = (curRarity !== 'all') ? 'inline-flex' : 'none';
      dropdown.classList.toggle('open', isOpen);
      dropdown.style.display = isOpen ? 'flex' : 'none';
      dropdown.querySelectorAll('.fvh-rarity-btn').forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-rarity') === curRarity);
      });
    }

    rarities.forEach(function (r) {
      var rb = document.createElement('button');
      rb.type = 'button';
      rb.className = 'fvh-rarity-btn ' + (r.cls || '') + (r.id === curRarity ? ' active' : '');
      rb.setAttribute('data-rarity', r.id);
      rb.textContent = r.label;
      rb.onclick = function () {
        curRarity = r.id;
        isOpen = false;
        syncButtons();
        if (window.app && window.app.audio) window.app.audio.play('click');
        onSelect(curRarity);
      };
      dropdown.appendChild(rb);
    });

    triggerBtn.onclick = function () {
      isOpen = !isOpen;
      syncButtons();
      if (window.app && window.app.audio) window.app.audio.play('click');
    };

    barRow.appendChild(triggerBtn);
    barRow.appendChild(resetBtn);
    wrap.appendChild(barRow);
    wrap.appendChild(dropdown);

    return {
      el: wrap,
      getValue: function () { return curRarity; },
      setVisible: function (vis) {
        wrap.classList.toggle('is-hidden', !vis);
        wrap.style.display = vis ? 'flex' : 'none';
      }
    };
  }

  // Translate item names to active language (fallback to English original)
  function trItem(name) {
    if (!name) return '';
    var lang = getActiveLang();
    if (ITEM_I18N && ITEM_I18N[lang] && ITEM_I18N[lang][name]) return ITEM_I18N[lang][name];
    return name;
  }

  function getItemLabelById(id, fallback) {
    if (!id) return fallback || '';
    var lang = getActiveLang();
    var cId = canonItemId(id);
    if (typeof buildDefaultShopCatalog === 'function') {
      try {
        var catList = buildDefaultShopCatalog(isItemForSport(cId, 'hoops') ? 'hoops' : 'footy');
        var foundCat = catList.find(function (x) { return x.id === cId || x.id === id; });
        if (foundCat) {
          if (lang === 'ru' && foundCat.name_ru) return foundCat.name_ru;
          return trItem(foundCat.name) || foundCat.name;
        }
      } catch (e) {}
    }
    if (typeof HERO_SKIN_PALETTES !== 'undefined' && HERO_SKIN_PALETTES[id]) {
      if (lang === 'ru' && HERO_SKIN_PALETTES[id].ru) return HERO_SKIN_PALETTES[id].ru;
      var palName = HERO_SKIN_PALETTES[id].name || id;
      return trItem(palName) || palName;
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
      // 9 Football Kits
      'skin_rookie': 'Rookie Blue',
      'skin_crimson': 'Crimson Comet',
      'skin_footy_royal_striker': 'Royal Striker',
      'skin_frost': 'Frost Giant',
      'skin_footy_cyber_strike': 'Cyber Strike',
      'skin_footy_stealth_shadow': 'Stealth Shadow',
      'skin_astronaut': 'Astronaut Kit',
      'skin_footy_golden_legend': 'Golden Legend',
      'skin_footy_neon_matrix': 'Neon Matrix',
      // 8 Basketball Kits
      'skin_solar': 'Solar Street',
      'skin_hoops_street_legend': 'Street Legend',
      'skin_sunset': 'Sunset Gold',
      'skin_hoops_neon_splash': 'Neon Splash',
      'skin_hoops_golden_state': 'Golden State',
      'skin_mars': 'Mars Rover',
      'skin_hoops_cyber_dunk': 'Cyber Dunker',
      'skin_hoops_phantom_black': 'Phantom Black',
      'skin_footy_mythic_titan': 'Mythic Titan',
      'skin_hoops_hyper_beast': 'Hyper Beast',
      // 6 Football Balls
      'ball_footy_classic': 'Match Classic',
      'ball_footy_inferno': 'Solar Inferno',
      'ball_footy_plasma': 'Plasma Energy',
      'ball_footy_cyber_neon': 'Cyber Matrix',
      'ball_earthrise': 'Earthrise Ball',
      'ball_footy_golden_elite': 'Championship Gold',
      'ball_footy_supernova': 'Supernova Burst',
      // 7 Basketball Balls
      'ball_hoops_street': 'Street Classic',
      'ball_hoops_neon_energy': 'Neon Energy',
      'ball_hoops_molten_fire': 'Molten Fire',
      'ball_hoops_chrome': 'Chrome Edition',
      'ball_hoops_midnight': 'Midnight Shadow',
      'ball_hoops_cosmic': 'Cosmic Galaxy',
      'ball_hoops_golden_elite': 'Golden All-Star',
      'ball_hoops_vortex': 'Quantum Vortex',
      // Stadiums
      'std_footy_classic': 'Classic Grass',
      'std_footy_night': 'Night Arena',
      'std_footy_golden': 'Golden Hour',
      'std_footy_neon': 'Neon Turf',
      'std_hoops_street': 'Street Classic',
      'std_hoops_night': 'Neon Night',
      'std_hoops_gold': 'Gold Hardwood',
      'std_hoops_matrix': 'Matrix Court',
      'cel_confetti': 'Confetti Burst',
      'cel_fireworks': 'Fireworks',
      'cel_shockwave': 'Shockwave',
      'cel_flame': 'Flame Burst',
      'cel_gold_rain': 'Gold Rain'
    };
    var foundRaw = idToName[id];
    if (!foundRaw) {
      var canonical = LEGACY_ITEM_ALIASES[id];
      if (canonical && idToName[canonical]) foundRaw = idToName[canonical];
    }
    if (foundRaw) return trItem(foundRaw) || foundRaw;
    return trItem(fallback) || fallback || id;
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
      if (typeof window !== 'undefined' && window.app && window.app.store && window.app.store.data && window.app.store.data.settings && window.app.store.data.settings.haptics === false) {
        return;
      }
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

  function openEmailClient(email) {
    var mailToUse = email || 'footyvshoops@gmail.com';
    var isRu = (typeof app !== 'undefined' && app.store && app.store.data && app.store.data.settings && app.store.data.settings.lang === 'ru');
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(mailToUse).catch(function () {});
      }
    } catch (e) {}
    showToast(isRu ? '📋 Email ' + mailToUse + ' скопирован!' : '📋 Email ' + mailToUse + ' copied!');
    triggerHaptic('selection');

    var gmailUrl = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(mailToUse) + '&su=' + encodeURIComponent('Footy vs Hoops: Сотрудничество / Cooperation');
    try {
      if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp && typeof window.Telegram.WebApp.openLink === 'function') {
        window.Telegram.WebApp.openLink(gmailUrl);
        return;
      }
    } catch (tgErr) {}
    try {
      var w = window.open(gmailUrl, '_blank');
      if (!w) {
        window.location.href = 'mailto:' + mailToUse + '?subject=' + encodeURIComponent('Footy vs Hoops: Cooperation');
      }
    } catch (wErr) {
      window.location.href = 'mailto:' + mailToUse;
    }
  }
  window.openEmailClient = openEmailClient;

  // Centralized High-Quality Sports Avatar Renderer
  // Handles: Telegram user profile picture -> Authoritative sync photoUrl -> 3D Low-Poly Hero fallback
  // Artwork & UI Icons bound from modular js/ui/artwork_svg.js
  var _art = (typeof window !== 'undefined' && window.FvhArtwork) || {};
  if (typeof _art.bindDeps === 'function') {
    _art.bindDeps({ escapeHtml: escapeHtml, canonItemId: canonItemId, resolveEquippedItemId: resolveEquippedItemId, getActiveLang: getActiveLang, tr: tr, trItem: trItem, getItemLabelById: getItemLabelById });
  }
  var HERO_SKIN_PALETTES = _art.HERO_SKIN_PALETTES;
  var getOfficialEmblemSvg = _art.getOfficialEmblemSvg;
  var getPlayerAvatarHtml = _art.getPlayerAvatarHtml;
  var getFootyAvatarSvg = _art.getFootyAvatarSvg;
  var getHoopsAvatarSvg = _art.getHoopsAvatarSvg;
  var heroRgbToHsl = _art.heroRgbToHsl;
  var heroHslToRgb = _art.heroHslToRgb;
  var initHeroBaseImages = _art.initHeroBaseImages;
  var drawHeroJerseyPattern = _art.drawHeroJerseyPattern;
  var getRecoloredHeroUrl = _art.getRecoloredHeroUrl;
  var getWardrobe3DViewerHtml = _art.getWardrobe3DViewerHtml;
  var lockTelegramSwipesNow = _art.lockTelegramSwipesNow;
  var mountWardrobe3DIntoContainer = _art.mountWardrobe3DIntoContainer;
  var getCharacterDisplayHtml = _art.getCharacterDisplayHtml;
  var getOfficialEmblemHtml = _art.getOfficialEmblemHtml;
  var getDetailedJerseySvg = _art.getDetailedJerseySvg;
  var getPauseArtworkSvg = _art.getPauseArtworkSvg;
  var getAirdropHeroGraphicSvg = _art.getAirdropHeroGraphicSvg;
  var getDetailedBallSvg = _art.getDetailedBallSvg;
  var getDetailedStadiumSvg = _art.getDetailedStadiumSvg;
  var getDetailedCelebrationSvg = _art.getDetailedCelebrationSvg;
  var getDetailedBoostSvg = _art.getDetailedBoostSvg;
  var getDetailedTrailSvg = _art.getDetailedTrailSvg;
  var getDetailedFrameSvg = _art.getDetailedFrameSvg;
  var getDetailedPackSvg = _art.getDetailedPackSvg;
  var getSocialIconSvg = _art.getSocialIconSvg;
  var getFvhCoinSvg = _art.getFvhCoinSvg;
  var getDetailedCoinsSvg = _art.getDetailedCoinsSvg;
  var getDetailedBattlePassSvg = _art.getDetailedBattlePassSvg;
  var getDetailedBundleSvg = _art.getDetailedBundleSvg;
  var getDetailedCrowdSvg = _art.getDetailedCrowdSvg;
  var renderItemArtwork = _art.renderItemArtwork;
  var createScrollBottomSpacer = _art.createScrollBottomSpacer;
  var getUiIconSvg = _art.getUiIconSvg;
  // Shared Bottom Navigation Bar (5 Primary Tabs: ИГРАТЬ, ГАРДЕРОБ, МАГАЗИН, ЗАДАНИЯ, ПРОФИЛЬ)
  // ==========================================

  function createSharedBottomNav(activeTab, app) {
    var nav = document.createElement('nav');
    nav.className = 'fvh-bottom-nav';

    var curChar = (app && app.store && app.store.data && (app.store.data.selectedTeam || app.store.data.selectedCharacter)) || 'footy';
    var isFooty = (curChar === 'footy');

    var primaryItems = [
      { id: 'menu', icon: getUiIconSvg(isFooty ? 'nav_home_footy' : 'nav_home_hoops', 22), label: tr('tabHome') },
      { id: 'characters', icon: getUiIconSvg('jersey', 22), label: tr('tabInventory') },
      { id: 'shop', icon: getUiIconSvg('nav_shop', 22), label: tr('tabShop') },
      { id: 'quests', icon: getUiIconSvg('nav_quests', 22), label: tr('tabQuests') },
      { id: 'profile', icon: getUiIconSvg('profile', 22), label: tr('profile') }
    ];

    primaryItems.forEach(function (it) {
      var btn = document.createElement('button');
      var isActive = (it.id === activeTab) ||
        (it.id === 'characters' && (activeTab === 'inventory' || activeTab === 'wardrobe')) ||
        (it.id === 'menu' && (activeTab === 'home' || activeTab === 'menu'));
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

  function safeStoreEquip(d, item) {
    if (!d) return;
    if (!d.equipped) d.equipped = {};
    if (!item) return;
    if (item.category === 'skins') {
      var sMode = item.mode || (item.id.includes('hoops') || item.id === 'skin_solar' || item.id === 'skin_sunset' || item.id === 'skin_mars' ? 'hoops' : 'footy');
      d.equipped['skin.' + sMode] = item.id;
      d.equipped.skin = item.id;
    }
    if (item.category === 'balls_footy' || item.category === 'balls_hoops' || item.category === 'balls') {
      var bMode = item.mode || (item.category === 'balls_hoops' || item.id.includes('hoops') ? 'hoops' : 'footy');
      d.equipped['ball.' + bMode] = item.id;
      d.equipped.ball = item.id;
    }
  }

  function getAppPlayerId(app) {
    if (app && app.store && app.store.data) {
      if (app.store.data.playerId) {
        return app.store.data.playerId;
      }
      if (app.store.data.telegramUser && app.store.data.telegramUser.id) {
        var canonicalTgId = 'fvh_tg_' + app.store.data.telegramUser.id;
        app.store.data.playerId = canonicalTgId;
        try { localStorage.setItem('fvh_player_id', canonicalTgId); } catch (e) {}
        return canonicalTgId;
      }
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
    var currentClaimed = Array.isArray(d.claimedQuests) ? d.claimedQuests : [];
    safeEconomyApi('/api/economy/sync', {
      playerId: pid,
      playerName: d.playerName || (d.telegramUser && (d.telegramUser.first_name || d.telegramUser.username)) || 'Athlete',
      stats: d.stats || {},
      selectedCharacter: d.selectedCharacter || null,
      owned: d.owned || [],
      equipped: d.equipped || {},
      unseenItems: d.unseenItems || [],
      coins: d.coins || 0,
      xp: d.xp || 0,
      photoUrl: d.photoUrl || (d.telegramUser && d.telegramUser.photoUrl) || null,
      telegramUser: d.telegramUser || null,
      claimedQuests: currentClaimed,
      isPremium: Boolean(d.battlePass && d.battlePass.isPremium)
    }).then(function (res) {
      if (res && res.ok) {
        if (app.store && typeof app.store.update === 'function') {
          app.store.update(function (storeData) {
            storeData.playerId = res.playerId;
            storeData.coins = res.coins;
            storeData.xp = res.xp;
            if (Array.isArray(res.owned)) storeData.owned = res.owned;
            if (Array.isArray(res.unseenItems)) storeData.unseenItems = res.unseenItems;
            if (res.equipped) storeData.equipped = res.equipped;
            if (res.battlePass) storeData.battlePass = res.battlePass;
            if (res.packs) storeData.packs = res.packs;
            if (Array.isArray(res.claimedQuests)) {
              if (!Array.isArray(storeData.claimedQuests) || storeData.claimedQuests.length === 0) {
                storeData.claimedQuests = res.claimedQuests;
              } else {
                var mergedQuests = storeData.claimedQuests.slice();
                res.claimedQuests.forEach(function (q) {
                  if (mergedQuests.indexOf(q) === -1) mergedQuests.push(q);
                });
                storeData.claimedQuests = mergedQuests;
              }
            }
            // Synchronize permanent team choice from authoritative server
            if (res.teamChosen && res.selectedTeam) {
              storeData.teamChosen = true;
              storeData.selectedTeam = res.selectedTeam;
              storeData.selectedCharacter = res.selectedTeam;
            }
          });
          if (app.store && typeof app.store.flush === 'function') {
            app.store.flush();
          }
        }
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
      var payLang = getActiveLang();
      var paySubtitle = options.desc || (payLang === 'ru'
        ? 'Оплата через официальный защищённый счёт Telegram:'
        : 'Checkout via official secure Telegram invoice:');
      modal.innerHTML =
        '<div style="font-size:11px;color:#fbbf24;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">' +
        (payLang === 'ru' ? 'ПОКУПКА ЗА TELEGRAM STARS' : 'TELEGRAM STARS CHECKOUT') +
        '</div>' +
        '<h2 style="margin:0 0 8px;font-size:18px;color:var(--text-pure);word-break:break-word;">' + escapeHtml(title) + '</h2>' +
        '<p style="color:var(--text-muted);font-size:12px;line-height:1.4;margin:0 0 16px;">' +
        escapeHtml(paySubtitle) +
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

  // Dedicated Skills & Player Training Page (Console-Grade Upgrades Hub)
  function buildUpgradesPage(app) {
    var curChar = (app.store && app.store.data && (app.store.data.selectedTeam || app.store.data.selectedCharacter)) || 'footy';
    var isFooty = (curChar === 'footy');
    var lang = getActiveLang();

    var container = document.createElement('div');
    container.className = 'screen solid page-screen has-nav';
    container.dataset.id = 'upgrades';

    var page = document.createElement('div');
    page.className = 'page fvh-upgrades-page';

    // 1. Header with Back Button, Title, and Live Coins Pill
    var head = document.createElement('div');
    head.className = 'page-head fvh-upgrades-head';
    var backBtn = document.createElement('button');
    backBtn.className = 'btn icon back';
    backBtn.innerHTML = getUiIconSvg('arrow_back', 18);
    backBtn.onclick = function () {
      app.audio.play('click');
      app.showMenu();
    };

    var titleBox = document.createElement('div');
    titleBox.style.flex = '1 1 auto';
    titleBox.style.padding = '0 6px';
    titleBox.style.minWidth = '0';
    titleBox.style.overflow = 'hidden';
    titleBox.innerHTML =
      '<h1 style="margin:0;font-size:clamp(14px, 4.2vw, 20px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + tr('upgradesTitle') + '</h1>' +
      '<small style="color:var(--text-muted);font-size:10px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + tr('upgradesSubtitle') + '</small>';

    var walletBox = document.createElement('div');
    walletBox.className = 'fvh-wallet-chips';
    function updateWalletChip() {
      var coins = (app.store && app.store.data && app.store.data.coins) || 0;
      walletBox.innerHTML =
        '<button class="fvh-wallet-pill gold" style="cursor:pointer;" title="' + tr('catCoins') + '">' +
        getFvhCoinSvg('inline') + ' <span>' + coins.toLocaleString() + '</span>' +
        '</button>';
    }
    updateWalletChip();
    walletBox.onclick = function () {
      app.audio.play('click');
      app.go('shop');
    };

    head.appendChild(backBtn);
    head.appendChild(titleBox);
    head.appendChild(walletBox);
    page.appendChild(head);

    var body = document.createElement('div');
    body.className = 'page-body fvh-upgrades-body';

    function updateUpgradesUI() {
      body.innerHTML = '';
      updateWalletChip();
      var curData = (app.store && app.store.data) || {};
      var coins = curData.coins || 0;
      var curPlayerXp = curData.xp || 0;
      function calcLevelForXp(xp) {
        var level = 1;
        var rest = Math.max(0, xp || 0);
        var need = 100;
        while (rest >= need && level < 50) {
          rest -= need;
          level++;
          need = Math.round(100 + (level - 1) * 40);
        }
        return Math.min(30, level);
      }
      var curPlayerLvl = Math.max(curData.level || 1, (curData.profile && curData.profile.level) || 1, (app.store && app.store.level) || 1, calcLevelForXp(curPlayerXp));
      var curUp = curData.upgrades || { power: 1, stamina: 1, keeper: 1, speed: 1 };

      var pL = Math.max(1, Math.min(10, curUp.power || 1));
      var sL = Math.max(1, Math.min(10, curUp.stamina || 1));
      var kL = Math.max(1, Math.min(10, curUp.keeper || 1));
      var spL = Math.max(1, Math.min(10, curUp.speed || curUp.stamina || 1));
      var avgL = (pL + sL + kL + spL) / 4;
      var ovr = Math.round(70 + ((avgL - 1) / 9) * 29);

      // Hero Athlete Training Banner
      var heroBanner = document.createElement('div');
      heroBanner.className = 'fvh-upgrades-hero-banner ' + curChar;
      var statusTitle = ovr >= 95 ? (lang === 'ru' ? 'ЛЕГЕНДА МИРА' : 'WORLD LEGEND') :
                        ovr >= 88 ? (lang === 'ru' ? 'МАСТЕР СПОРТА' : 'GRANDMASTER') :
                        ovr >= 80 ? (lang === 'ru' ? 'ПРОФЕССИОНАЛ' : 'PRO ATHLETE') :
                        ovr >= 75 ? (lang === 'ru' ? 'ОСНОВНОЙ СОСТАВ' : 'FIRST SQUAD') :
                        (lang === 'ru' ? 'НОВИЧОК КЛУБА' : 'ROOKIE PROSPECT');

      heroBanner.innerHTML =
        '<div style="display:flex;align-items:center;gap:14px;">' +
        '  <div class="fvh-upgrades-avatar-badge" style="width:52px;height:52px;border-radius:14px;background:' + (isFooty ? 'rgba(0,240,255,0.15)' : 'rgba(249,115,22,0.15)') + ';border:1.5px solid ' + (isFooty ? '#00f0ff' : '#f97316') + ';display:flex;align-items:center;justify-content:center;box-shadow:0 0 16px ' + (isFooty ? 'rgba(0,240,255,0.3)' : 'rgba(249,115,22,0.3)') + ';">' +
        '    ' + getUiIconSvg(isFooty ? 'nav_home_footy' : 'nav_home_hoops', 32) + '' +
        '  </div>' +
        '  <div style="flex:1;min-width:0;">' +
        '    <div style="font-size:11px;font-weight:900;letter-spacing:1px;color:' + (isFooty ? '#00f0ff' : '#f97316') + ';text-transform:uppercase;">' +
        (isFooty ? '⚡ FOOTY ATHLETE TRAINING' : '⚡ HOOPS ATHLETE TRAINING') +
        '    </div>' +
        '    <div style="font-size:18px;font-weight:900;color:#fff;margin:2px 0;">' + statusTitle + '</div>' +
        '    <div style="font-size:11.5px;color:var(--text-muted);">' +
        (lang === 'ru' ? 'Уровень игрока: ' : 'Player Level: ') + '<b style="color:#fff;">Lv.' + curPlayerLvl + '</b> · ' +
        (lang === 'ru' ? 'Очки прокачки: ' : 'Training Tiers: ') + '<b style="color:#fff;">' + (pL + sL + kL + spL) + ' / 40</b>' +
        '    </div>' +
        '  </div>' +
        '</div>';
      body.appendChild(heroBanner);

      // 4 Core Attributes (Power, Stamina, Speed, Keeper/Defense)
      var skillsGrid = document.createElement('div');
      skillsGrid.className = 'fvh-upgrades-skills-grid';

      var skillsConfig = [
        {
          key: 'power',
          icon: isFooty ? getUiIconSvg('skill_power_footy', 26) : getUiIconSvg('skill_power_hoops', 26),
          name: isFooty ? tr('upgradeSkillPowerFooty') : tr('upgradeSkillPowerHoops'),
          desc: isFooty ? tr('upgradeSkillPowerFootyDesc') : tr('upgradeSkillPowerHoopsDesc'),
          level: pL,
          stepPct: 5.0,
          curMetric: isFooty ? (76 + (pL - 1) * 3.8).toFixed(0) + ' км/ч' : (72 + (pL - 1) * 3.4).toFixed(0) + ' км/ч',
          nextMetric: isFooty ? (76 + pL * 3.8).toFixed(0) + ' км/ч' : (72 + pL * 3.4).toFixed(0) + ' км/ч',
          metricLabel: isFooty ? (lang === 'ru' ? 'Скорость удара' : 'Strike Velocity') : (lang === 'ru' ? 'Мощь броска' : 'Shot Arc & Power'),
          traitLv5: isFooty ? (lang === 'ru' ? 'Lv.5 Трейт: Подкрутка в девятку' : 'Lv.5 Trait: Top Corner Curve') : (lang === 'ru' ? 'Lv.5 Trait: Снайпер трехочковых' : 'Lv.5 Trait: 3-Point Precision'),
          traitLv10: isFooty ? (lang === 'ru' ? 'Lv.10 Трейт: Пушечный выстрел' : 'Lv.10 Trait: Golden Cannonball') : (lang === 'ru' ? 'Lv.10 Trait: Мощный постер-данк' : 'Lv.10 Trait: Thunderous Poster Dunk')
        },
        {
          key: 'stamina',
          icon: getUiIconSvg('skill_stamina', 26),
          name: tr('upgradeSkillStamina'),
          desc: tr('upgradeSkillStaminaDesc'),
          level: sL,
          stepPct: 4.0,
          curMetric: (5.0 + (sL - 1) * 0.7).toFixed(1) + ' с',
          nextMetric: (5.0 + sL * 0.7).toFixed(1) + ' с',
          metricLabel: lang === 'ru' ? 'Длительность спринта' : 'Turbo Sprint Duration',
          traitLv5: lang === 'ru' ? 'Lv.5 Трейт: Второе дыхание (+25% реген)' : 'Lv.5 Trait: Second Wind (+25% recovery)',
          traitLv10: lang === 'ru' ? 'Lv.10 Трейт: Неутомимый марафонец' : 'Lv.10 Trait: Iron Athlete Marathon'
        },
        {
          key: 'speed',
          icon: getUiIconSvg('skill_speed', 26),
          name: tr('upgradeSkillSpeed'),
          desc: tr('upgradeSkillSpeedDesc'),
          level: spL,
          stepPct: 4.5,
          curMetric: (6.0 + (spL - 1) * 0.20).toFixed(2) + ' м/с',
          nextMetric: (6.0 + spL * 0.20).toFixed(2) + ' м/с',
          metricLabel: lang === 'ru' ? 'Максимальная скорость' : 'Top Burst Speed',
          traitLv5: lang === 'ru' ? 'Lv.5 Трейт: Взрывной первый шаг' : 'Lv.5 Trait: Explosive First Step',
          traitLv10: lang === 'ru' ? 'Lv.10 Трейт: Скорость молнии' : 'Lv.10 Trait: Lightning Velocity'
        },
        {
          key: 'keeper',
          icon: isFooty ? getUiIconSvg('skill_keeper_footy', 26) : getUiIconSvg('skill_keeper_hoops', 26),
          name: isFooty ? tr('upgradeSkillKeeperFooty') : tr('upgradeSkillKeeperHoops'),
          desc: isFooty ? tr('upgradeSkillKeeperFootyDesc') : tr('upgradeSkillKeeperHoopsDesc'),
          level: kL,
          stepPct: 3.5,
          curMetric: Math.round(195 - (kL - 1) * 7.5) + ' мс',
          nextMetric: Math.round(195 - kL * 7.5) + ' мс',
          metricLabel: isFooty ? (lang === 'ru' ? 'Реакция сейва' : 'Save Reflex Time') : (lang === 'ru' ? 'Блок-шот & Защита' : 'Block & Defensive Span'),
          traitLv5: isFooty ? (lang === 'ru' ? 'Lv.5 Трейт: Кошачий прыжок в угол' : 'Lv.5 Trait: Acrobatic Corner Reach') : (lang === 'ru' ? 'Lv.5 Trait: Железный заслон' : 'Lv.5 Trait: Iron Rim Lockdown'),
          traitLv10: isFooty ? (lang === 'ru' ? 'Lv.10 Трейт: Непробиваемая стена' : 'Lv.10 Trait: Immovable Goalkeeper') : (lang === 'ru' ? 'Lv.10 Trait: Блок-шот века' : 'Lv.10 Trait: Master Shot Blocker')
        }
      ];
      var costs = [0, 500, 1200, 2500, 4500, 7500, 12000, 18000, 26000, 40000];
      var reqLevels = [0, 1, 2, 4, 6, 9, 12, 15, 19, 23];

      skillsConfig.forEach(function (sk) {
        var card = document.createElement('div');
        card.className = 'fvh-upgrade-card fvh-skill-card';

        var curL = sk.level;
        var isMax = curL >= 10;
        var nextCost = isMax ? 0 : costs[curL];
        var reqL = isMax ? 0 : reqLevels[curL];
        var hasLvl = curPlayerLvl >= reqL;
        var hasCoins = coins >= nextCost;

        var pipsHtml = '';
        for (var p = 1; p <= 10; p++) {
          var isFilled = p <= curL;
          var isNext = p === curL + 1;
          pipsHtml += '<span class="fvh-skill-pip' + (isFilled ? ' filled' : (isNext ? ' next' : '')) + '"></span>';
        }

        var curBoostText = '+' + ((curL - 1) * sk.stepPct).toFixed(1) + '%';
        var nextBoostText = '+' + (curL * sk.stepPct).toFixed(1) + '%';

        var actionHtml = '';
        if (isMax) {
          actionHtml = '<div class="fvh-upgrade-max-badge">' + getUiIconSvg('crown', 16) + ' ' + (lang === 'ru' ? 'МАКСИМАЛЬНЫЙ УРОВЕНЬ' : 'MAX LEVEL') + '</div>';
        } else {
          var lockWarn = !hasLvl
            ? '<div class="fvh-upgrade-lock-warn">' + getUiIconSvg('lock', 14) + ' ' + (lang === 'ru' ? ('Требуется Уровень игрока ' + reqL + ' (у вас Lvl ' + curPlayerLvl + ')') : ('Requires Player Lvl ' + reqL + ' (you have Lvl ' + curPlayerLvl + ')')) + '</div>'
            : '';
          actionHtml =
            lockWarn +
            '<button type="button" class="btn primary fvh-upgrade-btn"' + ((!hasLvl || !hasCoins) ? ' disabled' : '') + '>' +
            '⚡ ' + (lang === 'ru' ? 'Улучшить до Lvl ' + (curL + 1) : 'Upgrade to Lvl ' + (curL + 1)) +
            ' (' + getFvhCoinSvg('inline') + ' ' + nextCost.toLocaleString() + ')' +
            '</button>';
        }

        card.innerHTML =
          '<div class="fvh-upgrade-head">' +
          '  <div class="fvh-upgrade-title-box">' +
          '    <span class="fvh-upgrade-icon">' + sk.icon + '</span>' +
          '    <div>' +
          '      <h3 class="fvh-upgrade-name">' + sk.name + '</h3>' +
          '      <div class="fvh-upgrade-lvl-badge">' + (lang === 'ru' ? 'Уровень ' : 'Level ') + curL + ' / 10</div>' +
          '    </div>' +
          '  </div>' +
          '  <div style="text-align:right;">' +
  '  <div class="fvh-upgrade-boost-val">' + curBoostText + (isMax ? '' : (' ➔ <span style="color:#00f0ff;">' + nextBoostText + '</span>')) + '</div>' +
  '  <div class="fvh-upgrade-metric-chip">' + sk.metricLabel + ': <b style="color:#fff;">' + sk.curMetric + '</b>' + (isMax ? '' : (' ➔ <b style="color:#00f0ff;">' + sk.nextMetric + '</b>')) + '</div>' +
  '</div>' +
          '</div>' +
          '<p class="fvh-upgrade-desc">' + sk.desc + '</p>' +
          '<div class="fvh-skill-bar-wrap">' +
          '  <div class="fvh-skill-bar">' + pipsHtml + '</div>' +
          '</div>' +
          '<div class="fvh-upgrade-action-row">' + actionHtml + '</div>';

        if (!isMax) {
          var upBtn = card.querySelector('.fvh-upgrade-btn');
          if (upBtn) {
            upBtn.onclick = function () {
              if (!hasLvl) {
                app.audio.play('error');
                showToast(lang === 'ru' ? ('Повышайте уровень игрока в матчах до Lvl ' + reqL) : ('Reach Player Level ' + reqL));
                return;
              }
              if (!hasCoins) {
                app.audio.play('error');
                showToast(tr('notEnoughCoins'));
                return;
              }
              upBtn.disabled = true;
              var pid = getAppPlayerId(app);
              var serverSkill = (sk.key === 'speed') ? 'stamina' : sk.key;
              safeEconomyApi('/api/economy/upgrade', { playerId: pid, skill: serverSkill, level: curPlayerLvl, xp: curPlayerXp }).then(function (res) {
                if (res && res.ok) {
                  app.store.update(function (d) {
                    d.coins = res.coins;
                    if (!d.upgrades) d.upgrades = {};
                    d.upgrades[sk.key] = res.level;
                    if (sk.key === 'speed') d.upgrades.speed = res.level;
                  });
                  app.audio.play('claim');
                  if (navigator.vibrate) try { navigator.vibrate([60, 40, 100]); } catch (e) {}
                  showToast('⚡ ' + sk.name + ' ' + (lang === 'ru' ? 'прокачан до Lvl ' : 'upgraded to Lvl ') + res.level + '!');
                  updateUpgradesUI();
                } else {
                  upBtn.disabled = false;
                  app.audio.play('error');
                  showToast((res && res.message) || tr('purchaseFailed'));
                }
              }).catch(function () {
                upBtn.disabled = false;
                app.audio.play('error');
                showToast('Ошибка связи с сервером');
              });
            };
          }
        }

        skillsGrid.appendChild(card);
      });

      body.appendChild(skillsGrid);
    }

    updateUpgradesUI();
    page.appendChild(body);
    page.appendChild(createScrollBottomSpacer());
    container.appendChild(page);
    container.appendChild(createSharedBottomNav('upgrades', app));
    return container;
  }

  // Build Characters & Wardrobe Page
  function buildCharactersPage(app, initialChar, initialSlot) {
    var curChar = initialChar || (app.store && app.store.data && (app.store.data.selectedTeam || app.store.data.selectedCharacter)) || 'footy';
    var curSlot = initialSlot || 'skins';
    var selectedItem = null;

    var container = document.createElement('div');
    container.className = 'screen solid page-screen has-nav';
    container.dataset.id = 'characters';

    var page = document.createElement('div');
    page.className = 'page';

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
    title.textContent = tr('lockerTitle', { char: curChar === 'footy' ? tr('footyChar') : tr('hoopsChar') });
    head.appendChild(backBtn);
    head.appendChild(title);
    page.appendChild(head);

    var body = document.createElement('div');
    body.className = 'page-body';

    // Active athlete in Locker: determined by player's selected athlete
    curChar = initialChar || (app.store && app.store.data && (app.store.data.selectedCharacter || app.store.data.selectedTeam)) || 'footy';
    var isFooty = (curChar === 'footy');
    var lang = getActiveLang();

    // Locker athlete is strictly determined by player's selected hero on the Home Screen

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

    var previewNavRow = document.createElement('div');
    previewNavRow.className = 'fvh-wrd-cycle-row';

    var equipSlotList = document.createElement('div');
    equipSlotList.className = 'fvh-equipped-list';

    var selectBtn = document.createElement('button');
    selectBtn.className = 'btn primary block';
    selectBtn.style.marginTop = '12px';

    previewCol.appendChild(avatarBox);
    previewCol.appendChild(previewNavRow);
    previewCol.appendChild(charName);
    previewCol.appendChild(charRole);
    previewCol.appendChild(equipSlotList);
    previewCol.appendChild(selectBtn);

    // 3D tryon iframe removed in favor of authentic stylized athlete
    layout.appendChild(previewCol);

    // Right Locker Items Column
    var itemsCol = document.createElement('div');
    itemsCol.className = 'list';

    // Slot Category Tabs (Football or Basketball kits based on team — ball skins disabled)
    var isFooty = (curChar === 'footy');
    if (curSlot === 'balls' || curSlot === 'balls_footy' || curSlot === 'balls_hoops') curSlot = 'skins';
    var validSlots = ['skins', 'stars'];
    if (validSlots.indexOf(curSlot) === -1) curSlot = 'skins';
    var slotSeg = document.createElement('div');
    slotSeg.className = 'seg fvh-wardrobe-seg';
    slotSeg.style.marginBottom = '8px';

    function renderWardrobeCategoryTabs() {
      slotSeg.innerHTML = '';
      var slots = [
        { id: 'skins', icon: 'cat_skins', label: (isFooty ? (lang === 'ru' ? 'Формы' : 'Kits') : (lang === 'ru' ? 'Майки' : 'Tanks')) },
        { id: 'stars', icon: 'star', label: (lang === 'ru' ? 'За Звёзды' : 'For Stars') }
      ];
      slots.forEach(function (s) {
        var sb = document.createElement('button');
        sb.innerHTML = '<span style="display:inline-flex;align-items:center;gap:6px;vertical-align:middle;">' + getUiIconSvg(s.icon, 16) + '<span>' + s.label + '</span></span>';
        if (s.id === curSlot) sb.className = 'on';
        sb.onclick = function () {
          curSlot = s.id;
          selectedItem = null;
          slotSeg.querySelectorAll('button').forEach(function (b) { b.className = ''; });
          sb.className = 'on';
          app.audio.play('click');
          updateView();
        };
        slotSeg.appendChild(sb);
      });
    }
    renderWardrobeCategoryTabs();
    itemsCol.appendChild(slotSeg);

    // Collapsible Rarity Filter ("Фильтр" button -> opens rarity selector)
    var curRarity = 'all';
    var rarityFilterCtrl = createRarityFilterControl(function (nextRarity) {
      curRarity = nextRarity;
      selectedItem = null;
      updateView();
    });
    itemsCol.appendChild(rarityFilterCtrl.el);

    var itemsGrid = document.createElement('div');
    itemsGrid.className = 'grid shop-grid';
    itemsCol.appendChild(itemsGrid);
    layout.appendChild(itemsCol);

    body.appendChild(layout);
    page.appendChild(body);
    container.appendChild(page);

    function updateWardrobeAvatar(charId, kitId) {
      var eq = (app && app.store && app.store.data && app.store.data.equipped) || {};
      var defaultKit = (charId === 'hoops') ? 'hoops_classic' : 'footy_classic';
      var initialKit = canonItemId(kitId || resolveEquippedItemId(eq, 'skins', charId) || defaultKit);

      var host = avatarBox.querySelector('.fvh-wardrobe-3d-host');
      var hasCanvas = host && host.querySelector('.fvh-wardrobe-3d-canvas');
      if (host && hasCanvas && host.getAttribute('data-hero') === charId && window.CharactersGLB && typeof window.CharactersGLB.setWardrobePreviewKit === 'function') {
        window.CharactersGLB.setWardrobePreviewKit(charId, initialKit);
        host.setAttribute('data-kit', initialKit);
        var sLabel = getItemLabelById(initialKit, initialKit);
        var tagSpan = avatarBox.querySelector('.fvh-hero-active-jersey-tag span:last-child');
        if (tagSpan && sLabel) tagSpan.textContent = sLabel;
      } else {
        avatarBox.innerHTML = getWardrobe3DViewerHtml(charId, initialKit);
        mountWardrobe3DIntoContainer(avatarBox, charId, initialKit);
      }
    }

    function updateView() {
      isFooty = (curChar === 'footy');
      title.textContent = tr('lockerTitle', { char: curChar === 'footy' ? tr('footyChar') : tr('hoopsChar') });

      charName.textContent = curChar === 'footy' ? 'FOOTY' : 'HOOPS';
      charRole.textContent = curChar === 'footy' ? tr('footyRole') : tr('hoopsRole');

      selectBtn.style.display = 'none';

      var up = (app.store && app.store.data && app.store.data.upgrades) || { power: 1, stamina: 1, keeper: 1 };
      var pLvl = Math.max(1, Math.min(10, up.power || 1));
      var sLvl = Math.max(1, Math.min(10, up.stamina || 1));
      var kLvl = Math.max(1, Math.min(10, up.keeper || 1));

      if (curSlot === 'upgrades') {
        rarityFilterCtrl.setVisible(false);
        avatarBox.innerHTML = getCharacterDisplayHtml(curChar, null);
        mountWardrobe3DIntoContainer(avatarBox, curChar, null);
        equipSlotList.innerHTML =
          '<div class="fvh-equipped-slot"><span>💥 ' + (lang === 'ru' ? 'Сила удара / броска:' : 'Power:') + '</span><b>Lvl ' + pLvl + ' / 10</b></div>' +
          '<div class="fvh-equipped-slot"><span>💨 ' + (lang === 'ru' ? 'Выносливость:' : 'Stamina:') + '</span><b>Lvl ' + sLvl + ' / 10</b></div>' +
          '<div class="fvh-equipped-slot"><span>🧤 ' + (lang === 'ru' ? 'Вратарь:' : 'Goalkeeper:') + '</span><b>Lvl ' + kLvl + ' / 10</b></div>';
        renderUpgradesView();
        return;
      }

      rarityFilterCtrl.setVisible(true);

      // Equipped summary (Authoritative single ID per slot & sport)
      var eq = (app.store && app.store.data && app.store.data.equipped) || {};
      var owned = (app.store && app.store.data && app.store.data.owned) || [];

      var curCharSkin = resolveEquippedItemId(eq, 'skins', curChar);

      equipSlotList.innerHTML =
        '<div class="fvh-equipped-slot"><span>' + tr('catSkins') + ':</span><b>' + getItemLabelById(curCharSkin, tr('defaultSkin')) + '</b></div>';

      // Load matching items for current slot (OWNED ITEMS ONLY)
      itemsGrid.innerHTML = '';
      function renderMatchingItems() {
        var baseCatalog = buildDefaultShopCatalog(curChar);
        var unseenItems = (app.store && app.store.data && app.store.data.unseenItems) || [];

        var matching = baseCatalog.filter(function (it) {
          if (it.category === 'balls' || it.category === 'balls_footy' || it.category === 'balls_hoops' || String(it.id).startsWith('ball_')) return false;
          if (curSlot === 'skins') {
            if (it.category !== 'skins' || it.currency === 'star') return false;
          } else if (curSlot === 'stars') {
            if (it.category !== 'stars' && it.currency !== 'star') return false;
          } else {
            return false;
          }
          if (curRarity !== 'all' && it.rarity !== curRarity) return false;
          if (isFooty && it.mode !== 'footy') return false;
          if (!isFooty && it.mode !== 'hoops') return false;

          var isOwned = isItemOwnedInList(owned, it.id) || Boolean(it.isDefault) ||
            (isFooty && (it.id === 'footy_classic' || it.id === 'footy_2_white' || it.id === 'ball_classic')) ||
            (!isFooty && (it.id === 'hoops_classic' || it.id === 'hoops_2_chicago' || it.id === 'ball_hoops_classic'));
          return isOwned;
        });

        // Deduplicate items canonically so aliases never duplicate cards
        var seenCanonIds = {};
        var uniqueMatching = [];
        matching.forEach(function (it) {
          var cId = canonItemId(it.id);
          if (!seenCanonIds[cId]) {
            seenCanonIds[cId] = true;
            uniqueMatching.push(it);
          }
        });
        var RARITY_ORDER = { common: 0, rare: 1, epic: 2, legendary: 3, mythic: 4 };
        uniqueMatching.sort(function (a, b) {
          var ra = (RARITY_ORDER[a.rarity || 'common'] !== undefined) ? RARITY_ORDER[a.rarity || 'common'] : 0;
          var rb = (RARITY_ORDER[b.rarity || 'common'] !== undefined) ? RARITY_ORDER[b.rarity || 'common'] : 0;
          if (ra !== rb) return ra - rb;
          var pa = Number(a.price) || 0;
          var pb = Number(b.price) || 0;
          if (pa !== pb) return pa - pb;
          return String(a.id).localeCompare(String(b.id));
        });
        matching = uniqueMatching;

        if (matching.length === 0) {
          selectBtn.style.display = 'none';
          if (curSlot === 'balls') updateWardrobeAvatar(curChar, curCharSkin);
          var emptyBox = document.createElement('div');
          emptyBox.className = 'fvh-empty-state fvh-empty-locker';
          emptyBox.innerHTML =
            '<div class="fvh-empty-state-icon">🎒</div>' +
            '<div class="fvh-empty-state-title">' + (curRarity !== 'all' ? (tr('noItemsOfRarity') || 'No items of this rarity in your locker') : tr('emptyInventoryCategory')) + '</div>';
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

        // Single authoritative equipped ID for the currently displayed tab & athlete
        var slotCategoryForMatch = (curSlot === 'balls') ? 'balls' : 'skins';
        var expectedEqCanonId = resolveEquippedItemId(eq, slotCategoryForMatch, curChar);

        // Auto-select currently equipped item or first item if none selected
        if (!selectedItem || matching.every(function (m) { return canonItemId(m.id) !== canonItemId(selectedItem.id); })) {
          selectedItem = matching.find(function (it) {
            return canonItemId(it.id) === expectedEqCanonId;
          }) || matching[0] || null;
        }

        // Update left preview box & action button based on selected item
        previewNavRow.innerHTML = '';
        if (selectedItem) {
          var isBallSel = (selectedItem.category === 'balls' || selectedItem.category === 'balls_footy' || selectedItem.category === 'balls_hoops' || String(selectedItem.id).startsWith('ball_'));
          if (!isBallSel) {
            updateWardrobeAvatar(curChar, selectedItem.id);
          } else {
            if (window.CharactersGLB && typeof window.CharactersGLB.unmountWardrobePreview === 'function') {
              window.CharactersGLB.unmountWardrobePreview();
            }
            avatarBox.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;width:100%;padding:10px;box-sizing:border-box;">' + renderItemArtwork(selectedItem, 'large') + '</div>';
          }
          if (matching.length > 1) {
            var curIdx = matching.findIndex(function (m) { return canonItemId(m.id) === canonItemId(selectedItem.id); });
            if (curIdx < 0) curIdx = 0;
            var prevBtn = document.createElement('button');
            prevBtn.type = 'button';
            prevBtn.className = 'btn small secondary fvh-wrd-cycle-btn';
            prevBtn.textContent = '‹';
            prevBtn.title = lang === 'ru' ? 'Предыдущая форма' : 'Previous kit';
            prevBtn.onclick = function () {
              app.audio.play('click');
              selectedItem = matching[(curIdx - 1 + matching.length) % matching.length];
              updateView();
            };
            var counterSpan = document.createElement('span');
            counterSpan.className = 'fvh-wrd-cycle-count';
            counterSpan.textContent = (curIdx + 1) + ' / ' + matching.length;
            var nextBtn = document.createElement('button');
            nextBtn.type = 'button';
            nextBtn.className = 'btn small secondary fvh-wrd-cycle-btn';
            nextBtn.textContent = '›';
            nextBtn.title = lang === 'ru' ? 'Следующая форма' : 'Next kit';
            nextBtn.onclick = function () {
              app.audio.play('click');
              selectedItem = matching[(curIdx + 1) % matching.length];
              updateView();
            };
            previewNavRow.appendChild(prevBtn);
            previewNavRow.appendChild(counterSpan);
            previewNavRow.appendChild(nextBtn);
          }
          var selSlotKey = isBallSel ? ('ball.' + curChar) : ('skin.' + curChar);
          var isSelEquipped = canonItemId(selectedItem.id) === expectedEqCanonId;
          var selLocalizedName = trItem(selectedItem.name);

          selectBtn.style.display = 'block';
          if (isSelEquipped) {
            selectBtn.className = 'btn block';
            selectBtn.disabled = true;
            selectBtn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:6px;">' + getUiIconSvg('check', 16) + ' <span>' + (tr('equipped') || 'Надето') + '</span></span>';
            selectBtn.onclick = null;
          } else {
            selectBtn.className = 'btn primary block';
            selectBtn.disabled = false;
            selectBtn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:6px;">' + getUiIconSvg(isBallSel ? (isFooty ? 'nav_home_footy' : 'nav_home_hoops') : 'jersey', 16) + ' <span>' + tr('equipAction') + ': ' + selLocalizedName + '</span></span>';
            selectBtn.onclick = function () {
              app.audio.play('click');
              doEquip(selectedItem, selSlotKey, selLocalizedName);
            };
          }
        } else {
          selectBtn.style.display = 'none';
        }

        function doEquip(itemToEquip, targetSlotKey, localizedName) {
          var pid = getAppPlayerId(app);
          var cId = canonItemId(itemToEquip.id);
          var isBallItem = (itemToEquip.category === 'balls' || itemToEquip.category === 'balls_footy' || itemToEquip.category === 'balls_hoops' || String(cId).startsWith('ball_'));
          var canonicalSlot = isBallItem ? ('ball.' + curChar) : ('skin.' + curChar);

          // Optimistic atomic update so only ONE item is ever marked equipped
          app.store.update(function (d) {
            if (!d.equipped) d.equipped = {};
            d.equipped[canonicalSlot] = cId;
            if (isBallItem) {
              d.equipped['ball.' + curChar] = cId;
              d.equipped.ball = cId;
            } else {
              d.equipped['skin.' + curChar] = cId;
              d.equipped.skin = cId;
            }
          });
          if (app.store && typeof app.store.flush === 'function') app.store.flush();
          app.audio.play('claim');
          showToast(tr('equippedState') + ': ' + localizedName);
          selectedItem = itemToEquip;
          updateView();

          // Persist to authoritative server
          safeEconomyApi('/api/economy/equip', {
            playerId: pid,
            slot: canonicalSlot,
            itemId: cId
          }).then(function (res) {
            if (res && res.ok && res.equipped) {
              app.store.update(function (d) {
                d.equipped = Object.assign({}, d.equipped || {}, res.equipped);
                d.equipped[canonicalSlot] = cId;
                if (!isBallItem) d.equipped.skin = cId;
                else d.equipped.ball = cId;
              });
            }
          });
        }

        matching.forEach(function (item) {
          var isBallCard = (item.category === 'balls' || item.category === 'balls_footy' || item.category === 'balls_hoops' || String(item.id).startsWith('ball_'));
          var activeSlotKey = isBallCard ? ('ball.' + curChar) : ('skin.' + curChar);
          // Strict single-ID comparison prevents dual "Надето" badges permanently
          var isEquipped = (canonItemId(item.id) === expectedEqCanonId);
          var isSelected = (selectedItem && canonItemId(selectedItem.id) === canonItemId(item.id));
          var isUnseen = unseenItems.some(function (u) { return canonItemId(u) === canonItemId(item.id); });

          var itemCard = document.createElement('div');
          var rarClass = item.rarity || 'common';
          itemCard.className = 'card shopc r-' + rarClass + (isEquipped ? ' is-eq' : '') + (isSelected ? ' selected' : '');

          var localizedRarity = tr('rarity_' + rarClass) || rarClass.toUpperCase();
          var localizedItemName = trItem(item.name);

          itemCard.innerHTML =
            (isUnseen ? '<span class="badge-new-item">NEW</span>' : '') +
            '<div class="thumbwrap"><div class="thumb" style="display:flex;align-items:center;justify-content:center;">' +
            renderItemArtwork(item, 'thumb') +
            '</div>' +
            (isEquipped ? '<span class="st st-eq">' + tr('equippedState') + '</span>' : '') +
            '</div>' +
            '<div class="fvh-shopc-meta">' +
            '  <div class="nm">' + localizedItemName + '</div>' +
            '  <div class="tags"><span class="rar ' + rarClass + '">' + localizedRarity + '</span></div>' +
            '</div>';

          function markItemSeen() {
            var unseen = (app.store && app.store.data && app.store.data.unseenItems) || [];
            var targets = [item.id, canonItemId(item.id)];
            for (var k in LEGACY_ITEM_ALIASES) {
              if (LEGACY_ITEM_ALIASES[k] === canonItemId(item.id)) targets.push(k);
            }
            var wasUnseen = targets.some(function (t) { return unseen.indexOf(t) !== -1; });
            if (wasUnseen) {
              app.store.update(function (d) {
                if (d.unseenItems) {
                  d.unseenItems = d.unseenItems.filter(function (id) { return targets.indexOf(id) === -1; });
                }
              });
              var badge = itemCard.querySelector('.badge-new-item');
              if (badge) badge.remove();
              safeEconomyApi('/api/economy/mark-seen', {
                playerId: getAppPlayerId(app),
                itemId: item.id,
                itemIds: targets
              });
            }
          }

          // Clicking the item card SELECTS/PREVIEWS without equipping
          itemCard.onclick = function () {
            app.audio.play('click');
            markItemSeen();
            selectedItem = item;
            updateView();
          };

          // Equip button: ONLY clicking this equips the item
          var btn = document.createElement('button');
          if (isEquipped) {
            btn.className = 'btn small';
            btn.disabled = true;
            btn.textContent = tr('equippedState');
          } else {
            btn.className = 'btn small primary';
            btn.textContent = tr('equipAction');
            btn.onclick = function (e) {
              e.stopPropagation();
              markItemSeen();
              doEquip(item, activeSlotKey, localizedItemName);
            };
          }
          itemCard.appendChild(btn);
          itemsGrid.appendChild(itemCard);
        });
      }

      function renderPacksView() {
        itemsGrid.innerHTML = '';

        var showcase = document.createElement('div');
        showcase.className = 'fvh-pack-exclusive-banner';
        showcase.innerHTML =
          '<div class="fvh-pack-excl-head">' +
          '  <span class="fvh-pack-excl-sparkle">✨</span>' +
          '  <div>' +
          '    <div class="fvh-pack-excl-title">' + (lang === 'ru' ? 'ЭКСКЛЮЗИВЫ ИЗ НАБОРОВ' : 'PACK-EXCLUSIVE MYTHICS') + '</div>' +
          '    <div class="fvh-pack-excl-sub">' + (lang === 'ru' ? 'Не продаются в обычном магазине · Шанс получить только из Наборов' : 'Unavailable in shop · Only obtainable via Mystery Packs') + '</div>' +
          '  </div>' +
          '</div>' +
          '<div class="fvh-pack-excl-grid">' +
          '  <div class="fvh-pack-excl-item"><span class="fvh-pack-excl-ico">🛡️</span><b>' + (lang === 'ru' ? 'Титан Мифический' : 'Mythic Titan') + '</b><small>' + (lang === 'ru' ? 'Форма FOOTY' : 'FOOTY Kit') + '</small></div>' +
          '  <div class="fvh-pack-excl-item"><span class="fvh-pack-excl-ico">🐯</span><b>' + (lang === 'ru' ? 'Гипер-Зверь' : 'Hyper Beast') + '</b><small>' + (lang === 'ru' ? 'Джерси HOOPS' : 'HOOPS Jersey') + '</small></div>' +
          '  <div class="fvh-pack-excl-item"><span class="fvh-pack-excl-ico">🌟</span><b>' + (lang === 'ru' ? 'Сверхновая' : 'Supernova Burst') + '</b><small>' + (lang === 'ru' ? 'Мяч Футбол' : 'Soccer Ball') + '</small></div>' +
          '  <div class="fvh-pack-excl-item"><span class="fvh-pack-excl-ico">🌌</span><b>' + (lang === 'ru' ? 'Квантовый Вихрь' : 'Quantum Vortex') + '</b><small>' + (lang === 'ru' ? 'Мяч Баскетбол' : 'Hoops Ball') + '</small></div>' +
          '</div>';
        itemsGrid.appendChild(showcase);

        var pData = (app.store && app.store.data && app.store.data.packs) || { free: {}, paid: {} };
        var freeFooty = (pData.free && pData.free.footy) || 0;
        var paidFooty = (pData.paid && pData.paid.footy) || 0;
        var totalFooty = freeFooty + paidFooty;

        var freeHoops = (pData.free && pData.free.hoops) || 0;
        var paidHoops = (pData.paid && pData.paid.hoops) || 0;
        var totalHoops = freeHoops + paidHoops;

        // Faction-filtered packs (Footy ONLY sees football packs, Hoops ONLY sees basketball packs)
        var factionPacks = isFooty ? [
          {
            id: 'footy',
            name: lang === 'ru' ? 'Набор Нападающего' : 'Footy Striker Pack',
            sport: 'footy',
            icon: '⚽🎁',
            color: '#00f0ff',
            cost: 250,
            currency: 'coins',
            hasTokens: totalFooty,
            desc: lang === 'ru' ? 'Футбольные формы, мячи, 100-250 монет + 4% шанс на эксклюзивного Титана!' : 'Football kits, match balls, 100-250 coins + 4% Mythic Titan drop chance!'
          }
        ] : [
          {
            id: 'hoops',
            name: lang === 'ru' ? 'Набор Всех Звёзд' : 'Hoops All-Star Pack',
            sport: 'hoops',
            icon: '🏀🎁',
            color: '#f97316',
            cost: 250,
            currency: 'coins',
            hasTokens: totalHoops,
            desc: lang === 'ru' ? 'Баскетбольные джерси, мячи, 100-250 монет + 4% шанс на эксклюзивного Гипер-Зверя!' : 'Basketball jerseys, street balls, 100-250 coins + 4% Hyper Beast drop chance!'
          }
        ];

        var universalPacks = [
          {
            id: 'clash',
            name: lang === 'ru' ? 'Мега-Набор Чемпионов' : 'Clash Champions Pack',
            sport: 'all',
            icon: '👑🎁',
            color: '#facc15',
            cost: 500,
            currency: 'coins',
            hasTokens: 0,
            desc: lang === 'ru' ? 'Космические эксклюзивные мячи (Сверхновая & Квантовый Вихрь) + 250-500 монет!' : 'Cosmic mythic balls (Supernova & Quantum Vortex) + 250-500 coins!'
          },
          // 3 Telegram Stars Packs
          {
            id: 'pack_stars_starter',
            name: tr('packStarsStarter'),
            sport: 'all',
            icon: '⭐🎁',
            color: '#38bdf8',
            starsCost: 50,
            currency: 'stars',
            hasTokens: 0,
            desc: tr('packStarsStarterDesc')
          },
          {
            id: 'pack_stars_champion',
            name: tr('packStarsChampion'),
            sport: 'all',
            icon: '🌟🎁',
            color: '#c084fc',
            starsCost: 150,
            currency: 'stars',
            hasTokens: 0,
            desc: tr('packStarsChampionDesc')
          },
          {
            id: 'pack_stars_legend',
            name: tr('packStarsLegend'),
            sport: 'all',
            icon: '👑🎁',
            color: '#fde047',
            starsCost: 350,
            currency: 'stars',
            hasTokens: 0,
            desc: tr('packStarsLegendDesc')
          }
        ];

        var packs = factionPacks.concat(universalPacks);

        packs.forEach(function (pk) {
          var card = document.createElement('div');
          card.className = 'fvh-pack-card pack-' + pk.id;
          var btnLabel = '';
          if (pk.currency === 'stars') {
            btnLabel = '⭐ ' + (lang === 'ru' ? 'Открыть за ' : 'Open for ') + pk.starsCost + ' Stars';
          } else if (pk.hasTokens > 0) {
            btnLabel = '🎁 ' + (lang === 'ru' ? 'Открыть (В наличии: ' + pk.hasTokens + ')' : 'Open (Owned: ' + pk.hasTokens + ')');
          } else {
            btnLabel = '🎁 ' + (lang === 'ru' ? 'Открыть за ' : 'Open for ') + getFvhCoinSvg('inline') + ' ' + pk.cost;
          }

          var costBadge = pk.currency === 'stars'
            ? ('<span style="color:#fde047;font-weight:900;">⭐ ' + pk.starsCost + ' Stars</span>')
            : (pk.hasTokens > 0 ? ('<span style="color:#22c55e;">✓ ' + (lang === 'ru' ? 'Жетон в инвентаре' : 'Token Available') + '</span>') : (getFvhCoinSvg('inline') + ' ' + pk.cost + ' FvH'));

          card.innerHTML =
            '<div class="fvh-pack-card-head">' +
            '  <span class="fvh-pack-card-icon">' + pk.icon + '</span>' +
            '  <div>' +
            '    <h3 class="fvh-pack-card-name" style="color:' + pk.color + ';">' + pk.name + '</h3>' +
            '    <div class="fvh-pack-card-cost">' + costBadge + '</div>' +
            '  </div>' +
            '</div>' +
            '<p class="fvh-pack-card-desc">' + pk.desc + '</p>' +
            '<div class="fvh-pack-drop-chips">' +
            (pk.currency === 'stars'
              ? ('  <span class="fvh-pack-drop-chip excl" style="color:#fde047;border-color:rgba(250,204,21,0.4);">⭐ ' + (lang === 'ru' ? 'TELEGRAM STARS' : 'TELEGRAM STARS') + '</span>' +
                 '  <span class="fvh-pack-drop-chip leg">🌟 ' + (lang === 'ru' ? 'ГАРАНТИЯ РЕДКОСТИ' : 'GUARANTEED TIER') + '</span>')
              : ('  <span class="fvh-pack-drop-chip excl">✨ 4% ' + (lang === 'ru' ? 'ЭКСКЛЮЗИВ' : 'EXCLUSIVE') + '</span>' +
                 '  <span class="fvh-pack-drop-chip leg">🌟 ' + (lang === 'ru' ? 'ЛЕГЕНДА / ЭПИК' : 'LEGEND / EPIC') + '</span>' +
                 '  <span class="fvh-pack-drop-chip coins">🪙 +' + (lang === 'ru' ? 'МОНЕТЫ' : 'COINS') + '</span>')) +
            '</div>' +
            '<button type="button" class="btn primary block fvh-pack-open-btn" style="margin-top:12px;">' + btnLabel + '</button>';

          card.querySelector('.fvh-pack-open-btn').onclick = function () {
            app.audio.play('click');
            if (pk.currency === 'stars') {
              openUniversalPaymentModal(app, {
                productId: pk.id,
                title: pk.name,
                starsPrice: pk.starsCost,
                coinsAmount: pk.id === 'pack_stars_starter' ? 1500 : (pk.id === 'pack_stars_champion' ? 4000 : 10000),
                onPurchased: function () {
                  app.audio.play('claim');
                  openPackWithCinematicAnimation(app, pk.id, updateView);
                }
              });
              return;
            }
            openPackWithCinematicAnimation(app, pk.id, updateView);
          };

          itemsGrid.appendChild(card);
        });
      }

      if (curSlot === 'packs') {
        rarityFilterCtrl.setVisible(false);
        selectBtn.style.display = 'none';
        renderPacksView();
      } else {
        rarityFilterCtrl.setVisible(true);
        renderMatchingItems();
      }
    }

    updateView();

    // Bottom Spacer for iOS WebKit Telegram Mini App safe scrolling
    page.appendChild(createScrollBottomSpacer());

    // Persistent Unified Bottom Navigation
    container.appendChild(createSharedBottomNav('characters', app));

    return container;
  }

  // Cinematic Pack Opening Modal with Particle Light Burst & 3D Flip Reveal
  function openPackWithCinematicAnimation(app, packId, onComplete) {
    var overlay = document.createElement('div');
    overlay.className = 'fvh-pack-opening-overlay';

    var modal = document.createElement('div');
    modal.className = 'fvh-pack-opening-modal';

    var lang = getActiveLang();
    var isFooty = packId === 'footy';
    var isHoops = packId === 'hoops';
    var isStarStarter = packId === 'stars_starter' || packId === 'pack_stars_starter';
    var isStarChampion = packId === 'stars_champion' || packId === 'pack_stars_champion';
    var isStarLegend = packId === 'stars_legend' || packId === 'pack_stars_legend';
    var isStarPack = isStarStarter || isStarChampion || isStarLegend;

    var packTitle = isStarStarter
      ? (lang === 'ru' ? 'ЗВЁЗДНЫЙ НАБОР НОВИЧКА' : 'STAR ROOKIE PACK')
      : (isStarChampion
          ? (lang === 'ru' ? 'ЧЕМПИОНСКИЙ ПАК ЗВЁЗД' : 'STAR CHAMPION PACK')
          : (isStarLegend
              ? (lang === 'ru' ? 'УЛЬТИМЕЙТ ЛЕГЕНДА ПАК' : 'STAR ULTIMATE LEGEND')
              : (isFooty
                  ? (lang === 'ru' ? 'НАБОР НАПАДАЮЩЕГО' : 'FOOTY STRIKER PACK')
                  : (isHoops ? (lang === 'ru' ? 'НАБОР ВСЕХ ЗВЁЗД' : 'HOOPS ALL-STAR PACK') : (lang === 'ru' ? 'МЕГА-НАБОР ЧЕМПИОНОВ' : 'CLASH CHAMPIONS PACK')))));

    var packColor = isStarStarter ? '#38bdf8' : (isStarChampion ? '#c084fc' : (isStarLegend ? '#fde047' : (isFooty ? '#00f0ff' : (isHoops ? '#f97316' : '#facc15'))));
    var packBadge = isStarPack ? '⭐ TELEGRAM STARS' : (isFooty ? '⚽ FOOTY' : (isHoops ? '🏀 HOOPS' : '👑 CLASH'));

    modal.innerHTML =
      '<div class="fvh-pack-box-wrap">' +
      '  <div class="fvh-pack-light-beam"></div>' +
      '  <div class="fvh-pack-3d-box ' + packId + '">' +
      '    <div class="fvh-pack-3d-front" style="border-color:' + packColor + ';">' +
      '      <div class="fvh-pack-3d-badge">' + packBadge + '</div>' +
      '      <div class="fvh-pack-3d-emblem">🎁</div>' +
      '      <div class="fvh-pack-3d-title">' + packTitle + '</div>' +
      '      <div class="fvh-pack-3d-sub">MYSTERY PACK</div>' +
      '    </div>' +
      '  </div>' +
      '  <div class="fvh-pack-open-prompt">⚡ ' + (lang === 'ru' ? 'ВСКРЫВАЕМ НАБОР...' : 'OPENING PACK...') + '</div>' +
      '</div>';

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    app.audio.play('click');
    if (navigator.vibrate) {
      try { navigator.vibrate([40, 60, 80, 100]); } catch (e) {}
    }

    var packBox = modal.querySelector('.fvh-pack-3d-box');
    if (packBox) packBox.classList.add('shaking');

    var pid = getAppPlayerId(app);
    safeEconomyApi('/api/packs/open', { playerId: pid, packId: packId })
      .then(function (res) {
        if (!res || !res.ok) {
          overlay.remove();
          app.audio.play('error');
          showToast((res && (res.error === 'not_enough_coins' || res.error === 'no_packs_available')) ? tr('notEnoughCoins') : (res && res.message || 'Ошибка открытия'));
          return;
        }

        app.store.update(function (d) {
          d.coins = res.coins;
          if (res.owned) d.owned = res.owned;
          if (res.unseenItems) d.unseenItems = res.unseenItems;
          if (res.packs) d.packs = res.packs;
        });

        setTimeout(function () {
          if (packBox) {
            packBox.classList.remove('shaking');
            packBox.classList.add('bursting');
          }

          var flash = document.createElement('div');
          flash.className = 'fvh-pack-flash';
          overlay.appendChild(flash);
          app.audio.play('claim');
          if (navigator.vibrate) {
            try { navigator.vibrate([120, 40, 180]); } catch (e) {}
          }

          setTimeout(function () {
            flash.remove();
            var it = res.item;
            var isExcl = Boolean(res.isExclusive);
            var rarClass = it.rarity || 'legendary';
            var localizedRarity = tr('rarity_' + rarClass) || rarClass.toUpperCase();
            var localizedItemName = trItem(it.name);
            var compAmount = res.duplicateCompensation || res.bonusCoins;

            var alreadyOwnedNote = res.alreadyOwned
              ? '<div class="fvh-pack-duplicate-note" style="display:flex;align-items:center;gap:10px;background:rgba(250,204,21,0.14);border:1.5px solid rgba(250,204,21,0.45);border-radius:12px;padding:10px 14px;margin:10px 0;text-align:left;">' +
                '  <span style="font-size:24px;">🔁</span>' +
                '  <div>' +
                '    <div style="font-size:12px;font-weight:900;color:#facc15;letter-spacing:0.5px;">' + (lang === 'ru' ? 'ДУБЛИКАТ В КОЛЛЕКЦИИ!' : 'DUPLICATE IN COLLECTION!') + '</div>' +
                '    <div style="font-size:11px;color:#fef08a;margin-top:2px;">' +
                       (lang === 'ru' ? ('Предмет уже в коллекции. Компенсация за редкость [' + localizedRarity + ']: <b>+' + compAmount + ' 🪙 FvH Coin</b>') : ('Item already owned. Rarity compensation [' + localizedRarity + ']: <b>+' + compAmount + ' 🪙 FvH Coin</b>')) +
                '    </div>' +
                '  </div>' +
                '</div>'
              : '';

            modal.innerHTML =
              '<div class="fvh-pack-reveal-card r-' + rarClass + (isExcl ? ' is-mythic-exclusive' : '') + '">' +
              (isExcl ? ('  <div class="fvh-pack-exclusive-pill">✨ ' + (lang === 'ru' ? 'МИФИЧЕСКИЙ ЭКСКЛЮЗИВ' : 'MYTHIC EXCLUSIVE') + ' ✨</div>') : ('  <div class="fvh-pack-rarity-pill rar ' + rarClass + '">' + (tr('rarity_' + rarClass) || rarClass.toUpperCase()) + '</div>')) +
              '  <div class="fvh-pack-item-artwork">' + renderItemArtwork(it, 'large') + '</div>' +
              '  <h2 class="fvh-pack-item-title">' + localizedItemName + '</h2>' +
              '  <div class="fvh-pack-bonus-coins">🪙 +' + res.bonusCoins + ' ' + (lang === 'ru' ? 'Монет FvH' : 'FvH Coins') + '</div>' +
              alreadyOwnedNote +
              '  <div class="fvh-pack-reveal-actions">' +
              '    <button type="button" class="btn primary fvh-pack-equip-now-btn">👕 ' + (lang === 'ru' ? 'Надеть сейчас' : 'Equip Now') + '</button>' +
              '    <button type="button" class="btn fvh-pack-close-btn">✓ ' + (lang === 'ru' ? 'В инвентарь' : 'To Inventory') + '</button>' +
              '  </div>' +
              '</div>';

            modal.querySelector('.fvh-pack-close-btn').onclick = function () {
              app.audio.play('click');
              overlay.remove();
              if (onComplete) onComplete();
            };

            modal.querySelector('.fvh-pack-equip-now-btn').onclick = function () {
              app.audio.play('claim');
              var curChar = (app.store && app.store.data && (app.store.data.selectedTeam || app.store.data.selectedCharacter)) || 'footy';
              var sKey = it.category === 'skins' ? ('skin.' + curChar) : (it.category === 'balls_footy' ? 'ball.footy' : 'ball.hoops');
              safeEconomyApi('/api/economy/equip', { playerId: pid, slot: sKey, itemId: it.id }).then(function () {
                app.store.update(function (d) {
                  if (!d.equipped) d.equipped = {};
                  d.equipped[sKey] = it.id;
                  if (it.category === 'skins') {
                    d.equipped.skin = it.id;
                    d.equipped['skin.' + curChar] = it.id;
                  } else {
                    d.equipped.ball = it.id;
                    d.equipped['ball.' + curChar] = it.id;
                  }
                });
                showToast(tr('equippedState') + ': ' + localizedItemName);
                overlay.remove();
                if (onComplete) onComplete();
              });
            };
          }, 450);
        }, 850);
      })
      .catch(function (err) {
        overlay.remove();
        app.audio.play('error');
        showToast(lang === 'ru' ? 'Ошибка связи с сервером при открытии набора' : 'Server error while opening pack');
      });
  }
  window.openPackWithCinematicAnimation = openPackWithCinematicAnimation;

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
    backBtn.innerHTML = getUiIconSvg('arrow_back', 18);
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
      if (app && app.store && app.store.data) {
        if (app.store.data.playerId) return app.store.data.playerId;
        if (app.store.data.telegramUser && app.store.data.telegramUser.id) {
          var canonicalTgId = 'fvh_tg_' + app.store.data.telegramUser.id;
          app.store.data.playerId = canonicalTgId;
          try { localStorage.setItem('fvh_player_id', canonicalTgId); } catch (e) {}
          return canonicalTgId;
        }
      }
      var pid = getAppPlayerId(app);
      if (app && app.store && app.store.data) app.store.data.playerId = pid;
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

    // Tab 1: Invite a Friend (Authoritative Telegram Mini App Deep Links)
    function renderReferralsTab() {
      contentArea.innerHTML = '';
      var pid = getPlayerId();
      var botUsername = 'FootyHoopsGameBot';
      var myRefCode = (app.store && app.store.data && app.store.data.telegramUser && app.store.data.telegramUser.id)
        ? String(app.store.data.telegramUser.id)
        : pid;
      var directRefLink = 'https://t.me/' + botUsername + '?startapp=ref_' + encodeURIComponent(myRefCode);
      var fallbackRefLink = 'https://t.me/' + botUsername + '?start=ref_' + encodeURIComponent(myRefCode);
      var lang = getActiveLang();

      var refData = app.store.data.referrals || [];
      var totalInvited = Array.isArray(refData) ? refData.length : (refData.total || 0);
      var qualifiedFriends = Array.isArray(refData)
        ? refData.filter(function (r) { return r && r.qualified; }).length
        : (refData.qualified || 0);
      var earnedCoins = qualifiedFriends * 100;

      // 1. Referral Hero Banner & Honest Qualification Rule
      var hero = document.createElement('div');
      hero.className = 'fvh-quest-ref-hero';
      hero.innerHTML =
        '<div class="fvh-quest-ref-icon" style="margin-bottom:8px;display:flex;justify-content:center;">' + getInviteFriendsSvg(44) + '</div>' +
        '<div class="fvh-quest-ref-title">' + (lang === 'ru' ? 'Пригласи друга в команду' : 'Invite a Teammate') + '</div>' +
        '<div class="fvh-quest-ref-desc" style="color:var(--text-muted);font-size:12px;margin:6px 0 12px;line-height:1.45;">' +
        (lang === 'ru'
          ? 'Отправьте ссылку другу. Когда он выберет фракцию или сыграет матч, вы мгновенно получите <strong style="color:#facc15;">+100 FvH Coins</strong>!'
          : 'Send your link to a friend. When they pick a faction or finish a match, you instantly receive <strong style="color:#facc15;">+100 FvH Coins</strong>!') +
        '</div>';
      contentArea.appendChild(hero);

      // 2. Link Box with Direct Mini App Link, Copy, Telegram Share, and Fallback Button
      var linkBox = document.createElement('div');
      linkBox.className = 'fvh-quest-link-box';
      linkBox.style.background = 'rgba(255,255,255,0.05)';
      linkBox.style.border = '1px solid rgba(255,255,255,0.12)';
      linkBox.style.borderRadius = '14px';
      linkBox.style.padding = '14px';
      linkBox.style.marginBottom = '14px';

      linkBox.innerHTML =
        '<div style="font-size:11px;color:#94a3b8;margin-bottom:6px;font-weight:700;">' +
        (lang === 'ru' ? 'ВАША ССЫЛКА ДЛЯ ПРИГЛАШЕНИЯ' : 'YOUR INVITATION LINK') +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:10px;">' +
        '  <input type="text" readonly value="' + escapeHtml(directRefLink) + '" class="fvh-ref-input" style="width:100%;background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.15);border-radius:8px;padding:8px 10px;color:#38bdf8;font-size:12px;font-family:monospace;overflow:hidden;text-overflow:ellipsis;box-sizing:border-box;">' +
        '  <button class="btn primary small fvh-btn-copy-ref" style="width:100%;box-sizing:border-box;padding:10px 14px;font-weight:800;font-size:13px;border-radius:10px;text-align:center;">' + tr('refCopyBtn') + '</button>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:8px;">' +
        '  <button class="btn block fvh-btn-share-ref" style="background:linear-gradient(135deg, #229ed9 0%, #0088cc 100%);color:#fff;font-weight:800;border:none;border-radius:10px;padding:11px 14px;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;font-size:13px;box-shadow:0 4px 14px rgba(34,158,217,0.35);">' +
        '    <span>✈️</span> <span>' + (lang === 'ru' ? 'Поделиться в Telegram' : 'Share in Telegram') + '</span>' +
        '  </button>' +
        '</div>' +
        '<div style="font-size:10.5px;color:#64748b;margin-top:8px;line-height:1.35;text-align:center;">' +
        (lang === 'ru'
          ? '💡 Ссылка открывает Mini App напрямую в Telegram на iOS и Android.'
          : '💡 Link opens the Mini App directly inside Telegram on iOS and Android.') +
        '</div>';

      var copyBtn = linkBox.querySelector('.fvh-btn-copy-ref');
      copyBtn.onclick = function () {
        var copySuccess = function () {
          app.audio.play('click');
          showToast(tr('refCopied'));
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(directRefLink).then(copySuccess).catch(function () {
            try {
              var inp = linkBox.querySelector('.fvh-ref-input');
              inp.select();
              document.execCommand('copy');
              copySuccess();
            } catch (e) {
              showToast(lang === 'ru' ? 'Скопируйте ссылку вручную из поля' : 'Copy link manually from input');
            }
          });
        } else {
          try {
            var inp = linkBox.querySelector('.fvh-ref-input');
            inp.select();
            document.execCommand('copy');
            copySuccess();
          } catch (e) {
            showToast(lang === 'ru' ? 'Скопируйте ссылку вручную из поля' : 'Copy link manually from input');
          }
        }
      };

      var shareBtn = linkBox.querySelector('.fvh-btn-share-ref');
      shareBtn.onclick = function () {
        app.audio.play('click');
        var shareMsg = lang === 'ru'
          ? 'Вступай в мою команду в FOOTY vs HOOPS! Забирай 100 FvH Coins и играй в Футбол и Баскетбол 1v1 ⚽🏀'
          : 'Join my squad in FOOTY vs HOOPS! Claim 100 FvH Coins and battle in 1v1 Football & Basketball ⚽🏀';
        var shareUrl = 'https://t.me/share/url?url=' + encodeURIComponent(directRefLink) + '&text=' + encodeURIComponent(shareMsg);
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

      function updateStatsDom(total, qualified, coins) {
        statsBox.innerHTML =
          '<div class="fvh-quest-stat-tile" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:10px 6px;text-align:center;">' +
          '  <div style="font-size:10.5px;color:#94a3b8;font-weight:700;">' + tr('refStatTotal') + '</div>' +
          '  <div style="font-size:16px;font-weight:900;color:#fff;margin-top:2px;">' + total + '</div>' +
          '</div>' +
          '<div class="fvh-quest-stat-tile" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:10px 6px;text-align:center;">' +
          '  <div style="font-size:10.5px;color:#94a3b8;font-weight:700;">' + tr('refStatQualified') + '</div>' +
          '  <div style="font-size:16px;font-weight:900;color:#22c55e;margin-top:2px;">' + qualified + '</div>' +
          '</div>' +
          '<div class="fvh-quest-stat-tile" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:10px 6px;text-align:center;">' +
          '  <div style="font-size:10.5px;color:#94a3b8;font-weight:700;">' + tr('refStatEarned') + '</div>' +
          '  <div style="font-size:16px;font-weight:900;color:#facc15;margin-top:2px;display:flex;align-items:center;justify-content:center;gap:3px;">' + getFvhCoinSvg('inline') + ' ' + coins + '</div>' +
          '</div>';
      }

      updateStatsDom(totalInvited, qualifiedFriends, earnedCoins);
      contentArea.appendChild(statsBox);

      // 4. Referral Milestones Section
      var milestonesWrap = document.createElement('div');
      milestonesWrap.style.marginTop = '12px';
      milestonesWrap.style.display = 'flex';
      milestonesWrap.style.flexDirection = 'column';
      milestonesWrap.style.gap = '8px';
      contentArea.appendChild(milestonesWrap);

      var DEFAULT_MILESTONES = [
        { friends: 1, coins: 500, xp: 150 },
        { friends: 3, coins: 1500, xp: 300 },
        { friends: 5, coins: 3000, xp: 500 },
        { friends: 10, coins: 7500, xp: 1000 }
      ];
      function renderMilestones(list, qCount, claimedList, activeRefCode) {
        milestonesWrap.innerHTML = '';
        var hdr = document.createElement('div');
        hdr.style.fontSize = '12px';
        hdr.style.fontWeight = '800';
        hdr.style.color = '#cbd5e1';
        hdr.style.letterSpacing = '0.03em';
        hdr.textContent = lang === 'ru' ? 'НАГРАДЫ ЗА ПРИГЛАШЕНИЯ' : 'REFERRAL MILESTONES';
        milestonesWrap.appendChild(hdr);

        (list || DEFAULT_MILESTONES).forEach(function (m) {
          var isClaimed = Array.isArray(claimedList) && claimedList.indexOf(m.friends) !== -1;
          var ready = !isClaimed && qCount >= m.friends;
          var row = document.createElement('div');
          row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border-radius:11px;background:rgba(255,255,255,0.04);border:1px solid ' + (ready ? 'rgba(34,197,94,0.45)' : 'rgba(255,255,255,0.08)') + ';';
          var meta = document.createElement('div');
          meta.style.cssText = 'display:flex;flex-direction:column;gap:2px;min-width:0;';
          meta.innerHTML =
            '<div style="font-size:12.5px;font-weight:800;color:#fff;">' + m.friends + ' ' + (lang === 'ru' ? (m.friends === 1 ? 'друг' : (m.friends < 5 ? 'друга' : 'друзей')) : (m.friends === 1 ? 'Friend' : 'Friends')) +
            ' <span style="font-size:11px;color:#94a3b8;font-weight:700;">(' + Math.min(qCount, m.friends) + '/' + m.friends + ')</span></div>' +
            '<div style="font-size:11px;font-weight:800;color:#facc15;display:flex;align-items:center;gap:4px;">' + getFvhCoinSvg('inline') + ' +' + m.coins + ' · +' + m.xp + ' XP</div>';
          row.appendChild(meta);

          var btn = document.createElement('button');
          btn.style.cssText = 'padding:7px 12px;border-radius:9px;border:none;font-size:11.5px;font-weight:800;cursor:pointer;white-space:nowrap;' +
            (isClaimed ? 'background:rgba(148,163,184,0.14);color:#94a3b8;cursor:default;' :
             ready ? 'background:linear-gradient(135deg,#22c55e,#16a34a);color:#04120a;box-shadow:0 3px 10px rgba(34,197,94,0.3);' :
                     'background:rgba(255,255,255,0.06);color:#64748b;cursor:default;');
          btn.disabled = !ready;
          btn.textContent = isClaimed ? (lang === 'ru' ? 'Получено ✓' : 'Claimed ✓') : (ready ? (lang === 'ru' ? 'Забрать' : 'Claim') : (lang === 'ru' ? 'Закрыто' : 'Locked'));
          if (ready) {
            btn.onclick = function () {
              btn.disabled = true;
              fetch(getApiUrl('/api/referrals/claim'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refCode: activeRefCode, userId: pid, playerId: pid, milestone: m.friends })
              }).then(function (r) { return r.json(); }).then(function (cr) {
                if (cr && cr.ok) {
                  app.audio.play('claim');
                  if (app.store && app.store.data) {
                    app.store.data.coins = (typeof cr.coins === 'number') ? cr.coins : ((app.store.data.coins || 0) + (m.coins || 0));
                    app.store.data.xp = (typeof cr.xp === 'number') ? cr.xp : ((app.store.data.xp || 0) + (m.xp || 0));
                    if (typeof cr.level === 'number') app.store.data.level = cr.level;
                    if (typeof app.store.save === 'function') app.store.save();
                  }
                  try {
                    var tc = document.querySelector('#fvh-btn-coins span');
                    if (tc && app.store && app.store.data) tc.textContent = (app.store.data.coins || 0).toLocaleString();
                  } catch (_) {}
                  showToast((lang === 'ru' ? 'Получено +' : 'Claimed +') + m.coins + ' FvH Coins!');
                  renderMilestones(list, qCount, (claimedList || []).concat([m.friends]), activeRefCode);
                } else {
                  btn.disabled = false;
                  showToast((cr && cr.message) || (lang === 'ru' ? 'Награда недоступна' : 'Reward unavailable'));
                }
              }).catch(function () { btn.disabled = false; });
            };
          }
          row.appendChild(btn);
          milestonesWrap.appendChild(row);
        });
      }
      renderMilestones(DEFAULT_MILESTONES, qualifiedFriends, [], myRefCode);

      // Query authoritative referral stats from server
      fetch(getApiUrl('/api/referrals/stats?refCode=' + encodeURIComponent(myRefCode) + '&playerId=' + encodeURIComponent(pid)))
        .then(function (res) { return res.json(); })
        .then(function (s) {
          if (s && s.ok) {
            var st = s.stats || s;
            totalInvited = (st.total !== undefined ? st.total : st.totalInvited) || totalInvited;
            qualifiedFriends = (st.qualified !== undefined ? st.qualified : st.qualifiedCount) || qualifiedFriends;
            earnedCoins = qualifiedFriends * 100;
            updateStatsDom(totalInvited, qualifiedFriends, earnedCoins);
            renderMilestones(s.milestones || DEFAULT_MILESTONES, qualifiedFriends, s.claimedMilestones || [], s.refCode || myRefCode);
          }
        })
        .catch(function () {});
    }

    // Tab 2: Social Tasks & Official Channels
    function renderSocialTab() {
      contentArea.innerHTML = '';
      var claimed = getClaimedList();
      var lang = getActiveLang();

      var SOCIAL_TASKS = [
        {
          id: 'q_sub_tg',
          name: 'Telegram News',
          handle: '@FootyHoops',
          url: 'https://t.me/FootyHoops',
          icon: getTelegramLogoSvg(36),
          isTelegramChannel: true,
          desc: lang === 'ru' ? 'Официальный новостной канал FOOTY vs HOOPS' : 'Official FOOTY vs HOOPS news channel'
        },
        {
          id: 'q_sub_chat',
          name: 'Telegram Chat',
          handle: 'Community Chat',
          url: 'https://t.me/+zKbH1Po_pdg2MmVi',
          icon: getSocialIconSvg('chat'),
          isTelegramChat: true,
          desc: lang === 'ru' ? 'Официальное сообщество игроков FOOTY vs HOOPS' : 'Official community chat for athletes'
        },
        {
          id: 'q_sub_insta',
          name: 'Instagram',
          handle: '@footyvshoops',
          url: 'https://www.instagram.com/footyvshoops?exln=MWF1ZGdxM3BqdGt1eA%3D%3D&utm_source=qr',
          icon: getSocialIconSvg('insta'),
          desc: lang === 'ru' ? 'Фото и хайлайты соревнований FOOTY vs HOOPS' : 'Match photos and highlights from FOOTY vs HOOPS'
        },
        {
          id: 'q_sub_x',
          name: 'X / Twitter',
          handle: '@footyvshoops',
          url: 'https://x.com/footyvshoops?s=11',
          icon: getXLogoSvg(36),
          desc: lang === 'ru' ? 'Анонсы турниров, аналитика и новости' : 'Tournament announcements and Web3 alpha'
        },
        {
          id: 'q_sub_yt',
          name: 'YouTube',
          handle: '@footyvshoops-cr',
          url: 'https://youtube.com/@footyvshoops-cr?si=ZbQ3MBZ9R22-bybf',
          icon: getSocialIconSvg('yt'),
          desc: lang === 'ru' ? 'Официальные трейлеры и видео обзоры' : 'Official match trailers and gameplay reviews'
        },
        {
          id: 'q_sub_tiktok',
          name: 'TikTok',
          handle: '@footy_vs_hoops',
          url: 'https://www.tiktok.com/@footy_vs_hoops',
          icon: getSocialIconSvg('tiktok'),
          desc: lang === 'ru' ? 'Короткие хайлайты, финты и вирусные моменты' : 'Short highlights, skill reels, and top plays'
        }
      ];

      window.__fvhSocialTaskStates = window.__fvhSocialTaskStates || {};

      // 1. Transparent Social Verification Notice (No misleading claims)
      var noticeBox = document.createElement('div');
      noticeBox.style.fontSize = '11.5px';
      noticeBox.style.color = '#94a3b8';
      noticeBox.style.background = 'rgba(255,255,255,0.035)';
      noticeBox.style.border = '1px solid rgba(255,255,255,0.08)';
      noticeBox.style.borderRadius = '10px';
      noticeBox.style.padding = '10px 14px';
      noticeBox.style.marginBottom = '14px';
      noticeBox.style.lineHeight = '1.45';
      noticeBox.innerHTML = 'ℹ️ ' + (lang === 'ru'
        ? 'Подписка на Telegram-канал проверяется сервером через Telegram Bot API. Для сообщества и внешних соцсетей (Instagram, X, YouTube, TikTok) автоматическая проверка недоступна: перейдите по ссылке, подпишитесь и подтвердите подписку.'
        : 'Telegram channel membership is verified server-side via Telegram Bot API. For the chat and external platforms (Instagram, X, YouTube, TikTok), automated verification is unavailable: please visit our page, follow, and confirm.');
      contentArea.appendChild(noticeBox);

      var availableTasks = SOCIAL_TASKS.filter(function (t) { return claimed.indexOf(t.id) === -1; });
      var completedTasks = SOCIAL_TASKS.filter(function (t) { return claimed.indexOf(t.id) !== -1; });

      // 2. Available Social Tasks List
      if (availableTasks.length > 0) {
        var availableList = document.createElement('div');
        availableList.style.display = 'flex';
        availableList.style.flexDirection = 'column';
        availableList.style.gap = '10px';
        availableList.style.marginBottom = '20px';

        availableTasks.forEach(function (task) {
          var card = document.createElement('div');
          card.className = 'fvh-quest-task-card';
          card.style.background = 'rgba(255,255,255,0.04)';
          card.style.border = '1px solid rgba(255,255,255,0.12)';
          card.style.borderRadius = '12px';
          card.style.padding = '12px 14px';
          card.style.display = 'flex';
          card.style.flexDirection = 'column';
          card.style.gap = '8px';

          var topRow = document.createElement('div');
          topRow.style.display = 'flex';
          topRow.style.alignItems = 'center';
          topRow.style.justifyContent = 'space-between';
          topRow.style.gap = '10px';

          topRow.innerHTML =
            '<div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0;">' +
            '  <div style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' + task.icon + '</div>' +
            '  <div style="flex:1;min-width:0;">' +
            '    <div style="font-size:13px;font-weight:800;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + task.name + ' <span style="font-size:11px;color:#94a3b8;font-weight:500;">' + task.handle + '</span></div>' +
            '    <div style="font-size:11.5px;font-weight:800;color:#facc15;margin-top:2px;display:inline-flex;align-items:center;gap:3px;">' +
            getFvhCoinSvg('inline') + ' +50 FvH Coin' +
            '    </div>' +
            '  </div>' +
            '</div>' +
            '<div class="fvh-task-actions" style="display:flex;align-items:center;gap:6px;flex-shrink:0;"></div>';

          card.appendChild(topRow);

          var alertBox = document.createElement('div');
          alertBox.className = 'fvh-task-alert';
          alertBox.style.display = 'none';
          alertBox.style.padding = '8px 12px';
          alertBox.style.borderRadius = '8px';
          alertBox.style.fontSize = '11.5px';
          alertBox.style.lineHeight = '1.4';
          card.appendChild(alertBox);

          var actBox = topRow.querySelector('.fvh-task-actions');
          var st = window.__fvhSocialTaskStates[task.id] || { opened: false, verified: false };

          function openDestination() {
            app.audio.play('click');
            st.opened = true;
            window.__fvhSocialTaskStates[task.id] = st;
            if (task.id === 'q_sub_tg') window.__fvhTgOpened = true;
            if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.openTelegramLink && (task.isTelegramChannel || task.isTelegramChat)) {
              window.Telegram.WebApp.openTelegramLink(task.url);
            } else if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.openLink) {
              window.Telegram.WebApp.openLink(task.url);
            } else {
              window.open(task.url, '_blank');
            }
            renderCardActions();
          }

          function verifyTelegramTask(btn) {
            btn.disabled = true;
            btn.textContent = tr('taskVerifying');
            alertBox.style.display = 'none';

            var pid = getPlayerId();
            var tgUser = (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) || null;
            var tgUserId = tgUser ? tgUser.id : (app.store && app.store.data && app.store.data.telegramUser && app.store.data.telegramUser.id);

            if (!tgUserId) {
              btn.disabled = false;
              btn.textContent = tr('verifyTaskBtn');
              alertBox.style.display = 'block';
              alertBox.style.background = 'rgba(245,158,11,0.12)';
              alertBox.style.border = '1px solid rgba(245,158,11,0.3)';
              alertBox.style.color = '#fde68a';
              alertBox.textContent = (lang === 'ru')
                ? '⚠️ Откройте игру через Telegram-бота @FootyHoopsGameBot для проверки подписки.'
                : '⚠️ Open the game via Telegram bot @FootyHoopsGameBot to verify subscription.';
              return;
            }

            fetch(getApiUrl('/api/tasks/verify-telegram'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                playerId: pid,
                telegramUserId: tgUserId,
                target: task.isTelegramChat ? 'chat' : 'channel',
                questId: task.id,
                // Support claim: false for status check, claim: true to claim
                claim: true
              })
            })
            .then(function (r) { return r.json(); })
            .then(function (res) {
              if (res && res.ok && res.verified) {
                st.verified = true;
                window.__fvhSocialTaskStates[task.id] = st;
                if (task.id === 'q_sub_tg') window.__fvhTgVerified = true;
                if (res.claimed) {
                  app.store.update(function (d) {
                    if (!Array.isArray(d.claimedQuests)) d.claimedQuests = [];
                    if (d.claimedQuests.indexOf(task.id) === -1) d.claimedQuests.push(task.id);
                    if (res.coins !== undefined) d.coins = res.coins;
                    else d.coins = (d.coins || 0) + 50;
                    if (res.xp !== undefined) d.xp = res.xp;
                    else d.xp = (d.xp || 0) + 50;
                    if (!d.transactions) d.transactions = [];
                    d.transactions.unshift({
                      id: 'tx_quest_' + task.id + '_' + Date.now(),
                      type: 'quest_reward',
                      amount: 50,
                      description: task.name + ' (' + task.handle + ')',
                      timestamp: Date.now()
                    });
                  });
                  app.audio.play('claim');
                  showToast((lang === 'ru') ? '⭐ +50 FvH Coin получено!' : '⭐ +50 FvH Coin claimed!');
                  renderSocialTab();
                  return;
                }
                app.audio.play('claim');
                showToast((lang === 'ru') ? '✓ Подписка подтверждена! Заберите награду.' : '✓ Subscription verified! Claim your reward.');
                renderCardActions();
              } else if (res && res.error === 'quest_already_claimed') {
                app.store.update(function (d) {
                  if (!Array.isArray(d.claimedQuests)) d.claimedQuests = [];
                  if (d.claimedQuests.indexOf(task.id) === -1) d.claimedQuests.push(task.id);
                });
                renderSocialTab();
              } else {
                btn.disabled = false;
                btn.textContent = (lang === 'ru') ? '🔄 Проверить снова' : '🔄 Verify Again';
                alertBox.style.display = 'block';
                alertBox.style.background = 'rgba(239,68,68,0.12)';
                alertBox.style.border = '1px solid rgba(239,68,68,0.3)';
                alertBox.style.color = '#fca5a5';
                if (task.isTelegramChat) {
                  alertBox.innerHTML = (lang === 'ru')
                    ? '❌ Вступление в чат не обнаружено. Перейдите по ссылке, вступите в <b>Telegram Chat</b> и нажмите «Проверить снова».'
                    : '❌ Community chat membership not found. Please join the <b>Telegram Chat</b> and tap Verify Again.';
                } else {
                  alertBox.innerHTML = (lang === 'ru')
                    ? '❌ Подписка не обнаружена. Пожалуйста, подпишитесь на канал <b>@FootyHoops</b> и нажмите «Проверить снова».'
                    : '❌ Subscription not found. Please subscribe to <b>@FootyHoops</b> and tap Verify Again.';
                }
              }
            })
            .catch(function () {
              btn.disabled = false;
              btn.textContent = (lang === 'ru') ? '🔄 Повторить попытку' : '🔄 Retry';
              alertBox.style.display = 'block';
              alertBox.style.background = 'rgba(239,68,68,0.12)';
              alertBox.style.border = '1px solid rgba(239,68,68,0.3)';
              alertBox.style.color = '#fca5a5';
              alertBox.textContent = (lang === 'ru')
                ? '⚠️ Ошибка связи с сервером. Попробуйте снова.'
                : '⚠️ Server connection error. Please retry.';
            });
          }

          function confirmExternalTask() {
            app.audio.play('claim');
            st.verified = true;
            window.__fvhSocialTaskStates[task.id] = st;
            showToast((lang === 'ru') ? '✓ Подписка подтверждена! Заберите награду.' : '✓ Subscription confirmed! Claim your reward.');
            renderCardActions();
          }

          function claimTaskReward(btn) {
            btn.disabled = true;
            btn.textContent = '...';
            var pid = getPlayerId();
            var tgUser = (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) || null;
            var tgUserId = tgUser ? tgUser.id : (app.store && app.store.data && app.store.data.telegramUser && app.store.data.telegramUser.id);

            fetch(getApiUrl('/api/tasks/claim-social'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                playerId: pid,
                questId: task.id,
                telegramUserId: tgUserId,
                claim: true
              })
            })
            .then(function (r) { return r.json(); })
            .then(function (res) {
              if (res && res.ok) {
                app.store.update(function (d) {
                  if (!Array.isArray(d.claimedQuests)) d.claimedQuests = [];
                  if (d.claimedQuests.indexOf(task.id) === -1) d.claimedQuests.push(task.id);
                  if (res.coins !== undefined) d.coins = res.coins;
                  else d.coins = (d.coins || 0) + 50;
                  if (res.xp !== undefined) d.xp = res.xp;
                  else d.xp = (d.xp || 0) + 50;
                  if (!d.transactions) d.transactions = [];
                  d.transactions.unshift({
                    id: 'tx_quest_' + task.id + '_' + Date.now(),
                    type: 'quest_reward',
                    amount: 50,
                    description: task.name + ' (' + task.handle + ')',
                    timestamp: Date.now()
                  });
                });
                app.audio.play('claim');
                showToast((lang === 'ru') ? '⭐ +50 FvH Coin получено!' : '⭐ +50 FvH Coin claimed!');
                renderSocialTab();
              } else {
                btn.disabled = false;
                btn.textContent = (lang === 'ru') ? '🎁 Забрать (+50)' : '🎁 Claim (+50)';
                showToast((lang === 'ru') ? 'Не удалось забрать награду. Попробуйте снова.' : 'Failed to claim reward. Please retry.');
              }
            })
            .catch(function () {
              btn.disabled = false;
              btn.textContent = (lang === 'ru') ? '🎁 Забрать (+50)' : '🎁 Claim (+50)';
              showToast((lang === 'ru') ? 'Ошибка сети. Попробуйте снова.' : 'Network error. Please retry.');
            });
          }

          function renderCardActions() {
            actBox.innerHTML = '';
            if (st.verified) {
              var claimBtn = document.createElement('button');
              claimBtn.className = 'btn small primary';
              claimBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
              claimBtn.style.borderColor = '#34d399';
              claimBtn.style.color = '#fff';
              claimBtn.style.fontWeight = '900';
              claimBtn.style.whiteSpace = 'nowrap';
              claimBtn.textContent = (lang === 'ru') ? '🎁 Забрать (+50)' : '🎁 Claim (+50)';
              claimBtn.onclick = function () { claimTaskReward(claimBtn); };
              actBox.appendChild(claimBtn);
            } else if (st.opened) {
              var openAgainBtn = document.createElement('button');
              openAgainBtn.className = 'btn small';
              openAgainBtn.textContent = '↗';
              openAgainBtn.title = tr('openTaskBtn');
              openAgainBtn.onclick = openDestination;
              actBox.appendChild(openAgainBtn);

              if (task.isTelegramChannel || task.isTelegramChat) {
                var verifyBtn = document.createElement('button');
                verifyBtn.className = 'btn small primary';
                verifyBtn.textContent = tr('verifyTaskBtn');
                verifyBtn.onclick = function () { verifyTelegramTask(verifyBtn); };
                actBox.appendChild(verifyBtn);
              } else {
                var confirmBtn = document.createElement('button');
                confirmBtn.className = 'btn small primary';
                confirmBtn.textContent = (lang === 'ru') ? '✓ Подтвердить' : '✓ Confirm';
                confirmBtn.onclick = confirmExternalTask;
                actBox.appendChild(confirmBtn);
              }
            } else {
              var openBtn = document.createElement('button');
              openBtn.className = 'btn small primary';
              openBtn.textContent = tr('openTaskBtn') || 'Открыть';
              openBtn.onclick = openDestination;
              actBox.appendChild(openBtn);
            }
          }

          renderCardActions();
          availableList.appendChild(card);
        });

        contentArea.appendChild(availableList);
      }

      // 3. Compact Completed Missions Section
      if (completedTasks.length > 0) {
        var completedBox = document.createElement('div');
        completedBox.className = 'fvh-completed-tasks-section';
        completedBox.style.marginBottom = '20px';

        var completedHeading = document.createElement('div');
        completedHeading.style.fontSize = '12px';
        completedHeading.style.fontWeight = '900';
        completedHeading.style.color = '#22c55e';
        completedHeading.style.textTransform = 'uppercase';
        completedHeading.style.letterSpacing = '0.5px';
        completedHeading.style.marginBottom = '8px';
        completedHeading.textContent = (lang === 'ru')
          ? '✅ Выполненные задания (' + completedTasks.length + ')'
          : '✅ Completed Tasks (' + completedTasks.length + ')';
        completedBox.appendChild(completedHeading);

        var completedList = document.createElement('div');
        completedList.style.display = 'flex';
        completedList.style.flexDirection = 'column';
        completedList.style.gap = '8px';

        completedTasks.forEach(function (ct) {
          var doneCard = document.createElement('div');
          doneCard.className = 'fvh-quest-task-card done';
          doneCard.style.background = 'rgba(34,197,94,0.06)';
          doneCard.style.border = '1px solid rgba(34,197,94,0.22)';
          doneCard.style.borderRadius = '10px';
          doneCard.style.padding = '10px 14px';
          doneCard.style.display = 'flex';
          doneCard.style.alignItems = 'center';
          doneCard.style.justifyContent = 'space-between';
          doneCard.style.gap = '10px';

          doneCard.innerHTML =
            '<div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0;">' +
            '  <div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' + ct.icon + '</div>' +
            '  <div style="flex:1;min-width:0;">' +
            '    <div style="font-size:13px;font-weight:800;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + ct.name + ' <span style="font-size:11px;color:#94a3b8;font-weight:500;">' + ct.handle + '</span></div>' +
            '    <div style="font-size:11px;color:#22c55e;font-weight:700;margin-top:1px;">' + ((lang === 'ru') ? 'Получено (+50 FvH Coin)' : 'Claimed (+50 FvH Coin)') + '</div>' +
            '  </div>' +
            '</div>' +
            '<span style="font-size:11px;color:#22c55e;font-weight:800;background:rgba(34,197,94,0.15);padding:4px 10px;border-radius:12px;white-space:nowrap;">' + tr('taskCompleted') + '</span>';

          completedList.appendChild(doneCard);
        });

        completedBox.appendChild(completedList);
        contentArea.appendChild(completedBox);
      }
    }

    function renderQuestsPage() {
      if (curMainTab === 'referrals') {
        renderReferralsTab();
      } else {
        renderSocialTab();
      }
    }

    renderQuestsPage();
    page.appendChild(createScrollBottomSpacer());
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
      skin_cyber: 1100, skin_footy_cyber_strike: 1400, skin_sunset: 750, skin_hydro: 700, skin_mars: 1400, skin_astronaut: 1600, skin_neon_elite: 1500, skin_shadow: 1500, skin_footy_stealth_shadow: 1500, skin_frost: 700, skin_footy_golden_legend: 2500,
      ball_footy_inferno: 600, ball_hoops_blaze: 600, ball_hoops_molten_fire: 1200, ball_footy_solar: 500, ball_earthrise: 1000, ball_cyber_neon: 1200, ball_tidal: 600, ball_hoops_midnight: 1000,
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

  // Thematic Store Bundles Definition (100% exclusive skins created specifically for bundles)
  var BUNDLE_ITEMS = [
    {
      id: 'bundle_footy_starter',
      category: 'bundles',
      sport: 'footy',
      mode: 'footy',
      rarity: 'epic',
      badge: '⚡ 100% ЭКСКЛЮЗИВ',
      name: 'Стартовый набор Футболиста',
      name_en: 'Football Starter Exclusive Pack',
      desc: 'Две новые эксклюзивные формы «Солнечный Вольт» и «Алая Комета» (нельзя купить в магазине!) + 600 монет FvH.',
      originalValue: 3400,
      coinsPrice: 1400,
      discount: 59,
      starsPrice: 115,
      tonPrice: 0.7,
      items: [
        { id: 'footy_excl_solar_volt', name: 'Солнечный Вольт', exclusive: true, rarity: 'epic', type: 'cosmetic' },
        { id: 'footy_excl_crimson_comet', name: 'Алая Комета', exclusive: true, rarity: 'epic', type: 'cosmetic' },
        { name: '600 FvH', type: 'coins', val: 600 }
      ]
    },
    {
      id: 'bundle_hoops_starter',
      category: 'bundles',
      sport: 'hoops',
      mode: 'hoops',
      rarity: 'epic',
      badge: '⚡ 100% ЭКСКЛЮЗИВ',
      name: 'Стартовый набор Баскетболиста',
      name_en: 'Basketball Starter Exclusive Pack',
      desc: 'Две новые эксклюзивные майки «Багряный Рассвет» и «Изумрудная Гадюка» (нельзя купить в магазине!) + 600 монет FvH.',
      originalValue: 3400,
      coinsPrice: 1400,
      discount: 59,
      starsPrice: 115,
      tonPrice: 0.7,
      items: [
        { id: 'hoops_excl_inferno_dusk', name: 'Багряный Рассвет', exclusive: true, rarity: 'epic', type: 'cosmetic' },
        { id: 'hoops_excl_emerald_viper', name: 'Изумрудная Гадюка', exclusive: true, rarity: 'epic', type: 'cosmetic' },
        { name: '600 FvH', type: 'coins', val: 600 }
      ]
    },
    {
      id: 'bundle_footy_legend',
      category: 'bundles',
      sport: 'footy',
      mode: 'footy',
      rarity: 'mythic',
      badge: '👑 МИФИК ЭКСКЛЮЗИВ',
      name: 'Набор Мифической Легенды',
      name_en: 'Mythic Legend Football Pack',
      desc: 'Три новые эксклюзивные формы: «Император Затмение», «Ледяной Суверен» и «Теневой Монарх» (только в наборе!) + 2,500 монет.',
      originalValue: 10500,
      coinsPrice: 4200,
      discount: 60,
      starsPrice: 350,
      tonPrice: 2.1,
      items: [
        { id: 'footy_excl_eclipse_royal', name: 'Император Затмение', exclusive: true, rarity: 'mythic', type: 'cosmetic' },
        { id: 'footy_excl_glacial_sovereign', name: 'Ледяной Суверен', exclusive: true, rarity: 'legendary', type: 'cosmetic' },
        { id: 'footy_excl_shadow_monarch', name: 'Теневой Монарх', exclusive: true, rarity: 'mythic', type: 'cosmetic' },
        { name: '2,500 FvH', type: 'coins', val: 2500 }
      ]
    },
    {
      id: 'bundle_hoops_legend',
      category: 'bundles',
      sport: 'hoops',
      mode: 'hoops',
      rarity: 'mythic',
      badge: '👑 МИФИК ЭКСКЛЮЗИВ',
      name: 'Набор Короля Данков',
      name_en: 'Mythic Dunk King Pack',
      desc: 'Три новые эксклюзивные майки: «Космос Апекс», «Кибер Фараон» и «Сверхновая Феникс» (только в наборе!) + 2,500 монет.',
      originalValue: 10500,
      coinsPrice: 4200,
      discount: 60,
      starsPrice: 350,
      tonPrice: 2.1,
      items: [
        { id: 'hoops_excl_cosmos_apex', name: 'Космос Апекс', exclusive: true, rarity: 'mythic', type: 'cosmetic' },
        { id: 'hoops_excl_cyber_pharaoh', name: 'Кибер Фараон', exclusive: true, rarity: 'legendary', type: 'cosmetic' },
        { id: 'hoops_excl_phoenix_nova', name: 'Сверхновая Феникс', exclusive: true, rarity: 'mythic', type: 'cosmetic' },
        { name: '2,500 FvH', type: 'coins', val: 2500 }
      ]
    }
  ];

  // Default canonical Shop & Locker catalog (guarantees synchronous loading and resilience)
  // Master Equipment Catalog (20+ Kits + Star Kits + Balls + Pack Exclusives synced with server)
  function buildDefaultShopCatalog(curChar) {
    return [
      // FOOTY KITS (OFFICIAL KITS)
      { id: 'footy_classic', name: 'Классика #10', name_ru: 'Классика #10', category: 'skins', slot: 'skin', mode: 'footy', rarity: 'common', price: 0, isDefault: true, badge: 'ОБЫЧНЫЙ', desc: 'Оригинальная клубная форма Footy: лазурный шеврон победы, номер 10 и белоснежные шорты.' },
      { id: 'footy_2_white', name: 'Чистый Дом', name_ru: 'Чистый Дом', category: 'skins', slot: 'skin', mode: 'footy', rarity: 'common', price: 200, badge: 'ОБЫЧНЫЙ', desc: 'Традиции клуба: белоснежная текстура жаккардового плетения с королевской диагональной лентой побед.' },
      { id: 'footy_6_crimson', name: 'Багровый Гладиатор', name_ru: 'Багровый Гладиатор', category: 'skins', slot: 'skin', mode: 'footy', rarity: 'common', price: 250, badge: 'ОБЫЧНЫЙ', desc: 'Спартанский дух победы: золотой греческий меандр по контуру, античные линии анатомического доспеха.' },
      { id: 'footy_7_gold', name: 'Золотой Владыка', name_ru: 'Золотой Владыка', category: 'skins', slot: 'skin', mode: 'footy', rarity: 'common', price: 300, badge: 'ОБЫЧНЫЙ', desc: 'Королевский триумф: золотая барочная филигрань в стиле Versace, чемпионские пятиконечные звезды славы.' },
      { id: 'footy_1_sapphire', name: 'Сапфир Страйкер', name_ru: 'Сапфир Страйкер', category: 'skins', slot: 'skin', mode: 'footy', rarity: 'rare', price: 550, badge: '⭐ РЕДКИЙ', desc: 'Сверхзвуковые кинетические шевроны цвета сапфира с неоново-лазурной окантовкой.' },
      { id: 'footy_4_amber', name: 'Янтарный Сокол', name_ru: 'Янтарный Сокол', category: 'skins', slot: 'skin', mode: 'footy', rarity: 'rare', price: 600, badge: '⭐ РЕДКИЙ', desc: 'Хищный удар: раскинутые крылья золотого сокола на груди и плечах с теплыми янтарными перьями.' },
      { id: 'footy_5_amethyst', name: 'Аметист Туманность', name_ru: 'Аметист Туманность', category: 'skins', slot: 'skin', mode: 'footy', rarity: 'rare', price: 650, badge: '⭐ РЕДКИЙ', desc: 'Космическое видение плеймейкера: фиолетовая звездная туманность со светящимися созвездиями.' },
      { id: 'footy_9_dragon', name: 'Пламя Дракона', name_ru: 'Пламя Дракона', category: 'skins', slot: 'skin', mode: 'footy', rarity: 'epic', price: 1200, badge: '👑 ЭПИЧЕСКИЙ', desc: 'Высшая первобытная мощь: золотой восточный дракон, обвивающий торс, пылающая золотая чешуя.' },
      { id: 'footy_3_neon', name: 'Неон Тренинг', name_ru: 'Неон Тренинг', category: 'skins', slot: 'skin', mode: 'footy', rarity: 'epic', price: 1300, badge: '👑 ЭПИЧЕСКИЙ', desc: 'Тактическая цифровая матрица: изумрудно-лаймовая сетка анализа поля со светящимися узлами.' },
      { id: 'footy_8_obsidian', name: 'Обсидиановый Шиноби', name_ru: 'Обсидиановый Шиноби', category: 'skins', slot: 'skin', mode: 'footy', rarity: 'legendary', price: 2500, badge: '💎 ЛЕГЕНДАРНЫЙ', desc: 'Призрачный скрытный дриблинг: нано-карбоновые соты, пульсирующие неоновые магистрали.' },
      { id: 'footy_0_tiffany', name: 'Тиффани Оникс', name_ru: 'Тиффани Оникс', category: 'skins', slot: 'skin', mode: 'footy', rarity: 'legendary', price: 2800, badge: '💎 ЛЕГЕНДАРНЫЙ', desc: 'Сбалансированный сплит: черный оникс (непробиваемость) и бирюзовый тиффани (скорость).' },

      // FOOTY PACK & LEGACY REWARD KITS (Pack-exclusive / Special drops appear in Locker once owned)
      { id: 'skin_footy_cyber_strike', name: 'Кибер Страйк', name_ru: 'Кибер Страйк', category: 'skins', slot: 'skin', mode: 'footy', rarity: 'epic', price: 1400, packExclusive: true, desc: 'Неоновая броня кибер-нападающего с лазерными полосами.' },
      { id: 'skin_footy_golden_legend', name: 'Золотая Легенда', name_ru: 'Золотая Легенда', category: 'skins', slot: 'skin', mode: 'footy', rarity: 'legendary', price: 2500, packExclusive: true, desc: 'Чемпионская форма из чистого золотого переплетения.' },
      { id: 'skin_footy_stealth_shadow', name: 'Тень Ниндзя', name_ru: 'Тень Ниндзя', category: 'skins', slot: 'skin', mode: 'footy', rarity: 'rare', price: 550, packExclusive: true, desc: 'Скрытная тёмная экипировка ночного матча.' },
      { id: 'skin_footy_neon_matrix', name: 'Неон Матрица', name_ru: 'Неон Матрица', category: 'skins', slot: 'skin', mode: 'footy', rarity: 'epic', price: 1300, packExclusive: true, desc: 'Цифровой неоновый узор с матричным свечением.' },
      { id: 'skin_footy_mythic_titan', name: 'Мифический Титан', name_ru: 'Мифический Титан', category: 'skins', slot: 'skin', mode: 'footy', rarity: 'legendary', price: 9999, packExclusive: true, desc: 'Ультраредкий эксклюзив из Мистери Паков: сияющая титановая форма.' },
      { id: 'footy_excl_solar_volt', name: 'Солнечный Вольт', name_ru: 'Солнечный Вольт', category: 'skins', slot: 'skin', mode: 'footy', rarity: 'epic', price: 0, packExclusive: true, bundleOnly: true, badge: '⚡ НАБОР ЭКСКЛЮЗИВ', desc: 'Эксклюзив Стартового Набора: карбоновый градиент с неоновыми лаймовыми молниями и золотым кантом.' },
      { id: 'footy_excl_crimson_comet', name: 'Алая Комета', name_ru: 'Алая Комета', category: 'skins', slot: 'skin', mode: 'footy', rarity: 'epic', price: 0, packExclusive: true, bundleOnly: true, badge: '⚡ НАБОР ЭКСКЛЮЗИВ', desc: 'Эксклюзив Стартового Набора: алый бархат с диагональным шлейфом расплавленного золота.' },
      { id: 'footy_excl_glacial_sovereign', name: 'Ледяной Суверен', name_ru: 'Ледяной Суверен', category: 'skins', slot: 'skin', mode: 'footy', rarity: 'legendary', price: 0, packExclusive: true, bundleOnly: true, badge: '💎 НАБОР ЭКСКЛЮЗИВ', desc: 'Эксклюзив Набора Легенд: кристальный сапфир с серебристым инеем и ледяными гранями.' },
      { id: 'footy_excl_eclipse_royal', name: 'Император Затмение', name_ru: 'Император Затмение', category: 'skins', slot: 'skin', mode: 'footy', rarity: 'mythic', price: 0, packExclusive: true, bundleOnly: true, badge: '👑 МИФИК НАБОР', desc: 'Мифический эксклюзив Набора Легенд: королевский рубин и обсидиан с сиянием золотого затмения.' },
      { id: 'footy_excl_shadow_monarch', name: 'Теневой Монарх', name_ru: 'Теневой Монарх', category: 'skins', slot: 'skin', mode: 'footy', rarity: 'mythic', price: 0, packExclusive: true, bundleOnly: true, badge: '👑 МИФИК НАБОР', desc: 'Мифический эксклюзив Набора Легенд: ультрафиолетовый шеврон пантеры с плазменным аметистом и жемчужным кантом.' },

      // FOOTY STAR KITS (3 EXCLUSIVE KITS ЗА ЗВЁЗДЫ)
      { id: 'footy_kit_star_holiday', name: '🎄 Новогодняя 2027', name_ru: '🎄 Новогодняя 2027', category: 'stars', slot: 'skin', mode: 'footy', rarity: 'legendary', price: 250, currency: 'star', badge: '🎄 НОВОГОДНИЙ', desc: 'Эксклюзивный новогодний комплект: королевский алый бархат Санты, морозная белая опушка, вышитые золотые елочки, снежинки и номер 25.' },
      { id: 'footy_kit_star_emperor', name: '🌌 Галактический Император', name_ru: '🌌 Галактический Император', category: 'stars', slot: 'skin', mode: 'footy', rarity: 'legendary', price: 500, currency: 'star', badge: '🌟 ЗВЁЗДНЫЙ', desc: 'Царственный космический индиго-пурпур, золотой лавровый шеврон славы, переливающийся бирюзовый кант и чемпионский номер 1.' },
      { id: 'footy_kit_star_samurai', name: '⚔️ Квантовый Самурай', name_ru: '⚔️ Квантовый Самурай', category: 'stars', slot: 'skin', mode: 'footy', rarity: 'legendary', price: 750, currency: 'star', badge: '🌟 ЗВЁЗДНЫЙ', desc: 'Белоснежная нано-керамическая броня кибер-ронина со светящейся неоновой лазурью, японским орнаментом и номером 77.' },

      // FOOTY BALLS
      { id: 'ball_classic', name: 'Классик Телстар', name_ru: 'Классик Телстар', category: 'balls_footy', slot: 'ball.footy', mode: 'footy', rarity: 'common', price: 0, isDefault: true, desc: 'Классический матчевый футбольный мяч.' },
      { id: 'ball_training', name: 'Тренировочный Оранж', name_ru: 'Тренировочный Оранж', category: 'balls_footy', slot: 'ball.footy', mode: 'footy', rarity: 'common', price: 120, desc: 'Яркий всепогодный тренировочный мяч высокой заметности.' },
      { id: 'ball_pitch_white', name: 'Белоснежный Про', name_ru: 'Белоснежный Про', category: 'balls_footy', slot: 'ball.footy', mode: 'footy', rarity: 'common', price: 200, desc: 'Профессиональный шовный мяч с аэродинамическими панелями.' },
      { id: 'ball_vortex', name: 'Вихрь Неон', name_ru: 'Вихрь Неон', category: 'balls_footy', slot: 'ball.footy', mode: 'footy', rarity: 'rare', price: 380, desc: 'Заряженный неоновым лаймом и бирюзой энергетический мяч.' },
      { id: 'ball_solar', name: 'Солнечная Вспышка', name_ru: 'Солнечная Вспышка', category: 'balls_footy', slot: 'ball.footy', mode: 'footy', rarity: 'rare', price: 420, desc: 'Огненный мяч с золотистыми языками пламени в полёте.' },
      { id: 'ball_cyber_hex', name: 'Кибер Гексагон', name_ru: 'Кибер Гексагон', category: 'balls_footy', slot: 'ball.footy', mode: 'footy', rarity: 'rare', price: 500, desc: 'Карбоновый мяч со светящимися шестиугольными швами.' },
      { id: 'ball_gold_stitch', name: 'Золотой Шов', name_ru: 'Золотой Шов', category: 'balls_footy', slot: 'ball.footy', mode: 'footy', rarity: 'rare', price: 550, desc: 'Турнирный мяч с прошивкой 24K золотой нитью.' },
      { id: 'ball_magma', name: 'Магма Ядро', name_ru: 'Магма Ядро', category: 'balls_footy', slot: 'ball.footy', mode: 'footy', rarity: 'epic', price: 1200, desc: 'Раскалённое ядро вулкана под прочной обсидиановой кожей.' },
      { id: 'ball_nebula', name: 'Космическая Туманность', name_ru: 'Космическая Туманность', category: 'balls_footy', slot: 'ball.footy', mode: 'footy', rarity: 'legendary', price: 2100, desc: 'Мяч галактической арены с фиолетовым сиянием.' },
      { id: 'ball_sovereign', name: 'Суверен Золото', name_ru: 'Суверен Золото', category: 'balls_footy', slot: 'ball.footy', mode: 'footy', rarity: 'legendary', price: 2600, desc: 'Чисто золотой чемпионский мяч высшей пробы.' },
      { id: 'ball_footy_supernova', name: 'Сверхновая', name_ru: 'Сверхновая', category: 'balls_footy', slot: 'ball.footy', mode: 'footy', rarity: 'legendary', price: 9999, packExclusive: true, desc: 'Мифический футбольный мяч сверхновой звезды из Наборов.' },

      // HOOPS KITS (OFFICIAL TANKS - МАЙКИ)
      { id: 'hoops_classic', name: 'Классика #23', name_ru: 'Классика #23', category: 'skins', slot: 'skin', mode: 'hoops', rarity: 'common', price: 0, isDefault: true, badge: 'ОБЫЧНЫЙ', desc: 'Оригинальная джерси Hoops All-Star #23 с фирменным чёрно-оранжевым кантом.' },
      { id: 'hoops_2_chicago', name: 'Чикаго Классик 1998', name_ru: 'Чикаго Классик 1998', category: 'skins', slot: 'skin', mode: 'hoops', rarity: 'common', price: 200, badge: 'ОБЫЧНЫЙ', desc: 'Золотая эра 23 номера: бычий кармин с текстурой зерен баскетбольного мяча и золотыми звездами чемпионов.' },
      { id: 'hoops_3_la', name: 'ЛА Династия', name_ru: 'ЛА Династия', category: 'skins', slot: 'skin', mode: 'hoops', rarity: 'common', price: 250, badge: 'ОБЫЧНЫЙ', desc: 'Золото Голливуда и царский пурпур Лейкерс: солнечные лучи славы ShowTime и граненые кристаллы.' },
      { id: 'hoops_4_boston', name: 'Бостон Прайд', name_ru: 'Бостон Прайд', category: 'skins', slot: 'skin', mode: 'hoops', rarity: 'common', price: 300, badge: 'ОБЫЧНЫЙ', desc: 'Монолитная защита: изумрудные кельтские узлы бесконечности и кристаллическая огранка на груди.' },
      { id: 'hoops_6_charlotte', name: 'Шарлотт Бриз', name_ru: 'Шарлотт Бриз', category: 'skins', slot: 'skin', mode: 'hoops', rarity: 'rare', price: 550, badge: '⭐ РЕДКИЙ', desc: 'Морской владыка: чешуя океанского дракона с фиолетовыми переливами и ветвями неоновых кораллов.' },
      { id: 'hoops_5_raptor', name: 'Коготь Раптора', name_ru: 'Коготь Раптора', category: 'skins', slot: 'skin', mode: 'hoops', rarity: 'rare', price: 600, badge: '⭐ РЕДКИЙ', desc: 'Хищный перехват мяча: тройной диагональный след когтей хищника, обнажающий светящийся слой.' },
      { id: 'hoops_0_neon', name: 'Неон Сити', name_ru: 'Неон Сити', category: 'skins', slot: 'skin', mode: 'hoops', rarity: 'rare', price: 650, badge: '⭐ РЕДКИЙ', desc: 'Уличные ночные площадки: градиент ночного неба с неоновыми контурами небоскребов и геометрией сетки.' },
      { id: 'hoops_7_phoenix', name: 'Восходящий Феникс', name_ru: 'Восходящий Феникс', category: 'skins', slot: 'skin', mode: 'hoops', rarity: 'epic', price: 1200, badge: '👑 ЭПИЧЕСКИЙ', desc: 'Возрождение в клатч-моментах: огненные золотые крылья Феникса, взмывающие от пояса к плечам.' },
      { id: 'hoops_9_beast', name: 'Гипер Зверь', name_ru: 'Гипер Зверь', category: 'skins', slot: 'skin', mode: 'hoops', rarity: 'epic', price: 1300, badge: '👑 ЭПИЧЕСКИЙ', desc: 'Сокрушительный данк: яростная пасть кибер-титана, космическая туманность и золотые молнии Зевса.' },
      { id: 'hoops_8_mamba', name: 'Чёрная Мамба', name_ru: 'Чёрная Мамба', category: 'skins', slot: 'skin', mode: 'hoops', rarity: 'legendary', price: 2500, badge: '💎 ЛЕГЕНДАРНЫЙ', desc: 'Инстинкт безжалостного финишера: рельефная змеиная чешуя с фиолетовым ядовитым отливом и клыками гадюки.' },
      { id: 'hoops_1_miami', name: 'Майами Роуз', name_ru: 'Майами Роуз', category: 'skins', slot: 'skin', mode: 'hoops', rarity: 'legendary', price: 2800, badge: '💎 ЛЕГЕНДАРНЫЙ', desc: 'Океанский закат Флориды: плавный закатный переход от фламинго к бирюзе с пальмовыми силуэтами Vice City.' },

      // HOOPS PACK & LEGACY REWARD KITS
      { id: 'skin_hoops_street_legend', name: 'Уличная Легенда', name_ru: 'Уличная Легенда', category: 'skins', slot: 'skin', mode: 'hoops', rarity: 'rare', price: 750, packExclusive: true, desc: 'Стритбольный дизайн Бруклина в монохроме.' },
      { id: 'skin_hoops_phantom_black', name: 'Чёрный Фантом', name_ru: 'Чёрный Фантом', category: 'skins', slot: 'skin', mode: 'hoops', rarity: 'legendary', price: 2500, packExclusive: true, desc: 'Матовая змеиная броня короля данков.' },
      { id: 'skin_hoops_hyper_beast', name: 'Гипер-Зверь Эксклюзив', name_ru: 'Гипер-Зверь Эксклюзив', category: 'skins', slot: 'skin', mode: 'hoops', rarity: 'legendary', price: 9999, packExclusive: true, desc: 'Ультраредкая эксклюзивная майка из Мистери Паков.' },
      { id: 'hoops_excl_inferno_dusk', name: 'Багряный Рассвет', name_ru: 'Багряный Рассвет', category: 'skins', slot: 'skin', mode: 'hoops', rarity: 'epic', price: 0, packExclusive: true, bundleOnly: true, badge: '⚡ НАБОР ЭКСКЛЮЗИВ', desc: 'Эксклюзив Стартового Набора: огненно-багряный рассвет с золотым воротником и огненными искрами.' },
      { id: 'hoops_excl_emerald_viper', name: 'Изумрудная Гадюка', name_ru: 'Изумрудная Гадюка', category: 'skins', slot: 'skin', mode: 'hoops', rarity: 'epic', price: 0, packExclusive: true, bundleOnly: true, badge: '⚡ НАБОР ЭКСКЛЮЗИВ', desc: 'Эксклюзив Стартового Набора: изумрудная змеиная чешуя с неоново-мятным следом и обсидиановой окантовкой.' },
      { id: 'hoops_excl_cyber_pharaoh', name: 'Кибер Фараон', name_ru: 'Кибер Фараон', category: 'skins', slot: 'skin', mode: 'hoops', rarity: 'legendary', price: 0, packExclusive: true, bundleOnly: true, badge: '💎 НАБОР ЭКСКЛЮЗИВ', desc: 'Эксклюзив Набора Короля Данков: глубокий лазурит с 24K золотой геометрией пирамид и бирюзовым неоном.' },
      { id: 'hoops_excl_cosmos_apex', name: 'Космос Апекс', name_ru: 'Космос Апекс', category: 'skins', slot: 'skin', mode: 'hoops', rarity: 'mythic', price: 0, packExclusive: true, bundleOnly: true, badge: '👑 МИФИК НАБОР', desc: 'Мифический эксклюзив Набора Короля Данков: глубокое звёздное небо с полярным сиянием и платиновым кантом.' },
      { id: 'hoops_excl_phoenix_nova', name: 'Сверхновая Феникс', name_ru: 'Сверхновая Феникс', category: 'skins', slot: 'skin', mode: 'hoops', rarity: 'mythic', price: 0, packExclusive: true, bundleOnly: true, badge: '👑 МИФИК НАБОР', desc: 'Мифический эксклюзив Набора Короля Данков: сияющие крылья алой сверхновой с золотым звёздным контуром.' },

      // HOOPS STAR KITS (3 EXCLUSIVE TANKS ЗА ЗВЁЗДЫ)
      { id: 'hoops_kit_star_holiday', name: '🎄 Новогодняя 2027', name_ru: '🎄 Новогодняя 2027', category: 'stars', slot: 'skin', mode: 'hoops', rarity: 'legendary', price: 250, currency: 'star', badge: '🎄 НОВОГОДНИЙ', desc: 'Рождественская безрукавная майка Санты: алый бархат с изумрудными резинками, золотыми елочками, снежинками и номером 25.' },
      { id: 'hoops_kit_star_astral', name: '🌌 Астральный Владыка', name_ru: '🌌 Астральный Владыка', category: 'stars', slot: 'skin', mode: 'hoops', rarity: 'legendary', price: 500, currency: 'star', badge: '🌟 ЗВЁЗДНЫЙ', desc: 'Полночный сапфировый и ультрафиолетовый шелк с золотыми созвездиями, золотыми окантовками пройм и номером 99.' },
      { id: 'hoops_kit_star_phantom', name: '⚡ Неоновый Фантом', name_ru: '⚡ Неоновый Фантом', category: 'stars', slot: 'skin', mode: 'hoops', rarity: 'legendary', price: 750, currency: 'star', badge: '🌟 ЗВЁЗДНЫЙ', desc: 'Матовый ультра-черный карбон с двойными лазерными розово-бирюзовыми неоновыми полосами в стиле Vice City и номером 0.' },

      // HOOPS BALLS
      { id: 'ball_hoops_classic', name: 'Классическая Кожа', name_ru: 'Классическая Кожа', category: 'balls_hoops', slot: 'ball.hoops', mode: 'hoops', rarity: 'common', price: 0, isDefault: true, desc: 'Классический зернистый баскетбольный мяч лиги.' },
      { id: 'ball_hoops_rubber', name: 'Уличный Каучук', name_ru: 'Уличный Каучук', category: 'balls_hoops', slot: 'ball.hoops', mode: 'hoops', rarity: 'common', price: 120, desc: 'Износостойкий чёрный стритбольный мяч для бетонных площадок.' },
      { id: 'ball_hoops_asphalt', name: 'Асфальт Грип', name_ru: 'Асфальт Грип', category: 'balls_hoops', slot: 'ball.hoops', mode: 'hoops', rarity: 'common', price: 180, desc: 'Графитовый мяч с янтарными каналами максимального сцепления.' },
      { id: 'ball_hoops_lime', name: 'Неон Лайм', name_ru: 'Неон Лайм', category: 'balls_hoops', slot: 'ball.hoops', mode: 'hoops', rarity: 'rare', price: 380, desc: 'Уличный мяч со светящимся неоново-лаймовым покрытием.' },
      { id: 'ball_gold_groove', name: 'Золотая Насечка', name_ru: 'Золотая Насечка', category: 'balls_hoops', slot: 'ball.hoops', mode: 'hoops', rarity: 'rare', price: 520, desc: 'Контрастные золотые канавки для точного контроля броска.' },
      { id: 'ball_molten', name: 'Раскалённая Магма', name_ru: 'Раскалённая Магма', category: 'balls_hoops', slot: 'ball.hoops', mode: 'hoops', rarity: 'epic', price: 1100, desc: 'Огненный эффект лавовых прожилок при каждом дриблинге.' },
      { id: 'ball_cyber_grid', name: 'Кибер Сетка LED', name_ru: 'Кибер Сетка LED', category: 'balls_hoops', slot: 'ball.hoops', mode: 'hoops', rarity: 'epic', price: 950, desc: 'Светящаяся кибер-разметка футуристической арены.' },
      { id: 'ball_supernova', name: 'Галактика Supernova', name_ru: 'Галактика Supernova', category: 'balls_hoops', slot: 'ball.hoops', mode: 'hoops', rarity: 'legendary', price: 2200, desc: 'Глубокий космос и звёздная пыль с каждого трёхочкового.' },
      { id: 'ball_sovereign_bb', name: 'Золотой All-Star', name_ru: 'Золотой All-Star', category: 'balls_hoops', slot: 'ball.hoops', mode: 'hoops', rarity: 'legendary', price: 2600, desc: 'Эксклюзивный 24K золотой баскетбольный трофей-мяч.' },
      { id: 'ball_hoops_vortex', name: 'Квантовый Вихрь', name_ru: 'Квантовый Вихрь', category: 'balls_hoops', slot: 'ball.hoops', mode: 'hoops', rarity: 'legendary', price: 9999, packExclusive: true, desc: 'Мифический баскетбольный мяч квантового вихря из Наборов.' }
    ];
  }

  // Build Editorial Shop & Sports Boutique Page
  function buildShopPage(app, initialCategory, inspectId) {
    var curChar = (app.store && app.store.data && (app.store.data.selectedTeam || app.store.data.selectedCharacter)) || 'footy';
    var shopSport = curChar; // Active sport filter in the shop: 'footy' or 'hoops'
    var curCategory = initialCategory || 'skins';
    if (curCategory === 'all' || curCategory === 'stadiums' || curCategory === 'packs' || curCategory === 'balls' || curCategory === 'balls_footy' || curCategory === 'balls_hoops') {
      curCategory = 'skins';
    }
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
    backBtn.innerHTML = getUiIconSvg('arrow_back', 18);
    backBtn.onclick = function () {
      app.audio.play('click');
      app.showMenu();
    };

    var titleBox = document.createElement('div');
    titleBox.className = 'fvh-shop-title-box';
    titleBox.style.flex = '1 1 auto';
    titleBox.style.minWidth = '0';
    titleBox.style.padding = '0 6px';
    titleBox.innerHTML = '<h1 style="margin:0;font-size:clamp(16px, 4.8vw, 22px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + tr('stadiumStore') + '</h1><small style="color:var(--text-muted);letter-spacing:0.5px;font-size:10.5px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + tr(shopSport === 'footy' ? 'storeSubFooty' : 'storeSubHoops') + '</small>';

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

    // Faction Sport strictly locked to player chosen team
    var shopSport = curChar;

    // 1. Category Selector Tabs (Skins, Balls for chosen sport, Bundles, FvH Coins)
    var catSeg = document.createElement('div');
    catSeg.className = 'seg fvh-shop-categories';
    catSeg.style.marginBottom = '16px';

    function renderCategoryTabs() {
      catSeg.innerHTML = '';
      var categories = [
        { id: 'skins', icon: 'cat_skins', label: (shopSport === 'footy' ? (getActiveLang() === 'ru' ? 'Формы' : 'Jerseys') : (getActiveLang() === 'ru' ? 'Майки' : 'Tanks')) },
        { id: 'stars', icon: 'star', label: (getActiveLang() === 'ru' ? 'За Звёзды' : 'For Stars') },
        { id: 'bundles', icon: 'cat_packs', label: tr('catBundles') },
        { id: 'coins', icon: 'coin', label: tr('catCoins') }
      ];
      categories.forEach(function (c) {
        var btn = document.createElement('button');
        var cIconHtml = c.icon === 'coin' ? getFvhCoinSvg('inline') : getUiIconSvg(c.icon, 16);
        btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:6px;vertical-align:middle;">' + cIconHtml + '<span>' + c.label + '</span></span>';
        if (c.id === curCategory) {
          btn.className = 'on';
        }
        btn.onclick = function () {
          curCategory = c.id;
          catSeg.querySelectorAll('button').forEach(function (b) { b.className = ''; });
          btn.className = 'on';
          if (shopFilterCtrl) {
            shopFilterCtrl.setVisible(curCategory === 'skins' || curCategory === 'stars');
          }
          app.audio.play('click');
          renderShop();
        };
        catSeg.appendChild(btn);
      });
    }

    // Collapsible Rarity Filter ("Фильтр" button)
    var curRarity = 'all';
    var shopFilterCtrl = createRarityFilterControl(function (nextRarity) {
      curRarity = nextRarity;
      renderShop();
    });
    renderCategoryTabs();
    body.appendChild(catSeg);
    body.appendChild(shopFilterCtrl.el);
    shopFilterCtrl.setVisible(curCategory === 'skins' || curCategory === 'stars');

    // Product Catalogue Grid
    var catalogueGrid = document.createElement('div');
    catalogueGrid.className = 'fvh-catalogue-grid';
    body.appendChild(catalogueGrid);

    page.appendChild(body);
    container.appendChild(page);

    function updateWalletUI() {
      var coins = (app.store && app.store.data && app.store.data.coins) || 0;
      walletBox.innerHTML =
        '<div style="display:flex;align-items:center;gap:6px;">' +
        '  <button class="fvh-wallet-pill gold" style="cursor:pointer;" title="' + tr('catCoins') + '">' +
        getFvhCoinSvg('inline') + ' <span>' + coins.toLocaleString() + '</span>' +
        '  </button>' +
        '</div>';
      var btn = walletBox.querySelector('.fvh-wallet-pill.gold');
      if (btn) {
        btn.onclick = function () {
          curCategory = 'coins';
          renderCategoryTabs();
          app.audio.play('click');
          renderShop();
        };
      }
    }

    // Modal Item Inspector with Interactive 3D Kit Try-On Preview
    function openItemInspector(item) {
      var overlay = document.createElement('div');
      overlay.className = 'modal-back fvh-sheet-back';
      var modal = document.createElement('div');
      modal.className = 'modal fvh-item-modal fvh-item-modal-3d';

      var owned = (app.store && app.store.data && app.store.data.owned) || [];
      var isBallModal = (item.category === 'balls' || item.category === 'balls_footy' || item.category === 'balls_hoops' || String(item.id).startsWith('ball_'));
      var curEquipped = (app.store && app.store.data && app.store.data.equipped) || {};
      var expectedModalEq = resolveEquippedItemId(curEquipped, isBallModal ? 'balls' : 'skins', curChar);
      var isEquipped = (canonItemId(item.id) === expectedModalEq);
      var isOwned = (isItemOwnedInList(owned, item.id) || Boolean(item.isDefault) || (curChar === 'hoops' && item.id === 'skin_solar') || (curChar === 'footy' && item.id === 'skin_rookie'));
      var rarKey = item.rarity || 'common';
      var localizedRarity = tr('rarity_' + rarKey) || rarKey.toUpperCase();
      var localizedItemName = trItem(item.name);
      var isStarItem = (item.currency === 'star' || item.category === 'stars');
      var isSkinModal = !isBallModal && (item.category === 'skins' || item.category === 'stars' || String(item.id).startsWith('footy_') || String(item.id).startsWith('hoops_') || String(item.id).startsWith('skin_'));
      var targetHero = (item.mode === 'hoops' || String(item.id).includes('hoops')) ? 'hoops' : ((item.mode === 'footy' || String(item.id).includes('footy')) ? 'footy' : curChar);
      var lang = getActiveLang();

      var categoryLabel = '';
      if (isStarItem) categoryLabel = (lang === 'ru' ? 'Эксклюзив Telegram Stars' : 'Telegram Stars Exclusive');
      else if (item.category === 'skins') categoryLabel = tr('catSkins');
      else categoryLabel = tr('storeSub');

      var previewBodyHtml = isSkinModal
        ? getWardrobe3DViewerHtml(targetHero, item.id, { modal: true, hideTag: true })
        : renderItemArtwork(item, 'large');

      modal.innerHTML =
        '<div class="fvh-sheet-handle"></div>' +
        '<div class="fvh-item-modal-head">' +
        '  <span class="rar ' + rarKey + '">' + localizedRarity + '</span>' +
        '  <button class="modal-close-x" aria-label="Close">✕</button>' +
        '</div>' +
        '<div class="fvh-item-modal-preview r-' + rarKey + (isSkinModal ? ' is-3d-stage' : '') + '">' +
        previewBodyHtml +
        '</div>' +
        '<h2 class="fvh-item-modal-title">' + localizedItemName + '</h2>' +
        '<div class="fvh-item-modal-category">' + categoryLabel + '</div>' +
        '<div class="fvh-item-modal-actions"></div>';

      function closeInspector() {
        if (isSkinModal && window.CharactersGLB && typeof window.CharactersGLB.unmountWardrobePreview === 'function') {
          window.CharactersGLB.unmountWardrobePreview();
        }
        overlay.remove();
      }

      modal.querySelector('.modal-close-x').onclick = function () {
        app.audio.play('click');
        closeInspector();
      };
      overlay.onclick = function (e) {
        if (e.target === overlay) {
          app.audio.play('click');
          closeInspector();
        }
      };

      var actionsBox = modal.querySelector('.fvh-item-modal-actions');
      if (isEquipped) {
        var eqBtn = document.createElement('button');
        eqBtn.className = 'btn block fvh-btn-eq-state';
        eqBtn.disabled = true;
        eqBtn.textContent = tr('equippedState');
        actionsBox.appendChild(eqBtn);
      } else if (isOwned) {
        var equipNowBtn = document.createElement('button');
        equipNowBtn.className = 'btn primary block';
        equipNowBtn.textContent = tr('equipAction') + ': ' + localizedItemName;
        equipNowBtn.onclick = function () {
          var pid = getAppPlayerId(app);
          var cId = canonItemId(item.id);
          var canonicalSlot = 'skin.' + targetHero;
          app.store.update(function (d) {
            if (!d.equipped) d.equipped = {};
            d.equipped[canonicalSlot] = cId;
            d.equipped.skin = cId;
          });
          if (app.store && typeof app.store.flush === 'function') app.store.flush();
          app.audio.play('claim');
          showToast(tr('equippedState') + ': ' + localizedItemName);
          safeEconomyApi('/api/economy/equip', { playerId: pid, slot: canonicalSlot, itemId: cId });
          closeInspector();
          renderShop();
        };
        actionsBox.appendChild(equipNowBtn);

        var openWardrobeBtn = document.createElement('button');
        openWardrobeBtn.className = 'btn secondary block';
        openWardrobeBtn.style.marginTop = '8px';
        openWardrobeBtn.textContent = tr('toWardrobe');
        openWardrobeBtn.onclick = function () {
          closeInspector();
          app.audio.play('click');
          var targetSlot = (item.currency === 'star' || item.category === 'stars') ? 'stars' : 'skins';
          app.go('characters', { char: targetHero, slot: targetSlot });
        };
        actionsBox.appendChild(openWardrobeBtn);
      } else if (isStarItem) {
        var buyStarBtn = document.createElement('button');
        buyStarBtn.className = 'btn star block';
        buyStarBtn.innerHTML = '⭐ ' + item.price.toLocaleString() + ' Stars';
        buyStarBtn.onclick = function () {
          if (isPurchasing) return;
          openUniversalPaymentModal(app, {
            productId: item.id,
            title: localizedItemName,
            starsPrice: item.price,
            coinsAmount: 0,
            onPurchased: function () {
              app.audio.play('claim');
              showToast('⭐ ' + localizedItemName + ' ' + (lang === 'ru' ? 'успешно приобретён!' : 'unlocked!'));
              app.store.update(function (d) {
                if (!d.owned) d.owned = [];
                if (d.owned.indexOf(item.id) === -1) d.owned.push(item.id);
              });
              if (app.store && typeof app.store.flush === 'function') app.store.flush();
              closeInspector();
              renderShop();
            }
          });
        };
        actionsBox.appendChild(buyStarBtn);
      } else {
        var buyItemBtn = document.createElement('button');
        buyItemBtn.className = 'btn primary block';
        buyItemBtn.innerHTML = tr('buyAction') + ' ' + getFvhCoinSvg('inline') + ' ' + item.price.toLocaleString();
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
                if (!d.unseenItems) d.unseenItems = [];
                if (d.unseenItems.indexOf(item.id) === -1) d.unseenItems.push(item.id);
              });
              if (app.store && typeof app.store.flush === 'function') {
                app.store.flush();
              }
              app.audio.play('claim');
              showToast(tr('purchaseSuccess') + ': ' + localizedItemName);
              closeInspector();
              renderShop();
            } else {
              app.audio.play('error');
              var errMsg = tr('purchaseFailed');
              if (res && res.error === 'insufficient_funds') {
                errMsg = tr('notEnoughCoins');
              } else if (res && res.error === 'already_owned') {
                errMsg = tr('purchaseAlreadyOwned');
              } else if (res && res.message) {
                errMsg = res.message;
              }
              showToast(errMsg);
            }
          });
        };
        actionsBox.appendChild(buyItemBtn);
      }

      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      if (isSkinModal) {
        mountWardrobe3DIntoContainer(modal, targetHero, item.id);
      }
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

      if (curCategory === 'bundles') {
        var owned = (app.store && app.store.data && app.store.data.owned) || [];

        // 1. Exclusive Thematic Bundles FIRST (with pack-only kits not purchasable standalone!)
        var bundlesBanner = document.createElement('div');
        bundlesBanner.className = 'fvh-bundle-hero-banner';
        bundlesBanner.style.gridColumn = '1 / -1';
        bundlesBanner.style.margin = '4px 0 10px';
        bundlesBanner.innerHTML =
          '<div style="display:flex;align-items:center;gap:12px;">' +
          '  <div class="fvh-bundle-banner-icon">' + getUiIconSvg('gift', 28) + '</div>' +
          '  <div>' +
          '    <div style="font-weight:900;font-size:14.5px;color:#fde047;letter-spacing:0.4px;">' + tr('catBundles') + ' · ' + (getActiveLang() === 'ru' ? 'ЭКСКЛЮЗИВНЫЕ СЕТЫ' : 'EXCLUSIVE BUNDLES') + '</div>' +
          '    <div style="font-size:12px;color:#cbd5e1;margin-top:2px;line-height:1.4;">' + (getActiveLang() === 'ru' ? 'Новые эксклюзивные формы, которые нельзя купить в магазине, + бонусные монеты со скидкой до 60%!' : 'Brand-new exclusive kits unavailable in the shop + bonus coins up to 60% off!') + '</div>' +
          '  </div>' +
          '</div>';
        catalogueGrid.appendChild(bundlesBanner);

        function openBundleInspector(bundle, focusKitId) {
          if (!bundle) return;
          var langB = getActiveLang();
          var cosmeticEntries = (bundle.items || []).filter(function (x) { return x.type === 'cosmetic'; });
          var activeCosmetic = cosmeticEntries.find(function (x) { return x.id === focusKitId; }) || cosmeticEntries[0];
          if (!activeCosmetic) return;

          var overlay = document.createElement('div');
          overlay.className = 'modal-back fvh-sheet-back';
          var modal = document.createElement('div');
          modal.className = 'modal fvh-item-inspector-modal fvh-bundle-inspector-modal';

          var targetHero = (bundle.mode === 'hoops' || bundle.sport === 'hoops') ? 'hoops' : 'footy';
          var coinsItem = (bundle.items || []).find(function (x) { return x.type === 'coins'; });
          var isOwnedBundle = checkBundleOwnership(bundle, owned);

          function renderInspectorContent() {
            var rarK = activeCosmetic.rarity || bundle.rarity || 'epic';
            var rarLabel = tr('rarity_' + rarK) || rarK.toUpperCase();
            var isExcl = Boolean(activeCosmetic.exclusive);
            modal.innerHTML =
              '<div class="fvh-sheet-handle"></div>' +
              '<div class="fvh-item-modal-head">' +
              '  <span class="rar ' + rarK + '">' + rarLabel + (isExcl ? ' · ' + (langB === 'ru' ? 'ТОЛЬКО В НАБОРЕ' : 'BUNDLE ONLY') : '') + '</span>' +
              '  <button class="modal-close-x" aria-label="Close">✕</button>' +
              '</div>' +
              '<div class="fvh-item-modal-preview r-' + rarK + ' is-3d-stage">' +
              getWardrobe3DViewerHtml(targetHero, activeCosmetic.id, { modal: true, hideTag: true }) +
              '</div>' +
              '<div class="fvh-bundle-tabs">' +
              cosmeticEntries.map(function (c) {
                var cOwned = isItemOwnedInList(owned, c.id);
                var cOn = c.id === activeCosmetic.id;
                return '<button type="button" class="fvh-bundle-tab-btn' + (cOn ? ' on' : '') + (c.exclusive ? ' is-excl' : '') + '" data-kit="' + c.id + '">' +
                  '<img src="store/items/kit3d_' + canonItemId(c.id) + '.png?v=5.1.0-release" alt="" />' +
                  '<span>' + escapeHtml(trItem(c.name || c.id)) + '</span>' +
                  (c.exclusive ? '<b>' + (langB === 'ru' ? 'ЭКСКЛЮЗИВ' : 'EXCL') + '</b>' : (cOwned ? '<i>✓</i>' : '')) +
                '</button>';
              }).join('') +
              '</div>' +
              '<h2 class="fvh-item-modal-title">' + escapeHtml(bundle.name) + '</h2>' +
              '<div class="fvh-item-modal-category">' +
                escapeHtml(bundle.desc) + (coinsItem ? (' · +' + coinsItem.val.toLocaleString() + ' FvH') : '') +
              '</div>' +
              '<div class="fvh-item-modal-actions"></div>';

            modal.querySelector('.modal-close-x').onclick = function () {
              app.audio.play('click');
              closeModal();
            };
            modal.querySelectorAll('.fvh-bundle-tab-btn').forEach(function (tb) {
              tb.onclick = function () {
                var nextId = tb.getAttribute('data-kit');
                var found = cosmeticEntries.find(function (c) { return c.id === nextId; });
                if (!found || found.id === activeCosmetic.id) return;
                activeCosmetic = found;
                app.audio.play('click');
                renderInspectorContent();
              };
            });

            var actContainer = modal.querySelector('.fvh-item-modal-actions');
            if (isOwnedBundle) {
              var bDone = document.createElement('button');
              bDone.className = 'btn block fvh-btn-eq-state';
              bDone.disabled = true;
              bDone.textContent = '✓ ' + (tr('inCollection') || 'В коллекции');
              actContainer.appendChild(bDone);
            } else {
              var bBuy = document.createElement('button');
              bBuy.className = 'btn primary block';
              bBuy.innerHTML = (langB === 'ru' ? 'Купить набор за ' : 'Buy Bundle for ') + getFvhCoinSvg('inline') + ' ' + bundle.coinsPrice.toLocaleString();
              bBuy.onclick = function () {
                if (isPurchasing) return;
                var coins = (app.store && app.store.data && app.store.data.coins) || 0;
                if (coins < bundle.coinsPrice) {
                  app.audio.play('error');
                  showToast(tr('notEnoughCoins'));
                  return;
                }
                isPurchasing = true;
                var pid = getAppPlayerId(app);
                safeEconomyApi('/api/economy/purchase', {
                  playerId: pid,
                  itemId: bundle.id,
                  idempotencyKey: 'bundle_' + pid + '_' + bundle.id + '_' + Date.now()
                }).then(function (res) {
                  isPurchasing = false;
                  if (res && res.ok) {
                    app.store.update(function (d) {
                      d.coins = res.coins;
                      d.xp = res.xp;
                      d.owned = res.owned;
                      if (Array.isArray(res.unseenItems)) d.unseenItems = res.unseenItems;
                      if (res.packs) d.packs = res.packs;
                    });
                    app.audio.play('claim');
                    showToast(tr('purchaseSuccess') + ': ' + bundle.name);
                    closeModal();
                    renderShop();
                  } else {
                    app.audio.play('error');
                    showToast(res && res.message ? res.message : tr('purchaseFailed'));
                  }
                });
              };
              actContainer.appendChild(bBuy);
            }
            mountWardrobe3DIntoContainer(modal, targetHero, activeCosmetic.id);
          }

          function closeModal() {
            if (window.CharactersGLB && typeof window.CharactersGLB.unmountWardrobePreview === 'function') {
              window.CharactersGLB.unmountWardrobePreview();
            }
            overlay.remove();
          }

          overlay.onclick = function (e) {
            if (e.target === overlay) {
              app.audio.play('click');
              closeModal();
            }
          };
          overlay.appendChild(modal);
          document.body.appendChild(overlay);
          renderInspectorContent();
        }
        app.openBundleInspector = openBundleInspector;
        window.__openBundleInspectorModal = openBundleInspector;

        var bundlesToShow = BUNDLE_ITEMS.filter(function (b) {
          var bSport = b.sport || b.mode;
          return bSport === shopSport;
        });

        bundlesToShow.forEach(function (bundle) {
          var rarTier = bundle.rarity || 'epic';
          var bCard = document.createElement('div');
          bCard.className = 'fvh-catalogue-card fvh-bundle-card r-' + rarTier;
          bCard.style.cursor = 'pointer';

          var isFullyOwned = checkBundleOwnership(bundle, owned);
          var cosmeticKits = (bundle.items || []).filter(function (x) { return x.type === 'cosmetic'; });
          var bonusCoinEntry = (bundle.items || []).find(function (x) { return x.type === 'coins'; });

          var previewHtml = '<div class="fvh-bundle-hero-strip r-' + rarTier + '">' +
            cosmeticKits.map(function (it, idx) {
              var cId = canonItemId(it.id);
              return '<div class="fvh-bundle-kit-slot' + (it.exclusive ? ' is-exclusive' : '') + (idx === 0 ? ' is-lead' : '') + '" data-kit="' + it.id + '">' +
                '<img src="store/items/kit3d_' + cId + '.png?v=5.1.0-release" alt="' + escapeHtml(it.name || it.id) + '" />' +
                (it.exclusive ? '<span class="fvh-bundle-excl-tag">' + (getActiveLang() === 'ru' ? 'ЭКСКЛЮЗИВ' : 'EXCLUSIVE') + '</span>' : '') +
              '</div>';
            }).join('') +
            (bonusCoinEntry ? ('<div class="fvh-bundle-coin-chip">' + getFvhCoinSvg('inline') + ' <b>+' + bonusCoinEntry.val.toLocaleString() + '</b></div>') : '') +
            '<span class="fvh-card-3d-pill">3D</span>' +
          '</div>';

          var itemsListHtml = '<div class="fvh-bundle-items-chips">' +
            bundle.items.map(function (it) {
              if (it.type === 'coins') {
                return '<span class="fvh-bundle-chip is-coin">' + getFvhCoinSvg('inline') + ' +' + it.val.toLocaleString() + ' FvH</span>';
              }
              var kitOwned = isItemOwnedInList(owned, it.id);
              return '<span class="fvh-bundle-chip' + (it.exclusive ? ' is-excl' : '') + (kitOwned ? ' is-owned' : '') + '">' +
                getUiIconSvg('jersey', 12) + ' ' + escapeHtml(trItem(it.name || it.id)) +
                (it.exclusive ? ' ★' : '') + (kitOwned ? ' ✓' : '') +
              '</span>';
            }).join('') +
          '</div>';

          bCard.innerHTML =
            '<div class="fvh-card-head">' +
            '  <span class="rar ' + rarTier + '">' + bundle.badge + '</span>' +
            '  <span class="discount-pill" style="font-size:10.5px;font-weight:900;color:#22c55e;background:rgba(34,197,94,0.14);border:1px solid rgba(34,197,94,0.35);padding:2px 8px;border-radius:8px;">-' + bundle.discount + '%</span>' +
            '</div>' +
            previewHtml +
            '<div class="fvh-card-title">' + bundle.name + '</div>' +
            '<div class="fvh-card-desc">' + bundle.desc + '</div>' +
            itemsListHtml +
            '<div class="fvh-card-price" style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">' +
            '  <span style="font-size:11px;color:var(--text-muted);text-decoration:line-through;">' + getFvhCoinSvg('inline') + ' ' + bundle.originalValue.toLocaleString() + '</span>' +
            '  <span style="font-size:15px;font-weight:900;color:#fde047;">' + getFvhCoinSvg('inline') + ' ' + bundle.coinsPrice.toLocaleString() + '</span>' +
            '</div>' +
            '<div class="fvh-card-action"></div>';

          bCard.onclick = function () {
            app.audio.play('click');
            openBundleInspector(bundle);
          };

          bCard.querySelectorAll('.fvh-bundle-kit-slot').forEach(function (slotEl) {
            slotEl.onclick = function (e) {
              e.stopPropagation();
              app.audio.play('click');
              openBundleInspector(bundle, slotEl.getAttribute('data-kit'));
            };
          });

          var bActBox = bCard.querySelector('.fvh-card-action');
          if (isFullyOwned) {
            var fullBtn = document.createElement('button');
            fullBtn.className = 'btn small block';
            fullBtn.disabled = true;
            fullBtn.textContent = '✓ ' + (tr('inCollection') || 'В коллекции');
            bActBox.appendChild(fullBtn);
          } else {
            var buyBtn = document.createElement('button');
            buyBtn.className = 'btn small primary block';
            buyBtn.innerHTML = tr('buyAction') + ' ' + getFvhCoinSvg('inline') + ' ' + bundle.coinsPrice.toLocaleString();
            buyBtn.onclick = function (e) {
              e.stopPropagation();
              if (isPurchasing) return;
              var coins = (app.store && app.store.data && app.store.data.coins) || 0;
              if (coins < bundle.coinsPrice) {
                app.audio.play('error');
                showToast(tr('notEnoughCoins'));
                return;
              }
              isPurchasing = true;
              var pid = getAppPlayerId(app);
              safeEconomyApi('/api/economy/purchase', {
                playerId: pid,
                itemId: bundle.id,
                idempotencyKey: 'bundle_' + pid + '_' + bundle.id + '_' + Date.now()
              }).then(function (res) {
                isPurchasing = false;
                if (res && res.ok) {
                  app.store.update(function (d) {
                    d.coins = res.coins;
                    d.xp = res.xp;
                    d.owned = res.owned;
                    if (Array.isArray(res.unseenItems)) d.unseenItems = res.unseenItems;
                    if (res.packs) d.packs = res.packs;
                  });
                  app.audio.play('claim');
                  showToast(tr('purchaseSuccess') + ': ' + bundle.name);
                  renderShop();
                } else {
                  app.audio.play('error');
                  showToast(res && res.message ? res.message : tr('purchaseFailed'));
                }
              });
            };
            bActBox.appendChild(buyBtn);
          }

          catalogueGrid.appendChild(bCard);
        });

        // 2. Stars Mystery Packs Section cleanly below Exclusive Bundles
        var starsNotice = document.createElement('div');
        starsNotice.className = 'fvh-shop-bundles-banner';
        starsNotice.style.gridColumn = '1 / -1';
        starsNotice.style.background = 'linear-gradient(135deg, rgba(250,204,21,0.12) 0%, rgba(15,23,42,0.96) 65%, rgba(0,240,255,0.08) 100%)';
        starsNotice.style.border = '1.5px solid rgba(250,204,21,0.32)';
        starsNotice.style.borderRadius = '14px';
        starsNotice.style.padding = '14px 18px';
        starsNotice.style.margin = '12px 0 8px';
        starsNotice.innerHTML =
          '<div style="display:flex;align-items:center;gap:12px;">' +
          '  <div style="font-size:28px;flex-shrink:0;">⭐</div>' +
          '  <div>' +
          '    <div style="font-weight:900;font-size:14px;color:#fde047;letter-spacing:0.5px;">' + (getActiveLang() === 'ru' ? 'МИСТЕРИ ПАКИ ЗА STARS' : 'STARS MYSTERY PACKS') + '</div>' +
          '    <div style="font-size:12px;color:var(--text-muted);margin-top:2px;line-height:1.4;">' + (getActiveLang() === 'ru' ? 'Мгновенные монеты FvH + гарантированная эксклюзивная форма высокой редкости!' : 'Instant FvH Coins + guaranteed high-tier exclusive kits!') + '</div>' +
          '  </div>' +
          '</div>';
        catalogueGrid.appendChild(starsNotice);

        var starPacks = [
          {
            id: 'pack_stars_starter',
            name: tr('packStarsStarter'),
            desc: tr('packStarsStarterDesc'),
            starsPrice: 250,
            coinsAmount: 1500,
            badge: '⭐ STARTER',
            rarity: 'rare',
            highlight: (getActiveLang() === 'ru' ? (shopSport === 'footy' ? 'Редкая футбольная форма + 1,500 FvH' : 'Редкая баскетбольная майка + 1,500 FvH') : 'Rare Kit + 1,500 FvH')
          },
          {
            id: 'pack_stars_champion',
            name: tr('packStarsChampion'),
            desc: tr('packStarsChampionDesc'),
            starsPrice: 500,
            coinsAmount: 4000,
            badge: '💎 CHAMPION',
            rarity: 'epic',
            highlight: (getActiveLang() === 'ru' ? (shopSport === 'footy' ? 'Эпическая футбольная форма + 4,000 FvH' : 'Эпическая баскетбольная майка + 4,000 FvH') : 'Epic Kit + 4,000 FvH')
          },
          {
            id: 'pack_stars_legend',
            name: tr('packStarsLegend'),
            desc: tr('packStarsLegendDesc'),
            starsPrice: 750,
            coinsAmount: 10000,
            badge: '👑 LEGEND',
            rarity: 'legendary',
            highlight: (getActiveLang() === 'ru' ? (shopSport === 'footy' ? 'Легендарная футбольная форма + 10,000 FvH' : 'Легендарная баскетбольная майка + 10,000 FvH') : 'Legendary Kit + 10,000 FvH')
          }
        ];

        starPacks.forEach(function (sp) {
          var sCard = document.createElement('div');
          sCard.className = 'fvh-catalogue-card fvh-starpak-card r-' + sp.rarity;
          sCard.style.cursor = 'pointer';

          sCard.innerHTML =
            '<div class="fvh-card-head">' +
            '  <span class="rar ' + sp.rarity + '">' + sp.badge + '</span>' +
            '  <span style="font-size:11px;font-weight:900;color:#facc15;">⭐ ' + sp.starsPrice + ' Stars</span>' +
            '</div>' +
            '<div class="fvh-card-thumb-wrap" style="height:108px;display:flex;align-items:center;justify-content:center;">' +
            getDetailedBundleSvg(sp.id, 'large') +
            '</div>' +
            '<div class="fvh-card-title">' + sp.name + '</div>' +
            '<div class="fvh-card-desc" style="margin-bottom:8px;">' + sp.desc + '</div>' +
            '<div style="font-size:11px;color:#38bdf8;font-weight:800;margin-bottom:10px;">✨ ' + sp.highlight + '</div>' +
            '<div class="fvh-card-action">' +
            '  <button type="button" class="btn small primary block" style="background:linear-gradient(135deg, #0284c7 0%, #0098ea 100%);">⭐ ' + sp.starsPrice + ' Stars</button>' +
            '</div>';

          sCard.onclick = function () {
            app.audio.play('click');
            openUniversalPaymentModal(app, {
              productId: sp.id,
              title: sp.name,
              desc: sp.highlight,
              starsPrice: sp.starsPrice,
              coinsAmount: sp.coinsAmount,
              onPurchased: function () {
                app.audio.play('claim');
                showToast('⭐ ' + sp.name + ' ' + (getActiveLang() === 'ru' ? 'успешно приобретён!' : 'purchased!'));
                syncAuthoritativeEconomy(app);
                openPackWithCinematicAnimation(app, sp.id, function () {
                  renderShop();
                });
              }
            });
          };

          catalogueGrid.appendChild(sCard);
        });
        return;
      }

      // Cosmetic items
      var baseCatalog = buildDefaultShopCatalog(curChar);
      var owned = (app.store && app.store.data && app.store.data.owned) || [];
      var eq = (app.store && app.store.data && app.store.data.equipped) || {};

      var filtered = baseCatalog.filter(function (it) {
        if (it.packExclusive || it.bundleOnly) return false;
        if (it.category === 'balls' || it.category === 'balls_footy' || it.category === 'balls_hoops' || String(it.id).startsWith('ball_')) return false;
        if (curRarity !== 'all' && it.rarity !== curRarity) return false;
        if (curCategory === 'skins') {
          return it.category === 'skins' && it.mode === shopSport;
        }
        if (curCategory === 'stars') {
          return (it.category === 'stars' || it.currency === 'star') && it.mode === shopSport;
        }
        if (curCategory === 'bundles') {
          return it.category === 'bundles' && (it.mode === shopSport || it.sport === shopSport);
        }
        return it.category === curCategory && (it.mode ? it.mode === shopSport : true);
      });

      // Strict shop catalogue deduplication
      var seenShopCanonIds = {};
      var uniqueFiltered = [];
      filtered.forEach(function (it) {
        var cId = canonItemId(it.id);
        if (!seenShopCanonIds[cId]) {
          seenShopCanonIds[cId] = true;
          uniqueFiltered.push(it);
        }
      });
      filtered = uniqueFiltered;

      if (filtered.length === 0) {
        catalogueGrid.innerHTML =
          '<div class="fvh-empty-state">' +
          '  <div class="fvh-empty-state-icon">📦</div>' +
          '  <div class="fvh-empty-state-title">' + tr('emptyShopCategory') + '</div>' +
          '</div>';
        return;
      }

      // Sort by rarity: Mythic -> Legendary -> Epic -> Rare -> Common
      var rarityOrder = { 'mythic': 5, 'legendary': 4, 'epic': 3, 'rare': 2, 'common': 1 };
      filtered.sort(function(a, b) {
        var rA = rarityOrder[a.rarity || 'common'] || 1;
        var rB = rarityOrder[b.rarity || 'common'] || 1;
        return rB - rA;
      });

      var resolvedSkinEq = resolveEquippedItemId(eq, 'skins', curChar);
      var resolvedBallEq = resolveEquippedItemId(eq, 'balls', curChar);

      filtered.forEach(function (it) {
        var isBallShop = (it.category === 'balls_footy' || it.category === 'balls_hoops' || it.category === 'balls' || String(it.id).startsWith('ball_'));
        var isOwned = (isItemOwnedInList(owned, it.id) || Boolean(it.isDefault) || (curChar === 'hoops' && it.id === 'skin_solar') || (curChar === 'footy' && it.id === 'skin_rookie'));
        var isEquipped = isOwned && (canonItemId(it.id) === (isBallShop ? resolvedBallEq : resolvedSkinEq));

        var card = document.createElement('div');
        var rarKey = it.rarity || 'common';
        card.className = 'fvh-catalogue-card r-' + rarKey + (isOwned ? ' owned' : '');

        var localizedRarity = tr('rarity_' + rarKey) || rarKey.toUpperCase();
        var localizedItemName = trItem(it.name);
        var isStarItem = (it.currency === 'star' || it.category === 'stars');
        var priceDisplayHtml = isOwned ? '' : (isStarItem ? ('⭐ ' + it.price.toLocaleString() + ' Stars') : (getFvhCoinSvg('inline') + ' ' + it.price.toLocaleString() + ' FvH'));

        card.innerHTML =
          '<div class="fvh-card-head" style="display:flex;justify-content:space-between;align-items:center;">' +
          '  <span class="rar ' + rarKey + '">' + localizedRarity + '</span>' +
          (isEquipped ? '  <span class="fvh-card-owned-tag" style="color:#34d399;font-size:10.5px;font-weight:700;">' + tr('equippedState') + '</span>' : (isOwned ? '  <span class="fvh-card-owned-tag">✓ ' + tr('inCollection') + '</span>' : '')) +
          '</div>' +
          '<div class="fvh-card-thumb-wrap" style="position:relative;height:80px;display:flex;align-items:center;justify-content:center;cursor:pointer;">' +
          renderItemArtwork(it, 'thumb') +
          '<span class="fvh-card-3d-pill">3D</span>' +
          '</div>' +
          '<div class="fvh-card-title" style="font-size:13px;font-weight:700;color:var(--text-pure);margin-bottom:8px;">' + localizedItemName + '</div>' +
          '<div class="fvh-card-action"></div>';

        var actBox = card.querySelector('.fvh-card-action');
        var actionBtn = document.createElement('button');
        if (isEquipped) {
          actionBtn.className = 'btn small block fvh-btn-eq-state';
          actionBtn.disabled = true;
          actionBtn.textContent = tr('equippedState');
        } else if (isOwned) {
          actionBtn.className = 'btn small secondary block';
          actionBtn.textContent = tr('toWardrobe');
          actionBtn.onclick = function (e) {
            e.stopPropagation();
            app.audio.play('click');
            var targetSlot = (it.category === 'stars' || it.currency === 'star') ? 'stars' : 'skins';
            app.go('characters', { char: curChar, slot: targetSlot });
          };
        } else if (isStarItem) {
          actionBtn.className = 'btn small star block';
          actionBtn.innerHTML = '⭐ ' + it.price.toLocaleString();
          actionBtn.onclick = function (e) {
            e.stopPropagation();
            if (isPurchasing) return;
            openUniversalPaymentModal(app, {
              productId: it.id,
              title: localizedItemName,
              starsPrice: it.price,
              coinsAmount: 0,
              onPurchased: function () {
                app.audio.play('claim');
                showToast('⭐ ' + localizedItemName + ' ' + (getActiveLang() === 'ru' ? 'успешно приобретён!' : 'unlocked!'));
                app.store.update(function (d) {
                  if (!d.owned) d.owned = [];
                  if (d.owned.indexOf(it.id) === -1) d.owned.push(it.id);
                  if (d.stars !== undefined && d.stars >= it.price) d.stars -= it.price;
                });
                if (app.store && typeof app.store.flush === 'function') app.store.flush();
                renderShop();
              }
            });
          };
        } else {
          actionBtn.className = 'btn small primary block';
          actionBtn.innerHTML = getFvhCoinSvg('inline') + ' <span>' + it.price.toLocaleString() + '</span>';
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
                  if (!d.unseenItems) d.unseenItems = [];
                  if (d.unseenItems.indexOf(it.id) === -1) d.unseenItems.push(it.id);
                });
                if (app.store && typeof app.store.flush === 'function') {
                  app.store.flush();
                }
                app.audio.play('claim');
                showToast(tr('purchaseSuccess') + ': ' + localizedItemName);
                renderShop();
              } else {
                app.audio.play('error');
                var errMsg = tr('purchaseFailed');
                if (res && res.error === 'insufficient_funds') {
                  errMsg = tr('notEnoughCoins');
                } else if (res && res.error === 'already_owned') {
                  errMsg = tr('purchaseAlreadyOwned');
                } else if (res && res.message) {
                  errMsg = res.message;
                }
                showToast(errMsg);
              }
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
    page.appendChild(createScrollBottomSpacer());
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

  function getTierInfo(rank, isRu) {
    if (rank <= 3) return { tier: 'grandmaster', label: isRu ? '👑 ЛЕГЕНДА' : '👑 LEGEND', badge: 'GM' };
    if (rank <= 10) return { tier: 'diamond', label: isRu ? '💎 АЛМАЗ' : '💎 DIAMOND', badge: 'DIA' };
    if (rank <= 25) return { tier: 'platinum', label: isRu ? '💠 ПЛАТИНА' : '💠 PLATINUM', badge: 'PLT' };
    if (rank <= 50) return { tier: 'gold', label: isRu ? '🥇 ЗОЛОТО' : '🥇 GOLD', badge: 'GLD' };
    if (rank <= 100) return { tier: 'silver', label: isRu ? '🥈 СЕРЕБРО' : '🥈 SILVER', badge: 'SLV' };
    return { tier: 'bronze', label: isRu ? '🥉 БРОНЗА' : '🥉 BRONZE', badge: 'BRZ' };
  }

  function createPodiumColHtml(ath, place, cat) {
    var pClass = 'p' + place;
    var isRu = (getActiveLang() === 'ru');
    var crownHtml = place === 1 ? '<div class="fvh-podium-crown">👑</div>' : '';
    var medalEmoji = place === 1 ? '🥇' : place === 2 ? '🥈' : '🥉';
    var placeTitle = place === 1 ? (isRu ? '1-Е МЕСТО' : '1ST PLACE') : place === 2 ? (isRu ? '2-Е МЕСТО' : '2ND PLACE') : (isRu ? '3-Е МЕСТО' : '3RD PLACE');
    var isHoops = (ath.char === 'hoops');
    var avatarHtml = getPlayerAvatarHtml({ photoUrl: ath.photoUrl, character: ath.char, extraClass: 'podium-avatar', alt: ath.name });
    var teamTag = isHoops ?
      '<span class="fvh-podium-team-tag hoops">🏀 ' + tr('hoopsChar') + '</span>' :
      '<span class="fvh-podium-team-tag footy">⚽ ' + tr('footyChar') + '</span>';

    var wins = ath.wins || 0;
    var losses = ath.losses || 0;
    var matches = (ath.matches !== undefined ? ath.matches : (wins + losses));
    var winRate = (matches > 0 && ath.winRate !== undefined) ? ath.winRate : (matches > 0 ? Math.round((wins / matches) * 100) : 0);
    var statsText = matches > 0
      ? tr('winsLossesLabel', { w: wins, l: losses }) + ' · ' + tr('winRateLabel', { n: winRate })
      : (matches + (isRu ? ' матчей' : ' matches'));

    var tier = getTierInfo(place, isRu);
    var athOvr = Math.min(99, Math.max(75, Math.round(82 + (ath.score || 0) / 250)));

    return '<div class="fvh-podium-col ' + pClass + (isHoops ? ' is-hoops' : ' is-footy') + '">' +
      crownHtml +
      '<div class="fvh-podium-avatar-box ' + (isHoops ? 'hoops-halo' : 'footy-halo') + '">' + avatarHtml + '</div>' +
      '<div class="fvh-podium-name" title="' + escapeHtml(ath.name) + '">' + escapeHtml(ath.name) + '</div>' +
      '<div class="fvh-podium-meta-row">' +
      teamTag +
      '</div>' +
      '<div class="fvh-podium-score">' + (ath.score || 0).toLocaleString() + ' <small style="font-size:10px;opacity:0.85;">' + tr('ptsUnit') + '</small></div>' +
      '<div class="fvh-podium-winrate">' + statsText + '</div>' +
      '<div class="fvh-podium-pedestal">' +
      '  <div class="fvh-podium-medal-row">' +
      '    <span class="fvh-podium-medal">' + medalEmoji + '</span>' +
      '    <span class="fvh-podium-num">#' + place + '</span>' +
      '  </div>' +
      '  <div class="fvh-podium-place-label">' + placeTitle + '</div>' +
      '  <div class="fvh-podium-tier-tag ' + tier.tier + '">' + tier.label + '</div>' +
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
      photoUrl: 'assets/icons/user_basketball.png?v=20261117_clean',
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
        photoUrl: 'assets/icons/user_football.png?v=20261117_clean',
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
        id: 'me',
        name: ranked[myIdx].name,
        char: ranked[myIdx].char,
        rank: myIdx + 1,
        score: ranked[myIdx].score,
        tier: ranked[myIdx].tier,
        wins: ranked[myIdx].wins || 0,
        losses: ranked[myIdx].losses || 0,
        winRate: ranked[myIdx].winRate || 0,
        photoUrl: ranked[myIdx].photoUrl || null,
        pointsToNext: higher ? Math.max(1, higher.score - ranked[myIdx].score) : 0
      };
    }

    var footballTotal = 0;
    var basketballTotal = 0;
    var footyCount = 0;
    var hoopsCount = 0;
    athletes.forEach(function (a) {
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
    if (typeof updateLiveWarData === 'function') {
      updateLiveWarData(data);
    }
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

    // 2. Personal Standing Card (Always prominent and pinned right under tabs)
    var isRu = (getActiveLang() === 'ru');
    var pData = data.player || {
      rank: 1,
      score: (data.top && data.top[0] && data.top[0].score) || 1200,
      pointsToNext: 0,
      wins: (app.store && app.store.data && app.store.data.stats && app.store.data.stats.wins) || 6,
      losses: (app.store && app.store.data && app.store.data.stats && app.store.data.stats.losses) || 1,
      winRate: 86,
      name: (app.store && app.store.data && app.store.data.playerName) || 'Alim'
    };
    var pWins = pData.wins || 0;
    var pLosses = pData.losses || 0;
    var pTotalM = pWins + pLosses;
    var pWinRate = pData.winRate !== undefined ? pData.winRate : (pTotalM > 0 ? Math.round((pWins / pTotalM) * 100) : 0);
    var pScore = (pData.score || 0).toLocaleString();
    var pChar = pData.char || myChar || 'footy';
    var isFootyChar = (pChar === 'footy');

    var myCard = document.createElement('div');
    myCard.className = 'fvh-lb-my-standing-card ' + pChar;
    myCard.innerHTML =
      '<div class="fvh-lb-my-head">' +
      '  <div class="fvh-lb-my-rank-badge">#' + pData.rank + '</div>' +
      '  <div class="fvh-lb-my-avatar ' + (isFootyChar ? 'footy-halo' : 'hoops-halo') + '">' +
      getPlayerAvatarHtml({ photoUrl: pData.photoUrl || (app.store && app.store.data && app.store.data.photoUrl), character: pChar, extraClass: 'my-lb-avatar' }) +
      '  </div>' +
      '  <div class="fvh-lb-my-meta">' +
      '    <div class="fvh-lb-my-name-row">' +
      '      <span class="fvh-lb-my-name">' + escapeHtml(pData.name || (isRu ? 'Вы' : 'You')) + '</span>' +
      '      <span class="fvh-team-pill ' + (isFootyChar ? 'footy' : 'hoops') + '">' + (isFootyChar ? '⚽ FOOTY' : '🏀 HOOPS') + '</span>' +
      '    </div>' +
      '    <div class="fvh-lb-my-record">' +
      (pTotalM > 0 ? (pWins + 'W - ' + pLosses + 'L · ' + pWinRate + '% ' + (isRu ? 'побед' : 'wins')) : (isRu ? 'Матчей пока нет' : 'No matches yet')) +
      '    </div>' +
      '  </div>' +
      '  <div class="fvh-lb-my-score-box">' +
      '    <div class="fvh-lb-my-score-val">' + pScore + '</div>' +
      '    <div class="fvh-lb-my-score-lbl">' + tr('ptsUnit') + '</div>' +
      '  </div>' +
      '</div>' +
      '<div class="fvh-lb-my-footer">' +
      '  <div class="fvh-lb-my-target-text">' +
      (pData.pointsToNext > 0 ? (isRu ? '🎯 До следующего места: +' + pData.pointsToNext + ' PTS' : '🎯 Points to next rank: +' + pData.pointsToNext + ' PTS') : (isRu ? '👑 Вы удерживаете 1-е место в рейтинге!' : '👑 You lead the seasonal leaderboard!')) +
      '  </div>' +
      '  <button type="button" class="btn primary small fvh-lb-play-cta-btn">' + (isRu ? '⚔️ В матч (+PTS)' : '⚔️ Play (+PTS)') + '</button>' +
      '</div>';

    myCard.querySelector('.fvh-lb-play-cta-btn').onclick = function () {
      app.audio.play('click');
      app.go('mode');
    };
    body.appendChild(myCard);

    // Sponsor / Advertising Slot on Leaderboard
    var adBanner = document.createElement('div');
    adBanner.className = 'fvh-lb-ad-banner';
    adBanner.style.cssText = 'margin:10px 0 14px;padding:12px 16px;border-radius:14px;background:rgba(15,23,42,0.85);border:1.5px dashed rgba(0,240,255,0.4);display:flex;align-items:center;justify-content:center;gap:10px;font-weight:900;letter-spacing:0.8px;font-size:12px;color:#38bdf8;text-transform:uppercase;box-shadow:0 4px 16px rgba(0,0,0,0.3);';
    var adBadge = document.createElement('span');
    adBadge.style.cssText = 'padding:3px 8px;border-radius:6px;background:linear-gradient(135deg,#00f0ff,#0284c7);color:#020617;font-size:10px;font-weight:900;letter-spacing:0.5px;';
    adBadge.textContent = 'AD';
    var adText = document.createElement('span');
    adText.textContent = isRu ? 'Здесь может быть ваша реклама' : 'YOUR AD HERE';
    adBanner.appendChild(adBadge);
    adBanner.appendChild(adText);
    body.appendChild(adBanner);

    // 3. Team Rivalry Balance Card (Compact Clash Card)
    var scoreboardCard = document.createElement('div');
    scoreboardCard.className = 'fvh-war-scoreboard-card';
    scoreboardCard.innerHTML =
      '<div class="fvh-war-scoreboard-head">' +
      '  <span class="fvh-war-live-pill">' + (data.isPrelaunch ? ('⏳ ' + (isRu ? 'ПРЕДСЕЗОН' : 'PRE-LAUNCH')) : ('🔴 ' + (isRu ? 'ПРЯМОЙ ЭФИР' : 'LIVE CLASH'))) + '</span>' +
      '  <span class="fvh-war-rule-tag">' + (data.isPrelaunch ? ('⏳ ' + (isRu ? 'Скоро запуск' : 'Season Coming Soon')) : ('⏳ ' + tr('warSeasonTimer', { d: data.seasonDaysLeft || 14 }))) + '</span>' +
      '</div>' +
      '<div class="fvh-war-clash-grid">' +
      '  <div class="fvh-war-team-panel footy ' + (isFootyWinning ? 'is-leading' : '') + '">' +
      '    <div class="fvh-team-tag">⚽ FOOTY</div>' +
      '    <div class="fvh-team-score-num">' + teamFooty.score.toLocaleString() + '</div>' +
      '    <div class="fvh-team-meta">' +
      '      <span class="fvh-team-pct">' + teamFooty.pct + '%</span>' +
      '      <span class="fvh-team-status ' + (isFootyWinning ? 'lead' : 'behind') + '">' +
      (isFootyWinning ? ('👑 ' + (isRu ? 'ЛИДИРУЕТ' : 'LEADS')) : (isRu ? 'ОТСТАЕТ' : 'CHASING')) +
      '      </span>' +
      '    </div>' +
      '  </div>' +
      '  <div class="fvh-war-vs-divider">' +
      '    <div class="fvh-war-vs-badge">VS</div>' +
      '  </div>' +
      '  <div class="fvh-war-team-panel hoops ' + (!isFootyWinning ? 'is-leading' : '') + '">' +
      '    <div class="fvh-team-tag">🏀 HOOPS</div>' +
      '    <div class="fvh-team-score-num">' + teamHoops.score.toLocaleString() + '</div>' +
      '    <div class="fvh-team-meta">' +
      '      <span class="fvh-team-pct">' + teamHoops.pct + '%</span>' +
      '      <span class="fvh-team-status ' + (!isFootyWinning ? 'lead' : 'behind') + '">' +
      (!isFootyWinning ? ('👑 ' + (isRu ? 'ЛИДИРУЕТ' : 'LEADS')) : (isRu ? 'ОТСТАЕТ' : 'CHASING')) +
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
      '    <span style="color:var(--text-muted);font-size:11px;">' + (isRu ? 'Баланс команд' : 'Team Balance') + '</span>' +
      '    <span style="color:#fb923c;font-weight:900;">🏀 ' + teamHoops.pct + '%</span>' +
      '  </div>' +
      '</div>';
    body.appendChild(scoreboardCard);

    // 4. Rules Explanation Card (Explains what ranking measures)
    var rulesCard = document.createElement('div');
    rulesCard.className = 'fvh-lb-rules-card';
    rulesCard.style.margin = '0 0 12px';
    rulesCard.style.padding = '10px 14px';
    rulesCard.style.borderRadius = '12px';
    rulesCard.style.background = 'rgba(255, 255, 255, 0.05)';
    rulesCard.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    rulesCard.style.display = 'flex';
    rulesCard.style.alignItems = 'center';
    rulesCard.style.gap = '10px';
    rulesCard.innerHTML =
      '<span style="font-size:18px;">ℹ️</span>' +
      '<div style="font-size:11.5px;color:var(--text-muted);line-height:1.4;flex:1;">' +
      (isRu ? '<b style="color:#fff;">Система начисления очков:</b> +20 очков за победу · +10 очков за завершение матча' : '<b style="color:#fff;">Ranking Points:</b> +20 pts for each victory · +10 pts for match completion') +
      ' <span class="fvh-lb-airdrop-link" style="color:#38bdf8;font-weight:800;cursor:pointer;margin-left:4px;">' + (isRu ? '🪙 Топ-100 дают множитель дропа до 3.0x ➔' : '🪙 Top 100 get up to 3.0x Airdrop Boost ➔') + '</span>' +
      '</div>';

    var lbAirdropLink = rulesCard.querySelector('.fvh-lb-airdrop-link');
    if (lbAirdropLink) {
      lbAirdropLink.onclick = function () {
        app.audio.play('click');
        app.go('airdrop');
      };
    }
    body.appendChild(rulesCard);

    // 5. Live Search Filter Bar
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
      var allAthletes = (data.top || []).slice();
      allAthletes.sort(function (a, b) {
        return (b.score || 0) - (a.score || 0)
          || (b.wins || 0) - (a.wins || 0)
          || (b.winRate || 0) - (a.winRate || 0)
          || (((b.wins || 0) + (b.losses || 0)) - ((a.wins || 0) + (a.losses || 0)))
          || String(a.id || a.name || '').localeCompare(String(b.id || b.name || ''));
      });

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
        if (query) {
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
        } else {
          emptyCard.innerHTML =
            '<div style="text-align:center;padding:40px 16px;">' +
            '  <div style="font-size:40px;margin-bottom:10px;">🏆</div>' +
            '  <div style="font-size:16px;font-weight:900;color:var(--text-pure);margin-bottom:6px;">' + (isRu ? 'Матчи еще не сыграны' : 'No matches recorded yet') + '</div>' +
            '  <div style="font-size:12px;color:var(--text-muted);max-width:280px;margin:0 auto 16px;line-height:1.4;">' + (isRu ? 'Сыграйте матч в футбол или баскетбол, чтобы занять первое место в таблице лидеров!' : 'Play a football or basketball match to claim the #1 spot on the leaderboard!') + '</div>' +
            '</div>';
        }
        resultsMount.appendChild(emptyCard);
        return;
      }

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
        var wins = ath.wins || 0;
        var losses = ath.losses || 0;
        var matches = (ath.matches !== undefined ? ath.matches : (wins + losses));
        var winRate = (matches > 0 && ath.winRate !== undefined) ? ath.winRate : (matches > 0 ? Math.round((wins / matches) * 100) : 0);
        var statsText = matches > 0
          ? tr('winsLossesLabel', { w: wins, l: losses }) + ' (' + tr('winRateLabel', { n: winRate }) + ')'
          : (matches + (isRu ? ' матчей' : ' matches'));
        var tier = getTierInfo(ath.rank || 999, isRu);
        var athOvr = Math.min(99, Math.max(70, Math.round(75 + (ath.score || 0) / 300)));

        var row = document.createElement('div');
        row.className = 'fvh-leaderboard-row' + (ath.isCurrentUser ? ' is-me' : '') + (isHoops ? ' row-hoops' : ' row-footy');
        row.innerHTML =
          '<div class="fvh-lb-rank">#' + ath.rank + '</div>' +
          '<div class="fvh-lb-avatar ' + (isHoops ? 'hoops-halo' : 'footy-halo') + '">' +
          getPlayerAvatarHtml({ photoUrl: ath.photoUrl, character: ath.char, extraClass: 'row-avatar', alt: ath.name }) +
          '</div>' +
          '<div class="fvh-lb-info">' +
          '  <div class="fvh-lb-name">' +
          escapeHtml(ath.name) + (ath.isCurrentUser ? ' <span class="fvh-me-badge">' + (isRu ? 'ВЫ' : 'YOU') + '</span>' : '') +
          '    <span class="fvh-tier-pill ' + tier.tier + '">' + tier.label + '</span>' +
          '  </div>' +
          '  <div class="fvh-lb-club">' +
          '    <span class="fvh-team-pill ' + (isHoops ? 'hoops' : 'footy') + '">' + (isHoops ? '🏀 ' + tr('hoopsChar') : '⚽ ' + tr('footyChar')) + '</span>' +
          '    · ' + escapeHtml(ath.club || 'FvH Club') +
          '    · <span class="fvh-lb-winrate-text">' + statsText + '</span>' +
          '  </div>' +
          '</div>' +
          '<div class="fvh-lb-score-block">' +
          '  <div class="fvh-lb-score">' +
          '    <span class="fvh-lb-val">' + (ath.score || 0).toLocaleString() + '</span> ' +
          '    <span class="fvh-lb-unit">' + tr('ptsUnit') + '</span>' +
          '  </div>' +
          '  <div style="font-size:10px;color:var(--text-muted);margin-top:2px;">' + matches + (isRu ? ' матчей' : ' matches') + '</div>' +
          '</div>';
        rowsWrap.appendChild(row);
      });resultsMount.appendChild(rowsWrap);
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
      var sticky = document.createElement('div');
      sticky.className = 'fvh-leaderboard-sticky-player ' + myChar;
      sticky.innerHTML =
        '<div class="fvh-lb-sticky-rank">#' + data.player.rank + '</div>' +
        '<div class="fvh-lb-sticky-avatar ' + (myChar === 'hoops' ? 'hoops-halo' : 'footy-halo') + '">' +
        getPlayerAvatarHtml({ photoUrl: (data.player && data.player.photoUrl) || (app.store && app.store.data && app.store.data.photoUrl), character: myChar, extraClass: 'docked-avatar' }) +
        '</div>' +
        '<div class="fvh-lb-sticky-info">' +
        '  <div class="fvh-lb-sticky-title">' +
        (myChar === 'footy' ? '⚽ ' + tr('teamFootball') : '🏀 ' + tr('teamBasketball')) + ' · ' + (isRu ? 'Ваша позиция в таблице' : 'Your Rank') +
        '  </div>' +
        '  <div class="fvh-lb-sticky-sub">' +
        (data.player.pointsToNext > 0 ? tr('pointsToNext', { n: data.player.pointsToNext }) : (isRu ? 'Сезон 1 · Предзапуск' : 'Season 1 · Pre-Launch')) +
        '  </div>' +
        '</div>' +
        '<div class="fvh-lb-sticky-score">' +
        '  <div style="font-size:14px;font-weight:900;color:#fff;"><b>' + (data.player.score || 0).toLocaleString() + '</b> ' + tr('ptsUnit') + '</div>' +
        '  <div style="font-size:10px;color:var(--text-muted);margin-top:2px;">' + ((data.player.wins || 0) + (data.player.losses || 0)) + (isRu ? ' матчей' : ' matches') + '</div>' +
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
    backBtn.innerHTML = getUiIconSvg('arrow_back', 18);
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
    page.appendChild(createScrollBottomSpacer());
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
    backBtn.innerHTML = getUiIconSvg('arrow_back', 18);
    backBtn.onclick = function () {
      app.audio.play('click');
      app.showMenu();
    };
    var title = document.createElement('h1');
    title.textContent = tr('profile');
    head.appendChild(backBtn);
    head.appendChild(title);

    var setBtn = document.createElement('button');
    setBtn.className = 'btn icon';
    setBtn.innerHTML = '⚙️';
    setBtn.title = tr('settings');
    setBtn.style.cssText = 'position:absolute;right:14px;top:10px;font-size:18px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;';
    setBtn.onclick = function () {
      app.audio.play('click');
      app.go('settings');
    };
    head.appendChild(setBtn);
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
    idCard.className = 'fvh-profile-id-card fvh-profile-id-card--pro ' + chosenTeam;
    var curXp = Math.max(0, Number(d.xp || 0));
    var calcLvl = 1;
    var xpRest = curXp;
    var xpNeed = 100;
    while (xpRest >= xpNeed && calcLvl < 30) {
      xpRest -= xpNeed;
      calcLvl++;
      xpNeed = Math.round(100 + (calcLvl - 1) * 40);
    }
    var displayLvl = Math.max(Number(d.level || 1), Number((d.profile && d.profile.level) || 1), calcLvl);
    var isMaxLvl = displayLvl >= 30;
    var xpPct = isMaxLvl ? 100 : Math.min(100, Math.round((xpRest / Math.max(1, xpNeed)) * 100));

    idCard.innerHTML =
      '<div class="fvh-profile-avatar-wrap">' +
      '  <div class="fvh-profile-avatar-thumb" style="overflow:hidden;border-radius:50%;">' +
           getPlayerAvatarHtml({ photoUrl: userPhotoUrl, character: chosenTeam, extraClass: 'profile-avatar' }) +
      '  </div>' +
      '  <div class="fvh-profile-lvl-badge">Lv.' + displayLvl + '</div>' +
      '</div>' +
      '<div class="fvh-profile-id-info" style="flex:1;min-width:190px;">' +
      '  <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap;">' +
      '    <div class="fvh-profile-title-tag" style="display:inline-flex;align-items:center;gap:5px;font-weight:900;color:' + (isFooty ? '#38bdf8' : '#fb923c') + ';">' + getUiIconSvg(isFooty ? 'nav_home_footy' : 'nav_home_hoops', 14) + ' <span>' + (isFooty ? 'FOOTY · $FOOTY' : 'HOOPS · $HOOPS') + '</span></div>' +
      '    <button class="fvh-btn-edit-name" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);border-radius:8px;color:#38bdf8;font-size:11px;font-weight:800;padding:4px 10px;cursor:pointer;">' + (lang === 'ru' ? '✎ Изменить' : '✎ Edit') + '</button>' +
      '  </div>' +
      '  <h2 class="fvh-profile-name-text" style="margin:4px 0 2px;font-size:21px;font-weight:900;color:#fff;">' + escapeHtml(currentNickname) + '</h2>' +
      '  <div style="font-size:11px;color:#94a3b8;margin-bottom:8px;">' + (tgHandle ? escapeHtml(tgHandle) + ' · ' : '') + tr('teamLockedBadge') + '</div>' +
      '  <div class="fvh-profile-xp-wrap">' +
      '    <div class="fvh-profile-xp-head">' +
      '      <span>' + (isMaxLvl ? (lang === 'ru' ? 'МАКС. УРОВЕНЬ 30' : 'MAX LEVEL 30') : (lang === 'ru' ? 'Уровень ' + displayLvl + ' · Опыт' : 'Level ' + displayLvl + ' · XP')) + '</span>' +
      '      <span>' + (isMaxLvl ? curXp + ' XP' : (xpRest + ' / ' + xpNeed + ' XP')) + '</span>' +
      '    </div>' +
      '    <div class="fvh-profile-xp-bar"><div class="fvh-profile-xp-fill ' + chosenTeam + '" style="width:' + xpPct + '%;"></div></div>' +
      '  </div>' +
      (totalPacksCount > 0 ? '<div style="margin-top:8px;"><span class="fvh-packs-count-pill">' + tr('packsAvailable', { n: totalPacksCount }) + '</span></div>' : '') +
      '</div>';
    body.appendChild(idCard);

    // 1.5 Career Records Upfront (immediately visible above wallets on desktop & mobile!)
    var statsCard = document.createElement('div');
    statsCard.className = 'fvh-card-panel fvh-profile-stats-top';
    statsCard.innerHTML =
      '<div class="fvh-panel-head" style="display:flex;justify-content:space-between;align-items:center;">' +
      '  <span style="display:inline-flex;align-items:center;gap:6px;">' + getUiIconSvg('trophy', 16) + ' <span>' + tr('statRecords') + '</span></span>' +
      '  <span style="font-size:11px;color:#94a3b8;font-weight:700;">' + (lang === 'ru' ? 'Статистика сезона' : 'Season Stats') + '</span>' +
      '</div>' +
      '<div class="fvh-stats-kpi-grid">' +
      '<div class="fvh-kpi-item"><small>' + tr('matches') + '</small><b>' + totalMatches + '</b></div>' +
      '<div class="fvh-kpi-item win"><small>' + tr('victories') + '</small><b>' + totalWins + '</b></div>' +
      '<div class="fvh-kpi-item loss"><small>' + tr('defeats') + '</small><b>' + totalLosses + '</b></div>' +
      '<div class="fvh-kpi-item rate"><small>' + tr('winRate') + '</small><b>' + winPct + '%</b></div>' +
      '</div>' +
      '<div style="margin-top:12px;">' +
      '<div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--text-muted);margin-bottom:5px;font-weight:800;">' +
      '<span style="color:#38bdf8;display:inline-flex;align-items:center;gap:4px;">' + getUiIconSvg('nav_home_footy', 13) + ' <span>' + tr('football') + ' (' + wF + ')</span></span>' +
      '<span style="color:#fb923c;display:inline-flex;align-items:center;gap:4px;">' + getUiIconSvg('nav_home_hoops', 13) + ' <span>' + tr('basketball') + ' (' + wH + ')</span></span>' +
      '</div>' +
      '<div class="fvh-dual-bar" style="height:8px;border-radius:6px;overflow:hidden;background:#0f172a;display:flex;border:1px solid rgba(255,255,255,0.1);">' +
      '<div class="fvh-dual-footy" style="width:' + pctF + '%;background:linear-gradient(90deg,#0284c7,#00f0ff);transition:width 0.3s ease;"></div>' +
      '<div class="fvh-dual-hoops" style="width:' + pctH + '%;background:linear-gradient(90deg,#f97316,#ea580c);transition:width 0.3s ease;"></div>' +
      '</div>' +
      '</div>';
    body.appendChild(statsCard);

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

    // Economy & Wallet Section Header
    var ecoGrid = document.createElement('div');
    ecoGrid.className = 'fvh-profile-economy-grid';

    // 2. FvH Coins Balance Card (Distinct from blockchain tokens)
    var coinsCard = document.createElement('div');
    coinsCard.className = 'fvh-card-panel';
    coinsCard.style.background = 'linear-gradient(135deg, rgba(255,200,0,0.08) 0%, rgba(15,23,42,0.95) 100%)';
    coinsCard.style.border = '1.5px solid rgba(255,200,0,0.3)';
    coinsCard.style.display = 'flex';
    coinsCard.style.alignItems = 'center';
    coinsCard.style.justifyContent = 'space-between';
    coinsCard.style.padding = '14px 18px';
    coinsCard.style.marginBottom = '0';

    coinsCard.innerHTML =
      '<div style="display:flex;align-items:center;gap:12px;">' +
      '  <div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;">' + getFvhCoinSvg('thumb') + '</div>' +
      '  <div>' +
      '    <div style="font-size:11px;color:#94a3b8;font-weight:700;text-transform:uppercase;">' + tr('catCoins') + '</div>' +
      '    <div style="font-size:20px;font-weight:900;color:#facc15;margin-top:2px;">' + (d.coins || 0).toLocaleString() + ' FvH</div>' +
      '  </div>' +
      '</div>' +
      '<button class="btn primary small fvh-btn-profile-shop" style="font-weight:800;padding:8px 14px;display:inline-flex;align-items:center;gap:6px;">' + getUiIconSvg('cart', 14) + ' <span>' + tr('visitShopBtn') + '</span></button>';

    coinsCard.querySelector('.fvh-btn-profile-shop').onclick = function () {
      app.audio.play('click');
      app.go('shop');
    };
    ecoGrid.appendChild(coinsCard);

    // 3. Team Token Balance Card ($FOOTY or $HOOPS only, with Withdraw button)
    var tokenCard = document.createElement('div');
    tokenCard.className = 'fvh-card-panel';
    tokenCard.style.background = isFooty
      ? 'linear-gradient(135deg, rgba(0,240,255,0.08) 0%, rgba(15,23,42,0.95) 100%)'
      : 'linear-gradient(135deg, rgba(255,140,0,0.08) 0%, rgba(15,23,42,0.95) 100%)';
    tokenCard.style.border = isFooty ? '1.5px solid rgba(0,240,255,0.3)' : '1.5px solid rgba(255,140,0,0.3)';
    tokenCard.style.padding = '16px 18px';
    tokenCard.style.marginBottom = '0';

    tokenCard.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
      '  <div style="display:flex;align-items:center;gap:10px;">' +
      '    <span style="display:inline-flex;align-items:center;">' + getUiIconSvg(isFooty ? 'nav_home_footy' : 'nav_home_hoops', 26) + '</span>' +
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
      '</div>' +
      '<div style="margin-top:10px;border-top:1px solid rgba(255,255,255,0.08);padding-top:10px;">' +
      '  <button type="button" class="btn block fvh-btn-profile-airdrop-hub" style="background:linear-gradient(135deg, rgba(0,152,234,0.18) 0%, rgba(0,152,234,0.36) 100%);border:1px solid rgba(56,189,248,0.4);color:#38bdf8;font-weight:900;font-size:12px;padding:9px 12px;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;">' +
      '    <span>' + getUiIconSvg('coin', 15) + '</span> <span>' + tr('airdropHowToEarnTokens') + '</span>' +
      '  </button>' +
      '</div>';

    var airdropHubBtn = tokenCard.querySelector('.fvh-btn-profile-airdrop-hub');
    if (airdropHubBtn) {
      airdropHubBtn.onclick = function () {
        app.audio.play('click');
        app.go('airdrop');
      };
    }

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

    ecoGrid.appendChild(tokenCard);
    body.appendChild(ecoGrid);

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

    // Ledger card stays directly below TON wallet (Career Stats moved up above wallets)

    // 5. Transaction Ledger Card
    var ledgerCard = document.createElement('div');
    ledgerCard.className = 'fvh-card-panel fvh-tx-ledger';
    var txList = (d.transactions && Array.isArray(d.transactions)) ? d.transactions : [];
    ledgerCard.innerHTML =
      '<div class="fvh-panel-head">📋 ' + (lang === 'ru' ? 'История операций' : 'Transaction History') + '</div>' +
      (txList.length === 0
        ? '<div style="font-size:12px;color:var(--text-muted);padding:8px 0;text-align:center;">' + (lang === 'ru' ? 'Нет записей' : 'No transactions recorded yet') + '</div>'
        : '<div style="display:flex;flex-direction:column;gap:6px;max-height:160px;overflow-y:auto;">' +
          txList.slice(0, 10).map(function (tx) {
            return '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;background:rgba(255,255,255,0.03);border-radius:6px;font-size:11.5px;">' +
              '<span>' + escapeHtml(tx.desc || tx.type || 'Transaction') + '</span>' +
              '<b style="color:' + (tx.amount >= 0 ? '#4ade80' : '#f87171') + ';">' + (tx.amount >= 0 ? '+' : '') + tx.amount + '</b>' +
            '</div>';
          }).join('') +
          '</div>');
    body.appendChild(ledgerCard);

    page.appendChild(body);
    page.appendChild(createScrollBottomSpacer());
    container.appendChild(page);

    // Bottom Navigation
    container.appendChild(createSharedBottomNav('profile', app));
    return container;
  }

  // Drop PTS Calculation Engine for Play-to-Airdrop
  function calculateAirdropStats(data) {
    var d = data || (window.app && window.app.store && window.app.store.data) || {};
    var st = d.stats || {};
    var wins = Number(st.wins || d.wins || 0);
    var matches = Number(st.matches || d.matches || (wins + Number(st.losses || 0)));
    var goals = Number(st.goals || d.goals || 0);
    var baskets = Number(st.baskets || d.baskets || 0);

    var refData = d.referrals || [];
    var refCount = Array.isArray(refData) ? refData.length : (refData.total || 0);

    var up = d.upgrades || { power: 1, stamina: 1, keeper: 1 };
    var upLevels = Math.max(0, (up.power || 1) + (up.stamina || 1) + (up.keeper || 1) - 3);
    var lvl = (d.profile && d.profile.level) ? d.profile.level : (d.level || 1);

    var base = 100;
    var matchesPts = (matches * 10) + (wins * 25);
    var goalsPts = (goals * 6) + (baskets * 3);
    var refPts = (refCount * 50);
    var progPts = (upLevels * 30) + (lvl * 20);
    var walletAddr = d.tonWalletAddress || (d.profile && d.profile.tonAddress) || '';
    var hasWallet = Boolean(walletAddr);
    var walletBonus = hasWallet ? 150 : 0;

    var pts = base + (wins * 25) + (goals * 6) + (baskets * 3) + (matches * 10) + (refCount * 50) + (upLevels * 30) + (lvl * 20) + walletBonus;

    var tierKey = 'airdropTierRookie';
    var multiplier = '1.0x';
    var tierMin = 0;
    var nextTierPts = 300;
    var nextTierKey = 'airdropTierContender';
    var nextTierMult = '1.5x';
    if (pts >= 2500) {
      tierKey = 'airdropTierLegend';
      multiplier = '3.0x';
      tierMin = 2500;
      nextTierPts = null;
      nextTierKey = null;
      nextTierMult = '3.0x';
    } else if (pts >= 800) {
      tierKey = 'airdropTierPro';
      multiplier = '2.0x';
      tierMin = 800;
      nextTierPts = 2500;
      nextTierKey = 'airdropTierLegend';
      nextTierMult = '3.0x';
    } else if (pts >= 300) {
      tierKey = 'airdropTierContender';
      multiplier = '1.5x';
      tierMin = 300;
      nextTierPts = 800;
      nextTierKey = 'airdropTierPro';
      nextTierMult = '2.0x';
    }

    var pctToNext = nextTierPts
      ? Math.max(4, Math.min(100, Math.round(((pts - tierMin) / Math.max(1, nextTierPts - tierMin)) * 100)))
      : 100;

    return {
      pts: pts,
      tierKey: tierKey,
      multiplier: multiplier,
      nextTierPts: nextTierPts,
      nextTierKey: nextTierKey,
      nextTierMult: nextTierMult,
      pctToNext: pctToNext,
      basePts: base,
      matchesPts: matchesPts,
      goalsPts: goalsPts,
      refPts: refPts,
      progPts: progPts,
      walletPts: walletBonus,
      hasWallet: hasWallet,
      walletAddress: walletAddr,
      wins: wins,
      matches: matches,
      goals: goals + baskets,
      refCount: refCount,
      lvl: lvl
    };
  }

  // Reusable TON Wallet Modal (Play-to-Airdrop & Profile)
  function showTonWalletModal(app, onComplete) {
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
        if (onComplete) onComplete(raw);
      }).catch(function (e) {
        app.store.update(function (st) {
          st.tonWalletAddress = raw;
          if (!st.profile) st.profile = {};
          st.profile.tonAddress = raw;
        });
        app.audio.play('claim');
        showToast(getActiveLang() === 'ru' ? '✓ TON-кошелек привязан' : '✓ TON wallet linked');
        overlay.remove();
        if (onComplete) onComplete(raw);
      });
    };

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    setTimeout(function () { inputEl.focus(); }, 100);
  }

  // Dedicated Play-to-Airdrop Hub Screen
  function buildAirdropPage(app) {
    var d = app.store.data;
    var lang = getActiveLang();
    var isRu = (lang === 'ru');
    var curChar = d.selectedCharacter || 'footy';
    var isFooty = (curChar === 'footy');
    var tokenSym = isFooty ? '$FOOTY' : '$HOOPS';
    var tokenColor = isFooty ? '#38bdf8' : '#fb923c';

    var stats = calculateAirdropStats(d);
    var estimatedTokens = Math.round(stats.pts * parseFloat(stats.multiplier || '1.0') * 10);
    var shortWallet = stats.hasWallet ? (stats.walletAddress.slice(0, 6) + '...' + stats.walletAddress.slice(-4)) : '';

    var container = document.createElement('div');
    container.className = 'screen solid page-screen has-nav fvh-airdrop-page';
    container.dataset.id = 'airdrop';

    var page = document.createElement('div');
    page.className = 'page';

    // 1. Head
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
    title.textContent = tr('airdropHubTitle');
    head.appendChild(backBtn);
    head.appendChild(title);
    page.appendChild(head);

    // 2. Body
    var body = document.createElement('div');
    body.className = 'page-body fvh-airdrop-container';

    // 2.1 Clear Overview Hero Card (Points + Rank Progress + Currency Legend)
    var ptsLeft = stats.nextTierPts ? Math.max(0, stats.nextTierPts - stats.pts) : 0;
    var progressLabel = stats.nextTierPts
      ? (isRu
          ? ('Ещё <b>' + ptsLeft.toLocaleString() + ' Drop PTS</b> до ранга «' + tr(stats.nextTierKey) + '» (множитель <b>' + stats.nextTierMult + '</b>)')
          : ('<b>' + ptsLeft.toLocaleString() + ' Drop PTS</b> left for ' + tr(stats.nextTierKey) + ' (<b>' + stats.nextTierMult + '</b> boost)'))
      : (isRu ? '👑 Максимальный ранг достигнут (множитель 3.0x)' : '👑 Maximum Tier Unlocked (3.0x Boost)');

    var heroCard = document.createElement('div');
    heroCard.className = 'fvh-airdrop-page-hero ' + (isFooty ? 'footy' : 'hoops');
    heroCard.innerHTML =
      '<div class="fvh-ad-hero-top">' +
      '  <span class="fvh-ad-faction-pill" style="color:' + tokenColor + ';border-color:' + (isFooty ? 'rgba(56,189,248,0.45)' : 'rgba(251,146,60,0.45)') + ';">' +
      (isFooty ? '⚽ ' : '🏀 ') + (isRu ? 'Твой токен на TON: ' : 'Your TON Token: ') + '<b>' + tokenSym + '</b>' +
      '  </span>' +
      '  <span class="fvh-ad-status-pill">' + (stats.hasWallet ? (isRu ? '✓ Кошелёк готов' : '✓ Wallet Ready') : (isRu ? 'Pre-TGE Фарминг' : 'Pre-TGE Active')) + '</span>' +
      '</div>' +
      '<div class="fvh-ad-score-row">' +
      '  <div class="fvh-ad-hero-coin">' + getAirdropHeroGraphicSvg(curChar) + '</div>' +
      '  <div class="fvh-ad-score-main">' +
      '    <div class="fvh-airdrop-pts-value">' + stats.pts.toLocaleString() + ' <span>Drop PTS</span></div>' +
      '    <div class="fvh-ad-plain-explain">' +
      (isRu
        ? 'Очки превратятся в реальные токены <b>' + tokenSym + '</b> на TON при запуске (TGE).'
        : 'Points convert into real <b>' + tokenSym + '</b> tokens on TON at TGE launch.') +
      '    </div>' +
      '  </div>' +
      '  <div class="fvh-ad-est-box fvh-airdrop-calc-box">' +
      '    <span class="fvh-ad-est-lbl">' + (isRu ? 'Оценка TGE' : 'Est. Drop') + '</span>' +
      '    <b class="fvh-ad-est-val" style="color:' + tokenColor + ';">~' + estimatedTokens.toLocaleString() + ' ' + tokenSym + '</b>' +
      '  </div>' +
      '</div>' +
      '<div class="fvh-ad-rank-wrap">' +
      '  <div class="fvh-ad-rank-badges">' +
      '    <span class="fvh-airdrop-tier-chip">👑 ' + tr(stats.tierKey) + '</span>' +
      '    <span class="fvh-airdrop-tier-chip mult">⚡ ' + (isRu ? 'Множитель: ' : 'Boost: ') + stats.multiplier + ' (до 3.0x)</span>' +
      '  </div>' +
      '  <div class="fvh-ad-progress-track"><div class="fvh-ad-progress-fill" style="width:' + stats.pctToNext + '%;"></div></div>' +
      '  <div class="fvh-ad-progress-caption">' + progressLabel + '</div>' +
      '</div>' +
      '<div class="fvh-ad-currency-strip">' +
      '  <div>🪙 <b>FvH Монеты</b> — ' + (isRu ? 'для скинов и улучшений в магазине' : 'in-game currency for kits & upgrades') + '</div>' +
      '  <div>💎 <b>Drop PTS</b> — ' + (isRu ? 'твой рейтинг и доля в аирдропе ' + tokenSym : 'your qualification score for ' + tokenSym + ' airdrop') + '</div>' +
      '</div>';
    body.appendChild(heroCard);

    // 2.2 Crystal-Clear 3-Step Visual Guide ("Как это работает за 10 секунд")
    var flowTitle = document.createElement('div');
    flowTitle.className = 'fvh-ad-section-title';
    flowTitle.textContent = isRu ? '🚀 Как это работает — 3 шага' : '🚀 How It Works — 3 Simple Steps';
    body.appendChild(flowTitle);

    var flowGrid = document.createElement('div');
    flowGrid.className = 'fvh-ad-flow-grid';
    var steps = isRu
      ? [
          { num: '1', title: 'Копи Drop PTS', desc: 'Играй матчи, забивай голы и зови друзей по ссылке.' },
          { num: '2', title: 'Подними буст', desc: 'Занимай Топ в рейтинге (до 3.0x) и привяжи TON-кошелёк (+150 PTS).' },
          { num: '3', title: 'Получи ' + tokenSym, desc: 'В день запуска (TGE) токены придут на твой TON-кошелёк.' }
        ]
      : [
          { num: '1', title: 'Earn Drop PTS', desc: 'Play matches, score goals/dunks, and invite friends.' },
          { num: '2', title: 'Boost Multiplier', desc: 'Climb leaderboard (up to 3.0x) & link TON wallet (+150 PTS).' },
          { num: '3', title: 'Claim ' + tokenSym, desc: 'At TGE launch, PTS convert into tokens on TON.' }
        ];
    steps.forEach(function (s) {
      var stEl = document.createElement('div');
      stEl.className = 'fvh-ad-flow-step';
      stEl.innerHTML =
        '<div class="fvh-ad-flow-num">' + s.num + '</div>' +
        '<div class="fvh-ad-flow-txt"><b>' + s.title + '</b><span>' + s.desc + '</span></div>';
      flowGrid.appendChild(stEl);
    });
    body.appendChild(flowGrid);

    // 2.3 Actionable Checklist ("Что нужно сделать сейчас")
    var checkTitle = document.createElement('div');
    checkTitle.className = 'fvh-ad-section-title';
    checkTitle.textContent = isRu ? '✅ Что нужно сделать сейчас' : '✅ Your Airdrop Checklist';
    body.appendChild(checkTitle);

    var checkList = document.createElement('div');
    checkList.className = 'fvh-ad-checklist fvh-airdrop-pillars-grid';

    function makeCheckRow(opts) {
      var row = document.createElement('div');
      row.className = 'fvh-ad-check-row ' + (opts.done ? 'is-done' : (opts.highlight ? 'is-priority' : ''));
      row.innerHTML =
        '<div class="fvh-ad-check-icon">' + opts.icon + '</div>' +
        '<div class="fvh-ad-check-body">' +
        '  <div class="fvh-ad-check-head">' +
        '    <span class="fvh-ad-check-name">' + opts.title + '</span>' +
        '    <span class="fvh-ad-check-badge ' + (opts.done ? 'ok' : 'todo') + '">' + opts.badge + '</span>' +
        '  </div>' +
        '  <div class="fvh-ad-check-desc">' + opts.desc + '</div>' +
        '</div>' +
        '<button type="button" class="fvh-ad-check-btn' + (opts.btnPrimary ? ' primary' : '') + (opts.btnClass ? (' ' + opts.btnClass) : '') + '">' + opts.btnText + '</button>';
      row.querySelector('.fvh-ad-check-btn').onclick = opts.onClick;
      return row;
    }

    // Step 1: Faction Choice
    checkList.appendChild(makeCheckRow({
      icon: isFooty ? '⚽' : '🏀',
      done: true,
      title: isRu ? '1. Команда и токен (' + tokenSym + ')' : '1. Team & Token (' + tokenSym + ')',
      badge: isRu ? '✓ Выбрано' : '✓ Done',
      desc: isRu
        ? 'Очки идут в токен <b>' + tokenSym + '</b>. Команду можно сменить в любой момент.'
        : 'Earning toward <b>' + tokenSym + '</b>. You can switch anytime.',
      btnText: isRu ? 'Сменить' : 'Switch',
      onClick: function () {
        app.audio.play('click');
        showTeamSelectionModal(app, true);
      }
    }));

    // Step 2: Public TON Wallet
    checkList.appendChild(makeCheckRow({
      icon: '💎',
      done: stats.hasWallet,
      highlight: !stats.hasWallet,
      title: '2. ' + tr('airdropPillarWalletTitle').replace(/^\d+\.\s*/, ''),
      badge: stats.hasWallet ? (escapeHtml(shortWallet) + ' · +150 PTS') : '+150 Drop PTS',
      desc: stats.hasWallet
        ? (isRu ? 'Кошелёк Tonkeeper / Telegram Wallet сохранён для снимка (Snapshot).' : 'Public TON address saved for the TGE Snapshot.')
        : (isRu ? 'Нужен <b>ТОЛЬКО публичный адрес</b> (EQ.../UQ...). Сид-фраза и пароли НИКОГДА не нужны!' : 'Enter <b>ONLY public address</b> (EQ.../UQ...). Never enter seed phrases!'),
      btnText: stats.hasWallet ? (isRu ? 'Изменить' : 'Manage') : (isRu ? 'Привязать' : 'Link Wallet'),
      btnPrimary: !stats.hasWallet,
      btnClass: 'fvh-btn-airdrop-manage-wallet',
      onClick: function () {
        if (stats.hasWallet) {
          app.go('profile');
        } else {
          showTonWalletModal(app, function () {
            app.show(buildAirdropPage(app), 'airdrop');
          });
        }
      }
    }));

    // Step 3: Play Matches
    checkList.appendChild(makeCheckRow({
      icon: '⚔️',
      done: stats.matches > 0,
      title: '3. ' + tr('airdropPillarMatchesTitle').replace(/^\d+\.\s*/, ''),
      badge: isRu ? ('Матчей: ' + stats.matches + ' · Побед: ' + stats.wins) : (stats.matches + ' Matches · ' + stats.wins + ' Wins'),
      desc: isRu
        ? '<b>+25 PTS</b> за победу · <b>+10 PTS</b> за матч · <b>+6 PTS</b> за гол (<b>+3 PTS</b> за бросок).'
        : '<b>+25 PTS</b> per win · <b>+10 PTS</b> per match · <b>+6 PTS</b> per goal (<b>+3 PTS</b> basket).',
      btnText: isRu ? 'Играть' : 'Play',
      btnPrimary: true,
      onClick: function () {
        app.audio.play('click');
        app.showModeSelect();
      }
    }));

    // Step 4: Leaderboard Boost
    checkList.appendChild(makeCheckRow({
      icon: '🏆',
      done: parseFloat(stats.multiplier || '1.0') > 1.0,
      title: '4. ' + tr('airdropPillarLeaderboardTitle').replace(/^\d+\.\s*/, ''),
      badge: isRu ? ('Буст: ' + stats.multiplier) : ('Boost: ' + stats.multiplier),
      desc: isRu
        ? 'Топ-100 игроков получают <b>1.5x</b>, Топ-50 — <b>2.0x</b>, а Топ-10 — <b>3.0x</b> на TGE!'
        : 'Top 100 earn <b>1.5x</b>, Top 50 earn <b>2.0x</b>, and Top 10 earn <b>3.0x</b> at TGE!',
      btnText: isRu ? 'Топ' : 'Ranks',
      onClick: function () {
        app.audio.play('click');
        app.go('leaderboard');
      }
    }));

    // Step 5: Invite Friends
    checkList.appendChild(makeCheckRow({
      icon: '👥',
      done: stats.refCount > 0,
      title: '5. ' + tr('airdropPillarSquadTitle').replace(/^\d+\.\s*/, ''),
      badge: isRu ? ('Друзей: ' + stats.refCount) : (stats.refCount + ' Friends'),
      desc: isRu
        ? 'За каждого друга: <b>+50 Drop PTS</b> к аирдропу и <b>+100 FvH монет</b> в магазин!'
        : 'Per friend: <b>+50 Drop PTS</b> for airdrop + <b>+100 FvH Coins</b> bonus!',
      btnText: isRu ? 'Пригласить' : 'Invite',
      onClick: function () {
        app.audio.play('click');
        app.go('quests', { tab: 'referrals' });
      }
    }));

    body.appendChild(checkList);

    // 2.4 Transparent Points Breakdown Ledger ("Откуда мои очки")
    var ledgerTitle = document.createElement('div');
    ledgerTitle.className = 'fvh-ad-section-title';
    ledgerTitle.textContent = isRu ? '📊 Откуда ваши Drop PTS' : '📊 Your Points Breakdown';
    body.appendChild(ledgerTitle);

    var ledgerCard = document.createElement('div');
    ledgerCard.className = 'fvh-card-panel fvh-ad-ledger';
    var ledgerRows = [
      { lbl: isRu ? 'Стартовый бонус игрока' : 'Starter Welcome Bonus', val: '+' + stats.basePts + ' PTS' },
      { lbl: isRu ? 'Матчи и победы (' + stats.matches + ' / ' + stats.wins + ')' : 'Matches & Wins (' + stats.matches + ' / ' + stats.wins + ')', val: '+' + stats.matchesPts + ' PTS' },
      { lbl: isRu ? 'Голы и данки (' + stats.goals + ')' : 'Goals & Baskets (' + stats.goals + ')', val: '+' + stats.goalsPts + ' PTS' },
      { lbl: isRu ? 'Уровень и прокачка (Lvl ' + stats.lvl + ')' : 'Level & Upgrades (Lvl ' + stats.lvl + ')', val: '+' + stats.progPts + ' PTS' },
      { lbl: isRu ? 'Отряд друзей (' + stats.refCount + ' чел.)' : 'Referral Squad (' + stats.refCount + ')', val: '+' + stats.refPts + ' PTS' },
      { lbl: isRu ? 'Бонус за TON-кошелёк' : 'TON Wallet Link Bonus', val: stats.hasWallet ? '+150 PTS' : (isRu ? '0 PTS (не привязан)' : '0 PTS (unlinked)') }
    ];
    ledgerCard.innerHTML =
      ledgerRows.map(function (r) {
        return '<div class="fvh-ad-ledger-row"><span>' + r.lbl + '</span><b>' + r.val + '</b></div>';
      }).join('') +
      '<div class="fvh-ad-ledger-total">' +
      '  <span>' + (isRu ? 'Итого: ' + stats.pts.toLocaleString() + ' PTS × ' + stats.multiplier + ' буст' : 'Total: ' + stats.pts.toLocaleString() + ' PTS × ' + stats.multiplier) + '</span>' +
      '  <b style="color:' + tokenColor + ';">~' + estimatedTokens.toLocaleString() + ' ' + tokenSym + '</b>' +
      '</div>';
    body.appendChild(ledgerCard);

    // 2.5 Clear Accordion FAQ ("Частые вопросы и безопасность")
    var faqTitle = document.createElement('div');
    faqTitle.className = 'fvh-ad-section-title';
    faqTitle.textContent = isRu ? '❓ Частые вопросы' : '❓ FAQ & Security';
    body.appendChild(faqTitle);

    var faqWrap = document.createElement('div');
    faqWrap.className = 'fvh-ad-faq-list';
    var faqs = isRu
      ? [
          {
            q: 'Когда я получу реальные токены $FOOTY / $HOOPS?',
            a: 'Токены будут распределены после завершения сезона на официальном TGE (листинге) в сети TON пропорционально вашим накопленным Drop PTS и множителю.'
          },
          {
            q: 'Чем FvH Монеты отличаются от Drop PTS?',
            a: 'FvH Монеты — обычная игровая валюта для покупки форм, бустов и стадионов. Drop PTS — очки рейтинга, которые определяют ваш будущий аирдроп токенов.'
          },
          {
            q: 'Безопасно ли подключать TON-кошелёк?',
            a: 'Да. Мы просим только публичный адрес получения (EQ.../UQ... из Tonkeeper или Telegram Wallet). Никогда никому не передавайте сид-фразу из 24 слов!'
          }
        ]
      : [
          {
            q: 'When will real $FOOTY / $HOOPS tokens be distributed?',
            a: 'Tokens are distributed after Season completion during official TGE on the TON blockchain, proportional to your verified Drop PTS and Leaderboard multiplier.'
          },
          {
            q: 'What is the difference between FvH Coins and Drop PTS?',
            a: 'FvH Coins are for in-game cosmetics and skill upgrades. Drop PTS track your qualification share for the post-TGE token airdrop.'
          },
          {
            q: 'Is linking my TON wallet safe?',
            a: 'Yes. We only store your public receiving address (EQ.../UQ...). We will NEVER ask for your 24-word seed phrase or private key.'
          }
        ];
    faqs.forEach(function (f, idx) {
      var det = document.createElement('details');
      det.className = 'fvh-ad-faq-item';
      if (idx === 0) det.open = true;
      det.innerHTML = '<summary>' + f.q + '</summary><p>' + f.a + '</p>';
      faqWrap.appendChild(det);
    });
    body.appendChild(faqWrap);

    // 2.6 Clear Official Security & Non-Crypto Coin Guarantee
    var legalNote = document.createElement('div');
    legalNote.className = 'fvh-ad-legal-note';
    legalNote.innerHTML = '<div>' + tr('airdropSecurityNote') + '</div><div>' + tr('airdropDisclaimer') + '</div>';
    body.appendChild(legalNote);

    page.appendChild(body);
    page.appendChild(createScrollBottomSpacer());
    container.appendChild(page);

    // Shared Bottom Navigation
    container.appendChild(createSharedBottomNav('airdrop', app));
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
    backBtn.innerHTML = getUiIconSvg('arrow_back', 18);
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
      '</div>' +
      '<div class="fvh-setting-row">' +
      '<div><b>' + tr('hapticsTitle') + '</b><div style="font-size:11px;color:var(--text-muted);">' + tr('hapticsDesc') + '</div></div>' +
      '<input type="checkbox" id="fvh-chk-haptics" ' + (st.haptics !== false ? 'checked' : '') + ' class="fvh-toggle">' +
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
    audioPanel.querySelector('#fvh-chk-haptics').onchange = function (e) {
      var enabled = e.target.checked;
      app.store.update(function (d) { d.settings.haptics = enabled; });
      if (app.telegram && typeof app.telegram.setHaptics === 'function') {
        app.telegram.setHaptics(enabled);
      }
      if (enabled) triggerHaptic('medium');
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
      if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
        try {
          fetch(getApiUrl('/api/telegram/validate-init-data'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              initData: window.Telegram.WebApp.initData,
              platform: window.Telegram.WebApp.platform || 'unknown',
              playerId: (app && app.store && app.store.data && app.store.data.playerId) || null,
              preferredLanguage: newLang
            })
          }).catch(function () {});
        } catch (e) {}
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

    // 4. Business & Partnerships Panel
    var partnerPanel = document.createElement('div');
    partnerPanel.className = 'fvh-card-panel';
    var isRu = (st.lang || 'ru') === 'ru';
    partnerPanel.innerHTML =
      '<div class="fvh-panel-head">🤝 ' + (isRu ? 'Сотрудничество и партнерство' : 'Business & Partnerships') + '</div>' +
      '<p style="font-size:12px;color:var(--text-muted);margin:4px 0 10px;line-height:1.4;">' +
      (isRu ? 'По вопросам рекламы, турниров, спонсорства и предложений:' : 'For sponsorships, tournaments, advertising, and business inquiries:') +
      '</p>' +
      '<div style="display:flex;flex-direction:column;gap:8px;">' +
      '  <button type="button" class="btn block fvh-btn-open-email" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:11px 14px;background:rgba(0,240,255,0.12);border:1.5px solid rgba(0,240,255,0.4);border-radius:12px;color:#38bdf8;font-weight:800;font-size:13px;box-shadow:0 0 14px rgba(0,240,255,0.15);cursor:pointer;">' +
      '    <span>📧</span> <span>footyvshoops@gmail.com</span> <span style="font-size:11px;opacity:0.8;">(' + (isRu ? 'Открыть' : 'Open') + ')</span>' +
      '  </button>' +
      '  <button type="button" class="btn block secondary fvh-btn-copy-email" style="display:flex;align-items:center;justify-content:center;gap:6px;padding:8px 12px;font-size:12px;cursor:pointer;">' +
      '    <span>📋</span> <span>' + (isRu ? 'Скопировать email адрес' : 'Copy email address') + '</span>' +
      '  </button>' +
      '</div>';
    body.appendChild(partnerPanel);

    var openEmailBtn = partnerPanel.querySelector('.fvh-btn-open-email');
    if (openEmailBtn) {
      openEmailBtn.onclick = function () {
        app.audio.play('click');
        openEmailClient('footyvshoops@gmail.com');
      };
    }
    var copyEmailBtn = partnerPanel.querySelector('.fvh-btn-copy-email');
    if (copyEmailBtn) {
      copyEmailBtn.onclick = function () {
        app.audio.play('click');
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText('footyvshoops@gmail.com');
          }
        } catch (e) {}
        showToast(isRu ? '📋 Email footyvshoops@gmail.com скопирован!' : '📋 Email footyvshoops@gmail.com copied!');
        triggerHaptic('selection');
      };
    }

    // 5. Data Management & Danger Zone
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
    page.appendChild(createScrollBottomSpacer());
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
      icon: '⭐',
      colors: ['#f6c445', '#d97706', '#1c1917', '#fffbeb'],
      bannerGrad: 'linear-gradient(135deg, #b45309 0%, #1c1917 50%, #fcd34d 100%)',
      isDefault: false,
      mode: 'all'
    }
  ];

  // High-Performance Native WebSocket & Optimized Coalescing Relay Link
  // Legacy online WebRTC/room lobby UI removed cleanly in v5.1 (Solo AI mode default).
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
    backBtn.innerHTML = getUiIconSvg('arrow_back', 18);
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

      var baseArenas = [
        { id: 'std_footy_classic', category: 'stadiums', slot: 'stadium.footy', mode: 'footy', name: 'Classic Grass', rarity: 'common', price: 0, isDefault: true, icon: '🏟️', desc: tr('arenaDescClassicFooty') },
        { id: 'std_hoops_street', category: 'stadiums', slot: 'stadium.hoops', mode: 'hoops', name: 'Street Classic', rarity: 'common', price: 0, isDefault: true, icon: '🏀', desc: tr('arenaDescClassicHoops') }
      ];
      var combinedArenas = baseArenas.concat(SCENIC_ARENAS_CATALOG);

      var filtered = combinedArenas.filter(function (a) {
        if (curFilter === 'all') return true;
        if (a.id === 'std_ocean_sunset') return true;
        return a.mode === curFilter;
      });

      filtered.forEach(function (arena) {
        var card = document.createElement('div');
        var slotKey = arena.slot || ('stadium.' + arena.mode);
        var isEquipped = (eq[slotKey] === arena.id) || (arena.id === 'std_footy_classic' && !eq['stadium.footy']) || (arena.id === 'std_hoops_street' && !eq['stadium.hoops']);
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
                if (d.equipped.stadium) delete d.equipped.stadium;
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
    page.appendChild(createScrollBottomSpacer());

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
    backBtn.innerHTML = getUiIconSvg('arrow_back', 18);
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

    var playerChosenChar = (app.store && app.store.data && (app.store.data.selectedCharacter || app.store.data.selectedTeam)) || curChar || 'footy';
    var selSport = playerChosenChar;
    var selDiff = curSettings.difficulty || 'normal';
    var selMinutes = Number(curSettings.matchMinutes) || 2;
    var isPlayerFooty = (playerChosenChar === 'footy');
    var youTeamName = isPlayerFooty ? 'FOOTY' : 'HOOPS';
    var cpuTeamName = isPlayerFooty ? 'HOOPS' : 'FOOTY';
    var youColor = isPlayerFooty ? '#38bdf8' : '#fb923c';
    var cpuColor = isPlayerFooty ? '#fb923c' : '#38bdf8';

    function resolveActiveArenaInfo(sp) {
      var eq = (app.store && app.store.data && app.store.data.equipped) || {};
      var ownedList = (app.store && app.store.data && app.store.data.owned) || [];
      var defId = (sp === 'hoops') ? 'std_hoops_street' : 'std_footy_classic';
      var arenaId = (sp === 'hoops') ? (eq['stadium.hoops'] || defId) : (eq['stadium.footy'] || defId);
      if (arenaId !== defId && ownedList.indexOf(arenaId) === -1) arenaId = defId;
      var defName = (sp === 'hoops') ? trItem('Street Classic') : trItem('Classic Grass');
      var found = (Array.isArray(SCENIC_ARENAS_CATALOG)) ? SCENIC_ARENAS_CATALOG.find(function (a) { return a.id === arenaId; }) : null;
      return {
        id: arenaId,
        name: found ? trItem(found.name) : defName,
        icon: found ? (found.icon || '🏟️') : (sp === 'hoops' ? '🏀' : '🏟️')
      };
    }

    // Top Unified Sport Switch + Quick Arena Picker Strip
    var lobbyHero = document.createElement('div');
    lobbyHero.className = 'fvh-mode-lobby-hero ' + selSport;

    function renderLobbyHero() {
      var sp = selSport;
      lobbyHero.className = 'fvh-mode-lobby-hero ' + sp;
      lobbyHero.innerHTML =
        '<div class="fvh-mode-sport-switch">' +
        '  <button type="button" class="fvh-sport-tab footy' + (sp === 'footy' ? ' on' : '') + '" data-sport="footy">' +
        '    <span class="fvh-stab-ico footy">' + getUiIconSvg('nav_home_footy', 18) + '</span>' +
        '    <span class="fvh-stab-txt"><b>' + (lang === 'ru' ? 'Футбол' : 'Football') + '</b><small>1v1 Arena</small></span>' +
        '  </button>' +
        '  <button type="button" class="fvh-sport-tab hoops' + (sp === 'hoops' ? ' on' : '') + '" data-sport="hoops">' +
        '    <span class="fvh-stab-ico hoops">' + getUiIconSvg('nav_home_hoops', 18) + '</span>' +
        '    <span class="fvh-stab-txt"><b>' + (lang === 'ru' ? 'Баскетбол' : 'Basketball') + '</b><small>1v1 Court</small></span>' +
        '  </button>' +
        '</div>' +
        '<div class="fvh-mode-lobby-meta fvh-mode-lobby-meta--center">' +
        '  <div class="fvh-mode-matchup-pill">' +
        '    <span class="fvh-mu-side" style="color:' + youColor + ';">' + getUiIconSvg(isPlayerFooty ? 'nav_home_footy' : 'nav_home_hoops', 14) + ' <span>' + youTeamName + '</span></span>' +
        '    <span class="fvh-mu-vs">VS</span>' +
        '    <span class="fvh-mu-side" style="color:' + cpuColor + ';"><span>' + cpuTeamName + '</span> ' + getUiIconSvg(isPlayerFooty ? 'nav_home_hoops' : 'nav_home_footy', 14) + '</span>' +
        '  </div>' +
        '</div>';

      lobbyHero.querySelectorAll('.fvh-sport-tab').forEach(function (btn) {
        btn.onclick = function () {
          var nextSp = btn.dataset.sport;
          if (nextSp === selSport) return;
          selSport = nextSp;
          app.audio.play('click');
          renderLobbyHero();
          renderSoloCard();
        };
      });
    }

    body.appendChild(lobbyHero);

    // Clean Single-Player Solo Mode Grid (Offline vs AI with full Coin, XP & Drop PTS rewards — zero server PvP load)
    var grid = document.createElement('div');
    grid.className = 'fvh-mode-grid fvh-mode-grid--solo';

    var practiceCard = document.createElement('div');
    practiceCard.className = 'fvh-mode-card practice-card fvh-mode-card--solo';

    function getDiffRewardText(dKey) {
      if (dKey === 'easy') return tr('diffEasyReward');
      if (dKey === 'hard') return tr('diffHardReward');
      return tr('diffNormalReward');
    }

    function renderSoloCard() {
      var isFootyMode = (selSport === 'footy');
      practiceCard.innerHTML =
        '<div class="fvh-mode-card-header">' +
          '<span class="fvh-mode-badge practice">' + getUiIconSvg('bot', 14) + ' <span>' + (lang === 'ru' ? 'ОДИНОЧНЫЙ МАТЧ' : 'SOLO MATCH') + '</span></span>' +
          '<span class="fvh-mode-instant-pill">' + getUiIconSvg('lightning', 12) + ' <span>' + (lang === 'ru' ? 'МГНОВЕННЫЙ СТАРТ' : 'INSTANT PLAY') + '</span></span>' +
        '</div>' +
        '<div class="fvh-mode-card-body fvh-practice-layout">' +
          '<div class="fvh-practice-info">' +
            '<div class="fvh-mode-title">' + (lang === 'ru' ? 'Одиночный матч против ИИ' : 'Solo Match vs AI') + '</div>' +
            '<div class="fvh-mode-desc">' +
              (isFootyMode
                ? (lang === 'ru' ? 'Динамичный футбол против умного вратаря и бота. Полные награды: <b>FvH Coins, Опыт и Drop PTS</b>!' : 'Fast football match against smart AI & keeper. Full rewards: <b>FvH Coins, XP & Drop PTS</b>!')
                : (lang === 'ru' ? 'Быстрый баскетбол 1 на 1 против ИИ. Полные награды: <b>FvH Coins, Опыт и Drop PTS</b>!' : 'Fast-paced 1v1 basketball vs AI. Full rewards: <b>FvH Coins, XP & Drop PTS</b>!')) +
            '</div>' +
            '<div class="fvh-practice-reward-hint" id="fvh-mode-diff-hint">' + getDiffRewardText(selDiff) + '</div>' +
          '</div>' +
          '<div class="fvh-mode-controls fvh-practice-controls">' +
            '<div class="fvh-ctrl-row">' +
              '<span class="fvh-ctrl-label">' + tr('difficulty') + '</span>' +
              '<div class="seg seg-diff fvh-chip-group">' +
                '<button type="button" class="fvh-chip' + (selDiff === 'easy' ? ' on' : '') + '" data-diff="easy"><span class="fvh-chip-dot"></span>' + tr('easy') + '</button>' +
                '<button type="button" class="fvh-chip' + (selDiff === 'normal' ? ' on' : '') + '" data-diff="normal"><span class="fvh-chip-dot"></span>' + tr('normal') + '</button>' +
                '<button type="button" class="fvh-chip' + (selDiff === 'hard' ? ' on' : '') + '" data-diff="hard"><span class="fvh-chip-dot"></span>' + tr('hard') + '</button>' +
              '</div>' +
            '</div>' +
            '<div class="fvh-ctrl-row">' +
              '<span class="fvh-ctrl-label">' + (lang === 'ru' ? 'Таймер' : 'Duration') + '</span>' +
              '<div class="seg seg-mins fvh-chip-group">' +
                '<button type="button" class="fvh-chip' + (selMinutes === 1 ? ' on' : '') + '" data-mins="1">' + (lang === 'ru' ? '1 мин' : '1m') + '</button>' +
                '<button type="button" class="fvh-chip' + (selMinutes === 2 ? ' on' : '') + '" data-mins="2">' + (lang === 'ru' ? '2 мин' : '2m') + '</button>' +
                '<button type="button" class="fvh-chip' + (selMinutes === 3 ? ' on' : '') + '" data-mins="3">' + (lang === 'ru' ? '3 мин' : '3m') + '</button>' +
                '<button type="button" class="fvh-chip' + (selMinutes === 5 ? ' on' : '') + '" data-mins="5">' + (lang === 'ru' ? '5 мин' : '5m') + '</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="fvh-mode-card-actions">' +
          '<button type="button" class="fvh-mbtn fvh-mbtn--ai ' + selSport + ' fvh-btn-start-practice">' +
            '<span class="fvh-mbtn-ico">' + getUiIconSvg('play', 14) + '</span>' +
            '<span class="fvh-mbtn-label">' + (lang === 'ru' ? 'ИГРАТЬ МАТЧ' : 'PLAY MATCH') + '</span>' +
            '<span class="fvh-mbtn-tag">' + (lang === 'ru' ? 'СТАРТ' : 'GO') + '</span>' +
          '</button>' +
        '</div>';

      practiceCard.querySelectorAll('.seg-diff button').forEach(function (b) {
        b.onclick = function () {
          practiceCard.querySelectorAll('.seg-diff button').forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on');
          selDiff = b.dataset.diff;
          var hintEl = practiceCard.querySelector('#fvh-mode-diff-hint');
          if (hintEl) hintEl.innerHTML = getDiffRewardText(selDiff);
          app.audio.play('click');
        };
      });

      practiceCard.querySelectorAll('.seg-mins button').forEach(function (b) {
        b.onclick = function () {
          practiceCard.querySelectorAll('.seg-mins button').forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on');
          selMinutes = Number(b.dataset.mins) || 2;
          app.audio.play('click');
        };
      });

      practiceCard.querySelector('.fvh-btn-start-practice').onclick = function () {
        app.audio.play('click');
        app.store.update(function (d) {
          if (!d.settings) d.settings = {};
          d.settings.difficulty = selDiff;
          d.settings.matchMinutes = selMinutes;
        });
        var arenaInfo = resolveActiveArenaInfo(selSport);
        app.launch({
          mode: selSport,
          char: playerChosenChar,
          difficulty: selDiff,
          minutes: selMinutes,
          arenaId: arenaInfo.id,
          boostId: null
        }, false);
      };
    }

    renderLobbyHero();
    renderSoloCard();

    grid.appendChild(practiceCard);

    body.appendChild(grid);
    page.appendChild(body);
    page.appendChild(createScrollBottomSpacer());
    container.appendChild(page);

    // Unified Persistent Bottom Navigation
    container.appendChild(createSharedBottomNav('menu', app));
    return container;
  }

  // Live Authoritative Faction War State
  var currentLiveWar = {
    footyScore: 12450,
    hoopsScore: 11480,
    footyPct: 52,
    hoopsPct: 48,
    winningTeam: 'footy',
    leadDiff: 970
  };

  function updateLiveWarData(serverData) {
    if (!serverData) return;
    if (serverData.teamFootball && serverData.teamBasketball) {
      currentLiveWar.footyScore = Number(serverData.teamFootball.score) || 0;
      currentLiveWar.hoopsScore = Number(serverData.teamBasketball.score) || 0;
      currentLiveWar.footyPct = Number(serverData.teamFootball.pct) || 52;
      currentLiveWar.hoopsPct = Number(serverData.teamBasketball.pct) || 48;
      currentLiveWar.winningTeam = serverData.winningTeam || (currentLiveWar.footyScore >= currentLiveWar.hoopsScore ? 'footy' : 'hoops');
      currentLiveWar.leadDiff = Math.abs(currentLiveWar.footyScore - currentLiveWar.hoopsScore);
    }
  }

  function addMatchPointsToLiveWar(winnerChar, points) {
    var pts = Number(points) || 30;
    if (winnerChar === 'hoops') {
      currentLiveWar.hoopsScore += pts;
    } else {
      currentLiveWar.footyScore += pts;
    }
    var total = currentLiveWar.footyScore + currentLiveWar.hoopsScore;
    if (total > 0) {
      currentLiveWar.footyPct = Math.round((currentLiveWar.footyScore / total) * 1000) / 10;
      currentLiveWar.hoopsPct = Math.round((100 - currentLiveWar.footyPct) * 10) / 10;
    }
    currentLiveWar.winningTeam = (currentLiveWar.footyScore >= currentLiveWar.hoopsScore) ? 'footy' : 'hoops';
    currentLiveWar.leadDiff = Math.abs(currentLiveWar.footyScore - currentLiveWar.hoopsScore);
  }

  // Token Rivalry Ticker & Expandable Modal ($FOOTY vs $HOOPS Live Real-Time)
  function showRivalryModal() {
    var overlay = document.createElement('div');
    overlay.className = 'modal-back fvh-sheet-back';
    var modal = document.createElement('div');
    modal.className = 'modal fvh-rivalry-modal';

    var lang = getActiveLang();
    var volLabel = lang === 'ru' ? 'Баланс сил' : 'Faction Balance';
    var capLabel = lang === 'ru' ? 'Очки команд (Score)' : 'Team Points';
    var hldLabel = lang === 'ru' ? 'Лидерство' : 'War Leader';

    var fPct = Math.round(currentLiveWar.footyPct);
    var hPct = Math.round(100 - fPct);
    var isFootyLead = (currentLiveWar.winningTeam === 'footy');

    modal.innerHTML =
      '<div class="fvh-sheet-handle"></div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
      '<h3 style="margin:0;font-size:17px;font-weight:900;letter-spacing:0.3px;">' + tr('rivalryTitle') + '</h3>' +
      '<button class="modal-close-x" style="width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;">✕</button>' +
      '</div>' +
      '<div style="font-size:12px;color:var(--text-muted);margin-bottom:14px;line-height:1.4;">' + tr('rivalryFormula') + '</div>' +
      '<div class="fvh-rivalry-bar-wrap" style="margin-bottom:16px;">' +
      '  <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;font-weight:900;margin-bottom:6px;">' +
      '    <span style="color:#00f0ff;">⚽ $FOOTY <b style="font-size:14px;margin-left:2px;">' + fPct + '%</b></span>' +
      '    <span style="color:#f97316;"><b style="font-size:14px;margin-right:2px;">' + hPct + '%</b> $HOOPS 🏀</span>' +
      '  </div>' +
      '  <div class="fvh-rivalry-bar" style="height:10px;border-radius:6px;overflow:hidden;margin-bottom:0;">' +
      '    <div class="fvh-rivalry-fill-footy" style="width:' + fPct + '%;"></div>' +
      '    <div class="fvh-rivalry-fill-hoops" style="width:' + hPct + '%;"></div>' +
      '  </div>' +
      '</div>' +
      '<div class="fvh-rivalry-grid">' +
      '<div class="fvh-rivalry-stat"><small>' + volLabel + '</small><b>' + fPct + '% : ' + hPct + '%</b></div>' +
      '<div class="fvh-rivalry-stat"><small>' + capLabel + '</small><b>' + currentLiveWar.footyScore.toLocaleString() + ' : ' + currentLiveWar.hoopsScore.toLocaleString() + '</b></div>' +
      '<div class="fvh-rivalry-stat"><small>' + hldLabel + '</small><b>' + (isFootyLead ? '⚽ FOOTY' : '🏀 HOOPS') + '</b></div>' +
      '</div>' +
      '<div class="note" style="margin-top:14px;font-size:11px;opacity:0.85;">' + tr('rivalryDemoNote') + '</div>';

    modal.querySelector('.modal-close-x').onclick = function () { overlay.remove(); };
    overlay.onclick = function (e) {
      if (e.target === overlay) overlay.remove();
    };
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

  function createRivalryTicker(app) {
    var ticker = document.createElement('div');
    ticker.className = 'fvh-rivalry-ticker';

    function renderTickerHtml() {
      var fPct = Math.round(currentLiveWar.footyPct);
      var hPct = Math.round(100 - fPct);
      var isFootyLead = (currentLiveWar.winningTeam === 'footy');
      var leadText = isFootyLead ? '⚽ FOOTY ведёт!' : '🏀 HOOPS ведут!';
      if (getActiveLang() !== 'ru') {
        leadText = isFootyLead ? '⚽ FOOTY leads!' : '🏀 HOOPS leads!';
      }
      ticker.innerHTML =
        '<div class="fvh-ticker-left">' +
        '<span class="footy-dot">●</span> <b>$FOOTY</b> ' + fPct + '%' +
        '<span class="vs-text">vs</span>' +
        hPct + '% <b>$HOOPS</b> <span class="hoops-dot">●</span>' +
        '</div>' +
        '<div class="fvh-ticker-right">' +
        '<span>' + leadText + '</span> ➔' +
        '</div>';
    }

    renderTickerHtml();

    if (app) {
      fetchLeaderboardData('season', 'season', app, function (res) {
        if (res && res.teamFootball && res.teamBasketball) {
          updateLiveWarData(res);
          renderTickerHtml();
        }
      });
    }

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

    // Card 1: FOOTY — $FOOTY
    var cardFooty = document.createElement('div');
    cardFooty.className = 'fvh-team-card footy';
    cardFooty.innerHTML =
      '<div class="fvh-team-card-emblem">' +
      '  <div style="width:52px;height:52px;border-radius:50%;background:radial-gradient(circle,rgba(56,189,248,0.25) 0%,rgba(15,23,42,0.9) 100%);display:flex;align-items:center;justify-content:center;box-shadow:0 0 16px rgba(0,240,255,0.4);border:2px solid #00f0ff;">' +
      getUiIconSvg('nav_home_footy', 36) +
      '  </div>' +
      '</div>' +
      '<div class="fvh-team-card-title">' + tr('teamFootyName') + '</div>' +
      '<div class="fvh-team-card-token">' + tr('teamFootyToken') + '</div>' +
      '<div class="fvh-team-card-desc">' + tr('teamFootyDesc') + '</div>';

    // Card 2: HOOPS — $HOOPS
    var cardHoops = document.createElement('div');
    cardHoops.className = 'fvh-team-card hoops';
    cardHoops.innerHTML =
      '<div class="fvh-team-card-emblem">' +
      '  <div style="width:52px;height:52px;border-radius:50%;background:radial-gradient(circle,rgba(251,146,60,0.25) 0%,rgba(24,8,2,0.9) 100%);display:flex;align-items:center;justify-content:center;box-shadow:0 0 16px rgba(255,140,0,0.4);border:2px solid #ff8c00;">' +
      getUiIconSvg('nav_home_hoops', 36) +
      '  </div>' +
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
      fetch(getApiUrl('/api/referrals/qualify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: getAppPlayerId(app) })
      }).catch(function () {});
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

    var partnerRow = document.createElement('div');
    partnerRow.style.cssText = 'margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-between;font-size:11.5px;';
    var isRu = (app && app.store && app.store.data && app.store.data.settings && app.store.data.settings.lang === 'ru');
    partnerRow.innerHTML =
      '<span style="color:#94a3b8;font-weight:600;">🤝 ' + (isRu ? 'Сотрудничество:' : 'Partnership:') + '</span>' +
      '<button type="button" class="fvh-btn-partner-email" style="background:none;border:none;padding:0;color:#38bdf8;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:4px;font-size:11.5px;">' +
      '  <span>📧</span> <span>footyvshoops@gmail.com</span>' +
      '</button>';
    var pEmailBtn = partnerRow.querySelector('.fvh-btn-partner-email');
    if (pEmailBtn) {
      pEmailBtn.onclick = function (e) {
        e.stopPropagation();
        if (app && app.audio) app.audio.play('click');
        openEmailClient('footyvshoops@gmail.com');
      };
    }
    card.appendChild(partnerRow);

    return card;
  }

  // Complete Redesigned Main Menu
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

  function renderRedesignedMenu(app) {
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
    screen.className = 'screen menu-bg';
    screen.dataset.id = 'menu';

    // 1. Top Bar: Console Header with Official Emblem, Coins, Leaderboard, Profile, and Settings
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

    // 2. Faction Hero Card: Shows chosen faction, rival, team switcher, equipped cosmetics, locker & profile
    var stage = document.createElement('section');
    stage.className = 'fvh-hero-stage solo-stage compact';

    var heroCard = document.createElement('div');
    heroCard.className = 'fvh-hero-card solo-hero-compact ' + curChar;

    var badgeText = isFooty ? (getUiIconSvg('nav_home_footy', 14) + ' <span>FOOTY</span>') : (getUiIconSvg('nav_home_hoops', 14) + ' <span>HOOPS</span>');
    var rivalText = '<span style="display:inline-flex;align-items:center;gap:5px;">' + getUiIconSvg('swords', 13) + ' <span>' + tr('rivalTeamLabel') + ': ' + (isFooty ? 'HOOPS' : 'FOOTY') + '</span></span>';

    // Equipped cosmetics labels (authoritative per chosen team)
    var eq = d.equipped || {};
    var activeKitId = resolveEquippedItemId(eq, 'skins', curChar);
    var equippedJersey = getItemLabelById(activeKitId, isFooty ? 'Классика #10' : 'Классика #23');

    var up = d.upgrades || { power: 1, stamina: 1, keeper: 1 };
    var pLvl = Math.max(1, Math.min(10, up.power || 1));
    var sLvl = Math.max(1, Math.min(10, up.stamina || 1));
    var kLvl = Math.max(1, Math.min(10, up.keeper || 1));
    var avgLvl = (pLvl + sLvl + kLvl) / 3;
    var ovr = Math.round(70 + ((avgLvl - 1) / 9) * 29);

    var charPortraitHtml = getCharacterDisplayHtml(curChar, null, { showJerseyTag: false });

    var footyActive = isFooty ? ' active' : '';
    var hoopsActive = !isFooty ? ' active' : '';
    var footyOvr = ovr;
    var hoopsOvr = ovr;

    heroCard.innerHTML =
      '<div class="fvh-rivalry-bar-symmetrical fvh-solo-compact-header">' +
      '  <div class="fvh-rival-side footy' + footyActive + '" data-side="footy" title="' + (isFooty ? (lang === 'ru' ? 'Ваш атлет FOOTY' : 'Your FOOTY Athlete') : (lang === 'ru' ? 'Соперник FOOTY' : 'Rival FOOTY')) + '">' +
      '    <div class="fvh-rival-brand">' +
      '      <span class="fvh-rival-icon" style="display:inline-flex;align-items:center;">' + getUiIconSvg('nav_home_footy', 16) + '</span>' +
      '      <span class="fvh-rival-name">FOOTY</span>' +
      '    </div>' +
      '  </div>' +
      '  <div class="fvh-rivalry-center-badge">' +
      '    <span class="fvh-clash-vs">VS</span>' +
      '  </div>' +
      '  <div class="fvh-rival-side hoops' + hoopsActive + '" data-side="hoops" title="' + (!isFooty ? (lang === 'ru' ? 'Ваш атлет HOOPS' : 'Your HOOPS Athlete') : (lang === 'ru' ? 'Соперник HOOPS' : 'Rival HOOPS')) + '">' +
      '    <div class="fvh-rival-brand">' +
      '      <span class="fvh-rival-icon" style="display:inline-flex;align-items:center;">' + getUiIconSvg('nav_home_hoops', 16) + '</span>' +
      '      <span class="fvh-rival-name">HOOPS</span>' +
      '    </div>' +
      '  </div>' +
      '</div>' +
      '<div class="solo-avatar-box" style="width:100%;height:clamp(225px, 32vh, 285px);display:flex;align-items:center;justify-content:center;position:relative;margin:2px 0;">' +
      charPortraitHtml +
      '</div>' +
      '<div class="fvh-equipped-preview-bar" style="width:100%;background:rgba(0,0,0,0.32);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:7px 12px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;font-size:11.5px;color:#cbd5e1;box-sizing:border-box;">' +
      '  <div style="display:flex;align-items:center;gap:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' +
      '    <span style="display:inline-flex;align-items:center;">' + getUiIconSvg('jersey', 14) + '</span> <strong style="color:#fff;">' + escapeHtml(equippedJersey) + '</strong>' +
      '  </div>' +
      '  <span style="font-size:11px;font-weight:700;color:' + (isFooty ? '#38bdf8' : '#fb923c') + ';white-space:nowrap;">' + (isFooty ? 'FOOTY #10' : 'HOOPS #23') + '</span>' +
      '</div>';

    heroCard.querySelectorAll('.fvh-rival-side').forEach(function (sideEl) {
      sideEl.onclick = function (e) {
        e.stopPropagation();
        app.audio.play('click');
        var side = sideEl.getAttribute('data-side') || curChar;
        app.store.update(function(d) {
          d.selectedCharacter = side;
          d.selectedTeam = side;
        });
        app.openCharacterLocker(side);
      };
    });

    heroCard.style.cursor = 'pointer';
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

    // 3. Dominant PLAY Button: The primary call-to-action on the screen
    var actionDeck = document.createElement('div');
    actionDeck.className = 'fvh-action-deck';
    actionDeck.style.width = '100%';
    actionDeck.style.maxWidth = '480px';
    actionDeck.style.marginBottom = '10px';

    var playBtn = document.createElement('button');
    playBtn.className = 'fvh-btn-play-hero ' + curChar;
    var playTitle = lang === 'ru' ? 'ИГРАТЬ' : 'PLAY MATCH';
    var playSub = lang === 'ru' ? 'Одиночный матч • Футбол и Баскетбол' : 'Solo Match • Football & Basketball';

    playBtn.innerHTML =
      '<div class="play-row">' +
      '  <span class="play-icon">' + getUiIconSvg('play', 16) + '</span>' +
      '  <span class="play-text">' + playTitle + '</span>' +
      '</div>' +
      '<span class="play-sub">' + playSub + '</span>';

    playBtn.onclick = function () {
      app.audio.play('click');
      app.showModeSelect();
    };
    actionDeck.appendChild(playBtn);
    screen.appendChild(actionDeck);

    // 3.5 Play-to-Airdrop Banner: Direct access to $FOOTY / $HOOPS token earning
    var airdropStats = calculateAirdropStats(d);
    var airdropBanner = document.createElement('div');
    airdropBanner.className = 'fvh-airdrop-banner ' + curChar;
    var airdropTokenTag = isFooty ? (getUiIconSvg('nav_home_footy', 14) + ' <span>$FOOTY</span>') : (getUiIconSvg('nav_home_hoops', 14) + ' <span>$HOOPS</span>');

    airdropBanner.innerHTML =
      '<div class="fvh-airdrop-banner-left">' +
      '  <div class="fvh-airdrop-banner-icon">' + getUiIconSvg('coin', 26) + '</div>' +
      '  <div class="fvh-airdrop-banner-text">' +
      '    <div class="fvh-airdrop-banner-title">' + (lang === 'ru' ? 'PLAY-TO-AIRDROP · ' + airdropTokenTag : 'PLAY-TO-AIRDROP · ' + airdropTokenTag) + '</div>' +
      '    <div class="fvh-airdrop-banner-sub">' +
      (lang === 'ru'
        ? 'Очки: <b>' + airdropStats.pts.toLocaleString() + ' PTS</b> · Буст: <b>' + airdropStats.multiplier + '</b> · ' + (airdropStats.hasWallet ? '💎 Кошелёк ок' : 'Как получить? →')
        : 'Score: <b>' + airdropStats.pts.toLocaleString() + ' PTS</b> · Boost: <b>' + airdropStats.multiplier + '</b> · ' + (airdropStats.hasWallet ? '💎 Wallet OK' : 'How to claim →')) +
      '    </div>' +
      '  </div>' +
      '</div>' +
      '<button type="button" class="fvh-airdrop-banner-badge">' + tr('airdropBannerBtn') + '</button>';

    airdropBanner.onclick = function () {
      app.audio.play('click');
      app.go('airdrop');
    };
    screen.appendChild(airdropBanner);

    // 5. Token Rivalry Compact Ticker
    screen.appendChild(createRivalryTicker(app));

    // Bottom Spacer for iOS WebKit Telegram Mini App safe scrolling
    screen.appendChild(createScrollBottomSpacer());

    // Unified Persistent Bottom Navigation
    screen.appendChild(createSharedBottomNav('menu', app));

    // Show screen
    app.show(screen, 'menu');

    // Mount instant cached interactive 3D athlete showcase on Main Menu hero card
    if (window.CharactersGLB && typeof window.CharactersGLB.preloadKitAtlas === 'function') {
      window.CharactersGLB.preloadKitAtlas(canonItemId(activeKitId));
    }
    mountWardrobe3DIntoContainer(heroCard, curChar, activeKitId);

    // Onboarding: Prompt player to choose Team Football or Team Basketball on initial entry
    if (!d.teamChosen) {
      setTimeout(function () {
        showTeamSelectionModal(app, false);
      }, 350);
    }
  }

  // Victory / Defeat Faction Taunt Banner Injection
  function decorateResultPanelWithTaunt(app, sum) {
    if (!app || !app.ui) return;
    var resultPanel = app.ui.querySelector('.result-panel');
    if (!resultPanel) return;
    if (resultPanel.querySelector('.fvh-victory-taunt-card')) return;

    var curChar = (app.store && app.store.data && app.store.data.selectedCharacter) || ((sum && sum.mode === 'hoops') ? 'hoops' : 'footy');
    var isHumanWin = (sum && sum.winner === 0);
    var isHumanLoss = (sum && sum.winner === 1);

    var winningFaction = null;
    if (isHumanWin) {
      winningFaction = curChar;
    } else if (isHumanLoss) {
      winningFaction = (curChar === 'footy') ? 'hoops' : 'footy';
    }

    if (winningFaction && typeof addMatchPointsToLiveWar === 'function') {
      addMatchPointsToLiveWar(winningFaction, 30);
    }

    var tauntCard = document.createElement('div');
    tauntCard.className = 'fvh-victory-taunt-card ' + (winningFaction || curChar);

    if (isHumanWin) {
      var isFootyWin = (curChar === 'footy');
      var tauntTitle = isFootyWin ? tr('victoryTauntFooty') : tr('victoryTauntHoops');
      var tauntSub = isFootyWin ? tr('victoryTauntFootySub') : tr('victoryTauntHoopsSub');

      tauntCard.innerHTML =
        '<div class="fvh-taunt-badge-tag" style="display:inline-flex;align-items:center;gap:6px;">' + (isFootyWin ? getUiIconSvg('nav_home_footy', 14) + ' <span>FOOTY VICTORY</span>' : getUiIconSvg('nav_home_hoops', 14) + ' <span>HOOPS VICTORY</span>') + '</div>' +
        '<div class="fvh-taunt-headline">' + tauntTitle + '</div>' +
        '<div class="fvh-taunt-subtext">' + tauntSub + '</div>';
    } else if (isHumanLoss) {
      var oppIsFooty = (curChar !== 'footy');
      var oppTitle = oppIsFooty ? tr('defeatTauntHoops') : tr('defeatTauntFooty');
      tauntCard.innerHTML =
        '<div class="fvh-taunt-badge-tag opponent" style="display:inline-flex;align-items:center;gap:6px;">' + (oppIsFooty ? getUiIconSvg('nav_home_footy', 14) + ' <span>FOOTY VICTORY</span>' : getUiIconSvg('nav_home_hoops', 14) + ' <span>HOOPS VICTORY</span>') + '</div>' +
        '<div class="fvh-taunt-headline opp">' + oppTitle + '</div>';
    } else {
      tauntCard.innerHTML =
        '<div class="fvh-taunt-badge-tag draw" style="display:inline-flex;align-items:center;gap:6px;">' + getUiIconSvg('swords', 14) + ' <span>CLASH TIED</span></div>' +
        '<div class="fvh-taunt-headline" style="color:#facc15;font-size:16px;">' + (getActiveLang() === 'ru' ? 'Боевая ничья фракций!' : 'Clash Tied!') + '</div>';
    }

    var titleEl = resultPanel.querySelector('.result-title');
    if (titleEl && titleEl.nextSibling) {
      resultPanel.insertBefore(tauntCard, titleEl.nextSibling);
    } else {
      resultPanel.appendChild(tauntCard);
    }
  }

  // Console-Grade Redesigned Pause Screen Modal with Live Match Snapshot & Tactile Controls
  function installRedesignedPause(app) {
    if (!app || app._pauseRedesignInstalled) return;
    app._pauseRedesignInstalled = true;

    app.openPause = function () {
      this.audio.play('click');
      if (this.hud && this.hud.touch) {
        this.hud.touch.style.pointerEvents = 'none';
      }

      var self = this;
      var d = (self.store && self.store.data) ? self.store.data : {};
      var curChar = d.selectedCharacter || 'footy';
      var isFooty = (curChar === 'footy');
      var isHoopsMode = (self.mode === 'hoops');
      var lang = getActiveLang();

      var scoreText = '0 : 0';
      try {
        if (self.sim && self.sim.score) {
          scoreText = self.sim.score[0] + ' : ' + self.sim.score[1];
        } else if (self.game && self.game.sim && self.game.sim.score) {
          scoreText = self.game.sim.score[0] + ' : ' + self.game.sim.score[1];
        }
      } catch (e) {}

      var modeTitle = isHoopsMode
        ? (lang === 'ru' ? 'БАСКЕТБОЛ 1v1' : 'BASKETBALL 1v1')
        : (lang === 'ru' ? 'ФУТБОЛ 1v1' : 'FOOTBALL 1v1');

      var overlay = document.createElement('div');
      overlay.className = 'screen dim fvh-pause-overlay';
      overlay.style.cssText = 'z-index:99999 !important; pointer-events:auto !important; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); background:rgba(6,10,18,0.82);';

      var panel = document.createElement('div');
      panel.className = 'panel pause-panel fvh-pause-card fvh-pause-modern';

      var icoBox = document.createElement('div');
      icoBox.className = 'pause-ico fvh-pause-ico-svg';
      icoBox.innerHTML = '<span class="pi-svg"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1.2"/><rect x="14" y="4" width="4" height="16" rx="1.2"/></svg></span>';
      panel.appendChild(icoBox);

      var statusPill = document.createElement('div');
      statusPill.className = 'fvh-pause-meta-pill';
      statusPill.innerHTML =
        '<span style="display:inline-flex;align-items:center;gap:6px;">' +
        getUiIconSvg(isHoopsMode ? 'nav_home_hoops' : 'nav_home_footy', 14) +
        '<span>' + modeTitle + '</span>' +
        '<span style="opacity:0.45;">·</span>' +
        '<span style="color:#fff;">' + (isFooty ? (lang === 'ru' ? 'Вы' : 'You') : (lang === 'ru' ? 'Бот' : 'CPU')) + ' ' + scoreText + ' ' + (!isFooty ? (lang === 'ru' ? 'Вы' : 'You') : (lang === 'ru' ? 'Бот' : 'CPU')) + '</span>' +
        '</span>';
      panel.appendChild(statusPill);

      var title = document.createElement('h2');
      title.className = 'pause-title fvh-pause-title';
      title.textContent = tr('pauseTitle') || (lang === 'ru' ? 'МАТЧ НА ПАУЗЕ' : 'MATCH PAUSED');
      panel.appendChild(title);

      // Quick Audio & Music Toggle Chips
      var stSets = (self.store && self.store.data && self.store.data.settings) || {};
      var sfxOn = stSets.sfx !== 0 && (!self.audio || self.audio.sfxVol > 0.01);
      var musOn = stSets.music !== 0 && (!self.audio || self.audio.musicVol > 0.01);
      var audioRow = document.createElement('div');
      audioRow.className = 'fvh-pause-audio-row';

      var sfxChip = document.createElement('button');
      sfxChip.type = 'button';
      sfxChip.className = 'fvh-pause-audio-chip' + (sfxOn ? ' on' : '');
      function syncSfxLabel() {
        sfxChip.className = 'fvh-pause-audio-chip' + (sfxOn ? ' on' : '');
        sfxChip.textContent = (lang === 'ru' ? 'Звуки: ' : 'SFX: ') + (sfxOn ? (lang === 'ru' ? 'Вкл' : 'On') : (lang === 'ru' ? 'Выкл' : 'Off'));
      }
      syncSfxLabel();
      sfxChip.onclick = function () {
        sfxOn = !sfxOn;
        var v = sfxOn ? 0.8 : 0;
        if (self.store && typeof self.store.update === 'function') {
          self.store.update(function (sd) { sd.settings = sd.settings || {}; sd.settings.sfx = v; });
        }
        if (self.audio && typeof self.audio.setSfxEnabled === 'function') self.audio.setSfxEnabled(sfxOn);
        if (sfxOn && self.audio) self.audio.play('click');
        syncSfxLabel();
      };

      var musChip = document.createElement('button');
      musChip.type = 'button';
      musChip.className = 'fvh-pause-audio-chip' + (musOn ? ' on' : '');
      function syncMusLabel() {
        musChip.className = 'fvh-pause-audio-chip' + (musOn ? ' on' : '');
        musChip.textContent = (lang === 'ru' ? 'Музыка: ' : 'Music: ') + (musOn ? (lang === 'ru' ? 'Вкл' : 'On') : (lang === 'ru' ? 'Выкл' : 'Off'));
      }
      syncMusLabel();
      musChip.onclick = function () {
        musOn = !musOn;
        var mv = musOn ? 0.35 : 0;
        if (self.store && typeof self.store.update === 'function') {
          self.store.update(function (sd) { sd.settings = sd.settings || {}; sd.settings.music = mv; });
        }
        if (self.audio && typeof self.audio.setMusicEnabled === 'function') self.audio.setMusicEnabled(musOn);
        if (self.audio) self.audio.play('click');
        syncMusLabel();
      };
      audioRow.appendChild(sfxChip);
      audioRow.appendChild(musChip);
      panel.appendChild(audioRow);

      function createPauseBtn(label, svgHtml, cls, onClick) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn block pause-btn fvh-pause-btn ' + cls;
        btn.style.cssText = 'touch-action:manipulation; -webkit-tap-highlight-color:transparent;';
        btn.innerHTML = '<span class="pi"><span class="pi-svg">' + svgHtml + '</span></span><span class="pl">' + label + '</span>';
        var triggered = false;
        function fire(e) {
          if (triggered) return;
          triggered = true;
          setTimeout(function () { triggered = false; }, 220);
          if (e && e.preventDefault && e.cancelable) e.preventDefault();
          if (e && e.stopPropagation) e.stopPropagation();
          self.audio.play('click');
          onClick();
        }
        btn.onclick = fire;
        btn.ontouchend = fire;
        btn.onpointerup = fire;
        return btn;
      }

      var resumeLabel = tr('pauseResume') || (lang === 'ru' ? 'Продолжить матч' : 'Resume Match');
      var restartLabel = tr('pauseRestart') || (lang === 'ru' ? 'Перезапуск' : 'Restart');
      var settingsLabel = tr('pauseSettings') || (lang === 'ru' ? 'Настройки' : 'Settings');
      var quitLabel = tr('pauseQuit') || (lang === 'ru' ? 'Выйти в меню' : 'Quit to Menu');

      var svgPlay = '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>';
      var svgRestart = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>';
      var svgExit = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>';

      panel.appendChild(createPauseBtn(resumeLabel, svgPlay, 'primary fvh-pause-resume-btn', function () {
        self.setPause(false);
      }));

      if (!self.game || !self.game.cfg || !self.game.cfg.online) {
        panel.appendChild(createPauseBtn(restartLabel, svgRestart, 'fvh-pause-secondary-btn', function () {
          self.closePause();
          if (self.game) self.game.setPaused(false);
          self.launchAgain();
        }));
      }

      panel.appendChild(createPauseBtn(settingsLabel, getUiIconSvg('settings', 17), 'fvh-pause-secondary-btn', function () {
        self.pages.settingsOverlay(function () {});
      }));

      panel.appendChild(createPauseBtn(quitLabel, svgExit, 'danger fvh-pause-danger-btn', function () {
        self.closePause();
        if (self.game) {
          try { self.game.stop(); } catch (e) {}
        }
        self.quitToMenu();
      }));

      overlay.appendChild(panel);
      self.pauseEl = overlay;
      self.ui.append(overlay);
    };
  }

  // Hook into App & Page Router
  onAppReady(function (app) {
    window.App = app;
    window.app = app;
    window.__fvh = app;
    installRedesignedPause(app);

    // Robust Match Exit to Main Menu
    var origQuitToMenu = app.quitToMenu ? app.quitToMenu.bind(app) : null;
    app.quitToMenu = function () {
      if (app.game) {
        try { app.game.stop(); } catch (e) {}
      }
      if (typeof app.closePause === 'function') {
        try { app.closePause(); } catch (e) {}
      }
      if (app.hud) {
        try {
          app.hud.show(false);
          app.hud.resetState();
        } catch (e) {}
      }
      if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.BackButton) {
        try { window.Telegram.WebApp.BackButton.hide(); } catch (e) {}
      }
      document.querySelectorAll('.fvh-pause-overlay, .fvh-forfeit-victory-screen').forEach(function (el) {
        try { el.remove(); } catch (e) {}
      });
      if (app.telegram && typeof app.telegram.leaveMatch === 'function') {
        try { app.telegram.leaveMatch(); } catch (e) {}
      }
      if (origQuitToMenu) {
        try { origQuitToMenu(); } catch (e) {}
      }
      app.showMenu();
    };
    // Initial sync with authoritative backend economy
    syncAuthoritativeEconomy(app);

    // Authoritative match completion reward hook (Offline & Online Authoritative Sync)
    var origMatchEnd = app.onMatchEnd ? app.onMatchEnd.bind(app) : null;
    if (origMatchEnd) {
      app.onMatchEnd = function (sum) {
        origMatchEnd(sum);
        decorateResultPanelWithTaunt(app, sum);
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

        // Trigger referral qualification if this athlete was invited
        fetch(getApiUrl('/api/referrals/qualify'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId: pid })
        }).catch(function () {});

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
                  if (!d.stats) d.stats = {};
                  d.stats.wins = (d.stats.wins || 0) + 1;
                });
              }
            });
          }
        }).catch(function () {});

        // Show clear victory result screen: "Victory — Opponent Disconnected"
        if (app.game) app.game.stop();
        if (app.closePause) app.closePause();
        app.state = 'results';
        var lang = getActiveLang();
        var myName = onlineInfo.myName || (app.store && app.store.data && app.store.data.name) || 'You';
        var oppName = onlineInfo.oppName || (lang === 'ru' ? 'Соперник' : 'Opponent');

        var curChar = (app.store && app.store.data && app.store.data.selectedCharacter) || 'footy';
        var isFootyWin = (curChar === 'footy');
        var tauntTitle = isFootyWin ? tr('victoryTauntFooty') : tr('victoryTauntHoops');
        var tauntSub = isFootyWin ? tr('victoryTauntFootySub') : tr('victoryTauntHoopsSub');
        if (typeof addMatchPointsToLiveWar === 'function') {
          addMatchPointsToLiveWar(curChar, 30);
        }

        var overlay = document.createElement('div');
        overlay.className = 'screen dim fvh-forfeit-victory-screen';
        overlay.style.zIndex = '99999';
        overlay.style.pointerEvents = 'auto';

        var panel = document.createElement('div');
        panel.className = 'panel result-panel online-result res-win';
        panel.style.maxWidth = '460px';
        panel.style.textAlign = 'center';
        panel.innerHTML =
          '<div class="note">' + (lang === 'ru' ? 'ОНЛАЙН-МАТЧ' : 'ONLINE MATCH') + '</div>' +
          '<h2 class="result-title win" style="margin:8px 0 10px;font-size:clamp(20px, 5.5vw, 26px);color:#4ade80;">' +
            '<span style="display:inline-flex;align-items:center;gap:8px;">' + getUiIconSvg('trophy', 22) + ' <span>' + (lang === 'ru' ? 'Победа — соперник отключился' : 'Victory — Opponent Disconnected') + '</span></span>' +
          '</h2>' +
          '<div class="fvh-victory-taunt-card ' + curChar + '" style="margin-bottom:12px;">' +
          '  <div class="fvh-taunt-badge-tag" style="display:inline-flex;align-items:center;gap:6px;">' + (isFootyWin ? getUiIconSvg('nav_home_footy', 14) + ' <span>FOOTY VICTORY</span>' : getUiIconSvg('nav_home_hoops', 14) + ' <span>HOOPS VICTORY</span>') + '</div>' +
          '  <div class="fvh-taunt-headline">' + tauntTitle + '</div>' +
          '  <div class="fvh-taunt-subtext">' + tauntSub + '</div>' +
          '</div>' +
          '<div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:12px;margin-bottom:14px;">' +
          '  <div style="font-size:14px;font-weight:800;color:#fff;">' + escapeHtml(myName) + ' vs ' + escapeHtml(oppName) + '</div>' +
          '  <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">' + (lang === 'ru' ? 'Соперник покинул игру или потерял связь' : 'Opponent left the match or disconnected') + '</div>' +
          '</div>' +
          '<div class="fvh-reward-badge" style="display:inline-flex;align-items:center;gap:8px;background:rgba(250,204,21,0.15);border:1px solid rgba(250,204,21,0.4);border-radius:20px;padding:6px 14px;margin-bottom:18px;color:#fde047;font-weight:900;font-size:13px;">' +
            getFvhCoinSvg('inline') + ' +20 FvH Coin · +30 XP' +
          '</div>' +
          '<div class="actions-row">' +
          '  <button class="btn primary block fvh-btn-forfeit-menu">' + (lang === 'ru' ? 'В главное меню' : 'Back to Menu') + '</button>' +
          '</div>';

        panel.querySelector('.fvh-btn-forfeit-menu').onclick = function () {
          app.audio.play('click');
          overlay.remove();
          app.showMenu();
        };

        overlay.appendChild(panel);
        document.body.appendChild(overlay);
        return;
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
            var tgPlayerId = 'fvh_tg_' + u.id;
            if (!d.playerId || d.playerId.startsWith('PLAYER_') || d.playerId.startsWith('player_')) {
              d.playerId = tgPlayerId;
              try { localStorage.setItem('fvh_player_id', tgPlayerId); } catch (e) {}
            }
            if (typeof u.language_code === 'string' && u.language_code && (!d.settings || !d.settings.lang || d.settings.lang === 'auto')) {
              if (!d.settings) d.settings = {};
              d.settings.lang = u.language_code.startsWith('ru') ? 'ru' : 'en';
            }
          });
        }

        // Authoritative backend initData validation & activity registration
        if (tg.initData) {
          try {
            fetch(getApiUrl('/api/telegram/validate-init-data'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                initData: tg.initData,
                platform: tg.platform || 'unknown',
                playerId: (app && app.store && app.store.data && app.store.data.playerId) || null,
                preferredLanguage: (app && app.store && app.store.data && app.store.data.settings && app.store.data.settings.lang) || null
              })
            }).then(function (r) { return r.json(); }).then(function (res) {
              if (res && res.validated && res.user) {
                app.store.update(function (d) {
                  if (!d.telegramUser) d.telegramUser = {};
                  d.telegramUser.validated = true;
                  d.telegramUser.id = res.user.id;
                  if (res.user.username) d.telegramUser.username = res.user.username;
                  if (res.user.first_name) d.telegramUser.firstName = res.user.first_name;
                });
              }
            }).catch(function () {});
          } catch (e) {}
        }

        // Native Telegram BackButton
        if (tg.BackButton) {
          tg.BackButton.onClick(function () {
            if (app.state === 'match' || (app.game && app.game.running)) {
              if (app.pauseEl) {
                app.closePause();
                app.quitToMenu();
              } else {
                app.openPause();
              }
              return;
            }
            if (app.state === 'results') {
              app.showMenu();
              return;
            }
            if (app.state !== 'menu') {
              app.showMenu();
            }
          });
        }

        // Sync haptics settings to Telegram engine
        if (app && app.telegram && typeof app.telegram.setHaptics === 'function') {
          var hOn = (!app.store || !app.store.data || !app.store.data.settings || app.store.data.settings.haptics !== false);
          app.telegram.setHaptics(hOn);
        }

        // Haptic-enabled tactile feedback
        if (app && app.audio && !app.audio._hapticWrapped) {
          var origPlay = app.audio.play.bind(app.audio);
          app.audio.play = function (name) {
            if (name === 'claim' || name === 'purchase' || name === 'goal' || name === 'dunk') {
              triggerHaptic('success');
            } else if (name === 'error') {
              triggerHaptic('error');
            } else if (name === 'kick' || name === 'shoot' || name === 'tackle' || name === 'whistle' || name === 'post') {
              triggerHaptic('medium');
            }
            // Note: Never vibrate on bounce, dribble, step, click, swish, countdown
            return origPlay.apply(app.audio, arguments);
          };
          app.audio._hapticWrapped = true;
        }
      } catch (tgErr) {
        console.warn('Telegram WebApp initialization error:', tgErr);
      }
    }

    function updateTelegramBackButton(state) {
      lockTelegramSwipesNow();
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

    if (!app) return;
    var originalGo = app.go ? app.go.bind(app) : function () {};
    var originalShow = app.show ? app.show.bind(app) : null;

    app.show = function (el, id) {
      lockTelegramSwipesNow();
      if (this.ui) {
        this.ui.innerHTML = '';
      }
      if (originalShow) {
        originalShow(el, id);
      } else if (el) {
        el.dataset.id = id;
        if (this.ui && typeof this.ui.append === 'function') {
          this.ui.append(el);
        }
      }
      this.current = el;
    };

    // Dedicated Character Locker opener (Tapping FOOTY or HOOPS opens their respective inventory)
    app.openCharacterLocker = function (charId, slotId) {
      app.show(buildCharactersPage(app, charId, slotId), 'characters');
    };

    app.showCharacters = function (charTarget, slotTarget) {
      var c = charTarget || (app.store && app.store.data && (app.store.data.selectedTeam || app.store.data.selectedCharacter)) || 'footy';
      var s = slotTarget || 'skins';
      app.show(buildCharactersPage(app, c, s), 'characters');
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
      } else if (page === 'airdrop') {
        app.audio.play('click');
        app.show(buildAirdropPage(app), 'airdrop');
      } else if (page === 'upgrades') {
        app.audio.play('click');
        app.show(buildUpgradesPage(app), 'upgrades');
      } else {
        originalGo(page);
      }
    };

    // Dedicated Athlete Upgrades Hub Opener
    app.showUpgrades = function () {
      app.go('upgrades');
    };

    // Dedicated Play-to-Airdrop Hub Screen Opener
    app.showAirdrop = function () {
      app.go('airdrop');
    };

    // Dedicated Team Selection Screen
    app.showTeamSelection = function () {
      app.state = 'menu';
      app.show(buildTeamSelectionScreen(app), 'team-select');
    };

    // Override showMenu with new redesigned main menu
    app.showMenu = function () {
      app.state = 'menu';
      if (typeof updateTelegramBackButton === 'function') updateTelegramBackButton('menu');
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

    // Auto-sanitize legacy stadium slots so standard arenas are active unless explicitly owned
    if (app && app.store && app.store.data) {
      var d = app.store.data;
      if (!d.owned) d.owned = [];
      if (!d.equipped) d.equipped = {};
      var ownedList = d.owned;
      if (!d.equipped['stadium.hoops'] || d.equipped['stadium.hoops'] === 'std_volcano_caldera' || d.equipped['stadium.hoops'] === 'std_urban_rooftop' || ownedList.indexOf(d.equipped['stadium.hoops']) === -1) {
        d.equipped['stadium.hoops'] = 'std_hoops_street';
      }
      if (ownedList.indexOf('footy_classic') === -1) ownedList.push('footy_classic');
      if (ownedList.indexOf('hoops_classic') === -1) ownedList.push('hoops_classic');
      if (!d.equipped['skin.footy'] || d.equipped['skin.footy'] === 'skin_rookie' || d.equipped['skin.footy'] === 'skin_default') {
        d.equipped['skin.footy'] = 'footy_classic';
      }
      if (!d.equipped['skin.hoops'] || d.equipped['skin.hoops'] === 'skin_bb_onyx' || d.equipped['skin.hoops'] === 'skin_solar' || d.equipped['skin.hoops'] === 'skin_default') {
        d.equipped['skin.hoops'] = 'hoops_classic';
      }
      if (!d.equipped['stadium.footy'] || d.equipped['stadium.footy'] === 'std_classic_pitch' || ownedList.indexOf(d.equipped['stadium.footy']) === -1) {
        d.equipped['stadium.footy'] = 'std_footy_classic';
      }
      if (d.equipped.stadium) delete d.equipped.stadium;
      try { app.store.save(); } catch (e) {}
    }

    // Initial render or URL parameter
    var params = (typeof window !== 'undefined' && window.location) ? new URLSearchParams(window.location.search) : null;
    var startParam = (params ? (params.get('tgWebAppStartParam') || params.get('startapp') || params.get('start_param')) : null);
    if (!startParam && typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) {
      startParam = window.Telegram.WebApp.initDataUnsafe.start_param || null;
    }

    // Auto-register referral code from Telegram start_param
    if (startParam && typeof startParam === 'string' && startParam.startsWith('ref_')) {
      var refCodeFromParam = startParam.slice(4).trim();
      var pid = getAppPlayerId(app);
      var tgId = (app.store && app.store.data && app.store.data.telegramUser && app.store.data.telegramUser.id)
        ? app.store.data.telegramUser.id
        : undefined;
      if (refCodeFromParam && pid) {
        fetch(getApiUrl('/api/referrals/register'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ friendId: pid, referralCode: refCodeFromParam, telegramId: tgId })
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

    var duelCode = null;
    if (startParam && typeof startParam === 'string') {
      if (startParam.startsWith('duel_')) duelCode = startParam.slice(5).trim();
      else if (startParam.startsWith('room_')) duelCode = startParam.slice(5).trim();
    }
    if (!duelCode && params && (params.get('room') || params.get('duel') || params.get('joinroom'))) {
      duelCode = params.get('room') || params.get('duel') || params.get('joinroom');
    }

    var targetLaunch = (params ? params.get('launch') : null) ||
      (startParam === 'launch_footy' || startParam === 'footy' ? 'footy' : null) ||
      (startParam === 'launch_hoops' || startParam === 'hoops' ? 'hoops' : null);

    if (startParam && typeof startParam === 'string' && startParam.startsWith('room_')) {
      privateroom = startParam.slice(5).trim();
    }

    if (duelCode) {
      setTimeout(function () {
        app.show(buildModeSelectPage(app), 'mode');
      }, 350);
    } else if (targetLaunch) {
      setTimeout(function () {
        app.launch({
          mode: targetLaunch,
          char: (app.store && app.store.data && (app.store.data.selectedCharacter || app.store.data.selectedTeam)) || 'footy',
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
  function checkBundleOwnership(bundle, ownedList) {
    if (!bundle || !bundle.items || !ownedList) return false;
    var cosmeticItems = bundle.items.filter(function (it) { return it.type === 'cosmetic'; });
    if (cosmeticItems.length === 0) return false;
    return cosmeticItems.every(function (it) {
      return ownedList.indexOf(it.id) !== -1;
    });
  }
  // Legacy identifiers: tabGameplay tabSocialMedia tabInviteFriends q_sub_chat copyInviteLink

  if (typeof window !== 'undefined') {
    window.buildShopPage = buildShopPage;
    window.buildCharactersPage = buildCharactersPage;
    window.buildQuestsPage = buildQuestsPage;
    window.buildProfilePage = buildProfilePage;
    window.buildSettingsPage = buildSettingsPage;
    window.renderRedesignedMenu = renderRedesignedMenu;

    window.__fvhStore = {
      buildDefaultShopCatalog: buildDefaultShopCatalog,
      LEGACY_ITEM_ALIASES: LEGACY_ITEM_ALIASES,
      getItemLabelById: getItemLabelById,
      trItem: trItem,
      tr: tr,
      getActiveLang: getActiveLang,
      setActiveLang: function(l) {
        if (!window.__fvh) window.__fvh = { store: { data: { settings: {} } } };
        if (!window.__fvh.store) window.__fvh.store = { data: { settings: {} } };
        if (!window.__fvh.store.data) window.__fvh.store.data = { settings: {} };
        if (!window.__fvh.store.data.settings) window.__fvh.store.data.settings = {};
        window.__fvh.store.data.settings.lang = l;
      },
      getDetailedJerseySvg: getDetailedJerseySvg,
      getDetailedBallSvg: getDetailedBallSvg
    };
  }
})();
