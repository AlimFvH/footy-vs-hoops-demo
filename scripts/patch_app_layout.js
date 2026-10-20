const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'css', 'redesign.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Update Root & Base Atmosphere (lines 50-75)
const rootTarget = `  --neon-magenta: #f43f5e;
  --sat: env(safe-area-inset-top, 0px);
  --sar: env(safe-area-inset-right, 0px);
  --sab: env(safe-area-inset-bottom, 0px);
  --sal: env(safe-area-inset-left, 0px);
}

/* Overall Screen Atmosphere */
.screen.menu-bg {
  background: var(--bg-stadium) !important;
  color: var(--text-main);
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow-y: auto;
  overflow-x: hidden;
  padding: calc(var(--sat) + 10px) calc(var(--sar) + 12px) calc(var(--sab) + 74px) calc(var(--sal) + 12px);
}`;

const rootReplacement = `  --neon-magenta: #f43f5e;
  --sat: env(safe-area-inset-top, 0px);
  --sar: env(safe-area-inset-right, 0px);
  --sab: env(safe-area-inset-bottom, 0px);
  --sal: env(safe-area-inset-left, 0px);
  --tg-safe-top: var(--tg-content-top, var(--tg-safe-top, 0px));
  --tg-safe-bottom: var(--tg-content-bottom, var(--tg-safe-bottom, 0px));
  --safe-top: max(var(--sat), var(--tg-safe-top), 0px);
  --safe-bottom: max(var(--sab), var(--tg-safe-bottom), 0px);
}

html.is-telegram {
  --safe-top: max(var(--sat), var(--tg-content-top, 0px), 48px);
}

/* Overall Screen Atmosphere */
.screen.menu-bg {
  background: var(--bg-stadium) !important;
  color: var(--text-main);
  position: absolute;
  inset: 0;
  width: 100% !important;
  max-width: 100% !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  padding: calc(var(--safe-top) + 10px) calc(var(--sar) + 12px) calc(var(--safe-bottom) + 74px) calc(var(--sal) + 12px);
}`;

if (!css.includes(rootTarget)) {
  throw new Error('rootTarget not found in redesign.css');
}
css = css.replace(rootTarget, rootReplacement);

// 2. Mobile Media Query for Menu (lines 570-665)
const menuMqStart = '@media (max-width: 600px) {';
const menuMqEnd = '/* ==========================================================================\n   Battle Pass Page (30-Level Linear Progression Track)';

const idxStart = css.indexOf(menuMqStart);
const idxEnd = css.indexOf(menuMqEnd);

if (idxStart === -1 || idxEnd === -1) {
  throw new Error('menuMq indices not found in redesign.css');
}

const menuMqReplacement = `@media (max-width: 640px) {
  html.is-telegram .screen.menu-bg {
    padding-top: calc(max(var(--sat), 44px) + 12px) !important;
  }
  html.is-telegram .screen.page-screen {
    padding-top: calc(max(var(--sat), 44px) + 12px) !important;
  }
  .screen.menu-bg {
    width: 100% !important;
    max-width: 100% !important;
    overflow-x: hidden !important;
    box-sizing: border-box !important;
    padding: calc(var(--safe-top) + 8px) 10px calc(var(--safe-bottom) + 74px) 10px !important;
  }
  .fvh-topbar {
    width: 100% !important;
    max-width: 100% !important;
    padding: 6px 10px !important;
    gap: 6px !important;
    margin-bottom: 8px !important;
    box-sizing: border-box !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
  }
  .fvh-topbar-brand {
    gap: 6px !important;
    flex-shrink: 0 !important;
  }
  .fvh-topbar-brand img.emblem {
    width: 26px !important;
    height: 26px !important;
    min-width: 26px !important;
  }
  .fvh-topbar-brand .logo-text {
    font-size: 13px !important;
    letter-spacing: 0.4px !important;
    white-space: nowrap !important;
  }
  .fvh-topbar-stats {
    gap: 4px !important;
    flex-shrink: 0 !important;
    display: flex !important;
    align-items: center !important;
  }
  .fvh-pill {
    padding: 4px 7px !important;
    font-size: 10.5px !important;
    gap: 3px !important;
    border-radius: 999px !important;
    white-space: nowrap !important;
    box-sizing: border-box !important;
  }
  .fvh-pill.icon-only {
    width: 28px !important;
    height: 28px !important;
    min-width: 28px !important;
    padding: 0 !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 14px !important;
  }
  .fvh-hero-stage {
    grid-template-columns: 1fr 1fr !important;
    gap: 8px !important;
    max-width: 100% !important;
    width: 100% !important;
    margin-bottom: 8px !important;
    box-sizing: border-box !important;
  }
  .fvh-hero-card {
    padding: 8px 4px !important;
    border-radius: 14px !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
  }
  .fvh-hero-badge {
    font-size: 8.5px !important;
    padding: 2px 5px !important;
  }
  .fvh-hero-avatar-box {
    height: clamp(80px, 15vh, 125px) !important;
  }
  .fvh-hero-name {
    font-size: clamp(13px, 3.6vw, 16px) !important;
    margin: 4px 0 1px !important;
  }
  .fvh-hero-role {
    font-size: clamp(8.5px, 2.2vw, 10.5px) !important;
  }
  .fvh-vs-middle {
    width: 28px !important;
    height: 28px !important;
    font-size: 10px !important;
  }
  .fvh-hero-gear-pill {
    font-size: 9px !important;
    padding: 3px 5px !important;
  }
  .fvh-action-deck {
    max-width: 100% !important;
    width: 100% !important;
    gap: 6px !important;
    margin-bottom: 8px !important;
    box-sizing: border-box !important;
  }
  .fvh-btn-play-hero {
    min-height: 48px !important;
    padding: 8px 12px !important;
    border-radius: 14px !important;
    box-sizing: border-box !important;
  }
  .fvh-btn-play-hero .play-text {
    font-size: 18px !important;
  }
  .fvh-btn-play-hero .play-sub {
    font-size: 9.5px !important;
  }
  .fvh-sub-actions {
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 4px !important;
    width: 100% !important;
  }
  .fvh-sub-btn {
    padding: 7px 2px !important;
    font-size: 9.5px !important;
    gap: 2px !important;
    border-radius: 8px !important;
    min-width: 0 !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
  }
  .fvh-sub-btn span:last-child {
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
  }
  .fvh-rivalry-ticker {
    max-width: 100% !important;
    width: 100% !important;
    padding: 6px 12px !important;
    font-size: 10.5px !important;
    box-sizing: border-box !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 6px !important;
  }
  .fvh-ticker-left {
    gap: 5px !important;
    font-size: 10.5px !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }
  .fvh-ticker-right {
    font-size: 10px !important;
    flex-shrink: 0 !important;
    white-space: nowrap !important;
  }
  .fvh-season-hub-card {
    width: 100% !important;
    max-width: 100% !important;
    padding: 10px 12px !important;
    gap: 10px !important;
    box-sizing: border-box !important;
  }
  .fvh-season-hub-left {
    min-width: 0 !important;
    flex: 1 !important;
  }
  .fvh-season-hub-tag {
    font-size: 9.5px !important;
  }
  .fvh-season-hub-title {
    font-size: 12px !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }
  .fvh-season-hub-btn {
    font-size: 11px !important;
    padding: 6px 10px !important;
    flex-shrink: 0 !important;
    min-height: 32px !important;
  }
}

`;

css = css.substring(0, idxStart) + menuMqReplacement + css.substring(idxEnd);

// 3. Page-screen and page-head rules (lines ~873-885)
const pageHeadTarget = `.screen.solid.page-screen {
  background: var(--bg-stadium) !important;
  color: var(--text-main) !important;
}

.screen.page-screen .page {
  max-width: 1040px;
}

.page-head h1 {
  font-weight: 900;
  letter-spacing: 0.8px;
  color: var(--text-pure);
}`;

const pageHeadReplacement = `.screen.solid.page-screen {
  background: var(--bg-stadium) !important;
  color: var(--text-main) !important;
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  padding: calc(var(--safe-top) + 8px) 12px calc(var(--safe-bottom) + 74px) 12px !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
}

.screen.page-screen .page {
  width: 100% !important;
  max-width: 1040px !important;
  margin: 0 auto !important;
  box-sizing: border-box !important;
  display: flex !important;
  flex-direction: column !important;
}

.page-head {
  width: 100% !important;
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  padding: 4px 0 10px 0 !important;
  box-sizing: border-box !important;
}

.page-head h1 {
  font-weight: 900 !important;
  letter-spacing: 0.6px !important;
  color: var(--text-pure) !important;
  font-size: clamp(20px, 5.2vw, 26px) !important;
  margin: 0 !important;
  flex: 1 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}`;

if (!css.includes(pageHeadTarget)) {
  throw new Error('pageHeadTarget not found in redesign.css');
}
css = css.replace(pageHeadTarget, pageHeadReplacement);

// 4. Item Detail Modal Rules (lines ~1290-1357)
const itemModalTarget = `/* Dedicated Item Inspector & Purchase Modal */
.fvh-item-modal {
  max-width: 400px !important;
  text-align: center;
  padding: 24px 20px !important;
}

.fvh-item-modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.modal-close-x {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.15s ease;
}

.modal-close-x:hover {
  color: var(--text-pure);
  background: rgba(255, 255, 255, 0.1);
}

.fvh-item-modal-preview {
  width: 100px;
  height: 100px;
  margin: 0 auto 16px;
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--panel-glass-border);
}

.fvh-item-modal-icon {
  font-size: 54px;
  line-height: 1;
}

.fvh-item-modal-title {
  font-size: 22px;
  font-weight: 900;
  margin: 0 0 4px;
  color: var(--text-pure);
}

.fvh-item-modal-category {
  font-size: 11px;
  letter-spacing: 1px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.fvh-item-modal-desc {
  font-size: 13px;
  color: var(--text-main);
  line-height: 1.4;
  margin: 0 0 20px;
}`;

const itemModalReplacement = `/* Dedicated Item Inspector & Purchase Modal */
.fvh-item-modal {
  max-width: 440px !important;
  text-align: center;
  padding: 16px 20px 24px 20px !important;
  box-sizing: border-box !important;
  width: 100% !important;
}

.fvh-item-modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  width: 100%;
  box-sizing: border-box;
}

.modal-close-x {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--text-muted);
  font-size: 16px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  box-sizing: border-box;
}

.modal-close-x:hover {
  color: var(--text-pure);
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.fvh-item-modal-preview {
  width: 110px;
  height: 110px;
  margin: 0 auto 14px;
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--panel-glass-border);
  box-sizing: border-box;
}

.fvh-item-modal-icon {
  font-size: 54px;
  line-height: 1;
}

.fvh-item-modal-title {
  font-size: 20px;
  font-weight: 900;
  margin: 0 0 4px;
  color: var(--text-pure);
  word-break: break-word;
  overflow-wrap: break-word;
}

.fvh-item-modal-category {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.8px;
  color: var(--neon-cyan);
  margin-bottom: 8px;
  text-transform: uppercase;
}

.fvh-item-modal-desc {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.4;
  margin: 0 0 18px;
  word-break: break-word;
  overflow-wrap: break-word;
}

.fvh-item-modal-actions {
  width: 100%;
  box-sizing: border-box;
}

.fvh-item-modal-actions .btn {
  width: 100% !important;
  min-height: 48px !important;
  font-size: 15px !important;
  font-weight: 900 !important;
  box-sizing: border-box !important;
}`;

if (!css.includes(itemModalTarget)) {
  throw new Error('itemModalTarget not found in redesign.css');
}
css = css.replace(itemModalTarget, itemModalReplacement);

// 5. Global Mobile Modals & Bottom Sheets Overhaul
const modalEndStart = '#ui {';
const modalEndEnd = '  /* Shop featured hero compact on mobile */';

const mIdxStart = css.indexOf(modalEndStart);
const mIdxEnd = css.indexOf(modalEndEnd);

if (mIdxStart === -1 || mIdxEnd === -1) {
  throw new Error('modalEnd indices not found in redesign.css');
}

const modalEndReplacement = `#ui {
  width: 100% !important;
  max-width: 100% !important;
  height: 100% !important;
  height: 100dvh !important;
  overflow: hidden !important;
  box-sizing: border-box !important;
}

.modal-back {
  position: fixed !important;
  inset: 0 !important;
  width: 100% !important;
  max-width: 100% !important;
  height: 100% !important;
  height: 100dvh !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 16px !important;
  box-sizing: border-box !important;
  z-index: 99999 !important;
  background: rgba(3, 7, 18, 0.75) !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
  overflow: hidden !important;
  animation: fadeIn 0.15s ease-out both !important;
}

.modal-back.fvh-sheet-back {
  background: rgba(3, 7, 18, 0.72) !important;
}

.fvh-sheet-handle {
  width: 42px;
  height: 4px;
  background: rgba(255, 255, 255, 0.28);
  border-radius: 999px;
  margin: 0 auto 14px auto;
  flex-shrink: 0;
}

.fvh-mm-radar-box.error .fvh-mm-radar-ring {
  animation: none !important;
  border-color: rgba(239, 68, 68, 0.45) !important;
}

.modal {
  box-sizing: border-box !important;
  margin: 0 auto !important;
  width: min(440px, 100%) !important;
  max-height: 90vh !important;
  max-height: 90dvh !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  background: linear-gradient(180deg, #101932 0%, #070c1a 100%) !important;
  border: 1.5px solid var(--panel-glass-border) !important;
  border-radius: 22px !important;
  color: var(--text-pure) !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(0, 240, 255, 0.2) !important;
}

.fvh-payment-modal,
.fvh-bundle-modal,
.fvh-item-modal,
.fvh-rivalry-modal {
  width: 100% !important;
  max-width: 440px !important;
  border-radius: 22px !important;
  padding: 18px 16px !important;
  box-sizing: border-box !important;
}

@media (max-width: 640px) {
  .modal-back {
    align-items: flex-end !important;
    justify-content: center !important;
    padding: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
  }
  .modal {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    border-radius: 26px 26px 0 0 !important;
    border: 1.5px solid var(--panel-glass-border) !important;
    border-bottom: none !important;
    padding: 14px 18px calc(20px + env(safe-area-inset-bottom, 16px)) 18px !important;
    box-sizing: border-box !important;
    max-height: 85vh !important;
    max-height: 85dvh !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    -webkit-overflow-scrolling: touch !important;
    animation: sheetIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) both !important;
  }
  .fvh-payment-modal,
  .fvh-bundle-modal,
  .fvh-item-modal,
  .fvh-rivalry-modal {
    width: 100% !important;
    max-width: 100% !important;
    border-radius: 26px 26px 0 0 !important;
    box-sizing: border-box !important;
  }
}

@media (max-width: 480px) {
  .fvh-payment-modal h2,
  .fvh-bundle-modal h2 {
    font-size: 17px !important;
  }
  .fvh-pay-methods button {
    padding: 10px 12px !important;
  }
  /* Mobile Battle Pass compact header so dual track columns are immediately visible */
  .fvh-bp-header-card {
    padding: 10px 12px !important;
    gap: 8px !important;
    margin-bottom: 8px !important;
    box-sizing: border-box !important;
  }
  .fvh-bp-header-card .fvh-bp-lvl-num {
    width: 38px !important;
    height: 38px !important;
    font-size: 16px !important;
  }
  .fvh-bp-vip-banner {
    margin-bottom: 10px !important;
    box-sizing: border-box !important;
  }
  .fvh-bp-vip-banner > div {
    padding: 8px 12px !important;
    gap: 8px !important;
    box-sizing: border-box !important;
  }
  .fvh-bp-track-scroll {
    min-height: 430px !important;
    padding: 8px 16px 24px 16px !important;
    gap: 12px !important;
    display: flex !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    scroll-behavior: smooth !important;
    -webkit-overflow-scrolling: touch !important;
    touch-action: pan-x pan-y !important;
    overscroll-behavior-x: contain !important;
    scroll-snap-type: x proximity !important;
    box-sizing: border-box !important;
    width: 100% !important;
  }
  .fvh-bp-dual-column {
    flex: 0 0 160px !important;
    min-width: 160px !important;
    max-width: 160px !important;
    min-height: auto !important;
    gap: 10px !important;
    scroll-snap-align: start !important;
    box-sizing: border-box !important;
  }
  .fvh-bp-col-head {
    width: 100% !important;
    box-sizing: border-box !important;
  }
  .fvh-bp-level-card {
    min-height: 185px !important;
    padding: 10px 8px !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-between !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
  }
  .fvh-bp-level-reward-icon {
    font-size: 30px !important;
    margin: 4px 0 !important;
  }
  .fvh-bp-level-reward-name {
    font-size: 11px !important;
    min-height: 34px !important;
    max-height: 38px !important;
    line-height: 1.25 !important;
    margin-bottom: 6px !important;
    display: -webkit-box !important;
    -webkit-line-clamp: 2 !important;
    -webkit-box-orient: vertical !important;
    overflow: hidden !important;
    word-break: break-word !important;
    text-align: center !important;
  }
  .fvh-bp-level-card button.btn {
    min-height: 32px !important;
    padding: 6px 8px !important;
    font-size: 11.5px !important;
    margin-top: auto !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }
}\n\n`;

css = css.substring(0, mIdxStart) + modalEndReplacement + css.substring(mIdxEnd);

// 6. Wardrobe responsive stack rule
if (!css.includes('Heroes & Wardrobe Mobile Responsiveness')) {
  css += `\n/* Heroes & Wardrobe Mobile Responsiveness */
@media (max-width: 600px) {
  .fvh-wardrobe-grid {
    grid-template-columns: 1fr !important;
    gap: 12px !important;
  }
  .fvh-wardrobe-preview {
    min-height: 220px !important;
  }
}\n`;
}

fs.writeFileSync(cssPath, css, 'utf8');
console.log('Successfully updated redesign.css with layout overhaul!');
