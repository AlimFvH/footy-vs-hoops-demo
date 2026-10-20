const fs = require('fs');
const path = require('path');

const cssPath = path.resolve('css/redesign.css');
let css = fs.readFileSync(cssPath, 'utf8');

const universalCoinCss = `
/* ==========================================================================
   Universal FvH Coin Styling (Half Green, Half Orange)
   ========================================================================== */
.w-ico, .wc-ico, .fvh-coin-ico {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 0 !important;
  line-height: 0 !important;
  color: transparent !important;
  width: 20px !important;
  height: 20px !important;
  flex-shrink: 0 !important;
  vertical-align: middle !important;
  background-image: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3CclipPath id='c'%3E%3Ccircle cx='12' cy='12' r='8.2'/%3E%3C/clipPath%3E%3C/defs%3E%3Ccircle cx='12' cy='12.8' r='10.5' fill='%23381402'/%3E%3Ccircle cx='12' cy='12' r='10.5' fill='%23fde047' stroke='%23ca8a04' stroke-width='1'/%3E%3Ccircle cx='12' cy='12' r='8.2' fill='%231e293b'/%3E%3Cg clip-path='url(%23c)'%3E%3Crect x='3.5' y='3.5' width='8.5' height='17' fill='%2310b981'/%3E%3Crect x='12' y='3.5' width='8.5' height='17' fill='%23f97316'/%3E%3Cline x1='12' y1='3.5' x2='12' y2='20.5' stroke='%23fef08a' stroke-width='0.9'/%3E%3C/g%3E%3Ctext x='12' y='15.2' font-family='Impact, Arial Black, sans-serif' font-size='8.4' font-weight='900' fill='%23000000' text-anchor='middle'%3EFvH%3C/text%3E%3Ctext x='12' y='14.5' font-family='Impact, Arial Black, sans-serif' font-size='8.4' font-weight='900' fill='%23ffffff' text-anchor='middle'%3EFvH%3C/text%3E%3Ccircle cx='6' cy='6' r='1.3' fill='%23ffffff' opacity='0.95'/%3E%3C/svg%3E") !important;
  background-repeat: no-repeat !important;
  background-position: center !important;
  background-size: contain !important;
}

.wc-ico {
  width: 32px !important;
  height: 32px !important;
}

.fvh-card-thumb-wrap .fvh-coin-large {
  width: 72px;
  height: 72px;
}
`;

css += '\n' + universalCoinCss;
fs.writeFileSync(cssPath, css);
console.log('Appended universal coin CSS to css/redesign.css!');
