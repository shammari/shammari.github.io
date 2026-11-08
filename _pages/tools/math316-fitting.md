---
layout: page
title: Least squares or Chebyshev?
description: An interactive tool for MATH 316, weeks 5–6. Compare two criteria for fitting a model to data, including the textbook’s vehicular stopping distance data.
permalink: /teaching/math316/tools/fitting/
---

[← MATH 316]({{ '/teaching/math316/' | relative_url }})

Given some data and a model with unknown parameters, which parameters give the "best" fit? The answer depends on what we mean by best. This tool compares two criteria from the lectures for four simple models, on made-up data, on the textbook's stopping distance data or on real data for Kuwait. It supports learning outcomes 2 and 3.

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
10. Load **Stopping: reaction**, fitted with $$y = kx$$, and **Stopping: braking**, fitted with $$y = kx^2$$. Compare the least-squares constants with those in Section 3.4, $$1.104$$ and $$0.0542$$, and with your graphical estimates from week 4.
11. Load **Stopping: total**. The dashed curve adds the two submodels fitted separately, $$d = 1.104v + 0.0542v^2$$. Where does it lie relative to the points up to 70 mph, and beyond? Section 3.4 reads the same pattern from a plot of the deviations. Then compare with $$d = av + bv^2$$ fitted directly to the totals. Which fits better? The reaction part is $$\tfrac{22}{15} t_r v$$, so what response time $$t_r$$ does each fit imply, and which would you believe?

## How the fits are computed

For data $$(x_i, y_i)$$, $$i = 1, \dots, m$$, and a model $$y = f(x)$$:

- **Least squares** chooses the parameters that minimize the sum of squared deviations, $$S = \sum_{i=1}^{m} \left[ y_i - f(x_i) \right]^2$$. Setting the partial derivatives of $$S$$ to zero gives the normal equations, which have a closed-form solution.
- **Chebyshev** chooses the parameters that minimize the largest absolute deviation, $$c = \max_i \lvert y_i - f(x_i) \rvert$$. For $$f(x) = a + bx$$ this is the linear program: minimize $$c$$ subject to $$-c \le y_i - (a + b x_i) \le c$$ for every $$i$$. With a handful of points, the tool solves it by a direct search: for a model with $$n$$ unknown coefficients, the best fit has equal largest deviations at $$n + 1$$ of the points, so the tool tries every set of $$n + 1$$ points and every pattern of signs there. The four models are $$y = a + bx$$, $$y = kx$$, $$y = kx^2$$ and $$y = ax + bx^2$$, all linear in their coefficients.

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
    // Stopping distance data from Table 2.4 of the textbook: v in mph, distances in feet (averages).
    var SV = [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80];
    function stopView(yname, y1, gy) {
      return { x0: 0, x1: 85, y0: 0, y1: y1, gx: 5, gy: gy, lx: 10, ly: gy * 2, xoff: 0, xname: "speed, v (mph)", yname: yname, xv: "v", yv: "d", xr: 1, yr: 0.5,
        source: "Observed stopping distances from the U.S. Bureau of Public Roads, as given in Table 2.4 of the textbook (averages). Section 3.4 fits each part separately." };
    }
    function zip(ys) { return SV.map(function (v, i) { return [v, ys[i]]; }); }
    sets.reaction = { name: "Stopping: reaction", view: stopView("reaction distance, d (ft)", 100, 10), model: "prop", pts: zip([22, 28, 33, 39, 44, 50, 55, 61, 66, 72, 77, 83, 88]) };
    sets.braking = { name: "Stopping: braking", view: stopView("braking distance, d (ft)", 400, 25), model: "sq", pts: zip([20, 28, 40.5, 52.5, 72, 92.5, 118, 148.5, 182, 220.5, 266, 318, 376]) };
    sets.total = { name: "Stopping: total", view: stopView("total stopping distance, d (ft)", 500, 25), model: "quad", ref: true, pts: zip([42, 56, 73.5, 91.5, 116, 142.5, 173, 209.5, 248, 292.5, 343, 401, 464]) };
    // Each model is a combination of basis functions with unknown coefficients.
    var MODELS = {
      line: { name: "y = a + bx", basis: [function () { return 1; }, function (x) { return x; }] },
      prop: { name: "y = kx", basis: [function (x) { return x; }] },
      sq: { name: "y = kx²", basis: [function (x) { return x * x; }] },
      quad: { name: "y = ax + bx²", basis: [function (x) { return x; }, function (x) { return x * x; }] },
    };
    // The Section 3.4 model for total stopping distance: the sum of the two submodels fitted separately.
    var REF = { c: [1.104, 0.0542], f: function (x) { return 1.104 * x + 0.0542 * x * x; } };
    var V = plain, pts = sets.linear.pts.map(function (p) { return p.slice(); }), model = "line", showRef = false;
    var show = { ls: true, ch: true, res: false, band: false };
    var plot = new M.Plot(document.getElementById("ft-plot"), { x0: 0, x1: 10, y0: 0, y1: 10, gx: 1, gy: 1, lx: 2, ly: 2, aspect: 0.625, aspectNarrow: 0.875, left: 18 });
    function setView(v) {
      V = v;
      ["x0", "x1", "y0", "y1", "gx", "gy", "lx", "ly"].forEach(function (k) { plot.o[k] = v[k]; });
      plot.o.fx = function (g) { return String(Math.round(g + v.xoff)); };
      plot.o.xname = v.xname; plot.o.yname = v.yname;
      plot.o.left = v.y1 >= 100 ? 26 : 18;
      var src = document.getElementById("ft-source");
      src.hidden = !v.source;
      src.innerHTML = v.source || "";
    }
    function stats(f) {
      var s = 0, c = 0;
      pts.forEach(function (p) { var r = p[1] - f(p[0]); s += r * r; c = Math.max(c, Math.abs(r)); });
      return { sse: s, max: c };
    }
    function makeFit(c) {
      var B = MODELS[model].basis;
      return { c: c, f: function (x) { var s = 0; for (var j = 0; j < B.length; j++) s += c[j] * B[j](x); return s; } };
    }
    function leastSquares() {
      var B = MODELS[model].basis;
      if (pts.length < B.length) return null;
      var c = M.lsq(pts.map(function (p) { return B.map(function (b) { return b(p[0]); }); }), pts.map(function (p) { return p[1]; }));
      return c ? makeFit(c) : null;
    }
    // Solve a small square system by Gaussian elimination with partial pivoting.
    function gsolve(A, b) {
      var n = b.length, i, j, k;
      A = A.map(function (r, i) { return r.concat([b[i]]); });
      for (k = 0; k < n; k++) {
        var p = k;
        for (i = k + 1; i < n; i++) if (Math.abs(A[i][k]) > Math.abs(A[p][k])) p = i;
        if (Math.abs(A[p][k]) < 1e-12) return null;
        var t = A[k]; A[k] = A[p]; A[p] = t;
        for (i = k + 1; i < n; i++) { var m = A[i][k] / A[k][k]; for (j = k; j <= n; j++) A[i][j] -= m * A[k][j]; }
      }
      var x = new Array(n);
      for (i = n - 1; i >= 0; i--) { var s = A[i][n]; for (j = i + 1; j < n; j++) s -= A[i][j] * x[j]; x[i] = s / A[i][i]; }
      return x;
    }
    // Chebyshev (minimax) fit by direct search. With n coefficients, the best fit has equal largest deviations, with some
    // pattern of signs, at n + 1 of the points; the search tries every such set of points and pattern of signs.
    function chebyshev() {
      var B = MODELS[model].basis, n = B.length, m = pts.length, best = null, bestE = Infinity;
      if (m < n + 1) return leastSquares();
      var idx = [];
      function consider(c) {
        if (!c || !c.every(isFinite)) return;
        var fit = makeFit(c), e = stats(fit.f).max;
        if (e < bestE - 1e-12) { bestE = e; best = fit; }
      }
      function visit(start, depth) {
        if (depth === n + 1) {
          for (var s = 0; s < 1 << n; s++) {
            var A = [], b = [];
            idx.forEach(function (i, r) {
              var sg = r === 0 ? 1 : s & (1 << (r - 1)) ? -1 : 1;
              A.push(B.map(function (f) { return f(pts[i][0]); }).concat([sg]));
              b.push(pts[i][1]);
            });
            var sol = gsolve(A, b);
            if (sol) consider(sol.slice(0, n));
          }
          return;
        }
        for (var i = start; i < m; i++) { idx.push(i); visit(i + 1, depth + 1); idx.pop(); }
      }
      visit(0, 0);
      return best;
    }
    // Coefficients to three decimal places, or three significant figures when smaller than 1.
    function cf(v) { return Math.abs(v) >= 1 ? M.fmt(v, 3) : String(+v.toPrecision(3)).replace("-", "\u2212"); }
    function label(fit) {
      if (!fit) return "—";
      var c = fit.c, x = V.xv, y = V.yv;
      if (model === "prop") return y + " = " + cf(c[0]) + x;
      if (model === "sq") return y + " = " + cf(c[0]) + x + "²";
      if (model === "quad") return y + " = " + cf(c[0]) + x + (c[1] < 0 ? " − " : " + ") + cf(Math.abs(c[1])) + x + "²";
      return y + " = " + cf(c[0]) + (c[1] < 0 ? " − " : " + ") + cf(Math.abs(c[1])) + x;
    }
    function curve(f) {
      var o = [], X0 = V.x0, X1 = V.x1;
      for (var i = 0; i <= 200; i++) { var x = X0 + ((X1 - X0) * i) / 200; o.push([x, f(x)]); }
      return o;
    }
    function draw() {
      plot.frame();
      var K = plot.K;
      var ls = leastSquares(), ch = chebyshev(), sl = ls ? stats(ls.f) : null, sc = ch ? stats(ch.f) : null;
      if (ch && show.band) {
        var e = sc.max, up = curve(function (x) { return ch.f(x) + e; }), dn = curve(function (x) { return ch.f(x) - e; }).reverse();
        M.el("polygon", { style: "fill:var(--mm-b);opacity:.12;stroke:none", points: up.concat(dn).map(function (p) { return plot.sx(p[0]).toFixed(1) + "," + plot.sy(p[1]).toFixed(1); }).join(" ") }, plot.data);
      }
      if (show.res)
        pts.forEach(function (p) {
          if (ls && show.ls) M.el("line", { class: "mm-a", style: "stroke-width:1.5;stroke-dasharray:3 2", x1: plot.sx(p[0]) - 3 * K, y1: plot.sy(p[1]), x2: plot.sx(p[0]) - 3 * K, y2: plot.sy(ls.f(p[0])) }, plot.data);
          if (ch && show.ch) M.el("line", { class: "mm-b", style: "stroke-width:1.5;stroke-dasharray:3 2", x1: plot.sx(p[0]) + 3 * K, y1: plot.sy(p[1]), x2: plot.sx(p[0]) + 3 * K, y2: plot.sy(ch.f(p[0])) }, plot.data);
        });
      if (showRef) { var rp = plot.path(curve(REF.f), "mm-curve"); rp.style.strokeDasharray = "5 4"; rp.style.strokeWidth = "1.6"; }
      if (ls && show.ls) plot.path(curve(ls.f), "mm-a");
      if (ch && show.ch) plot.path(curve(ch.f), "mm-b");
      pts.forEach(function (p) {
        if (ch && (show.ch || show.band) && Math.abs(Math.abs(p[1] - ch.f(p[0])) - sc.max) < 1e-6 * Math.max(1, sc.max)) {
          var ring = plot.circle(p[0], p[1], 11, "mm-handle");
          ring.setAttribute("stroke", "var(--mm-b)");
          ring.style.strokeWidth = "2";
        }
        plot.circle(p[0], p[1], 6, "mm-dot");
      });
      var rows = [["Least squares", "var(--mm-a)", label(ls), sl], ["Chebyshev", "var(--mm-b)", label(ch), sc]];
      function cell(r, i, k) {
        var o = rows[1 - i][3], s = r[3];
        return "<td" + (s && o && s[k] <= o[k] + 1e-9 ? " style=\"font-weight:600\"" : "") + ">" + (s ? M.fmt(s[k], 3) : "—") + "</td>";
      }
      var html = rows.map(function (r, i) {
        return "<tr><td><span class=\"mm-key\" style=\"border-color:" + r[1] + "\"></span>" + r[0] + "<br><span style=\"color:var(--global-text-color-light);margin-left:1.75rem;white-space:nowrap\">" + r[2] + "</span></td>" + cell(r, i, "sse") + cell(r, i, "max") + "</tr>";
      }).join("");
      if (showRef) {
        var sr = stats(REF.f);
        html += "<tr><td><span class=\"mm-key mm-dash\" style=\"border-color:var(--global-text-color)\"></span>Submodels fitted separately (Section 3.4)<br><span style=\"color:var(--global-text-color-light);margin-left:1.75rem;white-space:nowrap\">d = 1.104v + 0.0542v²</span></td><td>" + M.fmt(sr.sse, 3) + "</td><td>" + M.fmt(sr.max, 3) + "</td></tr>";
      }
      document.getElementById("ft-out").innerHTML = html;
    }
    // controls
    var box = document.getElementById("ft-controls");
    var modelSel = M.select(M.group(box, "Model"), Object.keys(MODELS).map(function (k) { return [k, MODELS[k].name]; }), model, function (v) { model = v; draw(); });
    var gs = M.group(box, "Show");
    M.checkbox(gs, "<span style=\"color:var(--mm-a)\">Least squares</span>", show.ls, function (c) { show.ls = c; draw(); });
    M.checkbox(gs, "<span style=\"color:var(--mm-b)\">Chebyshev</span>", show.ch, function (c) { show.ch = c; draw(); });
    M.checkbox(gs, "Deviations", show.res, function (c) { show.res = c; draw(); });
    M.checkbox(gs, "Chebyshev band", show.band, function (c) { show.band = c; draw(); });
    var gd = M.group(box, "Data");
    Object.keys(sets).forEach(function (k) {
      var b = M.button(gd, sets[k].name, function () {
        setView(sets[k].view); pts = sets[k].pts.map(function (p) { return p.slice(); });
        if (sets[k].model) { model = sets[k].model; modelSel.value = model; }
        showRef = !!sets[k].ref;
        draw();
      });
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
