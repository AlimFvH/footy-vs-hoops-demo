const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const glbLoader = require('../assets/loaders/glb_loader.js');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

async function buildHeroAtlases() {
  console.log('--- STEP 1: Baking High-Fidelity Hero Atlases from Approved Option A Renders ---');
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const footyPreviewB64 = fs.readFileSync('assets/characters/footy10_preview.png').toString('base64');
  const hoopsPreviewB64 = fs.readFileSync('assets/characters/hoops23_preview.png').toString('base64');

  const { footyAtlasB64, hoopsAtlasB64 } = await page.evaluate(async (fB64, hB64) => {
    function loadImg(b64) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = 'data:image/png;base64,' + b64;
      });
    }

    const footyImg = await loadImg(fB64);
    const hoopsImg = await loadImg(hB64);

    function createAtlas(heroImg, isFooty) {
      const cvs = document.createElement('canvas');
      cvs.width = 1024;
      cvs.height = 1024;
      const ctx = cvs.getContext('2d');

      // Fill background base
      ctx.fillStyle = isFooty ? '#00c8ff' : '#111216';
      ctx.fillRect(0, 0, 1024, 1024);

      // --- QUAD 1: FRONT JERSEY (0, 0, 512, 512) ---
      // Draw background gradient
      const jGrad = ctx.createLinearGradient(0, 0, 0, 512);
      if (isFooty) {
        jGrad.addColorStop(0, '#00d2ff');
        jGrad.addColorStop(0.5, '#00b4ec');
        jGrad.addColorStop(1, '#009cd0');
      } else {
        jGrad.addColorStop(0, '#1c1d24');
        jGrad.addColorStop(0.5, '#111216');
        jGrad.addColorStop(1, '#0a0a0d');
      }
      ctx.fillStyle = jGrad;
      ctx.fillRect(0, 0, 512, 512);

      // Composite high-res jersey from hero render (sx: 200, sy: 270, sw: 320, sh: 250)
      ctx.drawImage(heroImg, 200, 270, 320, 250, 40, 40, 432, 432);

      // Sharp overlay typography: Club crest & number
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (isFooty) {
        ctx.font = '900 64px "Arial Black", Impact, sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.fillText('FOOTY', 256, 172);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('FOOTY', 256, 168);
        ctx.font = '900 128px "Arial Black", Impact, sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.fillText('10', 256, 304);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('10', 256, 300);
      } else {
        ctx.font = '900 68px "Arial Black", Impact, sans-serif';
        ctx.fillStyle = '#d97706';
        ctx.fillText('HOOPS', 256, 172);
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('HOOPS', 256, 168);
        ctx.font = '900 132px "Arial Black", Impact, sans-serif';
        ctx.fillStyle = '#d97706';
        ctx.fillText('23', 256, 304);
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('23', 256, 300);
      }

      // --- QUAD 2: BACK JERSEY (512, 0, 512, 512) ---
      ctx.fillStyle = jGrad;
      ctx.fillRect(512, 0, 512, 512);
      if (isFooty) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.moveTo(512, 0); ctx.lineTo(640, 0); ctx.lineTo(512, 200); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(1024, 0); ctx.lineTo(896, 0); ctx.lineTo(1024, 200); ctx.closePath(); ctx.fill();
        ctx.font = '900 60px "Arial Black", Impact, sans-serif';
        ctx.fillStyle = '#0f172a'; ctx.fillText('FOOTY', 768, 110);
        ctx.fillStyle = '#ffffff'; ctx.fillText('FOOTY', 768, 106);
        ctx.font = '900 160px "Arial Black", Impact, sans-serif';
        ctx.fillStyle = '#0f172a'; ctx.fillText('10', 768, 270);
        ctx.fillStyle = '#ffffff'; ctx.fillText('10', 768, 264);
      } else {
        ctx.fillStyle = '#d97706';
        ctx.fillRect(512, 0, 40, 512); ctx.fillRect(984, 0, 40, 512);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(544, 0, 12, 512); ctx.fillRect(972, 0, 12, 512);
        ctx.font = '900 60px "Arial Black", Impact, sans-serif';
        ctx.fillStyle = '#d97706'; ctx.fillText('ALL-STAR', 768, 110);
        ctx.fillStyle = '#fbbf24'; ctx.fillText('ALL-STAR', 768, 106);
        ctx.font = '900 160px "Arial Black", Impact, sans-serif';
        ctx.fillStyle = '#d97706'; ctx.fillText('23', 768, 270);
        ctx.fillStyle = '#fbbf24'; ctx.fillText('23', 768, 264);
      }

      // --- QUAD 3: SHORTS (0, 512, 512, 256) ---
      ctx.fillStyle = isFooty ? '#0f172a' : '#111216';
      ctx.fillRect(0, 512, 512, 256);
      // Composite hero shorts (sx: 240, sy: 520, sw: 240, sh: 140)
      ctx.drawImage(heroImg, 240, 520, 240, 140, 30, 530, 452, 220);

      // --- QUAD 4: FACE, EXPRESSIVE EYES, HAIR (512, 512, 512, 256) ---
      // Warm skin base
      ctx.fillStyle = isFooty ? '#e5a882' : '#78462a';
      ctx.fillRect(512, 512, 512, 256);
      // Composite genuine hero face and stylized hair directly from Pixar render!
      // Head bounds: (sx: 240, sy: 77, sw: 240, sh: 210)
      ctx.drawImage(heroImg, 240, 77, 240, 210, 530, 520, 470, 240);

      // --- QUAD 5: SOCKS & SLEEVES (0, 768, 512, 256) ---
      ctx.fillStyle = isFooty ? '#e5a882' : '#78462a';
      ctx.fillRect(0, 768, 256, 256);
      if (isFooty) {
        ctx.fillStyle = '#00d2ff'; ctx.fillRect(256, 768, 256, 256);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(256, 820, 256, 40);
        ctx.fillStyle = '#0f172a'; ctx.fillRect(256, 860, 256, 16);
      } else {
        ctx.fillStyle = '#111216'; ctx.fillRect(256, 768, 256, 256);
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(256, 820, 256, 28);
      }

      // --- QUAD 6: ATHLETIC FOOTWEAR (512, 768, 512, 256) ---
      ctx.fillStyle = isFooty ? '#00c8ff' : '#111216';
      ctx.fillRect(512, 768, 512, 256);
      // Composite authentic footwear from hero render
      ctx.drawImage(heroImg, 230, 760, 260, 160, 520, 780, 480, 230);

      return cvs.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
    }

    return {
      footyAtlasB64: createAtlas(footyImg, true),
      hoopsAtlasB64: createAtlas(hoopsImg, false)
    };
  }, footyPreviewB64, hoopsPreviewB64);

  fs.writeFileSync('assets/characters/footy10_atlas.png', Buffer.from(footyAtlasB64, 'base64'));
  fs.writeFileSync('assets/characters/hoops23_atlas.png', Buffer.from(hoopsAtlasB64, 'base64'));
  console.log('✓ Successfully baked 1024x1024 hero atlases with genuine Pixar face, hair, and kits!');

  await browser.close();
}

function smoothAndSculptGLB(glbPath, atlasPath) {
  console.log(`--- Sculpting and Smoothing 3D Mesh: ${glbPath} ---`);
  const glbBuf = fs.readFileSync(glbPath);
  const atlasBuf = fs.readFileSync(atlasPath);
  const { gltf, bin } = glbLoader.parseGLBContainer(glbBuf.buffer);

  // 1. Smooth Vertex Normals across all primitives to eliminate faceted polygon edges
  gltf.meshes.forEach(m => {
    m.primitives.forEach((p, pIdx) => {
      const accPos = gltf.accessors[p.attributes.POSITION];
      const accNorm = gltf.accessors[p.attributes.NORMAL];
      const accIdx = gltf.accessors[p.indices];
      if (!accPos || !accNorm || !accIdx) return;

      const bvPos = gltf.bufferViews[accPos.bufferView];
      const bvNorm = gltf.bufferViews[accNorm.bufferView];
      const bvIdx = gltf.bufferViews[accIdx.bufferView];

      const pos = new Float32Array(bin, (bvPos.byteOffset || 0) + (accPos.byteOffset || 0), accPos.count * 3);
      const norm = new Float32Array(bin, (bvNorm.byteOffset || 0) + (accNorm.byteOffset || 0), accNorm.count * 3);
      const indexData = (accIdx.componentType === 5125) ?
        new Uint32Array(bin, (bvIdx.byteOffset || 0) + (accIdx.byteOffset || 0), accIdx.count) :
        new Uint16Array(bin, (bvIdx.byteOffset || 0) + (accIdx.byteOffset || 0), accIdx.count);

      // --- ELIMINATE BLOCKY EYEBROW & EYE CUBES ---
      // If this is Cube.015 (head), disable Eyebrows (Prim 2) and Eye (Prim 4)
      if (m.name === 'Cube.015' && (pIdx === 2 || pIdx === 4)) {
        console.log(`  [Clean] Zeroing protruding low-poly block primitive ${pIdx} (${gltf.materials[p.material].name})`);
        accIdx.count = 0; // Completely hides low-poly cube boxes from face!
        return;
      }

      // Smooth normal calculation
      const triCount = indexData.length / 3;
      const vertCount = accPos.count;
      const newNorms = new Float32Array(vertCount * 3);

      const posMap = new Map();
      for (let i = 0; i < vertCount; i++) {
        const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2];
        const k = Math.round(x * 1200) + '_' + Math.round(y * 1200) + '_' + Math.round(z * 1200);
        if (!posMap.has(k)) posMap.set(k, []);
        posMap.get(k).push(i);
      }

      for (let t = 0; t < triCount; t++) {
        const i0 = indexData[t * 3], i1 = indexData[t * 3 + 1], i2 = indexData[t * 3 + 2];
        const ax = pos[i0 * 3], ay = pos[i0 * 3 + 1], az = pos[i0 * 3 + 2];
        const bx = pos[i1 * 3], by = pos[i1 * 3 + 1], bz = pos[i1 * 3 + 2];
        const cx = pos[i2 * 3], cy = pos[i2 * 3 + 1], cz = pos[i2 * 3 + 2];

        const abx = bx - ax, aby = by - ay, abz = bz - az;
        const acx = cx - ax, acy = cy - ay, acz = cz - az;

        const nx = aby * acz - abz * acy;
        const ny = abz * acx - abx * acz;
        const nz = abx * acy - aby * acx;

        newNorms[i0 * 3] += nx; newNorms[i0 * 3 + 1] += ny; newNorms[i0 * 3 + 2] += nz;
        newNorms[i1 * 3] += nx; newNorms[i1 * 3 + 1] += ny; newNorms[i1 * 3 + 2] += nz;
        newNorms[i2 * 3] += nx; newNorms[i2 * 3 + 1] += ny; newNorms[i2 * 3 + 2] += nz;
      }

      for (const [_, vList] of posMap.entries()) {
        let sx = 0, sy = 0, sz = 0;
        for (const v of vList) { sx += newNorms[v * 3]; sy += newNorms[v * 3 + 1]; sz += newNorms[v * 3 + 2]; }
        const l = Math.hypot(sx, sy, sz);
        if (l > 1e-6) { sx /= l; sy /= l; sz /= l; } else { sy = 1; }
        for (const v of vList) { norm[v * 3] = sx; norm[v * 3 + 1] = sy; norm[v * 3 + 2] = sz; }
      }
    });
  });

  // 2. Align & Embed the New Hero Atlas into the GLB
  const imgDef = gltf.images[0];
  const bv = gltf.bufferViews[imgDef.bufferView];

  const pad = (4 - (atlasBuf.length % 4)) % 4;
  const paddedAtlas = pad > 0 ? Buffer.concat([atlasBuf, Buffer.alloc(pad)]) : atlasBuf;

  const binPrefix = Buffer.from(bin.slice(0, bv.byteOffset));
  const newBin = Buffer.concat([binPrefix, paddedAtlas]);

  bv.byteLength = atlasBuf.length;
  gltf.buffers[0].byteLength = newBin.length;

  if (gltf.materials) {
    gltf.materials.forEach(mat => {
      if (!mat.pbrMetallicRoughness) mat.pbrMetallicRoughness = {};
      mat.pbrMetallicRoughness.baseColorFactor = [1, 1, 1, 1];
      mat.pbrMetallicRoughness.roughnessFactor = 0.52;
      mat.pbrMetallicRoughness.metallicFactor = 0.05;
    });
  }

  const jsonStr = JSON.stringify(gltf);
  const jsonBuf = Buffer.from(jsonStr, 'utf8');
  const jsonPad = (4 - (jsonBuf.length % 4)) % 4;
  const paddedJson = jsonPad > 0 ? Buffer.concat([jsonBuf, Buffer.alloc(jsonPad, 0x20)]) : jsonBuf;

  const totalLen = 12 + 8 + paddedJson.length + 8 + newBin.length;
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546C67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(totalLen, 8);

  const c0Header = Buffer.alloc(8);
  c0Header.writeUInt32LE(paddedJson.length, 0);
  c0Header.writeUInt32LE(0x4E4F534A, 4);

  const c1Header = Buffer.alloc(8);
  c1Header.writeUInt32LE(newBin.length, 0);
  c1Header.writeUInt32LE(0x004E4942, 4);

  const finalGLB = Buffer.concat([header, c0Header, paddedJson, c1Header, newBin]);
  fs.writeFileSync(glbPath, finalGLB);
  console.log(`✓ Saved smoothed & upgraded GLB: ${glbPath} (${finalGLB.length} bytes)`);
}

async function run() {
  await buildHeroAtlases();
  smoothAndSculptGLB('assets/characters/footy10.glb', 'assets/characters/footy10_atlas.png');
  smoothAndSculptGLB('assets/characters/hoops23.glb', 'assets/characters/hoops23_atlas.png');
  console.log('--- ALL CHARACTERS FULLY SCULPTED, SMOOTHED & UPGRADED! ---');
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
