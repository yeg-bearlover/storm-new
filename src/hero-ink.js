// Homepage masthead entrance: the name blooms out of spreading ink and sharpens into Koch=Schrift,
// then the three photographs are drawn down by a single ink line. The pointer drags wet ink through
// the letters. Loaded on the first visit only, and only with motion allowed and WebGL2 available.
// The pre-rendered HTML stays in the DOM underneath as the accessible, no-WebGL version.
import { WebGLRenderer, Scene, OrthographicCamera, ShaderMaterial, Mesh, PlaneGeometry, CanvasTexture, TextureLoader, NoColorSpace, LinearSRGBColorSpace, LinearMipmapLinearFilter, Vector2, Vector3, Vector4 } from 'three';
import { gsap } from 'gsap';

// After this, the CSS failsafe has already revealed the static masthead; don't hide it again.
const LATE_START = 3000;
const root = document.documentElement;

const fragmentShader = /* glsl */ `
  uniform vec2 uRes; uniform float uDpr, uTime;
  uniform sampler2D uWord, uHalo, uPhoto0, uPhoto1, uPhoto2;
  uniform vec4 uRect0, uRect1, uRect2;
  uniform vec3 uWash;
  uniform vec2 uMouse, uVel;
  uniform float uInk, uSettle;
  const vec3 BG = vec3(0.0314);
  const vec3 INK = vec3(0.953, 0.945, 0.925);

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 17.0; a *= 0.5; }
    return v;
  }
  // Photograph at rect (CSS px, top-left origin), sampled untouched.
  vec4 photoAt(sampler2D tex, vec4 rect, vec2 p) {
    if (rect.z <= 0.0 || rect.w <= 0.0) return vec4(0.0);
    vec2 uv = (p - rect.xy) / rect.zw;
    if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return vec4(0.0);
    return vec4(texture2D(tex, vec2(uv.x, 1.0 - uv.y)).rgb, 1.0);
  }
  // The ink drains from the top of a photograph, ragged at the edge, leaving a thin line.
  vec2 wash(vec4 rect, vec2 p, float progress, float seed) {
    vec2 uv = (p - rect.xy) / rect.zw;
    float v = (1.0 - uv.y) * 0.72 + fbm(uv * vec2(3.0, 5.0) + seed) * 0.28;
    float th = 1.0 - progress * 1.2;
    float shown = smoothstep(th - 0.012, th + 0.012, v);
    float rim = (smoothstep(th - 0.03, th, v) - smoothstep(th, th + 0.03, v)) * step(progress, 0.999);
    return vec2(shown, rim);
  }

  void main() {
    vec2 p = vec2(gl_FragCoord.x / uDpr, uRes.y - gl_FragCoord.y / uDpr);

    // Wet ink: sample from behind the pointer's motion so the letters are dragged along.
    vec2 d = p - uMouse;
    vec2 sp = p - uVel * exp(-dot(d, d) / (2.0 * 110.0 * 110.0));
    vec2 wuv = vec2(sp.x, uRes.y - sp.y) / uRes;
    float sharp = texture2D(uWord, wuv).a;
    float halo = texture2D(uHalo, wuv).a;

    float n = fbm(sp * 0.011 + vec2(0.0, -uTime * 0.06));
    float th = mix(1.3, 0.34, uInk);
    float bloom = smoothstep(th, th + 0.05, halo * 1.15 + (n - 0.5) * 0.6);
    float ink = mix(bloom * 0.82, sharp, uSettle);
    ink = max(ink, halo * fbm(sp * 0.02 + vec2(0.0, uTime * 0.22)) * 0.1 * uSettle);

    vec3 col = BG;
    vec4 photo; vec2 m;
    photo = photoAt(uPhoto0, uRect0, p);
    if (photo.a > 0.0) { m = wash(uRect0, p, uWash.x, 1.0); }
    else {
      photo = photoAt(uPhoto1, uRect1, p);
      if (photo.a > 0.0) { m = wash(uRect1, p, uWash.y, 7.0); }
      else { photo = photoAt(uPhoto2, uRect2, p); m = photo.a > 0.0 ? wash(uRect2, p, uWash.z, 13.0) : vec2(0.0); }
    }
    col = mix(col, photo.rgb, m.x * photo.a);
    col = mix(col, INK, m.y * 0.9);
    col = mix(col, INK, ink);
    gl_FragColor = vec4(col, 1.0);
  }`;

function webgl2() {
  try {
    return Boolean(document.createElement('canvas').getContext('webgl2'));
  } catch {
    return false;
  }
}

// Draws the masthead's text into a canvas covering `frame`, where the browser laid it out.
function textCanvas(frame, element, dpr, blur = 0) {
  const box = frame.getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  const style = getComputedStyle(element);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(box.width * dpr);
  canvas.height = Math.round(box.height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.font = `400 ${style.fontSize} KochSchrift`;
  ctx.letterSpacing = style.letterSpacing;
  ctx.textAlign = 'center';
  const metrics = ctx.measureText(element.textContent);
  const inkHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  const x = rect.left - box.left + rect.width / 2;
  const y = rect.top - box.top + (rect.height - inkHeight) / 2 + metrics.actualBoundingBoxAscent;
  ctx.fillStyle = '#fff';
  if (blur) {
    // A soft halo around the letters: the field the ink grows through.
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = blur * dpr;
    for (let i = 0; i < 3; i += 1) ctx.fillText(element.textContent, x, y);
  } else ctx.fillText(element.textContent, x, y);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = NoColorSpace;
  return texture;
}

function rectIn(frame, element) {
  const box = frame.getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  return new Vector4(rect.left - box.left, rect.top - box.top, rect.width, rect.height);
}

// Photographs are uploaded without colour-space conversion and written straight out, so a revealed
// pixel is the source pixel.
function loadTexture(src) {
  return new Promise((resolve, reject) => {
    new TextureLoader().load(src, (texture) => {
      texture.colorSpace = NoColorSpace;
      texture.minFilter = LinearMipmapLinearFilter;
      texture.anisotropy = 4;
      resolve(texture);
    }, undefined, reject);
  });
}

// `gate`: the opening contact sheet, if one is playing. The ink waits beneath it and starts as it lifts.
export function mountInk(hero, { gate = null } = {}) {
  const title = hero.querySelector('h1');
  const info = hero.querySelectorAll('.hero-info p');
  const photos = [...hero.querySelectorAll('.hero-photos img')].slice(0, 3);
  let alive = true;
  let live = false;
  let gateOpen = !gate;
  let teardown = () => {};
  gate?.then(() => {
    gateOpen = true;
    // The sheet lifted before the ink was ready: show the static masthead, unless the CSS failsafe already has.
    if (alive && !live && performance.now() < LATE_START) root.classList.add('ink-off');
  });

  if (!webgl2()) {
    root.classList.add('ink-off');
    return () => {};
  }

  (async () => {
    const images = photos.filter((photo) => photo.checkVisibility());
    await Promise.all([document.fonts.load(`400 100px KochSchrift`), ...images.map((photo) => photo.decode().catch(() => {}))]);
    const textures = await Promise.all(images.map((photo) => loadTexture(photo.currentSrc || photo.src)));
    if (!alive || (gate ? gateOpen : performance.now() > LATE_START)) {
      textures.forEach((texture) => texture.dispose());
      return;
    }

    const dpr = Math.min(devicePixelRatio, 2);
    const renderer = new WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(dpr);
    renderer.outputColorSpace = LinearSRGBColorSpace; // the shader writes display values directly
    const canvas = renderer.domElement;
    canvas.className = 'hero-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    hero.prepend(canvas);

    const uniforms = {
      uRes: { value: new Vector2() }, uDpr: { value: dpr }, uTime: { value: 0 },
      uWord: { value: null }, uHalo: { value: null },
      uPhoto0: { value: textures[0] ?? null }, uPhoto1: { value: textures[1] ?? null }, uPhoto2: { value: textures[2] ?? null },
      uRect0: { value: new Vector4() }, uRect1: { value: new Vector4() }, uRect2: { value: new Vector4() },
      uWash: { value: new Vector3() },
      uMouse: { value: new Vector2(-9999, -9999) }, uVel: { value: new Vector2() },
      uInk: { value: 0 }, uSettle: { value: 0 },
    };
    const material = new ShaderMaterial({
      uniforms,
      vertexShader: 'void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader,
      depthTest: false,
      depthWrite: false,
    });
    const quad = new Mesh(new PlaneGeometry(2, 2), material);
    const scene = new Scene().add(quad);
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const resize = () => {
      const { width, height } = hero.getBoundingClientRect();
      renderer.setSize(width, height, false);
      uniforms.uRes.value.set(width, height);
      uniforms.uWord.value?.dispose();
      uniforms.uHalo.value?.dispose();
      uniforms.uWord.value = textCanvas(hero, title, dpr);
      uniforms.uHalo.value = textCanvas(hero, title, dpr, Math.max(10, title.getBoundingClientRect().height * 0.09));
      images.forEach((photo, i) => uniforms[`uRect${i}`].value.copy(rectIn(hero, photo)));
    };

    // Pointer drag: velocity follows the pointer and decays each frame.
    const pointer = { x: -9999, y: -9999 };
    const velocity = new Vector2();
    const onMove = (event) => {
      const box = hero.getBoundingClientRect();
      pointer.x = event.clientX - box.left;
      pointer.y = event.clientY - box.top;
    };
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (finePointer) hero.addEventListener('pointermove', onMove);

    let onScreen = true;
    let frameId = 0;
    const start = performance.now();
    const loop = () => {
      frameId = requestAnimationFrame(loop);
      if (!onScreen) return;
      uniforms.uTime.value = (performance.now() - start) / 1000;
      const mouse = uniforms.uMouse.value;
      if (pointer.x > -9000) {
        if (mouse.x < -9000) mouse.set(pointer.x, pointer.y);
        velocity.x += (pointer.x - mouse.x) * 0.5;
        velocity.y += (pointer.y - mouse.y) * 0.5;
        mouse.set(pointer.x, pointer.y);
      }
      velocity.multiplyScalar(0.88).clampLength(0, 70);
      uniforms.uVel.value.copy(velocity);
      renderer.render(scene, camera);
    };
    const resizeObserver = new ResizeObserver(resize);
    const visibility = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; });
    resize();
    resizeObserver.observe(hero);
    visibility.observe(hero);

    let timeline;
    // Swap the static masthead for the canvas in the same frame the canvas first paints.
    renderer.render(scene, camera);
    root.classList.add('ink-live');
    live = true;
    loop();
    teardown = () => {
      timeline?.kill();
      live = false;
      gsap.set(info, { clearProps: 'all' });
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      visibility.disconnect();
      hero.removeEventListener('pointermove', onMove);
      Object.values(uniforms).forEach(({ value }) => value?.isTexture && value.dispose());
      material.dispose();
      quad.geometry.dispose();
      renderer.dispose();
      canvas.remove();
      root.classList.remove('ink-live');
    };
    if (gate) await gate;
    if (!alive) return;

    const washes = { a: 0, b: 0, c: 0 };
    timeline = gsap.timeline({ delay: 0.05, onUpdate: () => uniforms.uWash.value.set(washes.a, washes.b, washes.c) })
      .to(uniforms.uInk, { value: 1, duration: 2.0, ease: 'power2.out' })
      .to(uniforms.uSettle, { value: 1, duration: 1.0, ease: 'power2.inOut' }, 1.3)
      .fromTo(info, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08, clearProps: 'all' }, 1.9)
      .to(washes, { a: 1, duration: 1.4, ease: 'power2.inOut' }, 2.1)
      .to(washes, { b: 1, duration: 1.4, ease: 'power2.inOut' }, 2.28)
      .to(washes, { c: 1, duration: 1.4, ease: 'power2.inOut' }, 2.46);
  })().catch(() => {
    if (alive && !live && performance.now() <= LATE_START) root.classList.add('ink-off');
  });

  return () => {
    alive = false;
    teardown();
  };
}
