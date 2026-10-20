const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

// CRC32 table
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(12 + len);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const typeAndData = buf.slice(4, 8 + len);
  buf.writeUInt32BE(crc32(typeAndData), 8 + len);
  return buf;
}

function encodePng(width, height, rgbaBuffer) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  
  const ihdr = makeChunk('IHDR', ihdrData);
  
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  let scanPos = 0;
  for (let y = 0; y < height; y++) {
    scanlines[scanPos++] = 0; // Filter 0 (None)
    rgbaBuffer.copy(scanlines, scanPos, y * width * 4, (y + 1) * width * 4);
    scanPos += width * 4;
  }
  
  const idat = makeChunk('IDAT', zlib.deflateSync(scanlines, { level: 9 }));
  const iend = makeChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([signature, ihdr, idat, iend]);
}

function decodePng(buffer) {
  let offset = 8;
  const idats = [];
  let width, height;
  while (offset < buffer.length) {
    const len = buffer.readUInt32BE(offset);
    const type = buffer.slice(offset + 4, offset + 8).toString('ascii');
    const data = buffer.slice(offset + 8, offset + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
    } else if (type === 'IDAT') {
      idats.push(data);
    }
    offset += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idats));
  const bpp = 4;
  const stride = width * bpp;
  const pixels = Buffer.alloc(width * height * 4);
  let rawPos = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[rawPos++];
    const lineStart = y * stride;
    const prevLineStart = (y - 1) * stride;
    for (let x = 0; x < stride; x++) {
      const byte = raw[rawPos++];
      const a = (x >= bpp) ? pixels[lineStart + x - bpp] : 0;
      const b = (y > 0) ? pixels[prevLineStart + x] : 0;
      const c = (y > 0 && x >= bpp) ? pixels[prevLineStart + x - bpp] : 0;
      let val = byte;
      if (filter === 1) val = (byte + a) & 0xff;
      else if (filter === 2) val = (byte + b) & 0xff;
      else if (filter === 3) val = (byte + Math.floor((a + b) / 2)) & 0xff;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        const pr = (pa <= pb && pa <= pc) ? a : (pb <= pc) ? b : c;
        val = (byte + pr) & 0xff;
      }
      pixels[lineStart + x] = val;
    }
  }
  return { width, height, pixels };
}

// 1. Load source image
const srcPath = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/.user_uploaded/media_1792132546418_6f7a03ed.png';
const { width, height, pixels } = decodePng(fs.readFileSync(srcPath));

// Circle parameters for the main ball
const cx = 513.5, cy = 445, r = 232.0;

function distToBladeLine(x, y) {
  const x1 = 586, y1 = 171, x2 = 430, y2 = 698;
  const num = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1);
  const den = Math.sqrt((y2 - y1)**2 + (x2 - x1)**2);
  return num / den;
}

// Crop boundaries of the symbol
const minX = 280, maxX = 748;
const minY = 168, maxY = 702;
const symbolW = maxX - minX + 1; // 469
const symbolH = maxY - minY + 1; // 535

// Create a square transparent canvas centered around the symbol
const outSize = 540;
const outBuf = Buffer.alloc(outSize * outSize * 4, 0); // initial 0 = transparent

const offsetX = Math.floor((outSize - symbolW) / 2);
const offsetY = Math.floor((outSize - symbolH) / 2);

for (let sy = minY; sy <= maxY; sy++) {
  for (let sx = minX; sx <= maxX; sx++) {
    const sIdx = (sy * width + sx) * 4;
    const rVal = pixels[sIdx];
    const gVal = pixels[sIdx + 1];
    const bVal = pixels[sIdx + 2];
    
    const targetX = offsetX + (sx - minX);
    const targetY = offsetY + (sy - minY);
    const targetIdx = (targetY * outSize + targetX) * 4;
    
    const distC = Math.sqrt((sx - cx)**2 + (sy - cy)**2);
    
    if (distC <= r - 1.0) {
      // Solidly inside the ball: preserve original authentic graphic pixels
      outBuf[targetIdx] = rVal;
      outBuf[targetIdx + 1] = gVal;
      outBuf[targetIdx + 2] = bVal;
      outBuf[targetIdx + 3] = 255;
    } else if (distC <= r + 1.8) {
      // Circular rim border anti-aliasing
      const edgeFactor = Math.max(0, Math.min(1, (r + 1.8 - distC) / 2.8));
      const maxCol = Math.max(rVal, gVal, bVal);
      // If pixel was black background at edge, fade alpha out
      const alpha = Math.round(edgeFactor * (maxCol > 20 ? 255 : 0));
      outBuf[targetIdx] = rVal;
      outBuf[targetIdx + 1] = gVal;
      outBuf[targetIdx + 2] = bVal;
      outBuf[targetIdx + 3] = alpha;
    } else {
      // Outside the main circle:
      // Check if it belongs to the white blade that extends top and bottom
      const distBlade = distToBladeLine(sx, sy);
      const isBladeY = (sy >= 169 && sy <= 700);
      const brightness = Math.max(rVal, gVal, bVal);
      
      if (isBladeY && distBlade <= 14 && brightness > 25) {
        // Tapered blade tip anti-aliasing
        const alpha = Math.min(255, Math.round(brightness * 1.08));
        outBuf[targetIdx] = 255;
        outBuf[targetIdx + 1] = 255;
        outBuf[targetIdx + 2] = 255;
        outBuf[targetIdx + 3] = alpha;
      } else {
        // 100% transparent background outside symbol
        outBuf[targetIdx] = 0;
        outBuf[targetIdx + 1] = 0;
        outBuf[targetIdx + 2] = 0;
        outBuf[targetIdx + 3] = 0;
      }
    }
  }
}

const outPng = encodePng(outSize, outSize, outBuf);

// Save outputs
fs.writeFileSync('assets/emblem.png', outPng);
fs.writeFileSync('assets/official_emblem.png', outPng);
const artifactPath = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/screenshot_emblem_isolated.png';
fs.writeFileSync(artifactPath, outPng);

console.log('✓ Clean transparent emblem saved:');
console.log('  assets/emblem.png (' + outPng.length + ' bytes, 540x540 square)');
console.log('  assets/official_emblem.png (' + outPng.length + ' bytes)');
console.log('  Artifact saved to:', artifactPath);
