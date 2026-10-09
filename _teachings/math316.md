---
layout: course
title: "MATH 316: Elements of Mathematical Modeling"
description: An introduction to building, analysing and interpreting mathematical models.
permalink: /teaching/math316/
course_id: math316
year: 2026
level: Undergraduate
credit_hours: 3
instructor: Abdullah A. Al-Shammari
next_offering: To be announced
# Weekly plan. To add a file, give its path after notes:, slides:, problems: or code:
# (for example  notes: /assets/pdf/teaching/math316/week01-notes.pdf). Empty slots show greyed out.
# explore: is optional. Give a tool's address or the id of a Going further card (for example  #lotka-volterra);
# an Explore link then appears in that week's row.
weeks:
  - week: 1
    topic: The basic idea of mathematical modeling
    details:
    notes:
    slides:
    problems:
    code:
  - week: 2
    topic: Modeling with discrete dynamical systems
    details: Modeling change with difference equations
    notes:
    slides:
    problems:
    code:
    explore: /teaching/math316/tools/logistic-map/
  - week: 3
    topic: Modeling with discrete dynamical systems
    details: Properties of dynamical systems; elements of finance
    notes:
    slides:
    problems:
    code:
    explore: /teaching/math316/tools/logistic-map/
  - week: 4
    topic: Proportionality and geometric similarity
    details: Vehicular stopping distance; free fall of a raindrop; automobile gasoline mileage
    notes:
    slides:
    problems:
    code:
  - week: 5
    topic: Model fitting
    details: Fitting models to data graphically; least-squares and Chebyshev criteria
    notes:
    slides:
    problems:
    code:
    explore: /teaching/math316/tools/fitting/
  - week: 6
    topic: Model fitting
    details: Vehicular stopping distance revisited; least-squares filters
    notes:
    slides:
    problems:
    code:
    explore: /teaching/math316/tools/fitting/
  - week: 7
    topic: Experimental modeling
    details: Finite and divided differences; reliability of data; degree of polynomial fit
    notes:
    slides:
    problems:
    code:
    explore: "#interactive-tools"
  - week: 8
    topic: Experimental modeling
    details: Linear and cubic spline models
    notes:
    slides:
    problems:
    code:
    explore: /teaching/math316/tools/splines/
  - week: 9
    topic: Discrete optimization
    details: An overview of discrete optimization modeling
    notes:
    slides:
    problems:
    code:
  - week: 10
    topic: Discrete optimization
    details: Linear programming and the simplex method
    notes:
    slides:
    problems:
    code:
    explore: /teaching/math316/tools/linear-programming/
  - week: 11
    topic: Modeling with a differential equation
    details: Population dynamics; vehicular stopping distance
    notes:
    slides:
    problems:
    code:
  - week: 12
    topic: Modeling with a differential equation
    details: Graphical solutions of autonomous differential equations
    notes:
    slides:
    problems:
    code:
    explore: /teaching/math316/tools/phase-line/
  - week: 13
    topic: Modeling with systems of differential equations
    details: Autonomous systems; phase-plane trajectories; competitive hunter and Lotka–Volterra predator–prey models
    notes:
    slides:
    problems:
    code:
    explore: "#interactive-tools"
  - week: 14
    topic: Review
    details:
    notes:
    slides:
    problems:
    code:
---

<style>
  .course h2 { font-size: 1.45rem; margin-top: 2.2rem; }
  .cp-todo, .cp-todo li { color: var(--global-text-color-light); font-style: italic; }
  .cp-facts { display: grid; grid-template-columns: max-content 1fr; gap: 0.3rem 1.2rem; margin: 0.5rem 0 1.5rem; padding: 0.9rem 1.1rem; border: 1px solid var(--global-divider-color); border-radius: 6px; font-size: 0.95rem; }
  .cp-facts dt { font-weight: 500; color: var(--global-text-color-light); margin: 0; }
  .cp-facts dd { margin: 0; }
  .cp-table { width: 100%; color: var(--global-text-color); }
  .cp-table th { color: var(--global-text-color); font-weight: 500; }
  .cp-table td, .cp-table th { vertical-align: top; border-color: var(--global-divider-color); }
  .cp-schedule td:first-child { width: 3.5rem; white-space: nowrap; }
  .cp-schedule td:last-child, .cp-schedule th:last-child { width: 19.5rem; }
  .cp-schedule .cp-files { flex-wrap: nowrap; }
  .cp-files.cp-files-inline { display: none; margin-top: 0.35rem; }
  .cp-details { display: block; font-size: 0.85rem; color: var(--global-text-color-light); margin-top: 0.15rem; }
  .cp-files { display: flex; flex-wrap: wrap; gap: 0.25rem 0.6rem; font-size: 0.85rem; }
  .cp-files .off { color: var(--global-text-color-light); opacity: 0.45; }
  .cp-files .cp-explore { font-weight: 600; }
  .cp-meta { display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--global-text-color-light); }
  .cp-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr)); gap: 1rem; margin: 1rem 0 1.5rem; }
  .cp-card { display: block; border: 1px solid var(--global-divider-color); border-radius: 6px; padding: 0.9rem 1.1rem; color: var(--global-text-color); transition: border-color 0.15s; }
  .cp-card:hover { border-color: var(--global-theme-color); text-decoration: none; color: var(--global-text-color); }
  .cp-card-title { display: block; font-weight: 500; color: var(--global-theme-color); margin: 0.25rem 0 0.35rem; }
  .cp-card-text { display: block; font-size: 0.9rem; }
  .cp-further { border: 1px solid var(--global-divider-color); border-left: 3px solid var(--global-theme-color); border-radius: 6px; padding: 1rem 1.2rem 0.4rem; margin: 1rem 0 1.5rem; scroll-margin-top: 5rem; }
  .cp-further h3 { font-size: 1.15rem; margin: 0.3rem 0 0.8rem; }
  .cp-further p, .cp-further li { font-size: 0.95rem; }
  .cp-further ul { padding-left: 1.2rem; }
  .cp-further .cp-label { font-weight: 600; margin-bottom: 0.3rem; }
  .cp-weights { width: auto; min-width: 18rem; }
  .cp-weights td:last-child { text-align: right; }
  .cp-note { font-size: 0.875rem; color: var(--global-text-color-light); border-left: 3px solid var(--global-theme-color); padding: 0.4rem 0.8rem; margin: 1.5rem 0; }
  @media (max-width: 576px) {
    .cp-schedule td:last-child, .cp-schedule th:last-child { display: none; }
    .cp-files.cp-files-inline { display: flex; flex-wrap: wrap; }
  }
</style>

[← All courses]({{ '/teaching/' | relative_url }})

<dl class="cp-facts">
  <dt>Level</dt><dd>{{ page.level }}</dd>
  <dt>Credit hours</dt><dd>{{ page.credit_hours }}</dd>
  <dt>Department</dt><dd>Mathematics, Kuwait University</dd>
  <dt>Instructor</dt><dd>{{ page.instructor }}</dd>
  <dt>Next offering</dt><dd>{{ page.next_offering }}</dd>
</dl>

## About the course

Mathematical modeling is the representation of real-world problems in terms of mathematical equations or relations, and the solution of those models so that conclusions can be drawn about the original problems. For the results to be useful, they must also be reported in a way that the people who posed the problem, usually non-mathematicians, can understand.

This course introduces the basics of model building and the techniques used to construct models, and gives students the opportunity to practise modeling skills together with written and oral communication. Topics include modeling change with difference equations; modeling with proportionality, geometric similarity and curve fitting; experimental modeling; discrete optimization; and modeling with differential equations and systems of differential equations.

Assignments include both theoretical problems and problems that require extensive calculation, and project problems that require some computer programming.

## Prerequisites

MATH 240, and either 0418126 or 0418106.

## Learning outcomes

By the end of the course, students should be able to:

1. Formulate dynamical models with difference equations and study their stability.
2. Fit data with linear, power and exponential models.
3. Formulate a model that minimizes the largest absolute deviation between the data and the model.
4. Decide on the validity of a model based on geometric and proportionality considerations.
5. Find linear and cubic spline models for a given set of data.
6. Determine the reliability of data and the order of polynomial to use as an empirical model.
7. Carry out a comparative study of different models.
8. Solve discrete optimization problems using linear programming.
9. Analyse the dynamics and stability of systems of ODEs using phase portraits.
10. Study the sensitivity of models to changes in data.
11. Produce numerical and visual computer solutions of models that cannot be solved analytically.

## Textbook and readings

**Textbook:** F. R. Giordano and M. D. Weir, _A First Course in Mathematical Modeling_, Brooks/Cole, 2003.

**Suggested further reading:**

- N. Gershenfeld, _The Nature of Mathematical Modeling_, Cambridge University Press, 1999.
- E. A. Bender, _An Introduction to Mathematical Modeling_, Dover, 2000.
- R. Aris, _Mathematical Modeling Techniques_, Dover, 1995.

## Assessment

<table class="table table-sm cp-table cp-weights">
  <tbody>
    <tr><td>Quizzes and homework</td><td>15%</td></tr>
    <tr><td>Midterm exams (at least two)</td><td>45%</td></tr>
    <tr><td>Comprehensive final exam</td><td>40%</td></tr>
  </tbody>
</table>

## Schedule

An indicative weekly plan, based on the lecture hours in the official syllabus. Midterm exams are scheduled during the term.

<table class="table table-sm cp-table cp-schedule">
  <thead>
    <tr><th>Week</th><th>Topic</th><th>Files</th></tr>
  </thead>
  <tbody>
    {% for w in page.weeks %}
      <tr>
        <td>{{ w.week }}</td>
        <td>{{ w.topic }}{% if w.details %}<span class="cp-details">{{ w.details }}</span>{% endif %}
          <div class="cp-files cp-files-inline">
            {% if w.notes %}<a href="{{ w.notes | relative_url }}">Notes</a>{% else %}<span class="off">Notes</span>{% endif %}
            {% if w.slides %}<a href="{{ w.slides | relative_url }}">Slides</a>{% else %}<span class="off">Slides</span>{% endif %}
            {% if w.problems %}<a href="{{ w.problems | relative_url }}">Problems</a>{% else %}<span class="off">Problems</span>{% endif %}
            {% if w.code %}<a href="{{ w.code | relative_url }}">Code</a>{% else %}<span class="off">Code</span>{% endif %}
            {% if w.explore %}{% assign c = w.explore | slice: 0 %}<a class="cp-explore" href="{% if c == '#' %}{{ w.explore }}{% else %}{{ w.explore | relative_url }}{% endif %}">Explore</a>{% endif %}
          </div>
        </td>
        <td>
          <div class="cp-files">
            {% if w.notes %}<a href="{{ w.notes | relative_url }}">Notes</a>{% else %}<span class="off">Notes</span>{% endif %}
            {% if w.slides %}<a href="{{ w.slides | relative_url }}">Slides</a>{% else %}<span class="off">Slides</span>{% endif %}
            {% if w.problems %}<a href="{{ w.problems | relative_url }}">Problems</a>{% else %}<span class="off">Problems</span>{% endif %}
            {% if w.code %}<a href="{{ w.code | relative_url }}">Code</a>{% else %}<span class="off">Code</span>{% endif %}
            {% if w.explore %}{% assign c = w.explore | slice: 0 %}<a class="cp-explore" href="{% if c == '#' %}{{ w.explore }}{% else %}{{ w.explore | relative_url }}{% endif %}">Explore</a>{% endif %}
          </div>
        </td>
      </tr>
    {% endfor %}
  </tbody>
</table>

<p class="cp-note">Files appear as links once they are posted. Solutions, grades and announcements are shared with enrolled students through the university's learning platform.</p>

## Interactive tools

Small tools for exploring ideas from the lectures. They run in your browser, need no installation, and are not assessed.

<div class="cp-cards">
  <a class="cp-card" href="{{ '/teaching/math316/tools/logistic-map/' | relative_url }}">
    <span class="cp-meta">Weeks 2–3 · Difference equations</span>
    <span class="cp-card-title">The discrete logistic model</span>
    <span class="cp-card-text">Follow a difference equation with cobweb diagrams, and watch an equilibrium give way to cycles and chaos as the growth rate increases.</span>
  </a>
  <a class="cp-card" href="{{ '/teaching/math316/tools/fitting/' | relative_url }}">
    <span class="cp-meta">Weeks 5–6 · Model fitting</span>
    <span class="cp-card-title">Least squares or Chebyshev?</span>
    <span class="cp-card-text">Drag data points, or load real data on Kuwait’s population, and compare the fit that minimizes the sum of squared deviations with the fit that minimizes the largest deviation.</span>
  </a>
  <a class="cp-card" href="{{ '/teaching/math316/tools/ladder-of-powers/' | relative_url }}">
    <span class="cp-meta">Week 7 · Experimental modeling</span>
    <span class="cp-card-title">The ladder of powers</span>
    <span class="cp-card-text">Move each variable up or down the ladder of powers until the data straighten, and read off a one-term model, for the planets, Kuwait’s population and mystery data.</span>
  </a>
  <a class="cp-card" href="{{ '/teaching/math316/tools/polynomials/' | relative_url }}">
    <span class="cp-meta">Week 7 · Experimental modeling</span>
    <span class="cp-card-title">High or low order?</span>
    <span class="cp-card-text">Fit polynomials of any degree, test them on points held back from the fit, and use divided differences to choose a sensible degree.</span>
  </a>
  <a class="cp-card" href="{{ '/teaching/math316/tools/splines/' | relative_url }}">
    <span class="cp-meta">Week 8 · Experimental modeling</span>
    <span class="cp-card-title">Linear and cubic splines</span>
    <span class="cp-card-text">Compare linear, natural and clamped cubic splines through points you can drag, with their derivatives and coefficients.</span>
  </a>
  <a class="cp-card" href="{{ '/teaching/math316/tools/linear-programming/' | relative_url }}">
    <span class="cp-meta">Week 10 · Linear programming</span>
    <span class="cp-card-title">Linear programming</span>
    <span class="cp-card-text">Solve the carpenter’s problem, or a randomly generated coffee-shop problem, on the graph and step through the simplex method one pivot at a time.</span>
  </a>
  <a class="cp-card" href="{{ '/teaching/math316/tools/phase-line/' | relative_url }}">
    <span class="cp-meta">Week 12 · Differential equations</span>
    <span class="cp-card-title">Phase lines and solution curves</span>
    <span class="cp-card-text">Read the behaviour of an autonomous equation from the graph of its right-hand side: Newton’s law of cooling, diffusion across a membrane, and logistic growth with and without harvesting.</span>
  </a>
  <a class="cp-card" href="{{ '/teaching/math316/tools/predator-prey/' | relative_url }}">
    <span class="cp-meta">Week 13 · Systems of differential equations</span>
    <span class="cp-card-title">Predators and prey</span>
    <span class="cp-card-text">Trajectories of the Lotka–Volterra model in the phase plane, with harvesting, limited resources and saturating predation.</span>
  </a>
  <a class="cp-card" href="{{ '/teaching/math316/tools/competitive-hunter/' | relative_url }}">
    <span class="cp-meta">Week 13 · Systems of differential equations</span>
    <span class="cp-card-title">Competing species</span>
    <span class="cp-card-text">The competitive hunter model and its extension with limited resources: drag the nullclines and see which species wins.</span>
  </a>
</div>

## Going further

For anyone who wants to see where a topic leads: a question to think about, something to read, and a small open problem. All of it is optional and none of it is assessed.

<div class="cp-further" id="lotka-volterra">
  <span class="cp-meta">Week 13 · Systems of differential equations · Optional</span>
  <h3>When two competitors share a resource, can both survive?</h3>
  <p>In the competitive hunter model from class, the phase plane shows that, depending on the parameters, two species can settle at a coexistence point or one can drive the other out. The same question arises with infectious diseases: when two strains of a virus spread through the same population, can a new strain invade, and can both persist?</p>
  <p class="cp-label">Read</p>
  <ul>
    <li>S. H. Strogatz, <em>Nonlinear Dynamics and Chaos</em>, 2nd ed., Westview Press, 2015, Section 6.4, “Rabbits versus sheep”. The competition model analysed in the phase plane, in the spirit of the lectures.</li>
    <li>A. Kucharski, <em>The Rules of Contagion: Why Things Spread – and Why They Stop</em>, Profile Books, 2020. A non-technical account of how epidemic models are built and used.</li>
  </ul>
  <p class="cp-label">Try</p>
  <p>Turn the two species into two strains of a virus competing for the same susceptible people. Write equations for the susceptible population <em>S</em> and the populations infected with each strain, <em>I</em><sub>1</sub> and <em>I</em><sub>2</sub>, with new susceptibles entering at a constant rate. Find the equilibria, then use a numerical solver to explore when strain 2 can invade a population where strain 1 is already established. Is there a single quantity that decides the outcome?</p>
  <p class="cp-label">Where it leads</p>
  <p>Competing strains were the subject of a recent graduate thesis in my group; see <a href="{{ '/research/' | relative_url }}#competing-strains">Competing strains</a> on the research page, which also describes our <a href="{{ '/research/' | relative_url }}#how-do-population-heterogeneity-and-interventions-influence-epidemic-dynamics">COVID-19 modelling for Kuwait</a>. If you take the problem further, or would like to talk about it, I would be glad to hear from you; see <a href="{{ '/group/' | relative_url }}#joining">Joining</a> on the group page.</p>
</div>
