---
layout: page
title: Limits from tables and graphs
description: An interactive tool for MATH 101, weeks 2–4. Estimate limits, one-sided limits, infinite limits and limits at infinity from tables of values and graphs, and see when a table can mislead.
permalink: /teaching/math101/tools/limits/
---

[← MATH 101]({{ '/teaching/math101/' | relative_url }})

We write $$\lim_{x \to a} f(x) = L$$ if we can make the values of $$f(x)$$ as close to $$L$$ as we like by taking $$x$$ close enough to $$a$$, but not equal to $$a$$. A table of values and a graph are good ways to guess a limit, but they can also mislead. This tool tabulates $$f(x)$$ as $$x$$ approaches $$a$$ from the left and from the right, or as $$x$$ grows without bound, plots the same points on the graph, and gives a cautious verdict. It supports learning outcome 2.

<div class="mm-wrap" id="lm">
  <div class="mm-controls" id="lm-top"></div>
  <div class="mm-controls" id="lm-input"></div>
  <svg id="lm-plot" role="img" aria-label="Graph of the function with the tabulated points"></svg>
  <div class="mm-controls" id="lm-controls"></div>
  <p class="mm-help">Type a formula such as <code>sin x / x</code> or <code>(sqrt(x^2 + 9) - 3)/x^2</code>, and the number that <em>x</em> approaches (or <code>inf</code> or <code>-inf</code>). <code>H(x)</code> is the Heaviside function, <code>floor(x)</code> the greatest integer function and <code>abs(x)</code> the absolute value. Orange points come from the left, green points from the right.</p>
  <p class="mm-readout" id="lm-out"></p>
  <div class="mm-panels mm-2" id="lm-tables"></div>
</div>

## Things to try

1. Start with **x<sup>2</sup> − x + 2** as $$x \to 2$$. Compare the table with the value $$f(2)$$. Why do we expect the limit to equal $$f(2)$$ here?
2. For $$\dfrac{x - 1}{x^2 - 1}$$ as $$x \to 1$$, $$f(1)$$ is not defined. Does that stop the limit from existing? Simplify the formula to see why the graph has a hole.
3. For $$\dfrac{\sqrt{x^2 + 9} - 3}{x^2}$$ as $$x \to 0$$, move the **smallest step** slider down to $$10^{-8}$$. What happens to the values in the table, and why? The textbook warns that a calculator can give the same false values.
4. For $$\sin(\pi/x)$$, use the **textbook's values**. They suggest a limit of 0. Switch to the steps $$0.1, 0.01, \ldots$$ and zoom in on the graph. Why is the table misleading, and what really happens near 0?
5. For $$x^3 + \dfrac{\cos 5x}{10\,000}$$, the first few values suggest a limit of 0. What does the table show when you go further?
6. Compare the one-sided limits of $$H(x)$$ and of $$\lvert x\rvert /x$$ at 0, and of the greatest integer function at 3. When does a limit fail to exist even though both one-sided limits exist?
7. For $$1/x^2$$ and $$\dfrac{2x}{x - 3}$$, what happens near the vertical line? When can we write $$\lim = \infty$$?
8. Load the limits at infinity. Read off the horizontal asymptotes. For $$\dfrac{\sqrt{2x^2 + 1}}{3x - 5}$$, compare $$x \to \infty$$ with $$x \to -\infty$$. For $$\sin x$$ as $$x \to \infty$$, why is there no limit?

## How it is computed

For a number $$a$$, the table lists $$f(a - h)$$ and $$f(a + h)$$ for steps $$h = 0.1, 0.01, \ldots$$ down to the smallest step chosen, or the values used in the textbook. For $$a = \pm\infty$$ it lists $$f(x)$$ for $$x = \pm 1, \pm 10, \pm 100, \ldots$$ The verdict uses its own, more careful sample: it compares the values at $$a \pm h$$ for $$h = 10^{-2}, 10^{-3}, 10^{-4}$$ with those at slightly shifted points, so that it is not fooled by functions such as $$\sin(\pi/x)$$ that happen to vanish at $$x = 0.1, 0.01, \ldots$$ It reports a one-sided limit only when the values settle down, and an infinite limit only when they grow steadily in size. Like any table, it can still be fooled, which is why limits are found exactly with the limit laws.

<p class="mm-note">The tool runs entirely in your browser; nothing is recorded or sent anywhere. It is a learning aid and is not assessed.</p>

<script src="{{ '/assets/js/teaching/mm-tools.js' | relative_url }}"></script>
<script>
  (function () {
    var M = window.MMTools;
    function neg(xs) { return xs.map(function (x) { return -x; }); }
    var presets = {
      poly: { name: "x² − x + 2 as x → 2", f: "x^2 - x + 2", a: "2", L: [1, 1.5, 1.8, 1.9, 1.95, 1.99, 1.995, 1.999], R: [3, 2.5, 2.2, 2.1, 2.05, 2.01, 2.005, 2.001], win: [-0.5, 4, -0.5, 9] },
      hole: { name: "(x − 1)/(x² − 1) as x → 1", f: "(x - 1)/(x^2 - 1)", a: "1", L: [0.5, 0.9, 0.99, 0.999, 0.9999], R: [1.5, 1.1, 1.01, 1.001, 1.0001], win: [-0.5, 2.5, -0.2, 1.2] },
      root: { name: "(√(x² + 9) − 3)/x² as x → 0", f: "(sqrt(x^2 + 9) - 3)/x^2", a: "0", L: neg([1, 0.5, 0.1, 0.05, 0.01]), R: [1, 0.5, 0.1, 0.05, 0.01], win: [-5, 5, 0.1, 0.2] },
      sinc: { name: "sin x / x as x → 0", f: "sin x / x", a: "0", L: neg([1, 0.5, 0.4, 0.3, 0.2, 0.1, 0.05, 0.01, 0.005, 0.001]), R: [1, 0.5, 0.4, 0.3, 0.2, 0.1, 0.05, 0.01, 0.005, 0.001], win: [-10, 10, -0.4, 1.2] },
      osc: { name: "sin(π/x) as x → 0", f: "sin(pi/x)", a: "0", L: neg([1, 0.5, 1 / 3, 0.25, 0.1, 0.01]), R: [1, 0.5, 1 / 3, 0.25, 0.1, 0.01], win: [-1, 1, -1.5, 1.5] },
      tiny: { name: "x³ + cos(5x)/10 000 as x → 0", f: "x^3 + cos(5x)/10000", a: "0", L: neg([1, 0.5, 0.1, 0.05, 0.01, 0.005, 0.001]), R: [1, 0.5, 0.1, 0.05, 0.01, 0.005, 0.001], win: [-1, 1, -0.5, 1.5] },
      heav: { name: "H(x) as x → 0", f: "H(x)", a: "0", win: [-2, 2, -0.5, 1.5] },
      sign: { name: "|x|/x as x → 0", f: "abs(x)/x", a: "0", win: [-2, 2, -1.6, 1.6] },
      floor: { name: "greatest integer ⟦x⟧ as x → 3", f: "floor(x)", a: "3", win: [0, 5, -0.5, 5] },
      inv2: { name: "1/x² as x → 0", f: "1/x^2", a: "0", L: neg([1, 0.5, 0.2, 0.1, 0.05, 0.01, 0.001]), R: [1, 0.5, 0.2, 0.1, 0.05, 0.01, 0.001], win: [-3, 3, -1, 20] },
      vert: { name: "2x/(x − 3) as x → 3", f: "2x/(x - 3)", a: "3", L: [2.9, 2.99, 2.999], R: [3.1, 3.01, 3.001], win: [-2, 8, -20, 25] },
      squeeze: { name: "x² sin(1/x) as x → 0", f: "x^2 sin(1/x)", a: "0", win: [-0.5, 0.5, -0.25, 0.25] },
      inf1: { name: "(x² − 1)/(x² + 1) as x → ∞", f: "(x^2 - 1)/(x^2 + 1)", a: "inf", R: [0, 1, 2, 3, 4, 5, 10, 50, 100, 1000], win: [-10, 10, -1.5, 2] },
      inf2: { name: "(3x² − x − 2)/(5x² + 4x + 1) as x → ∞", f: "(3x^2 - x - 2)/(5x^2 + 4x + 1)", a: "inf", win: [-10, 30, -1.5, 2] },
      inf3: { name: "√(2x² + 1)/(3x − 5) as x → ∞", f: "sqrt(2x^2 + 1)/(3x - 5)", a: "inf", win: [-30, 30, -2, 2] },
      expn: { name: "e^x as x → −∞", f: "e^x", a: "-inf", R: [0, -1, -2, -3, -5, -8, -10], win: [-10, 3, -0.5, 3] },
      sinf: { name: "sin x as x → ∞", f: "sin x", a: "inf", win: [-2, 40, -1.6, 1.6] },
    };
    var key = "poly", P = presets[key], f = null, a = 2, kmax = 6, useBook = true;
    var plot = new M.Plot(document.getElementById("lm-plot"), { x0: 0, x1: 1, y0: 0, y1: 1, gx: 1, gy: 1, xname: "x", yname: "y", aspect: 0.55, aspectNarrow: 0.85, left: 30 });
    function num(v, d) {
      if (!isFinite(v)) return v === Infinity ? "∞" : v === -Infinity ? "−∞" : "undefined";
      if (Math.abs(v) < 1e-14) return "0"; // rounding error, such as sin(π) = 1.2×10⁻¹⁶, is shown as 0
      var s = Math.abs(v) >= 1e9 || Math.abs(v) < 1e-6 ? v.toExponential((d || 9) - 1).replace(/\.?0+e/, "e").replace("e", "×10^").replace("+", "") : String(+v.toPrecision(d || 9));
      return s.replace(/-/g, "−").replace(/×10\^(−?\d+)/, "×10<sup>$1</sup>");
    }
    // A cautious verdict on the trend of f along points whose distance from a (or 1/x) shrinks tenfold each step.
    // The estimate is extrapolated from the last three values and checked against slightly shifted points.
    function trend(pts, alt) {
      var v = pts.map(f), w = alt.map(f), n = v.length;
      // infinite limits: steady growth in size with one sign, slow growth with equal steps (like ln x), or overflow
      if (v.some(isNaN)) return { kind: "undefined" };
      var last = v.slice(-3), pos = last.every(function (q) { return q > 0; }), negv = last.every(function (q) { return q < 0; });
      var grows = last.every(function (q, i) { return i === 0 || Math.abs(q) > Math.abs(last[i - 1]) || (!isFinite(q) && !isNaN(q)); });
      if ((pos || negv) && last.some(function (q) { return !isFinite(q); }) && grows !== false) return { kind: "inf", s: pos ? 1 : -1 };
      if (v.some(function (q) { return !isFinite(q); })) return { kind: "undefined" };
      var e1 = last[1] - last[0], e2 = last[2] - last[1];
      var big = grows && Math.abs(last[2]) > 50 && Math.abs(last[2]) > 2 * Math.abs(last[1]);
      var slow = grows && e1 !== 0 && e2 / e1 >= 0.8 && Math.abs(e2) > 1e-3 * (1 + Math.abs(last[2]));
      if ((pos || negv) && (big || slow)) return { kind: "inf", s: pos ? 1 : -1 };
      var d1 = v[n - 2] - v[n - 3], d2 = v[n - 1] - v[n - 2], scale = 1 + Math.abs(v[n - 1]);
      // extrapolate: Richardson (error proportional to the step) and Aitken (any geometric rate), and round off what they disagree on
      var r = d1 !== 0 ? d2 / d1 : 0, Lr = v[n - 1] + d2 / 9, La = r > 0 && r < 0.9 ? v[n - 1] + (d2 * r) / (1 - r) : r <= 0 ? v[n - 1] : Lr;
      var u = Math.max(r <= 0 ? Math.abs(d2) : Math.abs(La - Lr), 1e-10 * scale), q = Math.pow(10, Math.ceil(Math.log10(u))), L = Math.round(La / q) * q;
      var shrinking = Math.abs(d2) < 1e-7 * scale || (r > 0 && r < 0.7) || Math.abs(r) < 0.3;
      var tol = 1e-6 * scale + 3 * Math.abs(d2);
      var settled = shrinking && Math.abs(w[n - 1] - L) < tol && Math.abs(w[n - 2] - L) < 10 * tol + 3 * Math.abs(d1);
      if (settled) return { kind: "lim", L: Math.abs(L) < 1e-9 * scale ? 0 : +L.toPrecision(8) };
      return { kind: "none" };
    }
    function hseq(k0, k1, s) { var o = []; for (var k = k0; k <= k1; k++) o.push(s * Math.pow(10, -k)); return o; }
    function describe(t, side) {
      if (t.kind === "lim") return "values approach about <b>" + num(t.L, 6) + "</b>";
      if (t.kind === "inf") return "values grow without bound (" + (t.s > 0 ? "→ ∞" : "→ −∞") + ")";
      if (t.kind === "undefined") return "<em>f</em> is not defined there";
      return "values do not settle down";
    }
    function table(title, xs) {
      var h = "<div><table class=\"mm-table\" style=\"width:100%\"><thead><tr><th><em>x</em></th><th><em>f</em>(<em>x</em>)</th></tr></thead><tbody>";
      xs.forEach(function (x) { h += "<tr><td>" + num(x, 7) + "</td><td>" + num(f(x)) + "</td></tr>"; });
      return h + "</tbody></table><p class=\"mm-help\" style=\"margin-top:-.4rem\">" + title + "</p></div>";
    }
    function draw() {
      var o = plot.o, out = [], tabs = "";
      plot.frame();
      if (!f || (!isFinite(a) && Math.abs(a) !== Infinity)) { document.getElementById("lm-out").innerHTML = "Enter a formula and a number for <em>x</em> to approach."; document.getElementById("lm-tables").innerHTML = ""; return; }
      var finite = isFinite(a);
      if (finite) { var vl = plot.path([[a, o.y0], [a, o.y1]], "mm-zero"); vl.style.strokeDasharray = "4 4"; }
      plot.fn(f, "mm-a", { n: 3000 });
      var xsL, xsR;
      if (finite) {
        xsL = useBook && P.L ? P.L.slice() : hseq(1, kmax, -1).map(function (h) { return a + h; });
        xsR = useBook && P.R ? P.R.slice() : hseq(1, kmax, 1).map(function (h) { return a + h; });
        if (useBook && P.L && !P.R) xsR = [];
        var tL = trend(hseq(2, 4, -1).map(function (h) { return a + h; }), hseq(2, 4, -1).map(function (h) { return a + 0.7371 * h; }));
        var tR = trend(hseq(2, 4, 1).map(function (h) { return a + h; }), hseq(2, 4, 1).map(function (h) { return a + 0.7371 * h; }));
        var fa = f(a);
        if (Math.abs(fa) > 1e12) fa = NaN; // such as tan(π/2) = 1.6×10¹⁶: really undefined
        out.push(isFinite(fa) ? "<em>f</em>(" + num(a, 6) + ") = " + num(fa, 6) + "." : "<em>f</em>(" + num(a, 6) + ") is not defined.");
        out.push("From the left (<em>x</em> → " + num(a, 6) + "<sup>−</sup>): " + describe(tL) + ". From the right (<em>x</em> → " + num(a, 6) + "<sup>+</sup>): " + describe(tR) + ".");
        if (tL.kind === "lim" && tR.kind === "lim" && Math.abs(tL.L - tR.L) <= 2e-6 * (1 + Math.abs(tL.L))) {
          out.push("So the limit appears to be <b>" + num(tL.L, 6) + "</b>" + (isFinite(fa) ? (Math.abs(fa - tL.L) <= 1e-5 * (1 + Math.abs(fa)) ? ", which equals <em>f</em>(" + num(a, 6) + ")." : ", which is <b>not</b> <em>f</em>(" + num(a, 6) + ").") : ", even though <em>f</em>(" + num(a, 6) + ") is not defined."));
          var hole = plot.circle(a, tL.L, 5, "mm-eq-u"); hole.style.stroke = "var(--mm-a)";
        } else if (tL.kind === "lim" && tR.kind === "lim") out.push("The one-sided limits differ, so the limit <b>does not exist</b>.");
        else if (tL.kind === "inf" && tR.kind === "inf" && tL.s === tR.s) out.push("So we write lim <em>f</em>(<em>x</em>) = " + (tL.s > 0 ? "∞" : "−∞") + ": the limit does not exist as a number, and <em>x</em> = " + num(a, 6) + " is a <b>vertical asymptote</b>.");
        else if (tL.kind === "inf" || tR.kind === "inf") out.push("The limit does not exist, and <em>x</em> = " + num(a, 6) + " is a <b>vertical asymptote</b>.");
        else if ((tL.kind === "undefined") !== (tR.kind === "undefined") && (tL.kind === "lim" || tR.kind === "lim")) out.push("<em>f</em> is defined on only one side of " + num(a, 6) + ", so only the one-sided limit from the " + (tL.kind === "lim" ? "left" : "right") + " exists; the two-sided limit does not.");
        else out.push("The limit <b>does not exist</b>.");
        if (isFinite(fa)) plot.circle(a, fa, 4.5, "mm-dot");
        tabs = (xsL.length ? table("from the left", xsL) : "") + (xsR.length ? table("from the right", xsR) : "");
      } else {
        var s = a > 0 ? 1 : -1, xs = useBook && P.R ? P.R.slice() : [1, 10, 100, 1000, 10000, 100000, 1000000].map(function (x) { return s * x; });
        var t = trend([1e3, 1e4, 1e5, 1e6].map(function (x) { return s * x; }), [1.37e3, 1.37e4, 1.37e5, 1.37e6].map(function (x) { return s * x; }));
        out.push("As <em>x</em> → " + (s > 0 ? "∞" : "−∞") + ", " + describe(t) + ".");
        if (t.kind === "lim") {
          out.push("So lim <em>f</em>(<em>x</em>) = <b>" + num(t.L, 6) + "</b> and <em>y</em> = " + num(t.L, 6) + " is a <b>horizontal asymptote</b>.");
          var hl = plot.path([[o.x0, t.L], [o.x1, t.L]], "mm-zero"); hl.style.strokeDasharray = "4 4";
        } else if (t.kind === "none") out.push("The limit <b>does not exist</b>.");
        else if (t.kind === "inf") out.push("So lim <em>f</em>(<em>x</em>) = " + (t.s > 0 ? "∞" : "−∞") + ": there is no horizontal asymptote in this direction.");
        xsL = []; xsR = xs;
        tabs = table(s > 0 ? "as x increases" : "as x decreases", xs);
      }
      xsL.forEach(function (x) { var y = f(x); if (isFinite(y)) { var q = plot.circle(x, y, 3.6, "mm-eq-u", plot.data); q.style.stroke = "var(--mm-b)"; } });
      xsR.forEach(function (x) { var y = f(x); if (isFinite(y)) { var q = plot.circle(x, y, 3.6, "mm-eq-u", plot.data); q.style.stroke = "var(--mm-c)"; } });
      document.getElementById("lm-out").innerHTML = out.join(" ");
      document.getElementById("lm-tables").innerHTML = tabs;
    }
    // controls
    var top = document.getElementById("lm-top"), inp = document.getElementById("lm-input"), box = document.getElementById("lm-controls");
    M.select(M.group(top, "Example"), Object.keys(presets).map(function (k) { return [k, presets[k].name]; }), key, function (v) { load(v); });
    var fIn = M.textInput(inp, "<em>f</em>(<em>x</em>) =", P.f, function (v) { setF(v); draw(); });
    var aIn = M.textInput(inp, "<em>x</em> →", P.a, function (v) { setA(v); if (useBook) { useBook = false; bookBox.checked = false; } draw(); }, "5rem");
    var gt = M.group(box, "Table");
    var bookBox = M.checkbox(gt, "Textbook's values", useBook, function (v) { useBook = v; draw(); });
    var kS = M.slider(gt, { label: "smallest step 10<sup>−<em>k</em></sup>, <em>k</em> =", min: 2, max: 10, step: 1, value: kmax, digits: 0, onInput: function (v) { kmax = v; if (useBook) { useBook = false; bookBox.checked = false; } draw(); } });
    M.zoomControls(box, plot, function () { return P.win; }, draw);
    function setF(v) { try { f = M.expr(v); fIn.showError(""); } catch (e) { f = null; fIn.showError(e.message); } }
    function setA(v) {
      var t = v.trim().toLowerCase().replace("∞", "inf").replace("−", "-");
      if (t === "inf" || t === "+inf" || t === "infinity") { a = Infinity; aIn.showError(""); return; }
      if (t === "-inf" || t === "-infinity") { a = -Infinity; aIn.showError(""); return; }
      try { a = M.expr(t)(0); aIn.showError(isFinite(a) ? "" : "not a number"); } catch (e) { a = NaN; aIn.showError(e.message); }
    }
    function load(k) {
      key = k; P = presets[k];
      fIn.set(P.f); setF(P.f); aIn.set(P.a); setA(P.a);
      useBook = !!(P.L || P.R); bookBox.checked = useBook; bookBox.parentNode.style.display = useBook ? "" : "none";
      kmax = 6; kS.set(6);
      M.setWindow(plot, P.win);
      draw();
    }
    M.onResize(draw);
    load(key);
  })();
</script>
