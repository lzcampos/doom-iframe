/* global Emscripten Module — must run before async index.js; no inline script (extension CSP). */
(function () {
  "use strict";

  if (new URLSearchParams(location.search).get("embed") === "1") {
    document.documentElement.classList.add("doom-embed");
  }

  var canvas = document.getElementById("canvas");
  if (canvas) {
    canvas.addEventListener(
      "contextmenu",
      function (e) {
        e.preventDefault();
      },
      false
    );
    canvas.addEventListener(
      "pointerdown",
      function () {
        try {
          canvas.focus({ preventScroll: true });
        } catch (_) {
          canvas.focus();
        }
      },
      true
    );
  }
})();

var statusElement = document.getElementById("status");
var progressElement = document.getElementById("progress");
var spinnerElement = document.getElementById("spinner");

document.addEventListener("G_SaveGame", function (e) {
  console.log(e.detail);
});

var Module = {
  preRun: [],
  postRun: [],
  onRuntimeInitialized: function () {
    var frameID;
    var currentState = { buttons: 0, x: 0, y: 0, strafe: 0, look: 0 };

    function frame() {
      currentState.buttons = 0;
      currentState.x = 0;
      currentState.y = 0;
      currentState.strafe = 0;
      currentState.look = 0;

      var gamepads = navigator.getGamepads();
      for (var index = 0; index < gamepads.length; index++) {
        var gamepad = gamepads[index];
        if (gamepad) {
          var buttonLength = Math.min(20, gamepad.buttons.length);
          for (var i = 0; i < buttonLength; i++) {
            var button = gamepad.buttons[i];
            if (button.pressed) {
              currentState.buttons |= 1 << i;
            }
          }

          if (gamepad.axes[0] < -0.1 || gamepad.axes[0] > 0.1) {
            currentState.strafe = gamepad.axes[0] < 0 ? -32767 : 32767;
          }
          if (gamepad.axes[1] < -0.1 || gamepad.axes[1] > 0.1) {
            currentState.y = gamepad.axes[1] < 0 ? -32767 : 32767;
          }
          if (gamepad.axes[2] < -0.1 || gamepad.axes[2] > 0.1) {
            currentState.x = gamepad.axes[2] < 0 ? -32767 : 32767;
          }
        }
      }

      if (Module._UpdateJoystick) {
        Module._UpdateJoystick(
          currentState.buttons,
          currentState.x,
          currentState.y,
          currentState.strafe,
          currentState.look
        );
      }
      frameID = window.requestAnimationFrame(frame);
    }

    frameID = window.requestAnimationFrame(frame);
  },
  print: (function () {
    var element = document.getElementById("output");
    if (element) element.value = "";
    return function (text) {
      if (arguments.length > 1) {
        text = Array.prototype.slice.call(arguments).join(" ");
      }
      console.log(text);
      if (element) {
        element.value += text + "\n";
        element.scrollTop = element.scrollHeight;
      }
    };
  })(),
  printErr: function (text) {
    if (arguments.length > 1) {
      text = Array.prototype.slice.call(arguments).join(" ");
    }
    console.error(text);
  },
  canvas: (function () {
    var el = document.getElementById("canvas");
    el.addEventListener(
      "webglcontextlost",
      function (e) {
        alert("WebGL context lost. Reload the page.");
        e.preventDefault();
      },
      false
    );
    return el;
  })(),
  setStatus: function (text) {
    if (!Module.setStatus.last) {
      Module.setStatus.last = { time: Date.now(), text: "" };
    }
    if (text === Module.setStatus.last.text) {
      return;
    }
    var m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
    var now = Date.now();
    if (m && now - Module.setStatus.last.time < 30) {
      return;
    }
    Module.setStatus.last.time = now;
    Module.setStatus.last.text = text;
    if (m) {
      text = m[1];
      progressElement.value = parseInt(m[2], 10) * 100;
      progressElement.max = parseInt(m[4], 10) * 100;
      progressElement.hidden = false;
      spinnerElement.hidden = false;
    } else {
      progressElement.value = null;
      progressElement.max = null;
      progressElement.hidden = true;
      if (!text) {
        spinnerElement.style.display = "none";
        document.getElementById("container").style.display = "none";
      }
    }
    statusElement.innerHTML = text;
  },
  totalDependencies: 0,
  monitorRunDependencies: function (left) {
    this.totalDependencies = Math.max(this.totalDependencies, left);
    Module.setStatus(
      left
        ? "Preparing… (" + (this.totalDependencies - left) + "/" + this.totalDependencies + ")"
        : "All downloads complete."
    );
  },
};

Module.postRun.push(function () {
  function focusCanvas() {
    var c = document.getElementById("canvas");
    if (!c) return;
    try {
      c.focus({ preventScroll: true });
    } catch (_) {
      c.focus();
    }
  }
  focusCanvas();
  setTimeout(focusCanvas, 0);
  requestAnimationFrame(focusCanvas);
});

Module.setStatus("Downloading…");

window.onblur = function () {
  if (typeof Module._SendPause === "function") {
    Module._SendPause(1);
  }
  if (Module.SDL2 && Module.SDL2.audioContext) {
    Module.SDL2.audioContext.suspend();
  }
};

window.onfocus = function () {
  if (typeof Module._SendPause === "function") {
    Module._SendPause(0);
  }
  if (Module.SDL2 && Module.SDL2.audioContext) {
    Module.SDL2.audioContext.resume();
  }
};

window.onclick = function () {
  var c = document.getElementById("canvas");
  if (c) {
    try {
      c.focus({ preventScroll: true });
    } catch (_) {
      c.focus();
    }
  }
  if (Module.SDL2 && Module.SDL2.audioContext && Module.SDL2.audioContext.state !== "running") {
    Module.SDL2.audioContext.resume();
  }
};

window.onerror = function () {
  Module.setStatus("Exception thrown, see JavaScript console");
  spinnerElement.style.display = "none";
  Module.setStatus = function (text) {
    if (text) {
      Module.printErr("[post-exception status] " + text);
    }
  };
};
