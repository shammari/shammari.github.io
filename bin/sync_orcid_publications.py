#!/usr/bin/env python3
"""Add publications listed on ORCID to _bibliography/papers.bib.

How it works:
  1. Reads the ORCID iD from _data/socials.yml (`orcid_id`).
  2. Lists the works on that public ORCID record and collects their DOIs.
  3. Skips DOIs that are already in papers.bib, listed in
     _bibliography/orcid_ignore.txt, preprints, or near-duplicate titles.
  4. Looks up each remaining DOI on Crossref and appends a BibTeX entry.

Run locally with `python3 bin/sync_orcid_publications.py` (add `--dry-run`
to only print what would be added). Uses the Python standard library only.
"""

from __future__ import annotations

import argparse
import difflib
import html
import json
import os
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request

SOCIALS_FILE = "_data/socials.yml"
BIB_FILE = "_bibliography/papers.bib"
IGNORE_FILE = "_bibliography/orcid_ignore.txt"
USER_AGENT = "shammari.github.io publication sync (https://github.com/shammari/shammari.github.io)"

# Work types that are not added (preprints, datasets, etc.).
SKIP_ORCID_TYPES = {"preprint", "data-set", "other", "working-paper", "review", "lecture-speech"}
SKIP_CROSSREF_TYPES = {"posted-content", "peer-review", "dataset", "component", "grant"}
# DOI prefixes of preprint servers (medRxiv/bioRxiv, SSRN, Research Square, arXiv, Preprints.org).
PREPRINT_PREFIXES = ("10.1101/", "10.2139/", "10.21203/", "10.48550/", "10.20944/")
TITLE_SIMILARITY = 0.9

CROSSREF_TO_BIBTEX = {
    "journal-article": "article",
    "book-chapter": "incollection",
    "book-part": "incollection",
    "book-section": "incollection",
    "proceedings-article": "inproceedings",
    "book": "book",
    "monograph": "book",
    "edited-book": "book",
    "report": "techreport",
    "dissertation": "phdthesis",
}


# ----------------------------------------------------------------------------
# helpers
# ----------------------------------------------------------------------------


def http_json(url: str, retries: int = 3) -> dict:
    req = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": USER_AGENT})
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.load(resp)
        except urllib.error.HTTPError as err:
            if err.code == 404:
                raise
            if attempt == retries - 1:
                raise
        except urllib.error.URLError:
            if attempt == retries - 1:
                raise
        time.sleep(2 * (attempt + 1))
    raise RuntimeError("unreachable")


def normalize_doi(doi: str) -> str:
    doi = doi.strip().lower()
    doi = re.sub(r"^(https?://)?(dx\.)?doi\.org/", "", doi)
    doi = re.sub(r"^doi:\s*", "", doi)
    return doi


def normalize_title(title: str) -> str:
    title = unicodedata.normalize("NFKD", title)
    title = re.sub(r"[^a-z0-9 ]", "", title.lower())
    return re.sub(r"\s+", " ", title).strip()


def ascii_slug(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z]", "", text.lower())


def clean_text(text: str) -> str:
    """Strip markup from Crossref titles and escape characters special to BibTeX/LaTeX."""
    text = re.sub(r"<[^>]+>", "", text)
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    # Crossref often uses Unicode hyphens (e.g. "Al\u2010Shammari"); use ASCII so names match _config.yml
    text = text.replace("\u2010", "-").replace("\u2011", "-")
    for char in ("&", "%", "#", "_"):
        text = re.sub(r"(?<!\\)" + re.escape(char), "\\" + char, text)
    return text.replace("{", "").replace("}", "")


# ----------------------------------------------------------------------------
# inputs
# ----------------------------------------------------------------------------


def read_orcid_id(path: str = SOCIALS_FILE) -> str:
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            match = re.match(r"^\s*orcid_id:\s*[\"']?([0-9X-]{19})", line)
            if match:
                return match.group(1)
    sys.exit(f"No orcid_id found in {path}. Add a line like `orcid_id: 0000-0000-0000-0000`.")


def read_bib(path: str = BIB_FILE) -> tuple[str, set[str], list[str], set[str]]:
    with open(path, encoding="utf-8") as fh:
        text = fh.read()
    dois = {normalize_doi(d) for d in re.findall(r"\bdoi\s*=\s*[{\"]([^}\"]+)[}\"]", text, flags=re.I)}
    titles = [normalize_title(t) for t in re.findall(r"\btitle\s*=\s*\{(.+?)\},?\s*$", text, flags=re.I | re.M)]
    # Also count DOIs/titles mentioned in comments (e.g. the TODO list) as known titles only.
    keys = set(re.findall(r"@\w+\s*\{\s*([^,\s]+)\s*,", text))
    return text, dois, titles, keys


def read_ignore(path: str = IGNORE_FILE) -> set[str]:
    if not os.path.exists(path):
        return set()
    with open(path, encoding="utf-8") as fh:
        return {normalize_doi(line.split("#")[0]) for line in fh if line.split("#")[0].strip()}


# ----------------------------------------------------------------------------
# ORCID + Crossref
# ----------------------------------------------------------------------------


def orcid_works(orcid_id: str) -> list[dict]:
    """Return [{doi, title, type}] for every work on the ORCID record that has a DOI."""
    data = http_json(f"https://pub.orcid.org/v3.0/{orcid_id}/works")
    works = []
    for group in data.get("group", []):
        summaries = group.get("work-summary") or [{}]
        summary = summaries[0]
        ext_ids = (group.get("external-ids") or {}).get("external-id") or []
        ext_ids += ((summary.get("external-ids") or {}).get("external-id")) or []
        doi = next(
            (normalize_doi(e.get("external-id-value") or "") for e in ext_ids if (e.get("external-id-type") or "").lower() == "doi"),
            None,
        )
        title = (((summary.get("title") or {}).get("title")) or {}).get("value") or ""
        works.append({"doi": doi, "title": title, "type": (summary.get("type") or "").lower()})
    return works


def crossref_entry(doi: str, used_keys: set[str]) -> tuple[str, str, str] | None:
    """Return (bibtex, title, crossref_type) for a DOI, or None if Crossref has no record."""
    try:
        msg = http_json("https://api.crossref.org/works/" + urllib.parse.quote(doi, safe="/"))["message"]
    except urllib.error.HTTPError as err:
        print(f"  ! Crossref has no record for {doi} ({err.code}); skipped")
        return None

    cr_type = msg.get("type", "")
    title = clean_text((msg.get("title") or [""])[0])
    authors = []
    for a in msg.get("author", []):
        family, given = a.get("family"), a.get("given")
        if family:
            authors.append(f"{clean_text(family)}, {clean_text(given)}" if given else clean_text(family))
        elif a.get("name"):
            authors.append("{" + clean_text(a["name"]) + "}")
    date = (msg.get("published") or msg.get("issued") or msg.get("published-print") or msg.get("published-online") or {}).get("date-parts", [[None]])
    year = str(date[0][0]) if date and date[0] and date[0][0] else ""
    container = clean_text((msg.get("container-title") or [""])[0])

    first_author = ascii_slug((msg.get("author") or [{}])[0].get("family", "")) or "anon"
    first_word = next((ascii_slug(w) for w in title.split() if len(ascii_slug(w)) > 3), "paper")
    key = base = f"{first_author}{year}{first_word}"
    suffix = ord("a")
    while key in used_keys:
        key = f"{base}{chr(suffix)}"
        suffix += 1
    used_keys.add(key)

    entry_type = CROSSREF_TO_BIBTEX.get(cr_type, "misc")
    fields: list[tuple[str, str]] = [("title", title), ("author", " and ".join(authors))]
    if entry_type == "article":
        fields.append(("journal", container))
    elif entry_type in ("incollection", "inproceedings"):
        fields.append(("booktitle", container))
    elif container:
        fields.append(("howpublished", container))
    for name, value in (("volume", msg.get("volume")), ("number", msg.get("issue")), ("pages", msg.get("page") or msg.get("article-number"))):
        if value:
            fields.append((name, clean_text(str(value)).replace("-", "--") if name == "pages" else clean_text(str(value))))
    if msg.get("publisher") and entry_type != "article":
        fields.append(("publisher", clean_text(msg["publisher"])))
    fields += [("year", year), ("doi", doi)]

    width = max(len(n) for n, v in fields if v)
    body = ",\n".join(f"  {n.ljust(width)} = {{{v}}}" for n, v in fields if v)
    return f"@{entry_type}{{{key},\n{body}\n}}\n", title, cr_type


# ----------------------------------------------------------------------------
# main
# ----------------------------------------------------------------------------


def is_duplicate_title(title: str, known_titles: list[str]) -> bool:
    norm = normalize_title(title)
    if not norm:
        return False
    return any(difflib.SequenceMatcher(None, norm, t).ratio() >= TITLE_SIMILARITY for t in known_titles)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--dry-run", action="store_true", help="print new entries without changing papers.bib")
    args = parser.parse_args()

    orcid_id = read_orcid_id()
    bib_text, known_dois, known_titles, used_keys = read_bib()
    ignored = read_ignore()
    print(f"ORCID {orcid_id}: papers.bib has {len(known_dois)} DOIs, {len(ignored)} ignored")

    works = orcid_works(orcid_id)
    print(f"ORCID record lists {len(works)} works")

    new_entries: list[str] = []
    added_titles: list[str] = []
    for work in works:
        doi, label = work["doi"], work["title"][:70]
        if not doi:
            print(f"  - no DOI, skipped: {label}")
            continue
        if doi in known_dois or doi in ignored:
            continue
        if work["type"] in SKIP_ORCID_TYPES or doi.startswith(PREPRINT_PREFIXES):
            print(f"  - preprint/other, skipped: {doi}")
            continue
        if is_duplicate_title(work["title"], known_titles):
            print(f"  - same title already in papers.bib, skipped: {doi}")
            continue
        result = crossref_entry(doi, used_keys)
        time.sleep(1)  # be polite to Crossref
        if not result:
            continue
        entry, title, cr_type = result
        if cr_type in SKIP_CROSSREF_TYPES:
            print(f"  - Crossref type {cr_type}, skipped: {doi}")
            continue
        if is_duplicate_title(title, known_titles):
            print(f"  - same title already in papers.bib, skipped: {doi}")
            continue
        print(f"  + {doi}: {title[:70]}")
        new_entries.append(entry)
        known_dois.add(doi)
        known_titles.append(normalize_title(title))
        added_titles.append(title)

    print(f"{len(new_entries)} new publication(s)")
    if new_entries and not args.dry_run:
        with open(BIB_FILE, "w", encoding="utf-8") as fh:
            fh.write(bib_text.rstrip("\n") + "\n\n" + "\n".join(new_entries))

    if os.environ.get("GITHUB_OUTPUT"):
        with open(os.environ["GITHUB_OUTPUT"], "a", encoding="utf-8") as fh:
            fh.write(f"added={len(new_entries)}\n")
            fh.write("titles<<EOF\n" + "\n".join(f"- {t}" for t in added_titles) + "\nEOF\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
