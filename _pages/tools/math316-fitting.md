---
layout: page
title: Least squares or Chebyshev?
description: An interactive tool for MATH 316, weeks 5–6. Compare two criteria for fitting a model to data.
permalink: /teaching/math316/tools/fitting/
---

[← MATH 316]({{ '/teaching/math316/' | relative_url }})

Given some data and a model with unknown parameters, which parameters give the "best" fit? The answer depends on what we mean by best. This tool compares two criteria from the lectures for a straight line or a line through the origin, on made-up data or on real data for Kuwait. It supports learning outcomes 2 and 3.

<div class="mm-wrap" id="ft">
  <svg id="ft-plot" role="img" aria-label="Scatter plot of data points with the least-squares and Chebyshev fits"></svg>
  <div class="mm-controls" id="ft-controls"></div>
  <p class="mm-help" id="ft-source" hidden></p>
  <p class="mm-help">Drag a point to move it. Click an empty spot to add a point; double-click a point, or drag it off the plot, to remove it. Circled points are where the Chebyshev fit reaches its largest deviation.</p>
  <div class="mm-scroll">
    <table class="mm-table" style="width:100%">
      <thead>
        <tr><th>Criterion and fitted model</th><th>Sum of squared deviations</th><th>Largest absolute deviation</th></tr>
      </thead>
      <tbody id="ft-out"></tbody>
    </table>
  </div>
</div>

## Things to try

1. Start with **Nearly linear**. The two fits almost coincide. Why would you expect that?
2. Choose **With an outlier**, or drag one point well away from the rest. Which fit moves more? Which fit would you trust, and why?
3. Compare the last two columns of the table as you move points. Can the least-squares fit ever have a smaller largest deviation than the Chebyshev fit? Can the Chebyshev fit ever have a smaller sum of squares?
4. Turn on the **Chebyshev band**. How many points touch its edges, and on which side of the line does each lie, from left to right? Move a point and see whether the pattern survives.
5. Switch to **y = kx** with the **Curved** data. Is either fit adequate? What would you try next?
6. Describe one modelling problem where the largest deviation matters more than the typical one, and one where the reverse is true.
7. Load **Kuwait 1995–2025**. Is a straight line a reasonable model over the whole period? Look at the years around 2020–21: what was happening then, and should those years count the same as the others? Remove them with a double-click and see how each fit changes.
8. Use each fit to estimate Kuwait's population in 2030. How far apart are the two estimates, and how much would you trust either of them?
9. Load **Kuwait 1980–2005**. The points for 1990 and 1991 lie far below the rest: what happened then? Which fit is pulled further by those years? Should they be removed as outliers, or are they data that a model of Kuwait's population ought to explain?

## How the fits are computed

For data $$(x_i, y_i)$$, $$i = 1, \dots, m$$, and a model $$y = f(x)$$:

- **Least squares** chooses the parameters that minimize the sum of squared deviations, $$S = \sum_{i=1}^{m} \left[ y_i - f(x_i) \right]^2$$. Setting the partial derivatives of $$S$$ to zero gives the normal equations, which have a closed-form solution.
- **Chebyshev** chooses the parameters that minimize the largest absolute deviation, $$c = \max_i \lvert y_i - f(x_i) \rvert$$. For $$f(x) = a + bx$$ this is the linear program: minimize $$c$$ subject to $$-c \le y_i - (a + b x_i) \le c$$ for every $$i$$. With a handful of points, the tool solves it by a direct search, checking every set of three points (two for $$y = kx$$) where the deviations alternate in sign.

<p class="mm-note">The tool runs entirely in your browser; nothing is recorded or sent anywhere. It is a learning aid and is not assessed.</p>

<script src="{{ '/assets/js/teaching/mm-tools.js' | relative_url }}"></script>
<script>
  (function () {
    var M = window.MMTools;
    var MINPTS = 3, MAXPTS = 40;
    var SRC = "Source: World Bank, <a href=\"https://data.worldbank.org/indicator/SP.POP.TOTL?locations=KW\">World Development Indicators</a> (indicator SP.POP.TOTL), CC BY 4.0.";
    // Each data set has its own axes (ranges, grid steps, a year offset for labels), variable names and rounding of added points.
    var plain = { x0: 0, x1: 10, y0: 0, y1: 10, gx: 1, gy: 1, lx: 2, ly: 2, xoff: 0, xname: "x", yname: "y", xv: "x", yv: "y", xr: 0.1, yr: 0.1, source: null };
    function kuwaitView(first, last, y1, gy) {
      return { x0: -1, x1: last - first + 1, y0: 0, y1: y1, gx: 5, gy: gy, lx: 5, ly: 1, xoff: first, xname: "year", yname: "P (millions)", xv: "t", yv: "P", xr: 1, yr: 0.01,
        source: "Kuwait's total population each year from " + first + " to " + last + ", in millions (<em>P</em>), against <em>t</em>, the number of years since " + first + ". " + SRC };
    }
    var sets = {
      linear: { name: "Nearly linear", view: plain, pts: [[1, 1.5], [2, 2.3], [3, 3.2], [4, 3.8], [5, 5.2], [6, 5.7], [7, 6.7], [8, 7.6], [9, 8.6]] },
      outlier: { name: "With an outlier", view: plain, pts: [[1, 1.5], [2, 2.3], [3, 3.2], [4, 3.8], [5, 5.2], [6, 9.4], [7, 6.7], [8, 7.6], [9, 8.6]] },
      curved: { name: "Curved", view: plain, pts: [[1, 0.6], [2, 1.0], [3, 1.6], [4, 2.3], [5, 3.1], [6, 4.1], [7, 5.3], [8, 6.7], [9, 8.4]] },
      // World Bank, World Development Indicators, SP.POP.TOTL (CC BY 4.0). t = years since the first year shown, P in millions.
      kuwait: { name: "Kuwait 1995–2025", view: kuwaitView(1995, 2025, 6, 1), pts: [[0, 1.682], [1, 1.730], [2, 1.788], [3, 1.844], [4, 1.900], [5, 1.955], [6, 2.008], [7, 2.060], [8, 2.110], [9, 2.157], [10, 2.237], [11, 2.365], [12, 2.508], [13, 2.651], [14, 2.795], [15, 2.943], [16, 3.133], [17, 3.337], [18, 3.508], [19, 3.666], [20, 3.835], [21, 4.004], [22, 4.155], [23, 4.324], [24, 4.442], [25, 4.400], [26, 4.361], [27, 4.590], [28, 4.853], [29, 4.897], [30, 4.865]] },
      kuwait80: { name: "Kuwait 1980–2005", view: kuwaitView(1980, 2005, 3, 0.5), pts: [[0, 1.505], [1, 1.583], [2, 1.662], [3, 1.744], [4, 1.821], [5, 1.894], [6, 1.973], [7, 2.053], [8, 2.135], [9, 2.217], [10, 1.685], [11, 1.351], [12, 1.635], [13, 1.672], [14, 1.664], [15, 1.682], [16, 1.730], [17, 1.788], [18, 1.844], [19, 1.900], [20, 1.955], [21, 2.008], [22, 2.060], [23, 2.110], [24, 2.157], [25, 2.237]] },
    };
    var V = plain, pts = sets.linear.pts.map(function (p) { return p.slice(); }), model = "line";
    var show = { ls: true, ch: true, res: false, band: false };
    var plot = new M.Plot(document.getElementById("ft-plot"), { x0: 0, x1: 10, y0: 0, y1: 10, gx: 1, gy: 1, lx: 2, ly: 2, aspect: 0.625, aspectNarrow: 0.875, left: 18 });
    function setView(v) {
      V = v;
      ["x0", "x1", "y0", "y1", "gx", "gy", "lx", "ly"].forEach(function (k) { plot.o[k] = v[k]; });
      plot.o.fx = function (g) { return String(Math.round(g + v.xoff)); };
      plot.o.xname = v.xname; plot.o.yname = v.yname;
      var src = document.getElementById("ft-source");
      src.hidden = !v.source;
      src.innerHTML = v.source || "";
    }
    function stats(f) {
      var s = 0, c = 0;
      pts.forEach(function (p) { var r = p[1] - f(p[0]); s += r * r; c = Math.max(c, Math.abs(r)); });
      return { sse: s, max: c };
    }
    function lineFit(a, b) { return { a: a, b: b, f: function (x) { return a + b * x; } }; }
    function leastSquares() {
      var n = pts.length, Sx = 0, Sy = 0, Sxx = 0, Sxy = 0;
      pts.forEach(function (p) { Sx += p[0]; Sy += p[1]; Sxx += p[0] * p[0]; Sxy += p[0] * p[1]; });
      if (model === "prop") return Sxx > 1e-12 ? lineFit(0, Sxy / Sxx) : null;
      var d = n * Sxx - Sx * Sx;
      if (Math.abs(d) < 1e-12) return null;
      var b = (n * Sxy - Sx * Sy) / d;
      return lineFit((Sy - b * Sx) / n, b);
    }
    // Chebyshev (minimax) fit by direct search over the reference sets of the problem.
    function chebyshev() {
      var best = null, bestE = Infinity, n = pts.length, i, j, k;
      function consider(a, b) {
        if (!isFinite(a) || !isFinite(b)) return;
        var fit = lineFit(a, b), e = stats(fit.f).max;
        if (e < bestE - 1e-12) { bestE = e; best = fit; }
      }
      if (model === "prop") {
        for (i = 0; i < n; i++) {
          if (Math.abs(pts[i][0]) > 1e-12) consider(0, pts[i][1] / pts[i][0]);
          for (j = i + 1; j < n; j++) {
            var xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
            if (Math.abs(xi + xj) > 1e-12) consider(0, (yi + yj) / (xi + xj));
            if (Math.abs(xi - xj) > 1e-12) consider(0, (yi - yj) / (xi - xj));
          }
        }
        return best;
      }
      var q = pts.slice().sort(function (u, v) { return u[0] - v[0]; });
      for (i = 0; i < n; i++)
        for (j = i + 1; j < n; j++)
          for (k = j + 1; k < n; k++) {
            if (Math.abs(q[k][0] - q[i][0]) < 1e-12) continue;
            var b = (q[k][1] - q[i][1]) / (q[k][0] - q[i][0]);
            var h = (q[i][1] - q[j][1] - b * (q[i][0] - q[j][0])) / 2;
            consider(q[i][1] - b * q[i][0] - h, b);
          }
      return best;
    }
    function label(fit) {
      if (!fit) return "—";
      if (model === "prop") return V.yv + " = " + M.fmt(fit.b, 3) + V.xv;
      return V.yv + " = " + M.fmt(fit.a, 3) + (fit.b < 0 ? " − " : " + ") + M.fmt(Math.abs(fit.b), 3) + V.xv;
    }
    function draw() {
      plot.frame();
      var X0 = V.x0, X1 = V.x1, K = plot.K;
      var ls = leastSquares(), ch = chebyshev(), sl = ls ? stats(ls.f) : null, sc = ch ? stats(ch.f) : null;
      if (ch && show.band) {
        var e = sc.max;
        M.el("polygon", { style: "fill:var(--mm-b);opacity:.12;stroke:none", points: [[X0, ch.f(X0) + e], [X1, ch.f(X1) + e], [X1, ch.f(X1) - e], [X0, ch.f(X0) - e]].map(function (p) { return plot.sx(p[0]) + "," + plot.sy(p[1]); }).join(" ") }, plot.data);
      }
      if (show.res)
        pts.forEach(function (p) {
          if (ls && show.ls) M.el("line", { class: "mm-a", style: "stroke-width:1.5;stroke-dasharray:3 2", x1: plot.sx(p[0]) - 3 * K, y1: plot.sy(p[1]), x2: plot.sx(p[0]) - 3 * K, y2: plot.sy(ls.f(p[0])) }, plot.data);
          if (ch && show.ch) M.el("line", { class: "mm-b", style: "stroke-width:1.5;stroke-dasharray:3 2", x1: plot.sx(p[0]) + 3 * K, y1: plot.sy(p[1]), x2: plot.sx(p[0]) + 3 * K, y2: plot.sy(ch.f(p[0])) }, plot.data);
        });
      if (ls && show.ls) plot.path([[X0, ls.f(X0)], [X1, ls.f(X1)]], "mm-a");
      if (ch && show.ch) plot.path([[X0, ch.f(X0)], [X1, ch.f(X1)]], "mm-b");
      pts.forEach(function (p) {
        if (ch && (show.ch || show.band) && Math.abs(Math.abs(p[1] - ch.f(p[0])) - sc.max) < 1e-6 * Math.max(1, sc.max)) {
          var ring = plot.circle(p[0], p[1], 11, "mm-handle");
          ring.setAttribute("stroke", "var(--mm-b)");
          ring.style.strokeWidth = "2";
        }
        plot.circle(p[0], p[1], 6, "mm-dot");
      });
      var rows = [["Least squares", "var(--mm-a)", ls, sl], ["Chebyshev", "var(--mm-b)", ch, sc]];
      document.getElementById("ft-out").innerHTML = rows.map(function (r, i) {
        var o = rows[1 - i][3], s = r[3];
        var b1 = s && o && s.sse <= o.sse + 1e-9 ? " style=\"font-weight:600\"" : "", b2 = s && o && s.max <= o.max + 1e-9 ? " style=\"font-weight:600\"" : "";
        return "<tr><td><span class=\"mm-key\" style=\"border-color:" + r[1] + "\"></span>" + r[0] + "<br><span style=\"color:var(--global-text-color-light);margin-left:1.75rem;white-space:nowrap\">" + label(r[2]) + "</span></td><td" + b1 + ">" + (s ? M.fmt(s.sse, 3) : "—") + "</td><td" + b2 + ">" + (s ? M.fmt(s.max, 3) : "—") + "</td></tr>";
      }).join("");
    }
    // controls
    var box = document.getElementById("ft-controls");
    M.select(M.group(box, "Model"), [["line", "y = a + bx"], ["prop", "y = kx"]], model, function (v) { model = v; draw(); });
    var gs = M.group(box, "Show");
    M.checkbox(gs, "<span style=\"color:var(--mm-a)\">Least squares</span>", show.ls, function (c) { show.ls = c; draw(); });
    M.checkbox(gs, "<span style=\"color:var(--mm-b)\">Chebyshev</span>", show.ch, function (c) { show.ch = c; draw(); });
    M.checkbox(gs, "Deviations", show.res, function (c) { show.res = c; draw(); });
    M.checkbox(gs, "Chebyshev band", show.band, function (c) { show.band = c; draw(); });
    var gd = M.group(box, "Data");
    Object.keys(sets).forEach(function (k) {
      var b = M.button(gd, sets[k].name, function () { setView(sets[k].view); pts = sets[k].pts.map(function (p) { return p.slice(); }); draw(); });
      b.setAttribute("data-preset", k);
    });
    M.editPoints(plot, {
      get: function () { return pts; }, min: MINPTS, max: MAXPTS, onChange: draw,
      get xr() { return V.xr; }, get yr() { return V.yr; },
    });
    setView(plain);
    M.onResize(draw);
    draw();
  })();
</script>
