# Руководство по настройке платежей Telegram Stars (XTR) для FOOTY vs HOOPS

Данный документ содержит полное руководство по настройке и обработке платежей **Telegram Stars** в соответствии с требованиями Telegram Bot API, App Store (Apple) и Google Play.

---

## 1. Архитектура платежей в FOOTY vs HOOPS

Для цифровых внутриигровых товаров (валюта FvH Coin, VIP Battle Pass, наборы скинов и арен) **обязательно** используются **Telegram Stars (XTR)**.

> ⚠️ **Важное предостережение по правилам Telegram и App Store / Google Play:**
> Продажа внутриигровых цифровых товаров напрямую за криптовалюту (TON, USDT) внутри мобильных клиентов Telegram на iOS и Android запрещена политикой App Store (пункт 3.1.1) и Google Play. Нарушение приводит к блокировке бота или блокировке платежей в Mini App.
> **Все внутриигровые покупки проводятся через Telegram Stars.**

```
+-------------------+        +---------------------+        +--------------------+
|  Telegram Mini    |        |   FOOTY vs HOOPS    |        |   Telegram Bot     |
|       App         |        |   Backend Server    |        |        API         |
+-------------------+        +---------------------+        +--------------------+
          |                             |                             |
          | 1. POST /api/stars/create-  |                             |
          |    invoice {productId}      |                             |
          |---------------------------->|                             |
          |                             | 2. createInvoiceLink        |
          |                             |    (currency: XTR)          |
          |                             |---------------------------->|
          |                             | 3. invoice_link             |
          |                             |<----------------------------|
          | 4. invoiceLink              |                             |
          |<----------------------------|                             |
          |                                                           |
          | 5. Telegram.WebApp.openInvoice(invoiceLink)               |
          |---------------------------------------------------------->|
          |                                                           | (Пользователь платит Stars)
          |                             | 6. pre_checkout_query       |
          |                             |<----------------------------|
          |                             | 7. answerPreCheckoutQuery   |
          |                             |---------------------------->|
          |                             | 8. successful_payment       |
          |                             |<----------------------------|
          |                             |    (Зачисление FvH Coins)   |
          | 9. Callback: status 'paid'  |                             |
          |<----------------------------------------------------------|
          | 10. POST /api/stars/verify  |                             |
          |---------------------------->| (Проверка и синхронизация)  |
          |                             |                             |
```

---

## 2. Пошаговая настройка в @BotFather

Для включения приема Telegram Stars выполните следующие шаги:

1. Откройте диалог с **[@BotFather](https://t.me/BotFather)** в Telegram.
2. Отправьте команду:
   ```
   /mybots
   ```
3. Выберите созданного бота (например, `@FootyVsHoopsBot`).
4. Нажмите **Bot Settings** → **Payments**.
5. Выберите **Telegram Stars** (XTR).
6. Подтвердите включение приема Stars. Дополнительный платежный шлюз (Stripe/Payme) не требуется — Stars обрабатываются Telegram напрямую.
7. В разделе **Bot Settings** → **Menu Button** настройте ссылку на Web App:
   - URL: `https://your-domain.com` (или URL на Render/Railway/Fly.io/VPS).

---

## 3. Серверные переменные окружения (.env)

На бэкенд-сервере настройте переменные в `.env`:

```env
# Telegram Bot Token (получен от @BotFather)
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ

# Webhook секрет для валидации входящих уведомлений от Telegram
TELEGRAM_WEBHOOK_SECRET=your_super_secret_webhook_token_here

# Порт бэкенда FOOTY vs HOOPS
PORT=8099
```

---

## 4. Каталог товаров и цены в Telegram Stars

В `server/server.js` настроен официальный каталог товаров:

| ID Товара | Название | Тип | Награда | Цена (Stars) |
| :--- | :--- | :--- | :--- | :--- |
| `fvh_coins_500` | Starter Coin Pack | Валюта | 500 FvH Coin | 50 ⭐ |
| `fvh_coins_1200` | Pro Coin Pack | Валюта | 1,200 FvH Coin | 100 ⭐ |
| `fvh_coins_2800` | Elite Coin Pack | Валюта | 2,800 FvH Coin | 200 ⭐ |
| `fvh_coins_6500` | Champion Pack | Валюта | 6,500 FvH Coin | 450 ⭐ |
| `fvh_coins_15000` | Legend Vault | Валюта | 15,000 FvH Coin | 950 ⭐ |
| `battlepass_vip_s1` | VIP Battle Pass Pass | Сезонный пропуск | Разблокировка VIP трека (30 уровней) | 250 ⭐ |

---

## 5. Обработка Webhook от Telegram API

Для надежного зачисления покупок Telegram отправляет на бэкенд два типа запросов:

### A. Pre-Checkout Query (`pre_checkout_query`)
Telegram спрашивает сервер, готов ли он принять оплату за товар до списания Stars:
```javascript
// Ответ на pre_checkout_query (в течение 10 секунд)
await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerPreCheckoutQuery`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pre_checkout_query_id: update.pre_checkout_query.id,
    ok: true
  })
});
```

### B. Successful Payment (`successful_payment`)
Telegram уведомляет об успешном списании Stars с аккаунта пользователя:
```javascript
const payment = message.successful_payment;
const payload = JSON.parse(payment.invoice_payload);
// payload содержит: { productId, playerId, orderId }

// Авторитетное зачисление FvH Coin в хранилище сервера
creditAuthoritativePurchase(payload.playerId, payload.productId, payment.telegram_payment_charge_id);
```

---

## 6. Управление доходами и вывод средств через Fragment

Все Stars, заработанные ботом, накапливаются на балансе бота:

1. **Просмотр баланса Stars:**
   - Откройте **[@BotFather](https://t.me/BotFather)** → `/mybots` → выберите бота → **Bot Settings** → **Payments** → **Stars Balance**.
2. **Вывод через платформу Fragment:**
   - Перейдите на официальный сайт **[Fragment.com](https://fragment.com)**.
   - Подключите кошелек TON (Tonkeeper, Telegram Wallet).
   - Войдите под аккаунтом владельца бота.
   - Во вкладке **Stars** выберите своего бота и нажмите **Withdraw**.
   - Накопленные Stars конвертируются в криптовалюту **TON** по официальному курсу Telegram (за вычетом комиссии платформы) и моментально поступают на ваш кошелек.
3. **Использование Stars для Telegram Ads:**
   - Заработанные Stars можно направить напрямую на оплату рекламы в Telegram Ads с дополнительной скидкой.

---

## 7. Обработка возвратов (Refunds)

При необходимости вернуть Stars игроку (например, при ошибочной покупке) используйте метод Telegram Bot API:
```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/refundStarPayment" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 123456789, "telegram_payment_charge_id": "<CHARGE_ID>"}'
```
После успешного вызова `refundStarPayment` Telegram возвращает Stars на счет пользователя, а сервер аннулирует или списывает начисленные FvH Coin.
