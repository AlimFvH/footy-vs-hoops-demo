const fs = require('fs');
const path = require('path');
const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

async function main() {
  console.log('=== Processing User Turnaround Character Sheets ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();

  const configs = [
    {
      id: 'footy',
      file: 'assets/characters/footy_turnaround.jpg',
      numCols: 4,
      cols: [
        { name: 'front', x0: 0.00, x1: 0.25 },
        { name: 'threeq', x0: 0.25, x1: 0.50 },
        { name: 'back', x0: 0.50, x1: 0.75 },
        { name: 'side', x0: 0.75, x1: 1.00 }
      ]
    },
    {
      id: 'keeper',
      file: 'assets/characters/keeper_turnaround.jpg',
      numCols: 4,
      cols: [
        { name: 'front', x0: 0.00, x1: 0.25 },
        { name: 'threeq', x0: 0.25, x1: 0.50 },
        { name: 'back', x0: 0.50, x1: 0.75 },
        { name: 'side', x0: 0.75, x1: 1.00 }
      ]
    },
    {
      id: 'hoops',
      file: 'assets/characters/hoops_turnaround.jpg',
      numCols: 4,
      cols: [
        { name: 'front', x0: 0.00, x1: 0.25 },
        { name: 'threeq', x0: 0.25, x1: 0.50 },
        { name: 'back', x0: 0.50, x1: 0.75 },
        { name: 'side', x0: 0.75, x1: 1.00 }
      ]
    }
  ];

  for (const cfg of configs) {
    console.log(`Processing ${cfg.id}...`);
    const b64 = fs.readFileSync(cfg.file).toString('base64');
    const result = await page.evaluate(async (data) => {
      function loadImg(src) {
        return new Promise((res, rej) => {
          const img = new Image();
          img.onload = () => res(img);
          img.onerror = rej;
          img.src = src;
        });
      }

      const img = await loadImg('data:image/jpeg;base64,' + data.b64);
      const W = img.width;
      const H = img.height;

      // Draw full image
      const srcCvs = document.createElement('canvas');
      srcCvs.width = W;
      srcCvs.height = H;
      const srcCtx = srcCvs.getContext('2d');
      srcCtx.drawImage(img, 0, 0);

      const outputs = {};

      // Helper to isolate a column and apply smooth chroma/dark background removal
      function isolateFigure(x0Norm, x1Norm) {
        const sx = Math.floor(x0Norm * W);
        const sw = Math.floor((x1Norm - x0Norm) * W);
        const colCvs = document.createElement('canvas');
        colCvs.width = sw;
        colCvs.height = H;
        const colCtx = colCvs.getContext('2d');
        colCtx.drawImage(srcCvs, sx, 0, sw, H, 0, 0, sw, H);

        const imgData = colCtx.getImageData(0, 0, sw, H);
        const d = imgData.data;

        // Background removal: the background is dark stadium navy/black (#02040a to #121824) with stadium lights
        // Scan bounding box of character
        let minX = sw, maxX = 0, minY = H, maxY = 0;

        for (let y = 0; y < H; y++) {
          for (let x = 0; x < sw; x++) {
            const idx = (y * sw + x) * 4;
            const r = d[idx], g = d[idx+1], b = d[idx+2];
            const maxVal = Math.max(r, g, b);
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;

            // Detect if this pixel is background
            // Background is dark (lum < 32) or dark bluish
            const isDarkBg = (maxVal < 28) || (lum < 24 && Math.abs(r - b) < 20);
            
            // Check for stadium floodlight spots outside the character
            // Characters are mainly in vertical center of column
            const distFromCenterX = Math.abs(x - sw / 2) / (sw / 2);

            let alpha = 255;
            if (isDarkBg) {
              alpha = 0;
            } else if (lum < 42 && distFromCenterX > 0.6) {
              // Smooth fringe fade
              alpha = Math.max(0, Math.min(255, (lum - 20) * 12));
            }

            d[idx+3] = alpha;

            if (alpha > 40) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }
        colCtx.putImageData(imgData, 0, 0);

        // Crop tightly with small padding
        const pad = 8;
        const cropX = Math.max(0, minX - pad);
        const cropY = Math.max(0, minY - pad);
        const cropW = Math.min(sw - cropX, (maxX - minX) + pad * 2);
        const cropH = Math.min(H - cropY, (maxY - minY) + pad * 2);

        const finalCvs = document.createElement('canvas');
        finalCvs.width = cropW;
        finalCvs.height = cropH;
        const fCtx = finalCvs.getContext('2d');
        fCtx.drawImage(colCvs, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

        return {
          dataUrl: finalCvs.toDataURL('image/png'),
          w: cropW,
          h: cropH,
          bounds: { minX, maxX, minY, maxY }
        };
      }

      for (const col of data.cols) {
        outputs[col.name] = isolateFigure(col.x0, col.x1);
      }

      return outputs;
    }, { b64, cols: cfg.cols });

    for (const [viewName, res] of Object.entries(result)) {
      const outPath = `assets/characters/${cfg.id}_${viewName}.png`;
      const base64Data = res.dataUrl.replace(/^data:image\/png;base64,/, '');
      fs.writeFileSync(outPath, Buffer.from(base64Data, 'base64'));
      console.log(`  -> Saved ${outPath} (${res.w}x${res.h})`);
    }
  }

  await browser.close();
  console.log('=== Turnaround Processing Completed Successfully! ===');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
