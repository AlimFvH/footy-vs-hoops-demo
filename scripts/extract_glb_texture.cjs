const fs = require('fs');
const path = require('path');

const glb = fs.readFileSync('C:/Users/ASUS/Downloads/sample.glb');
const jsonLen = glb.readUInt32LE(12);
const jsonStr = glb.toString('utf8', 20, 20 + jsonLen);
const gltf = JSON.parse(jsonStr);

const binStart = 20 + jsonLen + 8;
const imgBv = gltf.bufferViews[gltf.images[0].bufferView];
const imgOffset = binStart + (imgBv.byteOffset || 0);
const imgLen = imgBv.byteLength;

const imgBuf = glb.slice(imgOffset, imgOffset + imgLen);
const outPath = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/sample_extracted_texture.png';
fs.writeFileSync(outPath, imgBuf);
console.log('Saved extracted texture:', outPath, 'bytes:', imgBuf.length);
