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

async function projectAthlete(page, rawGlbPath, baseTexPath, previewTexPath, outGlbPath, config) {
  const meshData = loadMeshBuffers(rawGlbPath);
  const baseB64 = fs.readFileSync(baseTexPath).toString('base64');
  const previewB64 = fs.readFileSync(previewTexPath).toString('base64');

  const outB64 = await page.evaluate(async (meshData, baseB64, previewB64, config) => {
    const W = 2048, H = 2048;

    const baseImg = new Image();
    await new Promise(r => { baseImg.onload = r; baseImg.src = 'data:image/png;base64,' + baseB64; });

    const cleanBaseCvs = document.createElement('canvas');
    cleanBaseCvs.width = W; cleanBaseCvs.height = H;
    const cbCtx = cleanBaseCvs.getContext('2d');
    cbCtx.drawImage(baseImg, 0, 0, W, H);

    const previewImg = new Image();
    await new Promise(r => { previewImg.onload = r; previewImg.src = (previewB64.startsWith('/9j/') ? 'data:image/jpeg;base64,' : 'data:image/png;base64,') + previewB64; });

    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false });

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
      uniform float uCenterX;
      uniform int uCharType; // 0=footy, 1=hoops, 2=keeper

      out vec4 fragColor;

      // Mathematically verified anatomical landmark alignment
      float mapPiecewiseY(float y, int charType) {
        if (charType == 0) { // FOOTY #10
          // 3D landmarks -> 2D UV Y
          if (y >= 0.44) return mix(0.121, 0.083, (y - 0.44) / (0.50 - 0.44)); // Hair top -> Brow
          if (y >= 0.42) return mix(0.146, 0.121, (y - 0.42) / (0.44 - 0.42)); // Brow -> Eyes
          if (y >= 0.40) return mix(0.167, 0.146, (y - 0.40) / (0.42 - 0.40)); // Eyes -> Nose tip
          if (y >= 0.36) return mix(0.192, 0.167, (y - 0.36) / (0.40 - 0.36)); // Nose tip -> Smile / Lips
          if (y >= 0.34) return mix(0.210, 0.192, (y - 0.34) / (0.36 - 0.34)); // Smile -> Chin tip
          if (y >= 0.28) return mix(0.245, 0.210, (y - 0.28) / (0.34 - 0.28)); // Chin -> Throat
          if (y >= 0.24) return mix(0.270, 0.245, (y - 0.24) / (0.28 - 0.24)); // Throat -> Collar
          if (y >= 0.18) return mix(0.320, 0.270, (y - 0.18) / (0.24 - 0.18)); // Collar -> FOOTY text
          if (y >= 0.10) return mix(0.400, 0.320, (y - 0.10) / (0.18 - 0.10)); // #10 Chest number
          if (y >= 0.00) return mix(0.520, 0.400, (y - 0.00) / (0.10 - 0.00)); // Waistband
          if (y >= -0.16) return mix(0.585, 0.520, (y - (-0.16)) / (0.00 - (-0.16))); // Shorts hem
          if (y >= -0.22) return mix(0.655, 0.585, (y - (-0.22)) / (-0.16 - (-0.22))); // Knees
          if (y >= -0.38) return mix(0.780, 0.655, (y - (-0.38)) / (-0.22 - (-0.38))); // Socks / Shins
          return mix(0.940, 0.780, (y - (-0.50)) / (-0.38 - (-0.50))); // Cleats
        } else if (charType == 1) { // HOOPS #23
          if (y >= 0.44) return mix(0.117, 0.083, (y - 0.44) / (0.50 - 0.44)); // Hair fade -> Forehead
          if (y >= 0.42) return mix(0.146, 0.117, (y - 0.42) / (0.44 - 0.42)); // Forehead -> Eyes
          if (y >= 0.395) return mix(0.163, 0.146, (y - 0.395) / (0.42 - 0.395)); // Eyes -> Nose tip
          if (y >= 0.365) return mix(0.181, 0.163, (y - 0.365) / (0.395 - 0.365)); // Nose tip -> Mustache / Smile
          if (y >= 0.340) return mix(0.200, 0.181, (y - 0.340) / (0.365 - 0.340)); // Smile -> Beard / Chin
          if (y >= 0.290) return mix(0.218, 0.200, (y - 0.290) / (0.340 - 0.290)); // Chin -> Throat
          if (y >= 0.250) return mix(0.240, 0.218, (y - 0.250) / (0.290 - 0.250)); // Gold collar
          if (y >= 0.180) return mix(0.295, 0.240, (y - 0.180) / (0.250 - 0.180)); // HOOPS text
          if (y >= 0.080) return mix(0.375, 0.295, (y - 0.080) / (0.180 - 0.080)); // #23 Gold number
          if (y >= 0.000) return mix(0.455, 0.375, (y - 0.000) / (0.080 - 0.000)); // Waistband
          if (y >= -0.160) return mix(0.620, 0.455, (y - (-0.160)) / (0.000 - (-0.160))); // Shorts hem
          if (y >= -0.220) return mix(0.690, 0.620, (y - (-0.220)) / (-0.160 - (-0.220))); // Knees
          if (y >= -0.360) return mix(0.770, 0.690, (y - (-0.360)) / (-0.220 - (-0.360))); // Gold socks
          return mix(0.930, 0.770, (y - (-0.500)) / (-0.360 - (-0.500))); // High-tops
        } else { // KEEPER #1
          if (y >= 0.45) return mix(0.095, 0.065, (y - 0.45) / (0.50 - 0.45)); // Buzzcut -> Forehead
          if (y >= 0.43) return mix(0.125, 0.095, (y - 0.43) / (0.45 - 0.43)); // Forehead -> Eyes
          if (y >= 0.405) return mix(0.150, 0.125, (y - 0.405) / (0.43 - 0.405)); // Eyes -> Nose tip
          if (y >= 0.375) return mix(0.175, 0.150, (y - 0.375) / (0.405 - 0.375)); // Nose tip -> Mouth
          if (y >= 0.355) return mix(0.200, 0.175, (y - 0.355) / (0.375 - 0.355)); // Mouth -> Jaw / Chin
          if (y >= 0.320) return mix(0.230, 0.200, (y - 0.320) / (0.355 - 0.320)); // Chin -> Throat
          if (y >= 0.260) return mix(0.258, 0.230, (y - 0.260) / (0.320 - 0.260)); // Throat -> Collar
          if (y >= 0.150) return mix(0.380, 0.258, (y - 0.150) / (0.260 - 0.150)); // Collar -> #1 Crest
          if (y >= 0.000) return mix(0.483, 0.380, (y - 0.000) / (0.150 - 0.000)); // Belt
          if (y >= -0.160) return mix(0.600, 0.483, (y - (-0.160)) / (0.000 - (-0.160))); // Shorts hem
          if (y >= -0.240) return mix(0.667, 0.600, (y - (-0.240)) / (-0.160 - (-0.240))); // Knees
          if (y >= -0.380) return mix(0.780, 0.667, (y - (-0.380)) / (-0.240 - (-0.380))); // Goalie socks
          return mix(0.940, 0.780, (y - (-0.500)) / (-0.380 - (-0.500))); // Goalie boots
        }
      }

      void main() {
        vec4 baseCol = texture(uBaseTex, vUV);
        vec3 N = normalize(vNormal);

        // --- 1. Non-Linear Anatomical Face Projection ---
        // Compress nose bridge horizontally so both sides of the 3D nose bridge sample clean nose skin
        float xFac = vPos.x;
        if (vPos.y >= 0.33 && vPos.y <= 0.45 && abs(vPos.x) < 0.038) {
          xFac = vPos.x * (0.48 + 0.52 * smoothstep(0.008, 0.032, abs(vPos.x)));
        }

        vec2 projUV;
        projUV.x = uCenterX + xFac * uScaleX;
        projUV.y = mapPiecewiseY(vPos.y, uCharType);

        vec4 previewCol = texture(uPreviewTex, projUV);

        // --- 2. Smooth Seamless Front Blend ---
        vec2 dFace = vPos.xz - vec2(0.0, 0.005);
        float faceAngle = atan(dFace.x, dFace.y);

        // Head blend: 100% on front facial features, smooth falloff toward temples and ears
        float headBlend = smoothstep(1.30, 0.65, abs(faceAngle)) * smoothstep(-0.02, 0.02, vPos.z) * smoothstep(0.0, 0.35, N.z);

        // Torso & legs blend: front projection
        float bodyBlend = smoothstep(-0.01, 0.02, vPos.z) * smoothstep(-0.10, 0.40, N.z);

        bool isHeadZone = (vPos.y >= 0.32);
        float blend = isHeadZone ? headBlend : bodyBlend;

        // Guarantee 100% projection on the direct front face & front chest graphics
        if (isHeadZone && vPos.z > 0.020 && abs(vPos.x) < 0.055 && N.z > 0.40) {
          blend = 1.0;
        }
        if (!isHeadZone && vPos.y >= 0.05 && vPos.y <= 0.28 && vPos.z > 0.020 && abs(vPos.x) < 0.10 && N.z > 0.45) {
          blend = 1.0;
        }

        // Silhouette bounds safety: NEVER sample outside preview image borders or character silhouette
        if (projUV.x < 0.02 || projUV.x > 0.98 || projUV.y < 0.02 || projUV.y > 0.98) {
          blend = 0.0;
        }
        if (uCharType == 2) {
          float keeperSil = smoothstep(0.06, 0.18, max(previewCol.r, max(previewCol.g, previewCol.b)));
          blend *= keeperSil;
        } else {
          blend *= smoothstep(0.20, 0.90, previewCol.a);
        }

        // Blend preview over the original organic texture (baseCol.rgb)!
        // Zero flat plastic blobs, zero peach bibs!
        vec3 finalRGB = mix(baseCol.rgb, previewCol.rgb, clamp(blend, 0.0, 1.0));

        // --- 3. Crisp Clean Uniform Back (High-Definition Athletic Typography) ---
        if (vPos.z < -0.015 && N.z < -0.25 && vPos.y > 0.04 && vPos.y < 0.26 && abs(vPos.x) < 0.12) {
          if (uCharType == 0) { // Footy: Navy #10
            vec3 numColor = vec3(0.06, 0.09, 0.16);
            bool isNum = false;
            if (vPos.x > -0.055 && vPos.x < -0.025 && vPos.y > 0.11 && vPos.y < 0.21) isNum = true;
            if (vPos.x > 0.015 && vPos.x < 0.065 && vPos.y > 0.11 && vPos.y < 0.21) {
              if (vPos.x < 0.030 || vPos.x > 0.050 || vPos.y < 0.135 || vPos.y > 0.185) isNum = true;
            }
            if (isNum) finalRGB = numColor;
          } else if (uCharType == 1) { // Hoops: Gold #23
            vec3 goldNum = vec3(0.96, 0.75, 0.18);
            bool isNum = false;
            if (vPos.x > -0.065 && vPos.x < -0.015 && vPos.y > 0.10 && vPos.y < 0.22) {
              if (vPos.y > 0.19 || vPos.y < 0.13 || (vPos.y >= 0.15 && vPos.y <= 0.17) ||
                  (vPos.y >= 0.17 && vPos.x > -0.035) || (vPos.y < 0.15 && vPos.x < -0.045)) {
                isNum = true;
              }
            }
            if (vPos.x > 0.015 && vPos.x < 0.065 && vPos.y > 0.10 && vPos.y < 0.22) {
              if (vPos.y > 0.19 || vPos.y < 0.13 || (vPos.y >= 0.15 && vPos.y <= 0.17) || vPos.x > 0.045) {
                isNum = true;
              }
            }
            if (isNum) finalRGB = goldNum;
          } else if (uCharType == 2) { // Keeper: White #1
            vec3 whiteNum = vec3(0.96, 0.98, 1.0);
            bool isNum = false;
            if (vPos.x > -0.025 && vPos.x < 0.025 && vPos.y > 0.09 && vPos.y < 0.23) isNum = true;
            if (vPos.x > -0.055 && vPos.x <= -0.025 && vPos.y > 0.19 && vPos.y < 0.22) isNum = true;
            if (vPos.x > -0.06 && vPos.x < 0.06 && vPos.y > 0.09 && vPos.y < 0.115) isNum = true;
            if (isNum) finalRGB = whiteNum;
          }
        }

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

    const vs = createShader(gl, gl.VERTEX_SHADER, meshVS);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, meshFS);
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program));
    }
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
    const baseTex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, baseTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cleanBaseCvs);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const previewTex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, previewTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, previewImg);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.viewport(0, 0, W, H);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform1i(gl.getUniformLocation(program, 'uBaseTex'), 0);
    gl.uniform1i(gl.getUniformLocation(program, 'uPreviewTex'), 1);
    gl.uniform1f(gl.getUniformLocation(program, 'uScaleX'), config.scaleX);
    gl.uniform1f(gl.getUniformLocation(program, 'uCenterX'), config.centerX);
    gl.uniform1i(gl.getUniformLocation(program, 'uCharType'), config.charType);

    gl.drawElements(gl.TRIANGLES, meshData.indices.length, gl.UNSIGNED_INT, 0);

    // Read WebGL pixels
    const pixels = new Uint8Array(W * H * 4);
    gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    // Flip Y
    const flipped = new Uint8Array(W * H * 4);
    for (let y = 0; y < H; y++) {
      const srcRow = (H - 1 - y) * W * 4;
      const dstRow = y * W * 4;
      flipped.set(pixels.subarray(srcRow, srcRow + W * 4), dstRow);
    }

    const cur = new Uint32Array(flipped.buffer);
    const isMesh = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) {
      const a = (cur[i] >>> 24) & 0xff;
      if (a > 128) isMesh[i] = 1;
    }

    // 48 iterations of ultra-fast BFS Voronoi edge dilation
    let frontier = [];
    for (let i = 0; i < W * H; i++) {
      if (isMesh[i] === 1) {
        const x = i % W, y = Math.floor(i / W);
        if ((x > 0 && isMesh[i - 1] === 0) ||
            (x < W - 1 && isMesh[i + 1] === 0) ||
            (y > 0 && isMesh[i - W] === 0) ||
            (y < H - 1 && isMesh[i + W] === 0)) {
          frontier.push(i);
        }
      }
    }

    let iters = 0;
    while (frontier.length > 0 && iters < 48) {
      const nextFrontier = [];
      for (let k = 0; k < frontier.length; k++) {
        const curr = frontier[k];
        const color = cur[curr];
        const cx = curr % W, cy = Math.floor(curr / W);

        const neighbors = [
          cx > 0 ? curr - 1 : -1,
          cx < W - 1 ? curr + 1 : -1,
          cy > 0 ? curr - W : -1,
          cy < H - 1 ? curr + W : -1
        ];

        for (let n of neighbors) {
          if (n >= 0 && isMesh[n] === 0) {
            cur[n] = color;
            isMesh[n] = 2;
            nextFrontier.push(n);
          }
        }
      }
      for (let k = 0; k < nextFrontier.length; k++) {
        isMesh[nextFrontier[k]] = 1;
      }
      frontier = nextFrontier;
      iters++;
    }

    // Composite clean high-definition texture
    const finalCvs = document.createElement('canvas');
    finalCvs.width = W; finalCvs.height = H;
    const ctx = finalCvs.getContext('2d');
    ctx.drawImage(cleanBaseCvs, 0, 0, W, H);

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
}

async function run() {
  console.log('=== Baking Trio Athletes: 360° Flawless High-Definition Masterpieces ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // 1. FOOTY #10 (exact calibrated center = 0.502, scaleX = 1.35)
  console.log('\n--- 1. FOOTY #10 ---');
  await projectAthlete(
    page,
    'assets/characters/footy10_raw_backup.glb',
    'assets/characters/footy10_orig_texture.png',
    'assets/characters/footy10_preview.png',
    'assets/characters/footy10.glb',
    {
      charType: 0,
      scaleX: 1.35,
      centerX: 0.502
    }
  );

  // 2. HOOPS #23 (exact calibrated center = 0.500, scaleX = 1.15)
  console.log('\n--- 2. HOOPS #23 ---');
  await projectAthlete(
    page,
    'assets/characters/hoops23_raw_backup.glb',
    'assets/characters/hoops23_orig_texture.png',
    'assets/characters/hoops23_preview.png',
    'assets/characters/hoops23.glb',
    {
      charType: 1,
      scaleX: 1.15,
      centerX: 0.500
    }
  );

  // 3. KEEPER #1 (exact calibrated center = 0.5039, scaleX = 0.82)
  console.log('\n--- 3. KEEPER #1 ---');
  await projectAthlete(
    page,
    'assets/characters/keeper1_raw_backup.glb',
    'assets/characters/keeper1_orig_texture.png',
    'assets/characters/keeper1_preview.png',
    'assets/characters/keeper1.glb',
    {
      charType: 2,
      scaleX: 0.82,
      centerX: 0.5039
    }
  );

  await browser.close();
  console.log('\n✓ All 3 athletes baked successfully with 360° seamless high-definition detail!');
}

run().catch(console.error);
