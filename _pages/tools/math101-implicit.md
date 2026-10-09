---
layout: page
title: Implicit differentiation
description: An interactive tool for MATH 101, week 7. Draw curves defined by equations in x and y, and find the slope dy/dx and the tangent line at any point by implicit differentiation.
permalink: /teaching/math101/tools/implicit/
---

[← MATH 101]({{ '/teaching/math101/' | relative_url }})

Many curves, such as the circle $$x^2 + y^2 = 25$$ or the folium of Descartes $$x^3 + y^3 = 6xy$$, are defined by an equation in $$x$$ and $$y$$ rather than by a formula $$y = f(x)$$. **Implicit differentiation** finds $$dy/dx$$ anyway: differentiate both sides with respect to $$x$$, treating $$y$$ as a function of $$x$$ and using the Chain Rule, then solve for $$dy/dx$$. This tool draws such a curve and the tangent line at a point you drag along it, and marks the points where the tangent is horizontal or vertical. It supports learning outcome 6.

<div class="mm-wrap" id="im">
  <div class="mm-controls" id="im-top"></div>
  <div class="mm-controls" id="im-input"></div>
  <svg id="im-plot" style="max-width:700px;margin:0 auto" role="img" aria-label="Curve defined by the equation, with the tangent line at a point"></svg>
  <div class="mm-controls" id="im-controls"></div>
  <p class="mm-help">Type an equation in <em>x</em> and <em>y</em>, such as <code>x^2 + y^2 = 25</code> or <code>x^3 + y^3 = 6xy</code>. Click near the curve to put the point there, and drag it along the curve.</p>
  <p class="mm-readout" id="im-out"></p>
</div>

## Things to try

1. For the circle $$x^2 + y^2 = 25$$, implicit differentiation gives $$dy/dx = -x/y$$. Check the slope at $$(3, 4)$$ and the tangent line $$3x + 4y = 25$$. Where is the tangent horizontal? Vertical? What does the formula $$-x/y$$ do there?
2. For the folium of Descartes $$x^3 + y^3 = 6xy$$, check that the tangent at $$(3, 3)$$ is $$x + y = 6$$. Find the point in the first quadrant where the tangent is horizontal, and compare it with the textbook's answer.
3. For $$\sin(x + y) = y^2 \cos x$$, find the slope at the origin. Is the curve the graph of a function $$y = f(x)$$ near the origin? Is it near other points?
4. For $$x^4 + y^4 = 16$$, the "fat circle", compare the slope at a point with the slope on the circle $$x^2 + y^2 = 4$$ at the same angle.
5. Explore the three curves from the textbook's figures: $$(x^2 - 1)(x^2 - 4)(x^2 - 9)$$ $$= y^2(y^2 - 4)(y^2 - 9)$$, $$\cos(x - \sin y) = \sin(y - \sin x)$$ and $$\sin(xy) = \sin x + \sin y$$. Why could none of them be written as a single function $$y = f(x)$$?

## How it is computed

Writing the equation as $$G(x, y) = 0$$, where $$G$$ is the left side minus the right side, the curve is drawn by marching squares: $$G$$ is evaluated on a grid, and in each grid square where $$G$$ changes sign the curve is drawn as a short segment, with its ends placed by linear interpolation. Implicit differentiation of $$G(x, y) = 0$$ gives

$$\frac{dy}{dx} = -\frac{\partial G/\partial x}{\partial G/\partial y},$$

with the partial derivatives approximated by central differences. The point you drag is moved onto the curve by Newton's method. Horizontal tangents are the points where $$G = 0$$ and $$\partial G/\partial x = 0$$, and vertical tangents those where $$G = 0$$ and $$\partial G/\partial y = 0$$; both are found by Newton's method for two equations.

<p class="mm-note">The tool runs entirely in your browser; nothing is recorded or sent anywhere. It is a learning aid and is not assessed.</p>

<script src="{{ '/assets/js/teaching/mm-tools.js' | relative_url }}"></script>
<script>
  (function () {
    var M = window.MMTools;
    var presets = {
      circle: { name: "circle x² + y² = 25", eq: "x^2 + y^2 = 25", p: [3, 4], d: "-x/y", win: [-7, 7, -7, 7] },
      folium: { name: "folium of Descartes x³ + y³ = 6xy", eq: "x^3 + y^3 = 6xy", p: [3, 3], d: "(2y - x^2)/(y^2 - 2x)", win: [-5, 5, -5, 5] },
      sin: { name: "sin(x + y) = y² cos x", eq: "sin(x + y) = y^2 cos x", p: [0, 0], d: "(y^2 sin x + cos(x + y))/(2y cos x - cos(x + y))", win: [-2, 2, -2, 2] },
      fat: { name: "fat circle x⁴ + y⁴ = 16", eq: "x^4 + y^4 = 16", p: [1, 1.96799], d: "-x^3/y^3", win: [-3, 3, -3, 3] },
      fig7: { name: "(x² − 1)(x² − 4)(x² − 9) = y²(y² − 4)(y² − 9)", eq: "(x^2 - 1)(x^2 - 4)(x^2 - 9) = y^2(y^2 - 4)(y^2 - 9)", p: [0, 2.5], win: [-4, 4, -4, 4] },
      fig8: { name: "cos(x − sin y) = sin(y − sin x)", eq: "cos(x - sin y) = sin(y - sin x)", p: [0, 1.5708], win: [-15, 15, -15, 15], n: 300 },
      fig9: { name: "sin(xy) = sin x + sin y", eq: "sin(xy) = sin x + sin y", p: [0, 0], win: [-12, 12, -12, 12], n: 300 },
    };
    var key = "circle", P = presets[key], G = null, D = null, pt = [3, 4], showHV = true;
    var plot = new M.Plot(document.getElementById("im-plot"), { x0: -7, x1: 7, y0: -7, y1: 7, gx: 1, gy: 1, xname: "x", yname: "y", aspect: 1, aspectNarrow: 1, left: 26 });
    function num(v, d) { if (!isFinite(v)) return "undefined"; if (Math.abs(v) < 1e-9) return "0"; return String(+v.toPrecision(d || 5)).replace("-", "−"); }
    function equal() {
      var o = plot.o, w = plot.svg.getBoundingClientRect().width, K = w > 0 ? 640 / w : 1;
      var inner = 640 - (o.left + 10 + 12) * K, a = ((inner * (o.y1 - o.y0)) / (o.x1 - o.x0) + 66 * K) / 640;
      o.aspect = o.aspectNarrow = Math.max(0.5, Math.min(1.5, a));
    }
    function scale() { return (plot.o.x1 - plot.o.x0) * 1e-6; }
    function Gx(x, y) { var h = scale(); return (G(x + h, y) - G(x - h, y)) / (2 * h); }
    function Gy(x, y) { var h = scale(); return (G(x, y + h) - G(x, y - h)) / (2 * h); }
    // move (x, y) onto the curve along the gradient
    function project(x, y) {
      for (var k = 0; k < 30; k++) {
        var g = G(x, y), gx = Gx(x, y), gy = Gy(x, y), n2 = gx * gx + gy * gy;
        if (!isFinite(g) || !(n2 > 0)) return null;
        x -= (g * gx) / n2; y -= (g * gy) / n2;
        if (Math.abs(g) < 1e-12 * (1 + n2)) break;
      }
      return isFinite(G(x, y)) && Math.abs(G(x, y)) < 1e-6 * (1 + Math.sqrt(Gx(x, y) ** 2 + Gy(x, y) ** 2)) ? [x, y] : null;
    }
    var cache = { key: "", segs: [] };
    function contour() {
      var o = plot.o, n = P.n && P.eq === eqIn.input.value ? P.n : 220, ck = eqIn.input.value + "|" + o.x0 + o.x1 + o.y0 + o.y1 + n;
      if (cache.key === ck) return cache.segs;
      var dx = (o.x1 - o.x0) / n, dy = (o.y1 - o.y0) / n, V = [], i, j;
      // an exact zero at a grid point (y = x through the corners) would be missed by the sign tests: nudge it
      for (i = 0; i <= n; i++) { V.push([]); for (j = 0; j <= n; j++) { var gv = G(o.x0 + i * dx, o.y0 + j * dy); V[i].push(gv === 0 ? 1e-300 : gv); } }
      var segs = [];
      function cross(x1, y1, v1, x2, y2, v2) { var t = v1 / (v1 - v2); return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)]; }
      for (i = 0; i < n; i++)
        for (j = 0; j < n; j++) {
          var x = o.x0 + i * dx, y = o.y0 + j * dy, a = V[i][j], b = V[i + 1][j], c = V[i + 1][j + 1], d = V[i][j + 1];
          if (![a, b, c, d].every(isFinite)) continue;
          var e = [];
          if (a * b < 0) e.push(cross(x, y, a, x + dx, y, b));
          if (b * c < 0) e.push(cross(x + dx, y, b, x + dx, y + dy, c));
          if (c * d < 0) e.push(cross(x + dx, y + dy, c, x, y + dy, d));
          if (d * a < 0) e.push(cross(x, y + dy, d, x, y, a));
          if (e.length === 2) segs.push([e[0], e[1]]);
          else if (e.length === 4) { segs.push([e[0], e[1]]); segs.push([e[2], e[3]]); }
        }
      cache = { key: ck, segs: segs, hv: null };
      return segs;
    }
    // Points on the curve where H (a partial derivative of G) changes sign. Each is pinned down by bisection along
    // the curve: the midpoint of the current piece is pushed back onto the curve, and the half where H changes sign is kept.
    function special(segs, H, gtyp) {
      var out = [], o = plot.o, tol = (o.x1 - o.x0) * 1e-4;
      segs.forEach(function (s) {
        var u = s[0], v = s[1], hu = H(u[0], u[1]), hv = H(v[0], v[1]);
        if (!isFinite(hu) || !isFinite(hv) || hu * hv > 0 || (hu === 0 && hv === 0)) return;
        if (hu === 0) v = u; else if (hv === 0) u = v;
        for (var k = 0; k < 50 && u !== v; k++) {
          var mx = (u[0] + v[0]) / 2, my = (u[1] + v[1]) / 2, q = project(mx, my) || [mx, my], hm = H(q[0], q[1]);
          if (!isFinite(hm)) break;
          if (hm === 0) { u = v = q; break; }
          if (hu * hm < 0) v = q; else { u = q; hu = hm; }
        }
        // rounding makes the sign of H unreliable very close to its zero, so prefer a nearby round point that is
        // on the curve and where H is at least as small (the fat circle's top is (0, 2), not (0.0002, 2))
        var p = [(u[0] + v[0]) / 2, (u[1] + v[1]) / 2], W = o.x1 - o.x0, hp = Math.abs(H(p[0], p[1]));
        for (var dd = 0; dd <= 5; dd++) {
          var f10 = Math.pow(10, dd), r = [Math.round(p[0] * f10) / f10 + 0, Math.round(p[1] * f10) / f10 + 0];
          if (Math.abs(r[0] - p[0]) + Math.abs(r[1] - p[1]) < 2e-4 * W && Math.abs(G(r[0], r[1])) <= 1e-9 * gtyp * W && Math.abs(H(r[0], r[1])) <= Math.max(hp, 1e-9 * gtyp)) { p = r; break; }
        }
        var gr = Math.hypot(Gx(p[0], p[1]), Gy(p[0], p[1]));
        // H must really vanish there (not merely jump), and the point is singular if the whole gradient vanishes
        if (Math.abs(H(p[0], p[1])) > 1e-3 * gtyp) return;
        p.singular = gr < 1e-3 * gtyp;
        if (plot.inside(p[0], p[1]) && !out.some(function (r2) { return Math.abs(r2[0] - p[0]) + Math.abs(r2[1] - p[1]) < tol; })) out.push(p);
      });
      return out;
    }
    // typical size of the gradient along the curve, to judge what counts as zero
    function gradTyp(segs) {
      var g = [];
      for (var i = 0; i < segs.length; i += Math.max(1, Math.floor(segs.length / 400))) { var s = segs[i], v = Math.hypot(Gx(s[0][0], s[0][1]), Gy(s[0][0], s[0][1])); if (isFinite(v)) g.push(v); }
      g.sort(function (a, b) { return a - b; });
      return g.length ? g[Math.floor(g.length / 2)] || 1 : 1;
    }
    function specials(segs) {
      if (cache.hv) return cache.hv;
      var gt = gradTyp(segs), hz = special(segs, Gx, gt), vt = special(segs, Gy, gt), sg = [];
      // a point where both partial derivatives vanish is singular: it is neither a horizontal nor a vertical tangent
      hz.concat(vt).forEach(function (p) { if (p.singular && !sg.some(function (r) { return Math.abs(r[0] - p[0]) + Math.abs(r[1] - p[1]) < (plot.o.x1 - plot.o.x0) * 1e-3; })) sg.push(p); });
      cache.hv = { hz: hz.filter(function (p) { return !p.singular; }), vt: vt.filter(function (p) { return !p.singular; }), sg: sg };
      return cache.hv;
    }
    function draw() {
      equal();
      plot.frame();
      var out = document.getElementById("im-out");
      if (!G) { out.innerHTML = "Enter an equation in <em>x</em> and <em>y</em>."; return; }
      var segs = contour(), d = "", o = plot.o;
      if (!segs.length) { out.innerHTML = "No curve was found in this window: the equation may have no solutions here, or only isolated points."; return; }
      segs.forEach(function (s) { d += "M" + plot.sx(s[0][0]).toFixed(1) + "," + plot.sy(s[0][1]).toFixed(1) + "L" + plot.sx(s[1][0]).toFixed(1) + "," + plot.sy(s[1][1]).toFixed(1); });
      M.el("path", { d: d, class: "mm-a", style: "stroke-linecap:round" }, plot.data);
      var t = "";
      if (showHV && segs.length < 20000) {
        var sp = specials(segs), hz = sp.hz, vt = sp.vt;
        sp.sg.forEach(function (q) { plot.circle(q[0], q[1], 4.5, "mm-dot"); });
        hz.forEach(function (q) { var c = plot.circle(q[0], q[1], 4.5, "mm-eq-u"); c.style.stroke = "var(--mm-c)"; });
        vt.forEach(function (q) { var c = plot.circle(q[0], q[1], 4.5, "mm-eq-u"); c.style.stroke = "var(--mm-b)"; });
        if (hz.length + vt.length <= 12) {
          if (hz.length) t += "Horizontal tangents (green) at " + hz.map(function (q) { return "(" + num(q[0]) + ", " + num(q[1]) + ")"; }).join(", ") + ". ";
          if (vt.length) t += "Vertical tangents (orange) at " + vt.map(function (q) { return "(" + num(q[0]) + ", " + num(q[1]) + ")"; }).join(", ") + ". ";
          if (sp.sg.length) t += "At " + sp.sg.map(function (q) { return "(" + num(q[0]) + ", " + num(q[1]) + ")"; }).join(", ") + " (dot) both partial derivatives are 0: the curve crosses itself or has a cusp there, and has no single tangent line. ";
        } else t += "Green circles mark horizontal tangents and orange circles vertical tangents. ";
      }
      if (pt) {
        var x = pt[0], y = pt[1], gx = Gx(x, y), gy = Gy(x, y), m = -gx / gy;
        if (Math.abs(gy) > 1e-9 * (Math.abs(gx) + 1e-12) && isFinite(m)) {
          var L = (o.x1 - o.x0);
          var tl = plot.path([[x - L, y - m * L], [x + L, y + m * L]], "mm-b"); tl.style.strokeWidth = "1.8";
          var b = y - m * x, mm = +m.toPrecision(5), bb = Math.abs(b) < 1e-9 ? 0 : +b.toPrecision(5);
          var eq = "<em>y</em> = " + (Math.abs(mm) < 1e-9 ? num(bb) : (mm === 1 ? "" : mm === -1 ? "−" : num(mm)) + "<em>x</em>" + (bb === 0 ? "" : (bb < 0 ? " − " : " + ") + num(Math.abs(bb))));
          t = "At (" + num(x) + ", " + num(y) + "): <em>dy</em>/<em>dx</em> = <b>" + num(m) + "</b>, and the tangent line is " + eq + "." +
            (D && P.eq === eqIn.input.value ? " The textbook's formula <em>y</em>′ = " + P.dtxt + " gives " + num(D(x, y)) + "." : "") + " " + t;
        } else if (Math.abs(gx) > 1e-6 * gradTyp(contour())) {
          var vl = plot.path([[x, o.y0], [x, o.y1]], "mm-b"); vl.style.strokeWidth = "1.8";
          t = "At (" + num(x) + ", " + num(y) + ") the tangent line is vertical, <em>x</em> = " + num(x) + ", and <em>dy</em>/<em>dx</em> is undefined. " + t;
        } else t = "At (" + num(x) + ", " + num(y) + ") both partial derivatives vanish, so the curve has no single tangent line there. " + t;
        var c = plot.circle(x, y, 6, "mm-handle"); c.setAttribute("stroke", "var(--mm-b)");
      } else t = "Click near the curve to choose a point. " + t;
      out.innerHTML = t;
    }
    // controls
    var top = document.getElementById("im-top"), inp = document.getElementById("im-input"), box = document.getElementById("im-controls");
    M.select(M.group(top, "Example"), Object.keys(presets).map(function (k) { return [k, presets[k].name]; }), key, function (v) { load(v); });
    var eqIn = M.textInput(inp, "Equation", P.eq, function (v) { setEq(v); cache.key = ""; if (pt && G) pt = project(pt[0], pt[1]); draw(); }, "18rem");
    M.checkbox(M.group(box, "Show"), "Horizontal and vertical tangents", showHV, function (v) { showHV = v; draw(); });
    M.zoomControls(box, plot, function () { return P.win; }, function () { cache.key = ""; draw(); });
    function setEq(v) {
      var parts = v.split("=");
      if (parts.length > 2) { G = null; eqIn.showError("Use one = sign"); return; }
      try {
        var l = M.expr(parts[0], ["x", "y"]), r = parts.length === 2 ? M.expr(parts[1], ["x", "y"]) : function () { return 0; };
        G = function (x, y) { return l(x, y) - r(x, y); }; eqIn.showError("");
      } catch (e) { G = null; eqIn.showError(e.message); }
    }
    function load(k) {
      key = k; P = presets[k];
      eqIn.set(P.eq); setEq(P.eq); cache.key = "";
      D = P.d ? M.expr(P.d, ["x", "y"]) : null;
      P.dtxt = P.d ? P.d.replace(/\^2/g, "²").replace(/\^3/g, "³").replace(/-/g, "−") : "";
      M.setWindow(plot, P.win);
      pt = project(P.p[0], P.p[1]);
      draw();
    }
    // click or drag to move the point onto the curve
    var svg = plot.svg, dragging = false;
    function moveTo(evt) { var p = plot.at(evt); if (!G) return; var q = project(p.x, p.y); if (q && plot.inside(q[0], q[1])) { pt = q; draw(); } }
    svg.addEventListener("pointerdown", function (evt) { var p = plot.at(evt); if (!plot.inside(p.x, p.y)) return; dragging = true; svg.setPointerCapture(evt.pointerId); evt.preventDefault(); moveTo(evt); });
    svg.addEventListener("pointermove", function (evt) { if (dragging) moveTo(evt); });
    svg.addEventListener("pointerup", function () { dragging = false; });
    svg.addEventListener("pointercancel", function () { dragging = false; });
    M.onResize(function () { cache.key = ""; draw(); });
    load(key);
  })();
</script>
