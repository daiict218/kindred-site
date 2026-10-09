// Builds the lab-test guides from data/tests.json: one page per test in English and Hindi, the two
// guide lists, sitemap.xml and llms.txt. Plain Node, no packages. Run `node build.mjs` after editing
// the data or this file, and commit what it writes: GitHub Pages serves the files as they are.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const SITE = 'https://kindredhealth.in';
const WHATSAPP = 'https://wa.me/918571894580?text=Hi%20Kindred';
const data = JSON.parse(readFileSync('data/tests.json', 'utf8'));
const LANGS = ['en', 'hi'];

const UI = {
  en: {
    guides: 'Lab test guides',
    guidesLead: 'What your blood test results mean, in plain words: the usual range, what high and low can mean, and what to ask your doctor.',
    title: (n) => `${n} test: normal range, high and low meaning`,
    what: 'What it measures', range: 'Usual range', high: 'If it is high', low: 'If it is low',
    act: 'When to see a doctor soon', ask: 'Questions to ask your doctor', printed: 'Also printed on reports as',
    rangeNote: 'Ranges differ between labs, and by age and sex. Use the range printed on your report.',
    related: 'Related tests',
    ctaTitle: 'Keep every report in one place',
    cta: 'Send your reports to Kindred on WhatsApp. Kindred files them under the right person and date, explains them in your language, and shows how each result changes over time, for you and the people you care for.',
    ctaButton: 'Start on WhatsApp',
    disclaimer: 'General information, not medical advice. Kindred is not a medical device. Always talk to a doctor about your results. In an emergency, call 112.',
    byline: (d) => `Written by the Kindred team. Updated ${d}.`,
    reviewed: (who, d) => `Medically reviewed by ${who} on ${d}.`,
    other: 'हिन्दी में पढ़ें', home: 'Home',
    faq: { what: (n) => `What does ${n} measure?`, range: (n) => `What is the normal range of ${n}?`, high: (n) => `What does high ${n} mean?`, low: (n) => `What does low ${n} mean?`, act: () => 'When should I see a doctor?' },
  },
  hi: {
    guides: 'लैब टेस्ट गाइड',
    guidesLead: 'आपकी खून की जाँच के नतीजों का मतलब, आसान शब्दों में: सामान्य रेंज, ज़्यादा और कम होने का मतलब, और डॉक्टर से क्या पूछें।',
    title: (n) => `${n} जाँच: सामान्य रेंज, ज़्यादा और कम का मतलब`,
    what: 'यह क्या मापता है', range: 'सामान्य रेंज', high: 'ज़्यादा हो तो', low: 'कम हो तो',
    act: 'डॉक्टर को जल्दी कब दिखाएँ', ask: 'डॉक्टर से पूछने के सवाल', printed: 'रिपोर्ट पर इन नामों से भी छपता है',
    rangeNote: 'रेंज लैब, उम्र और लिंग के हिसाब से बदलती है। अपनी रिपोर्ट पर छपी रेंज देखें।',
    related: 'जुड़ी हुई जाँचें',
    ctaTitle: 'हर रिपोर्ट एक जगह रखें',
    cta: 'अपनी रिपोर्ट्स WhatsApp पर Kindred को भेजें। Kindred उन्हें सही व्यक्ति और तारीख के नीचे सहेजता है, आपकी भाषा में समझाता है, और दिखाता है कि हर नतीजा समय के साथ कैसे बदल रहा है: आपके लिए और आपके अपनों के लिए।',
    ctaButton: 'WhatsApp पर शुरू करें',
    disclaimer: 'यह सामान्य जानकारी है, डॉक्टर की सलाह नहीं। Kindred कोई मेडिकल डिवाइस नहीं है। अपने नतीजों के बारे में हमेशा डॉक्टर से बात करें। आपात स्थिति में 112 पर कॉल करें।',
    byline: (d) => `Kindred टीम द्वारा लिखा गया। अपडेट: ${d}।`,
    reviewed: (who, d) => `${who} द्वारा ${d} को मेडिकल समीक्षा।`,
    other: 'Read in English', home: 'होम',
    faq: { what: (n) => `${n} क्या मापता है?`, range: (n) => `${n} की सामान्य रेंज क्या है?`, high: (n) => `${n} ज़्यादा होने का क्या मतलब है?`, low: (n) => `${n} कम होने का क्या मतलब है?`, act: () => 'डॉक्टर को कब दिखाएँ?' },
  },
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const path = (lang, slug) => `${lang === 'en' ? '' : `/${lang}`}/tests/${slug ? `${slug}/` : ''}`;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const niceDate = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };
const jsonLd = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;
const write = (file, text) => { mkdirSync(file.split('/').slice(0, -1).join('/') || '.', { recursive: true }); writeFileSync(file, text); };
const fileFor = (p) => `.${p}index.html`;

const STYLE = `
  :root { --bg: #FAF7F2; --card: #FFFFFF; --ink: #1A1F1E; --muted: #4E5857; --brand: #2D7A6F; --brand-ink: #1F5A50; --line: #E6DFD3; --chip: #EEF5F3; }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) { --bg: #121716; --card: #1B2220; --ink: #ECEFEE; --muted: #A9B4B2; --brand: #4FA89B; --brand-ink: #8FD3C7; --line: #2C3533; --chip: #22302D; }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--ink); font: 17px/1.6 -apple-system, "Segoe UI", Roboto, "Noto Sans", "Noto Sans Devanagari", sans-serif; }
  main, header, footer { max-width: 760px; margin: 0 auto; padding: 0 16px; }
  header { display: flex; align-items: center; gap: 10px; padding-top: 20px; }
  header a.brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
  header img { width: 32px; height: 32px; border-radius: 8px; }
  header b { font: 700 20px Georgia, "Times New Roman", serif; color: var(--brand-ink); }
  header .lang { margin-left: auto; font-size: 15px; }
  nav.crumbs { font-size: 15px; color: var(--muted); margin: 24px 0 0; }
  h1 { font: 700 clamp(28px, 6vw, 38px)/1.2 Georgia, "Times New Roman", serif; color: var(--brand-ink); margin: 8px 0 12px; }
  h2 { font: 700 21px/1.3 Georgia, "Times New Roman", serif; color: var(--brand-ink); margin: 0 0 8px; }
  .lead { font-size: 19px; color: var(--muted); margin: 0 0 8px; }
  section { background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 18px 20px; margin: 16px 0; }
  section p { margin: 0; }
  ul { padding-left: 22px; margin: 0; } li { margin: 4px 0; }
  .note { font-size: 15px; color: var(--muted); margin-top: 8px; }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; list-style: none; padding: 0; }
  .chips li { background: var(--chip); border-radius: 999px; padding: 4px 12px; font-size: 15px; margin: 0; }
  .cta { border-color: var(--brand); }
  .button { display: inline-block; margin-top: 12px; background: var(--brand); color: #fff; text-decoration: none; font-weight: 600; padding: 12px 22px; border-radius: 999px; }
  a { color: var(--brand-ink); }
  .groups h2 { margin-top: 6px; }
  footer { padding: 12px 16px 40px; font-size: 14px; color: var(--muted); }
  footer p { margin: 6px 0; }`;

function shell({ lang, title, description, canonical, alternates, body, ld }) {
  const other = lang === 'en' ? 'hi' : 'en';
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} | Kindred</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${SITE}${canonical}">
${LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${SITE}${alternates[l]}">`).join('\n')}
<link rel="alternate" hreflang="x-default" href="${SITE}${alternates.en}">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<style>${STYLE}
</style>
${ld.map(jsonLd).join('\n')}
</head>
<body>
<header><a class="brand" href="/"><img src="/icon.svg" alt=""><b>Kindred</b></a><a class="lang" href="${alternates[other]}" hreflang="${other}" lang="${other}">${UI[lang].other}</a></header>
<main>
${body}
</main>
<footer>
  <p>${esc(UI[lang].disclaimer)}</p>
  <p>Kindred is a product of Forge Consultancy, Bahadurgarh, Haryana, India. <a href="https://daiict218.github.io/kindred-legal/">Privacy Notice</a> · <a href="mailto:ajaygaur319@gmail.com">Contact</a></p>
</footer>
</body>
</html>
`;
}

const ctaBlock = (lang) => `  <section class="cta">
    <h2>${esc(UI[lang].ctaTitle)}</h2>
    <p>${esc(UI[lang].cta)}</p>
    <a class="button" href="${WHATSAPP}">${esc(UI[lang].ctaButton)}</a>
  </section>`;

const byline = (lang) => (data.reviewedBy
  ? UI[lang].reviewed(data.reviewedBy, niceDate(data.reviewedOn))
  : UI[lang].byline(niceDate(data.updated)));

function testPage(t, lang) {
  const ui = UI[lang];
  const c = t[lang];
  const p = path(lang, t.slug);
  // "If it is high" / "If it is low" in the order the data gives them: the one that matters most first.
  const sides = Object.keys(c).filter((k) => k === 'high' || k === 'low');
  const related = data.tests.filter((o) => o.group === t.group && o.slug !== t.slug);
  const body = `  <nav class="crumbs"><a href="${path(lang)}">${esc(ui.guides)}</a></nav>
  <h1>${esc(ui.title(c.name))}</h1>
  <p class="lead">${esc(c.what)}</p>
  <section>
    <h2>${esc(ui.range)}</h2>
    <ul>${c.range.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
    <p class="note">${esc(ui.rangeNote)}</p>
  </section>
${sides.map((k) => `  <section>
    <h2>${esc(ui[k])}</h2>
    <p>${esc(c[k])}</p>
  </section>`).join('\n')}
  <section>
    <h2>${esc(ui.act)}</h2>
    <p>${esc(c.act)}</p>
  </section>
  <section>
    <h2>${esc(ui.ask)}</h2>
    <ul>${c.ask.map((q) => `<li>${esc(q)}</li>`).join('')}</ul>
  </section>
${t.printed.length ? `  <section>
    <h2>${esc(ui.printed)}</h2>
    <ul class="chips">${t.printed.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>
  </section>` : ''}
${ctaBlock(lang)}
${related.length ? `  <section>
    <h2>${esc(ui.related)}</h2>
    <ul>${related.map((o) => `<li><a href="${path(lang, o.slug)}">${esc(o[lang].name)}</a></li>`).join('')}</ul>
  </section>` : ''}
  <p class="note">${esc(byline(lang))}</p>`;
  const faq = ['what', 'range', 'high', 'low', 'act'].map((k) => ({
    '@type': 'Question',
    name: ui.faq[k](c.name),
    acceptedAnswer: { '@type': 'Answer', text: k === 'range' ? `${c.range.join('. ')}. ${ui.rangeNote}` : c[k] },
  }));
  const ld = [
    {
      '@context': 'https://schema.org', '@type': 'MedicalWebPage', name: ui.title(c.name), url: `${SITE}${p}`, inLanguage: lang,
      description: c.what, dateModified: data.updated, ...(data.reviewedOn && { lastReviewed: data.reviewedOn }),
      about: { '@type': 'MedicalTest', name: t.en.name, alternateName: [...new Set([c.name, ...t.printed])] },
      audience: { '@type': 'MedicalAudience', audienceType: 'Patient' },
      publisher: { '@type': 'Organization', name: 'Kindred Health', url: SITE },
    },
    { '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: lang, mainEntity: faq },
  ];
  return shell({
    lang, title: ui.title(c.name), description: c.what.slice(0, 160), canonical: p,
    alternates: Object.fromEntries(LANGS.map((l) => [l, path(l, t.slug)])), body, ld,
  });
}

function listPage(lang) {
  const ui = UI[lang];
  const body = `  <nav class="crumbs"><a href="/">${esc(ui.home)}</a></nav>
  <h1>${esc(ui.guides)}</h1>
  <p class="lead">${esc(ui.guidesLead)}</p>
  <div class="groups">
${data.groups.map((g) => `  <section>
    <h2>${esc(g[lang])}</h2>
    <ul>${data.tests.filter((t) => t.group === g.id).map((t) => `<li><a href="${path(lang, t.slug)}">${esc(t[lang].name)}</a></li>`).join('')}</ul>
  </section>`).join('\n')}
  </div>
${ctaBlock(lang)}
  <p class="note">${esc(byline(lang))}</p>`;
  const ld = [{
    '@context': 'https://schema.org', '@type': 'CollectionPage', name: ui.guides, url: `${SITE}${path(lang)}`, inLanguage: lang,
    hasPart: data.tests.map((t) => ({ '@type': 'MedicalWebPage', name: t[lang].name, url: `${SITE}${path(lang, t.slug)}` })),
  }];
  return shell({ lang, title: ui.guides, description: ui.guidesLead, canonical: path(lang), alternates: Object.fromEntries(LANGS.map((l) => [l, path(l)])), body, ld });
}

for (const lang of LANGS) {
  write(fileFor(path(lang)), listPage(lang));
  for (const t of data.tests) write(fileFor(path(lang, t.slug)), testPage(t, lang));
}

// sitemap.xml: every page, with its language versions.
const urls = [['/', null], ...[null, ...data.tests.map((t) => t.slug)].map((slug) => [path('en', slug), slug])];
const entry = (loc, slug) => {
  const alts = loc === '/' ? '' : LANGS.map((l) => `\n    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE}${path(l, slug ?? undefined)}"/>`).join('');
  return `  <url><loc>${SITE}${loc}</loc><lastmod>${data.updated}</lastmod>${alts}\n  </url>`;
};
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.flatMap(([loc, slug]) => (loc === '/' ? [entry(loc)] : LANGS.map((l) => entry(path(l, slug ?? undefined), slug)))).join('\n')}
</urlset>
`);

// llms.txt (llmstxt.org): what Kindred is, in a form AI assistants read and cite.
write('llms.txt', `# Kindred Health

> Kindred is a family health records app for India. People keep their own and their family's lab reports, prescriptions and home BP and sugar readings in one place, send reports on WhatsApp, share a person's records with family, and, only if they choose, get each report explained by AI in plain words in English or 12 Indian languages. Records are stored in India.

Kindred is for adults in India who look after their own health and the health of people they care for: parents, a spouse, children, friends.

- Send a report (PDF or photo) to Kindred on WhatsApp, +91 85718 94580: Kindred files it under the right person and date.
- See each test result over time, with the range printed on the report.
- Log BP and sugar, with reminders for everyone who looks after that person.
- Share a person's records with family by invite, and remove access at any time.
- AI explanations are off until the user says yes. A person with their own Kindred account decides for their own records.
- Records are stored in India. No ads, no trackers, records never sold. Delete any report, person or account at any time.
- Kindred is not a medical device and does not diagnose or treat. In an emergency in India, call 112.

## Lab test guides (English)

${data.tests.map((t) => `- [${t.en.name}](${SITE}${path('en', t.slug)}): ${t.en.what}`).join('\n')}

## Lab test guides (Hindi)

${data.tests.map((t) => `- [${t.hi.name}](${SITE}${path('hi', t.slug)}): ${t.hi.what}`).join('\n')}

## Links

- [Home](${SITE}/)
- [Start on WhatsApp](${WHATSAPP})
- [Privacy Notice](https://daiict218.github.io/kindred-legal/)
- Contact: ajaygaur319@gmail.com
`);

console.log(`${LANGS.length * (data.tests.length + 1)} pages, sitemap.xml, llms.txt`);
