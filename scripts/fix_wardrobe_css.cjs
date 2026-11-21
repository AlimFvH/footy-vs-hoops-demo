const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'css', 'redesign.css');
let css = fs.readFileSync(cssPath, 'utf8');

const fixCss = `
/* Additional Wardrobe & Hero Refinements */
.fvh-wardrobe-grid > .fvh-wardrobe-preview,
.fvh-wardrobe-grid > div.fvh-wardrobe-preview,
.fvh-wardrobe-preview {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.fvh-hero-open-viewport .fvh-hero-real-img {
  max-height: 86% !important;
  margin-top: 6px !important;
}

.fvh-wardrobe-avatar .fvh-hero-real-img {
  max-height: 250px !important;
}

.fvh-wardrobe-avatar {
  height: clamp(260px, 36vh, 320px) !important;
  position: relative !important;
}

.fvh-wardrobe-avatar::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 190px;
  height: 26px;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(0, 245, 155, 0.4) 0%, rgba(0, 245, 155, 0.1) 50%, transparent 70%);
  border: 1.5px solid rgba(0, 245, 155, 0.65);
  box-shadow: 0 0 26px rgba(0, 245, 155, 0.45);
  pointer-events: none;
}
`;

css += '\n' + fixCss + '\n';
fs.writeFileSync(cssPath, css, 'utf8');
console.log('Applied wardrobe container border fix and hero sizing to redesign.css');
