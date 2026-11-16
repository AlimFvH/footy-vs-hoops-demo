const fs = require('fs');
const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

async function makePreviews() {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const cards = [
    { src: 'raw_crop_footy.png', out: 'assets/characters/footy10_preview.png' },
    { src: 'raw_crop_hoops.png', out: 'assets/characters/hoops23_preview.png' },
    { src: 'raw_crop_keeper.png', out: 'assets/characters/keeper1_preview.png' }
  ];

  for (const card of cards) {
    const b64 = fs.readFileSync(card.src).toString('base64');
    const res = await page.evaluate(async (b64) => {
      const img = new Image();
      await new Promise(r => { img.onload = r; img.src = 'data:image/png;base64,' + b64; });

      const cvs = document.createElement('canvas');
      cvs.width = 600;
      cvs.height = 1000;
      const ctx = cvs.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Soft vignette backdrop that blends with any UI dark theme
      const grad = ctx.createRadialGradient(300, 500, 100, 300, 500, 480);
      grad.addColorStop(0, 'rgba(15, 23, 42, 0.45)');
      grad.addColorStop(0.7, 'rgba(10, 15, 26, 0.75)');
      grad.addColorStop(1, 'rgba(4, 7, 16, 0.95)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 600, 1000);

      // Draw character centered
      const scale = 940 / img.naturalHeight;
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      const dx = (600 - dw) / 2;
      const dy = (1000 - dh) / 2;

      ctx.drawImage(img, dx, dy, dw, dh);

      // Soft outer edge feathering
      const edgeGrad = ctx.createLinearGradient(0, 0, 0, 1000);
      edgeGrad.addColorStop(0, 'rgba(4, 7, 16, 0.8)');
      edgeGrad.addColorStop(0.06, 'rgba(4, 7, 16, 0)');
      edgeGrad.addColorStop(0.92, 'rgba(4, 7, 16, 0)');
      edgeGrad.addColorStop(1, 'rgba(4, 7, 16, 0.9)');
      ctx.fillStyle = edgeGrad;
      ctx.fillRect(0, 0, 600, 1000);

      return cvs.toDataURL('image/png');
    }, b64);

    const buf = Buffer.from(res.replace(/^data:image\/png;base64,/, ''), 'base64');
    fs.writeFileSync(card.out, buf);
    console.log('Saved ' + card.out);
  }

  await browser.close();
}

makePreviews().catch(console.error);
