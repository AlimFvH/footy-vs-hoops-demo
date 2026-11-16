const fs = require('fs');
let s = fs.readFileSync('render/hero_characters_3d.js', 'utf8');

// Update makeUniformWrapTexture to support keeper
const oldUniformFnStart = 'function makeUniformWrapTexture(charType, emblemImg) {';
const newUniformSupport = `function makeUniformWrapTexture(charType, emblemImg) {
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
    }`;

s = s.replace(oldUniformFnStart, newUniformSupport);
fs.writeFileSync('render/hero_characters_3d.js', s);
console.log('Added keeper uniform support.');
