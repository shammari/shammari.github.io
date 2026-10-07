---
layout: page
title: research
permalink: /research/
description: Structure–function relationships across biological scales.
nav: true
nav_order: 1
---

My research investigates **structure–function relationships** in biological systems, with particular emphasis on how **heterogeneity** influences system behaviour across biological scales: from the arrangement of capillaries among muscle fibres, to differences between groups within a population during an epidemic, to the way genotypes map onto phenotypes. I use differential equations, dynamical systems and image-based computation, and work closely with physiologists, clinicians and fellow mathematicians.

## How does the arrangement of capillaries influence oxygen supply to muscle?

Physiologists often summarise a muscle's blood supply with anatomical indices such as capillary density, capillary-to-fibre ratio or capillary domains. We build image-based models that solve for oxygen diffusion in real tissue sections, and compare their predictions with these indices to ask how well each index reflects the tissue's capacity for oxygen supply.

**What the models indicate:**

- Area-based measures of capillary supply were the most sensitive to variation in predicted fibre PO<sub>2</sub>.
- Only area-based measures captured the plateau and nonlinearity in predicted fibre PO<sub>2</sub>.

**Methods:** reaction–diffusion PDEs on image-derived geometries; finite element methods; Green's functions and conformal mapping for diffusion in polygonal domains.

**Selected work:** {% cite alshammari2012voronoi alshammari2014domains alshammari2019integrated alshammari2025utility kissane2026capillary %}

## How do population heterogeneity and interventions influence epidemic dynamics?

I model infectious-disease transmission in populations made up of groups that differ in socioeconomic status and living conditions, and use these models to assess the effect of public-health measures. During the first wave of COVID-19, a preprint of this work informed the Kuwaiti government's response, including scaling up healthcare capacity, the partial and full curfews, and the staged plan for reopening. It was later published in _Frontiers in Public Health_.

**Selected work:** {% cite alshammari2021strict khadadah2021npi %}

A second strand looks at **multistrain diseases**: the nonlinear dynamics of competing strains and the conditions under which a new strain can invade. This was the subject of Abir Aljassar's graduate thesis, and a paper based on it is in preparation.

## What do nonlinear relationships in clinical data reveal about risk?

With clinical collaborators, including at the Dasman Diabetes Institute, we analyse patient data to identify where standard linear assumptions break down, and develop clinical risk scores.

**Selected work:** {% cite alahmad2020fasting ali2021advancing alhamar2022development %}

## How do genotype changes influence the complexity of phenotypes?

Genotype–phenotype maps describe how genetic sequences give rise to biological traits and shapes. In collaboration with colleagues at Gulf University for Science and Technology (Kuwait) and the University of Oxford (UK), we use ideas from algorithmic information theory to investigate how changes to genotype may influence the complexity of phenotype shapes.

**Funding:** Kuwait Foundation for the Advancement of Sciences (KFAS).

See all [publications]({{ '/publications/' | relative_url }}).
