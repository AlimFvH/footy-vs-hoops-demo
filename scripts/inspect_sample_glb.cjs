const fs = require('fs');
const glb = fs.readFileSync('C:/Users/ASUS/Downloads/sample.glb');
const magic = glb.readUInt32LE(0);
const ver = glb.readUInt32LE(4);
const len = glb.readUInt32LE(8);
const jsonLen = glb.readUInt32LE(12);
const jsonType = glb.readUInt32LE(16);
const jsonStr = glb.toString('utf8', 20, 20 + jsonLen);
const gltf = JSON.parse(jsonStr);

console.log('GLB valid:', magic === 0x46546C67, 'ver:', ver, 'total len:', len);
console.log('Meshes count:', (gltf.meshes || []).length);
if (gltf.meshes) {
  gltf.meshes.forEach((m, i) => {
    console.log('Mesh ' + i + ': ' + (m.name || 'unnamed'));
    (m.primitives || []).forEach((p, pi) => {
      console.log('  Prim ' + pi + ' attributes:', Object.keys(p.attributes));
      if (p.indices !== undefined) {
        console.log('  Indices accessor:', p.indices);
      }
    });
  });
}
console.log('Images count:', (gltf.images || []).length);
if (gltf.images) console.log('Images:', gltf.images);
console.log('Materials count:', (gltf.materials || []).length);
if (gltf.materials) console.log('Materials:', JSON.stringify(gltf.materials, null, 2));
console.log('Skins count:', (gltf.skins || []).length);
console.log('Animations count:', (gltf.animations || []).length);
