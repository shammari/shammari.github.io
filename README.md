# shammari.github.io

Source for the academic website of Abdullah Al-Shammari: <https://shammari.github.io>

Built with [Jekyll](https://jekyllrb.com/) and the [al-folio](https://github.com/alshedivat/al-folio) theme (v1.x). The site is built by GitHub Actions and published to the `gh-pages` branch.

## Where to edit things

| What                         | File                                  |
| ---------------------------- | ------------------------------------- |
| Home page bio                | `_pages/about.md`                     |
| Research page                | `_pages/research.md`                  |
| Publications                 | `_bibliography/papers.bib` (BibTeX)   |
| Teaching                     | `_pages/teaching.md`                  |
| Students and opportunities   | `_pages/group.md`                     |
| News items                   | `_news/` (one Markdown file per item) |
| Email, Scholar, GitHub links | `_data/socials.yml`                   |
| Profile photo                | `assets/img/prof_pic.jpg`             |
| Site title, theme settings   | `_config.yml`                         |

### Publications update themselves

Every Sunday the **Sync publications from ORCID** workflow reads the works on ORCID [0000-0002-4512-1151](https://orcid.org/0000-0002-4512-1151), fetches metadata for any new DOI from Crossref, and opens a pull request adding them to `_bibliography/papers.bib`. Review and merge it to publish. To run it now: **Actions → Sync publications from ORCID → Run workflow**.

- Keep ORCID up to date (e.g. enable Crossref auto-update in ORCID, or use _Add works → Search & link_).
- Preprints and works without a DOI are skipped; paste those into `papers.bib` by hand.
- To stop a DOI being suggested again, add it to `_bibliography/orcid_ignore.txt`.
- Add `selected = {true}` to an entry to show it on the home page.

Citation counts are refreshed from Google Scholar by the **Update Google Scholar Citations** workflow (Mon/Wed/Fri). Google sometimes blocks it; failed runs are harmless.

## One-time GitHub setup

1. **Settings → Actions → General → Workflow permissions**: choose **Read and write permissions**.
2. **Settings → Actions → General**: tick **Allow GitHub Actions to create and approve pull requests** (needed by the ORCID sync).
3. After the first "Deploy site" run finishes, go to **Settings → Pages** and set **Source** to **Deploy from a branch**, branch **`gh-pages`**, folder `/ (root)`.

## Preview locally

```bash
bundle install
bundle exec jekyll serve   # http://localhost:4000
```

Or with Docker: `docker compose up`. See the [al-folio docs](https://github.com/alshedivat/al-folio/tree/main/docs) for more.
