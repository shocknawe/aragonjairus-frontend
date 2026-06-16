import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { awards } from '../data/portfolio';

const ITEMS = awards;

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
      {ITEMS.map((item) => (
        <span className="marquee__item" key={item}>
          {item}
          <span className="marquee__star">✦</span>
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
