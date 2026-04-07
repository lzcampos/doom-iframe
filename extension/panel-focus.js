"use strict";
/**
 * Side panel / tab wrapper: keyboard goes to the host window first.
 * Focus the iframe, then the inner canvas (same extension origin → contentDocument allowed).
 */
(function () {
  var iframe = document.getElementById("game");
  if (!iframe) return;

  iframe.setAttribute("tabindex", "0");

  function focusIntoGame() {
    iframe.focus();
    try {
      var w = iframe.contentWindow;
      if (!w) return;
      w.focus();
      var doc = iframe.contentDocument;
      if (!doc) return;
      var canvas = doc.getElementById("canvas");
      if (canvas && typeof canvas.focus === "function") {
        canvas.focus({ preventScroll: true });
      } else if (doc.body && doc.body.focus) {
        doc.body.focus();
      }
    } catch (_) {}
  }

  iframe.addEventListener("load", function () {
    focusIntoGame();
    requestAnimationFrame(focusIntoGame);
    setTimeout(focusIntoGame, 0);
    setTimeout(focusIntoGame, 100);
    setTimeout(focusIntoGame, 400);
  });

  /* First key in the panel should reach the game */
  window.addEventListener(
    "keydown",
    function (ev) {
      if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
      focusIntoGame();
    },
    true
  );

  window.addEventListener("pointerdown", focusIntoGame, true);
})();
