function makeChestDecal(charType) {
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

  // Crisp Team Name in Athletic Varsity Arch
  ctx.save();
  ctx.font = '900 56px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Impact, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Dark drop glow to occlude messy AI blur underneath
  ctx.shadowColor = 'rgba(5, 8, 17, 0.95)';
  ctx.shadowBlur = 12;

  // Solid dark underlay patch over the chest
  const grad = ctx.createRadialGradient(256, 256, 40, 256, 256, 240);
  grad.addColorStop(0, 'rgba(8, 12, 22, 0.92)');
  grad.addColorStop(0.7, 'rgba(8, 12, 22, 0.85)');
  grad.addColorStop(1, 'rgba(8, 12, 22, 0.0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(256, 256, 240, 0, Math.PI * 2);
  ctx.fill();

  // Name
  ctx.fillStyle = primaryCol;
  ctx.strokeStyle = strokeCol;
  ctx.lineWidth = 14;
  ctx.strokeText(nameStr, 256, 170);
  ctx.fillText(nameStr, 256, 170);

  // Big Bold Number
  ctx.font = '900 160px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Impact, sans-serif';
  ctx.lineWidth = 24;
  ctx.strokeText(numberStr, 256, 330);
  ctx.fillText(numberStr, 256, 330);

  // Inner highlight on number
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.strokeText(numberStr, 256, 330);

  ctx.restore();
  return c;
}
