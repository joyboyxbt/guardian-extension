# Guardian Extension

A lightweight browser extension that monitors and controls the network behavior of another “guarded” extension. It enforces a whitelist/blacklist of domains, auto-disables on credential entry, and provides a GUI for managing settings and logs.

## Features

- Domain allowlist and blocklist
- Auto-disable on whitelist violation
- Auto-disable on credential input
- GUI popup for managing extension ID, allowlist, blocklist, and viewing logs
- One-click “Allow All Blocked” to add blocked domains to allowlist
- Compatible with Chrome, Firefox, and other Chromium-based browsers

## Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/joyboyxbt/guardian-extension.git
   ```
2. Load as an unpacked/temporary extension:
   - Chrome/Brave/Edge/Arc: `chrome://extensions` → Enable “Developer mode” → “Load unpacked” → select `guardian-extension/manifest.json`
   - Firefox: `about:debugging#/runtime/this-firefox` → “Load Temporary Add-on” → select `manifest.json`

## Configuration

### Guarded Extension ID

Enter the extension ID to monitor. Find IDs:
- Chrome/Brave/Edge/Arc: `chrome://extensions` → Details → “ID”
- Firefox: `about:debugging#/runtime/this-firefox`

### Modes

- **Pre-selected allowlist** (coming soon): default safe sections.
- **Custom allowlist & blacklist**: granular control.

### Allowed Origins

List of URL patterns. Wildcards supported, e.g., `https://*.example.com/*`.

### Blacklisted Origins

Explicitly block subdomains even if the parent domain is allowed.

### “Allow All Blocked”

Add all currently blocked domains to allowlist in one click.

## Usage

1. Click the Guardian icon in your toolbar.
2. Enter the target extension’s ID, choose **Custom** mode.
3. Manage **Allowed Origins** and **Blacklisted Origins**.
4. View the **Request Log** for events (allowed, blocked, blacklisted, credentials).
5. Use **Clear Log** or **Allow All Blocked** as needed.

## Contributing

> Coming soon: GitBook with detailed setup and extension ID lookup guides for Chrome, Firefox, Edge, Brave, Arc, and other Chromium-based browsers.

Feel free to file issues or pull requests!

---

*Note: This project uses Manifest V2. Consider upgrading to Manifest V3 in the future.*