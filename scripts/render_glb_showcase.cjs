const fs = require('fs');
const path = require('path');
const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const ARTIFACTS_DIR = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function renderShowcase() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const models = [
    { name: 'footy', file: 'footy10.glb', title: 'FOOTY #10' },
    { name: 'hoops', file: 'hoops23.glb', title: 'HOOPS #23' },
    { name: 'keeper', file: 'keeper1.glb', title: 'KEEPER #1' }
  ];

  for (const m of models) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1024, height: 1024 });

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <script src="https://unpkg.com/three@0.160.0/build/three.min.js"></script>
      <script src="https://unpkg.com/three@0.160.0/examples/js/loaders/GLTFLoader.js"></script>
      <style>
        body { margin: 0; background: #070913; overflow: hidden; font-family: sans-serif; }
        #badge {
          position: absolute; top: 20px; left: 20px;
          background: rgba(15, 23, 42, 0.85);
          color: #fff; padding: 10px 18px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.15);
          font-weight: 700; font-size: 16px;
        }
      </style>
    </head>
    <body>
      <div id="badge">${m.title} — Real 3D Model</div>
      <canvas id="cvs"></canvas>
      <script>
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, 1.0, 0.1, 100);
        camera.position.set(0, 0.95, 2.5);
        camera.lookAt(0, 0.95, 0);

        const renderer = new THREE.WebGLRenderer({
          canvas: document.getElementById('cvs'),
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true
        });
        renderer.setSize(1024, 1024);
        renderer.setClearColor(0x070913, 1);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;

        // Studio Lighting
        const hemi = new THREE.HemisphereLight(0xffffff, 0x334155, 1.2);
        scene.add(hemi);

        const keyLight = new THREE.DirectionalLight(0xfff5eb, 1.8);
        keyLight.position.set(1.5, 3.0, 2.5);
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.9);
        fillLight.position.set(-2.0, 1.5, 1.5);
        scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
        rimLight.position.set(0, 2.5, -2.5);
        scene.add(rimLight);

        // Platform
        const platGeo = new THREE.CylinderGeometry(1.2, 1.25, 0.05, 48);
        const platMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
        const plat = new THREE.Mesh(platGeo, platMat);
        plat.position.y = -0.025;
        scene.add(plat);

        const loader = new THREE.GLTFLoader();
        loader.load('http://localhost:8099/assets/characters/${m.file}', (gltf) => {
          const model = gltf.scene;

          // Adjust materials for crispness
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              if (child.material) {
                child.material.roughness = 0.55;
                child.material.metalness = 0.1;
                if (child.material.map) {
                  child.material.map.anisotropy = 16;
                  child.material.map.generateMipmaps = true;
                  child.material.map.minFilter = THREE.LinearMipmapLinearFilter;
                }
              }
            }
          });

          // Normalize size & center
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          // Target height ~1.85m
          const targetH = 1.85;
          const scale = targetH / (size.y || 1);
          model.scale.set(scale, scale, scale);

          const newBox = new THREE.Box3().setFromObject(model);
          const newCenter = newBox.getCenter(new THREE.Vector3());
          model.position.x -= newCenter.x;
          model.position.z -= newCenter.z;
          model.position.y -= newBox.min.y;

          scene.add(model);
          renderer.render(scene, camera);
          window.__RENDER_DONE = true;
          window.__MODEL_NODE = model;
          window.__RENDERER = renderer;
          window.__SCENE = scene;
          window.__CAMERA = camera;
        }, undefined, (err) => {
          window.__RENDER_ERR = err.toString();
        });
      </script>
    </body>
    </html>
    `;

    await page.setContent(html);
    await page.waitForFunction(() => window.__RENDER_DONE || window.__RENDER_ERR, { timeout: 20000 });

    const err = await page.evaluate(() => window.__RENDER_ERR);
    if (err) {
      console.error(`Error rendering ${m.name}:`, err);
    } else {
      // 1. Full Body Shot
      const fullPath = path.join(ARTIFACTS_DIR, `real3d_${m.name}_full.png`);
      await page.screenshot({ path: fullPath });
      console.log(`Saved ${fullPath}`);

      // 2. Face Close-up Shot
      await page.evaluate(() => {
        window.__CAMERA.position.set(0, 1.55, 0.95);
        window.__CAMERA.lookAt(0, 1.55, 0);
        window.__RENDERER.render(window.__SCENE, window.__CAMERA);
      });
      await new Promise(r => setTimeout(r, 200));
      const facePath = path.join(ARTIFACTS_DIR, `real3d_${m.name}_face.png`);
      await page.screenshot({ path: facePath });
      console.log(`Saved ${facePath}`);

      // 3. Three-Quarter Perspective Shot
      await page.evaluate(() => {
        window.__CAMERA.position.set(1.4, 1.15, 2.1);
        window.__CAMERA.lookAt(0, 0.95, 0);
        window.__RENDERER.render(window.__SCENE, window.__CAMERA);
      });
      await new Promise(r => setTimeout(r, 200));
      const threeqPath = path.join(ARTIFACTS_DIR, `real3d_${m.name}_threeq.png`);
      await page.screenshot({ path: threeqPath });
      console.log(`Saved ${threeqPath}`);
    }

    await page.close();
  }

  await browser.close();
  console.log('All real 3D model showcases successfully rendered!');
}

renderShowcase().catch(err => {
  console.error(err);
  process.exit(1);
});
