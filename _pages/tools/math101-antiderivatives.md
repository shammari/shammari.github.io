---
layout: page
title: Antiderivatives
description: An interactive tool for MATH 101, week 12. See the family of antiderivatives F(x) + C of a function as curves with the slopes it prescribes, and pick out the one that satisfies an initial condition.
permalink: /teaching/math101/tools/antiderivatives/
---

[← MATH 101]({{ '/teaching/math101/' | relative_url }})

A function $$F$$ is an **antiderivative** of $$f$$ on an interval if $$F'(x) = f(x)$$ for all $$x$$ in the interval. If $$F$$ is one antiderivative, then the most general antiderivative on the interval is $$F(x) + C$$, where $$C$$ is an arbitrary constant: the graphs are vertical translations of one another, all with the same slope $$f(x)$$ above each $$x$$. An **initial condition** $$F(x_0) = y_0$$ picks out one member of the family. This tool draws the slopes prescribed by $$f$$, the family of antiderivatives and the one through a point you choose. It supports learning outcomes 10 and 11.

<div class="mm-wrap" id="ad">
  <div class="mm-controls" id="ad-top"></div>
  <div class="mm-controls" id="ad-input"></div>
  <div class="mm-panels mm-side">
    <svg id="ad-f" role="img" aria-label="Graph of f"></svg>
    <svg id="ad-F" role="img" aria-label="The family of antiderivatives and the one through the chosen point"></svg>
  </div>
  <div class="mm-controls" id="ad-controls"></div>
  <p class="mm-help">The small panel is the graph of <em>f</em>. In the large panel, the short line segments have slope <em>f</em>(<em>x</em>), the faint curves are members of the family <em>F</em>(<em>x</em>) + <em>C</em>, and the bold curve passes through the point you choose. Drag the point, or type the initial condition.</p>
  <div class="mm-readout" id="ad-out"></div>
</div>

## Things to try

1. For $$f(x) = \sin x$$, the antiderivatives are $$-\cos x + C$$. Drag the point and watch the bold curve move up and down. Why does every curve have a horizontal tangent at the same values of $$x$$?
2. For $$f(x) = 1/x$$, the family has two separate parts, one for $$x > 0$$ and one for $$x < 0$$, each with its own constant. Why is $$\ln\lvert x\rvert + C$$ not quite the most general antiderivative?
3. The textbook finds the function with $$f'(x) = e^x + \dfrac{20}{1 + x^2}$$ and $$f(0) = -2$$: it is $$e^x + 20\tan^{-1}x - 3$$. Compare the bold curve with that formula.
4. A ball is thrown upward at 48 ft/s from the edge of a cliff 432 ft above the ground, so its velocity is $$v(t) = 48 - 32t$$. With $$s(0) = 432$$, find the maximum height and when the ball hits the ground. Compare with the textbook's answer, about 6.9 s.
5. Sketch an antiderivative of $$f(x) = x^2 - 1$$ before revealing the family. Where does it have a local maximum or minimum, and why there?

## How it is computed

The antiderivative through $$(x_0, y_0)$$ is $$F(x) = y_0 + \int_{x_0}^{x} f(t)\,dt$$, computed by Simpson's rule on a fine grid going out from $$x_0$$ in both directions, and stopped where $$f$$ is undefined or blows up, since an antiderivative is only defined on an interval where $$f$$ is. The other members of the family are vertical translations of it, $$F(x) + C$$; on each other interval of the domain the family is drawn from its own starting point. The textbook's formulas are shown for comparison only.

<p class="mm-note">The tool runs entirely in your browser; nothing is recorded or sent anywhere. It is a learning aid and is not assessed.</p>

<script src="{{ '/assets/js/teaching/mm-tools.js' | relative_url }}"></script>
<script>
  (function () {
    var M = window.MMTools;
    var presets = {
      sin: { name: "f(x) = sin x", f: "sin x", F: "-cos x", p: [0, -1], win: [-7, 7, -4, 4], fwin: [-7, 7, -1.5, 1.5] },
      recip: { name: "f(x) = 1/x", f: "1/x", F: "ln(abs(x))", p: [1, 0], win: [-5, 5, -4, 4], fwin: [-5, 5, -5, 5] },
      sq: { name: "f(x) = x² − 1", f: "x^2 - 1", F: "x^3/3 - x", p: [0, 0], win: [-3, 3, -4, 4], fwin: [-3, 3, -2, 8] },
      ex3: { name: "f′(x) = e^x + 20/(1 + x²), f(0) = −2", f: "e^x + 20/(1 + x^2)", F: "e^x + 20atan(x) - 3", p: [0, -2], win: [-6, 3, -40, 40], fwin: [-6, 3, -1, 25] },
      ball: { name: "v(t) = 48 − 32t, s(0) = 432", f: "48 - 32x", F: "-16x^2 + 48x + 432", p: [0, 432], win: [-0.5, 8, -100, 550], fwin: [-0.5, 8, -220, 60], var: "t" },
    };
    var key = "sin", P = presets[key], f = null, Fb = null, x0 = 0, y0 = -1, xp = 1, showFam = true;
    var fp = new M.Plot(document.getElementById("ad-f"), { x0: 0, x1: 1, y0: 0, y1: 1, gx: 1, gy: 1, xname: "x", yname: "y = f(x)", aspect: 1.36, aspectNarrow: 0.55, left: 30 });
    var Fp = new M.Plot(document.getElementById("ad-F"), { x0: 0, x1: 1, y0: 0, y1: 1, gx: 1, gy: 1, xname: "x", yname: "y = F(x)", aspect: 0.68, aspectNarrow: 0.8, left: 34 });
    function num(v, d) { if (!isFinite(v)) return "undefined"; if (Math.abs(v) < 1e-9) return "0"; return String(+v.toPrecision(d || 5)).replace(/-/g, "−"); }
    // a single missing point where f has the same value on both sides (sin x/x at 0) does not stop an antiderivative
    function hole(x) { var e = 1e-7 * Math.max(1, Math.abs(x)), l = f(x - e), r = f(x + e); return isFinite(l) && isFinite(r) && Math.abs(l - r) < 1e-4 * (1 + Math.abs(l)); }
    function fh(x) { var y = f(x); if (isFinite(y)) return y; var e = 1e-9 * Math.max(1, Math.abs(x)); return hole(x) ? (f(x - e) + f(x + e)) / 2 : NaN; }
    function breaks(lo, hi) { return M.breaks(f, lo, hi).filter(function (q) { return q.kind === "jump" || !hole(q.x); }).map(function (q) { return q.x; }); }
    // F on a grid, integrating out from (a, ya) to the nearest break on each side
    function integral(a, ya, lo, hi, brk) {
      var N = 1200, h = (hi - lo) / N, pts = [[a, ya]];
      var L = lo, R = hi;
      brk.forEach(function (q) { if (q < a && q > L) L = q; if (q > a && q < R) R = q; });
      if (L > lo) L += (hi - lo) * 1e-4;
      if (R < hi) R -= (hi - lo) * 1e-4;
      [1, -1].forEach(function (s) {
        var x = a, y = ya, lim = s > 0 ? R : L, out = [];
        while ((s > 0 && x < lim) || (s < 0 && x > lim)) {
          var st = s * Math.min(h, Math.abs(lim - x)), m = fh(x + st / 2), e = fh(x + st), b0 = fh(x);
          if (![m, e, b0].every(isFinite)) break;
          y += (st / 6) * (b0 + 4 * m + e); x += st;
          out.push([x, y]);
        }
        if (s > 0) pts = pts.concat(out); else pts = out.reverse().concat(pts);
      });
      return pts;
    }
    function value(pts, x) { for (var i = 1; i < pts.length; i++) if ((pts[i - 1][0] - x) * (pts[i][0] - x) <= 0) { var t = (x - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0] || 1); return pts[i - 1][1] + t * (pts[i][1] - pts[i - 1][1]); } return NaN; }
    function draw() {
      fp.frame(); Fp.frame();
      var out = document.getElementById("ad-out");
      if (!f) { out.innerHTML = "Enter a formula for <em>f</em>."; return; }
      var o = Fp.o, H = o.y1 - o.y0, W = o.x1 - o.x0, K = Fp.K;
      fp.path([[fp.o.x0, 0], [fp.o.x1, 0]], "mm-zero");
      fp.fn(f, "mm-a", { n: 1200 });
      var v = fp.path([[xp, fp.o.y0], [xp, fp.o.y1]], "mm-zero"); v.style.strokeDasharray = "3 3";
      if (isFinite(f(xp))) fp.circle(xp, f(xp), 4.5, "mm-dot").style.fill = "var(--mm-b)";
      // slope field of y′ = f(x)
      for (var i = 0; i <= 24; i++) for (var j = 0; j <= 14; j++) {
        var x = o.x0 + ((i + 0.5) * W) / 25, y = o.y0 + ((j + 0.5) * H) / 15, s = f(x);
        if (!isFinite(s)) continue;
        var dx = Fp.sx(x + 1) - Fp.sx(x), dy = Fp.sy(y + s) - Fp.sy(y), n = Math.sqrt(dx * dx + dy * dy), L = 6 * K;
        M.el("line", { x1: Fp.sx(x) - (dx / n) * L, y1: Fp.sy(y) - (dy / n) * L, x2: Fp.sx(x) + (dx / n) * L, y2: Fp.sy(y) + (dy / n) * L, class: "mm-field" }, Fp.data);
      }
      // the initial point must lie in an interval where f is defined (a single missing point, as for sin x/x at 0, is fine)
      if (!isFinite(f(x0)) && !hole(x0)) {
        document.getElementById("ad-out").innerHTML = "<em>f</em> is not defined near <em>x</em> = " + num(x0) + ", so no antiderivative can start there: an antiderivative lives on an interval where <em>f</em> is defined. Choose <em>x</em><sub>0</sub> inside such an interval.";
        return;
      }
      var lo = o.x0 - 0.05 * W, hi = o.x1 + 0.05 * W, brk = breaks(lo, hi), main = integral(x0, y0, lo, hi, brk);
      // the family: translations of the main curve, plus curves on the other intervals of the domain, between breaks
      var pieces = [main], cuts = [lo].concat(brk).concat([hi]);
      for (var q = 0; q < cuts.length - 1; q++) {
        var u = cuts[q], w2 = cuts[q + 1], mid = (u + w2) / 2;
        if (x0 > u && x0 < w2) continue;
        if (w2 - u > W * 0.02 && isFinite(f(mid))) pieces.push(integral(mid, 0, lo, hi, brk));
      }
      if (showFam) pieces.forEach(function (pc, idx) {
        var ref = idx === 0 ? y0 : 0, ys = pc.map(function (q) { return q[1]; }), mid = ys[Math.floor(ys.length / 2)];
        for (var c = -8; c <= 8; c++) {
          if (idx === 0 && c === 0) continue;
          var shift = (c * H) / 8 + (idx === 0 ? 0 : (o.y0 + o.y1) / 2 - mid);
          var l = Fp.path(pc.map(function (q) { return [q[0], q[1] + shift]; }), "mm-a"); l.style.opacity = ".22"; l.style.strokeWidth = "1.4";
        }
      });
      var bp = Fp.path(main, "mm-a"); bp.style.strokeWidth = "3";
      if (Fb && P.f === fIn.input.value) { var tp = Fp.fn(Fb, "mm-b", { n: 800 }); tp.style.strokeDasharray = "6 5"; tp.style.strokeWidth = "1.6"; }
      var hp = Fp.circle(x0, y0, 6, "mm-handle"); hp.setAttribute("stroke", "var(--mm-b)");
      var Fx = value(main, xp), sl = f(xp);
      if (isFinite(Fx) && isFinite(sl)) { var w = W * 0.12, tl = Fp.path([[xp - w, Fx - sl * w], [xp + w, Fx + sl * w]], "mm-b"); tl.style.strokeWidth = "1.8"; Fp.circle(xp, Fx, 4.5, "mm-dot"); }
      var V = P.var && P.f === fIn.input.value ? P.var : "x", t = [];
      t.push("The bold curve is the antiderivative with <em>F</em>(" + num(x0) + ") = " + num(y0) + ".");
      t.push(isFinite(Fx) ? "At <em>" + V + "</em> = " + num(xp) + ": <em>F</em>(" + num(xp) + ") ≈ <b>" + num(Fx) + "</b>, and the slope of the curve there is <em>F</em>′(" + num(xp) + ") = <em>f</em>(" + num(xp) + ") = " + num(sl) + "." : "At <em>" + V + "</em> = " + num(xp) + " the bold curve is not defined: this antiderivative lives on an interval where <em>f</em> is defined.");
      if (Fb && P.f === fIn.input.value) {
        var C = y0 - Fb(x0);
        t.push("The textbook's antiderivative (dashed) is " + P.Ftxt + (Math.abs(C) > 1e-6 ? ", which needs <em>C</em> = " + num(C) + " to pass through the point" : ", which passes through the point") + ".");
      }
      if (key === "ball" && P.f === fIn.input.value) {
        var tmax = 1.5, tg = (3 * (1 + Math.sqrt(13))) / 2;
        t.push("<em>s</em>(<em>t</em>) is largest when <em>v</em>(<em>t</em>) = 0, at <em>t</em> = 1.5 s, where <em>s</em> = " + num(value(main, tmax)) + " ft (the bold curve gives this; −16<em>t</em><sup>2</sup> + 48<em>t</em> + 432 = 468). It reaches the ground, <em>s</em> = 0, at <em>t</em> = 3(1 + √13)/2 ≈ " + num(tg, 3) + " s.");
      }
      out.innerHTML = t.map(function (s) { return "<div>" + s + "</div>"; }).join("");
    }
    var top = document.getElementById("ad-top"), inp = document.getElementById("ad-input"), box = document.getElementById("ad-controls");
    M.select(M.group(top, "Example"), Object.keys(presets).map(function (k) { return [k, presets[k].name]; }), key, function (v) { load(v); });
    var fIn = M.textInput(inp, "<em>f</em>(<em>x</em>) =", P.f, function (v) { try { f = M.expr(v); fIn.showError(""); } catch (e) { f = null; fIn.showError(e.message); } draw(); });
    var gi = M.group(inp, "Initial condition");
    var x0In = M.textInput(gi, "<em>F</em>(", "0", function (v) { var r = val(v, x0In); if (isFinite(r)) x0 = r; draw(); }, "3.5rem");
    var y0In = M.textInput(gi, ") =", "-1", function (v) { var r = val(v, y0In); if (isFinite(r)) y0 = r; draw(); }, "4rem");
    function val(v, b) { try { var r = M.expr(v)(0); b.showError(isFinite(r) ? "" : "not a number"); return r; } catch (e) { b.showError(e.message); return NaN; } }
    var g1 = M.group(box, "Probe");
    var xS = M.slider(g1, { label: "<em>x</em>", min: -7, max: 7, step: 0.01, value: xp, digits: 2, onInput: function (v) { xp = v; draw(); } });
    M.checkbox(M.group(box, "Show"), "Family <em>F</em>(<em>x</em>) + <em>C</em>", showFam, function (v) { showFam = v; draw(); });
    M.zoomControls(box, [Fp, fp], function () { return [P.win, P.fwin]; }, draw);
    function load(k) {
      key = k; P = presets[k];
      fIn.set(P.f); f = M.expr(P.f); fIn.showError("");
      Fb = P.F ? M.expr(P.F) : null; P.Ftxt = { sin: "−cos <em>x</em> + <em>C</em>", recip: "ln|<em>x</em>| + <em>C</em>", sq: "⅓<em>x</em><sup>3</sup> − <em>x</em> + <em>C</em>", ex3: "<em>e</em><sup><em>x</em></sup> + 20 tan<sup>−1</sup><em>x</em> − 3", ball: "−16<em>t</em><sup>2</sup> + 48<em>t</em> + 432" }[k];
      x0 = P.p[0]; y0 = P.p[1]; x0In.set(String(x0)); y0In.set(String(y0));
      M.setWindow(Fp, P.win); M.setWindow(fp, P.fwin);
      xS.input.min = P.win[0]; xS.input.max = P.win[1]; xS.input.step = (P.win[1] - P.win[0]) / 1000; xp = P.win[0] + 0.7 * (P.win[1] - P.win[0]); xS.set(xp);
      var vn = P.var || "x"; xS.el.querySelector("span").innerHTML = "<em>" + vn + "</em>";
      Fp.o.xname = fp.o.xname = vn;
      draw();
    }
    // drag the point
    var svg = Fp.svg, dragging = false;
    svg.addEventListener("pointerdown", function (evt) { var p = Fp.at(evt); if (Fp.inside(p.x, p.y) && f && isFinite(f(p.x))) { dragging = true; svg.setPointerCapture(evt.pointerId); evt.preventDefault(); move(p); } });
    svg.addEventListener("pointermove", function (evt) { if (dragging) move(Fp.at(evt)); });
    function move(p) { if (!isFinite(f(p.x))) return; var st = M.niceStep(Fp.o.x1 - Fp.o.x0, 100), sy = M.niceStep(Fp.o.y1 - Fp.o.y0, 100); x0 = Math.round(p.x / st) * st; y0 = Math.round(p.y / sy) * sy; x0In.set(num(x0)); y0In.set(num(y0)); draw(); }
    svg.addEventListener("pointerup", function () { dragging = false; });
    svg.addEventListener("pointercancel", function () { dragging = false; });
    M.onResize(draw);
    load(key);
  })();
</script>
