const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const artifactDir = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function sliceFortniteSheet() {
  console.log('Slicing Fortnite animation sheet into 6 individual cards...');
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const sheetPath = path.join(artifactDir, 'footy_vs_hoops_animation_sheet_1794089657162.jpg');
  const sheetB64 = fs.readFileSync(sheetPath).toString('base64');

  const panels = await page.evaluate(async (b64) => {
    const img = new Image();
    await new Promise(res => { img.onload = res; img.src = 'data:image/jpeg;base64,' + b64; });

    const W = img.width;
    const H = img.height;
    const colW = Math.round(W / 3);
    const rowH = Math.round(H / 2);

    function crop(sx, sy, sw, sh) {
      const cvs = document.createElement('canvas');
      cvs.width = sw; cvs.height = sh;
      const ctx = cvs.getContext('2d');
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      return cvs.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
    }

    return {
      sprint: crop(0, 0, colW, rowH),
      strike: crop(colW, 0, colW, rowH),
      tackle: crop(colW * 2, 0, W - colW * 2, rowH),
      dunk: crop(0, rowH, colW, H - rowH),
      crossover: crop(colW, rowH, colW, H - rowH),
      emote: crop(colW * 2, rowH, W - colW * 2, H - rowH)
    };
  }, sheetB64);

  const filenames = {
    sprint: 'fortnite_anim_1_tactical_sprint.png',
    strike: 'fortnite_anim_2_bicycle_strike.png',
    tackle: 'fortnite_anim_3_slide_tackle.png',
    dunk: 'fortnite_anim_4_meteor_dunk.png',
    crossover: 'fortnite_anim_5_crossover_drive.png',
    emote: 'fortnite_anim_6_victory_emote.png'
  };

  for (const [key, b64] of Object.entries(panels)) {
    const fPath = path.join(artifactDir, filenames[key]);
    fs.writeFileSync(fPath, Buffer.from(b64, 'base64'));
    console.log(`✓ Sliced: ${fPath}`);
  }

  await browser.close();
  console.log('Fortnite animation panels sliced successfully!');
}

sliceFortniteSheet().catch(err => {
  console.error('Error slicing Fortnite sheet:', err);
  process.exit(1);
});
