const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const fs = require('fs');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

async function testCleanFace() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:8099/index.html');

  const resultBase64 = await page.evaluate(async () => {
    const glbUrl = 'assets/characters/hoops23_raw_backup.glb';
    const previewUrl = 'assets/characters/hoops23_preview.png';

    const [glbResp, prevImg] = await Promise.all([
      fetch(glbUrl).then(r => r.arrayBuffer()),
      new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = rej;
        img.src = previewUrl;
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

    // Extract base texture
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

    // Only project the chest "HOOPS 23"
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

    const atlasImgData = ctx.getImageData(0, 0, W, H);
    const atlas = atlasImgData.data;

    // Chest: y between 0.14 and 0.30, z > 0.03, |x| < 0.12
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

      if (cz <= 0.03 || normZ <= 0.25 || cy < 0.14 || cy > 0.30 || Math.abs(cx) > 0.11) continue;

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

            const projPX = 360 + posX * 1050;
            const projPY = 350 - (posY - 0.22) * 800;

            const samp = samplePreview(projPX, projPY);
            if (samp) {
              const aIdx = (y * W + x) * 4;
              const w = Math.min(1.0, Math.pow(normZ, 1.5) * samp[3]);
              atlas[aIdx] = Math.round(atlas[aIdx] * (1 - w) + samp[0] * w);
              atlas[aIdx + 1] = Math.round(atlas[aIdx + 1] * (1 - w) + samp[1] * w);
              atlas[aIdx + 2] = Math.round(atlas[aIdx + 2] * (1 - w) + samp[2] * w);
            }
          }
        }
      }
    }

    ctx.putImageData(atlasImgData, 0, 0);
    return cvs.toDataURL('image/png');
  });

  await browser.close();
  const b = Buffer.from(resultBase64.replace(/^data:image\/png;base64,/, ''), 'base64');
  fs.writeFileSync('assets/characters/hoops23_refined_texture.png', b);
  console.log('Saved clean face + baked uniform texture for Hoops!');
}

testCleanFace().then(() => {
  require('./repack_glb_textures.cjs');
}).catch(console.error);
