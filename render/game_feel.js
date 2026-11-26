/**
 * Footy vs Hoops — 3D Game Feel Engine (v5.1)
 *
 * Modular gameplay juice & contact realism:
 *  - Micro Hit-Stop (tactile impact freeze frames on dunks, post clanks, steals & power shots)
 *  - Directional Camera Punch + Dynamic FOV Zoom Kick
 *  - Surface-specific 3D Particles (Football turf/grass spray, Basketball hardwood dust & rim sparks, contact ripples)
 *  - Magnetic 3D Hand-to-Ball Dribble Socket & Bounce Squash-and-Stretch
 */
(function (global) {
  'use strict';

  function clamp(v, lo, hi) {
    return v < lo ? lo : (v > hi ? hi : v);
  }

  // Trigger brief tactile freeze-frame on heavy impacts (ignored in demo or reducedMotion)
  function triggerHitStop(game, seconds) {
    if (!game || !seconds || seconds <= 0) return;
    if (game.cfg && game.cfg.demo) return;
    if (typeof game.reducedFx === 'function' && game.reducedFx()) return;
    game.hitStopT = Math.min(0.06, Math.max(game.hitStopT || 0, seconds));
  }

  function consumeHitStop(game, dt) {
    if (!game || !game.hitStopT || game.hitStopT <= 0) return false;
    game.hitStopT = Math.max(0, game.hitStopT - dt);
    return true;
  }

  // Directional camera recoil + temporary FOV punch layered onto CameraRig
  function punchCamera(rig, dirX, dirZ, strength, fovKickDeg) {
    if (!rig) return;
    const len = Math.hypot(dirX || 0, dirZ || 0) || 1;
    const nx = (dirX || 0) / len;
    const nz = (dirZ || 0) / len;
    const mag = clamp(strength || 0.25, 0, 1.0);
    rig.punchX = (rig.punchX || 0) + nx * mag * 0.42;
    rig.punchY = (rig.punchY || 0) - mag * 0.16;
    rig.punchZ = (rig.punchZ || 0) + nz * mag * 0.42;
    if (fovKickDeg) {
      rig.punchFov = clamp((rig.punchFov || 0) - Math.abs(fovKickDeg), -4.0, 2.5);
    }
    if (typeof rig.shake === 'function') {
      rig.shake(mag * 0.65);
    }
  }

  function stepCameraImpulse(rig, baseFov, dt) {
    if (!rig || !rig.cam) return;
    const k = Math.exp(-Math.min(0.08, dt) * 16);
    rig.punchX = (rig.punchX || 0) * k;
    rig.punchY = (rig.punchY || 0) * k;
    rig.punchZ = (rig.punchZ || 0) * k;
    rig.punchFov = (rig.punchFov || 0) * Math.exp(-Math.min(0.08, dt) * 13);
    if (Math.abs(rig.punchX) < 0.001) rig.punchX = 0;
    if (Math.abs(rig.punchY) < 0.001) rig.punchY = 0;
    if (Math.abs(rig.punchZ) < 0.001) rig.punchZ = 0;
    if (Math.abs(rig.punchFov) < 0.01) rig.punchFov = 0;
    rig.cam.fov = (baseFov || (rig.mode === 'footy' ? 41 : 36)) + rig.punchFov;
  }

  // Football Turf Grass & Soil Spray (directional arc off cleats/slides)
  function emitTurfSpray(fx, x, z, dirX, dirZ, count = 12, speed = 5.2) {
    if (!fx || typeof fx.add !== 'function') return;
    const bx = -(dirX || 0), bz = -(dirZ || 0);
    const bLen = Math.hypot(bx, bz) || 1;
    const nx = bx / bLen, nz = bz / bLen;
    for (let i = 0; i < count; i++) {
      const spread = (Math.random() - 0.5) * 1.45;
      const cs = Math.cos(spread), sn = Math.sin(spread);
      const rx = nx * cs - nz * sn;
      const rz = nx * sn + nz * cs;
      const sp = speed * (0.45 + Math.random() * 0.75);
      const isGrass = i % 3 !== 0;
      fx.add({
        x: x + (Math.random() - 0.5) * 0.35,
        y: 0.07 + Math.random() * 0.08,
        z: z + (Math.random() - 0.5) * 0.35,
        vx: rx * sp,
        vy: 1.8 + Math.random() * 2.8,
        vz: rz * sp,
        life: 0.38 + Math.random() * 0.24,
        max: 0.55,
        r: isGrass ? (0.12 + Math.random() * 0.14) : 0.34,
        g: isGrass ? (0.62 + Math.random() * 0.26) : 0.24,
        b: isGrass ? 0.20 : 0.16,
        size: isGrass ? (0.16 + Math.random() * 0.12) : 0.20,
        grow: -0.10,
        grav: 13.5,
        drag: 1.6,
        add: false
      });
    }
  }

  // Basketball Court Hardwood Dust Puff & Golden Rim Sparks
  function emitCourtDust(fx, x, z, count = 10, intense = false) {
    if (!fx || typeof fx.add !== 'function') return;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = (intense ? 4.4 : 2.6) * (0.4 + Math.random() * 0.75);
      fx.add({
        x: x + (Math.random() - 0.5) * 0.45,
        y: 0.06,
        z: z + (Math.random() - 0.5) * 0.45,
        vx: Math.cos(a) * sp,
        vy: 0.65 + Math.random() * (intense ? 1.8 : 0.9),
        vz: Math.sin(a) * sp,
        life: 0.42 + Math.random() * 0.20,
        max: 0.55,
        r: intense ? 0.98 : 0.90,
        g: intense ? 0.84 : 0.85,
        b: intense ? 0.58 : 0.76,
        size: intense ? 0.46 : 0.34,
        grow: 1.15,
        grav: 0.4,
        drag: 3.4,
        add: false
      });
    }
  }

  // Crisp Expanding 3D Contact Shockwave Ring
  function emitImpactRing(fx, x, y, z, colorHex, speed = 8.5, count = 22) {
    if (!fx || typeof fx.pulse !== 'function') return;
    fx.pulse(x, y, z, colorHex || 0xffffff, speed, count);
  }

  // Handle MatchView events cleanly for tactical camera punch & surface particles
  function onMatchViewEvent(matchView, e) {
    if (!matchView || !e) return;
    const fx = matchView.fx;
    const rig = matchView.rig;
    const sim = matchView.sim;
    const mode = sim && sim.mode;
    const rm = Boolean(matchView.opts && matchView.opts.reducedMotion);
    const agent = (sim && sim.agents && e.id !== undefined) ? sim.agents.find(a => a.id === e.id) : null;
    const dx = agent ? (agent.fx || 0) : 0;
    const dz = agent ? (agent.fz || 1) : 1;

    switch (e.type) {
      case 'tackleStart': {
        const ax = agent ? agent.x : (e.x || 0);
        const az = agent ? agent.z : (e.z || 0);
        if (mode === 'hoops') {
          emitCourtDust(fx, ax, az, 8, false);
        } else if ((e.power || 0) > 0.15) {
          emitTurfSpray(fx, ax, az, dx, dz, 14, 5.6);
        } else {
          emitTurfSpray(fx, ax, az, dx, dz, 6, 3.4);
        }
        break;
      }
      case 'kick': {
        const pwr = e.power || 0.5;
        if (mode === 'footy') {
          emitTurfSpray(fx, e.x, e.z, dx, dz, 6 + Math.round(pwr * 10), 4.2 + pwr * 2.5);
          if (pwr > 0.65) {
            emitImpactRing(fx, e.x, 0.14, e.z, 0x38bdf8, 7.5 + pwr * 4.5, 18);
            matchView._ballSquashT = 0.09;
            if (!rm) punchCamera(rig, dx, dz, 0.24 * pwr, 1.35 * pwr);
          }
        } else {
          emitCourtDust(fx, e.x, e.z, 5, false);
        }
        break;
      }
      case 'shot': {
        if (mode === 'footy') {
          const pwr = e.power || 0.7;
          emitTurfSpray(fx, e.x || (agent ? agent.x : 0), e.z || (agent ? agent.z : 0), dx, dz, 10, 5.4);
          emitImpactRing(fx, e.x || 0, 0.16, e.z || 0, 0x7dd3fc, 9.5, 20);
          matchView._ballSquashT = 0.095;
          if (!rm) punchCamera(rig, dx, dz, 0.28 * pwr, 1.6);
        } else if (!e.dunk && agent) {
          emitCourtDust(fx, agent.x, agent.z, 7, false);
        }
        break;
      }
      case 'dunk': {
        emitCourtDust(fx, e.x || 0, e.z || 0, 14, true);
        emitImpactRing(fx, e.x || 0, Math.max(0.2, e.y || 2.8), e.z || 0, 0xf59e0b, 11.5, 28);
        if (fx && typeof fx.burst === 'function') {
          fx.burst(e.x || 0, 2.95, e.z || 0, 24, 7.5, 0xfbbf24, 0.55, 0.26, 7.5, true);
        }
        matchView._ballSquashT = 0.11;
        if (!rm) punchCamera(rig, dx, dz, 0.62, 2.6);
        break;
      }
      case 'post':
      case 'rim': {
        emitImpactRing(fx, e.x || 0, e.y || 2.4, e.z || 0, e.type === 'post' ? 0xe2e8f0 : 0xfb923c, 7.0, 16);
        if (!rm) punchCamera(rig, 0, e.type === 'post' ? 1 : -1, e.type === 'post' ? 0.36 : 0.20, e.type === 'post' ? 1.5 : 0.8);
        break;
      }
      case 'tackleHit': {
        if (mode === 'footy') {
          emitTurfSpray(fx, e.x || 0, e.z || 0, dx, dz, e.stolen ? 16 : 9, 5.8);
        } else {
          emitCourtDust(fx, e.x || 0, e.z || 0, e.stolen ? 12 : 6, Boolean(e.stolen));
        }
        if (e.stolen) {
          emitImpactRing(fx, e.x || 0, 0.22, e.z || 0, 0xffd24a, 9.0, 20);
          if (!rm) punchCamera(rig, dx, dz, 0.32, 1.4);
        }
        break;
      }
      case 'bounce': {
        if (mode === 'hoops' && (e.speed || 0) > 2.5) {
          emitCourtDust(fx, e.x || 0, e.z || 0, 4, false);
          matchView._ballSquashT = 0.065;
        }
        break;
      }
      default:
        break;
    }
  }

  // Tightly tether basketball to live animated hand bone during Hoops dribble & gather + squash/stretch feedback
  function applyBallFeel(matchView, sim, dt) {
    if (!matchView || !matchView.ball || !sim || !sim.ball) return;
    const b = sim.ball;
    const br = matchView.ballRadius || (sim.mode === 'footy' ? 0.38 : 0.34);
    let vx = b.x, vy = b.y, vz = b.z;

    if (sim.mode === 'hoops' && b.owner && typeof global.CharactersGLB !== 'undefined' && typeof global.CharactersGLB.getOwnerHandSocket === 'function') {
      const owner = b.owner;
      const side = (owner.dribbleSide || 1) < 0 ? 'L' : 'R';
      const sock = global.CharactersGLB.getOwnerHandSocket(matchView, owner, side);
      if (sock) {
        const hy = Math.abs(Math.sin(b.dribblePhase || 0));
        const isDunking = Boolean(owner.dunk && owner.dunk.active);
        const isShooting = (owner.shotT || 0) > 0;
        const tether = isDunking ? 0.94 : (isShooting ? 0.85 : clamp((hy - 0.34) / 0.56, 0, 1));
        if (tether > 0.01) {
          vx = b.x + (sock.x - b.x) * (0.82 * tether);
          vz = b.z + (sock.z - b.z) * (0.82 * tether);
          const palmBallY = Math.max(br, sock.y - br * 0.86);
          const targetY = isDunking ? palmBallY : (b.y + (palmBallY - b.y) * (0.76 * tether));
          vy = Math.max(br, targetY);
        }
        if (hy < 0.14 && !isDunking) {
          matchView._ballSquashT = Math.max(matchView._ballSquashT || 0, 0.055);
        }
      }
    }

    matchView.ball.setPos(vx, vy, vz);
    if (matchView.ballShadow) {
      matchView.ballShadow.setPos(vx, 0.025, vz);
      const h = Math.max(0, vy - br);
      const bs = (br * 3.2 + 0.3) * Math.max(0.35, 1 - h * 0.07);
      matchView.ballShadow.setScale(bs);
    }
    if (matchView.ballGlow) {
      matchView.ballGlow.setPos(vx, 0.04, vz);
      const hum = sim.human;
      if (hum && hum.shootCharging && hum.shootCharge > 0.06) {
        const ch = clamp(hum.shootCharge, 0, 1);
        matchView.ballGlow.setScale(1.1 + ch * 0.9);
        if (matchView.ballGlow.material) {
          matchView.ballGlow.material.alpha = 0.25 + ch * 0.55;
        }
      } else if (matchView.ballGlow.material) {
        matchView.ballGlow.material.alpha = 0.22;
      }
    }

    // Continuous Turf Grass Skid Spray while any athlete is mid slide-tackle on grass
    if (sim.mode === 'footy' && sim.agents && matchView.fx) {
      matchView._slideEmitTimer = Math.max(0, (matchView._slideEmitTimer || 0) - dt);
      if (matchView._slideEmitTimer <= 0) {
        let emitted = false;
        for (let i = 0; i < sim.agents.length; i++) {
          const ag = sim.agents[i];
          if (ag && ag.tackle && ag.tackle.phase === 'lunge' && (ag.tackle.power || 0) > 0.15) {
            emitTurfSpray(matchView.fx, ag.x, ag.z, ag.tackle.dx || ag.fx, ag.tackle.dz || ag.fz, 4, 4.2);
            emitted = true;
          }
        }
        if (emitted) matchView._slideEmitTimer = 0.032;
      }
    }

    // Brief elastic squash-and-stretch on impacts & hardwood bounces
    if ((matchView._ballSquashT || 0) > 0) {
      matchView._ballSquashT = Math.max(0, matchView._ballSquashT - dt);
      const frac = clamp(matchView._ballSquashT / 0.09, 0, 1);
      const sy = 1.0 - 0.16 * frac;
      const sxz = 1.0 + 0.10 * frac;
      matchView.ball.scale = [sxz, sy, sxz];
    } else if (matchView.ball.scale && matchView.ball.scale[0] !== 1) {
      matchView.ball.scale = [1, 1, 1];
    }
  }

  global.GameFeel = {
    triggerHitStop: triggerHitStop,
    consumeHitStop: consumeHitStop,
    punchCamera: punchCamera,
    stepCameraImpulse: stepCameraImpulse,
    emitTurfSpray: emitTurfSpray,
    emitCourtDust: emitCourtDust,
    emitImpactRing: emitImpactRing,
    onMatchViewEvent: onMatchViewEvent,
    applyBallFeel: applyBallFeel
  };
})(typeof window !== 'undefined' ? window : globalThis);
