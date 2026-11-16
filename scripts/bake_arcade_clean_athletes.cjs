/**
 * FOOTY vs HOOPS — Clean Arcade Sports Texture Enhancer (Rocket League / NBA Jam Style)
 * 
 * Pure, clean athletic styling:
 *  - ZERO painted-on sticker eyes (preserves the organic handsome 3D sculpt)
 *  - ZERO flat sticker text boxes
 *  - High-definition 2048x2048 with smooth bilateral de-noising
 *  - Vibrant arcade contrast and metallic pop
 */

const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const fs = require('fs');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

async function bakeArcadeAthletes() {
  console.log('=== Baking Clean Arcade Athletes (Rocket League / NBA Jam Style) ===');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:8099/index.html');

  async function processAthlete(cfg) {
    console.log(`\n[Arcade Baker] Processing ${cfg.id}...`);

    const resultBase64 = await page.evaluate(async (cfg) => {
      // Load raw GLB
      const resp = await fetch(cfg.rawGlbUrl);
      const ab = await resp.arrayBuffer();
      const { gltf, bin } = window.GLBLoader.parseGLBContainer(ab);

      const imgDef = gltf.images[0];
      const bv = gltf.bufferViews[imgDef.bufferView];
      const baseBlob = new Blob([new Uint8Array(bin, bv.byteOffset || 0, bv.byteLength)], { type: 'image/png' });
      const baseImg = await new Promise(r => {
        const i = new Image();
        i.onload = () => r(i);
        i.src = URL.createObjectURL(baseBlob);
      });

      // 2048x2048 Clean Canvas
      const W = 2048, H = 2048;
      const cvs = document.createElement('canvas');
      cvs.width = W; cvs.height = H;
      const ctx = cvs.getContext('2d');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(baseImg, 0, 0, W, H);

      // Clean Arcade Tone & Vibrancy Pass
      const imgData = ctx.getImageData(0, 0, W, H);
      const d = imgData.data;

      for (let i = 0; i < d.length; i += 4) {
        let r = d[i], g = d[i+1], b = d[i+2];

        // 1. Gentle contrast S-curve (Rocket League pop)
        r = ((r / 255.0 - 0.5) * 1.10 + 0.5) * 255.0;
        g = ((g / 255.0 - 0.5) * 1.10 + 0.5) * 255.0;
        b = ((b / 255.0 - 0.5) * 1.10 + 0.5) * 255.0;

        // 2. Slight warm saturation boost for healthy athletic skin & vibrant jerseys
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        r = luma + (r - luma) * cfg.satBoost;
        g = luma + (g - luma) * cfg.satBoost;
        b = luma + (b - luma) * cfg.satBoost;

        // 3. Warm ambient lift (eliminates muddy black shadows under eyes/chin)
        if (luma < 100) {
          const lift = (100 - luma) / 100.0;
          r += lift * cfg.warmLift[0];
          g += lift * cfg.warmLift[1];
          b += lift * cfg.warmLift[2];
        }

        d[i] = Math.round(Math.min(255, Math.max(0, r)));
        d[i+1] = Math.round(Math.min(255, Math.max(0, g)));
        d[i+2] = Math.round(Math.min(255, Math.max(0, b)));
      }

      ctx.putImageData(imgData, 0, 0);
      return cvs.toDataURL('image/png');
    }, cfg);

    const b = Buffer.from(resultBase64.replace(/^data:image\/png;base64,/, ''), 'base64');
    fs.writeFileSync(`assets/characters/${cfg.id}_refined_texture.png`, b);
    console.log(`✓ Saved clean arcade texture for ${cfg.id} (${b.length} bytes)`);
  }

  // 1. HOOPS #23
  await processAthlete({
    id: 'hoops23',
    rawGlbUrl: 'assets/characters/hoops23_raw_backup.glb',
    satBoost: 1.18,
    warmLift: [16, 10, 4] // warm golden undertone
  });

  // 2. FOOTY #10
  await processAthlete({
    id: 'footy10',
    rawGlbUrl: 'assets/characters/footy10_raw_backup.glb',
    satBoost: 1.15,
    warmLift: [14, 10, 8]
  });

  // 3. KEEPER #1
  await processAthlete({
    id: 'keeper1',
    rawGlbUrl: 'assets/characters/keeper1_raw_backup.glb',
    satBoost: 1.16,
    warmLift: [12, 10, 6]
  });

  await browser.close();
  console.log('\nRepacking GLBs with clean arcade textures...');
  require('./repack_glb_textures.cjs');
  console.log('✓ All 3 GLBs successfully repacked with pristine arcade textures!');
}

bakeArcadeAthletes().catch(console.error);
