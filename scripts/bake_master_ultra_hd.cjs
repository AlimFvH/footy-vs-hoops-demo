const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

async function bakeMasterUltraHD() {
  console.log('=== Ultra-HD 2048x2048 Master Character Baker ===');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:8099/index.html');

  async function processAthlete(cfg) {
    console.log(`\n--- Processing ${cfg.id} (${cfg.name} #${cfg.num}) ---`);

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

      // 3. Prepare Front Jersey Vector Art (1024x1024)
      const fCvs = document.createElement('canvas');
      fCvs.width = 1024; fCvs.height = 1024;
      const fCtx = fCvs.getContext('2d');

      // Athletic fabric mesh background pattern
      if (cfg.jerseyPattern === 'dots') {
        fCtx.fillStyle = cfg.baseJerseyCol;
        fCtx.fillRect(0, 0, 1024, 1024);
        fCtx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        for (let py = 0; py < 1024; py += 8) {
          for (let px = (py % 16 === 0 ? 0 : 4); px < 1024; px += 8) {
            fCtx.fillRect(px, py, 2, 2);
          }
        }
      } else if (cfg.jerseyPattern === 'hex') {
        // Hexagonal keeper armor padding
        fCtx.fillStyle = cfg.baseJerseyCol;
        fCtx.fillRect(0, 0, 1024, 1024);
        fCtx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
        fCtx.lineWidth = 3;
        const hexR = 24;
        const hH = hexR * Math.sqrt(3);
        for (let y = 0; y < 1024 + hH; y += hH) {
          for (let x = 0; x < 1024 + hexR * 3; x += hexR * 3) {
            function drawHex(hx, hy) {
              fCtx.beginPath();
              for (let a = 0; a < 6; a++) {
                const ang = (a * 60) * Math.PI / 180;
                const px = hx + hexR * Math.cos(ang);
                const py = hy + hexR * Math.sin(ang);
                if (a === 0) fCtx.moveTo(px, py); else fCtx.lineTo(px, py);
              }
              fCtx.closePath();
              fCtx.stroke();
            }
            drawHex(x, y);
            drawHex(x + hexR * 1.5, y + hH * 0.5);
          }
        }
      } else if (cfg.jerseyPattern === 'cyber') {
        // Footy modern geometric gradient
        const grad = fCtx.createLinearGradient(0, 0, 1024, 1024);
        grad.addColorStop(0, '#00b4d8');
        grad.addColorStop(0.5, '#0077b6');
        grad.addColorStop(1, '#023e8a');
        fCtx.fillStyle = grad;
        fCtx.fillRect(0, 0, 1024, 1024);
      }

      // V-Neck / Collar Piping at top of jersey
      fCtx.lineWidth = 18;
      fCtx.strokeStyle = cfg.trimCol;
      fCtx.beginPath();
      fCtx.moveTo(280, 40);
      fCtx.lineTo(512, 190);
      fCtx.lineTo(744, 40);
      fCtx.stroke();

      fCtx.lineWidth = 6;
      fCtx.strokeStyle = '#ffffff';
      fCtx.beginPath();
      fCtx.moveTo(280, 40);
      fCtx.lineTo(512, 190);
      fCtx.lineTo(744, 40);
      fCtx.stroke();

      // Team / Crest badge if footy
      if (cfg.crest) {
        fCtx.save();
        fCtx.translate(320, 310);
        // Golden Shield
        fCtx.fillStyle = '#f59e0b';
        fCtx.beginPath();
        fCtx.moveTo(-45, -45);
        fCtx.lineTo(45, -45);
        fCtx.lineTo(45, 10);
        fCtx.quadraticCurveTo(45, 55, 0, 75);
        fCtx.quadraticCurveTo(-45, 55, -45, 10);
        fCtx.closePath();
        fCtx.fill();
        fCtx.lineWidth = 6;
        fCtx.strokeStyle = '#08172e';
        fCtx.stroke();
        // Inner ball
        fCtx.fillStyle = '#ffffff';
        fCtx.beginPath();
        fCtx.arc(0, 10, 26, 0, Math.PI * 2);
        fCtx.fill();
        fCtx.fillStyle = '#08172e';
        fCtx.font = '900 24px "Impact", sans-serif';
        fCtx.textAlign = 'center';
        fCtx.textBaseline = 'middle';
        fCtx.fillText('FVH', 0, 10);
        fCtx.restore();
      }

      // Arched Wordmark ("HOOPS", "FOOTY", "TITAN")
      fCtx.save();
      fCtx.textAlign = 'center';
      fCtx.textBaseline = 'middle';
      fCtx.font = '900 130px "Impact", "Arial Black", sans-serif';

      // Drop shadow & heavy stroke
      fCtx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      fCtx.shadowBlur = 12;
      fCtx.shadowOffsetY = 8;
      fCtx.lineWidth = 26;
      fCtx.strokeStyle = cfg.strokeCol;
      fCtx.strokeText(cfg.name, 512, 420);
      fCtx.shadowColor = 'transparent';

      // Inner Fill Gradient
      const textGrad = fCtx.createLinearGradient(512, 350, 512, 490);
      textGrad.addColorStop(0, cfg.fillColTop);
      textGrad.addColorStop(1, cfg.fillColBot);
      fCtx.fillStyle = textGrad;
      fCtx.fillText(cfg.name, 512, 420);

      // White inner pinstripe
      fCtx.lineWidth = 4;
      fCtx.strokeStyle = '#ffffff';
      fCtx.strokeText(cfg.name, 512, 420);
      fCtx.restore();

      // Huge Squad Number ("23", "10", "1")
      fCtx.save();
      fCtx.textAlign = 'center';
      fCtx.textBaseline = 'middle';
      const numFontSize = cfg.num.length === 1 ? 380 : 320;
      fCtx.font = `900 ${numFontSize}px "Impact", "Arial Black", sans-serif`;

      fCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      fCtx.shadowBlur = 16;
      fCtx.shadowOffsetY = 10;
      fCtx.lineWidth = 32;
      fCtx.strokeStyle = cfg.strokeCol;
      fCtx.strokeText(cfg.num, 512, 730);
      fCtx.shadowColor = 'transparent';

      const numGrad = fCtx.createLinearGradient(512, 540, 512, 900);
      numGrad.addColorStop(0, cfg.fillColTop);
      numGrad.addColorStop(1, cfg.fillColBot);
      fCtx.fillStyle = numGrad;
      fCtx.fillText(cfg.num, 512, 730);

      fCtx.lineWidth = 6;
      fCtx.strokeStyle = '#ffffff';
      fCtx.strokeText(cfg.num, 512, 730);
      fCtx.restore();

      const fData = fCtx.getImageData(0, 0, 1024, 1024).data;
      function sampleFront(px, py) {
        if (px < 0 || px >= 1024 || py < 0 || py >= 1024) return null;
        const idx = (Math.floor(py) * 1024 + Math.floor(px)) * 4;
        const a = fData[idx + 3];
        if (a < 30) return null;
        return [fData[idx], fData[idx + 1], fData[idx + 2], a / 255];
      }

      // 4. Prepare Back Jersey Vector Art (1024x1024)
      const bCvs = document.createElement('canvas');
      bCvs.width = 1024; bCvs.height = 1024;
      const bCtx = bCvs.getContext('2d');

      bCtx.textAlign = 'center';
      bCtx.textBaseline = 'middle';

      // Player surname
      bCtx.font = '900 120px "Impact", sans-serif';
      bCtx.lineWidth = 24;
      bCtx.strokeStyle = cfg.strokeCol;
      bCtx.strokeText(cfg.name, 512, 280);
      bCtx.fillStyle = '#ffffff';
      bCtx.fillText(cfg.name, 512, 280);

      // Squad Number
      bCtx.font = `900 ${cfg.num.length === 1 ? 460 : 380}px "Impact", sans-serif`;
      bCtx.lineWidth = 38;
      bCtx.strokeStyle = cfg.strokeCol;
      bCtx.strokeText(cfg.num, 512, 650);

      const bNumGrad = bCtx.createLinearGradient(512, 450, 512, 850);
      bNumGrad.addColorStop(0, cfg.fillColTop);
      bNumGrad.addColorStop(1, cfg.fillColBot);
      bCtx.fillStyle = bNumGrad;
      bCtx.fillText(cfg.num, 512, 650);

      bCtx.lineWidth = 7;
      bCtx.strokeStyle = '#ffffff';
      bCtx.strokeText(cfg.num, 512, 650);

      const bData = bCtx.getImageData(0, 0, 1024, 1024).data;
      function sampleBack(px, py) {
        if (px < 0 || px >= 1024 || py < 0 || py >= 1024) return null;
        const idx = (Math.floor(py) * 1024 + Math.floor(px)) * 4;
        const a = bData[idx + 3];
        if (a < 30) return null;
        return [bData[idx], bData[idx + 1], bData[idx + 2], a / 255];
      }

      // 5. 3D Face Enhancer & Shader Function
      // Returns [r, g, b, weight] or null
      function computeFaceEnhancement(x, y, z, nx, ny, nz) {
        // Face area: Y between 0.32 and 0.49, Z > 0.03, |X| < 0.065
        if (y < 0.32 || y > 0.49 || z < 0.02 || Math.abs(x) > 0.065) return null;
        if (nz < 0.20) return null; // Only front-facing surfaces

        const fCfg = cfg.face;

        // 1. EYES
        const dL = Math.hypot((x - fCfg.eyeLX) * 1.0, (y - fCfg.eyeY) * 1.55);
        const dR = Math.hypot((x - fCfg.eyeRX) * 1.0, (y - fCfg.eyeY) * 1.55);
        const isEye = (dL < 0.0165 || dR < 0.0165);

        if (isEye) {
          const d = Math.min(dL, dR);
          const eyeX = (dL < dR) ? fCfg.eyeLX : fCfg.eyeRX;
          const dx = x - eyeX;
          const dy = y - fCfg.eyeY;

          // Upper lash / eyelid crease
          if (dy > 0.007 && Math.abs(dx) < 0.014) {
            return [20, 15, 12, 0.95];
          }

          // Specular Catchlight (Upper left of pupil)
          const dGlint = Math.hypot(dx + 0.0022, dy - 0.0022);
          if (dGlint < 0.0018) {
            return [255, 255, 255, 1.0];
          }

          // Pupil (center black core)
          const dPupil = Math.hypot(dx, dy);
          if (dPupil < 0.0042) {
            return [10, 10, 14, 1.0];
          }

          // Iris (vibrant sports star iris with limbal ring)
          if (d < 0.0095) {
            const irisT = Math.min(1.0, Math.max(0.0, (d - 0.0042) / 0.0053));
            // Dark limbal ring at edge
            if (d > 0.0080) {
              return [fCfg.irisLimbal[0], fCfg.irisLimbal[1], fCfg.irisLimbal[2], 0.95];
            }
            const r = Math.round(fCfg.irisCore[0] * (1 - irisT) + fCfg.irisOuter[0] * irisT);
            const g = Math.round(fCfg.irisCore[1] * (1 - irisT) + fCfg.irisOuter[1] * irisT);
            const b = Math.round(fCfg.irisCore[2] * (1 - irisT) + fCfg.irisOuter[2] * irisT);
            return [r, g, b, 1.0];
          }

          // Sclera (White of eye with subtle top shadow)
          const topShadow = Math.max(0, Math.min(1, (dy + 0.004) / 0.014));
          const scleraR = Math.round(250 * (1 - topShadow * 0.12));
          const scleraG = Math.round(252 * (1 - topShadow * 0.12));
          const scleraB = Math.round(255 * (1 - topShadow * 0.10));
          return [scleraR, scleraG, scleraB, 0.92];
        }

        // 2. EYEBROWS (Athletic arch)
        const browDY = y - fCfg.browY;
        const browX = Math.abs(x);
        if (browX >= 0.015 && browX <= 0.046 && Math.abs(browDY) < 0.007) {
          const browT = 1.0 - Math.abs(browDY) / 0.007;
          return [fCfg.browCol[0], fCfg.browCol[1], fCfg.browCol[2], browT * 0.85];
        }

        // 3. NOSE (Highlight on bridge & nostrils)
        if (Math.abs(x) < 0.005 && y >= 0.380 && y <= 0.415) {
          return [fCfg.highlightCol[0], fCfg.highlightCol[1], fCfg.highlightCol[2], 0.45];
        }
        // Nostrils
        if (Math.abs(x) >= 0.008 && Math.abs(x) <= 0.016 && Math.abs(y - 0.378) < 0.004) {
          return [45, 25, 20, 0.70];
        }

        // 4. LIPS & MOUTH
        if (Math.abs(x) < 0.022 && y >= 0.344 && y <= 0.366) {
          const mouthDistY = y - 0.355;
          // Mouth crease
          if (Math.abs(mouthDistY) < 0.002) {
            return [fCfg.mouthLine[0], fCfg.mouthLine[1], fCfg.mouthLine[2], 0.90];
          }
          // Lower lip highlight
          if (mouthDistY < -0.003 && mouthDistY > -0.008 && Math.abs(x) < 0.012) {
            return [fCfg.lipHighlight[0], fCfg.lipHighlight[1], fCfg.lipHighlight[2], 0.65];
          }
          // Lip base color
          return [fCfg.lipCol[0], fCfg.lipCol[1], fCfg.lipCol[2], 0.75];
        }

        // 5. GROOMING / FACIAL HAIR
        if (fCfg.beard) {
          // Goatee on chin
          if (y < 0.345 && Math.abs(x) < 0.020 && z > 0.03) {
            return [25, 18, 14, 0.88];
          }
          // Mustache
          if (y >= 0.362 && y <= 0.373 && Math.abs(x) < 0.022) {
            return [25, 18, 14, 0.85];
          }
        }

        // 6. CHEEK BLUSH / SUBSURFACE SCATTERING WARMTH
        if (Math.abs(x) >= 0.025 && Math.abs(x) <= 0.052 && y >= 0.365 && y <= 0.405) {
          return [fCfg.blushCol[0], fCfg.blushCol[1], fCfg.blushCol[2], 0.40];
        }

        // 7. BASE SKIN TONE LIFTING (Eliminate mud and darkness!)
        // Apply smooth warm athletic skin tone to the front face
        const faceWeight = Math.min(1.0, Math.pow(Math.max(0, nz), 1.5) * 0.45);
        return [fCfg.skinBase[0], fCfg.skinBase[1], fCfg.skinBase[2], faceWeight];
      }

      // 6. Rasterize onto 2048x2048 Texture Atlas
      const atlasImgData = ctx.getImageData(0, 0, W, H);
      const atlas = atlasImgData.data;

      for (let t = 0; t < indices.length; t += 3) {
        const i0 = indices[t], i1 = indices[t+1], i2 = indices[t+2];
        const x0 = pos[i0*3], y0 = pos[i0*3+1], z0 = pos[i0*3+2];
        const x1 = pos[i1*3], y1 = pos[i1*3+1], z1 = pos[i1*3+2];
        const x2 = pos[i2*3], y2 = pos[i2*3+1], z2 = pos[i2*3+2];

        const cz = (z0 + z1 + z2) / 3;
        const cy = (y0 + y1 + y2) / 3;
        const cx = (x0 + x1 + x2) / 3;

        // Normal
        const ax = x1 - x0, ay = y1 - y0, az = z1 - z0;
        const bx = x2 - x0, by = y2 - y0, bz = z2 - z0;
        const nx = ay * bz - az * by;
        const ny = az * bx - ax * bz;
        const nz = ax * by - ay * bx;
        const nLen = Math.hypot(nx, ny, nz) || 1;
        const normZ = nz / nLen;

        const isFace = (cy >= 0.31 && cy <= 0.50 && cz > 0.02 && Math.abs(cx) <= 0.07);
        const isFrontJersey = (cz > 0.03 && normZ > 0.30 && cy >= 0.08 && cy <= 0.28 && Math.abs(cx) <= 0.115);
        const isBackJersey = (cz < -0.03 && normZ < -0.30 && cy >= 0.08 && cy <= 0.28 && Math.abs(cx) <= 0.115);

        if (!isFace && !isFrontJersey && !isBackJersey) continue;

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

              if (isFace) {
                samp = computeFaceEnhancement(posX, posY, posZ, nx / nLen, ny / nLen, normZ);
              } else if (isFrontJersey) {
                // Map front jersey: center at (512, 512), X width 0.22 -> 1024, Y height 0.20 -> 1024
                const pX = 512 + (posX / 0.11) * 480;
                const pY = 512 - ((posY - 0.19) / 0.10) * 440;
                samp = sampleFront(pX, pY);
              } else if (isBackJersey) {
                // Map back jersey: posX mirrored
                const pX = 512 - (posX / 0.11) * 480;
                const pY = 512 - ((posY - 0.19) / 0.10) * 440;
                samp = sampleBack(pX, pY);
              }

              if (samp) {
                const aIdx = (y * W + x) * 4;
                const weight = samp[3];
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
    }, cfg);

    const b = Buffer.from(resultBase64.replace(/^data:image\/png;base64,/, ''), 'base64');
    fs.writeFileSync(`assets/characters/${cfg.id}_refined_texture.png`, b);
    console.log(`✓ Saved 2048x2048 Ultra-HD texture: assets/characters/${cfg.id}_refined_texture.png (${b.length} bytes)`);
  }

  // 1. HOOPS #23 Configuration
  await processAthlete({
    id: 'hoops23',
    name: 'HOOPS',
    num: '23',
    rawGlbUrl: 'assets/characters/hoops23_raw_backup.glb',
    baseJerseyCol: '#0c0e12',
    jerseyPattern: 'dots',
    trimCol: '#f59e0b',
    strokeCol: '#06080c',
    fillColTop: '#fde68a',
    fillColBot: '#d97706',
    crest: false,
    face: {
      eyeLX: -0.028,
      eyeRX: 0.025,
      eyeY: 0.419,
      browY: 0.448,
      browCol: [26, 16, 12],
      irisCore: [251, 191, 36],
      irisOuter: [180, 83, 9],
      irisLimbal: [69, 26, 3],
      skinBase: [175, 110, 65],
      highlightCol: [210, 150, 100],
      blushCol: [185, 95, 55],
      lipCol: [133, 70, 48],
      lipHighlight: [185, 115, 85],
      mouthLine: [45, 20, 12],
      beard: true
    }
  });

  // 2. FOOTY #10 Configuration
  await processAthlete({
    id: 'footy10',
    name: 'FOOTY',
    num: '10',
    rawGlbUrl: 'assets/characters/footy10_raw_backup.glb',
    baseJerseyCol: '#0077b6',
    jerseyPattern: 'cyber',
    trimCol: '#ffffff',
    strokeCol: '#08172e',
    fillColTop: '#ffffff',
    fillColBot: '#e0f2fe',
    crest: true,
    face: {
      eyeLX: -0.028,
      eyeRX: 0.025,
      eyeY: 0.423,
      browY: 0.450,
      browCol: [65, 40, 25],
      irisCore: [56, 189, 248],
      irisOuter: [2, 132, 199],
      irisLimbal: [12, 74, 110],
      skinBase: [235, 175, 140],
      highlightCol: [255, 220, 195],
      blushCol: [230, 130, 110],
      lipCol: [195, 105, 95],
      lipHighlight: [245, 175, 165],
      mouthLine: [85, 30, 25],
      beard: false
    }
  });

  // 3. KEEPER #1 Configuration
  await processAthlete({
    id: 'keeper1',
    name: 'KEEPER',
    num: '1',
    rawGlbUrl: 'assets/characters/keeper1_raw_backup.glb',
    baseJerseyCol: '#0f172a',
    jerseyPattern: 'hex',
    trimCol: '#10b981',
    strokeCol: '#051811',
    fillColTop: '#6ee7b7',
    fillColBot: '#059669',
    crest: false,
    face: {
      eyeLX: -0.031,
      eyeRX: 0.028,
      eyeY: 0.429,
      browY: 0.453,
      browCol: [50, 32, 20],
      irisCore: [52, 211, 153],
      irisOuter: [5, 150, 105],
      irisLimbal: [2, 44, 34],
      skinBase: [228, 170, 135],
      highlightCol: [250, 215, 190],
      blushCol: [215, 125, 100],
      lipCol: [180, 95, 85],
      lipHighlight: [235, 165, 155],
      mouthLine: [75, 28, 22],
      beard: false
    }
  });

  await browser.close();
  console.log('\n=== All 3 Athletes Master Baked at 2048x2048! ===');
}

bakeMasterUltraHD().catch(console.error);
