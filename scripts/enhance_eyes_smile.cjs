const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const fs = require('fs');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

async function enhanceFeatures() {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new' });
  const page = await browser.newPage();
  await page.goto('http://localhost:8099/index.html');

  const dataUrl = await page.evaluate(async () => {
    const img = new Image();
    await new Promise(r => { img.onload = r; img.src = 'assets/characters/hoops23_refined_texture.png'; });
    const cvs = document.createElement('canvas');
    cvs.width = 1024; cvs.height = 1024;
    const ctx = cvs.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // 1. Right Eye: u: 45..90, v: 500..545 (center ~ (67, 522))
    ctx.save();
    // Eye white sclera
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(67, 524, 14, 8, -0.05, 0, Math.PI * 2);
    ctx.fill();

    // Iris (warm amber brown)
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(67, 524, 6.5, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(67, 524, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Catchlight highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(65, 522, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Upper eyelid shadow / lash
    ctx.strokeStyle = '#1e1008';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(67, 524, 14, 8, -0.05, Math.PI, 0);
    ctx.stroke();

    // 2. Left Eye: u: 1000..1024, v: 55..75 (center ~ (1014, 66))
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(1014, 66, 12, 7, 0.05, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(1014, 66, 5.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(1014, 66, 3.0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(1012, 64, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#1e1008';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(1014, 66, 12, 7, 0.05, Math.PI, 0);
    ctx.stroke();

    // 3. Mouth & Teeth: u: 460..495, v: 475..490 (center ~ (477, 482))
    // Teeth white shine
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(477, 482, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Lip line
    ctx.strokeStyle = '#2b1408';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(464, 482);
    ctx.quadraticCurveTo(477, 485, 490, 482);
    ctx.stroke();

    ctx.restore();
    return cvs.toDataURL('image/png');
  });

  await browser.close();
  const b = Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64');
  fs.writeFileSync('assets/characters/hoops23_refined_texture.png', b);
  console.log('Enhanced eyes and smile!');
}

enhanceFeatures().then(() => {
  require('./repack_glb_textures.cjs');
}).catch(console.error);
