---
layout: page
title: Linear programming
description: An interactive tool for MATH 316, weeks 9–10. Solve two-variable linear programs graphically and step through the simplex method.
permalink: /teaching/math316/tools/linear-programming/
---

[← MATH 316]({{ '/teaching/math316/' | relative_url }})

A linear program chooses the values of decision variables that make a linear objective, such as profit, as large as possible while satisfying linear constraints, such as limited materials and time. With two variables, the constraints mark out a region of the plane and the best plan can be found by eye; the simplex method finds it algebraically by moving from corner to corner. This tool shows both. It supports learning outcome 8.

<div class="mm-wrap" id="lp">
  <div class="mm-controls" id="lp-top"></div>
  <div class="mm-panels mm-2">
    <svg id="lp-plot" role="img" aria-label="Feasible region, constraint lines and profit line"></svg>
    <div>
      <div class="mm-scroll"><table class="mm-table" id="lp-prob"></table></div>
      <div class="mm-scroll"><table class="mm-table" id="lp-corners"></table></div>
    </div>
  </div>
  <div class="mm-controls" id="lp-controls"></div>
  <p class="mm-help">Edit any number in the problem table. Drag across the plot to move the dashed profit line: every plan on it gives the same profit. The shaded region contains the feasible plans, and its corners are listed with their profit.</p>
  <p class="mm-readout" id="lp-out"></p>
  <h3 style="font-size:1.05rem;margin:1.2rem 0 .3rem">Simplex method</h3>
  <div class="mm-controls" id="lp-simplex"></div>
  <div class="mm-scroll"><table class="mm-table" id="lp-tab"></table></div>
  <p class="mm-readout" id="lp-step"></p>
</div>

## Things to try

1. In the **carpenter's problem**, drag the profit line across the feasible region. At which point does it leave the region? Why must the best plan be at a corner?
2. Check the profit at each corner in the table. Which constraints are binding at the best corner, and what does that mean for the carpenter's lumber and labour?
3. Increase the profit on a table until the best corner changes. At what profit does that happen? Compare it with the slopes of the constraint lines.
4. Step through the **simplex method** with **Next pivot**. Follow the path on the plot: which corners does the method visit, and why does it stop where it does?
5. Turn on **whole numbers only**. Is the best plan in whole numbers always the rounded-off answer of the linear program? Try several **coffee shop** problems.
6. Give the coffee shop a constraint that cannot bind, for example a very large supply of milk. How does that show up on the plot, in the corner table and in the final tableau?

## How it is computed

The problem is to maximize $$z = c_1 x_1 + c_2 x_2$$ subject to $$a_{i1} x_1 + a_{i2} x_2 \le b_i$$ for each constraint and $$x_1, x_2 \ge 0$$. The feasible region is found by cutting a large rectangle with each constraint, and its corners are evaluated directly. The simplex method adds a slack variable $$s_i$$ to each constraint, starts at the origin, and at each step brings in the variable with the most negative entry in the bottom row of the tableau, choosing the row to pivot on by the smallest ratio of right-hand side to pivot-column entry. Whole-number solutions are found by checking every integer point in the region. The carpenter's problem uses the data from the textbook; the coffee shop problems use made-up numbers, with profits in fils.

<p class="mm-note">The tool runs entirely in your browser; nothing is recorded or sent anywhere. It is a learning aid and is not assessed.</p>

<script src="{{ '/assets/js/teaching/mm-tools.js' | relative_url }}"></script>
<script>
  (function () {
    var M = window.MMTools;
    var SUB = ["₁", "₂", "₃", "₄"];
    var prob, Z = null, integer = false, stepIx = 0, steps = [], dragging = false;
    function carpenter() {
      return {
        title: "Carpenter's problem",
        vars: ["tables", "bookcases"], unit: "$",
        c: [25, 30],
        cons: [{ name: "Lumber (units)", a: [20, 30], b: 690 }, { name: "Labour (hours)", a: [5, 4], b: 120 }],
      };
    }
    function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
    // A random coffee-shop problem whose best plan uses both drinks and at least two of the supplies.
    function coffee() {
      for (var tries = 0; tries < 200; tries++) {
        var p = {
          title: "Coffee shop",
          vars: ["lattes", "mochas"], unit: "fils",
          c: [ri(25, 60) * 10, ri(25, 60) * 10],
          cons: [
            { name: "Coffee (g)", a: [ri(14, 20), ri(14, 20)], b: ri(20, 36) * 100 },
            { name: "Milk (ml)", a: [ri(15, 25) * 10, ri(10, 20) * 10], b: ri(20, 40) * 1000 },
            { name: "Chocolate (ml)", a: [0, ri(20, 40)], b: ri(20, 50) * 100 },
          ],
        };
        var s = solveCorners(p);
        if (s.best && s.best.p[0] > 0.5 && s.best.p[1] > 0.5 && s.binding >= 2) return p;
      }
      return p;
    }
    // Feasible region: clip a large rectangle by each half-plane a·x <= b (Sutherland–Hodgman).
    function region(p) {
      var big = 1;
      p.cons.forEach(function (k) { k.a.forEach(function (ai) { if (ai > 0) big = Math.max(big, k.b / ai); }); });
      big *= 50;
      var poly = [[0, 0], [big, 0], [big, big], [0, big]];
      p.cons.forEach(function (k) {
        var out = [], g = function (q) { return k.a[0] * q[0] + k.a[1] * q[1] - k.b; };
        for (var i = 0; i < poly.length; i++) {
          var P = poly[i], Q = poly[(i + 1) % poly.length], gp = g(P), gq = g(Q);
          if (gp <= 1e-9) out.push(P);
          if ((gp < -1e-9 && gq > 1e-9) || (gp > 1e-9 && gq < -1e-9)) {
            var t = gp / (gp - gq);
            out.push([P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1])]);
          }
        }
        poly = out;
      });
      return { poly: poly, big: big };
    }
    function zval(p, q) { return p.c[0] * q[0] + p.c[1] * q[1]; }
    function solveCorners(p) {
      var R = region(p), corners = [], unbounded = false;
      R.poly.forEach(function (q) {
        if (q[0] > R.big * 0.99 || q[1] > R.big * 0.99) { unbounded = true; return; }
        if (!corners.some(function (r) { return Math.abs(r[0] - q[0]) + Math.abs(r[1] - q[1]) < 1e-7; })) corners.push(q);
      });
      var best = null;
      corners.forEach(function (q) { var z = zval(p, q); if (!best || z > best.z + 1e-9) best = { p: q, z: z }; });
      var binding = 0;
      if (best) p.cons.forEach(function (k) { if (Math.abs(k.a[0] * best.p[0] + k.a[1] * best.p[1] - k.b) < 1e-6) binding++; });
      return { poly: R.poly, corners: corners, best: unbounded ? null : best, unbounded: unbounded, binding: binding };
    }
    function bestInteger(p, X, Y) {
      var best = null;
      for (var i = 0; i <= Math.floor(X); i++)
        for (var j = 0; j <= Math.floor(Y); j++) {
          var ok = p.cons.every(function (k) { return k.a[0] * i + k.a[1] * j <= k.b + 1e-9; });
          if (ok) { var z = zval(p, [i, j]); if (!best || z > best.z) best = { p: [i, j], z: z }; }
        }
      return best;
    }
    // Simplex with slack variables, starting at the origin (all b >= 0).
    function simplex(p) {
      var m = p.cons.length, n = 2 + m, T = [], basis = [], out = [];
      p.cons.forEach(function (k, i) {
        var row = [k.a[0], k.a[1]];
        for (var j = 0; j < m; j++) row.push(i === j ? 1 : 0);
        row.push(k.b);
        T.push(row);
        basis.push(2 + i);
      });
      var zr = [-p.c[0], -p.c[1]];
      for (var j = 0; j < m; j++) zr.push(0);
      zr.push(0);
      T.push(zr);
      for (var it = 0; it < 12; it++) {
        var st = { T: T.map(function (r) { return r.slice(); }), basis: basis.slice() };
        out.push(st);
        var col = -1, mn = -1e-9;
        for (var c = 0; c < n; c++) if (T[m][c] < mn) { mn = T[m][c]; col = c; }
        if (col < 0) { st.status = "optimal"; break; }
        var row = -1, best = Infinity, ratios = [];
        for (var r = 0; r < m; r++) {
          if (T[r][col] > 1e-9) { var q = T[r][n] / T[r][col]; ratios.push([r, q]); if (q < best - 1e-12) { best = q; row = r; } }
          else ratios.push([r, null]);
        }
        if (row < 0) { st.status = "unbounded"; st.col = col; break; }
        st.status = "pivot"; st.col = col; st.row = row; st.ratios = ratios;
        var pv = T[row][col];
        T[row] = T[row].map(function (v) { return v / pv; });
        for (var r2 = 0; r2 <= m; r2++) {
          if (r2 === row) continue;
          var f = T[r2][col];
          if (f !== 0) T[r2] = T[r2].map(function (v, k) { return v - f * T[row][k]; });
        }
        basis[row] = col;
      }
      return out;
    }
    function point(st) {
      var x = [0, 0], n = st.T[0].length - 1;
      st.basis.forEach(function (b, r) { if (b < 2) x[b] = st.T[r][n]; });
      return x;
    }
    // Show a number as a fraction when it is one with a small denominator.
    function frac(v) {
      if (Math.abs(v) < 1e-9) return "0";
      for (var q = 1; q <= 400; q++) {
        var pnum = Math.round(v * q);
        if (Math.abs(v * q - pnum) < 1e-7) return q === 1 ? String(pnum).replace("-", "−") : (pnum < 0 ? "−" : "") + Math.abs(pnum) + "/" + q;
      }
      return M.fmt(v, 3).replace("-", "−");
    }
    function vname(j) { return j < 2 ? "<em>x</em>" + SUB[j] : "<em>s</em>" + SUB[j - 2]; }
    function num(v) { return Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : M.fmt(v, 2); }
    function money(v) { return prob.unit === "$" ? "$" + num(v) : num(v) + " " + prob.unit; }
    var plot = new M.Plot(document.getElementById("lp-plot"), { x0: 0, x1: 10, y0: 0, y1: 10, gx: 1, gy: 1, aspect: 0.85, aspectNarrow: 0.9, left: 24 });
    var COLS = ["var(--mm-a)", "var(--mm-b)", "var(--mm-c)", "var(--global-text-color-light)"];
    function niceStep(range) {
      var raw = range / 6, p10 = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p10;
      return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p10;
    }
    function draw() {
      var S = solveCorners(prob);
      // display range from the corners (or the intercepts if the region is unbounded)
      var X = 1, Y = 1;
      S.corners.forEach(function (q) { X = Math.max(X, q[0]); Y = Math.max(Y, q[1]); });
      prob.cons.forEach(function (k) { if (k.a[0] > 0) X = Math.max(X, Math.min(k.b / k.a[0], X * 1.6)); if (k.a[1] > 0) Y = Math.max(Y, Math.min(k.b / k.a[1], Y * 1.6)); });
      X *= 1.15; Y *= 1.15;
      var sx = niceStep(X), sy = niceStep(Y);
      X = Math.ceil(X / sx) * sx; Y = Math.ceil(Y / sy) * sy;
      plot.o.x1 = X; plot.o.y1 = Y; plot.o.gx = sx; plot.o.gy = sy; plot.o.lx = sx * 2; plot.o.ly = sy * 2;
      plot.o.xname = "x₁, " + prob.vars[0]; plot.o.yname = "x₂, " + prob.vars[1];
      plot.frame();
      M.el("polygon", { points: S.poly.map(function (q) { return plot.sx(q[0]).toFixed(1) + "," + plot.sy(q[1]).toFixed(1); }).join(" "), style: "fill:var(--global-theme-color);opacity:.13;stroke:none" }, plot.data);
      prob.cons.forEach(function (k, i) {
        var pts;
        if (Math.abs(k.a[1]) > 1e-12) pts = [[0, k.b / k.a[1]], [X * 2, (k.b - k.a[0] * X * 2) / k.a[1]]];
        else if (Math.abs(k.a[0]) > 1e-12) pts = [[k.b / k.a[0], 0], [k.b / k.a[0], Y * 2]];
        else return;
        var line = plot.path(pts, "mm-curve");
        line.style.stroke = COLS[i];
      });
      // profit line through the current level Z, and the direction in which profit increases
      if (Z === null) Z = S.best ? 0.6 * S.best.z : 0;
      if (prob.c[1] !== 0 || prob.c[0] !== 0) {
        var lp;
        if (Math.abs(prob.c[1]) > 1e-12) lp = [[0, Z / prob.c[1]], [X * 2, (Z - prob.c[0] * X * 2) / prob.c[1]]];
        else lp = [[Z / prob.c[0], 0], [Z / prob.c[0], Y * 2]];
        var pl = plot.path(lp, "mm-curve");
        pl.style.strokeDasharray = "7 5";
        pl.style.strokeWidth = "2.5";
      }
      // whole-number points near the best plan
      var bi = null;
      if (integer) {
        bi = bestInteger(prob, X, Y);
        // Draw the whole-number plans only when they are far enough apart to see; the best one is always ringed.
        var visible = plot.sx(1) - plot.sx(0) >= 5 * plot.K && plot.sy(0) - plot.sy(1) >= 5 * plot.K;
        for (var i = 0; visible && i <= X; i++)
          for (var j = 0; j <= Y; j++) {
            var ok = prob.cons.every(function (k) { return k.a[0] * i + k.a[1] * j <= k.b + 1e-9; });
            if (ok) plot.circle(i, j, 1.6, "mm-dot", plot.data);
          }
        if (bi) { var c1 = plot.circle(bi.p[0], bi.p[1], 7, "mm-handle"); c1.setAttribute("stroke", "var(--mm-b)"); }
      }
      // corners, the best one ringed
      S.corners.forEach(function (q) { plot.circle(q[0], q[1], 4, "mm-dot"); });
      if (S.best) { var rg = plot.circle(S.best.p[0], S.best.p[1], 8, "mm-handle"); rg.setAttribute("stroke", "var(--global-text-color)"); }
      // simplex path so far
      if (steps.length) {
        var path = steps.slice(0, stepIx + 1).map(point);
        var sp = plot.path(path, "mm-b");
        sp.style.strokeWidth = "3";
        path.forEach(function (q) { plot.circle(q[0], q[1], 4.5, "mm-eq-u"); });
        var cur = path[path.length - 1];
        var cc = plot.circle(cur[0], cur[1], 6, "mm-dot"); cc.style.fill = "var(--mm-b)";
      }
      // tables
      var ct = "<thead><tr><th>Corner</th><th><em>x</em>₁</th><th><em>x</em>₂</th><th>Profit (" + prob.unit + ")</th></tr></thead><tbody>";
      S.corners.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; }).forEach(function (q, i) {
        var best = S.best && Math.abs(q[0] - S.best.p[0]) + Math.abs(q[1] - S.best.p[1]) < 1e-7;
        ct += "<tr" + (best ? " class=\"mm-best\"" : "") + "><td>" + String.fromCharCode(65 + i) + "</td><td>" + num(q[0]) + "</td><td>" + num(q[1]) + "</td><td>" + num(zval(prob, q)) + "</td></tr>";
      });
      document.getElementById("lp-corners").innerHTML = ct + "</tbody>";
      var txt = S.best ? "Best plan: <b>" + num(S.best.p[0]) + "</b> " + prob.vars[0] + " and <b>" + num(S.best.p[1]) + "</b> " + prob.vars[1] + ", for a profit of <b>" + money(S.best.z) + "</b>." : S.unbounded ? "The feasible region is unbounded and profit can grow without limit." : "There are no feasible plans.";
      if (bi) txt += " Best plan in whole numbers: <b>" + bi.p[0] + "</b> and <b>" + bi.p[1] + "</b>, profit <b>" + money(bi.z) + "</b>.";
      txt += " Profit on the dashed line: <b>" + money(Z) + "</b>.";
      document.getElementById("lp-out").innerHTML = txt;
      drawTableau();
    }
    function drawTableau() {
      var tab = document.getElementById("lp-tab"), info = document.getElementById("lp-step");
      if (!steps.length) { tab.innerHTML = ""; info.innerHTML = "Press <b>Start</b> to set up the initial tableau."; return; }
      var st = steps[stepIx], m = st.basis.length, n = st.T[0].length - 1;
      var h = "<thead><tr><th>Basic</th>";
      for (var j = 0; j < n; j++) h += "<th" + (st.status === "pivot" && j === st.col ? " class=\"mm-pc\"" : "") + ">" + vname(j) + "</th>";
      h += "<th>RHS</th>" + (st.status === "pivot" ? "<th>Ratio</th>" : "") + "</tr></thead><tbody>";
      for (var r = 0; r <= m; r++) {
        var pr = st.status === "pivot" && r === st.row;
        h += "<tr" + (pr ? " class=\"mm-pc\"" : "") + "><td>" + (r < m ? vname(st.basis[r]) : "<em>z</em>") + "</td>";
        for (var c = 0; c <= n; c++) {
          var cls = st.status === "pivot" && c === st.col ? (pr ? "mm-pc mm-pe" : "mm-pc") : "";
          h += "<td" + (cls ? " class=\"" + cls + "\"" : "") + ">" + frac(st.T[r][c]) + "</td>";
        }
        if (st.status === "pivot") h += "<td>" + (r < m && st.ratios[r][1] !== null ? frac(st.ratios[r][1]) : "") + "</td>";
        h += "</tr>";
      }
      tab.innerHTML = h + "</tbody>";
      var x = point(st), z = st.T[m][n], t = "Step " + stepIx + ": the current corner is <em>x</em>₁ = " + frac(x[0]) + ", <em>x</em>₂ = " + frac(x[1]) + ", with <em>z</em> = " + frac(z) + ". ";
      if (st.status === "pivot")
        t += "Entering variable: " + vname(st.col) + " (most negative entry in the bottom row, " + frac(st.T[m][st.col]) + "). Smallest ratio in row " + vname(st.basis[st.row]) + ", which leaves the basis. Pivot on " + frac(st.T[st.row][st.col]) + ".";
      else if (st.status === "optimal") t += "No negative entries remain in the bottom row, so this corner is optimal.";
      else t += "No positive entries in the pivot column: the problem is unbounded.";
      info.innerHTML = t;
    }
    function buildProblemTable() {
      var t = document.getElementById("lp-prob");
      t.innerHTML = "";
      var head = M.html("tr", null, M.html("thead", null, t));
      M.html("th", null, head, "");
      M.html("th", null, head).innerHTML = "<em>x</em>₁ " + prob.vars[0];
      M.html("th", null, head).innerHTML = "<em>x</em>₂ " + prob.vars[1];
      M.html("th", null, head, "");
      M.html("th", null, head, "Available");
      var body = M.html("tbody", null, t);
      function input(td, get, set) {
        var i = M.html("input", { type: "number", step: "any", value: get() }, td);
        i.addEventListener("input", function () { var v = parseFloat(i.value); if (isFinite(v)) { set(v); changed(); } });
      }
      var r0 = M.html("tr", null, body);
      M.html("td", null, r0, "Profit (" + prob.unit + ")");
      [0, 1].forEach(function (j) { input(M.html("td", null, r0), function () { return prob.c[j]; }, function (v) { prob.c[j] = v; }); });
      M.html("td", null, r0, "");
      M.html("td", null, r0, "");
      prob.cons.forEach(function (k, i) {
        var r = M.html("tr", null, body), nm = M.html("td", null, r);
        nm.innerHTML = "<span class=\"mm-key\" style=\"border-color:" + COLS[i] + "\"></span>" + k.name;
        [0, 1].forEach(function (j) { input(M.html("td", null, r), function () { return k.a[j]; }, function (v) { k.a[j] = v; }); });
        M.html("td", null, r, "≤");
        input(M.html("td", null, r), function () { return k.b; }, function (v) { k.b = Math.max(0, v); });
      });
    }
    function changed() { Z = null; steps = []; stepIx = 0; draw(); }
    function load(p) { prob = p; buildProblemTable(); changed(); }
    // controls
    var top = document.getElementById("lp-top"), g0 = M.group(top, "Problem"), rnd;
    M.select(g0, [["carpenter", "Carpenter's problem"], ["coffee", "Coffee shop (random numbers)"]], "carpenter", function (v) {
      rnd.style.display = v === "coffee" ? "" : "none";
      load(v === "coffee" ? coffee() : carpenter());
    });
    rnd = M.button(g0, "New random problem", function () { load(coffee()); });
    rnd.style.display = "none";
    var box = document.getElementById("lp-controls"), g1 = M.group(box, "Show");
    M.checkbox(g1, "Whole numbers only", integer, function (c) { integer = c; draw(); });
    var sb = document.getElementById("lp-simplex"), g2 = M.group(sb, "");
    M.button(g2, "Start", function () { steps = simplex(prob); stepIx = 0; draw(); });
    M.button(g2, "Next pivot", function () { if (!steps.length) steps = simplex(prob); else if (stepIx < steps.length - 1) stepIx++; draw(); });
    M.button(g2, "Back", function () { if (stepIx > 0) stepIx--; draw(); });
    M.button(g2, "Reset", function () { steps = []; stepIx = 0; draw(); });
    // pointer: the profit line passes through the pointer
    var svg = plot.svg;
    function moveLine(evt) { var p = plot.at(evt); Z = Math.max(0, zval(prob, [Math.max(p.x, 0), Math.max(p.y, 0)])); draw(); }
    svg.addEventListener("pointerdown", function (evt) { evt.preventDefault(); dragging = true; svg.setPointerCapture(evt.pointerId); moveLine(evt); });
    svg.addEventListener("pointermove", function (evt) { if (dragging) moveLine(evt); });
    svg.addEventListener("pointerup", function () { dragging = false; });
    svg.addEventListener("pointercancel", function () { dragging = false; });
    M.onResize(draw);
    load(carpenter());
  })();
</script>
