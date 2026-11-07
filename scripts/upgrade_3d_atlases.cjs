const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

async function upgradeAtlases() {
  console.log('Upgrading 3D texture atlases for footy10 and hoops23...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  const footyAtlasPath = path.resolve('assets/characters/footy10_atlas.png');
  const hoopsAtlasPath = path.resolve('assets/characters/hoops23_atlas.png');

  // Backup originals
  fs.copyFileSync(footyAtlasPath, path.resolve('archive/dev_assets/footy10_atlas_legacy.png'));
  fs.copyFileSync(hoopsAtlasPath, path.resolve('archive/dev_assets/hoops23_atlas_legacy.png'));

  // 1. Generate upgraded FOOTY #10 Atlas (1024x1024)
  const footyAtlasBase64 = await page.evaluate(() => {
    const cvs = document.createElement('canvas');
    cvs.width = 1024;
    cvs.height = 1024;
    const ctx = cvs.getContext('2d');

    // Quad 1: Front Jersey (top-left: 0, 0, 512, 512)
    // Gradient electric cyan to deep cyan
    const gradF = ctx.createLinearGradient(0, 0, 0, 512);
    gradF.addColorStop(0, '#00d2ff');
    gradF.addColorStop(0.5, '#00b4ec');
    gradF.addColorStop(1, '#009cd0');
    ctx.fillStyle = gradF;
    ctx.fillRect(0, 0, 512, 512);

    // White shoulder/side panels
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(160, 0); ctx.lineTo(120, 140); ctx.lineTo(0, 220); ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(512, 0); ctx.lineTo(352, 0); ctx.lineTo(392, 140); ctx.lineTo(512, 220); ctx.closePath();
    ctx.fill();

    // Navy collar trim
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(256, 40, 110, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();

    // Chest Typography: "FOOTY"
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 68px "Arial Black", Impact, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('FOOTY', 256, 172);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('FOOTY', 256, 168);

    // Chest Number "10"
    ctx.font = '900 120px "Arial Black", Impact, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('10', 256, 290);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('10', 256, 286);

    // Quad 2: Back Jersey (top-right: 512, 0, 512, 512)
    ctx.fillStyle = gradF;
    ctx.fillRect(512, 0, 512, 512);

    // White shoulder panels on back
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(512, 0); ctx.lineTo(640, 0); ctx.lineTo(512, 180); ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(1024, 0); ctx.lineTo(896, 0); ctx.lineTo(1024, 180); ctx.closePath();
    ctx.fill();

    // Back Typography: "FOOTY"
    ctx.font = '900 60px "Arial Black", Impact, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('FOOTY', 768, 110);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('FOOTY', 768, 106);

    // Large Back Number "10"
    ctx.font = '900 160px "Arial Black", Impact, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('10', 768, 260);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('10', 768, 254);

    // Quad 3: Shorts (mid-left: 0, 512, 512, 256)
    ctx.fillStyle = '#0f172a'; // Deep navy
    ctx.fillRect(0, 512, 512, 256);
    // Cyan side stripes
    ctx.fillStyle = '#00d2ff';
    ctx.fillRect(20, 512, 36, 256);
    ctx.fillRect(456, 512, 36, 256);
    // Small number 10 on shorts
    ctx.font = '900 48px "Arial Black", Impact, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('10', 380, 710);

    // Quad 4: Face, Hair, Eyes (mid-right: 512, 512, 512, 256)
    // Warm athletic skin base
    ctx.fillStyle = '#e5a882';
    ctx.fillRect(512, 512, 256, 256);
    // Subtle jaw/cheek shading
    const cheekGrad = ctx.createRadialGradient(640, 640, 20, 640, 640, 110);
    cheekGrad.addColorStop(0, 'rgba(235, 140, 120, 0.35)');
    cheekGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = cheekGrad;
    ctx.fillRect(512, 512, 256, 256);
    // Confident smile
    ctx.strokeStyle = '#8d442b';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(640, 680, 36, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    // Hair region (textured dark brown modern fade)
    ctx.fillStyle = '#2c1810';
    ctx.fillRect(768, 512, 256, 128);
    ctx.fillStyle = '#3d2418';
    for (let x = 768; x < 1024; x += 16) {
      ctx.fillRect(x, 512, 8, 128);
    }
    // Expressive stylized eye
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(768, 640, 128, 128);
    ctx.beginPath();
    ctx.arc(832, 704, 44, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(832, 704, 28, 0, 2 * Math.PI);
    ctx.fillStyle = '#0284c7'; // Vibrant blue iris
    ctx.fill();
    ctx.beginPath();
    ctx.arc(832, 704, 16, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a'; // Pupil
    ctx.fill();
    ctx.beginPath();
    ctx.arc(824, 696, 7, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff'; // Specular highlight
    ctx.fill();

    // Quad 5: Skin tone & Socks (bot-left: 0, 768, 512, 256)
    ctx.fillStyle = '#e5a882';
    ctx.fillRect(0, 768, 256, 256);
    // Cyan socks with white hoop
    ctx.fillStyle = '#00d2ff';
    ctx.fillRect(256, 768, 256, 256);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(256, 820, 256, 40);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(256, 860, 256, 16);

    // Quad 6: High-performance Cleats (bot-right: 512, 768, 512, 256)
    ctx.fillStyle = '#00c8ff';
    ctx.fillRect(512, 768, 512, 256);
    // Cleat laces & dynamic swoop
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(540, 800, 180, 24);
    ctx.fillRect(550, 840, 160, 20);
    ctx.fillRect(560, 880, 140, 20);
    // Outsole & Stud base
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(512, 940, 512, 84);
    // Molded studs
    ctx.fillStyle = '#00f0ff';
    for (let sx = 540; sx < 1000; sx += 60) {
      ctx.beginPath();
      ctx.arc(sx, 980, 14, 0, 2 * Math.PI);
      ctx.fill();
    }

    return cvs.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
  });
  fs.writeFileSync(footyAtlasPath, Buffer.from(footyAtlasBase64, 'base64'));
  console.log(`✓ Saved upgraded FOOTY #10 3D texture atlas to: ${footyAtlasPath}`);

  // 2. Generate upgraded HOOPS #23 Atlas (1024x1024)
  const hoopsAtlasBase64 = await page.evaluate(() => {
    const cvs = document.createElement('canvas');
    cvs.width = 1024;
    cvs.height = 1024;
    const ctx = cvs.getContext('2d');

    // Quad 1: Front Jersey (top-left: 0, 0, 512, 512)
    // Luxury matte black fabric
    ctx.fillStyle = '#111216';
    ctx.fillRect(0, 0, 512, 512);

    // Metallic gold armhole trim and side panels
    ctx.fillStyle = '#d97706';
    ctx.fillRect(0, 120, 48, 392);
    ctx.fillRect(464, 120, 48, 392);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(40, 120, 12, 392);
    ctx.fillRect(460, 120, 12, 392);

    // V-Neck collar trim in gold
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.moveTo(160, 0); ctx.lineTo(256, 96); ctx.lineTo(352, 0);
    ctx.stroke();

    // Arched Chest Typography: "HOOPS"
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 72px "Arial Black", Impact, sans-serif';
    ctx.fillStyle = '#b45309';
    ctx.fillText('HOOPS', 256, 184);
    ctx.fillStyle = '#fcd34d'; // Bright gold
    ctx.fillText('HOOPS', 256, 180);

    // Large Chest Number "23"
    ctx.font = '900 136px "Arial Black", Impact, sans-serif';
    ctx.fillStyle = '#b45309';
    ctx.fillText('23', 256, 314);
    ctx.fillStyle = '#fcd34d';
    ctx.fillText('23', 256, 310);

    // Quad 2: Back Jersey (top-right: 512, 0, 512, 512)
    ctx.fillStyle = '#111216';
    ctx.fillRect(512, 0, 512, 512);

    // Gold side panels on back
    ctx.fillStyle = '#d97706';
    ctx.fillRect(512, 120, 48, 392);
    ctx.fillRect(976, 120, 48, 392);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(552, 120, 12, 392);
    ctx.fillRect(964, 120, 12, 392);

    // Back Name: "HOOPS"
    ctx.font = '900 64px "Arial Black", Impact, sans-serif';
    ctx.fillStyle = '#b45309';
    ctx.fillText('HOOPS', 768, 124);
    ctx.fillStyle = '#fcd34d';
    ctx.fillText('HOOPS', 768, 120);

    // Large Back Number "23"
    ctx.font = '900 170px "Arial Black", Impact, sans-serif';
    ctx.fillStyle = '#b45309';
    ctx.fillText('23', 768, 276);
    ctx.fillStyle = '#fcd34d';
    ctx.fillText('23', 768, 270);

    // Quad 3: Shorts (mid-left: 0, 512, 512, 256)
    ctx.fillStyle = '#111216';
    ctx.fillRect(0, 512, 512, 256);
    // Gold geometric side panels
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.moveTo(0, 512); ctx.lineTo(60, 512); ctx.lineTo(30, 768); ctx.lineTo(0, 768); ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(512, 512); ctx.lineTo(452, 512); ctx.lineTo(482, 768); ctx.lineTo(512, 768); ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(0, 748, 512, 20); // Gold bottom hem

    // Quad 4: Face, Hair, Eyes (mid-right: 512, 512, 512, 256)
    // Athletic warm skin base
    ctx.fillStyle = '#78462a';
    ctx.fillRect(512, 512, 256, 256);
    // Defined athletic jaw & clean beard
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(640, 710, 48, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#572c15';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(615, 675); ctx.lineTo(665, 675);
    ctx.stroke();

    // Hair region (high-top fade / textured black)
    ctx.fillStyle = '#111216';
    ctx.fillRect(768, 512, 256, 128);
    ctx.fillStyle = '#1f2937';
    for (let x = 768; x < 1024; x += 12) {
      ctx.fillRect(x, 512, 6, 128);
    }
    // Expressive stylized basketball eye
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(768, 640, 128, 128);
    ctx.beginPath();
    ctx.arc(832, 704, 44, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(832, 704, 28, 0, 2 * Math.PI);
    ctx.fillStyle = '#5a3818'; // Warm brown iris
    ctx.fill();
    ctx.beginPath();
    ctx.arc(832, 704, 16, 0, 2 * Math.PI);
    ctx.fillStyle = '#0a0a0c'; // Pupil
    ctx.fill();
    ctx.beginPath();
    ctx.arc(824, 696, 7, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff'; // Specular highlight
    ctx.fill();

    // Quad 5: Skin tone & Compression Sleeve (bot-left: 0, 768, 512, 256)
    ctx.fillStyle = '#78462a'; // Skin
    ctx.fillRect(0, 768, 256, 256);
    // Compression sleeve (matte black with gold stripe)
    ctx.fillStyle = '#111216';
    ctx.fillRect(256, 768, 256, 256);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(256, 820, 256, 28);

    // Quad 6: High-top Basketball Sneakers (bot-right: 512, 768, 512, 256)
    ctx.fillStyle = '#111216'; // Black upper
    ctx.fillRect(512, 768, 512, 256);
    // Gold sneaker accents & eyelets
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(530, 800, 190, 24);
    ctx.fillRect(540, 840, 170, 20);
    ctx.fillRect(550, 880, 150, 20);
    // Gold heel cup
    ctx.fillStyle = '#d97706';
    ctx.fillRect(780, 800, 80, 140);
    // Cushioned midsole
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(512, 940, 512, 40);
    // Gold outsole
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(512, 980, 512, 44);

    return cvs.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
  });
  fs.writeFileSync(hoopsAtlasPath, Buffer.from(hoopsAtlasBase64, 'base64'));
  console.log(`✓ Saved upgraded HOOPS #23 3D texture atlas to: ${hoopsAtlasPath}`);

  await browser.close();
  console.log('3D texture atlases upgraded successfully!');
}

upgradeAtlases().catch(err => {
  console.error('Error upgrading atlases:', err);
  process.exit(1);
});
