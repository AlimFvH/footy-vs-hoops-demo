/**
 * FOOTY vs HOOPS — 3D Character Studio Application Controller
 */

(function() {
  'use strict';

  let G, scene, M, Renderer, Hero3D;
  let renderer, studioScene, studioCam;
  let footyChar = null, hoopsChar = null, keeperChar = null, currentChar = null;
  let activeCharType = 'footy';
  let activePose = 'idle';

  // Orbit Camera State
  let targetYaw = 0.65; // Start in 3/4 hero view!
  let curYaw = 0.65;
  let targetPitch = 0.12;
  let curPitch = 0.12;
  let targetDist = 3.6;
  let curDist = 3.6;
  let targetY = 1.15;
  let curY = 1.15;
  let autoSpin = true;

  // Interaction State
  let isDragging = false;
  let lastMouseX = 0, lastMouseY = 0;
  let animTime = 0;

  async function initStudio() {
    G = window.require('gfx/geometry');
    scene = window.require('gfx/scene');
    M = window.require('gfx/math');
    const renMod = window.require('gfx/renderer');
    Renderer = renMod.Renderer;
    Hero3D = window.HeroCharacters3D || window.require('render/hero_characters_3d');

    const canvas = document.getElementById('gl');
    renderer = new Renderer(canvas, { antialias: true, preserveDrawingBuffer: true });

    // 1. Create Studio Scene
    studioScene = scene.createScene();
    studioScene.sunDir = [0.35, 0.85, 0.5];
    studioScene.sunColor = [1.25, 1.20, 1.15];
    studioScene.sky = [0.12, 0.16, 0.26];
    studioScene.ground = [0.05, 0.06, 0.10];
    studioScene.fogAmount = 0; // Crisp studio look, zero fog obscuring models!

    // Studio Camera
    studioCam = new scene.Camera();
    studioCam.fov = 40;
    studioCam.near = 0.1;
    studioCam.far = 100;

    // 2. Studio Pedestal & Circular Stage
    const stageRoot = new scene.Node();

    // Dark sleek circular platform
    const platform = new scene.Node(G.cylinder(1.6, 1.7, 0.12, 36), scene.material({
      color: [0.05, 0.07, 0.12],
      spec: 0.6,
      shininess: 64,
      rim: 0.3,
      rimColor: [0.0, 0.9, 1.0],
      receiveShadow: true
    }));
    platform.setPos(0, -0.06, 0);
    stageRoot.add(platform);

    // Glowing Neon Ring Edge
    const neonRing = new scene.Node(G.ring(1.58, 1.62, 48), scene.material({
      color: [0.0, 0.9, 1.0],
      emissive: [0.0, 0.8, 1.0],
      unlit: true
    }));
    neonRing.rotation = [Math.PI / 2, 0, 0];
    neonRing.setPos(0, 0.005, 0);
    stageRoot.add(neonRing);

    // Soft Contact Shadow under athlete boots
    const shadowBlob = new scene.Node(G.plane(1.6, 1.6), scene.material({
      color: [0, 0, 0],
      alpha: 0.7,
      transparent: true,
      unlit: true,
      depthWrite: false
    }));
    shadowBlob.rotation = [-Math.PI / 2, 0, 0];
    shadowBlob.setPos(0, 0.01, 0);
    stageRoot.add(shadowBlob);

    studioScene.root.add(stageRoot);

    // 3. Build Characters (Load High-Definition 3D GLB Models)
    const emblemImg = document.getElementById('fvh-official-emblem');

    try {
      if (Hero3D.loadGLBHeroCharacter) {
        console.log('[Studio] Loading high-fidelity GLB models for Footy, Hoops & Keeper...');
        footyChar = await Hero3D.loadGLBHeroCharacter('footy', emblemImg);
        hoopsChar = await Hero3D.loadGLBHeroCharacter('hoops', emblemImg);
        keeperChar = await Hero3D.loadGLBHeroCharacter('keeper', emblemImg);
        console.log('✓ All 3 GLB Hero Models successfully mounted!');
      } else {
        throw new Error('Hero3D.loadGLBHeroCharacter not available');
      }
    } catch (err) {
      console.warn('[Studio] Fallback to procedural heroes:', err.message);
      if (!footyChar) footyChar = Hero3D.buildHeroCharacter('footy', emblemImg);
      if (!hoopsChar) hoopsChar = Hero3D.buildHeroCharacter('hoops', emblemImg);
      if (!keeperChar) keeperChar = Hero3D.buildHeroCharacter('keeper', emblemImg);
    }

    // Initial character: Footy #10
    currentChar = footyChar;
    studioScene.root.add(currentChar.root);

    // 4. Setup Input Handlers
    setupInput(canvas);

    // 5. Setup Window Resize
    window.addEventListener('resize', onResize);
    onResize();

    // 6. Start Render Loop
    requestAnimationFrame(renderLoop);

    // Expose Global Studio Controller for Puppeteer & Manual UI
    window.__STUDIO__ = {
      selectChar,
      setPresetAngle,
      zoomTarget,
      setPose,
      toggleSpin: window.toggleSpin,
      footyChar,
      hoopsChar,
      keeperChar,
      get ready() { return !!currentChar; }
    };

    console.log('✓ 3D Character Studio Initialized Successfully!');
  }

  function setupInput(canvas) {
    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      autoSpin = false;
      updateSpinBtn();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;

      targetYaw -= dx * 0.008;
      targetPitch += dy * 0.006;
      targetPitch = Math.max(-0.4, Math.min(0.7, targetPitch));
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    // Touch Support
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        lastMouseX = e.touches[0].clientX;
        lastMouseY = e.touches[0].clientY;
        autoSpin = false;
        updateSpinBtn();
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - lastMouseX;
      const dy = e.touches[0].clientY - lastMouseY;
      lastMouseX = e.touches[0].clientX;
      lastMouseY = e.touches[0].clientY;

      targetYaw -= dx * 0.008;
      targetPitch += dy * 0.006;
      targetPitch = Math.max(-0.4, Math.min(0.7, targetPitch));
    }, { passive: true });

    window.addEventListener('touchend', () => { isDragging = false; });

    // Zoom
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      targetDist += e.deltaY * 0.003;
      targetDist = Math.max(1.1, Math.min(6.5, targetDist));
    }, { passive: false });
  }

  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.resize(w, h, dpr);
    studioCam.aspect = w / h;
  }

  // --- Animation & Pose Application ---

  function applyAnimation(charObj, pose, t) {
    if (!charObj) return;

    if (charObj.isGLB) {
      // Continuous 3D GLB Character Breathing & Stance Motion
      const breath = Math.sin(t * 2.4) * 0.012;
      charObj.pivot.position[1] = breath;
      if (pose === 'action') {
        charObj.pivot.rotation[1] = Math.sin(t * 3.2) * 0.12;
        charObj.pivot.position[1] = Math.abs(Math.sin(t * 4.0)) * 0.05;
      } else if (pose === 'run') {
        charObj.pivot.position[1] = Math.abs(Math.sin(t * 5.5)) * 0.06;
        charObj.pivot.rotation[2] = Math.sin(t * 5.5) * 0.035;
      } else {
        charObj.pivot.rotation[1] = 0;
        charObj.pivot.rotation[2] = 0;
      }
      return;
    }

    if (pose === 'idle') {
      // Confident Athletic Breathing & Subtle Hero Stance
      const breath = Math.sin(t * 1.8) * 0.02;
      charObj.torso.position[1] = 1.38 + breath * 0.5;
      charObj.head.position[1] = 1.94 + breath * 0.6;
      charObj.head.rotation[0] = Math.sin(t * 1.2) * 0.02;

      // Relaxed arms with gentle athletic sway
      charObj.armL.rotation[0] = 0.08 + Math.sin(t * 1.5) * 0.03;
      charObj.armL.rotation[2] = 0.12; // Slight spread
      charObj.armR.rotation[0] = 0.08 - Math.sin(t * 1.5) * 0.03;
      charObj.armR.rotation[2] = -0.12;

      charObj.elbowL.rotation[0] = -0.15;
      charObj.elbowR.rotation[0] = -0.15;

      // Solid stance legs
      charObj.legL.rotation[0] = -0.04;
      charObj.legR.rotation[0] = 0.04;
      charObj.kneeL.rotation[0] = 0.05;
      charObj.kneeR.rotation[0] = 0.05;
    }
    else if (pose === 'run') {
      // Dynamic Athletic Sprint Gait
      const stride = t * 6.5;
      const legSin = Math.sin(stride);
      const legCos = Math.cos(stride);

      // Thigh & Knee swing
      charObj.legL.rotation[0] = legSin * 0.55;
      charObj.legR.rotation[0] = -legSin * 0.55;
      charObj.kneeL.rotation[0] = Math.max(0, -legSin * 0.75);
      charObj.kneeR.rotation[0] = Math.max(0, legSin * 0.75);

      // Opposite arm pump
      charObj.armL.rotation[0] = -legSin * 0.65;
      charObj.armR.rotation[0] = legSin * 0.65;
      charObj.elbowL.rotation[0] = -0.55 - Math.max(0, -legSin * 0.3);
      charObj.elbowR.rotation[0] = -0.55 - Math.max(0, legSin * 0.3);

      // Torso bob & tilt
      charObj.torso.position[1] = 1.38 + Math.abs(legCos) * 0.06;
      charObj.torso.rotation[1] = -legSin * 0.12;
      charObj.head.rotation[1] = legSin * 0.06;
    }
    else if (pose === 'action') {
      // Signature Action Pose
      if (charObj.charType === 'footy') {
        // Football: Powerful curled strike stance
        charObj.legL.rotation[0] = -0.35; // Plant leg
        charObj.legR.rotation[0] = 0.75;  // Extended kicking leg
        charObj.kneeR.rotation[0] = 0.30;
        charObj.armL.rotation[0] = 0.50;  // Counter-balance arm
        charObj.armL.rotation[2] = 0.35;
        charObj.armR.rotation[0] = -0.45;
        charObj.torso.rotation[0] = 0.15;
      } else {
        // Basketball: Elevated shooting form / dunk reach
        charObj.armL.rotation[0] = -0.85; // Guide hand
        charObj.armR.rotation[0] = -1.45; // High shooting release
        charObj.elbowR.rotation[0] = -0.45;
        charObj.torso.position[1] = 1.48; // Jump lift
        charObj.legL.rotation[0] = 0.25;
        charObj.legR.rotation[0] = -0.15;
      }
    }
  }

  // --- Render Loop ---

  let lastTime = 0;
  function renderLoop(now) {
    requestAnimationFrame(renderLoop);
    const dt = Math.min((now - lastTime) / 1000, 0.1) || 0.016;
    lastTime = now;
    animTime += dt;

    if (autoSpin && !isDragging) {
      targetYaw += dt * 0.55;
    }

    // Smooth Orbit Camera Interpolation
    const k = 1.0 - Math.exp(-dt * 9.0);
    curYaw += (targetYaw - curYaw) * k;
    curPitch += (targetPitch - curPitch) * k;
    curDist += (targetDist - curDist) * k;
    curY += (targetY - curY) * k;

    // Calculate Spherical Camera Coordinates
    const cosP = Math.cos(curPitch);
    const sinP = Math.sin(curPitch);
    const sinY = Math.sin(curYaw);
    const cosY = Math.cos(curYaw);

    const camX = sinY * cosP * curDist;
    const camY = curY + sinP * curDist;
    const camZ = cosY * cosP * curDist;

    studioCam.position = [camX, camY, camZ];
    studioCam.target = [0, curY, 0];
    studioCam.update();

    // Update Character Animation
    if (currentChar) {
      applyAnimation(currentChar, activePose, animTime);
    }

    // Render Scene
    renderer.render(studioScene, studioCam);
  }

  // --- UI Actions ---

  function selectChar(type) {
    if (activeCharType === type) return;
    activeCharType = type;

    // Switch Character in Scene
    studioScene.root.remove(currentChar.root);
    if (type === 'footy') currentChar = footyChar;
    else if (type === 'hoops') currentChar = hoopsChar;
    else if (type === 'keeper') currentChar = keeperChar;
    studioScene.root.add(currentChar.root);

    // Update UI tabs
    document.getElementById('tab-footy').classList.toggle('active', type === 'footy');
    document.getElementById('tab-hoops').classList.toggle('active', type === 'hoops');
    document.getElementById('tab-keeper').classList.toggle('active', type === 'keeper');
  }

  function setPresetAngle(yaw) {
    autoSpin = false;
    updateSpinBtn();
    targetYaw = yaw;
    targetPitch = 0.12;
    targetDist = 3.6;
    targetY = 1.15;
  }

  function zoomTarget(mode) {
    autoSpin = false;
    updateSpinBtn();
    if (mode === 'face') {
      targetY = 1.95;
      targetDist = 1.35;
      targetPitch = 0.05;
    } else if (mode === 'boots') {
      targetY = 0.25;
      targetDist = 1.45;
      targetPitch = 0.20;
    } else {
      targetY = 1.15;
      targetDist = 3.6;
      targetPitch = 0.12;
    }
  }

  function setPose(pose) {
    activePose = pose;
    document.querySelectorAll('[id^="pose-"]').forEach(btn => btn.classList.remove('active'));
    const btn = document.getElementById('pose-' + pose);
    if (btn) btn.classList.add('active');
  }

  window.toggleSpin = function() {
    autoSpin = !autoSpin;
    updateSpinBtn();
  };

  function updateSpinBtn() {
    const btn = document.getElementById('btn-spin');
    if (btn) btn.classList.toggle('active', autoSpin);
  }

  window.selectChar = selectChar;
  window.setPresetAngle = setPresetAngle;
  window.zoomTarget = zoomTarget;
  window.setPose = setPose;

  // Boot when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStudio);
  } else {
    initStudio();
  }
})();
