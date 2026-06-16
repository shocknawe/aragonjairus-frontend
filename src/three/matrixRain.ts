import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

/**
 * Volumetric "digital rain" backdrop — a field of instanced glyph columns
 * falling through 3D space with a glowing leading character and bloom.
 * Adapted from the classic Matrix-rain technique (font-atlas on rotated planes,
 * a wrapping vertex shader and a per-cell rain fragment shader), recoloured to
 * a cool grey so it sits behind the hero laptop as atmosphere, not neon.
 */
export function createMatrixRain(canvas: HTMLCanvasElement) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const CONFIG = {
    // color: new THREE.Color('#9298a2'), // trail — cool grey
    // headColor: new THREE.Color('#eef1f5'), // leading glyph — near white
    color: new THREE.Color('#232324'), // trail — cool grey
    headColor: new THREE.Color('#333438'), // leading glyph — near white
    bgColor: '#0a0a0b',
    columnCount: 3200,
    range: 120,
    minSpeed: 0.2,
    maxSpeed: 0.8,
    minHeight: 15,
    maxHeight: 40,
    fontSize: 64,
  };

  const KATAKANA =
    'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
  const NUMS = '01234123456789';
  const LATIN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const ALPHABET = KATAKANA + NUMS + LATIN;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(CONFIG.bgColor);
  scene.fog = new THREE.FogExp2(CONFIG.bgColor, 0.015);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
  camera.position.set(0, -10, 25);
  camera.lookAt(0, -10, 0);

  // --- Font atlas ----------------------------------------------------------
  function createFontTexture() {
    const c = document.createElement('canvas');
    const cols = 8;
    const total = ALPHABET.length;
    const rows = Math.ceil(total / cols);
    const charSize = CONFIG.fontSize;
    c.width = cols * charSize;
    c.height = rows * charSize;
    const cx = c.getContext('2d')!;
    cx.fillStyle = '#000';
    cx.fillRect(0, 0, c.width, c.height);
    cx.font = `bold ${charSize * 0.8}px monospace`;
    cx.textAlign = 'center';
    cx.textBaseline = 'middle';
    cx.fillStyle = '#fff';
    for (let i = 0; i < total; i++) {
      const x = (i % cols) * charSize;
      const y = Math.floor(i / cols) * charSize;
      cx.fillText(ALPHABET[i], x + charSize / 2, y + charSize / 2);
    }
    const texture = new THREE.CanvasTexture(c);
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.generateMipmaps = true;
    return { texture, cols, rows };
  }
  const fontData = createFontTexture();

  // --- Geometry: three rotated planes ("asterisk") merged -----------------
  const pGeom = new THREE.PlaneGeometry(0.6, 1);
  const parts: THREE.BufferGeometry[] = [];
  for (let r = 0; r < 3; r++) {
    const g = pGeom.clone();
    g.rotateY((Math.PI / 3) * r);
    parts.push(g);
  }
  const vertsEach = parts[0].attributes.position.count;
  const totalVerts = vertsEach * parts.length;
  const totalPos = new Float32Array(totalVerts * 3);
  const totalUv = new Float32Array(totalVerts * 2);
  const totalInd: number[] = [];
  let vOffset = 0;
  parts.forEach((g) => {
    totalPos.set(g.attributes.position.array as Float32Array, vOffset * 3);
    totalUv.set(g.attributes.uv.array as Float32Array, vOffset * 2);
    const idx = g.index!.array;
    for (let i = 0; i < idx.length; i++) totalInd.push(idx[i] + vOffset);
    vOffset += g.attributes.position.count;
    g.dispose();
  });
  pGeom.dispose();

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(totalPos, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(totalUv, 2));
  geometry.setIndex(totalInd);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uTexture: { value: fontData.texture },
      uGrid: { value: new THREE.Vector2(fontData.cols, fontData.rows) },
      uColor: { value: CONFIG.color },
      uHeadColor: { value: CONFIG.headColor },
      uTotalMapChars: { value: ALPHABET.length },
      uCameraPos: { value: new THREE.Vector3() },
      uRange: { value: CONFIG.range * 2.0 },
    },
    vertexShader: /* glsl */ `
      attribute float aSpeed;
      attribute float aTimeOffset;
      attribute float aHeight;
      uniform vec3 uCameraPos;
      uniform float uRange;
      varying vec2 vUv;
      varying float vHeight;
      varying float vSpeed;
      varying float vTimeOffset;
      varying vec3 vPos;
      void main() {
        vec3 instPos = instanceMatrix[3].xyz;
        vec3 diff = instPos - uCameraPos;
        float halfRange = uRange * 0.5;
        float wrappedX = mod(diff.x + halfRange, uRange) - halfRange;
        float wrappedZ = mod(diff.z + halfRange, uRange) - halfRange;
        vec3 wrappedDiff = vec3(wrappedX, diff.y, wrappedZ);
        vec3 newInstPos = uCameraPos + wrappedDiff;
        vec3 transformed = position;
        transformed.y *= aHeight;
        mat3 rotScale = mat3(instanceMatrix);
        vec3 finalPos = rotScale * transformed + newInstPos;
        vec4 mvPosition = viewMatrix * vec4(finalPos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        vUv = uv;
        vHeight = aHeight;
        vSpeed = aSpeed;
        vTimeOffset = aTimeOffset;
        vPos = floor(newInstPos);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform sampler2D uTexture;
      uniform vec2 uGrid;
      uniform vec3 uColor;
      uniform vec3 uHeadColor;
      uniform float uTotalMapChars;
      varying vec2 vUv;
      varying float vHeight;
      varying float vSpeed;
      varying float vTimeOffset;
      varying vec3 vPos;
      float random(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123); }
      void main() {
        float totalCells = vHeight;
        float currentY = vUv.y * totalCells;
        float cellIndex = floor(currentY);
        float timeStep = floor(uTime * 6.0);
        float rndChar = random(vec2(cellIndex + vPos.x * 0.1, vPos.z * 0.1 + timeStep * 0.01));
        float charID = floor(rndChar * uTotalMapChars);
        float col = mod(charID, uGrid.x);
        float row = floor(charID / uGrid.x);
        vec2 cellUV = fract(vec2(vUv.x, currentY));
        if (random(vec2(cellIndex, vPos.z)) > 0.6) cellUV.x = 1.0 - cellUV.x;
        vec2 atlasUV = (vec2(col, row) + cellUV) / uGrid;
        vec4 tex = texture2D(uTexture, atlasUV);
        float finalAlpha = smoothstep(0.1, 0.6, tex.r);

        float fallSpeed = vSpeed * 0.5;
        float time = uTime * fallSpeed + vTimeOffset;
        float headPos = 1.0 - fract(time);
        float dist = vUv.y - headPos;
        if (dist < 0.0) dist += 1.0;

        float trailLen = 0.65;
        float brightness = 0.0;
        if (dist < trailLen) {
          float fade = 1.0 - (dist / trailLen);
          brightness = pow(fade, 2.0);
        }
        if (dist < 0.03) brightness = 4.0;

        vec3 finalColor = uColor;
        if (dist < 0.02) finalColor = uHeadColor;

        if (finalAlpha < 0.01) discard;
        if (brightness < 0.01) discard;
        gl_FragColor = vec4(finalColor * brightness * finalAlpha, 1.0);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const mesh = new THREE.InstancedMesh(geometry, material, CONFIG.columnCount);
  mesh.frustumCulled = false;
  const dummy = new THREE.Object3D();
  const speed = new Float32Array(CONFIG.columnCount);
  const offset = new Float32Array(CONFIG.columnCount);
  const height = new Float32Array(CONFIG.columnCount);
  for (let i = 0; i < CONFIG.columnCount; i++) {
    const x = (Math.random() - 0.5) * CONFIG.range * 2;
    const z = (Math.random() - 0.5) * CONFIG.range * 2;
    const y = (Math.random() - 0.5) * 40 - 10;
    dummy.position.set(x, y, z);
    dummy.scale.setScalar(0.3);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    speed[i] = CONFIG.minSpeed + Math.random() * (CONFIG.maxSpeed - CONFIG.minSpeed);
    offset[i] = Math.random() * 10;
    height[i] = CONFIG.minHeight + Math.random() * (CONFIG.maxHeight - CONFIG.minHeight);
  }
  mesh.instanceMatrix.needsUpdate = true;
  geometry.setAttribute('aSpeed', new THREE.InstancedBufferAttribute(speed, 1));
  geometry.setAttribute('aTimeOffset', new THREE.InstancedBufferAttribute(offset, 1));
  geometry.setAttribute('aHeight', new THREE.InstancedBufferAttribute(height, 1));
  scene.add(mesh);
  material.uniforms.uCameraPos.value.copy(camera.position);

  // --- Bloom ---------------------------------------------------------------
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.5, 0.3, 0.12);
  composer.addPass(bloom);

  // --- Sizing --------------------------------------------------------------
  function resize() {
    const parent = canvas.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const h = parent.clientHeight || 1;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  if (canvas.parentElement) ro.observe(canvas.parentElement);
  resize();

  // --- Loop ----------------------------------------------------------------
  const clock = new THREE.Clock();
  let raf = 0;
  let running = true;
  function tick() {
    if (!running) return;
    material.uniforms.uTime.value += clock.getDelta();
    composer.render();
    raf = requestAnimationFrame(tick);
  }

  if (reduce) {
    composer.render(); // single static frame, no animation
  } else {
    raf = requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver(
    ([entry]) => {
      const wasRunning = running;
      running = entry.isIntersecting && !reduce;
      if (running && !wasRunning) {
        clock.getDelta(); // discard the idle gap
        raf = requestAnimationFrame(tick);
      }
    },
    { threshold: 0 },
  );
  io.observe(canvas);

  return function dispose() {
    running = false;
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    geometry.dispose();
    material.dispose();
    fontData.texture.dispose();
    bloom.dispose();
    composer.dispose();
    renderer.dispose();
  };
}
