import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { projects } from '../data/portfolio';

const GRADIENTS = [
  'linear-gradient(135deg,#b29bff,#54e6a0)',
  'linear-gradient(135deg,#ffb454,#ff6a5c)',
  'linear-gradient(135deg,#b29bff,#6a8bff)',
  'linear-gradient(135deg,#54e6a0,#3ad0ff)',
  'linear-gradient(135deg,#ff6a5c,#ffb454)',
];

export default function Work() {
  const preview = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const xTo = useRef<((v: number) => void) | null>(null);
  const yTo = useRef<((v: number) => void) | null>(null);

  const ensureQuick = () => {
    if (!preview.current) return;
    if (!xTo.current)
      xTo.current = gsap.quickTo(preview.current, 'x', { duration: 0.5, ease: 'power3' });
    if (!yTo.current)
      yTo.current = gsap.quickTo(preview.current, 'y', { duration: 0.5, ease: 'power3' });
  };

  const onMove = (e: React.MouseEvent) => {
    ensureQuick();
    xTo.current?.(e.clientX);
    yTo.current?.(e.clientY);
  };

  const onEnter = (i: number) => {
    if (!preview.current || !inner.current) return;
    inner.current.style.background = GRADIENTS[i % GRADIENTS.length];
    inner.current.textContent = projects[i].name;
    gsap.to(preview.current, {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      ease: 'power3.out',
    });
  };

  const onLeave = () => {
    if (!preview.current) return;
    gsap.to(preview.current, { opacity: 0, scale: 0.8, duration: 0.4, ease: 'power3.out' });
  };

  // Scrolling with a stationary cursor never fires mouseleave, so dismiss the
  // floating preview on scroll to stop it lingering over later sections.
  useEffect(() => {
    const hide = () => {
      if (preview.current && Number(gsap.getProperty(preview.current, 'opacity')) > 0) {
        gsap.to(preview.current, { opacity: 0, scale: 0.8, duration: 0.3 });
      }
    };
    window.addEventListener('scroll', hide, { passive: true });
    return () => window.removeEventListener('scroll', hide);
  }, []);

  return (
    <section className="section work" id="work" onMouseMove={onMove}>
      <div className="container">
        <div className="section__head">
          <h2 className="section__title" data-reveal>
            Selected <em>work</em>
          </h2>
          <span className="section-index" data-reveal>
            (02) 2017 — 2023
          </span>
        </div>

        <div className="work__list">
          {projects.map((p, i) => (
            <a
              className="work__row"
              key={p.num}
              href={p.url ?? '#contact'}
              target={p.url ? '_blank' : undefined}
              rel={p.url ? 'noreferrer' : undefined}
              data-reveal
              onMouseEnter={() => onEnter(i)}
              onMouseLeave={onLeave}
            >
              <span className="work__num">{p.num}</span>
              <span className="work__name">{p.name}</span>
              <span className="work__tags">{p.tags}</span>
              <span className="work__year">{p.year}</span>
              <span className="work__arrow" aria-hidden>
                ↗
              </span>
            </a>
          ))}
        </div>
      </div>

      <div className="work__preview" ref={preview} aria-hidden>
        <div className="work__preview-inner" ref={inner} />
      </div>
    </section>
  );
}
