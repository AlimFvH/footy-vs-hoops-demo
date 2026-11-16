const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const fs = require('fs');
const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

const html = `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/exporters/GLTFExporter.js"></script>
</head>
<body>
<script>
  function makeJersey(type) {
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 1024;
    const ctx = c.getContext('2d');

    let baseBg = '#ffffff';
    let primarySlash = '#ff7700';
    let secondarySlash = '#00c8ff';
    let textCol = '#0d1222';
    let numFront = '10';
    let nameBack = 'FOOTY';

    if (type === 'hoops') {
      baseBg = '#111420';
      primarySlash = '#ff6600';
      secondarySlash = '#00bbff';
      textCol = '#ffffff';
      numFront = '10';
      nameBack = 'HOOPS';
    } else if (type === 'keeper') {
      baseBg = '#22ee33';
      primarySlash = '#0b162a';
      secondarySlash = '#00b4d8';
      textCol = '#0b162a';
      numFront = '1';
      nameBack = 'KEEPER';
    }

    ctx.fillStyle = baseBg;
    ctx.fillRect(0, 0, 1024, 1024);

    // Front: Left half (0 to 512)
    ctx.fillStyle = primarySlash;
    ctx.beginPath();
    ctx.moveTo(320, 100); ctx.lineTo(440, 100); ctx.lineTo(260, 780); ctx.lineTo(140, 780);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = secondarySlash;
    ctx.beginPath();
    ctx.moveTo(100, 180); ctx.lineTo(200, 180); ctx.lineTo(380, 780); ctx.lineTo(280, 780);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = textCol;
    ctx.fillRect(0, 0, 512, 60); // collar
    ctx.font = '900 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FOOTY VS HOOPS', 256, 320);

    ctx.fillStyle = primarySlash;
    ctx.strokeStyle = textCol;
    ctx.lineWidth = 6;
    ctx.font = '900 120px sans-serif';
    ctx.strokeText(numFront, 256, 460);
    ctx.fillText(numFront, 256, 460);

    // Back: Right half (512 to 1024)
    ctx.fillStyle = primarySlash;
    ctx.beginPath();
    ctx.moveTo(512 + 150, 100); ctx.lineTo(512 + 270, 100); ctx.lineTo(512 + 390, 780); ctx.lineTo(512 + 270, 780);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = secondarySlash;
    ctx.beginPath();
    ctx.moveTo(512 + 380, 180); ctx.lineTo(512 + 480, 180); ctx.lineTo(512 + 200, 780); ctx.lineTo(512 + 100, 780);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = textCol;
    ctx.fillRect(512, 0, 512, 60);
    ctx.font = '900 48px sans-serif';
    ctx.fillText(nameBack, 512 + 256, 260);

    ctx.fillStyle = primarySlash;
    ctx.strokeStyle = textCol;
    ctx.lineWidth = 10;
    ctx.font = '900 180px sans-serif';
    ctx.strokeText(numFront, 512 + 256, 470);
    ctx.fillText(numFront, 512 + 256, 470);

    return c;
  }

  function makeShorts(type) {
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 1024;
    const ctx = c.getContext('2d');

    let baseBg = '#ffffff';
    let pCol = '#ff7700';
    let sCol = '#00c8ff';
    let textCol = '#0d1222';
    let num = '10';

    if (type === 'hoops') {
      baseBg = '#111420';
      pCol = '#ff6600';
      sCol = '#00bbff';
      textCol = '#ffffff';
      num = '10';
    } else if (type === 'keeper') {
      baseBg = '#22ee33';
      pCol = '#0b162a';
      sCol = '#00b4d8';
      textCol = '#0b162a';
      num = '1';
    }

    ctx.fillStyle = baseBg;
    ctx.fillRect(0, 0, 1024, 1024);

    ctx.fillStyle = pCol;
    ctx.fillRect(20, 200, 70, 700);
    ctx.fillRect(1024 - 90, 200, 70, 700);

    ctx.fillStyle = sCol;
    ctx.fillRect(90, 200, 30, 700);
    ctx.fillRect(1024 - 120, 200, 30, 700);

    ctx.fillStyle = textCol;
    ctx.font = '900 72px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(num, 250, 680);

    return c;
  }

  window.exportHero = async function(type) {
    const topImg = new Image();
    const shortsImg = new Image();

    await Promise.all([
      new Promise(r => { topImg.onload = r; topImg.src = makeJersey(type).toDataURL(); }),
      new Promise(r => { shortsImg.onload = r; shortsImg.src = makeShorts(type).toDataURL(); })
    ]);

    const loader = new THREE.GLTFLoader();
    return new Promise((resolve, reject) => {
      loader.load('/scratch/Remy.glb', (gltf) => {
        // Load animations from xbot or player-01 if available
        loader.load('/scratch/xbot.glb', (xbot) => {
          gltf.scene.traverse(o => {
            if (o.isMesh) {
              if (o.name === 'Tops') {
                o.material.map.image = topImg;
                o.material.map.needsUpdate = true;
              } else if (o.name === 'Bottoms') {
                o.material.map.image = shortsImg;
                o.material.map.needsUpdate = true;
              } else if (o.name === 'Hair') {
                if (type === 'footy') o.material.color = new THREE.Color(0xb05522);
                else if (type === 'hoops') o.material.color = new THREE.Color(0x181820);
                else if (type === 'keeper') o.material.color = new THREE.Color(0x332215);
              } else if (o.name === 'Shoes') {
                if (type === 'footy') o.material.color = new THREE.Color(0xff8822);
                else if (type === 'hoops') o.material.color = new THREE.Color(0x222228);
                else if (type === 'keeper') o.material.color = new THREE.Color(0x00c8ff);
              } else if (o.name === 'Body') {
                if (type === 'hoops') o.material.color = new THREE.Color(0x8a553a);
              }
            }
          });

          // Normalize scale to ~1.82m
          const s = 1.82 / 3.785;
          gltf.scene.scale.set(s, s, s);

          // Embed animations from xbot into gltf scene animations
          const animations = xbot.animations || [];

          const exporter = new THREE.GLTFExporter();
          exporter.parse(gltf.scene, (glbBuffer) => {
            resolve(glbBuffer);
          }, { binary: true, animations: animations });
        });
      }, undefined, reject);
    });
  };
</script>
</body>
</html>`;

fs.writeFileSync('scratch/build_release_heroes.html', html);

async function run() {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:8099/scratch/build_release_heroes.html');

  const heroes = [
    { type: 'footy', out: 'assets/characters/footy10.glb' },
    { type: 'hoops', out: 'assets/characters/hoops23.glb' },
    { type: 'keeper', out: 'assets/characters/keeper1.glb' }
  ];

  for (const h of heroes) {
    console.log('Building and exporting', h.type, 'to', h.out, '...');
    const b64 = await page.evaluate(async (type) => {
      const ab = await window.exportHero(type);
      const bytes = new Uint8Array(ab);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }, h.type);

    const buf = Buffer.from(b64, 'base64');
    fs.writeFileSync(h.out, buf);
    console.log('✓ Successfully exported', h.out, 'size:', buf.length);

    // Sync to secondary workspace
    const secPath = 'C:/Users/ASUS/Desktop/FOOTY vs HOOPS/' + h.out;
    fs.writeFileSync(secPath, buf);
  }

  await browser.close();
  console.log('All 3 release hero GLBs deployed & synced!');
}

run().catch(console.error);
