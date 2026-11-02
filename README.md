# ⚽ FOOTY vs HOOPS 🏀
> **“Vote with your money for the best sport.”**  
> An international sports arcade & Web3 PvP ecosystem built around the ultimate rivalry: **Football vs. Basketball**.

[![Live Mini App](https://img.shields.io/badge/Telegram_Mini_App-@FootyHoopsGameBot-229ED9?logo=telegram&logoColor=white)](https://t.me/FootyHoopsGameBot)
[![Live Demo](https://img.shields.io/badge/Live_Render_Server-Online-brightgreen)](https://footy-vs-hoops.onrender.com/)
[![Official X](https://img.shields.io/badge/Twitter-@footyvshoops-black?logo=x)](https://x.com/footyvshoops?s=11)
[![TG Channel](https://img.shields.io/badge/Telegram_News-@FootyHoops-blue)](https://t.me/FootyHoops)
[![License](https://img.shields.io/badge/License-Proprietary-red)]()

---

## 🌟 Executive Summary

**FOOTY vs HOOPS** is a competitive 1v1 sports arcade game and GameFi ecosystem where two global athletic powerhouses collide:
* ⚽ **$FOOTY (Team Football)** — Led by Striker #10
* 🏀 **$HOOPS (Team Basketball)** — Led by Forward #23

Unlike conventional sports games focused on single teams or athletes, **FOOTY vs HOOPS puts two entire sporting cultures against each other**. Players choose their allegiance permanently, compete in fast-paced 1v1 arcade matches against AI across 2 standard arenas, customize their athlete with authentic kits and balls, and participate in community rivalry metrics.

For complete project documentation, tokenomics vision, and fundraising roadmap, see **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)**.

---

## 🎮 Key Product Features

| Feature | Description |
| :--- | :--- |
| **⚽ Football Mode** | Realistic 3D arcade soccer with dynamic shooting, turbo sprint, stamina physics, and sudden death overtimes. |
| **🏀 Basketball Mode** | High-energy hardwood court action with jump shots, dunks, backboard rebound physics, and clutch overtime play. |
| **🤖 1v1 Arcade vs AI** | Fast-paced 1v1 matches with responsive AI bots across football and basketball. |
| **🏟️ 2 Standard Arenas** | Handcrafted venues: Classic Grass Pitch (Football) & Street Court (Basketball). |
| **👕 Locker Room & Wardrobe** | Curated catalog of authentic kits, jerseys, and distinctive match balls. |
| **⭐ Telegram Stars Integration** | Native digital purchasing with XTR Stars via official Telegram Bot API webhooks. |
| **💎 Web3 / TON Vision** | Non-custodial TON wallet linking for future ecosystem airdrop qualification. |

---

## 🏗️ Technical Architecture

```mermaid
flowchart TD
    Client["📱 Telegram Mini App (Web / Three.js / Canvas)"]
    Server["⚡ Node.js Game & Signaling Master Server (Render)"]
    Peer["🎮 Remote 1v1 Opponent (WebRTC P2P)"]
    TG["✈️ Telegram Bot API (Stars, Webhooks, Membership)"]
    TON["💎 TON Blockchain (Airdrop Ledger, Wallet Verification)"]

    Client <-->|RFC6455 WebSocket / HTTP| Server
    Client <==>|Direct Low-Latency WebRTC DataChannel| Peer
    Server <-->|Bot API / Webhook| TG
    Server <-->|Address & Memo Verification| TON
```

### Technology Stack
* **Client Frontend:** Vanilla ES6+, WebGL/Canvas rendering, Three.js 3D physics, Telegram WebApp SDK.
* **Server Backend:** Node.js HTTP/WebSocket server, in-memory state engine with atomic persistence (`data.json`).
* **Multiplayer Netcode:** WebRTC DataChannel + RFC6455 WebSocket fallback relay.
* **Cloud Infrastructure:** Render Web Services with 24/7 keep-alive monitoring.
* **Payment Rails:** Telegram Stars (XTR) invoices, TON Connect wallet binding.

---

## 🚀 Quick Start & Verification

### Running Tests Locally
```bash
# Automated verification test suite (28/28 checks)
node tests/verify.js

# Critical gameplay regression suite (24/24 checks)
node scripts/test_gameplay_critical.js
```

### Starting the Server
```bash
# Start backend server on port 8099 (or PORT env)
node server/server.js
```

---

## 📈 Fundraising & Investment

* **Stage:** Pre-Seed Round
* **Target Raise:** **$55,000 USD**
* **Core Objectives:**
  * Core gameplay expansion & 3D character engine upgrades.
  * Dedicated low-latency multiplayer server scaling.
  * Comprehensive smart contract and payment security audits.
  * International user acquisition and Telegram GameFi marketing.

For inquiries: [footyvshoops@gmail.com](mailto:footyvshoops@gmail.com) | Official X: [@footyvshoops](https://x.com/footyvshoops?s=11)
