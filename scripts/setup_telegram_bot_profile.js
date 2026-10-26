const https = require('https');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error('Error: TELEGRAM_BOT_TOKEN environment variable is required.');
  process.exit(1);
}
const MINI_APP_URL = process.env.TELEGRAM_MINI_APP_URL || 'https://footy-vs-hoops.onrender.com/';

function callApi(method, body = {}) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${BOT_TOKEN}/${method}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ ok: false, error: data });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout for ' + method));
    });
    req.write(payload);
    req.end();
  });
}

async function run() {
  console.log('=== Configuring Telegram Bot Profile for FOOTY vs HOOPS ===');
  console.log('Bot Token:', BOT_TOKEN.slice(0, 10) + '...' + BOT_TOKEN.slice(-5));
  console.log('Mini App URL:', MINI_APP_URL);

  // 1. Verify Bot Token and info
  const me = await callApi('getMe');
  console.log('\n[1/7] Bot Identity (@' + (me.result ? me.result.username : 'unknown') + '):', me.ok ? 'OK' : me);

  // 2. Set Bot Name (Default, RU, EN)
  const nameDefault = await callApi('setMyName', { name: 'FOOTY vs HOOPS ⚽🏀' });
  const nameRu = await callApi('setMyName', { name: 'FOOTY vs HOOPS ⚽🏀', language_code: 'ru' });
  const nameEn = await callApi('setMyName', { name: 'FOOTY vs HOOPS ⚽🏀', language_code: 'en' });
  console.log('[2/7] setMyName:', { default: nameDefault.ok, ru: nameRu.ok, en: nameEn.ok });

  // 3. Set Short Description (Preview card & sharing, max 120 chars)
  const shortRu = 'Футбольно-баскетбольная 1v1 аркада в Telegram с бустами, гардеробом и онлайн-матчами с друзьями! ⚽🏀';
  const shortEn = '1v1 Football vs Basketball arcade game in Telegram with boosts, custom gear & online multiplayer! ⚽🏀';

  const resShortDefault = await callApi('setMyShortDescription', { short_description: shortRu });
  const resShortRu = await callApi('setMyShortDescription', { short_description: shortRu, language_code: 'ru' });
  const resShortEn = await callApi('setMyShortDescription', { short_description: shortEn, language_code: 'en' });
  console.log('[3/7] setMyShortDescription:', { default: resShortDefault.ok, ru: resShortRu.ok, en: resShortEn.ok });

  // 4. Set Description (Full introduction screen before clicking Start, max 512 chars)
  const descRu = 
`⚽🏀 Добро пожаловать в FOOTY vs HOOPS!

FOOTY vs HOOPS — захватывающая спортивная 1v1 аркада прямо в Telegram!

⚡ Особенности игры:
• ⚽ Footy & 🏀 Hoops — два соревновательных режима
• 🎮 Реальный онлайн 1v1 мультиплеер — матчи с друзьями
• 🚀 8 тактических бустов (Супер-удар, Овердрайв, Магнит, Щит)
• 👕 Гардероб: 68 предметов формы, скинов и кастомизации
• 🏆 10 уникальных 3D стадионов и интерактивных арен
• 🎟 Battle Pass, квесты и награды

Нажмите «Играть» или кнопку меню ниже, чтобы начать матч!`;

  const descEn = 
`⚽🏀 Welcome to FOOTY vs HOOPS!

FOOTY vs HOOPS is a fast-paced 1v1 sports arcade game right inside Telegram!

⚡ Game Features:
• ⚽ Footy & 🏀 Hoops — two action-packed sport modes
• 🎮 Real-time 1v1 online multiplayer — challenge friends
• 🚀 8 tactical boosts (Super Strike, Overdrive, Magnet, Shield)
• 👕 Locker Room: 68 cosmetic uniforms, skins, and gear
• 🏆 10 detailed 3D stadiums & interactive arena worlds
• 🎟 Battle Pass, daily quests, and rewards

Tap "Play" or use the menu button below to kick off!`;

  const resDescDefault = await callApi('setMyDescription', { description: descRu });
  const resDescRu = await callApi('setMyDescription', { description: descRu, language_code: 'ru' });
  const resDescEn = await callApi('setMyDescription', { description: descEn, language_code: 'en' });
  console.log('[4/7] setMyDescription:', { default: resDescDefault.ok, ru: resDescRu.ok, en: resDescEn.ok });

  // 5. Set Menu Button (Bottom left button next to text input)
  const menuRes = await callApi('setChatMenuButton', {
    menu_button: {
      type: 'web_app',
      text: 'Играть ⚽🏀',
      web_app: {
        url: MINI_APP_URL
      }
    }
  });
  console.log('[5/7] setChatMenuButton:', menuRes.ok ? 'OK' : menuRes);

  // 6. Set Commands
  const commandsRu = [
    { command: 'play', description: '⚽ Играть в FOOTY vs HOOPS' },
    { command: 'start', description: '🚀 Главное меню и запуск игры' },
    { command: 'help', description: 'ℹ️ Как играть и возможности игры' }
  ];
  const commandsEn = [
    { command: 'play', description: '⚽ Play FOOTY vs HOOPS' },
    { command: 'start', description: '🚀 Main menu & launch game' },
    { command: 'help', description: 'ℹ️ Game rules & how to play' }
  ];

  const resCmdDefault = await callApi('setMyCommands', { commands: commandsRu });
  const resCmdRu = await callApi('setMyCommands', { commands: commandsRu, language_code: 'ru' });
  const resCmdEn = await callApi('setMyCommands', { commands: commandsEn, language_code: 'en' });
  console.log('[6/7] setMyCommands:', { default: resCmdDefault.ok, ru: resCmdRu.ok, en: resCmdEn.ok });

  // 7. Verification of all profile components
  console.log('\n[7/7] === Fetching configured profile ===');
  const finalName = await callApi('getMyName', { language_code: 'ru' });
  const finalShort = await callApi('getMyShortDescription', { language_code: 'ru' });
  const finalDesc = await callApi('getMyDescription', { language_code: 'ru' });
  const finalMenu = await callApi('getChatMenuButton');
  const finalCmds = await callApi('getMyCommands', { language_code: 'ru' });

  console.log('Configured Name:', finalName.result);
  console.log('Configured Short Description:', finalShort.result);
  console.log('Configured Description length:', finalDesc.result ? finalDesc.result.description.length : 0);
  console.log('Configured Menu Button:', finalMenu.result);
  console.log('Configured Commands:', finalCmds.result);

  console.log('\n✅ Profile setup completed successfully!');
}

run().catch(err => {
  console.error('Failed to configure bot profile:', err);
  process.exit(1);
});
