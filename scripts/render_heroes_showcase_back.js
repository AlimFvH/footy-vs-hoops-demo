const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const fs = require('fs');

async function renderShowcaseBack() {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 700 });

  const html = `
    <!DOCTYPE html>
    <html><head>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
      <style>body { margin:0; background: #0a0e17; overflow:hidden; }</style>
    </head>
    <body>
    <canvas id="c" width="1200" height="700"></canvas>
    <script>
      const canvas = document.getElementById('c');
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      renderer.setSize(1200, 700);
      renderer.outputEncoding = THREE.sRGBEncoding;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0e17);

      const camera = new THREE.PerspectiveCamera(38, 1200 / 700, 0.1, 100);
      camera.position.set(0, 1.25, 3.6);

      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 1.4);
      scene.add(hemiLight);

      const dirLight = new THREE.DirectionalLight(0xfff5e6, 1.6);
      dirLight.position.set(2, 5, 4);
      scene.add(dirLight);

      const loader = new THREE.GLTFLoader();
      const models = [
        { url: '/assets/characters/footy10.glb', x: -0.9, anim: 'celebrate', time: 0.5, rot: Math.PI },
        { url: '/assets/characters/hoops23.glb', x: 0.0, anim: 'idle', time: 0.2, rot: Math.PI },
        { url: '/assets/characters/keeper1.glb', x: 0.9, anim: 'idle', time: 0.2, rot: Math.PI }
      ];

      let loaded = 0;
      models.forEach(m => {
        loader.load(m.url, (gltf) => {
          const model = gltf.scene;
          model.position.set(m.x, 0, 0);
          model.rotation.y = m.rot;
          scene.add(model);

          if (gltf.animations && gltf.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(model);
            const clip = gltf.animations.find(a => a.name === m.anim) || gltf.animations[0];
            mixer.clipAction(clip).play();
            mixer.update(m.time);
          }

          loaded++;
          if (loaded === models.length) {
            renderer.render(scene, camera);
            window.__SHOWCASE_BACK_DONE__ = true;
          }
        });
      });
    </script>
    </body></html>
  `;

  fs.writeFileSync('scratch/showcase_back.html', html);
  await page.goto('http://127.0.0.1:8099/scratch/showcase_back.html');
  await page.waitForFunction(() => window.__SHOWCASE_BACK_DONE__ === true, { timeout: 15000 });
  await page.screenshot({ path: 'scratch/heroes_3d_showcase_back.png' });
  console.log('Saved scratch/heroes_3d_showcase_back.png');
  await browser.close();
}

renderShowcaseBack().catch(console.error);
