---
layout: page
title: Riemann sums and the definite integral
description: An interactive tool for MATH 101, week 12. Approximate areas and definite integrals with left, right and midpoint Riemann sums, and watch them approach the integral as the number of rectangles grows.
permalink: /teaching/math101/tools/riemann-sums/
---

[← MATH 101]({{ '/teaching/math101/' | relative_url }})

Divide $$[a, b]$$ into $$n$$ subintervals of equal width $$\Delta x = (b - a)/n$$ and choose a sample point $$x_i^*$$ in each. The **Riemann sum** $$\sum_{i=1}^{n} f(x_i^*)\,\Delta x$$ adds up the areas of rectangles, counted as negative where $$f$$ is negative, and the **definite integral** is its limit,

$$\int_a^b f(x)\,dx = \lim_{n \to \infty} \sum_{i=1}^{n} f(x_i^*)\,\Delta x.$$

With left end points the sum is written $$L_n$$, with right end points $$R_n$$ and with midpoints $$M_n$$ (the Midpoint Rule). This tool draws the rectangles and tabulates the sums, so you can watch them approach the integral, the **net area** under the curve. It supports learning outcome 11.

<div class="mm-wrap" id="rs">
  <div class="mm-controls" id="rs-top"></div>
  <div class="mm-controls" id="rs-input"></div>
  <svg id="rs-plot" role="img" aria-label="Graph of f with the rectangles of a Riemann sum"></svg>
  <div class="mm-controls" id="rs-controls"></div>
  <div class="mm-readout" id="rs-out"></div>
  <div class="mm-scroll"><table class="mm-table" id="rs-tab" style="width:100%"></table></div>
</div>

## Things to try

1. For $$y = x^2$$ on $$[0, 1]$$, check the textbook's values $$L_4 = 0.21875$$ and $$R_4 = 0.46875$$. Why is $$L_n$$ always too small and $$R_n$$ too big here? Watch both approach $$\tfrac{1}{3}$$ as $$n$$ grows, and compare the table with the textbook's.
2. For $$f(x) = x^3 - 6x$$ on $$[0, 3]$$, the textbook computes $$R_6 = -3.9375$$. Which rectangles count as negative? The exact value is $$-6.75$$. How large must $$n$$ be for $$R_n$$ to be within 0.01 of it? How large for $$M_n$$?
3. For $$\displaystyle\int_1^2 \frac{dx}{x}$$, the textbook's Midpoint Rule with $$n = 5$$ gives about $$0.691908$$. Compare with $$\ln 2$$. Which is more accurate for the same $$n$$, the Midpoint Rule or right end points?
4. For $$\sqrt{1 - x^2}$$ on $$[0, 1]$$, the region is a quarter disc. What is the exact integral, and how do the sums approach it?
5. For $$\sin x$$ on $$[0, 2\pi]$$, what is the net area, and why? What is the total area between the curve and the axis?

## How it is computed

With $$\Delta x = (b - a)/n$$ and $$x_i = a + i\,\Delta x$$, the tool computes $$L_n = \sum_{i=1}^{n} f(x_{i-1})\,\Delta x$$, $$R_n = \sum_{i=1}^{n} f(x_i)\,\Delta x$$ and $$M_n = \sum_{i=1}^{n} f\big(\tfrac{1}{2}(x_{i-1} + x_i)\big)\,\Delta x$$ directly. The value of the integral it compares them with is computed by Simpson's rule with 20 000 subintervals, which is accurate to many decimal places for the functions here.

<p class="mm-note">The tool runs entirely in your browser; nothing is recorded or sent anywhere. It is a learning aid and is not assessed.</p>

<script src="{{ '/assets/js/teaching/mm-tools.js' | relative_url }}"></script>
<script>
  (function () {
    var M = window.MMTools;
    var presets = {
      sq: { name: "x² on [0, 1]", f: "x^2", a: "0", b: "1", n: 4, rule: "R", table: [4, 8, 10, 20, 30, 50, 100, 1000], exact: "1/3", win: [-0.1, 1.1, -0.1, 1.15] },
      cubic: { name: "x³ − 6x on [0, 3]", f: "x^3 - 6x", a: "0", b: "3", n: 6, rule: "R", table: [6, 40, 100, 500, 1000, 5000], exact: "−6.75", win: [-0.2, 3.2, -6, 10] },
      exp: { name: "e^(−x) on [0, 2]", f: "e^(-x)", a: "0", b: "2", n: 4, rule: "M", table: [4, 10, 100], exact: "1 − e⁻²", win: [-0.2, 2.2, -0.1, 1.15] },
      recip: { name: "1/x on [1, 2]", f: "1/x", a: "1", b: "2", n: 5, rule: "M", table: [5, 10, 100], exact: "ln 2", win: [0.8, 2.2, -0.1, 1.15] },
      disc: { name: "√(1 − x²) on [0, 1]", f: "sqrt(1 - x^2)", a: "0", b: "1", n: 10, rule: "M", table: [10, 100, 1000], exact: "π/4", win: [-0.1, 1.1, -0.1, 1.15] },
      sin: { name: "sin x on [0, 2π]", f: "sin x", a: "0", b: "2pi", n: 8, rule: "L", table: [8, 20, 100], exact: "0", win: [-0.3, 6.6, -1.3, 1.3] },
    };
    var key = "sq", P = presets[key], f = null, A = 0, B = 1, n = 4, rule = "R";
    var plot = new M.Plot(document.getElementById("rs-plot"), { x0: 0, x1: 1, y0: 0, y1: 1, gx: 1, gy: 1, xname: "x", yname: "y", aspect: 0.55, aspectNarrow: 0.85, left: 30 });
    function num(v, d) { if (!isFinite(v)) return "undefined"; if (Math.abs(v) < 1e-12) return "0"; return String(+v.toFixed(d === undefined ? 7 : d)).replace(/-/g, "−"); }
    function sum(k, r) {
      var dx = (B - A) / k, s = 0;
      for (var i = 1; i <= k; i++) { var x = r === "L" ? A + (i - 1) * dx : r === "R" ? A + i * dx : A + (i - 0.5) * dx; s += f(x); }
      return s * dx;
    }
    // the integral by Simpson's rule, split at jumps; a pole or a gap inside [a, b] (or at an end) means there is no integral
    function reference() {
      var br = M.breaks(f, A, B), e0 = 1e-7 * (B - A), mv = [];
      for (var j = 1; j < 20; j++) { var yj = Math.abs(f(A + ((B - A) * (j + 0.37)) / 20)); if (isFinite(yj)) mv.push(yj); }
      mv.sort(function (p, q) { return p - q; });
      var mid = (mv.length ? mv[Math.floor(mv.length / 2)] : 0) + 1; // a typical size of f
      // a single missing point (sin x/x at 0) does not matter: f is defined and bounded on both sides of it
      function hole(x) { return [x - e0, x + e0].filter(function (z) { return z >= A && z <= B; }).every(function (z) { var y = f(z); return isFinite(y) && Math.abs(y) < 1e4 * mid; }); }
      br = br.filter(function (q) { return q.kind === "jump" || !hole(q.x); });
      var bad = br.filter(function (q) { return q.kind !== "jump"; })[0];
      if (!bad) {
        // unbounded at an end point? (1/x on [0, 1])
        [[A, 1], [B, -1]].forEach(function (e) { var y1 = Math.abs(f(e[0] + e[1] * 1e-6 * (B - A))), y2 = Math.abs(f(e[0] + e[1] * 1e-10 * (B - A))); if (!bad && (y2 === Infinity || (y2 > 1e4 * mid && y2 > 10 * y1))) bad = { x: e[0], kind: "pole" }; });
      }
      if (bad && [bad.x - e0, bad.x + e0].some(function (z) { return z >= A && z <= B && Math.abs(f(z)) >= 1e4 * mid; })) bad = { x: bad.x, kind: "pole" };
      if (bad) return { bad: bad };
      var cuts = [A].concat(br.map(function (q) { return q.x; })).concat([B]), v = 0;
      // a removable hole at a cut (sin x/x at 0) is filled in from a nearby value
      function F(x) { var y = f(x), e = 1e-9 * (B - A); if (isFinite(y)) return y; y = f(x + e); return isFinite(y) ? y : f(x - e); }
      var ep = 1e-10 * (B - A); // stay just inside each piece, so a jump's other value is never used
      for (var i = 0; i < cuts.length - 1; i++) v += M.integrate(F, cuts[i] + (i ? ep : 0), cuts[i + 1] - (i < cuts.length - 2 ? ep : 0), Math.max(2000, Math.round(200000 * (cuts[i + 1] - cuts[i]) / (B - A))));
      return { v: v };
    }
    function draw() {
      plot.frame();
      var out = document.getElementById("rs-out"), tab = document.getElementById("rs-tab");
      if (!f || !isFinite(A) || !isFinite(B) || !(B > A)) { out.innerHTML = "Enter a formula and an interval with <em>a</em> &lt; <em>b</em>."; tab.innerHTML = ""; return; }
      var o = plot.o, dx = (B - A) / n, K = plot.K;
      for (var i = 1; i <= n; i++) {
        var l = A + (i - 1) * dx, x = rule === "L" ? l : rule === "R" ? l + dx : l + dx / 2, y = f(x);
        if (!isFinite(y)) continue;
        var top = Math.max(0, y), bot = Math.min(0, y);
        M.el("rect", { x: plot.sx(l), y: plot.sy(top), width: Math.max(0.5, plot.sx(l + dx) - plot.sx(l)), height: Math.max(0, plot.sy(bot) - plot.sy(top)), style: "fill:" + (y >= 0 ? "var(--mm-c)" : "var(--mm-b)") + ";fill-opacity:.3;stroke:" + (y >= 0 ? "var(--mm-c)" : "var(--mm-b)") + ";stroke-width:" + (n > 60 ? 0 : 1) }, plot.data);
        if (n <= 40) plot.circle(x, y, 2.6, "mm-dot", plot.data);
      }
      plot.path([[o.x0, 0], [o.x1, 0]], "mm-zero");
      plot.fn(f, "mm-a", { n: 1500 });
      var I = reference(), S = sum(n, rule), name = { L: "L", R: "R", M: "M" }[rule];
      var t = "<div>Δ<em>x</em> = (" + num(B, 5) + " − " + (A < 0 ? "(" + num(A, 5) + ")" : num(A, 5)) + ")/" + n + " = " + num(dx, 6) + ". With " + { L: "left end points", R: "right end points", M: "midpoints" }[rule] + ", <b><em>" + name + "</em><sub>" + n + "</sub> = " + num(S) + "</b>.</div>";
      t += "<div><em>L</em><sub>" + n + "</sub> = " + num(sum(n, "L")) + ", <em>R</em><sub>" + n + "</sub> = " + num(sum(n, "R")) + ", <em>M</em><sub>" + n + "</sub> = " + num(sum(n, "M")) + ".</div>";
      var exTxt = P.f === fIn.input.value && P.exact && !/^[−\d.]+$/.test(P.exact) ? P.exact + " ≈ " : /^[−\d.]+$/.test(P.exact || "x") && P.f === fIn.input.value ? "" : "≈ ";
      if (I.bad) t += "<div><em>f</em> " + (I.bad.kind === "pole" ? "is unbounded near" : "is not defined at every point of the interval: see near") + " <em>x</em> = " + num(Math.abs(I.bad.x) < 1e-9 * (B - A) ? 0 : I.bad.x, 4) + ". So it is not integrable on [" + num(A, 5) + ", " + num(B, 5) + "] in the sense of this section: the Riemann sums need not settle down as <em>n</em> grows.</div>";
      else t += "<div>The integral is " + exTxt + "<b>" + num(I.v) + "</b>, so the error of <em>" + name + "</em><sub>" + n + "</sub> is " + num(S - I.v) + ".</div>";
      out.innerHTML = t;
      var ns = P.f === fIn.input.value ? P.table : [4, 10, 100, 1000];
      var h = "<thead><tr><th><em>n</em></th><th><em>L<sub>n</sub></em></th><th><em>R<sub>n</sub></em></th><th><em>M<sub>n</sub></em></th></tr></thead><tbody>";
      ns.forEach(function (k) { h += "<tr" + (k === n ? " class=\"mm-best\"" : "") + "><td>" + k + "</td><td>" + num(sum(k, "L")) + "</td><td>" + num(sum(k, "R")) + "</td><td>" + num(sum(k, "M")) + "</td></tr>"; });
      tab.innerHTML = h + "</tbody>";
    }
    var top = document.getElementById("rs-top"), inp = document.getElementById("rs-input"), box = document.getElementById("rs-controls");
    M.select(M.group(top, "Example"), Object.keys(presets).map(function (k) { return [k, presets[k].name]; }), key, function (v) { load(v); });
    var fIn = M.textInput(inp, "<em>f</em>(<em>x</em>) =", P.f, function (v) { try { f = M.expr(v); fIn.showError(""); } catch (e) { f = null; fIn.showError(e.message); } draw(); });
    var aIn = M.textInput(inp, "<em>a</em> =", P.a, function (v) { A = val(v, aIn); draw(); }, "4rem");
    var bIn = M.textInput(inp, "<em>b</em> =", P.b, function (v) { B = val(v, bIn); draw(); }, "4rem");
    function val(v, b) { try { var r = M.expr(v)(0); b.showError(isFinite(r) ? "" : "not a number"); return r; } catch (e) { b.showError(e.message); return NaN; } }
    var g1 = M.group(box, "Sum");
    var nS = M.slider(g1, { label: "<em>n</em>", min: 1, max: 100, step: 1, value: n, digits: 0, onInput: function (v) { n = v; draw(); } });
    var rSel = M.select(g1, [["L", "left end points (Lₙ)"], ["R", "right end points (Rₙ)"], ["M", "midpoints (Mₙ)"]], rule, function (v) { rule = v; draw(); });
    M.zoomControls(box, plot, function () { return P.win; }, draw);
    function load(k) {
      key = k; P = presets[k];
      fIn.set(P.f); f = M.expr(P.f); fIn.showError(""); aIn.set(P.a); A = val(P.a, aIn); bIn.set(P.b); B = val(P.b, bIn);
      n = P.n; nS.set(n); rule = P.rule; rSel.value = rule;
      M.setWindow(plot, P.win); draw();
    }
    M.onResize(draw);
    load(key);
  })();
</script>
