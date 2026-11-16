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
  console.log(`✓ Repacked ${outGlbPath} (${outBuf.length} bytes)`);
}

function loadMeshBuffers(rawGlbPath) {
  const buf = fs.readFileSync(rawGlbPath);
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

  return { pos: posArr, normals: normArr, uvs: uvArr, indices: idxArr };
}

async function bakeMasterpieceAthletes() {
  console.log('=== Baking Masterpiece Athletes with 3D WebGL Projection ===');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 2048, height: 2048 });

  // Common WebGL Projection Runner in Headless Chrome
  async function runProjection(charType, meshData, baseB64, config) {
    return await page.evaluate(async (charType, meshData, baseB64, config) => {
      const W = 2048, H = 2048;

      // 1. Base Canvas & Unsharp Mask Filter
      const baseImg = new Image();
      await new Promise(r => { baseImg.onload = r; baseImg.src = 'data:image/png;base64,' + baseB64; });

      const baseCvs = document.createElement('canvas');
      baseCvs.width = W; baseCvs.height = H;
      const bCtx = baseCvs.getContext('2d');
      bCtx.drawImage(baseImg, 0, 0, W, H);

      const blurCvs = document.createElement('canvas');
      blurCvs.width = W; blurCvs.height = H;
      const blCtx = blurCvs.getContext('2d');
      blCtx.filter = 'blur(2px)';
      blCtx.drawImage(baseCvs, 0, 0);

      const d1 = bCtx.getImageData(0, 0, W, H);
      const bd1 = blCtx.getImageData(0, 0, W, H).data;
      const data = d1.data;
      const sharpBoost = charType === 'hoops' ? 2.4 : 2.0;
      for (let i = 0; i < data.length; i += 4) {
        let r = data[i] + (data[i] - bd1[i]) * sharpBoost;
        let g = data[i+1] + (data[i+1] - bd1[i+1]) * sharpBoost;
        let b = data[i+2] + (data[i+2] - bd1[i+2]) * sharpBoost;
        r = ((r / 255.0 - 0.5) * 1.12 + 0.5) * 255.0;
        g = ((g / 255.0 - 0.5) * 1.12 + 0.5) * 255.0;
        b = ((b / 255.0 - 0.5) * 1.12 + 0.5) * 255.0;

        // Rich stylized saturation boost (Fortnite / Pixar vibrancy)
        const maxC = Math.max(r, Math.max(g, b));
        const minC = Math.min(r, Math.min(g, b));
        const delta = maxC - minC;
        if (maxC > 15 && delta > 10) {
          const l = (maxC + minC) / 2.0;
          r = l + (r - l) * 1.16;
          g = l + (g - l) * 1.16;
          b = l + (b - l) * 1.16;
        }

        data[i] = Math.min(255, Math.max(0, r));
        data[i+1] = Math.min(255, Math.max(0, g));
        data[i+2] = Math.min(255, Math.max(0, b));
      }
      bCtx.putImageData(d1, 0, 0);

      // 2. High-Definition Face Decal (1024x1024) - Transparent background, ONLY sharp facial features!
      const faceCvs = document.createElement('canvas');
      faceCvs.width = 1024; faceCvs.height = 1024;
      const fCtx = faceCvs.getContext('2d');
      fCtx.clearRect(0, 0, 1024, 1024);

      // Helper for Pixar/Fortnite Stylized Eye
      function drawEye(cx, cy, irisColor1, irisColor2, limbalColor, scleraWidth, scleraHeight, isLeft) {
        fCtx.save();

        // Upper lid crease / socket shadow
        fCtx.strokeStyle = charType === 'hoops' ? 'rgba(30, 15, 10, 0.45)' : 'rgba(70, 35, 20, 0.35)';
        fCtx.lineWidth = 8;
        fCtx.lineCap = 'round';
        fCtx.beginPath();
        fCtx.moveTo(cx - scleraWidth - 6, cy - scleraHeight * 0.8);
        fCtx.quadraticCurveTo(cx, cy - scleraHeight * 1.5, cx + scleraWidth + 6, cy - scleraHeight * 0.8);
        fCtx.stroke();

        // Eyebrow
        fCtx.strokeStyle = charType === 'hoops' ? '#140c06' : (charType === 'footy' ? '#2c1c12' : '#221810');
        fCtx.lineWidth = charType === 'hoops' ? 22 : 18;
        fCtx.lineCap = 'round';
        fCtx.beginPath();
        if (isLeft) {
          fCtx.moveTo(cx - scleraWidth - 6, cy - scleraHeight * 2.2);
          fCtx.quadraticCurveTo(cx, cy - scleraHeight * 2.9, cx + scleraWidth + 12, cy - scleraHeight * 2.3);
        } else {
          fCtx.moveTo(cx - scleraWidth - 12, cy - scleraHeight * 2.3);
          fCtx.quadraticCurveTo(cx, cy - scleraHeight * 2.9, cx + scleraWidth + 6, cy - scleraHeight * 2.2);
        }
        fCtx.stroke();

        // Sclera
        fCtx.save();
        fCtx.beginPath();
        fCtx.ellipse(cx, cy, scleraWidth, scleraHeight, 0, 0, Math.PI * 2);
        fCtx.clip();

        const scleraGrad = fCtx.createLinearGradient(cx, cy - scleraHeight, cx, cy + scleraHeight);
        scleraGrad.addColorStop(0, '#d8e0ea');
        scleraGrad.addColorStop(0.3, '#ffffff');
        scleraGrad.addColorStop(1, '#ede7e0');
        fCtx.fillStyle = scleraGrad;
        fCtx.fillRect(cx - scleraWidth - 10, cy - scleraHeight - 10, (scleraWidth + 10)*2, (scleraHeight + 10)*2);

        // Ambient shadow at top of eye
        fCtx.fillStyle = 'rgba(40, 20, 15, 0.25)';
        fCtx.fillRect(cx - scleraWidth - 10, cy - scleraHeight - 10, (scleraWidth + 10)*2, scleraHeight * 0.8);

        // Iris
        const irisX = cx + (isLeft ? 2 : -2);
        const irisY = cy;
        const irisR = scleraHeight * 0.90;

        const irisGrad = fCtx.createRadialGradient(irisX, irisY, 2, irisX, irisY, irisR);
        irisGrad.addColorStop(0, irisColor1);
        irisGrad.addColorStop(0.45, irisColor2);
        irisGrad.addColorStop(1, limbalColor);
        fCtx.fillStyle = irisGrad;
        fCtx.beginPath();
        fCtx.arc(irisX, irisY, irisR, 0, Math.PI * 2);
        fCtx.fill();

        // Dark limbal ring
        fCtx.strokeStyle = limbalColor;
        fCtx.lineWidth = 3.0;
        fCtx.stroke();

        // Pupil
        fCtx.fillStyle = '#020408';
        fCtx.beginPath();
        fCtx.arc(irisX, irisY, irisR * 0.44, 0, Math.PI * 2);
        fCtx.fill();

        // Specular Catchlight #1
        fCtx.fillStyle = '#ffffff';
        fCtx.beginPath();
        fCtx.arc(irisX + irisR * 0.30, irisY - irisR * 0.30, irisR * 0.25, 0, Math.PI * 2);
        fCtx.fill();

        // Specular Catchlight #2
        fCtx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        fCtx.beginPath();
        fCtx.arc(irisX - irisR * 0.32, irisY + irisR * 0.28, irisR * 0.14, 0, Math.PI * 2);
        fCtx.fill();

        fCtx.restore();

        // Upper Eyelash / Outline
        fCtx.strokeStyle = '#0e0804';
        fCtx.lineWidth = 7;
        fCtx.lineCap = 'round';
        fCtx.beginPath();
        fCtx.moveTo(cx - scleraWidth - 4, cy - 2);
        fCtx.quadraticCurveTo(cx, cy - scleraHeight - 8, cx + scleraWidth + 4, cy - 2);
        fCtx.stroke();

        // Lower lid fine stroke
        fCtx.strokeStyle = charType === 'hoops' ? 'rgba(30, 15, 10, 0.40)' : 'rgba(80, 45, 30, 0.30)';
        fCtx.lineWidth = 3.0;
        fCtx.beginPath();
        fCtx.moveTo(cx - scleraWidth + 6, cy + 5);
        fCtx.quadraticCurveTo(cx, cy + scleraHeight + 6, cx + scleraWidth - 6, cy + 5);
        fCtx.stroke();

        fCtx.restore();
      }

      // Draw Character Faces
      if (charType === 'footy') {
        // Footy: Bright Cyan-Blue Eyes, clean athletic features
        drawEye(config.eyeRight.x, config.eyeRight.y, '#7fe0ff', '#1f9ad6', '#082b4a', 38, 21, false);
        drawEye(config.eyeLeft.x, config.eyeLeft.y, '#7fe0ff', '#1f9ad6', '#082b4a', 38, 21, true);

        // Nostril shadows
        const nX = config.nose.x, nY = config.nose.y;
        fCtx.fillStyle = 'rgba(75, 30, 20, 0.55)';
        fCtx.beginPath();
        fCtx.ellipse(nX - 20, nY + 8, 7, 4, -0.2, 0, Math.PI * 2);
        fCtx.ellipse(nX + 20, nY + 8, 7, 4, 0.2, 0, Math.PI * 2);
        fCtx.fill();

        // Clean Lips
        const mX = config.mouth.x, mY = config.mouth.y;
        fCtx.fillStyle = '#b35645';
        fCtx.beginPath();
        fCtx.moveTo(mX - 44, mY);
        fCtx.quadraticCurveTo(mX - 15, mY - 14, mX, mY - 8);
        fCtx.quadraticCurveTo(mX + 15, mY - 14, mX + 44, mY);
        fCtx.quadraticCurveTo(mX, mY + 5, mX - 44, mY);
        fCtx.fill();

        fCtx.fillStyle = '#cf6f5d';
        fCtx.beginPath();
        fCtx.moveTo(mX - 40, mY + 2);
        fCtx.quadraticCurveTo(mX, mY + 18, mX + 40, mY + 2);
        fCtx.quadraticCurveTo(mX, mY + 6, mX - 40, mY + 2);
        fCtx.fill();

        // Mouth crease
        fCtx.strokeStyle = '#4a1d14';
        fCtx.lineWidth = 3.5;
        fCtx.beginPath();
        fCtx.moveTo(mX - 46, mY - 1);
        fCtx.quadraticCurveTo(mX, mY + 2, mX + 46, mY - 1);
        fCtx.stroke();

      } else if (charType === 'hoops') {
        // Hoops: Radiant Amber-Gold Eyes (natural athletic scale)
        drawEye(config.eyeRight.x, config.eyeRight.y, '#f5c542', '#a05c08', '#2a1402', 36, 19, false);
        drawEye(config.eyeLeft.x, config.eyeLeft.y, '#f5c542', '#a05c08', '#2a1402', 36, 19, true);

        // Nostril shadows
        const nX = config.nose.x, nY = config.nose.y;
        fCtx.fillStyle = 'rgba(15, 8, 4, 0.75)';
        fCtx.beginPath();
        fCtx.ellipse(nX - 22, nY + 8, 8, 4.5, -0.22, 0, Math.PI * 2);
        fCtx.ellipse(nX + 22, nY + 8, 8, 4.5, 0.22, 0, Math.PI * 2);
        fCtx.fill();

        // Clean sculpted Mustache
        const mX = config.mouth.x, mY = config.mouth.y;
        fCtx.fillStyle = '#0f0a06';
        fCtx.beginPath();
        fCtx.moveTo(mX - 52, mY - 4);
        fCtx.quadraticCurveTo(mX - 20, mY - 24, mX, mY - 14);
        fCtx.quadraticCurveTo(mX + 20, mY - 24, mX + 52, mY - 4);
        fCtx.quadraticCurveTo(mX + 22, mY - 8, mX, mY - 8);
        fCtx.quadraticCurveTo(mX - 22, mY - 8, mX - 52, mY - 4);
        fCtx.fill();

        // Lips
        fCtx.fillStyle = '#5c3222';
        fCtx.beginPath();
        fCtx.moveTo(mX - 40, mY);
        fCtx.quadraticCurveTo(mX, mY + 16, mX + 40, mY);
        fCtx.quadraticCurveTo(mX, mY + 5, mX - 40, mY);
        fCtx.fill();

        // Mouth crease
        fCtx.strokeStyle = '#180a04';
        fCtx.lineWidth = 4.0;
        fCtx.beginPath();
        fCtx.moveTo(mX - 44, mY - 1);
        fCtx.quadraticCurveTo(mX, mY + 2, mX + 44, mY - 1);
        fCtx.stroke();

        // Crisp Sculpted Beard Trim
        fCtx.fillStyle = 'rgba(14, 9, 5, 0.85)';
        fCtx.beginPath();
        fCtx.moveTo(mX - 66, mY + 16);
        fCtx.quadraticCurveTo(mX - 38, mY + 50, mX, mY + 56);
        fCtx.quadraticCurveTo(mX + 38, mY + 50, mX + 66, mY + 16);
        fCtx.quadraticCurveTo(mX + 76, mY + 105, mX, mY + 130);
        fCtx.quadraticCurveTo(mX - 76, mY + 105, mX - 66, mY + 16);
        fCtx.fill();

      } else if (charType === 'keeper') {
        // Keeper: Vibrant Emerald-Hazel Eyes (focused heroic gaze)
        drawEye(config.eyeRight.x, config.eyeRight.y, '#52e698', '#138a4c', '#042e17', 38, 20, false);
        drawEye(config.eyeLeft.x, config.eyeLeft.y, '#52e698', '#138a4c', '#042e17', 38, 20, true);

        // Nostril shadows
        const nX = config.nose.x, nY = config.nose.y;
        fCtx.fillStyle = 'rgba(65, 30, 20, 0.55)';
        fCtx.beginPath();
        fCtx.ellipse(nX - 22, nY + 8, 8, 4, -0.2, 0, Math.PI * 2);
        fCtx.ellipse(nX + 22, nY + 8, 8, 4, 0.2, 0, Math.PI * 2);
        fCtx.fill();

        // Strong focused Lips
        const mX = config.mouth.x, mY = config.mouth.y;
        fCtx.fillStyle = '#a65042';
        fCtx.beginPath();
        fCtx.moveTo(mX - 48, mY);
        fCtx.quadraticCurveTo(mX - 16, mY - 14, mX, mY - 8);
        fCtx.quadraticCurveTo(mX + 16, mY - 14, mX + 48, mY);
        fCtx.quadraticCurveTo(mX, mY + 5, mX - 48, mY);
        fCtx.fill();

        fCtx.fillStyle = '#bf6354';
        fCtx.beginPath();
        fCtx.moveTo(mX - 44, mY + 2);
        fCtx.quadraticCurveTo(mX, mY + 16, mX + 44, mY + 2);
        fCtx.quadraticCurveTo(mX, mY + 5, mX - 44, mY + 2);
        fCtx.fill();

        // Mouth crease
        fCtx.strokeStyle = '#401810';
        fCtx.lineWidth = 4.0;
        fCtx.beginPath();
        fCtx.moveTo(mX - 50, mY - 1);
        fCtx.quadraticCurveTo(mX, mY + 2, mX + 50, mY - 1);
        fCtx.stroke();
      }

      // 3. High-Definition Chest Decal (1024x1024)
      const chestCvs = document.createElement('canvas');
      chestCvs.width = 1024; chestCvs.height = 1024;
      const cCtx = chestCvs.getContext('2d');
      cCtx.clearRect(0, 0, 1024, 1024);

      if (charType === 'footy') {
        // Soft feathered radial oval that covers the old blurry AI scribble completely
        const patch = cCtx.createRadialGradient(512, 310, 40, 512, 310, 440);
        patch.addColorStop(0, '#00bee4');
        patch.addColorStop(0.75, '#00bee4');
        patch.addColorStop(0.92, '#00a8cc');
        patch.addColorStop(1, 'rgba(0, 168, 204, 0.0)');
        cCtx.fillStyle = patch;
        cCtx.beginPath();
        cCtx.ellipse(512, 310, 450, 430, 0, 0, Math.PI * 2);
        cCtx.fill();

        cCtx.textAlign = 'center';
        cCtx.textBaseline = 'middle';

        // Bold Crisp "FOOTY"
        cCtx.font = '900 135px "Arial Black", "Trebuchet MS", sans-serif';
        cCtx.strokeStyle = '#001a33';
        cCtx.lineWidth = 32;
        cCtx.lineJoin = 'round';
        cCtx.strokeText('FOOTY', 475, 270);
        cCtx.fillStyle = '#ffffff';
        cCtx.fillText('FOOTY', 475, 270);

        // Gold Star Crest
        const crX = 815, crY = 260;
        cCtx.fillStyle = '#002244';
        cCtx.strokeStyle = '#ffd700';
        cCtx.lineWidth = 8;
        cCtx.beginPath();
        cCtx.moveTo(crX - 44, crY - 48);
        cCtx.lineTo(crX + 44, crY - 48);
        cCtx.lineTo(crX + 44, crY + 20);
        cCtx.quadraticCurveTo(crX, crY + 62, crX - 44, crY + 20);
        cCtx.closePath();
        cCtx.fill();
        cCtx.stroke();

        cCtx.fillStyle = '#ffd700';
        cCtx.font = 'bold 36px sans-serif';
        cCtx.fillText('★', crX, crY - 60);

        // Bold Crisp Number "10"
        cCtx.font = '900 340px "Arial Black", "Impact", sans-serif';
        cCtx.strokeStyle = '#00142b';
        cCtx.lineWidth = 44;
        cCtx.lineJoin = 'round';
        cCtx.strokeText('10', 512, 630);
        cCtx.fillStyle = '#ffffff';
        cCtx.fillText('10', 512, 630);

        cCtx.strokeStyle = '#00f0ff';
        cCtx.lineWidth = 9;
        cCtx.strokeText('10', 512, 630);

      } else if (charType === 'hoops') {
        // Soft feathered radial oval of black that covers the old yellow scribble seamlessly
        const patch = cCtx.createRadialGradient(512, 310, 40, 512, 310, 440);
        patch.addColorStop(0, '#0a0a0c');
        patch.addColorStop(0.78, '#0a0a0c');
        patch.addColorStop(0.92, '#060608');
        patch.addColorStop(1, 'rgba(6, 6, 8, 0.0)');
        cCtx.fillStyle = patch;
        cCtx.beginPath();
        cCtx.ellipse(512, 310, 450, 430, 0, 0, Math.PI * 2);
        cCtx.fill();

        cCtx.textAlign = 'center';
        cCtx.textBaseline = 'middle';

        const goldGrad = cCtx.createLinearGradient(0, 180, 0, 850);
        goldGrad.addColorStop(0, '#fff9d6');
        goldGrad.addColorStop(0.3, '#f5c542');
        goldGrad.addColorStop(0.7, '#c9850c');
        goldGrad.addColorStop(1, '#663b00');

        // Bold Gold "CITIZEN"
        cCtx.font = '900 125px "Arial Black", "Trebuchet MS", sans-serif';
        cCtx.strokeStyle = '#000000';
        cCtx.lineWidth = 32;
        cCtx.lineJoin = 'round';
        cCtx.strokeText('CITIZEN', 512, 280);
        cCtx.fillStyle = goldGrad;
        cCtx.fillText('CITIZEN', 512, 280);

        // Bold Gold "23"
        cCtx.font = '900 340px "Arial Black", "Impact", sans-serif';
        cCtx.strokeStyle = '#000000';
        cCtx.lineWidth = 46;
        cCtx.lineJoin = 'round';
        cCtx.strokeText('23', 512, 630);
        cCtx.fillStyle = goldGrad;
        cCtx.fillText('23', 512, 630);

        cCtx.strokeStyle = '#fff8d1';
        cCtx.lineWidth = 9;
        cCtx.strokeText('23', 512, 630);

      } else if (charType === 'keeper') {
        // Soft feathered radial oval of green that covers the old scribble seamlessly
        const patch = cCtx.createRadialGradient(512, 310, 40, 512, 310, 440);
        patch.addColorStop(0, '#00d64f');
        patch.addColorStop(0.78, '#00cc4a');
        patch.addColorStop(0.92, '#00b842');
        patch.addColorStop(1, 'rgba(0, 184, 66, 0.0)');
        cCtx.fillStyle = patch;
        cCtx.beginPath();
        cCtx.ellipse(512, 310, 450, 430, 0, 0, Math.PI * 2);
        cCtx.fill();

        cCtx.textAlign = 'center';
        cCtx.textBaseline = 'middle';

        // Tech Shield Crest
        const crX = 512, crY = 280;
        cCtx.fillStyle = '#081726';
        cCtx.strokeStyle = '#ffffff';
        cCtx.lineWidth = 18;
        cCtx.beginPath();
        cCtx.moveTo(crX - 110, crY - 140);
        cCtx.lineTo(crX + 110, crY - 140);
        cCtx.lineTo(crX + 110, crY + 50);
        cCtx.lineTo(crX, crY + 160);
        cCtx.lineTo(crX - 110, crY + 50);
        cCtx.closePath();
        cCtx.fill();
        cCtx.stroke();

        cCtx.strokeStyle = '#00ff66';
        cCtx.lineWidth = 6;
        cCtx.stroke();

        // Bold High-Tech "1" inside crest
        cCtx.font = '900 240px "Arial Black", "Impact", sans-serif';
        cCtx.fillStyle = '#00ff66';
        cCtx.strokeStyle = '#000000';
        cCtx.lineWidth = 26;
        cCtx.lineJoin = 'round';
        cCtx.strokeText('1', crX, crY + 10);
        cCtx.fillText('1', crX, crY + 10);

        // Lower Chest Number "1"
        cCtx.font = '900 320px "Arial Black", "Impact", sans-serif';
        cCtx.fillStyle = '#ffffff';
        cCtx.strokeStyle = '#081726';
        cCtx.lineWidth = 42;
        cCtx.lineJoin = 'round';
        cCtx.strokeText('1', 512, 670);
        cCtx.fillText('1', 512, 670);
      }

      // 4. High-Definition Back Decal (1024x1024)
      const backCvs = document.createElement('canvas');
      backCvs.width = 1024; backCvs.height = 1024;
      const bkCtx = backCvs.getContext('2d');

      bkCtx.textAlign = 'center';
      bkCtx.textBaseline = 'middle';

      if (charType === 'footy') {
        const bBg = bkCtx.createRadialGradient(512, 512, 100, 512, 512, 500);
        bBg.addColorStop(0, '#00c3e6');
        bBg.addColorStop(0.7, '#00bee4');
        bBg.addColorStop(0.92, '#00a8cc');
        bBg.addColorStop(1, 'rgba(0, 168, 204, 0.0)');
        bkCtx.fillStyle = bBg;
        bkCtx.fillRect(0, 0, 1024, 1024);

        // Player Name "FOOTY"
        bkCtx.font = '900 115px "Arial Black", "Trebuchet MS", sans-serif';
        bkCtx.strokeStyle = '#001a33';
        bkCtx.lineWidth = 26;
        bkCtx.lineJoin = 'round';
        bkCtx.strokeText('FOOTY', 512, 260);
        bkCtx.fillStyle = '#ffffff';
        bkCtx.fillText('FOOTY', 512, 260);

        // Giant "10"
        bkCtx.font = '900 420px "Arial Black", "Impact", sans-serif';
        bkCtx.strokeStyle = '#00142b';
        bkCtx.lineWidth = 48;
        bkCtx.lineJoin = 'round';
        bkCtx.strokeText('10', 512, 600);
        bkCtx.fillStyle = '#ffffff';
        bkCtx.fillText('10', 512, 600);

        bkCtx.strokeStyle = '#00f0ff';
        bkCtx.lineWidth = 10;
        bkCtx.strokeText('10', 512, 600);

      } else if (charType === 'hoops') {
        const bBg = bkCtx.createRadialGradient(512, 512, 100, 512, 512, 500);
        bBg.addColorStop(0, '#0a0a0c');
        bBg.addColorStop(0.7, '#08080a');
        bBg.addColorStop(0.92, '#060608');
        bBg.addColorStop(1, 'rgba(6, 6, 8, 0.0)');
        bkCtx.fillStyle = bBg;
        bkCtx.fillRect(0, 0, 1024, 1024);

        const goldGrad = bkCtx.createLinearGradient(0, 180, 0, 850);
        goldGrad.addColorStop(0, '#fff9d6');
        goldGrad.addColorStop(0.3, '#f5c542');
        goldGrad.addColorStop(0.7, '#c9850c');
        goldGrad.addColorStop(1, '#663b00');

        bkCtx.font = '900 115px "Arial Black", "Trebuchet MS", sans-serif';
        bkCtx.strokeStyle = '#000000';
        bkCtx.lineWidth = 28;
        bkCtx.lineJoin = 'round';
        bkCtx.strokeText('CITIZEN', 512, 260);
        bkCtx.fillStyle = goldGrad;
        bkCtx.fillText('CITIZEN', 512, 260);

        bkCtx.font = '900 420px "Arial Black", "Impact", sans-serif';
        bkCtx.strokeStyle = '#000000';
        bkCtx.lineWidth = 48;
        bkCtx.lineJoin = 'round';
        bkCtx.strokeText('23', 512, 600);
        bkCtx.fillStyle = goldGrad;
        bkCtx.fillText('23', 512, 600);

        bkCtx.strokeStyle = '#fff8d1';
        bkCtx.lineWidth = 10;
        bkCtx.strokeText('23', 512, 600);

      } else if (charType === 'keeper') {
        const bBg = bkCtx.createRadialGradient(512, 512, 100, 512, 512, 500);
        bBg.addColorStop(0, '#00d64f');
        bBg.addColorStop(0.7, '#00cc4a');
        bBg.addColorStop(0.92, '#00b842');
        bBg.addColorStop(1, 'rgba(0, 184, 66, 0.0)');
        bkCtx.fillStyle = bBg;
        bkCtx.fillRect(0, 0, 1024, 1024);

        bkCtx.font = '900 115px "Arial Black", "Trebuchet MS", sans-serif';
        bkCtx.strokeStyle = '#081726';
        bkCtx.lineWidth = 26;
        bkCtx.lineJoin = 'round';
        bkCtx.strokeText('KEEPER', 512, 260);
        bkCtx.fillStyle = '#ffffff';
        bkCtx.fillText('KEEPER', 512, 260);

        bkCtx.font = '900 440px "Arial Black", "Impact", sans-serif';
        bkCtx.strokeStyle = '#081726';
        bkCtx.lineWidth = 48;
        bkCtx.lineJoin = 'round';
        bkCtx.strokeText('1', 512, 600);
        bkCtx.fillStyle = '#ffffff';
        bkCtx.fillText('1', 512, 600);

        bkCtx.strokeStyle = '#00ff66';
        bkCtx.lineWidth = 10;
        bkCtx.strokeText('1', 512, 600);
      }

      // 5. WebGL UV-Space Projection Pass
      const glCvs = document.createElement('canvas');
      glCvs.width = W; glCvs.height = H;
      const gl = glCvs.getContext('webgl2', { antialias: false, preserveDrawingBuffer: true });

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
          gl_Position = vec4(aTexCoord.x * 2.0 - 1.0, 1.0 - aTexCoord.y * 2.0, 0.0, 1.0);
        }
      `;

      const fsSource = `#version 300 es
        precision highp float;

        in vec3 vPos;
        in vec3 vNormal;
        in vec2 vUV;

        uniform sampler2D uFaceDecal;
        uniform vec4 uFaceBounds;

        uniform sampler2D uChestDecal;
        uniform vec4 uChestBounds;

        uniform sampler2D uBackDecal;
        uniform vec4 uBackBounds;

        out vec4 fragColor;

        void main() {
          vec3 N = normalize(vNormal);
          vec4 outCol = vec4(0.0);

          // FRONT PROJECTION (N.z > 0.10)
          if (N.z > 0.10) {
            // Face
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

            // Chest
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

          // BACK PROJECTION (N.z < -0.15)
          if (N.z < -0.15) {
            if (vPos.x >= uBackBounds.x && vPos.x <= uBackBounds.y &&
                vPos.y >= uBackBounds.z && vPos.y <= uBackBounds.w &&
                vPos.z < -0.02) {
              // Back U is mirrored so text reads correctly from the back
              vec2 bUV = vec2(
                1.0 - (vPos.x - uBackBounds.x) / (uBackBounds.y - uBackBounds.x),
                1.0 - (vPos.y - uBackBounds.z) / (uBackBounds.w - uBackBounds.z)
              );
              vec4 col = texture(uBackDecal, bUV);
              float angleWeight = smoothstep(0.15, 0.45, -N.z);
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
      gl.uniform4f(gl.getUniformLocation(prg, 'uFaceBounds'), config.faceBounds[0], config.faceBounds[1], config.faceBounds[2], config.faceBounds[3]);

      createGLTex(chestCvs, 1);
      gl.uniform1i(gl.getUniformLocation(prg, 'uChestDecal'), 1);
      gl.uniform4f(gl.getUniformLocation(prg, 'uChestBounds'), config.chestBounds[0], config.chestBounds[1], config.chestBounds[2], config.chestBounds[3]);

      createGLTex(backCvs, 2);
      gl.uniform1i(gl.getUniformLocation(prg, 'uBackDecal'), 2);
      gl.uniform4f(gl.getUniformLocation(prg, 'uBackBounds'), config.chestBounds[0], config.chestBounds[1], config.chestBounds[2], config.chestBounds[3]);

      gl.viewport(0, 0, W, H);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.disable(gl.CULL_FACE);
      gl.disable(gl.DEPTH_TEST);

      gl.drawElements(gl.TRIANGLES, meshData.indices.length, gl.UNSIGNED_INT, 0);

      // 6. Composite into Base Canvas
      bCtx.drawImage(glCvs, 0, 0);

      return baseCvs.toDataURL('image/png');
    }, charType, meshData, baseB64, config);
  }

  // --- 1. FOOTY #10 ---
  console.log('\n[Projector] Processing Footy #10...');
  const footyMesh = loadMeshBuffers('assets/characters/footy10_raw_backup.glb');
  const footyB64 = fs.readFileSync('assets/characters/footy10_orig_texture.png').toString('base64');
  const footyConfig = {
    faceBounds: [-0.058, 0.038, 0.340, 0.468],
    chestBounds: [-0.078, 0.078, 0.055, 0.275],
    eyeRight: { x: 382, y: 328 },
    eyeLeft: { x: 672, y: 338 },
    nose: { x: 472, y: 520 },
    mouth: { x: 465, y: 650 }
  };
  const footyPngB64 = await runProjection('footy', footyMesh, footyB64, footyConfig);
  const footyBuf = Buffer.from(footyPngB64.replace(/^data:image\/png;base64,/, ''), 'base64');
  fs.writeFileSync('assets/characters/footy10_refined_texture.png', footyBuf);
  repackGLB('assets/characters/footy10_raw_backup.glb', footyBuf, 'assets/characters/footy10.glb');

  // --- 2. HOOPS #23 ---
  console.log('\n[Projector] Processing Hoops #23...');
  const hoopsMesh = loadMeshBuffers('assets/characters/hoops23_raw_backup.glb');
  const hoopsB64 = fs.readFileSync('assets/characters/hoops23_orig_texture.png').toString('base64');
  const hoopsConfig = {
    faceBounds: [-0.055, 0.050, 0.340, 0.470],
    chestBounds: [-0.082, 0.082, 0.055, 0.275],
    eyeRight: { x: 335, y: 395 },
    eyeLeft: { x: 685, y: 395 },
    nose: { x: 488, y: 575 },
    mouth: { x: 468, y: 705 }
  };
  const hoopsPngB64 = await runProjection('hoops', hoopsMesh, hoopsB64, hoopsConfig);
  const hoopsBuf = Buffer.from(hoopsPngB64.replace(/^data:image\/png;base64,/, ''), 'base64');
  fs.writeFileSync('assets/characters/hoops23_refined_texture.png', hoopsBuf);
  repackGLB('assets/characters/hoops23_raw_backup.glb', hoopsBuf, 'assets/characters/hoops23.glb');

  // --- 3. KEEPER #1 ---
  console.log('\n[Projector] Processing Keeper #1...');
  const keeperMesh = loadMeshBuffers('assets/characters/keeper1_raw_backup.glb');
  const keeperB64 = fs.readFileSync('assets/characters/keeper1_orig_texture.png').toString('base64');
  const keeperConfig = {
    faceBounds: [-0.060, 0.055, 0.340, 0.470],
    chestBounds: [-0.095, 0.095, 0.055, 0.275],
    eyeRight: { x: 330, y: 375 },
    eyeLeft: { x: 690, y: 375 },
    nose: { x: 520, y: 470 },
    mouth: { x: 512, y: 810 }
  };
  const keeperPngB64 = await runProjection('keeper', keeperMesh, keeperB64, keeperConfig);
  const keeperBuf = Buffer.from(keeperPngB64.replace(/^data:image\/png;base64,/, ''), 'base64');
  fs.writeFileSync('assets/characters/keeper1_refined_texture.png', keeperBuf);
  repackGLB('assets/characters/keeper1_raw_backup.glb', keeperBuf, 'assets/characters/keeper1.glb');

  await browser.close();
  console.log('\n=== All 3 Masterpiece Athletes Successfully Baked & Repacked! ===');
}

bakeMasterpieceAthletes().catch(err => {
  console.error(err);
  process.exit(1);
});
