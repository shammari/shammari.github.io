---
layout: page
title: High or low order?
description: An interactive tool for MATH 316, week 7. Fit polynomials of different degrees to data, compare them on points held back from the fit, and use divided differences to choose the degree.
permalink: /teaching/math316/tools/polynomials/
---

[← MATH 316]({{ '/teaching/math316/' | relative_url }})

A polynomial of high enough degree can pass through every data point, but that does not make it a good model. This tool fits a polynomial of any degree by least squares, lets you hold some points back to see how well each fit predicts data it has not seen, and shows the divided-difference table that helps choose a sensible degree. It supports learning outcomes 6 and 7.

<div class="mm-wrap" id="pf">
  <div class="mm-controls" id="pf-top"></div>
  <div class="mm-panels mm-side">
    <svg id="pf-err" role="img" aria-label="Root-mean-square error against degree"></svg>
    <svg id="pf-plot" role="img" aria-label="Data points and the fitted polynomial"></svg>
  </div>
  <div class="mm-controls" id="pf-controls"></div>
  <p class="mm-help">Drag a point to move it; click an empty spot to add one; double-click a point, or drag it off the plot, to remove it. With <b>hold back</b> on, every third point (open circles) is left out of the fit and used to test it. The small panel shows the typical error at each degree on the points used in the fit and, when some are held back, on those points.</p>
  <p class="mm-readout" id="pf-out"></p>
  <h3 style="font-size:1.05rem;margin:1.2rem 0 .3rem">Difference table</h3>
  <div class="mm-scroll"><table class="mm-table" id="pf-dd"></table></div>
  <p class="mm-help">Data sorted by <em>x</em>. Choose plain differences (Δ, Δ², …) or divided differences above. If the <em>k</em>th divided differences are roughly constant, and the next ones are small and change sign, a polynomial of degree <em>k</em> is a reasonable choice.</p>
</div>

## Things to try

1. Choose **Cubic trend, small errors** and increase the degree from 0. How does the fit change? At what degree does it pass through every point?
2. Look at the divided-difference table for the same data. Which column is roughly constant? Does it agree with the degree you would choose from the plot? Now switch to **Cubic trend, larger errors**: what happens to the higher divided differences, and why?
3. With the larger errors, turn on **hold back**. As the degree increases, what happens to the error on the points used in the fit, and on the points held back? Which degree would you choose now, and why?
4. Choose **Runge's example**, which samples a smooth curve at equally spaced points. What happens near the ends of the interval as the degree increases? Would adding more equally spaced points help?
5. Drag one point a little. How much does a degree 2 fit change? How much does the fit through every point change?
6. With **Few points**, add points one at a time. How does the highest possible degree depend on the number of points?
7. Load the textbook's **tape recorder** data. Compare the polynomial through all eight points with a quadratic. Which would you use to predict the elapsed time at a counter reading of 900, and why? Check the difference table: which differences are nearly constant?
8. Load **points on y = x²** and show plain differences. Why are the second differences constant and the third differences zero?
9. Load the textbook's **stopping distance** data. Which divided differences are roughly constant, and where do negative signs start to appear? With degree 2 the fit should be the textbook's quadratic, $$P(v) = 50.0594 - 1.9701v + 0.0886v^2$$. It fits better than $$d = 1.104v + 0.0542v^2$$ from Section 3.4, but what does it predict for a car that is not moving?

## How it is computed

A polynomial $$p(x) = c_0 + c_1 x + \dots + c_k x^k$$ of degree $$k$$ is fitted by least squares, minimizing $$\sum_i [y_i - p(x_i)]^2$$ over the points used in the fit. To keep the computation accurate at high degree, $$x$$ is first rescaled to the interval $$[-1, 1]$$ and the least-squares problem is solved by QR factorization. When the degree is one less than the number of points, the fit passes through every point. The typical error is the root-mean-square deviation, $$\sqrt{\tfrac{1}{m}\sum_i [y_i - p(x_i)]^2}$$. Divided differences are defined by $$f[x_i] = y_i$$ and $$f[x_i, \dots, x_{i+j}] = \dfrac{f[x_{i+1}, \dots, x_{i+j}] - f[x_i, \dots, x_{i+j-1}]}{x_{i+j} - x_i}$$.

<p class="mm-note">The tool runs entirely in your browser; nothing is recorded or sent anywhere. It is a learning aid and is not assessed.</p>

<script src="{{ '/assets/js/teaching/mm-tools.js' | relative_url }}"></script>
<script>
  (function () {
    var M = window.MMTools;
    var X0 = 0, X1 = 10, Y0 = 0, Y1 = 10, MAXDEG = 14, plainDiffs = false;
    // Each data set may have its own axes; made-up data use the square 0–10.
    var plain = { x0: 0, x1: 10, y0: 0, y1: 10, gx: 1, gy: 1, lx: 2, ly: 2, xname: "x", yname: "y", xr: 0.1, yr: 0.1 };
    function make(seed, xs, f, sd) {
      var g = M.gauss(M.rng(seed));
      return xs.map(function (x) { return [x, +(f(x) + sd * g()).toFixed(3)]; });
    }
    function lin(a, b, n) { var o = []; for (var i = 0; i < n; i++) o.push(+(a + ((b - a) * i) / (n - 1)).toFixed(3)); return o; }
    var sets = {
      tape: {
        name: "Tape recorder (textbook)",
        view: { x0: 0, x1: 9, y0: 0, y1: 2500, gx: 1, gy: 250, lx: 1, ly: 500, xname: "counter reading ÷ 100", yname: "elapsed time (s)", xr: 0.1, yr: 1 },
        pts: function () { return [[1, 205], [2, 430], [3, 677], [4, 945], [5, 1233], [6, 1542], [7, 1872], [8, 2224]]; },
      },
      squares: {
        name: "Points on y = x² (textbook)",
        view: { x0: 0, x1: 9, y0: 0, y1: 70, gx: 1, gy: 10, lx: 1, ly: 10, xname: "x", yname: "y", xr: 0.1, yr: 0.5 },
        pts: function () { return [[0, 0], [2, 4], [4, 16], [6, 36], [8, 64]]; },
      },
      cubic: { name: "Cubic trend, small errors", pts: function () { return make(21, lin(0.6, 9.4, 12), function (x) { return 5 + 0.08 * (x - 5) * (x - 2) * (x - 8.5); }, 0.004); } },
      noisy: { name: "Cubic trend, larger errors", pts: function () { return make(23, lin(0.6, 9.4, 12), function (x) { return 5 + 0.08 * (x - 5) * (x - 2) * (x - 8.5); }, 0.3); } },
      runge: { name: "Runge's example", pts: function () { return lin(0.5, 9.5, 11).map(function (x) { var u = (x - 5) / 4.5; return [x, +(1.5 + 7 / (1 + 25 * u * u)).toFixed(3)]; }); } },
      line: { name: "Noisy straight line", pts: function () { return make(22, lin(0.8, 9.2, 13), function (x) { return 1.5 + 0.7 * x; }, 0.45); } },
      few: { name: "Few points", pts: function () { return [[1.5, 3], [4, 6.5], [6.5, 5], [8.5, 7.5]]; } },
      stop: {
        name: "Stopping distance (textbook)", deg: 2,
        view: { x0: 0, x1: 85, y0: 0, y1: 500, gx: 5, gy: 25, lx: 10, ly: 50, xname: "speed, v (mph)", yname: "total stopping distance, d (ft)", xv: "v", yv: "d", xr: 1, yr: 0.5 },
        pts: function () { return [[20, 42], [25, 56], [30, 73.5], [35, 91.5], [40, 116], [45, 142.5], [50, 173], [55, 209.5], [60, 248], [65, 292.5], [70, 343], [75, 401], [80, 464]]; },
      },
    };
    var key = "cubic", pts = sets[key].pts(), deg = 3, hold = false, V = plain;
    var plot = new M.Plot(document.getElementById("pf-plot"), { x0: X0, x1: X1, y0: Y0, y1: Y1, gx: 1, gy: 1, lx: 2, ly: 2, xname: "x", yname: "y", aspect: 0.68, aspectNarrow: 0.78, left: 18 });
    var err = new M.Plot(document.getElementById("pf-err"), { x0: 0, x1: 10, y0: 0, y1: 1, gx: 1, gy: 1, lx: 2, ly: 1, xname: "degree", yname: "typical error", aspect: 1.36, aspectNarrow: 0.55, left: 26 });
    function sorted() { return pts.slice().sort(function (a, b) { return a[0] - b[0]; }); }
    // every third point in x order is held back when hold is on
    function split() {
      var s = sorted(), fitP = [], test = [];
      s.forEach(function (q, i) { (hold && i % 3 === 2 ? test : fitP).push(q); });
      return { fit: fitP, test: test };
    }
    function polyfit(data, k) {
      if (data.length < k + 1) return null;
      var c = (X0 + X1) / 2, h = (X1 - X0) / 2;
      var A = data.map(function (q) { var u = (q[0] - c) / h, row = [], p = 1; for (var j = 0; j <= k; j++) { row.push(p); p *= u; } return row; });
      var coef = M.lsq(A, data.map(function (q) { return q[1]; }));
      if (!coef) return null;
      return function (x) { var u = (x - c) / h, s = 0, p = 1; for (var j = 0; j <= k; j++) { s += coef[j] * p; p *= u; } return s; };
    }
    function rms(f, data) {
      if (!f || !data.length) return NaN;
      var s = 0;
      data.forEach(function (q) { var r = q[1] - f(q[0]); s += r * r; });
      return Math.sqrt(s / data.length);
    }
    function cfmt(v) { return Math.abs(v) >= 0.001 || v === 0 ? M.fmt(v, 4) : v.toExponential(3).replace("-", "−"); }
    function maxDeg(n) { return Math.min(MAXDEG, n - 1); }
    var degSlider;
    function draw() {
      var sp = split(), kmax = maxDeg(sp.fit.length);
      if (deg > kmax) deg = Math.max(0, kmax);
      degSlider.input.max = Math.max(0, kmax);
      degSlider.set(deg);
      var f = polyfit(sp.fit, deg);
      plot.frame();
      if (f) {
        var curve = [];
        for (var i = 0; i <= 600; i++) { var x = X0 + ((X1 - X0) * i) / 600; curve.push([x, f(x)]); }
        plot.path(curve, "mm-a");
      }
      sp.fit.forEach(function (q) { plot.circle(q[0], q[1], 5, "mm-dot", plot.top); });
      sp.test.forEach(function (q) { plot.circle(q[0], q[1], 5, "mm-eq-u", plot.top); });
      // error against degree
      var E = [], top = 0.1;
      for (var k = 0; k <= kmax; k++) {
        var fk = polyfit(sp.fit, k), a = rms(fk, sp.fit), b = rms(fk, sp.test);
        E.push([k, a, b]);
        if (isFinite(a)) top = Math.max(top, a);
        if (isFinite(b)) top = Math.max(top, Math.min(b, 3 * (E[0][1] || 1)));
      }
      var ry = M.niceRange(0, top * 1.1, 4);
      err.o.x1 = Math.max(4, kmax); err.o.gx = err.o.x1 > 10 ? 2 : 1; err.o.lx = err.o.x1 > 10 ? 4 : 2;
      err.o.y1 = ry.hi; err.o.gy = ry.step; err.o.ly = ry.step;
      err.frame();
      err.path([[deg, 0], [deg, ry.hi]], "mm-zero");
      err.path(E.map(function (e) { return [e[0], e[1]]; }), "mm-a");
      E.forEach(function (e) { err.circle(e[0], e[1], 3, "mm-dot", err.data); });
      if (hold) {
        err.path(E.map(function (e) { return [e[0], e[2]]; }), "mm-b");
        E.forEach(function (e) { if (isFinite(e[2]) && e[2] <= ry.hi) { var c = err.circle(e[0], e[2], 3, "mm-dot", err.data); c.style.fill = "var(--mm-b)"; } });
      }
      var ly = err.T - 14 * err.K, R = err.W - err.R, K = err.K;
      M.el("line", { x1: R - 150 * K, y1: ly, x2: R - 132 * K, y2: ly, class: "mm-a" }, err.top);
      M.el("text", { x: R - 128 * K, y: ly + 4 * K }, err.top).textContent = "fitted";
      if (hold) {
        M.el("line", { x1: R - 78 * K, y1: ly, x2: R - 60 * K, y2: ly, class: "mm-b" }, err.top);
        M.el("text", { x: R - 56 * K, y: ly + 4 * K }, err.top).textContent = "held back";
      }
      // readout
      var t = "Degree <b>" + deg + "</b>, fitted to <b>" + sp.fit.length + "</b> points" + (deg === sp.fit.length - 1 ? ", so it passes through every one of them" : "") + ". Typical error on those points: <b>" + M.fmt(rms(f, sp.fit), 3) + "</b>";
      if (hold && sp.test.length) t += "; on the <b>" + sp.test.length + "</b> held-back points: <b>" + M.fmt(rms(f, sp.test), 3) + "</b>";
      t += ".";
      // for low degrees, also give the polynomial in powers of x, as the textbook writes it
      if (deg <= 3 && sp.fit.length > deg) {
        var c = M.lsq(sp.fit.map(function (q) { var r = [], p = 1; for (var j = 0; j <= deg; j++) { r.push(p); p *= q[0]; } return r; }), sp.fit.map(function (q) { return q[1]; }));
        if (c) {
          var xv = "<em>" + (V.xv || "x") + "</em>", e = "<em>" + (V.yv || "y") + "</em> = " + cfmt(c[0]);
          for (var j = 1; j <= deg; j++) e += (c[j] < 0 ? " − " : " + ") + cfmt(Math.abs(c[j])) + xv + (j > 1 ? "<sup>" + j + "</sup>" : "");
          t += " Fitted polynomial: " + e + ".";
        }
      }
      document.getElementById("pf-out").innerHTML = t;
      divided();
    }
    function divided() {
      // Differences (Δ, Δ², ...) or divided differences, as in the textbook's difference tables.
      var s = sorted(), n = s.length, cols = Math.min(n - 1, 8), D = [s.map(function (q) { return q[1]; })];
      for (var j = 1; j <= cols; j++) {
        var prev = D[j - 1], cur = [];
        for (var i = 0; i + j < n; i++) {
          var dx = s[i + j][0] - s[i][0];
          cur.push(plainDiffs ? prev[i + 1] - prev[i] : Math.abs(dx) < 1e-12 ? NaN : (prev[i + 1] - prev[i]) / dx);
        }
        D.push(cur);
      }
      function cell(v) { if (!isFinite(v)) return "—"; var a = Math.abs(v); if (a < 1e-9) return "0"; return (a !== 0 && (a < 1e-3 || a >= 1e4) ? v.toExponential(2) : v.toPrecision(3)).replace("-", "−"); }
      // the data themselves are shown as entered
      function datum(v) { return String(+v.toPrecision(6)).replace("-", "−"); }
      var h = "<thead><tr><th><em>x</em></th><th><em>f</em>[ ]</th>";
      for (var j2 = 1; j2 <= cols; j2++) h += "<th>" + (plainDiffs ? "Δ" + (j2 > 1 ? "<sup>" + j2 + "</sup>" : "") : j2 === 1 ? "1st" : j2 === 2 ? "2nd" : j2 === 3 ? "3rd" : j2 + "th") + "</th>";
      h += "</tr></thead><tbody>";
      for (var r = 0; r < n; r++) {
        h += "<tr><td>" + datum(s[r][0]) + "</td>";
        for (var c = 0; c <= cols; c++) h += "<td" + (c === deg && D[c][r] !== undefined ? " class=\"mm-pc\"" : "") + ">" + (D[c][r] !== undefined ? (c === 0 ? datum(D[c][r]) : cell(D[c][r])) : "") + "</td>";
        h += "</tr>";
      }
      document.getElementById("pf-dd").innerHTML = h + "</tbody>";
    }
    // controls
    var top = document.getElementById("pf-top");
    function setView(v) {
      V = v; X0 = v.x0; X1 = v.x1; Y0 = v.y0; Y1 = v.y1;
      ["x0", "x1", "y0", "y1", "gx", "gy", "lx", "ly", "xname", "yname"].forEach(function (k) { plot.o[k] = v[k]; });
    }
    M.select(M.group(top, "Data"), Object.keys(sets).map(function (k) { return [k, sets[k].name]; }), key, function (v) {
      key = v; pts = sets[v].pts(); setView(sets[v].view || plain);
      if (sets[v].deg !== undefined) deg = sets[v].deg;
      draw();
    });
    M.select(M.group(top, "Table"), [["div", "Divided differences"], ["diff", "Differences"]], "div", function (v) { plainDiffs = v === "diff"; draw(); });
    var box = document.getElementById("pf-controls"), g = M.group(box, "Fit");
    degSlider = M.slider(g, { label: "degree", min: 0, max: MAXDEG, step: 1, value: deg, digits: 0, onInput: function (v) { deg = v; draw(); } });
    M.checkbox(g, "Hold back every third point", hold, function (c) { hold = c; draw(); });
    M.editPoints(plot, { get: function () { return pts; }, min: 2, max: 20, get xr() { return V.xr; }, get yr() { return V.yr; }, onChange: draw });
    M.onResize(draw);
    draw();
  })();
</script>
