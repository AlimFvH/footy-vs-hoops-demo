const fs = require('fs');
const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const loader = require('../assets/loaders/glb_loader.js');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

async function checkAlignment(name, glbPath, previewPath) {
  // 1. Get 3D mesh feature heights
  const buf = fs.readFileSync(glbPath);
  const parsed = loader.parseGLBContainer(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  const gltf = parsed.gltf;
  const bin = parsed.bin;
  const acc = gltf.accessors[gltf.meshes[0].primitives[0].attributes.POSITION];
  const bv = gltf.bufferViews[acc.bufferView];
  const pos = new Float32Array(bin, (bv.byteOffset||0) + (acc.byteOffset||0), acc.count * 3);

  // Find extremes and front-most points
  let minY = 1e9, maxY = -1e9;
  let maxZ = -1e9;
  let noseTipY = 0, noseTipZ = -1e9;
  let chinY = 0, chinZ = -1e9;

  for (let i = 0; i < pos.length / 3; i++) {
    const x = pos[i*3], y = pos[i*3+1], z = pos[i*3+2];
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    if (z > maxZ) maxZ = z;

    // Nose tip: near x=0, y ~ 0.38..0.43, front-most Z
    if (Math.abs(x) < 0.02 && y > 0.38 && y < 0.43) {
      if (z > noseTipZ) { noseTipZ = z; noseTipY = y; }
    }
    // Chin tip: near x=0, y ~ 0.33..0.37, front-most Z in lower face
    if (Math.abs(x) < 0.02 && y > 0.33 && y < 0.37) {
      if (z > chinZ) { chinZ = z; chinY = y; }
    }
  }

  console.log(`\n=== 3D Mesh: ${name} ===`);
  console.log(`Height: min=${minY.toFixed(4)}, max=${maxY.toFixed(4)}, span=${(maxY - minY).toFixed(4)}`);
  console.log(`Nose tip: y=${noseTipY.toFixed(4)}, z=${noseTipZ.toFixed(4)}`);
  console.log(`Chin tip: y=${chinY.toFixed(4)}, z=${chinZ.toFixed(4)}`);
}

async function run() {
  await checkAlignment('FOOTY #10', 'assets/characters/footy10_raw_backup.glb', 'assets/characters/footy10_preview.png');
  await checkAlignment('HOOPS #23', 'assets/characters/hoops23_raw_backup.glb', 'assets/characters/hoops23_preview.png');
  await checkAlignment('KEEPER #1', 'assets/characters/keeper1_raw_backup.glb', 'assets/characters/keeper1_preview.png');
}

run().catch(console.error);
