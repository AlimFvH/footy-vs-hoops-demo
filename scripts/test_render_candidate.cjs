const fs = require('fs');
const path = require('path');
const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

async function testRender() {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 1000 });

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <script src="https://unpkg.com/three@0.160.0/build/three.min.js"></script>
    <script src="https://unpkg.com/three@0.160.0/examples/js/loaders/GLTFLoader.js"></script>
  </head>
  <body style="margin:0; background:#1e293b; overflow:hidden;">
    <canvas id="cvs"></canvas>
    <script>
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 800/1000, 0.1, 100);
      camera.position.set(0, 1.0, 2.5);
      camera.lookAt(0, 0.9, 0);

      const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('cvs'), antialias: true });
      renderer.setSize(800, 1000);
      renderer.setClearColor(0x1e293b);

      const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
      scene.add(hemi);
      const dir = new THREE.DirectionalLight(0xffffff, 1.5);
      dir.position.set(2, 4, 3);
      scene.add(dir);

      const loader = new THREE.GLTFLoader();
      loader.load('http://localhost:8099/archive/dev_assets/candidate_a_france.glb', (gltf) => {
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        model.position.sub(center);
        model.position.y += size.y / 2;
        scene.add(model);
        renderer.render(scene, camera);
        window.RENDER_DONE = true;
      }, undefined, (err) => {
        window.RENDER_ERR = err.toString();
      });
    </script>
  </body>
  </html>
  `;

  await page.setContent(html);
  await page.waitForFunction(() => window.RENDER_DONE || window.RENDER_ERR, { timeout: 20000 });
  const err = await page.evaluate(() => window.RENDER_ERR);
  if (err) {
    console.error('Render error:', err);
  } else {
    await page.screenshot({ path: 'test_cand_render.png' });
    console.log('Saved test_cand_render.png');
  }
  await browser.close();
}
testRender().catch(console.error);
