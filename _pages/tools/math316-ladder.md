---
layout: page
title: The ladder of powers
description: An interactive tool for MATH 316, week 7. Choose transformations from the ladder of powers to straighten data and find a one-term model.
permalink: /teaching/math316/tools/ladder-of-powers/
---

[← MATH 316]({{ '/teaching/math316/' | relative_url }})

When data curve, a transformation of one or both variables can often straighten them. The transformations are arranged in a ladder, $$\dots,\ z^{-2},\ z^{-1},\ z^{-1/2},\ \ln z,\ z^{1/2},\ z,\ z^{2},\ z^{3}, \dots$$, and moving up or down a rung changes the shape of the data in a predictable way. Once the transformed data lie close to a straight line, fitting that line gives a simple model of the original data. This tool shows the original and the transformed data side by side, with the residuals of the line. It supports learning outcomes 2 and 7.

<div class="mm-wrap" id="ld">
  <div class="mm-controls" id="ld-top"></div>
  <div class="mm-panels mm-2">
    <svg id="ld-orig" role="img" aria-label="Original data with the fitted model"></svg>
    <svg id="ld-tran" role="img" aria-label="Transformed data with the least-squares line"></svg>
  </div>
  <svg id="ld-res" role="img" aria-label="Residuals of the transformed data from the line"></svg>
  <div class="mm-controls" id="ld-controls"></div>
  <p class="mm-readout" id="ld-out"></p>
  <p class="mm-help" id="ld-src"></p>
</div>

## Things to try

1. Start with the **planets**. Which pair of rungs makes the data straightest? What model does that give, and what is the power? This is Kepler's third law.
2. For each data set, look at the residual plot as well as $$r^2$$. Why can a high $$r^2$$ still hide a curved pattern?
3. For **Kuwait's population, 1960–1985**, which transformation straightens the data best? Estimate the annual growth rate from the slope. Does the residual pattern suggest the growth rate stayed the same over the whole period?
4. For the **mystery** data sets, decide which way to move on the ladder by looking at the shape of the data first, then check. When the data bend downwards, which way should you move <em>y</em>? Which way should you move <em>x</em>?
5. Choose a transformation that straightens a data set well, then look at what the model predicts outside the range of the data. Would you trust it there?

## How it is computed

Each variable is transformed by the chosen rung: a power $$z^p$$, or the natural logarithm $$\ln z$$ in place of $$p = 0$$. A straight line $$Y = A + BX$$ is fitted to the transformed data $$(X, Y)$$ by least squares, and $$r^2$$ is the square of the correlation of $$X$$ and $$Y$$. The fitted line is then transformed back to give a model for the original data; for example, $$\ln y = A + B \ln x$$ gives $$y = e^{A} x^{B}$$. Logarithms and negative powers need positive values.

<p class="mm-note">The tool runs entirely in your browser; nothing is recorded or sent anywhere. It is a learning aid and is not assessed.</p>

<script src="{{ '/assets/js/teaching/mm-tools.js' | relative_url }}"></script>
<script>
  (function () {
    var M = window.MMTools;
    var RUNGS = [-2, -1, -0.5, 0, 0.5, 1, 2, 3];
    function noisy(seed, xs, f, sd) {
      var g = M.gauss(M.rng(seed));
      return xs.map(function (x) { return [x, +(f(x) * (1 + sd * g())).toFixed(3)]; });
    }
    function range(a, b, n) { var o = []; for (var i = 0; i < n; i++) o.push(+(a + ((b - a) * i) / (n - 1)).toFixed(3)); return o; }
    var sets = {
      planets: {
        name: "Planets", xv: "a", yv: "T", xname: "semi-major axis, a (AU)", yname: "orbital period, T (years)",
        pts: [[0.387, 0.241], [0.723, 0.615], [1.0, 1.0], [1.524, 1.881], [5.203, 11.862], [9.537, 29.457], [19.19, 84.01], [30.07, 164.8]],
        src: "Mean distances from the Sun and orbital periods of the eight planets (NASA planetary fact sheets, rounded).",
      },
      kuwait: {
        name: "Kuwait's population, 1960–1985", xv: "t", yv: "P", xname: "t, years since 1960", yname: "population, P (millions)",
        pts: [[0, 0.311], [1, 0.346], [2, 0.385], [3, 0.428], [4, 0.473], [5, 0.521], [6, 0.573], [7, 0.628], [8, 0.688], [9, 0.749], [10, 0.809], [11, 0.865], [12, 0.92], [13, 0.978], [14, 1.038], [15, 1.105], [16, 1.179], [17, 1.258], [18, 1.34], [19, 1.424], [20, 1.505], [21, 1.583], [22, 1.662], [23, 1.744], [24, 1.821], [25, 1.894]],
        src: "Kuwait's total population each year from 1960 to 1985. Source: World Bank, <a href=\"https://data.worldbank.org/indicator/SP.POP.TOTL?locations=KW\">World Development Indicators</a> (SP.POP.TOTL), CC BY 4.0.",
      },
      a: { name: "Mystery data A", xv: "x", yv: "y", xname: "x", yname: "y", pts: noisy(11, range(1, 15, 10), function (x) { return 1.8 * Math.sqrt(x); }, 0.03), src: "Made-up data with a little random noise." },
      b: { name: "Mystery data B", xv: "x", yv: "y", xname: "x", yname: "y", pts: noisy(12, range(0, 10, 11), function (x) { return 0.6 * Math.exp(0.3 * x); }, 0.04), src: "Made-up data with a little random noise." },
      c: { name: "Mystery data C", xv: "x", yv: "y", xname: "x", yname: "y", pts: noisy(13, range(0.5, 8, 10), function (x) { return 12 / x; }, 0.04), src: "Made-up data with a little random noise." },
    };
    var key = "planets", px = 1, py = 1;
    function T(v, p) {
      if (p === 0) return v > 0 ? Math.log(v) : NaN;
      if (p < 0) return v > 0 ? Math.pow(v, p) : NaN;
      if (p !== Math.round(p)) return v >= 0 ? Math.pow(v, p) : NaN;
      return Math.pow(v, p);
    }
    function Tinv(Y, p) {
      if (p === 0) return Math.exp(Y);
      if (p === 1) return Y;
      if (p === 3) return Math.cbrt(Y);
      return Y > 0 ? Math.pow(Y, 1 / p) : NaN;
    }
    function rungHTML(v, p) {
      var e = "<em>" + v + "</em>";
      if (p === 0) return "ln " + e;
      if (p === 1) return e;
      var s = { "-2": "−2", "-1": "−1", "-0.5": "−1/2", "0.5": "1/2", "2": "2", "3": "3" }[String(p)];
      return e + "<sup>" + s + "</sup>";
    }
    function rungText(v, p) {
      if (p === 0) return "ln " + v;
      if (p === 1) return v;
      return v + "^" + { "-2": "(−2)", "-1": "(−1)", "-0.5": "(−1/2)", "0.5": "(1/2)", "2": "2", "3": "3" }[String(p)];
    }
    var orig = new M.Plot(document.getElementById("ld-orig"), { x0: 0, x1: 1, y0: 0, y1: 1, gx: 1, gy: 1, aspect: 0.72, aspectNarrow: 0.75, left: 30 });
    var tran = new M.Plot(document.getElementById("ld-tran"), { x0: 0, x1: 1, y0: 0, y1: 1, gx: 1, gy: 1, aspect: 0.72, aspectNarrow: 0.75, left: 30 });
    var res = new M.Plot(document.getElementById("ld-res"), { x0: 0, x1: 1, y0: -1, y1: 1, gx: 1, gy: 1, aspect: 0.22, aspectNarrow: 0.45, left: 30 });
    function setRange(plot, xs, ys, padx, pady, n, keepZero) {
      var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
      var dx = (x1 - x0 || 1) * padx, dy = (y1 - y0 || 1) * pady;
      // with keepZero, axes of non-negative data start at zero rather than a little below it
      var rx = M.niceRange(keepZero && x0 >= 0 ? 0 : x0 - dx, x1 + dx, n), ry = M.niceRange(keepZero && y0 >= 0 ? 0 : y0 - dy, y1 + dy, n);
      plot.o.x0 = rx.lo; plot.o.x1 = rx.hi; plot.o.gx = rx.step; plot.o.lx = rx.step * 2;
      plot.o.y0 = ry.lo; plot.o.y1 = ry.hi; plot.o.gy = ry.step; plot.o.ly = ry.step * 2;
    }
    function draw() {
      var d = sets[key], pts = d.pts;
      document.getElementById("ld-src").innerHTML = d.src;
      var xs = pts.map(function (q) { return q[0]; }), ys = pts.map(function (q) { return q[1]; });
      var X = xs.map(function (v) { return T(v, px); }), Y = ys.map(function (v) { return T(v, py); });
      var ok = X.every(isFinite) && Y.every(isFinite);
      // original data, with zero included on both axes when the data are positive
      setRange(orig, xs.concat([0]), ys.concat([0]), 0.04, 0.06, 6, true);
      orig.o.xname = d.xname; orig.o.yname = d.yname;
      orig.frame();
      var fit = null;
      if (ok) {
        var A = M.lsq(X.map(function (x) { return [1, x]; }), Y);
        if (A) {
          var n = X.length, mx = 0, my = 0;
          X.forEach(function (v, i) { mx += v / n; my += Y[i] / n; });
          var sxy = 0, sxx = 0, syy = 0;
          X.forEach(function (v, i) { sxy += (v - mx) * (Y[i] - my); sxx += (v - mx) * (v - mx); syy += (Y[i] - my) * (Y[i] - my); });
          fit = { a: A[0], b: A[1], r2: sxx > 0 && syy > 0 ? (sxy * sxy) / (sxx * syy) : 1 };
        }
      }
      if (fit) {
        var curve = [], lo = orig.o.x0, hi = orig.o.x1;
        for (var k = 0; k <= 400; k++) {
          var xv = lo + ((hi - lo) * k) / 400, Xv = T(xv, px);
          curve.push([xv, isFinite(Xv) ? Tinv(fit.a + fit.b * Xv, py) : NaN]);
        }
        orig.path(curve, "mm-a");
      }
      pts.forEach(function (q) { orig.circle(q[0], q[1], 3.8, "mm-dot", orig.data); });
      // transformed data
      tran.o.xname = rungText(d.xv, px); tran.o.yname = rungText(d.yv, py);
      if (ok) setRange(tran, X, Y, 0.05, 0.08, 6);
      tran.frame();
      if (ok) {
        if (fit) tran.path([[tran.o.x0, fit.a + fit.b * tran.o.x0], [tran.o.x1, fit.a + fit.b * tran.o.x1]], "mm-a");
        X.forEach(function (v, i) { tran.circle(v, Y[i], 3.8, "mm-dot", tran.data); });
      } else tran.text((tran.o.x0 + tran.o.x1) / 2, (tran.o.y0 + tran.o.y1) / 2, "This rung needs positive values", { "text-anchor": "middle" });
      // residuals
      res.o.xname = rungText(d.xv, px); res.o.yname = "residual";
      if (fit) {
        var R = X.map(function (v, i) { return Y[i] - (fit.a + fit.b * v); }), m = Math.max.apply(null, R.map(Math.abs)) || 1, rr = M.niceRange(-m * 1.15, m * 1.15, 4);
        res.o.x0 = tran.o.x0; res.o.x1 = tran.o.x1; res.o.gx = tran.o.gx; res.o.lx = tran.o.lx;
        res.o.y0 = rr.lo; res.o.y1 = rr.hi; res.o.gy = rr.step; res.o.ly = rr.step * 2;
        res.frame();
        res.path([[res.o.x0, 0], [res.o.x1, 0]], "mm-zero");
        X.forEach(function (v, i) { res.circle(v, R[i], 3.2, "mm-dot", res.data); });
      } else res.frame();
      // readout: the line and the model it gives
      var out = "";
      if (fit) {
        var Xh = rungHTML(d.xv, px), Yh = rungHTML(d.yv, py), xe = "<em>" + d.xv + "</em>", ye = "<em>" + d.yv + "</em>";
        var sgn = fit.b < 0 ? " − " : " + ", B = M.fmt(Math.abs(fit.b), 4), Aa = M.fmt(fit.a, 4);
        out = "Line: " + Yh + " = " + Aa + sgn + B + " " + Xh + ", with <em>r</em><sup>2</sup> = <b>" + M.fmt(fit.r2, 4) + "</b>. ";
        var model = "";
        if (py === 0 && px === 0) model = ye + " = " + M.fmt(Math.exp(fit.a), 4) + " " + xe + "<sup>" + M.fmt(fit.b, 3) + "</sup>";
        else if (py === 0 && px === 1) model = ye + " = " + M.fmt(Math.exp(fit.a), 4) + " <em>e</em><sup>" + M.fmt(fit.b, 4) + xe + "</sup>";
        else if (py === 1) model = ye + " = " + Aa + sgn + B + " " + Xh;
        else if (py === 0) model = ye + " = <em>e</em><sup>" + Aa + sgn + B + " " + Xh + "</sup>";
        else model = ye + " = (" + Aa + sgn + B + " " + Xh + ")<sup>" + { "0.5": "2", "-0.5": "−2", "2": "1/2", "-1": "−1", "-2": "−1/2", "3": "1/3" }[String(py)] + "</sup>";
        out += "Model: <b>" + model + "</b>.";
      } else out = "The chosen transformation needs positive values, and this data set includes zero or negative values.";
      document.getElementById("ld-out").innerHTML = out;
    }
    // controls
    var top = document.getElementById("ld-top");
    M.select(M.group(top, "Data"), Object.keys(sets).map(function (k) { return [k, sets[k].name]; }), key, function (v) { key = v; draw(); });
    var box = document.getElementById("ld-controls"), g = M.group(box, "Ladder");
    function rungSlider(which) {
      var sl = M.slider(g, {
        label: which === "x" ? "<em>x</em> rung" : "<em>y</em> rung", min: 0, max: RUNGS.length - 1, step: 1, value: 5,
        onInput: function (v) { if (which === "x") px = RUNGS[v]; else py = RUNGS[v]; label(); draw(); },
      });
      var out = sl.el.querySelector("output");
      function label() { out.innerHTML = rungHTML(which === "x" ? "x" : "y", RUNGS[sl.get()]); }
      label();
      return sl;
    }
    rungSlider("x");
    rungSlider("y");
    M.onResize(draw);
    draw();
  })();
</script>
