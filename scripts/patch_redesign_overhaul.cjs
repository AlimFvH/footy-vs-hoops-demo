const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'redesign.js');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Remove 'stars' from items and make them standard legendary skins in FvH coins
code = code.replace(/category:\s*'stars'/g, "category: 'skins'");
code = code.replace(/currency:\s*'star'/g, "currency: 'coins'");
code = code.replace(/price:\s*250,\s*currency:\s*'coins'/g, "price: 2500, currency: 'coins'");
code = code.replace(/price:\s*500,\s*currency:\s*'coins'/g, "price: 2800, currency: 'coins'");
code = code.replace(/price:\s*750,\s*currency:\s*'coins'/g, "price: 3000, currency: 'coins'");

// 2. Remove 'stars' tab from Wardrobe (buildCharactersPage)
// Replace:
// var validSlots = ['skins', 'stars'];
// with:
// var validSlots = ['skins', 'balls'];
code = code.replace("var validSlots = ['skins', 'stars'];", "var validSlots = ['skins', 'balls'];");

// In renderWardrobeCategoryTabs:
const oldWardrobeTabs = `      var slots = [
      { id: 'skins', icon: 'cat_skins', label: (isFooty ? (lang === 'ru' ? 'Формы' : 'Kits') : (lang === 'ru' ? 'Майки' : 'Tanks')) },
      { id: 'stars', icon: 'star', label: (lang === 'ru' ? 'За Звёзды' : 'For Stars') }
    ];`;

const newWardrobeTabs = `      var slots = [
      { id: 'skins', icon: 'cat_skins', label: (isFooty ? (lang === 'ru' ? 'Формы' : 'Kits') : (lang === 'ru' ? 'Майки' : 'Tanks')) },
      { id: 'balls', icon: (isFooty ? 'nav_home_footy' : 'nav_home_hoops'), label: (lang === 'ru' ? 'Мячи' : 'Balls') }
    ];`;

if (code.includes(oldWardrobeTabs)) {
  code = code.replace(oldWardrobeTabs, newWardrobeTabs);
  console.log('Replaced wardrobe tabs successfully');
} else {
  console.log('Wardrobe tabs snippet not matched directly, checking regex...');
  code = code.replace(/var slots = \[\s*\{ id: 'skins'[^\]]+\];/g, newWardrobeTabs);
}

// 3. Remove 'stars' category from Shop (buildShopPage)
const oldShopCategories = `      var categories = [
        { id: 'skins', icon: 'cat_skins', label: (shopSport === 'footy' ? (getActiveLang() === 'ru' ? 'Формы' : 'Jerseys') : (getActiveLang() === 'ru' ? 'Майки' : 'Tanks')) },
        { id: 'stars', icon: 'star', label: (getActiveLang() === 'ru' ? 'За Звёзды' : 'For Stars') },
        { id: 'bundles', icon: 'cat_packs', label: tr('catBundles') },
        { id: 'coins', icon: 'coin', label: tr('catCoins') }
      ];`;

const newShopCategories = `      var categories = [
        { id: 'skins', icon: 'cat_skins', label: (shopSport === 'footy' ? (getActiveLang() === 'ru' ? 'Формы' : 'Jerseys') : (getActiveLang() === 'ru' ? 'Майки' : 'Tanks')) },
        { id: (shopSport === 'footy' ? 'balls_footy' : 'balls_hoops'), icon: (shopSport === 'footy' ? 'nav_home_footy' : 'nav_home_hoops'), label: (getActiveLang() === 'ru' ? 'Мячи' : 'Balls') },
        { id: 'bundles', icon: 'cat_packs', label: tr('catBundles') },
        { id: 'coins', icon: 'coin', label: tr('catCoins') }
      ];`;

if (code.includes(oldShopCategories)) {
  code = code.replace(oldShopCategories, newShopCategories);
  console.log('Replaced shop categories successfully');
} else {
  console.log('Shop categories snippet not matched directly, checking regex...');
  code = code.replace(/var categories = \[\s*\{ id: 'skins'[^\]]+id: 'stars'[^\]]+\];/g, newShopCategories);
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('Patch 1 complete');
