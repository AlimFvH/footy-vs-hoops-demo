const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

const targets = [
  {
    name: 'prompt5_quickmatch_searching_desktop.png',
    url: 'http://localhost:8099/index.html?page=mode&quicksearch=1',
    size: '1280,800',
    delay: 2000
  },
  {
    name: 'prompt5_quickmatch_searching_mobile.png',
    url: 'http://localhost:8099/index.html?page=mode&quicksearch=1',
    size: '375,667',
    delay: 2000
  },
  {
    name: 'prompt5_privateroom_create_desktop.png',
    url: 'http://localhost:8099/index.html?page=mode&privateroom=1',
    size: '1280,800',
    delay: 2000
  },
  {
    name: 'prompt5_privateroom_create_mobile.png',
    url: 'http://localhost:8099/index.html?page=mode&privateroom=1',
    size: '375,667',
    delay: 2000
  },
  {
    name: 'prompt5_privateroom_join_desktop.png',
    url: 'http://localhost:8099/index.html?page=mode&joinroom=1&room=FVH-K8M2',
    size: '1280,800',
    delay: 2000
  },
  {
    name: 'prompt5_privateroom_join_mobile.png',
    url: 'http://localhost:8099/index.html?page=mode&joinroom=1&room=FVH-K8M2',
    size: '375,667',
    delay: 2000
  }
];

console.log('Capturing Prompt 5 Multiplayer Screenshots...');

targets.forEach(t => {
  const outPath = path.join(artifactDir, t.name);
  console.log(`Capturing ${t.name} (${t.size})...`);
  try {
    execFileSync(chromePath, [
      '--headless=new',
      `--screenshot=${outPath}`,
      `--window-size=${t.size}`,
      '--hide-scrollbars',
      `--virtual-time-budget=${t.delay}`,
      t.url
    ]);
    if (fs.existsSync(outPath)) {
      console.log(`✓ Saved ${t.name} (${fs.statSync(outPath).size} bytes)`);
    } else {
      console.error(`✗ File not created: ${outPath}`);
    }
  } catch (err) {
    console.error(`Error capturing ${t.name}:`, err.message);
  }
});

console.log('Finished capturing screenshots.');
