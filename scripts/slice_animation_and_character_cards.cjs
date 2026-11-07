const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const artifactDir = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function sliceShowcase() {
  console.log('Slicing animation sheet and character turnarounds into individual high-res panels...');
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const animPath = path.join(artifactDir, 'footy_hoops_animation_showcase_1794062703473.jpg');
  const footySheetPath = path.join(artifactDir, 'footy_character_sheet_1794086273365.jpg');
  const hoopsSheetPath = path.join(artifactDir, 'hoops_23_character_turnaround_1794086286889.jpg');

  const animB64 = fs.readFileSync(animPath).toString('base64');
  const footySheetB64 = fs.readFileSync(footySheetPath).toString('base64');
  const hoopsSheetB64 = fs.readFileSync(hoopsSheetPath).toString('base64');

  const results = await page.evaluate(async (aB64, fSheetB64, hSheetB64) => {
    function loadImg(b64, mime = 'image/jpeg') {
      return new Promise((res) => {
        const img = new Image();
        img.onload = () => res(img);
        img.src = `data:${mime};base64,` + b64;
      });
    }

    const animImg = await loadImg(aB64);
    const footySheet = await loadImg(fSheetB64);
    const hoopsSheet = await loadImg(hSheetB64);

    const out = {};

    function crop(img, sx, sy, sw, sh, outW = sw, outH = sh) {
      const cvs = document.createElement('canvas');
      cvs.width = outW;
      cvs.height = outH;
      const ctx = cvs.getContext('2d');
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
      return cvs.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
    }

    // 1. ANIMATIONS (1376x768, 3 cols x 2 rows)
    const colW = Math.round(1376 / 3); // ~458
    const rowH = Math.round(768 / 2);  // 384

    out.footy_sprint = crop(animImg, 0, 0, colW, rowH);
    out.footy_strike = crop(animImg, colW, 0, colW, rowH);
    out.footy_tackle = crop(animImg, colW * 2, 0, 1376 - colW * 2, rowH);

    out.hoops_dunk = crop(animImg, 0, rowH, colW, rowH);
    out.hoops_steal = crop(animImg, colW, rowH, colW, rowH);
    out.hoops_crossover = crop(animImg, colW * 2, rowH, 1376 - colW * 2, rowH);

    // 2. FOOTY TURNAROUNDS (1376x768, 3 views)
    const fW = Math.round(footySheet.width / 3);
    const fH = footySheet.height;
    out.footy_front = crop(footySheet, 0, 0, fW, fH);
    out.footy_action = crop(footySheet, fW, 0, fW, fH);
    out.footy_back = crop(footySheet, fW * 2, 0, footySheet.width - fW * 2, fH);

    // 3. HOOPS TURNAROUNDS (1376x768, 3 views)
    const hW = Math.round(hoopsSheet.width / 3);
    const hH = hoopsSheet.height;
    out.hoops_front = crop(hoopsSheet, 0, 0, hW, hH);
    out.hoops_action = crop(hoopsSheet, hW, 0, hW, hH);
    out.hoops_back = crop(hoopsSheet, hW * 2, 0, hoopsSheet.width - hW * 2, hH);

    return out;
  }, animB64, footySheetB64, hoopsSheetB64);

  for (const [name, b64] of Object.entries(results)) {
    const fPath = path.join(artifactDir, `card_${name}.png`);
    fs.writeFileSync(fPath, Buffer.from(b64, 'base64'));
    console.log(`✓ Saved: ${fPath}`);
  }

  await browser.close();
  console.log('All individual high-res animation and character cards sliced successfully!');
}

sliceShowcase().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
