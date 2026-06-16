import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

/**
 * Floating MacBook hero, after the pmndrs "floating-laptop" demo.
 * Loads the same mac-draco.glb model and reproduces its spring lid-open and
 * floating sway in vanilla Three.js, with "hello world" typed on the screen.
 */
export function createHeroScene(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.82;

  const scene = new THREE.Scene();
  // Camera mirrors the reference: behind the model, looking through the π-spin.
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, -26);
  camera.lookAt(0, 0, 0);

  // Studio reflections (offline stand-in for Environment preset="city")
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55; // calmer, neutral reflections

  scene.add(new THREE.AmbientLight(0xffffff, 0.2));
  const key = new THREE.DirectionalLight(0xffffff, 1);
  key.position.set(-6, 9, -10);
  scene.add(key);

  // --- Layout root ----------------------------------------------------
  const root = new THREE.Group(); // positioned per-viewport
  scene.add(root);
  const spin = new THREE.Group(); // the reference's [0, π, 0] wrapper
  spin.rotation.set(0, Math.PI, 0);
  root.add(spin);
  const floatG = new THREE.Group(); // floats / sways
  spin.add(floatG);
  const hinge = new THREE.Group(); // lid pivot
  hinge.position.set(0, -0.04, 0.41);
  floatG.add(hinge);

  // --- Screen texture (typed "hello world") ---------------------------
  const screenTex = new THREE.CanvasTexture(screenCanvas);
  screenTex.colorSpace = THREE.SRGBColorSpace;
  screenTex.flipY = false; // GLTF UV convention

  // --- Load the model -------------------------------------------------
  const draco = new DRACOLoader();
  draco.setDecoderPath('/draco/gltf/');
  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);

  let loaded = false;
  loader.load(
    '/mac-draco.glb',
    (gltf) => {
      const byName = new Map<string, THREE.Mesh>();
      gltf.scene.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) byName.set(o.name, o as THREE.Mesh);
      });
      const make = (name: string) => {
        const src = byName.get(name);
        if (!src) return null;
        return new THREE.Mesh(src.geometry, src.material);
      };

      // Lid assembly
      const screenInner = new THREE.Group();
      screenInner.position.set(0, 2.96, -0.13);
      screenInner.rotation.set(Math.PI / 2, 0, 0);
      hinge.add(screenInner);
      ['Cube008', 'Cube008_1', 'Cube008_2'].forEach((n) => {
        const m = make(n);
        if (m) screenInner.add(m);
      });

      // Light up the screen with the editor canvas
      const screenMesh = make('Cube008_2');
      const screenSrc = byName.get('Cube008_2');
      if (screenSrc) {
        const sm = (screenSrc.material as THREE.MeshStandardMaterial).clone();
        sm.color = new THREE.Color(0x000000);
        sm.emissive = new THREE.Color(0xffffff);
        sm.emissiveMap = screenTex;
        sm.emissiveIntensity = 1;
        sm.toneMapped = false;
        sm.needsUpdate = true;
        // replace the screen mesh material in the assembled lid
        screenInner.children.forEach((c) => {
          if ((c as THREE.Mesh).geometry === screenSrc.geometry)
            (c as THREE.Mesh).material = sm;
        });
      }
      void screenMesh;

      // Keyboard
      const kb = make('keyboard');
      if (kb) {
        kb.position.set(1.79, 0, 3.45);
        floatG.add(kb);
      }
      // Base + trackpad
      const baseG = new THREE.Group();
      baseG.position.set(0, -0.1, 3.39);
      floatG.add(baseG);
      ['Cube002', 'Cube002_1'].forEach((n) => {
        const m = make(n);
        if (m) baseG.add(m);
      });
      // Touch bar
      const tb = make('touchbar');
      if (tb) {
        tb.position.set(0, -0.03, 1.2);
        floatG.add(tb);
      }

      loaded = true;
    },
    undefined,
    (err) => console.warn('Laptop model failed to load:', err),
  );

  // --- Intro / animation state ---------------------------------------
  let triggered = false;
  let triggerTime = 0;
  function playIntro() {
    if (triggered) return;
    triggered = true;
    triggerTime = clockTime + 0.4; // slight delay before the lid starts opening
  }
  const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
  const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
  const lerp = THREE.MathUtils.lerp;
  const HINGE_CLOSED = 1.575;
  const HINGE_OPEN = -0.425;

  // --- Interaction & sizing ------------------------------------------
  const target = { x: 0, y: 0 };
  const mouse = { x: 0, y: 0 };
  function onPointer(e: PointerEvent) {
    target.x = (e.clientX / window.innerWidth - 0.5) * 2;
    target.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }
  window.addEventListener('pointermove', onPointer);

  function resize() {
    const parent = canvas.parentElement;
    if (!parent) return;
    const { clientWidth: w, clientHeight: h } = parent;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    if (w / h > 1) {
      root.position.set(-7.5, 0.5, 0); // shifts the laptop to the right
      root.scale.setScalar(1.05);
      camera.position.set(0, 0, -26);
    } else {
      root.position.set(0, -1, 0);
      root.scale.setScalar(0.82);
      camera.position.set(0, 0, -30);
    }
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  if (canvas.parentElement) ro.observe(canvas.parentElement);
  resize();

  // --- Loop -----------------------------------------------------------
  const t0 = performance.now();
  let clockTime = 0;
  let raf = 0;
  let running = true;

  function tick() {
    if (!running) return;
    clockTime = (performance.now() - t0) / 1000;
    if (!triggered && clockTime > 6) playIntro();

    const t = clockTime;
    mouse.x += (target.x - mouse.x) * 0.05;
    mouse.y += (target.y - mouse.y) * 0.05;

    if (loaded) {
      // Lid spring
      const p = triggered ? easeOutCubic(clamp01((t - triggerTime) / 1.2)) : 0;
      hinge.rotation.x = lerp(HINGE_CLOSED, HINGE_OPEN, p);

      // Floating sway (reference formulas) + subtle mouse parallax
      const open = triggered;
      floatG.rotation.x = lerp(
        floatG.rotation.x,
        open ? Math.cos(t / 10) / 10 + 0.25 + mouse.y * 0.1 : 0,
        0.1,
      );
      floatG.rotation.y = lerp(
        floatG.rotation.y,
        open ? Math.sin(t / 10) / 4 + mouse.x * 0.4 : 0,
        0.1,
      );
      floatG.rotation.z = lerp(
        floatG.rotation.z,
        open ? Math.sin(t / 10) / 10 : 0,
        0.1,
      );
      floatG.position.y = lerp(
        floatG.position.y,
        open ? (-2 + Math.sin(t)) / 3 : -4.3,
        0.1,
      );

      // Screen typing begins shortly after the lid starts opening
      const screenP = triggered ? clamp01((t - triggerTime - 0.7) / 1.8) : 0;
      updateScreen(screenP, t);
      screenTex.needsUpdate = true;
    }

    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }
  tick();

  const io = new IntersectionObserver(
    ([entry]) => {
      running = entry.isIntersecting;
      if (running) tick();
    },
    { threshold: 0 },
  );
  io.observe(canvas);

  function dispose() {
    running = false;
    cancelAnimationFrame(raf);
    window.removeEventListener('pointermove', onPointer);
    ro.disconnect();
    io.disconnect();
    draco.dispose();
    pmrem.dispose();
    renderer.dispose();
  }

  return { dispose, playIntro };
}

/* ----------------------------------------------------------------------
   Screen: a minimal code editor that types out "hello world"
---------------------------------------------------------------------- */
type Seg = { t: string; c: string };
const KW = '#ff7b72';
const VAR = '#79c0ff';
const STR = '#c6ff3c';
const FN = '#d2a8ff';
const PUNC = '#8b949e';
const WHITE = '#e6edf3';

const CODE: Seg[] = [
  { t: 'const ', c: KW },
  { t: 'greeting', c: VAR },
  { t: ' = ', c: PUNC },
  { t: '"hello world"', c: STR },
  { t: ';', c: PUNC },
  { t: '\n\n', c: PUNC },
  { t: 'console', c: WHITE },
  { t: '.', c: PUNC },
  { t: 'log', c: FN },
  { t: '(', c: PUNC },
  { t: 'greeting', c: VAR },
  { t: ');', c: PUNC },
];
const TOTAL = CODE.reduce((n, s) => n + s.t.length, 0);

const screenCanvas = document.createElement('canvas');
screenCanvas.width = 1024;
screenCanvas.height = 640;

function updateScreen(reveal: number, time: number) {
  const ctx = screenCanvas.getContext('2d')!;
  const W = 1024;
  const H = 640;

  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0, 0, W, H);

  // title bar
  ctx.fillStyle = '#161b22';
  ctx.fillRect(0, 0, W, 56);
  ['#ff5f56', '#ffbd2e', '#27c93f'].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(34 + i * 30, 28, 9, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = '#7d8590';
  ctx.font = "26px 'Space Mono', monospace";
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText('hello.ts', W / 2, 28);
  ctx.textAlign = 'left';

  const codeAlpha = Math.min(1, reveal * 4);
  ctx.globalAlpha = codeAlpha;

  const fontSize = 34;
  ctx.font = `${fontSize}px 'Space Mono', monospace`;
  const lineH = 52;
  const startX = 96;
  const startY = 120;
  let x = startX;
  let line = 0;
  const drawLineNo = (n: number) => {
    ctx.fillStyle = '#484f58';
    ctx.textAlign = 'right';
    ctx.fillText(String(n + 1), 70, startY + n * lineH);
    ctx.textAlign = 'left';
  };
  drawLineNo(0);

  const budget = Math.floor(reveal * TOTAL);
  let drawn = 0;
  let lastX = startX;
  let lastY = startY;
  for (const seg of CODE) {
    for (const ch of seg.t) {
      if (drawn >= budget) break;
      if (ch === '\n') {
        line++;
        x = startX;
        drawLineNo(line);
      } else {
        ctx.fillStyle = seg.c;
        ctx.fillText(ch, x, startY + line * lineH);
        x += ctx.measureText(ch).width;
      }
      lastX = x;
      lastY = startY + line * lineH;
      drawn++;
    }
    if (drawn >= budget) break;
  }

  if (codeAlpha > 0 && (reveal < 1 || Math.floor(time * 1.6) % 2 === 0)) {
    ctx.fillStyle = '#c6ff3c';
    ctx.fillRect(lastX + 2, lastY - fontSize / 2, 3, fontSize);
  }
  ctx.globalAlpha = 1;

  if (reveal >= 1) {
    ctx.strokeStyle = '#21262d';
    ctx.beginPath();
    ctx.moveTo(0, H - 130);
    ctx.lineTo(W, H - 130);
    ctx.stroke();
    ctx.fillStyle = '#7d8590';
    ctx.font = "22px 'Space Mono', monospace";
    ctx.fillText('OUTPUT', 96, H - 100);
    ctx.fillStyle = '#c6ff3c';
    ctx.font = "32px 'Space Mono', monospace";
    ctx.fillText('▸ hello world', 96, H - 56);
  }
}
