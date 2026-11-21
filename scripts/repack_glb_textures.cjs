const fs = require('fs');
const path = require('path');

function repackGLB(glbInPath, newPngPath, glbOutPath) {
  console.log(`Repacking ${glbInPath} with ${newPngPath}...`);
  const buf = fs.readFileSync(glbInPath);

  const magic = buf.readUInt32LE(0);
  const version = buf.readUInt32LE(4);
  const totalLength = buf.readUInt32LE(8);
  if (magic !== 0x46546C67) {
    throw new Error('Not a GLB file: ' + glbInPath);
  }

  // Chunk 0: JSON
  const chunk0Len = buf.readUInt32LE(12);
  const chunk0Type = buf.readUInt32LE(16);
  const jsonStr = buf.toString('utf8', 20, 20 + chunk0Len);
  const gltf = JSON.parse(jsonStr);

  // Chunk 1: BIN
  const chunk1Start = 20 + chunk0Len;
  const chunk1Len = buf.readUInt32LE(chunk1Start);
  const chunk1Type = buf.readUInt32LE(chunk1Start + 4);
  const binData = buf.subarray(chunk1Start + 8, chunk1Start + 8 + chunk1Len);

  // Find image bufferView
  const imgDef = gltf.images[0];
  const imgBvIndex = imgDef.bufferView;
  const imgBv = gltf.bufferViews[imgBvIndex];

  console.log(`Original image bufferView[${imgBvIndex}]: offset=${imgBv.byteOffset}, len=${imgBv.byteLength}`);

  const newPngBytes = fs.readFileSync(newPngPath);
  console.log(`New image size: ${newPngBytes.length} bytes`);

  // Pad newPngBytes to 4-byte boundary
  const padLength = (4 - (newPngBytes.length % 4)) % 4;
  const paddedPng = Buffer.concat([newPngBytes, Buffer.alloc(padLength, 0)]);

  const imgOffset = imgBv.byteOffset;
  const origImgLen = imgBv.byteLength;
  // Pad origImgLen to 4-byte boundary as it was in original BIN
  const origPaddedLen = (origImgLen + 3) & ~3;

  // Split original BIN: before image and after image
  const binBefore = binData.subarray(0, imgOffset);
  const binAfter = binData.subarray(imgOffset + origPaddedLen);

  const delta = paddedPng.length - origPaddedLen;
  console.log(`Binary size delta: ${delta} bytes`);

  // Update bufferViews that come after imgOffset
  imgBv.byteLength = newPngBytes.length;

  for (let i = 0; i < gltf.bufferViews.length; i++) {
    if (i !== imgBvIndex && gltf.bufferViews[i].byteOffset > imgOffset) {
      gltf.bufferViews[i].byteOffset += delta;
    }
  }

  // New binary buffer
  const newBinData = Buffer.concat([binBefore, paddedPng, binAfter]);
  gltf.buffers[0].byteLength = newBinData.length;

  // New JSON chunk padded with spaces (0x20) to 4 bytes
  let newJsonStr = JSON.stringify(gltf);
  const jsonPad = (4 - (Buffer.byteLength(newJsonStr) % 4)) % 4;
  newJsonStr += ' '.repeat(jsonPad);
  const newJsonBuf = Buffer.from(newJsonStr, 'utf8');

  // New BIN chunk padded with zeros to 4 bytes
  const binPad = (4 - (newBinData.length % 4)) % 4;
  const paddedNewBin = Buffer.concat([newBinData, Buffer.alloc(binPad, 0)]);

  // Build final GLB
  const newTotalLen = 12 + 8 + newJsonBuf.length + 8 + paddedNewBin.length;
  const outBuf = Buffer.alloc(newTotalLen);

  // Header
  outBuf.writeUInt32LE(0x46546C67, 0); // glTF
  outBuf.writeUInt32LE(2, 4);          // version 2
  outBuf.writeUInt32LE(newTotalLen, 8);

  // Chunk 0: JSON
  outBuf.writeUInt32LE(newJsonBuf.length, 12);
  outBuf.writeUInt32LE(0x4E4F534A, 16); // JSON
  newJsonBuf.copy(outBuf, 20);

  // Chunk 1: BIN
  const c1Pos = 20 + newJsonBuf.length;
  outBuf.writeUInt32LE(paddedNewBin.length, c1Pos);
  outBuf.writeUInt32LE(0x004E4942, c1Pos + 4); // BIN
  paddedNewBin.copy(outBuf, c1Pos + 8);

  fs.writeFileSync(glbOutPath, outBuf);
  console.log(`✓ Wrote ${glbOutPath} (${outBuf.length} bytes) successfully!`);
}

const athleteTextures = {
  footy10: 'assets/kits/footy_kit_classic.png',
  hoops23: 'assets/kits/hoops_kit_classic.png',
  keeper1: 'assets/characters/keeper1_refined_texture.png'
};

for (const athlete of ['footy10', 'hoops23', 'keeper1']) {
  const glbIn = `assets/characters/${athlete}.glb`;
  const refinedPng = athleteTextures[athlete] || `assets/characters/${athlete}_refined_texture.png`;
  const glbOut = `assets/characters/${athlete}.glb`;

  // Backup original first if not backed up
  const backup = `assets/characters/${athlete}_raw_backup.glb`;
  if (!fs.existsSync(backup)) {
    fs.copyFileSync(glbIn, backup);
    console.log(`Saved backup to ${backup}`);
  }

  repackGLB(backup, refinedPng, glbOut);
}
