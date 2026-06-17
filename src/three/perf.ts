/**
 * Adaptive performance tiering.
 *
 * Probes the GPU/CPU once at startup and picks a quality tier so the WebGL
 * scenes (hero laptop + matrix rain) can scale down on weak hardware instead
 * of tanking the framerate. The detection context is created once and cached;
 * both scenes share the same verdict.
 */
export type PerfTier = 'low' | 'high';

export interface QualitySettings {
  /** Upper bound for renderer.setPixelRatio (still clamped by devicePixelRatio). */
  pixelRatio: number;
  /** Hero laptop antialiasing — wasted on the matrix scene (renders via composer). */
  antialias: boolean;
  /** Render the matrix-rain backdrop at all (its own WebGL context). */
  matrixEnabled: boolean;
  /** Matrix-rain instanced column count. */
  matrixColumns: number;
  /** Enable the UnrealBloom post pass (the single most expensive effect). */
  matrixBloom: boolean;
  /** DoubleSide doubles overdraw; the 3 rotated planes already cover most angles. */
  matrixDoubleSide: boolean;
}

let cachedTier: PerfTier | null = null;

export function perfTier(): PerfTier {
  if (cachedTier) return cachedTier;

  let lowGPU = false;
  try {
    const gl = document.createElement('canvas').getContext('webgl');
    if (gl) {
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      const r = dbg
        ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL))
        : '';
      // Conservative: flag integrated/mobile/software renderers. Being wrong on
      // the "low" side only dims the backdrop; being wrong high is what kills
      // old laptops. (Apple Silicon reports "Apple GPU" and is left as high.)
      lowGPU = /Intel|HD Graphics|Mali|Adreno [1-5]|PowerVR|llvmpipe|SwiftShader|Microsoft Basic/i.test(
        r,
      );
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    } else {
      lowGPU = true; // no WebGL ⇒ treat as low
    }
  } catch {
    lowGPU = true;
  }

  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = (navigator as { deviceMemory?: number }).deviceMemory ?? 4;

  // test low performance
  // return 'low';
  cachedTier = lowGPU || cores <= 4 || mem <= 4 ? 'low' : 'high';
  return cachedTier ?? 'low';
}

export function qualityFor(tier: PerfTier = perfTier()): QualitySettings {
  if (tier === 'low') {
    return {
      pixelRatio: 1,
      antialias: false,
      matrixEnabled: false,
      matrixColumns: 1000,
      matrixBloom: false,
      matrixDoubleSide: false,
    };
  }
  return {
    pixelRatio: 2,
    antialias: true,
    matrixEnabled: true,
    matrixColumns: 3200,
    matrixBloom: true,
    matrixDoubleSide: true,
  };
}
