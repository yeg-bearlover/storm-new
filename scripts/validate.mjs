import assert from 'node:assert/strict';
import { readFile, access, readdir } from 'node:fs/promises';
import { assets, group, looks, lookbook, editorial, anima, binhe, stylingProjects, film, routes } from '../src/content.js';
import { renderPage, pageMeta, description } from '../src/templates.js';

assert.equal(lookbook.length, 28, 'Keep four views of each of the seven selected looks.');
assert.deepEqual(looks.map((look) => look.number), ['01', '02', '03', '04', '05', '06', '07'], 'Number the seven selected looks consecutively.');
assert.deepEqual(looks.map((look) => look.sourceNumber), ['01', '02', '03', '04', '05', '07', '09'], 'Keep the selected photograph sets unchanged when renumbering.');
assert(looks.every((look) => look.images.length === 4), 'Every supplied look has four views.');
for (const look of looks) for (const id of look.images) assert(description(id).includes(`look ${look.number},`), 'Viewer descriptions must use the displayed look number.');
assert.deepEqual(looks.flatMap((look) => look.images), lookbook);
assert.equal(editorial.length, 45);
assert.equal(anima.length, 28);
assert.equal(stylingProjects.flatMap((project) => project.images).length, 29);
assert.equal(new Set(stylingProjects.flatMap((project) => project.images)).size, 29);
assert.equal(stylingProjects.length, 3, 'Keep each styling project together.');
assert.deepEqual(stylingProjects[0].images, group('styling'), 'Keep all 15 original internship photographs.');
for (const [index, name, count] of [[1, 'divine-feminine', 10], [2, 'styling-assistance', 4]]) {
  assert.equal(stylingProjects[index].images.length, count);
  assert.deepEqual([...stylingProjects[index].images].sort(), group(name).sort());
}
assert.equal(assets.get(stylingProjects[1].cover).source, 'Styling/WhatsApp Image 2026-10-20 at 11.47.12 (4).jpeg');
assert.equal(assets.get(stylingProjects[2].cover).source, 'Styling/WhatsApp Image 2026-10-20 at 11.51.56 (3).jpeg');
assert.equal(assets.get(binhe.cover).source, 'Styling/WhatsApp Image 2026-10-20 at 11.59.17 (6).jpeg');
assert.equal(binhe.images.length, 16);
assert.deepEqual([...binhe.images].sort(), group('binhe').sort(), 'Include every Binhe photograph once.');
assert.equal(film.stills.length, 13);
assert.deepEqual([...film.stills].sort(), group('film').sort(), 'Include every supplied film still once.');
assert.equal(film.embedUrl, null, 'Keep unreleased film playback disabled.');

const home = renderPage('/');
assert(home.includes('/assets/film-01-large.webp'), 'Use the pomegranate dinner-table still for the homepage film preview.');
assert(!/<img/.test(home.match(/<section class="home-hero"[\s\S]*?<\/section>/)[0]), 'Go straight from the masthead into the biography.');
assert(!home.match(/<header[\s\S]*?<\/header>/)[0].includes('Storm Nijhuis'), 'Keep the large homepage name without a second header wordmark.');
assert(home.includes('/assets/editorial-v1-17-large.webp'), 'Use the chosen horned editorial photograph 17.');
for (const project of stylingProjects) {
  assert(home.includes(assets.get(project.cover).large.src), 'Use the selected cover from each styling shoot.');
  assert(home.includes(`href="/styling/#${project.id}"`), 'Link each homepage styling photograph to its own project.');
}
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
const stylingPage = renderPage('/styling/');
for (const project of stylingProjects) {
  assert(stylingPage.includes(`id="${project.id}"`), 'Keep project anchor destinations available.');
  for (const id of project.images) assert.equal((stylingPage.match(new RegExp(`data-viewer="${id}"`, 'g')) || []).length, 1, `Display styling photograph once: ${id}`);
  for (const [, credit] of project.credits) assert(stylingPage.includes(credit));
}
const binhePage = renderPage('/design/binhe/');
assert(binhePage.includes('Design assistance &amp; product design for Zyanya Keizer'), 'State Storm’s supporting design role.');
for (const id of binhe.images) assert.equal((binhePage.match(new RegExp(`data-viewer="${id}"`, 'g')) || []).length, 1, `Display Binhe photograph once: ${id}`);
for (const [, credit] of binhe.credits) assert(binhePage.includes(credit));
for (const path of ['/', '/design/']) assert(renderPage(path).includes('href="/design/binhe/"'), 'Include Binhe in both design selections.');

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
  assert(!html.includes('footer-invitation'), 'Keep the invitation out of every page footer.');
  if (path !== '/contact/') assert(!html.includes('Let’s talk'), 'Keep Let’s talk on Contact only.');
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
