const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const fs = require('fs');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

async function generateFacePlates() {
  console.log('=== Generating High-Definition Stylized Face Plates ===');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:8099/index.html');

  const faceDataUrls = await page.evaluate(() => {
    function drawStylizedEye(ctx, cx, cy, eyeW, eyeH, irisColor, pupilColor, isLeft) {
      ctx.save();
      
      // 1. Eye socket ambient shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.beginPath();
      ctx.ellipse(cx, cy, eyeW + 4, eyeH + 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Sclera (White of Eye)
      ctx.beginPath();
      ctx.ellipse(cx, cy, eyeW, eyeH, 0, 0, Math.PI * 2);
      const scleraGrad = ctx.createLinearGradient(cx, cy - eyeH, cx, cy + eyeH);
      scleraGrad.addColorStop(0, '#e2e8f0');
      scleraGrad.addColorStop(0.2, '#ffffff');
      scleraGrad.addColorStop(0.8, '#ffffff');
      scleraGrad.addColorStop(1, '#f1f5f9');
      ctx.fillStyle = scleraGrad;
      ctx.fill();

      // Clip inside eye
      ctx.save();
      ctx.clip();

      // 3. Iris
      const irisR = eyeH * 0.95;
      const irisX = cx + (isLeft ? 2 : -2);
      const irisY = cy;

      const irisGrad = ctx.createRadialGradient(irisX, irisY, irisR * 0.2, irisX, irisY, irisR);
      irisGrad.addColorStop(0, irisColor.inner);
      irisGrad.addColorStop(0.7, irisColor.mid);
      irisGrad.addColorStop(1.0, irisColor.outer);
      ctx.fillStyle = irisGrad;
      ctx.beginPath();
      ctx.arc(irisX, irisY, irisR, 0, Math.PI * 2);
      ctx.fill();

      // Limbal ring (dark edge around iris)
      ctx.strokeStyle = irisColor.limbal;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // 4. Center Pupil
      const pupilR = irisR * 0.45;
      ctx.fillStyle = pupilColor || '#090a0f';
      ctx.beginPath();
      ctx.arc(irisX, irisY, pupilR, 0, Math.PI * 2);
      ctx.fill();

      // 5. Specular Catchlights (Gives life and sparkle!)
      // Primary catchlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.arc(irisX - pupilR * 0.55, irisY - pupilR * 0.55, pupilR * 0.42, 0, Math.PI * 2);
      ctx.fill();

      // Secondary soft reflection
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.beginPath();
      ctx.arc(irisX + pupilR * 0.65, irisY + pupilR * 0.45, pupilR * 0.25, 0, Math.PI * 2);
      ctx.fill();

      // Soft upper lid shadow on eyeball
      ctx.fillStyle = 'rgba(20, 10, 5, 0.28)';
      ctx.beginPath();
      ctx.ellipse(cx, cy - eyeH * 0.5, eyeW, eyeH * 0.6, 0, 0, Math.PI);
      ctx.fill();

      ctx.restore(); // unclip

      // 6. Eyelid creases & lash lines
      ctx.strokeStyle = 'rgba(25, 15, 10, 0.85)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, eyeW, eyeH, 0, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();

      // Upper lid fold
      ctx.strokeStyle = 'rgba(40, 20, 15, 0.35)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(cx, cy - eyeH - 4, eyeW * 0.8, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();

      ctx.restore();
    }

    function drawEyebrow(ctx, startX, startY, endX, endY, archY, width, color) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      const midX = (startX + endX) * 0.5;
      ctx.quadraticCurveTo(midX, archY, endX, endY);
      ctx.stroke();
      ctx.restore();
    }

    // --- HOOPS #23 Face Plate (Warm bronze skin, amber eyes, clean beard fade) ---
    function makeHoopsFace() {
      const cvs = document.createElement('canvas');
      cvs.width = 512; cvs.height = 512;
      const ctx = cvs.getContext('2d');

      // Transparent base so it blends smoothly
      ctx.clearRect(0, 0, 512, 512);

      // Warm skin base for the face zone
      const skinGrad = ctx.createRadialGradient(256, 260, 40, 256, 260, 200);
      skinGrad.addColorStop(0, 'rgba(155, 95, 55, 0.95)');
      skinGrad.addColorStop(0.6, 'rgba(135, 78, 42, 0.85)');
      skinGrad.addColorStop(1.0, 'rgba(110, 60, 30, 0.0)');
      ctx.fillStyle = skinGrad;
      ctx.beginPath();
      ctx.ellipse(256, 260, 170, 210, 0, 0, Math.PI * 2);
      ctx.fill();

      // Forehead highlight
      const foreGrad = ctx.createRadialGradient(256, 140, 10, 256, 140, 70);
      foreGrad.addColorStop(0, 'rgba(175, 115, 70, 0.45)');
      foreGrad.addColorStop(1, 'rgba(175, 115, 70, 0.0)');
      ctx.fillStyle = foreGrad;
      ctx.fillRect(180, 70, 150, 140);

      // Cheek warmth
      const cheekL = ctx.createRadialGradient(160, 280, 5, 160, 280, 50);
      cheekL.addColorStop(0, 'rgba(170, 85, 45, 0.35)');
      cheekL.addColorStop(1, 'rgba(170, 85, 45, 0.0)');
      ctx.fillStyle = cheekL; ctx.fillRect(110, 230, 100, 100);

      const cheekR = ctx.createRadialGradient(352, 280, 5, 352, 280, 50);
      cheekR.addColorStop(0, 'rgba(170, 85, 45, 0.35)');
      cheekR.addColorStop(1, 'rgba(170, 85, 45, 0.0)');
      ctx.fillStyle = cheekR; ctx.fillRect(302, 230, 100, 100);

      // Eyes: amber golden brown
      const hoopsIris = {
        inner: '#fbbf24',
        mid: '#b45309',
        outer: '#78350f',
        limbal: '#451a03'
      };
      // Eye level Y ≈ 195, separation ±82
      drawStylizedEye(ctx, 174, 195, 26, 15, hoopsIris, '#0f0a05', true);
      drawStylizedEye(ctx, 338, 195, 26, 15, hoopsIris, '#0f0a05', false);

      // Eyebrows
      drawEyebrow(ctx, 140, 172, 210, 162, 152, 9, '#1a100a');
      drawEyebrow(ctx, 372, 172, 302, 162, 152, 9, '#1a100a');

      // Nose bridge highlight & nostrils
      ctx.fillStyle = 'rgba(180, 120, 75, 0.40)';
      ctx.beginPath();
      ctx.ellipse(256, 235, 9, 32, 0, 0, Math.PI * 2);
      ctx.fill();

      // Nose tip & nostrils
      ctx.fillStyle = 'rgba(60, 30, 15, 0.65)';
      ctx.beginPath();
      ctx.ellipse(240, 274, 7, 4, -0.2, 0, Math.PI * 2);
      ctx.ellipse(272, 274, 7, 4, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Philtrum
      ctx.fillStyle = 'rgba(60, 30, 15, 0.25)';
      ctx.fillRect(253, 280, 6, 22);

      // Lips
      // Upper lip
      ctx.fillStyle = '#6b3824';
      ctx.beginPath();
      ctx.moveTo(226, 318);
      ctx.quadraticCurveTo(244, 310, 256, 314);
      ctx.quadraticCurveTo(268, 310, 286, 318);
      ctx.quadraticCurveTo(256, 322, 226, 318);
      ctx.fill();

      // Lower lip
      ctx.fillStyle = '#854630';
      ctx.beginPath();
      ctx.moveTo(228, 319);
      ctx.quadraticCurveTo(256, 322, 284, 319);
      ctx.quadraticCurveTo(256, 336, 228, 319);
      ctx.fill();

      // Lower lip highlight
      ctx.fillStyle = 'rgba(190, 125, 95, 0.55)';
      ctx.beginPath();
      ctx.ellipse(256, 326, 16, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Mouth line
      ctx.strokeStyle = '#2b1208';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(224, 318);
      ctx.quadraticCurveTo(256, 322, 288, 318);
      ctx.stroke();

      // Clean athletic chinstrap beard & mustache
      ctx.fillStyle = 'rgba(25, 15, 10, 0.88)';
      // Mustache
      ctx.beginPath();
      ctx.moveTo(226, 308);
      ctx.quadraticCurveTo(256, 302, 286, 308);
      ctx.quadraticCurveTo(256, 315, 226, 308);
      ctx.fill();

      // Beard along jaw and chin
      ctx.beginPath();
      ctx.moveTo(150, 270);
      ctx.quadraticCurveTo(180, 370, 256, 400);
      ctx.quadraticCurveTo(332, 370, 362, 270);
      ctx.quadraticCurveTo(342, 360, 256, 385);
      ctx.quadraticCurveTo(170, 360, 150, 270);
      ctx.fill();

      // Chin beard tuft
      ctx.beginPath();
      ctx.ellipse(256, 362, 24, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      return cvs.toDataURL('image/png');
    }

    // --- FOOTY #10 Face Plate (Fresh athletic skin, piercing cyan/blue eyes, groomed stubble) ---
    function makeFootyFace() {
      const cvs = document.createElement('canvas');
      cvs.width = 512; cvs.height = 512;
      const ctx = cvs.getContext('2d');
      ctx.clearRect(0, 0, 512, 512);

      // Fresh peach/tan skin base
      const skinGrad = ctx.createRadialGradient(256, 260, 40, 256, 260, 200);
      skinGrad.addColorStop(0, 'rgba(235, 182, 150, 0.95)');
      skinGrad.addColorStop(0.6, 'rgba(215, 160, 128, 0.85)');
      skinGrad.addColorStop(1.0, 'rgba(185, 130, 100, 0.0)');
      ctx.fillStyle = skinGrad;
      ctx.beginPath();
      ctx.ellipse(256, 260, 160, 210, 0, 0, Math.PI * 2);
      ctx.fill();

      // Forehead highlight
      const foreGrad = ctx.createRadialGradient(256, 140, 10, 256, 140, 70);
      foreGrad.addColorStop(0, 'rgba(255, 220, 195, 0.55)');
      foreGrad.addColorStop(1, 'rgba(255, 220, 195, 0.0)');
      ctx.fillStyle = foreGrad;
      ctx.fillRect(180, 70, 150, 140);

      // Cheek blush
      const cheekL = ctx.createRadialGradient(165, 275, 5, 165, 275, 50);
      cheekL.addColorStop(0, 'rgba(230, 130, 110, 0.35)');
      cheekL.addColorStop(1, 'rgba(230, 130, 110, 0.0)');
      ctx.fillStyle = cheekL; ctx.fillRect(115, 225, 100, 100);

      const cheekR = ctx.createRadialGradient(347, 275, 5, 347, 275, 50);
      cheekR.addColorStop(0, 'rgba(230, 130, 110, 0.35)');
      cheekR.addColorStop(1, 'rgba(230, 130, 110, 0.0)');
      ctx.fillStyle = cheekR; ctx.fillRect(297, 225, 100, 100);

      // Eyes: Piercing sapphire/cyan blue
      const footyIris = {
        inner: '#38bdf8',
        mid: '#0284c7',
        outer: '#0369a1',
        limbal: '#0c4a6e'
      };
      drawStylizedEye(ctx, 178, 192, 25, 14, footyIris, '#081726', true);
      drawStylizedEye(ctx, 334, 192, 25, 14, footyIris, '#081726', false);

      // Confident European football star eyebrows
      drawEyebrow(ctx, 145, 168, 215, 160, 150, 8.5, '#452b1b');
      drawEyebrow(ctx, 367, 168, 297, 160, 150, 8.5, '#452b1b');

      // Nose bridge highlight
      ctx.fillStyle = 'rgba(255, 225, 205, 0.45)';
      ctx.beginPath();
      ctx.ellipse(256, 230, 8, 30, 0, 0, Math.PI * 2);
      ctx.fill();

      // Nostrils
      ctx.fillStyle = 'rgba(120, 60, 45, 0.55)';
      ctx.beginPath();
      ctx.ellipse(242, 268, 6, 3.5, -0.2, 0, Math.PI * 2);
      ctx.ellipse(270, 268, 6, 3.5, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Lips
      // Upper lip
      ctx.fillStyle = '#b36357';
      ctx.beginPath();
      ctx.moveTo(230, 310);
      ctx.quadraticCurveTo(246, 303, 256, 306);
      ctx.quadraticCurveTo(266, 303, 282, 310);
      ctx.quadraticCurveTo(256, 314, 230, 310);
      ctx.fill();

      // Lower lip
      ctx.fillStyle = '#cc7568';
      ctx.beginPath();
      ctx.moveTo(232, 311);
      ctx.quadraticCurveTo(256, 314, 280, 311);
      ctx.quadraticCurveTo(256, 326, 232, 311);
      ctx.fill();

      // Lower lip highlight
      ctx.fillStyle = 'rgba(255, 210, 200, 0.60)';
      ctx.beginPath();
      ctx.ellipse(256, 317, 14, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Mouth line
      ctx.strokeStyle = '#5c221b';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(228, 310);
      ctx.quadraticCurveTo(256, 314, 284, 310);
      ctx.stroke();

      // Subtle athletic designer stubble / 5 o'clock shadow
      ctx.fillStyle = 'rgba(75, 45, 30, 0.16)';
      ctx.beginPath();
      ctx.ellipse(256, 350, 70, 45, 0, 0, Math.PI * 2);
      ctx.fill();

      return cvs.toDataURL('image/png');
    }

    // --- KEEPER #1 Face Plate (Chiseled strong jaw, emerald/steel eyes, focused expression) ---
    function makeKeeperFace() {
      const cvs = document.createElement('canvas');
      cvs.width = 512; cvs.height = 512;
      const ctx = cvs.getContext('2d');
      ctx.clearRect(0, 0, 512, 512);

      // Strong chiseled skin base
      const skinGrad = ctx.createRadialGradient(256, 260, 40, 256, 260, 210);
      skinGrad.addColorStop(0, 'rgba(228, 175, 142, 0.95)');
      skinGrad.addColorStop(0.6, 'rgba(205, 150, 118, 0.85)');
      skinGrad.addColorStop(1.0, 'rgba(175, 120, 90, 0.0)');
      ctx.fillStyle = skinGrad;
      ctx.beginPath();
      ctx.ellipse(256, 260, 175, 210, 0, 0, Math.PI * 2);
      ctx.fill();

      // Forehead highlight
      const foreGrad = ctx.createRadialGradient(256, 135, 10, 256, 135, 75);
      foreGrad.addColorStop(0, 'rgba(250, 215, 190, 0.50)');
      foreGrad.addColorStop(1, 'rgba(250, 215, 190, 0.0)');
      ctx.fillStyle = foreGrad;
      ctx.fillRect(175, 65, 160, 140);

      // Powerful athletic cheekbones
      const cheekL = ctx.createRadialGradient(160, 270, 5, 160, 270, 55);
      cheekL.addColorStop(0, 'rgba(220, 125, 100, 0.35)');
      cheekL.addColorStop(1, 'rgba(220, 125, 100, 0.0)');
      ctx.fillStyle = cheekL; ctx.fillRect(105, 215, 110, 110);

      const cheekR = ctx.createRadialGradient(352, 270, 5, 352, 270, 55);
      cheekR.addColorStop(0, 'rgba(220, 125, 100, 0.35)');
      cheekR.addColorStop(1, 'rgba(220, 125, 100, 0.0)');
      ctx.fillStyle = cheekR; ctx.fillRect(297, 215, 110, 110);

      // Eyes: Emerald / Steel green titan gaze
      const keeperIris = {
        inner: '#34d399',
        mid: '#059669',
        outer: '#065f46',
        limbal: '#022c22'
      };
      drawStylizedEye(ctx, 172, 190, 27, 14, keeperIris, '#051811', true);
      drawStylizedEye(ctx, 340, 190, 27, 14, keeperIris, '#051811', false);

      // Heavy athletic brow
      drawEyebrow(ctx, 135, 165, 215, 162, 148, 10, '#362214');
      drawEyebrow(ctx, 377, 165, 297, 162, 148, 10, '#362214');

      // Broad heroic nose bridge
      ctx.fillStyle = 'rgba(245, 215, 195, 0.45)';
      ctx.beginPath();
      ctx.ellipse(256, 230, 11, 32, 0, 0, Math.PI * 2);
      ctx.fill();

      // Strong nostrils
      ctx.fillStyle = 'rgba(110, 55, 40, 0.60)';
      ctx.beginPath();
      ctx.ellipse(238, 270, 7.5, 4, -0.2, 0, Math.PI * 2);
      ctx.ellipse(274, 270, 7.5, 4, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Chiseled firm lips
      ctx.fillStyle = '#a85b50';
      ctx.beginPath();
      ctx.moveTo(224, 314);
      ctx.quadraticCurveTo(244, 308, 256, 310);
      ctx.quadraticCurveTo(268, 308, 288, 314);
      ctx.quadraticCurveTo(256, 318, 224, 314);
      ctx.fill();

      ctx.fillStyle = '#be6b5f';
      ctx.beginPath();
      ctx.moveTo(226, 315);
      ctx.quadraticCurveTo(256, 318, 286, 315);
      ctx.quadraticCurveTo(256, 330, 226, 315);
      ctx.fill();

      ctx.fillStyle = 'rgba(250, 205, 195, 0.55)';
      ctx.beginPath();
      ctx.ellipse(256, 321, 15, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#501e18';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(222, 314);
      ctx.quadraticCurveTo(256, 318, 290, 314);
      ctx.stroke();

      // Strong chiseled chin cleft & jaw shadow
      ctx.fillStyle = 'rgba(70, 35, 20, 0.20)';
      ctx.beginPath();
      ctx.ellipse(256, 370, 65, 35, 0, 0, Math.PI * 2);
      ctx.fill();

      return cvs.toDataURL('image/png');
    }

    return {
      hoops: makeHoopsFace(),
      footy: makeFootyFace(),
      keeper: makeKeeperFace()
    };
  });

  await browser.close();

  for (const [key, dataUrl] of Object.entries(faceDataUrls)) {
    const buf = Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64');
    fs.writeFileSync(`assets/characters/${key}_face_plate.png`, buf);
    console.log(`✓ Saved assets/characters/${key}_face_plate.png (${buf.length} bytes)`);
  }
}

generateFacePlates().catch(console.error);
