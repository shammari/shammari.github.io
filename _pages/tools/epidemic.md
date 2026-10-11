---
layout: page
title: Epidemic dashboard
description: Explore how an epidemic unfolds under simple compartmental models. Illustrative models, not forecasts; everything runs in your browser.
permalink: /tools/epidemic/
---

<style>
  .ed-root {
    --ed-panel: color-mix(in srgb, var(--global-text-color) 3.5%, var(--global-bg-color));
    --ed-panel-2: var(--global-bg-color);
    --ed-line: var(--global-divider-color);
    --ed-fg: var(--global-text-color);
    --ed-muted: var(--global-text-color-light);
    --ed-accent: var(--global-theme-color);
    --ed-accent-soft: color-mix(in srgb, var(--global-theme-color) 12%, transparent);
    --ed-accent-ink: #ffffff;
    --ed-grid: color-mix(in srgb, var(--global-text-color) 8%, var(--global-bg-color));
    --ed-c-s: #2f6cb3;
    --ed-c-e: #b57d0c;
    --ed-c-i: #c43d36;
    --ed-c-r: #2e8754;
    --ed-c-g1: #4f5bc4;
    --ed-c-g2: #d0661a;
    --ed-c-ref: #8a8292;
    container-type: inline-size;
    margin: 1rem 0 2rem;
    color: var(--ed-fg);
  }
  html[data-theme="dark"] .ed-root {
    --ed-c-s: #6ea2e4;
    --ed-c-e: #e1b04e;
    --ed-c-i: #ef7b70;
    --ed-c-r: #5fc28b;
    --ed-c-g1: #8f98ee;
    --ed-c-g2: #f3a35c;
    --ed-c-ref: #8f8996;
  }
  .ed-root button { font: inherit; color: inherit; }
  .ed-root :focus-visible { outline: 2px solid var(--ed-accent); outline-offset: 2px; }

  /* Phone: one column, the chart stays in view while the settings scroll beneath it.
     Wide: settings in a sticky left panel, outputs on the right. */
  .ed-dash { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr); grid-template-areas: "models" "diagram" "summary" "chart" "controls"; }
  .ed-side { display: contents; }
  .ed-a-models { grid-area: models; }
  .ed-a-diagram { grid-area: diagram; }
  .ed-a-summary { grid-area: summary; }
  .ed-a-chart { grid-area: chart; }
  .ed-a-controls { grid-area: controls; }
  @container (min-width: 820px) {
    .ed-dash { grid-template-columns: 300px minmax(0, 1fr); column-gap: 20px; grid-template-areas: "side summary" "side chart" "side diagram"; grid-template-rows: auto auto 1fr; }
    .ed-side { display: grid; gap: 12px; grid-area: side; align-self: start; position: sticky; top: 69px; max-height: calc(100vh - 81px); overflow-y: auto; overscroll-behavior: contain; padding-right: 2px; scrollbar-width: thin; }
    .ed-side > * { grid-area: auto; }
    .ed-a-diagram { align-self: start; }
    .ed-a-chart { position: static !important; box-shadow: none !important; }
    .ed-lbl { width: 100% !important; }
    .ed-chip { padding: 6px 11px !important; }
  }
  .ed-panel { background: var(--ed-panel); border: 1px solid var(--ed-line); border-radius: 10px; padding: 14px; min-width: 0; }

  .ed-models { display: grid; gap: 8px; }
  .ed-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
  .ed-lbl, .ed-h { font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ed-muted); font-weight: 500; }
  .ed-lbl { width: 88px; flex: none; }
  .ed-h { margin: 0 0 6px; }
  .ed-chip { border: 1px solid var(--ed-line); background: var(--ed-panel-2); border-radius: 999px; padding: 7px 14px; cursor: pointer; font-weight: 500; font-size: 0.875rem; line-height: 1.3; }
  .ed-chip:hover { border-color: var(--ed-accent); }
  .ed-chip[aria-pressed="true"] { background: var(--ed-accent); border-color: var(--ed-accent); color: var(--ed-accent-ink); }
  .ed-chip.ed-sm { padding: 5px 11px; font-size: 0.8125rem; font-weight: 400; }

  #ed-diagram svg { display: block; width: 100%; height: auto; overflow: visible; }
  #ed-diagram .ed-hit { cursor: pointer; }
  #ed-diagram .ed-hit:hover .ed-arw, #ed-diagram .ed-hit:focus-visible .ed-arw { stroke: var(--ed-accent); }
  #ed-diagram .ed-hit:hover .ed-ahd, #ed-diagram .ed-hit:focus-visible .ed-ahd { fill: var(--ed-accent); }
  #ed-diagram .ed-hit:hover text, #ed-diagram .ed-hit:focus-visible text { fill: var(--ed-accent); }
  #ed-diagram .ed-hit:focus { outline: none; }
  .ed-desc { color: var(--ed-muted); font-size: 0.875rem; margin: 8px 0 0; }
  .ed-tap { color: var(--ed-muted); font-size: 0.75rem; margin: 2px 0 0; }

  .ed-readout { font-size: 1rem; margin: 4px 0 12px; min-height: 3em; }
  .ed-readout b { font-weight: 500; }
  .ed-cards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  @container (min-width: 600px) { .ed-cards { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
  .ed-card { background: var(--ed-panel-2); border: 1px solid var(--ed-line); border-radius: 8px; padding: 9px 11px; min-width: 0; }
  .ed-k, .ed-s { font-size: 0.75rem; color: var(--ed-muted); }
  .ed-v { font-weight: 500; font-size: 1.25rem; font-variant-numeric: tabular-nums; line-height: 1.3; overflow-wrap: anywhere; }

  .ed-a-chart { position: sticky; top: 57px; z-index: 4; align-self: start; box-shadow: 0 6px 18px -14px rgba(0, 0, 0, 0.35); }
  .ed-bar { display: flex; flex-wrap: wrap; gap: 8px 12px; align-items: center; justify-content: space-between; margin-bottom: 6px; }
  .ed-tabs { display: flex; gap: 2px; border-bottom: 1px solid var(--ed-line); min-width: 0; overflow-x: auto; }
  .ed-tab { background: none; border: none; border-bottom: 2px solid transparent; padding: 6px 10px; cursor: pointer; color: var(--ed-muted); font-weight: 500; font-size: 0.875rem; white-space: nowrap; }
  .ed-tab[aria-selected="true"] { color: var(--ed-fg); border-bottom-color: var(--ed-accent); }
  .ed-opts { display: flex; gap: 10px; align-items: center; font-size: 0.8125rem; }
  .ed-seg { display: inline-flex; border: 1px solid var(--ed-line); border-radius: 8px; overflow: hidden; background: var(--ed-panel-2); }
  .ed-seg button { border: none; background: none; padding: 4px 10px; cursor: pointer; font-size: 0.8125rem; color: var(--ed-muted); }
  .ed-seg button[aria-pressed="true"] { background: var(--ed-accent-soft); color: var(--ed-fg); font-weight: 500; }
  .ed-seg.ed-big button { padding: 6px 12px; font-size: 0.875rem; }
  .ed-check { display: inline-flex; align-items: center; gap: 5px; cursor: pointer; color: var(--ed-muted); margin: 0; }
  .ed-check input { accent-color: var(--ed-accent); margin: 0; }
  #ed-chart { position: relative; touch-action: pan-y; }
  #ed-chart svg { display: block; width: 100%; height: auto; user-select: none; -webkit-user-select: none; }
  .ed-legend { display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: 0.8125rem; margin-top: 4px; align-items: baseline; }
  .ed-day { font-weight: 500; color: var(--ed-fg); margin-right: 2px; font-variant-numeric: tabular-nums; }
  .ed-it { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; color: var(--ed-muted); }
  .ed-sw { width: 14px; height: 0; border-top: 3px solid; display: inline-block; }
  .ed-sw.ed-sw-dash { border-top-style: dashed; border-top-width: 2px; }
  .ed-sw.ed-sw-dot { border-top-style: dotted; border-top-width: 3px; }
  .ed-val { color: var(--ed-fg); font-variant-numeric: tabular-nums; }
  .ed-hint { font-size: 0.75rem; color: var(--ed-muted); margin: 2px 0 0; }

  .ed-controls { display: grid; gap: 16px; }
  .ed-presets { display: flex; flex-wrap: wrap; gap: 6px; }
  .ed-ctl { padding: 6px 8px; margin: 0 -8px; border-radius: 8px; transition: background 0.4s; }
  .ed-ctl + .ed-ctl { margin-top: 2px; }
  .ed-ctl.ed-flash { background: var(--ed-accent-soft); }
  .ed-ctl-head { display: flex; align-items: center; gap: 6px; }
  .ed-ctl-head label, .ed-ctl-head .ed-lab { flex: 1; min-width: 0; font-size: 0.875rem; margin: 0; }
  .ed-ctl-head output { font-size: 0.8125rem; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .ed-info { width: 20px; height: 20px; border-radius: 50%; border: 1px solid var(--ed-line); background: var(--ed-panel-2); font-size: 0.75rem; line-height: 1; cursor: pointer; color: var(--ed-muted) !important; flex: none; font-style: italic !important; font-family: Georgia, serif !important; padding: 0; }
  .ed-info[aria-expanded="true"] { border-color: var(--ed-accent); color: var(--ed-accent) !important; }
  .ed-help { font-size: 0.8125rem; color: var(--ed-muted); margin: 4px 0 2px; }
  .ed-root input[type="range"] { width: 100%; accent-color: var(--ed-accent); margin: 4px 0 0; height: 24px; display: block; }
  .ed-toggle { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 0.875rem; margin: 0; }
  .ed-toggle input { width: 18px; height: 18px; accent-color: var(--ed-accent); margin: 0; }
  .ed-ctl .ed-seg { margin-top: 6px; }
  .ed-actions { display: flex; flex-wrap: wrap; gap: 8px; }
  .ed-btn { border: 1px solid var(--ed-line); background: var(--ed-panel-2); border-radius: 8px; padding: 6px 12px; cursor: pointer; font-size: 0.875rem; }
  .ed-btn:hover { border-color: var(--ed-accent); }
  .ed-btn.ed-primary { background: var(--ed-accent); border-color: var(--ed-accent); color: var(--ed-accent-ink); font-weight: 500; }
  @media (prefers-reduced-motion: reduce) { .ed-ctl { transition: none; } }

  .cp-further { border: 1px solid var(--global-divider-color); border-left: 3px solid var(--global-theme-color); border-radius: 6px; padding: 1rem 1.2rem 0.4rem; margin: 1rem 0 1.5rem; scroll-margin-top: 5rem; }
  .cp-further h3 { font-size: 1.15rem; margin: 0.3rem 0 0.8rem; }
  .cp-further p, .cp-further li { font-size: 0.95rem; }
  .cp-further .cp-label { font-weight: 600; margin-bottom: 0.3rem; }
  .cp-meta { display: block; font-size: 0.75rem; letter-spacing: 0.04em; text-transform: uppercase; color: var(--global-text-color-light); }
  .cp-further .ed-btn { padding: 2px 9px; font-size: 0.8125rem; }
  mjx-container[display="true"] { overflow-x: auto; overflow-y: hidden; max-width: 100%; }
</style>

[← Tools]({{ '/tools/' | relative_url }})

Change how easily an infection spreads, how long immunity lasts, or add measures and vaccination, and watch the epidemic curves respond. Switch to two groups to see how unequal contacts and mixing change who is infected, and when.

<div class="ed-root">
  <div class="ed-dash">
    <div class="ed-side">
      <div class="ed-a-models ed-models">
        <div class="ed-row" role="group" aria-label="Model">
          <span class="ed-lbl">Model</span>
          <button type="button" class="ed-chip" data-model="SIR" aria-pressed="true">SIR</button>
          <button type="button" class="ed-chip" data-model="SIRS" aria-pressed="false">SIRS</button>
          <button type="button" class="ed-chip" data-model="SEIR" aria-pressed="false">SEIR</button>
          <button type="button" class="ed-chip" data-model="SEIRS" aria-pressed="false">SEIRS</button>
        </div>
        <div class="ed-row">
          <span class="ed-lbl" id="ed-pop-lbl">Population</span>
          <div class="ed-seg ed-big" role="group" aria-labelledby="ed-pop-lbl">
            <button type="button" data-groups="0" aria-pressed="true">One group</button>
            <button type="button" data-groups="1" aria-pressed="false">Two groups</button>
          </div>
        </div>
      </div>
      <section class="ed-a-controls ed-panel ed-controls" aria-label="Settings" id="ed-controls"></section>
    </div>

    <section class="ed-a-diagram ed-panel" aria-label="Model diagram">
      <p class="ed-h">How people move between states</p>
      <div id="ed-diagram"></div>
      <p class="ed-desc" id="ed-model-desc"></p>
      <p class="ed-tap">Tap an arrow to adjust its rate.</p>
    </section>

    <section class="ed-a-summary" aria-label="Summary">
      <p class="ed-h">What happens</p>
      <p class="ed-readout" id="ed-readout" aria-live="polite"></p>
      <div class="ed-cards">
        <div class="ed-card"><div class="ed-k">Peak infectious</div><div class="ed-v" id="c-peak">–</div><div class="ed-s" id="c-peak-s"></div></div>
        <div class="ed-card"><div class="ed-k" id="c-total-k">Infected in total</div><div class="ed-v" id="c-total">–</div><div class="ed-s" id="c-total-s"></div></div>
        <div class="ed-card"><div class="ed-k">R₀</div><div class="ed-v" id="c-r0">–</div><div class="ed-s" id="c-r0-s"></div></div>
        <div class="ed-card"><div class="ed-k">Most new cases in a day</div><div class="ed-v" id="c-new">–</div><div class="ed-s" id="c-new-s"></div></div>
      </div>
    </section>

    <section class="ed-a-chart ed-panel" aria-label="Epidemic curves">
      <div class="ed-bar">
        <div class="ed-tabs" role="tablist" aria-label="Chart">
          <button type="button" class="ed-tab" role="tab" data-tab="comp" aria-selected="true">Compartments</button>
          <button type="button" class="ed-tab" role="tab" data-tab="new" aria-selected="false">Daily cases</button>
          <button type="button" class="ed-tab" role="tab" data-tab="cum" aria-selected="false">Cumulative</button>
        </div>
        <div class="ed-opts">
          <div class="ed-seg" role="group" aria-label="Units">
            <button type="button" data-unit="people" aria-pressed="true">People</button>
            <button type="button" data-unit="pct" aria-pressed="false">%</button>
          </div>
          <label class="ed-check"><input type="checkbox" id="ed-log"> Log</label>
        </div>
      </div>
      <div id="ed-chart" role="img" aria-label="Epidemic curves"></div>
      <div class="ed-legend" id="ed-legend"></div>
      <p class="ed-hint">Hover over or drag across the chart to read any day.</p>
    </section>

  </div>
</div>

## Things to try

1. Raise R₀ from 1.5 to 3. How much earlier and higher is the peak? Does the total number infected grow as fast as the peak does?
2. With R₀ = 2.5, find the share vaccinated at the start that stops the outbreak. Compare it with the herd immunity figure on the R₀ card.
3. Open **Lifting measures early**, press **Keep this run**, then move the end of the measures to day 150. Does the main wave disappear, or does it only move later?
4. Switch from SIR to SEIR with the same R₀. What does the incubation period change: the height of the peak, its timing, or the total infected?
5. In SIRS, shorten immunity from 1 year to 3 months. How do the repeated waves and the long-run level change?
6. With **Two groups**, move the mixing slider from "Freely" to "Very little". Which group carries the outbreak, and what happens to the other? Then switch the first cases to Group 1.

## How it is computed

The population is divided into compartments: susceptible ($$S$$), exposed ($$E$$, infected but not yet infectious), infectious ($$I$$) and recovered ($$R$$, immune). The most general single-group model here, SEIRS, is

$$
\frac{dS}{dt} = -\beta(t)\,\frac{SI}{N} + \omega R, \qquad \frac{dE}{dt} = \beta(t)\,\frac{SI}{N} - \sigma E,
$$

$$
\frac{dI}{dt} = \sigma E - \gamma I, \qquad \frac{dR}{dt} = \gamma I - \omega R,
$$

where $$\gamma$$ is one over the infectious period, $$\sigma$$ is one over the incubation period, $$\omega$$ is one over the duration of immunity and $$\beta = R_0\,\gamma$$. SIR and SIRS leave out $$E$$, so infection moves people straight to $$I$$. SIR and SEIR have lasting immunity ($$\omega = 0$$). During measures, $$\beta(t)$$ is reduced by the chosen percentage. People vaccinated at the start begin in $$R$$; in the waning models their protection fades at the same rate.

**Two groups.** Each group $$i$$ follows the chosen model with its own compartments, and only the force of infection couples the groups. People in Group 2 have $$a_2$$ times as many contacts as people in Group 1 ($$a_1 = 1$$). A share $$m$$ of everyone's contacts is spread across the whole population in proportion to contact activity, and the rest stays within their own group:

$$
\lambda_i = \beta\, a_i \sum_j c_{ij}\,\frac{I_j}{N_j}, \qquad c_{ij} = (1-m)\,\delta_{ij} + m\,\frac{a_j N_j}{a_1 N_1 + a_2 N_2},
$$

and new infections in group $$i$$ occur at rate $$\lambda_i S_i$$. The overall R₀ shown is the largest eigenvalue of the next-generation matrix $$K_{ij} = (\beta/\gamma)\, a_i\, c_{ij}\, N_i/N_j$$. Measures aimed at one group reduce that group's contacts. In the waning models, the long-run level for two groups is found by running the model forward until it settles; for one group it is $$I^*/N = (1 - 1/R_0)\,/\,(1 + \gamma/\sigma + \gamma/\omega)$$.

The equations are solved with a fourth-order Runge–Kutta method using a step of 0.05 days. New cases per day are the infections that occur during each day.

## What the models leave out

- Everyone in a group is assumed to mix at random, and every infected person is equally infectious.
- The population is closed: no births, deaths from other causes, travel or new imported cases.
- The models are deterministic, so small outbreaks never die out by chance as real ones can.
- Behaviour does not change on its own as cases rise; only the measures you set change transmission.

<div class="cp-further" id="going-further">
  <span class="cp-meta">Two groups · Heterogeneity · Optional</span>
  <h3>What happens when one group mixes more intensely than the rest?</h3>
  <p class="cp-label">Read</p>
  <p>Our study of Kuwait's first COVID-19 wave modelled transmission in socioeconomic groups that mixed unevenly. The models indicate that a crowded subgroup of non-skilled migrant workers led the first wave, and that measures had different effects in different groups: <a href="{{ '/publications/' | relative_url }}#different%20socioeconomic%20populations">The effects of non-pharmaceutical interventions on SARS-CoV-2 transmission in different socioeconomic populations in Kuwait</a> (<em>BMC Public Health</em>, 2021).</p>
  <p class="cp-label">Try</p>
  <p>Open the <button type="button" class="ed-btn" id="ed-open-groups">Crowded subgroup</button> scenario. Turn on measures and compare aiming them at everyone with aiming them at Group 2 alone. How freely must the groups mix before targeting one group stops being enough?</p>
  <p class="cp-label">Where it leads</p>
  <p>Heterogeneity, when variation beyond averages changes how a system behaves, runs through my research; see the <a href="{{ '/research/' | relative_url }}#how-do-population-heterogeneity-and-interventions-influence-epidemic-dynamics">epidemic dynamics theme</a> on the research page. If you would like to take questions like this further, see <a href="{{ '/group/' | relative_url }}#joining">Joining</a> on the group page.</p>
</div>

<script src="{{ '/assets/js/tools/epidemic-dashboard.js' | relative_url }}" defer></script>
