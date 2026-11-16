const fs = require('fs');

const files = [
  'js/game.js',
  'C:/Users/ASUS/Desktop/FOOTY vs HOOPS/js/game.js'
];

files.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');

  // In getJerseyTexture, return c instead of new scene_js_2.Texture(c)
  code = code.replace(
    /const tex = new scene_js_2\.Texture\(c\);\s*jerseyTexCache\.set\(cacheKey, tex\);\s*return tex;/,
    `jerseyTexCache.set(cacheKey, c);
        return c;`
  );

  // In Character.constructor, wrap canvas in new scene_js_3.Texture(frontTex)
  code = code.replace(
    /const frontTex = \(0, textures_js_2\.getJerseyTexture\)\(charType, squadNum, false, skin\.primary, skin\.secondary, skin\.accent\);\s*const backTex = \(0, textures_js_2\.getJerseyTexture\)\(charType, squadNum, true, skin\.primary, skin\.secondary, skin\.accent\);/,
    `const frontCanvas = (0, textures_js_2.getJerseyTexture)(charType, squadNum, false, skin.primary, skin.secondary, skin.accent);
            const backCanvas = (0, textures_js_2.getJerseyTexture)(charType, squadNum, true, skin.primary, skin.secondary, skin.accent);
            const frontTex = new scene_js_3.Texture(frontCanvas);
            const backTex = new scene_js_3.Texture(backCanvas);`
  );

  fs.writeFileSync(filePath, code, 'utf8');
  console.log('✓ Fixed getJerseyTexture canvas return in', filePath);
});
