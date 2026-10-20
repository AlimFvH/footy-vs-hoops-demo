# FOOTY vs HOOPS — Telegram Mini App (TMA) Production Deployment Guide

This guide details the complete, production-ready process for configuring, securing, deploying, and launching **FOOTY vs HOOPS** as a certified **Telegram Mini App** with online 1v1 multiplayer and **Telegram Stars (XTR)** digital purchases.

---

## 1. Prerequisites

Before starting the deployment, prepare the following:

- **Telegram Account** with access to `@BotFather`.
- **Public Domain Name** with valid **HTTPS (SSL/TLS)**. Telegram Mini Apps strictly require HTTPS (e.g. via Let's Encrypt, Cloudflare, or hosting provider SSL). Self-signed certificates are rejected by Telegram clients.
- **Node.js Environment**: Node.js `v18.0.0` or higher (`v20.x` LTS recommended).
- **Hosting Platform**: Linux VPS (Ubuntu 22.04 LTS), Railway, Render, Fly.io, AWS, or DigitalOcean Droplet.

---

## 2. Setting Up the Bot and Mini App in `@BotFather`

1. Open Telegram and message [@BotFather](https://t.me/BotFather).
2. Create the Bot:
   ```text
   /newbot
   ```
   Follow the prompts to name the bot (e.g., `FOOTY vs HOOPS Official`) and choose a username ending in `bot` (e.g., `FootyVsHoopsBot`).
   Copy the generated `TELEGRAM_BOT_TOKEN`.
3. Create the Mini App:
   ```text
   /newapp
   ```
   Select your bot and provide:
   - **Title**: `FOOTY vs HOOPS`
   - **Description**: `Ultimate 1v1 Football vs Basketball Arcade Battle! Quick matches, private rooms, arenas & Battle Pass.`
   - **App Photo (640x360 px)**: Upload official game banner.
   - **Web App URL**: Enter your production HTTPS URL (e.g. `https://fvh.yourdomain.com`).
   - **Short Name**: `play` (this yields the link: `t.me/FootyVsHoopsBot/play`).
4. Set the Menu Button to open the Mini App directly from the chat:
   ```text
   /setmenubutton
   ```
   Select your bot, enter `PLAY NOW ⚽🏀`, and input your Mini App URL (`https://fvh.yourdomain.com`).

---

## 3. Environment Variables Configuration

Copy `.env.example` to `.env` on your production server:

```bash
cp .env.example .env
```

Configure the environment variables:

```ini
# Production Server Port
PORT=8099
NODE_ENV=production

# Telegram Bot Token from @BotFather
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ

# Production Web App URL (HTTPS)
TELEGRAM_MINI_APP_URL=https://fvh.yourdomain.com

# TON Wallet Address for optional TON transactions
TON_RECIPIENT_ADDRESS=EQBvW8Z5huBkMJYdn30BlgG3mM2N05hpVNeSlfG2L89xAOn3

# CORS Origin Allowlist
CORS_ORIGIN=*

# Session / JWT Secret for signed game outcomes
SESSION_SECRET=a_very_strong_random_32_character_secret_key_here
```

> [!SECURITY]
> Never commit `.env` or paste real bot tokens into git repositories or client-side JavaScript.

---

## 4. Backend Deployment Instructions

### Option A: PM2 on Ubuntu Linux VPS (Recommended)

1. Connect to your VPS and install dependencies:
   ```bash
   sudo apt update && sudo apt upgrade -y
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs nginx certbot python3-certbot-nginx
   sudo npm install -g pm2
   ```
2. Clone repository & install:
   ```bash
   git clone https://github.com/AlimFvH/footy-vs-hoops-demo.git /var/www/fvh
   cd /var/www/fvh
   npm install --production
   cp .env.example .env
   nano .env # Paste your real tokens
   ```
3. Start backend daemon with PM2:
   ```bash
   pm2 start server/server.js --name "fvh-master" -i max
   pm2 save
   pm2 startup
   ```
4. Verify server health:
   ```bash
   curl http://localhost:8099/api/health
   # Expected: {"ok":true,"service":"footy-vs-hoops","version":"2.0.0",...}
   ```

### Option B: Docker Container Deployment

Create `Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 8099
CMD ["node", "server/server.js"]
```
Build and run:
```bash
docker build -t fvh-game:latest .
docker run -d --name fvh-app -p 8099:8099 --env-file .env --restart always fvh-game:latest
```

---

## 5. Reverse Proxy & SSL Configuration (Nginx)

Configure Nginx (`/etc/nginx/sites-available/fvh.conf`):

```nginx
server {
    server_name fvh.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8099;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }
}
```

Enable site & obtain SSL certificate:
```bash
sudo ln -s /etc/nginx/sites-available/fvh.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d fvh.yourdomain.com
```

---

## 6. Telegram Stars (XTR) Payments Setup

Telegram Mini Apps strictly mandate **Telegram Stars (XTR)** for purchasing digital goods (skins, battle pass, coins).

1. In the backend (`server/server.js`), when a client requests `/api/stars/create-invoice`, the server calls Telegram Bot API `createInvoiceLink` using currency `XTR`.
2. The client invokes the official Telegram checkout modal:
   ```javascript
   window.Telegram.WebApp.openInvoice(invoiceLink, function (status) {
     if (status === 'paid') {
       // Authoritative backend verification and inventory credit
       verifyInvoice(invoiceId);
     }
   });
   ```
3. To test Telegram Stars in Testnet:
   - Message `@BotFather` -> `/mybots` -> Select your bot -> `Bot Settings` -> `Payments` -> Turn on Test Mode.
   - Test transactions will use simulated Stars without deducting real funds.

---

## 7. Webhook & Security Architecture

1. **Telegram `initData` Signature Validation**:
   The backend route `/api/telegram/validate-init-data` verifies the cryptographic HMAC-SHA256 signature using `HMAC_SHA256("WebAppData", botToken)`. Unsigned or tampered requests are immediately rejected.
2. **Authoritative Server Match Validation**:
   Match results and rewards cannot be forged by clients. The server signs each match outcome with an expiring cryptographic `matchToken` verified at `/api/economy/reward`.
3. **Idempotency Keys**:
   All purchase requests require a unique idempotency key (`feat_...`, `pack_...`) to prevent double-spending or duplicate charges on packet retries.

---

## 8. Mobile & Telegram Client Optimization

The application has been verified for seamless operation across Telegram clients:
- **Telegram WebApp SDK**: Loaded via `<script src="https://telegram.org/js/telegram-web-app.js"></script>`.
- **Fullscreen Mode**: Automatically expands with `Telegram.WebApp.expand()`.
- **Safe Area Insets**: Handled via CSS `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` to accommodate iOS home indicator and notch.
- **Telegram Native BackButton**: Integrated to return players to the main menu without leaving the Mini App.
- **Theme Adaptation**: Background and status bars match Telegram dark theme `#060a14`.

---

## 9. Production Launch Checklist

- [x] Node.js server starts and `/api/health` returns HTTP 200.
- [x] Quick Match finds opponents between two independent browser/app tabs.
- [x] Private 1v1 Room creates valid `FVH-XXXX` code and second client connects.
- [x] Store items, bundles, and arenas show 100% Russian translations in `ru` locale.
- [x] Skyline Rooftop arena renders custom skyline skyscraper court artwork.
- [x] Competition modal ($FOOTY vs $HOOPS) has subtle 4-6px blur and no overlapping text.
- [x] Telegram Stars invoice endpoint responds with valid XTR product information.
- [x] BackButton correctly navigates between Lobby and Subscreens.
- [x] SSL certificate is valid and rated A+ on SSL Labs.

---

## 10. Troubleshooting Common Issues

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **"Сервер матчмейкинга временно недоступен"** | Backend offline or port 8099 blocked | Verify `pm2 status` or run `node server/server.js`. Ensure Nginx reverse proxy is active. |
| **"Сервер вернул ответ без JSON (HTTP 404)"** | Static host intercepted API request | App now uses dynamic `getApiUrl()`. Set `?api=https://fvh.yourdomain.com` or verify Nginx proxy settings. |
| **Invoice popup doesn't open in Telegram** | Missing `TELEGRAM_BOT_TOKEN` in `.env` | Set `TELEGRAM_BOT_TOKEN` in `.env` so `createInvoiceLink` generates a valid `t.me/$...` link. |
| **Overlap on bottom navigation on iPhone** | Missing safe area insets | The app uses `env(safe-area-inset-bottom, 0px)` in `css/redesign.css`. Ensure viewport has `viewport-fit=cover`. |
