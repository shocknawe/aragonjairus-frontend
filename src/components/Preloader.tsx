import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const counter = { v: 0 };
      const tl = gsap.timeline({
        onComplete: () => onDone(),
      });

      tl.from('.preloader__word > span', {
        yPercent: 120,
        duration: 1,
        ease: 'power4.out',
        stagger: 0.08,
      })
        .to(
          counter,
          {
            v: 100,
            duration: 2,
            ease: 'power2.inOut',
            onUpdate: () => {
              if (count.current)
                count.current.textContent = String(Math.round(counter.v)).padStart(3, '0');
            },
          },
          0,
        )
        .to(bar.current, { width: '100%', duration: 2, ease: 'power2.inOut' }, 0)
        .to('.preloader__inner', { yPercent: -30, opacity: 0, duration: 0.6, ease: 'power3.in' })
        .to(root.current, {
          yPercent: -100,
          duration: 0.9,
          ease: 'power4.inOut',
        });
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
