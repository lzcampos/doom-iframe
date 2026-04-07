# WebDOOM embed (static / GitHub Pages)

Embeddable **WebAssembly DOOM** using the same client pattern as [AzazelN28/web-doom](https://github.com/AzazelN28/web-doom) ([`doom.html`](https://github.com/AzazelN28/web-doom/blob/master/doom.html)): a canvas, a global `Module`, and Emscripten’s `index.js` / `index.wasm` / `index.data`. No js-dos, no DOSBox.

## Quick start

```bash
./scripts/fetch-web-doom.sh   # download index.js, .wasm, .data into docs/doom/
./run.sh                        # http://127.0.0.1:8765/
```

Or: `npm run fetch-assets` then `npm run serve`.

Open **http://127.0.0.1:8765/** for the demo with an iframe, or **http://127.0.0.1:8765/doom/player.html** for the full-page player.

## Browser extension (`extension/`)

Side / sidebar panel + injectable overlay — **most page CSP is bypassed** because the game runs in the browser’s side UI, not inside the page. Same `extension/` folder loads in **Chrome** and **Firefox** (Manifest V3).

```bash
npm run fetch-assets    # if docs/doom/index.* are missing
npm run sync-extension  # copies player + wasm into extension/doom/; generates icons
```

### Google Chrome / Chromium

**Extensions → Developer mode → Load unpacked** → select the **`extension`** folder.

### Mozilla Firefox

Firefox often **ignores** the JSON file you pick for “Temporary Add-on” and still loads **`manifest.json`** from that directory. The **`extension/`** folder contains **Chrome’s** `manifest.json` (`service_worker`), so you get *“background.service_worker is currently disabled”* even if you chose `manifest-firefox.json`.

**Use the Firefox-only build** (one `manifest.json`, `background.scripts` only):

```bash
npm run fetch-assets      # if needed
npm run sync-extension
npm run build:firefox-ext
```

Then:

1. **`about:debugging#/runtime/this-firefox`**
2. **Load Temporary Add-on…**
3. Select **`dist/webdoom-firefox/manifest.json`** (not anything under `extension/` if the error persists).

Firefox has no Chrome **`sidePanel` API**; this build uses **`sidebar_action`**. Use the **toolbar button** to open the **sidebar**.

Reloading Firefox clears temporary add-ons. For AMO, zip **`dist/webdoom-firefox/`** as-is (it already has the correct `manifest.json`). Change `browser_specific_settings.gecko.id` before publishing.

**Optional:** In `about:config`, some profiles can enable MV3 background service workers so `extension/manifest.json` works — only if you know what you’re toggling.

| Entry | Chrome | Firefox |
|--------|--------|---------|
| **Toolbar icon** | **Side panel** with the game | **Sidebar** with the game (`sidebarAction.open`) |
| **Right‑click page** | Inject floating overlay | Same |
| **Right‑click toolbar** | “Open in new tab” (Chromium 114+) | — |
| **Ctrl+Shift+Y** / **mac Cmd+Shift+Y** | Toggle overlay | Toggle overlay |
| **Ctrl+Shift+U** / **mac Cmd+Shift+U** | New tab player | New tab player |

Large `index.*` files are gitignored in `extension/doom/` as well — run **`sync-extension`** after **fetch-assets** before loading unpacked or zipping the extension.

## GitHub Pages

### Option A — GitHub Actions (recommended)

The workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) runs `scripts/fetch-web-doom.sh` on every push to `main`/`master`, then publishes **`docs/`**. You do **not** need to commit `index.js`, `.wasm`, or `.data`.

1. Push the repo to GitHub.
2. **Settings → Pages → Build and deployment**: set **Source** to **GitHub Actions** (not “Deploy from a branch”). Leaving **Deploy from a branch** enabled is a common cause of **`configure-pages` 404 / “Get Pages site failed”**.
3. Push to `main` (or `master`), or **Actions → Deploy Pages → Run workflow**. If step 2 was wrong, you may see **“Get Pages site failed” / Not Found** until Source is **GitHub Actions**.
4. Your site will be at **`https://<user>.github.io/<repo>/`** (project repo) or **`https://<user>.github.io/`** if the repo is `<user>.github.io`).

### Option B — Deploy from the `/docs` branch folder

1. Run `./scripts/fetch-web-doom.sh` locally.
2. Remove `docs/doom/index.js`, `index.wasm`, and `index.data` from `.gitignore` (or delete those lines), then `git add docs/doom/index.*` and commit.
3. **Settings → Pages**: **Source** → **Deploy from a branch** → branch **`main`**, folder **`/docs`** → Save.

## Embed on another page (same origin)

```html
<div id="doom"></div>
<script src="/embed.js"></script>
<script>
  DoomEmbed.mount("#doom", { width: 854, height: 480 });
</script>
```

`embed.js` resolves `doom/player.html?embed=1` relative to its own URL, so keep `embed.js` and the `doom/` folder in the same paths as on this demo site.

## Controls (upstream web-doom)

Browser-friendly bindings — see [web-doom README](https://github.com/AzazelN28/web-doom/blob/master/README.md): **Q** fire, **E** use, **WASD** move, arrows turn, **Shift** run.

## Trademarks & licenses

DOOM® and related marks are property of ZeniMax / id Software. **This project is not affiliated with or endorsed by them.** Say so on any public page or app store listing where you use this demo.

**Give credit** to:

- **[AzazelN28/web-doom](https://github.com/AzazelN28/web-doom)** — fork/shell you are effectively shipping when using the fetched `index.*` build.
- **[lazarv/wasm-doom](https://github.com/lazarv/wasm-doom)** — upstream WebAssembly port, as credited in web-doom.

Link to their repos and retain **GPL-2.0** obligations for the game binaries (see upstream `LICENSE` / `COPYING.md`). The served site includes [`docs/credits.html`](docs/credits.html) as a human-readable credits page.

The fetch script mirrors prebuilt files from a public deploy; use `DOOM_WASM_BASE` if you host your own copy and credit that source instead.
