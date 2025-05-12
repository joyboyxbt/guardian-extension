// == Guardian Content Script ==
// Disables untrusted extension when user types credentials on allowed origins.

(function() {
  chrome.storage.local.get('allowedOrigins', data => {
    const allowed = Array.isArray(data.allowedOrigins) ? data.allowedOrigins : [];
    const url = window.location.href;
    const matches = allowed.some(pattern => {
      const regex = new RegExp('^' + pattern.split('*').join('.*') + '$');
      return regex.test(url);
    });
    if (!matches) return;
    document.addEventListener('input', e => {
      const el = e.target;
      if (el.tagName !== 'INPUT') return;
      const type = el.type.toLowerCase();
      const name = (el.name || '').toLowerCase();
      const id = (el.id || '').toLowerCase();
      const isCred = type === 'password'
        || (type === 'text' && /user(name)?/.test(name))
        || /user(name)?/.test(id);
      if (isCred) {
        chrome.runtime.sendMessage({ action: 'disableForCredentials', url });
      }
    }, true);
  });
})();