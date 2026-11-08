const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const BASE_MODEL_PATH = path.join(ROOT, 'archive/dev_assets/footy10_backup_before_atlas.glb');

async function generateFlawlessAtlases() {
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
      ctx.fillStyle = 'rgba(10, 15, 26, 0.95)';
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
      // 1. Sclera
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
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 2.5;
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
      // Seamless, warm athletic skin tone — smooth organic gradient
      // (NO dark mouth or lip contours here to prevent bleeding onto the back of the neck!)
      const faceGrad = ctx.createLinearGradient(512, 512, 512, 768);
      faceGrad.addColorStop(0, '#f0a875'); // Warm forehead
      faceGrad.addColorStop(0.4, '#e6955e'); // Cheeks & nose
      faceGrad.addColorStop(0.7, '#d68146'); // Mid jaw
      faceGrad.addColorStop(1, '#c26e35'); // Chin & neck contour
      ctx.fillStyle = faceGrad;
      ctx.fillRect(512, 512, 256, 256);

      // Subtle cheek blush
      ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
      ctx.beginPath();
      ctx.arc(580, 630, 28, 0, Math.PI * 2);
      ctx.arc(700, 630, 28, 0, Math.PI * 2);
      ctx.fill();

      // --- E. HAIR (768..1024, 512..640) ---
      drawVolumetricHair(ctx, 768, 512, 256, 128, '#2e180d', '#4a2818', '#1c0e07');

      // --- F. EYE (768..896, 640..768) ---
      drawStylizedEye(ctx, 768, 640, 128, 128, '#38bdf8', '#0284c7');

      // --- G. EYEBROWS (896..1024, 640..768) ---
      ctx.fillStyle = '#1c0e07';
      ctx.fillRect(896, 640, 128, 128);

      // --- H. BARE LEG SKIN (0..256, 768..1024) ---
      ctx.fillStyle = faceGrad;
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
    // 2. HOOPS #23 ATLAS (Sleeveless Tank, Bronze Skin, Gold Kicks)
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

      // Metallic Gold Armhole Ribbing
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(0, 0, 60, 512);
      ctx.fillRect(452, 0, 60, 512);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(45, 0, 15, 512);
      ctx.fillRect(452, 0, 15, 512);

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
      // Seamless bronze skin gradient — smooth organic gradient
      // (NO mouth/beard contours here to prevent bleeding onto the back of the neck!)
      const bronzeGrad = ctx.createLinearGradient(512, 512, 512, 768);
      bronzeGrad.addColorStop(0, '#5a3825'); // Forehead
      bronzeGrad.addColorStop(0.4, '#4a2c1b'); // Cheeks
      bronzeGrad.addColorStop(0.75, '#3a2012'); // Chin
      bronzeGrad.addColorStop(1, '#2c170c'); // Neck
      ctx.fillStyle = bronzeGrad;
      ctx.fillRect(512, 512, 256, 256);

      // --- E. HAIR (768..1024, 512..640) ---
      drawVolumetricHair(ctx, 768, 512, 256, 128, '#141416', '#26262a', '#08080a');

      // --- F. EYE (768..896, 640..768) ---
      drawStylizedEye(ctx, 768, 640, 128, 128, '#854d0e', '#451a03');

      // --- G. EYEBROWS (896..1024, 640..768) ---
      ctx.fillStyle = '#08080a';
      ctx.fillRect(896, 640, 128, 128);

      // --- H. BARE LEG SKIN (0..256, 768..1024) ---
      ctx.fillStyle = bronzeGrad;
      ctx.fillRect(0, 768, 256, 256);

      // --- I. SOCKS, COMPRESSION SLEEVE & WRISTBAND (256..512, 768..1024) ---
      ctx.fillStyle = '#111827';
      ctx.fillRect(256, 768, 256, 256);
      // Gold wristband band
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(256, 768, 256, 45);
      // Compression sleeve matte fabric
      ctx.fillStyle = '#18181b';
      ctx.fillRect(256, 813, 256, 211);

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
      // Pure white cushioned rubber outsole (NO STUDS!)
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
      ctx.fillText('1', 270, 768);

      // Shorts
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 512, 512, 256);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(10, 512, 24, 256);
      ctx.fillRect(478, 512, 24, 256);

      // Face & Skin
      const faceGrad = ctx.createLinearGradient(512, 512, 512, 768);
      faceGrad.addColorStop(0, '#f0a875');
      faceGrad.addColorStop(0.5, '#e6955e');
      faceGrad.addColorStop(1, '#c26e35');
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
  console.log('✓ All 3 Flawless Hero Atlases successfully baked.');
  return { footyAtlas, hoopsAtlas, keeperAtlas };
}

// =========================================================================
// Area-Weighted Smooth Normal Calculator across all shared vertex positions
// =========================================================================
function recomputeSmoothNormals(bin, gltf, prim) {
  const posIdx = prim.attributes.POSITION;
  const normIdx = prim.attributes.NORMAL;
  if (posIdx === undefined || normIdx === undefined) return;

  const posAcc = gltf.accessors[posIdx];
  const normAcc = gltf.accessors[normIdx];
  const posBv = gltf.bufferViews[posAcc.bufferView];
  const normBv = gltf.bufferViews[normAcc.bufferView];

  const posOff = (posBv.byteOffset || 0) + (posAcc.byteOffset || 0);
  const normOff = (normBv.byteOffset || 0) + (normAcc.byteOffset || 0);
  const count = posAcc.count;

  // Extract indices
  let indices;
  if (prim.indices !== undefined) {
    const idxAcc = gltf.accessors[prim.indices];
    const idxBv = gltf.bufferViews[idxAcc.bufferView];
    const idxOff = (idxBv.byteOffset || 0) + (idxAcc.byteOffset || 0);
    const is32 = (idxAcc.componentType === 5125);
    indices = new (is32 ? Uint32Array : Uint16Array)(idxAcc.count);
    for (let k = 0; k < idxAcc.count; k++) {
      indices[k] = is32 ? bin.readUInt32LE(idxOff + k * 4) : bin.readUInt16LE(idxOff + k * 2);
    }
  } else {
    indices = new Uint16Array(count);
    for (let k = 0; k < count; k++) indices[k] = k;
  }

  // 1. Map unique positions
  const posMap = new Map();
  for (let i = 0; i < count; i++) {
    const x = bin.readFloatLE(posOff + i * 12);
    const y = bin.readFloatLE(posOff + i * 12 + 4);
    const z = bin.readFloatLE(posOff + i * 12 + 8);
    const key = (Math.round(x * 2000) / 2000) + '_' + (Math.round(y * 2000) / 2000) + '_' + (Math.round(z * 2000) / 2000);
    if (!posMap.has(key)) posMap.set(key, { normal: [0, 0, 0], indices: [] });
    posMap.get(key).indices.push(i);
  }

  // 2. Accumulate triangle normals
  const numTriangles = Math.floor(indices.length / 3);
  for (let t = 0; t < numTriangles; t++) {
    const i0 = indices[t * 3];
    const i1 = indices[t * 3 + 1];
    const i2 = indices[t * 3 + 2];

    const p0 = [bin.readFloatLE(posOff + i0 * 12), bin.readFloatLE(posOff + i0 * 12 + 4), bin.readFloatLE(posOff + i0 * 12 + 8)];
    const p1 = [bin.readFloatLE(posOff + i1 * 12), bin.readFloatLE(posOff + i1 * 12 + 4), bin.readFloatLE(posOff + i1 * 12 + 8)];
    const p2 = [bin.readFloatLE(posOff + i2 * 12), bin.readFloatLE(posOff + i2 * 12 + 4), bin.readFloatLE(posOff + i2 * 12 + 8)];

    const ax = p1[0] - p0[0], ay = p1[1] - p0[1], az = p1[2] - p0[2];
    const bx = p2[0] - p0[0], by = p2[1] - p0[1], bz = p2[2] - p0[2];

    let nx = ay * bz - az * by;
    let ny = az * bx - ax * bz;
    let nz = ax * by - ay * bx;

    const len = Math.hypot(nx, ny, nz);
    if (len > 1e-6) {
      nx /= len; ny /= len; nz /= len;
      for (const idx of [i0, i1, i2]) {
        const x = bin.readFloatLE(posOff + idx * 12);
        const y = bin.readFloatLE(posOff + idx * 12 + 4);
        const z = bin.readFloatLE(posOff + idx * 12 + 8);
        const key = (Math.round(x * 2000) / 2000) + '_' + (Math.round(y * 2000) / 2000) + '_' + (Math.round(z * 2000) / 2000);
        const entry = posMap.get(key);
        if (entry) {
          entry.normal[0] += nx;
          entry.normal[1] += ny;
          entry.normal[2] += nz;
        }
      }
    }
  }

  // 3. Normalize & write back to normal buffer
  for (const entry of posMap.values()) {
    let nx = entry.normal[0], ny = entry.normal[1], nz = entry.normal[2];
    const len = Math.hypot(nx, ny, nz);
    if (len > 1e-6) {
      nx /= len; ny /= len; nz /= len;
    } else {
      ny = 1; nx = 0; nz = 0;
    }
    for (const idx of entry.indices) {
      bin.writeFloatLE(nx, normOff + idx * 12);
      bin.writeFloatLE(ny, normOff + idx * 12 + 4);
      bin.writeFloatLE(nz, normOff + idx * 12 + 8);
    }
  }
}

function processHeroGlb(baseGlbPath, outGlbPath, atlasBase64, charType) {
  console.log(`\n--- Sculpting & Smoothing Hero GLB: ${charType} -> ${path.basename(outGlbPath)} ---`);
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

  // 1. HEROIC HAIRSTYLES & COLLAPSING BUN (REMAP BUN UVS TO HAIR ZONE — ZERO WHITE BLEED!)
  if (headMesh && headMesh.primitives[3]) {
    const pos = getAttrOffsets(headMesh.primitives[3], 'POSITION');
    const uvs = getAttrOffsets(headMesh.primitives[3], 'TEXCOORD_0');
    let bunVerticesFixed = 0;
    if (pos) {
      for (let i = 0; i < pos.count; i++) {
        const off = pos.offset + i * 12;
        let x = bin.readFloatLE(off);
        let y = bin.readFloatLE(off + 4);
        let z = bin.readFloatLE(off + 8);

        // Eradicate bun: smoothly contour flush against skull and remap UV to pure dark hair texture!
        if (z < -0.014 && y < 1.68) {
          bin.writeFloatLE(x * 0.95, off); // Preserve natural width across the back of the head
          bin.writeFloatLE(Math.max(1.57, y), off + 4); // Full taper coverage down to collar
          bin.writeFloatLE(Math.max(-0.014, z * 0.15), off + 8); // Flush against the skull
          if (uvs) {
            const uvOff = uvs.offset + i * 8;
            bin.writeFloatLE(0.880, uvOff);     // pure hair texture zone
            bin.writeFloatLE(0.560, uvOff + 4);
          }
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
      console.log(`  ✓ Hair: Sculpted ${isHoops ? 'Flat-Top Fade' : 'Taper Fade'} (Collapsed & remapped ${bunVerticesFixed} bun vertices, ZERO bun remains).`);
    }
  }

  // 2. TORSO & JERSEY: HEROIC V-TAPER & BROAD MUSCULAR SHOULDERS (Cube.010 Prim 1)
  // Clean continuous sculpting without tears, horn-spikes, or mesh breaks!
  if (torsoMesh && torsoMesh.primitives[1]) {
    const pos = getAttrOffsets(torsoMesh.primitives[1], 'POSITION');
    if (pos) {
      for (let i = 0; i < pos.count; i++) {
        const off = pos.offset + i * 12;
        let x = bin.readFloatLE(off);
        let y = bin.readFloatLE(off + 4);
        let z = bin.readFloatLE(off + 8);

        if (isHoops) {
          // Broad muscular shoulders
          if (y > 1.30) {
            bin.writeFloatLE(x * 1.06, off);
          }
          // Muscular chest definition
          if (y > 1.25 && y < 1.48 && z > 0.04) {
            bin.writeFloatLE(z + 0.015, off + 8);
          }
          // Muscular upper back
          if (y > 1.25 && y < 1.48 && z < -0.01) {
            bin.writeFloatLE(z - 0.012, off + 8);
          }
          // Athletic V-taper waist
          if (y < 1.20) {
            bin.writeFloatLE(x * 0.94, off);
          }
        } else {
          // Footy soccer forward build
          if (y > 1.30) bin.writeFloatLE(x * 1.05, off);
          if (y > 1.25 && y < 1.48 && z > 0.04) bin.writeFloatLE(z + 0.012, off + 8);
          if (y < 1.20) bin.writeFloatLE(x * 0.95, off);
        }
      }
      console.log(`  ✓ Torso: Sculpted seamless heroic V-taper physique.`);
    }
  }

  // 3. SCULPT BARE ARMS & DELTOIDS (Cube.010 Prim 0)
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
            bin.writeFloatLE(x * 1.04, off);
          }
          if (y > 1.28 && y < 1.48 && Math.abs(x) > 0.18) {
            bin.writeFloatLE(z * 1.06, off + 8);
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

  // 4. REMAP LEGS: EXPOSE BARE KNEES & ATHLETIC CALVES (Cube.019 Prim 0)
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

  // 5. FEET & SHOES (Cube.003 Prim 0, 1, 2)
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
          // High-top basketball sneaker ankle collar
          if (y > 0.16) {
            bin.writeFloatLE(Math.min(0.24, y + 0.04), off + 4);
          }
        }

        const normY = Math.max(0, Math.min(1, (0.241 - y) / 0.193));
        const normX = Math.max(-1, Math.min(1, x / 0.185));
        bin.writeFloatLE(0.75 + normX * 0.20, uvOff);
        bin.writeFloatLE(0.76 + normY * 0.22, uvOff + 4);
      }
    }
  }

  // Flatten sole & stud geometry for basketball sneakers:
  // Prim 1 is midsole, Prim 2 IS THE ACTUAL SOCCER STUDS (0.0012 .. 0.0300)
  if (isHoops && feetMesh) {
    [1, 2].forEach(pIdx => {
      if (feetMesh.primitives[pIdx]) {
        const pos = getAttrOffsets(feetMesh.primitives[pIdx], 'POSITION');
        if (pos) {
          for (let i = 0; i < pos.count; i++) {
            const off = pos.offset + i * 12;
            let y = bin.readFloatLE(off + 4);
            if (y < 0.038) {
              bin.writeFloatLE(0.024, off + 4); // Flush flat basketball sneaker outsole!
            }
          }
        }
      }
    });
    console.log('  ✓ Feet: Completely flattened all soccer studs in Prim 1 & Prim 2 for high-top basketball sneakers.');
  }

  // 6. AREA-WEIGHTED NORMAL SMOOTHING (ELIMINATES ALL HARSH LOW-POLY FACETING!)
  let smoothedPrimCount = 0;
  gltf.meshes.forEach(m => {
    (m.primitives || []).forEach(prim => {
      recomputeSmoothNormals(bin, gltf, prim);
      smoothedPrimCount++;
    });
  });
  console.log(`  ✓ Normals: Recomputed area-weighted smooth normals across all ${smoothedPrimCount} mesh primitives!`);

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
  const newJsonLen = Buffer.byteLength(newJsonStr, 'utf8');
  const jsonPad = (4 - (newJsonLen % 4)) % 4;
  const totalJsonLen = newJsonLen + jsonPad;

  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546C67, 0); // 'glTF'
  header.writeUInt32LE(2, 4);          // version 2
  const totalGlbLen = 12 + 8 + totalJsonLen + 8 + newBin.length;
  header.writeUInt32LE(totalGlbLen, 8);

  const jsonChunkHeader = Buffer.alloc(8);
  jsonChunkHeader.writeUInt32LE(totalJsonLen, 0);
  jsonChunkHeader.writeUInt32LE(0x4E4F534A, 4); // 'JSON'

  const jsonChunkBody = Buffer.alloc(totalJsonLen, 0x20); // space-padded
  jsonChunkBody.write(newJsonStr, 0, newJsonLen, 'utf8');

  const binChunkHeader = Buffer.alloc(8);
  binChunkHeader.writeUInt32LE(newBin.length, 0);
  binChunkHeader.writeUInt32LE(0x004E4942, 4); // 'BIN\0'

  const finalGlbBuf = Buffer.concat([
    header,
    jsonChunkHeader,
    jsonChunkBody,
    binChunkHeader,
    newBin
  ]);

  fs.writeFileSync(outGlbPath, finalGlbBuf);
  console.log(`✓ Saved ${charType} GLB to: ${outGlbPath} (${(finalGlbBuf.length / (1024 * 1024)).toFixed(2)} MB)`);
}

async function main() {
  console.log('================================================================');
  console.log('  FOOTY vs HOOPS: Flawless Fortnite Hero Athlete Generator  ');
  console.log('================================================================');

  const { footyAtlas, hoopsAtlas, keeperAtlas } = await generateFlawlessAtlases();

  // Save standalone PNG atlases
  const footyAtlasPath = path.join(ROOT, 'assets/characters/footy10_atlas.png');
  const hoopsAtlasPath = path.join(ROOT, 'assets/characters/hoops23_atlas.png');
  const keeperAtlasPath = path.join(ROOT, 'assets/characters/keeper1_atlas.png');

  fs.writeFileSync(footyAtlasPath, Buffer.from(footyAtlas, 'base64'));
  fs.writeFileSync(hoopsAtlasPath, Buffer.from(hoopsAtlas, 'base64'));
  fs.writeFileSync(keeperAtlasPath, Buffer.from(keeperAtlas, 'base64'));
  console.log('✓ All 3 PNG atlases saved.');

  // Process and save GLBs
  const footyGlbPath = path.join(ROOT, 'assets/characters/footy10.glb');
  const hoopsGlbPath = path.join(ROOT, 'assets/characters/hoops23.glb');
  const keeperGlbPath = path.join(ROOT, 'assets/characters/keeper1.glb');

  processHeroGlb(BASE_MODEL_PATH, footyGlbPath, footyAtlas, 'footy');
  processHeroGlb(BASE_MODEL_PATH, hoopsGlbPath, hoopsAtlas, 'hoops');
  processHeroGlb(BASE_MODEL_PATH, keeperGlbPath, keeperAtlas, 'keeper');

  console.log('\n✓ Flawless Fortnite Athlete Generation Complete!');
}

main().catch(err => {
  console.error('Bake error:', err);
  process.exit(1);
});
