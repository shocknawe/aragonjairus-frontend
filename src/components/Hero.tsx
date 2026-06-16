import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { createHeroScene } from '../three/heroScene';

export default function Hero({ start }: { start: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const root = useRef<HTMLElement>(null);
  const scene = useRef<ReturnType<typeof createHeroScene> | null>(null);

  // Three.js scene
  useEffect(() => {
    if (!canvas.current) return;
    try {
      scene.current = createHeroScene(canvas.current);
    } catch (err) {
      console.warn('Hero WebGL scene unavailable:', err);
    }
    return () => {
      scene.current?.dispose();
      scene.current = null;
    };
  }, []);

  // Intro reveal — fires once the preloader hands over
  useEffect(() => {
    if (!start) return;
    scene.current?.playIntro();
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.from('.hero__eyebrow', { y: 20, opacity: 0, duration: 0.8 })
        .from(
          '.hero__title .reveal-line > *',
          { yPercent: 110, duration: 1.1, stagger: 0.09 },
          '-=0.5',
        )
        .from(
          ['.hero__lead', '.hero__avail'],
          { y: 24, opacity: 0, duration: 0.9, stagger: 0.12 },
          '-=0.6',
        )
        .from('.hero__scroll', { opacity: 0, duration: 0.8 }, '-=0.4')
        .fromTo('.hero__canvas', { opacity: 0 }, { opacity: 1, duration: 1.4 }, 0.2);
    }, root);
    return () => ctx.revert();
  }, [start]);

  return (
    <header className="hero" id="top" ref={root}>
      <canvas className="hero__canvas" ref={canvas} aria-hidden />
      <div className="container hero__inner">
        <span className="eyebrow hero__eyebrow">Hello World — Frontend Developer</span>
        <h1 className="hero__title">
          <span className="reveal-line">
            <span>Pixel-perfect,</span>
          </span>
          <span className="reveal-line">
            <span>
              and <em>shipped</em>.
            </span>
          </span>
        </h1>
        <div className="hero__meta">
          <p className="hero__lead">
            I’m <strong>Jairus Aragon</strong>, an award-winning frontend developer
            with <strong className="hl-green">16 years</strong> on the web — 5 of them in a
            design studio. I build interfaces that look considered and hold up in production.
          </p>
          <span className="hero__avail">
            <span className="dot-pulse" />
            Based in Singapore — let’s talk
          </span>
        </div>
      </div>
      <a className="hero__scroll" href="#capabilities">
        <span>Scroll</span>
        <span className="hero__scroll-line" />
      </a>
    </header>
  );
}
