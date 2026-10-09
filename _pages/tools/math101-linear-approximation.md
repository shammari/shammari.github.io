---
layout: page
title: Linear approximations and differentials
description: An interactive tool for MATH 101, week 8. Approximate a function by its tangent line, compare the change Δy with the differential dy, and find where the approximation is accurate to a given tolerance.
permalink: /teaching/math101/tools/linear-approximation/
---

[← MATH 101]({{ '/teaching/math101/' | relative_url }})

Near a point $$a$$, the graph of a differentiable function is almost straight, so it is close to its tangent line. The **linearization** of $$f$$ at $$a$$ is

$$L(x) = f(a) + f'(a)(x - a),$$

and the **linear approximation** $$f(x) \approx L(x)$$ is good for $$x$$ near $$a$$. In the language of **differentials**, if $$x$$ changes by $$dx = \Delta x$$, the actual change in $$y$$ is $$\Delta y = f(a + dx) - f(a)$$, and the differential $$dy = f'(a)\,dx$$ is the change along the tangent line. This tool shows both, and how fast the error grows as you move away from $$a$$. It supports learning outcome 6.

<div class="mm-wrap" id="la">
  <div class="mm-controls" id="la-top"></div>
  <div class="mm-controls" id="la-input"></div>
  <svg id="la-plot" role="img" aria-label="Graph of f with its tangent line and the changes Δy and dy"></svg>
  <div class="mm-controls" id="la-controls"></div>
  <p class="mm-help">Move <em>x</em> with the slider or drag the point on the curve. Zoom in around <em>a</em> to see the curve and its tangent line become indistinguishable. With a tolerance set, the shaded strip shows where |<em>f</em>(<em>x</em>) − <em>L</em>(<em>x</em>)| is smaller than it.</p>
  <div class="mm-readout" id="la-out"></div>
  <div class="mm-scroll"><table class="mm-table" id="la-tab" style="width:100%"></table></div>
</div>

## Things to try

1. For $$f(x) = \sqrt{x + 3}$$ at $$a = 1$$, check the textbook's linearization $$L(x) = \tfrac{7}{4} + \tfrac{x}{4}$$, and its approximations $$\sqrt{3.98} \approx 1.995$$ and $$\sqrt{4.05} \approx 2.0125$$. Are they overestimates or underestimates? How can you tell from the picture?
2. Still with $$\sqrt{x + 3}$$, set the tolerance to 0.5 and then 0.1. Over which intervals is the approximation that accurate? Compare with the textbook's answers, $$-2.6 < x < 8.6$$ and $$-1.1 < x < 3.9$$.
3. For $$y = x^3 + x^2 - 2x + 1$$ at $$a = 2$$, compare $$\Delta y$$ and $$dy$$ when $$dx = 0.05$$ and when $$dx = 0.01$$. Which is easier to compute? How does the difference $$\Delta y - dy$$ shrink when $$dx$$ shrinks?
4. Near 0, $$\sin x \approx x$$ and $$e^x \approx 1 + x$$. For which $$x$$ are these accurate to within 0.01?
5. For $$\cos x$$ at 0 the linearization is the constant 1. Why? Is the approximation better or worse than for $$\sin x$$ near 0?

## How it is computed

$$f'(a)$$ is approximated by the central difference $$[f(a + h) - f(a - h)]/(2h)$$ with a small $$h$$, so $$L$$, $$\Delta y = f(a + dx) - f(a)$$ and $$dy = f'(a)\,dx$$ follow directly. The interval where $$\lvert f(x) - L(x)\rvert < $$ tolerance is found by moving out from $$a$$ in each direction until the error first reaches the tolerance, refined by bisection.

<p class="mm-note">The tool runs entirely in your browser; nothing is recorded or sent anywhere. It is a learning aid and is not assessed.</p>

<script src="{{ '/assets/js/teaching/mm-tools.js' | relative_url }}"></script>
<script>
  (function () {
    var M = window.MMTools;
    var presets = {
      sqrt: { name: "√(x + 3) at a = 1", f: "sqrt(x + 3)", a: "1", x: 1.05, tab: [0.9, 0.98, 1, 1.05, 1.1, 2, 3], win: [-4, 10, -1, 4.3] },
      cubic: { name: "x³ + x² − 2x + 1 at a = 2", f: "x^3 + x^2 - 2x + 1", a: "2", x: 2.05, tab: [2.05, 2.01], win: [1.8, 2.5, 6, 18] },
      sin: { name: "sin x at a = 0", f: "sin x", a: "0", x: 0.5, win: [-3, 3, -1.6, 1.6] },
      exp: { name: "e^x at a = 0", f: "e^x", a: "0", x: 0.5, win: [-2, 2, -0.5, 4] },
      ln: { name: "ln x at a = 1", f: "ln x", a: "1", x: 1.5, win: [0, 3, -2, 1.5] },
      cos: { name: "cos x at a = 0", f: "cos x", a: "0", x: 0.5, win: [-3, 3, -1.6, 1.6] },
    };
    var key = "sqrt", P = presets[key], f = null, a = 1, x = 1.05, tol = 0;
    var plot = new M.Plot(document.getElementById("la-plot"), { x0: 0, x1: 1, y0: 0, y1: 1, gx: 1, gy: 1, xname: "x", yname: "y", aspect: 0.55, aspectNarrow: 0.85, left: 30 });
    function num(v, d) { if (!isFinite(v)) return "undefined"; if (Math.abs(v) < 1e-12) return "0"; return String(+v.toPrecision(d || 6)).replace("-", "−"); }
    function parse(v, box) { try { var g = M.expr(v); box.showError(""); return g; } catch (e) { box.showError(e.message); return null; } }
    function val(v, box) { try { var r = M.expr(v)(0); box.showError(isFinite(r) ? "" : "not a number"); return r; } catch (e) { box.showError(e.message); return NaN; } }
    function d1() { return M.deriv(f, a, 1e-5 * Math.max(1, Math.abs(a))); }
    // why f is not differentiable at a, or null if it is: one-sided difference quotients must exist, stay bounded and agree
    function notDiff() {
      var fa = f(a), s = Math.max(1, Math.abs(a)), h1 = 1e-4 * s, h2 = 1e-6 * s;
      function q(h) { return (f(a + h) - fa) / h; }
      var r1 = q(h1), r2 = q(h2), l1 = q(-h1), l2 = q(-h2);
      if (!isFinite(r2) || !isFinite(l2)) return "an end of the domain of <em>f</em>, so only a one-sided derivative could exist";
      var dR = f(a + h2) - fa, dR1 = f(a + 100 * h2) - fa, dL = f(a - h2) - fa, dL1 = f(a - 100 * h2) - fa;
      if ((Math.abs(dR) > 1e-9 * (1 + Math.abs(fa)) && Math.abs(dR) > 0.5 * Math.abs(dR1)) || (Math.abs(dL) > 1e-9 * (1 + Math.abs(fa)) && Math.abs(dL) > 0.5 * Math.abs(dL1))) return "a point where <em>f</em> is not continuous";
      if ((Math.abs(r2) > 50 && Math.abs(r2) > 3 * Math.abs(r1)) || (Math.abs(l2) > 50 && Math.abs(l2) > 3 * Math.abs(l1))) return "a point where the tangent line is vertical";
      var g1 = Math.abs(l1 - r1), g2 = Math.abs(l2 - r2);
      if (g2 > 1e-3 * (1 + Math.abs(l2) + Math.abs(r2)) && g2 > 0.3 * g1) return "a corner (slopes " + num(l2, 3) + " from the left and " + num(r2, 3) + " from the right)";
      return null;
    }
    // where |f − L| < tol, moving out from a on each side
    function reach(s, m, fa, R) {
      function ok(z) { var y = f(z); return isFinite(y) && Math.abs(y - (fa + m * (z - a))) < tol; }
      var n = 4000, prev = 0;
      for (var i = 1; i <= n; i++) {
        var d = (R * i) / n;
        if (!ok(a + s * d)) { var u = prev, v = d; for (var k = 0; k < 60; k++) { var mm = (u + v) / 2; if (ok(a + s * mm)) u = mm; else v = mm; } return u; }
        prev = d;
      }
      return Infinity;
    }
    function draw() {
      plot.frame();
      var out = document.getElementById("la-out"), tab = document.getElementById("la-tab");
      if (!f || !isFinite(a) || !isFinite(f(a))) { out.innerHTML = "Enter a formula and a number <em>a</em> where <em>f</em> is defined."; tab.innerHTML = ""; return; }
      var why = notDiff();
      if (why) {
        plot.fn(f, "mm-a", { n: 1500 }); plot.circle(a, f(a), 4.5, "mm-dot");
        out.innerHTML = "<em>f</em> is not differentiable at <em>a</em> = " + num(a) + ": it is " + why + ". There is no tangent line there, so <em>f</em> has no linearization at " + num(a) + ".";
        tab.innerHTML = ""; return;
      }
      var o = plot.o, fa = f(a), m = d1(), m6 = +m.toPrecision(6);
      if (Math.abs(m - m6) < 1e-8 * Math.max(1e-6, Math.abs(m))) m = m6; // 2 rather than 2.0000000000131
      var Lf = function (z) { return fa + m * (z - a); }, K = plot.K;
      var R = Math.max(10, 3 * (o.x1 - o.x0)), lo = NaN, hi = NaN;
      if (tol > 0) {
        lo = a - reach(-1, m, fa, R); hi = a + reach(1, m, fa, R);
        var x0 = Math.max(o.x0, lo), x1 = Math.min(o.x1, hi);
        M.el("rect", { x: plot.sx(x0), y: plot.sy(o.y1), width: Math.max(0, plot.sx(x1) - plot.sx(x0)), height: plot.sy(o.y0) - plot.sy(o.y1), style: "fill:var(--mm-c);opacity:.14;stroke:none" }, plot.data);
      }
      var tl = plot.path([[o.x0, Lf(o.x0)], [o.x1, Lf(o.x1)]], "mm-b"); tl.style.strokeWidth = "1.8";
      plot.fn(f, "mm-a", { n: 1500 });
      plot.circle(a, fa, 4.5, "mm-dot");
      var fx = f(x), Lx = Lf(x), dx = x - a, dy = m * dx, Dy = fx - fa;
      if (isFinite(fx)) {
        // dx along the bottom, then dy (to the tangent line) and Δy (to the curve)
        var g1 = plot.path([[a, fa], [x, fa]], "mm-curve"); g1.style.strokeDasharray = "3 3"; g1.style.strokeWidth = "1.2";
        var g2 = plot.path([[x, fa], [x, Lx]], "mm-b"); g2.style.strokeWidth = "3.5";
        var g3 = plot.path([[x + (o.x1 - o.x0) * 0.006, fa], [x + (o.x1 - o.x0) * 0.006, fx]], "mm-c"); g3.style.strokeWidth = "3.5";
        var hp = plot.circle(x, fx, 6, "mm-handle"); hp.setAttribute("stroke", "var(--mm-a)");
      }
      var mm = Math.abs(m) < 1e-9 ? 0 : +m.toPrecision(6), bb = +(fa - m * a).toPrecision(6), X = "<em>x</em>";
      // tidy forms: f(a) + f′(a)(x − a), and b + mx
      function term(c, v, first) { if (c === 0) return ""; var s = c < 0 ? (first ? "−" : " − ") : first ? "" : " + "; var k = Math.abs(c); return s + (k === 1 ? "" : num(k)) + v; }
      var xa = a === 0 ? X : "(" + X + (a < 0 ? " + " + num(-a) : " − " + num(a)) + ")";
      var f1 = (fa !== 0 || mm === 0 ? num(fa) : "") + term(mm, xa, fa === 0), f2 = (bb !== 0 || mm === 0 ? num(bb) : "") + term(mm, X, bb === 0);
      if (f1.charAt(0) === "(" && f1.charAt(f1.length - 1) === ")") f1 = f1.slice(1, -1);
      var t = "<div><em>f</em>(" + num(a) + ") = " + num(fa) + " and <em>f</em>′(" + num(a) + ") ≈ " + num(mm) + ", so <em>L</em>(<em>x</em>) = " + f1 + (f1 !== f2 ? " = " + f2 : "") + ".</div>";
      t += "<div>At <em>x</em> = " + num(x) + ": <em>f</em>(<em>x</em>) = " + num(fx, 9) + " and <em>L</em>(<em>x</em>) = " + num(Lx, 9) + (Math.abs(Lx - fx) <= 1e-12 * (1 + Math.abs(fx)) ? ", exactly equal" + (x === a ? " (at <em>x</em> = <em>a</em> the linearization always equals <em>f</em>(<em>a</em>))" : "") : ", an " + (Lx > fx ? "over" : "under") + "estimate by " + num(Math.abs(Lx - fx), 3)) + ".</div>";
      t += "<div>With <em>dx</em> = Δ<em>x</em> = " + num(dx) + ": <span style=\"color:var(--mm-c)\">Δ<em>y</em> = " + num(Dy, 7) + "</span> and <span style=\"color:var(--mm-b)\"><em>dy</em> = <em>f</em>′(" + num(a) + ") <em>dx</em> = " + num(dy, 7) + "</span>.</div>";
      if (tol > 0 && !isFinite(lo) && !isFinite(hi)) t += "<div>|<em>f</em>(<em>x</em>) − <em>L</em>(<em>x</em>)| &lt; " + num(tol) + " for every <em>x</em> the tool checked (within " + num(R, 3) + " of <em>a</em>).</div>";
      else if (tol > 0) t += "<div>|<em>f</em>(<em>x</em>) − <em>L</em>(<em>x</em>)| &lt; " + num(tol) + " for " + (isFinite(lo) ? num(lo, 4) : "−∞") + " &lt; <em>x</em> &lt; " + (isFinite(hi) ? num(hi, 4) : "∞") + (lo < a - R * 0.999 || hi > a + R * 0.999 ? " (at least)" : "") + ".</div>";
      out.innerHTML = t;
      var xs = P.tab && P.f === fIn.input.value && a === val(P.a, aIn) ? P.tab : [];
      if (xs.length) {
        var h = "<thead><tr><th><em>x</em></th><th><em>L</em>(<em>x</em>)</th><th>actual <em>f</em>(<em>x</em>)</th><th>error</th><th>Δ<em>y</em></th><th><em>dy</em></th></tr></thead><tbody>";
        xs.forEach(function (z) { h += "<tr><td>" + num(z) + "</td><td>" + num(Lf(z), 9) + "</td><td>" + num(f(z), 9) + "</td><td>" + num(Lf(z) - f(z), 3) + "</td><td>" + num(f(z) - fa, 7) + "</td><td>" + num(m * (z - a), 7) + "</td></tr>"; });
        tab.innerHTML = h + "</tbody>";
      } else tab.innerHTML = "";
    }
    var top = document.getElementById("la-top"), inp = document.getElementById("la-input"), box = document.getElementById("la-controls");
    M.select(M.group(top, "Example"), Object.keys(presets).map(function (k) { return [k, presets[k].name]; }), key, function (v) { load(v); });
    var fIn = M.textInput(inp, "<em>f</em>(<em>x</em>) =", P.f, function (v) { f = parse(v, fIn); draw(); });
    var aIn = M.textInput(inp, "<em>a</em> =", P.a, function (v) { a = val(v, aIn); draw(); }, "4.5rem");
    var g1 = M.group(box, "Point");
    var xS = M.slider(g1, { label: "<em>x</em>", min: -1, max: 3, step: 0.0001, value: x, digits: 4, onInput: function (v) { x = v; draw(); } });
    M.select(M.group(box, "Tolerance"), [["0", "none"], ["0.5", "0.5"], ["0.1", "0.1"], ["0.01", "0.01"], ["0.001", "0.001"]], "0", function (v) { tol = +v; draw(); });
    M.zoomControls(box, plot, function () { return P.win; }, function () { var o = plot.o; xS.input.min = o.x0; xS.input.max = o.x1; xS.input.step = (o.x1 - o.x0) / 10000; draw(); });
    function load(k) {
      key = k; P = presets[k];
      fIn.set(P.f); f = parse(P.f, fIn); aIn.set(P.a); a = val(P.a, aIn);
      M.setWindow(plot, P.win);
      xS.input.min = P.win[0]; xS.input.max = P.win[1]; xS.input.step = (P.win[1] - P.win[0]) / 10000;
      x = P.x; xS.set(x); draw();
    }
    var svg = plot.svg, dragging = false;
    svg.addEventListener("pointerdown", function (evt) { var p = plot.at(evt); if (plot.inside(p.x, p.y)) { dragging = true; svg.setPointerCapture(evt.pointerId); evt.preventDefault(); x = p.x; xS.set(x); draw(); } });
    svg.addEventListener("pointermove", function (evt) { if (!dragging) return; var p = plot.at(evt); x = Math.min(plot.o.x1, Math.max(plot.o.x0, p.x)); xS.set(x); draw(); });
    svg.addEventListener("pointerup", function () { dragging = false; });
    svg.addEventListener("pointercancel", function () { dragging = false; });
    M.onResize(draw);
    load(key);
  })();
</script>
