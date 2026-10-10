---
layout: page
title: Check your derivative
description: An interactive tool for MATH 101, weeks 5–8. Practise the differentiation rules (product, quotient, chain, trigonometric, exponential, logarithmic and hyperbolic) by typing your answer and comparing it with the true derivative.
permalink: /teaching/math101/tools/check-derivative/
---

[← MATH 101]({{ '/teaching/math101/' | relative_url }})

The differentiation rules (the Power Rule, the Product and Quotient Rules, the derivatives of trigonometric, exponential and logarithmic functions, and above all the Chain Rule) turn finding a derivative into algebra. This tool checks that algebra. Type a function and your formula for its derivative: the tool compares your formula with the slope of the graph of $$f$$, computed numerically, and shows where they disagree. It supports learning outcome 6.

<div class="mm-wrap" id="cd">
  <div class="mm-controls" id="cd-top"></div>
  <div class="mm-controls" id="cd-input"></div>
  <svg id="cd-plot" role="img" aria-label="The true derivative and your formula for it"></svg>
  <div class="mm-controls" id="cd-controls"></div>
  <p class="mm-help">The solid curve is the true derivative, computed from the slopes of <em>f</em>; the dashed curve is your formula. Where they differ, the gap is shaded. Each example starts with a common mistake for you to find and fix.</p>
  <div class="mm-readout" id="cd-out"></div>
</div>

## Things to try

1. Each example starts with a wrong answer that students often give. Say which rule was misused, then type the correct derivative until the tool agrees.
2. For $$x e^x$$, why is the derivative not $$e^x$$, the product of the derivatives? Compare with the Product Rule.
3. For $$\sqrt{x^2 + 1}$$ and $$\sin(x^2)$$, which part of the answer comes from the Chain Rule? What happens if you leave it out?
4. Two correct answers can look different. Check that $$\dfrac{d}{dx}\ln(x^2) = \dfrac{2}{x}$$, and that the tool accepts both $$\dfrac{2}{x}$$ and $$\dfrac{2x}{x^2}$$.
5. Use the tool on your homework: type a function, work out its derivative on paper, and check.

## How it is computed

The true derivative is approximated by the central difference $$[f(x + h) - f(x - h)]/(2h)$$ with a small $$h$$, at several hundred points across the window. Your formula is evaluated at the same points, and the tool reports the largest difference relative to the size of the derivative, ignoring points where either is undefined. A match means the two agree to about five significant figures everywhere it looked, which is strong evidence, but not a proof, that your formula is right.

<p class="mm-note">The tool runs entirely in your browser; nothing is recorded or sent anywhere. It is a learning aid and is not assessed.</p>

<script src="{{ '/assets/js/teaching/mm-tools.js' | relative_url }}"></script>
<script>
  (function () {
    var M = window.MMTools;
    // each example: f, a common wrong answer, the right one (shown only on request), the window
    var presets = {
      prod: { name: "Product Rule: x e^x", f: "x e^x", wrong: "e^x", right: "(x + 1)e^x", win: [-4, 2, -2, 8] },
      quot: { name: "Quotient Rule: (x² + x − 2)/(x³ + 6)", f: "(x^2 + x - 2)/(x^3 + 6)", wrong: "(2x + 1)/(3x^2)", right: "(-x^4 - 2x^3 + 6x^2 + 12x + 6)/(x^3 + 6)^2", win: [-1.5, 4, -1.5, 1.5] },
      trig: { name: "x² sin x", f: "x^2 sin x", wrong: "2x cos x", right: "2x sin x + x^2 cos x", win: [-6, 6, -40, 40] },
      chain1: { name: "Chain Rule: √(x² + 1)", f: "sqrt(x^2 + 1)", wrong: "1/(2sqrt(x^2 + 1))", right: "x/sqrt(x^2 + 1)", win: [-4, 4, -1.5, 1.5] },
      chain2: { name: "Chain Rule: sin(x²)", f: "sin(x^2)", wrong: "cos(x^2)", right: "2x cos(x^2)", win: [-3, 3, -7, 7] },
      exp: { name: "e^(sin x)", f: "e^(sin x)", wrong: "e^(cos x)", right: "cos(x) e^(sin x)", win: [-6, 6, -3, 3] },
      log: { name: "ln(x²)", f: "ln(x^2)", wrong: "1/x^2", right: "2/x", win: [-4, 4, -6, 6] },
      tan: { name: "tan x", f: "tan x", wrong: "sec x", right: "sec^2 x", win: [-1.5, 1.5, -2, 15] },
      hyp: { name: "Hyperbolic: cosh √x", f: "cosh(sqrt(x))", wrong: "sinh(sqrt(x))", right: "sinh(sqrt(x))/(2sqrt(x))", win: [0, 6, -0.5, 3] },
      atan: { name: "Inverse tangent: tan⁻¹(2x)", f: "atan(2x)", wrong: "1/(1 + 4x^2)", right: "2/(1 + 4x^2)", win: [-3, 3, -0.5, 2.5] },
    };
    var key = "prod", P = presets[key], f = null, d = null;
    var plot = new M.Plot(document.getElementById("cd-plot"), { x0: 0, x1: 1, y0: 0, y1: 1, gx: 1, gy: 1, xname: "x", yname: "y", aspect: 0.55, aspectNarrow: 0.85, left: 30 });
    function num(v, dd) { if (!isFinite(v)) return "undefined"; if (Math.abs(v) < 1e-10) return "0"; return String(+v.toPrecision(dd || 4)).replace(/-/g, "−"); }
    function fp(x) { var h = 1e-5 * Math.max(1, Math.abs(x)); return (f(x + h) - f(x - h)) / (2 * h); }
    // near a jump or a vertical tangent the difference quotient grows as the step shrinks: f′ does not exist there
    function rough(x) { var h = 1e-6 * Math.max(1, Math.abs(x)), q = (f(x + h) - f(x - h)) / (2 * h), p = fp(x); return Math.abs(q) > 3 * Math.abs(p) + 1e-6; }
    function draw() {
      plot.frame();
      var out = document.getElementById("cd-out");
      if (!f) { out.innerHTML = "Enter a function <em>f</em>."; return; }
      var o = plot.o, n = 600, worst = null, scale = 0, checked = 0;
      plot.path([[o.x0, 0], [o.x1, 0]], "mm-zero");
      // scale of the derivative over the window
      var vals = [];
      for (var i = 0; i <= n; i++) { var x = o.x0 + ((o.x1 - o.x0) * i) / n, t = fp(x); if (isFinite(t)) vals.push(Math.abs(t)); }
      vals.sort(function (a, b) { return a - b; });
      scale = vals.length ? vals[Math.floor(0.9 * vals.length)] + 1e-9 : 1;
      if (d) {
        for (var j = 0; j <= n; j++) {
          var x2 = o.x0 + ((o.x1 - o.x0) * j) / n, a = fp(x2), b = d(x2);
          if (!isFinite(a) || !isFinite(b) || Math.abs(a) > 1e6 || rough(x2)) continue;
          checked++;
          var err = Math.abs(a - b) / (Math.abs(a) + 0.01 * scale);
          if (!worst || err > worst.err) worst = { x: x2, err: err, a: a, b: b };
          if (err > 1e-3) {
            var w = (o.x1 - o.x0) / n;
            M.el("rect", { x: plot.sx(x2 - w / 2), y: plot.sy(Math.max(a, b)), width: Math.max(0.5, plot.sx(x2 + w / 2) - plot.sx(x2 - w / 2)), height: Math.abs(plot.sy(Math.min(a, b)) - plot.sy(Math.max(a, b))), style: "fill:#c0392b;fill-opacity:.25;stroke:none" }, plot.data);
          }
        }
      }
      plot.fn(fp, "mm-a", { n: 1500 });
      if (d) { var dp = plot.fn(d, "mm-b", { n: 1500 }); dp.style.strokeDasharray = "7 4"; }
      var t2;
      if (!d) t2 = "Type your formula for <em>f</em>′(<em>x</em>).";
      else if (checked < 0.25 * n) t2 = "Your formula and the true derivative are both defined at only " + checked + " of the " + (n + 1) + " points checked, too few for a fair comparison. Is your formula defined where <em>f</em> is?";
      else if (worst.err <= 1e-4) t2 = "<b>✓ Your formula matches the true derivative</b> at all " + checked + " points checked in this window.";
      else t2 = "<b>✗ Not yet.</b> At <em>x</em> = " + num(worst.x) + " the true derivative is " + num(worst.a) + " but your formula gives " + num(worst.b) + ". The shaded gaps show where they differ.";
      out.innerHTML = t2;
    }
    var top = document.getElementById("cd-top"), inp = document.getElementById("cd-input"), box = document.getElementById("cd-controls");
    M.select(M.group(top, "Example"), Object.keys(presets).map(function (k) { return [k, presets[k].name]; }), key, function (v) { load(v); });
    var fIn = M.textInput(inp, "<em>f</em>(<em>x</em>) =", P.f, function (v) { try { f = M.expr(v); fIn.showError(""); } catch (e) { f = null; fIn.showError(e.message); } draw(); });
    var dIn = M.textInput(inp, "your <em>f</em>′(<em>x</em>) =", P.wrong, function (v) { setD(v); draw(); }, "16rem");
    function setD(v) { if (!v.trim()) { d = null; dIn.showError(""); return; } try { d = M.expr(v); dIn.showError(""); } catch (e) { d = null; dIn.showError(e.message); } }
    var g = M.group(box, "Answer");
    M.button(g, "Show a correct answer", function () { if (P.f === fIn.input.value) { dIn.set(P.right); setD(P.right); draw(); } });
    M.button(g, "Clear", function () { dIn.set(""); setD(""); draw(); });
    M.zoomControls(box, plot, function () { return P.win; }, draw, { pan: true });
    function load(k) {
      key = k; P = presets[k];
      fIn.set(P.f); f = M.expr(P.f); fIn.showError(""); dIn.set(P.wrong); setD(P.wrong);
      M.setWindow(plot, P.win); draw();
    }
    M.onResize(draw);
    load(key);
  })();
</script>
