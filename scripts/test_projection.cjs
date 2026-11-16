const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const fs = require('fs');
const loader = require('../assets/loaders/glb_loader.js');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

function repackGLB(rawGlbPath, newImgBytes, outGlbPath) {
  const rawBuf = fs.readFileSync(rawGlbPath);
  const jsonLen = rawBuf.readUInt32LE(12);
  const jsonStr = rawBuf.toString('utf8', 20, 20 + jsonLen);
  const gltf = JSON.parse(jsonStr);
  const binOffset = 20 + jsonLen + 8;
  const oldBin = rawBuf.slice(binOffset);

  const imgBvIndex = gltf.images[0].bufferView;

  const chunks = [];
  let currentOffset = 0;

  for (let i = 0; i < gltf.bufferViews.length; i++) {
    const bv = gltf.bufferViews[i];
    let data;
    if (i === imgBvIndex) {
      data = newImgBytes;
    } else {
      data = oldBin.slice(bv.byteOffset, bv.byteOffset + bv.byteLength);
    }

    const padLen = (4 - (data.length % 4)) % 4;
    const padded = padLen > 0 ? Buffer.concat([data, Buffer.alloc(padLen)]) : data;

    bv.byteOffset = currentOffset;
    bv.byteLength = data.length;
    currentOffset += padded.length;
    chunks.push(padded);
  }

  const newBin = Buffer.concat(chunks);
  gltf.buffers[0].byteLength = newBin.length;

  const newJsonStr = JSON.stringify(gltf);
  const jsonBuf = Buffer.from(newJsonStr, 'utf8');
  const jsonPadLen = (4 - (jsonBuf.length % 4)) % 4;
  const paddedJson = jsonPadLen > 0 ? Buffer.concat([jsonBuf, Buffer.alloc(jsonPadLen, 0x20)]) : jsonBuf;

  const totalLen = 12 + 8 + paddedJson.length + 8 + newBin.length;
  const header = Buffer.alloc(12);
  header.write('glTF', 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(totalLen, 8);

  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(paddedJson.length, 0);
  jsonHeader.write('JSON', 4);

  const binHeader = Buffer.alloc(8);
  binHeader.writeUInt32LE(newBin.length, 0);
  binHeader.write('BIN\0', 4);

  const outBuf = Buffer.concat([header, jsonHeader, paddedJson, binHeader, newBin]);
  fs.writeFileSync(outGlbPath, outBuf);
  console.log(`✓ Repacked ${outGlbPath} cleanly (${outBuf.length} bytes)`);
}

async function testProjectFooty() {
  console.log('=== Testing 3D WebGL Texture Projector on Footy #10 ===');

  const buf = fs.readFileSync('assets/characters/footy10_raw_backup.glb');
  const parsed = loader.parseGLBContainer(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  const gltf = parsed.gltf;
  const bin = parsed.bin;

  function getAcc(idx) {
    const acc = gltf.accessors[idx];
    const bv = gltf.bufferViews[acc.bufferView];
    const offset = (bv.byteOffset || 0) + (acc.byteOffset || 0);
    if (acc.componentType === 5126) return new Float32Array(bin, offset, acc.count * (acc.type === 'VEC3' ? 3 : 2));
    if (acc.componentType === 5125) return new Uint32Array(bin, offset, acc.count);
    if (acc.componentType === 5123) return new Uint16Array(bin, offset, acc.count);
  }

  const prim = gltf.meshes[0].primitives[0];
  const posArr = Array.from(getAcc(prim.attributes.POSITION));
  const uvArr = Array.from(getAcc(prim.attributes.TEXCOORD_0));
  const idxArr = Array.from(getAcc(prim.indices));

  // Compute smooth normals per vertex
  const normalMap = new Map();
  const posToKey = (idx) => `${Math.round(posArr[idx*3]*10000)},${Math.round(posArr[idx*3+1]*10000)},${Math.round(posArr[idx*3+2]*10000)}`;
  for (let i = 0; i < idxArr.length; i += 3) {
    const i0 = idxArr[i], i1 = idxArr[i+1], i2 = idxArr[i+2];
    const ax = posArr[i1*3] - posArr[i0*3], ay = posArr[i1*3+1] - posArr[i0*3+1], az = posArr[i1*3+2] - posArr[i0*3+2];
    const bx = posArr[i2*3] - posArr[i0*3], by = posArr[i2*3+1] - posArr[i0*3+1], bz = posArr[i2*3+2] - posArr[i0*3+2];
    const nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
    for (const idx of [i0, i1, i2]) {
      const k = posToKey(idx);
      let cur = normalMap.get(k) || [0, 0, 0];
      cur[0] += nx; cur[1] += ny; cur[2] += nz;
      normalMap.set(k, cur);
    }
  }
  const normArr = new Array(posArr.length);
  for (let i = 0; i < posArr.length / 3; i++) {
    const k = posToKey(i);
    const n = normalMap.get(k) || [0, 1, 0];
    const l = Math.hypot(n[0], n[1], n[2]) || 1;
    normArr[i*3] = n[0] / l;
    normArr[i*3+1] = n[1] / l;
    normArr[i*3+2] = n[2] / l;
  }

  const baseB64 = fs.readFileSync('assets/characters/footy10_orig_texture.png').toString('base64');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 2048, height: 2048 });

  const projectedPngB64 = await page.evaluate(async (meshData, baseB64) => {
    const W = 2048, H = 2048;

    // 1. Create Base Canvas with High-Frequency Sharpness
    const baseImg = new Image();
    await new Promise(r => { baseImg.onload = r; baseImg.src = 'data:image/png;base64,' + baseB64; });

    const baseCvs = document.createElement('canvas');
    baseCvs.width = W; baseCvs.height = H;
    const bCtx = baseCvs.getContext('2d');
    bCtx.drawImage(baseImg, 0, 0, W, H);

    // Unsharp mask pass on base texture
    const blurCvs = document.createElement('canvas');
    blurCvs.width = W; blurCvs.height = H;
    const blCtx = blurCvs.getContext('2d');
    blCtx.filter = 'blur(2px)';
    blCtx.drawImage(baseCvs, 0, 0);

    const d1 = bCtx.getImageData(0, 0, W, H);
    const bd1 = blCtx.getImageData(0, 0, W, H).data;
    const data = d1.data;
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i] + (data[i] - bd1[i]) * 2.0;
      let g = data[i+1] + (data[i+1] - bd1[i+1]) * 2.0;
      let b = data[i+2] + (data[i+2] - bd1[i+2]) * 2.0;
      r = ((r / 255.0 - 0.5) * 1.1 + 0.5) * 255.0;
      g = ((g / 255.0 - 0.5) * 1.1 + 0.5) * 255.0;
      b = ((b / 255.0 - 0.5) * 1.1 + 0.5) * 255.0;
      data[i] = Math.min(255, Math.max(0, r));
      data[i+1] = Math.min(255, Math.max(0, g));
      data[i+2] = Math.min(255, Math.max(0, b));
    }
    bCtx.putImageData(d1, 0, 0);

    // 2. Generate Stylized High-Definition Face Decal (1024x1024)
    const faceCvs = document.createElement('canvas');
    faceCvs.width = 1024; faceCvs.height = 1024;
    const fCtx = faceCvs.getContext('2d');

    // Soft warm skin tone base with smooth radial gradient (center at nose bridge)
    const skinGrad = fCtx.createRadialGradient(512, 540, 60, 512, 540, 480);
    skinGrad.addColorStop(0, '#fbe0cc');
    skinGrad.addColorStop(0.45, '#eec3a2');
    skinGrad.addColorStop(0.75, '#dda882');
    skinGrad.addColorStop(1, 'rgba(210, 150, 115, 0.0)');
    fCtx.fillStyle = skinGrad;
    fCtx.fillRect(0, 0, 1024, 1024);

    // Soft Cheek Blush
    const blushLeft = fCtx.createRadialGradient(820, 560, 10, 820, 560, 120);
    blushLeft.addColorStop(0, 'rgba(235, 120, 110, 0.35)');
    blushLeft.addColorStop(1, 'rgba(235, 120, 110, 0.0)');
    fCtx.fillStyle = blushLeft;
    fCtx.fillRect(700, 440, 240, 240);

    const blushRight = fCtx.createRadialGradient(340, 560, 10, 340, 560, 120);
    blushRight.addColorStop(0, 'rgba(235, 120, 110, 0.35)');
    blushRight.addColorStop(1, 'rgba(235, 120, 110, 0.0)');
    fCtx.fillStyle = blushRight;
    fCtx.fillRect(220, 440, 240, 240);

    // Function to draw stunning Pixar/Fortnite stylized eyes
    function drawStylizedEye(cx, cy, isLeft) {
      fCtx.save();

      // Eye shadow socket / upper lid crease
      fCtx.strokeStyle = 'rgba(70, 35, 20, 0.45)';
      fCtx.lineWidth = 14;
      fCtx.lineCap = 'round';
      fCtx.beginPath();
      fCtx.moveTo(cx - 75, cy - 36);
      fCtx.quadraticCurveTo(cx, cy - 54, cx + 75, cy - 36);
      fCtx.stroke();

      // Eyebrow
      fCtx.strokeStyle = '#322014';
      fCtx.lineWidth = 26;
      fCtx.lineCap = 'round';
      fCtx.beginPath();
      if (isLeft) {
        fCtx.moveTo(cx - 85, cy - 80);
        fCtx.quadraticCurveTo(cx, cy - 110, cx + 90, cy - 88);
      } else {
        fCtx.moveTo(cx - 90, cy - 88);
        fCtx.quadraticCurveTo(cx, cy - 110, cx + 85, cy - 80);
      }
      fCtx.stroke();

      // Sclera (White of eye) with ambient occlusion
      fCtx.save();
      fCtx.beginPath();
      fCtx.ellipse(cx, cy, 68, 38, 0, 0, Math.PI * 2);
      fCtx.clip();

      const scleraGrad = fCtx.createLinearGradient(cx, cy - 40, cx, cy + 40);
      scleraGrad.addColorStop(0, '#dce3eb');
      scleraGrad.addColorStop(0.3, '#ffffff');
      scleraGrad.addColorStop(1, '#f0ece6');
      fCtx.fillStyle = scleraGrad;
      fCtx.fillRect(cx - 80, cy - 50, 160, 100);

      // Sclera soft inner shadow
      fCtx.strokeStyle = 'rgba(80, 50, 40, 0.30)';
      fCtx.lineWidth = 6;
      fCtx.stroke();

      // Iris (Brilliant Azure Blue with depth gradient)
      const irisX = cx + (isLeft ? 4 : -4);
      const irisY = cy;
      const irisR = 34;

      const irisGrad = fCtx.createRadialGradient(irisX, irisY, 4, irisX, irisY, irisR);
      irisGrad.addColorStop(0, '#78d8ff');
      irisGrad.addColorStop(0.35, '#269cdb');
      irisGrad.addColorStop(0.75, '#125287');
      irisGrad.addColorStop(1, '#062038');
      fCtx.fillStyle = irisGrad;
      fCtx.beginPath();
      fCtx.arc(irisX, irisY, irisR, 0, Math.PI * 2);
      fCtx.fill();

      // Dark Limbal Ring (outer edge of iris)
      fCtx.strokeStyle = '#051829';
      fCtx.lineWidth = 3.5;
      fCtx.stroke();

      // Pupil (Deep obsidian black)
      fCtx.fillStyle = '#020509';
      fCtx.beginPath();
      fCtx.arc(irisX, irisY, 15, 0, Math.PI * 2);
      fCtx.fill();

      // Primary Specular Catchlight (Star/Glint)
      fCtx.fillStyle = '#ffffff';
      fCtx.beginPath();
      fCtx.arc(irisX + 8, irisY - 8, 7.5, 0, Math.PI * 2);
      fCtx.fill();

      // Secondary subtle reflection
      fCtx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      fCtx.beginPath();
      fCtx.arc(irisX - 8, irisY + 8, 4.0, 0, Math.PI * 2);
      fCtx.fill();

      fCtx.restore();

      // Upper Eyelash / Eyelid Line
      fCtx.strokeStyle = '#1b0e07';
      fCtx.lineWidth = 10;
      fCtx.lineCap = 'round';
      fCtx.beginPath();
      fCtx.moveTo(cx - 70, cy - 2);
      fCtx.quadraticCurveTo(cx, cy - 42, cx + 70, cy - 2);
      fCtx.stroke();

      // Lower subtle lid line
      fCtx.strokeStyle = 'rgba(90, 50, 30, 0.40)';
      fCtx.lineWidth = 4;
      fCtx.beginPath();
      fCtx.moveTo(cx - 55, cy + 12);
      fCtx.quadraticCurveTo(cx, cy + 38, cx + 55, cy + 12);
      fCtx.stroke();

      fCtx.restore();
    }

    // Draw Left and Right Eyes (Footy face landmarks)
    drawStylizedEye(325, 410, false); // Right eye (viewer left)
    drawStylizedEye(840, 410, true);  // Left eye (viewer right)

    // Nose Bridge and Contours
    fCtx.save();
    // Nose highlight
    const noseHi = fCtx.createLinearGradient(496, 420, 496, 590);
    noseHi.addColorStop(0, 'rgba(255, 245, 235, 0.45)');
    noseHi.addColorStop(0.7, 'rgba(255, 245, 235, 0.70)');
    noseHi.addColorStop(1, 'rgba(255, 245, 235, 0.0)');
    fCtx.fillStyle = noseHi;
    fCtx.beginPath();
    fCtx.ellipse(496, 510, 14, 75, 0, 0, Math.PI * 2);
    fCtx.fill();

    // Nostril shadows
    fCtx.fillStyle = 'rgba(90, 40, 25, 0.65)';
    fCtx.beginPath();
    fCtx.ellipse(465, 595, 12, 6, -0.2, 0, Math.PI * 2);
    fCtx.ellipse(527, 595, 12, 6, 0.2, 0, Math.PI * 2);
    fCtx.fill();

    // Nose tip ball
    const tipGrad = fCtx.createRadialGradient(496, 580, 2, 496, 580, 28);
    tipGrad.addColorStop(0, 'rgba(255, 250, 245, 0.60)');
    tipGrad.addColorStop(0.5, 'rgba(235, 160, 130, 0.25)');
    tipGrad.addColorStop(1, 'rgba(235, 160, 130, 0.0)');
    fCtx.fillStyle = tipGrad;
    fCtx.beginPath();
    fCtx.arc(496, 580, 28, 0, Math.PI * 2);
    fCtx.fill();
    fCtx.restore();

    // Stylized Athletic Lips
    fCtx.save();
    const lipX = 496, lipY = 800;

    // Upper Lip
    fCtx.fillStyle = '#b85e49';
    fCtx.beginPath();
    fCtx.moveTo(lipX - 70, lipY);
    fCtx.quadraticCurveTo(lipX - 25, lipY - 24, lipX, lipY - 14);
    fCtx.quadraticCurveTo(lipX + 25, lipY - 24, lipX + 70, lipY);
    fCtx.quadraticCurveTo(lipX, lipY + 8, lipX - 70, lipY);
    fCtx.fill();

    // Lower Lip
    fCtx.fillStyle = '#d47863';
    fCtx.beginPath();
    fCtx.moveTo(lipX - 65, lipY + 2);
    fCtx.quadraticCurveTo(lipX, lipY + 36, lipX + 65, lipY + 2);
    fCtx.quadraticCurveTo(lipX, lipY + 10, lipX - 65, lipY + 2);
    fCtx.fill();

    // Lower Lip Specular Highlight
    fCtx.fillStyle = 'rgba(255, 235, 225, 0.60)';
    fCtx.beginPath();
    fCtx.ellipse(lipX, lipY + 16, 26, 6, 0, 0, Math.PI * 2);
    fCtx.fill();

    // Mouth Center Crease & Corners
    fCtx.strokeStyle = '#4e1e14';
    fCtx.lineWidth = 6;
    fCtx.lineCap = 'round';
    fCtx.beginPath();
    fCtx.moveTo(lipX - 74, lipY - 2);
    fCtx.quadraticCurveTo(lipX - 30, lipY + 3, lipX, lipY - 1);
    fCtx.quadraticCurveTo(lipX + 30, lipY + 3, lipX + 74, lipY - 2);
    fCtx.stroke();

    fCtx.restore();

    // 3. Generate High-Definition Chest Decal (1024x1024)
    const chestCvs = document.createElement('canvas');
    chestCvs.width = 1024; chestCvs.height = 1024;
    const cCtx = chestCvs.getContext('2d');

    // Rich Athletic Cyan Background with Soft Feathering
    const cBgGrad = cCtx.createRadialGradient(512, 512, 120, 512, 512, 490);
    cBgGrad.addColorStop(0, '#00d0f2');
    cBgGrad.addColorStop(0.5, '#00bee4');
    cBgGrad.addColorStop(0.85, '#0090b8');
    cBgGrad.addColorStop(1, 'rgba(0, 144, 184, 0.0)');
    cCtx.fillStyle = cBgGrad;
    cCtx.fillRect(0, 0, 1024, 1024);

    cCtx.textAlign = 'center';
    cCtx.textBaseline = 'middle';

    // Bold Athletic "FOOTY"
    cCtx.font = '900 135px "Arial Black", "Trebuchet MS", sans-serif';
    cCtx.strokeStyle = '#001a33';
    cCtx.lineWidth = 32;
    cCtx.lineJoin = 'round';
    cCtx.strokeText('FOOTY', 470, 310);
    cCtx.fillStyle = '#ffffff';
    cCtx.fillText('FOOTY', 470, 310);

    // Official Club Shield Crest on right of FOOTY (left chest)
    const crX = 810, crY = 300;
    cCtx.fillStyle = '#002244';
    cCtx.strokeStyle = '#ffd700';
    cCtx.lineWidth = 8;
    cCtx.beginPath();
    cCtx.moveTo(crX - 45, crY - 50);
    cCtx.lineTo(crX + 45, crY - 50);
    cCtx.lineTo(crX + 45, crY + 20);
    cCtx.quadraticCurveTo(crX, crY + 65, crX - 45, crY + 20);
    cCtx.closePath();
    cCtx.fill();
    cCtx.stroke();

    cCtx.fillStyle = '#ffd700';
    cCtx.font = 'bold 36px sans-serif';
    cCtx.fillText('★', crX, crY - 65);

    // Crisp Bold Athletic "10"
    cCtx.font = '900 320px "Arial Black", "Impact", sans-serif';
    cCtx.strokeStyle = '#00152b';
    cCtx.lineWidth = 44;
    cCtx.lineJoin = 'round';
    cCtx.strokeText('10', 512, 630);
    cCtx.fillStyle = '#ffffff';
    cCtx.fillText('10', 512, 630);

    cCtx.strokeStyle = '#00f0ff';
    cCtx.lineWidth = 8;
    cCtx.strokeText('10', 512, 630);

    // 4. WebGL UV-Space Projection Pass
    const glCvs = document.createElement('canvas');
    glCvs.width = W; glCvs.height = H;
    const gl = glCvs.getContext('webgl2', { antialias: false, preserveDrawingBuffer: true });

    // Shaders
    const vsSource = `#version 300 es
      in vec3 aPosition;
      in vec3 aNormal;
      in vec2 aTexCoord;

      out vec3 vPos;
      out vec3 vNormal;
      out vec2 vUV;

      void main() {
        vPos = aPosition;
        vNormal = aNormal;
        vUV = aTexCoord;
        // Map glTF UV (0..1, top-left) to WebGL clip space (-1..1)
        gl_Position = vec4(aTexCoord.x * 2.0 - 1.0, 1.0 - aTexCoord.y * 2.0, 0.0, 1.0);
      }
    `;

    const fsSource = `#version 300 es
      precision highp float;

      in vec3 vPos;
      in vec3 vNormal;
      in vec2 vUV;

      uniform sampler2D uFaceDecal;
      uniform vec4 uFaceBounds; // minX, maxX, minY, maxY

      uniform sampler2D uChestDecal;
      uniform vec4 uChestBounds;

      out vec4 fragColor;

      void main() {
        vec3 N = normalize(vNormal);
        vec4 outCol = vec4(0.0);

        if (N.z > 0.10) {
          // 1. Face Decal
          if (vPos.x >= uFaceBounds.x && vPos.x <= uFaceBounds.y &&
              vPos.y >= uFaceBounds.z && vPos.y <= uFaceBounds.w &&
              vPos.z > 0.02) {
            vec2 fUV = vec2(
              (vPos.x - uFaceBounds.x) / (uFaceBounds.y - uFaceBounds.x),
              1.0 - (vPos.y - uFaceBounds.z) / (uFaceBounds.w - uFaceBounds.z)
            );
            vec4 col = texture(uFaceDecal, fUV);
            float angleWeight = smoothstep(0.10, 0.45, N.z);
            outCol = vec4(col.rgb, col.a * angleWeight);
          }

          // 2. Chest Decal
          if (vPos.x >= uChestBounds.x && vPos.x <= uChestBounds.y &&
              vPos.y >= uChestBounds.z && vPos.y <= uChestBounds.w &&
              vPos.z > 0.02) {
            vec2 cUV = vec2(
              (vPos.x - uChestBounds.x) / (uChestBounds.y - uChestBounds.x),
              1.0 - (vPos.y - uChestBounds.z) / (uChestBounds.w - uChestBounds.z)
            );
            vec4 col = texture(uChestDecal, cUV);
            float angleWeight = smoothstep(0.10, 0.40, N.z);
            outCol = vec4(col.rgb, col.a * angleWeight);
          }
        }

        if (outCol.a <= 0.001) {
          discard;
        }

        fragColor = outCol;
      }
    `;

    function createShader(gl, type, source) {
      const s = gl.createShader(type);
      gl.shaderSource(s, source);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(s));
      }
      return s;
    }

    const prg = gl.createProgram();
    gl.attachShader(prg, createShader(gl, gl.VERTEX_SHADER, vsSource));
    gl.attachShader(prg, createShader(gl, gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(prg);
    if (!gl.getProgramParameter(prg, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(prg));
    }
    gl.useProgram(prg);

    // Buffers
    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(meshData.pos), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prg, 'aPosition');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);

    const normBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(meshData.normals), gl.STATIC_DRAW);
    const aNorm = gl.getAttribLocation(prg, 'aNormal');
    gl.enableVertexAttribArray(aNorm);
    gl.vertexAttribPointer(aNorm, 3, gl.FLOAT, false, 0, 0);

    const uvBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(meshData.uvs), gl.STATIC_DRAW);
    const aUV = gl.getAttribLocation(prg, 'aTexCoord');
    gl.enableVertexAttribArray(aUV);
    gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 0, 0);

    const idxBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(meshData.indices), gl.STATIC_DRAW);

    // Textures
    function createGLTex(imgEl, unit) {
      const tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgEl);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return tex;
    }

    createGLTex(faceCvs, 0);
    gl.uniform1i(gl.getUniformLocation(prg, 'uFaceDecal'), 0);
    gl.uniform4f(gl.getUniformLocation(prg, 'uFaceBounds'), -0.060, 0.035, 0.340, 0.470);

    createGLTex(chestCvs, 1);
    gl.uniform1i(gl.getUniformLocation(prg, 'uChestDecal'), 1);
    gl.uniform4f(gl.getUniformLocation(prg, 'uChestBounds'), -0.100, 0.120, 0.080, 0.240);

    gl.viewport(0, 0, W, H);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.DEPTH_TEST);

    gl.drawElements(gl.TRIANGLES, meshData.indices.length, gl.UNSIGNED_INT, 0);

    // 5. Composite Projection Layer on top of Base Canvas
    bCtx.drawImage(glCvs, 0, 0);

    return baseCvs.toDataURL('image/png');
  }, { pos: posArr, normals: normArr, uvs: uvArr, indices: idxArr }, baseB64);

  const outBuf = Buffer.from(projectedPngB64.replace(/^data:image\/png;base64,/, ''), 'base64');
  fs.writeFileSync('assets/characters/footy10_projected_test.png', outBuf);
  console.log('✓ Wrote assets/characters/footy10_projected_test.png');

  repackGLB('assets/characters/footy10_raw_backup.glb', outBuf, 'assets/characters/footy10.glb');

  await browser.close();
}

testProjectFooty().catch(console.error);
