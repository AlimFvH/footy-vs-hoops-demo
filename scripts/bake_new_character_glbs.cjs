const fs = require('fs');
const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
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

async function main() {
  console.log('=== Baking High-Fidelity 3D GLBs with Front & Back Turnaround Detailing ===');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 2048, height: 2048 });

  // 1. FOOTY #10 (Striker)
  console.log('\n[Baker] Processing Footy Striker #10...');
  const footyTurnB64 = fs.readFileSync('assets/characters/footy_turnaround.jpg').toString('base64');
  const footyOrigB64 = fs.readFileSync('assets/characters/footy10_orig_texture.png').toString('base64');

  const footyBakedB64 = await page.evaluate(async (turnB64, origB64) => {
    function loadImg(b64) {
      return new Promise(r => {
        const img = new Image();
        img.onload = () => r(img);
        img.src = 'data:image/png;base64,' + b64;
      });
    }

    const origImg = await loadImg(origB64);
    const turnImg = await new Promise(r => {
      const img = new Image();
      img.onload = () => r(img);
      img.src = 'data:image/jpeg;base64,' + turnB64;
    });

    const W = 2048, H = 2048;
    const cvs = document.createElement('canvas');
    cvs.width = W; cvs.height = H;
    const ctx = cvs.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(origImg, 0, 0, W, H);

    // Front Chest at (890, 1260)
    ctx.save();
    const chestGrad = ctx.createRadialGradient(890, 1260, 40, 890, 1260, 220);
    chestGrad.addColorStop(0, '#ffffff');
    chestGrad.addColorStop(0.7, '#f4f7fb');
    chestGrad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = chestGrad;
    ctx.beginPath();
    ctx.ellipse(890, 1260, 220, 170, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.drawImage(turnImg, 45, 205, 160, 240, 770, 1140, 240, 240);
    ctx.restore();

    // Back Torso at (1330, 980) and (300, 1880)
    [ [1330, 980, 220, 160], [300, 1880, 220, 160] ].forEach(([bx, by, bw, bh]) => {
      ctx.save();
      // White jersey back base
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(bx, by, bw * 0.5, bh * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw turnaround jersey back artwork
      // Turnaround back jersey is at x: 505, y: 195, w: 180, h: 260
      ctx.drawImage(turnImg, 505, 195, 175, 250, bx - bw * 0.45, by - bh * 0.45, bw * 0.9, bh * 0.9);

      // Bold Squad Number "10"
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 68px "Arial Black", "Impact", sans-serif';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 14;
      ctx.lineJoin = 'round';
      ctx.strokeText('10', bx, by + 10);
      ctx.fillStyle = '#0f172a';
      ctx.fillText('10', bx, by + 10);

      // Blue & orange energy brush strokes
      ctx.strokeStyle = '#0070f3';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(bx - bw * 0.4, by + bh * 0.3); ctx.lineTo(bx - bw * 0.1, by - bh * 0.2);
      ctx.stroke();

      ctx.strokeStyle = '#ff6b00';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(bx + bw * 0.1, by + bh * 0.4); ctx.lineTo(bx + bw * 0.4, by - bh * 0.1);
      ctx.stroke();

      ctx.restore();
    });

    // Face & Auburn Hair
    ctx.save();
    ctx.fillStyle = '#9e431a';
    ctx.fillRect(1580, 500, 260, 140);

    const skinGrad = ctx.createRadialGradient(1700, 700, 20, 1700, 700, 100);
    skinGrad.addColorStop(0, '#fde2ce');
    skinGrad.addColorStop(0.7, '#f0be9b');
    skinGrad.addColorStop(1, '#df9f78');
    ctx.fillStyle = skinGrad;
    ctx.beginPath();
    ctx.arc(1700, 700, 95, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Shorts (White with orange/blue brush streaks and #10)
    ctx.save();
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(720, 1500, 360, 240);
    ctx.drawImage(turnImg, 45, 450, 165, 160, 730, 1505, 340, 230);
    ctx.restore();

    return cvs.toDataURL('image/png');
  }, footyTurnB64, footyOrigB64);

  const footyBuf = Buffer.from(footyBakedB64.replace(/^data:image\/png;base64,/, ''), 'base64');
  fs.writeFileSync('assets/characters/footy10_final_texture.png', footyBuf);
  repackGLB('assets/characters/footy10_raw_backup.glb', footyBuf, 'assets/characters/footy10.glb');

  // 2. HOOPS #10 (Basketball)
  console.log('\n[Baker] Processing Hoops Basketball #10...');
  const hoopsTurnB64 = fs.readFileSync('assets/characters/hoops_turnaround.jpg').toString('base64');
  const hoopsOrigB64 = fs.readFileSync('assets/characters/hoops23_orig_texture.png').toString('base64');

  const hoopsBakedB64 = await page.evaluate(async (turnB64, origB64) => {
    function loadImg(b64) {
      return new Promise(r => {
        const img = new Image();
        img.onload = () => r(img);
        img.src = 'data:image/png;base64,' + b64;
      });
    }

    const origImg = await loadImg(origB64);
    const turnImg = await new Promise(r => {
      const img = new Image();
      img.onload = () => r(img);
      img.src = 'data:image/jpeg;base64,' + turnB64;
    });

    const W = 2048, H = 2048;
    const cvs = document.createElement('canvas');
    cvs.width = W; cvs.height = H;
    const ctx = cvs.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(origImg, 0, 0, W, H);

    // Front Chest at (190, 1700), rotated -90 degrees
    ctx.save();
    ctx.translate(190, 1700);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#0b0c10';
    ctx.fillRect(-160, -140, 320, 280);
    ctx.drawImage(turnImg, 35, 195, 160, 230, -135, -125, 270, 250);
    ctx.restore();

    // Back Torso at (1270, 1050)
    ctx.save();
    ctx.fillStyle = '#0b0c10';
    ctx.beginPath();
    ctx.ellipse(1270, 1050, 180, 150, 0, 0, Math.PI * 2);
    ctx.fill();

    // Turnaround Back Jersey is at x: 575, y: 195, w: 160, h: 230
    ctx.drawImage(turnImg, 575, 195, 160, 230, 1170, 930, 200, 240);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 36px "Arial Black", sans-serif';
    ctx.fillStyle = '#ff6b00';
    ctx.fillText('HOOPS', 1270, 980);

    ctx.font = '900 84px "Arial Black", "Impact", sans-serif';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 14;
    ctx.lineJoin = 'round';
    ctx.strokeText('10', 1270, 1060);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('10', 1270, 1060);
    ctx.restore();

    // Skin & Hair
    ctx.save();
    ctx.fillStyle = '#181412';
    ctx.fillRect(1500, 300, 300, 200);

    ctx.fillStyle = '#6c4424';
    ctx.beginPath();
    ctx.arc(880, 520, 85, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    return cvs.toDataURL('image/png');
  }, hoopsTurnB64, hoopsOrigB64);

  const hoopsBuf = Buffer.from(hoopsBakedB64.replace(/^data:image\/png;base64,/, ''), 'base64');
  fs.writeFileSync('assets/characters/hoops23_final_texture.png', hoopsBuf);
  repackGLB('assets/characters/hoops23_raw_backup.glb', hoopsBuf, 'assets/characters/hoops23.glb');

  // 3. KEEPER #1 (Goalkeeper)
  console.log('\n[Baker] Processing Keeper Goalkeeper #1...');
  const keeperTurnB64 = fs.readFileSync('assets/characters/keeper_turnaround.jpg').toString('base64');
  const keeperOrigB64 = fs.readFileSync('assets/characters/keeper1_orig_texture.png').toString('base64');

  const keeperBakedB64 = await page.evaluate(async (turnB64, origB64) => {
    function loadImg(b64) {
      return new Promise(r => {
        const img = new Image();
        img.onload = () => r(img);
        img.src = 'data:image/png;base64,' + b64;
      });
    }

    const origImg = await loadImg(origB64);
    const turnImg = await new Promise(r => {
      const img = new Image();
      img.onload = () => r(img);
      img.src = 'data:image/jpeg;base64,' + turnB64;
    });

    const W = 2048, H = 2048;
    const cvs = document.createElement('canvas');
    cvs.width = W; cvs.height = H;
    const ctx = cvs.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(origImg, 0, 0, W, H);

    // Front Chest at x = 376, y = 960
    ctx.save();
    ctx.fillStyle = '#10b981';
    ctx.fillRect(376 - 130, 960 - 150, 260, 300);
    ctx.drawImage(turnImg, 35, 185, 160, 240, 376 - 120, 960 - 140, 240, 280);
    ctx.restore();

    // Back Torso at x = 400, y = 1020
    ctx.save();
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.ellipse(400, 1020, 160, 140, 0, 0, Math.PI * 2);
    ctx.fill();

    // Turnaround Back Jersey is at x: 570, y: 185, w: 160, h: 240
    ctx.drawImage(turnImg, 570, 185, 160, 240, 310, 910, 180, 220);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 88px "Arial Black", "Impact", sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('1', 400, 1030);
    ctx.restore();

    return cvs.toDataURL('image/png');
  }, keeperTurnB64, keeperOrigB64);

  const keeperBuf = Buffer.from(keeperBakedB64.replace(/^data:image\/png;base64,/, ''), 'base64');
  fs.writeFileSync('assets/characters/keeper1_final_texture.png', keeperBuf);
  repackGLB('assets/characters/keeper1_raw_backup.glb', keeperBuf, 'assets/characters/keeper1.glb');

  await browser.close();
  console.log('\n=== All 3 Character 3D GLBs Finished with Front & Back Turnaround Detailing! ===');
}

main().catch(console.error);
