const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const fs = require('fs');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

async function bakeFlawlessAthletes() {
  console.log('=== Flawless Athlete Master Baker (Organic HD Face + Crisp Varsity Uniforms) ===');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:8099/index.html');

  async function processOne(cfg) {
    console.log(`\nPolishing ${cfg.id}...`);

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
      // Read atlas pixels to apply photographic grading:
      // - Lift shadows (gamma curve + shadow lift)
      // - Increase warm vibrance
      // - Sharpen high-contrast details (eyes, facial hair)
      const atlasImgData = ctx.getImageData(0, 0, W, H);
      const data = atlasImgData.data;

      // First, find all UV pixels that belong to the face
      // We create a boolean mask for face UV pixels
      const faceMask = new Uint8Array(W * H);
      for (let t = 0; t < indices.length; t += 3) {
        const i0 = indices[t], i1 = indices[t+1], i2 = indices[t+2];
        const cy = (pos[i0*3+1] + pos[i1*3+1] + pos[i2*3+1]) / 3;
        const cz = (pos[i0*3+2] + pos[i1*3+2] + pos[i2*3+2]) / 3;
        const cx = (pos[i0*3] + pos[i1*3] + pos[i2*3]) / 3;

        // Face condition: top of character, frontwards
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

      // Apply warm luminance lift and vibrance to face pixels
      for (let p = 0; p < W * H; p++) {
        const idx = p * 4;
        let r = data[idx];
        let g = data[idx+1];
        let b = data[idx+2];

        if (faceMask[p]) {
          // Face grading: lift dark shadows, add golden warm undertones, increase contrast
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          // Shadow lift factor: stronger on darker areas
          const shadowLift = Math.max(0, 1.0 - (luma / 180.0));
          
          r = Math.min(255, r * (1.0 + shadowLift * cfg.faceShadowLift) + cfg.faceWarmth[0]);
          g = Math.min(255, g * (1.0 + shadowLift * (cfg.faceShadowLift * 0.9)) + cfg.faceWarmth[1]);
          b = Math.min(255, b * (1.0 + shadowLift * (cfg.faceShadowLift * 0.75)) + cfg.faceWarmth[2]);

          // Slight saturation boost
          const newLuma = 0.299 * r + 0.587 * g + 0.114 * b;
          r = Math.min(255, Math.max(0, newLuma + (r - newLuma) * 1.15));
          g = Math.min(255, Math.max(0, newLuma + (g - newLuma) * 1.15));
          b = Math.min(255, Math.max(0, newLuma + (b - newLuma) * 1.15));
        }

        data[idx] = Math.round(r);
        data[idx+1] = Math.round(g);
        data[idx+2] = Math.round(b);
      }
      ctx.putImageData(atlasImgData, 0, 0);

      // 4. Clean Vector Jersey Graphics (Front & Back)
      // Front Chest Vector Art (Transparent Canvas)
      const fCvs = document.createElement('canvas');
      fCvs.width = 1024; fCvs.height = 1024;
      const fCtx = fCvs.getContext('2d');
      fCtx.clearRect(0, 0, 1024, 1024);

      // Wordmark (HOOPS / FOOTY / KEEPER)
      fCtx.save();
      fCtx.textAlign = 'center';
      fCtx.textBaseline = 'middle';
      fCtx.font = '900 135px "Impact", "Arial Black", sans-serif';

      // Thick black/navy outer stroke
      fCtx.lineWidth = 26;
      fCtx.strokeStyle = cfg.strokeCol;
      fCtx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      fCtx.shadowBlur = 14;
      fCtx.shadowOffsetY = 6;
      fCtx.strokeText(cfg.name, 512, 380);
      fCtx.shadowColor = 'transparent';

      // Gradient Fill
      const fGrad = fCtx.createLinearGradient(512, 310, 512, 450);
      fGrad.addColorStop(0, cfg.fillColTop);
      fGrad.addColorStop(1, cfg.fillColBot);
      fCtx.fillStyle = fGrad;
      fCtx.fillText(cfg.name, 512, 380);

      // Clean white inner highlight stroke
      fCtx.lineWidth = 4;
      fCtx.strokeStyle = '#ffffff';
      fCtx.strokeText(cfg.name, 512, 380);
      fCtx.restore();

      // Huge Squad Number
      fCtx.save();
      fCtx.textAlign = 'center';
      fCtx.textBaseline = 'middle';
      const numSize = cfg.num.length === 1 ? 400 : 340;
      fCtx.font = `900 ${numSize}px "Impact", "Arial Black", sans-serif`;

      fCtx.lineWidth = 32;
      fCtx.strokeStyle = cfg.strokeCol;
      fCtx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      fCtx.shadowBlur = 18;
      fCtx.shadowOffsetY = 8;
      fCtx.strokeText(cfg.num, 512, 700);
      fCtx.shadowColor = 'transparent';

      const numGrad = fCtx.createLinearGradient(512, 500, 512, 900);
      numGrad.addColorStop(0, cfg.fillColTop);
      numGrad.addColorStop(1, cfg.fillColBot);
      fCtx.fillStyle = numGrad;
      fCtx.fillText(cfg.num, 512, 700);

      fCtx.lineWidth = 6;
      fCtx.strokeStyle = '#ffffff';
      fCtx.strokeText(cfg.num, 512, 700);
      fCtx.restore();

      // Team crest if Footy
      if (cfg.crest) {
        fCtx.save();
        fCtx.translate(290, 260);
        // Golden shield
        fCtx.fillStyle = '#f59e0b';
        fCtx.beginPath();
        fCtx.moveTo(-36, -36);
        fCtx.lineTo(36, -36);
        fCtx.lineTo(36, 8);
        fCtx.quadraticCurveTo(36, 48, 0, 64);
        fCtx.quadraticCurveTo(-36, 48, -36, 8);
        fCtx.closePath();
        fCtx.fill();
        fCtx.lineWidth = 5;
        fCtx.strokeStyle = '#08172e';
        fCtx.stroke();
        // Inner white circle
        fCtx.fillStyle = '#ffffff';
        fCtx.beginPath();
        fCtx.arc(0, 8, 20, 0, Math.PI * 2);
        fCtx.fill();
        fCtx.fillStyle = '#08172e';
        fCtx.font = '900 18px "Impact", sans-serif';
        fCtx.textAlign = 'center';
        fCtx.textBaseline = 'middle';
        fCtx.fillText('FVH', 0, 8);
        fCtx.restore();
      }

      const fData = fCtx.getImageData(0, 0, 1024, 1024).data;
      function sampleFront(px, py) {
        if (px < 0 || px >= 1024 || py < 0 || py >= 1024) return null;
        const idx = (Math.floor(py) * 1024 + Math.floor(px)) * 4;
        const a = fData[idx + 3];
        if (a < 20) return null;
        return [fData[idx], fData[idx + 1], fData[idx + 2], a / 255];
      }

      // Back Jersey Vector Art (Transparent Canvas)
      const bCvs = document.createElement('canvas');
      bCvs.width = 1024; bCvs.height = 1024;
      const bCtx = bCvs.getContext('2d');
      bCtx.clearRect(0, 0, 1024, 1024);

      bCtx.textAlign = 'center';
      bCtx.textBaseline = 'middle';

      // Player surname
      bCtx.font = '900 115px "Impact", sans-serif';
      bCtx.lineWidth = 24;
      bCtx.strokeStyle = cfg.strokeCol;
      bCtx.strokeText(cfg.name, 512, 280);
      bCtx.fillStyle = '#ffffff';
      bCtx.fillText(cfg.name, 512, 280);

      // Squad Number
      bCtx.font = `900 ${cfg.num.length === 1 ? 480 : 400}px "Impact", sans-serif`;
      bCtx.lineWidth = 36;
      bCtx.strokeStyle = cfg.strokeCol;
      bCtx.strokeText(cfg.num, 512, 650);

      const bNumGrad = bCtx.createLinearGradient(512, 450, 512, 850);
      bNumGrad.addColorStop(0, cfg.fillColTop);
      bNumGrad.addColorStop(1, cfg.fillColBot);
      bCtx.fillStyle = bNumGrad;
      bCtx.fillText(cfg.num, 512, 650);

      bCtx.lineWidth = 6;
      bCtx.strokeStyle = '#ffffff';
      bCtx.strokeText(cfg.num, 512, 650);

      const bData = bCtx.getImageData(0, 0, 1024, 1024).data;
      function sampleBack(px, py) {
        if (px < 0 || px >= 1024 || py < 0 || py >= 1024) return null;
        const idx = (Math.floor(py) * 1024 + Math.floor(px)) * 4;
        const a = bData[idx + 3];
        if (a < 20) return null;
        return [bData[idx], bData[idx + 1], bData[idx + 2], a / 255];
      }

      // 5. Seamless 3D Triangle Rasterization for Jersey Graphics
      const curData = ctx.getImageData(0, 0, W, H);
      const curAtlas = curData.data;

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

        const isFrontJersey = (cz > 0.03 && normZ > 0.35 && cy >= 0.10 && cy <= 0.28 && Math.abs(cx) <= 0.11);
        const isBackJersey = (cz < -0.03 && normZ < -0.35 && cy >= 0.10 && cy <= 0.28 && Math.abs(cx) <= 0.11);

        if (!isFrontJersey && !isBackJersey) continue;

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
              if (isFrontJersey) {
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
                const weight = Math.min(1.0, samp[3] * Math.pow(Math.abs(normZ), 1.2));
                curAtlas[aIdx] = Math.round(curAtlas[aIdx] * (1 - weight) + samp[0] * weight);
                curAtlas[aIdx + 1] = Math.round(curAtlas[aIdx + 1] * (1 - weight) + samp[1] * weight);
                curAtlas[aIdx + 2] = Math.round(curAtlas[aIdx + 2] * (1 - weight) + samp[2] * weight);
              }
            }
          }
        }
      }

      ctx.putImageData(curData, 0, 0);

      // 6. Add delicate eye catchlights (bright glints) in 3D
      // We find the exact eye pupils and add crisp specular sparkles
      // Eyeballs: Y between 0.415 and 0.435, Z > 0.05
      // Left eye glint: X ≈ -0.026, Y ≈ 0.424
      // Right eye glint: X ≈ +0.024, Y ≈ 0.424
      const eyeGlints = [
        { x: cfg.eyeGlintL[0], y: cfg.eyeGlintL[1], z: cfg.eyeGlintL[2] },
        { x: cfg.eyeGlintR[0], y: cfg.eyeGlintR[1], z: cfg.eyeGlintR[2] }
      ];

      for (let t = 0; t < indices.length; t += 3) {
        const i0 = indices[t], i1 = indices[t+1], i2 = indices[t+2];
        const cy = (pos[i0*3+1] + pos[i1*3+1] + pos[i2*3+1]) / 3;
        const cz = (pos[i0*3+2] + pos[i1*3+2] + pos[i2*3+2]) / 3;
        const cx = (pos[i0*3] + pos[i1*3] + pos[i2*3]) / 3;

        if (cy >= 0.41 && cy <= 0.44 && cz > 0.05 && Math.abs(cx) <= 0.04) {
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
                const posX = w0 * pos[i0*3] + w1 * pos[i1*3] + w2 * pos[i2*3];
                const posY = w0 * pos[i0*3+1] + w1 * pos[i1*3+1] + w2 * pos[i2*3+1];

                for (const g of eyeGlints) {
                  const d = Math.hypot((posX - g.x) * 1.0, (posY - g.y) * 1.3);
                  if (d < 0.0022) {
                    const aIdx = (y * W + x) * 4;
                    const intensity = Math.pow(1.0 - (d / 0.0022), 1.5);
                    curAtlas[aIdx] = Math.round(curAtlas[aIdx] * (1 - intensity) + 255 * intensity);
                    curAtlas[aIdx+1] = Math.round(curAtlas[aIdx+1] * (1 - intensity) + 255 * intensity);
                    curAtlas[aIdx+2] = Math.round(curAtlas[aIdx+2] * (1 - intensity) + 255 * intensity);
                  }
                }
              }
            }
          }
        }
      }

      ctx.putImageData(curData, 0, 0);
      return cvs.toDataURL('image/png');
    }, cfg);

    const b = Buffer.from(resultBase64.replace(/^data:image\/png;base64,/, ''), 'base64');
    fs.writeFileSync(`assets/characters/${cfg.id}_refined_texture.png`, b);
    console.log(`✓ Saved flawless 2048x2048 texture for ${cfg.id} (${b.length} bytes)`);
  }

  // 1. HOOPS #23
  await processOne({
    id: 'hoops23',
    name: 'HOOPS',
    num: '23',
    rawGlbUrl: 'assets/characters/hoops23_raw_backup.glb',
    strokeCol: '#070a10',
    fillColTop: '#fde68a',
    fillColBot: '#d97706',
    crest: false,
    faceShadowLift: 0.65,
    faceWarmth: [26, 16, 8],
    eyeGlintL: [-0.026, 0.422, 0.076],
    eyeGlintR: [0.024, 0.422, 0.077]
  });

  // 2. FOOTY #10
  await processOne({
    id: 'footy10',
    name: 'FOOTY',
    num: '10',
    rawGlbUrl: 'assets/characters/footy10_raw_backup.glb',
    strokeCol: '#08172e',
    fillColTop: '#ffffff',
    fillColBot: '#7dd3fc',
    crest: true,
    faceShadowLift: 0.50,
    faceWarmth: [18, 12, 10],
    eyeGlintL: [-0.026, 0.425, 0.070],
    eyeGlintR: [0.024, 0.425, 0.070]
  });

  // 3. KEEPER #1
  await processOne({
    id: 'keeper1',
    name: 'KEEPER',
    num: '1',
    rawGlbUrl: 'assets/characters/keeper1_raw_backup.glb',
    strokeCol: '#051811',
    fillColTop: '#a7f3d0',
    fillColBot: '#059669',
    crest: false,
    faceShadowLift: 0.55,
    faceWarmth: [16, 12, 8],
    eyeGlintL: [-0.029, 0.430, 0.095],
    eyeGlintR: [0.026, 0.430, 0.095]
  });

  await browser.close();
  console.log('All 3 flawless textures completed!');
}

bakeFlawlessAthletes().catch(console.error);
