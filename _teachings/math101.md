---
layout: course
title: "MATH 101: Calculus 1"
description: Limits, continuity, derivatives and their applications, and integrals of functions of one variable.
permalink: /teaching/math101/
course_id: math101
year: 2026
level: Undergraduate
credit_hours: 3
instructor: Abdullah A. Al-Shammari
next_offering: To be announced
# Weekly plan. To add a file, give its path after notes:, slides:, problems: or worksheet:
# (for example  worksheet: /assets/pdf/teaching/math101/week01-worksheet.pdf). Empty slots show greyed out.
# explore: is optional. Give a tool's address, or the id of a group of tool cards (for example  "#week-3");
# an Explore link then appears in that week's row.
weeks:
  - week: 1
    topic: Functions and models
    details: 1.2 Mathematical models; 1.4 Exponential functions; 1.5 Inverse functions and logarithms
    notes:
    slides:
    problems:
    worksheet:
    explore: /teaching/math101/tools/functions/
  - week: 2
    topic: Inverse functions and limits
    details: 1.5 Inverse functions and logarithms; 2.2 The limit of a function; 2.3 Calculating limits using the limit laws
    notes:
    slides:
    problems:
    worksheet:
    explore: /teaching/math101/tools/limits/
  - week: 3
    topic: Limits and continuity
    details: 2.4 The precise definition of a limit; 2.5 Continuity
    notes:
    slides:
    problems:
    worksheet:
    explore: "#week-3"
  - week: 4
    topic: Limits at infinity and derivatives
    details: 2.6 Limits at infinity; horizontal asymptotes; 2.7 Derivatives and rates of change; 2.8 The derivative as a function
    notes:
    slides:
    problems:
    worksheet:
    explore: /teaching/math101/tools/derivative/
  - week: 5
    topic: Differentiation rules
    details: 3.1 Derivatives of polynomials and exponential functions; 3.2 The product and quotient rules
    notes:
    slides:
    problems:
    worksheet:
    explore: /teaching/math101/tools/check-derivative/
  - week: 6
    topic: Differentiation rules
    details: 3.3 Derivatives of trigonometric functions; 3.4 The chain rule
    notes:
    slides:
    problems:
    worksheet:
    explore: /teaching/math101/tools/check-derivative/
  - week: 7
    topic: Implicit differentiation and related rates
    details: 3.5 Implicit differentiation; 3.6 Derivatives of logarithmic functions; 3.9 Related rates
    notes:
    slides:
    problems:
    worksheet:
    explore: "#week-7"
  - week: 8
    topic: Linear approximation, hyperbolic functions and extreme values
    details: 3.10 Linear approximations and differentials; 3.11 Hyperbolic functions; 4.1 Maximum and minimum values
    notes:
    slides:
    problems:
    worksheet:
    explore: "#week-8"
  - week: 9
    topic: The Mean Value Theorem and the shape of a graph
    details: 4.2 The mean value theorem; 4.3 How derivatives affect the shape of a graph
    notes:
    slides:
    problems:
    worksheet:
    explore: /teaching/math101/tools/mean-value-theorem/
  - week: 10
    topic: Curve sketching
    details: 4.3 How derivatives affect the shape of a graph; 4.5 Summary of curve sketching
    notes:
    slides:
    problems:
    worksheet:
    explore: /teaching/math101/tools/curve-sketching/
  - week: 11
    topic: Curve sketching and optimization
    details: 4.5 Summary of curve sketching; 4.7 Optimization problems
    notes:
    slides:
    problems:
    worksheet:
    explore: /teaching/math101/tools/optimization/
  - week: 12
    topic: Antiderivatives and the definite integral
    details: 4.9 Antiderivatives; 5.2 The definite integral
    notes:
    slides:
    problems:
    worksheet:
    explore: "#week-12"
  - week: 13
    topic: The Fundamental Theorem of Calculus
    details: 5.3 The fundamental theorem of calculus; 5.4 Indefinite integrals and the net change theorem
    notes:
    slides:
    problems:
    worksheet:
    explore: /teaching/math101/tools/fundamental-theorem/
  - week: 14
    topic: Substitution and areas between curves
    details: 5.5 The substitution rule; 6.1 Areas between curves
    notes:
    slides:
    problems:
    worksheet:
    explore: "#week-14"
  - week: 15
    topic: Review
    details:
    notes:
    slides:
    problems:
    worksheet:
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
  .cp-schedule td:last-child, .cp-schedule th:last-child { width: 21rem; }
  .cp-ex td, .cp-ex th { font-size: 0.85rem; }
  .cp-ex td:first-child { white-space: nowrap; }
  details.cp-details-box summary { cursor: pointer; font-weight: 500; }
  .cp-schedule .cp-files { flex-wrap: nowrap; }
  .cp-files.cp-files-inline { display: none; margin-top: 0.35rem; }
  .cp-details { display: block; font-size: 0.85rem; color: var(--global-text-color-light); margin-top: 0.15rem; }
  .cp-files { display: flex; flex-wrap: wrap; gap: 0.25rem 0.6rem; font-size: 0.85rem; }
  .cp-files .off { color: var(--global-text-color-light); opacity: 0.45; }
  .cp-files .cp-explore { font-weight: 600; }
  .cp-meta { display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--global-text-color-light); }
  .cp-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr)); gap: 1rem; margin: 1rem 0 1.5rem; }
  .cp-card { scroll-margin-top: 5rem; display: block; border: 1px solid var(--global-divider-color); border-radius: 6px; padding: 0.9rem 1.1rem; color: var(--global-text-color); transition: border-color 0.15s; }
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

This is the first course of the three-semester calculus sequence (MATH 101, MATH 102 and MATH 211). It covers limits and continuity of functions of one variable and the Intermediate Value Theorem; derivatives and the methods of differentiation; Rolle's Theorem and the Mean Value Theorem; applications of differentiation and differentials; indefinite and definite integrals and the Fundamental Theorem of Calculus; and areas between curves as an application of the definite integral.

The course aims to introduce, from an intuitive and elementary point of view, the fundamental ideas of calculus, namely limits, continuity, differentiability and integration of functions of one variable, together with their physical and geometric meaning; to show how calculus solves problems in science, mathematics, business and other areas; and to lay the foundation for the rest of the calculus sequence and for the more demanding courses in analysis.

## Prerequisites

MATH 91, or passing the Mathematics Aptitude Test.

## Learning outcomes

By the end of the course, students should be able to:

1. Use the basic properties of elementary transcendental functions.
2. Determine whether a function has a limit or a one-sided limit at a point, from its graph or its formula, or explain why it has neither.
3. State the definition of continuity at a point in terms of limits, and distinguish between removable, jump and infinite discontinuities.
4. Use the Intermediate Value Theorem and the Mean Value Theorem to locate and count the zeros of functions.
5. Explain the geometric meaning of the derivative, and compute it directly from the definition for reasonably simple functions.
6. Apply the rules of differentiation to compute derivatives.
7. Solve related rates problems.
8. Study how the first and second derivatives affect the graph of a function, and sketch a graph that shows its essential features.
9. Model and solve applied maximization and minimization problems with the tools of calculus.
10. Use the method of substitution to find indefinite integrals of reasonably simple functions.
11. Use the Fundamental Theorem of Calculus to compute definite integrals.
12. Compute the areas of regions enclosed between graphs of functions.

## Textbook and readings

**Textbook:** J. Stewart, _Calculus: Early Transcendentals_, 8th edition (metric version), Cengage Learning, 2016.

**Suggested further reading:**

- R. T. Smith and R. B. Minton, _Calculus: Early Transcendental Functions_, McGraw-Hill, 2011.
- H. Anton, _Calculus: A New Horizon_, John Wiley & Sons, 1998.
- C. H. Edwards and D. E. Penney, _Calculus_, Prentice Hall, 2002.
- D. Hughes-Hallett, A. M. Gleason et al., _Calculus_, Wiley, 2012.
- G. B. Thomas and R. L. Finney, _Calculus_, Addison-Wesley, 2000.

## Assessment

<table class="table table-sm cp-table cp-weights">
  <tbody>
    <tr><td>Quizzes in the tutorial sessions (best four of five)</td><td>10%</td></tr>
    <tr><td>First midterm exam (Sections 1.2–2.8)</td><td>25%</td></tr>
    <tr><td>Second midterm exam (Sections 3.1–4.2)</td><td>25%</td></tr>
    <tr><td>Comprehensive final exam</td><td>40%</td></tr>
  </tbody>
</table>

The exams are common to all sections of the course and are graded with the emphasis on the method of solution. Five quizzes are given in the tutorial sessions, and the quiz mark is based on the best four. Students who miss a midterm exam for a genuine reason may sit a make-up exam with the instructor's approval; students who miss the final exam through illness must apply formally for a deferred exam. Past exams from the Department of Mathematics are good practice before each exam.

<details class="cp-details-box">
  <summary>Definitions and theorems that may be asked on exams</summary>
  <p>Page numbers refer to the textbook.</p>
  <ul>
    <li><b>Definitions:</b> increasing and decreasing function (p. 19); the precise definition of a limit (p. 106); continuous function (p. 114); continuity from the right and from the left (p. 116); continuity on an interval (p. 117); the derivative of a function (p. 144); maximum and minimum values of a function (p. 276); local maximum and minimum values (p. 276); critical number (p. 280); antiderivative (p. 350).</li>
    <li><b>Theorems:</b> the Intermediate Value Theorem (p. 122); Rolle's Theorem (p. 287); the Mean Value Theorem (p. 288); the Fundamental Theorem of Calculus, Part 1 (p. 394) and Part 2 (p. 396).</li>
  </ul>
</details>

## Schedule

An indicative weekly plan for a 15-week semester, following the department's schedule. Each week has a worksheet for working through the ideas in class or in the tutorial.

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
            {% if w.worksheet %}<a href="{{ w.worksheet | relative_url }}">Worksheet</a>{% else %}<span class="off">Worksheet</span>{% endif %}
            {% if w.explore %}{% assign c = w.explore | slice: 0 %}<a class="cp-explore" href="{% if c == '#' %}{{ w.explore }}{% else %}{{ w.explore | relative_url }}{% endif %}">Explore</a>{% endif %}
          </div>
        </td>
        <td>
          <div class="cp-files">
            {% if w.notes %}<a href="{{ w.notes | relative_url }}">Notes</a>{% else %}<span class="off">Notes</span>{% endif %}
            {% if w.slides %}<a href="{{ w.slides | relative_url }}">Slides</a>{% else %}<span class="off">Slides</span>{% endif %}
            {% if w.problems %}<a href="{{ w.problems | relative_url }}">Problems</a>{% else %}<span class="off">Problems</span>{% endif %}
            {% if w.worksheet %}<a href="{{ w.worksheet | relative_url }}">Worksheet</a>{% else %}<span class="off">Worksheet</span>{% endif %}
            {% if w.explore %}{% assign c = w.explore | slice: 0 %}<a class="cp-explore" href="{% if c == '#' %}{{ w.explore }}{% else %}{{ w.explore | relative_url }}{% endif %}">Explore</a>{% endif %}
          </div>
        </td>
      </tr>
    {% endfor %}
  </tbody>
</table>

<details class="cp-details-box">
  <summary>Recommended exercises from the textbook</summary>
  <p>Work through the exercises in the middle column yourself; those in the last column are solved in the tutorials.</p>
  <div style="overflow-x:auto">
  <table class="table table-sm cp-table cp-ex">
    <thead><tr><th>Section</th><th>Exercises to try</th><th>Solved in tutorials</th></tr></thead>
    <tbody>
      <tr><td>1.2</td><td>2, 3, 5, 8, 15</td><td>1, 4, 6, 9, 10, 12</td></tr>
      <tr><td>1.4</td><td>1, 3, 6, 19, 21</td><td>2, 4, 20, 22, 23</td></tr>
      <tr><td>1.5</td><td>3, 5, 7, 9, 13, 15, 17, 21, 23, 25, 35, 37, 39, 41, 49, 51, 53, 57, 63, 65, 67, 69, 71</td><td>6, 8, 10, 16, 22, 26, 31, 36, 38, 40, 52, 57, 64, 66, 67, 68, 72</td></tr>
      <tr><td>Ch. 1 true–false</td><td>1, 3, 5, 11, 14</td><td>2, 4, 6, 8, 10</td></tr>
      <tr><td>Ch. 1 review</td><td>1, 3, 5, 7, 17, 19, 24, 26</td><td>2, 6, 7, 8, 25</td></tr>
      <tr><td>2.2</td><td>1, 7, 9, 11, 31, 33, 36, 40, 41</td><td>5, 8, 32, 34, 37, 38, 44(a)</td></tr>
      <tr><td>2.3</td><td>1, 2, 3, 4, 6, 7, 8, 11–32, 38–40, 45, 46, 59, 60</td><td>15, 18, 19, 37, 41, 62, 65</td></tr>
      <tr><td>2.4</td><td>15, 18, 19, 23</td><td>17, 20, 24</td></tr>
      <tr><td>2.5</td><td>11, 12, 13, 15, 17, 18, 19, 21, 22, 23, 24, 28, 39, 40, 42, 43, 46, 47, 53–56</td><td>14, 16, 20, 28, 41, 45, 56</td></tr>
      <tr><td>2.6</td><td>1, 2, 3, 7, 9, 13, 17, 21, 27, 35, 37, 38, 39, 40</td><td>16, 18, 20, 28, 34, 36, 47, 51</td></tr>
      <tr><td>2.7</td><td>1, 3(a, b), 5, 7, 9(a), 10(a, b), 20, 27, 29(a), 33, 35, 42</td><td>4(a, b), 6, 22, 30(a), 32, 36, 38, 41</td></tr>
      <tr><td>2.8</td><td>21, 22, 23, 25, 58(a, b, c), 59, 61, 63</td><td>24, 26, 57, 64</td></tr>
      <tr><td>Ch. 2 true–false</td><td>1, 3, 5, 8, 9, 10, 12, 17–22</td><td>2, 4, 12, 22</td></tr>
      <tr><td>Ch. 2 review</td><td>1, 2, 5, 8, 10, 12, 15, 17, 18, 19, 25, 29, 33, 35, 40</td><td>3, 5, 17, 25, 30, 34, 39(a, b)</td></tr>
      <tr><td>3.1</td><td>3, 5, 7, 9, 13, 15, 25, 33, 35, 57, 58, 61, 71, 81, 83</td><td>19, 23, 34, 36, 56, 57, 58, 72</td></tr>
      <tr><td>3.2</td><td>3, 5, 7, 9, 11, 15, 17, 21, 23, 27, 33, 50</td><td>4, 6, 8, 10, 12, 14, 28, 47, 49, 51</td></tr>
      <tr><td>3.3</td><td>1, 3, 5, 7, 9, 11, 17, 19, 29, 31, 39, 43, 47, 54(a, b)</td><td>2, 4, 6, 8, 18, 22, 34, 40, 42, 44, 46</td></tr>
      <tr><td>3.4</td><td>1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 25, 27, 29, 45, 46, 59, 65</td><td>2, 4, 10, 12, 22, 28, 60, 66, 71</td></tr>
      <tr><td>3.5</td><td>1, 3, 5, 7, 9, 11, 14, 15, 17, 24, 31, 49, 51, 55, 57</td><td>4, 6, 8, 10, 19, 21, 22, 50, 52, 54</td></tr>
      <tr><td>3.6</td><td>2, 3, 7, 11, 13, 17, 19, 21, 23, 27, 39, 41, 47</td><td>9, 12, 14, 16, 20, 24, 40, 46</td></tr>
      <tr><td>3.9</td><td>1, 3, 5, 9, 11, 15, 17, 19, 23, 27</td><td>2, 4, 6, 10, 14, 26, 30</td></tr>
      <tr><td>3.10</td><td>1, 3, 13, 14, 18, 21, 25, 27, 34</td><td>2, 11, 12, 24, 28, 35</td></tr>
      <tr><td>3.11</td><td>1, 3, 5, 7, 9, 11, 31, 33, 35</td><td>2, 4, 6, 8, 10, 12, 30, 32, 35, 37</td></tr>
      <tr><td>Ch. 3 true–false</td><td>1, 3, 5, 7, 9, 11, 15</td><td>2, 4, 6, 8, 10, 14</td></tr>
      <tr><td>Ch. 3 review</td><td>1, 3, 5, 7, 11, 21, 23, 33, 34, 36, 38, 40, 53, 55, 71, 77</td><td>2, 4, 6, 8, 10, 12, 22, 24, 37, 54, 58, 61</td></tr>
      <tr><td>4.1</td><td>1, 2, 3, 7, 9, 11, 15, 17, 19, 27, 39, 41, 43, 49, 53, 57, 61, 62</td><td>9, 13, 25, 40, 47, 59, 60</td></tr>
      <tr><td>4.2</td><td>1, 3, 5, 9, 12, 17, 18, 19, 21, 24, 26, 27, 29, 31, 36, 38</td><td>2, 4, 6, 10, 11, 17, 18, 20, 21, 23, 25, 27</td></tr>
      <tr><td>4.3</td><td>1, 2, 3, 4, 7, 9, 11, 15, 17, 18, 22, 33, 45, 48, 49, 52</td><td>12, 16, 19, 21, 29, 36, 46, 51</td></tr>
      <tr><td>4.5</td><td>5, 9, 10, 17, 19, 21, 25, 27, 43</td><td>18, 28, 44, 47, 50</td></tr>
      <tr><td>4.7</td><td>2, 3, 5, 11, 13, 16, 21, 25, 29, 32, 33, 37, 40, 54</td><td>4, 6, 21, 27, 36</td></tr>
      <tr><td>4.9</td><td>3, 5, 7, 9, 13, 15, 22, 25, 27, 34, 42, 45</td><td>2, 11, 12, 14, 28, 41</td></tr>
      <tr><td>Ch. 4 true–false</td><td>1, 3, 5, 7, 9, 17</td><td>2, 4, 6, 8, 10, 13, 16, 19</td></tr>
      <tr><td>Ch. 4 review</td><td>1, 3, 5, 21, 23, 65, 67, 69, 71, 74</td><td>4, 16, 29, 66, 70, 72</td></tr>
      <tr><td>5.2</td><td>1, 3, 35, 37, 39, 47, 49, 57, 70</td><td>2, 38, 40, 48, 50, 56</td></tr>
      <tr><td>5.3</td><td>7, 9, 11, 12, 13, 17, 19, 21, 23, 26, 35, 37, 59, 61</td><td>10, 18, 25, 29, 36, 53, 60, 62</td></tr>
      <tr><td>5.4</td><td>1, 3, 5, 7, 9, 11, 21, 23, 25, 26, 27, 30, 35, 39, 41</td><td>6, 8, 12, 14, 24, 28, 34, 44, 46</td></tr>
      <tr><td>5.5</td><td>1, 5, 9, 15, 17, 19, 21, 23, 25, 30, 47, 55, 59, 64</td><td>2, 4, 6, 16, 18, 28, 44, 46, 60, 62, 71</td></tr>
      <tr><td>Ch. 5 review</td><td>1, 2, 3, 7, 8, 11, 12, 13, 14</td><td>4, 5, 6, 10, 15</td></tr>
      <tr><td>6.1</td><td>1, 3, 5, 9, 11, 13, 16, 18, 19, 21, 25, 33</td><td>2, 4, 6, 8, 17, 22, 34</td></tr>
    </tbody>
  </table>
  </div>
</details>

<p class="cp-note">Files appear as links once they are posted. Solutions, grades and announcements are shared with enrolled students through the university's learning platform.</p>

## Interactive tools

Small tools for exploring ideas from the lectures, checked against the examples in the textbook. They run in your browser, need no installation, and are not assessed. Most of them also accept functions you type yourself, so you can use them to check your own work.

Type formulas much as you would write them: `2x`, `x^2`, `sin x`, `sin^2 x`, `sqrt(x)`, `e^x`, `ln x`, `log x` (base 10), `abs(x)` or `|x|`, `floor(x)`, `H(x)` (the Heaviside function) and `pi`. Write small numbers as decimals, such as `0.001`: `1e-3` would be read as $$e - 3$$.

To look closely at a graph, use **Zoom in**: where a tool has a point of interest, such as the number a limit is taken at, zooming keeps that point in view. You can also drag most graphs to move them, and zoom at the pointer with Ctrl (or ⌘) and the scroll wheel, or with a pinch on a trackpad or touch screen.

<div class="cp-cards">
  <a class="cp-card" href="{{ '/teaching/math101/tools/functions/' | relative_url }}">
    <span class="cp-meta">Weeks 1–2 · Functions and models</span>
    <span class="cp-card-title">Exponential, logarithmic and inverse functions</span>
    <span class="cp-card-text">Test whether a function is one-to-one with a horizontal line, reflect its graph in y = x to get the inverse, and find the base e from the slope of the tangent at 0.</span>
  </a>
  <a class="cp-card" href="{{ '/teaching/math101/tools/limits/' | relative_url }}">
    <span class="cp-meta">Weeks 2–4 · Limits</span>
    <span class="cp-card-title">Limits from tables and graphs</span>
    <span class="cp-card-text">Tabulate a function as x approaches a number or infinity, from the left and the right, and see when a table of values can mislead.</span>
  </a>
  <a class="cp-card" id="week-3" href="{{ '/teaching/math101/tools/epsilon-delta/' | relative_url }}">
    <span class="cp-meta">Week 3 · Limits</span>
    <span class="cp-card-title">The precise definition of a limit</span>
    <span class="cp-card-text">Choose ε, find a δ that works, and see why no δ works when the limit is wrong or does not exist.</span>
  </a>
  <a class="cp-card" href="{{ '/teaching/math101/tools/continuity/' | relative_url }}">
    <span class="cp-meta">Weeks 3–4 · Continuity</span>
    <span class="cp-card-title">Continuity and the Intermediate Value Theorem</span>
    <span class="cp-card-text">Check the three conditions for continuity, name the kind of discontinuity, and trap a root of an equation in smaller and smaller intervals.</span>
  </a>
  <a class="cp-card" href="{{ '/teaching/math101/tools/derivative/' | relative_url }}">
    <span class="cp-meta">Weeks 4–6 · Derivatives</span>
    <span class="cp-card-title">Tangent lines and the derivative</span>
    <span class="cp-card-text">Watch secant lines turn into the tangent line, and trace the graph of f′ from the slopes of f.</span>
  </a>
  <a class="cp-card" href="{{ '/teaching/math101/tools/check-derivative/' | relative_url }}">
    <span class="cp-meta">Weeks 5–8 · Differentiation rules</span>
    <span class="cp-card-title">Check your derivative</span>
    <span class="cp-card-text">Type your answer for a derivative and see where it disagrees with the true one, starting from common mistakes with the product, quotient and chain rules.</span>
  </a>
  <a class="cp-card" id="week-7" href="{{ '/teaching/math101/tools/implicit/' | relative_url }}">
    <span class="cp-meta">Week 7 · Implicit differentiation</span>
    <span class="cp-card-title">Implicit differentiation</span>
    <span class="cp-card-text">Draw curves such as the folium of Descartes and find the slope and the tangent line at any point, with the horizontal and vertical tangents.</span>
  </a>
  <a class="cp-card" href="{{ '/teaching/math101/tools/related-rates/' | relative_url }}">
    <span class="cp-meta">Week 7 · Related rates</span>
    <span class="cp-card-title">Related rates</span>
    <span class="cp-card-text">Animate the sliding ladder, the filling tank, the balloon, two cars and a searchlight, and see each rate as the slope of a graph against time.</span>
  </a>
  <a class="cp-card" id="week-8" href="{{ '/teaching/math101/tools/linear-approximation/' | relative_url }}">
    <span class="cp-meta">Week 8 · Linear approximation</span>
    <span class="cp-card-title">Linear approximations and differentials</span>
    <span class="cp-card-text">Compare a function with its tangent line, Δy with dy, and find where the approximation is accurate to a given tolerance.</span>
  </a>
  <a class="cp-card" href="{{ '/teaching/math101/tools/curve-sketching/' | relative_url }}">
    <span class="cp-meta">Weeks 8–11 · Applications of differentiation</span>
    <span class="cp-card-title">Curve sketching</span>
    <span class="cp-card-text">See f, f′ and f″ together, with critical numbers, extreme values, concavity, inflection points, asymptotes and the Closed Interval Method.</span>
  </a>
  <a class="cp-card" href="{{ '/teaching/math101/tools/mean-value-theorem/' | relative_url }}">
    <span class="cp-meta">Week 9 · The Mean Value Theorem</span>
    <span class="cp-card-title">Rolle's Theorem and the Mean Value Theorem</span>
    <span class="cp-card-text">Find the numbers c where the tangent is parallel to the secant, and see what goes wrong when a hypothesis fails.</span>
  </a>
  <a class="cp-card" href="{{ '/teaching/math101/tools/optimization/' | relative_url }}">
    <span class="cp-meta">Week 11 · Optimization</span>
    <span class="cp-card-title">Optimization problems</span>
    <span class="cp-card-text">Try choices by hand in the textbook's problems, from fencing a field to crossing a river, then find the best one by calculus.</span>
  </a>
  <a class="cp-card" id="week-12" href="{{ '/teaching/math101/tools/antiderivatives/' | relative_url }}">
    <span class="cp-meta">Week 12 · Antiderivatives</span>
    <span class="cp-card-title">Antiderivatives</span>
    <span class="cp-card-text">See the family F(x) + C as curves with the slopes that f prescribes, and pick out the one that satisfies an initial condition.</span>
  </a>
  <a class="cp-card" href="{{ '/teaching/math101/tools/riemann-sums/' | relative_url }}">
    <span class="cp-meta">Week 12 · The definite integral</span>
    <span class="cp-card-title">Riemann sums and the definite integral</span>
    <span class="cp-card-text">Approximate integrals with left, right and midpoint sums, and watch them approach the integral as the rectangles get thinner.</span>
  </a>
  <a class="cp-card" href="{{ '/teaching/math101/tools/fundamental-theorem/' | relative_url }}">
    <span class="cp-meta">Week 13 · The Fundamental Theorem</span>
    <span class="cp-card-title">The Fundamental Theorem of Calculus</span>
    <span class="cp-card-text">Build the area function from a to x, see that its derivative is f, and compare displacement with distance travelled.</span>
  </a>
  <a class="cp-card" id="week-14" href="{{ '/teaching/math101/tools/substitution/' | relative_url }}">
    <span class="cp-meta">Week 14 · Substitution</span>
    <span class="cp-card-title">The Substitution Rule</span>
    <span class="cp-card-text">See a substitution in a definite integral as two equal areas, one in x and one in u, with the limits changed.</span>
  </a>
  <a class="cp-card" href="{{ '/teaching/math101/tools/area-between-curves/' | relative_url }}">
    <span class="cp-meta">Week 14 · Areas between curves</span>
    <span class="cp-card-title">Areas between curves</span>
    <span class="cp-card-text">Find intersection points and areas between curves, split where the curves cross, with vertical or horizontal rectangles.</span>
  </a>
</div>
