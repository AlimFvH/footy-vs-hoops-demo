const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

const footyInput = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/footy_character_cutout_greenscreen_1794086513673.jpg';
const hoopsInput = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/hoops_23_fullbody_portrait_1794086517426.jpg';

const footyOut = path.resolve('assets/characters/footy10_preview.png');
const hoopsOut = path.resolve('assets/characters/hoops23_preview.png');

async function processCutouts() {
  console.log('Launching headless Chrome for high-precision chroma key & despill...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Helper to process an image with chroma-key and despill
  async function keyAndSave(inputPath, outputPath, targetW = 720, targetH = 960) {
    console.log(`Processing: ${path.basename(inputPath)} -> ${path.basename(outputPath)}`);
    const fileBase64 = fs.readFileSync(inputPath).toString('base64');
    const dataUri = `data:image/jpeg;base64,${fileBase64}`;

    const pngBase64 = await page.evaluate(async (uri, tW, tH) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          // Source canvas
          const sCvs = document.createElement('canvas');
          sCvs.width = img.naturalWidth;
          sCvs.height = img.naturalHeight;
          const sCtx = sCvs.getContext('2d');
          sCtx.drawImage(img, 0, 0);

          const imgData = sCtx.getImageData(0, 0, sCvs.width, sCvs.height);
          const d = imgData.data;

          let minX = sCvs.width, maxX = 0, minY = sCvs.height, maxY = 0;

          // Hollywood chroma-key & despill
          for (let i = 0; i < d.length; i += 4) {
            const r = d[i];
            const g = d[i + 1];
            const b = d[i + 2];

            // Green key calculation
            const maxRB = Math.max(r, b);
            const keyDiff = g - maxRB;

            if (keyDiff > 25) {
              // Smooth alpha feathering
              const alpha = Math.max(0, Math.min(1, 1 - (keyDiff - 25) / 35));
              d[i + 3] = Math.round(alpha * 255);
              // Despill green fringe
              d[i + 1] = maxRB;
            } else if (keyDiff > 5) {
              // Mild despill on borderline edge
              d[i + 1] = Math.round(maxRB + keyDiff * 0.4);
            }

            // Track non-transparent bounding box
            if (d[i + 3] > 30) {
              const px = (i / 4) % sCvs.width;
              const py = Math.floor((i / 4) / sCvs.width);
              if (px < minX) minX = px;
              if (px > maxX) maxX = px;
              if (py < minY) minY = py;
              if (py > maxY) maxY = py;
            }
          }

          sCtx.putImageData(imgData, 0, 0);

          // Target canvas (720x960)
          const tCvs = document.createElement('canvas');
          tCvs.width = tW;
          tCvs.height = tH;
          const tCtx = tCvs.getContext('2d');

          const charW = maxX - minX;
          const charH = maxY - minY;

          // Fit with proper margin
          const scale = Math.min((tW * 0.82) / charW, (tH * 0.88) / charH);
          const drawW = charW * scale;
          const drawH = charH * scale;
          const drawX = (tW - drawW) / 2;
          const drawY = (tH - drawH) / 2 + (tH * 0.02); // slight downward grounding

          tCtx.drawImage(sCvs, minX, minY, charW, charH, drawX, drawY, drawW, drawH);

          resolve(tCvs.toDataURL('image/png').replace(/^data:image\/png;base64,/, ''));
        };
        img.onerror = reject;
        img.src = uri;
      });
    }, dataUri, targetW, targetH);

    fs.writeFileSync(outputPath, Buffer.from(pngBase64, 'base64'));
    console.log(`✓ Saved transparent cutout to: ${outputPath} (${fs.statSync(outputPath).size} bytes)`);
  }

  // Backup existing previews
  if (fs.existsSync(footyOut)) {
    fs.copyFileSync(footyOut, path.resolve('archive/dev_assets/footy10_preview_legacy.png'));
  }
  if (fs.existsSync(hoopsOut)) {
    fs.copyFileSync(hoopsOut, path.resolve('archive/dev_assets/hoops23_preview_legacy.png'));
  }

  await keyAndSave(footyInput, footyOut, 720, 960);
  await keyAndSave(hoopsInput, hoopsOut, 720, 960);

  await browser.close();
  console.log('All cutouts processed successfully!');
}

processCutouts().catch(err => {
  console.error('Error processing cutouts:', err);
  process.exit(1);
});
