# Guardian Extension

A lightweight browser extension that monitors network requests made by an untrusted extension. If the untrusted extension tries to contact any site outside your approved whitelist, it automatically disables it. You can manage settings and view logs via the extension’s toolbar menu.

## Setup

1. Clone or download this `guardian-extension` folder.
2. Open your browser’s extensions page:
   - Chrome: `chrome://extensions`
   - Firefox: `about:debugging#/runtime/this-firefox`
3. Enable Developer Mode (Chrome) or click **Load Temporary Add-on** (Firefox).
4. Click **Load unpacked** (Chrome) or **Select File** (Firefox) and choose the `guardian-extension` folder.
5. In `background.js`, replace `<TARGET_EXTENSION_ID>` with the ID of the extension you want to guard.
6. Click the Guardian extension icon in the browser toolbar to open the settings menu:
   - **Allowed Origins**: Add or remove URL patterns (e.g., `https://memecope.com/*`) to control which sites the untrusted extension may contact.
   - **Request Log**: View a history of requests from the guarded extension, including blocked, allowed, and credential events.
   - **Clear Log**: Reset the request history.

## How It Works

- **Network Guard**: Intercepts every request from the specified extension and blocks any to a URL not on your allowlist.
- **Credential Safeguard**: When you type usernames or passwords on allowed pages, the extension auto-disables the untrusted extension to protect your credentials.
- **GUI**: A simple, user-friendly popup lets you manage settings and review logs without editing code.

## Customization

- Use `*` as a wildcard in URL patterns, e.g., `https://*.example.com/*`.
- The log in storage is capped at 200 entries; older entries are dropped.

## Limitations

- Only network and credential-based safeguards.
- Does not prevent other non-network-based malicious behavior.
- Relies on browser extension APIs; cannot guard the extension’s on-disk files.