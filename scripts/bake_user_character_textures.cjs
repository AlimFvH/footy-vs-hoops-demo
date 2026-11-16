const fs = require('fs');
const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

async function main() {
  console.log('=== Baking Precision Character Textures from User Turnaround Sheets ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();

  const sheetConfigs = [
    {
      id: 'footy',
      file: 'assets/characters/footy_turnaround.jpg',
      // Centers: head 135, torso 123, shorts 129; Back head 600, torso 586, shorts 594
      face: { sx: 135 - 75, sy: 16, sw: 150, sh: 190 },
      hairBack: { sx: 600 - 75, sy: 16, sw: 150, sh: 190 },
      jerseyFront: { sx: 123 - 85, sy: 195, sw: 170, sh: 260 },
      jerseyBack: { sx: 586 - 85, sy: 195, sw: 170, sh: 260 },
      shortsFront: { sx: 129 - 80, sy: 445, sw: 160, sh: 165 },
      shortsBack: { sx: 594 - 80, sy: 445, sw: 160, sh: 165 },
      legsFront: { sx: 129 - 80, sy: 615, sw: 160, sh: 300 },
      legsBack: { sx: 594 - 80, sy: 615, sw: 160, sh: 300 }
    },
    {
      id: 'keeper',
      file: 'assets/characters/keeper_turnaround.jpg',
      // Centers: head 108, torso 127, shorts 144; Back head 652, torso 650, shorts 643
      face: { sx: 108 - 75, sy: 10, sw: 150, sh: 185 },
      hairBack: { sx: 652 - 75, sy: 10, sw: 150, sh: 185 },
      jerseyFront: { sx: 127 - 85, sy: 185, sw: 170, sh: 240 },
      jerseyBack: { sx: 650 - 85, sy: 185, sw: 170, sh: 240 },
      shortsFront: { sx: 144 - 80, sy: 420, sw: 160, sh: 155 },
      shortsBack: { sx: 643 - 80, sy: 420, sw: 160, sh: 155 },
      legsFront: { sx: 144 - 80, sy: 575, sw: 160, sh: 280 },
      legsBack: { sx: 643 - 80, sy: 575, sw: 160, sh: 280 }
    },
    {
      id: 'hoops',
      file: 'assets/characters/hoops_turnaround.jpg',
      // Centers: head 114, torso 115, shorts 119; Back head 655, torso 644, shorts 616
      face: { sx: 114 - 70, sy: 10, sw: 140, sh: 185 },
      hairBack: { sx: 655 - 70, sy: 10, sw: 140, sh: 185 },
      jerseyFront: { sx: 115 - 80, sy: 185, sw: 160, sh: 240 },
      jerseyBack: { sx: 644 - 80, sy: 185, sw: 160, sh: 240 },
      shortsFront: { sx: 119 - 80, sy: 420, sw: 160, sh: 165 },
      shortsBack: { sx: 616 - 80, sy: 420, sw: 160, sh: 165 },
      legsFront: { sx: 119 - 80, sy: 585, sw: 160, sh: 280 },
      legsBack: { sx: 616 - 80, sy: 585, sw: 160, sh: 280 }
    }
  ];

  for (const cfg of sheetConfigs) {
    const b64 = fs.readFileSync(cfg.file).toString('base64');
    const textures = await page.evaluate(async (data) => {
      function loadImg(src) {
        return new Promise((res, rej) => {
          const img = new Image();
          img.onload = () => res(img);
          img.onerror = rej;
          img.src = src;
        });
      }

      const img = await loadImg('data:image/jpeg;base64,' + data.b64);
      const out = {};

      function crop(bounds, targetW = 512, targetH = 512) {
        const c = document.createElement('canvas');
        c.width = targetW;
        c.height = targetH;
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, bounds.sx, bounds.sy, bounds.sw, bounds.sh, 0, 0, targetW, targetH);
        return c.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
      }

      // 1. Jersey Front (512x512)
      out.jerseyFront = crop(data.cfg.jerseyFront, 512, 512);

      // 2. Jersey Back (512x512)
      out.jerseyBack = crop(data.cfg.jerseyBack, 512, 512);

      // 3. Face (512x512)
      out.face = crop(data.cfg.face, 512, 512);

      // 4. Hair Back (512x512)
      out.hairBack = crop(data.cfg.hairBack, 512, 512);

      // 5. Shorts Front (512x512)
      out.shortsFront = crop(data.cfg.shortsFront, 512, 512);

      // 6. Shorts Back (512x512)
      out.shortsBack = crop(data.cfg.shortsBack, 512, 512);

      // 7. Full Body Front Texture Atlas (512x1024)
      const atlasCvs = document.createElement('canvas');
      atlasCvs.width = 1024;
      atlasCvs.height = 1024;
      const aCtx = atlasCvs.getContext('2d');
      // [Front Jersey, Back Jersey]
      aCtx.drawImage(img, data.cfg.jerseyFront.sx, data.cfg.jerseyFront.sy, data.cfg.jerseyFront.sw, data.cfg.jerseyFront.sh, 0, 0, 512, 512);
      aCtx.drawImage(img, data.cfg.jerseyBack.sx, data.cfg.jerseyBack.sy, data.cfg.jerseyBack.sw, data.cfg.jerseyBack.sh, 512, 0, 512, 512);
      // [Front Face, Back Hair]
      aCtx.drawImage(img, data.cfg.face.sx, data.cfg.face.sy, data.cfg.face.sw, data.cfg.face.sh, 0, 512, 512, 512);
      aCtx.drawImage(img, data.cfg.hairBack.sx, data.cfg.hairBack.sy, data.cfg.hairBack.sw, data.cfg.hairBack.sh, 512, 512, 512, 512);
      out.masterAtlas = atlasCvs.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');

      return out;
    }, { b64, cfg });

    for (const [texName, base64] of Object.entries(textures)) {
      const outPath = `assets/characters/${cfg.id}_${texName}.png`;
      fs.writeFileSync(outPath, Buffer.from(base64, 'base64'));
      console.log(`  Saved texture: ${outPath}`);
    }
  }

  await browser.close();
  console.log('=== All Character Textures Baked Successfully with Exact Alignment! ===');
}

main().catch(console.error);
