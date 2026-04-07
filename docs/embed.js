/**
 * Embeddable iframe wrapper for the WebDOOM / wasm-doom player (Emscripten).
 * Serve the docs/ folder over HTTP — WASM requires a real origin (not file://).
 * @global
 */
(function (global) {
  var embedScriptBase =
    document.currentScript && document.currentScript.src
      ? new URL(".", document.currentScript.src).href
      : new URL("./", global.location.href).href;

  /**
   * @param {string|Element} selector
   * @param {{ width?: number, height?: number, playerPath?: string }} [options]
   * @returns {{ destroy: () => void, iframe: HTMLIFrameElement }}
   */
  function mount(selector, options) {
    options = options || {};
    var el = typeof selector === "string" ? document.querySelector(selector) : selector;
    if (!el) {
      throw new Error("DoomEmbed.mount: element not found");
    }

    var base = embedScriptBase;
    var playerFile = options.playerPath || "doom/player.html";
    var playerUrl = new URL(playerFile, base);
    playerUrl.searchParams.set("embed", "1");

    var w = options.width != null ? Number(options.width) : 854;
    var h = options.height != null ? Number(options.height) : 480;

    var wrap = document.createElement("div");
    wrap.style.cssText =
      "position:relative;width:" +
      w +
      "px;height:" +
      h +
      "px;max-width:100%;overflow:hidden;background:#000;";

    var iframe = document.createElement("iframe");
    iframe.src = playerUrl.href;
    iframe.title = "WebDOOM";
    iframe.setAttribute("allow", "autoplay; fullscreen; gamepad");
    iframe.style.cssText = "border:0;width:100%;height:100%;display:block;";
    wrap.appendChild(iframe);
    el.appendChild(wrap);

    return {
      iframe: iframe,
      destroy: function () {
        if (wrap.parentNode) {
          wrap.parentNode.removeChild(wrap);
        }
      },
    };
  }

  global.DoomEmbed = {
    mount: mount,
  };
})(typeof window !== "undefined" ? window : globalThis);
