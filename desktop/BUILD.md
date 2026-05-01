# Building Prompt Labs Desktop

## What you need installed first

1. **Rust** — https://rustup.rs (one command, takes ~2 min)
2. **Node.js 20+** — https://nodejs.org
3. **pnpm** — `npm install -g pnpm`
4. **Tauri CLI** — installed automatically via `pnpm install`

On macOS you also need Xcode Command Line Tools:
```
xcode-select --install
```

## Build for your own machine (quickest)

```bash
cd desktop
pnpm install
pnpm tauri build
```

The output will be at:
- **macOS** → `src-tauri/target/release/bundle/dmg/Prompt Labs_0.1.0_*.dmg`
- **Windows** → `src-tauri/target/release/bundle/msi/Prompt Labs_0.1.0_x64_en-US.msi`

## Install and first run

### macOS
1. Open the `.dmg`, drag **Prompt Labs** into Applications
2. Open it — macOS will warn "unidentified developer" (because it's not App Store signed)
3. Go to **System Settings → Privacy & Security** → scroll down → click **Open Anyway**
4. A second dialog appears — click **Open**
5. You'll see a **Prompt Labs icon in your menu bar** (top-right)
6. macOS will ask for **Accessibility permission** — grant it (required for Cmd+C / Cmd+V simulation)

### Windows
1. Run the `.msi` installer
2. Windows may show a SmartScreen warning — click **More info → Run anyway**
3. Prompt Labs appears in your system tray (bottom-right)

## First-time configuration

Click the menu bar / tray icon → **Settings…** and enter:
- **API URL** → `https://your-app.replit.app` (or your custom domain)
- **API Key** → your extension API key

## Using it

1. Select any text in any app (Word, Slack, VS Code, browser, anywhere)
2. Press **⌘I** (macOS) or **Ctrl+I** (Windows)
3. A small overlay appears — your prompt is automatically improved and pasted back

## Build for both platforms via GitHub Actions (CI)

Push the repo to GitHub, then either:

**Option A — trigger manually:**
Go to your repo → **Actions → Build Desktop App → Run workflow**

**Option B — trigger on a tag:**
```bash
git tag desktop-v0.1.0
git push origin desktop-v0.1.0
```

The workflow builds `.dmg` files for Apple Silicon and Intel Macs, and an `.msi` + `.exe` for Windows. Download the artifacts from the Actions run, or a GitHub Release is created automatically when triggered by a tag.

## Troubleshooting

**"Library not loaded" on macOS** — make sure you're on macOS 10.15 or later.

**Paste doesn't work in some apps** — the app uses macOS Accessibility API to simulate Cmd+V. If an app has its own security restrictions (e.g. password managers), it may block automated paste. Use the clipboard manually instead.

**Shortcut doesn't trigger** — another app may have claimed ⌘⇧I. Open Prompt Labs settings and (future) reconfigure the shortcut.
