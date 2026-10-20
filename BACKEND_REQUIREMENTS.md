# Системные требования и руководство по развертыванию бэкенда FOOTY vs HOOPS

Данный документ описывает требования к серверной инфраструктуре для хостинга игры **FOOTY vs HOOPS** в продакшене Telegram Mini App.

---

## 1. Системные требования к среде выполнения

| Компонент | Минимальные требования | Рекомендуемые требования |
| :--- | :--- | :--- |
| **Node.js** | v18.17.0+ LTS | v20.x или v22.x LTS |
| **ОЗУ (RAM)** | 512 МБ | 1 ГБ - 2 ГБ |
| **ЦП (CPU)** | 1 виртуальное ядро (vCPU) | 2 vCPU |
| **Дисковое пространство** | 500 МБ | 2 ГБ SSD (для логов и базы данных) |
| **ОС** | Linux (Ubuntu 22.04 / Debian 12 / Alpine), Windows Server | Ubuntu 22.04 LTS |
| **Протоколы** | HTTP/1.1, HTTP/2, WebSocket (WSS) | HTTPS + WSS с поддержкой HTTP/2 |

---

## 2. Архитектура сервисов бэкенда

Сервер `server/server.js` объединяет в одном высокопроизводительном процессе:
1. **HTTP API**:
   - `/api/health` — мониторинг доступности (healthcheck).
   - `/api/economy/*` — авторитетная экономика (баланс, покупки, экипировка, квесты).
   - `/api/matchmaking/*` — поиск игроков для Quick Match.
   - `/api/rooms/*` — приватные лобби с 6-значными кодами.
   - `/api/stars/*` — выставление счетов и проверка платежей Telegram Stars (XTR).
   - `/api/telegram/validate-init-data` — криптографическая валидация Telegram initData.
2. **WebSocket Signaling & State Relay**:
   - Мгновенная синхронизация 1v1 комнат и Quick Match.
   - P2P WebRTC сигналинг и Relay Fallback при строгих NAT сетях.
3. **Статический хостинг**:
   - Раздача файлов игры (`index.html`, `js/`, `css/`, `assets/`, `manifest.json`).

---

## 3. Переменные окружения (.env)

| Переменная | Описание | Пример значения |
| :--- | :--- | :--- |
| `PORT` | Порт, на котором слушает Node.js сервер | `8099` |
| `NODE_ENV` | Режим работы окружения | `production` |
| `TELEGRAM_BOT_TOKEN` | Токен бота от @BotFather | `1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ` |
| `TELEGRAM_WEBHOOK_SECRET` | Секретный ключ для проверки Telegram Webhook | `a9f8b2c4e1d7...` |
| `CORS_ORIGIN` | Разрешенные домены (CORS) | `*` (или `https://your-domain.com`) |

---

## 4. Настройка Nginx Reverse Proxy (с поддержкой WebSocket)

Telegram Mini App **обязательно** требует соединение по защищенному протоколу `https://` и `wss://`.

Конфигурация Nginx (`/etc/nginx/sites-available/footy-vs-hoops`):

```nginx
server {
    listen 80;
    server_name fvh.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name fvh.yourdomain.com;

    # SSL сертификаты (Let's Encrypt Certbot)
    ssl_certificate /etc/letsencrypt/live/fvh.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fvh.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Сжатие Gzip для быстрой загрузки Mini App
    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;

    location / {
        proxy_pass http://127.0.0.1:8099;
        proxy_http_version 1.1;

        # КРИТИЧНО для работы мультиплеера и WebSockets:
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Таймауты для долгоживущих онлайн матчей
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

---

## 5. Запуск через PM2 (Process Manager)

Для непрерывной работы в фоне и автоперезапуска после падений или перезагрузки сервера:

```bash
# Установка PM2 глобально
npm install -g pm2

# Запуск сервера
pm2 start server/server.js --name "footy-vs-hoops"

# Сохранение списка процессов для автозапуска при ребуте
pm2 save
pm2 startup
```

---

## 6. Варианты облачного деплоя в один клик

### Вариант А: Render.com
1. Создайте новый **Web Service** из GitHub репозитория.
2. Runtime: **Node**.
3. Build Command: `npm install` (или оставьте пустым, зависимостей с компиляцией нет).
4. Start Command: `node server/server.js`.
5. Environment Variables:
   - `PORT`: `8099` (или Render автоматически предоставит порт).
   - `TELEGRAM_BOT_TOKEN`: ваш токен.

### Вариант Б: Railway.app / Fly.io
1. Сервер автоматически слушает `process.env.PORT`.
2. Поддерживаются WebSockets без дополнительных настроек.
3. Предоставляется автоматический бесплатный SSL (`https://`).
