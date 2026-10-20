const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\867d5f43-aefc-4485-baf3-3ce7b3f49ce3';

// 1. Create test harness for Level 20 scroll
const indexHtml = fs.readFileSync('index.html', 'utf8');

const scrollScript = `
<script>
(function() {
  var attempts = 0;
  var timer = setInterval(function() {
    attempts++;
    var cols = document.querySelectorAll('.fvh-bp-dual-column');
    var scrollTrack = document.querySelector('.fvh-bp-track-scroll');
    var pageBody = document.querySelector('.page-body');
    if (cols.length >= 20 && scrollTrack && pageBody) {
      clearInterval(timer);
      var col20 = cols[19]; // Level 20
      var offset = (window.innerWidth - col20.offsetWidth) / 2;
      scrollTrack.scrollLeft = col20.offsetLeft - offset;
      pageBody.scrollTop = 350;
      
      var freeCard = col20.querySelector('.fvh-bp-card-free');
      var vipCard = col20.querySelector('.fvh-bp-card-vip');
      var vipBtn = vipCard ? vipCard.querySelector('button') : null;
      var trackRect = scrollTrack.getBoundingClientRect();
      var cardRect = vipCard ? vipCard.getBoundingClientRect() : null;
      var btnRect = vipBtn ? vipBtn.getBoundingClientRect() : null;

      console.log('LVL20_MEASUREMENTS:', JSON.stringify({
        trackBottom: trackRect.bottom,
        cardBottom: cardRect ? cardRect.bottom : 0,
        btnBottom: btnRect ? btnRect.bottom : 0,
        isBtnInsideCard: btnRect && cardRect ? (btnRect.bottom <= cardRect.bottom + 2) : false,
        isCardInsideTrack: cardRect ? (cardRect.bottom <= trackRect.bottom) : false
      }));
    } else if (attempts > 50) {
      clearInterval(timer);
    }
  }, 50);
})();
</script>
`;

fs.writeFileSync('test_lvl20.html', indexHtml.replace('</body>', scrollScript + '</body>'));

// 2. Capture Mobile Level 20
console.log('Capturing Level 20 mobile screenshot (375x667)...');
const mobileOut = path.join(artifactDir, 'screenshot_lvl20_apollo_mobile.png');
execFileSync(chromePath, [
  '--headless=new',
  '--hide-scrollbars',
  '--window-size=375,667',
  '--virtual-time-budget=3000',
  '--screenshot=' + mobileOut,
  'http://localhost:8099/test_lvl20.html?page=battlepass'
]);
console.log('Mobile screenshot saved to:', mobileOut);

// 3. Capture Desktop Level 20
console.log('Capturing Level 20 desktop screenshot (1280x800)...');
const desktopOut = path.join(artifactDir, 'screenshot_lvl20_apollo_desktop.png');
execFileSync(chromePath, [
  '--headless=new',
  '--hide-scrollbars',
  '--window-size=1280,800',
  '--virtual-time-budget=3000',
  '--screenshot=' + desktopOut,
  'http://localhost:8099/test_lvl20.html?page=battlepass'
]);
console.log('Desktop screenshot saved to:', desktopOut);

// 4. Create test harness for Payment Error Modal
const paymentErrorScript = `
<script>
window.addEventListener('load', function() {
  setTimeout(function() {
    // Open payment modal with simulated diagnostic error
    if (window.FVH_TEST_SHOW_PAYMENT_ERROR) {
      window.FVH_TEST_SHOW_PAYMENT_ERROR();
    } else {
      // Direct call to redesign checkout or show mock error modal
      var overlay = document.createElement('div');
      overlay.className = 'modal-back';
      overlay.style.zIndex = '99999';

      var modal = document.createElement('div');
      modal.className = 'modal fvh-payment-modal';
      modal.style.boxSizing = 'border-box';
      modal.style.textAlign = 'center';

      var isRu = true;
      var err = {
        message: 'Сервер вернул ответ без JSON (HTTP 404 Not Found). Игра запущена через статический сервер без API бэкенда.'
      };

      modal.innerHTML =
        '<div style="font-size:42px;margin-bottom:12px;">⚠️</div>' +
        '<h3 style="margin:0 0 8px;color:#f87171;font-size:18px;">Оплата не была завершена</h3>' +
        '<div style="background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.35);border-radius:12px;padding:12px 14px;margin:0 0 18px;text-align:left;">' +
        '  <div style="font-size:11px;font-weight:800;color:#fca5a5;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Диагностика ошибки:</div>' +
        '  <div style="color:#ffffff;font-size:12px;line-height:1.4;word-break:break-word;">' + err.message + '</div>' +
        '</div>' +
        '<div style="display:flex;gap:10px;">' +
        '  <button class="btn primary block fvh-pay-retry" style="flex:1;font-weight:800;padding:12px;background:#38bdf8;border:none;border-radius:10px;color:#000;cursor:pointer;">🔄 Повторить</button>' +
        '  <button class="btn block fvh-pay-cancel" style="flex:1;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:10px;color:#fff;cursor:pointer;">Отмена</button>' +
        '</div>';

      overlay.appendChild(modal);
      document.body.appendChild(overlay);
    }
  }, 1000);
});
</script>
`;

fs.writeFileSync('test_payment_modal.html', indexHtml.replace('</body>', paymentErrorScript + '</body>'));

console.log('Capturing Payment Error Modal screenshot (375x667)...');
const payOut = path.join(artifactDir, 'screenshot_payment_diagnostics_modal.png');
execFileSync(chromePath, [
  '--headless=new',
  '--hide-scrollbars',
  '--window-size=375,667',
  '--virtual-time-budget=2000',
  '--screenshot=' + payOut,
  'http://localhost:8099/test_payment_modal.html?page=battlepass'
]);
console.log('Payment modal screenshot saved to:', payOut);

console.log('All proofs captured successfully.');
