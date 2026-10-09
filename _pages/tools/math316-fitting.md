---
layout: page
title: Least squares or Chebyshev?
description: An interactive tool for MATH 316, weeks 5–6. Compare two criteria for fitting a model to data.
permalink: /teaching/math316/tools/fitting/
---

<style>
  .ft-wrap { border: 1px solid var(--global-divider-color); border-radius: 6px; padding: 0.8rem; margin: 1rem 0 1.5rem; }
  .ft-plot { display: block; width: 100%; height: auto; touch-action: none; user-select: none; -webkit-user-select: none; }
  .ft-plot line, .ft-plot circle { vector-effect: non-scaling-stroke; }
  .ft-plot .ft-grid { stroke: var(--global-divider-color); stroke-width: 1; }
  .ft-plot .ft-axis { stroke: var(--global-text-color-light); stroke-width: 1; }
  .ft-plot text { fill: var(--global-text-color-light); font-family: inherit; }
  .ft-plot .ft-pt { fill: var(--global-text-color); stroke: var(--global-bg-color); stroke-width: 2; cursor: grab; }
  .ft-plot .ft-pt.ft-drag { cursor: grabbing; }
  .ft-plot .ft-hit { fill: transparent; cursor: grab; }
  .ft-plot .ft-ring { fill: none; stroke: var(--ft-cheb); stroke-width: 2; }
  .ft-plot .ft-ls { stroke: var(--ft-ls); stroke-width: 2.5; fill: none; }
  .ft-plot .ft-ch { stroke: var(--ft-cheb); stroke-width: 2.5; fill: none; }
  .ft-plot .ft-band { fill: var(--ft-cheb); opacity: 0.12; }
  .ft-plot .ft-res-ls { stroke: var(--ft-ls); stroke-width: 1.5; stroke-dasharray: 3 2; }
  .ft-plot .ft-res-ch { stroke: var(--ft-cheb); stroke-width: 1.5; stroke-dasharray: 3 2; }
  .ft-wrap { --ft-ls: var(--global-theme-color); --ft-cheb: #d9772b; }
  .ft-controls { display: flex; flex-wrap: wrap; gap: 0.6rem 1.6rem; margin: 0.7rem 0 0.2rem; font-size: 0.9rem; }
  .ft-controls fieldset { border: 0; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 0.3rem 0.9rem; align-items: center; }
  .ft-controls legend { float: left; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--global-text-color-light); margin: 0 0.4rem 0 0; padding: 0; width: auto; }
  .ft-controls label { margin: 0; cursor: pointer; }
  .ft-controls button { font: inherit; font-size: 0.85rem; padding: 0.15rem 0.6rem; border: 1px solid var(--global-divider-color); border-radius: 4px; background: transparent; color: var(--global-text-color); cursor: pointer; }
  .ft-controls button:hover { border-color: var(--global-theme-color); }
  .ft-help { font-size: 0.85rem; color: var(--global-text-color-light); margin: 0.4rem 0 0; }
  .ft-table { width: 100%; font-size: 0.9rem; margin: 0.8rem 0 0; border-collapse: collapse; }
  .ft-table th, .ft-table td { padding: 0.35rem 0.5rem; border-top: 1px solid var(--global-divider-color); text-align: left; vertical-align: top; }
  .ft-table th { font-weight: 500; color: var(--global-text-color-light); font-size: 0.8rem; }
  .ft-table td.ft-num, .ft-table th.ft-num { text-align: right; font-variant-numeric: tabular-nums; }
  .ft-table .ft-best { font-weight: 600; }
  .ft-eq { display: block; color: var(--global-text-color-light); margin-left: 1.8rem; white-space: nowrap; }
  .ft-key { display: inline-block; width: 1.4rem; height: 0; border-top: 3px solid; vertical-align: middle; margin-right: 0.4rem; }
  .ft-note { font-size: 0.875rem; color: var(--global-text-color-light); border-left: 3px solid var(--global-theme-color); padding: 0.4rem 0.8rem; margin: 1.5rem 0; }
  @media (max-width: 576px) {
    .ft-table { font-size: 0.8rem; }
    .ft-table th, .ft-table td { padding: 0.3rem 0.25rem; }
  }
</style>

[← MATH 316]({{ '/teaching/math316/' | relative_url }})

Given some data and a model with unknown parameters, which parameters give the "best" fit? The answer depends on what we mean by best. This tool compares two criteria from the lectures for a straight line or a line through the origin. It supports learning outcomes 2 and 3.

<div class="ft-wrap">
  <svg class="ft-plot" id="ft-plot" viewBox="0 0 640 400" role="img" aria-label="Scatter plot of data points with the least-squares and Chebyshev fits"></svg>
  <div class="ft-controls">
    <fieldset>
      <legend>Model</legend>
      <label><input type="radio" name="ft-model" value="line" checked> y = a + bx</label>
      <label><input type="radio" name="ft-model" value="prop"> y = kx</label>
    </fieldset>
    <fieldset>
      <legend>Show</legend>
      <label><input type="checkbox" id="ft-show-ls" checked> Least squares</label>
      <label><input type="checkbox" id="ft-show-ch" checked> Chebyshev</label>
      <label><input type="checkbox" id="ft-show-res"> Deviations</label>
      <label><input type="checkbox" id="ft-show-band"> Chebyshev band</label>
    </fieldset>
    <fieldset>
      <legend>Data</legend>
      <button type="button" data-preset="linear">Nearly linear</button>
      <button type="button" data-preset="outlier">With an outlier</button>
      <button type="button" data-preset="curved">Curved</button>
    </fieldset>
  </div>
  <p class="ft-help">Drag a point to move it. Click an empty spot to add a point; double-click a point, or drag it off the plot, to remove it. Circled points are where the Chebyshev fit reaches its largest deviation.</p>
  <table class="ft-table">
    <thead>
      <tr><th>Criterion and fitted model</th><th class="ft-num">Sum of squared deviations</th><th class="ft-num">Largest absolute deviation</th></tr>
    </thead>
    <tbody id="ft-out"></tbody>
  </table>
</div>

## Things to try

1. Start with **Nearly linear**. The two fits almost coincide. Why would you expect that?
2. Choose **With an outlier**, or drag one point well away from the rest. Which fit moves more? Which fit would you trust, and why?
3. Compare the last two columns of the table as you move points. Can the least-squares fit ever have a smaller largest deviation than the Chebyshev fit? Can the Chebyshev fit ever have a smaller sum of squares?
4. Turn on the **Chebyshev band**. How many points touch its edges, and on which side of the line does each lie, from left to right? Move a point and see whether the pattern survives.
5. Switch to **y = kx** with the **Curved** data. Is either fit adequate? What would you try next?
6. Describe one modelling problem where the largest deviation matters more than the typical one, and one where the reverse is true.

## How the fits are computed

For data $$(x_i, y_i)$$, $$i = 1, \dots, m$$, and a model $$y = f(x)$$:

- **Least squares** chooses the parameters that minimize the sum of squared deviations, $$S = \sum_{i=1}^{m} \left[ y_i - f(x_i) \right]^2$$. Setting the partial derivatives of $$S$$ to zero gives the normal equations, which have a closed-form solution.
- **Chebyshev** chooses the parameters that minimize the largest absolute deviation, $$c = \max_i \lvert y_i - f(x_i) \rvert$$. For $$f(x) = a + bx$$ this is the linear program: minimize $$c$$ subject to $$-c \le y_i - (a + b x_i) \le c$$ for every $$i$$. With a handful of points, the tool solves it by a direct search, checking every set of three points (two for $$y = kx$$) where the deviations alternate in sign.

<p class="ft-note">The tool runs entirely in your browser; nothing is recorded or sent anywhere. It is a learning aid and is not assessed.</p>

<script>
  (function () {
    var NS = "http://www.w3.org/2000/svg";
    var W = 640, H = 400, L = 44, R = 16, T = 14, B = 34, K = 1;
    var X0 = 0, X1 = 10, Y0 = 0, Y1 = 10, MAXPTS = 20, MINPTS = 3;
    var presets = {
      linear: [[1, 1.5], [2, 2.3], [3, 3.2], [4, 3.8], [5, 5.2], [6, 5.7], [7, 6.7], [8, 7.6], [9, 8.6]],
      outlier: [[1, 1.5], [2, 2.3], [3, 3.2], [4, 3.8], [5, 5.2], [6, 9.4], [7, 6.7], [8, 7.6], [9, 8.6]],
      curved: [[1, 0.6], [2, 1.0], [3, 1.6], [4, 2.3], [5, 3.1], [6, 4.1], [7, 5.3], [8, 6.7], [9, 8.4]]
    };
    window.addEventListener("resize", function () { draw(); });
    var pts = presets.linear.map(function (p) { return p.slice(); });
    var model = "line", drag = -1;
    var svg = document.getElementById("ft-plot"), out = document.getElementById("ft-out");
    var show = { ls: "ft-show-ls", ch: "ft-show-ch", res: "ft-show-res", band: "ft-show-band" };
    function on(k) { return document.getElementById(show[k]).checked; }
    function sx(x) { return L + ((x - X0) / (X1 - X0)) * (W - L - R); }
    function sy(y) { return H - B - ((y - Y0) / (Y1 - Y0)) * (H - T - B); }
    function ix(px) { return X0 + ((px - L) / (W - L - R)) * (X1 - X0); }
    function iy(py) { return Y0 + ((H - B - py) / (H - T - B)) * (Y1 - Y0); }
    function el(name, attrs, parent) {
      var e = document.createElementNS(NS, name);
      for (var k in attrs) e.setAttribute(k, attrs[k]);
      (parent || svg).appendChild(e);
      return e;
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
    function fmt(v, d) { var s = v.toFixed(d); return s === "-" + (0).toFixed(d) ? (0).toFixed(d) : s; }
    function label(fit) {
      if (!fit) return "—";
      if (model === "prop") return "y = " + fmt(fit.b, 3) + "x";
      return "y = " + fmt(fit.a, 3) + (fit.b < 0 ? " − " : " + ") + fmt(Math.abs(fit.b), 3) + "x";
    }
    function layout() {
      // On narrow screens the plot is drawn taller, with larger labels and points, so it stays usable by touch.
      var w = svg.getBoundingClientRect().width || W;
      K = Math.max(1, W / w);
      H = w < 500 ? 560 : 400;
      L = 30 + 14 * K; B = 20 + 14 * K; T = 8 + 6 * K;
      svg.setAttribute("viewBox", "0 0 " + W + " " + H);
      svg.style.fontSize = 12 * K + "px";
    }
    function draw() {
      layout();
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var defs = el("defs", {}), cp = el("clipPath", { id: "ft-clip" }, defs);
      el("rect", { x: L, y: T, width: W - L - R, height: H - T - B }, cp);
      for (var g = 0; g <= 10; g++) {
        el("line", { x1: sx(g), y1: T, x2: sx(g), y2: H - B, class: "ft-grid" });
        el("line", { x1: L, y1: sy(g), x2: W - R, y2: sy(g), class: "ft-grid" });
        if (g % 2 === 0) {
          el("text", { x: sx(g), y: H - B + 16 * K, "text-anchor": "middle" }).textContent = g;
          el("text", { x: L - 7 * K, y: sy(g) + 4 * K, "text-anchor": "end" }).textContent = g;
        }
      }
      el("line", { x1: L, y1: H - B, x2: W - R, y2: H - B, class: "ft-axis" });
      el("line", { x1: L, y1: T, x2: L, y2: H - B, class: "ft-axis" });
      el("text", { x: W - R, y: H - 3, "text-anchor": "end" }).textContent = "x";
      el("text", { x: 4, y: T + 10 * K }).textContent = "y";
      var plot = el("g", { "clip-path": "url(#ft-clip)" });
      var ls = leastSquares(), ch = chebyshev();
      var sl = ls ? stats(ls.f) : null, sc = ch ? stats(ch.f) : null;
      if (ch && on("band")) {
        var e = sc.max;
        el("polygon", { class: "ft-band", points: [[X0, ch.f(X0) + e], [X1, ch.f(X1) + e], [X1, ch.f(X1) - e], [X0, ch.f(X0) - e]].map(function (p) { return sx(p[0]) + "," + sy(p[1]); }).join(" ") }, plot);
      }
      if (on("res")) {
        pts.forEach(function (p) {
          if (ls && on("ls")) el("line", { class: "ft-res-ls", x1: sx(p[0]) - 3 * K, y1: sy(p[1]), x2: sx(p[0]) - 3 * K, y2: sy(ls.f(p[0])) }, plot);
          if (ch && on("ch")) el("line", { class: "ft-res-ch", x1: sx(p[0]) + 3 * K, y1: sy(p[1]), x2: sx(p[0]) + 3 * K, y2: sy(ch.f(p[0])) }, plot);
        });
      }
      if (ls && on("ls")) el("line", { class: "ft-ls", x1: sx(X0), y1: sy(ls.f(X0)), x2: sx(X1), y2: sy(ls.f(X1)) }, plot);
      if (ch && on("ch")) el("line", { class: "ft-ch", x1: sx(X0), y1: sy(ch.f(X0)), x2: sx(X1), y2: sy(ch.f(X1)) }, plot);
      pts.forEach(function (p, i) {
        if (ch && (on("ch") || on("band")) && Math.abs(Math.abs(p[1] - ch.f(p[0])) - sc.max) < 1e-6 * Math.max(1, sc.max))
          el("circle", { class: "ft-ring", cx: sx(p[0]), cy: sy(p[1]), r: 11 * K });
        el("circle", { class: "ft-pt" + (i === drag ? " ft-drag" : ""), cx: sx(p[0]), cy: sy(p[1]), r: 6 * K });
      });
      var rows = [["Least squares", "var(--ft-ls)", ls, sl], ["Chebyshev", "var(--ft-cheb)", ch, sc]];
      out.innerHTML = rows.map(function (r, i) {
        var o = rows[1 - i][3], s = r[3];
        var b1 = s && o && s.sse <= o.sse + 1e-9 ? " ft-best" : "", b2 = s && o && s.max <= o.max + 1e-9 ? " ft-best" : "";
        return "<tr><td><span class=\"ft-key\" style=\"border-color:" + r[1] + "\"></span>" + r[0] + "<span class=\"ft-eq\">" + label(r[2]) + "</span>" +
          "</td><td class=\"ft-num" + b1 + "\">" + (s ? fmt(s.sse, 3) : "—") + "</td><td class=\"ft-num" + b2 + "\">" + (s ? fmt(s.max, 3) : "—") + "</td></tr>";
      }).join("");
    }
    function svgPoint(evt) {
      var p = svg.createSVGPoint();
      p.x = evt.clientX; p.y = evt.clientY;
      return p.matrixTransform(svg.getScreenCTM().inverse());
    }
    function hit(p) {
      var best = -1, bd = 16 * K * 16 * K;
      pts.forEach(function (q, i) { var dx = sx(q[0]) - p.x, dy = sy(q[1]) - p.y, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = i; } });
      return best;
    }
    function inside(x, y) { return x >= X0 && x <= X1 && y >= Y0 && y <= Y1; }
    function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
    svg.addEventListener("pointerdown", function (evt) {
      var p = svgPoint(evt), i = hit(p);
      if (i >= 0) { drag = i; svg.setPointerCapture(evt.pointerId); evt.preventDefault(); draw(); return; }
      var x = ix(p.x), y = iy(p.y);
      if (inside(x, y) && pts.length < MAXPTS) { pts.push([Math.round(x * 10) / 10, Math.round(y * 10) / 10]); draw(); }
    });
    svg.addEventListener("pointermove", function (evt) {
      if (drag < 0) return;
      var p = svgPoint(evt);
      pts[drag] = [clamp(ix(p.x), X0 - 1, X1 + 1), clamp(iy(p.y), Y0 - 1, Y1 + 1)];
      draw();
    });
    function release() {
      if (drag < 0) return;
      var p = pts[drag];
      if (!inside(p[0], p[1])) {
        if (pts.length > MINPTS) pts.splice(drag, 1);
        else pts[drag] = [clamp(p[0], X0, X1), clamp(p[1], Y0, Y1)];
      }
      drag = -1;
      draw();
    }
    svg.addEventListener("pointerup", release);
    svg.addEventListener("pointercancel", release);
    svg.addEventListener("dblclick", function (evt) {
      var i = hit(svgPoint(evt));
      if (i >= 0 && pts.length > MINPTS) { pts.splice(i, 1); draw(); }
    });
    document.querySelectorAll("input[name=ft-model]").forEach(function (r) {
      r.addEventListener("change", function () { model = r.value; draw(); });
    });
    Object.keys(show).forEach(function (k) { document.getElementById(show[k]).addEventListener("change", draw); });
    document.querySelectorAll("[data-preset]").forEach(function (btn) {
      btn.addEventListener("click", function () { pts = presets[btn.getAttribute("data-preset")].map(function (p) { return p.slice(); }); draw(); });
    });
    draw();
  })();
</script>
