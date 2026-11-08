const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const BASE_MODEL_PATH = path.join(ROOT, 'archive/dev_assets/footy10_backup_before_atlas.glb');

async function generateTrueHeroAtlases() {
  console.log('=== Step 1: Baking High-Fidelity Fortnite Atlases via Chrome Canvas ===');
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const emblemBase64 = fs.readFileSync(path.join(ROOT, 'public/emblem.png')).toString('base64');

  const { footyAtlas, hoopsAtlas, keeperAtlas } = await page.evaluate(async (embB64) => {
    function loadImg(b64) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = 'data:image/png;base64,' + b64;
      });
    }

    const emblemImg = await loadImg(embB64);

    function drawOfficialEmblem(ctx, x, y, r, strokeCol) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r + 2.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(10, 15, 26, 0.92)';
      ctx.fill();
      ctx.strokeStyle = strokeCol;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.drawImage(emblemImg, x - r, y - r, r * 2, r * 2);
      ctx.restore();
    }

    // High-Resolution Pixar/Fortnite Stylized Eye (768..896, 640..768)
    function drawStylizedEye(ctx, x, y, w, h, irisCol1, irisCol2) {
      ctx.save();
      // 1. Sclera (White with soft ambient occlusion at corners)
      const eyeGrad = ctx.createRadialGradient(x + w * 0.5, y + h * 0.5, w * 0.1, x + w * 0.5, y + h * 0.5, w * 0.5);
      eyeGrad.addColorStop(0, '#ffffff');
      eyeGrad.addColorStop(0.85, '#f1f5f9');
      eyeGrad.addColorStop(1, '#cbd5e1');
      ctx.fillStyle = eyeGrad;
      ctx.fillRect(x, y, w, h);

      const cx = x + w * 0.5;
      const cy = y + h * 0.5;
      const irisR = w * 0.35;

      // 2. Iris Ring & Gradient
      const irisGrad = ctx.createRadialGradient(cx, cy, irisR * 0.2, cx, cy, irisR);
      irisGrad.addColorStop(0, irisCol1);
      irisGrad.addColorStop(0.7, irisCol2);
      irisGrad.addColorStop(1, '#0f172a');
      ctx.beginPath();
      ctx.arc(cx, cy, irisR, 0, Math.PI * 2);
      ctx.fillStyle = irisGrad;
      ctx.fill();
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Iris Fibers
      ctx.save();
      ctx.translate(cx, cy);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.lineWidth = 1.2;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * (irisR * 0.35), Math.sin(a) * (irisR * 0.35));
        ctx.lineTo(Math.cos(a) * (irisR * 0.85), Math.sin(a) * (irisR * 0.85));
        ctx.stroke();
      }
      ctx.restore();

      // 3. Deep Black Pupil
      const pupilR = irisR * 0.44;
      ctx.beginPath();
      ctx.arc(cx, cy, pupilR, 0, Math.PI * 2);
      ctx.fillStyle = '#050508';
      ctx.fill();

      // 4. Double Specular Catchlights (Pixar / Fortnite signature)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx - irisR * 0.36, cy - irisR * 0.36, irisR * 0.22, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.beginPath();
      ctx.arc(cx + irisR * 0.30, cy + irisR * 0.30, irisR * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Stylized Volumetric Hair (768..1024, 512..640)
    function drawVolumetricHair(ctx, x, y, w, h, baseCol, highlightCol, shadowCol) {
      ctx.save();
      const hairGrad = ctx.createLinearGradient(x, y, x, y + h);
      hairGrad.addColorStop(0, highlightCol);
      hairGrad.addColorStop(0.4, baseCol);
      hairGrad.addColorStop(1, shadowCol);
      ctx.fillStyle = hairGrad;
      ctx.fillRect(x, y, w, h);

      // Fine hair strand textures
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 2;
      for (let i = 0; i < w; i += 8) {
        ctx.beginPath();
        ctx.moveTo(x + i, y);
        ctx.lineTo(x + i + 10, y + h);
        ctx.stroke();
      }
      ctx.restore();
    }

    // =================================================================
    // 1. FOOTY #10 ATLAS (Turquoise & White, Exposed Legs, Molded Cleats)
    // =================================================================
    function makeFootyAtlas() {
      const cvs = document.createElement('canvas');
      cvs.width = 1024;
      cvs.height = 1024;
      const ctx = cvs.getContext('2d');

      ctx.fillStyle = '#00c8ff';
      ctx.fillRect(0, 0, 1024, 1024);

      // --- A. FRONT JERSEY (0..512, 0..512) ---
      const fGrad = ctx.createLinearGradient(0, 0, 0, 512);
      fGrad.addColorStop(0, '#00e5ff');
      fGrad.addColorStop(0.35, '#00b8f0');
      fGrad.addColorStop(1, '#007bb5');
      ctx.fillStyle = fGrad;
      ctx.fillRect(0, 0, 512, 512);

      // White raglan shoulder wings
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(160, 0); ctx.lineTo(0, 240); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(512, 0); ctx.lineTo(352, 0); ctx.lineTo(512, 240); ctx.closePath(); ctx.fill();

      // Deep Navy V-Neck Collar
      ctx.fillStyle = '#0a1e3f';
      ctx.beginPath();
      ctx.moveTo(175, 0); ctx.lineTo(337, 0); ctx.lineTo(256, 85); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(195, 0); ctx.lineTo(317, 0); ctx.lineTo(256, 68); ctx.closePath(); ctx.fill();

      // Official Project Emblem Badge (Left Chest)
      drawOfficialEmblem(ctx, 135, 175, 38, '#00f0ff');

      // Wordmark "FOOTY"
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 64px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#0a1e3f';
      ctx.fillText('FOOTY', 256, 218);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('FOOTY', 256, 214);

      // Front Squad Number "10"
      ctx.font = '900 136px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#0a1e3f';
      ctx.fillText('10', 256, 335);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('10', 256, 330);

      // --- B. BACK JERSEY (512..1024, 0..512) ---
      const bGrad = ctx.createLinearGradient(512, 0, 512, 512);
      bGrad.addColorStop(0, '#00daf5');
      bGrad.addColorStop(0.5, '#00ade8');
      bGrad.addColorStop(1, '#0075b8');
      ctx.fillStyle = bGrad;
      ctx.fillRect(512, 0, 512, 512);

      // Navy collar back band
      ctx.fillStyle = '#0a1e3f';
      ctx.fillRect(512, 0, 512, 35);
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(512, 35, 512, 6);

      // Back Squad Name "FOOTY"
      ctx.font = '900 62px "Arial Black", sans-serif';
      ctx.fillStyle = '#0a1e3f';
      ctx.fillText('FOOTY', 768, 124);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('FOOTY', 768, 120);

      // Giant Back Number "10"
      ctx.font = '900 190px "Arial Black", sans-serif';
      ctx.fillStyle = '#0a1e3f';
      ctx.fillText('10', 768, 275);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('10', 768, 270);

      // --- C. NAVY SHORTS (0..512, 512..768) ---
      // Clean athletic shorts (NO numbers to prevent mirrored "01" on rear leg!)
      ctx.fillStyle = '#0c1b33';
      ctx.fillRect(0, 512, 512, 256);
      // Turquoise side racing bands with white pin
      ctx.fillStyle = '#00c8ff';
      ctx.fillRect(10, 512, 38, 256);
      ctx.fillRect(464, 512, 38, 256);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(36, 512, 8, 256);
      ctx.fillRect(468, 512, 8, 256);
      // Hem piping
      ctx.fillStyle = '#00c8ff';
      ctx.fillRect(0, 752, 512, 16);

      // Centered official emblem on shorts front
      drawOfficialEmblem(ctx, 256, 640, 32, '#00f0ff');

      // --- D. FACE & SKIN (512..768, 512..768) ---
      const faceGrad = ctx.createLinearGradient(512, 512, 512, 768);
      faceGrad.addColorStop(0, '#fde68a'); // Warm forehead
      faceGrad.addColorStop(0.35, '#fed7aa'); // Cheeks
      faceGrad.addColorStop(0.75, '#fdba74'); // Mid jaw
      faceGrad.addColorStop(1, '#fb923c'); // Chin & neck contour
      ctx.fillStyle = faceGrad;
      ctx.fillRect(512, 512, 256, 256);

      // Soft blushing cheeks & lip contour
      ctx.fillStyle = 'rgba(239, 68, 68, 0.16)';
      ctx.beginPath();
      ctx.arc(580, 640, 36, 0, Math.PI * 2);
      ctx.arc(700, 640, 36, 0, Math.PI * 2);
      ctx.fill();

      // Clean smiling lips contour
      ctx.fillStyle = '#c2410c';
      ctx.beginPath();
      ctx.ellipse(640, 685, 24, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(640, 684, 16, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // --- E. HAIR (768..1024, 512..640) ---
      drawVolumetricHair(ctx, 768, 512, 256, 128, '#2e180d', '#4a2818', '#1c0e07');

      // --- F. EYE (768..896, 640..768) ---
      drawStylizedEye(ctx, 768, 640, 128, 128, '#38bdf8', '#0284c7');

      // --- G. EYEBROWS (896..1024, 640..768) ---
      ctx.fillStyle = '#1c0e07';
      ctx.fillRect(896, 640, 128, 128);

      // --- H. BARE LEG SKIN (0..256, 768..1024) ---
      const legSkinGrad = ctx.createLinearGradient(0, 768, 0, 1024);
      legSkinGrad.addColorStop(0, '#fed7aa');
      legSkinGrad.addColorStop(0.5, '#fdb268');
      legSkinGrad.addColorStop(1, '#f97316');
      ctx.fillStyle = legSkinGrad;
      ctx.fillRect(0, 768, 256, 256);

      // --- I. SOCKS & SHIN GUARDS (256..512, 768..1024) ---
      ctx.fillStyle = '#00c8ff';
      ctx.fillRect(256, 768, 256, 256);
      // White ribbed turn-down cuff
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(256, 768, 256, 45);
      ctx.fillStyle = '#0a1e3f';
      ctx.fillRect(256, 813, 256, 16);

      // Molded turquoise shin guard plate with white racing chevron
      ctx.fillStyle = '#0090d0';
      ctx.beginPath();
      ctx.roundRect(290, 840, 188, 150, 18);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // --- J. SOCCER CLEATS (512..1024, 768..1024) ---
      ctx.fillStyle = '#00a8e8';
      ctx.fillRect(512, 768, 512, 256);
      // White racing swoosh
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(560, 870);
      ctx.bezierCurveTo(680, 830, 780, 890, 880, 820);
      ctx.bezierCurveTo(800, 880, 700, 875, 560, 870);
      ctx.fill();
      // Studded sole plate
      ctx.fillStyle = '#0a1e3f';
      ctx.fillRect(512, 970, 512, 54);

      return cvs.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
    }

    // =================================================================
    // 2. HOOPS #23 ATLAS (Sleeveless Tank, Bronze Skin, Beard, Gold Kicks)
    // =================================================================
    function makeHoopsAtlas() {
      const cvs = document.createElement('canvas');
      cvs.width = 1024;
      cvs.height = 1024;
      const ctx = cvs.getContext('2d');

      ctx.fillStyle = '#14151a';
      ctx.fillRect(0, 0, 1024, 1024);

      // --- A. FRONT JERSEY (0..512, 0..512) ---
      const fGrad = ctx.createLinearGradient(0, 0, 0, 512);
      fGrad.addColorStop(0, '#24252e');
      fGrad.addColorStop(0.35, '#17181f');
      fGrad.addColorStop(1, '#0e0f14');
      ctx.fillStyle = fGrad;
      ctx.fillRect(0, 0, 512, 512);

      // Metallic Gold Armhole Ribbing (Sleeveless Tank!)
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(0, 0, 48, 512);
      ctx.fillRect(464, 0, 48, 512);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(36, 0, 12, 512);
      ctx.fillRect(464, 0, 12, 512);

      // Deep Gold V-Neck Collar
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(160, 0); ctx.lineTo(352, 0); ctx.lineTo(256, 100); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#14151a';
      ctx.beginPath();
      ctx.moveTo(192, 0); ctx.lineTo(320, 0); ctx.lineTo(256, 80); ctx.closePath(); ctx.fill();

      // Official Project Emblem Badge
      drawOfficialEmblem(ctx, 135, 175, 38, '#fbbf24');

      // Arched Wordmark "HOOPS" in metallic gold
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 68px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#92400e';
      ctx.fillText('HOOPS', 256, 222);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('HOOPS', 256, 218);

      // Legendary Squad Number "23" in gold
      ctx.font = '900 148px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#92400e';
      ctx.fillText('23', 256, 342);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('23', 256, 336);

      // --- B. BACK JERSEY (512..1024, 0..512) ---
      const bGrad = ctx.createLinearGradient(512, 0, 512, 512);
      bGrad.addColorStop(0, '#24252e');
      bGrad.addColorStop(0.5, '#17181f');
      bGrad.addColorStop(1, '#0e0f14');
      ctx.fillStyle = bGrad;
      ctx.fillRect(512, 0, 512, 512);

      // Gold collar back rim
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(512, 0, 512, 35);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(512, 35, 512, 6);

      // Back "ALL-STAR"
      ctx.font = '900 62px "Arial Black", sans-serif';
      ctx.fillStyle = '#92400e';
      ctx.fillText('ALL-STAR', 768, 140);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('ALL-STAR', 768, 136);

      // Giant Back Number "23"
      ctx.font = '900 186px "Arial Black", sans-serif';
      ctx.fillStyle = '#92400e';
      ctx.fillText('23', 768, 290);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('23', 768, 284);

      // --- C. LOOSE BASKETBALL SHORTS (0..512, 512..768) ---
      // Clean basketball shorts (NO numbers to prevent mirrored "ES" on rear leg!)
      ctx.fillStyle = '#121318';
      ctx.fillRect(0, 512, 512, 256);
      // Gold chevron side striping
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(12, 512); ctx.lineTo(44, 640); ctx.lineTo(12, 768);
      ctx.lineTo(28, 768); ctx.lineTo(60, 640); ctx.lineTo(28, 512);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(500, 512); ctx.lineTo(468, 640); ctx.lineTo(500, 768);
      ctx.lineTo(484, 768); ctx.lineTo(452, 640); ctx.lineTo(484, 512);
      ctx.closePath(); ctx.fill();

      // Gold bottom hem piping
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(0, 752, 512, 16);

      // Centered official emblem on shorts
      drawOfficialEmblem(ctx, 256, 640, 32, '#fbbf24');

      // --- D. FACE & SKIN (512..768, 512..768) ---
      const bronzeGrad = ctx.createLinearGradient(512, 512, 512, 768);
      bronzeGrad.addColorStop(0, '#5a3825'); // Forehead
      bronzeGrad.addColorStop(0.4, '#4a2c1b'); // Cheeks
      bronzeGrad.addColorStop(0.75, '#3a2012'); // Chin
      bronzeGrad.addColorStop(1, '#2c170c'); // Neck
      ctx.fillStyle = bronzeGrad;
      ctx.fillRect(512, 512, 256, 256);

      // Trimmed Beard & Mustache along Jawline
      ctx.fillStyle = '#0f0c0a';
      // Mustache
      ctx.beginPath();
      ctx.ellipse(640, 665, 30, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      // Goatee / Chin Beard
      ctx.beginPath();
      ctx.moveTo(590, 660);
      ctx.quadraticCurveTo(640, 735, 690, 660);
      ctx.quadraticCurveTo(640, 715, 590, 660);
      ctx.fill();

      // Warm confident smile with clean white teeth
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(640, 676, 18, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.closePath();
      ctx.fill();

      // --- E. HAIR (768..1024, 512..640) ---
      drawVolumetricHair(ctx, 768, 512, 256, 128, '#141416', '#26262a', '#08080a');

      // --- F. EYE (768..896, 640..768) ---
      drawStylizedEye(ctx, 768, 640, 128, 128, '#854d0e', '#451a03');

      // --- G. EYEBROWS (896..1024, 640..768) ---
      ctx.fillStyle = '#08080a';
      ctx.fillRect(896, 640, 128, 128);

      // --- H. BARE LEG SKIN (0..256, 768..1024) ---
      const hoopsLegSkinGrad = ctx.createLinearGradient(0, 768, 0, 1024);
      hoopsLegSkinGrad.addColorStop(0, '#5a3825');
      hoopsLegSkinGrad.addColorStop(0.5, '#4a2c1b');
      hoopsLegSkinGrad.addColorStop(1, '#3a2012');
      ctx.fillStyle = hoopsLegSkinGrad;
      ctx.fillRect(0, 768, 256, 256);

      // --- I. SOCKS, COMPRESSION SLEEVE & WRISTBAND (256..512, 768..1024) ---
      ctx.fillStyle = '#111827';
      ctx.fillRect(256, 768, 256, 256);
      // Gold wristband band
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(256, 768, 256, 40);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(256, 808, 256, 10);

      // --- J. HIGH-TOP BASKETBALL SNEAKERS (512..1024, 768..1024) ---
      ctx.fillStyle = '#171717';
      ctx.fillRect(512, 768, 512, 256);
      // Metallic gold heel counter & collar
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(560, 940);
      ctx.lineTo(680, 830);
      ctx.lineTo(820, 830);
      ctx.lineTo(940, 940);
      ctx.closePath();
      ctx.fill();
      // Pure white cushioned outsole
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(512, 970, 512, 54);

      return cvs.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
    }

    // =================================================================
    // 3. KEEPER #1 ATLAS (Electric Emerald Goalkeeper Kit)
    // =================================================================
    function makeKeeperAtlas() {
      const cvs = document.createElement('canvas');
      cvs.width = 1024;
      cvs.height = 1024;
      const ctx = cvs.getContext('2d');

      ctx.fillStyle = '#10b981';
      ctx.fillRect(0, 0, 1024, 1024);

      // Front
      const fGrad = ctx.createLinearGradient(0, 0, 0, 512);
      fGrad.addColorStop(0, '#34d399');
      fGrad.addColorStop(0.5, '#10b981');
      fGrad.addColorStop(1, '#047857');
      ctx.fillStyle = fGrad;
      ctx.fillRect(0, 0, 512, 512);

      drawOfficialEmblem(ctx, 135, 175, 38, '#a7f3d0');

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 64px "Arial Black", sans-serif';
      ctx.fillStyle = '#064e3b';
      ctx.fillText('KEEPER', 256, 218);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('KEEPER', 256, 214);

      ctx.font = '900 148px "Arial Black", sans-serif';
      ctx.fillStyle = '#064e3b';
      ctx.fillText('1', 256, 335);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('1', 256, 330);

      // Back
      ctx.fillStyle = fGrad;
      ctx.fillRect(512, 0, 512, 512);
      ctx.font = '900 62px "Arial Black", sans-serif';
      ctx.fillStyle = '#064e3b';
      ctx.fillText('KEEPER', 768, 124);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('KEEPER', 768, 120);
      ctx.font = '900 210px "Arial Black", sans-serif';
      ctx.fillStyle = '#064e3b';
      ctx.fillText('1', 768, 275);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('1', 768, 270);

      // Shorts (Black keeper shorts)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 512, 512, 256);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(10, 512, 24, 256);
      ctx.fillRect(478, 512, 24, 256);

      // Face & Skin
      const faceGrad = ctx.createLinearGradient(512, 512, 512, 768);
      faceGrad.addColorStop(0, '#fde68a');
      faceGrad.addColorStop(0.5, '#fed7aa');
      faceGrad.addColorStop(1, '#fb923c');
      ctx.fillStyle = faceGrad;
      ctx.fillRect(512, 512, 256, 256);

      // Hair
      drawVolumetricHair(ctx, 768, 512, 256, 128, '#261c14', '#3d2e22', '#140e0a');

      // Eye
      drawStylizedEye(ctx, 768, 640, 128, 128, '#34d399', '#059669');

      // Brows
      ctx.fillStyle = '#140e0a';
      ctx.fillRect(896, 640, 128, 128);

      // Leg Skin
      ctx.fillStyle = faceGrad;
      ctx.fillRect(0, 768, 256, 256);

      // Emerald Socks & Padded Goalkeeper Gloves
      ctx.fillStyle = '#10b981';
      ctx.fillRect(256, 768, 256, 256);
      ctx.fillStyle = '#34d399';
      ctx.fillRect(256, 768, 256, 40);

      // Goalkeeper Cleats
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(512, 768, 512, 256);
      ctx.fillStyle = '#34d399';
      ctx.fillRect(512, 860, 512, 30);
      ctx.fillStyle = '#022c22';
      ctx.fillRect(512, 970, 512, 54);

      return cvs.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
    }

    return {
      footyAtlas: makeFootyAtlas(),
      hoopsAtlas: makeHoopsAtlas(),
      keeperAtlas: makeKeeperAtlas()
    };
  }, emblemBase64);

  await browser.close();
  console.log('✓ All 3 True Hero Atlases successfully baked.');
  return { footyAtlas, hoopsAtlas, keeperAtlas };
}

function processHeroGlb(baseGlbPath, outGlbPath, atlasBase64, charType) {
  console.log(`\n--- Sculpting & Rigging Hero GLB: ${charType} -> ${path.basename(outGlbPath)} ---`);
  const buf = fs.readFileSync(baseGlbPath);
  const jsonLen = buf.readUInt32LE(12);
  const gltf = JSON.parse(buf.subarray(20, 20 + jsonLen).toString('utf8'));
  const bin = Buffer.from(buf.subarray(20 + jsonLen + 8)); // independent mutable buffer

  const isHoops = (charType === 'hoops');
  const isFooty = (charType === 'footy');
  const isKeeper = (charType === 'keeper');

  const headMesh = gltf.meshes.find(m => m.name === 'Cube.015');
  const torsoMesh = gltf.meshes.find(m => m.name === 'Cube.010');
  const legsMesh = gltf.meshes.find(m => m.name === 'Cube.019');
  const feetMesh = gltf.meshes.find(m => m.name === 'Cube.003');

  function getAttrOffsets(prim, attrName) {
    const accIdx = prim.attributes[attrName];
    if (accIdx === undefined) return null;
    const acc = gltf.accessors[accIdx];
    const bv = gltf.bufferViews[acc.bufferView];
    return {
      offset: (bv.byteOffset || 0) + (acc.byteOffset || 0),
      count: acc.count
    };
  }

  // 1. TUCK SKULL UNDER HAIR (Prevent bare scalp poking out through the top of the hair)
  if (headMesh && headMesh.primitives[0]) {
    const pos = getAttrOffsets(headMesh.primitives[0], 'POSITION');
    let skullTucked = 0;
    if (pos) {
      for (let i = 0; i < pos.count; i++) {
        const off = pos.offset + i * 12;
        let x = bin.readFloatLE(off);
        let y = bin.readFloatLE(off + 4);
        let z = bin.readFloatLE(off + 8);

        // Under-hair skull vertices: tuck downwards so hair completely envelops the head
        if (y > 1.68 && z < 0.08) {
          bin.writeFloatLE(Math.min(1.68, y - 0.09), off + 4);
          bin.writeFloatLE(x * 0.88, off);
          skullTucked++;
        }
        if (y > 1.56 && z < -0.01) {
          bin.writeFloatLE(Math.max(-0.020, z * 0.40), off + 8);
        }
      }
      console.log(`  ✓ Head Skin: Tucked ${skullTucked} under-hair skull vertices (Zero bare scalp clipping).`);
    }
  }

  // 2. HEROIC HAIRSTYLES (FLAT-TOP FOR HOOPS, TAPER FADE FOR FOOTY)
  // ZERO PONYTAIL / ZERO BUN!
  if (headMesh && headMesh.primitives[3]) {
    const pos = getAttrOffsets(headMesh.primitives[3], 'POSITION');
    let bunVerticesFixed = 0;
    if (pos) {
      for (let i = 0; i < pos.count; i++) {
        const off = pos.offset + i * 12;
        let x = bin.readFloatLE(off);
        let y = bin.readFloatLE(off + 4);
        let z = bin.readFloatLE(off + 8);

        // Completely eradicate ponytail/bun at back of neck by collapsing into head center
        if (z < -0.015 && y < 1.68) {
          bin.writeFloatLE(x * 0.04, off);
          bin.writeFloatLE(1.64, off + 4);
          bin.writeFloatLE(-0.008, off + 8);
          bunVerticesFixed++;
        }

        if (isHoops) {
          // Sharp High Flat-Top Fade: Square off the top and give it heroic height
          if (y > 1.68) {
            const flatTopY = Math.max(1.82, Math.min(1.92, y + 0.08));
            bin.writeFloatLE(flatTopY, off + 4);
            bin.writeFloatLE(x * 1.08, off); // Square sides
            bin.writeFloatLE(z * 1.04, off + 8);
          }
        } else {
          // Sleek swept taper fade
          if (y > 1.68) {
            bin.writeFloatLE(Math.max(1.78, Math.min(1.88, y + 0.04)), off + 4);
            bin.writeFloatLE(z + 0.015, off + 8);
          }
        }
      }
      console.log(`  ✓ Hair: Sculpted ${isHoops ? 'Flat-Top Fade' : 'Taper Fade'} (Collapsed ${bunVerticesFixed} bun vertices, ZERO bun remains).`);
    }
  }

  // 3. SLEEVELESS TANK TOP FOR HOOPS #23 (CUT SLEEVES & EXPOSE ARMS)
  if (torsoMesh && torsoMesh.primitives[1]) {
    const pos = getAttrOffsets(torsoMesh.primitives[1], 'POSITION');
    let sleevesCut = 0;
    if (pos) {
      for (let i = 0; i < pos.count; i++) {
        const off = pos.offset + i * 12;
        let x = bin.readFloatLE(off);
        let y = bin.readFloatLE(off + 4);
        let z = bin.readFloatLE(off + 8);

        if (isHoops) {
          // Cut sleeves: tuck into armhole to expose bare muscular deltoids underneath!
          if (Math.abs(x) > 0.155 && y > 1.20 && y < 1.55) {
            x = Math.sign(x) * 0.140; // Tucked tight inside armhole!
            bin.writeFloatLE(x, off);
            sleevesCut++;
          } else if (y > 1.34) {
            x = x * 1.08; // Broaden muscular shoulders inside the tank top
            bin.writeFloatLE(x, off);
          }
          // Muscular chest definition
          if (y > 1.25 && y < 1.48 && z > 0.04) {
            bin.writeFloatLE(z + 0.018, off + 8);
          }
          // Athletic V-taper waist
          if (y < 1.22) {
            bin.writeFloatLE(x * 0.94, off);
          }
        } else {
          // Footy soccer forward build
          if (y > 1.34) bin.writeFloatLE(x * 1.06, off);
          if (y > 1.25 && y < 1.48 && z > 0.04) bin.writeFloatLE(z + 0.012, off + 8);
          if (y < 1.22) bin.writeFloatLE(x * 0.95, off);
        }
      }
      console.log(`  ✓ Torso: Sculpted V-taper.${isHoops ? ` Cut ${sleevesCut} sleeve vertices for sleeveless tank.` : ''}`);
    }
  }

  // 4. SCULPT BARE ARMS & DELTOIDS (Cube.010 Prim 0)
  if (torsoMesh && torsoMesh.primitives[0]) {
    const pos = getAttrOffsets(torsoMesh.primitives[0], 'POSITION');
    const uvs = getAttrOffsets(torsoMesh.primitives[0], 'TEXCOORD_0');
    let accessoriesMapped = 0;

    if (pos) {
      for (let i = 0; i < pos.count; i++) {
        const off = pos.offset + i * 12;
        let x = bin.readFloatLE(off);
        let y = bin.readFloatLE(off + 4);
        let z = bin.readFloatLE(off + 8);

        if (isHoops) {
          // Muscular NBA bicep/tricep volume
          if (Math.abs(x) > 0.18) {
            bin.writeFloatLE(x * 1.08, off);
          }
          if (y > 1.28 && y < 1.45 && Math.abs(x) > 0.18) {
            bin.writeFloatLE(z * 1.14, off + 8);
          }

          // Left Arm Compression Sleeve (horizontal T-pose: x between -0.74 and -0.36)
          if (uvs && x < -0.36 && x > -0.74) {
            const uvOff = uvs.offset + i * 8;
            bin.writeFloatLE(0.35, uvOff);     // compression sleeve texture zone
            bin.writeFloatLE(0.88, uvOff + 4);
            accessoriesMapped++;
          }
          // Right Arm Gold Wristband (horizontal T-pose: x between 0.66 and 0.74)
          else if (uvs && x > 0.66 && x < 0.74) {
            const uvOff = uvs.offset + i * 8;
            bin.writeFloatLE(0.35, uvOff);     // gold wristband texture zone
            bin.writeFloatLE(0.78, uvOff + 4);
            accessoriesMapped++;
          }
        } else if (isKeeper) {
          // Goalkeeper Padded Gloves on both hands (x < -0.68 or x > 0.68)
          if (uvs && Math.abs(x) > 0.68) {
            const uvOff = uvs.offset + i * 8;
            bin.writeFloatLE(0.375, uvOff);
            bin.writeFloatLE(0.880, uvOff + 4);
            accessoriesMapped++;
          }
        } else {
          // Soccer forward arms
          if (Math.abs(x) > 0.18) {
            bin.writeFloatLE(x * 1.03, off);
          }
        }
      }
      console.log(`  ✓ Arms: Sculpted athletic arms.${isHoops ? ` Mapped ${accessoriesMapped} vertices to compression sleeve & gold wristband.` : ''}`);
    }
  }

  // 5. REMAP LEGS: EXPOSE BARE KNEES & ATHLETIC CALVES (Cube.019 Prim 0)
  if (legsMesh && legsMesh.primitives[0]) {
    const pos = getAttrOffsets(legsMesh.primitives[0], 'POSITION');
    const uvs = getAttrOffsets(legsMesh.primitives[0], 'TEXCOORD_0');
    let bareKneeCount = 0;
    let sockCount = 0;

    if (pos && uvs) {
      for (let i = 0; i < pos.count; i++) {
        const off = pos.offset + i * 12;
        const uvOff = uvs.offset + i * 8;
        const x = bin.readFloatLE(off);
        const y = bin.readFloatLE(off + 4);
        const z = bin.readFloatLE(off + 8);

        if (isHoops) {
          // Loose basketball shorts: y > 0.52 -> stay on shorts (u: 0..0.5, v: 0.5..0.72)
          // Bare knees & muscular calves: 0.24 <= y <= 0.52 -> map to BARE BRONZE SKIN (u: 0.125, v: 0.85)
          if (y >= 0.24 && y <= 0.52) {
            bin.writeFloatLE(0.125, uvOff);
            bin.writeFloatLE(0.850, uvOff + 4);
            bareKneeCount++;
          }
          // Black ankle socks: y < 0.24 -> map to black socks (u: 0.35, v: 0.92)
          else if (y < 0.24) {
            bin.writeFloatLE(0.350, uvOff);
            bin.writeFloatLE(0.920, uvOff + 4);
            sockCount++;
          }
        } else {
          // Soccer shorts: y > 0.50
          // Bare knees & lower thighs: 0.36 <= y <= 0.50 -> map to BARE TAN SKIN (u: 0.125, v: 0.85)
          if (y >= 0.36 && y <= 0.50) {
            bin.writeFloatLE(0.125, uvOff);
            bin.writeFloatLE(0.850, uvOff + 4);
            bareKneeCount++;
          }
          // Turquoise shin guards & socks: 0.18 <= y < 0.36 -> map to shin guards (u: 0.375, v: 0.880)
          else if (y >= 0.18 && y < 0.36) {
            bin.writeFloatLE(0.375, uvOff);
            bin.writeFloatLE(0.880, uvOff + 4);
            sockCount++;
          }
          // White ankle cuff: y < 0.18 -> map to white cuff (u: 0.375, v: 0.780)
          else if (y < 0.18) {
            bin.writeFloatLE(0.375, uvOff);
            bin.writeFloatLE(0.780, uvOff + 4);
            sockCount++;
          }
        }
      }
      console.log(`  ✓ Legs: Exposed ${bareKneeCount} bare knee/thigh vertices, mapped ${sockCount} sock/guard vertices.`);
    }
  }

  // 6. FEET & SHOES (Cube.003 Prim 0 & Prim 1)
  if (feetMesh && feetMesh.primitives[0]) {
    const pos = getAttrOffsets(feetMesh.primitives[0], 'POSITION');
    const uvs = getAttrOffsets(feetMesh.primitives[0], 'TEXCOORD_0');
    if (pos && uvs) {
      for (let i = 0; i < pos.count; i++) {
        const off = pos.offset + i * 12;
        const uvOff = uvs.offset + i * 8;
        let x = bin.readFloatLE(off);
        let y = bin.readFloatLE(off + 4);

        if (isHoops) {
          // High-top basketball sneakers: flatten soccer cleats/studs
          if (y < 0.038) {
            bin.writeFloatLE(0.024, off + 4);
          }
          // High-top ankle collar
          if (y > 0.16) {
            bin.writeFloatLE(Math.min(0.24, y + 0.04), off + 4);
          }
        }

        const normY = Math.max(0, Math.min(1, (0.241 - y) / 0.193));
        const normX = Math.max(-1, Math.min(1, x / 0.185));
        bin.writeFloatLE(0.75 + normX * 0.20, uvOff);
        bin.writeFloatLE(0.76 + normY * 0.22, uvOff + 4);
      }
      console.log(`  ✓ Feet: Re-projected ${isHoops ? 'high-top basketball sneaker' : 'soccer cleat'} UVs.`);
    }
  }

  // Flatten sole & stud geometry in Prim 1 for basketball sneakers
  if (isHoops && feetMesh && feetMesh.primitives[1]) {
    const pos = getAttrOffsets(feetMesh.primitives[1], 'POSITION');
    if (pos) {
      for (let i = 0; i < pos.count; i++) {
        const off = pos.offset + i * 12;
        let y = bin.readFloatLE(off + 4);
        if (y < 0.038) {
          bin.writeFloatLE(0.024, off + 4);
        }
      }
      console.log('  ✓ Feet: Flattened all soccer studs on basketball sneaker outsoles.');
    }
  }

  // 7. EMBED BAKED ATLAS INTO GLB
  const atlasBuf = Buffer.from(atlasBase64, 'base64');
  const atlasLength = atlasBuf.length;
  const padLength = (4 - (atlasLength % 4)) % 4;
  const totalAtlasLength = atlasLength + padLength;

  let imgBvIdx = -1;
  if (gltf.images && gltf.images.length > 0) {
    imgBvIdx = gltf.images[0].bufferView;
  }

  if (imgBvIdx === -1 || imgBvIdx === undefined) {
    imgBvIdx = gltf.bufferViews.length;
    gltf.bufferViews.push({
      buffer: 0,
      byteOffset: bin.length,
      byteLength: atlasLength
    });
  } else {
    gltf.bufferViews[imgBvIdx].byteOffset = bin.length;
    gltf.bufferViews[imgBvIdx].byteLength = atlasLength;
  }

  if (!gltf.images) gltf.images = [];
  if (gltf.images.length === 0) {
    gltf.images.push({ bufferView: imgBvIdx, mimeType: 'image/png', name: `${charType}_atlas` });
  } else {
    gltf.images[0].bufferView = imgBvIdx;
    gltf.images[0].mimeType = 'image/png';
    gltf.images[0].name = `${charType}_atlas`;
  }

  const paddedAtlas = Buffer.alloc(totalAtlasLength);
  atlasBuf.copy(paddedAtlas);

  const newBin = Buffer.concat([bin, paddedAtlas]);
  gltf.buffers[0].byteLength = newBin.length;

  const newJsonStr = JSON.stringify(gltf);
  const newJsonBuf = Buffer.from(newJsonStr, 'utf8');
  const jsonPad = (4 - (newJsonBuf.length % 4)) % 4;
  const totalJsonLen = newJsonBuf.length + jsonPad;
  const paddedJson = Buffer.alloc(totalJsonLen, 0x20);
  newJsonBuf.copy(paddedJson);

  const totalLen = 12 + 8 + totalJsonLen + 8 + newBin.length;
  const header = Buffer.alloc(12);
  header.write('glTF', 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(totalLen, 8);

  const jsonChunkHeader = Buffer.alloc(8);
  jsonChunkHeader.writeUInt32LE(totalJsonLen, 0);
  jsonChunkHeader.write('JSON', 4);

  const binChunkHeader = Buffer.alloc(8);
  binChunkHeader.writeUInt32LE(newBin.length, 0);
  binChunkHeader.write('BIN\0', 4);

  const finalGlb = Buffer.concat([header, jsonChunkHeader, paddedJson, binChunkHeader, newBin]);
  fs.writeFileSync(outGlbPath, finalGlb);
  console.log(`✓ Successfully baked & wrote: ${outGlbPath} (${(finalGlb.length / 1024 / 1024).toFixed(2)} MB)`);
}

async function run() {
  const { footyAtlas, hoopsAtlas, keeperAtlas } = await generateTrueHeroAtlases();

  // Save the PNG atlases as well for inspection
  fs.writeFileSync(path.join(ROOT, 'assets/characters/footy10_atlas.png'), Buffer.from(footyAtlas, 'base64'));
  fs.writeFileSync(path.join(ROOT, 'assets/characters/hoops23_atlas.png'), Buffer.from(hoopsAtlas, 'base64'));
  fs.writeFileSync(path.join(ROOT, 'assets/characters/keeper1_atlas.png'), Buffer.from(keeperAtlas, 'base64'));

  // Process all three hero athletes
  processHeroGlb(BASE_MODEL_PATH, path.join(ROOT, 'assets/characters/footy10.glb'), footyAtlas, 'footy');
  processHeroGlb(BASE_MODEL_PATH, path.join(ROOT, 'assets/characters/hoops23.glb'), hoopsAtlas, 'hoops');
  processHeroGlb(BASE_MODEL_PATH, path.join(ROOT, 'assets/characters/keeper1.glb'), keeperAtlas, 'keeper');

  // Copy to both workspace roots
  const ALT_ROOT = 'C:/Users/ASUS/Desktop/игра Footy Vs Hoops';
  if (fs.existsSync(ALT_ROOT)) {
    const copyList = [
      'assets/characters/footy10.glb',
      'assets/characters/hoops23.glb',
      'assets/characters/keeper1.glb',
      'assets/characters/footy10_atlas.png',
      'assets/characters/hoops23_atlas.png',
      'assets/characters/keeper1_atlas.png'
    ];
    for (const rel of copyList) {
      const src = path.join(ROOT, rel);
      const dst = path.join(ALT_ROOT, rel);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dst);
      }
    }
    console.log('✓ Synchronized all rebuilt GLBs and Atlases to alternate workspace:', ALT_ROOT);
  }

  console.log('\n=== TRUE FORTNITE HERO ATHLETES BAKING COMPLETE ===');
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
