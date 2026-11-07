const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const artifactDir = 'C:/Users/ASUS/.gemini/antigravity/brain/867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

async function composite() {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  // 1. Basketball Side-by-Side Dual Screenshot
  const hoopsB64_1 = fs.readFileSync(path.join(artifactDir, 'match_hoops_gameplay_dribble.png')).toString('base64');
  const hoopsB64_2 = fs.readFileSync(path.join(artifactDir, 'match_hoops_slam_dunk.png')).toString('base64');
  
  await page.setViewport({ width: 864, height: 932 });
  await page.setContent(`
    <body style="margin:0; background:#000; display:flex; flex-direction:row; width:864px; height:932px; overflow:hidden;">
      <img src="data:image/png;base64,${hoopsB64_1}" style="width:432px; height:932px; object-fit:cover; border-right:2px solid #00f0ff;" />
      <img src="data:image/png;base64,${hoopsB64_2}" style="width:432px; height:932px; object-fit:cover; border-left:2px solid #ff2bd6;" />
    </body>
  `);
  await new Promise(r => setTimeout(r, 400));
  const hoopsDualPath = path.join(artifactDir, 'in_match_fortnite_basketball_court.png');
  await page.screenshot({ path: hoopsDualPath });
  console.log('✓ Created in_match_fortnite_basketball_court.png -> size:', fs.statSync(hoopsDualPath).size);

  // 2. Football Side-by-Side Dual Screenshot
  const footyB64_1 = fs.readFileSync(path.join(artifactDir, 'match_footy_gameplay_action.png')).toString('base64');
  const footyB64_2 = fs.readFileSync(path.join(artifactDir, 'match_footy_shot_on_goal.png')).toString('base64');

  await page.setContent(`
    <body style="margin:0; background:#000; display:flex; flex-direction:row; width:864px; height:932px; overflow:hidden;">
      <img src="data:image/png;base64,${footyB64_1}" style="width:432px; height:932px; object-fit:cover; border-right:2px solid #10b981;" />
      <img src="data:image/png;base64,${footyB64_2}" style="width:432px; height:932px; object-fit:cover; border-left:2px solid #00f0ff;" />
    </body>
  `);
  await new Promise(r => setTimeout(r, 400));
  const footyDualPath = path.join(artifactDir, 'in_match_fortnite_football_pitch.png');
  await page.screenshot({ path: footyDualPath });
  console.log('✓ Created in_match_fortnite_football_pitch.png -> size:', fs.statSync(footyDualPath).size);

  await browser.close();
}
composite().catch(console.error);
