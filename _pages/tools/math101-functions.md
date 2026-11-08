---
layout: page
title: Exponential, logarithmic and inverse functions
description: An interactive tool for MATH 101, weeks 1–2. Explore exponential functions, the horizontal line test, inverse functions as reflections in the line y = x, logarithms and hyperbolic functions.
permalink: /teaching/math101/tools/functions/
---

[← MATH 101]({{ '/teaching/math101/' | relative_url }})

A function is **one-to-one** if it never takes the same value twice, and then it has an **inverse function** $$f^{-1}$$, defined by $$f^{-1}(y) = x \iff f(x) = y$$. The graph of $$f^{-1}$$ is the graph of $$f$$ reflected in the line $$y = x$$. This tool draws a function, its reflection and a horizontal line you can drag to test whether the function is one-to-one. It also compares a function with a second one and shows the slope of the tangent at $$x = 0$$, which picks out the number $$e$$ among the bases of exponential functions. It supports learning outcome 1.

<div class="mm-wrap" id="fn">
  <div class="mm-controls" id="fn-top"></div>
  <div class="mm-controls" id="fn-input"></div>
  <svg id="fn-plot" style="max-width:700px;margin:0 auto" role="img" aria-label="Graph of the function, its reflection in y = x and a horizontal line"></svg>
  <div class="mm-controls" id="fn-controls"></div>
  <p class="mm-help">Type a formula, for example <code>2^x</code>, <code>e^(-x)/2 - 1</code>, <code>ln(x - 2) - 1</code> or <code>sqrt(-1 - x)</code>; <code>log</code> is the logarithm to base 10 and <code>ln</code> the natural logarithm, as in the textbook. Leave a domain box empty for no restriction. Drag the horizontal line (or its square handle) up and down.</p>
  <p class="mm-readout" id="fn-out"></p>
</div>

## Things to try

1. Choose **b<sup>x</sup>** and move <em>b</em>. For which bases does the graph rise, and for which does it fall? Turn on the **tangent at x = 0** and find the base for which its slope is exactly 1. That base is the number $$e$$.
2. Choose **2<sup>x</sup> and x<sup>2</sup>**. How many times do the graphs meet, and where? Which function is larger when <em>x</em> is large? Zoom out to check.
3. Choose **x<sup>3</sup> + 2** and turn on the reflection. Drag the horizontal line: does it ever meet the graph more than once? Use the line to read off $$f^{-1}(10)$$, and check it against the formula $$f^{-1}(x) = \sqrt[3]{x - 2}$$.
4. Choose **x<sup>2</sup>**. Find a horizontal line that meets the graph twice. Why is the reflected curve not the graph of a function? Now restrict the domain to start at 0. What is the inverse function?
5. Choose **e<sup>x</sup>**. The reflection is the graph of $$\ln x$$. Read off its domain, its range and its vertical asymptote from the picture.
6. For **sin x** with the domain $$[-\pi/2, \pi/2]$$, the reflection is the graph of $$\sin^{-1} x$$. What are its domain and range? Why must the domain of $$\sin x$$ be restricted first?
7. Compare **e<sup>x</sup>** with the function $$x^{10}$$ (type it as the second function). Which is larger at $$x = 10$$? At $$x = 40$$? What does that say about exponential growth?
8. For the hyperbolic functions **sinh x**, **cosh x** and **tanh x**, which are one-to-one? What domain makes $$\cosh x$$ one-to-one?

## How it is computed

The graph of $$f$$ is drawn from about 700 sample points, broken at gaps and jumps. The reflection is the same set of points with the coordinates swapped, $$(x, f(x)) \mapsto (f(x), x)$$, drawn with equal scales on both axes so that it is a true mirror image in $$y = x$$. The tool calls $$f$$ one-to-one on the chosen domain when the sample values are strictly increasing or strictly decreasing. The points where the horizontal line $$y = c$$ meets the graph, and where two graphs meet, are found as sign changes of $$f(x) - c$$ and $$f(x) - g(x)$$ on a fine grid, refined by bisection. The slope of the tangent at $$x = 0$$ is approximated by the central difference $$[f(h) - f(-h)]/(2h)$$ with a small $$h$$.

<p class="mm-note">The tool runs entirely in your browser; nothing is recorded or sent anywhere. It is a learning aid and is not assessed.</p>

<script src="{{ '/assets/js/teaching/mm-tools.js' | relative_url }}"></script>
<script>
  (function () {
    var M = window.MMTools, PI = Math.PI;
    // Presets: formula, optional second function, domain, window [x0, x1, y0, y1], and which features to show.
    var presets = {
      bx: { name: "b^x (choose b)", f: "b^x", b: 2, win: [-3, 5, -3, 5], inv: false, tan: true },
      ex: { name: "e^x and ln x", f: "e^x", win: [-3, 5, -3, 5], inv: true },
      pow: { name: "2^x and x^2", f: "2^x", g: "x^2", win: [-2, 6, 0, 40], inv: false, eq: false },
      shift: { name: "3 − 2^x", f: "3 - 2^x", win: [-4, 4, -4, 4], inv: false },
      half: { name: "½e^(−x) − 1", f: "e^(-x)/2 - 1", win: [-3, 4, -2, 5], inv: false },
      cube: { name: "x^3 + 2", f: "x^3 + 2", win: [-4, 12, -4, 12], inv: true, hl: 10 },
      sq: { name: "x^2", f: "x^2", win: [-4, 6, -4, 6], inv: true, hl: 4 },
      root: { name: "√(−1 − x)", f: "sqrt(-1 - x)", win: [-5, 3, -5, 3], inv: true, hl: 1 },
      log: { name: "ln(x − 2) − 1", f: "ln(x - 2) - 1", win: [-2, 8, -2, 8], inv: false, hl: 0.5 },
      sin: { name: "sin x on [−π/2, π/2]", f: "sin x", lo: "-pi/2", hi: "pi/2", win: [-2, 2, -2, 2], inv: true, hl: 0.5 },
      tan: { name: "tan x on (−π/2, π/2)", f: "tan x", lo: "-pi/2", hi: "pi/2", win: [-4, 4, -4, 4], inv: true, hl: 1 },
      sinh: { name: "sinh x", f: "sinh x", win: [-4, 4, -4, 4], inv: true },
      cosh: { name: "cosh x", f: "cosh x", win: [-4, 4, -1, 7], inv: true, hl: 2 },
      tanh: { name: "tanh x", f: "tanh x", win: [-4, 4, -4, 4], inv: true, hl: 0.5 },
    };
    var key = "bx", P = presets[key], f = null, g = null, usesB = false, bval = 2, lo = -Infinity, hi = Infinity, c = 1;
    var show = { inv: false, yx: true, hl: true, tan: true };
    var plot = new M.Plot(document.getElementById("fn-plot"), { x0: -3, x1: 5, y0: -3, y1: 5, gx: 1, gy: 1, xname: "x", yname: "y", aspect: 0.8, aspectNarrow: 0.95, left: 26 });
    function parse(txt) { var h = M.expr(txt, ["x", "b"]); return function (x) { return h(x, bval); }; }
    function F(x) { return x < lo || x > hi ? NaN : f(x); }
    // equal scales on both axes, so that the reflection in y = x is a true mirror image
    function equal() {
      var o = plot.o, K = plot.svg.getBoundingClientRect().width > 0 ? 640 / plot.svg.getBoundingClientRect().width : 1;
      var inner = 640 - ((o.left + 10) + 12) * K, a = ((inner * (o.y1 - o.y0)) / (o.x1 - o.x0) + (26 + 40) * K) / 640;
      o.aspect = o.aspectNarrow = Math.max(0.45, Math.min(1.6, a));
    }
    // roots of h on [a, b]: sign changes on a grid, refined by bisection (ignoring jumps through infinity)
    function zeros(h, a, b) {
      var out = [], n = 1500, xs = [], ys = [], i, k;
      for (i = 0; i <= n; i++) { xs.push(a + ((b - a) * i) / n); ys.push(h(xs[i])); }
      // runs of exact zeros: a long one inside the interval means the line lies along the graph; one at either end
      // is a tail where the values have saturated (tanh x = 1 in floating point for x > 19), so it is ignored
      for (i = 0; i <= n; i = k + 1) {
        for (k = i; k <= n && ys[k] === 0; k++);
        k--;
        if (k - i < 1) { k = Math.max(k, i); continue; }
        if (k - i > 20 && flatRun(ys, i, k, n)) { out.coincide = true; return out; }
        if (i === 0 || k === n) { for (var q = i; q <= k; q++) ys[q] = NaN; }
      }
      for (i = 1; i <= n; i++) {
        var xp = xs[i - 1], yp = ys[i - 1], x = xs[i], y = ys[i];
        if (isFinite(y) && isFinite(yp) && (y === 0 || yp * y < 0)) {
          var u = xp, v = x, fu = yp;
          for (k = 0; k < 60; k++) { var m = (u + v) / 2, fm = h(m); if (!isFinite(fm)) break; if (fu * fm <= 0) v = m; else { u = m; fu = fm; } }
          var r = y === 0 ? x : (u + v) / 2;
          if (Math.abs(h(r)) < 1e-6 + 1e-3 * Math.min(Math.abs(yp), Math.abs(y)) && !out.some(function (t) { return Math.abs(t - r) < 1e-6 * (b - a); })) out.push(r);
        }
      }
      return out;
    }
    // Is the run of equal values ys[i..k] a genuinely flat stretch? It is if it fills everything, or if a value next to it
    // differs by more than rounding (a jump, as for H(x), or an ordinary change)
    function flatRun(ys, i, k, n) {
      var v = ys[i], nb = [ys[i - 1], ys[k + 1]].filter(function (w) { return w !== undefined && isFinite(w); });
      if (!nb.length) return true;
      if (i > 0 && k < n) return true;
      return nb.some(function (w) { return Math.abs(w - v) > 1e-9 * (1 + Math.abs(v)); });
    }
    // One-to-one on [a, b]? Join neighbouring samples into short segments (skipping jumps and gaps) and ask whether
    // two segments that are not neighbours cover a common range of values: then some horizontal line meets the graph twice.
    function oneToOne(a, b) {
      var n = 2000, xs = [], ys = [], segs = [], i;
      for (i = 0; i <= n; i++) { xs.push(a + ((b - a) * i) / n); ys.push(F(xs[i])); }
      var fin = ys.filter(isFinite);
      if (fin.length < 2) return false;
      var lo = Math.min.apply(null, fin), hi = Math.max.apply(null, fin), span = hi - lo;
      if (span === 0) return false; // a constant function
      // a flat stretch is hit many times by its own horizontal line; but a stretch at either end where the values have
      // merely saturated (tanh x = 1 in floating point for x > 19) is not flat: there the next value differs only by rounding
      for (i = 0; i <= n; i = k + 1) {
        for (var k = i; k < n && ys[k + 1] === ys[i] && isFinite(ys[i]); k++);
        if (k - i < 20) continue;
        if (flatRun(ys, i, k, n)) return false;
      }
      var steps = [], run;
      for (i = 1; i <= n; i++) if (isFinite(ys[i]) && isFinite(ys[i - 1])) steps.push(Math.abs(ys[i] - ys[i - 1]));
      steps.sort(function (p, q) { return p - q; });
      var big = 50 * (steps[Math.floor(steps.length / 2)] || 0) + 1e-9 * span;
      for (i = 1; i <= n; i++) {
        var u = ys[i - 1], v = ys[i];
        if (!isFinite(u) || !isFinite(v) || Math.abs(v - u) > big) continue; // a jump or an asymptote between samples
        segs.push({ i: i, lo: Math.min(u, v), hi: Math.max(u, v) });
      }
      segs.sort(function (p, q) { return p.lo - q.lo; });
      var tol = 1e-9 * span, active = [];
      for (var k = 0; k < segs.length; k++) {
        var sg = segs[k];
        active = active.filter(function (q) { return q.hi > sg.lo + tol; });
        for (var j = 0; j < active.length; j++) {
          var q = active[j];
          if (Math.abs(q.i - sg.i) > 1 && Math.min(q.hi, sg.hi) - sg.lo > tol && (q.hi - q.lo > tol || sg.hi - sg.lo > tol)) return false;
        }
        active.push(sg);
      }
      return true;
    }
    function num(v) { return Math.abs(v) < 5e-10 ? "0" : String(+v.toPrecision(5)).replace("-", "−"); }
    function draw() {
      var o = plot.o;
      if (show.inv && P.eq !== false) equal(); else { o.aspect = 0.62; o.aspectNarrow = 0.85; }
      plot.frame();
      if (!f) { document.getElementById("fn-out").innerHTML = "Enter a formula for <em>f</em>."; return; }
      var a = Math.max(o.x0, lo), b = Math.min(o.x1, hi);
      if (show.yx) { var d = plot.path([[Math.min(o.x0, o.y0), Math.min(o.x0, o.y0)], [Math.max(o.x1, o.y1), Math.max(o.x1, o.y1)]], "mm-zero"); d.style.strokeDasharray = "5 4"; }
      if (g) plot.fn(g, "mm-c").style.strokeDasharray = "7 4";
      plot.fn(F, "mm-a");
      if (show.inv) {
        // reflection: the points (f(x), x), sampled over a wide range of x so that the reflected curve fills the window
        var A = Math.max(lo, Math.min(o.x0, o.y0) - (o.y1 - o.y0)), B = Math.min(hi, Math.max(o.x1, o.y1) + (o.y1 - o.y0)), pts = [], N = 3000, py = NaN, H = o.x1 - o.x0;
        for (var i = 0; i <= N; i++) {
          var x = A + ((B - A) * i) / N, y = F(x);
          if (!isFinite(y) || Math.abs(y) > 1e4) { pts.push([NaN, NaN]); py = NaN; continue; }
          if (isFinite(py) && Math.abs(y - py) > 0.5 * H) pts.push([NaN, NaN]);
          pts.push([y, x]); py = y;
        }
        plot.path(pts, "mm-b");
      }
      var K = plot.K, txt = [];
      // one-to-one?
      var ca = Math.max(lo, o.x0 - (o.x1 - o.x0)), cb = Math.min(hi, o.x1 + (o.x1 - o.x0)), one = oneToOne(ca, cb);
      var where = isFinite(lo) && isFinite(hi) ? "On this domain" : "For " + (isFinite(lo) ? num(lo) + " ≤ " : num(ca) + " ≤ ") + "<em>x</em>" + (isFinite(hi) ? " ≤ " + num(hi) : " ≤ " + num(cb)) + " (the part of the domain the tool checks),";
      txt.push(one ? where + " <em>f</em> is <b>one-to-one</b>, so it has an inverse function; " + (show.inv ? "the reflected curve (orange) is the graph of <em>f</em><sup>−1</sup>." : "turn on the reflection to see the graph of <em>f</em><sup>−1</sup>.")
        : where + " <em>f</em> is <b>not one-to-one</b>, so it has no inverse function" + (show.inv ? "; the reflected curve fails the vertical line test." : "."));
      if (show.hl) {
        var xs = zeros(function (x) { return F(x) - c; }, Math.max(lo, o.x0 - 3 * (o.x1 - o.x0)), Math.min(hi, o.x1 + 3 * (o.x1 - o.x0)));
        var ln = plot.path([[o.x0, c], [o.x1, c]], "mm-curve"); ln.style.strokeWidth = "1.5";
        var s = 6 * K, hx = plot.W - plot.R - 8 * K;
        M.el("rect", { x: hx - s, y: plot.sy(c) - s, width: 2 * s, height: 2 * s, class: "mm-handle", stroke: "var(--global-text-color)" }, plot.top);
        if (!xs.coincide) xs.slice(0, 50).forEach(function (x) { plot.circle(x, c, 4.5, "mm-eq-u"); });
        if (xs.coincide) txt.push("The line <em>y</em> = " + num(c) + " lies along the graph: <em>f</em> takes this value at every <em>x</em> in an interval.");
        else txt.push("The line <em>y</em> = " + num(c) + " meets the graph " + (xs.length === 0 ? "nowhere" : xs.length === 1 ? "once, at <em>x</em> = " + num(xs[0]) : (xs.length === 2 ? "twice" : xs.length + " times") + ", at <em>x</em> = " + xs.slice(0, 12).map(num).join(", ") + (xs.length > 12 ? ", …" : "")) + "." +
          (one && xs.length === 1 ? " So <em>f</em><sup>−1</sup>(" + num(c) + ") = <b>" + num(xs[0]) + "</b>." : ""));
      }
      if (show.tan && isFinite(F(0))) {
        var m = M.deriv(F, 0), y0 = F(0), hh = 1e-5, mr = (F(hh) - y0) / hh, ml = (y0 - F(-hh)) / hh;
        if (Math.abs(m) < 1e-9) m = 0;
        var mr2 = (F(hh / 100) - y0) / (hh / 100), ml2 = (y0 - F(-hh / 100)) / (hh / 100);
        if (isFinite(mr2) && isFinite(ml2) && Math.abs(mr2) > 3 * Math.abs(mr) && Math.abs(mr2) > 50 && Math.abs(ml2) > 3 * Math.abs(ml)) txt.push("The tangent line at (0, " + num(y0) + ") is vertical, so its slope is undefined.");
        else if (!(isFinite(mr) && isFinite(ml) && Math.abs(mr - ml) < 1e-2 * (1 + Math.abs(m)))) txt.push("The graph has no tangent line at (0, " + num(y0) + "): <em>f</em> is not differentiable there.");
        else if (isFinite(m)) {
          var tl = plot.path([[o.x0, y0 + m * o.x0], [o.x1, y0 + m * o.x1]], "mm-curve"); tl.style.strokeDasharray = "2 3"; tl.style.strokeWidth = "1.4";
          plot.circle(0, y0, 4, "mm-dot");
          txt.push("Slope of the tangent at (0, " + num(y0) + "): <b>" + num(m) + "</b>" + (usesB ? " (ln <em>b</em> = " + num(Math.log(bval)) + ")" : "") + ".");
        }
      }
      if (g) {
        var ix = zeros(function (x) { return F(x) - g(x); }, o.x0, o.x1);
        ix.slice(0, 50).forEach(function (x) { var q = plot.circle(x, g(x), 4.5, "mm-eq-u"); q.style.stroke = "var(--mm-c)"; });
        if (ix.coincide) txt.push("The graphs of <em>f</em> and <em>g</em> coincide on an interval.");
        else txt.push("In this window the graphs of <em>f</em> and <em>g</em> (dashed) meet " + (ix.length ? "at <em>x</em> = " + ix.slice(0, 12).map(num).join(", ") + (ix.length > 12 ? ", …" : "") : "nowhere") + ".");
      }
      document.getElementById("fn-out").innerHTML = txt.join(" ");
    }
    // controls
    var top = document.getElementById("fn-top"), inp = document.getElementById("fn-input"), box = document.getElementById("fn-controls");
    var sel = M.select(M.group(top, "Example"), Object.keys(presets).map(function (k) { return [k, presets[k].name]; }), key, function (v) { load(v); });
    var fIn = M.textInput(inp, "<em>f</em>(<em>x</em>) =", P.f, function (v) { setF(v); draw(); });
    var bG = M.group(inp, ""), bS = M.slider(bG, { label: "<em>b</em>", min: 0.1, max: 5, step: 0.01, value: bval, digits: 2, onInput: function (v) { bval = v; draw(); } });
    var gIn = M.textInput(inp, "second function <em>g</em>(<em>x</em>) =", "", function (v) { setG(v); draw(); }, "8rem");
    var dG = M.group(inp, "Domain");
    var loIn = M.textInput(dG, "from", "", function () { setDom(); draw(); }, "4.5rem"), hiIn = M.textInput(dG, "to", "", function () { setDom(); draw(); }, "4.5rem");
    var gs = M.group(box, "Show");
    var cInv = M.checkbox(gs, "<span style=\"color:var(--mm-b)\">Reflection in <em>y</em> = <em>x</em></span>", show.inv, function (v) { show.inv = v; draw(); });
    M.checkbox(gs, "Line <em>y</em> = <em>x</em>", show.yx, function (v) { show.yx = v; draw(); });
    M.checkbox(gs, "Horizontal line", show.hl, function (v) { show.hl = v; draw(); });
    var cTan = M.checkbox(gs, "Tangent at <em>x</em> = 0", show.tan, function (v) { show.tan = v; draw(); });
    M.zoomControls(box, plot, function () { return P.win; }, draw, { pan: true });
    function setF(v) {
      try { f = parse(v); fIn.showError(""); var h = M.expr(v, ["x", "b"]); usesB = Math.abs(h(1.3, 2) - h(1.3, 3)) > 1e-12; }
      catch (e) { f = null; usesB = false; fIn.showError(e.message); }
      bG.style.display = usesB ? "" : "none";
    }
    function setG(v) {
      if (!v.trim()) { g = null; gIn.showError(""); return; }
      try { g = parse(v); gIn.showError(""); } catch (e) { g = null; gIn.showError(e.message); }
    }
    function setDom() {
      var ok = true;
      [[loIn, -Infinity], [hiIn, Infinity]].forEach(function (q, i) {
        var t = q[0].input.value.trim(), v = q[1];
        if (t) { try { v = M.expr(t)(0); q[0].showError(isFinite(v) ? "" : "not a number"); } catch (e) { q[0].showError(e.message); ok = false; v = q[1]; } }
        else q[0].showError("");
        if (i === 0) lo = v; else hi = v;
      });
      return ok;
    }
    function load(k) {
      key = k; P = presets[k];
      if (P.b) { bval = P.b; bS.set(P.b); }
      fIn.set(P.f); setF(P.f);
      gIn.set(P.g || ""); setG(P.g || "");
      loIn.set(P.lo || ""); hiIn.set(P.hi || ""); setDom();
      show.inv = !!P.inv; cInv.checked = show.inv;
      show.tan = !!P.tan; cTan.checked = show.tan;
      c = P.hl !== undefined ? P.hl : (P.win[2] + P.win[3]) / 2;
      M.setWindow(plot, P.win);
      draw();
    }
    // drag the horizontal line
    var svg = plot.svg, dragging = false;
    svg.addEventListener("pointerdown", function (evt) {
      if (!show.hl) return;
      var p = plot.at(evt);
      if (Math.abs(p.py - plot.sy(c)) < 14 * plot.K) { dragging = true; svg.setPointerCapture(evt.pointerId); evt.preventDefault(); }
    });
    svg.addEventListener("pointermove", function (evt) {
      if (!dragging) return;
      var p = plot.at(evt), o = plot.o, step = M.niceStep(o.y1 - o.y0, 80);
      c = Math.round(Math.min(o.y1, Math.max(o.y0, p.y)) / step) * step;
      draw();
    });
    function release() { dragging = false; }
    svg.addEventListener("pointerup", release);
    svg.addEventListener("pointercancel", release);
    M.onResize(draw);
    load(key);
  })();
</script>
