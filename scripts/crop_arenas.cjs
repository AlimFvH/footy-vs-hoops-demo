const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const artifactDir = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function crop() {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const imgUrl = 'file:///' + artifactDir.replace(/\\/g, '/') + '/fortnite_footy_vs_hoops_arenas_1794090077228.jpg';
  
  await page.goto(imgUrl);
  
  const dims = await page.evaluate(() => {
    const img = document.querySelector('img');
    return { w: img.naturalWidth, h: img.naturalHeight };
  });
  console.log('Original dimensions:', dims);
  
  // Crop Left Panel (Footy Neo Stadium)
  const leftData = await page.evaluate(() => {
    const img = document.querySelector('img');
    const c = document.createElement('canvas');
    const halfW = Math.floor(img.naturalWidth / 2);
    c.width = halfW;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0, halfW, img.naturalHeight, 0, 0, halfW, img.naturalHeight);
    return c.toDataURL('image/jpeg', 0.95);
  });
  fs.writeFileSync(path.join(artifactDir, 'fortnite_arena_footy_neo_turf.jpg'), Buffer.from(leftData.split(',')[1], 'base64'));
  console.log('Saved Footy Neo Turf card');

  // Crop Right Panel (Hoops Cyber Arena)
  const rightData = await page.evaluate(() => {
    const img = document.querySelector('img');
    const c = document.createElement('canvas');
    const halfW = Math.floor(img.naturalWidth / 2);
    c.width = img.naturalWidth - halfW;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, halfW, 0, c.width, img.naturalHeight, 0, 0, c.width, img.naturalHeight);
    return c.toDataURL('image/jpeg', 0.95);
  });
  fs.writeFileSync(path.join(artifactDir, 'fortnite_arena_hoops_cyber_hardwood.jpg'), Buffer.from(rightData.split(',')[1], 'base64'));
  console.log('Saved Hoops Cyber Arena card');

  await browser.close();
}
crop().catch(console.error);
