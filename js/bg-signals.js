(function () {
  "use strict";

  var canvas = document.getElementById("bg-fx");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");

  var reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  var GRID = 30;
  var SPEED = 0.1;
  var MAX_SIGNALS = 5;
  var TRAIL_CELLS = 9;
  var TEXT_PAD = 14;
  var SPAWN_MIN = 900;
  var SPAWN_RANGE = 1200;
  var MAX_STEPS = TRAIL_CELLS * 20;

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
    signals.push({ i: -1, j: j, di: 1, dj: 0, run: 0, t: 0, n: 0, end: 0, trail: [[-1, j]] });
  }

  // Advance one grid cell. The signal always tries to keep moving: first its
  // preferred direction (straight, or a turn it was about to make), then a
  // couple of fallbacks, and only fades out if every nearby cell is blocked
  // by a text block. It never has to die just because one path forward is
  // covered by a word.
  function stepSignal(s) {
    s.i += s.di;
    s.j += s.dj;
    s.n++;
    s.trail.push([s.i, s.j]);
    if (s.trail.length > TRAIL_CELLS + 2) s.trail.shift();
    lit[s.i + "," + s.j] = 1;

    var turn = null;
    if (s.dj === 0) {
      if (Math.random() < 0.16) {
        var dir = Math.random() < 0.5 ? -1 : 1;
        turn = [0, dir];
      }
    } else {
      s.run--;
      if (s.run <= 0) turn = [1, 0];
    }

    var ways;
    if (turn) {
      ways = [turn, [s.di, s.dj], [1, 0], [0, 1], [0, -1]];
    } else if (s.dj !== 0) {
      ways = [[s.di, s.dj], [1, 0], [0, -s.dj]];
    } else {
      ways = [[s.di, s.dj], [0, 1], [0, -1]];
    }

    for (var q = 0; q < ways.length; q++) {
      var w = ways[q];
      if (!blocked(gx(s.i + w[0]), gy(s.j + w[1]))) {
        if (w[1] !== 0 && s.dj === 0) s.run = 2 + Math.floor(Math.random() * 2);
        s.di = w[0];
        s.dj = w[1];
        return;
      }
    }
    s.end = 1;
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
      var v = (lit[key] -= dt / 1800);
      if (v <= 0) { delete lit[key]; continue; }
      var parts = key.split(",");
      var size = 1.3 + 1.4 * v;
      ctx.fillStyle = "rgba(" + accentColor + "," + (0.5 * v).toFixed(3) + ")";
      ctx.fillRect(gx(+parts[0]) - size / 2, gy(+parts[1]) - size / 2, size, size);
    }

    if (now > nextSpawn) {
      spawnSignal();
      nextSpawn = now + SPAWN_MIN + Math.random() * SPAWN_RANGE;
    }

    ctx.lineCap = "round";
    ctx.lineWidth = 1.6;

    for (var n = signals.length - 1; n >= 0; n--) {
      var s = signals[n];
      var fade = 1;
      if (s.end) {
        s.end -= dt / 550;
        fade = s.end;
        if (s.end <= 0) { signals.splice(n, 1); continue; }
      } else {
        s.t += (dt * SPEED) / GRID;
        while (s.t >= 1 && !s.end) {
          s.t -= 1;
          stepSignal(s);
        }
        if (s.end) s.t = 0;
      }

      var hx = gx(s.i + s.di * s.t);
      var hy = gy(s.j + s.dj * s.t);
      if (hx > width + GRID || hy < -GRID || hy > height + GRID || s.n > MAX_STEPS) {
        signals.splice(n, 1);
        continue;
      }

      var pts = s.trail.map(function (p) { return [gx(p[0]), gy(p[1])]; });
      pts.push([hx, hy]);
      var gone = 0, maxLen = TRAIL_CELLS * GRID;
      for (var k = pts.length - 1; k > 0 && gone < maxLen; k--) {
        var a = pts[k], b = pts[k - 1];
        var segLen = Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
        if (!segLen) continue;
        var f = Math.min(1, (maxLen - gone) / segLen);
        var ex = a[0] + (b[0] - a[0]) * f, ey = a[1] + (b[1] - a[1]) * f;
        ctx.strokeStyle = "rgba(" + accentColor + "," + (0.55 * fade * (1 - gone / maxLen)).toFixed(3) + ")";
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        gone += segLen;
      }

      ctx.fillStyle = "rgba(" + accentColor + "," + (0.9 * fade).toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(hx, hy, 2.4, 0, Math.PI * 2);
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
