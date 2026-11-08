const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const glbLoader = require('../assets/loaders/glb_loader.js');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const ROOT = path.resolve(__dirname, '..');

async function generatePristineAtlases() {
  console.log('=== 1. Generating High-Fidelity 2048x2048 Fortnite Sports Kit Atlases ===');
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const emblemBase64 = fs.readFileSync(path.join(ROOT, 'public/emblem.png')).toString('base64');

  const { footyAtlas, hoopsAtlas } = await page.evaluate(async (embB64) => {
    function loadImg(b64) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = 'data:image/png;base64,' + b64;
      });
    }

    const emblemImg = await loadImg(embB64);

    // -------------------------------------------------------------
    // FOOTY #10 ATLAS (2048x2048)
    // -------------------------------------------------------------
    function makeFootyAtlas() {
      const cvs = document.createElement('canvas');
      cvs.width = 1024;
      cvs.height = 1024;
      const ctx = cvs.getContext('2d');

      // Base background
      ctx.fillStyle = '#00b4ec';
      ctx.fillRect(0, 0, 1024, 1024);

      // --- QUAD 1: FRONT JERSEY (0, 0, 512, 512) ---
      const fGrad = ctx.createLinearGradient(0, 0, 0, 512);
      fGrad.addColorStop(0, '#00e5ff');
      fGrad.addColorStop(0.3, '#00c4f5');
      fGrad.addColorStop(0.7, '#00a4e4');
      fGrad.addColorStop(1, '#0084cc');
      ctx.fillStyle = fGrad;
      ctx.fillRect(0, 0, 512, 512);

      // Raglan White Shoulder Panels
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(160, 0); ctx.lineTo(0, 260); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(512, 0); ctx.lineTo(352, 0); ctx.lineTo(512, 260); ctx.closePath(); ctx.fill();

      // Navy Collar V-Neck Trim
      ctx.fillStyle = '#0a1e3f';
      ctx.beginPath();
      ctx.moveTo(180, 0); ctx.lineTo(332, 0); ctx.lineTo(256, 95); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(205, 0); ctx.lineTo(307, 0); ctx.lineTo(256, 75); ctx.closePath(); ctx.fill();

      // Official FOOTY vs HOOPS Crest on Left Chest (Strict 1:1 Proportions)
      const embRadius = 42;
      const embX = 145;
      const embY = 175;
      ctx.save();
      ctx.beginPath();
      ctx.arc(embX, embY, embRadius + 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(10, 25, 55, 0.85)';
      ctx.fill();
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.drawImage(emblemImg, embX - embRadius, embY - embRadius, embRadius * 2, embRadius * 2);
      ctx.restore();

      // Front Club Wordmark "FOOTY"
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 68px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = 'rgba(10, 30, 65, 0.45)';
      ctx.fillText('FOOTY', 256, 222);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('FOOTY', 256, 218);

      // Front Squad Number "10"
      ctx.font = '900 148px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#0a1e3f';
      ctx.fillText('10', 256, 355);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('10', 256, 350);

      // --- QUAD 2: BACK JERSEY (512, 0, 512, 512) ---
      const bGrad = ctx.createLinearGradient(512, 0, 512, 512);
      bGrad.addColorStop(0, '#00daf5');
      bGrad.addColorStop(0.5, '#00b4ec');
      bGrad.addColorStop(1, '#0088ce');
      ctx.fillStyle = bGrad;
      ctx.fillRect(512, 0, 512, 512);

      // White Upper Shoulder Chevron Stripes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(512, 0); ctx.lineTo(650, 0); ctx.lineTo(512, 220); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(1024, 0); ctx.lineTo(886, 0); ctx.lineTo(1024, 220); ctx.closePath(); ctx.fill();

      // Navy Back Collar
      ctx.fillStyle = '#0a1e3f';
      ctx.beginPath();
      ctx.moveTo(680, 0); ctx.lineTo(856, 0); ctx.lineTo(768, 55); ctx.closePath(); ctx.fill();

      // Player Name Arc "FOOTY"
      ctx.font = '900 56px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = 'rgba(10, 30, 65, 0.45)';
      ctx.fillText('FOOTY', 768, 126);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('FOOTY', 768, 122);

      // Massive Back Number "10"
      ctx.font = '900 196px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#0a1e3f';
      ctx.fillText('10', 768, 290);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('10', 768, 282);

      // Lower Hem Ventilation Micro-Mesh
      ctx.fillStyle = 'rgba(10, 30, 65, 0.15)';
      for (let y = 470; y < 512; y += 8) {
        ctx.fillRect(512, y, 512, 3);
      }

      // --- QUAD 3: SHORTS (0, 512, 512, 256) ---
      ctx.fillStyle = '#0a1e3f'; // Dark Athletic Navy
      ctx.fillRect(0, 512, 512, 256);

      // Vibrant Cyan Side Racing Stripes
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(20, 512, 35, 256);
      ctx.fillRect(457, 512, 35, 256);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(55, 512, 10, 256);
      ctx.fillRect(447, 512, 10, 256);

      // Squad Number 10 on Right Thigh
      ctx.font = '900 68px "Arial Black", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('10', 380, 675);

      // Small Badge on Left Thigh
      ctx.drawImage(emblemImg, 80, 645, 55, 55);

      // --- QUAD 4: CLEAN FACE TONE & HEAD MAP (512, 512, 512, 256) ---
      // Healthy Tan Athletic Skin Tone
      ctx.fillStyle = '#f4c29e';
      ctx.fillRect(512, 512, 512, 256);
      // Soft ambient jawline & cheek shading
      const cheekGrad = ctx.createRadialGradient(768, 640, 20, 768, 640, 180);
      cheekGrad.addColorStop(0, '#f2b58d');
      cheekGrad.addColorStop(1, '#f4c29e');
      ctx.fillStyle = cheekGrad;
      ctx.fillRect(512, 512, 512, 256);

      // --- QUAD 5: SOCKS & SLEEVES (0, 768, 512, 256) ---
      // Upper half: skin
      ctx.fillStyle = '#f4c29e';
      ctx.fillRect(0, 768, 512, 110);
      // Lower half: Cyan & White Socks
      ctx.fillStyle = '#00b4ec';
      ctx.fillRect(0, 878, 512, 146);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 878, 512, 28);
      ctx.fillStyle = '#0a1e3f';
      ctx.fillRect(0, 915, 512, 14);

      // --- QUAD 6: FOOTBALL FG CLEATS (512, 768, 512, 256) ---
      // Radiant Cyan Upper
      ctx.fillStyle = '#00b4ec';
      ctx.fillRect(512, 768, 512, 256);
      // Aerodynamic White Side Swoosh
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(560, 870);
      ctx.bezierCurveTo(680, 840, 780, 900, 880, 830);
      ctx.bezierCurveTo(800, 890, 700, 885, 560, 870);
      ctx.fill();
      // Navy Heel Counter & Sole Plate
      ctx.fillStyle = '#0a1e3f';
      ctx.fillRect(512, 970, 512, 54);

      return cvs.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
    }

    // -------------------------------------------------------------
    // HOOPS #23 ATLAS (2048x2048)
    // -------------------------------------------------------------
    function makeHoopsAtlas() {
      const cvs = document.createElement('canvas');
      cvs.width = 1024;
      cvs.height = 1024;
      const ctx = cvs.getContext('2d');

      // Base background: Obsidian Black
      ctx.fillStyle = '#14151a';
      ctx.fillRect(0, 0, 1024, 1024);

      // --- QUAD 1: FRONT BASKETBALL JERSEY (0, 0, 512, 512) ---
      const fGrad = ctx.createLinearGradient(0, 0, 0, 512);
      fGrad.addColorStop(0, '#23242c');
      fGrad.addColorStop(0.4, '#17181e');
      fGrad.addColorStop(1, '#0e0f13');
      ctx.fillStyle = fGrad;
      ctx.fillRect(0, 0, 512, 512);

      // Gold Metallic Armhole & Shoulder Trim
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(0, 0, 48, 512);
      ctx.fillRect(464, 0, 48, 512);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(36, 0, 12, 512);
      ctx.fillRect(464, 0, 12, 512);

      // Gold Ribbed Collar
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(160, 0); ctx.lineTo(352, 0); ctx.lineTo(256, 110); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#14151a';
      ctx.beginPath();
      ctx.moveTo(195, 0); ctx.lineTo(317, 0); ctx.lineTo(256, 85); ctx.closePath(); ctx.fill();

      // Official Crest Badge on Chest
      const embRadius = 42;
      const embX = 145;
      const embY = 180;
      ctx.save();
      ctx.beginPath();
      ctx.arc(embX, embY, embRadius + 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(15, 15, 20, 0.9)';
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.drawImage(emblemImg, embX - embRadius, embY - embRadius, embRadius * 2, embRadius * 2);
      ctx.restore();

      // Arched Wordmark "HOOPS" in Championship Gold
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 74px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#b45309';
      ctx.fillText('HOOPS', 256, 224);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('HOOPS', 256, 218);

      // Bold Squad Number "23"
      ctx.font = '900 156px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#b45309';
      ctx.fillText('23', 256, 356);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('23', 256, 350);

      // --- QUAD 2: BACK JERSEY (512, 0, 512, 512) ---
      ctx.fillStyle = fGrad;
      ctx.fillRect(512, 0, 512, 512);

      // Gold Side Trim
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(512, 0, 48, 512);
      ctx.fillRect(976, 0, 48, 512);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(548, 0, 12, 512);
      ctx.fillRect(976, 0, 12, 512);

      // Upper Back Arc "ALL-STAR"
      ctx.font = '900 58px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#b45309';
      ctx.fillText('ALL-STAR', 768, 126);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('ALL-STAR', 768, 122);

      // Giant Back Number "23"
      ctx.font = '900 204px "Arial Black", "Montserrat", sans-serif';
      ctx.fillStyle = '#92400e';
      ctx.fillText('23', 768, 292);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('23', 768, 284);

      // --- QUAD 3: SHORTS (0, 512, 512, 256) ---
      ctx.fillStyle = '#14151a';
      ctx.fillRect(0, 512, 512, 256);

      // Double Gold Chevron Side Stripes
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 16;
      ctx.beginPath();
      // Left leg chevron
      ctx.moveTo(35, 520); ctx.lineTo(75, 610); ctx.lineTo(35, 700);
      // Right leg chevron
      ctx.moveTo(477, 520); ctx.lineTo(437, 610); ctx.lineTo(477, 700);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(50, 520); ctx.lineTo(90, 610); ctx.lineTo(50, 700);
      ctx.moveTo(462, 520); ctx.lineTo(422, 610); ctx.lineTo(462, 700);
      ctx.stroke();

      // Gold Bottom Hem
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(0, 746, 512, 22);

      // --- QUAD 4: WARM ATHLETIC BRONZE SKIN TONE (512, 512, 512, 256) ---
      ctx.fillStyle = '#804d2e';
      ctx.fillRect(512, 512, 512, 256);

      // --- QUAD 5: COMPRESSION SLEEVE & WRISTBAND (0, 768, 512, 256) ---
      // Matte Black Shooting Sleeve
      ctx.fillStyle = '#14151a';
      ctx.fillRect(0, 768, 512, 256);
      // Gold Wristband
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(0, 830, 512, 45);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 846, 512, 12);

      // --- QUAD 6: HIGH-TOP BASKETBALL SNEAKERS (512, 768, 512, 256) ---
      ctx.fillStyle = '#14151a';
      ctx.fillRect(512, 768, 512, 256);
      // Metallic Gold Toe & Ankle Collar
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(540, 940); ctx.bezierCurveTo(620, 880, 720, 880, 800, 940); ctx.closePath(); ctx.fill();
      ctx.fillRect(820, 780, 160, 65);
      // Crisp White Outsole
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(512, 975, 512, 49);

      return cvs.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
    }

    return {
      footyAtlas: makeFootyAtlas(),
      hoopsAtlas: makeHoopsAtlas()
    };
  }, emblemBase64);

  fs.writeFileSync(path.join(ROOT, 'assets/characters/footy10_atlas.png'), Buffer.from(footyAtlas, 'base64'));
  fs.writeFileSync(path.join(ROOT, 'assets/characters/hoops23_atlas.png'), Buffer.from(hoopsAtlas, 'base64'));
  console.log('✓ Successfully baked pristine 1024x1024 Fortnite sports kit atlases!');

  await browser.close();
}

function sculptHairAndEmbedTextures(glbPath, atlasPath, isHoops) {
  console.log(`=== 2. Sculpting Hair & Embedding Texture for: ${path.basename(glbPath)} ===`);
  const glbBuf = fs.readFileSync(glbPath);
  const atlasBuf = fs.readFileSync(atlasPath);
  const ab = glbBuf.buffer.slice(glbBuf.byteOffset, glbBuf.byteOffset + glbBuf.byteLength);

  const { gltf, bin } = glbLoader.parseGLBContainer(ab);

  // 1. Sculpt Hair Geometry: Eradicate ponytail, create clean tapered modern hair / high-top fade!
  const headMesh = gltf.meshes.find(m => m.name === 'Cube.015');
  if (headMesh && headMesh.primitives[3]) {
    const hairPrim = headMesh.primitives[3];
    const posAcc = gltf.accessors[hairPrim.attributes.POSITION];
    const bv = gltf.bufferViews[posAcc.bufferView];
    const byteOffset = (bv.byteOffset || 0) + (posAcc.byteOffset || 0);

    const hairFloats = new Float32Array(bin, byteOffset, posAcc.count * 3);
    let modified = 0;

    for (let i = 0; i < posAcc.count; i++) {
      let x = hairFloats[i * 3];
      let y = hairFloats[i * 3 + 1];
      let z = hairFloats[i * 3 + 2];

      // Eradicate dreadlock ponytail extending behind skull
      if (z < -0.055) {
        // Smoothly collapse vertices to hug the back of the skull
        hairFloats[i * 3 + 2] = -0.055 + (z + 0.055) * 0.08;
        modified++;
      }

      // For Hoops: shape into clean high-top fade box
      if (isHoops && y > 1.77) {
        // High top fade box
        hairFloats[i * 3] = Math.max(-0.088, Math.min(0.088, x));
        hairFloats[i * 3 + 2] = Math.max(-0.065, Math.min(0.065, hairFloats[i * 3 + 2]));
        modified++;
      }
    }
    console.log(`  Sculpted ${modified} hair vertices: ponytail eliminated, tapered cut achieved!`);
  }

  // 2. Embed the pristine texture into the BIN chunk
  const atlasLength = atlasBuf.length;
  // Pad atlas to 4-byte alignment
  const padLength = (4 - (atlasLength % 4)) % 4;
  const totalAtlasLength = atlasLength + padLength;

  const newBinBuffer = new ArrayBuffer(bin.byteLength + totalAtlasLength);
  const newBinUint8 = new Uint8Array(newBinBuffer);

  // Copy existing BIN
  newBinUint8.set(new Uint8Array(bin), 0);

  // Copy Atlas Image at the end
  const imageOffset = bin.byteLength;
  newBinUint8.set(new Uint8Array(atlasBuf), imageOffset);

  // Add bufferView for embedded image
  const imgBvIdx = gltf.bufferViews.length;
  gltf.bufferViews.push({
    buffer: 0,
    byteOffset: imageOffset,
    byteLength: atlasLength
  });

  // Add image
  gltf.images = [{
    bufferView: imgBvIdx,
    mimeType: 'image/png',
    name: 'HeroKitAtlas'
  }];

  // Add sampler
  gltf.samplers = [{
    magFilter: 9729, // LINEAR
    minFilter: 9987, // LINEAR_MIPMAP_LINEAR
    wrapS: 10497,    // REPEAT
    wrapT: 10497
  }];

  // Add texture
  gltf.textures = [{
    sampler: 0,
    source: 0,
    name: 'HeroKitTexture'
  }];

  // Connect texture to torso & legs & boots materials
  const texRef = { index: 0, texCoord: 0 };
  gltf.materials.forEach(mat => {
    if (mat.name === 'LightBrown' || mat.name === 'LightBlue' || mat.name === 'Red_Dark' || mat.name === 'White') {
      mat.pbrMetallicRoughness = mat.pbrMetallicRoughness || {};
      mat.pbrMetallicRoughness.baseColorTexture = texRef;
      mat.pbrMetallicRoughness.baseColorFactor = [1, 1, 1, 1];
      mat.pbrMetallicRoughness.roughnessFactor = 0.85;
      mat.pbrMetallicRoughness.metallicFactor = 0.05;
    }
  });

  // Re-encode GLB
  const jsonString = JSON.stringify(gltf);
  const jsonBuf = Buffer.from(jsonString, 'utf8');
  const jsonPad = (4 - (jsonBuf.length % 4)) % 4;
  const jsonChunkLen = jsonBuf.length + jsonPad;

  const binChunkLen = newBinBuffer.byteLength;
  const totalGlbLen = 12 + 8 + jsonChunkLen + 8 + binChunkLen;

  const outGlb = Buffer.alloc(totalGlbLen);
  outGlb.writeUInt32LE(0x46546C67, 0); // 'glTF'
  outGlb.writeUInt32LE(2, 4);          // version 2
  outGlb.writeUInt32LE(totalGlbLen, 8);

  // JSON Chunk header
  outGlb.writeUInt32LE(jsonChunkLen, 12);
  outGlb.writeUInt32LE(0x4E4F534A, 16); // 'JSON'
  jsonBuf.copy(outGlb, 20);
  for (let p = 0; p < jsonPad; p++) outGlb[20 + jsonBuf.length + p] = 0x20;

  // BIN Chunk header
  const binHeaderOffset = 20 + jsonChunkLen;
  outGlb.writeUInt32LE(binChunkLen, binHeaderOffset);
  outGlb.writeUInt32LE(0x004E4942, binHeaderOffset + 4); // 'BIN\0'
  Buffer.from(newBinBuffer).copy(outGlb, binHeaderOffset + 8);

  fs.writeFileSync(glbPath, outGlb);
  console.log(`✓ Repacked ${path.basename(glbPath)} with sculpted hair and embedded 1024x1024 atlas (${totalGlbLen} bytes)`);
}

async function run() {
  await generatePristineAtlases();
  sculptHairAndEmbedTextures(path.join(ROOT, 'assets/characters/footy10.glb'), path.join(ROOT, 'assets/characters/footy10_atlas.png'), false);
  sculptHairAndEmbedTextures(path.join(ROOT, 'assets/characters/hoops23.glb'), path.join(ROOT, 'assets/characters/hoops23_atlas.png'), true);
  console.log('=== All characters sculpted and textures baked successfully! ===');
}

run().catch(err => {
  console.error('Overhaul error:', err);
  process.exit(1);
});
