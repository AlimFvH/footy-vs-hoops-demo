const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const fs = require('fs');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

async function refineFooty() {
  console.log('=== Refining Footy #10 Crisp Texture ===');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 2048, height: 2048 });

  const b64Footy = fs.readFileSync('assets/characters/footy10_orig_texture.png').toString('base64');

  const refinedPngB64 = await page.evaluate(async (b64) => {
    const img = new Image();
    await new Promise(r => { img.onload = r; img.src = 'data:image/png;base64,' + b64; });

    const W = 2048, H = 2048;
    const cvs = document.createElement('canvas');
    cvs.width = W; cvs.height = H;
    const ctx = cvs.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, W, H);

    // 1. Unsharp Mask across entire atlas
    const blurCvs = document.createElement('canvas');
    blurCvs.width = W; blurCvs.height = H;
    const blurCtx = blurCvs.getContext('2d');
    blurCtx.filter = 'blur(2.5px)';
    blurCtx.drawImage(cvs, 0, 0);

    const origData = ctx.getImageData(0, 0, W, H);
    const blurData = blurCtx.getImageData(0, 0, W, H);
    const od = origData.data;
    const bd = blurData.data;
    const amount = 2.0;

    for (let i = 0; i < od.length; i += 4) {
      let r = od[i] + (od[i] - bd[i]) * amount;
      let g = od[i+1] + (od[i+1] - bd[i+1]) * amount;
      let b = od[i+2] + (od[i+2] - bd[i+2]) * amount;

      // Gentle contrast lift
      r = ((r / 255.0 - 0.5) * 1.10 + 0.5) * 255.0;
      g = ((g / 255.0 - 0.5) * 1.10 + 0.5) * 255.0;
      b = ((b / 255.0 - 0.5) * 1.10 + 0.5) * 255.0;

      od[i] = Math.min(255, Math.max(0, r));
      od[i+1] = Math.min(255, Math.max(0, g));
      od[i+2] = Math.min(255, Math.max(0, b));
    }
    ctx.putImageData(origData, 0, 0);

    // 2. Precision Crisp Detailing on Chest Island (in 2048x2048: x: 400..1200, y: 1000..1800)
    // Center of chest jersey is around x: 860, y: 1220
    const chestX = 860;
    const textY = 1180;
    const numY = 1320;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Clean Athletic Sponsor/Team Text "FOOTY"
    ctx.font = '900 68px "Arial Black", "Trebuchet MS", sans-serif';
    ctx.strokeStyle = '#002244';
    ctx.lineWidth = 14;
    ctx.lineJoin = 'round';
    ctx.strokeText('FOOTY', chestX, textY);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('FOOTY', chestX, textY);

    // Razor-Sharp Athletic Number "10"
    ctx.font = '900 140px "Arial Black", "Impact", sans-serif';
    ctx.strokeStyle = '#001a33';
    ctx.lineWidth = 22;
    ctx.lineJoin = 'round';
    ctx.strokeText('10', chestX, numY);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('10', chestX, numY);

    // Inner Cyan Accent Line
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 4.0;
    ctx.strokeText('10', chestX, numY);

    // Team Shield Crest on left chest
    const crestX = chestX + 160;
    const crestY = textY - 10;
    ctx.fillStyle = '#002b49';
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(crestX - 28, crestY - 30);
    ctx.lineTo(crestX + 28, crestY - 30);
    ctx.lineTo(crestX + 28, crestY + 12);
    ctx.quadraticCurveTo(crestX, crestY + 38, crestX - 28, crestY + 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('★', crestX, crestY - 40);

    ctx.restore();

    // 3. Precision Crisp Detailing on Face Island (in 2048x2048: x: 1400..1900, y: 400..900)
    // In crop_footy_face, eyes are located at:
    // Left eye (viewer's left): x: 1545, y: 565
    // Right eye (viewer's right): x: 1680, y: 565
    function drawSharpFootyEye(cx, cy, isLeft) {
      ctx.save();
      // White sclera
      ctx.fillStyle = '#f2ede4';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 26, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cyan-Blue Iris
      const irisX = cx + (isLeft ? 2 : -2);
      const irisR = 13;
      const grad = ctx.createRadialGradient(irisX, cy, 2, irisX, cy, irisR);
      grad.addColorStop(0, '#56b8e8');
      grad.addColorStop(0.6, '#1864ab');
      grad.addColorStop(1, '#0b2b4d');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(irisX, cy, irisR, 0, Math.PI * 2);
      ctx.fill();

      // Deep Black Pupil
      ctx.fillStyle = '#050a12';
      ctx.beginPath();
      ctx.arc(irisX, cy, 6, 0, Math.PI * 2);
      ctx.fill();

      // Specular Highlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(irisX + 3, cy - 3, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Upper Eyelash line
      ctx.strokeStyle = '#1a1008';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(cx - 28, cy);
      ctx.quadraticCurveTo(cx, cy - 18, cx + 28, cy);
      ctx.stroke();

      // Eyebrow
      ctx.strokeStyle = '#321c10';
      ctx.lineWidth = 7.0;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 32, cy - 26);
      ctx.quadraticCurveTo(cx, cy - 36, cx + 32, cy - 24);
      ctx.stroke();

      ctx.restore();
    }

    drawSharpFootyEye(1545, 565, true);
    drawSharpFootyEye(1680, 565, false);

    // Crisp defined lips
    const lipX = 1612;
    const lipY = 690;
    ctx.save();
    ctx.fillStyle = '#9e4a3f';
    ctx.beginPath();
    ctx.ellipse(lipX, lipY, 28, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4a1b15';
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.moveTo(lipX - 27, lipY);
    ctx.lineTo(lipX + 27, lipY);
    ctx.stroke();
    ctx.restore();

    return cvs.toDataURL('image/png');
  }, b64Footy);

  const b = Buffer.from(refinedPngB64.replace(/^data:image\/png;base64,/, ''), 'base64');
  fs.writeFileSync('assets/characters/footy10_refined_texture.png', b);
  console.log(`✓ Saved refined texture for footy10 (${b.length} bytes)`);

  // Repack footy10.glb
  const rawBuf = fs.readFileSync('assets/characters/footy10_raw_backup.glb');
  const jsonLen = rawBuf.readUInt32LE(12);
  const jsonStr = rawBuf.toString('utf8', 20, 20 + jsonLen);
  const gltf = JSON.parse(jsonStr);
  const binOffset = 20 + jsonLen + 8;
  const oldBin = rawBuf.slice(binOffset);

  const imgDef = gltf.images[0];
  const oldBv = gltf.bufferViews[imgDef.bufferView];

  const meshBytes = oldBin.slice(0, oldBv.byteOffset);
  const padLen = (4 - (b.length % 4)) % 4;
  const paddedImgBytes = Buffer.concat([b, Buffer.alloc(padLen)]);
  const newBin = Buffer.concat([meshBytes, paddedImgBytes]);

  oldBv.byteLength = b.length;
  gltf.buffers[0].byteLength = newBin.length;

  const newJsonBuf = Buffer.from(JSON.stringify(gltf), 'utf8');
  const jsonPad = (4 - (newJsonBuf.length % 4)) % 4;
  const paddedJson = Buffer.concat([newJsonBuf, Buffer.alloc(jsonPad, 0x20)]);

  const totalLen = 12 + 8 + paddedJson.length + 8 + newBin.length;
  const outHeader = Buffer.alloc(12);
  outHeader.write('glTF', 0);
  outHeader.writeUInt32LE(2, 4);
  outHeader.writeUInt32LE(totalLen, 8);

  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(paddedJson.length, 0);
  jsonHeader.write('JSON', 4);

  const binHeader = Buffer.alloc(8);
  binHeader.writeUInt32LE(newBin.length, 0);
  binHeader.write('BIN\0', 4);

  const finalGlb = Buffer.concat([outHeader, jsonHeader, paddedJson, binHeader, newBin]);
  fs.writeFileSync('assets/characters/footy10.glb', finalGlb);
  console.log(`✓ Repacked assets/characters/footy10.glb (${finalGlb.length} bytes)`);

  await browser.close();
}

refineFooty().catch(console.error);
