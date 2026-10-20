const fs = require('fs');
const { extractTransparentPng } = require('./make_transparent_png.js');

const footySrc = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/cartoon_footy_fullbody_1792539976257.jpg';
const hoopsSrc = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/cartoon_hoops_fullbody_1792539995463.jpg';

async function run() {
  console.log('Extracting Cartoon Footy transparent cutout...');
  await extractTransparentPng(footySrc, 'assets/hero_footy_cartoon.png', true);
  fs.copyFileSync('assets/hero_footy_cartoon.png', 'assets/hero_footy_real.png');

  console.log('Extracting Cartoon Hoops transparent cutout...');
  await extractTransparentPng(hoopsSrc, 'assets/hero_hoops_cartoon.png', true);
  fs.copyFileSync('assets/hero_hoops_cartoon.png', 'assets/hero_hoops_real.png');

  console.log('Finished processing cartoon transparent cutouts!');
}

run().catch(console.error);
