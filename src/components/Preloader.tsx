import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const counter = { v: 0 };
      const tl = gsap.timeline();

      tl.from('.preloader__word > span', {
        yPercent: 120,
        duration: 0.9,
        ease: 'power4.out',
        stagger: 0.08,
      })
        .to(
          counter,
          {
            v: 100,
            duration: 1.5,
            ease: 'power2.inOut',
            onUpdate: () => {
              if (count.current)
                count.current.textContent = String(Math.round(counter.v)).padStart(3, '0');
            },
          },
          0,
        )
        .to(bar.current, { width: '100%', duration: 1.5, ease: 'power2.inOut' }, 0)
        .to(
          '.preloader__inner',
          { yPercent: -24, opacity: 0, duration: 0.5, ease: 'power3.in' },
          '>-0.05',
        )
        // Hand the hero its cue the instant the curtain starts lifting, so its
        // reveal rises into place exactly as the curtain clears it — one motion,
        // not a second intro after the first has finished.
        .to(
          root.current,
          { yPercent: -100, duration: 0.85, ease: 'power4.inOut', onStart: () => onDone() },
          '<0.15',
        );
    }, root);

    return () => ctx.revert();
  }, [onDone]);

  return (
    <div className="preloader" ref={root}>
      <div className="preloader__inner">
        <div className="preloader__word" aria-label="Jairus Aragon">
          <span>Jairus</span> <span>Aragon</span>
        </div>
        <div className="preloader__count">
          <span ref={count}>000</span>
        </div>
      </div>
      <div className="preloader__bar" ref={bar} />
    </div>
  );
}
