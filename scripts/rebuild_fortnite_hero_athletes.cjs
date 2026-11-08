const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const glbLoader = require('../assets/loaders/glb_loader.js');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const ROOT = path.resolve(__dirname, '..');

async function generateHeroicAtlases() {
  console.log('=== Step 1: Baking Heroic Fortnite Atlases with Detailed Anatomy & Faces ===');
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

    function drawEmblem(ctx, x, y, r, strokeCol) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r + 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(10, 15, 25, 0.90)';
      ctx.fill();
      ctx.strokeStyle = strokeCol;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.drawImage(emblemImg, x - r, y - r, r * 2, r * 2);
      ctx.restore();
    }

    // -----------------------------------------------------------------
    // 1. FOOTY #10 ATLAS (Turquoise & White, Exposed Legs, Shin Guards, Cleats)
    // -----------------------------------------------------------------
    function makeFootyAtlas() {
      const cvs = document.createElement('canvas');
      cvs.width = 1024;
      cvs.height = 1024;
      const ctx = cvs.getContext('2d');

      ctx.fillStyle = '#00c8ff';
      ctx.fillRect(0, 0, 1024, 1024);

      // FRONT JERSEY
      const fGrad = ctx.createLinearGradient(0, 0, 0, 512);
      fGrad.addColorStop(0, '#00e5ff');
      fGrad.addColorStop(0.35, '#00c4f5');
      fGrad.addColorStop(1, '#0084cc');
      ctx.fillStyle = fGrad;
      ctx.fillRect(0, 0, 512, 512);

      // Raglan White Shoulder Panels
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(160, 0); ctx.lineTo(0, 240); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(512, 0); ctx.lineTo(352, 0); ctx.lineTo(512, 240); ctx.closePath(); ctx.fill();

      // Navy V-Neck Collar
      ctx.fillStyle = '#0a1e3f';
      ctx.beginPath();
      ctx.moveTo(175, 0); ctx.lineTo(337, 0); ctx.lineTo(256, 85); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(195, 0); ctx.lineTo(317, 0); ctx.lineTo(256, 68); ctx.closePath(); ctx.fill();

      // Crest Badge on Left Chest
      drawEmblem(ctx, 135, 175, 38, '#00f0ff');

      // Wordmark "FOOTY"
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 64px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#0a1e3f';
      ctx.fillText('FOOTY', 256, 218);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('FOOTY', 256, 214);

      // Squad Number "10" on Front
      ctx.font = '900 136px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#0a1e3f';
      ctx.fillText('10', 256, 335);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('10', 256, 330);

      // BACK JERSEY
      const bGrad = ctx.createLinearGradient(512, 0, 512, 512);
      bGrad.addColorStop(0, '#00d6f5');
      bGrad.addColorStop(0.5, '#00b0ea');
      bGrad.addColorStop(1, '#007fc4');
      ctx.fillStyle = bGrad;
      ctx.fillRect(512, 0, 512, 512);

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(512, 0); ctx.lineTo(640, 0); ctx.lineTo(512, 200); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(1024, 0); ctx.lineTo(896, 0); ctx.lineTo(1024, 200); ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#0a1e3f';
      ctx.beginPath();
      ctx.moveTo(690, 0); ctx.lineTo(846, 0); ctx.lineTo(768, 50); ctx.closePath(); ctx.fill();

      ctx.font = '900 52px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#0a1e3f';
      ctx.fillText('FOOTY', 768, 140);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('FOOTY', 768, 136);

      ctx.font = '900 178px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#0a1e3f';
      ctx.fillText('10', 768, 290);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('10', 768, 284);

      // SHORTS (Dark Navy with Turquoise/White speed trims)
      ctx.fillStyle = '#0a1e3f';
      ctx.fillRect(0, 512, 512, 256);
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(16, 512, 32, 256);
      ctx.fillRect(464, 512, 32, 256);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(48, 512, 10, 256);
      ctx.fillRect(454, 512, 10, 256);

      ctx.font = '900 68px "Arial Black", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('10', 140, 680);
      drawEmblem(ctx, 375, 680, 24, '#00e5ff');

      // BARE ATHLETIC SKIN & FACE (Radiant Tan)
      const skinGrad = ctx.createLinearGradient(512, 512, 512, 768);
      skinGrad.addColorStop(0, '#f9cbb0');
      skinGrad.addColorStop(0.5, '#f0b892');
      skinGrad.addColorStop(1, '#df9e76');
      ctx.fillStyle = skinGrad;
      ctx.fillRect(512, 512, 512, 256);

      // Stylized Face Features (Eyes, Eyebrows, Confident Smile)
      ctx.save();
      // Eyes (Left & Right)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.ellipse(680, 590, 18, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(850, 590, 18, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3e2723';
      ctx.beginPath(); ctx.arc(682, 590, 8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(852, 590, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(684, 588, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(854, 588, 3, 0, Math.PI * 2); ctx.fill();

      // Eyebrows
      ctx.strokeStyle = '#2d1810';
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(660, 572); ctx.lineTo(700, 576); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(870, 572); ctx.lineTo(830, 576); ctx.stroke();

      // Confident Smile with White Teeth
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(765, 650, 26, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // SOCKS & SHIN GUARDS
      ctx.fillStyle = '#00c8ff';
      ctx.fillRect(0, 768, 512, 256);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 768, 512, 45); // Sock top turn-down
      ctx.fillStyle = '#0a1e3f';
      ctx.fillRect(0, 813, 512, 16);

      // Aerodynamic Molded Shin Guard Face Plate
      ctx.fillStyle = '#0099dd';
      ctx.beginPath();
      ctx.roundRect(140, 840, 230, 160, 20);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.stroke();

      // SOCCER CLEATS (Turquoise speed boots with white racing swoosh & studs)
      ctx.fillStyle = '#00a4e4';
      ctx.fillRect(512, 768, 512, 256);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(560, 870);
      ctx.bezierCurveTo(680, 830, 780, 890, 880, 820);
      ctx.bezierCurveTo(800, 880, 700, 875, 560, 870);
      ctx.fill();
      ctx.fillStyle = '#0a1e3f';
      ctx.fillRect(512, 970, 512, 54); // Sole plate

      return cvs.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
    }

    // -----------------------------------------------------------------
    // 2. HOOPS #23 ATLAS (Sleeveless Tank, Bronze Skin, Beard, Gold Kicks)
    // -----------------------------------------------------------------
    function makeHoopsAtlas() {
      const cvs = document.createElement('canvas');
      cvs.width = 1024;
      cvs.height = 1024;
      const ctx = cvs.getContext('2d');

      ctx.fillStyle = '#14151a';
      ctx.fillRect(0, 0, 1024, 1024);

      // FRONT JERSEY (Sleeveless Tank Top, Stealth Obsidian & Gold Ribbing)
      const fGrad = ctx.createLinearGradient(0, 0, 0, 512);
      fGrad.addColorStop(0, '#262832');
      fGrad.addColorStop(0.35, '#17181f');
      fGrad.addColorStop(1, '#0e0f14');
      ctx.fillStyle = fGrad;
      ctx.fillRect(0, 0, 512, 512);

      // Gold Armhole & Neckline Ribbing
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(0, 0, 48, 512);
      ctx.fillRect(464, 0, 48, 512);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(36, 0, 12, 512);
      ctx.fillRect(464, 0, 12, 512);

      // Deep V-Neck Collar
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(160, 0); ctx.lineTo(352, 0); ctx.lineTo(256, 100); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#14151a';
      ctx.beginPath();
      ctx.moveTo(192, 0); ctx.lineTo(320, 0); ctx.lineTo(256, 80); ctx.closePath(); ctx.fill();

      drawEmblem(ctx, 135, 175, 38, '#fbbf24');

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 68px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#92400e';
      ctx.fillText('HOOPS', 256, 218);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('HOOPS', 256, 214);

      ctx.font = '900 142px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#92400e';
      ctx.fillText('23', 256, 335);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('23', 256, 330);

      // BACK JERSEY (Tank Top)
      ctx.fillStyle = fGrad;
      ctx.fillRect(512, 0, 512, 512);

      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(512, 0, 48, 512);
      ctx.fillRect(976, 0, 48, 512);

      ctx.font = '900 52px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#92400e';
      ctx.fillText('ALL-STAR', 768, 140);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('ALL-STAR', 768, 136);

      ctx.font = '900 182px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#92400e';
      ctx.fillText('23', 768, 290);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('23', 768, 284);

      // LOOSE BASKETBALL SHORTS (With bold gold chevron piping)
      ctx.fillStyle = '#121318';
      ctx.fillRect(0, 512, 512, 256);
      ctx.fillStyle = '#fbbf24';
      // Left chevron
      ctx.beginPath();
      ctx.moveTo(12, 512); ctx.lineTo(44, 640); ctx.lineTo(12, 768);
      ctx.lineTo(28, 768); ctx.lineTo(60, 640); ctx.lineTo(28, 512);
      ctx.closePath(); ctx.fill();
      // Right chevron
      ctx.beginPath();
      ctx.moveTo(500, 512); ctx.lineTo(468, 640); ctx.lineTo(500, 768);
      ctx.lineTo(484, 768); ctx.lineTo(452, 640); ctx.lineTo(484, 512);
      ctx.closePath(); ctx.fill();

      ctx.font = '900 72px "Arial Black", sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('23', 140, 680);
      drawEmblem(ctx, 375, 680, 26, '#fbbf24');

      // BARE ATHLETIC BRONZE SKIN & FACE (With Beard & Mustache!)
      const bronzeGrad = ctx.createLinearGradient(512, 512, 512, 768);
      bronzeGrad.addColorStop(0, '#5a3825');
      bronzeGrad.addColorStop(0.5, '#4a2c1b');
      bronzeGrad.addColorStop(1, '#3a2012');
      ctx.fillStyle = bronzeGrad;
      ctx.fillRect(512, 512, 512, 256);

      // Stylized Face Features (Espresso eyes, Beard, Mustache, Confident Smile)
      ctx.save();
      // Eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.ellipse(680, 585, 18, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(850, 585, 18, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1c1917';
      ctx.beginPath(); ctx.arc(682, 585, 8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(852, 585, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(684, 583, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(854, 583, 3, 0, Math.PI * 2); ctx.fill();

      // Dark Brows
      ctx.strokeStyle = '#0c0a09';
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(658, 568); ctx.lineTo(702, 572); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(872, 568); ctx.lineTo(828, 572); ctx.stroke();

      // Styled Beard & Goatee Contour
      ctx.fillStyle = '#0c0a09';
      ctx.beginPath();
      // Mustache
      ctx.ellipse(765, 630, 36, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      // Jawline Beard
      ctx.beginPath();
      ctx.moveTo(690, 620);
      ctx.quadraticCurveTo(765, 710, 840, 620);
      ctx.quadraticCurveTo(765, 690, 690, 620);
      ctx.fill();

      // Confident Smile with White Teeth
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(765, 642, 22, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // COMPRESSION SLEEVE & GOLD WRISTBAND
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 768, 512, 256);
      ctx.fillStyle = '#fbbf24'; // Gold wristband
      ctx.fillRect(0, 768, 512, 40);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(0, 808, 512, 10);

      // HIGH-TOP BASKETBALL SNEAKERS (Black & Metallic Gold)
      ctx.fillStyle = '#171717';
      ctx.fillRect(512, 768, 512, 256);
      ctx.fillStyle = '#fbbf24'; // Gold heel counter & collar
      ctx.fillRect(512, 768, 512, 50);
      ctx.beginPath();
      ctx.moveTo(560, 860); ctx.lineTo(720, 820); ctx.lineTo(880, 860);
      ctx.lineTo(880, 920); ctx.lineTo(560, 920);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(512, 960, 512, 64); // Outsole

      return cvs.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
    }

    // -----------------------------------------------------------------
    // 3. GOALKEEPER #1 ATLAS
    // -----------------------------------------------------------------
    function makeKeeperAtlas() {
      const cvs = document.createElement('canvas');
      cvs.width = 1024;
      cvs.height = 1024;
      const ctx = cvs.getContext('2d');

      ctx.fillStyle = '#10b981';
      ctx.fillRect(0, 0, 1024, 1024);

      // FRONT JERSEY (Vibrant Goalkeeper Emerald)
      const fGrad = ctx.createLinearGradient(0, 0, 0, 512);
      fGrad.addColorStop(0, '#34d399');
      fGrad.addColorStop(1, '#059669');
      ctx.fillStyle = fGrad;
      ctx.fillRect(0, 0, 512, 512);

      drawEmblem(ctx, 135, 175, 38, '#ffffff');

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 64px "Arial Black", sans-serif';
      ctx.fillStyle = '#064e3b';
      ctx.fillText('KEEPER', 256, 218);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('KEEPER', 256, 214);

      ctx.font = '900 136px "Arial Black", sans-serif';
      ctx.fillStyle = '#064e3b';
      ctx.fillText('1', 256, 335);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('1', 256, 330);

      // BACK JERSEY
      ctx.fillStyle = fGrad;
      ctx.fillRect(512, 0, 512, 512);

      ctx.font = '900 52px "Arial Black", sans-serif';
      ctx.fillStyle = '#064e3b';
      ctx.fillText('KEEPER', 768, 140);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('KEEPER', 768, 136);

      ctx.font = '900 178px "Arial Black", sans-serif';
      ctx.fillStyle = '#064e3b';
      ctx.fillText('1', 768, 290);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('1', 768, 284);

      // SHORTS (Dark Forest Green)
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(0, 512, 512, 256);
      drawEmblem(ctx, 375, 680, 24, '#34d399');

      // SKIN & PADDED GLOVES
      ctx.fillStyle = '#f0b892';
      ctx.fillRect(512, 512, 512, 256);

      // SOCKS & SHIN PADS
      ctx.fillStyle = '#059669';
      ctx.fillRect(0, 768, 512, 256);

      // BOOTS
      ctx.fillStyle = '#047857';
      ctx.fillRect(512, 768, 512, 256);

      return cvs.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
    }

    return {
      footyAtlas: makeFootyAtlas(),
      hoopsAtlas: makeHoopsAtlas(),
      keeperAtlas: makeKeeperAtlas()
    };
  }, emblemBase64);

  await browser.close();
  console.log('✓ All 3 Heroic Atlases generated successfully.');
  return { footyAtlas, hoopsAtlas, keeperAtlas };
}

function processHeroAthlete(inGlbPath, outGlbPath, atlasBase64, charType) {
  console.log(`\n--- Sculpting & Rigging Hero Athlete: ${charType} -> ${path.basename(outGlbPath)} ---`);
  const buf = fs.readFileSync(inGlbPath);
  const jsonLen = buf.readUInt32LE(12);
  const gltf = JSON.parse(buf.subarray(20, 20 + jsonLen).toString('utf8'));
  const bin = buf.subarray(20 + jsonLen + 8);

  const isHoops = (charType === 'hoops');
  const isFooty = (charType === 'footy');
  const isKeeper = (charType === 'keeper');

  const headMesh = gltf.meshes.find(m => m.name === 'Cube.015');
  const torsoMesh = gltf.meshes.find(m => m.name === 'Cube.010');
  const legsMesh = gltf.meshes.find(m => m.name === 'Cube.019');
  const feetMesh = gltf.meshes.find(m => m.name === 'Cube.003');

  // -------------------------------------------------------------
  // 1. TUCK BACK-OF-SKULL SKIN (Prevent any hair clipping)
  // -------------------------------------------------------------
  if (headMesh && headMesh.primitives[0]) {
    const skinPrim = headMesh.primitives[0];
    const acc = gltf.accessors[skinPrim.attributes.POSITION];
    const bv = gltf.bufferViews[acc.bufferView];
    const skinFloats = new Float32Array(bin, (bv.byteOffset || 0) + (acc.byteOffset || 0), acc.count * 3);

    for (let i = 0; i < acc.count; i++) {
      const x = skinFloats[i * 3];
      const y = skinFloats[i * 3 + 1];
      const z = skinFloats[i * 3 + 2];
      if (y > 1.56 && z < 0.02) {
        skinFloats[i * 3] = x * 0.90;
        skinFloats[i * 3 + 2] = Math.max(-0.026, z * 0.50);
      }
    }
  }

  // -------------------------------------------------------------
  // 2. HEROIC HAIRSTYLES (FLAT-TOP FOR HOOPS, TAPER FADE FOR FOOTY)
  // ZERO PONYTAIL / ZERO BUN!
  // -------------------------------------------------------------
  if (headMesh && headMesh.primitives[3]) {
    const hairPrim = headMesh.primitives[3];
    const posAcc = gltf.accessors[hairPrim.attributes.POSITION];
    const bv = gltf.bufferViews[posAcc.bufferView];
    const hairFloats = new Float32Array(bin, (bv.byteOffset || 0) + (posAcc.byteOffset || 0), posAcc.count * 3);

    for (let i = 0; i < posAcc.count; i++) {
      let x = hairFloats[i * 3];
      let y = hairFloats[i * 3 + 1];
      let z = hairFloats[i * 3 + 2];

      // Eradicate any ponytail/bun at the back of neck (z < -0.02)
      if (z < -0.02) {
        hairFloats[i * 3 + 2] = -0.018; // Flush to neck fade
      }
      if (y < 1.62) {
        hairFloats[i * 3 + 1] = 1.62;
      }

      if (isHoops) {
        // High Flat-Top Fade: Crisp flat-topped box
        if (y > 1.70) {
          hairFloats[i * 3 + 1] = Math.min(1.78, Math.max(1.74, y + 0.03));
          hairFloats[i * 3] = x * 1.05; // Square sides
        }
      } else {
        // Tapered Swept Pompadour Fade: Swept slightly back and up
        if (y > 1.70) {
          hairFloats[i * 3 + 1] = Math.min(1.76, y + 0.02);
          hairFloats[i * 3 + 2] = z + 0.015;
        }
      }
    }
    console.log(`  ✓ Hair: Sculpted authentic ${isHoops ? 'Flat-Top Fade' : 'Taper Fade'} (Zero ponytail/bun).`);
  }

  // -------------------------------------------------------------
  // 3. SLEEVELESS TANK TOP FOR HOOPS #23 (CUT SLEEVES & EXPOSE ARMS)
  // -------------------------------------------------------------
  if (torsoMesh && torsoMesh.primitives[1]) {
    const shirtPrim = torsoMesh.primitives[1];
    const posAcc = gltf.accessors[shirtPrim.attributes.POSITION];
    const bv = gltf.bufferViews[posAcc.bufferView];
    const posFloats = new Float32Array(bin, (bv.byteOffset || 0) + (posAcc.byteOffset || 0), posAcc.count * 3);

    let sleevesCut = 0;
    for (let i = 0; i < posAcc.count; i++) {
      let x = posFloats[i * 3];
      let y = posFloats[i * 3 + 1];
      let z = posFloats[i * 3 + 2];

      if (isHoops) {
        // Cut sleeves to create authentic sleeveless basketball tank top!
        if (Math.abs(x) > 0.165 && y > 1.20 && y < 1.48) {
          posFloats[i * 3] = Math.sign(x) * 0.155; // Tucked flush into armhole
          sleevesCut++;
        }
        // Broaden muscular shoulders
        if (y > 1.34) {
          posFloats[i * 3] = x * 1.10;
        }
        // Muscular chest definition
        if (y > 1.25 && y < 1.48 && z > 0.04) {
          posFloats[i * 3 + 2] = z + 0.016;
        }
        // Athletic V-taper waist
        if (y < 1.22) {
          posFloats[i * 3] = x * 0.94;
        }
      } else {
        // Footy football forward build
        if (y > 1.34) posFloats[i * 3] = x * 1.06;
        if (y > 1.25 && y < 1.48 && z > 0.04) posFloats[i * 3 + 2] = z + 0.012;
        if (y < 1.22) posFloats[i * 3] = x * 0.95;
      }
    }
    console.log(`  ✓ Torso: Sculpted V-taper.${isHoops ? ` Cut ${sleevesCut} sleeve vertices for sleeveless tank.` : ''}`);
  }

  // -------------------------------------------------------------
  // 4. SCULPT BARE ARMS & DELTOIDS (Cube.010 Prim 0)
  // -------------------------------------------------------------
  if (torsoMesh && torsoMesh.primitives[0]) {
    const armPrim = torsoMesh.primitives[0];
    const posAcc = gltf.accessors[armPrim.attributes.POSITION];
    const bv = gltf.bufferViews[posAcc.bufferView];
    const armFloats = new Float32Array(bin, (bv.byteOffset || 0) + (posAcc.byteOffset || 0), posAcc.count * 3);

    for (let i = 0; i < posAcc.count; i++) {
      let x = armFloats[i * 3];
      let y = armFloats[i * 3 + 1];
      let z = armFloats[i * 3 + 2];
      // Expand muscular biceps and deltoids
      if (Math.abs(x) > 0.18 && y > 0.90 && y < 1.45) {
        armFloats[i * 3] = x * (isHoops ? 1.14 : 1.08);
        armFloats[i * 3 + 2] = z * (isHoops ? 1.14 : 1.08);
      }
    }
    console.log(`  ✓ Arms: Sculpted athletic ${isHoops ? 'muscular NBA deltoids/biceps' : 'toned soccer arms'}.`);
  }

  // -------------------------------------------------------------
  // 5. PLANAR UV RE-PROJECTION FOR TORSO SHIRT
  // -------------------------------------------------------------
  if (torsoMesh && torsoMesh.primitives[1]) {
    const p = torsoMesh.primitives[1];
    const uvAcc = gltf.accessors[p.attributes.TEXCOORD_0];
    const posAcc = gltf.accessors[p.attributes.POSITION];
    const uvBv = gltf.bufferViews[uvAcc.bufferView];
    const posBv = gltf.bufferViews[posAcc.bufferView];
    const uvs = new Float32Array(bin, (uvBv.byteOffset || 0) + (uvAcc.byteOffset || 0), uvAcc.count * 2);
    const pos = new Float32Array(bin, (posBv.byteOffset || 0) + (posAcc.byteOffset || 0), posAcc.count * 3);

    for (let i = 0; i < posAcc.count; i++) {
      const x = pos[i * 3];
      const y = pos[i * 3 + 1];
      const z = pos[i * 3 + 2];

      const normY = Math.max(0, Math.min(1, (1.554 - y) / 0.530));

      if (z >= 0.05) {
        const normX = Math.max(-1, Math.min(1, x / 0.281));
        uvs[i * 2] = 0.25 + normX * 0.20;
        uvs[i * 2 + 1] = 0.05 + normY * 0.40;
      } else {
        const normX = Math.max(-1, Math.min(1, x / 0.281));
        uvs[i * 2] = 0.75 - normX * 0.20;
        uvs[i * 2 + 1] = 0.05 + normY * 0.40;
      }
    }
  }

  // -------------------------------------------------------------
  // 6. EXPOSE BARE KNEES & THIGHS (Cube.019 Prim 0)
  // Shorts at top, BARE SKIN at middle, Socks/Kicks at bottom!
  // -------------------------------------------------------------
  if (legsMesh && legsMesh.primitives[0]) {
    const p = legsMesh.primitives[0];
    const uvAcc = gltf.accessors[p.attributes.TEXCOORD_0];
    const posAcc = gltf.accessors[p.attributes.POSITION];
    const uvBv = gltf.bufferViews[uvAcc.bufferView];
    const posBv = gltf.bufferViews[posAcc.bufferView];
    const uvs = new Float32Array(bin, (uvBv.byteOffset || 0) + (uvAcc.byteOffset || 0), uvAcc.count * 2);
    const pos = new Float32Array(bin, (posBv.byteOffset || 0) + (posAcc.byteOffset || 0), posAcc.count * 3);

    for (let i = 0; i < posAcc.count; i++) {
      const x = pos[i * 3];
      const y = pos[i * 3 + 1];
      const z = pos[i * 3 + 2];

      // A. SHORTS (y >= 0.52)
      if (y >= 0.52) {
        const normY = Math.max(0, Math.min(1, (1.036 - y) / 0.516));
        const normX = Math.max(-1, Math.min(1, x / 0.176));
        uvs[i * 2] = 0.25 + (z >= 0.05 ? normX : -normX) * 0.20;
        uvs[i * 2 + 1] = 0.52 + normY * 0.22;
      }
      // B. BARE KNEES & ATHLETIC THIGHS (0.36 <= y < 0.52)
      else if (y >= 0.36) {
        // Maps directly into the Bare Skin texture zone!
        const normY = (0.52 - y) / 0.16;
        const normX = Math.max(-1, Math.min(1, x / 0.16));
        uvs[i * 2] = 0.65 + normX * 0.12;
        uvs[i * 2 + 1] = 0.55 + normY * 0.15;
      }
      // C. SOCKS & SHIN GUARDS / COMPRESSION (y < 0.36)
      else {
        const normY = Math.max(0, Math.min(1, (0.36 - y) / 0.36));
        const normX = Math.max(-1, Math.min(1, x / 0.176));
        uvs[i * 2] = 0.25 + normX * 0.20;
        uvs[i * 2 + 1] = 0.76 + normY * 0.22;
      }
    }
    console.log('  ✓ Legs: Exposed authentic bare knees/thighs between shorts and socks.');
  }

  // -------------------------------------------------------------
  // 7. BOOTS & SNEAKERS (Cube.003 Prim 0)
  // -------------------------------------------------------------
  if (feetMesh && feetMesh.primitives[0]) {
    const p = feetMesh.primitives[0];
    const uvAcc = gltf.accessors[p.attributes.TEXCOORD_0];
    const posAcc = gltf.accessors[p.attributes.POSITION];
    const uvBv = gltf.bufferViews[uvAcc.bufferView];
    const posBv = gltf.bufferViews[posAcc.bufferView];
    const uvs = new Float32Array(bin, (uvBv.byteOffset || 0) + (uvAcc.byteOffset || 0), uvAcc.count * 2);
    const pos = new Float32Array(bin, (posBv.byteOffset || 0) + (posAcc.byteOffset || 0), posAcc.count * 3);

    for (let i = 0; i < posAcc.count; i++) {
      const x = pos[i * 3];
      const y = pos[i * 3 + 1];
      const normY = Math.max(0, Math.min(1, (0.241 - y) / 0.193));
      const normX = Math.max(-1, Math.min(1, x / 0.185));
      uvs[i * 2] = 0.75 + normX * 0.20;
      uvs[i * 2 + 1] = 0.76 + normY * 0.22;
    }
    console.log(`  ✓ Feet: Re-projected ${isHoops ? 'high-top basketball sneaker' : 'soccer cleat'} UVs.`);
  }

  // -------------------------------------------------------------
  // 8. EMBED ATLAS INTO GLB CONTAINER
  // -------------------------------------------------------------
  const atlasBuf = Buffer.from(atlasBase64, 'base64');
  const atlasLength = atlasBuf.length;
  const padLength = (4 - (atlasLength % 4)) % 4;
  const totalAtlasLength = atlasLength + padLength;

  let imgBvIdx = -1;
  for (let i = 0; i < gltf.bufferViews.length; i++) {
    const bv = gltf.bufferViews[i];
    if (bv.byteLength >= 100000 && !bv.target) {
      imgBvIdx = i;
      break;
    }
  }

  if (imgBvIdx === -1) {
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
  const { footyAtlas, hoopsAtlas, keeperAtlas } = await generateHeroicAtlases();

  const srcGlb = path.join(ROOT, 'archive/dev_assets/candidate_a_france.glb');
  const baseGlb = fs.existsSync(srcGlb) ? srcGlb : path.join(ROOT, 'assets/characters/footy10.glb');

  processHeroAthlete(
    path.join(ROOT, 'assets/characters/footy10.glb'),
    path.join(ROOT, 'assets/characters/footy10.glb'),
    footyAtlas,
    'footy'
  );

  processHeroAthlete(
    path.join(ROOT, 'assets/characters/hoops23.glb'),
    path.join(ROOT, 'assets/characters/hoops23.glb'),
    hoopsAtlas,
    'hoops'
  );

  processHeroAthlete(
    path.join(ROOT, 'assets/characters/keeper1.glb'),
    path.join(ROOT, 'assets/characters/keeper1.glb'),
    keeperAtlas,
    'keeper'
  );

  console.log('\n=== All 3 Athletes Successfully Rebuilt & Sculpted! ===');
}

run().catch(err => {
  console.error('Rebuild failed:', err);
  process.exit(1);
});
