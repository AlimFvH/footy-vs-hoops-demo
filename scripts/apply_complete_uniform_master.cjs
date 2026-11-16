const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const fs = require('fs');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

async function masterBake() {
  console.log('=== Complete Uniform Master (Front + Back) ===');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:8099/index.html');

  async function bakeOne(athleteId, rawGlbName, previewName, nameStr, numStr, primaryCol, strokeCol, chestCfg) {
    console.log(`Polishing ${athleteId}...`);

    const resultBase64 = await page.evaluate(async (rawGlbUrl, prevUrl, name, num, pCol, sCol, cfg) => {
      const [glbResp, prevImg] = await Promise.all([
        fetch(rawGlbUrl).then(r => r.arrayBuffer()),
        new Promise((res, rej) => {
          const img = new Image();
          img.onload = () => res(img);
          img.onerror = rej;
          img.src = prevUrl;
        })
      ]);

      const { gltf, bin } = window.GLBLoader.parseGLBContainer(glbResp);

      function getAccessor(idx) {
        const acc = gltf.accessors[idx];
        const bv = gltf.bufferViews[acc.bufferView];
        const byteOffset = (bv.byteOffset || 0) + (acc.byteOffset || 0);
        if (acc.componentType === 5126) return new Float32Array(bin, byteOffset, acc.count * (acc.type === 'VEC3' ? 3 : 2));
        if (acc.componentType === 5125) return new Uint32Array(bin, byteOffset, acc.count);
        if (acc.componentType === 5123) return new Uint16Array(bin, byteOffset, acc.count);
      }

      const prim = gltf.meshes[0].primitives[0];
      const pos = getAccessor(prim.attributes.POSITION);
      const uvs = getAccessor(prim.attributes.TEXCOORD_0);
      const indices = getAccessor(prim.indices);

      // Base Texture from raw backup
      const imgDef = gltf.images[0];
      const bv = gltf.bufferViews[imgDef.bufferView];
      const baseBlob = new Blob([new Uint8Array(bin, bv.byteOffset || 0, bv.byteLength)], { type: 'image/png' });
      const baseImg = await new Promise(r => {
        const i = new Image();
        i.onload = () => r(i);
        i.src = URL.createObjectURL(baseBlob);
      });

      const W = 1024, H = 1024;
      const cvs = document.createElement('canvas');
      cvs.width = W; cvs.height = H;
      const ctx = cvs.getContext('2d');
      ctx.drawImage(baseImg, 0, 0, W, H);

      // 1. Prepare Concept Art Preview
      const pCvs = document.createElement('canvas');
      pCvs.width = prevImg.naturalWidth;
      pCvs.height = prevImg.naturalHeight;
      const pCtx = pCvs.getContext('2d');
      pCtx.drawImage(prevImg, 0, 0);
      const pData = pCtx.getImageData(0, 0, pCvs.width, pCvs.height).data;
      const PW = pCvs.width, PH = pCvs.height;

      function samplePreview(px, py) {
        if (px < 0 || px >= PW - 1 || py < 0 || py >= PH - 1) return null;
        const x0 = Math.floor(px), y0 = Math.floor(py);
        const fx = px - x0, fy = py - y0;
        const i00 = (y0 * PW + x0) * 4;
        const i10 = (y0 * PW + x0 + 1) * 4;
        const i01 = ((y0 + 1) * PW + x0) * 4;
        const i11 = ((y0 + 1) * PW + x0 + 1) * 4;
        const a = (pData[i00+3]*(1-fx) + pData[i10+3]*fx)*(1-fy) + (pData[i01+3]*(1-fx) + pData[i11+3]*fx)*fy;
        if (a < 50) return null;
        const r = (pData[i00]*(1-fx) + pData[i10]*fx)*(1-fy) + (pData[i01]*(1-fx) + pData[i11]*fx)*fy;
        const g = (pData[i00+1]*(1-fx) + pData[i10+1]*fx)*(1-fy) + (pData[i01+1]*(1-fx) + pData[i11+1]*fx)*fy;
        const b = (pData[i00+2]*(1-fx) + pData[i10+2]*fx)*(1-fy) + (pData[i01+2]*(1-fx) + pData[i11+2]*fx)*fy;
        return [r, g, b, a / 255];
      }

      // 2. Prepare Crisp Back Jersey Graphics Canvas
      const bCvs = document.createElement('canvas');
      bCvs.width = 512; bCvs.height = 512;
      const bCtx = bCvs.getContext('2d');

      // Player Surname
      bCtx.font = '900 68px "Impact", -apple-system, sans-serif';
      bCtx.textAlign = 'center';
      bCtx.textBaseline = 'middle';
      bCtx.lineWidth = 14;
      bCtx.strokeStyle = sCol;
      bCtx.fillStyle = '#ffffff';
      bCtx.strokeText(name, 256, 120);
      bCtx.fillText(name, 256, 120);

      // Huge Squad Number
      bCtx.font = '900 240px "Impact", -apple-system, sans-serif';
      bCtx.lineWidth = 26;
      bCtx.strokeStyle = sCol;
      bCtx.strokeText(num, 256, 300);
      bCtx.fillStyle = pCol;
      bCtx.fillText(num, 256, 300);
      bCtx.lineWidth = 4;
      bCtx.strokeStyle = '#ffffff';
      bCtx.strokeText(num, 256, 300);

      const bData = bCtx.getImageData(0, 0, 512, 512).data;
      function sampleBack(px, py) {
        if (px < 0 || px >= 512 || py < 0 || py >= 512) return null;
        const idx = (Math.floor(py) * 512 + Math.floor(px)) * 4;
        const a = bData[idx + 3];
        if (a < 30) return null;
        return [bData[idx], bData[idx + 1], bData[idx + 2], a / 255];
      }

      const atlasImgData = ctx.getImageData(0, 0, W, H);
      const atlas = atlasImgData.data;

      // 3. Rasterize Front & Back onto UV
      for (let t = 0; t < indices.length; t += 3) {
        const i0 = indices[t], i1 = indices[t+1], i2 = indices[t+2];
        const x0 = pos[i0*3], y0 = pos[i0*3+1], z0 = pos[i0*3+2];
        const x1 = pos[i1*3], y1 = pos[i1*3+1], z1 = pos[i1*3+2];
        const x2 = pos[i2*3], y2 = pos[i2*3+1], z2 = pos[i2*3+2];

        const cz = (z0 + z1 + z2) / 3;
        const cy = (y0 + y1 + y2) / 3;
        const cx = (x0 + x1 + x2) / 3;

        const ax = x1 - x0, ay = y1 - y0, az = z1 - z0;
        const bx = x2 - x0, by = y2 - y0, bz = z2 - z0;
        const nx = ay * bz - az * by;
        const ny = az * bx - ax * bz;
        const nz = ax * by - ay * bx;
        const normZ = nz / (Math.hypot(nx, ny, nz) || 1);

        const isFront = (cz > cfg.minZ && normZ > 0.25 && cy >= cfg.minY && cy <= cfg.maxY && Math.abs(cx) <= cfg.maxX);
        const isBack = (cz < -cfg.minZ && normZ < -0.25 && cy >= cfg.minY && cy <= cfg.maxY && Math.abs(cx) <= cfg.maxX);

        if (!isFront && !isBack) continue;

        const u0 = uvs[i0*2] * W, v0 = uvs[i0*2+1] * H;
        const u1 = uvs[i1*2] * W, v1 = uvs[i1*2+1] * H;
        const u2 = uvs[i2*2] * W, v2 = uvs[i2*2+1] * H;

        const minU = Math.max(0, Math.floor(Math.min(u0, u1, u2)));
        const maxU = Math.min(W - 1, Math.ceil(Math.max(u0, u1, u2)));
        const minV = Math.max(0, Math.floor(Math.min(v0, v1, v2)));
        const maxV = Math.min(H - 1, Math.ceil(Math.max(v0, v1, v2)));

        const denom = (v1 - v2) * (u0 - u2) + (u2 - u1) * (v0 - v2);
        if (Math.abs(denom) < 1e-5) continue;

        for (let y = minV; y <= maxV; y++) {
          for (let x = minU; x <= maxU; x++) {
            const w0 = ((v1 - v2) * (x - u2) + (u2 - u1) * (y - v2)) / denom;
            const w1 = ((v2 - v0) * (x - u2) + (u0 - u2) * (y - v2)) / denom;
            const w2 = 1.0 - w0 - w1;

            if (w0 >= -0.01 && w1 >= -0.01 && w2 >= -0.01) {
              const posX = w0 * x0 + w1 * x1 + w2 * x2;
              const posY = w0 * y0 + w1 * y1 + w2 * y2;

              let samp = null;
              if (isFront) {
                const projPX = cfg.centerPX + posX * cfg.scaleX;
                const projPY = cfg.centerPY - (posY - cfg.centerY) * cfg.scaleY;
                samp = samplePreview(projPX, projPY);
              } else {
                // Back mapping: posX mirrored, posY mapped to 512
                const backPX = 256 - posX * 1400;
                const backPY = 260 - (posY - cfg.centerY) * 1100;
                samp = sampleBack(backPX, backPY);
              }

              if (samp) {
                const aIdx = (y * W + x) * 4;
                const weight = Math.min(1.0, Math.pow(Math.abs(normZ), 1.3) * samp[3]);
                atlas[aIdx] = Math.round(atlas[aIdx] * (1 - weight) + samp[0] * weight);
                atlas[aIdx + 1] = Math.round(atlas[aIdx + 1] * (1 - weight) + samp[1] * weight);
                atlas[aIdx + 2] = Math.round(atlas[aIdx + 2] * (1 - weight) + samp[2] * weight);
              }
            }
          }
        }
      }

      ctx.putImageData(atlasImgData, 0, 0);
      return cvs.toDataURL('image/png');
    }, rawGlbName, previewName, nameStr, numStr, primaryCol, strokeCol, chestCfg);

    const b = Buffer.from(resultBase64.replace(/^data:image\/png;base64,/, ''), 'base64');
    fs.writeFileSync(`assets/characters/${athleteId}_refined_texture.png`, b);
    console.log(`✓ Saved refined texture for ${athleteId}`);
  }

  // 1. Hoops #23
  await bakeOne(
    'hoops23',
    'assets/characters/hoops23_raw_backup.glb',
    'assets/characters/hoops23_preview.png',
    'HOOPS', '23', '#f59e0b', '#070a12',
    { minZ: 0.03, minY: 0.14, maxY: 0.30, maxX: 0.11, centerPX: 360, centerPY: 350, centerY: 0.22, scaleX: 1050, scaleY: 800 }
  );

  // 2. Footy #10
  await bakeOne(
    'footy10',
    'assets/characters/footy10_raw_backup.glb',
    'assets/characters/footy10_preview.png',
    'FOOTY', '10', '#00e5ff', '#08172e',
    { minZ: 0.03, minY: 0.14, maxY: 0.30, maxX: 0.11, centerPX: 360, centerPY: 350, centerY: 0.22, scaleX: 1050, scaleY: 800 }
  );

  // 3. Keeper #1
  await bakeOne(
    'keeper1',
    'assets/characters/keeper1_raw_backup.glb',
    'assets/characters/keeper1_preview.png',
    'KEEPER', '1', '#10b981', '#061710',
    { minZ: 0.03, minY: 0.14, maxY: 0.30, maxX: 0.14, centerPX: 448, centerPY: 440, centerY: 0.22, scaleX: 1300, scaleY: 900 }
  );

  await browser.close();
  console.log('Master bake complete!');
}

masterBake().then(() => {
  require('./repack_glb_textures.cjs');
  console.log('All 3 GLBs repacked successfully with front and back uniform details!');
}).catch(console.error);
