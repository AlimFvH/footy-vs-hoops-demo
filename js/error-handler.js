(function () {
  'use strict';

  function redactSecrets(str) {
    if (typeof str !== 'string') return '';
    return str
      // Redact bot token pattern: 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ...
      .replace(/\b\d{8,12}:[A-Za-z0-9_-]{30,50}\b/g, '[REDACTED_BOT_TOKEN]')
      // Redact key-value secrets
      .replace(/([?&]|(?:^|\s))(token|secret|admin_secret|hash|initData)=([^&\s'"]+)/gi, '$1$2=[REDACTED]')
      // Redact 32-64 hex strings (e.g. initData hashes, sha256)
      .replace(/\b[a-f0-9]{32,64}\b/gi, '[REDACTED_HASH]')
      .slice(0, 300);
  }

  function isAppInitialized() {
    return Boolean(
      (typeof window !== 'undefined' && window.__fvh && window.__fvh.store) ||
      (typeof window !== 'undefined' && window.App) ||
      (typeof document !== 'undefined' && document.getElementById('ui') && document.getElementById('ui').children.length > 0)
    );
  }

  function getModuleBasename(filename) {
    if (!filename || typeof filename !== 'string') return 'unknown';
    try {
      var parts = filename.split(/[\\/]/);
      return parts[parts.length - 1].split('?')[0] || 'unknown';
    } catch (_) {
      return 'unknown';
    }
  }

  function isExternalOrGenericScriptError(msg, filename) {
    var cleanMsg = (msg || '').trim().toLowerCase();
    // Browser CORS-masked script error
    if (cleanMsg === 'script error' || cleanMsg === 'script error.') return true;
    if (filename) {
      var lowerFile = filename.toLowerCase();
      if (lowerFile.includes('telegram.org') || lowerFile.includes('telegram-web-app') || lowerFile.includes('chrome-extension://')) {
        return true;
      }
    }
    return false;
  }

  function showFatalStartupError(diag) {
    var f = document.getElementById('fatal');
    if (!f) return;
    f.hidden = false;
    f.innerHTML = '';

    var title = document.createElement('div');
    title.style.fontWeight = '800';
    title.style.fontSize = '18px';
    title.style.color = '#ef4444';
    title.textContent = '⚠️ FOOTY vs HOOPS could not start';

    var diagBox = document.createElement('div');
    diagBox.style.fontSize = '12px';
    diagBox.style.color = '#94a3b8';
    diagBox.style.background = 'rgba(255,255,255,0.05)';
    diagBox.style.padding = '10px 14px';
    diagBox.style.borderRadius = '8px';
    diagBox.style.maxWidth = '420px';
    diagBox.style.wordBreak = 'break-word';
    diagBox.style.fontFamily = 'monospace';
    diagBox.style.lineHeight = '1.45';

    var modText = diag.module ? ('Module: ' + redactSecrets(diag.module) + (diag.lineno ? (':' + diag.lineno) : '')) : '';
    var detailText = diag.message ? ('Error: ' + redactSecrets(diag.message)) : '';
    diagBox.textContent = [modText, detailText].filter(Boolean).join('\n') || 'Unexpected initialization error.';

    var reloadBtn = document.createElement('button');
    reloadBtn.className = 'btn primary';
    reloadBtn.type = 'button';
    reloadBtn.style.padding = '10px 20px';
    reloadBtn.style.marginTop = '8px';
    reloadBtn.textContent = '🔄 Reload Game';
    reloadBtn.onclick = function () {
      if (typeof window !== 'undefined' && window.location) {
        window.location.reload();
      }
    };

    f.appendChild(title);
    f.appendChild(diagBox);
    f.appendChild(reloadBtn);
  }

  function handleError(eventOrMsg, source, lineno, colno, error) {
    var rawMsg = '';
    var rawFile = source || '';
    var rawLine = lineno || 0;

    if (typeof eventOrMsg === 'string') {
      rawMsg = eventOrMsg;
    } else if (eventOrMsg && typeof eventOrMsg === 'object') {
      rawMsg = eventOrMsg.message || (eventOrMsg.error && eventOrMsg.error.message) || String(eventOrMsg);
      if (!rawFile && eventOrMsg.filename) rawFile = eventOrMsg.filename;
      if (!rawLine && eventOrMsg.lineno) rawLine = eventOrMsg.lineno;
    }

    var mod = getModuleBasename(rawFile);
    var isExt = isExternalOrGenericScriptError(rawMsg, rawFile);

    // If app is already booted, or if this is a cross-origin / third-party script error, do NOT crash the game
    if (isAppInitialized() || isExt) {
      console.warn('[FVH Diagnostics] Ignored non-fatal script error:', {
        module: mod,
        line: rawLine,
        message: redactSecrets(rawMsg)
      });
      return;
    }

    // Genuine fatal core startup exception
    showFatalStartupError({
      module: mod,
      lineno: rawLine,
      message: rawMsg
    });
  }

  window.addEventListener('error', function (e) {
    handleError(e.message, e.filename, e.lineno, e.colno, e.error);
  });

  window.addEventListener('unhandledrejection', function (e) {
    var reason = e.reason;
    var msg = (reason && (reason.message || reason.stack)) || String(reason || 'Unhandled Promise Rejection');
    var isExt = isExternalOrGenericScriptError(msg, '');
    if (isAppInitialized() || isExt) {
      console.warn('[FVH Diagnostics] Ignored non-fatal promise rejection:', redactSecrets(msg));
      return;
    }
    showFatalStartupError({
      module: 'promise',
      lineno: 0,
      message: msg
    });
  });

  // Expose sanitized helpers for diagnostics & unit testing
  if (typeof window !== 'undefined') {
    window.__fvhErrorHandler = {
      redactSecrets: redactSecrets,
      handleError: handleError,
      isExternalOrGenericScriptError: isExternalOrGenericScriptError,
      isAppInitialized: isAppInitialized,
      showFatalStartupError: showFatalStartupError
    };
  }
})();
