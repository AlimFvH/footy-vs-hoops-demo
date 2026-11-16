const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();

  for (const f of ['footy_turnaround.jpg', 'keeper_turnaround.jpg', 'hoops_turnaround.jpg']) {
    const b64 = fs.readFileSync('assets/characters/' + f).toString('base64');
    const data = await page.evaluate(b => new Promise(res => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const id = ctx.getImageData(0, 0, c.width, c.height).data;
        const colVals = [];
        for (let x = 0; x < c.width; x++) {
          let count = 0;
          for (let y = Math.floor(c.height * 0.2); y < Math.floor(c.height * 0.7); y++) {
            const idx = (y * c.width + x) * 4;
            const r = id[idx], g = id[idx+1], b = id[idx+2];
            if (r > 50 || g > 50 || b > 50) count++;
          }
          colVals.push(count);
        }
        res({ w: c.width, h: c.height, colVals });
      };
      img.src = 'data:image/jpeg;base64,' + b;
    }), b64);

    const quarter = Math.floor(data.w / 4);
    const peaks = [0,1,2,3].map(i => {
      const slice = data.colVals.slice(i * quarter, (i + 1) * quarter);
      let maxVal = -1, maxIdx = 0;
      for (let j = 0; j < slice.length; j++) {
        if (slice[j] > maxVal) { maxVal = slice[j]; maxIdx = j; }
      }
      return i * quarter + maxIdx;
    });

    // Find valleys between peaks
    const valleys = [
      0,
      findMin(data.colVals, peaks[0], peaks[1]),
      findMin(data.colVals, peaks[1], peaks[2]),
      findMin(data.colVals, peaks[2], peaks[3]),
      data.w
    ];

    function findMin(arr, start, end) {
      let minVal = 999999, minIdx = start;
      for (let i = start; i < end; i++) {
        if (arr[i] < minVal) { minVal = arr[i]; minIdx = i; }
      }
      return minIdx;
    }

    console.log(f, 'peaks:', peaks, 'valleys (column splits):', valleys);
  }
  await browser.close();
})();
