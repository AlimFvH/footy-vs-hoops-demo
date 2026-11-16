const fs = require('fs');
const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();

  const characters = [
    {
      id: 'footy',
      file: 'assets/characters/footy_turnaround.jpg',
      splits: [0, 275, 470, 740, 935]
    },
    {
      id: 'keeper',
      file: 'assets/characters/keeper_turnaround.jpg',
      splits: [0, 310, 500, 800, 1024]
    },
    {
      id: 'hoops',
      file: 'assets/characters/hoops_turnaround.jpg',
      splits: [0, 310, 500, 800, 1024]
    }
  ];

  const viewNames = ['front', 'threeq', 'back', 'side'];

  for (const charCfg of characters) {
    console.log(`Extracting pristine cutouts for ${charCfg.id}...`);
    const b64 = fs.readFileSync(charCfg.file).toString('base64');

    const cutouts = await page.evaluate(async (data) => {
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

      const mainCvs = document.createElement('canvas');
      mainCvs.width = W;
      mainCvs.height = H;
      const mCtx = mainCvs.getContext('2d');
      mCtx.drawImage(img, 0, 0);

      const results = {};

      for (let i = 0; i < 4; i++) {
        const x0 = data.splits[i];
        const x1 = data.splits[i + 1];
        const w = x1 - x0;

        const colCvs = document.createElement('canvas');
        colCvs.width = w;
        colCvs.height = H;
        const cCtx = colCvs.getContext('2d');
        cCtx.drawImage(mainCvs, x0, 0, w, H, 0, 0, w, H);

        const imgData = cCtx.getImageData(0, 0, w, H);
        const d = imgData.data;

        // Flood fill from outer corners to remove stadium background and floodlights
        const visited = new Uint8Array(w * H);
        const isBg = new Uint8Array(w * H);
        const queue = [];

        // Check if a pixel is definitely background
        function isPixelBg(idx, x, y) {
          const r = d[idx], g = d[idx + 1], b = d[idx + 2];
          const maxRGB = Math.max(r, g, b);
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;

          // Pure dark background
          if (maxRGB < 32) return true;
          // Blue stadium spotlight in background (bluish, but not jersey/skin)
          if (b > r + 30 && b > g + 20 && lum < 90) {
            // Check if far from center (stadium lights are near sides)
            const cx = w * 0.5;
            if (Math.abs(x - cx) > w * 0.32) return true;
          }
          // Floor reflection (bottom 10% with dark blue specular)
          if (y > H * 0.93 && lum < 60) return true;

          return false;
        }

        // Push border pixels
        for (let x = 0; x < w; x++) {
          queue.push(x, 0);
          queue.push(x, H - 1);
        }
        for (let y = 0; y < H; y++) {
          queue.push(0, y);
          queue.push(w - 1, y);
        }

        let qHead = 0;
        while (qHead < queue.length) {
          const qx = queue[qHead++];
          const qy = queue[qHead++];
          const pIdx = qy * w + qx;
          if (visited[pIdx]) continue;
          visited[pIdx] = 1;

          const dIdx = pIdx * 4;
          if (isPixelBg(dIdx, qx, qy)) {
            isBg[pIdx] = 1;

            // Expand 4-neighbors
            if (qx > 0 && !visited[pIdx - 1]) { queue.push(qx - 1, qy); }
            if (qx < w - 1 && !visited[pIdx + 1]) { queue.push(qx + 1, qy); }
            if (qy > 0 && !visited[pIdx - w]) { queue.push(qx, qy - 1); }
            if (qy < H - 1 && !visited[pIdx + w]) { queue.push(qx, qy + 1); }
          }
        }

        // Apply alpha and tight bounding box
        let minX = w, maxX = 0, minY = H, maxY = 0;
        for (let y = 0; y < H; y++) {
          for (let x = 0; x < w; x++) {
            const pIdx = y * w + x;
            const dIdx = pIdx * 4;

            if (isBg[pIdx]) {
              d[dIdx + 3] = 0;
            } else {
              // Soft edge feathering near background
              let neighborBg = 0;
              if (x > 0 && isBg[pIdx - 1]) neighborBg++;
              if (x < w - 1 && isBg[pIdx + 1]) neighborBg++;
              if (y > 0 && isBg[pIdx - w]) neighborBg++;
              if (y < H - 1 && isBg[pIdx + w]) neighborBg++;

              if (neighborBg > 0) {
                d[dIdx + 3] = Math.round(255 * (1 - neighborBg * 0.18));
              }

              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }
        cCtx.putImageData(imgData, 0, 0);

        // Crop tightly with 6px padding
        const pad = 6;
        const cropX = Math.max(0, minX - pad);
        const cropY = Math.max(0, minY - pad);
        const cropW = Math.min(w - cropX, (maxX - minX) + pad * 2);
        const cropH = Math.min(H - cropY, (maxY - minY) + pad * 2);

        const outCvs = document.createElement('canvas');
        outCvs.width = cropW;
        outCvs.height = cropH;
        const oCtx = outCvs.getContext('2d');
        oCtx.drawImage(colCvs, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

        results[data.viewNames[i]] = {
          b64: outCvs.toDataURL('image/png').replace(/^data:image\/png;base64,/, ''),
          w: cropW,
          h: cropH
        };
      }

      return results;
    }, { b64, splits: charCfg.splits, viewNames });

    for (const [vName, res] of Object.entries(cutouts)) {
      const p = `assets/characters/${charCfg.id}_${vName}.png`;
      fs.writeFileSync(p, Buffer.from(res.b64, 'base64'));
      console.log(`  Saved ${p} (${res.w}x${res.h})`);
    }
  }

  await browser.close();
}

main().catch(console.error);
