---
layout: page
title: Rolle's Theorem and the Mean Value Theorem
description: An interactive tool for MATH 101, week 9. Find the numbers c promised by Rolle's Theorem and the Mean Value Theorem, where the tangent line is parallel to the secant line, and see what goes wrong when a hypothesis fails.
permalink: /teaching/math101/tools/mean-value-theorem/
---

[← MATH 101]({{ '/teaching/math101/' | relative_url }})

**The Mean Value Theorem.** Let $$f$$ be a function that satisfies the following hypotheses:

1. $$f$$ is continuous on the closed interval $$[a, b]$$.
2. $$f$$ is differentiable on the open interval $$(a, b)$$.

Then there is a number $$c$$ in $$(a, b)$$ such that $$\displaystyle f'(c) = \frac{f(b) - f(a)}{b - a}$$.

Geometrically, somewhere between $$a$$ and $$b$$ the tangent line is parallel to the secant line through $$(a, f(a))$$ and $$(b, f(b))$$. **Rolle's Theorem** is the special case $$f(a) = f(b)$$, where the tangent line is horizontal: $$f'(c) = 0$$. This tool finds every such $$c$$, checks the hypotheses, and shows what can go wrong without them. It supports learning outcome 4.

<div class="mm-wrap" id="mv">
  <div class="mm-controls" id="mv-top"></div>
  <div class="mm-controls" id="mv-input"></div>
  <svg id="mv-plot" role="img" aria-label="Graph of f with the secant line and the parallel tangent lines"></svg>
  <div class="mm-controls" id="mv-controls"></div>
  <p class="mm-help">Drag the end points <em>A</em> and <em>B</em> along the curve, or type <em>a</em> and <em>b</em>. Dashed lines are the tangent lines at the numbers <em>c</em>.</p>
  <div class="mm-readout" id="mv-out"></div>
</div>

## Things to try

1. For $$f(x) = x^3 - x$$ on $$[0, 2]$$, the textbook finds $$c = 2/\sqrt{3}$$. Check it. There is another solution of $$f'(c) = 3$$. Why does it not count?
2. For $$\sin x$$ on $$[0, \pi]$$, Rolle's Theorem applies. Where is $$c$$? Drag $$B$$ to $$2\pi$$ and then to $$3\pi$$. How many numbers $$c$$ are there now?
3. For $$\lvert x\rvert $$ on $$[-1, 2]$$, there is no $$c$$. Which hypothesis fails? Move $$A$$ to the right of 0 and try again.
4. For $$x^{2/3}$$ on $$[-1, 1]$$, $$f(-1) = f(1)$$ but $$f'$$ is never 0. Why does this not contradict Rolle's Theorem?
5. For $$1/x$$ on $$[-1, 2]$$, which hypothesis fails? Does a number $$c$$ exist anyway?
6. A car covers 180 km in 2 hours. Explain, using the Mean Value Theorem, why its speedometer must have read 90 km/h at least once.

## How it is computed

The slope of the secant line is $$m = [f(b) - f(a)]/(b - a)$$, and the numbers $$c$$ are the solutions of $$f'(c) = m$$ in $$(a, b)$$, found as sign changes of $$f'(x) - m$$ on a fine grid and refined by bisection, with $$f'$$ approximated by central differences. Continuity on $$[a, b]$$ is checked by sampling for gaps and jumps. Differentiability on $$(a, b)$$ is checked the same way on $$f'$$: a jump in $$f'$$ that does not shrink as the grid is refined is a corner, and values of $$f'$$ that grow without bound are a vertical tangent.

<p class="mm-note">The tool runs entirely in your browser; nothing is recorded or sent anywhere. It is a learning aid and is not assessed.</p>

<script src="{{ '/assets/js/teaching/mm-tools.js' | relative_url }}"></script>
<script>
  (function () {
    var M = window.MMTools;
    var presets = {
      cubic: { name: "x³ − x on [0, 2]", f: "x^3 - x", a: "0", b: "2", win: [-1.5, 2.5, -2, 7] },
      sin: { name: "sin x on [0, π]", f: "sin x", a: "0", b: "pi", win: [-1, 10, -1.6, 1.6] },
      exp: { name: "e^x on [0, 1]", f: "e^x", a: "0", b: "1", win: [-1, 2, -0.5, 4] },
      root: { name: "√x on [0, 4]", f: "sqrt(x)", a: "0", b: "4", win: [-0.5, 5, -0.5, 2.5] },
      abs: { name: "|x| on [−1, 2]", f: "abs(x)", a: "-1", b: "2", win: [-2, 3, -0.5, 2.5] },
      cusp: { name: "x^(2/3) on [−1, 1]", f: "x^(2/3)", a: "-1", b: "1", win: [-1.5, 1.5, -0.5, 1.5] },
      recip: { name: "1/x on [−1, 2]", f: "1/x", a: "-1", b: "2", win: [-2, 3, -4, 4] },
    };
    var key = "cubic", P = presets[key], f = null, A = 0, B = 2;
    var plot = new M.Plot(document.getElementById("mv-plot"), { x0: 0, x1: 1, y0: 0, y1: 1, gx: 1, gy: 1, xname: "x", yname: "y", aspect: 0.55, aspectNarrow: 0.85, left: 30 });
    function num(v, d) { if (!isFinite(v)) return "undefined"; if (Math.abs(v) < 1e-10) return "0"; return String(+v.toPrecision(d || 6)).replace("-", "−"); }
    function parse(v, box) { try { var g = M.expr(v); box.showError(""); return g; } catch (e) { box.showError(e.message); return null; } }
    function val(v, box) { try { var r = M.expr(v)(0); box.showError(isFinite(r) ? "" : "not a number"); return r; } catch (e) { box.showError(e.message); return NaN; } }
    function fp(x) { return M.deriv(f, x, 1e-6 * Math.max(1, Math.abs(x))); }
    // first place in [a, b] (or (a, b)) where g is undefined, jumps or blows up; null if none
    function trouble(g, a, b, open, minw) {
      var n = 3000, xs = [], ys = [], i, hs = M.holes(g, a, b).filter(function (h) { return !open || (h > a && h < b); });
      if (hs.length) return { x: hs[0], why: "undefined" };
      for (i = 0; i <= n; i++) {
        var x = a + ((b - a) * i) / n;
        if (open && (i === 0 || i === n)) x = a + ((b - a) * (i === 0 ? 1e-6 : 1 - 1e-6));
        var y = g(x);
        if (!isFinite(y)) return { x: x, why: "undefined" };
        xs.push(x); ys.push(y);
      }
      var sorted = ys.slice().sort(function (p, q) { return p - q; }), H = (sorted[Math.floor(0.95 * n)] - sorted[Math.floor(0.05 * n)]) || 1;
      for (i = 1; i <= n; i++) {
        if (Math.abs(ys[i] - ys[i - 1]) <= 0.05 * H) continue;
        var u = xs[i - 1], v = xs[i], gu = ys[i - 1], gv = ys[i];
        for (var k = 0; k < 50 && v - u > (minw || 0) * Math.max(1, Math.abs(u)); k++) {
          var m = (u + v) / 2, gm = g(m);
          if (!isFinite(gm)) return { x: m, why: "undefined" };
          if (Math.abs(gm - gu) > Math.abs(gv - gm)) { v = m; gv = gm; } else { u = m; gu = gm; }
        }
        if (Math.abs(gv - gu) > 1e-3 * H) return { x: (u + v) / 2, why: Math.abs(gu) > 1e3 * H || Math.abs(gv) > 1e3 * H ? "unbounded" : "jump" };
      }
      return null;
    }
    // Is f differentiable at x? null if so, otherwise "corner", "vertical" (a vertical tangent or cusp) or "undefined".
    function classify(x) {
      var sc = Math.max(1, Math.abs(x)), h1 = 1e-4 * sc, h2 = 1e-6 * sc, fx = f(x);
      if (!isFinite(fx)) return "undefined";
      var r1 = (f(x + h1) - fx) / h1, r2 = (f(x + h2) - fx) / h2, l1 = (fx - f(x - h1)) / h1, l2 = (fx - f(x - h2)) / h2;
      if (![r1, r2, l1, l2].every(isFinite)) return "undefined";
      if ((Math.abs(r2) > 3 * Math.abs(r1) && Math.abs(r2) > 50) || (Math.abs(l2) > 3 * Math.abs(l1) && Math.abs(l2) > 50)) return "vertical";
      if (Math.abs(l2 - r2) > 1e-3 * (1 + Math.abs(l2) + Math.abs(r2))) return "corner";
      return null;
    }
    // the first number in (a, b), away from the end points, where f is not differentiable; null if none is found
    function kink(a, b) {
      var n = 3000, xs = [], ys = [], i;
      for (i = 2; i <= n - 2; i++) {
        var x = a + ((b - a) * i) / n, y = fp(x);
        if (!isFinite(y)) { var c0 = classify(x); if (c0) return { x: x, why: c0 }; continue; }
        xs.push(x); ys.push(y);
      }
      var srt = ys.slice().sort(function (p, q) { return p - q; }), H = (srt[Math.floor(0.95 * srt.length)] - srt[Math.floor(0.05 * srt.length)]) || 1;
      for (i = 1; i < xs.length; i++) {
        if (Math.abs(ys[i] - ys[i - 1]) <= 0.05 * H) continue;
        var u = xs[i - 1], v = xs[i], gu = ys[i - 1], gv = ys[i];
        for (var k = 0; k < 60 && v - u > 1e-7 * Math.max(1, Math.abs(u)); k++) {
          var m = (u + v) / 2, gm = fp(m);
          if (!isFinite(gm)) break;
          if (Math.abs(gm - gu) > Math.abs(gv - gm)) { v = m; gv = gm; } else { u = m; gu = gm; }
        }
        // f′ is computed with a step of about 1e-6, so the bisection pins the point down only that closely:
        // try the nearby numbers with few decimals (2, 0.5, 1.25, ...) first, as they are what people type
        var xm = (u + v) / 2, c = null, sc = Math.max(1, Math.abs(xm));
        for (var dd = 0; dd <= 6 && !c; dd++) {
          var snap = Math.round(xm * Math.pow(10, dd)) / Math.pow(10, dd);
          if (Math.abs(snap - xm) < 4e-6 * sc) { c = classify(snap); if (c) xm = snap; }
        }
        if (!c) c = classify(xm);
        if (c) return { x: xm, why: c };
      }
      return null;
    }
    // one-sided difference quotients agree and stay bounded: f is differentiable at x
    function smooth(x) {
      // at a smooth point the gap between the one-sided quotients shrinks in proportion to h; at a corner it does not
      var h = 1e-6 * Math.max(1, Math.abs(x)), fx = f(x), l = (fx - f(x - h)) / h, r = (f(x + h) - fx) / h;
      var L = (fx - f(x - 10 * h)) / (10 * h), R = (f(x + 10 * h) - fx) / (10 * h), gap = Math.abs(l - r);
      return isFinite(l) && isFinite(r) && Math.abs(r) < 1e5 && (gap < 1e-3 * (1 + Math.abs(l) + Math.abs(r)) || gap < 0.3 * Math.abs(L - R));
    }
    function cs(m) {
      var out = [], n = 4000, d = (B - A) * 1e-7, xp = A + d, yp = fp(xp) - m;
      for (var i = 1; i <= n; i++) {
        var x = i === n ? B - d : A + ((B - A) * i) / n, y = fp(x) - m;
        if (isFinite(y) && isFinite(yp) && (y === 0 || yp * y < 0)) {
          var u = xp, v = x, fu = yp;
          for (var k = 0; k < 60; k++) { var mm = (u + v) / 2, fm = fp(mm) - m; if (!isFinite(fm)) break; if (fu * fm <= 0) v = mm; else { u = mm; fu = fm; } }
          var r = (u + v) / 2;
          if (Math.abs(fp(r) - m) < 1e-4 * (1 + Math.abs(m)) && smooth(r) && !out.some(function (q) { return Math.abs(q - r) < (B - A) * 1e-6; })) out.push(r);
        }
        xp = x; yp = y;
      }
      return out;
    }
    function draw() {
      plot.frame();
      var out = document.getElementById("mv-out");
      if (!f || !isFinite(A) || !isFinite(B) || !(B > A)) { out.innerHTML = "Enter a formula and an interval with <em>a</em> &lt; <em>b</em>."; return; }
      var o = plot.o, fa = f(A), fb = f(B), K = plot.K;
      M.el("rect", { x: plot.sx(A), y: plot.sy(o.y1), width: plot.sx(B) - plot.sx(A), height: plot.sy(o.y0) - plot.sy(o.y1), style: "fill:var(--mm-c);opacity:.08;stroke:none" }, plot.data);
      plot.fn(f, "mm-a", { n: 2000 });
      var t = "";
      if (!isFinite(fa) || !isFinite(fb)) { out.innerHTML = "<em>f</em> must be defined at both end points."; return; }
      var m = (fb - fa) / (B - A), rolle = Math.abs(fb - fa) < 1e-9 * (1 + Math.abs(fa));
      if (rolle) m = 0;
      var sec = plot.path([[o.x0, fa + m * (o.x0 - A)], [o.x1, fa + m * (o.x1 - A)]], "mm-b"); sec.style.strokeWidth = "1.6";
      var c1 = trouble(f, A, B, false), c2 = c1 ? null : kink(A, B);
      // f′ equal to the secant slope all along (a line, or a constant): every c works
      var every = true, seen = 0;
      for (var i = 1; i < 200 && every; i++) { var d = fp(A + ((B - A) * (i + 0.137)) / 200) - m; if (!isFinite(d)) continue; seen++; if (!(Math.abs(d) < 1e-4 * (1 + Math.abs(m)))) every = false; }
      every = every && seen > 100;
      var list = every ? [] : cs(m);
      list.slice(0, 60).forEach(function (c) {
        var y = f(c), w = (o.x1 - o.x0) * 0.22, l = plot.path([[c - w, y - m * w], [c + w, y + m * w]], "mm-curve"); l.style.strokeDasharray = "6 4"; l.style.strokeWidth = "1.6";
        var q = plot.circle(c, y, 4.5, "mm-eq-u"); q.style.stroke = "var(--mm-b)";
      });
      [[A, fa, "A"], [B, fb, "B"]].forEach(function (p) { var h = plot.circle(p[0], p[1], 6, "mm-handle"); h.setAttribute("stroke", "var(--mm-b)"); plot.text(p[0], p[1], p[2], { dx: 8 * K, dy: -8 * K }); });
      function pn(v) { return v < 0 ? "(" + num(v, 6) + ")" : num(v, 6); }
      t += "<div>Secant slope: [<em>f</em>(" + num(B, 6) + ") − <em>f</em>(" + num(A, 6) + ")]/(" + num(B, 6) + " − " + pn(A) + ") = <b>" + num(m) + "</b>" + (rolle ? ", since <em>f</em>(<em>a</em>) = <em>f</em>(<em>b</em>) (the case of Rolle's Theorem)" : "") + ".</div>";
      var h1 = c1 ? "✗ <em>f</em> is not continuous on [" + num(A, 6) + ", " + num(B, 6) + "] (" + (c1.why === "undefined" ? "it is undefined" : c1.why === "unbounded" ? "it blows up" : "it jumps") + " near <em>x</em> = " + num(c1.x, 4) + ")." : "✓ <em>f</em> is continuous on [" + num(A, 6) + ", " + num(B, 6) + "].";
      var h2 = c1 ? "" : c2 ? "✗ <em>f</em> is not differentiable on (" + num(A, 6) + ", " + num(B, 6) + "): " + (c2.why === "corner" ? "there is a corner" : c2.why === "vertical" ? "the tangent line is vertical (a cusp)" : "<em>f</em>′ is undefined") + " near <em>x</em> = " + num(c2.x, 4) + "." : "✓ <em>f</em> is differentiable on (" + num(A, 6) + ", " + num(B, 6) + ").";
      t += "<div>" + h1 + "</div>" + (h2 ? "<div>" + h2 + "</div>" : "");
      var name = rolle ? "Rolle's Theorem" : "The Mean Value Theorem";
      if (!c1 && !c2) t += "<div>" + name + " applies, so there must be at least one <em>c</em> in (" + num(A, 6) + ", " + num(B, 6) + ") with <em>f</em>′(<em>c</em>) = " + num(m) + ".</div>";
      else t += "<div>A hypothesis fails, so " + (rolle ? "Rolle's Theorem" : "the Mean Value Theorem") + " promises nothing.</div>";
      if (every && !c1 && !c2) t += "<div>Here <em>f</em>′(<em>x</em>) = " + num(m) + " for every <em>x</em>: the graph is a straight line, it coincides with the secant line, and <b>every</b> number <em>c</em> in (" + num(A, 6) + ", " + num(B, 6) + ") works.</div>";
      else if (every) t += "<div>Here <em>f</em>′(<em>x</em>) = " + num(m) + " wherever <em>f</em> is differentiable: the graph is part of a straight line.</div>";
      else t += "<div>" + (list.length ? "<em>f</em>′(<em>c</em>) = " + num(m) + " at <em>c</em> = <b>" + list.slice(0, 12).map(function (c) { return num(c, 6); }).join("</b>, <b>") + "</b>" + (list.length > 12 ? " and " + (list.length - 12) + " more" : "") + "." : "There is <b>no</b> number <em>c</em> in (" + num(A, 6) + ", " + num(B, 6) + ") with <em>f</em>′(<em>c</em>) = " + num(m) + ".") + "</div>";
      out.innerHTML = t;
    }
    var top = document.getElementById("mv-top"), inp = document.getElementById("mv-input"), box = document.getElementById("mv-controls");
    M.select(M.group(top, "Example"), Object.keys(presets).map(function (k) { return [k, presets[k].name]; }), key, function (v) { load(v); });
    var fIn = M.textInput(inp, "<em>f</em>(<em>x</em>) =", P.f, function (v) { f = parse(v, fIn); draw(); });
    var aIn = M.textInput(inp, "<em>a</em> =", P.a, function (v) { A = val(v, aIn); draw(); }, "4.5rem");
    var bIn = M.textInput(inp, "<em>b</em> =", P.b, function (v) { B = val(v, bIn); draw(); }, "4.5rem");
    M.zoomControls(box, plot, function () { return P.win; }, draw, { pan: true });
    function load(k) {
      key = k; P = presets[k];
      fIn.set(P.f); f = parse(P.f, fIn); aIn.set(P.a); A = val(P.a, aIn); bIn.set(P.b); B = val(P.b, bIn);
      M.setWindow(plot, P.win); draw();
    }
    // drag the end points
    var svg = plot.svg, which = null;
    svg.addEventListener("pointerdown", function (evt) {
      var p = plot.at(evt);
      if (!f) return;
      var dA = Math.hypot(p.px - plot.sx(A), p.py - plot.sy(f(A))), dB = Math.hypot(p.px - plot.sx(B), p.py - plot.sy(f(B)));
      if (Math.min(dA, dB) < 18 * plot.K) { which = dA <= dB ? "A" : "B"; svg.setPointerCapture(evt.pointerId); evt.preventDefault(); }
    });
    svg.addEventListener("pointermove", function (evt) {
      if (!which) return;
      var p = plot.at(evt), o = plot.o, step = M.niceStep(o.x1 - o.x0, 200), x = Math.round(Math.min(o.x1, Math.max(o.x0, p.x)) / step) * step;
      if (which === "A") { A = Math.min(x, B - step); aIn.set(num(A, 6)); } else { B = Math.max(x, A + step); bIn.set(num(B, 6)); }
      draw();
    });
    svg.addEventListener("pointerup", function () { which = null; });
    svg.addEventListener("pointercancel", function () { which = null; });
    M.onResize(draw);
    load(key);
  })();
</script>
