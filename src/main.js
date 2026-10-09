import './styles.css';
import { assets, looks } from './content.js';
import { renderPage, renderLook, normalizePath, pageMeta, description } from './templates.js';
import { createSpring, project, rubberband } from './spring.js';
import { playIntro } from './intro.js';

const app = document.querySelector('#app');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const easeOut = 'cubic-bezier(0.23, 1, 0.32, 1)';
// Space between neighbouring photographs while they slide.
const PHOTO_GAP = 24;
let dispose = () => {};
let firstBind = true;
// The opening contact sheet, on every full page load; null when it is not playing.
const intro = playIntro();

function setMetadata(path) {
  const meta = pageMeta(path);
  document.title = meta.title;
  document.querySelector('meta[name="description"]').content = meta.description;
  document.querySelector('meta[property="og:title"]').content = meta.title;
  document.querySelector('meta[property="og:description"]').content = meta.description;
}

// The visible box of an object-fit: contain image, which is smaller than the element itself.
function containedRect(element, asset) {
  const box = element.getBoundingClientRect();
  const ratio = asset.width / asset.height;
  let width = box.width;
  let height = width / ratio;
  if (height > box.height) { height = box.height; width = height * ratio; }
  return { left: box.left + (box.width - width) / 2, top: box.top + (box.height - height) / 2, width, height };
}

function bindPage() {
  dispose();
  const controller = new AbortController();
  const { signal } = controller;
  const listen = (target, event, handler, options = {}) => target.addEventListener(event, handler, { ...options, signal });
  const motion = () => !reducedMotion.matches;
  let revealObserver;
  let headerFrame;
  let activeLook = 0;
  let viewerIds = [];
  let viewerIndex = 0;
  let viewerTrigger;
  let drag = null;
  const dialog = app.querySelector('.image-viewer');
  const viewerImage = dialog.querySelector('[data-viewer-image]');
  const header = app.querySelector('.site-header');
  const menuButton = app.querySelector('.menu-button');
  const nav = app.querySelector('#main-nav');

  if ('IntersectionObserver' in window && motion()) {
    document.documentElement.classList.add('js-motion');
    revealObserver = new IntersectionObserver((entries) => {
      // Elements that enter together cascade in, a beat apart.
      let order = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.style.transitionDelay = `${Math.min(order++, 5) * 70}ms`;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -6% 0px' });
    // Pre-rendered content already on screen at first load stays put; only what is below the fold reveals.
    const onScreen = (element) => firstBind && element.getBoundingClientRect().top < innerHeight;
    app.querySelectorAll('.reveal').forEach((element) => {
      if (onScreen(element)) element.classList.add('is-visible');
      else revealObserver.observe(element);
    });
    app.querySelectorAll('main img').forEach((img) => { if (!onScreen(img)) fadeInWhenLoaded(img); });
  } else {
    document.documentElement.classList.remove('js-motion');
  }
  // The ink masthead entrance belongs to the first visit only (src/hero-ink.js, loaded on demand).
  let disposeInk = () => {};
  const hero = app.querySelector('.home-hero');
  if (hero && firstBind && motion() && !document.documentElement.classList.contains('is-navigated')) {
    import('./hero-ink.js')
      .then(({ mountInk }) => { if (!signal.aborted) disposeInk = mountInk(hero, { gate: intro }); })
      .catch(() => document.documentElement.classList.add('ink-off'));
  }
  firstBind = false;

  function fadeInWhenLoaded(img) {
    if (img.complete) return;
    img.classList.add('is-loading');
    const done = () => img.classList.remove('is-loading');
    img.addEventListener('load', done, { once: true, signal });
    img.addEventListener('error', done, { once: true, signal });
  }

  function setMenu(open, { focus = false, instant = false } = {}) {
    nav.classList.toggle('is-instant', instant || !motion());
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.textContent = open ? 'Close' : 'Menu';
    nav.classList.toggle('is-open', open);
    if (open) header.classList.remove('is-hidden');
    if (focus) menuButton.focus();
  }

  // Header steps aside while reading down the page and returns on the way back up.
  let lastScroll = scrollY;
  function updateHeader() {
    const y = scrollY;
    const delta = y - lastScroll;
    if (y < 160 || menuButton.getAttribute('aria-expanded') === 'true' || header.querySelector(':focus-visible')) {
      header.classList.remove('is-hidden');
      lastScroll = y;
    } else if (Math.abs(delta) > 8) {
      header.classList.toggle('is-hidden', delta > 0);
      lastScroll = y;
    }
  }
  listen(window, 'scroll', () => { cancelAnimationFrame(headerFrame); headerFrame = requestAnimationFrame(updateHeader); }, { passive: true });
  listen(header, 'focusin', () => header.classList.remove('is-hidden'));

  const tabList = app.querySelector('.look-tabs');
  const indicator = tabList?.querySelector('.look-indicator');
  function moveIndicator(instant) {
    if (!indicator) return;
    const tab = tabList.querySelectorAll('[data-look]')[activeLook];
    indicator.classList.toggle('is-instant', instant);
    indicator.style.transform = `translateX(${tab.offsetLeft}px) scaleX(${tab.offsetWidth / 100})`;
  }
  if (indicator) {
    tabList.classList.add('has-indicator');
    moveIndicator(true);
    listen(window, 'resize', () => moveIndicator(true), { passive: true });
  }

  // Keyboard changes are instant; pointer changes get a short, staggered settle.
  function selectLook(index, { focus = false, keyboard = false } = {}) {
    activeLook = (index + looks.length) % looks.length;
    const tabs = app.querySelectorAll('[data-look]');
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === activeLook));
      tab.tabIndex = i === activeLook ? 0 : -1;
    });
    const selected = tabs[activeLook];
    const panel = app.querySelector('#look-panel');
    panel.innerHTML = renderLook(activeLook);
    panel.setAttribute('aria-labelledby', selected.id);
    selected.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
    if (focus) selected.focus({ preventScroll: true });
    const animate = !keyboard && motion();
    moveIndicator(!animate);
    if (!motion()) return;
    panel.querySelectorAll('img').forEach(fadeInWhenLoaded);
    if (animate) {
      panel.querySelectorAll('figure').forEach((figure, i) => figure.animate(
        [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }],
        { duration: 240, delay: i * 30, easing: easeOut, fill: 'backwards' },
      ));
    }
  }

  function showViewerImage(placeholder) {
    const id = viewerIds[viewerIndex];
    const asset = assets.get(id);
    viewerImage.src = asset.large.src;
    // Show the already-loaded thumbnail until the large file is ready.
    if (placeholder && placeholder !== asset.large.src) {
      const full = new Image();
      full.src = asset.large.src;
      if (!full.complete) {
        viewerImage.src = placeholder;
        full.decode().catch(() => {}).then(() => { if (viewerIds[viewerIndex] === id && dialog.open) swapToFull(asset.large.src); });
      }
    }
    viewerImage.alt = description(id);
    viewerImage.width = asset.width;
    viewerImage.height = asset.height;
    dialog.querySelector('[data-viewer-title]').textContent = description(id);
    dialog.querySelector('[data-viewer-counter]').textContent = `${String(viewerIndex + 1).padStart(2, '0')} / ${String(viewerIds.length).padStart(2, '0')}`;
    dialog.querySelector('[data-viewer-step="-1"]').disabled = viewerIds.length < 2;
    dialog.querySelector('[data-viewer-step="1"]').disabled = viewerIds.length < 2;
    // Preload only the next photograph, never the entire archive.
    if (viewerIds.length > 1) {
      const next = new Image();
      next.src = assets.get(viewerIds[(viewerIndex + 1) % viewerIds.length]).large.src;
    }
  }

  // The viewer photograph's pose: position and scale, each on its own spring so motion is interruptible
  // and picks up from wherever it is on screen. A finger drives x/y directly; springs take over on release.
  const pose = { x: createSpring(0), y: createSpring(0), s: createSpring(1, 0.001) };
  let poseFrame = 0;
  let lastTick = 0;
  let outgoing = null; // { layer, offset }: the previous photograph sliding away beside the current one
  const moving = () => Boolean(poseFrame || drag);

  function renderPose() {
    const x = pose.x.value;
    const y = pose.y.value;
    // Pulling down shrinks the photograph slightly, a hint that letting go will close it.
    const scale = pose.s.value * (1 - Math.min(Math.max(y, 0) / 1500, 0.12));
    viewerImage.style.transform = x || y || scale !== 1 ? `translate(${x}px, ${y}px) scale(${scale})` : '';
    if (outgoing) outgoing.layer.style.transform = `translateX(${x - outgoing.offset}px)`;
  }

  function runPose(onSettle) {
    if (poseFrame) cancelAnimationFrame(poseFrame);
    lastTick = performance.now();
    const tick = (now) => {
      const seconds = Math.min((now - lastTick) / 1000, 1 / 30);
      lastTick = now;
      pose.x.step(seconds);
      pose.y.step(seconds);
      pose.s.step(seconds);
      renderPose();
      if (drag || !(pose.x.settled && pose.y.settled && pose.s.settled)) {
        poseFrame = requestAnimationFrame(tick);
        return;
      }
      poseFrame = 0;
      dropOutgoing();
      onSettle?.();
    };
    poseFrame = requestAnimationFrame(tick);
  }

  function dropOutgoing() {
    outgoing?.layer.remove();
    outgoing = null;
  }

  function resetPose() {
    cancelAnimationFrame(poseFrame);
    poseFrame = 0;
    dropOutgoing();
    pose.x.set(0);
    pose.y.set(0);
    pose.s.set(1);
    renderPose();
  }

  // A fixed copy of the current photograph at its resting position (ignoring any transform in flight).
  function photoLayer() {
    const transform = viewerImage.style.transform;
    viewerImage.style.transform = '';
    const rect = viewerImage.getBoundingClientRect();
    viewerImage.style.transform = transform;
    const layer = viewerImage.cloneNode();
    layer.removeAttribute('data-viewer-image');
    layer.className = 'viewer-swap';
    layer.alt = '';
    Object.assign(layer.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`, transform: '' });
    dialog.append(layer);
    return layer;
  }

  function swapToFull(src) {
    // Skip the crossfade while the photograph is moving; the layer would not follow it.
    if (!motion() || moving()) { viewerImage.src = src; return; }
    const layer = photoLayer();
    viewerImage.src = src;
    layer.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: 'ease' }).finished.then(() => layer.remove(), () => layer.remove());
  }

  // A visible thumbnail of the current photograph, if the page still shows one.
  function visibleThumbnail(id) {
    return [...app.querySelectorAll(`main [data-viewer="${id}"] img`)].find((img) => {
      const rect = img.getBoundingClientRect();
      return rect.width && rect.bottom > 0 && rect.top < innerHeight;
    });
  }

  // The pose that places the viewer photograph exactly over a thumbnail.
  function thumbnailPose(thumbnail, id) {
    const from = thumbnail.getBoundingClientRect();
    const to = containedRect(viewerImage, assets.get(id));
    if (!from.width || !to.width) return null;
    return { x: from.left + from.width / 2 - (to.left + to.width / 2), y: from.top + from.height / 2 - (to.top + to.height / 2), s: from.width / to.width };
  }

  function openViewer(photo, { keyboard = false } = {}) {
    const id = photo.dataset.viewer;
    const scope = photo.closest('[data-gallery]');
    const thumbnail = photo.querySelector('img');
    viewerIds = scope ? scope.dataset.gallery.split(',') : [id];
    viewerIndex = viewerIds.indexOf(id);
    viewerTrigger = photo;
    resetPose();
    dialog.classList.toggle('is-instant', keyboard);
    showViewerImage(thumbnail?.currentSrc);
    dialog.showModal();
    document.body.classList.add('viewer-open');
    dialog.querySelector('[data-viewer-close]').focus();
    if (keyboard || !motion() || !thumbnail) return;
    // Grow the photograph out of the thumbnail that was opened. It can be grabbed mid-way.
    const start = thumbnailPose(thumbnail, id);
    if (!start) return;
    pose.x.set(start.x);
    pose.y.set(start.y);
    pose.s.set(start.s);
    pose.x.to(0, { response: 0.4 });
    pose.y.to(0, { response: 0.4 });
    pose.s.to(1, { response: 0.4 });
    renderPose();
    runPose();
  }

  // Keyboard closes are instant. Pointer closes shrink back into the thumbnail when it is on screen.
  function closeViewer({ instant = false, toThumbnail = true } = {}) {
    dialog.classList.toggle('is-instant', instant);
    const id = viewerIds[viewerIndex];
    const thumbnail = !instant && toThumbnail && motion() && visibleThumbnail(id);
    const end = thumbnail && thumbnailPose(thumbnail, id);
    if (end) {
      pose.x.to(end.x, { response: 0.25 });
      pose.y.to(end.y, { response: 0.25 });
      pose.s.to(end.s, { response: 0.25 });
      runPose();
    }
    dialog.close();
  }

  // Slide to a neighbour. The incoming photograph starts one photo-width away and both travel together,
  // continuing at the speed the finger left off.
  function slideTo(step, velocity = 0) {
    const span = viewerImage.offsetWidth + PHOTO_GAP;
    const x = pose.x.value;
    dropOutgoing();
    outgoing = { layer: photoLayer(), offset: step * span };
    viewerIndex = (viewerIndex + step + viewerIds.length) % viewerIds.length;
    showViewerImage();
    pose.x.set(x + step * span, velocity);
    pose.x.to(0, { response: 0.35 });
    pose.y.to(0, { response: 0.35 });
    pose.s.to(1, { response: 0.35 });
    renderPose();
    runPose();
  }

  // Keyboard steps are instant; pointer steps slide (or fade, with reduced motion).
  function stepViewer(step, { animate = false } = {}) {
    if (animate && motion()) return slideTo(step);
    resetPose();
    viewerIndex = (viewerIndex + step + viewerIds.length) % viewerIds.length;
    showViewerImage();
    if (animate) viewerImage.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: easeOut });
  }

  listen(app, 'click', (event) => {
    const element = event.target instanceof Element ? event.target : null;
    if (!element) return;
    if (element.closest('.menu-button')) return setMenu(menuButton.getAttribute('aria-expanded') !== 'true', { instant: event.detail === 0 });
    const photo = element.closest('[data-viewer]');
    if (photo) return openViewer(photo, { keyboard: event.detail === 0 });
    if (element.closest('[data-viewer-close]')) return closeViewer({ instant: event.detail === 0 });
    const viewerStep = element.closest('[data-viewer-step]');
    if (viewerStep) return stepViewer(Number(viewerStep.dataset.viewerStep), { animate: event.detail > 0 });
    const lookTab = element.closest('[data-look]');
    if (lookTab) return selectLook(Number(lookTab.dataset.look), { keyboard: event.detail === 0 });
    const lookStep = element.closest('[data-look-step]');
    if (lookStep) return selectLook(activeLook + Number(lookStep.dataset.lookStep), { keyboard: event.detail === 0 });
    if (element.closest('.top-button')) return window.scrollTo({ top: 0, behavior: motion() ? 'smooth' : 'instant' });
    const link = element.closest('a[href]');
    if (!link || link.target || link.hasAttribute('download') || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname.startsWith('/assets/')) return;
    const path = normalizePath(url.pathname);
    if (path === normalizePath(location.pathname) && url.hash) {
      setMenu(false);
      return;
    }
    event.preventDefault();
    navigate(url.pathname + url.hash);
  });

  listen(document, 'keydown', (event) => {
    if (dialog.open) {
      if (event.key === 'ArrowRight') { event.preventDefault(); stepViewer(1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); stepViewer(-1); }
      return;
    }
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') setMenu(false, { focus: true, instant: true });
    const tab = event.target.closest?.('[data-look]');
    if (!tab) return;
    const index = Number(tab.dataset.look);
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      selectLook(event.key === 'Home' ? 0 : event.key === 'End' ? looks.length - 1 : index + (event.key === 'ArrowRight' ? 1 : -1), { focus: true, keyboard: true });
    }
  });

  listen(dialog, 'cancel', () => dialog.classList.add('is-instant'));
  listen(dialog, 'close', () => {
    document.body.classList.remove('viewer-open');
    drag = null;
    dialog.querySelectorAll('.viewer-swap').forEach((layer) => layer.remove());
    // Let a closing photograph finish its path before it returns to the centre.
    setTimeout(() => { if (!dialog.open) resetPose(); }, 220);
    if (viewerTrigger?.isConnected) viewerTrigger.focus({ preventScroll: true });
  });
  listen(dialog, 'click', (event) => { if (event.target === dialog) closeViewer(); });

  // Drag sideways to browse, drag down to close. The photograph stays under the finger from where it was
  // grabbed, even mid-animation; on release, momentum decides where it lands and the springs inherit its speed.
  listen(viewerImage, 'pointerdown', (event) => {
    if (drag || (event.pointerType === 'mouse' && event.button !== 0)) return;
    const x = pose.x.value;
    const y = pose.y.value;
    pose.x.set(x);
    pose.y.set(y);
    drag = { id: event.pointerId, downX: event.clientX, downY: event.clientY, originX: x, originY: y, axis: x ? 'x' : y ? 'y' : null, samples: [{ t: event.timeStamp, x: event.clientX, y: event.clientY }] };
    try { viewerImage.setPointerCapture(event.pointerId); } catch {}
    // Keep the loop alive so an unfinished scale (from opening) still settles while the finger holds the photo.
    runPose();
  });
  listen(viewerImage, 'pointermove', (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.downX;
    const dy = event.clientY - drag.downY;
    drag.samples.push({ t: event.timeStamp, x: event.clientX, y: event.clientY });
    while (drag.samples.length > 2 && event.timeStamp - drag.samples[0].t > 100) drag.samples.shift();
    // Commit to an axis only after 10px, so a slightly diagonal drag doesn't pick the wrong one.
    if (!drag.axis && Math.hypot(dx, dy) > 10) drag.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    if (drag.axis === 'x') {
      const x = drag.originX + dx;
      pose.x.set(viewerIds.length > 1 ? x : rubberband(x, viewerImage.offsetWidth));
    }
    if (drag.axis === 'y') {
      const y = drag.originY + dy;
      pose.y.set(y > 0 ? y : rubberband(y, viewerImage.offsetHeight));
    }
    renderPose();
  });
  function endDrag(event) {
    if (!drag || event.pointerId !== drag.id) return;
    const { axis, samples } = drag;
    drag = null;
    const first = samples[0];
    const last = samples.at(-1);
    const seconds = Math.max((last.t - first.t) / 1000, 0.001);
    const vx = (last.x - first.x) / seconds;
    const vy = (last.y - first.y) / seconds;
    // A flick in the opposite direction of the drag means "never mind", whatever the distance.
    const agrees = (offset, velocity) => Math.abs(velocity) < 100 || Math.sign(velocity) === Math.sign(offset);
    if (axis === 'x' && viewerIds.length > 1 && motion()) {
      const x = pose.x.value;
      if (Math.abs(x + project(vx)) > viewerImage.offsetWidth * 0.35 && agrees(x, vx)) return slideTo(x < 0 ? 1 : -1, vx);
    }
    if (axis === 'x' && viewerIds.length > 1 && !motion() && Math.abs(pose.x.value) > 80) {
      const step = pose.x.value < 0 ? 1 : -1;
      return stepViewer(step, { animate: true });
    }
    if (axis === 'y') {
      const y = pose.y.value;
      if (y > 0 && y + project(vy) > viewerImage.offsetHeight * 0.3 && agrees(y, vy)) {
        if (motion()) {
          pose.y.to(innerHeight, { response: 0.35, velocity: vy });
          runPose();
        }
        return closeViewer({ toThumbnail: false });
      }
    }
    if (!motion()) return resetPose();
    // Not far or fast enough: settle back. A released drag carries momentum, so a touch of overshoot is allowed.
    pose.x.to(0, { dampingRatio: 0.85, response: 0.35, velocity: axis === 'x' ? vx : 0 });
    pose.y.to(0, { dampingRatio: 0.85, response: 0.35, velocity: axis === 'y' ? vy : 0 });
    pose.s.to(1, { response: 0.35 });
    runPose();
  }
  listen(viewerImage, 'pointerup', endDrag);
  listen(viewerImage, 'pointercancel', endDrag);

  dispose = () => {
    if (dialog.open) dialog.close();
    document.body.classList.remove('viewer-open');
    controller.abort();
    revealObserver?.disconnect();
    cancelAnimationFrame(poseFrame);
    cancelAnimationFrame(headerFrame);
    disposeInk();
  };
}

function navigate(href, { historyMode = 'push', focus = true } = {}) {
  const url = new URL(href, location.href);
  if (historyMode === 'push') history.pushState(null, '', url.pathname + url.hash);
  // The home masthead entrance belongs to the first visit only.
  document.documentElement.classList.add('is-navigated');
  const update = () => {
    dispose();
    app.innerHTML = renderPage(url.pathname);
    setMetadata(url.pathname);
    bindPage();
    if (focus) app.querySelector('main').focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (url.hash) document.getElementById(decodeURIComponent(url.hash.slice(1)))?.scrollIntoView({ behavior: 'instant' });
  };
  // A skipped transition (e.g. in a background tab) still runs the update; only its animation promise rejects.
  if (document.startViewTransition && !reducedMotion.matches) document.startViewTransition(update).ready.catch(() => {});
  else update();
}

function start() {
  if (app.querySelector('main')?.dataset.route !== normalizePath(location.pathname)) app.innerHTML = renderPage(location.pathname);
  setMetadata(location.pathname);
  bindPage();
}
// Dev-only: a Demo data / Worst case switch for stress-testing layouts. Stripped from production builds.
if (import.meta.env.DEV) {
  import('./dev/worst-case.js').then(({ currentState, applyWorstCase, mountDataToggle }) => {
    const state = currentState();
    if (state === 'worst') applyWorstCase();
    mountDataToggle(state);
    start();
  });
} else start();
// iOS Safari only applies :active press states once a touch listener exists on the page.
document.addEventListener('touchstart', () => {}, { passive: true });
window.addEventListener('popstate', () => navigate(location.href, { historyMode: 'none' }));
if (location.hash) requestAnimationFrame(() => document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ behavior: 'instant' }));
