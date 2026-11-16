const fs = require('fs');
const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');

async function findNoseTip2D() {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();

  const chars = [
    { name: 'footy', path: 'assets/characters/footy10_preview.png', isJpeg: false },
    { name: 'hoops', path: 'assets/characters/hoops23_preview.png', isJpeg: false },
    { name: 'keeper', path: 'assets/characters/keeper1_preview.png', isJpeg: true }
  ];

  for (let c of chars) {
    const b64 = fs.readFileSync(c.path).toString('base64');
    const info = await page.evaluate(async (b64, isJpeg) => {
      const img = new Image();
      await new Promise(r => { img.onload = r; img.src = (isJpeg ? 'data:image/jpeg;base64,' : 'data:image/png;base64,') + b64; });
      const cvs = document.createElement('canvas'); cvs.width = img.width; cvs.height = img.height;
      const ctx = cvs.getContext('2d'); ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, img.width, img.height).data;

      // Sample along center x = Math.round(img.width / 2)
      const cx = Math.round(img.width / 2);
      const samples = [];
      for (let y = 50; y < Math.round(img.height * 0.45); y += 2) {
        const idx = (y * img.width + cx) * 4;
        samples.push({ y, r: data[idx], g: data[idx+1], b: data[idx+2] });
      }
      return { w: img.width, h: img.height, cx, samples };
    }, b64, c.isJpeg);

    // Save samples to inspect
    fs.writeFileSync(`scripts/samples_${c.name}.json`, JSON.stringify(info, null, 2));
    console.log(`Saved samples for ${c.name}, ${info.samples.length} points.`);
  }
  await browser.close();
}

findNoseTip2D().catch(console.error);
