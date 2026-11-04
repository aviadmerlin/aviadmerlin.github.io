(function () {
  "use strict";

  var canvas = document.getElementById("bg-fx");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");

  var reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  var GRID = 32;
  var SPEED = 0.09;
  var MAX_SIGNALS = 3;
  var TRAIL_CELLS = 6;
  var TEXT_PAD = 16;
  var SPAWN_MIN = 1400;
  var SPAWN_RANGE = 1800;

  var width = 0, height = 0, dpr = 1, offsetX = 0;
  var inkColor = "237,239,242";
  var accentColor = "109,155,255";
  var zones = [];
  var zonesDirty = true;
  var signals = [];
  var lit = {};
  var raf = 0;
  var prevTime = 0;
  var nextSpawn = 0;

  function readColors() {
    var light = document.documentElement.getAttribute("data-theme") === "light";
    inkColor = light ? "20,22,27" : "237,239,242";
    accentColor = light ? "43,87,214" : "109,155,255";
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    offsetX = (width % GRID) / 2;
  }

  function computeZones() {
    zones = [];
    var els = document.querySelectorAll(
      "main h1, main h2, main h3, main p, main a, main .tag, main .toolkit-chip, main .status-pill"
    );
    for (var i = 0; i < els.length; i++) {
      var r = els[i].getBoundingClientRect();
      if (r.width && r.bottom > -40 && r.top < height + 40) {
        zones.push([r.left - TEXT_PAD, r.top - TEXT_PAD, r.right + TEXT_PAD, r.bottom + TEXT_PAD]);
      }
    }
  }

  function blocked(x, y) {
    for (var i = 0; i < zones.length; i++) {
      var z = zones[i];
      if (x > z[0] && x < z[2] && y > z[1] && y < z[3]) return true;
    }
    return false;
  }

  function gx(i) { return i * GRID + offsetX; }
  function gy(j) { return j * GRID; }

  function spawnSignal() {
    if (signals.length >= MAX_SIGNALS) return;
    var rows = Math.floor(height / GRID);
    var j = 1 + Math.floor(Math.random() * Math.max(1, rows - 2));
    if (blocked(gx(0), gy(j))) return;
    signals.push({ i: -1, j: j, di: 1, dj: 0, run: 0, t: 0, n: 0, end: 0 });
  }

  function stepSignal(s) {
    s.i += s.di;
    s.j += s.dj;
    s.n++;
    lit[s.i + "," + s.j] = 1;

    if (s.dj !== 0) {
      s.run--;
      if (s.run <= 0) { s.di = 1; s.dj = 0; }
    } else if (Math.random() < 0.12) {
      var dir = Math.random() < 0.5 ? -1 : 1;
      if (!blocked(gx(s.i), gy(s.j + dir))) {
        s.di = 0;
        s.dj = dir;
        s.run = 1 + Math.floor(Math.random() * 3);
        return;
      }
    }
    if (blocked(gx(s.i + s.di), gy(s.j + s.dj))) s.end = 1;
  }

  function drawGrid() {
    var cols = Math.ceil(width / GRID) + 1;
    var rows = Math.ceil(height / GRID) + 1;
    ctx.fillStyle = "rgba(" + inkColor + ",0.12)";
    for (var j = 0; j < rows; j++) {
      var y = gy(j);
      for (var i = 0; i < cols; i++) {
        var x = gx(i);
        ctx.fillRect(x - 0.6, y - 0.6, 1.2, 1.2);
      }
    }
  }

  function drawSignals(now, dt) {
    var key;
    for (key in lit) {
      var v = (lit[key] -= dt / 1400);
      if (v <= 0) { delete lit[key]; continue; }
      var parts = key.split(",");
      var size = 1.3 + 1.3 * v;
      ctx.fillStyle = "rgba(" + accentColor + "," + (0.5 * v).toFixed(3) + ")";
      ctx.fillRect(gx(+parts[0]) - size / 2, gy(+parts[1]) - size / 2, size, size);
    }

    if (now > nextSpawn) {
      spawnSignal();
      nextSpawn = now + SPAWN_MIN + Math.random() * SPAWN_RANGE;
    }

    for (var n = signals.length - 1; n >= 0; n--) {
      var s = signals[n];
      var fade = 1;
      if (s.end) {
        s.end -= dt / 500;
        fade = s.end;
        if (s.end <= 0) { signals.splice(n, 1); continue; }
      } else {
        s.t += (dt * SPEED) / GRID;
        while (s.t >= 1 && !s.end) {
          s.t -= 1;
          stepSignal(s);
        }
      }
      var hx = gx(s.i + s.di * s.t);
      var hy = gy(s.j + s.dj * s.t);
      if (hx > width + GRID || hy < -GRID || hy > height + GRID || s.n > TRAIL_CELLS * 14) {
        signals.splice(n, 1);
        continue;
      }
      ctx.fillStyle = "rgba(" + accentColor + "," + (0.85 * fade).toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(hx, hy, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function draw(now) {
    var dt = Math.min(48, now - (prevTime || now));
    prevTime = now;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    drawGrid();
    if (!reduceMotion) drawSignals(now, dt);
  }

  function loop(now) {
    raf = 0;
    if (document.hidden) return;
    if (zonesDirty) { computeZones(); zonesDirty = false; }
    draw(now);
    raf = requestAnimationFrame(loop);
  }

  resize();
  readColors();
  computeZones();
  draw(0);

  if (!reduceMotion) {
    raf = requestAnimationFrame(loop);
  }

  window.addEventListener("resize", function () {
    resize();
    zonesDirty = true;
    if (reduceMotion) draw(0);
  });

  window.addEventListener(
    "scroll",
    function () { zonesDirty = true; },
    { passive: true }
  );

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && !raf && !reduceMotion) raf = requestAnimationFrame(loop);
  });

  if (window.MutationObserver) {
    new MutationObserver(function () {
      readColors();
      if (reduceMotion) draw(0);
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }
})();
