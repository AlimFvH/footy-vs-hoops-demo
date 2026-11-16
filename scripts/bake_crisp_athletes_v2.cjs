const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const fs = require('fs');

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

async function bakeCrispAthletes() {
  console.log('=== Baking Crisp High-Definition Athletes ===');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 2048, height: 2048 });

  // 1. HOOPS #23
  console.log('\n[Baker] Processing Hoops #23...');
  const b64Hoops = fs.readFileSync('assets/characters/hoops23_orig_texture.png').toString('base64');
  const hoopsPngB64 = await page.evaluate(async (b64) => {
    const img = new Image();
    await new Promise(r => { img.onload = r; img.src = 'data:image/png;base64,' + b64; });

    const W = 2048, H = 2048;
    const cvs = document.createElement('canvas');
    cvs.width = W; cvs.height = H;
    const ctx = cvs.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, W, H);

    // Two-stage Unsharp Mask
    // Stage 1: Fine edge sharpener (1.5px blur)
    const blur1 = document.createElement('canvas');
    blur1.width = W; blur1.height = H;
    const bCtx1 = blur1.getContext('2d');
    bCtx1.filter = 'blur(2px)';
    bCtx1.drawImage(cvs, 0, 0);

    const d1 = ctx.getImageData(0, 0, W, H);
    const bd1 = bCtx1.getImageData(0, 0, W, H).data;
    const data = d1.data;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i] + (data[i] - bd1[i]) * 2.4;
      let g = data[i+1] + (data[i+1] - bd1[i+1]) * 2.4;
      let b = data[i+2] + (data[i+2] - bd1[i+2]) * 2.4;

      // Contrast enhancement
      r = ((r / 255.0 - 0.5) * 1.14 + 0.5) * 255.0;
      g = ((g / 255.0 - 0.5) * 1.14 + 0.5) * 255.0;
      b = ((b / 255.0 - 0.5) * 1.14 + 0.5) * 255.0;

      data[i] = Math.min(255, Math.max(0, r));
      data[i+1] = Math.min(255, Math.max(0, g));
      data[i+2] = Math.min(255, Math.max(0, b));
    }
    ctx.putImageData(d1, 0, 0);

    // Precision Vector Polish on Hoops Chest:
    // In Hoops 2048x2048: Chest is at x: 40..420, y: 1480..1860, rotated 90 deg CCW
    // Center of chest patch: (240, 1680)
    ctx.save();
    ctx.translate(240, 1680);
    ctx.rotate(-Math.PI / 2); // Rotate to upright orientation!

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Metallic Gold Gradient
    const goldGrad = ctx.createLinearGradient(0, -90, 0, 90);
    goldGrad.addColorStop(0, '#fff6bd');
    goldGrad.addColorStop(0.35, '#f5c542');
    goldGrad.addColorStop(0.75, '#c9850c');
    goldGrad.addColorStop(1, '#6b3c00');

    // Sharp Gold "CITIZEN"
    ctx.font = '900 48px "Arial Black", "Trebuchet MS", sans-serif';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 12;
    ctx.lineJoin = 'round';
    ctx.strokeText('CITIZEN', 0, -55);
    ctx.fillStyle = goldGrad;
    ctx.fillText('CITIZEN', 0, -55);

    // Sharp Gold "23"
    ctx.font = '900 96px "Arial Black", "Impact", sans-serif';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 16;
    ctx.lineJoin = 'round';
    ctx.strokeText('23', 0, 25);
    ctx.fillStyle = goldGrad;
    ctx.fillText('23', 0, 25);

    // Inner gold accent
    ctx.strokeStyle = '#fff8d1';
    ctx.lineWidth = 2.5;
    ctx.strokeText('23', 0, 25);

    ctx.restore();

    return cvs.toDataURL('image/png');
  }, b64Hoops);

  const hoopsBuf = Buffer.from(hoopsPngB64.replace(/^data:image\/png;base64,/, ''), 'base64');
  fs.writeFileSync('assets/characters/hoops23_refined_texture.png', hoopsBuf);
  repackGLB('assets/characters/hoops23_raw_backup.glb', hoopsBuf, 'assets/characters/hoops23.glb');

  // 2. FOOTY #10
  console.log('\n[Baker] Processing Footy #10...');
  const b64Footy = fs.readFileSync('assets/characters/footy10_orig_texture.png').toString('base64');
  const footyPngB64 = await page.evaluate(async (b64) => {
    const img = new Image();
    await new Promise(r => { img.onload = r; img.src = 'data:image/png;base64,' + b64; });

    const W = 2048, H = 2048;
    const cvs = document.createElement('canvas');
    cvs.width = W; cvs.height = H;
    const ctx = cvs.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, W, H);

    // Two-stage Unsharp Mask
    const blur1 = document.createElement('canvas');
    blur1.width = W; blur1.height = H;
    const bCtx1 = blur1.getContext('2d');
    bCtx1.filter = 'blur(2px)';
    bCtx1.drawImage(cvs, 0, 0);

    const d1 = ctx.getImageData(0, 0, W, H);
    const bd1 = bCtx1.getImageData(0, 0, W, H).data;
    const data = d1.data;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i] + (data[i] - bd1[i]) * 2.4;
      let g = data[i+1] + (data[i+1] - bd1[i+1]) * 2.4;
      let b = data[i+2] + (data[i+2] - bd1[i+2]) * 2.4;

      r = ((r / 255.0 - 0.5) * 1.12 + 0.5) * 255.0;
      g = ((g / 255.0 - 0.5) * 1.12 + 0.5) * 255.0;
      b = ((b / 255.0 - 0.5) * 1.12 + 0.5) * 255.0;

      data[i] = Math.min(255, Math.max(0, r));
      data[i+1] = Math.min(255, Math.max(0, g));
      data[i+2] = Math.min(255, Math.max(0, b));
    }
    ctx.putImageData(d1, 0, 0);

    // Precision Vector Polish on Footy Chest:
    const chestX = 860;
    const textY = 1180;
    const numY = 1320;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Sharp "FOOTY"
    ctx.font = '900 64px "Arial Black", "Trebuchet MS", sans-serif';
    ctx.strokeStyle = '#002244';
    ctx.lineWidth = 14;
    ctx.lineJoin = 'round';
    ctx.strokeText('FOOTY', chestX, textY);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('FOOTY', chestX, textY);

    // Sharp "10"
    ctx.font = '900 136px "Arial Black", "Impact", sans-serif';
    ctx.strokeStyle = '#001a33';
    ctx.lineWidth = 20;
    ctx.lineJoin = 'round';
    ctx.strokeText('10', chestX, numY);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('10', chestX, numY);

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
    ctx.moveTo(crestX - 26, crestY - 28);
    ctx.lineTo(crestX + 26, crestY - 28);
    ctx.lineTo(crestX + 26, crestY + 12);
    ctx.quadraticCurveTo(crestX, crestY + 36, crestX - 26, crestY + 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('★', crestX, crestY - 38);

    ctx.restore();

    // Precision Eye Definition on Footy Face (x: 1545, 565) and (1680, 565)
    function drawSharpFootyEye(cx, cy, isLeft) {
      ctx.save();
      ctx.fillStyle = '#f2ede4';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 24, 13, 0, 0, Math.PI * 2);
      ctx.fill();

      const irisX = cx + (isLeft ? 2 : -2);
      const irisR = 12;
      const grad = ctx.createRadialGradient(irisX, cy, 2, irisX, cy, irisR);
      grad.addColorStop(0, '#56b8e8');
      grad.addColorStop(0.6, '#1864ab');
      grad.addColorStop(1, '#0b2b4d');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(irisX, cy, irisR, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#050a12';
      ctx.beginPath();
      ctx.arc(irisX, cy, 5.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(irisX + 3, cy - 3, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#1a1008';
      ctx.lineWidth = 4.0;
      ctx.beginPath();
      ctx.moveTo(cx - 26, cy);
      ctx.quadraticCurveTo(cx, cy - 16, cx + 26, cy);
      ctx.stroke();

      ctx.strokeStyle = '#321c10';
      ctx.lineWidth = 6.0;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy - 24);
      ctx.quadraticCurveTo(cx, cy - 34, cx + 30, cy - 22);
      ctx.stroke();

      ctx.restore();
    }

    drawSharpFootyEye(1545, 565, true);
    drawSharpFootyEye(1680, 565, false);

    return cvs.toDataURL('image/png');
  }, b64Footy);

  const footyBuf = Buffer.from(footyPngB64.replace(/^data:image\/png;base64,/, ''), 'base64');
  fs.writeFileSync('assets/characters/footy10_refined_texture.png', footyBuf);
  repackGLB('assets/characters/footy10_raw_backup.glb', footyBuf, 'assets/characters/footy10.glb');

  // 3. KEEPER #1
  console.log('\n[Baker] Processing Keeper #1...');
  const b64Keeper = fs.readFileSync('assets/characters/keeper1_orig_texture.png').toString('base64');
  const keeperPngB64 = await page.evaluate(async (b64) => {
    const img = new Image();
    await new Promise(r => { img.onload = r; img.src = 'data:image/png;base64,' + b64; });

    const W = 2048, H = 2048;
    const cvs = document.createElement('canvas');
    cvs.width = W; cvs.height = H;
    const ctx = cvs.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, W, H);

    // Two-stage Unsharp Mask
    const blur1 = document.createElement('canvas');
    blur1.width = W; blur1.height = H;
    const bCtx1 = blur1.getContext('2d');
    bCtx1.filter = 'blur(2px)';
    bCtx1.drawImage(cvs, 0, 0);

    const d1 = ctx.getImageData(0, 0, W, H);
    const bd1 = bCtx1.getImageData(0, 0, W, H).data;
    const data = d1.data;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i] + (data[i] - bd1[i]) * 2.4;
      let g = data[i+1] + (data[i+1] - bd1[i+1]) * 2.4;
      let b = data[i+2] + (data[i+2] - bd1[i+2]) * 2.4;

      r = ((r / 255.0 - 0.5) * 1.12 + 0.5) * 255.0;
      g = ((g / 255.0 - 0.5) * 1.12 + 0.5) * 255.0;
      b = ((b / 255.0 - 0.5) * 1.12 + 0.5) * 255.0;

      data[i] = Math.min(255, Math.max(0, r));
      data[i+1] = Math.min(255, Math.max(0, g));
      data[i+2] = Math.min(255, Math.max(0, b));
    }
    ctx.putImageData(d1, 0, 0);

    // Precision Vector Polish on Keeper Chest (x: 410, y: 1040 in 2048x2048)
    const chestX = 410;
    const chestY = 1040;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Tech Badge Shield
    ctx.fillStyle = '#081726';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(chestX - 55, chestY - 90);
    ctx.lineTo(chestX + 55, chestY - 90);
    ctx.lineTo(chestX + 55, chestY + 40);
    ctx.lineTo(chestX, chestY + 95);
    ctx.lineTo(chestX - 55, chestY + 40);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Bold Number "1"
    ctx.font = '900 135px "Arial Black", "Impact", sans-serif';
    ctx.fillStyle = '#00ff66';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 18;
    ctx.lineJoin = 'round';
    ctx.strokeText('1', chestX, chestY);
    ctx.fillText('1', chestX, chestY);

    ctx.restore();

    return cvs.toDataURL('image/png');
  }, b64Keeper);

  const keeperBuf = Buffer.from(keeperPngB64.replace(/^data:image\/png;base64,/, ''), 'base64');
  fs.writeFileSync('assets/characters/keeper1_refined_texture.png', keeperBuf);
  repackGLB('assets/characters/keeper1_raw_backup.glb', keeperBuf, 'assets/characters/keeper1.glb');

  await browser.close();
  console.log('\n=== All 3 Athletes Baked & Repacked Successfully! ===');
}

bakeCrispAthletes().catch(err => {
  console.error(err);
  process.exit(1);
});
