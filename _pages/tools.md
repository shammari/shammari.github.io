---
layout: page
permalink: /tools/
title: tools
description: Interactive models to explore in your browser.
nav: true
nav_order: 5
---

<style>
  .cp-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr)); gap: 1rem; margin: 1rem 0 1.5rem; }
  .cp-card { display: block; border: 1px solid var(--global-divider-color); border-radius: 6px; padding: 0.9rem 1.1rem; color: var(--global-text-color); transition: border-color 0.15s; }
  .cp-card:hover { border-color: var(--global-theme-color); text-decoration: none; color: var(--global-text-color); }
  .cp-card-title { display: block; font-weight: 500; color: var(--global-theme-color); margin: 0.25rem 0 0.35rem; }
  .cp-card-text { display: block; font-size: 0.9rem; }
  .cp-meta { display: block; font-size: 0.75rem; letter-spacing: 0.04em; text-transform: uppercase; color: var(--global-text-color-light); }
</style>

Small interactive models built on the mathematics behind my research. They run in your browser and need no installation. They are illustrative, not forecasts.

<div class="cp-cards">
  <a class="cp-card" href="{{ '/tools/epidemic/' | relative_url }}">
    <span class="cp-meta">Epidemics · SIR, SIRS, SEIR, SEIRS</span>
    <span class="cp-card-title">Epidemic dashboard</span>
    <span class="cp-card-text">Watch epidemic curves respond as you change how easily an infection spreads, how long immunity lasts, or add measures and vaccination. Split the population into two groups to see how unequal contacts and mixing change who is infected, and when.</span>
  </a>
  <a class="cp-card" href="{{ '/tools/oxygen/' | relative_url }}">
    <span class="cp-meta">Oxygen transport · Skeletal muscle</span>
    <span class="cp-card-title">Muscle oxygen explorer</span>
    <span class="cp-card-text">Move capillaries, shut them down or change fibre types in a cross-section of skeletal muscle, and see the predicted oxygen supply respond. Add myoglobin, raise exercise intensity or make the fibres more realistic.</span>
  </a>
</div>
