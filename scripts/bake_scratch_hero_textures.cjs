const fs = require('fs');
const path = require('path');
const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const ROOT = path.resolve(__dirname, '..');

async function bakeTextures() {
  console.log('=== Step 1: Baking High-Fidelity Hero Textures via Chrome Canvas ===');
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const baseTexB64 = fs.readFileSync(path.join(ROOT, 'archive/dev_assets/candidate_a_tex_0.jpg')).toString('base64');
  const emblemB64 = fs.readFileSync(path.join(ROOT, 'public/emblem.png')).toString('base64');

  const { footyAtlas, hoopsAtlas, keeperAtlas } = await page.evaluate(async (baseB64, embB64) => {
    function loadImg(b64, mime = 'image/jpeg') {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = `data:${mime};base64,` + b64;
      });
    }

    const baseImg = await loadImg(baseB64, 'image/jpeg');
    const emblemImg = await loadImg(embB64, 'image/png');

    function drawOfficialEmblem(ctx, x, y, r, borderCol = '#ffffff') {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r + 2, 0, Math.PI * 2);
      ctx.fillStyle = '#0a0f1d';
      ctx.fill();
      ctx.strokeStyle = borderCol;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.drawImage(emblemImg, x - r, y - r, r * 2, r * 2);
      ctx.restore();
    }

    // =========================================================================
    // 1. FOOTY #10 ATLAS (Turquoise body, white raglan sleeves, navy shorts)
    // =========================================================================
    function makeFootyAtlas() {
      const cvs = document.createElement('canvas');
      cvs.width = 1024;
      cvs.height = 1024;
      const ctx = cvs.getContext('2d');

      // Draw base texture
      ctx.drawImage(baseImg, 0, 0);

      // --- JERSEY OVERHAUL (X 430..800, Y 0..540) ---
      ctx.save();
      ctx.beginPath();
      ctx.rect(435, 0, 365, 540);
      ctx.clip();

      const jGrad = ctx.createLinearGradient(440, 0, 800, 540);
      jGrad.addColorStop(0, '#00e5ff');
      jGrad.addColorStop(0.3, '#00c8ff');
      jGrad.addColorStop(0.7, '#0096c7');
      jGrad.addColorStop(1, '#023e8a');
      ctx.fillStyle = jGrad;
      ctx.fillRect(435, 0, 365, 540);

      // Subtle athletic fabric micro-mesh weave
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      for (let y = 0; y < 540; y += 4) ctx.fillRect(435, y, 365, 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      for (let x = 435; x < 800; x += 4) ctx.fillRect(x, 0, 2, 540);

      // White raglan shoulder inserts
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(435, 0, 60, 230); // Left shoulder
      ctx.fillRect(740, 0, 60, 230); // Right shoulder

      // Navy blue V-neck collar ribbing
      ctx.fillStyle = '#0a192f';
      ctx.beginPath();
      ctx.moveTo(570, 0); ctx.lineTo(670, 0); ctx.lineTo(620, 92); ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(570, 0); ctx.lineTo(620, 92); ctx.lineTo(670, 0);
      ctx.stroke();

      // Front Chest: Official FOOTY vs HOOPS emblem on Left Chest
      drawOfficialEmblem(ctx, 535, 155, 28, '#00f0ff');

      // Front Chest Wordmark: "FOOTY" & Number "10"
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 36px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#0a192f';
      ctx.fillText('FOOTY', 622, 194);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('FOOTY', 620, 190);

      ctx.font = '900 86px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#0a192f';
      ctx.fillText('10', 622, 276);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('10', 620, 272);

      // Back Jersey: Squad name "FOOTY" and large "10"
      ctx.font = '900 32px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#0a192f';
      ctx.fillText('FOOTY', 622, 396);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('FOOTY', 620, 392);

      ctx.font = '900 90px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#0a192f';
      ctx.fillText('10', 622, 466);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('10', 620, 462);

      ctx.restore();

      // --- SHORTS OVERHAUL (X 0..720, Y 740..1024) ---
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 740, 720, 284);
      ctx.clip();

      const sGrad = ctx.createLinearGradient(0, 740, 0, 1024);
      sGrad.addColorStop(0, '#0f172a');
      sGrad.addColorStop(0.5, '#090d16');
      sGrad.addColorStop(1, '#05070c');
      ctx.fillStyle = sGrad;
      ctx.fillRect(0, 740, 720, 284);

      // Turquoise & white lateral speed racing stripes
      ctx.fillStyle = '#00c8ff';
      ctx.fillRect(80, 740, 22, 284);
      ctx.fillRect(620, 740, 22, 284);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(102, 740, 8, 284);
      ctx.fillRect(612, 740, 8, 284);

      // Shorts Left Leg: White squad number "10"
      ctx.font = '900 48px "Arial Black", "Montserrat", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#0284c7';
      ctx.fillText('10', 250, 864);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('10', 250, 860);

      // Shorts Right Leg: Club crest badge
      drawOfficialEmblem(ctx, 480, 860, 26, '#00f0ff');

      ctx.restore();

      // --- SOCKS & SHIN GUARDS OVERHAUL (X 700..1024, Y 600..980) ---
      ctx.save();
      ctx.fillStyle = '#00c8ff';
      ctx.fillRect(680, 610, 344, 150);
      // Molded turquoise shin guard plate
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.roundRect(710, 630, 280, 100, 16);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
      // White top cuff
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(680, 610, 344, 20);
      ctx.restore();

      // --- SOCCER CLEATS OVERHAUL (X 680..1024, Y 260..580) ---
      ctx.save();
      ctx.fillStyle = '#00c8ff';
      ctx.fillRect(690, 280, 334, 280);
      // Speed swoosh
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(730, 430);
      ctx.bezierCurveTo(810, 370, 890, 450, 970, 360);
      ctx.stroke();
      // Navy heel counter & studs plate
      ctx.fillStyle = '#0a192f';
      ctx.fillRect(690, 520, 334, 40);
      ctx.restore();

      return cvs.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
    }

    // =========================================================================
    // 2. HOOPS #23 ATLAS (Matte Black, Metallic Gold, Bronze Skin, Beard)
    // =========================================================================
    function makeHoopsAtlas() {
      const cvs = document.createElement('canvas');
      cvs.width = 1024;
      cvs.height = 1024;
      const ctx = cvs.getContext('2d');

      ctx.drawImage(baseImg, 0, 0);

      // Warm rich bronze skin tone shift
      const imgData = ctx.getImageData(0, 0, 1024, 1024);
      const d = imgData.data;
      for (let y = 350; y < 760; y++) {
        for (let x = 0; x < 450; x++) {
          const idx = (y * 1024 + x) * 4;
          const r = d[idx], g = d[idx + 1], b = d[idx + 2];
          if (r > 120 && g > 80 && b > 60 && r > b + 15) {
            d[idx] = Math.round(r * 0.72);
            d[idx + 1] = Math.round(g * 0.58);
            d[idx + 2] = Math.round(b * 0.44);
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);

      // High flat-top fade hair texture
      ctx.save();
      const hGrad = ctx.createLinearGradient(50, 20, 390, 350);
      hGrad.addColorStop(0, '#1c1d22');
      hGrad.addColorStop(0.7, '#121214');
      hGrad.addColorStop(1, '#09090b');
      ctx.fillStyle = hGrad;
      ctx.fillRect(50, 20, 340, 330);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1.2;
      for (let y = 20; y < 350; y += 4) {
        ctx.beginPath();
        ctx.moveTo(50, y); ctx.lineTo(390, y);
        ctx.stroke();
      }
      ctx.restore();

      // Sharp, well-groomed beard contour
      ctx.save();
      const bGradFace = ctx.createRadialGradient(225, 620, 20, 225, 620, 65);
      bGradFace.addColorStop(0, '#09090b');
      bGradFace.addColorStop(0.8, '#121214');
      bGradFace.addColorStop(1, 'rgba(18, 18, 20, 0)');
      ctx.fillStyle = bGradFace;
      ctx.beginPath();
      ctx.arc(225, 620, 65, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // --- BASKETBALL TANK JERSEY OVERHAUL (X 435..800, Y 0..540) ---
      ctx.save();
      ctx.beginPath();
      ctx.rect(435, 0, 365, 540);
      ctx.clip();

      const bGrad = ctx.createLinearGradient(440, 0, 800, 540);
      bGrad.addColorStop(0, '#1c1d24');
      bGrad.addColorStop(0.5, '#121318');
      bGrad.addColorStop(1, '#090a0d');
      ctx.fillStyle = bGrad;
      ctx.fillRect(435, 0, 365, 540);

      // Metallic Gold Armhole Trim (Sleeveless Tank)
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(435, 0, 48, 240);
      ctx.fillRect(752, 0, 48, 240);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(480, 0, 5, 240);
      ctx.fillRect(752, 0, 5, 240);

      // Deep Gold V-Neck Collar
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(570, 0); ctx.lineTo(670, 0); ctx.lineTo(620, 95); ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#121318';
      ctx.beginPath();
      ctx.moveTo(585, 0); ctx.lineTo(655, 0); ctx.lineTo(620, 80); ctx.closePath();
      ctx.fill();

      // Official Emblem on Left Chest
      drawOfficialEmblem(ctx, 535, 155, 28, '#fbbf24');

      // Arched Wordmark "HOOPS" in metallic gold
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 40px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#78350f';
      ctx.fillText('HOOPS', 622, 194);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('HOOPS', 620, 190);

      // Legendary Squad Number "23" in gold
      ctx.font = '900 88px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#78350f';
      ctx.fillText('23', 622, 276);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('23', 620, 272);

      // Back Jersey: "HOOPS 23"
      ctx.font = '900 36px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#78350f';
      ctx.fillText('HOOPS', 622, 396);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('HOOPS', 620, 392);

      ctx.font = '900 92px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#78350f';
      ctx.fillText('23', 622, 466);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('23', 620, 462);

      ctx.restore();

      // --- BASKETBALL SHORTS OVERHAUL (X 0..720, Y 740..1024) ---
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 740, 720, 284);
      ctx.clip();

      ctx.fillStyle = '#121318';
      ctx.fillRect(0, 740, 720, 284);

      // Gold Chevron Side Stripes
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.moveTo(90, 760); ctx.lineTo(115, 840); ctx.lineTo(90, 920);
      ctx.moveTo(630, 760); ctx.lineTo(605, 840); ctx.lineTo(630, 920);
      ctx.stroke();

      // Gold hem piping
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(0, 1004, 720, 20);

      // Gold squad number "23" on left thigh
      ctx.font = '900 50px "Arial Black", "Montserrat", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#78350f';
      ctx.fillText('23', 250, 864);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('23', 250, 860);

      // Official emblem on right thigh
      drawOfficialEmblem(ctx, 480, 860, 26, '#fbbf24');

      ctx.restore();

      // --- HIGH-TOP BASKETBALL SNEAKERS (X 680..1024, Y 260..580) ---
      ctx.save();
      ctx.fillStyle = '#121318';
      ctx.fillRect(690, 280, 334, 280);
      // Gold speed panels
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(730, 370, 90, 100);
      ctx.fillRect(870, 360, 80, 110);
      // Thick white EVA midsole
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(690, 500, 334, 34);
      // Black outsole tread
      ctx.fillStyle = '#090a0d';
      ctx.fillRect(690, 534, 334, 16);
      ctx.restore();

      return cvs.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
    }

    // =========================================================================
    // 3. KEEPER #1 ATLAS (Vibrant Emerald Kit, Black Goalie Gloves)
    // =========================================================================
    function makeKeeperAtlas() {
      const cvs = document.createElement('canvas');
      cvs.width = 1024;
      cvs.height = 1024;
      const ctx = cvs.getContext('2d');

      ctx.drawImage(baseImg, 0, 0);

      // Emerald Goalkeeper Jersey
      ctx.save();
      ctx.beginPath();
      ctx.rect(435, 0, 365, 540);
      ctx.clip();

      const kGrad = ctx.createLinearGradient(440, 0, 800, 540);
      kGrad.addColorStop(0, '#10b981');
      kGrad.addColorStop(0.5, '#059669');
      kGrad.addColorStop(1, '#047857');
      ctx.fillStyle = kGrad;
      ctx.fillRect(435, 0, 365, 540);

      // Hexagon goalkeeper pulse pattern
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 2;
      for (let y = 40; y < 520; y += 45) {
        for (let x = 450; x < 790; x += 50) {
          ctx.beginPath();
          ctx.arc(x, y, 18, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Black collar
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(570, 0); ctx.lineTo(670, 0); ctx.lineTo(620, 88); ctx.closePath();
      ctx.fill();

      // Official emblem on left chest
      drawOfficialEmblem(ctx, 535, 155, 28, '#34d399');

      // Goalkeeper Number "1" on front
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 36px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#064e3b';
      ctx.fillText('KEEPER', 622, 194);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('KEEPER', 620, 190);

      ctx.font = '900 92px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#064e3b';
      ctx.fillText('1', 622, 276);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('1', 620, 272);

      // Goalkeeper Number "1" on back
      ctx.font = '900 34px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#064e3b';
      ctx.fillText('KEEPER', 622, 396);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('KEEPER', 620, 392);

      ctx.font = '900 96px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#064e3b';
      ctx.fillText('1', 622, 466);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('1', 620, 462);

      ctx.restore();

      // Charcoal Shorts
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 740, 720, 284);
      ctx.clip();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 740, 720, 284);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(80, 740, 22, 284);
      ctx.fillRect(620, 740, 22, 284);

      // Squad number "1"
      ctx.font = '900 48px "Arial Black", "Montserrat", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('1', 250, 860);
      drawOfficialEmblem(ctx, 480, 860, 26, '#10b981');
      ctx.restore();

      return cvs.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
    }

    return {
      footyAtlas: makeFootyAtlas(),
      hoopsAtlas: makeHoopsAtlas(),
      keeperAtlas: makeKeeperAtlas()
    };
  }, baseTexB64, emblemB64);

  await browser.close();

  // Save texture files
  fs.writeFileSync(path.join(ROOT, 'assets/characters/footy10_atlas.png'), Buffer.from(footyAtlas, 'base64'));
  fs.writeFileSync(path.join(ROOT, 'assets/characters/hoops23_atlas.png'), Buffer.from(hoopsAtlas, 'base64'));
  fs.writeFileSync(path.join(ROOT, 'assets/characters/keeper1_atlas.png'), Buffer.from(keeperAtlas, 'base64'));

  console.log('✓ Successfully baked all 3 Hero Atlases to assets/characters/');
  return { footyAtlas, hoopsAtlas, keeperAtlas };
}

if (require.main === module) {
  bakeTextures().catch(console.error);
}

module.exports = { bakeTextures };
