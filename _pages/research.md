---
layout: page
title: research
permalink: /research/
description: Structure–function relationships across biological scales.
nav: true
nav_order: 1
images:
  compare: true
---

<div class="row mt-3">
  <div class="col-sm">
    {% include figure.liquid path="assets/img/research/oxygen-streamlines.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Blue oxygen flux streamlines running from capillaries, drawn as red dots, into surrounding muscle fibres, shown against red Voronoi polygons." %}
  </div>
</div>
<div class="caption">
  Oxygen flux streamlines (blue) from each capillary (red dots) into the surrounding muscle fibres, compared with the Voronoi polygons (red) often used to approximate each capillary's supply region. Preliminary work related to our study of capillary domains in mixed muscles (<a href="https://doi.org/10.1016/j.jtbi.2014.04.016"><em>J Theor Biol</em> 2014</a>).
</div>

My research investigates **structure–function relationships** in biological systems, with particular emphasis on how **heterogeneity** influences system behaviour across biological scales: from the arrangement of capillaries among muscle fibres, to differences between groups within a population during an epidemic, to the way genotypes map onto phenotypes. I use differential equations, dynamical systems and image-based computation, and work closely with physiologists, clinicians and fellow mathematicians.

## How does the arrangement of capillaries influence oxygen supply to muscle?

Physiologists often summarise a muscle's blood supply with anatomical indices such as capillary density, capillary-to-fibre ratio or capillary domains. We build image-based models that solve for oxygen diffusion in real tissue sections, and compare their predictions with these indices to ask how well each index reflects the tissue's capacity for oxygen supply.

<div class="row mt-3">
  <div class="col-sm">
    <img-comparison-slider class="rounded z-depth-1">
      {% include figure.liquid path="assets/img/research/oxygen-histology.jpg" class="img-fluid" slot="first" alt="Stained cross-section of skeletal muscle showing fibre types in yellow, green and black, outlined by blue capillary and membrane staining." %}
      {% include figure.liquid path="assets/img/research/oxygen-model-po2.jpg" class="img-fluid" slot="second" alt="Predicted oxygen partial pressure across the same muscle section, red where it is higher near capillaries and blue where it is lower." %}
    </img-comparison-slider>
  </div>
</div>
<div class="caption">
  Drag the handle to compare a stained cross-section of skeletal muscle (left) with the oxygen partial pressure (PO<sub>2</sub>) predicted by our image-based model for the same section (right). Fibre types are stained yellow (type I), green (type IIa) and black (type IIb); in the model, red marks higher PO<sub>2</sub> and blue lower. Predictions assume maximal vascular capacity. From <a href="https://doi.org/10.1152/japplphysiol.00170.2018">Al-Shammari et al., <em>J Appl Physiol</em> 2019</a>.
</div>

<div class="row mt-4">
  <div class="col-md-7" markdown="1">

**What the models indicate:**

- Area-based measures of capillary supply were the most sensitive to variation in predicted fibre PO<sub>2</sub>.
- Only area-based measures captured the plateau and nonlinearity in predicted fibre PO<sub>2</sub>.

**Methods:** reaction–diffusion PDEs on image-derived geometries; finite element methods; Green's functions and conformal mapping for diffusion in polygonal domains.

**Selected work:** {% cite alshammari2012voronoi alshammari2014domains alshammari2019integrated alshammari2025utility kissane2026capillary %}

  </div>
  <div class="col-md-5 mt-3 mt-md-0">
    {% include figure.liquid path="assets/img/research/oxygen-graphical-abstract.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Graphical abstract: computational modelling of fibre PO2 and morphometric measurements from the same muscle images are combined; a bar chart ranks local capillary indices by relative importance, and curves show fibre PO2 levelling off below the capillary PO2 ceiling." %}
    <div class="caption">
      Graphical abstract. From <a href="https://doi.org/10.1113/JP288043">Al-Shammari et al., <em>J Physiol</em> 2025</a>.
    </div>
  </div>
</div>

## How do population heterogeneity and interventions influence epidemic dynamics?

<div class="row">
  <div class="col-md-6" markdown="1">

I model infectious-disease transmission in populations made up of groups that differ in socioeconomic status and living conditions, and use these models to assess the effect of public-health measures.

During the first wave of COVID-19, a preprint of this work informed the Kuwaiti government's response, including scaling up healthcare capacity, the partial and full curfews, and the staged plan for reopening. It was later published in [_Frontiers in Public Health_](https://doi.org/10.3389/fpubh.2021.757419).

**Selected work:** {% cite alshammari2021strict khadadah2021npi %}

  </div>
  <div class="col-md-6 mt-3 mt-md-0">
    {% include figure.liquid path="assets/img/research/covid-kuwait-p2.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Daily COVID-19 incidence in population group P2 in Kuwait, March to July 2020, with a model trajectory and band, and vertical lines marking the partial curfew, the repatriation of over 40,000 citizens and the full curfew." %}
    <div class="caption">
      Daily cases in P<sub>2</sub>, a subgroup of non-skilled migrant workers living in crowded conditions who led the first wave (dots), with the model trajectory (dashed line and band). The dates of the partial curfew, the repatriation of more than 40,000 citizens and the full curfew are overlaid for reference. From <a href="https://doi.org/10.1186/s12889-021-10984-6">Khadadah et al., <em>BMC Public Health</em> 2021</a>.
    </div>
  </div>
</div>

<div class="row mt-4">
  <div class="col-md-5 order-2 order-md-1 mt-3 mt-md-0">
    {% include figure.liquid path="assets/img/research/multistrain-t95.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Heat map from thesis results on competing strains, coloured by T95." %}
    <div class="caption">
      From the thesis results. Full details will follow with the paper.
    </div>
  </div>
  <div class="col-md-7 order-1 order-md-2" markdown="1">

### Competing strains

A second strand looks at **multistrain diseases**: the nonlinear dynamics of competing strains and the conditions under which a new strain can invade. This was the subject of Abir Aljassar's graduate thesis, and a paper based on it is in preparation.

  </div>
</div>

## What do nonlinear relationships in clinical data reveal about risk?

With clinical collaborators, including at the Dasman Diabetes Institute, we analyse patient data to identify where standard linear assumptions break down, and develop clinical risk scores.

<div class="row justify-content-center mt-3">
  <div class="col-md-10">
    {% include figure.liquid path="assets/img/research/glucose-icu-risk.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Curve of the log odds of ICU admission against fasting blood glucose, rising steeply at lower values and flattening at higher values, with a shaded confidence band." %}
  </div>
</div>
<div class="caption">
  In the study cohort of COVID-19 patients, the estimated log-odds of ICU admission rise steeply with fasting blood glucose and then level off at higher values, a pattern a linear model would not capture. From <a href="https://doi.org/10.2337/dc20-1941">Alahmad et al., <em>Diabetes Care</em> 2020</a>.
</div>

**Selected work:** {% cite alahmad2020fasting ali2021advancing alhamar2022development %}

## How do genotype changes influence the complexity of phenotypes?

Genotype–phenotype maps describe how genetic sequences give rise to biological traits and shapes. In collaboration with colleagues at Gulf University for Science and Technology (Kuwait) and the University of Oxford (UK), we use ideas from algorithmic information theory to investigate how changes to genotype may influence the complexity of phenotype shapes.

**Funding:** Kuwait Foundation for the Advancement of Sciences (KFAS).

See all [publications]({{ '/publications/' | relative_url }}).
