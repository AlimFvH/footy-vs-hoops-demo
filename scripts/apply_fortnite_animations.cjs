const fs = require('fs');

let code = fs.readFileSync('render/characters_glb.js', 'utf8');
const isCRLF = code.includes('\r\n');
if (isCRLF) {
  code = code.replace(/\r\n/g, '\n');
}

const oldKinematics = 
`      // 2. Realistic Dynamic Animation Track Mapping & Kinematics
      this.pitch = 0;
      this.roll = 0;
      this.elevationLift = 0;`;

const newKinematics = 
`      // 2. Fortnite-Style Kinetic Animation Tracks & Procedural Motion Mechanics
      // A. Dynamic body bank & cornering lean (lean into turns at speed like Fortnite & Rocket League)
      const corneringLean = Math.max(-0.24, Math.min(0.24, -dy * Math.min(1.0, speed / 2.2)));
      const sprintDrive = Math.min(1.0, speed / 3.4);
      this.roll = corneringLean;
      this.pitch = 0.18 * sprintDrive; // Fortnite athletic forward sprint posture
      this.elevationLift = (speed > 1.2) ? Math.sin((this.model.playbackTime || 0) * 16) * 0.04 * sprintDrive : 0;`;

if (code.includes(oldKinematics)) {
  code = code.replace(oldKinematics, newKinematics);
  console.log('✓ Injected Fortnite cornering lean and sprint kinematics');
} else {
  console.log('Kinematics block not found');
}

const oldDunk = 
`        // 1. Explosive Slam Dunk Sequence (Airborne 2-hand/1-hand rim slam)
        if (a.dunk && a.dunk.active) {
          const dk = a.dunk;
          const dunkProgress = Math.min(1, Math.max(0, dk.t / (dk.dur || 0.65)));
          // Calibrated parabolic jump arc reaching rim height (3.05m)
          this.elevationLift = Math.sin(dunkProgress * Math.PI) * 0.98;
          this.pitch = 0.28 * (1 - dunkProgress * 0.7); // Athletic forward airborne attack
          // Overhead one-handed slam down into rim
          this.setAnimation('Punch_Right', 2.0);
        }`;

const newDunk = 
`        // 1. Fortnite Meteor Slam Dunk: Explosive Anti-Gravity Suspension & Rim Hammer
        if (a.dunk && a.dunk.active) {
          const dk = a.dunk;
          const dunkProgress = Math.min(1, Math.max(0, dk.t / (dk.dur || 0.65)));
          // Fortnite gravity-defying hang time: stays suspended at peak rim height longer
          const hangTimeArc = Math.pow(Math.sin(dunkProgress * Math.PI), 0.65);
          this.elevationLift = hangTimeArc * 1.38;
          this.pitch = 0.38 * Math.sin(dunkProgress * Math.PI);
          this.roll = corneringLean + 0.12 * Math.sin(dunkProgress * Math.PI * 2);
          this.setAnimation('Punch_Right', 2.2);
        }`;

if (code.includes(oldDunk)) {
  code = code.replace(oldDunk, newDunk);
  console.log('✓ Injected Fortnite Meteor Slam Dunk');
} else {
  console.log('Dunk block not found');
}

const oldStrike = 
`        // 2. High-Impact Dynamic Soccer Strike / Shot
        else if (a.kickT > 0 || a.shotT > 0) {
          const timer = a.kickT || a.shotT || 0;
          this.pitch = 0.22 * Math.sin(timer * 12); // Clean torso drive into strike
          this.setAnimation('Kick_Right', 1.9);
        }`;

const newStrike = 
`        // 2. Fortnite Airborne Power Strike / Flying Volley Scissor Kick
        else if (a.kickT > 0 || a.shotT > 0) {
          const timer = a.kickT || a.shotT || 0;
          const strikeProgress = Math.min(1, Math.max(0, 1 - timer / 0.45));
          this.elevationLift = Math.sin(strikeProgress * Math.PI) * 0.46; // Explosive airborne leap
          this.pitch = 0.36 * Math.sin(strikeProgress * Math.PI * 1.2);
          this.roll = -0.22 * Math.sin(strikeProgress * Math.PI); // Aerodynamic scissor twist
          this.setAnimation('Kick_Right', 2.4);
        }`;

if (code.includes(oldStrike)) {
  code = code.replace(oldStrike, newStrike);
  console.log('✓ Injected Fortnite Airborne Power Strike');
} else {
  console.log('Strike block not found');
}

const oldTackle = 
`        // 3. Sliding Tackle / Interception Dive
        else if (a.tackle && (a.tackle.phase === 'lunge' || a.tackle.phase === 'charge')) {
          this.setAnimation('Roll', 1.6);
        }`;

const newTackle = 
`        // 3. Fortnite Low Ninja Slide Tackle
        else if (a.tackle && (a.tackle.phase === 'lunge' || a.tackle.phase === 'charge')) {
          this.elevationLift = -0.10;
          this.pitch = -0.32; // Dynamic backward lean skimming the pitch
          this.roll = 0.22;
          this.setAnimation('Roll', 2.0);
        }`;

if (code.includes(oldTackle)) {
  code = code.replace(oldTackle, newTackle);
  console.log('✓ Injected Fortnite Low Ninja Slide Tackle');
} else {
  console.log('Tackle block not found');
}

const oldCelebration = 
`        // 4. Celebration Wave
        else if (a.celebrateT > 0) {
          this.setAnimation('Wave', 1.2);
        }`;

const newCelebration = 
`        // 4. Fortnite Victory Royale Emote: Hype Jump & Victory Flex
        else if (a.celebrateT > 0) {
          const cT = a.celebrateT || 0;
          this.elevationLift = Math.max(0, Math.sin(cT * 9) * 0.32);
          this.pitch = -0.12 * Math.sin(cT * 7);
          this.roll = Math.sin(cT * 5) * 0.16;
          this.setAnimation('Wave', 1.9);
        }`;

if (code.includes(oldCelebration)) {
  code = code.replace(oldCelebration, newCelebration);
  console.log('✓ Injected Fortnite Victory Royale Emote');
} else {
  console.log('Celebration block not found');
}

if (isCRLF) {
  code = code.replace(/\n/g, '\r\n');
}

fs.writeFileSync('render/characters_glb.js', code, 'utf8');
console.log('characters_glb.js successfully upgraded with Fortnite animations!');
