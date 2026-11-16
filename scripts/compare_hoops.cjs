const fs = require('fs');
const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');

async function createSideBySide() {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 750 });

  // Find user image file in .user_uploaded
  const files = fs.readdirSync('C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/.user_uploaded');
  const userFile = files.filter(f => f.endsWith('.png')).sort().pop();
  const userImgB64 = fs.readFileSync('C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/.user_uploaded/' + userFile).toString('base64');
  const freshImgB64 = fs.readFileSync('C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/fresh_hoops_front.png').toString('base64');

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { margin:0; padding:20px; background:#0d0f14; color:#fff; font-family:-apple-system,BlinkMacSystemFont,sans-serif; display:flex; justify-content:center; gap:24px; align-items:flex-start; }
      .card { background:#161922; border:1px solid #334155; border-radius:16px; overflow:hidden; text-align:center; padding:16px; box-shadow:0 10px 30px rgba(0,0,0,0.5); }
      .card h2 { margin:0 0 12px; font-size:15px; color:#38bdf8; }
      .card img { max-height:580px; border-radius:8px; display:block; margin:0 auto; }
    </style>
  </head>
  <body>
    <div class="card">
      <h2>Референс пользователя (Исходный 3D-вьювер)</h2>
      <img src="data:image/png;base64,${userImgB64}" />
    </div>
    <div class="card">
      <h2>Наш 3D Character Studio (Текущий рендер)</h2>
      <img src="data:image/png;base64,${freshImgB64}" />
    </div>
  </body>
  </html>
  `;

  await page.setContent(html);
  await page.screenshot({ path: 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/side_by_side_hoops.png' });
  await browser.close();
  console.log('Saved side_by_side_hoops.png');
}

createSideBySide().catch(err => {
  console.error(err);
  process.exit(1);
});
