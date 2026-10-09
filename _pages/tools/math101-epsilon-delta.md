---
layout: page
title: The precise definition of a limit
description: An interactive tool for MATH 101, week 3. Given ε, find a δ that works in the precise definition of a limit, and see why no δ works when the limit is wrong or does not exist.
permalink: /teaching/math101/tools/epsilon-delta/
---

[← MATH 101]({{ '/teaching/math101/' | relative_url }})

The precise definition says that $$\lim_{x \to a} f(x) = L$$ if for every number $$\varepsilon > 0$$ there is a number $$\delta > 0$$ such that

$$\text{if } 0 < \lvert x - a\rvert < \delta \text{ then } \lvert f(x) - L\rvert < \varepsilon.$$

In pictures: however thin the horizontal band $$L - \varepsilon < y < L + \varepsilon$$, there is a vertical strip $$a - \delta < x < a + \delta$$ in which the graph (apart from the point at $$a$$ itself) stays inside the band. This tool lets you choose $$\varepsilon$$, try a $$\delta$$ and see whether it works, and finds the largest $$\delta$$ that does. It supports learning outcome 2.

<div class="mm-wrap" id="ed">
  <div class="mm-controls" id="ed-top"></div>
  <div class="mm-controls" id="ed-input"></div>
  <svg id="ed-plot" role="img" aria-label="Graph with the epsilon band and the delta strip"></svg>
  <div class="mm-controls" id="ed-controls"></div>
  <p class="mm-help">The orange band is <em>L</em> − ε &lt; <em>y</em> &lt; <em>L</em> + ε and the green strip is <em>a</em> − δ &lt; <em>x</em> &lt; <em>a</em> + δ. Inside the strip, the graph is green where it stays in the band and red where it leaves it. With <b>follow ε</b> on, the view zooms in as ε shrinks.</p>
  <p class="mm-readout" id="ed-out"></p>
</div>

## Things to try

1. Load the textbook's example $$f(x) = x^3 - 5x + 6$$ with $$a = 1$$, $$L = 2$$ and $$\varepsilon = 0.2$$. The textbook reads $$\delta = 0.08$$ off a graph. Check that it works. What is the largest $$\delta$$ that works, and why is it fine to use a smaller one?
2. For $$f(x) = 2x - 1$$ near 3 and for $$f(x) = 4x - 5$$ near 3, make $$\varepsilon$$ smaller and record the largest $$\delta$$ each time. What formula for $$\delta$$ in terms of $$\varepsilon$$ do you find? Compare it with the textbook's choices $$\delta = \varepsilon/2$$ and $$\delta = \varepsilon/4$$.
3. For $$x^2$$ near 3, the textbook proves the limit with $$\delta = \min\{1, \varepsilon/7\}$$. Compare that $$\delta$$ with the largest one for $$\varepsilon = 1$$, $$0.1$$ and $$0.01$$. Why does the proof not need the largest $$\delta$$?
4. Now set $$L = 9.2$$ for $$x^2$$ near 3. For which $$\varepsilon$$ can you still find a $$\delta$$? What does that say about the claim $$\lim_{x \to 3} x^2 = 9.2$$?
5. For the Heaviside function $$H$$ at 0, try $$L = 0$$, $$L = 1$$ and $$L = 0.5$$ with $$\varepsilon = 0.25$$. Can any $$L$$ work? Switch to a one-sided limit. What changes?
6. For $$\sin(\pi/x)$$ near 0, explain why no $$\delta$$ works for $$\varepsilon = 0.5$$, whatever $$L$$ you choose.
7. For $$\sqrt{x}$$ at 0, only the limit from the right makes sense. Find the largest $$\delta$$ for a few values of $$\varepsilon$$ and compare it with $$\varepsilon^2$$.

## How it is computed

The tool tests the condition $$\lvert f(x) - L\rvert < \varepsilon$$ at several thousand values of $$x$$ on each side of $$a$$ (only one side for a one-sided limit), spaced evenly on a logarithmic scale of the distance $$\lvert x - a\rvert $$ so that very small and larger distances are both covered. The largest $$\delta$$ that works is the distance to the nearest point where the condition fails, refined by bisection; points where $$f$$ is not defined count as failures, because the definition needs $$f$$ to be defined near $$a$$. If the condition fails arbitrarily close to $$a$$, no $$\delta$$ works. Like any sampling method, it can miss a very narrow spike between sample points.

<p class="mm-note">The tool runs entirely in your browser; nothing is recorded or sent anywhere. It is a learning aid and is not assessed.</p>

<script src="{{ '/assets/js/teaching/mm-tools.js' | relative_url }}"></script>
<script>
  (function () {
    var M = window.MMTools;
    // book: the textbook's choice of δ as a function of ε, with its formula
    var presets = {
      ex1: { name: "x³ − 5x + 6 near 1 (textbook)", f: "x^3 - 5x + 6", a: "1", L: "2", eps: 0.2, delta: 0.08, win: [0.8, 1.2, 1.7, 2.3] },
      lin: { name: "2x − 1 near 3", f: "2x - 1", a: "3", L: "5", eps: 0.1, book: [function (e) { return e / 2; }, "ε/2"], win: [2, 4, 3, 7] },
      lin4: { name: "4x − 5 near 3", f: "4x - 5", a: "3", L: "7", eps: 0.1, book: [function (e) { return e / 4; }, "ε/4"], win: [2, 4, 3, 11] },
      sq: { name: "x² near 3", f: "x^2", a: "3", L: "9", eps: 1, book: [function (e) { return Math.min(1, e / 7); }, "min{1, ε/7}"], win: [1, 5, 2, 18] },
      wrong: { name: "x² near 3 with L = 9.2", f: "x^2", a: "3", L: "9.2", eps: 0.5, win: [2, 4, 5, 13] },
      sinc: { name: "sin x / x near 0", f: "sin x / x", a: "0", L: "1", eps: 0.01, win: [-3, 3, 0, 1.3] },
      heav: { name: "Heaviside H(x) near 0", f: "H(x)", a: "0", L: "1", eps: 0.25, win: [-1, 1, -0.5, 1.5] },
      osc: { name: "sin(π/x) near 0", f: "sin(pi/x)", a: "0", L: "0", eps: 0.5, win: [-1, 1, -1.5, 1.5] },
      root: { name: "√x at 0 from the right", f: "sqrt(x)", a: "0", L: "0", eps: 0.5, side: "right", book: [function (e) { return e * e; }, "ε²"], win: [-0.5, 1.5, -0.5, 1.5] },
    };
    var key = "ex1", P = presets[key], f = null, a = 1, L = 2, eps = 0.2, delta = 0.08, side = "both", follow = true;
    var plot = new M.Plot(document.getElementById("ed-plot"), { x0: 0, x1: 1, y0: 0, y1: 1, gx: 1, gy: 1, xname: "x", yname: "y", aspect: 0.6, aspectNarrow: 0.85, left: 34 });
    function num(v, d) { return String(+v.toPrecision(d || 4)).replace("-", "−"); }
    function ok(x) { var y = f(x); return isFinite(y) && Math.abs(y - L) < eps; }
    // |f(x) − L| printed with enough digits to show that it is not less than ε
    function gapTxt(v) { for (var d = 3; d < 12 && +v.toPrecision(d) <= eps && v > eps; d++); return num(v, d) + (v >= eps ? " ≥ ε" : ""); }
    // x printed with enough digits to tell it apart from a; very close to a, also as a ± its distance
    function xNear(x) {
      for (var d = 6; d < 16 && num(x, d) === num(a, d); d++);
      var t = num(x, d), gap = x - a;
      return a !== 0 && Math.abs(gap) < 1e-3 * Math.max(1, Math.abs(a)) ? t + " (that is, " + num(a) + (gap < 0 ? " − " : " + ") + num(Math.abs(gap), 2) + ")" : t;
    }
    // distance from a to the nearest failure on one side (s = ±1), searching out to R
    function nearestFail(s, R) {
      var n = 4000, lo = Math.log(1e-13 * Math.max(1, Math.abs(a))), hi = Math.log(R), prev = 0;
      for (var i = 0; i <= n; i++) {
        var d = Math.exp(lo + ((hi - lo) * i) / n);
        if (!ok(a + s * d)) {
          if (i === 0) return 0;
          var u = prev, v = d;
          for (var k = 0; k < 60; k++) { var m = (u + v) / 2; if (ok(a + s * m)) u = m; else v = m; }
          return u;
        }
        prev = d;
      }
      return Infinity;
    }
    function dmax() {
      var R = Math.max(10, 20 * (plot.o.x1 - plot.o.x0));
      var l = side === "right" ? Infinity : nearestFail(-1, R), r = side === "left" ? Infinity : nearestFail(1, R);
      return { d: Math.min(l, r), R: R };
    }
    // the first failure inside the strip, if any
    function firstFail(d) {
      var n = 3000, worst = null;
      [-1, 1].forEach(function (s) {
        if ((s < 0 && side === "right") || (s > 0 && side === "left")) return;
        for (var i = 1; i < n; i++) { var x = a + (s * d * i) / n; if (!ok(x)) { if (!worst || Math.abs(x - a) < Math.abs(worst - a)) worst = x; break; } }
      });
      return worst;
    }
    function fit(dm) {
      var w = isFinite(dm) && dm > 0 ? Math.max(dm, delta) * 3 : Math.max(delta * 3, 1e-6);
      M.setWindow(plot, [a - w, a + w, L - 3 * eps, L + 3 * eps]);
    }
    function draw() {
      var out = document.getElementById("ed-out");
      if (!f || !isFinite(a) || !isFinite(L)) { plot.frame(); out.innerHTML = "Enter a formula and numbers for <em>a</em> and <em>L</em>."; return; }
      var D = dmax();
      if (follow) fit(D.d);
      plot.frame();
      var o = plot.o, K = plot.K;
      // ε band and δ strip
      M.el("rect", { x: plot.sx(o.x0), y: plot.sy(L + eps), width: plot.sx(o.x1) - plot.sx(o.x0), height: plot.sy(L - eps) - plot.sy(L + eps), style: "fill:var(--mm-b);opacity:.16;stroke:none" }, plot.data);
      var sx0 = side === "right" ? a : a - delta, sx1 = side === "left" ? a : a + delta;
      M.el("rect", { x: plot.sx(sx0), y: plot.sy(o.y1), width: plot.sx(sx1) - plot.sx(sx0), height: plot.sy(o.y0) - plot.sy(o.y1), style: "fill:var(--mm-c);opacity:.16;stroke:none" }, plot.data);
      [L - eps, L + eps].forEach(function (y) { var l = plot.path([[o.x0, y], [o.x1, y]], "mm-b"); l.style.strokeWidth = "1"; l.style.strokeDasharray = "4 3"; });
      [sx0, sx1].forEach(function (x) { var l = plot.path([[x, o.y0], [x, o.y1]], "mm-c"); l.style.strokeWidth = "1"; l.style.strokeDasharray = "4 3"; });
      var c = plot.fn(f, "mm-curve", { n: 2000 }); c.style.opacity = ".55";
      var good = plot.fn(function (x) { return ok(x) ? f(x) : NaN; }, "mm-c", { x0: sx0, x1: sx1, n: 1500 }); good.style.strokeWidth = "3";
      var bad = plot.fn(function (x) { return ok(x) ? NaN : f(x); }, "mm-curve", { x0: sx0, x1: sx1, n: 1500 }); bad.style.stroke = "#c0392b"; bad.style.strokeWidth = "3";
      var hole = plot.circle(a, L, 4.5, "mm-eq-u"); hole.style.stroke = "var(--global-text-color)";
      // readout
      var t = "", fails = firstFail(delta), sideTxt = side === "both" ? "0 &lt; |<em>x</em> − " + num(a) + "| &lt; δ" : side === "right" ? num(a) + " &lt; <em>x</em> &lt; " + num(a) + " + δ" : num(a) + " − δ &lt; <em>x</em> &lt; " + num(a);
      t += "With ε = <b>" + num(eps, 3) + "</b> and δ = <b>" + num(delta, 3) + "</b>: ";
      t += fails === null ? "every <em>x</em> with " + sideTxt + " gives |<em>f</em>(<em>x</em>) − " + num(L) + "| &lt; ε, so <b>this δ works</b>." : "<b>this δ does not work</b>: for example <em>x</em> = " + xNear(fails) + " gives |<em>f</em>(<em>x</em>) − " + num(L) + "| = " + (isFinite(f(fails)) ? gapTxt(Math.abs(f(fails) - L)) : "undefined") + ".";
      if (D.d === Infinity) t += " Every δ up to at least " + num(D.R, 2) + " works.";
      else if (D.d < 1e-11 * Math.max(1, Math.abs(a))) t += " The condition fails arbitrarily close to " + num(a) + ", so <b>no δ works</b> for this ε: the limit is not " + num(L) + (side === "both" ? "" : " from this side") + ".";
      else t += " The largest δ that works is about <b>" + num(D.d, 4) + "</b>.";
      if (P.book && P.f === fIn.input.value && D.d >= 1e-11 * Math.max(1, Math.abs(a))) t += " The textbook's choice δ = " + P.book[1] + " gives " + num(P.book[0](eps), 4) + ".";
      out.innerHTML = t;
      lastD = D.d;
    }
    var lastD = NaN;
    // controls
    var top = document.getElementById("ed-top"), inp = document.getElementById("ed-input"), box = document.getElementById("ed-controls");
    M.select(M.group(top, "Example"), Object.keys(presets).map(function (k) { return [k, presets[k].name]; }), key, function (v) { load(v); });
    var sideSel = M.select(M.group(top, "Limit"), [["both", "two-sided"], ["right", "from the right"], ["left", "from the left"]], side, function (v) { side = v; draw(); });
    var fIn = M.textInput(inp, "<em>f</em>(<em>x</em>) =", P.f, function (v) { setF(v); draw(); });
    var aIn = M.textInput(inp, "<em>a</em> =", P.a, function (v) { a = val(v, aIn); draw(); }, "4.5rem");
    var LIn = M.textInput(inp, "<em>L</em> =", P.L, function (v) { L = val(v, LIn); draw(); }, "4.5rem");
    function logSlider(parent, label, lo, hi, value, set) {
      var cur = value, s = M.slider(parent, { label: label, min: lo, max: hi, step: 0.01, value: Math.log10(value), onInput: function (v) { cur = +Math.pow(10, v).toPrecision(3); set(cur); show(); draw(); } });
      var o = s.el.querySelector("output");
      function show() { o.textContent = num(cur, 3); }
      show();
      return { set: function (v) { cur = v; s.set(Math.log10(v)); show(); } };
    }
    var g1 = M.group(box, "Choose");
    var eS = logSlider(g1, "ε", -3, 0.3, eps, function (v) { eps = v; follow = true; fc.checked = true; });
    var dS = logSlider(g1, "δ", -5, 0.3, delta, function (v) { delta = v; });
    M.button(g1, "Largest δ", function () { if (isFinite(lastD) && lastD > 0) { delta = lastD * 0.999; dS.set(delta); draw(); } });
    var g2 = M.zoomControls(box, plot, function () { return P.win; }, function () { follow = false; fc.checked = false; draw(); });
    var fc = M.checkbox(g2, "Follow ε", follow, function (v) { follow = v; draw(); });
    function val(v, box) { try { var r = M.expr(v)(0); box.showError(isFinite(r) ? "" : "not a number"); return r; } catch (e) { box.showError(e.message); return NaN; } }
    function setF(v) { try { f = M.expr(v); fIn.showError(""); } catch (e) { f = null; fIn.showError(e.message); } }
    function load(k) {
      key = k; P = presets[k];
      fIn.set(P.f); setF(P.f); aIn.set(P.a); a = val(P.a, aIn); LIn.set(P.L); L = val(P.L, LIn);
      side = P.side || "both"; sideSel.value = side;
      eps = P.eps; eS.set(eps);
      delta = P.delta || (P.book ? P.book[0](eps) : eps / 2); dS.set(delta);
      follow = false; fc.checked = false;
      M.setWindow(plot, P.win);
      draw();
    }
    M.onResize(draw);
    load(key);
  })();
</script>
