---
layout: page
title: Continuity and the Intermediate Value Theorem
description: An interactive tool for MATH 101, weeks 3–4. Check the three conditions for continuity at a number, classify discontinuities as removable, jump or infinite, and use the Intermediate Value Theorem to locate a root.
permalink: /teaching/math101/tools/continuity/
---

[← MATH 101]({{ '/teaching/math101/' | relative_url }})

A function $$f$$ is **continuous at a number** $$a$$ if $$\lim_{x \to a} f(x) = f(a)$$. That asks for three things: $$f(a)$$ is defined, $$\lim_{x \to a} f(x)$$ exists, and the two are equal. When one of them fails, the textbook names three kinds of discontinuity: **removable**, **jump** and **infinite**. The first part of this tool checks the three conditions and names the discontinuity. The second part uses the **Intermediate Value Theorem** to trap a root of an equation in smaller and smaller intervals. It supports learning outcomes 3 and 4.

## Continuity at a number

<div class="mm-wrap" id="ct">
  <div class="mm-controls" id="ct-top"></div>
  <div class="mm-controls" id="ct-input"></div>
  <svg id="ct-plot" role="img" aria-label="Graph of the function near the number a"></svg>
  <div class="mm-controls" id="ct-controls"></div>
  <p class="mm-help">Leave <b>value at a</b> empty to use the formula there, or type a number to redefine <em>f</em>(<em>a</em>). A filled dot marks <em>f</em>(<em>a</em>); an open circle marks a limit that <em>f</em>(<em>a</em>) does not equal.</p>
  <div class="mm-readout" id="ct-out"></div>
</div>

1. For $$\dfrac{x^2 - x - 2}{x - 2}$$ at 2, which condition fails? Redefine $$f(2) = 3$$. Is the discontinuity gone? Now try $$f(2) = 1$$, as the textbook does.
2. Compare $$1/x^2$$ (with $$f(0) = 1$$), the greatest integer function at 1, and $$\sin(1/x)$$ at 0. Which condition fails in each, and why is a removable discontinuity the only kind that can be "removed"?
3. For the greatest integer function at 1, is $$f$$ continuous from the right? From the left?
4. Type your own function, for example $$\dfrac{\sin x}{x}$$ at 0 or $$\dfrac{x^2 - 9}{x + 3}$$ at $$-3$$, and decide what value of $$f(a)$$ would make it continuous.

## The Intermediate Value Theorem

**Theorem.** Suppose that $$f$$ is continuous on the closed interval $$[a, b]$$ and let $$N$$ be any number between $$f(a)$$ and $$f(b)$$, where $$f(a) \neq f(b)$$. Then there exists a number $$c$$ in $$(a, b)$$ such that $$f(c) = N$$.

<div class="mm-wrap" id="iv">
  <div class="mm-controls" id="iv-top"></div>
  <div class="mm-controls" id="iv-input"></div>
  <svg id="iv-plot" role="img" aria-label="Graph of the function on the interval, with the line y = N"></svg>
  <div class="mm-controls" id="iv-controls"></div>
  <div class="mm-readout" id="iv-out"></div>
  <div class="mm-scroll"><table class="mm-table" id="iv-tab" style="width:100%"></table></div>
</div>

1. The textbook shows that $$4x^3 - 6x^2 + 3x - 2 = 0$$ has a root between 1 and 2, then narrows it down to $$(1.2, 1.3)$$ and $$(1.22, 1.23)$$. Press **next step** twice and compare the table with the textbook's values.
2. Switch to **bisection**. How many steps does it take to trap the root in an interval shorter than $$0.001$$? How many steps does the decimal search take?
3. Move $$N$$. For which values of $$N$$ does the theorem promise a solution of $$f(c) = N$$ in the interval? Can there be more than one $$c$$?
4. For $$1/x$$ on $$[-1, 1]$$, $$f(-1) < 0 < f(1)$$, but there is no root. Which hypothesis of the theorem fails?

## How it is computed

One-sided limits are estimated from values of $$f$$ at $$a \pm 10^{-2}$$, $$a \pm 10^{-3}$$ and $$a \pm 10^{-4}$$, extrapolated and checked against slightly shifted points, as in the tool on limits; a one-sided limit is called infinite when the values grow steadily in size. A discontinuity is **removable** when the limit exists but differs from $$f(a)$$ or $$f(a)$$ is undefined, a **jump** when the one-sided limits exist but differ, and **infinite** when a one-sided limit is infinite. For the Intermediate Value Theorem, continuity on $$[a, b]$$ is checked by sampling the interval and looking for gaps and jumps. The decimal search splits the current interval into ten equal parts and keeps the first part on which $$f(x) - N$$ changes sign; bisection splits it in two.

<p class="mm-note">The tool runs entirely in your browser; nothing is recorded or sent anywhere. It is a learning aid and is not assessed.</p>

<script src="{{ '/assets/js/teaching/mm-tools.js' | relative_url }}"></script>
<script>
  (function () {
    var M = window.MMTools;
    function num(v, d) { if (!isFinite(v)) return v > 0 ? "∞" : v < 0 ? "−∞" : "undefined"; if (Math.abs(v) < 1e-12) return "0"; return String(+v.toPrecision(d || 6)).replace("-", "−"); }
    function parse(v, box) { try { var g = M.expr(v); box.showError(""); return g; } catch (e) { box.showError(e.message); return null; } }
    function val(v, box) { try { var r = M.expr(v)(0); box.showError(isFinite(r) ? "" : "not a number"); return r; } catch (e) { box.showError(e.message); return NaN; } }
    // one-sided limit along a ± 10^-k (as in the limits tool)
    function trend(f, a, s) {
      var hs = [1e-2, 1e-3, 1e-4], v = hs.map(function (h) { return f(a + s * h); }), w = hs.map(function (h) { return f(a + s * 0.7371 * h); });
      // infinite limits: steady growth in size with one sign, slow growth with equal steps (like ln x), or overflow
      if (v.some(isNaN)) return { kind: "undefined" };
      var last = v.slice(-3), pos = last.every(function (q) { return q > 0; }), negv = last.every(function (q) { return q < 0; });
      var grows = last.every(function (q, i) { return i === 0 || Math.abs(q) > Math.abs(last[i - 1]) || (!isFinite(q) && !isNaN(q)); });
      if ((pos || negv) && last.some(function (q) { return !isFinite(q); }) && grows !== false) return { kind: "inf", L: pos ? Infinity : -Infinity };
      if (v.some(function (q) { return !isFinite(q); })) return { kind: "undefined" };
      var e1 = last[1] - last[0], e2 = last[2] - last[1];
      var big = grows && Math.abs(last[2]) > 50 && Math.abs(last[2]) > 2 * Math.abs(last[1]);
      var slow = grows && e1 !== 0 && e2 / e1 >= 0.8 && Math.abs(e2) > 1e-3 * (1 + Math.abs(last[2]));
      if ((pos || negv) && (big || slow)) return { kind: "inf", L: pos ? Infinity : -Infinity };
      var n = 3;
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
    function same(p, q) { return Math.abs(p - q) <= 1e-6 * (1 + Math.abs(p)); }

    // ---- continuity at a number ----
    var cps = {
      rem: { name: "(x² − x − 2)/(x − 2) at 2", f: "(x^2 - x - 2)/(x - 2)", a: "2", win: [-1, 5, -1, 6] },
      rem1: { name: "same, with f(2) = 1", f: "(x^2 - x - 2)/(x - 2)", a: "2", v: "1", win: [-1, 5, -1, 6] },
      inf: { name: "1/x² with f(0) = 1", f: "1/x^2", a: "0", v: "1", win: [-3, 3, -1, 10] },
      jump: { name: "greatest integer ⟦x⟧ at 1", f: "floor(x)", a: "1", win: [-1, 3, -1.5, 3] },
      heav: { name: "Heaviside H(x) at 0", f: "H(x)", a: "0", win: [-2, 2, -0.5, 1.5] },
      osc: { name: "sin(1/x) at 0", f: "sin(1/x)", a: "0", win: [-0.5, 0.5, -1.5, 1.5] },
      cont: { name: "x³ − 2x + 1 at 1", f: "x^3 - 2x + 1", a: "1", win: [-2, 2.5, -3, 6] },
      root: { name: "√x at 0", f: "sqrt(x)", a: "0", win: [-1, 4, -0.5, 2.5] },
    };
    var ck = "rem", CP = cps[ck], cf = null, ca = 2, cv = null;
    var cplot = new M.Plot(document.getElementById("ct-plot"), { x0: 0, x1: 1, y0: 0, y1: 1, gx: 1, gy: 1, xname: "x", yname: "y", aspect: 0.55, aspectNarrow: 0.85, left: 30 });
    function F(x) { var y = cv !== null && x === ca ? cv : cf(x); return Math.abs(y) > 1e12 ? NaN : y; } // tan(π/2) = 1.6×10¹⁶ is really undefined
    var cFocus = null; // the point x = a, which Zoom in keeps in view
    function cdraw() {
      cplot.frame();
      var out = document.getElementById("ct-out");
      if (!cf || !isFinite(ca)) { out.innerHTML = "Enter a formula and a number <em>a</em>."; return; }
      var o = cplot.o, vl = cplot.path([[ca, o.y0], [ca, o.y1]], "mm-zero"); vl.style.strokeDasharray = "4 4";
      cplot.fn(cf, "mm-a", { n: 3000 });
      var fa = F(ca), tl = trend(cf, ca, -1), tr = trend(cf, ca, 1), lim = null;
      if (tl.kind === "lim" && tr.kind === "lim" && same(tl.L, tr.L)) lim = tr.L;
      cFocus = [ca, tl.kind === "lim" && tr.kind === "lim" ? (tl.L + tr.L) / 2 : tl.kind === "lim" ? tl.L : tr.kind === "lim" ? tr.L : isFinite(fa) ? fa : (o.y0 + o.y1) / 2, lim !== null && (!isFinite(fa) || same(lim, fa)) ? "" : "x"];
      // markers: open circles at one-sided limits that differ from f(a), a dot at f(a)
      [tl, tr].forEach(function (t) { if (t.kind === "lim" && !(isFinite(fa) && same(t.L, fa))) { var h = cplot.circle(ca, t.L, 5, "mm-eq-u"); h.style.stroke = "var(--mm-a)"; } });
      if (isFinite(fa)) cplot.circle(ca, fa, 4.5, "mm-dot");
      function side(t, s) {
        var lim = "lim<sub><em>x</em>→" + num(ca) + "<sup>" + s + "</sup></sub> <em>f</em>(<em>x</em>)";
        return t.kind === "lim" || t.kind === "inf" ? lim + " = " + num(t.L) : t.kind === "undefined" ? "<em>f</em> is not defined " + (s === "−" ? "to the left of " : "to the right of ") + num(ca) : lim + " does not exist";
      }
      var A = num(ca), rows = [];
      var c1 = isFinite(fa), c2 = lim !== null, c3 = c1 && c2 && same(lim, fa);
      rows.push((c1 ? "✓" : "✗") + " <em>f</em>(" + A + ") " + (c1 ? "= " + num(fa) : "is not defined"));
      rows.push((c2 ? "✓" : "✗") + " " + side(tl, "−") + " and " + side(tr, "+") + (c2 ? ", so lim<sub><em>x</em>→" + A + "</sub> <em>f</em>(<em>x</em>) = " + num(lim) : ", so lim<sub><em>x</em>→" + A + "</sub> <em>f</em>(<em>x</em>) does not exist"));
      rows.push((c3 ? "✓" : "✗") + " " + (c1 && c2 ? (c3 ? "the limit equals <em>f</em>(" + A + ")" : "the limit does not equal <em>f</em>(" + A + ")") : "the limit and <em>f</em>(" + A + ") cannot be compared"));
      var verdict;
      if (c3) verdict = "<em>f</em> is <b>continuous</b> at " + A + ".";
      else if (c2) verdict = "<em>f</em> has a <b>removable discontinuity</b> at " + A + ": defining <em>f</em>(" + A + ") = " + num(lim) + " would make it continuous.";
      else if (tl.kind === "inf" || tr.kind === "inf") verdict = "<em>f</em> has an <b>infinite discontinuity</b> at " + A + ".";
      else if (tl.kind === "lim" && tr.kind === "lim") verdict = "<em>f</em> has a <b>jump discontinuity</b> at " + A + ".";
      else if ((tl.kind === "undefined") !== (tr.kind === "undefined") && (tl.kind === "lim" || tr.kind === "lim")) {
        // an end of the domain: only the one-sided limit from inside the domain matters
        var one = tl.kind === "lim" ? tl : tr, from = tl.kind === "lim" ? "left" : "right";
        verdict = "<em>f</em> is defined on only one side of " + A + " (it is an end of the domain), so only continuity from the " + from + " can hold. " +
          (!c1 ? "Here <em>f</em>(" + A + ") is not defined, so <em>f</em> is not continuous from the " + from + " either; defining <em>f</em>(" + A + ") = " + num(one.L) + " would make it so." : same(one.L, fa) ? "" : "The one-sided limit is not <em>f</em>(" + A + "), so <em>f</em> is not continuous from the " + from + ".");
      }
      else verdict = "<em>f</em> is <b>discontinuous</b> at " + A + ", but the discontinuity is not removable, jump or infinite: the values oscillate.";
      var sides = [];
      if (c1 && !c3) {
        if (tr.kind === "lim" && same(tr.L, fa)) sides.push("continuous from the right");
        if (tl.kind === "lim" && same(tl.L, fa)) sides.push("continuous from the left");
      }
      out.innerHTML = rows.map(function (r) { return "<div>" + r + "</div>"; }).join("") + "<div style=\"margin-top:.4rem\">" + verdict + (sides.length ? " It is " + sides.join(" and ") + " at " + A + "." : "") + "</div>";
    }
    var ctop = document.getElementById("ct-top"), cin = document.getElementById("ct-input"), cbox = document.getElementById("ct-controls");
    M.select(M.group(ctop, "Example"), Object.keys(cps).map(function (k) { return [k, cps[k].name]; }), ck, function (v) { cload(v); });
    var cfIn = M.textInput(cin, "<em>f</em>(<em>x</em>) =", CP.f, function (v) { cf = parse(v, cfIn); cdraw(); });
    var caIn = M.textInput(cin, "<em>a</em> =", CP.a, function (v) { ca = val(v, caIn); cdraw(); }, "4.5rem");
    var cvIn = M.textInput(cin, "value at <em>a</em>:", "", function (v) { setCV(v); cdraw(); }, "4.5rem");
    function setCV(v) { if (!v.trim()) { cv = null; cvIn.showError(""); return; } var r = val(v, cvIn); cv = isFinite(r) ? r : null; }
    M.zoomControls(cbox, cplot, function () { return CP.win; }, cdraw, { focus: function () { return cFocus; }, pan: true });
    function cload(k) {
      ck = k; CP = cps[k];
      cfIn.set(CP.f); cf = parse(CP.f, cfIn); caIn.set(CP.a); ca = val(CP.a, caIn); cvIn.set(CP.v || ""); setCV(CP.v || "");
      M.setWindow(cplot, CP.win); cdraw();
    }

    // ---- Intermediate Value Theorem ----
    var ips = {
      book: { name: "4x³ − 6x² + 3x − 2 on [1, 2]", f: "4x^3 - 6x^2 + 3x - 2", a: "1", b: "2", N: 0 },
      cubic: { name: "x³ + x − 1 on [0, 1]", f: "x^3 + x - 1", a: "0", b: "1", N: 0 },
      cos: { name: "cos x − x on [0, 1]", f: "cos x - x", a: "0", b: "1", N: 0 },
      exp: { name: "e^x on [0, 2], N = 5", f: "e^x", a: "0", b: "2", N: 5 },
      recip: { name: "1/x on [−1, 1]", f: "1/x", a: "-1", b: "1", N: 0 },
    };
    var ik = "book", IP = ips[ik], g = null, A = 1, B = 2, N = 0, method = "dec", steps = [], follow = true;
    var iplot = new M.Plot(document.getElementById("iv-plot"), { x0: 0, x1: 1, y0: 0, y1: 1, gx: 1, gy: 1, xname: "x", yname: "y", aspect: 0.5, aspectNarrow: 0.85, left: 30 });
    function h(x) { return g(x) - N; }
    function continuousOn(a, b) {
      if (M.holes(g, a, b).length) return false; // a missing point, such as x = 1 for (x² − 1)/(x − 1)
      var n = 4000, py = g(a), px = a, H = 0, ys = [];
      for (var i = 0; i <= n; i++) { var y = g(a + ((b - a) * i) / n); if (!isFinite(y)) return false; ys.push(y); }
      var lo = Math.min.apply(null, ys), hi = Math.max.apply(null, ys); H = hi - lo || 1;
      for (var j = 1; j <= n; j++) {
        var x = a + ((b - a) * j) / n, y = ys[j];
        if (Math.abs(y - py) > 0.02 * H) {
          // bisect the step: a jump keeps its size as the interval shrinks
          var u = px, v = x, fu = py, fv = y;
          for (var k = 0; k < 50; k++) { var m = (u + v) / 2, fm = g(m); if (!isFinite(fm)) return false; if (Math.abs(fm - fu) > Math.abs(fv - fm)) { v = m; fv = fm; } else { u = m; fu = fm; } }
          if (Math.abs(fv - fu) > 1e-3 * H) return false;
        }
        px = x; py = y;
      }
      return true;
    }
    // solutions of f(x) = N in [a, b]; a long run of exact solutions (f constant at N) is returned in out.runs
    function solutions(a, b) {
      var out = [], n = 3000, xp = a, yp = h(a), run = 0, rs = a;
      out.runs = [];
      if (yp === 0) out.push(a);
      for (var i = 1; i <= n; i++) {
        var x = a + ((b - a) * i) / n, y = h(x);
        if (y === 0 && yp === 0) { if (!run++) rs = xp; xp = x; continue; }
        if (run) { if (run > 20) { var rr = out.runs; out = out.filter(function (q) { return q < rs - 1e-9; }); out.runs = rr; rr.push([rs, xp]); } run = 0; }
        if (isFinite(y) && isFinite(yp) && (y === 0 || yp * y < 0)) {
          var u = xp, v = x, fu = yp;
          for (var k = 0; k < 60; k++) { var m = (u + v) / 2, fm = h(m); if (fu * fm <= 0) v = m; else { u = m; fu = fm; } }
          var r = (u + v) / 2;
          if (Math.abs(h(r)) < 1e-6 * (1 + Math.abs(N)) && !out.some(function (q) { return Math.abs(q - r) < 1e-7; })) out.push(r);
        }
        xp = x; yp = y;
      }
      if (run > 20) { var rr = out.runs; out = out.filter(function (q) { return q < rs - 1e-9; }); out.runs = rr; rr.push([rs, xp]); }
      return out;
    }
    function next() {
      var cur = steps[steps.length - 1], l = cur[0], r = cur[1];
      if (!(h(l) * h(r) < 0)) return;
      if (method === "bis") { var m = (l + r) / 2; steps.push(h(l) * h(m) <= 0 ? [l, m] : [m, r]); }
      else {
        for (var i = 0; i < 10; i++) {
          var u = l + ((r - l) * i) / 10, v = l + ((r - l) * (i + 1)) / 10;
          if (h(u) === 0) { steps.push([u, u]); return; }
          if (h(u) * h(v) < 0) { steps.push([+u.toPrecision(12), +v.toPrecision(12)]); return; }
        }
      }
    }
    function idraw() {
      var out = document.getElementById("iv-out"), tab = document.getElementById("iv-tab");
      if (!g || !isFinite(A) || !isFinite(B) || !(B > A)) { iplot.frame(); out.innerHTML = "Enter a formula and an interval with <em>a</em> &lt; <em>b</em>."; tab.innerHTML = ""; return; }
      var fa = g(A), fb = g(B), cur = steps[steps.length - 1];
      // window: the whole interval, or the current step when following
      var L0 = follow ? cur[0] : A, R0 = follow ? cur[1] : B, pad = (R0 - L0) * 0.15 || 1e-6, ys = [];
      for (var i = 0; i <= 200; i++) { var y = g(L0 + ((R0 - L0) * i) / 200); if (isFinite(y)) ys.push(y); }
      ys.push(N);
      var lo = Math.min.apply(null, ys), hi = Math.max.apply(null, ys), py = (hi - lo) * 0.12 || 1;
      if (!follow) { lo = Math.max(lo, Math.min(fa, fb, N) - 3 * Math.abs(fb - fa)); hi = Math.min(hi, Math.max(fa, fb, N) + 3 * Math.abs(fb - fa)); }
      M.setWindow(iplot, [L0 - pad, R0 + pad, lo - py, hi + py]);
      iplot.frame();
      var o = iplot.o;
      M.el("rect", { x: iplot.sx(cur[0]), y: iplot.sy(o.y1), width: Math.max(1, iplot.sx(cur[1]) - iplot.sx(cur[0])), height: iplot.sy(o.y0) - iplot.sy(o.y1), style: "fill:var(--mm-c);opacity:.14;stroke:none" }, iplot.data);
      var nl = iplot.path([[o.x0, N], [o.x1, N]], "mm-b"); nl.style.strokeWidth = "1.5";
      iplot.fn(g, "mm-a", { n: 2000 });
      [[A, fa], [B, fb]].forEach(function (p) { if (isFinite(p[1])) iplot.circle(p[0], p[1], 4.5, "mm-dot"); });
      var cont = continuousOn(A, B), sol = solutions(A, B), between = isFinite(fa) && isFinite(fb) && fa !== fb && (N - fa) * (N - fb) < 0;
      sol.slice(0, 60).forEach(function (c) { var q = iplot.circle(c, N, 4.5, "mm-eq-u"); q.style.stroke = "var(--mm-b)"; });
      var t = "<em>f</em>(" + num(A) + ") = " + num(fa) + " and <em>f</em>(" + num(B) + ") = " + num(fb) + ". ";
      if (!cont) t += "<em>f</em> is <b>not continuous</b> on [" + num(A) + ", " + num(B) + "], so the theorem does not apply. ";
      else if (between) t += "<em>f</em> is continuous on [" + num(A) + ", " + num(B) + "] and <em>N</em> = " + num(N) + " lies between <em>f</em>(" + num(A) + ") and <em>f</em>(" + num(B) + "), so the theorem guarantees a number <em>c</em> in (" + num(A) + ", " + num(B) + ") with <em>f</em>(<em>c</em>) = " + num(N) + ". ";
      else t += "<em>N</em> = " + num(N) + " does not lie strictly between <em>f</em>(" + num(A) + ") and <em>f</em>(" + num(B) + "), so the theorem promises nothing. ";
      var st = sol.slice(0, 12).map(function (c) { return num(c, 7); });
      if (sol.length > 12) st.push("and " + (sol.length - 12) + " more");
      var rt = sol.runs.map(function (r) { return "every <em>c</em> from " + num(r[0], 7) + " to " + (r[1] >= B - 1e-12 * Math.max(1, Math.abs(B)) ? num(B, 7) : "about " + num(r[1], 7)); });
      t += st.length || rt.length ? "In fact <em>f</em>(<em>c</em>) = " + num(N) + (st.length ? " at <em>c</em> = " + st.join(", ") + (rt.length ? ", and " : "") : " ") + (rt.length ? "for " + rt.join(" and ") : "") + "." : "There is no <em>c</em> in the interval with <em>f</em>(<em>c</em>) = " + num(N) + ".";
      out.innerHTML = t;
      var hd = "<thead><tr><th>step</th><th>interval</th><th><em>f</em>(left)</th><th><em>f</em>(right)</th><th>length</th></tr></thead><tbody>";
      steps.forEach(function (s, i) { hd += "<tr><td>" + i + "</td><td>[" + num(s[0], 10) + ", " + num(s[1], 10) + "]</td><td>" + num(g(s[0]), 7) + "</td><td>" + num(g(s[1]), 7) + "</td><td>" + num(s[1] - s[0], 3) + "</td></tr>"; });
      tab.innerHTML = hd + "</tbody>";
      nextB.disabled = !(cont && h(cur[0]) * h(cur[1]) < 0) || steps.length > 40;
    }
    var itop = document.getElementById("iv-top"), iin = document.getElementById("iv-input"), ibox = document.getElementById("iv-controls");
    M.select(M.group(itop, "Example"), Object.keys(ips).map(function (k) { return [k, ips[k].name]; }), ik, function (v) { iload(v); });
    var gIn = M.textInput(iin, "<em>f</em>(<em>x</em>) =", IP.f, function (v) { g = parse(v, gIn); restart(); });
    var aIn = M.textInput(iin, "<em>a</em> =", IP.a, function (v) { A = val(v, aIn); restart(); }, "4rem");
    var bIn = M.textInput(iin, "<em>b</em> =", IP.b, function (v) { B = val(v, bIn); restart(); }, "4rem");
    var g1 = M.group(ibox, "Find c");
    var NS = M.slider(g1, { label: "<em>N</em>", min: -5, max: 15, step: 0.01, value: N, digits: 2, onInput: function (v) { N = v; restart(); } });
    M.select(g1, [["dec", "decimal search (as in the textbook)"], ["bis", "bisection"]], method, function (v) { method = v; restart(); });
    var nextB = M.button(g1, "Next step", function () { next(); idraw(); });
    M.button(g1, "Restart", function () { restart(); });
    M.checkbox(M.group(ibox, "View"), "Zoom to the current interval", follow, function (v) { follow = v; idraw(); });
    function restart() { steps = [[A, B]]; idraw(); }
    function iload(k) {
      ik = k; IP = ips[k];
      gIn.set(IP.f); g = parse(IP.f, gIn); aIn.set(IP.a); A = val(IP.a, aIn); bIn.set(IP.b); B = val(IP.b, bIn);
      N = IP.N; NS.set(N); restart();
    }
    M.onResize(function () { cdraw(); idraw(); });
    cload(ck);
    iload(ik);
  })();
</script>
