const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const fs = require('fs');
const path = require('path');

async function buildHeroes() {
  console.log('Launching browser to bake 3D hero models...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 800 });

  page.on('console', msg => console.log('PAGE:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.toString()));

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/exporters/GLTFExporter.js"></script>
    </head>
    <body>
    <script>
      window.__HEROES_DONE__ = false;

      function createShirtTexture(type) {
        const cvs = document.createElement('canvas');
        cvs.width = 2048;
        cvs.height = 1024;
        const ctx = cvs.getContext('2d');
        const W = cvs.width, H = cvs.height;

        if (type === 'footy') {
          // --- FOOTY #10 (White & Vibrant Orange Striker) ---
          // Background: Crisp modern white
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, W, H);

          // Front (0 to 1024): Modern geometric energetic orange & cyan stripes
          const fGrad = ctx.createLinearGradient(0, 0, W * 0.5, H);
          fGrad.addColorStop(0, '#ff6b00');
          fGrad.addColorStop(1, '#ff8800');
          ctx.fillStyle = fGrad;

          // Diagonal energetic chevron slashes
          ctx.beginPath();
          ctx.moveTo(W * 0.08, 0); ctx.lineTo(W * 0.22, 0); ctx.lineTo(W * 0.05, H); ctx.lineTo(0, H); ctx.fill();
          ctx.beginPath();
          ctx.moveTo(W * 0.38, 0); ctx.lineTo(W * 0.50, 0); ctx.lineTo(W * 0.42, H); ctx.lineTo(W * 0.30, H); ctx.fill();

          // Electric blue accent line
          ctx.strokeStyle = '#00f0ff';
          ctx.lineWidth = 14;
          ctx.beginPath();
          ctx.moveTo(W * 0.23, 0); ctx.lineTo(W * 0.06, H); ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(W * 0.37, 0); ctx.lineTo(W * 0.29, H); ctx.stroke();

          // Front chest emblem & text
          ctx.fillStyle = '#111827';
          ctx.font = '900 48px "Arial Black", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('FOOTY VS HOOPS', W * 0.25, H * 0.34);

          ctx.fillStyle = '#ff6b00';
          ctx.font = '900 130px "Arial Black", sans-serif';
          ctx.fillText('10', W * 0.25, H * 0.58);

          // Front crest
          ctx.beginPath();
          ctx.arc(W * 0.12, H * 0.22, 38, 0, Math.PI * 2);
          ctx.fillStyle = '#ff6b00';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 6;
          ctx.stroke();

          // Back (1024 to 2048): White with orange back panel
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(W * 0.5, 0, W * 0.5, H);

          ctx.fillStyle = '#ff6b00';
          ctx.fillRect(W * 0.5, 0, 24, H); // side stripe
          ctx.fillRect(W - 24, 0, 24, H);

          // Back Text "FOOTY"
          ctx.fillStyle = '#ff6b00';
          ctx.font = '900 64px "Arial Black", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('FOOTY', W * 0.75, H * 0.22);

          // Back Number "10"
          ctx.fillStyle = '#ff6b00';
          ctx.font = '900 240px "Arial Black", sans-serif';
          ctx.fillText('10', W * 0.75, H * 0.58);
          ctx.strokeStyle = '#111827';
          ctx.lineWidth = 10;
          ctx.strokeText('10', W * 0.75, H * 0.58);
        } else if (type === 'hoops') {
          // --- HOOPS #10 (Black, Electric Orange & Blue Basketball) ---
          ctx.fillStyle = '#0f172a'; // Deep charcoal/black
          ctx.fillRect(0, 0, W, H);

          // Front (0 to 1024): Orange & cyan brushstrokes
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.moveTo(W * 0.05, 0); ctx.lineTo(W * 0.20, 0); ctx.lineTo(W * 0.08, H); ctx.lineTo(0, H); ctx.fill();
          ctx.fillStyle = '#06b6d4';
          ctx.beginPath();
          ctx.moveTo(W * 0.35, 0); ctx.lineTo(W * 0.48, 0); ctx.lineTo(W * 0.42, H); ctx.lineTo(W * 0.28, H); ctx.fill();

          // Front text
          ctx.fillStyle = '#ffffff';
          ctx.font = '900 48px "Arial Black", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('FOOTY VS HOOPS', W * 0.25, H * 0.34);

          ctx.fillStyle = '#f97316';
          ctx.font = '900 130px "Arial Black", sans-serif';
          ctx.fillText('10', W * 0.25, H * 0.58);

          // Back (1024 to 2048): Black with vibrant orange "HOOPS" and "10"
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(W * 0.5, 0, W * 0.5, H);

          ctx.fillStyle = '#f97316';
          ctx.fillRect(W * 0.5, 0, 24, H);
          ctx.fillRect(W - 24, 0, 24, H);

          // Back Text "HOOPS"
          ctx.fillStyle = '#f97316';
          ctx.font = '900 70px "Arial Black", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('HOOPS', W * 0.75, H * 0.22);

          // Back Number "10"
          ctx.fillStyle = '#f97316';
          ctx.font = '900 240px "Arial Black", sans-serif';
          ctx.fillText('10', W * 0.75, H * 0.58);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 8;
          ctx.strokeText('10', W * 0.75, H * 0.58);
        } else if (type === 'keeper') {
          // --- KEEPER #1 (Neon Volt & Cyan Goalkeeper) ---
          ctx.fillStyle = '#10b981'; // Vibrant emerald/volt
          ctx.fillRect(0, 0, W, H);

          // Honeycomb / chevron pattern
          ctx.fillStyle = '#047857';
          for (let x = 0; x < W; x += 120) {
            ctx.fillRect(x, 0, 40, H);
          }

          // Front text
          ctx.fillStyle = '#0f172a';
          ctx.font = '900 50px "Arial Black", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('KEEPER', W * 0.25, H * 0.34);

          ctx.fillStyle = '#ffffff';
          ctx.font = '900 140px "Arial Black", sans-serif';
          ctx.fillText('1', W * 0.25, H * 0.58);

          // Back
          ctx.fillStyle = '#0f172a';
          ctx.font = '900 70px "Arial Black", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('KEEPER', W * 0.75, H * 0.22);

          ctx.fillStyle = '#ffffff';
          ctx.font = '900 250px "Arial Black", sans-serif';
          ctx.fillText('1', W * 0.75, H * 0.58);
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 10;
          ctx.strokeText('1', W * 0.75, H * 0.58);
        }

        return cvs;
      }

      function createShortsTexture(type) {
        const cvs = document.createElement('canvas');
        cvs.width = 1024;
        cvs.height = 512;
        const ctx = cvs.getContext('2d');
        const W = cvs.width, H = cvs.height;

        if (type === 'footy') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, W, H);
          ctx.fillStyle = '#ff6b00';
          ctx.fillRect(0, 0, 40, H);
          ctx.fillRect(W - 40, 0, 40, H);
          ctx.fillRect(0, H - 30, W, 30);
          // Number 10 on shorts
          ctx.fillStyle = '#ff6b00';
          ctx.font = '900 120px "Arial Black", sans-serif';
          ctx.fillText('10', W * 0.28, H * 0.65);
        } else if (type === 'hoops') {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, W, H);
          ctx.fillStyle = '#f97316';
          ctx.fillRect(0, 0, 40, H);
          ctx.fillRect(W - 40, 0, 40, H);
          ctx.fillStyle = '#06b6d4';
          ctx.fillRect(0, H - 30, W, 30);
          // Number 10 on shorts
          ctx.fillStyle = '#f97316';
          ctx.font = '900 120px "Arial Black", sans-serif';
          ctx.fillText('10', W * 0.28, H * 0.65);
        } else if (type === 'keeper') {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, W, H);
          ctx.fillStyle = '#10b981';
          ctx.fillRect(0, 0, 40, H);
          ctx.fillRect(W - 40, 0, 40, H);
          ctx.fillRect(0, H - 30, W, 30);
          // Number 1 on shorts
          ctx.fillStyle = '#10b981';
          ctx.font = '900 130px "Arial Black", sans-serif';
          ctx.fillText('1', W * 0.28, H * 0.65);
        }
        return cvs;
      }

      async function processAllHeroes() {
        const loader = new THREE.GLTFLoader();
        const exporter = new THREE.GLTFExporter();

        const heroes = ['footy', 'hoops', 'keeper'];
        window.__HERO_DATA__ = {};

        for (const hero of heroes) {
          await new Promise((resolve, reject) => {
            loader.load('http://127.0.0.1:8099/scratch/player-01.glb', (gltf) => {
              const model = gltf.scene;
              const shirtCvs = createShirtTexture(hero);
              const shortsCvs = createShortsTexture(hero);

              const shirtTex = new THREE.CanvasTexture(shirtCvs);
              shirtTex.flipY = false;
              shirtTex.encoding = THREE.sRGBEncoding;

              const shortsTex = new THREE.CanvasTexture(shortsCvs);
              shortsTex.flipY = false;
              shortsTex.encoding = THREE.sRGBEncoding;

              // Apply custom materials and textures to meshes
              model.traverse((child) => {
                if (child.isMesh && child.material) {
                  const mats = Array.isArray(child.material) ? child.material : [child.material];
                  mats.forEach(mat => {
                    const mName = mat.name || '';
                    if (mName === 'kit_shirt') {
                      mat.map = shirtTex;
                      mat.color.setHex(0xffffff);
                      mat.needsUpdate = true;
                    } else if (mName === 'kit_shorts') {
                      mat.map = shortsTex;
                      mat.color.setHex(0xffffff);
                      mat.needsUpdate = true;
                    } else if (mName === 'skin') {
                      if (hero === 'hoops') {
                        mat.color.setHex(0x784a28); // Athletic brown
                      } else {
                        mat.color.setHex(0xe8b896); // Fair athletic
                      }
                      mat.needsUpdate = true;
                    } else if (mName === 'kit_collar') {
                      mat.color.setHex(hero === 'footy' ? 0xff6b00 : (hero === 'hoops' ? 0xf97316 : 0x10b981));
                      mat.needsUpdate = true;
                    } else if (mName === 'kit_trim') {
                      mat.color.setHex(hero === 'footy' ? 0xff6b00 : (hero === 'hoops' ? 0x06b6d4 : 0x059669));
                      mat.needsUpdate = true;
                    } else if (mName === 'socks_solid') {
                      mat.color.setHex(hero === 'footy' ? 0xffffff : (hero === 'hoops' ? 0xffffff : 0x10b981));
                      mat.needsUpdate = true;
                    } else if (mName === 'kit_boots') {
                      mat.color.setHex(hero === 'footy' ? 0xff6b00 : (hero === 'hoops' ? 0x1e293b : 0x111827));
                      mat.needsUpdate = true;
                    }
                  });
                }
              });

              // Export as binary GLB
              exporter.parse(model, (glbArrayBuffer) => {
                // Convert ArrayBuffer to base64
                const bytes = new Uint8Array(glbArrayBuffer);
                let binary = '';
                const len = bytes.byteLength;
                const chunk = 8192;
                for (let i = 0; i < len; i += chunk) {
                  binary += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + chunk, len)));
                }
                const b64 = btoa(binary);
                window.__HERO_DATA__[hero] = b64;
                console.log('✓ Successfully baked ' + hero + ' GLB (' + len + ' bytes)');
                resolve();
              }, { binary: true, animations: gltf.animations });
            }, undefined, reject);
          });
        }

        window.__HEROES_DONE__ = true;
      }

      processAllHeroes().catch(console.error);
    </script>
    </body>
    </html>
  `;

  fs.writeFileSync('scratch/bake_heroes.html', html);
  console.log('Opening bake_heroes.html in browser...');
  await page.goto('http://127.0.0.1:8099/scratch/bake_heroes.html');

  // Wait for baking to complete
  await page.waitForFunction(() => window.__HEROES_DONE__ === true, { timeout: 30000 });

  const heroData = await page.evaluate(() => window.__HERO_DATA__);
  console.log('Saving GLB files...');

  const targets = {
    footy: 'assets/characters/footy10.glb',
    hoops: 'assets/characters/hoops23.glb',
    keeper: 'assets/characters/keeper1.glb'
  };

  for (const [key, b64] of Object.entries(heroData)) {
    const buf = Buffer.from(b64, 'base64');
    const targetPath = targets[key];
    fs.writeFileSync(targetPath, buf);
    console.log(`✓ Saved ${targetPath} (${buf.length} bytes)`);

    // Also backup to secondary workspace
    const altDir = 'C:/Users/ASUS/Desktop/FOOTY vs HOOPS/assets/characters';
    if (fs.existsSync(altDir)) {
      const altTarget = path.join(altDir, path.basename(targetPath));
      fs.writeFileSync(altTarget, buf);
      console.log(`✓ Synced to ${altTarget}`);
    }
  }

  await browser.close();
  console.log('All 3D hero models successfully generated and saved!');
}

buildHeroes().catch(console.error);
