const fs = require('fs');
const path = require('path');

const redesignJsPath = path.join(__dirname, '..', 'js', 'redesign.js');
let jsContent = fs.readFileSync(redesignJsPath, 'utf8');

console.log('Patching js/redesign.js with enhanced arena selection & vector artwork...');

// 1. Add missing translations for default stadiums to I18N
const oldI18nRuRegex = /arenaSelectSub:\s*'[^']*',/;
const newI18nRu = `arenaSelectSub: 'Выбирайте классические стадионы с трибунами или открытые тематические миры',
    arenaDescClassicFooty: 'Традиционный стадион с ухоженным футбольным газоном, полными трибунами зрителей и прожекторами.',
    arenaDescClassicHoops: 'Классический городской стадион с деревянным паркетом, трибунами, зрителями и атмосферой матча.',`;

if (jsContent.includes("arenaDescClassicFooty")) {
    console.log('[OK] Translation keys already present in I18N');
} else {
    jsContent = jsContent.replace(oldI18nRuRegex, newI18nRu);
    console.log('[OK] Translation keys added to I18N');
}

// 2. Add default stadiums to SCENIC_ARENAS_CATALOG
const oldCatalogRegex = /var SCENIC_ARENAS_CATALOG = \[[\s\S]*?\{ id: 'std_ocean_sunset'/;
const newCatalog = `var SCENIC_ARENAS_CATALOG = [
    { id: 'std_footy_classic', category: 'stadiums', slot: 'stadium.footy', mode: 'footy', name: 'Classic Grass', rarity: 'common', price: 0, icon: '🏟️', isDefault: true, desc: tr('arenaDescClassicFooty') },
    { id: 'std_hoops_street', category: 'stadiums', slot: 'stadium.hoops', mode: 'hoops', name: 'Street Classic', rarity: 'common', price: 0, icon: '🏀', isDefault: true, desc: tr('arenaDescClassicHoops') },
    { id: 'std_ocean_sunset'`;

if (!jsContent.includes("'std_footy_classic'")) {
    jsContent = jsContent.replace(oldCatalogRegex, newCatalog);
    console.log('[OK] Default stadiums added to SCENIC_ARENAS_CATALOG');
} else {
    console.log('[OK] SCENIC_ARENAS_CATALOG already includes default stadiums');
}

// 3. Add default stadium SVGs to getDetailedStadiumSvg
const oldGetDetailedStadiumSvgRegex = /function getDetailedStadiumSvg\(item, size\) \{[\s\S]*?var id = \(item && item\.id\) \|\| '';/;
const newGetDetailedStadiumSvg = `function getDetailedStadiumSvg(item, size) {
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
    }`;

if (!jsContent.includes("'std_footy_classic'") || !jsContent.includes("Classic Grass Football Stadium")) {
    jsContent = jsContent.replace(oldGetDetailedStadiumSvgRegex, newGetDetailedStadiumSvg);
    console.log('[OK] Added default stadium SVGs to getDetailedStadiumSvg');
}

// 4. Update buildArenaSelectPage card rendering with badge distinction
const oldCardHtmlRegex = /card\.innerHTML =\s*'<div class="fvh-arena-preview-wrap">' \+[\s\S]*?'<div class="fvh-arena-actions"><\/div>';/;
const newCardHtml = `var isDefaultStadium = Boolean(arena.isDefault);
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
          '<div class="fvh-arena-actions"></div>';`;

jsContent = jsContent.replace(oldCardHtmlRegex, newCardHtml);
console.log('[OK] Arena selection card HTML updated with environment badge');

// 5. Update equipping logic in buildArenaSelectPage
const oldEquipClickRegex = /btn\.onclick = function \(\) \{\s*app\.store\.update\(function \(d\) \{[\s\S]*?\}\);\s*app\.audio\.play\('claim'\);/g;
const newEquipClick = `btn.onclick = function () {
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
            app.audio.play('claim');`;

jsContent = jsContent.replace(oldEquipClickRegex, newEquipClick);
console.log('[OK] Equipping logic updated for dual-mode syncing');

fs.writeFileSync(redesignJsPath, jsContent, 'utf8');
console.log('js/redesign.js successfully patched!');

// ============================================================================
// 6. Update css/redesign.css with arena badges & mobile touch targets
// ============================================================================
const cssPath = path.join(__dirname, '..', 'css', 'redesign.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

const arenaBadgeStyles = `
/* Environmental Category Badges (Default Stadium vs Themed World) */
.fvh-arena-badge-env {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 6px;
  margin-right: 6px;
}
.fvh-arena-badge-env.default {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.4);
}
.fvh-arena-badge-env.themed {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.4);
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.2);
}
`;

if (!cssContent.includes('.fvh-arena-badge-env')) {
    cssContent += '\n' + arenaBadgeStyles;
    console.log('[OK] Added .fvh-arena-badge-env styles to css/redesign.css');
}

fs.writeFileSync(cssPath, cssContent, 'utf8');
console.log('css/redesign.css successfully patched!');
