---
layout: page
permalink: /publications/
title: publications
description: Publications in reverse chronological order.
nav: true
nav_order: 2
---

<!-- _pages/publications.md -->

<style>
  .publications [id] { scroll-margin-top: 90px; }
  .publications [id]:target { outline: 2px solid var(--global-theme-color); outline-offset: 6px; border-radius: 4px; }
</style>

For a complete and up-to-date list, see my [Google Scholar](https://scholar.google.com/citations?user=4hTO4WMAAAAJ&hl=en) or [ORCID](https://orcid.org/0000-0002-4512-1151) profile.

<!-- Bibsearch Feature -->

{% include bib_search.liquid %}

<div class="publications">

{% bibliography %}

</div>
