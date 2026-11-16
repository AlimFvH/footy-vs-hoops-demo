const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const fs = require('fs');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

async function applyMasterFlawlessAthletes() {
  console.log('=== Master Flawless 3D Athletes — Precision Art Tuning ===');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:8099/index.html');

  async function processAthlete(cfg) {
    console.log(`\nPolishing ${cfg.id} (${cfg.name} #${cfg.num})...`);

    const resultBase64 = await page.evaluate(async (cfg) => {
      // 1. Fetch raw GLB
      const resp = await fetch(cfg.rawGlbUrl);
      const ab = await resp.arrayBuffer();
      const { gltf, bin } = window.GLBLoader.parseGLBContainer(ab);

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

      // Extract original base texture
      const imgDef = gltf.images[0];
      const bv = gltf.bufferViews[imgDef.bufferView];
      const baseBlob = new Blob([new Uint8Array(bin, bv.byteOffset || 0, bv.byteLength)], { type: 'image/png' });
      const baseImg = await new Promise(r => {
        const i = new Image();
        i.onload = () => r(i);
        i.src = URL.createObjectURL(baseBlob);
      });

      // 2. High-Definition 2048x2048 Canvas
      const W = 2048, H = 2048;
      const cvs = document.createElement('canvas');
      cvs.width = W; cvs.height = H;
      const ctx = cvs.getContext('2d');

      // Draw base texture upscaled smoothly
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(baseImg, 0, 0, W, H);

      // 3. Artistic Skin Shading & Face Detail Sharpening
      const atlasImgData = ctx.getImageData(0, 0, W, H);
      const data = atlasImgData.data;

      // Face UV mask
      const faceMask = new Uint8Array(W * H);
      for (let t = 0; t < indices.length; t += 3) {
        const i0 = indices[t], i1 = indices[t+1], i2 = indices[t+2];
        const cy = (pos[i0*3+1] + pos[i1*3+1] + pos[i2*3+1]) / 3;
        const cz = (pos[i0*3+2] + pos[i1*3+2] + pos[i2*3+2]) / 3;
        const cx = (pos[i0*3] + pos[i1*3] + pos[i2*3]) / 3;

        if (cy >= 0.31 && cy <= 0.50 && cz > 0.015 && Math.abs(cx) <= 0.08) {
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
                faceMask[y * W + x] = 1;
              }
            }
          }
        }
      }

      // Lift facial shadows and warm undertones
      for (let p = 0; p < W * H; p++) {
        if (!faceMask[p]) continue;
        const idx = p * 4;
        let r = data[idx], g = data[idx+1], b = data[idx+2];
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        const shadowLift = Math.max(0, 1.0 - (luma / 175.0));

        r = Math.min(255, r * (1.0 + shadowLift * cfg.faceShadowLift) + cfg.faceWarmth[0]);
        g = Math.min(255, g * (1.0 + shadowLift * (cfg.faceShadowLift * 0.88)) + cfg.faceWarmth[1]);
        b = Math.min(255, b * (1.0 + shadowLift * (cfg.faceShadowLift * 0.72)) + cfg.faceWarmth[2]);

        const newLuma = 0.299 * r + 0.587 * g + 0.114 * b;
        data[idx] = Math.round(Math.min(255, Math.max(0, newLuma + (r - newLuma) * 1.18)));
        data[idx+1] = Math.round(Math.min(255, Math.max(0, newLuma + (g - newLuma) * 1.18)));
        data[idx+2] = Math.round(Math.min(255, Math.max(0, newLuma + (b - newLuma) * 1.18)));
      }
      ctx.putImageData(atlasImgData, 0, 0);

      // 4. Front Jersey Canvas (with Clean Fabric Underlay)
      const fCvs = document.createElement('canvas');
      fCvs.width = 1024; fCvs.height = 1024;
      const fCtx = fCvs.getContext('2d');
      fCtx.clearRect(0, 0, 1024, 1024);

      // Clean jersey fabric base
      const chestGrad = fCtx.createRadialGradient(512, 530, 80, 512, 530, 480);
      chestGrad.addColorStop(0, cfg.cleanChestCol);
      chestGrad.addColorStop(0.75, cfg.cleanChestCol);
      chestGrad.addColorStop(1.0, cfg.cleanChestFade);
      fCtx.fillStyle = chestGrad;
      fCtx.fillRect(60, 140, 904, 780);

      // Athletic fabric texture (perforations)
      if (cfg.dots) {
        fCtx.fillStyle = 'rgba(255, 255, 255, 0.035)';
        for (let py = 160; py < 920; py += 10) {
          for (let px = (py % 20 === 0 ? 80 : 85); px < 940; px += 10) {
            fCtx.fillRect(px, py, 2.5, 2.5);
          }
        }
      }

      // Wordmark (HOOPS / FOOTY / KEEPER)
      fCtx.save();
      fCtx.textAlign = 'center';
      fCtx.textBaseline = 'middle';
      const wordmarkY = cfg.wordmarkY || 380;
      fCtx.font = '900 138px "Impact", "Arial Black", sans-serif';

      fCtx.lineWidth = 28;
      fCtx.strokeStyle = cfg.strokeCol;
      fCtx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      fCtx.shadowBlur = 16;
      fCtx.shadowOffsetY = 6;
      fCtx.strokeText(cfg.name, 512, wordmarkY);
      fCtx.shadowColor = 'transparent';

      const fGrad = fCtx.createLinearGradient(512, wordmarkY - 70, 512, wordmarkY + 70);
      fGrad.addColorStop(0, cfg.fillColTop);
      fGrad.addColorStop(1, cfg.fillColBot);
      fCtx.fillStyle = fGrad;
      fCtx.fillText(cfg.name, 512, wordmarkY);

      fCtx.lineWidth = 4.5;
      fCtx.strokeStyle = '#ffffff';
      fCtx.strokeText(cfg.name, 512, wordmarkY);
      fCtx.restore();

      // Huge Squad Number
      fCtx.save();
      fCtx.textAlign = 'center';
      fCtx.textBaseline = 'middle';
      const numY = cfg.numY || 700;
      const numSize = cfg.num.length === 1 ? 400 : 340;
      fCtx.font = `900 ${numSize}px "Impact", "Arial Black", sans-serif`;

      fCtx.lineWidth = 32;
      fCtx.strokeStyle = cfg.strokeCol;
      fCtx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      fCtx.shadowBlur = 20;
      fCtx.shadowOffsetY = 8;
      fCtx.strokeText(cfg.num, 512, numY);
      fCtx.shadowColor = 'transparent';

      const numGrad = fCtx.createLinearGradient(512, numY - 200, 512, numY + 200);
      numGrad.addColorStop(0, cfg.fillColTop);
      numGrad.addColorStop(1, cfg.fillColBot);
      fCtx.fillStyle = numGrad;
      fCtx.fillText(cfg.num, 512, numY);

      fCtx.lineWidth = 6;
      fCtx.strokeStyle = '#ffffff';
      fCtx.strokeText(cfg.num, 512, numY);
      fCtx.restore();

      // Official FVH Team Crest
      if (cfg.crest) {
        fCtx.save();
        fCtx.translate(285, 250);
        fCtx.fillStyle = '#f59e0b';
        fCtx.beginPath();
        fCtx.moveTo(-38, -38);
        fCtx.lineTo(38, -38);
        fCtx.lineTo(38, 10);
        fCtx.quadraticCurveTo(38, 50, 0, 68);
        fCtx.quadraticCurveTo(-38, 50, -38, 10);
        fCtx.closePath();
        fCtx.fill();
        fCtx.lineWidth = 5;
        fCtx.strokeStyle = '#08172e';
        fCtx.stroke();

        fCtx.fillStyle = '#ffffff';
        fCtx.beginPath();
        fCtx.arc(0, 10, 22, 0, Math.PI * 2);
        fCtx.fill();

        fCtx.fillStyle = '#08172e';
        fCtx.font = '900 20px "Impact", sans-serif';
        fCtx.textAlign = 'center';
        fCtx.textBaseline = 'middle';
        fCtx.fillText('FVH', 0, 10);
        fCtx.restore();
      }

      const fData = fCtx.getImageData(0, 0, 1024, 1024).data;
      function sampleFront(px, py) {
        if (px < 0 || px >= 1024 || py < 0 || py >= 1024) return null;
        const idx = (Math.floor(py) * 1024 + Math.floor(px)) * 4;
        const a = fData[idx + 3];
        if (a < 15) return null;
        return [fData[idx], fData[idx + 1], fData[idx + 2], a / 255];
      }

      // Back Jersey Canvas
      const bCvs = document.createElement('canvas');
      bCvs.width = 1024; bCvs.height = 1024;
      const bCtx = bCvs.getContext('2d');
      bCtx.clearRect(0, 0, 1024, 1024);

      const bChestGrad = bCtx.createRadialGradient(512, 530, 80, 512, 530, 480);
      bChestGrad.addColorStop(0, cfg.cleanChestCol);
      bChestGrad.addColorStop(0.75, cfg.cleanChestCol);
      bChestGrad.addColorStop(1.0, cfg.cleanChestFade);
      bCtx.fillStyle = bChestGrad;
      bCtx.fillRect(60, 140, 904, 780);

      bCtx.textAlign = 'center';
      bCtx.textBaseline = 'middle';

      const bNameY = cfg.bNameY || 290;
      bCtx.font = '900 120px "Impact", sans-serif';
      bCtx.lineWidth = 24;
      bCtx.strokeStyle = cfg.strokeCol;
      bCtx.strokeText(cfg.name, 512, bNameY);
      bCtx.fillStyle = '#ffffff';
      bCtx.fillText(cfg.name, 512, bNameY);

      const bNumY = cfg.bNumY || 660;
      bCtx.font = `900 ${cfg.num.length === 1 ? 480 : 400}px "Impact", sans-serif`;
      bCtx.lineWidth = 36;
      bCtx.strokeStyle = cfg.strokeCol;
      bCtx.strokeText(cfg.num, 512, bNumY);

      const bNumGrad = bCtx.createLinearGradient(512, bNumY - 200, 512, bNumY + 200);
      bNumGrad.addColorStop(0, cfg.fillColTop);
      bNumGrad.addColorStop(1, cfg.fillColBot);
      bCtx.fillStyle = bNumGrad;
      bCtx.fillText(cfg.num, 512, bNumY);

      bCtx.lineWidth = 6;
      bCtx.strokeStyle = '#ffffff';
      bCtx.strokeText(cfg.num, 512, bNumY);

      const bData = bCtx.getImageData(0, 0, 1024, 1024).data;
      function sampleBack(px, py) {
        if (px < 0 || px >= 1024 || py < 0 || py >= 1024) return null;
        const idx = (Math.floor(py) * 1024 + Math.floor(px)) * 4;
        const a = bData[idx + 3];
        if (a < 15) return null;
        return [bData[idx], bData[idx + 1], bData[idx + 2], a / 255];
      }

      // 5. Stylized Almond Eye Function (Natural, awake, focused athlete gaze)
      function sampleStylizedEye(x, y, z, nx, ny, nz) {
        if (nz < 0.25 || z < 0.04) return null;

        const eCfg = cfg.eye;
        const dL = Math.hypot((x - eCfg.lx) / (eCfg.w || 0.0078), (y - eCfg.ly) / (eCfg.h || 0.0034));
        const dR = Math.hypot((x - eCfg.rx) / (eCfg.w || 0.0078), (y - eCfg.ry) / (eCfg.h || 0.0034));

        if (dL > 1.05 && dR > 1.05) return null;

        const isLeft = (dL < dR);
        const r = isLeft ? dL : dR;
        const cx = isLeft ? eCfg.lx : eCfg.rx;
        const cy = isLeft ? eCfg.ly : eCfg.ry;
        const dx = x - cx;
        const dy = y - cy;

        // Smooth boundary blend
        const alpha = Math.max(0, Math.min(1.0, (1.05 - r) / 0.22));

        // Upper eyelid coverage shadow (gives focused sports expression)
        if (dy > 0.0014) {
          return [28, 18, 14, alpha * 0.95];
        }
        // Lower lid definition
        if (dy < -0.0024) {
          return [38, 24, 18, alpha * 0.75];
        }

        // Specular Catchlight (Upper left pinpoint)
        const dGlint = Math.hypot((dx + 0.0012) / 0.0010, (dy - 0.0007) / 0.0008);
        if (dGlint < 1.0) {
          return [255, 255, 255, alpha];
        }

        // Center Pupil
        const dPupil = Math.hypot(dx / 0.0018, dy / 0.0015);
        if (dPupil < 1.0) {
          return [14, 12, 18, alpha * 0.98];
        }

        // Colored Iris
        const dIris = Math.hypot(dx / 0.0038, dy / 0.0028);
        if (dIris < 1.0) {
          if (dIris > 0.80) {
            return [eCfg.irisLimbal[0], eCfg.irisLimbal[1], eCfg.irisLimbal[2], alpha * 0.95];
          }
          const t = Math.min(1.0, Math.max(0, (dIris - 0.25) / 0.55));
          const ir = Math.round(eCfg.irisCore[0] * (1 - t) + eCfg.irisOuter[0] * t);
          const ig = Math.round(eCfg.irisCore[1] * (1 - t) + eCfg.irisOuter[1] * t);
          const ib = Math.round(eCfg.irisCore[2] * (1 - t) + eCfg.irisOuter[2] * t);
          return [ir, ig, ib, alpha * 0.96];
        }

        // Sclera (Natural shaded off-white)
        const topShadow = Math.max(0, Math.min(1.0, (dy + 0.001) / 0.0030));
        const scR = Math.round(230 - topShadow * 35);
        const scG = Math.round(235 - topShadow * 35);
        const scB = Math.round(242 - topShadow * 30);
        return [scR, scG, scB, alpha * 0.88];
      }

      // 6. Seamless 3D Triangle Rasterization
      const curData = ctx.getImageData(0, 0, W, H);
      const curAtlas = curData.data;
      const updatedMask = new Uint8Array(W * H);

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
        const nLen = Math.hypot(nx, ny, nz) || 1;
        const normZ = nz / nLen;

        const isEyeArea = (cy >= 0.405 && cy <= 0.445 && cz > 0.04 && Math.abs(cx) <= 0.045);
        const isFrontJersey = (cz > 0.03 && normZ > 0.35 && cy >= 0.08 && cy <= 0.315 && Math.abs(cx) <= 0.12);
        const isBackJersey = (cz < -0.03 && normZ < -0.35 && cy >= 0.08 && cy <= 0.315 && Math.abs(cx) <= 0.12);

        if (!isEyeArea && !isFrontJersey && !isBackJersey) continue;

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
              const posZ = w0 * z0 + w1 * z1 + w2 * z2;

              let samp = null;
              if (isEyeArea) {
                samp = sampleStylizedEye(posX, posY, posZ, nx / nLen, ny / nLen, normZ);
              } else if (isFrontJersey) {
                const pX = 512 + (posX / 0.105) * 460;
                const pY = 512 - ((posY - 0.19) / 0.09) * 440;
                samp = sampleFront(pX, pY);
              } else if (isBackJersey) {
                const pX = 512 - (posX / 0.105) * 460;
                const pY = 512 - ((posY - 0.19) / 0.09) * 440;
                samp = sampleBack(pX, pY);
              }

              if (samp) {
                const aIdx = (y * W + x) * 4;
                const weight = Math.min(1.0, samp[3] * (isEyeArea ? 1.0 : Math.pow(Math.abs(normZ), 1.2)));
                curAtlas[aIdx] = Math.round(curAtlas[aIdx] * (1 - weight) + samp[0] * weight);
                curAtlas[aIdx + 1] = Math.round(curAtlas[aIdx + 1] * (1 - weight) + samp[1] * weight);
                curAtlas[aIdx + 2] = Math.round(curAtlas[aIdx + 2] * (1 - weight) + samp[2] * weight);
                updatedMask[y * W + x] = 1;
              }
            }
          }
        }
      }

      // 7. UV Padding / Dilation Pass (Wipe out seam bleeding)
      for (let iter = 0; iter < 2; iter++) {
        const nextMask = new Uint8Array(updatedMask);
        for (let y = 1; y < H - 1; y++) {
          for (let x = 1; x < W - 1; x++) {
            const p = y * W + x;
            if (updatedMask[p] === 0) {
              let neighbor = -1;
              if (updatedMask[p - 1] === 1) neighbor = p - 1;
              else if (updatedMask[p + 1] === 1) neighbor = p + 1;
              else if (updatedMask[p - W] === 1) neighbor = p - W;
              else if (updatedMask[p + W] === 1) neighbor = p + W;

              if (neighbor !== -1) {
                const srcIdx = neighbor * 4;
                const dstIdx = p * 4;
                curAtlas[dstIdx] = curAtlas[srcIdx];
                curAtlas[dstIdx + 1] = curAtlas[srcIdx + 1];
                curAtlas[dstIdx + 2] = curAtlas[srcIdx + 2];
                curAtlas[dstIdx + 3] = curAtlas[srcIdx + 3];
                nextMask[p] = 1;
              }
            }
          }
        }
        updatedMask.set(nextMask);
      }

      ctx.putImageData(curData, 0, 0);
      return cvs.toDataURL('image/png');
    }, cfg);

    const b = Buffer.from(resultBase64.replace(/^data:image\/png;base64,/, ''), 'base64');
    fs.writeFileSync(`assets/characters/${cfg.id}_refined_texture.png`, b);
    console.log(`✓ Saved flawless master texture for ${cfg.id} (${b.length} bytes)`);
  }

  // 1. HOOPS #23
  await processAthlete({
    id: 'hoops23',
    name: 'HOOPS',
    num: '23',
    rawGlbUrl: 'assets/characters/hoops23_raw_backup.glb',
    cleanChestCol: '#0e1014',
    cleanChestFade: 'rgba(14, 16, 20, 0)',
    dots: true,
    strokeCol: '#06080c',
    fillColTop: '#fde68a',
    fillColBot: '#d97706',
    wordmarkY: 380,
    numY: 700,
    bNameY: 310,
    bNumY: 670,
    crest: false,
    faceShadowLift: 0.65,
    faceWarmth: [26, 16, 8],
    eye: {
      lx: -0.025, ly: 0.419,
      rx: 0.023, ry: 0.419,
      w: 0.0068, h: 0.0029,
      irisCore: [251, 191, 36],
      irisOuter: [180, 83, 9],
      irisLimbal: [69, 26, 3]
    }
  });

  // 2. FOOTY #10
  await processAthlete({
    id: 'footy10',
    name: 'FOOTY',
    num: '10',
    rawGlbUrl: 'assets/characters/footy10_raw_backup.glb',
    cleanChestCol: '#0084c7',
    cleanChestFade: 'rgba(0, 132, 199, 0)',
    dots: false,
    strokeCol: '#08172e',
    fillColTop: '#ffffff',
    fillColBot: '#7dd3fc',
    wordmarkY: 380,
    numY: 700,
    bNameY: 300,
    bNumY: 660,
    crest: true,
    faceShadowLift: 0.50,
    faceWarmth: [18, 12, 10],
    eye: {
      lx: -0.026, ly: 0.424,
      rx: 0.009, ry: 0.424, // Symmetrical about Footy's head center (x = -0.009)!
      w: 0.0068, h: 0.0030,
      irisCore: [56, 189, 248],
      irisOuter: [2, 132, 199],
      irisLimbal: [12, 74, 110]
    }
  });

  // 3. KEEPER #1
  await processAthlete({
    id: 'keeper1',
    name: 'KEEPER',
    num: '1',
    rawGlbUrl: 'assets/characters/keeper1_raw_backup.glb',
    cleanChestCol: '#10b981',
    cleanChestFade: 'rgba(16, 185, 129, 0)',
    dots: false,
    strokeCol: '#051811',
    fillColTop: '#a7f3d0',
    fillColBot: '#059669',
    wordmarkY: 450, // Moved lower down to clear collar
    numY: 750,
    bNameY: 310,
    bNumY: 670,
    crest: false,
    faceShadowLift: 0.55,
    faceWarmth: [16, 12, 8],
    eye: {
      lx: -0.029, ly: 0.429,
      rx: 0.027, ry: 0.429,
      w: 0.0072, h: 0.0032,
      irisCore: [52, 211, 153],
      irisOuter: [5, 150, 105],
      irisLimbal: [2, 44, 34]
    }
  });

  await browser.close();
  console.log('\nMaster bake complete! Repacking GLBs...');
}

applyMasterFlawlessAthletes().then(() => {
  require('./repack_glb_textures.cjs');
  console.log('✓ All 3 GLBs successfully repacked with master textures!');
}).catch(console.error);
