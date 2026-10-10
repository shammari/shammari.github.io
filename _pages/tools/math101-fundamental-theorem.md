---
layout: page
title: The Fundamental Theorem of Calculus
description: An interactive tool for MATH 101, week 13. Build the area function g(x) = ∫ f(t) dt from a to x, see that its derivative is f, evaluate definite integrals with antiderivatives, and compare net change with total distance.
permalink: /teaching/math101/tools/fundamental-theorem/
---

[← MATH 101]({{ '/teaching/math101/' | relative_url }})

For a continuous function $$f$$ on $$[a, b]$$, the **area function**

$$g(x) = \int_a^x f(t)\,dt$$

measures the net area under the graph of $$f$$ from $$a$$ to $$x$$. The **Fundamental Theorem of Calculus** links it to derivatives.

- **Part 1:** $$g$$ is continuous on $$[a, b]$$, differentiable on $$(a, b)$$, and $$g'(x) = f(x)$$.
- **Part 2:** $$\displaystyle\int_a^b f(x)\,dx = F(b) - F(a)$$, where $$F$$ is any antiderivative of $$f$$.

This tool shades the area under $$f$$ as you move $$x$$ and traces the graph of $$g$$ below, with its tangent line, whose slope is $$f(x)$$. It also reports the net change and the total area, as in the Net Change Theorem. It supports learning outcome 11.

<div class="mm-wrap" id="ft">
  <div class="mm-controls" id="ft-top"></div>
  <div class="mm-controls" id="ft-input"></div>
  <div class="mm-panels mm-2">
    <svg id="ft-f" role="img" aria-label="Graph of f with the area from a to x shaded"></svg>
    <svg id="ft-g" role="img" aria-label="Graph of the area function g"></svg>
  </div>
  <div class="mm-controls" id="ft-controls"></div>
  <p class="mm-help">Drag the upper limit <em>x</em> on either graph or use the slider. Area above the axis is shaded green and counts as positive; area below is orange and counts as negative. Untick <b>graph of g</b> to sketch it yourself first.</p>
  <div class="mm-readout" id="ft-out"></div>
</div>

## Things to try

1. For $$f(t) = t$$ with $$a = 0$$, the area under the line is a triangle. Check that $$g(x) = x^2/2$$ and that the slope of $$g$$ at each $$x$$ equals $$f(x)$$.
2. For $$f(t) = \cos t$$, where does $$g$$ have its maximum? Why there, in terms of the shaded area? Which familiar function is $$g$$?
3. For $$\sqrt{1 + t^2}$$ there is no simple formula for $$g$$, but Part 1 still gives $$g'(x) = \sqrt{1 + x^2}$$. Check it on the graph. Do the same for the Fresnel function $$S(x) = \int_0^x \sin(\pi t^2/2)\,dt$$.
4. A particle moves with velocity $$v(t) = t^2 - t - 6$$ m/s for $$1 \le t \le 4$$. Find its displacement and the total distance it travels, and compare with the textbook's $$-\tfrac{9}{2}$$ m and $$\tfrac{61}{6}$$ m. Why are they different?
5. For $$1/t^2$$ from $$-1$$, the naive calculation $$\left[-1/t\right]_{-1}^{3} = -\tfrac{4}{3}$$ is wrong. What does the tool show as $$x$$ approaches 0, and which hypothesis of the theorem fails?

## How it is computed

$$g(x)$$ is computed by Simpson's rule on a fine grid from $$a$$, stopping where $$f$$ is undefined or blows up, since the theorem needs $$f$$ to be continuous. The total area is the integral of $$\lvert f\rvert $$, computed the same way. The slope of the tangent line drawn on the graph of $$g$$ is $$f(x)$$; the tool also checks it against the central difference of the values of $$g$$. When the textbook gives an antiderivative $$F$$, the readout compares $$F(x) - F(a)$$ with $$g(x)$$.

<p class="mm-note">The tool runs entirely in your browser; nothing is recorded or sent anywhere. It is a learning aid and is not assessed.</p>

<script src="{{ '/assets/js/teaching/mm-tools.js' | relative_url }}"></script>
<script>
  (function () {
    var M = window.MMTools;
    var presets = {
      lin: { name: "f(t) = t, from 0", f: "t", a: "0", x: 2, F: "t^2/2", Ft: "<em>t</em><sup>2</sup>/2", win: [-3, 3, -3, 3], gwin: [-3, 3, -1, 5] },
      cos: { name: "f(t) = cos t, from 0", f: "cos t", a: "0", x: 1, F: "sin t", Ft: "sin <em>t</em>", win: [-1, 7, -1.5, 1.5], gwin: [-1, 7, -1.5, 1.5] },
      root: { name: "f(t) = √(1 + t²), from 0", f: "sqrt(1 + t^2)", a: "0", x: 1, win: [-3, 3, -0.5, 3.5], gwin: [-3, 3, -5, 5] },
      fres: { name: "Fresnel: sin(πt²/2), from 0", f: "sin(pi t^2/2)", a: "0", x: 1, win: [-0.2, 4, -1.2, 1.2], gwin: [-0.2, 4, -0.2, 1] },
      sq: { name: "f(t) = t², from 0 to 1", f: "t^2", a: "0", x: 1, F: "t^3/3", Ft: "<em>t</em><sup>3</sup>/3", win: [-0.5, 1.5, -0.3, 2.3], gwin: [-0.5, 1.5, -0.2, 1.2] },
      vel: { name: "v(t) = t² − t − 6, from 1 to 4", f: "t^2 - t - 6", a: "1", x: 4, F: "t^3/3 - t^2/2 - 6t", Ft: "⅓<em>t</em><sup>3</sup> − ½<em>t</em><sup>2</sup> − 6<em>t</em>", win: [0.5, 4.5, -7, 7], gwin: [0.5, 4.5, -10, 2] },
      bad: { name: "f(t) = 1/t², from −1", f: "1/t^2", a: "-1", x: -0.5, win: [-1.5, 3.5, -1, 10], gwin: [-1.5, 3.5, -2, 10] },
    };
    var key = "lin", P = presets[key], f = null, Fb = null, A = 0, X = 2, showG = true;
    var fp = new M.Plot(document.getElementById("ft-f"), { x0: 0, x1: 1, y0: 0, y1: 1, gx: 1, gy: 1, xname: "t", yname: "y = f(t)", aspect: 0.8, aspectNarrow: 0.7, left: 30 });
    var gp = new M.Plot(document.getElementById("ft-g"), { x0: 0, x1: 1, y0: 0, y1: 1, gx: 1, gy: 1, xname: "x", yname: "y = g(x)", aspect: 0.8, aspectNarrow: 0.7, left: 30 });
    function num(v, d) { if (!isFinite(v)) return "undefined"; if (Math.abs(v) < 1e-9) return "0"; return String(+v.toPrecision(d || 6)).replace(/-/g, "−"); }
    // g on a grid from a, both ways: across jumps (split exactly at them), stopping at poles and ends of the domain
    function area(h, lo, hi, brk) {
      var L = lo, R = hi, jumps = [];
      brk.forEach(function (q) {
        if (q.kind === "jump") { jumps.push(q.x); return; }
        if (q.x < A && q.x > L) L = q.x;
        if (q.x > A && q.x < R) R = q.x;
      });
      var e = (hi - lo) * 1e-9, pts = [[A, 0]];
      [1, -1].forEach(function (s) {
        var lim = s > 0 ? R - e : L + e, nodes = [A].concat(jumps.filter(function (j) { return s > 0 ? j > A && j < lim : j < A && j > lim; }).sort(function (p, q) { return s * (p - q); })).concat([lim]);
        var y = 0, out = [];
        for (var k = 0; k < nodes.length - 1; k++) {
          var a0 = nodes[k] + (k > 0 ? s * e : 0), b0 = nodes[k + 1] - (k < nodes.length - 2 ? s * e : 0), N = Math.max(4, Math.ceil((Math.abs(b0 - a0) / (hi - lo)) * 2000)), st = (b0 - a0) / N, ok = true;
          for (var j = 0; j < N; j++) {
            var x = a0 + j * st, f0 = h(x), fm = h(x + st / 2), f1 = h(x + st);
            if (![f0, fm, f1].every(isFinite)) { ok = false; break; }
            y += (st / 6) * (f0 + 4 * fm + f1); out.push([x + st, y]);
          }
          if (!ok) break;
        }
        if (s > 0) pts = pts.concat(out); else pts = out.reverse().concat(pts);
      });
      return pts;
    }
    function at(pts, x) { for (var i = 1; i < pts.length; i++) if ((pts[i - 1][0] - x) * (pts[i][0] - x) <= 0) { var t = (x - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0] || 1); return pts[i - 1][1] + t * (pts[i][1] - pts[i - 1][1]); } return NaN; }
    var lastG = NaN;
    function draw() {
      fp.frame(); gp.frame();
      var out = document.getElementById("ft-out");
      if (!f || !isFinite(A)) { out.innerHTML = "Enter a formula and a number <em>a</em>."; return; }
      var o = fp.o, lo = Math.min(o.x0, gp.o.x0), hi = Math.max(o.x1, gp.o.x1), brk = M.breaks(f, lo - 0.01 * (hi - lo), hi + 0.01 * (hi - lo)), G = area(f, lo, hi, brk), T = area(function (t) { return Math.abs(f(t)); }, lo, hi, brk);
      var g = at(G, X), tot = Math.abs(at(T, X)), reach = isFinite(g);
      lastG = g;
      // for the readout, integrate from a to x directly, split at the jumps and stopping just short of each one
      if (reach && X !== A) {
        var s0 = X > A ? 1 : -1, cuts = [A].concat(brk.filter(function (q) { return q.kind === "jump" && (q.x - A) * s0 > 0 && (X - q.x) * s0 > 0; }).map(function (q) { return q.x; }).sort(function (p, q) { return s0 * (p - q); })).concat([X]);
        var ep = 1e-10 * Math.max(1, Math.abs(X - A)), gi = 0, ti = 0;
        for (var c = 0; c < cuts.length - 1; c++) {
          var u = cuts[c] + s0 * ep, v = cuts[c + 1] - s0 * ep;
          gi += M.integrate(f, u, v, 4000); ti += M.integrate(function (t) { return Math.abs(f(t)); }, u, v, 4000);
        }
        if (isFinite(gi)) { g = gi; tot = Math.abs(ti); }
      }
      // shaded area between a and x (only where g is defined)
      if (reach) {
        var l = Math.min(A, X), r = Math.max(A, X), N = 300, pos = [], neg = [];
        for (var i = 0; i <= N; i++) { var t = l + ((r - l) * i) / N, y = f(t); y = isFinite(y) ? Math.max(o.y0 - 10 * (o.y1 - o.y0), Math.min(o.y1 + 10 * (o.y1 - o.y0), y)) : 0; pos.push([t, Math.max(0, y)]); neg.push([t, Math.min(0, y)]); }
        [[pos, "var(--mm-c)"], [neg, "var(--mm-b)"]].forEach(function (q) {
          var pts = [[l, 0]].concat(q[0]).concat([[r, 0]]);
          M.el("polygon", { points: pts.map(function (p) { return fp.sx(p[0]).toFixed(1) + "," + fp.sy(p[1]).toFixed(1); }).join(" "), style: "fill:" + q[1] + ";fill-opacity:.35;stroke:none" }, fp.data);
        });
      }
      fp.path([[o.x0, 0], [o.x1, 0]], "mm-zero");
      fp.fn(f, "mm-a", { n: 1500 });
      [A, X].forEach(function (t, j) { var v = fp.path([[t, o.y0], [t, o.y1]], j ? "mm-b" : "mm-zero"); v.style.strokeDasharray = "4 3"; });
      fp.text(A, o.y1, "a", { "text-anchor": "middle", dy: 13 * fp.K }); fp.text(X, o.y1, "x", { "text-anchor": "middle", dy: 13 * fp.K });
      gp.path([[gp.o.x0, 0], [gp.o.x1, 0]], "mm-zero");
      if (showG) gp.path(G, "mm-a");
      var fx = f(X);
      if (reach) {
        if (isFinite(fx)) { var w = (gp.o.x1 - gp.o.x0) * 0.15, tl = gp.path([[X - w, g - fx * w], [X + w, g + fx * w]], "mm-b"); tl.style.strokeWidth = "1.8"; }
        gp.circle(X, g, 5, "mm-dot").style.fill = "var(--mm-b)";
      }
      var t2 = [];
      if (!reach) t2.push("<em>g</em>(" + num(X, 4) + ") is not defined: between <em>a</em> = " + num(A, 4) + " and <em>x</em> = " + num(X, 4) + " the function <em>f</em> is undefined or unbounded, so the integral does not exist as an ordinary definite integral and the Fundamental Theorem does not apply.");
      else {
        // slope of g from its own change: [g(x + h) − g(x − h)]/(2h), where g(x + h) − g(x − h) is the integral of f over [x − h, x + h]
        var h = (gp.o.x1 - gp.o.x0) * 1e-4, sl = M.integrate(f, X - h, X + h, 20) / (2 * h);
        t2.push("<em>g</em>(" + num(X, 4) + ") = ∫<sub>" + num(A, 4) + "</sub><sup>" + num(X, 4) + "</sup> <em>f</em>(<em>t</em>) d<em>t</em> ≈ <b>" + num(g) + "</b> (the net area: green minus orange).");
        var tolj = 1e-6 * Math.max(1, Math.abs(A), Math.abs(X)), jmp = brk.filter(function (q) { return q.kind === "jump" && q.x > Math.min(A, X) + tolj && q.x < Math.max(A, X) - tolj; });
        var ej = 1e-7 * Math.max(1, Math.abs(X)), fL = f(X - ej), fR = f(X + ej);
        if (isFinite(fL) && isFinite(fR) && Math.abs(fL - fR) > 1e-4 * (1 + Math.abs(fL) + Math.abs(fR))) t2.push("Part 1 needs <em>f</em> to be continuous at <em>x</em>, but <em>f</em> jumps at <em>x</em> = " + num(X, 4) + ": the graph of <em>g</em> has a corner there, with slope " + num(fL, 5) + " from the left and " + num(fR, 5) + " from the right, so <em>g</em>′(" + num(X, 4) + ") does not exist.");
        else t2.push("Part 1: <em>g</em>′(" + num(X, 4) + ") = <em>f</em>(" + num(X, 4) + ") = <b>" + num(fx) + "</b>; the slope of the graph of <em>g</em> there, from its own values, is " + num(sl, 5) + "." + (jmp.length ? " (<em>f</em> jumps at <em>t</em> = " + jmp.map(function (q) { return num(q.x, 4); }).join(", ") + ", so it is not continuous on the whole interval: <em>g</em> still exists, but has a corner there.)" : ""));
        if (Fb && P.f === fIn.input.value && P.a === aIn.input.value) t2.push("Part 2: with the antiderivative <em>F</em>(<em>t</em>) = " + P.Ft + ", <em>F</em>(" + num(X, 4) + ") − <em>F</em>(" + num(A, 4) + ") = " + num(Fb(X) - Fb(A)) + ".");
        t2.push("The total area between the graph and the axis, ∫|<em>f</em>(<em>t</em>)| d<em>t</em>, is " + num(tot) + (key === "vel" && P.f === fIn.input.value ? ": the distance travelled, while <em>g</em> is the displacement" : "") + ".");
      }
      out.innerHTML = t2.map(function (s) { return "<div>" + s + "</div>"; }).join("");
    }
    var top = document.getElementById("ft-top"), inp = document.getElementById("ft-input"), box = document.getElementById("ft-controls");
    M.select(M.group(top, "Example"), Object.keys(presets).map(function (k) { return [k, presets[k].name]; }), key, function (v) { load(v); });
    var fIn = M.textInput(inp, "<em>f</em>(<em>t</em>) =", P.f, function (v) { try { f = M.expr(v, ["t"]); fIn.showError(""); } catch (e) { f = null; fIn.showError(e.message); } draw(); });
    var aIn = M.textInput(inp, "<em>a</em> =", P.a, function (v) { try { var r = M.expr(v)(0); aIn.showError(isFinite(r) ? "" : "not a number"); A = r; } catch (e) { aIn.showError(e.message); A = NaN; } draw(); }, "4rem");
    var g1 = M.group(box, "Upper limit");
    var xS = M.slider(g1, { label: "<em>x</em>", min: -3, max: 3, step: 0.001, value: X, digits: 3, onInput: function (v) { X = v; draw(); } });
    M.checkbox(M.group(box, "Show"), "Graph of <em>g</em>", showG, function (v) { showG = v; draw(); });
    M.zoomControls(box, [fp, gp], function () { return [P.win, P.gwin]; }, function () { rangeX(fp.o.x0, fp.o.x1); draw(); }, { focus: function () { return f ? [[X, f(X)], [X, lastG]] : null; }, linkX: true });
    // a round step, and a slider that starts at a multiple of it, so that whole numbers can be reached
    function rangeX(l, r) { var st = M.niceStep(r - l, 1000); xS.input.step = st; xS.input.min = Math.ceil(l / st - 1e-9) * st; xS.input.max = Math.floor(r / st + 1e-9) * st; }
    function load(k) {
      key = k; P = presets[k];
      fIn.set(P.f); f = M.expr(P.f, ["t"]); fIn.showError(""); aIn.set(P.a); A = M.expr(P.a)(0);
      Fb = P.F ? M.expr(P.F, ["t"]) : null;
      M.setWindow(fp, P.win); M.setWindow(gp, P.gwin);
      rangeX(P.win[0], P.win[1]); X = P.x; xS.set(X);
      draw();
    }
    [fp, gp].forEach(function (pl) {
      var svg = pl.svg, dragging = false;
      svg.addEventListener("pointerdown", function (evt) { var p = pl.at(evt); if (pl.inside(p.x, p.y)) { dragging = true; svg.setPointerCapture(evt.pointerId); evt.preventDefault(); X = p.x; xS.set(X); draw(); } });
      svg.addEventListener("pointermove", function (evt) { if (!dragging) return; var p = pl.at(evt), st = M.niceStep(pl.o.x1 - pl.o.x0, 400); X = Math.round(Math.min(pl.o.x1, Math.max(pl.o.x0, p.x)) / st) * st; xS.set(X); draw(); });
      svg.addEventListener("pointerup", function () { dragging = false; });
      svg.addEventListener("pointercancel", function () { dragging = false; });
    });
    M.onResize(draw);
    load(key);
  })();
</script>
