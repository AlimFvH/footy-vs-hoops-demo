const fs = require('fs');

['footy10.glb', 'hoops23.glb', 'keeper1.glb'].forEach(name => {
  const buf = fs.readFileSync('assets/characters/' + name);
  const jsonLen = buf.readUInt32LE(12);
  const gltf = JSON.parse(buf.toString('utf8', 20, 20 + jsonLen));
  const binOffset = 20 + jsonLen + 8;
  const bin = buf.slice(binOffset);
  const bv = gltf.bufferViews[gltf.images[0].bufferView];
  const imgBuf = bin.slice(bv.byteOffset, bv.byteOffset + bv.byteLength);
  fs.writeFileSync('assets/characters/' + name.replace('.glb', '_final_texture.png'), imgBuf);
  console.log(`Saved ${name.replace('.glb', '_final_texture.png')}`);
});
