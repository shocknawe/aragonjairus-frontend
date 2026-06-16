import { useEffect, useRef } from 'react';
import { createGlobeScene } from '../three/globeScene';

export default function Contact() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvas.current) return;
    try {
      return createGlobeScene(canvas.current);
    } catch (err) {
      console.warn('Globe WebGL scene unavailable:', err);
    }
  }, []);

  return (
    <section className="section contact" id="contact">
      <div className="container">
        <div className="section__head">
          <span className="eyebrow" data-reveal>
            Let’s talk
          </span>
          <span className="section-index" data-reveal>
            (03) Contact
          </span>
        </div>

        <div className="contact__grid">
          <div className="contact__globe">
            <canvas ref={canvas} aria-hidden />
          </div>

          <div>
            <h2 className="contact__title" data-reveal>
              Say <em>hi</em>
            </h2>
            <p className="contact__lead" data-reveal>
              Got a project, a role, or just want to talk shop? Connect on{' '}
              <a
                href="https://www.linkedin.com/in/aragonjairus/"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
              , browse the code on{' '}
              <a href="https://github.com" target="_blank" rel="noreferrer">
                GitHub
              </a>
              , or email me directly.
            </p>
            <a className="contact__cta" href="mailto:jairus.aragon@gmail.com" data-reveal>
              jairus.aragon@gmail.com
              <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
