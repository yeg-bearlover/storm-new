import { assets, looks, editorial, anima, stylingProjects, homeBiography, film, contact, routes } from './content.js';
import { legal, businessInformationMissing, privacyInformationMissing } from './legal.js';

export const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
export const normalizePath = (path) => path === '/' ? '/' : `/${path.split('/').filter(Boolean).join('/')}/`;
const imageDescriptions = {
  'about-02': 'Storm Nijhuis wearing glasses while adjusting a sculptural Hellion garment in the studio.',
  'editorial-v2-28': 'Two models in Hellion: a sculptural horned silhouette and a black tailored look with a white collar.',
  'editorial-v2-07': 'Full-length Hellion look with sculptural sleeves, a latex blouse and a fitted skirt.',
  'editorial-v2-19': 'Full-length Hellion look with a feathered headpiece and a sheer skirt with a sweeping train.',
  'editorial-v2-29': 'Two Hellion silhouettes photographed against a textured wall.',
  'presentation-8537': 'Storm Nijhuis presenting his collection book alongside the Hellion garments and models.',
  'presentation-8536': 'Storm Nijhuis speaking about his collection, with models wearing Hellion behind him.',
  'presentation-8539': 'Five models wearing Hellion at a collection presentation.',
  'presentation-8535': 'A sculptural Hellion headpiece on a table beside the collection research.',
  'presentation-8540': 'Hellion garments hanging on a rail at the collection presentation.',
  'presentation-8538': 'Two models wearing sculptural Hellion looks at a collection presentation.',
};

export function description(id) {
  if (imageDescriptions[id]) return imageDescriptions[id];
  const asset = assets.get(id);
  if (!asset) return '';
  if (asset.group === 'lookbook') {
    const n = Number(id.split('-')[1]);
    const look = looks.find((entry) => entry.images.includes(id));
    return `Hellion lookbook, ${look ? `look ${look.number}` : `archived photograph ${n}`}, ${['front', 'side', 'back', 'alternate side'][(n - 1) % 4]} view. Full garment silhouette.`;
  }
  if (asset.group.startsWith('editorial')) return `Hellion editorial photograph ${id.split('-').at(-1)}, series ${asset.group.endsWith('v1') ? 'one' : 'two'}.`;
  if (asset.group === 'anima') return `Anima Obscura, black and white fashion editorial by Storm Nijhuis and Denise Bakker, photograph ${id.split('-').at(-1)}.`;
  if (asset.group === 'styling') return `Fashion portrait from Storm Nijhuis's styling assistance with Annet Veerbeek, image ${id.split('-').at(-1)}.`;
  if (asset.group === 'film') return `Still ${id.split('-').at(-1)} from Hellion, an upcoming short fashion film.`;
  return id === 'about-01' ? 'Portrait of Storm Nijhuis.' : 'Storm Nijhuis working on the sculptural garments for Hellion in the studio.';
}

// eager: load now because it is on the first screen. priority: also fetch it first (the main image only).
export function picture(id, { eager = false, priority = eager, sizes = '(max-width: 700px) 100vw, 50vw', className = '' } = {}) {
  const asset = assets.get(id);
  if (!asset) throw new Error(`Missing asset: ${id}`);
  return `<img class="${className}" src="${asset.large.src}" srcset="${asset.small.src} ${asset.small.width}w, ${asset.medium.src} ${asset.medium.width}w, ${asset.large.src} ${asset.large.width}w" sizes="${sizes}" width="${asset.width}" height="${asset.height}" alt="${escape(description(id))}" loading="${eager ? 'eager' : 'lazy'}" ${priority ? 'fetchpriority="high"' : ''} decoding="async" />`;
}

function photo(id, options = {}) {
  return `<button class="photo-button" type="button" data-viewer="${id}" aria-label="Enlarge: ${escape(description(id))}">${picture(id, options)}</button>`;
}

function header(path) {
  const nav = [['Design', '/design/'], ['Styling', '/styling/'], ['Creative direction', '/creative-direction/'], ['About', '/about/'], ['Contact', '/contact/']];
  return `<header class="site-header ${path === '/' ? 'site-header--home' : ''}">${path === '/' ? '' : '<a class="wordmark" href="/" aria-label="Storm Nijhuis home">Storm Nijhuis</a>'}<button class="menu-button" type="button" aria-expanded="false" aria-controls="main-nav">Menu</button><nav id="main-nav" aria-label="Main navigation">${nav.map(([name, href], i) => `<a href="${href}" style="--i:${i}" ${path.startsWith(href) ? 'aria-current="page"' : ''}>${name}</a>`).join('')}</nav></header>`;
}

function footer(path) {
  const compact = path === '/contact/';
  const invitation = compact ? '' : `<div class="footer-invitation"><a href="mailto:${contact.email}">Let’s talk</a></div>`;
  const legalLinks = [['Privacy', '/privacy/'], ['Business details', '/legal/'], ['Cookies', '/cookies/'], ['Accessibility', '/accessibility/'], ['Enquiries & commissions', '/terms/']];
  return `<footer class="site-footer ${compact ? 'site-footer--compact' : ''}">${invitation}<div class="footer-bottom"><a class="wordmark" href="/">Storm Nijhuis</a><span>Amsterdam, NL</span><a href="${contact.instagram}" target="_blank" rel="noopener noreferrer">Instagram</a><a href="/contact/">Contact</a><span>© ${new Date().getUTCFullYear()} Storm Nijhuis</span><button type="button" class="top-button">Back to top</button></div><nav class="footer-legal" aria-label="Legal and accessibility">${legalLinks.map(([label, href]) => `<a href="${href}" ${path === href ? 'aria-current="page"' : ''}>${label}</a>`).join('')}</nav></footer>`;
}

function pageHeading({ eyebrow = '', title, intro = '', note = '', gothic = false, className = '' }) {
  const heading = title === 'Hellion' ? '<img class="brand-logo" src="/assets/hellion-logo.png" width="1255" height="430" alt="Hellion" />' : title;
  return `<div class="page-heading ${className}">${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}<div class="page-heading-body"><h1 class="${gothic ? 'gothic' : ''}">${heading}</h1>${intro && note ? `<div class="page-intro-group"><p class="page-intro">${intro}</p><p class="page-note">${note}</p></div>` : intro ? `<p class="page-intro">${intro}</p>` : ''}</div></div>`;
}

function projectLink({ href, image, title, label, extra = '', eager = false, priority = eager }) {
  return `<a class="project-link" href="${href}"><div class="project-image">${picture(image, { eager, priority })}</div><div class="project-caption"><div><h3 class="${title === 'Hellion' ? 'gothic' : ''}">${title}</h3><p>${label}</p></div>${extra ? `<span class="project-extra">${extra}</span>` : ''}</div></a>`;
}

// Hellion editorial portraits drawn in beneath the masthead (src/hero-ink.js). Photograph 17 is the
// Hellion cover further down, so the white-horned look 15 takes the centre here.
const heroPhotos = ['editorial-v1-01', 'editorial-v1-15', 'editorial-v1-06'];

function home() {
  return `<section class="home-hero" aria-labelledby="home-title"><div class="hero-heading"><h1 id="home-title" class="gothic">Storm Nijhuis</h1></div><div class="hero-info"><p>Fashion design · Styling · Creative direction</p><p>Amsterdam, NL <span class="small-separator">/</span> Lichting finalist</p></div><div class="hero-photos">${heroPhotos.map((id) => `<figure>${picture(id, { eager: true, sizes: '(max-width: 700px) 46vw, 31vw' })}</figure>`).join('')}</div></section>
    <section id="introduction" class="home-introduction section-pad"><div class="intro-copy reveal"><h2>The person behind the work</h2>${homeBiography.map((paragraph) => `<p>${paragraph}</p>`).join('')}<a class="text-link" href="/about/">More about me</a></div><a class="intro-portrait reveal" href="/about/" aria-label="Meet Storm">${picture('presentation-8537', { eager: true })}<span>Storm presenting Hellion</span></a></section>
    <section class="selected-work section-pad" aria-labelledby="selected-title"><div class="section-heading reveal"><h2 id="selected-title">Design</h2><a class="section-link" href="/design/">View all</a></div><div class="project-pair reveal">${projectLink({ href: '/design/hellion/', image: 'editorial-v1-17', title: 'Hellion', label: 'Collection', extra: '2026' })}${projectLink({ href: '/design/anima-obscura/', image: 'anima-08', title: 'Anima Obscura', label: 'Editorial' })}</div></section>
    <section class="styling-preview section-pad reveal"><div class="section-heading"><h2>Styling</h2><a class="section-link" href="/styling/">View all</a></div><a class="styling-strip" href="/styling/" aria-label="View the Annet Veerbeek internship gallery">${['styling-9336', 'styling-9337', 'styling-9338'].map((id) => `<div>${picture(id, { sizes: '(max-width: 700px) 72vw, 30vw' })}</div>`).join('')}</a></section>
    <section class="film-preview section-pad reveal"><div class="section-heading"><h2>Creative direction</h2><a class="section-link" href="/creative-direction/">View the film</a></div><div class="film-preview-meta"><h3 class="gothic">${film.title}</h3><div><p class="film-format">${film.format}</p><p class="eyebrow">${film.status}</p></div></div><p class="film-preview-logline">${film.logline}</p><a class="film-image" href="/creative-direction/" aria-label="Explore Hellion, a short fashion film">${picture(film.previewStill, { sizes: '100vw' })}</a></section>`;
}

function design() {
  return `${pageHeading({ title: 'Design', intro: 'Clothing as a way to explore identity. Material as a starting point.' })}<section class="design-projects section-pad"><div class="project-pair reveal">${projectLink({ href: '/design/hellion/', image: 'editorial-v2-29', title: 'Hellion', label: 'Collection · Lookbook · Editorial', extra: '2026', eager: true })}${projectLink({ href: '/design/anima-obscura/', image: 'anima-08', title: 'Anima Obscura', label: 'Fashion editorial · With Denise Bakker', eager: true, priority: false })}</div></section>`;
}

export function renderLook(index = 0) {
  const look = looks[index];
  return `<div class="look-angle-grid" data-gallery="${look.images.join(',')}">${look.images.map((id, i) => `<figure>${photo(id, { sizes: '(max-width: 700px) 72vw, 24vw' })}<figcaption><span>Look ${look.number}</span><span>${['Front', 'Side', 'Back', 'Alternate view'][i]}</span></figcaption></figure>`).join('')}</div>`;
}

// Three-column grids on desktop, two on phones.
const thirds = '(max-width: 700px) 50vw, 30vw';

function gallery(ids, className = '', { eager = false, sizes } = {}) {
  return `<div class="photo-gallery ${className}" data-gallery="${ids.join(',')}">${ids.map((id, i) => `<figure class="reveal">${photo(id, { eager: eager && i < 2, priority: eager && i === 0, ...(sizes && { sizes }) })}</figure>`).join('')}</div>`;
}

function archive(ids, heading, featuredIds = []) {
  const remaining = ids.filter((id) => !featuredIds.includes(id));
  const portraits = remaining.filter((id) => assets.get(id).width <= assets.get(id).height);
  const landscapes = remaining.filter((id) => assets.get(id).width > assets.get(id).height);
  return `<details class="archive-details"><summary><span>${heading}</span><span class="archive-count">${ids.length} ${ids.length === 1 ? 'photograph' : 'photographs'}</span><span class="archive-toggle" aria-hidden="true"></span></summary><div class="archive-body">${portraits.length ? gallery(portraits, 'archive-grid', { sizes: thirds }) : ''}${landscapes.length ? gallery(landscapes, 'landscape-grid') : ''}</div></details>`;
}

function hellion() {
  const featured = ['editorial-v1-01', 'editorial-v2-07', 'editorial-v1-07', 'editorial-v2-19', 'editorial-v2-26', 'editorial-v2-28'];
  return `${pageHeading({ title: 'Hellion', gothic: true, intro: 'A 2026 collection by Storm Nijhuis, presented at Lichting.' })}<section class="project-opening section-pad"><div class="project-opening-photo">${photo('editorial-v2-29', { eager: true })}</div><div class="project-opening-copy"><h2>They called me a sinner,<br />so I became their hellion.</h2><p>Hellion is a fashion protest and a persona. Growing up queer in a small town, I learned what it meant to be seen as different. This collection turns that judgment into a way to claim space.</p><p>Historical silhouettes, sculptural materials and religious symbolism question the line between purity and sin, softness and aggression.</p><div class="project-facts"><span>Fashion & material design</span><span>Storm Nijhuis</span><span>Presented at Lichting</span><span>2026</span></div></div></section>
    <section id="lookbook" class="lookbook section-pad"><div class="section-heading"><h2>Lookbook</h2></div><div class="lookbook-navigation"><div class="look-tabs" role="tablist" aria-label="Choose a look">${looks.map((look, i) => `<button type="button" role="tab" id="look-tab-${i}" aria-controls="look-panel" aria-selected="${i === 0}" tabindex="${i === 0 ? '0' : '-1'}" data-look="${i}">Look ${look.number}</button>`).join('')}<span class="look-indicator" aria-hidden="true"></span></div><div class="look-arrows"><button type="button" data-look-step="-1" >Previous</button><button type="button" data-look-step="1">Next</button></div></div><div id="look-panel" role="tabpanel" aria-labelledby="look-tab-0">${renderLook()}</div></section>
    <section class="editorial-section section-pad"><div class="section-heading"><h2>Editorial</h2></div>${gallery(featured)}${archive(editorial, 'Explore the complete editorial', featured)}</section>
    <section class="presentation-section section-pad reveal"><div class="section-heading"><h2>Behind the collection</h2></div><div class="presentation-layout"><div data-gallery="presentation-8536,presentation-8537">${photo('presentation-8536')}</div><div class="presentation-copy"><p>From the studio to the presentation. A look at the garments, the research and the person behind them.</p><a class="text-link" href="/about/">Meet Storm</a><div data-gallery="presentation-8535,presentation-8540,presentation-8538,presentation-8539,presentation-8537">${photo('presentation-8535', { sizes: '(max-width: 700px) 60vw, 25vw' })}</div></div></div><div class="presentation-wide" data-gallery="presentation-8539">${photo('presentation-8539', { sizes: '100vw' })}</div>${archive(['presentation-8536', 'presentation-8537', 'presentation-8535', 'presentation-8540', 'presentation-8538', 'presentation-8539'], 'More from the presentation', ['presentation-8536', 'presentation-8535', 'presentation-8539'])}</section><div class="next-project section-pad"><span class="eyebrow">Next project</span><a href="/design/anima-obscura/">Anima Obscura</a></div>`;
}

function animaPage() {
  const featured = ['anima-08', 'anima-18', 'anima-03', 'anima-13', 'anima-28', 'anima-09'];
  return `${pageHeading({ title: 'Anima<br />Obscura', intro: 'A fashion editorial exploring the hidden self, made with Denise Bakker.' })}<section class="anima-opening section-pad"><div class="anima-opening-image" data-gallery="${anima.join(',')}">${photo('anima-08', { eager: true })}</div><div class="anima-opening-copy reveal"><h2>Between a dream<br />and a nightmare.</h2><p>A fashion editorial exploring the hidden self. Inspired by Jung’s idea of the dark anima, the series moves between intimacy and estrangement, light and shadow.</p><p>Fashion design and styling by Storm Nijhuis. Concept and creative direction with Denise Bakker.</p><div class="project-facts"><span>Photography</span><span>Denise Bakker</span><span>Models</span><span>Luanda Schuster & Jakob Weissbarth</span></div></div></section><section id="anima-editorial" class="anima-story section-pad">${gallery(featured.slice(1, 3), 'anima-pair')}${gallery(featured.slice(3), 'anima-sequence')}${archive(anima, 'Explore the complete series', featured)}</section><details class="credits section-pad"><summary>Project credits</summary><dl><dt>Concept & creative direction</dt><dd>Storm Nijhuis & Denise Bakker</dd><dt>Fashion design & styling</dt><dd>Storm Nijhuis</dd><dt>Photography</dt><dd>Denise Bakker</dd><dt>Models</dt><dd>Luanda Schuster (UNS Models)<br />Jakob Weissbarth (IZAIO Models)</dd><dt>Make-up</dt><dd>Milena Lazija</dd><dt>Hair</dt><dd>Alina Tupalova</dd><dt>Set & styling assistance</dt><dd>Nora Gustafsson</dd></dl></details><div class="next-project section-pad"><span class="eyebrow">Explore more</span><a href="/styling/">Styling</a></div>`;
}

function styling() {
  const internship = stylingProjects[0];
  return `${pageHeading({ title: 'Styling', intro: 'Styling assistance during my internship with Annet Veerbeek.' })}<section class="styling-project section-pad"><div class="section-heading reveal"><h2>${internship.title}</h2><span class="muted">${internship.label}</span></div>${gallery(internship.images, 'styling-gallery', { eager: true, sizes: thirds })}</section>`;
}

function creativeDirection() {
  return `${pageHeading({ title: film.title, gothic: true, intro: film.format, note: `${film.status}. ${film.embedUrl ? 'Now available to watch.' : 'The full film will be shared after its public release.'}`, className: 'page-heading--film' })}<section class="film-project section-pad"><div class="film-summary"><p class="film-logline">${film.logline}</p></div>${film.embedUrl ? `<div class="film-player"><iframe src="${escape(film.embedUrl)}" title="Hellion, a short fashion film" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>` : `<div class="film-still" data-gallery="${film.stills.join(',')}">${photo(film.stills[0], { eager: true, sizes: '100vw' })}</div>`}<div class="film-project-description reveal"><h2>Synopsis</h2><div>${film.synopsis.map((paragraph) => `<p>${paragraph}</p>`).join('')}</div></div>${gallery(film.stills.slice(1, 3), 'film-stills-pair')}<div class="film-wide-secondary" data-gallery="${film.stills.join(',')}">${photo('film-02', { sizes: '100vw' })}</div><div class="film-concept reveal"><h2>The collection and the film</h2><div>${film.concept.map((paragraph) => `<p>${paragraph}</p>`).join('')}<a class="text-link" href="/design/hellion/">View the Hellion collection</a></div></div><h2 class="film-stills-heading">Film stills</h2>${gallery(film.stills.slice(4), 'film-stills-gallery')}</section>`;
}

function about() {
  return `${pageHeading({ title: 'Storm Nijhuis', gothic: true, intro: 'Fashion designer, stylist and creative director, based in Amsterdam.' })}<section class="about-opening section-pad"><div class="about-portrait" data-gallery="about-02,about-01">${photo('about-02', { eager: true })}</div><div class="about-biography reveal"><h2>Background</h2><p>I grew up in Zutphen, where I never quite felt like I fitted in. Making and styling clothes gave me a way to express myself.</p><p>I studied Product Design with a focus on textiles at CIBAP. Alongside sewing and material development, I worked with 3D sculpting and 3D printing. At AMFI, I explored fashion design, historical pattern cutting and the relationship between the body and the materials around it.</p><p>During an exchange at the Swedish School of Textiles, I experimented with designing from materials. At Untitled Rubber, I worked with latex clothing and construction. I still use material experimentation as a starting point for garments.</p><p>My brand Hellion looks at how we are judged and how we choose to express ourselves. The 2026 collection draws on my experience of growing up queer, using religious symbolism and exaggerated historical silhouettes.</p><a class="text-link" href="/assets/storm-nijhuis-cv.pdf" target="_blank" rel="noopener">View my CV</a></div></section><section class="experience section-pad"><div class="section-heading"><h2>Experience & education</h2></div><div class="experience-grid"><div><h3>Education</h3><dl class="experience-list"><dt>2022–2026</dt><dd>AMFI<span>Fashion Design</span></dd><dt>Exchange</dt><dd>Swedish School of Textiles<span>Material research</span></dd><dt>2018–2022</dt><dd>CIBAP<span>Product Design · Textiles</span></dd></dl></div><div><h3>Studio & styling internships</h3><ul class="studio-list"><li>Untitled Rubber<span>Design & fabrication</span></li><li>Annet Veerbeek<span>Styling assistance</span></li><li>Zyanya Keizer<span>Couture & garment construction</span></li><li>House of Useless<span>Atelier & pattern cutting</span></li><li>Liesbeth Sterkenburg<span>Atelier & pattern cutting</span></li></ul></div><div><h3>Work</h3><dl class="experience-list"><dt>2025</dt><dd>Zipper Vintage<span>Styling & visual merchandising</span></dd><dt>2022</dt><dd>H&M<span>Garment alterations & sales</span></dd><dt>2026</dt><dd>Lichting<span>Finalist</span></dd></dl><h3 class="skills-title">Working with</h3><p class="skills-copy">Pattern cutting, latex, draping, textile development, tufting, 3D sculpting and garment construction.</p></div></div></section>`;
}

function contactPage() {
  return `${pageHeading({ title: 'Let’s talk', intro: 'For fashion design, styling, creative direction and collaborations.' })}<section class="contact-page section-pad"><a class="contact-email" href="mailto:${contact.email}">${contact.email}</a><p class="contact-privacy">Read how your enquiry is handled in the <a href="/privacy/">privacy notice</a>, or see <a href="/terms/">enquiries & commissions</a>.</p><div class="contact-details"><div><span class="eyebrow">Call</span><a href="tel:${contact.telephone}">${contact.phone}</a></div><div><span class="eyebrow">Instagram</span><a href="${contact.instagram}" target="_blank" rel="noopener noreferrer">@hellion.sin</a></div><div><span class="eyebrow">Based in</span><span>Amsterdam, Netherlands</span></div><div><span class="eyebrow">Portfolio</span><a href="/assets/storm-nijhuis-cv.pdf" target="_blank" rel="noopener">View CV</a></div></div><a class="text-link" href="/legal/">Business details</a></section>`;
}

function publicationDraft(message) {
  return `<aside class="legal-status" aria-label="Publication status"><p class="eyebrow">Draft · Details to confirm</p><p>${message}</p></aside>`;
}

function informationPage({ title, intro, sections, notice = '' }) {
  const updated = new Date(`${legal.updated}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  return `${pageHeading({ title, intro, className: 'page-heading--information' })}<div class="information-page section-pad"><nav class="information-contents" aria-label="On this page"><p class="eyebrow">On this page</p>${sections.map(({ id, heading }) => `<a href="#${id}">${heading}</a>`).join('')}<p class="information-date">Last updated<br /><time datetime="${legal.updated}">${updated}</time></p></nav><div class="information-body">${notice}${sections.map(({ id, heading, body }) => `<section class="information-section" id="${id}" aria-labelledby="${id}-title"><h2 id="${id}-title">${heading}</h2>${body}</section>`).join('')}</div></div>`;
}

function privacyPage() {
  const privacy = legal.privacy;
  const sections = [
    { id: 'responsible', heading: 'Who is responsible', body: `<p>${escape(legal.controllerName)}, based in Amsterdam, Netherlands, is responsible for the personal data handled through this portfolio and its enquiries. For privacy questions or requests, email <a href="mailto:${contact.email}">${contact.email}</a>. Business identification information is on the <a href="/legal/">business details page</a>.</p>` },
    { id: 'data', heading: 'Information handled', body: '<p>When you email or call, the information you provide may include your name, email address, telephone number, organisation, project brief, messages and attachments.</p><p>When you visit, Vercel processes technical information needed to deliver and protect the website. This may include your IP address, requested URL, request time, browser or device information, and security or error information.</p><p>You can browse without submitting an enquiry. Contact details and a project brief are needed to respond meaningfully or prepare a commission; information that is not relevant to your enquiry is optional.</p>' },
    { id: 'purposes', heading: 'Why information is used', body: '<ul><li><strong>Requested quotes and commissions:</strong> to take steps at your request before entering a contract, or to perform an agreed contract (GDPR Article 6(1)(b)).</li><li><strong>Other enquiries and collaborations:</strong> the legitimate interest in responding to correspondence and organising professional work (Article 6(1)(f)).</li><li><strong>Website delivery and security:</strong> the legitimate interest in providing a reliable website and preventing misuse (Article 6(1)(f)).</li><li><strong>Records required by law:</strong> compliance with applicable legal obligations, such as tax and accounting requirements, where relevant (Article 6(1)(c)).</li></ul><p>The website does not use visitor profiling or automated decisions that produce legal or similarly significant effects.</p>' },
    { id: 'providers', heading: 'Service providers', body: '<ul><li><strong>Vercel:</strong> hosts and delivers the website and handles technical requests and security information. See <a href="https://vercel.com/legal/privacy-notice" target="_blank" rel="noopener noreferrer">Vercel’s privacy notice</a> and <a href="https://vercel.com/legal/dpa" target="_blank" rel="noopener noreferrer">data processing addendum</a>.</li><li><strong>Google / Gmail:</strong> provides the mailbox used for email enquiries and processes message contents, attachments and email metadata. See <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google’s privacy policy</a>.</li><li><strong>GitHub:</strong> maintains the website’s source repository and supports deployment to Vercel. This website does not send enquiry messages to GitHub or load its images and fonts from GitHub. See <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">GitHub’s privacy statement</a>.</li></ul><p>Information may also need to be disclosed to professional advisers or public authorities where required for a commission or by law. Information about any additional recipients involved in a commission should be supplied before sharing personal data with them.</p>' },
    { id: 'transfers', heading: 'International processing', body: `<p>Vercel and Google operate internationally, so personal data may be processed outside the European Economic Area, including in the United States.</p><p>${privacy.transferSafeguards ? escape(privacy.transferSafeguards) : 'The applicable transfer arrangements for the hosting and email accounts, and how to obtain a copy of the safeguards, are being confirmed.'}</p><p>Contact <a href="mailto:${contact.email}">${contact.email}</a> for information about the safeguards relevant to your data.</p>` },
    { id: 'retention', heading: 'How long information is kept', body: `<dl class="legal-facts"><dt>Enquiry correspondence</dt><dd>${privacy.enquiryRetention ? escape(privacy.enquiryRetention) : 'The retention period for enquiries that do not become commissions is being confirmed.'}</dd><dt>Hosting and security logs</dt><dd>${privacy.hostingLogRetention ? escape(privacy.hostingLogRetention) : 'The retention periods applicable to the Vercel project and its enabled logging features are being confirmed.'}</dd><dt>Commission records</dt><dd>For the duration needed to perform the commission and deal with relevant claims, subject to applicable legal retention obligations.</dd><dt>Accounting records</dt><dd>For the applicable statutory retention period where tax and accounting obligations require it.</dd></dl>` },
    { id: 'rights', heading: 'Your privacy rights', body: `<p>Depending on the circumstances, you may request access, correction, deletion, restriction of processing or a portable copy of your data. You may object to processing based on legitimate interests. Where processing relies on consent, you may withdraw it without affecting the lawfulness of earlier processing.</p><p>Email <a href="mailto:${contact.email}?subject=Privacy%20request">${contact.email}</a> with your request. Only information necessary to verify your identity should be requested. Requests are normally answered within one month; if a lawful extension is needed, you will be informed.</p><p>You may lodge a complaint with the <a href="https://autoriteitpersoonsgegevens.nl/" target="_blank" rel="noopener noreferrer">Autoriteit Persoonsgegevens</a>, or with the competent data protection authority in your country.</p>` },
    { id: 'external-services', heading: 'Cookies and external links', body: '<p>The portfolio’s images and fonts are served from this website. Its current pages do not use analytics, advertising trackers, embedded social feeds or third-party video players. See the <a href="/cookies/">cookie information</a> for browser storage and hosting security features.</p><p>Following the Instagram link takes you to a separate service whose own privacy and cookie policies apply. Instagram is not embedded in this website.</p>' },
    { id: 'updates', heading: 'Updates to this notice', body: '<p>This notice will be updated when the website or the way personal data is handled changes. The date above identifies the latest revision.</p>' },
  ];
  return informationPage({ title: 'Privacy', intro: 'How personal data is handled when you visit the portfolio or get in touch.', sections, notice: privacyInformationMissing() ? publicationDraft('Enquiry retention, hosting-log retention, international-transfer arrangements and the deployed site’s privacy settings still need confirmation before this notice is final.') : '' });
}

function businessDetailsPage() {
  const business = legal.business;
  const pending = '<span class="legal-pending">To be confirmed</span>';
  const value = (detail) => detail ? escape(detail).replace(/\n/g, '<br />') : pending;
  return informationPage({ title: 'Business details', intro: 'Who you are contacting for fashion design, styling and creative direction.', notice: businessInformationMissing() ? publicationDraft('The registered business name, address and registration details are being confirmed. This page is a draft until the applicable details are complete.') : '', sections: [
    { id: 'identity', heading: 'Business identification', body: `<dl class="legal-facts"><dt>Contact person</dt><dd>${escape(legal.controllerName)}</dd><dt>Registered business name</dt><dd>${value(business.registeredName)}</dd><dt>Trading name</dt><dd>${value(business.tradingName)}</dd><dt>Business address</dt><dd>${business.address ? value(business.address) : business.addressShielded === true ? 'The visiting address is shielded in the Dutch Business Register.' : pending}</dd><dt>KVK number</dt><dd>${value(business.kvkNumber)}</dd><dt>VAT identification number</dt><dd>${business.vatApplicable === false ? 'Not applicable.' : value(business.vatId)}</dd></dl>` },
    { id: 'business-contact', heading: 'Contact', body: `<dl class="legal-facts"><dt>Email</dt><dd><a href="mailto:${contact.email}">${contact.email}</a></dd><dt>Telephone</dt><dd><a href="tel:${contact.telephone}">${contact.phone}</a></dd><dt>Based in</dt><dd>Amsterdam, Netherlands</dd></dl><p>For a question about a commission or a complaint, email Storm with the relevant project details so it can be discussed directly.</p>` },
    { id: 'portfolio', heading: 'Portfolio and commissions', body: '<p>This website presents selected work. It has no checkout or online ordering system. A message is an enquiry; any commission needs a separate agreement. Read <a href="/terms/">enquiries & commissions</a> for the information needed before proceeding.</p>' },
    { id: 'other-information', heading: 'Related information', body: '<p>See the <a href="/privacy/">privacy notice</a>, <a href="/cookies/">cookie information</a> and <a href="/accessibility/">accessibility information</a>.</p>' },
  ] });
}

function cookiesPage() {
  return informationPage({ title: 'Cookies', intro: 'The current portfolio keeps browser storage and external services to a minimum.', notice: legal.deploymentPrivacyVerified ? '' : publicationDraft('The portfolio itself does not set cookies or track visitors. The live Vercel project’s security features and any additional scripts still need to be checked before this statement is final.'), sections: [
    { id: 'current-use', heading: 'Current website', body: '<p>The portfolio code does not set cookies or store information in local storage or session storage. It does not include analytics, advertising pixels or embedded social feeds. Images, the display font and downloadable CV are served from this website.</p><p>There are currently no optional cookie categories to accept or reject, so no cookie-consent banner is shown.</p>' },
    { id: 'hosting-security', heading: 'Hosting and security', body: '<p>Vercel delivers the website and handles technical requests. Hosting security features may use strictly necessary cookies or device checks, for example when a request triggers a security challenge. Their exact use and retention depend on the live project settings.</p><p>Technical processing and service providers are described in the <a href="/privacy/">privacy notice</a>.</p>' },
    { id: 'third-parties', heading: 'External services', body: '<p>Instagram is an ordinary link, not an embedded feed. Its cookies and privacy practices apply after you open Instagram. The film currently uses locally served stills and has no embedded player.</p><p>If optional analytics, tracking or a consent-requiring video player is added, this page must be updated and the relevant service must remain blocked until you choose to allow it. You must be able to reject it and withdraw consent as easily as you give it.</p>' },
    { id: 'browser-controls', heading: 'Your browser controls', body: `<p>You can inspect, delete or block cookies in your browser settings. Blocking storage required by a hosting security challenge may affect access to the website.</p><p>For questions about privacy or cookies, email <a href="mailto:${contact.email}">${contact.email}</a>.</p>` },
  ] });
}

function accessibilityPage() {
  return informationPage({ title: 'Accessibility', intro: 'Ways to browse the work, use the galleries and get help with the portfolio.', sections: [
    { id: 'approach', heading: 'Accessibility approach', body: '<p>The portfolio aims to be usable with a keyboard, screen reader, magnification and reduced-motion settings. WCAG 2.2 level AA is the target for ongoing improvements. This page describes the features provided; it is not a claim of independently audited conformance.</p>' },
    { id: 'features', heading: 'Features provided', body: '<ul><li>A “Skip to content” link and labelled navigation.</li><li>Semantic page headings, text alternatives for images and visible keyboard focus.</li><li>A layout that adapts to smaller screens and enlarged text.</li><li>Support for the reduced-motion preference in your operating system.</li><li>Keyboard controls for lookbook tabs and the full-screen photograph viewer.</li></ul>' },
    { id: 'keyboard', heading: 'Keyboard controls', body: '<dl class="legal-facts"><dt>Move between controls</dt><dd>Use Tab and Shift + Tab. Activate a link with Enter, or a button with Enter or Space.</dd><dt>Lookbook tabs</dt><dd>Use the left and right arrow keys to change looks. Home selects the first look; End selects the last.</dd><dt>Photograph viewer</dt><dd>Use the left and right arrow keys to browse and Escape to close. Focus returns to the photograph you opened.</dd><dt>Mobile navigation</dt><dd>Activate Menu to open the navigation. Escape closes it and returns focus to the Menu button.</dd></dl>' },
    { id: 'limitations', heading: 'Known limitations', body: '<p>Some archive image descriptions identify the project and photograph number rather than describing every garment or visual detail. The downloadable PDF CV has not been independently assessed for accessibility.</p><p>If a photograph description or the CV does not give you the information you need, contact Storm for help or an alternative text format.</p>' },
    { id: 'accessibility-help', heading: 'Help and feedback', body: `<p>Email <a href="mailto:${contact.email}?subject=Website%20accessibility">${contact.email}</a> or call <a href="tel:${contact.telephone}">${contact.phone}</a>. Please describe the page or control that caused difficulty and, if useful, the browser or assistive technology you use. Only share information needed to explain the issue.</p>` },
  ] });
}

function termsPage() {
  return informationPage({ title: 'Enquiries & commissions', intro: 'What to discuss before working together on fashion design, styling or creative direction.', sections: [
    { id: 'enquiring', heading: 'Making an enquiry', body: `<p>Contact <a href="mailto:${contact.email}">${contact.email}</a> with the kind of work you have in mind, your preferred dates and any relevant project details. Sending an enquiry does not place an order or create a payment obligation.</p><p>How your correspondence is handled is explained in the <a href="/privacy/">privacy notice</a>.</p>` },
    { id: 'agreement', heading: 'Before a commission starts', body: '<p>A commission needs a separate written agreement. Before accepting it, the agreement should specify:</p><ul><li>The scope of work, deliverables, revisions and any usage rights.</li><li>The total price, applicable VAT and any additional expenses.</li><li>The schedule, delivery method and payment arrangements.</li><li>The cancellation arrangements and how questions or complaints will be handled.</li><li>Any consumer information and withdrawal rights that apply to the particular order.</li></ul><p>The portfolio does not currently offer online ordering or accept payments.</p>' },
    { id: 'consumer-rights', heading: 'Consumer cancellation rights', body: '<p>If you enter a consumer contract at a distance, including by email, statutory withdrawal rights may apply. Where applicable, the usual withdrawal period is 14 days, starting from delivery for goods or the agreement date for services.</p><p>Legal exceptions can apply, including goods made to your specifications or clearly personalised. A request to start services during the withdrawal period needs the appropriate information and express request; completing a service does not automatically remove your rights.</p><p>Before an order is accepted, the information specific to that order, including the applicable withdrawal instructions and model form where required, must be provided. Nothing on this page limits mandatory consumer rights.</p><p>See the <a href="https://europa.eu/youreurope/citizens/consumers/shopping/returns/index_en.htm" target="_blank" rel="noopener noreferrer">EU information on returns and withdrawal rights</a>.</p>' },
    { id: 'commission-questions', heading: 'Questions and complaints', body: `<p>For a question about proposed work or an existing commission, email <a href="mailto:${contact.email}">${contact.email}</a> with the relevant project details. Business identification information is on the <a href="/legal/">business details page</a>.</p>` },
  ] });
}

function notFound() {
  return `${pageHeading({ title: 'Page not found' })}<div class="section-pad"><a class="text-link" href="/">Back to the homepage</a></div>`;
}

const pages = { '/': home, '/design/': design, '/design/hellion/': hellion, '/design/anima-obscura/': animaPage, '/styling/': styling, '/creative-direction/': creativeDirection, '/about/': about, '/contact/': contactPage, '/privacy/': privacyPage, '/legal/': businessDetailsPage, '/cookies/': cookiesPage, '/accessibility/': accessibilityPage, '/terms/': termsPage };

export function renderPage(path) {
  const normalized = normalizePath(path);
  return `${header(normalized)}<main id="main" data-route="${normalized}" tabindex="-1">${(pages[normalized] || notFound)()}</main>${footer(normalized)}<dialog class="image-viewer" aria-label="Full screen photograph viewer"><div class="viewer-toolbar"><span data-viewer-title></span><button type="button" data-viewer-close aria-label="Close photograph viewer">Close</button></div><div class="viewer-stage"><img data-viewer-image alt="" draggable="false" /></div><div class="viewer-bottom"><span data-viewer-counter aria-live="polite"></span><span class="viewer-steps"><button type="button" data-viewer-step="-1" aria-label="Previous photograph">Previous</button><button type="button" data-viewer-step="1" aria-label="Next photograph">Next</button></span></div></dialog>`;
}

export function pageMeta(path) {
  const meta = routes[normalizePath(path)] || { title: 'Page not found', description: 'Explore the portfolio of Storm Nijhuis.' };
  return { ...meta, title: path === '/' ? 'Storm Nijhuis — Fashion Design, Styling & Creative Direction' : `${meta.title} — Storm Nijhuis` };
}
