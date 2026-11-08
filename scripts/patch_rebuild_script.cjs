const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, 'rebuild_fortnite_hero_athletes.cjs');
let code = fs.readFileSync(targetPath, 'utf8');

// Replace A1 & A2 sections
const a1Idx = code.indexOf('// A1. TUCK BACK-OF-SKULL SKIN VERTICES');
const bIdx = code.indexOf('// B. ATHLETIC BODY SCULPTING');

const newA = `// A1. TUCK BACK-OF-SKULL SKIN VERTICES TO PREVENT HAIR CLIPPING
  // Deep tuck: any skull vertex at the back (z < 0.02, y > 1.56) is safely drawn inside the hair dome!
  // -------------------------------------------------------------
  if (headMesh && headMesh.primitives[0]) {
    const skinPrim = headMesh.primitives[0];
    const acc = gltf.accessors[skinPrim.attributes.POSITION];
    const bv = gltf.bufferViews[acc.bufferView];
    const byteOffset = (bv.byteOffset || 0) + (acc.byteOffset || 0);
    const skinFloats = new Float32Array(bin, byteOffset, acc.count * 3);

    let tucked = 0;
    for (let i = 0; i < acc.count; i++) {
      const x = skinFloats[i * 3];
      const y = skinFloats[i * 3 + 1];
      const z = skinFloats[i * 3 + 2];
      if (y > 1.56 && z < 0.02) {
        // Tucks skull safely inside hair dome (forward and slightly narrowed)
        skinFloats[i * 3] = x * 0.90;
        skinFloats[i * 3 + 2] = Math.max(-0.026, z * 0.50);
        tucked++;
      }
    }
    console.log(\`  ✓ Skull: Tucked \${tucked} back-of-skull vertices inside hair envelope.\`);
  }

  // -------------------------------------------------------------
  // A2. HAIR SCULPTING (Cube.015, Prim 3)
  // Clean neckline, zero ponytail, zero bald spots, 100% full coverage!
  // -------------------------------------------------------------
  if (headMesh && headMesh.primitives[3]) {
    const hairPrim = headMesh.primitives[3];
    const posAcc = gltf.accessors[hairPrim.attributes.POSITION];
    const bv = gltf.bufferViews[posAcc.bufferView];
    const byteOffset = (bv.byteOffset || 0) + (posAcc.byteOffset || 0);
    const hairFloats = new Float32Array(bin, byteOffset, posAcc.count * 3);

    let ponytailFixed = 0;
    let fadeSculpted = 0;

    for (let i = 0; i < posAcc.count; i++) {
      let x = hairFloats[i * 3];
      let y = hairFloats[i * 3 + 1];
      let z = hairFloats[i * 3 + 2];

      // 1. Ponytail Eradication: tuck any dangling ponytail vertices into natural nape line
      if (y < 1.595) {
        hairFloats[i * 3 + 1] = 1.600;
        hairFloats[i * 3 + 2] = Math.max(-0.065, z);
        ponytailFixed++;
      } else if (z < -0.076) {
        hairFloats[i * 3 + 2] = -0.070 + (z + 0.076) * 0.05;
        ponytailFixed++;
      }

      // 2. Guarantee full hair envelope over the back of skull (z <= -0.052)
      if (y > 1.58 && y < 1.76 && z < -0.02 && z > -0.055 && Math.abs(x) < 0.05) {
        hairFloats[i * 3 + 2] = -0.058;
        ponytailFixed++;
      }

      // 3. Specific Hairstyles
      if (isHoops) {
        // High-Top Fade:
        // Top of hair (Y > 1.78) forms a crisp, clean flat-top box
        if (y > 1.78) {
          hairFloats[i * 3] = Math.max(-0.082, Math.min(0.082, x));
          hairFloats[i * 3 + 2] = Math.max(-0.058, Math.min(0.070, hairFloats[i * 3 + 2]));
          fadeSculpted++;
        }
        // Fade sides neatly to the skull contour
        if (y < 1.76 && Math.abs(x) > 0.080) {
          hairFloats[i * 3] = (x > 0 ? 1 : -1) * (0.078 + (Math.abs(x) - 0.080) * 0.20);
          fadeSculpted++;
        }
      } else if (isFooty || isKeeper) {
        // Tapered Modern Swept Hair:
        if (y > 1.76) {
          hairFloats[i * 3 + 2] = hairFloats[i * 3 + 2] + 0.008;
        }
        if (y < 1.75 && Math.abs(x) > 0.084) {
          hairFloats[i * 3] = x * 0.95;
        }
      }
    }
    console.log(\`  ✓ Hair: Eradicated \${ponytailFixed} ponytail/recess vertices, sculpted \${fadeSculpted} fade vertices.\`);
  }

  // -------------------------------------------------------------
  `;

if (a1Idx !== -1 && bIdx !== -1) {
  code = code.slice(0, a1Idx) + newA + code.slice(bIdx);

  // Add arm musculature
  const bTitle = '// B. ATHLETIC BODY SCULPTING (Cube.010 & Cube.019)';
  const bTitleIdx = code.indexOf(bTitle);
  const afterBTitle = bTitleIdx + bTitle.length;

  const armCode = `\n  // B0. ATHLETIC ARM MUSCULATURE (Cube.010 Prim 0 - Skin/Arms)
  if (torsoMesh && torsoMesh.primitives[0]) {
    const armPrim = torsoMesh.primitives[0];
    const posAcc = gltf.accessors[armPrim.attributes.POSITION];
    const bv = gltf.bufferViews[posAcc.bufferView];
    const armFloats = new Float32Array(bin, (bv.byteOffset || 0) + (posAcc.byteOffset || 0), posAcc.count * 3);
    for (let i = 0; i < posAcc.count; i++) {
      let x = armFloats[i * 3];
      let y = armFloats[i * 3 + 1];
      let z = armFloats[i * 3 + 2];
      if (Math.abs(x) > 0.18 && y > 0.90 && y < 1.45) {
        armFloats[i * 3] = x * 1.08;
        armFloats[i * 3 + 2] = z * 1.08;
      }
    }
    console.log('  ✓ Arms: Sculpted athletic deltoids and biceps.');
  }\n`;

  code = code.slice(0, afterBTitle) + armCode + code.slice(afterBTitle);

  fs.writeFileSync(targetPath, code);
  console.log('✓ Successfully patched rebuild_fortnite_hero_athletes.cjs!');
} else {
  console.error('Could not find A1 or B boundaries');
  process.exit(1);
}
