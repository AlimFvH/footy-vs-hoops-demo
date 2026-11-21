const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'css', 'redesign.css');
let css = fs.readFileSync(cssPath, 'utf8');

const cyberStadiumCss = `
/* ==========================================================================
   RADICAL OVERHAUL: CHAMPIONSHIP CYBER-STADIUM MASTER STYLING
   ========================================================================== */

/* 1. Dynamic Championship Stadium Arena Background */
.fvh-stadium-arena-bg {
  background: 
    /* Top Volumetric Stadium Floodlight Beams */
    radial-gradient(ellipse 75% 85% at 15% -5%, rgba(0, 245, 155, 0.30) 0%, rgba(0, 245, 155, 0.08) 45%, transparent 68%),
    radial-gradient(ellipse 75% 85% at 85% -5%, rgba(0, 210, 255, 0.24) 0%, rgba(0, 210, 255, 0.06) 45%, transparent 68%),
    /* Mid Stadium Ambient Glow */
    radial-gradient(ellipse 90% 50% at 50% 40%, rgba(14, 28, 56, 0.6) 0%, transparent 80%),
    /* Stadium Turf Ground Glow */
    radial-gradient(ellipse 85% 35% at 50% 88%, rgba(0, 245, 155, 0.14) 0%, transparent 70%),
    /* Deep Stadium Night Sky Core */
    linear-gradient(180deg, #070a14 0%, #0a1122 45%, #04060c 100%) !important;
}

.fvh-stadium-arena-bg.hoops {
  background: 
    /* Top Volumetric Floodlights: Crimson & Magma Orange */
    radial-gradient(ellipse 75% 85% at 15% -5%, rgba(255, 42, 95, 0.35) 0%, rgba(255, 42, 95, 0.08) 45%, transparent 68%),
    radial-gradient(ellipse 75% 85% at 85% -5%, rgba(255, 136, 0, 0.28) 0%, rgba(255, 136, 0, 0.06) 45%, transparent 68%),
    /* Mid Stadium Ambient Glow */
    radial-gradient(ellipse 90% 50% at 50% 40%, rgba(36, 14, 28, 0.6) 0%, transparent 80%),
    /* Stadium Court Hardwood Ground Glow */
    radial-gradient(ellipse 85% 35% at 50% 88%, rgba(255, 42, 95, 0.15) 0%, transparent 70%),
    /* Deep Stadium Night Sky Core */
    linear-gradient(180deg, #0a060a 0%, #1a0a14 45%, #050306 100%) !important;
}

/* 2. Open Stadium Hero Stage ("БЕЗ ФОНА" - NO BOX CONTAINER!) */
.fvh-open-hero-stage {
  position: relative !important;
  width: 100% !important;
  max-width: 440px !important;
  margin: 0 auto !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  box-sizing: border-box !important;
}

/* Hologram Header Ribbon above the Athlete */
.fvh-hero-hologram-header {
  width: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 4px 10px !important;
  margin-bottom: 2px !important;
  box-sizing: border-box !important;
}

.fvh-holo-pill {
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
  padding: 5px 14px !important;
  border-radius: 12px 3px 12px 3px !important;
  background: linear-gradient(135deg, rgba(14, 24, 46, 0.92) 0%, rgba(8, 14, 28, 0.95) 100%) !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
  border: 1.5px solid rgba(0, 245, 155, 0.55) !important;
  box-shadow: 0 4px 16px rgba(0, 245, 155, 0.28) !important;
}

.fvh-holo-pill.hoops {
  border-color: rgba(255, 42, 95, 0.55) !important;
  box-shadow: 0 4px 16px rgba(255, 42, 95, 0.28) !important;
}

.fvh-holo-icon {
  font-size: 15px !important;
}

.fvh-holo-name {
  font-size: 13px !important;
  font-weight: 950 !important;
  letter-spacing: 0.8px !important;
  font-style: italic !important;
  color: #ffffff !important;
}

.fvh-holo-ovr {
  font-size: 11px !important;
  font-weight: 950 !important;
  background: linear-gradient(135deg, #ffd700 0%, #ff8800 100%) !important;
  color: #0b0700 !important;
  padding: 2px 7px !important;
  border-radius: 4px !important;
  box-shadow: 0 2px 6px rgba(255, 136, 0, 0.4) !important;
}

.fvh-btn-fast-switch {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 5px 12px !important;
  border-radius: 10px 2px 10px 2px !important;
  background: rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(12px) !important;
  border: 1.2px solid rgba(255, 255, 255, 0.18) !important;
  color: #f1f5f9 !important;
  font-size: 11.5px !important;
  font-weight: 850 !important;
  cursor: pointer !important;
  transition: all 0.15s ease !important;
}

.fvh-btn-fast-switch:hover {
  background: rgba(255, 255, 255, 0.15) !important;
  border-color: #ffd000 !important;
  color: #ffd000 !important;
  transform: translateY(-1.5px) !important;
}

/* Open Stadium Viewport: Hero stands prominent on stage */
.fvh-hero-open-viewport {
  position: relative !important;
  width: 100% !important;
  height: clamp(300px, 42vh, 390px) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: transparent !important;
  margin: 0 auto !important;
}

.fvh-hero-open-viewport .fvh-hero-real-img {
  max-height: 94% !important;
  max-width: 90% !important;
  object-fit: contain !important;
  filter: drop-shadow(0 16px 36px rgba(0, 0, 0, 0.75)) drop-shadow(0 0 22px rgba(0, 245, 155, 0.25)) !important;
  z-index: 2 !important;
}

.fvh-open-hero-stage.hoops .fvh-hero-open-viewport .fvh-hero-real-img {
  filter: drop-shadow(0 16px 36px rgba(0, 0, 0, 0.75)) drop-shadow(0 0 22px rgba(255, 42, 95, 0.3)) !important;
}

/* 3D Championship Neon Stadium Podium Under Athlete's Feet */
.fvh-neon-podium {
  position: absolute !important;
  bottom: 8px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  width: 220px !important;
  height: 32px !important;
  border-radius: 50% !important;
  background: radial-gradient(ellipse at center, rgba(0, 245, 155, 0.45) 0%, rgba(0, 245, 155, 0.15) 55%, transparent 72%) !important;
  border: 1.8px solid rgba(0, 245, 155, 0.75) !important;
  box-shadow: 0 0 34px rgba(0, 245, 155, 0.55), inset 0 0 16px rgba(0, 245, 155, 0.65) !important;
  pointer-events: none !important;
  z-index: 0 !important;
}

.fvh-neon-podium.hoops {
  background: radial-gradient(ellipse at center, rgba(255, 42, 95, 0.45) 0%, rgba(255, 42, 95, 0.15) 55%, transparent 72%) !important;
  border-color: rgba(255, 42, 95, 0.8) !important;
  box-shadow: 0 0 34px rgba(255, 42, 95, 0.6), inset 0 0 16px rgba(255, 42, 95, 0.7) !important;
}

/* Floating Equipped Gear Dock below Podium */
.fvh-hero-gear-dock {
  width: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 10px !important;
  margin-top: 4px !important;
  margin-bottom: 8px !important;
}

.fvh-gear-pill {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  padding: 5px 12px !important;
  border-radius: 10px 2px 10px 2px !important;
  background: linear-gradient(135deg, rgba(16, 24, 44, 0.88) 0%, rgba(8, 12, 24, 0.94) 100%) !important;
  backdrop-filter: blur(12px) !important;
  border: 1.2px solid rgba(255, 255, 255, 0.14) !important;
  font-size: 11.5px !important;
  font-weight: 800 !important;
  color: #f1f5f9 !important;
  cursor: pointer !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important;
  transition: all 0.15s ease !important;
}

.fvh-gear-pill:hover {
  transform: translateY(-2px) !important;
  border-color: #ffd000 !important;
}

/* 3. High-Voltage Championship PLAY Launcher */
.fvh-play-launcher-wrap {
  width: 100% !important;
  max-width: 440px !important;
  margin: 4px auto 10px auto !important;
  box-sizing: border-box !important;
}

.fvh-btn-play-hero {
  width: 100% !important;
  padding: 13px 18px !important;
  border-radius: 18px 4px 18px 4px !important;
  background: linear-gradient(135deg, #00f59b 0%, #00d2ff 55%, #0088ff 100%) !important;
  border: 1.5px solid rgba(180, 255, 230, 0.9) !important;
  color: #02120a !important;
  box-shadow: 0 7px 0 #007a4d, 0 16px 36px rgba(0, 245, 155, 0.48), inset 0 2px 0 rgba(255, 255, 255, 0.85) !important;
  cursor: pointer !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 3px !important;
  transition: transform 0.12s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.12s ease !important;
}

.fvh-btn-play-hero.hoops {
  background: linear-gradient(135deg, #ff8800 0%, #ff2a5f 55%, #a800ff 100%) !important;
  border-color: rgba(255, 200, 220, 0.9) !important;
  color: #ffffff !important;
  box-shadow: 0 7px 0 #880028, 0 16px 36px rgba(255, 42, 95, 0.48), inset 0 2px 0 rgba(255, 255, 255, 0.85) !important;
}

.fvh-btn-play-hero:hover {
  transform: translateY(-3px) !important;
  filter: brightness(1.08) !important;
}

.fvh-btn-play-hero:active {
  transform: translateY(4px) !important;
  box-shadow: 0 2px 0 #007a4d, 0 4px 12px rgba(0, 245, 155, 0.3) !important;
}

.fvh-btn-play-hero.hoops:active {
  box-shadow: 0 2px 0 #880028, 0 4px 12px rgba(255, 42, 95, 0.3) !important;
}

.fvh-btn-play-hero .play-row {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
}

.fvh-btn-play-hero .play-text {
  font-size: 19px !important;
  font-weight: 950 !important;
  font-style: italic !important;
  letter-spacing: 1px !important;
  text-transform: uppercase !important;
}

.fvh-btn-play-hero.footy .play-text {
  color: #02120a !important;
}

.fvh-btn-play-hero.hoops .play-text {
  color: #ffffff !important;
  text-shadow: 0 2px 8px rgba(0,0,0,0.5) !important;
}

.fvh-btn-play-hero .play-icon {
  background: rgba(0, 0, 0, 0.25) !important;
  color: #ffffff !important;
  font-size: 13px !important;
  width: 22px !important;
  height: 22px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 6px 2px 6px 2px !important;
}

.fvh-btn-play-hero .play-sub {
  font-size: 11px !important;
  font-weight: 800 !important;
  letter-spacing: 0.4px !important;
  opacity: 0.9 !important;
}

/* 4. Dynamic 2x2 Quick Feature Hub Grid */
.fvh-quick-grid {
  display: grid !important;
  grid-template-columns: 1fr 1fr !important;
  gap: 9px !important;
  width: 100% !important;
  max-width: 440px !important;
  margin: 2px auto 10px auto !important;
  box-sizing: border-box !important;
}

.fvh-quick-tile {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  padding: 10px 12px !important;
  border-radius: 15px 3px 15px 3px !important;
  background: linear-gradient(145deg, rgba(18, 26, 46, 0.92) 0%, rgba(10, 15, 28, 0.96) 100%) !important;
  backdrop-filter: blur(14px) !important;
  border: 1.2px solid rgba(255, 255, 255, 0.12) !important;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.12) !important;
  cursor: pointer !important;
  text-align: left !important;
  transition: transform 0.12s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.15s ease, box-shadow 0.15s ease !important;
}

.fvh-quick-tile:hover {
  transform: translateY(-2.5px) !important;
  border-color: rgba(255, 215, 0, 0.5) !important;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.65), 0 0 18px rgba(255, 215, 0, 0.2) !important;
}

.fvh-quick-tile:active {
  transform: translateY(2px) !important;
}

.fvh-tile-icon {
  font-size: 24px !important;
  flex-shrink: 0 !important;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5)) !important;
}

.fvh-tile-info {
  display: flex !important;
  flex-direction: column !important;
  min-width: 0 !important;
}

.fvh-tile-title {
  font-size: 12px !important;
  font-weight: 950 !important;
  letter-spacing: 0.6px !important;
  text-transform: uppercase !important;
  color: #ffffff !important;
  line-height: 1.2 !important;
}

.fvh-tile-sub {
  font-size: 10px !important;
  font-weight: 700 !important;
  color: #94a3b8 !important;
  margin-top: 1px !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

/* 5. Mode Select Dual-Stadium Showcase */
.fvh-mode-select-screen .fvh-mode-team-banner {
  margin-bottom: 12px !important;
  padding: 8px 14px !important;
  border-radius: 14px 3px 14px 3px !important;
  background: linear-gradient(135deg, rgba(16, 24, 44, 0.92) 0%, rgba(8, 14, 28, 0.96) 100%) !important;
  border: 1.5px solid rgba(0, 245, 155, 0.4) !important;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45) !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 2px !important;
}

.fvh-mode-select-screen .fvh-mode-team-banner.hoops {
  border-color: rgba(255, 42, 95, 0.45) !important;
}

.fvh-mode-team-banner .fvh-team-tag {
  font-size: 12.5px !important;
  font-weight: 950 !important;
  letter-spacing: 0.6px !important;
  color: #ffd000 !important;
  text-transform: uppercase !important;
}

.fvh-mode-team-banner .fvh-team-sub {
  font-size: 10.5px !important;
  color: #cbd5e1 !important;
  font-weight: 700 !important;
}

.fvh-mode-card.stadium-card {
  border-radius: 20px 4px 20px 4px !important;
  margin-bottom: 14px !important;
  overflow: hidden !important;
}

.fvh-mode-card.stadium-card.footy-card {
  border: 1.5px solid rgba(0, 245, 155, 0.5) !important;
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.65), 0 0 24px rgba(0, 245, 155, 0.16) !important;
}

.fvh-mode-card.stadium-card.hoops-card {
  border: 1.5px solid rgba(255, 100, 0, 0.5) !important;
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.65), 0 0 24px rgba(255, 100, 0, 0.16) !important;
}

.fvh-dual-actions {
  display: flex !important;
  flex-direction: column !important;
  gap: 7px !important;
  margin-top: 10px !important;
}

/* 6. Wardrobe Fitting Stage: "БЕЗ ФОНА" */
.fvh-wardrobe-preview {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 4px 0 !important;
}

.fvh-wardrobe-avatar {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.fvh-wardrobe-avatar .fvh-hero-real-img {
  filter: drop-shadow(0 16px 36px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 24px rgba(0, 245, 155, 0.28)) !important;
}

/* 7. Floating Cyber Dock Navigation */
.fvh-bottom-nav {
  position: fixed !important;
  bottom: calc(max(var(--sab), 10px) + 8px) !important;
  left: 14px !important;
  right: 14px !important;
  max-width: 440px !important;
  margin: 0 auto !important;
  border-radius: 20px !important;
  background: rgba(10, 15, 28, 0.92) !important;
  backdrop-filter: blur(24px) !important;
  -webkit-backdrop-filter: blur(24px) !important;
  border: 1.5px solid rgba(255, 255, 255, 0.16) !important;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.75), 0 0 20px rgba(0, 245, 155, 0.12) !important;
  z-index: 100 !important;
  padding: 5px 8px !important;
}

.fvh-nav-item.active .fvh-nav-icon {
  filter: drop-shadow(0 0 10px #00f59b) !important;
}

.fvh-nav-item.active .fvh-nav-label {
  color: #00f59b !important;
  font-weight: 900 !important;
}
`;

css += '\n' + cyberStadiumCss + '\n';
fs.writeFileSync(cssPath, css, 'utf8');
console.log('Successfully appended Championship Cyber-Stadium CSS to redesign.css!');
