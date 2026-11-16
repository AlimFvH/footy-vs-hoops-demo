const puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core');
const fs = require('fs');
const loader = require('../assets/loaders/glb_loader.js');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

function repackGLB(rawGlbPath, newImgBytes, outGlbPath) {
  const rawBuf = fs.readFileSync(rawGlbPath);
  const jsonLen = rawBuf.readUInt32LE(12);
  const jsonStr = rawBuf.toString('utf8', 20, 20 + jsonLen);
  const gltf = JSON.parse(jsonStr);
  const binOffset = 20 + jsonLen + 8;
  const oldBin = rawBuf.slice(binOffset);

  const imgBvIndex = gltf.images[0].bufferView;

  const chunks = [];
  let currentOffset = 0;

  for (let i = 0; i < gltf.bufferViews.length; i++) {
    const bv = gltf.bufferViews[i];
    let data;
    if (i === imgBvIndex) {
      data = newImgBytes;
    } else {
      data = oldBin.slice(bv.byteOffset, bv.byteOffset + bv.byteLength);
    }

    const padLen = (4 - (data.length % 4)) % 4;
    const padded = padLen > 0 ? Buffer.concat([data, Buffer.alloc(padLen)]) : data;

    bv.byteOffset = currentOffset;
    bv.byteLength = data.length;
    currentOffset += padded.length;
    chunks.push(padded);
  }

  const newBin = Buffer.concat(chunks);
  gltf.buffers[0].byteLength = newBin.length;

  const newJsonStr = JSON.stringify(gltf);
  const jsonBuf = Buffer.from(newJsonStr, 'utf8');
  const jsonPadLen = (4 - (jsonBuf.length % 4)) % 4;
  const paddedJson = jsonPadLen > 0 ? Buffer.concat([jsonBuf, Buffer.alloc(jsonPadLen, 0x20)]) : jsonBuf;

  const totalLen = 12 + 8 + paddedJson.length + 8 + newBin.length;
  const header = Buffer.alloc(12);
  header.write('glTF', 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(totalLen, 8);

  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(paddedJson.length, 0);
  jsonHeader.write('JSON', 4);

  const binHeader = Buffer.alloc(8);
  binHeader.writeUInt32LE(newBin.length, 0);
  binHeader.write('BIN\0', 4);

  const outBuf = Buffer.concat([header, jsonHeader, paddedJson, binHeader, newBin]);
  fs.writeFileSync(outGlbPath, outBuf);
  console.log(`✓ Repacked ${outGlbPath} (${outBuf.length} bytes)`);
}

function loadMeshBuffers(rawGlbPath) {
  const buf = fs.readFileSync(rawGlbPath);
  const parsed = loader.parseGLBContainer(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  const gltf = parsed.gltf;
  const bin = parsed.bin;

  function getAcc(idx) {
    const acc = gltf.accessors[idx];
    const bv = gltf.bufferViews[acc.bufferView];
    const offset = (bv.byteOffset || 0) + (acc.byteOffset || 0);
    if (acc.componentType === 5126) return new Float32Array(bin, offset, acc.count * (acc.type === 'VEC3' ? 3 : 2));
    if (acc.componentType === 5125) return new Uint32Array(bin, offset, acc.count);
    if (acc.componentType === 5123) return new Uint16Array(bin, offset, acc.count);
  }

  const prim = gltf.meshes[0].primitives[0];
  const posArr = Array.from(getAcc(prim.attributes.POSITION));
  const uvArr = Array.from(getAcc(prim.attributes.TEXCOORD_0));
  const idxArr = Array.from(getAcc(prim.indices));

  const normalMap = new Map();
  const posToKey = (idx) => `${Math.round(posArr[idx*3]*10000)},${Math.round(posArr[idx*3+1]*10000)},${Math.round(posArr[idx*3+2]*10000)}`;
  for (let i = 0; i < idxArr.length; i += 3) {
    const i0 = idxArr[i], i1 = idxArr[i+1], i2 = idxArr[i+2];
    const ax = posArr[i1*3] - posArr[i0*3], ay = posArr[i1*3+1] - posArr[i0*3+1], az = posArr[i1*3+2] - posArr[i0*3+2];
    const bx = posArr[i2*3] - posArr[i0*3], by = posArr[i2*3+1] - posArr[i0*3+1], bz = posArr[i2*3+2] - posArr[i0*3+2];
    const nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
    for (const idx of [i0, i1, i2]) {
      const k = posToKey(idx);
      let cur = normalMap.get(k) || [0, 0, 0];
      cur[0] += nx; cur[1] += ny; cur[2] += nz;
      normalMap.set(k, cur);
    }
  }
  const normArr = new Array(posArr.length);
  for (let i = 0; i < posArr.length / 3; i++) {
    const k = posToKey(i);
    const n = normalMap.get(k) || [0, 1, 0];
    const l = Math.hypot(n[0], n[1], n[2]) || 1;
    normArr[i*3] = n[0] / l;
    normArr[i*3+1] = n[1] / l;
    normArr[i*3+2] = n[2] / l;
  }

  return { pos: posArr, normals: normArr, uvs: uvArr, indices: idxArr };
}

async function projectCharacter(charType, rawGlbPath, baseTexPath, previewTexPath, outGlbPath, config) {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 2048, height: 2048 });

  const meshData = loadMeshBuffers(rawGlbPath);
  const baseB64 = fs.readFileSync(baseTexPath).toString('base64');
  const previewB64 = fs.readFileSync(previewTexPath).toString('base64');

  const outB64 = await page.evaluate(async (meshData, baseB64, previewB64, config) => {
    const W = 2048, H = 2048;

    const baseImg = new Image();
    await new Promise(r => { baseImg.onload = r; baseImg.src = 'data:image/png;base64,' + baseB64; });

    const previewImg = new Image();
    await new Promise(r => { previewImg.onload = r; previewImg.src = (previewB64.startsWith('/9j/') ? 'data:image/jpeg;base64,' : 'data:image/png;base64,') + previewB64; });

    // WebGL canvas for direct 3D unrolling in UV space
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false });

    // Shaders
    const meshVS = `#version 300 es
      layout(location = 0) in vec3 aPos;
      layout(location = 1) in vec3 aNormal;
      layout(location = 2) in vec2 aTexCoord;

      out vec3 vPos;
      out vec3 vNormal;
      out vec2 vUV;

      void main() {
        vPos = aPos;
        vNormal = aNormal;
        vUV = aTexCoord;
        gl_Position = vec4(aTexCoord.x * 2.0 - 1.0, 1.0 - aTexCoord.y * 2.0, 0.0, 1.0);
      }
    `;

    const meshFS = `#version 300 es
      precision highp float;
      in vec3 vPos;
      in vec3 vNormal;
      in vec2 vUV;

      uniform sampler2D uBaseTex;
      uniform sampler2D uPreviewTex;
      uniform float uScaleX;
      uniform float uScaleY;
      uniform float uOffsetY;
      uniform float uCenterX;
      uniform float uFacingMin;
      uniform float uFacingMax;

      out vec4 fragColor;

      void main() {
        vec4 baseCol = texture(uBaseTex, vUV);
        vec3 N = normalize(vNormal);

        // Project front-facing vertices into preview image
        vec2 projUV;
        projUV.x = uCenterX + vPos.x * uScaleX;
        projUV.y = (0.50 - vPos.y) * uScaleY + uOffsetY;

        vec4 previewCol = vec4(0.0);
        if (projUV.x >= 0.0 && projUV.x <= 1.0 && projUV.y >= 0.0 && projUV.y <= 1.0) {
          previewCol = texture(uPreviewTex, projUV);
        }

        // Facing weight: smooth fade from front to sides
        float facing = smoothstep(uFacingMin, uFacingMax, N.z);
        float blend = facing * previewCol.a;

        vec3 finalRGB = mix(baseCol.rgb, previewCol.rgb, blend);
        // Alpha is 1.0 for all rendered triangle fragments
        fragColor = vec4(finalRGB, 1.0);
      }
    `;

    function createShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader));
      }
      return shader;
    }

    const program = gl.createProgram();
    gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, meshVS));
    gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, meshFS));
    gl.linkProgram(program);
    gl.useProgram(program);

    // Buffers
    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(meshData.pos), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    const normBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(meshData.normals), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

    const uvBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(meshData.uvs), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);

    const idxBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(meshData.indices), gl.STATIC_DRAW);

    // Textures
    const t0 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, t0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, baseImg);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const t1 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, t1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, previewImg);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.viewport(0, 0, W, H);
    // Clear to 100% transparent black so any unrendered pixel has alpha = 0
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform1i(gl.getUniformLocation(program, 'uBaseTex'), 0);
    gl.uniform1i(gl.getUniformLocation(program, 'uPreviewTex'), 1);
    gl.uniform1f(gl.getUniformLocation(program, 'uScaleX'), config.scaleX);
    gl.uniform1f(gl.getUniformLocation(program, 'uScaleY'), config.scaleY);
    gl.uniform1f(gl.getUniformLocation(program, 'uOffsetY'), config.offsetY);
    gl.uniform1f(gl.getUniformLocation(program, 'uCenterX'), config.centerX);
    gl.uniform1f(gl.getUniformLocation(program, 'uFacingMin'), config.facingMin || 0.10);
    gl.uniform1f(gl.getUniformLocation(program, 'uFacingMax'), config.facingMax || 0.40);

    gl.drawElements(gl.TRIANGLES, meshData.indices.length, gl.UNSIGNED_INT, 0);

    // Read WebGL pixels
    const pixels = new Uint8Array(W * H * 4);
    gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    // Flip Y because readPixels starts from bottom-left
    const flipped = new Uint8Array(W * H * 4);
    for (let y = 0; y < H; y++) {
      const srcRow = (H - 1 - y) * W * 4;
      const dstRow = y * W * 4;
      flipped.set(pixels.subarray(srcRow, srcRow + W * 4), dstRow);
    }

    const cur = new Uint32Array(flipped.buffer);
    const temp = new Uint32Array(W * H);
    temp.set(cur);

    // Mask of pixels that are part of the 3D mesh (rendered with alpha 255)
    const isMesh = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) {
      const a = (cur[i] >>> 24) & 0xff;
      if (a > 128) isMesh[i] = 1;
    }

    // 10 iterations of edge dilation (gutter padding)
    console.log('Running 10 dilation iterations...');
    for (let iter = 0; iter < 10; iter++) {
      for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < W - 1; x++) {
          const idx = y * W + x;
          if (isMesh[idx] === 0) {
            let found = 0;
            if (isMesh[idx - 1] === 1) found = cur[idx - 1];
            else if (isMesh[idx + 1] === 1) found = cur[idx + 1];
            else if (isMesh[idx - W] === 1) found = cur[idx - W];
            else if (isMesh[idx + W] === 1) found = cur[idx + W];

            if (found !== 0) {
              temp[idx] = found;
              isMesh[idx] = 2; // mark expanded in this step
            }
          }
        }
      }
      for (let i = 0; i < W * H; i++) {
        if (isMesh[i] === 2) {
          isMesh[i] = 1;
          cur[i] = temp[i];
        }
      }
    }

    // Now composite over base texture:
    // Create output canvas
    const finalCvs = document.createElement('canvas');
    finalCvs.width = W; finalCvs.height = H;
    const ctx = finalCvs.getContext('2d');
    // 1. Draw base image
    ctx.drawImage(baseImg, 0, 0, W, H);

    // 2. Overwrite with dilated projection where isMesh === 1
    const baseData = ctx.getImageData(0, 0, W, H);
    const baseArr = new Uint32Array(baseData.data.buffer);
    for (let i = 0; i < W * H; i++) {
      if (isMesh[i] === 1) {
        baseArr[i] = cur[i] | 0xff000000;
      }
    }
    ctx.putImageData(baseData, 0, 0);

    return finalCvs.toDataURL('image/png').slice(22);
  }, meshData, baseB64, previewB64, config);

  const pngBytes = Buffer.from(outB64, 'base64');
  repackGLB(rawGlbPath, pngBytes, outGlbPath);
  console.log(`✓ Repacked ${outGlbPath}`);

  await browser.close();
}

async function run() {
  console.log('=== Reprojecting Footy with 10-Iteration Edge Dilation ===');
  await projectCharacter(
    'footy',
    'assets/characters/footy10_raw_backup.glb',
    'assets/characters/footy10_orig_texture.png',
    'assets/characters/footy10_preview.png',
    'assets/characters/footy10.glb',
    {
      scaleX: (921.0 - 80.0) / 720.0,
      scaleY: (921.0 - 80.0) / 960.0,
      offsetY: 80.0 / 960.0,
      centerX: 0.50,
      facingMin: 0.10,
      facingMax: 0.40
    }
  );

  console.log('=== Reprojecting Hoops with 10-Iteration Edge Dilation ===');
  await projectCharacter(
    'hoops',
    'assets/characters/hoops23_raw_backup.glb',
    'assets/characters/hoops23_orig_texture.png',
    'assets/characters/hoops23_preview.png',
    'assets/characters/hoops23.glb',
    {
      scaleX: (921.0 - 80.0) / 720.0,
      scaleY: (921.0 - 80.0) / 960.0,
      offsetY: 80.0 / 960.0,
      centerX: 0.50,
      facingMin: 0.10,
      facingMax: 0.40
    }
  );
}

run().catch(console.error);
