const path = require('path');
const fs = require('fs');
const { extractTransparentPng } = require('./make_transparent_png.js');

const footySrc = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/hero_footy_fullbody_1792539181832.jpg';
const hoopsSrc = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/hero_hoops_fullbody_1792539197855.jpg';

async function run() {
  console.log('Extracting Footy transparent cutout...');
  await extractTransparentPng(footySrc, 'assets/hero_footy_cutout.png', true);
  fs.copyFileSync('assets/hero_footy_cutout.png', 'assets/hero_footy_real.png');

  console.log('Extracting Hoops transparent cutout...');
  await extractTransparentPng(hoopsSrc, 'assets/hero_hoops_cutout.png', true);
  fs.copyFileSync('assets/hero_hoops_cutout.png', 'assets/hero_hoops_real.png');

  console.log('Finished processing both transparent cutouts!');
}

run().catch(console.error);
