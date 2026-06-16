import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { awards } from '../data/portfolio';

const ITEMS = awards;
// Discipline spectrum — the same hues that thread through the rest of the site.
const HUES = ['var(--c-green)', 'var(--c-amber)', 'var(--c-red)', 'var(--c-violet)'];

export default function Marquee() {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    // The track holds two identical sequences; scroll one full width and loop.
    const tween = gsap.to(el, {
      xPercent: -50,
      duration: 24,
      ease: 'none',
      repeat: -1,
    });
    return () => {
      tween.kill();
    };
  }, []);

  const sequence = (
    <>
      {ITEMS.map((item, i) => (
        <span className="marquee__item" key={item}>
          {item}
          <span className="marquee__star" style={{ color: HUES[i % HUES.length] }}>
            ✦
          </span>
        </span>
      ))}
    </>
  );

  return (
    <div className="marquee" aria-hidden>
      <div className="marquee__track" ref={track}>
        {sequence}
        {sequence}
      </div>
    </div>
  );
}
