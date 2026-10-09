# kindred-site

The public website for Kindred at https://kindredhealth.in (GitHub Pages, custom domain in `CNAME`).
Static pages, no scripts, no trackers. Google Play's organisation developer account
needs a verified organisation website; this is it.

Edit `index.html`, open a PR, merge: GitHub Pages publishes `main`.

## Lab test guides (for people and AI assistants)

`/tests/` and `/hi/tests/`: one plain-words page per common lab test, with the usual range, what high and
low can mean, when to see a doctor and what to ask. Each page carries schema.org data (MedicalWebPage, FAQPage)
so search engines and AI assistants can read and cite it. `llms.txt` describes Kindred for AI assistants;
`sitemap.xml` and `robots.txt` let crawlers find everything.

These pages are generated: edit `data/tests.json` (content) or `build.mjs` (layout), run `node build.mjs`,
commit everything it writes. No packages needed.

**Medical review:** the content is written from standard adult reference ranges and has not yet been reviewed
by a doctor. When a doctor reviews it, set `reviewedBy` and `reviewedOn` in `data/tests.json` and rebuild:
each page then says "Medically reviewed by …".
