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

| ID Товара | Название | Тип | Награда | Валюта / Цена |
| :--- | :--- | :--- | :--- | :--- |
| `battlepass_premium` | Battle Pass Season 1 VIP | Цифровой пропуск | 30 уровней VIP наград | **Только 250 ⭐ XTR** (TON строго запрещен) |
| `pkg_coins_starter` | Starter Coin Pack | Валюта | 500 FvH Coin | 50 ⭐ XTR (или 0.3 TON) |
| `pkg_coins_pro` | Pro Coin Pack | Валюта | 1,200 FvH Coin | 100 ⭐ XTR (или 0.6 TON) |
| `pkg_coins_elite` | Elite Coin Pack | Валюта | 2,800 FvH Coin | 200 ⭐ XTR (или 1.2 TON) |
| `pkg_coins_champ` | Champion Pack | Валюта | 6,500 FvH Coin | 450 ⭐ XTR (или 2.5 TON) |
| `pkg_coins_legend` | Legend Vault | Валюта | 15,000 FvH Coin | 950 ⭐ XTR (или 5.0 TON) |

> 🔒 **Правило безопасности цифровых товаров (Digital Goods Policy):**
> Battle Pass является внутриигровым цифровым продуктом, продаваемым внутри Telegram Mini App. По официальным требованиям Telegram и политике App Store / Google Play, для Battle Pass **разрешены исключительно Telegram Stars (XTR)**.
> Опция оплаты TON для Battle Pass полностью удалена из интерфейса, а на бэкенде запрос `/api/ton/create-payload` с `productId: 'battlepass_premium'` возвращает ошибку `400 digital_good_ton_prohibited`.

---

## 5. Жизненный цикл заказа и обработка Webhook от Telegram API

Заказы контролируются строго бэкендом и имеют следующие серверные статусы:
- `pending` — счет создан, ожидает оплаты в интерфейсе Telegram Stars.
- `payment_processing` — пользователь подтвердил оплату, идет проверка `pre_checkout_query`.
- `paid` — получено и валидировано серверное обновление `successful_payment`, VIP статус активирован.
- `failed` — ошибка валидации суммы, валюты или несоответствие пользователя.
- `cancelled` — пользователь закрыл окно оплаты без списания Stars.

### A. Pre-Checkout Query (`pre_checkout_query`)
Telegram запрашивает у сервера подтверждение перед списанием Stars. Сервер проверяет:
1. Заказ существует в `state.starsInvoices` со статусом `pending`.
2. Валюта строго равна `XTR`.
3. Сумма в точности совпадает со стоимостью товара (`starsAmount`).
4. При совпадении вызывает Telegram API `answerPreCheckoutQuery` с `ok: true`.

### B. Successful Payment (`successful_payment`)
Telegram отправляет вебхук об успешном платеже. Сервер выполняет:
1. **Проверка идемпотентности:** `telegram_payment_charge_id` проверяется по словарю `processedChargeIds`. Повторные или продублированные вызовы не приводят к повторному зачислению.
2. **Проверка валюты и суммы:** Защита от фальсификации (tampering).
3. **Проверка пользователя:** Платеж должен принадлежать авторизованному Telegram ID.
4. **Перевод заказа в статус `paid`** и фиксация времени `paidAt`.
5. **Авторитетная активация:** `creditPurchasedProduct(playerId, productId, 'stars')` переводит `player.battlePass.isPremium = true`.
6. **Запись в неизменяемый финансовый журнал** `paymentsLedger`.

### C. Клиентский опрос статуса (`POST /api/stars/check-order`)
Кнопка «Проверить оплату» и автоматический опрос после закрытия окна Telegram Native Pay вызывают эндпоинт `/api/stars/check-order`. Данный эндпоинт является **read-only** (только для чтения): он никогда сам не меняет статус заказа и не активирует Premium. Активация происходит **только** на основе проверенного вебхука от Telegram.

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
