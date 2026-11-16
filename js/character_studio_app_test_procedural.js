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

  // Interactive 3D Match Ball State
  let ballNode = null, ballShadowNode = null;
  let ballTexFooty = null, ballTexHoops = null, ballMat = null;
  let showBall = true;
  let animSpeed = 1.0;
  const SPEEDS = [1.0, 0.5, 1.5];
  let speedIdx = 0;

  // Orbit Camera State
  let targetYaw = 0.65; // Start in 3/4 hero view!
  let curYaw = 0.65;
  let targetPitch = 0.08;
  let curPitch = 0.08;
  let targetDist = 3.65;
  let curDist = 3.65;
  let targetY = 0.98;
  let curY = 0.98;
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
    renderer.clearColor = [0.05, 0.06, 0.09];

    // 1. Create Studio Scene (Heroic 3-Point Studio Lighting — Fortnite / Pixar)
    studioScene = scene.createScene();
    studioScene.sunDir = [0.35, 0.55, 0.75];   // Dynamic 3-point key light (heroic 45° angle)
    studioScene.sunColor = [1.05, 1.02, 0.98]; // Warm crisp studio key
    studioScene.sky = [0.42, 0.44, 0.52];      // Rich atmospheric fill
    studioScene.ground = [0.28, 0.29, 0.34];   // Ground bounce
    studioScene.fogAmount = 0;

    // Studio Camera
    studioCam = new scene.Camera();
    studioCam.fov = 38;
    studioCam.near = 0.1;
    studioCam.far = 100;

    // 2. Clean Minimalist Carbon Stage (Zero Neon Distraction!)
    const stageRoot = new scene.Node();

    // Sleek matte carbon platform
    const platform = new scene.Node(G.cylinder(1.5, 1.55, 0.06, 36), scene.material({
      color: [0.10, 0.11, 0.14],
      spec: 0.12,
      shininess: 16,
      receiveShadow: true
    }));
    platform.setPos(0, -0.03, 0);
    stageRoot.add(platform);

    // Soft Contact Shadow under athlete boots (Radial Gradient Disc)
    const shadowCvs = document.createElement('canvas');
    shadowCvs.width = 256; shadowCvs.height = 256;
    const sCtx = shadowCvs.getContext('2d');
    const sGrad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 124);
    sGrad.addColorStop(0, 'rgba(0, 0, 0, 0.70)');
    sGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
    sGrad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 256, 256);

    const shadowBlob = new scene.Node(G.plane(1.4, 1.4), scene.material({
      texture: new scene.Texture(shadowCvs),
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
      if (false && Hero3D.loadGLBHeroCharacter) {
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

    // 4. Setup Interactive 3D Match Ball & Shadow
    ballTexFooty = createBallTexture('footy');
    ballTexHoops = createBallTexture('hoops');

    ballMat = scene.material({
      texture: ballTexFooty,
      spec: 0.35,
      shininess: 32,
      rim: 0.2,
      rimColor: [1.0, 1.0, 1.0]
    });

    ballNode = new scene.Node(G.sphere(0.12, 24, 18), ballMat);
    ballNode.setPos(0.22, 0.12, 0.35);
    studioScene.root.add(ballNode);

    // Ball soft ground contact shadow
    const bShadowCvs = document.createElement('canvas');
    bShadowCvs.width = 128; bShadowCvs.height = 128;
    const bsCtx = bShadowCvs.getContext('2d');
    const bsGrad = bsCtx.createRadialGradient(64, 64, 5, 64, 64, 60);
    bsGrad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
    bsGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.25)');
    bsGrad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
    bsCtx.fillStyle = bsGrad;
    bsCtx.fillRect(0, 0, 128, 128);

    ballShadowNode = new scene.Node(G.plane(0.5, 0.5), scene.material({
      texture: new scene.Texture(bShadowCvs),
      transparent: true,
      unlit: true,
      depthWrite: false
    }));
    ballShadowNode.rotation = [-Math.PI / 2, 0, 0];
    ballShadowNode.setPos(0.22, 0.015, 0.35);
    studioScene.root.add(ballShadowNode);

    // 5. Setup Input Handlers
    setupInput(canvas);

    // 6. Setup Window Resize
    window.addEventListener('resize', onResize);
    onResize();

    // 7. Start Render Loop
    requestAnimationFrame(renderLoop);

    // Expose Global Studio Controller for Puppeteer & Manual UI
    window.__STUDIO__ = {
      selectChar,
      setPresetAngle,
      zoomTarget,
      setPose,
      cycleSpeed,
      toggleBall,
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

  // --- Interactive 3D Ball Textures ---

  function createBallTexture(type) {
    const cvs = document.createElement('canvas');
    cvs.width = 512;
    cvs.height = 512;
    const ctx = cvs.getContext('2d');

    if (type === 'footy' || type === 'keeper') {
      // Classic White & Charcoal Soccer Leather Pattern
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 512, 512);

      // Leather panel stitching grid
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 512; i += 64) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
      }

      // Iconic Black Pentagons with Cyan Accent Border
      ctx.fillStyle = '#090d16';
      const pentagons = [
        [256, 120, 42], [120, 256, 38], [392, 256, 38],
        [180, 410, 38], [332, 410, 38], [60, 90, 32], [452, 90, 32]
      ];
      for (const [cx, cy, r] of pentagons) {
        ctx.beginPath();
        for (let k = 0; k < 5; k++) {
          const a = (k / 5) * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r;
          if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#00e5ff'; // Cyan high-tech glow border
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Golden Star in center
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      const cx = 256, cy = 120, r = 16;
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * Math.PI * 2 - Math.PI / 2;
        const rad = (k % 2 === 0) ? r : r * 0.45;
        const x = cx + Math.cos(a) * rad;
        const y = cy + Math.sin(a) * rad;
        if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    } else {
      // Official All-Star Basketball Texture (Warm Orange Leather + Deep Black Ribs)
      const grad = ctx.createRadialGradient(256, 256, 30, 256, 256, 256);
      grad.addColorStop(0, '#f97316');
      grad.addColorStop(0.75, '#ea580c');
      grad.addColorStop(1, '#9a3412');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Pebble leather texture noise
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      for (let y = 0; y < 512; y += 8) {
        for (let x = 0; x < 512; x += 8) {
          if ((x + y) % 16 === 0) {
            ctx.beginPath();
            ctx.arc(x + 4, y + 4, 1.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Recessed Black Rubber Seams
      ctx.strokeStyle = '#0a0a0c';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';

      // Horizontal equator & vertical meridian
      ctx.beginPath(); ctx.moveTo(0, 256); ctx.lineTo(512, 256); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(256, 0); ctx.lineTo(256, 512); ctx.stroke();

      // Curved side seams
      ctx.beginPath();
      ctx.arc(128, 256, 128, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(384, 256, 128, Math.PI / 2, -Math.PI / 2);
      ctx.stroke();
    }

    return new scene.Texture(cvs);
  }

  // --- Animation & Pose Application ---

  function applyAnimation(charObj, pose, t, dt) {
    if (!charObj) return;

    if (charObj.isGLB) {
      const deformFn = Hero3D.deformHeroAthlete || (window.HeroCharacters3D && window.HeroCharacters3D.deformHeroAthlete);
      if (deformFn) {
        const ballState = deformFn(charObj, pose, t, { speed: animSpeed });
        if (ballState && ballNode) {
          ballNode.visible = showBall && ballState.visible;
          if (ballShadowNode) ballShadowNode.visible = ballNode.visible;

          if (ballNode.visible) {
            const targetTex = (activeCharType === 'hoops') ? ballTexHoops : ballTexFooty;
            if (ballMat.texture !== targetTex) ballMat.texture = targetTex;

            const bScale = (activeCharType === 'hoops' ? 1.08 : 0.95) * (ballState.scale || 1.0);
            ballNode.setScale(bScale);
            ballNode.setPos(ballState.x, ballState.y, ballState.z);

            ballNode.rotation[0] += (dt || 0.016) * 3.5;
            ballNode.rotation[1] += (dt || 0.016) * 2.2;

            if (ballShadowNode) {
              ballShadowNode.setPos(ballState.x, 0.015, ballState.z);
              const shadowScale = Math.max(0.12, 1.0 - (ballState.y - 0.12) * 0.45);
              ballShadowNode.setScale(shadowScale);
            }
          }
        }
      }
      return;
    }

    if (pose === 'idle') {
      // Confident Athletic Breathing & Subtle Hero Stance
      const breath = Math.sin(t * 1.8 * animSpeed) * 0.02;
      charObj.torso.position[1] = 1.38 + breath * 0.5;
      charObj.head.position[1] = 1.94 + breath * 0.6;
      charObj.head.rotation[0] = Math.sin(t * 1.2 * animSpeed) * 0.02;

      // Relaxed arms with gentle athletic sway
      charObj.armL.rotation[0] = 0.08 + Math.sin(t * 1.5 * animSpeed) * 0.03;
      charObj.armL.rotation[2] = 0.12; // Slight spread
      charObj.armR.rotation[0] = 0.08 - Math.sin(t * 1.5 * animSpeed) * 0.03;
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
      const stride = t * 6.5 * animSpeed;
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
        charObj.legL.rotation[0] = -0.35;
        charObj.legR.rotation[0] = 0.75;
        charObj.kneeR.rotation[0] = 0.30;
        charObj.armL.rotation[0] = 0.50;
        charObj.armL.rotation[2] = 0.35;
        charObj.armR.rotation[0] = -0.45;
        charObj.torso.rotation[0] = 0.15;
      } else {
        charObj.armL.rotation[0] = -0.85;
        charObj.armR.rotation[0] = -1.45;
        charObj.elbowR.rotation[0] = -0.45;
        charObj.torso.position[1] = 1.48;
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

    // Smooth Orbit Camera Interpolation with Dynamic Athletic Lift Tracking
    const k = 1.0 - Math.exp(-dt * 9.0);
    const charLift = (currentChar && currentChar.pivot && typeof currentChar.pivot.position[1] === 'number') ? currentChar.pivot.position[1] : 0;
    const effectiveTargetY = targetY + charLift * 0.50;
    curYaw += (targetYaw - curYaw) * k;
    curPitch += (targetPitch - curPitch) * k;
    curDist += (targetDist - curDist) * k;
    curY += (effectiveTargetY - curY) * k;

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
      applyAnimation(currentChar, activePose, animTime, dt);
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

    // Swap ball texture for active sport
    if (ballMat) {
      ballMat.texture = (type === 'hoops') ? ballTexHoops : ballTexFooty;
    }

    // Update UI tabs
    document.getElementById('tab-footy').classList.toggle('active', type === 'footy');
    document.getElementById('tab-hoops').classList.toggle('active', type === 'hoops');
    document.getElementById('tab-keeper').classList.toggle('active', type === 'keeper');
  }

  function setPresetAngle(yaw) {
    autoSpin = false;
    updateSpinBtn();
    targetYaw = yaw;
    targetPitch = 0.08;
    targetDist = 3.65;
    targetY = 0.98;
  }

  function zoomTarget(mode) {
    autoSpin = false;
    updateSpinBtn();
    if (mode === 'face') {
      targetYaw = 0.0;
      targetY = (activeCharType === 'hoops') ? 1.70 : 1.63;
      targetDist = 1.20;
      targetPitch = 0.04;
    } else if (mode === 'boots') {
      targetY = 0.20;
      targetDist = 1.35;
      targetPitch = 0.18;
    } else {
      targetY = 0.98;
      targetDist = 3.65;
      targetPitch = 0.08;
    }
  }

  function setPose(pose) {
    activePose = pose;
    document.querySelectorAll('[id^="pose-"]').forEach(btn => btn.classList.remove('active'));
    const btn = document.getElementById('pose-' + pose);
    if (btn) btn.classList.add('active');
  }

  function cycleSpeed() {
    speedIdx = (speedIdx + 1) % SPEEDS.length;
    animSpeed = SPEEDS[speedIdx];
    const btn = document.getElementById('speed-btn');
    if (btn) {
      btn.textContent = '⏱️ ' + animSpeed.toFixed(1) + 'x' + (animSpeed === 0.5 ? ' (Slow-mo)' : '');
    }
  }

  function toggleBall() {
    showBall = !showBall;
    const btn = document.getElementById('btn-ball');
    if (btn) {
      btn.textContent = showBall ? '⚽ Мяч: ВКЛ' : '⚽ Мяч: ВЫКЛ';
      btn.classList.toggle('active', showBall);
    }
    if (ballNode) ballNode.visible = showBall;
    if (ballShadowNode) ballShadowNode.visible = showBall;
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
  window.cycleSpeed = cycleSpeed;
  window.toggleBall = toggleBall;

  // Boot when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStudio);
  } else {
    initStudio();
  }
})();
