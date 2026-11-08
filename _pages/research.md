---
layout: page
title: research
permalink: /research/
description: Structure, heterogeneity and function across biological scales.
nav: true
nav_order: 1
images:
  compare: true
---

<style>
  .rp-frame { position: relative; background: #fff; border: 1px solid var(--global-divider-color); border-radius: 6px; padding: 10px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08); }
  html[data-theme="dark"] .rp-frame { background: #f7f7f8; border-color: #3a3a3f; }
  .rp-frame figure { margin: 0; }
  .rp-frame img { display: block; width: 100%; height: auto; border-radius: 3px; }
  .rp-banner { padding: 0; overflow: hidden; }
  .rp-banner img { border-radius: 0; }
  .rp-cap { font-size: 0.875rem; line-height: 1.55; color: var(--global-text-color-light); text-align: justify; hyphens: auto; margin: 0.6rem 0 1.5rem; }
  .rp-split { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 2rem; align-items: start; margin: 1.5rem 0; }
  .rp-split.rp-text-wide { grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); }
  .rp-split.rp-flip { grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); }
  .rp-split.rp-flip > .rp-fig { order: -1; }
  .rp-split > div > :first-child { margin-top: 0; }
  @media (max-width: 640px) {
    .rp-split, .rp-split.rp-text-wide, .rp-split.rp-flip { grid-template-columns: minmax(0, 1fr); gap: 1rem; }
    .rp-split.rp-flip > .rp-fig { order: 0; }
  }
  .rp-chip { display: inline-block; font-size: 0.75rem; font-weight: 500; letter-spacing: 0.04em; padding: 5px 10px; border-radius: 999px; border: 1px solid var(--global-theme-color); color: var(--global-theme-color); margin-bottom: 0.75rem; }
  .rp-compare img-comparison-slider { display: block; width: 100%; border-radius: 3px; --divider-width: 2px; --divider-color: #fff; --divider-shadow: 0 0 0 1px rgba(0, 0, 0, 0.25); }
  .rp-compare img-comparison-slider:focus-visible { outline: 3px solid var(--global-theme-color); outline-offset: 2px; }
  .rp-knob { width: 38px; height: 38px; border-radius: 50%; background: #fff; box-shadow: 0 1px 6px rgba(0, 0, 0, 0.35); display: flex; align-items: center; justify-content: center; }
  .rp-knob svg { width: 20px; height: 20px; fill: none; stroke: #333; stroke-width: 2; }
  .rp-tag { position: absolute; top: 20px; z-index: 2; font-size: 12px; font-weight: 500; letter-spacing: 0.04em; line-height: 1; padding: 6px 8px; border-radius: 4px; background: rgba(18, 18, 20, 0.72); color: #fff; pointer-events: none; }
  .rp-tag-l { left: 20px; }
  .rp-tag-r { right: 20px; }
  .rp-line > div { padding-left: 7.2rem; text-indent: -7.2rem; }
  .rp-line { font-size: 0.875rem; line-height: 1.55; color: var(--global-text-color-light); margin: 0 0 1rem; }
  .rp-line span { font-size: 0.7rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--global-theme-color); display: inline-block; min-width: 7.2rem; text-indent: 0; }
</style>

<div class="rp-frame rp-banner mt-3">
  {% include figure.liquid path="assets/img/research/oxygen-streamlines.jpg" zoomable=true alt="Blue oxygen flux streamlines running from capillaries, drawn as red dots, into surrounding muscle fibres, shown against red Voronoi polygons." %}
</div>
<p class="rp-cap">
  Oxygen flux streamlines (blue) from each capillary (red dots) into the surrounding muscle fibres, compared with the Voronoi polygons (red) often used to approximate each capillary's supply region. Preliminary work related to our study of capillary domains in mixed muscles (<a href="https://doi.org/10.1016/j.jtbi.2014.04.016"><em>J Theor Biol</em> 2014</a>).
</p>

My research investigates how the organization of a biological system (the arrangement, connectivity and composition of its parts) influences a specific function under specific conditions. I place particular emphasis on **heterogeneity**: which differences in spatial arrangement, or between groups and individuals, change a system's behaviour even when averages are similar, and which does the system tolerate?

I study this across biological scales: genetic sequences and the complexity of the phenotype shapes they give rise to; capillaries and muscle fibres within skeletal muscle; patients within clinical cohorts; and, in epidemics, population groups and competing pathogen strains. In each case we specify the outcome of interest, identify which features of organization might matter, and build mechanistic models detailed enough to test that explanation. Model predictions hold under the assumptions they state, and we compare them with experimental, clinical and epidemiological data where possible.

## How does the arrangement of capillaries influence oxygen supply to muscle?

<div class="rp-line"><div><span>Organization</span>Capillaries (sources) and muscle fibres (sinks): their arrangement, size and fibre type</div><div><span>Outcome</span>The tissue's capacity for oxygen supply</div></div>

Physiologists often summarise a muscle's blood supply with anatomical indices such as capillary density, capillary-to-fibre ratio or capillary domains. We build image-based models that solve for oxygen diffusion in real tissue sections, and use their predictions to ask which indices are only descriptors of capillary geometry and which are transport-relevant measures that predict fibre oxygenation, given the size, arrangement and type of the fibres they supply.

<div class="rp-frame rp-compare mt-3">
  <img-comparison-slider>
    {% include figure.liquid path="assets/img/research/oxygen-histology.jpg" slot="first" alt="Stained cross-section of skeletal muscle showing fibre types in yellow, green and black, outlined by blue capillary and membrane staining." %}
    {% include figure.liquid path="assets/img/research/oxygen-model-po2.jpg" slot="second" alt="Predicted oxygen partial pressure across the same muscle section, red where it is higher near capillaries and blue where it is lower." %}
    <div slot="handle" class="rp-knob" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6" /></svg></div>
  </img-comparison-slider>
  <span class="rp-tag rp-tag-l">Stained tissue</span>
  <span class="rp-tag rp-tag-r">Model PO<sub>2</sub></span>
</div>
<p class="rp-cap">
  Drag the handle to compare a stained cross-section of skeletal muscle with the oxygen partial pressure (PO<sub>2</sub>) predicted by our image-based model for the same section. Fibre types are stained yellow (type I), green (type IIa) and black (type IIb); in the model, red marks higher PO<sub>2</sub> and blue lower. Predictions assume maximal vascular capacity. From <a href="https://doi.org/10.1152/japplphysiol.00170.2018">Al-Shammari et al., <em>J Appl Physiol</em> 2019</a>.
</p>

<div class="rp-split rp-text-wide">
  <div markdown="1">

**What the models indicate:**

- Area-based measures of capillary supply were the most sensitive to variation in predicted fibre PO<sub>2</sub>.
- Only area-based measures captured the plateau and nonlinearity in predicted fibre PO<sub>2</sub>.

**Methods:** reaction–diffusion PDEs on image-derived geometries; finite element methods; Green's functions and conformal mapping for diffusion in polygonal domains.

**Selected work:** [Al-Shammari et al., 2012]({{ '/publications/' | relative_url }}#re-evaluating%20the%20use%20of%20voronoi); [Al-Shammari et al., 2014]({{ '/publications/' | relative_url }}#capillary%20domains%20revisited); [Al-Shammari et al., 2019]({{ '/publications/' | relative_url }}#integrated%20method%20for%20quantitative%20morphometry); [Al-Shammari et al., 2025]({{ '/publications/' | relative_url }}#utility%20of%20local%20capillary%20supply%20indices); [Kissane et al., 2026]({{ '/publications/' | relative_url }}#how%20well%20does%20quantifying)

  </div>
  <div class="rp-fig">
    <div class="rp-frame">
      {% include figure.liquid path="assets/img/research/oxygen-graphical-abstract.jpg" zoomable=true alt="Graphical abstract: computational modelling of fibre PO2 and morphometric measurements from the same muscle images are combined; a bar chart ranks local capillary indices by relative importance, and curves show fibre PO2 levelling off below the capillary PO2 ceiling." %}
    </div>
    <p class="rp-cap">Graphical abstract. From <a href="https://doi.org/10.1113/JP288043">Al-Shammari et al., <em>J Physiol</em> 2025</a>.</p>
  </div>
</div>

## How do population heterogeneity and interventions influence epidemic dynamics?

<div class="rp-line"><div><span>Organization</span>Population groups that differ in living conditions and contact; competing pathogen strains</div><div><span>Outcome</span>Transmission, its response to interventions, and strain invasion</div></div>

<div class="rp-split">
  <div markdown="1">

I model infectious-disease transmission in populations made up of groups that differ in socioeconomic status and living conditions, and use these models to assess the effect of public-health measures.

During the first wave of COVID-19, a preprint of this work informed the Kuwaiti government's response, including scaling up healthcare capacity, the partial and full curfews, and the staged plan for reopening. It was later published in [_Frontiers in Public Health_](https://doi.org/10.3389/fpubh.2021.757419).

**Selected work:** [Al-Shammari et al., 2021]({{ '/publications/' | relative_url }}#impact%20of%20strict%20public%20health%20measures); [Khadadah et al., 2021]({{ '/publications/' | relative_url }}#non-pharmaceutical%20interventions)

  </div>
  <div class="rp-fig">
    <div class="rp-frame">
      {% include figure.liquid path="assets/img/research/covid-kuwait-p2.jpg" zoomable=true alt="Daily COVID-19 incidence in population group P2 in Kuwait, March to July 2020, with a model trajectory and band, and vertical lines marking the partial curfew, the repatriation of over 40,000 citizens and the full curfew." %}
    </div>
    <p class="rp-cap">Daily cases in P<sub>2</sub>, a subgroup of non-skilled migrant workers living in crowded conditions who led the first wave (dots), with the model trajectory (dashed line and band). The dates of the partial curfew, the repatriation of more than 40,000 citizens and the full curfew are overlaid for reference. From <a href="https://doi.org/10.1186/s12889-021-10984-6">Khadadah et al., <em>BMC Public Health</em> 2021</a>.</p>
  </div>
</div>

<div class="rp-split rp-flip">
  <div markdown="1">

<span class="rp-chip">Thesis work · paper in preparation</span>

### Competing strains

A second strand looks at **multistrain diseases**: the nonlinear dynamics of competing strains and the conditions under which a new strain can invade. This was the subject of Abir Aljassar's graduate thesis.

  </div>
  <div class="rp-fig">
    <div class="rp-frame">
      {% include figure.liquid path="assets/img/research/multistrain-t95.jpg" zoomable=true alt="Heat map from thesis results on competing strains, coloured by T95." %}
    </div>
    <p class="rp-cap">From the thesis results. Full details will follow with the paper.</p>
  </div>
</div>

## What do nonlinear relationships in clinical data reveal about risk?

<div class="rp-line"><div><span>Organization</span>Differences among patients in glycaemic state, comorbidities, ethnicity and prior infection</div><div><span>Outcome</span>ICU admission, mortality and antibody response</div></div>

With clinical collaborators, including at the Dasman Diabetes Institute, we study how heterogeneity among patients, in glycaemic state, comorbidities, ethnicity and prior infection, relates to ICU admission, mortality and antibody response after vaccination. Rather than imposing clinical thresholds, we let continuous predictors such as fasting blood glucose take their natural, often nonlinear, shape, and we develop clinical risk scores validated in independent cohorts.

<div class="rp-frame mt-3">
  {% include figure.liquid path="assets/img/research/glucose-icu-risk.jpg" zoomable=true alt="Curve of the log odds of ICU admission against fasting blood glucose, rising steeply at lower values and flattening at higher values, with a shaded confidence band." %}
</div>
<p class="rp-cap">
  In the study cohort of COVID-19 patients, the estimated log-odds of ICU admission rise steeply with fasting blood glucose and then level off at higher values, a pattern a linear model would not capture. From <a href="https://doi.org/10.2337/dc20-1941">Alahmad et al., <em>Diabetes Care</em> 2020</a>.
</p>

**Selected work:** [Alahmad et al., 2020]({{ '/publications/' | relative_url }}#nonlinearity%20matters); [Ali et al., 2021]({{ '/publications/' | relative_url }}#advancing%20risk%20analysis); [Alhamar et al., 2022]({{ '/publications/' | relative_url }}#clinical%20risk%20score%20to%20predict%20death)

## How do genotype changes influence the complexity of phenotypes?

<div class="rp-line"><div><span>Organization</span>How genotypes map onto phenotypes</div><div><span>Outcome</span>The complexity of phenotypes after genotype changes</div></div>

Genotype–phenotype maps describe how genetic sequences give rise to biological traits and shapes. In collaboration with colleagues at Gulf University for Science and Technology (Kuwait) and the University of Oxford (UK), we use ideas from algorithmic information theory to investigate how changes to genotype may influence the complexity of phenotype shapes.

**Funding:** Kuwait Foundation for the Advancement of Sciences (KFAS).

See all [publications]({{ '/publications/' | relative_url }}).
