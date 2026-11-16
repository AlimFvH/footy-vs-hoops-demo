/**
 * FOOTY vs HOOPS — 3D Character Studio & Hero Model Generator
 * 
 * High-fidelity stylized 3D athletes:
 *  - Pixar/Fortnite stylized facial textures (smooth almond eyes, glossy pupils, warm skin shading)
 *  - Continuous 360° wrap-around uniform textures (seamless torso, zero cardboard quads!)
 *  - Anatomical deltoids, tapered athletic limbs, realistic shorts, and footwear
 */

(function(root, factory) {
  if (typeof window !== 'undefined' && typeof window.define === 'function') {
    window.define('render/hero_characters_3d', ['exports', 'gfx/geometry', 'gfx/math', 'gfx/scene'], function(exports, G, M, scene) {
      factory(exports, G, M, scene);
      if (typeof window !== 'undefined') window.HeroCharacters3D = exports;
    });
    return;
  }
  if (typeof define === 'function' && define.amd) {
    define('render/hero_characters_3d', ['exports', 'gfx/geometry', 'gfx/math', 'gfx/scene'], factory);
  } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
    factory(exports, require('../js/game').geometry || {}, require('../js/game').math || {}, require('../js/game').scene || {});
  } else {
    root.HeroCharacters3D = {};
    factory(root.HeroCharacters3D, root.Geometry || {}, root.Math || {}, root.Scene || {});
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function(exports, G, M, scene) {
  'use strict';

  function getG() {
    if (G && typeof G.sphere === 'function') return G;
    if (typeof window !== 'undefined' && typeof window.require === 'function') return window.require('gfx/geometry');
    return G;
  }

  function getScene() {
    if (scene && typeof scene.Node === 'function') return scene;
    if (typeof window !== 'undefined' && typeof window.require === 'function') return window.require('gfx/scene');
    return scene;
  }

  function hexToRgb(h) {
    if (typeof h === 'string') {
      const v = parseInt(h.replace('#', ''), 16);
      return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
    }
    return [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255];
  }

  function toLinear(c) {
    return [
      Math.pow(c[0], 2.2),
      Math.pow(c[1], 2.2),
      Math.pow(c[2], 2.2)
    ];
  }

  function makeLathe(profile, seg) {
    const geo = getG();
    const n = profile.length;
    const pos = [];
    const nor = [];
    const uv = [];
    for (let i = 0; i < n; i++) {
      const p = profile[i];
      for (let j = 0; j <= seg; j++) {
        const a = (j / seg) * Math.PI * 2 - Math.PI / 2;
        const s = Math.sin(a);
        const c = Math.cos(a);
        pos.push(p.r * s, p.y, p.r * c);
        const l = Math.hypot(p.nr, p.ny) || 1;
        nor.push((p.nr / l) * s, p.ny / l, (p.nr / l) * c);
        // Correct UV mapping: U goes from 0 to 1, V goes from 0 (top) to 1 (bottom) matching canvas
        uv.push(j / seg, 1.0 - (i / (n - 1)));
      }
    }
    const idx = [];
    const row = seg + 1;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < seg; j++) {
        const a = i * row + j;
        const b = a + 1;
        const c = a + row;
        const d = c + 1;
        idx.push(a, b, c, b, d, c);
      }
    }
    const big = pos.length / 3 > 65000;
    return new geo.Geometry(new Float32Array(pos), new Float32Array(nor), new Float32Array(uv), big ? new Uint32Array(idx) : new Uint16Array(idx));
  }

  /**
   * Generates continuous 360° wrap-around Stylized Pixar Head Texture (1024x512)
   * 
   * u = 0.25 (x = 256): FRONT OF FACE (Heroic Pixar Eyes, Nose, Smile, Brows)
   * u = 0.75 (x = 768): BACK OF HEAD (Hairline, Nape, Hair texture)
   * u = 0.0 & 0.5: SIDES OF HEAD (Taper fade, sideburns)
   */
  function makeHeadWrapTexture(charType) {
    const cvs = document.createElement('canvas');
    cvs.width = 1024;
    cvs.height = 512;
    const ctx = cvs.getContext('2d');

    const isFooty = (charType === 'footy');
    const isHoops = (charType === 'hoops');
    const isKeeper = (charType === 'keeper');

    // 1. Base Athletic Skin Tone
    const skinBase = isFooty ? '#dfa57e' : (isHoops ? '#543625' : '#dfaf90');
    const skinHighlight = isFooty ? '#ebd0ba' : (isHoops ? '#744933' : '#eed4c0');
    const skinShadow = isFooty ? '#c2865e' : (isHoops ? '#382014' : '#c08e70');

    // Base skin fill
    const skinGrad = ctx.createLinearGradient(0, 0, 0, 512);
    skinGrad.addColorStop(0, skinHighlight);
    skinGrad.addColorStop(0.5, skinBase);
    skinGrad.addColorStop(1, skinShadow);
    ctx.fillStyle = skinGrad;
    ctx.fillRect(0, 0, 1024, 512);

    // 2. Hair Texture on Crown & Back of Head
    // Top crown: y = 0 to 140
    // Back of head: x = 512 to 1024
    const hairHex = isFooty ? '#28160c' : (isHoops ? '#0a0a0c' : '#241d18');
    const hairFade = isFooty ? 'rgba(40, 22, 12, 0.65)' : (isHoops ? 'rgba(10, 10, 12, 0.75)' : 'rgba(36, 29, 24, 0.65)');

    ctx.fillStyle = hairHex;
    // Fill top crown
    ctx.fillRect(0, 0, 1024, 130);

    // Back of head hair block
    ctx.beginPath();
    ctx.moveTo(512, 130);
    ctx.lineTo(512, 420);
    ctx.bezierCurveTo(640, 460, 896, 460, 1024, 420);
    ctx.lineTo(1024, 130);
    ctx.closePath();
    ctx.fill();

    // Sideburns / Taper Fade on sides (around x = 0/1024 and x = 512)
    ctx.fillStyle = hairFade;
    // Left sideburn (around x = 80 to 130)
    ctx.beginPath();
    ctx.moveTo(90, 130); ctx.lineTo(130, 130); ctx.lineTo(110, 310); ctx.lineTo(85, 310); ctx.closePath(); ctx.fill();
    // Right sideburn (around x = 380 to 425)
    ctx.beginPath();
    ctx.moveTo(380, 130); ctx.lineTo(420, 130); ctx.lineTo(425, 310); ctx.lineTo(400, 310); ctx.closePath(); ctx.fill();

    // Front Hairline (curves smoothly across forehead at y = 145)
    ctx.fillStyle = hairHex;
    ctx.beginPath();
    if (isHoops) {
      // Sharp, crisp basketball edge lineup
      ctx.moveTo(110, 150);
      ctx.lineTo(140, 150);
      ctx.lineTo(140, 135);
      ctx.lineTo(372, 135);
      ctx.lineTo(372, 150);
      ctx.lineTo(400, 150);
      ctx.lineTo(400, 100);
      ctx.lineTo(110, 100);
    } else if (isFooty) {
      // Swept pompadour hairline
      ctx.moveTo(110, 155);
      ctx.quadraticCurveTo(180, 140, 256, 145);
      ctx.quadraticCurveTo(330, 140, 400, 155);
      ctx.lineTo(400, 100);
      ctx.lineTo(110, 100);
    } else {
      // Clean crew cut hairline
      ctx.moveTo(110, 150);
      ctx.quadraticCurveTo(256, 142, 400, 150);
      ctx.lineTo(400, 100);
      ctx.lineTo(110, 100);
    }
    ctx.closePath();
    ctx.fill();

    // 3. FRONT FACE (Centered at x = 256)
    // --- Soft Rosy Athletic Cheek Glow ---
    for (const cx of [170, 342]) {
      const blushGrad = ctx.createRadialGradient(cx, 315, 8, cx, 315, 65);
      const blushCol = isFooty ? 'rgba(235, 90, 80, 0.36)' : (isHoops ? 'rgba(190, 65, 45, 0.28)' : 'rgba(225, 85, 75, 0.32)');
      blushGrad.addColorStop(0, blushCol);
      blushGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = blushGrad;
      ctx.beginPath();
      ctx.arc(cx, 315, 65, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- 4. EXPRESSIVE PIXAR EYES ---
    // Left eye center at x = 185, Right eye center at x = 327, y = 238
    const eyeW = 46;
    const eyeH = 30;
    const irisR = 21;
    const pupilR = 10.5;

    for (const [cx, isRight] of [[185, false], [327, true]]) {
      ctx.save();

      // Almond eye aperture contour
      ctx.beginPath();
      ctx.moveTo(cx - eyeW, 238);
      ctx.bezierCurveTo(cx - eyeW * 0.45, 238 - eyeH * 1.15, cx + eyeW * 0.45, 238 - eyeH * 1.15, cx + eyeW, 238);
      ctx.bezierCurveTo(cx + eyeW * 0.45, 238 + eyeH * 0.95, cx - eyeW * 0.45, 238 + eyeH * 0.95, cx - eyeW, 238);
      ctx.closePath();

      // Gleaming white sclera
      ctx.fillStyle = '#f8fafc';
      ctx.fill();
      ctx.clip();

      // Ambient eye socket drop shadow
      const eyeShadow = ctx.createLinearGradient(cx, 238 - eyeH, cx, 238);
      eyeShadow.addColorStop(0, 'rgba(25, 18, 22, 0.40)');
      eyeShadow.addColorStop(1, 'rgba(25, 18, 22, 0.0)');
      ctx.fillStyle = eyeShadow;
      ctx.fillRect(cx - eyeW - 10, 238 - eyeH - 10, eyeW * 2 + 20, eyeH * 2 + 20);

      // Luminous Radiant Iris
      const irisGrad = ctx.createRadialGradient(cx, 239, 3, cx, 239, irisR);
      if (isFooty) {
        irisGrad.addColorStop(0, '#7df9ff');
        irisGrad.addColorStop(0.35, '#00d4ff');
        irisGrad.addColorStop(0.75, '#0088cc');
        irisGrad.addColorStop(1, '#003d66'); // Deep navy limbal ring
      } else if (isHoops) {
        irisGrad.addColorStop(0, '#fde68a');
        irisGrad.addColorStop(0.35, '#f59e0b');
        irisGrad.addColorStop(0.75, '#b45309');
        irisGrad.addColorStop(1, '#451a03'); // Rich mahogany limbal ring
      } else {
        irisGrad.addColorStop(0, '#6ee7b7');
        irisGrad.addColorStop(0.35, '#10b981');
        irisGrad.addColorStop(0.75, '#059669');
        irisGrad.addColorStop(1, '#064e3b'); // Deep emerald limbal ring
      }
      ctx.fillStyle = irisGrad;
      ctx.beginPath();
      ctx.arc(cx, 239, irisR, 0, Math.PI * 2);
      ctx.fill();

      // Deep Glossy Black Pupil
      ctx.fillStyle = '#08080c';
      ctx.beginPath();
      ctx.arc(cx, 239, pupilR, 0, Math.PI * 2);
      ctx.fill();

      // Pixar Dual Specular Catchlights (Gives life and spark to the eyes!)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(cx + 6, 233, 5.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx - 5, 244, 2.8, 0, Math.PI * 2); ctx.fill();

      ctx.restore();

      // Upper Eyelid Lash Line
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 4.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - eyeW - 2, 240);
      ctx.bezierCurveTo(cx - eyeW * 0.4, 238 - eyeH * 1.15, cx + eyeW * 0.4, 238 - eyeH * 1.15, cx + eyeW + 2, 237);
      ctx.stroke();

      // Bold Athletic Eyebrows
      ctx.fillStyle = hairHex;
      ctx.beginPath();
      const browY = 198;
      const bIn = isRight ? cx - eyeW * 0.85 : cx + eyeW * 0.85;
      const bOut = isRight ? cx + eyeW * 1.05 : cx - eyeW * 1.05;
      const arch = isRight ? cx + 8 : cx - 8;

      ctx.moveTo(bIn, browY + 8);
      ctx.quadraticCurveTo(arch, browY - 14, bOut, browY - 1);
      ctx.quadraticCurveTo(arch, browY - 5, bIn, browY + 8);
      ctx.closePath();
      ctx.fill();
    }

    // --- 5. STYLIZED ATHLETIC NOSE ---
    // Clean nose bridge highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 4.0;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(256, 250);
    ctx.lineTo(256, 298);
    ctx.stroke();

    // Soft rounded nose tip & nostrils
    ctx.fillStyle = isFooty ? 'rgba(150, 75, 45, 0.38)' : (isHoops ? 'rgba(50, 25, 15, 0.45)' : 'rgba(140, 70, 45, 0.35)');
    ctx.beginPath();
    ctx.ellipse(256, 305, 16, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // --- 6. HEROIC ATHLETIC SMILE & WHITE TEETH ---
    const mouthY = 370;
    // Smile outline
    ctx.strokeStyle = isFooty ? '#7a2424' : (isHoops ? '#3d1616' : '#6b2020');
    ctx.lineWidth = 4.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(215, mouthY - 2);
    ctx.bezierCurveTo(235, mouthY + 18, 277, mouthY + 18, 297, mouthY - 2);
    ctx.stroke();

    // Gleaming White Dental Arch
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(224, mouthY);
    ctx.bezierCurveTo(240, mouthY + 11, 272, mouthY + 11, 288, mouthY);
    ctx.bezierCurveTo(272, mouthY + 4, 240, mouthY + 4, 224, mouthY);
    ctx.closePath();
    ctx.fill();

    // Subtle lower lip contour
    ctx.strokeStyle = isFooty ? 'rgba(190, 75, 65, 0.45)' : (isHoops ? 'rgba(120, 50, 35, 0.40)' : 'rgba(180, 70, 60, 0.40)');
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.moveTo(236, mouthY + 14);
    ctx.quadraticCurveTo(256, mouthY + 18, 276, mouthY + 14);
    ctx.stroke();

    // --- 7. HOOPS #23: GROOMED MUSTACHE & JAWLINE BEARD ---
    if (isHoops) {
      ctx.fillStyle = '#0a0a0c';
      // Neat mustache above lip
      ctx.beginPath();
      ctx.moveTo(225, mouthY - 14);
      ctx.quadraticCurveTo(256, mouthY - 8, 287, mouthY - 14);
      ctx.quadraticCurveTo(256, mouthY - 22, 225, mouthY - 14);
      ctx.fill();

      // Goatee hugging chin contour
      ctx.beginPath();
      ctx.moveTo(210, 395);
      ctx.bezierCurveTo(225, 455, 287, 455, 302, 395);
      ctx.bezierCurveTo(287, 428, 225, 428, 210, 395);
      ctx.closePath();
      ctx.fill();
    }

    return cvs;
  }
  const makeFaceTexture = makeHeadWrapTexture;

  /**
   * Generates continuous 360° wrap-around uniform texture (1024x512)
   * 
   * Left half (0 to 512): BACK of uniform
   * Right half (512 to 1024): FRONT of uniform (centered at x = 768)
   */
  function makeUniformWrapTexture(charType, emblemImg) {
    const cvs = document.createElement('canvas');
    cvs.width = 1024;
    cvs.height = 512;
    const ctx = cvs.getContext('2d');
    const isFooty = (charType === 'footy');
    const isHoops = (charType === 'hoops');
    const isKeeper = (charType === 'keeper');

    if (isKeeper) {
      // Emerald Green Pro Goalkeeper Jersey
      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0, '#10b981');
      grad.addColorStop(0.5, '#059669');
      grad.addColorStop(1, '#047857');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 512);

      // Navy Raglan Padded Shoulders
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(120, 0); ctx.lineTo(190, 0); ctx.lineTo(60, 200); ctx.lineTo(0, 200); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(322, 0); ctx.lineTo(392, 0); ctx.lineTo(512, 200); ctx.lineTo(452, 200); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(632, 0); ctx.lineTo(702, 0); ctx.lineTo(572, 200); ctx.lineTo(512, 200); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(834, 0); ctx.lineTo(904, 0); ctx.lineTo(1024, 200); ctx.lineTo(964, 200); ctx.closePath(); ctx.fill();

      // Collar
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.moveTo(200, 0); ctx.lineTo(312, 0); ctx.lineTo(256, 80); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#10b981';
      ctx.beginPath(); ctx.moveTo(215, 0); ctx.lineTo(297, 0); ctx.lineTo(256, 65); ctx.closePath(); ctx.fill();

      // Emblem
      if (emblemImg && emblemImg.complete && emblemImg.naturalWidth > 0) {
        ctx.save();
        ctx.beginPath(); ctx.arc(172, 172, 34, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)'; ctx.fill();
        ctx.strokeStyle = '#10b981'; ctx.lineWidth = 3; ctx.stroke();
        ctx.drawImage(emblemImg, 138, 138, 68, 68);
        ctx.restore();
      }

      // Wordmark "KEEPER" & Number "1" on Front
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = '900 54px "Montserrat", "Arial Black", sans-serif';
      ctx.fillStyle = '#0f172a'; ctx.fillText('KEEPER', 256, 218);
      ctx.fillStyle = '#ffffff'; ctx.fillText('KEEPER', 256, 214);

      ctx.font = '900 136px "Montserrat", "Arial Black", sans-serif';
      ctx.fillStyle = '#0f172a'; ctx.fillText('1', 256, 336);
      ctx.fillStyle = '#ffffff'; ctx.fillText('1', 256, 330);

      // Back Wordmark & Number
      ctx.font = '900 48px "Montserrat", "Arial Black", sans-serif';
      ctx.fillStyle = '#0f172a'; ctx.fillText('KEEPER', 768, 142);
      ctx.fillStyle = '#ffffff'; ctx.fillText('KEEPER', 768, 138);

      ctx.font = '900 186px "Montserrat", "Arial Black", sans-serif';
      ctx.fillStyle = '#0f172a'; ctx.fillText('1', 768, 296);
      ctx.fillStyle = '#ffffff'; ctx.fillText('1', 768, 290);

      return cvs;
    }

    if (isFooty) {
      // Electric Cyan / Turquoise Gradient
      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0, '#00d6ff');
      grad.addColorStop(0.5, '#00b8e6');
      grad.addColorStop(1, '#008ecc');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 512);

      // Micro Fabric Mesh pattern
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      for (let y = 0; y < 512; y += 4) {
        for (let x = 0; x < 1024; x += 4) {
          if ((x + y) % 8 === 0) ctx.fillRect(x, y, 2, 2);
        }
      }

      // --- FRONT JERSEY (Centered at x = 256) ---
      // Raglan White Shoulder Panels
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(120, 0); ctx.lineTo(190, 0); ctx.lineTo(60, 200); ctx.lineTo(0, 200); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(322, 0); ctx.lineTo(392, 0); ctx.lineTo(512, 200); ctx.lineTo(452, 200); ctx.closePath(); ctx.fill();

      // Navy Blue V-Neck Collar
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(200, 0); ctx.lineTo(312, 0); ctx.lineTo(256, 85); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(215, 0); ctx.lineTo(297, 0); ctx.lineTo(256, 68); ctx.closePath(); ctx.fill();

      // Official FVH Emblem on Left Chest
      if (emblemImg && emblemImg.complete && emblemImg.naturalWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(172, 172, 34, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.fill();
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.drawImage(emblemImg, 138, 138, 68, 68);
        ctx.restore();
      }

      // Wordmark "FOOTY"
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 58px "Montserrat", "Arial Black", sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('FOOTY', 256, 218);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('FOOTY', 256, 214);

      // Squad Number "10" on Front
      ctx.font = '900 128px "Montserrat", "Arial Black", sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('10', 256, 336);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('10', 256, 330);

      // --- BACK JERSEY (Centered at x = 768) ---
      // White Raglan Panels on Back
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(632, 0); ctx.lineTo(702, 0); ctx.lineTo(572, 200); ctx.lineTo(512, 200); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(834, 0); ctx.lineTo(904, 0); ctx.lineTo(1024, 200); ctx.lineTo(964, 200); ctx.closePath(); ctx.fill();

      // Back Collar
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(712, 0); ctx.lineTo(824, 0); ctx.lineTo(768, 38); ctx.closePath(); ctx.fill();

      // Back Wordmark
      ctx.font = '900 48px "Montserrat", "Arial Black", sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('FOOTY', 768, 142);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('FOOTY', 768, 138);

      // Large Squad Number "10" on Back
      ctx.font = '900 176px "Montserrat", "Arial Black", sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('10', 768, 296);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('10', 768, 290);

      // Flank stripes
      ctx.fillStyle = '#0a1e3f';
      ctx.fillRect(0, 180, 20, 332);
      ctx.fillRect(1004, 180, 20, 332);
      ctx.fillRect(502, 180, 20, 332);

    } else {
      // HOOPS #23: Luxury Carbon Black & Metallic Gold
      ctx.fillStyle = '#111318';
      ctx.fillRect(0, 0, 1024, 512);

      // Micro-ribbing
      ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
      for (let x = 0; x < 1024; x += 6) {
        ctx.fillRect(x, 0, 2, 512);
      }

      const goldGrad = ctx.createLinearGradient(0, 0, 512, 0);
      goldGrad.addColorStop(0, '#f59e0b');
      goldGrad.addColorStop(0.5, '#fbbf24');
      goldGrad.addColorStop(1, '#d97706');

      // Metallic Gold Scoop Neck Collar Trim (Front center at x = 256)
      ctx.fillStyle = goldGrad;
      ctx.beginPath();
      ctx.arc(256, 0, 80, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#111318';
      ctx.beginPath();
      ctx.arc(256, 0, 64, 0, Math.PI);
      ctx.fill();

      // Back Scoop Neck (Center at x = 768)
      ctx.fillStyle = goldGrad;
      ctx.beginPath();
      ctx.arc(768, 0, 68, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#111318';
      ctx.beginPath();
      ctx.arc(768, 0, 54, 0, Math.PI);
      ctx.fill();

      // Side Inserts
      for (const sx of [0, 502, 1004]) {
        ctx.fillStyle = goldGrad;
        ctx.fillRect(sx, 120, 20, 392);
      }

      // --- FRONT BRANDING (x = 256) ---
      if (emblemImg && emblemImg.complete && emblemImg.naturalWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(172, 168, 34, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(17, 19, 24, 0.95)';
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.drawImage(emblemImg, 138, 134, 68, 68);
        ctx.restore();
      }

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 62px "Montserrat", "Arial Black", sans-serif';
      ctx.fillStyle = '#000000';
      ctx.fillText('HOOPS', 256, 218);
      ctx.fillStyle = goldGrad;
      ctx.fillText('HOOPS', 256, 214);

      ctx.font = '900 138px "Montserrat", "Arial Black", sans-serif';
      ctx.fillStyle = '#000000';
      ctx.fillText('23', 256, 338);
      ctx.fillStyle = goldGrad;
      ctx.fillText('23', 256, 332);

      // --- BACK BRANDING (x = 768) ---
      ctx.font = '900 52px "Montserrat", "Arial Black", sans-serif';
      ctx.fillStyle = '#000000';
      ctx.fillText('HOOPS', 768, 142);
      ctx.fillStyle = goldGrad;
      ctx.fillText('HOOPS', 768, 138);

      ctx.font = '900 186px "Montserrat", "Arial Black", sans-serif';
      ctx.fillStyle = '#000000';
      ctx.fillText('23', 768, 298);
      ctx.fillStyle = goldGrad;
      ctx.fillText('23', 768, 292);
    }

    return cvs;
  }

  /**
   * Builds the Complete Stylized 3D Hero Athlete Model
   */
  function buildHeroCharacter(charType, emblemImg) {
    const isFooty = (charType === 'footy');
    const isHoops = (charType === 'hoops');
    const isKeeper = (charType === 'keeper');

    const sc = getScene();
    const geo = getG();

    const root = new sc.Node();
    const pivot = new sc.Node();
    root.add(pivot);

    // Helper functions
    const at = (n, x, y, z) => (n.setPos(x, y, z), n);
    const mk = (g, col, o = {}) => {
      const rgb = hexToRgb(col);
      const linRgb = toLinear(rgb);
      return new sc.Node(g, sc.material({
        color: linRgb,
        spec: o.spec !== undefined ? o.spec : (o.shoe ? 0.80 : (o.fabric ? 0.32 : 0.28)),
        shininess: o.shininess !== undefined ? o.shininess : (o.shoe ? 70 : (o.fabric ? 24 : 32)),
        rim: o.rim !== undefined ? o.rim : (o.skin ? 0.38 : 0.25),
        rimColor: o.rimColor || (o.skin ? [1.0, 0.88, 0.78] : [0.95, 0.98, 1.0]),
        castShadow: true,
        receiveShadow: true,
        texture: o.texture || null,
        transparent: o.transparent || false,
        alpha: o.alpha !== undefined ? o.alpha : 1.0,
        depthWrite: o.depthWrite !== undefined ? o.depthWrite : true,
        unlit: o.unlit || false
      }));
    };

    // Color Palettes
    // Skin:
    // Footy: Warm Mediterranean / peach tone 0xdfa57e
    // Hoops: Rich athletic bronze / mahogany 0x543625
    // Keeper: Fair athletic Nordic tone 0xdfaf90
    const skinCol = isFooty ? 0xdfa57e : (isHoops ? 0x543625 : 0xdfaf90);

    // Hair:
    // Footy: Rich espresso brown 0x28160c
    // Hoops: Jet black 0x0a0a0c
    // Keeper: Dark ash brown 0x241d18
    const hairCol = isFooty ? 0x28160c : (isHoops ? 0x0a0a0c : 0x241d18);

    // Uniform / Accents:
    const goldCol = 0xf59e0b;
    const whiteCol = 0xf8fafc;
    const darkCol = 0x0f172a;
    const cyanCol = 0x00d4ff;
    const greenCol = 0x10b981;

    // Shorts color:
    const shortsCol = isFooty ? 0x0f172a : (isHoops ? 0x111318 : 0x1e293b);
    const sockCol = isFooty ? 0x00c4e2 : (isHoops ? 0xf8fafc : 0x1e293b);
    const bootCol = isFooty ? 0x00d4ff : (isHoops ? 0x111318 : 0x10b981);

    // =========================================================================
    // 1. SCULPTED ATHLETIC TORSO & 360° CONTINUOUS UNIFORM
    // =========================================================================
    const torso = new sc.Node();
    torso.setPos(0, 1.34, 0);

    // Contoured V-Taper Lathe Profile (smooth transition from waist to broad chest)
    const torsoProfile = [
      { r: 0.20, y: -0.32, nr: 0.15, ny: -0.90 }, // Lower waist
      { r: 0.22, y: -0.18, nr: 0.20, ny: -0.30 }, // Mid waist
      { r: 0.25, y: -0.02, nr: 0.25, ny:  0.10 }, // Ribcage
      { r: 0.28, y:  0.14, nr: 0.28, ny:  0.25 }, // Pectorals / Chest
      { r: 0.29, y:  0.26, nr: 0.22, ny:  0.55 }, // Upper chest & clavicle
      { r: 0.16, y:  0.34, nr: -0.3, ny:  0.80 }, // Collar taper
    ];

    const uniformCanvas = makeUniformWrapTexture(charType, emblemImg);
    const uniformTex = new sc.Texture(uniformCanvas);

    const torsoGeo = makeLathe(torsoProfile, 28);
    const torsoMesh = new sc.Node(torsoGeo, sc.material({
      color: [1, 1, 1],
      texture: uniformTex,
      spec: 0.35,
      shininess: 32,
      rim: 0.25,
      castShadow: true,
      receiveShadow: true
    }));
    // Front faces +Z, back faces -Z! Natural athletic V-Taper width:
    torsoMesh.rotation = [0, 0, 0];
    torsoMesh.scale = [1.18, 1.0, 0.76];
    torso.add(torsoMesh);

    // Defined Athletic Neck (Tapers into collar)
    const neck = mk(geo.cylinder(0.072, 0.084, 0.16, 18), skinCol, { skin: true });
    torso.add(at(neck, 0, 0.38, 0));

    // Collar Rim (adds realistic physical thickness around neck opening)
    const collarCol = isFooty ? 0x0f172a : (isHoops ? goldCol : 0x0f172a);
    const collar = mk(geo.torus(0.082, 0.016, 24, 8), collarCol, { fabric: true, spec: isHoops ? 0.75 : 0.35 });
    collar.scale = [1.1, 0.8, 1.0];
    collar.rotation = [Math.PI / 2, 0, 0];
    torso.add(at(collar, 0, 0.34, 0));

    pivot.add(torso);

    // =========================================================================
    // 2. EXQUISITE 3D PIXAR / FORTNITE HEAD & FACE
    // =========================================================================
    const head = new sc.Node();
    head.setPos(0, 1.90, 0);

    // Contoured Head Lathe Mesh (Seamless 3D Head Sculpt!)
    const headProfile = [
      { r: 0.082, y: -0.18, nr: 0.10, ny: -0.90 }, // Neck base
      { r: 0.134, y: -0.12, nr: 0.45, ny: -0.50 }, // Chin / lower jaw
      { r: 0.162, y: -0.05, nr: 0.70, ny: -0.10 }, // Mouth / lower cheek
      { r: 0.175, y:  0.03, nr: 0.80, ny:  0.10 }, // Cheeks / Nose
      { r: 0.176, y:  0.09, nr: 0.60, ny:  0.30 }, // Eyes / Brows
      { r: 0.166, y:  0.15, nr: 0.40, ny:  0.60 }, // Forehead / Hairline
      { r: 0.136, y:  0.20, nr: 0.20, ny:  0.80 }, // Upper cranium
      { r: 0.020, y:  0.23, nr: 0.00, ny:  1.00 }, // Crown top
    ];

    const headGeo = makeLathe(headProfile, 28);
    const headTex = new sc.Texture(makeHeadWrapTexture(charType));
    const headMesh = new sc.Node(headGeo, sc.material({
      color: [1, 1, 1],
      texture: headTex,
      spec: 0.25,
      shininess: 32,
      rim: 0.32,
      rimColor: [1.0, 0.90, 0.82],
      castShadow: true,
      receiveShadow: true
    }));
    headMesh.scale = [0.95, 1.0, 1.02];
    head.add(headMesh);

    // Stylized 3D Ears
    for (const sx of [-1, 1]) {
      const ear = mk(geo.sphere(0.045, 12, 10), skinCol, { skin: true });
      ear.scale = [0.45, 1.15, 0.85];
      ear.rotation = [0.12, sx < 0 ? -0.25 : 0.25, 0];
      head.add(at(ear, sx * 0.170, 0.020, -0.010));
    }

    // 3D Sculpted Volumetric Hair on Top of Head
    if (isFooty) {
      // FOOTY #10: Pompadour Quiff (sweeping boldly UP and BACK on top of cranium!)
      const quiff = mk(geo.sphere(0.155, 18, 14), hairCol, { spec: 0.35, shininess: 40 });
      quiff.scale = [0.92, 1.15, 1.25];
      head.add(at(quiff, 0, 0.190, 0.025));

      const quiffTuft = mk(geo.capsule(0.065, 0.140, 12, 4), hairCol, { spec: 0.35, shininess: 40 });
      quiffTuft.scale = [1.0, 0.85, 1.15];
      quiffTuft.rotation = [0.45, 0, 0];
      head.add(at(quiffTuft, 0, 0.185, 0.095));
    } else if (isHoops) {
      // HOOPS #23: High Afro Dome on Top of Crown + Metallic Gold Headband
      const afroDome = mk(geo.sphere(0.165, 18, 14), hairCol, { spec: 0.18, shininess: 24 });
      afroDome.scale = [0.95, 1.05, 0.96];
      head.add(at(afroDome, 0, 0.175, 0.005));

      // Metallic Gold Headband wrapping across hairline
      const headband = mk(geo.torus(0.174, 0.015, 32, 8), goldCol, { spec: 0.85, shininess: 85 });
      headband.scale = [0.96, 0.96, 1.02];
      headband.rotation = [Math.PI / 2 + 0.10, 0, 0];
      head.add(at(headband, 0, 0.135, 0.020));
    } else {
      // KEEPER #1: Military Crew Cut Crown
      const crewCrown = mk(geo.sphere(0.162, 18, 14), hairCol, { spec: 0.22 });
      crewCrown.scale = [0.95, 1.02, 1.00];
      head.add(at(crewCrown, 0, 0.160, -0.010));
    }

    pivot.add(head);

    // =========================================================================
    // 3. ANATOMICAL ARMS & SEAMLESS ROTATING DELTOID SHOULDERS
    // =========================================================================
    const armL = new sc.Node();
    const armR = new sc.Node();
    const elbowL = new sc.Node();
    const elbowR = new sc.Node();

    for (const [arm, elbow, sx] of [[armL, elbowL, -0.25], [armR, elbowR, 0.25]]) {
      arm.setPos(sx, 1.54, 0);

      // Deltoid shoulder attached to ARM root (rotates naturally with arm!)
      const deltCol = isFooty ? whiteCol : (isKeeper ? 0x0f172a : skinCol);
      const delt = mk(geo.sphere(0.100, 16, 12), deltCol, { skin: (isHoops), fabric: (!isHoops) });
      delt.scale = [0.94, 1.06, 0.92];
      arm.add(delt);

      // Upper arm / Biceps muscle capsule
      arm.add(at(mk(geo.capsule(0.066, 0.30, 14, 4), skinCol, { skin: true }), 0, -0.14, 0));

      if (isFooty) {
        // Football: White raglan jersey sleeve
        arm.add(at(mk(geo.cylinder(0.088, 0.078, 0.20, 16), whiteCol, { fabric: true }), 0, -0.08, 0));
        arm.add(at(mk(geo.cylinder(0.080, 0.080, 0.030, 16), cyanCol), 0, -0.175, 0));

        // Captain's Gold Armband on Left Arm (sx < 0)
        if (sx < 0) {
          const cBand = mk(geo.cylinder(0.082, 0.082, 0.065, 16), goldCol, { spec: 0.85, shininess: 85 });
          arm.add(at(cBand, 0, -0.130, 0));
        }
      } else if (isHoops) {
        // Basketball: Gold shoulder strap trim
        arm.add(at(mk(geo.cylinder(0.092, 0.088, 0.035, 16), goldCol, { spec: 0.75 }), 0, -0.015, 0));

        // Compression Shooting Sleeve on Left Arm
        if (sx < 0) {
          arm.add(at(mk(geo.cylinder(0.074, 0.068, 0.28, 16), 0x111318, { spec: 0.35 }), 0, -0.14, 0));
        }
      } else {
        // Goalkeeper: Padded charcoal sleeve
        arm.add(at(mk(geo.cylinder(0.086, 0.078, 0.22, 16), 0x0f172a, { fabric: true }), 0, -0.08, 0));
      }

      // Forearm & Elbow Joint
      elbow.setPos(0, -0.28, 0);

      // Forearm sleeve or skin
      const forearmSkin = (isHoops && sx < 0) ? 0x111318 : skinCol;
      elbow.add(at(mk(geo.capsule(0.058, 0.32, 14, 4), forearmSkin, { skin: (sx >= 0 || !isHoops) }), 0, -0.15, 0));

      // Hoops Right Wristband (sx > 0)
      if (isHoops && sx > 0) {
        elbow.add(at(mk(geo.cylinder(0.068, 0.068, 0.045, 14), goldCol, { spec: 0.85, shininess: 85 }), 0, -0.28, 0));
      }

      // Athletic Hand / Goalie Glove
      if (isKeeper) {
        // Pro Goalkeeper Grip Glove
        const glove = mk(geo.box(0.075, 0.120, 0.055), 0x0f172a, { spec: 0.5 });
        elbow.add(at(glove, 0, -0.34, 0.01));

        // Emerald Grip Palm & Fingers
        const gripPalm = mk(geo.box(0.068, 0.095, 0.015), greenCol, { spec: 0.85, shininess: 70 });
        elbow.add(at(gripPalm, 0, -0.34, 0.034));
      } else {
        // Stylized Athletic Hand
        const hand = mk(geo.box(0.062, 0.110, 0.048), skinCol, { skin: true });
        elbow.add(at(hand, 0, -0.34, 0.01));
      }

      arm.add(elbow);
      pivot.add(arm);
    }

    // =========================================================================
    // 4. ATHLETIC SHORTS, MUSCULAR LEGS & PRO FOOTWEAR
    // =========================================================================
    // Shorts Waist & Seat
    const hip = mk(geo.cylinder(0.22, 0.24, 0.24, 18), shortsCol, { fabric: true });
    hip.scale = [1.16, 1.0, 0.76];
    pivot.add(at(hip, 0, 0.94, 0));

    // Gold / White waistband trim
    const waistTrimCol = isHoops ? goldCol : (isFooty ? cyanCol : greenCol);
    const waistTrim = mk(geo.torus(0.23, 0.014, 28, 8), waistTrimCol, { spec: 0.65 });
    waistTrim.scale = [1.16, 0.76, 1.0];
    waistTrim.rotation = [Math.PI / 2, 0, 0];
    pivot.add(at(waistTrim, 0, 1.05, 0));

    const legL = new sc.Node();
    const legR = new sc.Node();
    const kneeL = new sc.Node();
    const kneeR = new sc.Node();

    for (const [leg, knee, sx] of [[legL, kneeL, -0.13], [legR, kneeR, 0.13]]) {
      leg.setPos(sx, 0.96, 0);

      // Flared athletic shorts leg
      const shortsLen = isHoops ? 0.46 : (isKeeper ? 0.36 : 0.32);
      const shortsLeg = mk(geo.cylinder(0.145, 0.165, shortsLen, 18), shortsCol, { fabric: true });
      leg.add(at(shortsLeg, 0, -shortsLen * 0.5, 0));

      // Hem trim on shorts
      const hemCol = isHoops ? goldCol : (isFooty ? whiteCol : greenCol);
      const hem = mk(geo.cylinder(0.168, 0.168, 0.035, 18), hemCol, { fabric: true, spec: isHoops ? 0.8 : 0.35 });
      leg.add(at(hem, 0, -shortsLen + 0.015, 0));

      // Thigh muscle capsule
      leg.add(at(mk(geo.capsule(0.086, 0.42, 16, 4), skinCol, { skin: true }), 0, -0.21, 0));

      // Knee joint & Shin
      knee.setPos(0, -0.42, 0);

      // Patella Knee Cap (covers joint smoothly during bending!)
      const patella = mk(geo.sphere(0.076, 14, 10), skinCol, { skin: true });
      patella.scale = [1.0, 0.9, 1.1];
      knee.add(at(patella, 0, 0, 0.015));

      // Shin / Calf muscle capsule
      knee.add(at(mk(geo.capsule(0.074, 0.46, 16, 4), skinCol, { skin: true }), 0, -0.21, 0));

      if (isFooty) {
        // High Compression Soccer Socks (Cyan with dual white bands)
        knee.add(at(mk(geo.cylinder(0.086, 0.076, 0.42, 16), sockCol, { fabric: true }), 0, -0.20, 0));
        knee.add(at(mk(geo.cylinder(0.089, 0.089, 0.030, 16), whiteCol), 0, -0.04, 0));
        knee.add(at(mk(geo.cylinder(0.088, 0.088, 0.030, 16), whiteCol), 0, -0.10, 0));

        // Speed Soccer Cleats
        knee.add(at(mk(geo.box(0.155, 0.085, 0.28), bootCol, { shoe: true }), 0, -0.45, 0.05));
        const toe = mk(geo.sphere(0.078, 14, 10), bootCol, { shoe: true });
        toe.scale = [1.0, 0.82, 1.25];
        knee.add(at(toe, 0, -0.45, 0.18));

        // Dynamic White Speed Streak
        const streak = mk(geo.box(0.165, 0.025, 0.18), whiteCol, { shoe: true, spec: 0.9 });
        knee.add(at(streak, 0, -0.44, 0.05));

        // Carbon Sole Plate & Chrome Studs
        knee.add(at(mk(geo.box(0.165, 0.025, 0.32), darkCol, { shoe: true }), 0, -0.495, 0.06));
        const studMat = { shoe: true, spec: 0.92, shininess: 90 };
        for (const [stx, stz] of [[-0.048, 0.16], [0.048, 0.16], [-0.046, 0.06], [0.046, 0.06], [-0.040, -0.06], [0.040, -0.06]]) {
          knee.add(at(mk(geo.cylinder(0.014, 0.010, 0.030, 8), 0x94a3b8, studMat), stx, -0.515, stz));
        }
      } else if (isHoops) {
        // High-Top Double Ribbed White Crew Socks
        knee.add(at(mk(geo.cylinder(0.086, 0.078, 0.30, 14), whiteCol, { fabric: true }), 0, -0.28, 0));
        knee.add(at(mk(geo.cylinder(0.088, 0.088, 0.025, 14), goldCol), 0, -0.18, 0));

        // Pro High-Top Basketball Sneaker
        // Ankle Collar
        knee.add(at(mk(geo.cylinder(0.096, 0.096, 0.12, 16), bootCol, { shoe: true }), 0, -0.38, 0.02));

        // Sneaker Body & Sculpted Toe
        knee.add(at(mk(geo.box(0.175, 0.110, 0.30), bootCol, { shoe: true }), 0, -0.44, 0.05));
        const toe = mk(geo.sphere(0.086, 14, 10), bootCol, { shoe: true });
        toe.scale = [1.02, 0.78, 1.15];
        knee.add(at(toe, 0, -0.45, 0.19));

        // Thick White EVA Midsole
        knee.add(at(mk(geo.box(0.188, 0.050, 0.35), whiteCol, { shoe: true }), 0, -0.490, 0.06));

        // Gold Visible Air Max Cushion Window
        const airWindow = mk(geo.box(0.065, 0.028, 0.11), goldCol, { shoe: true, spec: 0.95, shininess: 95 });
        knee.add(at(airWindow, sx < 0 ? -0.092 : 0.092, -0.490, -0.04));

        // Charcoal Traction Outsole
        knee.add(at(mk(geo.box(0.192, 0.018, 0.355), 0x1e293b, { shoe: true }), 0, -0.520, 0.06));
      } else {
        // Goalkeeper High Grip Turf Cleats
        knee.add(at(mk(geo.cylinder(0.086, 0.076, 0.42, 16), 0x1e293b, { fabric: true }), 0, -0.20, 0));
        knee.add(at(mk(geo.cylinder(0.089, 0.089, 0.030, 16), greenCol), 0, -0.04, 0));

        knee.add(at(mk(geo.box(0.165, 0.095, 0.30), 0x0f172a, { shoe: true }), 0, -0.45, 0.05));
        const toe = mk(geo.sphere(0.082, 14, 10), greenCol, { shoe: true });
        toe.scale = [1.0, 0.80, 1.20];
        knee.add(at(toe, 0, -0.45, 0.18));

        knee.add(at(mk(geo.box(0.175, 0.035, 0.33), 0x10b981, { shoe: true }), 0, -0.495, 0.06));
      }

      leg.add(knee);
      pivot.add(leg);
    }

    return {
      root,
      pivot,
      torso,
      head,
      armL,
      armR,
      elbowL,
      elbowR,
      legL,
      legR,
      kneeL,
      kneeR,
      // Articulated joint node references for deformHeroAthlete:
      torsoNode: torso,
      headNode: head,
      upperArmLNode: armL,
      forearmLNode: elbowL,
      upperArmRNode: armR,
      forearmRNode: elbowR,
      thighLNode: legL,
      shinLNode: kneeL,
      thighRNode: legR,
      shinRNode: kneeR,
      charType,
      isGLB: true,
      isArticulated: true,
      athleteHeight: 1.0
    };
  }

  // --- High-Resolution Vector Athlete Badge (Front Chest & Back) ---
  function makeAthleteBadge(charType, isBack, emblemImg) {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');

    const isFooty = charType === 'footy';
    const isKeeper = charType === 'keeper';

    const numberStr = isFooty ? '10' : (isKeeper ? '1' : '23');
    const nameStr = isFooty ? 'FOOTY' : (isKeeper ? 'KEEPER' : 'HOOPS');
    const primaryCol = isFooty ? '#00f0ff' : (isKeeper ? '#10b981' : '#f59e0b');
    const strokeCol = '#050811';

    ctx.save();

    if (!isBack) {
      // FRONT: Smooth dark underlay to cleanly cover AI blurred letters
      const grad = ctx.createRadialGradient(256, 230, 40, 256, 230, 240);
      if (isFooty) {
        grad.addColorStop(0, 'rgba(0, 42, 85, 0.96)');
        grad.addColorStop(0.72, 'rgba(0, 32, 70, 0.88)');
        grad.addColorStop(1, 'rgba(0, 18, 45, 0.0)');
      } else if (isKeeper) {
        grad.addColorStop(0, 'rgba(10, 35, 20, 0.96)');
        grad.addColorStop(0.72, 'rgba(8, 28, 16, 0.88)');
        grad.addColorStop(1, 'rgba(5, 18, 10, 0.0)');
      } else {
        grad.addColorStop(0, 'rgba(15, 18, 24, 0.98)');
        grad.addColorStop(0.72, 'rgba(15, 18, 24, 0.92)');
        grad.addColorStop(1, 'rgba(15, 18, 24, 0.0)');
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(256, 230, 245, 220, 0, 0, Math.PI * 2);
      ctx.fill();

      // Official FVH Emblem on upper chest
      if (emblemImg && emblemImg.complete && emblemImg.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.85)';
        ctx.shadowBlur = 8;
        ctx.drawImage(emblemImg, 256 - 44, 40, 88, 88);
        ctx.restore();
      }

      // Athletic Varsity Wordmark
      ctx.font = '900 66px "Impact", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = primaryCol;
      ctx.strokeStyle = strokeCol;
      ctx.lineWidth = 14;
      ctx.strokeText(nameStr, 256, 172);
      ctx.fillText(nameStr, 256, 172);

      // White inner pinstripe on text
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.strokeText(nameStr, 256, 172);

      // Bold Player Number
      ctx.font = '900 176px "Impact", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.lineWidth = 26;
      ctx.strokeStyle = strokeCol;
      ctx.strokeText(numberStr, 256, 316);
      ctx.fillText(numberStr, 256, 316);

      // Inner highlight pinstripe
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.strokeText(numberStr, 256, 316);
    } else {
      // BACK: Large bold squad number and player surname
      const grad = ctx.createRadialGradient(256, 256, 50, 256, 256, 240);
      if (isFooty) {
        grad.addColorStop(0, 'rgba(0, 42, 85, 0.92)');
        grad.addColorStop(0.70, 'rgba(0, 32, 70, 0.85)');
        grad.addColorStop(1, 'rgba(0, 18, 45, 0.0)');
      } else if (isKeeper) {
        grad.addColorStop(0, 'rgba(10, 35, 20, 0.92)');
        grad.addColorStop(0.70, 'rgba(8, 28, 16, 0.85)');
        grad.addColorStop(1, 'rgba(5, 18, 10, 0.0)');
      } else {
        grad.addColorStop(0, 'rgba(15, 18, 24, 0.95)');
        grad.addColorStop(0.70, 'rgba(15, 18, 24, 0.88)');
        grad.addColorStop(1, 'rgba(15, 18, 24, 0.0)');
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(256, 256, 240, 220, 0, 0, Math.PI * 2);
      ctx.fill();

      // Player Name
      ctx.font = '900 58px "Impact", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = strokeCol;
      ctx.lineWidth = 12;
      ctx.strokeText(nameStr, 256, 120);
      ctx.fillText(nameStr, 256, 120);

      // Huge Squad Number
      ctx.font = '900 240px "Impact", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.lineWidth = 32;
      ctx.strokeStyle = strokeCol;
      ctx.strokeText(numberStr, 256, 300);
      ctx.fillStyle = primaryCol;
      ctx.fillText(numberStr, 256, 300);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5;
      ctx.strokeText(numberStr, 256, 300);
    }

    ctx.restore();
    return c;
  }

  // --- Stylized 3D Character Model Loader & Enhancer (Fortnite / Pixar Style) ---
  // --- High-Fidelity 3D Character Model Loader (Real GLB Meshes) ---
  async function loadGLBHeroCharacter(charType, emblemImg) {
    const isFooty = (charType === 'footy');
    const isHoops = (charType === 'hoops');
    const isKeeper = (charType === 'keeper');

    const fileName = isKeeper ? 'keeper1.glb' : (isHoops ? 'hoops23.glb' : 'footy10.glb');
    const glbUrl = 'assets/characters/' + fileName;

    try {
      const resp = await fetch(glbUrl);
      if (!resp.ok) throw new Error('GLB HTTP ' + resp.status);
      const ab = await resp.arrayBuffer();

      const loader = (typeof window !== 'undefined' && window.GLBLoader) || (typeof globalThis !== 'undefined' && globalThis.GLBLoader);
      if (!loader || !loader.parseGLBContainer) throw new Error('GLBLoader not available');
      const { gltf, bin } = loader.parseGLBContainer(ab);

      function getAcc(idx) {
        const acc = gltf.accessors[idx];
        const bv = gltf.bufferViews[acc.bufferView];
        const offset = (bv.byteOffset || 0) + (acc.byteOffset || 0);
        if (acc.componentType === 5126) return new Float32Array(bin, offset, acc.count * (acc.type === 'VEC3' ? 3 : 2));
        if (acc.componentType === 5125) return new Uint32Array(bin, offset, acc.count);
        if (acc.componentType === 5123) return new Uint16Array(bin, offset, acc.count);
        return null;
      }

      const prim = gltf.meshes[0].primitives[0];
      const posRaw = getAcc(prim.attributes.POSITION);
      const uvRaw = getAcc(prim.attributes.TEXCOORD_0);
      const indices = getAcc(prim.indices);

      // Extract high-resolution texture (prefer final_texture.png with clean face projection)
      const imgDef = gltf.images[0];
      const bv = gltf.bufferViews[imgDef.bufferView];
      const imgBytes = new Uint8Array(bin, bv.byteOffset || 0, bv.byteLength);
      const blob = new Blob([imgBytes], { type: imgDef.mimeType || 'image/png' });
      const blobUrl = URL.createObjectURL(blob);

      const texFileName = isKeeper ? 'keeper1_final_texture.png' : (isHoops ? 'hoops23_final_texture.png' : 'footy10_final_texture.png');
      const img = new Image();
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = () => {
          img.onload = resolve;
          img.src = blobUrl;
        };
        img.src = 'assets/characters/' + texFileName;
      });

      const sc = getScene();
      const geoMod = getG();

      const pos = new Float32Array(posRaw);
      if (isHoops) {
        // Taper excessive scapular/lat protrusion on Hoops back so front silhouette is clean
        for (let i = 0; i < pos.length; i += 3) {
          const bx = pos[i];
          const by = pos[i+1];
          const bz = pos[i+2];
          if (bz < -0.012 && by > 0.05 && by < 0.35) {
            const width = Math.abs(bx);
            if (width > 0.125) {
              const sign = Math.sign(bx);
              pos[i] = sign * (0.125 + (width - 0.125) * 0.30);
            }
          }
        }
      }

      // Compute smooth vertex normals from polished geometry
      const normals = new Float32Array(pos.length);
      for (let i = 0; i < indices.length; i += 3) {
        const i0 = indices[i] * 3, i1 = indices[i+1] * 3, i2 = indices[i+2] * 3;
        const ax = pos[i1] - pos[i0], ay = pos[i1+1] - pos[i0+1], az = pos[i1+2] - pos[i0+2];
        const bx = pos[i2] - pos[i0], by = pos[i2+1] - pos[i0+1], bz = pos[i2+2] - pos[i0+2];
        const nx = ay * bz - az * by;
        const ny = az * bx - ax * bz;
        const nz = ax * by - ay * bx;
        normals[i0] += nx; normals[i0+1] += ny; normals[i0+2] += nz;
        normals[i1] += nx; normals[i1+1] += ny; normals[i1+2] += nz;
        normals[i2] += nx; normals[i2+1] += ny; normals[i2+2] += nz;
      }
      for (let i = 0; i < normals.length; i += 3) {
        const l = Math.hypot(normals[i], normals[i+1], normals[i+2]) || 1;
        normals[i] /= l; normals[i+1] /= l; normals[i+2] /= l;
      }

      const tex = new sc.Texture(img);
      const mat = sc.material({
        texture: tex,
        spec: 0.28,
        shininess: 36,
        rim: 0.35,
        rimColor: [1.0, 0.95, 0.90],
        castShadow: true,
        receiveShadow: true
      });

      const geo = new geoMod.Geometry(pos, normals, uvRaw, indices);
      const mesh = new sc.Node(geo, mat);

      const root = new sc.Node();
      const pivot = new sc.Node();
      const bodyNode = new sc.Node();

      root.add(pivot);
      pivot.add(bodyNode);
      bodyNode.add(mesh);

      const baseH = isKeeper ? 1.88 : (isHoops ? 1.85 : 1.82);
      bodyNode.setPos(0, baseH * 0.5, 0);
      bodyNode.scale = [baseH, baseH, baseH];

      const basePositions = new Float32Array(pos);
      const weights = computeSkinWeights(basePositions, charType);

      return {
        root,
        pivot,
        bodyNode,
        mesh,
        charGeometry: geo,
        basePositions,
        currentPositions: pos,
        skinWeights: weights,
        athleteHeight: baseH,
        charType,
        isGLB: true,
        isArticulated: false,
        material: mat
      };
    } catch (err) {
      console.warn('[Studio] Fallback to procedural hero:', err);
      return buildHeroCharacter(charType, emblemImg);
    }
  }



  function computeSkinWeights(basePos, charType) {
    const count = basePos.length / 3;
    const weights = new Float32Array(count * 10);
    const isKeeper = (charType === 'keeper');
    const isHoops = (charType === 'hoops');
    const armThresh = isKeeper ? 0.20 : (isHoops ? 0.17 : 0.145);
    const neckY = isKeeper ? 0.33 : (isHoops ? 0.31 : 0.28);

    for (let i = 0; i < count; i++) {
      const bx = basePos[i * 3];
      const by = basePos[i * 3 + 1];
      const bz = basePos[i * 3 + 2];

      const wHead = clampVal((by - neckY) / 0.05, 0, 1) * (1.0 - clampVal((Math.abs(bx) - 0.10) / 0.05, 0, 1));

      const inLegL = clampVal((bx - 0.015) / 0.02, 0, 1) * (1.0 - clampVal((by - (-0.01)) / 0.03, 0, 1));
      const wShinL = inLegL * (1.0 - clampVal((by - (-0.24)) / 0.06, 0, 1));
      const wThighL = inLegL - wShinL;

      const inLegR = clampVal((-bx - 0.015) / 0.02, 0, 1) * (1.0 - clampVal((by - (-0.01)) / 0.03, 0, 1));
      const wShinR = inLegR * (1.0 - clampVal((by - (-0.24)) / 0.06, 0, 1));
      const wThighR = inLegR - wShinR;

      const inArmL = clampVal((bx - armThresh) / 0.04, 0, 1) * clampVal((by - (-0.05)) / 0.15, 0, 1);
      const wForearmL = inArmL * (1.0 - clampVal((by - 0.10) / 0.08, 0, 1));
      const wArmL = inArmL - wForearmL;

      const inArmR = clampVal((-bx - armThresh) / 0.04, 0, 1) * clampVal((by - (-0.05)) / 0.15, 0, 1);
      const wForearmR = inArmR * (1.0 - clampVal((by - 0.10) / 0.08, 0, 1));
      const wArmR = inArmR - wForearmR;

      const nonTorso = wHead + inLegL + inLegR + inArmL + inArmR;
      const wTorso = Math.max(0, 1.0 - nonTorso);

      const off = i * 10;
      weights[off] = wHead;
      weights[off + 1] = wThighL;
      weights[off + 2] = wShinL;
      weights[off + 3] = wThighR;
      weights[off + 4] = wShinR;
      weights[off + 5] = wArmL;
      weights[off + 6] = wForearmL;
      weights[off + 7] = wArmR;
      weights[off + 8] = wForearmR;
      weights[off + 9] = wTorso;
    }
    return weights;
  }

  function clampVal(v, min, max) {
    return v < min ? min : (v > max ? max : v);
  }

  /**
   * High-Performance Stylized 3D Skeletal Deformation Engine
   * Smooth Linear Blend Skinning across Head, Spine/Chest, Shoulders/Elbows, Hips/Knees
   */
  function deformHeroAthlete(charObj, pose, t, options) {
    if (!charObj) return null;

    const basePos = charObj.basePositions;
    const curPos = charObj.currentPositions;
    const count = basePos ? (basePos.length / 3) : 0;
    const charType = charObj.charType;
    const isFooty = (charType === 'footy');
    const isHoops = (charType === 'hoops');
    const isKeeper = (charType === 'keeper');
    const speedMul = (options && options.speed) || 1.0;
    const simT = t * speedMul;

    let legLPitch = 0, legRPitch = 0;
    let kneeLPitch = 0, kneeRPitch = 0;
    let legLSpread = 0, legRSpread = 0;
    let armLPitch = 0, armRPitch = 0;
    let armLSpread = 0, armRSpread = 0;
    let armLRoll = 0, armRRoll = 0;
    let elbowLPitch = 0, elbowRPitch = 0;
    let headPitch = 0, headYaw = 0, headRoll = 0;
    let chestPitch = 0, chestYaw = 0, chestRoll = 0;
    let breathScale = 1.0;
    let lift = 0, leanX = 0, leanZ = 0;
    let bodyPitch = 0, bodyYaw = 0, bodyRoll = 0;
    let scaleX = 1.0, scaleY = 1.0, scaleZ = 1.0;

    // Ball state to synchronize interactive 3D prop
    const ballState = {
      visible: true,
      x: 0,
      y: 0.12,
      z: 0.45,
      scale: isHoops ? 1.08 : 0.95,
      rotX: 0, rotY: 0, rotZ: 0
    };

    if (pose === 'idle') {
      // 1. Confident Athletic Stance with Natural Breathing & Weight Transfer
      const breathCycle = Math.sin(simT * 2.2);
      const swayCycle = Math.sin(simT * 1.1);

      breathScale = 1.0 + breathCycle * 0.035;
      lift = breathCycle * 0.012;
      leanX = swayCycle * 0.018;
      bodyRoll = swayCycle * 0.018;

      headPitch = Math.sin(simT * 1.5) * 0.030;
      headYaw = Math.sin(simT * 0.8) * 0.08;
      headRoll = -swayCycle * 0.015;

      // Relaxed natural arms (clean rest posture for GLB models, procedural bends for articulated)
      if (charObj.isGLB) {
        armLPitch = 0; armLSpread = 0; elbowLPitch = 0;
        armRPitch = 0; armRSpread = 0; elbowRPitch = 0;
        legLSpread = 0; legRSpread = 0; kneeLPitch = 0; kneeRPitch = 0;
      } else {
        armLPitch = 0.08 + Math.sin(simT * 1.5) * 0.03;
        armLSpread = 0.08;
        elbowLPitch = 0.22;

        armRPitch = 0.08 - Math.sin(simT * 1.5) * 0.03;
        armRSpread = 0.08;
        elbowRPitch = 0.22;

        legLSpread = 0.04;
        legRSpread = 0.04;
        kneeLPitch = 0.05;
        kneeRPitch = 0.05;
      }

      ballState.x = isFooty ? 0.32 : (isHoops ? 0.38 : 0.30);
      ballState.y = isHoops ? 0.82 + breathCycle * 0.02 : 0.11;
      ballState.z = isHoops ? 0.18 : 0.20;

      if (charObj.isGLB) {
        charObj.pivot.position[0] = leanX;
        charObj.pivot.position[1] = lift;
        charObj.pivot.position[2] = leanZ;
        charObj.pivot.rotation[0] = bodyPitch;
        charObj.pivot.rotation[1] = bodyYaw;
        charObj.pivot.rotation[2] = bodyRoll;

        if (curPos && basePos) {
          curPos.set(basePos);
          if (charObj.charGeometry) charObj.charGeometry.dirty = true;
        }
        return ballState;
      }
    }
    else if (pose === 'run') {
      // 2. High-Performance Kinetic Sprint (Fortnite Aerodynamic Drive)
      const stride = simT * 7.5;
      const legSin = Math.sin(stride);
      const legCos = Math.cos(stride);
      const bounce = Math.abs(legSin);

      bodyPitch = 0.24; // Aerodynamic forward lean
      lift = bounce * 0.085;
      bodyRoll = legSin * 0.045;
      chestYaw = -legSin * 0.12;

      scaleY = 0.96 + bounce * 0.08;
      scaleX = 1.0 / Math.sqrt(scaleY);
      scaleZ = scaleX;

      legLPitch = legSin * 0.72;
      kneeLPitch = Math.max(0, legSin) * 1.25;

      legRPitch = -legSin * 0.72;
      kneeRPitch = Math.max(0, -legSin) * 1.25;

      armLPitch = -legSin * 0.88;
      armLSpread = 0.12;
      elbowLPitch = 0.85 + Math.max(0, -legSin) * 0.45;

      armRPitch = legSin * 0.88;
      armRSpread = 0.12;
      elbowRPitch = 0.85 + Math.max(0, legSin) * 0.45;

      headPitch = -bodyPitch * 0.65;

      if (isHoops) {
        const dribbleProgress = (stride * 1.5) % Math.PI;
        ballState.x = 0.38 + legSin * 0.05;
        ballState.y = 0.12 + Math.abs(Math.sin(dribbleProgress)) * 0.75;
        ballState.z = 0.28;
      } else {
        ballState.x = legSin * 0.08;
        ballState.y = 0.12 + bounce * 0.05;
        ballState.z = 0.45 + legCos * 0.12;
      }
    }
    else if (pose === 'action') {
      // 3. Signature Cinematic Action Move
      const cycleDur = 3.0;
      const progress = (simT % cycleDur) / cycleDur;

      if (isFooty) {
        // --- FOOTY: Acrobatic Bicycle Kick / Volley Strike ---
        if (progress < 0.22) {
          const p = progress / 0.22;
          lift = -0.16 * Math.sin(p * Math.PI);
          bodyPitch = 0.18 * p;
          legLPitch = 0.35 * p; kneeLPitch = 0.55 * p;
          legRPitch = -0.45 * p; kneeRPitch = 0.25 * p;
          armLPitch = -0.35 * p; armRPitch = 0.35 * p;
          ballState.x = 0.10; ballState.y = 0.12 + p * 0.85; ballState.z = 0.35;
        } else if (progress < 0.55) {
          const p = (progress - 0.22) / 0.33;
          lift = 0.15 + Math.sin(p * Math.PI) * 0.75;
          bodyPitch = -p * Math.PI * 2.0; // 360° backflip
          bodyRoll = Math.sin(p * Math.PI) * 0.18;

          if (p < 0.55) {
            legLPitch = 0.75; kneeLPitch = 0.8;
            legRPitch = -0.95; kneeRPitch = 1.1;
            ballState.x = 0.05; ballState.y = 1.45 + Math.sin(p * Math.PI) * 0.3; ballState.z = 0.30;
          } else {
            legLPitch = -0.8; kneeLPitch = 0.1;
            legRPitch = 2.15; kneeRPitch = 0.05; // Scissor strike snap!
            const blastP = (p - 0.55) / 0.45;
            ballState.x = blastP * 0.2; ballState.y = 1.55 - blastP * 0.4; ballState.z = 0.30 + blastP * 2.8;
          }
          armLPitch = 0.85; armRPitch = -0.85; armLSpread = 0.35; armRSpread = 0.35;
        } else if (progress < 0.78) {
          const p = (progress - 0.55) / 0.23;
          lift = -0.18 * (1.0 - p * 0.5);
          bodyPitch = 0.35 * (1.0 - p);
          legLPitch = 0.65; kneeLPitch = 1.25;
          legRPitch = -0.25; kneeRPitch = 0.85;
          armLPitch = 0.95;
          ballState.x = 0.3; ballState.y = 0.12; ballState.z = 1.8 + (1 - p) * 0.4;
        } else {
          const p = (progress - 0.78) / 0.22;
          lift = -0.09 * (1.0 - p);
          bodyPitch = 0;
          legLPitch = 0.1 * (1.0 - p);
          legRPitch = -0.1 * (1.0 - p);
          armLPitch = 0.2 * (1.0 - p);
          ballState.x = 0.25; ballState.y = 0.12; ballState.z = 0.45;
        }
      }
      else if (isHoops) {
        // --- HOOPS: 360° Tomahawk Meteor Dunk ---
        if (progress < 0.20) {
          const p = progress / 0.20;
          lift = -0.20 * Math.sin(p * Math.PI);
          bodyPitch = 0.22 * p;
          legLPitch = 0.45 * p; kneeLPitch = 0.85 * p;
          legRPitch = 0.45 * p; kneeRPitch = 0.85 * p;
          armLPitch = 0.25 * p; armRPitch = 0.25 * p;
          ballState.x = 0.25; ballState.y = 0.75 - p * 0.35; ballState.z = 0.35;
        } else if (progress < 0.60) {
          const p = (progress - 0.20) / 0.40;
          lift = Math.sin(p * Math.PI) * 0.85;
          bodyYaw = p * Math.PI * 2.0; // 360° airborne spin!
          bodyPitch = -0.12 * Math.sin(p * Math.PI);

          // Cock-back Tomahawk behind head!
          armRPitch = -2.35 + Math.sin(p * Math.PI) * 0.35;
          armRSpread = 0.22;
          elbowRPitch = 0.85;

          armLPitch = 0.65;
          armLSpread = 0.25;
          elbowLPitch = 0.45;

          legLPitch = 0.35; kneeLPitch = 0.75;
          legRPitch = -0.25; kneeRPitch = 0.55;

          ballState.x = 0.18;
          ballState.y = 1.45 + lift * 0.45;
          ballState.z = -0.18;
        } else if (progress < 0.75) {
          const p = (progress - 0.60) / 0.15;
          lift = 0.55 * (1.0 - p * 0.8);
          armRPitch = 0.85; // Hammer down through rim!
          elbowRPitch = 0.20;
          bodyPitch = 0.28;
          ballState.x = 0.05; ballState.y = 0.25 + (1 - p) * 1.0; ballState.z = 0.50;
        } else {
          const p = (progress - 0.75) / 0.25;
          lift = -0.10 * (1.0 - p);
          kneeLPitch = 0.65 * (1.0 - p);
          kneeRPitch = 0.65 * (1.0 - p);
          armLPitch = 0.15; elbowLPitch = 0.25;
          armRPitch = 0.15; elbowRPitch = 0.25;
          ballState.x = 0.35; ballState.y = 0.12; ballState.z = 0.45;
        }
      }
      else {
        // --- KEEPER: Titan Horizontal Diving Save ---
        if (progress < 0.20) {
          const p = progress / 0.20;
          lift = -0.15 * p;
          bodyRoll = 0.15 * p;
          armLPitch = -0.45 * p; armRPitch = -0.45 * p;
          ballState.x = -0.6 * p; ballState.y = 1.1 + p * 0.2; ballState.z = 0.35;
        } else if (progress < 0.62) {
          const p = (progress - 0.20) / 0.42;
          leanX = -p * 0.75;
          lift = Math.sin(p * Math.PI) * 0.58;
          bodyRoll = -1.35 * Math.sin(p * Math.PI * 0.9);
          bodyPitch = 0.15;

          // Both arms stretch out full extension!
          armLPitch = -1.95; elbowLPitch = 0.10;
          armRPitch = -2.05; elbowRPitch = 0.08;
          legLPitch = -0.35; legRPitch = 0.55;

          if (p < 0.5) {
            ballState.x = leanX - 0.25; ballState.y = 1.15 + lift * 0.3; ballState.z = 0.35;
          } else {
            const dp = (p - 0.5) / 0.5;
            ballState.x = leanX - 0.35 - dp * 1.4;
            ballState.y = 1.25 + dp * 0.6;
            ballState.z = 0.35 - dp * 0.6;
          }
        } else if (progress < 0.82) {
          const p = (progress - 0.62) / 0.20;
          leanX = -0.75 * (1.0 - p);
          lift = -0.18 * (1.0 - p);
          bodyRoll = -1.35 * (1.0 - p);
          ballState.x = -1.6; ballState.y = 0.12; ballState.z = -0.3;
        } else {
          const p = (progress - 0.82) / 0.18;
          leanX = 0; lift = 0; bodyRoll = 0;
          armLPitch = 0.15; elbowLPitch = 0.25;
          armRPitch = 0.15; elbowRPitch = 0.25;
          ballState.x = -0.5; ballState.y = 0.12; ballState.z = 0.45;
        }
      }
    }
    else if (pose === 'celebrate') {
      // 4. Iconic Victory Celebrations (Fortnite Signature)
      const cycleDur = 3.2;
      const progress = (simT % cycleDur) / cycleDur;

      if (isFooty) {
        // --- FOOTY: The Iconic "SIUUU" ---
        if (progress < 0.28) {
          const stride = progress * 24.0;
          lift = Math.abs(Math.sin(stride)) * 0.08;
          bodyPitch = 0.25;
          legLPitch = Math.sin(stride) * 0.65;
          legRPitch = -Math.sin(stride) * 0.65;
          armLPitch = -Math.sin(stride) * 0.75;
          armRPitch = Math.sin(stride) * 0.75;
        } else if (progress < 0.58) {
          const p = (progress - 0.28) / 0.30;
          lift = Math.sin(p * Math.PI) * 0.75;
          bodyYaw = p * Math.PI; // 180° airborne turn!
          armLPitch = -1.75; elbowLPitch = 0.2; armLSpread = 0.3;
          armRPitch = -1.75; elbowRPitch = 0.2; armRSpread = 0.3;
          legLPitch = -0.35; kneeLPitch = 0.45;
          legRPitch = -0.35; kneeRPitch = 0.45;
        } else {
          bodyYaw = Math.PI;
          lift = -0.06;
          bodyPitch = -0.15;
          legLSpread = 0.35; legRSpread = 0.35;
          kneeLPitch = 0.18; kneeRPitch = 0.18;
          armLPitch = 0.95; armRPitch = 0.95;
          armLSpread = 0.45; armRSpread = 0.45;
          elbowLPitch = 0.15; elbowRPitch = 0.15;
          headPitch = -0.22;
        }
        ballState.x = 0.65; ballState.y = 0.12; ballState.z = 0.45;
      }
      else if (isHoops) {
        // --- HOOPS: Acrobatic Backflip & Crown ---
        if (progress < 0.45) {
          const p = progress / 0.45;
          lift = Math.sin(p * Math.PI) * 0.80;
          bodyPitch = -p * Math.PI * 2.0;
          legLPitch = Math.sin(p * Math.PI) * 0.85; kneeLPitch = 1.1;
          legRPitch = Math.sin(p * Math.PI) * 0.85; kneeRPitch = 1.1;
          armLPitch = 0.95; armRPitch = 0.95;
        } else {
          lift = 0; bodyPitch = 0;
          // Tap chest, point to sky, adjust crown
          armLPitch = 0.15; armLSpread = 0.12; elbowLPitch = 0.25;
          armRPitch = -1.75; armRSpread = 0.35; elbowRPitch = 1.65;
          headPitch = -0.15;
          legLSpread = 0.15; legRSpread = 0.15;
        }
        ballState.x = 0.55; ballState.y = 0.12; ballState.z = 0.35;
      }
      else {
        // --- KEEPER: Titan Gorilla Chest Thump ---
        const thump = Math.sin(simT * 9.5);
        lift = Math.abs(thump) * 0.04;
        bodyPitch = -0.12;
        legLSpread = 0.25; legRSpread = 0.25;
        kneeLPitch = 0.15; kneeRPitch = 0.15;

        armLPitch = -1.15 + Math.sin(simT * 9.5) * 0.55;
        elbowLPitch = 1.45; armLSpread = 0.25;
        armRPitch = -1.15 - Math.sin(simT * 9.5) * 0.55;
        elbowRPitch = 1.45; armRSpread = 0.25;

        headPitch = -0.25 + thump * 0.08;
        ballState.x = -0.55; ballState.y = 0.12; ballState.z = 0.35;
      }
    }
    else if (pose === 'dribble') {
      // 5. Street Skill Moves & Ankle-Breaker Crossovers
      const dribbleCadence = simT * 8.5;
      const feint = Math.sin(dribbleCadence);
      const feintCos = Math.cos(dribbleCadence);

      lift = -0.10 + Math.abs(feint) * 0.05;
      bodyPitch = 0.22;
      bodyRoll = feint * 0.08;
      chestYaw = feint * 0.18;

      if (isHoops) {
        legLSpread = 0.22; legRSpread = 0.22;
        kneeLPitch = 0.55; kneeRPitch = 0.55;
        armLPitch = -0.35 + feint * 0.55; elbowLPitch = 0.95;
        armRPitch = -0.35 - feint * 0.55; elbowRPitch = 0.95;

        ballState.x = feint * 0.32;
        ballState.y = 0.12 + Math.abs(Math.sin(dribbleCadence * 2.0)) * 0.45;
        ballState.z = 0.32 + Math.abs(feintCos) * 0.15;
      } else {
        legLPitch = feint * 0.55; kneeLPitch = Math.max(0, -feint) * 0.95;
        legRPitch = -feint * 0.55; kneeRPitch = Math.max(0, feint) * 0.95;
        armLPitch = -feint * 0.45; elbowLPitch = 0.65;
        armRPitch = feint * 0.45; elbowRPitch = 0.65;

        ballState.x = feint * 0.12;
        ballState.y = 0.12;
        ballState.z = 0.42;
      }
    }

    // --- Apply Articulated Hierarchical Joint Rotations ---
    if (charObj.isArticulated) {
      charObj.pivot.position[0] = leanX;
      charObj.pivot.position[1] = lift;
      charObj.pivot.position[2] = leanZ;

      charObj.pivot.rotation[0] = bodyPitch;
      charObj.pivot.rotation[1] = bodyYaw;
      charObj.pivot.rotation[2] = bodyRoll;

      if (charObj.headNode) {
        charObj.headNode.rotation[0] = headPitch;
        charObj.headNode.rotation[1] = headYaw;
        charObj.headNode.rotation[2] = headRoll;
      }

      if (charObj.upperArmLNode) {
        charObj.upperArmLNode.rotation[0] = armLPitch;
        charObj.upperArmLNode.rotation[2] = armLSpread;
      }
      if (charObj.forearmLNode) {
        charObj.forearmLNode.rotation[0] = -elbowLPitch;
      }

      if (charObj.upperArmRNode) {
        charObj.upperArmRNode.rotation[0] = armRPitch;
        charObj.upperArmRNode.rotation[2] = -armRSpread;
      }
      if (charObj.forearmRNode) {
        charObj.forearmRNode.rotation[0] = -elbowRPitch;
      }

      if (charObj.thighLNode) {
        charObj.thighLNode.rotation[0] = -legLPitch;
        charObj.thighLNode.rotation[2] = legLSpread;
      }
      if (charObj.shinLNode) {
        charObj.shinLNode.rotation[0] = kneeLPitch;
      }

      if (charObj.thighRNode) {
        charObj.thighRNode.rotation[0] = -legRPitch;
        charObj.thighRNode.rotation[2] = -legRSpread;
      }
      if (charObj.shinRNode) {
        charObj.shinRNode.rotation[0] = kneeRPitch;
      }

      if (charObj.torsoNode) {
        charObj.torsoNode.rotation[0] = chestPitch;
        charObj.torsoNode.rotation[1] = chestYaw;
        charObj.torsoNode.rotation[2] = chestRoll;
        charObj.torsoNode.scale[0] = charObj.athleteHeight * (1.0 + (breathScale - 1.0) * 0.4);
        charObj.torsoNode.scale[1] = charObj.athleteHeight * scaleY;
        charObj.torsoNode.scale[2] = charObj.athleteHeight * (1.0 + (breathScale - 1.0) * 1.0);
      }

      return ballState;
    }

    // --- Apply Whole-Body Rigid Kinematics on Pivot & BodyNode ---
    charObj.pivot.position[0] = leanX;
    charObj.pivot.position[1] = lift;
    charObj.pivot.position[2] = leanZ;

    charObj.pivot.rotation[0] = bodyPitch;
    charObj.pivot.rotation[1] = bodyYaw;
    charObj.pivot.rotation[2] = bodyRoll;

    const baseH = charObj.athleteHeight || 1.86;
    charObj.bodyNode.position[1] = baseH * 0.5 * scaleY;
    charObj.bodyNode.scale[0] = baseH * scaleX;
    charObj.bodyNode.scale[1] = baseH * scaleY;
    charObj.bodyNode.scale[2] = baseH * scaleZ;

    // --- High-Performance Stylized 3D Skeletal Skinning on Continuous Mesh ---
    if (charObj.skinWeights && charObj.charGeometry) {
      const weights = charObj.skinWeights;
      const cosLegL = Math.cos(legLPitch), sinLegL = Math.sin(legLPitch);
      const cosKneeL = Math.cos(kneeLPitch), sinKneeL = Math.sin(kneeLPitch);
      const cosLegR = Math.cos(legRPitch), sinLegR = Math.sin(legRPitch);
      const cosKneeR = Math.cos(kneeRPitch), sinKneeR = Math.sin(kneeRPitch);
      const cosArmL = Math.cos(armLPitch), sinArmL = Math.sin(armLPitch);
      const cosArmR = Math.cos(armRPitch), sinArmR = Math.sin(armRPitch);
      const cosHeadP = Math.cos(headPitch), sinHeadP = Math.sin(headPitch);
      const cosHeadY = Math.cos(headYaw), sinHeadY = Math.sin(headYaw);

      const n = charObj.basePositions.length / 3;
      const bPos = charObj.basePositions;
      const cPos = charObj.currentPositions;

      for (let i = 0; i < n; i++) {
        const off = i * 10;
        const wHead = weights[off];
        const wThighL = weights[off + 1];
        const wShinL = weights[off + 2];
        const wThighR = weights[off + 3];
        const wShinR = weights[off + 4];
        const wArmL = weights[off + 5];
        const wForearmL = weights[off + 6];
        const wArmR = weights[off + 7];
        const wForearmR = weights[off + 8];
        const wTorso = weights[off + 9];

        const bx = bPos[i * 3];
        const by = bPos[i * 3 + 1];
        const bz = bPos[i * 3 + 2];

        let px = bx * wTorso, py = by * wTorso, pz = bz * wTorso;

        if (wHead > 0) {
          const hy = by - 0.30, hz = bz;
          const pyHead = hy * cosHeadP - hz * sinHeadP;
          const pzHead = hy * sinHeadP + hz * cosHeadP;
          const pxHead = bx * cosHeadY + pzHead * sinHeadY;
          const fzHead = -bx * sinHeadY + pzHead * cosHeadY;
          px += pxHead * wHead;
          py += (pyHead + 0.30) * wHead;
          pz += fzHead * wHead;
        }

        if (wThighL > 0) {
          const y = by - 0.00, z = bz;
          const ry = y * cosLegL - z * sinLegL;
          const rz = y * sinLegL + z * cosLegL;
          px += bx * wThighL; py += (ry + 0.00) * wThighL; pz += rz * wThighL;
        }
        if (wShinL > 0) {
          const ky = by - (-0.22), kz = bz;
          const kry = ky * cosKneeL - kz * sinKneeL + (-0.22);
          const krz = ky * sinKneeL + kz * cosKneeL;
          const ry = kry * cosLegL - krz * sinLegL;
          const rz = kry * sinLegL + krz * cosLegL;
          px += bx * wShinL; py += ry * wShinL; pz += rz * wShinL;
        }

        if (wThighR > 0) {
          const y = by - 0.00, z = bz;
          const ry = y * cosLegR - z * sinLegR;
          const rz = y * sinLegR + z * cosLegR;
          px += bx * wThighR; py += (ry + 0.00) * wThighR; pz += rz * wThighR;
        }
        if (wShinR > 0) {
          const ky = by - (-0.22), kz = bz;
          const kry = ky * cosKneeR - kz * sinKneeR + (-0.22);
          const krz = ky * sinKneeR + kz * cosKneeR;
          const ry = kry * cosLegR - krz * sinLegR;
          const rz = kry * sinLegR + krz * cosLegR;
          px += bx * wShinR; py += ry * wShinR; pz += rz * wShinR;
        }

        if (wArmL > 0 || wForearmL > 0) {
          const wTotal = wArmL + wForearmL;
          const y = by - 0.24, z = bz;
          const ry = y * cosArmL - z * sinArmL;
          const rz = y * sinArmL + z * cosArmL;
          px += bx * wTotal; py += (ry + 0.24) * wTotal; pz += rz * wTotal;
        }
        if (wArmR > 0 || wForearmR > 0) {
          const wTotal = wArmR + wForearmR;
          const y = by - 0.24, z = bz;
          const ry = y * cosArmR - z * sinArmR;
          const rz = y * sinArmR + z * cosArmR;
          px += bx * wTotal; py += (ry + 0.24) * wTotal; pz += rz * wTotal;
        }

        cPos[i * 3] = px; cPos[i * 3 + 1] = py; cPos[i * 3 + 2] = pz;
      }
      charObj.charGeometry.dirty = true;
    }

    return ballState;
  }

  exports.makeFaceTexture = makeFaceTexture;
  exports.makeHeadWrapTexture = makeHeadWrapTexture;
  exports.makeUniformWrapTexture = makeUniformWrapTexture;
  exports.makeAthleteBadge = makeAthleteBadge;
  exports.loadGLBHeroCharacter = loadGLBHeroCharacter;
  exports.deformHeroAthlete = deformHeroAthlete;
  exports.buildHeroCharacter = buildHeroCharacter;
});
