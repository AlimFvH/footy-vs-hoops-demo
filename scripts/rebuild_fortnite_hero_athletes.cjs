const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const glbLoader = require('../assets/loaders/glb_loader.js');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const ROOT = path.resolve(__dirname, '..');

async function generatePristineAtlases() {
  console.log('=== Step 1: Generating Pristine 1024x1024 Fortnite Sports Kit Atlases ===');
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
    // 1. FOOTY #10 ATLAS
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

      // SHORTS
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

      // SKIN & HEAD
      ctx.fillStyle = '#f4c29e';
      ctx.fillRect(512, 512, 512, 256);

      // SOCKS
      ctx.fillStyle = '#00c8ff';
      ctx.fillRect(0, 768, 512, 256);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 768, 512, 45);
      ctx.fillStyle = '#0a1e3f';
      ctx.fillRect(0, 813, 512, 16);

      // SOCCER CLEATS
      ctx.fillStyle = '#00a4e4';
      ctx.fillRect(512, 768, 512, 256);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(560, 870);
      ctx.bezierCurveTo(680, 830, 780, 890, 880, 820);
      ctx.bezierCurveTo(800, 880, 700, 875, 560, 870);
      ctx.fill();
      ctx.fillStyle = '#0a1e3f';
      ctx.fillRect(512, 970, 512, 54);

      return cvs.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
    }

    // -----------------------------------------------------------------
    // 2. HOOPS #23 ATLAS
    // -----------------------------------------------------------------
    function makeHoopsAtlas() {
      const cvs = document.createElement('canvas');
      cvs.width = 1024;
      cvs.height = 1024;
      const ctx = cvs.getContext('2d');

      ctx.fillStyle = '#14151a';
      ctx.fillRect(0, 0, 1024, 1024);

      // FRONT JERSEY
      const fGrad = ctx.createLinearGradient(0, 0, 0, 512);
      fGrad.addColorStop(0, '#262832');
      fGrad.addColorStop(0.35, '#17181f');
      fGrad.addColorStop(1, '#0e0f14');
      ctx.fillStyle = fGrad;
      ctx.fillRect(0, 0, 512, 512);

      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(0, 0, 48, 512);
      ctx.fillRect(464, 0, 48, 512);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(36, 0, 12, 512);
      ctx.fillRect(464, 0, 12, 512);

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

      // BACK JERSEY
      ctx.fillStyle = fGrad;
      ctx.fillRect(512, 0, 512, 512);

      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(512, 0, 48, 512);
      ctx.fillRect(976, 0, 48, 512);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(548, 0, 12, 512);
      ctx.fillRect(976, 0, 12, 512);

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

      // SHORTS
      ctx.fillStyle = '#14151a';
      ctx.fillRect(0, 512, 512, 256);

      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(35, 530); ctx.lineTo(75, 615); ctx.lineTo(35, 700);
      ctx.moveTo(477, 530); ctx.lineTo(437, 615); ctx.lineTo(477, 700);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(50, 530); ctx.lineTo(90, 615); ctx.lineTo(50, 700);
      ctx.moveTo(462, 530); ctx.lineTo(422, 615); ctx.lineTo(462, 700);
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(0, 746, 512, 22);

      ctx.font = '900 68px "Arial Black", sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('23', 145, 675);
      drawEmblem(ctx, 370, 675, 24, '#fbbf24');

      // SKIN & SLEEVE
      ctx.fillStyle = '#804d2e';
      ctx.fillRect(512, 512, 512, 256);

      ctx.fillStyle = '#14151a';
      ctx.fillRect(0, 768, 512, 256);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(0, 830, 512, 45);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 846, 512, 12);

      // HIGH-TOP SHOES
      ctx.fillStyle = '#14151a';
      ctx.fillRect(512, 768, 512, 256);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(540, 940); ctx.bezierCurveTo(620, 880, 720, 880, 800, 940); ctx.closePath(); ctx.fill();
      ctx.fillRect(820, 780, 160, 65);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(512, 975, 512, 49);

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

      const fGrad = ctx.createLinearGradient(0, 0, 0, 512);
      fGrad.addColorStop(0, '#34d399');
      fGrad.addColorStop(1, '#059669');
      ctx.fillStyle = fGrad;
      ctx.fillRect(0, 0, 512, 512);

      ctx.fillStyle = 'rgba(6, 78, 59, 0.35)';
      for (let y = 60; y < 480; y += 70) {
        for (let x = 40; x < 480; x += 80) {
          ctx.beginPath();
          ctx.arc(x, y, 22, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      drawEmblem(ctx, 135, 175, 38, '#ffffff');

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

      ctx.fillStyle = fGrad;
      ctx.fillRect(512, 0, 512, 512);
      ctx.font = '900 52px "Arial Black", sans-serif';
      ctx.fillStyle = '#064e3b';
      ctx.fillText('KEEPER', 768, 140);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('KEEPER', 768, 136);

      ctx.font = '900 188px "Arial Black", sans-serif';
      ctx.fillStyle = '#064e3b';
      ctx.fillText('1', 768, 290);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('1', 768, 284);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 512, 512, 256);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(20, 512, 24, 256);
      ctx.fillRect(468, 512, 24, 256);

      ctx.fillStyle = '#f4c29e';
      ctx.fillRect(512, 512, 512, 256);

      ctx.fillStyle = '#10b981';
      ctx.fillRect(0, 768, 512, 256);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(512, 768, 512, 256);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(512, 970, 512, 54);

      return cvs.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
    }

    return {
      footyAtlas: makeFootyAtlas(),
      hoopsAtlas: makeHoopsAtlas(),
      keeperAtlas: makeKeeperAtlas()
    };
  }, emblemBase64);

  fs.writeFileSync(path.join(ROOT, 'assets/characters/footy10_atlas.png'), Buffer.from(footyAtlas, 'base64'));
  fs.writeFileSync(path.join(ROOT, 'assets/characters/hoops23_atlas.png'), Buffer.from(hoopsAtlas, 'base64'));
  fs.writeFileSync(path.join(ROOT, 'assets/characters/keeper1_atlas.png'), Buffer.from(keeperAtlas, 'base64'));
  console.log('✓ Successfully baked all 1024x1024 sports kit atlases!');

  await browser.close();
}

function processModel(srcGlbPath, dstGlbPath, atlasPath, charType) {
  console.log(`\n=== Step 2: Processing & Sculpting: ${path.basename(dstGlbPath)} (Type: ${charType}) ===`);
  const glbBuf = fs.readFileSync(srcGlbPath);
  const atlasBuf = fs.readFileSync(atlasPath);
  const ab = glbBuf.buffer.slice(glbBuf.byteOffset, glbBuf.byteOffset + glbBuf.byteLength);

  const { gltf, bin } = glbLoader.parseGLBContainer(ab);

  const isFooty = (charType === 'footy');
  const isHoops = (charType === 'hoops');
  const isKeeper = (charType === 'keeper');

  const headMesh = gltf.meshes.find(m => m.name === 'Cube.015');

  // -------------------------------------------------------------
  // A1. TUCK BACK-OF-SKULL SKIN VERTICES TO PREVENT HAIR CLIPPING
  // Deep tuck: any skull vertex at the back (z < 0.02, y > 1.56) is safely drawn inside the hair dome!
  // -------------------------------------------------------------
  if (headMesh && headMesh.primitives[0]) {
    const skinPrim = headMesh.primitives[0];
    const acc = gltf.accessors[skinPrim.attributes.POSITION];
    const bv = gltf.bufferViews[acc.bufferView];
    const byteOffset = (bv.byteOffset || 0) + (acc.byteOffset || 0);
    const skinFloats = new Float32Array(bin, byteOffset, acc.count * 3);

    let tucked = 0;
    for (let i = 0; i < acc.count; i++) {
      const x = skinFloats[i * 3];
      const y = skinFloats[i * 3 + 1];
      const z = skinFloats[i * 3 + 2];
      if (y > 1.56 && z < 0.02) {
        // Tucks skull safely inside hair dome (forward and slightly narrowed)
        skinFloats[i * 3] = x * 0.90;
        skinFloats[i * 3 + 2] = Math.max(-0.026, z * 0.50);
        tucked++;
      }
    }
    console.log(`  ✓ Skull: Tucked ${tucked} back-of-skull vertices inside hair envelope.`);
  }

  // -------------------------------------------------------------
  // A2. HAIR SCULPTING (Cube.015, Prim 3)
  // Clean neckline, zero ponytail, zero bald spots, 100% full coverage!
  // -------------------------------------------------------------
  if (headMesh && headMesh.primitives[3]) {
    const hairPrim = headMesh.primitives[3];
    const posAcc = gltf.accessors[hairPrim.attributes.POSITION];
    const bv = gltf.bufferViews[posAcc.bufferView];
    const byteOffset = (bv.byteOffset || 0) + (posAcc.byteOffset || 0);
    const hairFloats = new Float32Array(bin, byteOffset, posAcc.count * 3);

    let ponytailFixed = 0;
    let fadeSculpted = 0;

    for (let i = 0; i < posAcc.count; i++) {
      let x = hairFloats[i * 3];
      let y = hairFloats[i * 3 + 1];
      let z = hairFloats[i * 3 + 2];

      // 1. Ponytail Eradication: tuck any dangling ponytail vertices into natural nape line
      if (y < 1.595) {
        hairFloats[i * 3 + 1] = 1.600;
        hairFloats[i * 3 + 2] = Math.max(-0.065, z);
        ponytailFixed++;
      } else if (z < -0.076) {
        hairFloats[i * 3 + 2] = -0.070 + (z + 0.076) * 0.05;
        ponytailFixed++;
      }

      // 2. Guarantee full hair envelope over the back of skull (z <= -0.052)
      if (y > 1.58 && y < 1.76 && z < -0.02 && z > -0.055 && Math.abs(x) < 0.05) {
        hairFloats[i * 3 + 2] = -0.058;
        ponytailFixed++;
      }

      // 3. Specific Hairstyles
      if (isHoops) {
        // High-Top Fade:
        // Top of hair (Y > 1.78) forms a crisp, clean flat-top box
        if (y > 1.78) {
          hairFloats[i * 3] = Math.max(-0.082, Math.min(0.082, x));
          hairFloats[i * 3 + 2] = Math.max(-0.058, Math.min(0.070, hairFloats[i * 3 + 2]));
          fadeSculpted++;
        }
        // Fade sides neatly to the skull contour
        if (y < 1.76 && Math.abs(x) > 0.080) {
          hairFloats[i * 3] = (x > 0 ? 1 : -1) * (0.078 + (Math.abs(x) - 0.080) * 0.20);
          fadeSculpted++;
        }
      } else if (isFooty || isKeeper) {
        // Tapered Modern Swept Hair:
        if (y > 1.76) {
          hairFloats[i * 3 + 2] = hairFloats[i * 3 + 2] + 0.008;
        }
        if (y < 1.75 && Math.abs(x) > 0.084) {
          hairFloats[i * 3] = x * 0.95;
        }
      }
    }
    console.log(`  ✓ Hair: Eradicated ${ponytailFixed} ponytail/recess vertices, sculpted ${fadeSculpted} fade vertices.`);
  }

  // -------------------------------------------------------------
  // B. ATHLETIC BODY SCULPTING (Cube.010 & Cube.019)
  const torsoMesh = gltf.meshes.find(m => m.name === 'Cube.010');
  // B0. ATHLETIC ARM MUSCULATURE (Cube.010 Prim 0 - Skin/Arms)
  if (torsoMesh && torsoMesh.primitives[0]) {
    const armPrim = torsoMesh.primitives[0];
    const posAcc = gltf.accessors[armPrim.attributes.POSITION];
    const bv = gltf.bufferViews[posAcc.bufferView];
    const armFloats = new Float32Array(bin, (bv.byteOffset || 0) + (posAcc.byteOffset || 0), posAcc.count * 3);
    for (let i = 0; i < posAcc.count; i++) {
      let x = armFloats[i * 3];
      let y = armFloats[i * 3 + 1];
      let z = armFloats[i * 3 + 2];
      if (Math.abs(x) > 0.18 && y > 0.90 && y < 1.45) {
        armFloats[i * 3] = x * 1.08;
        armFloats[i * 3 + 2] = z * 1.08;
      }
    }
    console.log('  ✓ Arms: Sculpted athletic deltoids and biceps.');
  }

  // -------------------------------------------------------------
  if (torsoMesh && torsoMesh.primitives[1]) {
    const shirtPrim = torsoMesh.primitives[1];
    const posAcc = gltf.accessors[shirtPrim.attributes.POSITION];
    const bv = gltf.bufferViews[posAcc.bufferView];
    const byteOffset = (bv.byteOffset || 0) + (posAcc.byteOffset || 0);
    const posFloats = new Float32Array(bin, byteOffset, posAcc.count * 3);

    for (let i = 0; i < posAcc.count; i++) {
      let x = posFloats[i * 3];
      let y = posFloats[i * 3 + 1];
      let z = posFloats[i * 3 + 2];

      // Broaden athletic deltoid shoulders
      if (y > 1.34) {
        posFloats[i * 3] = x * 1.07;
      }
      // Expand athletic chest
      if (y > 1.25 && y < 1.48 && z > 0.04) {
        posFloats[i * 3 + 2] = z + 0.012;
      }
      // Taper athletic waist
      if (y < 1.22) {
        posFloats[i * 3] = x * 0.95;
      }
    }
    console.log('  ✓ Body: Sculpted heroic athletic V-taper on torso.');
  }

  // -------------------------------------------------------------
  // C. PLANAR UV RE-PROJECTION FOR 1:1 PERFECT UNIFORM ALIGNMENT
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
    console.log('  ✓ UV: Re-projected Torso shirt Front & Back planar UV coordinates.');
  }

  const legsMesh = gltf.meshes.find(m => m.name === 'Cube.019');
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

      if (y >= 0.55) {
        const normY = Math.max(0, Math.min(1, (1.036 - y) / 0.486));
        const normX = Math.max(-1, Math.min(1, x / 0.176));
        if (z >= 0.05) {
          uvs[i * 2] = 0.25 + normX * 0.20;
        } else {
          uvs[i * 2] = 0.25 - normX * 0.20;
        }
        uvs[i * 2 + 1] = 0.52 + normY * 0.22;
      } else {
        const normY = Math.max(0, Math.min(1, (0.550 - y) / 0.417));
        const normX = Math.max(-1, Math.min(1, x / 0.176));
        uvs[i * 2] = 0.25 + normX * 0.20;
        uvs[i * 2 + 1] = 0.76 + normY * 0.22;
      }
    }
    console.log('  ✓ UV: Re-projected Shorts & Socks UV coordinates.');
  }

  const feetMesh = gltf.meshes.find(m => m.name === 'Cube.003');
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
    console.log('  ✓ UV: Re-projected Boots/Shoes UV coordinates.');
  }

  // -------------------------------------------------------------
  // D. EMBED PRISTINE TEXTURE ATLAS INTO GLB CONTAINER
  // -------------------------------------------------------------
  const atlasLength = atlasBuf.length;
  const padLength = (4 - (atlasLength % 4)) % 4;
  const totalAtlasLength = atlasLength + padLength;

  const newBinBuffer = new ArrayBuffer(bin.byteLength + totalAtlasLength);
  const newBinUint8 = new Uint8Array(newBinBuffer);

  newBinUint8.set(new Uint8Array(bin), 0);
  const imageOffset = bin.byteLength;
  newBinUint8.set(new Uint8Array(atlasBuf), imageOffset);

  const imgBvIdx = gltf.bufferViews.length;
  gltf.bufferViews.push({
    buffer: 0,
    byteOffset: imageOffset,
    byteLength: atlasLength
  });

  gltf.images = [{
    bufferView: imgBvIdx,
    mimeType: 'image/png',
    name: 'HeroKitAtlas'
  }];

  gltf.samplers = [{
    magFilter: 9729,
    minFilter: 9987,
    wrapS: 10497,
    wrapT: 10497
  }];

  gltf.textures = [{
    sampler: 0,
    source: 0,
    name: 'HeroKitTexture'
  }];

  const texRef = { index: 0, texCoord: 0 };
  gltf.materials.forEach(mat => {
    if (mat.name === 'LightBrown' || mat.name === 'LightBlue' || mat.name === 'Red_Dark' || mat.name === 'White') {
      mat.pbrMetallicRoughness = mat.pbrMetallicRoughness || {};
      mat.pbrMetallicRoughness.baseColorTexture = texRef;
    }
  });

  const jsonStr = JSON.stringify(gltf);
  const jsonBuf = Buffer.from(jsonStr, 'utf8');
  const jsonPad = (4 - (jsonBuf.length % 4)) % 4;
  const totalJsonLen = jsonBuf.length + jsonPad;

  const binPad = (4 - (newBinBuffer.byteLength % 4)) % 4;
  const totalBinLen = newBinBuffer.byteLength + binPad;

  const totalGlbLen = 12 + 8 + totalJsonLen + 8 + totalBinLen;
  const outBuf = Buffer.alloc(totalGlbLen);

  outBuf.writeUInt32LE(0x46546C67, 0);
  outBuf.writeUInt32LE(2, 4);
  outBuf.writeUInt32LE(totalGlbLen, 8);

  outBuf.writeUInt32LE(totalJsonLen, 12);
  outBuf.writeUInt32LE(0x4E4F534A, 16);
  jsonBuf.copy(outBuf, 20);
  for (let i = 0; i < jsonPad; i++) outBuf.writeUInt8(0x20, 20 + jsonBuf.length + i);

  const binHeaderOffset = 20 + totalJsonLen;
  outBuf.writeUInt32LE(totalBinLen, binHeaderOffset);
  outBuf.writeUInt32LE(0x004E4942, binHeaderOffset + 4);
  Buffer.from(newBinBuffer).copy(outBuf, binHeaderOffset + 8);
  for (let i = 0; i < binPad; i++) outBuf.writeUInt8(0x00, binHeaderOffset + 8 + newBinBuffer.byteLength + i);

  fs.writeFileSync(dstGlbPath, outBuf);
  console.log(`✓ Saved overhauled model: ${dstGlbPath} (${outBuf.length} bytes)`);
}

async function main() {
  await generatePristineAtlases();

  processModel(
    path.join(ROOT, 'archive/dev_assets/footy10_backup_before_atlas.glb'),
    path.join(ROOT, 'assets/characters/footy10.glb'),
    path.join(ROOT, 'assets/characters/footy10_atlas.png'),
    'footy'
  );

  processModel(
    path.join(ROOT, 'archive/dev_assets/hoops23_backup_before_atlas.glb'),
    path.join(ROOT, 'assets/characters/hoops23.glb'),
    path.join(ROOT, 'assets/characters/hoops23_atlas.png'),
    'hoops'
  );

  processModel(
    path.join(ROOT, 'archive/dev_assets/footy10_backup_before_atlas.glb'),
    path.join(ROOT, 'assets/characters/keeper1.glb'),
    path.join(ROOT, 'assets/characters/keeper1_atlas.png'),
    'keeper'
  );

  console.log('\n=== ALL HERO ATHLETES OVERHAULED SUCCESSFULLY! ===');
}

main().catch(err => {
  console.error('Fatal error during character overhaul:', err);
  process.exit(1);
});
