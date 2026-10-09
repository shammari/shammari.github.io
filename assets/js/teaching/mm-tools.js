/*
 * Shared helpers for the interactive teaching tools: SVG plots that scale for phones,
 * pointer handling, controls, a Runge–Kutta solver and root finding.
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
    ".mm-plot .mm-grid{stroke:var(--global-divider-color);stroke-width:1}",
    ".mm-plot .mm-axis{stroke:var(--global-text-color-light);stroke-width:1}",
    ".mm-plot .mm-zero{stroke:var(--global-text-color-light);stroke-width:1;stroke-dasharray:4 3}",
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
    "@media (max-width:576px){.mm-slider input[type=range]{width:7rem}}",
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
    var narrow = w > 0 && w < 520;
    this.H = Math.round(W * (narrow && o.aspectNarrow ? o.aspectNarrow : o.aspect || 0.62));
    var K = this.K;
    this.L = ((o.left || 30) + 10) * K;
    this.R = 12 * K;
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
      if (mult(g, o.lx || o.gx)) el("text", { x: this.sx(g), y: this.H - this.B + 16 * K, "text-anchor": "middle" }, svg).textContent = fx(g);
    }
    for (g = Math.ceil(o.y0 / o.gy - 1e-9) * o.gy; g <= o.y1 + 1e-9; g += o.gy) {
      el("line", { x1: this.L, y1: this.sy(g), x2: this.W - this.R, y2: this.sy(g), class: "mm-grid" }, svg);
      if (mult(g, o.ly || o.gy)) el("text", { x: this.L - 6 * K, y: this.sy(g) + 4 * K, "text-anchor": "end" }, svg).textContent = fy(g);
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

  function fmtTick(v) {
    var a = Math.abs(v);
    if (a < 1e-9) return "0";
    if (Math.abs(v - Math.round(v)) < 1e-9) return String(Math.round(v));
    return a < 1 ? v.toFixed(2).replace(/0+$/, "") : v.toFixed(1);
  }
  function fmt(v, d) {
    var s = v.toFixed(d === undefined ? 2 : d);
    return /^-0(\.0+)?$/.test(s) ? s.slice(1) : s;
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

  injectCSS();
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
  };
})();
