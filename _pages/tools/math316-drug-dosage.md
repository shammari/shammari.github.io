---
layout: page
title: Prescribing drug dosage
description: An interactive tool for MATH 316, week 11. Explore how repeated doses build up in the bloodstream and design a dosing schedule that is safe and effective.
permalink: /teaching/math316/tools/drug-dosage/
---

[← MATH 316]({{ '/teaching/math316/' | relative_url }})

Between doses, the concentration of a drug in the blood decreases at a rate proportional to the concentration, $$dC/dt = -kC$$. Each dose raises the concentration by $$C_0$$, and doses are repeated every $$T$$ hours. How much drug is left over just before each dose, and how should $$C_0$$ and $$T$$ be chosen so that the concentration stays between the lowest effective level $$L$$ and the highest safe level $$H$$? This tool follows the textbook's model. It supports learning outcomes 1, 10 and 11.

<div class="mm-wrap" id="dd">
  <div class="mm-controls" id="dd-top"></div>
  <svg id="dd-plot" role="img" aria-label="Drug concentration against time, with the safe and effective band between L and H"></svg>
  <div class="mm-controls" id="dd-controls"></div>
  <p class="mm-readout" id="dd-out"></p>
  <h3 style="font-size:1.05rem;margin:1.2rem 0 .3rem">Peaks and residuals as difference equations</h3>
  <svg id="dd-seq" role="img" aria-label="Concentration just after and just before each dose, against the dose number"></svg>
  <p class="mm-help">Just after the <em>n</em>th dose the concentration is <em>C<sub>n</sub></em> (the peaks); just before the next dose it is the residual <em>R</em><sub><em>n</em>+1</sub> = <em>r</em> <em>C<sub>n</sub></em>, where <em>r</em> = <em>e</em><sup>−<em>kT</em></sup> is the fraction left after one interval. So the peaks follow the linear difference equation <em>C</em><sub><em>n</em>+1</sub> = <em>r</em> <em>C<sub>n</sub></em> + <em>C</em><sub>0</sub>, the same kind of model as the digoxin prescription in week 3.</p>
  <p class="mm-readout" id="dd-seq-out"></p>
</div>

## Things to try

1. With the starting values, does the concentration stay between <em>L</em> and <em>H</em>? Watch the residuals approach their limit <em>R</em>, and check it against $$R = C_0/(e^{kT} - 1)$$.
2. Make <em>T</em> long and then short. When are the doses essentially independent, and when does the drug build up? Relate what you see to the ratio $$R/C_0 = 1/(e^{kT} - 1)$$.
3. Press **use the textbook's schedule**, which sets $$C_0 = H - L$$, $$T = \frac{1}{k}\ln\frac{H}{L}$$ and a loading dose that raises the concentration to <em>H</em>. Why does the concentration then move between <em>L</em> and <em>H</em>? Turn the loading dose off: what goes wrong, and for how long?
4. Set <em>k</em> = 0.01 per hour and <em>T</em> = 10 hours. What is the smallest <em>n</em> for which <em>R<sub>n</sub></em> &gt; 0.5<em>R</em>? Check your answer from the formula for <em>R<sub>n</sub></em>.
5. Suppose <em>H</em> = 2 mg/ml, <em>L</em> = 0.5 mg/ml and <em>k</em> = 0.02 per hour. Design a schedule, then check it with the tool.
6. Load **digoxin**: a daily dose of 0.1 mg, with half of the drug remaining after each day. Compare the peaks with the difference equation $$a_{n+1} = 0.5\,a_n + 0.1$$ from week 3, starting from 0.1, 0.2 and 0.3. What is the equilibrium, and how is it related to $$C_0 + R$$?
7. Turn on **gradual absorption**, for a drug taken by mouth. How do the peaks change? Is the textbook's schedule still safe and effective?

## How it is computed

Between doses, $$C(t) = C(t_n)\,e^{-k(t - t_n)}$$. With equal doses $$C_0$$ every $$T$$ hours, the residual just before dose $$n + 1$$ is

$$R_n = \frac{C_0\, e^{-kT}\left(1 - e^{-nkT}\right)}{1 - e^{-kT}} \;\longrightarrow\; R = \frac{C_0}{e^{kT} - 1},$$

so the concentration settles into a cycle between $$R$$ and $$R + C_0$$. Setting $$C_0 = H - L$$ and $$R = L$$ gives $$e^{kT} = H/L$$, the textbook's dose schedule $$T = \frac{1}{k}\ln\frac{H}{L}$$. With gradual absorption, each dose first enters the gut, $$G' = -k_a G$$, and passes into the blood, $$C' = k_a G - kC$$; this is solved numerically with the fourth-order Runge–Kutta method, and the formulas above no longer apply exactly. The drug and its levels are made up, apart from the textbook's digoxin example; the tool is for learning about the model, not for medical use.

<p class="mm-note">The tool runs entirely in your browser; nothing is recorded or sent anywhere. It is a learning aid and is not assessed.</p>

<script src="{{ '/assets/js/teaching/mm-tools.js' | relative_url }}"></script>
<script>
  (function () {
    var M = window.MMTools;
    var P = { k: 0.1, C0: 1, T: 6, H: 2, L: 0.5, first: 1, N: 12, ka: 1 };
    var oral = false, unit = "mg/ml", sl = {};
    var plot = new M.Plot(document.getElementById("dd-plot"), { x0: 0, x1: 72, y0: 0, y1: 3, gx: 6, gy: 0.5, lx: 12, ly: 1, xname: "time (hours)", yname: "concentration (mg/ml)", aspect: 0.42, aspectNarrow: 0.75, left: 30 });
    var seq = new M.Plot(document.getElementById("dd-seq"), { x0: 0, x1: 12, y0: 0, y1: 3, gx: 1, gy: 0.5, lx: 2, ly: 1, xname: "dose number, n", yname: "", aspect: 0.3, aspectNarrow: 0.6, left: 30 });
    // Simulate N doses. Instant absorption uses the exact exponential; gradual absorption uses RK4 for the gut and blood.
    function simulate() {
      var pts = [], peaks = [], troughs = [], C = 0, G = 0, t = 0;
      for (var n = 0; n < P.N; n++) {
        var dose = n === 0 ? P.first : P.C0;
        if (oral) G += dose; else C += dose;
        var steps = 240, h = P.T / steps, peak = C;
        pts.push([t, C]);
        for (var i = 1; i <= steps; i++) {
          if (oral) {
            var s = M.rk4(function (tt, y) { return [-P.ka * y[0], P.ka * y[0] - P.k * y[1]]; }, 0, [G, C], h);
            G = s[0]; C = s[1];
          } else C = C * Math.exp(-P.k * h);
          if (C > peak) peak = C;
          pts.push([t + i * h, C]);
        }
        peaks.push(peak);
        troughs.push(C);
        t += P.T;
      }
      return { pts: pts, peaks: peaks, troughs: troughs, end: t };
    }
    function fmtU(v) { return M.fmt(v, 3) + " " + unit; }
    function draw() {
      var sim = simulate(), r = Math.exp(-P.k * P.T), R = P.C0 / (Math.exp(P.k * P.T) - 1);
      var top = Math.max(P.H * 1.15, Math.max.apply(null, sim.peaks) * 1.1), ry = M.niceRange(0, top, 6), rx = M.niceRange(0, sim.end, 8);
      plot.o.x1 = rx.hi; plot.o.gx = rx.step; plot.o.lx = rx.step * 2; plot.o.y1 = ry.hi; plot.o.gy = ry.step; plot.o.ly = ry.step * 2;
      plot.o.yname = "concentration (" + unit + ")";
      plot.frame();
      // the safe and effective band
      M.el("rect", { x: plot.sx(0), y: plot.sy(P.H), width: plot.sx(rx.hi) - plot.sx(0), height: plot.sy(P.L) - plot.sy(P.H), style: "fill:var(--mm-c);opacity:.12;stroke:none" }, plot.data);
      plot.path([[0, P.H], [rx.hi, P.H]], "mm-null-b");
      plot.path([[0, P.L], [rx.hi, P.L]], "mm-null-a");
      plot.text(rx.hi, P.H, "H ", { "text-anchor": "end", dy: -4 * plot.K });
      plot.text(rx.hi, P.L, "L ", { "text-anchor": "end", dy: -4 * plot.K });
      if (!oral) { var lr = plot.path([[0, R], [rx.hi, R]], "mm-zero"); lr.style.strokeDasharray = "1 3"; lr.style.strokeWidth = "1.6"; }
      plot.path(sim.pts, "mm-curve");
      sim.troughs.forEach(function (v, i) { var c = plot.circle((i + 1) * P.T, v, 3.2, "mm-dot", plot.data); c.style.fill = "var(--mm-a)"; });
      // readout
      var lastPeak = sim.peaks[sim.peaks.length - 1], lastTrough = sim.troughs[sim.troughs.length - 1];
      var t = "";
      if (!oral) {
        var n95 = Math.ceil(Math.log(0.05) / (-P.k * P.T));
        t += "Fraction left after one interval: <em>r</em> = <em>e</em><sup>−<em>kT</em></sup> = <b>" + M.fmt(r, 3) + "</b>. Limiting residual <em>R</em> = <b>" + fmtU(R) + "</b> (dotted), so the concentration settles between <b>" + M.fmt(R, 3) + "</b> and <b>" + M.fmt(R + P.C0, 3) + "</b>; <em>R</em>/<em>C</em><sub>0</sub> = <b>" + M.fmt(R / P.C0, 3) + "</b>. ";
        if (Math.abs(P.first - P.C0) < 1e-9) t += "Starting from no drug, the residual is within 5% of <em>R</em> after <b>" + n95 + "</b> doses. ";
      } else t += "With gradual absorption, the last cycle runs between <b>" + M.fmt(lastTrough, 3) + "</b> and a peak of <b>" + M.fmt(lastPeak, 3) + "</b> " + unit + ". ";
      var over = sim.peaks.some(function (v) { return v > P.H + 1e-9; }), under = sim.troughs.slice(1).some(function (v) { return v < P.L - 1e-9; });
      t += over && under ? "The concentration both rises above <em>H</em> and falls below <em>L</em>." : over ? "The concentration rises above the highest safe level <em>H</em>." : under ? "After the first dose, the concentration still falls below the lowest effective level <em>L</em>." : "After the first dose, the concentration stays between <em>L</em> and <em>H</em>.";
      t += " The textbook's schedule for these <em>k</em>, <em>H</em> and <em>L</em>: <em>C</em><sub>0</sub> = <em>H</em> − <em>L</em> = <b>" + M.fmt(P.H - P.L, 3) + "</b>, <em>T</em> = (1/<em>k</em>) ln(<em>H</em>/<em>L</em>) = <b>" + M.fmt(Math.log(P.H / P.L) / P.k, 2) + "</b> hours.";
      document.getElementById("dd-out").innerHTML = t;
      // peaks and residuals by dose number
      var ry2 = M.niceRange(0, Math.max(P.H, Math.max.apply(null, sim.peaks)) * 1.1, 4);
      seq.o.x1 = P.N; seq.o.gx = P.N > 20 ? 2 : 1; seq.o.lx = P.N > 20 ? 4 : 2; seq.o.y1 = ry2.hi; seq.o.gy = ry2.step; seq.o.ly = ry2.step * 2; seq.o.yname = unit;
      seq.frame();
      if (!oral) {
        seq.path([[0, R + P.C0], [P.N, R + P.C0]], "mm-null-b");
        seq.path([[0, R], [P.N, R]], "mm-null-a");
      }
      seq.path(sim.peaks.map(function (v, i) { return [i + 1, v]; }), "mm-b");
      seq.path(sim.troughs.map(function (v, i) { return [i + 1, v]; }), "mm-a");
      sim.peaks.forEach(function (v, i) { var c = seq.circle(i + 1, v, 3, "mm-dot", seq.data); c.style.fill = "var(--mm-b)"; });
      sim.troughs.forEach(function (v, i) { var c = seq.circle(i + 1, v, 3, "mm-dot", seq.data); c.style.fill = "var(--mm-a)"; });
      var ly = seq.T - 14 * seq.K, Rr = seq.W - seq.R, K = seq.K;
      M.el("line", { x1: Rr - 230 * K, y1: ly, x2: Rr - 212 * K, y2: ly, class: "mm-b" }, seq.top);
      M.el("text", { x: Rr - 206 * K, y: ly + 4 * K }, seq.top).textContent = "peaks Cₙ";
      M.el("line", { x1: Rr - 120 * K, y1: ly, x2: Rr - 102 * K, y2: ly, class: "mm-a" }, seq.top);
      M.el("text", { x: Rr - 96 * K, y: ly + 4 * K }, seq.top).textContent = "residuals Rₙ₊₁";
      var s = oral
        ? "With gradual absorption the peaks come a little after each dose, and the difference equation above holds only approximately."
        : "Peaks: <em>C</em><sub><em>n</em>+1</sub> = " + M.fmt(r, 4) + " <em>C<sub>n</sub></em> + " + M.fmt(P.C0, 3) + ", with equilibrium <em>C</em><sub>0</sub>/(1 − <em>r</em>) = <b>" + M.fmt(P.C0 / (1 - r), 3) + "</b> = <em>C</em><sub>0</sub> + <em>R</em>.";
      document.getElementById("dd-seq-out").innerHTML = s;
    }
    // controls
    function set(name, v) { P[name] = v; if (sl[name]) sl[name].set(v); }
    var presets = {
      start: function () { unit = "mg/ml"; set("k", 0.1); set("C0", 1); set("T", 6); set("H", 2); set("L", 0.5); set("first", 1); set("N", 12); },
      p4: function () { unit = "mg/ml"; set("k", 0.02); set("C0", 1.5); set("T", 24); set("H", 2); set("L", 0.5); set("first", 1.5); set("N", 12); },
      digoxin: function () { unit = "mg"; set("k", Math.log(2) / 24); set("C0", 0.1); set("T", 24); set("H", 0.3); set("L", 0.1); set("first", 0.1); set("N", 10); },
    };
    var top = document.getElementById("dd-top");
    M.select(M.group(top, "Example"), [["start", "A made-up drug"], ["p4", "Textbook problem: H = 2, L = 0.5, k = 0.02"], ["digoxin", "Digoxin: 0.1 mg daily, half left each day"]], "start", function (v) { presets[v](); draw(); });
    var box = document.getElementById("dd-controls");
    var g1 = M.group(box, "Drug"), g2 = M.group(box, "Schedule"), g3 = M.group(box, "Options");
    sl.k = M.slider(g1, { label: "<em>k</em> (per hour)", min: 0.005, max: 1, step: 0.001, value: P.k, digits: 3, onInput: function (v) { P.k = v; draw(); } });
    sl.H = M.slider(g1, { label: "<em>H</em>", min: 0.1, max: 5, step: 0.01, value: P.H, onInput: function (v) { P.H = Math.max(v, P.L + 0.01); draw(); } });
    sl.L = M.slider(g1, { label: "<em>L</em>", min: 0.01, max: 4, step: 0.01, value: P.L, onInput: function (v) { P.L = Math.min(v, P.H - 0.01); draw(); } });
    sl.C0 = M.slider(g2, { label: "dose <em>C</em><sub>0</sub>", min: 0.01, max: 5, step: 0.01, value: P.C0, onInput: function (v) { P.C0 = v; draw(); } });
    sl.T = M.slider(g2, { label: "every <em>T</em> hours", min: 0.5, max: 120, step: 0.1, value: P.T, digits: 1, onInput: function (v) { P.T = v; draw(); } });
    sl.first = M.slider(g2, { label: "first dose", min: 0.01, max: 6, step: 0.01, value: P.first, onInput: function (v) { P.first = v; draw(); } });
    sl.N = M.slider(g2, { label: "doses", min: 1, max: 40, step: 1, value: P.N, digits: 0, onInput: function (v) { P.N = v; draw(); } });
    M.button(g3, "Use the textbook's schedule", function () {
      set("C0", P.H - P.L); set("T", Math.min(120, Math.log(P.H / P.L) / P.k)); set("first", P.H); draw();
    });
    M.button(g3, "Equal first dose", function () { set("first", P.C0); draw(); });
    var pair = M.html("span", { class: "mm-pair" }, g3), kas;
    M.checkbox(pair, "Gradual absorption", oral, function (c) { oral = c; kas.el.classList.toggle("mm-dim", !c); draw(); });
    kas = M.slider(pair, { label: "<em>k<sub>a</sub></em>", min: 0.1, max: 5, step: 0.05, value: P.ka, onInput: function (v) { P.ka = v; if (oral) draw(); } });
    kas.el.classList.add("mm-dim");
    M.onResize(draw);
    draw();
  })();
</script>
