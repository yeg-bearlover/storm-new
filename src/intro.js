// Opening: a contact sheet of the Hellion lookbook. Each look's four views play in order,
// so the model turns on the spot, while the count runs up to the full archive. The sheet then lifts
// like a curtain and hands over to the page (on the homepage, to the ink masthead).
// It plays on every full page load, any input skips it, and it never plays with reduced motion.
import { assets, looks } from './content.js';

// Displayed looks 01, 03, 05, 07, ending on the white-horned look 06 (the masthead's centre photograph).
const SEQUENCE = ['01', '03', '05', '07', '06'];
const VIEWS = ['Front', 'Side', 'Back', 'Side'];
const FRAME_MS = 75;
const HOLD_MS = 380;
// Never keep the page waiting on slow photographs for longer than this.
const MAX_MS = 3400;

export function playIntro() {
  const root = document.documentElement;
  const sheet = document.querySelector('.intro');
  if (!sheet || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('intro-skip');
    sheet?.remove();
    return null;
  }

  const frames = SEQUENCE.flatMap((number) => looks.find((look) => look.number === number).images.map((id, view) => ({ id, number, view })));
  // The last look completes its turn and comes to rest facing forward.
  frames.push(frames.at(-4));
  sheet.innerHTML = `<div class="intro-frame">${frames.map(({ id }) => {
    const { small } = assets.get(id);
    return `<img src="${small.src}" width="${small.width}" height="${small.height}" alt="" decoding="async" fetchpriority="high" />`;
  }).join('')}</div>
    <p class="intro-mark wordmark">Storm Nijhuis</p>
    <p class="intro-meta">Hellion lookbook, 2026</p>
    <p class="intro-count">000</p>
    <p class="intro-caption"></p>`;
  const images = [...sheet.querySelectorAll('img')];
  const count = sheet.querySelector('.intro-count');
  const caption = sheet.querySelector('.intro-caption');
  const app = document.querySelector('#app');
  root.classList.add('intro-active');
  app.inert = true;

  return new Promise((resolve) => {
    const start = performance.now();
    let index = -1;
    let next = start + 260;
    let frameId = 0;
    let done = false;

    const leave = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(frameId);
      removeEventListener('pointerdown', leave);
      removeEventListener('keydown', leave);
      removeEventListener('wheel', leave);
      removeEventListener('touchmove', leave);
      sheet.classList.add('is-leaving');
      root.classList.remove('intro-active');
      app.inert = false;
      resolve();
      const remove = () => sheet.remove();
      sheet.addEventListener('transitionend', (event) => { if (event.target === sheet) remove(); });
      setTimeout(remove, 1200);
    };

    const tick = (now) => {
      frameId = requestAnimationFrame(tick);
      if (now - start > MAX_MS) return leave();
      if (now < next) return;
      const following = index + 1;
      if (following === frames.length) return leave();
      const image = images[following];
      // Wait for the photograph rather than flash an empty frame.
      if (!image.complete || !image.naturalWidth) return;
      images[index]?.removeAttribute('data-on');
      image.setAttribute('data-on', '');
      index = following;
      const { number, view } = frames[index];
      count.textContent = String(Math.round(((index + 1) / frames.length) * assets.size)).padStart(3, '0');
      caption.textContent = `Look ${number} · ${VIEWS[view]}`;
      next = now + (index === frames.length - 1 ? HOLD_MS : FRAME_MS);
    };
    frameId = requestAnimationFrame(tick);

    addEventListener('pointerdown', leave);
    addEventListener('keydown', leave);
    addEventListener('wheel', leave, { passive: true });
    addEventListener('touchmove', leave, { passive: true });
  });
}
