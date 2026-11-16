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

    // Clean up base texture
    const cleanBaseCvs = document.createElement('canvas');
    cleanBaseCvs.width = W; cleanBaseCvs.height = H;
    const cbCtx = cleanBaseCvs.getContext('2d');
    cbCtx.drawImage(baseImg, 0, 0, W, H);
    const cbData = cbCtx.getImageData(0, 0, W, H);
    const cb = cbData.data;

    // Harmonize skin and base colors
    for (let i = 0; i < W * H; i++) {
      const r = cb[i*4], g = cb[i*4+1], b = cb[i*4+2];
      if (config.charType === 1) { // Hoops: suppress Trellis grey/white blotches on head
        const lum = r * 0.299 + g * 0.587 + b * 0.114;
        const isGold = (r > 150 && g > 110 && b < 65);
        if (lum > 75.0 && !isGold) {
          cb[i*4] = 90; cb[i*4+1] = 56; cb[i*4+2] = 37;
        }
      }
    }
    cbCtx.putImageData(cbData, 0, 0);

    const previewImg = new Image();
    await new Promise(r => { previewImg.onload = r; previewImg.src = (previewB64.startsWith('/9j/') ? 'data:image/jpeg;base64,' : 'data:image/png;base64,') + previewB64; });

    // WebGL canvas for direct 3D unrolling in UV space
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

      // Perfectly Proportioned Anatomical Piecewise Mapping
      float mapPiecewiseY(float y, int charType) {
        if (charType == 0) { // FOOTY
          if (y >= 0.422) return mix(0.1667, 0.0833, (y - 0.422) / (0.500 - 0.422)); // Hair -> Eyes
          if (y >= 0.395) return mix(0.1875, 0.1667, (y - 0.395) / (0.422 - 0.395)); // Eyes -> Nose tip
          if (y >= 0.360) return mix(0.2083, 0.1875, (y - 0.360) / (0.395 - 0.360)); // Nose -> Smile
          if (y >= 0.335) return mix(0.2292, 0.2083, (y - 0.335) / (0.360 - 0.335)); // Smile -> Chin tip
          if (y >= 0.270) return mix(0.2708, 0.2292, (y - 0.270) / (0.335 - 0.270)); // Chin -> Collar
          if (y >= 0.240) return mix(0.3073, 0.2708, (y - 0.240) / (0.270 - 0.240)); // Collar -> FOOTY text
          if (y >= 0.180) return mix(0.3490, 0.3073, (y - 0.180) / (0.240 - 0.180)); // FOOTY text
          if (y >= 0.080) return mix(0.4219, 0.3490, (y - 0.080) / (0.180 - 0.080)); // #10 number
          if (y >= 0.020) return mix(0.5312, 0.4219, (y - 0.020) / (0.080 - 0.020)); // Waistband
          if (y >= -0.190) return mix(0.6562, 0.5312, (y - (-0.190)) / (0.020 - (-0.190))); // Shorts
          return mix(0.9635, 0.6562, (y - (-0.495)) / (-0.190 - (-0.495))); // Legs & Cleats
        } else if (charType == 1) { // HOOPS
          if (y >= 0.420) return mix(0.1562, 0.0812, (y - 0.420) / (0.500 - 0.420)); // Hair -> Eyes
          if (y >= 0.392) return mix(0.1875, 0.1562, (y - 0.392) / (0.420 - 0.392)); // Eyes -> Nose tip
          if (y >= 0.360) return mix(0.2083, 0.1875, (y - 0.360) / (0.392 - 0.360)); // Nose -> Smile
          if (y >= 0.335) return mix(0.2396, 0.2083, (y - 0.335) / (0.360 - 0.335)); // Smile -> Beard/Chin
          if (y >= 0.270) return mix(0.2812, 0.2396, (y - 0.270) / (0.335 - 0.270)); // Chin -> Gold V-Neck
          if (y >= 0.240) return mix(0.3073, 0.2812, (y - 0.240) / (0.270 - 0.240)); // Collar -> HOOPS text
          if (y >= 0.180) return mix(0.3542, 0.3073, (y - 0.180) / (0.240 - 0.180)); // HOOPS text
          if (y >= 0.080) return mix(0.4323, 0.3542, (y - 0.080) / (0.180 - 0.080)); // #23 number
          if (y >= 0.020) return mix(0.4688, 0.4323, (y - 0.020) / (0.080 - 0.020)); // Waistband
          if (y >= -0.180) return mix(0.6771, 0.4688, (y - (-0.180)) / (0.020 - (-0.180))); // Shorts
          return mix(0.9635, 0.6771, (y - (-0.495)) / (-0.180 - (-0.495))); // Sneakers
        } else { // KEEPER
          if (y >= 0.430) return mix(0.1167, 0.0667, (y - 0.430) / (0.490 - 0.430)); // Buzzcut -> Brow
          if (y >= 0.408) return mix(0.1400, 0.1167, (y - 0.408) / (0.430 - 0.408)); // Brow -> Nose tip
          if (y >= 0.365) return mix(0.1625, 0.1400, (y - 0.365) / (0.408 - 0.365)); // Nose -> Lips
          if (y >= 0.345) return mix(0.1833, 0.1625, (y - 0.345) / (0.365 - 0.345)); // Lips -> Heavy Chin
          if (y >= 0.280) return mix(0.2292, 0.1833, (y - 0.280) / (0.345 - 0.280)); // Chin -> Collar
          if (y >= 0.240) return mix(0.2708, 0.2292, (y - 0.240) / (0.280 - 0.240)); // Collar -> Chest
          if (y >= 0.080) return mix(0.3792, 0.2708, (y - 0.080) / (0.240 - 0.080)); // #1 Chest Number
          if (y >= 0.010) return mix(0.4458, 0.3792, (y - 0.010) / (0.080 - 0.010)); // Belt
          if (y >= -0.150) return mix(0.5208, 0.4458, (y - (-0.150)) / (0.010 - (-0.150))); // Shorts
          return mix(0.7208, 0.5208, (y - (-0.495)) / (-0.150 - (-0.495))); // Boots
        }
      }

      void main() {
        vec4 baseCol = texture(uBaseTex, vUV);
        vec3 N = normalize(vNormal);

        bool isFront = (vPos.z > -0.015 && N.z > -0.30);

        // Project front-facing vertices into preview image
        vec2 projUV;
        projUV.x = uCenterX + vPos.x * uScaleX;
        projUV.y = mapPiecewiseY(vPos.y, uCharType);

        vec2 sampleUV = projUV;
        vec4 previewCol = vec4(0.0);
        bool validSample = false;

        if (sampleUV.x >= 0.0 && sampleUV.x <= 1.0 && sampleUV.y >= 0.0 && sampleUV.y <= 1.0) {
          previewCol = texture(uPreviewTex, sampleUV);

          if (uCharType == 0 || uCharType == 1) {
            if (previewCol.a > 0.08) {
              validSample = true;
            }
          } else {
            // Keeper: on head, face, neck and chest (sampleUV.y < 0.38, x in [0.20, 0.80]), it is 100% character
            if (sampleUV.y < 0.38 && sampleUV.x >= 0.20 && sampleUV.x <= 0.80) {
              validSample = true;
            } else {
              bool isBg = (sampleUV.x < 0.10 || sampleUV.x > 0.90 || (previewCol.r < 0.07 && previewCol.g < 0.13 && previewCol.b < 0.09));
              if (!isBg && sampleUV.y < 0.86) {
                validSample = true;
              }
            }
          }
        }

        // Seamless normal and depth weighting
        float depthWeight = smoothstep(-0.060, -0.010, vPos.z);
        float normalWeight = smoothstep(-0.35, 0.05, N.z);

        // Enforce 100% full coverage on front face and front body
        if (vPos.y >= 0.30 && vPos.z > -0.035) {
          depthWeight = 1.0;
          normalWeight = 1.0;
        } else if (isFront && vPos.y >= 0.02) {
          depthWeight = 1.0;
          normalWeight = 1.0;
        }

        float blend = (validSample ? 1.0 : 0.0) * depthWeight * normalWeight;

        // Front / Base blend
        vec3 finalRGB = mix(baseCol.rgb, previewCol.rgb, blend);

        // Prevent Trapezius / Back Shoulders (vPos.z < 0) from picking up front projection
        if (vPos.z < -0.010 && vPos.y > 0.24 && vPos.y < 0.38) {
          finalRGB = baseCol.rgb;
        }

        // Crisp Clean Uniform Back (High-definition athletic typography)
        if (vPos.z < -0.015 && N.z < -0.25 && vPos.y > 0.02 && vPos.y < 0.28) {
          if (uCharType == 0) { // Footy: Turquoise jersey with Navy #10
            vec3 backJersey = vec3(0.0, 0.77, 0.89);
            vec3 numColor = vec3(0.06, 0.09, 0.16); // Navy 10
            bool isNum = false;
            if (vPos.x > -0.055 && vPos.x < -0.025 && vPos.y > 0.11 && vPos.y < 0.21) isNum = true;
            if (vPos.x > 0.015 && vPos.x < 0.065 && vPos.y > 0.11 && vPos.y < 0.21) {
              if (vPos.x < 0.030 || vPos.x > 0.050 || vPos.y < 0.135 || vPos.y > 0.185) isNum = true;
            }
            finalRGB = isNum ? numColor : backJersey;
          } else if (uCharType == 1) { // Hoops: Carbon Black jersey with Gold #23
            vec3 backJersey = vec3(0.07, 0.07, 0.09);
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
            finalRGB = isNum ? goldNum : backJersey;
          } else if (uCharType == 2) { // Keeper: Vibrant Neon Green jersey with White #1
            vec3 backJersey = vec3(0.0, 0.90, 0.46);
            vec3 whiteNum = vec3(0.96, 0.98, 1.0);
            bool isNum = false;
            if (vPos.x > -0.025 && vPos.x < 0.025 && vPos.y > 0.09 && vPos.y < 0.23) isNum = true;
            if (vPos.x > -0.055 && vPos.x <= -0.025 && vPos.y > 0.19 && vPos.y < 0.22) isNum = true;
            if (vPos.x > -0.06 && vPos.x < 0.06 && vPos.y > 0.09 && vPos.y < 0.115) isNum = true;
            finalRGB = isNum ? whiteNum : backJersey;
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
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cleanBaseCvs);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const t1 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, t1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, previewImg);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.viewport(0, 0, W, H);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
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

    // Composite over base texture
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
  console.log('=== Baking Trio Masterpiece Athletes (Flawless Proportional Mapping) ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 2048, height: 2048 });

  // 1. FOOTY #10
  console.log('\n--- 1. FOOTY #10 ---');
  await projectAthlete(
    page,
    'assets/characters/footy10_raw_backup.glb',
    'assets/characters/footy10_orig_texture.png',
    'assets/characters/footy10_preview.png',
    'assets/characters/footy10.glb',
    {
      charType: 0,
      scaleX: 1.25,
      centerX: 0.50
    }
  );

  // 2. HOOPS #23
  console.log('\n--- 2. HOOPS #23 ---');
  await projectAthlete(
    page,
    'assets/characters/hoops23_raw_backup.glb',
    'assets/characters/hoops23_orig_texture.png',
    'assets/characters/hoops23_preview.png',
    'assets/characters/hoops23.glb',
    {
      charType: 1,
      scaleX: 1.22,
      centerX: 0.50
    }
  );

  // 3. KEEPER #1
  console.log('\n--- 3. KEEPER #1 ---');
  await projectAthlete(
    page,
    'assets/characters/keeper1_raw_backup.glb',
    'assets/characters/keeper1_orig_texture.png',
    'assets/characters/keeper1_preview.png',
    'assets/characters/keeper1.glb',
    {
      charType: 2,
      scaleX: 1.14,
      centerX: 451.5 / 896.0
    }
  );

  await browser.close();
  console.log('\nAll 3 athletes baked successfully with flawless proportions!');
}

run().catch(console.error);
