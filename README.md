# WebDOOM embed (static / GitHub Pages)

Embeddable **WebAssembly DOOM** using the same client pattern as [AzazelN28/web-doom](https://github.com/AzazelN28/web-doom) ([`doom.html`](https://github.com/AzazelN28/web-doom/blob/master/doom.html)): a canvas, a global `Module`, and Emscripten’s `index.js` / `index.wasm` / `index.data`. No js-dos, no DOSBox.

## Quick start

```bash
./scripts/fetch-web-doom.sh   # download index.js, .wasm, .data into docs/doom/
./run.sh                        # http://127.0.0.1:8765/
```

Or: `npm run fetch-assets` then `npm run serve`.

Open **http://127.0.0.1:8765/** for the demo with an iframe, or **http://127.0.0.1:8765/doom/player.html** for the full-page player.

## GitHub Pages

### Option A — GitHub Actions (recommended)

The workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) runs `scripts/fetch-web-doom.sh` on every push to `main`/`master`, then publishes **`docs/`**. You do **not** need to commit `index.js`, `.wasm`, or `.data`.

1. Push the repo to GitHub.
2. **Settings → Pages → Build and deployment**: set **Source** to **GitHub Actions** (not “Deploy from a branch”).
3. Push to `main` (or `master`). Open the **Actions** tab and confirm the “Deploy Pages” run succeeded.
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
