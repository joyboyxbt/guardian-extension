document.addEventListener('DOMContentLoaded', () => {
  const extIdKey = 'badExtId';
  const modeKey = 'mode';
  const originsKey = 'allowedOrigins';
  const blacklistKey = 'blacklistOrigins';
  const logKey = 'requestLog';

  // UI Elements
  const extIdInput = document.getElementById('ext-id-input');
  const modePreset = document.getElementById('mode-preset');
  const modeCustom = document.getElementById('mode-custom');
  const presetSection = document.getElementById('preset-section');
  const customSection = document.getElementById('custom-section');
  const origListEl = document.getElementById('allowed-origins-list');
  const newOriginInput = document.getElementById('new-origin-input');
  const addOriginButton = document.getElementById('add-origin-button');
  const blacklistListEl = document.getElementById('blacklist-origins-list');
  const newBlacklistInput = document.getElementById('new-blacklist-input');
  const addBlacklistButton = document.getElementById('add-blacklist-button');
  const logListEl = document.getElementById('request-log-list');
  const clearLogButton = document.getElementById('clear-log-button');
  const allowAllButton = document.getElementById('allow-all-blocked-button');

  // Load and save extension ID
  chrome.storage.local.get(extIdKey, data => {
    extIdInput.value = data[extIdKey] || '';
  });
  extIdInput.addEventListener('change', () => {
    chrome.storage.local.set({ [extIdKey]: extIdInput.value.trim() });
  });

  // Mode selection UI
  function setModeUI(mode) {
    presetSection.style.display = mode === 'preset' ? 'block' : 'none';
    customSection.style.display = mode === 'custom' ? 'block' : 'none';
  }
  chrome.storage.local.get(modeKey, data => {
    const mode = data[modeKey] || 'custom';
    if (mode === 'preset') modePreset.checked = true;
    else modeCustom.checked = true;
    setModeUI(mode);
  });
  modePreset.addEventListener('change', () => {
    if (modePreset.checked) chrome.storage.local.set({ [modeKey]: 'preset' }, () => setModeUI('preset'));
  });
  modeCustom.addEventListener('change', () => {
    if (modeCustom.checked) chrome.storage.local.set({ [modeKey]: 'custom' }, () => setModeUI('custom'));
  });

  // Blacklist functions
  function renderBlacklist(list) {
    blacklistListEl.innerHTML = '';
    list.forEach((item, idx) => {
      const li = document.createElement('li');
      li.textContent = item;
      const delBtn = document.createElement('button');
      delBtn.textContent = '✕';
      delBtn.title = 'Remove';
      delBtn.style.marginLeft = '5px';
      delBtn.addEventListener('click', () => {
        list.splice(idx, 1);
        saveBlacklist(list);
      });
      li.appendChild(delBtn);
      blacklistListEl.appendChild(li);
    });
  }
  function loadBlacklist() {
    chrome.storage.local.get(blacklistKey, data => {
      const list = Array.isArray(data[blacklistKey]) ? data[blacklistKey] : [];
      renderBlacklist(list);
    });
  }
  function saveBlacklist(list) {
    chrome.storage.local.set({ [blacklistKey]: list }, () => {
      loadBlacklist();
    });
  }
  addBlacklistButton.addEventListener('click', () => {
    const val = newBlacklistInput.value.trim();
    if (!val) return;
    chrome.storage.local.get(blacklistKey, data => {
      const list = Array.isArray(data[blacklistKey]) ? data[blacklistKey] : [];
      list.push(val);
      saveBlacklist(list);
      newBlacklistInput.value = '';
    });
  });
  
  // Render the allowlist
  function renderOrigins(origins) {
    origListEl.innerHTML = '';
    origins.forEach((origin, idx) => {
      const li = document.createElement('li');
      li.textContent = origin;
      const delBtn = document.createElement('button');
      delBtn.textContent = '✕';
      delBtn.title = 'Remove';
      delBtn.style.marginLeft = '5px';
      delBtn.addEventListener('click', () => {
        origins.splice(idx, 1);
        saveOrigins(origins);
      });
      li.appendChild(delBtn);
      origListEl.appendChild(li);
    });
  }

  // Load allowlist from storage
  function loadOrigins() {
    chrome.storage.local.get(originsKey, data => {
      const origins = Array.isArray(data[originsKey]) ? data[originsKey] : [];
      renderOrigins(origins);
    });
  }

  // Save allowlist to storage
  function saveOrigins(origins) {
    chrome.storage.local.set({ [originsKey]: origins }, () => {
      loadOrigins();
    });
  }

  // Add a new allowlist entry
  addOriginButton.addEventListener('click', () => {
    const val = newOriginInput.value.trim();
    if (!val) return;
    chrome.storage.local.get(originsKey, data => {
      const origins = Array.isArray(data[originsKey]) ? data[originsKey] : [];
      origins.push(val);
      saveOrigins(origins);
      newOriginInput.value = '';
    });
  });

  // Render the request log
  function renderLogs(logs) {
    logListEl.innerHTML = '';
    logs.forEach(entry => {
      const li = document.createElement('li');
      const date = new Date(entry.timestamp).toLocaleString();
      li.textContent = `[${date}] (${entry.status}) ${entry.url}`;
      logListEl.appendChild(li);
    });
  }

  // Load request log from storage
  function loadLogs() {
    chrome.storage.local.get(logKey, data => {
      const logs = Array.isArray(data[logKey]) ? data[logKey] : [];
      renderLogs(logs);
    });
  }

  // Clear request log
  clearLogButton.addEventListener('click', () => {
    chrome.storage.local.set({ [logKey]: [] }, () => {
      loadLogs();
    });
  });
  
  // Allow all blocked requests by adding their origins to allowlist
  allowAllButton.addEventListener('click', () => {
    chrome.storage.local.get([originsKey, logKey], data => {
      const existing = Array.isArray(data[originsKey]) ? data[originsKey] : [];
      const logs = Array.isArray(data[logKey]) ? data[logKey] : [];
      const blockedUrls = logs.filter(e => e.status === 'blocked').map(e => e.url);
      const newSet = new Set(existing);
      blockedUrls.forEach(url => {
        try {
          const u = new URL(url);
          newSet.add(u.origin + '/*');
        } catch (e) {}
      });
      saveOrigins(Array.from(newSet));
    });
  });

  // Load initial data
  loadOrigins();
  loadLogs();
  // Load blacklist (new feature)
  loadBlacklist();
  // Initialize extension ID and mode UI
  // (Extension ID and mode handlers set above)
});
});