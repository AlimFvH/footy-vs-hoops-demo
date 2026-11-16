const fs = require('fs');
const path = require('path');
const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

async function reprojectModel(glbPath, previewPngPath, outAtlasPath, charType) {
  console.log(`=== Reprojecting ${charType} from ${previewPngPath} into ${glbPath} ===`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:8099/index.html');

  const resultBase64 = await page.evaluate(async (glbUrl, previewUrl, cType) => {
    // 1. Fetch GLB and preview image
    const [glbResp, prevImg] = await Promise.all([
      fetch(glbUrl).then(r => r.arrayBuffer()),
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = previewUrl;
      })
    ]);

    const loader = window.GLBLoader;
    const { gltf, bin } = loader.parseGLBContainer(glbResp);

    function getAccessor(idx) {
      const acc = gltf.accessors[idx];
      const bv = gltf.bufferViews[acc.bufferView];
      const byteOffset = (bv.byteOffset || 0) + (acc.byteOffset || 0);
      if (acc.componentType === 5126) return new Float32Array(bin, byteOffset, acc.count * (acc.type === 'VEC3' ? 3 : acc.type === 'VEC2' ? 2 : 1));
      if (acc.componentType === 5125) return new Uint32Array(bin, byteOffset, acc.count);
      if (acc.componentType === 5123) return new Uint16Array(bin, byteOffset, acc.count);
    }

    const prim = gltf.meshes[0].primitives[0];
    const pos = getAccessor(prim.attributes.POSITION);
    const uvs = getAccessor(prim.attributes.TEXCOORD_0);
    const indices = getAccessor(prim.indices);

    // 2. Extract base texture from GLB
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

    // Get pixel buffer of target texture atlas
    const atlasImgData = ctx.getImageData(0, 0, W, H);
    const atlas = atlasImgData.data;

    // Get pixel buffer of preview concept art
    const prevCvs = document.createElement('canvas');
    prevCvs.width = prevImg.naturalWidth;
    prevCvs.height = prevImg.naturalHeight;
    const prevCtx = prevCvs.getContext('2d');
    prevCtx.drawImage(prevImg, 0, 0);
    const prevImgData = prevCtx.getImageData(0, 0, prevCvs.width, prevCvs.height);
    const prevPixels = prevImgData.data;
    const PW = prevCvs.width, PH = prevCvs.height;

    // Measure character bounding box in 2D preview
    let minPX = PW, maxPX = 0, minPY = PH, maxPY = 0;
    for (let py = 0; py < PH; py++) {
      for (let px = 0; px < PW; px++) {
        if (prevPixels[(py * PW + px) * 4 + 3] > 30) {
          if (px < minPX) minPX = px; if (px > maxPX) maxPX = px;
          if (py < minPY) minPY = py; if (py > maxPY) maxPY = py;
        }
      }
    }
    const centerPX = (minPX + maxPX) / 2;
    const halfWidthPX = (maxPX - minPX) / 2;
    const heightPX = (maxPY - minPY);

    // Measure 3D model extents
    let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    for (let i = 0; i < pos.length / 3; i++) {
      const x = pos[i*3], y = pos[i*3+1];
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
    const halfWidth3D = (maxX - minX) / 2;
    const height3D = (maxY - minY);

    // 3. Triangle Rasterizer: Project front concept onto UV atlas
    // Helper to sample preview concept art with bilinear filtering
    function samplePreview(px, py) {
      if (px < 0 || px >= PW - 1 || py < 0 || py >= PH - 1) return null;
      const x0 = Math.floor(px), y0 = Math.floor(py);
      const fx = px - x0, fy = py - y0;
      const idx00 = (y0 * PW + x0) * 4;
      const idx10 = (y0 * PW + x0 + 1) * 4;
      const idx01 = ((y0 + 1) * PW + x0) * 4;
      const idx11 = ((y0 + 1) * PW + x0 + 1) * 4;

      const a00 = prevPixels[idx00 + 3], a10 = prevPixels[idx10 + 3];
      const a01 = prevPixels[idx01 + 3], a11 = prevPixels[idx11 + 3];
      const a = (a00*(1-fx) + a10*fx)*(1-fy) + (a01*(1-fx) + a11*fx)*fy;
      if (a < 35) return null;

      const r = ((prevPixels[idx00]*(1-fx) + prevPixels[idx10]*fx)*(1-fy) + (prevPixels[idx01]*(1-fx) + prevPixels[idx11]*fx)*fy);
      const g = ((prevPixels[idx00+1]*(1-fx) + prevPixels[idx10+1]*fx)*(1-fy) + (prevPixels[idx01+1]*(1-fx) + prevPixels[idx11+1]*fx)*fy);
      const b = ((prevPixels[idx00+2]*(1-fx) + prevPixels[idx10+2]*fx)*(1-fy) + (prevPixels[idx01+2]*(1-fx) + prevPixels[idx11+2]*fx)*fy);
      return [r, g, b, a / 255];
    }

    let projectedTriangles = 0;

    for (let t = 0; t < indices.length; t += 3) {
      const i0 = indices[t], i1 = indices[t+1], i2 = indices[t+2];

      const x0 = pos[i0*3], y0 = pos[i0*3+1], z0 = pos[i0*3+2];
      const x1 = pos[i1*3], y1 = pos[i1*3+1], z1 = pos[i1*3+2];
      const x2 = pos[i2*3], y2 = pos[i2*3+1], z2 = pos[i2*3+2];

      // Calculate normal vector
      const ax = x1 - x0, ay = y1 - y0, az = z1 - z0;
      const bx = x2 - x0, by = y2 - y0, bz = z2 - z0;
      const nx = ay * bz - az * by;
      const ny = az * bx - ax * bz;
      const nz = ax * by - ay * bx;
      const len = Math.hypot(nx, ny, nz) || 1;
      const normZ = nz / len;

      // Only project onto front-facing polygons
      if (normZ < 0.12) continue;
      projectedTriangles++;

      const u0 = uvs[i0*2] * W, v0 = uvs[i0*2+1] * H;
      const u1 = uvs[i1*2] * W, v1 = uvs[i1*2+1] * H;
      const u2 = uvs[i2*2] * W, v2 = uvs[i2*2+1] * H;

      // Rasterize UV triangle in texture space
      const minU = Math.max(0, Math.floor(Math.min(u0, u1, u2)));
      const maxU = Math.min(W - 1, Math.ceil(Math.max(u0, u1, u2)));
      const minV = Math.max(0, Math.floor(Math.min(v0, v1, v2)));
      const maxV = Math.min(H - 1, Math.ceil(Math.max(v0, v1, v2)));

      const denom = (v1 - v2) * (u0 - u2) + (u2 - u1) * (v0 - v2);
      if (Math.abs(denom) < 1e-5) continue;

      // Weight factor based on normal: 1.0 when facing directly forward, fading to 0 at grazing angle
      const blendWeight = Math.min(1.0, Math.max(0.0, (normZ - 0.12) / 0.50));

      for (let y = minV; y <= maxV; y++) {
        for (let x = minU; x <= maxU; x++) {
          const w0 = ((v1 - v2) * (x - u2) + (u2 - u1) * (y - v2)) / denom;
          const w1 = ((v2 - v0) * (x - u2) + (u0 - u2) * (y - v2)) / denom;
          const w2 = 1.0 - w0 - w1;

          if (w0 >= -0.01 && w1 >= -0.01 && w2 >= -0.01) {
            // Interpolate 3D position
            const posX = w0 * x0 + w1 * x1 + w2 * x2;
            const posY = w0 * y0 + w1 * y1 + w2 * y2;

            // Project 3D (posX, posY) into preview concept image space
            const projPX = centerPX + (posX / halfWidth3D) * halfWidthPX;
            const projPY = maxPY - ((posY - minY) / height3D) * heightPX;

            const samp = samplePreview(projPX, projPY);
            if (samp) {
              const aIdx = (y * W + x) * 4;
              const w = blendWeight * samp[3];
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
      projectedTriangles,
      dataUrl: cvs.toDataURL('image/png')
    };
  }, glbPath, previewPngPath, charType);

  await browser.close();
  console.log(`✓ Processed ${resultBase64.projectedTriangles} front triangles for ${charType}`);

  // Save the baked image
  const base64Data = resultBase64.dataUrl.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync(outAtlasPath, Buffer.from(base64Data, 'base64'));
  console.log(`✓ Saved refined texture to ${outAtlasPath}`);
}

async function run() {
  await reprojectModel('assets/characters/hoops23.glb', 'assets/characters/hoops23_preview.png', 'assets/characters/hoops23_refined_texture.png', 'hoops');
  await reprojectModel('assets/characters/footy10.glb', 'assets/characters/footy10_preview.png', 'assets/characters/footy10_refined_texture.png', 'footy');
  await reprojectModel('assets/characters/keeper1.glb', 'assets/characters/keeper1_preview.png', 'assets/characters/keeper1_refined_texture.png', 'keeper');
}

run().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
