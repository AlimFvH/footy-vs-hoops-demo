const fs = require('fs');
const path = require('path');
const glbLoader = require('../assets/loaders/glb_loader.js');

function repackGLBWithTexture(glbPath, atlasPath) {
  const glbBuf = fs.readFileSync(glbPath);
  const atlasBuf = fs.readFileSync(atlasPath);
  const { gltf, bin } = glbLoader.parseGLBContainer(glbBuf.buffer);

  const imgDef = gltf.images[0];
  const bv = gltf.bufferViews[imgDef.bufferView];

  // 4-byte align atlas
  const pad = (4 - (atlasBuf.length % 4)) % 4;
  const paddedAtlas = pad > 0 ? Buffer.concat([atlasBuf, Buffer.alloc(pad)]) : atlasBuf;

  const binPrefix = Buffer.from(bin.slice(0, bv.byteOffset));
  const newBin = Buffer.concat([binPrefix, paddedAtlas]);

  bv.byteLength = atlasBuf.length;
  gltf.buffers[0].byteLength = newBin.length;

  // Make sure all primitives have roughness & metallic calibrated for Pixar/Fortnite look
  if (gltf.materials) {
    gltf.materials.forEach(mat => {
      if (!mat.pbrMetallicRoughness) mat.pbrMetallicRoughness = {};
      mat.pbrMetallicRoughness.baseColorFactor = [1, 1, 1, 1];
      mat.pbrMetallicRoughness.roughnessFactor = 0.55;
      mat.pbrMetallicRoughness.metallicFactor = 0.08;
    });
  }

  const jsonStr = JSON.stringify(gltf);
  const jsonBuf = Buffer.from(jsonStr, 'utf8');
  const jsonPad = (4 - (jsonBuf.length % 4)) % 4;
  const paddedJson = jsonPad > 0 ? Buffer.concat([jsonBuf, Buffer.alloc(jsonPad, 0x20)]) : jsonBuf;

  const totalLen = 12 + 8 + paddedJson.length + 8 + newBin.length;
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546C67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(totalLen, 8);

  const c0Header = Buffer.alloc(8);
  c0Header.writeUInt32LE(paddedJson.length, 0);
  c0Header.writeUInt32LE(0x4E4F534A, 4);

  const c1Header = Buffer.alloc(8);
  c1Header.writeUInt32LE(newBin.length, 0);
  c1Header.writeUInt32LE(0x004E4942, 4);

  const finalGLB = Buffer.concat([header, c0Header, paddedJson, c1Header, newBin]);

  // Backup original
  const backupPath = path.resolve('archive/dev_assets', path.basename(glbPath, '.glb') + '_backup_before_atlas.glb');
  fs.copyFileSync(glbPath, backupPath);

  fs.writeFileSync(glbPath, finalGLB);
  console.log(`✓ Repacked ${glbPath} (embedded ${atlasPath}, new size: ${finalGLB.length} bytes)`);
}

repackGLBWithTexture('assets/characters/footy10.glb', 'assets/characters/footy10_atlas.png');
repackGLBWithTexture('assets/characters/hoops23.glb', 'assets/characters/hoops23_atlas.png');
console.log('Both GLB models successfully repacked with new 3D texture atlases!');
