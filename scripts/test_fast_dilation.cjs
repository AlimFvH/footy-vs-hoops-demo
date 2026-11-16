const W = 2048, H = 2048;
const isMesh = new Uint8Array(W * H);
const cur = new Uint32Array(W * H);

// Put some islands
for (let y = 100; y < 1900; y++) {
  for (let x = 100; x < 1900; x++) {
    if ((x % 300 < 250) && (y % 300 < 250)) {
      isMesh[y * W + x] = 1;
      cur[y * W + x] = 0xff00ff00;
    }
  }
}

const t0 = Date.now();
// BFS / Multi-pass dilation
let frontier = [];
for (let i = 0; i < W * H; i++) {
  if (isMesh[i] === 1) {
    const x = i % W, y = Math.floor(i / W);
    if (x > 0 && isMesh[i - 1] === 0) frontier.push(i - 1);
    else if (x < W - 1 && isMesh[i + 1] === 0) frontier.push(i + 1);
    else if (y > 0 && isMesh[i - W] === 0) frontier.push(i - W);
    else if (y < H - 1 && isMesh[i + W] === 0) frontier.push(i + W);
  }
}

console.log('Initial frontier size:', frontier.length);
let iters = 0;
while (frontier.length > 0 && iters < 64) {
  const nextFrontier = [];
  for (let k = 0; k < frontier.length; k++) {
    const idx = frontier[k];
    if (isMesh[idx] !== 0) continue;
    const x = idx % W, y = Math.floor(idx / W);
    let color = 0;
    if (x > 0 && isMesh[idx - 1] === 1) color = cur[idx - 1];
    else if (x < W - 1 && isMesh[idx + 1] === 1) color = cur[idx + 1];
    else if (y > 0 && isMesh[idx - W] === 1) color = cur[idx - W];
    else if (y < H - 1 && isMesh[idx + W] === 1) color = cur[idx + W];

    if (color !== 0) {
      cur[idx] = color;
      isMesh[idx] = 2;
      if (x > 0 && isMesh[idx - 1] === 0) nextFrontier.push(idx - 1);
      if (x < W - 1 && isMesh[idx + 1] === 0) nextFrontier.push(idx + 1);
      if (y > 0 && isMesh[idx - W] === 0) nextFrontier.push(idx - W);
      if (y < H - 1 && isMesh[idx + W] === 0) nextFrontier.push(idx + W);
    }
  }
  for (let k = 0; k < frontier.length; k++) {
    if (isMesh[frontier[k]] === 2) isMesh[frontier[k]] = 1;
  }
  frontier = nextFrontier;
  iters++;
}

console.log(`Finished ${iters} iterations in ${Date.now() - t0} ms!`);
