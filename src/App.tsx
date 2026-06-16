import { useCallback, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Cursor from './components/Cursor';
import Preloader from './components/Preloader';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import Capabilities from './components/Capabilities';
import Work from './components/Work';
import Contact from './components/Contact';
import Footer from './components/Footer';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [started, setStarted] = useState(false);
  const lenis = useRef<Lenis | null>(null);

  // Smooth scroll + scroll-triggered reveals
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const l = new Lenis({ duration: 1.1, smoothWheel: !reduce });
    lenis.current = l;
    l.stop(); // locked until the preloader hands over

    l.on('scroll', ScrollTrigger.update);
    const ticker = (time: number) => l.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>('[data-reveal]');
      if (reduce) {
        gsap.set(items, { opacity: 1, y: 0 });
        return;
      }
      gsap.set(items, { y: 30, opacity: 0 });
      ScrollTrigger.batch('[data-reveal]', {
        start: 'top 88%',
        onEnter: (els) =>
          gsap.to(els, {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.07,
            overwrite: true,
          }),
      });
    });

    // Re-measure once webfonts settle
    const refresh = () => ScrollTrigger.refresh();
    if (document.fonts?.ready) document.fonts.ready.then(refresh);
    window.addEventListener('load', refresh);

    return () => {
      window.removeEventListener('load', refresh);
      gsap.ticker.remove(ticker);
      ctx.revert();
      l.destroy();
      lenis.current = null;
    };
  }, []);

  const handleLoaded = useCallback(() => {
    setStarted(true);
    lenis.current?.start();
    ScrollTrigger.refresh();
  }, []);

  return (
    <>
      <Preloader onDone={handleLoaded} />
      <Cursor />
      <div className="grain" aria-hidden />
      <Navbar />
      <main>
        <Hero start={started} />
        <Marquee />
        <Capabilities />
        <Work />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
