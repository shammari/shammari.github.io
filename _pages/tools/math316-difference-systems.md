---
layout: page
title: Systems of difference equations
description: An interactive tool for MATH 316, week 3. Iterate systems of difference equations from the textbook, find their equilibrium values and test how sensitive they are to the starting values and the coefficients.
permalink: /teaching/math316/tools/difference-systems/
---

[← MATH 316]({{ '/teaching/math316/' | relative_url }})

When two or more quantities change together, each step of the model updates all of them at once. This tool iterates the systems of difference equations from the textbook: a car rental company, the Battle of Trafalgar, competing owls and hawks, travellers choosing airlines, and a discrete epidemic. For each, look for the equilibrium values, start near them, and ask whether the system stays close, approaches them, or moves away. It supports learning outcomes 1 and 11.

<div class="mm-wrap" id="ds">
  <div class="mm-controls" id="ds-top"></div>
  <p class="mm-eqn" id="ds-eqn"></p>
  <div class="mm-panels mm-2" id="ds-panels">
    <svg id="ds-time" role="img" aria-label="Each variable against the step n"></svg>
    <svg id="ds-phase" role="img" aria-label="The two variables plotted against each other"></svg>
  </div>
  <div class="mm-controls" id="ds-controls"></div>
  <p class="mm-readout" id="ds-out"></p>
  <details style="margin-top:.6rem">
    <summary style="cursor:pointer;font-size:.9rem">Table of values</summary>
    <div class="mm-scroll"><table class="mm-table" id="ds-table"></table></div>
  </details>
</div>

## Things to try

1. **Car rental company.** Try the four starting cases. How many days does it take to get close to the equilibrium (3000, 4000)? Now change the fractions of cars returned to each city. Is the equilibrium sensitive to those coefficients?
2. **Battle of Trafalgar.** Run the full engagement, then Nelson's divide-and-conquer strategy. How many ships does each side have left? In a full engagement, how much better would the British have to fight, as a loss rate, to win?
3. **Owls and hawks.** Start at (151, 199) and at (149, 201). Why do such close starting values lead to opposite outcomes? What happens near the origin? Some values in the table become negative: what does that say about the model, and how could you fix it?
4. **Travellers at a regional airport.** Try the four starting cases. Does the system always approach the same equilibrium? What happens if you start at the origin, and is the origin stable?
5. **Discrete epidemic.** When does the epidemic peak, how many students are ill at once, and how many never catch the flu? Change the transmission coefficient. The number infected grows while <em>a</em> <em>S</em> is larger than the removal rate: check this against the plot.

## How it is computed

Each step applies the equations once to the current values, so $$(x_{n+1}, y_{n+1}) = f(x_n, y_n)$$. Equilibrium values are those that the equations leave unchanged. The starting values, coefficients and the epidemic's transmission coefficient $$a = 0.001407$$ are those of the textbook. In the Battle of Trafalgar, each encounter removes from each side a fixed fraction of the opposing force, and a battle ends when one more encounter would leave the losing side with fewer than one ship; in Nelson's strategy, the survivors of each battle join the next, as in the textbook.

<p class="mm-note">The tool runs entirely in your browser; nothing is recorded or sent anywhere. It is a learning aid and is not assessed.</p>

<script src="{{ '/assets/js/teaching/mm-tools.js' | relative_url }}"></script>
<script>
  (function () {
    var M = window.MMTools;
    var COLS = ["mm-a", "mm-b", "mm-c"];
    // Each model: variables [symbol, name], parameters, one step of the system, equation text, textbook starting cases.
    var models = {
      car: {
        name: "Car rental company",
        vars: [["O", "Orlando"], ["T", "Tampa"]], unit: "cars", steps: 10,
        params: { p: ["returned to Orlando", 0, 1, 0.01, 0.6, 2], q: ["returned to Tampa", 0, 1, 0.01, 0.7, 2] },
        step: function (s, P) { return [P.p * s[0] + (1 - P.q) * s[1], (1 - P.p) * s[0] + P.q * s[1]]; },
        eq: function (P) { return "<em>O</em><sub><em>n</em>+1</sub> = " + M.fmt(P.p) + " <em>O<sub>n</sub></em> + " + M.fmt(1 - P.q) + " <em>T<sub>n</sub></em>, &nbsp; <em>T</em><sub><em>n</em>+1</sub> = " + M.fmt(1 - P.p) + " <em>O<sub>n</sub></em> + " + M.fmt(P.q) + " <em>T<sub>n</sub></em>"; },
        cases: [[7000, 0], [5000, 2000], [2000, 5000], [0, 7000]],
        info: function (P, s0) {
          var tot = s0[0] + s0[1], o = (tot * (1 - P.q)) / (2 - P.p - P.q);
          return isFinite(o) ? "Equilibrium for a fleet of " + M.fmt(tot, 0) + " cars: <b>" + M.fmt(o, 1) + "</b> in Orlando and <b>" + M.fmt(tot - o, 1) + "</b> in Tampa." : "";
        },
      },
      trafalgar: {
        name: "Battle of Trafalgar",
        vars: [["B", "British"], ["F", "French–Spanish"]], unit: "ships", battle: true,
        params: { r: ["loss rate", 0.01, 0.2, 0.01, 0.1, 2] },
        step: function (s, P) { return [s[0] - P.r * s[1], s[1] - P.r * s[0]]; },
        eq: function (P) { return "<em>B</em><sub><em>n</em>+1</sub> = <em>B<sub>n</sub></em> − " + M.fmt(P.r) + " <em>F<sub>n</sub></em>, &nbsp; <em>F</em><sub><em>n</em>+1</sub> = <em>F<sub>n</sub></em> − " + M.fmt(P.r) + " <em>B<sub>n</sub></em>"; },
        cases: [[27, 33]],
      },
      owls: {
        name: "Owls and hawks (competitive hunters)",
        vars: [["O", "owls"], ["H", "hawks"]], unit: "birds", steps: 29, first: 1, // the textbook numbers this table from n = 1
        params: { k1: ["<em>k</em><sub>1</sub>", 0, 0.5, 0.01, 0.2, 2], k2: ["<em>k</em><sub>2</sub>", 0, 0.5, 0.01, 0.3, 2], k3: ["<em>k</em><sub>3</sub>", 0.0002, 0.004, 0.0001, 0.001, 4], k4: ["<em>k</em><sub>4</sub>", 0.0002, 0.004, 0.0001, 0.002, 4] },
        step: function (s, P) { return [(1 + P.k1) * s[0] - P.k3 * s[0] * s[1], (1 + P.k2) * s[1] - P.k4 * s[0] * s[1]]; },
        eq: function (P) { return "<em>O</em><sub><em>n</em>+1</sub> = " + M.fmt(1 + P.k1) + " <em>O<sub>n</sub></em> − " + M.fmt(P.k3, 4) + " <em>O<sub>n</sub>H<sub>n</sub></em>, &nbsp; <em>H</em><sub><em>n</em>+1</sub> = " + M.fmt(1 + P.k2) + " <em>H<sub>n</sub></em> − " + M.fmt(P.k4, 4) + " <em>O<sub>n</sub>H<sub>n</sub></em>"; },
        cases: [[151, 199], [149, 201], [10, 10]],
        info: function (P) { return "Equilibrium values: (0, 0) and (<b>" + M.fmt(P.k2 / P.k4, 1) + "</b>, <b>" + M.fmt(P.k1 / P.k3, 1) + "</b>)."; },
      },
      airport: {
        name: "Travellers at a regional airport",
        vars: [["S", "US Airways"], ["U", "United"], ["A", "American"]], unit: "travellers", steps: 20,
        params: {},
        step: function (s) { return [0.75 * s[0] + 0.2 * s[1] + 0.4 * s[2], 0.05 * s[0] + 0.6 * s[1] + 0.2 * s[2], 0.2 * s[0] + 0.2 * s[1] + 0.4 * s[2]]; },
        eq: function () { return "<em>S</em><sub><em>n</em>+1</sub> = 0.75<em>S<sub>n</sub></em> + 0.20<em>U<sub>n</sub></em> + 0.40<em>A<sub>n</sub></em>, &nbsp; <em>U</em><sub><em>n</em>+1</sub> = 0.05<em>S<sub>n</sub></em> + 0.60<em>U<sub>n</sub></em> + 0.20<em>A<sub>n</sub></em>, &nbsp; <em>A</em><sub><em>n</em>+1</sub> = 0.20<em>S<sub>n</sub></em> + 0.20<em>U<sub>n</sub></em> + 0.40<em>A<sub>n</sub></em>"; },
        cases: [[2222, 778, 1000], [2272, 828, 900], [1000, 1000, 2000], [0, 0, 4000]],
        info: function (P, s0) {
          var s = s0.slice();
          for (var i = 0; i < 2000; i++) s = this.step(s);
          return "Long-run values for these " + M.fmt(s0[0] + s0[1] + s0[2], 0) + " travellers: <b>" + s.map(function (v) { return M.fmt(v, 1); }).join("</b>, <b>") + "</b>.";
        },
      },
      sir: {
        name: "Discrete epidemic (SIR)",
        vars: [["S", "susceptible"], ["I", "infected"], ["R", "removed"]], unit: "students", steps: 20,
        params: { a: ["<em>a</em>", 0.0002, 0.003, 0.000001, 0.001407, 6], g: ["removal rate", 0.1, 1, 0.01, 0.6, 2] },
        step: function (s, P) { return [s[0] - P.a * s[0] * s[1], s[1] - P.g * s[1] + P.a * s[1] * s[0], s[2] + P.g * s[1]]; },
        eq: function (P) { return "<em>S</em>(<em>n</em>+1) = <em>S</em>(<em>n</em>) − " + M.fmt(P.a, 6) + " <em>S</em>(<em>n</em>)<em>I</em>(<em>n</em>), &nbsp; <em>I</em>(<em>n</em>+1) = <em>I</em>(<em>n</em>) − " + M.fmt(P.g) + " <em>I</em>(<em>n</em>) + " + M.fmt(P.a, 6) + " <em>I</em>(<em>n</em>)<em>S</em>(<em>n</em>), &nbsp; <em>R</em>(<em>n</em>+1) = <em>R</em>(<em>n</em>) + " + M.fmt(P.g) + " <em>I</em>(<em>n</em>)"; },
        cases: [[995, 5, 0]],
        info: function (P, s0, rows) {
          var peak = 0;
          rows.forEach(function (r, i) { if (r[1] > rows[peak][1]) peak = i; });
          var last = rows[rows.length - 1];
          return "The number infected peaks at <b>" + M.fmt(rows[peak][1], 4) + "</b> in week <b>" + peak + "</b>; after week " + (rows.length - 1) + ", <b>" + M.fmt(last[0], 1) + "</b> students have still not caught the flu. The number infected grows while <em>S</em> &gt; " + M.fmt(P.g) + "/<em>a</em> = <b>" + M.fmt(P.g / P.a, 1) + "</b>.";
        },
      },
    };
    var key = "car", mdl, P = {}, start = [], nSteps = 10, nelson = false, sliders = {};
    var tplot = new M.Plot(document.getElementById("ds-time"), { x0: 0, x1: 10, y0: 0, y1: 1, gx: 1, gy: 1, xname: "n", yname: "", aspect: 0.7, aspectNarrow: 0.75, left: 34 });
    var pplot = new M.Plot(document.getElementById("ds-phase"), { x0: 0, x1: 1, y0: 0, y1: 1, gx: 1, gy: 1, aspect: 0.7, aspectNarrow: 0.75, left: 34 });
    // A battle: encounters continue until one more would leave the losing side with fewer than one ship.
    function battle(s, r) {
      var out = [s.slice()];
      for (var i = 0; i < 200; i++) {
        var n = [s[0] - r * s[1], s[1] - r * s[0]];
        if (Math.min(n[0], n[1]) < 1) break;
        s = n;
        out.push(s.slice());
      }
      return out;
    }
    // Rows of values with a label for each row. For Nelson's strategy, three battles in turn, survivors joining the next.
    function run() {
      if (mdl.battle) {
        if (!nelson) return battle(start, P.r).map(function (s, i) { return { label: String(i + 1), v: s }; });
        var rows = [], a = battle([13, 3], P.r), endA = a[a.length - 1];
        var b = battle([endA[0] + 14, 17 + endA[1]], P.r), endB = b[b.length - 1];
        var c = battle([endB[0], 13 + endB[1]], P.r);
        [["A", a], ["B", b], ["C", c]].forEach(function (bt) { bt[1].forEach(function (s, i) { rows.push({ label: bt[0] + (i + 1), v: s, battle: bt[0] }); }); });
        return rows;
      }
      var f0 = mdl.first || 0, s = start.slice(), out = [{ label: String(f0), v: s.slice() }];
      for (var k = 0; k < nSteps; k++) { s = mdl.step(s, P); out.push({ label: String(k + 1 + f0), v: s.slice() }); }
      return out;
    }
    function draw() {
      var rows = run(), nv = mdl.vars.length;
      document.getElementById("ds-eqn").innerHTML = mdl.eq(P) + (mdl.battle && nelson ? " &nbsp; (Nelson's strategy: battles A, B and C)" : "");
      // time plot: values against the step, the vertical range fitted to the values
      var lo = 0, hi = 1;
      rows.forEach(function (r) { r.v.forEach(function (v) { if (isFinite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } }); });
      var ry = M.niceRange(lo, hi * 1.05, 6), rx = M.niceRange(0, rows.length - 1 || 1, 8);
      tplot.o.x1 = Math.max(rx.hi, 1); tplot.o.gx = rx.step; tplot.o.lx = rx.step * (rx.hi / rx.step > 10 ? 2 : 1);
      tplot.o.y0 = ry.lo; tplot.o.y1 = ry.hi; tplot.o.gy = ry.step; tplot.o.ly = ry.step * 2; tplot.o.yname = mdl.unit;
      tplot.o.xname = mdl.battle ? "encounter stage" : "n";
      tplot.frame();
      if (ry.lo < 0) tplot.path([[0, 0], [tplot.o.x1, 0]], "mm-zero");
      if (mdl.battle && nelson) {
        rows.forEach(function (r, i) { if (i > 0 && r.battle !== rows[i - 1].battle) tplot.path([[i - 0.5, ry.lo], [i - 0.5, ry.hi]], "mm-zero"); });
      }
      // Separate battles are drawn as separate curves rather than joined across the break.
      function broken(f) {
        var pts = [];
        rows.forEach(function (r, i) { if (i > 0 && r.battle && r.battle !== rows[i - 1].battle) pts.push([NaN, NaN]); pts.push(f(r, i)); });
        return pts;
      }
      for (var j = 0; j < nv; j++) {
        tplot.path(broken(function (r, i) { return [i, r.v[j]]; }), COLS[j]);
        rows.forEach(function (r, i) { var c = tplot.circle(i, r.v[j], 2.6, "mm-dot", tplot.data); c.style.fill = "var(--mm-" + "abc"[j] + ")"; });
      }
      // legend above the plot
      var x = tplot.L + 110 * tplot.K, ly = tplot.T - 14 * tplot.K, need = 0;
      mdl.vars.forEach(function (v) { need += (34 + 7 * v[1].length) * tplot.K; });
      var short = x + need > tplot.W - tplot.R; // on narrow screens the legend uses the symbols only
      mdl.vars.forEach(function (v, i) {
        var lab = short ? v[0] : v[1];
        M.el("line", { x1: x, y1: ly, x2: x + 18 * tplot.K, y2: ly, class: COLS[i] }, tplot.top);
        var t = M.el("text", { x: x + 22 * tplot.K, y: ly + 4 * tplot.K }, tplot.top);
        t.textContent = lab;
        x += (34 + 7 * lab.length) * tplot.K;
      });
      // phase plane for systems of two variables
      var ph = document.getElementById("ds-phase");
      ph.style.display = nv === 2 ? "" : "none";
      document.getElementById("ds-panels").classList.toggle("mm-2", nv === 2);
      if (nv === 2) {
        var xs = rows.map(function (r) { return r.v[0]; }), ys = rows.map(function (r) { return r.v[1]; });
        var px = M.niceRange(Math.min(0, Math.min.apply(null, xs)), Math.max.apply(null, xs) * 1.05 || 1, 5), py = M.niceRange(Math.min(0, Math.min.apply(null, ys)), Math.max.apply(null, ys) * 1.05 || 1, 5);
        pplot.o.x0 = px.lo; pplot.o.x1 = px.hi; pplot.o.gx = px.step; pplot.o.lx = px.step * 2;
        pplot.o.y0 = py.lo; pplot.o.y1 = py.hi; pplot.o.gy = py.step; pplot.o.ly = py.step * 2;
        pplot.o.xname = mdl.vars[0][1] + ", " + mdl.vars[0][0]; pplot.o.yname = mdl.vars[1][1] + ", " + mdl.vars[1][0];
        pplot.frame();
        pplot.path(broken(function (r) { return r.v; }), "mm-curve");
        rows.forEach(function (r, i) { pplot.circle(r.v[0], r.v[1], i === 0 ? 4.5 : 2.4, "mm-dot", pplot.data); });
        if (key === "owls") pplot.circle(P.k2 / P.k4, P.k1 / P.k3, 5, "mm-eq-u");
      }
      // readout
      var last = rows[rows.length - 1].v, txt = "";
      if (mdl.battle) {
        txt = nelson
          ? "After battle C: British <b>" + M.fmt(last[0], 4) + "</b>, French–Spanish <b>" + M.fmt(last[1], 4) + "</b> ships."
          : "After " + rows.length + " stages: British <b>" + M.fmt(last[0], 4) + "</b>, French–Spanish <b>" + M.fmt(last[1], 4) + "</b> ships.";
      } else if (mdl.info) txt = mdl.info(P, start, rows.map(function (r) { return r.v; }));
      document.getElementById("ds-out").innerHTML = txt;
      // table
      var h = "<thead><tr><th>" + (mdl.battle ? "Stage" : "<em>n</em>") + "</th>" + mdl.vars.map(function (v) { return "<th>" + v[1] + "</th>"; }).join("") + "</tr></thead><tbody>";
      rows.forEach(function (r) { h += "<tr><td>" + r.label + "</td>" + r.v.map(function (v) { return "<td>" + M.fmt(v, 4) + "</td>"; }).join("") + "</tr>"; });
      document.getElementById("ds-table").innerHTML = h + "</tbody>";
    }
    // controls
    var top = document.getElementById("ds-top");
    M.select(M.group(top, "System"), Object.keys(models).map(function (k) { return [k, models[k].name]; }), key, function (v) { setModel(v); });
    var box = document.getElementById("ds-controls");
    var gp = M.group(box, "Coefficients"), gs = M.group(box, "Start"), gn = M.group(box, "Steps");
    var stepSlider = M.slider(gn, { label: "", min: 2, max: 60, step: 1, value: nSteps, digits: 0, onInput: function (v) { nSteps = v; draw(); } });
    function startInputs() {
      while (gs.childNodes.length > 1) gs.removeChild(gs.lastChild);
      mdl.cases.forEach(function (c, i) {
        M.button(gs, mdl.cases.length > 1 ? "Case " + (i + 1) : "Textbook start", function () { start = c.slice(); setInputs(); draw(); });
      });
      mdl.vars.forEach(function (v, j) {
        var lab = M.html("label", null, gs);
        lab.innerHTML = "<em>" + v[0] + "</em><sub>0</sub> ";
        var inp = M.html("input", { type: "number", step: "any", value: start[j], style: "width:5.2rem;font:inherit;font-size:.88rem;padding:.1rem .25rem;border:1px solid var(--global-divider-color);border-radius:4px;background:var(--global-bg-color);color:var(--global-text-color)" }, lab);
        inp.setAttribute("data-var", j);
        inp.addEventListener("input", function () { var x = parseFloat(inp.value); if (isFinite(x)) { start[j] = x; draw(); } });
      });
      // The textbook uses a 10% loss rate for the full engagement and 5% for Nelson's three battles.
      if (mdl.battle) M.checkbox(gs, "Nelson's divide-and-conquer strategy", nelson, function (c) { nelson = c; P.r = c ? 0.05 : 0.1; sliders.r.set(P.r); draw(); });
    }
    function setInputs() { gs.querySelectorAll("input[data-var]").forEach(function (inp) { inp.value = start[+inp.getAttribute("data-var")]; }); }
    function setModel(k) {
      key = k; mdl = models[k]; P = {};
      while (gp.childNodes.length > 1) gp.removeChild(gp.lastChild);
      Object.keys(mdl.params).forEach(function (name) {
        var s = mdl.params[name];
        P[name] = s[4];
        sliders[name] = M.slider(gp, { label: s[0], min: s[1], max: s[2], step: s[3], value: s[4], digits: s[5], onInput: function (v) { P[name] = v; draw(); } });
      });
      gp.style.display = Object.keys(mdl.params).length ? "" : "none";
      start = mdl.cases[0].slice();
      if (mdl.battle) { nelson = false; gn.style.display = "none"; } else { gn.style.display = ""; nSteps = mdl.steps; stepSlider.set(nSteps); }
      startInputs();
      draw();
    }
    M.onResize(draw);
    setModel(key);
  })();
</script>
