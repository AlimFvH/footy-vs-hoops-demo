const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

console.log('--- 1. Patching render/characters_glb.js ---');
const glbPath = path.join(ROOT, 'render/characters_glb.js');
let glb = fs.readFileSync(glbPath, 'utf8');

// a) Remove default skin bypass in getOrCreateSkinTexture
const skinBypassRegex = /const defSkin = isFooty \? 'skin_rookie' : 'skin_solar';\r?\n\s*if \(skin\.id === defSkin\) return null;[^\r\n]*/;
if (glb.match(skinBypassRegex)) {
  glb = glb.replace(skinBypassRegex, '');
  console.log('  Removed default skin bypass in getOrCreateSkinTexture');
} else {
  console.log('  Skin bypass already removed or not found');
}

// b) Update GLBCharacterInstance constructor cached model handling
const targetCacheCheck = /const cached = loader\.getCachedModel\(this\.modelUrl\);\r?\n\s*if \(cached\) \{\r?\n\s*this\.model = cached;\r?\n\s*this\.loaded = true;\r?\n\s*\}/;
const replaceCacheCheck = `const cached = loader.getCachedModel(this.modelUrl);
        if (cached) {
          this.model = cached;
          this.loaded = true;
          // Model is fully ready and drawn this frame: safely hide procedural mesh
          if (this.charRef && this.charRef.pivot) {
            this.charRef.pivot.visible = false;
          }
        }`;
if (glb.match(targetCacheCheck)) {
  glb = glb.replace(targetCacheCheck, replaceCacheCheck);
  console.log('  Patched cached model frame-0 mesh hiding');
} else {
  console.warn('  targetCacheCheck not matched');
}

// c) Calibrated scales
glb = glb.replace(/scale: 2\.22,/g, 'scale: 1.88,');
glb = glb.replace(/scale: 2\.25,/g, 'scale: 1.82,');
glb = glb.replace(/scale: 2\.35,/g, 'scale: 1.86,');
console.log('  Updated character scales to 1.82 - 1.88');

// d) Retry hook installation
const targetInstallHook = /if \(typeof window !== 'undefined'\) \{\r?\n\s*window\.CharactersGLB = CharactersGLB;\r?\n\s*if \(document\.readyState === 'loading'\) \{\r?\n\s*window\.addEventListener\('DOMContentLoaded', \(\) => setTimeout\(installHook, 50\)\);\r?\n\s*\} else \{\r?\n\s*setTimeout\(installHook, 50\);\r?\n\s*\}\r?\n\s*\}/;
const replaceInstallHook = `if (typeof window !== 'undefined') {
    window.CharactersGLB = CharactersGLB;
    let hookTries = 0;
    function tryHook() {
      installHook();
      if (++hookTries < 25) setTimeout(tryHook, 40);
    }
    tryHook();
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', tryHook);
    }
  }`;
if (glb.match(targetInstallHook)) {
  glb = glb.replace(targetInstallHook, replaceInstallHook);
  console.log('  Patched robust hook installer with retries');
} else {
  console.warn('  targetInstallHook not matched');
}

fs.writeFileSync(glbPath, glb, 'utf8');

console.log('--- 2. Patching js/game.js ---');
const gamePath = path.join(ROOT, 'js/game.js');
let game = fs.readFileSync(gamePath, 'utf8');

// a) Fix basketball follow camera distance and height
game = game.replace(/let followDist = isFooty \? 13\.5 : 7\.2;/, 'let followDist = isFooty ? 13.5 : 12.0;');
game = game.replace(/let followHeight = isFooty \? 5\.8 : 3\.8;/, 'let followHeight = isFooty ? 5.8 : 5.4;');
game = game.replace(/followDist \*= \(isFooty \? 1\.10 : 1\.05\);/, 'followDist *= (isFooty ? 1.08 : 1.12);');
game = game.replace(/followHeight \*= \(isFooty \? 1\.12 : 1\.05\);/, 'followHeight *= (isFooty ? 1.10 : 1.14);');
game = game.replace(/this\.cam\.fov = \(isFooty \? 48 : 46\);/, 'this.cam.fov = (isFooty ? 48 : 48);');
console.log('  Patched CameraRig hoops distance and height');

// b) MatchView constructor direct setup
const targetMvInit = /this\.scene\.shadow = \{ center: \[0, 0, 0\], radius: mode === 'footy' \? 20 : 15, distance: 50, strength: 0\.55 \};\r?\n\s*this\.rig\.update\(1, sim\.ball, sim\.human\);/;
const replaceMvInit = `this.scene.shadow = { center: [0, 0, 0], radius: mode === 'footy' ? 20 : 15, distance: 50, strength: 0.55 };
            this.rig.update(1, sim.ball, sim.human);
            if (typeof window !== 'undefined' && window.CharactersGLB) {
                try { window.CharactersGLB.setupMatch(this); } catch (e) {}
            }`;
if (game.match(targetMvInit)) {
  game = game.replace(targetMvInit, replaceMvInit);
  console.log('  Patched MatchView constructor CharactersGLB setup');
} else {
  console.warn('  targetMvInit not matched');
}

// c) MatchView render direct renderMatch
const targetMvRender = /s\.center = \[this\.rig\.cam\.target\[0\], 0, this\.rig\.cam\.target\[2\]\];\r?\n\s*this\.renderer\.render\(this\.scene, this\.rig\.cam\);/;
const replaceMvRender = `s.center = [this.rig.cam.target[0], 0, this.rig.cam.target[2]];
            this.renderer.render(this.scene, this.rig.cam);
            if (typeof window !== 'undefined' && window.CharactersGLB) {
                try { window.CharactersGLB.renderMatch(this, dt); } catch (e) {}
            }`;
if (game.match(targetMvRender)) {
  game = game.replace(targetMvRender, replaceMvRender);
  console.log('  Patched MatchView.prototype.render CharactersGLB call');
} else {
  console.warn('  targetMvRender not matched');
}

// d) MatchView dispose direct disposeMatch
const targetMvDispose = /dispose\(\) \{\r?\n\s*this\.disposed = true;/;
const replaceMvDispose = `dispose() {
            if (typeof window !== 'undefined' && window.CharactersGLB) {
                try { window.CharactersGLB.disposeMatch(this); } catch (e) {}
            }
            this.disposed = true;`;
if (game.match(targetMvDispose)) {
  game = game.replace(targetMvDispose, replaceMvDispose);
  console.log('  Patched MatchView.prototype.dispose CharactersGLB dispose');
} else {
  console.warn('  targetMvDispose not matched');
}

fs.writeFileSync(gamePath, game, 'utf8');

console.log('--- 3. Patching index.html ---');
const htmlPath = path.join(ROOT, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const oldScriptBlock = `  <script src="js/error-handler.js"></script>
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  <script src="js/module-loader.js"></script>
  <script src="js/game.js?v=3.2.0-fortnite-hyper"></script>
  <script src="assets/loaders/glb_loader.js?v=3.2.0-fortnite-hyper"></script>
  <script src="render/characters_glb.js?v=3.2.0-fortnite-hyper"></script>
  <script src="js/redesign.js?v=3.2.0-fortnite-hyper"></script>`;

const newScriptBlock = `  <script src="js/error-handler.js"></script>
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  <script src="js/module-loader.js"></script>
  <script src="assets/loaders/glb_loader.js?v=3.2.0-fortnite-hyper"></script>
  <script src="render/characters_glb.js?v=3.2.0-fortnite-hyper"></script>
  <script src="js/game.js?v=3.2.0-fortnite-hyper"></script>
  <script src="js/redesign.js?v=3.2.0-fortnite-hyper"></script>`;

if (html.includes(oldScriptBlock)) {
  html = html.replace(oldScriptBlock, newScriptBlock);
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log('  Patched index.html script loading order');
} else {
  console.log('  index.html already has new script order');
}

console.log('--- Patch complete! ---');
