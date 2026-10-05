# shammari.github.io

Source for the academic website of Abdullah A. Al-Shammari: <https://shammari.github.io>

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

To add a publication, paste its BibTeX entry into `_bibliography/papers.bib`. Add `selected = {true}` to show it on the home page.

## One-time GitHub setup

1. **Settings → Actions → General → Workflow permissions**: choose **Read and write permissions**.
2. After the first "Deploy site" run finishes, go to **Settings → Pages** and set **Source** to **Deploy from a branch**, branch **`gh-pages`**, folder `/ (root)`.

## Preview locally

```bash
bundle install
bundle exec jekyll serve   # http://localhost:4000
```

Or with Docker: `docker compose up`. See the [al-folio docs](https://github.com/alshedivat/al-folio/tree/main/docs) for more.
