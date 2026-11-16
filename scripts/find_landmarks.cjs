const fs = require('fs');
const loader = require('../assets/loaders/glb_loader.js');
const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');

function get3DLandmarks(glbPath) {
  const buf = fs.readFileSync(glbPath);
  const parsed = loader.parseGLBContainer(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  const gltf = parsed.gltf;
  const bin = parsed.bin;
  const prim = gltf.meshes[0].primitives[0];
  const accPos = gltf.accessors[prim.attributes.POSITION];
  const bvPos = gltf.bufferViews[accPos.bufferView];
  const pos = new Float32Array(bin, bvPos.byteOffset, accPos.count * 3);

  // Find max Z along centerline (|x| < 0.015) in the head region (y > 0.28)
  // The nose tip is the local maximum in Z!
  // The chin is the lower protrusion (y ~ 0.30..0.33)
  // The mouth/lips is the indentation between nose and chin
  // The eye level is the indentation above the nose tip
  const centerVerts = [];
  for (let i = 0; i < accPos.count; i++) {
    const x = pos[i*3], y = pos[i*3+1], z = pos[i*3+2];
    if (Math.abs(x) < 0.018 && y > 0.25 && y < 0.48) {
      centerVerts.push({ y, z });
    }
  }
  centerVerts.sort((a,b) => b.y - a.y);

  // Group by y slice
  const step = 0.005;
  const slices = [];
  for (let y = 0.47; y >= 0.26; y -= step) {
    const pts = centerVerts.filter(p => Math.abs(p.y - y) < step * 0.5);
    if (pts.length > 0) {
      const maxZ = Math.max(...pts.map(p => p.z));
      slices.push({ y: Number(y.toFixed(3)), maxZ: Number(maxZ.toFixed(3)) });
    }
  }

  // Find nose tip (peak Z in upper half)
  let noseTip = slices.reduce((max, s) => (s.y > 0.34 && s.maxZ > max.maxZ ? s : max), { maxZ: -1 });

  return { noseTip, slices };
}

async function get2DLandmarks() {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();

  const chars = [
    { name: 'footy', path: 'assets/characters/footy10_preview.png', glb: 'assets/characters/footy10_raw_backup.glb' },
    { name: 'hoops', path: 'assets/characters/hoops23_preview.png', glb: 'assets/characters/hoops23_raw_backup.glb' },
    { name: 'keeper', path: 'assets/characters/keeper1_preview.png', glb: 'assets/characters/keeper1_raw_backup.glb' }
  ];

  for (let c of chars) {
    const l3d = get3DLandmarks(c.glb);
    const b64 = fs.readFileSync(c.path).toString('base64');
    const l2d = await page.evaluate(async (b64, isJpeg) => {
      const img = new Image();
      await new Promise(r => { img.onload = r; img.src = (isJpeg ? 'data:image/jpeg;base64,' : 'data:image/png;base64,') + b64; });
      const cvs = document.createElement('canvas'); cvs.width = img.width; cvs.height = img.height;
      const ctx = cvs.getContext('2d'); ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, img.width, img.height).data;
      
      // Find top of head (first non-bg pixel along center)
      const cx = Math.round(img.width / 2);
      let topY = 0, bottomY = img.height - 1;
      for (let y = 0; y < img.height; y++) {
        const idx = (y * img.width + cx) * 4;
        if (data[idx+3] > 50 || (data[idx] > 40 && data[idx+1] > 40)) {
          topY = y;
          break;
        }
      }
      return { w: img.width, h: img.height, topY };
    }, b64, c.path.endsWith('.png') ? false : true);

    console.log(`\n=== ${c.name.toUpperCase()} ===`);
    console.log('3D Nose tip peak:', l3d.noseTip);
    console.log('2D Image info:', l2d);
    console.log('3D Center Profile Slices (sample around nose):');
    console.table(l3d.slices.filter(s => s.y >= 0.30 && s.y <= 0.44));
  }

  await browser.close();
}

get2DLandmarks().catch(console.error);
