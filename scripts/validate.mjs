import assert from 'node:assert/strict';
import { readFile, access, readdir } from 'node:fs/promises';
import { assets, group, looks, lookbook, editorial, anima, stylingProjects, film, routes } from '../src/content.js';
import { renderPage, pageMeta, description } from '../src/templates.js';

assert.equal(lookbook.length, 28, 'Keep four views of each of the seven selected looks.');
assert.deepEqual(looks.map((look) => look.number), ['01', '02', '03', '04', '05', '06', '07'], 'Number the seven selected looks consecutively.');
assert.deepEqual(looks.map((look) => look.sourceNumber), ['01', '02', '03', '04', '05', '07', '09'], 'Keep the selected photograph sets unchanged when renumbering.');
assert(looks.every((look) => look.images.length === 4), 'Every supplied look has four views.');
for (const look of looks) for (const id of look.images) assert(description(id).includes(`look ${look.number},`), 'Viewer descriptions must use the displayed look number.');
assert.deepEqual(looks.flatMap((look) => look.images), lookbook);
assert.equal(editorial.length, 45);
assert.equal(anima.length, 28);
assert.equal(stylingProjects.flatMap((project) => project.images).length, 15);
assert.equal(new Set(stylingProjects.flatMap((project) => project.images)).size, 15);
assert.equal(stylingProjects.length, 1, 'Present the Annet Veerbeek internship as one gallery.');
assert.equal(film.stills.length, 13);
assert.deepEqual([...film.stills].sort(), group('film').sort(), 'Include every supplied film still once.');
assert.equal(film.embedUrl, null, 'Keep unreleased film playback disabled.');

const home = renderPage('/');
assert(home.includes('/assets/film-01-large.webp'), 'Use the pomegranate dinner-table still for the homepage film preview.');
const homeHero = home.match(/<section class="home-hero"[\s\S]*?<\/section>/)[0];
assert.equal((homeHero.match(/<img/g) || []).length, 3, 'Three Hellion editorial photographs beneath the masthead.');
assert(!homeHero.includes('editorial-v1-17'), 'Keep photograph 17 for the Hellion cover, not the masthead.');
assert(!home.match(/<header[\s\S]*?<\/header>/)[0].includes('Storm Nijhuis'), 'Keep the large homepage name without a second header wordmark.');
assert(home.includes('/assets/editorial-v1-17-large.webp'), 'Use the chosen horned editorial photograph 17.');
for (const id of ['9336', '9337', '9338']) assert(home.includes(`/assets/styling-${id}-large.webp`));
assert(!home.includes('/assets/styling-9403'), 'Use the selected internship photographs in the homepage preview.');
const filmPage = renderPage('/creative-direction/');
assert.equal(film.stills[2], 'film-08', 'Use the standing model in still 8 beneath the synopsis.');
assert(filmPage.includes('A short fashion film') && filmPage.includes('Upcoming'), 'Identify the film and its release status immediately.');
assert(!/\/assets\/(about|presentation)-/.test(filmPage), 'The film page uses only film stills.');
const about = renderPage('/about/');
assert(!about.includes('studio-section'), 'Keep the removed studio section out of About.');
assert(about.includes('/assets/about-02-large.webp') && !about.includes('/assets/presentation-8537'), 'Use the studio portrait on About.');
const contactPage = renderPage('/contact/');
assert.equal((contactPage.match(/Let’s talk/g) || []).length, 1, 'Show one invitation on Contact.');
assert(!contactPage.includes('footer-invitation'), 'Remove the repeat Contact footer invitation.');

for (const asset of assets.values()) {
  for (const size of ['large', 'medium', 'small']) {
    await access(`public${asset[size].src}`);
    const ratio = asset.width / asset.height;
    assert(Math.abs(asset[size].width / asset[size].height - ratio) < 0.007, `Changed aspect ratio: ${asset.id}`);
  }
}

const links = new Set();
for (const path of Object.keys(routes)) {
  const html = renderPage(path);
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `One main heading: ${path}`);
  assert(html.includes(`data-route="${path}"`));
  assert(pageMeta(path).description.length > 40);
  assert(!/graduation collection/i.test(html), 'Use the Hellion collection title.');
  assert(!/<video|<iframe/i.test(html), 'No prerelease movie or reels.');
  assert(!/In the details|Another perspective|Always making|to understand them|Colour studies|A collection brought|The work starts here/.test(html), 'Remove the rejected headings and styling categories.');
  for (const match of html.matchAll(/data-viewer="([^"]+)"/g)) assert(assets.has(match[1]));
  for (const match of html.matchAll(/href="(\/[^"#]*)/g)) links.add(match[1]);
}
for (const link of links) {
  if (link.startsWith('/assets/')) await access(`public${link}`);
  else assert(link in routes, `Invalid internal link: ${link}`);
}
for (const file of await readdir('public/assets')) assert(!/\.(mp4|mov|pptx|tif)$/i.test(file), `Private source exposed: ${file}`);
const css = await readFile('src/styles.css', 'utf8');
assert(!/filter\s*:|object-fit\s*:\s*cover/i.test(css), 'Preserve photo colours and full frames.');
assert(css.includes('prefers-reduced-motion'));
console.log(`Content checks passed: ${Object.keys(routes).length} routes, ${assets.size} images, selected lookbook and complete archives, valid links, no unreleased footage.`);
