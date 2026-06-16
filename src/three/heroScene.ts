import * as THREE from 'three';

/**
 * A breathing, mouse-reactive particle sphere rendered as soft glowing points.
 * Vanilla Three.js so it stays free of React-version peer constraints.
 */
export function createHeroScene(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 15;

  // --- Fibonacci sphere of points -------------------------------------
  const COUNT = 2600;
  const radius = 5.6;
  const positions = new Float32Array(COUNT * 3);
  const scales = new Float32Array(COUNT);
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < COUNT; i++) {
    const y = 1 - (i / (COUNT - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    positions[i * 3] = Math.cos(theta) * r * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = Math.sin(theta) * r * radius;
    scales[i] = 0.6 + Math.random() * 1.4;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));

  const uniforms = {
    uTime: { value: 0 },
    uSize: { value: 26 * Math.min(window.devicePixelRatio, 2) },
    uColorA: { value: new THREE.Color('#c6ff3c') },
    uColorB: { value: new THREE.Color('#ece9e2') },
    uIntro: { value: 0 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uSize;
      uniform float uIntro;
      attribute float aScale;
      varying float vMix;
      void main() {
        vec3 p = position;
        float n = sin(p.x * 0.55 + uTime * 0.4)
                * cos(p.y * 0.55 + uTime * 0.3)
                * sin(p.z * 0.55 + uTime * 0.5);
        p += normalize(position) * n * 0.45;
        p *= mix(0.2, 1.0, uIntro);
        vMix = 0.5 + 0.5 * n;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * aScale * (1.0 / -mv.z) * mix(0.2, 1.0, uIntro);
      }
    `,
    fragmentShader: /* glsl */ `
      precision mediump float;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying float vMix;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;
        float alpha = smoothstep(0.5, 0.0, d);
        vec3 col = mix(uColorA, uColorB, vMix);
        gl_FragColor = vec4(col, alpha * 0.9);
      }
    `,
  });

  const points = new THREE.Points(geometry, material);
  const group = new THREE.Group();
  group.add(points);
  scene.add(group);

  // --- Interaction & sizing -------------------------------------------
  const mouse = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };

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
    // pull the sphere slightly off-screen-right on wide viewports
    group.position.x = w / h > 1 ? 3.2 : 0;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  if (canvas.parentElement) ro.observe(canvas.parentElement);
  resize();

  // --- Loop ------------------------------------------------------------
  const t0 = performance.now();
  let raf = 0;
  let running = true;

  function tick() {
    if (!running) return;
    const t = (performance.now() - t0) / 1000;
    uniforms.uTime.value = t;
    if (uniforms.uIntro.value < 1) {
      uniforms.uIntro.value = Math.min(1, uniforms.uIntro.value + 0.012);
    }
    mouse.x += (target.x - mouse.x) * 0.04;
    mouse.y += (target.y - mouse.y) * 0.04;
    group.rotation.y += 0.0016;
    group.rotation.x = mouse.y * 0.3;
    group.rotation.z = -mouse.x * 0.12;
    camera.position.x = mouse.x * 0.8;
    camera.lookAt(group.position);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }
  tick();

  // Pause when offscreen to save the battery
  const io = new IntersectionObserver(
    ([entry]) => {
      running = entry.isIntersecting;
      if (running) tick();
    },
    { threshold: 0 },
  );
  io.observe(canvas);

  return function dispose() {
    running = false;
    cancelAnimationFrame(raf);
    window.removeEventListener('pointermove', onPointer);
    ro.disconnect();
    io.disconnect();
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  };
}
