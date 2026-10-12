// Muscle oxygen explorer for shammari.github.io/tools/oxygen/: steady-state oxygen transport in a synthetic skeletal muscle cross-section.
// Runs entirely in the browser. The model core (geometry and solver) comes first; the interface code follows it.
(function () {
  // CORE START
  const L = 384; // section width, µm (periodic)
  const N = 192; // solver grid nodes per side
  const H = L / N; // grid spacing, µm
  const GAP = 1.8; // half-width of interstitial strip, µm
  const RC = 2.5; // capillary radius, µm
  const PC = 40; // maximum capillary PO2, mmHg
  // Al-Shammari, Gaffney & Egginton 2014, Table II
  const M0 = 15.7e-5; // tissue-average O2 demand at rest, ml O2/(ml·s)
  const KREL = [1, 13.82 / 15.7, 7.85 / 15.7]; // demand relative to type I
  const DALPHA = 2.41e-5 * 3.89e-5; // D·α, ml O2/(cm·s·mmHg)
  const KWALL = 4.0e-6; // capillary wall mass transfer coefficient, ml O2/(cm²·mmHg·s)
  const PM_MM = 0.5; // PO2 at half demand, mmHg
  const PM_ZERO = 0.02; // near zero-order: consumption constant until PO2 is almost 0
  const P50_MB = 5.3; // myoglobin half-saturation PO2, mmHg
  const mbK = (c) => (1.73e-7 * c * 1e-3) / DALPHA; // D_Mb·C_Mb/(Dα), mmHg
  const TYPES = [
    { key: "I", name: "Type I", rel: KREL[0], mb: mbK(10.2) },
    { key: "IIA", name: "Type IIA", rel: KREL[1], mb: mbK(4.98) },
    { key: "IIX", name: "Type IIX", rel: KREL[2], mb: mbK(1.55) },
  ];
  // optional physiology, shared by every section
  const MODEL = { shape: "polygon", kinetics: "mm", mb: false, mbScale: 1, drop: 0, shutFrac: 0, bc: "dirichlet", intensity: 12 };
  const pmNow = () => (MODEL.kinetics === "zero" ? PM_ZERO : PM_MM);
  const capPO2 = (c) => PC - MODEL.drop * c.u; // capillary PO2 at most PC
  function applyShut(sec) {
    // shut the same share of capillaries each time, chosen by a fixed random rank
    const k = Math.round(MODEL.shutFrac * sec.caps.length);
    const order = sec.caps.map((c, i) => i).sort((i, j) => sec.caps[i].r - sec.caps[j].r);
    sec.caps.forEach((c) => {
      c.shut = false;
    });
    for (let i = 0; i < k; i++) sec.caps[order[i]].shut = true;
  }

  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const wrap = (v) => v - L * Math.floor(v / L);
  const mi = (d) => d - L * Math.round(d / L); // minimum image

  // nearest and second-nearest seed at (x, y), plain Voronoi (used to relax seeds and assign types)
  function nearest2(seeds, x, y) {
    let i1 = -1,
      i2 = -1,
      d1 = Infinity,
      d2 = Infinity;
    for (let i = 0; i < seeds.length; i++) {
      const dx = mi(x - seeds[i].x),
        dy = mi(y - seeds[i].y);
      const d = dx * dx + dy * dy;
      if (d < d1) {
        d2 = d1;
        i2 = i1;
        d1 = d;
        i1 = i;
      } else if (d < d2) {
        d2 = d;
        i2 = i;
      }
    }
    return { i1, i2, d1, d2 };
  }
  function bisectorDist(seeds, n) {
    const a = seeds[n.i1],
      b = seeds[n.i2];
    return (n.d2 - n.d1) / (2 * Math.hypot(mi(b.x - a.x), mi(b.y - a.y)));
  }

  // ---- fibre geometry ----
  // polygons: plain Voronoi cells with a uniform gap.
  // realistic: weighted (power) cells sized by fibre type, a mild oblique stretch, a smooth warp that bends the edges,
  // rounded corners that open pockets where fibres meet, and endomysium of varying thickness.
  const GAP_REAL = 2.0,
    RHO = 10,
    NCAND = 4;
  function shapeParams(seed, nF, types, shape) {
    if (shape !== "realistic") return { real: false };
    const r = rng(seed * 7919 + 13);
    const spacing = L / Math.sqrt(nF),
      shift = [-4, 0, 5];
    const w = Float64Array.from(types, (t) => 2 * spacing * (shift[t] + 3 * (2 * r() - 1)));
    const th = r() * Math.PI,
      a = 1.08 + 0.1 * r();
    const modes = (amp, n) =>
      Array.from({ length: n }, () => {
        let kx, ky;
        do {
          kx = Math.round(6 * r()) - 3;
          ky = Math.round(6 * r()) - 3;
        } while (kx === 0 && ky === 0);
        return { kx: (2 * Math.PI * kx) / L, ky: (2 * Math.PI * ky) / L, ph: 2 * Math.PI * r(), amp: amp / n };
      });
    return { real: true, w, a, c: Math.cos(th), s: Math.sin(th), wx: modes(6, 3), wy: modes(6, 3), gw: modes(1, 3) };
  }
  const field = (ms, x, y) => {
    let v = 0;
    for (const m of ms) v += m.amp * Math.sin(m.kx * x + m.ky * y + m.ph);
    return v;
  };
  function metric(g, dx, dy) {
    if (!g.real) return dx * dx + dy * dy;
    const u = (g.c * dx + g.s * dy) / g.a,
      v = (-g.s * dx + g.c * dy) * g.a;
    return u * u + v * v;
  }
  // the three nearest seeds in the shape's metric, from a candidate list (or all seeds)
  function nearest3(sec, X, Y, list) {
    const g = sec.geo,
      sd = sec.seeds,
      n = list ? list.length : sd.length;
    let i1 = -1,
      i2 = -1,
      i3 = -1,
      d1 = Infinity,
      d2 = Infinity,
      d3 = Infinity;
    for (let k = 0; k < n; k++) {
      const i = list ? list[k] : k;
      let d = metric(g, mi(X - sd[i].x), mi(Y - sd[i].y));
      if (g.real) d -= g.w[i];
      if (d < d1) {
        d3 = d2;
        i3 = i2;
        d2 = d1;
        i2 = i1;
        d1 = d;
        i1 = i;
      } else if (d < d2) {
        d3 = d2;
        i3 = i2;
        d2 = d;
        i2 = i;
      } else if (d < d3) {
        d3 = d;
        i3 = i;
      }
    }
    return { i1, i2, i3, d1, d2, d3 };
  }
  const sep = (sec, i, j) => Math.sqrt(metric(sec.geo, mi(sec.seeds[j].x - sec.seeds[i].x), mi(sec.seeds[j].y - sec.seeds[i].y)));
  // fibre index at (x, y), or -1 in the interstitium; base is the nearest cell ignoring the gap
  function classify(sec, x, y, list) {
    const g = sec.geo;
    const X = g.real ? x + field(g.wx, x, y) : x,
      Y = g.real ? y + field(g.wy, x, y) : y;
    const n = nearest3(sec, X, Y, list);
    const G2 = (n.d2 - n.d1) / (2 * sep(sec, n.i1, n.i2));
    if (!g.real) return { f: G2 < GAP ? -1 : n.i1, base: n.i1 };
    const G3 = (n.d3 - n.d1) / (2 * sep(sec, n.i1, n.i3));
    const gl = GAP_REAL + field(g.gw, x, y);
    const t2 = Math.max(0, gl + RHO - G2),
      t3 = Math.max(0, gl + RHO - G3);
    return { f: t2 * t2 + t3 * t3 <= RHO * RHO ? n.i1 : -1, base: n.i1 };
  }
  function fibreAt(sec, x, y) {
    return classify(sec, wrap(x), wrap(y), null).f;
  }

  function makeSection(seed, shape) {
    const r = rng(seed);
    const nF = 36;
    let seeds = [];
    for (let i = 0; i < nF; i++) seeds.push({ x: r() * L, y: r() * L });
    // a few Lloyd steps: regular enough to look like muscle, irregular enough to vary in size
    const M = 96,
      hM = L / M;
    for (let it = 0; it < 4; it++) {
      const sx = new Float64Array(nF),
        sy = new Float64Array(nF),
        c = new Float64Array(nF);
      for (let j = 0; j < M; j++)
        for (let i = 0; i < M; i++) {
          const x = (i + 0.5) * hM,
            y = (j + 0.5) * hM;
          const k = nearest2(seeds, x, y).i1;
          sx[k] += mi(x - seeds[k].x);
          sy[k] += mi(y - seeds[k].y);
          c[k]++;
        }
      seeds = seeds.map((s, k) => ({ x: wrap(s.x + sx[k] / c[k]), y: wrap(s.y + sy[k] / c[k]) }));
    }
    // fibre type: smaller cells tend to be type I
    const area0 = new Float64Array(nF);
    for (let j = 0; j < N; j++)
      for (let i = 0; i < N; i++) {
        const n = nearest2(seeds, i * H, j * H);
        if (bisectorDist(seeds, n) >= GAP) area0[n.i1] += H * H;
      }
    const order = [...Array(nF).keys()].sort((a, b) => area0[a] + 900 * (r() - 0.5) - (area0[b] + 900 * (r() - 0.5)));
    const types = new Int8Array(nF);
    order.forEach((k, rank) => {
      types[k] = rank < nF * 0.4 ? 0 : rank < nF * 0.7 ? 1 : 2;
    });
    const sec = { seed, shape, seeds, types };
    sec.geo = shapeParams(seed, nF, types, shape);
    // candidate seeds, fibre labels and nearest cells on the solver grid
    const NN = N * N;
    sec.cand = new Int16Array(NN * NCAND);
    sec.lab = new Int16Array(NN);
    const base = new Int16Array(NN),
      g = sec.geo;
    for (let j = 0; j < N; j++)
      for (let i = 0; i < N; i++) {
        const x = i * H,
          y = j * H,
          q = j * N + i;
        const X = g.real ? x + field(g.wx, x, y) : x,
          Y = g.real ? y + field(g.wy, x, y) : y;
        const best = [];
        for (let s = 0; s < nF; s++) {
          let d = metric(g, mi(X - seeds[s].x), mi(Y - seeds[s].y));
          if (g.real) d -= g.w[s];
          best.push([d, s]);
        }
        best.sort((a, b) => a[0] - b[0]);
        for (let k = 0; k < NCAND; k++) sec.cand[q * NCAND + k] = best[k][1];
        const c = classify(sec, x, y, sec.cand.subarray(q * NCAND, q * NCAND + NCAND));
        sec.lab[q] = c.f;
        base[q] = c.base;
      }
    // fibre areas and centroids (for labels); a weighted cell can vanish, so count only fibres present
    sec.area = new Float64Array(nF);
    const cx = new Float64Array(nF),
      cy = new Float64Array(nF);
    for (let q = 0; q < NN; q++) {
      const f = sec.lab[q];
      if (f < 0) continue;
      sec.area[f] += H * H;
      cx[f] += mi((q % N) * H - seeds[f].x);
      cy[f] += mi(Math.floor(q / N) * H - seeds[f].y);
    }
    sec.cent = seeds.map((s, k) =>
      sec.area[k] > 0 ? { x: wrap(s.x + (cx[k] * H * H) / sec.area[k]), y: wrap(s.y + (cy[k] * H * H) / sec.area[k]) } : null
    );
    sec.nFib = sec.cent.filter(Boolean).length;
    // nearest interstitial grid node to every node (8-neighbour breadth-first search), used to snap capillaries
    sec.near = new Int32Array(NN).fill(-1);
    const queue = new Int32Array(NN);
    let qh = 0,
      qt = 0;
    for (let q = 0; q < NN; q++)
      if (sec.lab[q] < 0) {
        sec.near[q] = q;
        queue[qt++] = q;
      }
    while (qh < qt) {
      const q = queue[qh++],
        i = q % N,
        j = (q - i) / N;
      for (let dj = -1; dj <= 1; dj++)
        for (let di = -1; di <= 1; di++) {
          const p = ((j + dj + N) % N) * N + ((i + di + N) % N);
          if (sec.near[p] < 0) {
            sec.near[p] = sec.near[q];
            queue[qt++] = p;
          }
        }
    }
    // capillaries at junctions of three fibres
    const cand = [];
    for (let j = 0; j < N; j++)
      for (let i = 0; i < N; i++) {
        const a = base[j * N + i],
          b = base[j * N + ((i + 1) % N)],
          c = base[((j + 1) % N) * N + i],
          d = base[((j + 1) % N) * N + ((i + 1) % N)];
        if (new Set([a, b, c, d]).size >= 3) cand.push({ x: (i + 0.5) * H, y: (j + 0.5) * H });
      }
    const caps = [];
    for (const p of cand) {
      if (caps.some((q) => Math.hypot(mi(p.x - q.x), mi(p.y - q.y)) < 6)) continue;
      caps.push({ x: wrap(p.x), y: wrap(p.y) });
    }
    // keep about 1.6 capillaries per fibre
    const target = Math.round(nF * 1.6);
    while (caps.length > target) caps.splice(Math.floor(r() * caps.length), 1);
    for (const c of caps) {
      const q = snap(sec, c.x, c.y);
      c.x = q.x;
      c.y = q.y;
      c.u = r();
      c.r = r();
      c.shut = false;
    }
    sec.caps = caps;
    return sec;
  }

  // move a point into the interstitium: unchanged if already there, otherwise to the nearest interstitial grid node
  function snap(sec, x, y) {
    x = wrap(x);
    y = wrap(y);
    if (fibreAt(sec, x, y) === -1) return { x, y };
    const q = (Math.round(y / H) % N) * N + (Math.round(x / H) % N),
      p = sec.near[q];
    return { x: (p % N) * H, y: Math.floor(p / N) * H };
  }
  // solver state for a section
  function makeSolver(sec) {
    const n = N * N;
    const S = {
      P: new Float64Array(n).fill(PC),
      K: new Float64Array(n), // consumption M/(Dα), mmHg/µm²
      kap: new Float64Array(n), // myoglobin facilitation, mmHg
      fixVal: new Float64Array(n), // Dirichlet capillary PO2
      beta: new Float64Array(n), // Robin wall exchange, µm⁻²
      bP: new Float64Array(n), // Robin capillary PO2
      lumen: new Uint8Array(n),
      fib: new Int16Array(n), // fibre index or -1
      fixed: new Uint8Array(n),
      useMb: false,
      sweeps: 0,
      converged: false,
      lastDelta: Infinity,
    };
    S.fib.set(sec.lab);
    normaliseDemand(S, sec);
    setCaps(S, sec);
    return S;
  }
  // tissue-average demand at rest = M0, with the published ratios between fibre types
  function normaliseDemand(S, sec) {
    let rel = 0;
    for (let q = 0; q < N * N; q++) if (S.fib[q] >= 0) rel += KREL[sec.types[S.fib[q]]];
    sec.mRest = ((M0 / DALPHA) * 1e-8) / (rel / (N * N)); // type I, mmHg/µm²
  }
  const typeUptake = (sec, t) => sec.mRest * MODEL.intensity * KREL[t] * DALPHA * 1e8; // ml O2/(ml·s)
  function refresh(S, sec) {
    const kI = sec.mRest * MODEL.intensity;
    for (let q = 0; q < N * N; q++) {
      const f = S.fib[q];
      if (f < 0 || S.lumen[q]) {
        S.K[q] = 0;
        S.kap[q] = 0;
        continue;
      }
      S.K[q] = kI * KREL[sec.types[f]];
      S.kap[q] = MODEL.mb ? TYPES[sec.types[f]].mb * MODEL.mbScale : 0;
    }
    S.useMb = MODEL.mb;
    S.converged = false;
  }
  function setTypes(S, sec) {
    refresh(S, sec);
  }
  function setCaps(S, sec) {
    S.fixed.fill(0);
    S.lumen.fill(0);
    S.beta.fill(0);
    const rr = Math.ceil(RC / H) + 1,
      robin = MODEL.bc === "robin";
    for (const c of sec.caps) {
      if (c.shut) continue;
      const ci = Math.round(c.x / H),
        cj = Math.round(c.y / H);
      const nodes = [(((cj % N) + N) % N) * N + (((ci % N) + N) % N)];
      for (let dj = -rr; dj <= rr; dj++)
        for (let di = -rr; di <= rr; di++) {
          const i = ci + di,
            j = cj + dj;
          const q = (((j % N) + N) % N) * N + (((i % N) + N) % N);
          if (q !== nodes[0] && Math.hypot(mi(i * H - c.x), mi(j * H - c.y)) <= RC) nodes.push(q);
        }
      // Robin: wall flux k(Pcap − P) over the perimeter 2πRC, spread over the capillary's nodes
      const b = robin ? ((2 * Math.PI * RC * 1e-4 * KWALL) / (DALPHA * nodes.length * (H * 1e-4) ** 2)) * 1e-8 : 0;
      for (const q of nodes) {
        S.lumen[q] = 1;
        if (robin) {
          S.beta[q] = b;
          S.bP[q] = capPO2(c);
        } else {
          S.fixed[q] = 1;
          S.fixVal[q] = capPO2(c);
          S.P[q] = capPO2(c);
        }
      }
    }
    refresh(S, sec);
  }
  // red–black SOR; Picard-linearised consumption without myoglobin
  function sweep(S, count) {
    if (S.useMb) return sweepMb(S, count);
    const { P, K, fixed, beta, bP } = S,
      w = 1.9,
      h2 = H * H,
      PM = pmNow();
    let maxD = 0;
    for (let c = 0; c < count; c++) {
      maxD = 0;
      for (let colour = 0; colour < 2; colour++) {
        for (let j = 0; j < N; j++) {
          const jn = j === 0 ? N - 1 : j - 1,
            js = j === N - 1 ? 0 : j + 1;
          const row = j * N,
            rn = jn * N,
            rs = js * N;
          for (let i = (j + colour) & 1; i < N; i += 2) {
            const q = row + i;
            if (fixed[q]) continue;
            const iw = i === 0 ? N - 1 : i - 1,
              ie = i === N - 1 ? 0 : i + 1;
            const p = P[q],
              bq = beta[q];
            const sum = P[row + iw] + P[row + ie] + P[rn + i] + P[rs + i] + h2 * bq * bP[q];
            let pn = sum / (4 + (h2 * K[q]) / ((p > 0 ? p : 0) + PM) + h2 * bq);
            pn = p + w * (pn - p);
            if (pn < 0) pn = 0;
            const d = Math.abs(pn - p);
            if (d > maxD) maxD = d;
            P[q] = pn;
          }
        }
      }
      S.sweeps++;
      if (maxD < 2e-4) {
        S.converged = true;
        break;
      }
    }
    S.lastDelta = maxD;
    return S.converged;
  }
  // with myoglobin: flux = -Dα[∇P + κ ∇S(P)], S = P/(P + P50); one Newton step per node per sweep
  function sweepMb(S, count) {
    const { P, K, kap, fixed, beta, bP } = S,
      w = 1.9,
      h2 = H * H,
      p50 = P50_MB,
      PM = pmNow();
    const sat = (p) => p / (p + p50);
    let maxD = 0;
    for (let c = 0; c < count; c++) {
      maxD = 0;
      for (let colour = 0; colour < 2; colour++) {
        for (let j = 0; j < N; j++) {
          const jn = j === 0 ? N - 1 : j - 1,
            js = j === N - 1 ? 0 : j + 1;
          const row = j * N,
            rn = jn * N,
            rs = js * N;
          for (let i = (j + colour) & 1; i < N; i += 2) {
            const q = row + i;
            if (fixed[q]) continue;
            const iw = i === 0 ? N - 1 : i - 1,
              ie = i === N - 1 ? 0 : i + 1;
            const a = row + iw,
              b = row + ie,
              n = rn + i,
              s = rs + i;
            const p = P[q],
              kq = kap[q],
              bq = beta[q];
            const ka = 0.5 * (kq + kap[a]),
              kb = 0.5 * (kq + kap[b]),
              kn = 0.5 * (kq + kap[n]),
              ks = 0.5 * (kq + kap[s]);
            const sq = sat(p);
            const F =
              P[a] +
              P[b] +
              P[n] +
              P[s] -
              4 * p +
              ka * (sat(P[a]) - sq) +
              kb * (sat(P[b]) - sq) +
              kn * (sat(P[n]) - sq) +
              ks * (sat(P[s]) - sq) -
              (h2 * K[q] * p) / (p + PM) +
              h2 * bq * (bP[q] - p);
            const dF = -4 - ((ka + kb + kn + ks) * p50) / ((p + p50) * (p + p50)) - (h2 * K[q] * PM) / ((p + PM) * (p + PM)) - h2 * bq;
            let pn = p - (w * F) / dF;
            if (pn < 0) pn = 0;
            const d = Math.abs(pn - p);
            if (d > maxD) maxD = d;
            P[q] = pn;
          }
        }
      }
      S.sweeps++;
      if (maxD < 2e-4) {
        S.converged = true;
        break;
      }
    }
    S.lastDelta = maxD;
    return S.converged;
  }
  function stats(S, sec, thr) {
    let a = 0,
      sum = 0,
      low = 0,
      min = Infinity,
      up = 0,
      dem = 0;
    const hist = new Float64Array(20),
      PM = pmNow();
    for (let q = 0; q < N * N; q++) {
      if (S.fib[q] < 0) continue;
      const p = S.P[q];
      if (S.K) {
        up += (S.K[q] * p) / (p + PM);
        dem += S.K[q];
      }
      a++;
      sum += p;
      if (p < thr) low++;
      if (p < min) min = p;
      hist[Math.min(19, Math.floor(p / (PC / 20)))]++;
    }
    for (let b = 0; b < 20; b++) hist[b] /= a;
    const mm2 = (L / 1000) ** 2;
    const nPerf = sec.caps.filter((c) => !c.shut).length;
    return {
      mean: sum / a,
      low: low / a,
      min,
      hist,
      met: dem > 0 ? up / dem : 1,
      nCap: sec.caps.length,
      nFib: sec.nFib,
      nPerf,
      cfPerf: nPerf / sec.nFib,
      cdPerf: nPerf / mm2,
      cf: sec.caps.length / sec.nFib,
      cd: sec.caps.length / mm2,
    };
  }
  // CORE END

  // UI
  const TYPE_COLORS = ["#9a3446", "#d5824f", "#3f7fbf"];
  const MAPS = {
    viridis: {
      name: "Viridis",
      stops: ["#440154", "#482878", "#3e4989", "#31688e", "#26828e", "#1f9e89", "#35b779", "#6ece58", "#b5de2b", "#fde725"],
    },
    magma: { name: "Magma", stops: ["#000004", "#180f3d", "#440f76", "#721f81", "#9e2f7f", "#cd4071", "#f1605d", "#fd9668", "#feca8d", "#fcfdbf"] },
    cividis: {
      name: "Cividis",
      stops: ["#00224e", "#123570", "#3b496c", "#575d6d", "#707173", "#8a8779", "#a69d75", "#c4b56c", "#e4cf5b", "#fee838"],
    },
    turbo: {
      name: "Turbo",
      stops: [
        "#30123b",
        "#4145ab",
        "#4675ed",
        "#39a2fc",
        "#1bcfd4",
        "#24eca6",
        "#61fc6c",
        "#a4fc3b",
        "#d1e835",
        "#f3c63a",
        "#fe9b2d",
        "#f36315",
        "#d93806",
        "#b11901",
        "#7a0403",
      ],
    },
  };
  let cmap = "viridis";
  try {
    const m = localStorage.getItem("moe-cmap");
    if (m && MAPS[m]) cmap = m;
  } catch (e) {}
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  function lut(stops) {
    const c = stops.map(hex),
      out = new Uint8Array(256 * 3);
    for (let k = 0; k < 256; k++) {
      const t = (k / 255) * (c.length - 1),
        i = Math.min(c.length - 2, Math.floor(t)),
        f = t - i;
      for (let ch = 0; ch < 3; ch++) out[k * 3 + ch] = Math.round(c[i][ch] + f * (c[i + 1][ch] - c[i][ch]));
    }
    return out;
  }
  let SEQ = lut(MAPS[cmap].stops);
  let DIV,
    TISSUE,
    TOK = {};
  function readTokens() {
    const cs = getComputedStyle(document.querySelector(".ox-root"));
    for (const k of ["ink", "muted", "line", "accent", "tissue", "div-neg", "div-mid", "div-pos", "surface"])
      TOK[k] = cs.getPropertyValue("--ox-" + k).trim();
    DIV = lut([TOK["div-neg"], TOK["div-mid"], TOK["div-pos"]]);
    TISSUE = hex(TOK.tissue.length === 7 ? TOK.tissue : "#efece4");
  }

  const $ = (id) => document.getElementById("ox-" + id);
  const cv = $("tissue"),
    ctx = cv.getContext("2d");
  let sec,
    orig,
    S,
    base = null,
    wantBaseline = true;
  let view = "po2",
    brush = 0,
    thr = 0.5,
    selCap = -1;
  let W = 0,
    CSS = 0,
    disp = null,
    img = null;

  function cloneSec(s) {
    return { seed: s.seed, seeds: s.seeds, types: Int8Array.from(s.types), caps: s.caps.map((c) => ({ ...c })), area: s.area };
  }

  function buildDisplay() {
    const rect = cv.getBoundingClientRect();
    CSS = rect.width;
    W = Math.max(64, Math.round(CSS * Math.min(window.devicePixelRatio || 1, 2)));
    cv.width = W;
    cv.height = W;
    img = ctx.createImageData(W, W);
    disp = new Int16Array(W * W);
    $("sbar").style.width = (50 / L) * CSS + "px";
    for (let py = 0; py < W; py++)
      for (let px = 0; px < W; px++) {
        const x = ((px + 0.5) / W) * L,
          y = ((py + 0.5) / W) * L;
        const q = (Math.round(y / H) % N) * N + (Math.round(x / H) % N);
        disp[py * W + px] = classify(sec, x, y, sec.cand.subarray(q * NCAND, q * NCAND + NCAND)).f;
      }
  }

  function sampleP(arr, x, y) {
    const gx = x / H,
      gy = y / H,
      i0 = Math.floor(gx),
      j0 = Math.floor(gy),
      fx = gx - i0,
      fy = gy - j0;
    const i1 = (i0 + 1) % N,
      j1 = (j0 + 1) % N,
      a = j0 % N,
      c = i0 % N;
    return (arr[a * N + c] * (1 - fx) + arr[a * N + i1] * fx) * (1 - fy) + (arr[j1 * N + c] * (1 - fx) + arr[j1 * N + i1] * fx) * fy;
  }
  let divRange = 5;
  function render() {
    if (!img) return;
    const d = img.data;
    let range = 2;
    if (view === "change" && base) {
      // scale to the 99th percentile of |change| in the fibres; larger changes saturate
      const ch = [];
      for (let q = 0; q < N * N; q++) if (S.fib[q] >= 0) ch.push(Math.abs(S.P[q] - base.P[q]));
      ch.sort((a, b) => a - b);
      const p99 = ch[Math.floor(ch.length * 0.99)] || 0;
      range = p99 <= 1 ? 1 : p99 <= 2 ? 2 : p99 <= 5 ? 5 : p99 <= 10 ? 10 : 20;
    }
    divRange = range;
    const tc = TYPE_COLORS.map(hex);
    for (let py = 0, o = 0; py < W; py++) {
      const y = ((py + 0.5) / W) * L;
      for (let px = 0; px < W; px++, o += 4) {
        const f = disp[py * W + px];
        let r, g, b;
        if (f < 0) {
          [r, g, b] = TISSUE;
        } else if (view === "type") {
          [r, g, b] = tc[sec.types[f]];
        } else {
          const x = ((px + 0.5) / W) * L,
            p = sampleP(S.P, x, y);
          if (view === "change") {
            const dv = base ? p - sampleP(base.P, x, y) : 0;
            const k = Math.max(0, Math.min(255, Math.round((dv / range + 1) * 127.5))) * 3;
            r = DIV[k];
            g = DIV[k + 1];
            b = DIV[k + 2];
          } else {
            const k = Math.max(0, Math.min(255, Math.round((p / PC) * 255))) * 3;
            r = SEQ[k];
            g = SEQ[k + 1];
            b = SEQ[k + 2];
          }
        }
        d[o] = r;
        d[o + 1] = g;
        d[o + 2] = b;
        d[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    const s = W / L,
      dpr = W / CSS;
    // fibre labels
    ctx.font = `500 ${Math.round(10.5 * dpr)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    sec.cent.forEach((p, k) => {
      if (!p) return;
      const t = TYPES[sec.types[k]].key;
      ctx.lineWidth = 3 * dpr;
      ctx.strokeStyle = "rgba(0,0,0,.6)";
      ctx.strokeText(t, p.x * s, p.y * s);
      ctx.fillStyle = "#fff";
      ctx.fillText(t, p.x * s, p.y * s);
    });
    // capillaries (drawn with their periodic images near the edges)
    const R = 5 * dpr;
    sec.caps.forEach((c, k) => {
      for (const ox of [-L, 0, L])
        for (const oy of [-L, 0, L]) {
          const X = (c.x + ox) * s,
            Y = (c.y + oy) * s;
          if (X < -2 * R || Y < -2 * R || X > W + 2 * R || Y > W + 2 * R) continue;
          if (k === selCap) {
            ctx.beginPath();
            ctx.arc(X, Y, R + 5 * dpr, 0, 7);
            ctx.lineWidth = 2 * dpr;
            ctx.strokeStyle = "#fff";
            ctx.stroke();
          }
          ctx.beginPath();
          ctx.arc(X, Y, R, 0, 7);
          if (c.shut) {
            // non-perfused: hollow ring with a bar
            ctx.fillStyle = "rgba(0,0,0,.35)";
            ctx.fill();
            ctx.lineWidth = 1.6 * dpr;
            ctx.strokeStyle = "#fff";
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(X - R * 0.6, Y + R * 0.6);
            ctx.lineTo(X + R * 0.6, Y - R * 0.6);
            ctx.stroke();
            continue;
          }
          if (MODEL.drop > 0) {
            const k = Math.max(0, Math.min(255, Math.round((capPO2(c) / PC) * 255))) * 3;
            ctx.fillStyle = `rgb(${SEQ[k]},${SEQ[k + 1]},${SEQ[k + 2]})`;
          } else ctx.fillStyle = "#c3283b";
          ctx.fill();
          ctx.lineWidth = 1.6 * dpr;
          ctx.strokeStyle = "#fff";
          ctx.stroke();
        }
    });
  }

  function legend() {
    const el = $("legend");
    if (view === "type") {
      el.innerHTML =
        `<span class="ox-label">Fibre type and demand relative to type I</span><div class="ox-typelegend">` +
        TYPES.map(
          (t, i) => `<span class="ox-typechip"><span class="ox-sw" style="background:${TYPE_COLORS[i]}"></span>${t.name} · ${t.rel.toFixed(2)}</span>`
        ).join("") +
        `</div>`;
    } else if (view === "change") {
      el.innerHTML = `<span class="ox-label">Change in PO₂ since baseline (mmHg)</span>
      <div class="ox-cbar" style="background:linear-gradient(90deg,${TOK["div-neg"]},${TOK["div-mid"]},${TOK["div-pos"]})"></div>
      <div class="ox-cticks"><span>−${divRange}</span><span>lower</span><span>0</span><span>higher</span><span>+${divRange}</span></div>`;
    } else {
      el.innerHTML = `<span class="ox-label">PO₂ (mmHg)</span>
      <div class="ox-cbar" style="background:linear-gradient(90deg,${MAPS[cmap].stops.join(",")})"></div>
      <div class="ox-cticks"><span>0</span><span>10</span><span>20</span><span>30</span><span>≥40</span></div>`;
    }
  }

  const fmt = (v, n = 1) => v.toFixed(n);
  function delta(v, b, unit, n = 1) {
    if (b == null) return "";
    const dv = v - b;
    if (Math.abs(dv) < Math.pow(10, -n) / 2) return "no change from baseline";
    return `${dv > 0 ? "+" : "−"}${Math.abs(dv).toFixed(n)}${unit} vs baseline`;
  }
  let lastStats = null;
  function updateStats() {
    const st = stats(S, sec, thr);
    const bs = base ? base.stats(thr) : null;
    lastStats = st;
    $("m-mean").innerHTML = `${fmt(st.mean)} <small>mmHg</small>`;
    $("m-low").innerHTML = `${fmt(st.low * 100)} <small>%</small>`;
    $("m-min").innerHTML = `${fmt(st.min, 2)} <small>mmHg</small>`;
    $("m-met").innerHTML = `${fmt(st.met * 100)} <small>%</small>`;
    $("d-met").textContent = bs ? delta(st.met * 100, bs.met * 100, " points") : "";
    const u = typeUptake(sec, 0);
    const ex = Math.floor(Math.log10(u)),
      sup = String(ex)
        .replace("-", "⁻")
        .replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]);
    $("uptake").textContent =
      `Type I demand at this intensity: ${(u / 10 ** ex).toFixed(2)} ×10${sup} ml O₂ ml⁻¹ s⁻¹ (${MODEL.intensity} × resting).`;
    $("d-mean").textContent = bs ? delta(st.mean, bs.mean, " mmHg") : "";
    $("d-low").textContent = bs ? delta(st.low * 100, bs.low * 100, " points") : "";
    $("d-min").textContent = bs ? delta(st.min, bs.min, " mmHg", 2) : "";
    $("lowlab").textContent = `Fibre area below ${thr} mmHg`;
    $("g-n").textContent = st.nCap;
    $("g-f").textContent = st.nFib;
    $("g-cf").textContent = fmt(st.cf, 2);
    $("g-cd").textContent = `${Math.round(st.cd)} mm⁻²`;
    $("g-np").textContent = st.nPerf;
    $("g-cfp").textContent = fmt(st.cfPerf, 2);
    $("g-cdp").textContent = `${Math.round(st.cdPerf)} mm⁻²`;
    drawHist(st, bs);
  }

  function drawHist(st, bs) {
    const svg = $("hist"),
      w = 340,
      h = 170,
      ml = 34,
      mr = 6,
      mt = 10,
      mb = 30;
    const pw = w - ml - mr,
      ph = h - mt - mb;
    let ymax = Math.max(...st.hist, ...(bs ? bs.hist : [0]));
    const step = ymax > 0.3 ? 0.1 : ymax > 0.12 ? 0.05 : 0.02;
    ymax = Math.ceil(ymax / step) * step || step;
    const X = (p) => ml + (p / PC) * pw,
      Y = (v) => mt + ph - (v / ymax) * ph;
    let s = "";
    for (let v = 0; v <= ymax + 1e-9; v += step) {
      s += `<line x1="${ml}" x2="${w - mr}" y1="${Y(v)}" y2="${Y(v)}" stroke="${TOK.line}" stroke-width="1"/>`;
      s += `<text x="${ml - 6}" y="${Y(v) + 4}" text-anchor="end" font-size="10.5" fill="${TOK.muted}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace">${Math.round(v * 100)}%</text>`;
    }
    for (let p = 0; p <= PC; p += 10)
      s += `<text x="${X(p)}" y="${h - mb + 15}" text-anchor="middle" font-size="10.5" fill="${TOK.muted}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace">${p}</text>`;
    s += `<text x="${ml + pw / 2}" y="${h - 2}" text-anchor="middle" font-size="11" fill="${TOK.muted}" font-family="inherit">Fibre PO₂ (mmHg)</text>`;
    const bw = pw / 20;
    st.hist.forEach((v, b) => {
      const x = ml + b * bw + 1,
        y = Y(v),
        hh = mt + ph - y;
      const k = Math.round(((b + 0.5) / 20) * 255) * 3;
      const col = `rgb(${SEQ[k]},${SEQ[k + 1]},${SEQ[k + 2]})`;
      if (hh > 0.5) s += `<path d="M${x},${mt + ph} V${y + Math.min(3, hh)} q0,-3 3,-3 H${x + bw - 5} q3,0 3,3 V${mt + ph} Z" fill="${col}"/>`;
    });
    if (bs) {
      let d = `M${ml},${mt + ph}`;
      bs.hist.forEach((v, b) => {
        d += ` V${Y(v)} H${ml + (b + 1) * bw}`;
      });
      d += ` V${mt + ph}`;
      s += `<path d="${d}" fill="none" stroke="${TOK.ink}" stroke-width="1.5" stroke-linejoin="round"/>`;
    }
    s += `<line x1="${X(thr)}" x2="${X(thr)}" y1="${mt}" y2="${mt + ph}" stroke="${TOK.accent}" stroke-width="1.5" stroke-dasharray="3 3"/>`;
    s += `<line x1="${ml}" x2="${w - mr}" y1="${mt + ph}" y2="${mt + ph}" stroke="${TOK.muted}" stroke-width="1"/>`;
    // hit targets
    st.hist.forEach((v, b) => {
      s += `<rect data-b="${b}" x="${ml + b * bw}" y="${mt}" width="${bw}" height="${ph}" fill="transparent"/>`;
    });
    svg.innerHTML = s;
  }
  $("hist").addEventListener("pointermove", (e) => {
    const b = e.target.getAttribute && e.target.getAttribute("data-b");
    const tip = $("tip");
    if (b == null || !lastStats) {
      tip.hidden = true;
      return;
    }
    const bs = base ? base.stats(thr) : null,
      lo = b * 2;
    tip.textContent = `${lo}–${lo + 2} mmHg: ${(lastStats.hist[b] * 100).toFixed(1)}%` + (bs ? ` (baseline ${(bs.hist[b] * 100).toFixed(1)}%)` : "");
    const box = $("histbox").getBoundingClientRect(),
      r = e.target.getBoundingClientRect();
    tip.style.left = Math.min(box.width - 90, Math.max(90, r.left - box.left + r.width / 2)) + "px";
    tip.style.top = r.top - box.top + 4 + "px";
    tip.hidden = false;
  });
  $("hist").addEventListener("pointerleave", () => {
    $("tip").hidden = true;
  });

  // solver loop
  let running = false;
  function kick() {
    S.converged = false;
    $("status").textContent = "Solving…";
    if (!running) {
      running = true;
      requestAnimationFrame(loop);
    }
  }
  function loop() {
    const t0 = performance.now();
    while (!S.converged && performance.now() - t0 < 12) sweep(S, 4);
    render();
    if (S.converged) {
      running = false;
      if (wantBaseline) setBaseline();
      updateStats();
      legend();
      $("status").textContent = "Solved";
    } else requestAnimationFrame(loop);
  }
  function setBaseline() {
    const P = Float64Array.from(S.P),
      fib = Int16Array.from(S.fib),
      K = Float64Array.from(S.K);
    const s2 = { caps: sec.caps.map((c) => ({ ...c })), nFib: sec.nFib };
    const cache = {};
    base = { P, stats: (t) => cache[t] || (cache[t] = stats({ P, fib, K }, s2, t)) };
    wantBaseline = false;
  }

  function load(seed, keepBase) {
    const prev = sec;
    sec = makeSection(seed, MODEL.shape);
    orig = cloneSec(sec);
    if (keepBase && prev && prev.seed === seed) sec.types = Int8Array.from(prev.types); // keep retyped fibres when switching shape
    applyShut(sec);
    S = makeSolver(sec);
    selCap = -1;
    if (!keepBase) {
      base = null;
      wantBaseline = true;
    }
    buildDisplay();
    $("secname").textContent = `Tissue ${seed}`;
    legend();
    kick();
  }

  // pointer interaction
  function toMicron(e) {
    const r = cv.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * L, y: ((e.clientY - r.top) / r.height) * L, px: e.clientX, py: e.clientY };
  }
  function hitCap(p) {
    const tol = (22 / CSS) * L;
    let best = -1,
      bd = tol;
    sec.caps.forEach((c, k) => {
      const d = Math.hypot(mi(p.x - c.x), mi(p.y - c.y));
      if (d < bd) {
        bd = d;
        best = k;
      }
    });
    return best;
  }
  let drag = -1,
    down = null;
  cv.addEventListener("pointerdown", (e) => {
    const p = toMicron(e);
    cv.setPointerCapture(e.pointerId);
    drag = hitCap(p);
    down = { ...p, t: performance.now(), moved: false };
    if (drag >= 0) {
      selCap = drag;
      cv.classList.add("grabbing");
      render();
    }
  });
  cv.addEventListener("pointermove", (e) => {
    const p = toMicron(e);
    if (down && Math.hypot(p.px - down.px, p.py - down.py) > 6) down.moved = true;
    if (drag >= 0 && down.moved) {
      const q = snap(sec, Math.max(0, Math.min(L - 1e-6, p.x)), Math.max(0, Math.min(L - 1e-6, p.y)));
      sec.caps[drag].x = q.x;
      sec.caps[drag].y = q.y;
      setCaps(S, sec);
      kick();
    } else if (!down) cv.classList.toggle("grab", hitCap(p) >= 0);
    readout(p);
  });
  function endPointer(e) {
    if (!down) return;
    const p = toMicron(e);
    if (drag >= 0 && !down.moved) {
      // tap on a capillary: shut it or reopen it
      sec.caps[drag].shut = !sec.caps[drag].shut;
      setCaps(S, sec);
      kick();
      readout(p);
    } else if (drag < 0 && !down.moved) {
      const f = fibreAt(sec, p.x, p.y);
      if (f >= 0 && sec.types[f] !== brush) {
        sec.types[f] = brush;
        setTypes(S, sec);
        kick();
      }
    }
    drag = -1;
    down = null;
    cv.classList.remove("grabbing");
  }
  cv.addEventListener("pointerup", endPointer);
  cv.addEventListener("pointercancel", () => {
    drag = -1;
    down = null;
    cv.classList.remove("grabbing");
  });
  cv.addEventListener("pointerleave", (e) => {
    if (e.pointerType === "mouse" && !down) $("readout").textContent = "Point at the section to read PO₂.";
  });
  function readout(p) {
    if (p.x < 0 || p.y < 0 || p.x >= L || p.y >= L) return;
    const hc = hitCap(p);
    if (hc >= 0 && Math.hypot(mi(p.x - sec.caps[hc].x), mi(p.y - sec.caps[hc].y)) < (8 / CSS) * L + RC) {
      $("readout").textContent = sec.caps[hc].shut
        ? "Non-perfused capillary · tap to reopen"
        : `Capillary · ${capPO2(sec.caps[hc]).toFixed(1)} mmHg · tap to shut`;
      return;
    }
    const f = fibreAt(sec, p.x, p.y),
      v = sampleP(S.P, p.x, p.y);
    const where = f < 0 ? "Interstitium" : `${TYPES[sec.types[f]].name} fibre`;
    let txt = `${where} · ${v.toFixed(1)} mmHg`;
    if (base && f >= 0) {
      const dv = v - sampleP(base.P, p.x, p.y);
      if (Math.abs(dv) >= 0.05) txt += ` (${dv > 0 ? "+" : "−"}${Math.abs(dv).toFixed(1)})`;
    }
    $("readout").textContent = txt;
  }
  cv.addEventListener("keydown", (e) => {
    if (e.key === "]" || e.key === "[") {
      selCap = (selCap + (e.key === "]" ? 1 : -1) + sec.caps.length) % sec.caps.length;
      render();
      e.preventDefault();
      return;
    }
    const mv = { ArrowLeft: [-2, 0], ArrowRight: [2, 0], ArrowUp: [0, -2], ArrowDown: [0, 2] }[e.key];
    if (mv && selCap >= 0) {
      const c = sec.caps[selCap],
        q = snap(sec, c.x + mv[0], c.y + mv[1]);
      c.x = q.x;
      c.y = q.y;
      setCaps(S, sec);
      kick();
      e.preventDefault();
    }
  });

  // controls
  $("viewseg").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    view = b.dataset.view;
    $("viewseg")
      .querySelectorAll("button")
      .forEach((x) => x.setAttribute("aria-pressed", x === b));
    render();
    legend();
  });
  $("brushseg").innerHTML = TYPES.map(
    (t, i) =>
      `<button type="button" data-t="${i}" aria-pressed="${i === 0}"><span class="ox-typechip"><span class="ox-sw" style="background:${TYPE_COLORS[i]}"></span>${t.name}</span></button>`
  ).join("");
  $("brushseg").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    brush = +b.dataset.t;
    $("brushseg")
      .querySelectorAll("button")
      .forEach((x) => x.setAttribute("aria-pressed", x === b));
  });
  function segGroup(id, onPick) {
    $(id).addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      $(id)
        .querySelectorAll("button")
        .forEach((x) => x.setAttribute("aria-pressed", x === b));
      onPick(b.dataset.v);
    });
  }
  segGroup("shapeseg", (v) => {
    MODEL.shape = v;
    load(sec.seed, true);
  });
  segGroup("kinseg", (v) => {
    MODEL.kinetics = v;
    kick();
  });
  segGroup("intseg", (v) => {
    MODEL.intensity = +v;
    setTypes(S, sec);
    kick();
  });
  segGroup("bcseg", (v) => {
    MODEL.bc = v;
    setCaps(S, sec);
    kick();
  });
  segGroup("mbseg", (v) => {
    const k = +v;
    MODEL.mb = k > 0;
    MODEL.mbScale = k || 1;
    setTypes(S, sec);
    kick();
  });
  segGroup("capseg", (v) => {
    MODEL.drop = +v;
    setCaps(S, sec);
    kick();
  });
  segGroup("shutseg", (v) => {
    MODEL.shutFrac = +v;
    applyShut(sec);
    setCaps(S, sec);
    kick();
  });
  $("cmap").innerHTML = Object.entries(MAPS)
    .map(([k, m]) => `<option value="${k}"${k === cmap ? " selected" : ""}>${m.name}</option>`)
    .join("");
  $("cmap").addEventListener("change", (e) => {
    cmap = e.target.value;
    SEQ = lut(MAPS[cmap].stops);
    try {
      localStorage.setItem("moe-cmap", cmap);
    } catch (err) {}
    render();
    legend();
    if (lastStats) updateStats();
  });
  $("thr").addEventListener("change", (e) => {
    thr = +e.target.value;
    updateStats();
  });
  $("baseline").addEventListener("click", () => {
    if (S.converged) {
      setBaseline();
      updateStats();
      render();
      legend();
    } else wantBaseline = true;
  });
  $("reset").addEventListener("click", () => {
    sec.types = Int8Array.from(orig.types);
    sec.caps = orig.caps.map((c) => ({ ...c }));
    applyShut(sec);
    normaliseDemand(S, sec);
    setCaps(S, sec);
    selCap = -1;
    kick();
  });
  $("newsec").addEventListener("click", () => load(1 + Math.floor(Math.random() * 9999)));

  new ResizeObserver(() => {
    if (!sec) return;
    const w = cv.getBoundingClientRect().width;
    if (Math.abs(w - CSS) > 1) {
      buildDisplay();
      render();
    }
  }).observe(cv);
  const onTheme = () => {
    readTokens();
    if (sec) {
      render();
      legend();
      if (lastStats) updateStats();
    }
  };
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", onTheme);
  new MutationObserver(onTheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  readTokens();
  load(7);
})();
