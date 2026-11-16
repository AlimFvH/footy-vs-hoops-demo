const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

async function bakeCharacter(charType) {
  console.log(`=== Baking Precision HD Face & Uniform for ${charType} ===`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:8099/index.html');

  const resultBase64 = await page.evaluate(async (cType) => {
    const glbUrl = `assets/characters/${cType === 'footy' ? 'footy10' : (cType === 'hoops' ? 'hoops23' : 'keeper1')}_raw_backup.glb`;
    const cropFaceUrl = `assets/characters/${cType === 'footy' ? 'footy10' : (cType === 'hoops' ? 'hoops23' : 'keeper1')}_preview.png`;

    const [glbResp, prevImg] = await Promise.all([
      fetch(glbUrl).then(r => r.arrayBuffer()),
      new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = rej;
        img.src = cropFaceUrl;
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

    // 1. Extract base texture from raw backup GLB
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

    const atlasImgData = ctx.getImageData(0, 0, W, H);
    const atlas = atlasImgData.data;

    // 2. Prepare Preview Concept Image
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
      if (a < 30) return null;
      const r = (pData[i00]*(1-fx) + pData[i10]*fx)*(1-fy) + (pData[i01]*(1-fx) + pData[i11]*fx)*fy;
      const g = (pData[i00+1]*(1-fx) + pData[i10+1]*fx)*(1-fy) + (pData[i01+1]*(1-fx) + pData[i11+1]*fx)*fy;
      const b = (pData[i00+2]*(1-fx) + pData[i10+2]*fx)*(1-fy) + (pData[i01+2]*(1-fx) + pData[i11+2]*fx)*fy;
      return [r, g, b, a / 255];
    }

    // 3. Precision Landmark Coordinates
    const config = {
      hoops: {
        // 3D Head: Chin at 0.340, top of hair at 0.501, nose at 0.396
        faceY0: 0.340, faceY1: 0.501,
        faceX0: -0.052, faceX1: 0.052,
        // 2D Preview (720x960): Hair top at 75, Chin at 245, Cheeks at 275..445
        px0: 275, px1: 445,
        py0: 75, py1: 245,

        // 3D Chest:
        chestY0: 0.120, chestY1: 0.330,
        chestX0: -0.125, chestX1: 0.125,
        cpx0: 240, cpx1: 480,
        cpy0: 270, cpy1: 430
      },
      footy: {
        // 3D Head: Chin at 0.348, top of hair at 0.500, nose at 0.401
        faceY0: 0.348, faceY1: 0.500,
        faceX0: -0.050, faceX1: 0.050,
        // 2D Preview (720x960): Hair top at 75, Chin at 240, Cheeks at 275..445
        px0: 275, px1: 445,
        py0: 75, py1: 240,

        chestY0: 0.120, chestY1: 0.330,
        chestX0: -0.120, chestX1: 0.120,
        cpx0: 240, cpx1: 480,
        cpy0: 270, cpy1: 430
      },
      keeper: {
        // 3D Head: Chin at 0.342, top of hair at 0.500, nose at 0.411
        faceY0: 0.342, faceY1: 0.500,
        faceX0: -0.065, faceX1: 0.065,
        // 2D Preview (896x1200): Hair top at 70, Chin at 230, Cheeks at 345..550
        px0: 345, px1: 550,
        py0: 70, py1: 230,

        chestY0: 0.120, chestY1: 0.330,
        chestX0: -0.150, chestX1: 0.150,
        cpx0: 290, cpx1: 605,
        cpy0: 280, cpy1: 460
      }
    }[cType];

    let faceTris = 0, chestTris = 0;

    for (let t = 0; t < indices.length; t += 3) {
      const i0 = indices[t], i1 = indices[t+1], i2 = indices[t+2];
      const x0 = pos[i0*3], y0 = pos[i0*3+1], z0 = pos[i0*3+2];
      const x1 = pos[i1*3], y1 = pos[i1*3+1], z1 = pos[i1*3+2];
      const x2 = pos[i2*3], y2 = pos[i2*3+1], z2 = pos[i2*3+2];

      // Normal vector
      const ax = x1 - x0, ay = y1 - y0, az = z1 - z0;
      const bx = x2 - x0, by = y2 - y0, bz = z2 - z0;
      const nx = ay * bz - az * by;
      const ny = az * bx - ax * bz;
      const nz = ax * by - ay * bx;
      const len = Math.hypot(nx, ny, nz) || 1;
      const normZ = nz / len;

      if (normZ < 0.18) continue; // Skip grazing side/back angles

      const cy = (y0 + y1 + y2) / 3;
      const cx = (x0 + x1 + x2) / 3;
      const cz = (z0 + z1 + z2) / 3;

      let isFace = false, isChest = false;

      if (cy >= config.faceY0 && cy <= config.faceY1 && cz > 0.015) {
        // Elliptical head radius check for smooth seamless fade
        const radX = (config.faceX1 - config.faceX0) / 2;
        if (Math.abs(cx) <= radX * 1.15) {
          isFace = true;
          faceTris++;
        }
      } else if (cy >= config.chestY0 && cy <= config.chestY1 && cz > 0.02) {
        const radX = (config.chestX1 - config.chestX0) / 2;
        if (Math.abs(cx) <= radX * 1.15) {
          isChest = true;
          chestTris++;
        }
      }

      if (!isFace && !isChest) continue;

      // Project onto UV triangle
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

            let projPX, projPY, radFalloff = 1.0;
            if (isFace) {
              const uRatio = (posX - config.faceX0) / (config.faceX1 - config.faceX0);
              const vRatio = 1.0 - (posY - config.faceY0) / (config.faceY1 - config.faceY0);
              projPX = config.px0 + uRatio * (config.px1 - config.px0);
              projPY = config.py0 + vRatio * (config.py1 - config.py0);

              // Radial falloff towards edges of face for zero seams
              const dX = (uRatio - 0.5) * 2;
              const dY = (vRatio - 0.5) * 2;
              const dist = Math.hypot(dX, dY);
              radFalloff = Math.max(0, Math.min(1.0, 1.4 - dist * 0.9));
            } else {
              const uRatio = (posX - config.chestX0) / (config.chestX1 - config.chestX0);
              const vRatio = 1.0 - (posY - config.chestY0) / (config.chestY1 - config.chestY0);
              projPX = config.cpx0 + uRatio * (config.cpx1 - config.cpx0);
              projPY = config.cpy0 + vRatio * (config.cpy1 - config.cpy0);

              const dX = (uRatio - 0.5) * 2;
              radFalloff = Math.max(0, Math.min(1.0, 1.4 - Math.abs(dX) * 0.8));
            }

            const samp = samplePreview(projPX, projPY);
            if (samp) {
              const aIdx = (y * W + x) * 4;
              const angleWeight = Math.pow(Math.max(0, (normZ - 0.18) / 0.82), 1.2);
              const w = Math.min(1.0, angleWeight * radFalloff * samp[3]);
              atlas[aIdx] = Math.round(atlas[aIdx] * (1 - w) + samp[0] * w);
              atlas[aIdx + 1] = Math.round(atlas[aIdx + 1] * (1 - w) + samp[1] * w);
              atlas[aIdx + 2] = Math.round(atlas[aIdx + 2] * (1 - w) + samp[2] * w);
            }
          }
        }
      }
    }

    ctx.putImageData(atlasImgData, 0, 0);
    return {
      faceTris,
      chestTris,
      dataUrl: cvs.toDataURL('image/png')
    };
  }, charType);

  await browser.close();
  console.log(`✓ Processed ${resultBase64.faceTris} face triangles and ${resultBase64.chestTris} chest triangles for ${charType}`);

  const outAtlasPath = `assets/characters/${charType === 'footy' ? 'footy10' : (charType === 'hoops' ? 'hoops23' : 'keeper1')}_refined_texture.png`;
  const base64Data = resultBase64.dataUrl.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync(outAtlasPath, Buffer.from(base64Data, 'base64'));
  console.log(`✓ Saved refined texture to ${outAtlasPath}`);
}

async function run() {
  for (const c of ['hoops', 'footy', 'keeper']) {
    await bakeCharacter(c);
  }
}

run().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
