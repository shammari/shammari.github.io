/*
 * Shared helpers for the interactive teaching tools: SVG plots that scale for phones,
 * pointer handling, controls, a Runge–Kutta solver, root finding and a parser for typed formulas.
 * Each tool page loads this file and then runs its own short script.
 */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";

  // Shared styles, injected once. Kept here (not in the site CSS) so the CSS purge step never removes them.
  var CSS = [
    ".mm-wrap{--mm-a:var(--global-theme-color);--mm-b:#d9772b;--mm-c:#2a9d8f;border:1px solid var(--global-divider-color);border-radius:6px;padding:.8rem;margin:1rem 0 1.5rem}",
    ".mm-panels{display:grid;gap:.8rem;grid-template-columns:1fr}",
    "@media (min-width:768px){.mm-panels.mm-2{grid-template-columns:1fr 1fr}.mm-panels.mm-side{grid-template-columns:1fr 2fr}}",
    ".mm-plot{display:block;width:100%;height:auto;touch-action:none;user-select:none;-webkit-user-select:none}",
    ".mm-plot line,.mm-plot circle,.mm-plot path,.mm-plot polyline,.mm-plot rect{vector-effect:non-scaling-stroke}",
    ".mm-plot .mm-grid{stroke:var(--global-divider-color);stroke-width:1;fill:none}",
    ".mm-plot .mm-axis{stroke:var(--global-text-color-light);stroke-width:1;fill:none}",
    ".mm-plot .mm-zero{stroke:var(--global-text-color-light);stroke-width:1;stroke-dasharray:4 3;fill:none}",
    ".mm-plot text{fill:var(--global-text-color-light);font-family:inherit}",
    ".mm-plot .mm-title{fill:var(--global-text-color);font-weight:500}",
    ".mm-plot .mm-field{stroke:var(--global-text-color-light);stroke-width:1;opacity:.55;fill:none}",
    ".mm-plot .mm-a{stroke:var(--mm-a);stroke-width:2.2;fill:none}",
    ".mm-plot .mm-b{stroke:var(--mm-b);stroke-width:2.2;fill:none}",
    ".mm-plot .mm-c{stroke:var(--mm-c);stroke-width:2.2;fill:none}",
    ".mm-plot .mm-curve{stroke:var(--global-text-color);stroke-width:2;fill:none}",
    ".mm-plot .mm-faded{opacity:.35}",
    ".mm-plot .mm-sep{stroke:var(--global-text-color);stroke-width:1.4;fill:none;opacity:.8}",
    ".mm-plot .mm-null-a{stroke:var(--mm-a);stroke-width:1.6;stroke-dasharray:6 4;fill:none}",
    ".mm-plot .mm-null-b{stroke:var(--mm-b);stroke-width:1.6;stroke-dasharray:6 4;fill:none}",
    ".mm-plot .mm-eq-s{fill:var(--global-text-color);stroke:var(--global-bg-color);stroke-width:1.5}",
    ".mm-plot .mm-eq-u{fill:var(--global-bg-color);stroke:var(--global-text-color);stroke-width:2}",
    ".mm-plot .mm-eq-n{fill:var(--global-text-color-light);stroke:var(--global-bg-color);stroke-width:1.5}",
    ".mm-pair{display:inline-flex;align-items:center;gap:.5rem;flex-wrap:nowrap}",
    ".mm-pair .mm-slider.mm-dim{opacity:.4}",
    ".mm-plot .mm-dot{fill:var(--global-text-color)}",
    ".mm-plot .mm-handle{fill:none;stroke-width:2.5;cursor:grab}",
    ".mm-plot .mm-arrow{fill:var(--global-text-color)}",
    ".mm-controls{display:flex;flex-wrap:wrap;gap:.5rem 1.6rem;margin:.8rem 0 .2rem;font-size:.9rem;align-items:center}",
    ".mm-group{display:flex;flex-wrap:wrap;gap:.35rem .9rem;align-items:center}",
    ".mm-legend{font-size:.75rem;text-transform:uppercase;letter-spacing:.04em;color:var(--global-text-color-light);margin-right:.2rem}",
    ".mm-controls label{margin:0;cursor:pointer;display:inline-flex;align-items:center;gap:.35rem}",
    ".mm-slider{display:inline-flex;align-items:center;gap:.45rem}",
    ".mm-slider input[type=range]{width:8.5rem;accent-color:var(--global-theme-color)}",
    ".mm-slider output{min-width:2.8rem;font-variant-numeric:tabular-nums;color:var(--global-text-color)}",
    ".mm-controls button{font:inherit;font-size:.85rem;padding:.15rem .6rem;border:1px solid var(--global-divider-color);border-radius:4px;background:transparent;color:var(--global-text-color);cursor:pointer}",
    ".mm-controls button:hover,.mm-controls button.mm-on{border-color:var(--global-theme-color)}",
    ".mm-controls button.mm-on{color:var(--global-theme-color)}",
    ".mm-controls select{font:inherit;font-size:.88rem;padding:.1rem .3rem;border:1px solid var(--global-divider-color);border-radius:4px;background:var(--global-bg-color);color:var(--global-text-color)}",
    ".mm-help{font-size:.85rem;color:var(--global-text-color-light);margin:.4rem 0 0}",
    ".mm-eqn{font-size:.95rem;margin:.2rem 0 .5rem}",
    ".mm-readout{font-size:.9rem;margin:.6rem 0 0;font-variant-numeric:tabular-nums}",
    ".mm-readout b{font-weight:600}",
    ".mm-key{display:inline-block;width:1.4rem;height:0;border-top:3px solid;vertical-align:middle;margin-right:.35rem}",
    ".mm-key.mm-dash{border-top-style:dashed}",
    ".mm-note{font-size:.875rem;color:var(--global-text-color-light);border-left:3px solid var(--global-theme-color);padding:.4rem .8rem;margin:1.5rem 0}",
    ".mm-table{border-collapse:collapse;font-size:.9rem;margin:.2rem 0 .8rem;font-variant-numeric:tabular-nums}",
    ".mm-table th,.mm-table td{padding:.25rem .45rem;border-top:1px solid var(--global-divider-color);text-align:right;vertical-align:middle}",
    ".mm-table th{font-weight:500;color:var(--global-text-color-light);font-size:.82rem}",
    ".mm-table th:first-child,.mm-table td:first-child{text-align:left}",
    ".mm-table input{width:4.6rem;font:inherit;font-size:.88rem;text-align:right;padding:.1rem .25rem;border:1px solid var(--global-divider-color);border-radius:4px;background:var(--global-bg-color);color:var(--global-text-color)}",
    ".mm-table .mm-best td{font-weight:600}",
    ".mm-table .mm-pc{background:color-mix(in srgb,var(--global-theme-color) 12%,transparent)}",
    ".mm-table .mm-pe{outline:2px solid var(--global-theme-color);outline-offset:-2px;font-weight:600}",
    ".mm-scroll{overflow-x:auto}",
    ".mm-text input{font:inherit;font-size:.9rem;padding:.12rem .35rem;border:1px solid var(--global-divider-color);border-radius:4px;background:var(--global-bg-color);color:var(--global-text-color);max-width:60vw}",
    ".mm-text input.mm-bad{border-color:#c0392b}",
    ".mm-err{color:#c0392b;font-size:.82rem}",
    // a wide displayed formula scrolls inside its own box on a narrow screen instead of widening the page
    'mjx-container[display="true"]{max-width:100%;overflow-x:auto;overflow-y:hidden}',
    "@media (max-width:576px){.mm-slider input[type=range]{width:7rem}.mm-table input{width:3.8rem}}",
  ].join("\n");
  function injectCSS() {
    if (document.getElementById("mm-tools-css")) return;
    var s = document.createElement("style");
    s.id = "mm-tools-css";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    if (attrs) for (var k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function html(tag, attrs, parent, text) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text !== undefined) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }

  /*
   * Plot: an SVG panel with data coordinates.
   * o = { x0, x1, y0, y1, gx, gy (grid steps), lx, ly (label steps), fx, fy (label formatters),
   *       xname, yname, W (viewBox width, default 640), aspect (height/width), aspectNarrow, left (label room in px) }
   * The viewBox width is fixed and K converts screen pixels to viewBox units, so labels stay readable at any size.
   */
  function Plot(svg, o) {
    this.svg = svg;
    this.o = o;
    svg.classList.add("mm-plot");
  }
  Plot.prototype.layout = function () {
    var o = this.o,
      W = o.W || 640,
      w = this.svg.getBoundingClientRect().width;
    this.W = W;
    this.K = w > 0 ? W / w : 1;
    // "Narrow" means the panels are stacked (phone layout), which is decided by the window width.
    var narrow = window.innerWidth < 768;
    this.H = Math.round(W * (narrow && o.aspectNarrow ? o.aspectNarrow : o.aspect || 0.62));
    var K = this.K;
    this.L = ((o.left || 30) + 10) * K;
    this.R = (o.right || 12) * K;
    this.T = (o.yname ? 26 : 12) * K;
    this.B = (o.xname ? 40 : 26) * K;
    this.svg.setAttribute("viewBox", "0 0 " + W + " " + this.H);
    this.svg.style.fontSize = 12 * K + "px";
  };
  Plot.prototype.sx = function (x) {
    var o = this.o;
    return this.L + ((x - o.x0) / (o.x1 - o.x0)) * (this.W - this.L - this.R);
  };
  Plot.prototype.sy = function (y) {
    var o = this.o;
    return this.H - this.B - ((y - o.y0) / (o.y1 - o.y0)) * (this.H - this.T - this.B);
  };
  Plot.prototype.ix = function (px) {
    var o = this.o;
    return o.x0 + ((px - this.L) / (this.W - this.L - this.R)) * (o.x1 - o.x0);
  };
  Plot.prototype.iy = function (py) {
    var o = this.o;
    return o.y0 + ((this.H - this.B - py) / (this.H - this.T - this.B)) * (o.y1 - o.y0);
  };
  Plot.prototype.inside = function (x, y) {
    var o = this.o;
    return x >= o.x0 && x <= o.x1 && y >= o.y0 && y <= o.y1;
  };
  // Clear and draw grid, ticks and axis names. Returns layers: data (clipped to the plot area) and top.
  Plot.prototype.frame = function () {
    this.layout();
    var svg = this.svg,
      o = this.o,
      K = this.K;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var id = svg.id + "-clip";
    var cp = el("clipPath", { id: id }, el("defs", null, svg));
    el("rect", { x: this.L, y: this.T, width: this.W - this.L - this.R, height: this.H - this.T - this.B }, cp);
    function mult(v, s) {
      return Math.abs(v / s - Math.round(v / s)) < 1e-7;
    }
    var fx = o.fx || fmtTick,
      fy = o.fy || fmtTick,
      g;
    for (g = Math.ceil(o.x0 / o.gx - 1e-9) * o.gx; g <= o.x1 + 1e-9; g += o.gx) {
      el("line", { x1: this.sx(g), y1: this.T, x2: this.sx(g), y2: this.H - this.B, class: "mm-grid" }, svg);
      if (!o.noTicks && mult(g, o.lx || o.gx))
        el("text", { x: this.sx(g), y: this.H - this.B + 16 * K, "text-anchor": "middle" }, svg).textContent = fx(g);
    }
    for (g = Math.ceil(o.y0 / o.gy - 1e-9) * o.gy; g <= o.y1 + 1e-9; g += o.gy) {
      el("line", { x1: this.L, y1: this.sy(g), x2: this.W - this.R, y2: this.sy(g), class: "mm-grid" }, svg);
      if (!o.noTicks && mult(g, o.ly || o.gy))
        el("text", { x: this.L - 6 * K, y: this.sy(g) + 4 * K, "text-anchor": "end" }, svg).textContent = fy(g);
    }
    el("line", { x1: this.L, y1: this.H - this.B, x2: this.W - this.R, y2: this.H - this.B, class: "mm-axis" }, svg);
    el("line", { x1: this.L, y1: this.T, x2: this.L, y2: this.H - this.B, class: "mm-axis" }, svg);
    if (o.xname) el("text", { x: (this.L + this.W - this.R) / 2, y: this.H - 6 * K, "text-anchor": "middle" }, svg).textContent = o.xname;
    if (o.yname) el("text", { x: this.L, y: this.T - 10 * K }, svg).textContent = o.yname;
    this.data = el("g", { "clip-path": "url(#" + id + ")" }, svg);
    this.top = el("g", null, svg);
    return this;
  };
  // A polyline through data points [[x, y], ...], broken where values are not finite.
  // Points closer than half a unit to the last one drawn are skipped, which keeps long trajectories light.
  Plot.prototype.path = function (pts, cls, parent) {
    var d = "",
      pen = false,
      lx = 0,
      ly = 0,
      n = pts.length;
    for (var i = 0; i < n; i++) {
      var x = pts[i][0],
        y = pts[i][1];
      if (!isFinite(x) || !isFinite(y) || Math.abs(y) > 1e6 || Math.abs(x) > 1e6) {
        pen = false;
        continue;
      }
      var px = this.sx(x),
        py = this.sy(y);
      if (pen && i < n - 1 && Math.abs(px - lx) + Math.abs(py - ly) < 0.5) continue;
      d += (pen ? "L" : "M") + px.toFixed(1) + "," + py.toFixed(1);
      lx = px;
      ly = py;
      pen = true;
    }
    return el("path", { d: d, class: cls }, parent || this.data);
  };
  Plot.prototype.circle = function (x, y, r, cls, parent) {
    return el("circle", { cx: this.sx(x), cy: this.sy(y), r: r * this.K, class: cls }, parent || this.top);
  };
  // A short arrow centred on data point (x, y) pointing along screen direction (dx, dy).
  Plot.prototype.arrow = function (x, y, dx, dy, len, cls, parent) {
    var px = this.sx(x),
      py = this.sy(y),
      n = Math.sqrt(dx * dx + dy * dy);
    if (!(n > 0)) return null;
    var ux = dx / n,
      uy = dy / n,
      L = len * this.K,
      h = Math.min(5 * this.K, L * 0.45);
    var x1 = px - (ux * L) / 2,
      y1 = py - (uy * L) / 2,
      x2 = px + (ux * L) / 2,
      y2 = py + (uy * L) / 2;
    var d = "M" + x1.toFixed(1) + "," + y1.toFixed(1) + "L" + x2.toFixed(1) + "," + y2.toFixed(1);
    d += "M" + (x2 - h * ux + h * 0.5 * uy).toFixed(1) + "," + (y2 - h * uy - h * 0.5 * ux).toFixed(1) + "L" + x2.toFixed(1) + "," + y2.toFixed(1);
    d += "L" + (x2 - h * ux - h * 0.5 * uy).toFixed(1) + "," + (y2 - h * uy + h * 0.5 * ux).toFixed(1);
    return el("path", { d: d, class: cls || "mm-field" }, parent || this.data);
  };
  // A filled triangle on screen pointing in direction (dx, dy), used for phase-line arrows.
  Plot.prototype.tri = function (x, y, dx, dy, size, cls, parent) {
    var px = this.sx(x),
      py = this.sy(y),
      n = Math.sqrt(dx * dx + dy * dy);
    if (!(n > 0)) return null;
    var ux = dx / n,
      uy = dy / n,
      s = size * this.K;
    var pts = [
      [px + ux * s, py + uy * s],
      [px - ux * s * 0.6 + uy * s * 0.7, py - uy * s * 0.6 - ux * s * 0.7],
      [px - ux * s * 0.6 - uy * s * 0.7, py - uy * s * 0.6 + ux * s * 0.7],
    ];
    return el(
      "polygon",
      {
        points: pts
          .map(function (p) {
            return p[0].toFixed(1) + "," + p[1].toFixed(1);
          })
          .join(" "),
        class: cls || "mm-arrow",
      },
      parent || this.top
    );
  };
  Plot.prototype.text = function (x, y, s, attrs, parent) {
    var a = { x: this.sx(x), y: this.sy(y) };
    for (var k in attrs || {}) a[k] = attrs[k];
    var t = el("text", a, parent || this.top);
    t.textContent = s;
    return t;
  };
  // Data coordinates of a pointer event.
  Plot.prototype.at = function (evt) {
    var p = this.svg.createSVGPoint();
    p.x = evt.clientX;
    p.y = evt.clientY;
    var q = p.matrixTransform(this.svg.getScreenCTM().inverse());
    return { px: q.x, py: q.y, x: this.ix(q.x), y: this.iy(q.y) };
  };

  // Tick labels: as few digits as needed, with a proper minus sign.
  function fmtTick(v) {
    if (Math.abs(v) < 1e-9) return "0";
    var s = Math.abs(v) >= 1 ? +v.toFixed(2) : +v.toPrecision(3);
    return String(s).replace("-", "\u2212");
  }
  function fmt(v, d) {
    var s = v.toFixed(d === undefined ? 2 : d);
    if (/^-0(\.0+)?$/.test(s)) s = s.slice(1);
    return s.replace("-", "\u2212");
  }

  // Classical fourth-order Runge–Kutta step for y' = f(t, y), y an array.
  function rk4(f, t, y, h) {
    var n = y.length,
      i,
      a = new Array(n),
      b = new Array(n),
      c = new Array(n);
    var k1 = f(t, y);
    for (i = 0; i < n; i++) a[i] = y[i] + 0.5 * h * k1[i];
    var k2 = f(t + 0.5 * h, a);
    for (i = 0; i < n; i++) b[i] = y[i] + 0.5 * h * k2[i];
    var k3 = f(t + 0.5 * h, b);
    for (i = 0; i < n; i++) c[i] = y[i] + h * k3[i];
    var k4 = f(t + h, c),
      out = new Array(n);
    for (i = 0; i < n; i++) out[i] = y[i] + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
    return out;
  }
  // Integrate from t0 to t1 (h may be negative). stop(t, y) can end the run early. Returns {t: [...], y: [[...], ...]}.
  function solve(f, y0, t0, t1, h, stop) {
    var t = t0,
      y = y0.slice(),
      T = [t],
      Y = [y],
      steps = Math.ceil(Math.abs((t1 - t0) / h));
    for (var s = 0; s < steps; s++) {
      y = rk4(f, t, y, h);
      t += h;
      var ok = true;
      for (var i = 0; i < y.length; i++) if (!isFinite(y[i])) ok = false;
      if (!ok) break;
      T.push(t);
      Y.push(y);
      if (stop && stop(t, y)) break;
    }
    return { t: T, y: Y };
  }
  // Roots of a scalar function on [a, b]: sign changes on a fine grid, refined by bisection.
  function roots(g, a, b, n) {
    n = n || 800;
    var out = [],
      x0 = a,
      g0 = g(a);
    if (g0 === 0) out.push(a);
    for (var i = 1; i <= n; i++) {
      var x1 = a + ((b - a) * i) / n,
        g1 = g(x1);
      if (g1 === 0) out.push(x1);
      else if (g0 * g1 < 0) {
        var lo = x0,
          hi = x1,
          glo = g0;
        for (var k = 0; k < 60; k++) {
          var m = 0.5 * (lo + hi),
            gm = g(m);
          if (glo * gm <= 0) hi = m;
          else {
            lo = m;
            glo = gm;
          }
        }
        out.push(0.5 * (lo + hi));
      }
      x0 = x1;
      g0 = g1;
    }
    return out;
  }

  // Controls -------------------------------------------------------------------------------
  function group(parent, legend) {
    var g = html("div", { class: "mm-group" }, parent);
    if (legend) html("span", { class: "mm-legend" }, g, legend);
    return g;
  }
  // A labelled range input. spec = { label, min, max, step, value, digits, onInput }
  function slider(parent, spec) {
    var lab = html("label", { class: "mm-slider" }, parent);
    var name = html("span", null, lab);
    name.innerHTML = spec.label;
    var input = html("input", { type: "range", min: spec.min, max: spec.max, step: spec.step, value: spec.value }, lab);
    var out = html("output", null, lab);
    var digits = spec.digits === undefined ? 2 : spec.digits;
    function show() {
      out.textContent = fmt(+input.value, digits);
    }
    input.addEventListener("input", function () {
      show();
      spec.onInput(+input.value);
    });
    show();
    return {
      el: lab,
      input: input,
      get: function () {
        return +input.value;
      },
      set: function (v) {
        input.value = v;
        show();
      },
    };
  }
  function checkbox(parent, label, checked, onChange) {
    var lab = html("label", null, parent);
    var input = html("input", { type: "checkbox" }, lab);
    input.checked = !!checked;
    var s = html("span", null, lab);
    s.innerHTML = label;
    input.addEventListener("change", function () {
      onChange(input.checked);
    });
    return input;
  }
  function button(parent, label, onClick) {
    var b = html("button", { type: "button" }, parent);
    b.innerHTML = label;
    b.addEventListener("click", onClick);
    return b;
  }
  function select(parent, options, value, onChange) {
    var s = html("select", null, parent);
    options.forEach(function (o) {
      var op = html("option", { value: o[0] }, s, o[1]);
      if (o[0] === value) op.selected = true;
    });
    s.addEventListener("change", function () {
      onChange(s.value);
    });
    return s;
  }
  // Redraw on resize (once per animation frame).
  function onResize(cb) {
    var pending = false,
      lastW = window.innerWidth;
    window.addEventListener("resize", function () {
      if (pending || window.innerWidth === lastW) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        lastW = window.innerWidth;
        cb();
      });
    });
  }

  // Data helpers ---------------------------------------------------------------------------
  // Seeded random numbers (mulberry32), so that "noisy" example data are the same on every visit.
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // Approximately normal random numbers from a uniform generator.
  function gauss(u) {
    return function () {
      return Math.sqrt(-2 * Math.log(u() + 1e-12)) * Math.cos(2 * Math.PI * u());
    };
  }
  // A tidy axis range and grid step covering [lo, hi], about n grid lines.
  function niceRange(lo, hi, n) {
    if (!(hi > lo)) {
      hi = lo + 1;
      lo = lo - 1;
    }
    var raw = (hi - lo) / (n || 6),
      p = Math.pow(10, Math.floor(Math.log10(raw))),
      m = raw / p,
      step = (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
    return { lo: Math.floor(lo / step + 1e-9) * step, hi: Math.ceil(hi / step - 1e-9) * step, step: step };
  }
  // Least squares: minimise |A c - b| by Householder QR. A is an array of rows. Returns c, or null if rank deficient.
  function lsq(A, b) {
    var m = A.length,
      n = A[0].length,
      R = A.map(function (r) {
        return r.slice();
      }),
      y = b.slice(),
      i,
      j,
      k;
    if (m < n) return null;
    for (k = 0; k < n; k++) {
      var norm = 0;
      for (i = k; i < m; i++) norm += R[i][k] * R[i][k];
      norm = Math.sqrt(norm);
      if (norm < 1e-12) return null;
      var alpha = R[k][k] > 0 ? -norm : norm,
        v = [];
      for (i = 0; i < m; i++) v.push(i < k ? 0 : R[i][k]);
      v[k] -= alpha;
      var vv = 0;
      for (i = k; i < m; i++) vv += v[i] * v[i];
      if (vv < 1e-30) continue;
      for (j = k; j < n; j++) {
        var d = 0;
        for (i = k; i < m; i++) d += v[i] * R[i][j];
        d = (2 * d) / vv;
        for (i = k; i < m; i++) R[i][j] -= d * v[i];
      }
      var dy = 0;
      for (i = k; i < m; i++) dy += v[i] * y[i];
      dy = (2 * dy) / vv;
      for (i = k; i < m; i++) y[i] -= dy * v[i];
    }
    var c = new Array(n);
    for (k = n - 1; k >= 0; k--) {
      var sum = y[k];
      for (j = k + 1; j < n; j++) sum -= R[k][j] * c[j];
      if (Math.abs(R[k][k]) < 1e-12) return null;
      c[k] = sum / R[k][k];
    }
    return c;
  }
  // Solve a tridiagonal system: sub-diagonal a, diagonal b, super-diagonal c, right-hand side d (Thomas algorithm).
  function tridiag(a, b, c, d) {
    var n = b.length,
      cp = new Array(n),
      dp = new Array(n),
      x = new Array(n),
      i;
    cp[0] = c[0] / b[0];
    dp[0] = d[0] / b[0];
    for (i = 1; i < n; i++) {
      var den = b[i] - a[i] * cp[i - 1];
      cp[i] = i < n - 1 ? c[i] / den : 0;
      dp[i] = (d[i] - a[i] * dp[i - 1]) / den;
    }
    x[n - 1] = dp[n - 1];
    for (i = n - 2; i >= 0; i--) x[i] = dp[i] - cp[i] * x[i + 1];
    return x;
  }

  /*
   * Editable data points on a plot: drag to move, click an empty spot to add, double-click (or double-tap)
   * or drag off the plot to remove. The plot is redrawn on every change, so double-clicks are detected here.
   * o = { get: () => points array (mutated in place), min, max, xr, yr (rounding of added points),
   *       sorted (keep points ordered by x), add (default true), onChange }
   */
  function editPoints(plot, o) {
    var svg = plot.svg,
      drag = -1,
      last = { i: -1, t: 0 },
      min = o.min || 2,
      max = o.max || 30;
    function round(v, r) {
      return r ? Math.round(v / r) * r : v;
    }
    function hit(p, pts) {
      var best = -1,
        bd = Math.pow(16 * plot.K, 2);
      pts.forEach(function (q, i) {
        var dx = plot.sx(q[0]) - p.px,
          dy = plot.sy(q[1]) - p.py,
          d = dx * dx + dy * dy;
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      return best;
    }
    function resort(pts, i) {
      if (!o.sorted) return i;
      var moved = pts[i];
      pts.sort(function (u, v) {
        return u[0] - v[0];
      });
      return pts.indexOf(moved);
    }
    svg.addEventListener("pointerdown", function (evt) {
      var p = plot.at(evt),
        pts = o.get(),
        i = hit(p, pts);
      if (i >= 0) {
        evt.preventDefault();
        var now = Date.now(),
          dbl = i === last.i && now - last.t < 400;
        last = { i: i, t: now };
        if (dbl && pts.length > min) {
          pts.splice(i, 1);
          last = { i: -1, t: 0 };
          o.onChange();
          return;
        }
        drag = i;
        svg.setPointerCapture(evt.pointerId);
        o.onChange();
        return;
      }
      if (o.add !== false && plot.inside(p.x, p.y) && pts.length < max) {
        evt.preventDefault();
        pts.push([round(p.x, o.xr), round(p.y, o.yr)]);
        resort(pts, pts.length - 1);
        o.onChange();
      }
    });
    svg.addEventListener("pointermove", function (evt) {
      if (drag < 0) return;
      var p = plot.at(evt),
        pts = o.get(),
        b = plot.o,
        mx = 0.1 * (b.x1 - b.x0),
        my = 0.1 * (b.y1 - b.y0);
      pts[drag] = [Math.min(Math.max(p.x, b.x0 - mx), b.x1 + mx), Math.min(Math.max(p.y, b.y0 - my), b.y1 + my)];
      drag = resort(pts, drag);
      o.onChange();
    });
    function release() {
      if (drag < 0) return;
      var pts = o.get(),
        q = pts[drag],
        b = plot.o;
      if (!plot.inside(q[0], q[1])) {
        if (pts.length > min) pts.splice(drag, 1);
        else pts[drag] = [Math.min(Math.max(q[0], b.x0), b.x1), Math.min(Math.max(q[1], b.y0), b.y1)];
      }
      drag = -1;
      o.onChange();
    }
    svg.addEventListener("pointerup", release);
    svg.addEventListener("pointercancel", release);
    return {
      dragging: function () {
        return drag;
      },
    };
  }

  // Graph y = f(x) across the plot (or [o.x0, o.x1] of opts), breaking the curve where f is undefined
  // and at jumps and vertical asymptotes, which are found by bisecting any large step between samples.
  Plot.prototype.fn = function (f, cls, opts) {
    opts = opts || {};
    var o = this.o,
      a = opts.x0 !== undefined ? opts.x0 : o.x0,
      b = opts.x1 !== undefined ? opts.x1 : o.x1,
      n = opts.n || 700;
    var H = o.y1 - o.y0,
      lo = o.y0 - 3 * H,
      hi = o.y1 + 3 * H,
      pts = [],
      px = NaN,
      py = NaN;
    function clamp(y) {
      return Math.max(lo, Math.min(hi, y));
    }
    function jump(x1, y1, x2, y2) {
      // does f jump (or blow up) between x1 and x2, rather than climb steeply?
      var d0 = Math.abs(y2 - y1);
      for (var k = 0; k < 40; k++) {
        var m = (x1 + x2) / 2,
          ym = f(m);
        if (!isFinite(ym)) return true;
        if (Math.abs(ym - y1) >= Math.abs(y2 - ym)) {
          x2 = m;
          y2 = ym;
        } else {
          x1 = m;
          y1 = ym;
        }
        if (x2 - x1 < 1e-12 * Math.max(1, Math.abs(x1))) break;
      }
      return Math.abs(y2 - y1) > Math.min(0.02 * H, 0.5 * d0);
    }
    for (var i = 0; i <= n; i++) {
      var x = a + ((b - a) * i) / n,
        y = f(x);
      if (!isFinite(y)) {
        pts.push([NaN, NaN]);
        px = NaN;
        continue;
      }
      if (isFinite(py) && Math.abs(y - py) > 0.04 * H && jump(px, py, x, y)) pts.push([NaN, NaN]);
      pts.push([x, clamp(y)]);
      px = x;
      py = y;
    }
    return this.path(pts, cls, opts.parent);
  };

  // Points in [lo, hi] where f breaks: "gap" (an end of the domain), "pole" (|f| grows without bound) or "jump".
  // A large step between samples is examined by a search for the largest |f| in it (which finds a pole, even a
  // symmetric one such as 1/x² at 0), and then by bisection on the size of the step (which finds a jump).
  function breaks(f, lo, hi, n) {
    n = n || 3000;
    var xs = [],
      ys = [],
      out = [],
      i,
      k;
    for (i = 0; i <= n; i++) {
      xs.push(lo + ((hi - lo) * i) / n);
      ys.push(f(xs[i]));
    }
    var fin = ys
        .filter(isFinite)
        .map(Math.abs)
        .sort(function (p, q) {
          return p - q;
        }),
      Hs = fin.length ? fin[Math.floor(0.9 * (fin.length - 1))] + 1 : 1;
    function A(x) {
      var y = f(x);
      return isNaN(y) ? Infinity : Math.abs(y);
    }
    // a step much bigger than the typical step is worth a closer look, even if it is small next to the values
    var st = [];
    for (i = 1; i <= n; i++) if (isFinite(ys[i]) && isFinite(ys[i - 1])) st.push(Math.abs(ys[i] - ys[i - 1]));
    st.sort(function (p, q) {
      return p - q;
    });
    var big = Math.min(0.05 * Hs, 20 * (st.length ? st[Math.floor(st.length / 2)] : 0) + 1e-12 * Hs);
    for (i = 1; i <= n; i++) {
      var a = ys[i - 1],
        b = ys[i],
        u = xs[i - 1],
        v = xs[i];
      if (isFinite(a) !== isFinite(b)) {
        for (k = 0; k < 60; k++) {
          var m0 = (u + v) / 2;
          if (isFinite(f(m0)) === isFinite(a)) u = m0;
          else v = m0;
        }
        out.push({ x: (u + v) / 2, kind: Math.abs(isFinite(a) ? a : b) > 1e6 * Hs ? "pole" : "gap" });
        continue;
      }
      if (!isFinite(a) || Math.abs(b - a) <= big) continue;
      var p = u,
        q = v;
      for (k = 0; k < 90; k++) {
        var m1 = p + (q - p) / 3,
          m2 = q - (q - p) / 3;
        if (A(m1) < A(m2)) p = m1;
        else q = m2;
      }
      var peak = A((p + q) / 2);
      if (!isFinite(peak) || peak > 1e6 * Hs) {
        out.push({ x: (p + q) / 2, kind: "pole" });
        continue;
      }
      var gu = a,
        gv = b;
      for (k = 0; k < 50; k++) {
        var m = (u + v) / 2,
          gm = f(m);
        if (!isFinite(gm)) break;
        if (Math.abs(gm - gu) > Math.abs(gv - gm)) {
          v = m;
          gv = gm;
        } else {
          u = m;
          gu = gm;
        }
      }
      if (Math.abs(gv - gu) > 1e-3 * Hs) out.push({ x: (u + v) / 2, kind: "jump" });
    }
    return out;
  }
  // Isolated points in [lo, hi] where f is undefined although it is defined, and nearly equal, just to either side:
  // removable holes such as x = 1 for (x² − 1)/(x − 1). Sampling would almost always step over them, so test the
  // numbers people tend to use: multiples of decimal steps and of π/12.
  function holes(f, lo, hi) {
    var out = [],
      span = hi - lo,
      seen = {};
    if (!(span > 0)) return out;
    var p = Math.pow(10, Math.floor(Math.log10(span))),
      steps = [p, p / 2, p / 4, p / 10, p / 20, p / 100, Math.PI / 12];
    steps.forEach(function (st) {
      for (var k = Math.ceil(lo / st - 1e-9); k * st <= hi + 1e-9 * span; k++) {
        var c = +(k * st).toPrecision(12),
          key = String(c);
        if (seen[key] || c < lo || c > hi) continue;
        seen[key] = 1;
        if (isFinite(f(c))) continue;
        var e = 1e-7 * Math.max(1, Math.abs(c)),
          yl = f(c - e),
          yr = f(c + e);
        if (isFinite(yl) && isFinite(yr) && Math.abs(yl - yr) < 1e-3 * (1 + Math.abs(yl))) out.push(c);
      }
    });
    return out.sort(function (a, b) {
      return a - b;
    });
  }
  // A step of 1, 2 or 5 times a power of ten, about range/n.
  function niceStep(range, n) {
    var raw = range / (n || 8),
      p = Math.pow(10, Math.floor(Math.log10(raw))),
      m = raw / p;
    return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
  }
  // Labels with as many decimals as the grid step needs, and a proper minus sign.
  function stepFormat(step) {
    var d = Math.max(0, Math.min(10, -Math.floor(Math.log10(step) + 1e-9)));
    return function (v) {
      if (Math.abs(v) < step * 1e-6) return "0";
      return v.toFixed(d).replace("-", "−");
    };
  }
  // Set the window [x0, x1] × [y0, y1] with grid lines and labels to suit it.
  function setWindow(plot, w) {
    var o = plot.o,
      narrow = window.innerWidth < 768;
    o.x0 = w[0];
    o.x1 = w[1];
    o.y0 = w[2];
    o.y1 = w[3];
    o.gx = niceStep(o.x1 - o.x0, narrow ? 6 : 10);
    o.gy = niceStep(o.y1 - o.y0, narrow ? 6 : 8);
    o.lx = (o.x1 - o.x0) / o.gx > (narrow ? 6 : 10) ? 2 * o.gx : o.gx;
    o.ly = (o.y1 - o.y0) / o.gy > 8 ? 2 * o.gy : o.gy;
    o.fx = stepFormat(o.lx);
    o.fy = stepFormat(o.ly);
  }
  // Zoom in, zoom out and reset buttons. getHome() returns the window to reset to; after a change redraw() is called.
  function zoomControls(parent, plots, getHome, redraw) {
    plots = plots.length ? plots : [plots];
    var g = group(parent, "View");
    function zoom(k) {
      plots.forEach(function (plot) {
        var o = plot.o,
          cx = (o.x0 + o.x1) / 2,
          cy = (o.y0 + o.y1) / 2,
          wx = ((o.x1 - o.x0) * k) / 2,
          wy = ((o.y1 - o.y0) * k) / 2;
        setWindow(plot, [cx - wx, cx + wx, cy - wy, cy + wy]);
      });
      redraw();
    }
    button(g, "Zoom in", function () {
      zoom(0.5);
    });
    button(g, "Zoom out", function () {
      zoom(2);
    });
    button(g, "Reset", function () {
      var h = getHome();
      plots.forEach(function (plot, i) {
        setWindow(plot, h[i] && h[i].length ? h[i] : h);
      });
      redraw();
    });
    return g;
  }

  // Typed formulas ---------------------------------------------------------------------------
  // expr("x^2 sin(1/x)") compiles a formula into a function of the given variables (default x) without eval.
  // It accepts + − * / ^, implicit multiplication (2x, 3sin x, (x+1)(x−1), xy), absolute value bars |x|, the constants pi and e,
  // functions such as sin, cos, tan, sec, csc, cot, arcsin (or asin, or sin^-1), sinh, cosh, tanh, exp, ln,
  // log (base 10, as in the textbook), sqrt, cbrt, abs, floor (the greatest integer function), H (the Heaviside function), and
  // function names without brackets (sin 2x means sin(2x); sin x cos x means (sin x)(cos x)). Odd roots of negative numbers are real.
  var FN = {
    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan,
    sec: function (v) {
      return rec(Math.cos(v));
    },
    csc: function (v) {
      return rec(Math.sin(v));
    },
    cot: function (v) {
      return rec(Math.tan(v));
    },
    asin: Math.asin,
    acos: Math.acos,
    atan: Math.atan,
    arcsin: Math.asin,
    arccos: Math.acos,
    arctan: Math.atan,
    sinh: Math.sinh,
    cosh: Math.cosh,
    tanh: Math.tanh,
    sech: function (v) {
      return rec(Math.cosh(v));
    },
    csch: function (v) {
      return rec(Math.sinh(v));
    },
    coth: function (v) {
      return rec(Math.tanh(v));
    },
    asinh: Math.asinh,
    acosh: Math.acosh,
    atanh: Math.atanh,
    exp: Math.exp,
    ln: Math.log,
    log: Math.log10,
    sqrt: Math.sqrt,
    cbrt: Math.cbrt,
    abs: Math.abs,
    floor: Math.floor,
    H: function (v) {
      return v >= 0 ? 1 : v < 0 ? 0 : NaN;
    }, // the Heaviside function, as in the textbook
  };
  var INV = { sin: "asin", cos: "acos", tan: "atan", sinh: "asinh", cosh: "acosh", tanh: "atanh" };
  var CONST = { pi: Math.PI, e: Math.E };
  // a^b with real odd roots of negative numbers (b = p/q with q odd)
  function rec(v) {
    return v === 0 ? NaN : 1 / v;
  }
  function rpow(a, b) {
    if (a === 0 && b <= 0) return NaN; // 0^0 and 1/0^n are undefined
    if (a >= 0 || b === Math.round(b)) return Math.pow(a, b);
    for (var q = 3; q <= 15; q += 2) {
      var p = b * q;
      if (Math.abs(p - Math.round(p)) < 1e-9) return (Math.round(p) % 2 ? -1 : 1) * Math.pow(-a, b);
    }
    return NaN;
  }
  function expr(src, vars) {
    vars = vars || ["x"];
    var s = String(src)
      .replace(/[−–]/g, "-")
      .replace(/[×·⋅]/g, "*")
      .replace(/÷/g, "/")
      .replace(/π/g, "pi")
      .replace(/√/g, "sqrt")
      .replace(/²/g, "^2")
      .replace(/³/g, "^3");
    // tokens
    var toks = [],
      i = 0,
      names = Object.keys(FN)
        .concat(Object.keys(CONST))
        .concat(vars)
        .sort(function (a, b) {
          return b.length - a.length;
        });
    while (i < s.length) {
      var c = s[i],
        m;
      if (/\s/.test(c)) {
        i++;
        continue;
      }
      // numbers (no scientific notation, so that 2e-1 means 2e − 1)
      if ((m = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i)))) {
        if (s[i + m[0].length] === ".") throw new Error("Unexpected \u201c.\u201d");
        toks.push({ t: "n", v: parseFloat(m[0]) });
        i += m[0].length;
        continue;
      }
      if (/[a-zA-Z]/.test(c)) {
        var run = /^[a-zA-Z]+/.exec(s.slice(i))[0],
          j = 0;
        while (j < run.length) {
          var hit = null;
          for (var k = 0; k < names.length; k++)
            if (run.substr(j, names[k].length) === names[k]) {
              hit = names[k];
              break;
            }
          if (!hit) throw new Error("Unknown name “" + run.slice(j) + "”");
          toks.push(
            FN[hit] && vars.indexOf(hit) < 0
              ? { t: "f", v: hit }
              : CONST[hit] !== undefined && vars.indexOf(hit) < 0
                ? { t: "n", v: CONST[hit] }
                : { t: "v", v: vars.indexOf(hit) }
          );
          j += hit.length;
        }
        i += run.length;
        continue;
      }
      if ("+-*/^(),[]|".indexOf(c) >= 0) {
        toks.push({ t: c === "[" ? "(" : c === "]" ? ")" : c });
        i++;
        continue;
      }
      throw new Error("Unexpected “" + c + "”");
    }
    var p = 0,
      absDepth = 0;
    function peek() {
      return toks[p] || { t: "end" };
    }
    function eat(t) {
      if (peek().t !== t) throw new Error(t === ")" ? "Missing “)”" : "Unexpected end of formula");
      p++;
    }
    // a bar starts a factor only when no absolute value is waiting to be closed
    function startsFactor(tk) {
      return tk.t === "n" || tk.t === "v" || tk.t === "f" || tk.t === "(" || (tk.t === "|" && absDepth === 0);
    }
    function sum() {
      var a = term();
      while (peek().t === "+" || peek().t === "-") {
        var op = toks[p++].t;
        a = (function (A, b, plus) {
          return plus
            ? function (e) {
                return A(e) + b(e);
              }
            : function (e) {
                return A(e) - b(e);
              };
        })(a, term(), op === "+");
      }
      return a;
    }
    function term() {
      var a = unary();
      for (;;) {
        var tk = peek(),
          A = a,
          b;
        if (tk.t === "*" || tk.t === "/") {
          p++;
          b = unary();
          a =
            tk.t === "*"
              ? (function (A, b) {
                  return function (e) {
                    return A(e) * b(e);
                  };
                })(A, b)
              : (function (A, b) {
                  return function (e) {
                    var d = b(e);
                    return d === 0 ? NaN : A(e) / d;
                  };
                })(A, b); // 1/0 is undefined, not ∞
        } else if (startsFactor(tk)) {
          b = power();
          a = (function (A, b) {
            return function (e) {
              return A(e) * b(e);
            };
          })(A, b);
        } else return a;
      }
    }
    function unary() {
      if (peek().t === "-") {
        p++;
        var a = unary();
        return function (e) {
          return -a(e);
        };
      }
      if (peek().t === "+") {
        p++;
        return unary();
      }
      return power();
    }
    function power() {
      var a = primary();
      if (peek().t === "^") {
        p++;
        var b = unary();
        return function (e) {
          return rpow(a(e), b(e));
        };
      }
      return a;
    }
    // an argument written without brackets, as in sin 2x or ln x^2: a product of factors, up to the next
    // operator or function name (so sin x cos x is (sin x)(cos x))
    function argument() {
      var a = power();
      while (startsFactor(peek()) && peek().t !== "f") {
        var b = power();
        a = (function (A, B) {
          return function (e) {
            return A(e) * B(e);
          };
        })(a, b);
      }
      return a;
    }
    function primary() {
      var tk = peek();
      if (tk.t === "n") {
        p++;
        var v = tk.v;
        return function () {
          return v;
        };
      }
      if (tk.t === "v") {
        p++;
        var ix = tk.v;
        return function (e) {
          return e[ix];
        };
      }
      if (tk.t === "(") {
        p++;
        var a = sum();
        eat(")");
        return a;
      }
      if (tk.t === "|") {
        p++;
        absDepth++;
        var inner = sum();
        if (peek().t !== "|") throw new Error("Missing closing \u201c|\u201d");
        p++;
        absDepth--;
        return function (e) {
          return Math.abs(inner(e));
        };
      }
      if (tk.t === "f") {
        p++;
        var f = FN[tk.v],
          ex = null;
        if (peek().t === "^") {
          // sin^2 x means (sin x)^2; sin^-1 x (or sin^(-1) x) means arcsin x, as in the textbook
          p++;
          var k2,
            neg = false;
          if (peek().t === "(") {
            p++;
            var kx = sum();
            eat(")");
            k2 = kx([0, 0, 0]);
          } else {
            if (peek().t === "-") {
              neg = true;
              p++;
            }
            if (peek().t !== "n") throw new Error("Expected a number after " + tk.v + "^");
            k2 = toks[p++].v * (neg ? -1 : 1);
          }
          if (!isFinite(k2)) throw new Error("Expected a number after " + tk.v + "^");
          if (k2 === -1 && INV[tk.v]) f = FN[INV[tk.v]];
          else ex = k2;
        }
        var arg;
        if (peek().t === "(") {
          p++;
          arg = sum();
          eat(")");
        } else if (peek().t === "-") {
          p++;
          var na = argument();
          arg = function (e) {
            return -na(e);
          };
        } else if (startsFactor(peek()) && peek().t !== "f") arg = argument();
        else if (peek().t === "f") arg = power();
        else throw new Error("Missing argument for " + tk.v);
        if (ex === null)
          return function (e) {
            return f(arg(e));
          };
        return function (e) {
          return rpow(f(arg(e)), ex);
        };
      }
      throw new Error(tk.t === "end" ? "Unexpected end of formula" : "Unexpected “" + tk.t + "”");
    }
    if (!toks.length) throw new Error("Enter a formula");
    var root = sum();
    if (p < toks.length) throw new Error(peek().t === ")" ? "Unmatched “)”" : "Unexpected “" + (peek().v !== undefined ? peek().v : peek().t) + "”");
    if (vars.length === 1)
      return function (x) {
        return root([x]);
      };
    return function () {
      return root(arguments);
    };
  }
  // Numerical calculus: central differences and composite Simpson's rule.
  function deriv(f, x, h) {
    h = h || 1e-5 * Math.max(1, Math.abs(x));
    return (f(x + h) - f(x - h)) / (2 * h);
  }
  function deriv2(f, x, h) {
    h = h || 1e-4 * Math.max(1, Math.abs(x));
    return (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);
  }
  function integrate(f, a, b, n) {
    n = n || 2000;
    if (n % 2) n++;
    var h = (b - a) / n,
      s = f(a) + f(b);
    for (var i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h);
    return (s * h) / 3;
  }
  // A labelled text box for a formula. onChange(text) is called as the user types; call showError(msg) to flag a problem.
  function textInput(parent, label, value, onChange, width) {
    var lab = html("label", { class: "mm-text" }, parent);
    var name = html("span", null, lab);
    name.innerHTML = label;
    var input = html(
      "input",
      { type: "text", value: value, spellcheck: "false", autocomplete: "off", autocapitalize: "off", style: "width:" + (width || "12rem") },
      lab
    );
    var err = html("span", { class: "mm-err" }, lab);
    input.addEventListener("input", function () {
      onChange(input.value);
    });
    return {
      input: input,
      showError: function (msg) {
        err.textContent = msg || "";
        input.classList.toggle("mm-bad", !!msg);
      },
      set: function (v) {
        input.value = v;
      },
    };
  }

  injectCSS();
  // The widgets write their own HTML; keep MathJax from reading a $ in a readout as the start of mathematics.
  Array.prototype.forEach.call(document.querySelectorAll(".mm-wrap"), function (w) {
    w.classList.add("tex2jax_ignore");
  });
  window.MMTools = {
    el: el,
    html: html,
    Plot: Plot,
    rk4: rk4,
    solve: solve,
    roots: roots,
    fmt: fmt,
    group: group,
    slider: slider,
    checkbox: checkbox,
    button: button,
    select: select,
    onResize: onResize,
    rng: rng,
    gauss: gauss,
    niceRange: niceRange,
    lsq: lsq,
    tridiag: tridiag,
    editPoints: editPoints,
    expr: expr,
    rpow: rpow,
    deriv: deriv,
    deriv2: deriv2,
    integrate: integrate,
    textInput: textInput,
    niceStep: niceStep,
    stepFormat: stepFormat,
    setWindow: setWindow,
    zoomControls: zoomControls,
    breaks: breaks,
    holes: holes,
  };
})();
