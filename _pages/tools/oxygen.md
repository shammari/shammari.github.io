---
layout: page
title: Muscle oxygen explorer
description: Move capillaries, shut them down or change fibre types in a muscle cross-section and see the predicted oxygen supply respond. Illustrative models that run in your browser.
permalink: /tools/oxygen/
---

<style>
  .ox-root {
    --ox-surface: var(--global-bg-color);
    --ox-bg: var(--global-bg-color);
    --ox-panel: color-mix(in srgb, var(--global-text-color) 3.5%, var(--global-bg-color));
    --ox-ink: var(--global-text-color);
    --ox-muted: var(--global-text-color-light);
    --ox-line: var(--global-divider-color);
    --ox-accent: var(--global-theme-color);
    --ox-tissue: #efece4;
    --ox-div-neg: #c2432f;
    --ox-div-mid: #e6e5e1;
    --ox-div-pos: #2f6db0;
    --ox-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    container-type: inline-size;
    margin: 1rem 0 2rem;
    color: var(--ox-ink);
  }
  html[data-theme="dark"] .ox-root {
    --ox-tissue: #1f2228;
    --ox-div-neg: #e3684f;
    --ox-div-mid: #3a3c41;
    --ox-div-pos: #5f9ae0;
  }
  .ox-root button, .ox-root select { font: inherit; color: inherit; }
  .ox-root :focus-visible { outline: 2px solid var(--ox-accent); outline-offset: 2px; }

  /* Phone: one column. Wide: the section and its options on the left, readouts on the right. */
  .ox-bench { display: grid; gap: 20px; grid-template-columns: minmax(0, 1fr); align-items: start; }
  @container (min-width: 820px) {
    .ox-bench { grid-template-columns: minmax(0, 1fr) 290px; }
    .ox-panel { position: sticky; top: 69px; }
  }
  .ox-stage, .ox-panel { display: grid; gap: 12px; min-width: 0; }
  .ox-panel { gap: 16px; }
  .ox-toolbar { display: flex; flex-wrap: wrap; gap: 10px 16px; align-items: center; justify-content: space-between; }
  .ox-group { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .ox-label { font-size: 0.75rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ox-muted); font-weight: 500; }
  .ox-seg { display: inline-flex; flex-wrap: wrap; gap: 6px; max-width: 100%; }
  .ox-seg button { font-size: 0.8125rem; padding: 5px 11px; border: 1px solid var(--ox-line); border-radius: 999px; background: var(--ox-surface); cursor: pointer; line-height: 1.3; }
  .ox-seg button:hover { border-color: var(--ox-accent); }
  .ox-seg button[aria-pressed="true"] { background: var(--ox-accent); border-color: var(--ox-accent); color: #fff; }
  .ox-root .ox-btn { font-size: 0.8125rem; padding: 5px 12px; border-radius: 999px; border: 1px solid var(--ox-line); background: var(--ox-surface); cursor: pointer; }
  .ox-btn:hover { border-color: var(--ox-accent); }
  .ox-typechip { display: inline-flex; align-items: center; gap: 6px; }
  .ox-sw { width: 11px; height: 11px; border-radius: 3px; display: inline-block; box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2); }

  .ox-canvas-box { position: relative; width: 100%; aspect-ratio: 1 / 1; max-width: 100%; border-radius: 6px; overflow: hidden; background: var(--ox-tissue); box-shadow: 0 0 0 1px var(--ox-line); }
  #ox-tissue { display: block; width: 100%; height: 100%; touch-action: none; cursor: crosshair; }
  #ox-tissue.grab { cursor: grab; }
  #ox-tissue.grabbing { cursor: grabbing; }
  .ox-scalebar { position: absolute; left: 10px; bottom: 10px; display: grid; gap: 2px; color: #fff; font-family: var(--ox-mono); font-size: 11px; text-shadow: 0 0 3px #000, 0 0 2px #000; pointer-events: none; }
  .ox-scalebar .ox-bar { height: 3px; background: #fff; box-shadow: 0 0 2px #000; }
  .ox-status { position: absolute; right: 10px; top: 10px; font-family: var(--ox-mono); font-size: 11px; padding: 3px 8px; border-radius: 999px; background: rgba(0, 0, 0, 0.55); color: #fff; pointer-events: none; }
  .ox-readout { font-family: var(--ox-mono); font-size: 0.8125rem; color: var(--ox-muted); min-height: 1.5em; font-variant-numeric: tabular-nums; }

  .ox-legendrow { display: flex; flex-wrap: wrap; gap: 10px 20px; align-items: end; }
  .ox-legend { display: grid; gap: 4px; flex: 1 1 240px; min-width: 0; }
  .ox-cbar { height: 12px; border-radius: 3px; box-shadow: 0 0 0 1px var(--ox-line); }
  .ox-cticks { display: flex; justify-content: space-between; font-family: var(--ox-mono); font-size: 11px; color: var(--ox-muted); }
  .ox-typelegend { display: flex; flex-wrap: wrap; gap: 6px 16px; font-size: 0.8125rem; }
  .ox-thr { display: flex; align-items: center; gap: 8px; font-size: 0.8125rem; color: var(--ox-muted); }
  .ox-root select { font-size: 0.8125rem; padding: 3px 6px; border-radius: 6px; border: 1px solid var(--ox-line); background: var(--ox-surface); }

  .ox-card { background: var(--ox-panel); border: 1px solid var(--ox-line); border-radius: 10px; padding: 14px; display: grid; gap: 12px; min-width: 0; }
  .ox-model { gap: 16px; }
  .ox-root .ox-ch { font-size: 1.05rem; font-weight: 500; margin: 0; }
  .ox-opt { display: grid; gap: 6px; justify-items: start; }
  .ox-note { font-size: 0.8125rem; color: var(--ox-muted); margin: 0; }
  .ox-metrics { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .ox-metric { display: grid; gap: 2px; align-content: start; }
  .ox-v { font-family: var(--ox-mono); font-size: 1.3rem; font-weight: 500; font-variant-numeric: tabular-nums; }
  .ox-v small { font-size: 0.75rem; color: var(--ox-muted); font-weight: 400; }
  .ox-d { font-family: var(--ox-mono); font-size: 0.72rem; color: var(--ox-muted); font-variant-numeric: tabular-nums; }
  .ox-geom { display: grid; grid-template-columns: auto auto; justify-content: start; gap: 4px 16px; font-size: 0.875rem; margin: 0; }
  .ox-geom dt { color: var(--ox-muted); font-weight: 400; }
  .ox-geom dd { margin: 0; font-family: var(--ox-mono); font-variant-numeric: tabular-nums; }
  .ox-hist-box { position: relative; }
  .ox-hist-box svg { width: 100%; height: auto; display: block; overflow: visible; }
  .ox-tip { position: absolute; pointer-events: none; background: var(--ox-ink); color: var(--ox-bg); font-size: 12px; font-family: var(--ox-mono); padding: 5px 8px; border-radius: 6px; white-space: nowrap; transform: translate(-50%, -100%); }

  /* grouped options and info buttons */
  .ox-model { gap: 0; padding: 0; }
  .ox-root .ox-model > .ox-ch { padding: 14px 14px 8px; }
  .ox-grp { border-top: 1px solid var(--ox-line); }
  .ox-grp > summary { list-style: none; cursor: pointer; display: flex; align-items: baseline; flex-wrap: wrap; gap: 4px 12px; padding: 11px 38px 11px 14px; position: relative; }
  .ox-grp > summary::-webkit-details-marker { display: none; }
  .ox-grp > summary::after { content: ""; position: absolute; right: 16px; top: 17px; width: 7px; height: 7px; border-right: 1.6px solid var(--ox-muted); border-bottom: 1.6px solid var(--ox-muted); transform: rotate(45deg); }
  .ox-grp[open] > summary::after { transform: rotate(-135deg); top: 20px; }
  .ox-grp > summary:hover .ox-gtitle { color: var(--ox-accent); }
  .ox-grp > summary:focus-visible { outline: 2px solid var(--ox-accent); outline-offset: -2px; }
  .ox-gtitle { font-weight: 500; }
  .ox-gsum { font-family: var(--ox-mono); font-size: 0.75rem; color: var(--ox-muted); }
  .ox-grp[open] .ox-gsum { visibility: hidden; }
  .ox-gbody { display: grid; gap: 14px; padding: 2px 14px 16px; }
  .ox-optlab, .ox-cardhead { display: flex; align-items: center; gap: 6px; }
  .ox-cardhead { justify-content: space-between; }
  .ox-root .ox-info { flex: none; width: 20px; height: 20px; border-radius: 50%; border: 1px solid var(--ox-line); background: var(--ox-surface); color: var(--ox-muted); font: italic 600 12px/1 Georgia, serif; cursor: pointer; display: inline-grid; place-items: center; padding: 0; }
  .ox-root .ox-info:hover { color: var(--ox-accent); border-color: var(--ox-accent); }
  .ox-root .ox-info[aria-expanded="true"] { background: var(--ox-accent); border-color: var(--ox-accent); color: #fff; }
  .ox-infotext { font-size: 0.8125rem; color: var(--ox-muted); border-left: 2px solid var(--ox-accent); padding: 2px 0 2px 10px; display: grid; gap: 6px; max-width: 62ch; }
  .ox-infotext[hidden] { display: none; }
  .ox-infotext p { margin: 0; }
  .ox-infotext strong { color: var(--ox-ink); font-weight: 600; }
  .ox-actions { display: flex; flex-wrap: wrap; gap: 8px; }
  .ox-dispset { display: flex; flex-wrap: wrap; gap: 8px 12px; align-items: end; }
  .ox-ds { display: grid; gap: 3px; font-size: 0.6875rem; color: var(--ox-muted); letter-spacing: 0.03em; }
  .ox-root .ox-btn-sm { font-size: 0.75rem; padding: 3px 10px; }
  .ox-exprow { display: flex; justify-content: flex-end; }
  .ox-tablewrap { overflow-x: auto; }
  .ox-demtab { width: 100%; border-collapse: collapse; font-size: 0.78rem; }
  .ox-demtab th { text-align: left; font-weight: 500; color: var(--ox-muted); padding: 3px 8px 3px 0; border-bottom: 1px solid var(--ox-line); }
  .ox-demtab td { padding: 3px 8px 3px 0; font-family: var(--ox-mono); color: var(--ox-ink); }
  .ox-demtab td:first-child { font-family: inherit; }
  .ox-bytype { display: grid; gap: 6px; }
  .ox-tms { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
  .ox-tm { display: grid; gap: 1px; }
  .ox-tmname { display: inline-flex; align-items: center; gap: 5px; font-size: 0.75rem; color: var(--ox-muted); }
  .ox-tmv { font-family: var(--ox-mono); font-size: 1.05rem; font-weight: 500; font-variant-numeric: tabular-nums; }
  .ox-tmd { font-family: var(--ox-mono); font-size: 0.6875rem; color: var(--ox-muted); min-height: 1.2em; }

  .ox-params { width: 100%; font-size: 0.875rem; }
  .ox-params td:last-child { text-align: right; padding-left: 12px; }
  .cp-meta { display: block; font-size: 0.75rem; letter-spacing: 0.04em; text-transform: uppercase; color: var(--global-text-color-light); }
  .cp-further { border: 1px solid var(--global-divider-color); border-left: 3px solid var(--global-theme-color); border-radius: 6px; padding: 1rem 1.2rem 0.4rem; margin: 1rem 0 1.5rem; scroll-margin-top: 5rem; }
  .cp-further h3 { font-size: 1.15rem; margin: 0.3rem 0 0.8rem; }
  .cp-further p, .cp-further li { font-size: 0.95rem; }
  .cp-further .cp-label { font-weight: 600; margin-bottom: 0.3rem; }
</style>

Drag a capillary, tap it to shut it down, or change a fibre's type, and watch the predicted oxygen partial pressure (PO₂) across a cross-section of skeletal muscle respond. The section is synthetic, the parameters come from our published models, and everything runs in your browser. Predictions assume maximal vascular capacity and are illustrative.

<div class="ox-root">
<div class="ox-bench">
    <div class="ox-stage">
      <div class="ox-toolbar">
        <div class="ox-group">
          <span class="ox-label" id="ox-viewlab">Show</span>
          <div class="ox-seg" role="group" aria-labelledby="ox-viewlab" id="ox-viewseg">
            <button type="button" data-view="po2" aria-pressed="true">PO₂</button>
            <button type="button" data-view="change" aria-pressed="false">Change</button>
            <button type="button" data-view="type" aria-pressed="false">Fibre type</button>
          </div>
        </div>
        <div class="ox-group"><span class="ox-readout" id="ox-secname"></span><button type="button" class="ox-btn ox-btn-sm" id="ox-exp-map">Export PDF</button></div>
      </div>
      <div class="ox-canvas-box">
        <canvas id="ox-tissue" tabindex="0" aria-label="Muscle cross-section. Drag a capillary to move it; tap a capillary to shut or reopen it; tap a fibre to change its type. With the keyboard, press [ and ] to select a capillary and the arrow keys to move it."></canvas>
        <div class="ox-scalebar" aria-hidden="true"><span class="ox-bar" id="ox-sbar"></span><span>50 µm</span></div>
        <div class="ox-status" id="ox-status">Solving…</div>
      </div>
      <div class="ox-readout" id="ox-readout" aria-live="polite">Point at the section to read PO₂.</div>
      <div class="ox-legendrow">
        <div class="ox-legend" id="ox-legend"></div>
        <div class="ox-dispset">
          <label class="ox-ds"><span>Colour map</span><select id="ox-cmap"></select></label>
          <label class="ox-ds"><span>Low-PO₂ threshold</span><select id="ox-thr"><option value="0.5" selected>0.5 mmHg</option><option value="1">1 mmHg</option><option value="2">2 mmHg</option><option value="5">5 mmHg</option></select></label>
          <label class="ox-ds"><span>Export resolution</span><select id="ox-dpi"><option value="300">300 dpi</option><option value="600" selected>600 dpi</option><option value="1200">1200 dpi</option></select></label>
          <button type="button" class="ox-info" aria-expanded="false" aria-controls="ox-i-disp" aria-label="About the display settings">i</button>
        </div>
      </div>
      <div class="ox-infotext" id="ox-i-disp" hidden><p><strong>Colour map.</strong> Viridis, Magma and Cividis change evenly in lightness, so equal steps in PO₂ look like equal steps in colour; Cividis stays readable with colour-vision deficiency. Turbo and Jet are rainbow maps: familiar, but they can create apparent boundaries where PO₂ changes smoothly.</p><p><strong>Low-PO₂ threshold.</strong> Fibre area below this PO₂ is reported as low. 0.5 mmHg is the hypoxia threshold used in Al-Shammari et al. (2019).</p><p><strong>Export resolution.</strong> Each <em>Export PDF</em> button saves that graphic as a PDF at this resolution, 8 cm wide, on a white background.</p></div>
      <span class="ox-readout" id="ox-expmsg" aria-live="polite"></span>
      <div class="ox-actions">
        <button type="button" class="ox-btn" id="ox-baseline">Set as baseline</button>
        <button type="button" class="ox-btn" id="ox-reset">Reset</button>
        <button type="button" class="ox-btn" id="ox-newsec">New tissue</button>
      </div>
      <div class="ox-card ox-model">
        <h3 class="ox-ch">Model options</h3>
        <details class="ox-grp" id="ox-g-supply" open>
          <summary><span class="ox-gtitle">Supply · capillaries</span><span class="ox-gsum" data-for="shutseg,capseg,bcseg"></span></summary>
          <div class="ox-gbody">
          <div class="ox-opt">
            <div class="ox-optlab"><span class="ox-label" id="ox-shutlab">Non-perfused capillaries</span><button type="button" class="ox-info" aria-expanded="false" aria-controls="ox-i-shut" aria-label="About non-perfused capillaries">i</button></div>
            <div class="ox-seg" role="group" aria-labelledby="ox-shutlab" id="ox-shutseg">
            <button type="button" data-v="0" aria-pressed="true">None</button>
            <button type="button" data-v="0.1" aria-pressed="false">10%</button>
            <button type="button" data-v="0.2" aria-pressed="false">20%</button>
            <button type="button" data-v="0.3" aria-pressed="false">30%</button>
            <button type="button" data-v="0.4" aria-pressed="false">40%</button>
            <button type="button" data-v="0.5" aria-pressed="false">50%</button>
            </div>
            <div class="ox-infotext" id="ox-i-shut" hidden><p>Shut capillaries stay in place but supply no oxygen: a functional rarefaction. The anatomical capillary counts stay the same, while the perfused values drop.</p><p>You can also tap any capillary in the section to shut it or reopen it.</p></div>
          </div>
          <div class="ox-opt">
            <div class="ox-optlab"><span class="ox-label" id="ox-caplab">Capillary PO₂</span><button type="button" class="ox-info" aria-expanded="false" aria-controls="ox-i-cap" aria-label="About capillary po₂">i</button></div>
            <div class="ox-seg" role="group" aria-labelledby="ox-caplab" id="ox-capseg">
            <button type="button" data-v="0" aria-pressed="true">All 40 mmHg</button>
            <button type="button" data-v="10" aria-pressed="false">30–40</button>
            <button type="button" data-v="20" aria-pressed="false">20–40</button>
            </div>
            <div class="ox-infotext" id="ox-i-cap" hidden><p>40 mmHg is the maximum. Varied PO₂ spreads capillary values evenly below it, for example where blood has already given up some of its oxygen.</p><p>Each capillary keeps its value when moved and is coloured by it.</p></div>
          </div>
          <div class="ox-opt">
            <div class="ox-optlab"><span class="ox-label" id="ox-bclab">Capillary wall</span><button type="button" class="ox-info" aria-expanded="false" aria-controls="ox-i-bc" aria-label="About capillary wall">i</button></div>
            <div class="ox-seg" role="group" aria-labelledby="ox-bclab" id="ox-bcseg">
            <button type="button" data-v="dirichlet" aria-pressed="true">Dirichlet</button>
            <button type="button" data-v="robin" aria-pressed="false">Robin</button>
            </div>
            <div class="ox-infotext" id="ox-i-bc" hidden><p><strong>Dirichlet</strong> holds the capillary wall at the capillary PO₂.</p><p><strong>Robin</strong> lets oxygen cross the wall at a rate k(P<sub>cap</sub> − P), so PO₂ falls across the wall and less oxygen reaches the tissue.</p></div>
          </div>
          </div>
        </details>
        <details class="ox-grp" id="ox-g-demand">
          <summary><span class="ox-gtitle">Demand · fibres</span><span class="ox-gsum" data-for="intseg,kinseg"></span></summary>
          <div class="ox-gbody">
          <div class="ox-opt">
            <div class="ox-optlab"><span class="ox-label" id="ox-intlab">Exercise intensity</span><button type="button" class="ox-info" aria-expanded="false" aria-controls="ox-i-int" aria-label="About exercise intensity">i</button></div>
            <div class="ox-seg" role="group" aria-labelledby="ox-intlab" id="ox-intseg">
            <button type="button" data-v="1" aria-pressed="false">Rest ×1</button>
            <button type="button" data-v="3" aria-pressed="true">Low ×3</button>
            <button type="button" data-v="6" aria-pressed="false">Moderate ×6</button>
            <button type="button" data-v="12" aria-pressed="false">Intense ×12</button>
            </div>
            <div class="ox-infotext" id="ox-i-int" hidden><p id="ox-uptake"></p><p>Demand is set so the tissue-average demand at rest equals the published M₀, keeping the ratios between fibre types, then multiplied by the intensity.</p></div>
          </div>
          <div class="ox-opt">
            <div class="ox-optlab"><span class="ox-label">Demand by fibre type</span><button type="button" class="ox-info" aria-expanded="false" aria-controls="ox-i-dem" aria-label="About demand by fibre type">i</button></div>
            <div class="ox-infotext" id="ox-i-dem" hidden><div class="ox-tablewrap"><table class="ox-demtab" id="ox-demtab"></table></div><p>Demand relative to type I is from Al-Shammari, Gaffney &amp; Egginton (2014), Table II (M₀ = 15.7, 13.82 and 7.85 ×10⁻⁵ ml O₂ ml⁻¹ s⁻¹). Absolute values scale with the exercise intensity, and the ratios stay fixed.</p></div>
          </div>
          <div class="ox-opt">
            <div class="ox-optlab"><span class="ox-label" id="ox-kinlab">Oxygen consumption</span><button type="button" class="ox-info" aria-expanded="false" aria-controls="ox-i-kin" aria-label="About oxygen consumption">i</button></div>
            <div class="ox-seg" role="group" aria-labelledby="ox-kinlab" id="ox-kinseg">
            <button type="button" data-v="mm" aria-pressed="false">Michaelis–Menten</button>
            <button type="button" data-v="zero" aria-pressed="true">Constant</button>
            </div>
            <div class="ox-infotext" id="ox-i-kin" hidden><p><strong>Michaelis–Menten</strong> consumption slows as PO₂ approaches zero.</p><p><strong>Constant</strong> consumption continues at the full rate until oxygen runs out, so anoxic regions can form.</p></div>
          </div>
          </div>
        </details>
        <details class="ox-grp" id="ox-g-transport">
          <summary><span class="ox-gtitle">Transport in fibres</span><span class="ox-gsum" data-for="mbseg"></span></summary>
          <div class="ox-gbody">
          <div class="ox-opt">
            <div class="ox-optlab"><span class="ox-label" id="ox-mblab">Myoglobin-facilitated diffusion</span><button type="button" class="ox-info" aria-expanded="false" aria-controls="ox-i-mb" aria-label="About myoglobin-facilitated diffusion">i</button></div>
            <div class="ox-seg" role="group" aria-labelledby="ox-mblab" id="ox-mbseg">
            <button type="button" data-v="0" aria-pressed="true">Off</button>
            <button type="button" data-v="1" aria-pressed="false">Published values</button>
            <button type="button" data-v="2" aria-pressed="false">Doubled</button>
            <button type="button" data-v="3" aria-pressed="false">Tripled</button>
            </div>
            <div class="ox-infotext" id="ox-i-mb" hidden><p>Oxygen bound to myoglobin also diffuses inside the fibres, which matters most at low PO₂.</p><p>Myoglobin content by fibre type follows Al-Shammari et al. (2014); type I fibres carry the most.</p><p><em>Doubled</em> and <em>Tripled</em> multiply every fibre type's myoglobin content by 2 or 3.</p></div>
          </div>
          </div>
        </details>
        <details class="ox-grp" id="ox-g-tissue">
          <summary><span class="ox-gtitle">Tissue</span><span class="ox-gsum" data-for="shapeseg,brushseg"></span></summary>
          <div class="ox-gbody">
          <div class="ox-opt">
            <div class="ox-optlab"><span class="ox-label" id="ox-shapelab">Fibre shape</span><button type="button" class="ox-info" aria-expanded="false" aria-controls="ox-i-shape" aria-label="About fibre shape">i</button></div>
            <div class="ox-seg" role="group" aria-labelledby="ox-shapelab" id="ox-shapeseg">
            <button type="button" data-v="polygon" aria-pressed="true">Polygons</button>
            <button type="button" data-v="realistic" aria-pressed="false">Realistic</button>
            </div>
            <div class="ox-infotext" id="ox-i-shape" hidden><p>Realistic fibres have rounded corners that leave pockets where fibres meet, gently curved edges, sizes that differ by type (type II larger), a slight oblique stretch and endomysium of varying thickness.</p><p>Switching keeps the same tissue and the baseline, so <em>Change</em> shows the effect of shape alone.</p></div>
          </div>
          <div class="ox-opt">
            <div class="ox-optlab"><span class="ox-label" id="ox-brushlab">Tap a fibre to make it</span><button type="button" class="ox-info" aria-expanded="false" aria-controls="ox-i-brush" aria-label="About changing fibre type">i</button></div>
            <div class="ox-seg" role="group" aria-labelledby="ox-brushlab" id="ox-brushseg"></div>
            <div class="ox-infotext" id="ox-i-brush" hidden><p>Choose a type, then tap fibres in the section to change them. Type I fibres use the most oxygen and carry the most myoglobin; type IIX the least.</p><p>Demand per type is fixed when a tissue is generated, so retyping a fibre changes the tissue's total demand.</p></div>
          </div>
          </div>
        </details>
      </div>
    </div>
    <aside class="ox-panel">
      <div class="ox-card">
        <div class="ox-cardhead"><h3 class="ox-ch">Predicted fibre oxygenation</h3><button type="button" class="ox-info" aria-expanded="false" aria-controls="ox-i-oxy" aria-label="About these readouts">i</button></div>
        <div class="ox-infotext" id="ox-i-oxy" hidden><p><em>Demand met</em> is total uptake divided by total demand. The means by fibre type are averages over all fibre area of each type, so they show oxygen shifting between types even when the tissue-wide mean barely changes. Bars show the share of fibre area in each 2 mmHg band; the outline shows the baseline.</p></div>
        <div class="ox-metrics">
          <div class="ox-metric"><span class="ox-label">Mean fibre PO₂</span><span class="ox-v" id="ox-m-mean">–</span><span class="ox-d" id="ox-d-mean"></span></div>
          <div class="ox-metric"><span class="ox-label" id="ox-lowlab">Fibre area below 0.5 mmHg</span><span class="ox-v" id="ox-m-low">–</span><span class="ox-d" id="ox-d-low"></span></div>
          <div class="ox-metric"><span class="ox-label">Lowest fibre PO₂</span><span class="ox-v" id="ox-m-min">–</span><span class="ox-d" id="ox-d-min"></span></div>
          <div class="ox-metric"><span class="ox-label">Demand met</span><span class="ox-v" id="ox-m-met">–</span><span class="ox-d" id="ox-d-met"></span></div>
        </div>
        <div class="ox-bytype"><span class="ox-label">Mean PO₂ by fibre type (mmHg)</span><div class="ox-tms" id="ox-bytype"></div></div>
        <div class="ox-hist-box" id="ox-histbox">
          <svg id="ox-hist" viewBox="0 0 340 170" role="img" aria-label="Distribution of fibre area by PO₂"></svg>
          <div class="ox-tip" id="ox-tip" hidden></div>
        </div>
        <div class="ox-exprow"><button type="button" class="ox-btn ox-btn-sm" id="ox-exp-hist">Export PDF</button></div>
      </div>
      <div class="ox-card">
        <div class="ox-cardhead"><h3 class="ox-ch">Capillary geometry</h3><button type="button" class="ox-info" aria-expanded="false" aria-controls="ox-i-geom" aria-label="About capillary geometry">i</button></div>
        <div class="ox-infotext" id="ox-i-geom" hidden><p>These are descriptors of capillary geometry. Moving a capillary leaves all of them unchanged, while the predicted PO₂ map changes. Shutting capillaries lowers only the perfused values; the anatomical counts stay the same.</p><p>Fibres are counted with an unbiased counting frame: a fibre counts if it lies inside the section or touches only the top or right edge (dashed green), and is excluded if it touches the left or bottom edge (solid red). This keeps the count independent of where the section edges cut the tissue. All fibres still take part in the oxygen calculation.</p></div>
        <dl class="ox-geom">
          <dt>Capillaries</dt><dd id="ox-g-n">–</dd>
          <dt>Fibres</dt><dd id="ox-g-f">–</dd>
          <dt>Capillary-to-fibre ratio</dt><dd id="ox-g-cf">–</dd>
          <dt>Capillary density</dt><dd id="ox-g-cd">–</dd>
          <dt>Perfused capillaries</dt><dd id="ox-g-np">–</dd>
          <dt>Perfused capillary-to-fibre ratio</dt><dd id="ox-g-cfp">–</dd>
          <dt>Perfused capillary density</dt><dd id="ox-g-cdp">–</dd>
        </dl>
      </div>
    </aside>
  </div>
</div>

## Things to try

1. Find a fibre with a dark core and drag a nearby capillary toward it. Watch how far the change spreads, including in the fibres the capillary left.
2. Press _Set as baseline_, then move capillaries without changing how many there are. Capillary density and the capillary-to-fibre ratio stay the same, while the predicted PO₂ map and the low-PO₂ area change.
3. Raise the exercise intensity to _Intense_ and shut 20% of the capillaries. The anatomical capillary-to-fibre ratio is unchanged, but hypoxic regions appear around the shut ones. Tap individual capillaries to see which ones matter most.
4. Tap a type I fibre to make it type IIX. Its demand falls, so its PO₂ rises, and neighbours sharing the same capillaries can gain too. Watch the mean PO₂ by fibre type.
5. Switch from _Polygons_ to _Realistic_ fibres with a baseline set, and compare the means by fibre type: the tissue-wide mean barely moves, but oxygen shifts between fibre types.
6. At intense exercise, compare fixed capillary PO₂ (Dirichlet) with a capillary wall that resists oxygen exchange (Robin), and switch myoglobin on to see where it helps most.

## How it is computed

Oxygen diffuses from the capillaries and is consumed in the fibres. At steady state the PO₂, $$P$$, satisfies a reaction–diffusion PDE:

$$
\nabla\cdot\left[\,D\alpha\,\nabla P + D_{Mb}C_{Mb}\,\nabla S\,\right] = M\,\frac{P}{P + P_m}, \qquad S = \frac{P}{P + P_{50,Mb}},
$$

where the second term on the left, diffusion of oxygen bound to myoglobin, is included only when myoglobin is switched on. Myoglobin is assumed to be in local equilibrium with dissolved oxygen, with saturation $$S$$. Consumption and myoglobin are confined to the fibres. Constant consumption is approximated by a very small $$P_m$$.

On each perfused capillary wall, either the PO₂ is fixed (Dirichlet), $$P = P_{cap}$$, or oxygen crosses the wall at a rate set by its mass transfer coefficient (Robin), $$-\mathbf{n}\cdot D\alpha\nabla P = k\,(P_{cap} - P)$$. The outer edge of the section is a no-flux boundary, $$\mathbf{n}\cdot\nabla P = 0$$, as for a cut section, and fibres cut by the edge are treated as separate pieces. Myoglobin moves only within fibres.

Demand is set so that the volume average over the whole section at rest equals the published $$M_0$$, keeping the published ratios between fibre types, and is then multiplied by the exercise intensity factor. The rates are fixed when a tissue is generated, so retyping a fibre changes the tissue's total demand. _Demand met_ is the fibres' total uptake as a share of what they would consume at the full rate.

The equation is solved by finite volumes with nonlinear multigrid. The capillary condition is imposed on each capillary's true circular wall: grid lines that cross a wall use the exact distance to it, and with a Robin wall the wall PO₂ seen by each neighbouring cell follows the logarithmic profile around a capillary. While you drag a capillary the model is solved on a 2 µm grid; as soon as you let go it is refined on a 1 µm grid, which the readouts, the baseline and PDF exports use. In tests against 0.25–0.5 µm reference solutions, the 1 µm result was within 0.01 mmHg of mean fibre PO₂ with a Dirichlet wall and within about 0.07 mmHg with a Robin wall.

Fibres are counted with an unbiased counting frame: a fibre counts if it lies inside the section or touches only the top or right edge, and not if it touches the left or bottom edge.

<table class="ox-params">
  <tr><td>Section width · grids</td><td>384 µm · 2 µm while editing, 1 µm after</td></tr>
  <tr><td>Capillary radius · maximum capillary PO₂</td><td>2.5 µm · 40 mmHg</td></tr>
  <tr><td>Tissue-average demand at rest, \(M_0\)</td><td>15.7 × 10⁻⁵ ml O₂ ml⁻¹ s⁻¹</td></tr>
  <tr><td>Demand relative to type I: type IIA · IIX</td><td>0.88 · 0.50</td></tr>
  <tr><td>Intensity factor: rest · low · moderate · intense</td><td>1 · 3 · 6 · 12</td></tr>
  <tr><td>PO₂ at half demand, \(P_m\): Michaelis–Menten · constant</td><td>0.5 · 0.02 mmHg</td></tr>
  <tr><td>O₂ diffusivity \(D\) · solubility \(\alpha\)</td><td>2.41 × 10⁻⁵ cm² s⁻¹ · 3.89 × 10⁻⁵ ml O₂ ml⁻¹ mmHg⁻¹</td></tr>
  <tr><td>Capillary wall mass transfer coefficient, \(k\)</td><td>4.0 × 10⁻⁶ ml O₂ cm⁻² mmHg⁻¹ s⁻¹</td></tr>
  <tr><td>Myoglobin diffusivity \(D_{Mb}\)</td><td>1.73 × 10⁻⁷ cm² s⁻¹</td></tr>
  <tr><td>Myoglobin content \(C_{Mb}\): type I · IIA · IIX</td><td>10.2 · 4.98 · 1.55 × 10⁻³ ml O₂ ml⁻¹</td></tr>
  <tr><td>Myoglobin half-saturation PO₂, \(P_{50,Mb}\)</td><td>5.3 mmHg</td></tr>
</table>

Parameter values are from [Al-Shammari, Gaffney & Egginton, 2014]({{ '/publications/' | relative_url }}#capillary%20domains%20revisited) (Table II). Polygon fibres are a relaxed Voronoi tessellation. Realistic fibres start from the same tessellation, reweighted by fibre type, stretched slightly, warped by a smooth field and given rounded corners of radius 6 µm, with about 2 µm of endomysium between fibres. Capillaries start where fibres meet, about 1.6 per fibre.

## What the model leaves out

- The section is two-dimensional: oxygen moves only within the cross-section, not along the fibres or capillaries.
- Capillary PO₂ is set directly rather than computed from blood flow and the unloading of haemoglobin.
- Myoglobin is assumed to be in equilibrium with dissolved oxygen everywhere, which cannot hold very close to the fibre boundary.
- The tissue is synthetic and not fitted to a real section.
- With a Robin wall, the wall PO₂ seen by each grid cell is taken from the logarithmic profile around a capillary, so variation around the circumference within one grid cell is ignored.

<div class="cp-further" id="going-further">
  <span class="cp-meta">Capillary supply · Heterogeneity · Optional</span>
  <h3>Which measures of capillary supply predict fibre oxygenation?</h3>
  <p class="cp-label">Read</p>
  <p>Our image-based models solve for oxygen transport in real muscle sections and compare indices of capillary supply with the predicted fibre PO₂, to ask which are descriptors of capillary geometry and which are transport-relevant measures that predict fibre oxygenation: <a href="{{ '/publications/' | relative_url }}#integrated%20method%20for%20quantitative%20morphometry">Integrated method for quantitative morphometry and oxygen transport modelling in striated muscle</a> (<em>J Appl Physiol</em>, 2019).</p>
  <p class="cp-label">Try</p>
  <p>Set a baseline, then rearrange capillaries without adding or removing any. Which readouts change, and which stay fixed? Then shut a fifth of the capillaries and compare the anatomical and perfused capillary-to-fibre ratios with the change in low-PO₂ area.</p>
  <p class="cp-label">Where it leads</p>
  <p>Heterogeneity, when variation beyond averages changes how a system behaves, runs through my research; see the <a href="{{ '/research/' | relative_url }}#how-does-the-arrangement-of-capillaries-influence-oxygen-supply-to-muscle">oxygen transport theme</a> on the research page. If you would like to take questions like this further, see <a href="{{ '/group/' | relative_url }}#joining">Joining</a> on the group page.</p>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" defer></script>
<script src="{{ '/assets/js/tools/oxygen-explorer.js' | relative_url }}" defer></script>
