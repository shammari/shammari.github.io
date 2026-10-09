---
layout: page
title: Areas between curves
description: An interactive tool for MATH 101, week 14. Find the area between two curves by integrating top minus bottom (or right minus left), with the intersection points, a typical rectangle and regions where the curves cross.
permalink: /teaching/math101/tools/area-between-curves/
---

[← MATH 101]({{ '/teaching/math101/' | relative_url }})

The area of the region between the curves $$y = f(x)$$ and $$y = g(x)$$ and the lines $$x = a$$ and $$x = b$$, where $$f(x) \ge g(x)$$ on $$[a, b]$$, is

$$A = \int_a^b [f(x) - g(x)]\,dx,$$

the limit of sums of thin rectangles of height $$y_T - y_B$$ (top minus bottom) and width $$\Delta x$$. If the curves cross, the area is $$\int_a^b \lvert f(x) - g(x)\rvert \,dx$$, split at the crossing points. Some regions are easier with horizontal rectangles: for curves $$x = f(y)$$ and $$x = g(y)$$, $$A = \int_c^d (x_R - x_L)\,dy$$. This tool finds the intersection points, shades the region and computes the area both ways. It supports learning outcome 12.

<div class="mm-wrap" id="ab">
  <div class="mm-controls" id="ab-top"></div>
  <div class="mm-controls" id="ab-input"></div>
  <svg id="ab-plot" role="img" aria-label="The two curves with the region between them shaded"></svg>
  <div class="mm-controls" id="ab-controls"></div>
  <p class="mm-help">With <b>between intersection points</b> ticked, the limits are the first and last points in the window where the curves meet. The strip shows a typical rectangle; move it with the slider. Green shading is where the first curve is on top (or to the right), orange where the second is.</p>
  <div class="mm-readout" id="ab-out"></div>
</div>

## Things to try

1. Find the area between $$y = e^x$$ and $$y = x$$ from $$x = 0$$ to $$x = 1$$, and compare with the textbook's $$e - \tfrac{3}{2}$$. Which curve is on top?
2. For $$y = x^2$$ and $$y = 2x - x^2$$, the region is enclosed by the curves alone. Where do they meet? Check the textbook's area, $$\tfrac{1}{3}$$.
3. For $$y = x/\sqrt{x^2 + 1}$$ and $$y = x^4 - x$$, the intersection points cannot be found exactly. Read them off and compare the area with the textbook's estimate, about 0.785.
4. For $$\sin x$$ and $$\cos x$$ on $$[0, \pi/2]$$, the curves cross. Compare $$\int (\cos x - \sin x)\,dx$$ with the true area, $$2\sqrt{2} - 2$$. Why are they different?
5. For the line $$y = x - 1$$ and the parabola $$y^2 = 2x + 6$$, vertical rectangles would need two different formulas. Switch to **horizontal rectangles**, with $$x = y + 1$$ and $$x = \tfrac{1}{2}y^2 - 3$$, and check the textbook's area, 18.

## How it is computed

The intersection points are the sign changes of $$f - g$$ on a fine grid, refined by bisection. The area is $$\int_a^b \lvert f - g\rvert $$, computed by Simpson's rule on each piece between crossing points, where $$f - g$$ has one sign; the net integral $$\int_a^b (f - g)$$ is shown for comparison. In horizontal mode the same is done with $$y$$ as the variable.

<p class="mm-note">The tool runs entirely in your browser; nothing is recorded or sent anywhere. It is a learning aid and is not assessed.</p>

<script src="{{ '/assets/js/teaching/mm-tools.js' | relative_url }}"></script>
<script>
  (function () {
    var M = window.MMTools;
    var presets = {
      ex1: { name: "y = e^x and y = x, 0 ≤ x ≤ 1", f: "e^x", g: "x", a: "0", b: "1", auto: false, mode: "x", exact: "e − 3/2", win: [-0.5, 1.5, -0.5, 3.2] },
      ex2: { name: "y = x² and y = 2x − x²", f: "2x - x^2", g: "x^2", auto: true, mode: "x", exact: "1/3", win: [-0.5, 1.5, -0.5, 1.5] },
      ex3: { name: "y = x/√(x² + 1) and y = x⁴ − x", f: "x/sqrt(x^2 + 1)", g: "x^4 - x", auto: true, mode: "x", exact: "≈ 0.785", win: [-0.5, 1.5, -0.6, 1.2] },
      ex6: { name: "y = sin x and y = cos x, 0 ≤ x ≤ π/2", f: "cos x", g: "sin x", a: "0", b: "pi/2", auto: false, mode: "x", exact: "2√2 − 2", win: [-0.2, 1.8, -0.2, 1.2] },
      ex7: { name: "x = y + 1 and x = ½y² − 3 (horizontal)", f: "y + 1", g: "y^2/2 - 3", auto: true, mode: "y", exact: "18", win: [-4, 7, -3, 5] },
    };
    var key = "ex1", P = presets[key], f = null, g = null, A = 0, B = 1, auto = false, mode = "x", strip = 0.5;
    var plot = new M.Plot(document.getElementById("ab-plot"), { x0: 0, x1: 1, y0: 0, y1: 1, gx: 1, gy: 1, xname: "x", yname: "y", aspect: 0.6, aspectNarrow: 0.85, left: 30 });
    function num(v, d) { if (!isFinite(v)) return "undefined"; if (Math.abs(v) < 1e-10) return "0"; return String(+v.toPrecision(d || 6)).replace(/-/g, "−"); }
    function d(t) { return f(t) - g(t); }
    function snapR(r) { var q = Math.round(r * 1e4) / 1e4 + 0; return Math.abs(q - r) < 1e-7 || (Math.abs(q - r) < 1e-5 && Math.abs(d(q)) <= Math.abs(d(r))) ? q : r; }
    // Where the curves meet in [lo, hi]: sign changes of f − g, places where f − g touches 0 without changing sign,
    // and ends of the domain where f − g = 0. Stretches where the curves coincide are returned in out.same.
    function crossings(lo, hi) {
      var out = [], n = 4000, w = (hi - lo) / n, ts = [], ds = [], i, k;
      out.same = [];
      for (i = 0; i <= n; i++) { ts.push(lo + w * i); ds.push(d(ts[i])); }
      var fin = ds.filter(isFinite).map(Math.abs).sort(function (p, q) { return p - q; }), H = fin.length ? fin[Math.floor(0.9 * fin.length)] : 1;
      function add(r) { if (isFinite(d(r)) && !out.some(function (z) { return Math.abs(z - r) < 1e-6 * (hi - lo); }) && !out.same.some(function (q) { return r >= q[0] - w && r <= q[1] + w; })) out.push(r); }
      for (i = 0; i <= n; i = k + 1) {
        for (k = i; k <= n && ds[k] === 0; k++);
        if (k - i > 20) out.same.push([ts[i], ts[k - 1]]);
        if (k === i) k = i; else k--;
      }
      for (i = 1; i <= n; i++) {
        var dp = ds[i - 1], dv = ds[i];
        if (dp === 0 && dv === 0) continue;
        if (isFinite(dv) && isFinite(dp) && (dv === 0 || dp * dv < 0)) {
          var u = ts[i - 1], v = ts[i], du = dp;
          for (k = 0; k < 60; k++) { var m = (u + v) / 2, dm = d(m); if (!isFinite(dm)) break; if (du * dm <= 0) v = m; else { u = m; du = dm; } }
          var r = snapR(dv === 0 ? ts[i] : (u + v) / 2);
          if (Math.abs(d(r)) <= 1e-3 * Math.min(Math.abs(dp), Math.abs(dv)) + 1e-12 * (1 + H)) add(r); // not a jump across a pole
        }
        // the domain of f − g starts or ends here: do the curves meet at that end?
        if (isFinite(dp) !== isFinite(dv)) {
          var a2 = ts[i - 1], b2 = ts[i];
          for (k = 0; k < 60; k++) { var mm = (a2 + b2) / 2; if (isFinite(d(mm)) === isFinite(dp)) a2 = mm; else b2 = mm; }
          var e = snapR(isFinite(dp) ? a2 : b2);
          if (Math.abs(d(e)) < 1e-9 * (1 + H)) add(e);
        }
        // touching without crossing (y = x² and y = 0 at 0)
        if (i < n && isFinite(dv) && isFinite(dp) && isFinite(ds[i + 1]) && Math.abs(dv) <= Math.abs(dp) && Math.abs(dv) <= Math.abs(ds[i + 1]) && dv !== 0 && dp * dv > 0 && dv * ds[i + 1] > 0) {
          var uu = ts[i - 1], vv = ts[i + 1];
          for (k = 0; k < 80; k++) { var m1 = uu + (vv - uu) / 3, m2 = vv - (vv - uu) / 3; if (Math.abs(d(m1)) < Math.abs(d(m2))) vv = m2; else uu = m1; }
          var z = snapR((uu + vv) / 2);
          if (Math.abs(d(z)) < 1e-9 * (1 + H)) add(z);
        }
      }
      // an end of the window that is itself a meeting point
      [lo, hi].forEach(function (t) { if (d(t) === 0) add(t); });
      out.sort(function (p, q) { return p - q; });
      return out;
    }
    // points in the plane for a curve: (t, h(t)) for y = h(x), or (h(t), t) for x = h(y)
    function pt(t, h) { return mode === "x" ? [t, h(t)] : [h(t), t]; }
    function draw() {
      plot.o.xname = "x"; plot.o.yname = "y";
      plot.frame();
      var out = document.getElementById("ab-out");
      if (!f || !g) { out.innerHTML = "Enter both curves."; return; }
      var o = plot.o, lo = mode === "x" ? o.x0 : o.y0, hi = mode === "x" ? o.x1 : o.y1, v = mode === "x" ? "x" : "y";
      var X = crossings(lo, hi), a = A, b = B;
      if (auto) { if (X.length >= 2) { a = X[0]; b = X[X.length - 1]; } else { out.innerHTML = (X.same.length ? "The curves coincide for " + v + " from " + num(X.same[0][0], 5) + " to " + num(X.same[0][1], 5) + ", where there is no area between them, and otherwise meet " : "The curves meet ") + (X.length ? "only once" : "nowhere") + " in this window, so they do not enclose a region here; untick <b>between intersection points</b> and give limits."; a = b = NaN; } }
      // jumps of f − g split the region too; a pole or a gap means there is no area to find
      var JB = [], bad = null;
      if (isFinite(a) && isFinite(b) && b > a) {
        var hs = M.holes(d, a, b);
        M.breaks(d, a, b).forEach(function (q) {
          if (q.kind === "jump") JB.push(q.x);
          else if (!hs.some(function (h) { return Math.abs(h - q.x) < 1e-6 * (b - a); }) && !bad) bad = q;
        });
        [a, b].forEach(function (e, j) { var y = d(e + (j ? -1 : 1) * 1e-10 * (b - a)); if (!bad && !isFinite(y)) bad = { x: e, kind: "gap" }; });
        // an undefined point where the difference blows up on either side is a pole, not a gap
        if (bad) {
          var ty = []; for (var q = 1; q < 40; q++) { var yq = Math.abs(d(a + ((b - a) * (q + 0.31)) / 40)); if (isFinite(yq)) ty.push(yq); }
          ty.sort(function (p1, p2) { return p1 - p2; });
          var typ = (ty.length ? ty[Math.floor(ty.length / 2)] : 0) + 1, e1 = 1e-7 * (b - a);
          if ([bad.x - e1, bad.x + e1].some(function (z) { return z >= a && z <= b && Math.abs(d(z)) > 1e4 * typ; })) bad = { x: bad.x, kind: "pole" };
        }
      }
      if (isFinite(a) && isFinite(b) && b > a && !bad) {
        // shade, piece by piece between crossings
        var cuts = [a].concat(X.concat(JB).filter(function (z) { return z > a + 1e-9 && z < b - 1e-9; }).sort(function (p, q) { return p - q; })).concat([b]);
        for (var i = 0; i < cuts.length - 1; i++) {
          var l = cuts[i], r = cuts[i + 1], N = 200, top = [], bot = [], sign = d((l + r) / 2) >= 0;
          for (var k = 0; k <= N; k++) { var t = l + ((r - l) * k) / N; top.push(pt(t, f)); bot.push(pt(t, g)); }
          var poly = top.concat(bot.reverse());
          M.el("polygon", { points: poly.map(function (p) { return plot.sx(p[0]).toFixed(1) + "," + plot.sy(p[1]).toFixed(1); }).join(" "), style: "fill:" + (sign ? "var(--mm-c)" : "var(--mm-b)") + ";fill-opacity:.35;stroke:none" }, plot.data);
        }
        // a typical rectangle
        var w = (b - a) / 40, s = Math.min(b - w, Math.max(a, a + strip * (b - a))), p1 = pt(s, f), p2 = pt(s, g), p3 = mode === "x" ? [s + w, p2[1]] : [p2[0], s + w], p4 = mode === "x" ? [s + w, p1[1]] : [p1[0], s + w];
        M.el("polygon", { points: [p1, p2, p3, p4].map(function (p) { return plot.sx(p[0]).toFixed(1) + "," + plot.sy(p[1]).toFixed(1); }).join(" "), style: "fill:var(--global-text-color);fill-opacity:.25;stroke:var(--global-text-color);stroke-width:1" }, plot.data);
      }
      [[f, "mm-a"], [g, "mm-curve"]].forEach(function (q) {
        if (mode === "x") plot.fn(q[0], q[1], { n: 1500 });
        else { var pts = []; for (var k = 0; k <= 1500; k++) { var t = lo + ((hi - lo) * k) / 1500; pts.push([q[0](t), t]); } plot.path(pts, q[1]); }
      });
      X.slice(0, 60).forEach(function (z) { var p = pt(z, f); plot.circle(p[0], p[1], 4.5, "mm-eq-u"); });
      if (X.same.length && X.same[0][0] <= lo + 1e-9 * (hi - lo) && X.same[0][1] >= hi - 1e-9 * (hi - lo) - (hi - lo) / 4000) { out.innerHTML = "The two curves coincide, so there is no region between them: the area is 0."; return; }
      if (!(isFinite(a) && isFinite(b) && b > a)) { if (!auto) out.innerHTML = "Give limits with <em>a</em> &lt; <em>b</em>."; return; }
      if (bad) { out.innerHTML = "Between " + v + " = " + num(a, 5) + " and " + v + " = " + num(b, 5) + ", the difference of the two curves " + (bad.kind === "pole" ? "is unbounded" : "is not defined") + " near " + v + " = " + num(bad.x, 5) + ", so the region does not have a finite area that this method can compute."; return; }
      var inner = X.concat(JB).filter(function (z) { return z > a + 1e-9 && z < b - 1e-9; }).sort(function (p, q) { return p - q; }), cuts2 = [a].concat(inner).concat([b]), area = 0, parts = [], ep = 1e-10 * (b - a), netSum = 0;
      for (var j = 0; j < cuts2.length - 1; j++) {
        var I = M.integrate(d, cuts2[j] + ep, cuts2[j + 1] - ep, 4000);
        netSum += I;
        area += Math.abs(I);
        parts.push("∫<sub>" + num(cuts2[j], 4) + "</sub><sup>" + num(cuts2[j + 1], 4) + "</sup> (" + (I >= 0 ? "first − second" : "second − first") + ") d" + v + " = " + num(Math.abs(I)));
      }
      var net = netSum, t = [];
      // the stretches where the curves coincide, within the limits
      var sameAB = X.same.map(function (q) { return [Math.max(q[0], a), Math.min(q[1], b)]; }).filter(function (q) { return q[1] > q[0]; });
      t.push((X.length ? "The curves meet at " + X.slice(0, 12).map(function (z) { var p = pt(z, f); return "(" + num(p[0], 5) + ", " + num(p[1], 5) + ")"; }).join(", ") + (X.length > 12 ? " and " + (X.length - 12) + " more points" : "") + "." : X.same.length ? "" : "The curves do not meet in this window.") +
        (sameAB.length ? " They coincide for " + v + " from " + sameAB.map(function (q) { return num(q[0], 5) + " to " + num(q[1], 5); }).join(" and from ") + ", where they enclose no area." : ""));
      t.push("Limits: " + v + " = " + num(a, 5) + " to " + v + " = " + num(b, 5) + ". " + (inner.length ? (JB.length ? "The region is split where the curves cross and where one of them jumps: " : "The curves cross in between, so the area is split: ") + (parts.length > 6 ? parts.slice(0, 5).join(" + ") + " + … (" + parts.length + " pieces)" : parts.join(" + ")) + "." : "One curve stays " + (mode === "x" ? "on top" : "to the right") + ": " + parts[0] + "."));
      t.push("<b>Area = " + num(area) + "</b>" + (P.exact && P.f === fIn.input.value && P.g === gIn.input.value ? " (textbook: " + P.exact + ")" : "") + "." + (inner.length ? " The net integral ∫(first − second) d" + v + " = " + num(net) + " is not the area, because the parts below cancel the parts above." : ""));
      out.innerHTML = t.map(function (s) { return "<div>" + s + "</div>"; }).join("");
    }
    var top = document.getElementById("ab-top"), inp = document.getElementById("ab-input"), box = document.getElementById("ab-controls");
    M.select(M.group(top, "Example"), Object.keys(presets).map(function (k) { return [k, presets[k].name]; }), key, function (v) { load(v); });
    var modeSel = M.select(M.group(top, "Rectangles"), [["x", "vertical: curves y = f(x)"], ["y", "horizontal: curves x = f(y)"]], mode, function (v) { mode = v; relabel(); reparse(); draw(); });
    var fIn = M.textInput(inp, "first curve:", P.f, function () { reparse(); draw(); }, "9rem");
    var gIn = M.textInput(inp, "second curve:", P.g, function () { reparse(); draw(); }, "9rem");
    var gl = M.group(inp, "");
    var autoBox = M.checkbox(gl, "Between intersection points", auto, function (v) { auto = v; dim(); draw(); });
    var aIn = M.textInput(gl, "from", "0", function (v) { A = val(v, aIn); draw(); }, "3.5rem"), bIn = M.textInput(gl, "to", "1", function (v) { B = val(v, bIn); draw(); }, "3.5rem");
    function val(v, b2) { try { var r = M.expr(v)(0); b2.showError(isFinite(r) ? "" : "not a number"); return r; } catch (e) { b2.showError(e.message); return NaN; } }
    function dim() { [aIn, bIn].forEach(function (q) { q.input.disabled = auto; q.input.style.opacity = auto ? ".45" : ""; }); }
    function relabel() { var v = mode === "x" ? "x" : "y", w = mode === "x" ? "y" : "x"; fIn.input.previousSibling.innerHTML = "first curve: <em>" + w + "</em> ="; gIn.input.previousSibling.innerHTML = "second curve: <em>" + w + "</em> ="; aIn.input.previousSibling.innerHTML = "<em>" + v + "</em> from"; }
    function reparse() {
      var v = mode === "x" ? ["x"] : ["y"];
      try { f = M.expr(fIn.input.value, v); fIn.showError(""); } catch (e) { f = null; fIn.showError(e.message); }
      try { g = M.expr(gIn.input.value, v); gIn.showError(""); } catch (e) { g = null; gIn.showError(e.message); }
    }
    M.slider(M.group(box, "Rectangle"), { label: "position", min: 0, max: 1, step: 0.01, value: strip, digits: 2, onInput: function (v) { strip = v; draw(); } });
    M.zoomControls(box, plot, function () { return P.win; }, draw);
    function load(k) {
      key = k; P = presets[k];
      mode = P.mode; modeSel.value = mode; relabel();
      fIn.set(P.f); gIn.set(P.g); reparse();
      auto = P.auto; autoBox.checked = auto; dim();
      if (P.a) { aIn.set(P.a); A = val(P.a, aIn); bIn.set(P.b); B = val(P.b, bIn); }
      M.setWindow(plot, P.win); draw();
    }
    M.onResize(draw);
    load(key);
  })();
</script>
