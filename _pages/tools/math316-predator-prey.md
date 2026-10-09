---
layout: page
title: Predators and prey
description: An interactive tool for MATH 316, week 13. Explore the Lotka–Volterra model in the phase plane, then add harvesting, limited resources and saturating predation.
permalink: /teaching/math316/tools/predator-prey/
---

[← MATH 316]({{ '/teaching/math316/' | relative_url }})

A prey population <em>x</em> grows on its own; a predator population <em>y</em> declines without prey and grows by eating them. This tool draws the trajectories of the model in the phase plane, next to the populations over time. It supports learning outcomes 9 and 11.

<div class="mm-wrap" id="pp">
  <p class="mm-eqn" id="pp-eqn"></p>
  <div class="mm-panels mm-2">
    <svg id="pp-phase" role="img" aria-label="Phase plane of predators against prey with trajectories and nullclines"></svg>
    <svg id="pp-time" role="img" aria-label="Prey and predator populations against time for the latest trajectory"></svg>
  </div>
  <div class="mm-controls" id="pp-controls"></div>
  <p class="mm-help">Click the phase plane to start a trajectory there, and drag to move it. Arrowheads show the direction of motion. Dashed lines are nullclines, where one population is momentarily not changing. Filled dots are stable equilibria, open dots unstable ones, and a grey dot is a centre. The time plot follows the latest trajectory.</p>
  <p class="mm-readout" id="pp-out"></p>
</div>

## Things to try

1. Start several trajectories. Do they spiral in, spiral out, or close up? Where does a trajectory cross each nullcline, and in which direction is it moving there?
2. In the time plot, which population peaks first? Explain the lag in terms of the model.
3. Compare the averages over a cycle with the equilibrium values, for trajectories that start in different places. What do you notice?
4. Turn on **harvesting** and increase the effort <em>E</em>. What happens to the average numbers of prey and of predators? In the 1920s, D'Ancona noticed that the share of predatory fish in Adriatic catches had risen during the First World War, when fishing was reduced. Can the model explain this?
5. Turn on **limited resources**. What happens to the closed orbits? How small can the carrying capacity <em>K</em> be before the predators die out?
6. With limited resources on, turn on **saturating predation** and slowly increase <em>K</em>. Does giving the prey more resources always make the system settle down?

## How it is computed

The model is

$$\frac{dx}{dt} = a x \left(1 - \frac{x}{K}\right) - \frac{b x y}{1 + h x} - E x, \qquad \frac{dy}{dt} = -c y + \frac{d x y}{1 + h x} - E y.$$

With the extensions off ($$K \to \infty$$, $$h = 0$$, $$E = 0$$) this is the Lotka–Volterra model, $$x' = a x - b x y$$, $$y' = -c y + d x y$$. Trajectories are computed with the fourth-order Runge–Kutta method, with a time step of 0.01. The nullclines come from setting each right-hand side to zero, and the type of the interior equilibrium from the eigenvalues of the Jacobian matrix there.

<p class="mm-note">The tool runs entirely in your browser; nothing is recorded or sent anywhere. It is a learning aid and is not assessed.</p>

<script src="{{ '/assets/js/teaching/mm-tools.js' | relative_url }}"></script>
<script>
  (function () {
    var M = window.MMTools;
    var P = { a: 1, b: 0.5, c: 0.75, d: 0.25, E: 0.2, K: 10, h: 0.1 };
    var on = { E: false, K: false, h: false, field: true, nullc: true };
    var X1 = 12, Y1 = 8, T1 = 200, TP = 100, DT = 0.01;
    // The phase plane widens with the carrying capacity so that large cycles stay in view.
    function domain() {
      X1 = on.K ? Math.max(12, Math.ceil((P.K * 1.1) / 4) * 4) : 12;
      Y1 = (X1 * 2) / 3;
      var step = X1 > 24 ? 4 : X1 > 12 ? 2 : 1;
      phase.o.x1 = X1; phase.o.y1 = Y1; phase.o.gx = step; phase.o.gy = step; phase.o.lx = 2 * step; phase.o.ly = 2 * step;
    }
    var starts = [[5, 2]], dragging = false;
    var phase = new M.Plot(document.getElementById("pp-phase"), { x0: 0, x1: X1, y0: 0, y1: Y1, gx: 1, gy: 1, lx: 2, ly: 2, xname: "prey, x", yname: "predators, y", aspect: 0.7, aspectNarrow: 0.8, left: 18 });
    var time = new M.Plot(document.getElementById("pp-time"), { x0: 0, x1: TP, y0: 0, y1: X1, gx: 10, gy: 1, lx: 20, ly: 2, xname: "time, t", yname: "population", aspect: 0.7, aspectNarrow: 0.6, left: 18 });
    function par() {
      return { a: P.a, b: P.b, c: P.c, d: P.d, E: on.E ? P.E : 0, K: on.K ? P.K : Infinity, h: on.h ? P.h : 0 };
    }
    function rhs(q) {
      return function (t, s) {
        var x = s[0], y = s[1], sat = 1 + q.h * x;
        return [q.a * x * (1 - x / q.K) - (q.b * x * y) / sat - q.E * x, -q.c * y + (q.d * x * y) / sat - q.E * y];
      };
    }
    function interior(q) {
      var den = q.d - q.h * (q.c + q.E);
      if (den <= 0) return null;
      var xs = (q.c + q.E) / den;
      var ys = ((q.a * (1 - xs / q.K) - q.E) * (1 + q.h * xs)) / q.b;
      return ys > 1e-6 ? [xs, ys] : null;
    }
    function jacobianType(q, e) {
      var f = rhs(q), eps = 1e-5;
      var fx1 = f(0, [e[0] + eps, e[1]]), fx0 = f(0, [e[0] - eps, e[1]]), fy1 = f(0, [e[0], e[1] + eps]), fy0 = f(0, [e[0], e[1] - eps]);
      var A = (fx1[0] - fx0[0]) / (2 * eps), B = (fy1[0] - fy0[0]) / (2 * eps), C = (fx1[1] - fx0[1]) / (2 * eps), D = (fy1[1] - fy0[1]) / (2 * eps);
      var tr = A + D, det = A * D - B * C, disc = tr * tr - 4 * det;
      if (det < 0) return { kind: "a saddle", stable: false };
      if (Math.abs(tr) < 1e-6) return { kind: "a centre, with closed orbits around it", stable: null };
      var spiral = disc < 0;
      if (tr < 0) return { kind: spiral ? "a stable spiral" : "a stable node", stable: true };
      return { kind: spiral ? "an unstable spiral" : "an unstable node", stable: false };
    }
    function equation() {
      var x = "<em>x</em>", y = "<em>y</em>";
      var prey = "<em>a</em>" + x + (on.K ? "(1 − " + x + "/<em>K</em>)" : "") + " − " + (on.h ? "<em>b</em>" + x + y + "/(1 + <em>h</em>" + x + ")" : "<em>b</em>" + x + y) + (on.E ? " − <em>E</em>" + x : "");
      var pred = "−<em>c</em>" + y + " + " + (on.h ? "<em>d</em>" + x + y + "/(1 + <em>h</em>" + x + ")" : "<em>d</em>" + x + y) + (on.E ? " − <em>E</em>" + y : "");
      document.getElementById("pp-eqn").innerHTML = x + "′ = " + prey + ", &nbsp;&nbsp; " + y + "′ = " + pred;
    }
    function draw() {
      domain();
      var q = par(), f = rhs(q), e = interior(q);
      equation();
      phase.frame();
      // direction field
      if (on.field) {
        for (var i = 0; i <= 18; i++)
          for (var j = 0; j <= 12; j++) {
            var gx = 0.3 + (i * (X1 - 0.6)) / 18, gy = 0.3 + (j * (Y1 - 0.6)) / 12, v = f(0, [gx, gy]);
            phase.arrow(gx, gy, phase.sx(gx + v[0]) - phase.sx(gx), phase.sy(gy + v[1]) - phase.sy(gy), 13);
          }
      }
      // nullclines
      if (on.nullc) {
        var pn = [];
        for (var k = 0; k <= 300; k++) {
          var xx = (k * X1) / 300;
          pn.push([xx, ((q.a * (1 - xx / q.K) - q.E) * (1 + q.h * xx)) / q.b]);
        }
        phase.path(pn, "mm-null-a");
        phase.path([[0, 0], [0, Y1]], "mm-null-a");
        if (e || q.d - q.h * (q.c + q.E) > 0) {
          var xn = (q.c + q.E) / (q.d - q.h * (q.c + q.E));
          phase.path([[xn, 0], [xn, Y1]], "mm-null-b");
        }
        phase.path([[0, 0], [X1, 0]], "mm-null-b");
      }
      // trajectories
      var last = null;
      starts.forEach(function (s, idx) {
        var sol = M.solve(f, s, 0, T1, DT, function (t, y) { return y[0] > 60 || y[1] > 60; });
        var latest = idx === starts.length - 1;
        var pts = sol.y.map(function (v) { return [v[0], v[1]]; });
        phase.path(pts, latest ? "mm-a" : "mm-a mm-faded");
        for (var m = 100; latest && m < Math.min(pts.length, 1300); m += 170) {
          var p0 = sol.y[m - 1], p1 = sol.y[m];
          if (phase.inside(p1[0], p1[1])) phase.tri(p1[0], p1[1], phase.sx(p1[0]) - phase.sx(p0[0]), phase.sy(p1[1]) - phase.sy(p0[1]), 5.5, latest ? "mm-arrow" : "mm-arrow mm-faded", phase.data);
        }
        phase.circle(s[0], s[1], 4, "mm-dot");
        if (latest) last = sol;
      });
      // equilibria
      var eqs = [[[0, 0], false]];
      if (q.K < Infinity && q.E < q.a) eqs.push([[q.K * (1 - q.E / q.a), 0], e ? false : true]);
      var info = null;
      if (e) {
        info = jacobianType(q, e);
        eqs.push([e, info.stable]);
      }
      eqs.forEach(function (r) { if (phase.inside(r[0][0], r[0][1])) phase.circle(r[0][0], r[0][1], 5, r[1] === true ? "mm-eq-s" : r[1] === null ? "mm-eq-n" : "mm-eq-u"); });
      // time series of the latest trajectory, with the vertical range fitted to it
      var top = 4;
      if (last) last.y.forEach(function (v, i) { if (last.t[i] <= TP) top = Math.max(top, v[0], v[1]); });
      top = Math.min(X1 * 2, Math.ceil(top * 1.15));
      time.o.y1 = top; time.o.gy = top > 10 ? 2 : 1; time.o.ly = top > 10 ? 4 : 2;
      time.frame();
      if (e) {
        time.path([[0, e[0]], [TP, e[0]]], "mm-null-a");
        time.path([[0, e[1]], [TP, e[1]]], "mm-null-b");
      }
      if (last) {
        var n1 = Math.min(last.t.length, Math.round(TP / DT) + 1);
        time.path(last.t.slice(0, n1).map(function (t, i) { return [t, last.y[i][0]]; }), "mm-a");
        time.path(last.t.slice(0, n1).map(function (t, i) { return [t, last.y[i][1]]; }), "mm-b");
      }
      var lg = time.top;
      var ly = time.T - 14 * time.K;
      M.el("line", { x1: time.W - time.R - 150 * time.K, y1: ly, x2: time.W - time.R - 128 * time.K, y2: ly, class: "mm-a" }, lg);
      M.el("text", { x: time.W - time.R - 122 * time.K, y: ly + 4 * time.K }, lg).textContent = "prey";
      M.el("line", { x1: time.W - time.R - 80 * time.K, y1: ly, x2: time.W - time.R - 58 * time.K, y2: ly, class: "mm-b" }, lg);
      M.el("text", { x: time.W - time.R - 52 * time.K, y: ly + 4 * time.K }, lg).textContent = "predators";
      // readout
      var out = "";
      if (e) out += "Interior equilibrium: prey <b>" + M.fmt(e[0]) + "</b>, predators <b>" + M.fmt(e[1]) + "</b>; it is " + info.kind + ". ";
      else out += "There is no equilibrium with both species present: the predators cannot persist. ";
      if (last && last.t.length > 2) {
        var ref = e ? e[0] : 0, cross = [];
        for (var n = 1; n < last.y.length; n++) if (last.y[n - 1][0] < ref && last.y[n][0] >= ref) cross.push(n);
        var i0 = 0, i1 = last.y.length - 1, whole = cross.length >= 2;
        if (whole) { i0 = cross[0]; i1 = cross[cross.length - 1]; }
        var sx = 0, sy = 0;
        for (var r = i0; r < i1; r++) { sx += last.y[r][0]; sy += last.y[r][1]; }
        var cnt = Math.max(1, i1 - i0);
        out += (whole ? "Averages over whole cycles of the latest trajectory" : "Averages over the latest trajectory") + ": prey <b>" + M.fmt(sx / cnt) + "</b>, predators <b>" + M.fmt(sy / cnt) + "</b>.";
      }
      document.getElementById("pp-out").innerHTML = out;
    }
    // controls
    var box = document.getElementById("pp-controls");
    var g1 = M.group(box, "Rates");
    M.slider(g1, { label: "<em>a</em>", min: 0.1, max: 2, step: 0.05, value: P.a, onInput: function (v) { P.a = v; draw(); } });
    M.slider(g1, { label: "<em>b</em>", min: 0.1, max: 1, step: 0.05, value: P.b, onInput: function (v) { P.b = v; draw(); } });
    M.slider(g1, { label: "<em>c</em>", min: 0.1, max: 2, step: 0.05, value: P.c, onInput: function (v) { P.c = v; draw(); } });
    M.slider(g1, { label: "<em>d</em>", min: 0.05, max: 1, step: 0.05, value: P.d, onInput: function (v) { P.d = v; draw(); } });
    var g2 = M.group(box, "Extensions");
    // Each extension is a checkbox with its own slider; the slider is dimmed while the extension is off.
    function extension(label, key, spec) {
      var pair = M.html("span", { class: "mm-pair" }, g2);
      var sl;
      M.checkbox(pair, label, on[key], function (c) { on[key] = c; sl.el.classList.toggle("mm-dim", !c); draw(); });
      spec.onInput = function (v) { P[key] = v; if (!on[key]) return; draw(); };
      sl = M.slider(pair, spec);
      sl.el.classList.toggle("mm-dim", !on[key]);
    }
    extension("Harvesting", "E", { label: "<em>E</em>", min: 0, max: 0.9, step: 0.05, value: P.E });
    extension("Limited resources", "K", { label: "<em>K</em>", min: 2, max: 40, step: 0.5, value: P.K, digits: 1 });
    extension("Saturating predation", "h", { label: "<em>h</em>", min: 0, max: 0.3, step: 0.01, value: P.h });
    var g3 = M.group(box, "Show");
    M.checkbox(g3, "Direction field", on.field, function (c) { on.field = c; draw(); });
    M.checkbox(g3, "Nullclines", on.nullc, function (c) { on.nullc = c; draw(); });
    M.button(g3, "Clear trajectories", function () { starts = starts.slice(-1); draw(); });
    // pointer: click to start a trajectory, drag to move it
    var svg = phase.svg;
    svg.addEventListener("pointerdown", function (evt) {
      var p = phase.at(evt);
      if (!phase.inside(p.x, p.y)) return;
      evt.preventDefault();
      starts.push([Math.max(p.x, 0.01), Math.max(p.y, 0.01)]);
      if (starts.length > 6) starts.shift();
      dragging = true;
      svg.setPointerCapture(evt.pointerId);
      draw();
    });
    svg.addEventListener("pointermove", function (evt) {
      if (!dragging) return;
      var p = phase.at(evt);
      starts[starts.length - 1] = [Math.min(Math.max(p.x, 0.01), X1), Math.min(Math.max(p.y, 0.01), Y1)];
      draw();
    });
    function release() { dragging = false; }
    svg.addEventListener("pointerup", release);
    svg.addEventListener("pointercancel", release);
    M.onResize(draw);
    draw();
  })();
</script>
