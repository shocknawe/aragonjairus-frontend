import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip on touch / coarse pointers
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const dotEl = dot.current;
    const ringEl = ring.current;
    if (!dotEl || !ringEl) return;

    const xDot = gsap.quickTo(dotEl, 'x', { duration: 0.15, ease: 'power3' });
    const yDot = gsap.quickTo(dotEl, 'y', { duration: 0.15, ease: 'power3' });
    const xRing = gsap.quickTo(ringEl, 'x', { duration: 0.45, ease: 'power3' });
    const yRing = gsap.quickTo(ringEl, 'y', { duration: 0.45, ease: 'power3' });

    const move = (e: PointerEvent) => {
      xDot(e.clientX);
      yDot(e.clientY);
      xRing(e.clientX);
      yRing(e.clientY);
    };

    const over = (e: PointerEvent) => {
      const t = (e.target as HTMLElement)?.closest('a, button, [data-cursor]');
      ringEl.classList.toggle('is-hover', !!t);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerover', over);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerover', over);
    };
  }, []);

  return (
    <>
      <div ref={dot} className="cursor-dot" aria-hidden />
      <div ref={ring} className="cursor-ring" aria-hidden />
    </>
  );
}
