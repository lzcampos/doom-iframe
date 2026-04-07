(function () {
  "use strict";

  var HOST_ID = "__webdoom_chrome_shadow_host";
  var host = document.getElementById(HOST_ID);
  if (host) {
    host.remove();
    return;
  }

  host = document.createElement("div");
  host.id = HOST_ID;
  host.setAttribute("data-webdoom-extension", "");

  var shadow = host.attachShadow({ mode: "open" });

  var style = document.createElement("style");
  style.textContent =
    ".wrap { box-sizing: border-box; position: fixed; right: 12px; bottom: 12px; " +
    "width: min(854px, 92vw); height: min(480px, 55vh); z-index: 2147483647; " +
    "display: flex; flex-direction: column; background: #111; border: 2px solid #b33; " +
    "border-radius: 10px; box-shadow: 0 8px 32px rgba(0,0,0,.55); " +
    "font-family: system-ui, sans-serif; resize: both; overflow: auto; " +
    "min-width: 280px; min-height: 220px; max-width: 96vw; max-height: 90vh; } " +
    ".bar { flex: 0 0 auto; display: flex; align-items: center; justify-content: space-between; " +
    "gap: 8px; padding: 6px 10px; background: #1a1a1a; color: #ddd; cursor: grab; " +
    "user-select: none; border-radius: 8px 8px 0 0; } " +
    ".bar:active { cursor: grabbing; } " +
    ".hint { font-size: 11px; line-height: 1.3; opacity: 0.9; flex: 1; } " +
    ".close { flex: 0 0 auto; border: 0; background: #444; color: #fff; width: 28px; height: 28px; " +
    "border-radius: 6px; cursor: pointer; font-size: 18px; line-height: 1; padding: 0; } " +
    ".close:hover { background: #633; } " +
    "iframe { flex: 1; border: 0; width: 100%; min-height: 180px; background: #000; display: block; } ";

  var wrap = document.createElement("div");
  wrap.className = "wrap";

  var bar = document.createElement("div");
  bar.className = "bar";

  var hint = document.createElement("span");
  hint.className = "hint";
  hint.innerHTML =
    "Drag the header to move. If the game stays <strong>black</strong>, this site’s CSP likely blocked the frame — " +
    "use the <strong>extension toolbar icon</strong> to open the <strong>side panel</strong> instead.";

  var close = document.createElement("button");
  close.type = "button";
  close.className = "close";
  close.setAttribute("aria-label", "Close WebDOOM overlay");
  close.textContent = "\u00d7";
  close.addEventListener("click", function (e) {
    e.stopPropagation();
    host.remove();
  });

  bar.appendChild(hint);
  bar.appendChild(close);
  wrap.appendChild(bar);

  var iframe = document.createElement("iframe");
  iframe.setAttribute("allow", "fullscreen; autoplay; gamepad");
  iframe.setAttribute("title", "WebDOOM");
  iframe.src = chrome.runtime.getURL("doom/player.html?embed=1");
  wrap.appendChild(iframe);

  shadow.appendChild(style);
  shadow.appendChild(wrap);
  document.documentElement.appendChild(host);

  var sx = 0;
  var sy = 0;
  var ox = 0;
  var oy = 0;
  var dragging = false;

  bar.addEventListener("mousedown", function (e) {
    if (e.target === close) return;
    dragging = true;
    sx = e.clientX;
    sy = e.clientY;
    var rect = wrap.getBoundingClientRect();
    ox = rect.left;
    oy = rect.top;
    wrap.style.right = "auto";
    wrap.style.bottom = "auto";
    wrap.style.left = ox + "px";
    wrap.style.top = oy + "px";
    e.preventDefault();
  });

  window.addEventListener(
    "mousemove",
    function (e) {
      if (!dragging) return;
      ox += e.clientX - sx;
      oy += e.clientY - sy;
      sx = e.clientX;
      sy = e.clientY;
      var maxL = Math.max(8, window.innerWidth - wrap.offsetWidth - 8);
      var maxT = Math.max(8, window.innerHeight - wrap.offsetHeight - 8);
      wrap.style.left = Math.min(Math.max(8, ox), maxL) + "px";
      wrap.style.top = Math.min(Math.max(8, oy), maxT) + "px";
    },
    true
  );

  window.addEventListener(
    "mouseup",
    function () {
      dragging = false;
    },
    true
  );
})();
