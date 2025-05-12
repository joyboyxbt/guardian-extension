// == Guardian Background Script ==
// Monitors network requests from an untrusted extension and logs events.

// Open the setup page on first install
chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') {
    chrome.runtime.openOptionsPage();
  }
});

// Load the guarded extension ID from storage
let badExtId = '';
chrome.storage.local.get('badExtId', data => {
  if (typeof data.badExtId === 'string') {
    badExtId = data.badExtId;
  }
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.badExtId) {
    badExtId = changes.badExtId.newValue;
  }
});
// Allowed origins list (whitelist)
const DEFAULT_ALLOWED_ORIGINS = ['https://your.trusted.site/*'];
let allowedOrigins = DEFAULT_ALLOWED_ORIGINS;

// Load allowedOrigins from storage on startup
chrome.storage.local.get('allowedOrigins', data => {
  if (Array.isArray(data.allowedOrigins)) {
    allowedOrigins = data.allowedOrigins;
  }
});

// Update allowedOrigins and blacklistOrigins when storage changes
let blacklistOrigins = [];
chrome.storage.local.get('blacklistOrigins', data => {
  if (Array.isArray(data.blacklistOrigins)) {
    blacklistOrigins = data.blacklistOrigins;
  }
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    if (changes.allowedOrigins) {
      allowedOrigins = changes.allowedOrigins.newValue;
    }
    if (changes.blacklistOrigins) {
      blacklistOrigins = changes.blacklistOrigins.newValue;
    }
  }
});

/** Log network or credential events */
function logEvent(url, status) {
  const entry = { url, status, timestamp: Date.now() };
  chrome.storage.local.get('requestLog', data => {
    const log = Array.isArray(data.requestLog) ? data.requestLog : [];
    log.unshift(entry);
    if (log.length > 200) log.splice(200);
    chrome.storage.local.set({ requestLog: log });
  });
}

// Intercept requests from the untrusted extension
chrome.webRequest.onBeforeRequest.addListener(details => {
  if (!badExtId || details.initiator !== `chrome-extension://${badExtId}`) {
    return;
  }
  // Check blacklist first
  const isBlacklisted = blacklistOrigins.some(pattern => {
    const regex = new RegExp('^' + pattern.split('*').join('.*') + '$');
    return regex.test(details.url);
  });
  if (isBlacklisted) {
    logEvent(details.url, 'blacklisted');
    chrome.management.setEnabled(badExtId, false, () => {
      console.warn(`[Guardian] Disabled extension ${badExtId} (blacklist match):`, details.url);
    });
    return { cancel: true };
  }
  // Then check whitelist
  const isAllowed = allowedOrigins.some(pattern => {
    const regex = new RegExp('^' + pattern.split('*').join('.*') + '$');
    return regex.test(details.url);
  });
  logEvent(details.url, isAllowed ? 'allowed' : 'blocked');
  if (!isAllowed) {
    chrome.management.setEnabled(badExtId, false, () => {
      console.warn(`[Guardian] Disabled extension ${badExtId} (blocked request):`, details.url);
    });
    return { cancel: true };
  }
}, { urls: ['<all_urls>'] }, ['blocking']);

// Listen for credential input events from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'disableForCredentials') {
    logEvent(message.url, 'credentials');
    chrome.management.setEnabled(BAD_EXT_ID, false, () => {
      console.warn(`[Guardian] Disabled extension ${BAD_EXT_ID} (credentials entry) on:`, message.url);
    });
  }
});