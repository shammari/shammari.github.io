// Muscle oxygen explorer for shammari.github.io/tools/oxygen/: steady oxygen transport in a synthetic cross-section of skeletal muscle.
// Runs entirely in the browser: tissue geometry first, then the solver (exact capillary walls, no-flux section edge,
// nonlinear multigrid on 2 µm and 1 µm grids), then the interface.
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
  const MODEL = { shape: "realistic", kinetics: "mm", mb: true, mbScale: 1, drop: 0, shutFrac: 0, bc: "robin", intensity: 12 };
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
  const GAP_REAL = 1.0,
    RHO = 6,
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
    return { real: true, w, a, c: Math.cos(th), s: Math.sin(th), wx: modes(6, 3), wy: modes(6, 3), gw: modes(0.5, 3) };
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
  // CORE END

  // ENGINE START
  // Steady oxygen transport on cell-centred grids over the 384 µm section.
  //  • outer boundary: no flux (mirror condition), as in an image-based section
  //  • capillary walls on the true circle: Dirichlet (Shortley–Weller arms) or Robin (local logarithmic wall relation)
  //  • consumption K·P/(P+Pm) weighted by each cell's fibre fraction; myoglobin flux only between fibre cells
  //  • nonlinear FAS multigrid (W-cycles, red–black Newton–Gauss–Seidel smoothing)
  // Two levels are kept: 2 µm (fast, while editing) and 1 µm (accurate, after an edit and for export).
  const NFINE = 384,
    NCOARSE = 192,
    BETA = (KWALL / DALPHA) * 1e-4; // µm⁻¹
  const NOCAP = -1;

  // fibre pieces: fibres cut by the section edge become separate pieces
  function attachTissue(sec) {
    const n = NFINE,
      h = L / n,
      nn = n * n;
    const seedOf = new Int16Array(nn).fill(-1),
      frac = new Float32Array(nn);
    const cnt = new Map();
    for (let j = 0; j < n; j++)
      for (let i = 0; i < n; i++) {
        cnt.clear();
        let inF = 0;
        for (let b = 0; b < 2; b++)
          for (let a = 0; a < 2; a++) {
            const x = (i + 0.25 + 0.5 * a) * h,
              y = (j + 0.25 + 0.5 * b) * h;
            const q = (Math.round(y / H) % N) * N + (Math.round(x / H) % N);
            const f = classify(sec, x, y, sec.cand.subarray(q * NCAND, q * NCAND + NCAND)).f;
            if (f >= 0) {
              inF++;
              cnt.set(f, (cnt.get(f) || 0) + 1);
            }
          }
        if (inF) {
          let bf = -1,
            bc = 0;
          for (const [f, c] of cnt)
            if (c > bc) {
              bc = c;
              bf = f;
            }
          seedOf[j * n + i] = bf;
          frac[j * n + i] = inF / 4;
        }
      }
    const piece = new Int32Array(nn).fill(-1),
      pieceSeed = [],
      stack = [];
    for (let c0 = 0; c0 < nn; c0++) {
      if (seedOf[c0] < 0 || piece[c0] >= 0) continue;
      const p = pieceSeed.length,
        s = seedOf[c0];
      pieceSeed.push(s);
      piece[c0] = p;
      stack.push(c0);
      while (stack.length) {
        const c = stack.pop(),
          i = c % n,
          j = (c - i) / n;
        for (const [ii, jj] of [
          [i + 1, j],
          [i - 1, j],
          [i, j + 1],
          [i, j - 1],
        ]) {
          if (ii < 0 || jj < 0 || ii >= n || jj >= n) continue;
          const d = jj * n + ii;
          if (seedOf[d] === s && piece[d] < 0) {
            piece[d] = p;
            stack.push(d);
          }
        }
      }
    }
    const P = pieceSeed.length,
      area = new Float64Array(P),
      cx = new Float64Array(P),
      cy = new Float64Array(P);
    for (let c = 0; c < nn; c++) {
      const p = piece[c];
      if (p < 0) continue;
      const a = frac[c] * h * h,
        i = c % n,
        j = (c - i) / n;
      area[p] += a;
      cx[p] += a * (i + 0.5) * h;
      cy[p] += a * (j + 0.5) * h;
    }
    const seedTypes = sec.seedTypes || sec.types;
    sec.seedTypes = seedTypes;
    sec.types = Int8Array.from(pieceSeed, (s) => seedTypes[s]);
    sec.pieceSeed = Int16Array.from(pieceSeed);
    sec.area = area;
    sec.cent = Array.from({ length: P }, (_, p) => (area[p] > 0 ? { x: cx[p] / area[p], y: cy[p] / area[p] } : null));
    const sorted = Array.from(area)
        .filter((a) => a > 0)
        .sort((a, b) => a - b),
      med = sorted[Math.floor(sorted.length / 2)] || 1;
    // unbiased counting frame: a fibre counts unless it touches the exclusion edges (left and bottom);
    // fibres touching only the inclusion edges (top and right) or lying wholly inside count
    const excl = new Uint8Array(P);
    for (let j = 0; j < n; j++) {
      if (piece[j * n] >= 0) excl[piece[j * n]] = 1;
    }
    for (let i = 0; i < n; i++) {
      const c = (n - 1) * n + i;
      if (piece[c] >= 0) excl[piece[c]] = 1;
    }
    sec.counted = Array.from(area, (a, p) => a > 0 && !excl[p]);
    sec.nFib = sec.counted.filter(Boolean).length;
    sec.bigPiece = Array.from(area, (a) => a >= 0.25 * med); // slivers at the edge get no label // fibres cut by the edge count if at least a quarter of a typical fibre is inside
    sec.geom = { n, h, seedOf, frac, piece };
    // keep capillaries inside the section
    for (const c of sec.caps) clampCap(c);
  }
  function clampCap(c) {
    const m = RC + 1;
    c.x = Math.min(L - m, Math.max(m, c.x));
    c.y = Math.min(L - m, Math.max(m, c.y));
  }
  // piece at a point (−1 in the interstitium)
  function pieceAt(sec, x, y, seed) {
    const g = sec.geom;
    if (x < 0 || y < 0 || x >= L || y >= L) return -1;
    const f = seed !== undefined ? seed : fibreAt(sec, x, y);
    if (f < 0) return -1;
    const i = Math.min(g.n - 1, Math.floor(x / g.h)),
      j = Math.min(g.n - 1, Math.floor(y / g.h));
    for (let r = 0; r <= 3; r++)
      for (let dj = -r; dj <= r; dj++)
        for (let di = -r; di <= r; di++) {
          const ii = i + di,
            jj = j + dj;
          if (ii < 0 || jj < 0 || ii >= g.n || jj >= g.n) continue;
          const c = jj * g.n + ii;
          if (g.seedOf[c] === f) return g.piece[c];
        }
    return -1;
  }
  // demand: tissue-average demand at rest equals M0, ratios between types as published
  function normaliseDemand(sec) {
    const g = sec.geom;
    let s = 0;
    for (let c = 0; c < g.piece.length; c++) if (g.piece[c] >= 0) s += g.frac[c] * KREL[sec.types[g.piece[c]]];
    sec.mRest = ((M0 / DALPHA) * 1e-8) / (s / g.piece.length);
  }
  const typeUptake = (sec, t) => sec.mRest * MODEL.intensity * KREL[t] * DALPHA * 1e8; // ml O2/(ml·s)

  // ----- grid levels -----
  function newLevel(n) {
    const nn = n * n,
      F = () => new Float64Array(nn);
    return {
      n,
      h: L / n,
      w: [F(), F(), F(), F()],
      kf: [F(), F(), F(), F()],
      diag: F(),
      b: F(),
      gW: F(),
      K: F(),
      kap: F(),
      area: F(),
      fixed: new Uint8Array(nn),
      fixVal: F(),
      f: F(),
      u: F(),
      r: F(),
      piece: new Int32Array(nn).fill(-1),
      frac: new Float32Array(nn),
    };
  }
  // geometry for a solving level from the 1 µm sampling (2 µm cells aggregate 2×2)
  function levelGeometry(sec, n) {
    const G = newLevel(n),
      g = sec.geom,
      k = g.n / n;
    for (let J = 0; J < n; J++)
      for (let I = 0; I < n; I++) {
        const C = J * n + I;
        let fr = 0;
        const votes = new Map();
        for (let b = 0; b < k; b++)
          for (let a = 0; a < k; a++) {
            const c = (J * k + b) * g.n + I * k + a;
            if (g.piece[c] >= 0) {
              fr += g.frac[c];
              votes.set(g.piece[c], (votes.get(g.piece[c]) || 0) + g.frac[c]);
            }
          }
        G.frac[C] = fr / (k * k);
        let bp = -1,
          bv = 0;
        for (const [p, v] of votes)
          if (v > bv) {
            bv = v;
            bp = p;
          }
        G.piece[C] = bp;
      }
    return G;
  }
  const hm = (a, b) => (a > 0 && b > 0 ? (2 * a * b) / (a + b) : 0);
  // physics and capillaries → coefficients
  function assembleLevel(G, sec) {
    const { n, h } = G,
      nn = n * n,
      w0 = 1 / (h * h),
      Pm = MODEL.kinetics === "zero" ? PM_ZERO : PM_MM;
    G.Pm = Pm;
    G.mb = MODEL.mb;
    G.P50 = P50_MB;
    const kI = sec.mRest * MODEL.intensity;
    // lumens
    const lumen = new Int16Array(nn).fill(NOCAP),
      openLumen = new Uint8Array(nn);
    sec.caps.forEach((c, ci) => {
      const r0 = Math.ceil(RC / h) + 1,
        i0 = Math.floor(c.x / h),
        j0 = Math.floor(c.y / h);
      for (let dj = -r0; dj <= r0; dj++)
        for (let di = -r0; di <= r0; di++) {
          const i = i0 + di,
            j = j0 + dj;
          if (i < 0 || j < 0 || i >= n || j >= n) continue;
          if (Math.hypot((i + 0.5) * h - c.x, (j + 0.5) * h - c.y) <= RC) {
            lumen[j * n + i] = ci;
            if (!c.shut) openLumen[j * n + i] = 1;
          }
        }
    });
    for (let c = 0; c < nn; c++) {
      const p = G.piece[c],
        inL = lumen[c] !== NOCAP;
      G.fixed[c] = openLumen[c];
      G.fixVal[c] = openLumen[c] ? capPO2(sec.caps[lumen[c]]) : 0;
      const fr = inL ? 0 : G.frac[c];
      G.area[c] = p >= 0 ? fr * h * h : 0;
      G.K[c] = p >= 0 ? fr * kI * KREL[sec.types[p]] : 0;
      G.kap[c] = p >= 0 && MODEL.mb ? fr * TYPES[sec.types[p]].mb * MODEL.mbScale : 0;
      G.b[c] = 0;
      G.gW[c] = 0;
      G.diag[c] = 0;
      for (let d = 0; d < 4; d++) {
        G.w[d][c] = 0;
        G.kf[d][c] = 0;
      }
    }
    const DIR = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    for (let j = 0; j < n; j++)
      for (let i = 0; i < n; i++) {
        const c = j * n + i;
        if (G.fixed[c]) continue;
        const x = (i + 0.5) * h,
          y = (j + 0.5) * h;
        const arm = [0, 0, 0, 0],
          kind = [0, 0, 0, 0],
          capOf = [null, null, null, null]; // kind 0 normal, 1 cut, 2 wall
        for (let d = 0; d < 4; d++) {
          const ii = i + DIR[d][0],
            jj = j + DIR[d][1];
          if (ii < 0 || jj < 0 || ii >= n || jj >= n) {
            kind[d] = 2;
            arm[d] = h;
            continue;
          }
          const nb = jj * n + ii;
          if (G.fixed[nb]) {
            const cp = sec.caps[lumen[nb]],
              px = x - cp.x,
              py = y - cp.y,
              bq = px * DIR[d][0] + py * DIR[d][1],
              cq = px * px + py * py - RC * RC,
              disc = bq * bq - cq;
            const t = disc >= 0 ? -bq - Math.sqrt(disc) : h;
            kind[d] = 1;
            arm[d] = Math.min(h, Math.max(0.05 * h, t));
            capOf[d] = cp;
          } else {
            kind[d] = 0;
            arm[d] = h;
          }
        }
        let diag = 0;
        for (const [d1, d2] of [
          [0, 1],
          [2, 3],
        ]) {
          const a1 = arm[d1],
            a2 = arm[d2],
            w1 = 2 / (a1 * (a1 + a2)),
            w2 = 2 / (a2 * (a1 + a2));
          for (const [d, ww] of [
            [d1, w1],
            [d2, w2],
          ]) {
            if (kind[d] === 2) continue; // mirror: ghost equals this cell, no net flux
            if (kind[d] === 1) {
              const cp = capOf[d];
              let we = ww;
              if (MODEL.bc === "robin") {
                const rX = Math.max(Math.hypot(x - cp.x, y - cp.y), RC * 1.0001),
                  bl = BETA * RC * Math.log(rX / RC);
                we = (ww * bl) / (1 + bl);
              }
              diag += we;
              G.b[c] += we * capPO2(cp);
              G.gW[c] += we;
            } else {
              diag += ww;
              G.w[d][c] = ww;
            }
          }
        }
        G.diag[c] = diag;
      }
    // myoglobin faces (no flux across fibre edges)
    if (MODEL.mb)
      for (let j = 0; j < n; j++)
        for (let i = 0; i < n; i++) {
          const c = j * n + i;
          if (G.fixed[c] || !G.kap[c]) continue;
          for (let d = 0; d < 4; d++) {
            if (!G.w[d][c]) continue;
            const nb = (j + DIR[d][1]) * n + i + DIR[d][0];
            G.kf[d][c] = G.w[d][c] * hm(G.kap[c], G.kap[nb]);
          }
        }
    G.robin = MODEL.bc === "robin";
    G.mg = hierarchy(G);
  }
  // coarse levels: standard 5-point weights with mirror edges; a coarse cell is held fixed if any child is
  function coarsen(G) {
    const n = G.n / 2,
      C = newLevel(n),
      w0 = 1 / (C.h * C.h),
      nf = G.n;
    C.Pm = G.Pm;
    C.mb = G.mb;
    C.P50 = G.P50;
    C.robin = G.robin;
    for (let J = 0; J < n; J++)
      for (let I = 0; I < n; I++) {
        const Q = J * n + I;
        let K = 0,
          kp = 0,
          fx = 0,
          fv = 0,
          gw = 0,
          bb = 0;
        for (let b = 0; b < 2; b++)
          for (let a = 0; a < 2; a++) {
            const q = (2 * J + b) * nf + 2 * I + a;
            K += G.K[q];
            kp += G.kap[q];
            gw += G.gW[q];
            bb += G.b[q];
            if (G.fixed[q]) {
              fx = 1;
              fv = G.fixVal[q];
            }
          }
        C.K[Q] = K / 4;
        C.kap[Q] = kp / 4;
        // Robin: coarse levels carry the averaged wall conductance instead of holding lumens fixed
        if (G.robin) {
          C.gW[Q] = gw / 4;
          C.b[Q] = bb / 4;
        } else {
          C.fixed[Q] = fx;
          C.fixVal[Q] = fv;
        }
      }
    for (let J = 0; J < n; J++)
      for (let I = 0; I < n; I++) {
        const Q = J * n + I;
        let dg = 0;
        const nb = [
          [I + 1, J],
          [I - 1, J],
          [I, J + 1],
          [I, J - 1],
        ];
        for (let d = 0; d < 4; d++) {
          const [ii, jj] = nb[d];
          if (ii < 0 || jj < 0 || ii >= n || jj >= n) continue;
          C.w[d][Q] = w0;
          dg += w0;
          if (C.mb) C.kf[d][Q] = w0 * hm(C.kap[Q], C.kap[jj * n + ii]);
        }
        C.diag[Q] = dg + C.gW[Q];
      }
    return C;
  }
  function hierarchy(G) {
    const lv = [G];
    while (lv[lv.length - 1].n % 2 === 0 && lv[lv.length - 1].n / 2 >= 12) lv.push(coarsen(lv[lv.length - 1]));
    return lv;
  }
  const sat = (p, P50) => p / (p + P50),
    dsat = (p, P50) => P50 / ((p + P50) * (p + P50));
  function cellF(G, u, c, i, j) {
    // returns [F, dF] at cell c
    const { n, w, kf, diag, b, K, f, Pm, P50 } = G;
    const p = u[c] > 0 ? u[c] : 0;
    const nbs = [i + 1 < n ? c + 1 : c, i > 0 ? c - 1 : c, j + 1 < n ? c + n : c, j > 0 ? c - n : c];
    let F = b[c] - diag[c] * p - (K[c] * p) / (p + Pm) - f[c],
      dF = -diag[c] - (K[c] * Pm) / ((p + Pm) * (p + Pm));
    for (let d = 0; d < 4; d++) F += w[d][c] * u[nbs[d]];
    if (G.mb) {
      const sp = sat(p, P50),
        dsp = dsat(p, P50);
      for (let d = 0; d < 4; d++) {
        const k = kf[d][c];
        if (k) {
          const q = u[nbs[d]];
          F += k * (sat(q > 0 ? q : 0, P50) - sp);
          dF -= k * dsp;
        }
      }
    }
    return [F, dF];
  }
  function relax(G, sweeps) {
    const { n, u, fixed, fixVal } = G;
    let maxD = 0;
    for (let s = 0; s < sweeps; s++)
      for (let col = 0; col < 2; col++)
        for (let j = 0; j < n; j++)
          for (let i = (j + col) & 1; i < n; i += 2) {
            const c = j * n + i;
            if (fixed[c]) {
              u[c] = fixVal[c];
              continue;
            }
            const [F, dF] = cellF(G, u, c, i, j);
            let pn = u[c] - F / dF;
            if (pn < 0) pn = 0;
            const d = Math.abs(pn - u[c]);
            if (d > maxD) maxD = d;
            u[c] = pn;
          }
    return maxD;
  }
  function residual(G) {
    const { n, u, r, fixed } = G;
    for (let j = 0; j < n; j++)
      for (let i = 0; i < n; i++) {
        const c = j * n + i;
        r[c] = fixed[c] ? 0 : -cellF(G, u, c, i, j)[0];
      }
  }
  function cycle(lv, l) {
    const G = lv[l];
    if (l === lv.length - 1) {
      relax(G, 40);
      return;
    }
    relax(G, 2);
    residual(G);
    const C = lv[l + 1],
      nf = G.n,
      nc = C.n,
      uc0 = new Float64Array(nc * nc);
    for (let J = 0; J < nc; J++)
      for (let I = 0; I < nc; I++) {
        const Q = J * nc + I,
          q = 2 * J * nf + 2 * I;
        uc0[Q] = C.fixed[Q] ? C.fixVal[Q] : 0.25 * (G.u[q] + G.u[q + 1] + G.u[q + nf] + G.u[q + nf + 1]);
      }
    C.u.set(uc0);
    C.f.fill(0);
    for (let J = 0; J < nc; J++)
      for (let I = 0; I < nc; I++) {
        const Q = J * nc + I;
        if (C.fixed[Q]) {
          C.f[Q] = 0;
          continue;
        }
        const q = 2 * J * nf + 2 * I,
          rr = 0.25 * (G.r[q] + G.r[q + 1] + G.r[q + nf] + G.r[q + nf + 1]);
        C.f[Q] = cellF(C, uc0, Q, I, J)[0] + rr; // f_c = F_c(R u) + R r
      }
    for (let g = 0; g < (l + 1 === lv.length - 1 ? 1 : 2); g++) cycle(lv, l + 1);
    for (let j = 0; j < nf; j++)
      for (let i = 0; i < nf; i++) {
        const q = j * nf + i;
        if (G.fixed[q]) continue;
        const I = i >> 1,
          J = j >> 1,
          Ib = Math.min(nc - 1, Math.max(0, I + (i & 1 ? 1 : -1))),
          Jb = Math.min(nc - 1, Math.max(0, J + (j & 1 ? 1 : -1)));
        const e = (Q) => C.u[Q] - uc0[Q];
        const v = (9 * e(J * nc + I) + 3 * e(J * nc + Ib) + 3 * e(Jb * nc + I) + e(Jb * nc + Ib)) / 16;
        let un = G.u[q] + v;
        if (un < 0) un = 0;
        G.u[q] = un;
      }
    relax(G, 2);
  }
  // one W-cycle on a solving level; returns the largest change
  function mgStep(G) {
    const prev = Float64Array.from(G.u);
    cycle(G.mg, 0);
    let d = 0;
    for (let q = 0; q < prev.length; q++) {
      const t = Math.abs(G.u[q] - prev[q]);
      if (t > d) d = t;
    }
    return d;
  }
  // bilinear sample of a cell-centred field
  function sampleField(G, x, y) {
    const n = G.n,
      h = G.h,
      gx = Math.min(n - 1, Math.max(0, x / h - 0.5)),
      gy = Math.min(n - 1, Math.max(0, y / h - 0.5));
    const i0 = Math.floor(gx),
      j0 = Math.floor(gy),
      i1 = Math.min(n - 1, i0 + 1),
      j1 = Math.min(n - 1, j0 + 1),
      fx = gx - i0,
      fy = gy - j0,
      u = G.u;
    return (u[j0 * n + i0] * (1 - fx) + u[j0 * n + i1] * fx) * (1 - fy) + (u[j1 * n + i0] * (1 - fx) + u[j1 * n + i1] * fx) * fy;
  }
  function stats(G, sec, thr) {
    let A = 0,
      s = 0,
      lo = 0,
      mn = Infinity,
      up = 0,
      dem = 0;
    const hist = new Float64Array(20),
      P = sec.types.length,
      fs = new Float64Array(P),
      fa = new Float64Array(P),
      ts = [0, 0, 0],
      ta = [0, 0, 0];
    for (let c = 0; c < G.u.length; c++) {
      const a = G.area[c];
      if (a <= 0 || G.fixed[c]) continue;
      const p = G.u[c],
        pc = G.piece[c],
        t = sec.types[pc];
      A += a;
      s += a * p;
      if (p < thr) lo += a;
      if (p < mn) mn = p;
      hist[Math.min(19, Math.floor(p / (PC / 20)))] += a;
      fs[pc] += a * p;
      fa[pc] += a;
      ts[t] += a * p;
      ta[t] += a;
      up += (G.K[c] * p) / (p + G.Pm);
      dem += G.K[c];
    }
    for (let b2 = 0; b2 < 20; b2++) hist[b2] /= A;
    const mm2 = (L / 1000) ** 2,
      nPerf = sec.caps.filter((c) => !c.shut).length;
    return {
      mean: s / A,
      low: lo / A,
      min: mn,
      hist,
      met: dem > 0 ? up / dem : 1,
      fibMean: Float64Array.from(fs, (v, k) => (fa[k] ? v / fa[k] : NaN)),
      typeMean: ts.map((v, t) => (ta[t] ? v / ta[t] : NaN)),
      nCap: sec.caps.length,
      nFib: sec.nFib,
      nPerf,
      cf: sec.caps.length / sec.nFib,
      cd: sec.caps.length / mm2,
      cfPerf: nPerf / sec.nFib,
      cdPerf: nPerf / mm2,
    };
  }
  // ----- the solver used by the page -----
  function createSolver(sec) {
    const S = {
      coarse: levelGeometry(sec, NCOARSE),
      fine: levelGeometry(sec, NFINE),
      coarseOK: false,
      fineOK: false,
      fineFresh: false,
      converged: false,
      sweeps: 0,
    };
    S.coarse.u.fill(PC);
    S.fine.u.fill(PC);
    S.update = (fineToo) => {
      assembleLevel(S.coarse, sec);
      S.fineStarted = false;
      S.coarseOK = false;
      S.fineFresh = false;
      S.fineOK = false;
      S.fineDirty = true;
      S.converged = false;
      if (fineToo) {
        assembleLevel(S.fine, sec);
        S.fineDirty = false;
      }
    };
    // advance within a time budget; while editing only the coarse level is solved
    S.step = (budgetMs, editing) => {
      const t0 = performance.now();
      while (performance.now() - t0 < budgetMs) {
        if (!S.coarseOK) {
          if (mgStep(S.coarse) < 2e-4) S.coarseOK = true;
          continue;
        }
        if (editing) break;
        if (!S.fineOK) {
          if (S.fineDirty) {
            assembleLevel(S.fine, sec);
            S.fineDirty = false;
          }
          if (!S.fineStarted) {
            // start from the 2 µm answer
            const F = S.fine;
            for (let j = 0; j < F.n; j++)
              for (let i = 0; i < F.n; i++) {
                const c = j * F.n + i;
                F.u[c] = F.fixed[c] ? F.fixVal[c] : sampleField(S.coarse, (i + 0.5) * F.h, (j + 0.5) * F.h);
              }
            S.fineStarted = true;
          }
          if (mgStep(S.fine) < 2e-4) {
            S.fineOK = true;
            S.fineFresh = true;
            S.fineStarted = false;
          }
          continue;
        }
        break;
      }
      S.converged = S.coarseOK && (S.fineOK || editing);
      return S.converged;
    };
    S.best = () => (S.fineFresh ? S.fine : S.coarse);
    S.invalidate = () => {
      S.coarseOK = false;
      S.fineOK = false;
      S.fineFresh = false;
      S.fineStarted = false;
      S.converged = false;
    };
    return S;
  }
  // ENGINE END

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
    jet: { name: "Jet", stops: ["#00007f", "#0000ff", "#007fff", "#00ffff", "#7fff7f", "#ffff00", "#ff7f00", "#ff0000", "#7f0000"] },
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
  let cmap = "jet";
  try {
    const m = localStorage.getItem("ox-cmap");
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
  // overlays: oxygen flux streamlines and the Voronoi tessellation of capillary centres
  const OVL = { stream: true, domains: true, density: 300, domSet: "all" };
  const DOM_COL = "#ff4fc3";
  let flow = null;
  // capillaries that seed the tessellation
  function domainSetOf(caps, mode) {
    const out = [];
    caps.forEach((c, k) => {
      if (mode !== "perfused" || !c.shut) out.push({ x: c.x, y: c.y, k });
    });
    return out;
  }
  function clipHalf(poly, nx, ny, c) {
    // keep the part with nx·x + ny·y ≤ c
    const out = [],
      n = poly.length;
    for (let i = 0; i < n; i++) {
      const P = poly[i],
        Q = poly[(i + 1) % n];
      const fp = nx * P[0] + ny * P[1] - c,
        fq = nx * Q[0] + ny * Q[1] - c;
      if (fp <= 0) out.push(P);
      if ((fp < 0 && fq > 0) || (fp > 0 && fq < 0)) {
        const t = fp / (fp - fq);
        out.push([P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1])]);
      }
    }
    return out;
  }
  // exact Voronoi cells inside the section square
  function domainCells(pts) {
    const sq = [
        [0, 0],
        [L, 0],
        [L, L],
        [0, L],
      ],
      e = 1e-6;
    return pts.map((a, i) => {
      let poly = sq;
      for (let j = 0; j < pts.length && poly.length; j++) {
        if (j === i) continue;
        const b = pts[j],
          nx = b.x - a.x,
          ny = b.y - a.y;
        if (nx * nx + ny * ny < 1e-12) {
          if (j < i) poly = [];
          continue;
        } // coincident centres: the first keeps the cell
        poly = clipHalf(poly, nx, ny, (b.x * b.x + b.y * b.y - a.x * a.x - a.y * a.y) / 2);
      }
      let A = 0;
      for (let m = 0; m < poly.length; m++) {
        const P = poly[m],
          Q = poly[(m + 1) % poly.length];
        A += P[0] * Q[1] - Q[0] * P[1];
      }
      const edge = poly.some(([x, y]) => x < e || y < e || x > L - e || y > L - e);
      return { k: a.k, poly, area: Math.abs(A) / 2, edge };
    });
  }
  function domStats(cells) {
    const a = cells.filter((c) => !c.edge && c.area > 0).map((c) => c.area);
    const n = a.length;
    if (n < 2) return { n, total: cells.length, mean: NaN, sd: NaN, logsd: NaN };
    const mean = a.reduce((s, v) => s + v, 0) / n;
    const sd = Math.sqrt(a.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1));
    const lg = a.map((v) => Math.log10(v)),
      lm = lg.reduce((s, v) => s + v, 0) / n;
    const logsd = Math.sqrt(lg.reduce((s, v) => s + (v - lm) ** 2, 0) / (n - 1));
    return { n, total: cells.length, mean, sd, logsd };
  }
  const curCells = () => domainCells(domainSetOf(sec.caps, OVL.domSet));

  // ---- oxygen flux streamlines ----
  function sampArr(a, n, h, x, y) {
    const gx = Math.min(n - 1, Math.max(0, x / h - 0.5)),
      gy = Math.min(n - 1, Math.max(0, y / h - 0.5));
    const i0 = Math.floor(gx),
      j0 = Math.floor(gy),
      i1 = Math.min(n - 1, i0 + 1),
      j1 = Math.min(n - 1, j0 + 1),
      fx = gx - i0,
      fy = gy - j0;
    return (a[j0 * n + i0] * (1 - fx) + a[j0 * n + i1] * fx) * (1 - fy) + (a[j1 * n + i0] * (1 - fx) + a[j1 * n + i1] * fx) * fy;
  }
  // gradient of PO2 on the cell centres (mirror condition at the section edge)
  function gradArrays(G) {
    const n = G.n,
      h = G.h,
      u = G.u,
      gxA = new Float32Array(n * n),
      gyA = new Float32Array(n * n);
    for (let j = 0; j < n; j++)
      for (let i = 0; i < n; i++) {
        const c = j * n + i;
        gxA[c] = ((i < n - 1 ? u[c + 1] : u[c]) - (i > 0 ? u[c - 1] : u[c])) / (2 * h);
        gyA[c] = ((j < n - 1 ? u[c + n] : u[c]) - (j > 0 ? u[c - n] : u[c])) / (2 * h);
      }
    return { gxA, gyA };
  }
  // streamline tracer on a solved field G: steepest descent of PO2 (the flux direction), midpoint steps of ds.
  // trace(x, y) returns the points and the reason the line stopped.
  function makeTracer(G, opt = {}) {
    const n = G.n,
      h = G.h,
      ds = (opt.dsScale || 1) * 0.5 * h,
      eps = opt.eps || 2e-3,
      merge = opt.merge !== false;
    const { gxA, gyA } = opt.grads || gradArrays(G);
    const cellAt = (x, y) => Math.min(n - 1, Math.max(0, Math.floor(y / h))) * n + Math.min(n - 1, Math.max(0, Math.floor(x / h)));
    const inside = (x, y) => x >= 0 && y >= 0 && x <= L && y <= L;
    // no flux at the section edge: the normal component of the gradient falls linearly to zero
    // across the half cell between the outermost cell centres and the edge, so lines turn and run along it
    const ramp = (t) => (t < 0.5 * h ? Math.max(0, t) / (0.5 * h) : t > L - 0.5 * h ? Math.max(0, L - t) / (0.5 * h) : 1);
    const grad = (x, y) => [sampArr(gxA, n, h, x, y) * ramp(x), sampArr(gyA, n, h, x, y) * ramp(y)];
    // points already drawn, on a 1 µm bucket grid: a line stops when it runs into another one,
    // so lines that converge towards a PO2 minimum merge instead of piling up on top of each other
    const NG = Math.ceil(L),
      head = new Int32Array(NG * NG).fill(-1),
      PX = [],
      PY = [],
      PID = [],
      NXT = [];
    const bucket = (x, y) => Math.min(NG - 1, Math.max(0, Math.floor(y))) * NG + Math.min(NG - 1, Math.max(0, Math.floor(x)));
    const addPt = (x, y, id) => {
      const b = bucket(x, y);
      PX.push(x);
      PY.push(y);
      PID.push(id);
      NXT.push(head[b]);
      head[b] = PX.length - 1;
    };
    const DT2 = 0.5 * 0.5;
    const meets = (x, y, id) => {
      const bi = Math.floor(x),
        bj = Math.floor(y);
      for (let dj = -1; dj <= 1; dj++)
        for (let di = -1; di <= 1; di++) {
          const ii = bi + di,
            jj = bj + dj;
          if (ii < 0 || jj < 0 || ii >= NG || jj >= NG) continue;
          for (let k = head[jj * NG + ii]; k >= 0; k = NXT[k]) if (PID[k] !== id && (PX[k] - x) ** 2 + (PY[k] - y) ** 2 < DT2) return PID[k];
        }
      return -1;
    };
    let lineId = 0;
    const trace = (x, y, pre) => {
      const id = lineId++;
      let run = 0,
        why = "steps",
        into = -1;
      if (!inside(x, y) || G.fixed[cellAt(x, y)]) return null;
      const pts = pre ? [pre[0], pre[1], x, y] : [x, y],
        all = opt.keepAll ? [x, y] : null;
      let P = sampleField(G, x, y),
        bad = 0,
        cx16 = x,
        cy16 = y;
      for (let st = 0; st < 1600; st++) {
        const [ax, ay] = grad(x, y),
          m1 = Math.hypot(ax, ay);
        if (m1 < eps) {
          why = "gradient";
          break;
        }
        const hx = x - (0.5 * ds * ax) / m1,
          hy = y - (0.5 * ds * ay) / m1;
        const [bx, by] = grad(hx, hy),
          m2 = Math.hypot(bx, by);
        if (m2 < eps) {
          why = "gradient";
          break;
        }
        let nx = x - (ds * bx) / m2,
          ny = y - (ds * by) / m2;
        nx = Math.min(L, Math.max(0, nx));
        ny = Math.min(L, Math.max(0, ny));
        if (Math.hypot(nx - x, ny - y) < 0.1 * ds) {
          why = "edge";
          break;
        } // pressed against the no-flux edge
        if (G.fixed[cellAt(nx, ny)]) {
          why = "lumen";
          break;
        }
        const Pn = sampleField(G, nx, ny);
        bad = Pn > P + 1e-5 ? bad + 1 : 0;
        if (bad > 2) {
          why = "minimum";
          break;
        } // no longer descending: at a minimum
        if ((st & 15) === 15) {
          if (Math.hypot(nx - cx16, ny - cy16) < 2 * ds) {
            why = "minimum";
            break;
          }
          cx16 = nx;
          cy16 = ny;
        } // circling a minimum
        run += ds;
        if (merge && run > 6) {
          const k = meets(nx, ny, id);
          if (k >= 0) {
            pts.push(nx, ny);
            x = nx;
            y = ny;
            why = "merged";
            into = k;
            break;
          }
        }
        x = nx;
        y = ny;
        P = Pn;
        if (merge) addPt(x, y, id);
        if (all) all.push(x, y);
        if (st & 1) pts.push(x, y);
      }
      // anoxic tissue ends a line through the gradient rule like any other sink; the label is kept for the benchmarks
      if (why === "gradient" && P < 0.02) why = "anoxic";
      // draw the line all the way to where it stopped
      if (pts[pts.length - 2] !== x || pts[pts.length - 1] !== y) pts.push(x, y);
      return { id, pts, why, into, end: [x, y], all };
    };
    return { trace, ds };
  }
  // opt (benchmarks only): G, dsScale, eps, density, merge
  function computeFlow(opt = {}) {
    if (!opt.G && (!S || !S.coarseOK)) return null;
    const G = opt.G || cur(),
      n = G.n,
      h = G.h;
    const cellAt = (x, y) => Math.min(n - 1, Math.max(0, Math.floor(y / h))) * n + Math.min(n - 1, Math.max(0, Math.floor(x / h)));
    const inside = (x, y) => x >= 0 && y >= 0 && x <= L && y <= L;
    // outward flux around each perfused capillary wall, sampled clear of the lumen cells
    const M = 96,
      r1 = RC + 1.5 * h,
      r2 = RC + 2.5 * h,
      rm = (r1 + r2) / 2;
    const capFlux = new Float64Array(sec.caps.length),
      prof = [],
      wallGrad = [];
    sec.caps.forEach((c, ci) => {
      const q = new Float64Array(M);
      if (!c.shut)
        for (let m = 0; m < M; m++) {
          const th = (2 * Math.PI * (m + 0.5)) / M,
            cs = Math.cos(th),
            sn = Math.sin(th);
          const x1 = c.x + r1 * cs,
            y1 = c.y + r1 * sn,
            x2 = c.x + r2 * cs,
            y2 = c.y + r2 * sn;
          if (!inside(x2, y2)) continue;
          const P1 = sampleField(G, x1, y1),
            P2 = sampleField(G, x2, y2);
          let kf = 1;
          if (G.mb) {
            const cl = cellAt(c.x + rm * cs, c.y + rm * sn);
            kf += G.kap[cl] * dsat(Math.max(0, (P1 + P2) / 2), G.P50);
          }
          q[m] = Math.max(0, (kf * (P1 - P2)) / h) * ((2 * Math.PI * rm) / M);
          capFlux[ci] += q[m];
          if (P1 > P2) wallGrad.push((P1 - P2) / h);
        }
      prof.push(q);
    });
    const total = capFlux.reduce((s, v) => s + v, 0);
    // a line stops where the PO2 gradient falls below 0.1% of the median gradient at the capillary walls,
    // so the stopping point is equally close to a minimum at every exercise intensity
    wallGrad.sort((a, b) => a - b);
    const eps = opt.eps || Math.max(1e-6, 1e-3 * (wallGrad[wallGrad.length >> 1] || 1));
    const lines = [],
      arrows = [],
      meta = [];
    if (total > 0) {
      const T = makeTracer(G, { ...opt, eps }),
        dq = total / (opt.density || OVL.density);
      sec.caps.forEach((c, ci) => {
        const F = capFlux[ci];
        if (F <= 0) return;
        let nc = Math.round(F / dq);
        if (nc === 0 && F > 0.3 * dq) nc = 1;
        if (!nc) return;
        const q = prof[ci];
        let cum = 0,
          m = 0;
        for (let k = 0; k < nc; k++) {
          const target = ((k + 0.5) / nc) * F;
          while (m < M - 1 && cum + q[m] < target) {
            cum += q[m];
            m++;
          }
          const fr = q[m] > 0 ? Math.min(1, Math.max(0, (target - cum) / q[m])) : 0.5;
          const th = (2 * Math.PI * (m + fr)) / M,
            cs = Math.cos(th),
            sn = Math.sin(th);
          const r = T.trace(c.x + r1 * cs, c.y + r1 * sn, [c.x + RC * cs, c.y + RC * sn]);
          if (!r || r.pts.length < 4) continue;
          const arr = Float32Array.from(r.pts);
          lines.push(arr);
          meta.push({ cap: ci, id: r.id, why: r.why, into: r.into, seed: [c.x + r1 * cs, c.y + r1 * sn], end: r.end });
          // an arrowhead about 40% of the way along
          let len = 0;
          for (let k2 = 2; k2 < arr.length; k2 += 2) len += Math.hypot(arr[k2] - arr[k2 - 2], arr[k2 + 1] - arr[k2 - 1]);
          if (len > 14) {
            let acc = 0;
            for (let k2 = 2; k2 < arr.length; k2 += 2) {
              const sl = Math.hypot(arr[k2] - arr[k2 - 2], arr[k2 + 1] - arr[k2 - 1]);
              acc += sl;
              if (acc >= 0.4 * len && sl > 0) {
                arrows.push([arr[k2], arr[k2 + 1], (arr[k2] - arr[k2 - 2]) / sl, (arr[k2 + 1] - arr[k2 - 1]) / sl]);
                break;
              }
            }
          }
        }
      });
    }
    const out = { lines, arrows, capFlux, total, meta, r1, rm, h, eps };
    if (!opt.G && !opt.noSet) flow = out;
    return out;
  }
  function drawDomains(s, dpr) {
    const cells = curCells(),
      e = 1e-6;
    const onEdge = (P, Q) => (P[0] < e && Q[0] < e) || (P[1] < e && Q[1] < e) || (P[0] > L - e && Q[0] > L - e) || (P[1] > L - e && Q[1] > L - e);
    const path = new Path2D();
    for (const c of cells) {
      const pl = c.poly;
      for (let m = 0; m < pl.length; m++) {
        const P = pl[m],
          Q = pl[(m + 1) % pl.length];
        if (onEdge(P, Q)) continue;
        path.moveTo(P[0] * s, P[1] * s);
        path.lineTo(Q[0] * s, Q[1] * s);
      }
    }
    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(0,0,0,.3)";
    ctx.lineWidth = 3.4 * dpr;
    ctx.stroke(path);
    ctx.strokeStyle = DOM_COL;
    ctx.lineWidth = 1.8 * dpr;
    ctx.stroke(path);
    ctx.restore();
  }
  function drawFlow(s, dpr) {
    if (!flow) return;
    const path = new Path2D();
    for (const a of flow.lines) {
      path.moveTo(a[0] * s, a[1] * s);
      for (let k = 2; k < a.length; k += 2) path.lineTo(a[k] * s, a[k + 1] * s);
    }
    const heads = new Path2D(),
      al = 4.2 * dpr,
      aw = 2.6 * dpr;
    for (const [x, y, dx, dy] of flow.arrows) {
      const X = x * s,
        Y = y * s;
      heads.moveTo(X + dx * al * 0.5, Y + dy * al * 0.5);
      heads.lineTo(X - dx * al * 0.5 - dy * aw, Y - dy * al * 0.5 + dx * aw);
      heads.lineTo(X - dx * al * 0.5 + dy * aw, Y - dy * al * 0.5 - dx * aw);
      heads.closePath();
    }
    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(0,0,0,.32)";
    ctx.lineWidth = 2.4 * dpr;
    ctx.stroke(path);
    ctx.lineWidth = 1.6 * dpr;
    ctx.stroke(heads);
    ctx.strokeStyle = "rgba(255,255,255,.92)";
    ctx.lineWidth = 1 * dpr;
    ctx.stroke(path);
    ctx.fillStyle = "#fff";
    ctx.fill(heads);
    ctx.restore();
  }
  const cv = $("tissue");
  let ctx = cv.getContext("2d");
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
    img = null,
    exporting = false;

  function cloneSec(s) {
    return { seed: s.seed, types: Int8Array.from(s.types), caps: s.caps.map((c) => ({ ...c })) };
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
        const f = classify(sec, x, y, sec.cand.subarray(q * NCAND, q * NCAND + NCAND)).f;
        disp[py * W + px] = f < 0 ? -1 : pieceAt(sec, x, y, f);
      }
  }

  // the current field: 1 µm once refined, 2 µm while editing
  const cur = () => S.best();
  let divRange = 5;
  function render() {
    if (!img) return;
    const d = img.data;
    let range = 2;
    const G = cur();
    if (view === "change" && base) {
      // scale to the 99th percentile of |change| in the fibres; larger changes saturate
      const ch = [];
      for (let q = 0; q < G.u.length; q++)
        if (G.area[q] > 0) {
          const i = q % G.n,
            j = (q - i) / G.n;
          ch.push(Math.abs(G.u[q] - sampleField(base, (i + 0.5) * G.h, (j + 0.5) * G.h)));
        }
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
            p = sampleField(G, x, y);
          if (view === "change") {
            const dv = base ? p - sampleField(base, x, y) : 0;
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
    if (OVL.domains) drawDomains(s, dpr);
    if (OVL.stream) drawFlow(s, dpr);
    // fibre labels
    ctx.font = `500 ${Math.round(10.5 * dpr)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    sec.cent.forEach((p, k) => {
      if (!p || !sec.bigPiece[k]) return;
      const t = TYPES[sec.types[k]].key;
      ctx.lineWidth = 3 * dpr;
      ctx.strokeStyle = "rgba(0,0,0,.6)";
      ctx.strokeText(t, p.x * s, p.y * s);
      ctx.fillStyle = "#fff";
      ctx.fillText(t, p.x * s, p.y * s);
    });
    // counting frame: inclusion edges (top, right) dashed, exclusion edges (left, bottom) solid; not drawn in exports
    if (!exporting) {
      ctx.save();
      ctx.lineWidth = 2 * dpr;
      ctx.strokeStyle = "#2e8a4f";
      ctx.setLineDash([6 * dpr, 4 * dpr]);
      ctx.beginPath();
      ctx.moveTo(0, dpr);
      ctx.lineTo(W - dpr, dpr);
      ctx.lineTo(W - dpr, W);
      ctx.stroke();
      ctx.strokeStyle = "#c2432f";
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(dpr, 0);
      ctx.lineTo(dpr, W - dpr);
      ctx.lineTo(W, W - dpr);
      ctx.stroke();
      ctx.restore();
    }
    // capillaries
    const R = 5 * dpr;
    sec.caps.forEach((c, k) => {
      {
        const X = c.x * s,
          Y = c.y * s;
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
          return;
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
    const keys = [];
    if (OVL.stream)
      keys.push(
        `<span><svg class="ox-glyph" viewBox="0 0 18 10" aria-hidden="true"><path d="M1 8 C6 8 9 2 17 2" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="3.4" stroke-linecap="round"/><path d="M1 8 C6 8 9 2 17 2" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>Oxygen flux streamline</span>`
      );
    if (OVL.domains)
      keys.push(
        `<span><svg class="ox-glyph" viewBox="0 0 18 10" aria-hidden="true"><path d="M1 9 L7 5 L7 1 M7 5 L17 7" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="3.6" stroke-linejoin="round"/><path d="M1 9 L7 5 L7 1 M7 5 L17 7" fill="none" stroke="#ff4fc3" stroke-width="1.8" stroke-linejoin="round"/></svg>Capillary domain boundary (${OVL.domSet === "perfused" ? "perfused capillaries" : "all capillaries"})</span>`
      );
    if (keys.length) el.innerHTML += `<div class="ox-ovkey">${keys.join("")}</div>`;
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
    const st = stats(cur(), sec, thr);
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
    $("bytype").innerHTML = TYPES.map((t, i) => {
      const v = st.typeMean[i],
        b = bs ? bs.typeMean[i] : NaN;
      const d =
        Number.isFinite(v) && Number.isFinite(b) ? delta(v, b, "").replace(" vs baseline", "").replace("no change from baseline", "±0.0") : "";
      return `<div class="ox-tm"><span class="ox-tmname"><span class="ox-sw" style="background:${TYPE_COLORS[i]}"></span>${t.name}</span><span class="ox-tmv">${Number.isFinite(v) ? fmt(v) : "–"}</span><span class="ox-tmd">${d}</span></div>`;
    }).join("");
    $("demtab").innerHTML =
      `<tr><th>Fibre type</th><th>Relative to type I</th><th>Demand at ${MODEL.intensity}× rest (×10⁻³ ml O₂ ml⁻¹ s⁻¹)</th></tr>` +
      TYPES.map(
        (t, i) =>
          `<tr><td><span class="ox-typechip"><span class="ox-sw" style="background:${TYPE_COLORS[i]}"></span>${t.name}</span></td><td>${t.rel.toFixed(2)}</td><td>${(typeUptake(sec, i) * 1e3).toFixed(2)}</td></tr>`
      ).join("");
    $("g-n").textContent = st.nCap;
    $("g-f").textContent = st.nFib;
    $("g-cf").textContent = fmt(st.cf, 2);
    $("g-cd").textContent = `${Math.round(st.cd)} mm⁻²`;
    $("g-np").textContent = st.nPerf;
    $("g-cfp").textContent = fmt(st.cfPerf, 2);
    $("g-cdp").textContent = `${Math.round(st.cdPerf)} mm⁻²`;
    const dm = domStats(curCells()),
      bd = base ? base.dom(OVL.domSet) : null;
    const dd = (v, b, n, unit = "") => {
      if (!bd || !Number.isFinite(v) || !Number.isFinite(b)) return "";
      const x = v - b;
      if (Math.abs(x) < Math.pow(10, -n) / 2) return `<span class="ox-dd">±0</span>`;
      return `<span class="ox-dd">${x > 0 ? "+" : "−"}${Math.abs(x).toFixed(n)}${unit}</span>`;
    };
    $("domlab").textContent = `Capillary domains · ${OVL.domSet === "perfused" ? "perfused capillaries" : "all capillaries"}`;
    $("g-dn").textContent = `${dm.n} of ${dm.total}`;
    $("g-da").innerHTML = Number.isFinite(dm.mean) ? `${Math.round(dm.mean)} µm²${dd(dm.mean, bd && bd.mean, 0)}` : "–";
    $("g-ds").innerHTML = Number.isFinite(dm.sd) ? `${Math.round(dm.sd)} µm²${dd(dm.sd, bd && bd.sd, 0)}` : "–";
    $("g-dl").innerHTML = Number.isFinite(dm.logsd) ? `${dm.logsd.toFixed(3)}${dd(dm.logsd, bd && bd.logsd, 3)}` : "–";
    drawHist(st, bs);
  }

  function drawHist(st, bs, tk = TOK, target = $("hist")) {
    const w = 340,
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
      s += `<line x1="${ml}" x2="${w - mr}" y1="${Y(v)}" y2="${Y(v)}" stroke="${tk.line}" stroke-width="1"/>`;
      s += `<text x="${ml - 6}" y="${Y(v) + 4}" text-anchor="end" font-size="10.5" fill="${tk.muted}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace">${Math.round(v * 100)}%</text>`;
    }
    for (let p = 0; p <= PC; p += 10)
      s += `<text x="${X(p)}" y="${h - mb + 15}" text-anchor="middle" font-size="10.5" fill="${tk.muted}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace">${p}</text>`;
    s += `<text x="${ml + pw / 2}" y="${h - 2}" text-anchor="middle" font-size="11" fill="${tk.muted}" font-family="inherit">Fibre PO₂ (mmHg)</text>`;
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
      s += `<path d="${d}" fill="none" stroke="${tk.ink}" stroke-width="1.5" stroke-linejoin="round"/>`;
    }
    s += `<line x1="${X(thr)}" x2="${X(thr)}" y1="${mt}" y2="${mt + ph}" stroke="${tk.accent}" stroke-width="1.5" stroke-dasharray="3 3"/>`;
    s += `<line x1="${ml}" x2="${w - mr}" y1="${mt + ph}" y2="${mt + ph}" stroke="${tk.muted}" stroke-width="1"/>`;
    // hit targets
    st.hist.forEach((v, b) => {
      s += `<rect data-b="${b}" x="${ml + b * bw}" y="${mt}" width="${bw}" height="${ph}" fill="transparent"/>`;
    });
    if (target) target.innerHTML = s;
    return s;
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
  // coarse (2 µm) answers while a capillary is being dragged; the 1 µm answer follows once the edit is finished
  let running = false,
    editing = false,
    shownCoarse = false;
  function kick() {
    S.update(false);
    shownCoarse = false;
    $("status").textContent = "Solving…";
    resume();
  }
  function resume() {
    if (!running) {
      running = true;
      requestAnimationFrame(loop);
    }
  }
  function loop() {
    const done = S.step(14, editing);
    if (done || (S.coarseOK && !shownCoarse)) computeFlow();
    render();
    if (S.coarseOK && !shownCoarse && !done) {
      shownCoarse = true;
      updateStats();
      legend();
    }
    if (done) {
      running = false;
      if (wantBaseline && S.fineFresh) setBaseline();
      updateStats();
      legend();
      $("status").textContent = S.fineFresh ? "Solved" : "Solved · 2 µm";
    } else {
      $("status").textContent = S.coarseOK ? "Refining · 1 µm" : "Solving…";
      requestAnimationFrame(loop);
    }
  }
  function setBaseline() {
    const G = cur();
    const snap2 = {
      n: G.n,
      h: G.h,
      u: Float64Array.from(G.u),
      area: Float64Array.from(G.area),
      fixed: Uint8Array.from(G.fixed),
      piece: Int32Array.from(G.piece),
      K: Float64Array.from(G.K),
      Pm: G.Pm,
    };
    const s2 = { caps: sec.caps.map((c) => ({ ...c })), nFib: sec.nFib, types: Int8Array.from(sec.types) };
    const cache = {};
    const dcache = {};
    base = {
      ...snap2,
      stats: (t) => cache[t] || (cache[t] = stats(snap2, s2, t)),
      dom: (m) => dcache[m] || (dcache[m] = domStats(domainCells(domainSetOf(s2.caps, m)))),
    };
    wantBaseline = false;
  }

  function load(seed, keepBase) {
    const prev = sec;
    sec = makeSection(seed, MODEL.shape);
    attachTissue(sec);
    orig = cloneSec(sec);
    if (keepBase && prev && prev.seed === seed) {
      // keep retyped fibres when switching shape (pieces matched by fibre)
      const bySeed = new Map();
      prev.pieceSeed.forEach((s, q) => {
        if (!bySeed.has(s)) bySeed.set(s, prev.types[q]);
      });
      sec.types = Int8Array.from(sec.pieceSeed, (s, p) => (bySeed.has(s) ? bySeed.get(s) : sec.types[p]));
    }
    applyShut(sec);
    normaliseDemand(sec);
    S = createSolver(sec);
    selCap = -1;
    flow = null;
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
      const d = Math.hypot(p.x - c.x, p.y - c.y);
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
      editing = true;
      cv.classList.add("grabbing");
      render();
    }
  });
  cv.addEventListener("pointermove", (e) => {
    const p = toMicron(e);
    if (down && Math.hypot(p.px - down.px, p.py - down.py) > 6) down.moved = true;
    if (drag >= 0 && down.moved) {
      const q = snap(sec, Math.max(0, Math.min(L - 1e-6, p.x)), Math.max(0, Math.min(L - 1e-6, p.y)));
      clampCap(q);
      sec.caps[drag].x = q.x;
      sec.caps[drag].y = q.y;
      kick();
    } else if (!down) cv.classList.toggle("grab", hitCap(p) >= 0);
    readout(p);
  });
  function endPointer(e) {
    if (!down) return;
    const p = toMicron(e);
    if (drag >= 0 && !down.moved) {
      // tap on a capillary: shut it or reopen it
      editing = false;
      sec.caps[drag].shut = !sec.caps[drag].shut;
      kick();
      readout(p);
    } else if (drag < 0 && !down.moved) {
      const f = pieceAt(sec, p.x, p.y);
      if (f >= 0 && sec.types[f] !== brush) {
        sec.types[f] = brush;
        kick();
      }
    }
    if (editing) {
      editing = false;
      resume();
    } // the drag has ended: refine at 1 µm
    drag = -1;
    down = null;
    cv.classList.remove("grabbing");
  }
  cv.addEventListener("pointerup", endPointer);
  cv.addEventListener("pointercancel", () => {
    drag = -1;
    down = null;
    cv.classList.remove("grabbing");
    if (editing) {
      editing = false;
      resume();
    }
  });
  cv.addEventListener("pointerleave", (e) => {
    if (e.pointerType === "mouse" && !down) $("readout").textContent = "Point at the section to read PO₂.";
  });
  function readout(p) {
    if (p.x < 0 || p.y < 0 || p.x >= L || p.y >= L) return;
    const hc = hitCap(p);
    if (hc >= 0 && Math.hypot(p.x - sec.caps[hc].x, p.y - sec.caps[hc].y) < (8 / CSS) * L + RC) {
      const share =
        flow && flow.total > 0 && !sec.caps[hc].shut
          ? ` · supplies ${((flow.capFlux[hc] / flow.total) * 100).toFixed(1)}% of the oxygen leaving all capillaries`
          : "";
      $("readout").textContent = sec.caps[hc].shut
        ? "Non-perfused capillary · tap to reopen"
        : `Capillary · ${capPO2(sec.caps[hc]).toFixed(1)} mmHg${share} · tap to shut`;
      return;
    }
    const f = pieceAt(sec, p.x, p.y),
      v = sampleField(cur(), p.x, p.y);
    const where = f < 0 ? "Interstitium" : `${TYPES[sec.types[f]].name} fibre`;
    let txt = `${where} · ${v.toFixed(1)} mmHg`;
    if (base && f >= 0) {
      const dv = v - sampleField(base, p.x, p.y);
      if (Math.abs(dv) >= 0.05) txt += ` (${dv > 0 ? "+" : "−"}${Math.abs(dv).toFixed(1)})`;
    }
    if (OVL.domains) {
      const pts = domainSetOf(sec.caps, OVL.domSet);
      let bi = -1,
        bd2 = Infinity;
      pts.forEach((q, i) => {
        const d = (q.x - p.x) ** 2 + (q.y - p.y) ** 2;
        if (d < bd2) {
          bd2 = d;
          bi = i;
        }
      });
      if (bi >= 0) {
        const c = domainCells(pts)[bi];
        txt += ` · domain ${Math.round(c.area)} µm²${c.edge ? " (cut by the edge)" : ""}`;
      }
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
      clampCap(q);
      c.x = q.x;
      c.y = q.y;
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
  $("ovseg").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const k = b.dataset.o;
    OVL[k] = !OVL[k];
    b.setAttribute("aria-pressed", String(OVL[k]));
    if (k === "stream" && OVL.stream && !flow) computeFlow();
    render();
    legend();
  });
  $("sdens").addEventListener("change", (e) => {
    OVL.density = +e.target.value;
    computeFlow();
    render();
  });
  $("dset").addEventListener("change", (e) => {
    OVL.domSet = e.target.value;
    render();
    legend();
    if (lastStats) updateStats();
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
    kick();
  });
  segGroup("bcseg", (v) => {
    MODEL.bc = v;
    kick();
  });
  segGroup("mbseg", (v) => {
    const k = +v;
    MODEL.mb = k > 0;
    MODEL.mbScale = k || 1;
    kick();
  });
  segGroup("capseg", (v) => {
    MODEL.drop = +v;
    kick();
  });
  segGroup("shutseg", (v) => {
    MODEL.shutFrac = +v;
    applyShut(sec);
    kick();
    render();
  });
  $("cmap").innerHTML = Object.entries(MAPS)
    .map(([k, m]) => `<option value="${k}"${k === cmap ? " selected" : ""}>${m.name}</option>`)
    .join("");
  $("cmap").addEventListener("change", (e) => {
    cmap = e.target.value;
    SEQ = lut(MAPS[cmap].stops);
    try {
      localStorage.setItem("ox-cmap", cmap);
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
    if (S.converged && S.fineFresh) {
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
    normaliseDemand(sec);
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
  // info buttons: one explanation open at a time
  document.querySelectorAll(".ox-info").forEach((btn) => {
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") !== "true";
      document.querySelectorAll(".ox-info[aria-expanded='true']").forEach((b) => {
        b.setAttribute("aria-expanded", "false");
        document.getElementById(b.getAttribute("aria-controls")).hidden = true;
      });
      btn.setAttribute("aria-expanded", String(open));
      document.getElementById(btn.getAttribute("aria-controls")).hidden = !open;
    });
  });
  // each closed group shows its current settings
  function summaries() {
    document.querySelectorAll(".ox-gsum").forEach((el) => {
      el.textContent = el.dataset.for
        .split(",")
        .map((id) => {
          const n = $(id);
          if (n.tagName === "SELECT") return n.options[n.selectedIndex].text;
          const b = n.querySelector("button[aria-pressed='true']");
          const t = b ? b.textContent.trim() : "";
          const fmt = {
            shutseg: (s) => (s === "None" ? "All perfused" : s + " shut"),
            mbseg: (s) => "Myoglobin " + s.toLowerCase(),
            brushseg: (s) => "tap → " + s,
            capseg: (s) => (s.includes("mmHg") ? s : s + " mmHg"),
          };
          return t && fmt[id] ? fmt[id](t) : t;
        })
        .filter(Boolean)
        .join(" · ");
    });
  }
  document.querySelector(".ox-model").addEventListener("click", () => setTimeout(summaries, 0));
  document.querySelector(".ox-model").addEventListener("change", summaries);
  // on narrow screens only one group stays open
  const narrow = matchMedia("(max-width: 880px)");
  document.querySelectorAll(".ox-grp").forEach((d) =>
    d.addEventListener("toggle", () => {
      if (d.open && narrow.matches)
        document.querySelectorAll(".ox-grp").forEach((o) => {
          if (o !== d) o.open = false;
        });
    })
  );
  // keep the buttons in step with the model (also after the page is updated while open)
  const SEGS = { shape: "shapeseg", intensity: "intseg", bc: "bcseg", kinetics: "kinseg", drop: "capseg", shutFrac: "shutseg" };
  function syncControls() {
    for (const [k, id] of Object.entries(SEGS))
      $(id)
        .querySelectorAll("button")
        .forEach((b) => b.setAttribute("aria-pressed", String(String(MODEL[k]) === b.dataset.v)));
    const mbv = String(MODEL.mb ? MODEL.mbScale : 0);
    $("mbseg")
      .querySelectorAll("button")
      .forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === mbv)));
    $("thr").value = String(thr);
    $("cmap").value = cmap;
    $("ovseg")
      .querySelectorAll("button")
      .forEach((b) => b.setAttribute("aria-pressed", String(!!OVL[b.dataset.o])));
    $("sdens").value = String(OVL.density);
    $("dset").value = OVL.domSet;
    summaries();
  }

  // ---- PDF export ----
  const LIGHT = {
    ink: "#1a1e26",
    muted: "#586172",
    line: "#d8dce3",
    accent: "#9a3446",
    tissue: "#efece4",
    "div-neg": "#c2432f",
    "div-mid": "#e6e5e1",
    "div-pos": "#2f6db0",
    surface: "#ffffff",
  };
  const FIG_MM = 80,
    MARGIN = 10;
  const msg = (t) => {
    $("expmsg").textContent = t;
  };
  const segText = (id) => {
    const b = $(id).querySelector("button[aria-pressed='true']");
    return b ? b.textContent.trim() : "";
  };
  function settingsLine() {
    return [
      `Tissue ${sec.seed}`,
      segText("intseg"),
      `${segText("bcseg")} wall`,
      segText("kinseg"),
      `Myoglobin ${segText("mbseg").toLowerCase()}`,
      segText("shutseg") === "None" ? "All capillaries perfused" : `${segText("shutseg")} capillaries shut`,
      `Capillary PO₂ ${segText("capseg")}`,
      `${segText("shapeseg")} fibres`,
    ].join(" · ");
  }
  // draws text, setting the characters Helvetica lacks (₂, −, ≥, superscripts) by hand
  function pdfText(doc, str, x, y, size, opts = {}) {
    str = str.replace(/−/g, "-").replace(/≥/g, ">=").replace(/→/g, "->");
    const runs = str.split(/(₂|⁻¹|⁻²|⁻³|⁻⁵)/).filter((r) => r !== "");
    const sup = { "⁻¹": "-1", "⁻²": "-2", "⁻³": "-3", "⁻⁵": "-5" };
    doc.setFontSize(size);
    let total = 0;
    for (const r of runs) {
      doc.setFontSize(r === "₂" || sup[r] ? size * 0.68 : size);
      total += doc.getTextWidth(r === "₂" ? "2" : sup[r] || r);
    }
    let cx = opts.align === "center" ? x - total / 2 : opts.align === "right" ? x - total : x;
    const pt = 0.3528;
    for (const r of runs) {
      if (r === "₂") {
        doc.setFontSize(size * 0.68);
        doc.text("2", cx, y + size * pt * 0.22);
        cx += doc.getTextWidth("2");
      } else if (sup[r]) {
        doc.setFontSize(size * 0.68);
        doc.text(sup[r], cx, y - size * pt * 0.38);
        cx += doc.getTextWidth(sup[r]);
      } else {
        doc.setFontSize(size);
        doc.text(r, cx, y);
        cx += doc.getTextWidth(r);
      }
    }
    doc.setFontSize(size);
  }
  function newDoc(heightMM, title) {
    const { jsPDF } = window.jspdf;
    const w = FIG_MM + 2 * MARGIN;
    const doc = new jsPDF({ unit: "mm", format: [w, heightMM], orientation: w > heightMM ? "landscape" : "portrait", compress: true });
    doc.setProperties({ title, creator: "Muscle oxygen explorer" });
    doc.setFont("helvetica", "normal");
    doc.setTextColor(26, 30, 38);
    return doc;
  }
  function headerText(doc, title) {
    doc.setFont("helvetica", "bold");
    pdfText(doc, title, MARGIN, MARGIN, 9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(88, 97, 114);
    const lines = doc.splitTextToSize(settingsLine().replace(/₂/g, "2"), FIG_MM);
    doc.setFontSize(6);
    doc.text(lines, MARGIN, MARGIN + 4);
    doc.setTextColor(26, 30, 38);
    return MARGIN + 4 + lines.length * 2.6 + 1.5;
  }
  async function savePdf(doc, filename) {
    const blob = doc.output("blob");
    let dl = null;
    try {
      dl = window.claude && window.claude.use ? await window.claude.use("downloads") : null;
    } catch (e) {
      dl = null;
    }
    if (dl) {
      try {
        await dl.save({ filename, data: blob });
        msg(`Saved ${filename}`);
      } catch (e) {
        msg(e && e.code === "declined" ? "Export cancelled." : "Saving files is not available in this view.");
      }
      return;
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 2000);
    msg(`Saved ${filename}`);
  }
  const ready = () => {
    if (!window.jspdf) {
      msg("The PDF library could not be loaded, so export is unavailable.");
      return false;
    }
    if (!S.converged || !S.fineFresh) {
      msg("Wait until the 1 µm solution is ready, then export.");
      return false;
    }
    return true;
  };
  const pause = () => new Promise((r) => setTimeout(r, 30));

  async function exportMap() {
    if (!ready()) return;
    const dpi = +$("dpi").value || 600,
      Wp = Math.round((FIG_MM / 25.4) * dpi);
    msg(`Preparing PDF at ${dpi} dpi…`);
    await pause();
    const dispP = new Int16Array(Wp * Wp);
    for (let py = 0; py < Wp; py++)
      for (let px = 0; px < Wp; px++) {
        const x = ((px + 0.5) / Wp) * L,
          y = ((py + 0.5) / Wp) * L;
        const q = (Math.round(y / H) % N) * N + (Math.round(x / H) % N);
        const f = classify(sec, x, y, sec.cand.subarray(q * NCAND, q * NCAND + NCAND)).f;
        dispP[py * Wp + px] = f < 0 ? -1 : pieceAt(sec, x, y, f);
      }
    const off = document.createElement("canvas");
    off.width = off.height = Wp;
    const keep = { ctx, W, CSS, img, disp, TISSUE, DIV, selCap };
    // CSS = 400 sets labels to about 6 pt and capillaries to about 2 mm across on the 8 cm figure
    ctx = off.getContext("2d");
    W = Wp;
    CSS = 400;
    img = ctx.createImageData(Wp, Wp);
    disp = dispP;
    selCap = -1;
    TISSUE = hex(LIGHT.tissue);
    DIV = lut([LIGHT["div-neg"], LIGHT["div-mid"], LIGHT["div-pos"]]);
    try {
      exporting = true;
      render();
      exporting = false;
      // scale bar, 50 µm, drawn into the image so the µ sign survives
      const k = Wp / FIG_MM,
        sb = (Wp * 50) / L,
        sx = 3 * k,
        sy = Wp - 4 * k;
      ctx.lineCap = "butt";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 0.9 * k;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + sb, sy);
      ctx.stroke();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 0.5 * k;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + sb, sy);
      ctx.stroke();
      ctx.font = `500 ${2.3 * k}px Helvetica, Arial, sans-serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.lineWidth = 0.5 * k;
      ctx.strokeStyle = "rgba(0,0,0,.7)";
      ctx.strokeText("50 µm", sx, sy - 1.3 * k);
      ctx.fillStyle = "#fff";
      ctx.fillText("50 µm", sx, sy - 1.3 * k);
    } finally {
      exporting = false;
      ({ ctx, W, CSS, img, disp, TISSUE, DIV, selCap } = keep);
      render();
    }
    const title = view === "type" ? "Fibre type" : view === "change" ? "Change in PO₂ since baseline (mmHg)" : "Predicted PO₂ (mmHg)";
    // measure the header first, then size the page
    const tmp = newDoc(200, title),
      y = headerText(tmp, title);
    const ovText = [
      OVL.stream ? "White lines: oxygen flux streamlines" : "",
      OVL.domains ? `pink lines: capillary domains (Voronoi, ${OVL.domSet === "perfused" ? "perfused capillaries" : "all capillaries"})` : "",
    ]
      .filter(Boolean)
      .join("; ");
    const pageH = y + FIG_MM + 16 + (ovText ? 4 : 0);
    const pdf = newDoc(pageH, title);
    headerText(pdf, title);
    pdf.addImage(off.toDataURL("image/png"), "PNG", MARGIN, y, FIG_MM, FIG_MM, undefined, "FAST");
    pdf.setDrawColor(216, 220, 227);
    pdf.setLineWidth(0.2);
    pdf.rect(MARGIN, y, FIG_MM, FIG_MM);
    // colour bar or type key
    const cy = y + FIG_MM + 4;
    if (view === "type") {
      let kx = MARGIN;
      TYPES.forEach((t, i) => {
        const c = hex(TYPE_COLORS[i]);
        pdf.setFillColor(c[0], c[1], c[2]);
        pdf.rect(kx, cy, 3, 3, "F");
        pdf.setFontSize(7);
        pdf.text(`${t.name} (demand ${t.rel.toFixed(2)} of type I)`, kx + 4, cy + 2.4);
        kx += 27;
      });
    } else {
      const bar = document.createElement("canvas");
      bar.width = 512;
      bar.height = 1;
      const bctx = bar.getContext("2d"),
        bd = bctx.createImageData(512, 1);
      const lu = view === "change" ? lut([LIGHT["div-neg"], LIGHT["div-mid"], LIGHT["div-pos"]]) : SEQ;
      for (let i = 0; i < 512; i++) {
        const k = Math.round((i / 511) * 255) * 3;
        bd.data.set([lu[k], lu[k + 1], lu[k + 2], 255], i * 4);
      }
      bctx.putImageData(bd, 0, 0);
      pdf.addImage(bar.toDataURL("image/png"), "PNG", MARGIN, cy, FIG_MM, 3);
      pdf.setLineWidth(0.15);
      pdf.setDrawColor(150, 150, 150);
      pdf.rect(MARGIN, cy, FIG_MM, 3);
      const ticks =
        view === "change"
          ? [
              [-divRange, 0],
              [0, 0.5],
              [divRange, 1],
            ]
          : [
              [0, 0],
              [10, 0.25],
              [20, 0.5],
              [30, 0.75],
              [40, 1],
            ];
      pdf.setTextColor(88, 97, 114);
      ticks.forEach(([v, f], i) =>
        pdfText(
          pdf,
          (view === "change" && v > 0 ? "+" : "") + (v === 40 && view !== "change" ? "≥40" : String(v)),
          MARGIN + f * FIG_MM,
          cy + 6.2,
          6.5,
          { align: i === 0 ? "left" : i === ticks.length - 1 ? "right" : "center" }
        )
      );
      pdf.setTextColor(26, 30, 38);
    }
    if (ovText) {
      pdf.setTextColor(88, 97, 114);
      pdfText(pdf, ovText.charAt(0).toUpperCase() + ovText.slice(1) + ".", MARGIN, y + FIG_MM + (view === "type" ? 11 : 13), 6);
      pdf.setTextColor(26, 30, 38);
    }
    await savePdf(pdf, `oxygen-${view === "type" ? "fibre-types" : view === "change" ? "po2-change" : "po2-map"}-tissue${sec.seed}.pdf`);
  }

  async function exportHist() {
    if (!ready() || !lastStats) return;
    const dpi = +$("dpi").value || 600,
      Wp = Math.round((FIG_MM / 25.4) * dpi),
      Hp = Math.round((Wp * 170) / 340);
    msg(`Preparing PDF at ${dpi} dpi…`);
    await pause();
    const bs = base ? base.stats(thr) : null;
    const inner = drawHist(lastStats, bs, LIGHT, null)
      .replace(/<rect data-b[^>]*\/>/g, "")
      .replace(/font-family="[^"]*"/g, 'font-family="Helvetica, Arial, sans-serif"');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 170" width="${Wp}" height="${Hp}"><rect width="340" height="170" fill="#ffffff"/>${inner}</svg>`;
    const im = new Image();
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    try {
      im.src = url;
      await im.decode();
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    const c = document.createElement("canvas");
    c.width = Wp;
    c.height = Hp;
    const cx = c.getContext("2d");
    cx.fillStyle = "#fff";
    cx.fillRect(0, 0, Wp, Hp);
    cx.drawImage(im, 0, 0, Wp, Hp);
    const title = "Distribution of fibre PO₂";
    const tmp = newDoc(200, title);
    const y = headerText(tmp, title);
    const hmm = (FIG_MM * Hp) / Wp,
      pageH = y + hmm + 15;
    const pdf = newDoc(pageH, title);
    headerText(pdf, title);
    pdf.addImage(c.toDataURL("image/png"), "PNG", MARGIN, y, FIG_MM, hmm, undefined, "FAST");
    pdf.setTextColor(88, 97, 114);
    pdfText(pdf, `Bars: share of fibre area in each 2 mmHg band${bs ? "; outline: baseline" : ""}.`, MARGIN, y + hmm + 4, 6);
    pdfText(pdf, `Dashed line: low-PO₂ threshold (${thr} mmHg).`, MARGIN, y + hmm + 7, 6);
    pdfText(
      pdf,
      `Mean fibre PO₂ ${fmt(lastStats.mean)} mmHg · area below ${thr} mmHg ${fmt(lastStats.low * 100)}% · demand met ${fmt(lastStats.met * 100)}%`,
      MARGIN,
      y + hmm + 10,
      6
    );
    await savePdf(pdf, `oxygen-po2-distribution-tissue${sec.seed}.pdf`);
  }
  $("exp-map").addEventListener("click", exportMap);
  $("exp-hist").addEventListener("click", exportHist);

  function start(data) {
    if (data && data.v !== 3) data = {}; // settings from an older version of the page are not carried over
    if (data && data.MODEL) Object.assign(MODEL, data.MODEL);
    if (data && data.thr) thr = data.thr;
    readTokens();
    load(data && data.seed ? data.seed : 7);
    syncControls();
    setTimeout(syncControls, 400);
  }
  start({});
})();
