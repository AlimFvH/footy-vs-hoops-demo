const fs = require('fs');
const filePath = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3/.system_generated/logs/transcript.jsonl';
const stat = fs.statSync(filePath);
const size = stat.size;
const bytesToRead = Math.min(size, 80000);
const buffer = Buffer.alloc(bytesToRead);
const fd = fs.openSync(filePath, 'r');
fs.readSync(fd, buffer, 0, bytesToRead, size - bytesToRead);
fs.closeSync(fd);

const text = buffer.toString('utf8');
const lines = text.split('\n').filter(Boolean);
for (const line of lines.slice(-10)) {
  try {
    const obj = JSON.parse(line);
    console.log('--- TYPE:', obj.type, 'SOURCE:', obj.source);
    if (obj.content) console.log('CONTENT:', obj.content.slice(0, 300));
  } catch(e) {}
}
