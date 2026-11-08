---
layout: page
title: The Substitution Rule
description: An interactive tool for MATH 101, week 14. See the Substitution Rule for definite integrals as two equal areas, one under f(g(x)) g′(x) and one under f(u) between the new limits.
permalink: /teaching/math101/tools/substitution/
---

[← MATH 101]({{ '/teaching/math101/' | relative_url }})

The **Substitution Rule** reverses the Chain Rule. If $$u = g(x)$$, then $$du = g'(x)\,dx$$ and

$$\int f(g(x))\,g'(x)\,dx = \int f(u)\,du.$$

For a definite integral, the limits change too:

$$\int_a^b f(g(x))\,g'(x)\,dx = \int_{g(a)}^{g(b)} f(u)\,du.$$

So two quite different regions, one under $$y = f(g(x))\,g'(x)$$ from $$a$$ to $$b$$ and one under $$y = f(u)$$ from $$g(a)$$ to $$g(b)$$, have the same net area. This tool draws both and lets you sweep the upper limit to see them grow together. It supports learning outcomes 10 and 11.

<div class="mm-wrap" id="su">
  <div class="mm-controls" id="su-top"></div>
  <div class="mm-controls" id="su-input"></div>
  <div class="mm-panels mm-2">
    <svg id="su-x" role="img" aria-label="Graph of f(g(x)) g prime of x with the area from a to the current x"></svg>
    <svg id="su-u" role="img" aria-label="Graph of f(u) with the area from g(a) to g(x)"></svg>
  </div>
  <div class="mm-controls" id="su-controls"></div>
  <p class="mm-help">Choose the inner function <em>u</em> = <em>g</em>(<em>x</em>) and the outer function <em>f</em>(<em>u</em>); the integrand on the left is <em>f</em>(<em>g</em>(<em>x</em>)) <em>g</em>′(<em>x</em>). Move the upper limit with the slider: the two shaded net areas are always equal.</p>
  <div class="mm-readout" id="su-out"></div>
</div>

## Things to try

1. For $$\displaystyle\int_0^4 \sqrt{2x + 1}\,dx$$, the textbook substitutes $$u = 2x + 1$$, so $$dx = du/2$$ and the limits become 1 and 9. Check that both areas are $$\tfrac{26}{3}$$. Why is the region on the right lower but wider?
2. For $$\displaystyle\int_1^2 \frac{dx}{(3 - 5x)^2}$$, with $$u = 3 - 5x$$ the new limits are $$-2$$ and $$-7$$: the upper limit is smaller than the lower one. How does that affect the sign of $$\int_{-2}^{-7} f(u)\,du$$? Check the textbook's answer, $$\tfrac{1}{14}$$.
3. For $$\displaystyle\int_1^e \frac{\ln x}{x}\,dx$$, with $$u = \ln x$$ the region on the right is a triangle. What is its area?
4. For $$\displaystyle\int_0^{\pi/2} \sin x \cos x\,dx$$, the example uses $$u = \sin x$$, so $$f(u) = u$$. Now type $$u = \cos x$$ instead, with $$f(u) = -u$$. Why do the new limits come out in the opposite order, and why is the answer the same?

## How it is computed

The integrand on the left is $$f(g(x))\,g'(x)$$, with $$g'$$ approximated by central differences. Each integral is computed independently by Simpson's rule, $$\int_a^x f(g(t))\,g'(t)\,dt$$ on the left and $$\int_{g(a)}^{g(x)} f(u)\,du$$ on the right, so their agreement is a check of the rule rather than something built in.

<p class="mm-note">The tool runs entirely in your browser; nothing is recorded or sent anywhere. It is a learning aid and is not assessed.</p>

<script src="{{ '/assets/js/teaching/mm-tools.js' | relative_url }}"></script>
<script>
  (function () {
    var M = window.MMTools;
    var presets = {
      root: { name: "∫ √(2x + 1) dx from 0 to 4", g: "2x + 1", f: "sqrt(u)/2", a: "0", b: "4", exact: "26/3", xwin: [-0.5, 4.5, -0.3, 3.5], uwin: [0, 10, -0.3, 2] },
      recip: { name: "∫ dx/(3 − 5x)² from 1 to 2", g: "3 - 5x", f: "-1/(5u^2)", a: "1", b: "2", exact: "1/14", xwin: [0.9, 2.1, -0.05, 0.3], uwin: [-7.5, -1.5, -0.06, 0.01] },
      log: { name: "∫ (ln x)/x dx from 1 to e", g: "ln x", f: "u", a: "1", b: "e", exact: "1/2", xwin: [0.8, 3, -0.1, 0.5], uwin: [-0.2, 1.2, -0.1, 1.2] },
      cos: { name: "∫ x³ cos(x⁴ + 2) dx from 0 to 1", g: "x^4 + 2", f: "cos(u)/4", a: "0", b: "1", exact: "(sin 3 − sin 2)/4", xwin: [-0.1, 1.1, -0.6, 0.2], uwin: [1.8, 3.2, -0.3, 0.05] },
      exp: { name: "∫ e^(5x) dx from 0 to 1", g: "5x", f: "e^u/5", a: "0", b: "1", exact: "(e⁵ − 1)/5", xwin: [-0.1, 1.1, -5, 160], uwin: [-0.5, 5.5, -1, 32] },
      sc: { name: "∫ sin x cos x dx from 0 to π/2", g: "sin x", f: "u", a: "0", b: "pi/2", exact: "1/2", xwin: [-0.2, 1.8, -0.2, 0.7], uwin: [-1.2, 1.2, -1.2, 1.2] },
    };
    var key = "root", P = presets[key], g = null, fu = null, A = 0, B = 4, X = 4;
    var px = new M.Plot(document.getElementById("su-x"), { x0: 0, x1: 1, y0: 0, y1: 1, gx: 1, gy: 1, xname: "x", yname: "y = f(g(x)) g′(x)", aspect: 0.8, aspectNarrow: 0.7, left: 34 });
    var pu = new M.Plot(document.getElementById("su-u"), { x0: 0, x1: 1, y0: 0, y1: 1, gx: 1, gy: 1, xname: "u", yname: "y = f(u)", aspect: 0.8, aspectNarrow: 0.7, left: 34 });
    function num(v, d) { if (!isFinite(v)) return "undefined"; if (Math.abs(v) < 1e-10) return "0"; return String(+v.toPrecision(d || 6)).replace(/-/g, "−"); }
    function gp(x) { var h = 1e-6 * Math.max(1, Math.abs(x)); return (g(x + h) - g(x - h)) / (2 * h); }
    function integrand(x) { return fu(g(x)) * gp(x); }
    function shade(pl, F, l, r) {
      var lo = Math.min(l, r), hi = Math.max(l, r), N = 300, pts = [[lo, 0]], o = pl.o, H = o.y1 - o.y0;
      for (var i = 0; i <= N; i++) { var t = lo + ((hi - lo) * i) / N, y = F(t); pts.push([t, isFinite(y) ? Math.max(o.y0 - 5 * H, Math.min(o.y1 + 5 * H, y)) : 0]); }
      pts.push([hi, 0]);
      M.el("polygon", { points: pts.map(function (p) { return pl.sx(p[0]).toFixed(1) + "," + pl.sy(p[1]).toFixed(1); }).join(" "), style: "fill:var(--mm-c);fill-opacity:.35;stroke:none" }, pl.data);
    }
    function draw() {
      px.frame(); pu.frame();
      var out = document.getElementById("su-out");
      if (!g || !fu || !isFinite(A) || !isFinite(B)) { out.innerHTML = "Enter <em>g</em>, <em>f</em> and the limits."; return; }
      var ga = g(A), gx = g(X), gb = g(B);
      shade(px, integrand, A, X); shade(pu, fu, ga, gx);
      [px, pu].forEach(function (pl) { pl.path([[pl.o.x0, 0], [pl.o.x1, 0]], "mm-zero"); });
      px.fn(integrand, "mm-a", { n: 1200 }); pu.fn(fu, "mm-a", { n: 1200 });
      [[px, A, "a"], [px, X, "x"], [pu, ga, "g(a)"], [pu, gx, "g(x)"]].forEach(function (q) { var l = q[0].path([[q[1], q[0].o.y0], [q[1], q[0].o.y1]], "mm-zero"); l.style.strokeDasharray = "4 3"; q[0].text(q[1], q[0].o.y1, q[2], { "text-anchor": "middle", dy: 13 * q[0].K }); });
      var L = M.integrate(integrand, A, X, 4000), R = M.integrate(fu, ga, gx, 4000), t = [];
      t.push("Left: ∫<sub>" + num(A, 4) + "</sub><sup>" + num(X, 4) + "</sup> <em>f</em>(<em>g</em>(<em>x</em>)) <em>g</em>′(<em>x</em>) d<em>x</em> ≈ <b>" + num(L) + "</b>.");
      t.push("Right: with <em>u</em> = <em>g</em>(<em>x</em>), the limits become <em>g</em>(" + num(A, 4) + ") = " + num(ga, 4) + " and <em>g</em>(" + num(X, 4) + ") = " + num(gx, 4) + ", and ∫<sub>" + num(ga, 4) + "</sub><sup>" + num(gx, 4) + "</sup> <em>f</em>(<em>u</em>) d<em>u</em> ≈ <b>" + num(R) + "</b>." + (gx < ga ? " The upper limit is smaller than the lower one, so this integral is minus the net area between them." : ""));
      if (Math.abs(X - B) < 1e-9 * Math.max(1, Math.abs(B)) && P.exact && P.g === gIn.input.value && P.f === fIn.input.value) t.push("The textbook's value is " + P.exact + ".");
      out.innerHTML = t.map(function (s) { return "<div>" + s + "</div>"; }).join("");
    }
    var top = document.getElementById("su-top"), inp = document.getElementById("su-input"), box = document.getElementById("su-controls");
    M.select(M.group(top, "Example"), Object.keys(presets).map(function (k) { return [k, presets[k].name]; }), key, function (v) { load(v); });
    var gIn = M.textInput(inp, "<em>u</em> = <em>g</em>(<em>x</em>) =", P.g, function (v) { try { g = M.expr(v); gIn.showError(""); } catch (e) { g = null; gIn.showError(e.message); } draw(); }, "9rem");
    var fIn = M.textInput(inp, "<em>f</em>(<em>u</em>) =", P.f, function (v) { try { fu = M.expr(v, ["u"]); fIn.showError(""); } catch (e) { fu = null; fIn.showError(e.message); } draw(); }, "10rem");
    var aIn = M.textInput(inp, "<em>a</em> =", P.a, function (v) { A = val(v, aIn); rescale(); draw(); }, "3.5rem");
    var bIn = M.textInput(inp, "<em>b</em> =", P.b, function (v) { B = val(v, bIn); rescale(); X = B; xS.set(X); draw(); }, "3.5rem");
    function val(v, b) { try { var r = M.expr(v)(0); b.showError(isFinite(r) ? "" : "not a number"); return r; } catch (e) { b.showError(e.message); return NaN; } }
    var xS = M.slider(M.group(box, "Upper limit"), { label: "<em>x</em>", min: 0, max: 4, step: 0.001, value: X, digits: 3, onInput: function (v) { X = v; draw(); } });
    function rescale() { if (isFinite(A) && isFinite(B)) { xS.input.min = Math.min(A, B); xS.input.max = Math.max(A, B); xS.input.step = Math.abs(B - A) / 1000; } }
    M.zoomControls(box, [px, pu], function () { return [P.xwin, P.uwin]; }, draw, { pan: true });
    function load(k) {
      key = k; P = presets[k];
      gIn.set(P.g); g = M.expr(P.g); gIn.showError(""); fIn.set(P.f); fu = M.expr(P.f, ["u"]); fIn.showError("");
      aIn.set(P.a); A = val(P.a, aIn); bIn.set(P.b); B = val(P.b, bIn); rescale(); X = B; xS.set(X);
      M.setWindow(px, P.xwin); M.setWindow(pu, P.uwin);
      draw();
    }
    M.onResize(draw);
    load(key);
  })();
</script>
