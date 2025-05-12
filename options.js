document.addEventListener('DOMContentLoaded', () => {
  const extIdKey = 'badExtId';
  const modeKey = 'mode';
  const originsKey = 'allowedOrigins';
  const blacklistKey = 'blacklistOrigins';

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
  const saveButton = document.getElementById('save-button');

  // Load extension ID
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

  // Allowlist functions
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
  function loadOrigins() {
    chrome.storage.local.get(originsKey, data => {
      const origins = Array.isArray(data[originsKey]) ? data[originsKey] : [];
      renderOrigins(origins);
    });
  }
  function saveOrigins(origins) {
    chrome.storage.local.set({ [originsKey]: origins }, () => {
      loadOrigins();
    });
  }
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
  loadOrigins();

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
  loadBlacklist();

  // Close the setup tab when done
  saveButton.addEventListener('click', () => {
    window.close();
  });
});