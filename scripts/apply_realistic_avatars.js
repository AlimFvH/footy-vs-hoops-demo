const fs = require('fs');
const { getRealisticFootyAvatarSvg, getRealisticHoopsAvatarSvg } = require('./generate_realistic_avatars.js');

const jsPath = 'js/redesign.js';
let js = fs.readFileSync(jsPath, 'utf8');

const footyStart = js.indexOf('  function getFootyAvatarSvg() {');
const hoopsEndMarker = '  // Official FOOTY vs HOOPS Authentic Emblem';
const hoopsEnd = js.indexOf(hoopsEndMarker);

if (footyStart === -1 || hoopsEnd === -1) {
  console.error('Failed to locate markers:', { footyStart, hoopsEnd });
  process.exit(1);
}

// Convert SVG to single-quoted JS string literal with unescaped double quotes
function toJsLiteral(svg) {
  return "'" + svg.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, "' +\n    '") + "'";
}

const newFunctions = `  function getFootyAvatarSvg() {\n    return ${toJsLiteral(getRealisticFootyAvatarSvg())};\n  }\n\n  function getHoopsAvatarSvg() {\n    return ${toJsLiteral(getRealisticHoopsAvatarSvg())};\n  }\n\n`;

const updatedJs = js.slice(0, footyStart) + newFunctions + js.slice(hoopsEnd);
fs.writeFileSync(jsPath, updatedJs, 'utf8');
console.log('Successfully updated getFootyAvatarSvg and getHoopsAvatarSvg with clean quotes!');
