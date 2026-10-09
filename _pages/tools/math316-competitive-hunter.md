---
layout: page
title: Competing species
description: An interactive tool for MATH 316, week 13. Explore the competitive hunter model in the phase plane, then add limited growth and harvesting.
permalink: /teaching/math316/tools/competitive-hunter/
---

[← MATH 316]({{ '/teaching/math316/' | relative_url }})

Two species, <em>x</em> and <em>y</em>, compete for the same food. Each grows on its own and is held back by the other. This tool draws trajectories in the phase plane and colours the plane by where trajectories end up. It supports learning outcomes 9 and 11.

<div class="mm-wrap" id="ch">
  <p class="mm-eqn" id="ch-eqn"></p>
  <div class="mm-panels mm-2">
    <svg id="ch-phase" role="img" aria-label="Phase plane of two competing species with trajectories, nullclines and shaded outcomes"></svg>
    <svg id="ch-time" role="img" aria-label="Both populations against time for the latest trajectory"></svg>
  </div>
  <div class="mm-controls" id="ch-controls"></div>
  <p class="mm-help" id="ch-help"></p>
  <p class="mm-readout" id="ch-out"></p>
</div>

## Things to try

1. In the model with **unlimited growth**, start trajectories in different places. Can the two species ever settle down together? Find the curve that separates the starting points where <em>x</em> wins from those where <em>y</em> wins.
2. Change <em>a</em>, <em>b</em>, <em>m</em> and <em>n</em>. How does the saddle point move, and how does the region where <em>x</em> wins change?
3. Switch to **limited growth** and drag the ends of the nullclines to produce each of the four cases. For each case, sketch the direction of motion in every region between the nullclines before you look at the trajectories.
4. Which condition on the four intercepts gives coexistence? Write it in terms of <em>a</em>, <em>b</em>, <em>m</em>, <em>n</em>, <em>k</em><sub>1</sub> and <em>k</em><sub>2</sub>.
5. In the case where the winner depends on the start, begin two trajectories very close together on either side of the boundary. What does this say about predicting the outcome from imperfect data?
6. Turn on **harvesting** of <em>x</em>. Can harvesting one species change which species wins? Can it bring about coexistence?

For where these questions lead, from competing species to competing strains of a virus, see [Going further]({{ '/teaching/math316/' | relative_url }}#lotka-volterra) on the course page.

## How it is computed

The textbook competitive hunter model is

$$\frac{dx}{dt} = (a - b y)\, x, \qquad \frac{dy}{dt} = (m - n x)\, y.$$

With limited growth, as in the textbook's problems on this model, each species grows logistically on its own and is held back by the other:

$$\frac{dx}{dt} = a\left(1 - \frac{x}{k_1}\right)x - b x y, \qquad \frac{dy}{dt} = m\left(1 - \frac{y}{k_2}\right)y - n x y.$$

The nullclines are then straight lines. The one for <em>x</em> meets the axes at $$x = k_1$$ and $$y = a/b$$, and the one for <em>y</em> at $$y = k_2$$ and $$x = m/n$$; dragging these four points sets $$k_1$$ and $$k_2$$, and $$b$$ and $$n$$ for the chosen $$a$$ and $$m$$. Harvesting subtracts $$E x$$ from the equation for <em>x</em>. Trajectories use the fourth-order Runge–Kutta method. The shading comes from following a trajectory from the centre of each small square of the plane and recording which equilibrium it approaches.

<p class="mm-note">The tool runs entirely in your browser; nothing is recorded or sent anywhere. It is a learning aid and is not assessed.</p>

<script src="{{ '/assets/js/teaching/mm-tools.js' | relative_url }}"></script>
<script>
  (function () {
    var M = window.MMTools;
    var X1 = 10, Y1 = 10, T1 = 60, DT = 0.01;
    var model = "hunter";
    var P = { a: 1, b: 0.25, m: 0.75, n: 0.15, r1: 1, r2: 1, K1: 8, A1: 10, B2: 10, K2: 7, E: 0.3 };
    var on = { E: false, field: false, shade: true };
    var starts = [[3, 3]], drag = null, basinKey = "", basin = null;
    var phase = new M.Plot(document.getElementById("ch-phase"), { x0: 0, x1: X1, y0: 0, y1: Y1, gx: 1, gy: 1, lx: 2, ly: 2, xname: "species x", yname: "species y", aspect: 0.82, aspectNarrow: 0.9, left: 18 });
    var time = new M.Plot(document.getElementById("ch-time"), { x0: 0, x1: T1, y0: 0, y1: X1, gx: 10, gy: 1, lx: 10, ly: 2, xname: "time, t", yname: "population", aspect: 0.82, aspectNarrow: 0.6, left: 18 });
    function harvest() { return on.E ? P.E : 0; }
    function rhs() {
      var E = harvest();
      if (model === "hunter") return function (t, s) { return [(P.a - P.b * s[1]) * s[0] - E * s[0], (P.m - P.n * s[0]) * s[1]]; };
      return function (t, s) { return [P.r1 * s[0] * (1 - s[0] / P.K1 - s[1] / P.A1) - E * s[0], P.r2 * s[1] * (1 - s[1] / P.K2 - s[0] / P.B2)]; };
    }
    // Equilibria with their stability, from the eigenvalues of the Jacobian (numerical derivatives).
    function equilibria() {
      var E = harvest(), list = [[0, 0]];
      if (model === "hunter") {
        if (P.a - E > 0) list.push([P.m / P.n, (P.a - E) / P.b]);
      } else {
        var s = 1 - E / P.r1, k1 = P.K1 * s, a1 = P.A1 * s;
        if (s > 0) list.push([k1, 0]);
        list.push([0, P.K2]);
        // intersection of x/k1 + y/a1 = 1 and x/B2 + y/K2 = 1
        var det = (1 / k1) * (1 / P.K2) - (1 / a1) * (1 / P.B2);
        if (s > 0 && Math.abs(det) > 1e-12) {
          var xs = (1 / P.K2 - 1 / a1) / det, ys = (1 / k1 - 1 / P.B2) / det;
          if (xs > 1e-9 && ys > 1e-9) list.push([xs, ys]);
        }
      }
      var f = rhs(), h = 1e-5;
      return list.map(function (e) {
        var p = f(0, [e[0] + h, e[1]]), q = f(0, [e[0] - h, e[1]]), u = f(0, [e[0], e[1] + h]), v = f(0, [e[0], e[1] - h]);
        var A = (p[0] - q[0]) / (2 * h), B = (u[0] - v[0]) / (2 * h), C = (p[1] - q[1]) / (2 * h), D = (u[1] - v[1]) / (2 * h);
        var tr = A + D, dt = A * D - B * C, dir = null;
        if (dt < -1e-12) {
          // eigenvector for the negative eigenvalue
          var lam = (tr - Math.sqrt(tr * tr - 4 * dt)) / 2;
          dir = Math.abs(B) > 1e-12 ? [B, lam - A] : Math.abs(C) > 1e-12 ? [lam - D, C] : Math.abs(A - lam) < Math.abs(D - lam) ? [1, 0] : [0, 1];
          var nn = Math.sqrt(dir[0] * dir[0] + dir[1] * dir[1]);
          dir = [dir[0] / nn, dir[1] / nn];
        }
        return { x: e[0], y: e[1], stable: dt > 1e-12 && tr < 0, saddle: dt < -1e-12, stableDir: dir };
      });
    }
    // Where does a trajectory from (x, y) end up? 1: x wins, 2: y wins, 3: both persist.
    function outcome(f, x, y, eqs) {
      var s = [x, y], h = 0.1;
      for (var i = 0; i < 1500; i++) {
        s = M.rk4(f, 0, s, h);
        if (s[0] > 60 || s[1] > 60) return s[0] > s[1] ? 1 : 2;
        for (var k = 0; k < eqs.length; k++) {
          var e = eqs[k];
          if (e.stable && Math.abs(s[0] - e.x) + Math.abs(s[1] - e.y) < 0.02) return e.x > 1e-6 && e.y > 1e-6 ? 3 : e.x > 1e-6 ? 1 : 2;
        }
      }
      if (s[0] < 0.01) return 2;
      if (s[1] < 0.01) return 1;
      return 3;
    }
    function computeBasin(eqs) {
      var coarse = !!drag && drag !== "start", n = coarse ? 20 : 40;
      var key = [model, P.a, P.b, P.m, P.n, P.r1, P.r2, P.K1, P.A1, P.B2, P.K2, harvest(), n].join(",");
      if (key === basinKey) return basin;
      var nx = n, ny = n, f = rhs(), cells = [];
      // With limited growth the outcome is the same everywhere unless two equilibria are stable.
      var stab = eqs.filter(function (e) { return e.stable; });
      if (model === "logistic" && stab.length === 1) {
        var e0 = stab[0], c0 = e0.x > 1e-6 && e0.y > 1e-6 ? 3 : e0.x > 1e-6 ? 1 : 2;
        basinKey = key;
        basin = { nx: 1, ny: 1, cells: [[0, 0, c0]] };
        return basin;
      }
      for (var i = 0; i < nx; i++)
        for (var j = 0; j < ny; j++) {
          var x = ((i + 0.5) * X1) / nx, y = ((j + 0.5) * Y1) / ny;
          cells.push([i, j, outcome(f, x, y, eqs)]);
        }
      basinKey = key;
      basin = { nx: nx, ny: ny, cells: cells };
      return basin;
    }
    function equation() {
      var x = "<em>x</em>", y = "<em>y</em>", E = on.E ? " − <em>E</em>" + x : "";
      var s = model === "hunter"
        ? x + "′ = (<em>a</em> − <em>b</em>" + y + ")" + x + E + ", &nbsp;&nbsp; " + y + "′ = (<em>m</em> − <em>n</em>" + x + ")" + y
        : x + "′ = <em>a</em>(1 − " + x + "/<em>k</em><sub>1</sub>)" + x + " − <em>b</em>" + x + y + E + ", &nbsp;&nbsp; " + y + "′ = <em>m</em>(1 − " + y + "/<em>k</em><sub>2</sub>)" + y + " − <em>n</em>" + x + y;
      document.getElementById("ch-eqn").innerHTML = s;
      document.getElementById("ch-help").textContent = model === "hunter"
        ? "Click the phase plane to start a trajectory, and drag to move it. Dashed lines are nullclines. Filled dots are stable equilibria and open dots unstable ones. Shading shows which species wins from each starting point, and the solid curve is the boundary between the two outcomes."
        : "Drag the four round handles on the axes to move the ends of the nullclines (dashed). Click elsewhere in the phase plane to start a trajectory. Filled dots are stable equilibria and open dots unstable ones. Shading shows the outcome from each starting point.";
    }
    var COL = { 1: "var(--mm-a)", 2: "var(--mm-b)", 3: "var(--mm-c)" };
    function draw() {
      equation();
      var f = rhs(), eqs = equilibria(), E = harvest();
      phase.frame();
      if (on.shade) {
        // Cells are drawn opaque inside a translucent group, so overlapping edges do not show as seams.
        var b = computeBasin(eqs), w = X1 / b.nx, hh = Y1 / b.ny, layer = M.el("g", { opacity: 0.14 }, phase.data);
        b.cells.forEach(function (c) {
          M.el("rect", { x: phase.sx(c[0] * w), y: phase.sy((c[1] + 1) * hh), width: phase.sx(w) - phase.sx(0) + 0.8, height: phase.sy(0) - phase.sy(hh) + 0.8, fill: COL[c[2]], stroke: "none" }, layer);
        });
      }
      // The boundary between outcomes: the curves that flow into the saddle, traced backwards in time.
      eqs.forEach(function (e) {
        if (!e.saddle || e.x < 1e-6 || e.y < 1e-6) return;
        var ev = e.stableDir;
        [1, -1].forEach(function (sg) {
          var sol = M.solve(f, [e.x + sg * 1e-3 * ev[0], e.y + sg * 1e-3 * ev[1]], 0, -40, -0.01, function (t, y) { return y[0] < -0.5 || y[1] < -0.5 || y[0] > X1 * 3 || y[1] > Y1 * 3; });
          phase.path(sol.y, "mm-sep");
        });
      });
      if (on.field) {
        for (var i = 0; i <= 14; i++)
          for (var j = 0; j <= 14; j++) {
            var gx = 0.3 + (i * (X1 - 0.6)) / 14, gy = 0.3 + (j * (Y1 - 0.6)) / 14, v = f(0, [gx, gy]);
            phase.arrow(gx, gy, phase.sx(gx + v[0]) - phase.sx(gx), phase.sy(gy + v[1]) - phase.sy(gy), 12);
          }
      }
      // nullclines (the axes are nullclines too)
      if (model === "hunter") {
        phase.path([[0, (P.a - E) / P.b], [X1, (P.a - E) / P.b]], "mm-null-a");
        phase.path([[P.m / P.n, 0], [P.m / P.n, Y1]], "mm-null-b");
      } else {
        var s = 1 - E / P.r1;
        if (on.E) phase.path([[P.K1, 0], [0, P.A1]], "mm-null-a mm-faded");
        if (s > 0) phase.path([[P.K1 * s, 0], [0, P.A1 * s]], "mm-null-a");
        phase.path([[P.B2, 0], [0, P.K2]], "mm-null-b");
      }
      // trajectories
      var last = null;
      starts.forEach(function (st, idx) {
        var sol = M.solve(f, st, 0, T1, DT, function (t, y) { return y[0] > 40 || y[1] > 40; });
        var latest = idx === starts.length - 1;
        phase.path(sol.y, latest ? "mm-curve" : "mm-curve mm-faded");
        for (var m = 60; latest && m < Math.min(sol.y.length, 2400); m += 160) {
          var p0 = sol.y[m - 1], p1 = sol.y[m];
          if (phase.inside(p1[0], p1[1]) && Math.abs(p1[0] - p0[0]) + Math.abs(p1[1] - p0[1]) > 1e-4) phase.tri(p1[0], p1[1], phase.sx(p1[0]) - phase.sx(p0[0]), phase.sy(p1[1]) - phase.sy(p0[1]), 5.5, "mm-arrow", phase.data);
        }
        phase.circle(st[0], st[1], 4, "mm-dot");
        if (latest) last = sol;
      });
      eqs.forEach(function (e) { if (phase.inside(e.x, e.y)) phase.circle(e.x, e.y, 5, e.stable ? "mm-eq-s" : "mm-eq-u"); });
      // handles for the logistic model
      if (model === "logistic") {
        [["K1", P.K1, 0, "var(--mm-a)"], ["A1", 0, P.A1, "var(--mm-a)"], ["B2", P.B2, 0, "var(--mm-b)"], ["K2", 0, P.K2, "var(--mm-b)"]].forEach(function (hd) {
          var c = phase.circle(hd[1], hd[2], 7, "mm-handle");
          c.setAttribute("stroke", hd[3]);
        });
      }
      // time plot
      time.frame();
      if (last) {
        var n1 = last.t.length, top = 4;
        last.y.forEach(function (v) { top = Math.max(top, Math.min(v[0], 40), Math.min(v[1], 40)); });
        time.o.y1 = Math.ceil(top * 1.1); time.o.gy = time.o.y1 > 12 ? 2 : 1; time.o.ly = time.o.y1 > 12 ? 4 : 2;
        time.frame();
        time.path(last.t.slice(0, n1).map(function (t, i) { return [t, last.y[i][0]]; }), "mm-a");
        time.path(last.t.slice(0, n1).map(function (t, i) { return [t, last.y[i][1]]; }), "mm-b");
      }
      var ly = time.T - 14 * time.K, R = time.W - time.R, K = time.K;
      M.el("line", { x1: R - 160 * K, y1: ly, x2: R - 138 * K, y2: ly, class: "mm-a" }, time.top);
      M.el("text", { x: R - 132 * K, y: ly + 4 * K }, time.top).textContent = "species x";
      M.el("line", { x1: R - 72 * K, y1: ly, x2: R - 50 * K, y2: ly, class: "mm-b" }, time.top);
      M.el("text", { x: R - 44 * K, y: ly + 4 * K }, time.top).textContent = "y";
      // readout
      var txt;
      if (model === "hunter") {
        var sd = eqs[1];
        txt = sd ? "Coexistence equilibrium at x = <b>" + M.fmt(sd.x) + "</b>, y = <b>" + M.fmt(sd.y) + "</b>, a saddle: the species never settle down together, and which one wins depends on where the populations start." : "Species x cannot grow at this harvesting level.";
      } else {
        var st1 = eqs.filter(function (e) { return e.stable; });
        var co = st1.filter(function (e) { return e.x > 1e-6 && e.y > 1e-6; })[0];
        if (co) txt = "Coexistence: both species settle at x = <b>" + M.fmt(co.x) + "</b>, y = <b>" + M.fmt(co.y) + "</b>.";
        else if (st1.length >= 2) txt = "Either species can win: the outcome depends on where the populations start.";
        else if (st1.length === 1) txt = st1[0].x > 1e-6 ? "Species x wins from every starting point with both species present." : "Species y wins from every starting point with both species present.";
        else txt = "";
        // In the textbook's notation the handles give k1 = K1, a/b = A1, k2 = K2 and m/n = B2.
        txt += " <em>k</em><sub>1</sub> = <b>" + M.fmt(P.K1, 1) + "</b>, <em>k</em><sub>2</sub> = <b>" + M.fmt(P.K2, 1) + "</b>, <em>b</em> = <b>" + M.fmt(P.r1 / P.A1, 3) + "</b>, <em>n</em> = <b>" + M.fmt(P.r2 / P.B2, 3) + "</b>.";
      }
      document.getElementById("ch-out").innerHTML = txt + " Shading: <span style=\"color:var(--mm-a)\">■</span> x wins, <span style=\"color:var(--mm-b)\">■</span> y wins, <span style=\"color:var(--mm-c)\">■</span> both persist.";
    }
    // controls
    var box = document.getElementById("ch-controls"), hunterG, logG;
    var g0 = M.group(box, "Model");
    M.select(g0, [["hunter", "Unlimited growth (textbook model)"], ["logistic", "Limited growth"]], model, function (v) {
      model = v; hunterG.style.display = v === "hunter" ? "" : "none"; logG.style.display = v === "hunter" ? "none" : ""; draw();
    });
    hunterG = M.group(box, "Rates");
    [["a", 0.2, 2], ["b", 0.05, 0.5], ["m", 0.2, 2], ["n", 0.05, 0.5]].forEach(function (r) {
      M.slider(hunterG, { label: "<em>" + r[0] + "</em>", min: r[1], max: r[2], step: 0.01, value: P[r[0]], onInput: function (v) { P[r[0]] = v; draw(); } });
    });
    logG = M.group(box, "Rates");
    M.slider(logG, { label: "<em>a</em>", min: 0.2, max: 2, step: 0.05, value: P.r1, onInput: function (v) { P.r1 = v; draw(); } });
    M.slider(logG, { label: "<em>m</em>", min: 0.2, max: 2, step: 0.05, value: P.r2, onInput: function (v) { P.r2 = v; draw(); } });
    logG.style.display = "none";
    var g2 = M.group(box, "Extensions");
    var pair = M.html("span", { class: "mm-pair" }, g2), esl;
    M.checkbox(pair, "Harvest x", on.E, function (c) { on.E = c; esl.el.classList.toggle("mm-dim", !c); draw(); });
    esl = M.slider(pair, { label: "<em>E</em>", min: 0, max: 0.9, step: 0.01, value: P.E, onInput: function (v) { P.E = v; if (on.E) draw(); } });
    esl.el.classList.add("mm-dim");
    var g3 = M.group(box, "Show");
    M.checkbox(g3, "Outcome shading", on.shade, function (c) { on.shade = c; draw(); });
    M.checkbox(g3, "Direction field", on.field, function (c) { on.field = c; draw(); });
    M.button(g3, "Clear trajectories", function () { starts = starts.slice(-1); draw(); });
    // pointer: drag a handle, or click to start a trajectory and drag to move it
    var svg = phase.svg;
    function nearHandle(p) {
      if (model !== "logistic") return null;
      var hs = { K1: [P.K1, 0], A1: [0, P.A1], B2: [P.B2, 0], K2: [0, P.K2] }, best = null, bd = Math.pow(16 * phase.K, 2);
      for (var k in hs) {
        var dx = phase.sx(hs[k][0]) - p.px, dy = phase.sy(hs[k][1]) - p.py, d = dx * dx + dy * dy;
        if (d < bd) { bd = d; best = k; }
      }
      return best;
    }
    svg.addEventListener("pointerdown", function (evt) {
      var p = phase.at(evt), hd = nearHandle(p);
      evt.preventDefault();
      if (hd) drag = hd;
      else if (phase.inside(p.x, p.y)) {
        starts.push([Math.max(p.x, 0.02), Math.max(p.y, 0.02)]);
        if (starts.length > 6) starts.shift();
        drag = "start";
      } else return;
      svg.setPointerCapture(evt.pointerId);
      draw();
    });
    svg.addEventListener("pointermove", function (evt) {
      if (!drag) return;
      var p = phase.at(evt);
      if (drag === "start") starts[starts.length - 1] = [Math.min(Math.max(p.x, 0.02), X1), Math.min(Math.max(p.y, 0.02), Y1)];
      else if (drag === "K1" || drag === "B2") P[drag] = Math.min(Math.max(Math.round(p.x * 10) / 10, 0.5), X1);
      else P[drag] = Math.min(Math.max(Math.round(p.y * 10) / 10, 0.5), Y1);
      draw();
    });
    function release() { var wasHandle = drag && drag !== "start"; drag = null; if (wasHandle) draw(); }
    svg.addEventListener("pointerup", release);
    svg.addEventListener("pointercancel", release);
    M.onResize(draw);
    draw();
  })();
</script>
