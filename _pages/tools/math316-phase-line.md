---
layout: page
title: Phase lines and solution curves
description: An interactive tool for MATH 316, week 12. Explore autonomous differential equations dy/dt = f(y) through the phase line, the stability of equilibria and solution curves.
permalink: /teaching/math316/tools/phase-line/
---

[← MATH 316]({{ '/teaching/math316/' | relative_url }})

For an autonomous differential equation $$dy/dt = f(y)$$, the graph of $$f$$ tells us everything about how solutions behave: where $$f > 0$$ the solution rises, where $$f < 0$$ it falls, and where $$f = 0$$ it stays put. This tool puts the graph of $$f$$, the phase line and the solution curves side by side, so you can sketch one from the other and then check. It supports learning outcomes 9 and 11.

<div class="mm-wrap" id="pl">
  <div class="mm-controls" id="pl-model"></div>
  <p class="mm-eqn" id="pl-eqn"></p>
  <div class="mm-panels mm-2">
    <svg id="pl-f" role="img" aria-label="Graph of f against the dependent variable, with the phase line"></svg>
    <svg id="pl-sol" role="img" aria-label="Solution curves against time, with equilibrium solutions and slope field"></svg>
  </div>
  <div class="mm-controls" id="pl-controls"></div>
  <p class="mm-help">The first panel is the graph of <em>f</em> against the dependent variable, with the phase line along its horizontal axis: arrows point right where <em>f</em> &gt; 0, so solutions increase, and left where <em>f</em> &lt; 0. Filled dots are stable equilibria, open dots unstable ones and grey dots semi-stable. Click the panel of solution curves to draw the solution through that point, and drag to move it. Untick the boxes under <b>Show</b> to sketch first, then reveal. Tick <b>Concavity</b> to see where solution curves are concave up or down, with a sign chart below.</p>
  <p class="mm-readout" id="pl-out"></p>
  <div id="pl-conc" hidden>
    <h3 style="font-size:1.05rem;margin:1.2rem 0 .3rem">Sign chart</h3>
    <div class="mm-scroll"><table class="mm-table" id="pl-signs"></table></div>
    <p class="mm-help">The intervals are cut at the equilibria and where <em>f</em>′ = 0. Since <em>y</em>″ = <em>f</em>′(<em>y</em>) <em>f</em>(<em>y</em>), the sign of <em>y</em>″ is the product of the signs in the two rows above it. On the solution curves, bands where curves are concave up are shaded in colour and bands where they are concave down in grey; on the graph of <em>f</em>, a ring marks each point where <em>f</em>′ = 0.</p>
  </div>
</div>

## Things to try

1. Start with the **textbook example**, $$dy/dt = (y + 1)(y - 2)$$. Hide everything, draw the phase line and make your own sign chart for $$f(y)$$, $$f'(y)$$ and $$y'' = f'(y)\,f(y)$$, then sketch solution curves. Reveal them, tick **concavity** and compare with the shaded bands and the sign chart. Why does concavity change at $$y = 1/2$$, and why also at each equilibrium?
2. Choose **Newton's law of cooling** (the cooling soup, in a room at 15 °C) and hide everything except the axes. Sketch $$f$$, the phase line and the solution curves starting at 90 °C and at 5 °C. Then reveal them and compare.
3. Change <em>k</em>. What happens to the solution curves, and what does <em>k</em> mean physically? Compare a cup of tea in a thin glass with one in a vacuum flask.
4. Switch to **diffusion across a membrane**. Why does the same equation describe both situations? What plays the part of the room temperature?
5. In **logistic growth**, where is a solution curve steepest? Find that point on the graph of $$f$$ and explain why.
6. In **logistic growth with harvesting**, increase the harvest <em>H</em>. What happens to the two equilibria, and at what harvest do they meet? Compare it with <em>rK</em>/4. What happens to the population beyond that?
7. In **growth with a threshold**, what happens to populations that start below <em>A</em>? Why might a small population of a species fail even when resources are plentiful?
8. Can two solution curves cross? Can a solution curve cross an equilibrium line? Why not?

## How it is computed

Equilibria are the roots of $$f$$, found numerically. An equilibrium $$y^*$$ is stable if $$f'(y^*) < 0$$, unstable if $$f'(y^*) > 0$$, and semi-stable if $$f$$ has the same sign on both sides of it. Since $$y'' = f'(y)\,f(y)$$, solution curves change concavity where $$f$$ or $$f'$$ changes sign: at the equilibria and where $$f'(y) = 0$$. The concavity option finds the roots of $$f'$$ numerically, takes the signs of $$f$$, $$f'$$ and $$y''$$ at the middle of each interval between these points, shades the bands on the solution curves accordingly and lists the signs in a sign chart. Solution curves are computed forwards and backwards in time from the chosen point with the fourth-order Runge–Kutta method. The models are

- the textbook's example $$dy/dt = (y + 1)(y - 2)$$;
- Newton's law of cooling: $$dH/dt = -k\,(H - H_s)$$, where $$H_s$$ is the temperature of the surroundings;
- diffusion across a membrane into a well-mixed cell: $$dC/dt = -k\,(C - C_e)$$;
- logistic growth: $$dP/dt = rP\,(1 - P/K)$$, with harvesting $$dP/dt = rP\,(1 - P/K) - H$$;
- growth with a threshold: $$dP/dt = rP\,(P/A - 1)(1 - P/K)$$.

<p class="mm-note">The tool runs entirely in your browser; nothing is recorded or sent anywhere. It is a learning aid and is not assessed.</p>

<script src="{{ '/assets/js/teaching/mm-tools.js' | relative_url }}"></script>
<script>
  (function () {
    var M = window.MMTools;
    // Each model: variable name, axis range, time span, parameters (label, min, max, step, value, digits), f, equation text, default starts.
    var models = {
      example: {
        name: "Textbook example: (y + 1)(y − 2)",
        v: "y", vname: "y", y0: -3, y1: 4, gy: 0.5, ly: 1, t1: 3, gt: 0.5,
        params: {},
        f: function (y) { return (y + 1) * (y - 2); },
        eq: function () { return "d<em>y</em>/d<em>t</em> = (<em>y</em> + 1)(<em>y</em> − 2)"; },
        starts: [[0, 1.9], [0, -2.5], [0, 0.5], [0.4, 2.1]],
      },
      cooling: {
        name: "Newton's law of cooling (cooling soup)",
        v: "H", vname: "temperature, H (°C)", y0: 0, y1: 100, gy: 10, ly: 20, t1: 30, gt: 5,
        params: { k: ["<em>k</em>", 0.02, 1, 0.01, 0.2, 2], Hs: ["surroundings (°C)", 0, 50, 1, 15, 0] },
        f: function (y, p) { return -p.k * (y - p.Hs); },
        eq: function (p) { return "d<em>H</em>/d<em>t</em> = −" + M.fmt(p.k) + " (<em>H</em> − " + M.fmt(p.Hs, 0) + ")"; },
        starts: [[0, 90], [0, 5]],
      },
      diffusion: {
        name: "Diffusion across a membrane",
        v: "C", vname: "concentration in the cell, C (mM)", y0: 0, y1: 10, gy: 1, ly: 2, t1: 30, gt: 5,
        params: { k: ["<em>k</em>", 0.02, 1, 0.01, 0.15, 2], Ce: ["<em>C</em><sub>e</sub>", 0, 10, 0.1, 6, 1] },
        f: function (y, p) { return -p.k * (y - p.Ce); },
        eq: function (p) { return "d<em>C</em>/d<em>t</em> = −" + M.fmt(p.k) + " (<em>C</em> − " + M.fmt(p.Ce, 1) + ")"; },
        starts: [[0, 0.5], [0, 9]],
      },
      logistic: {
        name: "Logistic growth",
        v: "P", vname: "population, P", y0: 0, y1: 200, gy: 20, ly: 40, t1: 30, gt: 5,
        params: { r: ["<em>r</em>", 0.05, 1.5, 0.01, 0.4, 2], K: ["<em>K</em>", 20, 180, 1, 100, 0] },
        f: function (y, p) { return p.r * y * (1 - y / p.K); },
        eq: function (p) { return "d<em>P</em>/d<em>t</em> = " + M.fmt(p.r) + " <em>P</em> (1 − <em>P</em>/" + M.fmt(p.K, 0) + ")"; },
        starts: [[0, 8], [0, 170]],
      },
      harvest: {
        name: "Logistic growth with harvesting",
        v: "P", vname: "population, P", y0: 0, y1: 200, gy: 20, ly: 40, t1: 30, gt: 5,
        params: { r: ["<em>r</em>", 0.05, 1.5, 0.01, 0.4, 2], K: ["<em>K</em>", 20, 180, 1, 100, 0], H: ["<em>H</em>", 0, 30, 0.1, 6, 1] },
        f: function (y, p) { return p.r * y * (1 - y / p.K) - p.H; },
        eq: function (p) { return "d<em>P</em>/d<em>t</em> = " + M.fmt(p.r) + " <em>P</em> (1 − <em>P</em>/" + M.fmt(p.K, 0) + ") − " + M.fmt(p.H, 1); },
        starts: [[0, 40], [0, 15], [0, 170]],
        floor: 0,
      },
      allee: {
        name: "Growth with a threshold",
        v: "P", vname: "population, P", y0: 0, y1: 200, gy: 20, ly: 40, t1: 30, gt: 5,
        params: { r: ["<em>r</em>", 0.05, 1.5, 0.01, 0.3, 2], A: ["<em>A</em>", 5, 100, 1, 30, 0], K: ["<em>K</em>", 40, 180, 1, 120, 0] },
        f: function (y, p) { return p.r * y * (y / p.A - 1) * (1 - y / p.K); },
        eq: function (p) { return "d<em>P</em>/d<em>t</em> = " + M.fmt(p.r) + " <em>P</em> (<em>P</em>/" + M.fmt(p.A, 0) + " − 1)(1 − <em>P</em>/" + M.fmt(p.K, 0) + ")"; },
        starts: [[0, 25], [0, 40], [0, 190]],
        floor: 0,
      },
    };
    var key = "cooling", mdl, par = {}, starts = [], dragging = false;
    var show = { f: true, line: true, field: false, sol: true, conc: false };
    // Where y'' = f'(y) f(y) changes sign away from equilibria, solution curves have inflection points: the roots of f'.
    function inflections(eqs) {
      var span = mdl.y1 - mdl.y0, d = span * 1e-5;
      return M.roots(function (y) { return (f(y + d) - f(y - d)) / (2 * d); }, mdl.y0, mdl.y1, 1000).filter(function (y) {
        return !eqs.some(function (e) { return Math.abs(e.y - y) < span * 1e-3; });
      });
    }
    // Intervals between the equilibria and the roots of f', with the signs of f, f' and y'' = f' f in each.
    function concavity(eqs, infl) {
      var span = mdl.y1 - mdl.y0, d = span * 1e-5;
      var cuts = eqs.map(function (e) { return e.y; }).concat(infl).filter(function (y) { return y > mdl.y0 + span * 1e-3 && y < mdl.y1 - span * 1e-3; }).sort(function (a, b) { return a - b; });
      // no "below" interval when the range starts at an equilibrium or at the model's floor (populations are not negative)
      var floorCut = mdl.floor === mdl.y0 || eqs.some(function (e) { return Math.abs(e.y - mdl.y0) <= span * 1e-3; });
      var ends = [mdl.y0].concat(cuts).concat([mdl.y1]), out = [];
      function sg(v) { return Math.abs(v) < 1e-12 ? 0 : v > 0 ? 1 : -1; }
      for (var i = 0; i < ends.length - 1; i++) {
        var m = (ends[i] + ends[i + 1]) / 2, fv = f(m), fd = (f(m + d) - f(m - d)) / (2 * d);
        out.push({ lo: ends[i], hi: ends[i + 1], open: i === 0 && !floorCut ? "below" : i === ends.length - 2 ? "above" : "", f: sg(fv), fp: sg(fd), ypp: sg(fv) * sg(fd) });
      }
      return out;
    }
    function signChart(bands) {
      var wrap = document.getElementById("pl-conc");
      wrap.hidden = !show.conc;
      if (!show.conc) return;
      var span = mdl.y1 - mdl.y0, v = "<em>" + mdl.v + "</em>";
      function nf(y) { return String(+y.toFixed(span > 20 ? 1 : 2)).replace("-", "−"); }
      function sgn(s) { return s > 0 ? "+" : s < 0 ? "−" : "0"; }
      var head = bands.map(function (b) {
        if (b.open === "below") return v + " &lt; " + nf(b.hi);
        if (b.open === "above") return v + " &gt; " + nf(b.lo);
        return nf(b.lo) + " &lt; " + v + " &lt; " + nf(b.hi);
      });
      var rows = [
        ["<em>f</em>(" + v + ") = " + v + "′", bands.map(function (b) { return sgn(b.f); })],
        ["<em>f</em>′(" + v + ")", bands.map(function (b) { return sgn(b.fp); })],
        [v + "″ = <em>f</em>′(" + v + ") <em>f</em>(" + v + ")", bands.map(function (b) { return sgn(b.ypp); })],
        ["solution curves", bands.map(function (b) { return (b.f > 0 ? "rising" : b.f < 0 ? "falling" : "constant") + (b.ypp > 0 ? ", concave up" : b.ypp < 0 ? ", concave down" : ""); })],
      ];
      var h = "<thead><tr><th></th>" + head.map(function (x) { return "<th style=\"white-space:nowrap;text-align:center\">" + x + "</th>"; }).join("") + "</tr></thead><tbody>";
      rows.forEach(function (r, i) { h += "<tr><td style=\"white-space:nowrap\">" + r[0] + "</td>" + r[1].map(function (x) { return "<td style=\"text-align:center" + (i < 3 ? ";font-weight:600" : "") + "\">" + x + "</td>"; }).join("") + "</tr>"; });
      document.getElementById("pl-signs").innerHTML = h + "</tbody>";
    }
    var fp = new M.Plot(document.getElementById("pl-f"), { x0: 0, x1: 1, y0: -1, y1: 1, gx: 1, gy: 1, xname: "y", yname: "f", aspect: 0.7, aspectNarrow: 0.7, left: 26 });
    var sp = new M.Plot(document.getElementById("pl-sol"), { x0: 0, x1: 30, y0: 0, y1: 1, gx: 5, gy: 1, xname: "time, t", yname: "", aspect: 0.7, aspectNarrow: 0.75, left: 26 });
    function f(y) { return mdl.f(y, par); }
    function niceStep(range) {
      var raw = range / 4, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p;
      return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
    }
    function equilibria() {
      var lo = mdl.y0, hi = mdl.y1, span = hi - lo, out = [];
      M.roots(f, lo - span * 0.001, hi, 2000).forEach(function (r) {
        if (r < lo - 1e-9 || r > hi) return;
        var d = span * 1e-4, a = f(r - d), b = f(r + d);
        var kind = a > 0 && b < 0 ? "stable" : a < 0 && b > 0 ? "unstable" : "semi-stable";
        if (out.length && Math.abs(out[out.length - 1].y - r) < span * 1e-6) return;
        out.push({ y: r, kind: kind });
      });
      // a double root (f touches zero without changing sign) is missed by sign changes; look for near-zero minima of |f|
      var n = 2000, prev = Math.abs(f(lo)), cur = Math.abs(f(lo + span / n));
      for (var i = 2; i <= n; i++) {
        var y = lo + (span * i) / n, nxt = Math.abs(f(y));
        if (cur < prev && cur <= nxt && cur < 1e-3 * (1 + Math.abs(f(lo + span / 2)))) {
          var yc = lo + (span * (i - 1)) / n;
          if (!out.some(function (e) { return Math.abs(e.y - yc) < span * 2e-3; })) out.push({ y: yc, kind: "semi-stable" });
        }
        prev = cur; cur = nxt;
      }
      return out.sort(function (a, b) { return a.y - b.y; });
    }
    function solution(t0, yy0) {
      var g = function (t, s) { return [f(s[0])]; }, span = mdl.y1 - mdl.y0;
      var stop = function (t, s) { return s[0] > mdl.y1 + 2 * span || s[0] < mdl.y0 - 2 * span || (mdl.floor !== undefined && s[0] < mdl.floor); };
      var h = mdl.t1 / 1500;
      var fw = M.solve(g, [yy0], t0, mdl.t1, h, stop), bw = M.solve(g, [yy0], t0, 0, -h, stop);
      var pts = [];
      for (var i = bw.t.length - 1; i > 0; i--) pts.push([bw.t[i], bw.y[i][0]]);
      for (var j = 0; j < fw.t.length; j++) pts.push([fw.t[j], fw.y[j][0]]);
      return pts;
    }
    function draw() {
      var eqs = equilibria(), span = mdl.y1 - mdl.y0;
      document.getElementById("pl-eqn").innerHTML = mdl.eq(par);
      // Graph of f against y (y horizontal), with the phase line drawn along the axis f = 0.
      // Vertical range: fit the positive and negative parts of f, but do not let a steep tail squash the rest.
      var fpos = 0, fneg = 0;
      for (var i = 0; i <= 400; i++) { var fv = f(mdl.y0 + (span * i) / 400); fpos = Math.max(fpos, fv); fneg = Math.max(fneg, -fv); }
      var big = Math.max(fpos, fneg), small = Math.min(fpos, fneg);
      var fmax = small > 0 ? Math.min(big, 3 * small) : big;
      fmax = fmax > 0 ? fmax * 1.15 : 1;
      var st = niceStep(fmax);
      fp.o.y0 = -fmax; fp.o.y1 = fmax; fp.o.gy = st; fp.o.ly = st * 2; fp.o.x0 = mdl.y0; fp.o.x1 = mdl.y1; fp.o.gx = mdl.gy; fp.o.lx = mdl.ly;
      fp.o.xname = mdl.vname; fp.o.yname = "d" + mdl.v + "/dt = f(" + mdl.v + ")";
      fp.frame();
      fp.path([[mdl.y0, 0], [mdl.y1, 0]], show.line ? "mm-curve" : "mm-zero");
      if (show.f) {
        var pts = [];
        for (var k = 0; k <= 400; k++) { var yv = mdl.y0 + (span * k) / 400; pts.push([yv, f(yv)]); }
        fp.path(pts, "mm-a");
      }
      if (show.line) {
        // arrows between equilibria: right where f > 0 (y increases), left where f < 0
        var cuts = [mdl.y0].concat(eqs.map(function (e) { return e.y; })).concat([mdl.y1]);
        for (var c = 0; c < cuts.length - 1; c++) {
          var a = cuts[c], b = cuts[c + 1];
          if (b - a < span * 0.03) continue;
          var nArr = Math.max(1, Math.min(3, Math.round(((b - a) / span) * 6)));
          for (var q = 1; q <= nArr; q++) {
            var ym = a + ((b - a) * q) / (nArr + 1), s = f(ym);
            if (Math.abs(s) > 1e-12) fp.tri(ym, 0, s > 0 ? 1 : -1, 0, 6, "mm-arrow");
          }
        }
        eqs.forEach(function (e) { fp.circle(e.y, 0, 5, e.kind === "stable" ? "mm-eq-s" : e.kind === "unstable" ? "mm-eq-u" : "mm-eq-n"); });
      }
      // solution panel
      sp.o.x1 = mdl.t1; sp.o.gx = mdl.gt; sp.o.lx = mdl.gt * 2; sp.o.y0 = mdl.y0; sp.o.y1 = mdl.y1; sp.o.gy = mdl.gy; sp.o.ly = mdl.ly;
      sp.o.yname = mdl.vname;
      sp.frame();
      if (show.field) {
        for (var ti = 0; ti <= 20; ti++)
          for (var yi = 0; yi <= 12; yi++) {
            var tt = (ti + 0.5) * (mdl.t1 / 21), yy = mdl.y0 + (yi + 0.5) * (span / 13), sl = f(yy);
            var dx = sp.sx(tt + 1) - sp.sx(tt), dy = sp.sy(yy + sl) - sp.sy(yy), n = Math.sqrt(dx * dx + dy * dy), L = 6 * sp.K;
            M.el("line", { x1: sp.sx(tt) - (dx / n) * L, y1: sp.sy(yy) - (dy / n) * L, x2: sp.sx(tt) + (dx / n) * L, y2: sp.sy(yy) + (dy / n) * L, class: "mm-field" }, sp.data);
          }
      }
      if (show.line) eqs.forEach(function (e) { sp.path([[0, e.y], [mdl.t1, e.y]], e.kind === "stable" ? "mm-null-a" : "mm-null-b"); });
      var infl = inflections(eqs), bands = concavity(eqs, infl);
      if (show.conc) {
        // shade each band by the sign of y'' = f'(y) f(y): colour where solution curves are concave up, grey where concave down
        bands.forEach(function (b) {
          if (!b.ypp) return;
          var y0 = sp.sy(b.hi), y1 = sp.sy(b.lo);
          M.el("rect", { x: sp.sx(0), y: y0, width: sp.sx(mdl.t1) - sp.sx(0), height: y1 - y0, style: "stroke:none;fill:" + (b.ypp > 0 ? "var(--mm-c);opacity:.13" : "var(--global-text-color);opacity:.07") }, sp.data);
          if (y1 - y0 > 18 * sp.K) M.el("text", { x: sp.sx(mdl.t1) - 6 * sp.K, y: (y0 + y1) / 2 + 4 * sp.K, "text-anchor": "end", style: "font-size:" + 11 * sp.K + "px;fill:var(--global-text-color-light)" }, sp.data).textContent = b.ypp > 0 ? "concave up" : "concave down";
        });
        infl.forEach(function (y) { var l = sp.path([[0, y], [mdl.t1, y]], "mm-zero"); l.style.strokeDasharray = "1 3"; l.style.strokeWidth = "1.6"; });
        // on the graph of f, mark where f' = 0
        infl.forEach(function (y) {
          var l = fp.path([[y, 0], [y, f(y)]], "mm-zero"); l.style.strokeDasharray = "1 3"; l.style.strokeWidth = "1.6";
          var r = fp.circle(y, f(y), 5.5, "mm-handle"); r.setAttribute("stroke", "var(--mm-c)");
        });
      }
      signChart(bands);
      if (show.sol)
        starts.forEach(function (s0, idx) {
          sp.path(solution(s0[0], s0[1]), idx === starts.length - 1 ? "mm-curve" : "mm-curve mm-faded");
        });
      starts.forEach(function (s0) { sp.circle(s0[0], s0[1], 4, "mm-dot"); });
      // readout
      var txt = eqs.length
        ? "Equilibria: " + eqs.map(function (e) { return mdl.v + " = <b>" + M.fmt(e.y, span > 20 ? 1 : 2) + "</b> (" + e.kind + ")"; }).join(", ") + "."
        : "No equilibria in this range.";
      if (show.conc) txt += infl.length ? " Besides the equilibria, solution curves change concavity where <em>f</em>′ = 0, at " + infl.map(function (y) { return mdl.v + " = <b>" + M.fmt(y, span > 20 ? 1 : 2) + "</b>"; }).join(" and ") + " (dotted)." : " Here <em>f</em>′ never changes sign, so solution curves change concavity only at the equilibria.";
      if (key === "harvest") {
        var msy = (par.r * par.K) / 4;
        txt += " The largest harvest the population can sustain is <em>rK</em>/4 = <b>" + M.fmt(msy, 1) + "</b>" + (par.H > msy ? "; at this harvest every population declines to zero." : ".");
      }
      document.getElementById("pl-out").innerHTML = txt;
    }
    // controls
    var modelBox = document.getElementById("pl-model"), box = document.getElementById("pl-controls"), pg;
    var g0 = M.group(modelBox, "Model");
    M.select(g0, Object.keys(models).map(function (k) { return [k, models[k].name]; }), key, function (v) { setModel(v); });
    pg = M.group(box, "Parameters");
    var g2 = M.group(box, "Show");
    M.checkbox(g2, "Graph of <em>f</em>", show.f, function (c) { show.f = c; draw(); });
    M.checkbox(g2, "Phase line and equilibria", show.line, function (c) { show.line = c; draw(); });
    M.checkbox(g2, "Solution curves", show.sol, function (c) { show.sol = c; draw(); });
    M.checkbox(g2, "Slope field", show.field, function (c) { show.field = c; draw(); });
    M.checkbox(g2, "Concavity", show.conc, function (c) { show.conc = c; draw(); });
    M.button(g2, "Clear", function () { starts = []; draw(); });
    function setModel(k) {
      key = k; mdl = models[k]; par = {};
      while (pg.childNodes.length > 1) pg.removeChild(pg.lastChild);
      Object.keys(mdl.params).forEach(function (name) {
        var s = mdl.params[name];
        par[name] = s[4];
        M.slider(pg, { label: s[0], min: s[1], max: s[2], step: s[3], value: s[4], digits: s[5], onInput: function (v) { par[name] = v; draw(); } });
      });
      pg.style.display = Object.keys(mdl.params).length ? "" : "none";
      starts = mdl.starts.map(function (s) { return s.slice(); });
      draw();
    }
    // pointer: click to add a solution through that point, drag to move it
    var svg = sp.svg;
    svg.addEventListener("pointerdown", function (evt) {
      var p = sp.at(evt);
      if (!sp.inside(p.x, p.y)) return;
      evt.preventDefault();
      starts.push([p.x, p.y]);
      if (starts.length > 8) starts.shift();
      dragging = true;
      svg.setPointerCapture(evt.pointerId);
      draw();
    });
    svg.addEventListener("pointermove", function (evt) {
      if (!dragging) return;
      var p = sp.at(evt);
      starts[starts.length - 1] = [Math.min(Math.max(p.x, 0), mdl.t1), Math.min(Math.max(p.y, mdl.y0), mdl.y1)];
      draw();
    });
    function release() { dragging = false; }
    svg.addEventListener("pointerup", release);
    svg.addEventListener("pointercancel", release);
    M.onResize(draw);
    setModel(key);
  })();
</script>
