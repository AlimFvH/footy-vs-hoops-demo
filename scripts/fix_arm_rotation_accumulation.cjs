const fs = require('fs');

const files = [
  'js/game.js',
  'C:/Users/ASUS/Desktop/FOOTY vs HOOPS/js/game.js'
];

files.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  console.log('Processing:', filePath);
  let code = fs.readFileSync(filePath, 'utf8');

  // Fix arm rotation accumulation bug
  const oldArmCode = `            const spread = this.ease('spread', a.celebrateT > 0 ? 0.5 : (foot && carrying ? 0.28 : (armUp > 1 ? 0.15 : 0.12)), 14, dt);
            this.armL.rotation[2] = (this.armL.rotation[2] || 0) - spread + sp * amp * 0.05 + (foot && kickP >= 0 ? -0.32 * kick : 0);
            this.armR.rotation[2] = (this.armR.rotation[2] || 0) + spread - sp * amp * 0.05 + (foot && kickP >= 0 ? 0.32 * kick : 0);`;

  const newArmCode = `            const spread = this.ease('spread', a.celebrateT > 0 ? 0.45 : (foot && carrying ? 0.22 : (armUp > 1 ? 0.15 : 0.10)), 14, dt);
            let armOffsetZ_L = 0;
            let armOffsetZ_R = 0;
            if (this.mode === 'hoops' && carrying && armUp < 0.05) {
                const targetHand = a.dribbleSide !== undefined ? a.dribbleSide : (a.mx < -0.15 ? -1 : (a.mx > 0.15 ? 1 : 1));
                const hand = this.ease('dribbleHand', targetHand, 14, dt);
                if (hand >= 0) { armOffsetZ_R += 0.14; armOffsetZ_L -= 0.32; }
                else { armOffsetZ_L -= 0.14; armOffsetZ_R += 0.32; }
            }
            this.armL.rotation[2] = -spread + armOffsetZ_L + sp * amp * 0.04 + (foot && kickP >= 0 ? -0.28 * kick : 0);
            this.armR.rotation[2] = spread + armOffsetZ_R - sp * amp * 0.04 + (foot && kickP >= 0 ? 0.28 * kick : 0);`;

  const normCode = code.replace(/\r\n/g, '\n');
  const normOld = oldArmCode.replace(/\r\n/g, '\n');
  const normNew = newArmCode.replace(/\r\n/g, '\n');

  if (normCode.includes(normOld)) {
    code = normCode.replace(normOld, normNew);
    fs.writeFileSync(filePath, code, 'utf8');
    console.log('✓ Fixed arm rotation accumulation in', filePath);
  } else {
    console.warn('✗ Could not find arm rotation target in', filePath);
  }
});
