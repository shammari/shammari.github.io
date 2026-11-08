// Epidemic dashboard for shammari.github.io/tools/epidemic/: SIR, SIRS, SEIR and SEIRS models for one or two groups.
// Runs entirely in the browser. The model core is a set of pure functions; the interface code follows it.
(function () {
  function rk4(f, t, y, h) {
    const n = y.length,
      k1 = f(t, y),
      y2 = new Array(n),
      y3 = new Array(n),
      y4 = new Array(n);
    for (let i = 0; i < n; i++) y2[i] = y[i] + 0.5 * h * k1[i];
    const k2 = f(t + 0.5 * h, y2);
    for (let i = 0; i < n; i++) y3[i] = y[i] + 0.5 * h * k2[i];
    const k3 = f(t + 0.5 * h, y3);
    for (let i = 0; i < n; i++) y4[i] = y[i] + h * k3[i];
    const k4 = f(t + h, y4),
      out = new Array(n);
    for (let i = 0; i < n; i++) out[i] = y[i] + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
    return out;
  }

  function mixingMatrix(a1, a2, N1, N2, m) {
    const tot = a1 * N1 + a2 * N2,
      w1 = (a1 * N1) / tot,
      w2 = (a2 * N2) / tot;
    return [
      [1 - m + m * w1, m * w2],
      [m * w1, 1 - m + m * w2],
    ];
  }

  function twoGroupR0(p) {
    const N1 = p.N * (1 - p.share / 100),
      N2 = (p.N * p.share) / 100,
      a1 = 1,
      a2 = p.intensity;
    const c = mixingMatrix(a1, a2, N1, N2, p.mixing / 100),
      q = p.R0; // beta/gamma = R0 for a Group 1 person on their own
    const K11 = q * a1 * c[0][0],
      K12 = (q * a1 * c[0][1] * N1) / N2,
      K21 = (q * a2 * c[1][0] * N2) / N1,
      K22 = q * a2 * c[1][1];
    const tr = K11 + K22,
      det = K11 * K22 - K12 * K21;
    return (tr + Math.sqrt(Math.max(0, tr * tr - 4 * det))) / 2;
  }

  // One solver for every model: one or two groups, each with S, E, I, R and a running count of infections.
  function simulate(p, dtIn) {
    const dt = dtIn || 0.05,
      D = p.days,
      steps = Math.round(D / dt),
      perDay = Math.round(1 / dt);
    const outEvery = Math.max(1, Math.round(D / 700 / dt));
    const hasE = p.model === "SEIR" || p.model === "SEIRS";
    const waning = p.model === "SIRS" || p.model === "SEIRS";
    const g = 1 / p.inf,
      s = 1 / p.lat,
      w = waning ? 1 / p.imm : 0;
    const beta = p.R0 * g,
      N = p.N,
      v = p.vacc / 100,
      cut = p.cut / 100;
    const two = !!p.groups;
    const Ns = two ? [N * (1 - p.share / 100), (N * p.share) / 100] : [N];
    const a0 = two ? [1, p.intensity] : [1],
      m = two ? p.mixing / 100 : 0,
      n = Ns.length;
    let seeds = [p.I0];
    if (two) seeds = p.seed === "g1" ? [p.I0, 0] : p.seed === "g2" ? [0, p.I0] : [(p.I0 * Ns[0]) / N, (p.I0 * Ns[1]) / N];
    const on = (t) => p.measures && t >= p.from && t < p.to;
    const targeted = (i) => !two || p.target === "both" || (p.target === "g1" && i === 0) || (p.target === "g2" && i === 1);

    let y = [];
    for (let i = 0; i < n; i++) {
      const I0 = Math.min(seeds[i], 0.2 * Ns[i]),
        R0v = v * Ns[i];
      y.push(Math.max(0, Ns[i] - R0v - I0), 0, I0, R0v, 0);
    }
    const f = (t, y) => {
      const act = on(t),
        a = a0.map((x, i) => x * (act && targeted(i) ? 1 - cut : 1));
      const c = n === 1 ? [[1]] : mixingMatrix(a[0], a[1], Ns[0], Ns[1], m);
      const out = new Array(5 * n);
      for (let i = 0; i < n; i++) {
        let lam = 0;
        for (let j = 0; j < n; j++) lam += (c[i][j] * y[5 * j + 2]) / Ns[j];
        lam *= beta * a[i];
        const S = y[5 * i],
          E = y[5 * i + 1],
          I = y[5 * i + 2],
          R = y[5 * i + 3],
          inc = lam * S;
        out[5 * i] = -inc + w * R;
        out[5 * i + 1] = hasE ? inc - s * E : 0;
        out[5 * i + 2] = (hasE ? s * E : inc) - g * I;
        out[5 * i + 3] = g * I - w * R;
        out[5 * i + 4] = inc;
      }
      return out;
    };

    const grp = Ns.map((Ni) => ({ N: Ni, S: [], E: [], I: [], R: [], cum: [0], daily: [] }));
    const res = { t: [], days: D, N, model: p.model, hasE, waning, groups: two, g: grp, S: [], E: [], I: [], R: [], cum: [0], daily: [] };
    const rec = (t, y) => {
      res.t.push(t);
      let S = 0,
        E = 0,
        I = 0,
        R = 0;
      grp.forEach((G, i) => {
        G.S.push(y[5 * i]);
        G.E.push(y[5 * i + 1]);
        G.I.push(y[5 * i + 2]);
        G.R.push(y[5 * i + 3]);
        S += y[5 * i];
        E += y[5 * i + 1];
        I += y[5 * i + 2];
        R += y[5 * i + 3];
      });
      res.S.push(S);
      res.E.push(E);
      res.I.push(I);
      res.R.push(R);
    };
    rec(0, y);
    let yPrev = y,
      settleEvery = perDay * 200;
    for (let k = 1; k <= steps; k++) {
      y = rk4(f, (k - 1) * dt, y, dt);
      if (k % outEvery === 0 || k === steps) rec(k * dt, y);
      if (p.settle && k % settleEvery === 0) {
        // Stop once nothing has changed (relative to group size) over the last 200 days.
        let diff = 0;
        for (let i = 0; i < n; i++) for (let j = 0; j < 4; j++) diff = Math.max(diff, Math.abs(y[5 * i + j] - yPrev[5 * i + j]) / Ns[i]);
        if (diff < 1e-9) {
          rec(k * dt, y);
          break;
        }
        yPrev = y;
      }
      if (k % perDay === 0) {
        let c = 0;
        grp.forEach((G, i) => {
          G.cum.push(y[5 * i + 4]);
          c += y[5 * i + 4];
        });
        res.cum.push(c);
      }
    }
    for (let d = 0; d + 1 < res.cum.length; d++) {
      res.daily.push(res.cum[d + 1] - res.cum[d]);
      grp.forEach((G) => G.daily.push(G.cum[d + 1] - G.cum[d]));
    }
    res.R0 = two ? twoGroupR0(p) : p.R0;
    return res;
  }

  // Long-run share infectious, one group: I* over N = (1 - 1/R0) / (1 + gamma/sigma + gamma/omega)
  function endemicShare(p) {
    if (p.R0 <= 1) return 0;
    const g = 1 / p.inf,
      hasE = p.model === "SEIRS";
    return (1 - 1 / p.R0) / (1 + (hasE ? g * p.lat : 0) + g * p.imm);
  }

  // Long-run share infectious in each group and overall, for two groups: run forward until it settles.
  const longRunCache = new Map();
  function longRunTwoGroups(p) {
    const key = [p.model, p.R0, p.inf, p.lat, p.imm, p.share, p.intensity, p.mixing].join("|");
    if (longRunCache.has(key)) return longRunCache.get(key);
    const r = simulate({ ...p, days: 15000, measures: false, settle: true }, 0.25);
    const last = (a) => a[a.length - 1];
    const out = { g1: last(r.g[0].I) / r.g[0].N, g2: last(r.g[1].I) / r.g[1].N, all: last(r.I) / r.N };
    if (longRunCache.size > 200) longRunCache.clear();
    longRunCache.set(key, out);
    return out;
  }

  function argmax(a) {
    let k = 0;
    for (let i = 1; i < a.length; i++) if (a[i] > a[k]) k = i;
    return k;
  }

  function wavePeaks(daily) {
    const mx = Math.max(...daily),
      out = [];
    for (let d = 3; d < daily.length - 3; d++) {
      const x = daily[d];
      if (x > 0.1 * mx && x >= daily[d - 1] && x > daily[d + 1] && x >= daily[d - 3] && x > daily[d + 3]) {
        if (!out.length || d - out[out.length - 1] > 10) out.push(d);
      }
    }
    return out;
  }

  (() => {
    const $ = (s) => document.querySelector(s),
      $$ = (s) => [...document.querySelectorAll(s)];
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const DEFAULTS = {
      model: "SIR",
      groups: false,
      R0: 2.5,
      inf: 7,
      lat: 4,
      imm: 365,
      N: 100000,
      I0: 10,
      vacc: 0,
      days: 365,
      measures: false,
      cut: 60,
      from: 30,
      to: 90,
      target: "both",
      share: 20,
      intensity: 3,
      mixing: 20,
      seed: "g2",
    };
    const PRESETS = [
      { id: "fast", name: "Fast outbreak", p: { model: "SIR", R0: 3.5, inf: 5, days: 120 } },
      { id: "slow", name: "Slow burn", p: { model: "SEIR", R0: 1.4, inf: 10, lat: 6, days: 730 } },
      { id: "waning", name: "Waning immunity", p: { model: "SIRS", R0: 2.5, inf: 7, imm: 180, days: 1095 } },
      { id: "early", name: "Lifting measures early", p: { model: "SIR", R0: 2.5, inf: 7, days: 365, measures: true, cut: 70, from: 20, to: 80 } },
      {
        id: "groups",
        name: "Crowded subgroup",
        p: { model: "SIR", groups: true, R0: 1.2, inf: 7, share: 20, intensity: 3, mixing: 20, seed: "g2", days: 365 },
      },
    ];
    const MODEL_DESC = {
      SIR: "Susceptible people become infectious, then recover with lasting immunity.",
      SIRS: "Like SIR, but immunity fades, so recovered people become susceptible again.",
      SEIR: "Adds an exposed stage: newly infected people incubate before they can infect others.",
      SEIRS: "An exposed stage and fading immunity together.",
    };
    const SEED_TEXT = {
      g2: "First cases appear in Group 2.",
      g1: "First cases appear in Group 1.",
      both: "First cases appear in both groups, in proportion to their size.",
    };

    let state = { ...DEFAULTS },
      view = { tab: "comp", unit: "people", log: false },
      activePreset = null;
    let kept = [];
    let sim = null,
      refSim = null,
      cursorDay = null,
      cursorPinned = false,
      chartCtx = null;

    /* ---------- formatting ---------- */
    const months = (d) =>
      ({
        30: "1 month",
        60: "2 months",
        90: "3 months",
        120: "4 months",
        180: "6 months",
        270: "9 months",
        365: "1 year",
        545: "18 months",
        730: "2 years",
        1095: "3 years",
      })[d];
    function fmtNum(n) {
      if (!isFinite(n)) return "–";
      if (n >= 1000) return Number(n.toPrecision(3)).toLocaleString("en-US");
      if (n >= 10) return Math.round(n).toLocaleString("en-US");
      if (n >= 0.05) return n.toFixed(1);
      return "0";
    }
    function fmtPct(x) {
      const p = x * 100;
      if (!isFinite(p)) return "–";
      if (p >= 10) return Math.round(p) + "%";
      if (p >= 1) return p.toFixed(1) + "%";
      if (p >= 0.01) return Number(p.toPrecision(2)) + "%";
      if (p <= 0) return "0%";
      return "<0.01%";
    }
    function fmtAxis(v, pct) {
      if (pct) return (Math.abs(v) < 1e-9 ? 0 : Number(v.toPrecision(3))) + "%";
      if (v >= 1e6) return Number((v / 1e6).toPrecision(3)) + "M";
      if (v >= 1e3) return Number((v / 1e3).toPrecision(3)) + "k";
      return Number(v.toPrecision(3)).toString();
    }
    const both = (x, N) => `${fmtPct(x)} (about ${fmtNum(x * N)} people)`;
    const r2 = (x) => x.toFixed(2).replace(/0$/, "");

    /* ---------- controls ---------- */
    const ALL = ["SIR", "SIRS", "SEIR", "SEIRS"];
    const CTL = {
      R0: {
        label: "Spread (R₀)",
        models: ALL,
        min: 0.5,
        max: 6,
        step: 0.1,
        fmt: (v) => v.toFixed(1),
        help: "How many people one infected person infects, on average, when everyone else is susceptible. Above 1, an outbreak grows.",
      },
      inf: {
        label: "Infectious for",
        models: ALL,
        min: 2,
        max: 21,
        step: 1,
        fmt: (v) => v + " days",
        help: "How long an infected person can pass the infection on before recovering.",
      },
      lat: {
        label: "Incubation period",
        models: ["SEIR", "SEIRS"],
        min: 1,
        max: 14,
        step: 1,
        fmt: (v) => v + " days",
        help: "Time between being infected and becoming infectious. People in this stage are 'exposed'.",
      },
      imm: {
        label: "Immunity lasts",
        models: ["SIRS", "SEIRS"],
        values: [30, 60, 90, 120, 180, 270, 365, 545, 730],
        fmt: (v) => months(v),
        help: "Average time before a recovered (or vaccinated) person can be infected again.",
      },
      share: {
        label: "Size of Group 2",
        models: ["G"],
        min: 5,
        max: 50,
        step: 5,
        fmt: (v) => v + "% of people",
        help: "Share of the population in Group 2. Group 1 is everyone else.",
      },
      intensity: {
        label: "Contacts in Group 2",
        models: ["G"],
        min: 1,
        max: 5,
        step: 0.5,
        fmt: (v) => "×" + v,
        help: "How many more contacts a person in Group 2 has than a person in Group 1, for example because of crowded living or working conditions.",
      },
      mixing: {
        label: "How freely the groups mix",
        models: ["G"],
        min: 0,
        max: 100,
        step: 5,
        fmt: (v) => (v < 15 ? "Very little" : v < 45 ? "Some" : v < 80 ? "A lot" : "Freely") + ` (${v}%)`,
        help: "The share of everyone's contacts that are spread across the whole population. At 0%, people only meet their own group; at 100%, contacts ignore group.",
      },
      seed: {
        label: "First cases appear in",
        models: ["G"],
        seg: [
          ["g2", "Group 2"],
          ["g1", "Group 1"],
          ["both", "Both"],
        ],
        help: "Where the outbreak starts. 'Both' splits the first cases between the groups in proportion to their size.",
      },
      N: {
        label: "Population",
        models: ALL,
        values: [100000, 500000, 1000000, 2000000, 3000000, 4000000, 5000000, 10000000],
        fmt: (v) => (v >= 1e6 ? v / 1e6 + " million" : v.toLocaleString("en-US")),
        help: "Total number of people. The shape of the curves in % does not depend on it, only on the share of people infected at the start.",
      },
      I0: {
        label: "First cases",
        models: ALL,
        values: [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000],
        fmt: (v) => v + (v === 1 ? " person" : " people"),
        help: "Number of infectious people on day 0.",
      },
      vacc: {
        label: "Vaccinated at the start",
        models: ALL,
        min: 0,
        max: 90,
        step: 5,
        fmt: (v) => v + "%",
        help: "Share of people who are immune on day 0. They count as recovered, not as infected.",
      },
      measures: {
        label: "Add measures",
        models: ALL,
        toggle: true,
        help: "Measures such as distancing or curfews reduce transmission for a period.",
      },
      cut: { label: "Cut transmission by", models: ALL, sub: "measures", min: 10, max: 90, step: 5, fmt: (v) => v + "%" },
      from: { label: "Start on", models: ALL, sub: "measures", min: 0, max: 365, step: 1, fmt: (v) => "day " + v },
      to: { label: "End on", models: ALL, sub: "measures", min: 1, max: 365, step: 1, fmt: (v) => "day " + v },
      target: {
        label: "Applies to",
        models: ["G"],
        sub: "measures",
        seg: [
          ["both", "Everyone"],
          ["g1", "Group 1"],
          ["g2", "Group 2"],
        ],
      },
      days: { label: "Days to simulate", models: ALL, values: [60, 90, 120, 180, 270, 365, 545, 730, 1095], fmt: (v) => v + " days" },
    };
    const SECTIONS = [
      { title: "The infection", keys: ["R0", "inf", "lat", "imm"] },
      { title: "The groups", keys: ["share", "intensity", "mixing", "seed"], models: ["G"] },
      { title: "Population", keys: ["N", "I0", "vacc"] },
      { title: "Measures", keys: ["measures", "cut", "from", "to", "target"] },
      { title: "Time", keys: ["days"] },
    ];

    function buildControls() {
      const root = $("#ed-controls");
      let h =
        `<div class="ed-sec"><p class="ed-h">Try a scenario</p><div class="ed-presets">` +
        PRESETS.map((p) => `<button class="ed-chip ed-sm" data-preset="${p.id}" aria-pressed="false">${p.name}</button>`).join("") +
        `</div></div>`;
      for (const sec of SECTIONS) {
        h += `<div class="ed-sec"${sec.models ? ` data-models="${sec.models.join(" ")}"` : ""}><p class="ed-h">${sec.title}</p>`;
        for (const k of sec.keys) {
          const c = CTL[k],
            help = c.help ? `<p class="ed-help" id="${k}-help" hidden>${c.help}</p>` : "";
          const info = c.help
            ? `<button class="ed-info" type="button" aria-expanded="false" aria-controls="${k}-help" aria-label="About ${c.label}">i</button>`
            : "";
          const attrs = `data-models="${c.models.join(" ")}"${c.sub ? ` data-sub="${c.sub}"` : ""}`;
          if (c.toggle) {
            h += `<div class="ed-ctl" id="ctl-${k}" ${attrs}><div class="ed-ctl-head"><label class="ed-toggle" style="flex:1"><input type="checkbox" id="${k}"> ${c.label}</label>${info}</div>${help}</div>`;
          } else if (c.seg) {
            h += `<div class="ed-ctl" id="ctl-${k}" ${attrs}><div class="ed-ctl-head"><span class="ed-lab" id="${k}-lab">${c.label}</span>${info}</div>
          <div class="ed-seg" role="group" aria-labelledby="${k}-lab">${c.seg.map(([v, t]) => `<button type="button" data-seg="${k}" data-val="${v}" aria-pressed="false">${t}</button>`).join("")}</div>${help}</div>`;
          } else {
            const r = c.values ? `min="0" max="${c.values.length - 1}" step="1"` : `min="${c.min}" max="${c.max}" step="${c.step}"`;
            h += `<div class="ed-ctl" id="ctl-${k}" ${attrs}><div class="ed-ctl-head"><label for="${k}">${c.label}</label><output id="${k}-out" for="${k}"></output>${info}</div>
          <input type="range" id="${k}" ${r}>${help}</div>`;
          }
        }
        h += `</div>`;
      }
      h += `<div class="ed-sec"><p class="ed-h">Compare</p><div class="ed-actions">
      <button class="ed-btn ed-primary" type="button" id="ed-keep">Keep this run</button>
      <button class="ed-btn" type="button" id="ed-clear" hidden>Clear kept runs</button>
      <button class="ed-btn" type="button" id="ed-reset">Reset</button></div>
      <p class="ed-help">Keeps a faded copy of the current curve so you can compare it with the next change (up to 3).</p></div>`;
      root.innerHTML = h;

      root.addEventListener("input", (e) => {
        const k = e.target.id,
          c = CTL[k];
        if (!c) return;
        if (c.toggle) state[k] = e.target.checked;
        else state[k] = c.values ? c.values[+e.target.value] : +e.target.value;
        if (k === "from" && state.to <= state.from) state.to = Math.min(state.days, state.from + 1);
        if (k === "to" && state.from >= state.to) state.from = Math.max(0, state.to - 1);
        if (k === "days") {
          state.from = Math.min(state.from, state.days - 1);
          state.to = Math.min(Math.max(state.to, state.from + 1), state.days);
        }
        changed();
      });
      root.addEventListener("click", (e) => {
        const b = e.target.closest("button");
        if (!b) return;
        if (b.dataset.seg) {
          state[b.dataset.seg] = b.dataset.val;
          changed();
        } else if (b.dataset.preset) applyPreset(b.dataset.preset);
        else if (b.classList.contains("ed-info")) {
          const open = b.getAttribute("aria-expanded") !== "true";
          b.setAttribute("aria-expanded", open);
          document.getElementById(b.getAttribute("aria-controls")).hidden = !open;
        } else if (b.id === "ed-keep") keepRun();
        else if (b.id === "ed-clear") {
          kept = [];
          render();
        } else if (b.id === "ed-reset") {
          state = { ...DEFAULTS, model: state.model, groups: state.groups };
          activePreset = null;
          cursorPinned = false;
          render();
        }
      });
    }

    function syncControls() {
      for (const [k, c] of Object.entries(CTL)) {
        const el = document.getElementById(k);
        if (c.toggle) el.checked = !!state[k];
        else if (c.seg) $$(`[data-seg="${k}"]`).forEach((b) => b.setAttribute("aria-pressed", b.dataset.val === state[k]));
        else {
          if (k === "from") el.max = state.days - 1;
          if (k === "to") el.max = state.days;
          if (c.values) {
            let i = c.values.indexOf(state[k]);
            if (i < 0) i = 0;
            el.value = i;
          } else el.value = state[k];
          document.getElementById(k + "-out").textContent = c.fmt(state[k]);
        }
      }
      $$("#ed-controls [data-models]").forEach((el) => {
        const list = el.dataset.models.split(" ");
        const okModel = list.includes("G") ? state.groups : list.includes(state.model);
        const okSub = !el.dataset.sub || state[el.dataset.sub];
        el.hidden = !(okModel && okSub);
      });
      $$("[data-preset]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.preset === activePreset));
      $$("[data-model]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.model === state.model));
      $$("[data-groups]").forEach((b) => b.setAttribute("aria-pressed", (b.dataset.groups === "1") === state.groups));
      $$("[data-tab]").forEach((b) => b.setAttribute("aria-selected", b.dataset.tab === view.tab));
      $$("[data-unit]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.unit === view.unit));
      $('[data-tab="comp"]').textContent = state.groups ? "Infectious" : "Compartments";
      $("#ed-log").checked = view.log;
      $("#ed-clear").hidden = !kept.length;
      $("#ed-model-desc").textContent =
        MODEL_DESC[state.model] +
        (state.groups
          ? ` The population is split into two groups that differ in how many contacts people have and in how much they mix; each group follows ${state.model}. ${SEED_TEXT[state.seed]}`
          : "");
      $('label[for="R0"]').textContent = state.groups ? "Spread in Group 1 (R₀)" : CTL.R0.label;
      $("#R0-help").textContent = state.groups
        ? "How many people one infected person in Group 1 would infect if Group 1 were on its own and everyone were susceptible. The overall R₀ on the card also accounts for Group 2's extra contacts and for mixing."
        : CTL.R0.help;
    }

    function applyPreset(id) {
      const pr = PRESETS.find((p) => p.id === id);
      state = { ...DEFAULTS, ...pr.p };
      activePreset = id;
      cursorPinned = false;
      render();
    }

    let raf = 0;
    function changed() {
      activePreset = null;
      cursorPinned = false;
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          render();
        });
    }

    function runLabel(p) {
      let s = p.model + (p.groups ? " · two groups" : "") + " · R₀ " + p.R0.toFixed(1);
      if (p.groups) s += ` · mixing ${p.mixing}%`;
      if (p.measures) s += " · measures";
      if (p.vacc) s += ` · ${p.vacc}% vaccinated`;
      return s;
    }
    function keepRun() {
      kept.push({ label: runLabel(state), sim });
      if (kept.length > 3) kept.shift();
      render();
    }

    /* ---------- summary ---------- */
    function summarize() {
      const p = state,
        N = sim.N,
        D = p.days,
        I = sim.I,
        k = argmax(I),
        peakDay = sim.t[k],
        peak = I[k];
      const total = sim.cum[sim.cum.length - 1];
      const dk = argmax(sim.daily),
        dpk = sim.daily[dk];
      const stillRising = k >= I.length - 2 && peak > 1;
      const R0 = sim.R0,
        Reff = R0 * (1 - p.vacc / 100),
        herd = R0 > 1 ? 1 - 1 / R0 : 0;
      const pct = view.unit === "pct";
      const show = (x, base) => (pct ? fmtPct(x / base) : fmtNum(x));

      $("#c-peak").textContent = show(peak, N);
      $("#c-peak-s").textContent = stillRising ? `still rising on day ${D}` : `on day ${Math.round(peakDay)}`;
      $("#c-new").textContent = show(dpk, N);
      $("#c-new-s").textContent = `on day ${dk + 1}`;
      $("#c-r0").textContent = r2(R0);
      $("#c-r0-s").textContent =
        R0 <= 1
          ? "below 1: no outbreak"
          : p.vacc
            ? `${r2(Reff)} after vaccination; herd immunity at ${fmtPct(herd)}`
            : `herd immunity at ${fmtPct(herd)}`;

      let text = "";
      const notes = [];
      const fades = `each case passes the infection to fewer than one person on average, so the outbreak fades out`;

      if (sim.groups) {
        const G1 = sim.g[0],
          G2 = sim.g[1];
        const k1 = argmax(G1.I),
          k2 = argmax(G2.I),
          d1 = Math.round(sim.t[k1]),
          d2 = Math.round(sim.t[k2]);
        const a1 = G1.cum[G1.cum.length - 1] / G1.N,
          a2 = G2.cum[G2.cum.length - 1] / G2.N;
        const start = {
          g2: "The first cases appear in Group 2.",
          g1: "The first cases appear in Group 1.",
          both: "The first cases appear in both groups.",
        }[p.seed];
        const timing =
          Math.abs(d1 - d2) <= 2
            ? `Both groups peak around <b>day ${d2}</b>.`
            : d2 < d1
              ? `Group 2 peaks first, on <b>day ${d2}</b>; Group 1 follows on <b>day ${d1}</b>.`
              : `Group 1 peaks first, on <b>day ${d1}</b>; Group 2 follows on <b>day ${d2}</b>.`;
        if (sim.waning) {
          const lr = R0 > 1 ? longRunTwoGroups(p) : { g1: 0, g2: 0, all: 0 };
          $("#c-total-k").textContent = "Long-run level";
          $("#c-total").textContent = pct ? fmtPct(lr.all) : fmtNum(lr.all * N);
          $("#c-total-s").textContent = lr.all > 1e-6 ? "infectious at any time" : "the infection dies out";
          if (R0 <= 1) text = `${start} With an overall R₀ of ${r2(R0)}, ${fades}.`;
          else
            text = `${start} ${timing} Because immunity fades, infection settles towards about <b>${fmtPct(lr.g2)}</b> of Group 2 and <b>${fmtPct(lr.g1)}</b> of Group 1 infectious at any time.`;
        } else {
          $("#c-total-k").textContent = "Infected in total";
          $("#c-total").textContent = pct ? fmtPct(total / N) : fmtNum(total);
          $("#c-total-s").textContent = `by day ${D}`;
          if (Reff <= 1)
            text = `${start} With an overall R₀ of ${r2(Reff)}${p.vacc ? " after vaccination" : ""}, ${fades}. By day ${D}, ${fmtPct(a2)} of Group 2 and ${fmtPct(a1)} of Group 1 have been infected.`;
          else {
            text = `${start} ${timing} By day ${D}, <b>${fmtPct(a2)}</b> of Group 2 and <b>${fmtPct(a1)}</b> of Group 1 have been infected, although Group 2 is only ${p.share}% of the population.`;
            if (sim.t[k1] >= D - 1 || sim.t[k2] >= D - 1) notes.push("Infections are still rising at the end; try simulating for longer.");
          }
        }
      } else if (sim.waning) {
        const end = endemicShare(p);
        $("#c-total-k").textContent = "Long-run level";
        $("#c-total").textContent = pct ? fmtPct(end) : fmtNum(end * N);
        $("#c-total-s").textContent = end > 0 ? "infectious at any time" : "the infection dies out";
        if (R0 <= 1) text = `With R₀ at ${R0.toFixed(1)}, ${fades}.`;
        else
          text = `The first wave peaks on <b>day ${Math.round(peakDay)}</b>, with ${both(peak / N, N)} infectious at once. Because immunity fades, people become susceptible again, and infection settles towards about <b>${fmtPct(end)}</b> infectious at any time.`;
      } else {
        $("#c-total-k").textContent = "Infected in total";
        $("#c-total").textContent = pct ? fmtPct(total / N) : fmtNum(total);
        $("#c-total-s").textContent = `by day ${D}`;
        if (Reff <= 1)
          text = `With R₀ at ${R0.toFixed(1)}${p.vacc ? ` and ${p.vacc}% vaccinated` : ""}, ${fades}. By day ${D}, ${fmtPct(total / N)} have been infected.`;
        else if (stillRising) text = `Infections are still rising on day ${D}, with ${both(peak / N, N)} infectious. Try simulating for longer.`;
        else {
          text = `Infections peak on <b>day ${Math.round(peakDay)}</b>, when ${both(peak / N, N)} are infectious at once. By day ${D}, <b>${fmtPct(total / N)}</b> have been infected in total.`;
          const w = wavePeaks(sim.daily);
          if (w.length >= 2) notes.push(`There are ${w.length} waves of new cases, peaking on days ${w.map((d) => d + 1).join(" and ")}.`);
        }
      }
      if (refSim) {
        const rk = argmax(refSim.I),
          rTot = refSim.cum[refSim.cum.length - 1];
        notes.push(
          `Without the measures, infections would peak on day ${Math.round(refSim.t[rk])} at ${fmtPct(refSim.I[rk] / N)}, and ${fmtPct(rTot / N)} would be infected by day ${D}.`
        );
      }
      $("#ed-readout").innerHTML = text + (notes.length ? " " + notes.join(" ") : "");
      return { peakDay };
    }

    /* ---------- chart ---------- */
    const probe = document.createElement("span");
    probe.style.display = "none";
    $(".ed-root").appendChild(probe);
    const css = (v) => {
      probe.style.color = `var(${v})`;
      return getComputedStyle(probe).color;
    };
    function seriesFor(s, tab, pct, isMain) {
      const N = s.N,
        days = Array.from({ length: s.daily.length }, (_, d) => d + 0.5),
        cumX = Array.from({ length: s.cum.length }, (_, d) => d);
      const sc = (arr, base) => (pct ? arr.map((v) => (100 * v) / base) : arr);
      if (!isMain) {
        if (tab === "comp") return { x: s.t, y: sc(s.I, N) };
        if (tab === "new") return { x: days, y: sc(s.daily, N) };
        return { x: cumX, y: sc(s.cum, N) };
      }
      const out = [];
      if (s.groups) {
        const [G1, G2] = s.g;
        const g1 = { name: "Group 1", color: "--ed-c-g1", w: 2.4 },
          g2 = { name: "Group 2", color: "--ed-c-g2", w: 2.4 },
          all = { name: "All", color: "--ed-muted", w: 1.4 };
        if (tab === "comp")
          out.push({ ...g1, x: s.t, y: sc(G1.I, G1.N) }, { ...g2, x: s.t, y: sc(G2.I, G2.N), area: true }, { ...all, x: s.t, y: sc(s.I, N) });
        else if (tab === "new")
          out.push(
            { ...g1, x: days, y: sc(G1.daily, G1.N) },
            { ...g2, x: days, y: sc(G2.daily, G2.N), area: true },
            { ...all, x: days, y: sc(s.daily, N) }
          );
        else out.push({ ...g1, x: cumX, y: sc(G1.cum, G1.N) }, { ...g2, x: cumX, y: sc(G2.cum, G2.N) }, { ...all, x: cumX, y: sc(s.cum, N) });
        return out;
      }
      if (tab === "comp") {
        out.push({ name: "Susceptible", color: "--ed-c-s", x: s.t, y: sc(s.S, N), w: 2 });
        if (s.hasE) out.push({ name: "Exposed", color: "--ed-c-e", x: s.t, y: sc(s.E, N), w: 2 });
        out.push({ name: "Infectious", color: "--ed-c-i", x: s.t, y: sc(s.I, N), w: 2.6, area: true });
        out.push({ name: "Recovered", color: "--ed-c-r", x: s.t, y: sc(s.R, N), w: 2 });
      } else if (tab === "new") out.push({ name: "New cases", color: "--ed-c-i", x: days, y: sc(s.daily, N), w: 2.2, area: true });
      else out.push({ name: "Infected so far", color: "--ed-accent", x: cumX, y: sc(s.cum, N), w: 2.4, area: true });
      return out;
    }

    function niceStep(range, count) {
      const raw = range / count,
        mag = Math.pow(10, Math.floor(Math.log10(raw))),
        f = raw / mag;
      return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * mag;
    }
    function valAt(x, y, t) {
      if (t <= x[0]) return y[0];
      if (t >= x[x.length - 1]) return y[y.length - 1];
      let lo = 0,
        hi = x.length - 1;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (x[mid] <= t) lo = mid;
        else hi = mid;
      }
      const u = (t - x[lo]) / (x[hi] - x[lo]);
      return y[lo] + u * (y[hi] - y[lo]);
    }

    function drawChart(defaultDay) {
      const wrap = $("#ed-chart"),
        W = Math.max(280, Math.round(wrap.clientWidth)),
        narrow = W < 600;
      const H = narrow ? Math.round(Math.min(230, Math.max(180, W * 0.56))) : 360;
      const pct = view.unit === "pct",
        tab = view.tab,
        D = state.days;
      const main = seriesFor(sim, tab, pct, true);
      const extra = [];
      if (refSim) extra.push({ name: "No measures", color: "--ed-c-ref", dash: "2 4", w: 2, ...seriesFor(refSim, tab, pct, false) });
      const dashes = ["7 4", "3 3", "12 4 3 4"];
      kept.forEach((k, i) =>
        extra.push({ name: "Run " + (i + 1), title: k.label, color: "--ed-c-ref", dash: dashes[i], w: 1.6, ...seriesFor(k.sim, tab, pct, false) })
      );
      const all = [...main, ...extra];

      let ymax = 0;
      for (const s of all) for (let i = 0; i < s.x.length; i++) if (s.x[i] <= D && s.y[i] > ymax) ymax = s.y[i];
      if (!(ymax > 0)) ymax = 1;
      const m = { l: 0, r: 12, t: 24, b: 26 };
      let ticks, ylo, yhi, ty;
      if (view.log) {
        yhi = Math.pow(10, Math.ceil(Math.log10(ymax * 1.02)));
        ylo = Math.max(pct ? 1e-6 : 0.01, yhi / 1e6);
        ticks = [];
        for (let v = ylo; v <= yhi * 1.0001; v *= 10) ticks.push(v);
        if (ticks.length > 5) ticks = ticks.filter((_, i) => (ticks.length - 1 - i) % 2 === 0);
        ty = (v) => Math.log10(Math.max(v, ylo));
      } else {
        const st = niceStep(ymax, narrow ? 4 : 5);
        yhi = Math.ceil((ymax * 1.04) / st) * st;
        ylo = 0;
        ticks = [];
        for (let v = 0; v <= yhi + st / 2; v += st) ticks.push(v);
        ty = (v) => v;
      }
      const labels = ticks.map((v) => fmtAxis(v, pct));
      m.l = Math.max(...labels.map((s) => s.length)) * 7 + 12;
      const pw = W - m.l - m.r,
        ph = H - m.t - m.b;
      const sx = (x) => m.l + (x / D) * pw;
      const t0 = ty(ylo),
        t1 = ty(yhi);
      const sy = (v) => m.t + ph - ((ty(v) - t0) / (t1 - t0)) * ph;

      const fg = css("--ed-fg"),
        muted = css("--ed-muted"),
        grid = css("--ed-grid"),
        accent = css("--ed-accent");
      let g = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" font-family="Roboto, Arial, sans-serif" font-size="11">`;
      g += `<defs><clipPath id="ed-plotclip"><rect x="${m.l}" y="${m.t - 2}" width="${pw}" height="${ph + 4}"/></clipPath></defs>`;
      if (state.measures) {
        const a = sx(Math.min(state.from, D)),
          b = sx(Math.min(state.to, D));
        g += `<rect x="${a}" y="${m.t}" width="${Math.max(0, b - a)}" height="${ph}" fill="${accent}" opacity="0.08"/>`;
        if (b - a > 54) g += `<text x="${a + 6}" y="${m.t + 13}" fill="${accent}" font-weight="500">Measures</text>`;
      }
      ticks.forEach((v, i) => {
        const y = sy(v);
        g += `<line x1="${m.l}" x2="${W - m.r}" y1="${y}" y2="${y}" stroke="${grid}" stroke-width="1"/>`;
        g += `<text x="${m.l - 7}" y="${y + 3.5}" text-anchor="end" fill="${muted}" font-family="Roboto Mono, monospace" font-size="10.5">${labels[i]}</text>`;
      });
      const xs = niceStep(D, narrow ? 4 : 7);
      for (let x = 0; x <= D + 1e-9; x += xs) {
        g += `<line x1="${sx(x)}" x2="${sx(x)}" y1="${m.t + ph}" y2="${m.t + ph + 4}" stroke="${muted}"/>`;
        g += `<text x="${sx(x)}" y="${m.t + ph + 16}" text-anchor="middle" fill="${muted}" font-family="Roboto Mono, monospace" font-size="10.5">${x}</text>`;
      }
      g += `<line x1="${m.l}" x2="${W - m.r}" y1="${m.t + ph}" y2="${m.t + ph}" stroke="${muted}" stroke-width="1"/>`;
      g += `<text x="${W - m.r}" y="${m.t + ph - 5}" text-anchor="end" fill="${muted}">day</text>`;
      const yUnit = pct ? (state.groups ? "% of each group (All: % of population)" : "% of population") : "people";
      g += `<text x="4" y="${m.t - 12}" fill="${muted}">${yUnit}</text>`;

      const path = (s) => {
        let d = "",
          started = false;
        for (let i = 0; i < s.x.length; i++) {
          if (s.x[i] > D + 1e-9) break;
          d += (started ? "L" : "M") + sx(s.x[i]).toFixed(1) + " " + sy(s.y[i]).toFixed(1);
          started = true;
        }
        return d;
      };
      g += `<g clip-path="url(#ed-plotclip)">`;
      for (const s of main)
        if (s.area) {
          const d = path(s);
          if (!d) continue;
          const lastX = Math.min(s.x[s.x.length - 1], D);
          g += `<path d="${d}L${sx(lastX).toFixed(1)} ${m.t + ph}L${sx(s.x[0]).toFixed(1)} ${m.t + ph}Z" fill="${css(s.color)}" opacity="0.12"/>`;
        }
      for (const s of extra)
        g += `<path d="${path(s)}" fill="none" stroke="${css(s.color)}" stroke-width="${s.w}" stroke-dasharray="${s.dash}" stroke-linecap="round" opacity="0.9"/>`;
      for (const s of main) g += `<path d="${path(s)}" fill="none" stroke="${css(s.color)}" stroke-width="${s.w}" stroke-linejoin="round"/>`;
      g += `</g>`;
      g +=
        `<g id="ed-cursor" pointer-events="none"><line id="ed-cur-line" y1="${m.t}" y2="${m.t + ph}" stroke="${fg}" stroke-width="1" stroke-dasharray="3 3" opacity="0.55"/>` +
        main
          .map((s, i) => `<circle id="ed-cur-dot-${i}" r="3.6" fill="${css(s.color)}" stroke="${css("--ed-panel")}" stroke-width="1.5"/>`)
          .join("") +
        `</g>`;
      g += `<rect id="ed-overlay" x="${m.l}" y="${m.t}" width="${pw}" height="${ph}" fill="transparent" style="cursor:crosshair"/>`;
      g += `</svg>`;
      wrap.innerHTML = g;
      wrap.setAttribute(
        "aria-label",
        `${{ comp: state.groups ? "Infectious by group" : "Compartments", new: "Daily new cases", cum: "Cumulative infections" }[tab]} over ${D} days`
      );

      chartCtx = { W, m, pw, D, sx, sy, main, extra, pct, defaultDay };
      const lg = $("#ed-legend");
      lg.innerHTML =
        `<span class="ed-day" id="ed-lg-day"></span>` +
        all
          .map((s, i) => {
            const cls = s.dash ? (s.dash === "2 4" ? "ed-sw-dot" : "ed-sw-dash") : "";
            return `<span class="ed-it"${s.title ? ` title="${s.title}"` : ""}><span class="ed-sw ${cls}" style="border-color:${css(s.color)}"></span>${s.title ? s.name + ": " + s.title.split(" · ").slice(0, 2).join(" · ") : s.name} <span class="ed-val" id="ed-lg-v-${i}"></span></span>`;
          })
          .join("");

      const svg = wrap.querySelector("svg"),
        ov = wrap.querySelector("#ed-overlay");
      const toDay = (e) => {
        const r = svg.getBoundingClientRect();
        const x = (e.clientX - r.left) * (W / r.width);
        return Math.max(0, Math.min(D, ((x - m.l) / pw) * D));
      };
      ov.addEventListener("pointerdown", (e) => {
        cursorPinned = true;
        setCursor(toDay(e));
      });
      ov.addEventListener("pointermove", (e) => {
        if (e.pointerType === "mouse" || e.buttons) {
          cursorPinned = true;
          setCursor(toDay(e));
        }
      });
      ov.addEventListener("pointerleave", (e) => {
        if (e.pointerType === "mouse") {
          cursorPinned = false;
          setCursor(chartCtx.defaultDay);
        }
      });
      setCursor(cursorPinned && cursorDay != null && cursorDay <= D ? cursorDay : defaultDay);
    }

    function setCursor(day) {
      if (!chartCtx) return;
      cursorDay = day;
      const { sx, sy, main, extra, pct } = chartCtx,
        x = sx(day);
      const line = document.getElementById("ed-cur-line");
      line.setAttribute("x1", x);
      line.setAttribute("x2", x);
      const all = [...main, ...extra];
      const fmt = (v) => (pct ? fmtPct(v / 100) : fmtNum(v));
      all.forEach((s, i) => {
        const v = valAt(s.x, s.y, day);
        const el = document.getElementById("ed-lg-v-" + i);
        if (el) el.textContent = fmt(v);
        if (i < main.length) {
          const c = document.getElementById("ed-cur-dot-" + i);
          c.setAttribute("cx", x);
          c.setAttribute("cy", sy(Math.max(v, 1e-12)));
        }
      });
      document.getElementById("ed-lg-day").textContent = (cursorPinned ? "" : "At the peak · ") + "Day " + Math.round(day);
    }

    /* ---------- diagram ---------- */
    // Arrowheads are drawn as explicit triangles pointing along the arrow's final direction (angle in radians).
    function head(x, y, ang, color) {
      const L = 8,
        Wd = 4.5,
        c = Math.cos(ang),
        s = Math.sin(ang);
      const bx = x - L * c,
        by = y - L * s;
      return `<path class="ed-ahd" d="M${x.toFixed(1)} ${y.toFixed(1)}L${(bx - Wd * s).toFixed(1)} ${(by + Wd * c).toFixed(1)}L${(bx + Wd * s).toFixed(1)} ${(by - Wd * c).toFixed(1)}Z" fill="${color}"/>`;
    }
    function drawDiagram() {
      const el = $("#ed-diagram"),
        W = Math.max(260, Math.round(el.clientWidth)),
        wide = W >= 400;
      const col = (v) => css(v),
        muted = css("--ed-muted"),
        panel = css("--ed-panel-2");
      const box = 44,
        labSize = wide ? 11.5 : 13,
        labStyle = wide ? "normal" : "italic";
      const names = { S: "Susceptible", E: "Exposed", I: "Infectious", R: "Recovered" };
      const colors = { S: "--ed-c-s", E: "--ed-c-e", I: "--ed-c-i", R: "--ed-c-r" };
      const nodes = sim.hasE ? ["S", "E", "I", "R"] : ["S", "I", "R"],
        n = nodes.length,
        iI = nodes.indexOf("I");
      const node = (x, y, letter, name, sub) => {
        const color = col(colors[letter]);
        return (
          `<rect x="${x}" y="${y}" width="${box}" height="${box}" rx="10" fill="${panel}" stroke="${color}" stroke-width="2"/>` +
          `<text x="${x + box / 2}" y="${y + box / 2 + 6}" text-anchor="middle" font-size="18" font-weight="500" fill="${color}">${letter}${sub ? `<tspan font-size="11" dy="4">${sub}</tspan>` : ""}</text>` +
          (name ? `<text x="${x + box / 2}" y="${y + box + 15}" text-anchor="middle" font-size="11" fill="${muted}">${name}</text>` : "")
        );
      };
      const arrowInfo = (a) =>
        a === "S"
          ? ["infection", "β", "R0", "Adjust spread (R₀)"]
          : a === "E"
            ? ["incubation", "σ", "lat", "Adjust incubation period"]
            : ["recovery", "γ", "inf", "Adjust infectious period"];
      const straight = (x1, x2, y, label, target, aria, showLabel) =>
        `<g class="ed-hit" tabindex="0" role="button" aria-label="${aria}" data-target="${target}">` +
        `<rect x="${x1}" y="${y - 22}" width="${Math.max(10, x2 - x1)}" height="34" fill="transparent"/>` +
        `<line class="ed-arw" x1="${x1}" y1="${y}" x2="${x2 - 7}" y2="${y}" stroke="${muted}" stroke-width="1.6"/>` +
        head(x2, y, 0, muted) +
        (showLabel
          ? `<text x="${(x1 + x2) / 2}" y="${y - 7}" text-anchor="middle" font-size="${labSize}" fill="${muted}" font-style="${labStyle}">${label}</text>`
          : "") +
        `</g>`;
      // Loop from R back to S, above (dir = -1) or below (dir = +1) the row. The head points straight into S.
      const loop = (xS, xR, yEdge, dir, showLabel) => {
        const ap = yEdge + dir * 32,
          tipY = yEdge + dir * 2,
          endY = yEdge + dir * 9;
        const ly = dir < 0 ? ap - 2 : ap + 13;
        return (
          `<g class="ed-hit" tabindex="0" role="button" aria-label="Adjust how long immunity lasts" data-target="imm">` +
          `<rect x="${xS}" y="${Math.min(ap, yEdge) - 14}" width="${xR - xS}" height="${Math.abs(ap - yEdge) + 18}" fill="transparent"/>` +
          `<path class="ed-arw" d="M${xR} ${yEdge + dir * 2} C ${xR} ${ap}, ${xS} ${ap}, ${xS} ${endY}" fill="none" stroke="${muted}" stroke-width="1.6"/>` +
          head(xS, tipY, dir < 0 ? Math.PI / 2 : -Math.PI / 2, muted) +
          (showLabel
            ? `<text x="${(xR + xS) / 2}" y="${ly}" text-anchor="middle" font-size="${labSize}" fill="${muted}" font-style="${labStyle}">${wide ? "immunity fades" : "ω"}</text>`
            : "") +
          `</g>`
        );
      };
      let g = "",
        H;

      if (sim.groups) {
        const lw = 60,
          top = sim.waning ? 48 : 20,
          rowGap = 54;
        const gap = (W - lw - 4 - n * box) / (n - 1),
          xs = nodes.map((_, i) => lw + i * (box + gap));
        const y1 = top,
          y2 = top + box + rowGap;
        const showWords = wide && gap > 72;
        g += `<text x="0" y="${y1 + box / 2 + 4}" font-size="12" fill="${col("--ed-c-g1")}" font-weight="500">Group 1</text>`;
        g += `<text x="0" y="${y2 + box / 2 + 4}" font-size="12" fill="${col("--ed-c-g2")}" font-weight="500">Group 2</text>`;
        const seedRows = state.seed === "both" ? [0, 1] : state.seed === "g1" ? [0] : [1];
        [y1, y2].forEach((y, r) => {
          nodes.forEach((k, i) => (g += node(xs[i], y, k, "", String(r + 1))));
          for (let i = 0; i < n - 1; i++) {
            const [word, sym, target, aria] = arrowInfo(nodes[i]);
            g += straight(xs[i] + box + 4, xs[i + 1] - 4, y + box / 2, showWords ? word : sym, target, aria, r === 0);
          }
          if (seedRows.includes(r)) {
            const cx = xs[iI] + box - 2,
              cy = y + 2;
            g += `<circle cx="${cx}" cy="${cy}" r="5" fill="${col("--ed-c-i")}" stroke="${panel}" stroke-width="2"><title>First cases start here</title></circle>`;
          }
        });
        if (sim.waning) {
          g += loop(xs[0] + box / 2, xs[n - 1] + box / 2, y1, -1, true);
          g += loop(xs[0] + box / 2, xs[n - 1] + box / 2, y2 + box, 1, false);
        }
        // Infectious people in each group infect susceptible people in the other: dashed links to the other row's infection arrow.
        const midA = (xs[0] + box + xs[1]) / 2,
          xI = xs[iI] + box / 2;
        const link = (x1, y1_, x2, y2_) => {
          const ang = Math.atan2(y2_ - y1_, x2 - x1),
            ex = x2 - 7 * Math.cos(ang),
            ey = y2_ - 7 * Math.sin(ang);
          return (
            `<line class="ed-arw" x1="${x1}" y1="${y1_}" x2="${ex}" y2="${ey}" stroke="${muted}" stroke-width="1.3" stroke-dasharray="4 3"/>` +
            head(x2, y2_, ang, muted)
          );
        };
        const xMidL = (xI + midA) / 2,
          yMidL = (y1 + box + y2) / 2;
        g +=
          `<g class="ed-hit" tabindex="0" role="button" aria-label="Adjust how freely the groups mix" data-target="mixing">` +
          `<rect x="${midA - 8}" y="${y1 + box / 2}" width="${xI - midA + box / 2 + 60}" height="${y2 - y1}" fill="transparent"/>` +
          link(xI - 4, y2 - 2, midA + 3, y1 + box / 2 + 6) +
          link(xI - 4, y1 + box + 2, midA + 3, y2 + box / 2 - 6) +
          `<text x="${xI + box / 2 + 6}" y="${yMidL + 4}" font-size="11.5" fill="${muted}">mixing</text></g>`;
        H = y2 + box + (sim.waning ? 44 : 8);
      } else {
        const top = sim.waning ? 46 : 22,
          pad = 22,
          gap = (W - 2 * pad - n * box) / (n - 1);
        const xs = nodes.map((_, i) => pad + i * (box + gap));
        nodes.forEach((k, i) => (g += node(xs[i], top, k, names[k])));
        const y = top + box / 2;
        for (let i = 0; i < n - 1; i++) {
          const [word, sym, target, aria] = arrowInfo(nodes[i]);
          g += straight(xs[i] + box + 4, xs[i + 1] - 4, y, wide && gap > 72 ? word : sym, target, aria, true);
        }
        if (sim.waning) g += loop(xs[0] + box / 2, xs[n - 1] + box / 2, top, -1, true);
        H = top + box + 22;
      }
      el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" font-family="Roboto, Arial, sans-serif">${g}</svg>`;
    }

    function jumpTo(target) {
      const box = document.getElementById("ctl-" + target);
      if (!box || box.hidden) return;
      box.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
      const inp = box.querySelector("input");
      if (inp) inp.focus({ preventScroll: true });
      box.classList.add("ed-flash");
      setTimeout(() => box.classList.remove("ed-flash"), 1300);
    }

    /* ---------- render ---------- */
    function render() {
      sim = simulate(state);
      refSim = state.measures ? simulate({ ...state, measures: false }) : null;
      syncControls();
      const r = summarize();
      drawDiagram();
      const defaultDay = view.tab === "new" ? argmax(sim.daily) + 0.5 : r.peakDay;
      drawChart(defaultDay);
    }

    /* ---------- wiring ---------- */
    buildControls();
    $$("[data-model]").forEach((b) =>
      b.addEventListener("click", () => {
        const nm = b.dataset.model;
        if (nm === state.model) return;
        state.model = nm;
        if ((nm === "SIRS" || nm === "SEIRS") && state.days < 730) state.days = 1095;
        changed();
      })
    );
    $$("[data-groups]").forEach((b) =>
      b.addEventListener("click", () => {
        const v = b.dataset.groups === "1";
        if (v === state.groups) return;
        state.groups = v;
        changed();
      })
    );
    $$("[data-tab]").forEach((b) =>
      b.addEventListener("click", () => {
        view.tab = b.dataset.tab;
        cursorPinned = false;
        render();
      })
    );
    $$("[data-unit]").forEach((b) =>
      b.addEventListener("click", () => {
        view.unit = b.dataset.unit;
        render();
      })
    );
    $("#ed-log").addEventListener("change", (e) => {
      view.log = e.target.checked;
      render();
    });
    $("#ed-diagram").addEventListener("click", (e) => {
      const a = e.target.closest(".ed-hit");
      if (a) jumpTo(a.dataset.target);
    });
    $("#ed-diagram").addEventListener("keydown", (e) => {
      const a = e.target.closest(".ed-hit");
      if (a && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        jumpTo(a.dataset.target);
      }
    });
    $("#ed-open-groups").addEventListener("click", () => {
      applyPreset("groups");
      $(".ed-root").scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    });

    let lastW = 0;
    new ResizeObserver(() => {
      const w = $("#ed-chart").clientWidth;
      if (Math.abs(w - lastW) > 2) {
        lastW = w;
        if (sim) {
          drawDiagram();
          drawChart(chartCtx ? chartCtx.defaultDay : 0);
        }
      }
    }).observe($(".ed-root"));
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => render());
    new MutationObserver(() => render()).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    render();
  })();
})();
