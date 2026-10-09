---
layout: page
title: Linear and cubic splines
description: An interactive tool for MATH 316, week 8. Compare linear splines with natural and clamped cubic splines, and see how their derivatives behave at the knots.
permalink: /teaching/math316/tools/splines/
---

[← MATH 316]({{ '/teaching/math316/' | relative_url }})

A spline joins data points with a separate simple curve on each interval. A linear spline uses straight lines; a cubic spline uses cubics chosen so that the slope and the curvature match where neighbouring pieces meet. A natural cubic spline has zero second derivative at the two ends, and a clamped one has prescribed slopes there. This tool draws them together, with the interpolating polynomial for comparison, and shows their derivatives. It supports learning outcome 5.

<div class="mm-wrap" id="sp">
  <div class="mm-controls" id="sp-top"></div>
  <div class="mm-panels mm-side">
    <svg id="sp-der" role="img" aria-label="Second (or first) derivative of the splines"></svg>
    <svg id="sp-plot" role="img" aria-label="Data points with linear, natural and clamped cubic splines"></svg>
  </div>
  <div class="mm-controls" id="sp-controls"></div>
  <p class="mm-help">Drag a knot to move it; click an empty spot to add one; double-click a knot, or drag it off the plot, to remove it. For the clamped spline, drag the two square handles to set the slopes at the ends. The small panel shows the derivative chosen below.</p>
  <p class="mm-readout" id="sp-out"></p>
  <h3 style="font-size:1.05rem;margin:1.2rem 0 .3rem">Coefficients</h3>
  <div class="mm-controls" id="sp-coef-ctl"></div>
  <div class="mm-scroll"><table class="mm-table" id="sp-coef"></table></div>
  <p class="mm-help">Piece <em>i</em> is <em>S<sub>i</sub></em>(<em>x</em>) = <em>a<sub>i</sub></em> + <em>b<sub>i</sub></em><em>x</em> + <em>c<sub>i</sub></em><em>x</em><sup>2</sup> + <em>d<sub>i</sub></em><em>x</em><sup>3</sup> on the interval shown.</p>
</div>

## Things to try

1. Compare the **linear** spline with the **natural cubic** spline. Where do they differ most? Which looks smoother, and what exactly is smoother about it?
2. Show the **second derivative**. Check that it is continuous, and straight between knots, for both cubic splines. Where is the natural spline's second derivative zero?
3. Drag the end slopes of the **clamped** spline. How far into the interval does a change at one end make a difference?
4. Choose **Runge's function** and compare the cubic splines with the **interpolating polynomial** as you add knots. Which comes closer to the true curve?
5. Choose **A step**. Where does each cubic spline overshoot the data? Would the linear spline be a better model here?
6. Move a single knot. Which pieces of the linear spline change? Which pieces of the cubic splines change, and by how much?

## How it is computed

On each interval between neighbouring knots, a cubic spline is a cubic written, as in the textbook, in powers of $$x$$: $$S_i(x) = a_i + b_i x + c_i x^2 + d_i x^3$$. Requiring each piece to pass through the knots at its two ends, and neighbouring pieces to have the same slope and the same second derivative where they meet, gives a system of linear equations for the coefficients. The natural spline adds $$S''(x_0) = S''(x_n) = 0$$; the clamped spline adds $$S'(x_0) = s_0$$ and $$S'(x_n) = s_n$$. The tool solves an equivalent, smaller system for the second derivatives at the knots, $$M_i = S''(x_i)$$, which is tridiagonal, and then expands each piece in powers of $$x$$. The interpolating polynomial is the polynomial of lowest degree through all the knots.

<p class="mm-note">The tool runs entirely in your browser; nothing is recorded or sent anywhere. It is a learning aid and is not assessed.</p>

<script src="{{ '/assets/js/teaching/mm-tools.js' | relative_url }}"></script>
<script>
  (function () {
    var M = window.MMTools;
    var X0 = 0, X1 = 10, Y0 = 0, Y1 = 10;
    function runge(x) { var u = (x - 5) / 4.5; return 1.5 + 7 / (1 + 25 * u * u); }
    function wave(x) { return 5 + 3 * Math.sin(0.7 * x); }
    function lin(a, b, n) { var o = []; for (var i = 0; i < n; i++) o.push(+(a + ((b - a) * i) / (n - 1)).toFixed(3)); return o; }
    var sets = {
      runge: { name: "Runge's function", f: runge, pts: function () { return lin(0.5, 9.5, 7).map(function (x) { return [x, +runge(x).toFixed(3)]; }); } },
      wave: { name: "A smooth wave", f: wave, pts: function () { return lin(0.5, 9.5, 6).map(function (x) { return [x, +wave(x).toFixed(3)]; }); } },
      step: { name: "A step", f: null, pts: function () { return [[1, 2], [2.5, 2], [4, 2], [5.5, 7], [7, 7], [8.5, 7]]; } },
      few: { name: "Three points", f: null, pts: function () { return [[2, 3], [5, 7], [8, 4]]; } },
    };
    var key = "runge", pts = sets[key].pts(), slopes = [1, -1];
    var show = { lin: true, nat: true, cla: false, poly: false, truef: true }, der = "2", coefKind = "nat";
    var plot = new M.Plot(document.getElementById("sp-plot"), { x0: X0, x1: X1, y0: Y0, y1: Y1, gx: 1, gy: 1, lx: 2, ly: 2, xname: "x", yname: "y", aspect: 0.68, aspectNarrow: 0.78, left: 18 });
    var dp = new M.Plot(document.getElementById("sp-der"), { x0: X0, x1: X1, y0: -1, y1: 1, gx: 2, gy: 1, lx: 2, ly: 1, xname: "x", yname: "S″(x)", aspect: 1.36, aspectNarrow: 0.5, left: 26 });
    // Cubic spline coefficients for sorted knots; ends = null (natural) or [s0, sn] (clamped).
    function cubic(k, ends) {
      var n = k.length - 1, h = [], i;
      if (n < 1) return null;
      for (i = 0; i < n; i++) h.push(k[i + 1][0] - k[i][0]);
      if (h.some(function (v) { return v <= 1e-9; })) return null;
      var a = new Array(n + 1).fill(0), b = new Array(n + 1).fill(0), c = new Array(n + 1).fill(0), d = new Array(n + 1).fill(0);
      for (i = 1; i < n; i++) {
        a[i] = h[i - 1]; b[i] = 2 * (h[i - 1] + h[i]); c[i] = h[i];
        d[i] = 6 * ((k[i + 1][1] - k[i][1]) / h[i] - (k[i][1] - k[i - 1][1]) / h[i - 1]);
      }
      if (ends) {
        b[0] = 2 * h[0]; c[0] = h[0]; d[0] = 6 * ((k[1][1] - k[0][1]) / h[0] - ends[0]);
        a[n] = h[n - 1]; b[n] = 2 * h[n - 1]; d[n] = 6 * (ends[1] - (k[n][1] - k[n - 1][1]) / h[n - 1]);
      } else {
        b[0] = 1; c[0] = 0; d[0] = 0;
        a[n] = 0; b[n] = 1; d[n] = 0;
      }
      var Mv = M.tridiag(a, b, c, d), co = [];
      for (i = 0; i < n; i++)
        co.push({ x: k[i][0], a: k[i][1], b: (k[i + 1][1] - k[i][1]) / h[i] - (h[i] * (2 * Mv[i] + Mv[i + 1])) / 6, c: Mv[i] / 2, d: (Mv[i + 1] - Mv[i]) / (6 * h[i]) });
      return { co: co, x1: k[n][0] };
    }
    function piece(S, x) {
      var co = S.co, i = 0;
      while (i < co.length - 1 && x > co[i + 1].x) i++;
      return co[i];
    }
    function evalS(S, x, deriv) {
      var p = piece(S, x), t = x - p.x;
      if (deriv === 1) return p.b + 2 * p.c * t + 3 * p.d * t * t;
      if (deriv === 2) return 2 * p.c + 6 * p.d * t;
      return p.a + p.b * t + p.c * t * t + p.d * t * t * t;
    }
    function lagrange(k, x) {
      var s = 0;
      for (var i = 0; i < k.length; i++) {
        var L = 1;
        for (var j = 0; j < k.length; j++) if (j !== i) L *= (x - k[j][0]) / (k[i][0] - k[j][0]);
        s += k[i][1] * L;
      }
      return s;
    }
    function sortedKnots() { return pts.slice().sort(function (u, v) { return u[0] - v[0]; }); }
    // positions of the slope handles for the clamped spline: a fixed screen distance along the end tangents
    function handlePos(k, end) {
      var q = end === 0 ? k[0] : k[k.length - 1], s = slopes[end], dir = end === 0 ? 1 : -1;
      var ux = plot.sx(q[0] + 1) - plot.sx(q[0]), uy = plot.sy(q[1] + s) - plot.sy(q[1]), n = Math.sqrt(ux * ux + uy * uy), L = 46 * plot.K;
      return { px: plot.sx(q[0]) + (dir * ux * L) / n, py: plot.sy(q[1]) + (dir * uy * L) / n, q: q };
    }
    function draw() {
      var k = sortedKnots(), f = sets[key].f;
      var nat = cubic(k, null), cla = cubic(k, slopes);
      plot.frame();
      var N = 600, i, x;
      function curve(fun, x0, x1) { var c = []; for (i = 0; i <= N; i++) { x = x0 + ((x1 - x0) * i) / N; c.push([x, fun(x)]); } return c; }
      if (f && show.truef) { var tp = plot.path(curve(f, X0, X1), "mm-zero"); tp.style.strokeWidth = "1.5"; }
      if (show.poly && k.length > 1) { var pp = plot.path(curve(function (z) { return lagrange(k, z); }, X0, X1), "mm-curve"); pp.style.strokeDasharray = "2 3"; }
      if (show.lin) plot.path(k, "mm-curve");
      if (show.nat && nat) plot.path(curve(function (z) { return evalS(nat, z, 0); }, k[0][0], k[k.length - 1][0]), "mm-a");
      if (show.cla && cla) {
        plot.path(curve(function (z) { return evalS(cla, z, 0); }, k[0][0], k[k.length - 1][0]), "mm-b");
        [0, 1].forEach(function (e) {
          var hp = handlePos(k, e);
          M.el("line", { x1: plot.sx(hp.q[0]), y1: plot.sy(hp.q[1]), x2: hp.px, y2: hp.py, class: "mm-b", style: "stroke-width:1.5" }, plot.top);
          var s = 5.5 * plot.K;
          M.el("rect", { x: hp.px - s, y: hp.py - s, width: 2 * s, height: 2 * s, class: "mm-handle", stroke: "var(--mm-b)" }, plot.top);
        });
      }
      k.forEach(function (q) { plot.circle(q[0], q[1], 5, "mm-dot"); });
      // derivative panel
      var dd = der === "2" ? 2 : 1, lo = 0, hi = 0, curves = [];
      [[show.nat, nat, "mm-a"], [show.cla, cla, "mm-b"]].forEach(function (c) {
        if (!c[0] || !c[1]) return;
        var pts2 = curve(function (z) { return evalS(c[1], z, dd); }, k[0][0], k[k.length - 1][0]);
        pts2.forEach(function (p) { lo = Math.min(lo, p[1]); hi = Math.max(hi, p[1]); });
        curves.push([pts2, c[2]]);
      });
      if (show.lin && dd === 1) {
        var lp = [];
        for (i = 0; i < k.length - 1; i++) { var s1 = (k[i + 1][1] - k[i][1]) / (k[i + 1][0] - k[i][0]); lp.push([k[i][0], s1], [k[i + 1][0], s1], [NaN, NaN]); lo = Math.min(lo, s1); hi = Math.max(hi, s1); }
        curves.push([lp, "mm-curve"]);
      }
      var rr = M.niceRange(lo - 0.1 * (hi - lo || 1), hi + 0.1 * (hi - lo || 1), 5);
      dp.o.y0 = rr.lo; dp.o.y1 = rr.hi; dp.o.gy = rr.step; dp.o.ly = rr.step * 2; dp.o.yname = dd === 2 ? "S″(x)" : "S′(x)";
      dp.frame();
      dp.path([[X0, 0], [X1, 0]], "mm-zero");
      k.forEach(function (q) { var g = dp.path([[q[0], rr.lo], [q[0], rr.hi]], "mm-grid"); g.style.strokeDasharray = "2 3"; });
      curves.forEach(function (c) { dp.path(c[0], c[1]); });
      if (show.lin && dd === 2) dp.text((X0 + X1) / 2, rr.hi - rr.step * 0.4, "linear spline: zero between knots, undefined at them", { "text-anchor": "middle", style: "font-size:" + 10 * dp.K + "px" });
      // readout and coefficient table
      var t = "<b>" + k.length + "</b> knots, so each spline has <b>" + (k.length - 1) + "</b> pieces.";
      if (show.cla) t += " Clamped end slopes: <em>s</em><sub>0</sub> = <b>" + M.fmt(slopes[0]) + "</b>, <em>s</em><sub><em>n</em></sub> = <b>" + M.fmt(slopes[1]) + "</b>.";
      document.getElementById("sp-out").innerHTML = t;
      var S = coefKind === "nat" ? nat : cla, h = "<thead><tr><th><em>i</em></th><th>interval</th><th><em>a<sub>i</sub></em></th><th><em>b<sub>i</sub></em></th><th><em>c<sub>i</sub></em></th><th><em>d<sub>i</sub></em></th></tr></thead><tbody>";
      if (S) S.co.forEach(function (p, j) {
        var x1 = j < S.co.length - 1 ? S.co[j + 1].x : S.x1;
        // expand a + b(x − xi) + c(x − xi)^2 + d(x − xi)^3 in powers of x, as the textbook writes it
        var xi = p.x, A = p.a - p.b * xi + p.c * xi * xi - p.d * xi * xi * xi, B = p.b - 2 * p.c * xi + 3 * p.d * xi * xi, C = p.c - 3 * p.d * xi, D = p.d;
        h += "<tr><td>" + (j + 1) + "</td><td>[" + M.fmt(p.x) + ", " + M.fmt(x1) + "]</td><td>" + M.fmt(A, 4) + "</td><td>" + M.fmt(B, 4) + "</td><td>" + M.fmt(C, 4) + "</td><td>" + M.fmt(D, 4) + "</td></tr>";
      });
      document.getElementById("sp-coef").innerHTML = h + "</tbody>";
    }
    // controls
    var top = document.getElementById("sp-top");
    M.select(M.group(top, "Data"), Object.keys(sets).map(function (k) { return [k, sets[k].name]; }), key, function (v) {
      key = v; pts = sets[v].pts();
      trueBox.parentNode.style.display = sets[v].f ? "" : "none"; // only some data sets come from a known curve
      draw();
    });
    var box = document.getElementById("sp-controls"), g1 = M.group(box, "Show");
    M.checkbox(g1, "Linear", show.lin, function (c) { show.lin = c; draw(); });
    M.checkbox(g1, "<span style=\"color:var(--mm-a)\">Natural cubic</span>", show.nat, function (c) { show.nat = c; draw(); });
    M.checkbox(g1, "<span style=\"color:var(--mm-b)\">Clamped cubic</span>", show.cla, function (c) { show.cla = c; draw(); });
    M.checkbox(g1, "Interpolating polynomial (dotted)", show.poly, function (c) { show.poly = c; draw(); });
    var trueBox = M.checkbox(g1, "True curve (grey dashes)", show.truef, function (c) { show.truef = c; draw(); });
    var g2 = M.group(box, "Small panel");
    M.select(g2, [["2", "Second derivative"], ["1", "First derivative"]], der, function (v) { der = v; draw(); });
    var cg = M.group(document.getElementById("sp-coef-ctl"), "Spline");
    M.select(cg, [["nat", "Natural cubic"], ["cla", "Clamped cubic"]], coefKind, function (v) { coefKind = v; draw(); });
    // pointer: slope handles first, then the knots
    var svg = plot.svg, slopeDrag = -1;
    svg.addEventListener("pointerdown", function (evt) {
      if (!show.cla) return;
      var p = plot.at(evt), k = sortedKnots();
      for (var e = 0; e < 2; e++) {
        var hp = handlePos(k, e);
        if (Math.abs(hp.px - p.px) < 12 * plot.K && Math.abs(hp.py - p.py) < 12 * plot.K) {
          slopeDrag = e; evt.stopImmediatePropagation(); evt.preventDefault(); svg.setPointerCapture(evt.pointerId); return;
        }
      }
    });
    svg.addEventListener("pointermove", function (evt) {
      if (slopeDrag < 0) return;
      evt.stopImmediatePropagation();
      var p = plot.at(evt), k = sortedKnots(), q = slopeDrag === 0 ? k[0] : k[k.length - 1], dx = p.x - q[0];
      if (Math.abs(dx) > 1e-3) slopes[slopeDrag] = Math.max(-20, Math.min(20, Math.round(((p.y - q[1]) / dx) * 100) / 100));
      draw();
    });
    svg.addEventListener("pointerup", function (evt) { if (slopeDrag >= 0) { slopeDrag = -1; evt.stopImmediatePropagation(); } });
    M.editPoints(plot, { get: function () { return pts; }, min: 2, max: 16, xr: 0.1, yr: 0.1, sorted: true, onChange: draw });
    M.onResize(draw);
    draw();
  })();
</script>
