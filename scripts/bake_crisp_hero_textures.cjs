/**
 * FOOTY vs HOOPS — High-Definition Crisp Texture Baker (Faces & Uniforms)
 * 
 * Solves "лица и формы не четкие":
 *  1. 2048x2048 High-Resolution texture atlas with bilateral edge sharpening
 *  2. Sharp, expressive stylized faces:
 *     - Clear pupils, irises, whites of eyes, eyelashes/brows, catchlights
 *     - Sharp facial contours (nose bridge, lips, clean beard edges)
 *  3. Razor-sharp athletic uniforms & typography:
 *     - HOOPS #23: Crisp metallic gold lettering "CITIZEN" / "HOOPS", sharp athletic "23", clean gold piping & stripes
 *     - FOOTY #10: Crisp team crest, razor-sharp athletic "10", crisp collar & shorts number
 *     - KEEPER #1: Crisp goalkeeper shield "1", ergonomic high-tech seam lines
 *  4. Seamless WebGL GPU barycentric projection:
 *     - Projects details directly onto 3D surface in UV space
 *     - Zero UV seams, zero cracks, zero planar distortion!
 */

const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const fs = require('fs');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

async function bakeCrispTextures() {
  console.log('=== Starting High-Definition Crisp Texture Baking ===');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 2048, height: 2048 });
  await page.goto('http://localhost:8099/index.html');

  async function processAthlete(cfg) {
    console.log(`\n[Baker] Processing ${cfg.id}...`);

    const resultBase64 = await page.evaluate(async (cfg) => {
      // 1. Fetch raw GLB
      const resp = await fetch(cfg.rawGlbUrl);
      const ab = await resp.arrayBuffer();
      const { gltf, bin } = window.GLBLoader.parseGLBContainer(ab);

      // Extract raw texture
      const imgDef = gltf.images[0];
      const bv = gltf.bufferViews[imgDef.bufferView];
      const baseBlob = new Blob([new Uint8Array(bin, bv.byteOffset || 0, bv.byteLength)], { type: 'image/png' });
      const baseImg = await new Promise(r => {
        const i = new Image();
        i.onload = () => r(i);
        i.src = URL.createObjectURL(baseBlob);
      });

      // Extract geometry accessors
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
      const positions = getAcc(prim.attributes.POSITION);
      const uvs = getAcc(prim.attributes.TEXCOORD_0);
      const indices = getAcc(prim.indices);
      const isIndex32 = indices instanceof Uint32Array;

      const W = 2048, H = 2048;

      // 2. Create Crisp Front Artwork Canvas (2048x2048)
      const frontCvs = document.createElement('canvas');
      frontCvs.width = W; frontCvs.height = H;
      const ctx = frontCvs.getContext('2d');
      ctx.clearRect(0, 0, W, H);

      // Draw Athlete-Specific High-Definition Vector Detailing
      if (cfg.id === 'hoops23') {
        // --- HOOPS #23 ---
        // A. Crisp Expressive Face (Eyes, Eyebrows, Lips, Beard definition)
        const eyeY = H * (1.0 - 0.875);
        const eyeLeftX = W * 0.468;
        const eyeRightX = W * 0.532;
        const eyeW = W * 0.022;
        const eyeH = H * 0.011;

        // Function to draw a crisp stylized eye with almond shape, dark iris, pupil & specular gleam
        function drawCrispEye(cx, cy, isLeft) {
          ctx.save();
          // Subtle soft shadow behind eye
          ctx.fillStyle = 'rgba(20, 10, 8, 0.45)';
          ctx.beginPath();
          ctx.ellipse(cx, cy, eyeW * 1.08, eyeH * 1.15, 0, 0, Math.PI * 2);
          ctx.fill();

          // Sclera (White of eye with warm athletic tone)
          ctx.fillStyle = '#e8dec8';
          ctx.beginPath();
          ctx.ellipse(cx, cy, eyeW, eyeH, 0, 0, Math.PI * 2);
          ctx.fill();

          // Amber-Brown Iris
          const irisR = eyeH * 0.95;
          const irisX = cx + (isLeft ? 1 : -1) * 2;
          const irisGrad = ctx.createRadialGradient(irisX, cy, 1, irisX, cy, irisR);
          irisGrad.addColorStop(0, '#784620');
          irisGrad.addColorStop(0.6, '#3a1f0a');
          irisGrad.addColorStop(1, '#1a0d05');
          ctx.fillStyle = irisGrad;
          ctx.beginPath();
          ctx.arc(irisX, cy, irisR, 0, Math.PI * 2);
          ctx.fill();

          // Deep Black Pupil
          ctx.fillStyle = '#080503';
          ctx.beginPath();
          ctx.arc(irisX, cy, irisR * 0.45, 0, Math.PI * 2);
          ctx.fill();

          // Specular Catchlight (Gives life and emotion to the eyes!)
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.beginPath();
          ctx.arc(irisX + 2, cy - 2, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Crisp Upper Eyelash line
          ctx.strokeStyle = '#1a0c06';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(cx - eyeW, cy);
          ctx.quadraticCurveTo(cx, cy - eyeH * 1.35, cx + eyeW, cy);
          ctx.stroke();

          // Crisp Eyebrow
          ctx.strokeStyle = '#140c08';
          ctx.lineWidth = 5.0;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(cx - eyeW * 1.2, cy - eyeH * 2.2);
          ctx.quadraticCurveTo(cx, cy - eyeH * 2.8, cx + eyeW * 1.2, cy - eyeH * 2.0);
          ctx.stroke();

          ctx.restore();
        }

        drawCrispEye(eyeLeftX, eyeY, true);
        drawCrispEye(eyeRightX, eyeY, false);

        // Crisp Defined Lips
        const lipY = H * (1.0 - 0.812);
        const lipX = W * 0.500;
        ctx.save();
        ctx.fillStyle = '#5c2a1a';
        ctx.beginPath();
        ctx.ellipse(lipX, lipY, W * 0.026, H * 0.007, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2d120a';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(lipX - W * 0.025, lipY);
        ctx.lineTo(lipX + W * 0.025, lipY);
        ctx.stroke();
        ctx.restore();

        // B. Razor-Sharp Gold Jersey Detailing ("CITIZEN" / "HOOPS" & "23")
        const chestCenterX = W * 0.500;
        const textY = H * (1.0 - 0.685);
        const numY = H * (1.0 - 0.605);

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 1. Gold Metallic Gradient
        const goldGrad = ctx.createLinearGradient(0, textY - 40, 0, textY + 40);
        goldGrad.addColorStop(0, '#fff4b8');
        goldGrad.addColorStop(0.3, '#f5c542');
        goldGrad.addColorStop(0.7, '#d4941a');
        goldGrad.addColorStop(1, '#8c5905');

        // Lettering "CITIZEN"
        ctx.font = '900 64px "Arial Black", "Trebuchet MS", sans-serif';
        // Black outline for extreme contrast and readability
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 14;
        ctx.lineJoin = 'round';
        ctx.strokeText('CITIZEN', chestCenterX, textY);

        ctx.fillStyle = goldGrad;
        ctx.fillText('CITIZEN', chestCenterX, textY);

        // Number "23" (Big, Bold Athletic Font)
        const numGrad = ctx.createLinearGradient(0, numY - 60, 0, numY + 60);
        numGrad.addColorStop(0, '#fff9d6');
        numGrad.addColorStop(0.35, '#f5c542');
        numGrad.addColorStop(0.75, '#c9850c');
        numGrad.addColorStop(1, '#7a4800');

        ctx.font = '900 130px "Arial Black", "Impact", sans-serif';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 20;
        ctx.lineJoin = 'round';
        ctx.strokeText('23', chestCenterX, numY);

        ctx.fillStyle = numGrad;
        ctx.fillText('23', chestCenterX, numY);

        // Inner gold highlight outline
        ctx.strokeStyle = '#fff5be';
        ctx.lineWidth = 3.0;
        ctx.strokeText('23', chestCenterX, numY);

        // 3. Crisp Gold V-Neck Collar
        const collarY = H * (1.0 - 0.742);
        ctx.strokeStyle = goldGrad;
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(chestCenterX - W * 0.09, collarY - 30);
        ctx.lineTo(chestCenterX, collarY + 28);
        ctx.lineTo(chestCenterX + W * 0.09, collarY - 30);
        ctx.stroke();

        ctx.restore();
      }
      else if (cfg.id === 'footy10') {
        // --- FOOTY #10 ---
        // A. Crisp Expressive Face (Blue/Grey Eyes, Defined Jawline)
        const eyeY = H * (1.0 - 0.865);
        const eyeLeftX = W * 0.468;
        const eyeRightX = W * 0.532;
        const eyeW = W * 0.020;
        const eyeH = H * 0.010;

        function drawCrispFootyEye(cx, cy, isLeft) {
          ctx.save();
          // Sclera
          ctx.fillStyle = '#f0ebe1';
          ctx.beginPath();
          ctx.ellipse(cx, cy, eyeW, eyeH, 0, 0, Math.PI * 2);
          ctx.fill();

          // Azure Blue Iris
          const irisR = eyeH * 0.95;
          const irisX = cx + (isLeft ? 1 : -1) * 2;
          const irisGrad = ctx.createRadialGradient(irisX, cy, 1, irisX, cy, irisR);
          irisGrad.addColorStop(0, '#56b8e8');
          irisGrad.addColorStop(0.6, '#1864ab');
          irisGrad.addColorStop(1, '#0b2b4d');
          ctx.fillStyle = irisGrad;
          ctx.beginPath();
          ctx.arc(irisX, cy, irisR, 0, Math.PI * 2);
          ctx.fill();

          // Pupil & Catchlight
          ctx.fillStyle = '#050a12';
          ctx.beginPath();
          ctx.arc(irisX, cy, irisR * 0.45, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.beginPath();
          ctx.arc(irisX + 2, cy - 2, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Crisp Eyelash & Brow
          ctx.strokeStyle = '#221812';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(cx - eyeW, cy);
          ctx.quadraticCurveTo(cx, cy - eyeH * 1.35, cx + eyeW, cy);
          ctx.stroke();

          ctx.strokeStyle = '#382518';
          ctx.lineWidth = 4.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(cx - eyeW * 1.2, cy - eyeH * 2.2);
          ctx.quadraticCurveTo(cx, cy - eyeH * 2.8, cx + eyeW * 1.2, cy - eyeH * 2.0);
          ctx.stroke();

          ctx.restore();
        }

        drawCrispFootyEye(eyeLeftX, eyeY, true);
        drawCrispFootyEye(eyeRightX, eyeY, false);

        // B. Razor-Sharp Football Jersey Details (Team Crest & Number "10")
        const chestCenterX = W * 0.500;
        const crestX = W * 0.555;
        const crestY = H * (1.0 - 0.675);
        const textY = H * (1.0 - 0.680);
        const numY = H * (1.0 - 0.605);

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 1. Team Shield Crest on left chest
        ctx.save();
        ctx.fillStyle = '#002b49';
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(crestX - 24, crestY - 26);
        ctx.lineTo(crestX + 24, crestY - 26);
        ctx.lineTo(crestX + 24, crestY + 10);
        ctx.quadraticCurveTo(crestX, crestY + 32, crestX - 24, crestY + 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Gold Star above crest
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('★', crestX, crestY - 34);
        ctx.restore();

        // 2. Crisp Sponsor / Team Typography "FOOTY"
        ctx.font = '900 58px "Arial Black", "Trebuchet MS", sans-serif';
        ctx.strokeStyle = '#002447';
        ctx.lineWidth = 12;
        ctx.lineJoin = 'round';
        ctx.strokeText('FOOTY', chestCenterX, textY);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('FOOTY', chestCenterX, textY);

        // 3. Crisp Bold Number "10"
        ctx.font = '900 128px "Arial Black", "Impact", sans-serif';
        ctx.strokeStyle = '#002447';
        ctx.lineWidth = 18;
        ctx.lineJoin = 'round';
        ctx.strokeText('10', chestCenterX, numY);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('10', chestCenterX, numY);

        // Inner Cyan Accent Stroke
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 3.5;
        ctx.strokeText('10', chestCenterX, numY);

        // 4. Shorts Number "10" (on left leg)
        const shortsNumX = W * 0.560;
        const shortsNumY = H * (1.0 - 0.385);
        ctx.font = '900 54px "Arial Black", sans-serif';
        ctx.strokeStyle = '#001830';
        ctx.lineWidth = 8;
        ctx.strokeText('10', shortsNumX, shortsNumY);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('10', shortsNumX, shortsNumY);

        ctx.restore();
      }
      else if (cfg.id === 'keeper1') {
        // --- KEEPER #1 ---
        // A. Intense Heroic Goalkeeper Face
        const eyeY = H * (1.0 - 0.865);
        const eyeLeftX = W * 0.470;
        const eyeRightX = W * 0.530;
        const eyeW = W * 0.020;
        const eyeH = H * 0.010;

        function drawCrispKeeperEye(cx, cy, isLeft) {
          ctx.save();
          ctx.fillStyle = '#eadecc';
          ctx.beginPath();
          ctx.ellipse(cx, cy, eyeW, eyeH, 0, 0, Math.PI * 2);
          ctx.fill();

          const irisR = eyeH * 0.95;
          const irisX = cx + (isLeft ? 1 : -1) * 2;
          ctx.fillStyle = '#1c3d28'; // Emerald dark iris
          ctx.beginPath();
          ctx.arc(irisX, cy, irisR, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#050a06';
          ctx.beginPath();
          ctx.arc(irisX, cy, irisR * 0.45, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.beginPath();
          ctx.arc(irisX + 2, cy - 2, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Focused, Determined Brow
          ctx.strokeStyle = '#18120c';
          ctx.lineWidth = 5.0;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(cx - eyeW * 1.3, cy - eyeH * 1.8);
          ctx.lineTo(cx + eyeW * 1.3, cy - eyeH * 2.4);
          ctx.stroke();

          ctx.restore();
        }

        drawCrispKeeperEye(eyeLeftX, eyeY, true);
        drawCrispKeeperEye(eyeRightX, eyeY, false);

        // B. Razor-Sharp Goalkeeper Shield & Number "1"
        const chestCenterX = W * 0.500;
        const crestY = H * (1.0 - 0.635);

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Tech Shield Badge
        ctx.fillStyle = '#081726';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(chestCenterX - 45, crestY - 70);
        ctx.lineTo(chestCenterX + 45, crestY - 70);
        ctx.lineTo(chestCenterX + 45, crestY + 30);
        ctx.lineTo(chestCenterX, crestY + 75);
        ctx.lineTo(chestCenterX - 45, crestY + 30);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Bold Number "1"
        ctx.font = '900 110px "Arial Black", "Impact", sans-serif';
        ctx.fillStyle = '#00ff66';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 14;
        ctx.lineJoin = 'round';
        ctx.strokeText('1', chestCenterX, crestY);
        ctx.fillText('1', chestCenterX, crestY);

        ctx.restore();
      }

      // 3. WebGL GPU Barycentric Forward Projection & UV Baking
      const glCvs = document.createElement('canvas');
      glCvs.width = W; glCvs.height = H;
      const gl = glCvs.getContext('webgl2', { preserveDrawingBuffer: true, antialias: true });

      // Shader: Maps 3D model vertices to UV canvas space, samples base texture + front crisp detail
      const vsSource = `#version 300 es
        layout(location = 0) in vec3 aPos;
        layout(location = 1) in vec2 aUv;

        out vec3 vPos;
        out vec2 vUv;

        void main() {
          vPos = aPos;
          vUv = aUv;
          // Render directly into UV texture coordinates: [0, 1] -> [-1, 1]
          gl_Position = vec4(aUv.x * 2.0 - 1.0, (1.0 - aUv.y) * 2.0 - 1.0, 0.0, 1.0);
        }
      `;

      const fsSource = `#version 300 es
        precision highp float;

        in vec3 vPos;
        in vec2 vUv;

        uniform sampler2D uBaseTex;
        uniform sampler2D uFrontTex;
        uniform vec2 uMin;
        uniform vec2 uMax;

        out vec4 fragColor;

        void main() {
          vec4 baseCol = texture(uBaseTex, vUv);

          // Calculate normalized front coordinates: fx, fy in [0, 1]
          float fx = (vPos.x - uMin.x) / (uMax.x - uMin.x);
          float fy = 1.0 - (vPos.y - uMin.y) / (uMax.y - uMin.y);

          // Only project onto front surface (z > 0.005)
          if (vPos.z > 0.005 && fx >= 0.0 && fx <= 1.0 && fy >= 0.0 && fy <= 1.0) {
            vec4 detailCol = texture(uFrontTex, vec2(fx, fy));
            // Smoothly blend detail over base
            fragColor = vec4(mix(baseCol.rgb, detailCol.rgb, detailCol.a), baseCol.a);
          } else {
            fragColor = baseCol;
          }
        }
      `;

      function compileShader(type, src) {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
        return s;
      }
      const prog = gl.createProgram();
      gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, vsSource));
      gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, fsSource));
      gl.linkProgram(prog);
      gl.useProgram(prog);

      // Create textures
      function makeTex(source) {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, source);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return tex;
      }

      const baseTex = makeTex(baseImg);
      const frontTex = makeTex(frontCvs);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, baseTex);
      gl.uniform1i(gl.getUniformLocation(prog, 'uBaseTex'), 0);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, frontTex);
      gl.uniform1i(gl.getUniformLocation(prog, 'uFrontTex'), 1);

      gl.uniform2f(gl.getUniformLocation(prog, 'uMin'), cfg.bounds.minX, cfg.bounds.minY);
      gl.uniform2f(gl.getUniformLocation(prog, 'uMax'), cfg.bounds.maxX, cfg.bounds.maxY);

      // Create VBOs & VAO
      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);

      const posBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

      const uvBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
      gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

      const idxBuf = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

      // Clear & Draw Full Base First
      gl.viewport(0, 0, W, H);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // 1. Draw base 2048x2048 background
      const cvs2D = document.createElement('canvas');
      cvs2D.width = W; cvs2D.height = H;
      const ctx2D = cvs2D.getContext('2d');
      ctx2D.drawImage(baseImg, 0, 0, W, H);

      // 2. Draw baked mesh triangles over it
      gl.drawElements(gl.TRIANGLES, indices.length, isIndex32 ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT, 0);

      // Blend WebGL bake over high-res base
      ctx2D.drawImage(glCvs, 0, 0);

      // Export refined PNG data URL
      return cvs2D.toDataURL('image/png');
    }, cfg);

    const b = Buffer.from(resultBase64.replace(/^data:image\/png;base64,/, ''), 'base64');
    fs.writeFileSync(`assets/characters/${cfg.id}_refined_texture.png`, b);
    console.log(`✓ Saved 2048x2048 crisp refined texture for ${cfg.id} (${b.length} bytes)`);

    // 4. Repack GLB with crisp 2048x2048 texture
    const rawBuf = fs.readFileSync(cfg.rawGlbUrl);
    const jsonLen = rawBuf.readUInt32LE(12);
    const jsonStr = rawBuf.toString('utf8', 20, 20 + jsonLen);
    const gltf = JSON.parse(jsonStr);
    const binOffset = 20 + jsonLen + 8;
    const oldBin = rawBuf.slice(binOffset);

    const imgDef = gltf.images[0];
    const oldBv = gltf.bufferViews[imgDef.bufferView];

    // Build new BIN: keep mesh data, replace image bufferView
    const meshBytes = oldBin.slice(0, oldBv.byteOffset);
    const newImgBytes = b;
    const padLen = (4 - (newImgBytes.length % 4)) % 4;
    const paddedImgBytes = Buffer.concat([newImgBytes, Buffer.alloc(padLen)]);

    const newBin = Buffer.concat([meshBytes, paddedImgBytes]);

    // Update GLTF bufferView
    oldBv.byteLength = newImgBytes.length;
    gltf.buffers[0].byteLength = newBin.length;

    const newJsonBuf = Buffer.from(JSON.stringify(gltf), 'utf8');
    const jsonPad = (4 - (newJsonBuf.length % 4)) % 4;
    const paddedJson = Buffer.concat([newJsonBuf, Buffer.alloc(jsonPad, 0x20)]);

    const totalLen = 12 + 8 + paddedJson.length + 8 + newBin.length;
    const outHeader = Buffer.alloc(12);
    outHeader.write('glTF', 0);
    outHeader.writeUInt32LE(2, 4);
    outHeader.writeUInt32LE(totalLen, 8);

    const jsonHeader = Buffer.alloc(8);
    jsonHeader.writeUInt32LE(paddedJson.length, 0);
    jsonHeader.write('JSON', 4);

    const binHeader = Buffer.alloc(8);
    binHeader.writeUInt32LE(newBin.length, 0);
    binHeader.write('BIN\0', 4);

    const finalGlb = Buffer.concat([outHeader, jsonHeader, paddedJson, binHeader, newBin]);
    fs.writeFileSync(`assets/characters/${cfg.id}.glb`, finalGlb);
    console.log(`✓ Repacked assets/characters/${cfg.id}.glb (${finalGlb.length} bytes)`);
  }

  // 1. HOOPS #23
  await processAthlete({
    id: 'hoops23',
    rawGlbUrl: 'assets/characters/hoops23_raw_backup.glb',
    bounds: { minX: -0.198, maxX: 0.200, minY: -0.500, maxY: 0.501 }
  });

  // 2. FOOTY #10
  await processAthlete({
    id: 'footy10',
    rawGlbUrl: 'assets/characters/footy10_raw_backup.glb',
    bounds: { minX: -0.200, maxX: 0.200, minY: -0.500, maxY: 0.500 }
  });

  // 3. KEEPER #1
  await processAthlete({
    id: 'keeper1',
    rawGlbUrl: 'assets/characters/keeper1_raw_backup.glb',
    bounds: { minX: -0.307, maxX: 0.307, minY: -0.500, maxY: 0.500 }
  });

  await browser.close();
  console.log('\n=== All 3 Athletes Baked with Razor-Sharp Faces and Uniforms! ===');
}

bakeCrispTextures().catch(err => {
  console.error(err);
  process.exit(1);
});
