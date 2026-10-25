# Discord-Netflix

Having your video player freeze into a blank void on launch while your Discord status stubbornly claims you are still "In the Catalogs" when you are forty minutes into a thriller is an insult to your intelligence. If upstream abandonware leaves you staring at broken DOM scrapers and permission crashes, why settle for a broken player? Respect your ecosystem.

Discord-Netflix is an enhanced, battle-tested desktop Netflix wrapper with intelligent Discord Rich Presence, robust Widevine DRM media playback, and zero DOM-destroying glitches. Either way, you're welcome.

<p align="center">
  <img src="assets/icon.png" width="128" height="128" alt="Discord-Netflix Logo" />
</p>

---

## Highlights

- **Resilient Discord Rich Presence**: Upstream relied on brittle CSS selectors like `[data-uia="video-title"]` that Netflix unmounts after two seconds of idle mouse movement, freezing your status in "In the Catalogs". This fork hooks directly into the official Netflix Member API (`/nq/website/memberapi/release/metadata`), internal falcorCache, and active player sessions to resolve accurate series titles, seasons, and episodes even in fullscreen.
- **Instant Navigation Synchronization**: Native Single-Page Application (SPA) navigation awareness listening to in-page route transitions. As soon as you click Play from the catalog, Discord updates to your active stream within a second instead of lagging behind on a stale timer.
- **Fixed Windows Sandbox Crashes**: Eliminates the notorious Chromium `Sandbox cannot access executable: Access is denied (0x5)` error by configuring proper cross-platform sandbox bypass flags on Windows 10 and 11.
- **Anti-Bot & Consent Shield**: Neutralizes `X-OneTrust-IsBot` header rejections by sanitizing Electron and wrapper signatures from the User-Agent header, preventing Netflix and OneTrust from blocking page initialization.
- **Preserved User Interface**: Overhauls the over-aggressive household-restriction bypass script that previously wiped the DOM, deleting login dialogs, cookie consent banners, and profile selectors into a blank black void.
- **Widevine CDM High Bitrate Playback**: Bundles Castlabs Electron Widevine Content Decryption Module with 1080p stream support and bounded bitrate overrides instead of infinite keyboard event spam.
- **Optional GPU Troubleshooting Flag**: Launch with `--disable-gpu` or `--disable-hardware-acceleration` to bypass hardware compositing glitches on newer GPU architectures.

---

## Architecture

```
Discord-Netflix/
├── assets/                           Icons and branding assets
├── src/
│   ├── Electron/
│   │   ├── BrowserWindow.js          Enhanced browser window, sanitized User-Agent, SPA navigation hooks
│   │   └── index.js                  Window management entrypoint
│   ├── RPC/
│   │   ├── Client.js                 IPC Discord Rich Presence client
│   │   └── index.js                  RPC exports
│   ├── util/
│   │   └── scripts/
│   │       ├── content_script.js     Injected scripts (PiP, smooth scroll, bounded bitrate, safe bypass)
│   │       ├── infos.js              Multi-source metadata resolver (Member API, DOM, falcorCache)
│   │       └── index.js              Script exports
│   └── index.js                      Application lifecycle, sandbox switches, and Discord synchronization
├── package.json
└── README.md
```

---

## Installation & Distribution

### 1. Pre-built Executable
Download the latest installer or portable archive from the [Releases](https://github.com/djell1l/Discord-Netflix/releases) page. Run the setup, log in once to your Netflix account, and launch Discord.

### 2. GPU Troubleshooting
If your graphics drivers conflict with hardware-accelerated DRM surfaces, you can run the executable directly with:
```powershell
Discord-Netflix.exe --disable-gpu
```

---

## Building from Source

### Prerequisites
- Node.js 18+ (Node 20+ LTS recommended)
- Git
- Discord Desktop client running in the background

### Build & Run
```powershell
# Clone the repository
git clone https://github.com/djell1l/Discord-Netflix.git
cd Discord-Netflix

# Install dependencies
npm install

# Launch in development mode
npm start

# Build Windows installer
npm run winbuild
```

---

## Contributors & Credits

AI is the future — why whisper about it on GitHub like it's a dirty secret? This project is 100% vibe-coded and we fully own it: pairing human ambition with cutting-edge AI pair programming to build what multi-billion-dollar companies were too lazy to ship.

<p align="left">
  <a href="https://github.com/djell1l">
    <img src="https://github.com/djell1l.png" width="60" height="60" style="border-radius: 50%;" alt="djell1l" />
  </a>
</p>

- **[djell1l](https://github.com/djell1l)** — Lead developer & maintainer
- **[Gemini](https://github.com/google-gemini)** via **[Antigravity](https://github.com/google-deepmind)** — AI pair programming collaborator, diagnostics, sandbox fixes, and multi-source RPC engine
- **[Diswin](https://github.com/djell1l/Diswin)** — Sibling native Windows 11 client establishing this ecosystem standard
- **[Discord-Netflix](https://github.com/Discord-Netflix/Discord-Netflix)** by DiscordNetflix / Nirewen — Upstream foundation and desktop wrapper concept
- **[PreMiD](https://github.com/PreMiD/Activities)** — Reference member API methodology for bulletproof Netflix video metadata resolution
- **[Castlabs](https://github.com/castlabs/electron-releases)** — Widevine Content Decryption Module (CDM) integration for Electron

---

## License

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)**. See the [LICENSE](LICENSE) file for complete details.

Under this strong copyleft license:
- Any fork, derivative work, or redistribution must remain completely free and open-source.
- It is strictly prohibited to take this code, make it proprietary, or re-publish it in closed-source format without giving full attribution and releasing the modified source code under the same GPL-3.0 license.

---

## Disclaimer

Discord-Netflix is an unofficial third-party open-source utility and is not affiliated with, endorsed by, or sponsored by Netflix, Inc. or Discord Inc. All trademarks belong to their respective owners.
