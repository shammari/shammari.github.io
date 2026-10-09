---
layout: page
title: Optimization problems
description: An interactive tool for MATH 101, week 11. Explore the textbook's optimization problems (fencing a field, designing a can, the closest point on a curve, crossing a river, a rectangle in a semicircle and a store's pricing) and find the best choice by calculus.
permalink: /teaching/math101/tools/optimization/
---

[← MATH 101]({{ '/teaching/math101/' | relative_url }})

An optimization problem asks for the largest or smallest value of a quantity: the most area, the least material, the shortest time. The method is always the same. Express the quantity as a function of one variable, find the domain, find the critical numbers, and decide which gives the maximum or minimum, using the Closed Interval Method, the First Derivative Test or the Second Derivative Test. This tool lets you try different choices by hand before the calculus finds the best one. It supports learning outcome 9.

<div class="mm-wrap" id="op">
  <div class="mm-controls" id="op-top"></div>
  <div class="mm-panels mm-2">
    <svg id="op-pic" role="img" aria-label="Picture of the current choice"></svg>
    <svg id="op-graph" role="img" aria-label="Graph of the quantity to optimize"></svg>
  </div>
  <div class="mm-controls" id="op-controls"></div>
  <div class="mm-readout" id="op-out"></div>
</div>

## Things to try

1. **Fencing a field.** With 2400 ft of fencing and no fence along the river, try a few depths and record the areas, as the textbook does. Which depth seems best? Tick **show the optimum** to check: the textbook's answer is a field 600 ft deep and 1200 ft wide. How does the best depth change with the length of fencing?
2. **Designing a can.** For a can holding 1 L, which radius uses the least metal? Compare the best height with the best radius. Does the ratio change if the volume changes?
3. **The closest point.** Which point on the parabola $$y^2 = 2x$$ is closest to $$(1, 4)$$? Why is it easier to minimize the square of the distance?
4. **Crossing a river.** The river is 3 km wide, the destination is 8 km downstream, and you row at 6 km/h and run at 8 km/h. Where should you land? What happens if you can run much faster, or row faster than you run?
5. **A rectangle in a semicircle.** For any radius $$r$$, the largest area is $$r^2$$. What shape is the best rectangle?
6. **A store's pricing.** Each rebate of 10 dollars sells 20 more televisions a week. Which rebate maximizes revenue? Compare with the textbook's answer, a rebate of 125 dollars.

## How it is computed

Each problem has a formula for the quantity in terms of the slider's variable, taken from the textbook. The graph is that function on its domain. The optimum is found numerically, by a fine search followed by golden-section refinement, and compared with the exact answer from calculus shown in the readout.

<p class="mm-note">The tool runs entirely in your browser; nothing is recorded or sent anywhere. It is a learning aid and is not assessed.</p>

<script src="{{ '/assets/js/teaching/mm-tools.js' | relative_url }}"></script>
<script>
  (function () {
    var M = window.MMTools, PI = Math.PI;
    function num(v, d) { if (!isFinite(v)) return "undefined"; if (Math.abs(v) < 1e-10) return "0"; var s = Math.abs(v) >= 1e4 ? Math.round(v).toLocaleString("en-US") : String(+v.toPrecision(d || 4)); return s.replace(/-/g, "−"); }
    function poly(pl, pts, style) { return M.el("polygon", { points: pts.map(function (q) { return pl.sx(q[0]).toFixed(1) + "," + pl.sy(q[1]).toFixed(1); }).join(" "), style: style }, pl.data); }
    // Each problem: parameters, the variable (range), the objective Q(x), max or min, the exact optimum, the picture and the readout.
    var probs = {
      fence: {
        name: "Fencing a field by a river",
        params: { P: ["fencing (ft)", 1000, 4000, 100, 2400, 0] },
        v: "x", vname: "depth x (ft)", lo: function () { return 0; }, hi: function (p) { return p.P / 2; }, x0: 300, goal: "max", qname: "area A (ft²)",
        Q: function (x, p) { return x * (p.P - 2 * x); },
        exact: function (p) { return p.P / 4; },
        text: function (x, p, best) {
          return ["The depth is <em>x</em> and the width is " + num(p.P) + " − 2<em>x</em>, so the area is <em>A</em>(<em>x</em>) = <em>x</em>(" + num(p.P) + " − 2<em>x</em>) = " + num(p.P) + "<em>x</em> − 2<em>x</em><sup>2</sup>, for 0 ≤ <em>x</em> ≤ " + num(p.P / 2) + ".",
            "Now: depth " + num(x) + " ft, width " + num(p.P - 2 * x) + " ft, area <b>" + num(x * (p.P - 2 * x)) + " ft²</b>.",
            best ? "<em>A</em>′(<em>x</em>) = " + num(p.P) + " − 4<em>x</em> = 0 gives <em>x</em> = " + num(p.P / 4) + "; <em>A</em>(0) = <em>A</em>(" + num(p.P / 2) + ") = 0, so the maximum is <b>" + num(p.P * p.P / 8) + " ft²</b>, for a field " + num(p.P / 4) + " ft deep and " + num(p.P / 2) + " ft wide." : ""];
        },
        pic: function (pl, x, p) {
          var W = p.P; // the widest possible field
          M.setWindow(pl, [-0.05 * W, 1.05 * W, -0.56 * W, 0.1 * W]);
          pl.o.xname = ""; pl.o.yname = ""; pl.frame();
          poly(pl, [[-0.05 * W, 0], [1.05 * W, 0], [1.05 * W, 0.1 * W], [-0.05 * W, 0.1 * W]], "fill:var(--mm-c);opacity:.25;stroke:none");
          pl.text(W / 2, 0.05 * W, "river", { "text-anchor": "middle", dy: 4 * pl.K });
          var w = p.P - 2 * x, l = (W - w) / 2;
          poly(pl, [[l, 0], [l + w, 0], [l + w, -x], [l, -x]], "fill:var(--mm-b);fill-opacity:.18;stroke:var(--mm-b);stroke-width:3");
          pl.text(l + w / 2, -x, "width " + num(w), { "text-anchor": "middle", dy: 16 * pl.K });
          pl.text(l + w, -x / 2, "x = " + num(x), { dx: 6 * pl.K });
        },
      },
      can: {
        name: "Designing a can",
        params: { V: ["volume (cm³)", 250, 2000, 50, 1000, 0] },
        v: "r", vname: "radius r (cm)", lo: function () { return 1; }, hi: function () { return 15; }, x0: 3, goal: "min", qname: "surface area A (cm²)",
        Q: function (r, p) { return 2 * PI * r * r + (2 * p.V) / r; },
        exact: function (p) { return Math.cbrt(p.V / (2 * PI)); },
        text: function (r, p, best) {
          var h = p.V / (PI * r * r), ro = Math.cbrt(p.V / (2 * PI));
          return ["The volume is π<em>r</em><sup>2</sup><em>h</em> = " + num(p.V) + ", so <em>h</em> = " + num(p.V) + "/(π<em>r</em><sup>2</sup>) and the surface area is <em>A</em>(<em>r</em>) = 2π<em>r</em><sup>2</sup> + " + num(2 * p.V) + "/<em>r</em>, for <em>r</em> &gt; 0.",
            "Now: radius " + num(r) + " cm, height " + num(h) + " cm, surface area <b>" + num(2 * PI * r * r + (2 * p.V) / r) + " cm²</b>.",
            best ? "<em>A</em>′(<em>r</em>) = 4π<em>r</em> − " + num(2 * p.V) + "/<em>r</em><sup>2</sup> = 0 gives <em>r</em> = ∛(" + num(p.V / 2) + "/π) ≈ " + num(ro) + " cm, and <em>A</em>′ changes from negative to positive there, so the minimum is <b>" + num(6 * PI * ro * ro) + " cm²</b> with height " + num(2 * ro) + " cm = 2<em>r</em>: the height equals the diameter." : ""];
        },
        pic: function (pl, r, p) {
          var h = p.V / (PI * r * r), S = 32;
          M.setWindow(pl, [-S / 2, S / 2, -3, 0.75 * S]);
          pl.o.xname = ""; pl.o.yname = ""; pl.frame();
          var top = Math.min(h, 0.75 * S - 3), e = 0.18 * r;
          poly(pl, [[-r, 0], [r, 0], [r, top], [-r, top]], "fill:var(--mm-b);opacity:.18;stroke:none");
          pl.path([[-r, 0], [-r, top]], "mm-b"); pl.path([[r, 0], [r, top]], "mm-b");
          [0, top].forEach(function (y, j) { var pts = []; for (var i = 0; i <= 60; i++) { var t = (i / 60) * 2 * PI; pts.push([r * Math.cos(t), y + e * Math.sin(t)]); } pl.path(pts, "mm-b"); });
          pl.text(0, 0, "r = " + num(r, 3), { "text-anchor": "middle", dy: 18 * pl.K });
          pl.text(r, top / 2, "h = " + num(h, 3), { dx: 6 * pl.K });
          if (h > top) pl.text(0, top, "(taller than shown)", { "text-anchor": "middle", dy: -8 * pl.K, style: "font-size:" + 10 * pl.K + "px" });
        },
      },
      close: {
        name: "Closest point on y² = 2x to (1, 4)",
        params: {},
        v: "y", vname: "y-coordinate of the point", lo: function () { return -2; }, hi: function () { return 5; }, x0: 0.5, goal: "min", qname: "distance d",
        Q: function (y) { var x = (y * y) / 2; return Math.sqrt((x - 1) * (x - 1) + (y - 4) * (y - 4)); },
        exact: function () { return 2; },
        text: function (y, p, best) {
          var x = (y * y) / 2;
          return ["A point on the parabola is (½<em>y</em><sup>2</sup>, <em>y</em>), so the square of its distance from (1, 4) is <em>f</em>(<em>y</em>) = (½<em>y</em><sup>2</sup> − 1)<sup>2</sup> + (<em>y</em> − 4)<sup>2</sup>.",
            "Now: the point (" + num(x) + ", " + num(y) + ") is at distance <b>" + num(Math.sqrt((x - 1) * (x - 1) + (y - 4) * (y - 4))) + "</b>.",
            best ? "<em>f</em>′(<em>y</em>) = <em>y</em><sup>3</sup> − 8 = 0 gives <em>y</em> = 2, and <em>f</em>′ changes from negative to positive, so the closest point is <b>(2, 2)</b>, at distance √5 ≈ " + num(Math.sqrt(5)) + "." : ""];
        },
        pic: function (pl, y) {
          M.setWindow(pl, [-1, 7, -3, 5.5]);
          pl.o.xname = "x"; pl.o.yname = "y"; pl.frame();
          var pts = []; for (var i = 0; i <= 200; i++) { var t = -3 + (8.5 * i) / 200; pts.push([(t * t) / 2, t]); }
          pl.path(pts, "mm-a");
          var x = (y * y) / 2, l = pl.path([[1, 4], [x, y]], "mm-b"); l.style.strokeDasharray = "5 4";
          pl.circle(1, 4, 5, "mm-dot"); var q = pl.circle(x, y, 5.5, "mm-dot"); q.style.fill = "var(--mm-b)";
          pl.text(1, 4, "(1, 4)", { dx: -38 * pl.K, dy: -6 * pl.K });
        },
      },
      river: {
        name: "Crossing a river",
        params: { row: ["rowing speed (km/h)", 2, 12, 0.5, 6, 1], run: ["running speed (km/h)", 2, 20, 0.5, 8, 1] },
        v: "x", vname: "landing point x (km downstream of C)", lo: function () { return 0; }, hi: function () { return 8; }, x0: 1, goal: "min", qname: "time T (h)",
        Q: function (x, p) { return Math.sqrt(x * x + 9) / p.row + (8 - x) / p.run; },
        exact: function (p) { if (p.row >= p.run) return 8; var c = (3 * p.row) / Math.sqrt(p.run * p.run - p.row * p.row); return Math.min(8, c); },
        text: function (x, p, best) {
          var T = function (z) { return Math.sqrt(z * z + 9) / p.row + (8 - z) / p.run; }, c = probs.river.exact(p);
          return ["Rowing to <em>D</em>, <em>x</em> km downstream of <em>C</em>, and running to <em>B</em> takes <em>T</em>(<em>x</em>) = √(<em>x</em><sup>2</sup> + 9)/" + num(p.row) + " + (8 − <em>x</em>)/" + num(p.run) + " hours, for 0 ≤ <em>x</em> ≤ 8.",
            "Now: landing " + num(x) + " km downstream, the trip takes <b>" + num(T(x)) + " h</b> (" + num(T(x) * 60, 3) + " min).",
            best ? "<em>T</em>′(<em>x</em>) = 0 where " + num(p.run) + "<em>x</em> = " + num(p.row) + "√(<em>x</em><sup>2</sup> + 9)" + (p.row < p.run && c < 8 ? ", at <em>x</em> ≈ " + num(c) : ", which has no solution in (0, 8)") + ". Comparing with the end points, <em>T</em>(0) = " + num(T(0)) + " and <em>T</em>(8) = " + num(T(8)) + ", the least time is <b>" + num(T(c)) + " h</b>, landing " + num(c) + " km downstream." : ""];
        },
        pic: function (pl, x) {
          M.setWindow(pl, [-1, 9, -1.5, 4.5]);
          pl.o.xname = "km"; pl.o.yname = ""; pl.frame();
          poly(pl, [[-1, 0], [9, 0], [9, 3], [-1, 3]], "fill:var(--mm-c);opacity:.22;stroke:none");
          pl.path([[-1, 0], [9, 0]], "mm-curve"); pl.path([[-1, 3], [9, 3]], "mm-curve");
          var a = pl.path([[0, 0], [x, 3]], "mm-b"); a.style.strokeWidth = "2.5";
          var b = pl.path([[x, 3], [8, 3]], "mm-a"); b.style.strokeWidth = "3.5";
          [[0, 0, "A"], [0, 3, "C"], [8, 3, "B"], [x, 3, "D"]].forEach(function (q) { pl.circle(q[0], q[1], 4, "mm-dot"); pl.text(q[0], q[1], q[2], { "text-anchor": "middle", dy: (q[1] === 0 ? 18 : -9) * pl.K }); });
          pl.text(-0.6, 1.5, "3 km", { dx: 0 });
        },
      },
      semi: {
        name: "Rectangle in a semicircle",
        params: { r: ["radius r", 1, 5, 0.1, 2, 1] },
        v: "x", vname: "half-width x", lo: function () { return 0; }, hi: function (p) { return p.r; }, x0: 0.5, goal: "max", qname: "area A",
        Q: function (x, p) { return 2 * x * Math.sqrt(Math.max(0, p.r * p.r - x * x)); },
        exact: function (p) { return p.r / Math.SQRT2; },
        text: function (x, p, best) {
          return ["A corner at (<em>x</em>, <em>y</em>) on the circle <em>x</em><sup>2</sup> + <em>y</em><sup>2</sup> = " + num(p.r * p.r) + " gives the area <em>A</em> = 2<em>x</em>√(" + num(p.r * p.r) + " − <em>x</em><sup>2</sup>), for 0 ≤ <em>x</em> ≤ " + num(p.r) + ".",
            "Now: half-width " + num(x) + ", height " + num(Math.sqrt(Math.max(0, p.r * p.r - x * x))) + ", area <b>" + num(probs.semi.Q(x, p)) + "</b>.",
            best ? "<em>A</em>′(<em>x</em>) = 0 when <em>x</em> = <em>r</em>/√2 ≈ " + num(p.r / Math.SQRT2) + "; the area is 0 at both end points, so the maximum is <b><em>r</em><sup>2</sup> = " + num(p.r * p.r) + "</b>, for a rectangle twice as wide as it is high." : ""];
        },
        pic: function (pl, x, p) {
          M.setWindow(pl, [-5.6, 5.6, -0.8, 5.6]);
          pl.o.xname = ""; pl.o.yname = ""; pl.frame();
          var pts = []; for (var i = 0; i <= 100; i++) { var t = (PI * i) / 100; pts.push([p.r * Math.cos(t), p.r * Math.sin(t)]); }
          pl.path(pts, "mm-a"); pl.path([[-p.r, 0], [p.r, 0]], "mm-a");
          var y = Math.sqrt(Math.max(0, p.r * p.r - x * x));
          poly(pl, [[-x, 0], [x, 0], [x, y], [-x, y]], "fill:var(--mm-b);fill-opacity:.2;stroke:var(--mm-b);stroke-width:2.5");
          pl.circle(x, y, 4, "mm-dot");
          pl.text(x, y, "(x, y)", { dx: 6 * pl.K, dy: -4 * pl.K });
        },
      },
      tv: {
        name: "Store pricing (rebates)",
        params: {},
        v: "rebate", vname: "rebate ($)", lo: function () { return 0; }, hi: function () { return 350; }, x0: 50, goal: "max", qname: "revenue R ($ per week)",
        Q: function (d) { var x = 200 + 2 * d; return x * (350 - d); },
        exact: function () { return 125; },
        text: function (d, p, best) {
          var x = 200 + 2 * d;
          return ["Sales are 200 sets a week at $350, and each $10 rebate sells 20 more, so the demand function is <em>p</em>(<em>x</em>) = 450 − ½<em>x</em> and the revenue is <em>R</em>(<em>x</em>) = 450<em>x</em> − ½<em>x</em><sup>2</sup>.",
            "Now: a rebate of $" + num(d) + " gives a price of $" + num(350 - d) + ", sales of " + num(x) + " sets and revenue <b>$" + num(x * (350 - d)) + "</b>.",
            best ? "<em>R</em>′(<em>x</em>) = 450 − <em>x</em> = 0 gives <em>x</em> = 450, so the price should be <em>p</em>(450) = $225: a rebate of <b>$125</b>, for revenue $" + num(450 * 225) + "." : ""];
        },
        pic: function (pl, d) {
          var x = 200 + 2 * d;
          M.setWindow(pl, [0, 2, 0, 1000]);
          pl.o.xname = ""; pl.o.yname = ""; pl.o.fx = function () { return ""; }; pl.frame();
          poly(pl, [[0.25, 0], [0.75, 0], [0.75, 350 - d], [0.25, 350 - d]], "fill:var(--mm-b);opacity:.6;stroke:none");
          poly(pl, [[1.25, 0], [1.75, 0], [1.75, x], [1.25, x]], "fill:var(--mm-c);opacity:.6;stroke:none");
          pl.text(0.5, 350 - d, "price $" + num(350 - d), { "text-anchor": "middle", dy: -6 * pl.K });
          pl.text(1.5, x, num(x) + " sets", { "text-anchor": "middle", dy: -6 * pl.K });
        },
      },
    };
    var key = "fence", P = probs[key], par = {}, x = 300, best = false;
    var pic = new M.Plot(document.getElementById("op-pic"), { x0: 0, x1: 1, y0: 0, y1: 1, gx: 1, gy: 1, aspect: 0.75, aspectNarrow: 0.75, left: 30 });
    var gr = new M.Plot(document.getElementById("op-graph"), { x0: 0, x1: 1, y0: 0, y1: 1, gx: 1, gy: 1, xname: "", yname: "", aspect: 0.75, aspectNarrow: 0.7, left: 40 });
    function optimum() {
      var lo = P.lo(par), hi = P.hi(par), n = 2000, bi = 0, bv = P.goal === "max" ? -Infinity : Infinity, sgn = P.goal === "max" ? 1 : -1;
      for (var i = 0; i <= n; i++) { var v = P.Q(lo + ((hi - lo) * i) / n, par); if (isFinite(v) && sgn * v > sgn * bv) { bv = v; bi = i; } }
      var u = lo + ((hi - lo) * Math.max(0, bi - 1)) / n, w = lo + ((hi - lo) * Math.min(n, bi + 1)) / n;
      for (var k = 0; k < 80; k++) { var a = u + (w - u) / 3, b = w - (w - u) / 3; if (sgn * P.Q(a, par) > sgn * P.Q(b, par)) w = b; else u = a; }
      return (u + w) / 2;
    }
    function draw() {
      var lo = P.lo(par), hi = P.hi(par);
      // keep the picture's grid out of the way
      pic.o.fx = null;
      pic.o.noTicks = key !== "close"; // the pictures are to scale but their coordinates mean nothing, except for the closest point
      P.pic(pic, x, par);
      var vs = [];
      for (var i = 0; i <= 300; i++) { var v = P.Q(lo + ((hi - lo) * i) / 300, par); if (isFinite(v)) vs.push(v); }
      vs.sort(function (a, b) { return a - b; });
      var ylo = P.goal === "max" ? Math.min(0, vs[0]) : vs[0], yhi = P.goal === "min" ? Math.min(vs[vs.length - 1], 3 * vs[0] + 1e-9) : vs[vs.length - 1], pad = (yhi - ylo) * 0.1 || 1;
      if (P.goal === "min") ylo = Math.max(0, ylo - pad * 3);
      M.setWindow(gr, [lo, hi, ylo, yhi + pad]);
      gr.o.xname = P.vname; gr.o.yname = P.qname;
      gr.frame();
      gr.fn(function (z) { return P.Q(z, par); }, "mm-a", { x0: lo, x1: hi, n: 800 });
      gr.circle(x, P.Q(x, par), 5.5, "mm-dot").style.fill = "var(--mm-b)";
      var xb = optimum();
      if (best) { var l = gr.path([[xb, gr.o.y0], [xb, gr.o.y1]], "mm-zero"); l.style.strokeDasharray = "3 3"; var c = gr.circle(xb, P.Q(xb, par), 6, "mm-eq-u"); c.style.stroke = "var(--mm-c)"; c.style.strokeWidth = "2.5"; }
      var t = P.text(x, par, best);
      if (best) t.push("The tool's numerical search agrees: the " + (P.goal === "max" ? "maximum" : "minimum") + " is at " + P.v + " ≈ " + num(xb, 5) + ".");
      document.getElementById("op-out").innerHTML = t.filter(Boolean).map(function (s) { return "<div style=\"margin-bottom:.25rem\">" + s + "</div>"; }).join("");
    }
    var top = document.getElementById("op-top"), box = document.getElementById("op-controls"), pg, xS;
    M.select(M.group(top, "Problem"), Object.keys(probs).map(function (k) { return [k, probs[k].name]; }), key, function (v) { load(v); });
    var gv = M.group(box, "Choose");
    xS = M.slider(gv, { label: "value", min: 0, max: 1, step: 0.001, value: 0, digits: 2, onInput: function (v) { x = v; draw(); } });
    var bestBox = M.checkbox(gv, "Show the optimum", best, function (v) { best = v; draw(); });
    pg = M.group(box, "Parameters");
    function rescale() { var lo = P.lo(par), hi = P.hi(par); xS.input.min = lo; xS.input.max = hi; xS.input.step = (hi - lo) / 1000; x = Math.min(hi, Math.max(lo, x)); xS.set(x); }
    function load(k) {
      key = k; P = probs[k]; par = {}; best = false; bestBox.checked = false;
      xS.el.querySelector("span").innerHTML = "<em>" + P.v + "</em>";
      while (pg.childNodes.length > 1) pg.removeChild(pg.lastChild);
      Object.keys(P.params).forEach(function (n) { var s = P.params[n]; par[n] = s[4]; M.slider(pg, { label: s[0], min: s[1], max: s[2], step: s[3], value: s[4], digits: s[5], onInput: function (v) { par[n] = v; rescale(); draw(); } }); });
      pg.style.display = Object.keys(P.params).length ? "" : "none";
      x = P.x0; rescale(); draw();
    }
    M.onResize(draw);
    load(key);
  })();
</script>
