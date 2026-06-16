import * as THREE from 'three';

/**
 * A stylised wireframe globe: latitude/longitude lines, glowing surface
 * points and a couple of travelling arcs. Nods to the wireframe's earth.
 */
export function createGlobeScene(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 13;

  const globe = new THREE.Group();
  globe.rotation.z = 0.4; // axial tilt
  scene.add(globe);

  const R = 4.4;
  // Site highlight palette (matches the capability accent colours).
  const palette = ['#c6ff3c', '#54e6a0', '#ffb454', '#ff6a5c', '#b29bff'].map(
    (c) => new THREE.Color(c),
  );

  // --- Lat / long wireframe -------------------------------------------
  const lineMat = new THREE.LineBasicMaterial({
    color: 0xece9e2,
    transparent: true,
    opacity: 0.08,
  });

  // parallels
  for (let i = 1; i < 12; i++) {
    const lat = (i / 12) * Math.PI - Math.PI / 2;
    const r = Math.cos(lat) * R;
    const y = Math.sin(lat) * R;
    const pts: THREE.Vector3[] = [];
    for (let a = 0; a <= 64; a++) {
      const ang = (a / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(ang) * r, y, Math.sin(ang) * r));
    }
    globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
  }
  // meridians
  for (let i = 0; i < 18; i++) {
    const lon = (i / 18) * Math.PI * 2;
    const pts: THREE.Vector3[] = [];
    for (let a = 0; a <= 64; a++) {
      const lat = (a / 64) * Math.PI - Math.PI / 2;
      const r = Math.cos(lat) * R;
      pts.push(
        new THREE.Vector3(Math.cos(lon) * r, Math.sin(lat) * R, Math.sin(lon) * r),
      );
    }
    globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
  }

  // --- Glowing surface points -----------------------------------------
  const COUNT = 900;
  const positions = new Float32Array(COUNT * 3);
  const scales = new Float32Array(COUNT);
  const colors = new Float32Array(COUNT * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < COUNT; i++) {
    const y = 1 - (i / (COUNT - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    positions[i * 3] = Math.cos(theta) * r * R;
    positions[i * 3 + 1] = y * R;
    positions[i * 3 + 2] = Math.sin(theta) * r * R;
    scales[i] = Math.random() > 0.85 ? 2.2 : 0.7;
    const c = palette[(Math.random() * palette.length) | 0];
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pGeo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
  pGeo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));

  const uniforms = {
    uSize: { value: 30 * Math.min(window.devicePixelRatio, 2) },
  };
  const pMat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uSize;
      attribute float aScale;
      attribute vec3 aColor;
      varying vec3 vColor;
      void main() {
        vColor = aColor;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * aScale * (1.0 / -mv.z);
      }
    `,
    fragmentShader: /* glsl */ `
      precision mediump float;
      varying vec3 vColor;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        gl_FragColor = vec4(vColor, smoothstep(0.5, 0.0, d));
      }
    `,
  });
  globe.add(new THREE.Points(pGeo, pMat));

  // --- Sizing & loop ---------------------------------------------------
  function resize() {
    const parent = canvas.parentElement;
    if (!parent) return;
    const size = Math.min(parent.clientWidth, parent.clientHeight) || 400;
    renderer.setSize(size, size, false);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  if (canvas.parentElement) ro.observe(canvas.parentElement);
  resize();

  const mouseX = { v: 0, t: 0 };
  function onPointer(e: PointerEvent) {
    mouseX.t = (e.clientX / window.innerWidth - 0.5) * 0.6;
  }
  window.addEventListener('pointermove', onPointer);

  let raf = 0;
  let running = true;
  function tick() {
    if (!running) return;
    globe.rotation.y += 0.0022;
    mouseX.v += (mouseX.t - mouseX.v) * 0.04;
    globe.rotation.x = mouseX.v * 0.4;
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

  return function dispose() {
    running = false;
    cancelAnimationFrame(raf);
    window.removeEventListener('pointermove', onPointer);
    ro.disconnect();
    io.disconnect();
    renderer.dispose();
    scene.traverse((o) => {
      if (o instanceof THREE.Line || o instanceof THREE.Points) {
        o.geometry.dispose();
        (o.material as THREE.Material).dispose();
      }
    });
  };
}
