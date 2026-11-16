const fs = require('fs');
const path = require('path');
const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const RIG_PATH = path.join(ROOT, 'archive/dev_assets/test_quaternius_casual2.glb');

// =========================================================================
// PART 1: BAKING PRISTINE 2048x2048 TEXTURES WITH CLEAN UV MAPPING
// =========================================================================
async function bakeScratchAtlases() {
  console.log('=== Step 1: Baking Pristine 2048x2048 Hero Atlases ===');
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const emblemB64 = fs.readFileSync(path.join(ROOT, 'public/emblem.png')).toString('base64');

  const { footyAtlas, hoopsAtlas, keeperAtlas } = await page.evaluate(async (embB64) => {
    function loadImg(b64) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = 'data:image/png;base64,' + b64;
      });
    }

    const emblemImg = await loadImg(embB64);

    function drawOfficialEmblem(ctx, x, y, r, borderCol = '#ffffff') {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r + 4, 0, Math.PI * 2);
      ctx.fillStyle = '#0a0f1d';
      ctx.fill();
      ctx.strokeStyle = borderCol;
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.drawImage(emblemImg, x - r, y - r, r * 2, r * 2);
      ctx.restore();
    }

    // High-Resolution Stylized Eye
    function drawStylizedEye(ctx, cx, cy, w, h, irisCol1, irisCol2) {
      ctx.save();
      // Sclera
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(cx, cy, w * 0.5, h * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Iris
      const irisR = h * 0.38;
      const irisGrad = ctx.createRadialGradient(cx, cy, irisR * 0.2, cx, cy, irisR);
      irisGrad.addColorStop(0, irisCol1);
      irisGrad.addColorStop(0.7, irisCol2);
      irisGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = irisGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, irisR, 0, Math.PI * 2);
      ctx.fill();

      // Pupil
      ctx.fillStyle = '#050508';
      ctx.beginPath();
      ctx.arc(cx, cy, irisR * 0.44, 0, Math.PI * 2);
      ctx.fill();

      // Double Catchlights
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx - irisR * 0.35, cy - irisR * 0.35, irisR * 0.24, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + irisR * 0.30, cy + irisR * 0.30, irisR * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // -----------------------------------------------------------------------
    // FOOTY #10 ATLAS (2048x2048)
    // -----------------------------------------------------------------------
    function makeFooty() {
      const cvs = document.createElement('canvas');
      cvs.width = 2048; cvs.height = 2048;
      const ctx = cvs.getContext('2d');

      // Base background: Dark navy
      ctx.fillStyle = '#0a101d';
      ctx.fillRect(0, 0, 2048, 2048);

      // --- 1. FRONT JERSEY (0..1024, 0..1024) ---
      const fGrad = ctx.createLinearGradient(0, 0, 1024, 1024);
      fGrad.addColorStop(0, '#00e5ff');
      fGrad.addColorStop(0.4, '#00c8ff');
      fGrad.addColorStop(1, '#0096c7');
      ctx.fillStyle = fGrad;
      ctx.fillRect(0, 0, 1024, 1024);

      // White raglan shoulder sleeves
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 220, 500);
      ctx.fillRect(804, 0, 220, 500);

      // Navy V-neck collar
      ctx.fillStyle = '#0a192f';
      ctx.beginPath();
      ctx.moveTo(340, 0); ctx.lineTo(684, 0); ctx.lineTo(512, 220); ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(340, 0); ctx.lineTo(512, 220); ctx.lineTo(684, 0);
      ctx.stroke();

      // Left Chest: Official Emblem (around x: 320, y: 380)
      drawOfficialEmblem(ctx, 320, 380, 72, '#00f0ff');

      // Front Wordmark: "FOOTY" & Number "10"
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 88px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#0a192f';
      ctx.fillText('FOOTY', 516, 446);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('FOOTY', 512, 440);

      ctx.font = '900 240px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#0a192f';
      ctx.fillText('10', 518, 688);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('10', 512, 680);

      // --- 2. BACK JERSEY (1024..2048, 0..1024) ---
      const bGrad = ctx.createLinearGradient(1024, 0, 2048, 1024);
      bGrad.addColorStop(0, '#00d2ff');
      bGrad.addColorStop(0.5, '#00b4d8');
      bGrad.addColorStop(1, '#0077b6');
      ctx.fillStyle = bGrad;
      ctx.fillRect(1024, 0, 1024, 1024);

      // White raglan shoulder inserts
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(1024, 0, 220, 500);
      ctx.fillRect(1828, 0, 220, 500);

      // Navy collar back
      ctx.fillStyle = '#0a192f';
      ctx.fillRect(1364, 0, 320, 60);

      // Back Wordmark: "FOOTY" & Large "10"
      ctx.font = '900 84px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#0a192f';
      ctx.fillText('FOOTY', 1540, 386);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('FOOTY', 1536, 380);

      ctx.font = '900 260px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#0a192f';
      ctx.fillText('10', 1542, 648);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('10', 1536, 640);

      // --- 3. FACE & SKIN (0..1024, 1024..1600) ---
      const faceGrad = ctx.createRadialGradient(512, 1312, 100, 512, 1312, 500);
      faceGrad.addColorStop(0, '#f9be9b');
      faceGrad.addColorStop(0.5, '#e89e74');
      faceGrad.addColorStop(1, '#cc7c50');
      ctx.fillStyle = faceGrad;
      ctx.fillRect(0, 1024, 1024, 576);

      // Stylized Eyes (Left: 340, 1260; Right: 684, 1260)
      drawStylizedEye(ctx, 340, 1260, 160, 110, '#38bdf8', '#0284c7');
      drawStylizedEye(ctx, 684, 1260, 160, 110, '#38bdf8', '#0284c7');

      // Athletic Eyebrows
      ctx.fillStyle = '#261810';
      ctx.beginPath();
      ctx.moveTo(240, 1180); ctx.lineTo(440, 1195); ctx.lineTo(430, 1225); ctx.lineTo(250, 1205); ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(784, 1180); ctx.lineTo(584, 1195); ctx.lineTo(594, 1225); ctx.lineTo(774, 1205); ctx.closePath();
      ctx.fill();

      // Expressive Smiling Mouth
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.arc(512, 1440, 110, 0.1, Math.PI - 0.1);
      ctx.closePath();
      ctx.fill();
      // White teeth
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(440, 1440, 144, 32);

      // --- 4. HAIR (1024..2048, 1024..1600) ---
      const hairGrad = ctx.createLinearGradient(1024, 1024, 2048, 1600);
      hairGrad.addColorStop(0, '#3d2417');
      hairGrad.addColorStop(0.5, '#2a170e');
      hairGrad.addColorStop(1, '#150a05');
      ctx.fillStyle = hairGrad;
      ctx.fillRect(1024, 1024, 1024, 576);
      // Volumetric hair strands
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 3;
      for (let y = 1040; y < 1600; y += 12) {
        ctx.beginPath();
        ctx.moveTo(1040, y); ctx.bezierCurveTo(1500, y - 30, 1700, y + 30, 2020, y);
        ctx.stroke();
      }

      // --- 5. SHORTS (0..1024, 1600..2048) ---
      const sGrad = ctx.createLinearGradient(0, 1600, 0, 2048);
      sGrad.addColorStop(0, '#0f172a');
      sGrad.addColorStop(0.5, '#090d16');
      sGrad.addColorStop(1, '#05070c');
      ctx.fillStyle = sGrad;
      ctx.fillRect(0, 1600, 1024, 448);

      // Lateral turquoise and white racing stripes
      ctx.fillStyle = '#00c8ff';
      ctx.fillRect(40, 1600, 50, 448);
      ctx.fillRect(934, 1600, 50, 448);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(90, 1600, 20, 448);
      ctx.fillRect(914, 1600, 20, 448);

      // Left Thigh: White number "10"
      ctx.font = '900 130px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#0284c7';
      ctx.fillText('10', 320, 1826);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('10', 320, 1820);

      // Right Thigh: Club Crest
      drawOfficialEmblem(ctx, 704, 1820, 64, '#00f0ff');

      // --- 6. BOOTS & SOCKS (1024..2048, 1600..2048) ---
      ctx.fillStyle = '#00c8ff';
      ctx.fillRect(1024, 1600, 1024, 448);
      // Shin guard plate
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.roundRect(1124, 1650, 824, 200, 30);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.stroke();
      // White speed swoosh on boots
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.moveTo(1100, 1950);
      ctx.bezierCurveTo(1350, 1880, 1650, 2000, 1950, 1900);
      ctx.stroke();

      return cvs.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
    }

    // -----------------------------------------------------------------------
    // HOOPS #23 ATLAS (2048x2048)
    // -----------------------------------------------------------------------
    function makeHoops() {
      const cvs = document.createElement('canvas');
      cvs.width = 2048; cvs.height = 2048;
      const ctx = cvs.getContext('2d');

      ctx.fillStyle = '#0a0b0e';
      ctx.fillRect(0, 0, 2048, 2048);

      // --- 1. FRONT TANK JERSEY (0..1024, 0..1024) ---
      const fGrad = ctx.createLinearGradient(0, 0, 1024, 1024);
      fGrad.addColorStop(0, '#1c1d24');
      fGrad.addColorStop(0.5, '#121318');
      fGrad.addColorStop(1, '#090a0d');
      ctx.fillStyle = fGrad;
      ctx.fillRect(0, 0, 1024, 1024);

      // Metallic Gold Armhole Trim (Sleeveless Tank)
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(0, 0, 140, 520);
      ctx.fillRect(884, 0, 140, 520);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(130, 0, 14, 520);
      ctx.fillRect(884, 0, 14, 520);

      // Deep Gold V-Neck Collar
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(320, 0); ctx.lineTo(704, 0); ctx.lineTo(512, 230); ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#121318';
      ctx.beginPath();
      ctx.moveTo(350, 0); ctx.lineTo(674, 0); ctx.lineTo(512, 195); ctx.closePath();
      ctx.fill();

      // Left Chest: Official Emblem
      drawOfficialEmblem(ctx, 320, 380, 72, '#fbbf24');

      // Arched Wordmark "HOOPS" in metallic gold
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 96px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#78350f';
      ctx.fillText('HOOPS', 516, 446);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('HOOPS', 512, 440);

      // Legendary Squad Number "23"
      ctx.font = '900 250px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#78350f';
      ctx.fillText('23', 518, 688);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('23', 512, 680);

      // --- 2. BACK JERSEY (1024..2048, 0..1024) ---
      ctx.fillStyle = fGrad;
      ctx.fillRect(1024, 0, 1024, 1024);

      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(1024, 0, 140, 520);
      ctx.fillRect(1908, 0, 140, 520);

      ctx.font = '900 92px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#78350f';
      ctx.fillText('HOOPS', 1540, 386);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('HOOPS', 1536, 380);

      ctx.font = '900 270px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#78350f';
      ctx.fillText('23', 1542, 648);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('23', 1536, 640);

      // --- 3. FACE & BRONZE SKIN (0..1024, 1024..1600) ---
      const skinGrad = ctx.createRadialGradient(512, 1312, 100, 512, 1312, 500);
      skinGrad.addColorStop(0, '#9e623f');
      skinGrad.addColorStop(0.6, '#7d4a2d');
      skinGrad.addColorStop(1, '#5c331a');
      ctx.fillStyle = skinGrad;
      ctx.fillRect(0, 1024, 1024, 576);

      // Eyes
      drawStylizedEye(ctx, 340, 1260, 160, 110, '#ca8a04', '#78350f');
      drawStylizedEye(ctx, 684, 1260, 160, 110, '#ca8a04', '#78350f');

      // Sharp Beard Contour (Natural, soft fade)
      const bGrad = ctx.createRadialGradient(512, 1460, 80, 512, 1460, 220);
      bGrad.addColorStop(0, '#0a0a0d');
      bGrad.addColorStop(0.7, '#15161c');
      bGrad.addColorStop(1, 'rgba(21, 22, 28, 0)');
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.arc(512, 1460, 220, 0, Math.PI);
      ctx.fill();

      // Eyebrows
      ctx.fillStyle = '#0a0a0d';
      ctx.fillRect(250, 1180, 180, 30);
      ctx.fillRect(594, 1180, 180, 30);

      // Smile
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(512, 1430, 80, 0.2, Math.PI - 0.2);
      ctx.closePath();
      ctx.fill();

      // --- 4. HIGH FLAT-TOP FADE HAIR (1024..2048, 1024..1600) ---
      const hGrad = ctx.createLinearGradient(1024, 1024, 2048, 1600);
      hGrad.addColorStop(0, '#1c1d22');
      hGrad.addColorStop(0.5, '#121215');
      hGrad.addColorStop(1, '#070709');
      ctx.fillStyle = hGrad;
      ctx.fillRect(1024, 1024, 1024, 576);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 3;
      for (let y = 1040; y < 1600; y += 10) {
        ctx.beginPath();
        ctx.moveTo(1040, y); ctx.lineTo(2020, y);
        ctx.stroke();
      }

      // --- 5. BASKETBALL SHORTS (0..1024, 1600..2048) ---
      ctx.fillStyle = '#121318';
      ctx.fillRect(0, 1600, 1024, 448);

      // Gold Chevron side striping
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 36;
      ctx.beginPath();
      ctx.moveTo(60, 1620); ctx.lineTo(130, 1780); ctx.lineTo(60, 1940);
      ctx.moveTo(964, 1620); ctx.lineTo(894, 1780); ctx.lineTo(964, 1940);
      ctx.stroke();

      // Gold hem
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(0, 2018, 1024, 30);

      // Gold squad number "23" on left thigh
      ctx.font = '900 140px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#78350f';
      ctx.fillText('23', 320, 1826);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('23', 320, 1820);

      // Official emblem on right thigh
      drawOfficialEmblem(ctx, 704, 1820, 64, '#fbbf24');

      // --- 6. BASKETBALL SNEAKERS & COMPRESSION SLEEVE (1024..2048, 1600..2048) ---
      ctx.fillStyle = '#121318';
      ctx.fillRect(1024, 1600, 1024, 448);
      // Gold sneaker panels
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(1100, 1700, 260, 240);
      ctx.fillRect(1684, 1700, 260, 240);
      // Thick white EVA midsole
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(1024, 1960, 1024, 60);
      // Black rubber outsole
      ctx.fillStyle = '#090a0d';
      ctx.fillRect(1024, 2020, 1024, 28);

      return cvs.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
    }

    // -----------------------------------------------------------------------
    // KEEPER #1 ATLAS (2048x2048)
    // -----------------------------------------------------------------------
    function makeKeeper() {
      const cvs = document.createElement('canvas');
      cvs.width = 2048; cvs.height = 2048;
      const ctx = cvs.getContext('2d');

      ctx.fillStyle = '#064e3b';
      ctx.fillRect(0, 0, 2048, 2048);

      // Front Emerald Jersey
      const kGrad = ctx.createLinearGradient(0, 0, 1024, 1024);
      kGrad.addColorStop(0, '#10b981');
      kGrad.addColorStop(0.5, '#059669');
      kGrad.addColorStop(1, '#047857');
      ctx.fillStyle = kGrad;
      ctx.fillRect(0, 0, 1024, 1024);

      // Hexagon pulse pattern
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 4;
      for (let y = 80; y < 1000; y += 90) {
        for (let x = 60; x < 980; x += 100) {
          ctx.beginPath();
          ctx.arc(x, y, 36, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      drawOfficialEmblem(ctx, 320, 380, 72, '#34d399');

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 88px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#064e3b';
      ctx.fillText('KEEPER', 516, 446);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('KEEPER', 512, 440);

      ctx.font = '900 250px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#064e3b';
      ctx.fillText('1', 518, 688);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('1', 512, 680);

      // Back Jersey
      ctx.fillStyle = kGrad;
      ctx.fillRect(1024, 0, 1024, 1024);
      ctx.font = '900 84px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#064e3b';
      ctx.fillText('KEEPER', 1540, 386);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('KEEPER', 1536, 380);
      ctx.font = '900 270px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#064e3b';
      ctx.fillText('1', 1542, 648);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('1', 1536, 640);

      // Face & Hair & Shorts & Cleats
      ctx.fillStyle = '#e89e74';
      ctx.fillRect(0, 1024, 1024, 576);
      drawStylizedEye(ctx, 340, 1260, 160, 110, '#10b981', '#047857');
      drawStylizedEye(ctx, 684, 1260, 160, 110, '#10b981', '#047857');

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(1024, 1024, 1024, 576); // Hair

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 1600, 1024, 448); // Charcoal shorts
      ctx.fillStyle = '#10b981';
      ctx.fillRect(40, 1600, 40, 448);
      ctx.fillRect(944, 1600, 40, 448);
      ctx.font = '900 130px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('1', 320, 1820);
      drawOfficialEmblem(ctx, 704, 1820, 64, '#10b981');

      ctx.fillStyle = '#10b981';
      ctx.fillRect(1024, 1600, 1024, 448); // Emerald boots

      return cvs.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
    }

    return {
      footyAtlas: makeFooty(),
      hoopsAtlas: makeHoops(),
      keeperAtlas: makeKeeper()
    };
  }, emblemB64);

  await browser.close();

  fs.writeFileSync(path.join(ROOT, 'assets/characters/footy10_atlas.png'), Buffer.from(footyAtlas, 'base64'));
  fs.writeFileSync(path.join(ROOT, 'assets/characters/hoops23_atlas.png'), Buffer.from(hoopsAtlas, 'base64'));
  fs.writeFileSync(path.join(ROOT, 'assets/characters/keeper1_atlas.png'), Buffer.from(keeperAtlas, 'base64'));

  console.log('✓ Successfully baked all 3 Hero 2048x2048 Atlases.');
}

// =========================================================================
// PART 2: 3D ATHLETIC HERO GEOMETRY SYNTHESIZER (PURE CODE FROM SCRATCH)
// =========================================================================
class HeroMeshBuilder {
  constructor() {
    this.positions = [];
    this.normals = [];
    this.uvs = [];
    this.joints = [];
    this.weights = [];
    this.indices = [];
  }

  // Add vertex with skin weights
  addVertex(p, n, uv, j, w) {
    const idx = this.positions.length / 3;
    this.positions.push(p[0], p[1], p[2]);
    this.normals.push(n[0], n[1], n[2]);
    this.uvs.push(uv[0], uv[1]);
    this.joints.push(j[0], j[1], j[2], j[3]);
    this.weights.push(w[0], w[1], w[2], w[3]);
    return idx;
  }

  addQuad(i0, i1, i2, i3) {
    this.indices.push(i0, i1, i2, i0, i2, i3);
  }

  // Smooth tube / loft between rings
  addLoft(rings, closeStart = false, closeEnd = false) {
    // rings is array of [{ points: [ [x,y,z], ... ], normals: [ ... ], uvs: [ [u,v], ... ], joints, weights }]
    const numRings = rings.length;
    const numPoints = rings[0].points.length;
    const ringVertIndices = [];

    for (let r = 0; r < numRings; r++) {
      const ring = rings[r];
      const indicesInRing = [];
      for (let p = 0; p < numPoints; p++) {
        const vIdx = this.addVertex(
          ring.points[p],
          ring.normals[p],
          ring.uvs[p],
          ring.joints[p] || ring.joints,
          ring.weights[p] || ring.weights
        );
        indicesInRing.push(vIdx);
      }
      ringVertIndices.push(indicesInRing);
    }

    // Connect rings
    for (let r = 0; r < numRings - 1; r++) {
      for (let p = 0; p < numPoints; p++) {
        const nextP = (p + 1) % numPoints;
        const i0 = ringVertIndices[r][p];
        const i1 = ringVertIndices[r][nextP];
        const i2 = ringVertIndices[r + 1][nextP];
        const i3 = ringVertIndices[r + 1][p];
        this.addQuad(i0, i1, i2, i3);
      }
    }
  }

  // Generate smooth athletic head with facial profile & volumetric hair
  buildHeroicHead(baseY = 1.55, height = 0.28, radius = 0.12, isHoops = false) {
    const numRings = 16;
    const numSegs = 24;
    const rings = [];

    for (let r = 0; r <= numRings; r++) {
      const phi = (r / numRings) * Math.PI; // 0 (top) to PI (chin)
      const ringY = baseY + height * 0.5 + Math.cos(phi) * (height * 0.5);
      const ringR = Math.sin(phi) * radius;

      const points = [];
      const normals = [];
      const uvs = [];
      const j = [7, 6, 0, 0]; // Head, Neck
      const wFactor = Math.max(0, Math.min(1, (ringY - 1.48) / 0.15));
      const w = [wFactor, 1 - wFactor, 0, 0];

      for (let s = 0; s < numSegs; s++) {
        const theta = (s / numSegs) * Math.PI * 2;
        let rx = Math.sin(theta) * ringR;
        let rz = Math.cos(theta) * ringR;

        // Facial sculpt: jawline & cheek narrowing
        if (phi > Math.PI * 0.5) {
          rx *= 0.88; // Athletic jaw
          if (rz > 0) rz *= 1.15; // Chin protrusion
        }

        // Hair styling: Volumetric Quiff (Footy) or Flat-top fade (Hoops)
        if (phi < Math.PI * 0.4) {
          if (isHoops) {
            // High flat-top fade: elevate and square off
            if (ringY > baseY + height * 0.3) {
              rx *= 1.12;
              rz *= 1.08;
            }
          } else {
            // Sculpted Pompadour Quiff: upward and backward crest
            if (rz > 0) rx *= 1.05;
            else rz *= 0.95;
          }
        }

        // UV: Front face maps to (0.1..0.45, 0.55..0.9), hair maps to (0.55..0.9, 0.55..0.8)
        let u, v;
        if (rz >= 0) {
          // Front of face
          u = 0.10 + (rx / (radius * 1.2) + 0.5) * 0.35;
          v = 0.55 + (1 - r / numRings) * 0.35;
        } else {
          // Hair / back of head
          u = 0.55 + (-rx / (radius * 1.2) + 0.5) * 0.35;
          v = 0.55 + (1 - r / numRings) * 0.25;
        }

        const norm = [Math.sin(theta) * Math.sin(phi), Math.cos(phi), Math.cos(theta) * Math.sin(phi)];
        points.push([rx, ringY, rz]);
        normals.push(norm);
        uvs.push([Math.max(0, Math.min(1, u)), Math.max(0, Math.min(1, v))]);
      }

      rings.push({ points, normals, uvs, joints: j, weights: w });
    }

    this.addLoft(rings);
  }

  // Generate heroic V-taper muscular torso & jersey
  buildHeroicTorso(isHoops = false) {
    const yTop = 1.48;
    const yWaist = 0.98;
    const numRings = 14;
    const numSegs = 28;
    const rings = [];

    for (let r = 0; r <= numRings; r++) {
      const t = r / numRings; // 0 (neck) to 1 (waist)
      const y = yTop - t * (yTop - yWaist);

      // V-Taper athletic width (broad chest, narrow waist)
      const chestWidth = isHoops ? 0.26 : 0.24;
      const waistWidth = isHoops ? 0.17 : 0.16;
      const wX = chestWidth * (1 - t * 0.32);
      const wZ = 0.13 * (1 - t * 0.18);

      // Skinning weights: Chest (5), Torso (4), Abdomen (3), Hips (2)
      let j0 = 5, j1 = 4, f = 1;
      if (y > 1.32) {
        j0 = 5; j1 = 6; f = (y - 1.32) / 0.16; // Chest to Neck
      } else if (y > 1.15) {
        j0 = 4; j1 = 5; f = (y - 1.15) / 0.17; // Torso to Chest
      } else if (y > 1.02) {
        j0 = 3; j1 = 4; f = (y - 1.02) / 0.13; // Abdomen to Torso
      } else {
        j0 = 2; j1 = 3; f = (y - 0.98) / 0.04; // Hips to Abdomen
      }
      const joints = [j0, j1, 0, 0];
      const weights = [f, 1 - f, 0, 0];

      const points = [];
      const normals = [];
      const uvs = [];

      for (let s = 0; s < numSegs; s++) {
        const theta = (s / numSegs) * Math.PI * 2;
        let px = Math.sin(theta) * wX;
        let pz = Math.cos(theta) * wZ;

        // Pectoral athletic curvature in front
        if (pz > 0 && y > 1.25 && y < 1.44) {
          pz += Math.sin(Math.PI * ((y - 1.25) / 0.19)) * 0.035 * Math.cos(theta);
        }

        // UV Mapping:
        // Front (pz >= 0): maps to (0.05..0.48, 0.05..0.48)
        // Back (pz < 0): maps to (0.52..0.95, 0.05..0.48)
        let u, v = 0.05 + t * 0.42;
        if (pz >= 0) {
          // Front chest: left-to-right (px from -wX to +wX)
          u = 0.05 + ((px / wX) * 0.5 + 0.5) * 0.42;
        } else {
          // Back jersey: left-to-right (px from -wX to +wX)
          u = 0.52 + ((px / wX) * 0.5 + 0.5) * 0.42;
        }

        const nx = Math.sin(theta);
        const nz = Math.cos(theta);
        points.push([px, y, pz]);
        normals.push([nx, 0, nz]);
        uvs.push([Math.max(0, Math.min(1, u)), Math.max(0, Math.min(1, v))]);
      }

      rings.push({ points, normals, uvs, joints, weights });
    }

    this.addLoft(rings);
  }

  // Generate muscular athletic limb (arm or leg)
  buildAthleticLimb(start, end, rStart, rEnd, bone0, bone1, isArm = true, isLeft = true) {
    const numRings = 10;
    const numSegs = 16;
    const rings = [];

    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const dz = end[2] - start[2];
    const len = Math.hypot(dx, dy, dz);
    const dir = [dx / len, dy / len, dz / len];

    for (let r = 0; r <= numRings; r++) {
      const t = r / numRings;
      const cx = start[0] + dx * t;
      const cy = start[1] + dy * t;
      const cz = start[2] + dz * t;

      // Muscle bulge in mid-section
      const bulge = Math.sin(t * Math.PI) * (isArm ? 0.016 : 0.024);
      const rad = (rStart * (1 - t) + rEnd * t) + bulge;

      const j = [bone0, bone1, 0, 0];
      const w = [1 - t, t, 0, 0];

      const points = [];
      const normals = [];
      const uvs = [];

      for (let s = 0; s < numSegs; s++) {
        const theta = (s / numSegs) * Math.PI * 2;
        const px = cx + Math.sin(theta) * rad;
        const py = cy;
        const pz = cz + Math.cos(theta) * rad;

        let u = isArm ? (isLeft ? 0.05 : 0.85) + (s / numSegs) * 0.10 : (isLeft ? 0.15 : 0.75) + (s / numSegs) * 0.12;
        let v = isArm ? 0.10 + t * 0.35 : 0.55 + t * 0.40;

        points.push([px, py, pz]);
        normals.push([Math.sin(theta), 0, Math.cos(theta)]);
        uvs.push([Math.max(0, Math.min(1, u)), Math.max(0, Math.min(1, v))]);
      }

      rings.push({ points, normals, uvs, joints: j, weights: w });
    }

    this.addLoft(rings);
  }

  // Generate athletic shorts covering hips and thighs
  buildHeroicShorts(isHoops = false) {
    const yTop = 1.02;
    const yBottom = isHoops ? 0.62 : 0.68;
    const numRings = 8;
    const numSegs = 24;

    // Build left shorts leg and right shorts leg
    for (const isLeft of [true, false]) {
      const sx = isLeft ? 0.12 : -0.12;
      const bLeg = isLeft ? 54 : 56;
      const rings = [];

      for (let r = 0; r <= numRings; r++) {
        const t = r / numRings;
        const y = yTop - t * (yTop - yBottom);
        const rad = 0.13 * (1 + t * 0.18); // Flared leg hem

        const j = [2, bLeg, 0, 0];
        const w = [1 - t * 0.8, t * 0.8, 0, 0];

        const points = [];
        const normals = [];
        const uvs = [];

        for (let s = 0; s < numSegs; s++) {
          const theta = (s / numSegs) * Math.PI * 2;
          const px = sx + Math.sin(theta) * rad;
          const pz = Math.cos(theta) * rad * 0.92;

          // UV: Left thigh maps to (0.10..0.45, 0.78..0.98), Right thigh maps to (0.55..0.90, 0.78..0.98)
          let u = (isLeft ? 0.10 : 0.55) + (s / numSegs) * 0.35;
          let v = 0.78 + t * 0.20;

          points.push([px, y, pz]);
          normals.push([Math.sin(theta), 0, Math.cos(theta)]);
          uvs.push([Math.max(0, Math.min(1, u)), Math.max(0, Math.min(1, v))]);
        }

        rings.push({ points, normals, uvs, joints: j, weights: w });
      }

      this.addLoft(rings);
    }
  }

  // Generate athletic footwear (boots with studs for Footy, sneakers for Hoops)
  buildFootwear(isHoops = false) {
    for (const isLeft of [true, false]) {
      const sx = isLeft ? 0.12 : -0.12;
      const bFoot = isLeft ? 58 : 60;
      const rings = [];

      const numRings = 6;
      const numSegs = 16;

      for (let r = 0; r <= numRings; r++) {
        const t = r / numRings;
        const y = 0.10 - t * 0.08; // 0.10m down to 0.02m sole
        const radX = 0.065 * (1 + t * 0.25);
        const radZ = 0.12 * (1 + t * 0.20);
        const cz = 0.05 * t; // Toe extends forward

        const points = [];
        const normals = [];
        const uvs = [];

        for (let s = 0; s < numSegs; s++) {
          const theta = (s / numSegs) * Math.PI * 2;
          let px = sx + Math.sin(theta) * radX;
          let pz = cz + Math.cos(theta) * radZ;

          let u = (isLeft ? 0.55 : 0.75) + (s / numSegs) * 0.18;
          let v = 0.78 + t * 0.18;

          points.push([px, y, pz]);
          normals.push([Math.sin(theta), 0, Math.cos(theta)]);
          uvs.push([Math.max(0, Math.min(1, u)), Math.max(0, Math.min(1, v))]);
        }

        rings.push({ points, normals, uvs, joints: [bFoot, 0, 0, 0], weights: [1, 0, 0, 0] });
      }

      this.addLoft(rings);
    }
  }
}

// =========================================================================
// PART 3: MASTER BUILDER & GLB COMPILER
// =========================================================================
async function buildCompleteHeroCharacters() {
  await bakeScratchAtlases();

  console.log('\n=== Step 2: Reading Rig Skeleton & Animation Tracks ===');
  const rigBuf = fs.readFileSync(RIG_PATH);
  const rigChunk0Len = rigBuf.readUInt32LE(12);
  const rigGltf = JSON.parse(rigBuf.toString('utf8', 20, 20 + rigChunk0Len));
  const rigBinStart = 20 + rigChunk0Len + 8;
  const origSkin = rigGltf.skins[0];

  function compileHeroGLB(charType, outPath, atlasPath) {
    console.log(`\n--- Compiling Scratch Hero GLB: ${charType.toUpperCase()} -> ${path.basename(outPath)} ---`);
    const isHoops = (charType === 'hoops');

    const builder = new HeroMeshBuilder();

    // 1. Build Head & Volumetric Hair
    builder.buildHeroicHead(isHoops ? 1.62 : 1.54, 0.28, 0.115, isHoops);

    // 2. Build Muscular V-Taper Torso & Jersey
    builder.buildHeroicTorso(isHoops);

    // 3. Build Arms (Shoulder to Wrist)
    for (const isLeft of [true, false]) {
      const sign = isLeft ? 1 : -1;
      const bUpper = isLeft ? 9 : 32;
      const bLower = isLeft ? 10 : 33;
      const bWrist = isLeft ? 11 : 34;

      // Upper arm: shoulder [sign * 0.22, 1.42, 0] to elbow [sign * 0.34, 1.22, 0.02]
      builder.buildAthleticLimb([sign * 0.22, 1.42, 0], [sign * 0.34, 1.22, 0.02], 0.065, 0.052, bUpper, bLower, true, isLeft);
      // Forearm: elbow [sign * 0.34, 1.22, 0.02] to wrist [sign * 0.42, 1.02, 0.04]
      builder.buildAthleticLimb([sign * 0.34, 1.22, 0.02], [sign * 0.42, 1.02, 0.04], 0.052, 0.038, bLower, bWrist, true, isLeft);
    }

    // 4. Build Flared Shorts
    builder.buildHeroicShorts(isHoops);

    // 5. Build Muscular Legs (Thigh to Foot)
    for (const isLeft of [true, false]) {
      const sign = isLeft ? 1 : -1;
      const bUpper = isLeft ? 54 : 56;
      const bLower = isLeft ? 55 : 57;

      // Thigh: hip [sign * 0.12, 0.92, 0] to knee [sign * 0.12, 0.52, 0.02]
      builder.buildAthleticLimb([sign * 0.12, 0.92, 0], [sign * 0.12, 0.52, 0.02], 0.088, 0.068, bUpper, bLower, false, isLeft);
      // Calf / Shin: knee [sign * 0.12, 0.52, 0.02] to ankle [sign * 0.12, 0.10, 0]
      builder.buildAthleticLimb([sign * 0.12, 0.52, 0.02], [sign * 0.12, 0.10, 0], 0.068, 0.048, bLower, isLeft ? 58 : 60, false, isLeft);
    }

    // 6. Build Footwear (Cleats / High-Tops)
    builder.buildFootwear(isHoops);

    const vertexCount = builder.positions.length / 3;
    const indexCount = builder.indices.length;
    console.log(`✓ Synthesized heroic mesh from scratch: ${vertexCount} vertices, ${indexCount / 3} triangles.`);

    const posBuf = Buffer.from(new Float32Array(builder.positions).buffer);
    const normBuf = Buffer.from(new Float32Array(builder.normals).buffer);
    const uvBuf = Buffer.from(new Float32Array(builder.uvs).buffer);
    const jointsBuf = Buffer.from(new Uint16Array(builder.joints).buffer);
    const weightsBuf = Buffer.from(new Float32Array(builder.weights).buffer);
    const indicesBuf = Buffer.from(new Uint32Array(builder.indices).buffer);
    const texBuf = fs.readFileSync(atlasPath);

    // Min/max pos
    let minPos = [Infinity, Infinity, Infinity];
    let maxPos = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < vertexCount; i++) {
      const x = builder.positions[i * 3], y = builder.positions[i * 3 + 1], z = builder.positions[i * 3 + 2];
      minPos[0] = Math.min(minPos[0], x); maxPos[0] = Math.max(maxPos[0], x);
      minPos[1] = Math.min(minPos[1], y); maxPos[1] = Math.max(maxPos[1], y);
      minPos[2] = Math.min(minPos[2], z); maxPos[2] = Math.max(maxPos[2], z);
    }

    // glTF Assembly
    const bufferParts = [];
    let currentOffset = 0;

    function addBufferView(buf, target) {
      const pad = (4 - (buf.length % 4)) % 4;
      const paddedBuf = pad > 0 ? Buffer.concat([buf, Buffer.alloc(pad)]) : buf;
      const bv = { buffer: 0, byteOffset: currentOffset, byteLength: buf.length };
      if (target) bv.target = target;
      currentOffset += paddedBuf.length;
      bufferParts.push(paddedBuf);
      return bv;
    }

    const bufferViews = [];
    const accessors = [];

    bufferViews.push(addBufferView(posBuf, 34962));
    accessors.push({ bufferView: 0, componentType: 5126, count: vertexCount, type: 'VEC3', min: minPos, max: maxPos });

    bufferViews.push(addBufferView(normBuf, 34962));
    accessors.push({ bufferView: 1, componentType: 5126, count: vertexCount, type: 'VEC3' });

    bufferViews.push(addBufferView(uvBuf, 34962));
    accessors.push({ bufferView: 2, componentType: 5126, count: vertexCount, type: 'VEC2' });

    bufferViews.push(addBufferView(jointsBuf, 34962));
    accessors.push({ bufferView: 3, componentType: 5123, count: vertexCount, type: 'VEC4' });

    bufferViews.push(addBufferView(weightsBuf, 34962));
    accessors.push({ bufferView: 4, componentType: 5126, count: vertexCount, type: 'VEC4' });

    bufferViews.push(addBufferView(indicesBuf, 34963));
    accessors.push({ bufferView: 5, componentType: 5125, count: indexCount, type: 'SCALAR' });

    bufferViews.push(addBufferView(texBuf));
    const texBufferViewIndex = 6;

    // IBM
    const origIbmAcc = rigGltf.accessors[origSkin.inverseBindMatrices];
    const origIbmBv = rigGltf.bufferViews[origIbmAcc.bufferView];
    const ibmOffset = rigBinStart + (origIbmBv.byteOffset || 0) + (origIbmAcc.byteOffset || 0);
    const ibmBuf = rigBuf.subarray(ibmOffset, ibmOffset + origSkin.joints.length * 64);

    const ibmBvIndex = bufferViews.length;
    bufferViews.push(addBufferView(ibmBuf));
    const ibmAccIndex = accessors.length;
    accessors.push({ bufferView: ibmBvIndex, componentType: 5126, count: origSkin.joints.length, type: 'MAT4' });

    // Copy 24 Animations
    const newAnimations = [];
    const accMap = new Map();

    rigGltf.animations.forEach((origAnim) => {
      const newSamplers = [];
      const newChannels = [];

      origAnim.samplers.forEach(s => {
        function copyAccessor(oldAccIdx) {
          if (accMap.has(oldAccIdx)) return accMap.get(oldAccIdx);
          const oldAcc = rigGltf.accessors[oldAccIdx];
          const oldBv = rigGltf.bufferViews[oldAcc.bufferView];
          const start = rigBinStart + (oldBv.byteOffset || 0) + (oldAcc.byteOffset || 0);
          const byteLen = oldAcc.count * (oldAcc.type === 'VEC4' ? 16 : oldAcc.type === 'VEC3' ? 12 : 4);
          const rawData = rigBuf.subarray(start, start + byteLen);

          const bvIdx = bufferViews.length;
          bufferViews.push(addBufferView(rawData));
          const newAccIdx = accessors.length;
          const newAcc = { bufferView: bvIdx, componentType: oldAcc.componentType, count: oldAcc.count, type: oldAcc.type };
          if (oldAcc.min) newAcc.min = oldAcc.min;
          if (oldAcc.max) newAcc.max = oldAcc.max;
          accessors.push(newAcc);
          accMap.set(oldAccIdx, newAccIdx);
          return newAccIdx;
        }

        newSamplers.push({
          input: copyAccessor(s.input),
          interpolation: s.interpolation || 'LINEAR',
          output: copyAccessor(s.output)
        });
      });

      origAnim.channels.forEach(ch => {
        newChannels.push({
          sampler: ch.sampler,
          target: { node: ch.target.node, path: ch.target.path }
        });
      });

      newAnimations.push({
        name: origAnim.name,
        channels: newChannels,
        samplers: newSamplers
      });
    });

    const nodes = rigGltf.nodes.map(n => {
      const copy = { name: n.name };
      if (n.translation) copy.translation = n.translation;
      if (n.rotation) copy.rotation = n.rotation;
      if (n.scale) copy.scale = n.scale;
      if (n.children) copy.children = [...n.children];
      return copy;
    });

    nodes.push({ name: `${charType}_Mesh`, mesh: 0, skin: 0 });

    const childSet = new Set();
    nodes.forEach(n => (n.children || []).forEach(c => childSet.add(c)));
    const rootNodeIndices = nodes.map((_, i) => i).filter(i => !childSet.has(i));

    const outGltf = {
      asset: { generator: 'FOOTY vs HOOPS Pure From-Scratch Synthesizer v2.0', version: '2.0' },
      scene: 0,
      scenes: [{ name: 'DefaultScene', nodes: rootNodeIndices }],
      nodes: nodes,
      meshes: [
        {
          name: `${charType}_Mesh`,
          primitives: [
            {
              attributes: {
                POSITION: 0,
                NORMAL: 1,
                TEXCOORD_0: 2,
                JOINTS_0: 3,
                WEIGHTS_0: 4
              },
              indices: 5,
              material: 0,
              mode: 4
            }
          ]
        }
      ],
      skins: [
        {
          name: 'CharacterSkin',
          joints: origSkin.joints,
          skeleton: origSkin.skeleton,
          inverseBindMatrices: ibmAccIndex
        }
      ],
      animations: newAnimations,
      materials: [
        {
          name: `${charType}_Material`,
          pbrMetallicRoughness: {
            baseColorFactor: [1, 1, 1, 1],
            metallicFactor: isHoops ? 0.35 : 0.05,
            roughnessFactor: isHoops ? 0.45 : 0.65,
            baseColorTexture: { index: 0 }
          }
        }
      ],
      textures: [{ sampler: 0, source: 0 }],
      images: [{ mimeType: 'image/png', bufferView: texBufferViewIndex, name: `${charType}_atlas` }],
      samplers: [{ magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497 }],
      accessors: accessors,
      bufferViews: bufferViews,
      buffers: [{ byteLength: currentOffset }]
    };

    const jsonString = JSON.stringify(outGltf);
    const jsonBuffer = Buffer.from(jsonString, 'utf8');
    const jsonPadding = (4 - (jsonBuffer.length % 4)) % 4;
    const paddedJsonBuffer = jsonPadding > 0 ? Buffer.concat([jsonBuffer, Buffer.alloc(jsonPadding, 0x20)]) : jsonBuffer;

    const binaryBuffer = Buffer.concat(bufferParts);
    const totalLength = 12 + 8 + paddedJsonBuffer.length + 8 + binaryBuffer.length;

    const glbHeader = Buffer.alloc(12);
    glbHeader.write('glTF', 0, 4, 'ascii');
    glbHeader.writeUInt32LE(2, 4);
    glbHeader.writeUInt32LE(totalLength, 8);

    const jsonHeader = Buffer.alloc(8);
    jsonHeader.writeUInt32LE(paddedJsonBuffer.length, 0);
    jsonHeader.writeUInt32LE(0x4E4F534A, 4);

    const binHeader = Buffer.alloc(8);
    binHeader.writeUInt32LE(binaryBuffer.length, 0);
    binHeader.writeUInt32LE(0x004E4942, 4);

    const finalGLB = Buffer.concat([glbHeader, jsonHeader, paddedJsonBuffer, binHeader, binaryBuffer]);
    fs.writeFileSync(outPath, finalGLB);
    console.log(`✓ Saved ${path.basename(outPath)} (${(finalGLB.length / 1024 / 1024).toFixed(2)} MB, ${vertexCount} verts, ${newAnimations.length} anims)`);
  }

  // Compile the 3 pure from-scratch characters
  compileHeroGLB('footy', path.join(ROOT, 'assets/characters/footy10.glb'), path.join(ROOT, 'assets/characters/footy10_atlas.png'));
  compileHeroGLB('hoops', path.join(ROOT, 'assets/characters/hoops23.glb'), path.join(ROOT, 'assets/characters/hoops23_atlas.png'));
  compileHeroGLB('keeper', path.join(ROOT, 'assets/characters/keeper1.glb'), path.join(ROOT, 'assets/characters/keeper1_atlas.png'));

  console.log('\n=== All 3 True Hero Characters Generated From Scratch Successfully! ===');
}

buildCompleteHeroCharacters().catch(console.error);
