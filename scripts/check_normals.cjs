const fs = require('fs');
const loader = require('../assets/loaders/glb_loader.js');

['assets/characters/footy10.glb', 'assets/characters/hoops23.glb', 'assets/characters/keeper1.glb'].forEach(f => {
  const buf = fs.readFileSync(f);
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  const parsed = loader.parseGLBContainer(ab);
  const prim = parsed.gltf.meshes[0].primitives[0];
  console.log(f, 'attributes:', prim.attributes);
});
