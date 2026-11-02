const https = require('https');

const PROFILE_TEXTS = {
  name: {
    default: 'FOOTY vs HOOPS ⚽🏀',
    en: 'FOOTY vs HOOPS ⚽🏀',
    ru: 'FOOTY vs HOOPS ⚽🏀'
  },
  shortDescription: {
    default: 'A fast-paced 1v1 arcade sports game on Telegram! Play Football & Basketball against AI in 2 arenas. ⚽🏀',
    en: 'A fast-paced 1v1 arcade sports game on Telegram! Play Football & Basketball against AI in 2 arenas. ⚽🏀',
    ru: 'Быстрая 1v1 спортивная аркада в Telegram! Футбол и баскетбол против ИИ на 2 стандартных аренах. ⚽🏀'
  },
  description: {
    default:
`⚽🏀 Welcome to FOOTY vs HOOPS!

A fast-paced 1v1 arcade sports game right inside Telegram!

⚡ Game Features:
• ⚽ Football mode
• 🏀 Basketball mode
• 🤖 1v1 arcade gameplay against AI
• 🏟️ 2 standard arenas (Classic Pitch & Street Court)
• 👕 Locker Room: Authentic kits & balls

Choose your sport and jump into the game!

Tap "Play" below to kick off!`,
    en:
`⚽🏀 Welcome to FOOTY vs HOOPS!

A fast-paced 1v1 arcade sports game right inside Telegram!

⚡ Game Features:
• ⚽ Football mode
• 🏀 Basketball mode
• 🤖 1v1 arcade gameplay against AI
• 🏟️ 2 standard arenas (Classic Pitch & Street Court)
• 👕 Locker Room: Authentic kits & balls

Choose your sport and jump into the game!

Tap "Play" below to kick off!`,
    ru:
`⚽🏀 Добро пожаловать в FOOTY vs HOOPS!

Быстрая 1v1 спортивная аркада прямо в Telegram!

⚡ Текущие возможности игры:
• ⚽ Режим футбола
• 🏀 Режим баскетбола
• 🤖 1v1 аркадные матчи против ИИ
• 🏟️ 2 стандартные арены
• 👕 Гардероб с формой и мячами

Выбирайте спорт и выходите на поле!

Нажмите «Играть» ниже, чтобы начать!`
  },
  commands: {
    default: [
      { command: 'play', description: '⚽ Play FOOTY vs HOOPS' },
      { command: 'start', description: '🚀 Main menu & launch game' },
      { command: 'help', description: 'ℹ️ Game rules & how to play' }
    ],
    en: [
      { command: 'play', description: '⚽ Play FOOTY vs HOOPS' },
      { command: 'start', description: '🚀 Main menu & launch game' },
      { command: 'help', description: 'ℹ️ Game rules & how to play' }
    ],
    ru: [
      { command: 'play', description: '⚽ Играть в FOOTY vs HOOPS' },
      { command: 'start', description: '🚀 Главное меню и запуск игры' },
      { command: 'help', description: 'ℹ️ Как играть и возможности игры' }
    ]
  }
};

function sanitizeSecrets(text) {
  if (typeof text !== 'string') text = String(text || '');
  return text.replace(/[0-9]+:[A-Za-z0-9_-]+/g, '[REDACTED_TOKEN]');
}

function validateBotToken(token) {
  if (typeof token !== 'string' || !token.trim()) {
    throw new Error('TELEGRAM_BOT_TOKEN environment variable is required.');
  }
  const clean = token.trim();
  if (!/^[0-9]+:[A-Za-z0-9_-]+$/.test(clean)) {
    throw new Error('TELEGRAM_BOT_TOKEN has an invalid format. Expected format: <id>:<secret_hash>');
  }
  return clean;
}

function buildApiPlan(miniAppUrl = 'https://footy-vs-hoops.onrender.com/') {
  return [
    { step: 1, method: 'getMe', params: {}, description: 'Bot identity check' },
    { step: 2, method: 'setMyName', params: { name: PROFILE_TEXTS.name.default }, description: 'Set bot name (default)' },
    { step: 2, method: 'setMyName', params: { name: PROFILE_TEXTS.name.en, language_code: 'en' }, description: 'Set bot name (en)' },
    { step: 2, method: 'setMyName', params: { name: PROFILE_TEXTS.name.ru, language_code: 'ru' }, description: 'Set bot name (ru)' },
    { step: 3, method: 'setMyShortDescription', params: { short_description: PROFILE_TEXTS.shortDescription.default }, description: 'Set short description (default)' },
    { step: 3, method: 'setMyShortDescription', params: { short_description: PROFILE_TEXTS.shortDescription.en, language_code: 'en' }, description: 'Set short description (en)' },
    { step: 3, method: 'setMyShortDescription', params: { short_description: PROFILE_TEXTS.shortDescription.ru, language_code: 'ru' }, description: 'Set short description (ru)' },
    { step: 4, method: 'setMyDescription', params: { description: PROFILE_TEXTS.description.default }, description: 'Set description (default)' },
    { step: 4, method: 'setMyDescription', params: { description: PROFILE_TEXTS.description.en, language_code: 'en' }, description: 'Set description (en)' },
    { step: 4, method: 'setMyDescription', params: { description: PROFILE_TEXTS.description.ru, language_code: 'ru' }, description: 'Set description (ru)' },
    {
      step: 5,
      method: 'setChatMenuButton',
      params: {
        menu_button: {
          type: 'web_app',
          text: 'Play ⚽🏀',
          web_app: { url: miniAppUrl }
        }
      },
      description: 'Configure Mini App launch menu button'
    },
    { step: 6, method: 'setMyCommands', params: { commands: PROFILE_TEXTS.commands.default }, description: 'Set commands (default)' },
    { step: 6, method: 'setMyCommands', params: { commands: PROFILE_TEXTS.commands.en, language_code: 'en' }, description: 'Set commands (en)' },
    { step: 6, method: 'setMyCommands', params: { commands: PROFILE_TEXTS.commands.ru, language_code: 'ru' }, description: 'Set commands (ru)' },
    { step: 7, method: 'getMyName', params: {}, description: 'Verify configured name' },
    { step: 7, method: 'getMyShortDescription', params: {}, description: 'Verify configured short description' },
    { step: 7, method: 'getMyDescription', params: {}, description: 'Verify configured description' },
    { step: 7, method: 'getChatMenuButton', params: {}, description: 'Verify configured menu button' }
  ];
}

function callApi(method, body = {}, botToken = '') {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${botToken}/${method}`,
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

async function run(options = {}) {
  const isDryRun = Boolean(options.dryRun || process.env.FVH_DRY_RUN === '1');
  const miniAppUrl = options.miniAppUrl || process.env.TELEGRAM_MINI_APP_URL || 'https://footy-vs-hoops.onrender.com/';
  const throwOnError = options.throwOnError !== false;
  
  let botToken = '';
  if (!isDryRun) {
    const rawToken = options.botToken || process.env.TELEGRAM_BOT_TOKEN;
    botToken = validateBotToken(rawToken);
  } else {
    botToken = options.botToken || process.env.TELEGRAM_BOT_TOKEN || '000000000:DRY_RUN_MOCK_TOKEN';
  }

  const dryRunLog = [];
  const executeApi = async (method, params = {}) => {
    if (isDryRun) {
      dryRunLog.push({ method, params });
      if (options.mockThrowMethod === method) {
        throw new Error(`Simulated network failure on ${method}`);
      }
      if (options.mockFailureMethod === method) {
        return { ok: false, error_code: 400, description: `Bad Request: simulated failure on ${method}` };
      }
      if (method === 'getMe') {
        return { ok: true, result: { id: 123456789, is_bot: true, first_name: 'FOOTY vs HOOPS', username: 'footy_vs_hoops_bot' } };
      }
      if (method === 'getMyName') {
        return { ok: true, result: { name: PROFILE_TEXTS.name.default } };
      }
      if (method === 'getMyShortDescription') {
        return { ok: true, result: { short_description: PROFILE_TEXTS.shortDescription.default } };
      }
      if (method === 'getMyDescription') {
        return { ok: true, result: { description: PROFILE_TEXTS.description.default } };
      }
      if (method === 'getChatMenuButton') {
        return { ok: true, result: { type: 'web_app', text: 'Play ⚽🏀', web_app: { url: miniAppUrl } } };
      }
      return { ok: true, result: true };
    }
    return callApi(method, params, botToken);
  };

  const maskedToken = botToken.length > 15 ? (botToken.slice(0, 10) + '...' + botToken.slice(-5)) : '***';
  console.log('=== Configuring Telegram Bot Profile for FOOTY vs HOOPS ===');
  console.log('Mode:', isDryRun ? 'DRY-RUN (No Telegram Bot API network requests)' : 'LIVE EXECUTION');
  console.log('Bot Token:', maskedToken);
  console.log('Mini App URL:', miniAppUrl);

  const plan = buildApiPlan(miniAppUrl);
  const results = {
    name: {},
    shortDescription: {},
    description: {},
    menuButton: null,
    commands: {},
    verification: {}
  };

  let resShortRu = null;
  let resShortEn = null;
  let resShortDefault = null;

  for (let i = 0; i < plan.length; i++) {
    const item = plan[i];
    let res;
    try {
      res = await executeApi(item.method, item.params);
    } catch (err) {
      const sanitizedErrMsg = sanitizeSecrets(err && err.message ? err.message : String(err));
      console.error(`\n❌ Step [${item.step}/7] ${item.method} THREW ERROR: ${sanitizedErrMsg}`);
      if (throwOnError) {
        const failureErr = new Error(`Telegram API call ${item.method} failed at step [${item.step}/7]: ${sanitizedErrMsg}`);
        failureErr.method = item.method;
        failureErr.step = item.step;
        failureErr.details = sanitizedErrMsg;
        throw failureErr;
      }
      return {
        ok: false,
        failedMethod: item.method,
        failedStep: item.step,
        error: sanitizedErrMsg,
        dryRun: isDryRun,
        recordedCalls: dryRunLog,
        results
      };
    }

    if (!res || res.ok !== true) {
      const safeReason = sanitizeSecrets(res && (res.description || res.error) ? (res.description || res.error) : 'API returned ok=false');
      console.error(`\n❌ Step [${item.step}/7] ${item.method} FAILED: ${safeReason}`);
      if (throwOnError) {
        const failureErr = new Error(`Telegram API call ${item.method} failed at step [${item.step}/7]: ${safeReason}`);
        failureErr.method = item.method;
        failureErr.step = item.step;
        failureErr.details = safeReason;
        throw failureErr;
      }
      return {
        ok: false,
        failedMethod: item.method,
        failedStep: item.step,
        error: safeReason,
        dryRun: isDryRun,
        recordedCalls: dryRunLog,
        results
      };
    }

    // Populate structured result mapping
    const langKey = item.params.language_code || 'default';
    if (item.method === 'getMe') {
      const botUsername = (res.result && res.result.username) ? res.result.username : 'unknown';
      console.log('\n[1/7] Bot Identity (@' + botUsername + '): OK');
      results.me = res;
    } else if (item.method === 'setMyName') {
      results.name[langKey] = res;
      if (langKey === 'ru') {
        console.log('[2/7] setMyName:', {
          default: Boolean(results.name.default && results.name.default.ok),
          en: Boolean(results.name.en && results.name.en.ok),
          ru: Boolean(results.name.ru && results.name.ru.ok)
        });
      }
    } else if (item.method === 'setMyShortDescription') {
      results.shortDescription[langKey] = res;
      if (langKey === 'default') resShortDefault = res;
      if (langKey === 'en') resShortEn = res;
      if (langKey === 'ru') {
        resShortRu = res;
        console.log('[3/7] setMyShortDescription:', {
          default: Boolean(resShortDefault && resShortDefault.ok),
          en: Boolean(resShortEn && resShortEn.ok),
          ru: Boolean(resShortRu && resShortRu.ok)
        });
      }
    } else if (item.method === 'setMyDescription') {
      results.description[langKey] = res;
      if (langKey === 'ru') {
        console.log('[4/7] setMyDescription:', {
          default: Boolean(results.description.default && results.description.default.ok),
          en: Boolean(results.description.en && results.description.en.ok),
          ru: Boolean(results.description.ru && results.description.ru.ok)
        });
      }
    } else if (item.method === 'setChatMenuButton') {
      results.menuButton = res;
      console.log('[5/7] setChatMenuButton: OK');
    } else if (item.method === 'setMyCommands') {
      results.commands[langKey] = res;
      if (langKey === 'ru') {
        console.log('[6/7] setMyCommands:', {
          default: Boolean(results.commands.default && results.commands.default.ok),
          en: Boolean(results.commands.en && results.commands.en.ok),
          ru: Boolean(results.commands.ru && results.commands.ru.ok)
        });
      }
    } else if (item.method.startsWith('get')) {
      const propKey = item.method.replace(/^get(Chat)?/, '').toLowerCase();
      results.verification[propKey] = res;
      if (item.method === 'getChatMenuButton') {
        console.log('\n[7/7] === Configured Profile Verification ===');
        console.log('Configured Name:', results.verification.myname ? results.verification.myname.result : undefined);
        console.log('Configured Short Description:', results.verification.myshortdescription ? results.verification.myshortdescription.result : undefined);
        const descLen = (results.verification.mydescription && results.verification.mydescription.result && typeof results.verification.mydescription.result.description === 'string')
          ? results.verification.mydescription.result.description.length
          : 0;
        console.log('Configured Description length:', descLen);
        console.log('Configured Menu Button:', results.verification.menubutton ? results.verification.menubutton.result : undefined);
      }
    }
  }

  console.log('\n✅ Profile setup completed successfully!');

  return {
    ok: true,
    dryRun: isDryRun,
    recordedCalls: dryRunLog,
    results
  };
}

if (require.main === module) {
  run().catch(err => {
    console.error('Failed to configure bot profile:', sanitizeSecrets(err.message || err));
    process.exit(1);
  });
}

module.exports = {
  PROFILE_TEXTS,
  validateBotToken,
  buildApiPlan,
  callApi,
  sanitizeSecrets,
  run
};
