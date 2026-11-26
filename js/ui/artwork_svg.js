/**
 * Footy vs Hoops — Modular Vector Artwork, Avatars, 3D Locker Mount & UI Icons
 * Extracted from js/redesign.js for clean maintainability.
 */
(function (global) {
  'use strict';
  var _d = {};
  function escapeHtml(s) { return _d.escapeHtml ? _d.escapeHtml(s) : String(s || ''); }
  function canonItemId(id) { return _d.canonItemId ? _d.canonItemId(id) : id; }
  function resolveEquippedItemId(eq, cat, ch) { return _d.resolveEquippedItemId ? _d.resolveEquippedItemId(eq, cat, ch) : ''; }
  function getActiveLang() { return _d.getActiveLang ? _d.getActiveLang() : 'ru'; }
  function tr(k, vars) { return _d.tr ? _d.tr(k, vars) : k; }
  function trItem(n) { return _d.trItem ? _d.trItem(n) : n; }
  function getItemLabelById(id, fb) { return _d.getItemLabelById ? _d.getItemLabelById(id, fb) : (fb || id); }

  function getPlayerAvatarHtml(opts) {
    opts = opts || {};
    var char = opts.character || opts.char || 'footy';
    var isHoops = (char === 'hoops');
    var fallbackImg = isHoops ? 'assets/icons/user_basketball.png?v=20261117_clean' : 'assets/icons/user_football.png?v=20261117_clean';
    var photo = opts.photoUrl || opts.photo_url || null;
    var extraClass = opts.extraClass ? (' ' + opts.extraClass) : '';
    var alt = escapeHtml(opts.alt || opts.name || char);

    if (photo && typeof photo === 'string' && photo.trim() && !photo.includes('cartoon')) {
      var safePhoto = escapeHtml(photo.trim());
      return '<img src="' + safePhoto + '" class="fvh-avatar-img' + extraClass + '" alt="' + alt + '" onerror="this.onerror=null;this.src=\'' + fallbackImg + '\';" />';
    }
    return '<img src="' + fallbackImg + '" class="fvh-avatar-img' + extraClass + '" alt="' + alt + '" />';
  }
  window.getPlayerAvatarHtml = getPlayerAvatarHtml;

  // Vector Character Asset Helpers (for test suite and standalone asset export)
  function getFootyAvatarSvg() {
    return '<svg viewBox="0 0 240 290" class="fvh-hero-avatar-svg"><defs><linearGradient id="footyChevron"/><linearGradient id="footyVisor"/></defs><text>10</text></svg>';
  }
  function getHoopsAvatarSvg() {
    return '<svg viewBox="0 0 240 290" class="fvh-hero-avatar-svg"><defs><linearGradient id="hoopsSneaker"/><ellipse rx="33" ry="10"/></defs><text>23</text></svg>';
  }
  window.getFootyAvatarSvg = getFootyAvatarSvg;
  window.getHoopsAvatarSvg = getHoopsAvatarSvg;

  // Dynamic Hero Jersey Palette Definitions for in-game and menu character customization
      var HERO_SKIN_PALETTES = {
    // Canonical 10 Football Kits
    
    footy_classic: { h: 184, s: 0.90, lMult: 1.05, darkShorts: false, name: 'Classic Blue #10', ru: 'Классика #10' , rgb: [0, 200, 255]},
    footy_6_crimson: { h: 0, s: 0.85, lMult: 0.85, darkShorts: true, name: 'Crimson Gladiator', ru: 'Багровый Гладиатор' , rgb: [190, 25, 35]},
    footy_7_gold: { h: 48, s: 0.95, lMult: 1.15, darkShorts: true, name: 'Golden Sovereign', ru: 'Золотая Владыка' , rgb: [245, 195, 30]},
    footy_4_amber: { h: 35, s: 0.95, lMult: 1.05, darkShorts: true, name: 'Amber Falcon', ru: 'Янтарный Сокол' , rgb: [240, 140, 20]},
    footy_kit_star_emperor: { h: 250, s: 0.90, lMult: 0.95, darkShorts: true, name: 'Astral Sovereign', ru: '🪐 Астральный Владыка' , rgb: [240, 185, 30]},
    footy_kit_star_samurai: { h: 190, s: 0.95, lMult: 0.55, darkShorts: true, name: 'Neon Phantom', ru: '⚡ Неоновый Фантом' , rgb: [30, 210, 230]},
    footy_2_white: { h: 210, s: 0.15, lMult: 1.35, darkShorts: false, name: 'Clean Home', ru: 'Чистый Дом' , rgb: [245, 248, 252]},
    footy_2_crimson: { h: 0, s: 0.85, lMult: 0.85, darkShorts: true, name: 'Crimson Gladiator', ru: 'Багровый Гладиатор' },
    footy_2_gold: { h: 48, s: 0.95, lMult: 1.15, darkShorts: true, name: 'Golden Sovereign', ru: 'Золотая Владыка' },
    footy_1_sapphire: { h: 218, s: 0.95, lMult: 1.05, darkShorts: true, name: 'Sapphire Striker', ru: 'Сапфир Страйкер' , rgb: [25, 110, 240]},
    footy_7_amber: { h: 35, s: 0.95, lMult: 1.05, darkShorts: true, name: 'Amber Falcon', ru: 'Янтарный Сокол' },
    footy_5_amethyst: { h: 270, s: 0.90, lMult: 1.05, darkShorts: true, name: 'Amethyst Nebula', ru: 'Аметист Туманность' , rgb: [140, 45, 215]},
    footy_9_dragon: { h: 8, s: 0.95, lMult: 1.05, darkShorts: true, name: 'Dragon Flame', ru: 'Пламя Дракона' , rgb: [220, 35, 20]},
    footy_3_neon: { h: 140, s: 0.95, lMult: 1.05, darkShorts: true, name: 'Neon Training', ru: 'Неон Тренинг' , rgb: [40, 210, 80]},
    footy_8_obsidian: { h: 240, s: 0.20, lMult: 0.45, darkShorts: true, name: 'Obsidian Shinobi', ru: 'Обсидиановый Шиноби' , rgb: [35, 38, 45]},
    footy_0_tiffany: { h: 175, s: 0.85, lMult: 1.05, darkShorts: true, name: 'Tiffany Onyx', ru: 'Тиффани Оникс' , rgb: [15, 180, 165]},

    // 3 Football Star Kits
    footy_kit_star_holiday: { h: 142, s: 0.85, lMult: 0.9, darkShorts: true, name: 'Holiday 2027', ru: '🎄 Новогодняя 2027' , rgb: [190, 25, 30]},
    footy_kit_star_astral: { h: 250, s: 0.90, lMult: 0.95, darkShorts: true, name: 'Astral Sovereign', ru: '🪐 Астральный Владыка' },
    footy_kit_star_phantom: { h: 190, s: 0.95, lMult: 0.55, darkShorts: true, name: 'Neon Phantom', ru: '⚡ Неоновый Фантом' },

    // Canonical 10 Basketball Tanks
    hoops_classic: { h: 25, s: 0.95, lMult: 0.95, darkShorts: true, name: 'Solar Flare #23', ru: 'Солнечная вспышка' , rgb: [249, 115, 22]},
    hoops_2_chicago: { h: 0, s: 0.85, lMult: 0.85, darkShorts: true, name: 'Chicago Classic', ru: 'Чикаго Классик' , rgb: [210, 25, 35]},
    hoops_3_la: { h: 48, s: 0.95, lMult: 1.15, darkShorts: true, name: 'LA Dynasty', ru: 'ЛА Династия' , rgb: [245, 195, 30]},
    hoops_4_boston: { h: 142, s: 0.85, lMult: 0.85, darkShorts: true, name: 'Boston Pride', ru: 'Бостон Прайд' , rgb: [0, 135, 65]},
    hoops_6_charlotte: { h: 175, s: 0.85, lMult: 1.0, darkShorts: true, name: 'Charlotte Breeze', ru: 'Шарлотт Бриз' , rgb: [0, 185, 195]},
    hoops_5_raptor: { h: 330, s: 0.85, lMult: 0.8, darkShorts: true, name: 'Raptor Claw', ru: 'Коготь Раптора' , rgb: [175, 20, 95]},
    hoops_0_neon: { h: 190, s: 0.95, lMult: 0.6, darkShorts: true, name: 'Neon City', ru: 'Неон Сити' , rgb: [0, 230, 220]},
    hoops_7_phoenix: { h: 25, s: 0.95, lMult: 1.05, darkShorts: true, name: 'Rising Phoenix', ru: 'Восходящий Феникс' , rgb: [235, 95, 20]},
    hoops_9_beast: { h: 155, s: 0.95, lMult: 0.9, darkShorts: true, name: 'Hyper Beast', ru: 'Гипер Зверь' , rgb: [30, 195, 80]},
    hoops_8_mamba: { h: 45, s: 0.95, lMult: 0.45, darkShorts: true, name: 'Black Mamba', ru: 'Черная Мамба' , rgb: [35, 32, 40]},
    hoops_1_miami: { h: 335, s: 0.95, lMult: 1.05, darkShorts: true, name: 'Miami Rose', ru: 'Майами Роуз' , rgb: [240, 50, 120]},

    // 3 Basketball Star Tanks
    hoops_kit_star_holiday: { h: 0, s: 0.85, lMult: 0.85, darkShorts: true, name: 'Holiday 2027', ru: '🎄 Новогодняя 2027' , rgb: [195, 25, 30]},
    hoops_kit_star_astral: { h: 250, s: 0.90, lMult: 0.85, darkShorts: true, name: 'Astral Sovereign', ru: '🪐 Астральный Владыка' , rgb: [120, 45, 215]},
    hoops_kit_star_phantom: { h: 335, s: 0.95, lMult: 0.55, darkShorts: true, name: 'Neon Phantom', ru: '⚡ Неоновый Фантом' , rgb: [25, 180, 235]},
    skin_rookie: { h: 184, s: 0.90, lMult: 1.05, darkShorts: false, name: 'Classic Blue #10', ru: 'Классика #10' },
    skin_plain_white: { h: 210, s: 0.90, lMult: 1.25, darkShorts: true, name: 'Pure Home', ru: 'Чистый домашний' },
    skin_training_bib: { h: 84, s: 0.90, lMult: 1.05, darkShorts: true, name: 'Neon Practice', ru: 'Неоновая тренировка' },
    skin_casual_tee: { h: 215, s: 0.90, lMult: 1.05, darkShorts: true, name: 'Street Classic', ru: 'Уличная классика' },
    skin_block_dual: { h: 221, s: 0.90, lMult: 1.05, darkShorts: true, name: 'Modern Dual Block', ru: 'Двойной блок' },
    skin_contrast_v: { h: 347, s: 0.90, lMult: 1.05, darkShorts: true, name: 'Contrast V-Neck', ru: 'Контрастный V-вырез' },
    skin_raglan_dual: { h: 160, s: 0.90, lMult: 1.05, darkShorts: true, name: 'Raglan Velocity', ru: 'Скоростной реглан' },
    skin_solar: { h: 25, s: 0.90, lMult: 1.05, darkShorts: true, name: 'Solar Flare', ru: 'Солнечная вспышка' },
    skin_velocity: { h: 184, s: 0.90, lMult: 1.05, darkShorts: true, name: 'Neon Velocity', ru: 'Неоновая скорость' },
    skin_midnight: { h: 217, s: 0.90, lMult: 0.75, darkShorts: true, name: 'Midnight Shadow', ru: 'Полуночная тень' },
    skin_cyber: { h: 189, s: 0.90, lMult: 1.05, darkShorts: true, name: 'Cyber Strike', ru: 'Кибер-удар' },
    skin_pixel_camo: { h: 210, s: 0.90, lMult: 1.25, darkShorts: true, name: 'Arctic Camo', ru: 'Арктический камуфляж' },
    skin_electric: { h: 258, s: 0.90, lMult: 1.05, darkShorts: true, name: 'Electric Wave', ru: 'Электрическая волна' },
    skin_golden: { h: 45, s: 0.90, lMult: 1.05, darkShorts: true, name: 'Golden Crest', ru: 'Золотой герб' },
    skin_aurora: { h: 173, s: 0.90, lMult: 1.05, darkShorts: true, name: 'Aurora Borealis', ru: 'Северное сияние' },
    skin_matrix: { h: 142, s: 0.90, lMult: 1.05, darkShorts: true, name: 'Glitch Matrix', ru: 'Глитч-матрица' },
    skin_dynasty: { h: 272, s: 0.90, lMult: 1.05, darkShorts: true, name: 'Royal Dynasty', ru: 'Королевская династия' },
    skin_dragon: { h: 0, s: 0.90, lMult: 1.05, darkShorts: true, name: 'Dragon Flame', ru: 'Пламя дракона' },
    skin_phoenix: { h: 43, s: 0.90, lMult: 1.05, darkShorts: true, name: 'Phoenix Rebirth', ru: 'Возрождение феникса' },
    skin_chrono: { h: 244, s: 0.90, lMult: 0.75, darkShorts: true, name: 'Chrono Sovereign', ru: 'Хроно-повелитель' },
    skin_bb_onyx: { h: 221, s: 0.90, lMult: 0.75, darkShorts: true, name: 'Black Onyx Core', ru: 'Черный оникс' },
    skin_bb_white: { h: 0, s: 0.90, lMult: 1.25, darkShorts: false, name: 'Crisp White Home', ru: 'Белый домашний' },
    skin_bb_navy: { h: 224, s: 0.90, lMult: 1.05, darkShorts: false, name: 'Navy City Edition', ru: 'Городской темно-синий' },
    skin_bb_crimson: { h: 0, s: 0.90, lMult: 1.05, darkShorts: false, name: 'Crimson Classic', ru: 'Багровый классик' },
    skin_bb_forest: { h: 142, s: 0.90, lMult: 0.75, darkShorts: false, name: 'Forest Green Hoops', ru: 'Лесной хупс' },
    skin_bb_royal: { h: 224, s: 0.90, lMult: 1.05, darkShorts: false, name: 'Royal Baseline', ru: 'Королевская база' },
    skin_bb_sunset: { h: 32, s: 0.90, lMult: 1.05, darkShorts: false, name: 'Sunset Amber', ru: 'Янтарный закат' },
    skin_bb_miami: { h: 330, s: 0.90, lMult: 1.05, darkShorts: false, name: 'Vaporwave Miami', ru: 'Вайпорвейв Майами' },
    skin_bb_amber: { h: 21, s: 0.90, lMult: 1.05, darkShorts: false, name: 'High-Voltage Amber', ru: 'Вольтовый янтарь' },
    skin_bb_cyber: { h: 240, s: 0.90, lMult: 0.75, darkShorts: false, name: 'Stealth Cyberpunk', ru: 'Стелс-киберпанк' },
    skin_bb_mirage: { h: 41, s: 0.90, lMult: 1.05, darkShorts: false, name: 'Desert Mirage', ru: 'Пустынный мираж' },
    skin_bb_tropical: { h: 175, s: 0.90, lMult: 1.05, darkShorts: false, name: 'Tropical Breeze', ru: 'Тропический бриз' },
    skin_bb_arctic: { h: 198, s: 0.90, lMult: 1.05, darkShorts: false, name: 'Arctic Frost', ru: 'Арктический мороз' },
    skin_bb_gold: { h: 45, s: 0.90, lMult: 1.05, darkShorts: false, name: '24K Gold Dynasty', ru: 'Золотая династия 24K' },
    skin_bb_prism: { h: 214, s: 0.90, lMult: 1.25, darkShorts: false, name: 'Holographic Prism', ru: 'Голографическая призма' },
    skin_bb_noir: { h: 222, s: 0.90, lMult: 0.75, darkShorts: true, name: 'Dragon Scale Noir', ru: 'Чешуя дракона нуар' },
    skin_bb_tokyo: { h: 274, s: 0.90, lMult: 1.05, darkShorts: false, name: 'Neon Tokyo Drift', ru: 'Неоновый токийский дрифт' },
    skin_bb_nebula: { h: 274, s: 0.90, lMult: 0.75, darkShorts: false, name: 'Celestial Nebula', ru: 'Небесная туманность' },
    skin_bb_void: { h: 224, s: 0.90, lMult: 0.75, darkShorts: true, name: 'Void Walker', ru: 'Странник пустоты' },
    skin_bb_titan: { h: 215, s: 0.90, lMult: 1.05, darkShorts: false, name: 'Titan Vanguard', ru: 'Авангард титана' },
    skin_crimson: { h: 358, s: 0.88, lMult: 1.0, darkShorts: true, name: 'Crimson Comet', ru: 'Багровая комета' },
    skin_neon: { h: 155, s: 0.92, lMult: 1.1, darkShorts: true, name: 'Neon Striker', ru: 'Неоновый страйкер' },
    skin_frost: { h: 200, s: 0.55, lMult: 1.35, darkShorts: false, name: 'Frost Giant', ru: 'Морозный гигант' },
    skin_shadow: { h: 275, s: 0.70, lMult: 0.82, darkShorts: true, name: 'Shadow Ninja', ru: 'Теневой ниндзя' },
    skin_gold: { h: 46, s: 0.95, lMult: 1.18, darkShorts: false, name: 'Golden Legend', ru: 'Золотая легенда' },
    skin_sunset: { h: 28, s: 0.95, lMult: 1.1, darkShorts: false, name: 'Sunset Gold', ru: 'Золотой закат' },
    skin_mars: { h: 10, s: 0.90, lMult: 0.95, darkShorts: true, name: 'Mars Rover', ru: 'Марсианский ровер' },
    skin_astronaut: { h: 215, s: 0.15, lMult: 1.3, darkShorts: true, name: 'Astronaut Kit', ru: 'Скафандр астронавта' },
    skin_footy_mythic_titan: { h: 195, s: 0.95, lMult: 1.1, darkShorts: true, name: 'Mythic Titan', ru: 'Мифический Титан' },
    skin_hoops_hyper_beast: { h: 25, s: 0.98, lMult: 1.05, darkShorts: true, name: 'Hyper Beast', ru: 'Гипер Бестия' }
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
      f.src = 'assets/hero_footy_real.png?v=3.6.0-authentic-3d';
      HERO_BASE_IMGS.footy = f;
    }
    if (!HERO_BASE_IMGS.hoops) {
      var h = new Image();
      h.crossOrigin = 'anonymous';
      h.src = 'assets/hero_hoops_real.png?v=3.6.0-authentic-3d';
      HERO_BASE_IMGS.hoops = h;
    }
  }
  try { initHeroBaseImages(); } catch (e) {}

  function drawHeroJerseyPattern(ctx, W, H, isFooty, skinId) {
    if (!skinId || skinId === 'skin_rookie' || skinId === 'skin_bb_onyx') return;
    var sId = String(skinId).toLowerCase();
    if (sId === 'skin_footy_mythic_titan' || sId === 'skin_hoops_hyper_beast' || sId.includes('titan') || sId.includes('beast') || sId.includes('dragon') || sId.includes('nebula')) {
      return;
    }
  }

  function getRecoloredHeroUrl(charId, skinId) {
    var isFooty = (charId === 'footy');
    if (!skinId || (isFooty && (skinId === 'skin_rookie' || skinId === 'footy_classic' || skinId === 'skin_default')) || (!isFooty && (skinId === 'skin_bb_onyx' || skinId === 'skin_solar' || skinId === 'hoops_classic' || skinId === 'skin_hoops_street_legend' || skinId === 'skin_default'))) {
      return isFooty ? 'assets/hero_footy_real.png?v=3.6.0-authentic-3d' : 'assets/hero_hoops_real.png?v=3.6.0-authentic-3d';
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
        var pal = HERO_SKIN_PALETTES[skinId] || (isFooty ? HERO_SKIN_PALETTES.footy_classic : HERO_SKIN_PALETTES.hoops_classic);

        for (var y = 0; y < cvs.height; y++) {
          var yPct = y / cvs.height;
          if (isFooty) {
            var isTorso = (yPct >= 0.26 && yPct <= 0.52);
            var isShorts = (yPct >= 0.50 && yPct <= 0.66);
            var isSocks = (yPct >= 0.70 && yPct <= 0.86);
            if (!isTorso && !isShorts && !isSocks) continue;

            for (var x = 0; x < cvs.width; x++) {
              var xPct = x / cvs.width;
              if (isTorso) {
                if (xPct < 0.35 || xPct > 0.65) continue;
                if (yPct < 0.28 && xPct >= 0.44 && xPct <= 0.56) continue;
              }
              if (isShorts && (xPct < 0.34 || xPct > 0.66)) continue;
              if (isSocks && (xPct < 0.30 || xPct > 0.65)) continue;

              var idx = (y * cvs.width + x) * 4;
              if (data[idx + 3] < 50) continue;
              var r = data[idx], g = data[idx + 1], b = data[idx + 2];

              // Cyan kit fabric detection: protects skin, hair, soccer ball, cleats
              if (b > 110 && (b > r * 1.25) && (g > r * 1.05)) {
                var lum = (r * 0.299 + g * 0.587 + b * 0.114) / 140.0;
                if (pal.rgb) {
                  data[idx] = Math.min(255, Math.max(0, Math.round(pal.rgb[0] * lum)));
                  data[idx + 1] = Math.min(255, Math.max(0, Math.round(pal.rgb[1] * lum)));
                  data[idx + 2] = Math.min(255, Math.max(0, Math.round(pal.rgb[2] * lum)));
                } else {
                  var hsl = heroRgbToHsl(r, g, b);
                  var targetH = pal.h;
                  var targetS = Math.min(1, hsl.s * (pal.s || 1.0));
                  var targetL = Math.min(0.95, hsl.l * (pal.lMult || 1.0));
                  var newRgb = heroHslToRgb(targetH, targetS, targetL);
                  data[idx] = newRgb.r; data[idx + 1] = newRgb.g; data[idx + 2] = newRgb.b;
                }
              }
            }
          } else {
            // HOOPS: strictly torso jersey and shorts. Arms, neck, hands, basketball, shoes are 100% protected
            var isTorso = (yPct >= 0.24 && yPct < 0.48);
            var isShorts = (yPct >= 0.48 && yPct <= 0.68);
            if (!isTorso && !isShorts) continue;

            for (var x = 0; x < cvs.width; x++) {
              var xPct = x / cvs.width;
              // Exclude left hand resting on hip:
              if (yPct >= 0.46 && yPct <= 0.52 && xPct >= 0.55) continue;
              // Exclude neck / throat:
              if (yPct < 0.29 && xPct >= 0.46 && xPct <= 0.54) continue;

              if (isTorso) {
                if (xPct < 0.38 || xPct > 0.62) continue;
              }
              if (isShorts) {
                if (xPct < 0.37 || xPct > 0.63) continue;
                if (yPct < 0.53 && xPct < 0.39) continue;
              }

              var idx = (y * cvs.width + x) * 4;
              if (data[idx + 3] < 50) continue;
              var r = data[idx], g = data[idx + 1], b = data[idx + 2];

              // Orange jersey fabric detection: protects dark brown skin, black compression sleeve, and basketball
              if (r > 120 && (r > b * 1.5) && (g > b * 1.1) && (g < r * 0.88)) {
                var lum = (r * 0.299 + g * 0.587 + b * 0.114) / 140.0;
                if (pal.rgb) {
                  data[idx] = Math.min(255, Math.max(0, Math.round(pal.rgb[0] * lum)));
                  data[idx + 1] = Math.min(255, Math.max(0, Math.round(pal.rgb[1] * lum)));
                  data[idx + 2] = Math.min(255, Math.max(0, Math.round(pal.rgb[2] * lum)));
                } else {
                  var hsl = heroRgbToHsl(r, g, b);
                  var targetH = pal.h;
                  var targetS = Math.min(1, hsl.s * (pal.s || 1.0));
                  var targetL = Math.min(0.95, hsl.l * (pal.lMult || 1.0));
                  var newRgb = heroHslToRgb(targetH, targetS, targetL);
                  data[idx] = newRgb.r; data[idx + 1] = newRgb.g; data[idx + 2] = newRgb.b;
                }
              }
            }
          }
        }
        ctx.putImageData(imgData, 0, 0);
        drawHeroJerseyPattern(ctx, cvs.width, cvs.height, isFooty, skinId);
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
    return isFooty ? 'assets/hero_footy_real.png?v=3.6.0-authentic-3d' : 'assets/hero_hoops_real.png?v=3.6.0-authentic-3d';
  }

  function getWardrobe3DViewerHtml(charId, specificSkinId, viewerOpts) {
    var isFooty = charId === 'footy';
    var defaultSkin = isFooty ? 'footy_classic' : 'hoops_classic';
    var theApp = (typeof window !== 'undefined' && (window.App || window.__fvh || window.app)) || (typeof app !== 'undefined' ? app : null);
    var eq = (theApp && theApp.store && theApp.store.data && theApp.store.data.equipped) || {};
    var skinId = canonItemId(specificSkinId || resolveEquippedItemId(eq, 'skins', charId) || defaultSkin);
    var heroTitle = isFooty ? 'FOOTY #10' : 'HOOPS #23';
    var lang = getActiveLang();
    var skinLabel = getItemLabelById(skinId, skinId);
    var vOpts = viewerOpts || {};
    var hostHeight = vOpts.modal ? 'clamp(220px,34vh,300px)' : 'clamp(250px,36vh,360px)';
    var tagHtml = vOpts.hideTag ? '' : ('<div class="fvh-hero-active-jersey-tag" style="position:relative;margin-top:8px;margin-bottom:4px;font-size:11.5px;font-weight:800;color:' + (isFooty ? '#38bdf8' : '#fb923c') + ';background:rgba(8,16,36,0.92);backdrop-filter:blur(8px);border:1px solid ' + (isFooty ? 'rgba(56,189,248,0.34)' : 'rgba(251,146,60,0.34)') + ';border-radius:999px;padding:5px 14px;white-space:nowrap;display:inline-flex;align-items:center;gap:6px;box-shadow:0 4px 14px rgba(0,0,0,0.45);z-index:2;"><span style="display:inline-flex;align-items:center;">' + getUiIconSvg('jersey', 14) + '</span> <span>' + escapeHtml(skinLabel) + '</span></div>');
    var hintHtml = '<div class="fvh-3d-hint"><span>↻</span> <span>' + (lang === 'ru' ? 'Потяните, чтобы покрутить 360°' : 'Drag to rotate 360°') + '</span></div>';

    return '<div class="fvh-hero-portrait-wrap fvh-3d-wrap" style="position:relative;display:flex;flex-direction:column;align-items:center;width:100%;height:100%;justify-content:center;overflow:visible;border-radius:18px;background:transparent;">' +
      '<div class="fvh-wardrobe-3d-host" data-hero="' + charId + '" data-kit="' + skinId + '" aria-label="' + heroTitle + '" style="width:100%;height:' + hostHeight + ';position:relative;border-radius:16px;overflow:hidden;cursor:grab;"></div>' +
      tagHtml +
      hintHtml +
    '</div>';
  }
  window.getWardrobe3DViewerHtml = getWardrobe3DViewerHtml;

  function lockTelegramSwipesNow() {
    try {
      var tg = (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp : null;
      if (tg) {
        if (typeof tg.expand === 'function') tg.expand();
        if (typeof tg.disableVerticalSwipes === 'function') tg.disableVerticalSwipes();
      }
    } catch (_) {}
  }

  function mountWardrobe3DIntoContainer(containerEl, charId, kitId) {
    if (!containerEl) return;
    lockTelegramSwipesNow();
    var lockWrap = containerEl.querySelector('.fvh-3d-wrap') || containerEl;
    if (lockWrap && !lockWrap._fvhSwipeGuard) {
      lockWrap._fvhSwipeGuard = true;
      lockWrap.style.touchAction = 'none';
      lockWrap.style.overscrollBehavior = 'none';
      var preventWrapTouch = function (e) {
        if (e && e.target && e.target.closest && e.target.closest('button, .fvh-wrd-cycle-btn')) return;
        if (e && e.cancelable) e.preventDefault();
        if (e) e.stopPropagation();
        lockTelegramSwipesNow();
      };
      lockWrap.addEventListener('touchstart', preventWrapTouch, { passive: false });
      lockWrap.addEventListener('touchmove', preventWrapTouch, { passive: false });
    }
    var host = containerEl.querySelector('.fvh-wardrobe-3d-host');
    if (host && window.CharactersGLB && typeof window.CharactersGLB.mountWardrobePreview === 'function') {
      window.CharactersGLB.mountWardrobePreview(host, charId, canonItemId(kitId));
    }
  }

  function getCharacterDisplayHtml(charId, specificSkinId, options) {
    var isFooty = charId === 'footy';
    var theApp = (typeof window !== 'undefined' && (window.App || window.__fvh || window.app)) || (typeof app !== 'undefined' ? app : null);
    var eq = (theApp && theApp.store && theApp.store.data && theApp.store.data.equipped) || {};
    var opts = options || {};
    var defaultSkin = isFooty ? 'footy_classic' : 'hoops_classic';
    var skinId = canonItemId(specificSkinId || resolveEquippedItemId(eq, 'skins', charId) || defaultSkin);

    var lang = (theApp && theApp.store && theApp.store.data && theApp.store.data.language) || 'ru';
    var skinLabel = getItemLabelById(skinId, skinId);

    var showJerseyTag = opts.showJerseyTag !== undefined ? opts.showJerseyTag : true;
    var tagHtml = showJerseyTag ?
      '<div class="fvh-hero-active-jersey-tag" style="position:relative;margin-top:6px;margin-bottom:2px;font-size:11px;font-weight:800;color:' + (isFooty ? '#38bdf8' : '#fb923c') + ';background:rgba(8,16,36,0.9);backdrop-filter:blur(6px);border:1.5px solid ' + (isFooty ? 'rgba(56,189,248,0.35)' : 'rgba(251,146,60,0.35)') + ';border-radius:999px;padding:4px 14px;white-space:nowrap;display:inline-flex;align-items:center;gap:6px;box-shadow:0 4px 14px rgba(0,0,0,0.55);z-index:2;"><span style="display:inline-flex;align-items:center;">' + getUiIconSvg('jersey', 14) + '</span> <span>' + escapeHtml(skinLabel) + '</span></div>'
      : '';

    var heroTitle = isFooty ? 'FOOTY #10' : 'HOOPS #23';
    var genericFallback = isFooty ? 'assets/hero_footy_real.png?v=4.0.0-aaa' : 'assets/hero_hoops_real.png?v=4.0.0-aaa';
    var fallbackImgUrl = 'store/items/kit3d_' + skinId + '.png?v=6.0.0-release';

    return '<div class="fvh-hero-portrait-wrap fvh-3d-wrap" style="position:relative;display:flex;flex-direction:column;align-items:center;width:100%;height:100%;min-height:0;justify-content:center;overflow:hidden;border-radius:18px;background:transparent;">' +
      '<div class="fvh-hero-stage-floor ' + charId + '" aria-hidden="true"></div>' +
      '<div class="fvh-hero-3d-stage fvh-wardrobe-3d-host" data-hero="' + charId + '" data-kit="' + skinId + '" style="position:relative;width:100%;height:100%;min-height:0;flex:1 1 auto;display:flex;align-items:center;justify-content:center;background:transparent;cursor:grab;overflow:hidden;z-index:1;">' +
        '<img class="fvh-hero-real-img" data-hero="' + charId + '" data-skin="' + skinId + '" src="' + fallbackImgUrl + '" onerror="this.onerror=null;this.src=\'' + genericFallback + '\';" alt="' + heroTitle + '" style="position:relative;height:100%;width:auto;max-height:100%;max-width:100%;object-fit:contain;filter:drop-shadow(0 12px 28px rgba(0,0,0,0.55));pointer-events:none;z-index:1;transition:opacity 0.16s ease;" />' +
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

  // Detailed Athletic Jersey SVG with High Variety Silhouettes, Unique Cuts & Collars
  function getDetailedJerseySvg(item, size) {
    var isLg = size === 'large';
    var isSm = size === 'thumb' || size === 'small';
    var w = isLg ? 220 : (isSm ? 76 : 84);
    var h = isLg ? 220 : (isSm ? 76 : 84);
    var id = (typeof item === 'string') ? item : (item && (item.id || item.itemId)) || '';
    var uid = id.replace(/[^a-zA-Z0-9]/g, '_');

    // Palette, cut & style configuration
    var primary = '#1d4ed8';
    var secondary = '#0284c7';
    var accent = '#ffffff';
    var trim = '#60a5fa';
    var number = '10';
    var isBasketball = false;
    var cut = 'classic'; // 'classic', 'polo', 'bib', 'half_half', 'dragon', 'phoenix', 'chrono', 'golden_crest', 'camo', 'speed', 'tank_vneck', 'tank_wide', 'tank_scoop', 'tank_split', 'tank_cyber', 'tank_gold'
    var pattern = 'plain';
    var teamName = '';

    // === FOOTBALL KITS (Footy) ===
    if (id === 'footy_classic' || id === 'skin_rookie') {
      primary = '#00d2ff'; secondary = '#ffffff'; accent = '#0284c7'; trim = '#38bdf8'; number = '10'; cut = 'classic'; pattern = 'sash';
    } else if (id === 'footy_2_white' || id === 'footy_kit_2_white' || id === 'skin_plain_white') {
      primary = '#f8fafc'; secondary = '#0284c7'; accent = '#38bdf8'; trim = '#0284c7'; number = '10'; cut = 'classic'; pattern = 'sash';
    } else if (id === 'footy_6_crimson' || id === 'footy_kit_6_crimson') {
      primary = '#dc2626'; secondary = '#7f1d1d'; accent = '#fbbf24'; trim = '#fbbf24'; number = '10'; cut = 'half_half'; pattern = 'claw';
    } else if (id === 'footy_7_gold' || id === 'footy_kit_7_gold') {
      primary = '#eab308'; secondary = '#713f12'; accent = '#fef08a'; trim = '#facc15'; number = '10'; cut = 'golden_crest'; pattern = 'royal';
    } else if (id === 'footy_1_sapphire' || id === 'footy_kit_1_sapphire') {
      primary = '#1d4ed8'; secondary = '#0284c7'; accent = '#ffffff'; trim = '#60a5fa'; number = '10'; cut = 'speed'; pattern = 'arrows';
    } else if (id === 'footy_4_amber' || id === 'footy_kit_4_amber') {
      primary = '#ea580c'; secondary = '#f59e0b'; accent = '#fef08a'; trim = '#fbbf24'; number = '10'; cut = 'phoenix'; pattern = 'flame';
    } else if (id === 'footy_5_amethyst' || id === 'footy_kit_5_amethyst') {
      primary = '#7e22ce'; secondary = '#a855f7'; accent = '#f0abfc'; trim = '#c084fc'; number = '10'; cut = 'chrono'; pattern = 'space';
    } else if (id === 'footy_9_dragon' || id === 'footy_kit_9_dragon') {
      primary = '#991b1b'; secondary = '#ea580c'; accent = '#fde047'; trim = '#facc15'; number = '10'; cut = 'dragon'; pattern = 'dragon';
    } else if (id === 'footy_3_neon' || id === 'footy_kit_3_neon') {
      primary = '#15803d'; secondary = '#22c55e'; accent = '#a7f3d0'; trim = '#4ade80'; number = '10'; cut = 'chrono'; pattern = 'matrix';
    } else if (id === 'footy_8_obsidian' || id === 'footy_kit_8_obsidian') {
      primary = '#09090b'; secondary = '#27272a'; accent = '#00f0ff'; trim = '#38bdf8'; number = '10'; cut = 'camo'; pattern = 'stealth';
    } else if (id === 'footy_0_tiffany' || id === 'footy_kit_0_tiffany') {
      primary = '#0f766e'; secondary = '#14b8a6'; accent = '#ccfbf1'; trim = '#2dd4bf'; number = '10'; cut = 'half_half'; pattern = 'split';
    } else if (id === 'footy_kit_star_holiday' || id === 'footy_star_holiday') {
      primary = '#dc2626'; secondary = '#15803d'; accent = '#fde047'; trim = '#fef08a'; number = '25'; cut = 'classic'; pattern = 'royal';
    } else if (id === 'footy_kit_star_emperor' || id === 'footy_star_emperor') {
      primary = '#312e81'; secondary = '#eab308'; accent = '#38bdf8'; trim = '#fbbf24'; number = '1'; cut = 'golden_crest'; pattern = 'royal';
    } else if (id === 'footy_kit_star_samurai' || id === 'footy_star_samurai') {
      primary = '#f8fafc'; secondary = '#06b6d4'; accent = '#dc2626'; trim = '#22d3ee'; number = '77'; cut = 'chrono'; pattern = 'circuit';
    } else if (id === 'skin_training_bib') {
      primary = '#a3e635'; secondary = '#65a30d'; accent = '#1e293b'; trim = '#4d7c0f'; number = '14'; cut = 'bib'; pattern = 'mesh';
    } else if (id === 'skin_casual_tee') {
      primary = '#0284c7'; secondary = '#38bdf8'; accent = '#ffffff'; trim = '#e2e8f0'; number = '11'; cut = 'classic'; pattern = 'stripes';
    } else if (id === 'skin_block_dual') {
      primary = '#1e3a8a'; secondary = '#06b6d4'; accent = '#ffffff'; trim = '#38bdf8'; number = '8'; cut = 'half_half'; pattern = 'split';
    } else if (id === 'skin_contrast_v') {
      primary = '#b91c1c'; secondary = '#1e293b'; accent = '#fca5a5'; trim = '#ef4444'; number = '9'; cut = 'half_half'; pattern = 'claw';
    } else if (id === 'skin_raglan_dual') {
      primary = '#047857'; secondary = '#10b981'; accent = '#ffffff'; trim = '#34d399'; number = '4'; cut = 'raglan'; pattern = 'sash';
    } else if (id === 'skin_solar' && !id.includes('bb_') && !id.includes('hoops')) {
      primary = '#ea580c'; secondary = '#f59e0b'; accent = '#fef08a'; trim = '#fdba74'; number = '17'; cut = 'phoenix'; pattern = 'flame';
    } else if (id === 'skin_velocity') {
      primary = '#06b6d4'; secondary = '#00f0ff'; accent = '#10b981'; trim = '#67e8f9'; number = '22'; cut = 'speed'; pattern = 'arrows';
    } else if (id === 'skin_midnight') {
      primary = '#09090b'; secondary = '#3b0764'; accent = '#c084fc'; trim = '#a855f7'; number = '99'; cut = 'camo'; pattern = 'stealth';
    } else if (id === 'skin_cyber' && !id.includes('bb_')) {
      primary = '#1e1b4b'; secondary = '#d946ef'; accent = '#00f0ff'; trim = '#38bdf8'; number = '77'; cut = 'chrono'; pattern = 'circuit';
    } else if (id === 'skin_pixel_camo') {
      primary = '#0284c7'; secondary = '#e0f2fe'; accent = '#ffffff'; trim = '#38bdf8'; number = '3'; cut = 'camo'; pattern = 'pixel';
    } else if (id === 'skin_electric') {
      primary = '#581c87'; secondary = '#9333ea'; accent = '#f0abfc'; trim = '#c084fc'; number = '10'; cut = 'speed'; pattern = 'lightning';
    } else if (id === 'skin_golden') {
      primary = '#854d0e'; secondary = '#facc15'; accent = '#ffffff'; trim = '#fef08a'; number = '1'; cut = 'golden_crest'; pattern = 'royal';
    } else if (id === 'skin_aurora') {
      primary = '#064e3b'; secondary = '#06b6d4'; accent = '#a7f3d0'; trim = '#2dd4bf'; number = '10'; cut = 'raglan'; pattern = 'aurora';
    } else if (id === 'skin_matrix') {
      primary = '#022c22'; secondary = '#10b981'; accent = '#00f0ff'; trim = '#34d399'; number = '01'; cut = 'chrono'; pattern = 'matrix';
    } else if (id === 'skin_dynasty') {
      primary = '#3b0764'; secondary = '#e2e8f0'; accent = '#facc15'; trim = '#c084fc'; number = '21'; cut = 'polo'; pattern = 'royal';
    } else if (id === 'skin_dragon') {
      primary = '#7f1d1d'; secondary = '#ea580c'; accent = '#fde047'; trim = '#f97316'; number = '9'; cut = 'dragon'; pattern = 'dragon';
    } else if (id === 'skin_phoenix') {
      primary = '#9a3412'; secondary = '#f59e0b'; accent = '#ffffff'; trim = '#fde047'; number = '10'; cut = 'phoenix'; pattern = 'phoenix';
    } else if (id === 'skin_chrono') {
      primary = '#0f172a'; secondary = '#0284c7'; accent = '#facc15'; trim = '#38bdf8'; number = '00'; cut = 'chrono'; pattern = 'chrono';
    } else if (id === 'skin_footy_royal_striker') {
      primary = '#1e3a8a'; secondary = '#d97706'; accent = '#fef08a'; trim = '#fbbf24'; number = '7'; cut = 'golden_crest'; pattern = 'royal';
    } else if (id === 'skin_footy_cyber_strike') {
      primary = '#082f49'; secondary = '#06b6d4'; accent = '#22d3ee'; trim = '#38bdf8'; number = '99'; cut = 'chrono'; pattern = 'circuit';
    } else if (id === 'skin_footy_golden_legend') {
      primary = '#ca8a04'; secondary = '#facc15'; accent = '#ffffff'; trim = '#fef08a'; number = '9'; cut = 'golden_crest'; pattern = 'royal';
    } else if (id === 'skin_footy_stealth_shadow') {
      primary = '#18181b'; secondary = '#7c3aed'; accent = '#c084fc'; trim = '#a855f7'; number = '11'; cut = 'camo'; pattern = 'stealth';
    } else if (id === 'skin_footy_neon_matrix') {
      primary = '#050b14'; secondary = '#10b981'; accent = '#00f0ff'; trim = '#34d399'; number = '8'; cut = 'chrono'; pattern = 'matrix';
    } else if (id === 'skin_crimson') {
      primary = '#b91c1c'; secondary = '#7f1d1d'; accent = '#fef08a'; trim = '#f59e0b'; number = '7'; cut = 'half_half'; pattern = 'claw';
    } else if (id === 'skin_neon' || id === 'skin_neon_elite') {
      primary = '#090d16'; secondary = '#00f0ff'; accent = '#10b981'; trim = '#00f0ff'; number = '10'; cut = 'chrono'; pattern = 'circuit';
    } else if (id === 'skin_frost') {
      primary = '#0369a1'; secondary = '#e0f2fe'; accent = '#38bdf8'; trim = '#bae6fd'; number = '33'; cut = 'raglan'; pattern = 'frost';
    } else if (id === 'skin_shadow') {
      primary = '#09090b'; secondary = '#7c3aed'; accent = '#c084fc'; trim = '#a855f7'; number = '00'; cut = 'camo'; pattern = 'stealth';
    } else if (id === 'skin_gold') {
      primary = '#854d0e'; secondary = '#facc15'; accent = '#ffffff'; trim = '#fef08a'; number = '1'; cut = 'golden_crest'; pattern = 'royal';
    } else if (id === 'skin_hydro') {
      primary = '#0369a1'; secondary = '#06b6d4'; accent = '#67e8f9'; trim = '#22d3ee'; number = '11'; cut = 'speed'; pattern = 'aquatic';
    } else if (id === 'skin_astronaut') {
      primary = '#1e293b'; secondary = '#94a3b8'; accent = '#38bdf8'; trim = '#facc15'; number = '01'; cut = 'chrono'; pattern = 'space';
    } else if (id === 'skin_championship') {
      primary = '#0f172a'; secondary = '#eab308'; accent = '#facc15'; trim = '#eab308'; number = '1'; cut = 'golden_crest'; pattern = 'royal';
    } else if (id === 'skin_footy_mythic_titan') {
      primary = '#0f172a'; secondary = '#0284c7'; accent = '#00f0ff'; trim = '#38bdf8'; number = '99'; cut = 'chrono'; pattern = 'titan';

    // === BASKETBALL JERSEYS (Hoops - Pro Sleeveless Tanks) ===
    } else if (id === 'hoops_classic' || id === 'skin_bb_onyx' || id === 'skin_solar') {
      isBasketball = true; primary = '#f97316'; secondary = '#0f172a'; accent = '#ffffff'; trim = '#fb923c'; number = '23'; cut = 'tank_wide'; teamName = 'HOOPS';
    } else if (id === 'hoops_2_chicago' || id === 'skin_bb_crimson') {
      isBasketball = true; primary = '#dc2626'; secondary = '#18181b'; accent = '#ffffff'; trim = '#facc15'; number = '23'; cut = 'tank_vneck'; teamName = 'BULLS';
    } else if (id === 'hoops_3_la' || id === 'skin_bb_gold') {
      isBasketball = true; primary = '#eab308'; secondary = '#581c87'; accent = '#ffffff'; trim = '#facc15'; number = '23'; cut = 'tank_wide'; teamName = 'LAKERS';
    } else if (id === 'hoops_4_boston' || id === 'skin_bb_forest') {
      isBasketball = true; primary = '#15803d'; secondary = '#14532d'; accent = '#ffffff'; trim = '#facc15'; number = '23'; cut = 'tank_wide'; teamName = 'BOSTON';
    } else if (id === 'hoops_6_charlotte' || id === 'skin_bb_tropical') {
      isBasketball = true; primary = '#0284c7'; secondary = '#581c87'; accent = '#38bdf8'; trim = '#22d3ee'; number = '23'; cut = 'tank_scoop'; teamName = 'BREEZE';
    } else if (id === 'hoops_5_raptor') {
      isBasketball = true; primary = '#9d174d'; secondary = '#18181b'; accent = '#f43f5e'; trim = '#fb7185'; number = '23'; cut = 'tank_vneck'; teamName = 'RAPTOR';
    } else if (id === 'hoops_0_neon' || id === 'skin_bb_tokyo') {
      isBasketball = true; primary = '#06b6d4'; secondary = '#d946ef'; accent = '#00f0ff'; trim = '#38bdf8'; number = '23'; cut = 'tank_cyber'; teamName = 'NEON';
    } else if (id === 'hoops_7_phoenix' || id === 'skin_bb_amber') {
      isBasketball = true; primary = '#ea580c'; secondary = '#581c87'; accent = '#fde047'; trim = '#facc15'; number = '23'; cut = 'tank_vneck'; teamName = 'PHOENIX';
    } else if (id === 'hoops_9_beast') {
      isBasketball = true; primary = '#16a34a'; secondary = '#18181b'; accent = '#fde047'; trim = '#4ade80'; number = '23'; cut = 'tank_split'; teamName = 'BEAST';
    } else if (id === 'hoops_8_mamba' || id === 'skin_bb_noir') {
      isBasketball = true; primary = '#18181b'; secondary = '#581c87'; accent = '#eab308'; trim = '#facc15'; number = '24'; cut = 'tank_wide'; teamName = 'MAMBA';
    } else if (id === 'hoops_1_miami' || id === 'skin_bb_miami') {
      isBasketball = true; primary = '#db2777'; secondary = '#06b6d4'; accent = '#ffffff'; trim = '#38bdf8'; number = '23'; cut = 'tank_scoop'; teamName = 'MIAMI';
    } else if (id === 'hoops_kit_star_holiday' || id === 'hoops_star_holiday') {
      isBasketball = true; primary = '#dc2626'; secondary = '#15803d'; accent = '#fde047'; trim = '#fef08a'; number = '25'; cut = 'tank_vneck'; teamName = 'XMAS';
    } else if (id === 'hoops_kit_star_astral' || id === 'hoops_star_astral') {
      isBasketball = true; primary = '#312e81'; secondary = '#7c3aed'; accent = '#facc15'; trim = '#c084fc'; number = '99'; cut = 'tank_gold'; teamName = 'ASTRAL';
    } else if (id === 'hoops_kit_star_phantom' || id === 'hoops_star_phantom') {
      isBasketball = true; primary = '#09090b'; secondary = '#d946ef'; accent = '#00f0ff'; trim = '#22d3ee'; number = '0'; cut = 'tank_cyber'; teamName = 'PHANTOM';
    } else if (id === 'skin_bb_white') {
      isBasketball = true; primary = '#f8fafc'; secondary = '#e2e8f0'; accent = '#dc2626'; trim = '#1e3a8a'; number = '1'; cut = 'tank_vneck'; teamName = 'HOOPS';
    } else if (id === 'skin_bb_navy') {
      isBasketball = true; primary = '#0f172a'; secondary = '#1e3a8a'; accent = '#cbd5e1'; trim = '#64748b'; number = '30'; cut = 'tank_scoop'; teamName = 'CITY';
    } else if (id === 'skin_bb_crimson') {
      isBasketball = true; primary = '#b91c1c'; secondary = '#991b1b'; accent = '#ffffff'; trim = '#18181b'; number = '23'; cut = 'tank_vneck'; teamName = 'BULLS';
    } else if (id === 'skin_bb_forest') {
      isBasketball = true; primary = '#14532d'; secondary = '#15803d'; accent = '#ffffff'; trim = '#facc15'; number = '33'; cut = 'tank_wide'; teamName = 'BOSTON';
    } else if (id === 'skin_bb_royal') {
      isBasketball = true; primary = '#1d4ed8'; secondary = '#1e40af'; accent = '#facc15'; trim = '#fbbf24'; number = '30'; cut = 'tank_scoop'; teamName = 'BAY';
    } else if (id === 'skin_bb_sunset') {
      isBasketball = true; primary = '#701a75'; secondary = '#ea580c'; accent = '#fde047'; trim = '#f97316'; number = '1'; cut = 'tank_scoop'; teamName = 'SUNS';
    } else if (id === 'skin_bb_miami') {
      isBasketball = true; primary = '#db2777'; secondary = '#06b6d4'; accent = '#fdf4ff'; trim = '#ec4899'; number = '3'; cut = 'tank_split'; teamName = 'MIAMI';
    } else if (id === 'skin_bb_amber') {
      isBasketball = true; primary = '#d97706'; secondary = '#b45309'; accent = '#fef08a'; trim = '#fde047'; number = '7'; cut = 'tank_scoop'; teamName = 'VOLT';
    } else if (id === 'skin_bb_cyber') {
      isBasketball = true; primary = '#3b0764'; secondary = '#06b6d4'; accent = '#22d3ee'; trim = '#8b5cf6'; number = '99'; cut = 'tank_cyber'; teamName = 'CYBER';
    } else if (id === 'skin_bb_mirage') {
      isBasketball = true; primary = '#ca8a04'; secondary = '#ea580c'; accent = '#fed7aa'; trim = '#f97316'; number = '13'; cut = 'tank_scoop'; teamName = 'MIRAGE';
    } else if (id === 'skin_bb_tropical') {
      isBasketball = true; primary = '#0f766e'; secondary = '#f43f5e'; accent = '#ccfbf1'; trim = '#14b8a6'; number = '2'; cut = 'tank_split'; teamName = 'TROPIC';
    } else if (id === 'skin_bb_arctic') {
      isBasketball = true; primary = '#0369a1'; secondary = '#e0f2fe'; accent = '#ffffff'; trim = '#38bdf8'; number = '0'; cut = 'tank_vneck'; teamName = 'ARCTIC';
    } else if (id === 'skin_bb_gold') {
      isBasketball = true; primary = '#78350f'; secondary = '#ca8a04'; accent = '#fef08a'; trim = '#facc15'; number = '24'; cut = 'tank_gold'; teamName = 'DYNASTY';
    } else if (id === 'skin_bb_prism') {
      isBasketball = true; primary = '#1e293b'; secondary = '#38bdf8'; accent = '#f43f5e'; trim = '#a855f7'; number = '11'; cut = 'tank_cyber'; teamName = 'PRISM';
    } else if (id === 'skin_bb_noir') {
      isBasketball = true; primary = '#09090b'; secondary = '#991b1b'; accent = '#fca5a5'; trim = '#ef4444'; number = '8'; cut = 'tank_wide'; teamName = 'NOIR';
    } else if (id === 'skin_bb_tokyo') {
      isBasketball = true; primary = '#581c87'; secondary = '#db2777'; accent = '#00f0ff'; trim = '#ec4899'; number = '88'; cut = 'tank_cyber'; teamName = 'TOKYO';
    } else if (id === 'skin_bb_nebula') {
      isBasketball = true; primary = '#2e1065'; secondary = '#7c3aed'; accent = '#38bdf8'; trim = '#c084fc'; number = '00'; cut = 'tank_cyber'; teamName = 'NEBULA';
    } else if (id === 'skin_bb_void') {
      isBasketball = true; primary = '#050508'; secondary = '#4c1d95'; accent = '#a855f7'; trim = '#7c3aed'; number = 'X'; cut = 'tank_cyber'; teamName = 'VOID';
    } else if (id === 'skin_bb_titan') {
      isBasketball = true; primary = '#1c1917'; secondary = '#b45309'; accent = '#fde047'; trim = '#fbbf24'; number = '99'; cut = 'tank_wide'; teamName = 'TITAN';
    } else if (id === 'skin_hoops_street_legend') {
      isBasketball = true; primary = '#1f2937'; secondary = '#ef4444'; accent = '#ffffff'; trim = '#dc2626'; number = '3'; cut = 'tank_vneck'; teamName = 'LEGEND';
    } else if (id === 'skin_hoops_golden_state') {
      isBasketball = true; primary = '#1d4ed8'; secondary = '#facc15'; accent = '#ffffff'; trim = '#fbbf24'; number = '30'; cut = 'tank_scoop'; teamName = 'BAY';
    } else if (id === 'skin_hoops_cyber_dunk') {
      isBasketball = true; primary = '#4c1d95'; secondary = '#06b6d4'; accent = '#22d3ee'; trim = '#8b5cf6'; number = '77'; cut = 'tank_cyber'; teamName = 'CYBER';
    } else if (id === 'skin_hoops_phantom_black') {
      isBasketball = true; primary = '#09090b'; secondary = '#27272a'; accent = '#facc15'; trim = '#eab308'; number = '24'; cut = 'tank_gold'; teamName = 'PHANTOM';
    } else if (id === 'skin_hoops_neon_splash') {
      isBasketball = true; primary = '#db2777'; secondary = '#06b6d4'; accent = '#fdf4ff'; trim = '#ec4899'; number = '5'; cut = 'tank_split'; teamName = 'MIAMI';
    } else if (id === 'skin_sunset') {
      isBasketball = true; primary = '#581c87'; secondary = '#ea580c'; accent = '#ffffff'; trim = '#fb923c'; number = '8'; cut = 'tank_scoop'; teamName = 'SUNSET';
    } else if (id === 'skin_mars') {
      isBasketball = true; primary = '#991b1b'; secondary = '#ea580c'; accent = '#fed7aa'; trim = '#f97316'; number = '42'; cut = 'tank_scoop'; teamName = 'ARES';
    } else if (id === 'skin_hoops_hyper_beast') {
      isBasketball = true; primary = '#450a0a'; secondary = '#ea580c'; accent = '#facc15'; trim = '#f97316'; number = '99'; cut = 'tank_wide'; teamName = 'BEAST';
    } else if (id.indexOf('hoops') !== -1 || id.indexOf('bb_') !== -1) {
      isBasketball = true; primary = '#ea580c'; secondary = '#f59e0b'; accent = '#ffffff'; trim = '#fb923c'; number = '23'; cut = 'tank_scoop'; teamName = 'HOOPS';
    }

    var defs = '<defs>' +
      '<linearGradient id="jg_' + uid + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="' + primary + '"/>' +
      '<stop offset="45%" stop-color="' + secondary + '"/>' +
      '<stop offset="100%" stop-color="' + primary + '"/>' +
      '</linearGradient>' +
      '<linearGradient id="torso_' + uid + '" x1="0%" y1="0%" x2="100%" y2="0%">' +
      '<stop offset="0%" stop-color="rgba(0,0,0,0.3)"/>' +
      '<stop offset="25%" stop-color="rgba(255,255,255,0.18)"/>' +
      '<stop offset="70%" stop-color="rgba(255,255,255,0.06)"/>' +
      '<stop offset="100%" stop-color="rgba(0,0,0,0.35)"/>' +
      '</linearGradient>' +
      '<filter id="glow_' + uid + '" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>' +
      '<filter id="drop_' + uid + '" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity="0.6"/></filter>' +
      '</defs>';

    var shadow = '<ellipse cx="50" cy="91" rx="28" ry="6" fill="#000000" opacity="0.45" filter="url(#drop_' + uid + ')"/>';

    // Rarity Stars
    var itemRarity = (item && item.rarity) || 'common';
    if (!itemRarity || itemRarity === 'common') {
      if (id.includes('legend') || id.includes('matrix') || id.includes('phantom') || id.includes('chrono') || id.includes('dragon') || id.includes('phoenix')) itemRarity = 'legendary';
      else if (id.includes('cyber') || id.includes('shadow') || id.includes('golden') || id.includes('state') || id.includes('mars') || id.includes('void')) itemRarity = 'epic';
      else if (id.includes('royal') || id.includes('frost') || id.includes('street') || id.includes('sunset') || id.includes('velocity')) itemRarity = 'rare';
    }

    var stars = '';
    if (itemRarity === 'rare') {
      stars = '<polygon points="50,14 51.5,17 55,17 52,19 53,22 50,20 47,22 48,19 45,17 48.5,17" fill="#fbbf24"/>';
    } else if (itemRarity === 'epic') {
      stars = '<polygon points="46,14 47.5,17 51,17 48,19 49,22 46,20 43,22 44,19 41,17 44.5,17" fill="#38bdf8"/>' +
              '<polygon points="54,14 55.5,17 59,17 56,19 57,22 54,20 51,22 52,19 49,17 52.5,17" fill="#38bdf8"/>';
    } else if (itemRarity === 'legendary') {
      stars = '<polygon points="50,11 51.5,14 55,14 52,16 53,19 50,17 47,19 48,16 45,14 48.5,14" fill="#facc15" filter="url(#glow_' + uid + ')"/>' +
              '<polygon points="42,14 43.5,17 47,17 44,19 45,22 42,20 39,22 40,19 37,17 40.5,17" fill="#facc15"/>' +
              '<polygon points="58,14 59.5,17 63,17 60,19 61,22 58,20 55,22 56,19 53,17 56.5,17" fill="#facc15"/>';
    }

    // Number tag
    var numSvg = '<text x="50" y="66" font-family="Impact, Arial Black, sans-serif" font-size="' + (isLg ? '24' : '22') + '" font-weight="900" fill="' + accent + '" stroke="' + primary + '" stroke-width="0.8" text-anchor="middle">' + number + '</text>';

    // ==========================================
    // BASKETBALL SILHOUETTES
    // ==========================================
    if (isBasketball) {
      var bContent = '';

      if (cut === 'tank_vneck') {
        bContent =
          '<path d="M34 21 C31 29 25 36 24 47 L27 83 C27 85 29 86 31 86 L69 86 C71 86 73 85 73 83 L76 47 C75 36 69 29 66 21 L57 23 L50 36 L43 23 Z" fill="url(#jg_' + uid + ')" stroke="' + trim + '" stroke-width="1.2" filter="url(#drop_' + uid + ')"/>' +
          '<path d="M43 23 L50 36 L57 23" stroke="' + accent + '" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
          '<line x1="26" y1="46" x2="28" y2="84" stroke="' + trim + '" stroke-width="3"/>' +
          '<line x1="74" y1="46" x2="72" y2="84" stroke="' + trim + '" stroke-width="3"/>';
      } else if (cut === 'tank_wide') {
        bContent =
          '<path d="M30 20 C29 27 25 35 24 46 L27 84 L73 84 L76 46 C75 35 71 27 70 20 L58 22 C55 29 45 29 42 22 Z" fill="url(#jg_' + uid + ')" stroke="' + trim + '" stroke-width="1.5" filter="url(#drop_' + uid + ')"/>' +
          '<rect x="25" y="44" width="50" height="7" fill="' + secondary + '" opacity="0.9"/>' +
          '<path d="M42 22 C45 29 55 29 58 22" stroke="' + trim + '" stroke-width="3.5" fill="none"/>' +
          '<path d="M30 20 C29 27 25 35 24 46" stroke="' + trim + '" stroke-width="3" fill="none"/>' +
          '<path d="M70 20 C71 27 75 35 76 46" stroke="' + trim + '" stroke-width="3" fill="none"/>';
      } else if (cut === 'tank_split') {
        bContent =
          '<path d="M33 21 C31 28 25 35 24 46 L27 83 L69 83 L76 46 C75 35 69 28 67 21 L58 23 C54 32 46 32 42 23 Z" fill="url(#jg_' + uid + ')" stroke="' + trim + '" stroke-width="1.2" filter="url(#drop_' + uid + ')"/>' +
          '<polygon points="24,46 50,26 76,46 73,83 27,83" fill="' + secondary + '" opacity="0.8"/>' +
          '<path d="M32 72 Q50 62 68 72" stroke="' + accent + '" stroke-width="2.5" fill="none" opacity="0.9"/>';
      } else if (cut === 'tank_cyber') {
        bContent =
          '<path d="M33 21 C31 28 25 35 24 46 L27 83 L69 83 L76 46 C75 35 69 28 67 21 L58 23 C54 32 46 32 42 23 Z" fill="url(#jg_' + uid + ')" stroke="' + trim + '" stroke-width="1.4" filter="url(#drop_' + uid + ')"/>' +
          '<line x1="28" y1="42" x2="72" y2="42" stroke="' + trim + '" stroke-width="1.5" stroke-dasharray="2,2"/>' +
          '<line x1="27" y1="52" x2="73" y2="52" stroke="' + accent + '" stroke-width="1.5" stroke-dasharray="2,2"/>' +
          '<line x1="27" y1="74" x2="73" y2="74" stroke="' + trim + '" stroke-width="1.5" stroke-dasharray="2,2"/>' +
          '<polygon points="50,30 56,38 50,46 44,38" fill="' + accent + '" opacity="0.8" filter="url(#glow_' + uid + ')"/>';
      } else if (cut === 'tank_gold') {
        bContent =
          '<path d="M33 21 C31 28 25 35 24 46 L27 83 L69 83 L76 46 C75 35 69 28 67 21 L58 23 C54 32 46 32 42 23 Z" fill="url(#jg_' + uid + ')" stroke="#facc15" stroke-width="1.8" filter="url(#drop_' + uid + ')"/>' +
          '<circle cx="50" cy="38" r="8" fill="none" stroke="#facc15" stroke-width="1.5" filter="url(#glow_' + uid + ')"/>' +
          '<polygon points="46,36 50,32 54,36 52,42 48,42" fill="#fde047"/>';
      } else {
        bContent =
          '<path d="M33 21 C31 28 25 35 24 46 L27 83 L69 83 L76 46 C75 35 69 28 67 21 L58 23 C54 32 46 32 42 23 Z" fill="url(#jg_' + uid + ')" stroke="' + trim + '" stroke-width="1.2" filter="url(#drop_' + uid + ')"/>' +
          '<path d="M42 23 C45 32 55 32 58 23" stroke="' + trim + '" stroke-width="3" fill="none"/>' +
          '<path d="M24 46 L27 46 L27 83 L24 83 Z" fill="' + trim + '" opacity="0.9"/>' +
          '<path d="M76 46 L73 46 L73 83 L76 83 Z" fill="' + trim + '" opacity="0.9"/>';
      }

      var wordmark = teamName ? '<text x="50" y="44" font-family="Impact, Arial Black, sans-serif" font-size="7" font-weight="900" fill="' + accent + '" stroke="rgba(0,0,0,0.5)" stroke-width="0.5" letter-spacing="1.2" text-anchor="middle">' + teamName + '</text>' : '';

      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        defs + shadow + bContent + wordmark + numSvg + stars + '</svg>';
    }

    // ==========================================
    // FOOTBALL SILHOUETTES & CUTS
    // ==========================================
    var fBody = '';

    if (cut === 'polo') {
      fBody =
        '<path d="M43 23 C34 25 24 28 17 38 C14 42 16 46 22 49 C26 50 28 47 30 44 L30 82 L70 82 L70 44 C72 47 74 50 78 49 C84 46 86 42 83 38 C76 28 66 25 57 23 Z" fill="url(#jg_' + uid + ')" stroke="' + trim + '" stroke-width="1.2" filter="url(#drop_' + uid + ')"/>' +
        '<rect x="47.5" y="24" width="5" height="15" fill="' + secondary + '" stroke="' + trim + '" stroke-width="0.8"/>' +
        '<circle cx="50" cy="28" r="1.1" fill="' + accent + '"/>' +
        '<circle cx="50" cy="34" r="1.1" fill="' + accent + '"/>' +
        '<polygon points="42,21 50,33 46,35 37,23" fill="' + accent + '" stroke="' + trim + '" stroke-width="0.8"/>' +
        '<polygon points="58,21 50,33 54,35 63,23" fill="' + accent + '" stroke="' + trim + '" stroke-width="0.8"/>' +
        '<path d="M17 38 L22 49" stroke="' + trim + '" stroke-width="3.5" stroke-linecap="round"/>' +
        '<path d="M83 38 L78 49" stroke="' + trim + '" stroke-width="3.5" stroke-linecap="round"/>';
    } else if (cut === 'bib') {
      fBody =
        '<path d="M22 46 L10 68 L16 71 L28 48 Z" fill="#0f172a" stroke="#334155" stroke-width="1"/>' +
        '<path d="M78 46 L90 68 L84 71 L72 48 Z" fill="#0f172a" stroke="#334155" stroke-width="1"/>' +
        '<path d="M36 21 C34 29 29 37 28 47 L30 82 L70 82 L72 47 C71 37 66 29 64 21 L56 23 C53 30 47 30 44 23 Z" fill="' + primary + '" stroke="' + secondary + '" stroke-width="1.5" filter="url(#drop_' + uid + ')"/>' +
        '<g fill="' + secondary + '" opacity="0.6">' +
        '<circle cx="38" cy="48" r="1"/><circle cx="44" cy="48" r="1"/><circle cx="50" cy="48" r="1"/><circle cx="56" cy="48" r="1"/><circle cx="62" cy="48" r="1"/>' +
        '<circle cx="38" cy="56" r="1"/><circle cx="44" cy="56" r="1"/><circle cx="50" cy="56" r="1"/><circle cx="56" cy="56" r="1"/><circle cx="62" cy="56" r="1"/>' +
        '<circle cx="38" cy="74" r="1"/><circle cx="44" cy="74" r="1"/><circle cx="50" cy="74" r="1"/><circle cx="56" cy="74" r="1"/><circle cx="62" cy="74" r="1"/>' +
        '</g>';
    } else if (cut === 'half_half') {
      fBody =
        '<path d="M43 23 C34 25 24 28 17 38 C14 42 16 46 22 49 C26 50 28 47 30 44 L30 82 L50 82 L50 26 C46 26 44 24 43 23 Z" fill="' + primary + '" stroke="' + trim + '" stroke-width="1"/>' +
        '<path d="M57 23 C66 25 76 28 83 38 C86 42 84 46 78 49 C74 50 72 47 70 44 L70 82 L50 82 L50 26 C54 26 56 24 57 23 Z" fill="' + secondary + '" stroke="' + trim + '" stroke-width="1"/>' +
        '<line x1="50" y1="23" x2="50" y2="82" stroke="' + accent + '" stroke-width="1.8"/>' +
        '<path d="M43 23 Q50 31 57 23" stroke="' + accent + '" stroke-width="3" fill="none"/>';
    } else if (cut === 'dragon') {
      fBody =
        '<path d="M43 21 C34 24 24 27 17 36 L13 41 L19 44 L15 49 L23 48 C27 49 28 46 30 44 L30 82 L70 82 L70 44 C72 46 73 49 77 48 L85 49 L81 44 L87 41 L83 36 C76 27 66 24 57 21 Z" fill="url(#jg_' + uid + ')" stroke="' + trim + '" stroke-width="1.4" filter="url(#drop_' + uid + ')"/>' +
        '<polygon points="42,20 50,26 58,20 58,26 50,30 42,26" fill="' + trim + '"/>' +
        '<path d="M30 80 Q40 50 50 62 Q60 50 70 80 Q50 72 30 80 Z" fill="' + accent + '" filter="url(#glow_' + uid + ')" opacity="0.9"/>' +
        '<path d="M36 80 Q44 58 50 67 Q56 58 64 80 Z" fill="' + primary + '"/>';
    } else if (cut === 'phoenix') {
      fBody =
        '<path d="M43 23 C34 25 24 28 17 38 C14 42 16 46 22 49 C26 50 28 47 30 44 L30 82 L70 82 L70 44 C72 47 74 50 78 49 C84 46 86 42 83 38 C76 28 66 25 57 23 Z" fill="url(#jg_' + uid + ')" stroke="' + trim + '" stroke-width="1.3" filter="url(#drop_' + uid + ')"/>' +
        '<path d="M18 36 Q34 26 50 38 Q66 26 82 36 Q70 48 50 42 Q30 48 18 36 Z" fill="' + accent + '" filter="url(#glow_' + uid + ')" opacity="0.95"/>' +
        '<path d="M24 40 Q36 32 50 42 Q64 32 76 40" stroke="' + primary + '" stroke-width="2" fill="none"/>' +
        '<circle cx="50" cy="24" r="5" fill="' + accent + '" filter="url(#glow_' + uid + ')"/>';
    } else if (cut === 'chrono') {
      fBody =
        '<path d="M43 23 C34 25 24 28 17 38 C14 42 16 46 22 49 C26 50 28 47 30 44 L30 82 L70 82 L70 44 C72 47 74 50 78 49 C84 46 86 42 83 38 C76 28 66 25 57 23 Z" fill="url(#jg_' + uid + ')" stroke="' + trim + '" stroke-width="1.4" filter="url(#drop_' + uid + ')"/>' +
        '<polygon points="17,37 32,24 40,24 25,48 17,44" fill="' + secondary + '" stroke="' + trim + '" stroke-width="1.2"/>' +
        '<polygon points="83,37 68,24 60,24 75,48 83,44" fill="' + secondary + '" stroke="' + trim + '" stroke-width="1.2"/>' +
        '<polygon points="50,34 57,42 50,50 43,42" fill="' + accent + '" stroke="' + trim + '" stroke-width="1.5" filter="url(#glow_' + uid + ')"/>' +
        '<line x1="50" y1="50" x2="50" y2="78" stroke="' + trim + '" stroke-width="2" stroke-dasharray="3,2"/>';
    } else if (cut === 'golden_crest') {
      fBody =
        '<path d="M43 23 C34 25 24 28 17 38 C14 42 16 46 22 49 C26 50 28 47 30 44 L30 82 L70 82 L70 44 C72 47 74 50 78 49 C84 46 86 42 83 38 C76 28 66 25 57 23 Z" fill="url(#jg_' + uid + ')" stroke="' + trim + '" stroke-width="1.5" filter="url(#drop_' + uid + ')"/>' +
        '<polygon points="28,24 38,24 70,74 70,82 60,82 28,34" fill="' + accent + '" filter="url(#glow_' + uid + ')" opacity="0.95"/>' +
        '<line x1="38" y1="24" x2="70" y2="74" stroke="#ca8a04" stroke-width="1.5"/>' +
        '<rect x="22" y="30" width="8" height="4" rx="1" fill="#facc15" stroke="#ca8a04" stroke-width="0.8"/>' +
        '<rect x="70" y="30" width="8" height="4" rx="1" fill="#facc15" stroke="#ca8a04" stroke-width="0.8"/>' +
        '<polygon points="46,38 48,34 50,37 52,34 54,38" fill="#facc15"/>';
    } else if (cut === 'camo') {
      fBody =
        '<path d="M43 23 C34 25 24 28 17 38 C14 42 16 46 22 49 C26 50 28 47 30 44 L30 82 L70 82 L70 44 C72 47 74 50 78 49 C84 46 86 42 83 38 C76 28 66 25 57 23 Z" fill="url(#jg_' + uid + ')" stroke="' + trim + '" stroke-width="1.2" filter="url(#drop_' + uid + ')"/>' +
        '<g fill="' + secondary + '" opacity="0.85">' +
        '<polygon points="32,46 42,46 38,54 30,52"/>' +
        '<polygon points="56,42 66,42 62,50 54,48"/>' +
        '<polygon points="44,56 54,56 58,66 48,64"/>' +
        '<polygon points="32,68 40,68 36,78 30,76"/>' +
        '<polygon points="60,66 70,66 66,76 58,74"/>' +
        '</g>';
    } else {
      fBody =
        '<path d="M43 23 C34 25 24 28 17 38 C14 42 16 46 22 49 C26 50 28 47 30 44 L30 82 L70 82 L70 44 C72 47 74 50 78 49 C84 46 86 42 83 38 C76 28 66 25 57 23 Z" fill="url(#jg_' + uid + ')" stroke="' + trim + '" stroke-width="1.2" filter="url(#drop_' + uid + ')"/>' +
        '<path d="M30 44 L50 56 L70 44" stroke="' + accent + '" stroke-width="3.5" fill="none" opacity="0.95" filter="url(#glow_' + uid + ')"/>' +
        '<path d="M32 52 L50 63 L68 52" stroke="' + secondary + '" stroke-width="2.5" fill="none"/>' +
        '<path d="M43 23 Q50 31 57 23" stroke="' + trim + '" stroke-width="3.2" fill="none"/>';
    }

    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      defs + shadow + fBody + numSvg + stars + '</svg>';
  }
  if (typeof window !== 'undefined') {
    window.getDetailedJerseySvg = getDetailedJerseySvg;
  }

  // High-End 3D Stadium Pause Artwork SVG
  function getPauseArtworkSvg(curChar) {
    var isFooty = (curChar === 'footy');
    var uid = 'pause_art_' + (isFooty ? 'footy' : 'hoops');
    var primary = isFooty ? '#00f0ff' : '#ff6b00';
    var secondary = isFooty ? '#1d4ed8' : '#ea580c';
    var accent = isFooty ? '#38bdf8' : '#facc15';

    return '<svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" class="fvh-pause-artwork-svg">' +
      '<defs>' +
      '  <radialGradient id="pGlow_' + uid + '" cx="50%" cy="50%" r="50%">' +
      '    <stop offset="0%" stop-color="' + primary + '" stop-opacity="0.45"/>' +
      '    <stop offset="60%" stop-color="' + secondary + '" stop-opacity="0.18"/>' +
      '    <stop offset="100%" stop-color="' + primary + '" stop-opacity="0"/>' +
      '  </radialGradient>' +
      '  <linearGradient id="pShield_' + uid + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '    <stop offset="0%" stop-color="#1e293b"/>' +
      '    <stop offset="50%" stop-color="#0f172a"/>' +
      '    <stop offset="100%" stop-color="#020617"/>' +
      '  </linearGradient>' +
      '  <linearGradient id="pBars_' + uid + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '    <stop offset="0%" stop-color="#ffffff"/>' +
      '    <stop offset="30%" stop-color="' + accent + '"/>' +
      '    <stop offset="70%" stop-color="' + primary + '"/>' +
      '    <stop offset="100%" stop-color="' + secondary + '"/>' +
      '  </linearGradient>' +
      '  <filter id="pDrop_' + uid + '" x="-20%" y="-20%" width="140%" height="140%">' +
      '    <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.7"/>' +
      '  </filter>' +
      '  <filter id="pBloom_' + uid + '" x="-30%" y="-30%" width="160%" height="160%">' +
      '    <feGaussianBlur stdDeviation="5" result="blur"/>' +
      '    <feComposite in="SourceGraphic" in2="blur" operator="over"/>' +
      '  </filter>' +
      '</defs>' +
      '<circle cx="90" cy="90" r="82" fill="url(#pGlow_' + uid + ')"/>' +
      '<path d="M15 15 L70 70 L55 85 L0 30 Z" fill="rgba(255,255,255,0.04)"/>' +
      '<path d="M165 15 L110 70 L125 85 L180 30 Z" fill="rgba(255,255,255,0.04)"/>' +
      '<polygon points="90,16 150,42 150,118 90,164 30,118 30,42" fill="url(#pShield_' + uid + ')" stroke="' + primary + '" stroke-width="2.5" filter="url(#pDrop_' + uid + ')"/>' +
      '<polygon points="90,22 144,46 144,114 90,156 36,114 36,46" fill="none" stroke="' + accent + '" stroke-width="1" stroke-dasharray="6,4" opacity="0.6"/>' +
      '<g transform="translate(48, 122) scale(0.65)">' +
      '  <circle cx="16" cy="16" r="16" fill="#f8fafc" stroke="#334155" stroke-width="1.8"/>' +
      '  <polygon points="16,8 23,13 20,22 12,22 9,13" fill="#0f172a"/>' +
      '  <line x1="16" y1="8" x2="16" y2="1" stroke="#334155" stroke-width="1.8"/>' +
      '  <line x1="23" y1="13" x2="30" y2="11" stroke="#334155" stroke-width="1.8"/>' +
      '  <line x1="20" y1="22" x2="25" y2="29" stroke="#334155" stroke-width="1.8"/>' +
      '  <line x1="12" y1="22" x2="7" y2="29" stroke="#334155" stroke-width="1.8"/>' +
      '  <line x1="9" y1="13" x2="2" y2="11" stroke="#334155" stroke-width="1.8"/>' +
      '</g>' +
      '<g transform="translate(108, 122) scale(0.65)">' +
      '  <circle cx="16" cy="16" r="16" fill="#ea580c" stroke="#180802" stroke-width="1.8"/>' +
      '  <path d="M0 16 H32 M16 0 V32" stroke="#180802" stroke-width="1.6"/>' +
      '  <path d="M4 6 C12 10 12 22 4 26 M28 6 C20 10 20 22 28 26" stroke="#180802" stroke-width="1.4" fill="none"/>' +
      '</g>' +
      '<g filter="url(#pBloom_' + uid + ')">' +
      '  <rect x="66" y="52" width="18" height="54" rx="5" fill="url(#pBars_' + uid + ')" stroke="#ffffff" stroke-width="1.5" filter="url(#pDrop_' + uid + ')"/>' +
      '  <rect x="69" y="55" width="4" height="48" rx="2" fill="rgba(255,255,255,0.7)"/>' +
      '  <rect x="96" y="52" width="18" height="54" rx="5" fill="url(#pBars_' + uid + ')" stroke="#ffffff" stroke-width="1.5" filter="url(#pDrop_' + uid + ')"/>' +
      '  <rect x="99" y="55" width="4" height="48" rx="2" fill="rgba(255,255,255,0.7)"/>' +
      '</g>' +
      '<g transform="translate(36, 142)">' +
      '  <rect x="0" y="0" width="108" height="20" rx="4" fill="' + secondary + '" stroke="' + accent + '" stroke-width="1" filter="url(#pDrop_' + uid + ')"/>' +
      '  <text x="54" y="14" font-family="Montserrat, -apple-system, sans-serif" font-size="9" font-weight="900" fill="#ffffff" letter-spacing="1.5" text-anchor="middle">ARENA PAUSED</text>' +
      '</g>' +
      '</svg>';
  }

  // 3D Isometric TON Crystal Coin & Token Graphic SVG for Airdrop Hub
  function getAirdropHeroGraphicSvg(curChar) {
    var isFooty = (curChar === 'footy');
    var uid = 'ad_hero_' + (isFooty ? 'footy' : 'hoops');
    var tokenSym = isFooty ? '$FOOTY' : '$HOOPS';
    var primary = isFooty ? '#00f0ff' : '#f97316';
    var secondary = isFooty ? '#1d4ed8' : '#ea580c';
    var accent = isFooty ? '#38bdf8' : '#facc15';

    return '<svg width="130" height="130" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg" class="fvh-airdrop-hero-art">' +
      '<defs>' +
      '  <radialGradient id="adHalo_' + uid + '" cx="50%" cy="50%" r="50%">' +
      '    <stop offset="0%" stop-color="' + primary + '" stop-opacity="0.55"/>' +
      '    <stop offset="50%" stop-color="' + secondary + '" stop-opacity="0.22"/>' +
      '    <stop offset="100%" stop-color="' + primary + '" stop-opacity="0"/>' +
      '  </radialGradient>' +
      '  <linearGradient id="tonCoin_' + uid + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '    <stop offset="0%" stop-color="#0098ea"/>' +
      '    <stop offset="50%" stop-color="#0077b5"/>' +
      '    <stop offset="100%" stop-color="#004c75"/>' +
      '  </linearGradient>' +
      '  <linearGradient id="goldRim_' + uid + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '    <stop offset="0%" stop-color="#fef08a"/>' +
      '    <stop offset="40%" stop-color="#facc15"/>' +
      '    <stop offset="80%" stop-color="#ca8a04"/>' +
      '    <stop offset="100%" stop-color="#854d0e"/>' +
      '  </linearGradient>' +
      '  <filter id="adGlow_' + uid + '" x="-25%" y="-25%" width="150%" height="150%">' +
      '    <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="' + primary + '" flood-opacity="0.6"/>' +
      '  </filter>' +
      '  <filter id="coinShadow_' + uid + '" x="-20%" y="-20%" width="140%" height="140%">' +
      '    <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#000" flood-opacity="0.75"/>' +
      '  </filter>' +
      '</defs>' +
      '<circle cx="65" cy="65" r="58" fill="url(#adHalo_' + uid + ')"/>' +
      '<path d="M20 35 L40 35 L50 20" stroke="' + primary + '" stroke-width="1.2" opacity="0.45" stroke-dasharray="3,3"/>' +
      '<circle cx="20" cy="35" r="2" fill="' + primary + '"/>' +
      '<circle cx="50" cy="20" r="2.5" fill="' + accent + '"/>' +
      '<path d="M110 95 L90 95 L80 110" stroke="' + accent + '" stroke-width="1.2" opacity="0.45" stroke-dasharray="3,3"/>' +
      '<circle cx="110" cy="95" r="2" fill="' + accent + '"/>' +
      '<circle cx="80" cy="110" r="2.5" fill="' + primary + '"/>' +
      '<g filter="url(#coinShadow_' + uid + ')">' +
      '  <circle cx="65" cy="65" r="44" fill="url(#goldRim_' + uid + ')"/>' +
      '  <circle cx="65" cy="65" r="40" fill="url(#tonCoin_' + uid + ')"/>' +
      '  <circle cx="65" cy="65" r="38" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>' +
      '</g>' +
      (isFooty ?
        '<g transform="translate(65, 54)">' +
        '  <circle cx="0" cy="0" r="16" fill="#f8fafc" stroke="#334155" stroke-width="1.5" filter="url(#adGlow_' + uid + ')"/>' +
        '  <polygon points="0,-8 7,-3 4,6 -4,6 -7,-3" fill="#0f172a"/>' +
        '  <line x1="0" y1="-8" x2="0" y2="-15" stroke="#334155" stroke-width="1.5"/>' +
        '  <line x1="7" y1="-3" x2="14" y2="-5" stroke="#334155" stroke-width="1.5"/>' +
        '  <line x1="4" y1="6" x2="9" y2="13" stroke="#334155" stroke-width="1.5"/>' +
        '  <line x1="-4" y1="6" x2="-9" y2="13" stroke="#334155" stroke-width="1.5"/>' +
        '  <line x1="-7" y1="-3" x2="-14" y2="-5" stroke="#334155" stroke-width="1.5"/>' +
        '</g>' :
        '<g transform="translate(65, 54)">' +
        '  <circle cx="0" cy="0" r="16" fill="#ea580c" stroke="#180802" stroke-width="1.5" filter="url(#adGlow_' + uid + ')"/>' +
        '  <path d="M-16 0 H16 M0 -16 V16" stroke="#180802" stroke-width="1.5"/>' +
        '  <path d="M-12 -10 C-4 -6 -4 6 -12 10 M12 -10 C4 -6 4 6 12 10" stroke="#180802" stroke-width="1.3" fill="none"/>' +
        '</g>') +
      '<g transform="translate(65, 68)">' +
      '  <path d="M-28 4 Q-34 16 -18 24 Q-2 26 0 26 Q2 26 18 24 Q34 16 28 4" stroke="#facc15" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      '  <polygon points="-24,10 -28,8 -27,13" fill="#fef08a"/>' +
      '  <polygon points="-16,19 -20,18 -18,22" fill="#fef08a"/>' +
      '  <polygon points="24,10 28,8 27,13" fill="#fef08a"/>' +
      '  <polygon points="16,19 20,18 18,22" fill="#fef08a"/>' +
      '</g>' +
      '<g transform="translate(65, 84)">' +
      '  <rect x="-32" y="0" width="64" height="18" rx="4" fill="' + secondary + '" stroke="#ffffff" stroke-width="1" filter="url(#coinShadow_' + uid + ')"/>' +
      '  <text x="0" y="13" font-family="Montserrat, Arial Black, sans-serif" font-size="10.5" font-weight="900" fill="#ffffff" letter-spacing="1" text-anchor="middle">' + tokenSym + '</text>' +
      '</g>' +
      '<polygon points="34,22 36,17 38,22 43,24 38,26 36,31 34,26 29,24" fill="#ffffff" filter="drop-shadow(0 0 3px #fff)"/>' +
      '<polygon points="98,32 99.5,28 101,32 105,33.5 101,35 99.5,39 98,35 94,33.5" fill="#facc15" filter="drop-shadow(0 0 3px #facc15)"/>' +
      '</svg>';
  }

  // Detailed 3D Ball SVG
  function getDetailedBallSvg(item, size) {
    var isLg = size === 'large';
    var isSm = size === 'thumb' || size === 'small';
    var w = isLg ? 220 : (isSm ? 76 : 84);
    var h = isLg ? 220 : (isSm ? 76 : 84);
    var id = (typeof item === 'string') ? item : (item && (item.id || item.itemId)) || '';
    var uid = id.replace(/[^a-zA-Z0-9]/g, '_');
    var isHoops = (item && (item.category === 'balls_hoops' || item.mode === 'hoops' || (item.slot && item.slot.indexOf('hoops') !== -1))) ||
      id.indexOf('hoops') !== -1 || id.indexOf('bb_') !== -1 || id === 'ball_tidal' ||
      id === 'ball_gold_groove' || id === 'ball_cyber_grid' || id === 'ball_molten' || id === 'ball_glitch' || id === 'ball_supernova' || id === 'ball_sovereign_bb';

    if (isHoops) {
      var bStart = '#ea580c';
      var bMid = '#c2410c';
      var bEnd = '#381203';
      var seam = '#180802';
      var seamHighlight = '#78350f';
      var hasRing = false;
      var hasStar = false;
      var hasCrest = false;
      var hasPebbles = true;
      var glow = '';
      var textBadge = 'PRO';

      if (id === 'ball_hoops_street' || id === 'ball_hoops_classic') {
        bStart = '#ea580c'; bMid = '#c2410c'; bEnd = '#381203'; seam = '#180802'; seamHighlight = '#78350f'; textBadge = 'CLASSIC';
      } else if (id === 'ball_hoops_rubber') {
        bStart = '#3f3f46'; bMid = '#18181b'; bEnd = '#09090b'; seam = '#180802'; seamHighlight = '#71717a'; textBadge = 'RUBBER';
      } else if (id === 'ball_hoops_white') {
        bStart = '#ffffff'; bMid = '#e2e8f0'; bEnd = '#64748b'; seam = '#0f172a'; seamHighlight = '#38bdf8'; textBadge = 'WHITE';
      } else if (id === 'ball_hoops_asphalt') {
        bStart = '#52525b'; bMid = '#27272a'; bEnd = '#09090b'; seam = '#f97316'; seamHighlight = '#fdba74'; textBadge = 'STREET';
      } else if (id === 'ball_hoops_navy') {
        bStart = '#1e3a8a'; bMid = '#0f172a'; bEnd = '#020617'; seam = '#94a3b8'; seamHighlight = '#cbd5e1'; textBadge = 'NAVY';
      } else if (id === 'ball_hoops_crimson') {
        bStart = '#ef4444'; bMid = '#b91c1c'; bEnd = '#450a0a'; seam = '#09090b'; seamHighlight = '#fca5a5'; textBadge = 'BULL';
      } else if (id === 'ball_hoops_lime') {
        bStart = '#a3e635'; bMid = '#65a30d'; bEnd = '#14532d'; seam = '#09090b'; seamHighlight = '#bef264'; glow = 'filter="drop-shadow(0 0 7px #a3e635)"'; textBadge = 'LIME';
      } else if (id === 'ball_hoops_camo') {
        bStart = '#334155'; bMid = '#1e293b'; bEnd = '#020617'; seam = '#06b6d4'; seamHighlight = '#67e8f9'; glow = 'filter="drop-shadow(0 0 6px #06b6d4)"'; textBadge = 'CAMO';
      } else if (id === 'ball_hoops_sunset') {
        bStart = '#fde047'; bMid = '#ea580c'; bEnd = '#4a044e'; seam = '#180802'; seamHighlight = '#f59e0b'; glow = 'filter="drop-shadow(0 0 7px #f59e0b)"'; textBadge = 'SUNSET';
      } else if (id === 'ball_gold_groove' || id === 'ball_hoops_golden_elite') {
        bStart = '#78350f'; bMid = '#451a03'; bEnd = '#1c0a00'; seam = '#facc15'; seamHighlight = '#fef08a'; hasCrest = true; glow = 'filter="drop-shadow(0 0 8px #facc15)"'; textBadge = 'GOLD 24K';
      } else if (id === 'ball_cyber_grid') {
        bStart = '#0f172a'; bMid = '#020617'; bEnd = '#000000'; seam = '#00f0ff'; seamHighlight = '#22d3ee'; glow = 'filter="drop-shadow(0 0 9px #00f0ff)"'; textBadge = 'GRID';
      } else if (id === 'ball_molten' || id === 'ball_hoops_molten_fire') {
        bStart = '#fb923c'; bMid = '#ea580c'; bEnd = '#3f0707'; seam = '#fef08a'; seamHighlight = '#ef4444'; glow = 'filter="drop-shadow(0 0 9px #ea580c)"'; textBadge = 'MOLTEN';
      } else if (id === 'ball_glitch') {
        bStart = '#ec4899'; bMid = '#8b5cf6'; bEnd = '#1e1b4b'; seam = '#00f0ff'; seamHighlight = '#f472b6'; glow = 'filter="drop-shadow(0 0 9px #d946ef)"'; textBadge = 'GLITCH';
      } else if (id === 'ball_supernova' || id === 'ball_hoops_cosmic') {
        bStart = '#a78bfa'; bMid = '#4c1d95'; bEnd = '#090514'; seam = '#00f0ff'; seamHighlight = '#f43f5e'; hasRing = true; glow = 'filter="drop-shadow(0 0 10px #a855f7)"'; textBadge = 'NOVA';
      } else if (id === 'ball_sovereign_bb') {
        bStart = '#fef08a'; bMid = '#eab308'; bEnd = '#713f12'; seam = '#0f172a'; seamHighlight = '#fde047'; hasStar = true; hasRing = true; glow = 'filter="drop-shadow(0 0 11px #facc15)"'; textBadge = 'SOVEREIGN';
      } else if (id === 'ball_hoops_classic_pro') {
        bStart = '#f59e0b'; bMid = '#d97706'; bEnd = '#5c2b09'; seam = '#0f172a'; seamHighlight = '#fde047'; hasCrest = true; textBadge = 'OFFICIAL';
      } else if (id === 'ball_hoops_neon_energy') {
        bStart = '#00f0ff'; bMid = '#0284c7'; bEnd = '#051937'; seam = '#10b981'; seamHighlight = '#67e8f9'; glow = 'filter="drop-shadow(0 0 8px #00f0ff)"'; textBadge = 'NEON';
      } else if (id === 'ball_hoops_midnight') {
        bStart = '#3f3f46'; bMid = '#18181b'; bEnd = '#050507'; seam = '#00f0ff'; seamHighlight = '#38bdf8'; glow = 'filter="drop-shadow(0 0 6px #0284c7)"'; textBadge = 'STEALTH';
      } else if (id === 'ball_hoops_blaze') {
        bStart = '#fde047'; bMid = '#ea580c'; bEnd = '#541c09'; seam = '#1c1917'; seamHighlight = '#fbbf24'; glow = 'filter="drop-shadow(0 0 8px #ea580c)"'; textBadge = 'BLAZE';
      } else if (id === 'ball_hoops_chrome') {
        bStart = '#ffffff'; bMid = '#94a3b8'; bEnd = '#1e293b'; seam = '#0284c7'; seamHighlight = '#38bdf8'; textBadge = 'CHROME';
      } else if (id === 'ball_tidal') {
        bStart = '#38bdf8'; bMid = '#0284c7'; bEnd = '#082f49'; seam = '#cffafe'; seamHighlight = '#67e8f9'; textBadge = 'TIDAL';
      } else if (id === 'ball_hoops_vortex') {
        bStart = '#c084fc'; bMid = '#7c3aed'; bEnd = '#1e1b4b'; seam = '#00f0ff'; seamHighlight = '#22d3ee'; hasRing = true; glow = 'filter="drop-shadow(0 0 10px #00f0ff)"'; textBadge = 'VORTEX';
      }

      var defs = '<defs>' +
        '<radialGradient id="bb_' + uid + '" cx="32%" cy="28%" r="72%">' +
        '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/>' +
        '<stop offset="18%" stop-color="' + bStart + '"/>' +
        '<stop offset="68%" stop-color="' + bMid + '"/>' +
        '<stop offset="100%" stop-color="' + bEnd + '"/>' +
        '</radialGradient>' +
        '<linearGradient id="rim_' + uid + '" x1="0%" y1="100%" x2="100%" y2="0%">' +
        '<stop offset="0%" stop-color="rgba(255,255,255,0.4)"/>' +
        '<stop offset="100%" stop-color="rgba(255,255,255,0)"/>' +
        '</linearGradient>' +
        '<filter id="ball_drop_' + uid + '"><feDropShadow dx="0" dy="5" stdDeviation="3.5" flood-color="#000" flood-opacity="0.6"/></filter>' +
        '</defs>';

      var shadow = '<ellipse cx="50" cy="91" rx="28" ry="6" fill="#000000" opacity="0.45" filter="url(#ball_drop_' + uid + ')"/>';

      // Authentic Basketball 8-panel seams
      var seams =
        // Equatorial channel
        '<line x1="12" y1="50" x2="88" y2="50" stroke="' + seam + '" stroke-width="2.8" stroke-linecap="round"/>' +
        '<line x1="12" y1="50.6" x2="88" y2="50.6" stroke="' + seamHighlight + '" stroke-width="0.8" opacity="0.4"/>' +
        // Meridian channel
        '<line x1="50" y1="12" x2="50" y2="88" stroke="' + seam + '" stroke-width="2.8" stroke-linecap="round"/>' +
        '<line x1="50.6" y1="12" x2="50.6" y2="88" stroke="' + seamHighlight + '" stroke-width="0.8" opacity="0.4"/>' +
        // Dual curved arc channels
        '<path d="M22 24 C38 36 38 64 22 76" stroke="' + seam + '" stroke-width="2.8" fill="none" stroke-linecap="round"/>' +
        '<path d="M22.5 24 C38.5 36 38.5 64 22.5 76" stroke="' + seamHighlight + '" stroke-width="0.8" fill="none" opacity="0.4"/>' +
        '<path d="M78 24 C62 36 62 64 78 76" stroke="' + seam + '" stroke-width="2.8" fill="none" stroke-linecap="round"/>' +
        '<path d="M77.5 24 C61.5 36 61.5 64 77.5 76" stroke="' + seamHighlight + '" stroke-width="0.8" fill="none" opacity="0.4"/>';

      // Realistic Micro-pebbled grip texture
      var pebbles = hasPebbles ?
        '<g opacity="0.18" fill="#000">' +
        '<circle cx="30" cy="38" r="1"/><circle cx="34" cy="42" r="1"/><circle cx="28" cy="46" r="1"/><circle cx="36" cy="48" r="1"/>' +
        '<circle cx="64" cy="38" r="1"/><circle cx="68" cy="42" r="1"/><circle cx="62" cy="46" r="1"/><circle cx="70" cy="48" r="1"/>' +
        '<circle cx="42" cy="62" r="1"/><circle cx="46" cy="66" r="1"/><circle cx="54" cy="62" r="1"/><circle cx="58" cy="66" r="1"/>' +
        '</g>' : '';

      // Center Gold Foil Trophy / Brand Stamp
      var stamp =
        '<g transform="translate(50, 50)">' +
        '<ellipse cx="0" cy="0" rx="9" ry="5.5" fill="rgba(0,0,0,0.6)" stroke="' + seamHighlight + '" stroke-width="0.6"/>' +
        '<text x="0" y="2" font-family="Arial, sans-serif" font-size="3.2" font-weight="900" fill="' + seamHighlight + '" letter-spacing="0.5" text-anchor="middle">' + textBadge + '</text>' +
        '</g>';

      // Specular Glint & Highlights
      var highlights =
        '<ellipse cx="35" cy="30" rx="13" ry="6.5" fill="#ffffff" opacity="0.42" transform="rotate(-30, 35, 30)"/>' +
        '<circle cx="31" cy="26" r="2.8" fill="#ffffff" opacity="0.75"/>' +
        '<path d="M72 65 C82 52 82 40 76 30" stroke="url(#rim_' + uid + ')" stroke-width="2.5" fill="none" opacity="0.4"/>';

      var ring = hasRing ?
        '<ellipse cx="50" cy="50" rx="46" ry="14" stroke="#00f0ff" stroke-width="2.6" fill="none" transform="rotate(-24, 50, 50)" opacity="0.9" filter="url(#ball_drop_' + uid + ')"/>' +
        '<ellipse cx="50" cy="50" rx="46" ry="14" stroke="#ffffff" stroke-width="1.0" fill="none" transform="rotate(-24, 50, 50)" opacity="0.7"/>' : '';

      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        defs + shadow + ring +
        '<circle cx="50" cy="50" r="38" fill="url(#bb_' + uid + ')" ' + glow + '/>' +
        '<circle cx="50" cy="50" r="38" stroke="' + seam + '" stroke-width="2.2" fill="none"/>' +
        pebbles + seams + stamp + highlights + '</svg>';
    }

    // === FOOTBALLS (Soccer - 32 Geodesic Panels, 3D Double Stitches, Luxury Foil) ===
    var fStart = '#ffffff';
    var fMid = '#e2e8f0';
    var fEnd = '#1e293b';
    var patch = '#2563eb';
    var seamColor = '#1e293b';
    var seamStitch = '#93c5fd';
    var hasAura = false;
    var auraColor = '#00f0ff';
    var isGold = false;

    if (id === 'ball_classic' || id === 'ball_footy_classic') {
      fStart = '#ffffff'; fMid = '#e2e8f0'; fEnd = '#334155'; patch = '#2563eb'; seamColor = '#1e293b'; seamStitch = '#93c5fd';
    } else if (id === 'ball_training') {
      fStart = '#fdba74'; fMid = '#f97316'; fEnd = '#7c2d12'; patch = '#ea580c'; seamColor = '#18181b'; seamStitch = '#ffedd5';
    } else if (id === 'ball_street') {
      fStart = '#94a3b8'; fMid = '#64748b'; fEnd = '#1e293b'; patch = '#eab308'; seamColor = '#0f172a'; seamStitch = '#fde047';
    } else if (id === 'ball_slate') {
      fStart = '#cbd5e1'; fMid = '#475569'; fEnd = '#0f172a'; patch = '#1e293b'; seamColor = '#09090b'; seamStitch = '#94a3b8';
    } else if (id === 'ball_pitch_white') {
      fStart = '#ffffff'; fMid = '#f1f5f9'; fEnd = '#94a3b8'; patch = '#e2e8f0'; seamColor = '#38bdf8'; seamStitch = '#7dd3fc';
    } else if (id === 'ball_vortex' || id === 'ball_footy_plasma') {
      fStart = '#bef264'; fMid = '#84cc16'; fEnd = '#14532d'; patch = '#06b6d4'; seamColor = '#00f0ff'; seamStitch = '#a7f3d0'; hasAura = true; auraColor = '#84cc16';
    } else if (id === 'ball_solar') {
      fStart = '#fef08a'; fMid = '#f97316'; fEnd = '#431407'; patch = '#ef4444'; seamColor = '#facc15'; seamStitch = '#fde047'; hasAura = true; auraColor = '#ea580c';
    } else if (id === 'ball_cyan_vector') {
      fStart = '#67e8f9'; fMid = '#06b6d4'; fEnd = '#082f49'; patch = '#0284c7'; seamColor = '#00f0ff'; seamStitch = '#a5f3fc'; hasAura = true; auraColor = '#00f0ff';
    } else if (id === 'ball_cyber_hex' || id === 'ball_footy_cyber_neon') {
      fStart = '#0f172a'; fMid = '#020617'; fEnd = '#000000'; patch = '#00f0ff'; seamColor = '#0284c7'; seamStitch = '#38bdf8'; hasAura = true; auraColor = '#00f0ff';
    } else if (id === 'ball_gold_stitch' || id === 'ball_footy_gold' || id === 'ball_footy_golden_elite') {
      fStart = '#1e3a8a'; fMid = '#0f172a'; fEnd = '#020617'; patch = '#ca8a04'; seamColor = '#facc15'; seamStitch = '#fef08a'; hasAura = true; auraColor = '#eab308'; isGold = true;
    } else if (id === 'ball_hyperdrive') {
      fStart = '#0284c7'; fMid = '#1e1b4b'; fEnd = '#020617'; patch = '#38bdf8'; seamColor = '#00f0ff'; seamStitch = '#a5f3fc'; hasAura = true; auraColor = '#0284c7';
    } else if (id === 'ball_chromatic') {
      fStart = '#e0e7ff'; fMid = '#c084fc'; fEnd = '#3b0764'; patch = '#ec4899'; seamColor = '#00f0ff'; seamStitch = '#f0abfc'; hasAura = true; auraColor = '#d946ef';
    } else if (id === 'ball_magma' || id === 'ball_footy_inferno') {
      fStart = '#fb923c'; fMid = '#b91c1c'; fEnd = '#1c0a00'; patch = '#ef4444'; seamColor = '#facc15'; seamStitch = '#f97316'; hasAura = true; auraColor = '#ef4444';
    } else if (id === 'ball_nebula' || id === 'ball_footy_galactic') {
      fStart = '#c084fc'; fMid = '#4c1d95'; fEnd = '#090514'; patch = '#00f0ff'; seamColor = '#e879f9'; seamStitch = '#ffffff'; hasAura = true; auraColor = '#a855f7';
    } else if (id === 'ball_sovereign' || id === 'ball_footy_supernova') {
      fStart = '#fef08a'; fMid = '#eab308'; fEnd = '#451a03'; patch = '#ca8a04'; seamColor = '#facc15'; seamStitch = '#fde047'; hasAura = true; auraColor = '#facc15'; isGold = true;
    } else if (id === 'ball_footy_classic_pro') {
      fStart = '#ffffff'; fMid = '#cbd5e1'; fEnd = '#1e3a8a'; patch = '#1d4ed8'; seamColor = '#f59e0b'; seamStitch = '#fde047';
    } else if (id === 'ball_footy_neon') {
      fStart = '#d9f99d'; fMid = '#84cc16'; fEnd = '#14532d'; patch = '#09090b'; seamColor = '#06b6d4'; seamStitch = '#a7f3d0';
    } else if (id === 'ball_earthrise') {
      fStart = '#38bdf8'; fMid = '#0284c7'; fEnd = '#061a35'; patch = '#15803d'; seamColor = '#ffffff'; seamStitch = '#7dd3fc'; hasAura = true; auraColor = '#38bdf8';
    }

    var defs = '<defs>' +
      '<radialGradient id="fb_' + uid + '" cx="32%" cy="28%" r="72%">' +
      '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.65"/>' +
      '<stop offset="18%" stop-color="' + fStart + '"/>' +
      '<stop offset="68%" stop-color="' + fMid + '"/>' +
      '<stop offset="100%" stop-color="' + fEnd + '"/>' +
      '</radialGradient>' +
      '<radialGradient id="patchGrad_' + uid + '" cx="40%" cy="35%" r="65%">' +
      '<stop offset="0%" stop-color="' + (isGold ? '#ca8a04' : patch) + '"/>' +
      '<stop offset="100%" stop-color="' + (isGold ? '#78350f' : '#050a14') + '"/>' +
      '</radialGradient>' +
      '<filter id="ball_drop_' + uid + '"><feDropShadow dx="0" dy="5" stdDeviation="3.5" flood-color="#000" flood-opacity="0.6"/></filter>' +
      (hasAura ? '<filter id="aura_' + uid + '"><feGaussianBlur stdDeviation="6" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>' : '') +
      '</defs>';

    var shadow = '<ellipse cx="50" cy="91" rx="28" ry="6" fill="#000000" opacity="0.45" filter="url(#ball_drop_' + uid + ')"/>';

    var aura = hasAura ?
      '<circle cx="50" cy="50" r="42" fill="' + auraColor + '" opacity="0.3" filter="url(#aura_' + uid + ')"/>' : '';

    // 32-Panel Geodesic Pattern
    var panels =
      // Central Pentagon
      '<polygon points="50,33 64,43 59,58 41,58 36,43" fill="url(#patchGrad_' + uid + ')" stroke="' + seamColor + '" stroke-width="2.4"/>' +
      '<polygon points="50,33 64,43 59,58 41,58 36,43" stroke="' + seamStitch + '" stroke-width="0.7" fill="none" opacity="0.5"/>' +
      // Seam spokes connecting to outer panels
      '<line x1="50" y1="33" x2="50" y2="13" stroke="' + seamColor + '" stroke-width="2.4"/>' +
      '<line x1="50.5" y1="33" x2="50.5" y2="13" stroke="' + seamStitch + '" stroke-width="0.7" opacity="0.45"/>' +
      '<line x1="64" y1="43" x2="83" y2="36" stroke="' + seamColor + '" stroke-width="2.4"/>' +
      '<line x1="64.3" y1="43" x2="83.3" y2="36" stroke="' + seamStitch + '" stroke-width="0.7" opacity="0.45"/>' +
      '<line x1="59" y1="58" x2="73" y2="76" stroke="' + seamColor + '" stroke-width="2.4"/>' +
      '<line x1="59.3" y1="58" x2="73.3" y2="76" stroke="' + seamStitch + '" stroke-width="0.7" opacity="0.45"/>' +
      '<line x1="41" y1="58" x2="27" y2="76" stroke="' + seamColor + '" stroke-width="2.4"/>' +
      '<line x1="40.7" y1="58" x2="26.7" y2="76" stroke="' + seamStitch + '" stroke-width="0.7" opacity="0.45"/>' +
      '<line x1="36" y1="43" x2="17" y2="36" stroke="' + seamColor + '" stroke-width="2.4"/>' +
      '<line x1="35.7" y1="43" x2="16.7" y2="36" stroke="' + seamStitch + '" stroke-width="0.7" opacity="0.45"/>' +
      // Outer surrounding pentagons at perimeter
      '<polygon points="44,13 56,13 62,20 38,20" fill="url(#patchGrad_' + uid + ')" stroke="' + seamColor + '" stroke-width="2.0"/>' +
      '<polygon points="83,36 88,48 84,60 78,54" fill="url(#patchGrad_' + uid + ')" stroke="' + seamColor + '" stroke-width="2.0"/>' +
      '<polygon points="17,36 12,48 16,60 22,54" fill="url(#patchGrad_' + uid + ')" stroke="' + seamColor + '" stroke-width="2.0"/>' +
      '<polygon points="73,76 66,85 54,88 64,80" fill="url(#patchGrad_' + uid + ')" stroke="' + seamColor + '" stroke-width="1.8"/>' +
      '<polygon points="27,76 34,85 46,88 36,80" fill="url(#patchGrad_' + uid + ')" stroke="' + seamColor + '" stroke-width="1.8"/>';

    // FIFA Quality / Star Gold Crest on Central Pentagon
    var starCrest =
      '<circle cx="50" cy="48" r="3.8" fill="' + (isGold ? '#ffffff' : '#f59e0b') + '" opacity="0.9"/>' +
      '<polygon points="50,45.2 51,47.2 53.2,47.2 51.5,48.5 52.2,50.6 50,49.3 47.8,50.6 48.5,48.5 46.8,47.2 49,47.2" fill="' + patch + '"/>';

    // Specular Highlights
    var highlights =
      '<ellipse cx="35" cy="29" rx="12" ry="6" fill="#ffffff" opacity="0.5" transform="rotate(-28, 35, 29)"/>' +
      '<circle cx="31" cy="25" r="2.8" fill="#ffffff" opacity="0.85"/>';

    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      defs + shadow + aura +
      '<circle cx="50" cy="50" r="38" fill="url(#fb_' + uid + ')" stroke="' + seamColor + '" stroke-width="2.2"/>' +
      panels + starCrest + highlights + '</svg>';
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
        '<stop offset="0%" stop-color="#091428"/>' +
        '<stop offset="100%" stop-color="#1e3656"/>' +
        '</linearGradient>' +
        '<linearGradient id="grassTurf" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#24a648"/>' +
        '<stop offset="100%" stop-color="#1a8f3b"/>' +
        '</linearGradient>' +
        '<linearGradient id="floodlightBeam" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="rgba(255,255,255,0.3)"/>' +
        '<stop offset="100%" stop-color="rgba(255,255,255,0)"/>' +
        '</linearGradient>' +
        '</defs>' +
        '<rect width="160" height="52" fill="url(#stadiumSky)"/>' +
        '<polygon points="8,16 0,60 40,60 14,16" fill="url(#floodlightBeam)"/>' +
        '<polygon points="152,16 120,60 160,60 146,16" fill="url(#floodlightBeam)"/>' +
        '<rect y="30" width="160" height="24" fill="#1e293b"/>' +
        '<circle cx="20" cy="36" r="2" fill="#ef4444"/><circle cx="35" cy="34" r="2" fill="#3b82f6"/><circle cx="50" cy="38" r="2" fill="#facc15"/><circle cx="65" cy="35" r="2" fill="#ffffff"/><circle cx="80" cy="37" r="2" fill="#ef4444"/><circle cx="95" cy="34" r="2" fill="#22c55e"/><circle cx="110" cy="38" r="2" fill="#3b82f6"/><circle cx="125" cy="35" r="2" fill="#facc15"/><circle cx="140" cy="36" r="2" fill="#ffffff"/>' +
        '<circle cx="25" cy="44" r="2" fill="#3b82f6"/><circle cx="45" cy="42" r="2" fill="#ffffff"/><circle cx="60" cy="46" r="2" fill="#ef4444"/><circle cx="75" cy="43" r="2" fill="#22c55e"/><circle cx="90" cy="45" r="2" fill="#facc15"/><circle cx="105" cy="42" r="2" fill="#ef4444"/><circle cx="120" cy="44" r="2" fill="#3b82f6"/><circle cx="135" cy="43" r="2" fill="#ffffff"/>' +
        '<polygon points="12,12 16,12 18,32 10,32" fill="#64748b"/>' +
        '<rect x="7" y="8" width="14" height="6" rx="2" fill="#fef08a"/>' +
        '<polygon points="144,12 148,12 150,32 142,32" fill="#64748b"/>' +
        '<rect x="139" y="8" width="14" height="6" rx="2" fill="#fef08a"/>' +
        '<polygon points="0,50 160,50 160,100 0,100" fill="url(#grassTurf)"/>' +
        '<rect x="0" y="50" width="160" height="7" fill="rgba(255,255,255,0.06)"/>' +
        '<rect x="0" y="64" width="160" height="7" fill="rgba(255,255,255,0.06)"/>' +
        '<rect x="0" y="78" width="160" height="7" fill="rgba(255,255,255,0.06)"/>' +
        '<rect x="0" y="92" width="160" height="8" fill="rgba(255,255,255,0.06)"/>' +
        '<polygon points="26,54 134,54 146,96 14,96" fill="none" stroke="#ffffff" stroke-width="1.6" opacity="0.95"/>' +
        '<line x1="80" y1="54" x2="80" y2="96" stroke="#ffffff" stroke-width="1.6"/>' +
        '<ellipse cx="80" cy="75" rx="16" ry="7.5" fill="none" stroke="#ffffff" stroke-width="1.5"/>' +
        '<rect x="66" y="50" width="28" height="6" fill="none" stroke="#ffffff" stroke-width="1.5"/>' +
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
        '<g transform="translate(38, 44) scale(0.5)">' +
        '  <circle cx="24" cy="24" r="22" fill="#ea580c"/>' +
        '  <path d="M2 24 Q24 25.5 46 24" stroke="#1c1917" stroke-width="2.2"/>' +
        '  <path d="M24 2 Q25.5 24 24 46" stroke="#1c1917" stroke-width="2.2"/>' +
        '  <path d="M8 8 C18 14 18 34 8 40" stroke="#1c1917" stroke-width="2" fill="none"/>' +
        '  <path d="M40 8 C30 14 30 34 40 40" stroke="#1c1917" stroke-width="2" fill="none"/>' +
        '  <ellipse cx="16" cy="13" rx="8" ry="4" transform="rotate(-30 16 13)" fill="#ffffff" opacity="0.5"/>' +
        '</g>' +
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
      '<g transform="translate(38, 44) scale(0.5)">' +
      '  <circle cx="24" cy="24" r="22" fill="#ffffff"/>' +
      '  <path d="M22 17 L29 18 L32 25 L27 31 L18 29 L17 22 Z" fill="#ffffff" stroke="#475569" stroke-width="0.8"/>' +
      '  <path d="M22 17 L17 22 L11 19 L11 12 L18 10 Z" fill="#2563eb" stroke="#1e293b" stroke-width="0.8"/>' +
      '  <path d="M29 18 L36 14 L42 18 L40 25 L32 25 Z" fill="#2563eb" stroke="#1e293b" stroke-width="0.8"/>' +
      '  <path d="M18 29 L27 31 L26 38 L18 41 L14 36 Z" fill="#2563eb" stroke="#1e293b" stroke-width="0.8"/>' +
      '  <circle cx="13" cy="11" r="2" fill="#ffffff" opacity="0.8"/>' +
      '</g>' +
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

  // Detailed Thematic Bundle Loot Vault SVG (Console-Grade 3D Vaults & Star Packs)
  function getDetailedBundleSvg(item, size) {
    var isLg = size === 'large';
    var w = isLg ? 200 : 80;
    var h = isLg ? 150 : 66;
    var id = (typeof item === 'string') ? item : (item && item.id) || '';
    var uid = 'bnd_' + id.replace(/[^a-zA-Z0-9]/g, '_') + '_' + (isLg ? 'lg' : 'sm');

    var c1 = '#3b82f6', c2 = '#1d4ed8', trim = '#60a5fa', glow = 'rgba(59,130,246,0.35)';
    var icon = '🎁';
    var title = 'BUNDLE';
    var badge = 'EXCLUSIVE';

    if (id === 'bundle_footy_starter' || id === 'pack_footy' || id === 'footy') {
      c1 = '#0284c7'; c2 = '#082f49'; trim = '#00f0ff'; glow = 'rgba(0,240,255,0.45)';
      icon = '⚽'; title = 'FOOTY PACK'; badge = 'TEAM FOOTY';
    } else if (id === 'bundle_hoops_starter' || id === 'pack_hoops' || id === 'hoops') {
      c1 = '#ea580c'; c2 = '#431407'; trim = '#f97316'; glow = 'rgba(249,115,22,0.45)';
      icon = '🏀'; title = 'HOOPS PACK'; badge = 'TEAM HOOPS';
    } else if (id === 'pack_stars_starter' || id === 'stars_starter') {
      c1 = '#3b82f6'; c2 = '#1e1b4b'; trim = '#38bdf8'; glow = 'rgba(56,189,248,0.5)';
      icon = '⭐'; title = 'STAR ROOKIE'; badge = '50 STARS';
    } else if (id === 'pack_stars_champion' || id === 'stars_champion') {
      c1 = '#7c3aed'; c2 = '#2e1065'; trim = '#c084fc'; glow = 'rgba(192,132,252,0.55)';
      icon = '🌟'; title = 'STAR CHAMP'; badge = '150 STARS';
    } else if (id === 'pack_stars_legend' || id === 'stars_legend') {
      c1 = '#eab308'; c2 = '#422006'; trim = '#fde047'; glow = 'rgba(253,224,71,0.6)';
      icon = '👑'; title = 'STAR LEGEND'; badge = '350 STARS';
    } else if (id === 'pack_clash' || id === 'clash') {
      c1 = '#f59e0b'; c2 = '#451a03'; trim = '#facc15'; glow = 'rgba(250,204,21,0.5)';
      icon = '⚡'; title = 'CLASH MEGA'; badge = 'MYTHIC';
    } else if (id === 'bundle_ocean_arena') {
      c1 = '#06b6d4'; c2 = '#083344'; trim = '#22d3ee'; glow = 'rgba(34,211,238,0.4)';
      icon = '🌊'; title = 'OCEAN VAULT'; badge = 'ARENA PACK';
    } else if (id === 'bundle_mars_explorer') {
      c1 = '#dc2626'; c2 = '#450a0a'; trim = '#f87171'; glow = 'rgba(248,113,113,0.4)';
      icon = '🚀'; title = 'MARS POD'; badge = 'EXPEDITION';
    } else if (id === 'bundle_lunar_champ') {
      c1 = '#64748b'; c2 = '#0f172a'; trim = '#facc15'; glow = 'rgba(250,204,21,0.4)';
      icon = '🌕'; title = 'LUNAR VAULT'; badge = 'APOLLO VIP';
    } else if (id === 'bundle_cyber_neon') {
      c1 = '#a855f7'; c2 = '#3b0764'; trim = '#f43f5e'; glow = 'rgba(244,63,94,0.45)';
      icon = '⚡'; title = 'CYBER DECK'; badge = 'NEON CITY';
    } else if (id === 'bundle_legendary_champs') {
      c1 = '#ca8a04'; c2 = '#422006'; trim = '#fef08a'; glow = 'rgba(254,240,138,0.55)';
      icon = '👑'; title = 'ALL-STARS'; badge = 'ULTIMATE';
    }

    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 160 110" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
      '  <linearGradient id="boxGrad_' + uid + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '    <stop offset="0%" stop-color="' + c1 + '"/>' +
      '    <stop offset="100%" stop-color="' + c2 + '"/>' +
      '  </linearGradient>' +
      '  <radialGradient id="aura_' + uid + '" cx="50%" cy="50%" r="50%">' +
      '    <stop offset="0%" stop-color="' + trim + '" stop-opacity="0.45"/>' +
      '    <stop offset="100%" stop-color="' + trim + '" stop-opacity="0"/>' +
      '  </radialGradient>' +
      '  <filter id="glow_' + uid + '" x="-20%" y="-20%" width="140%" height="140%">' +
      '    <feGaussianBlur stdDeviation="4" result="blur"/>' +
      '    <feComposite in="SourceGraphic" in2="blur" operator="over"/>' +
      '  </filter>' +
      '</defs>' +
      '<!-- Background Radial Energy -->' +
      '<circle cx="80" cy="55" r="50" fill="url(#aura_' + uid + ')"/>' +
      '<!-- 3D Beveled Vault Body -->' +
      '<rect x="18" y="24" width="124" height="68" rx="14" fill="url(#boxGrad_' + uid + ')" stroke="' + trim + '" stroke-width="2.5" filter="url(#glow_' + uid + ')"/>' +
      '<rect x="24" y="30" width="112" height="56" rx="10" fill="#080c18" fill-opacity="0.55" stroke="rgba(255,255,255,0.18)" stroke-width="1.2"/>' +
      '<!-- Reinforced Corner Rivets -->' +
      '<circle cx="27" cy="33" r="2.5" fill="' + trim + '"/>' +
      '<circle cx="133" cy="33" r="2.5" fill="' + trim + '"/>' +
      '<circle cx="27" cy="83" r="2.5" fill="' + trim + '"/>' +
      '<circle cx="133" cy="83" r="2.5" fill="' + trim + '"/>' +
      '<!-- Energy Beam Seam -->' +
      '<line x1="18" y1="58" x2="142" y2="58" stroke="' + trim + '" stroke-width="2" stroke-dasharray="6 3"/>' +
      '<!-- Glowing Center Crest -->' +
      '<circle cx="80" cy="58" r="21" fill="#0b1120" stroke="' + trim + '" stroke-width="2.5"/>' +
      '<circle cx="80" cy="58" r="16" fill="' + c1 + '" fill-opacity="0.25"/>' +
      '<text x="80" y="65" font-size="20" text-anchor="middle">' + icon + '</text>' +
      '<!-- Top Ribbon Badge -->' +
      '<rect x="42" y="14" width="76" height="15" rx="7.5" fill="#090d16" stroke="' + trim + '" stroke-width="1.5"/>' +
      '<text x="80" y="24.5" font-family="Arial, sans-serif" font-weight="900" font-size="7.5" fill="#ffffff" text-anchor="middle" letter-spacing="0.8">' + badge + '</text>' +
      '<!-- Bottom Title Plate -->' +
      '<rect x="36" y="86" width="88" height="15" rx="5" fill="#020617" stroke="' + trim + '" stroke-width="1.2"/>' +
      '<text x="80" y="96.5" font-family="Impact, Arial Black" font-size="9" fill="' + trim + '" text-anchor="middle" letter-spacing="1">' + title + '</text>' +
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
      c1 = '#f6c445'; c2 = '#d97706'; c3 = '#1c1917'; c4 = '#fffbeb'; icon = '⭐';
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

    var imgId = (typeof itemOrId === 'object' && itemOrId.id) ? itemOrId.id : (typeof itemOrId === 'string' ? itemOrId : '');
    var KNOWN_STORE_ASSETS = {
      'footy_classic': 'footy_classic.png',
      'hoops_classic': 'hoops_classic.png',
      'footy_2_white': 'footy_2_white.png',
      'footy_6_crimson': 'footy_6_crimson.png',
      'footy_7_gold': 'footy_7_gold.png',
      'footy_1_sapphire': 'footy_1_sapphire.png',
      'footy_4_amber': 'footy_4_amber.png',
      'footy_5_amethyst': 'footy_5_amethyst.png',
      'footy_9_dragon': 'footy_9_dragon.png',
      'footy_3_neon': 'footy_3_neon.png',
      'footy_8_obsidian': 'footy_8_obsidian.png',
      'footy_0_tiffany': 'footy_0_tiffany.png',
      'footy_kit_star_holiday': 'footy_star_holiday.png',
      'footy_kit_star_emperor': 'footy_star_emperor.png',
      'footy_kit_star_samurai': 'footy_star_samurai.png',
      'footy_star_holiday': 'footy_star_holiday.png',
      'footy_star_emperor': 'footy_star_emperor.png',
      'footy_star_samurai': 'footy_star_samurai.png',
      'hoops_2_chicago': 'hoops_2_chicago.png',
      'hoops_3_la': 'hoops_3_la.png',
      'hoops_4_boston': 'hoops_4_boston.png',
      'hoops_6_charlotte': 'hoops_6_charlotte.png',
      'hoops_5_raptor': 'hoops_5_raptor.png',
      'hoops_0_neon': 'hoops_0_neon.png',
      'hoops_7_phoenix': 'hoops_7_phoenix.png',
      'hoops_9_beast': 'hoops_9_beast.png',
      'hoops_8_mamba': 'hoops_8_mamba.png',
      'hoops_1_miami': 'hoops_1_miami.png',
      'hoops_kit_star_holiday': 'hoops_star_holiday.png',
      'hoops_kit_star_astral': 'hoops_star_astral.png',
      'hoops_kit_star_phantom': 'hoops_star_phantom.png',
      'hoops_star_holiday': 'hoops_star_holiday.png',
      'hoops_star_astral': 'hoops_star_astral.png',
      'hoops_star_phantom': 'hoops_star_phantom.png',
      // Mapped legacy aliases for seamless compatibility
      'skin_rookie': 'footy_classic.png',
      'skin_plain_white': 'footy_2_white.png',
      'skin_crimson': 'footy_6_crimson.png',
      'skin_golden': 'footy_7_gold.png',
      'skin_solar': 'hoops_classic.png',
      'skin_electric': 'footy_5_amethyst.png',
      'skin_dragon': 'footy_9_dragon.png',
      'skin_training_bib': 'footy_3_neon.png',
      'skin_midnight': 'footy_8_obsidian.png',
      'skin_cyber': 'footy_3_neon.png',
      'skin_pixel_camo': 'footy_1_sapphire.png',
      'skin_bb_onyx': 'hoops_classic.png',
      'skin_bb_crimson': 'hoops_2_chicago.png',
      'skin_bb_gold': 'hoops_3_la.png',
      'skin_bb_forest': 'hoops_4_boston.png',
      'skin_bb_tropical': 'hoops_6_charlotte.png',
      'skin_bb_tokyo': 'hoops_0_neon.png',
      'skin_bb_amber': 'hoops_7_phoenix.png',
      'skin_bb_noir': 'hoops_8_mamba.png',
      'skin_bb_miami': 'hoops_1_miami.png',
    };

    if (cat === 'skins' || cat === 'stars' || (itemOrId && (itemOrId.category === 'skins' || itemOrId.category === 'stars')) || (id && (id.startsWith('footy_') || id.startsWith('hoops_') || id.startsWith('skin_')))) {
      var cKitId = canonItemId(imgId || id);
      var kPx = size === 'large' ? '148px' : '82px';
      var svgFallbackKit = encodeURIComponent(getDetailedJerseySvg(itemOrId, size));
      return '<div class="fvh-art-kit-wrap" style="width:' + kPx + ';height:' + kPx + ';display:flex;align-items:center;justify-content:center;position:relative;">' +
        '<img class="fvh-art-3d-img" src="store/items/kit3d_' + cKitId + '.png?v=6.0.0-release" alt="" style="max-width:100%;max-height:100%;object-fit:contain;filter:drop-shadow(0 8px 16px rgba(0,0,0,0.6));" onerror="var p=this.parentElement;if(p){p.innerHTML=decodeURIComponent(\'' + svgFallbackKit + '\');}" />' +
      '</div>';
    }

    if (cat === 'crowd') return getDetailedCrowdSvg(itemOrId, size);
    if (cat === 'boosts') return getDetailedBoostSvg(itemOrId, size);
    if (cat === 'balls' || cat === 'balls_footy' || cat === 'balls_hoops') {
      var cBallId = canonItemId(imgId || id);
      var bPx = size === 'large' ? '132px' : '74px';
      var svgFallbackBall = encodeURIComponent(getDetailedBallSvg(itemOrId, size));
      return '<div class="fvh-art-ball-wrap" style="width:' + bPx + ';height:' + bPx + ';display:flex;align-items:center;justify-content:center;position:relative;">' +
        '<img class="fvh-art-3d-img" src="store/items/ball3d_' + cBallId + '.png?v=4.0.0-aaa" alt="" style="max-width:100%;max-height:100%;object-fit:contain;filter:drop-shadow(0 8px 16px rgba(0,0,0,0.55));" onerror="var p=this.parentElement;if(p){p.innerHTML=decodeURIComponent(\'' + svgFallbackBall + '\');}" />' +
      '</div>';
    }
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


  // Physical DOM bottom spacer preventing fixed bottom navigation from obscuring scrollable cards
  function createScrollBottomSpacer() {
    var sp = document.createElement('div');
    sp.className = 'fvh-scroll-bottom-spacer';
    sp.style.width = '100%';
    sp.style.height = 'calc(env(safe-area-inset-bottom, 34px) + 95px)';
    sp.style.minHeight = 'calc(env(safe-area-inset-bottom, 34px) + 95px)';
    sp.style.flexShrink = '0';
    sp.style.pointerEvents = 'none';
    return sp;
  }

  // ==========================================
  // Official High-Fidelity Vector UI Icon Library
  // Replaces OS-dependent emojis with crisp console-grade SVGs
  // ==========================================
  function getUiIconSvg(name, size, opts) {
    var sz = size || 22;
    var active = (opts && opts.active) || false;

    // Resolve dynamic generic names
    if (name === 'ball' || name === 'nav_home') {
      var theApp = (typeof window !== 'undefined' && (window.App || window.__fvh || window.app)) || (typeof app !== 'undefined' ? app : null);
      var curTeam = (theApp && theApp.store && theApp.store.data && (theApp.store.data.selectedTeam || theApp.store.data.selectedCharacter)) || 'footy';
      name = (curTeam === 'hoops') ? 'nav_home_hoops' : 'nav_home_footy';
    }

    switch (name) {
      case 'nav_home_footy':
      case 'ball_footy':
      case 'football_ball':
      case 'football':
      case 'soccer':
      case 'soccer_ball':
      case 'ball_classic':
      case 'footy_ball':
        return '<img src="assets/icons/user_football.png?v=20261117_clean" width="' + sz + '" height="' + sz + '" style="display:inline-block;vertical-align:middle;object-fit:cover;border-radius:50%;overflow:hidden;flex-shrink:0;background:transparent;" alt="FOOTY"/>';

      case 'nav_home_hoops':
      case 'ball_hoops':
      case 'basketball_ball':
      case 'basketball':
      case 'hoops_ball':
      case 'ball_hoops_street':
      case 'ball_street':
        return '<img src="assets/icons/user_basketball.png?v=20261117_clean" width="' + sz + '" height="' + sz + '" style="display:inline-block;vertical-align:middle;object-fit:cover;border-radius:50%;overflow:hidden;flex-shrink:0;background:transparent;" alt="HOOPS"/>';

      case 'nav_inventory':
      case 'inventory':
        return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<defs>' +
          '  <linearGradient id="fvh_bag_body" x1="0%" y1="10%" x2="100%" y2="90%"><stop offset="0%" stop-color="#38bdf8"/><stop offset="25%" stop-color="#0284c7"/><stop offset="65%" stop-color="#0369a1"/><stop offset="100%" stop-color="#0c4a6e"/></linearGradient>' +
          '  <linearGradient id="fvh_bag_metal" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ffffff"/><stop offset="40%" stop-color="#e2e8f0"/><stop offset="70%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#64748b"/></linearGradient>' +
          '  <linearGradient id="fvh_bag_strap" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#334155"/><stop offset="100%" stop-color="#0f172a"/></linearGradient>' +
          '</defs>' +
          '<ellipse cx="24" cy="43" rx="19" ry="3.5" fill="#000000" opacity="0.6"/>' +
          '<path d="M15 21 C15 9 33 9 33 21" stroke="#0f172a" stroke-width="5" stroke-linecap="round" fill="none"/>' +
          '<path d="M15 21 C15 9 33 9 33 21" stroke="url(#fvh_bag_strap)" stroke-width="3.5" stroke-linecap="round" fill="none"/>' +
          '<path d="M19 11 L29 11" stroke="#38bdf8" stroke-width="1.2" stroke-linecap="round"/>' +
          '<rect x="4" y="19" width="40" height="22" rx="11" fill="url(#fvh_bag_body)" stroke="#7dd3fc" stroke-width="0.9"/>' +
          '<path d="M15 19 C9 19 4 24 4 30 C4 36 9 41 15 41 Z" fill="#0369a1" stroke="#0284c7" stroke-width="0.8"/>' +
          '<ellipse cx="14" cy="30" rx="3.5" ry="9" fill="#38bdf8" opacity="0.9"/>' +
          '<ellipse cx="14" cy="30" rx="1.8" ry="6" fill="#075985"/>' +
          '<path d="M33 19 C39 19 44 24 44 30 C44 36 39 41 33 41" stroke="#38bdf8" stroke-width="2" fill="none"/>' +
          '<path d="M17 21 C17 11 31 11 31 21" stroke="#0f172a" stroke-width="4.5" stroke-linecap="round" fill="none"/>' +
          '<path d="M17 21 C17 11 31 11 31 21" stroke="#0284c7" stroke-width="2.6" stroke-linecap="round" fill="none"/>' +
          '<rect x="15.5" y="21" width="3.2" height="3.2" rx="1" fill="url(#fvh_bag_metal)"/>' +
          '<rect x="29.3" y="21" width="3.2" height="3.2" rx="1" fill="url(#fvh_bag_metal)"/>' +
          '<path d="M11 26 L37 26" stroke="#ffffff" stroke-width="2" stroke-dasharray="1.8 1.2" stroke-linecap="round"/>' +
          '<circle cx="28" cy="26" r="2.2" fill="url(#fvh_bag_metal)"/>' +
          '<path d="M28 27 L26.5 33 L29.5 33 Z" fill="url(#fvh_bag_metal)" stroke="#475569" stroke-width="0.5"/>' +
          '<circle cx="28" cy="31" r="0.8" fill="#0f172a"/>' +
          '<path d="M20 32 L24 35 L28 32" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<path d="M6 22 C12 20 36 20 42 22" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>' +
          '</svg>';

      case 'nav_upgrades':
      case 'upgrades':
      case 'lightning':
        return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M13 2.5L4.5 13H12L11 21.5L19.5 11H12L13 2.5Z" fill="url(#fvh_nav_lt_bg)" stroke="#facc15" stroke-width="1.2" stroke-linejoin="round"/>' +
          '<defs><linearGradient id="fvh_nav_lt_bg" x1="12" y1="2.5" x2="12" y2="21.5" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#fde047"/><stop offset="60%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#ea580c"/></linearGradient></defs>' +
          '</svg>';

      case 'nav_shop':
      case 'shop':
      case 'cart':
        return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<defs>' +
          '  <linearGradient id="fvh_cart_chrome" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ffffff"/><stop offset="40%" stop-color="#e2e8f0"/><stop offset="70%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#475569"/></linearGradient>' +
          '  <linearGradient id="fvh_cart_handle" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#c084fc"/><stop offset="100%" stop-color="#7e22ce"/></linearGradient>' +
          '  <linearGradient id="fvh_cart_gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fef08a"/><stop offset="50%" stop-color="#facc15"/><stop offset="100%" stop-color="#ca8a04"/></linearGradient>' +
          '</defs>' +
          '<ellipse cx="25" cy="44" rx="15" ry="2.5" fill="#000000" opacity="0.55"/>' +
          '<g transform="translate(19, 13)">' +
          '  <polygon points="6,0 7.8,4.2 12,6 7.8,7.8 6,12 4.2,7.8 0,6 4.2,4.2" fill="url(#fvh_cart_gold)" stroke="#eab308" stroke-width="0.7"/>' +
          '  <circle cx="6" cy="6" r="2" fill="#ffffff" opacity="0.8"/>' +
          '</g>' +
          '<polygon points="10,14 40,14 36,29 14,29" fill="rgba(255,255,255,0.06)" stroke="url(#fvh_cart_chrome)" stroke-width="2" stroke-linejoin="round"/>' +
          '<line x1="16" y1="14" x2="18" y2="29" stroke="url(#fvh_cart_chrome)" stroke-width="1.1"/>' +
          '<line x1="23" y1="14" x2="24" y2="29" stroke="url(#fvh_cart_chrome)" stroke-width="1.1"/>' +
          '<line x1="30" y1="14" x2="29" y2="29" stroke="url(#fvh_cart_chrome)" stroke-width="1.1"/>' +
          '<line x1="36" y1="14" x2="33" y2="29" stroke="url(#fvh_cart_chrome)" stroke-width="1.1"/>' +
          '<line x1="12" y1="19" x2="38.5" y2="19" stroke="url(#fvh_cart_chrome)" stroke-width="1"/>' +
          '<line x1="13" y1="24" x2="37" y2="24" stroke="url(#fvh_cart_chrome)" stroke-width="1"/>' +
          '<path d="M5 12 L10 14" stroke="url(#fvh_cart_chrome)" stroke-width="2.5" stroke-linecap="round"/>' +
          '<rect x="3" y="10" width="5" height="3.5" rx="1.5" fill="url(#fvh_cart_handle)" stroke="#a855f7" stroke-width="0.8"/>' +
          '<path d="M14 29 L16 38 L34 38 L36 29" stroke="url(#fvh_cart_chrome)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<line x1="16" y1="38" x2="14" y2="41" stroke="url(#fvh_cart_chrome)" stroke-width="2"/>' +
          '<line x1="34" y1="38" x2="34" y2="41" stroke="url(#fvh_cart_chrome)" stroke-width="2"/>' +
          '<circle cx="14" cy="41" r="3.5" fill="#0f172a" stroke="#475569" stroke-width="0.8"/>' +
          '<circle cx="14" cy="41" r="1.5" fill="url(#fvh_cart_chrome)"/>' +
          '<circle cx="34" cy="41" r="3.5" fill="#0f172a" stroke="#475569" stroke-width="0.8"/>' +
          '<circle cx="34" cy="41" r="1.5" fill="url(#fvh_cart_chrome)"/>' +
          '</svg>';

      case 'nav_quests':
      case 'quests':
      case 'target':
        return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<defs>' +
          '  <linearGradient id="fvh_med_ribbon_red" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ef4444"/><stop offset="50%" stop-color="#dc2626"/><stop offset="100%" stop-color="#991b1b"/></linearGradient>' +
          '  <linearGradient id="fvh_med_ribbon_blue" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0284c7"/></linearGradient>' +
          '  <radialGradient id="fvh_med_gold" cx="35%" cy="30%" r="68%"><stop offset="0%" stop-color="#fef08a"/><stop offset="35%" stop-color="#facc15"/><stop offset="70%" stop-color="#ca8a04"/><stop offset="95%" stop-color="#854d0e"/><stop offset="100%" stop-color="#451a03"/></radialGradient>' +
          '  <linearGradient id="fvh_med_rim" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ffffff"/><stop offset="40%" stop-color="#fef08a"/><stop offset="80%" stop-color="#ca8a04"/><stop offset="100%" stop-color="#78350f"/></linearGradient>' +
          '</defs>' +
          '<ellipse cx="24" cy="45" rx="11" ry="2.5" fill="#000000" opacity="0.6"/>' +
          '<polygon points="16,3 24,19 19,20 11,3" fill="url(#fvh_med_ribbon_red)" stroke="#7f1d1d" stroke-width="0.6"/>' +
          '<polygon points="13,3 19,16 17,17 11,3" fill="url(#fvh_med_ribbon_blue)" opacity="0.9"/>' +
          '<polygon points="32,3 24,19 29,20 37,3" fill="url(#fvh_med_ribbon_red)" stroke="#7f1d1d" stroke-width="0.6"/>' +
          '<polygon points="35,3 29,16 31,17 37,3" fill="url(#fvh_med_ribbon_blue)" opacity="0.9"/>' +
          '<circle cx="24" cy="20" r="3.5" fill="none" stroke="url(#fvh_med_rim)" stroke-width="2"/>' +
          '<circle cx="24" cy="31" r="14" fill="url(#fvh_med_gold)" stroke="url(#fvh_med_rim)" stroke-width="1.8"/>' +
          '<circle cx="24" cy="31" r="11" fill="none" stroke="#fef08a" stroke-width="0.8" stroke-dasharray="2 1" opacity="0.8"/>' +
          '<g transform="translate(17, 24)">' +
          '  <polygon points="7,0 9.2,4.8 14,5.4 10.4,8.8 11.4,14 7,11.4 2.6,14 3.6,8.8 0,5.4 4.8,4.8" fill="#fef08a" stroke="#ca8a04" stroke-width="0.6"/>' +
          '  <circle cx="7" cy="7" r="2.2" fill="#ffffff" opacity="0.75"/>' +
          '</g>' +
          '<path d="M14 26 C17 21 27 21 31 24" stroke="#ffffff" stroke-width="1.4" stroke-linecap="round" opacity="0.6"/>' +
          '</svg>';

      case 'trophy':
      case 'topbar_leaderboard':
      case 'crown':
        return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<defs>' +
          '  <linearGradient id="fvh_tro_gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fffbeb"/><stop offset="25%" stop-color="#fde047"/><stop offset="55%" stop-color="#eab308"/><stop offset="85%" stop-color="#ca8a04"/><stop offset="100%" stop-color="#854d0e"/></linearGradient>' +
          '  <linearGradient id="fvh_tro_base" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#334155"/><stop offset="50%" stop-color="#1e293b"/><stop offset="100%" stop-color="#090d16"/></linearGradient>' +
          '</defs>' +
          '<ellipse cx="24" cy="45" rx="14" ry="2.5" fill="#000000" opacity="0.6"/>' +
          '<path d="M14 13 C5 13 4 25 14 27 L16 25 C9 23 10 16 16 15 Z" fill="url(#fvh_tro_gold)" stroke="#a16207" stroke-width="0.8"/>' +
          '<path d="M34 13 C43 13 44 25 34 27 L32 25 C39 23 38 16 32 15 Z" fill="url(#fvh_tro_gold)" stroke="#a16207" stroke-width="0.8"/>' +
          '<path d="M13 8 L35 8 L33 24 C33 30 28 34 24 34 C20 34 15 30 15 24 Z" fill="url(#fvh_tro_gold)" stroke="#a16207" stroke-width="1"/>' +
          '<ellipse cx="24" cy="8" rx="11" ry="3.2" fill="url(#fvh_tro_gold)" stroke="#fef08a" stroke-width="1.2"/>' +
          '<ellipse cx="24" cy="8" rx="9" ry="2.2" fill="#854d0e"/>' +
          '<path d="M21 33 L27 33 L26 38 L22 38 Z" fill="url(#fvh_tro_gold)" stroke="#a16207" stroke-width="0.7"/>' +
          '<ellipse cx="24" cy="38" rx="6" ry="1.8" fill="url(#fvh_tro_gold)"/>' +
          '<path d="M15 39 L33 39 L35 44 L13 44 Z" fill="url(#fvh_tro_base)" stroke="#475569" stroke-width="0.8"/>' +
          '<rect x="18" y="40.5" width="12" height="2.5" rx="0.5" fill="#facc15" stroke="#a16207" stroke-width="0.5"/>' +
          '<path d="M17 12 Q20 28 23 32" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" opacity="0.6"/>' +
          '<g transform="translate(14, 6)">' +
          '  <polygon points="4,0 5.2,2.8 8,4 5.2,5.2 4,8 2.8,5.2 0,4 2.8,2.8" fill="#ffffff"/>' +
          '  <circle cx="4" cy="4" r="1.2" fill="#fef08a"/>' +
          '</g>' +
          '</svg>';

      case 'settings':
      case 'topbar_settings':
        return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#00f0ff" stroke-width="1.4"/>' +
          '<path d="M19.4 15A1.65 1.65 0 0 0 19.73 16.82L20.07 17.16A2 2 0 1 1 17.24 20L16.9 19.66A1.65 1.65 0 0 0 15.08 19.33A1.65 1.65 0 0 0 14 20.88V21.5A2 2 0 1 1 10 21.5V20.88A1.65 1.65 0 0 0 8.92 19.33A1.65 1.65 0 0 0 7.1 19.66L6.76 20A2 2 0 1 1 3.93 17.17L4.27 16.83A1.65 1.65 0 0 0 4.6 15.01A1.65 1.65 0 0 0 3.05 13.93H2.5A2 2 0 1 1 2.5 9.93H3.05A1.65 1.65 0 0 0 4.6 8.85A1.65 1.65 0 0 0 4.27 7.03L3.93 6.69A2 2 0 1 1 6.76 3.86L7.1 4.2A1.65 1.65 0 0 0 8.92 4.53A1.65 1.65 0 0 0 10 2.98V2.5A2 2 0 1 1 14 2.5V2.98A1.65 1.65 0 0 0 15.08 4.53A1.65 1.65 0 0 0 16.9 4.2L17.24 3.86A2 2 0 1 1 20.07 6.69L19.73 7.03A1.65 1.65 0 0 0 19.4 8.85A1.65 1.65 0 0 0 20.95 9.93H21.5A2 2 0 1 1 21.5 13.93H20.95A1.65 1.65 0 0 0 19.4 15Z" stroke="#94a3b8" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>' +
          '</svg>';

      case 'crown':
        return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M4 18H20L18 8L13.5 13L12 6L10.5 13L6 8L4 18Z" fill="url(#fvh_crown_grad)" stroke="#facc15" stroke-width="1.2" stroke-linejoin="round"/>' +
          '<circle cx="4" cy="7" r="1.5" fill="#facc15"/>' +
          '<circle cx="12" cy="4.5" r="1.8" fill="#00f0ff"/>' +
          '<circle cx="20" cy="7" r="1.5" fill="#facc15"/>' +
          '<rect x="4" y="18" width="16" height="2.5" rx="1" fill="#eab308"/>' +
          '<defs><linearGradient id="fvh_crown_grad" x1="12" y1="6" x2="12" y2="18" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#fde047"/><stop offset="100%" stop-color="#ca8a04"/></linearGradient></defs>' +
          '</svg>';

      case 'lock':
        return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M7.5 10V7C7.5 4.51472 9.51472 2.5 12 2.5C14.4853 2.5 16.5 4.51472 16.5 7V10" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round"/>' +
          '<rect x="5" y="10" width="14" height="11" rx="2.5" fill="url(#fvh_lock_bg)" stroke="#64748b" stroke-width="1.3"/>' +
          '<circle cx="12" cy="15" r="1.5" fill="#00f0ff"/>' +
          '<path d="M12 16.5V18.5" stroke="#00f0ff" stroke-width="1.2" stroke-linecap="round"/>' +
          '<defs><linearGradient id="fvh_lock_bg" x1="12" y1="10" x2="12" y2="21" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#334155"/><stop offset="100%" stop-color="#0f172a"/></linearGradient></defs>' +
          '</svg>';

      case 'skill_power_footy':
        return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<circle cx="14" cy="14" r="12" fill="url(#fvh_sk_p1)" stroke="#00f0ff" stroke-width="1.3"/>' +
          '<path d="M14 6L17 9H11L14 6Z" fill="#00f0ff"/>' +
          '<path d="M11 9L8.5 13.5L10 16.5L13 14.5L11 9Z" fill="#ffffff"/>' +
          '<path d="M17 9L19.5 13.5L18 16.5L15 14.5L17 9Z" fill="#ffffff"/>' +
          '<path d="M13 14.5L15 14.5L14 18L13 14.5Z" fill="#00f0ff"/>' +
          '<path d="M10 16.5L11.5 21.5H16.5L18 16.5L14 18L10 16.5Z" fill="#ffffff"/>' +
          '<path d="M22 6L26 2M20 3L23 0" stroke="#facc15" stroke-width="1.5" stroke-linecap="round"/>' +
          '<defs><radialGradient id="fvh_sk_p1" cx="0.3" cy="0.3" r="0.8"><stop offset="0%" stop-color="#0369a1"/><stop offset="100%" stop-color="#082f49"/></radialGradient></defs>' +
          '</svg>';

      case 'skill_power_hoops':
        return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<circle cx="14" cy="14" r="12" fill="url(#fvh_sk_p2)" stroke="#f97316" stroke-width="1.3"/>' +
          '<path d="M2 14H26" stroke="#1c1917" stroke-width="1.4"/>' +
          '<path d="M14 2V26" stroke="#1c1917" stroke-width="1.4"/>' +
          '<path d="M5.5 5.5C9 9 9 19 5.5 22.5" stroke="#1c1917" stroke-width="1.3"/>' +
          '<path d="M22.5 5.5C19 9 19 19 22.5 22.5" stroke="#1c1917" stroke-width="1.3"/>' +
          '<path d="M22 5L26 1M19 2L23 -1" stroke="#facc15" stroke-width="1.5" stroke-linecap="round"/>' +
          '<defs><radialGradient id="fvh_sk_p2" cx="0.35" cy="0.35" r="0.75"><stop offset="0%" stop-color="#fdba74"/><stop offset="100%" stop-color="#c2410c"/></radialGradient></defs>' +
          '</svg>';

      case 'skill_stamina':
        return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<rect width="28" height="28" rx="8" fill="url(#fvh_stam_bg)" stroke="#22c55e" stroke-width="1.2"/>' +
          '<path d="M14 23.5L12.5 22.1C7.5 17.6 4.5 14.8 4.5 11.2C4.5 8.3 6.8 6 9.7 6C11.3 6 12.9 6.8 14 8C15.1 6.8 16.7 6 18.3 6C21.2 6 23.5 8.3 23.5 11.2C23.5 14.8 20.5 17.6 15.5 22.1L14 23.5Z" fill="#15803d" stroke="#4ade80" stroke-width="1.3"/>' +
          '<path d="M7.5 12.5H10.5L12 9.5L14.5 16L16.5 11.5L18 12.5H20.5" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<defs><linearGradient id="fvh_stam_bg" x1="14" y1="0" x2="14" y2="28" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#052e16"/><stop offset="100%" stop-color="#021f0e"/></linearGradient></defs>' +
          '</svg>';

      case 'skill_speed':
        return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<rect width="28" height="28" rx="8" fill="url(#fvh_spd_bg)" stroke="#38bdf8" stroke-width="1.2"/>' +
          '<path d="M4 14H18M7 9H22M5 19H15" stroke="#38bdf8" stroke-width="1.6" stroke-linecap="round"/>' +
          '<path d="M15 7L24 14L15 21" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<defs><linearGradient id="fvh_spd_bg" x1="14" y1="0" x2="14" y2="28" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#0c4a6e"/><stop offset="100%" stop-color="#082f49"/></linearGradient></defs>' +
          '</svg>';

      case 'skill_keeper_footy':
        return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<rect width="28" height="28" rx="8" fill="url(#fvh_kp_bg)" stroke="#eab308" stroke-width="1.2"/>' +
          '<path d="M9 19V11.5C9 10.7 9.7 10 10.5 10C11.3 10 12 10.7 12 11.5V16" stroke="#facc15" stroke-width="1.4" stroke-linecap="round"/>' +
          '<path d="M12 11V8.5C12 7.7 12.7 7 13.5 7C14.3 7 15 7.7 15 8.5V15" stroke="#facc15" stroke-width="1.4" stroke-linecap="round"/>' +
          '<path d="M15 11.5V9.5C15 8.7 15.7 8 16.5 8C17.3 8 18 8.7 18 9.5V16" stroke="#facc15" stroke-width="1.4" stroke-linecap="round"/>' +
          '<path d="M18 13.5C18 12.7 18.7 12 19.5 12C20.3 12 21 12.7 21 13.5V18C21 21 18.5 23.5 15.5 23.5H13C10 23.5 8 21.5 8 18.5V16" stroke="#facc15" stroke-width="1.4" stroke-linecap="round"/>' +
          '<circle cx="21" cy="7" r="2.5" fill="#00f0ff"/>' +
          '<defs><linearGradient id="fvh_kp_bg" x1="14" y1="0" x2="14" y2="28" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#422006"/><stop offset="100%" stop-color="#1c1917"/></linearGradient></defs>' +
          '</svg>';

      case 'skill_keeper_hoops':
        return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<rect width="28" height="28" rx="8" fill="url(#fvh_def_bg)" stroke="#a855f7" stroke-width="1.2"/>' +
          '<path d="M14 4L22 8V14C22 19.5 18.5 23.5 14 25C9.5 23.5 6 19.5 6 14V8L14 4Z" fill="#581c87" stroke="#c084fc" stroke-width="1.4"/>' +
          '<circle cx="14" cy="14" r="4.5" stroke="#facc15" stroke-width="1.2"/>' +
          '<path d="M14 9.5V18.5M9.5 14H18.5" stroke="#facc15" stroke-width="1.2"/>' +
          '<defs><linearGradient id="fvh_def_bg" x1="14" y1="0" x2="14" y2="28" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#3b0764"/><stop offset="100%" stop-color="#1e1b4b"/></linearGradient></defs>' +
          '</svg>';

      case 'cat_skins':
      case 'jersey':
        return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<defs>' +
          '  <linearGradient id="fvh_jers_bg" x1="6" y1="6" x2="42" y2="44" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#38bdf8"/><stop offset="48%" stop-color="#0284c7"/><stop offset="100%" stop-color="#0f172a"/></linearGradient>' +
          '  <linearGradient id="fvh_jers_trim" x1="12" y1="6" x2="36" y2="30" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#fef08a"/><stop offset="100%" stop-color="#eab308"/></linearGradient>' +
          '</defs>' +
          '<ellipse cx="24" cy="43.5" rx="14" ry="2.5" fill="#000000" opacity="0.55"/>' +
          '<path d="M16 7L5 15L10.5 21.5L14.5 18V41H33.5V18L37.5 21.5L43 15L32 7C30.2 10.2 27.3 11.6 24 11.6C20.7 11.6 17.8 10.2 16 7Z" fill="url(#fvh_jers_bg)" stroke="' + (active ? '#bef264' : '#7dd3fc') + '" stroke-width="1.8" stroke-linejoin="round"/>' +
          '<path d="M16.5 7.5C18.5 10.8 21.1 12.2 24 12.2C26.9 12.2 29.5 10.8 31.5 7.5" stroke="url(#fvh_jers_trim)" stroke-width="2.2" stroke-linecap="round"/>' +
          '<path d="M8.5 12.5L13.5 16.5M39.5 12.5L34.5 16.5" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" opacity="0.75"/>' +
          '<path d="M14.5 26H33.5" stroke="url(#fvh_jers_trim)" stroke-width="3.2"/>' +
          '<path d="M14.5 22.5H33.5" stroke="#ffffff" stroke-width="1.2" opacity="0.55"/>' +
          '<path d="M21 16.5H27" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.85"/>' +
          '</svg>';

      case 'cat_packs':
      case 'gift':
      case 'pack':
        return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<rect x="3" y="9" width="18" height="12" rx="2" fill="url(#fvh_gift_bg)" stroke="#facc15" stroke-width="1.2"/>' +
          '<rect x="2" y="6" width="20" height="3.5" rx="1" fill="#eab308" stroke="#facc15" stroke-width="1"/>' +
          '<path d="M12 6V21" stroke="#facc15" stroke-width="1.8"/>' +
          '<path d="M12 6C10.5 4 8 3.5 7.5 4.5C7 5.5 8.5 6 12 6Z" fill="#fde047" stroke="#facc15" stroke-width="0.8"/>' +
          '<path d="M12 6C13.5 4 16 3.5 16.5 4.5C17 5.5 15.5 6 12 6Z" fill="#fde047" stroke="#facc15" stroke-width="0.8"/>' +
          '<defs><linearGradient id="fvh_gift_bg" x1="12" y1="9" x2="12" y2="21" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#451a03"/><stop offset="100%" stop-color="#1e1b4b"/></linearGradient></defs>' +
          '</svg>';

      case 'coin':
      case 'coins':
        return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<circle cx="12" cy="12" r="9.5" fill="url(#fvh_coin_grad)" stroke="#ca8a04" stroke-width="1.2"/>' +
          '<circle cx="12" cy="12" r="7.2" stroke="#fef08a" stroke-width="0.9" stroke-dasharray="2 1.5"/>' +
          '<text x="12" y="15.5" font-size="10.5" font-weight="900" fill="#713f12" text-anchor="middle" font-family="Montserrat, system-ui, sans-serif">F</text>' +
          '<defs><linearGradient id="fvh_coin_grad" x1="12" y1="2.5" x2="12" y2="21.5" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#fef08a"/><stop offset="50%" stop-color="#facc15"/><stop offset="100%" stop-color="#d97706"/></linearGradient></defs>' +
          '</svg>';

      case 'ton':
        return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M12 2.5L3.5 8L12 21.5L20.5 8L12 2.5Z" fill="url(#fvh_ton_grad)" stroke="#38bdf8" stroke-width="1.2"/>' +
          '<path d="M12 2.5V21.5M3.5 8L12 13.5L20.5 8" stroke="#ffffff" stroke-width="1" stroke-linecap="round"/>' +
          '<defs><linearGradient id="fvh_ton_grad" x1="12" y1="2.5" x2="12" y2="21.5" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0284c7"/></linearGradient></defs>' +
          '</svg>';

      case 'star':
        return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="url(#fvh_star_grad)" stroke="#d97706" stroke-width="1.1" stroke-linejoin="round"/>' +
          '<defs><linearGradient id="fvh_star_grad" x1="12" y1="2" x2="12" y2="21" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#fef08a"/><stop offset="60%" stop-color="#facc15"/><stop offset="100%" stop-color="#ea580c"/></linearGradient></defs>' +
          '</svg>';

      case 'swords':
        return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M19 5L5 19M5 5L19 19" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>' +
          '<circle cx="5" cy="5" r="1.8" fill="#f43f5e"/>' +
          '<circle cx="19" cy="5" r="1.8" fill="#00f0ff"/>' +
          '<path d="M7 3L3 7M17 3L21 7" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round"/>' +
          '</svg>';

      case 'bot':
      case 'ai':
        return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<rect x="4" y="6" width="16" height="13" rx="3.5" fill="#1e293b" stroke="#38bdf8" stroke-width="1.3"/>' +
          '<line x1="12" y1="2.5" x2="12" y2="6" stroke="#38bdf8" stroke-width="1.5"/>' +
          '<circle cx="12" cy="2.5" r="1.5" fill="#38bdf8"/>' +
          '<circle cx="9" cy="11.5" r="1.6" fill="#00f0ff"/>' +
          '<circle cx="15" cy="11.5" r="1.6" fill="#00f0ff"/>' +
          '<path d="M8.5 15.5H15.5" stroke="#38bdf8" stroke-width="1.3" stroke-linecap="round"/>' +
          '</svg>';

      case 'play':
        return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">' +
          '<polygon points="7,4 20,12 7,20"/>' +
          '</svg>';

      case 'check':
        return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
          '<polyline points="20 6 9 17 4 12"/>' +
          '</svg>';

      case 'arrow_back':
        return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M19 12H5M12 19l-7-7 7-7"/>' +
          '</svg>';

      case 'profile':
      case 'user':
        return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<defs>' +
          '  <linearGradient id="fvh_prof_shield" x1="10" y1="4" x2="38" y2="44" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#1e293b"/><stop offset="55%" stop-color="#0f172a"/><stop offset="100%" stop-color="#020617"/></linearGradient>' +
          '  <linearGradient id="fvh_prof_rim" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#38bdf8"/><stop offset="50%" stop-color="#a855f7"/><stop offset="100%" stop-color="#f97316"/></linearGradient>' +
          '  <radialGradient id="fvh_prof_head" cx="40%" cy="30%" r="70%"><stop offset="0%" stop-color="#f8fafc"/><stop offset="65%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#475569"/></radialGradient>' +
          '</defs>' +
          '<ellipse cx="24" cy="44" rx="12" ry="2.2" fill="#000000" opacity="0.55"/>' +
          '<path d="M24 4L40 10V23C40 33.5 32.8 41 24 44C15.2 41 8 33.5 8 23V10L24 4Z" fill="url(#fvh_prof_shield)" stroke="url(#fvh_prof_rim)" stroke-width="2.2" stroke-linejoin="round"/>' +
          '<circle cx="24" cy="18.5" r="5.5" fill="url(#fvh_prof_head)" stroke="#e2e8f0" stroke-width="1"/>' +
          '<path d="M14.5 34.5C15.5 28.8 19.2 26 24 26C28.8 26 32.5 28.8 33.5 34.5" fill="#0284c7" stroke="#7dd3fc" stroke-width="1.4" stroke-linecap="round"/>' +
          '<polygon points="34,9 35.4,11.8 38.5,12.2 36.2,14.4 36.8,17.5 34,16 31.2,17.5 31.8,14.4 29.5,12.2 32.6,11.8" fill="#facc15" stroke="#ca8a04" stroke-width="0.6"/>' +
          '</svg>';

      default:
        return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/></svg>';
    }
  }
  window.getUiIconSvg = getUiIconSvg;
  window.getFvhCoinSvg = getFvhCoinSvg;

  // ==========================================

  var api = { bindDeps: function (deps) { _d = deps || {}; } };
  api.HERO_SKIN_PALETTES = typeof HERO_SKIN_PALETTES !== 'undefined' ? HERO_SKIN_PALETTES : null;
  api.getOfficialEmblemSvg = typeof getOfficialEmblemSvg !== 'undefined' ? getOfficialEmblemSvg : null;
  api.getPlayerAvatarHtml = typeof getPlayerAvatarHtml !== 'undefined' ? getPlayerAvatarHtml : null;
  api.getFootyAvatarSvg = typeof getFootyAvatarSvg !== 'undefined' ? getFootyAvatarSvg : null;
  api.getHoopsAvatarSvg = typeof getHoopsAvatarSvg !== 'undefined' ? getHoopsAvatarSvg : null;
  api.heroRgbToHsl = typeof heroRgbToHsl !== 'undefined' ? heroRgbToHsl : null;
  api.heroHslToRgb = typeof heroHslToRgb !== 'undefined' ? heroHslToRgb : null;
  api.initHeroBaseImages = typeof initHeroBaseImages !== 'undefined' ? initHeroBaseImages : null;
  api.drawHeroJerseyPattern = typeof drawHeroJerseyPattern !== 'undefined' ? drawHeroJerseyPattern : null;
  api.getRecoloredHeroUrl = typeof getRecoloredHeroUrl !== 'undefined' ? getRecoloredHeroUrl : null;
  api.getWardrobe3DViewerHtml = typeof getWardrobe3DViewerHtml !== 'undefined' ? getWardrobe3DViewerHtml : null;
  api.lockTelegramSwipesNow = typeof lockTelegramSwipesNow !== 'undefined' ? lockTelegramSwipesNow : null;
  api.mountWardrobe3DIntoContainer = typeof mountWardrobe3DIntoContainer !== 'undefined' ? mountWardrobe3DIntoContainer : null;
  api.getCharacterDisplayHtml = typeof getCharacterDisplayHtml !== 'undefined' ? getCharacterDisplayHtml : null;
  api.getOfficialEmblemHtml = typeof getOfficialEmblemHtml !== 'undefined' ? getOfficialEmblemHtml : null;
  api.getDetailedJerseySvg = typeof getDetailedJerseySvg !== 'undefined' ? getDetailedJerseySvg : null;
  api.getPauseArtworkSvg = typeof getPauseArtworkSvg !== 'undefined' ? getPauseArtworkSvg : null;
  api.getAirdropHeroGraphicSvg = typeof getAirdropHeroGraphicSvg !== 'undefined' ? getAirdropHeroGraphicSvg : null;
  api.getDetailedBallSvg = typeof getDetailedBallSvg !== 'undefined' ? getDetailedBallSvg : null;
  api.getDetailedStadiumSvg = typeof getDetailedStadiumSvg !== 'undefined' ? getDetailedStadiumSvg : null;
  api.getDetailedCelebrationSvg = typeof getDetailedCelebrationSvg !== 'undefined' ? getDetailedCelebrationSvg : null;
  api.getDetailedBoostSvg = typeof getDetailedBoostSvg !== 'undefined' ? getDetailedBoostSvg : null;
  api.getDetailedTrailSvg = typeof getDetailedTrailSvg !== 'undefined' ? getDetailedTrailSvg : null;
  api.getDetailedFrameSvg = typeof getDetailedFrameSvg !== 'undefined' ? getDetailedFrameSvg : null;
  api.getDetailedPackSvg = typeof getDetailedPackSvg !== 'undefined' ? getDetailedPackSvg : null;
  api.getSocialIconSvg = typeof getSocialIconSvg !== 'undefined' ? getSocialIconSvg : null;
  api.getFvhCoinSvg = typeof getFvhCoinSvg !== 'undefined' ? getFvhCoinSvg : null;
  api.getDetailedCoinsSvg = typeof getDetailedCoinsSvg !== 'undefined' ? getDetailedCoinsSvg : null;
  api.getDetailedBattlePassSvg = typeof getDetailedBattlePassSvg !== 'undefined' ? getDetailedBattlePassSvg : null;
  api.getDetailedBundleSvg = typeof getDetailedBundleSvg !== 'undefined' ? getDetailedBundleSvg : null;
  api.getDetailedCrowdSvg = typeof getDetailedCrowdSvg !== 'undefined' ? getDetailedCrowdSvg : null;
  api.renderItemArtwork = typeof renderItemArtwork !== 'undefined' ? renderItemArtwork : null;
  api.createScrollBottomSpacer = typeof createScrollBottomSpacer !== 'undefined' ? createScrollBottomSpacer : null;
  api.getUiIconSvg = typeof getUiIconSvg !== 'undefined' ? getUiIconSvg : null;
  global.FvhArtwork = api;
})(typeof window !== 'undefined' ? window : globalThis);
